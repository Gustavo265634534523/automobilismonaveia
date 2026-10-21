/* Números da temporada do futebol, jogo a jogo, pelos resumos dos jogos na ESPN:
   - assets/dados/temporada-futebol.js: cada jogador com jogos, gols, assistências, chutes, cartões e defesas, por
     campeonato (página Comparar jogadores);
   - assets/dados/destaques-futebol.js: a seleção da rodada do Brasileirão e os brasileiros na Europa (a semana de cada
     um e os que mais fizeram gol e assistência na temporada).
   Na primeira vez varre a temporada inteira (um pedido por dia e por campeonato); depois só os últimos dias. O que já
   foi contado fica em .github/cache/futebol-temporada.json, para não contar o mesmo jogo duas vezes.
   Roda no GitHub (.github/workflows/estatisticas.yml) ou no PC: node .github/estatisticas-futebol.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const CACHE = path.join(__dirname, 'cache/futebol-temporada.json');
const ARQ_TEMP = path.join(RAIZ, 'assets/dados/temporada-futebol.js');
const ARQ_DEST = path.join(RAIZ, 'assets/dados/destaques-futebol.js');
const API = 'https://site.api.espn.com/apis/site/v2/sports/soccer/';

/* campeonatos contados. desde: começo da temporada; europa: entra na conta dos brasileiros na Europa */
const LIGAS = [
  { slug: 'brasileirao', liga: 'bra.1', nome: 'Brasileirão', desde: '2026-01-20' },
  { slug: 'copa-do-brasil', liga: 'bra.copa_do_brazil', nome: 'Copa do Brasil', desde: '2026-02-01' },
  { slug: 'libertadores', liga: 'conmebol.libertadores', nome: 'Libertadores', desde: '2026-02-01' },
  { slug: 'sul-americana', liga: 'conmebol.sudamericana', nome: 'Sul-Americana', desde: '2026-02-01' },
  { slug: 'champions-league', liga: 'uefa.champions', nome: 'Champions League', desde: '2026-08-15', europa: true },
  { slug: 'liga-europa', liga: 'uefa.europa', nome: 'Liga Europa', desde: '2026-08-15', europa: true },
  { slug: 'premier-league', liga: 'eng.1', nome: 'Premier League', desde: '2026-08-01', europa: true },
  { slug: 'la-liga', liga: 'esp.1', nome: 'La Liga', desde: '2026-08-01', europa: true },
  { slug: 'serie-a', liga: 'ita.1', nome: 'Serie A', desde: '2026-08-01', europa: true },
  { slug: 'bundesliga', liga: 'ger.1', nome: 'Bundesliga', desde: '2026-08-01', europa: true },
  { slug: 'ligue-1', liga: 'fra.1', nome: 'Ligue 1', desde: '2026-08-01', europa: true },
  { slug: 'liga-portugal', liga: 'por.1', nome: 'Liga Portugal', desde: '2026-08-01', europa: true }
];
const DIAS_RECENTES = 10; /* jogos guardados linha a linha (seleção da rodada e semana dos brasileiros) */

const w = {};
try { new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/ao-vivo.js'), 'utf8'))(w); } catch (e) { /* sem placar */ }
try { new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/brasileiros.js'), 'utf8'))(w); } catch (e) { /* sem lista */ }
const IDS = (w.AO_VIVO || {}).ids || {};
const BR = new Map(((w.BRASILEIROS || {}).europa || []).map(l => { const p = l.split('|'); return [p[4], p]; }));

const espera = ms => new Promise(ok => setTimeout(ok, ms));
async function pedir(u) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) ArenaSports/1.0' } });
      if (r.ok) return await r.json();
      if (r.status < 500) return null;
    } catch (e) { /* rede: tenta de novo */ }
    await espera(800);
  }
  return null;
}
/* vários pedidos ao mesmo tempo, sem passar de n */
async function emLotes(lista, n, f) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < lista.length) { const k = i++; out[k] = await f(lista[k]); } }));
  return out;
}
const nomeTime = t => (t && (IDS['s' + t.id] || t.shortDisplayName || t.displayName || t.name)) || '';
const ymd = t => new Date(t).toISOString().slice(0, 10);
const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
function brasilia(iso) { return new Date(Date.parse(iso) - 3 * 3600e3).toISOString().slice(0, 10); }

/* posição da ESPN -> grupo do site */
function grupo(p) {
  p = String(p || '').toUpperCase();
  if (/^G/.test(p)) return 'GOL';
  if (/^(LB|LWB)/.test(p)) return 'LE';
  if (/^(RB|RWB)/.test(p)) return 'LD';
  if (/^(CD|CB|SW|D\b|D$|D-)/.test(p)) return 'ZAG';
  if (/^(F|CF|ST|SS|LW|RW|LF|RF)/.test(p)) return 'ATA';
  return 'MEI';
}

let cache = { feitos: {}, varrido: {}, jogadores: {}, recentes: [] };
try { cache = Object.assign(cache, JSON.parse(fs.readFileSync(CACHE, 'utf8'))); } catch (e) { /* primeira vez */ }

/* conta um jogo encerrado */
function contar(l, ev, r) {
  const comp = ((r.header || {}).competitions || [])[0] || {};
  const cs = comp.competitors || [];
  const placar = {}; cs.forEach(c => { placar[c.id] = num(c.score); });
  const casaC = cs.find(c => c.homeAway === 'home') || {}, foraC = cs.find(c => c.homeAway === 'away') || {};
  const d = brasilia(ev.date);
  const jogo = { id: ev.id, slug: l.slug, d, casa: nomeTime(casaC.team), fora: nomeTime(foraC.team), p: num(casaC.score) + ' x ' + num(foraC.score), linhas: [] };
  for (const lado of r.rosters || []) {
    const tid = (lado.team || {}).id, outro = cs.find(c => c.id !== tid) || {};
    const feitos = placar[tid] || 0, sofridos = num(outro.score), res = feitos > sofridos ? 1 : feitos < sofridos ? -1 : 0;
    const time = nomeTime(lado.team);
    for (const a of lado.roster || []) {
      const at = a.athlete || {}; if (!at.id) continue;
      const entrou = !!a.subbedIn, tit = !!a.starter;
      if (!tit && !entrou) continue;
      const st = {}; (a.stats || []).forEach(x => { st[x.name] = num(x.value); });
      const pos = (a.position || {}).abbreviation || '';
      const G = st.totalGoals || 0, A = st.goalAssists || 0, CH = st.totalShots || 0, CG = st.shotsOnTarget || 0, AM = st.yellowCards || 0, VM = st.redCards || 0, DF = st.saves || 0;
      const j = cache.jogadores[at.id] = cache.jogadores[at.id] || { n: '', t: '', pos: '', d: '', c: {} };
      if (d >= j.d) { j.n = at.displayName || at.fullName || j.n; j.t = time; if (pos && pos !== 'SUB') j.pos = grupo(pos); j.d = d; }
      const c = j.c[l.slug] = j.c[l.slug] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
      [1, tit ? 1 : 0, G, A, CH, CG, AM, VM, DF].forEach((v, i) => { c[i] += v; });
      jogo.linhas.push([at.id, at.displayName || '', time, pos, tit ? 1 : 0, entrou ? 1 : 0, G, A, CG, DF, sofridos, AM, VM, res]);
    }
  }
  if (jogo.linhas.length) cache.recentes.push(jogo);
}

/* ---------- seleção da rodada (Brasileirão) ---------- */
function nota(x) {
  const [, , , pos, tit, entrou, G, A, CG, DF, sof, AM, VM, res] = x, gr = grupo(pos);
  const limpo = sof === 0;
  let n = res * 1 - AM * .5 - VM * 3 + (tit ? .5 : 0);
  if (gr === 'GOL') n += DF * .7 + (limpo ? 3 : -sof * .8) + G * 6 + A * 4;
  else if (gr === 'ZAG' || gr === 'LE' || gr === 'LD') n += G * 6 + A * 4 + CG * .3 + (limpo ? 2.5 : -sof * .3);
  else if (gr === 'MEI') n += G * 5 + A * 4 + CG * .6 + (limpo ? .5 : 0);
  else n += G * 4.5 + A * 3.5 + CG * .7;
  return n;
}
function linhaTexto(x) {
  const [, , , pos, , , G, A, CG, DF, sof] = x, p = [];
  if (G) p.push(G === 1 ? '1 gol' : G + ' gols');
  if (A) p.push(A === 1 ? '1 assistência' : A + ' assistências');
  if (grupo(pos) === 'GOL' && DF) p.push(DF === 1 ? '1 defesa' : DF + ' defesas');
  if (!sof && grupo(pos) !== 'ATA' && grupo(pos) !== 'MEI') p.push('sem sofrer gol');
  if (!p.length && CG) p.push(CG === 1 ? '1 chute no gol' : CG + ' chutes no gol');
  return p.join(', ');
}
function selecao() {
  /* a rodada: do jogo mais recente para trás, até 10 jogos sem repetir time e dentro de 6 dias */
  const jogos = cache.recentes.filter(j => j.slug === 'brasileirao').sort((a, b) => a.d < b.d ? 1 : -1);
  if (!jogos.length) return null;
  const usados = new Set(), rodada = [];
  for (const j of jogos) {
    if (rodada.length >= 10 || Date.parse(jogos[0].d) - Date.parse(j.d) > 6 * 864e5) break;
    if (usados.has(j.casa) || usados.has(j.fora)) continue;
    usados.add(j.casa); usados.add(j.fora); rodada.push(j);
  }
  if (rodada.length < 5) return null;
  const cand = [];
  rodada.forEach(j => j.linhas.forEach(x => { if (x[4] || x[6] || x[7]) cand.push({ x, n: nota(x), gr: grupo(x[3]) }); }));
  cand.sort((a, b) => b.n - a.n);
  const pegos = new Set(), tira = (filtro, k) => {
    const out = [];
    for (const c of cand) { if (out.length >= k) break; if (!pegos.has(c.x[0]) && filtro(c)) { out.push(c); pegos.add(c.x[0]); } }
    return out;
  };
  const gol = tira(c => c.gr === 'GOL', 1), le = tira(c => c.gr === 'LE', 1), ld = tira(c => c.gr === 'LD', 1), zag = tira(c => c.gr === 'ZAG', 2);
  /* faltou lateral: entra o melhor defensor que sobrou */
  const defesa = [...le, ...tira(c => /ZAG|LE|LD/.test(c.gr), 1 - le.length), ...zag, ...tira(c => /ZAG|LE|LD/.test(c.gr), 2 - zag.length), ...ld, ...tira(c => /ZAG|LE|LD/.test(c.gr), 1 - ld.length)];
  const meio = tira(c => c.gr === 'MEI', 3), ataque = tira(c => c.gr === 'ATA', 3);
  const vira = (c, pos) => [pos, c.x[1], c.x[2], Math.round(c.n * 10) / 10, linhaTexto(c.x)];
  const pd = ['LE', 'ZAG', 'ZAG', 'LD'];
  const linhas = [ataque.map(c => vira(c, 'ATA')), meio.map(c => vira(c, 'MEI')), defesa.map((c, i) => vira(c, pd[i] || 'ZAG')), gol.map(c => vira(c, 'GOL'))];
  const craque = cand[0];
  const datas = rodada.map(j => j.d).sort();
  return { comp: 'brasileirao', de: datas[0], ate: datas[datas.length - 1], jogos: rodada.length, formacao: '4-3-3', linhas, craque: craque ? vira(craque, craque.gr) : null };
}

/* ---------- brasileiros na Europa ---------- */
function brasileiros() {
  const europa = new Set(LIGAS.filter(l => l.europa).map(l => l.slug)), nomeComp = {};
  LIGAS.forEach(l => { nomeComp[l.slug] = l.nome; });
  const limite = ymd(Date.now() - 8 * 864e5), semana = [];
  for (const j of cache.recentes) {
    if (!europa.has(j.slug) || j.d < limite) continue;
    for (const x of j.linhas) {
      if (!BR.has(x[0])) continue;
      const adv = x[2] === j.casa ? j.fora : j.casa;
      semana.push([x[1], x[2], nomeComp[j.slug], j.d, adv, j.p, x[6], x[7], x[4], x[11], x[12], x[9], x[3] && grupo(x[3]) === 'GOL' ? x[10] : -1]);
    }
  }
  /* quem decidiu primeiro (gols + assistências), depois os mais recentes */
  semana.sort((a, b) => (b[6] * 2 + b[7]) - (a[6] * 2 + a[7]) || (a[3] < b[3] ? 1 : -1));
  const temporada = [];
  for (const [id, j] of Object.entries(cache.jogadores)) {
    if (!BR.has(id)) continue;
    let J = 0, G = 0, A = 0;
    for (const [s, c] of Object.entries(j.c)) if (europa.has(s)) { J += c[0]; G += c[2]; A += c[3]; }
    if (J) temporada.push([j.n, j.t, BR.get(id)[3], J, G, A]);
  }
  temporada.sort((a, b) => (b[4] + b[5]) - (a[4] + a[5]) || b[4] - a[4] || b[3] - a[3]);
  return { semana: semana.slice(0, 40), temporada: temporada.slice(0, 30), total: BR.size };
}

(async () => {
  const hoje = ymd(Date.now() - 3 * 3600e3);
  let novos = 0;
  for (const l of LIGAS) {
    /* dias a varrer: a temporada toda na primeira vez; depois, os últimos 4 dias */
    const ultimo = cache.varrido[l.slug];
    const de = ultimo ? ymd(Date.parse(ultimo) - 4 * 864e5) : l.desde;
    const dias = [];
    for (let t = Date.parse(de < l.desde ? l.desde : de); ymd(t) <= hoje; t += 864e5) dias.push(ymd(t).replace(/-/g, ''));
    const placares = await emLotes(dias, 8, d => pedir(API + l.liga + '/scoreboard?limit=200&dates=' + d));
    const eventos = [];
    placares.forEach(p => (p && p.events || []).forEach(ev => {
      const st = ((ev.status || {}).type) || {};
      if (st.completed && !cache.feitos[ev.id] && !eventos.some(e => e.id === ev.id)) eventos.push(ev);
    }));
    const resumos = await emLotes(eventos, 8, ev => pedir(API + l.liga + '/summary?event=' + ev.id));
    eventos.forEach((ev, i) => {
      const r = resumos[i];
      if (!r || !(r.rosters || []).some(x => (x.roster || []).length)) return; /* sem escalação: tenta na próxima */
      contar(l, ev, r);
      cache.feitos[ev.id] = 1; novos++;
    });
    if (placares.filter(Boolean).length > dias.length / 2) cache.varrido[l.slug] = hoje;
    console.log(l.slug + ':', dias.length, 'dias,', eventos.length, 'jogos novos');
  }
  const limite = ymd(Date.now() - DIAS_RECENTES * 864e5);
  cache.recentes = cache.recentes.filter(j => j.d >= limite);
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(cache));

  /* temporada de cada jogador, por campeonato */
  const comps = {}; LIGAS.forEach(l => { comps[l.slug] = l.nome; });
  const linhas = [];
  for (const [id, j] of Object.entries(cache.jogadores)) for (const [s, c] of Object.entries(j.c)) linhas.push([id, j.n, j.t, j.pos, s, ...c]);
  linhas.sort((a, b) => a[1].localeCompare(b[1]) || a[4].localeCompare(b[4]));
  const temp = { comps, colunas: ['J', 'Titular', 'Gols', 'Assistências', 'Finalizações', 'Chutes no gol', 'Amarelos', 'Vermelhos', 'Defesas'], jogadores: linhas, atualizado: hoje };
  const txtTemp = '/* Números da temporada de cada jogador (ESPN), por campeonato. Gerado por .github/estatisticas-futebol.js.\n' +
    '   jogadores: [id, nome, time, posição, campeonato, ...colunas]. */\nwindow.TEMPORADA_FUTEBOL = ' + JSON.stringify(temp) + ';\n';
  if (linhas.length > 100) fs.writeFileSync(ARQ_TEMP, txtTemp);

  const dest = { selecao: selecao(), brasileiros: brasileiros(), atualizado: hoje };
  fs.writeFileSync(ARQ_DEST, '/* Seleção da rodada do Brasileirão e brasileiros na Europa (ESPN). Gerado por .github/estatisticas-futebol.js.\n' +
    '   selecao.linhas: do ataque para o gol, [posição, nome, time, nota, o que fez]. brasileiros.semana: [nome, time, campeonato, data,\n' +
    '   adversário, placar, gols, assistências, titular, amarelos, vermelhos, defesas, gols sofridos (goleiro) ou -1].\n' +
    '   brasileiros.temporada: [nome, time, liga, jogos, gols, assistências]. */\nwindow.DESTAQUES_FUTEBOL = ' + JSON.stringify(dest) + ';\n');
  console.log('jogos novos:', novos, '| jogadores:', Object.keys(cache.jogadores).length, '| seleção:', dest.selecao ? dest.selecao.jogos + ' jogos' : 'sem',
    '| brasileiros na semana:', dest.brasileiros.semana.length);
})();
