/* Arquivo de notícias por categoria: guarda toda notícia que passou por assets/js/noticias-gerais.js
   (que só mantém os últimos 15 dias), para as páginas das categorias não ficarem vazias.
   Gera assets/dados/noticias-arquivo.js com até 40 notícias por categoria.
   Roda no GitHub quando as notícias mudam (agenda.yml). Com --historico, recupera também as versões antigas do arquivo pelo git. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets', 'dados', 'noticias-arquivo.js');
const POR_CAT = 40;

function ler(codigo) { const w = {}; try { new Function('window', codigo)(w); } catch (e) {} return w.NOTICIAS_GERAIS || []; }
const arquivo = {};
if (fs.existsSync(ARQ)) { const w = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(w); Object.assign(arquivo, w.NOTICIAS_ARQUIVO || {}); }

let fontes = [fs.readFileSync(path.join(RAIZ, 'assets', 'js', 'noticias-gerais.js'), 'utf8')];
if (process.argv.includes('--historico')) {
  const revs = execFileSync('git', ['log', '--format=%H', '--', 'assets/js/noticias-gerais.js'], { cwd: RAIZ, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  revs.forEach(r => { try { fontes.push(execFileSync('git', ['show', r + ':assets/js/noticias-gerais.js'], { cwd: RAIZ, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })); } catch (e) {} });
}
let novas = 0;
/* versões mais novas primeiro: se a mesma notícia foi corrigida depois, fica o texto corrigido */
fontes.forEach(cod => ler(cod).forEach(n => {
  if (!n || !n.cat || !n.t || !n.d) return;
  const lista = arquivo[n.cat] = arquivo[n.cat] || [];
  const chave = n.t.toLowerCase().trim();
  if (lista.some(x => x.t.toLowerCase().trim() === chave)) return;
  lista.push({ d: n.d, t: n.t, x: n.x || '', t_en: n.t_en || '', x_en: n.x_en || '' }); novas++;
}));
Object.keys(arquivo).forEach(c => { arquivo[c] = arquivo[c].sort((a, b) => a.d < b.d ? 1 : a.d > b.d ? -1 : 0).slice(0, POR_CAT); });
fs.writeFileSync(ARQ, '/* Gerado por .github/arquivar-noticias.js: notícias antigas de cada categoria. Não editar à mão. */\nwindow.NOTICIAS_ARQUIVO = ' + JSON.stringify(arquivo) + ';\n');
console.log('arquivo de notícias: ' + novas + ' novas; ' + Object.keys(arquivo).map(c => c + ' ' + arquivo[c].length).join(', '));
