/* Basquete 1x1 (basquete-1x1.html): você (azul) contra o computador (vermelho), 2 minutos, numa quadra com duas cestas.
   Você ataca a cesta da direita; o computador, a da esquerda. Segurar Arremessar pula e enche a barra de força:
   soltar na faixa verde acerta. Sem a bola, o mesmo botão tenta roubar (ou dar o toco, no ar).
   Teclado: setas ou A/D andam, W/seta para cima pula, espaço ou J arremessa. No celular, os botões embaixo da quadra. */
(function () {
  var caixa = document.getElementById('b1'), JB = window.JOGOS_BASE;
  if (!caixa) return;
  var L = 800, A = 450, CHAO = 392, G = 1500, ARO_Y = 196, TEMPO = 120;
  var CESTA = { voce: { x: 694, tabela: 728 }, cpu: { x: 106, tabela: 72 } }; /* a cesta que cada um ataca */
  var recorde = (JB && JB.ler('arena-basquete-1x1', null)) || { vitorias: 0, jogos: 0 };

  caixa.innerHTML =
    '<div class="b1-placar"><span class="b1-voce">Você <b id="b1-pv">0</b></span><span class="b1-relogio" id="b1-tempo">2:00</span><span class="b1-cpu"><b id="b1-pc">0</b> CPU</span></div>' +
    '<div class="b1-tela"><canvas id="b1-c" width="' + L + '" height="' + A + '"></canvas><div class="b1-aviso" id="b1-aviso"></div></div>' +
    '<div class="b1-botoes"><button type="button" data-k="esq" aria-label="Andar para a esquerda">◀</button><button type="button" data-k="dir" aria-label="Andar para a direita">▶</button>' +
    '<button type="button" data-k="pulo">Pular</button><button type="button" data-k="arr" class="b1-arr">Arremessar</button></div>' +
    '<p class="dq-nota b1-dica">No computador: setas (ou A/D) andam, ↑ ou W pula, espaço ou J arremessa. Segure o arremesso e solte quando a barra estiver no verde. Sem a bola, o mesmo botão rouba.</p>' +
    '<p class="dq-nota" id="b1-rec"></p>';
  var cv = document.getElementById('b1-c'), ctx = cv.getContext('2d'), aviso = document.getElementById('b1-aviso');

  /* torcida: bolinhas coloridas sorteadas uma vez */
  var torcida = [];
  for (var t = 0; t < 260; t++) torcida.push([Math.random() * L, 40 + Math.random() * 230, ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#e5e7eb', '#f472b6'][t % 7], 7 + Math.random() * 4]);

  var tecla = {}, jogo, ultimo = 0;
  function jogador(x, cor, nome) { return { x: x, y: CHAO, vx: 0, vy: 0, chao: true, cor: cor, nome: nome, olha: 1, rouboEspera: 0 }; }
  function novoJogo() {
    jogo = { voce: jogador(470, '#3b82f6', 'voce'), cpu: jogador(330, '#ef4444', 'cpu'), pv: 0, pc: 0, tempo: TEMPO, rodando: false, fim: false,
      bola: { x: 0, y: 0, vx: 0, vy: 0, dono: null, livre: true, chutador: null, tres: false, pontuou: false }, forca: 0, carregando: false, pausaAte: 0, cpuPlano: null };
    posse('voce');
    mostrarAviso('<b>Basquete 1x1</b><span>2 minutos contra o computador. Você ataca a cesta da direita.</span><button type="button" class="ft-btn" id="b1-comecar">Começar</button>');
    atualizarPlacar();
  }
  function posse(quem) {
    var b = jogo.bola;
    jogo.voce.x = quem === 'voce' ? 400 : 560; jogo.cpu.x = quem === 'cpu' ? 400 : 240;
    [jogo.voce, jogo.cpu].forEach(function (p) { p.y = CHAO; p.vx = p.vy = 0; p.chao = true; });
    b.dono = jogo[quem]; b.livre = false; b.chutador = null; b.pontuou = false;
    jogo.carregando = false; jogo.forca = 0; jogo.cpuPlano = null;
  }
  function mostrarAviso(html) {
    aviso.innerHTML = html; aviso.hidden = false;
    var bt = aviso.querySelector('button');
    if (bt) bt.addEventListener('click', function () { if (jogo.fim) novoJogo(); else { aviso.hidden = true; jogo.rodando = true; } }, { once: true });
  }
  function atualizarPlacar() {
    document.getElementById('b1-pv').textContent = jogo.pv; document.getElementById('b1-pc').textContent = jogo.pc;
    var s = Math.max(0, Math.ceil(jogo.tempo)); document.getElementById('b1-tempo').textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2);
    document.getElementById('b1-rec').textContent = recorde.jogos ? 'Neste aparelho: ' + recorde.vitorias + ' vitória' + (recorde.vitorias === 1 ? '' : 's') + ' em ' + recorde.jogos + ' jogo' + (recorde.jogos === 1 ? '' : 's') + '.' : '';
  }

  /* arremesso: calcula a velocidade exata até o aro e erra mais quanto mais longe da faixa verde (forca 0,5) */
  function arremessar(p, erro) {
    var b = jogo.bola, c = CESTA[p.nome], mao = maoDe(p);
    var dx = c.x - mao.x, dy = (ARO_Y - 6) - mao.y, T = 0.75 + Math.abs(dx) / 1100;
    var f = 1 + erro;
    b.x = mao.x; b.y = mao.y; b.vx = dx / T * f; b.vy = (dy - 0.5 * G * T * T) / T * (1 + erro * 0.6);
    b.dono = null; b.livre = false; b.chutador = p; b.pontuou = false; b.tres = Math.abs(c.x - p.x) > 250; jogo.cpuPlano = null;
    b.tocoCpu = p.nome === 'voce' && Math.random() < 0.18; /* o computador só consegue o toco em parte dos arremessos */
  }
  /* o computador erra cerca de metade dos arremessos (mais de longe) */
  function erroCpu(longe) {
    if (Math.random() < (longe ? 0.62 : 0.5)) return (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.06);
    return (Math.random() - 0.5) * 0.03;
  }
  function maoDe(p) { return { x: p.x + p.olha * 6, y: p.y - 92 }; }

  function pontuar(quem, pts) {
    jogo[quem === 'voce' ? 'pv' : 'pc'] += pts; atualizarPlacar();
    jogo.pausaAte = performance.now() + 900; jogo.proxima = quem === 'voce' ? 'cpu' : 'voce';
    jogo.texto = (pts === 3 ? 'CESTA DE 3!' : 'CESTA!'); jogo.textoAte = performance.now() + 900;
  }

  function mover(p, dir, dt) {
    var vel = p.dono ? 260 : 300;
    p.vx = dir * vel; if (dir) p.olha = dir;
    p.x = Math.max(30, Math.min(L - 30, p.x + p.vx * dt));
    if (!p.chao) { p.vy += G * dt; p.y += p.vy * dt; if (p.y >= CHAO) { p.y = CHAO; p.vy = 0; p.chao = true; } }
    if (p.rouboEspera > 0) p.rouboEspera -= dt;
  }
  function pular(p) { if (p.chao) { p.vy = -620; p.chao = false; } }
  function tentarRoubo(p, outro) {
    var b = jogo.bola;
    if (p.rouboEspera > 0) return; p.rouboEspera = 0.6;
    if (b.dono === outro && Math.abs(p.x - outro.x) < 52 && Math.random() < (p.nome === 'cpu' ? 0.2 : 0.4)) { b.dono = p; jogo.carregando = false; jogo.texto = p.nome === 'voce' ? 'ROUBOU!' : 'PERDEU A BOLA'; jogo.textoAte = performance.now() + 700; }
  }

  function passo(dt) {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola, agora = performance.now();
    if (jogo.pausaAte) { if (agora < jogo.pausaAte) { bolaPasso(dt, agora); return; } jogo.pausaAte = 0; posse(jogo.proxima); }
    jogo.tempo -= dt;
    if (jogo.tempo <= 0) { fimDeJogo(); return; }

    /* você */
    var dir = (tecla.dir ? 1 : 0) - (tecla.esq ? 1 : 0);
    mover(V, jogo.carregando ? 0 : dir, dt);
    if (tecla.pulo) pular(V);
    if (tecla.arr) {
      if (b.dono === V) { if (!jogo.carregando) { jogo.carregando = true; jogo.forca = 0; jogo.subindo = true; pular(V); } }
      else if (b.dono === C) tentarRoubo(V, C);
      else if (!b.dono && b.chutador === C && !V.chao && Math.hypot(b.x - V.x, b.y - (V.y - 96)) < 46 && b.vy < 250) { b.vx = -b.vx * 0.4 + 120; b.vy = -100; b.livre = true; b.chutador = null; jogo.texto = 'TOCO!'; jogo.textoAte = agora + 700; }
    }
    if (jogo.carregando) {
      jogo.forca += (jogo.subindo ? 1 : -1) * dt * 1.25;
      if (jogo.forca >= 1) { jogo.forca = 1; jogo.subindo = false; } if (jogo.forca <= 0) { jogo.forca = 0; jogo.subindo = true; }
      if (!tecla.arr) { jogo.carregando = false; arremessar(V, (jogo.forca - 0.5) * 0.36); }
    }

    /* computador */
    cpuPensar(C, V, b, dt);

    bolaPasso(dt, agora);
  }

  function bolaPasso(dt, agora) {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola;
    if (b.dono) {
      var p = b.dono;
      if (p === V && jogo.carregando || !p.chao) { var m = maoDe(p); b.x = m.x; b.y = m.y; }
      else { b.x = p.x + p.olha * 26; b.y = CHAO - 14 - Math.abs(Math.sin(agora / 140)) * 44; }
    } else {
      var ay = b.y;
      b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      [CESTA.voce, CESTA.cpu].forEach(function (c) {
        /* cesta: passou pelo aro de cima para baixo */
        if (!b.pontuou && ay < ARO_Y && b.y >= ARO_Y && Math.abs(b.x - c.x) < 19 && b.vy > 0) {
          b.pontuou = true; b.vx *= 0.2;
          var quem = c === CESTA.voce ? 'voce' : 'cpu';
          pontuar(quem, b.chutador && b.chutador.nome === quem && b.tres ? 3 : 2);
        }
        /* bordas do aro e tabela */
        [c.x - 23, c.x + 23].forEach(function (rx) {
          var dx = b.x - rx, dy = b.y - ARO_Y, d = Math.hypot(dx, dy);
          if (d < 11 && d > 0) { var nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.6 * vn * nx; b.vy -= 1.6 * vn * ny; } b.x = rx + nx * 11; b.y = ARO_Y + ny * 11; b.livre = true; }
        });
        if (b.y > ARO_Y - 80 && b.y < ARO_Y + 14 && Math.abs(b.x - c.tabela) < 9) { b.vx = -b.vx * 0.6; b.x = c.tabela + (c.tabela > 400 ? -9 : 9); b.livre = true; }
      });
      if (b.y > CHAO - 9) { b.y = CHAO - 9; b.vy = -Math.abs(b.vy) * 0.62; b.vx *= 0.85; b.livre = true; if (Math.abs(b.vy) < 60) b.vy = 0; }
      if (b.x < 9 || b.x > L - 9) { b.vx = -b.vx * 0.6; b.x = Math.max(9, Math.min(L - 9, b.x)); }
      /* pegar a bola solta (quem arremessou só pega depois que ela bater em algo) */
      if (!jogo.pausaAte) [V, C].forEach(function (p) {
        if (b.dono || Math.abs(b.x - p.x) > 32 || b.y < p.y - 120 || b.y > p.y + 5) return;
        if (b.livre || (b.chutador !== p && !p.chao)) { b.dono = p; b.chutador = null; } /* arremesso no ar: só pulando para pegar */
      });
    }
  }

  /* computador: com a bola, anda até um ponto e arremessa; sem ela, marca você e tenta roubar ou dar o toco */
  function cpuPensar(C, V, b, dt) {
    var dir = 0;
    if (b.dono === C) {
      if (!jogo.cpuPlano) jogo.cpuPlano = { x: 150 + Math.random() * 300, espera: 0.3 + Math.random() * 0.6 };
      var alvo = jogo.cpuPlano.x;
      if (Math.abs(C.x - V.x) < 50 && V.x < C.x && Math.random() < 0.02) alvo = C.x + 60; /* finta */
      if (Math.abs(C.x - alvo) > 8) dir = C.x > alvo ? -1 : 1;
      else if ((jogo.cpuPlano.espera -= dt) <= 0) {
        if (C.chao && !jogo.cpuPlano.pulou) { pular(C); jogo.cpuPlano.pulou = true; }
        else if (C.vy > -80 && jogo.cpuPlano.pulou) { C.olha = -1; arremessar(C, erroCpu(Math.abs(C.x - CESTA.cpu.x) > 250)); }
      }
    } else if (b.dono === V) {
      var marca = V.x - 46; dir = Math.abs(C.x - marca) > 10 ? (C.x > marca ? -1 : 1) : 0; C.olha = 1;
      if (Math.abs(C.x - V.x) < 50 && Math.random() < dt * 0.7) tentarRoubo(C, V);
      if (jogo.carregando && C.chao && Math.abs(C.x - V.x) < 70 && Math.random() < 0.06) pular(C);
    } else {
      dir = Math.abs(C.x - b.x) > 10 ? (C.x > b.x ? -1 : 1) : 0;
      if (b.chutador === V && !b.livre && C.chao && Math.abs(C.x - b.x) < 60 && b.y < CHAO - 160 && Math.random() < 0.04) pular(C);
      if (b.chutador === V && !C.chao && Math.hypot(b.x - C.x, b.y - (C.y - 96)) < 40 && b.tocoCpu) { b.vx = -b.vx * 0.4 - 120; b.vy = -100; b.livre = true; b.chutador = null; jogo.texto = 'TOCO DO CPU'; jogo.textoAte = performance.now() + 700; }
    }
    mover(C, dir, dt);
  }

  function fimDeJogo() {
    jogo.rodando = false; jogo.fim = true; jogo.tempo = 0; atualizarPlacar();
    var r = jogo.pv > jogo.pc ? 'Você venceu!' : jogo.pv < jogo.pc ? 'O computador venceu.' : 'Empate!';
    recorde.jogos++; if (jogo.pv > jogo.pc) recorde.vitorias++;
    if (JB) JB.guardar('arena-basquete-1x1', recorde); atualizarPlacar();
    mostrarAviso('<b>' + r + '</b><span>Você ' + jogo.pv + ' x ' + jogo.pc + ' CPU</span><button type="button" class="ft-btn">Jogar de novo</button>');
  }

  /* desenho */
  function desenhar() {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola;
    var g = ctx.createLinearGradient(0, 0, 0, A); g.addColorStop(0, '#120f3a'); g.addColorStop(0.62, '#2b1d6b'); ctx.fillStyle = g; ctx.fillRect(0, 0, L, A);
    torcida.forEach(function (p) { ctx.fillStyle = p[2]; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(p[0], p[1], p[3], 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#7a1d2b'; ctx.fillRect(0, CHAO - 112, L, 22);
    var piso = ctx.createLinearGradient(0, CHAO - 90, 0, A); piso.addColorStop(0, '#c9874a'); piso.addColorStop(1, '#8f5528'); ctx.fillStyle = piso; ctx.fillRect(0, CHAO - 90, L, A);
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(400, CHAO - 90); ctx.lineTo(400, A); ctx.stroke();
    [CESTA.voce.x - 250, CESTA.cpu.x + 250].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, CHAO - 20); ctx.lineTo(x, CHAO + 30); ctx.stroke(); });
    [CESTA.voce, CESTA.cpu].forEach(function (c) {
      var lado = c.tabela > 400 ? 1 : -1;
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(c.tabela + lado * 14 - 4, ARO_Y - 40, 8, CHAO - ARO_Y + 40);
      ctx.fillStyle = 'rgba(220,235,255,.85)'; ctx.fillRect(c.tabela - 4, ARO_Y - 86, 8, 100);
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(c.x - 23, ARO_Y); ctx.lineTo(c.tabela, ARO_Y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.5;
      for (var i = 0; i <= 4; i++) { var x0 = c.x - 23 + i * 11.5; ctx.beginPath(); ctx.moveTo(x0, ARO_Y); ctx.lineTo(c.x - 14 + i * 7, ARO_Y + 34); ctx.stroke(); }
    });
    [C, V].forEach(boneco);
    /* bola */
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3b1a06'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, 7); ctx.moveTo(b.x - 10, b.y); ctx.lineTo(b.x + 10, b.y); ctx.moveTo(b.x, b.y - 10); ctx.lineTo(b.x, b.y + 10); ctx.stroke();
    /* barra de força */
    if (jogo.carregando) {
      var bx = V.x - 40, by = V.y - 150;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(bx - 2, by - 2, 84, 14);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(bx + 80 * 0.42, by, 80 * 0.16, 10);
      ctx.fillStyle = '#fff'; ctx.fillRect(bx + 80 * jogo.forca - 2, by - 3, 4, 16);
    }
    if (jogo.texto && performance.now() < jogo.textoAte) {
      ctx.font = '700 40px "Bebas Neue", Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fde047'; ctx.fillText(jogo.texto, L / 2, 120);
    }
  }
  function boneco(p) {
    var x = p.x, y = p.y, perna = p.chao && p.vx ? Math.sin(performance.now() / 80) * 8 : 0;
    ctx.strokeStyle = '#3a2416'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 6, y - 34); ctx.lineTo(x - 8 + perna, y - 4); ctx.moveTo(x + 6, y - 34); ctx.lineTo(x + 8 - perna, y - 4); ctx.stroke();
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(x - 14, y - 6, 12, 6); ctx.fillRect(x + 2, y - 6, 12, 6);
    ctx.fillStyle = p.cor; ctx.fillRect(x - 15, y - 76, 30, 44);
    ctx.fillStyle = '#fff'; ctx.font = '700 15px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.nome === 'voce' ? '10' : '23', x, y - 49);
    var temBola = jogo.bola.dono === p, noAr = temBola && (!p.chao || (p.nome === 'voce' && jogo.carregando));
    ctx.strokeStyle = '#c68b5e'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x + p.olha * 12, y - 70);
    if (noAr) ctx.lineTo(x + p.olha * 6, y - 92); else if (temBola) ctx.lineTo(x + p.olha * 24, y - 44); else ctx.lineTo(x + p.olha * 18, y - 46);
    ctx.stroke();
    ctx.fillStyle = '#d9a27a'; ctx.beginPath(); ctx.arc(x, y - 98, 23, 0, 7); ctx.fill();
    ctx.fillStyle = p.nome === 'voce' ? '#2b1a10' : '#e7c26a'; ctx.beginPath(); ctx.arc(x, y - 104, 23, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + p.olha * 9, y - 98, 3, 0, 7); ctx.arc(x + p.olha * 1, y - 98, 3, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7c3f2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + p.olha * 5, y - 88, 5, 0.2, Math.PI - 0.2); ctx.stroke();
  }

  function laco(t) {
    var dt = Math.min(0.033, (t - (ultimo || t)) / 1000); ultimo = t;
    if (jogo.rodando) { passo(dt); if (Math.floor(jogo.tempo * 4) !== jogo.ultimoTique) { jogo.ultimoTique = Math.floor(jogo.tempo * 4); atualizarPlacar(); } }
    desenhar();
    requestAnimationFrame(laco);
  }

  /* controles */
  var MAPA = { ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir', ArrowUp: 'pulo', w: 'pulo', W: 'pulo', ' ': 'arr', j: 'arr', J: 'arr' };
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
