/* Raio-x da MotoGP (aba do raiox.html): última corrida de domingo, com tempo de cada volta, posições volta a volta,
   velocidade máxima e pneus. Dados em window.RAIOX_MOTOGP (assets/dados/raiox-motogp.js, gerado no GitHub depois de cada corrida).
   A MotoGP não libera telemetria (acelerador, freio), então a comparação é volta a volta. */
(function () {
  var R = window.RAIOX_MOTOGP, caixa = document.getElementById('rxm');
  if (!caixa) return;
  if (!R) { caixa.innerHTML = '<p class="nota">O Raio-x da MotoGP aparece aqui depois da próxima corrida.</p>'; return; }
  var esc = window.esc;
  var P = R.pilotos.filter(function (p) { return p.voltas.length; });
  var NV = Math.max.apply(null, P.map(function (p) { return p.voltas.length ? p.voltas[p.voltas.length - 1][0] : 0; }));

  /* nome do GP em português, pelo calendário da MotoGP do site */
  var gp = R.gp, local = R.circuito || '';
  var cat = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'motogp'; })[0];
  if (cat) { var e = cat.calendario.filter(function (x) { return x.d === R.data; })[0]; if (e) { gp = e.n; local = e.l; } }
  function tempo(s) { if (s == null) return '—'; var m = Math.floor(s / 60), r = s - m * 60; return m + "'" + (r < 10 ? '0' : '') + r.toFixed(3).replace('.', ','); }
  function sobrenome(n) { var p = String(n).split(' '); return p.slice(1).join(' ') || n; }
  function sigla(p) { return String(p.nome).charAt(0) + '. ' + sobrenome(p.nome); }

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
    '<section class="rx-bloco"><div class="rx-bloco-cab"><h2>Resultado completo</h2></div><div class="tabela-wrap"><table class="tabela rx-tab"><thead><tr><th>Pos</th><th>Piloto</th><th>Moto</th><th>Pneus (diant. / tras.)</th><th>Melhor volta</th><th>Vel. máx.</th><th>Tempo</th></tr></thead><tbody>' +
      R.pilotos.map(function (p) {
        return '<tr><td>' + (p.pos || 'Abandonou') + '</td><td>' + esc(p.nome) + '</td><td>' + esc(p.moto || '') + '</td><td>' + esc(p.pneus || '—') + '</td><td>' + tempo(p.melhor) +
          '</td><td>' + (p.velMax ? String(p.velMax).replace('.', ',') + ' km/h' : '—') + '</td><td>' + esc(p.pos === 1 ? (p.tempo || '') : (p.dif || (p.pos ? '' : p.voltasTotal + ' voltas'))) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="nota">Fonte: resultados oficiais da MotoGP (classificação e análise volta a volta). Pneus Medium = médio, Hard = duro, Soft = macio.</p></section>';

})();
