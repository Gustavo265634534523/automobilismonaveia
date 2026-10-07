/* Raio-x da F1, blocos extras (dados de assets/dados/raiox-f1.js, gerados por _ferramentas/gerar-raiox.js a partir da OpenF1):
   direção de prova, diferença para o líder, velocidade máxima e volta ideal, grid x chegada, ultrapassagens e clima na pista. */
(function () {
  var R = window.RAIOX, caixa = document.getElementById('rx-extra');
  if (!R || !caixa || !R.direcao) return;
  var esc = window.esc;
  var P = R.pilotos;
  function bloco(t, sub, corpo) { return '<section class="rx-bloco"><div class="rx-bloco-cab"><h2>' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + corpo + '</section>'; }
  function tempo(s) { if (!s) return '—'; var m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3).replace('.', ','); }
  function num(x, d) { return String(Math.round(x * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).replace('.', ','); }
  var html = '';

  /* 1. Direção de prova */
  if (R.direcao.length) {
    var ROT = { sc: 'Safety car', vermelha: 'Bandeira vermelha', punicao: 'Punição', investiga: 'Comissários', ok: 'Sem punição', info: 'Aviso', fim: 'Fim' };
    var lim = P.filter(function (p) { return p.limites; }).sort(function (a, b) { return b.limites - a.limites; });
    html += bloco('Direção de prova', 'O que a direção de prova e os comissários decidiram, volta a volta.',
      '<ol class="rx-dp">' + R.direcao.map(function (d) {
        return '<li class="rx-dp-' + d.tipo + '"><span class="rx-dp-v">V' + d.v + '</span><span class="rx-dp-tag">' + ROT[d.tipo] + '</span><span class="rx-dp-t">' + esc(d.t) + '</span></li>';
      }).join('') + '</ol>' +
      (lim.length ? '<p class="nota">Voltas apagadas por limite de pista: ' + lim.map(function (p) { return esc(p.sigla) + ' (' + p.limites + ')'; }).join(', ') + '.</p>' : ''));
  }

  /* períodos de safety car (para sombrear os gráficos) */
  var sc = [], abre = null;
  R.direcao.forEach(function (d) {
    if (/^Safety car na pista|^Safety car virtual$/.test(d.t)) abre = d.v;
    else if (abre && /^Safety car sai|^Fim do safety car virtual/.test(d.t)) { sc.push([abre, d.v]); abre = null; }
  });

  /* 2. Diferença para o líder (5 primeiros) */
  var cel = window.matchMedia('(max-width: 700px)').matches;
  var W = cel ? 400 : 1000, H = cel ? 260 : 320, ml = 44, mr = 14, mt = 12, mb = 28, cw = W - ml - mr, ch = H - mt - mb, NV = R.voltas;
  function x(v) { return ml + (v - 1) / Math.max(1, NV - 1) * cw; }
  var top = P.filter(function (p) { return p.final && p.final <= 5 && p.dif; }).slice(0, 5);
  if (top.length >= 2) {
    var MAX = 30;
    var y = function (g) { return mt + Math.min(g, MAX) / MAX * ch; };
    var marcas = sc.map(function (s) { return '<rect x="' + x(s[0]).toFixed(1) + '" y="' + mt + '" width="' + Math.max(2, x(s[1]) - x(s[0])).toFixed(1) + '" height="' + ch + '" fill="rgba(245,197,24,.12)"/>'; }).join('');
    [0, 10, 20, 30].forEach(function (g) { marcas += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="rgba(255,255,255,.08)"/><text x="' + (ml - 6) + '" y="' + (y(g) + 4) + '" text-anchor="end" fill="#8e979f" font-size="12">' + (g ? '+' + g + 's' : 'líder') + '</text>'; });
    [1, Math.round(NV / 2), NV].forEach(function (v) { marcas += '<text x="' + x(v).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (v === 1 ? 'start' : v === NV ? 'end' : 'middle') + '" fill="#8e979f" font-size="12">Volta ' + v + '</text>'; });
    var linhas = top.map(function (p) {
      var d = '', ok = false;
      p.dif.forEach(function (g, i) { if (g == null) { ok = false; return; } d += (ok ? 'L' : 'M') + x(i + 1).toFixed(1) + ' ' + y(g).toFixed(1); ok = true; });
      return '<path d="' + d + '" fill="none" stroke="' + p.cor + '" stroke-width="2.4" stroke-linejoin="round"/>';
    }).join('');
    html += bloco('Diferença para o líder', 'Quanto cada um dos 5 primeiros estava atrás do líder no fim de cada volta' + (sc.length ? '. Faixa amarela: safety car' : '') + '. Acima de 30 s, a linha fica no limite do gráfico.',
      '<div class="rx-graf"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Diferença para o líder volta a volta">' + marcas + linhas + '</svg>' +
      '<p class="rx-legenda-mgp">' + top.map(function (p) { return '<span><i style="background:' + p.cor + '"></i>' + esc(p.nome) + '</span>'; }).join('') + '</p></div>');
  }

  /* 3. Velocidade máxima e volta ideal */
  var vel = P.filter(function (p) { return p.vel; }).sort(function (a, b) { return b.vel - a.vel; }).slice(0, 6);
  var ideal = P.filter(function (p) { return p.ideal && p.melhor; }).sort(function (a, b) { return a.ideal - b.ideal; }).slice(0, 8);
  if (vel.length || ideal.length) {
    var vmax = vel.length ? vel[0].vel : 1, vmin = vel.length ? vel[vel.length - 1].vel - 6 : 0;
    html += bloco('Velocidade máxima e volta ideal', 'Mais rápidos no radar de velocidade e a volta ideal de cada um: a soma dos seus três melhores setores. A diferença mostra o ritmo que sobrou.',
      '<div class="rx-duas">' +
      '<div><h3 class="rx-sub-t">Mais rápidos na reta</h3><ul class="rx-barras">' + vel.map(function (p) {
        return '<li><span class="rx-b-nome">' + esc(p.sigla) + '</span><span class="rx-b-trilho"><i style="width:' + Math.max(8, (p.vel - vmin) / (vmax - vmin) * 100).toFixed(0) + '%;background:' + p.cor + '"></i></span><b>' + p.vel + ' km/h</b></li>';
      }).join('') + '</ul></div>' +
      '<div><h3 class="rx-sub-t">Volta ideal x melhor volta</h3><div class="tabela-wrap"><table class="tabela rx-ideal"><thead><tr><th>Piloto</th><th>Melhor volta</th><th>Volta ideal</th><th>Sobrou</th></tr></thead><tbody>' +
      ideal.map(function (p) { var dif = p.melhor - p.ideal; return '<tr><td>' + esc(p.nome) + '</td><td>' + tempo(p.melhor) + '</td><td>' + tempo(p.ideal) + '</td><td>' + (dif > 0.0005 ? num(dif, 3) + ' s' : '—') + '</td></tr>'; }).join('') +
      '</tbody></table></div></div></div>');
  }

  /* 4. Grid x chegada */
  var mov = P.filter(function (p) { return p.grid && p.final; }).map(function (p) { return { p: p, g: p.grid - p.final }; }).sort(function (a, b) { return b.g - a.g; });
  if (mov.length) {
    var gmax = Math.max.apply(null, mov.map(function (m) { return Math.abs(m.g); })) || 1;
    html += bloco('Grid x chegada', 'Quantas posições cada piloto ganhou ou perdeu da largada até a bandeirada. Largada pelo ' + esc(R.grid) + '.',
      '<ul class="rx-gc">' + mov.map(function (m) {
        var w = (Math.abs(m.g) / gmax * 50).toFixed(1);
        return '<li><span class="rx-b-nome">' + esc(m.p.sigla) + '</span><span class="rx-gc-trilho">' + (m.g ? '<i class="' + (m.g > 0 ? 'rx-gc-mais' : 'rx-gc-menos') + '" style="width:' + w + '%"></i>' : '') + '</span><b class="' + (m.g > 0 ? 'rx-gc-mais-t' : m.g < 0 ? 'rx-gc-menos-t' : '') + '">' + (m.g > 0 ? '+' + m.g : m.g || '0') + '</b><small>P' + m.p.grid + ' → P' + m.p.final + '</small></li>';
      }).join('') + '</ul>');
  }

  /* 5. Ultrapassagens */
  if (R.temUltrapassagens) {
    var ult = P.filter(function (p) { return p.ultFeitas || p.ultSofridas; }).sort(function (a, b) { return b.ultFeitas - a.ultFeitas; }).slice(0, 8);
    var umax = Math.max.apply(null, ult.map(function (p) { return Math.max(p.ultFeitas, p.ultSofridas); })) || 1;
    html += bloco('Ultrapassagens', 'Quem mais ultrapassou e quantas vezes foi ultrapassado. Conta todas as trocas de posição na pista registradas pela OpenF1, inclusive nas relargadas.',
      '<ul class="rx-ult">' + ult.map(function (p) {
        return '<li><span class="rx-b-nome">' + esc(p.sigla) + '</span><span class="rx-ult-barras"><span><i class="rx-ult-f" style="width:' + (p.ultFeitas / umax * 100).toFixed(0) + '%"></i><b>' + p.ultFeitas + '</b></span><span><i class="rx-ult-s" style="width:' + (p.ultSofridas / umax * 100).toFixed(0) + '%"></i><b>' + p.ultSofridas + '</b></span></span></li>';
      }).join('') + '</ul><p class="rx-legenda-mgp"><span><i style="background:#2fb36b"></i>Fez</span><span><i style="background:#e3343c"></i>Sofreu</span></p>');
  }

  /* 6. Clima na pista */
  if (R.clima && R.clima.filter(function (c) { return c[1] > 1 && c[2] > 1; }).length > 3) {
    /* descarta leituras com defeito da OpenF1 (temperatura zero) */
    var C = R.clima.filter(function (c) { return c[1] > 1 && c[2] > 1; }), tm = C[C.length - 1][0] || 1;
    var vals = []; C.forEach(function (c) { vals.push(c[1], c[2]); });
    var tmin = Math.floor(Math.min.apply(null, vals) - 1), tmax = Math.ceil(Math.max.apply(null, vals) + 1);
    var xc = function (m) { return ml + m / tm * cw; }, yc = function (t) { return mt + (tmax - t) / (tmax - tmin) * ch; };
    var chuva = '', ini = null;
    C.forEach(function (c, i) {
      if (c[4] && ini === null) ini = c[0];
      if ((!c[4] || i === C.length - 1) && ini !== null) { chuva += '<rect x="' + xc(ini).toFixed(1) + '" y="' + mt + '" width="' + Math.max(2, xc(c[0]) - xc(ini)).toFixed(1) + '" height="' + ch + '" fill="rgba(57,135,229,.18)"/>'; ini = null; }
    });
    var eixo = '';
    [tmin, Math.round((tmin + tmax) / 2), tmax].forEach(function (t) { eixo += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + yc(t).toFixed(1) + '" y2="' + yc(t).toFixed(1) + '" stroke="rgba(255,255,255,.08)"/><text x="' + (ml - 6) + '" y="' + (yc(t) + 4).toFixed(1) + '" text-anchor="end" fill="#8e979f" font-size="12">' + t + '°</text>'; });
    [0, Math.round(tm / 2), tm].forEach(function (m) { eixo += '<text x="' + xc(m).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (m === 0 ? 'start' : m === tm ? 'end' : 'middle') + '" fill="#8e979f" font-size="12">' + m + ' min</text>'; });
    var linha = function (k, cor) { return '<path d="' + C.map(function (c, i) { return (i ? 'L' : 'M') + xc(c[0]).toFixed(1) + ' ' + yc(c[k]).toFixed(1); }).join('') + '" fill="none" stroke="' + cor + '" stroke-width="2.4"/>'; };
    var pista = C.map(function (c) { return c[2]; }), ar = C.map(function (c) { return c[1]; });
    var umid = Math.round(C.reduce(function (a, c) { return a + c[3]; }, 0) / C.length), vento = Math.max.apply(null, C.map(function (c) { return c[5]; }));
    var choveu = C.some(function (c) { return c[4]; });
    html += bloco('Clima na pista', 'Temperatura do asfalto e do ar durante a corrida, minuto a minuto' + (choveu ? '. Faixa azul: chuva' : '') + '.',
      '<ul class="rx-clima-num"><li><b>' + num(Math.min.apply(null, pista), 1) + '° a ' + num(Math.max.apply(null, pista), 1) + '°</b><span>asfalto</span></li>' +
      '<li><b>' + num(Math.min.apply(null, ar), 1) + '° a ' + num(Math.max.apply(null, ar), 1) + '°</b><span>ar</span></li>' +
      '<li><b>' + umid + '%</b><span>umidade média</span></li><li><b>' + vento + ' km/h</b><span>vento máximo</span></li>' +
      '<li><b>' + (choveu ? 'Sim' : 'Não') + '</b><span>choveu</span></li></ul>' +
      '<div class="rx-graf"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Temperatura do asfalto e do ar durante a corrida">' + chuva + eixo + linha(2, '#e3343c') + linha(1, '#cfd5db') + '</svg>' +
      '<p class="rx-legenda-mgp"><span><i style="background:#e3343c"></i>Asfalto</span><span><i style="background:#cfd5db"></i>Ar</span>' + (choveu ? '<span><i style="background:#3987e5"></i>Chuva</span>' : '') + '</p></div>');
  }

  caixa.innerHTML = html;
})();
