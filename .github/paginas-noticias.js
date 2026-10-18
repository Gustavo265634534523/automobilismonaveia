/* Uma página própria para cada notícia (noticia-<titulo>.html), para o Google mostrar cada notícia nas buscas e no Google Notícias.
   Junta assets/js/noticias-gerais.js, assets/dados/noticias-arquivo.js e as notícias de cada categoria (assets/js/dados.js).
   O endereço sai do título (o mesmo cálculo de window.linkNoticia em assets/js/site.js). Páginas antigas não são apagadas.
   Roda no GitHub quando as notícias mudam (.github/workflows/agenda.yml) e no PC: node .github/paginas-noticias.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const SITE = 'https://automobilismonaveia.com.br/';
global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/noticias-gerais.js'), 'utf8'));
eval(fs.readFileSync(path.join(RAIZ, 'assets/dados/noticias-arquivo.js'), 'utf8'));
eval(fs.readFileSync(path.join(RAIZ, 'assets/dados/fotos-reais.js'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const V = (fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8').match(/naveia-v(\d+)/) || [])[1] || '1';
const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
const CATS = window.CATEGORIAS, PORSLUG = {};
CATS.forEach(c => { PORSLUG[c.slug] = c; });

/* mesmo cálculo de window.linkNoticia (assets/js/site.js) */
const slugTexto = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const arquivo = t => 'noticia-' + slugTexto(t).slice(0, 80).replace(/-+$/, '') + '.html';
const SEMLONGO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESLONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dataLonga = iso => SEMLONGO[new Date(iso + 'T12:00:00Z').getUTCDay()] + ', ' + (+iso.slice(8)) + ' de ' + MESLONGO[+iso.slice(5, 7) - 1] + ' de ' + iso.slice(0, 4);
/* página de horário da próxima etapa da categoria (feita por .github/paginas-horarios.js), se existir */
const horarioProx = c => {
  const e = (c.calendario || []).filter(x => !x.venc && x.d && x.d >= hoje)[0];
  if (!e) return null;
  const a = 'horario-' + c.slug + '-' + slugTexto(e.n) + '-' + e.d.slice(0, 4) + '.html';
  return fs.existsSync(path.join(RAIZ, a)) ? { a, n: e.n } : null;
};

/* todas as notícias, sem repetir título; a versão mais nova do texto vence */
const todas = [], vistos = {};
function add(n, cat) {
  if (!n || !n.t || !n.d || !PORSLUG[cat]) return;
  const k = n.t.toLowerCase().trim();
  if (vistos[k]) return;
  vistos[k] = 1;
  todas.push({ d: n.d, cat, t: n.t, x: n.x || '' });
}
(window.NOTICIAS_GERAIS || []).forEach(n => add(n, n.cat));
CATS.forEach(c => (c.noticias || []).forEach(n => add(n, c.slug)));
Object.keys(window.NOTICIAS_ARQUIVO || {}).forEach(cat => window.NOTICIAS_ARQUIVO[cat].forEach(n => add(n, cat)));
todas.sort((a, b) => a.d < b.d ? 1 : a.d > b.d ? -1 : 0);

const CSS = `<style>
.nw-pag { padding: calc(var(--topo) + 34px) 0 70px; }
.nw-pag .moldura { max-width: 860px; }
.nw-trilha { font-size: 14px; color: var(--aco); margin: 0 0 14px; }
.nw-trilha a { color: var(--aco); }
.nw-rot { margin: 0 0 8px; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--sangue-vivo); }
.nw-rot a { color: inherit; text-decoration: none; }
.nw-pag h1 { margin: 0 0 18px; font-family: var(--display); font-weight: 400; font-size: clamp(30px, 4.4vw, 48px); line-height: 1.08; }
.nw-foto { position: relative; margin: 0 0 24px; aspect-ratio: 16 / 8; overflow: hidden; background: #000; }
.nw-foto img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: .9; }
.nw-foto figcaption a { color: inherit; }
.nw-foto figcaption { position: absolute; right: 8px; bottom: 6px; padding: 2px 8px; background: rgba(0, 0, 0, .6); font-size: 11px; color: #c3c8cd; }
.nw-texto p { margin: 0 0 18px; font-size: 19px; line-height: 1.65; color: #d3d8dc; }
.nw-acoes { display: flex; flex-wrap: wrap; gap: 10px; margin: 28px 0 0; }
.nw-acoes a { padding: 11px 16px; border: 1px solid var(--linha); color: var(--cromo); text-decoration: none; font-weight: 700; }
.nw-acoes a:first-child { background: var(--sangue); border-color: var(--sangue); color: #fff; }
.nw-acoes a:hover { border-color: var(--sangue-vivo); }
.nw-mais { margin-top: 40px; }
.nw-mais h2 { margin: 0 0 12px; font-size: 21px; }
.nw-mais ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.nw-mais a { display: block; padding: 12px 14px; background: var(--carbono); border: 1px solid var(--linha); border-left: 3px solid var(--sangue-vivo); color: var(--cromo); text-decoration: none; font-weight: 700; }
.nw-mais a small { display: block; margin-bottom: 3px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--aco); }
.nw-mais a:hover { border-color: var(--sangue-vivo); }
</style>`;

/* texto em parágrafos de duas frases */
function paragrafos(x) {
  const frases = x.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“])/);
  const out = [];
  for (let i = 0; i < frases.length; i += 2) out.push(frases.slice(i, i + 2).join(' '));
  return out.map(p => '<p>' + esc(p) + '</p>').join('\n      ');
}

let feitas = 0;
const nomes = new Set();
todas.forEach(n => {
  const arq = arquivo(n.t);
  if (nomes.has(arq)) return;
  nomes.add(arq);
  const c = PORSLUG[n.cat], cat = c.menu || c.nome;
  /* foto real da categoria (licença livre, com crédito); sem ela, a imagem gerada */
  const fr = window.fotoNoticia ? window.fotoNoticia(n.cat, n.t) : (window.FOTOS_REAIS || {})[n.cat];
  const foto = fr ? (fr.jpg || fr.grande) : (c.foto || 'assets/img/compartilhar.jpg');
  const legenda = fr && fr.autor ? `<a href="creditos-fotos.html">Foto: ${esc(fr.autor)} · ${esc(fr.lic)} · Wikimedia Commons</a>` : 'Imagem ilustrativa do Na Veia';
  const desc = n.x.length > 158 ? n.x.slice(0, 155).replace(/\s+\S*$/, '') + '…' : n.x;
  const hp = horarioProx(c);
  const mais = todas.filter(o => o !== n && o.cat === n.cat).slice(0, 5);
  const ld = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: n.t.slice(0, 110), description: desc,
    datePublished: n.d + 'T08:00:00-03:00', dateModified: n.d + 'T08:00:00-03:00', inLanguage: 'pt-BR',
    image: [SITE + foto], articleSection: c.nome, mainEntityOfPage: SITE + arq,
    author: { '@type': 'Organization', name: 'Automobilismo Na Veia', url: SITE },
    publisher: { '@type': 'Organization', name: 'Automobilismo Na Veia', logo: { '@type': 'ImageObject', url: SITE + 'assets/app/icone-512.png' } }
  };
  const migalhas = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Notícias', item: SITE + 'noticias.html' },
    { '@type': 'ListItem', position: 3, name: c.nome, item: SITE + c.slug + '.html' }] };
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="assets/js/idioma.js?v=${V}"></script>
<title>${esc(n.t)} | Na Veia</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#141619">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="assets/app/apple-touch-icon.png">
<link rel="canonical" href="${SITE}${arq}">
<meta property="og:title" content="${esc(n.t)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}${esc(foto)}">
<meta property="og:url" content="${SITE}${arq}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Automobilismo Na Veia">
<meta property="og:locale" content="pt_BR">
<meta property="article:published_time" content="${n.d}T08:00:00-03:00">
<meta property="article:section" content="${esc(c.nome)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/estilo.css?v=${V}">
${CSS}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<script type="application/ld+json">${JSON.stringify(migalhas).replace(/</g, '\\u003c')}</script>
</head>
<body data-pagina="noticia" data-cat="${c.slug}">
<a class="pular" href="#nw">Pular para o conteúdo</a>
<header id="topo"></header>
<main class="nw-pag" id="nw">
  <div class="moldura">
    <p class="nw-trilha"><a href="./">Início</a> › <a href="noticias.html">Notícias</a> › <a href="${c.slug}.html">${esc(c.nome)}</a></p>
    <article>
      <p class="nw-rot"><a href="${c.slug}.html">${esc(cat)}</a> · <time datetime="${n.d}">${esc(dataLonga(n.d))}</time></p>
      <h1>${esc(n.t)}</h1>
      <figure class="nw-foto"><img src="${esc(foto)}" alt="" fetchpriority="high"><figcaption>${legenda}</figcaption></figure>
      <div class="nw-texto">
      ${paragrafos(n.x)}
      </div>
    </article>
    <div class="nw-acoes"><a href="${c.slug}.html">Tudo sobre ${esc(c.nome)}</a>${hp ? `<a href="${hp.a}">Horário: ${esc(hp.n)}</a>` : ''}<a href="noticias.html">Todas as notícias</a><a href="onde-assistir.html">Onde assistir</a></div>
    ${mais.length ? `<section class="nw-mais"><h2>Mais notícias de ${esc(c.nome)}</h2><ul>${mais.map(o => `<li><a href="${arquivo(o.t)}"><small>${esc(dataLonga(o.d))}</small>${esc(o.t)}</a></li>`).join('')}</ul></section>` : ''}
  </div>
</main>
<footer id="rodape"></footer>
<script src="assets/js/dados.js?v=${V}"></script>
<script src="assets/js/site.js?v=${V}"></script>
</body>
</html>
`;
  const p = path.join(RAIZ, arq);
  if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== html) { fs.writeFileSync(p, html); feitas++; }
});

/* sitemap: troca o bloco das páginas de notícia */
const SM = path.join(RAIZ, 'sitemap.xml');
const lista = todas.filter((n, i, a) => a.findIndex(o => arquivo(o.t) === arquivo(n.t)) === i);
let xml = fs.readFileSync(SM, 'utf8').replace(/\s*<url><loc>[^<]*\/noticia-[^<]*<\/loc>.*?<\/url>/g, '');
const bloco = lista.map(n => `  <url><loc>${SITE}${arquivo(n.t)}</loc><lastmod>${n.d}</lastmod></url>`).join('\n');
xml = xml.replace('</urlset>', bloco + '\n</urlset>');
fs.writeFileSync(SM, xml);
console.log('páginas de notícia:', lista.length, '| novas ou mudadas:', feitas);
