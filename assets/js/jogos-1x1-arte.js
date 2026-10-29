/* Desenho comum do Basquete 1x1 e do Futebol 1x1: torcida na arquibancada, placas, refletores e os bonecos cabeçudos.
   O fundo (que não se mexe) é desenhado uma vez numa tela escondida; os bonecos e a bola, a cada quadro. */
(function () {
  var PELES = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a8714a'];
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* arquibancada com degraus e gente (cabeça, ombros, às vezes braços para cima); as fileiras de trás ficam menores e mais escuras */
  function torcida(ctx, L, y0, y1, cores) {
    var g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#0b0f1c'); g.addColorStop(1, '#1a2238');
    ctx.fillStyle = g; ctx.fillRect(0, y0, L, y1 - y0);
    var fileiras = Math.floor((y1 - y0) / 24);
    for (var r = 0; r < fileiras; r++) {
      var y = y0 + 14 + r * 24, s = 0.72 + 0.4 * r / fileiras;
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(0, y + 13 * s, L, 3);
      for (var x = -8 + (r % 2) * 10; x < L + 10; x += 17 * s + Math.random() * 5) {
        if (Math.random() < 0.06) continue; /* lugar vazio */
        var cam = Math.random() < 0.55 ? cores[Math.floor(Math.random() * cores.length)] : ['#e5e7eb', '#111827', '#f59e0b', '#16a34a', '#7c3aed', '#dc2626'][Math.floor(Math.random() * 6)];
        var pele = PELES[Math.floor(Math.random() * PELES.length)], hy = y + (Math.random() - 0.5) * 3;
        if (Math.random() < 0.18) { ctx.strokeStyle = pele; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(x - 5 * s, hy + 6 * s); ctx.lineTo(x - 8 * s, hy - 9 * s); ctx.moveTo(x + 5 * s, hy + 6 * s); ctx.lineTo(x + 8 * s, hy - 9 * s); ctx.stroke(); }
        ctx.fillStyle = cam; rr(ctx, x - 7 * s, hy + 4 * s, 14 * s, 14 * s, 4 * s); ctx.fill();
        ctx.fillStyle = pele; ctx.beginPath(); ctx.arc(x, hy, 5.2 * s, 0, 7); ctx.fill();
        if (Math.random() < 0.7) { ctx.fillStyle = ['#1f130b', '#3b2414', '#0f0f0f', '#c9a15a'][Math.floor(Math.random() * 4)]; ctx.beginPath(); ctx.arc(x, hy - 1.2 * s, 5.3 * s, Math.PI, 0); ctx.fill(); }
      }
    }
    var sombra = ctx.createLinearGradient(0, y0, 0, y1); sombra.addColorStop(0, 'rgba(5,7,15,.75)'); sombra.addColorStop(0.5, 'rgba(5,7,15,.25)'); sombra.addColorStop(1, 'rgba(5,7,15,.05)');
    ctx.fillStyle = sombra; ctx.fillRect(0, y0, L, y1 - y0);
  }
  /* refletores no alto, com brilho */
  function refletores(ctx, L, y) {
    [0.12, 0.38, 0.62, 0.88].forEach(function (f) {
      var x = L * f, g = ctx.createRadialGradient(x, y, 2, x, y, 90); g.addColorStop(0, 'rgba(255,250,225,.55)'); g.addColorStop(1, 'rgba(255,250,225,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 90, y - 90, 180, 180);
      ctx.fillStyle = '#2a3148'; rr(ctx, x - 26, y - 8, 52, 16, 3); ctx.fill();
      ctx.fillStyle = '#fffbe6'; for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x - 18 + i * 12, y, 4.2, 0, 7); ctx.fill(); }
    });
  }
  /* placas de propaganda em LED */
  function placas(ctx, L, y, h) {
    var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0d1b3d'); g.addColorStop(1, '#091228');
    ctx.fillStyle = g; ctx.fillRect(0, y, L, h);
    ctx.font = '700 ' + Math.round(h * 0.55) + 'px Inter, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    var txt = ['FAN ZONE', 'AO VIVO', 'FAN ZONE', 'JOGOS GRÁTIS'];
    for (var i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#fbbf24' : '#60a5fa'; ctx.fillText(txt[i], L / 8 + i * L / 4, y + h / 2 + 1); }
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0, y, L, 1.5);
    ctx.textBaseline = 'alphabetic';
  }

  /* boneco cabeçudo. o = { pernas, tronco, cabeca, kit: {camisa, calcao, meiao, chuteira, numero, manga}, pele, cabelo, estilo, bracos, fase, noAr, chute } */
  function boneco(ctx, p, o) {
    var x = p.x, y = p.y, k = o.kit, ol = p.olha || 1;
    var quadril = y - o.pernas, ombro = quadril - o.tronco, cy = ombro - o.cabeca + 10;
    var passo = o.fase ? Math.sin(o.fase) : 0;
    /* pernas: [quadril → pé] */
    function perna(dx, pe) {
      var hx = x + dx, joelhoX = (hx + pe[0]) / 2 + ol * 4, joelhoY = (quadril + pe[1]) / 2 + (o.noAr ? -4 : 0);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = o.pele; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(hx, quadril); ctx.lineTo(joelhoX, joelhoY); ctx.lineTo(pe[0], pe[1] - 4); ctx.stroke();
      ctx.strokeStyle = k.meiao; ctx.lineWidth = 8.5; ctx.beginPath(); ctx.moveTo(joelhoX + (pe[0] - joelhoX) * 0.25, joelhoY + (pe[1] - joelhoY) * 0.25); ctx.lineTo(pe[0], pe[1] - 4); ctx.stroke();
      ctx.fillStyle = k.chuteira; ctx.beginPath(); ctx.ellipse(pe[0] + ol * 4, pe[1] - 2, 9, 4.5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(pe[0] + ol * 4 - 7, pe[1] - 2, 14, 1.5);
    }
    var peTras = o.noAr ? [x - ol * 8, y - 12] : [x - 6 - passo * 9, y], peFrente = o.chute ? [x + ol * 30, y - 20] : o.noAr ? [x + ol * 6, y - 8] : [x + 6 + passo * 9, y];
    /* braços: [ombro → mão] */
    function braco(dx, mao, manga) {
      var sx = x + dx, cx2 = (sx + mao[0]) / 2 - ol * 2, cy2 = (ombro + 4 + mao[1]) / 2 + 3;
      ctx.lineCap = 'round'; ctx.strokeStyle = o.pele; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(sx, ombro + 4); ctx.lineTo(cx2, cy2); ctx.lineTo(mao[0], mao[1]); ctx.stroke();
      if (manga) { ctx.strokeStyle = k.camisa; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(sx, ombro + 4); ctx.lineTo(sx + (cx2 - sx) * 0.7, ombro + 4 + (cy2 - ombro - 4) * 0.7); ctx.stroke(); }
      ctx.fillStyle = o.pele; ctx.beginPath(); ctx.arc(mao[0], mao[1], 4.2, 0, 7); ctx.fill();
    }
    var maoFrente, maoTras;
    if (o.bracos === 'cima') { maoFrente = [x + ol * 10, ombro - 34]; maoTras = [x - ol * 2, ombro - 36]; }
    else if (o.bracos === 'drible') { maoFrente = [x + ol * 24, quadril - 2]; maoTras = [x - ol * 12, quadril + 2 - passo * 4]; }
    else if (o.bracos === 'abertos') { maoFrente = [x + ol * 22, ombro + 10]; maoTras = [x - ol * 22, ombro + 6]; }
    else { maoFrente = [x + ol * 6 + passo * 9, quadril + 2]; maoTras = [x - ol * 6 - passo * 9, quadril + 2]; }

    braco(-ol * 11, maoTras, k.manga);
    perna(-ol * 5, peTras);
    /* calção */
    ctx.fillStyle = k.calcao; rr(ctx, x - 15, quadril - 6, 30, 16, 4); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x - 1, quadril + 2, 2, 8);
    /* camisa com sombreado */
    var gc = ctx.createLinearGradient(x - 15, 0, x + 15, 0); gc.addColorStop(0, k.camisa); gc.addColorStop(1, k.camisaSombra || k.camisa);
    ctx.fillStyle = gc; rr(ctx, x - 15, ombro, 30, o.tronco + 2, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '800 ' + Math.round(o.tronco * 0.46) + 'px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(k.numero, x, ombro + o.tronco * 0.68);
    perna(ol * 5, peFrente);
    braco(ol * 11, maoFrente, k.manga);
    /* pescoço e cabeça */
    ctx.fillStyle = o.pele; ctx.fillRect(x - 5, ombro - 6, 10, 9);
    if (o.estilo === 'black') { ctx.fillStyle = o.cabelo; ctx.beginPath(); ctx.arc(x - ol * 2, cy - 6, o.cabeca + 6, 0, 7); ctx.fill(); }
    var gh = ctx.createRadialGradient(x - o.cabeca * 0.35, cy - o.cabeca * 0.4, 4, x, cy, o.cabeca);
    gh.addColorStop(0, o.peleClara || o.pele); gh.addColorStop(1, o.pele);
    ctx.fillStyle = o.pele; ctx.beginPath(); ctx.arc(x - ol * (o.cabeca - 2), cy + 2, 6, 0, 7); ctx.fill(); /* orelha */
    ctx.fillStyle = gh; ctx.beginPath(); ctx.arc(x, cy, o.cabeca, 0, 7); ctx.fill();
    if (o.estilo === 'curto') { ctx.fillStyle = o.cabelo; ctx.beginPath(); ctx.arc(x, cy - 3, o.cabeca + 1, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(x, cy - o.cabeca * 0.55, x - o.cabeca, cy - 3); ctx.fill(); }
    if (o.estilo === 'moicano') { ctx.fillStyle = o.cabelo; ctx.beginPath(); ctx.ellipse(x, cy - o.cabeca + 2, 6, 12, 0, 0, 7); ctx.fill(); }
    if (o.estilo === 'careca') { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(x - 8, cy - o.cabeca * 0.6, 7, 4, -0.4, 0, 7); ctx.fill(); }
    /* rosto olhando para o lado em que anda */
    var fx = x + ol * o.cabeca * 0.32;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(fx - 7, cy - 2, 5, 6, 0, 0, 7); ctx.ellipse(fx + 7, cy - 2, 5, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(fx - 7 + ol * 2, cy - 1, 2.6, 0, 7); ctx.arc(fx + 7 + ol * 2, cy - 1, 2.6, 0, 7); ctx.fill();
    ctx.strokeStyle = o.sobrancelha || '#120a06'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(fx - 12, cy - 11 + (o.bravo ? 2 : 0)); ctx.lineTo(fx - 3, cy - 10); ctx.moveTo(fx + 3, cy - 10); ctx.lineTo(fx + 12, cy - 11 + (o.bravo ? 2 : 0)); ctx.stroke();
    ctx.strokeStyle = 'rgba(25,12,6,.65)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fx + ol * 2, cy + 5, 3, -0.3, Math.PI * 0.6); ctx.stroke();
    ctx.strokeStyle = '#2a110a'; ctx.lineWidth = 2.2; ctx.beginPath();
    if (o.boca === 'grita') { ctx.fillStyle = '#5a1a12'; ctx.ellipse(fx, cy + 13, 5, 4, 0, 0, 7); ctx.fill(); } else { ctx.arc(fx, cy + 9, 6, 0.25, Math.PI - 0.25); ctx.stroke(); }
    if (o.barba) { ctx.fillStyle = 'rgba(30,20,10,.35)'; ctx.beginPath(); ctx.arc(x, cy + 4, o.cabeca - 3, 0.15, Math.PI - 0.15); ctx.fill(); }
  }
  function sombra(ctx, x, chao, altura) {
    var s = Math.max(0.35, 1 - altura / 260);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.32 * s).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(x, chao + 2, 24 * s, 5 * s, 0, 0, 7); ctx.fill();
  }
  window.ARTE_1X1 = { rr: rr, torcida: torcida, refletores: refletores, placas: placas, boneco: boneco, sombra: sombra };
})();

/* Som, tela cheia, volume, dificuldade e botões de toque dos jogos 1x1 (os sons são gerados na hora, sem arquivos) */
(function () {
  var A = window.ARTE_1X1; if (!A) return;
  var ac = null, mestre = null, torcidaGanho = null, cfg = { vol: 0.7, mudo: false };
  try { var c = JSON.parse(localStorage.getItem('arena-1x1-som') || 'null'); if (c) cfg = c; } catch (e) {}
  function salvar() { try { localStorage.setItem('arena-1x1-som', JSON.stringify(cfg)); } catch (e) {} }
  function ganhoMestre() { return cfg.mudo ? 0 : cfg.vol; }
  function iniciar() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC(); mestre = ac.createGain(); mestre.gain.value = ganhoMestre(); mestre.connect(ac.destination);
    /* torcida de fundo: ruído filtrado em laço, que sobe no gol */
    var buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 2200));
    var src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 0.6;
    torcidaGanho = ac.createGain(); torcidaGanho.gain.value = 0.07;
    src.connect(f); f.connect(torcidaGanho); torcidaGanho.connect(mestre); src.start();
  }
  function ruido(dur, freq, q, vol, tipo) {
    var n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ac.createBufferSource(); s.buffer = buf;
    var f = ac.createBiquadFilter(); f.type = tipo || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    var g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(mestre); s.start(); return f;
  }
  function tom(freq, dur, vol, tipo, ate) {
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(mestre); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  var SONS = {
    apito: function () { var o = tom(2900, 0.45, 0.16, 'sine'); var l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 32; lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency); l.start(); l.stop(ac.currentTime + 0.5); },
    buzina: function () { tom(220, 0.8, 0.12, 'square'); tom(225, 0.8, 0.08, 'sawtooth'); },
    chute: function () { tom(150, 0.16, 0.5, 'sine', 45); ruido(0.05, 2000, 1, 0.25); },
    quique: function () { tom(110, 0.1, 0.35, 'sine', 50); },
    trave: function () { tom(620, 0.5, 0.14, 'triangle'); tom(1480, 0.35, 0.06, 'triangle'); },
    aro: function () { tom(520, 0.4, 0.12, 'triangle'); tom(1310, 0.25, 0.05, 'triangle'); },
    rede: function () { var f = ruido(0.35, 3000, 0.8, 0.22, 'bandpass'); f.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.35); },
    roubo: function () { tom(900, 0.08, 0.12, 'square', 400); },
    toco: function () { tom(90, 0.2, 0.5, 'sine', 40); ruido(0.08, 1200, 1, 0.3); },
    especial: function () { tom(220, 0.6, 0.14, 'sawtooth', 1400); tom(330, 0.6, 0.08, 'square', 1800); },
    torcida: function () {
      if (!torcidaGanho) return; var t = ac.currentTime;
      torcidaGanho.gain.cancelScheduledValues(t); torcidaGanho.gain.setValueAtTime(torcidaGanho.gain.value, t);
      torcidaGanho.gain.linearRampToValueAtTime(0.5, t + 0.25); torcidaGanho.gain.linearRampToValueAtTime(0.07, t + 2.6);
    }
  };
  A.som = function (nome) { if (!ac || cfg.mudo || !cfg.vol) return; try { SONS[nome](); } catch (e) {} };
  A.iniciarSom = iniciar;
  A.pausarSom = function (sim) { if (ac) { if (sim) ac.suspend(); else ac.resume(); } };

  var DIF = 'medio'; try { DIF = localStorage.getItem('arena-1x1-dif') || 'medio'; } catch (e) {}
  A.dificuldade = function () { return DIF; };

  /* barra de cima (volume, dificuldade, tela cheia) e botões de toque: [esquerda, direita] e [pular, especial, ação] */
  A.barraHTML = function () {
    return '<div class="b1-barra"><button type="button" class="b1-som" aria-label="Ligar ou desligar o som">' + (cfg.mudo ? '🔇' : '🔊') + '</button>' +
      '<input type="range" class="b1-vol" min="0" max="100" value="' + Math.round(cfg.vol * 100) + '" aria-label="Volume">' +
      '<select class="b1-dif" aria-label="Dificuldade"><option value="facil">Fácil</option><option value="medio">Médio</option><option value="dificil">Difícil</option></select>' +
      '<button type="button" class="b1-cheia">⛶ Tela cheia</button></div>';
  };
  A.botoesHTML = function (acao, especial) {
    return '<div class="b1-botoes"><div class="b1-grupo"><button type="button" data-k="esq" aria-label="Andar para a esquerda">◀</button><button type="button" data-k="dir" aria-label="Andar para a direita">▶</button></div>' +
      '<div class="b1-grupo"><button type="button" data-k="pulo">Pular</button><button type="button" data-k="esp" class="b1-esp">' + especial + '</button><button type="button" data-k="' + (acao === 'Chutar' ? 'chute' : 'arr') + '" class="b1-arr">' + acao + '</button></div></div>';
  };
  A.ligarUI = function (caixa, tecla, aoPausar) {
    [].forEach.call(caixa.querySelectorAll('.b1-botoes button'), function (bt) {
      var k = bt.getAttribute('data-k');
      bt.addEventListener('pointerdown', function (e) { e.preventDefault(); tecla[k] = true; bt.classList.add('ativo'); try { bt.setPointerCapture(e.pointerId); } catch (er) {} });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { bt.addEventListener(ev, function () { tecla[k] = false; bt.classList.remove('ativo'); }); });
      bt.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
    var bs = caixa.querySelector('.b1-som'), vol = caixa.querySelector('.b1-vol'), dif = caixa.querySelector('.b1-dif'), cheia = caixa.querySelector('.b1-cheia');
    bs.addEventListener('click', function () { cfg.mudo = !cfg.mudo; bs.textContent = cfg.mudo ? '🔇' : '🔊'; if (mestre) mestre.gain.value = ganhoMestre(); salvar(); iniciar(); });
    vol.addEventListener('input', function () { cfg.vol = vol.value / 100; if (cfg.vol > 0 && cfg.mudo) { cfg.mudo = false; bs.textContent = '🔊'; } if (mestre) mestre.gain.value = ganhoMestre(); salvar(); });
    dif.value = DIF;
    dif.addEventListener('change', function () { DIF = dif.value; try { localStorage.setItem('arena-1x1-dif', DIF); } catch (e) {} dif.blur(); });
    /* tela cheia: usa a do navegador quando dá e, de qualquer jeito, cobre a tela (no iPhone só a segunda funciona) */
    function sair() { caixa.classList.remove('b1-cheio'); document.documentElement.classList.remove('b1-travado'); cheia.textContent = '⛶ Tela cheia'; }
    cheia.addEventListener('click', function () {
      if (caixa.classList.contains('b1-cheio')) { if (document.fullscreenElement) document.exitFullscreen(); sair(); return; }
      caixa.classList.add('b1-cheio'); document.documentElement.classList.add('b1-travado'); cheia.textContent = '✕ Sair';
      var pedido = caixa.requestFullscreen ? caixa.requestFullscreen() : caixa.webkitRequestFullscreen ? caixa.webkitRequestFullscreen() : null;
      if (pedido && pedido.then) pedido.then(function () { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); }).catch(function () {});
    });
    document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && caixa.classList.contains('b1-cheio')) sair(); });
  };
})();
