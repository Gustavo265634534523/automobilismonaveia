/* Página de Automobilismo (automobilismo.html): últimas notícias e as categorias por grupo,
   com quem lidera e a próxima etapa. Dados: dados.js (CATEGORIAS, GRUPOS) e noticias-gerais.js. */
(function () {
  var alvo = document.getElementById('auto-hub');
  if (!alvo || !window.GRUPOS) return;
  var esc = window.esc, hoje = window.hojeISO(), PORSLUG = {};
  (window.CATEGORIAS || []).forEach(function (c) { PORSLUG[c.slug] = c; });
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  function proxima(c) { return (c.calendario || []).filter(function (e) { return !e.venc && e.d && e.d >= hoje; })[0]; }
  function cartao(c) {
    var px = proxima(c);
    return '<a class="comp-cartao" href="' + c.slug + '.html"><span class="comp-reg">' + esc(c.menu || c.nome) + '</span>' +
      '<b>' + esc(c.nome) + '</b>' + (c.lider ? '<span class="comp-lider"><em>' + esc(c.lider.nome) + '</em>' + esc(c.lider.info) + '</span>' : '') +
      '<span class="comp-prox">' + (px ? 'Próxima: ' + esc(px.n) + ', ' + quando(px.d) : 'Temporada encerrada') + '</span></a>';
  }
  var nots = (window.NOTICIAS_GERAIS || []).filter(function (n) { return PORSLUG[n.cat]; })
    .sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; }).slice(0, 12);
  alvo.innerHTML =
    '<p class="auto-atalhos"><a class="botao" href="horarios.html">Horários da semana</a> <a class="botao" href="raiox.html">Raio-x da F1</a> <a class="botao" href="noticias.html">Todas as notícias</a></p>' +
    (nots.length ? '<section class="vd-bloco"><h2>Notícias</h2><div class="bq-noticias">' + nots.map(function (n) {
      var c = PORSLUG[n.cat];
      return '<a class="bq-not bq-not-automobilismo" href="' + (window.linkNoticia ? window.linkNoticia(n.t) : c.slug + '.html') + '"><span class="bq-not-txt"><small>' +
        esc(c.menu || c.nome) + ' · ' + quando(n.d) + '</small><b>' + esc(n.t) + '</b><span>' + esc(String(n.x).split(/(?<=\.)\s/)[0]) + '</span></span></a>';
    }).join('') + '</div></section>' : '') +
    '<section class="comp-grupo"><h2>Categorias</h2><div class="comp-grade">' +
      (window.ORDEM_CATS || []).map(function (sl) { return PORSLUG[sl]; }).filter(Boolean).map(cartao).join('') + '</div></section>';
})();
