# Projeto THD – jogo gamificado (UniCV, Tecnologias Multimédia)

Docente: Dandrade. UC: Teoria e História do Design (1.º ano, ~50 alunos). Língua: português (Cabo Verde/PT). Visual: inspirado na Bauhaus (círculo vermelho, quadrado amarelo, triângulo azul).

## Estado
- App React + Vite + TypeScript já compila (`npm install && npm run build`).
- Conteúdo das aulas 1–7 em `src/data/content.ts` (Design, Arte×Técnica, Industrialização, Arts and Crafts, Arte Nova, Werkbund, Bauhaus). Fonte: slides THD_24_25.
- Modos: quiz, linha do tempo, quem sou eu, olhar de designer, simulação Fábrica 1907, modo teste (20 perguntas/15 min), perfil (radar), ranking, painel docente.
- Ranking: Supabase via funções RPC (`supabase/schema.sql`). Sem `.env` o jogo funciona só em local.

## Por fazer (por esta ordem)
1. Testar localmente (`npm run dev`) e corrigir bugs de UI/UX, sobretudo no telemóvel.
2. Criar projeto Supabase novo para o THD, correr `supabase/schema.sql`, definir o código do docente (`insert into settings values ('teacher_code','...')`), criar `.env` a partir de `.env.example`.
3. Criar repositório GitHub e fazer push; importar na Vercel (Vite, output `dist`) com as 2 variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Testar o ranking com 2 dispositivos e o painel docente.
5. Aumentar o banco de perguntas (alvo: 100+), ajustar ao formato real do teste, acrescentar imagens de obras em domínio público (Wikimedia Commons) ao modo «Olhar de designer».
6. Melhorias: arrastar-e-largar na linha do tempo, modo duelo, selos/conquistas, exportar resultados da turma em CSV para o docente.

## Limites conhecidos
- Pontos enviados pelo cliente podem ser forjados: usar o ranking para motivar, não para avaliar.
- Não usar nomes reais dos alunos (só alcunhas).
