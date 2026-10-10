/* Enquete do dia ("Quem vence?"): a próxima corrida da F1, da MotoGP ou da Stock Car (a que vier primeiro),
   com os 6 primeiros do campeonato e "Outro piloto". Grava assets/dados/enquete.json; o servidor das contas lê esse
   arquivo para conferir os votos (ações enquete_ver e enquete_votar). A votação fecha na hora da largada.
   Roda no GitHub (agenda.yml e f1-pos-corrida.yml) ou no PC: node .github/enquete.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/enquete.json');
global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
const CATS = ['formula-1', 'motogp', 'stock-car'];

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
const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
if (antes === JSON.stringify(dados)) { console.log('enquete: sem novidade'); process.exit(0); }
fs.writeFileSync(ARQ, JSON.stringify(dados));
dados.forEach(d => console.log('enquete:', d.pergunta, '|', d.opcoes.join(', '), '| fecha', d.fecha));
