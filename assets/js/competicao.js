/* Futebol e basquete (dados em esportes-dados.js). Usado em três lugares:
   - página de um campeonato (body data-comp): topo, abas Jogos e Classificação ou Confrontos;
   - página do esporte (body data-esporte-hub): cartões de todos os campeonatos;
   - página inicial (#esportes-home): cartões dos dois esportes. */
(function () {
  var COMPS = window.COMPETICOES || [], ESP = window.ESPORTES || [], esc = window.esc;
  /* imagem do esporte (IMG_ESPORTE, em assets/dados/fotos-reais.js): bola de futebol ou cesta de basquete;
     sem ela, a arte do esporte (gramado ou quadra). Usado também por capa.js e basquete.js. */
  window.fotoEsporte = function (n, grande, classe) {
    var f = (window.IMG_ESPORTE || {})[n.esporte || 'futebol'];
    if (f) return '<img' + (classe ? ' class="' + classe + '"' : '') + ' src="' + (grande ? f.grande : f.src) + '" alt="" loading="' + (grande ? 'eager' : 'lazy') + '">';
    return '<span class="hm-arte hm-' + (n.esporte || 'futebol') + (classe ? ' ' + classe : '') + '" aria-hidden="true">' + ((window.ESPORTES_ICONE || {})[n.esporte] || '') + '</span>';
  };
  var hoje = window.hojeISO();
  var PORSLUG = {}; COMPS.forEach(function (c) { PORSLUG[c.slug] = c; });
  var ICONE = {
    futebol: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z"/><path d="M12 3v4.5M16 10.4l4.3-1.3M14.5 15.1l2.6 3.8M9.5 15.1l-2.6 3.8M8 10.4L3.7 9.1"/></svg>',
    basquete: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/><path d="M5.6 5.6a9 9 0 0 1 0 12.8M18.4 5.6a9 9 0 0 0 0 12.8"/></svg>'
  };
  window.ESPORTES_ICONE = ICONE;

  function tabela(t) {
    return '<div class="tabela-wrap"><table class="tabela tabela-comp"><thead><tr>' + t.colunas.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.linhas.map(function (l) { return '<tr class="p' + esc(l[0]) + '">' + l.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }
  /* próximo jogo: o primeiro sem placar, de hoje em diante */
  function proximo(c) { return (c.jogos || []).filter(function (j) { return !j.p && j.d && j.d >= hoje; })[0]; }
  function jogo(j) {
    var status = j.p ? 'Encerrado' : !j.d ? 'Data a confirmar' : j.d < hoje ? 'Aguardando placar' : window.quando(j.d);
    return '<li class="jogo' + (j.p ? ' feito' : '') + '"><span class="jogo-fase">' + esc(j.fase || '') + (j.l ? '<small>' + esc(j.l) + '</small>' : '') + '</span>' +
      '<span class="jogo-times"><b>' + esc(j.casa) + '</b><em>' + (j.p ? esc(j.p) : 'x') + '</em><b>' + esc(j.fora) + '</b></span>' +
      '<span class="jogo-data">' + (j.d ? window.dataCurta(j.d) + (j.h ? ' · ' + esc(j.h) : '') : '') + '<small>' + status + '</small></span></li>';
  }
  function cartao(c) {
    var px = proximo(c);
    return '<a class="comp-cartao" href="' + c.slug + '.html">' + '<span class="comp-reg">' + esc(c.regiao) + ' · ' + esc(c.temporada) + '</span>' +
      '<b>' + esc(c.nome) + '</b><span class="comp-lider"><em>' + esc(c.lider.nome) + '</em>' + esc(c.lider.info) + '</span>' +
      '<span class="comp-prox">' + (px ? 'Próximo: ' + esc(px.casa) + ' x ' + esc(px.fora) + ', ' + window.dataCurta(px.d) : esc(c.fase)) + '</span></a>';
  }
  /* melhores momentos (assets/dados/videos-esportes.js, robô .github/videos-esportes.js): vídeos dos últimos 10 dias.
     Abrem no YouTube, porque vários canais oficiais não deixam tocar o vídeo fora de lá. */
  var VIDS = (window.VIDEOS_ESPORTES || []).filter(function (v) { return v && v.id && Date.now() - Date.parse(v.publicado) < 10 * 864e5; });
  function quandoVideo(p) { var n = window.diasAte(p.slice(0, 10)); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : window.dataCurta(p.slice(0, 10)); }
  function videoCartao(v) {
    return '<a class="vd-cartao" href="https://www.youtube.com/watch?v=' + encodeURIComponent(v.id) + '" target="_blank" rel="noopener" aria-label="Assistir no YouTube: ' + esc(v.titulo) + '">' +
      '<span class="vd-img">' + (window.capaVideo ? window.capaVideo(v.id, 'hqdefault', v.esporte) : '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg" alt="" loading="lazy">') + '<i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></i></span>' +
      '<small>' + esc(v.nome) + ' · ' + esc(quandoVideo(v.publicado)) + '</small><b>' + esc(v.titulo) + '</b></a>';
  }
  /* no máximo "por" vídeos de cada campeonato, para nenhum tomar a vitrine inteira */
  function variados(lista, max, por) {
    var conta = {};
    return lista.filter(function (v) { conta[v.comp] = (conta[v.comp] || 0) + 1; return conta[v.comp] <= por; }).slice(0, max);
  }
  function vitrine(lista, titulo) {
    return lista.length ? '<section class="vd-bloco"><h2>' + titulo + '</h2><div class="vd-grade">' + lista.map(videoCartao).join('') + '</div><p class="vd-nota">Vídeos dos canais oficiais dos campeonatos. Toque para assistir no YouTube.</p></section>' : '';
  }
  /* notícias de futebol e basquete (noticias-esportes.js), da mais nova para a mais antiga */
  function listaNoticias(filtro, max) {
    var ns = (window.NOTICIAS_ESPORTES || []).filter(filtro).sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; }).slice(0, max || 99);
    return ns.map(function (n) {
      var cc = PORSLUG[n.comp] || {};
      return '<a class="bq-not bq-not-' + n.esporte + '" href="' + (n.comp || n.esporte) + '.html">' +
        '<span class="bq-not-txt"><small>' + esc(cc.menu || cc.nome || '') + ' · ' + esc(quandoVideo(n.d)) + '</small><b>' + esc(n.t) + '</b><span>' + esc(n.x) + '</span></span></a>';
    }).join('');
  }
  function grade(e) {
    return e.grupos.map(function (g) {
      return '<section class="comp-grupo"><h2>' + esc(g.nome) + '</h2><div class="comp-grade">' + g.slugs.map(function (s) { return PORSLUG[s] ? cartao(PORSLUG[s]) : ''; }).join('') + '</div></section>';
    }).join('');
  }

  /* Página inicial: os dois esportes */
  var home = document.getElementById('esportes-home');
  if (home) {
    home.innerHTML = ESP.map(function (e) {
      return '<div class="esp-bloco"><a class="esp-tit" href="' + e.pagina + '">' + ICONE[e.slug] + '<b>' + esc(e.nome) + '</b><span>Ver tudo →</span></a>' +
        '<div class="comp-grade">' + [].concat.apply([], e.grupos.map(function (g) { return g.slugs; })).map(function (s) { return PORSLUG[s] ? cartao(PORSLUG[s]) : ''; }).join('') + '</div></div>';
    }).join('');
  }

  /* Página do esporte */
  var hub = document.body.getAttribute('data-esporte-hub');
  if (hub) {
    var e = ESP.filter(function (x) { return x.slug === hub; })[0];
    var alvo = document.getElementById('comp-hub');
    /* a página de basquete tem as notícias dela (basquete.js); a de futebol ganha a lista aqui */
    var nfut = hub === 'futebol' ? listaNoticias(function (n) { return n.esporte === 'futebol'; }, 12) : '';
    if (e && alvo) alvo.innerHTML = (nfut ? '<section class="vd-bloco"><h2>Notícias</h2><div class="bq-noticias">' + nfut + '</div></section>' : '') + vitrine(variados(VIDS.filter(function (v) { return v.esporte === hub; }), 8, 2), 'Melhores momentos') + grade(e) + '<p class="atualizado">Dados atualizados em ' + esc(window.ESPORTES_ATUALIZADO) + '. Fontes: sites oficiais das competições e imprensa esportiva.</p>';
  }

  /* Página do campeonato */
  var slug = document.body.getAttribute('data-comp');
  var c = PORSLUG[slug];
  if (!c) return;
  var espNome = (ESP.filter(function (x) { return x.slug === c.esporte; })[0] || {}).nome || '';
  document.getElementById('cat-topo').innerHTML =
    ((window.IMG_ESPORTE || {})[c.esporte] ? '<div class="cat-foto"><img class="pronta" src="' + window.IMG_ESPORTE[c.esporte].grande + '" alt=""></div>'
      : '<div class="comp-fundo comp-' + c.esporte + '" aria-hidden="true">' + ICONE[c.esporte] + '</div>') +
    '<div class="moldura"><a class="comp-esporte" href="' + c.esporte + '.html">' + esc(espNome) + ' · ' + esc(c.regiao) + '</a>' +
    '<h1 class="cat-nome">' + esc(c.nome) + '</h1><p class="cat-frase">' + esc(c.frase) + '</p>' +
    '<div class="cat-rodape"><div><p class="cat-intro">' + esc(c.intro) + '</p></div>' +
    '<div class="cat-lider"><span>' + (/^atual (penta|tetra|tri|bi)?campe/i.test(c.lider.info) ? 'Atual campeão' : c.tabela ? 'Na ponta' : 'Agora') + '</span><b>' + esc(c.lider.nome) + '</b><small>' + esc(c.lider.info) + '</small></div></div></div>';

  var P = [];
  var futuros = (c.jogos || []).filter(function (j) { return !j.p; }), feitos = (c.jogos || []).filter(function (j) { return j.p; }).reverse();
  var meus = VIDS.filter(function (v) { return v.comp === c.slug; });
  /* Resumo: o essencial de cada aba, para a página não abrir vazia */
  function mini(t, n) { return { titulo: t.titulo, colunas: t.colunas, linhas: t.linhas.slice(0, n) }; }
  var resumo = [];
  if (futuros.length || feitos.length) resumo.push('<div class="cr-bloco"><h3>' + (futuros.length ? 'Próximos jogos' : 'Últimos resultados') + '</h3><ul class="jogos">' + (futuros.length ? futuros : feitos).slice(0, 4).map(jogo).join('') + '</ul><button type="button" class="cr-mais" data-aba="jogos">Todos os jogos →</button></div>');
  if (c.tabela) resumo.push('<div class="cr-bloco"><h3>' + esc(c.tabela.titulo) + '</h3>' + tabela(mini(c.tabela, 6)) + '<button type="button" class="cr-mais" data-aba="classificacao">Classificação completa →</button></div>');
  else if (c.confrontos) resumo.push('<div class="cr-bloco"><h3>Confrontos</h3><ul class="confrontos">' + c.confrontos.slice(0, 2).map(confronto).join('') + '</ul></div>');
  if (c.destaques) resumo.push('<div class="cr-bloco"><h3>' + esc(c.destaques.titulo) + '</h3>' + tabela(mini(c.destaques, 3)) + '<button type="button" class="cr-mais" data-aba="destaques">Ver todos →</button></div>');
  var nres = listaNoticias(function (n) { return n.comp === c.slug; }, 3);
  if (nres) resumo.push('<div class="cr-bloco cr-largo"><h3>Últimas notícias</h3><div class="bq-noticias">' + nres + '</div></div>');
  if (resumo.length > 1) P.push(['resumo', 'Resumo', '<h2>Resumo</h2><div class="cr-grade">' + resumo.join('') + '</div>']);

  var nots = listaNoticias(function (n) { return n.comp === c.slug; });
  if (nots) P.push(['noticias', 'Notícias', '<h2>Notícias</h2><div class="bq-noticias">' + nots + '</div>']);
  if (meus.length) P.push(['videos', 'Vídeos', '<h2>Melhores momentos</h2><div class="vd-grade">' + meus.map(videoCartao).join('') + '</div><p class="vd-nota">Vídeos do canal oficial no YouTube.</p>']);
  P.push(['jogos', 'Jogos', '<h2>Jogos · ' + esc(c.fase) + '</h2>' +
    (futuros.length ? '<h3 style="margin-top:0">Próximos jogos</h3><ul class="jogos">' + futuros.map(jogo).join('') + '</ul>' : '') +
    (feitos.length ? '<h3' + (futuros.length ? '' : ' style="margin-top:0"') + '>Resultados</h3><ul class="jogos">' + feitos.map(jogo).join('') + '</ul>' : '') +
    (!futuros.length && !feitos.length ? '<p class="nota">Os jogos da rodada entram aqui assim que forem confirmados.</p>' : '') +
    (c.nota ? '<p class="nota">' + esc(c.nota) + '</p>' : '')]);
  function confronto(x) {
    return '<li class="confronto"><span class="jogo-fase">' + esc(x.fase) + '</span><span class="jogo-times"><b>' + esc(x.a) + '</b><em>' + esc(x.ida || 'x') + '</em><b>' + esc(x.b) + '</b></span><span class="confronto-sit">' + esc(x.situacao || '') + '</span></li>';
  }
  if (c.confrontos) P.push(['confrontos', 'Confrontos', '<h2>Confrontos</h2><ul class="confrontos">' + c.confrontos.map(confronto).join('') + '</ul>']);
  function blocoTabela(t, primeiro) { return '<h3' + (primeiro ? ' style="margin-top:0"' : '') + '>' + esc(t.titulo) + '</h3>' + tabela(t) + (t.nota ? '<p class="nota">' + esc(t.nota) + '</p>' : ''); }
  if (c.tabela) P.push(['classificacao', 'Classificação', '<h2>Classificação</h2>' + blocoTabela(c.tabela, true) + (c.tabela2 ? blocoTabela(c.tabela2) : '')]);
  if (c.destaques) P.push(['destaques', c.destaques.aba || (c.esporte === 'futebol' ? 'Artilharia' : 'Destaques'), '<h2>' + esc(c.destaques.titulo) + '</h2>' + tabela(c.destaques) + (c.destaques.nota ? '<p class="nota">' + esc(c.destaques.nota) + '</p>' : '')]);
  if (c.sobre || c.campeoes) P.push(['sobre', 'Sobre', '<h2>Sobre ' + (/^(Copa|Champions|Premier|La |Bundesliga|Serie|Ligue|Euroleague)/.test(c.nome) ? 'a ' : 'o ') + esc(c.nome) + '</h2>' +
    (c.sobre ? '<dl class="cr-fatos">' + c.sobre.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
    (c.campeoes ? '<h3>Últimos campeões</h3>' + tabela({ colunas: c.campeoes[0].length > 2 ? ['Temporada', 'Campeão', 'Vice'] : ['Temporada', 'Campeão'], linhas: c.campeoes }) : '')]);

  var abas = document.getElementById('abas'), paineis = document.getElementById('paineis');
  abas.innerHTML = P.map(function (s) {
    return '<li role="presentation"><button class="aba" role="tab" id="aba-' + s[0] + '" aria-controls="p-' + s[0] + '" aria-selected="false" tabindex="-1">' + s[1] + '</button></li>';
  }).join('');
  paineis.innerHTML = P.map(function (s) {
    return '<section class="painel-aba" role="tabpanel" id="p-' + s[0] + '" aria-labelledby="aba-' + s[0] + '" hidden>' + s[2] + '</section>';
  }).join('') + '<p class="atualizado">Dados atualizados em ' + esc(window.ESPORTES_ATUALIZADO) + '. Fontes: sites oficiais das competições e imprensa esportiva.</p>';

  var botoes = [].slice.call(abas.querySelectorAll('.aba'));
  function abrir(id) {
    if (!P.some(function (s) { return s[0] === id; })) id = P[0][0];
    botoes.forEach(function (b) { var sim = b.id === 'aba-' + id; b.setAttribute('aria-selected', sim); b.tabIndex = sim ? 0 : -1; });
    [].forEach.call(paineis.querySelectorAll('.painel-aba'), function (p) { p.hidden = p.id !== 'p-' + id; });
  }
  botoes.forEach(function (b, i) {
    b.addEventListener('click', function () { var id = b.id.slice(4); history.replaceState(null, '', '#' + id); abrir(id); });
    b.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!n) return;
      var alvo = botoes[(i + n + botoes.length) % botoes.length];
      alvo.focus(); alvo.click();
    });
  });
  [].forEach.call(paineis.querySelectorAll('.cr-mais'), function (b) {
    b.addEventListener('click', function () { var bt = document.getElementById('aba-' + b.getAttribute('data-aba')); if (bt) { bt.click(); window.scrollTo({ top: document.getElementById('abas-barra').offsetTop - 70, behavior: 'smooth' }); } });
  });
  abrir(location.hash.slice(1));
})();
