/* Escudos dos times de futebol e basquete: baixa do TheSportsDB (base aberta, chave gratuita) o escudo de cada time de
   assets/js/esportes-dados.js para assets/img/escudos/ e grava o mapa nome -> arquivo em assets/dados/escudos.js.
   1. pede a lista inteira de cada liga (um pedido traz todos os times com escudo) e casa os nomes;
   2. quem sobrar é procurado time a time, com limite de pedidos e de tempo.
   Grava o mapa a cada escudo baixado, então uma rodada interrompida não perde o que já fez.
   Quem não for achado aparece com as iniciais. Roda no GitHub (.github/workflows/escudos.yml) ou no PC: node .github/escudos.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'assets/img/escudos');
const ARQ = path.join(RAIZ, 'assets/dados/escudos.js');
const CHAVE = process.env.THESPORTSDB_CHAVE || '123';
const API = 'https://www.thesportsdb.com/api/v1/json/' + CHAVE + '/';
const INICIO = Date.now(), LIMITE_MS = 28 * 60e3, MAX_BUSCAS = 150, INTERVALO = 3500;
const espera = ms => new Promise(r => setTimeout(r, ms));

global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/esportes-dados.js'), 'utf8'));
let atual = {};
try { const w = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(w); atual = w.ESCUDOS || {}; } catch (e) { /* primeira vez */ }

/* ligas inteiras pedidas de uma vez (nomes do TheSportsDB) */
const LIGAS = [
  'Brazilian Serie A', 'English Premier League', 'Spanish La Liga', 'German Bundesliga', 'Italian Serie A', 'French Ligue 1',
  'Portuguese Primeira Liga', 'Dutch Eredivisie', 'Argentinian Primera Division', 'Turkish Super Lig', 'Belgian Pro League',
  'Scottish Premiership', 'Greek Superleague Greece', 'Austrian Bundesliga', 'Swiss Super League', 'English League Championship',
  'Brazilian Serie B', 'NBA', 'EuroLeague Basketball'
];
/* nomes em português que o TheSportsDB conhece por outro nome */
const APELIDO = {
  'Bayern de Munique': 'Bayern Munich', 'Inter de Milão': 'Inter Milan', 'Inter': 'Inter Milan', 'Milan': 'AC Milan', 'Roma': 'AS Roma',
  'Atlético de Madrid': 'Atletico Madrid', 'Atlético-MG': 'Atletico Mineiro', 'Athletico-PR': 'Athletico Paranaense', 'Red Bull Bragantino': 'Bragantino',
  'Olympique de Marselha': 'Marseille', 'Olympique de Lyon': 'Lyon', 'Paris Saint-Germain': 'Paris SG', 'PSG': 'Paris SG', 'Sporting': 'Sporting CP',
  'Borussia Mönchengladbach': 'Borussia Monchengladbach', 'Colônia': 'FC Koln', 'Estrela Vermelha': 'Crvena Zvezda', 'Remo': 'Clube do Remo',
  'Vitória': 'Vitoria', 'Grêmio': 'Gremio', 'São Paulo': 'Sao Paulo', 'Ceará': 'Ceara', 'Bahia': 'Bahia', 'Juventude': 'Juventude',
  'Napoli': 'SSC Napoli', 'Lazio': 'Lazio', 'Mônaco': 'Monaco', 'Nice': 'Nice', 'Lille': 'Lille', 'Rennes': 'Rennes', 'Lens': 'Lens',
  'Tottenham': 'Tottenham Hotspur', 'Wolverhampton': 'Wolverhampton Wanderers', 'Newcastle': 'Newcastle United', 'West Ham': 'West Ham United',
  'Leverkusen': 'Bayer Leverkusen', 'Bayer Leverkusen': 'Bayer Leverkusen', 'Eintracht Frankfurt': 'Eintracht Frankfurt', 'Stuttgart': 'VfB Stuttgart',
  'Hoffenheim': 'TSG Hoffenheim', 'Wolfsburg': 'VfL Wolfsburg', 'Freiburg': 'SC Freiburg', 'Mainz': 'Mainz 05', 'Hamburgo': 'Hamburger SV',
  'ASVEL': 'LDLC ASVEL', 'Bodø/Glimt': 'Bodo Glimt', 'AEK Atenas': 'AEK Athens', 'Crvena Zvezda': 'Crvena Zvezda', 'Žalgiris': 'Zalgiris Kaunas',
  'Olympiacos': 'Olympiacos BC', 'Panathinaikos': 'Panathinaikos BC', 'LA Clippers': 'Los Angeles Clippers', 'Málaga': 'Malaga', 'Mainz 05': 'Mainz',
  'Benfica': 'Benfica', 'Porto': 'FC Porto', 'Fenerbahçe': 'Fenerbahce', 'Galatasaray': 'Galatasaray', 'Slavia Praga': 'Slavia Prague'
};
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\b(fc|cf|ac|as|sc|afc|ssc|ec|se|cr|ca|club|clube|de|da|do|futebol|calcio|sv|vfb|vfl|tsg|bc|kk|bk)\b/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const arquivo = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* todos os times, com o esporte */
const times = {};
for (const c of window.COMPETICOES) {
  const add = n => { if (n && !/^(a definir|vencedor|perdedor)/i.test(n) && !times[n]) times[n] = { esporte: c.esporte }; };
  (c.jogos || []).forEach(j => { add(j.casa); add(j.fora); });
  (c.confrontos || []).forEach(x => { add(x.a); add(x.b); });
  [c.tabela, c.tabela2].forEach(t => { if (!t) return; const i = t.colunas.indexOf('Time'); if (i > -1) t.linhas.forEach(l => add(l[i])); });
}

async function pedir(u) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)' } });
      if (r.status === 429) { await espera(30000); continue; } /* pediu demais: espera meio minuto */
      return r.ok ? r : null;
    } catch (e) { /* tempo esgotado ou rede: tenta de novo uma vez */ }
  }
  return null;
}
async function json(u) { const r = await pedir(u); try { return r ? await r.json() : null; } catch (e) { return null; } }

function gravar() {
  const ordenado = {}; Object.keys(atual).sort().forEach(k => { ordenado[k] = atual[k]; });
  fs.writeFileSync(ARQ, '/* Gerado por .github/escudos.js. Não editar à mão. Escudos: TheSportsDB (thesportsdb.com). */\nwindow.ESCUDOS = ' + JSON.stringify(ordenado) + ';\n');
}
async function baixar(nome, time) {
  const destino = 'assets/img/escudos/' + arquivo(nome) + '.png';
  for (const u of [time.strBadge + '/small', time.strBadge]) {
    const r = await pedir(u);
    if (!r || !/image/.test(r.headers.get('content-type') || '')) continue;
    const img = Buffer.from(await r.arrayBuffer());
    if (img.length < 200) continue;
    fs.writeFileSync(path.join(RAIZ, destino), img);
    atual[nome] = destino; gravar();
    console.log('  ok:', nome, '->', time.strTeam, '(' + (time.strCountry || '') + ')');
    return true;
  }
  return false;
}
/* casa o nome do site com um time da lista: nome igual (sem acento e sem FC, SC...) ou um dos nomes alternativos */
function casar(nome, lista, esporte) {
  const alvos = [norm(APELIDO[nome] || nome), norm(nome)];
  /* fora times femininos e de base (o nome vem com acento, por isso compara sem acento) */
  const ok = lista.filter(t => t.strBadge && t.strSport === (esporte === 'basquete' ? 'Basketball' : 'Soccer') && !/women|feminin|femenin|ladies|\bu ?\d\d\b|\bii\b/.test(norm(t.strTeam)));
  const nomesDe = t => [t.strTeam, t.strTeamShort].concat(String(t.strTeamAlternate || '').split(',')).filter(Boolean).map(norm);
  return ok.find(t => nomesDe(t).some(n => alvos.includes(n))) ||
    ok.find(t => nomesDe(t).some(n => alvos.some(a => a.length >= 5 && n.startsWith(a + ' ')))); /* só no começo: 'Sporting' não pode virar 'Ceará Sporting' */
}

(async () => {
  fs.mkdirSync(PASTA, { recursive: true });
  let faltam = Object.keys(times).filter(n => !atual[n] || !fs.existsSync(path.join(RAIZ, atual[n])));
  console.log('times:', Object.keys(times).length, '| sem escudo:', faltam.length);

  /* 1. ligas inteiras */
  const todos = [];
  for (const l of LIGAS) {
    const j = await json(API + 'search_all_teams.php?l=' + encodeURIComponent(l));
    const lista = (j && (j.teams || j.countries)) || [];
    console.log('liga', l + ':', lista.length, 'times');
    todos.push(...lista);
    await espera(INTERVALO);
  }
  for (const nome of faltam) {
    const t = casar(nome, todos, times[nome].esporte);
    if (t) await baixar(nome, t);
  }

  /* 2. quem sobrou: busca time a time, com limite */
  faltam = faltam.filter(n => !atual[n]);
  console.log('depois das ligas, faltam:', faltam.length);
  let buscas = 0;
  for (const nome of faltam) {
    if (buscas >= MAX_BUSCAS || Date.now() - INICIO > LIMITE_MS) { console.log('limite atingido; o resto fica para a próxima rodada'); break; }
    let achado = null;
    for (const termo of [...new Set([APELIDO[nome], nome])].filter(Boolean)) {
      const j = await json(API + 'searchteams.php?t=' + encodeURIComponent(termo)); buscas++;
      await espera(INTERVALO); /* a chave gratuita aceita poucos pedidos por minuto */
      achado = casar(nome, (j && j.teams) || [], times[nome].esporte);
      if (achado) break;
    }
    if (!achado || !(await baixar(nome, achado))) console.log('  não achei:', nome);
  }
  gravar();
  console.log('escudos:', Object.keys(atual).length, 'de', Object.keys(times).length);
})();
