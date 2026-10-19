/* Atualiza a data (lastmod) das páginas que mudam todo dia no sitemap.xml, para o Google voltar a ler.
   Roda no GitHub quando as notícias ou os resultados mudam (.github/workflows/agenda.yml). */
const fs = require('fs');
const path = require('path');
const ARQ = path.join(__dirname, '..', 'sitemap.xml');
const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
const DIARIAS = /\/(|noticias|formula-1|formula-2|formula-e|motogp|porsche-cup|endurance|inicio|automobilismo|futebol|basquete|brasileirao|libertadores|sul-americana|champions-league|premier-league|la-liga|bundesliga|serie-a|ligue-1|nba|euroleague|nbb)(\.html)?<\/loc>/;
const xml = fs.readFileSync(ARQ, 'utf8').replace(/<url><loc>([^<]*)<\/loc><lastmod>[^<]*<\/lastmod>/g, function (linha, loc) {
  return DIARIAS.test(loc.replace('https://automobilismonaveia.com.br', '') + '</loc>') ? '<url><loc>' + loc + '</loc><lastmod>' + hoje + '</lastmod>' : linha;
});
fs.writeFileSync(ARQ, xml);
console.log('sitemap', hoje);
