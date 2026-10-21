/* Busca (busca.html?q=...): um campo só para achar tudo do site enquanto digita.
   - Times (futebol e basquete): próximo jogo, último resultado e posição nas tabelas;
   - Jogadores: números da temporada (temporada-futebol.js e temporada-nba.js, carregados depois que a página abre);
   - Pilotos da F1: posição, equipe e pontos no campeonato;
   - Campeonatos e notícias.
   A lupa do topo do site (site.js) traz para cá. */
(function () {
  var caixa = document.getElementById('bu');
  if (!caixa) return;
  var esc = window.esc, COMPS = window.COMPETICOES || [], hoje = window.hojeISO();
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
  var SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  function dia(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : SEMANA[new Date(d + 'T12:00:00').getDay()] + ', ' + window.dataCurta(d); }
  var APELIDOS = { 'Paris Saint-Germain': 'psg', 'Bayern de Munique': 'bayern', 'Inter de Milão': 'inter', 'Manchester United': 'man united', 'Manchester City': 'man city', 'Atlético de Madrid': 'atleti', 'Red Bull Bragantino': 'bragantino', 'Olympique de Marselha': 'marseille', 'Los Angeles Lakers': 'lakers', 'Golden State Warriors': 'warriors gsw' };

  /* ---------- o que dá para achar ---------- */
  function compDe(slug) { return COMPS.filter(function (c) { return c.slug === slug; })[0]; }
  var TIMES = (window.todosTimes ? window.todosTimes() : []).map(function (t) { return { tipo: 'time', nome: t.nome, t: t, busca: norm(t.nome + ' ' + (APELIDOS[t.nome] || '') + (t.esporte === 'basquete' ? ' ' + t.nome.split(' ').pop() : '')) }; });
  var CAMPS = COMPS.map(function (c) { return { tipo: 'camp', nome: c.nome, c: c, busca: norm(c.nome + ' ' + c.menu + ' ' + c.slug) }; });
  var F1 = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'formula-1'; })[0];
  if (F1) CAMPS.push({ tipo: 'camp', nome: 'Fórmula 1', c: { slug: 'automobilismo', nome: 'Fórmula 1', menu: 'Fórmula 1', esporte: 'automobilismo' }, busca: 'formula 1 f1 formula um' });
  var PILOTOS = [];
  if (F1 && F1.classificacao) {
    var T = F1.classificacao, ip = T.colunas.indexOf('Piloto'), ie = T.colunas.indexOf('Equipe'), ipt = T.colunas.indexOf('Pts');
    PILOTOS = T.linhas.map(function (l) { return { tipo: 'piloto', nome: l[ip], equipe: l[ie], pts: l[ipt], pos: l[0], busca: norm(l[ip] + ' ' + l[ie]) }; });
  }
  var NOTS = (window.NOTICIAS_ESPORTES || []).map(function (n) { return { tipo: 'not', n: n, esp: n.esporte, busca: norm(n.t + ' ' + (n.x || '')) }; })
    .concat((window.NOTICIAS_GERAIS || []).map(function (n) { return { tipo: 'not', n: n, esp: 'automobilismo', busca: norm(n.t + ' ' + (n.x || '')) }; }));
  var JOG = null; /* jogadores: montados quando os números da temporada chegam */
  function montarJogadores() {
    var TF = window.TEMPORADA_FUTEBOL, TN = window.TEMPORADA_NBA;
    if (!TF && !TN) return;
    var por = {};
    ((TF && TF.jogadores) || []).forEach(function (l) {
      var x = por[l[0]] = por[l[0]] || { tipo: 'jog', esp: 'futebol', id: l[0], nome: l[1], time: l[2], j: 0, g: 0, a: 0 };
      x.j += l[5]; x.g += l[7]; x.a += l[8];
    });
    JOG = Object.keys(por).map(function (k) { var x = por[k]; x.busca = norm(x.nome); return x; });
    var ts = Object.keys((TN && TN.temporadas) || {}).sort().reverse();
    var t = ts.filter(function (k) { return TN.temporadas[k].some(function (l) { return l[4] >= 5; }); })[0] || ts[0];
    ((t && TN.temporadas[t]) || []).forEach(function (l) { JOG.push({ tipo: 'jog', esp: 'basquete', id: l[0], nome: l[1], time: l[2], temp: t, v: l, busca: norm(l[1]) }); });
  }

  /* nota de quanto o texto bate: nome igual > começa igual > uma palavra começa igual > contém */
  function nota(x, q, termos) {
    var b = x.busca;
    if (!termos.every(function (t) { return b.indexOf(t) > -1; })) return 0;
    var nn = norm(x.nome || '');
    if (nn === q) return 100;
    if (nn.indexOf(q) === 0) return 80;
    if ((' ' + nn).indexOf(' ' + termos[0]) > -1) return 60;
    return 30;
  }
  function achar(lista, q, termos, max, peso) {
    return lista.map(function (x) { return { x: x, n: nota(x, q, termos) }; }).filter(function (r) { return r.n > 0; })
      .map(function (r) { if (peso) r.n += peso(r.x); return r; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, max).map(function (r) { return r.x; });
  }

  /* ---------- cartões ---------- */
  function jogosDoTime(nome, esporte) {
    var L = [];
    COMPS.forEach(function (c) { if (c.esporte !== esporte) return; (c.jogos || []).forEach(function (j) { if (j.casa === nome || j.fora === nome) L.push({ c: c, j: j }); }); });
    return L.sort(function (a, b) { return (a.j.d + (a.j.h || '')) < (b.j.d + (b.j.h || '')) ? -1 : 1; });
  }
  function cartaoTime(x) {
    var t = x.t, L = jogosDoTime(t.nome, t.esporte);
    var prox = L.filter(function (g) { return !g.j.p && g.j.d && g.j.d >= hoje; })[0], ult = L.filter(function (g) { return g.j.p; }).pop();
    var vivo = L.filter(function (g) { return g.j.vivo; })[0];
    function adv(g) { return g.j.casa === t.nome ? g.j.fora : g.j.casa; }
    var linhas = [];
    if (vivo) linhas.push('<li class="bu-vivo"><span>Ao vivo</span><b>' + esc(vivo.j.casa) + ' ' + esc(vivo.j.vivo.p) + ' ' + esc(vivo.j.fora) + '</b><small>' + esc(vivo.j.vivo.min || '') + '</small></li>');
    if (prox) linhas.push('<li><span>Próximo jogo</span><b>' + dia(prox.j.d) + (prox.j.h ? ', ' + esc(prox.j.h) : '') + ' · ' + (prox.j.casa === t.nome ? 'x ' : '@ ') + esc(adv(prox)) + '</b><small>' + esc(prox.c.menu) + (prox.j.fase ? ' · ' + esc(prox.j.fase) : '') + '</small></li>');
    if (ult) {
      var pl = ult.j.p.split(/\s*x\s*/).map(Number), meu = ult.j.casa === t.nome ? pl[0] : pl[1], deles = ult.j.casa === t.nome ? pl[1] : pl[0], r = meu > deles ? 'V' : meu < deles ? 'D' : 'E';
      linhas.push('<li><span>Último resultado</span><b><i class="pj-' + r + ' bu-r">' + r + '</i>' + meu + '–' + deles + ' ' + (ult.j.casa === t.nome ? 'x ' : '@ ') + esc(adv(ult)) + '</b><small>' + dia(ult.j.d) + ' · ' + esc(ult.c.menu) + '</small></li>');
    }
    t.comps.forEach(function (s) {
      var c = compDe(s); if (!c) return;
      [c.tabela, c.tabela2].forEach(function (tb) {
        if (!tb || !tb.linhas || /passada|final da temporada/i.test(tb.titulo || '')) return;
        var iT = tb.colunas.indexOf('Time'), iP = tb.colunas.indexOf('Pts'), iV = tb.colunas.indexOf('V-D');
        tb.linhas.forEach(function (l, k) { if (l[iT] === t.nome) linhas.push('<li><span>' + esc(c.menu) + '</span><b>' + esc(l[0] || k + 1) + 'º lugar</b><small>' + (iP > -1 ? esc(l[iP]) + ' pontos' : iV > -1 ? esc(l[iV]) : '') + '</small></li>'); });
      });
    });
    var links = '<a href="' + window.linkTime(t.nome) + '">Página do time</a>' + (prox && window.linkPartida && window.linkPartida(prox.j, t.esporte) ? '<a href="' + window.linkPartida(prox.j, t.esporte) + '">Pré-jogo</a>' : '');
    return '<article class="bu-card bu-time"><header>' + window.escudoTime(t.nome, 'bu-escudo') + '<div><b>' + esc(t.nome) + '</b><small>' + (t.esporte === 'basquete' ? 'Basquete' : 'Futebol') + ' · ' +
      t.comps.map(function (s) { var c = compDe(s); return c ? esc(c.menu) : ''; }).filter(Boolean).join(', ') + '</small></div></header>' +
      (linhas.length ? '<ul class="bu-info">' + linhas.join('') + '</ul>' : '') + '<nav class="bu-links">' + links + '</nav></article>';
  }
  function cartaoJogador(x) {
    var nums = x.esp === 'futebol' ? x.j + (x.j === 1 ? ' jogo' : ' jogos') + ' · ' + x.g + (x.g === 1 ? ' gol' : ' gols') + ' · ' + x.a + (x.a === 1 ? ' assistência' : ' assistências')
      : String(x.v[6]).replace('.', ',') + ' pts · ' + String(x.v[7]).replace('.', ',') + ' reb · ' + String(x.v[8]).replace('.', ',') + ' ast por jogo (' + esc(x.temp) + ')';
    return '<a class="bu-card bu-linha" href="comparar.html#' + x.esp + ':' + esc(x.id) + ',">' + window.escudoTime(x.time, 'bu-escudo-p') + '<div><b>' + esc(x.nome) + '</b><small>' + esc(x.time) + ' · ' + (x.esp === 'futebol' ? 'Futebol' : 'NBA') + '</small><span>' + nums + '</span></div><i>Comparar →</i></a>';
  }
  function cartaoPiloto(x) {
    return '<a class="bu-card bu-linha" href="comparar.html#f1:' + norm(x.nome).replace(/ /g, '-') + ',"><span class="bu-pos">' + esc(x.pos) + 'º</span><div><b>' + esc(x.nome) + '</b><small>' + esc(x.equipe) + ' · Fórmula 1</small><span>' + esc(x.pts) + ' pontos no campeonato</span></div><i>Comparar →</i></a>';
  }
  function cartaoCamp(x) {
    var c = x.c, href = c.slug === 'automobilismo' ? 'automobilismo.html' : c.slug + '.html';
    var lider = c.tabela && c.tabela.linhas && c.tabela.linhas[0] ? c.tabela.linhas[0][c.tabela.colunas.indexOf('Time')] : '';
    return '<a class="bu-card bu-linha" href="' + href + '"><span class="bu-pos bu-camp">' + esc((c.menu || c.nome).slice(0, 3)) + '</span><div><b>' + esc(c.nome) + '</b><small>' + (lider ? 'Na ponta: ' + esc(lider) : 'Jogos, tabela e notícias') + '</small></div><i>Abrir →</i></a>';
  }
  function cartaoNot(x) {
    var n = x.n, interno = n.link && !/^https?:/.test(n.link) ? n.link : x.esp === 'automobilismo' && window.linkNoticia ? window.linkNoticia(n.t) : '';
    var corpo = '<small>' + dia(n.d) + ' · ' + (x.esp === 'automobilismo' ? 'Fórmula 1' : x.esp === 'basquete' ? 'Basquete' : 'Futebol') + (n.fonte ? ' · Fonte: ' + esc(n.fonte) : '') + '</small><b>' + esc(n.t) + '</b>';
    return interno ? '<a class="bu-card bu-not" href="' + esc(interno) + '">' + corpo + '</a>' : '<div class="bu-card bu-not">' + corpo + '</div>';
  }

  /* ---------- tela ---------- */
  var SUGESTOES = ['Flamengo', 'Palmeiras', 'Corinthians', 'Real Madrid', 'Lakers', 'Vinícius Júnior', 'Brasileirão', 'Verstappen'];
  function resultados(q) {
    var nq = norm(q), termos = nq.split(' ').filter(Boolean);
    if (nq.length < 2) return '<div class="bu-sug"><p>Experimente:</p>' + SUGESTOES.map(function (s) { return '<button type="button" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>';
    var times = achar(TIMES, nq, termos, 4), camps = achar(CAMPS, nq, termos, 3), pil = achar(PILOTOS, nq, termos, 4);
    var jog = JOG ? achar(JOG, nq, termos, 6, function (x) { return x.esp === 'futebol' ? Math.min(20, x.j) / 2 : Math.min(20, x.v[4]) / 2; }) : null;
    var nots = NOTS.filter(function (x) { return termos.every(function (t) { return x.busca.indexOf(t) > -1; }); }).sort(function (a, b) { return a.n.d < b.n.d ? 1 : -1; }).slice(0, 6);
    var h = '';
    if (times.length) h += '<section class="bu-sec"><h2>Times</h2><div class="bu-times">' + times.map(cartaoTime).join('') + '</div></section>';
    if (pil.length) h += '<section class="bu-sec"><h2>Pilotos</h2>' + pil.map(cartaoPiloto).join('') + '</section>';
    if (jog && jog.length) h += '<section class="bu-sec"><h2>Jogadores</h2>' + jog.map(cartaoJogador).join('') + '</section>';
    else if (!jog) h += '<p class="bu-carrega">Procurando jogadores…</p>';
    if (camps.length) h += '<section class="bu-sec"><h2>Campeonatos</h2>' + camps.map(cartaoCamp).join('') + '</section>';
    if (nots.length) h += '<section class="bu-sec"><h2>Notícias</h2>' + nots.map(cartaoNot).join('') + '</section>';
    return h || '<p class="pt-vazio">Nada encontrado para “' + esc(q) + '”. Tente só o nome do time, do jogador ou do campeonato.</p>';
  }
  var q0 = decodeURIComponent((location.search.match(/[?&]q=([^&]*)/) || [])[1] || '').replace(/\+/g, ' ');
  caixa.innerHTML = '<form class="bu-form" role="search" action="busca.html"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
    '<input id="bu-q" name="q" type="search" autocomplete="off" placeholder="Time, jogador, piloto ou campeonato" aria-label="Buscar no site" value="' + esc(q0) + '"></form><div id="bu-res" aria-live="polite"></div>';
  var inp = document.getElementById('bu-q'), res = document.getElementById('bu-res'), espera = null;
  function pintar() {
    res.innerHTML = resultados(inp.value);
    [].forEach.call(res.querySelectorAll('.bu-sug button'), function (b) { b.addEventListener('click', function () { inp.value = b.getAttribute('data-q'); atualizar(); }); });
  }
  function atualizar() {
    history.replaceState(null, '', inp.value.trim() ? 'busca.html?q=' + encodeURIComponent(inp.value.trim()) : 'busca.html');
    pintar();
  }
  inp.addEventListener('input', function () { clearTimeout(espera); espera = setTimeout(atualizar, 120); });
  caixa.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); atualizar(); inp.blur(); });
  pintar();
  inp.focus();
  /* os números dos jogadores são grandes: chegam depois, sem travar a busca */
  var faltam = 0;
  ['assets/dados/temporada-futebol.js', 'assets/dados/temporada-nba.js'].forEach(function (src) {
    faltam++;
    var s = document.createElement('script'); s.src = src + '?v=367';
    s.onload = s.onerror = function () { if (--faltam === 0) { montarJogadores(); if (!JOG) JOG = []; pintar(); } };
    document.body.appendChild(s);
  });
})();
