/* Todos os jogadores atuais para o "Monte seu time": pega na ESPN o elenco de cada time das ligas abaixo e grava
   assets/dados/jogadores-todos.js (nome, posição, time e o número da ESPN, que serve para a foto).
   Só jogadores em atividade. A posição exata dos craques fica em assets/dados/jogadores-craques.js.
   De quebra, grava assets/dados/brasileiros.js: os brasileiros dos elencos da Europa (pela nacionalidade da ESPN) e os
   da NBA (pelo lugar de nascimento), usados nas seções "Brasileiros na Europa" e "Brasileiros na NBA".
   Roda no GitHub toda semana (.github/workflows/jogadores.yml) ou no PC: node .github/jogadores-espn.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/jogadores-todos.js');
const ARQ_BR = path.join(RAIZ, 'assets/dados/brasileiros.js');
/* ligas da Europa (para os brasileiros) e o nome curto de cada uma */
const EUROPA = { 'eng.1': 'Premier League', 'eng.2': 'Championship', 'esp.1': 'La Liga', 'esp.2': 'Segunda da Espanha', 'ita.1': 'Serie A', 'ita.2': 'Serie B da Itália',
  'ger.1': 'Bundesliga', 'ger.2': '2. Bundesliga', 'fra.1': 'Ligue 1', 'fra.2': 'Ligue 2', 'por.1': 'Liga Portugal', 'ned.1': 'Eredivisie', 'tur.1': 'Turquia',
  'bel.1': 'Bélgica', 'sco.1': 'Escócia', 'gre.1': 'Grécia', 'rus.1': 'Rússia', 'aut.1': 'Áustria', 'sui.1': 'Suíça', 'den.1': 'Dinamarca', 'nor.1': 'Noruega',
  'swe.1': 'Suécia', 'pol.1': 'Polônia' };
const API = 'https://site.api.espn.com/apis/site/v2/sports/soccer/';
const LIGAS = ['bra.1', 'bra.2', 'arg.1', 'eng.1', 'eng.2', 'esp.1', 'ita.1', 'ger.1', 'fra.1', 'por.1', 'ned.1', 'tur.1', 'bel.1', 'sco.1',
  'ksa.1', 'usa.1', 'mex.1', 'col.1', 'uru.1', 'chi.1', 'ecu.1', 'par.1', 'gre.1', 'rus.1', 'jpn.1',
  'esp.2', 'ita.2', 'ger.2', 'fra.2', 'aut.1', 'sui.1', 'den.1', 'nor.1', 'swe.1', 'pol.1', 'bra.3'];

/* o nome que o site usa para o time (o mesmo do placar) */
const w = {};
try { new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/ao-vivo.js'), 'utf8'))(w); } catch (e) { /* sem placar */ }
const IDS = (w.AO_VIVO || {}).ids || {};

const espera = ms => new Promise(ok => setTimeout(ok, ms));
async function pedir(u) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(u, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 ArenaSports/1.0' } }); if (r.ok) return await r.json(); if (r.status < 500) return null; } catch (e) { /* tenta de novo */ }
    await espera(1000);
  }
  return null;
}
/* posição da ESPN -> do site. Elenco costuma vir só com G, D, M, F: viram DEF, MEIO e ATA (o site encaixa) */
function pos(p) {
  const a = String((p && (p.abbreviation || p.name)) || '').toUpperCase();
  if (/^G/.test(a)) return 'GOL';
  if (/^(LB|LWB)/.test(a)) return 'LE';
  if (/^(RB|RWB)/.test(a)) return 'LD';
  if (/^(CB|CD|SW)/.test(a)) return 'ZAG';
  if (/^D/.test(a)) return 'DEF';
  if (/^(DM|CDM)/.test(a)) return 'VOL';
  if (/^(AM|CAM)/.test(a)) return 'MEI';
  if (/^(LW|LM|LF)/.test(a)) return 'PE';
  if (/^(RW|RM|RF)/.test(a)) return 'PD';
  if (/^(CF|ST)/.test(a)) return 'CA';
  if (/^M/.test(a)) return 'MEIO';
  if (/^F/.test(a)) return 'ATA';
  return '';
}

(async () => {
  const todos = new Map(), europa = new Map(); let times = 0;
  for (const liga of LIGAS) {
    const t = await pedir(API + liga + '/teams');
    const lista = (((t || {}).sports || [])[0] || {}).leagues ? t.sports[0].leagues[0].teams || [] : [];
    let n = 0;
    for (const x of lista) {
      const tm = x.team || {}; if (!tm.id) continue;
      const r = await pedir(API + liga + '/teams/' + tm.id + '/roster');
      let atl = (r && r.athletes) || [];
      if (atl.length && atl[0].items) atl = atl.flatMap(g => g.items || []);
      const nomeTime = IDS['s' + tm.id] || tm.shortDisplayName || tm.displayName || '';
      for (const a of atl) {
        const nome = a.displayName || a.fullName; if (!nome || !a.id) continue;
        const p = pos(a.position); if (!p) continue;
        if (!todos.has(a.id)) { todos.set(a.id, [nome, p, nomeTime, a.id].join('|')); n++; }
        const pais = String(a.citizenship || ((a.citizenshipCountry || {}).abbreviation === 'BRA' ? 'Brazil' : '') || ((a.birthPlace || {}).country || ''));
        if (EUROPA[liga] && /^(brazil|brasil)$/i.test(pais) && !europa.has(a.id)) europa.set(a.id, [nome, p, nomeTime, EUROPA[liga], a.id]);
      }
      times++;
      await espera(120);
    }
    console.log(liga + ':', lista.length, 'times,', n, 'jogadores');
  }
  /* brasileiros na NBA (pelo lugar de nascimento; o elenco da NBA não traz a nacionalidade) */
  const nba = [];
  const tn = await pedir('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
  for (const x of ((((tn || {}).sports || [])[0] || {}).leagues || [{}])[0].teams || []) {
    const tm = x.team || {}; if (!tm.id) continue;
    const r = await pedir('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/' + tm.id + '/roster');
    for (const a of (r && r.athletes) || []) {
      const pais = ((a.birthPlace || {}).country || '') + ' ' + (a.citizenship || '');
      if (/brazil|brasil/i.test(pais)) nba.push([a.displayName || a.fullName, ((a.position || {}).abbreviation) || '', IDS['b' + tm.id] || tm.displayName || '', a.id, ((a.birthPlace || {}).city) || '']);
    }
    await espera(120);
  }
  console.log('brasileiros: Europa', europa.size, '| NBA', nba.length, nba.map(x => x[0]).join(', '));
  if (europa.size > 30) {
    fs.writeFileSync(ARQ_BR, '/* Brasileiros nos elencos da Europa e da NBA (ESPN). Gerado por .github/jogadores-espn.js.\n' +
      '   europa: "Nome|POSIÇÃO|Time|Liga|id da ESPN"; nba: [nome, posição, time, id da ESPN, cidade onde nasceu]. */\n' +
      'window.BRASILEIROS = ' + JSON.stringify({ europa: [...europa.values()].map(x => x.join('|')).sort((a, b) => a.localeCompare(b)), nba, atualizado: new Date().toISOString().slice(0, 10) }) + ';\n');
  }
  if (todos.size < 1000) { console.log('poucos jogadores (' + todos.size + '); mantém o arquivo anterior'); return; }
  const linhas = [...todos.values()].sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(ARQ, '/* Jogadores atuais das principais ligas (elencos da ESPN), para o Monte seu time. Gerado por .github/jogadores-espn.js.\n' +
    '   "Nome|POSIÇÃO|Time|id da ESPN". DEF, MEIO e ATA: a ESPN só diz defensor, meio-campista ou atacante. */\n' +
    'window.JOGADORES_TODOS = ' + JSON.stringify(linhas) + ';\n');
  console.log('total:', todos.size, 'jogadores de', times, 'times');
})();
