# Lista para o lançamento do site

Hoje (desde 26/10/2026) os robôs estão ligados: no `main` fica só a rotina `.github/workflows/rotina-3h.yml`, que a cada
3 horas manda rodar, neste ramo, placar, estatísticas, notícias, F1 pós-corrida (que também busca os vídeos), elencos e
escudos. Telegram (5 min) e F1 pós-corrida (30 min) do `main` também estão ligados.

No dia de lançar:

1. Juntar o ramo `claude/brave-cori-ro0omk` no `main`. Os robôs deste ramo já têm horário marcado e passam a rodar
   sozinhos no `main`: placar (10 min), estatísticas (3 h), notícias (5 h), elencos e escudos (toda semana).
2. Apagar `.github/workflows/rotina-3h.yml` do `main`: depois da junção ela não é mais necessária (e continuaria
   rodando os robôs no ramo antigo).
3. Bolão online: criar no GitHub os segredos `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e `BOLAO_CHAVE`
   e rodar o workflow "Servidor do bolão".
