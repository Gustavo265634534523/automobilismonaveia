/* Futebol 1x1 (futebol-1x1.html): cabeção contra o computador, 2 minutos, um gol de cada lado.
   Você (azul) defende o gol da direita e ataca o da esquerda. Dá para cabecear, pular e chutar.
   Teclado: setas ou A/D andam, W/seta para cima pula, espaço ou J chuta. No celular, os botões embaixo do campo.
   Usa o mesmo visual e os mesmos botões do Basquete 1x1 (classes b1- em esportes-mais.css). */
(function () {
  var caixa = document.getElementById('f1x1'), JB = window.JOGOS_BASE;
  if (!caixa) return;
  var L = 800, A = 450, CHAO = 400, G = 1300, TEMPO = 120, GOL_ALT = 140, GOL_LARG = 62, R = 14;
  var TRAVE = CHAO - GOL_ALT, RIVAL = 'Zé Canela', ARTE = window.ARTE_1X1; /* o adversário do computador */
  var recorde = (JB && JB.ler('arena-futebol-1x1', null)) || { vitorias: 0, jogos: 0 };

  caixa.innerHTML =
    '<div class="b1-placar"><span class="b1-voce">Você <b id="f1-pv">0</b></span><span class="b1-relogio" id="f1-tempo">2:00</span><span class="b1-cpu"><b id="f1-pc">0</b> ' + RIVAL + '</span></div>' +
    '<div class="b1-tela"><canvas id="f1-c" width="' + L + '" height="' + A + '"></canvas><div class="b1-aviso" id="f1-aviso"></div></div>' +
    '<div class="b1-botoes"><button type="button" data-k="esq" aria-label="Andar para a esquerda">◀</button><button type="button" data-k="dir" aria-label="Andar para a direita">▶</button>' +
    '<button type="button" data-k="pulo">Pular</button><button type="button" data-k="chute" class="b1-arr">Chutar</button></div>' +
    '<p class="dq-nota b1-dica">No computador: setas (ou A/D) andam, ↑ ou W pula, espaço ou J chuta. Você defende o gol da direita e ataca o da esquerda. Pule para cabecear.</p>' +
    '<p class="dq-nota" id="f1-rec"></p>';
  var cv = document.getElementById('f1-c'), ctx = cv.getContext('2d'), aviso = document.getElementById('f1-aviso');

  var fundo = montarFundo();

  var tecla = {}, jogo, ultimo = 0;
  function jogador(x, cor, nome, olha) { return { x: x, y: CHAO, vx: 0, vy: 0, chao: true, cor: cor, nome: nome, olha: olha, chute: 0 }; }
  function novoJogo() {
    jogo = { voce: jogador(560, '#3b82f6', 'voce', -1), cpu: jogador(240, '#ef4444', 'cpu', 1), pv: 0, pc: 0, tempo: TEMPO, rodando: false, fim: false,
      bola: { x: 400, y: 150, vx: 0, vy: 0 }, pausaAte: 0, cpuAlvo: 240, cpuPensa: 0 };
    saida();
    mostrarAviso('<b>Futebol 1x1</b><span>2 minutos contra o computador. Você defende o gol da direita.</span><button type="button" class="ft-btn">Começar</button>');
    atualizarPlacar();
  }
  function saida() {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola;
    V.x = 560; C.x = 240; [V, C].forEach(function (p) { p.y = CHAO; p.vx = p.vy = 0; p.chao = true; p.chute = 0; });
    V.olha = -1; C.olha = 1;
    b.x = 400; b.y = 140; b.vx = (Math.random() - 0.5) * 60; b.vy = 0;
  }
  function mostrarAviso(html) {
    aviso.innerHTML = html; aviso.hidden = false;
    var bt = aviso.querySelector('button');
    if (bt) bt.addEventListener('click', function () { if (jogo.fim) novoJogo(); else { aviso.hidden = true; jogo.rodando = true; } }, { once: true });
  }
  function atualizarPlacar() {
    document.getElementById('f1-pv').textContent = jogo.pv; document.getElementById('f1-pc').textContent = jogo.pc;
    var s = Math.max(0, Math.ceil(jogo.tempo)); document.getElementById('f1-tempo').textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2);
    document.getElementById('f1-rec').textContent = recorde.jogos ? 'Neste aparelho: ' + recorde.vitorias + ' vitória' + (recorde.vitorias === 1 ? '' : 's') + ' em ' + recorde.jogos + ' jogo' + (recorde.jogos === 1 ? '' : 's') + '.' : '';
  }

  function mover(p, dir, dt, vel) {
    p.vx = dir * vel;
    p.x = Math.max(GOL_LARG - 20, Math.min(L - GOL_LARG + 20, p.x + p.vx * dt));
    if (!p.chao) { p.vy += G * dt; p.y += p.vy * dt; if (p.y >= CHAO) { p.y = CHAO; p.vy = 0; p.chao = true; } }
    if (p.chute > 0) p.chute -= dt;
  }
  function pular(p) { if (p.chao) { p.vy = -640; p.chao = false; } }
  /* chute: se a bola estiver perto do pé, sai forte para o lado que ele olha, meio por cima */
  function chutar(p, forca) {
    if (p.chute > 0) return; p.chute = 0.22;
    var b = jogo.bola, px = p.x + p.olha * 22, py = p.y - 16;
    if (Math.hypot(b.x - px, b.y - py) < 48) { b.vx = p.olha * 720 * forca; b.vy = -380 - Math.random() * 180; }
  }
  /* a bola bate na cabeça e no corpo (círculos) e ganha a velocidade do jogador */
  function bater(p, cx, cy, raio) {
    var b = jogo.bola, dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy), min = raio + R;
    if (d >= min || d === 0) return;
    var nx = dx / d, ny = dy / d;
    b.x = cx + nx * min; b.y = cy + ny * min;
    var rvx = b.vx - p.vx, rvy = b.vy - p.vy, vn = rvx * nx + rvy * ny;
    if (vn < 0) { b.vx -= 1.75 * vn * nx; b.vy -= 1.75 * vn * ny; }
    b.vx += p.vx * 0.35; if (!p.chao) b.vy += Math.min(0, p.vy) * 0.3;
  }

  function gol(quem) {
    jogo[quem === 'voce' ? 'pv' : 'pc']++; atualizarPlacar();
    jogo.pausaAte = performance.now() + 1100; jogo.texto = quem === 'voce' ? 'GOOOL!' : 'GOL DO ' + RIVAL.toUpperCase(); jogo.textoAte = jogo.pausaAte;
  }

  function passo(dt) {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola, agora = performance.now();
    if (jogo.pausaAte) { if (agora < jogo.pausaAte) { bolaPasso(dt, true); return; } jogo.pausaAte = 0; saida(); }
    jogo.tempo -= dt;
    if (jogo.tempo <= 0) { fimDeJogo(); return; }

    var dir = (tecla.dir ? 1 : 0) - (tecla.esq ? 1 : 0);
    if (dir) V.olha = dir;
    mover(V, dir, dt, 310);
    if (tecla.pulo) pular(V);
    if (tecla.chute) chutar(V, 1);

    cpuPensar(C, b, dt);
    bolaPasso(dt, false);
  }

  function bolaPasso(dt, parado) {
    var b = jogo.bola;
    b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    b.vx *= 1 - 0.25 * dt;
    if (!parado) [jogo.voce, jogo.cpu].forEach(function (p) { bater(p, p.x, p.y - 72, 28); bater(p, p.x, p.y - 22, 16); });
    if (b.y > CHAO - R) { b.y = CHAO - R; b.vy = -Math.abs(b.vy) * 0.68; b.vx *= 0.93; if (Math.abs(b.vy) < 50) b.vy = 0; }
    if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * 0.6; }
    /* travessão: a bola quica em cima dele e na ponta */
    [[0, GOL_LARG], [L - GOL_LARG, L]].forEach(function (g) {
      var ponta = g[0] === 0 ? GOL_LARG : L - GOL_LARG;
      if (b.x > g[0] && b.x < g[1] && b.y > TRAVE - R && b.y < TRAVE + 6 && b.vy > 0) { b.y = TRAVE - R; b.vy = -Math.abs(b.vy) * 0.6; }
      var dx = b.x - ponta, dy = b.y - TRAVE, d = Math.hypot(dx, dy);
      if (d < R + 4 && d > 0) { var nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.6 * vn * nx; b.vy -= 1.6 * vn * ny; } b.x = ponta + nx * (R + 4); b.y = TRAVE + ny * (R + 4); }
    });
    if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * 0.5; }
    if (b.x > L - R) { b.x = L - R; b.vx = -Math.abs(b.vx) * 0.5; }
    if (!parado && b.y > TRAVE) {
      if (b.x < GOL_LARG - R) gol('voce');
      else if (b.x > L - GOL_LARG + R) gol('cpu');
    }
  }

  /* computador: fica atrás da bola (do lado do próprio gol) e empurra para a direita; reage com um pouco de atraso e erra */
  function cpuPensar(C, b, dt) {
    if ((jogo.cpuPensa -= dt) <= 0) {
      jogo.cpuPensa = 0.2 + Math.random() * 0.25;
      var defendendo = b.x < 330 && b.vx < -80;
      jogo.cpuAlvo = defendendo ? Math.max(GOL_LARG + 10, b.x - 40) : b.x - 34 + (Math.random() - 0.5) * 30;
      if (b.x < C.x - 10) jogo.cpuAlvo = b.x - 40; /* a bola passou: volta para trás dela */
    }
    var dir = Math.abs(C.x - jogo.cpuAlvo) > 8 ? (C.x > jogo.cpuAlvo ? -1 : 1) : 0;
    C.olha = 1;
    mover(C, dir, dt, 195);
    var dx = b.x - C.x;
    if (C.chao && dx > -20 && dx < 70 && b.y < C.y - 90 && b.y > C.y - 220 && Math.random() < dt * 1.4) pular(C);
    if (dx > 0 && dx < 55 && b.y > C.y - 60 && Math.random() < dt * 2) chutar(C, 0.5 + Math.random() * 0.35);
  }

  function fimDeJogo() {
    jogo.rodando = false; jogo.fim = true; jogo.tempo = 0;
    var r = jogo.pv > jogo.pc ? 'Você venceu!' : jogo.pv < jogo.pc ? RIVAL + ' venceu.' : 'Empate!';
    recorde.jogos++; if (jogo.pv > jogo.pc) recorde.vitorias++;
    if (JB) JB.guardar('arena-futebol-1x1', recorde); atualizarPlacar();
    mostrarAviso('<b>' + r + '</b><span>Você ' + jogo.pv + ' x ' + jogo.pc + ' ' + RIVAL + '</span><button type="button" class="ft-btn">Jogar de novo</button>');
  }

  /* fundo parado (estádio, torcida, placas, gramado, linhas e gols), desenhado uma vez */
  function montarFundo() {
    var f = document.createElement('canvas'); f.width = L; f.height = A; var c = f.getContext('2d');
    var ceu = c.createLinearGradient(0, 0, 0, 60); ceu.addColorStop(0, '#05070f'); ceu.addColorStop(1, '#0b1020'); c.fillStyle = ceu; c.fillRect(0, 0, L, 60);
    ARTE.torcida(c, L, 26, CHAO - 152, ['#2563eb', '#1d4ed8', '#dc2626', '#b91c1c']);
    ARTE.refletores(c, L, 16);
    ARTE.placas(c, L, CHAO - 152, 22);
    var gy = CHAO - 130;
    for (var i = 0; i < 12; i++) { var g = c.createLinearGradient(0, gy, 0, A); g.addColorStop(0, i % 2 ? '#2b8a3e' : '#2f9e44'); g.addColorStop(1, i % 2 ? '#37b24d' : '#40c057'); c.fillStyle = g; c.fillRect(i * L / 12, gy, L / 12 + 1, A - gy); }
    var luz = c.createRadialGradient(L / 2, gy, 20, L / 2, gy + 60, 420); luz.addColorStop(0, 'rgba(255,255,230,.10)'); luz.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = luz; c.fillRect(0, gy, L, A - gy);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(0, gy + 6); c.lineTo(L, gy + 6); c.stroke();
    c.beginPath(); c.moveTo(L / 2, gy + 6); c.lineTo(L / 2, A); c.stroke();
    c.beginPath(); c.ellipse(L / 2, CHAO + 12, 90, 22, 0, 0, 7); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(L / 2, CHAO + 12, 4, 2, 0, 0, 7); c.fill();
    [[0, 1], [L, -1]].forEach(function (g2) { var x0 = g2[0], d = g2[1];
      c.beginPath(); c.moveTo(x0, gy + 30); c.lineTo(x0 + d * 150, gy + 30); c.lineTo(x0 + d * 175, A); c.stroke(); });
    /* gols com rede em perspectiva */
    [0, L - GOL_LARG].forEach(function (x0) {
      var esq = x0 === 0, fundoX = esq ? x0 : x0 + GOL_LARG, frenteX = esq ? x0 + GOL_LARG : x0, recuo = esq ? 10 : -10;
      c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(frenteX, TRAVE); c.lineTo(fundoX + recuo, TRAVE + 18); c.lineTo(fundoX + recuo, CHAO); c.lineTo(frenteX, CHAO); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1;
      for (var t = 0; t <= 1.001; t += 0.1) { var yy = TRAVE + (CHAO - TRAVE) * t; c.beginPath(); c.moveTo(frenteX, yy); c.lineTo(fundoX + recuo, TRAVE + 18 + (CHAO - TRAVE - 18) * t); c.stroke(); }
      for (var u = 0; u <= 1.001; u += 0.2) { var xx = frenteX + (fundoX + recuo - frenteX) * u; c.beginPath(); c.moveTo(xx, TRAVE + 18 * u); c.lineTo(xx, CHAO); c.stroke(); }
      c.fillStyle = '#f8fafc'; c.fillRect(Math.min(frenteX, fundoX), TRAVE - 5, GOL_LARG, 7);
      c.fillRect(esq ? frenteX - 5 : frenteX, TRAVE - 5, 6, GOL_ALT + 5);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(esq ? frenteX - 1 : frenteX + 4, TRAVE - 5, 2, GOL_ALT + 5);
    });
    return f;
  }
  var VISUAL = {
    voce: { pernas: 28, tronco: 26, cabeca: 28, pele: '#d9a27a', peleClara: '#f0c49e', cabelo: '#2b1a10', estilo: 'curto',
      kit: { camisa: '#3b82f6', camisaSombra: '#1d4ed8', calcao: '#f8fafc', meiao: '#1d4ed8', chuteira: '#111827', numero: '10', manga: true } },
    cpu: { pernas: 28, tronco: 26, cabeca: 28, pele: '#a8714a', peleClara: '#c98d63', cabelo: '#1a1a1a', estilo: 'moicano', bravo: true, barba: true,
      kit: { camisa: '#ef4444', camisaSombra: '#b91c1c', calcao: '#111827', meiao: '#ef4444', chuteira: '#f8fafc', numero: '9', manga: true } }
  };
  function desenhar() {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola, agora = performance.now();
    ctx.drawImage(fundo, 0, 0);
    [C, V, b].forEach(function (p) { ARTE.sombra(ctx, p.x, CHAO, CHAO - p.y); });
    [C, V].forEach(function (p) {
      var o = VISUAL[p.nome];
      o.fase = p.chao && p.vx ? agora / 75 : 0; o.noAr = !p.chao; o.chute = p.chute > 0.08;
      o.bracos = o.chute || !p.chao ? 'abertos' : ''; o.boca = jogo.texto && agora < jogo.textoAte ? 'grita' : '';
      ARTE.boneco(ctx, p, o);
    });
    /* bola de gomos girando */
    jogo.giro = (jogo.giro || 0) + b.vx / 900;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(jogo.giro);
    var gb = ctx.createRadialGradient(-4, -5, 2, 0, 0, R); gb.addColorStop(0, '#fff'); gb.addColorStop(1, '#cfd4da');
    ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
    ctx.fillStyle = '#1f2937'; ctx.beginPath();
    for (var i = 0; i < 5; i++) { var an = i * 1.2566 - 1.57; ctx.lineTo(Math.cos(an) * 5, Math.sin(an) * 5); } ctx.closePath(); ctx.fill();
    for (var j = 0; j < 5; j++) { var a2 = j * 1.2566 + 0.63; ctx.beginPath(); ctx.arc(Math.cos(a2) * 12, Math.sin(a2) * 12, 3.4, 0, 7); ctx.fill(); }
    ctx.restore();
    if (jogo.texto && agora < jogo.textoAte) {
      ctx.font = '700 52px "Bebas Neue", Inter, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(jogo.texto, L / 2, 120); ctx.fillStyle = '#fde047'; ctx.fillText(jogo.texto, L / 2, 120);
    }
  }

  function laco(t) {
    var dt = Math.min(0.033, (t - (ultimo || t)) / 1000); ultimo = t;
    if (jogo.rodando) { passo(dt); if (Math.floor(jogo.tempo * 4) !== jogo.ultimoTique) { jogo.ultimoTique = Math.floor(jogo.tempo * 4); atualizarPlacar(); } }
    desenhar();
    requestAnimationFrame(laco);
  }

  var MAPA = { ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir', ArrowUp: 'pulo', w: 'pulo', W: 'pulo', ' ': 'chute', j: 'chute', J: 'chute' };
  document.addEventListener('keydown', function (e) { var k = MAPA[e.key]; if (!k || !jogo.rodando) return; e.preventDefault(); tecla[k] = true; });
  document.addEventListener('keyup', function (e) { var k = MAPA[e.key]; if (k) tecla[k] = false; });
  [].forEach.call(caixa.querySelectorAll('.b1-botoes button'), function (bt) {
    var k = bt.getAttribute('data-k');
    bt.addEventListener('pointerdown', function (e) { e.preventDefault(); tecla[k] = true; bt.classList.add('ativo'); try { bt.setPointerCapture(e.pointerId); } catch (er) {} });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { bt.addEventListener(ev, function () { tecla[k] = false; bt.classList.remove('ativo'); }); });
    bt.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && jogo.rodando) { jogo.rodando = false; tecla = {}; mostrarAviso('<b>Pausado</b><button type="button" class="ft-btn">Continuar</button>'); } });

  novoJogo();
  requestAnimationFrame(laco);
})();
