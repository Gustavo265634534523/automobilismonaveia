/* Notícias automáticas dos três esportes: a cada 5 horas busca as manchetes nos feeds (RSS) de sites de esporte e no
   Google Notícias (uma busca por campeonato) e grava assets/dados/noticias-auto.js. No site entram só o título, um resumo
   curto e o link para a matéria original (abre no site da fonte). As notícias escritas à mão continuam valendo.
   Roda no GitHub (.github/workflows/noticias-auto.yml) ou no PC: node .github/noticias-auto.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/noticias-auto.js');
const RELATORIO = path.join(__dirname, 'noticias-auto-relatorio.txt');
const DIAS = 4, POR_COMP = 12;

/* campeonato do site -> busca no Google Notícias e palavras que identificam a notícia nos feeds gerais */
const COMPS = [
  { esporte: 'futebol', comp: 'brasileirao', busca: 'Brasileirão Série A', re: /brasileir[ãa]o|s[ée]rie a do brasileiro/i },
  { esporte: 'futebol', comp: 'copa-do-brasil', busca: '"Copa do Brasil"', re: /copa do brasil/i },
  { esporte: 'futebol', comp: 'libertadores', busca: 'Libertadores', re: /libertadores/i },
  { esporte: 'futebol', comp: 'sul-americana', busca: '"Sul-Americana"', re: /sul-americana|sudamericana/i },
  { esporte: 'futebol', comp: 'champions-league', busca: '"Champions League"', re: /champions/i },
  { esporte: 'futebol', comp: 'premier-league', busca: '"Premier League"', re: /premier league|campeonato ingl[êe]s/i },
  { esporte: 'futebol', comp: 'la-liga', busca: 'LaLiga Espanhol', re: /la ?liga|campeonato espanhol/i },
  { esporte: 'futebol', comp: 'bundesliga', busca: 'Bundesliga', re: /bundesliga|campeonato alem[ãa]o/i },
  { esporte: 'futebol', comp: 'serie-a', busca: '"Campeonato Italiano"', re: /campeonato italiano|serie a italiana|calcio/i },
  { esporte: 'futebol', comp: 'ligue-1', busca: '"Ligue 1" Francês', re: /ligue 1|campeonato franc[êe]s/i },
  { esporte: 'basquete', comp: 'nba', busca: 'NBA basquete', re: /\bnba\b/i },
  { esporte: 'basquete', comp: 'euroleague', busca: 'Euroliga basquete', re: /euroliga|euroleague/i },
  { esporte: 'basquete', comp: 'nbb', busca: 'NBB basquete', re: /\bnbb\b|novo basquete brasil/i },
  { esporte: 'automobilismo', comp: 'formula-1', busca: '"Fórmula 1" F1', re: /f[óo]rmula 1|\bf1\b/i }
];
/* feeds de sites de esporte (os que falharem são pulados e anotados no relatório) */
const FEEDS = [
  ['ge', 'https://ge.globo.com/rss/ge/futebol/', 'futebol'],
  ['ge', 'https://ge.globo.com/rss/ge/futebol/futebol-internacional/', 'futebol'],
  ['ge', 'https://ge.globo.com/rss/ge/basquete/', 'basquete'],
  ['ge', 'https://ge.globo.com/rss/ge/basquete/nba/', 'basquete'],
  ['ge', 'https://ge.globo.com/rss/ge/motor/formula-1/', 'automobilismo'],
  ['Grande Prêmio', 'https://www.grandepremio.com.br/feed/', 'automobilismo'],
  ['ESPN', 'https://www.espn.com.br/espn/rss/futebol/noticia', 'futebol'],
  ['ESPN', 'https://www.espn.com.br/espn/rss/nba/noticia', 'basquete'],
  ['ESPN', 'https://www.espn.com.br/espn/rss/f1/noticia', 'automobilismo']
];
/* fora do site: outras categorias do automobilismo e outros esportes que aparecem nos feeds */
const FORA = /onde assistir|assistir ao vivo|^ao vivo|que horas (é|e) o jogo|transmiss[ãa]o|transmite|\bnfl\b|futebol americano|super bowl|s[ée]rie [bcd]\b|f[óo]rmula 2|\bf2\b|f[óo]rmula e\b|motogp|moto2|stock car|indy|nascar|wec|le mans|porsche|rally|dakar|v[ôo]lei|t[êe]nis|ufc|mma|boxe|futsal|feminin|sub-\d\d|apostas?|palpite|odds|bet\b/i;

const limpar = s => String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();
const chave = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 70);
function tag(item, nome) { const m = item.match(new RegExp('<' + nome + '[^>]*>([\\s\\S]*?)</' + nome + '>', 'i')); return m ? m[1] : ''; }
function brasilia(data) { const t = new Date(Date.parse(data) - 3 * 3600e3).toISOString(); return { d: t.slice(0, 10), h: t.slice(11, 16) }; }

async function pedir(u) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'Accept-Language': 'pt-BR,pt' } });
      if (r.ok) return await r.text();
    } catch (e) { /* tenta de novo */ }
  }
  return null;
}
function itens(xml) { return (xml.match(/<item[\s\S]*?<\/item>/gi) || []).map(it => ({ t: limpar(tag(it, 'title')), link: limpar(tag(it, 'link')), data: limpar(tag(it, 'pubDate')) || limpar(tag(it, 'dc:date')), x: limpar(tag(it, 'description')), fonte: limpar(tag(it, 'source')) })); }

(async () => {
  const limite = Date.now() - DIAS * 864e5, todas = [], rel = [];
  const vistos = new Set();
  function guardar(n) {
    if (!n.t || !n.link || !/^https?:/.test(n.link) || FORA.test(n.t)) return;
    const quando = Date.parse(n.data); if (!quando || quando < limite || quando > Date.now() + 36e5) return;
    const k = chave(n.t); if (vistos.has(k)) return; vistos.add(k);
    const { d, h } = brasilia(n.data);
    let x = n.x && chave(n.x) !== chave(n.t) && !/^https?:/.test(n.x) ? n.x : '';
    if (x.length > 260) x = x.slice(0, 257).replace(/\s+\S*$/, '') + '…';
    todas.push({ d, h, esporte: n.esporte, comp: n.comp, t: n.t, x, fonte: n.fonte || '', link: n.link, q: quando });
  }
  /* 1. feeds dos sites (resumo melhor): classifica pelo texto */
  for (const [fonte, url, esporte] of FEEDS) {
    const xml = await pedir(url);
    const lista = xml ? itens(xml) : [];
    rel.push(fonte + ' ' + url + ': ' + (xml ? lista.length + ' itens' : 'falhou'));
    for (const it of lista) {
      const texto = it.t + ' ' + it.x;
      const c = COMPS.find(c => c.esporte === esporte && c.re.test(texto)) || (esporte === 'automobilismo' ? COMPS.find(c => c.comp === 'formula-1') : null);
      if (c) guardar(Object.assign(it, { esporte: c.esporte, comp: c.comp, fonte }));
    }
  }
  /* 2. Google Notícias, uma busca por campeonato (garante notícia de todos) */
  for (const c of COMPS) {
    const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(c.busca + ' when:2d') + '&hl=pt-BR&gl=BR&ceid=BR:pt-419';
    const xml = await pedir(url);
    const lista = xml ? itens(xml) : [];
    rel.push('Google Notícias ' + c.comp + ': ' + (xml ? lista.length + ' itens' : 'falhou'));
    for (const it of lista.slice(0, 25)) {
      /* o título vem como "Manchete - Nome do site" */
      const m = it.t.match(/^(.*)\s+-\s+([^-]{2,40})$/);
      if (m) { it.t = m[1]; it.fonte = it.fonte || m[2]; }
      it.x = ''; /* a descrição do Google é só a lista de links */
      guardar(Object.assign(it, { esporte: c.esporte, comp: c.comp }));
    }
  }
  /* no máximo POR_COMP por campeonato, as mais novas */
  todas.sort((a, b) => b.q - a.q);
  const conta = {}, final = todas.filter(n => (conta[n.comp] = (conta[n.comp] || 0) + 1) <= POR_COMP).map(n => { delete n.q; return n; });
  if (final.length < 5) { console.log('poucas notícias (' + final.length + '); mantém o arquivo anterior'); fs.writeFileSync(RELATORIO, rel.join('\n') + '\n'); return; }
  const dados = { atualizado: new Date().toISOString(), itens: final };
  fs.writeFileSync(ARQ, '/* Gerado por .github/noticias-auto.js a cada 5 horas: título, resumo curto e link para a matéria original. Não editar à mão. */\n' +
    'window.NOTICIAS_AUTO = ' + JSON.stringify(dados) + ';\n' +
    '/* junta às notícias do site (sem repetir título) e marca o link externo */\n' +
    '(function () {\n' +
    '  var A = window.NOTICIAS_AUTO.itens, E = window.NOTICIAS_ESPORTES, G = window.NOTICIAS_GERAIS, L = window.LINK_EXTERNO = window.LINK_EXTERNO || {};\n' +
    '  function k(t) { return String(t).toLowerCase().replace(/[^a-z0-9à-ú]+/g, " ").trim().slice(0, 60); }\n' +
    '  var tem = {}; (E || []).concat(G || []).forEach(function (n) { tem[k(n.t)] = 1; });\n' +
    '  A.forEach(function (n) {\n' +
    '    if (tem[k(n.t)]) return; tem[k(n.t)] = 1; L[n.t] = n.link;\n' +
    '    var x = n.x || (n.fonte ? "Leia a matéria completa no " + n.fonte + "." : "Leia a matéria completa na fonte.");\n' +
    '    if (n.esporte === "automobilismo") { if (G) G.push({ d: n.d, cat: n.comp, t: n.t, x: x, link: n.link, fonte: n.fonte }); }\n' +
    '    else if (E) E.push({ d: n.d, esporte: n.esporte, comp: n.comp, t: n.t, x: x, link: n.link, fonte: n.fonte });\n' +
    '  });\n' +
    '})();\n');
  fs.writeFileSync(RELATORIO, rel.join('\n') + '\nnotícias gravadas: ' + final.length + '\n');
  console.log('notícias automáticas:', final.length, Object.entries(conta).map(([k, v]) => k + ' ' + Math.min(v, POR_COMP)).join(', '));
})();
