/* Pole positions da temporada de cada categoria do site: assets/dados/poles.js (window.POLES).
   Fonte: as tabelas de resultados dos artigos da temporada na Wikipédia (coluna "Pole position"), lidas rodada a rodada
   e ligadas às etapas do calendário do site (dados.js) pelo número da rodada.
   Roda no GitHub quando os resultados mudam (agenda.yml) ou no PC: node .github/poles.js
   Se uma categoria não vier (artigo mudou, sem internet), fica a lista que já estava salva. */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/poles.js');
global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
const espera = ms => new Promise(r => setTimeout(r, ms));

/* artigo da temporada de cada categoria (en = Wikipédia em inglês; pt = em português) */
const ARTIGOS = {
  'formula-1': 'en:2026 Formula One World Championship',
  'formula-2': 'en:2026 FIA Formula 2 Championship',
  'formula-3': 'en:2026 FIA Formula 3 Championship',
  'formula-e': 'en:2025–26 Formula E World Championship',
  'indycar': 'en:2026 IndyCar Series',
  'nascar': 'en:2026 NASCAR Cup Series',
  'dtm': 'en:2026 Deutsche Tourenwagen Masters',
  'superbike': 'en:2026 Superbike World Championship',
  'endurance': 'en:2026 FIA World Endurance Championship',
  'imsa': 'en:2026 IMSA SportsCar Championship',
  'motogp': 'en:2026 MotoGP World Championship',
  'stock-car': 'pt:Temporada da Stock Car Pro Series de 2026'
};

const FIXAS = {
  /* WEC: Hyperpole da Hypercar (Fuji: classificação cancelada pela chuva, grid pelo treino) */
  'endurance': { 1: ['Antonio Giovinazzi (Ferrari #51)', 'ITA'], 2: ['Malthe Jakobsen (Peugeot #94)', 'DEN'], 3: ['Dries Vanthoor (BMW #15)', 'BEL'],
    4: ['Will Stevens (Cadillac #12)', 'GBR'], 5: ['Antonio Giovinazzi (Ferrari #51)', 'ITA'], 6: ['Alpine #36 (grid pelo treino, chuva)', ''] },
  /* IMSA: pole geral (GTP). Daytona: o mais rápido (Aitken) perdeu a pole na vistoria */
  'imsa': { 2: ['Jack Aitken (Cadillac #31)', 'GBR'], 3: ['Nick Yelloly (Acura #93)', 'GBR'], 4: ['Louis Delétraz (Cadillac #40)', 'SUI'],
    5: ['Earl Bamber (Cadillac #31)', 'NZL'], 6: ['Jack Aitken (Cadillac #31)', 'GBR'], 7: ['Nick Yelloly (Acura #93)', 'GBR'],
    8: ['Tom Blomqvist (Acura #60)', 'GBR'], 9: ['Tom Blomqvist (Acura #60)', 'GBR'] },
  'le-mans': { 1: ['Dries Vanthoor (BMW #15)', 'BEL'] }
};

async function wikitexto(ref) {
  const [lang, titulo] = [ref.slice(0, 2), ref.slice(3)];
  const u = 'https://' + lang + '.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&redirects=1&page=' + encodeURIComponent(titulo);
  for (let t = 0; t < 4; t++) {
    const r = await fetch(u, { headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br; robô das poles)' } }).catch(() => null);
    const txt = r ? await r.text() : '';
    try { const j = JSON.parse(txt); return j.parse ? j.parse.wikitext['*'] : null; } catch (e) { await espera(8000 * (t + 1)); }
  }
  return null;
}

/* texto limpo de uma célula: tira predefinições ({{...}}), notas (<ref>), e deixa só o nome dos links */
function limpa(c) {
  let s = c;
  for (let i = 0; i < 4; i++) s = s.replace(/\{\{(?:efn|refn|ref|cn|citation needed|notetag|note|sfn|r)\b[^{}]*\}\}/gi, '');
  s = s.replace(/<ref[^>]*\/>/g, '').replace(/<ref[\s\S]*?<\/ref>/g, '').replace(/<br\s*\/?>/g, ' / ').replace(/<[^>]+>/g, '');
  for (let i = 0; i < 4; i++) s = s.replace(/\{\{(?:flagicon|flag icon|flagdeco|flagathlete)[^{}]*\}\}/gi, '');
  s = s.replace(/\{\{sortname\|([^|{}]*)\|([^|{}]*)[^{}]*\}\}/gi, '$1 $2');
  s = s.replace(/\{\{(?:nowrap|small|tooltip|abbr)\|([^{}|]*)(\|[^{}]*)?\}\}/gi, '$1');
  s = s.replace(/\{\{[^{}]*\}\}/g, '');
  s = s.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/'''?/g, '');
  return s.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

/* lê uma wikitable em grade (respeita rowspan e colspan) */
function grade(tab) {
  const linhas = tab.split(/\n\|-[^\n]*/).map(l => l.trim()).filter(Boolean);
  const G = [], pend = {}; /* pend[col] = { txt, resta } */
  linhas.forEach((l, li) => {
    if (li === 0 && /^class=|^style=/.test(l) && !/\n[|!]/.test('\n' + l.split('\n').slice(1).join('\n'))) return;
    const cels = [];
    l.split('\n').forEach(ln => {
      if (!/^[|!]/.test(ln) || /^\|\+/.test(ln) || /^\{\|/.test(ln)) {
        if (cels.length && !/^[|!]/.test(ln)) cels[cels.length - 1].txt += ' ' + ln; /* célula em várias linhas */
        return;
      }
      const cab = ln[0] === '!';
      ln.slice(1).split(cab ? /!!|\|\|/ : /\|\|/).forEach(parte => {
        let atr = '', txt = parte;
        const m = parte.match(/^([^|[\]{}]*?(?:rowspan|colspan|style|class|nowrap|align|bgcolor|scope|width|data-sort-value)[^|[\]{}]*)\|(?!\|)([\s\S]*)$/i);
        if (m) { atr = m[1]; txt = m[2]; }
        const rs = +((atr.match(/rowspan\s*=\s*"?(\d+)/i) || [])[1] || 1), cs = +((atr.match(/colspan\s*=\s*"?(\d+)/i) || [])[1] || 1);
        cels.push({ txt, rs, cs, cab });
      });
    });
    if (li === 0 && !cels.length) return;
    const row = [];
    let col = 0;
    const poe = () => { while (pend[col] && pend[col].resta > 0) { row[col] = pend[col].txt; pend[col].resta--; col++; } };
    cels.forEach(c => {
      poe();
      for (let k = 0; k < c.cs; k++) {
        row[col] = c.txt;
        if (c.rs > 1) pend[col] = { txt: c.txt, resta: c.rs - 1 };
        col++;
      }
    });
    poe();
    if (row.length) G.push(row.map(x => (x == null ? '' : x)));
  });
  return G;
}

/* acha a tabela de resultados com a coluna de pole e devolve [{ rodada, prova, pole }] */
function poles(w, so1) {
  const tabelas = w.split(/\n\{\|/).slice(1).map(x => x.split(/\n\|\}/)[0]);
  let melhor = [];
  tabelas.forEach(t => {
    if (!/pole/i.test(t)) return;
    const G = grade(t);
    let hi = -1, cp = -1;
    for (let i = 0; i < Math.min(4, G.length) && cp < 0; i++) {
      G[i].forEach((c, j) => { if (cp < 0 && /^pole/i.test(limpa(c))) { cp = j; hi = i; } });
    }
    if (cp < 0) return;
    const lista = [];
    G.slice(hi + 1).forEach(r => {
      const ord = String(r[0] || '').match(/\{\{sort\|0*(\d+)/i), rod = ord ? +ord[1] : parseInt(limpa(r[0] || ''), 10);
      const pole = limpa(r[cp] || '').split(' | ')[0].trim(); /* "A | B": a segunda é nota (quem herdou a pole) */
      if (!rod || !pole || /^(tbd|tba|—|–|-|n\/a|cancelled|canceled|not held)$/i.test(pole) || /^\d+$/.test(pole)) return;
      if (/race|circuit|round|pole|driver/i.test(pole) && pole.length < 14) return;
      const prova = limpa(r[1] || '') + (r[2] ? ' · ' + limpa(r[2]) : '');
      const pais = (String(r[cp] || '').match(/\{\{flag(?:icon|deco)?\|([A-Za-z]{3})/i) || [])[1];
      lista.push({ rodada: rod, prova, pole, pais: pais ? pais.toUpperCase() : '' });
    });
    if (lista.length > melhor.length) melhor = lista;
  });
  /* fins de semana com mais de uma corrida: junta as poles da rodada. Se são diferentes, mostra cada corrida
     ("Corrida 1: A · Corrida 2: B"); com grid invertido (Stock Car) só vale a primeira */
  const porRodada = {};
  melhor.forEach(p => { (porRodada[p.rodada] = porRodada[p.rodada] || []).push(p); });
  return Object.keys(porRodada).map(k => {
    const l = porRodada[k], nomes = [];
    l.forEach(p => { if (nomes.indexOf(p.pole) < 0) nomes.push(p.pole); });
    let pole = nomes[0];
    if (!so1 && nomes.length > 1) pole = l.map((p, i) => 'Corrida ' + (i + 1) + ': ' + p.pole).join(' · ');
    return { rodada: +k, prova: l[0].prova, pole, pais: nomes.length === 1 || so1 ? l[0].pais : '' };
  }).sort((a, b) => a.rodada - b.rodada);
}

(async () => {
  let antigo = {};
  if (fs.existsSync(ARQ)) { global.window = {}; eval(fs.readFileSync(ARQ, 'utf8')); antigo = window.POLES || {}; }
  global.window = {}; eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
  const saida = {};
  for (const slug of Object.keys(ARTIGOS)) {
    const c = window.CATEGORIAS.find(x => x.slug === slug);
    if (!c) continue;
    const w = await wikitexto(ARTIGOS[slug]);
    await espera(4000);
    const lista = w ? poles(w, slug === 'stock-car') : [];
    if (!lista.length) { if (antigo[slug]) saida[slug] = antigo[slug]; console.log(slug, '| sem tabela de pole' + (antigo[slug] ? ' (mantida a anterior)' : '')); continue; }
    /* liga às etapas do site pelo número da rodada (só as que já aconteceram) */
    const etapas = lista.map(p => {
      const e = c.calendario.find(x => x.e === p.rodada);
      if (!e || !e.venc) return null;
      if (process.env.CONFERIR) console.log('   ', slug, p.rodada, '| wiki:', p.prova.slice(0, 50), '| site:', e.n, e.l, '| pole:', p.pole);
      return { e: e.e, n: e.n, l: e.l, d: e.d, pole: p.pole.replace(/\s*\/\s*/g, ' / '), pais: p.pais || '' };
    }).filter(Boolean);
    if (!etapas.length) { if (antigo[slug]) saida[slug] = antigo[slug]; continue; }
    saida[slug] = etapas;
    console.log(slug, '|', etapas.length, 'poles | última:', etapas[etapas.length - 1].n, '->', etapas[etapas.length - 1].pole);
  }
  for (const slug of Object.keys(FIXAS)) {
    if (saida[slug] && saida[slug].length) continue;
    const c = window.CATEGORIAS.find(x => x.slug === slug);
    if (!c) continue;
    saida[slug] = c.calendario.filter(e => e.venc && FIXAS[slug][e.e]).map(e => ({ e: e.e, n: e.n, l: e.l, d: e.d, pole: FIXAS[slug][e.e][0], pais: FIXAS[slug][e.e][1] }));
    console.log(slug, '|', saida[slug].length, 'poles (lista fixa)');
  }
  fs.writeFileSync(ARQ, '/* Gerado por .github/poles.js (tabelas da Wikipédia). Não editar à mão. */\nwindow.POLES = ' + JSON.stringify(saida) + ';\nwindow.POLES_ATUALIZADO = ' + JSON.stringify(new Date().toISOString().slice(0, 10)) + ';\n');
  console.log('poles: ' + Object.keys(saida).length + ' categorias');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
