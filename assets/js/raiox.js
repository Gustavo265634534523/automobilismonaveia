/* Raio-x pós-corrida: posições volta a volta, pneus e paradas. Dados em window.RAIOX. */
(function () {
  var R = window.RAIOX;
  if (!R) return;
  var NV = R.voltas;
  var P = R.pilotos;
  /* paleta validada para a superfície escura (#1c2025): 4 destaques */
  var CORES = ['#3987e5', '#d95926', '#199e70', '#c98500'];
  var PNEU = { SOFT: ['Macio', 'M', '#e3343c'], MEDIUM: ['Médio', 'Md', '#e8b923'], HARD: ['Duro', 'D', '#e4e7ea'], INTERMEDIATE: ['Intermediário', 'I', '#3aa655'], WET: ['Chuva', 'C', '#3987e5'] };
  var dica = document.getElementById('rx-dica');
  function seg(n) { return n.toFixed(1).replace('.', ','); }
  function tempoPit(p) { return p.paradas.reduce(function (s, x) { return s + (x.tempo || 0); }, 0); }

  document.getElementById('rx-titulo').textContent = 'Raio-x do ' + R.titulo;
  document.getElementById('rx-sub').textContent = R.local + ', ' + window.dataCurta(R.data) + '. ' + NV + ' voltas.';
  document.getElementById('rx-fonte').textContent = 'Fonte dos dados: ' + R.fonte + '. O tempo de parada é o tempo total no pit lane, da entrada à saída.' + (R.grid && R.grid.indexOf('classificação') > -1 ? ' A posição de largada segue o resultado da classificação, sem punições de grid.' : '');

  /* Destaques */
  var chegaram = P.filter(function (p) { return p.final; });
  var subiu = chegaram.slice().sort(function (a, b) { return (b.grid - b.final) - (a.grid - a.final); })[0];
  var paradas = [];
  P.forEach(function (p) { p.paradas.forEach(function (x) { if (x.tempo) paradas.push({ p: p, t: x.tempo, v: x.volta }); }); });
  var rapida = paradas.sort(function (a, b) { return a.t - b.t; })[0];
  var lid = R.lideranca[0];
  document.getElementById('rx-destaques').innerHTML =
    '<div class="rx-dest"><span>Quem mais ganhou posições</span><b>' + esc(subiu.nome) + '</b><small>Largou em ' + subiu.grid + 'º e terminou em ' + subiu.final + 'º</small></div>' +
    '<div class="rx-dest"><span>Mais voltas na liderança</span><b>' + esc(lid[0]) + '</b><small>' + lid[1] + ' de ' + NV + ' voltas na frente</small></div>' +
    '<div class="rx-dest"><span>Passagem mais rápida pelo pit lane</span><b>' + esc(rapida.p.nome) + '</b><small>' + seg(rapida.t) + ' s na volta ' + rapida.v + '</small></div>';

  /* Gráfico de posições */
  var sel = chegaram.slice(0, 4).map(function (p) { return p.n; });
  var corDe = {}; sel.forEach(function (n, i) { corDe[n] = CORES[i]; });
  /* Tamanho do gráfico: largo no computador; no celular, mais estreito e alto, para caber inteiro na tela */
  var celular = window.matchMedia('(max-width: 700px)');
  var W, H, ml, mr, mt, mb, cw, ch, marcasX;
  function medidas() {
    if (celular.matches) { W = 400; H = 540; ml = 30; mr = 40; mt = 10; mb = 40; marcasX = [1, 20, 40, NV]; }
    else { W = 1000; H = 570; ml = 40; mr = 60; mt = 14; mb = 50; marcasX = [1, 10, 20, 30, 40, 50, NV]; }
    cw = W - ml - mr; ch = H - mt - mb;
  }
  medidas();
  var maxPos = P.length;
  function x(v) { return ml + (v - 1) / (NV - 1) * cw; }
  function y(pos) { return mt + (pos - 1) / (maxPos - 1) * ch; }
  function caminho(p) {
    var d = '', ok = false;
    p.voltas.forEach(function (pos, i) { if (pos == null) { ok = false; return; } d += (ok ? 'L' : 'M') + x(i + 1).toFixed(1) + ' ' + y(pos).toFixed(1); ok = true; });
    return d;
  }
  var graf = document.getElementById('rx-graf');
  function desenhar() {
    var eixoY = [1, 5, 10, 15, 20].map(function (p) {
      return '<line class="rx-grade" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y(p) + '" y2="' + y(p) + '"/><text class="rx-eixo" x="' + (ml - 10) + '" y="' + (y(p) + 4) + '" text-anchor="end">P' + p + '</text>';
    }).join('');
    var eixoX = marcasX.filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (v) { return '<text class="rx-eixo" x="' + x(v) + '" y="' + (H - 24) + '" text-anchor="middle">' + v + '</text>'; }).join('');
    var cinzas = P.filter(function (p) { return !corDe[p.n]; }).map(function (p) { return '<path class="rx-linha-fundo" d="' + caminho(p) + '"/>'; }).join('');
    var cores = sel.map(function (n) {
      var p = P.filter(function (q) { return q.n === n; })[0];
      var ult = p.voltas.length, pos = p.voltas[ult - 1];
      return '<path class="rx-linha-sombra" d="' + caminho(p) + '"/><path class="rx-linha" stroke="' + corDe[n] + '" d="' + caminho(p) + '"/>' +
        '<circle cx="' + x(ult) + '" cy="' + y(pos) + '" r="4" fill="' + corDe[n] + '" class="rx-ponto"/>' +
        '<text class="rx-rotulo" x="' + (x(ult) + 9) + '" y="' + (y(pos) + 4) + '">' + esc(p.sigla) + '</text>';
    }).join('');
    graf.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Posições de cada piloto a cada volta do ' + esc(R.titulo) + '. A tabela abaixo traz os mesmos resultados.">' +
      eixoY + eixoX + '<text class="rx-eixo" x="' + (ml + cw / 2) + '" y="' + (H - 2) + '" text-anchor="middle">Volta</text>' +
      cinzas + cores + '<line class="rx-guia" id="rx-guia" y1="' + mt + '" y2="' + (H - mb) + '" x1="-10" x2="-10"/>' +
      '<rect class="rx-alvo" x="' + ml + '" y="' + mt + '" width="' + cw + '" height="' + ch + '"/></svg>';
  }
  desenhar();
  (celular.addEventListener ? celular.addEventListener.bind(celular, 'change') : celular.addListener.bind(celular))(function () { medidas(); desenhar(); });

  var chips = document.getElementById('rx-chips');
  function montarChips() {
    chips.innerHTML = P.map(function (p) {
      var on = !!corDe[p.n];
      return '<button type="button" class="rx-chip" data-n="' + p.n + '" aria-pressed="' + on + '"' + (on ? ' style="--c:' + corDe[p.n] + '"' : '') + '>' + esc(p.sigla) + '</button>';
    }).join('');
  }
  montarChips();
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.rx-chip'); if (!b) return;
    var n = +b.getAttribute('data-n');
    if (corDe[n]) { if (sel.length === 1) return; sel = sel.filter(function (s) { return s !== n; }); delete corDe[n]; }
    else {
      if (sel.length === 4) { var sai = sel.shift(); delete corDe[sai]; }
      var livre = CORES.filter(function (c) { return !sel.some(function (s) { return corDe[s] === c; }); })[0];
      sel.push(n); corDe[n] = livre;
    }
    montarChips(); desenhar();
  });

  /* Dica que acompanha o cursor */
  function mostrar(html, ev) {
    dica.innerHTML = html; dica.hidden = false;
    var r = dica.getBoundingClientRect(), px = ev.clientX + 16, py = ev.clientY + 16;
    if (px + r.width > window.innerWidth - 8) px = ev.clientX - r.width - 16;
    if (py + r.height > window.innerHeight - 8) py = ev.clientY - r.height - 16;
    dica.style.left = px + 'px'; dica.style.top = py + 'px';
  }
  function esconder() { dica.hidden = true; var g = document.getElementById('rx-guia'); if (g) { g.setAttribute('x1', -10); g.setAttribute('x2', -10); } }
  function naVolta(ev) {
    var svg = graf.querySelector('svg'), r = svg.getBoundingClientRect();
    var sx = (ev.clientX - r.left) / r.width * W;
    var v = Math.max(1, Math.min(NV, Math.round((sx - ml) / cw * (NV - 1) + 1)));
    var g = document.getElementById('rx-guia'); g.setAttribute('x1', x(v)); g.setAttribute('x2', x(v));
    var linhas = sel.map(function (n) { var p = P.filter(function (q) { return q.n === n; })[0]; return { p: p, pos: p.voltas[v - 1] }; })
      .sort(function (a, b) { return (a.pos || 99) - (b.pos || 99); })
      .map(function (o) { return '<li><i style="background:' + corDe[o.p.n] + '"></i>' + esc(o.p.nome) + '<b>' + (o.pos ? 'P' + o.pos : 'fora') + '</b></li>'; }).join('');
    mostrar('<strong>Volta ' + v + '</strong><ul>' + linhas + '</ul>', ev);
  }
  graf.addEventListener('pointermove', function (e) { if (e.target.classList.contains('rx-alvo')) naVolta(e); else esconder(); });
  graf.addEventListener('pointerleave', esconder);

  /* Pneus e paradas */
  var usados = {};
  P.forEach(function (p) { p.pneus.forEach(function (s) { usados[s.c] = 1; }); });
  document.getElementById('rx-legenda').innerHTML = Object.keys(PNEU).filter(function (k) { return usados[k]; }).map(function (k) {
    return '<span><i style="background:' + PNEU[k][2] + '">' + PNEU[k][1] + '</i>' + PNEU[k][0] + '</span>';
  }).join('');
  document.getElementById('rx-pneus').innerHTML = P.map(function (p) {
    var fim = p.voltas.length;
    var barras = p.pneus.map(function (s) {
      var ate = Math.min(s.ate || fim, fim), larg = (ate - s.de + 1) / NV * 100, esq = (s.de - 1) / NV * 100;
      var k = PNEU[s.c] || ['Desconhecido', '?', '#8e979f'];
      return '<span class="rx-stint" style="left:' + esq + '%;width:' + larg + '%;background:' + k[2] + '" data-t="' + esc(p.nome + ': ' + k[0] + ', voltas ' + s.de + ' a ' + ate) + '">' + (larg > 6 ? k[1] : '') + '</span>';
    }).join('');
    var t = tempoPit(p);
    var info = p.paradas.length ? '<span class="rx-np">' + p.paradas.length + (p.paradas.length > 1 ? ' paradas, ' : ' parada, ') + '</span>' + seg(t) + ' s' : 'sem parada';
    return '<div class="rx-pneu-linha"><span class="rx-pneu-nome"><b>' + (p.final ? p.final + 'º' : 'Ab.') + '</b> ' + esc(p.sigla) + '</span>' +
      '<span class="rx-pneu-trilho">' + barras + (p.abandono ? '<span class="rx-abandono" style="left:' + (fim / NV * 100) + '%" data-t="' + esc(p.nome + ' abandonou na volta ' + fim) + '">✕</span>' : '') + '</span>' +
      '<span class="rx-pneu-info">' + info + '</span></div>';
  }).join('') + '<div class="rx-pneu-linha rx-pneu-eixo"><span></span><span class="rx-pneu-trilho">' +
    [1, 10, 20, 30, 40, 50, NV].map(function (v) { return '<em style="left:' + ((v - 0.5) / NV * 100) + '%">' + v + '</em>'; }).join('') + '</span><span></span></div>';
  var pn = document.getElementById('rx-pneus');
  pn.addEventListener('pointermove', function (e) { var s = e.target.closest('[data-t]'); if (s) mostrar(esc(s.getAttribute('data-t')), e); else esconder(); });
  pn.addEventListener('pointerleave', esconder);

  /* Tabela */
  document.getElementById('rx-tabela').innerHTML = '<table class="tabela rx-tab"><thead><tr><th>Pos</th><th>Piloto</th><th>Equipe</th><th>Largou</th><th>Ganho</th><th>Paradas</th></tr></thead><tbody>' +
    P.map(function (p) {
      var g = p.final ? p.grid - p.final : null;
      return '<tr class="p' + (p.final || '') + '"><td>' + (p.final || 'Ab.') + '</td><td>' + esc(p.nome) + '</td><td>' + esc(p.equipe) + '</td><td>' + p.grid + 'º</td>' +
        '<td>' + (g == null ? 'Abandono na volta ' + p.voltas.length : g > 0 ? '+' + g : g < 0 ? String(g).replace('-', '−') : '0') + '</td><td>' + p.paradas.length + '</td></tr>';
    }).join('') + '</tbody></table>';
})();
