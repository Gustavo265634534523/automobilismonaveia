# Lista para o lançamento do site

Desde 26/10/2026 todos os robôs estão DESLIGADOS (o site está fora do ar). Os dados e as notícias ficaram como
estavam nesse dia. No `main` não tem mais a rotina de 3 horas, e os horários do Telegram e do F1 pós-corrida estão comentados.

No dia de lançar:

1. Juntar o ramo `claude/brave-cori-ro0omk` no `main`. Os robôs deste ramo já têm horário marcado e passam a rodar
   sozinhos no `main`: placar (10 min), estatísticas (3 h), notícias (5 h), elencos e escudos (toda semana).
2. Religar os horários do `main` desligados: em `.github/workflows/telegram.yml` e `.github/workflows/f1-pos-corrida.yml`,
   tirar o `#` das linhas `schedule:` e `- cron: ...` (na junção o git mantém essas linhas comentadas).
3. Rodar uma vez à mão cada robô (Actions → Run workflow) para o site já abrir com tudo do dia.
4. Bolão online: criar no GitHub os segredos `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e `BOLAO_CHAVE`
   e rodar o workflow "Servidor do bolão".
