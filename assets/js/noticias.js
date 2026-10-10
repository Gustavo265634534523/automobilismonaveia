/* Página de Notícias: junta as notícias gerais (noticias-gerais.js) com as notícias de cada categoria (dados.js).
   A cada 5 minutos a página busca os dois arquivos de novo e, se algo mudou, redesenha sozinha (sem recarregar). */
(function () {
  var esc = window.esc;
  var CATS, PORSLUG, todas, manchetes, catAtual = '';
  var filtros = document.getElementById('filtros');
  var lista = document.getElementById('lista');

  /* Foto de cada notícia. Na Fórmula 1 usa o carro gerado da abertura (sem equipe, marca ou patrocínio),
     alternando três ângulos para as notícias não ficarem todas iguais. */
  var F1_SEM_MARCA = [
    { src: 'assets/img/hero-1-lado-m.webp', pos: '50% 55%' },
    { src: 'assets/img/cat/f1.jpg', pos: '70% 55%' },
    { src: 'assets/img/hero-3-frente-m.webp', pos: '55% 60%' },
    { src: 'assets/img/hero-2-motor-m.webp', pos: '60% 55%' }
  ];
  var contaF1 = 0;
  function foto(slug, extra) {
    if (slug === 'formula-1') {
      var f = F1_SEM_MARCA[contaF1++ % F1_SEM_MARCA.length];
      return '<img src="' + f.src + '" alt="" style="object-position:' + f.pos + '" ' + extra + '>';
    }
    return '<img src="' + PORSLUG[slug].foto + '" alt="" ' + extra + '>';
  }

  function selo(slug) {
    return '<a class="nt-selo" href="' + slug + '.html">' + esc(PORSLUG[slug].nome) + '</a>';
  }
  function dataLonga(iso) {
    var n = window.diasAte(iso);
    if (n === 0) return 'Hoje';
    if (n === -1) return 'Ontem';
    return window.dataCurta(iso);
  }
  function horaDe(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var dia = window.diasAte(iso.slice(0, 10));
    return (dia === 0 ? 'hoje' : dia === -1 ? 'ontem' : window.dataCurta(iso.slice(0, 10))) + ' às ' + ('0' + d.getHours()).slice(-2) + 'h' + ('0' + d.getMinutes()).slice(-2);
  }

  function montar() {
    CATS = window.CATEGORIAS || [];
    PORSLUG = {}; CATS.forEach(function (c) { PORSLUG[c.slug] = c; });

    /* Junta tudo, tira repetidas (mesmo título) e ordena da mais nova para a mais antiga */
    todas = [];
    var vistos = {};
    function add(n, slug) {
      var chave = n.t.toLowerCase();
      if (vistos[chave] || !PORSLUG[slug]) return;
      vistos[chave] = 1;
      var en = window.LANG === 'en';
      todas.push({ d: n.d, cat: slug, t: (en && n.t_en) || n.t, x: (en && n.x_en) || n.x, manchete: !!n.manchete, ordem: todas.length });
    }
    (window.NOTICIAS_GERAIS || []).forEach(function (n) { add(n, n.cat); });
    CATS.forEach(function (c) { (c.noticias || []).forEach(function (n) { add(n, c.slug); }); });
    todas.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : a.ordem - b.ordem; });

    var at = document.getElementById('nt-atualizado');
    if (at) at.textContent = window.NOTICIAS_ATUALIZADO ? 'Atualizado ' + horaDe(window.NOTICIAS_ATUALIZADO) + '.' : 'Atualizado em ' + window.ATUALIZADO + '.';

    /* Manchetes na ordem em que aparecem em noticias-gerais.js: a primeira grande, as outras ao lado */
    manchetes = todas.filter(function (n) { return n.manchete; }).sort(function (a, b) { return a.ordem - b.ordem; }).slice(0, 3);
    if (manchetes.length < 3) manchetes = manchetes.concat(todas.filter(function (n) { return manchetes.indexOf(n) < 0; }).slice(0, 3 - manchetes.length));
    document.getElementById('manchetes').innerHTML = manchetes.map(function (n, i) {
      var c = PORSLUG[n.cat];
      return '<article class="nt-manchete' + (i === 0 ? ' nt-principal' : '') + '">' +
        '<div class="nt-img">' + foto(n.cat, i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + '</div>' +
        '<div class="nt-texto">' + selo(n.cat) + '<time datetime="' + n.d + '">' + dataLonga(n.d) + '</time>' +
        '<h2>' + esc(n.t) + '</h2><p>' + esc(n.x) + '</p></div></article>';
    }).join('');

    /* Filtros por categoria (só as que têm notícia) */
    var comNoticia = CATS.filter(function (c) { return todas.some(function (n) { return n.cat === c.slug; }); });
    if (catAtual && !PORSLUG[catAtual]) catAtual = '';
    filtros.innerHTML = '<button type="button" class="nt-filtro" aria-pressed="' + !catAtual + '" data-cat="">Todas</button>' +
      comNoticia.map(function (c) { return '<button type="button" class="nt-filtro" aria-pressed="' + (c.slug === catAtual) + '" data-cat="' + c.slug + '">' + esc(c.nome) + '</button>'; }).join('');
    desenhar();

    /* Fique de olho */
    var proximos = (window.PROXIMOS_DESTAQUES || []).filter(function (p) { return window.diasAte(p.d) >= 0 && PORSLUG[p.cat]; })
      .sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    document.getElementById('olho').innerHTML = proximos.length ? proximos.map(function (p) {
      return '<li><span class="nt-olho-data">' + window.dataCurta(p.d) + '<small>' + window.quando(p.d) + '</small></span>' +
        '<div>' + selo(p.cat) + '<b>' + esc((window.LANG === 'en' && p.t_en) || p.t) + '</b><p>' + esc((window.LANG === 'en' && p.x_en) || p.x) + '</p></div></li>';
    }).join('') : '<li><p>Sem destaques marcados para os próximos dias.</p></li>';

    /* Líderes de cada categoria */
    document.getElementById('lideres').innerHTML = CATS.map(function (c) {
      return '<li><a href="' + c.slug + '.html#classificacao"><span>' + esc(c.nome) + '</span><b>' + esc(c.lider.nome) + '</b><small>' + esc(c.lider.info) + '</small></a></li>';
    }).join('');
  }

  /* código curto e fixo de cada notícia (para as reações): data + título */
  function codigo(n) { var h = 5381, t = n.d + n.t; for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) >>> 0; return h.toString(36); }
  function desenhar() {
    var itens = todas.filter(function (n) { return !catAtual || n.cat === catAtual; });
    if (!catAtual) itens = itens.filter(function (n) { return manchetes.indexOf(n) < 0; });
    var html = '', diaAtual = '';
    itens.forEach(function (n) {
      if (n.d !== diaAtual) {
        if (diaAtual) html += '</div>';
        diaAtual = n.d;
        html += '<h3 class="nt-dia"><time datetime="' + n.d + '">' + dataLonga(n.d) + '</time></h3><div class="nt-grupo">';
      }
      html += '<article class="nt-item"><div class="nt-item-img">' + foto(n.cat, 'loading="lazy"') + '</div>' +
        '<div>' + selo(n.cat) + '<h4>' + esc(n.t) + '</h4><p>' + esc(n.x) + '</p><div class="reacoes" data-alvo="n:' + codigo(n) + '"></div></div></article>';
    });
    if (diaAtual) html += '</div>';
    lista.innerHTML = html || '<p class="nota">Nenhuma notícia nessa categoria por enquanto.</p>';
    if (window.NAVEIA_REACOES) window.NAVEIA_REACOES(lista); /* 🔥 😂 😱 🏁 (chat.js; se ainda não carregou, ele mesmo preenche) */
  }

  filtros.addEventListener('click', function (e) {
    var b = e.target.closest('.nt-filtro');
    if (!b) return;
    catAtual = b.getAttribute('data-cat');
    [].forEach.call(filtros.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    desenhar();
  });

  catAtual = (location.hash || '').slice(1);
  montar();

  /* Atualização automática */
  function assinatura() {
    return JSON.stringify([window.NOTICIAS_ATUALIZADO, window.NOTICIAS_GERAIS, window.PROXIMOS_DESTAQUES,
      (window.CATEGORIAS || []).map(function (c) { return [c.noticias, c.lider]; })]);
  }
  function carregar(src) {
    return new Promise(function (ok, erro) {
      var s = document.createElement('script');
      s.src = src + '?t=' + Date.now();
      s.onload = function () { s.remove(); ok(); };
      s.onerror = function () { s.remove(); erro(); };
      document.body.appendChild(s);
    });
  }
  var buscando = false;
  function buscarNovidades() {
    if (buscando || document.hidden) return;
    buscando = true;
    var antes = assinatura();
    carregar('assets/js/dados.js').then(function () { return carregar('assets/js/noticias-gerais.js'); }).then(function () {
      if (assinatura() !== antes) { montar(); avisar(); }
    }).catch(function () {}).then(function () { buscando = false; });
  }
  function avisar() {
    var a = document.createElement('div');
    a.className = 'nt-aviso'; a.setAttribute('role', 'status');
    a.textContent = 'Notícias atualizadas';
    document.body.appendChild(a);
    setTimeout(function () { a.classList.add('sai'); }, 3500);
    setTimeout(function () { a.remove(); }, 4200);
  }
  setInterval(buscarNovidades, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) buscarNovidades(); });
})();
