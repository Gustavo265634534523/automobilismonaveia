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
  /* extras (se a OpenF1 não tiver, o bloco só não aparece) */
  const controle = await get('race_control?session_key=' + k).catch(() => []); await espera();
  const tempo = await get('weather?session_key=' + k).catch(() => []); await espera();
  const ultrap = await get('overtakes?session_key=' + k).catch(() => []); await espera();
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

  /* ---------- extras ---------- */
  const sigla = n => (pilotos.find(p => p.driver_number === n) || {}).name_acronym || '#' + n;
  /* diferença para o líder no fim de cada volta (segundos) */
  saida.forEach(p => {
    p.dif = [];
    for (let v = 1; v <= total; v++) {
      const lider = Object.keys(fimDaVolta).filter(n => fimDaVolta[n][v]).sort((a, b) => fimDaVolta[a][v] - fimDaVolta[b][v])[0];
      const t = fimDaVolta[p.n] && fimDaVolta[p.n][v];
      p.dif.push(t && lider ? Math.round((t - fimDaVolta[lider][v]) / 100) / 10 : null);
    }
  });
  /* velocidade máxima no radar, melhor volta e volta ideal (soma dos três melhores setores) */
  saida.forEach(p => {
    const vs = (porPiloto[p.n] || []).filter(v => !v.is_pit_out_lap && v.lap_number > 1);
    const min = c => { const l = vs.map(v => v[c]).filter(x => x > 0); return l.length ? Math.min(...l) : null; };
    const s1 = min('duration_sector_1'), s2 = min('duration_sector_2'), s3 = min('duration_sector_3');
    p.vel = Math.max(0, ...(porPiloto[p.n] || []).map(v => v.st_speed || 0)) || null;
    p.melhor = min('lap_duration');
    p.ideal = s1 && s2 && s3 ? Math.round((s1 + s2 + s3) * 1000) / 1000 : null;
  });
  /* ultrapassagens feitas e sofridas */
  saida.forEach(p => {
    p.ultFeitas = ultrap.filter(u => u.overtaking_driver_number === p.n).length;
    p.ultSofridas = ultrap.filter(u => u.overtaken_driver_number === p.n).length;
  });
  /* voltas apagadas por limite de pista */
  saida.forEach(p => { p.limites = controle.filter(c => /DELETED - TRACK LIMITS/.test(c.message || '') && c.driver_number === p.n).length; });
  /* clima ao longo da corrida: [minuto, ar, asfalto, umidade, chuva, vento km/h] */
  const ini = Date.parse(corrida.date_start), fimC = Date.parse(corrida.date_end || corrida.date_start) + 30 * 60000;
  const clima = tempo.filter(w => { const t = Date.parse(w.date); return t >= ini && t <= fimC && w.air_temperature > 1 && w.track_temperature > 1; })
    .map(w => [Math.round((Date.parse(w.date) - ini) / 60000), w.air_temperature, w.track_temperature, Math.round(w.humidity), w.rainfall ? 1 : 0, Math.round((w.wind_speed || 0) * 3.6)]);
  /* direção de prova: só o que importa, em português */
  const MOTIVO = [
    [/CAUSING A COLLISION/, 'causar colisão'], [/LEAVING THE TRACK AND GAINING AN? (LASTING )?ADVANTAGE/, 'sair da pista e ganhar vantagem'],
    [/FORCING ANOTHER DRIVER OFF THE TRACK/, 'jogar outro piloto para fora da pista'], [/SPEEDING IN THE PIT LANE/, 'excesso de velocidade no pit lane'],
    [/UNSAFE RELEASE/, 'liberação insegura no pit'], [/TRACK LIMITS/, 'limites de pista'], [/FALSE START/, 'largada queimada'],
    [/IMPEDING/, 'atrapalhar outro piloto'], [/ERRATIC DRIVING|DRIVING ERRATICALLY/, 'pilotagem irregular'], [/MOVING BEFORE (THE )?(START )?SIGNAL|JUMP START|JUMPED START/, 'mexer o carro antes do sinal de largada'],
    [/UNSPORTSMANLIKE/, 'atitude antidesportiva'], [/IGNORING (BLUE|THE BLUE) FLAGS?/, 'ignorar bandeira azul'], [/CUTTING THE (TRACK|CHICANE)/, 'cortar a pista'], [/OVERTAKING UNDER (SAFETY CAR|SC)/, 'ultrapassar sob safety car'],
    [/OVERTAKING UNDER (VSC|VIRTUAL)/, 'ultrapassar sob safety car virtual'], [/(YELLOW|DOUBLE YELLOW) FLAG/, 'não respeitar bandeira amarela'],
    [/MORE THAN ONE CHANGE OF DIRECTION/, 'mudar de direção mais de uma vez'], [/SAFETY CAR INFRINGEMENT|SC INFRINGEMENT/, 'infração durante o safety car'],
    [/PIT ENTRY|PIT EXIT/, 'infração na entrada ou saída do pit'], [/STARTING PROCEDURE|WRONG GRID POSITION|GRID POSITION/, 'infração na largada'],
    [/MOVING UNDER BRAKING/, 'mudar de direção na freada'], [/CROSSING THE (WHITE )?LINE/, 'cruzar a linha da saída do pit']
  ];
  const motivo = t => { const m = MOTIVO.find(x => x[0].test(t)); return m ? m[1] : t.toLowerCase(); };
  const siglas = t => (t.match(/\((\w{3})\)/g) || []).map(x => x.slice(1, 4));
  const quem = t => { const l = siglas(t); return l.length > 1 ? l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1] : l[0] || ''; };
  function traduz(c) {
    const t = (c.message || '').toUpperCase().replace(/\s+\(\d\d:\d\d(:\d\d)?\)\s*$/, '').trim();
    let m;
    if (c.flag === 'RED' || /^RED FLAG/.test(t)) return ['vermelha', 'Bandeira vermelha: corrida interrompida'];
    if (c.flag === 'CHEQUERED') return ['fim', 'Bandeirada final'];
    if (c.flag === 'BLACK AND WHITE') return ['punicao', 'Bandeira preta e branca (advertência) para ' + (quem(t) || sigla(c.driver_number)) + ((m = t.match(/ - (.+)$/)) ? ': ' + motivo(m[1]) : '')];
    if (/^VIRTUAL SAFETY CAR DEPLOYED/.test(t)) return ['sc', 'Safety car virtual'];
    if (/^VIRTUAL SAFETY CAR ENDING/.test(t)) return ['sc', 'Fim do safety car virtual'];
    if (/^SAFETY CAR DEPLOYED/.test(t)) return ['sc', 'Safety car na pista'];
    if (/^SAFETY CAR IN THIS LAP/.test(t)) return ['sc', 'Safety car sai no fim desta volta'];
    if (/^DELAYED START/.test(t)) return ['info', 'Largada adiada'];
    if (/STARTING PROCEDURE SUSPENDED/.test(t)) return ['info', 'Procedimento de largada suspenso'];
    if (/FORMATION LAP\(S\) BEHIND SAFETY CAR/.test(t)) return ['sc', 'Volta de apresentação atrás do safety car'];
    if ((m = t.match(/^RISK OF RAIN FOR THE F1 RACE IS (\d+)%/))) return ['info', 'Risco de chuva de ' + m[1] + '% para a corrida'];
    if (/^STANDING START/.test(t)) return ['info', 'Largada parada'];
    if (/^ROLLING START/.test(t)) return ['info', 'Largada lançada, atrás do safety car'];
    if (/DISQUALIFIED/.test(t)) return ['punicao', quem(t) + ' desclassificado' + ((m = t.match(/ - (.+)$/)) ? ': ' + motivo(m[1]) : '')];
    if ((m = t.match(/(\d+) SECOND TIME PENALTY FOR CAR \d+ \((\w+)\)(?: - (.+))?/))) return ['punicao', 'Punição de ' + m[1] + ' s para ' + m[2] + (m[3] ? ': ' + motivo(m[3]) : '')];
    if ((m = t.match(/DRIVE THROUGH PENALTY FOR CAR \d+ \((\w+)\)(?: - (.+))?/))) return ['punicao', 'Drive-through para ' + m[1] + (m[2] ? ': ' + motivo(m[2]) : '')];
    if ((m = t.match(/(\d+) SECOND STOP\/GO PENALTY FOR CAR \d+ \((\w+)\)(?: - (.+))?/))) return ['punicao', 'Stop and go de ' + m[1] + ' s para ' + m[2] + (m[3] ? ': ' + motivo(m[3]) : '')];
    if ((m = t.match(/REPRIMAND FOR CAR \d+ \((\w+)\)(?: - (.+))?/))) return ['punicao', 'Advertência para ' + m[1] + (m[2] ? ': ' + motivo(m[2]) : '')];
    if (/NO FURTHER (ACTION|INVESTIGATION)/.test(t) && siglas(t).length) return ['ok', 'Sem punição para ' + quem(t) + ((m = t.match(/ - ([^-]+)$/)) ? ' (' + motivo(m[1]) + ')' : '')];
    if (/WILL BE INVESTIGATED AFTER THE RACE/.test(t)) return ['investiga', quem(t) + ' será investigado depois da corrida' + ((m = t.match(/ - ([^-]+)$/)) ? ': ' + motivo(m[1]) : '')];
    if (/UNDER INVESTIGATION/.test(t)) return ['investiga', quem(t) + ' sob investigação' + ((m = t.match(/ - ([^-]+)$/)) ? ': ' + motivo(m[1]) : '')];
    if (/ NOTED /.test(t) && siglas(t).length) return ['investiga', 'Incidente com ' + quem(t) + ' anotado pelos comissários' + ((m = t.match(/ - ([^-]+)$/)) ? ': ' + motivo(m[1]) : '')];
    return null;
  }
  const direcao = [];
  controle.forEach(c => {
    const r = traduz(c); if (!r) return;
    const ult = direcao[direcao.length - 1];
    if (ult && ult.t === r[1]) return; /* repetida */
    direcao.push({ v: c.lap_number || 1, tipo: r[0], t: r[1] });
  });

  const dados = { titulo: TITULO, local: LOCAL, data: corrida.date_start.slice(0, 10), voltas: total, fonte: 'OpenF1 (api.openf1.org)', grid: gridFonte, pilotos: saida, lideranca, direcao, clima, temUltrapassagens: ultrap.length > 0 };
  const arq = path.join(__dirname, '..', 'assets', 'dados', 'raiox-f1.js');
  fs.writeFileSync(arq, '/* Raio-x gerado a partir do OpenF1 por _ferramentas/gerar-raiox.js. */\nwindow.RAIOX = ' + JSON.stringify(dados) + ';\n');
  console.log('Gerado:', TITULO, '|', total, 'voltas |', saida.length, 'pilotos | grid:', gridFonte);
  console.log('Final:', saida.slice(0, 5).map(p => p.final + ' ' + p.sigla).join(', '), '| liderança:', JSON.stringify(lideranca));
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
