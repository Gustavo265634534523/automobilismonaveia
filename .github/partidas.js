/* Página do jogo (partida.html): para cada jogo de ontem, de hoje e dos que começam nas próximas 3 horas, busca o
   resumo do jogo na ESPN e grava assets/dados/partidas/<id>.json.
   Futebol: lances (gols, cartões, substituições, pênaltis perdidos), escalações (formação, titulares e reservas) e
   estatísticas (posse, chutes, escanteios...). NBA: placar por quarto, placar completo de cada jogador e estatísticas.
   Jogo encerrado que já tem o arquivo final não é buscado de novo. Arquivos com mais de 10 dias são apagados.
   Roda no GitHub junto com o placar (.github/workflows/placar.yml) ou no PC: node .github/partidas.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'assets/dados/partidas');
const API = 'https://site.api.espn.com/apis/site/v2/sports/';
const VERSAO = 4; /* sobe quando o arquivo ganha coisa nova: os jogos já encerrados são buscados de novo */

const w = {};
new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/ao-vivo.js'), 'utf8'))(w);
const AV = w.AO_VIVO || {}, IDS = AV.ids || {};
fs.mkdirSync(PASTA, { recursive: true });

async function pedir(u) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) ArenaSports/1.0' } });
      if (r.ok) return await r.json();
      if (r.status < 500) return null;
    } catch (e) { /* rede: tenta de novo */ }
  }
  return null;
}
const nomeTime = (t, nba) => (t && (IDS[(nba ? 'b' : 's') + t.id] || t.displayName || t.name)) || '';
const pessoa = a => (a && (a.displayName || a.shortName || a.fullName)) || '';

const tiposDesconhecidos = new Set();
/* lance da ESPN -> lance do site (tipo e texto em português) */
function lance(k) {
  const t = String((k.type && (k.type.type || k.type.text)) || '').toLowerCase(), txt = String((k.type && k.type.text) || '').toLowerCase();
  const p = (k.participants || []).map(x => pessoa(x.athlete)).filter(Boolean);
  let tipo = null, quem = p[0] || '', extra = '';
  if (/own/.test(t + txt)) { tipo = 'gol-contra'; }
  else if (/penalty.*(miss|saved)|(miss|saved).*penalty/.test(t + ' ' + txt)) { tipo = 'penalti-perdido'; }
  else if (k.scoringPlay || /goal/.test(t + txt)) { tipo = /penalty/.test(t + txt) ? 'gol-penalti' : 'gol'; if (p[1]) extra = p[1]; }
  else if (/red/.test(t + txt)) { tipo = 'vermelho'; }
  else if (/yellow/.test(t + txt)) { tipo = 'amarelo'; }
  else if (/sub/.test(t + txt)) { tipo = 'troca'; quem = p[0] || ''; extra = p[1] || ''; }
  else if (/halftime|half-time/.test(t + txt)) { tipo = 'intervalo'; }
  else if (/end|full ?time|final/.test(t + txt) && /end|final|full/.test(txt)) { tipo = 'fim'; }
  else if (/kickoff|start/.test(t + txt)) { tipo = 'inicio'; }
  if (!tipo) { tiposDesconhecidos.add(t + ' / ' + txt); return null; }
  if ((tipo === 'inicio' || tipo === 'fim') && k.team) return null; /* paradas (VAR, atendimento) vêm com o time: ficam de fora */
  return { min: (k.clock && k.clock.displayValue) || '', tipo, time: k.team ? nomeTime(k.team) : '', quem, extra };
}

/* escalação de um time */
function escalacao(r) {
  const atletas = (r.roster || []).map(a => ({
    n: pessoa(a.athlete), num: a.jersey || '', pos: (a.position && a.position.abbreviation) || '', lugar: +a.formationPlace || 0,
    titular: !!a.starter, entrou: !!a.subbedIn, saiu: !!a.subbedOut
  })).filter(a => a.n);
  return { time: nomeTime(r.team), formacao: r.formation || '', titulares: atletas.filter(a => a.titular).sort((a, b) => a.lugar - b.lugar), reservas: atletas.filter(a => !a.titular) };
}

/* estatísticas do jogo de futebol: [rótulo, casa, fora] na ordem em que aparecem na página */
const EST_FUT = [
  ['possessionPct', 'Posse de bola', v => Math.round(+v) + '%'], ['totalShots', 'Finalizações'], ['shotsOnTarget', 'Chutes no gol'],
  ['blockedShots', 'Chutes bloqueados'], ['wonCorners', 'Escanteios'], ['offsides', 'Impedimentos'], ['foulsCommitted', 'Faltas'],
  ['yellowCards', 'Cartões amarelos'], ['redCards', 'Cartões vermelhos'], ['saves', 'Defesas do goleiro'],
  ['totalPasses', 'Passes'], ['accuratePasses', 'Passes certos'], ['passPct', 'Precisão nos passes', v => Math.round(+v * 100) + '%'],
  ['totalCrosses', 'Cruzamentos'], ['totalLongBalls', 'Lançamentos'], ['totalTackles', 'Desarmes'], ['interceptions', 'Interceptações'], ['totalClearance', 'Cortes']
];
function ladosBox(r) {
  const comp = ((r.header || {}).competitions || [])[0] || {}, casaId = ((comp.competitors || []).find(x => x.homeAway === 'home') || {}).id;
  const t = ((r.boxscore || {}).teams || []);
  const casa = t.find(x => x.homeAway === 'home' || (x.team && x.team.id === casaId)), fora = t.find(x => x !== casa);
  return { casa, fora, comp, casaId };
}
function estatFutebol(r) {
  const { casa, fora } = ladosBox(r);
  if (!casa || !fora) return null;
  const v = (t, k) => { const s = (t.statistics || []).find(x => x.name === k); return s ? (s.displayValue != null ? s.displayValue : s.value) : null; };
  const out = [];
  for (const [k, rot, f] of EST_FUT) {
    const a = v(casa, k), b = v(fora, k);
    if (a == null || b == null || a === '' || b === '') continue;
    out.push([rot, f ? f(a) : String(a), f ? f(b) : String(b)]);
  }
  /* jogo que ainda não começou vem com tudo zerado */
  return out.some(x => x[1] !== '0' && x[1] !== '0%' || x[2] !== '0' && x[2] !== '0%') ? out : null;
}

/* NBA: placar por quarto, placar completo (box score) e estatísticas dos times */
const EST_NBA = [
  ['fieldGoalsMade-fieldGoalsAttempted', 'Arremessos (cestas/tentativas)'], ['fieldGoalPct', 'Aproveitamento nos arremessos', v => v + '%'],
  ['threePointFieldGoalsMade-threePointFieldGoalsAttempted', 'Bolas de 3'], ['threePointFieldGoalPct', 'Aproveitamento nas bolas de 3', v => v + '%'],
  ['freeThrowsMade-freeThrowsAttempted', 'Lances livres'], ['freeThrowPct', 'Aproveitamento nos lances livres', v => v + '%'],
  ['totalRebounds', 'Rebotes'], ['offensiveRebounds', 'Rebotes de ataque'], ['defensiveRebounds', 'Rebotes de defesa'],
  ['assists', 'Assistências'], ['steals', 'Roubos de bola'], ['blocks', 'Tocos'], ['totalTurnovers', 'Erros (turnovers)'],
  ['pointsInPaint', 'Pontos no garrafão'], ['fastBreakPoints', 'Pontos de contra-ataque'], ['turnoverPoints', 'Pontos após erro do rival'],
  ['fouls', 'Faltas'], ['largestLead', 'Maior vantagem'], ['leadChanges', 'Trocas de liderança']
];
function basquete(r) {
  const { casa, fora, comp, casaId } = ladosBox(r);
  const out = {};
  /* placar por quarto */
  const cs = comp.competitors || [], c = cs.find(x => x.homeAway === 'home'), f = cs.find(x => x.homeAway === 'away');
  const ls = x => ((x && x.linescores) || []).map(q => String(q.displayValue != null ? q.displayValue : q.value));
  if (c && f && ls(c).length) out.quartos = { casa: ls(c), fora: ls(f) };
  if (casa && fora) {
    const v = (t, k) => { const s = (t.statistics || []).find(x => x.name === k); return s ? String(s.displayValue != null ? s.displayValue : s.value) : null; };
    const est = [];
    for (const [k, rot, fm] of EST_NBA) { const a = v(casa, k), b = v(fora, k); if (a != null && b != null) est.push([rot, fm ? fm(a) : a, fm ? fm(b) : b]); }
    if (est.length) out.estatisticas = est;
  }
  /* placar completo: um bloco por time, com as colunas da ESPN traduzidas */
  const jog = (r.boxscore || {}).players || [];
  const bloco = lado => {
    const t = jog.find(x => (x.team || {}).id && (lado === 'casa' ? x.team.id === casaId : x.team.id !== casaId));
    if (!t) return null;
    const b = (t.statistics || [])[0] || {};
    const col = (b.labels || b.names || []).map(String);
    const atletas = (b.athletes || []).map(a => ({
      n: pessoa(a.athlete), pos: ((a.athlete || {}).position || {}).abbreviation || '', titular: !!a.starter,
      fora: !!a.didNotPlay || !(a.stats || []).length, motivo: a.reason || '', s: (a.stats || []).map(String)
    })).filter(a => a.n);
    return { time: nomeTime(t.team, true), colunas: col, atletas, totais: (b.totals || []).map(String) };
  };
  const bc = bloco('casa'), bf = bloco('fora');
  if (bc && bf && (bc.atletas.length || bf.atletas.length)) out.box = { casa: bc, fora: bf };
  return out;
}

function gravar(arq, dados) {
  const novo = JSON.stringify(dados);
  if (fs.existsSync(arq) && fs.readFileSync(arq, 'utf8') === novo) return false;
  fs.writeFileSync(arq, novo);
  return true;
}

(async () => {
  const agora = Date.now(), alvo = [];
  for (const [slug, c] of Object.entries(AV.comps || {})) {
    if (!/^(soccer\/|basketball\/nba)/.test(c.liga || '')) continue;
    for (const j of c.jogos || []) {
      if (!j.id || !j.d) continue;
      const t = Date.parse(j.d + 'T' + (j.h || '12:00') + ':00-03:00');
      if (t > agora + 3 * 3600e3 || t < agora - 36 * 3600e3) continue;
      const arq = path.join(PASTA, j.id + '.json');
      if (j.p && fs.existsSync(arq)) { try { const v = JSON.parse(fs.readFileSync(arq, 'utf8')); if (v.fim && v.v === VERSAO) continue; } catch (e) { /* refaz */ } }
      alvo.push({ slug, liga: c.liga, j, arq });
    }
  }
  let feitos = 0;
  for (const a of alvo) {
    const r = await pedir(API + a.liga + '/summary?event=' + a.j.id);
    if (!r) continue;
    const base = { v: VERSAO, id: a.j.id, comp: a.slug, d: a.j.d, h: a.j.h || '', casa: a.j.casa, fora: a.j.fora, p: a.j.p || (a.j.vivo && a.j.vivo.p) || '',
      status: a.j.p ? 'Encerrado' : a.j.vivo ? (a.j.vivo.min || 'Ao vivo') : '', fim: !!a.j.p };
    if (/^basketball/.test(a.liga)) {
      const dados = Object.assign({ esporte: 'basquete' }, base, basquete(r));
      if (gravar(a.arq, dados)) { feitos++; console.log(a.j.casa, a.j.p || '', a.j.fora, '| NBA', dados.box ? 'com placar completo' : 'sem placar completo'); }
      continue;
    }
    const lances = (r.keyEvents || []).map(lance).filter(Boolean);
    const esc = (r.rosters || []).filter(x => (x.roster || []).length);
    const casa = esc.find(x => x.homeAway === 'home'), fora = esc.find(x => x.homeAway === 'away');
    const dados = Object.assign(base, {
      lances, escalacoes: casa && fora ? { casa: escalacao(casa), fora: escalacao(fora) } : null, estatisticas: estatFutebol(r)
    });
    if (!gravar(a.arq, dados)) continue;
    feitos++;
    console.log(a.j.casa, a.j.p || '', a.j.fora, '|', lances.length, 'lances |', dados.escalacoes ? 'com escalações' : 'sem escalações');
  }
  /* limpa jogos antigos */
  for (const f of fs.readdirSync(PASTA)) {
    const p = path.join(PASTA, f);
    let d = ''; try { d = JSON.parse(fs.readFileSync(p, 'utf8')).d || ''; } catch (e) { /* arquivo estragado: apaga */ }
    if (!d || Date.now() - Date.parse(d + 'T12:00:00-03:00') > 10 * 864e5) fs.unlinkSync(p);
  }
  if (tiposDesconhecidos.size) console.log('lances ignorados:', [...tiposDesconhecidos].join(' | '));
  console.log('partidas: ' + alvo.length + ' jogos na janela, ' + feitos + ' arquivos novos ou mudados');
})();
