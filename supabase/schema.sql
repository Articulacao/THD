-- Esquema do ranking THD. Executar uma vez no SQL Editor do Supabase.
-- Segurança: as tabelas não têm acesso direto; tudo passa por funções.
create table if not exists public.players (
  id uuid primary key,
  nick text not null check (char_length(nick) between 2 and 20),
  dims jsonb not null default '{}',
  aulas jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create table if not exists public.answers (
  qid text primary key,
  ok int not null default 0,
  n int not null default 0
);
create table if not exists public.settings (key text primary key, value text not null);

alter table public.players enable row level security;
alter table public.answers enable row level security;
alter table public.settings enable row level security;

create or replace function public.upsert_player(p_id uuid, p_nick text, p_dims jsonb, p_aulas jsonb)
returns void language sql security definer set search_path = public as $$
  insert into players(id, nick, dims, aulas) values (p_id, left(p_nick, 20), p_dims, p_aulas)
  on conflict (id) do update set nick = excluded.nick, dims = excluded.dims, aulas = excluded.aulas, updated_at = now();
$$;

create or replace function public.log_answer(p_qid text, p_ok boolean)
returns void language sql security definer set search_path = public as $$
  insert into answers(qid, ok, n) values (left(p_qid, 20), case when p_ok then 1 else 0 end, 1)
  on conflict (qid) do update set ok = answers.ok + excluded.ok, n = answers.n + 1;
$$;

create or replace function public.get_ranking()
returns table(nick text, dims jsonb, total numeric) language sql security definer set search_path = public as $$
  select p.nick, p.dims,
    (select coalesce(sum(v::numeric), 0) from jsonb_each_text(p.dims) as t(k, v)) as total
  from players p order by total desc limit 100;
$$;

create or replace function public.teacher_stats(p_code text)
returns table(qid text, ok int, n int) language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from settings where key = 'teacher_code' and value = p_code) then
    raise exception 'codigo invalido';
  end if;
  return query select a.qid, a.ok, a.n from answers a;
end $$;

revoke all on function public.upsert_player, public.log_answer, public.get_ranking, public.teacher_stats from public;
grant execute on function public.upsert_player, public.log_answer, public.get_ranking, public.teacher_stats to anon, authenticated;
-- Definir o código do docente (substituir):
-- insert into settings values ('teacher_code', 'ESCOLHE-UM-CODIGO');
