/* Entrada da página inicial: uma tela só, sem prender a rolagem.
   À esquerda, as 12 categorias em botões (por grupo), com um ponto em quem corre nos próximos 7 dias.
   À direita, as brigas pelo título mais apertadas (1º x 2º). Embaixo, quem corre nesta semana.
   Tudo sai de dados.js, então se atualiza sozinho junto com os resultados. */
(function () {
  var sec = document.getElementById('entrada');
  if (!sec || !window.CATEGORIAS) return;
  var esc = window.esc, CATS = window.CATEGORIAS, GRUPOS = window.GRUPOS || [];
  var hoje = window.hojeISO ? window.hojeISO() : new Date().toISOString().slice(0, 10);
  var daqui7 = new Date(Date.parse(hoje + 'T12:00:00') + 7 * 864e5).toISOString().slice(0, 10);
  function pagina(c) { return c.slug + '.html'; }
  function dataEtapa(e) { var s = (e.s || []).map(function (x) { return x.d; }).sort(); return { ini: s[0] || e.d, fim: e.d || s[s.length - 1] }; }
  function proxima(c) { return c.calendario.filter(function (e) { return !e.venc && e.d && e.d >= hoje; })[0] || null; }
  function correSemana(c) { var e = proxima(c); if (!e) return null; var d = dataEtapa(e); return d.ini <= daqui7 ? e : null; }

  /* 1. categorias por grupo */
  document.getElementById('entrada-cats').innerHTML = GRUPOS.map(function (g) {
    return '<div class="ent-grupo"><span class="ent-grupo-nome">' + esc(g.nome) + '</span><div class="ent-chips">' +
      g.cats.map(function (c) {
        return '<a class="ent-chip" href="' + pagina(c) + '">' + esc(c.menu || c.nome) + (correSemana(c) ? '<i class="ent-ponto" title="Corre nos próximos dias"></i>' : '') + '</a>';
      }).join('') + '</div></div>';
  }).join('');

  /* 2. brigas pelo título: campeonatos em aberto, ordenados pela diferença entre 1º e 2º */
  function num(v) { var n = parseFloat(String(v).replace(/\./g, '').replace(',', '.')); return isNaN(n) ? null : n; }
  var brigas = CATS.map(function (c) {
    var l = c.classificacao && c.classificacao.linhas, restam = c.calendario.filter(function (e) { return !e.venc; }).length;
    if (!l || l.length < 2 || !restam || /campe[aã]o/i.test((c.lider && c.lider.info) || '')) return null;
    var p1 = num(l[0][l[0].length - 1]), p2 = num(l[1][l[1].length - 1]);
    if (p1 == null || p2 == null || !p1) return null;
    return { c: c, a: l[0][1], b: l[1][1], p1: p1, p2: p2, dif: p1 - p2, restam: restam, peso: (p1 - p2) / p1 };
  }).filter(Boolean).sort(function (x, y) { return x.peso - y.peso; }).slice(0, 4);
  function curto(n) { var p = String(n).split(/\s+/); return p.length > 1 && !/,| e /.test(n) ? p[p.length - 1] : n; }
  function fmt(n) { return n.toLocaleString('pt-BR'); }
  document.getElementById('entrada-brigas').innerHTML = '<p class="ent-rot">Brigas pelo título <span>Ainda em aberto</span></p><div class="ent-brigas">' +
    brigas.map(function (x) {
      return '<a class="ent-briga" href="' + pagina(x.c) + '#classificacao"><b class="ent-briga-cat">' + esc(x.c.menu || x.c.nome) + '</b>' +
        '<span class="ent-linha"><i>1</i><em>' + esc(curto(x.a)) + '</em><strong>' + fmt(x.p1) + '</strong></span>' +
        '<span class="ent-linha"><i>2</i><em>' + esc(curto(x.b)) + '</em><strong>' + fmt(x.p2) + '</strong></span>' +
        '<small><b>' + fmt(x.dif) + ' ' + (x.dif === 1 ? 'ponto' : 'pontos') + ' de diferença</b> · faltam ' + x.restam + ' ' + (x.restam === 1 ? 'etapa' : 'etapas') + '</small></a>';
    }).join('') + '</div>';

  /* 3. correm esta semana */
  var semana = CATS.map(function (c) { var e = correSemana(c); return e ? { c: c, e: e, d: dataEtapa(e) } : null; })
    .filter(Boolean).sort(function (x, y) { return x.d.fim < y.d.fim ? -1 : 1; });
  var MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function dia(iso) { var p = iso.split('-'); return +p[2] + ' ' + MES[+p[1] - 1]; }
  document.getElementById('entrada-semana').innerHTML = '<div class="ent-semana-cab"><b>Correm esta semana</b><a href="#conteudo">Ver horários →</a></div>' +
    (semana.length ? '<div class="ent-semana-lista">' + semana.map(function (x) {
      return '<a class="ent-evento" href="' + pagina(x.c) + '#calendario"><span>' + esc(x.c.menu || x.c.nome) + '</span><b>' + esc(x.e.n) + '</b><small>' + dia(x.d.fim) + ' · ' + esc(x.e.l) + '</small></a>';
    }).join('') + '</div>' : '<p class="ent-vazio">Nenhuma corrida nos próximos 7 dias.</p>');

  /* fundo: os 3 carros trocam sozinhos, devagar (sem depender da rolagem) */
  var fotos = [].slice.call(sec.querySelectorAll('.ent-foto')), i = 0;
  if (fotos.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(function () { fotos[i].classList.remove('ativa'); i = (i + 1) % fotos.length; fotos[i].classList.add('ativa'); }, 5000);
  }
})();
