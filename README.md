# Sentinela Awards

Sistema de votação anônima para até 10 participantes por votação. Next.js App Router, TypeScript, Tailwind CSS e PostgreSQL (local ou Supabase).

## Arquitetura

- Rotas de API do Next.js executam todas as regras no servidor. O browser nunca acessa o banco diretamente.
- O administrador entra com uma senha configurada no ambiente. A sessão é um cookie HttpOnly assinado com HMAC e expira em 12 horas.
- Cada código de votação é exibido uma única vez. O banco guarda só o hash HMAC com `TOKEN_PEPPER`.
- O envio usa uma única transação PostgreSQL, bloqueia a linha do token (`FOR UPDATE`), valida todas as categorias e opções, insere os votos e marca o token como usado.
- `votes` não tem `token_id`, nome, email nem identificador de participante. A contagem pública só mostra totais após a liberação. A página de resultados revela os vencedores por categoria, incluindo empates.
- Um grupo muito pequeno ainda pode permitir inferências por observação externa ou comparação de resultados em momentos diferentes. Para privacidade melhor, evite revelar resultados enquanto a votação está aberta e distribua os códigos fora do sistema.

## Rodar localmente

1. Instale Node.js 22+ e PostgreSQL 15+.
2. Crie o banco: `createdb sentinela_awards`.
3. Copie `.env.example` para `.env.local` e configure `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` e `TOKEN_PEPPER`. Use segredos longos e diferentes.
4. Execute `npm install`.
5. Execute `DATABASE_URL='sua-url' npm run db:migrate`. Opcional: `DATABASE_URL='sua-url' npm run db:seed`.
6. Execute `npm run dev` e abra `http://localhost:3000`.
7. Entre em `/admin`, crie ou edite a votação, gere códigos, distribua-os e abra a votação.

O exemplo é criado como rascunho. Códigos já gerados não podem ser recuperados em texto. Faça backup do banco e dos segredos; perder `TOKEN_PEPPER` invalida os códigos existentes.

## Publicar

Crie um projeto PostgreSQL (Supabase ou outro provedor), execute a migration contra a URL de conexão e configure as quatro variáveis no host Next.js. Publique com `npm run build` e `npm run start`, ou em um host compatível com Next.js e runtime Node. Use HTTPS. Em Supabase, utilize a conexão PostgreSQL pelo servidor; não exponha `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` ou `TOKEN_PEPPER` ao cliente. Em ambiente com múltiplas instâncias, o rate limit fica no PostgreSQL e funciona entre elas.

## Rotas

- `/`: votações públicas
- `/polls/[id]`: acesso e voto
- `/results/[id]`: resultados bloqueados ou revelados
- `/admin`: gestão protegida

A edição de categorias e opções é bloqueada depois do primeiro voto para preservar a integridade dos resultados. A exclusão de uma votação apaga seus votos e códigos. Resultados agendados são liberados pela comparação do horário atual com `reveal_at`; não dependem de cron.

## Demonstração rápida, sem banco

Execute `DEMO_MODE=true npm run dev` e abra `http://localhost:3000`. As páginas inicial, de votação, de resultados e `/admin` usam dados de exemplo. Na votação, qualquer código com pelo menos 8 caracteres libera a interface. O envio, os botões administrativos e os resultados são apenas simulações; nenhum dado é salvo. Remova `DEMO_MODE` para usar o sistema real.
