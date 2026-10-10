/* Central da F1 (página inicial): painel de vidro com o líder do campeonato, a próxima corrida (com o desenho da pista),
   a classificação e os melhores momentos oficiais. Dados: dados.js, assets/dados/pista-proxima.json e assets/dados/video-capa.js. */
(function () {
  var caixa = document.getElementById('central-f1');
  var f1 = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'formula-1'; })[0];
  if (!caixa || !f1) return;
  var esc = window.esc;
  var CORES = { 'Mercedes': '#00D7B6', 'Ferrari': '#ED1131', 'McLaren': '#F47600', 'Red Bull': '#4781D7', 'Red Bull Racing': '#4781D7', 'Aston Martin': '#229971',
    'Alpine': '#00A1E8', 'Williams': '#1868DB', 'Racing Bulls': '#6C98FF', 'Haas': '#9C9FA2', 'Audi': '#C0C2C4', 'Sauber': '#01C00E', 'Cadillac': '#B8B8B8' };
  function cor(eq) { for (var k in CORES) if (String(eq).indexOf(k) === 0) return CORES[k]; return '#e3343c'; }
  function pts(l) { return parseInt(String(l[l.length - 1]).replace(/\D/g, ''), 10) || 0; }
  var lin = (f1.classificacao && f1.classificacao.linhas) || [];
  if (!lin.length) { caixa.hidden = true; return; }
  var L = lin[0], nome = String(L[1]), equipe = String(L[2]), cl = cor(equipe);
  var corridas = f1.calendario.filter(function (e) { return e.venc; });
  var vitorias = corridas.filter(function (e) { return String(e.venc).indexOf(nome) === 0; }).length;
  var partes = nome.split(' '), primeiro = partes.shift(), resto = partes.join(' ');
  var hoje = window.hojeISO(), e = f1.calendario.filter(function (x) { return !x.venc && x.d && x.d >= hoje; })[0];

  /* sessões da próxima etapa com o horário em milissegundos */
  var sess = e ? (e.s || []).filter(function (s) { return s.d && s.h; }).map(function (s) { return { t: s.t, d: s.d, h: s.h, ms: Date.parse(s.d + 'T' + s.h + ':00-03:00') }; }) : [];
  var corrida = sess.filter(function (s) { return /^Corrida/.test(s.t); }).pop();

  var top = lin.slice(0, 4).map(function (l, i) {
    return '<li><span class="cf-pos">' + (i + 1) + '</span><i style="background:' + cor(l[2]) + '"></i><b>' + esc(l[1]) + '</b><span class="cf-pts">' + pts(l) + ' pts</span></li>';
  }).join('');
  var V = (window.VIDEOS_F1 || []).slice(0, 3);
  var videos = V.length ? V.map(function (v) {
    return '<a class="cf-video" href="https://www.youtube.com/watch?v=' + v.id + '" target="_blank" rel="noopener"><span class="cf-mini"><img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy"><i aria-hidden="true"></i></span><span>' + esc(v.titulo.split(' · ')[0]) + '<small>' + esc(v.titulo.split(' · ')[1] || 'Canal oficial da F1') + '</small></span></a>';
  }).join('') : '<p class="cf-vazio">Os vídeos aparecem depois da próxima sessão.</p>';

  caixa.innerHTML = '<div class="moldura"><div class="cf-vidro" style="--cf-cor:' + cl + '">' +
    '<div class="cf-topo">' +
      '<div class="cf-destaque">' +
        '<p class="cf-rot">Fórmula 1 · líder do campeonato</p>' +
        '<h2 class="cf-nome" id="central-t">' + esc(primeiro) + '<br><span>' + esc(resto) + '</span></h2>' +
        '<p class="cf-equipe"><i></i>' + esc(equipe) + '</p>' +
        '<p class="cf-frase">' + pts(L) + ' pontos' + (lin[1] ? ', ' + (pts(L) - pts(lin[1])) + ' à frente de ' + esc(lin[1][1]) : '') + '. ' + vitorias + (vitorias === 1 ? ' vitória' : ' vitórias') + ' em ' + corridas.length + ' corridas.</p>' +
        '<a class="cf-bt" href="formula-1.html">Ver a temporada <span aria-hidden="true">→</span></a>' +
      '</div>' +
      '<div class="cf-numero" aria-hidden="true">1</div>' +
    '</div>' +
    '<div class="cf-cartoes">' +
      '<a class="cf-cartao cf-prox" href="formula-1.html"><h3>Próxima corrida</h3>' +
        (e ? '<p class="cf-gp">' + esc(e.n) + '<small>' + esc(e.l) + '</small></p><svg class="cf-pista" viewBox="0 0 400 400" aria-hidden="true"></svg>' +
          '<p class="cf-data">' + window.dataCurta(e.d).toUpperCase() + (corrida ? ' · ' + corrida.h.replace(':', 'h') : '') + '<small>Dia da corrida</small></p>' : '<p class="cf-vazio">Temporada encerrada.</p>') + '</a>' +
      '<div class="cf-cartao"><h3>Classificação</h3><ol class="cf-tab">' + top + '</ol><a class="cf-link" href="formula-1.html#classificacao">Ver a classificação completa</a></div>' +
      '<div class="cf-cartao"><h3>Melhores momentos</h3><div class="cf-videos">' + videos + '</div><a class="cf-link" href="raiox.html#telemetria">Compare as voltas na telemetria</a></div>' +
    '</div>' +
    '<div class="cf-faixa" aria-live="off"><span class="cf-vivo" aria-hidden="true"></span><span class="cf-faixa-txt"></span>' +
      '<button type="button" class="cf-alerta alerta-bt" data-alerta="formula-1" data-rotulo="Avisar 30 min antes" aria-pressed="false">Avisar 30 min antes</button></div>' +
  '</div></div>';

  /* faixa de baixo: a próxima sessão e quanto falta */
  var txt = caixa.querySelector('.cf-faixa-txt');
  function falta(ms) {
    var m = Math.max(0, Math.round((ms - Date.now()) / 60000)), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    return d ? d + ' d ' + h + ' h' : h ? h + ' h ' + mm + ' min' : mm + ' min';
  }
  function faixa() {
    var agora = Date.now();
    var aoVivo = sess.filter(function (s) { return s.ms <= agora && agora < s.ms + 2 * 36e5 && /Classifica|Sprint|Corrida/.test(s.t); }).pop();
    var prox = sess.filter(function (s) { return s.ms > agora; })[0];
    caixa.querySelector('.cf-faixa').classList.toggle('ao-vivo', !!aoVivo);
    if (aoVivo) txt.innerHTML = '<b>Agora:</b> ' + esc(aoVivo.t) + ' · ' + esc(e.n);
    else if (prox) txt.innerHTML = '<b>' + esc(prox.t) + '</b> · ' + (prox.d === hoje ? 'hoje' : window.dataCurta(prox.d)) + ', ' + prox.h.replace(':', 'h') + ' (Brasília) · <span class="cf-falta">em ' + falta(prox.ms) + '</span>';
    else txt.textContent = e ? e.n + ': horários a confirmar' : 'Temporada encerrada';
  }
  faixa(); setInterval(faixa, 30000);

  /* desenho da pista (o mesmo da prévia da F1) */
  var svg = caixa.querySelector('.cf-pista');
  if (svg && e) fetch('assets/dados/pista-proxima.json?t=' + Math.floor(Date.now() / 6e5)).then(function (r) { return r.json(); }).then(function (M) {
    if (!M || M.etapa !== e.n || !M.d) { svg.remove(); return; }
    svg.innerHTML = '<path class="cf-pista-fundo" d="' + M.d + '"/><path class="cf-pista-linha" d="' + M.d + '"/>' + (M.largada && M.largada.p ? '<circle cx="' + M.largada.p[0] + '" cy="' + M.largada.p[1] + '" r="9"/>' : '');
    try { var b = svg.getBBox(); svg.setAttribute('viewBox', [b.x - 12, b.y - 12, b.width + 24, b.height + 24].join(' ')); } catch (er) {}
  }).catch(function () { svg.remove(); });
})();
