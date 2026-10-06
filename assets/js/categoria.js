/* Página de categoria: topo com foto e abas Notícias, Resultados, Classificação, Calendário, Pilotos e Equipes. */
(function () {
  var slug = document.body.getAttribute('data-cat');
  var c = window.CATEGORIAS.filter(function (x) { return x.slug === slug; })[0];
  if (!c) return;
  var hoje = window.hojeISO();

  /* Topo */
  document.getElementById('cat-topo').innerHTML =
    '<div class="cat-foto" data-paralaxe=".12"><img src="' + c.foto + '" alt=""></div>' +
    '<p class="credito">Imagem gerada, sem equipe, marca ou patrocinador real.</p>' +
    '<div class="moldura"><h1 class="cat-nome">' + esc(c.nome) + '</h1>' +
    '<p class="cat-frase">' + esc(c.frase) + '</p>' +
    '<div class="cat-rodape"><div><p class="cat-intro">' + esc(c.intro) + '</p>' + (c.guia === false ? '' : '<a class="cat-guia" href="guia-' + c.slug + '.html">Novo por aqui? Veja como funciona ' + (/^(Fórmula|Stock|Porsche|NASCAR|IndyCar|MotoGP)/.test(c.nome) ? 'a ' : 'o ') + esc(c.nome) + '</a>') + '</div>' +
    '<div class="cat-lider"><span>Na ponta</span><b>' + esc(c.lider.nome) + '</b><small>' + esc(c.lider.info) + '</small></div></div></div>';
  var img = document.querySelector('.cat-foto img');
  function mostrar() { img.classList.add('pronta'); }
  if (img.complete) mostrar(); else img.addEventListener('load', mostrar);

  /* Onde assistir no Brasil (assets/js/onde-assistir-dados.js, carregado aqui) */
  (function () {
    var s = document.createElement('script'); s.src = 'assets/js/onde-assistir-dados.js?v=202';
    s.onload = function () {
      var q = window.ONDE_ASSISTIR && window.ONDE_ASSISTIR.quadro(c.slug); if (!q) return;
      document.getElementById('abas-barra').insertAdjacentHTML('beforebegin', '<div class="moldura"><section class="oa-bloco" id="onde-assistir"><p class="oa-rot">Como assistir</p><h2>Onde assistir no Brasil</h2>' + q + '</section></div>');
    };
    document.body.appendChild(s);
  })();

  /* Próxima etapa */
  var proximaIdx = -1;
  c.calendario.forEach(function (e, i) { if (proximaIdx < 0 && !e.venc && (!e.d || e.d >= hoje)) proximaIdx = i; });

  function tabela(t) {
    return '<div class="tabela-wrap"><table class="tabela"><thead><tr>' + t.colunas.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.linhas.map(function (l) { return '<tr class="p' + esc(l[0]) + '">' + l.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }
  function etapa(e, i) {
    var feita = !!e.venc;
    var cls = feita ? ' feita' : (i === proximaIdx ? ' proxima' : '');
    var status = feita ? 'Encerrada' : (e.d ? (i === proximaIdx ? (window.diasAte(e.d) >= 0 ? window.quando(e.d) : 'Próxima') : (e.d < hoje ? 'Aguardando resultado' : 'Programada')) : 'A confirmar');
    var venc = feita ? 'Vencedor: ' + e.venc : (e.parcial || e.nota || '');
    return '<li class="etapa' + cls + '"><span class="etapa-n">' + ('0' + e.e).slice(-2) + '</span>' +
      '<span class="etapa-nome">' + esc(e.n) + '<small>' + esc(e.l) + '</small></span>' +
      '<span class="etapa-venc">' + esc(venc) + (i === proximaIdx ? window.sessoes(e) : '') + '</span>' +
      '<span class="etapa-data">' + (e.d ? window.dataCurta(e.d) : '') + '<small>' + status + '</small>' + (i === proximaIdx ? window.contagem(e) : '') + '</span></li>';
  }

  /* Pontos por piloto, a partir da classificação */
  var pontos = {};
  c.classificacao.linhas.forEach(function (l) { pontos[l[1]] = { pos: l[0], pts: l[l.length - 1] }; });

  var P = {};
  /* notícias da categoria: as da página de Notícias (noticias-gerais.js, atualizadas todo dia) + as fixas de dados.js,
     sem repetir título, da mais nova para a mais antiga */
  var en = window.LANG === 'en', vistas = {}, lista = [];
  (window.NOTICIAS_GERAIS || []).filter(function (n) { return n.cat === c.slug; }).concat(c.noticias || []).forEach(function (n, i) {
    var chave = n.t.toLowerCase();
    if (vistas[chave]) return;
    vistas[chave] = 1;
    lista.push({ d: n.d, t: (en && n.t_en) || n.t, x: (en && n.x_en) || n.x, ordem: i });
  });
  lista.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : a.ordem - b.ordem; });
  lista = lista.slice(0, 8);
  P.noticias = '<h2>Notícias</h2><div class="noticias">' + lista.map(function (n, i) {
    return '<article class="noticia">' +
      '<time datetime="' + n.d + '">' + window.dataCurta(n.d) + '</time><h3>' + esc(n.t) + '</h3><p>' + esc(n.x) + '</p></article>';
  }).join('') + '</div>';

  var feitas = c.calendario.filter(function (e) { return e.venc || e.parcial; }).slice().reverse();
  P.resultados = (c.destaque ? '<h2>' + esc(c.destaque.titulo) + '</h2>' + tabela(c.destaque) + '<h3>Vencedores da temporada</h3>' : '<h2>Vencedores da temporada</h2>') +
    '<ul class="etapas">' + feitas.map(function (e) { return etapa(e, c.calendario.indexOf(e)); }).join('') + '</ul>';

  var cl = c.classificacao;
  P.classificacao = '<h2>Classificação</h2>' + (cl.extra
    ? '<div class="duas-tabelas"><div><h3 style="margin-top:0">' + esc(cl.titulo) + '</h3>' + tabela(cl) + '</div><div><h3 style="margin-top:0">' + esc(cl.extra.titulo) + '</h3>' + tabela(cl.extra) + '</div></div>'
    : '<h3 style="margin-top:0">' + esc(cl.titulo) + '</h3>' + tabela(cl)) + (cl.nota ? '<p class="nota">' + esc(cl.nota) + '</p>' : '');

  P.calendario = '<h2>Calendário</h2><ul class="etapas">' + c.calendario.map(etapa).join('') + '</ul>';


  var lista = [];
  c.equipes.forEach(function (eq) { eq.p.forEach(function (p) { lista.push({ n: p, eq: eq.n }); }); });
  cl.linhas.forEach(function (l) {
    if (!lista.some(function (x) { return x.n === l[1]; })) lista.push({ n: l[1], eq: l.length > 3 ? l[2] : '' });
  });
  lista.sort(function (a, b) {
    var pa = pontos[a.n] ? +pontos[a.n].pos : 999, pb = pontos[b.n] ? +pontos[b.n].pos : 999;
    return pa - pb;
  });
  P.pilotos = '<h2>Pilotos</h2><div class="pilotos">' + lista.map(function (p) {
    var k = pontos[p.n];
    return '<div class="piloto' + (k && k.pos === '1' ? ' lider' : '') + '"><div><b>' + esc(p.n) + '</b><span>' + esc(p.eq) + '</span></div>' + (k ? '<em>P' + esc(k.pos) + '</em>' : '') + '</div>';
  }).join('') + '</div>';

  P.equipes = '<h2>Equipes</h2><ul class="equipes">' + c.equipes.map(function (eq) {
    return '<li class="equipe"><div><h3>' + esc(eq.n) + '</h3>' + (eq.i ? '<small>' + esc(eq.i) + '</small>' : '') + '</div><p>' + esc(eq.p.join(', ')) + '</p></li>';
  }).join('') + '</ul>';

  /* Abas */
  var abas = document.getElementById('abas'), paineis = document.getElementById('paineis');
  abas.innerHTML = window.SECOES.map(function (s) {
    return '<li role="presentation"><button class="aba" role="tab" id="aba-' + s[0] + '" aria-controls="p-' + s[0] + '" aria-selected="false" tabindex="-1">' + s[1] + '</button></li>';
  }).join('');
  paineis.innerHTML = window.SECOES.map(function (s) {
    return '<section class="painel-aba" role="tabpanel" id="p-' + s[0] + '" aria-labelledby="aba-' + s[0] + '" hidden>' + P[s[0]] + '</section>';
  }).join('') + '<p class="atualizado">Dados atualizados em ' + esc(window.ATUALIZADO) + '. Fontes: sites oficiais das categorias, imprensa especializada e Wikipédia.</p>';

  var botoes = [].slice.call(abas.querySelectorAll('.aba'));
  function abrir(id, rolar) {
    var ok = window.SECOES.some(function (s) { return s[0] === id; });
    if (!ok) id = 'noticias';
    botoes.forEach(function (b) {
      var sim = b.id === 'aba-' + id;
      b.setAttribute('aria-selected', sim); b.tabIndex = sim ? 0 : -1;
      if (sim) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    [].forEach.call(paineis.querySelectorAll('.painel-aba'), function (p) { p.hidden = p.id !== 'p-' + id; });
    if (rolar) {
      var y = document.getElementById('abas-barra').getBoundingClientRect().top + window.scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--topo'), 10);
      window.scrollTo({ top: y, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }
  botoes.forEach(function (b, i) {
    b.addEventListener('click', function () {
      var id = b.id.slice(4);
      history.replaceState(null, '', '#' + id);
      abrir(id, true);
    });
    b.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!n) return;
      var alvo = botoes[(i + n + botoes.length) % botoes.length];
      alvo.focus(); alvo.click();
    });
  });
  function peloHash(rolar) { abrir(location.hash.slice(1), rolar); }
  window.addEventListener('hashchange', function () { peloHash(true); });
  peloHash(!!location.hash);
})();
