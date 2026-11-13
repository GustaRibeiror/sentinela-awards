# Sentinela Awards

Premiação ao vivo com host, QR Code e voto por categoria. Usa SQLite local, sem PostgreSQL ou hospedagem.

## Rodar

1. Instale Node.js 24+ e execute `npm install`.
2. Copie `.env.example` para `.env.local` e configure `ADMIN_PASSWORD` e `SESSION_SECRET` com valores diferentes. Se o `.env.local` ainda tiver `TOKEN_PEPPER`, ele pode permanecer sem efeito.
3. Execute `npm run dev -- --hostname 0.0.0.0`.
4. Acesse `/admin`, crie a premiação e envie imagens opcionais. Cada convidado entra pelo QR Code e digita nome e sobrenome.
5. Abra a TV pelo painel. O QR tenta usar automaticamente o IP do notebook na rede local, mesmo que o painel esteja em `localhost`. Confira o link exibido sob o QR e ajuste-o ali se necessário. Todos precisam estar no mesmo Wi-Fi.

Para cadastrar as 13 categorias de exemplo do Sentinela Awards 2026 em um banco novo, execute `node scripts/seed-awards.mjs` uma vez. Cada categoria terá Opção A, B, C e D.

O banco surge automaticamente em `data/sentinela.sqlite`; as imagens ficam em `data/images/`. Faça backup da pasta `data/` e do `.env.local` após o evento.

## Ao vivo

O host avança pergunta → candidatos → votação → encerramento → resultado. Os celulares acompanham em cerca de dois segundos. O QR permanece igual durante o evento. Cada pessoa informa o nome completo uma vez e o aparelho fica reconhecido por um cookie privado. Após confirmar, ela pode mudar o voto até o host fechar a categoria. Só a TV com sessão de host vê o placar revelado.

Em caso de empate no primeiro lugar, use **Iniciar desempate**. A nova categoria contém somente os empatados; os participantes cadastrados continuam reconhecidos. Para exibir o placar, abra a tela da TV no mesmo navegador em que entrou no painel.

O nome é uma identificação informal: o sistema impede nomes duplicados em aparelhos diferentes, mas não consegue provar que a pessoa digitou o próprio nome. Se alguém perder os cookies ou trocar de aparelho, precisará usar outro nome ou pedir ajuda ao host.
