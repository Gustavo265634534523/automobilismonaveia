/* Resumos pequenos tirados de assets/dados/temporada-futebol.js (que é grande, ~600 KB), para os jogos não precisarem dele:
   - assets/dados/times-atuais.js: time atual de cada jogador do Adivinhe/Grade (pelo nome), para pôr o clube de hoje no fim da trajetória;
   - assets/dados/mais-ou-menos-futebol.js: jogos, gols e assistências na temporada (somando os campeonatos) de quem tem pelo menos
     4 jogos e 2 participações em gol, para o Mais ou menos.
   Roda depois de .github/estatisticas-futebol.js (workflow estatisticas.yml). */
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '..'), dados = f => path.join(raiz, 'assets/dados', f);
function ler(f) { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(dados(f), 'utf8'), ctx); return ctx.window; }
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const TF = ler('temporada-futebol.js').TEMPORADA_FUTEBOL, AD = ler('adivinhe.js').ADIVINHE;
if (!TF || !TF.jogadores || !AD) { console.log('Sem dados da temporada; nada a fazer.'); process.exit(0); }

/* mesmo critério do jogos-base.js: o time em que ele tem mais jogos é o atual */
const ultimo = {};
TF.jogadores.forEach(l => { const k = norm(l[1]); if (!ultimo[k] || l[5] > ultimo[k][1]) ultimo[k] = [l[2], l[5]]; });
const atuais = {};
(AD.futebol || []).forEach(x => { const k = norm(x[0]); if (ultimo[k]) atuais[k] = ultimo[k][0]; });
fs.writeFileSync(dados('times-atuais.js'), '/* Time atual dos jogadores do Adivinhe e da Grade (futebol). Gerado por .github/derivados-futebol.js. */\nwindow.TIMES_ATUAIS = ' + JSON.stringify(atuais) + ';\n');

const por = {};
TF.jogadores.forEach(l => { const x = por[l[0]] = por[l[0]] || [l[1], l[2], 0, 0, 0]; x[2] += l[5]; x[3] += l[7]; x[4] += l[8]; });
const mm = Object.keys(por).map(k => por[k]).filter(x => x[2] >= 4 && x[3] + x[4] >= 2).map(x => [x[0], x[1], x[3], x[4]]);
fs.writeFileSync(dados('mais-ou-menos-futebol.js'), '/* Mais ou menos (futebol): [nome, time, gols, assistências] na temporada. Gerado por .github/derivados-futebol.js. */\nwindow.MAIS_OU_MENOS_FUTEBOL = ' + JSON.stringify(mm) + ';\n');
console.log('times-atuais:', Object.keys(atuais).length, '· mais-ou-menos:', mm.length);
