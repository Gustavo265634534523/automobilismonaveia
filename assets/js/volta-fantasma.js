/* Volta fantasma: as duas voltas da telemetria andando juntas na pista, como se largassem lado a lado.
   Desenha num canvas (para assistir no site) e grava um vídeo em pé, 1080x1920, para Reels, TikTok e Shorts (MediaRecorder).
   Os carros andam pela distância de cada um (a velocidade somada no tempo, de telemetria-graf.js) em cima do traçado do mapa,
   então a distância entre eles na tela é a diferença de verdade naquele ponto da volta. */
(function () {
  var T = window.TELEMETRIA;
  if (!T) return;
  var COR = ['#e3343c', '#4fa3ff'], INTRO = 1.6, FIM = 3.5;
  var VERT = { w: 1080, h: 1920 }, HORIZ = { w: 1778, h: 1000 };
  var esc = window.esc || function (s) { return String(s); };

  function virg(n, c) { return n.toFixed(c).replace('.', ','); }

  /* ---------- dados ---------- */
  function preparar(o) {
    var r = o.r, escB = o.B.total / r.total, pts = r.mapa, n = pts.length;
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var box = { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
    function leitor(V, e) {
      return function (t) {
        var tt = Math.max(0, Math.min(t, V.dur));
        return { d: T.interp(V.t, V.d, tt) / e, v: T.interp(V.t, V.v, tt), g: Math.round(T.interp(V.t, V.g, tt)),
          a: T.interp(V.t, V.a, tt), f: T.interp(V.t, V.f, tt) > 50, tempo: tt, acabou: t >= V.dur };
      };
    }
    var dm = Math.max(0.05, Math.max.apply(null, r.delta.map(Math.abs)));
    return {
      r: r, box: box, n: n, dm: dm, nomes: o.nomes, titulo: o.titulo || '', sub: o.sub || '',
      dur: Math.max(o.A.dur, o.B.dur), carros: [leitor(o.A, 1), leitor(o.B, escB)], tempos: [o.A.dur, o.B.dur],
      pos: function (d) {
        var f = Math.max(0, Math.min(n - 1, d / r.passo)), i = Math.floor(f), k = f - i, p = pts[i], q = pts[Math.min(n - 1, i + 1)];
        return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
      },
      /* diferença em segundos onde o carro A está (positivo: A na frente) */
      gap: function (t, dA) { return t >= this.dur ? this.tempos[1] - this.tempos[0] : T.interp(r.dist, r.delta, dA); }
    };
  }

  /* ---------- desenho (coordenadas virtuais: 1080x1920 em pé ou 1778x1000 deitado) ---------- */
  function fonte(ctx, tam, peso, fam) { ctx.font = (peso || 700) + ' ' + tam + 'px ' + (fam === 'exo' ? '"Exo 2", "Arial Black", sans-serif' : 'Inter, Arial, sans-serif'); }
  function txt(ctx, s, x, y, tam, peso, cor, alin, fam) {
    fonte(ctx, tam, peso, fam); ctx.fillStyle = cor; ctx.textAlign = alin || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
    return ctx.measureText(s).width;
  }
  function caixa(ctx, x, y, w, h, raio, cor) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, raio); else ctx.rect(x, y, w, h);
    ctx.fillStyle = cor; ctx.fill();
  }

  function marca(ctx, x, y, tam, alin) {
    fonte(ctx, tam, 800, 'exo');
    var w1 = ctx.measureText('AUTOMOBILISMO ').width, w2 = ctx.measureText('NA VEIA').width, x0 = alin === 'center' ? x - (w1 + w2) / 2 : x;
    txt(ctx, 'AUTOMOBILISMO ', x0, y, tam, 800, '#f1f3f5', 'left', 'exo');
    txt(ctx, 'NA VEIA', x0 + w1, y, tam, 800, '#e3343c', 'left', 'exo');
  }

  function mapa(ctx, P, est, bx, by, larg, alt) {
    var lado = Math.max(larg, alt), b = P.box, pad = Math.min(larg, alt) * 0.06, w = b.x1 - b.x0, h = b.y1 - b.y0;
    var e = Math.min((larg - 2 * pad) / w, (alt - 2 * pad) / h);
    var ox = bx + pad + (larg - 2 * pad - w * e) / 2, oy = by + pad + (alt - 2 * pad - h * e) / 2;
    function tela(p) { return [ox + (p[0] - b.x0) * e, oy + (b.y1 - p[1]) * e]; }
    function trecho(d0, d1) {
      ctx.beginPath();
      var passo = P.r.passo, primeiro = true;
      for (var d = d0; ; d += passo) {
        var q = tela(P.pos(Math.min(d, d1)));
        if (primeiro) { ctx.moveTo(q[0], q[1]); primeiro = false; } else ctx.lineTo(q[0], q[1]);
        if (d >= d1) break;
      }
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    /* pista */
    trecho(0, P.r.total); ctx.closePath();
    ctx.strokeStyle = '#2b3038'; ctx.lineWidth = lado * 0.032; ctx.stroke();
    ctx.strokeStyle = '#3b424c'; ctx.lineWidth = lado * 0.012; ctx.stroke();
    /* largada */
    var l = tela(P.pos(0));
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(l[0], l[1], lado * 0.011, 0, 7); ctx.fill();
    /* rastro dos últimos ~200 m e o carro; o que está na frente fica por cima */
    var ordem = est.lider === 0 ? [1, 0] : [0, 1], perto = false;
    var pa = tela(P.pos(est.c[0].d)), pb = tela(P.pos(est.c[1].d));
    perto = Math.abs(pa[0] - pb[0]) + Math.abs(pa[1] - pb[1]) < lado * 0.09;
    ordem.forEach(function (i) {
      var d = est.c[i].d;
      if (d > 1) {
        trecho(Math.max(0, d - 200), d);
        ctx.strokeStyle = COR[i]; ctx.globalAlpha = 0.55; ctx.lineWidth = lado * 0.018; ctx.stroke(); ctx.globalAlpha = 1;
      }
    });
    ordem.forEach(function (i) {
      var q = i === 0 ? pa : pb, rr = lado * 0.021;
      ctx.beginPath(); ctx.arc(q[0], q[1], rr, 0, 7); ctx.fillStyle = COR[i]; ctx.fill();
      ctx.lineWidth = rr * 0.28; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      /* nome do piloto: quando os dois estão juntos, um em cima e o outro embaixo */
      var tam = lado * 0.03, dy = perto && i === 1 ? rr + tam * 1.55 : -(rr + tam * 0.75);
      fonte(ctx, tam, 800); var w = ctx.measureText(P.nomes[i]).width + tam * 0.8;
      caixa(ctx, q[0] - w / 2, q[1] + dy - tam * 1.05, w, tam * 1.4, tam * 0.3, COR[i]);
      txt(ctx, P.nomes[i], q[0], q[1] + dy, tam, 800, '#ffffff', 'center');
    });
    return { x: bx, y: by, w: larg, h: alt };
  }

  function cartao(ctx, P, est, i, x, y, w, h) {
    var c = est.c[i], s = h / 260;
    caixa(ctx, x, y, w, h, 18 * s, 'rgba(255,255,255,0.05)');
    caixa(ctx, x, y, 8 * s, h, 4 * s, COR[i]);
    var px = x + 30 * s;
    txt(ctx, P.nomes[i], px, y + 66 * s, 58 * s, 800, COR[i], 'left', 'exo');
    txt(ctx, T.fmtTempo(c.acabou ? P.tempos[i] : c.tempo), x + w - 24 * s, y + 62 * s, 40 * s, 700, c.acabou ? '#ffffff' : '#c3c8cd', 'right');
    var wv = txt(ctx, String(Math.round(c.v)), px, y + 156 * s, 78 * s, 800, '#ffffff', 'left', 'exo');
    txt(ctx, 'km/h', px + wv + 10 * s, y + 156 * s, 28 * s, 700, '#8e979f');
    txt(ctx, (c.g || '–') + 'ª', x + w - 24 * s, y + 156 * s, 60 * s, 800, '#ffffff', 'right', 'exo');
    /* acelerador e freio */
    var bw = w - 54 * s - 120 * s, by = y + 196 * s;
    txt(ctx, 'ACELERADOR', px, by - 8 * s, 18 * s, 800, '#8e979f');
    caixa(ctx, px, by, bw, 18 * s, 9 * s, '#2b3038');
    caixa(ctx, px, by, Math.max(0, bw * Math.min(100, c.a) / 100), 18 * s, 9 * s, '#3ddc84');
    var fx = px + bw + 20 * s;
    txt(ctx, 'FREIO', fx, by - 8 * s, 18 * s, 800, '#8e979f');
    caixa(ctx, fx, by, 100 * s, 18 * s, 9 * s, c.f ? '#ff3b30' : '#2b3038');
  }

  function grafico(ctx, P, est, x, y, w, h) {
    var r = P.r, n = r.dist.length, ate = Math.min(n - 1, Math.floor(est.c[0].d / r.passo)), meio = y + h / 2;
    ctx.strokeStyle = '#3b424c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, meio); ctx.lineTo(x + w, meio); ctx.stroke();
    var tl = Math.min(22, Math.max(14, h * 0.13));
    if (h >= 100) {
      txt(ctx, '▲ ' + P.nomes[0] + ' na frente', x, y + tl, tl, 800, COR[0]);
      txt(ctx, '▼ ' + P.nomes[1] + ' na frente', x, y + h - 4, tl, 800, COR[1]);
    }
    ctx.lineWidth = Math.min(7, Math.max(3, h * 0.045)); ctx.lineJoin = 'round';
    function ponto(i) { return [x + w * r.dist[i] / r.total, meio - r.delta[i] / P.dm * (h / 2) * 0.92]; }
    for (var i = 1; i <= ate; i += 2) {
      var a = ponto(i - 1), b = ponto(Math.min(i + 1, ate));
      ctx.strokeStyle = r.delta[i] >= 0 ? COR[0] : COR[1];
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
  }

  function quadroFinal(ctx, P, m) {
    var s = Math.min(m.w, 1000) / 1000, x = m.x + m.w * 0.08, w = m.w * 0.84, h = 440 * s, y = m.y + (m.h - h) / 2;
    caixa(ctx, x, y, w, h, 26 * s, 'rgba(11,12,14,0.9)');
    var dif = P.tempos[1] - P.tempos[0], q = dif >= 0 ? 0 : 1;
    txt(ctx, 'RESULTADO', x + w / 2, y + 80 * s, 30 * s, 800, '#e3343c', 'center');
    txt(ctx, P.nomes[0] + '  ' + T.fmtTempo(P.tempos[0]), x + w / 2, y + 170 * s, 66 * s, 800, COR[0], 'center', 'exo');
    txt(ctx, P.nomes[1] + '  ' + T.fmtTempo(P.tempos[1]), x + w / 2, y + 260 * s, 66 * s, 800, COR[1], 'center', 'exo');
    txt(ctx, P.nomes[q] + ' mais rápido por ' + virg(Math.abs(dif), 3) + 's', x + w / 2, y + 350 * s, 40 * s, 700, '#ffffff', 'center');
  }
  function quadroIntro(ctx, P, m, alfa) {
    var s = Math.min(m.w, 1000) / 1000, w = m.w * 0.84, h = 300 * s, x = m.x + m.w * 0.08, y = m.y + (m.h - h) / 2;
    ctx.globalAlpha = alfa;
    caixa(ctx, x, y, w, h, 26 * s, 'rgba(11,12,14,0.9)');
    txt(ctx, P.nomes[0] + '  x  ' + P.nomes[1], x + w / 2, y + 140 * s, 96 * s, 800, '#ffffff', 'center', 'exo');
    txt(ctx, 'a volta de cada um, largando juntos', x + w / 2, y + 220 * s, 36 * s, 600, '#c3c8cd', 'center');
    ctx.globalAlpha = 1;
  }

  function estado(P, c) {
    var t = Math.max(0, c), A = P.carros[0](t), B = P.carros[1](t), g = P.gap(t, A.d);
    return { c: [A, B], gap: g, lider: g >= 0 ? 0 : 1, t: t };
  }

  function quadro(ctx, P, L, W, H, c) {
    var e = W / L.w, est = estado(P, c);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var fundo = ctx.createLinearGradient(0, 0, 0, H);
    fundo.addColorStop(0, '#16090c'); fundo.addColorStop(0.5, '#0d0f12'); fundo.addColorStop(1, '#0b0c0e');
    ctx.fillStyle = fundo; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(e, 0, 0, e, 0, 0);
    var m, gapTxt = Math.abs(est.gap) < 0.0005 ? 'Empatados' : P.nomes[est.lider] + ' na frente por ' + virg(Math.abs(est.gap), 3) + 's';
    if (L === VERT) {
      marca(ctx, 540, 96, 46, 'center');
      txt(ctx, 'VOLTA FANTASMA', 540, 168, 32, 800, '#e3343c', 'center');
      txt(ctx, P.titulo, 540, 238, 58, 800, '#ffffff', 'center', 'exo');
      txt(ctx, P.sub, 540, 290, 32, 600, '#8e979f', 'center');
      /* o mapa toma a altura que a pista pede (pista larga: mapa mais baixo e gráfico maior) */
      var asp = (P.box.y1 - P.box.y0) / (P.box.x1 - P.box.x0), mh = Math.round(Math.max(620, Math.min(980, 980 * asp + 140)));
      m = mapa(ctx, P, est, 50, 320, 980, mh);
      var yc = 320 + mh + 20;
      cartao(ctx, P, est, 0, 40, yc, 490, 260);
      cartao(ctx, P, est, 1, 550, yc, 490, 260);
      txt(ctx, gapTxt, 540, yc + 342, 48, 800, COR[est.lider], 'center', 'exo');
      grafico(ctx, P, est, 60, yc + 372, 960, Math.max(120, 1800 - (yc + 372)));
      txt(ctx, 'automobilismonaveia.com.br', 540, 1872, 34, 700, '#8e979f', 'center');
    } else {
      m = mapa(ctx, P, est, 30, 30, 940, 940);
      marca(ctx, 1010, 86, 40);
      txt(ctx, 'VOLTA FANTASMA', 1010, 146, 28, 800, '#e3343c');
      txt(ctx, P.titulo, 1010, 212, 54, 800, '#ffffff', 'left', 'exo');
      txt(ctx, P.sub, 1010, 258, 28, 600, '#8e979f');
      cartao(ctx, P, est, 0, 1010, 290, 730, 230);
      cartao(ctx, P, est, 1, 1010, 540, 730, 230);
      txt(ctx, gapTxt, 1010, 836, 44, 800, COR[est.lider], 'left', 'exo');
      grafico(ctx, P, est, 1010, 860, 730, 90);
      txt(ctx, 'automobilismonaveia.com.br', 1740, 984, 24, 700, '#5c6268', 'right');
    }
    if (c < 0) quadroIntro(ctx, P, m, Math.min(1, -c / 0.4));
    else if (c > P.dur + 0.3) quadroFinal(ctx, P, m);
  }

  /* o relógio anda na velocidade escolhida durante a volta, e em tempo normal na abertura e no final */
  function avancar(P, c, dt, vel) { return c + dt * (c >= 0 && c <= P.dur ? vel : 1); }

  /* ---------- player no site ---------- */
  function montar(alvo, o) {
    if (!alvo) return;
    if (alvo._parar) alvo._parar();
    if (!o || !o.r || !o.r.mapa || o.r.mapa.length < 20) { alvo.hidden = true; alvo.innerHTML = ''; return; }
    var P = preparar(o), vel = 1, c = -INTRO, tocando = false, ultimo = 0, quadroPedido = 0, L = VERT, gravando = false;
    alvo.hidden = false;
    alvo.innerHTML = '<div class="vf-cab"><h3>Volta fantasma</h3><p>As duas voltas na pista ao mesmo tempo, como se largassem juntas. A distância entre os carros é a diferença de verdade.</p></div>' +
      '<div class="vf-palco"><canvas class="vf-tela" role="img" aria-label="Volta fantasma: ' + esc(P.nomes[0]) + ' contra ' + esc(P.nomes[1]) + '"></canvas></div>' +
      '<div class="vf-ctl"><button type="button" class="vf-bt vf-play">Assistir</button>' +
      '<input type="range" class="vf-barra" min="0" max="1000" value="0" aria-label="Ponto da volta">' +
      '<div class="vf-vel" role="group" aria-label="Velocidade"><button type="button" data-v="1" aria-pressed="true">1x</button><button type="button" data-v="2" aria-pressed="false">2x</button><button type="button" data-v="4" aria-pressed="false">4x</button></div></div>' +
      '<div class="vf-video"><button type="button" class="vf-bt vf-gerar"></button>' + (o.link ? '<button type="button" class="vf-bt vf-linha vf-link">Compartilhar</button>' : '') + '<span class="vf-msg" role="status"></span></div>' +
      '<div class="vf-pronto" hidden></div>';
    var palco = alvo.querySelector('.vf-palco'), tela = alvo.querySelector('.vf-tela'), ctx = tela.getContext('2d');
    var play = alvo.querySelector('.vf-play'), barra = alvo.querySelector('.vf-barra'), gerar = alvo.querySelector('.vf-gerar');
    var msg = alvo.querySelector('.vf-msg'), pronto = alvo.querySelector('.vf-pronto');

    function rotuloGerar() {
      var s = Math.round(INTRO + P.dur / vel + FIM);
      gerar.textContent = 'Gerar vídeo para Reels, TikTok e Shorts (' + Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) + ')';
    }
    function desenhar() {
      if (!tela.width) return;
      quadro(ctx, P, L, tela.width, tela.height, c);
      barra.value = Math.round(Math.max(0, Math.min(1, c / P.dur)) * 1000);
    }
    function medir() {
      var w = palco.clientWidth; if (!w) return;
      L = w >= 640 ? HORIZ : VERT;
      var h = Math.round(w * L.h / L.w), dpr = Math.min(window.devicePixelRatio || 1, 2);
      tela.style.width = w + 'px'; tela.style.height = h + 'px';
      tela.width = Math.round(w * dpr); tela.height = Math.round(h * dpr);
      desenhar();
    }
    function laco(agora) {
      quadroPedido = 0;
      if (!tocando) return;
      var dt = ultimo ? Math.min(0.1, (agora - ultimo) / 1000) : 0; ultimo = agora;
      c = avancar(P, c, dt, vel);
      if (c >= P.dur + FIM) { c = P.dur + FIM; parar(); }
      desenhar();
      if (tocando) quadroPedido = requestAnimationFrame(laco);
    }
    function tocar() {
      if (gravando) return;
      if (c >= P.dur + FIM - 0.01) c = -INTRO;
      tocando = true; ultimo = 0; play.textContent = 'Pausar';
      if (!quadroPedido) quadroPedido = requestAnimationFrame(laco);
    }
    function parar() { tocando = false; play.textContent = c >= P.dur + FIM - 0.01 ? 'Ver de novo' : 'Assistir'; }

    play.addEventListener('click', function () { if (tocando) parar(); else tocar(); });
    barra.addEventListener('input', function () { parar(); c = barra.value / 1000 * P.dur; desenhar(); });
    [].forEach.call(alvo.querySelectorAll('.vf-vel button'), function (b) {
      b.addEventListener('click', function () {
        vel = +b.getAttribute('data-v');
        [].forEach.call(alvo.querySelectorAll('.vf-vel button'), function (x) { x.setAttribute('aria-pressed', x === b); });
        rotuloGerar();
      });
    });
    gerar.addEventListener('click', function () { gravar(); });
    /* compartilhar: o link do site que abre esta mesma comparação */
    var bLink = alvo.querySelector('.vf-link');
    if (bLink) bLink.addEventListener('click', function () {
      var dados = { title: 'Volta fantasma ' + P.nomes[0] + ' x ' + P.nomes[1], text: P.titulo + ': ' + P.nomes[0] + ' x ' + P.nomes[1] + ', volta a volta, no Automobilismo Na Veia', url: o.link };
      function copiar() {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(o.link).then(function () { msg.textContent = 'Link copiado! Cole no WhatsApp, no Instagram ou onde quiser.'; }, function () { msg.textContent = o.link; });
        else msg.textContent = o.link;
      }
      if (navigator.share) navigator.share(dados).catch(function (e) { if (!e || e.name !== 'AbortError') copiar(); });
      else copiar();
    });
    rotuloGerar();

    var ro = window.ResizeObserver ? new ResizeObserver(medir) : null;
    if (ro) ro.observe(palco); else window.addEventListener('resize', medir);
    medir();
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 40px "Exo 2"'), document.fonts.load('700 40px Inter')]).then(desenhar, function () {});
    /* começa sozinho quando aparece na tela */
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); tocar(); } }, { threshold: 0.4 });
      io.observe(palco);
    }
    alvo._parar = function () { tocando = false; gravando = false; if (ro) ro.disconnect(); if (io) io.disconnect(); };

    /* ---------- vídeo em pé (1080x1920) ---------- */
    function gravar() {
      var tipos = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      var tipo = window.MediaRecorder && MediaRecorder.isTypeSupported ? tipos.filter(function (x) { return MediaRecorder.isTypeSupported(x); })[0] : null;
      var cv = document.createElement('canvas');
      if (!tipo || !cv.captureStream) { msg.textContent = 'Este navegador não consegue gravar vídeo. Tente pelo Chrome, no computador ou no Android.'; return; }
      parar(); gravando = true; gerar.disabled = true; play.disabled = true; pronto.hidden = true; pronto.innerHTML = '';
      cv.width = VERT.w; cv.height = VERT.h; cv.className = 'vf-gravando';
      tela.hidden = true; palco.appendChild(cv);
      var cx = cv.getContext('2d'), rel = -INTRO, ant = 0, partes = [], fim = P.dur + FIM;
      quadro(cx, P, VERT, cv.width, cv.height, rel);
      var rec = new MediaRecorder(cv.captureStream(30), { mimeType: tipo, videoBitsPerSecond: 8000000 });
      rec.ondataavailable = function (e) { if (e.data && e.data.size) partes.push(e.data); };
      rec.onstop = function () {
        gravando = false; gerar.disabled = false; play.disabled = false;
        cv.remove(); tela.hidden = false; desenhar();
        var mime = tipo.split(';')[0], ext = mime === 'video/mp4' ? 'mp4' : 'webm';
        var blob = new Blob(partes, { type: mime }), url = URL.createObjectURL(blob);
        var nome = ('volta-fantasma-' + P.nomes[0] + '-x-' + P.nomes[1] + '-' + P.titulo).toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '.' + ext;
        var arq = window.File ? new File([blob], nome, { type: mime }) : null;
        var podeCompartilhar = arq && navigator.canShare && navigator.canShare({ files: [arq] });
        msg.textContent = 'Vídeo pronto!';
        pronto.hidden = false;
        pronto.innerHTML = '<video src="' + url + '" controls playsinline muted></video><div class="vf-pronto-acoes">' +
          (podeCompartilhar ? '<button type="button" class="vf-bt vf-compartilhar">Compartilhar</button>' : '') +
          '<a class="vf-bt vf-linha" href="' + url + '" download="' + nome + '">Baixar o vídeo</a></div>' +
          (ext === 'webm' ? '<p class="vf-nota">O vídeo saiu em .webm. Se o Instagram não aceitar, grave pelo Chrome atualizado ou pelo celular.</p>' : '');
        var bc = pronto.querySelector('.vf-compartilhar');
        if (bc) bc.addEventListener('click', function () {
          navigator.share({ files: [arq], title: 'Volta fantasma ' + P.nomes[0] + ' x ' + P.nomes[1], text: P.titulo + ' · automobilismonaveia.com.br' }).catch(function () {});
        });
      };
      rec.start(1000);
      msg.textContent = 'Gravando… deixe esta tela aberta até terminar.';
      function passo(agora) {
        if (!gravando) { if (rec.state !== 'inactive') rec.stop(); return; }
        var dt = ant ? Math.min(0.1, (agora - ant) / 1000) : 0; ant = agora;
        rel = Math.min(fim, avancar(P, rel, dt, vel));
        quadro(cx, P, VERT, cv.width, cv.height, rel);
        msg.textContent = 'Gravando… ' + Math.round((rel + INTRO) / (fim + INTRO) * 100) + '% (deixe esta tela aberta até terminar)';
        if (rel >= fim) { setTimeout(function () { if (rec.state !== 'inactive') rec.stop(); }, 300); return; }
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    }
  }

  window.FANTASMA = { montar: montar, quadro: quadro, preparar: preparar, VERT: VERT, HORIZ: HORIZ };
})();
