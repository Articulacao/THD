# THD – Treino gamificado (aulas 1–7)

Jogo de estudo para Teoria e História do Design (UniCV): quiz, linha do tempo, «Quem sou eu?», olhar de designer, simulação Fábrica 1907, modo teste, perfil com radar, ranking da turma e painel do docente.

## Correr
npm install && npm run dev

## Ranking da turma (Supabase)
1. Criar projeto no Supabase e executar `supabase/schema.sql` no SQL Editor.
2. Definir o código do docente: `insert into settings values ('teacher_code','O-TEU-CODIGO');`
3. Copiar `.env.example` para `.env` com URL e chave publishable.
Sem estas variáveis o jogo funciona só com guardado local.

## Deploy
Importar o repositório na Vercel (Vite, build `npm run build`, output `dist`) e definir as duas variáveis de ambiente.

## Conteúdos
Edita `src/data/content.ts` para acrescentar perguntas, eventos, figuras e cenários.
