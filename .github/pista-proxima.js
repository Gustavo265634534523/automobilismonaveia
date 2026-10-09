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
  if (anterior && anterior.etapa === e.n && anterior.ano === ano && anterior.sessao === (sessao && sessao.session_key)) { console.log('pista-proxima: sem novidade'); return; }

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
  let marcas = null;
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
    }
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
  const saida = {
    etapa: e.n, ano, circuito: mv.circuitName || m.circuit_short_name, sessao: sessao ? sessao.session_key : null,
    fonteSetores: sessao ? (sessao.session_name + ' ' + sessao.year) : null,
    d: linha(pts) + 'Z', setores, largada,
    curvas: curvas.map(c => ({ n: c.n, p: P(c.p), t: P(c.t) }))
  };
  fs.writeFileSync(ARQ, JSON.stringify(saida));
  console.log('pista-proxima:', e.n, '|', saida.circuito, '|', saida.curvas.length, 'curvas |', setores ? 'setores de ' + saida.fonteSetores : 'sem setores');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
