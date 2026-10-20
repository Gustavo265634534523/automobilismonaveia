/* Enquete do dia ("Quem vence?"): o jogo grande da semana do futebol e do basquete e a próxima corrida da F1,
   com os 6 primeiros do campeonato e "Outro piloto". Grava assets/dados/enquete.json; o servidor das contas lê esse
   arquivo para conferir os votos (ações enquete_ver e enquete_votar). A votação fecha na hora da largada.
   Roda no GitHub (agenda.yml e f1-pos-corrida.yml) ou no PC: node .github/enquete.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/enquete.json');
global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
const CATS = ['formula-1'];

const agora = Date.now();
const opcoes = [];
CATS.forEach(slug => {
  const c = window.CATEGORIAS.find(x => x.slug === slug);
  if (!c) return;
  for (const e of c.calendario) {
    if (e.venc || !e.d) continue;
    const corrida = (e.s || []).filter(s => /^Corrida|^Corrida 1|Principal/.test(s.t) && s.d && s.h).pop();
    const largada = corrida ? Date.parse(corrida.d + 'T' + corrida.h + ':00-03:00') : Date.parse(e.d + 'T12:00:00-03:00');
    if (largada <= agora) continue;
    opcoes.push({ c, e, largada });
    break;
  }
});
/* uma enquete por categoria com corrida nos próximos 10 dias (se nenhuma, a próxima de todas), F1 primeiro */
let escolhidas = opcoes.filter(o => o.largada - agora < 10 * 864e5);
if (!escolhidas.length) escolhidas = opcoes.slice().sort((a, b) => a.largada - b.largada).slice(0, 1);
const dados = escolhidas.map(x => ({
  id: x.c.slug + '-' + x.e.e + '-' + x.e.d.slice(0, 4),
  cat: x.c.slug, categoria: x.c.nome, etapa: x.e.n,
  pergunta: /^GP /.test(x.e.n) ? 'Quem vence o ' + x.e.n + '?' : 'Quem vence a ' + x.c.nome + ' em ' + String(x.e.l).replace(/ \(\w+\)$/, '') + '?',
  opcoes: (x.c.classificacao && x.c.classificacao.linhas || []).slice(0, 6).map(l => String(l[1]).split(' e ')[0]).concat(['Outro piloto']),
  fecha: new Date(x.largada).toISOString()
}));
/* futebol e basquete: o jogo mais forte dos próximos 7 dias de cada esporte (placar automático primeiro, depois os dados à mão) */
try {
  eval(fs.readFileSync(path.join(RAIZ, 'assets/js/esportes-dados.js'), 'utf8'));
  try { eval(fs.readFileSync(path.join(RAIZ, 'assets/dados/ao-vivo.js'), 'utf8')); } catch (e) { /* sem placar automático */ }
  const GRANDES = {
    futebol: /Flamengo|Palmeiras|Corinthians|São Paulo|Santos|Vasco|Fluminense|Botafogo|Grêmio|Internacional|Atlético-MG|Cruzeiro|Real Madrid|Barcelona|Paris Saint-Germain|Bayern|Liverpool|Arsenal|Manchester City|Inter de Milão|Boca Juniors|River Plate/,
    basquete: /Lakers|Celtics|Knicks|Warriors|76ers|Heat|Thunder|Spurs|Real Madrid|Olympiacos|Panathinaikos|Fenerbahçe|Franca|Flamengo/
  };
  const slugar = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  ['futebol', 'basquete'].forEach(esp => {
    const cand = [];
    for (const c of window.COMPETICOES.filter(x => x.esporte === esp)) {
      const auto = ((window.AO_VIVO || {}).comps || {})[c.slug];
      const lista = (auto && auto.jogos && auto.jogos.length ? auto.jogos : c.jogos || []);
      for (const j of lista) {
        if (j.p || j.vivo || !j.d || !j.h || /a definir/i.test(j.casa + j.fora)) continue;
        const t = Date.parse(j.d + 'T' + j.h + ':00-03:00');
        if (t <= agora + 30 * 60e3 || t - agora > 7 * 864e5) continue;
        const peso = (GRANDES[esp].test(j.casa) ? 1 : 0) + (GRANDES[esp].test(j.fora) ? 1 : 0) + (/libertadores|copa-do-brasil|sul-americana/.test(c.slug) ? 1 : /champions|nba/.test(c.slug) ? .5 : 0) - (t - agora) / (30 * 864e5);
        cand.push({ c, j, t, peso });
      }
    }
    const g = cand.sort((a, b) => b.peso - a.peso)[0];
    if (!g || g.peso < 1) return;
    dados.push({
      id: 'jogo-' + g.c.slug + '-' + g.j.d + '-' + slugar(g.j.casa + '-' + g.j.fora),
      cat: g.c.slug, categoria: g.c.menu, etapa: g.j.casa + ' x ' + g.j.fora,
      pergunta: 'Quem vence ' + g.j.casa + ' x ' + g.j.fora + '?',
      opcoes: esp === 'futebol' ? [g.j.casa, 'Empate', g.j.fora] : [g.j.casa, g.j.fora],
      fecha: new Date(g.t).toISOString()
    });
  });
} catch (e) { console.log('enquete do futebol e do basquete: ' + e.message); }
const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
if (antes === JSON.stringify(dados)) { console.log('enquete: sem novidade'); process.exit(0); }
fs.writeFileSync(ARQ, JSON.stringify(dados));
dados.forEach(d => console.log('enquete:', d.pergunta, '|', d.opcoes.join(', '), '| fecha', d.fecha));
