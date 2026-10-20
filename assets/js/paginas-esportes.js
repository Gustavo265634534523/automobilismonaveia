/* Páginas que juntam os três esportes (body data-pagina):
   - time: página de cada time (time.html?t=flamengo) e, sem time, a lista de todos os times;
   - fim-de-semana: agenda de sexta a domingo de futebol, basquete e automobilismo, com onde assistir;
   - resumo: o que aconteceu nos últimos 7 dias em cada esporte;
   - mercado: contratações, saídas, renovações e rumores dos três esportes.
   Dados: esportes-dados.js, noticias-esportes.js, dados.js e noticias-gerais.js, com as peças de esportes-mais.js. */
(function () {
  var pagina = document.body.getAttribute('data-pagina'), raiz = document.getElementById('pg');
  if (!raiz) return;
  var esc = window.esc, hoje = window.hojeISO(), COMPS = window.COMPETICOES || [], CATS = window.CATEGORIAS || [];
  var NOMES = { futebol: 'Futebol', basquete: 'Basquete', automobilismo: 'Fórmula 1' };
  var SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function somaDias(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function diaSemana(iso) { return SEMANA[new Date(iso + 'T12:00:00').getDay()]; }
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : n === 1 ? 'Amanhã' : window.dataCurta(d); }
  function curta(x) { return String(x || '').split(/(?<=\.)\s/)[0]; }
  function noticia(n, href, tag) {
    return '<a class="pg-not" href="' + href + '"><small>' + esc(tag) + ' · ' + quando(n.d) + '</small><b>' + esc(n.t) + '</b><span>' + esc(curta(n.x)) + '</span></a>';
  }
  function porComp(slug) { return COMPS.filter(function (c) { return c.slug === slug; })[0] || {}; }
  function jogos(filtro) {
    var l = [];
    COMPS.forEach(function (c) { (c.jogos || []).forEach(function (j) { if (j.casa && j.fora && !/^a definir/i.test(j.casa) && filtro(j, c)) l.push({ c: c, j: j }); }); });
    return l.sort(function (a, b) { return (a.j.d + (a.j.h || '99')) < (b.j.d + (b.j.h || '99')) ? -1 : 1; });
  }
  function listaJogos(l, comp) { return l.length ? '<ul class="em-jogos">' + l.map(function (x) { return window.linhaJogo(x, comp !== false); }).join('') + '</ul>' : ''; }
  /* sessões do automobilismo entre duas datas */
  function sessoes(de, ate) {
    var l = [];
    CATS.forEach(function (c) {
      (c.calendario || []).forEach(function (e) {
        (e.s || []).forEach(function (s) { if (s.d && s.d >= de && s.d <= ate) l.push({ c: c, e: e, s: s }); });
      });
    });
    return l.sort(function (a, b) { return (a.s.d + (a.s.h || '99')) < (b.s.d + (b.s.h || '99')) ? -1 : 1; });
  }
  function linhaSessao(x) {
    return '<a class="pg-corrida" href="' + x.c.slug + '.html"><em>' + esc(x.s.h || '--:--') + '</em><span><b>' + esc(x.c.menu || x.c.nome) + ' · ' + esc(x.s.t) + '</b><small>' + esc(x.e.n) + (x.e.l ? ', ' + esc(x.e.l) : '') + '</small></span>' + window.tvLinha(x.c.slug, 2) + '</a>';
  }

  /* ---------- página do time ---------- */
  if (pagina === 'time') {
    var slug = new URLSearchParams(location.search).get('t');
    var t = slug && window.acharTime(slug);
    if (!t) {
      /* todos os times, por esporte e campeonato, com busca */
      raiz.innerHTML = '<div class="pg-topo"><div><p class="pg-rot">Futebol e basquete</p><h1>Times</h1><p>Escolha um time para ver os jogos, a posição na tabela, as notícias e o mercado dele.' + (slug ? ' Não achamos esse time; escolha abaixo.' : '') + '</p></div></div>' +
        '<input type="search" class="mt-busca" id="pg-busca" placeholder="Buscar time" aria-label="Buscar time" style="margin:0 0 8px;width:min(420px,100%)">' +
        ['futebol', 'basquete'].map(function (esp) {
          return '<section class="pg-sec" id="' + esp + '"><h2>' + NOMES[esp] + '</h2>' + COMPS.filter(function (c) { return c.esporte === esp; }).map(function (c) {
            var ts = window.todosTimes(esp).filter(function (x) { return x.comps[0] === c.slug; });
            return ts.length ? '<p class="pg-esp">' + esc(c.nome) + '</p><div class="pg-times">' + ts.map(function (x) {
              return '<a href="' + window.linkTime(x.nome) + '" data-busca="' + esc(x.slug) + '">' + window.escudoTime(x.nome) + '<span>' + esc(x.nome) + '</span></a>';
            }).join('') + '</div>' : '';
          }).join('') + '</section>';
        }).join('');
      document.getElementById('pg-busca').addEventListener('input', function () {
        var q = window.slugTime(this.value);
        [].forEach.call(raiz.querySelectorAll('.pg-times a'), function (a) { a.hidden = q && a.getAttribute('data-busca').indexOf(q) < 0; });
        [].forEach.call(raiz.querySelectorAll('.pg-esp'), function (p) { p.hidden = ![].some.call(p.nextElementSibling.children, function (a) { return !a.hidden; }); });
      });
      if (location.hash) { var alvo = document.getElementById(location.hash.slice(1)); if (alvo) setTimeout(function () { alvo.scrollIntoView(); }, 50); }
      return;
    }
    document.title = t.nome + ' | Arena Sports';
    var link = document.querySelector('link[rel="canonical"]'); if (link) link.href = 'https://automobilismonaveia.com.br/time.html?t=' + t.slug;
    var meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = t.nome + ': próximos jogos, resultados, posição na tabela, notícias e onde assistir.';
    document.documentElement.style.setProperty('--ft-cor', t.esporte === 'basquete' ? '#f07a2a' : 'var(--sangue-vivo)');
    function pintarTime() {
      var i = window.infoTime(t), meu = window.meuTime(t.esporte), eMeu = meu && meu.nome === t.nome;
      var px = i.proximos[0];
      var tabelas = i.pos.map(function (p) {
        var k = p.tabela.colunas.indexOf('Time'), idx = p.tabela.linhas.indexOf(p.linha);
        var de = Math.max(0, Math.min(idx - 2, p.tabela.linhas.length - 5)), trecho = p.tabela.linhas.slice(de, de + 5);
        return '<div><p class="pg-esp">' + esc(p.c.nome) + ' · ' + esc(p.tabela.titulo) + '</p><table class="pg-tab"><thead><tr>' + p.tabela.colunas.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          trecho.map(function (l) { return '<tr' + (l === p.linha ? ' class="eu"' : '') + '>' + l.map(function (v, j) { return '<td>' + (j === k ? '<a href="' + window.linkTime(v) + '" style="color:inherit;text-decoration:none;display:inline-flex;gap:8px;align-items:center">' + window.escudoTime(v) + esc(v) + '</a>' : esc(v)) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table><p class="nota" style="margin-top:8px"><a href="' + p.c.slug + '.html#classificacao">Tabela completa</a></p></div>';
      }).join('');
      var feitos = i.feitos.slice(-6).reverse();
      var v = 0, e = 0, dd = 0;
      i.feitos.forEach(function (x) {
        var pl = String(x.j.p).split(/\s*x\s*/), a = +pl[0], b = +pl[1], casa = x.j.casa === t.nome;
        var meus = casa ? a : b, deles = casa ? b : a;
        if (meus > deles) v++; else if (meus < deles) dd++; else e++;
      });
      raiz.innerHTML = '<div class="pg-topo"><span class="pg-escudo">' + window.escudoTime(t.nome) + '</span><div><p class="pg-rot">' + NOMES[t.esporte] + ' · ' + t.comps.map(function (s) { return esc(porComp(s).menu || s); }).join(', ') + '</p><h1>' + esc(t.nome) + '</h1>' +
        '<div class="pg-acoes"><button type="button" class="ft-btn" id="pg-meu">' + (eMeu ? '★ Meu time (tirar)' : '☆ Marcar como meu time') + '</button><a class="ft-btn ft-btn-linha" href="time.html#' + t.esporte + '">Outros times</a></div></div></div>' +
        '<div class="pg-num">' +
          (i.pos[0] ? '<div><small>Posição</small><b>' + esc(i.pos[0].linha[0]) + 'º</b><span>' + esc(i.pos[0].c.menu) + (i.pos[0].c.tabela2 ? ' (conferência)' : '') + '</span></div>' : '') +
          '<div><small>Próximo jogo</small><b>' + (px ? esc(quando(px.j.d)) : '—') + '</b><span>' + (px ? esc(px.j.casa === t.nome ? 'x ' + px.j.fora : 'x ' + px.j.casa) + (px.j.h ? ', ' + esc(px.j.h) : '') : 'A confirmar') + '</span></div>' +
          (i.feitos.length ? '<div><small>Últimos jogos no site</small><b>' + v + 'V ' + (t.esporte === 'futebol' ? e + 'E ' : '') + dd + 'D</b><span>' + i.feitos.length + ' jogos</span></div>' : '') +
          (px ? '<div><small>Onde assistir</small><b style="font-size:16px">' + esc(window.canais(px.c.slug, 2) || 'A confirmar') + '</b><span>' + esc(px.c.menu) + '</span></div>' : '') +
        '</div>' +
        '<div class="pg-grade2">' +
          '<section class="pg-sec"><h2>Próximos jogos</h2>' + (listaJogos(i.proximos.slice(0, 6)) || '<p class="pg-vazio">Os próximos jogos aparecem aqui assim que forem marcados.</p>') + '</section>' +
          '<section class="pg-sec"><h2>Resultados</h2>' + (listaJogos(feitos) || '<p class="pg-vazio">Sem resultados recentes no site.</p>') + '</section>' +
        '</div>' +
        (tabelas ? '<section class="pg-sec"><h2>Na tabela</h2><div class="pg-grade2">' + tabelas + '</div></section>' : '') +
        '<section class="pg-sec" id="noticias"><h2>Notícias</h2>' + (i.nots.length ? '<div class="pg-nots">' + i.nots.slice(0, 8).map(function (n) { return noticia(n, (n.comp || t.esporte) + '.html', porComp(n.comp).menu || NOMES[t.esporte]); }).join('') + '</div>' : '<p class="pg-vazio">Sem notícias recentes sobre o ' + esc(t.nome) + '.</p>') + '</section>' +
        (i.merc.length ? '<section class="pg-sec"><h2>Mercado</h2><div class="mk-grade">' + i.merc.map(window.mercadoHTML).join('') + '</div></section>' : '');
      document.getElementById('pg-meu').addEventListener('click', function () { window.marcarMeuTime(t.esporte, eMeu ? '' : t.nome); });
    }
    pintarTime();
    document.addEventListener('naveia:meu-time', pintarTime);
    window.aoMudarPlacar(pintarTime);
    return;
  }

  /* ---------- agenda do fim de semana ---------- */
  if (pagina === 'fim-de-semana') {
    /* sexta a domingo: o deste fim de semana se já for sexta, sábado ou domingo; senão, o próximo */
    var dow = new Date(hoje + 'T12:00:00').getDay();
    var sexta = dow === 0 ? somaDias(hoje, -2) : dow === 6 ? somaDias(hoje, -1) : somaDias(hoje, 5 - dow);
    var dias = [sexta, somaDias(sexta, 1), somaDias(sexta, 2)];
    var filtro = (location.hash || '#todos').slice(1);
    function pintarFds() {
      var corpo = dias.map(function (d) {
        var blocos = [];
        ['futebol', 'basquete'].forEach(function (esp) {
          if (filtro !== 'todos' && filtro !== esp) return;
          var l = jogos(function (j, c) { return c.esporte === esp && j.d === d; });
          if (l.length) blocos.push('<p class="pg-esp">' + NOMES[esp] + ' · ' + l.length + (l.length > 1 ? ' jogos' : ' jogo') + '</p>' + listaJogos(l));
        });
        if (filtro === 'todos' || filtro === 'automobilismo') {
          var s = sessoes(d, d).filter(function (x) { return /corrida|sprint|classifica|principal|final/i.test(x.s.t); });
          if (s.length) blocos.push('<p class="pg-esp">Fórmula 1</p><div class="pg-lista">' + s.map(linhaSessao).join('') + '</div>');
        }
        return '<h2 class="pg-dia">' + diaSemana(d) + ', ' + window.dataCurta(d) + (d === hoje ? '<small>Hoje</small>' : '') + '</h2>' + (blocos.join('') || '<p class="pg-vazio">Nada marcado neste dia (ainda).</p>');
      }).join('');
      raiz.innerHTML = '<div class="pg-topo"><div><p class="pg-rot">Futebol, basquete e automobilismo</p><h1>Fim de semana</h1><p>Tudo o que tem de sexta (' + window.dataCurta(dias[0]) + ') a domingo (' + window.dataCurta(dias[2]) + '), no horário de Brasília e com o canal para assistir. No automobilismo, só classificações e corridas.</p></div></div>' +
        '<div class="pg-filtros" role="group" aria-label="Esporte">' + ['todos', 'futebol', 'basquete', 'automobilismo'].map(function (f) {
          return '<button type="button" data-f="' + f + '" aria-pressed="' + (f === filtro) + '">' + (f === 'todos' ? 'Todos' : NOMES[f]) + '</button>';
        }).join('') + '</div>' + corpo + '<p class="nota">Placar e horários do futebol e da NBA atualizados sozinhos. <a href="onde-assistir.html">Onde assistir cada campeonato</a>.</p>';
    }
    raiz.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; filtro = b.getAttribute('data-f'); history.replaceState(null, '', '#' + filtro); pintarFds(); });
    pintarFds();
    window.aoMudarPlacar(pintarFds);
    return;
  }

  /* ---------- resumo da semana ---------- */
  if (pagina === 'resumo') {
    var de7 = somaDias(hoje, -7);
    var nEsp = (window.NOTICIAS_ESPORTES || []).filter(function (n) { return n.d >= de7 && n.d <= hoje; });
    var nAuto = (window.NOTICIAS_GERAIS || []).filter(function (n) { return n.d >= de7 && n.d <= hoje; });
    CATS.forEach(function (c) { (c.noticias || []).forEach(function (n) { if (n.d >= de7 && n.d <= hoje && !nAuto.some(function (x) { return x.t === n.t; })) nAuto.push({ d: n.d, cat: c.slug, t: n.t, x: n.x }); }); });
    /* os 5 fatos: manchetes primeiro, depois as mais recentes, no máximo duas por campeonato */
    function cinco(lista, chave) {
      var conta = {};
      return lista.slice().sort(function (a, b) { return (b.manchete ? 1 : 0) - (a.manchete ? 1 : 0) || (a.d < b.d ? 1 : -1); })
        .filter(function (n) { var k = n[chave] || '-'; conta[k] = (conta[k] || 0) + 1; return conta[k] <= 2; }).slice(0, 5);
    }
    function fatos(l, href, tag) { return l.length ? '<ol class="pg-fatos">' + l.map(function (n) { return '<li><a href="' + href(n) + '"><b>' + esc(n.t) + '</b><span>' + esc(tag(n)) + ' · ' + quando(n.d) + ' · ' + esc(curta(n.x)) + '</span></a></li>'; }).join('') + '</ol>' : '<p class="pg-vazio">Sem notícias nesta semana.</p>'; }
    function lideres(esp) {
      return '<div class="pg-times" style="margin-top:14px">' + COMPS.filter(function (c) { return c.esporte === esp && c.lider && c.lider.nome; }).map(function (c) {
        return '<a href="' + c.slug + '.html" title="' + esc(c.lider.info) + '">' + window.escudoTime(c.lider.nome) + '<span><small style="display:block;font-size:11px;color:var(--aco)">' + esc(c.menu) + '</small>' + esc(c.lider.nome) + '</span></a>';
      }).join('') + '</div>';
    }
    function resultados(esp) {
      var l = jogos(function (j, c) { return c.esporte === esp && j.p && j.d >= de7 && j.d <= hoje; }).reverse();
      var G = esp === 'basquete' ? /Lakers|Celtics|Knicks|Warriors|76ers|Heat|Thunder|Spurs|Real Madrid|Olympiacos|Franca|Flamengo/ : /Flamengo|Palmeiras|Corinthians|São Paulo|Santos|Vasco|Fluminense|Botafogo|Grêmio|Internacional|Atlético-MG|Cruzeiro|Real Madrid|Barcelona|Paris Saint-Germain|Bayern|Liverpool|Arsenal|Manchester City|Inter de Milão/;
      var grandes = l.filter(function (x) { return G.test(x.j.casa) || G.test(x.j.fora); });
      return listaJogos((grandes.length >= 4 ? grandes : l).slice(0, 8));
    }
    var vencedores = [];
    CATS.forEach(function (c) { (c.calendario || []).forEach(function (e) { if (e.venc && e.d >= de7 && e.d <= hoje) vencedores.push({ c: c, e: e }); }); });
    raiz.innerHTML = '<div class="pg-topo"><div><p class="pg-rot">De ' + window.dataCurta(de7) + ' a ' + window.dataCurta(hoje) + '</p><h1>Resumo da semana</h1><p>Os cinco fatos mais importantes de cada esporte nos últimos 7 dias, os resultados que mais pesaram e quem lidera cada campeonato.</p></div></div>' +
      '<div class="pg-filtros"><a class="ft-btn ft-btn-linha" href="#futebol">Futebol</a><a class="ft-btn ft-btn-linha" href="#basquete">Basquete</a><a class="ft-btn ft-btn-linha" href="#automobilismo">Fórmula 1</a></div>' +
      ['futebol', 'basquete'].map(function (esp) {
        var rs = resultados(esp);
        return '<section class="pg-sec" id="' + esp + '"><h2>' + NOMES[esp] + '</h2>' +
          fatos(cinco(nEsp.filter(function (n) { return n.esporte === esp; }), 'comp'), function (n) { return (n.comp || esp) + '.html'; }, function (n) { return porComp(n.comp).menu || NOMES[esp]; }) +
          (rs ? '<p class="pg-esp" style="margin-top:22px">Resultados da semana</p>' + rs : '') +
          '<p class="pg-esp" style="margin-top:22px">Quem lidera</p>' + lideres(esp) + '</section>';
      }).join('') +
      '<section class="pg-sec" id="automobilismo"><h2>Fórmula 1</h2>' +
        fatos(cinco(nAuto, 'cat'), function (n) { return (n.cat || 'automobilismo') + '.html'; }, function (n) { var c = CATS.filter(function (x) { return x.slug === n.cat; })[0]; return c ? c.menu || c.nome : 'Fórmula 1'; }) +
        (vencedores.length ? '<p class="pg-esp" style="margin-top:22px">Quem venceu</p><div class="pg-lista">' + vencedores.map(function (x) {
          return '<a class="pg-corrida" href="' + x.c.slug + '.html"><em>' + window.dataCurta(x.e.d) + '</em><span><b>' + esc(x.c.menu || x.c.nome) + ' · ' + esc(x.e.n) + '</b><small>' + esc(typeof x.e.venc === 'string' ? x.e.venc : (x.e.venc.nome || x.e.venc.p || '')) + '</small></span></a>';
        }).join('') + '</div>' : '') +
      '</section>';
    return;
  }

  /* ---------- mercado ---------- */
  if (pagina === 'mercado') {
    var M = (window.MERCADO || []).slice().sort(function (a, b) { return a.d < b.d ? 1 : -1; });
    var esp = (location.hash || '').slice(1); if (!NOMES[esp]) esp = 'futebol';
    var st = '';
    var ST = [['', 'Todos'], ['confirmado', 'Confirmados'], ['saida', 'Saídas'], ['especulacao', 'Rumores']];
    function pintarM() {
      var doEsp = M.filter(function (m) { return m.esporte === esp; });
      var l = doEsp.filter(function (m) { return !st || m.status === st; });
      raiz.innerHTML = '<div class="pg-topo"><div><p class="pg-rot">Contratações, saídas, renovações e rumores</p><h1>Mercado</h1><p>O que já foi confirmado aparece em verde, as saídas em vermelho e os rumores em amarelo. Rumor é negociação noticiada pela imprensa, ainda sem anúncio oficial.</p></div></div>' +
        '<div class="pg-filtros" role="group" aria-label="Esporte">' + ['futebol', 'basquete', 'automobilismo'].map(function (e) {
          return '<button type="button" data-e="' + e + '" aria-pressed="' + (e === esp) + '">' + NOMES[e] + ' (' + M.filter(function (m) { return m.esporte === e; }).length + ')</button>';
        }).join('') + '</div>' +
        '<div class="mk-filtros" role="group" aria-label="Situação">' + ST.map(function (s) {
          return '<button type="button" data-s="' + s[0] + '" aria-pressed="' + (s[0] === st) + '">' + s[1] + ' (' + doEsp.filter(function (m) { return !s[0] || m.status === s[0]; }).length + ')</button>';
        }).join('') + '</div>' +
        '<div class="mk-grade">' + (l.map(window.mercadoHTML).join('') || '<p class="pg-vazio">Nada nesta lista por enquanto.</p>') + '</div>' +
        '<p class="nota">Fontes: anúncios oficiais dos clubes e das equipes e imprensa esportiva (ge, ESPN, Lance, The Athletic, Marca, AS, Sky). Atualizado em ' + esc(window.ESPORTES_ATUALIZADO) + '.</p>';
    }
    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-e],[data-s]'); if (!b) return;
      if (b.hasAttribute('data-e')) { esp = b.getAttribute('data-e'); st = ''; history.replaceState(null, '', '#' + esp); } else st = b.getAttribute('data-s');
      pintarM();
    });
    pintarM();
  }
})();
