/* Mapa da pista da próxima etapa da F1, com as curvas numeradas, os 3 setores e a linha de largada: assets/dados/pista-proxima.json.
   Traçado e curvas: api.multiviewer.app (posição oficial das curvas, a mesma usada pela biblioteca FastF1).
   Setores e largada: OpenF1 (posição do carro na volta mais rápida de uma sessão no mesmo circuito; tempos de setor da volta).
   Roda no GitHub (f1-pos-corrida.yml, a cada 30 min); só refaz quando a etapa muda ou quando sai uma sessão nova do fim de semana.
   No PC: node .github/pista-proxima.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/pista-proxima.json');
global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
const espera = ms => new Promise(r => setTimeout(r, ms));
async function json(url) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'automobilismonaveia.com.br' } }).catch(() => null);
    if (r && r.ok) return r.json();
    if (r && r.status === 404) return null;
    await espera(1500 * (t + 1));
  }
  return null;
}
const of1 = q => json('https://api.openf1.org/v1/' + q);

(async () => {
  const f1 = window.CATEGORIAS.find(c => c.slug === 'formula-1');
  const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
  const e = f1.calendario.find(x => !x.venc && x.d && x.d >= hoje);
  if (!e) { console.log('sem próxima etapa'); return; }
  const ano = +e.d.slice(0, 4);
  /* reunião (meeting) da OpenF1 da etapa: a que termina perto da data da corrida */
  const reunioes = (await of1('meetings?year=' + ano)) || [];
  const alvo = Date.parse(e.d + 'T12:00:00Z');
  const m = reunioes.filter(r => Math.abs(Date.parse(r.date_start) - alvo) < 5 * 864e5).sort((a, b) => Math.abs(Date.parse(a.date_start) - alvo) - Math.abs(Date.parse(b.date_start) - alvo))[0];
  if (!m) { console.log('reunião da OpenF1 não encontrada para', e.n); return; }
  await espera(600);
  /* sessão para os setores: a última já terminada deste fim de semana; se ainda não houver, a corrida do ano anterior no mesmo circuito */
  const sessoes = ((await of1('sessions?meeting_key=' + m.meeting_key)) || []).filter(s => Date.parse(s.date_end) < Date.now());
  let sessao = sessoes.sort((a, b) => Date.parse(b.date_start) - Date.parse(a.date_start))[0];
  if (!sessao) {
    await espera(600);
    const antes = ((await of1('sessions?year=' + (ano - 1) + '&circuit_key=' + m.circuit_key + '&session_name=Race')) || [])[0];
    sessao = antes || null;
  }
  const anterior = fs.existsSync(ARQ) ? JSON.parse(fs.readFileSync(ARQ, 'utf8')) : null;
  if (anterior && anterior.versao === 4 && anterior.etapa === e.n && anterior.ano === ano && anterior.sessao === (sessao && sessao.session_key)) { console.log('pista-proxima: sem novidade'); return; }

  /* traçado e curvas */
  let mv = await json('https://api.multiviewer.app/api/v1/circuits/' + m.circuit_key + '/' + ano);
  if (!mv || !mv.x) mv = await json('https://api.multiviewer.app/api/v1/circuits/' + m.circuit_key + '/' + (ano - 1));
  if (!mv || !mv.x) { console.log('sem traçado para o circuito', m.circuit_key); return; }
  const ang = (mv.rotation || 0) * Math.PI / 180, cs = Math.cos(ang), sn = Math.sin(ang);
  const gira = (x, y) => [x * cs - y * sn, x * sn + y * cs]; /* mesma rotação dos mapas oficiais (como na FastF1) */
  const trilha = mv.x.map((x, i) => gira(x, mv.y[i]));
  const curvas = (mv.corners || []).map(c => {
    const a = (c.angle || 0) * Math.PI / 180, dist = 520; /* número um pouco afastado da pista, para o lado de fora */
    const tx = c.trackPosition.x + dist * Math.cos(a), ty = c.trackPosition.y + dist * Math.sin(a);
    return { n: String(c.number) + (c.letter || ''), p: gira(c.trackPosition.x, c.trackPosition.y), t: gira(tx, ty) };
  });

  /* setores e largada pela volta mais rápida da sessão */
  let marcas = null, voltaBruta = null, clima = null;
  if (sessao) {
    await espera(600);
    const voltas = ((await of1('laps?session_key=' + sessao.session_key)) || [])
      .filter(v => v.lap_duration && v.duration_sector_1 && v.duration_sector_2 && v.date_start && !v.is_pit_out_lap)
      .sort((a, b) => a.lap_duration - b.lap_duration);
    const v = voltas[0];
    if (v) {
      await espera(600);
      const ini = Date.parse(v.date_start), fim = ini + v.lap_duration * 1000;
      const loc = ((await of1('location?session_key=' + sessao.session_key + '&driver_number=' + v.driver_number + '&date>=' + new Date(ini - 2000).toISOString() + '&date<' + new Date(fim + 2000).toISOString())) || []).filter(p => p.x || p.y);
      const ponto = ms => { /* posição do carro no instante ini + ms (interpolada) */
        const t = ini + ms; let a = loc[0], b = loc[loc.length - 1];
        for (let i = 1; i < loc.length; i++) if (Date.parse(loc[i].date) >= t) { a = loc[i - 1]; b = loc[i]; break; }
        const ta = Date.parse(a.date), tb = Date.parse(b.date), f = tb > ta ? (t - ta) / (tb - ta) : 0;
        return gira(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
      };
      if (loc.length > 50) marcas = { largada: ponto(0), s1: ponto(v.duration_sector_1 * 1000), s2: ponto((v.duration_sector_1 + v.duration_sector_2) * 1000) };
      /* volta animada: posição a cada leitura, com a velocidade e a marcha mais próximas no tempo */
      await espera(600);
      const car = ((await of1('car_data?session_key=' + sessao.session_key + '&driver_number=' + v.driver_number + '&date>=' + new Date(ini).toISOString() + '&date<' + new Date(fim).toISOString())) || []);
      await espera(600);
      const pil = (((await of1('drivers?session_key=' + sessao.session_key + '&driver_number=' + v.driver_number)) || [])[0]) || {};
      const tc = car.map(c => Date.parse(c.date));
      const perto = t => { let lo = 0, hi = tc.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (tc[mid] < t) lo = mid + 1; else hi = mid; } return car[lo] || {}; };
      if (loc.length > 50 && car.length > 50) voltaBruta = {
        sigla: pil.name_acronym || ('#' + v.driver_number), nome: pil.full_name || '', cor: pil.team_colour ? '#' + pil.team_colour : '#ffffff',
        tempo: v.lap_duration, s: [v.duration_sector_1, v.duration_sector_2, v.duration_sector_3],
        pts: loc.filter(p => { const t = Date.parse(p.date); return t >= ini && t <= fim; }).map(p => { const t = Date.parse(p.date), c = perto(t); return { p: gira(p.x, p.y), ms: t - ini, v: c.speed || 0, g: c.n_gear || 0, a: c.throttle || 0, f: c.brake || 0 }; })
      };
    }
  }

  /* resultado da última sessão deste fim de semana: os 5 primeiros */
  let ultimaSessao = null;
  if (sessao && sessao.meeting_key === m.meeting_key) {
    await espera(600);
    const res = ((await of1('session_result?session_key=' + sessao.session_key)) || []).filter(r => r.position).sort((a, b) => a.position - b.position).slice(0, 5);
    await espera(600);
    const pilotosS = (await of1('drivers?session_key=' + sessao.session_key)) || [];
    const NOME_S = { 'Practice 1': 'Treino livre 1', 'Practice 2': 'Treino livre 2', 'Practice 3': 'Treino livre 3', 'Sprint Qualifying': 'Classificação sprint', 'Sprint Shootout': 'Classificação sprint', 'Sprint': 'Sprint', 'Qualifying': 'Classificação', 'Race': 'Corrida' };
    const fmt = s => { if (s == null || isNaN(s)) return ''; const mm = Math.floor(s / 60), r = s - mm * 60; return (mm ? mm + ':' + (r < 10 ? '0' : '') : '') + r.toFixed(3); };
    if (res.length) ultimaSessao = {
      nome: NOME_S[sessao.session_name] || sessao.session_name,
      top: res.map(r => {
        const pl = pilotosS.find(x => x.driver_number === r.driver_number) || {};
        const dur = Array.isArray(r.duration) ? r.duration.filter(x => x).slice(-1)[0] : r.duration;
        const gap = Array.isArray(r.gap_to_leader) ? r.gap_to_leader.filter(x => x != null).slice(-1)[0] : r.gap_to_leader;
        return { pos: r.position, sigla: pl.name_acronym || '#' + r.driver_number, cor: pl.team_colour ? '#' + pl.team_colour : '#8e979f', equipe: pl.team_name || '',
          tempo: r.position === 1 ? fmt(dur) : (typeof gap === 'number' ? '+' + gap.toFixed(3) : (gap || '')) };
      })
    };
  }
  /* clima na pista: a última leitura da sessão */
  if (sessao) {
    await espera(600);
    const w = ((await of1('weather?session_key=' + sessao.session_key)) || []).filter(x => x.air_temperature > 1 && x.track_temperature > 1).pop();
    if (w) clima = { ar: w.air_temperature, pista: w.track_temperature, umidade: Math.round(w.humidity), vento: Math.round((w.wind_speed || 0) * 3.6), chuva: !!w.rainfall, sessao: sessao.session_name, data: w.date };
  }
  /* tudo dentro de um quadro de 400 x 400 (y para cima, como nos mapas) */
  const todos = trilha.concat(curvas.map(c => c.t));
  const xs = todos.map(p => p[0]), ys = todos.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const esc = 384 / Math.max(x1 - x0, y1 - y0), ox = (400 - (x1 - x0) * esc) / 2, oy = (400 - (y1 - y0) * esc) / 2;
  const P = p => [+(ox + (p[0] - x0) * esc).toFixed(1), +(oy + (y1 - p[1]) * esc).toFixed(1)];
  const pts = trilha.map(P);
  const perto = q => { let mi = 0, md = 1e18; pts.forEach((p, i) => { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < md) { md = d; mi = i; } }); return mi; };
  const linha = l => 'M' + l.map(p => p[0] + ' ' + p[1]).join('L');
  let setores = null, largada = null;
  if (marcas) {
    const i0 = perto(P(marcas.largada)), i1 = perto(P(marcas.s1)), i2 = perto(P(marcas.s2));
    const trecho = (a, b) => { const l = []; for (let i = a; ; i = (i + 1) % pts.length) { l.push(pts[i]); if (i === b) break; } return l; };
    setores = [linha(trecho(i0, i1)), linha(trecho(i1, i2)), linha(trecho(i2, i0))];
    largada = { p: pts[i0], prox: pts[(i0 + 3) % pts.length] };
  }
  const volta = voltaBruta ? { sigla: voltaBruta.sigla, nome: voltaBruta.nome, cor: voltaBruta.cor, tempo: voltaBruta.tempo, s: voltaBruta.s,
    pts: voltaBruta.pts.map(q => { const xy = P(q.p); return [xy[0], xy[1], q.ms, q.v, q.g, q.a, q.f]; }) } : null;
  const pit = mv.pitLoss ? { normal: +mv.pitLoss.normal || null, sc: +mv.pitLoss.sc || null, vsc: +mv.pitLoss.vsc || null } : null;
  const saida = {
    versao: 4, etapa: e.n, ano, circuito: mv.circuitName || m.circuit_short_name, sessao: sessao ? sessao.session_key : null,
    fonteSetores: sessao ? (sessao.session_name + ' ' + sessao.year) : null,
    d: linha(pts) + 'Z', setores, largada,
    curvas: curvas.map(c => ({ n: c.n, p: P(c.p), t: P(c.t) })),
    volta, clima, pit, ultimaSessao
  };
  fs.writeFileSync(ARQ, JSON.stringify(saida));
  console.log('pista-proxima:', e.n, '|', saida.circuito, '|', saida.curvas.length, 'curvas |', setores ? 'setores de ' + saida.fonteSetores : 'sem setores');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
