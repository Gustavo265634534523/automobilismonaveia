/* Placar automático do futebol e da NBA: busca na ESPN (API pública do site da ESPN, sem chave) os jogos dos últimos
   10 dias e das próximas 3 semanas, as classificações das ligas, a artilharia do futebol, os líderes de estatística da NBA e o craque do jogo
   principal de cada dia, e grava tudo em
   assets/dados/ao-vivo.js (window.AO_VIVO). O site junta esses dados aos de esportes-dados.js (assets/js/esportes-mais.js):
   o que vem daqui vale mais para placar, horário e tabela; o resto (textos, fases, notas) continua vindo de lá.
   Euroleague e NBB não estão na ESPN e continuam à mão.
   Nomes dos times: o robô usa o nome que o site já usa (Bayern de Munique, Inter de Milão...). Time novo, que o site ainda
   não conhece, entra com o nome da ESPN e o escudo da ESPN. Quem não casou fica listado em .github/placar-relatorio.txt.
   Roda no GitHub (.github/workflows/placar.yml) a cada 30 minutos ou no PC: node .github/placar.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/ao-vivo.js');
const ARQ_ESC = path.join(RAIZ, 'assets/dados/escudos.js');
const RELATORIO = path.join(__dirname, 'placar-relatorio.txt');
const API = 'https://site.api.espn.com/apis/site/v2/sports/';
const API_TAB = 'https://site.api.espn.com/apis/v2/sports/';

global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/esportes-dados.js'), 'utf8'));
const esc0 = {}; try { new Function('window', fs.readFileSync(ARQ_ESC, 'utf8'))(esc0); } catch (e) { /* sem escudos */ }
const ESCUDOS = esc0.ESCUDOS || {};

/* campeonato do site -> liga na ESPN. tabela: a ESPN tem classificação (pontos corridos ou fase de liga) */
const LIGAS = [
  { slug: 'brasileirao', liga: 'soccer/bra.1', tabela: true },
  { slug: 'copa-do-brasil', liga: 'soccer/bra.copa_do_brazil' },
  { slug: 'libertadores', liga: 'soccer/conmebol.libertadores' },
  { slug: 'sul-americana', liga: 'soccer/conmebol.sudamericana' },
  { slug: 'champions-league', liga: 'soccer/uefa.champions', tabela: true },
  { slug: 'premier-league', liga: 'soccer/eng.1', tabela: true },
  { slug: 'la-liga', liga: 'soccer/esp.1', tabela: true },
  { slug: 'bundesliga', liga: 'soccer/ger.1', tabela: true },
  { slug: 'serie-a', liga: 'soccer/ita.1', tabela: true },
  { slug: 'ligue-1', liga: 'soccer/fra.1', tabela: true },
  { slug: 'nba', liga: 'basketball/nba', tabela: true }
];

/* nome da ESPN -> nome usado no site (só quando a comparação sem acento não resolve) */
const APELIDO = {
  'Bayern Munich': 'Bayern de Munique', 'Internazionale': 'Inter de Milão', 'Inter Milan': 'Inter de Milão', 'AC Milan': 'Milan', 'AS Roma': 'Roma',
  'Atlético Madrid': 'Atlético de Madrid', 'Atletico Madrid': 'Atlético de Madrid', 'Atlético-MG': 'Atlético-MG', 'Atletico-MG': 'Atlético-MG', 'Atlético Mineiro': 'Atlético-MG',
  'Athletico-PR': 'Athletico-PR', 'Athletico Paranaense': 'Athletico-PR', 'Bragantino': 'Red Bull Bragantino', 'RB Bragantino': 'Red Bull Bragantino',
  'Vasco da Gama': 'Vasco', 'Marseille': 'Olympique de Marselha', 'Olympique Marseille': 'Olympique de Marselha', 'Olympique Lyonnais': 'Lyon',
  'Paris Saint-Germain': 'Paris Saint-Germain', 'Sporting CP': 'Sporting', 'Borussia Monchengladbach': 'Borussia Mönchengladbach',
  '1. FC Köln': 'Colônia', 'FC Cologne': 'Colônia', 'FC Koln': 'Colônia', 'Hamburg SV': 'Hamburgo', 'Hamburger SV': 'Hamburgo', 'Mainz': 'Mainz 05', '1. FSV Mainz 05': 'Mainz 05',
  'VfB Stuttgart': 'Stuttgart', 'SC Freiburg': 'Freiburg', 'TSG Hoffenheim': 'Hoffenheim', 'FC Augsburg': 'Augsburg', 'SV Elversberg': 'Elversberg', 'SC Paderborn 07': 'Paderborn',
  'Tottenham Hotspur': 'Tottenham', 'Newcastle United': 'Newcastle', 'Brighton & Hove Albion': 'Brighton', 'AFC Bournemouth': 'Bournemouth', 'Wolverhampton Wanderers': 'Wolverhampton',
  'West Ham United': 'West Ham', 'Leeds': 'Leeds United', 'Ipswich': 'Ipswich Town', 'Hull': 'Hull City', 'Coventry': 'Coventry City',
  'Deportivo La Coruna': 'Deportivo La Coruña', 'Deportivo de La Coruña': 'Deportivo La Coruña', 'Celta Vigo': 'Celta de Vigo', 'Athletic Club': 'Athletic Bilbao', 'Alaves': 'Alavés', 'Racing de Santander': 'Racing Santander',
  'Malaga': 'Málaga', 'Spal': 'SPAL', 'Bodo/Glimt': 'Bodø/Glimt', 'FK Bodo/Glimt': 'Bodø/Glimt', 'AEK Athens': 'AEK Atenas', 'Slavia Prague': 'Slavia Praga', 'Fenerbahce': 'Fenerbahçe',
  'PSV Eindhoven': 'PSV', 'FC Porto': 'Porto', 'Club Brugge KV': 'Club Brugge', 'Shakhtar': 'Shakhtar Donetsk', 'Monaco': 'Monaco', 'AS Monaco': 'Monaco',
  'Stade Rennais': 'Rennes', 'Stade Brestois': 'Brest', 'Strasbourg': 'Strasbourg', 'RC Strasbourg': 'Strasbourg', 'Le Havre AC': 'Le Havre',
  'Gremio': 'Grêmio', 'Sao Paulo': 'São Paulo', 'Vitoria': 'Vitória', 'Ceara': 'Ceará', 'Clube do Remo': 'Remo', 'Chapecoense-SC': 'Chapecoense',
  'Estudiantes de La Plata': 'Estudiantes', 'Deportivo': 'Deportivo La Coruña', 'LASK Linz': 'LASK', 'Viking FK': 'Viking', 'LA Clippers': 'LA Clippers', 'Los Angeles Clippers': 'LA Clippers'
};
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\b(fc|cf|ac|as|sc|afc|ssc|ec|se|cr|ca|club|clube|de|da|do|futebol|calcio|sv|vfb|vfl|tsg|bc|1)\b/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const arquivo = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* nomes que o site já conhece, por esporte */
const conhecidos = { soccer: {}, basketball: {} };
for (const c of window.COMPETICOES) {
  const k = c.esporte === 'basquete' ? 'basketball' : 'soccer';
  const add = n => { if (n && !/^(a definir|vencedor|perdedor)/i.test(n)) conhecidos[k][norm(n)] = n; };
  (c.jogos || []).forEach(j => { add(j.casa); add(j.fora); });
  (c.confrontos || []).forEach(x => { add(x.a); add(x.b); });
  [c.tabela, c.tabela2].forEach(t => { if (!t) return; const i = t.colunas.indexOf('Time'); if (i > -1) t.linhas.forEach(l => add(l[i])); });
}
Object.keys(ESCUDOS).forEach(n => { conhecidos.soccer[norm(n)] = conhecidos.soccer[norm(n)] || n; });

const naoCasou = new Set(), novosEscudos = [];
const ids = {}; /* 's123' / 'b13' -> nome no site, para o placar ao vivo no navegador */
function nomeSite(team, esporte) {
  const k = esporte === 'basketball' ? 'basketball' : 'soccer';
  const cand = [team.displayName, team.shortDisplayName, team.name, team.location].filter(Boolean);
  let nome = null;
  for (const c of cand) { if (APELIDO[c]) { nome = APELIDO[c]; break; } }
  if (!nome) for (const c of cand) { const n = conhecidos[k][norm(c)]; if (n) { nome = n; break; } }
  if (!nome) { nome = team.displayName; naoCasou.add(esporte + ': ' + team.displayName + ' (id ' + team.id + ')'); }
  ids[(k === 'basketball' ? 'b' : 's') + team.id] = nome;
  if (!ESCUDOS[nome] && team.id && esporte === 'soccer') novosEscudos.push({ nome, id: team.id });
  return nome;
}

async function pedir(u, tipo) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) NaVeia/1.0' } });
      if (!r.ok) { if (r.status >= 500) continue; return null; }
      return tipo === 'buffer' ? Buffer.from(await r.arrayBuffer()) : await r.json();
    } catch (e) { /* rede: tenta de novo */ }
  }
  return null;
}

/* horário de Brasília (UTC-3, sem horário de verão) */
function brasilia(iso) {
  const t = new Date(Date.parse(iso) - 3 * 3600e3).toISOString();
  return { d: t.slice(0, 10), h: t.slice(11, 16) };
}
const DIAS_ANTES = 7, DIAS_DEPOIS = 16;
const ymd = dt => dt.toISOString().slice(0, 10).replace(/-/g, '');
const FASES = [
  [/final/i, 'Final'], [/semi/i, 'Semifinal'], [/quarter/i, 'Quartas de final'], [/round of 16|octavos|eighth/i, 'Oitavas de final'],
  [/knockout round playoff|playoff/i, 'Playoff'], [/round of 32/i, 'Segunda fase'], [/third round/i, 'Terceira fase'], [/group/i, 'Fase de grupos']
];
function fase(ev, comp) {
  const nota = ((comp.notes || [])[0] || {}).headline || (ev.season && ev.season.slug) || '';
  let f = '';
  for (const [re, nome] of FASES) if (re.test(nota)) { f = nome; break; }
  if (f && /1st leg|first leg|ida/i.test(nota)) f += ' – ida';
  if (f && /2nd leg|second leg|volta/i.test(nota)) f += ' – volta';
  return f;
}

function jogoDe(ev, esporte) {
  const comp = (ev.competitions || [])[0]; if (!comp) return null;
  const casa = comp.competitors.find(x => x.homeAway === 'home'), fora = comp.competitors.find(x => x.homeAway === 'away');
  if (!casa || !fora) return null;
  const st = ev.status || comp.status || {}, tipo = st.type || {};
  const { d, h } = brasilia(ev.date);
  const j = { id: ev.id, d, h, casa: nomeSite(casa.team, esporte), fora: nomeSite(fora.team, esporte) };
  const f = esporte === 'basketball' ? (/cup|group/i.test(((comp.notes || [])[0] || {}).headline || '') ? 'Copa da NBA' : (ev.season && ev.season.type === 3 ? 'Playoffs' : '')) : fase(ev, comp);
  if (f) j.fase = f;
  if (comp.venue && comp.venue.fullName) j.l = comp.venue.fullName;
  const placar = (casa.score || '0') + ' x ' + (fora.score || '0');
  if (tipo.state === 'post' && tipo.completed) {
    j.p = placar;
    if (casa.shootoutScore != null && fora.shootoutScore != null) j.pen = casa.shootoutScore + ' x ' + fora.shootoutScore;
  } else if (tipo.state === 'in') {
    j.vivo = { p: placar, min: tipo.shortDetail || st.displayClock || '' };
  } else if (/POSTPONED|CANCELED|SUSPENDED/.test(tipo.name || '')) {
    j.adiado = true; delete j.h;
  } else if (tipo.name === 'STATUS_SCHEDULED' && /TBD/i.test(tipo.shortDetail || '')) {
    delete j.h; /* horário a confirmar */
  }
  return j;
}

async function jogosDa(l) {
  const hoje = new Date(), de = new Date(hoje - DIAS_ANTES * 864e5), ate = new Date(+hoje + DIAS_DEPOIS * 864e5);
  const esporte = l.liga.split('/')[0];
  const eventos = [];
  /* um pedido por dia (o intervalo de datas não funciona no futebol), de 6 em 6 ao mesmo tempo */
  const dias = [];
  for (let t = +de; t <= +ate; t += 864e5) dias.push(ymd(new Date(t)));
  for (let i = 0; i < dias.length; i += 6) {
    const r = await Promise.all(dias.slice(i, i + 6).map(d => pedir(API + l.liga + '/scoreboard?limit=200&dates=' + d)));
    r.forEach(j => { if (j && j.events) eventos.push(...j.events); });
  }
  const vistos = new Set();
  /* na NBA, fora a pré-temporada (season.type 1) */
  return eventos.filter(e => !vistos.has(e.id) && vistos.add(e.id) && !(esporte === 'basketball' && e.season && e.season.type === 1)).map(e => jogoDe(e, esporte)).filter(Boolean)
    .sort((a, b) => (a.d + (a.h || '')) < (b.d + (b.h || '')) ? -1 : 1);
}

function stat(e, nome) { const s = (e.stats || []).find(x => x.name === nome); return s ? s.value : null; }
async function tabelaDa(l) {
  const esporte = l.liga.split('/')[0];
  const j = await pedir(API_TAB + l.liga + '/standings' + (esporte === 'basketball' ? '?seasontype=2' : ''));
  if (!j) return null;
  const grupos = (j.children && j.children.length ? j.children : [j]).filter(g => g.standings && g.standings.entries && g.standings.entries.length);
  if (!grupos.length) return null;
  if (esporte === 'basketball') {
    const conf = grupos.map(g => {
      const ent = g.standings.entries.slice().sort((a, b) => (stat(a, 'playoffSeed') || 99) - (stat(b, 'playoffSeed') || 99));
      return { nome: /east/i.test(g.name) ? 'Leste' : 'Oeste', linhas: ent.map((e, i) => [String(i + 1), nomeSite(e.team, esporte), stat(e, 'wins') + '-' + stat(e, 'losses')]),
        jogos: ent.reduce((s, e) => s + (stat(e, 'wins') || 0) + (stat(e, 'losses') || 0), 0) };
    });
    /* temporada ainda não começou (ou a ESPN ainda devolve a passada): fica a tabela do site */
    const maxJ = Math.max(...conf.map(c => Math.max(...c.linhas.map(x => x[2].split('-').reduce((a, b) => +a + +b, 0)))));
    if (!maxJ || maxJ > diasDeTemporada() + 1) return null;
    const L = conf.find(c => c.nome === 'Leste') || conf[0], O = conf.find(c => c.nome === 'Oeste') || conf[1];
    return {
      tabela: { titulo: 'Conferência Leste', colunas: ['Pos', 'Time', 'V-D'], linhas: L.linhas },
      tabela2: O ? { titulo: 'Conferência Oeste', colunas: ['Pos', 'Time', 'V-D'], linhas: O.linhas } : undefined
    };
  }
  const ent = grupos[0].standings.entries.slice().sort((a, b) => (stat(a, 'rank') || 99) - (stat(b, 'rank') || 99) || (stat(b, 'points') || 0) - (stat(a, 'points') || 0));
  const jogados = ent.reduce((s, e) => s + (stat(e, 'gamesPlayed') || 0), 0);
  if (!jogados) return null;
  const sg = v => (v > 0 ? '+' : '') + v;
  return {
    tabela: {
      titulo: 'Classificação', colunas: ['Pos', 'Time', 'Pts', 'J', 'V', 'E', 'D', 'SG'],
      linhas: ent.map((e, i) => [String(stat(e, 'rank') || i + 1), nomeSite(e.team, esporte), String(stat(e, 'points')), String(stat(e, 'gamesPlayed')),
        String(stat(e, 'wins')), String(stat(e, 'ties')), String(stat(e, 'losses')), sg(stat(e, 'pointDifferential') || 0)])
    }
  };
}

/* artilharia (futebol): os 10 que mais fizeram gol no campeonato, pela página de estatísticas da ESPN */
const relArt = [];
async function artilhariaDa(l) {
  const j = await pedir(API + l.liga + '/statistics');
  const g = j && (j.stats || []).find(s => /goals/i.test(s.name || '') || /scor/i.test(s.displayName || ''));
  if (!g || !g.leaders || !g.leaders.length) { relArt.push(l.slug + ': sem artilharia na ESPN'); return null; }
  const linhas = g.leaders.slice(0, 10).map(x => {
    const a = x.athlete || {}, t = a.team || x.team || {};
    const gols = Math.round(x.value || parseFloat(String(x.displayValue || '').replace(/.*Goals?:\s*/i, '')) || 0);
    return [a.displayName || a.shortName || '', t.displayName || t.name ? nomeSite(t, 'soccer') : '', String(gols)];
  }).filter(x => x[0] && +x[2] > 0);
  relArt.push(l.slug + ': ' + linhas.length + ' artilheiros' + (linhas[0] ? ' (1º ' + linhas[0].join(' / ') + ')' : ''));
  return linhas.length ? linhas : null;
}

/* dias desde o começo da temporada regular da NBA (por volta de 20 de outubro) */
function diasDeTemporada() {
  const h = new Date(), ano = h.getUTCMonth() >= 8 ? h.getUTCFullYear() : h.getUTCFullYear() - 1;
  return Math.max(0, Math.floor((h - Date.UTC(ano, 9, 20)) / 864e5));
}

/* líderes da NBA (pontos, rebotes e assistências por jogo). Começo de temporada sem jogos suficientes: usa a anterior. */
async function lideresNBA() {
  const agora = new Date(), ano = agora.getUTCMonth() >= 8 ? agora.getUTCFullYear() + 1 : agora.getUTCFullYear();
  for (const temporada of [ano, ano - 1]) {
    const out = { temporada: (temporada - 1) + '/' + String(temporada).slice(2) };
    for (const [chave, campo] of [['pts', 'avgPoints'], ['reb', 'avgRebounds'], ['ast', 'avgAssists']]) {
      out[chave] = await porAtleta(temporada, campo);
    }
    /* a ESPN devolve a temporada passada quando a atual ainda não tem números: confere pelo número de jogos */
    const maxJ = Math.max(0, ...out.pts.map(x => +x[3] || 0));
    if (temporada === ano && maxJ > diasDeTemporada() + 1) continue;
    if (out.pts.length >= 5) return out;
  }
  return null;
}
async function porAtleta(temporada, campo) {
  const grupo = campo === 'avgRebounds' ? 'general' : 'offensive';
  const u = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete?region=us&lang=en&contentorigin=espn&isqualified=true&page=1&limit=10&season=' + temporada + '&seasontype=2&sort=' + grupo + '.' + campo + ':desc';
  const j = await pedir(u);
  if (!j || !j.athletes) return [];
  const cats = j.categories || [];
  return j.athletes.slice(0, 10).map(a => {
    let valor = null, jogos = null;
    (a.categories || []).forEach((c, i) => {
      const nomes = (cats.find(x => x.name === c.name) || cats[i] || {}).names || [];
      const k = nomes.indexOf(campo); if (k > -1 && c.values) valor = c.values[k];
      const g = nomes.indexOf('gamesPlayed'); if (g > -1 && c.values && jogos == null) jogos = c.values[g];
    });
    const at = a.athlete || {};
    const time = at.teamName || at.teamShortName || '';
    return valor == null ? null : [at.displayName, nomeTimeNBA(at), valor.toFixed(1).replace('.', ','), jogos == null ? '' : String(Math.round(jogos)), (at.headshot && at.headshot.href) || ''];
  }).filter(Boolean);
}
/* o time do jogador vem só com a sigla ou o apelido: casa com o nome completo que o site usa */
function nomeTimeNBA(at) {
  const cand = [at.teamName, at.teamShortName].filter(Boolean).map(norm);
  const lista = Object.values(conhecidos.basketball);
  return lista.find(n => cand.some(c => norm(n) === c || norm(n).endsWith(' ' + c))) || at.teamName || at.teamShortName || '';
}

/* craque do jogo: o jogo principal de cada dia (os dois últimos dias com jogo encerrado), por esporte, e o melhor em
   quadra/campo pelos números da ESPN. Futebol: gols, assistências, chutes no gol e defesas. Basquete: pontos, rebotes,
   assistências, roubos e tocos. Quem é do time que venceu leva um pequeno bônus. */
const GRANDES = {
  soccer: /Flamengo|Palmeiras|Corinthians|São Paulo|Santos|Vasco|Fluminense|Botafogo|Grêmio|Internacional|Atlético-MG|Cruzeiro|Real Madrid|Barcelona|Paris Saint-Germain|Bayern|Liverpool|Arsenal|Manchester City|Manchester United|Chelsea|Inter de Milão|Milan|Juventus|Atlético de Madrid|Borussia Dortmund|Boca Juniors|River Plate/,
  basketball: /Lakers|Celtics|Knicks|Warriors|76ers|Heat|Thunder|Spurs|Nuggets|Bucks|Cavaliers|Mavericks|Timberwolves/
};
const PESO_COMP = { 'champions-league': 3, libertadores: 2.5, 'copa-do-brasil': 2.2, brasileirao: 2, 'sul-americana': 1.5, 'premier-league': 1.6, 'la-liga': 1.4, 'serie-a': 1.2, bundesliga: 1.2, 'ligue-1': 1, nba: 1 };
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
function lista(p) { return p.length > 1 ? p.slice(0, -1).join(', ') + ' e ' + p[p.length - 1] : p[0] || ''; }
async function craqueFutebol(liga, j, vence) {
  const r = await pedir(API + liga + '/summary?event=' + j.id);
  if (!r || !r.rosters) return null;
  let melhor = null;
  for (const lado of r.rosters) {
    const time = nomeSite(lado.team || {}, 'soccer');
    for (const a of lado.roster || []) {
      const st = {}; (a.stats || []).forEach(x => { st[x.name] = num(x.value); });
      const g = st.totalGoals || 0, as = st.goalAssists || 0, cg = st.shotsOnTarget || 0, df = st.saves || 0;
      const nota = g * 4 + as * 3 + cg * .5 + df * .5 + (time === vence ? .8 : 0);
      if (!g && !as && df < 4) continue;
      if (!melhor || nota > melhor.nota) {
        const p = []; if (g) p.push(g === 1 ? '1 gol' : g + ' gols'); if (as) p.push(plural(as, 'assistência', 'assistências')); if (df >= 4 && !g) p.push(plural(df, 'defesa', 'defesas'));
        if (cg > g && g + as < 3) p.push(plural(cg, 'chute no gol', 'chutes no gol'));
        melhor = { nota, nome: (a.athlete || {}).displayName, time, linha: lista(p), pos: (a.position || {}).abbreviation || '' };
      }
    }
  }
  return melhor && melhor.nome ? melhor : null;
}
async function craqueBasquete(liga, j, vence) {
  const r = await pedir(API + liga + '/summary?event=' + j.id);
  const lados = r && r.boxscore && r.boxscore.players;
  if (!lados) return null;
  let melhor = null;
  for (const lado of lados) {
    const time = nomeSite(lado.team || {}, 'basketball');
    const bloco = (lado.statistics || [])[0] || {}, rot = (bloco.labels || bloco.names || []).map(x => String(x).toUpperCase());
    const ix = k => rot.indexOf(k);
    for (const a of bloco.athletes || []) {
      const v = a.stats || []; if (!v.length) continue;
      const pts = num(v[ix('PTS')]), reb = num(v[ix('REB')]), ast = num(v[ix('AST')]), stl = num(v[ix('STL')]), blk = num(v[ix('BLK')]), to = num(v[ix('TO')]);
      const nota = pts + reb * 1.2 + ast * 1.5 + stl * 2 + blk * 2 - to + (time === vence ? 3 : 0);
      if (!melhor || nota > melhor.nota) {
        const p = [plural(pts, 'ponto', 'pontos'), plural(reb, 'rebote', 'rebotes'), plural(ast, 'assistência', 'assistências')];
        if (stl >= 3) p.push(plural(stl, 'roubo', 'roubos')); if (blk >= 3) p.push(plural(blk, 'toco', 'tocos'));
        const ath = a.athlete || {};
        melhor = { nota, nome: ath.displayName, time, linha: lista(p), foto: (ath.headshot || {}).href || '' };
      }
    }
  }
  return melhor && melhor.nome ? melhor : null;
}
async function craques(comps, antes) {
  const out = {}, velho = (antes && antes.craques) || {};
  for (const [esporte, chave] of [['soccer', 'futebol'], ['basketball', 'basquete']]) {
    const porDia = {};
    for (const l of LIGAS.filter(x => x.liga.startsWith(esporte))) {
      for (const j of ((comps[l.slug] || {}).jogos || [])) {
        if (!j.p || !j.id) continue;
        const peso = (PESO_COMP[l.slug] || 1) + (GRANDES[esporte].test(j.casa) ? 2 : 0) + (GRANDES[esporte].test(j.fora) ? 2 : 0);
        if (!porDia[j.d] || peso > porDia[j.d].peso) porDia[j.d] = { l, j, peso };
      }
    }
    const dias = Object.keys(porDia).sort().reverse().slice(0, 2);
    out[chave] = [];
    for (const d of dias) {
      const { l, j, peso } = porDia[d];
      if (peso < 3) continue; /* dia sem jogo grande: fica de fora */
      const guardado = (velho[chave] || []).find(x => x.id === j.id && x.jogador);
      let jogador = guardado ? guardado.jogador : null;
      if (!jogador) {
        const [a, b] = j.p.split(' x ').map(Number), vence = a > b ? j.casa : b > a ? j.fora : '';
        const c = esporte === 'soccer' ? await craqueFutebol(l.liga, j, vence) : await craqueBasquete(l.liga, j, vence);
        if (c) { delete c.nota; jogador = c; }
      }
      console.log('craque', chave, d, j.casa, j.p, j.fora, '->', jogador ? jogador.nome + ' (' + jogador.linha + ')' : 'sem dados');
      if (jogador) out[chave].push({ id: j.id, comp: l.slug, d: j.d, casa: j.casa, fora: j.fora, p: j.p, jogador });
    }
    if (!out[chave].length && velho[chave]) out[chave] = velho[chave];
  }
  return out;
}

(async () => {
  let antes = {};
  try { const w = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(w); antes = w.AO_VIVO || {}; } catch (e) { /* primeira vez */ }
  const comps = {};
  for (const l of LIGAS) {
    const jogos = await jogosDa(l);
    const t = l.tabela ? await tabelaDa(l) : null;
    const art = l.liga.startsWith('soccer') ? await artilhariaDa(l) : null;
    if (!jogos.length && !t) { if (antes.comps && antes.comps[l.slug]) comps[l.slug] = antes.comps[l.slug]; console.log(l.slug + ': sem resposta, mantém o anterior'); continue; }
    const hoje = new Date();
    comps[l.slug] = Object.assign({ liga: l.liga, de: brasilia(new Date(hoje - DIAS_ANTES * 864e5).toISOString()).d, ate: brasilia(new Date(+hoje + DIAS_DEPOIS * 864e5).toISOString()).d, jogos }, t || {}, art ? { artilharia: art } : (antes.comps && antes.comps[l.slug] && antes.comps[l.slug].artilharia ? { artilharia: antes.comps[l.slug].artilharia } : {}));
    console.log(l.slug + ':', jogos.length, 'jogos', t ? '+ tabela' : '');
  }
  if (!Object.keys(comps).length) { console.log('a ESPN não respondeu; nada muda'); return; }
  const lideres = await lideresNBA();
  if (lideres) console.log('líderes NBA', lideres.temporada, lideres.pts.length);

  /* escudo da ESPN para time que o site ainda não tem */
  for (const n of novosEscudos) {
    if (ESCUDOS[n.nome]) continue;
    const img = await pedir('https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/' + n.id + '.png&w=96&h=96', 'buffer');
    if (!img || img.length < 300) continue;
    const destino = 'assets/img/escudos/espn-' + arquivo(n.nome) + '.png';
    fs.writeFileSync(path.join(RAIZ, destino), img);
    ESCUDOS[n.nome] = destino;
    console.log('escudo novo:', n.nome);
  }
  if (novosEscudos.length) {
    const ord = {}; Object.keys(ESCUDOS).sort().forEach(k => { ord[k] = ESCUDOS[k]; });
    const cab = fs.readFileSync(ARQ_ESC, 'utf8').split('\n')[0];
    fs.writeFileSync(ARQ_ESC, cab + '\nwindow.ESCUDOS = ' + JSON.stringify(ord) + ';\n');
  }

  const craque = await craques(comps, antes);
  const dados = { comps, lideres: lideres ? { nba: lideres } : (antes.lideres || {}), craques: craque, ids };
  const igual = JSON.stringify(dados) === JSON.stringify({ comps: antes.comps, lideres: antes.lideres, craques: antes.craques, ids: antes.ids });
  if (igual) { console.log('sem novidade'); return; }
  dados.atualizado = new Date().toISOString();
  fs.writeFileSync(ARQ, '/* Gerado por .github/placar.js (dados: ESPN). Não editar à mão. */\nwindow.AO_VIVO = ' + JSON.stringify(dados) + ';\n');
  fs.writeFileSync(RELATORIO, 'Artilharia:\n' + relArt.join('\n') + '\n\nTimes da ESPN que não casaram com um nome do site (entram com o nome da ESPN; acrescente em APELIDO no placar.js se for o mesmo time):\n' + [...naoCasou].sort().join('\n') + '\n');
  console.log('gravado. não casaram:', naoCasou.size);
})();
