/* Raio-x da MotoGP: comparação de duas voltas no mesmo formato da telemetria da F1.
   A MotoGP não publica velocidade/acelerador/freio metro a metro; a comparação é pelos 4 setores oficiais de cada volta
   (assets/dados/raiox-motogp.js, campo "sessoes"). Volta: [nº, tempo, T1, T2, T3, T4, velocidade, box, anulada]. */
(function () {
  var R = window.RAIOX_MOTOGP, caixa = document.getElementById('rxm-comparar');
  if (!R || !R.sessoes || !caixa) return;
  var esc = window.esc, COR_A = '#e3343c', COR_B = '#4fa3ff';
  var S = R.sessoes.filter(function (s) { return s.pilotos.some(function (p) { return p.voltas.some(temSetores); }); });
  if (!S.length) return;
  function temSetores(v) { return v[1] && v[2] != null && v[5] != null && !v[7]; }
  function tempo(s) { var m = Math.floor(s / 60), r = s - m * 60; return (m ? m + "'" + (r < 10 ? '0' : '') : '') + r.toFixed(3).replace('.', ','); }
  function nomeCurto(p) { var x = String(p.nome).split(' '); return x.length > 1 ? x[0].charAt(0) + '. ' + x.slice(1).join(' ') : p.nome; }

  caixa.innerHTML = '<section class="rx-bloco" style="margin-top:0"><div class="rx-bloco-cab"><h2>Comparar voltas</h2><p>Escolha a sessão, dois pilotos e uma volta de cada. Veja quem foi mais rápido em cada um dos 4 setores da pista.</p></div>' +
    '<form class="tl-escolha" id="mc-form">' +
      '<label>Sessão<select name="s">' + S.map(function (s, i) { return '<option value="' + i + '">' + esc(s.nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="tl-a-rot">Piloto 1<select name="a"></select></label><label class="tl-a-rot">Volta<select name="va"></select></label>' +
      '<label class="tl-b-rot">Piloto 2<select name="b"></select></label><label class="tl-b-rot">Volta<select name="vb"></select></label>' +
    '</form><div id="mc-res"></div></section>';
  var f = document.getElementById('mc-form'), res = document.getElementById('mc-res');
  /* começa pela classificação Q2, se tiver (a volta mais rápida de cada um), senão pela corrida */
  var ini = 0; S.forEach(function (s, i) { if (s.tipo === 'Q2' || s.nome === 'Classificação Q2') ini = i; }); f.s.value = ini;

  function pilotosDe(s) { return s.pilotos.filter(function (p) { return p.voltas.some(temSetores); }); }
  function voltasDe(p) { return p.voltas.filter(temSetores); }
  function opcoesVolta(sel, p) {
    var vs = voltasDe(p), m = vs.filter(function (v) { return !v[8]; }).sort(function (a, b) { return a[1] - b[1]; })[0];
    sel.innerHTML = vs.map(function (v) { return '<option value="' + v[0] + '"' + (v === m ? ' selected' : '') + '>Volta ' + v[0] + ' · ' + tempo(v[1]) + (v === m ? ' (melhor)' : '') + (v[8] ? ' (anulada)' : '') + '</option>'; }).join('');
  }
  function carregarSessao() {
    var s = S[+f.s.value], ps = pilotosDe(s);
    var op = ps.map(function (p, i) { return '<option value="' + i + '">' + esc(p.nome) + (p.pos ? ' (P' + p.pos + ')' : '') + '</option>'; }).join('');
    f.a.innerHTML = op; f.b.innerHTML = op; f.b.value = ps.length > 1 ? 1 : 0;
    opcoesVolta(f.va, ps[+f.a.value]); opcoesVolta(f.vb, ps[+f.b.value]); comparar();
  }
  function comparar() {
    var s = S[+f.s.value], ps = pilotosDe(s), A = ps[+f.a.value], B = ps[+f.b.value];
    var va = voltasDe(A).filter(function (v) { return v[0] === +f.va.value; })[0], vb = voltasDe(B).filter(function (v) { return v[0] === +f.vb.value; })[0];
    if (!va || !vb) { res.innerHTML = ''; return; }
    var na = nomeCurto(A), nb = nomeCurto(B);
    if (A === B) { na += ' v' + va[0]; nb += ' v' + vb[0]; }
    var dif = vb[1] - va[1], frente = dif >= 0 ? na : nb;
    var setores = [0, 1, 2, 3].map(function (k) { return { a: va[2 + k], b: vb[2 + k], ganho: vb[2 + k] - va[2 + k] }; });
    /* diferença acumulada no fim de cada setor (positivo: piloto 1 na frente) */
    var acum = [0], t = 0; setores.forEach(function (x) { t += x.ganho; acum.push(t); });

    /* pista em 4 setores, cada um na cor de quem foi mais rápido nele */
    var arcos = setores.map(function (x, k) {
      var a0 = -Math.PI / 2 + k * Math.PI / 2 + 0.04, a1 = a0 + Math.PI / 2 - 0.08, r = 120, cx = 160, cy = 150;
      var p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      var meio = (a0 + a1) / 2, lx = cx + (r + 26) * Math.cos(meio), ly = cy + (r + 26) * Math.sin(meio);
      return '<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" stroke="' + (x.ganho >= 0 ? COR_A : COR_B) + '" stroke-width="16" fill="none" stroke-linecap="round"/>' +
        '<text x="' + lx.toFixed(1) + '" y="' + (ly + 5).toFixed(1) + '" text-anchor="middle" fill="#e4e7ea" font-size="15" font-weight="700">S' + (k + 1) + '</text>';
    }).join('');
    var pista = '<svg viewBox="0 0 320 300" class="mc-pista" role="img" aria-label="Setores da pista">' + arcos +
      '<line x1="160" y1="14" x2="160" y2="46" stroke="#fff" stroke-width="3"/><text x="160" y="160" text-anchor="middle" fill="#8e979f" font-size="13">' + esc(R.circuito || '') + '</text></svg>';

    /* gráfico da diferença acumulada */
    var W = 1000, H = 170, m = Math.max(0.05, Math.max.apply(null, acum.map(Math.abs))) * 1.2;
    function x(i) { return 40 + i * (W - 80) / 4; } function y(v) { return (H - 24) / 2 - v / m * ((H - 24) / 2 - 20); }
    var linha = acum.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join('');
    var pontos = acum.map(function (v, i) { return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="5" fill="' + (v >= 0 ? COR_A : COR_B) + '"/>' +
      (i ? '<text x="' + x(i).toFixed(1) + '" y="' + (v >= 0 ? y(v) - 10 : y(v) + 20).toFixed(1) + '" text-anchor="middle" fill="#e4e7ea" font-size="15">' + (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(3).replace('.', ',') + '</text>' : ''); }).join('');
    var rotulos = ['Largada', 'Fim S1', 'Fim S2', 'Fim S3', 'Chegada'].map(function (t, i) { return '<text x="' + x(i).toFixed(1) + '" y="' + (H - 2) + '" text-anchor="middle" fill="#8e979f" font-size="13">' + t + '</text>'; }).join('');
    var delta = '<svg viewBox="0 0 ' + W + ' ' + (H + 6) + '" class="mc-delta"><line x1="40" x2="' + (W - 40) + '" y1="' + ((H - 24) / 2) + '" y2="' + ((H - 24) / 2) + '" class="tl-zero"/>' +
      '<path d="' + linha + '" fill="none" stroke="#e4e7ea" stroke-width="2"/>' + pontos + rotulos + '</svg>';

    var maxSet = Math.max.apply(null, setores.map(function (x) { return Math.max(x.a, x.b); }));
    var barras = setores.map(function (x, k) {
      var melhorA = x.ganho >= 0;
      return '<div class="mc-setor"><span class="mc-s">S' + (k + 1) + '</span><div class="mc-barras">' +
        '<div class="mc-linha' + (melhorA ? ' mc-vence' : '') + '"><i style="background:' + COR_A + ';width:' + (x.a / maxSet * 100).toFixed(1) + '%"></i><b>' + tempo(x.a) + '</b></div>' +
        '<div class="mc-linha' + (!melhorA ? ' mc-vence' : '') + '"><i style="background:' + COR_B + ';width:' + (x.b / maxSet * 100).toFixed(1) + '%"></i><b>' + tempo(x.b) + '</b></div></div>' +
        '<span class="mc-ganho">' + (Math.abs(x.ganho) < 0.0005 ? 'empate' : esc(melhorA ? na : nb) + ' ' + Math.abs(x.ganho).toFixed(3).replace('.', ',') + 's') + '</span></div>';
    }).join('');

    res.innerHTML = '<div class="tl-legenda"><span class="tl-a"><i></i>' + esc(na) + ' <b>' + tempo(va[1]) + '</b></span><span class="tl-b"><i></i>' + esc(nb) + ' <b>' + tempo(vb[1]) + '</b></span>' +
      '<span class="tl-dif">' + esc(frente) + ' mais rápido por <b>' + Math.abs(dif).toFixed(3).replace('.', ',') + 's</b></span></div>' +
      '<div class="tl-corpo"><div class="tl-graficos" style="cursor:default">' +
        '<span class="tl-rot">Tempo em cada setor</span><div class="mc-setores">' + barras + '</div>' +
        '<span class="tl-rot" style="margin-top:14px">Diferença acumulada (s) <small>acima da linha: ' + esc(na) + ' na frente</small></span><div class="mc-caixa-delta">' + delta + '</div>' +
        '<span class="tl-rot" style="margin-top:14px">Velocidade máxima na volta</span><p class="mc-vel"><span class="tl-a"><i></i>' + esc(na) + ' <b>' + String(va[6] || '—').replace('.', ',') + ' km/h</b></span><span class="tl-b"><i></i>' + esc(nb) + ' <b>' + String(vb[6] || '—').replace('.', ',') + ' km/h</b></span></p>' +
      '</div><div class="tl-mapa"><span class="tl-rot">Quem foi mais rápido em cada setor</span>' + pista +
        '<p class="tl-mapa-leg"><span class="tl-a"><i></i>' + esc(na) + '</span><span class="tl-b"><i></i>' + esc(nb) + '</span><span>| largada</span></p></div></div>' +
      '<p class="nota" style="margin-top:14px">A MotoGP não divulga telemetria de acelerador e freio. A comparação usa os 4 setores oficiais de cada volta (a pista no desenho é ilustrativa).</p>';
  }
  f.s.addEventListener('change', carregarSessao);
  f.a.addEventListener('change', function () { opcoesVolta(f.va, pilotosDe(S[+f.s.value])[+f.a.value]); comparar(); });
  f.b.addEventListener('change', function () { opcoesVolta(f.vb, pilotosDe(S[+f.s.value])[+f.b.value]); comparar(); });
  f.va.addEventListener('change', comparar); f.vb.addEventListener('change', comparar);
  carregarSessao();
})();
