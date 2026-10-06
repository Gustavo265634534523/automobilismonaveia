/* Raio-x da MotoGP (aba do raiox.html): última corrida de domingo, com tempo de cada volta, posições volta a volta,
   velocidade máxima e pneus. Dados em window.RAIOX_MOTOGP (assets/dados/raiox-motogp.js, gerado no GitHub depois de cada corrida).
   A MotoGP não libera telemetria (acelerador, freio), então a comparação é volta a volta. */
(function () {
  var R = window.RAIOX_MOTOGP, caixa = document.getElementById('rxm');
  if (!caixa) return;
  if (!R) { caixa.innerHTML = '<p class="nota">O Raio-x da MotoGP aparece aqui depois da próxima corrida.</p>'; return; }
  var esc = window.esc, CORES = ['#3987e5', '#d95926', '#199e70', '#c98500'];
  var P = R.pilotos.filter(function (p) { return p.voltas.length; });
  var NV = Math.max.apply(null, P.map(function (p) { return p.voltas.length ? p.voltas[p.voltas.length - 1][0] : 0; }));

  /* nome do GP em português, pelo calendário da MotoGP do site */
  var gp = R.gp, local = R.circuito || '';
  var cat = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'motogp'; })[0];
  if (cat) { var e = cat.calendario.filter(function (x) { return x.d === R.data; })[0]; if (e) { gp = e.n; local = e.l; } }
  function tempo(s) { if (s == null) return '—'; var m = Math.floor(s / 60), r = s - m * 60; return m + "'" + (r < 10 ? '0' : '') + r.toFixed(3).replace('.', ','); }
  function sobrenome(n) { var p = String(n).split(' '); return p.slice(1).join(' ') || n; }
  function sigla(p) { return String(p.nome).charAt(0) + '. ' + sobrenome(p.nome); }

  /* posições volta a volta, pelo tempo acumulado */
  var acum = {};
  P.forEach(function (p) { var t = 0; acum[p.num] = {}; p.voltas.forEach(function (v) { t += v[1] || 0; acum[p.num][v[0]] = v[1] ? t : null; }); });
  var posicoes = {};
  for (var n = 1; n <= NV; n++) {
    P.filter(function (p) { return acum[p.num][n] != null; }).sort(function (a, b) { return acum[a.num][n] - acum[b.num][n]; })
      .forEach(function (p, i) { (posicoes[p.num] = posicoes[p.num] || {})[n] = i + 1; });
  }

  var chegaram = P.filter(function (p) { return p.pos; });
  var rapida = P.filter(function (p) { return p.melhor; }).sort(function (a, b) { return a.melhor - b.melhor; })[0];
  var veloz = P.filter(function (p) { return p.velMax; }).sort(function (a, b) { return b.velMax - a.velMax; })[0];
  var vence = chegaram[0];

  caixa.innerHTML =
    '<h2 class="rx-gp">' + esc(gp) + '</h2><p class="rx-sub">' + esc(local) + (R.data ? ', ' + esc(window.dataCurta(R.data)) : '') + '. ' + NV + ' voltas.</p>' +
    '<div class="rx-destaques">' +
      '<div class="rx-dest"><span>Vencedor</span><b>' + esc(vence.nome) + '</b><small>' + esc(vence.moto || '') + ' · ' + esc(vence.tempo || '') + '</small></div>' +
      '<div class="rx-dest"><span>Volta mais rápida</span><b>' + esc(rapida.nome) + '</b><small>' + tempo(rapida.melhor) + ' na volta ' + rapida.melhorN + '</small></div>' +
      '<div class="rx-dest"><span>Maior velocidade</span><b>' + esc(veloz.nome) + '</b><small>' + String(veloz.velMax).replace('.', ',') + ' km/h</small></div>' +
    '</div>' +
    '<section class="rx-bloco"><div class="rx-bloco-cab"><h2>Tempo de cada volta</h2><p>Escolha até 4 pilotos. Quanto mais alto no gráfico, mais rápida a volta. A primeira volta (largada) fica de fora.</p></div>' +
      '<div class="rx-chips" id="rxm-chips" role="group" aria-label="Pilotos em destaque"></div><div class="rx-graf" id="rxm-tempos"></div></section>' +
    '<section class="rx-bloco"><div class="rx-bloco-cab"><h2>Posições volta a volta</h2><p>Os mesmos pilotos, calculado pelo tempo de cada volta.</p></div><div class="rx-graf" id="rxm-pos"></div></section>' +
    '<section class="rx-bloco"><div class="rx-bloco-cab"><h2>Resultado completo</h2></div><div class="tabela-wrap"><table class="tabela rx-tab"><thead><tr><th>Pos</th><th>Piloto</th><th>Moto</th><th>Pneus (diant. / tras.)</th><th>Melhor volta</th><th>Vel. máx.</th><th>Tempo</th></tr></thead><tbody>' +
      R.pilotos.map(function (p) {
        return '<tr><td>' + (p.pos || 'Abandonou') + '</td><td>' + esc(p.nome) + '</td><td>' + esc(p.moto || '') + '</td><td>' + esc(p.pneus || '—') + '</td><td>' + tempo(p.melhor) +
          '</td><td>' + (p.velMax ? String(p.velMax).replace('.', ',') + ' km/h' : '—') + '</td><td>' + esc(p.pos === 1 ? (p.tempo || '') : (p.dif || (p.pos ? '' : p.voltasTotal + ' voltas'))) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="nota">Fonte: resultados oficiais da MotoGP (classificação e análise volta a volta). Pneus Medium = médio, Hard = duro, Soft = macio.</p></section>';

  /* pilotos em destaque: os 3 primeiros + brasileiro, se houver */
  var sel = chegaram.slice(0, 3).map(function (p) { return p.num; });
  P.forEach(function (p) { if (p.pais === 'BR' && sel.indexOf(p.num) < 0 && sel.length < 4) sel.push(p.num); });
  var corDe = {}; sel.forEach(function (n, i) { corDe[n] = CORES[i]; });
  var chips = document.getElementById('rxm-chips');
  function montarChips() {
    chips.innerHTML = P.map(function (p) {
      var on = !!corDe[p.num];
      return '<button type="button" class="rx-chip" data-n="' + p.num + '" aria-pressed="' + on + '"' + (on ? ' style="--c:' + corDe[p.num] + '"' : '') + ' title="' + esc(p.nome) + '">' + esc(sigla(p)) + '</button>';
    }).join('');
  }
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

  function grafico(el, valores, opts) {
    var cel = window.matchMedia('(max-width: 700px)').matches;
    var W = cel ? 400 : 1000, H = cel ? 300 : 360, ml = cel ? 44 : 60, mr = 16, mt = 12, mb = 34, cw = W - ml - mr, ch = H - mt - mb;
    var todos = []; sel.forEach(function (n) { (valores[n] || []).forEach(function (v) { if (v[1] != null) todos.push(v[1]); }); });
    if (!todos.length) { el.innerHTML = '<p class="nota">Sem dados.</p>'; return; }
    var min = opts.min != null ? opts.min : Math.min.apply(null, todos), max = opts.max != null ? opts.max : Math.max.apply(null, todos);
    if (max === min) max = min + 1;
    function x(v) { return ml + (v - 1) / Math.max(1, NV - 1) * cw; }
    function y(v) { var f = (v - min) / (max - min); return opts.inverter ? mt + f * ch : mt + f * ch; }
    var marcas = '', passos = 4;
    for (var i = 0; i <= passos; i++) { var val = min + (max - min) * i / passos, yy = y(val);
      marcas += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="rgba(255,255,255,.08)"/>' +
        '<text x="' + (ml - 6) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" fill="#8e979f" font-size="12">' + opts.rotulo(val) + '</text>'; }
    [1, Math.round(NV / 2), NV].forEach(function (v) { marcas += '<text x="' + x(v).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="' + (v === 1 ? 'start' : v === NV ? 'end' : 'middle') + '" fill="#8e979f" font-size="12">Volta ' + v + '</text>'; });
    var linhas = sel.map(function (n) {
      var d = '', ok = false;
      (valores[n] || []).forEach(function (v) { if (v[1] == null) { ok = false; return; } d += (ok ? 'L' : 'M') + x(v[0]).toFixed(1) + ' ' + y(v[1]).toFixed(1); ok = true; });
      return '<path d="' + d + '" fill="none" stroke="' + corDe[n] + '" stroke-width="2.4" stroke-linejoin="round"/>';
    }).join('');
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.titulo) + '">' + marcas + linhas + '</svg>' +
      '<p class="rx-legenda-mgp">' + sel.map(function (n) { var p = P.filter(function (q) { return q.num === n; })[0]; return '<span><i style="background:' + corDe[n] + '"></i>' + esc(p.nome) + '</span>'; }).join('') + '</p>';
  }
  function desenhar() {
    var tempos = {}, pos = {};
    P.forEach(function (p) {
      /* tempos: sem a 1ª volta, voltas de box e voltas muito lentas (bandeira, queda) para o gráfico não achatar */
      var lim = p.melhor ? p.melhor * 1.07 : 1e9;
      tempos[p.num] = p.voltas.filter(function (v) { return v[0] > 1 && v[1] && !v[3] && v[1] <= lim; }).map(function (v) { return [v[0], v[1]]; });
      pos[p.num] = Object.keys(posicoes[p.num] || {}).map(function (k) { return [+k, posicoes[p.num][k]]; });
    });
    grafico(document.getElementById('rxm-tempos'), tempos, { titulo: 'Tempo de cada volta', rotulo: function (v) { return tempo(v).replace(/,(\d)\d\d$/, ',$1'); } });
    grafico(document.getElementById('rxm-pos'), pos, { titulo: 'Posições volta a volta', min: 1, max: P.length, rotulo: function (v) { return Math.round(v) + 'º'; } });
  }
  montarChips(); desenhar();
  window.addEventListener('resize', function () { clearTimeout(desenhar.t); desenhar.t = setTimeout(desenhar, 200); });
})();
