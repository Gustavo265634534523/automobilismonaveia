/* Todos os jogadores atuais para o "Monte seu time": pega na ESPN o elenco de cada time das ligas abaixo e grava
   assets/dados/jogadores-todos.js (nome, posição, time e o número da ESPN, que serve para a foto).
   Só jogadores em atividade. A posição exata dos craques fica em assets/dados/jogadores-craques.js.
   Roda no GitHub toda semana (.github/workflows/jogadores.yml) ou no PC: node .github/jogadores-espn.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/jogadores-todos.js');
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
  const todos = new Map(); let times = 0;
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
      }
      times++;
      await espera(120);
    }
    console.log(liga + ':', lista.length, 'times,', n, 'jogadores');
  }
  if (todos.size < 1000) { console.log('poucos jogadores (' + todos.size + '); mantém o arquivo anterior'); return; }
  const linhas = [...todos.values()].sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(ARQ, '/* Jogadores atuais das principais ligas (elencos da ESPN), para o Monte seu time. Gerado por .github/jogadores-espn.js.\n' +
    '   "Nome|POSIÇÃO|Time|id da ESPN". DEF, MEIO e ATA: a ESPN só diz defensor, meio-campista ou atacante. */\n' +
    'window.JOGADORES_TODOS = ' + JSON.stringify(linhas) + ';\n');
  console.log('total:', todos.size, 'jogadores de', times, 'times');
})();
