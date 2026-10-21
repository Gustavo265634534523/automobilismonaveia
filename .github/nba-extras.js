/* NBA além do placar, pela ESPN:
   - assets/dados/nba-extras.js: a noite da NBA (os jogos da última rodada, o cestinha de cada time e o jogador da
     noite), as lesões de cada time e os brasileiros na NBA (média na temporada e os últimos jogos);
   - assets/dados/temporada-nba.js: a média de cada jogador na temporada atual e na anterior (página Comparar jogadores).
   Os jogos já lidos ficam em .github/cache/nba.json (só os dos últimos 8 dias).
   Roda no GitHub (.github/workflows/estatisticas.yml) ou no PC: node .github/nba-extras.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const CACHE = path.join(__dirname, 'cache/nba.json');
const ARQ = path.join(RAIZ, 'assets/dados/nba-extras.js');
const ARQ_TEMP = path.join(RAIZ, 'assets/dados/temporada-nba.js');
const API = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/';

const w = {};
try { new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/ao-vivo.js'), 'utf8'))(w); } catch (e) { /* sem placar */ }
try { new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/brasileiros.js'), 'utf8'))(w); } catch (e) { /* sem lista */ }
const AV = w.AO_VIVO || {}, IDS = AV.ids || {};
const BR = ((w.BRASILEIROS || {}).nba || []);

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
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
const ymd = t => new Date(t).toISOString().slice(0, 10);
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const TIMES = Object.entries(IDS).filter(([k]) => k[0] === 'b').map(([, v]) => v);
const nomeTime = t => (t && (IDS['b' + t.id] || t.displayName || t.name)) || '';
/* o time do jogador às vezes vem só com o apelido ("Lakers"): casa com o nome completo do site */
function timePorNome(...cand) {
  const c = cand.filter(Boolean).map(norm);
  return TIMES.find(n => c.some(x => norm(n) === x || norm(n).endsWith(' ' + x))) || cand.find(Boolean) || '';
}

let cache = { jogos: {} };
try { cache = Object.assign(cache, JSON.parse(fs.readFileSync(CACHE, 'utf8'))); } catch (e) { /* primeira vez */ }

/* box score de um jogo -> linhas [id, nome, time, MIN, PTS, REB, AST, STL, BLK, FG, 3PT, TO, titular] */
function linhasDo(r) {
  const out = [];
  for (const lado of ((r.boxscore || {}).players || [])) {
    const time = nomeTime(lado.team);
    const b = (lado.statistics || [])[0] || {}, rot = (b.labels || b.names || []).map(x => String(x).toUpperCase()), ix = k => rot.indexOf(k);
    for (const a of b.athletes || []) {
      const v = a.stats || []; if (!v.length) continue;
      const at = a.athlete || {};
      out.push([at.id, at.displayName || '', time, v[ix('MIN')] || '0', num(v[ix('PTS')]), num(v[ix('REB')]), num(v[ix('AST')]), num(v[ix('STL')]), num(v[ix('BLK')]),
        v[ix('FG')] || '', v[ix('3PT')] || '', num(v[ix('TO')]), a.starter ? 1 : 0]);
    }
  }
  return out;
}
const notaDe = (x, vence) => x[4] + x[5] * 1.2 + x[6] * 1.5 + x[7] * 2 + x[8] * 2 - x[11] + (x[2] === vence ? 3 : 0);
function linhaTxt(x) {
  const p = [x[4] + ' pontos', x[5] + ' rebotes', x[6] + ' assistências'];
  if (x[7] >= 3) p.push(x[7] + ' roubos'); if (x[8] >= 3) p.push(x[8] + ' tocos');
  return p.join(', ');
}

/* lesões: tradução do que a ESPN manda */
const STATUS = { out: 'Fora', 'day-to-day': 'Dúvida', questionable: 'Dúvida', doubtful: 'Improvável', probable: 'Provável', suspension: 'Suspenso', 'out for season': 'Fora da temporada' };
const PARTE = { ankle: 'Tornozelo', knee: 'Joelho', foot: 'Pé', hamstring: 'Posterior da coxa', back: 'Costas', 'lower back': 'Lombar', illness: 'Doença', rest: 'Descanso',
  personal: 'Motivo pessoal', concussion: 'Concussão', hip: 'Quadril', shoulder: 'Ombro', wrist: 'Punho', hand: 'Mão', calf: 'Panturrilha', groin: 'Virilha', achilles: 'Tendão de Aquiles',
  thumb: 'Polegar', finger: 'Dedo da mão', elbow: 'Cotovelo', toe: 'Dedo do pé', quadriceps: 'Quadríceps', neck: 'Pescoço', abdomen: 'Abdômen', oblique: 'Oblíquo', leg: 'Perna',
  'lower leg': 'Perna', thigh: 'Coxa', shin: 'Canela', rib: 'Costela', chest: 'Peito', eye: 'Olho', face: 'Rosto', nose: 'Nariz', head: 'Cabeça', heel: 'Calcanhar',
  'plantar fascia': 'Fáscia plantar', 'not injury related': 'Fora por outro motivo', 'g league': 'Na G League', undisclosed: 'Não divulgada', fibula: 'Fíbula', tibia: 'Tíbia',
  pelvis: 'Pelve', adductor: 'Adutor', arm: 'Braço', jaw: 'Mandíbula', spine: 'Coluna', glute: 'Glúteo', 'soft tissue': 'Lesão muscular' };
const TIPO = { sprain: 'entorse', strain: 'estiramento', fracture: 'fratura', surgery: 'cirurgia', soreness: 'dores', tear: 'ruptura', contusion: 'pancada', tendinitis: 'tendinite',
  inflammation: 'inflamação', 'torn acl': 'ruptura do ligamento', 'injury management': 'controle de carga', bruise: 'pancada', dislocation: 'luxação', spasms: 'espasmos',
  tightness: 'rigidez', recovery: 'recuperação', 'ligament tear': 'ruptura de ligamento', sore: 'dores', 'stress reaction': 'estresse ósseo', 'stress fracture': 'fratura por estresse', infection: 'infecção' };
const traduz = (d, t) => d[String(t || '').toLowerCase()] || '';

async function lesoes() {
  const j = await pedir(API + 'injuries');
  if (!j || !j.injuries) return null;
  const out = [];
  for (const t of j.injuries) {
    const time = IDS['b' + t.id] || timePorNome(t.displayName);
    const lista = (t.injuries || []).map(x => {
      const a = x.athlete || {}, d = x.details || {};
      const parte = traduz(PARTE, d.type) || d.type || '', tipo = traduz(TIPO, d.detail);
      const lado = /left/i.test(d.side || '') ? 'esquerdo' : /right/i.test(d.side || '') ? 'direito' : '';
      return [a.displayName || '', ((a.position || {}).abbreviation) || '', STATUS[String(x.status || d.fantasyStatus && d.fantasyStatus.description || '').toLowerCase()] || x.status || '',
        [parte, lado && !/motivo|doença|descanso|league|divulgada/i.test(parte) ? '(' + lado + ')' : '', tipo ? '· ' + tipo : ''].filter(Boolean).join(' '), d.returnDate || '', String(x.date || '').slice(0, 10)];
    }).filter(x => x[0]);
    if (lista.length) out.push({ time, jogadores: lista });
  }
  out.sort((a, b) => a.time.localeCompare(b.time));
  return out;
}

/* média de cada jogador numa temporada (todas as páginas) */
const CAMPOS = ['gamesPlayed', 'avgMinutes', 'avgPoints', 'avgRebounds', 'avgAssists', 'avgSteals', 'avgBlocks', 'avgTurnovers', 'fieldGoalPct', 'threePointFieldGoalPct', 'freeThrowPct', 'avgThreePointFieldGoalsMade', 'doubleDouble', 'tripleDouble'];
async function temporada(ano) {
  const out = [];
  for (let pag = 1; pag <= 6; pag++) {
    const j = await pedir('https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete?region=us&lang=en&contentorigin=espn&isqualified=false&limit=200&page=' + pag +
      '&season=' + ano + '&seasontype=2&sort=offensive.avgPoints:desc');
    if (!j || !(j.athletes || []).length) break;
    const cats = j.categories || [];
    for (const a of j.athletes) {
      const v = {};
      (a.categories || []).forEach((c, i) => {
        const nomes = (cats.find(x => x.name === c.name) || cats[i] || {}).names || [];
        nomes.forEach((n, k) => { if (c.values && c.values[k] != null && v[n] == null) v[n] = c.values[k]; });
      });
      const at = a.athlete || {};
      if (!v.gamesPlayed) continue;
      const time = (at.teamId && IDS['b' + at.teamId]) || timePorNome(at.teamName, at.teamShortName);
      out.push([at.id, at.displayName, time, ((at.position || {}).abbreviation) || '', ...CAMPOS.map(k => Math.round((+v[k] || 0) * 10) / 10)]);
    }
    const pg = j.pagination || {};
    if (pg.pages && pag >= pg.pages) break;
  }
  return out;
}

(async () => {
  const hoje = ymd(Date.now() - 3 * 3600e3), limite = ymd(Date.now() - 8 * 864e5);
  /* jogos encerrados dos últimos 8 dias que ainda não foram lidos */
  const jogos = (((AV.comps || {}).nba || {}).jogos || []).filter(j => j.p && j.id && j.d >= limite && j.d <= hoje);
  for (const j of jogos) {
    if (cache.jogos[j.id]) continue;
    const r = await pedir(API + 'summary?event=' + j.id);
    const linhas = r ? linhasDo(r) : [];
    if (!linhas.length) continue;
    cache.jogos[j.id] = { d: j.d, casa: j.casa, fora: j.fora, p: j.p, fase: j.fase || '', linhas };
    await espera(150);
  }
  for (const [id, j] of Object.entries(cache.jogos)) if (j.d < limite) delete cache.jogos[id];
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(cache));

  /* a noite da NBA: a data mais recente com jogo encerrado */
  const lidos = Object.entries(cache.jogos).map(([id, j]) => Object.assign({ id }, j));
  const ultima = lidos.map(j => j.d).sort().pop();
  let noite = null;
  if (ultima) {
    let melhor = null;
    const lista = lidos.filter(j => j.d === ultima).map(j => {
      const [a, b] = j.p.split(' x ').map(Number), vence = a > b ? j.casa : j.fora;
      const cest = t => j.linhas.filter(x => x[2] === t).sort((x, y) => y[4] - x[4])[0];
      j.linhas.forEach(x => { const n = notaDe(x, vence); if (!melhor || n > melhor.n) melhor = { n, x, jogo: j }; });
      return { id: j.id, casa: j.casa, fora: j.fora, p: j.p, fase: j.fase, cestinhas: [cest(j.casa), cest(j.fora)].filter(Boolean).map(x => [x[1], x[2], x[4], x[5], x[6]]) };
    });
    noite = { d: ultima, jogos: lista, destaque: melhor ? { nome: melhor.x[1], time: melhor.x[2], linha: linhaTxt(melhor.x), jogo: melhor.jogo.casa + ' ' + melhor.jogo.p + ' ' + melhor.jogo.fora, id: melhor.jogo.id } : null };
  }

  /* temporadas (a atual e a anterior) */
  const agora = new Date(), ano = agora.getUTCMonth() >= 8 ? agora.getUTCFullYear() + 1 : agora.getUTCFullYear();
  const temps = {};
  for (const a of [ano, ano - 1]) {
    const t = await temporada(a);
    console.log('temporada', a, t.length, 'jogadores');
    if (t.length) temps[(a - 1) + '/' + String(a).slice(2)] = t;
  }
  let antes = {};
  try { const x = {}; new Function('window', fs.readFileSync(ARQ_TEMP, 'utf8'))(x); antes = (x.TEMPORADA_NBA || {}).temporadas || {}; } catch (e) { /* primeira vez */ }
  for (const k of Object.keys(antes)) if (!temps[k]) temps[k] = antes[k];
  if (Object.keys(temps).length) {
    fs.writeFileSync(ARQ_TEMP, '/* Média de cada jogador da NBA por temporada (ESPN). Gerado por .github/nba-extras.js.\n' +
      '   temporadas["2026/27"]: [id, nome, time, posição, ...colunas]. */\nwindow.TEMPORADA_NBA = ' +
      JSON.stringify({ colunas: ['Jogos', 'Minutos', 'Pontos', 'Rebotes', 'Assistências', 'Roubos', 'Tocos', 'Erros', 'Arremessos %', 'Bolas de 3 %', 'Lances livres %', 'Bolas de 3 por jogo', 'Duplos-duplos', 'Triplos-duplos'], temporadas: temps, atualizado: hoje }) + ';\n');
  }

  /* brasileiros: média na temporada (a atual, ou a anterior se ainda não jogou) e os jogos da última semana */
  const chaves = Object.keys(temps).sort().reverse();
  const brasileiros = BR.map(b => {
    let media = null, tempo = '';
    for (const k of chaves) { const l = (temps[k] || []).find(x => String(x[0]) === String(b[3])); if (l) { media = l.slice(4, 11); tempo = k; break; } }
    const ultimos = lidos.filter(j => j.linhas.some(x => String(x[0]) === String(b[3]))).sort((x, y) => x.d < y.d ? 1 : -1).slice(0, 5).map(j => {
      const x = j.linhas.find(l => String(l[0]) === String(b[3]));
      return [j.d, x[2] === j.casa ? j.fora : j.casa, j.p, x[3], x[4], x[5], x[6], x[12]];
    });
    return { nome: b[0], pos: b[1], time: b[2], cidade: b[4], temporada: tempo, media, ultimos };
  });

  const les = await lesoes();
  let velho = {};
  try { const x = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(x); velho = x.NBA_EXTRAS || {}; } catch (e) { /* primeira vez */ }
  const dados = { noite: noite || velho.noite || null, lesoes: les || velho.lesoes || [], brasileiros, atualizado: new Date().toISOString() };
  fs.writeFileSync(ARQ, '/* Noite da NBA, lesões e brasileiros na NBA (ESPN). Gerado por .github/nba-extras.js.\n' +
    '   noite.jogos[].cestinhas: [nome, time, pontos, rebotes, assistências]. lesoes[].jogadores: [nome, posição, situação, lesão, volta prevista, data].\n' +
    '   brasileiros[].media: [jogos, minutos, pontos, rebotes, assistências, roubos, tocos]; ultimos: [data, adversário, placar, minutos, pontos, rebotes, assistências, titular]. */\n' +
    'window.NBA_EXTRAS = ' + JSON.stringify(dados) + ';\n');
  console.log('noite', noite ? noite.d + ' ' + noite.jogos.length + ' jogos' : 'sem', '| lesões', (les || []).length, 'times | brasileiros', brasileiros.length);
})();
