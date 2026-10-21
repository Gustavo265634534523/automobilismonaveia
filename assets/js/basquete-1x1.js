/* Basquete 1x1 (basquete-1x1.html): você (azul) contra o computador (vermelho), 2 minutos, numa quadra com duas cestas.
   Você ataca a cesta da direita; o computador, a da esquerda. Segurar Arremessar pula e enche a barra de força:
   soltar na faixa verde acerta. Sem a bola, o mesmo botão tenta roubar (ou dar o toco, no ar).
   Teclado: setas ou A/D andam, W/seta para cima pula, espaço ou J arremessa. No celular, os botões embaixo da quadra. */
(function () {
  var caixa = document.getElementById('b1'), JB = window.JOGOS_BASE;
  if (!caixa) return;
  var L = 800, A = 450, CHAO = 392, G = 1500, ARO_Y = 196, TEMPO = 120, RIVAL = 'Tonhão', ARTE = window.ARTE_1X1; /* o adversário do computador */
  var CESTA = { voce: { x: 694, tabela: 728 }, cpu: { x: 106, tabela: 72 } }; /* a cesta que cada um ataca */
  var recorde = (JB && JB.ler('arena-basquete-1x1', null)) || { vitorias: 0, jogos: 0 };

  caixa.innerHTML = ARTE.barraHTML() +
    '<div class="b1-placar"><span class="b1-voce">Você <b id="b1-pv">0</b></span><span class="b1-relogio" id="b1-tempo">2:00</span><span class="b1-cpu"><b id="b1-pc">0</b> ' + RIVAL + '</span></div>' +
    '<div class="b1-tela"><canvas id="b1-c" width="' + L + '" height="' + A + '"></canvas><div class="b1-aviso" id="b1-aviso"></div></div>' +
    ARTE.botoesHTML('Arremessar', 'Enterrada') +
    '<p class="dq-nota b1-dica">No computador: setas (ou A/D) andam, ↑ ou W pula, espaço ou J arremessa, K enterra (quando a barra Especial enche, perto da cesta). Segure o arremesso e solte quando a barra estiver no verde. Sem a bola, o mesmo botão rouba.</p>' +
    '<p class="dq-nota" id="b1-rec"></p>';
  var cv = document.getElementById('b1-c'), ctx = cv.getContext('2d'), aviso = document.getElementById('b1-aviso');

  var fundo = montarFundo();

  var tecla = {}, jogo, ultimo = 0;
  /* dificuldade do Tonhão: quanto erra (de perto e de longe), quanto rouba e dá toco, e quantas vezes tenta roubar */
  var DIFS = { facil: { erra: 0.68, erraLonge: 0.78, roubo: 0.12, toco: 0.08, tenta: 0.45 }, medio: { erra: 0.5, erraLonge: 0.62, roubo: 0.2, toco: 0.18, tenta: 0.7 }, dificil: { erra: 0.33, erraLonge: 0.45, roubo: 0.32, toco: 0.3, tenta: 1.1 } };
  function dif() { return DIFS[ARTE.dificuldade()] || DIFS.medio; }
  function jogador(x, cor, nome) { return { x: x, y: CHAO, vx: 0, vy: 0, chao: true, cor: cor, nome: nome, olha: 1, rouboEspera: 0 }; }
  function novoJogo() {
    jogo = { voce: jogador(470, '#3b82f6', 'voce'), cpu: jogador(330, '#ef4444', 'cpu'), pv: 0, pc: 0, tempo: TEMPO, rodando: false, fim: false,
      bola: { x: 0, y: 0, vx: 0, vy: 0, dono: null, livre: true, chutador: null, tres: false, pontuou: false }, forca: 0, carregando: false, pausaAte: 0, cpuPlano: null, esp: 0, enterrada: null };
    posse('voce');
    mostrarAviso('<b>Basquete 1x1</b><span>2 minutos contra o computador. Você ataca a cesta da direita.</span><button type="button" class="ft-btn" id="b1-comecar">Começar</button>');
    atualizarPlacar();
  }
  function posse(quem) {
    var b = jogo.bola;
    jogo.voce.x = quem === 'voce' ? 400 : 560; jogo.cpu.x = quem === 'cpu' ? 400 : 240;
    [jogo.voce, jogo.cpu].forEach(function (p) { p.y = CHAO; p.vx = p.vy = 0; p.chao = true; });
    b.dono = jogo[quem]; b.livre = false; b.chutador = null; b.pontuou = false;
    jogo.carregando = false; jogo.forca = 0; jogo.cpuPlano = null; jogo.enterrada = null;
  }
  function mostrarAviso(html) {
    aviso.innerHTML = html; aviso.hidden = false;
    var bt = aviso.querySelector('button');
    if (bt) bt.addEventListener('click', function () { ARTE.iniciarSom(); ARTE.pausarSom(false); if (jogo.fim) novoJogo(); else { aviso.hidden = true; jogo.rodando = true; ARTE.som('buzina'); } }, { once: true });
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
    b.tocoCpu = p.nome === 'voce' && Math.random() < dif().toco; /* o computador só consegue o toco em parte dos arremessos */
  }
  /* o computador erra cerca de metade dos arremessos (mais de longe) */
  function erroCpu(longe) {
    if (Math.random() < (longe ? dif().erraLonge : dif().erra)) return (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.06);
    return (Math.random() - 0.5) * 0.03;
  }
  function maoDe(p) { return { x: p.x + p.olha * 6, y: p.y - 116 }; }

  function pontuar(quem, pts) {
    jogo[quem === 'voce' ? 'pv' : 'pc'] += pts; atualizarPlacar();
    jogo.pausaAte = performance.now() + 900; jogo.proxima = quem === 'voce' ? 'cpu' : 'voce';
    jogo.texto = jogo.texto === 'ENTERRADA!' && performance.now() < jogo.textoAte ? 'ENTERRADA!' : pts === 3 ? 'CESTA DE 3!' : 'CESTA!'; jogo.textoAte = performance.now() + 900;
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
    if (b.dono === outro && Math.abs(p.x - outro.x) < 52 && Math.random() < (p.nome === 'cpu' ? dif().roubo : 0.4)) { ARTE.som('roubo'); b.dono = p; jogo.carregando = false; jogo.texto = p.nome === 'voce' ? 'ROUBOU!' : 'PERDEU A BOLA'; jogo.textoAte = performance.now() + 700; }
  }

  function passo(dt) {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola, agora = performance.now();
    if (jogo.pausaAte) { if (agora < jogo.pausaAte) { bolaPasso(dt, agora); return; } jogo.pausaAte = 0; posse(jogo.proxima); }
    jogo.tempo -= dt;
    if (jogo.tempo <= 0) { fimDeJogo(); return; }

    /* especial: a barra enche em 15 s; com a bola e perto da cesta, voa e enterra */
    jogo.esp = Math.min(1, jogo.esp + dt / 15);
    if (tecla.esp && jogo.esp >= 1 && !jogo.enterrada) {
      if (b.dono === V && V.x > CESTA.voce.x - 200) {
        jogo.enterrada = { t: 0, x0: V.x, y0: V.y }; jogo.esp = 0; jogo.carregando = false; V.olha = 1;
        jogo.texto = 'ENTERRADA!'; jogo.textoAte = agora + 1500; ARTE.som('especial');
      } else if (!jogo.dicaAte || agora > jogo.dicaAte) { jogo.texto = b.dono === V ? 'Chegue perto da cesta' : 'Pegue a bola'; jogo.textoAte = jogo.dicaAte = agora + 800; }
    }
    if (jogo.enterrada) {
      var e = jogo.enterrada, k = Math.min(1, (e.t += dt) / 0.55), tx = CESTA.voce.x - 14, ty = ARO_Y + 112;
      V.x = e.x0 + (tx - e.x0) * k; V.y = e.y0 + (ty - e.y0) * k - Math.sin(k * Math.PI) * 50; V.chao = false; V.vy = 0; V.vx = 0;
      if (k >= 1) { jogo.enterrada = null; b.dono = null; b.x = CESTA.voce.x; b.y = ARO_Y - 8; b.vx = 0; b.vy = 280; b.chutador = V; b.tres = false; b.livre = false; b.pontuou = false; b.tocoCpu = false; }
      cpuPensar(C, V, b, dt); bolaPasso(dt, agora); return;
    }

    /* você */
    var dir = (tecla.dir ? 1 : 0) - (tecla.esq ? 1 : 0);
    mover(V, jogo.carregando ? 0 : dir, dt);
    if (tecla.pulo) pular(V);
    if (tecla.arr) {
      if (b.dono === V) { if (!jogo.carregando) { jogo.carregando = true; jogo.forca = 0; jogo.subindo = true; pular(V); } }
      else if (b.dono === C) tentarRoubo(V, C);
      else if (!b.dono && b.chutador === C && !V.chao && Math.hypot(b.x - V.x, b.y - (V.y - 96)) < 46 && b.vy < 250) { b.vx = -b.vx * 0.4 + 120; b.vy = -100; b.livre = true; b.chutador = null; ARTE.som('toco'); jogo.texto = 'TOCO!'; jogo.textoAte = agora + 700; }
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
      else { b.x = p.x + p.olha * 26; b.y = CHAO - 14 - Math.abs(Math.sin(agora / 140)) * 44; var q = Math.floor(agora / (140 * Math.PI)); if (q !== jogo.quique) { jogo.quique = q; ARTE.som('quique'); } }
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
          if (d < 11 && d > 0) { var nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny; if (vn < -80) ARTE.som('aro'); if (vn < 0) { b.vx -= 1.6 * vn * nx; b.vy -= 1.6 * vn * ny; } b.x = rx + nx * 11; b.y = ARO_Y + ny * 11; b.livre = true; }
        });
        if (b.y > ARO_Y - 80 && b.y < ARO_Y + 14 && Math.abs(b.x - c.tabela) < 9) { b.vx = -b.vx * 0.6; b.x = c.tabela + (c.tabela > 400 ? -9 : 9); b.livre = true; }
      });
      if (b.y > CHAO - 9) { if (b.vy > 200) ARTE.som('quique'); b.y = CHAO - 9; b.vy = -Math.abs(b.vy) * 0.62; b.vx *= 0.85; b.livre = true; if (Math.abs(b.vy) < 60) b.vy = 0; }
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
      if (Math.abs(C.x - V.x) < 50 && Math.random() < dt * dif().tenta) tentarRoubo(C, V);
      if (jogo.carregando && C.chao && Math.abs(C.x - V.x) < 70 && Math.random() < 0.06) pular(C);
    } else {
      dir = Math.abs(C.x - b.x) > 10 ? (C.x > b.x ? -1 : 1) : 0;
      if (b.chutador === V && !b.livre && C.chao && Math.abs(C.x - b.x) < 60 && b.y < CHAO - 160 && Math.random() < 0.04) pular(C);
      if (b.chutador === V && !C.chao && Math.hypot(b.x - C.x, b.y - (C.y - 96)) < 40 && b.tocoCpu) { b.vx = -b.vx * 0.4 - 120; b.vy = -100; b.livre = true; b.chutador = null; ARTE.som('toco'); jogo.texto = 'TOCO DO ' + RIVAL.toUpperCase(); jogo.textoAte = performance.now() + 700; }
    }
    mover(C, dir, dt);
  }

  function fimDeJogo() {
    jogo.rodando = false; jogo.fim = true; jogo.tempo = 0; atualizarPlacar(); ARTE.som('buzina');
    var r = jogo.pv > jogo.pc ? 'Você venceu!' : jogo.pv < jogo.pc ? RIVAL + ' venceu.' : 'Empate!';
    recorde.jogos++; if (jogo.pv > jogo.pc) recorde.vitorias++;
    if (JB) JB.guardar('arena-basquete-1x1', recorde); atualizarPlacar();
    mostrarAviso('<b>' + r + '</b><span>Você ' + jogo.pv + ' x ' + jogo.pc + ' ' + RIVAL + '</span><button type="button" class="ft-btn">Jogar de novo</button>');
  }

  /* desenho */
  /* fundo parado (ginásio, torcida, faixa, quadra de madeira e tabelas), desenhado uma vez */
  function montarFundo() {
    var f = document.createElement('canvas'); f.width = L; f.height = A; var c = f.getContext('2d');
    c.fillStyle = '#05070f'; c.fillRect(0, 0, L, 40);
    ARTE.torcida(c, L, 22, CHAO - 112, ['#7c3aed', '#f59e0b', '#2563eb', '#dc2626']);
    ARTE.refletores(c, L, 12);
    ARTE.placas(c, L, CHAO - 112, 20);
    var py = CHAO - 92;
    var piso = c.createLinearGradient(0, py, 0, A); piso.addColorStop(0, '#b97a45'); piso.addColorStop(1, '#d8a066'); c.fillStyle = piso; c.fillRect(0, py, L, A - py);
    for (var x = 0; x < L; x += 26) { c.fillStyle = 'rgba(90,45,15,' + (0.05 + Math.random() * 0.08).toFixed(2) + ')'; c.fillRect(x, py, 25, A - py); c.fillStyle = 'rgba(60,30,10,.25)'; c.fillRect(x + 25, py, 1, A - py); }
    var brilho = c.createLinearGradient(0, py, 0, A); brilho.addColorStop(0, 'rgba(255,255,255,.18)'); brilho.addColorStop(0.4, 'rgba(255,255,255,0)'); c.fillStyle = brilho; c.fillRect(0, py, L, A - py);
    /* garrafão pintado, linha de 3 e círculo central */
    [[CESTA.cpu.x, 1], [CESTA.voce.x, -1]].forEach(function (k) {
      var x0 = k[1] > 0 ? 0 : L;
      c.fillStyle = 'rgba(37,99,235,.55)'; c.beginPath(); c.moveTo(x0, py + 10); c.lineTo(x0 + k[1] * 175, py + 10); c.lineTo(x0 + k[1] * 200, A); c.lineTo(x0, A); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2.5; c.stroke();
      c.beginPath(); c.ellipse(x0, (py + 12 + A) / 2, Math.abs(k[0] - x0) + 250, (A - py - 12) / 2, 0, k[1] > 0 ? -Math.PI / 2 : Math.PI / 2, k[1] > 0 ? Math.PI / 2 : Math.PI * 1.5); c.stroke();
    });
    c.beginPath(); c.moveTo(L / 2, py + 10); c.lineTo(L / 2, A); c.stroke();
    c.beginPath(); c.ellipse(L / 2, CHAO + 8, 70, 18, 0, 0, 7); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.12)'; c.font = '800 28px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('ARENA', L / 2, A - 12);
    /* tabelas: poste com proteção, vidro e quadrado */
    [CESTA.voce, CESTA.cpu].forEach(function (k) {
      var lado = k.tabela > 400 ? 1 : -1, px = k.tabela + lado * 22;
      c.fillStyle = '#1f2937'; c.fillRect(px - 5, ARO_Y - 50, 10, CHAO - ARO_Y + 50);
      c.fillStyle = '#1d4ed8'; ARTE.rr(c, px - 9, CHAO - 120, 18, 120, 5); c.fill();
      c.fillStyle = '#374151'; c.fillRect(Math.min(px, k.tabela), ARO_Y - 46, Math.abs(px - k.tabela), 6);
      c.fillStyle = 'rgba(200,225,255,.35)'; c.fillRect(k.tabela - 5, ARO_Y - 92, 10, 108);
      c.strokeStyle = '#f8fafc'; c.lineWidth = 2; c.strokeRect(k.tabela - 5, ARO_Y - 92, 10, 108);
      c.strokeStyle = '#ef4444'; c.strokeRect(k.tabela - 5, ARO_Y - 34, 10, 28);
    });
    return f;
  }
  /* aro e rede por cima da bola, para ela passar "dentro" da cesta */
  function aro(k) {
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.5;
    for (var i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(k.x - 23 + i * 9.2, ARO_Y); ctx.lineTo(k.x - 13 + i * 5.2, ARO_Y + 36); ctx.stroke(); }
    for (var j = 1; j <= 3; j++) { var w = 23 - j * 3.3; ctx.beginPath(); ctx.moveTo(k.x - w, ARO_Y + j * 11); ctx.lineTo(k.x + w, ARO_Y + j * 11); ctx.stroke(); }
    ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(k.x - 24, ARO_Y); ctx.lineTo(k.tabela, ARO_Y); ctx.stroke();
    ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(k.x - 24, ARO_Y - 1.5); ctx.lineTo(k.tabela, ARO_Y - 1.5); ctx.stroke();
  }
  var VISUAL = {
    voce: { pernas: 36, tronco: 36, cabeca: 24, pele: '#d9a27a', peleClara: '#f0c49e', cabelo: '#2b1a10', estilo: 'curto',
      kit: { camisa: '#3b82f6', camisaSombra: '#1d4ed8', calcao: '#3b82f6', meiao: '#f8fafc', chuteira: '#f8fafc', numero: '10', manga: false } },
    cpu: { pernas: 36, tronco: 36, cabeca: 24, pele: '#8d5524', peleClara: '#b0703c', cabelo: '#111', estilo: 'black', bravo: true,
      kit: { camisa: '#ef4444', camisaSombra: '#b91c1c', calcao: '#ef4444', meiao: '#111827', chuteira: '#111827', numero: '23', manga: false } }
  };
  /* barra do especial no canto da quadra; pisca quando está cheia */
  function barraEspecial(v, agora) {
    var cheio = v >= 1, x = 14, y = 12;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ARTE.rr(ctx, x, y, 150, 16, 8); ctx.fill();
    ctx.fillStyle = cheio ? (Math.floor(agora / 250) % 2 ? '#f97316' : '#fde047') : '#f97316'; ARTE.rr(ctx, x + 2, y + 2, 146 * v, 12, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 10px Inter, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(cheio ? 'ENTERRADA PRONTA!' : 'ESPECIAL', x + 8, y + 12);
    var bt = caixa.querySelector('.b1-esp'); if (bt && bt.classList.contains('pronto') !== cheio) bt.classList.toggle('pronto', cheio);
  }
  function desenhar() {
    var V = jogo.voce, C = jogo.cpu, b = jogo.bola, agora = performance.now();
    ctx.drawImage(fundo, 0, 0);
    [C, V, b].forEach(function (p) { ARTE.sombra(ctx, p.x, CHAO, CHAO - p.y); });
    [C, V].forEach(function (p) {
      var o = VISUAL[p.nome], temBola = b.dono === p;
      o.fase = p.chao && p.vx ? agora / 80 : 0; o.noAr = !p.chao;
      o.bracos = temBola && (!p.chao || (p === V && jogo.carregando)) ? 'cima' : temBola ? 'drible' : !p.chao ? 'cima' : '';
      o.boca = jogo.texto && agora < jogo.textoAte ? 'grita' : '';
      ARTE.boneco(ctx, p, o);
    });
    /* bola com gomos e brilho */
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate((b.dono ? 0 : b.x / 30));
    var gb = ctx.createRadialGradient(-3, -4, 1, 0, 0, 11); gb.addColorStop(0, '#fdba74'); gb.addColorStop(1, '#c2410c');
    ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(0, 0, 10.5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3b1a06'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-10.5, 0); ctx.lineTo(10.5, 0); ctx.moveTo(0, -10.5); ctx.lineTo(0, 10.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(-14, 0, 10, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(14, 0, 10, Math.PI - 0.8, Math.PI + 0.8); ctx.stroke();
    ctx.restore();
    aro(CESTA.voce); aro(CESTA.cpu);
    barraEspecial(jogo.esp, agora);
    /* barra de força */
    if (jogo.carregando) {
      var bx = V.x - 40, by = V.y - 160;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ARTE.rr(ctx, bx - 3, by - 3, 86, 16, 5); ctx.fill();
      ctx.fillStyle = '#22c55e'; ctx.fillRect(bx + 80 * 0.42, by, 80 * 0.16, 10);
      ctx.fillStyle = '#fff'; ctx.fillRect(bx + 80 * jogo.forca - 2, by - 3, 4, 16);
    }
    if (jogo.texto && agora < jogo.textoAte) {
      ctx.font = '700 46px "Bebas Neue", Inter, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(jogo.texto, L / 2, 110); ctx.fillStyle = '#fde047'; ctx.fillText(jogo.texto, L / 2, 110);
    }
  }

  function laco(t) {
    var dt = Math.min(0.033, (t - (ultimo || t)) / 1000); ultimo = t;
    if (jogo.rodando) { passo(dt); if (Math.floor(jogo.tempo * 4) !== jogo.ultimoTique) { jogo.ultimoTique = Math.floor(jogo.tempo * 4); atualizarPlacar(); } }
    desenhar();
    requestAnimationFrame(laco);
  }

  /* controles */
  var MAPA = { ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir', ArrowUp: 'pulo', w: 'pulo', W: 'pulo', ' ': 'arr', j: 'arr', J: 'arr', k: 'esp', K: 'esp' };
  document.addEventListener('keydown', function (e) { var k = MAPA[e.key]; if (!k || !jogo.rodando) return; e.preventDefault(); tecla[k] = true; });
  document.addEventListener('keyup', function (e) { var k = MAPA[e.key]; if (k) tecla[k] = false; });
  ARTE.ligarUI(caixa, tecla);
  document.addEventListener('visibilitychange', function () { if (document.hidden && jogo.rodando) { jogo.rodando = false; Object.keys(tecla).forEach(function (k) { tecla[k] = false; }); ARTE.pausarSom(true); mostrarAviso('<b>Pausado</b><button type="button" class="ft-btn">Continuar</button>'); } });

  novoJogo();
  requestAnimationFrame(laco);
})();
