import { useEffect, useMemo, useRef, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import {
  AULAS, QUESTOES, EVENTOS, PISTAS, MOVIMENTOS, CASOS, CENARIOS, DIMENSOES,
  type Q, type Aula, type Dim, type Efeito, type Mov,
} from "./data/content";
import { load, persist, registar, sync, logAnswer, ranking, teacherStats, totalPts, radar, streak, sb, type Save, type Linha } from "./lib/store";
import "./styles.css";

type Tela = "home" | "quiz" | "tempo" | "assoc" | "visual" | "sim" | "teste" | "perfil" | "rank" | "docente";
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export default function App() {
  const [s, setS] = useState<Save>(load);
  const [tela, setTela] = useState<Tela>("home");
  const upd = (fn: (x: Save) => Save) => setS((p) => { const n = fn(p); persist(n); sync(n); return n; });
  useEffect(() => { persist(s); }, [s]);

  if (!s.nick) return <Entrada onOk={(nick) => upd((x) => ({ ...x, nick }))} />;
  const back = () => setTela("home");
  return (
    <div className="app">
      <header>
        <button className="logo" onClick={back}><span className="c" /><span className="q" /><span className="t" /> THD</button>
        <div className="hud"><b>{s.nick}</b> · {totalPts(s)} pts · 🔥 {streak(s.days)}</div>
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
        {tela === "docente" && <Docente back={back} />}
      </main>
    </div>
  );
}

function Entrada({ onOk }: { onOk: (n: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="entrada">
      <div className="formas"><span className="c" /><span className="q" /><span className="t" /></div>
      <h1>Teoria e História do Design</h1>
      <p>Treina as aulas 1 a 7, sobe no ranking e prepara o teste.</p>
      <input value={v} maxLength={20} placeholder="A tua alcunha (sem nome real)" onChange={(e) => setV(e.target.value)} />
      <button className="btn" disabled={v.trim().length < 2} onClick={() => onOk(v.trim())}>Entrar</button>
      <small>Os resultados guardam-se neste dispositivo{sb ? " e entram no ranking da turma." : "."}</small>
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
        <button className="btn ghost small" onClick={() => go("docente")}>Docente</button>
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
    logAnswer(q.id, certo);
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
function Docente({ back }: { back: () => void }) {
  const [code, setCode] = useState("");
  const [d, setD] = useState<{ qid: string; ok: number; n: number }[] | null | undefined>(undefined);
  const ver = async () => setD(await teacherStats(code));
  const ordenado = (d || []).filter((x) => x.n >= 3).map((x) => ({ ...x, pct: Math.round((x.ok / x.n) * 100), q: QUESTOES.find((q) => q.id === x.qid) })).sort((a, b) => a.pct - b.pct);
  return (
    <div><Voltar back={back} /><h2>Painel do docente</h2>
      <input type="password" placeholder="Código do docente" value={code} onChange={(e) => setCode(e.target.value)} />
      <button className="btn" onClick={ver}>Ver</button>
      {d === null && <p className="dica">Código inválido ou base de dados não ligada.</p>}
      {d && <><h3>Perguntas com mais erros</h3>{ordenado.slice(0, 15).map((x) => <div key={x.qid} className="mapa"><span>Aula {x.q?.aula}: {x.q?.p}</span><div className="barra"><i style={{ width: `${x.pct}%` }} /></div><small>{x.pct}% certas ({x.n})</small></div>)}</>}
    </div>
  );
}
