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
      var src = fr ? (grande ? fr.grande : fr.src) : (PCAT[n.cat] && PCAT[n.cat].foto) || 'assets/img/esportes/automobilismo.webp';
      return '<img src="' + src + '" alt="" loading="' + (grande ? 'eager' : 'lazy') + '">';
    }
    return window.fotoEsporte ? window.fotoEsporte(n, grande) : '<span class="hm-arte hm-' + n.esporte + '" aria-hidden="true">' + (ICONE[n.esporte] || '') + '</span>';
  }
  function etiqueta(n) { return '<span class="hm-tag hm-tag-' + n.esporte + '">' + esc(n.rot) + '</span>'; }

  /* 2. manchete: a mais nova marcada como manchete em qualquer esporte */
  var capa = mistura.filter(function (n) { return n.manchete; }).sort(porData)[0] || mistura[0];
  var resto = mistura.filter(function (n) { return n !== capa; });
  document.getElementById('hm-hero').innerHTML = '<a class="hm-hero hm-hero-' + capa.esporte + '" href="' + capa.href + '">' +
    '<span class="hm-hero-txt">' + etiqueta(capa) + '<b>' + esc(capa.t) + '</b><span>' + esc(capa.x.split(/(?<=\.)\s/)[0]) + '</span><em>Ler a notícia →</em></span></a>';

  /* 1. faixa: as próximas quatro, uma de cada esporte primeiro */
  var faixa = resto.slice(0, 4);
  document.getElementById('hm-faixa').innerHTML = faixa.map(function (n) {
    return '<a class="hm-mini hm-mini-' + n.esporte + '" href="' + n.href + '"><span><b>' + esc(n.t) + '</b><small>' + esc(n.rot) + ' · ' + esc(quando(n.d)) + '</small></span></a>';
  }).join('');
  resto = resto.slice(4);

  /* 2b. placar e próximos jogos: resultados recentes e próximos jogos de futebol e basquete + a próxima corrida da F1 */
  var jogos = [];
  COMPS.forEach(function (c) {
    (c.jogos || []).forEach(function (j) {
      if (!j.d || j.casa === 'A definir') return;
      if (j.p ? window.diasAte(j.d) >= -5 : j.d >= hoje) jogos.push({ d: j.d, h: j.h, rot: c.menu || c.nome, esporte: c.esporte, href: c.slug + '.html', a: j.casa, b: j.fora, p: j.p });
    });
  });
  ['formula-1'].forEach(function (s) {
    var c = PCAT[s]; if (!c) return;
    var e = c.calendario.filter(function (x) { return !x.venc && x.d && x.d >= hoje; })[0]; if (!e) return;
    var corrida = (e.s || []).filter(function (x) { return /Corrida/.test(x.t); })[0];
    jogos.push({ d: e.d, h: corrida ? corrida.h : '', rot: c.menu || c.nome, esporte: 'automobilismo', href: s + '.html', a: e.n, b: e.l, corrida: true });
  });
  var proximos = jogos.filter(function (j) { return !j.p; }).sort(function (x, y) { return (x.d + (x.h || '')) < (y.d + (y.h || '')) ? -1 : 1; });
  var feitos = jogos.filter(function (j) { return j.p; }).sort(function (x, y) { return x.d < y.d ? 1 : -1; });
  /* um de cada campeonato antes de repetir */
  function variado(lista, max) { var visto = {}, a = [], b = []; lista.forEach(function (j) { (visto[j.rot] ? b : a).push(j); visto[j.rot] = 1; }); return a.concat(b).slice(0, max); }
  /* escudo antes do nome do time (competicao.js: window.escudoTime) */
  function esc2(n) { return (window.escudoTime ? window.escudoTime(n) : '') + esc(n); }
  function linhaJogo(j) {
    return '<a class="hm-jogo" href="' + j.href + '"><span class="hm-jogo-cab"><i class="hm-ponto hm-' + j.esporte + '"></i>' + esc(j.rot) + ' · ' + esc(quando(j.d)) + '</span>' +
      (j.corrida ? '<span class="hm-jogo-linha"><b>' + esc(j.a) + '</b><strong>' + esc(j.h || '--') + '</strong></span><span class="hm-jogo-sub">' + esc(j.b) + '</span>'
        : '<span class="hm-jogo-linha"><b>' + esc2(j.a) + '</b><strong>' + (j.p ? esc(j.p.split(' x ')[0]) : esc(j.h || '--')) + '</strong></span>' +
          '<span class="hm-jogo-linha"><b>' + esc2(j.b) + '</b><strong>' + (j.p ? esc(j.p.split(' x ')[1]) : '') + '</strong></span>') + '</a>';
  }
  document.getElementById('hm-placar').innerHTML = '<div class="hm-caixa-cab"><h2>Próximos jogos</h2><a href="horarios.html">Horários →</a></div>' +
    variado(proximos, 4).map(linhaJogo).join('') +
    (feitos.length ? '<div class="hm-caixa-cab hm-sub"><h2>Últimos resultados</h2></div>' + variado(feitos, 2).map(linhaJogo).join('') : '');

  /* 3. não perca (5 cartões) e agora há pouco (lista na ordem de publicação) */
  var naoPerca = resto.slice(0, 5);
  document.getElementById('hm-naoperca').innerHTML = '<h2 class="hm-tit">Não perca</h2><div class="hm-grade">' + naoPerca.map(function (n, i) {
    return '<a class="hm-card hm-card-' + n.esporte + (i === 0 ? ' hm-card-alto' : '') + '" href="' + n.href + '"><span class="hm-card-txt">' + etiqueta(n) + '<b>' + esc(n.t) + '</b>' + (i === 0 ? '<span class="hm-card-x">' + esc(n.x.split(/(?<=\.)\s/)[0]) + '</span>' : '') + '<small>' + esc(quando(n.d)) + '</small></span></a>';
  }).join('') + '</div>';
  var agora = resto.slice(5).concat(faixa).sort(porData).slice(0, 5);
  document.getElementById('hm-agora').innerHTML = '<div class="hm-caixa-cab"><h2>Agora há pouco</h2><a href="noticias.html">Todas →</a></div><ol class="hm-lista">' + agora.map(function (n) {
    return '<li><a href="' + n.href + '"><span><b>' + esc(n.t) + '</b><small>' + esc(n.rot) + ' · ' + esc(quando(n.d)) + '</small></span></a></li>';
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
      var img = function (v, q) { return window.capaVideo(v.id, q, v.esporte || 'automobilismo'); };
      var play = '<i class="hm-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></i>';
      caixaV.innerHTML = '<a class="hm-vid-grande" href="' + yt(vids[0]) + '" target="_blank" rel="noopener">' + img(vids[0], 'maxresdefault') + play +
        '<span class="hm-hero-txt"><span class="hm-tag hm-tag-video">' + esc(vids[0].rot) + '</span><b>' + esc(vids[0].t) + '</b><span>' + esc(quando(vids[0].d)) + ' · no canal oficial, toque para assistir no YouTube</span></span></a>' +
        '<div class="hm-vid-lista">' + vids.slice(1).map(function (v) {
          return '<a class="hm-vid" href="' + yt(v) + '" target="_blank" rel="noopener"><span class="hm-vid-img">' + img(v, 'mqdefault') + play + '</span><span><b>' + esc(v.t) + '</b><small>' + esc(v.rot) + ' · ' + esc(quando(v.d)) + '</small></span></a>';
        }).join('') + '</div>';
    }
  }
})();

/* Seções de Futebol e de Basquete na página inicial: notícias com imagem, tabela do Brasileirão, próximos jogos e atalhos.
   Cada esporte tem o mesmo peso que o automobilismo. */
(function () {
  if (!document.getElementById('hm-fut-noticias')) return;
  var esc = window.esc, hoje = window.hojeISO(), COMPS = window.COMPETICOES || [], P = {};
  COMPS.forEach(function (c) { P[c.slug] = c; });
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  function nots(esporte) {
    return (window.NOTICIAS_ESPORTES || []).filter(function (n) { return n.esporte === esporte; }).sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
  }
  function cartao(n, grande) {
    var c = P[n.comp] || {};
    return '<a class="hm-card hm-card-' + n.esporte + (grande ? ' hm-card-alto' : '') + '" href="' + (n.comp || n.esporte) + '.html">' +
      '<span class="hm-card-txt"><span class="hm-tag hm-tag-' + n.esporte + '">' + esc(c.menu || c.nome || '') + '</span><b>' + esc(n.t) + '</b>' + (grande ? '<span class="hm-card-x">' + esc(n.x.split(/(?<=\.)\s/)[0]) + '</span>' : '') + '<small>' + quando(n.d) + '</small></span></a>';
  }
  function jogos(esporte, max) {
    var lista = [];
    COMPS.filter(function (c) { return c.esporte === esporte; }).forEach(function (c) {
      (c.jogos || []).forEach(function (j) { if (j.d && !j.p && j.d >= hoje && j.casa !== 'A definir') lista.push({ c: c, j: j }); });
    });
    lista.sort(function (a, b) { return (a.j.d + (a.j.h || '')) < (b.j.d + (b.j.h || '')) ? -1 : 1; });
    return lista.slice(0, max).map(function (x) {
      return '<a class="hm-jogo" href="' + x.c.slug + '.html"><span class="hm-jogo-cab"><i class="hm-ponto hm-' + esporte + '"></i>' + esc(x.c.menu) + ' · ' + quando(x.j.d) + '</span>' +
        '<span class="hm-jogo-linha"><b>' + (window.escudoTime ? window.escudoTime(x.j.casa) : '') + esc(x.j.casa) + '</b><strong>' + esc(x.j.h || '--') + '</strong></span><span class="hm-jogo-linha"><b>' + (window.escudoTime ? window.escudoTime(x.j.fora) : '') + esc(x.j.fora) + '</b><strong></strong></span></a>';
    }).join('');
  }
  function chips(alvo, esporte) {
    var el = document.getElementById(alvo); if (!el) return;
    el.innerHTML = COMPS.filter(function (c) { return c.esporte === esporte; }).map(function (c) {
      return '<a class="hm-chip-comp" href="' + c.slug + '.html"><b>' + esc(c.menu) + '</b><small>' + esc(c.lider.nome) + '</small></a>';
    }).join('');
  }

  /* Futebol: 1 notícia grande + 4 menores; ao lado, o topo do Brasileirão e os próximos jogos */
  var nf = nots('futebol').slice(0, 5);
  document.getElementById('hm-fut-noticias').innerHTML = '<div class="hm-grade">' + nf.map(function (n, i) { return cartao(n, i === 0); }).join('') + '</div>';
  var br = P.brasileirao;
  document.getElementById('hm-fut-lado').innerHTML =
    (br && br.tabela ? '<div class="hm-caixa-cab"><h2>Brasileirão</h2><a href="brasileirao.html#classificacao">Tabela →</a></div><p class="hm-tab-nota">' + esc(br.tabela.titulo) + '</p>' +
      '<table class="hm-tab"><tbody>' + br.tabela.linhas.slice(0, 6).map(function (l) { return '<tr><td>' + esc(l[0]) + '</td><td>' + esc(l[1]) + '</td><td>' + esc(l[l.length - 1]) + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
    '<div class="hm-caixa-cab hm-sub"><h2>Próximos jogos</h2></div>' + jogos('futebol', 3);
  chips('hm-fut-chips', 'futebol');

  /* as três seções no mesmo formato: notícias à esquerda; à direita a tabela e os próximos jogos ou corridas */
  function tabelaLado(titulo, href, t, n) {
    if (!t) return '';
    return '<div class="hm-caixa-cab"><h2>' + esc(titulo) + '</h2><a href="' + href + '">Tabela →</a></div><p class="hm-tab-nota">' + esc(t.titulo || '') + '</p>' +
      '<table class="hm-tab"><tbody>' + t.linhas.slice(0, n || 6).map(function (l) {
        var nome = l[1]; return '<tr><td>' + esc(l[0]) + '</td><td>' + (window.escudoTime ? window.escudoTime(nome) : '') + esc(nome) + '</td><td>' + esc(l[l.length - 1]) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  /* Basquete: 1 notícia grande + 4 menores; ao lado, a Euroleague (a NBA ainda não começou) e os próximos jogos */
  var nb = nots('basquete').slice(0, 5);
  document.getElementById('hm-bq-noticias').innerHTML = '<div class="hm-grade">' + nb.map(function (n, i) { return cartao(n, i === 0); }).join('') + '</div>';
  var el = P.euroleague;
  document.getElementById('hm-bq-lado').innerHTML = (el && el.tabela ? tabelaLado('Euroleague', 'euroleague.html#classificacao', el.tabela, 6) : '') +
    '<div class="hm-caixa-cab hm-sub"><h2>Próximos jogos</h2></div>' + jogos('basquete', 3);

  /* Automobilismo: as notícias mais novas das categorias, o campeonato da F1 e as próximas corridas */
  var CATS = window.CATEGORIAS || [], PC = {}; CATS.forEach(function (c) { PC[c.slug] = c; });
  var na = (window.NOTICIAS_GERAIS || []).filter(function (n) { return PC[n.cat]; }).slice().sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; }).slice(0, 5);
  var autoN = document.getElementById('hm-auto-noticias');
  if (autoN) autoN.innerHTML = '<div class="hm-grade">' + na.map(function (n, i) {
    var c = PC[n.cat];
    return '<a class="hm-card hm-card-automobilismo' + (i === 0 ? ' hm-card-alto' : '') + '" href="' + (window.linkNoticia ? window.linkNoticia(n.t) : c.slug + '.html') + '">' +
      '<span class="hm-card-txt"><span class="hm-tag hm-tag-automobilismo">' + esc(c.menu || c.nome) + '</span><b>' + esc(n.t) + '</b>' + (i === 0 ? '<span class="hm-card-x">' + esc(String(n.x).split(/(?<=\.)\s/)[0]) + '</span>' : '') + '<small>' + quando(n.d) + '</small></span></a>';
  }).join('') + '</div>';
  var f1 = PC['formula-1'], corridas = [];
  CATS.forEach(function (c) {
    var e = (c.calendario || []).filter(function (x) { return !x.venc && x.d && x.d >= hoje; })[0]; if (!e) return;
    var cor = (e.s || []).filter(function (x) { return /Corrida|Principal/.test(x.t); }).pop();
    corridas.push({ c: c, e: e, h: cor ? cor.h : '' });
  });
  corridas.sort(function (a, b) { return a.e.d < b.e.d ? -1 : 1; });
  var autoL = document.getElementById('hm-auto-lado');
  if (autoL) autoL.innerHTML = (f1 && f1.classificacao ? '<div class="hm-caixa-cab"><h2>Fórmula 1</h2><a href="formula-1.html#classificacao">Tabela →</a></div><p class="hm-tab-nota">Campeonato de pilotos</p>' +
      '<table class="hm-tab"><tbody>' + f1.classificacao.linhas.slice(0, 6).map(function (l) { return '<tr><td>' + esc(l[0]) + '</td><td>' + esc(l[1]) + '</td><td>' + esc(l[l.length - 1]) + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
    '<div class="hm-caixa-cab hm-sub"><h2>Próximas corridas</h2><a href="horarios.html">Horários →</a></div>' + corridas.slice(0, 3).map(function (x) {
      return '<a class="hm-jogo" href="' + x.c.slug + '.html"><span class="hm-jogo-cab"><i class="hm-ponto hm-automobilismo"></i>' + esc(x.c.menu || x.c.nome) + ' · ' + quando(x.e.d) + '</span>' +
        '<span class="hm-jogo-linha"><b>' + esc(x.e.n) + '</b><strong>' + esc(x.h || '--') + '</strong></span><span class="hm-jogo-sub">' + esc(x.e.l || '') + '</span></a>';
    }).join('');
  chips('hm-bq-chips', 'basquete');
})();
