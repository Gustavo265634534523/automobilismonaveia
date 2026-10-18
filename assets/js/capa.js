/* Capa da página inicial, com os três esportes juntos (no estilo dos portais de esporte):
   1. faixa com as últimas manchetes;  2. manchete grande + placar e próximos jogos;
   3. "Não perca" + "Agora há pouco";  4. mercado de transferências;  5. vídeos oficiais.
   Notícias: noticias-gerais.js (automobilismo) e noticias-esportes.js (futebol e basquete).
   Jogos: esportes-dados.js e dados.js. Vídeos: video-capa.js e videos-esportes.js. */
(function () {
  if (!document.getElementById('hm-hero')) return;
  var esc = window.esc, hoje = window.hojeISO(), en = window.LANG === 'en';
  var CATS = window.CATEGORIAS || [], COMPS = window.COMPETICOES || [], PCAT = {}, PCOMP = {};
  CATS.forEach(function (c) { PCAT[c.slug] = c; });
  COMPS.forEach(function (c) { PCOMP[c.slug] = c; });
  var ICONE = window.ESPORTES_ICONE || {};
  ICONE.automobilismo = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15l2-5h11l3 3h2v3H3z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="17" cy="16.5" r="1.8"/></svg>';
  var NOME_ESP = { automobilismo: 'Automobilismo', futebol: 'Futebol', basquete: 'Basquete' };

  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : window.dataCurta(d); }

  /* todas as notícias num formato só, da mais nova para a mais antiga */
  var usadas = {};
  var motor = (window.NOTICIAS_GERAIS || []).filter(function (n) { return PCAT[n.cat]; }).map(function (n) {
    var c = PCAT[n.cat];
    return { d: n.d, esporte: 'automobilismo', rot: c.menu || c.nome, t: (en && n.t_en) || n.t, x: (en && n.x_en) || n.x, manchete: n.manchete, href: window.linkNoticia ? window.linkNoticia(n.t) : c.slug + '.html', cat: n.cat, tituloPt: n.t };
  });
  var outras = (window.NOTICIAS_ESPORTES || []).map(function (n) {
    var c = PCOMP[n.comp] || {};
    return { d: n.d, esporte: n.esporte, rot: c.menu || c.nome || NOME_ESP[n.esporte], t: n.t, x: n.x, manchete: n.manchete, href: (n.comp || n.esporte) + '.html', foto: n.foto, comp: n.comp };
  });
  function porData(a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; }
  var filas = { automobilismo: motor.sort(porData), futebol: outras.filter(function (n) { return n.esporte === 'futebol'; }).sort(porData), basquete: outras.filter(function (n) { return n.esporte === 'basquete'; }).sort(porData) };
  /* intercala os esportes para nenhum tomar a capa inteira: automobilismo, futebol, basquete, automobilismo... */
  var mistura = [];
  for (var r = 0; ['automobilismo', 'futebol', 'basquete'].some(function (e) { return r < filas[e].length; }); r++)
    ['automobilismo', 'futebol', 'basquete'].forEach(function (e) { if (filas[e][r]) mistura.push(filas[e][r]); });

  /* imagem: foto real do automobilismo (fotos-reais.js); futebol e basquete ganham a arte do esporte */
  function imagem(n, grande) {
    if (n.esporte === 'automobilismo') {
      var fr = window.fotoNoticia ? window.fotoNoticia(n.cat, n.tituloPt, usadas) : (window.FOTOS_REAIS || {})[n.cat];
      var src = fr ? (grande ? fr.grande : fr.src) : (PCAT[n.cat] && PCAT[n.cat].foto) || 'assets/img/cat/f1.jpg';
      return '<img src="' + src + '" alt="" loading="' + (grande ? 'eager' : 'lazy') + '">';
    }
    return window.fotoEsporte ? window.fotoEsporte(n, grande) : '<span class="hm-arte hm-' + n.esporte + '" aria-hidden="true">' + (ICONE[n.esporte] || '') + '</span>';
  }
  function etiqueta(n) { return '<span class="hm-tag hm-tag-' + n.esporte + '">' + esc(n.rot) + '</span>'; }

  /* 2. manchete: a mais nova marcada como manchete em qualquer esporte */
  var capa = mistura.filter(function (n) { return n.manchete; }).sort(porData)[0] || mistura[0];
  var resto = mistura.filter(function (n) { return n !== capa; });
  document.getElementById('hm-hero').innerHTML = '<a class="hm-hero" href="' + capa.href + '">' + imagem(capa, true) +
    '<span class="hm-hero-txt">' + etiqueta(capa) + '<b>' + esc(capa.t) + '</b><span>' + esc(capa.x.split(/(?<=\.)\s/)[0]) + '</span><em>Ler a notícia →</em></span></a>';

  /* 1. faixa: as próximas quatro, uma de cada esporte primeiro */
  var faixa = resto.slice(0, 4);
  document.getElementById('hm-faixa').innerHTML = faixa.map(function (n) {
    return '<a class="hm-mini" href="' + n.href + '">' + imagem(n) + '<span><b>' + esc(n.t) + '</b><small>' + esc(n.rot) + ' · ' + esc(quando(n.d)) + '</small></span></a>';
  }).join('');
  resto = resto.slice(4);

  /* 2b. placar e próximos jogos: resultados recentes e próximos jogos de futebol e basquete + a próxima corrida da F1 e da MotoGP */
  var jogos = [];
  COMPS.forEach(function (c) {
    (c.jogos || []).forEach(function (j) {
      if (!j.d || j.casa === 'A definir') return;
      if (j.p ? window.diasAte(j.d) >= -5 : j.d >= hoje) jogos.push({ d: j.d, h: j.h, rot: c.menu || c.nome, esporte: c.esporte, href: c.slug + '.html', a: j.casa, b: j.fora, p: j.p });
    });
  });
  ['formula-1', 'motogp'].forEach(function (s) {
    var c = PCAT[s]; if (!c) return;
    var e = c.calendario.filter(function (x) { return !x.venc && x.d && x.d >= hoje; })[0]; if (!e) return;
    var corrida = (e.s || []).filter(function (x) { return /Corrida/.test(x.t); })[0];
    jogos.push({ d: e.d, h: corrida ? corrida.h : '', rot: c.menu || c.nome, esporte: 'automobilismo', href: s + '.html', a: e.n, b: e.l, corrida: true });
  });
  var proximos = jogos.filter(function (j) { return !j.p; }).sort(function (x, y) { return (x.d + (x.h || '')) < (y.d + (y.h || '')) ? -1 : 1; });
  var feitos = jogos.filter(function (j) { return j.p; }).sort(function (x, y) { return x.d < y.d ? 1 : -1; });
  /* um de cada campeonato antes de repetir */
  function variado(lista, max) { var visto = {}, a = [], b = []; lista.forEach(function (j) { (visto[j.rot] ? b : a).push(j); visto[j.rot] = 1; }); return a.concat(b).slice(0, max); }
  function linhaJogo(j) {
    return '<a class="hm-jogo" href="' + j.href + '"><span class="hm-jogo-cab"><i class="hm-ponto hm-' + j.esporte + '"></i>' + esc(j.rot) + ' · ' + esc(quando(j.d)) + '</span>' +
      (j.corrida ? '<span class="hm-jogo-linha"><b>' + esc(j.a) + '</b><strong>' + esc(j.h || '--') + '</strong></span><span class="hm-jogo-sub">' + esc(j.b) + '</span>'
        : '<span class="hm-jogo-linha"><b>' + esc(j.a) + '</b><strong>' + (j.p ? esc(j.p.split(' x ')[0]) : esc(j.h || '--')) + '</strong></span>' +
          '<span class="hm-jogo-linha"><b>' + esc(j.b) + '</b><strong>' + (j.p ? esc(j.p.split(' x ')[1]) : '') + '</strong></span>') + '</a>';
  }
  document.getElementById('hm-placar').innerHTML = '<div class="hm-caixa-cab"><h2>Próximos jogos</h2><a href="horarios.html">Horários →</a></div>' +
    variado(proximos, 4).map(linhaJogo).join('') +
    (feitos.length ? '<div class="hm-caixa-cab hm-sub"><h2>Últimos resultados</h2></div>' + variado(feitos, 2).map(linhaJogo).join('') : '');

  /* 3. não perca (5 cartões) e agora há pouco (lista na ordem de publicação) */
  var naoPerca = resto.slice(0, 5);
  document.getElementById('hm-naoperca').innerHTML = '<h2 class="hm-tit">Não perca</h2><div class="hm-grade">' + naoPerca.map(function (n, i) {
    return '<a class="hm-card' + (i === 0 ? ' hm-card-alto' : '') + '" href="' + n.href + '">' + imagem(n) + '<span class="hm-card-txt">' + etiqueta(n) + '<b>' + esc(n.t) + '</b><small>' + esc(quando(n.d)) + '</small></span></a>';
  }).join('') + '</div>';
  var agora = resto.slice(5).concat(faixa).sort(porData).slice(0, 5);
  document.getElementById('hm-agora').innerHTML = '<div class="hm-caixa-cab"><h2>Agora há pouco</h2><a href="noticias.html">Todas →</a></div><ol class="hm-lista">' + agora.map(function (n) {
    return '<li><a href="' + n.href + '"><span><b>' + esc(n.t) + '</b><small>' + esc(n.rot) + ' · ' + esc(quando(n.d)) + '</small></span>' + imagem(n) + '</a></li>';
  }).join('') + '</ol>';

  /* 4. mercado de transferências, com filtro por esporte */
  var M = (window.MERCADO || []).slice().sort(porData);
  var STATUS = { confirmado: 'Confirmado', saida: 'Saída confirmada', especulacao: 'Especulação' };
  var merc = document.getElementById('hm-mercado');
  if (merc && M.length) {
    merc.innerHTML = '<div class="hm-filtros" role="group" aria-label="Filtrar o mercado por esporte">' + ['todos', 'automobilismo', 'futebol', 'basquete'].map(function (e, i) {
      return '<button type="button" class="hm-filtro" data-esp="' + e + '" aria-pressed="' + (i === 0) + '">' + (e === 'todos' ? 'Todos' : NOME_ESP[e]) + '</button>';
    }).join('') + '</div><div class="hm-merc-grade">' + M.map(function (m) {
      var mesmo = m.de === m.para;
      return '<' + (m.link ? 'a href="' + m.link + '"' : 'div') + ' class="hm-merc" data-esp="' + m.esporte + '"><span class="hm-merc-cab"><span class="hm-tag hm-tag-' + m.esporte + '">' + esc(m.cat) + '</span><span class="hm-status hm-st-' + m.status + '">' + STATUS[m.status] + '</span></span>' +
        '<b>' + esc(m.nome) + '</b><span class="hm-rota">' + (mesmo ? '<em>' + esc(m.para) + '</em>' : '<span>' + esc(m.de) + '</span><i aria-hidden="true">→</i><em>' + esc(m.para) + '</em>') + '</span>' +
        '<small>' + esc(m.quando.charAt(0).toUpperCase() + m.quando.slice(1)) + (m.nota ? '. ' + esc(m.nota) : '') + '</small></' + (m.link ? 'a' : 'div') + '>';
    }).join('') + '</div>';
    [].forEach.call(merc.querySelectorAll('.hm-filtro'), function (b) {
      b.addEventListener('click', function () {
        var e = b.getAttribute('data-esp');
        [].forEach.call(merc.querySelectorAll('.hm-filtro'), function (x) { x.setAttribute('aria-pressed', x === b); });
        [].forEach.call(merc.querySelectorAll('.hm-merc'), function (c) { c.hidden = e !== 'todos' && c.getAttribute('data-esp') !== e; });
      });
    });
  }

  /* 5. vídeos oficiais dos últimos dias, intercalando automobilismo, futebol e basquete */
  var dias = function (x, n) { return x && x.id && Date.now() - Date.parse(x.publicado) < n * 864e5; };
  var V = window.VIDEO_CAPA;
  var vMotor = (dias(V, 3) ? [V] : []).concat((window.VIDEOS_F1 || []).filter(function (x) { return dias(x, 4) && (!V || x.id !== V.id); }).slice(0, 2), (window.VIDEOS_CATS || []).filter(function (x) { return dias(x, 7); }))
    .map(function (x) { return { id: x.id, rot: x.nome || 'Fórmula 1', t: x.titulo, d: x.publicado.slice(0, 10) }; });
  var vEsp = (window.VIDEOS_ESPORTES || []).filter(function (x) { return dias(x, 10); }).map(function (x) { return { id: x.id, rot: x.nome, t: x.titulo, d: x.publicado.slice(0, 10), esporte: x.esporte }; });
  var vf = [vMotor, vEsp.filter(function (x) { return x.esporte === 'futebol'; }), vEsp.filter(function (x) { return x.esporte === 'basquete'; })], vids = [];
  for (var k = 0; vf.some(function (f) { return k < f.length; }); k++) vf.forEach(function (f) { if (f[k]) vids.push(f[k]); });
  vids = vids.slice(0, 4);
  var caixaV = document.getElementById('hm-videos');
  if (caixaV) {
    if (!vids.length) { caixaV.closest('section').hidden = true; }
    else {
      var yt = function (v) { return 'https://www.youtube.com/watch?v=' + encodeURIComponent(v.id); };
      var img = function (v, q) { return '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/' + q + '.jpg" alt="" loading="lazy"' + (q === 'maxresdefault' ? ' onerror="this.onerror=null;this.src=this.src.replace(\'maxresdefault\',\'hqdefault\')"' : '') + '>'; };
      var play = '<i class="hm-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></i>';
      caixaV.innerHTML = '<a class="hm-vid-grande" href="' + yt(vids[0]) + '" target="_blank" rel="noopener">' + img(vids[0], 'maxresdefault') + play +
        '<span class="hm-hero-txt"><span class="hm-tag hm-tag-video">' + esc(vids[0].rot) + '</span><b>' + esc(vids[0].t) + '</b><span>' + esc(quando(vids[0].d)) + ' · no canal oficial, toque para assistir no YouTube</span></span></a>' +
        '<div class="hm-vid-lista">' + vids.slice(1).map(function (v) {
          return '<a class="hm-vid" href="' + yt(v) + '" target="_blank" rel="noopener"><span class="hm-vid-img">' + img(v, 'mqdefault') + play + '</span><span><b>' + esc(v.t) + '</b><small>' + esc(v.rot) + ' · ' + esc(quando(v.d)) + '</small></span></a>';
        }).join('') + '</div>';
    }
  }
})();
