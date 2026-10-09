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
    '<div class="cat-rodape"><div><p class="cat-intro">' + esc(c.intro) + '</p>' +
    '<p class="cat-alerta"><button type="button" class="alerta-bt" data-alerta="' + c.slug + '" data-rotulo="Avisar 30 min antes da largada" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 20.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span class="alerta-txt">Avisar 30 min antes da largada</span></button></p>' + (c.guia === false ? '' : '<a class="cat-guia" href="guia-' + c.slug + '.html">Novo por aqui? Veja como funciona ' + (/^(Fórmula|Stock|Porsche|NASCAR|IndyCar|MotoGP)/.test(c.nome) ? 'a ' : 'o ') + esc(c.nome) + '</a>') + '</div>' +
    '<div class="cat-lider"><span>Na ponta</span><b>' + esc(c.lider.nome) + '</b><small>' + esc(c.lider.info) + '</small></div></div></div>';
  var img = document.querySelector('.cat-foto img');
  function mostrar() { img.classList.add('pronta'); }
  if (img.complete) mostrar(); else img.addEventListener('load', mostrar);

  /* Onde assistir no Brasil (assets/js/onde-assistir-dados.js, carregado aqui) */
  (function () {
    /* a vaga do quadro já entra agora, com a altura reservada, para a página não pular quando os canais chegarem (CLS) */
    document.getElementById('abas-barra').insertAdjacentHTML('beforebegin', '<div class="moldura oa-vaga" id="oa-vaga"></div>');
    var vaga = document.getElementById('oa-vaga');
    var s = document.createElement('script'); s.src = 'assets/js/onde-assistir-dados.js?v=237';
    s.onload = function () {
      var q = window.ONDE_ASSISTIR && window.ONDE_ASSISTIR.quadro(c.slug);
      if (!q) { vaga.remove(); return; }
      vaga.innerHTML = '<section class="oa-bloco" id="onde-assistir"><p class="oa-rot">Como assistir</p><h2>Onde assistir no Brasil</h2>' + q + '</section>';
      vaga.classList.remove('oa-vaga');
    };
    s.onerror = function () { vaga.remove(); };
    document.body.appendChild(s);
  })();

  /* Prévia da próxima etapa: horários de Brasília, previsão do tempo com o que ela muda na corrida (chuva, calor, vento)
     e como está o campeonato. Localização das pistas: locais-pistas.js e previa-pistas.js (F1 e F2, com os números da pista). */
  (function () {
    var e = c.calendario.filter(function (x) { return !x.venc && x.d && x.d >= hoje; })[0];
    var vaga = document.getElementById('oa-vaga');
    if (!e || !vaga) return;
    var MOTO = /motogp|superbike|motocross/.test(c.slug), veiculo = MOTO ? 'a moto' : 'o carro';
    var L = window.LOCAIS_PISTAS || {}, PP = window.PREVIA_PISTAS || {};
    var pista = /^formula-[12]$/.test(c.slug) ? PP[e.l] : null;
    var loc = L[c.slug + '|' + e.n] || L[e.l] || PP[e.l] || null;
    var restam = c.calendario.filter(function (x) { return !x.venc; }).length;
    function pts(l) { return parseInt(String(l[l.length - 1]).replace(/\D/g, ''), 10) || 0; }
    var lin = (c.classificacao && c.classificacao.linhas || []).slice(0, 3);
    var camp = '';
    if (lin.length >= 2) {
      var gap = pts(lin[0]) - pts(lin[1]);
      camp = '<ul class="pv-lista"><li><b>' + esc(lin[0][1]) + '</b> lidera com ' + pts(lin[0]) + ' pontos, ' + gap + ' à frente de <b>' + esc(lin[1][1]) + '</b>.</li>' +
        (lin[2] ? '<li><b>' + esc(lin[2][1]) + '</b> é o 3º, a ' + (pts(lin[0]) - pts(lin[2])) + ' pontos do líder.</li>' : '') +
        '<li>' + (restam === 1 ? 'Esta é a última etapa da temporada.' : 'Restam ' + restam + ' etapas, contando esta.') + '</li></ul>';
    }
    var numeros = pista ? '<ul class="pv-num"><li><b>' + pista.km.toFixed(3).replace('.', ',') + ' km</b><span>por volta</span></li><li><b>' + pista.voltas + '</b><span>voltas</span></li><li><b>' + Math.round(pista.km * pista.voltas) + ' km</b><span>de corrida</span></li></ul>' +
      (pista.venc ? '<p class="pv-sub">' + esc(pista.vencTitulo || 'Vencedores dos últimos anos') + '</p><ul class="pv-venc">' + pista.venc.map(function (v) { return '<li><span>' + v[0] + '</span>' + esc(v[1]) + '</li>'; }).join('') + '</ul>' : '') : '';
    vaga.insertAdjacentHTML('beforebegin', '<section class="moldura pv-cat" aria-labelledby="pv-cat-t"><div class="pv-cat-in">' +
      '<p class="oa-rot">Próxima etapa · etapa ' + e.e + ' de ' + c.calendario.length + '</p>' +
      '<h2 id="pv-cat-t">' + esc(e.n) + '</h2><p class="pv-onde">' + esc(e.l) + ', ' + window.dataCurta(e.d) + (e.nota ? '. ' + esc(e.nota.charAt(0).toUpperCase() + e.nota.slice(1)) + '.' : '') + '</p>' + window.contagem(e) +
      '<div class="pv-grade">' +
        '<div class="pv-bloco"><h3>Horários de Brasília</h3>' + ((e.s && e.s.length) ? window.sessoes(e) : '<p class="pv-vazio">Os horários entram assim que a categoria divulgar.</p>') + '</div>' +
        '<div class="pv-bloco pv-tempo-bloco"><h3>Previsão do tempo</h3><div id="pv-tempo">' + (loc ? '<p class="pv-vazio">Buscando a previsão…</p>' : '<p class="pv-vazio">Previsão indisponível para esta pista.</p>') + '</div></div>' +
        (camp ? '<div class="pv-bloco"><h3>Campeonato</h3>' + camp + '</div>' : '') +
        (numeros ? '<div class="pv-bloco"><h3>Números da pista</h3>' + numeros + '</div>' : '') +
      '</div></div></section>');
    if (!loc) return;
    var el = document.getElementById('pv-tempo');
    var dias = {}; (e.s || []).forEach(function (x) { if (x.d) dias[x.d] = (dias[x.d] || []).concat(x.t); });
    if (!Object.keys(dias).length) dias[e.d] = ['Corrida'];
    var lista = Object.keys(dias).sort(), ini = lista[0], fim = lista[lista.length - 1];
    if ((new Date(ini + 'T12:00:00') - new Date(hoje + 'T12:00:00')) / 864e5 > 15) { el.innerHTML = '<p class="pv-vazio">A previsão aparece a partir de 15 dias antes da etapa.</p>'; return; }
    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat + '&longitude=' + loc.lon +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&start_date=' + ini + '&end_date=' + fim)
      .then(function (r) { return r.json(); }).then(function (j) {
        var d = j.daily; if (!d || !d.time) throw 0;
        var forte = [], talvez = [], ventos = [], calor = [], frio = [];
        var html = '<ul class="pv-tempo">' + d.time.map(function (dia, i) {
          if (!dias[dia]) return '';
          var chuva = d.precipitation_probability_max[i], tmax = Math.round(d.temperature_2m_max[i]), tmin = Math.round(d.temperature_2m_min[i]);
          var vento = Math.round(d.wind_speed_10m_max[i] || 0), raj = Math.round(d.wind_gusts_10m_max[i] || 0);
          var ic = chuva >= 60 ? '🌧️' : chuva >= 30 ? '🌦️' : '☀️';
          var quando = dia.split('-').reverse().slice(0, 2).join('/');
          if (chuva >= 60) forte.push(quando + ' (' + chuva + '%)'); else if (chuva >= 30) talvez.push(quando + ' (' + chuva + '%)');
          if (raj >= 45 || vento >= 30) ventos.push(quando + ' (rajadas de ' + raj + ' km/h)');
          if (tmax >= 32) calor.push(quando + ' (' + tmax + '°)'); else if (tmax <= 12) frio.push(quando + ' (' + tmax + '°)');
          return '<li><span class="pv-dia">' + quando + ' · ' + esc(dias[dia].join(', ')) + '</span><b>' + ic + ' ' + tmax + '° / ' + tmin + '°</b>' +
            '<span class="pv-det">Chuva: ' + (chuva == null ? '—' : chuva + '%') + ' · Vento: ' + vento + ' km/h' + (raj > vento ? ' (rajadas de ' + raj + ')' : '') + '</span></li>';
        }).join('') + '</ul>';
        function juntar(l) { return l.length > 1 ? l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1] : l[0]; }
        var notas = [];
        if (forte.length) notas.push('Grande chance de chuva em ' + juntar(forte) + '. Pista molhada embaralha o grid e a escolha de pneus vira loteria.');
        if (talvez.length) notas.push('Pode chover em ' + juntar(talvez) + '. As equipes ficam de olho no radar.');
        if (ventos.length) notas.push('Vento forte em ' + juntar(ventos) + '. ' + (MOTO ? 'A moto balança nas retas e o piloto sofre para segurar nas freadas.' : 'O carro fica instável nas retas e nas freadas, e o vento de frente ou de trás muda a velocidade final.'));
        if (calor.length) notas.push('Calor em ' + juntar(calor) + '. Os pneus desgastam mais rápido e o piloto se cansa mais.');
        if (frio.length) notas.push('Frio em ' + juntar(frio) + '. Os pneus demoram a esquentar nas primeiras voltas.');
        if (!notas.length) notas.push('Tempo firme, sem vento forte nem calor extremo: deve ser uma etapa sem surpresas do clima.');
        el.innerHTML = html + '<p class="pv-sub">O que o tempo muda na corrida</p><ul class="pv-lista">' + notas.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' +
          '<p class="pv-fonte">Previsão no horário local da pista. Fonte: Open-Meteo.</p>';
      }).catch(function () { el.innerHTML = '<p class="pv-vazio">Não foi possível buscar a previsão agora.</p>'; });
  })();

  /* Próxima etapa */
  var proximaIdx = -1;
  c.calendario.forEach(function (e, i) { if (proximaIdx < 0 && !e.venc && (!e.d || e.d >= hoje)) proximaIdx = i; });

  function tabela(t) {
    return '<div class="tabela-wrap"><table class="tabela"><thead><tr>' + t.colunas.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.linhas.map(function (l) { return '<tr class="p' + esc(l[0]) + '">' + l.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }
  /* página "horário e onde assistir" da etapa (feita por .github/paginas-horarios.js, mesmo nome de arquivo) */
  function paginaHorario(e) {
    if (!e.d || e.d < '2026-09-01') return '';
    return 'horario-' + c.slug + '-' + e.n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + e.d.slice(0, 4) + '.html';
  }
  function etapa(e, i) {
    var feita = !!e.venc;
    var cls = feita ? ' feita' : (i === proximaIdx ? ' proxima' : '');
    var status = feita ? 'Encerrada' : (e.d ? (i === proximaIdx ? (window.diasAte(e.d) >= 0 ? window.quando(e.d) : 'Próxima') : (e.d < hoje ? 'Aguardando resultado' : 'Programada')) : 'A confirmar');
    var venc = feita ? 'Vencedor: ' + e.venc : (e.parcial || e.nota || '');
    return '<li class="etapa' + cls + '"><span class="etapa-n">' + ('0' + e.e).slice(-2) + '</span>' +
      '<span class="etapa-nome">' + esc(e.n) + '<small>' + esc(e.l) + '</small>' + (paginaHorario(e) ? '<a class="etapa-hr" href="' + paginaHorario(e) + '">' + (feita ? 'Horários e onde passou' : 'Horário e onde assistir') + ' →</a>' : '') + '</span>' +
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
  (window.NOTICIAS_GERAIS || []).filter(function (n) { return n.cat === c.slug; })
    .concat((window.NOTICIAS_ARQUIVO || {})[c.slug] || [], c.noticias || []).forEach(function (n, i) {
    var chave = n.t.toLowerCase();
    if (vistas[chave]) return;
    vistas[chave] = 1;
    lista.push({ d: n.d, t: (en && n.t_en) || n.t, x: (en && n.x_en) || n.x, ordem: i });
  });
  /* cada etapa com vencedor também vira uma notícia curta de resultado (se não houver notícia daquele dia) */
  var diasComNoticia = {}; lista.forEach(function (n) { diasComNoticia[n.d] = 1; });
  var total = c.calendario.length;
  c.calendario.forEach(function (e, i) {
    if (!e.venc || !e.d || e.d > hoje || diasComNoticia[e.d]) return;
    lista.push({ d: e.d, t: 'Resultado: ' + e.n, x: 'Vencedor: ' + e.venc + '. ' + (e.l ? e.l + ', ' : '') + 'etapa ' + e.e + ' de ' + total + ' da temporada.', ordem: 1000 + i, res: 1 });
  });
  lista.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : a.ordem - b.ordem; });
  var mostrar = 9, extras = lista.length - mostrar;
  P.noticias = '<h2>Notícias</h2><div class="noticias">' + lista.map(function (n, i) {
    return '<article class="noticia' + (n.res ? ' noticia-res' : '') + '"' + (i >= mostrar ? ' hidden' : '') + '>' +
      '<time datetime="' + n.d + '">' + window.dataCurta(n.d) + (n.res ? ' · Resultado' : '') + '</time><h3>' + esc(n.t) + '</h3><p>' + esc(n.x) + '</p></article>';
  }).join('') + '</div>' +
    (extras > 0 ? '<button type="button" class="ct-mini noticias-mais" onclick="[].forEach.call(this.previousElementSibling.querySelectorAll(\'.noticia[hidden]\'),function(a){a.hidden=false});this.remove()">Ver mais ' + extras + ' notícias</button>' : '');

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
      /* só rola a lista de abas para o lado (scrollIntoView rolava a página inteira para baixo ao abrir) */
      if (sim) { var li = b.parentNode; abas.scrollLeft = Math.max(0, li.offsetLeft - 16); if (abas.parentNode) abas.parentNode.scrollLeft = Math.max(0, li.offsetLeft - 16); }
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
