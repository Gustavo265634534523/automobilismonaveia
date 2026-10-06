/* Gera o Raio-x pós-corrida da F1 a partir do OpenF1 (api.openf1.org, dados gratuitos).
   Uso: node _ferramentas/gerar-raiox.js <pais em inglês> "<título>" "<local>"
   Exemplo: node _ferramentas/gerar-raiox.js Azerbaijan "GP do Azerbaijão" "Baku"
   Cria assets/dados/raiox-f1.js. O raiox.html lê sempre esse arquivo. */
const fs = require('fs');
const path = require('path');
const [, , PAIS, TITULO, LOCAL] = process.argv;
if (!PAIS || !TITULO || !LOCAL) { console.log('Uso: node _ferramentas/gerar-raiox.js Azerbaijan "GP do Azerbaijão" "Baku"'); process.exit(1); }
const API = 'https://api.openf1.org/v1/';
const ANO = 2026;

async function get(fim) {
  for (let t = 0; t < 4; t++) {
    try {
      const r = await fetch(API + fim, { signal: AbortSignal.timeout(60000) });
      const j = await r.json();
      if (Array.isArray(j)) return j;
      if (j && j.detail && /no results/i.test(j.detail)) return [];
    } catch (e) {}
    await new Promise(r => setTimeout(r, 4000));
  }
  throw new Error('OpenF1 não respondeu: ' + fim);
}

(async () => {
  /* PAIS pode ser o número da sessão (session_key): mais seguro quando o GP muda de país (ex.: GP do Bahrein em Sepang) */
  let sessoes;
  const porNumero = /^\d+$/.test(PAIS);
  if (porNumero) {
    const s = (await get('sessions?session_key=' + PAIS))[0];
    sessoes = s ? await get('sessions?meeting_key=' + s.meeting_key) : [];
  } else sessoes = await get(`sessions?year=${ANO}&country_name=${encodeURIComponent(PAIS)}`);
  const corrida = sessoes.find(s => s.session_name === 'Race' && (!porNumero ||String(s.session_key) === PAIS)) || sessoes.find(s => s.session_name === 'Race');
  const quali = sessoes.find(s => s.session_name === 'Qualifying');
  if (!corrida) throw new Error('Corrida não encontrada para ' + PAIS);
  const k = corrida.session_key;
  /* um pedido por vez: o OpenF1 limita pedidos seguidos */
  const espera = () => new Promise(r => setTimeout(r, 700));
  const pilotos = await get('drivers?session_key=' + k); await espera();
  const voltas = await get('laps?session_key=' + k); await espera();
  const paradas = await get('pit?session_key=' + k); await espera();
  const stints = await get('stints?session_key=' + k); await espera();
  const resultado = await get('session_result?session_key=' + k); await espera();
  const grid = await get('starting_grid?session_key=' + k); await espera();
  if (!pilotos.length || !voltas.length || !resultado.length) throw new Error('dados incompletos (pilotos ' + pilotos.length + ', voltas ' + voltas.length + ', resultado ' + resultado.length + ')');
  /* sem grid oficial, usa a classificação de sábado */
  let largada = grid.map(g => ({ n: g.driver_number, pos: g.position }));
  let gridFonte = 'grid oficial';
  if (!largada.length && quali) {
    largada = (await get('session_result?session_key=' + quali.session_key)).map(q => ({ n: q.driver_number, pos: q.position }));
    gridFonte = 'resultado da classificação (sem punições de grid)';
  }

  /* Posição no fim de cada volta: ordem de quem completou a volta n primeiro */
  const porPiloto = {};
  voltas.forEach(v => { (porPiloto[v.driver_number] = porPiloto[v.driver_number] || []).push(v); });
  const fimDaVolta = {}; /* fimDaVolta[piloto][n] = momento em que completou a volta n */
  Object.keys(porPiloto).forEach(n => {
    const vs = porPiloto[n].sort((a, b) => a.lap_number - b.lap_number);
    fimDaVolta[n] = {};
    vs.forEach((v, i) => {
      const prox = vs[i + 1];
      let fim = null;
      if (prox && prox.lap_number === v.lap_number + 1 && prox.date_start) fim = Date.parse(prox.date_start);
      else if (v.date_start && v.lap_duration) fim = Date.parse(v.date_start) + v.lap_duration * 1000;
      if (fim) fimDaVolta[n][v.lap_number] = fim;
    });
  });
  const total = Math.max(...resultado.map(r => r.number_of_laps || 0));
  const posicoes = {}; Object.keys(fimDaVolta).forEach(n => posicoes[n] = []);
  for (let volta = 1; volta <= total; volta++) {
    const quem = Object.keys(fimDaVolta).filter(n => fimDaVolta[n][volta]).sort((a, b) => fimDaVolta[a][volta] - fimDaVolta[b][volta]);
    quem.forEach((n, i) => posicoes[n].push(i + 1));
  }

  /* Última volta: segue o resultado oficial (com as punições já aplicadas) */
  resultado.forEach(r => {
    const pos = posicoes[r.driver_number];
    if (pos && pos.length === total && r.position && !r.dnf && !r.dsq) pos[total - 1] = r.position;
  });

  const nomeBonito = p => {
    const primeiro = p.first_name === 'Andrea Kimi' ? 'Kimi' : p.first_name;
    return primeiro + ' ' + p.last_name;
  };
  const saida = pilotos.map(p => {
    const n = p.driver_number;
    const res = resultado.find(r => r.driver_number === n) || {};
    const g = largada.find(x => x.n === n);
    const abandono = !!(res.dnf || res.dns || res.dsq);
    return {
      n, sigla: p.name_acronym, nome: nomeBonito(p), equipe: p.team_name, cor: '#' + (p.team_colour || '909090'),
      grid: g ? g.pos : null, final: abandono ? null : (res.position || null), abandono,
      voltas: posicoes[n] || [],
      paradas: paradas.filter(x => x.driver_number === n && x.lap_number).sort((a, b) => a.lap_number - b.lap_number)
        .map(x => ({ volta: x.lap_number, tempo: Math.round((x.pit_duration || x.lane_duration || 0) * 10) / 10 })),
      pneus: stints.filter(x => x.driver_number === n).sort((a, b) => a.stint_number - b.stint_number)
        .map(x => ({ c: x.compound || 'UNKNOWN', de: x.lap_start, ate: x.lap_end }))
    };
  }).sort((a, b) => (a.final || 99) - (b.final || 99) || b.voltas.length - a.voltas.length);

  /* Voltas na liderança */
  const lid = {};
  saida.forEach(p => { const c = p.voltas.filter(x => x === 1).length; if (c) lid[p.nome] = c; });
  const lideranca = Object.entries(lid).sort((a, b) => b[1] - a[1]);

  const dados = { titulo: TITULO, local: LOCAL, data: corrida.date_start.slice(0, 10), voltas: total, fonte: 'OpenF1 (api.openf1.org)', grid: gridFonte, pilotos: saida, lideranca };
  const arq = path.join(__dirname, '..', 'assets', 'dados', 'raiox-f1.js');
  fs.writeFileSync(arq, '/* Raio-x gerado a partir do OpenF1 por _ferramentas/gerar-raiox.js. */\nwindow.RAIOX = ' + JSON.stringify(dados) + ';\n');
  console.log('Gerado:', TITULO, '|', total, 'voltas |', saida.length, 'pilotos | grid:', gridFonte);
  console.log('Final:', saida.slice(0, 5).map(p => p.final + ' ' + p.sigla).join(', '), '| liderança:', JSON.stringify(lideranca));
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
