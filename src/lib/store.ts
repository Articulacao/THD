import { createClient } from "@supabase/supabase-js";
import { DIMENSOES, type Dim, type Aula } from "../data/content";

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const sb = URL && KEY ? createClient(URL, KEY) : null;

export type DimStat = { pts: number; ok: number; n: number };
export type Save = {
  id: string;
  nick: string;
  dims: Record<string, DimStat>;
  aulas: Record<string, { ok: number; n: number }>;
  q: Record<string, { ok: number; n: number }>;
  days: string[];
  tests: { quando: string; nota: number; total: number }[];
};

const LS = "thd-game-v1";
const uuid = () =>
  (crypto as Crypto).randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 3) | 8).toString(16); });

export function blank(): Save {
  const dims: Record<string, DimStat> = {};
  DIMENSOES.forEach((d) => (dims[d] = { pts: 0, ok: 0, n: 0 }));
  return { id: uuid(), nick: "", dims, aulas: {}, q: {}, days: [], tests: [] };
}
export function load(): Save {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || "null");
    if (s) return { ...blank(), ...s };
  } catch { /* ignore */ }
  return blank();
}
export function persist(s: Save) {
  try { localStorage.setItem(LS, JSON.stringify(s)); } catch { /* ignore */ }
}

const today = () => new Date().toISOString().slice(0, 10);
export function streak(days: string[]): number {
  const set = new Set(days);
  let d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d = new Date(Date.now() - 864e5);
  let n = 0;
  while (set.has(d.toISOString().slice(0, 10))) { n++; d = new Date(d.getTime() - 864e5); }
  return n;
}

export function registar(s: Save, dim: Dim, pts: number, ok: number, n: number, aula?: Aula, qid?: string): Save {
  const x = structuredClone(s);
  const d = x.dims[dim] || { pts: 0, ok: 0, n: 0 };
  d.pts += pts; d.ok += ok; d.n += n; x.dims[dim] = d;
  if (aula) { const a = x.aulas[aula] || { ok: 0, n: 0 }; a.ok += ok; a.n += n; x.aulas[aula] = a; }
  if (qid) { const q = x.q[qid] || { ok: 0, n: 0 }; q.ok += ok; q.n += n; x.q[qid] = q; }
  if (!x.days.includes(today())) x.days.push(today());
  x.days = x.days.slice(-120);
  const st = streak(x.days);
  x.dims["Consistência"] = { pts: st * 20, ok: st, n: Math.max(st, 1) };
  return x;
}

export const totalPts = (s: Save) => Object.values(s.dims).reduce((a, d) => a + d.pts, 0);
export const radar = (s: Save) =>
  DIMENSOES.map((d) => {
    const v = s.dims[d] || { pts: 0, ok: 0, n: 0 };
    const val = d === "Consistência" ? Math.min(100, streak(s.days) * 14) : v.n ? Math.round((v.ok / v.n) * 100) : 0;
    return { dim: d, valor: val };
  });

// ---- autenticação e registo (Supabase) ----
export type Auth = { token: string; numero: string; nick: string };
const LA = "thd-auth-v1";
export const loadAuth = (): Auth | null => { try { return JSON.parse(localStorage.getItem(LA) || "null"); } catch { return null; } };
export const saveAuth = (a: Auth | null) => { try { if (a) localStorage.setItem(LA, JSON.stringify(a)); else localStorage.removeItem(LA); } catch { /* ignore */ } };

type Res<T = unknown> = { ok: boolean; erro?: string; data?: T; [k: string]: unknown };
async function rpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<Res<T>> {
  if (!sb) return { ok: false, erro: "sem_base" };
  try {
    const { data, error } = await sb.rpc(fn, args);
    if (error) return { ok: false, erro: "rede" };
    return data as Res<T>;
  } catch { return { ok: false, erro: "rede" }; }
}

export async function loginAluno(numero: string, pin: string, nick?: string) {
  return rpc<never>("aluno_login", { p_numero: numero, p_pin: pin, p_nick: nick ?? null }) as Promise<Res & { token?: string; nick?: string; save?: Save | null }>;
}

// sessão e tempo ativo
let tok = ""; let sessao = "";
export async function iniciarSessao(auth: Auth) {
  tok = auth.token; sessao = "";
  const r = (await rpc("sessao_inicio", { p_token: tok })) as Res & { sessao?: string };
  if (r.ok && r.sessao) sessao = r.sessao;
  return r.ok;
}
export async function ping(seg: number) {
  if (!tok || !sessao) return;
  await rpc("sessao_ping", { p_token: tok, p_sessao: sessao, p_seg: seg });
}

// guarda o progresso (permite continuar noutro dispositivo) e regista as ações
export async function sync(s: Save) {
  if (!tok) return;
  const dims: Record<string, number> = {};
  Object.entries(s.dims).forEach(([k, v]) => (dims[k] = v.pts));
  const aulas: Record<string, number> = {};
  Object.entries(s.aulas).forEach(([k, v]) => (aulas[k] = v.n ? Math.round((v.ok / v.n) * 100) : 0));
  await rpc("guardar", { p_token: tok, p_save: s, p_dims: dims, p_aulas: aulas });
}
// compara estados e regista o que mudou (tipo = dimensão do jogo)
export function eventosDe(a: Save, b: Save) {
  const evs: { tipo: string; dim: string | null; aula: number | null; qid: string | null; pts: number; ok: number; n: number }[] = [];
  for (const d of Object.keys(b.dims)) {
    if (d === "Consistência") continue;
    const x = a.dims[d] || { pts: 0, ok: 0, n: 0 }; const y = b.dims[d];
    if (y.n > x.n) {
      const aula = Object.keys(b.aulas).find((k) => (b.aulas[k]?.n || 0) > (a.aulas[k]?.n || 0));
      const qid = Object.keys(b.q).find((k) => (b.q[k]?.n || 0) > (a.q[k]?.n || 0));
      evs.push({ tipo: d, dim: d, aula: aula ? Number(aula) : null, qid: qid || null, pts: y.pts - x.pts, ok: y.ok - x.ok, n: y.n - x.n });
    }
  }
  if (b.tests.length > a.tests.length) { const t = b.tests[b.tests.length - 1]; evs.push({ tipo: "teste", dim: null, aula: null, qid: null, pts: t.nota, ok: t.nota, n: t.total }); }
  return evs;
}
export async function enviarEventos(evs: ReturnType<typeof eventosDe>) {
  if (!tok || !sessao) return;
  for (const e of evs) await rpc("evento", { p_token: tok, p_sessao: sessao, p_tipo: e.tipo, p_aula: e.aula, p_dim: e.dim, p_qid: e.qid, p_pts: e.pts, p_ok: e.ok, p_n: e.n });
}
export function terminarSessao() { tok = ""; sessao = ""; }

export type Linha = { nick: string; dims: Record<string, number>; total: number };
export async function ranking(): Promise<Linha[] | null> {
  if (!sb) return null;
  try {
    const { data, error } = await sb.rpc("ranking");
    if (error) return null;
    return (data as Linha[]) || [];
  } catch { return null; }
}

// ---- docente ----
export type AlunoRow = {
  numero: string; nome: string | null; turma: string | null; nick: string | null; ativo: boolean; last_seen: string | null;
  sessoes: number; segundos: number; pts: number; aulas: Record<string, number>; testes: { quando: string; nota: number; total: number }[]; acoes: number;
};
export type Evento = { numero: string; sessao: string; ts: string; tipo: string; aula: number | null; dim: string | null; qid: string | null; pts: number; ok: number; n: number };
export const docente = {
  alunos: (code: string) => rpc<AlunoRow[]>("docente_alunos", { p_code: code }),
  eventos: (code: string, numero: string | null) => rpc<Evento[]>("docente_eventos", { p_code: code, p_numero: numero, p_limite: 5000 }),
  perguntas: (code: string) => rpc<{ qid: string; ok: number; n: number }[]>("docente_perguntas", { p_code: code }),
  importar: (code: string, lista: string) => rpc("docente_importar", { p_code: code, p_lista: lista }) as Promise<Res & { importados?: number }>,
  resetPin: (code: string, numero: string) => rpc("docente_reset_pin", { p_code: code, p_numero: numero }),
  apagar: (code: string, numero: string) => rpc("docente_apagar", { p_code: code, p_numero: numero }),
};
export const fmtTempo = (seg: number) => { const m = Math.round(seg / 60); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + (m % 60) + " min"; };
