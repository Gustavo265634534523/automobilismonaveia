/* Página do esporte (futebol.html e basquete.html, <main id="ft" data-esporte="...">): o jogo grande da semana,
   carrossel de resultados, agenda, classificação com uma aba por tabela, notícias com filtro e os campeonatos.
   Tudo sai de esportes-dados.js (COMPETICOES) e noticias-esportes.js (NOTICIAS_ESPORTES). */
(function () {
  var raiz = document.getElementById('ft');
  if (!raiz) return;
  var ESPORTE = raiz.getAttribute('data-esporte') || 'futebol', BQ = ESPORTE === 'basquete';
  var esc = window.esc, hoje = window.hojeISO();
  var COMPS = (window.COMPETICOES || []).filter(function (c) { return c.esporte === ESPORTE; });
  var PORSLUG = {}; COMPS.forEach(function (c) { PORSLUG[c.slug] = c; });
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  var SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  function diaSemana(d) { return SEMANA[new Date(d + 'T12:00:00').getDay()]; }

  function escudo(n) { return window.escudoTime(n, 'ft-escudo'); }

  var jogos = [];
  COMPS.forEach(function (c) { (c.jogos || []).forEach(function (j) { if (j.casa && j.fora) jogos.push({ c: c, j: j }); }); });
  var feitos = jogos.filter(function (x) { return x.j.p; }).sort(function (a, b) { return (b.j.d || '') < (a.j.d || '') ? -1 : 1; });
  var proximos = jogos.filter(function (x) { return !x.j.p && !x.j.vivo && x.j.d && x.j.d >= hoje; })
    .sort(function (a, b) { return (a.j.d + (a.j.h || '')) < (b.j.d + (b.j.h || '')) ? -1 : 1; });

  /* 1. o jogo grande dos próximos 7 dias: o que tiver mais clubes grandes; no empate, o mais cedo */
  var GRANDES = BQ ? /Lakers|Celtics|Knicks|Warriors|76ers|Heat|Thunder|Spurs|Nuggets|Bucks|Real Madrid|Panathinaikos|Olympiacos|Fenerbahçe|Franca|Flamengo/
    : /Paris Saint-Germain|PSG|Barcelona|Real Madrid|Bayern|Arsenal|Liverpool|Manchester City|Inter|Milan|Juventus|Flamengo|Palmeiras|Corinthians|São Paulo|Atlético de Madrid|Chelsea|Dortmund|Boca/;
  function peso(x) { return (GRANDES.test(x.j.casa) ? 1 : 0) + (GRANDES.test(x.j.fora) ? 1 : 0) + (/champions-league|libertadores|nba/.test(x.c.slug) ? .5 : 0); }
  var semana = proximos.filter(function (x) { return window.diasAte(x.j.d) <= 7; });
  var grande = semana.slice().sort(function (a, b) { return peso(b) - peso(a); })[0];
  var g = document.getElementById('ft-grande');
  if (grande) {
    var j = grande.j;
    g.innerHTML = '<a class="ft-grande" href="' + grande.c.slug + '.html#jogos"><span class="ft-grande-rot">Jogo da semana · ' + esc(grande.c.menu) + '</span>' +
      '<span class="ft-grande-times">' + escudo(j.casa) + '<b>' + esc(j.casa) + '</b><em>x</em><b>' + esc(j.fora) + '</b>' + escudo(j.fora) + '</span>' +
      '<span class="ft-grande-quando">' + diaSemana(j.d) + ', ' + window.dataCurta(j.d) + (j.h ? ' · ' + esc(j.h) : '') + (j.l ? ' · ' + esc(j.l) : '') + '</span></a>' +
      '<a class="ft-btn" href="#sec-aovivo">Jogos de hoje</a>';
  }

  /* 2. resultados recentes, num trilho que passa com as setas */
  var trilho = document.getElementById('ft-recentes');
  trilho.innerHTML = feitos.slice(0, 16).map(function (x) {
    var j = x.j, pl = String(j.p).split(/\s*x\s*/);
    /* só os escudos: o nome fica no title (ao passar o mouse) e no aria-label (leitor de tela) */
    return '<a class="ft-res" href="' + (window.linkPartida(j, x.c.esporte) || x.c.slug + '.html#jogos') + '" aria-label="' + esc(j.casa + ' ' + pl[0] + ' x ' + (pl[1] || '') + ' ' + j.fora + ', ' + x.c.menu) + '"><span class="ft-res-topo"><b>' + esc(x.c.menu) + '</b><span>' + (j.d ? quando(j.d) : esc(j.fase || '')) + '</span></span>' +
      '<span class="ft-res-meio"><span class="ft-res-time" title="' + esc(j.casa) + '">' + escudo(j.casa) + '</span>' +
      '<span class="ft-placar">' + esc(pl[0]) + '<i>–</i>' + esc(pl[1] || '') + '</span>' +
      '<span class="ft-res-time" title="' + esc(j.fora) + '">' + escudo(j.fora) + '</span></span></a>';
  }).join('');
  function rolar(d) { trilho.scrollBy({ left: d * trilho.clientWidth * .8, behavior: 'smooth' }); }
  document.getElementById('ft-rec-ant').addEventListener('click', function () { rolar(-1); });
  document.getElementById('ft-rec-prox').addEventListener('click', function () { rolar(1); });

  /* 3. agenda: os próximos jogos, no máximo dois por campeonato para variar */
  var conta = {};
  var agenda = proximos.filter(function (x) { conta[x.c.slug] = (conta[x.c.slug] || 0) + 1; return conta[x.c.slug] <= 2 && x !== grande; }).slice(0, 6);
  var caixaAg = document.getElementById('ft-agenda');
  if (caixaAg) caixaAg.innerHTML = agenda.map(function (x) {
    var j = x.j;
    return '<a class="ft-jogo" href="' + x.c.slug + '.html#jogos" aria-label="' + esc(j.casa + ' x ' + j.fora + ', ' + x.c.menu) + '">' +
      '<span class="ft-jogo-escudos"><span title="' + esc(j.casa) + '">' + escudo(j.casa) + '</span><em>x</em><span title="' + esc(j.fora) + '">' + escudo(j.fora) + '</span></span>' +
      '<small>' + esc(x.c.menu) + (j.fase ? ' · ' + esc(j.fase) : '') + '</small>' +
      '<span class="ft-jogo-quando"><strong>' + diaSemana(j.d) + ', ' + window.dataCurta(j.d) + '</strong>' + (j.h ? esc(j.h) : 'Horário a confirmar') + '</span>' +
      (j.l ? '<span class="ft-jogo-local">' + esc(j.l) + '</span>' : '') + '<span class="ft-jogo-mais">Detalhes →</span></a>';
  }).join('') || '<p class="ft-vazio">Os próximos jogos aparecem aqui assim que forem confirmados.</p>';

  /* 4. classificação: uma aba por campeonato com tabela */
  var comTabela = [];
  COMPS.forEach(function (c) {
    [c.tabela, c.tabela2].forEach(function (t, k) {
      if (t && t.linhas && t.linhas.length) comTabela.push({ slug: c.slug, menu: c.menu + (c.tabela2 ? (k ? ' Oeste' : ' Leste') : ''), tabela: t });
    });
  });
  var abasT = document.getElementById('ft-tab-abas'), caixaT = document.getElementById('ft-tabela');
  function tabela(c) {
    var t = c.tabela, ver = t.linhas.length > 10;
    return '<div class="ft-tab-wrap"><table class="ft-tab"><caption>' + esc(t.titulo) + '</caption><thead><tr>' + t.colunas.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.linhas.slice(0, 10).map(function (l) { return '<tr>' + l.map(function (v, i) { return (t.colunas[i] === 'Time' ? '<td class="ft-tab-time"><a href="' + window.linkTime(v) + '">' + escudo(v) + esc(v) + '</a></td>' : '<td>' + esc(v) + '</td>'); }).join('') + '</tr>'; }).join('') +
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
  var NOTS = (window.NOTICIAS_ESPORTES || []).filter(function (n) { return n.esporte === ESPORTE; }).sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
  var FILTROS = BQ ? [
    ['Todas', function () { return true; }],
    ['NBA', function (n) { return n.comp === 'nba'; }],
    ['Euroleague', function (n) { return n.comp === 'euroleague'; }],
    ['NBB', function (n) { return n.comp === 'nbb'; }]
  ] : [
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
      return '<a class="ft-not" href="' + (n.link || (n.comp || ESPORTE) + '.html') + '"><span class="ft-not-tag">' + esc(c.menu || (BQ ? 'Basquete' : 'Futebol')) + '</span>' +
        '<b>' + esc(n.t) + '</b><span>' + esc(String(n.x).split(/(?<=\.)\s/)[0]) + '</span><small>' + quando(n.d) + '</small></a>';
    }).join('');
    mais.hidden = lista.length <= mostrar;
  }
  abasN.innerHTML = FILTROS.map(function (f, i) { return '<button type="button" role="tab" data-i="' + i + '">' + f[0] + '</button>'; }).join('');
  [].forEach.call(abasN.children, function (b) { b.addEventListener('click', function () { filtro = +b.getAttribute('data-i'); mostrar = 6; pintarNoticias(); }); });
  mais.addEventListener('click', function () { mostrar += 6; pintarNoticias(); });
  pintarNoticias();

  /* 6. campeonatos: cartões curtos com quem lidera */
  var camps = document.getElementById('ft-camps');
  if (camps) camps.innerHTML = COMPS.map(function (c) {
    return '<a class="ft-camp" href="' + c.slug + '.html"><small>' + esc(c.regiao) + '</small><b>' + esc(c.menu) + '</b><span>' + esc(c.lider ? c.lider.nome : c.fase) + '</span></a>';
  }).join('');
  var atualiz = document.getElementById('ft-atualizado');
  if (atualiz) atualiz.textContent = 'Dados atualizados em ' + window.ESPORTES_ATUALIZADO + '. Fontes: sites oficiais das competições e imprensa esportiva.';

  /* 7. ao vivo (placar sozinho) e o meu time (esportes-mais.js) */
  window.blocoAoVivo(document.getElementById('em-aovivo'), ESPORTE);
  window.blocoMeuTime(document.getElementById('em-meutime'), ESPORTE);

  /* 7b. craque do jogo principal do dia (some quando o robô ainda não tem) */
  var cq = document.getElementById('cq-grade');
  if (cq) { var cqH = window.craqueHTML(ESPORTE); if (cqH) { cq.innerHTML = cqH; document.getElementById('sec-craque').hidden = false; } }

  /* 8. chaveamento: uma aba por campeonato com mata-mata (futebol) ou playoffs (basquete) */
  var CH = window.CHAVES || {}, abasC = document.getElementById('ch-abas'), caixaC = document.getElementById('ch-caixa');
  /* projeção só quando a tabela é da temporada que está rolando */
  function atual(c) { return c.tabela && !/passada|final da temporada/i.test(c.tabela.titulo); }
  var comChave = COMPS.filter(function (c) { return CH[c.slug] || (BQ && atual(c)); });
  function chave(c) {
    var h = '', ch = CH[c.slug];
    if (BQ && atual(c)) { var pj = window.chaveProjetada(c); if (pj) h += '<h3 class="ft-ch-tit">Se os playoffs começassem hoje</h3>' + window.chaveHTML(pj); }
    if (ch) h += '<h3 class="ft-ch-tit">' + esc(ch.titulo) + '</h3>' + (ch.campeao ? '<p class="ch-campeao">' + escudo(ch.campeao) + 'Campeão: ' + esc(ch.campeao) + '</p>' : '') + window.chaveHTML(ch);
    return h + '<p class="ft-centro" style="margin-top:22px"><a class="ft-btn" href="' + c.slug + '.html#chave">Ver o campeonato</a></p>';
  }
  if (abasC && comChave.length) {
    abasC.innerHTML = comChave.map(function (c, i) { return '<button type="button" role="tab" data-i="' + i + '">' + esc(c.menu) + '</button>'; }).join('');
    var abrirC = function (i) { [].forEach.call(abasC.children, function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); }); caixaC.innerHTML = chave(comChave[i]); };
    [].forEach.call(abasC.children, function (b) { b.addEventListener('click', function () { abrirC(+b.getAttribute('data-i')); }); });
    abrirC(0);
  } else if (abasC) document.getElementById('sec-chave').hidden = true;

  /* 9. líderes de estatística (basquete) */
  var lid = document.getElementById('lid-caixa');
  if (lid) lid.innerHTML = window.lideresHTML() || '<p class="ft-vazio">Os líderes de pontos, rebotes e assistências aparecem aqui depois das primeiras rodadas.</p>';

  /* 10. mercado: as 3 novidades mais recentes; o resto na página do mercado */
  var gradeMK = document.getElementById('mk-grade');
  if (gradeMK) gradeMK.innerHTML = (window.MERCADO || []).filter(function (m) { return m.esporte === ESPORTE; }).sort(function (a, b) { return a.d < b.d ? 1 : -1; }).slice(0, 3).map(window.mercadoHTML).join('');

  /* 11. times: os do campeonato principal; o resto na página de todos os times */
  var tm = document.getElementById('tm-grade');
  if (tm) {
    var principal = BQ ? 'nba' : 'brasileirao';
    tm.innerHTML = window.todosTimes(ESPORTE).filter(function (t) { return t.comps.indexOf(principal) > -1; }).map(function (t) {
      return '<a href="' + window.linkTime(t.nome) + '">' + escudo(t.nome) + '<span>' + esc(t.nome) + '</span></a>';
    }).join('') + '<a href="time.html#' + ESPORTE + '"><span>Todos os times →</span></a>';
  }

  /* 12. atalhos no alto: só para as seções que existem na página */
  var sub = document.getElementById('em-subnav');
  if (sub) {
    var ATALHOS = [['sec-aovivo', 'Ao vivo'], ['sec-aovivo', 'Meu time', 'em-meutime'], ['sec-agenda', 'Agenda'], ['ft-tabelas', 'Tabelas'], ['sec-chave', BQ ? 'Playoffs' : 'Mata-mata'],
      ['sec-lideres', 'Líderes'], ['sec-noticias', 'Notícias'], ['sec-mercado', 'Mercado'], ['sec-times', 'Times'], ['sec-camps', 'Campeonatos']];
    sub.innerHTML = '<div class="em-subnav-in">' + ATALHOS.filter(function (a) { var el = document.getElementById(a[0]); return el && !el.hidden; }).map(function (a, i) {
      return '<a href="#' + (a[2] || a[0]) + '"' + (i === 0 ? ' class="em-vivo-link"' : '') + '>' + a[1] + '</a>';
    }).join('') + '<a href="fim-de-semana.html">Fim de semana</a><a href="resumo.html">Resumo da semana</a></div>';
  }
})();
