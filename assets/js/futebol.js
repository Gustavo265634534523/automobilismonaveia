/* Página do futebol (futebol.html): o jogo grande da semana, carrossel de resultados, agenda,
   classificação com uma aba por campeonato, notícias com filtro e os campeonatos.
   Tudo sai de esportes-dados.js (COMPETICOES) e noticias-esportes.js (NOTICIAS_ESPORTES). */
(function () {
  if (!document.getElementById('ft')) return;
  var esc = window.esc, hoje = window.hojeISO();
  var COMPS = (window.COMPETICOES || []).filter(function (c) { return c.esporte === 'futebol'; });
  var PORSLUG = {}; COMPS.forEach(function (c) { PORSLUG[c.slug] = c; });
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  var SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  function diaSemana(d) { return SEMANA[new Date(d + 'T12:00:00').getDay()]; }

  function escudo(n) { return window.escudoTime(n, 'ft-escudo'); }

  var jogos = [];
  COMPS.forEach(function (c) { (c.jogos || []).forEach(function (j) { if (j.casa && j.fora) jogos.push({ c: c, j: j }); }); });
  var feitos = jogos.filter(function (x) { return x.j.p; }).sort(function (a, b) { return (b.j.d || '') < (a.j.d || '') ? -1 : 1; });
  var proximos = jogos.filter(function (x) { return !x.j.p && x.j.d && x.j.d >= hoje; })
    .sort(function (a, b) { return (a.j.d + (a.j.h || '')) < (b.j.d + (b.j.h || '')) ? -1 : 1; });

  /* 1. o jogo grande dos próximos 7 dias: o que tiver mais clubes grandes; no empate, o mais cedo */
  var GRANDES = /Paris Saint-Germain|PSG|Barcelona|Real Madrid|Bayern|Arsenal|Liverpool|Manchester City|Inter|Milan|Juventus|Flamengo|Palmeiras|Corinthians|São Paulo|Atlético de Madrid|Chelsea|Dortmund|Boca/;
  function peso(x) { return (GRANDES.test(x.j.casa) ? 1 : 0) + (GRANDES.test(x.j.fora) ? 1 : 0) + (x.c.slug === 'champions-league' || x.c.slug === 'libertadores' ? .5 : 0); }
  var semana = proximos.filter(function (x) { return window.diasAte(x.j.d) <= 7; });
  var grande = semana.slice().sort(function (a, b) { return peso(b) - peso(a); })[0];
  var g = document.getElementById('ft-grande');
  if (grande) {
    var j = grande.j;
    g.innerHTML = '<a class="ft-grande" href="' + grande.c.slug + '.html#jogos"><span class="ft-grande-rot">Jogo da semana · ' + esc(grande.c.menu) + '</span>' +
      '<span class="ft-grande-times">' + escudo(j.casa) + '<b>' + esc(j.casa) + '</b><em>x</em><b>' + esc(j.fora) + '</b>' + escudo(j.fora) + '</span>' +
      '<span class="ft-grande-quando">' + diaSemana(j.d) + ', ' + window.dataCurta(j.d) + (j.h ? ' · ' + esc(j.h) : '') + (j.l ? ' · ' + esc(j.l) : '') + '</span></a>' +
      '<a class="ft-btn" href="#ft-agenda">Ver a agenda</a>';
  }

  /* 2. resultados recentes, num trilho que passa com as setas */
  var trilho = document.getElementById('ft-recentes');
  trilho.innerHTML = feitos.slice(0, 16).map(function (x) {
    var j = x.j, pl = String(j.p).split(/\s*x\s*/);
    return '<a class="ft-res" href="' + x.c.slug + '.html#jogos"><span class="ft-res-topo"><span>Encerrado</span><b>' + esc(x.c.menu) + '</b><span>' + (j.d ? quando(j.d) : esc(j.fase || '')) + '</span></span>' +
      '<span class="ft-res-meio"><span class="ft-res-time">' + escudo(j.casa) + '<small>' + esc(j.casa) + '</small></span>' +
      '<span class="ft-placar">' + esc(pl[0]) + '<i>–</i>' + esc(pl[1] || '') + '</span>' +
      '<span class="ft-res-time">' + escudo(j.fora) + '<small>' + esc(j.fora) + '</small></span></span></a>';
  }).join('');
  function rolar(d) { trilho.scrollBy({ left: d * trilho.clientWidth * .8, behavior: 'smooth' }); }
  document.getElementById('ft-rec-ant').addEventListener('click', function () { rolar(-1); });
  document.getElementById('ft-rec-prox').addEventListener('click', function () { rolar(1); });

  /* 3. agenda: os próximos jogos, no máximo dois por campeonato para variar */
  var conta = {};
  var agenda = proximos.filter(function (x) { conta[x.c.slug] = (conta[x.c.slug] || 0) + 1; return conta[x.c.slug] <= 2 && x !== grande; }).slice(0, 6);
  document.getElementById('ft-agenda').innerHTML = agenda.map(function (x) {
    var j = x.j;
    return '<a class="ft-jogo" href="' + x.c.slug + '.html#jogos"><span class="ft-jogo-escudos">' + escudo(j.casa) + escudo(j.fora) + '</span>' +
      '<b>' + esc(j.casa) + ' x ' + esc(j.fora) + '</b><small>' + esc(x.c.menu) + (j.fase ? ' · ' + esc(j.fase) : '') + '</small>' +
      '<span class="ft-jogo-quando"><strong>' + diaSemana(j.d) + ', ' + window.dataCurta(j.d) + '</strong>' + (j.h ? esc(j.h) : 'Horário a confirmar') + '</span>' +
      (j.l ? '<span class="ft-jogo-local">' + esc(j.l) + '</span>' : '') + '<span class="ft-jogo-mais">Detalhes →</span></a>';
  }).join('') || '<p class="ft-vazio">Os próximos jogos aparecem aqui assim que forem confirmados.</p>';

  /* 4. classificação: uma aba por campeonato com tabela */
  var comTabela = COMPS.filter(function (c) { return c.tabela && c.tabela.linhas && c.tabela.linhas.length; });
  var abasT = document.getElementById('ft-tab-abas'), caixaT = document.getElementById('ft-tabela');
  function tabela(c) {
    var t = c.tabela, ver = t.linhas.length > 10;
    return '<div class="ft-tab-wrap"><table class="ft-tab"><caption>' + esc(t.titulo) + '</caption><thead><tr>' + t.colunas.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.linhas.slice(0, 10).map(function (l) { return '<tr>' + l.map(function (v, i) { return '<td' + (t.colunas[i] === 'Time' ? ' class="ft-tab-time"' : '') + '>' + (t.colunas[i] === 'Time' ? escudo(v) : '') + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div><p class="ft-centro"><a class="ft-btn" href="' + c.slug + '.html#classificacao">' + (ver ? 'Tabela completa' : 'Ver o campeonato') + '</a></p>';
  }
  function abrirTabela(i) {
    [].forEach.call(abasT.children, function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    caixaT.innerHTML = tabela(comTabela[i]);
  }
  abasT.innerHTML = comTabela.map(function (c, i) { return '<button type="button" role="tab" data-i="' + i + '">' + esc(c.menu) + '</button>'; }).join('');
  [].forEach.call(abasT.children, function (b) { b.addEventListener('click', function () { abrirTabela(+b.getAttribute('data-i')); }); });
  if (comTabela.length) abrirTabela(0);

  /* 5. notícias com filtro; mostra 6 e o botão traz mais 6 */
  var NOTS = (window.NOTICIAS_ESPORTES || []).filter(function (n) { return n.esporte === 'futebol'; }).sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
  var FILTROS = [
    ['Todas', function () { return true; }],
    ['Brasil', function (n) { return /brasileirao|libertadores|sul-americana/.test(n.comp); }],
    ['Champions', function (n) { return n.comp === 'champions-league'; }],
    ['Ligas da Europa', function (n) { return /premier-league|la-liga|bundesliga|serie-a|ligue-1/.test(n.comp); }]
  ];
  var filtro = 0, mostrar = 6;
  var abasN = document.getElementById('ft-not-abas'), caixaN = document.getElementById('ft-noticias'), mais = document.getElementById('ft-not-mais');
  function pintarNoticias() {
    var lista = NOTS.filter(FILTROS[filtro][1]);
    [].forEach.call(abasN.children, function (b, k) { b.setAttribute('aria-selected', k === filtro ? 'true' : 'false'); });
    caixaN.innerHTML = lista.slice(0, mostrar).map(function (n) {
      var c = PORSLUG[n.comp] || {};
      return '<a class="ft-not" href="' + (n.comp || 'futebol') + '.html"><span class="ft-not-tag">' + esc(c.menu || 'Futebol') + '</span>' +
        '<b>' + esc(n.t) + '</b><span>' + esc(String(n.x).split(/(?<=\.)\s/)[0]) + '</span><small>' + quando(n.d) + '</small></a>';
    }).join('');
    mais.hidden = lista.length <= mostrar;
  }
  abasN.innerHTML = FILTROS.map(function (f, i) { return '<button type="button" role="tab" data-i="' + i + '">' + f[0] + '</button>'; }).join('');
  [].forEach.call(abasN.children, function (b) { b.addEventListener('click', function () { filtro = +b.getAttribute('data-i'); mostrar = 6; pintarNoticias(); }); });
  mais.addEventListener('click', function () { mostrar += 6; pintarNoticias(); });
  pintarNoticias();

  /* 6. campeonatos: cartões curtos com quem lidera */
  document.getElementById('ft-camps').innerHTML = COMPS.map(function (c) {
    return '<a class="ft-camp" href="' + c.slug + '.html"><small>' + esc(c.regiao) + '</small><b>' + esc(c.menu) + '</b><span>' + esc(c.lider ? c.lider.nome : c.fase) + '</span></a>';
  }).join('');
  document.getElementById('ft-atualizado').textContent = 'Dados atualizados em ' + window.ESPORTES_ATUALIZADO + '. Fontes: sites oficiais das competições e imprensa esportiva.';
})();
