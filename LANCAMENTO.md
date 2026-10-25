# Lista para o lançamento do site

Enquanto o site está fora do ar, nada atualiza sozinho. No dia de lançar:

1. Juntar o ramo `claude/brave-cori-ro0omk` no `main`. Os robôs deste ramo já têm horário marcado e começam a rodar sozinhos:
   placar (10 min), estatísticas (3 h), notícias (5 h), elencos e escudos (toda semana).
2. Religar os horários do `main` que foram desligados em 25/10/2026: em `.github/workflows/telegram.yml` e
   `.github/workflows/f1-pos-corrida.yml`, tirar o `#` das linhas `schedule:` e `- cron: ...`.
   (Na junção do ramo, o git mantém essas linhas comentadas, porque foi o `main` que mudou.)
3. Bolão online: criar no GitHub os segredos `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e `BOLAO_CHAVE`
   e rodar o workflow "Servidor do bolão".
