/* Entrada da página inicial, estilo revista:
   1. a manchete principal com foto grande (noticias-gerais.js, a mais recente com "manchete: true");
   2. ao lado, as últimas notícias com foto;
   3. faixa com as categorias em foto, por grupo, com um ponto em quem corre nos próximos 7 dias;
   4. brigas pelo título (campeonatos em aberto, ordenados pela diferença entre 1º e 2º).
   Tudo sai de dados.js e noticias-gerais.js, então se atualiza sozinho. */
(function () {
  var sec = document.getElementById('entrada');
  if (!sec || !window.CATEGORIAS) return;
  var esc = window.esc, CATS = window.CATEGORIAS, GRUPOS = window.GRUPOS || [], PORSLUG = {};
  CATS.forEach(function (c) { PORSLUG[c.slug] = c; });
  var hoje = window.hojeISO ? window.hojeISO() : new Date().toISOString().slice(0, 10);
  var daqui7 = new Date(Date.parse(hoje + 'T12:00:00') + 7 * 864e5).toISOString().slice(0, 10);
  function dataEtapa(e) { var s = (e.s || []).map(function (x) { return x.d; }).sort(); return { ini: s[0] || e.d, fim: e.d || s[s.length - 1] }; }
  function proxima(c) { return c.calendario.filter(function (e) { return !e.venc && e.d && e.d >= hoje; })[0] || null; }
  function correSemana(c) { var e = proxima(c); if (!e) return null; return dataEtapa(e).ini <= daqui7 ? e : null; }

  /* 1 e 2. manchete e últimas notícias */
  var F1_FOTOS = ['assets/img/hero-1-lado-m.webp', 'assets/img/hero-3-frente-m.webp', 'assets/img/cat/f1.jpg', 'assets/img/hero-2-motor-m.webp'], nF1 = 0;
  function foto(slug) { return slug === 'formula-1' ? F1_FOTOS[nF1++ % F1_FOTOS.length] : (PORSLUG[slug] ? PORSLUG[slug].foto : 'assets/img/cat/f1.jpg'); }
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  var en = window.LANG === 'en';
  var todas = (window.NOTICIAS_GERAIS || []).filter(function (n) { return PORSLUG[n.cat]; }).slice()
    .sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
  var capa = todas.filter(function (n) { return n.manchete; })[0] || todas[0];
  if (capa) {
    var c = PORSLUG[capa.cat], t = (en && capa.t_en) || capa.t, x = (en && capa.x_en) || capa.x;
    var el = document.getElementById('rv-capa');
    el.href = 'noticias.html';
    el.innerHTML = '<img src="' + foto(capa.cat) + '" alt="" fetchpriority="high">' +
      '<span class="rv-capa-txt"><small>' + esc(c.menu || c.nome) + ' · ' + esc(quando(capa.d)) + '</small><b>' + esc(t) + '</b><span>' + esc(x.split(/(?<=\.)\s/)[0]) + '</span></span>';
  }
  document.getElementById('rv-lista').innerHTML = todas.filter(function (n) { return n !== capa; }).slice(0, 5).map(function (n) {
    var c = PORSLUG[n.cat];
    return '<a class="rv-item" href="' + c.slug + '.html"><img src="' + foto(n.cat) + '" alt="" loading="lazy"><span><small>' + esc(c.menu || c.nome) + ' · ' + esc(quando(n.d)) + '</small><b>' + esc((en && n.t_en) || n.t) + '</b></span></a>';
  }).join('');

  /* 3. categorias em foto, na ordem dos grupos */
  var ordem = []; GRUPOS.forEach(function (g) { g.cats.forEach(function (c) { ordem.push(c); }); });
  if (!ordem.length) ordem = CATS;
  document.getElementById('entrada-cats').innerHTML = ordem.map(function (c) {
    return '<a class="rv-cat" href="' + c.slug + '.html"><img src="' + c.foto + '" alt="" loading="lazy"><b>' + esc(c.menu || c.nome) + '</b>' +
      (correSemana(c) ? '<i class="ent-ponto" title="Corre nos próximos dias"></i>' : '') + '</a>';
  }).join('');

  /* 4. brigas pelo título: campeonatos em aberto, ordenados pela diferença entre 1º e 2º */
  function num(v) { var n = parseFloat(String(v).replace(/\./g, '').replace(',', '.')); return isNaN(n) ? null : n; }
  var brigas = CATS.map(function (c) {
    var l = c.classificacao && c.classificacao.linhas, restam = c.calendario.filter(function (e) { return !e.venc; }).length;
    if (!l || l.length < 2 || c.classificacao.colunas.indexOf('Pts') < 0 || !restam || /campe[aã]o/i.test((c.lider && c.lider.info) || '')) return null;
    var p1 = num(l[0][l[0].length - 1]), p2 = num(l[1][l[1].length - 1]);
    if (p1 == null || p2 == null || !p1) return null;
    return { c: c, a: l[0][1], b: l[1][1], p1: p1, p2: p2, dif: p1 - p2, restam: restam, peso: (p1 - p2) / p1 };
  }).filter(Boolean).sort(function (x, y) { return x.peso - y.peso; }).slice(0, 4);
  function curto(n) { var p = String(n).split(/\s+/); return p.length > 1 && !/,| e /.test(n) ? p[p.length - 1] : n; }
  function fmt(n) { return n.toLocaleString('pt-BR'); }
  document.getElementById('entrada-brigas').innerHTML = '<p class="ent-rot">Brigas pelo título <span>Ainda em aberto</span></p><div class="ent-brigas">' +
    brigas.map(function (x) {
      return '<a class="ent-briga" href="' + x.c.slug + '.html#classificacao"><b class="ent-briga-cat">' + esc(x.c.menu || x.c.nome) + '</b>' +
        '<span class="ent-linha"><i>1</i><em>' + esc(curto(x.a)) + '</em><strong>' + fmt(x.p1) + '</strong></span>' +
        '<span class="ent-linha"><i>2</i><em>' + esc(curto(x.b)) + '</em><strong>' + fmt(x.p2) + '</strong></span>' +
        '<small><b>' + fmt(x.dif) + ' ' + (x.dif === 1 ? 'ponto' : 'pontos') + ' de diferença</b> · faltam ' + x.restam + ' ' + (x.restam === 1 ? 'etapa' : 'etapas') + '</small></a>';
    }).join('') + '</div>';
})();
