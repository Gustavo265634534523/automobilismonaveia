/* Basquete: faixa de placar (estilo NBA.com), jogador em destaque (ficha com número grande e médias),
   notícias e mercado do basquete. Usado na página de Basquete (#bq-*) e, em versão curta, na página inicial (#bq-home).
   Dados: esportes-dados.js (jogos e JOGADORES_DESTAQUE) e noticias-esportes.js. */
(function () {
  var esc = window.esc, hoje = window.hojeISO();
  var COMPS = (window.COMPETICOES || []).filter(function (c) { return c.esporte === 'basquete'; });
  var J = window.JOGADORES_DESTAQUE || [];
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  function idade(n) { var h = new Date(hoje + 'T12:00:00'), b = new Date(n + 'T12:00:00'), a = h.getFullYear() - b.getFullYear(); if (h.getMonth() < b.getMonth() || (h.getMonth() === b.getMonth() && h.getDate() < b.getDate())) a--; return a; }
  function dataLonga(d) { var p = d.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  /* o sobrenome vai na segunda linha, como numa camisa */
  function nomeDuasLinhas(n) { var p = n.split(' '); return p.length > 1 ? esc(p[0]) + '<br>' + esc(p.slice(1).join(' ')) : esc(n); }

  /* imagem do basquete atrás do número da camisa */
  function foto() { return ''; } /* sem imagem: o número da camisa é o destaque */
  /* ficha do jogador; "curta" = versão da página inicial */
  function ficha(j, curta) {
    var temporadas = 2026 - (+j.estreia) + 1;
    return '<article class="bq-ficha' + (curta ? ' bq-curta' : '') + '" style="--time:' + j.cor + ';--time2:' + j.cor2 + '">' +
      '<span class="bq-fundo-nome" aria-hidden="true">' + esc(j.time.split(' ').pop()) + '</span>' +
      '<div class="bq-ficha-esq"><span class="bq-rot">Jogador em destaque</span><h3>' + nomeDuasLinhas(j.nome) + '</h3>' +
        '<p class="bq-time"><i aria-hidden="true"></i>' + esc(j.time) + '</p>' +
        '<dl class="bq-medidas"><div><dt>Altura</dt><dd>' + esc(j.altura) + '</dd></div><div><dt>Peso</dt><dd>' + esc(j.peso) + '</dd></div><div><dt>Posição</dt><dd>' + esc(j.pos) + '</dd></div></dl></div>' +
      '<div class="bq-num' + (foto(j) ? ' com-foto' : '') + '" aria-label="Camisa ' + esc(j.num) + '">' + foto(j) + '<span><small>#</small>' + esc(j.num) + '</span></div>' +
      (curta ? '' : '<div class="bq-ficha-dir"><div class="bq-prox"><span>Próximo jogo</span><b>' + esc(j.proximo.txt) + '</b><small>' + quando(j.proximo.d) + (j.proximo.h ? ' · ' + esc(j.proximo.h) : '') + '</small></div>' +
        '<dl class="bq-dados"><div><dt>Nascimento</dt><dd>' + dataLonga(j.nasc) + '</dd></div><div><dt>Idade</dt><dd>' + idade(j.nasc) + ' anos</dd></div><div><dt>De</dt><dd>' + esc(j.de) + '</dd></div>' +
        '<div><dt>Estreia na NBA</dt><dd>' + esc(j.estreia) + '</dd></div><div><dt>Temporada</dt><dd>' + temporadas + 'ª</dd></div><div><dt>Antes</dt><dd>' + esc(j.antes) + '</dd></div></dl></div>') +
      '<div class="bq-stats"><div><span>Pontos por jogo</span><b>' + esc(j.pts) + '</b></div><div><span>Rebotes por jogo</span><b>' + esc(j.reb) + '</b></div><div><span>Assistências por jogo</span><b>' + esc(j.ast) + '</b></div></div>' +
      '<p class="bq-nota">' + esc(j.temporada) + '. ' + esc(j.nota) + '</p></article>';
  }
  function destaque(alvo, curta) {
    if (!alvo || !J.length) return;
    var atual = 0;
    function pintar() {
      alvo.innerHTML = (J.length > 1 ? '<div class="bq-troca" role="group" aria-label="Escolha o jogador">' + J.map(function (j, i) {
        return '<button type="button" aria-pressed="' + (i === atual) + '" data-i="' + i + '">' + esc(j.nome) + '</button>';
      }).join('') + '</div>' : '') + ficha(J[atual], curta);
      [].forEach.call(alvo.querySelectorAll('.bq-troca button'), function (b) { b.addEventListener('click', function () { atual = +b.getAttribute('data-i'); pintar(); }); });
    }
    pintar();
  }
  destaque(document.getElementById('bq-home'), true);

  if (!document.getElementById('bq-destaque')) return;
  destaque(document.getElementById('bq-destaque'), false);

  /* faixa de placar: resultados recentes e próximos jogos de NBA, NBB e Euroleague */
  var jogos = [];
  COMPS.forEach(function (c) { (c.jogos || []).forEach(function (j) { if (j.d && (j.p || j.d >= hoje)) jogos.push({ c: c, j: j }); }); });
  jogos.sort(function (a, b) { return (a.j.d + (a.j.h || '')) < (b.j.d + (b.j.h || '')) ? -1 : 1; });
  var faixa = document.getElementById('bq-placar');
  if (faixa) faixa.innerHTML = jogos.length ? jogos.map(function (x) {
    var j = x.j, pl = j.p ? j.p.split(' x ') : null;
    return '<a class="bq-jogo" href="' + x.c.slug + '.html"><small>' + esc(x.c.menu) + ' · ' + (pl ? 'Final' : quando(j.d) + (j.h ? ' ' + esc(j.h) : '')) + '</small>' +
      '<span><b>' + (window.escudoTime ? window.escudoTime(j.fora) : '') + esc(j.fora) + '</b><em>' + (pl ? esc(pl[1]) : '') + '</em></span><span><b>' + (window.escudoTime ? window.escudoTime(j.casa) : '') + esc(j.casa) + '</b><em>' + (pl ? esc(pl[0]) : '') + '</em></span></a>';
  }).join('') : '<p class="bq-vazio">Os próximos jogos aparecem aqui assim que forem confirmados.</p>';

  /* notícias do basquete */
  var nots = (window.NOTICIAS_ESPORTES || []).filter(function (n) { return n.esporte === 'basquete'; }).sort(function (a, b) { return a.d < b.d ? 1 : -1; });
  var cesta = (window.ESPORTES_ICONE || {}).basquete || '';
  var bn = document.getElementById('bq-noticias');
  if (bn) bn.innerHTML = nots.map(function (n) {
    var c = (window.COMPETICOES || []).filter(function (x) { return x.slug === n.comp; })[0] || {};
    return '<a class="bq-not bq-not-basquete" href="' + (n.link || (n.comp || 'basquete') + '.html') + '"><span class="bq-not-txt"><small>' + esc(c.menu || 'Basquete') + ' · ' + quando(n.d) + '</small><b>' + esc(n.t) + '</b><span>' + esc(n.x) + '</span></span></a>';
  }).join('');

  /* mercado do basquete */
  var bm = document.getElementById('bq-mercado');
  var M = (window.MERCADO || []).filter(function (m) { return m.esporte === 'basquete'; });
  if (bm) bm.innerHTML = M.map(function (m) {
    return '<div class="bq-troca-card"><b>' + esc(m.nome) + '</b><span class="hm-rota"><span>' + esc(m.de) + '</span><i aria-hidden="true">→</i><em>' + esc(m.para) + '</em></span><small>' + esc(m.nota || '') + '</small></div>';
  }).join('');
})();
