/* Futebol 1x1 (futebol-1x1.html): cabeção contra o computador, 2 minutos, um gol de cada lado.
   Você (azul) defende o gol da direita e ataca o da esquerda. Dá para cabecear, pular e chutar.
   Teclado: setas ou A/D andam, W/seta para cima pula, espaço ou J chuta. No celular, os botões embaixo do campo.
   Usa o mesmo visual e os mesmos botões do Basquete 1x1 (classes b1- em esportes-mais.css). */
(function () {
  var caixa = document.getElementById('f1x1'), JB = window.JOGOS_BASE;
  if (!caixa) return;
  var L = 800, A = 450, CHAO = 400, G = 1300, TEMPO = 120, GOL_ALT = 140, GOL_LARG = 62, R = 14;
  var TRAVE = CHAO - GOL_ALT;
  var recorde = (JB && JB.ler('arena-futebol-1x1', null)) || { vitorias: 0, jogos: 0 };

  caixa.innerHTML =
    '<div class="b1-placar"><span class="b1-voce">Você <b id="f1-pv">0</b></span><span class="b1-relogio" id="f1-tempo">2:00</span><span class="b1-cpu"><b id="f1-pc">0</b> CPU</span></div>' +
    '<div class="b1-tela"><canvas id="f1-c" width="' + L + '" height="' + A + '"></canvas><div class="b1-aviso" id="f1-aviso"></div></div>' +
    '<div class="b1-botoes"><button type="button" data-k="esq" aria-label="Andar para a esquerda">◀</button><button type="button" data-k="dir" aria-label="Andar para a direita">▶</button>' +
    '<button type="button" data-k="pulo">Pular</button><button type="button" data-k="chute" class="b1-arr">Chutar</button></div>' +
    '<p class="dq-nota b1-dica">No computador: setas (ou A/D) andam, ↑ ou W pula, espaço ou J chuta. Você defende o gol da direita e ataca o da esquerda. Pule para cabecear.</p>' +
    '<p class="dq-nota" id="f1-rec"></p>';
  var cv = document.getElementById('f1-c'), ctx = cv.getContext('2d'), aviso = document.getElementById('f1-aviso');

  var torcida = [];
  for (var t = 0; t < 240; t++) torcida.push([Math.random() * L, 30 + Math.random() * 200, ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#e5e7eb', '#f472b6'][t % 6], 7 + Math.random() * 4]);

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
    jogo.pausaAte = performance.now() + 1100; jogo.texto = quem === 'voce' ? 'GOOOL!' : 'GOL DO CPU'; jogo.textoAte = jogo.pausaAte;
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
      jogo.cpuPensa = 0.12 + Math.random() * 0.15;
      var defendendo = b.x < 330 && b.vx < -80;
      jogo.cpuAlvo = defendendo ? Math.max(GOL_LARG + 10, b.x - 40) : b.x - 34 + (Math.random() - 0.5) * 30;
      if (b.x < C.x - 10) jogo.cpuAlvo = b.x - 40; /* a bola passou: volta para trás dela */
    }
    var dir = Math.abs(C.x - jogo.cpuAlvo) > 8 ? (C.x > jogo.cpuAlvo ? -1 : 1) : 0;
    C.olha = 1;
    mover(C, dir, dt, 225);
    var dx = b.x - C.x;
    if (C.chao && dx > -20 && dx < 70 && b.y < C.y - 90 && b.y > C.y - 220 && Math.random() < dt * 2) pular(C);
    if (dx > 0 && dx < 55 && b.y > C.y - 60 && Math.random() < dt * 3) chutar(C, 0.6 + Math.random() * 0.35);
  }

  function fimDeJogo() {
    jogo.rodando = false; jogo.fim = true; jogo.tempo = 0;
    var r = jogo.pv > jogo.pc ? 'Você venceu!' : jogo.pv < jogo.pc ? 'O computador venceu.' : 'Empate!';
    recorde.jogos++; if (jogo.pv > jogo.pc) recorde.vitorias++;
    if (JB) JB.guardar('arena-futebol-1x1', recorde); atualizarPlacar();
    mostrarAviso('<b>' + r + '</b><span>Você ' + jogo.pv + ' x ' + jogo.pc + ' CPU</span><button type="button" class="ft-btn">Jogar de novo</button>');
  }

  function desenhar() {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola;
    var g = ctx.createLinearGradient(0, 0, 0, A); g.addColorStop(0, '#0c1630'); g.addColorStop(0.6, '#1b2a55'); ctx.fillStyle = g; ctx.fillRect(0, 0, L, A);
    torcida.forEach(function (p) { ctx.fillStyle = p[2]; ctx.globalAlpha = 0.33; ctx.beginPath(); ctx.arc(p[0], p[1], p[3], 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1d3b8a'; ctx.fillRect(0, CHAO - 150, L, 18);
    for (var i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#2f9e44' : '#37b24d'; ctx.fillRect(i * 80, CHAO - 132, 80, A); }
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(400, CHAO - 132); ctx.lineTo(400, A); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(400, CHAO + 8, 70, 16, 0, 0, 7); ctx.stroke();
    /* gols */
    [0, L - GOL_LARG].forEach(function (x0) {
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x0, TRAVE, GOL_LARG, GOL_ALT);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
      for (var y = TRAVE; y < CHAO; y += 14) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + GOL_LARG, y); ctx.stroke(); }
      for (var x = x0; x <= x0 + GOL_LARG; x += 14) { ctx.beginPath(); ctx.moveTo(x, TRAVE); ctx.lineTo(x, CHAO); ctx.stroke(); }
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(x0, TRAVE - 5, GOL_LARG, 8);
      var poste = x0 === 0 ? GOL_LARG - 4 : x0; ctx.fillRect(poste, TRAVE - 5, 5, GOL_ALT + 5);
    });
    [C, V].forEach(boneco);
    /* bola */
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, 7); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, 7); ctx.stroke();
    if (jogo.texto && performance.now() < jogo.textoAte) {
      ctx.font = '700 46px "Bebas Neue", Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fde047'; ctx.fillText(jogo.texto, L / 2, 110);
    }
  }
  function boneco(p) {
    var x = p.x, y = p.y, perna = p.chao && p.vx ? Math.sin(performance.now() / 70) * 7 : 0, chutando = p.chute > 0.08;
    ctx.strokeStyle = '#2b1a10'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 5, y - 28); ctx.lineTo(x - 7 + perna, y - 4);
    ctx.moveTo(x + 5, y - 28); if (chutando) ctx.lineTo(x + p.olha * 26, y - 16); else ctx.lineTo(x + 7 - perna, y - 4); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(chutando ? x + p.olha * 28 : x + 9 - perna, chutando ? y - 15 : y - 3, 8, 4, 0, 0, 7); ctx.ellipse(x - 7 + perna, y - 3, 8, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = p.cor; ctx.fillRect(x - 14, y - 58, 28, 32);
    ctx.fillStyle = '#fff'; ctx.font = '700 13px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.nome === 'voce' ? '10' : '9', x, y - 37);
    ctx.fillStyle = '#d9a27a'; ctx.beginPath(); ctx.arc(x, y - 64 - 8, 28, 0, 7); ctx.fill();
    ctx.fillStyle = p.nome === 'voce' ? '#2b1a10' : '#e7c26a'; ctx.beginPath(); ctx.arc(x, y - 78, 28, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + p.olha * 12, y - 72, 3.5, 0, 7); ctx.arc(x + p.olha * 2, y - 72, 3.5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7c3f2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + p.olha * 6, y - 60, 6, 0.2, Math.PI - 0.2); ctx.stroke();
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
