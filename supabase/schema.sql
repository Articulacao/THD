-- Esquema THD v2: perfis de aluno e docente, sessões (tempo ativo) e registo de ações.
-- Executar uma vez no SQL Editor do Supabase (projeto novo).
-- Segurança: RLS ligado e SEM políticas => nenhum acesso direto às tabelas; tudo passa por funções RPC.
-- Privacidade: o aluno é identificado por n.º de aluno + PIN (hash bcrypt). O nome é opcional e só o docente o vê.
-- O ranking mostra apenas a alcunha escolhida pelo aluno.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.roster (
  numero text primary key check (char_length(numero) between 1 and 30),
  nome text,
  turma text,
  nick text check (nick is null or char_length(nick) between 2 and 20),
  pin_hash text,
  created_at timestamptz not null default now(),
  last_seen timestamptz
);
create table if not exists public.tokens (
  token uuid primary key default gen_random_uuid(),
  numero text not null references public.roster(numero) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.players (
  numero text primary key references public.roster(numero) on delete cascade,
  dims jsonb not null default '{}',
  aulas jsonb not null default '{}',
  save jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.sessoes (
  id uuid primary key default gen_random_uuid(),
  numero text not null references public.roster(numero) on delete cascade,
  inicio timestamptz not null default now(),
  ultimo timestamptz not null default now(),
  segundos int not null default 0
);
create table if not exists public.eventos (
  id bigserial primary key,
  numero text not null references public.roster(numero) on delete cascade,
  sessao uuid,
  ts timestamptz not null default now(),
  tipo text not null,
  aula int,
  dim text,
  qid text,
  pts int not null default 0,
  ok int not null default 0,
  n int not null default 0
);
create index if not exists eventos_numero_ts on public.eventos(numero, ts desc);
create table if not exists public.settings (key text primary key, value text not null);
create table if not exists public.falhas (chave text primary key, n int not null default 0, ate timestamptz);

alter table public.roster enable row level security;
alter table public.tokens enable row level security;
alter table public.players enable row level security;
alter table public.sessoes enable row level security;
alter table public.eventos enable row level security;
alter table public.settings enable row level security;
alter table public.falhas enable row level security;

-- ---------- auxiliares internos (não expostos) ----------
create or replace function public._bloqueado(p_chave text) returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from falhas where chave = p_chave and ate > now());
$$;

create or replace function public._falha(p_chave text) returns void
language sql security definer set search_path = public as $$
  insert into falhas(chave, n) values (p_chave, 1)
  on conflict (chave) do update set n = falhas.n + 1,
    ate = case when falhas.n + 1 >= 5 then now() + interval '10 minutes' else falhas.ate end;
$$;

create or replace function public._aluno(p_token uuid) returns text
language sql security definer set search_path = public as $$
  select numero from tokens where token = p_token and created_at > now() - interval '30 days';
$$;

-- devolve true se o código é válido; regista falhas (bloqueia 10 min após 5 erros)
create or replace function public._docente(p_code text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if _bloqueado('docente') then return false; end if;
  if exists (select 1 from settings where key = 'teacher_code' and value = crypt(coalesce(p_code, ''), value)) then
    delete from falhas where chave = 'docente';
    return true;
  end if;
  perform _falha('docente');
  return false;
end $$;

-- ---------- aluno ----------
create or replace function public.aluno_login(p_numero text, p_pin text, p_nick text default null)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r roster%rowtype; t uuid; k text; n text := trim(coalesce(p_numero, ''));
begin
  k := 'a:' || lower(n);
  if _bloqueado(k) then return jsonb_build_object('ok', false, 'erro', 'bloqueado'); end if;
  select * into r from roster where numero = n;
  if not found then perform _falha(k); return jsonb_build_object('ok', false, 'erro', 'nao_inscrito'); end if;
  if r.pin_hash is null then
    if p_nick is null or char_length(trim(p_nick)) not between 2 and 20 then
      return jsonb_build_object('ok', false, 'erro', 'primeiro_acesso');
    end if;
    if coalesce(p_pin, '') !~ '^[0-9]{4,8}$' then
      return jsonb_build_object('ok', false, 'erro', 'pin_invalido');
    end if;
    update roster set pin_hash = crypt(p_pin, gen_salt('bf')), nick = trim(p_nick) where numero = r.numero;
    r.nick := trim(p_nick);
  elsif r.pin_hash <> crypt(coalesce(p_pin, ''), r.pin_hash) then
    perform _falha(k);
    return jsonb_build_object('ok', false, 'erro', 'pin');
  end if;
  delete from falhas where chave = k;
  insert into tokens(numero) values (r.numero) returning token into t;
  update roster set last_seen = now() where numero = r.numero;
  return jsonb_build_object('ok', true, 'token', t, 'nick', r.nick,
    'save', (select save from players where numero = r.numero));
end $$;

create or replace function public.sessao_inicio(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n text := _aluno(p_token); s uuid;
begin
  if n is null then return jsonb_build_object('ok', false, 'erro', 'token'); end if;
  insert into sessoes(numero) values (n) returning id into s;
  update roster set last_seen = now() where numero = n;
  return jsonb_build_object('ok', true, 'sessao', s);
end $$;

create or replace function public.sessao_ping(p_token uuid, p_sessao uuid, p_seg int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n text := _aluno(p_token);
begin
  if n is null then return jsonb_build_object('ok', false, 'erro', 'token'); end if;
  update sessoes set segundos = segundos + least(greatest(coalesce(p_seg, 0), 0), 60), ultimo = now()
    where id = p_sessao and numero = n;
  update roster set last_seen = now() where numero = n;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.evento(p_token uuid, p_sessao uuid, p_tipo text, p_aula int, p_dim text,
  p_qid text, p_pts int, p_ok int, p_n int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare num text := _aluno(p_token);
begin
  if num is null then return jsonb_build_object('ok', false, 'erro', 'token'); end if;
  insert into eventos(numero, sessao, tipo, aula, dim, qid, pts, ok, n)
  values (num, p_sessao, left(coalesce(p_tipo, ''), 20), p_aula, left(p_dim, 30), left(p_qid, 20),
    greatest(coalesce(p_pts, 0), 0), greatest(coalesce(p_ok, 0), 0), greatest(coalesce(p_n, 0), 0));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.guardar(p_token uuid, p_save jsonb, p_dims jsonb, p_aulas jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n text := _aluno(p_token);
begin
  if n is null then return jsonb_build_object('ok', false, 'erro', 'token'); end if;
  insert into players(numero, dims, aulas, save) values (n, p_dims, p_aulas, p_save)
  on conflict (numero) do update set dims = excluded.dims, aulas = excluded.aulas, save = excluded.save, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.ranking() returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select r.nick, p.dims,
      (select coalesce(sum(v::numeric), 0) from jsonb_each_text(p.dims) as t(k, v)) as total
    from players p join roster r using (numero)
    where r.nick is not null order by total desc limit 100
  ) x;
$$;

-- ---------- docente ----------
create or replace function public.docente_importar(p_code text, p_lista text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l text; p text[]; c int := 0;
begin
  if not _docente(p_code) then return jsonb_build_object('ok', false, 'erro', 'codigo'); end if;
  for l in select regexp_split_to_table(coalesce(p_lista, ''), E'\r?\n') loop
    p := regexp_split_to_array(trim(l), E'\\s*[;,\\t]\\s*');
    if coalesce(p[1], '') = '' or char_length(p[1]) > 30 then continue; end if;
    insert into roster(numero, nome, turma) values (trim(p[1]), nullif(trim(p[2]), ''), nullif(trim(p[3]), ''))
    on conflict (numero) do update set nome = coalesce(excluded.nome, roster.nome), turma = coalesce(excluded.turma, roster.turma);
    c := c + 1;
  end loop;
  return jsonb_build_object('ok', true, 'importados', c);
end $$;

create or replace function public.docente_alunos(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _docente(p_code) then return jsonb_build_object('ok', false, 'erro', 'codigo'); end if;
  return jsonb_build_object('ok', true, 'data', (
    select coalesce(jsonb_agg(x order by x.numero), '[]'::jsonb) from (
      select r.numero, r.nome, r.turma, r.nick, (r.pin_hash is not null) as ativo, r.last_seen,
        (select count(*) from sessoes s where s.numero = r.numero) as sessoes,
        (select coalesce(sum(s.segundos), 0) from sessoes s where s.numero = r.numero) as segundos,
        (select coalesce(sum(v::numeric), 0) from jsonb_each_text(coalesce(p.dims, '{}'::jsonb)) as t(k, v)) as pts,
        coalesce(p.aulas, '{}'::jsonb) as aulas,
        coalesce(p.save -> 'tests', '[]'::jsonb) as testes,
        (select count(*) from eventos e where e.numero = r.numero) as acoes
      from roster r left join players p using (numero)
    ) x));
end $$;

create or replace function public.docente_eventos(p_code text, p_numero text default null, p_limite int default 5000) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _docente(p_code) then return jsonb_build_object('ok', false, 'erro', 'codigo'); end if;
  return jsonb_build_object('ok', true, 'data', (
    select coalesce(jsonb_agg(x), '[]'::jsonb) from (
      select e.numero, e.sessao, e.ts, e.tipo, e.aula, e.dim, e.qid, e.pts, e.ok, e.n
      from eventos e where p_numero is null or e.numero = p_numero
      order by e.ts desc limit least(coalesce(p_limite, 5000), 20000)
    ) x));
end $$;

create or replace function public.docente_perguntas(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _docente(p_code) then return jsonb_build_object('ok', false, 'erro', 'codigo'); end if;
  return jsonb_build_object('ok', true, 'data', (
    select coalesce(jsonb_agg(x), '[]'::jsonb) from (
      select qid, sum(ok)::int as ok, sum(n)::int as n from eventos where qid is not null group by qid
    ) x));
end $$;

create or replace function public.docente_reset_pin(p_code text, p_numero text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _docente(p_code) then return jsonb_build_object('ok', false, 'erro', 'codigo'); end if;
  update roster set pin_hash = null where numero = p_numero;
  delete from tokens where numero = p_numero;
  return jsonb_build_object('ok', true);
end $$;

-- Apaga TODOS os dados de um aluno (direito ao apagamento / fim do semestre).
create or replace function public.docente_apagar(p_code text, p_numero text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _docente(p_code) then return jsonb_build_object('ok', false, 'erro', 'codigo'); end if;
  delete from roster where numero = p_numero;
  return jsonb_build_object('ok', true);
end $$;

-- ---------- permissões: só as funções públicas ficam acessíveis ----------
do $$ declare f record; begin
  for f in select oid::regprocedure as sig from pg_proc where pronamespace = 'public'::regnamespace loop
    execute 'revoke all on function ' || f.sig || ' from public, anon, authenticated';
  end loop;
end $$;
grant execute on function
  public.aluno_login(text, text, text), public.sessao_inicio(uuid), public.sessao_ping(uuid, uuid, int),
  public.evento(uuid, uuid, text, int, text, text, int, int, int), public.guardar(uuid, jsonb, jsonb, jsonb),
  public.ranking(), public.docente_importar(text, text), public.docente_alunos(text),
  public.docente_eventos(text, text, int), public.docente_perguntas(text),
  public.docente_reset_pin(text, text), public.docente_apagar(text, text)
to anon, authenticated;

-- Definir o código do docente (substituir ESCOLHE-UM-CODIGO-FORTE; fica guardado com hash):
-- insert into settings values ('teacher_code', extensions.crypt('ESCOLHE-UM-CODIGO-FORTE', extensions.gen_salt('bf')))
--   on conflict (key) do update set value = excluded.value;
