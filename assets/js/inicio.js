/* Página inicial: abertura guiada pelo scroll, agenda e índice das categorias. */
(function () {
  var CATS = window.CATEGORIAS;

  /* Agenda: próximas etapas em até 14 dias */
  var hoje = window.hojeISO();
  var prox = [];
  CATS.forEach(function (c) {
    var e = c.calendario.filter(function (x) { return x.d && x.d >= hoje && !x.venc; })[0];
    if (e) prox.push({ c: c, e: e });
  });
  prox.sort(function (a, b) { return a.e.d < b.e.d ? -1 : 1; });
  var janela = prox.filter(function (p) { return window.diasAte(p.e.d) <= 14; });
  if (janela.length < 4) janela = prox.slice(0, 6);
  document.getElementById('torre').innerHTML = janela.map(function (p) { return window.linhaAgenda(p.c, p.e); }).join('');

  /* Próxima largada: a corrida mais próxima de todas as categorias, com contagem regressiva (e a da F1, se for outra) */
  function proximaCorrida(filtro) {
    var melhor = null, agora = Date.now();
    CATS.forEach(function (c) {
      if (filtro && !filtro(c)) return;
      c.calendario.forEach(function (e) {
        (e.s || []).forEach(function (x) {
          if (!/Corrida|Principal|Race/.test(x.t)) return;
          var ini = new Date(x.d + 'T' + x.h + ':00-03:00').getTime();
          if (ini + 2 * 36e5 < agora) return;
          if (!melhor || ini < melhor.ini) melhor = { c: c, e: e, x: x, ini: ini };
        });
      });
    });
    return melhor;
  }
  var DIAS_L = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function relogio(p, grande) {
    return '<span class="contagem contagem-corrida' + (grande ? ' contagem-grande' : '') + '" data-ini="' + p.ini + '" data-fim="' + (p.ini + 2 * 36e5) + '">' +
      '<span class="contagem-rot"><span class="contagem-nome">' + esc(p.x.t) + '</span> <span class="contagem-em">em</span></span><b class="contagem-tempo">--:--:--</b></span>';
  }
  var pl = proximaCorrida(), caixaL = document.getElementById('largada');
  if (pl && caixaL) {
    var dia = new Date(pl.x.d + 'T12:00:00');
    var f1 = pl.c.slug === 'formula-1' ? null : proximaCorrida(function (c) { return c.slug === 'formula-1'; });
    caixaL.innerHTML = '<div class="largada-card"><span class="largada-rot">Próxima largada</span>' +
      '<a class="largada-evento" href="' + pl.c.slug + '.html#calendario"><b>' + esc(pl.c.nome) + '</b> ' + esc(pl.e.n) + '</a>' +
      '<span class="largada-local">' + esc(pl.e.l) + ' · ' + DIAS_L[dia.getDay()] + ', ' + pl.x.d.slice(8) + '/' + pl.x.d.slice(5, 7) + ', ' + pl.x.h.replace(':', 'h') + ' (horário de Brasília)</span>' +
      relogio(pl, true) + '</div>' +
      (f1 ? '<div class="largada-f1"><a href="formula-1.html#calendario"><b>Fórmula 1</b> ' + esc(f1.e.n) + ', ' + esc(f1.e.l) + '</a>' + relogio(f1, false) + '</div>' : '');
  }

  /* Índice, em 3 grupos */
  document.getElementById('indice').innerHTML = window.GRUPOS.map(function (g) {
    return '<section class="indice-grupo"><div class="indice-grupo-cab"><h3>' + esc(g.nome) + '</h3><p>' + esc(g.desc) + '</p></div><ul class="indice">' +
      g.cats.map(function (c) {
        return '<li class="indice-item"><a class="indice-link" href="' + c.slug + '.html">' +
          '<span class="indice-nome">' + esc(c.nome) + '</span>' +
          '<span class="indice-frase">' + esc(c.frase) + '</span>' +
          '<span class="indice-lider"><b>' + esc(c.lider.nome) + '</b> ' + esc(c.lider.info) + '</span>' +
          '<img class="indice-miniatura" src="' + c.foto + '" alt="" loading="lazy"></a>' +
          '<div class="indice-foto" aria-hidden="true"><img src="' + c.foto + '" alt="" loading="lazy"></div></li>';
      }).join('') + '</ul></section>';
  }).join('');

  /* Abertura */
  var sec = document.getElementById('abertura');
  if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var c1 = sec.querySelector('.carro-1'), c2 = sec.querySelector('.carro-2'), c3 = sec.querySelector('.carro-3');
  var titulo = sec.querySelector('.titulo-vazado');
  var chamada = sec.querySelector('.chamada-in');
  var legendas = [].slice.call(sec.querySelectorAll('.legenda'));
  var barras = [].slice.call(sec.querySelectorAll('.setor-barra i'));
  var vel = document.getElementById('m-vel'), rpm = document.getElementById('m-rpm');
  var mob = window.matchMedia('(max-width: 760px)');
  var ARCO = 235.6;
  var pronto = false, alvo = 0, atualP = -1;

  function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function faixa(a, b, p) { var t = cl((p - a) / (b - a)); return t * t * (3 - 2 * t); }
  function set(el, k, v) { var u = el._ult || (el._ult = {}); if (u[k] === v) return; u[k] = v; el.style[k] = v; }

  c1.addEventListener('animationend', function () { c1.style.animation = 'none'; c1.style.opacity = 1; pronto = true; desenhar(); });
  setTimeout(function () { if (!pronto) { c1.style.animation = 'none'; c1.style.opacity = 1; pronto = true; desenhar(); } }, 2200);

  function medidor(el, frac, texto) {
    el.querySelector('.ponteiro').style.strokeDasharray = (ARCO * frac).toFixed(1) + ' 314.2';
    var b = el.querySelector('b'); if (b.textContent !== texto) b.textContent = texto;
  }

  function desenhar() {
    var r = sec.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    alvo = cl(-r.top / total);
    if (!raf) raf = requestAnimationFrame(passo);
  }
  var raf = 0;
  function passo() {
    raf = 0;
    /* suaviza a resposta ao scroll sem atrasar demais */
    atualP = atualP < 0 ? alvo : atualP + (alvo - atualP) * 0.18;
    if (Math.abs(alvo - atualP) < 0.0005) atualP = alvo;
    var p = atualP;
    var base = mob.matches ? 1.35 : 1;

    set(titulo, 'transform', 'translate(-50%,' + (-p * (mob.matches ? 40 : 140)).toFixed(1) + 'px)');
    set(titulo, 'opacity', (1 - faixa(.3, .58, p) * .88).toFixed(3));

    if (pronto) set(c1, 'transform', 'scale(' + (base * (1 + p * .05)).toFixed(4) + ')');
    set(c2, 'opacity', faixa(.17, .4, p).toFixed(3));
    set(c2, 'transform', 'scale(' + (base * (1 + p * .05)).toFixed(4) + ')');
    var t3 = faixa(.54, .74, p);
    set(c3, 'opacity', t3.toFixed(3));
    set(c3, 'transform', 'scale(' + (1.12 - t3 * .12 + p * .02).toFixed(4) + ')');

    set(chamada, 'opacity', (1 - faixa(.07, .17, p)).toFixed(3));
    set(chamada, 'transform', 'translateY(' + (-faixa(.07, .17, p) * 24).toFixed(1) + 'px)');

    legendas.forEach(function (l) {
      var de = +l.getAttribute('data-de'), ate = +l.getAttribute('data-ate');
      var o = faixa(de, de + .07, p) * (1 - faixa(ate - .06, ate, p));
      set(l, 'opacity', o.toFixed(3));
      set(l, 'transform', 'translateY(' + ((1 - o) * 14).toFixed(1) + 'px)');
    });

    barras.forEach(function (b, i) { set(b, 'transform', 'scaleX(' + faixa(i / 3, (i + 1) / 3, p).toFixed(3) + ')'); });

    var v = Math.round(340 * (1 - Math.pow(1 - p, 2.2)));
    medidor(vel, v / 360, String(v));
    var giro = Math.round(40 + 85 * faixa(0, .9, p)) / 10;
    medidor(rpm, giro / 13, giro.toFixed(1).replace('.', ','));

    if (atualP !== alvo) raf = requestAnimationFrame(passo);
  }

  window.addEventListener('scroll', desenhar, { passive: true });
  window.addEventListener('resize', desenhar);
  desenhar();
})();
