# THD – Treino gamificado (aulas 1–7)

Jogo de estudo para Teoria e História do Design (UniCV): quiz, linha do tempo, «Quem sou eu?», olhar de designer, simulação Fábrica 1907, modo teste, perfil com radar, ranking da turma e painel do docente.

## Correr
npm install && npm run dev

## Perfis, ranking e acompanhamento (Supabase)
1. Criar projeto no Supabase e executar `supabase/schema.sql` no SQL Editor.
2. Definir o código do docente (fica guardado com hash): ver a última linha comentada do schema.
3. Copiar `.env.example` para `.env` com URL e chave publishable.
4. Entrar como **docente** → separador *Importar lista* e colar os números de aluno (`número;nome;turma`, nome e turma opcionais).
5. Cada aluno entra com o número e, no primeiro acesso, cria alcunha e PIN (4–8 algarismos). O docente vê último acesso, sessões, tempo ativo, pontos, acertos por aula, simulados e cada ação; exporta CSV; repõe PINs; apaga dados de um aluno.
Sem as variáveis, o jogo funciona em modo local (alcunha, dados só no dispositivo).

**Privacidade:** informar os alunos do que é registado (n.º, tempo, respostas). Preferir importar só números (sem nomes). Apagar os dados no fim do semestre. Os pontos vêm do cliente e podem ser forjados: não usar para avaliação formal.

## Deploy (GitHub Pages)
1. Criar repositório no GitHub e fazer push (branch `main` ou `master`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → criar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (opcional; sem elas o jogo guarda só localmente).
4. Cada push publica automaticamente em `https://UTILIZADOR.github.io/NOME-DO-REPO/`.

## Conteúdos
Edita `src/data/content.ts` para acrescentar perguntas, eventos, figuras e cenários.
