/* Resumos pequenos tirados de assets/dados/temporada-futebol.js (que é grande, ~600 KB), para os jogos não precisarem dele:
   - assets/dados/times-atuais.js: time atual de cada jogador do Adivinhe/Grade (pelo nome), para pôr o clube de hoje no fim da trajetória;
   Roda depois de .github/estatisticas-futebol.js (workflow estatisticas.yml). */
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '..'), dados = f => path.join(raiz, 'assets/dados', f);
function ler(f) { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(dados(f), 'utf8'), ctx); return ctx.window; }
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const TF = ler('temporada-futebol.js').TEMPORADA_FUTEBOL, AD = ler('adivinhe.js').ADIVINHE;
if (!TF || !TF.jogadores || !AD) { console.log('Sem dados da temporada; nada a fazer.'); process.exit(0); }

/* mesmo critério do jogos-base.js: o time em que ele tem mais jogos é o atual */
const ultimo = {}, ids = {};
TF.jogadores.forEach(l => { const k = norm(l[1]); (ids[k] = ids[k] || new Set()).add(l[0]); if (!ultimo[k] || l[5] > ultimo[k][1]) ultimo[k] = [l[2], l[5], l[3]]; });
/* posição por grupo (g goleiro, d defesa, m meio, a ataque): goleiro só casa com goleiro, defensor não casa com atacante */
const grupoESPN = p => ({ GOL: 'g', ZAG: 'd', LD: 'd', LE: 'd', MEI: 'm', ATA: 'a' })[p] || '';
const grupoJogo = p => /goleiro/i.test(p) ? 'g' : /zagueiro|lateral/i.test(p) ? 'd' : /volante|meio|meia/i.test(p) ? 'm' : /atacante|centroavante|ponta/i.test(p) ? 'a' : '';
const combina = (a, b) => !a || !b || a === b || (a !== 'g' && b !== 'g' && !(a === 'd' && b === 'a') && !(a === 'a' && b === 'd'));
const atuais = {};
(AD.futebol || []).forEach(x => {
  const k = norm(x[0]);
  if (!ultimo[k] || x[5] === 'xará') return;
  /* nome de uma palavra só (Gerson, Hulk, Pedro...): só quando existe um único jogador com esse nome nos dados */
  if (!/\s/.test(x[0]) && ids[k].size > 1) return;
  if (!combina(grupoJogo(x[2]), grupoESPN(ultimo[k][2]))) return; /* ex.: Alisson goleiro x Alisson meia do Fluminense */
  atuais[k] = ultimo[k][0];
});
fs.writeFileSync(dados('times-atuais.js'), '/* Time atual dos jogadores do Adivinhe e da Grade (futebol). Gerado por .github/derivados-futebol.js. */\nwindow.TIMES_ATUAIS = ' + JSON.stringify(atuais) + ';\n');

console.log('times-atuais:', Object.keys(atuais).length);
