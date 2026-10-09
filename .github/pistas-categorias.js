/* Mapa da próxima pista de cada categoria (menos a F1, que tem o mapa completo em pista-proxima.js): assets/dados/pistas-categorias.json.
   1) Pista que também recebe a F1 (Interlagos, Barcelona, Lusail...): traçado oficial e curvas numeradas do api.multiviewer.app.
   2) As outras: traçado real do OpenStreetMap (vias highway=raceway perto da pista), sem curvas numeradas.
   Só refaz a categoria quando a próxima etapa muda. Roda no GitHub (f1-pos-corrida.yml) ou no PC: node .github/pistas-categorias.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/pistas-categorias.json');
global.window = {};
['assets/js/dados.js', 'assets/js/locais-pistas.js', 'assets/js/previa-pistas.js'].forEach(f => eval(fs.readFileSync(path.join(RAIZ, f), 'utf8')));
const espera = ms => new Promise(r => setTimeout(r, ms));
const VERSAO = 1;

/* tamanho oficial da volta (km), para escolher o traçado certo quando a pista tem mais de um (oval x misto, por exemplo) */
const KM = { 'Mandalika': 4.31, 'Goiânia (GO)': 3.835, 'Alemanha': 4.574, 'Portugal': 4.182, 'Charlotte': 2.414, 'Montmeló': 4.657, 'Interlagos (SP)': 4.309 };

async function json(url, opc) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, Object.assign({ headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)' } }, opc || {})).catch(() => null);
    if (r && r.ok) { const j = await r.json().catch(() => null); if (j) return j; } /* servidor ocupado responde texto: tenta de novo */
    if (r && r.status === 404) return null;
    await espera(2000 * (t + 1));
  }
  return null;
}
const dist = (a, b) => { const k = Math.cos(a[1] * Math.PI / 180) * 111320; return Math.hypot((a[0] - b[0]) * k, (a[1] - b[1]) * 110540); }; /* [lon, lat] em metros */
const linha = l => 'M' + l.map(p => p[0] + ' ' + p[1]).join('L');

/* tudo dentro de um quadro de 400 x 400 (y para cima) */
function quadro(trilha, extras) {
  const todos = trilha.concat(extras || []);
  const xs = todos.map(p => p[0]), ys = todos.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const esc = 384 / Math.max(x1 - x0, y1 - y0), ox = (400 - (x1 - x0) * esc) / 2, oy = (400 - (y1 - y0) * esc) / 2;
  return p => [+(ox + (p[0] - x0) * esc).toFixed(1), +(oy + (y1 - p[1]) * esc).toFixed(1)];
}

/* ---------- 1) pista da F1: multiviewer ---------- */
let reunioes = null;
async function pistaF1(e, loc) {
  const PP = window.PREVIA_PISTAS || {};
  const chave = Object.keys(PP).find(k => PP[k].lat && dist([PP[k].lon, PP[k].lat], [loc.lon, loc.lat]) < 4000);
  if (!chave) return null;
  const f1 = window.CATEGORIAS.find(c => c.slug === 'formula-1');
  const ev = f1.calendario.filter(x => x.l === chave && x.d).pop();
  if (!ev) return null;
  const ano = +ev.d.slice(0, 4);
  reunioes = reunioes || {};
  if (!reunioes[ano]) { reunioes[ano] = (await json('https://api.openf1.org/v1/meetings?year=' + ano)) || []; await espera(600); }
  const alvo = Date.parse(ev.d + 'T12:00:00Z');
  const m = reunioes[ano].filter(r => Math.abs(Date.parse(r.date_start) - alvo) < 5 * 864e5)[0];
  if (!m) return null;
  let mv = await json('https://api.multiviewer.app/api/v1/circuits/' + m.circuit_key + '/' + ano);
  if (!mv || !mv.x) mv = await json('https://api.multiviewer.app/api/v1/circuits/' + m.circuit_key + '/' + (ano - 1));
  if (!mv || !mv.x) return null;
  const ang = (mv.rotation || 0) * Math.PI / 180, cs = Math.cos(ang), sn = Math.sin(ang);
  const gira = (x, y) => [x * cs - y * sn, x * sn + y * cs];
  const trilha = mv.x.map((x, i) => gira(x, mv.y[i]));
  const curvas = (mv.corners || []).map(c => {
    const a = (c.angle || 0) * Math.PI / 180, d = 520;
    return { n: String(c.number) + (c.letter || ''), p: gira(c.trackPosition.x, c.trackPosition.y), t: gira(c.trackPosition.x + d * Math.cos(a), c.trackPosition.y + d * Math.sin(a)) };
  });
  const P = quadro(trilha, curvas.map(c => c.t));
  return { fonte: 'f1', circuito: mv.circuitName || m.circuit_short_name, d: linha(trilha.map(P)) + 'Z', curvas: curvas.map(c => ({ n: c.n, p: P(c.p), t: P(c.t) })) };
}

/* ---------- 2) OpenStreetMap ---------- */
async function pistaOSM(e, loc, kmAlvo) {
  const q = '[out:json][timeout:60];way["highway"="raceway"](around:3500,' + loc.lat + ',' + loc.lon + ');out body geom;';
  const j = await json('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)', 'Content-Type': 'application/x-www-form-urlencoded' } });
  if (!j || !j.elements) return null;
  const vias = j.elements.filter(w => w.geometry && w.geometry.length > 1 && !/pit|box|kart|paddock|drag|test/i.test((w.tags.name || '') + ' ' + (w.tags.service || '')))
    .map(w => { const g = w.geometry.map(p => [p.lon, p.lat]); let m = 0; for (let i = 1; i < g.length; i++) m += dist(g[i - 1], g[i]); return { id: w.id, nos: w.nodes, g, m }; });
  if (!vias.length) return null;
  /* corta as vias nos cruzamentos (onde uma via encosta no meio de outra), para dar para juntar os pedaços certos */
  const usos = {}; vias.forEach(v => v.nos.forEach(n => { usos[n] = (usos[n] || 0) + 1; }));
  const pedacos = [];
  vias.forEach(v => {
    let ini = 0;
    for (let i = 1; i < v.nos.length; i++) {
      if (i === v.nos.length - 1 || usos[v.nos[i]] > 1) {
        const g = v.g.slice(ini, i + 1); let m = 0; for (let k = 1; k < g.length; k++) m += dist(g[k - 1], g[k]);
        pedacos.push({ id: v.id + '_' + ini, nos: v.nos.slice(ini, i + 1), g, m }); ini = i;
      }
    }
  });
  vias.length = 0; pedacos.forEach(p => vias.push(p));
  /* volta fechada: procura, juntando as vias pelas pontas, o circuito com o tamanho mais perto do oficial */
  const alvo = (kmAlvo || 0) * 1000, teto = alvo ? alvo * 1.12 : 15000;
  const porNo = {};
  vias.forEach(v => [v.nos[0], v.nos[v.nos.length - 1]].forEach(n => (porNo[n] = porNo[n] || []).push(v)));
  let melhor = null, contas = 0;
  function nota(m) { return alvo ? Math.abs(m - alvo) : -m; }
  function busca(inicio, no, m, usadas, trechos) {
    if (++contas > 300000) return;
    if (no === inicio && trechos.length) { if (m > 1200 && (!melhor || nota(m) < nota(melhor.m))) melhor = { m, trechos: trechos.slice() }; return; }
    (porNo[no] || []).forEach(v => {
      if (usadas.has(v.id) || m + v.m > teto) return;
      const certo = v.nos[0] === no;
      usadas.add(v.id); trechos.push({ v, certo });
      busca(inicio, certo ? v.nos[v.nos.length - 1] : v.nos[0], m + v.m, usadas, trechos);
      usadas.delete(v.id); trechos.pop();
    });
  }
  vias.forEach(v => {
    if (v.nos[0] === v.nos[v.nos.length - 1]) { if (v.m > 1200 && v.m < teto && (!melhor || nota(v.m) < nota(melhor.m))) melhor = { m: v.m, trechos: [{ v, certo: true }] }; return; }
    busca(v.nos[0], v.nos[v.nos.length - 1], v.m, new Set([v.id]), [{ v, certo: true }]);
  });
  if (!melhor) return null;
  if (alvo && Math.abs(melhor.m - alvo) > alvo * 0.12) return null; /* traçado muito diferente do oficial: melhor não mostrar */
  let g = [];
  melhor.trechos.forEach(t => { const gg = t.certo ? t.v.g : t.v.g.slice().reverse(); g = g.concat(g.length ? gg.slice(1) : gg); });
  const v = { g, m: melhor.m };
  const k = Math.cos(loc.lat * Math.PI / 180) * 111320;
  const trilha = v.g.map(p => [p[0] * k, p[1] * 110540]);
  const P = quadro(trilha);
  return { fonte: 'osm', km: +(v.m / 1000).toFixed(3), d: linha(trilha.map(P)) + 'Z' };
}

(async () => {
  const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
  const antes = fs.existsSync(ARQ) ? JSON.parse(fs.readFileSync(ARQ, 'utf8')) : {};
  const saida = {}, L = window.LOCAIS_PISTAS || {}, PP = window.PREVIA_PISTAS || {};
  let mudou = false;
  for (const c of window.CATEGORIAS) {
    if (c.slug === 'formula-1') continue;
    const e = c.calendario.find(x => !x.venc && x.d && x.d >= hoje);
    if (!e) continue;
    const loc = L[c.slug + '|' + e.n] || L[e.l] || PP[e.l];
    if (!loc) continue;
    const velho = antes[c.slug];
    /* já feito para esta etapa (se não deu da última vez, tenta de novo depois de 6 horas) */
    if (velho && velho.versao === VERSAO && velho.etapa === e.n && (velho.d || Date.now() - (velho.quando || 0) < 6 * 36e5)) { saida[c.slug] = velho; continue; }
    let mapa = null;
    try { mapa = await pistaF1(e, loc); } catch (er) { console.log(c.slug, 'multiviewer: erro', er.message); }
    if (!mapa) { await espera(1500); try { mapa = await pistaOSM(e, loc, KM[e.l] || (PP[e.l] && PP[e.l].km)); } catch (er) { console.log(c.slug, 'osm: erro', er.message); } }
    mudou = true;
    if (!mapa) { console.log(c.slug, '|', e.n, '| sem mapa'); saida[c.slug] = { versao: VERSAO, etapa: e.n, d: null, quando: Date.now() }; continue; }
    saida[c.slug] = Object.assign({ versao: VERSAO, etapa: e.n }, mapa);
    console.log(c.slug, '|', e.n, '|', mapa.fonte, mapa.circuito || '', mapa.km ? mapa.km + ' km' : '', mapa.curvas ? mapa.curvas.length + ' curvas' : '');
    await espera(1500);
  }
  if (!mudou && Object.keys(saida).length === Object.keys(antes).length) { console.log('pistas-categorias: sem novidade'); return; }
  fs.writeFileSync(ARQ, JSON.stringify(saida));
  console.log('pistas-categorias: ' + Object.keys(saida).length + ' categorias');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
