import { useEffect, useMemo, useRef, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import {
  AULAS, QUESTOES, EVENTOS, PISTAS, MOVIMENTOS, CASOS, CENARIOS, DIMENSOES,
  type Q, type Aula, type Dim, type Efeito, type Mov,
} from "./data/content";
import { load, blank, persist, sync, eventosDe, enviarEventos, loadAuth, saveAuth, loginAluno, iniciarSessao, ping, terminarSessao, ranking, docente, fmtTempo, registar, totalPts, radar, streak, sb, type Save, type Linha, type Auth, type AlunoRow, type Evento } from "./lib/store";
import "./styles.css";

type Tela = "home" | "quiz" | "tempo" | "assoc" | "visual" | "sim" | "teste" | "perfil" | "rank";
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export default function App() {
  const [s, setS] = useState<Save>(load);
  const ref = useRef(s);
  const [auth, setAuth] = useState<Auth | null>(() => (sb ? loadAuth() : null));
  const [codigo, setCodigo] = useState<string | null>(null); // docente autenticado (só em memória)
  const [tela, setTela] = useState<Tela>("home");
  const lastAct = useRef(Date.now());

  const substituir = (n: Save) => { ref.current = n; setS(n); persist(n); };
  const upd = (fn: (x: Save) => Save) => {
    const p = ref.current, n = fn(p);
    substituir(n); sync(n); enviarEventos(eventosDe(p, n));
  };
  const sair = () => { terminarSessao(); saveAuth(null); setAuth(null); substituir(blank()); setTela("home"); };

  // sessão (tempo ativo): conta só com o separador visível e com interação nos últimos 2 min
  useEffect(() => {
    if (!sb || !auth) return;
    let vivo = true;
    iniciarSessao(auth).then((ok) => { if (vivo && !ok) sair(); });
    const act = () => { lastAct.current = Date.now(); };
    const ev = ["pointerdown", "keydown", "touchstart", "scroll"];
    ev.forEach((e) => window.addEventListener(e, act, { passive: true }));
    const iv = setInterval(() => { if (document.visibilityState === "visible" && Date.now() - lastAct.current < 120000) ping(30); }, 30000);
    return () => { vivo = false; clearInterval(iv); ev.forEach((e) => window.removeEventListener(e, act)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  if (sb && codigo) return <DocenteApp code={codigo} sair={() => setCodigo(null)} />;
  if (sb && !auth) return <Entrada onDocente={setCodigo} onAluno={(a, save) => {
    saveAuth(a); setAuth(a);
    substituir({ ...blank(), ...(save || {}), nick: a.nick });
  }} />;
  if (!sb && !s.nick) return <EntradaLocal onOk={(nick) => upd((x) => ({ ...x, nick }))} />;
  const back = () => setTela("home");
  return (
    <div className="app">
      <header>
        <button className="logo" onClick={back}><span className="c" /><span className="q" /><span className="t" /> THD</button>
        <div className="hud"><b>{s.nick}</b> · {totalPts(s)} pts · 🔥 {streak(s.days)}{sb && <button className="link" style={{ marginLeft: 8, padding: 0 }} onClick={sair}>Sair</button>}</div>
      </header>
      <main>
        {tela === "home" && <Home s={s} go={setTela} />}
        {tela === "quiz" && <Quiz s={s} upd={upd} back={back} />}
        {tela === "tempo" && <Tempo upd={upd} back={back} />}
        {tela === "assoc" && <Assoc upd={upd} back={back} />}
        {tela === "visual" && <Visual upd={upd} back={back} />}
        {tela === "sim" && <Sim upd={upd} back={back} />}
        {tela === "teste" && <Teste upd={upd} back={back} />}
        {tela === "perfil" && <Perfil s={s} back={back} />}
        {tela === "rank" && <Rank s={s} back={back} />}
      </main>
    </div>
  );
}

const ERROS: Record<string, string> = {
  nao_inscrito: "Esse número não está na lista da turma. Fala com o docente.",
  pin: "PIN errado.", pin_invalido: "O PIN deve ter 4 a 8 algarismos.",
  bloqueado: "Demasiadas tentativas. Espera 10 minutos.", codigo: "Código inválido ou bloqueado temporariamente (espera 10 minutos).",
  rede: "Sem ligação à base de dados. Tenta de novo.", sem_base: "Base de dados não configurada.",
};

function Entrada({ onAluno, onDocente }: { onAluno: (a: Auth, save: Save | null) => void; onDocente: (code: string) => void }) {
  const [papel, setPapel] = useState<"aluno" | "docente">("aluno");
  const [num, setNum] = useState(""); const [pin, setPin] = useState(""); const [nick, setNick] = useState("");
  const [code, setCode] = useState("");
  const [primeiro, setPrimeiro] = useState(false);
  const [msg, setMsg] = useState(""); const [carga, setCarga] = useState(false);

  const entrarAluno = async () => {
    setCarga(true); setMsg("");
    const r = await loginAluno(num.trim(), pin, primeiro ? nick.trim() : undefined);
    setCarga(false);
    if (r.ok && r.token) return onAluno({ token: r.token, numero: num.trim(), nick: r.nick || nick.trim() }, (r.save as Save | null) || null);
    if (r.erro === "primeiro_acesso") { setPrimeiro(true); setMsg("Primeiro acesso: escolhe uma alcunha (não uses o teu nome) e um PIN de 4 a 8 algarismos."); return; }
    setMsg(ERROS[r.erro || ""] || "Não foi possível entrar.");
  };
  const entrarDocente = async () => {
    setCarga(true); setMsg("");
    const r = await docente.alunos(code);
    setCarga(false);
    if (r.ok) onDocente(code); else setMsg(ERROS[r.erro || ""] || "Não foi possível entrar.");
  };
  return (
    <div className="entrada">
      <div className="formas"><span className="c" /><span className="q" /><span className="t" /></div>
      <h1>Teoria e História do Design</h1>
      <div className="chips" style={{ justifyContent: "center" }}>
        <Chip a={papel === "aluno"} f={() => { setPapel("aluno"); setMsg(""); }}>Sou aluno</Chip>
        <Chip a={papel === "docente"} f={() => { setPapel("docente"); setMsg(""); }}>Sou docente</Chip>
      </div>
      {papel === "aluno" ? (
        <>
          <input value={num} maxLength={30} inputMode="numeric" placeholder="Número de aluno" onChange={(e) => { setNum(e.target.value); setPrimeiro(false); }} />
          <input type="password" value={pin} maxLength={8} inputMode="numeric" placeholder={primeiro ? "Cria um PIN (4 a 8 algarismos)" : "PIN"} onChange={(e) => setPin(e.target.value)} style={{ marginTop: 8 }} />
          {primeiro && <input value={nick} maxLength={20} placeholder="Alcunha para o ranking (sem nome real)" onChange={(e) => setNick(e.target.value)} style={{ marginTop: 8 }} />}
          <button className="btn" disabled={carga || !num.trim() || pin.length < 4 || (primeiro && nick.trim().length < 2)} onClick={entrarAluno}>{primeiro ? "Criar acesso" : "Entrar"}</button>
          <small style={{ display: "block", textAlign: "left" }}>Para acompanhar a tua aprendizagem, o docente vê o teu número de aluno, o tempo de utilização e as tuas respostas. Os outros colegas só veem a tua alcunha no ranking. Se esqueceres o PIN, pede ao docente para o repor.</small>
        </>
      ) : (
        <>
          <input type="password" value={code} placeholder="Código do docente" onChange={(e) => setCode(e.target.value)} />
          <button className="btn" disabled={carga || !code} onClick={entrarDocente}>Entrar</button>
        </>
      )}
      {msg && <p className="dica" role="alert">{msg}</p>}
    </div>
  );
}

function EntradaLocal({ onOk }: { onOk: (n: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="entrada">
      <div className="formas"><span className="c" /><span className="q" /><span className="t" /></div>
      <h1>Teoria e História do Design</h1>
      <p>Treina as aulas 1 a 7 e prepara o teste.</p>
      <input value={v} maxLength={20} placeholder="A tua alcunha (sem nome real)" onChange={(e) => setV(e.target.value)} />
      <button className="btn" disabled={v.trim().length < 2} onClick={() => onOk(v.trim())}>Entrar</button>
      <small>Modo local: os resultados guardam-se só neste dispositivo.</small>
    </div>
  );
}

function Home({ s, go }: { s: Save; go: (t: Tela) => void }) {
  const modos: [Tela, string, string, string][] = [
    ["quiz", "Quiz relâmpago", "Perguntas por aula e dificuldade", "#d62828"],
    ["tempo", "Linha do tempo", "Ordena movimentos e marcos", "#f7b500"],
    ["assoc", "Quem sou eu?", "Liga figuras e ideias ao movimento", "#1d4e89"],
    ["visual", "Olhar de designer", "Identifica o estilo e justifica", "#d62828"],
    ["sim", "Fábrica 1907", "Simulação de decisões de design", "#f7b500"],
    ["teste", "Modo Teste", "Simulado cronometrado, nota 0–20", "#111"],
  ];
  const ctx = useMemo(() => {
    const fracas = Object.entries(s.aulas).filter(([, v]) => v.n >= 3).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)[0];
    return fracas ? `Ponto fraco: Aula ${fracas[0]} (${Math.round((fracas[1].ok / fracas[1].n) * 100)}%). Revê «${AULAS[Number(fracas[0]) as Aula]}».` : "Joga um modo para descobrirmos os teus pontos fracos.";
  }, [s]);
  return (
    <>
      <p className="dica">{ctx}</p>
      <div className="grid">
        {modos.map(([t, n, d, c]) => (
          <button key={t} className="card" style={{ borderTopColor: c }} onClick={() => go(t)}><h3>{n}</h3><p>{d}</p></button>
        ))}
      </div>
      <div className="row">
        <button className="btn ghost" onClick={() => go("perfil")}>O meu perfil</button>
        <button className="btn ghost" onClick={() => go("rank")}>Ranking</button>
      </div>
    </>
  );
}

const Voltar = ({ back }: { back: () => void }) => <button className="link" onClick={back}>← Menu</button>;

// ---------- QUIZ ----------
function Quiz({ s, upd, back }: { s: Save; upd: (f: (x: Save) => Save) => void; back: () => void }) {
  const [aula, setAula] = useState<0 | Aula>(0);
  const [nivel, setNivel] = useState<0 | 1 | 2 | 3>(0);
  const [on, setOn] = useState(false);
  if (!on)
    return (
      <div>
        <Voltar back={back} /><h2>Quiz relâmpago</h2>
        <label>Aula</label>
        <div className="chips">
          <Chip a={aula === 0} f={() => setAula(0)}>Todas</Chip>
          {(Object.keys(AULAS) as unknown as Aula[]).map((k) => <Chip key={k} a={aula === Number(k)} f={() => setAula(Number(k) as Aula)}>{k}</Chip>)}
        </div>
        {aula !== 0 && <p className="dica">{AULAS[aula]}</p>}
        <label>Dificuldade</label>
        <div className="chips">{[0, 1, 2, 3].map((n) => <Chip key={n} a={nivel === n} f={() => setNivel(n as 0 | 1 | 2 | 3)}>{n === 0 ? "Mista" : ["", "Fácil", "Média", "Difícil"][n]}</Chip>)}</div>
        <button className="btn" onClick={() => setOn(true)}>Começar</button>
      </div>
    );
  const pool = QUESTOES.filter((q) => (aula === 0 || q.aula === aula) && (nivel === 0 || q.nivel === nivel));
  // dá prioridade a perguntas que o aluno falha
  const ordenado = [...pool].sort((a, b) => (s.q[b.id] ? 1 - s.q[b.id].ok / s.q[b.id].n : 0.5) - (s.q[a.id] ? 1 - s.q[a.id].ok / s.q[a.id].n : 0.5) + (Math.random() - 0.5));
  return <Perguntas titulo="Quiz" qs={ordenado.slice(0, 10)} upd={upd} back={back} />;
}
const Chip = ({ a, f, children }: { a: boolean; f: () => void; children: React.ReactNode }) => <button className={"chip" + (a ? " on" : "")} onClick={f}>{children}</button>;

function Perguntas({ titulo, qs, upd, back, tempoTotal, onFim }: { titulo: string; qs: Q[]; upd: (f: (x: Save) => Save) => void; back: () => void; tempoTotal?: number; onFim?: (ok: number, n: number) => void }) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [ok, setOk] = useState(0);
  const [fim, setFim] = useState(false);
  const [t0, setT0] = useState(Date.now());
  const [resta, setResta] = useState(tempoTotal || 0);
  const modoTeste = !!tempoTotal;
  const ref = useRef({ ok, i });
  ref.current = { ok, i };
  useEffect(() => {
    if (!tempoTotal || fim) return;
    const id = setInterval(() => setResta((r) => { if (r <= 1) { clearInterval(id); terminar(); return 0; } return r - 1; }), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [fim]);
  const terminar = () => { setFim(true); onFim?.(ref.current.ok, qs.length); };
  if (!qs.length) return <div><Voltar back={back} /><p>Sem perguntas para este filtro.</p></div>;
  if (fim)
    return (
      <div className="fim"><h2>{titulo}: terminado</h2><p className="big">{ok} / {qs.length}</p>
        {modoTeste && <p className="big">Nota estimada: {Math.round((ok / qs.length) * 20 * 10) / 10} / 20</p>}
        <button className="btn" onClick={back}>Menu</button></div>
    );
  const q = qs[i];
  const resp = (k: number) => {
    if (sel !== null) return;
    const certo = k === q.c;
    setSel(k);
    const seg = (Date.now() - t0) / 1000;
    const bonus = certo ? Math.max(0, Math.round(5 - seg / 4)) : 0;
    if (certo) setOk((x) => x + 1);
    upd((x) => registar(x, "Conhecimento", certo ? q.nivel * 10 + bonus : 0, certo ? 1 : 0, 1, q.aula, q.id));
  };
  const seguinte = () => { if (i + 1 >= qs.length) terminar(); else { setI(i + 1); setSel(null); setT0(Date.now()); } };
  return (
    <div>
      <div className="topo"><Voltar back={back} /><span>{i + 1}/{qs.length}</span>{modoTeste && <span className="tempo">⏱ {Math.floor(resta / 60)}:{String(resta % 60).padStart(2, "0")}</span>}</div>
      <p className="meta">Aula {q.aula} · {["", "Fácil", "Média", "Difícil"][q.nivel]}</p>
      <h2>{q.p}</h2>
      <div className="ops">
        {q.o.map((o, k) => (
          <button key={k} disabled={sel !== null} className={"op" + (sel !== null ? (k === q.c ? " certa" : k === sel ? " errada" : "") : "")} onClick={() => resp(k)}>{o}</button>
        ))}
      </div>
      {sel !== null && (<div className="fb"><b>{sel === q.c ? "Certo!" : "Não é bem assim."}</b> {q.e}<button className="btn" onClick={seguinte}>{i + 1 >= qs.length ? "Terminar" : "Seguinte"}</button></div>)}
    </div>
  );
}

// ---------- TESTE ----------
function Teste({ upd, back }: { upd: (f: (x: Save) => Save) => void; back: () => void }) {
  const [on, setOn] = useState(false);
  const qs = useMemo(() => shuffle(QUESTOES).slice(0, 20), []);
  if (!on)
    return (
      <div><Voltar back={back} /><h2>Modo Teste</h2>
        <p>20 perguntas de todas as aulas, 15 minutos, sem explicações durante a prova. A nota é estimada de 0 a 20.</p>
        <button className="btn" onClick={() => setOn(true)}>Iniciar simulado</button></div>
    );
  return <Perguntas titulo="Teste" qs={qs} upd={upd} back={back} tempoTotal={15 * 60} onFim={(ok, n) => upd((x) => ({ ...x, tests: [...x.tests, { quando: new Date().toISOString(), nota: Math.round((ok / n) * 200) / 10, total: 20 }] }))} />;
}

// ---------- LINHA DO TEMPO ----------
function Tempo({ upd, back }: { upd: (f: (x: Save) => Save) => void; back: () => void }) {
  const [lista, setLista] = useState(() => shuffle(EVENTOS).slice(0, 7));
  const [res, setRes] = useState<number | null>(null);
  const mover = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= lista.length) return; const n = [...lista]; [n[i], n[j]] = [n[j], n[i]]; setLista(n); };
  const corrigir = () => {
    const certa = [...lista].sort((a, b) => a.ano - b.ano);
    const ok = lista.filter((e, i) => e.id === certa[i].id).length;
    setRes(ok);
    upd((x) => registar(x, "Cronologia", ok * 10, ok, lista.length));
  };
  const certa = [...lista].sort((a, b) => a.ano - b.ano);
  return (
    <div><Voltar back={back} /><h2>Linha do tempo</h2>
      <p>Ordena do mais antigo para o mais recente.</p>
      <ol className="lista">
        {lista.map((e, i) => (
          <li key={e.id} className={res !== null ? (certa[i].id === e.id ? "certa" : "errada") : ""}>
            <span>{e.t}{res !== null && <em> · ~{Math.floor(e.ano)}</em>}</span>
            {res === null && <span><button onClick={() => mover(i, -1)}>▲</button><button onClick={() => mover(i, 1)}>▼</button></span>}
          </li>
        ))}
      </ol>
      {res === null ? <button className="btn" onClick={corrigir}>Verificar</button> : <div className="fb"><b>{res}/{lista.length} na posição certa.</b><button className="btn" onClick={() => { setLista(shuffle(EVENTOS).slice(0, 7)); setRes(null); }}>Outra ronda</button></div>}
    </div>
  );
}

// ---------- QUEM SOU EU ----------
function Assoc({ upd, back }: { upd: (f: (x: Save) => Save) => void; back: () => void }) {
  const [itens, setItens] = useState(() => shuffle(PISTAS).slice(0, 8));
  const [resp, setResp] = useState<Record<string, Mov>>({});
  const [feito, setFeito] = useState(false);
  const corrigir = () => {
    const ok = itens.filter((p) => resp[p.id] === p.m).length;
    setFeito(true);
    upd((x) => registar(x, "Associação", ok * 10, ok, itens.length));
  };
  return (
    <div><Voltar back={back} /><h2>Quem sou eu?</h2>
      <p>Escolhe o movimento de cada figura ou ideia.</p>
      {itens.map((p) => (
        <div key={p.id} className={"linha " + (feito ? (resp[p.id] === p.m ? "certa" : "errada") : "")}>
          <b>{p.t}</b>
          <select disabled={feito} value={resp[p.id] || ""} onChange={(e) => setResp({ ...resp, [p.id]: e.target.value as Mov })}>
            <option value="">—</option>{MOVIMENTOS.map((m) => <option key={m}>{m}</option>)}
          </select>
          {feito && resp[p.id] !== p.m && <em> → {p.m}</em>}
        </div>
      ))}
      {!feito ? <button className="btn" onClick={corrigir}>Verificar</button> : <button className="btn" onClick={() => { setItens(shuffle(PISTAS).slice(0, 8)); setResp({}); setFeito(false); }}>Outra ronda</button>}
    </div>
  );
}

// ---------- OLHAR DE DESIGNER ----------
function Visual({ upd, back }: { upd: (f: (x: Save) => Save) => void; back: () => void }) {
  const [i, setI] = useState(0);
  const casos = useMemo(() => shuffle(CASOS), []);
  const c = casos[i % casos.length];
  const [m, setM] = useState<Mov | null>(null);
  const [marc, setMarc] = useState<string[]>([]);
  const [feito, setFeito] = useState(false);
  const todas = useMemo(() => shuffle([...c.pistas, "ornamento floral exuberante", "produção totalmente artesanal", "arco gótico", "lembra a natureza"].filter((x, k, a) => a.indexOf(x) === k)).slice(0, 6), [c]);
  const corrigir = () => {
    const okM = m === c.m ? 1 : 0;
    const okP = marc.filter((x) => c.pistas.includes(x)).length - marc.filter((x) => !c.pistas.includes(x)).length;
    const pts = okM * 10 + Math.max(0, okP) * 5;
    setFeito(true);
    upd((x) => registar(x, "Análise visual", pts, okM, 1, c.aula));
  };
  return (
    <div><Voltar back={back} /><h2>Olhar de designer</h2>
      <blockquote>{c.desc}</blockquote>
      <label>A que estilo pertence?</label>
      <div className="chips">{MOVIMENTOS.map((x) => <Chip key={x} a={m === x} f={() => !feito && setM(x)}>{x}</Chip>)}</div>
      <label>Que características o justificam? (escolhe as que se aplicam)</label>
      <div className="chips">{todas.map((p) => <Chip key={p} a={marc.includes(p)} f={() => !feito && setMarc(marc.includes(p) ? marc.filter((z) => z !== p) : [...marc, p])}>{p}</Chip>)}</div>
      {!feito ? <button className="btn" disabled={!m} onClick={corrigir}>Verificar</button> :
        <div className="fb"><b>{m === c.m ? "Estilo certo!" : `Era ${c.m}.`}</b> Características: {c.pistas.join(", ")}.
          <button className="btn" onClick={() => { setI(i + 1); setM(null); setMarc([]); setFeito(false); }}>Próximo caso</button></div>}
    </div>
  );
}

// ---------- SIMULAÇÃO ----------
const IND: [keyof Efeito, string][] = [["custo", "Custo/eficiência"], ["qualidade", "Qualidade"], ["identidade", "Identidade"], ["social", "Impacto social"]];
function Sim({ upd, back }: { upd: (f: (x: Save) => Save) => void; back: () => void }) {
  const cen = useMemo(() => shuffle(CENARIOS).slice(0, 4), []);
  const [i, setI] = useState(0);
  const [ind, setInd] = useState<Efeito>({ custo: 5, qualidade: 5, identidade: 5, social: 5 });
  const [fb, setFb] = useState("");
  const [fim, setFim] = useState(false);
  const escolher = (ef: Efeito, t: string) => {
    setInd((p) => ({ custo: p.custo + ef.custo, qualidade: p.qualidade + ef.qualidade, identidade: p.identidade + ef.identidade, social: p.social + ef.social }));
    setFb(t);
  };
  const seguinte = () => {
    if (i + 1 < cen.length) { setI(i + 1); setFb(""); return; }
    const v = Object.values(ind);
    const media = v.reduce((a, b) => a + b, 0) / 4;
    const desvio = Math.sqrt(v.reduce((a, b) => a + (b - media) ** 2, 0) / 4);
    const pts = Math.max(0, Math.round(media * 6 - desvio * 8));
    upd((x) => registar(x, "Pensamento crítico", pts, desvio < 3 ? 1 : 0, 1));
    setFim(true);
  };
  const barra = (n: number) => <div className="barra"><i style={{ width: `${Math.max(0, Math.min(100, n * 8))}%` }} /></div>;
  const painel = <div className="ind">{IND.map(([k, n]) => <div key={k}><small>{n}</small>{barra(ind[k])}</div>)}</div>;
  if (fim) {
    const v = IND.map(([k, n]) => [n, ind[k]] as const);
    const forte = [...v].sort((a, b) => b[1] - a[1])[0][0], fraco = [...v].sort((a, b) => a[1] - b[1])[0][0];
    return (<div className="fim"><h2>Relatório da Fábrica 1907</h2>{painel}
      <p>Ponto forte: <b>{forte}</b>. Ponto fraco: <b>{fraco}</b>. O design moderno procura equilíbrio entre os quatro indicadores, como tentou o Werkbund.</p>
      <button className="btn" onClick={back}>Menu</button></div>);
  }
  const c = cen[i];
  return (
    <div><Voltar back={back} /><h2>Fábrica 1907</h2>{painel}
      <p className="meta">Decisão {i + 1}/{cen.length} · Aula {c.aula}</p>
      <h3>{c.titulo}</h3><p>{c.texto}</p>
      <div className="ops">{c.opcoes.map((o, k) => <button key={k} className="op" disabled={!!fb} onClick={() => escolher(o.ef, o.fb)}>{o.t}</button>)}</div>
      {fb && <div className="fb">{fb}<button className="btn" onClick={seguinte}>{i + 1 < cen.length ? "Seguinte" : "Ver relatório"}</button></div>}
    </div>
  );
}

// ---------- PERFIL ----------
function Perfil({ s, back }: { s: Save; back: () => void }) {
  const dados = radar(s);
  const aulas = (Object.keys(AULAS) as unknown as Aula[]).map((k) => { const a = s.aulas[k]; return { k, pct: a && a.n ? Math.round((a.ok / a.n) * 100) : null, n: a?.n || 0 }; });
  return (
    <div><Voltar back={back} /><h2>O meu perfil</h2>
      <div style={{ height: 300 }}><ResponsiveContainer><RadarChart data={dados}><PolarGrid /><PolarAngleAxis dataKey="dim" /><PolarRadiusAxis domain={[0, 100]} tick={false} /><Radar dataKey="valor" stroke="#d62828" fill="#d62828" fillOpacity={0.45} /></RadarChart></ResponsiveContainer></div>
      <h3>Mapa por aula</h3>
      {aulas.map((a) => (
        <div key={a.k} className="mapa"><span>Aula {a.k}: {AULAS[a.k]}</span>
          <div className="barra"><i style={{ width: `${a.pct ?? 0}%`, background: a.pct === null ? "#ccc" : a.pct < 60 ? "#d62828" : a.pct < 80 ? "#f7b500" : "#1d4e89" }} /></div>
          <small>{a.pct === null ? "por jogar" : `${a.pct}% (${a.n} resp.)`}</small></div>
      ))}
      <h3>Simulados</h3>
      <p>{s.tests.length ? s.tests.map((t) => `${t.nota}/${t.total}`).join(" · ") : "Ainda sem simulados."}</p>
    </div>
  );
}

// ---------- RANKING ----------
function Rank({ s, back }: { s: Save; back: () => void }) {
  const [dim, setDim] = useState<"Total" | Dim>("Total");
  const [rows, setRows] = useState<Linha[] | null | undefined>(undefined);
  useEffect(() => { ranking().then(setRows); }, []);
  const mine: Linha = { nick: s.nick, dims: Object.fromEntries(Object.entries(s.dims).map(([k, v]) => [k, v.pts])), total: totalPts(s) };
  const lista = (rows ?? [mine]).map((r) => ({ nick: r.nick, v: dim === "Total" ? r.total : r.dims?.[dim] || 0 })).sort((a, b) => b.v - a.v).slice(0, 20);
  return (
    <div><Voltar back={back} /><h2>Ranking da turma</h2>
      {rows === null && <p className="dica">Ranking online indisponível. A mostrar só os teus pontos.</p>}
      <div className="chips"><Chip a={dim === "Total"} f={() => setDim("Total")}>Total</Chip>{DIMENSOES.map((d) => <Chip key={d} a={dim === d} f={() => setDim(d)}>{d}</Chip>)}</div>
      <ol className="rank">{lista.map((r, i) => <li key={r.nick + i} className={r.nick === s.nick ? "eu" : ""}><span>{i + 1}.º {r.nick}</span><b>{r.v}</b></li>)}</ol>
    </div>
  );
}

// ---------- DOCENTE ----------
const baixar = (nome: string, linhas: (string | number | null)[][]) => {
  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + linhas.map((l) => l.map(esc).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = nome; a.click(); URL.revokeObjectURL(a.href);
};
const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "—");

function DocenteApp({ code, sair }: { code: string; sair: () => void }) {
  const [tab, setTab] = useState<"alunos" | "importar" | "perguntas">("alunos");
  const [alunos, setAlunos] = useState<AlunoRow[] | null>(null);
  const [perg, setPerg] = useState<{ qid: string; ok: number; n: number }[]>([]);
  const [sel, setSel] = useState<AlunoRow | null>(null);
  const [evs, setEvs] = useState<Evento[]>([]);
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState("");

  const recarregar = async () => {
    const r = await docente.alunos(code);
    if (r.ok) setAlunos(r.data || []); else setMsg(ERROS[r.erro || ""] || "Erro ao carregar.");
  };
  useEffect(() => { recarregar(); docente.perguntas(code).then((r) => r.ok && setPerg(r.data || [])); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { if (sel) docente.eventos(code, sel.numero).then((r) => setEvs(r.ok ? r.data || [] : [])); else setEvs([]); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sel?.numero]);

  const importar = async () => {
    const r = await docente.importar(code, texto);
    if (r.ok) { setMsg(`${r.importados} aluno(s) importado(s).`); setTexto(""); recarregar(); setTab("alunos"); } else setMsg("Erro ao importar.");
  };
  const exportarAlunos = () => baixar("thd_alunos.csv", [
    ["Número", "Nome", "Turma", "Alcunha", "Ativou acesso", "Último acesso", "Sessões", "Tempo ativo (min)", "Pontos", "Ações", "Testes (nota/20)"],
    ...(alunos || []).map((a) => [a.numero, a.nome, a.turma, a.nick, a.ativo ? "sim" : "não", a.last_seen, a.sessoes, Math.round(a.segundos / 60), a.pts, a.acoes, a.testes.map((t) => t.nota).join(" | ")]),
  ]);
  const exportarEventos = async () => {
    const r = await docente.eventos(code, null);
    if (!r.ok) return setMsg("Erro ao exportar.");
    baixar("thd_acoes.csv", [["Número", "Data/hora", "Tipo", "Aula", "Pergunta", "Certas", "Total", "Pontos", "Sessão"], ...(r.data || []).map((e) => [e.numero, e.ts, e.tipo, e.aula, e.qid, e.ok, e.n, e.pts, e.sessao])]);
  };
  const reset = async (a: AlunoRow) => { if (window.confirm(`Repor o PIN do aluno ${a.numero}? Terá de criar um novo no próximo acesso.`)) { await docente.resetPin(code, a.numero); recarregar(); } };
  const apagar = async (a: AlunoRow) => { if (window.confirm(`Apagar TODOS os dados do aluno ${a.numero} (acesso, progresso e ações)? Não é possível desfazer.`)) { await docente.apagar(code, a.numero); setSel(null); recarregar(); } };

  const ordenado = perg.filter((x) => x.n >= 3).map((x) => ({ ...x, pct: Math.round((x.ok / x.n) * 100), q: QUESTOES.find((q) => q.id === x.qid) })).sort((a, b) => a.pct - b.pct);
  const total = alunos?.length || 0, ativos = (alunos || []).filter((a) => a.ativo).length;

  return (
    <div className="app">
      <header><div className="logo"><span className="c" /><span className="q" /><span className="t" /> THD · Docente</div><div className="hud"><button className="link" onClick={sair}>Sair</button></div></header>
      <main>
        <div className="chips">
          <Chip a={tab === "alunos"} f={() => { setTab("alunos"); setSel(null); }}>Alunos</Chip>
          <Chip a={tab === "importar"} f={() => setTab("importar")}>Importar lista</Chip>
          <Chip a={tab === "perguntas"} f={() => setTab("perguntas")}>Perguntas difíceis</Chip>
        </div>
        {msg && <p className="dica" role="status">{msg}</p>}

        {tab === "importar" && <div><h2>Importar lista da turma</h2>
          <p>Uma linha por aluno: <code>número;nome;turma</code> (nome e turma são opcionais; podes colar da folha de cálculo). O nome só é visível para ti. Para minimizar dados, podes importar só os números.</p>
          <textarea rows={10} style={{ width: "100%", padding: 8, border: "2px solid var(--k)" }} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={"20240001;;TM1\n20240002;;TM1"} />
          <button className="btn" disabled={!texto.trim()} onClick={importar}>Importar</button></div>}

        {tab === "perguntas" && <div><h2>Perguntas com mais erros</h2>
          {ordenado.length === 0 && <p className="dica">Ainda sem dados suficientes (mínimo 3 respostas por pergunta).</p>}
          {ordenado.slice(0, 20).map((x) => <div key={x.qid} className="mapa"><span>Aula {x.q?.aula}: {x.q?.p}</span><div className="barra"><i style={{ width: `${x.pct}%` }} /></div><small>{x.pct}% certas ({x.n})</small></div>)}</div>}

        {tab === "alunos" && !sel && <div><h2>Alunos</h2>
          <p className="dica">{total} na lista · {ativos} já ativaram o acesso. O tempo conta só com o ecrã visível e com interação recente.</p>
          <button className="btn small" onClick={recarregar}>Atualizar</button>
          <button className="btn small ghost" onClick={exportarAlunos}>Exportar alunos (CSV)</button>
          <button className="btn small ghost" onClick={exportarEventos}>Exportar ações (CSV)</button>
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table className="tab"><thead><tr><th>N.º</th><th>Nome</th><th>Alcunha</th><th>Último acesso</th><th>Sessões</th><th>Tempo</th><th>Pontos</th><th>Ações</th></tr></thead>
              <tbody>{(alunos || []).map((a) => <tr key={a.numero} onClick={() => setSel(a)} style={{ cursor: "pointer", opacity: a.ativo ? 1 : 0.55 }}>
                <td>{a.numero}</td><td>{a.nome || "—"}</td><td>{a.nick || "—"}</td><td>{dt(a.last_seen)}</td><td>{a.sessoes}</td><td>{fmtTempo(a.segundos)}</td><td>{a.pts}</td><td>{a.acoes}</td></tr>)}</tbody></table>
          </div></div>}

        {tab === "alunos" && sel && <div>
          <button className="link" onClick={() => setSel(null)}>← Alunos</button>
          <h2>{sel.numero}{sel.nome ? ` · ${sel.nome}` : ""}</h2>
          <p>Alcunha: <b>{sel.nick || "—"}</b> · Último acesso: {dt(sel.last_seen)} · {sel.sessoes} sessões · tempo ativo {fmtTempo(sel.segundos)} · {sel.pts} pts</p>
          <h3>Acertos por aula</h3>
          {(Object.keys(AULAS) as unknown as Aula[]).map((k) => { const p = sel.aulas?.[k]; return <div key={k} className="mapa"><span>Aula {k}: {AULAS[k]}</span><div className="barra"><i style={{ width: `${p ?? 0}%` }} /></div><small>{p === undefined ? "por jogar" : `${p}%`}</small></div>; })}
          <h3>Simulados</h3><p>{sel.testes.length ? sel.testes.map((t) => `${t.nota}/20 (${dt(t.quando)})`).join(" · ") : "Sem simulados."}</p>
          <h3>Últimas ações</h3>
          <div style={{ overflowX: "auto" }}><table className="tab"><thead><tr><th>Data/hora</th><th>Atividade</th><th>Aula</th><th>Certas</th><th>Pontos</th></tr></thead>
            <tbody>{evs.slice(0, 100).map((e, i) => <tr key={i}><td>{dt(e.ts)}</td><td>{e.tipo}</td><td>{e.aula ?? "—"}</td><td>{e.ok}/{e.n}</td><td>{e.pts}</td></tr>)}</tbody></table></div>
          <button className="btn small ghost" onClick={() => reset(sel)}>Repor PIN</button>
          <button className="btn small ghost" onClick={() => apagar(sel)}>Apagar dados do aluno</button>
        </div>}
      </main>
    </div>
  );
}
