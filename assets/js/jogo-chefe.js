/* Jogo "Chefe de Equipe" (plano Master): corrida 2D vista de cima com 10 carros sem marca.
   A pessoa escolhe a cor do carro e a pista, e comanda a estratégia: ritmo, pit stop e pneu.
   As pistas vêm de window.CIRCUITOS (circuitos.js). Chamado por jogos.js: window.JOGO_CHEFE(elemento). */
(function () {
  var CORES = [
    { id: 'preto', nome: 'Preto', cor: '#15171a', friso: '#e3343c' },
    { id: 'vermelho', nome: 'Vermelho', cor: '#d7263d', friso: '#f4f6f7' },
    { id: 'azul', nome: 'Azul', cor: '#1f6feb', friso: '#f4f6f7' },
    { id: 'verde', nome: 'Verde', cor: '#1f9d55', friso: '#f4f6f7' },
    { id: 'amarelo', nome: 'Amarelo', cor: '#f2c14e', friso: '#15171a' },
    { id: 'laranja', nome: 'Laranja', cor: '#f07b2b', friso: '#15171a' },
    { id: 'roxo', nome: 'Roxo', cor: '#7b4ae2', friso: '#f4f6f7' },
    { id: 'rosa', nome: 'Rosa', cor: '#e84a8a', friso: '#f4f6f7' },
    { id: 'ciano', nome: 'Ciano', cor: '#22b8cf', friso: '#15171a' },
    { id: 'branco', nome: 'Branco', cor: '#e9ecef', friso: '#d7263d' }
  ];
  var SIGLAS = ['ROC', 'LUN', 'VAS', 'TOR', 'MEL', 'BRA', 'KOV', 'SIL', 'DUA', 'FER'];
  var PNEU = {
    S: { nome: 'Macio', ritmo: 1.024, gasto: 0.13, cor: '#e3343c' },
    M: { nome: 'Médio', ritmo: 1.0, gasto: 0.085, cor: '#f2c14e' },
    H: { nome: 'Duro', ritmo: 0.978, gasto: 0.058, cor: '#e9ecef' },
    I: { nome: 'Intermediário', ritmo: 0.9, gasto: 0.075, cor: '#3fae63' },
    W: { nome: 'Chuva forte', ritmo: 0.85, gasto: 0.065, cor: '#2f7de1' }
  };
  /* Pneus da F1 2026 (Pirelli): 5 compostos de pista seca, C1 (mais duro) a C5 (mais macio). Em cada GP três deles viram
     duro (branco), médio (amarelo) e macio (vermelho). Para pista molhada: intermediário (verde) e chuva (azul).
     GRIP: rendimento de cada pneu em cada clima (1 = o melhor pneu naquele clima). CLIMA.f: quanto a pista molhada deixa a volta mais lenta. */
  var GRIP = {
    seco: { S: 1.024, M: 1.0, H: 0.978, I: 0.9, W: 0.85 },
    leve: { S: 0.84, M: 0.83, H: 0.82, I: 1.0, W: 0.965 },
    forte: { S: 0.7, M: 0.69, H: 0.68, I: 0.91, W: 1.0 }
  };
  var CLIMA = {
    seco: { nome: 'Pista seca', f: 1, pneu: 'S', largada: 'M' },
    leve: { nome: 'Chuva leve', f: 0.93, pneu: 'I', largada: 'I' },
    forte: { nome: 'Chuva forte', f: 0.87, pneu: 'W', largada: 'W' }
  };
  var ROTULO = { S: 'Pneu macio', M: 'Pneu médio', H: 'Pneu duro', I: 'Intermediário', W: 'Chuva forte' };
  function sortearClima() { var r = Math.random(); return r < 0.6 ? 'seco' : r < 0.82 ? 'leve' : 'forte'; }
  function molhado(p) { return p === 'I' || p === 'W'; }
  /* chuva no desenho da pista: tom azulado e riscos de água (sempre nos mesmos lugares) */
  function pintarChuva(ctx, W, H, cl) {
    if (!cl || cl === 'seco') return;
    ctx.save();
    ctx.fillStyle = cl === 'forte' ? 'rgba(70,120,190,.16)' : 'rgba(70,120,190,.09)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(170,200,240,' + (cl === 'forte' ? '.28' : '.16') + ')'; ctx.lineWidth = 1;
    var n = cl === 'forte' ? 140 : 70, x = 7;
    ctx.beginPath();
    for (var i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; var px = x / 233280 * W; x = (x * 9301 + 49297) % 233280; var py = x / 233280 * H; ctx.moveTo(px, py); ctx.lineTo(px - 3, py + 9); }
    ctx.stroke(); ctx.restore();
  }
  var MODO = {
    atacar: { nome: 'Atacar', ritmo: 1.022, gasto: 1.45 },
    normal: { nome: 'Normal', ritmo: 1.0, gasto: 1.0 },
    poupar: { nome: 'Poupar', ritmo: 0.976, gasto: 0.62 }
  };
  /* Níveis: quanto os rivais andam na classificação (x volta ideal), bônus do seu ritmo na corrida e folga antes de passar reto nas curvas */
  var NIVEIS = {
    facil: { nome: 'Fácil', quali: [1.03, 1.09], bonus: 1.12, folga: 1.18 },
    medio: { nome: 'Médio', quali: [0.985, 1.03], bonus: 1.06, folga: 1.1 },
    dificil: { nome: 'Difícil', quali: [0.965, 1.0], bonus: 1.0, folga: 1.05 }
  };
  /* Câmbio de 8 marchas: velocidade máxima (km/h) de cada uma. No manual, E sobe e Q desce.
     Marcha alta demais em baixa velocidade: pouca força. Chegou no máximo da marcha: limitador (não passa). */
  var TOPO_MARCHA = [0, 85, 125, 160, 195, 230, 265, 300, 350];
  /* Direção Elite: A esquerda, D direita. O carro tem posição lateral (lat, metros; + = direita) e ângulo em relação à pista (psi).
     A aderência lateral (a mesma que define a velocidade das curvas) limita o quanto ele vira: rápido demais, ele escorrega para fora. */
  var MEIA_PISTA = 7;
  function direcaoElite() { return ler('chefe-direcao', 'assistida') === 'elite'; }
  function htmlDirecao() {
    if (!direcaoElite()) return '';
    return '<div class="qu-linha qu-direcao"><button type="button" class="qu-btn qu-volante" data-c="esq">◀ Esquerda<small>tecla A</small></button><button type="button" class="qu-btn qu-volante" data-c="dir">Direita ▶<small>tecla D</small></button></div>';
  }
  /* um passo da direção: mexe em o.lat, o.psi, o.v e o.st; devolve quantos metros anda ao longo da pista neste passo e o que aconteceu */
  function esterçar(o, cmd, dt, kurv, grip, muro, meia) {
    var MEIA = meia || MEIA_PISTA;
    o.lat = o.lat || 0; o.psi = o.psi || 0; o.st = o.st || 0;
    var alvo = (cmd.dir ? 1 : 0) - (cmd.esq ? 1 : 0);
    o.st += (alvo - o.st) * Math.min(1, dt * (alvo === 0 ? 8 : 5.5)); /* vira aos poucos e volta ao centro mais rápido */
    var fora = Math.abs(o.lat) > MEIA + 0.6, g = grip * (fora ? 0.55 : 1), v = Math.max(o.v, 0);
    var rMax = (25 + 0.0065 * v * v) * g / Math.max(v, 3); /* mesma aderência de limCurva (A_LAT, K_ASA) */
    var rCmd = o.st * Math.max(v, 2) / (9 + v * 0.6); /* quanto mais rápido, menos o volante vira (como num F1) */
    var r = Math.max(-rMax, Math.min(rMax, rCmd));
    if (Math.abs(rCmd) > rMax * 1.05) o.v = Math.max(0, o.v - (Math.abs(rCmd) - rMax) * v * 0.3 * dt); /* pneu arrastando */
    var dsdt = v * Math.cos(o.psi) / Math.max(0.3, 1 - kurv * o.lat);
    o.psi += (r - kurv * dsdt) * dt;
    o.psi = Math.max(-1.3, Math.min(1.3, o.psi));
    o.lat += v * Math.sin(o.psi) * dt;
    var ev = '';
    if (fora) { o.v = Math.max(0, o.v - 9 * dt); ev = 'fora'; }
    if (Math.abs(o.lat) > MEIA + (muro || 11) - 1.1) { /* a lateral do carro (1,1 m do centro) encostou no muro */ ev = 'bateu'; o.v = 0; o.lat = (o.lat > 0 ? 1 : -1) * (MEIA - 2); o.psi = 0; o.st = 0; }
    return { ds: dsdt * dt, ev: ev };
  }
  function htmlCambio() {
    if (!cambioManual()) return '';
    return '<div class="qu-linha qu-cambio"><button type="button" class="qu-btn qu-marcha" data-m="-1">Marcha −<small>tecla Q</small></button><button type="button" class="qu-btn qu-marcha" data-m="1">Marcha +<small>tecla E</small></button></div>';
  }
  function ligarCambio(tela, troca) {
    [].forEach.call(tela.querySelectorAll('.qu-marcha'), function (b) {
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); troca(+b.getAttribute('data-m')); b.classList.add('ativo'); setTimeout(function () { b.classList.remove('ativo'); }, 120); });
    });
  }
  /* reduzir numa velocidade alta demais para a marcha de baixo estragaria o motor: o câmbio não deixa (e apita) */
  function trocarMarcha(g, d, v) {
    var nova = Math.max(1, Math.min(8, g + d));
    if (d < 0 && v * 3.6 > TOPO_MARCHA[nova] * 1.02) { bipe(260, 0.08); return g; }
    return nova;
  }
  function marchaAuto(v) { var km = v * 3.6; for (var g = 1; g < 8; g++) if (km < TOPO_MARCHA[g] * 0.97) return g; return 8; }
  function forcaMarcha(v, g) { if (g <= 1) return 1; var fr = v * 3.6 / TOPO_MARCHA[g]; return fr >= 0.42 ? 1 : 0.3 + fr / 0.42 * 0.7; }
  function rotacao(v, g) { return 4000 + Math.min(1.02, v * 3.6 / TOPO_MARCHA[g]) * 8500; }
  function cambioManual() { return ler('chefe-cambio', 'auto') === 'manual'; }
  var DURACAO = { curta: { nome: 'Curta', voltas: 3 }, media: { nome: 'Média', voltas: 5 }, longa: { nome: 'Longa', voltas: 8 } };
  var VOLTAS = 10, VOLTA_S = 20, PARADA_S = 4.6, GRID_GAP = 0.011, ESPACO_SC = 0.007;

  function ler(k, p) { try { var v = localStorage.getItem('naveia-jogo-' + k); return v ? JSON.parse(v) : p; } catch (e) { return p; } }
  function guardar(k, v) { try { localStorage.setItem('naveia-jogo-' + k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return window.esc ? window.esc(s) : String(s); }
  function sorte(a, b) { return a + Math.random() * (b - a); }
  function ordinal(n) { return n + 'º'; }

  /* Pista: transforma o desenho SVG em pontos e mede o comprimento */
  function pista(c) {
    var nums = c.d.replace(/[MLZ]/g, ' ').trim().split(/\s+/).map(Number), pts = [];
    for (var i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
    if (pts.length && (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1])) pts.push(pts[0].slice());
    var acc = [0];
    for (var j = 1; j < pts.length; j++) acc.push(acc[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
    var total = acc[acc.length - 1];
    function ponto(f) {
      f = ((f % 1) + 1) % 1;
      var alvo = f * total, lo = 0, hi = acc.length - 1;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (acc[mid] <= alvo) lo = mid; else hi = mid; }
      var seg = acc[hi] - acc[lo] || 1, t = (alvo - acc[lo]) / seg;
      var a = pts[lo], b = pts[hi];
      return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    }
    return { nome: c.nome, local: c.local, pts: pts, ponto: ponto, total: total };
  }

  /* Som: bipe a cada luz vermelha (sintetizado pelo navegador). Usa a mesma escolha de som do jogo Largada. */
  var audio = null;
  function somLigado() { return ler('largada-som', true); }
  /* volume geral do jogo (0 a 1), guardado no navegador; começa na metade */
  var saidaSom = null;
  function volume() { var v = ler('chefe-volume', 0.5); return typeof v === 'number' ? Math.max(0, Math.min(1, v)) : 0.5; }
  function saida() {
    if (!audio) return null;
    if (!saidaSom) { saidaSom = audio.createGain(); saidaSom.gain.value = volume(); saidaSom.connect(audio.destination); }
    return saidaSom;
  }
  function mudarVolume(v) { guardar('chefe-volume', v); if (saidaSom && audio) saidaSom.gain.setTargetAtTime(v, audio.currentTime, 0.05); }
  function prepararAudio() {
    if (!somLigado()) return;
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); saida(); carregarF1(); } catch (e) { audio = null; }
  }
  /* ícone de alto-falante e barra de volume */
  function htmlVolume(id) {
    var v = Math.round(volume() * 100);
    return '<label class="ch-volume" id="' + id + '" title="Volume do jogo"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3.2L10.5 4v12L6.2 12.5H3z" fill="currentColor"/><path class="ch-onda" d="M13 7.2a4 4 0 0 1 0 5.6M15.4 5a7.2 7.2 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
      '<span class="ch-oculto">Volume</span><input type="range" min="0" max="100" step="5" value="' + v + '" aria-label="Volume do jogo"><b>' + v + '%</b></label>';
  }
  function ligarVolume(el) {
    if (!el) return;
    var r = el.querySelector('input'), txt = el.querySelector('b');
    function mostra() { var v = +r.value; txt.textContent = v + '%'; el.classList.toggle('mudo', v === 0); }
    mostra();
    r.addEventListener('input', function () { mostra(); prepararAudio(); mudarVolume(+r.value / 100); });
  }
  function bipe(freq, dur) {
    if (!somLigado() || !audio) return;
    var t = audio.currentTime, osc = audio.createOscillator(), g = audio.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(saida()); osc.start(t); osc.stop(t + dur + 0.02);
  }

  /* Ronco do motor: V6 turbo híbrido, sintetizado pelo navegador.
     - Frequência das explosões = rotação / 20 (6 cilindros, 4 tempos: 3 explosões por volta do virabrequim).
     - Meia ordem (f/2) dá o ronco grave; ruído de combustão, distorção e ressonâncias do escapamento dão a aspereza.
     - Assobio do turbo acompanha a rotação. Tirando o pé: som mais seco e estalos do escapamento.
     - O "piloto" acelera nas retas trocando de marcha e freia/reduz nas curvas, lendo a curvatura da pista à frente. */
  var motor = null;
  function curvaTanh(k) {
    var n = 1024, c = new Float32Array(n);
    for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
    return c;
  }
  function sintLigar() {
    sintDesligar();
    if (!somLigado() || !audio) return;
    var A = audio, t = A.currentTime;
    /* timbre da explosão: série harmônica com ênfase nas ordens baixas */
    var re = new Float32Array(24), im = new Float32Array(24);
    for (var h = 1; h < 24; h++) im[h] = (h === 1 ? 1 : h === 2 ? 0.75 : h === 3 ? 0.55 : 0.9 / h) * (h % 2 ? 1 : 0.8);
    var onda = A.createPeriodicWave(re, im);
    var base = A.createOscillator(); base.setPeriodicWave(onda);
    var meia = A.createOscillator(); meia.type = 'sawtooth';
    var tresMeios = A.createOscillator(); tresMeios.type = 'triangle';
    var gBase = A.createGain(), gMeia = A.createGain(), gTres = A.createGain();
    gBase.gain.value = 0.55; gMeia.gain.value = 0.32; gTres.gain.value = 0.12;
    /* combustão: ruído filtrado perto das harmônicas */
    var buf = A.createBuffer(1, A.sampleRate * 2, A.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var ruido = A.createBufferSource(); ruido.buffer = buf; ruido.loop = true;
    var bpRuido = A.createBiquadFilter(); bpRuido.type = 'bandpass'; bpRuido.Q.value = 1.2;
    var gRuido = A.createGain(); gRuido.gain.value = 0.18;
    /* aspereza e escapamento */
    var soma = A.createGain();
    var drive = A.createWaveShaper(); drive.curve = curvaTanh(3); drive.oversample = '2x';
    var pico1 = A.createBiquadFilter(); pico1.type = 'peaking'; pico1.frequency.value = 1150; pico1.Q.value = 1.4; pico1.gain.value = 7;
    var pico2 = A.createBiquadFilter(); pico2.type = 'peaking'; pico2.frequency.value = 2900; pico2.Q.value = 2; pico2.gain.value = 5;
    var corteGrave = A.createBiquadFilter(); corteGrave.type = 'highpass'; corteGrave.frequency.value = 70;
    var passaBaixa = A.createBiquadFilter(); passaBaixa.type = 'lowpass'; passaBaixa.frequency.value = 5200; passaBaixa.Q.value = 0.7;
    /* turbo */
    var turbo = A.createOscillator(); turbo.type = 'sine';
    var gTurbo = A.createGain(); gTurbo.gain.value = 0.0;
    /* saída */
    var master = A.createGain(); master.gain.setValueAtTime(0.0001, t); master.gain.exponentialRampToValueAtTime(0.06, t + 0.6);
    var comp = A.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    base.connect(gBase); meia.connect(gMeia); tresMeios.connect(gTres);
    gBase.connect(soma); gMeia.connect(soma); gTres.connect(soma);
    ruido.connect(bpRuido); bpRuido.connect(gRuido); gRuido.connect(soma);
    soma.connect(drive); drive.connect(corteGrave); corteGrave.connect(pico1); pico1.connect(pico2); pico2.connect(passaBaixa); passaBaixa.connect(master);
    turbo.connect(gTurbo); gTurbo.connect(master);
    master.connect(comp); comp.connect(saida());
    [base, meia, tresMeios, turbo].forEach(function (o) { o.frequency.value = 400; o.start(); });
    ruido.start();
    motor = { base: base, meia: meia, tres: tresMeios, turbo: turbo, gTurbo: gTurbo, bpRuido: bpRuido, gRuido: gRuido, soma: soma, passaBaixa: passaBaixa,
      master: master, fontes: [base, meia, tresMeios, turbo, ruido],
      marcha: 3, vel: 0.55, rpm: 10500, acel: 1, proxEstalo: 0 };
  }
  var RELACAO = [0, 2.9, 2.3, 1.9, 1.6, 1.38, 1.2, 1.07, 0.96]; /* relação de cada marcha (rpm por velocidade) */
  function sintAtualizar(dt, ritmoRel, estado, curva, velDireta, acelDireta, rpmDireto) {
    if (!motor || !audio) return;
    var m = motor, A = audio, t = A.currentTime;
    var alvoVol = (!somLigado() || document.hidden) ? 0.0001 : 0.06;
    /* velocidade que o "piloto" quer: menor nas curvas fechadas, maior nas retas */
    var alvo;
    if (estado === 'box') alvo = 0.14;
    else if (estado === 'fim') alvo = 0.3;
    else {
      alvo = 1 - Math.min(0.62, curva * 0.9);
      alvo *= estado === 'sc' ? 0.55 : (0.94 + (ritmoRel - 0.97) * 1.6);
    }
    var antes = m.vel;
    m.vel += (alvo > m.vel ? 0.22 : 0.65) * (alvo - m.vel) * Math.min(1, dt * 3);
    m.acel = m.vel >= antes - 0.0005 ? 1 : 0; /* pé no acelerador ou freando */
    if (velDireta != null) { m.vel = velDireta; m.acel = acelDireta ? 1 : 0; }
    /* rotação pela marcha; troca para cima no limite e reduz na freada */
    var rpm = 1800 + m.vel * RELACAO[m.marcha] * 9800;
    if (rpm > 12200 && m.marcha < 8) { m.marcha++; }
    else if (rpm < 8600 && m.marcha > 1) { m.marcha--; m.proxEstalo = 0; }
    rpm = Math.max(4000, Math.min(12500, 1800 + m.vel * RELACAO[m.marcha] * 9800));
    if (rpmDireto != null) rpm = rpmDireto;
    if (estado === 'box') rpm = 4200;
    rpm *= 1 + (Math.random() - 0.5) * 0.004; /* pequena irregularidade */
    m.rpm += (rpm - m.rpm) * Math.min(1, dt * 14);
    var f = m.rpm / 20;
    m.base.frequency.setTargetAtTime(f, t, 0.02);
    m.meia.frequency.setTargetAtTime(f / 2, t, 0.02);
    m.tres.frequency.setTargetAtTime(f * 1.5, t, 0.02);
    m.bpRuido.frequency.setTargetAtTime(f * 2.2, t, 0.03);
    m.turbo.frequency.setTargetAtTime(2400 + m.rpm * 0.18, t, 0.2);
    /* acelerando: cheio e áspero; tirando o pé: mais seco, com estalos */
    var carga = estado === 'box' ? 0.25 : m.acel ? 1 : 0.35;
    m.soma.gain.setTargetAtTime(0.55 + carga * 0.75, t, 0.05);
    m.gRuido.gain.setTargetAtTime(0.06 + carga * 0.16, t, 0.05);
    m.passaBaixa.frequency.setTargetAtTime(2600 + carga * 3000, t, 0.06);
    m.gTurbo.gain.setTargetAtTime(estado === 'box' ? 0 : 0.004 + carga * 0.006, t, 0.2);
    m.master.gain.setTargetAtTime(alvoVol * (estado === 'box' ? 0.55 : 1), t, 0.1);
    if (!m.acel && estado !== 'box' && somLigado() && !document.hidden) {
      m.proxEstalo -= dt;
      if (m.proxEstalo <= 0) { estalo(); m.proxEstalo = 0.08 + Math.random() * 0.25; }
    }
  }
  function estalo(destino) {
    var A = audio, t = A.currentTime, n = Math.floor(A.sampleRate * 0.05);
    var b = A.createBuffer(1, n, A.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    var s = A.createBufferSource(); s.buffer = b;
    var bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 350 + Math.random() * 500; bp.Q.value = 1.5;
    var g = A.createGain(); g.gain.value = 0.35 + Math.random() * 0.3;
    s.connect(bp); bp.connect(g); g.connect(destino || (motor ? motor.master : saida()));
    s.start(t);
  }
  function sintDesligar() {
    if (!motor || !audio) { motor = null; return; }
    var m = motor, t = audio.currentTime; motor = null;
    m.master.gain.setTargetAtTime(0.0001, t, 0.3);
    setTimeout(function () { m.fontes.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 1500);
  }
  /* ---------- Som real de F1 ----------
     assets/sons/motor-f1.wav: gravação real de um Red Bull-Renault RB5 (2009), de Edvvc, Wikimedia Commons, CC BY-SA 3.0.
     O arquivo tem 3 trechos: marcha lenta no grid (0 a 3 s), largada (3 a 7,1 s) e motor em rotação alta (7,1 a 7,44 s, feito para repetir sem emenda).
     Na corrida, o trecho de rotação alta repete e a velocidade de reprodução acompanha a rotação (marchas, curvas, ritmo). */
  var TRECHO = { lenta: [0, 3], largada: [3, 7.1], alta: [7.1, 7.44] };
  var somF1 = null, carregandoF1 = false, real = null;
  function carregarF1() {
    if (somF1 || carregandoF1 || !audio) return;
    carregandoF1 = true;
    fetch('assets/sons/motor-f1.wav').then(function (r) { return r.arrayBuffer(); })
      .then(function (b) { return audio.decodeAudioData(b); })
      .then(function (b) { somF1 = b; if (jogoAtual && jogoAtual.fase === 'luzes') motorGrid(); })
      .catch(function () { carregandoF1 = false; });
  }
  function fonte(trecho, repetir, destino) {
    var s = audio.createBufferSource(); s.buffer = somF1;
    if (repetir) { s.loop = true; s.loopStart = trecho[0]; s.loopEnd = trecho[1]; }
    s.connect(destino); return s;
  }
  function realMontar() {
    var A = audio, master = A.createGain(), filtro = A.createBiquadFilter();
    filtro.type = 'lowpass'; filtro.frequency.value = 12000; filtro.Q.value = 0.5;
    master.gain.value = 0.0001; filtro.connect(master); master.connect(saida());
    return { master: master, filtro: filtro, fontes: [], marcha: 2, vel: 0.5, rpm: 9000, acel: 1, proxEstalo: 0, laco: null };
  }
  function motorGrid() {
    if (!somLigado() || !audio || !somF1 || real) return;
    real = realMontar();
    var s = fonte(TRECHO.lenta, true, real.filtro); s.start(0, TRECHO.lenta[0]);
    real.fontes.push(s); real.lenta = s;
    real.master.gain.setTargetAtTime(0.5, audio.currentTime, 0.3);
  }
  function realLigarDireto() {
    realDesligar(); real = realMontar();
    var A = audio, t = A.currentTime, r = real, g = A.createGain(); g.gain.value = 0.8; g.connect(r.filtro);
    var alta = fonte(TRECHO.alta, true, g); alta.start(t, TRECHO.alta[0]);
    r.fontes.push(alta); r.laco = alta; r.gAlta = g; r.inicioLaco = t;
    r.master.gain.setTargetAtTime(0.9, t, 0.2);
  }
  function realLargar() {
    if (!real) real = realMontar();
    var A = audio, t = A.currentTime, r = real;
    if (r.lenta) { var l = r.lenta; r.master.gain.setTargetAtTime(0.5, t, 0.05); setTimeout(function () { try { l.stop(); } catch (e) {} }, 300); }
    /* a largada de verdade */
    var gl = A.createGain(); gl.gain.value = 1; gl.connect(r.filtro);
    var larg = fonte(TRECHO.largada, false, gl); larg.start(t, TRECHO.largada[0], TRECHO.largada[1] - TRECHO.largada[0]);
    r.fontes.push(larg);
    r.master.gain.setTargetAtTime(0.9, t, 0.05);
    /* depois da largada, entra o motor em rotação alta, repetindo */
    var gAlta = A.createGain(); gAlta.gain.setValueAtTime(0.0001, t); gAlta.connect(r.filtro);
    var alta = fonte(TRECHO.alta, true, gAlta); alta.start(t + 2.6, TRECHO.alta[0]);
    gAlta.gain.setValueAtTime(0.0001, t + 2.6); gAlta.gain.exponentialRampToValueAtTime(0.8, t + 3.6);
    gl.gain.setValueAtTime(1, t + 3.0); gl.gain.exponentialRampToValueAtTime(0.0001, t + 4.0);
    r.fontes.push(alta); r.laco = alta; r.gAlta = gAlta; r.inicioLaco = t + 3.6;
  }
  function realAtualizar(dt, ritmoRel, estado, curva, velDireta, acelDireta, rpmDireto) {
    var r = real, A = audio; if (!r || !r.laco) return;
    var t = A.currentTime;
    if (velDireta != null) { r.vel = velDireta; r.acel = acelDireta ? 1 : 0; }
    else {
    var alvo;
    if (estado === 'box') alvo = 0.14; else if (estado === 'fim') alvo = 0.3;
    else { alvo = 1 - Math.min(0.62, curva * 0.9); alvo *= estado === 'sc' ? 0.55 : (0.94 + (ritmoRel - 0.97) * 1.6); }
    var antes = r.vel;
    r.vel += (alvo > r.vel ? 0.22 : 0.65) * (alvo - r.vel) * Math.min(1, dt * 3);
    r.acel = r.vel >= antes - 0.0005 ? 1 : 0;
    }
    var rpm = 1800 + r.vel * RELACAO[r.marcha] * 9800;
    if (rpm > 12200 && r.marcha < 8) r.marcha++; else if (rpm < 8600 && r.marcha > 1) r.marcha--;
    rpm = Math.max(4000, Math.min(12500, 1800 + r.vel * RELACAO[r.marcha] * 9800));
    if (rpmDireto != null) rpm = rpmDireto;
    if (estado === 'box') rpm = 4500;
    r.rpm += (rpm - r.rpm) * Math.min(1, dt * 14);
    /* a gravação está por volta de 9.500 rpm; acelera ou desacelera a reprodução para chegar na rotação do jogo */
    var taxa = Math.max(0.45, Math.min(1.45, 0.78 + (r.rpm - 8000) / 4500 * 0.62));
    if (t >= r.inicioLaco - 1) r.laco.playbackRate.setTargetAtTime(taxa, t, 0.025);
    var carga = estado === 'box' ? 0.3 : r.acel ? 1 : 0.45;
    var vol = (!somLigado() || document.hidden) ? 0.0001 : (estado === 'box' ? 0.45 : estado === 'sc' ? 0.7 : 0.9) * (0.6 + carga * 0.4);
    if (t >= r.inicioLaco) r.master.gain.setTargetAtTime(vol, t, 0.08);
    r.filtro.frequency.setTargetAtTime(estado === 'box' ? 1400 : 3500 + carga * 8500, t, 0.06);
    if (!r.acel && estado !== 'box' && somLigado() && !document.hidden) {
      r.proxEstalo -= dt;
      if (r.proxEstalo <= 0) { estalo(r.master); r.proxEstalo = 0.1 + Math.random() * 0.3; }
    }
  }
  function realDesligar() {
    if (!real || !audio) { real = null; return; }
    var r = real, t = audio.currentTime; real = null;
    r.master.gain.setTargetAtTime(0.0001, t, 0.35);
    setTimeout(function () { r.fontes.forEach(function (s) { try { s.stop(); } catch (e) {} }); }, 1800);
  }

  /* ---------- Quem toca: o som real, se carregou; senão, o sintetizado ---------- */
  var jogoAtual = null;
  function motorLigar(semLargada) { if (somF1 && somLigado() && audio) { if (semLargada) realLigarDireto(); else realLargar(); } else sintLigar(); }
  function motorAtualizar(dt, ritmoRel, estado, curva, velDireta, acelDireta, rpmDireto) { if (real) realAtualizar(dt, ritmoRel, estado, curva, velDireta, acelDireta, rpmDireto); else sintAtualizar(dt, ritmoRel, estado, curva, velDireta, acelDireta, rpmDireto); }
  function motorDesligar() { realDesligar(); sintDesligar(); }
  function motorAtivo() { return !!(real || motor); }

  function parafusadeira() {
    if (!somLigado() || !audio) return;
    [0, 0.35, 0.7, 1.05].forEach(function (d) {
      var t = audio.currentTime + 0.4 + d, o = audio.createOscillator(), g = audio.createGain();
      o.type = 'square'; o.frequency.setValueAtTime(1400, t); o.frequency.exponentialRampToValueAtTime(700, t + 0.18);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(saida()); o.start(t); o.stop(t + 0.22);
    });
  }

  /* ---------- Visão de perto: a câmera segue o seu carro e a pista gira junto ----------
     Medidas em metros: pista de PISTA_M de largura, carro CARRO_K vezes maior que o real (para dar para ver), VISTA_M metros na altura da tela. */
  var PISTA_M = 22, CARRO_K = 2.3, VISTA_M = 115;
  /* câmeras: '3d' (atrás do carro), '3dtv' (alta, estilo TV), 'perto' (de cima) e 'inteira' (pista toda) */
  function camera() { var c = ler('chefe-camera2', '3d'); return c === '3dtv' || c === '3dcock' ? c : '3d'; } /* só câmeras 3D; a visão de cima fica só de reserva se o 3D não carregar */
  function botoesCamera(id) {
    return '<div class="ch-botoes qu-camera" id="' + id + '">' +
      [['3d', '3D atrás'], ['3dcock', 'Cockpit'], ['3dtv', '3D alto']].map(function (b) {
        return '<button type="button" data-cam="' + b[0] + '" aria-pressed="' + (camera() === b[0]) + '">' + b[1] + '</button>';
      }).join('') + '</div>';
  }
  /* minimapa (canto de baixo) com a pista inteira e os carros */
  function minimapa(ctx, W, H, P, carros, noTopo) {
    var mm = Math.min(noTopo ? 100 : 130, W * (noTopo ? 0.24 : 0.3)), mh = mm * 0.75, mx = noTopo ? W - mm - 8 : 8, my = noTopo ? 58 : H - mh - 8, e = Math.min(mm / 400, mh / 300) * 0.9, ex = mx + (mm - 400 * e) / 2, ey = my + (mh - 300 * e) / 2;
    ctx.fillStyle = 'rgba(8,9,11,.72)'; ctx.fillRect(mx, my, mm, mh);
    ctx.beginPath(); P.pts.forEach(function (p, i) { if (i) ctx.lineTo(ex + p[0] * e, ey + p[1] * e); else ctx.moveTo(ex + p[0] * e, ey + p[1] * e); }); ctx.closePath();
    ctx.strokeStyle = '#8e979f'; ctx.lineWidth = 2; ctx.stroke();
    carros.forEach(function (c) {
      var p = P.ponto(c.f); ctx.beginPath(); ctx.arc(ex + p.x * e, ey + p.y * e, c.jog ? 3.6 : 2.4, 0, Math.PI * 2);
      ctx.fillStyle = c.visual.cor; ctx.fill(); if (c.jog) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke(); }
    });
  }
  /* efeitos de câmera por cima do 3D: linhas de velocidade, sombra nas bordas e brilho do sol (gráfico alto) */
  function efeitosCamera(ctx, W, H, info, gq, modo) {
    if (!info || gq === 'baixo') return;
    var agora = performance.now(), r = Math.max(0, Math.min(1, (info.v - 70) / 25));
    if (r > 0 && modo !== '3dtv') {
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,' + (0.05 + 0.09 * r).toFixed(2) + ')'; ctx.lineWidth = 1.2; ctx.beginPath();
      var cx = W / 2, cy = H * 0.55, R = Math.hypot(W, H) / 2, n = 6 + Math.round(r * 10), s = Math.floor(agora / 110) % 233280;
      for (var i = 0; i < n; i++) {
        s = (s * 9301 + 49297) % 233280; var a = s / 233280 * Math.PI * 2; s = (s * 9301 + 49297) % 233280; var d0 = 0.62 + s / 233280 * 0.3;
        var x0 = cx + Math.cos(a) * R * d0, y0 = cy + Math.sin(a) * R * d0;
        ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a) * R * 0.18 * r, y0 + Math.sin(a) * R * 0.18 * r);
      }
      ctx.stroke(); ctx.restore();
    }
    var vg = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.4, W / 2, H * 0.55, Math.max(W, H) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,' + (0.26 + 0.12 * r).toFixed(2) + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    if (gq === 'alto' && info.sol) {
      var sx = info.sol[0] * W, sy = info.sol[1] * H, gs = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.35);
      gs.addColorStop(0, 'rgba(255,248,225,.55)'); gs.addColorStop(0.15, 'rgba(255,240,200,.18)'); gs.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gs; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      [0.35, 0.6, 1.25].forEach(function (t, k) {
        var fx = sx + (W / 2 - sx) * t * 1.6, fy = sy + (H / 2 - sy) * t * 1.6;
        ctx.fillStyle = ['rgba(120,180,255,.10)', 'rgba(255,200,120,.09)', 'rgba(160,255,200,.07)'][k];
        ctx.beginPath(); ctx.arc(fx, fy, [18, 30, 12][k] * (W / 600 + 0.5), 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }
  }
  /* desenha pela câmera escolhida: 3D (se a biblioteca carregou) ou de cima. Enquanto o 3D carrega, mostra a visão de cima. */
  function pintarCena(ctx, W, H, o, caixa, repinta) {
    var modo = camera();
    if (modo.indexOf('3d') === 0 && window.CHEFE3D && !CHEFE3D.falhou()) {
      if (CHEFE3D.pronto()) {
        ctx.clearRect(0, 0, W, H);
        o.grafico = ler('chefe-grafico', 'medio'); o.relevo = ler('chefe-relevo', 'suave');
        efeitosCamera(ctx, W, H, CHEFE3D.desenhar(caixa, o, modo, W, H), o.grafico, modo);
        minimapa(ctx, W, H, o.PF.P, o.carros, modo === '3dcock');
        return;
      }
      CHEFE3D.carregar(repinta);
    } else if (window.CHEFE3D) CHEFE3D.liberar();
    cenaPerto(ctx, W, H, o);
  }
  function rumoEm(P, f, L) { var a = P.ponto(f - 5 / L), b = P.ponto(f + 5 / L); return Math.atan2(b.y - a.y, b.x - a.x); }
  function retRedondo(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  /* Carro de F1 2026 visto de cima, em metros (x para a frente). c: { visual, pneu, freio, bat, molhado } */
  function carroF1(ctx, c) {
    var v = c.visual, corPneu = PNEU[c.pneu || 'M'].cor, esc = v.id === 'preto' || v.id === 'branco';
    /* sombra */
    ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.beginPath(); ctx.ellipse(-0.05, 0.22, 2.95, 1.08, 0, 0, Math.PI * 2); ctx.fill();
    /* suspensão */
    ctx.strokeStyle = '#0d0e10'; ctx.lineWidth = 0.07; ctx.beginPath();
    [[1.55, 0.3, 0.8], [1.3, 0.25, 0.8], [-2.1, 0.35, 0.75], [-1.85, 0.4, 0.75]].forEach(function (s) { ctx.moveTo(s[0] + 0.12, -s[1]); ctx.lineTo(s[0], -s[2]); ctx.moveTo(s[0] + 0.12, s[1]); ctx.lineTo(s[0], s[2]); });
    ctx.stroke();
    /* pneus: pretos com a faixa colorida do composto */
    function pneu(x, y, comp, larg) {
      ctx.fillStyle = '#151618'; retRedondo(ctx, x - comp / 2, y - larg / 2, comp, larg, 0.1); ctx.fill();
      ctx.fillStyle = corPneu; ctx.fillRect(x - comp / 2 + 0.1, y - larg / 2 + 0.02, comp - 0.2, 0.055); ctx.fillRect(x - comp / 2 + 0.1, y + larg / 2 - 0.075, comp - 0.2, 0.055);
      ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x - comp / 2 + 0.06, y - larg / 2 + 0.1, comp - 0.12, larg - 0.2);
    }
    pneu(1.55, -0.98, 0.72, 0.34); pneu(1.55, 0.98, 0.72, 0.34); pneu(-2.1, -0.93, 0.74, 0.42); pneu(-2.1, 0.93, 0.74, 0.42);
    /* assoalho */
    ctx.fillStyle = '#121315'; ctx.beginPath();
    ctx.moveTo(-2.55, -0.62); ctx.lineTo(-1.3, -0.95); ctx.lineTo(0.5, -0.9); ctx.lineTo(1.0, -0.42); ctx.lineTo(1.0, 0.42); ctx.lineTo(0.5, 0.9); ctx.lineTo(-1.3, 0.95); ctx.lineTo(-2.55, 0.62); ctx.closePath(); ctx.fill();
    /* sidepods e cobertura do motor */
    ctx.fillStyle = v.cor; ctx.beginPath();
    ctx.moveTo(-2.45, -0.2); ctx.quadraticCurveTo(-1.7, -0.5, -1.25, -0.72); ctx.quadraticCurveTo(-0.2, -0.86, 0.25, -0.72); ctx.lineTo(0.3, -0.32);
    ctx.lineTo(0.3, 0.32); ctx.lineTo(0.25, 0.72); ctx.quadraticCurveTo(-0.2, 0.86, -1.25, 0.72); ctx.quadraticCurveTo(-1.7, 0.5, -2.45, 0.2); ctx.closePath(); ctx.fill();
    if (esc) { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 0.04; ctx.stroke(); }
    /* entradas de ar dos sidepods */
    ctx.fillStyle = '#0b0c0e'; ctx.fillRect(0.12, -0.74, 0.16, 0.3); ctx.fillRect(0.12, 0.44, 0.16, 0.3);
    /* monocoque e bico */
    ctx.fillStyle = v.cor; ctx.beginPath();
    ctx.moveTo(0.3, -0.32); ctx.lineTo(1.0, -0.24); ctx.lineTo(2.5, -0.11); ctx.quadraticCurveTo(2.62, 0, 2.5, 0.11); ctx.lineTo(1.0, 0.24); ctx.lineTo(0.3, 0.32); ctx.closePath(); ctx.fill();
    if (esc) { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 0.04; ctx.stroke(); }
    /* friso no meio do carro */
    ctx.strokeStyle = v.friso; ctx.lineWidth = 0.09; ctx.beginPath(); ctx.moveTo(-2.35, 0); ctx.lineTo(-0.2, 0); ctx.moveTo(0.95, 0); ctx.lineTo(2.45, 0); ctx.stroke();
    /* cockpit, capacete e halo */
    ctx.fillStyle = '#0a0b0c'; ctx.beginPath(); ctx.ellipse(0.42, 0, 0.42, 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = v.friso; ctx.beginPath(); ctx.arc(0.32, 0, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b2733'; ctx.beginPath(); ctx.arc(0.36, 0, 0.1, -1.1, 1.1); ctx.fill();
    ctx.strokeStyle = '#1c1d20'; ctx.lineWidth = 0.075; ctx.beginPath(); ctx.ellipse(0.4, 0, 0.44, 0.24, 0, -2.4, 2.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.84, 0); ctx.lineTo(1.02, 0); ctx.stroke();
    /* asa dianteira: plano principal escuro e flaps coloridos */
    ctx.fillStyle = '#16171a'; ctx.fillRect(2.52, -1.0, 0.3, 2.0);
    ctx.fillStyle = v.cor; ctx.fillRect(2.45, -0.98, 0.08, 1.96); ctx.fillStyle = v.friso; ctx.fillRect(2.6, -0.95, 0.05, 0.62); ctx.fillRect(2.6, 0.33, 0.05, 0.62);
    ctx.fillStyle = '#0b0c0e'; ctx.fillRect(2.45, -1.03, 0.4, 0.06); ctx.fillRect(2.45, 0.97, 0.4, 0.06);
    /* asa traseira */
    ctx.fillStyle = '#16171a'; ctx.fillRect(-2.92, -0.55, 0.36, 1.1);
    ctx.fillStyle = v.cor; ctx.fillRect(-2.86, -0.52, 0.14, 1.04); ctx.fillStyle = v.friso; ctx.fillRect(-2.7, -0.5, 0.05, 1.0);
    ctx.fillStyle = '#0b0c0e'; ctx.fillRect(-2.95, -0.58, 0.42, 0.06); ctx.fillRect(-2.95, 0.52, 0.42, 0.06);
    /* luz de freio (acende freando; pisca na chuva, como na F1) */
    var acesa = c.freio || (c.molhado && Math.floor(performance.now() / 250) % 2 === 0);
    ctx.fillStyle = acesa ? '#ff2b2b' : '#4a0c0e'; ctx.fillRect(-3.0, -0.07, 0.07, 0.14);
    if (acesa) { ctx.fillStyle = 'rgba(255,40,40,.35)'; ctx.beginPath(); ctx.arc(-3.0, 0, 0.35, 0, Math.PI * 2); ctx.fill(); }
    /* bateria em uso: brilho azul na traseira */
    if (c.bat) { ctx.fillStyle = 'rgba(80,170,255,.55)'; ctx.beginPath(); ctx.ellipse(-2.6, 0, 0.5, 0.3, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  /* desenha a cena de perto. o: { PF, foco (fração da volta), cam {}, clima, carros: [{ f, lado, visual, pneu, freio, bat, v, jog }], grade: fração entre carros no grid (ou 0) } */
  function cenaPerto(ctx, W, H, o) {
    var PF = o.PF, P = PF.P, L = PF.L, m = P.total / L;
    var cam = o.cam, agora = performance.now(), dt = Math.min(0.1, (agora - (cam.t || agora)) / 1000); cam.t = agora;
    var foco = P.ponto(o.foco), alvo = rumoEm(P, o.foco, L);
    if (cam.ang == null) cam.ang = alvo;
    cam.ang += (((alvo - cam.ang + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * Math.min(1, dt * 5);
    var z = H / (VISTA_M * m), molh = o.clima && o.clima !== 'seco';
    ctx.save();
    ctx.fillStyle = molh ? '#17281c' : '#1f3a24'; ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H * 0.78); ctx.rotate(-cam.ang - Math.PI / 2); ctx.scale(z, z); ctx.translate(-foco.x, -foco.y);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    function caminho() { ctx.beginPath(); P.pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); }
    function trecho(c, a, b) { ctx.beginPath(); for (var j = a; j <= b; j++) { var q = PF.pts[(c + j + PF.N) % PF.N]; if (j === a) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); } }
    /* grama cortada em faixas (no chão do mundo, gira junto com a pista) */
    ctx.fillStyle = molh ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.035)';
    for (var gx = -20; gx < 420; gx += 24 * m) ctx.fillRect(gx, -20, 12 * m, 340);
    /* brita nas áreas de escape das curvas */
    ctx.strokeStyle = molh ? '#4a463c' : '#6b6250'; ctx.lineWidth = (PISTA_M + 36) * m;
    PF.curvas.forEach(function (c) { trecho(c, -16, 10); ctx.stroke(); });
    /* acostamento, faixa branca, zebras, asfalto e trilho de borracha */
    caminho(); ctx.strokeStyle = '#3a3f45'; ctx.lineWidth = (PISTA_M + 8) * m; ctx.stroke();
    ctx.strokeStyle = '#d9dcdf'; ctx.lineWidth = (PISTA_M + 1.2) * m; ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineWidth = (PISTA_M + 4) * m;
    PF.curvas.forEach(function (c) {
      trecho(c, -9, 7); ctx.setLineDash([]); ctx.strokeStyle = '#eeeeee'; ctx.stroke();
      ctx.setLineDash([3 * m, 3 * m]); ctx.strokeStyle = '#c8202a'; ctx.stroke();
    });
    ctx.setLineDash([]); ctx.lineCap = 'round';
    caminho(); ctx.strokeStyle = molh ? '#1f2226' : '#2c2f33'; ctx.lineWidth = PISTA_M * m; ctx.stroke();
    ctx.strokeStyle = molh ? 'rgba(120,150,190,.14)' : 'rgba(0,0,0,.22)'; ctx.lineWidth = PISTA_M * 0.34 * m; ctx.stroke();
    /* linha de chegada quadriculada */
    var s0 = P.ponto(0), a0 = rumoEm(P, 0, L), n = Math.round(PISTA_M);
    ctx.save(); ctx.translate(s0.x, s0.y); ctx.rotate(a0);
    for (var i = 0; i < n; i++) for (var j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? '#f4f6f7' : '#0b0c0e'; ctx.fillRect((j - 1) * m, (i - n / 2) * m, m, m); }
    ctx.restore();
    /* posições do grid */
    if (o.grade) {
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.35 * m;
      for (var g = 0; g < 10; g++) {
        var fg = -g * o.grade, pg = P.ponto(fg), ag = rumoEm(P, fg, L), ld = (g % 2 ? 1 : -1) * 3.5 * m;
        ctx.save(); ctx.translate(pg.x, pg.y); ctx.rotate(ag); ctx.beginPath();
        ctx.moveTo(-1.5 * m + 3.4 * m, ld - 1.6 * m); ctx.lineTo(3.4 * m, ld - 1.6 * m); ctx.lineTo(3.4 * m, ld + 1.6 * m); ctx.lineTo(1.9 * m, ld + 1.6 * m);
        ctx.stroke(); ctx.restore();
      }
    }
    /* carros (o seu por último, por cima) */
    o.carros.slice().sort(function (a, b) { return a.jog - b.jog; }).forEach(function (c) {
      var p = P.ponto(c.f), a = rumoEm(P, c.f, L), off = (c.lado || 0) * m;
      ctx.save(); ctx.translate(p.x - Math.sin(a) * off, p.y + Math.cos(a) * off); ctx.rotate(a); ctx.scale(m * CARRO_K, m * CARRO_K);
      /* spray de água atrás do carro na chuva */
      if (molh && c.v > 8) {
        var forca = Math.min(1, c.v / 70) * (o.clima === 'forte' ? 1 : 0.6);
        for (var k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(210,220,232,' + (0.16 * forca * (1 - k / 4)).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(-3.4 - k * 1.3, 0, 1 + k * 0.5, 0.9 + k * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      carroF1(ctx, { visual: c.visual, pneu: c.pneu, freio: c.freio, bat: c.bat, molhado: molh });
      ctx.restore();
    });
    ctx.restore();
    /* chuva caindo (na tela) */
    if (molh) {
      var gotas = o.clima === 'forte' ? 120 : 55, desl = (agora / 1000) * 520, x = 11;
      ctx.strokeStyle = 'rgba(190,210,240,' + (o.clima === 'forte' ? '.35' : '.22') + ')'; ctx.lineWidth = 1; ctx.beginPath();
      for (var r = 0; r < gotas; r++) {
        x = (x * 9301 + 49297) % 233280; var px = x / 233280 * W; x = (x * 9301 + 49297) % 233280; var py = (x / 233280 * H + desl * (0.8 + (r % 5) * 0.1)) % H;
        ctx.moveTo(px, py); ctx.lineTo(px - 2, py + 10);
      }
      ctx.stroke();
    }
    /* sombra nas bordas da tela */
    var vg = ctx.createRadialGradient(W / 2, H * 0.6, Math.min(W, H) * 0.35, W / 2, H * 0.6, Math.max(W, H) * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    /* minimapa com a pista inteira */
    var mm = Math.min(130, W * 0.3), mh = mm * 0.75, mx = 8, my = H - mh - 8, e = Math.min(mm / 400, mh / 300) * 0.9, ex = mx + (mm - 400 * e) / 2, ey = my + (mh - 300 * e) / 2;
    ctx.fillStyle = 'rgba(8,9,11,.72)'; ctx.fillRect(mx, my, mm, mh);
    ctx.beginPath(); P.pts.forEach(function (p, i) { if (i) ctx.lineTo(ex + p[0] * e, ey + p[1] * e); else ctx.moveTo(ex + p[0] * e, ey + p[1] * e); }); ctx.closePath();
    ctx.strokeStyle = '#8e979f'; ctx.lineWidth = 2; ctx.stroke();
    o.carros.forEach(function (c) {
      var p = P.ponto(c.f); ctx.beginPath(); ctx.arc(ex + p.x * e, ey + p.y * e, c.jog ? 3.6 : 2.4, 0, Math.PI * 2);
      ctx.fillStyle = c.visual.cor; ctx.fill(); if (c.jog) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke(); }
    });
  }

  /* opcoes.limite: corridas grátis para visitantes (página inicial). Plano Médio: LIMITE_MEDIO corridas por dia. Plano Master: sem limite.
     No plano Médio quem conta é o servidor de contas (ações chefe e chefe_corrida): limpar o navegador não zera o limite. */
  var LIMITE_MEDIO = 15;
  window.JOGO_CHEFE = function (el, opcoes) {
    var LIMITE = (opcoes && opcoes.limite) || 0, modo = LIMITE ? 'visitante' : 'livre';
    if (opcoes && opcoes.plano === 'medio') modo = 'medio'; /* plano Médio: LIMITE_MEDIO corridas por dia */
    function hoje() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    var usadasServidor = 0; /* plano Médio: quantas corridas o servidor já contou hoje */
    function usadas() {
      if (modo === 'medio') return usadasServidor;
      return ler('chefe-demo-corridas', 0);
    }
    function contar() {
      if (modo === 'visitante') guardar('chefe-demo-corridas', usadas() + 1);
    }
    function limiteAtual() { return modo === 'medio' ? LIMITE_MEDIO : LIMITE; }
    function semLimite() { return modo === 'livre' || modo === 'master'; }
    function restantes() { return semLimite() ? Infinity : Math.max(0, limiteAtual() - usadas()); }
    function atualizarAviso() {
      var c = document.getElementById('ch-limite'); if (!c) return;
      if (semLimite()) { c.hidden = true; return; }
      c.hidden = false;
      c.innerHTML = modo === 'medio'
        ? 'Plano Médio: <b>' + restantes() + '/' + LIMITE_MEDIO + '</b> corridas hoje. No plano Master, sem limite.'
        : 'Demonstração grátis: <b>' + restantes() + '/' + LIMITE + '</b> corridas restantes. Plano Médio: 15 corridas por dia. Plano Master: sem limite.';
    }
    if (LIMITE && window.NAVEIA_EU) window.NAVEIA_EU.then(function (r) {
      var pl = r && r.logado && r.usuario ? r.usuario.plano : '';
      if (pl === 'master' || pl === 'medio') {
        modo = pl; atualizarAviso();
        if (tela.querySelector('.ch-limite-fim') && restantes() > 0) telaEscolha();
        else if (restantes() <= 0 && tela.querySelector('#ch-quali')) telaLimite();
      }
    });
    /* plano Médio: pega do servidor quantas corridas já foram hoje */
    if (modo === 'medio' && window.NAVEIA_API) window.NAVEIA_API('chefe').then(function (r) {
      if (r && r.ok && typeof r.usadas === 'number') { usadasServidor = r.usadas; atualizarAviso(); if (restantes() <= 0 && !tela.querySelector('.ch-fim')) telaLimite(); }
    }).catch(function () {});
    /* plano Médio: antes de largar, o servidor conta a corrida (ou diz que acabou o limite) */
    function pedirCorrida(seguir) {
      if (modo !== 'medio') { seguir(); return; }
      window.NAVEIA_API('chefe_corrida', {}).then(function (r) {
        if (r && typeof r.usadas === 'number') usadasServidor = r.usadas;
        if (r && r.ok) { atualizarAviso(); seguir(); return; }
        if (r && r.limite_atingido) { telaLimite(); return; }
        alert((r && r.erro) || 'Não foi possível confirmar sua corrida. Tente de novo.');
      }).catch(function () { alert('Sem conexão com o servidor. Confira a internet e tente de novo.'); });
    }
    /* tela quando acabam as corridas grátis */
    function telaLimite() {
      motorDesligar(); clearTimeout(raf); if (window.CHEFE3D) CHEFE3D.liberar();
      var local = /^(localhost|127.0.0.1|)$/.test(location.hostname);
      tela.innerHTML = '<div class="ch-limite-fim">' + (modo === 'medio'
        ? '<b>Você usou as ' + LIMITE_MEDIO + ' corridas de hoje</b><p>Amanhã tem mais ' + LIMITE_MEDIO + '. No plano Master você joga o Chefe de Equipe sem limite.</p>' +
          '<div class="ch-acoes"><a class="pl-botao" href="planos.html">Conhecer o Master</a></div>'
        : '<b>Você usou as ' + LIMITE + ' corridas grátis</b><p>Gostou? No plano Médio você joga 15 corridas por dia, e no Master, sem limite. Os planos também têm alertas de largada, prévias das etapas e mais.</p>' +
          '<div class="ch-acoes"><a class="pl-botao" href="planos.html">Ver os planos</a><a class="pl-botao pl-botao-linha" href="entrar.html?volta=index.html">Já sou assinante</a></div>') +
        '' + '</div>';
    }
    /* só pistas do calendário oficial da F1 2026 (Ímola saiu; Sepang recebe o GP do Bahrein) */
    var FORA_F1 = { 'Ímola': 1 }; /* Sepang voltou em 2026: recebe o GP do Bahrein */
    var TODAS = (window.CIRCUITOS || []).filter(function (c) { return !FORA_F1[c.nome]; });
    var escolha = { cor: ler('chefe-cor', 'preto'), pista: 'aleatoria', clima: ler('chefe-clima', 'seco'), duracao: ler('chefe-duracao', 'curta'), nivel: NIVEIS[ler('chefe-nivel', 'medio')] ? ler('chefe-nivel', 'medio') : 'medio' };
    function nivel() { return NIVEIS[escolha.nivel]; }
    function chaveRec() { return escolha.nivel === 'medio' ? 'chefe-rec' : 'chefe-rec-' + escolha.nivel; }
    var jogo = null, raf = 0;

    el.innerHTML = '<div class="jg-cab-jogo"><h2>Chefe de Equipe</h2><p>Você comanda a estratégia de um dos 10 carros: o ritmo do piloto, a hora de parar nos boxes e o pneu. Na corrida você também pilota: W acelera, S freia e espaço usa a bateria. Tudo em tempo real, com números de um F1 2026. Use pelo menos dois tipos de pneu, ou leva 10 segundos de punição.</p></div><div id="ch-tela"></div>';
    var tela = el.querySelector('#ch-tela');

    /* ---------- Tela de escolha ---------- */
    function telaEscolha() {
      motorDesligar();
      if (window.CHEFE3D) CHEFE3D.liberar();
      clearTimeout(raf);
      var rec = ler(chaveRec(), { melhor: null, vitorias: 0, corridas: 0 });
      tela.innerHTML = '<div class="ch-escolha">' +
        '<div class="ch-bloco"><h3>Escolha a cor do seu carro</h3><div class="ch-cores" role="radiogroup" aria-label="Cor do carro">' +
        CORES.map(function (c) {
          return '<button type="button" class="ch-cor" role="radio" data-cor="' + c.id + '" aria-checked="' + (c.id === escolha.cor) + '" title="' + c.nome + '">' + carroSvg(c) + '<span>' + c.nome + '</span></button>';
        }).join('') + '</div></div>' +
        '<div class="ch-bloco"><h3>Escolha a pista</h3><select id="ch-pista" class="ch-select"><option value="aleatoria">Pista aleatória</option>' +
        TODAS.map(function (c, i) { return '<option value="' + i + '">' + esc(c.nome) + '</option>'; }).join('') + '</select>' +
        '<h3 class="ch-nivel-tit">Nível</h3><div class="ch-botoes ch-nivel" id="ch-nivel">' +
        Object.keys(NIVEIS).map(function (k) { return '<button type="button" data-nivel="' + k + '" aria-pressed="' + (k === escolha.nivel) + '">' + NIVEIS[k].nome + '</button>'; }).join('') + '</div>' +
        '<p class="ch-nivel-txt" id="ch-nivel-txt"></p>' +
        '<h3 class="ch-nivel-tit">Direção</h3><div class="ch-botoes ch-nivel" id="ch-direcao">' +
        [['assistida', 'Assistida'], ['elite', 'Elite']].map(function (k) { return '<button type="button" data-dr="' + k[0] + '" aria-pressed="' + (k[0] === ler('chefe-direcao', 'assistida')) + '">' + k[1] + '</button>'; }).join('') + '</div>' +
        '<p class="ch-nivel-txt">Assistida: o carro segue a pista sozinho, você acelera e freia. Elite: você esterça com A e D (no celular, botões ◀ e ▶). Entrou rápido demais, o carro escorrega para fora; na grama perde velocidade; no muro, para.</p>' +
        '<h3 class="ch-nivel-tit">Câmbio</h3><div class="ch-botoes ch-nivel" id="ch-cambio">' +
        [['auto', 'Automático'], ['manual', 'Manual']].map(function (k) { return '<button type="button" data-cb="' + k[0] + '" aria-pressed="' + (k[0] === ler('chefe-cambio', 'auto')) + '">' + k[1] + '</button>'; }).join('') + '</div>' +
        '<p class="ch-nivel-txt">Manual: E sobe a marcha e Q desce (no celular, botões Marcha + e Marcha −). Sem subir, o motor bate no limitador; marcha alta em baixa velocidade deixa o carro sem força.</p>' +
        '<h3 class="ch-nivel-tit">Duração da corrida</h3><div class="ch-botoes ch-nivel" id="ch-duracao">' +
        Object.keys(DURACAO).map(function (k) { return '<button type="button" data-d="' + k + '" aria-pressed="' + (k === escolha.duracao) + '">' + DURACAO[k].nome + ' (' + DURACAO[k].voltas + ' voltas)</button>'; }).join('') + '</div>' +
        '<h3 class="ch-nivel-tit">Gráficos</h3><div class="ch-botoes ch-nivel" id="ch-grafico">' +
        [['baixo', 'Baixo'], ['medio', 'Médio'], ['alto', 'Alto']].map(function (k) { return '<button type="button" data-g="' + k[0] + '" aria-pressed="' + (k[0] === ler('chefe-grafico', 'medio')) + '">' + k[1] + '</button>'; }).join('') + '</div>' +
        '<p class="ch-nivel-txt" id="ch-grafico-txt"></p>' +
        '<h3 class="ch-nivel-tit">Pista 3D</h3><div class="ch-botoes ch-nivel" id="ch-relevo">' +
        [['suave', 'Com subidas'], ['plano', 'Plana']].map(function (k) { return '<button type="button" data-r="' + k[0] + '" aria-pressed="' + (k[0] === ler('chefe-relevo', 'suave')) + '">' + k[1] + '</button>'; }).join('') + '</div>' +
        '<p class="ch-nivel-txt">Com subidas: só as subidas e descidas grandes de cada pista, como a Eau Rouge. Plana: sem nenhum desnível.</p>' +
        '<h3 class="ch-nivel-tit">Clima</h3><div class="ch-botoes ch-nivel" id="ch-clima">' +
        [['seco', 'Seco'], ['leve', 'Chuva leve'], ['forte', 'Chuva forte'], ['aleatorio', 'Aleatório']].map(function (k) { return '<button type="button" data-clima="' + k[0] + '" aria-pressed="' + (k[0] === escolha.clima) + '">' + k[1] + '</button>'; }).join('') + '</div>' +
        '<ul class="ch-regras"><li><b>Pneus (F1 2026):</b> a Pirelli tem 5 compostos de pista seca, do C1 (mais duro) ao C5 (mais macio). Em cada GP, três deles viram duro (branco), médio (amarelo) e macio (vermelho). Macio é o mais rápido e gasta rápido; duro é o mais lento e dura mais.</li>' +
        '<li><b>Chuva:</b> intermediário (verde) para chuva leve e pneu de chuva (azul) para chuva forte. Pneu liso na pista molhada escorrega muito; pneu de chuva na pista seca é lento e se desgasta rápido.</li>' +
        '<li><b>Ritmo:</b> atacar ganha tempo e gasta pneu; poupar economiza pneu e perde tempo.</li>' +
        '<li><b>Boxes:</b> escolha o pneu e o carro para no fim da volta. A parada custa uns 5 segundos.</li>' +
        '<li><b>Safety car:</b> às vezes ele entra. Parar nos boxes com ele na pista custa menos.</li></ul></div>' +
        '<div class="ch-acoes"><button type="button" class="pl-botao" id="ch-quali">Fazer a classificação</button><button type="button" class="pl-botao pl-botao-linha" id="ch-ir">Largar direto em 6º</button>' +
        '<p class="ch-rec" id="ch-rec"></p>' + '<p class="ch-limite" id="ch-limite" hidden></p>' + '</div></div>';
      tela.querySelector('.ch-cores').addEventListener('click', function (e) {
        var b = e.target.closest('.ch-cor'); if (!b) return;
        escolha.cor = b.getAttribute('data-cor'); guardar('chefe-cor', escolha.cor);
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-checked', x === b); });
      });
      var DESC = { facil: 'Rivais mais lentos e mais folga nas curvas. Bom para aprender.', medio: 'Rivais no mesmo ritmo que você. Precisa pilotar bem.', dificil: 'Rivais rápidos e pouca folga nas curvas. Qualquer erro custa caro.' };
      function mostrarNivel() {
        var r = ler(chaveRec(), { melhor: null, vitorias: 0, corridas: 0 });
        tela.querySelector('#ch-nivel-txt').textContent = DESC[escolha.nivel];
        tela.querySelector('#ch-rec').innerHTML = 'Nível ' + nivel().nome + ' · Melhor resultado: <b>' + (r.melhor ? ordinal(r.melhor) : '--') + '</b> · Vitórias: <b>' + r.vitorias + '</b> · Corridas: <b>' + r.corridas + '</b>';
      }
      mostrarNivel(); atualizarAviso();
      tela.querySelector('#ch-nivel').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        escolha.nivel = b.getAttribute('data-nivel'); guardar('chefe-nivel', escolha.nivel);
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
        mostrarNivel();
      });
      var DESC_G = { baixo: 'Mais leve, para celulares simples: sem árvores e com menos detalhes.', medio: 'Equilíbrio entre beleza e velocidade.', alto: 'O mais realista: sombras de verdade, carros brilhando, público na arquibancada, céu e morros. Para computadores e celulares mais fortes.' };
      tela.querySelector('#ch-grafico-txt').textContent = DESC_G[ler('chefe-grafico', 'medio')] || DESC_G.medio;
      tela.querySelector('#ch-direcao').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        guardar('chefe-direcao', b.getAttribute('data-dr'));
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      });
      tela.querySelector('#ch-cambio').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        guardar('chefe-cambio', b.getAttribute('data-cb'));
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      });
      tela.querySelector('#ch-duracao').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        escolha.duracao = b.getAttribute('data-d'); guardar('chefe-duracao', escolha.duracao);
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      });
      tela.querySelector('#ch-relevo').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        guardar('chefe-relevo', b.getAttribute('data-r'));
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      });
      tela.querySelector('#ch-grafico').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        guardar('chefe-grafico', b.getAttribute('data-g'));
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
        tela.querySelector('#ch-grafico-txt').textContent = DESC_G[b.getAttribute('data-g')];
      });
      tela.querySelector('#ch-clima').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        escolha.clima = b.getAttribute('data-clima'); guardar('chefe-clima', escolha.clima);
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      });
      tela.querySelector('#ch-pista').value = escolha.pista;
      tela.querySelector('#ch-pista').addEventListener('change', function () { escolha.pista = this.value; });
      tela.querySelector('#ch-ir').addEventListener('click', function () { comecar(); });
      tela.querySelector('#ch-quali').addEventListener('click', classificacao);
    }

    function carroSvg(c) {
      return '<svg viewBox="0 0 40 18" aria-hidden="true"><rect x="1" y="4" width="4" height="10" rx="1" fill="' + c.cor + '"/><rect x="5" y="7" width="26" height="4" rx="2" fill="' + c.cor + '"/>' +
        '<rect x="12" y="5.5" width="12" height="7" rx="3" fill="' + c.cor + '"/><rect x="31" y="3" width="6" height="12" rx="1" fill="' + c.cor + '"/>' +
        '<rect x="6" y="1" width="6" height="3.2" rx="1" fill="#0b0c0e"/><rect x="6" y="13.8" width="6" height="3.2" rx="1" fill="#0b0c0e"/>' +
        '<rect x="25" y="1.5" width="5" height="3" rx="1" fill="#0b0c0e"/><rect x="25" y="13.5" width="5" height="3" rx="1" fill="#0b0c0e"/>' +
        '<rect x="7" y="8.4" width="24" height="1.2" fill="' + c.friso + '"/><circle cx="18" cy="9" r="1.8" fill="#0b0c0e"/></svg>';
    }

    /* ---------- Corrida ---------- */
    function comecar(opc) {
      if (restantes() <= 0) { telaLimite(); return; }
      if (modo === 'medio' && !(opc && opc.contada)) { pedirCorrida(function () { comecar(Object.assign({}, opc, { contada: true })); }); return; }
      contar();
      opc = opc && opc.circ ? opc : {};
      prepararAudio(); motorDesligar();
      var lista = TODAS.length ? TODAS : [];
      if (!lista.length) { tela.innerHTML = '<p class="nota">As pistas ainda não foram carregadas.</p>'; return; }
      var circ = opc.circ || (escolha.pista === 'aleatoria' ? lista[Math.floor(Math.random() * lista.length)] : lista[+escolha.pista]);
      var P = pista(circ), PF = perfil(circ);
      var CL = opc.clima || (escolha.clima === 'aleatorio' || !CLIMA[escolha.clima] ? sortearClima() : escolha.clima);
      /* tempo real: a volta leva o mesmo tempo que levaria de verdade; o número de voltas vem da duração escolhida */
      var KT = 1;
      VOLTA_S = PF.voador;
      VOLTAS = DURACAO[escolha.duracao] ? DURACAO[escolha.duracao].voltas : 3;
      GRID_GAP = 8 / PF.L; ESPACO_SC = 30 / PF.L;
      var minhaCor = CORES.filter(function (c) { return c.id === escolha.cor; })[0] || CORES[0];
      var outras = CORES.filter(function (c) { return c !== minhaCor; });
      /* grid: pela classificação, se houve; senão o jogador larga em 6º */
      var carros = [], ordemGrid = [];
      if (opc.grade) ordemGrid = opc.grade.map(function (g) { return g.jog ? 'jog' : g; });
      else for (var i = 0; i < 10; i++) ordemGrid.push(i === 5 ? 'jog' : 'ia');
      var n = 0;
      ordemGrid.forEach(function (tipo, pos) {
        var jog = tipo === 'jog', doQuali = typeof tipo === 'object', c = jog ? minhaCor : doQuali ? tipo.visual : outras[n++];
        var pneu = CL !== 'seco' ? (jog && opc.pneu ? opc.pneu : CLIMA[CL].largada) : jog ? (opc.pneu && !molhado(opc.pneu) ? opc.pneu : 'M') : ['M', 'M', 'H', 'S', 'H'][Math.floor(Math.random() * 5)];
        carros.push({
          jog: jog, visual: c, sigla: jog ? 'VOCÊ' : doQuali ? tipo.sigla : SIGLAS[pos], prog: -pos * GRID_GAP, grid: pos + 1,
          pneu: pneu, gasto: 0, usados: [pneu], modo: 'normal', habil: jog ? 1 : doQuali ? 1.007 - pos * 0.0022 + sorte(-0.002, 0.002) : sorte(0.988, 1.008),
          boxPedido: null, boxAte: 0, fim: null, pena: 0, velo: 0,
          plano: jog || CL !== 'seco' ? null : planoIA(pneu)
        });
      });
      jogo = { clima: CL, P: P, PF: PF, KT: KT, cmd: { acel: false, freio: false, bat: false }, carros: carros, t: 0, fase: 'luzes', luzes: 0, velocidade: 1, sc: null,
        scVolta: Math.random() < 0.5 ? Math.max(2, Math.floor(sorte(0.3, 0.8) * VOLTAS)) : null, eu: carros.filter(function (c) { return c.jog; })[0], msg: [] };
      jogo.eu.v = 0; jogo.eu.energia = 1; jogo.eu.erros = 0;
      jogo.eu.lat = ((jogo.eu.grid - 1) % 2 ? 1 : -1) * 3.5; jogo.eu.psi = 0;
      jogoAtual = jogo;
      montarTelaCorrida(circ);
      ligarControles();
      motorGrid();
      var ultimo = performance.now();
      function quadro(agora) {
        var dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
        passo(dt * jogo.velocidade);
        desenhar();
        if (jogo.fase !== 'fim') raf = setTimeout(function () { quadro(performance.now()); }, 16);
      }
      clearTimeout(raf);
      raf = setTimeout(function () { quadro(performance.now()); }, 16);
    }

    /* ---------- Classificação: você pilota uma volta rápida ----------
       Acelerar, frear e bateria. Cada ponto da pista tem uma velocidade máxima de curva (pela curvatura real do traçado).
       Chegou rápido demais: passa reto e perde tempo. O tempo define a posição de largada. */
    var EXT = { 'Interlagos': 4309, 'Monza': 5793, 'Spa-Francorchamps': 7004, 'Silverstone': 5891, 'Suzuka': 5807, 'Red Bull Ring': 4318, 'Hungaroring': 4381,
      'Zandvoort': 4259, 'Barcelona-Catalunha': 4657, 'Xangai': 5451, 'Circuito das Américas': 5513, 'Hermanos Rodríguez': 4304, 'Yas Marina': 5281,
      'Lusail': 5419, 'Sepang': 5543, 'Baku': 6003, 'Ímola': 4909, 'Bahrein': 5412 };
    /* Física com números de um F1 2026, em tempo real (metros e segundos):
       motor a combustão ~400 kW e motor elétrico (MGU-K) 350 kW para ~800 kg; bateria de 4 MJ: dura ~11 s de uso e recarrega nas freadas.
       A asa aumenta a aderência com a velocidade: tração ~1,1 g, curva de ~1,8 g (grampo) a ~5 g (curva rápida), freada de ~1,6 g a ~5 g. */
    var P_MOTOR = 500, P_BAT = 437, ARRASTO = 0.00106, BAT_POR_S = 350000 / 4e6, VMAX_BAT = 96, ESCALA_T = 1, USO_MEDIO_BAT = 0.35;
    function tracao(v) { return 10.5 + 0.0012 * v * v; }
    function acelera(v, bat) { return Math.max(0, Math.min(tracao(v), (P_MOTOR + (bat ? P_BAT : 0)) / Math.max(v, 3))) - ARRASTO * v * v; }
    /* volta ideal dos rivais: usam a bateria em parte do tempo */
    function aceleraIdeal(v) { return acelera(v, false) * (1 - USO_MEDIO_BAT) + acelera(v, true) * USO_MEDIO_BAT; }
    function freada(v) { return 15 + 0.0042 * v * v; }
    /* velocidade máxima numa curva de raio R (aderência lateral 16 m/s² + asa) */
    var A_LAT = 25, K_ASA = 0.0065; /* aderência lateral parado (m/s²) e quanto a asa soma com a velocidade */
    function limCurva(R) { var k = K_ASA * R; return k >= 0.98 ? VMAX_BAT : Math.min(VMAX_BAT, Math.sqrt(A_LAT * R / (1 - k))); }
    /* precisa frear já? (velocidade v, curva à frente com limite lj a dist metros; margem porque o freio leva um instante para apertar) */
    function precisaFrear(v, lj, dist, g, m) { return v > lj && v * v - lj * lj > 2 * freada((v + lj) / 2) * g * (m || 0.8) * dist; }

    function perfil(circ) {
      var P = pista(circ), N = 900, L = EXT[circ.nome] || 5200, ds = L / N, pts = [];
      for (var i = 0; i < N; i++) pts.push(P.ponto(i / N));
      var k = Math.max(2, Math.round(18 / ds));
      function rumo(i) { var a = pts[(i - k + N) % N], b = pts[(i + k) % N]; return Math.atan2(b.y - a.y, b.x - a.x); }
      var lim = new Float32Array(N), kurv = new Float32Array(N);
      for (var j = 0; j < N; j++) {
        var d = Math.abs(((rumo((j + k) % N) - rumo((j - k + N) % N)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
        var curv = d / (2 * k * ds);
        lim[j] = limCurva(1 / Math.max(curv, 1e-5));
      }
      /* conservador: o limite de cada ponto é o menor da vizinhança */
      var lim2 = new Float32Array(N);
      for (var q = 0; q < N; q++) { var m = 999; for (var w = -1; w <= 1; w++) m = Math.min(m, lim[(q + w + N) % N]); lim2[q] = Math.max(12, m); }
      /* volta ideal sem bateria (para os tempos dos adversários) */
      /* volta ideal largando parado (igual ao jogador), sem bateria */
      var v = new Float32Array(N), vv = 0;
      for (var f = 0; f < N; f++) { v[f] = vv = Math.min(lim2[f], Math.sqrt(vv * vv + 2 * Math.max(0.5, aceleraIdeal(vv)) * ds)); }
      for (var ib = N - 2; ib >= 0; ib--) { var nx = v[ib + 1]; v[ib] = Math.min(v[ib], Math.sqrt(nx * nx + 2 * freada(nx) * ds)); }
      v[0] = Math.max(v[0], 3);
      var ideal = 0; for (var t = 0; t < N; t++) ideal += ds / v[t];
      /* volta lançada (já em movimento), sem bateria: base do ritmo na corrida */
      var vl = new Float32Array(N), vz = 60;
      for (var pz = 0; pz < 2; pz++) for (var fz = 0; fz < N; fz++) { vl[fz] = vz = Math.min(lim2[fz], Math.sqrt(vz * vz + 2 * Math.max(0.5, aceleraIdeal(vz)) * ds)); }
      for (var bz = 2 * N - 1; bz >= 0; bz--) { var iz = bz % N, nz = vl[(iz + 1) % N]; vl[iz] = Math.min(vl[iz], Math.sqrt(nz * nz + 2 * freada(nz) * ds)); }
      var voador = 0; for (var tz = 0; tz < N; tz++) voador += ds / vl[tz];
      /* curvas lentas (para marcar na pista) */
      var curvas = [];
      for (var c = 0; c < N; c++) { var l = lim2[c]; if (l < 60 && l <= lim2[(c - 1 + N) % N] && l < lim2[(c + 1) % N]) curvas.push(c); }
      var RUA = { 'Baku': 2.6 }; /* circuitos de rua: muro a esta distância da borda da pista (m) */
      /* curvatura do modo Elite (janela de ±3 pontos, média de 5): calibrada para as curvas lentas terem o raio real e a volta ideal ficar perto das voltas reais */
      function dir(i) { var a = pts[(i - 1 + N) % N], b = pts[(i + 1) % N]; return Math.atan2(b.y - a.y, b.x - a.x); }
      var kBruto = new Float32Array(N);
      for (var j2 = 0; j2 < N; j2++) kBruto[j2] = (((dir((j2 + 3) % N) - dir((j2 - 3 + N) % N)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) / (6 * ds);
      for (j2 = 0; j2 < N; j2++) { var sk = 0; for (var q2 = -2; q2 <= 2; q2++) sk += kBruto[(j2 + q2 + N) % N]; kurv[j2] = sk / 5; }
      /* largura real de cada pista (m) e trechos mais estreitos [km início, km fim, largura] */
      var LARGURA = { 'Baku': 11, 'Monza': 12, 'Spa-Francorchamps': 12, 'Interlagos': 13, 'Silverstone': 15, 'Suzuka': 11, 'Red Bull Ring': 13, 'Hungaroring': 14,
        'Zandvoort': 10.5, 'Barcelona-Catalunha': 14, 'Xangai': 16, 'Circuito das Américas': 15, 'Hermanos Rodríguez': 13, 'Yas Marina': 14, 'Lusail': 13, 'Bahrein': 15, 'Sepang': 16 };
      var ESTREITO = { 'Baku': [[2.52, 2.92, 7.6]] }; /* Baku: trecho do castelo (curvas 8 a 10), 7,6 m */
      var meia = new Float32Array(N), base = (LARGURA[circ.nome] || 13) / 2;
      for (j2 = 0; j2 < N; j2++) {
        var km = j2 * ds / 1000, m2 = base;
        (ESTREITO[circ.nome] || []).forEach(function (t) {
          var dentro = Math.min(km - t[0], t[1] - km); /* rampa de 80 m na entrada e na saída */
          if (dentro > -0.08) m2 = Math.min(m2, base + (t[2] / 2 - base) * Math.min(1, (dentro + 0.08) / 0.08));
        });
        meia[j2] = m2;
      }
      /* limite de curva do modo Elite (para o aviso de freada): o menor de ±2 pontos */
      var limE = new Float32Array(N);
      for (j2 = 0; j2 < N; j2++) { var km2 = 0; for (var d2 = -2; d2 <= 2; d2++) km2 = Math.max(km2, Math.abs(kurv[(j2 + d2 + N) % N])); limE[j2] = Math.max(12, limCurva(1 / Math.max(km2, 1e-5))); }
      return { rua: !!RUA[circ.nome], muro: RUA[circ.nome] || 11, meia: meia, limE: limE, P: P, N: N, L: L, ds: ds, kurv: kurv, lim: lim2, ideal: ideal, voador: voador, vl: vl, curvas: curvas, pts: pts };
    }

    /* volta ideal largando parado com aderência g (g multiplica curva, tração e freio) */
    function idealCom(PF, g) {
      var N = PF.N, ds = PF.ds, v = new Float32Array(N), vv = 0, t = 0;
      for (var f = 0; f < N; f++) { v[f] = vv = Math.min(PF.lim[f] * g, Math.sqrt(vv * vv + 2 * Math.max(0.5, aceleraIdeal(vv) * g) * ds)); }
      for (var b = N - 2; b >= 0; b--) { var nx = v[b + 1]; v[b] = Math.min(v[b], Math.sqrt(nx * nx + 2 * freada(nx) * g * ds)); }
      v[0] = Math.max(v[0], 3);
      for (var i = 0; i < N; i++) t += ds / v[i];
      return t;
    }

    function tempoTxt(s) { var m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3); }

    function classificacao() {
      if (restantes() <= 0) { telaLimite(); return; }
      prepararAudio(); motorDesligar();
      var lista = TODAS.length ? TODAS : [];
      if (!lista.length) { tela.innerHTML = '<p class="nota">As pistas ainda não foram carregadas.</p>'; return; }
      var circ = escolha.pista === 'aleatoria' ? lista[Math.floor(Math.random() * lista.length)] : lista[+escolha.pista];
      var PF = perfil(circ);
      var CL = escolha.clima === 'aleatorio' || !CLIMA[escolha.clima] ? sortearClima() : escolha.clima;
      var pneuQ = CLIMA[CL].pneu;
      function gripQ() { return GRIP[CL][pneuQ] * CLIMA[CL].f; }
      /* os rivais usam o melhor pneu para o clima */
      var idealRival = idealCom(PF, GRIP[CL][CLIMA[CL].pneu] * CLIMA[CL].f);
      var minhaCor = CORES.filter(function (c) { return c.id === escolha.cor; })[0] || CORES[0];
      var rivais = CORES.filter(function (c) { return c !== minhaCor; }).map(function (c, i) {
        return { visual: c, sigla: SIGLAS[i], tempo: idealRival * sorte(nivel().quali[0], nivel().quali[1]) };
      });
      var melhor = null, recs = ler('chefe-quali', {});
      var Q = { fase: 'pronto', t: 0, s: 0, v: 0, energia: 1, bateria: false, erros: 0 };

      tela.innerHTML = '<div class="qu-cab"><b>Classificação · ' + esc(circ.nome) + ' · ' + nivel().nome + '</b><span class="qu-clima qu-clima-' + CL + '">' + CLIMA[CL].nome + '</span><span id="qu-melhor">Sua melhor volta: --</span>' + botoesCamera('qu-camera') + htmlVolume('qu-volume') + '</div>' +
        '<div class="ch-pista qu-pista"><canvas id="qu-canvas" role="img" aria-label="Volta de classificação em ' + esc(circ.nome) + '"></canvas>' +
          '<div class="qu-hud"><div><span>Tempo</span><b id="qu-tempo">0:00.000</b></div><div><span>Velocidade</span><b id="qu-vel">0 km/h</b></div><div><span>Marcha</span><b id="qu-marcha">1</b></div>' +
          '<div class="qu-bat"><span>Bateria</span><div><em id="qu-bat"></em></div></div></div>' +
          '<div class="qu-aviso" id="qu-aviso"></div><div class="ch-faixa" id="ch-faixa"></div></div>' +
        '<div class="qu-pneus"><span class="ch-rot">Pneu da classificação</span><div class="ch-botoes" id="qu-pneu">' +
          ['S', 'M', 'H', 'I', 'W'].map(function (p) { return '<button type="button" data-pneu="' + p + '" aria-pressed="' + (p === pneuQ) + '"><i style="background:' + PNEU[p].cor + '"></i>' + ROTULO[p] + '</button>'; }).join('') +
          '</div><p class="qu-pneu-dica" id="qu-pneu-dica"></p></div>' +
        '<div class="qu-controles">' +
          '<button type="button" class="qu-btn qu-freio" data-c="freio">Frear<small>tecla S</small></button>' +
          '<button type="button" class="qu-btn qu-bateria" data-c="bat">Bateria<small>tecla espaço</small></button>' +
          '<button type="button" class="qu-btn qu-acel" data-c="acel">Acelerar<small>tecla W</small></button>' +
          htmlDirecao() + htmlCambio() + '</div>' +
        '<p class="ch-aviso" id="ch-aviso">Segure Acelerar nas retas e Frear antes das curvas marcadas em vermelho. A bateria dá potência extra, acaba rápido e recarrega quando você freia. No computador: W acelera, S freia e espaço usa a bateria.</p>' +
        '<div class="ch-acoes"><button type="button" class="pl-botao" id="qu-comecar" hidden>Começar a volta</button>' +
          '<button type="button" class="pl-botao pl-botao-linha" id="qu-pular">Pular e largar em 6º</button></div>' +
        '<div id="qu-res"></div>' +
        '<p class="jg-credito">Som do motor: gravação real de um Red Bull RB5 (2009), por <a href="https://commons.wikimedia.org/wiki/File:Red_Bull-Renault_RB5_(2009).ogg" target="_blank" rel="noopener">Edvvc, Wikimedia Commons</a>, licença CC BY-SA 3.0. Relevo das pistas: Copernicus DEM (© DLR e Airbus, via Open-Meteo). Carro 3D: <a href="https://sketchfab.com/3d-models/2026-aston-martin-amr26-be9fbc27a1fd4e97ad4302f5aa5125d5" target="_blank" rel="noopener">"2026 Aston Martin AMR26", de Dave Love</a>, licença <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>, modificado (pintura, logos e patrocínios removidos).</p>';

      /* controles: botões (segurar) e teclado */
      var cmd = { acel: false, freio: false, bat: false };
      [].forEach.call(tela.querySelectorAll('.qu-btn'), function (b) {
        var c = b.getAttribute('data-c');
        function liga(e) { e.preventDefault(); if (c === 'acel' && Q.fase === 'pronto') iniciarVolta(); cmd[c] = true; b.classList.add('ativo'); if (b.setPointerCapture && e.pointerId != null) try { b.setPointerCapture(e.pointerId); } catch (x) {} }
        function desliga() { cmd[c] = false; b.classList.remove('ativo'); }
        b.addEventListener('pointerdown', liga);
        b.addEventListener('pointerup', desliga); b.addEventListener('pointercancel', desliga); b.addEventListener('lostpointercapture', desliga);
        b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      });
      var TECLAS = { ArrowUp: 'acel', w: 'acel', W: 'acel', ArrowDown: 'freio', s: 'freio', S: 'freio', ' ': 'bat', Shift: 'bat', a: 'esq', A: 'esq', ArrowLeft: 'esq', d: 'dir', D: 'dir', ArrowRight: 'dir' };
      function trocaQ(d) { if (!Q || !cambioManual()) return; Q.marcha = trocarMarcha(Q.marcha || 1, d, Q.v); }
      ligarCambio(tela, trocaQ);
      ligarVolume(tela.querySelector('#qu-volume'));
      function tecla(e, on) {
        if (on && !e.repeat && /^[eEqQ]$/.test(e.key) && Q && Q.fase === 'volta') { e.preventDefault(); trocaQ(/[eE]/.test(e.key) ? 1 : -1); return; }
        var c = TECLAS[e.key]; if (!c || !Q || Q.fase === 'fim') return;
        if (Q.fase === 'pronto') { if (!(on && c === 'acel')) return; if (!e.repeat) iniciarVolta(); }
        e.preventDefault(); cmd[c] = on;
        var b = tela.querySelector('.qu-btn[data-c="' + c + '"]'); if (b) b.classList.toggle('ativo', on);
      }
      function kd(e) { tecla(e, true); } function ku(e) { tecla(e, false); }
      document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
      function soltarTeclado() { document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); window.removeEventListener('resize', dimensionar); }

      /* desenho */
      var cv = tela.querySelector('#qu-canvas'), ctx, W, H, esc2, ox, oy;
      function dimensionar() {
        var r = cv.parentNode.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
        W = r.width; H = Math.round(W * (W < 560 ? 0.98 : 0.62)); cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
        ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        esc2 = Math.min(W / 400, H / 300) * 0.94; ox = (W - 400 * esc2) / 2; oy = (H - 300 * esc2) / 2;
        pintar();
      }
      window.addEventListener('resize', dimensionar);
      function pt(p) { return [ox + p.x * esc2, oy + p.y * esc2]; }
      var camQ = {};
      function pintar() {
        if (!ctx) return;
        if (camera() !== 'inteira') {
          var fq = (Q ? Q.s : 0) / PF.L;
          pintarCena(ctx, W, H, { PF: PF, foco: fq, cam: camQ, clima: CL, grade: 0,
            carros: [{ f: fq, lado: Q ? Q.lat || 0 : 0, psi: Q ? Q.psi || 0 : 0, st: direcaoElite() && Q ? Q.st || 0 : undefined, direto: true, visual: minhaCor, pneu: pneuQ, corPneu: PNEU[pneuQ].cor, freio: !!(cmd.freio && Q && Q.fase === 'volta'), bat: !!(Q && Q.bateria), v: Q ? Q.v : 0, jog: true, marcha: Q ? Q.marcha || 1 : 1, energia: Q ? Q.energia : 1, pos: 0, volta: Q ? tempoTxt(Q.t) : '' }] }, cv.parentNode, pintar);
          return;
        }
        if (window.CHEFE3D) CHEFE3D.liberar();
        ctx.clearRect(0, 0, W, H); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        var lp = Math.max(9, 7 * esc2);
        function traco(larg, cor) { ctx.beginPath(); PF.P.pts.forEach(function (p, i) { var q = [ox + p[0] * esc2, oy + p[1] * esc2]; if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.stroke(); }
        traco(lp + 5, '#3b4148'); traco(lp, '#23272c');
        /* zonas de curva lenta em vermelho */
        ctx.lineWidth = lp * 0.45; ctx.strokeStyle = 'rgba(227,52,60,.55)';
        PF.curvas.forEach(function (c) {
          ctx.beginPath();
          for (var j = -6; j <= 6; j++) { var q = pt(PF.pts[(c + j + PF.N) % PF.N]); if (j === -6) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
          ctx.stroke();
        });
        var s0 = PF.P.ponto(0), q0 = pt(s0);
        ctx.save(); ctx.translate(q0[0], q0[1]); ctx.rotate(s0.ang);
        for (var i = -2; i < 2; i++) for (var j2 = 0; j2 < 2; j2++) { ctx.fillStyle = (i + j2) % 2 ? '#f4f6f7' : '#0b0c0e'; ctx.fillRect(j2 * 3 - 3, i * lp / 4, 3, lp / 4); }
        ctx.restore();
        pintarChuva(ctx, W, H, CL);
        /* o seu carro: na linha de largada antes da volta, depois onde estiver */
        {
          var p = PF.P.ponto((Q ? Q.s : 0) / PF.L), q = pt(p), k = Math.max(0.95, esc2 * 0.78), v = minhaCor;
          ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(p.ang); ctx.scale(k, k);
          ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill();
          ctx.fillStyle = '#0b0c0e'; [[-8, -6], [-8, 3.5], [4, -5.5], [4, 3]].forEach(function (r) { ctx.fillRect(r[0], r[1], 5, 2.5); });
          ctx.fillStyle = v.cor; ctx.fillRect(-11, -4.5, 3, 9); ctx.fillRect(-8, -1.6, 17, 3.2); ctx.fillRect(-4, -3, 8, 6); ctx.fillRect(9, -5, 3, 10);
          ctx.fillStyle = v.friso; ctx.fillRect(-7, -0.45, 16, 0.9);
          if (Q && Q.bateria) { ctx.fillStyle = 'rgba(80,170,255,.9)'; ctx.fillRect(-14, -1, 3, 2); }
          ctx.restore();
        }
      }
      dimensionar();
      function aviso(t, cls) { var a = tela.querySelector('#qu-aviso'); if (!a) return; a.textContent = t || ''; a.className = 'qu-aviso' + (t ? ' ativo ' + (cls || '') : ''); }

      /* física da volta */
      var marchaAtual = 1;
      function passo(dtReal) {
        if (!Q || Q.fase !== 'volta') return;
        var dt = dtReal * ESCALA_T;
        Q.t += dt;
        var gq = gripQ(), i = Math.floor(Q.s / PF.ds) % PF.N, LIMS = direcaoElite() ? PF.limE : PF.lim, lim = LIMS[i] * gq;
        var bat = cmd.bat && cmd.acel && Q.energia > 0;
        var a;
        /* freio progressivo: começa firme e chega à força total em um quarto de segundo */
        Q.tf = cmd.freio ? (Q.tf || 0) + dt : Math.max(0, (Q.tf || 0) - dt * 3);
        if (cmd.freio) { a = -freada(Q.v) * gq * Math.min(1, 0.5 + Q.tf * 2); if (Q.v > 5) Q.energia = Math.min(1, Q.energia + BAT_POR_S * dt); }
        else if (cmd.acel) { a = acelera(Q.v, bat) * gq * forcaMarcha(Q.v, Q.marcha || 1); if (bat) Q.energia = Math.max(0, Q.energia - BAT_POR_S * dt); }
        else { a = -0.8 - ARRASTO * Q.v * Q.v * 1.6; Q.energia = Math.min(1, Q.energia + 0.02 * dt); }
        Q.bateria = bat;
        Q.v = Math.max(0, Q.v + a * dt);
        /* câmbio: automático troca sozinho; no manual, o limitador segura a velocidade no máximo da marcha */
        if (!cambioManual()) Q.marcha = marchaAuto(Q.v); else { Q.marcha = Q.marcha || 1; var topoQ = TOPO_MARCHA[Q.marcha] / 3.6; if (Q.v > topoQ) Q.v = topoQ; }
        var elite = direcaoElite();
        if (elite) {
          /* Elite: você esterça; ninguém segura o carro na pista */
          var passoD = esterçar(Q, cmd, dt, PF.kurv[i], gq, PF.muro, PF.meia[i]);
          Q.s += passoD.ds;
          if (passoD.ev === 'bateu') { Q.erros++; aviso('Bateu no muro!', 'erro'); Q.avisoAte = Q.t + 1.5; bipe(120, 0.35); }
          else if (passoD.ev === 'fora' && Q.t >= (Q.avisoAte || 0)) { aviso('Fora da pista!', 'erro'); Q.avisoAte = Q.t + 0.4; }
        } else {
          if (Q.v > lim * nivel().folga) { /* passou reto */
            Q.v = lim * 0.55; Q.erros++;
            aviso('Passou reto! Perdeu tempo.', 'erro'); Q.avisoAte = Q.t + 1.2;
            bipe(170, 0.25);
          }
          Q.s += Q.v * dt;
        }
        /* ajuda: freie agora se não der para chegar na próxima curva na velocidade certa */
        /* aviso de freada: fica aceso enquanto ainda for preciso frear para fazer a próxima curva */
        var precisa = false;
        for (var j = 0; j < 90; j++) {
          var idx = (i + j) % PF.N, dist = Math.max(0, j * PF.ds - (Q.s - i * PF.ds)), lj = LIMS[idx] * gq;
          if (precisaFrear(Q.v, lj, dist, gq, cmd.freio ? 0.72 : 0.8)) { precisa = true; break; }
        }
        if (precisa) aviso('FREIE!', 'freie');
        else if (Q.t < (Q.avisoAte || 0)) { /* mantém o "passou reto" na tela */ }
        else if (!cmd.acel && Q.v < lim * 0.85) aviso('Acelere!', 'acelere');
        else aviso('');
        /* marcha pela velocidade (só visual) */
        var km = Q.v * 3.6;
        marchaAtual = Q.marcha || 1;
        tela.querySelector('#qu-tempo').textContent = tempoTxt(Q.t);
        tela.querySelector('#qu-vel').textContent = Math.round(km) + ' km/h';
        tela.querySelector('#qu-marcha').textContent = marchaAtual;
        var eb = tela.querySelector('#qu-bat'); eb.style.width = Math.round(Q.energia * 100) + '%'; eb.classList.toggle('usando', bat);
        motorAtualizar(dtReal, 1, 'corrida', 0, Math.min(1, Q.v / VMAX_BAT), cmd.acel && !cmd.freio, rotacao(Q.v, Q.marcha || 1));
        if (Q.s >= PF.L) fimVolta();
      }
      function fimVolta() {
        Q.fase = 'fim';
        var t = Q.t;
        motorDesligar(); aviso('');
        if (!melhor || t < melhor) melhor = t;
        if (!recs[circ.nome] || t < recs[circ.nome]) { recs[circ.nome] = t; guardar('chefe-quali', recs); }
        tela.querySelector('#qu-melhor').textContent = 'Sua melhor volta: ' + tempoTxt(melhor);
        [].forEach.call(tela.querySelectorAll('.qu-btn'), function (b) { b.classList.remove('ativo'); });
        cmd.acel = cmd.freio = cmd.bat = false;
        mostrarResultado(t);
      }
      function grade() {
        var todos = rivais.map(function (r) { return { visual: r.visual, sigla: r.sigla, tempo: r.tempo, jog: false }; });
        todos.push({ visual: minhaCor, sigla: 'VOCÊ', tempo: melhor, jog: true });
        return todos.sort(function (a, b) { return a.tempo - b.tempo; });
      }
      function mostrarResultado(t) {
        var g = grade(), pos = g.map(function (x) { return x.jog; }).indexOf(true) + 1, pole = g[0].tempo;
        var frase = pos === 1 ? 'Pole position!' : pos <= 3 ? 'Primeira fila garantida por pouco. Boa volta!' : pos <= 6 ? 'Volta boa. Dá para buscar a pole.' : 'Volta difícil. Tente frear mais tarde e usar a bateria nas retas.';
        tela.querySelector('#qu-res').innerHTML = '<div class="ch-fim"><div class="ch-fim-cab"><b>Você larga em ' + ordinal(pos) + '</b><span>Última volta: ' + tempoTxt(t) +
          (Q.erros ? ' · passou reto ' + Q.erros + (Q.erros > 1 ? ' vezes' : ' vez') : '') + '. ' + frase + '</span></div>' +
          '<table class="tabela ch-res"><thead><tr><th>Pos</th><th>Carro</th><th>Tempo</th></tr></thead><tbody>' +
          g.map(function (x, i) { return '<tr class="' + (x.jog ? 'eu ' : '') + 'p' + (i + 1) + '"><td>' + (i + 1) + '</td><td><i class="ch-chip" style="background:' + x.visual.cor + '"></i> ' + x.sigla + '</td><td>' + (i === 0 ? tempoTxt(x.tempo) : '+' + (x.tempo - pole).toFixed(3)) + '</td></tr>'; }).join('') +
          '</tbody></table><div class="ch-acoes"><button type="button" class="pl-botao" id="qu-corrida">Ir para a corrida</button><button type="button" class="pl-botao pl-botao-linha" id="qu-denovo">Tentar outra volta</button></div></div>';
        tela.querySelector('#qu-corrida').addEventListener('click', function () {
          soltarTeclado(); clearTimeout(raf);
          comecar({ circ: circ, grade: grade(), clima: CL, pneu: pneuQ });
        });
        tela.querySelector('#qu-denovo').addEventListener('click', function () { tela.querySelector('#qu-res').innerHTML = ''; prontoNaLargada(); });
        tela.querySelector('#qu-comecar').hidden = true;
        tela.querySelector('#qu-res').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      function iniciarVolta() {
        prepararAudio();
        Q = { fase: 'volta', t: 0, s: 0, v: 0, energia: 1, bateria: false, erros: 0 };
        [].forEach.call(tela.querySelectorAll('#qu-pneu button'), function (b) { b.disabled = true; });
        tela.querySelector('#qu-comecar').hidden = true; tela.querySelector('#qu-pular').hidden = true;
        cv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        motorLigar(true);
        faixa('Valendo!', 'verde'); setTimeout(function () { faixa(''); }, 1300);
        var ultimo = performance.now();
        clearTimeout(raf);
        (function quadro() {
          var agora = performance.now(), dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
          passo(dt); pintar();
          if (Q && Q.fase === 'volta') raf = setTimeout(quadro, 16);
        })();
      }
      function prontoNaLargada() {
        Q = { fase: 'pronto', t: 0, s: 0, v: 0, energia: 1, bateria: false, erros: 0 };
        [].forEach.call(tela.querySelectorAll('#qu-pneu button'), function (b) { b.disabled = false; });
        tela.querySelector('#qu-tempo').textContent = '0:00.000'; tela.querySelector('#qu-vel').textContent = '0 km/h'; tela.querySelector('#qu-marcha').textContent = '1';
        tela.querySelector('#qu-bat').style.width = '100%';
        aviso('Aperte W (ou Acelerar) para sair', 'acelere');
        pintar(); cv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      tela.querySelector('#qu-camera').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        guardar('chefe-camera2', b.getAttribute('data-cam'));
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
        camQ = {}; pintar();
      });
      tela.querySelector('#qu-comecar').addEventListener('click', iniciarVolta);
      aviso('Aperte W (ou Acelerar) para sair', 'acelere');
      tela.querySelector('#qu-pular').addEventListener('click', function () { soltarTeclado(); clearTimeout(raf); comecar({ circ: circ, clima: CL, pneu: pneuQ }); });
      /* escolha do pneu: só antes de sair para a volta */
      var DICA = { S: 'O mais rápido na pista seca.', M: 'Um pouco mais lento que o macio.', H: 'O mais lento dos pneus de pista seca.', I: 'Para chuva leve. Na pista seca, perde muito tempo.', W: 'Para chuva forte. Na pista seca, é o mais lento de todos.' };
      function dicaPneu() {
        var d = DICA[pneuQ];
        if (CL !== 'seco' && !molhado(pneuQ)) d = 'Pneu liso na pista molhada: escorrega muito. Use intermediário ou chuva forte.';
        else if (CL === 'leve' && pneuQ === 'W') d = 'Funciona, mas o intermediário é melhor na chuva leve.';
        else if (CL === 'forte' && pneuQ === 'I') d = 'Funciona, mas o pneu de chuva forte é melhor nessa chuva.';
        else if (CL === 'leve' && pneuQ === 'I') d = 'O melhor pneu para chuva leve.';
        else if (CL === 'forte' && pneuQ === 'W') d = 'O melhor pneu para chuva forte.';
        tela.querySelector('#qu-pneu-dica').textContent = d;
      }
      dicaPneu();
      tela.querySelector('#qu-pneu').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || (Q && Q.fase === 'volta')) return;
        pneuQ = b.getAttribute('data-pneu'); pintar();
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
        dicaPneu();
      });
    }

    function planoIA(pneu) {
      var k = VOLTAS / 10;
      var volta = Math.max(2, pneu === 'S' ? Math.round(sorte(3, 4.4) * k) : pneu === 'M' ? Math.round(sorte(4.6, 6.4) * k) : Math.round(sorte(5.6, 7.4) * k));
      var segundo = pneu === 'H' ? (Math.random() < 0.6 ? 'M' : 'S') : pneu === 'S' ? (Math.random() < 0.6 ? 'H' : 'M') : (Math.random() < 0.5 ? 'H' : 'S');
      return { volta: volta, pneu: segundo };
    }

    function montarTelaCorrida(circ) {
      tela.innerHTML = '<div class="ch-corrida">' +
        '<div class="ch-pista"><canvas id="ch-canvas" aria-label="Corrida em ' + esc(circ.nome) + '" role="img"></canvas>' +
        '<div class="qu-hud"><div><span>Velocidade</span><b id="qu-vel">0 km/h</b></div><div><span>Marcha</span><b id="qu-marcha">1</b></div>' +
        '<div class="qu-bat"><span>Bateria</span><div><em id="qu-bat"></em></div></div></div><div class="qu-aviso" id="qu-aviso"></div>' +
        '<div class="ch-faixa" id="ch-faixa"></div><div class="ch-luzes" id="ch-luzes">' + new Array(6).join('<i></i>') + '</div></div>' +
        '<div class="qu-controles ch-controles">' +
          '<button type="button" class="qu-btn qu-freio" data-c="freio">Frear<small>tecla S</small></button>' +
          '<button type="button" class="qu-btn qu-bateria" data-c="bat">Bateria<small>tecla espaço</small></button>' +
          '<button type="button" class="qu-btn qu-acel" data-c="acel">Acelerar<small>tecla W</small></button>' +
          htmlDirecao() + htmlCambio() + '</div>' +
        '<aside class="ch-torre"><div class="ch-torre-cab"><span id="ch-volta">Volta 1 de ' + VOLTAS + '</span><b>' + esc(circ.nome) + ' · ' + nivel().nome + '</b><small class="qu-clima qu-clima-' + jogo.clima + '">' + CLIMA[jogo.clima].nome + '</small></div><ol id="ch-lista"></ol></aside></div>' +
        '<div class="ch-painel">' +
          '<div class="ch-grupo"><span class="ch-rot">Seu pneu</span><div class="ch-pneu-atual"><i id="ch-pneu-bola"></i><div class="ch-gasto"><em id="ch-gasto"></em></div><b id="ch-gasto-txt"></b></div></div>' +
          '<div class="ch-grupo"><span class="ch-rot">Ritmo</span><div class="ch-botoes" id="ch-modo">' +
            ['atacar', 'normal', 'poupar'].map(function (m) { return '<button type="button" data-modo="' + m + '" aria-pressed="' + (m === 'normal') + '">' + MODO[m].nome + '</button>'; }).join('') + '</div></div>' +
          '<div class="ch-grupo"><span class="ch-rot">Boxes nesta volta</span><div class="ch-botoes" id="ch-box">' +
            ['S', 'M', 'H', 'I', 'W'].map(function (p) { return '<button type="button" data-pneu="' + p + '" aria-pressed="false"><i style="background:' + PNEU[p].cor + '"></i>' + ROTULO[p] + '</button>'; }).join('') + '</div></div>' +
          '<div class="ch-grupo"><span class="ch-rot">Câmera</span>' + botoesCamera('ch-camera') + '</div>' +
          '<div class="ch-grupo"><span class="ch-rot">Som</span><div class="ch-botoes" id="ch-som"><button type="button" aria-pressed="' + somLigado() + '">' + (somLigado() ? 'Ligado' : 'Desligado') + '</button>' + htmlVolume('ch-volume') + '</div></div>' +
          '<div class="ch-grupo"><span class="ch-rot">Velocidade</span><div class="ch-botoes" id="ch-vel"><button type="button" data-v="1" aria-pressed="true">1x</button><button type="button" data-v="2" aria-pressed="false">2x</button></div></div>' +
        '</div><p class="ch-aviso" id="ch-aviso" role="status">Segure Acelerar (W) na largada e nas retas. Frear (S) antes das curvas. Bateria (espaço) dá força extra. Com safety car ou nos boxes, o carro anda sozinho.</p>' +
        '<p class="jg-credito">Som do motor: gravação real de um Red Bull RB5 (2009), por <a href="https://commons.wikimedia.org/wiki/File:Red_Bull-Renault_RB5_(2009).ogg" target="_blank" rel="noopener">Edvvc, Wikimedia Commons</a>, licença CC BY-SA 3.0. Relevo das pistas: Copernicus DEM (© DLR e Airbus, via Open-Meteo). Carro 3D: <a href="https://sketchfab.com/3d-models/2026-aston-martin-amr26-be9fbc27a1fd4e97ad4302f5aa5125d5" target="_blank" rel="noopener">"2026 Aston Martin AMR26", de Dave Love</a>, licença <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>, modificado (pintura, logos e patrocínios removidos).</p>';
      tela.querySelector('#ch-modo').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !jogo) return;
        jogo.eu.modo = b.getAttribute('data-modo');
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      });
      tela.querySelector('#ch-box').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !jogo || jogo.eu.fim != null) return;
        var p = b.getAttribute('data-pneu');
        jogo.eu.boxPedido = jogo.eu.boxPedido === p ? null : p;
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-pneu') === jogo.eu.boxPedido); });
        aviso(jogo.eu.boxPedido ? 'Box, box! Seu carro para no fim desta volta para colocar pneu ' + PNEU[p].nome.toLowerCase() + '.' : 'Parada cancelada.');
      });
      tela.querySelector('#ch-camera').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        guardar('chefe-camera2', b.getAttribute('data-cam'));
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
        camC = {}; desenhar();
      });
      ligarVolume(tela.querySelector('#ch-volume'));
      tela.querySelector('#ch-som').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var novo = !somLigado(); guardar('largada-som', novo); if (novo) prepararAudio();
        b.setAttribute('aria-pressed', novo); b.textContent = novo ? 'Ligado' : 'Desligado';
        if (novo && jogo && jogo.fase === 'corrida' && !motorAtivo()) motorLigar();
      });
      tela.querySelector('#ch-vel').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !jogo) return;
        jogo.velocidade = +b.getAttribute('data-v');
        [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      });
      redimensionar();
      window.addEventListener('resize', redimensionar);
    }

    function aviso(txt) { var a = document.getElementById('ch-aviso'); if (a) a.textContent = txt; }
    function faixa(txt, classe) {
      var f = document.getElementById('ch-faixa'); if (!f) return;
      f.className = 'ch-faixa' + (txt ? ' ativa ' + (classe || '') : '');
      f.textContent = txt || '';
    }

    /* ---------- Pilotagem na corrida: botões (segurar) e teclado W / S / espaço ---------- */
    var teclasCorrida = null;
    function ligarControles() {
      var cmd = jogo.cmd, J = jogo;
      [].forEach.call(tela.querySelectorAll('.ch-controles .qu-btn'), function (b) {
        var c = b.getAttribute('data-c');
        function liga(e) { e.preventDefault(); prepararAudio(); cmd[c] = true; b.classList.add('ativo'); if (b.setPointerCapture && e.pointerId != null) try { b.setPointerCapture(e.pointerId); } catch (x) {} }
        function desliga() { cmd[c] = false; b.classList.remove('ativo'); }
        b.addEventListener('pointerdown', liga);
        b.addEventListener('pointerup', desliga); b.addEventListener('pointercancel', desliga); b.addEventListener('lostpointercapture', desliga);
        b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      });
      var TECLAS = { ArrowUp: 'acel', w: 'acel', W: 'acel', ArrowDown: 'freio', s: 'freio', S: 'freio', ' ': 'bat', Shift: 'bat', a: 'esq', A: 'esq', ArrowLeft: 'esq', d: 'dir', D: 'dir', ArrowRight: 'dir' };
      function trocaC(d) { var eu = J.eu; if (!cambioManual() || J.fase !== 'corrida' || !eu) return; eu.marcha = trocarMarcha(eu.marcha || 1, d, eu.v || 0); }
      ligarCambio(tela, trocaC);
      function tecla(e, on) {
        if (on && !e.repeat && /^[eEqQ]$/.test(e.key) && jogo === J && J.fase !== 'fim' && document.body.contains(tela)) { e.preventDefault(); trocaC(/[eE]/.test(e.key) ? 1 : -1); return; }
        var c = TECLAS[e.key];
        if (!c || jogo !== J || J.fase === 'fim' || !document.body.contains(tela)) return;
        e.preventDefault(); cmd[c] = on;
        var b = tela.querySelector('.ch-controles .qu-btn[data-c="' + c + '"]'); if (b) b.classList.toggle('ativo', on);
      }
      soltarControles();
      teclasCorrida = { kd: function (e) { tecla(e, true); }, ku: function (e) { tecla(e, false); } };
      document.addEventListener('keydown', teclasCorrida.kd); document.addEventListener('keyup', teclasCorrida.ku);
    }
    function soltarControles() {
      if (!teclasCorrida) return;
      document.removeEventListener('keydown', teclasCorrida.kd); document.removeEventListener('keyup', teclasCorrida.ku);
      teclasCorrida = null;
    }
    function avisoPista(t, cls) {
      var a = document.getElementById('qu-aviso'); if (!a) return;
      var n = 'qu-aviso' + (t ? ' ativo ' + (cls || '') : '');
      if (a.className !== n || a.textContent !== (t || '')) { a.textContent = t || ''; a.className = n; }
    }
    /* você pilota: mesma física da classificação. Devolve quanto de volta o carro anda por segundo real. */
    function dirigir(c, dt, J) {
      var PF = J.PF, cmd = J.cmd, dtp = dt * J.KT;
      var fr = ((c.prog % 1) + 1) % 1, i = Math.floor(fr * PF.N) % PF.N, LIMS = direcaoElite() ? PF.limE : PF.lim, lim = LIMS[i];
      var bat = cmd.bat && cmd.acel && c.energia > 0, a;
      c.tf = cmd.freio ? (c.tf || 0) + dtp : Math.max(0, (c.tf || 0) - dtp * 3);
      if (cmd.freio) { a = -freada(c.v) * Math.min(1, 0.5 + c.tf * 2); if (c.v > 5) c.energia = Math.min(1, c.energia + BAT_POR_S * dtp); }
      else if (cmd.acel) { a = acelera(c.v, bat) * forcaMarcha(c.v, c.marcha || 1); if (bat) c.energia = Math.max(0, c.energia - BAT_POR_S * dtp); }
      else { a = -0.8 - ARRASTO * c.v * c.v * 1.6; c.energia = Math.min(1, c.energia + 0.02 * dtp); }
      c.bateria = bat;
      c.v = Math.max(0, c.v + a * dtp);
      if (!cambioManual()) c.marcha = marchaAuto(c.v); else { c.marcha = c.marcha || 1; var topoC = TOPO_MARCHA[c.marcha] / 3.6; if (c.v > topoC) c.v = topoC; }
      var elite = direcaoElite(), passoD = null;
      if (elite) {
        passoD = esterçar(c, cmd, dtp, PF.kurv[i], 1, PF.muro, PF.meia[i]);
        if (passoD.ev === 'bateu') { c.erros++; avisoPista('Bateu no muro!', 'erro'); c.avisoAte = J.t + 1.5; bipe(120, 0.35); }
        else if (passoD.ev === 'fora' && J.t >= (c.avisoAte || 0)) { avisoPista('Fora da pista!', 'erro'); c.avisoAte = J.t + 0.4; }
      } else if (c.v > lim * nivel().folga) {
        c.v = lim * 0.55; c.erros++;
        avisoPista('Passou reto! Perdeu tempo.', 'erro'); c.avisoAte = J.t + 1.2; bipe(170, 0.25);
      }
      var precisa = false;
      for (var j = 0; j < 90; j++) {
        var lj = LIMS[(i + j) % PF.N];
        if (precisaFrear(c.v, lj, Math.max(0, (j - (fr * PF.N - Math.floor(fr * PF.N))) * PF.ds), 1, cmd.freio ? 0.72 : 0.8)) { precisa = true; break; }
      }
      if (precisa) avisoPista('FREIE!', 'freie');
      else if (J.t < (c.avisoAte || 0)) { /* mantém o "passou reto" na tela */ }
      else if (!cmd.acel && c.v < lim * 0.85) avisoPista(c.v < 1 ? 'Aperte W (ou Acelerar)' : 'Acelere!', 'acelere');
      else avisoPista('');
      /* pneu gasto e ritmo escolhido mudam o quanto o carro rende */
      /* bônus do nível (médio 1.06: quem pilota bem e usa a bateria briga pela vitória) */
      var fator = ritmo(c) * VOLTA_S / c.habil * nivel().bonus;
      return (passoD ? passoD.ds / dtp : c.v) * fator * J.KT / PF.L;
    }
    function painelPilotagem(c) {
      var km = c.v * 3.6;
      var ev = document.getElementById('qu-vel'); if (ev) ev.textContent = Math.round(km) + ' km/h';
      var em = document.getElementById('qu-marcha'); if (em) em.textContent = c.marcha || marchaAuto(c.v);
      var eb = document.getElementById('qu-bat'); if (eb) { eb.style.width = Math.round(c.energia * 100) + '%'; eb.classList.toggle('usando', !!c.bateria); }
    }

    /* ---------- Simulação ---------- */
    function ordem() {
      return jogo.carros.slice().sort(function (a, b) {
        if (a.fim != null && b.fim != null) return (a.fim + a.pena) - (b.fim + b.pena);
        if (a.fim != null) return -1; if (b.fim != null) return 1;
        return b.prog - a.prog;
      });
    }
    function faltaComposto(c) { return !c.usados.some(molhado) && c.usados.length < 2; }
    function ritmo(c) {
      var g = c.gasto, base = GRIP[(jogo && jogo.clima) || 'seco'][c.pneu];
      var pneuF = base * (1 - 0.10 * g) - (g > 0.75 ? (g - 0.75) * 0.9 : 0);
      if (g >= 1) pneuF = Math.min(pneuF, 0.72);
      return c.habil * MODO[c.modo].ritmo * Math.max(0.6, pneuF) / VOLTA_S;
    }
    function passo(dt) {
      var J = jogo;
      if (J.fase === 'luzes') {
        J.luzes += dt;
        var acesas = Math.min(5, Math.floor(J.luzes / 0.8));
        if (acesas > (J.bipes || 0)) { J.bipes = acesas; bipe(880, 0.18); }
        var ls = document.querySelectorAll('#ch-luzes i');
        [].forEach.call(ls, function (l, i) { l.classList.toggle('acesa', i < acesas); });
        if (J.luzes > 4.8) { J.fase = 'corrida'; motorLigar(); document.getElementById('ch-luzes').classList.add('apagadas'); faixa('Largada!', 'verde'); setTimeout(function () { faixa(''); }, 1500); }
        return;
      }
      if (J.fase !== 'corrida') return;
      J.t += dt;
      var ord = ordem(), lider = ord[0];
      var voltaLider = Math.max(1, Math.min(VOLTAS, Math.floor(lider.prog) + 1));

      /* Safety car */
      if (J.scVolta && !J.sc && voltaLider === J.scVolta && (lider.prog % 1) > 0.3) {
        J.sc = { ate: lider.prog + 1.3 }; J.scVolta = null;
        faixa('Safety car na pista', 'amarela');
        aviso('Safety car! Os carros andam em fila e a parada nos boxes custa menos agora.');
      }
      if (J.sc && lider.prog > J.sc.ate) { J.sc = null; faixa('Bandeira verde', 'verde'); setTimeout(function () { faixa(''); }, 1500); }

      ord.forEach(function (c, idx) {
        if (c.fim != null) { c.prog += ritmo(c) * dt * 0.6; return; }
        if (c.boxAte > 0) { c.boxAte -= dt; c.vr = 0; if (c.jog) { c.v = 0; avisoPista('Nos boxes', 'erro'); } if (c.boxAte <= 0) { c.boxAte = 0; c.vr = 22; if (c.jog) { c.v = 22; avisoPista(''); } } return; }
        /* estratégia da IA */
        if (!c.jog) ia(c, J);
        var v = ritmo(c);
        var pilotando = c.jog && !J.sc;
        if (pilotando) v = dirigir(c, dt, J);
        else if (!c.jog && !J.sc) {
          /* rival: segue a velocidade ideal de cada ponto da pista (freia nas curvas, acelera nas retas), no ritmo dele */
          var PFr = J.PF, ir = Math.floor((((c.prog % 1) + 1) % 1) * PFr.N) % PFr.N, fatorR = ritmo(c) * VOLTA_S;
          var alvo = PFr.vl[ir] * fatorR;
          c.vr = c.vr || 0;
          c.vr = c.vr < alvo ? Math.min(alvo, c.vr + Math.max(0.5, aceleraIdeal(c.vr)) * dt) : alvo;
          v = c.vr / PFr.L;
        }
        var frente = null;
        for (var k = idx - 1; k >= 0; k--) { if (ord[k].boxAte <= 0 && ord[k].fim == null) { frente = ord[k]; break; } }
        if (J.sc) {
          v = 0.62 / VOLTA_S;
          if (frente) { var gap = frente.prog - c.prog; v = Math.max(0.3 / VOLTA_S, Math.min(1.25 / VOLTA_S, v * (1 + 12 * (gap - ESPACO_SC)))); }
        } else if (frente && !c.jog) {
          /* ar sujo: colado atrás de um carro, só passa quem for bem mais rápido */
          var gap2 = frente.prog - c.prog;
          if (gap2 > 0 && gap2 < 0.012 && v < frente.velo * 1.012) v = Math.min(v, frente.velo);
        }
        var antes = c.prog;
        c.prog += v * dt; c.velo = v; if (!c.jog && J.sc) c.vr = v * J.PF.L;
        if (c.jog && !pilotando) { c.v = v * J.PF.L / J.KT; c.bateria = false; avisoPista('Safety car: o carro anda sozinho', 'erro'); }
        if (J.sc && frente && c.prog > frente.prog - ESPACO_SC) c.prog = Math.max(antes, frente.prog - ESPACO_SC);
        if (c.prog > 0) c.gasto = Math.min(1.2, c.gasto + PNEU[c.pneu].gasto * (J.clima === 'seco' && molhado(c.pneu) ? 2.5 : 1) * (10 / VOLTAS) * MODO[c.modo].gasto * (c.prog - Math.max(0, antes)) * (J.sc ? 0.4 : 1));
        /* passou pela linha de chegada */
        if (Math.floor(c.prog) > Math.floor(antes) && c.prog >= 1) {
          var voltas = Math.floor(c.prog);
          if (voltas >= VOLTAS) {
            c.fim = J.t;
            if (faltaComposto(c)) c.pena = 10;
            if (c.jog) { faixa('Bandeira quadriculada', 'quadriculada'); aviso('Você cruzou a linha. Esperando os outros carros.'); }
            return;
          }
          if (c.boxPedido) {
            c.prog = voltas + 0.0005;
            c.boxAte = PARADA_S + (c.jog ? 0 : sorte(-0.3, 0.6)) - (J.sc ? 1.8 : 0);
            if (c.jog) parafusadeira();
            c.pneu = c.boxPedido; c.gasto = 0; if (c.usados.indexOf(c.pneu) < 0) c.usados.push(c.pneu);
            if (c.jog) {
              aviso('Pit stop! Pneu ' + PNEU[c.pneu].nome.toLowerCase() + ' colocado.');
              [].forEach.call(document.querySelectorAll('#ch-box button'), function (x) { x.setAttribute('aria-pressed', 'false'); });
            }
            c.boxPedido = null;
          }
          if (c.jog && voltas === VOLTAS - 1) aviso('Última volta!' + (faltaComposto(c) ? ' Atenção: você ainda não usou dois tipos de pneu. Vai levar 10 segundos de punição.' : ''));
        }
      });
      var eu = J.eu;
      /* curvatura da pista logo à frente do seu carro (quanto a direção muda) */
      var a1 = J.P.ponto(eu.prog + 0.004).ang, a2 = J.P.ponto(eu.prog + 0.016).ang;
      var curva = Math.abs(((a2 - a1 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
      if (eu.fim == null && eu.boxAte <= 0 && !J.sc) motorAtualizar(dt, 1, 'corrida', curva, Math.min(1, eu.v / VMAX_BAT), J.cmd.acel && !J.cmd.freio, rotacao(eu.v, eu.marcha || 1));
      else motorAtualizar(dt, (eu.velo || 1 / VOLTA_S) * VOLTA_S, eu.fim != null ? 'fim' : eu.boxAte > 0 ? 'box' : (J.sc ? 'sc' : 'corrida'), curva);
      if (eu.fim != null) { eu.v = (eu.velo || 0) * J.PF.L / J.KT; avisoPista(''); }
      painelPilotagem(eu);
      if (eu.fim != null && !J.motorParou) { J.motorParou = true; setTimeout(motorDesligar, 2500); }
      if (J.carros.every(function (c) { return c.fim != null; })) terminar();
    }

    function ia(c, J) {
      var volta = Math.floor(c.prog) + 1;
      if (c.plano && !c.boxPedido) {
        var perto = volta >= c.plano.volta - 1 && volta <= c.plano.volta + 1;
        if (volta >= c.plano.volta || (J.sc && perto) || c.gasto > 0.92) { c.boxPedido = c.plano.pneu; c.plano = null; }
      }
      c.modo = c.gasto > 0.8 ? 'poupar' : (volta >= VOLTAS - 1 && c.gasto < 0.6 ? 'atacar' : 'normal');
    }

    /* ---------- Desenho ---------- */
    var cv, ctx, escala = 1, dx = 0, dy = 0, W = 0, H = 0;
    function redimensionar() {
      cv = document.getElementById('ch-canvas'); if (!cv) return;
      var caixa = cv.parentNode.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      W = caixa.width; H = Math.round(W * (W < 560 ? 0.98 : 0.66));
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
      ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      escala = Math.min(W / 400, H / 300) * 0.94; dx = (W - 400 * escala) / 2; dy = (H - 300 * escala) / 2;
      desenhar();
    }
    function xy(p) { return [dx + p.x * escala, dy + p.y * escala]; }
    var camC = {};
    function desenhar() {
      if (!ctx || !jogo) return;
      var J = jogo, P = J.P;
      if (camera() !== 'inteira') {
        var ordP = ordem(), L = J.PF.L, lista = [], feitos = [];
        ordP.slice().sort(function (a, b) { return b.jog - a.jog; }).forEach(function (c) {
          if (c.boxAte > 0) return;
          var lado = 0;
          if (c.jog && direcaoElite() && J.fase !== 'luzes') lado = c.lat || 0;
          else if (J.fase === 'luzes') lado = ((c.grid - 1) % 2 ? 1 : -1) * 3.5;
          else {
            var perto = feitos.filter(function (x) { return Math.abs(x - c.prog) * L < 9; }).length;
            if (perto) lado = (perto % 2 ? 1 : -1) * 3.4 * Math.ceil(perto / 2);
          }
          feitos.push(c.prog);
          lista.push({ f: c.prog, lado: lado, psi: c.jog && direcaoElite() ? c.psi || 0 : 0, st: c.jog && direcaoElite() ? c.st || 0 : undefined, direto: c.jog && direcaoElite() && J.fase !== 'luzes', visual: c.visual, pneu: c.pneu, corPneu: PNEU[c.pneu].cor, jog: c.jog, marcha: c.jog ? c.marcha || marchaAuto(c.v || 0) : 0, energia: c.energia, pos: c.jog ? ordP.indexOf(c) + 1 : 0, volta: c.jog ? 'V ' + Math.max(1, Math.min(VOLTAS, Math.floor(c.prog) + 1)) + '/' + VOLTAS : '', freio: c.jog && J.cmd.freio && J.fase === 'corrida', bat: c.jog && c.bateria,
            v: c.jog ? (c.v || 0) : J.fase === 'corrida' ? (c.vr || 0) : 0 });
        });
        pintarCena(ctx, W, H, { PF: J.PF, foco: J.eu.boxAte > 0 ? 0 : J.eu.prog, cam: camC, clima: J.clima, grade: GRID_GAP, carros: lista }, cv.parentNode, desenhar);
        if (!J.proxTorre || J.t >= J.proxTorre || J.fase !== 'corrida') { J.proxTorre = J.t + 0.25; torre(ordP); }
        return;
      }
      if (window.CHEFE3D) CHEFE3D.liberar();
      ctx.clearRect(0, 0, W, H);
      /* pista */
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      function traco(larg, cor) {
        ctx.beginPath();
        P.pts.forEach(function (p, i) { var q = [dx + p[0] * escala, dy + p[1] * escala]; if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
        ctx.closePath(); ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.stroke();
      }
      var lp = Math.max(9, 7 * escala);
      traco(lp + 5, '#3b4148'); traco(lp, '#23272c'); traco(1, 'rgba(255,255,255,.08)');
      pintarChuva(ctx, W, H, J.clima);
      /* curvas lentas em vermelho: freie antes delas */
      if (J.PF) {
        ctx.lineWidth = lp * 0.45; ctx.strokeStyle = 'rgba(227,52,60,.55)';
        J.PF.curvas.forEach(function (c) {
          ctx.beginPath();
          for (var j = -6; j <= 6; j++) { var q2 = xy(J.PF.pts[(c + j + J.PF.N) % J.PF.N]); if (j === -6) ctx.moveTo(q2[0], q2[1]); else ctx.lineTo(q2[0], q2[1]); }
          ctx.stroke();
        });
      }
      /* linha de chegada e boxes */
      var s = P.ponto(0), q = xy(s), n = [-Math.sin(s.ang), Math.cos(s.ang)];
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(s.ang);
      for (var i = -2; i < 2; i++) for (var j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? '#f4f6f7' : '#0b0c0e'; ctx.fillRect(j * 3 - 3, i * lp / 4, 3, lp / 4); }
      ctx.restore();
      var box = [q[0] + n[0] * (lp + 10), q[1] + n[1] * (lp + 10)];
      ctx.fillStyle = 'rgba(227,52,60,.15)'; ctx.fillRect(box[0] - 14, box[1] - 7, 28, 14);
      ctx.fillStyle = '#e3343c'; ctx.font = '700 9px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BOX', box[0], box[1] + 3);
      /* carros (de trás para frente, o seu por último) */
      var ord = ordem(), lista = ord.slice().reverse();
      lista.sort(function (a, b) { return a.jog - b.jog; });
      var ocupado = [];
      lista.forEach(function (c) {
        var pos, ang;
        if (c.boxAte > 0) { pos = box; ang = s.ang; }
        else {
          var pt = P.ponto(c.prog); pos = xy(pt); ang = pt.ang;
          /* desvia um pouco para o lado quando há carro colado */
          var lado = 0;
          ocupado.forEach(function (o) { if (Math.hypot(o[0] - pos[0], o[1] - pos[1]) < 9) lado++; });
          if (lado) { var nn = [-Math.sin(ang), Math.cos(ang)], off = (lado % 2 ? 1 : -1) * 4.5 * Math.ceil(lado / 2); pos = [pos[0] + nn[0] * off, pos[1] + nn[1] * off]; }
          ocupado.push(pos);
        }
        carro(pos, ang, c.visual, c.jog);
      });
      /* torre de posições (4 vezes por segundo) */
      if (!J.proxTorre || J.t >= J.proxTorre || J.fase !== 'corrida') { J.proxTorre = J.t + 0.25; torre(ord); }
    }
    function carro(pos, ang, v, jog) {
      var k = Math.max(0.95, escala * 0.78);
      ctx.save(); ctx.translate(pos[0], pos[1]); ctx.rotate(ang); ctx.scale(k, k);
      if (jog) { ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill(); }
      ctx.fillStyle = '#0b0c0e';
      [[-8, -6], [-8, 3.5], [4, -5.5], [4, 3]].forEach(function (r) { ctx.fillRect(r[0], r[1], 5, 2.5); });
      ctx.fillStyle = v.cor;
      ctx.fillRect(-11, -4.5, 3, 9); ctx.fillRect(-8, -1.6, 17, 3.2); ctx.fillRect(-4, -3, 8, 6); ctx.fillRect(9, -5, 3, 10);
      ctx.fillStyle = v.friso; ctx.fillRect(-7, -0.45, 16, 0.9);
      ctx.fillStyle = '#0b0c0e'; ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, Math.PI * 2); ctx.fill();
      if (v.id === 'preto' || v.id === 'branco') { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 0.6; ctx.strokeRect(-8, -1.6, 17, 3.2); }
      ctx.restore();
    }
    function torre(ord) {
      var J = jogo, l = document.getElementById('ch-lista'); if (!l) return;
      var lider = ord[0];
      var voltaLider = Math.max(1, Math.min(VOLTAS, Math.floor(lider.prog) + 1));
      var v = document.getElementById('ch-volta'); if (v) v.textContent = J.fase === 'luzes' ? 'No grid' : 'Volta ' + voltaLider + ' de ' + VOLTAS;
      l.innerHTML = ord.map(function (c, i) {
        var gap = i === 0 ? (c.fim != null ? 'Fim' : 'Líder') : c.fim != null && lider.fim != null ? '+' + ((c.fim + c.pena) - (lider.fim + lider.pena)).toFixed(1) : '+' + ((lider.prog - c.prog) * VOLTA_S).toFixed(1);
        return '<li class="' + (c.jog ? 'eu' : '') + '"><span class="ch-pos">' + (i + 1) + '</span><i class="ch-chip" style="background:' + c.visual.cor + '"></i><span class="ch-sig">' + c.sigla + '</span>' +
          (c.boxAte > 0 ? '<em class="ch-box-tag">BOX</em>' : '<em class="ch-gap">' + gap + '</em>') +
          '<b class="ch-pn" style="border-color:' + PNEU[c.pneu].cor + '">' + c.pneu + '</b></li>';
      }).join('');
      var eu = J.eu;
      var bola = document.getElementById('ch-pneu-bola'); if (bola) { bola.textContent = eu.pneu; bola.style.borderColor = PNEU[eu.pneu].cor; }
      var g = document.getElementById('ch-gasto'); if (g) { var pct = Math.min(100, Math.round(eu.gasto * 100)); g.style.width = pct + '%'; g.style.background = pct > 75 ? '#e3343c' : pct > 50 ? '#f2c14e' : '#3fae63'; }
      var gt = document.getElementById('ch-gasto-txt'); if (gt) gt.textContent = PNEU[eu.pneu].nome + ', ' + Math.min(100, Math.round(eu.gasto * 100)) + '% gasto';
    }

    /* ---------- Fim ---------- */
    function terminar() {
      motorDesligar(); soltarControles();
      [].forEach.call(tela.querySelectorAll('.qu-btn'), function (b) { b.classList.remove('ativo'); });
      var J = jogo; J.fase = 'fim';
      clearTimeout(raf);
      var ord = ordem(), pos = ord.indexOf(J.eu) + 1, lider = ord[0];
      var rec = ler(chaveRec(), { melhor: null, vitorias: 0, corridas: 0 });
      var novo = !rec.melhor || pos < rec.melhor;
      rec.corridas++; if (pos === 1) rec.vitorias++; if (novo) rec.melhor = pos;
      guardar(chaveRec(), rec);
      var frase = pos === 1 ? 'Vitória! Estratégia de campeão.' : pos <= 3 ? 'Pódio! Boa leitura de corrida.' : pos <= 6 ? 'Pontos na conta. Dá para ir além.' : 'Corrida difícil. Tente outra estratégia de pneus.';
      tela.insertAdjacentHTML('beforeend', '<div class="ch-fim"><div class="ch-fim-cab"><b>Você terminou em ' + ordinal(pos) + '</b><span>' + frase + (novo ? ' Novo recorde!' : '') + '</span></div>' +
        '<table class="tabela ch-res"><thead><tr><th>Pos</th><th>Carro</th><th>Pneus</th><th>Tempo</th></tr></thead><tbody>' +
        ord.map(function (c, i) {
          var t = i === 0 ? tempo(c.fim + c.pena) : '+' + ((c.fim + c.pena) - (lider.fim + lider.pena)).toFixed(1) + ' s';
          return '<tr class="' + (c.jog ? 'eu ' : '') + 'p' + (i + 1) + '"><td>' + (i + 1) + '</td><td><i class="ch-chip" style="background:' + c.visual.cor + '"></i> ' + c.sigla + ' <small>largou em ' + ordinal(c.grid) + '</small></td>' +
            '<td>' + c.usados.join(' › ') + (c.pena ? ' <small class="ch-pena">+10 s de punição</small>' : '') + '</td><td>' + t + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<div class="ch-acoes"><button type="button" class="pl-botao" id="ch-denovo">Correr de novo</button><button type="button" class="pl-botao pl-botao-linha" id="ch-voltar">Trocar carro ou pista</button>' +
        '<p class="ch-rec">Melhor resultado: <b>' + ordinal(rec.melhor) + '</b> · Vitórias: <b>' + rec.vitorias + '</b> · Corridas: <b>' + rec.corridas + '</b></p></div></div>');
      document.getElementById('ch-denovo').addEventListener('click', function () { window.removeEventListener('resize', redimensionar); comecar(); });
      document.getElementById('ch-voltar').addEventListener('click', function () { window.removeEventListener('resize', redimensionar); soltarControles(); telaEscolha(); });
      document.querySelector('.ch-fim').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function tempo(s) { var m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1); }

    if (restantes() <= 0) telaLimite(); else telaEscolha();
  };
})();
