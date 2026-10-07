/* Telemetria da F1: cálculo e desenho (usado na página do Master e na amostra da página inicial).
   Os dados vêm do OpenF1 (api.openf1.org): car_data (velocidade, acelerador, freio, marcha) e location (x, y).
   A distância de cada volta sai da velocidade somada ao longo do tempo; as duas voltas são colocadas na mesma escala
   e reamostradas a cada PASSO metros, para dar para comparar ponto a ponto. */
(function (raiz) {
  var PASSO = 10, TRECHOS = 25;

  function interp(xs, ys, x) {
    if (x <= xs[0]) return ys[0];
    var n = xs.length; if (x >= xs[n - 1]) return ys[n - 1];
    var lo = 0, hi = n - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (xs[m] <= x) lo = m; else hi = m; }
    var f = (x - xs[lo]) / ((xs[hi] - xs[lo]) || 1);
    return ys[lo] + (ys[hi] - ys[lo]) * f;
  }

  /* Uma volta: car = [{date, speed, throttle, brake, n_gear}], loc = [{date, x, y}], ini = início (ms), dur = segundos */
  function volta(car, loc, ini, dur) {
    var pts = car.map(function (c) { return { t: (Date.parse(c.date) - ini) / 1000, v: c.speed || 0, a: c.throttle || 0, f: c.brake ? 100 : 0, g: c.n_gear || 0 }; })
      .filter(function (p) { return p.t >= 0 && p.t <= dur; }).sort(function (a, b) { return a.t - b.t; });
    if (pts.length < 20) return null;
    /* começa no 0 e termina no fim da volta, com a velocidade das pontas */
    if (pts[0].t > 0) pts.unshift({ t: 0, v: pts[0].v, a: pts[0].a, f: pts[0].f, g: pts[0].g });
    var u = pts[pts.length - 1]; if (u.t < dur) pts.push({ t: dur, v: u.v, a: u.a, f: u.f, g: u.g });
    var d = [0];
    for (var i = 1; i < pts.length; i++) d.push(d[i - 1] + (pts[i - 1].v + pts[i].v) / 2 / 3.6 * (pts[i].t - pts[i - 1].t));
    var lp = (loc || []).map(function (l) { return { t: (Date.parse(l.date) - ini) / 1000, x: l.x, y: l.y }; })
      .filter(function (p) { return p.t >= 0 && p.t <= dur && (p.x || p.y); }).sort(function (a, b) { return a.t - b.t; });
    return {
      dur: dur, total: d[d.length - 1], d: d,
      t: pts.map(function (p) { return p.t; }), v: pts.map(function (p) { return p.v; }), a: pts.map(function (p) { return p.a; }),
      f: pts.map(function (p) { return p.f; }), g: pts.map(function (p) { return p.g; }),
      lt: lp.map(function (p) { return p.t; }), lx: lp.map(function (p) { return p.x; }), ly: lp.map(function (p) { return p.y; })
    };
  }

  /* Junta duas voltas na mesma grade de distância. Delta = tempo de B menos tempo de A (positivo: A na frente). */
  function comparar(A, B) {
    var L = A.total, n = Math.floor(L / PASSO) + 1, escB = B.total / L, r = { passo: PASSO, total: Math.round(L), dist: [], a: {}, b: {}, delta: [], mapa: [], trechos: [] };
    ['v', 'a', 'f', 'g', 't'].forEach(function (k) { r.a[k] = []; r.b[k] = []; });
    for (var i = 0; i < n; i++) {
      var x = i * PASSO; r.dist.push(x);
      ['v', 'a', 'f', 'g', 't'].forEach(function (k) {
        r.a[k].push(interp(A.d, A[k], x));
        r.b[k].push(interp(B.d, B[k], x * escB));
      });
      r.a.g[i] = Math.round(r.a.g[i]); r.b.g[i] = Math.round(r.b.g[i]);
      r.a.f[i] = r.a.f[i] > 50 ? 100 : 0; r.b.f[i] = r.b.f[i] > 50 ? 100 : 0;
      r.delta.push(r.b.t[i] - r.a.t[i]);
    }
    /* mapa da pista: posição do carro A em cada ponto da grade */
    var V = A.lt.length > 20 ? A : (B.lt.length > 20 ? B : null);
    if (V) {
      var distLoc = V.lt.map(function (t) { return interp(V.t, V.d, t); });
      for (var j = 0; j < n; j++) {
        var xx = j * PASSO * (V === B ? escB : 1);
        r.mapa.push([Math.round(interp(distLoc, V.lx, xx)), Math.round(interp(distLoc, V.ly, xx))]);
      }
    }
    /* quem foi mais rápido em cada trecho */
    for (var s = 0; s < TRECHOS; s++) {
      var i0 = Math.floor(s * (n - 1) / TRECHOS), i1 = Math.floor((s + 1) * (n - 1) / TRECHOS);
      var ganho = (r.b.t[i1] - r.b.t[i0]) - (r.a.t[i1] - r.a.t[i0]);
      r.trechos.push({ i0: i0, i1: i1, ganho: Math.round(ganho * 1000) / 1000 });
    }
    r.tempoA = A.dur; r.tempoB = B.dur;
    return r;
  }

  /* ----- desenho (só no navegador) ----- */
  var COR_A = '#e3343c', COR_B = '#4fa3ff';
  function fmtTempo(s) { var m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3); }

  function caminho(ys, n, w, h, min, max, degrau) {
    var out = '', ant = null;
    for (var i = 0; i < n; i++) {
      var x = (i / (n - 1)) * w, y = h - (ys[i] - min) / ((max - min) || 1) * h;
      if (degrau && ant !== null) out += 'L' + x.toFixed(1) + ' ' + ant.toFixed(1);
      out += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      ant = y;
    }
    return out;
  }

  /* opts: { nomes: ['VER', 'NOR'], paineis: ['v', 'a', 'f', 'g', 'delta'], mapa: true } */
  function desenhar(caixa, r, opts) {
    opts = opts || {};
    var nomes = opts.nomes || ['A', 'B'], paineis = opts.paineis || ['v', 'a', 'f', 'g', 'delta'], n = r.dist.length, W = 1000;
    var CFG = {
      v: { rot: 'Velocidade (km/h)', h: 170, min: 0, max: 360 },
      a: { rot: 'Acelerador (%)', h: 70, min: 0, max: 100 },
      f: { rot: 'Freio', h: 34, min: 0, max: 100, degrau: true },
      g: { rot: 'Marcha', h: 70, min: 0, max: 8, degrau: true },
      delta: { rot: 'Diferença (s)', h: 90 }
    };
    var vmax = Math.max.apply(null, r.a.v.concat(r.b.v)), vmin = Math.min.apply(null, r.a.v.concat(r.b.v));
    CFG.v.max = Math.ceil(vmax / 20) * 20 + 10; CFG.v.min = Math.max(0, Math.floor(vmin / 20) * 20 - 10);
    var dm = Math.max(0.05, Math.max.apply(null, r.delta.map(Math.abs)));
    CFG.delta.min = -dm * 1.1; CFG.delta.max = dm * 1.1;

    var dif = r.tempoB - r.tempoA, quem = dif >= 0 ? 0 : 1;
    var html = '<div class="tl-legenda"><span class="tl-a"><i></i>' + nomes[0] + ' <b>' + fmtTempo(r.tempoA) + '</b></span>' +
      '<span class="tl-b"><i></i>' + nomes[1] + ' <b>' + fmtTempo(r.tempoB) + '</b></span>' +
      '<span class="tl-dif">' + nomes[quem] + ' mais rápido por <b>' + Math.abs(dif).toFixed(3) + 's</b></span></div>';
    html += '<div class="tl-corpo' + (opts.mapa === false || !r.mapa.length ? ' sem-mapa' : '') + '"><div class="tl-graficos">';
    paineis.forEach(function (p) {
      var c = CFG[p], h = c.h, corpo = '';
      if (p === 'delta') {
        var y0 = h - (0 - c.min) / (c.max - c.min) * h;
        corpo = '<line x1="0" x2="' + W + '" y1="' + y0 + '" y2="' + y0 + '" class="tl-zero"/>' +
          '<path d="' + caminho(r.delta, n, W, h, c.min, c.max) + '" fill="none" stroke="' + COR_A + '" stroke-width="2"/>';
      } else {
        corpo = '<path d="' + caminho(r.b[p], n, W, h, c.min, c.max, c.degrau) + '" fill="none" stroke="' + COR_B + '" stroke-width="2"/>' +
          '<path d="' + caminho(r.a[p], n, W, h, c.min, c.max, c.degrau) + '" fill="none" stroke="' + COR_A + '" stroke-width="2"/>';
      }
      html += '<div class="tl-painel"><span class="tl-rot">' + c.rot + (p === 'delta' ? ' <small>acima da linha: ' + nomes[0] + ' na frente</small>' : '') + '</span>' +
        '<svg viewBox="0 0 ' + W + ' ' + h + '" preserveAspectRatio="none" style="height:' + h + 'px">' + corpo +
        '<line class="tl-cursor" x1="-10" x2="-10" y1="0" y2="' + h + '"/></svg></div>';
    });
    html += '<div class="tl-eixo"><span>0 m</span><span>' + (r.total / 1000).toFixed(2).replace('.', ',') + ' km</span></div></div>';

    if (opts.mapa !== false && r.mapa.length) {
      var xs = r.mapa.map(function (p) { return p[0]; }), ys = r.mapa.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0m = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var esc = 380 / Math.max(x1 - x0, y1 - y0m), ox = (400 - (x1 - x0) * esc) / 2, oy = (400 - (y1 - y0m) * esc) / 2;
      var P = function (i) { return [(r.mapa[i][0] - x0) * esc + ox + 0, 400 - ((r.mapa[i][1] - y0m) * esc + oy)]; };
      var segs = r.trechos.map(function (t) {
        var d = '';
        for (var i = t.i0; i <= t.i1; i++) { var q = P(i); d += (i === t.i0 ? 'M' : 'L') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
        return '<path d="' + d + '" stroke="' + (t.ganho >= 0 ? COR_A : COR_B) + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
      }).join('');
      var ini = P(0);
      html += '<div class="tl-mapa"><span class="tl-rot">Quem foi mais rápido em cada trecho</span><svg viewBox="0 0 400 400">' + segs +
        '<circle cx="' + ini[0].toFixed(1) + '" cy="' + ini[1].toFixed(1) + '" r="6" fill="#fff"/><circle class="tl-ponto" r="7" cx="-20" cy="-20"/></svg>' +
        '<p class="tl-mapa-leg"><span class="tl-a"><i></i>' + nomes[0] + '</span><span class="tl-b"><i></i>' + nomes[1] + '</span><span>○ largada</span></p></div>';
      caixa._P = P;
    }
    html += '</div><div class="tl-leitura" hidden></div>';
    caixa.innerHTML = html;

    /* cursor: passa o dedo ou o mouse pelos gráficos */
    var graf = caixa.querySelector('.tl-graficos'), leitura = caixa.querySelector('.tl-leitura'), ponto = caixa.querySelector('.tl-ponto');
    /* o dedo ou o mouse geram muitos eventos; o cursor redesenha só uma vez por quadro da tela (sem travar no celular) */
    var pendente = null;
    function mover(ev) {
      var cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      if (pendente === null) requestAnimationFrame(function () { var x = pendente; pendente = null; cursor(x); });
      pendente = cx;
    }
    function cursor(clientX) {
      var b = graf.getBoundingClientRect(), x = clientX - b.left;
      var f = Math.max(0, Math.min(1, x / b.width)), i = Math.round(f * (n - 1));
      [].forEach.call(caixa.querySelectorAll('.tl-cursor'), function (l) { l.setAttribute('x1', f * W); l.setAttribute('x2', f * W); });
      if (ponto && caixa._P) { var q = caixa._P(i); ponto.setAttribute('cx', q[0]); ponto.setAttribute('cy', q[1]); }
      var d = r.delta[i];
      leitura.hidden = false;
      leitura.innerHTML = '<b>' + Math.round(r.dist[i]) + ' m</b>' +
        '<span class="tl-a"><i></i>' + nomes[0] + ' ' + Math.round(r.a.v[i]) + ' km/h · ' + r.a.g[i] + 'ª' + (r.a.f[i] ? ' · freio' : '') + '</span>' +
        '<span class="tl-b"><i></i>' + nomes[1] + ' ' + Math.round(r.b.v[i]) + ' km/h · ' + r.b.g[i] + 'ª' + (r.b.f[i] ? ' · freio' : '') + '</span>' +
        '<span>' + (Math.abs(d) < 0.0005 ? 'Empatados' : nomes[d > 0 ? 0 : 1] + ' na frente por ' + Math.abs(d).toFixed(3) + 's') + '</span>';
    }
    graf.addEventListener('mousemove', mover);
    graf.addEventListener('touchmove', mover, { passive: true });
    graf.addEventListener('touchstart', mover, { passive: true });
  }

  /* Vídeo oficial da F1 da sessão (assets/dados/telemetria-videos.js). A F1 bloqueia o player dela fora do YouTube,
     então mostramos a capa e o clique abre o vídeo no próprio YouTube, em outra aba. */
  function video(caixa, sessao) {
    var v = (typeof window !== 'undefined' && window.TELEMETRIA_VIDEOS || {})[sessao];
    if (!caixa) return;
    if (!v) { caixa.innerHTML = ''; caixa.hidden = true; return; }
    caixa.hidden = false;
    caixa.innerHTML = '<a class="tl-video-capa" href="https://www.youtube.com/watch?v=' + v.id + '" target="_blank" rel="noopener" aria-label="Assistir no YouTube: ' + v.titulo + '">' +
      '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy">' +
      '<span class="tl-video-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>' +
      '<span class="tl-video-tit">' + v.titulo + '<small>Assistir no YouTube, canal oficial da Fórmula 1 ↗</small></span></a>';
  }

  var api = { volta: volta, comparar: comparar, desenhar: desenhar, fmtTempo: fmtTempo, interp: interp, video: video };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.TELEMETRIA = api;
})(typeof window !== 'undefined' ? window : this);
