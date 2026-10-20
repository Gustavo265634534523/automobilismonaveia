/* Página de Notícias (noticias.html): junta as notícias dos três esportes.
   Automobilismo: noticias-gerais.js e as notícias de cada categoria (dados.js); futebol e basquete: noticias-esportes.js.
   No topo, a manchete mais recente de cada esporte, lado a lado; embaixo, a lista com filtro por esporte e por campeonato. */
(function () {
  var esc = window.esc;
  var CATS = window.CATEGORIAS || [], COMPS = window.COMPETICOES || [];
  var NOME = {}; CATS.forEach(function (c) { NOME[c.slug] = c.menu || c.nome; }); COMPS.forEach(function (c) { NOME[c.slug] = c.menu || c.nome; });
  var ESPORTES = [['', 'Todas'], ['automobilismo', 'Fórmula 1'], ['futebol', 'Futebol'], ['basquete', 'Basquete']];
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  var en = window.LANG === 'en';

  /* junta tudo, tira repetidas (mesmo título) e ordena da mais nova para a mais antiga */
  var todas = [], vistos = {};
  function add(n, esporte, comp, href) {
    var k = String(n.t).toLowerCase(); if (vistos[k] || !NOME[comp]) return; vistos[k] = 1;
    todas.push({ d: n.d, esporte: esporte, comp: comp, t: (en && n.t_en) || n.t, x: (en && n.x_en) || n.x, href: n.link || href, ordem: todas.length });
  }
  (window.NOTICIAS_GERAIS || []).forEach(function (n) { add(n, 'automobilismo', n.cat, window.linkNoticia ? window.linkNoticia(n.t) : n.cat + '.html'); });
  CATS.forEach(function (c) { (c.noticias || []).forEach(function (n) { add(n, 'automobilismo', c.slug, window.linkNoticia ? window.linkNoticia(n.t) : c.slug + '.html'); }); });
  (window.NOTICIAS_ESPORTES || []).forEach(function (n) { add(n, n.esporte, n.comp, (n.comp || n.esporte) + '.html'); });
  todas.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : a.ordem - b.ordem; });

  function cartao(n, grande) {
    return '<a class="ft-not nt2-' + n.esporte + (grande ? ' nt2-grande' : '') + '" href="' + n.href + '"><span class="ft-not-tag">' + esc(NOME[n.comp]) + '</span>' +
      '<b>' + esc(n.t) + '</b><span>' + esc(String(n.x).split(/(?<=\.)\s/)[0]) + '</span><small>' + quando(n.d) + '</small></a>';
  }
  /* manchetes: a mais recente de cada esporte */
  document.getElementById('manchetes').innerHTML = ESPORTES.slice(1).map(function (e) {
    var n = todas.filter(function (x) { return x.esporte === e[0]; })[0];
    return n ? '<div class="nt2-col"><p class="nt2-esp nt2-' + e[0] + '">' + e[1] + '</p>' + cartao(n, true) + '</div>' : '';
  }).join('');

  var esporte = (location.hash.match(/^#(automobilismo|futebol|basquete)$/) || [])[1] || '', comp = '', mostrar = 12;
  var abasE = document.getElementById('nt-esportes'), abasC = document.getElementById('nt-comps'), lista = document.getElementById('lista'), mais = document.getElementById('nt-mais');
  function pintar() {
    var doEsporte = todas.filter(function (n) { return !esporte || n.esporte === esporte; });
    /* campeonatos/categorias do esporte escolhido, na ordem de quantas notícias têm */
    var conta = {}; doEsporte.forEach(function (n) { conta[n.comp] = (conta[n.comp] || 0) + 1; });
    var comps = Object.keys(conta).sort(function (a, b) { return conta[b] - conta[a]; });
    abasC.hidden = !esporte;
    abasC.innerHTML = esporte ? ['<button type="button" data-c="" aria-selected="' + (!comp) + '">Todos</button>'].concat(comps.map(function (c) {
      return '<button type="button" data-c="' + c + '" aria-selected="' + (comp === c) + '">' + esc(NOME[c]) + '</button>';
    })).join('') : '';
    [].forEach.call(abasC.children, function (b) { b.addEventListener('click', function () { comp = b.getAttribute('data-c'); mostrar = 12; pintar(); }); });
    [].forEach.call(abasE.children, function (b) { b.setAttribute('aria-selected', b.getAttribute('data-e') === esporte ? 'true' : 'false'); });
    var l = doEsporte.filter(function (n) { return !comp || n.comp === comp; });
    lista.innerHTML = l.slice(0, mostrar).map(function (n) { return cartao(n); }).join('') || '<p class="ft-vazio">Nenhuma notícia por aqui ainda.</p>';
    mais.hidden = l.length <= mostrar;
  }
  abasE.innerHTML = ESPORTES.map(function (e) { return '<button type="button" role="tab" data-e="' + e[0] + '">' + e[1] + '</button>'; }).join('');
  [].forEach.call(abasE.children, function (b) {
    b.addEventListener('click', function () { esporte = b.getAttribute('data-e'); comp = ''; mostrar = 12; history.replaceState(null, '', esporte ? '#' + esporte : location.pathname); pintar(); });
  });
  mais.addEventListener('click', function () { mostrar += 12; pintar(); });
  pintar();
  var at = document.getElementById('nt-atualizado'); if (at && todas[0]) at.textContent = 'Última atualização: ' + quando(todas[0].d).toLowerCase() + '.';
})();
