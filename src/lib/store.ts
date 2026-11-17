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

// ---- sincronização (silenciosa; falha sem quebrar o jogo) ----
export async function sync(s: Save) {
  if (!sb || !s.nick) return;
  const dims: Record<string, number> = {};
  Object.entries(s.dims).forEach(([k, v]) => (dims[k] = v.pts));
  const aulas: Record<string, number> = {};
  Object.entries(s.aulas).forEach(([k, v]) => (aulas[k] = v.n ? Math.round((v.ok / v.n) * 100) : 0));
  try { await sb.rpc("upsert_player", { p_id: s.id, p_nick: s.nick, p_dims: dims, p_aulas: aulas }); } catch { /* offline */ }
}
export async function logAnswer(qid: string, ok: boolean) {
  if (!sb) return;
  try { await sb.rpc("log_answer", { p_qid: qid, p_ok: ok }); } catch { /* ignore */ }
}
export type Linha = { nick: string; dims: Record<string, number>; total: number };
export async function ranking(): Promise<Linha[] | null> {
  if (!sb) return null;
  try {
    const { data, error } = await sb.rpc("get_ranking");
    if (error) return null;
    return (data as { nick: string; dims: Record<string, number>; total: number }[]) || [];
  } catch { return null; }
}
export async function teacherStats(code: string) {
  if (!sb) return null;
  const { data, error } = await sb.rpc("teacher_stats", { p_code: code });
  if (error) return null;
  return data as { qid: string; ok: number; n: number }[];
}
