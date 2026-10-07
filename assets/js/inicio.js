/* Página inicial: abertura guiada pelo scroll, agenda e índice das categorias. */
(function () {
  var CATS = window.CATEGORIAS;

  /* Agenda em formato de calendário de parede: 7 colunas (hoje + 6 dias), com botão para a semana seguinte.
     Em cada dia, uma linha por categoria: a última sessão do dia (no dia da corrida, o nome da etapa) e o horário de Brasília. */
  var hoje = window.hojeISO();
  var SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function somaDias(iso, n) { return new Date(Date.parse(iso + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10); }
  function doDia(d) {
    var lista = [];
    CATS.forEach(function (c) {
      c.calendario.forEach(function (e) {
        if (e.venc && e.d < hoje) return;
        var s = (e.s || []).filter(function (x) { return x.d === d; });
        if (s.length) {
          s.sort(function (a, b) { return a.h < b.h ? -1 : 1; });
          var x = s[s.length - 1], corrida = /Corrida|Principal|Race/.test(x.t) && d === e.d;
          lista.push({ c: c, t: corrida ? e.n : x.t, h: x.h, forte: corrida });
        } else if (!(e.s && e.s.length) && e.d === d) {
          lista.push({ c: c, t: e.n, h: '', forte: true });
        }
      });
    });
    return lista.sort(function (a, b) { return (a.h || '99') < (b.h || '99') ? -1 : 1; });
  }
  function semana(ini) {
    var html = '';
    for (var i = 0; i < 7; i++) {
      var d = somaDias(ini, i), itens = doDia(d), dt = new Date(d + 'T12:00:00');
      html += '<div class="sem-dia' + (d === hoje ? ' hoje' : '') + (itens.length ? '' : ' vazio') + '"><div class="sem-cab"><span>' + (d === hoje ? 'Hoje' : SEM[dt.getDay()]) + '</span><b>' + (+d.slice(8)) + '</b><small>' + MES[+d.slice(5, 7) - 1] + '</small></div>' +
        '<div class="sem-evs">' + (itens.length ? itens.map(function (it) {
          return '<a class="sem-ev' + (it.forte ? ' forte' : '') + '" href="' + it.c.slug + '.html#calendario"><i>' + esc(it.c.menu || it.c.nome) + '</i><span>' + esc(it.t) + '</span>' + (it.h ? '<b>' + it.h.replace(':', 'h') + '</b>' : '') + '</a>';
        }).join('') : '<p class="sem-nada">Sem corridas</p>') + '</div></div>';
    }
    return html;
  }
  var torre = document.getElementById('torre'), deslocado = 0;
  function desenharSemana() {
    torre.innerHTML = '<div class="sem-barra"><button type="button" class="sem-bt" data-s="0" aria-pressed="' + !deslocado + '">Esta semana</button><button type="button" class="sem-bt" data-s="7" aria-pressed="' + !!deslocado + '">Próxima semana</button></div>' +
      '<div class="sem-grade">' + semana(somaDias(hoje, deslocado)) + '</div>';
  }
  desenharSemana();
  torre.addEventListener('click', function (ev) {
    var b = ev.target.closest('.sem-bt'); if (!b) return;
    deslocado = +b.getAttribute('data-s'); desenharSemana();
  });
  var caixaL = document.getElementById('largada'); if (caixaL) caixaL.remove();

  /* Índice, em 3 grupos */
  var indice = document.getElementById('indice');
  if (indice) indice.innerHTML = window.GRUPOS.map(function (g) {
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
