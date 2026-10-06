/* Amostra grátis de telemetria da página inicial: a volta da pole contra a do 2º colocado,
   na última classificação de F1 que já terminou. Dados do OpenF1.
   Gera assets/dados/telemetria-amostra.js. Roda no GitHub depois das sessões (f1-pos-corrida.yml) ou à mão:
   node .github/telemetria-amostra.js */
const fs = require('fs');
const path = require('path');
const T = require('../assets/js/telemetria-graf.js');
const ARQ = path.join(__dirname, '..', 'assets', 'dados', 'telemetria-amostra.js');
const espera = ms => new Promise(r => setTimeout(r, ms));

async function get(q) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch('https://api.openf1.org/v1/' + q, { signal: AbortSignal.timeout(60000) });
    if (r.status === 429 || r.status >= 500) { await espera(1500 * (i + 1)); continue; }
    const j = await r.json();
    if (Array.isArray(j)) { await espera(400); return j; }
    await espera(1500 * (i + 1));
  }
  throw new Error('OpenF1 não respondeu: ' + q);
}

const PAISES = { 'Kuala Lumpur': 'Malásia', 'Sakhir': 'Bahrein', 'Jeddah': 'Arábia Saudita', 'Melbourne': 'Austrália', 'Suzuka': 'Japão', 'Shanghai': 'China', 'Miami': 'Miami', 'Imola': 'Ímola', 'Monaco': 'Mônaco', 'Monte Carlo': 'Mônaco', 'Barcelona': 'Barcelona', 'Montréal': 'Canadá', 'Spielberg': 'Áustria', 'Silverstone': 'Inglaterra', 'Spa-Francorchamps': 'Bélgica', 'Budapest': 'Hungria', 'Zandvoort': 'Holanda', 'Monza': 'Itália', 'Madrid': 'Madri', 'Baku': 'Azerbaijão', 'Marina Bay': 'Singapura', 'Austin': 'Estados Unidos', 'Mexico City': 'Cidade do México', 'São Paulo': 'São Paulo', 'Las Vegas': 'Las Vegas', 'Lusail': 'Catar', 'Yas Marina': 'Abu Dhabi', 'Yas Island': 'Abu Dhabi' };

(async () => {
  const ano = new Date().getUTCFullYear();
  const ses = (await get('sessions?year=' + ano + '&session_name=Qualifying')).filter(s => Date.parse(s.date_end) + 30 * 60000 < Date.now());
  const s = ses[ses.length - 1];
  if (!s) { console.log('telemetria: nenhuma classificação ainda'); return; }
  const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
  if (antes.indexOf('"sessao":' + s.session_key + ',') > -1) { console.log('telemetria: já está em dia (' + s.location + ')'); return; }

  const res = (await get('session_result?session_key=' + s.session_key)).filter(r => r.position).sort((a, b) => a.position - b.position);
  if (res.length < 2) { console.log('telemetria: resultado ainda não saiu'); return; }
  const pil = await get('drivers?session_key=' + s.session_key);
  const voltas = [];
  for (const r of res.slice(0, 2)) {
    const laps = (await get('laps?session_key=' + s.session_key + '&driver_number=' + r.driver_number)).filter(l => l.lap_duration && l.date_start && !l.is_pit_out_lap);
    const v = laps.sort((a, b) => a.lap_duration - b.lap_duration)[0];
    const ini = Date.parse(v.date_start), fim = new Date(ini + v.lap_duration * 1000 + 1000).toISOString(), de = new Date(ini - 1000).toISOString();
    const car = await get('car_data?session_key=' + s.session_key + '&driver_number=' + r.driver_number + '&date>=' + de + '&date<' + fim);
    const loc = await get('location?session_key=' + s.session_key + '&driver_number=' + r.driver_number + '&date>=' + de + '&date<' + fim);
    const p = pil.find(x => x.driver_number === r.driver_number) || {};
    voltas.push({ nome: p.full_name ? p.first_name + ' ' + p.last_name.charAt(0) + p.last_name.slice(1).toLowerCase() : '#' + r.driver_number, sigla: p.name_acronym || String(r.driver_number), equipe: p.team_name || '', v: T.volta(car, loc, ini, v.lap_duration) });
  }
  if (!voltas[0].v || !voltas[1].v) { console.log('telemetria: dados de carro incompletos'); return; }
  const c = T.comparar(voltas[0].v, voltas[1].v);
  const r1 = a => a.map(x => Math.round(x)), r3 = a => a.map(x => Math.round(x * 1000) / 1000);
  const dados = {
    sessao: s.session_key, gp: 'GP ' + (PAISES[s.location] ? 'de ' + PAISES[s.location] : s.country_name), local: s.circuit_short_name, data: s.date_start.slice(0, 10),
    pilotos: voltas.map(v => ({ nome: v.nome, sigla: v.sigla, equipe: v.equipe })),
    r: { passo: c.passo, total: c.total, dist: c.dist, tempoA: c.tempoA, tempoB: c.tempoB, delta: r3(c.delta), mapa: c.mapa, trechos: c.trechos,
      a: { v: r1(c.a.v), f: c.a.f, g: c.a.g }, b: { v: r1(c.b.v), f: c.b.f, g: c.b.g } }
  };
  fs.writeFileSync(ARQ, '/* Gerado por .github/telemetria-amostra.js (dados do OpenF1). Não editar à mão. */\nwindow.TELEMETRIA_AMOSTRA = ' + JSON.stringify(dados) + ';\n');
  console.log('telemetria: ' + dados.gp + ', ' + voltas[0].sigla + ' x ' + voltas[1].sigla + ', ' + (fs.statSync(ARQ).size / 1024).toFixed(0) + ' KB');
})().catch(e => { console.error('telemetria: erro', e.message); process.exit(1); });
