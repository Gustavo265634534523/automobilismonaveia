/* Chances na tabela (futebol, pontos corridos): simula o resto do campeonato milhares de vezes e conta em quantas
   cada time termina campeão, numa vaga (Libertadores, Champions) ou rebaixado.
   Força de cada time: pontos e saldo de gols por jogo até agora (puxados para a média quando há poucos jogos).
   Jogos já marcados (que estão no placar) entram com os times certos e o mando; os outros são sorteados.
   window.chancesHTML(c) devolve a tabela pronta; usado em futebol.js (seção Tabelas) e competicao.js (aba Chances). */
(function () {
  var esc = window.esc;
  /* regras de cada campeonato: jogos de cada time, quantos vão para a vaga e quantos caem */
  var REGRAS = {
    brasileirao: { jogos: 38, vaga: 6, nomeVaga: 'Libertadores', dicaVaga: 'Termina entre os 6 primeiros (vaga na Libertadores)', cai: 4 },
    'premier-league': { jogos: 38, vaga: 4, nomeVaga: 'Champions', dicaVaga: 'Termina entre os 4 primeiros (vaga na Champions)', cai: 3 },
    'la-liga': { jogos: 38, vaga: 4, nomeVaga: 'Champions', dicaVaga: 'Termina entre os 4 primeiros (vaga na Champions)', cai: 3 },
    'serie-a': { jogos: 38, vaga: 4, nomeVaga: 'Champions', dicaVaga: 'Termina entre os 4 primeiros (vaga na Champions)', cai: 3 },
    bundesliga: { jogos: 34, vaga: 4, nomeVaga: 'Champions', dicaVaga: 'Termina entre os 4 primeiros (vaga na Champions)', cai: 3, dicaCai: 'Termina entre os 3 últimos (2 caem direto e o 16º vai para a repescagem)' },
    'ligue-1': { jogos: 34, vaga: 4, nomeVaga: 'Champions', dicaVaga: 'Termina entre os 4 primeiros (o 4º joga a fase prévia da Champions)', cai: 3, dicaCai: 'Termina entre os 3 últimos (2 caem direto e o 16º vai para a repescagem)' },
    'champions-league': { jogos: 8, fase: true }
  };
  var SIMULACOES = 5000;

  /* sorteio com semente: os números não mudam a cada vez que a página abre */
  function sorteio(semente) {
    var a = semente >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function poisson(l, r) { var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }

  function simular(c) {
    var regra = REGRAS[c.slug], t = c.tabela;
    if (!regra || !t || !t.linhas || t.linhas.length < 8 || /passada|final da temporada/i.test(t.titulo || '')) return null;
    var col = function (n) { return t.colunas.indexOf(n); }, iT = col('Time'), iP = col('Pts'), iJ = col('J'), iS = col('SG');
    if (iT < 0 || iP < 0 || iJ < 0) return null;
    var times = t.linhas.map(function (l) { return { nome: l[iT], pts: +l[iP] || 0, j: +l[iJ] || 0, sg: iS > -1 ? parseInt(String(l[iS]).replace('+', ''), 10) || 0 : 0 }; });
    var n = times.length, idx = {};
    times.forEach(function (x, i) { idx[x.nome] = i; });
    var totalJ = times.reduce(function (s, x) { return s + x.j; }, 0);
    if (!totalJ) return null;
    var mediaP = times.reduce(function (s, x) { return s + x.pts; }, 0) / totalJ;
    /* força: saldo por jogo e pontos por jogo acima da média, com peso menor no começo do campeonato */
    times.forEach(function (x) {
      var w = x.j / (x.j + 8);
      x.forca = w * (0.55 * (x.j ? x.sg / x.j : 0) + 0.75 * ((x.j ? x.pts / x.j : mediaP) - mediaP));
    });
    /* jogos que faltam: os marcados no placar e o resto sorteado */
    var marcados = [], faltam = times.map(function (x) { return Math.max(0, regra.jogos - x.j); });
    (c.jogos || []).forEach(function (j) {
      if (j.p || j.adiado) return;
      var a = idx[j.casa], b = idx[j.fora];
      if (a == null || b == null || !faltam[a] || !faltam[b]) return;
      marcados.push([a, b]); faltam[a]--; faltam[b]--;
    });
    var restam = faltam.reduce(function (s, v) { return s + v; }, 0) + marcados.length * 2;
    if (!restam) return null;
    var r = sorteio(times.reduce(function (s, x) { return s * 31 + x.pts * 7 + x.j; }, 7));
    var conta = times.map(function () { return { titulo: 0, vaga: 0, cai: 0, top8: 0, top24: 0, pos: 0 }; });
    var pts = new Array(n), sg = new Array(n), ordem = [];
    for (var i = 0; i < n; i++) ordem.push(i);
    function jogo(a, b, mando) {
      var d = times[a].forca - times[b].forca;
      var ga = poisson(1.32 * Math.exp(d / 2 + (mando ? 0.11 : 0)), r), gb = poisson(1.32 * Math.exp(-d / 2 - (mando ? 0.11 : 0)), r);
      sg[a] += ga - gb; sg[b] += gb - ga;
      if (ga > gb) pts[a] += 3; else if (gb > ga) pts[b] += 3; else { pts[a]++; pts[b]++; }
    }
    var corte = { titulo: [], vaga: [], escapa: [] };
    for (var s = 0; s < SIMULACOES; s++) {
      for (i = 0; i < n; i++) { pts[i] = times[i].pts; sg[i] = times[i].sg; }
      marcados.forEach(function (m) { jogo(m[0], m[1], true); });
      /* o resto: cada vaga de jogo vira uma ficha; as fichas são embaralhadas e casadas duas a duas */
      var fichas = [];
      faltam.forEach(function (f, k) { for (var q = 0; q < f; q++) fichas.push(k); });
      for (i = fichas.length - 1; i > 0; i--) { var k2 = Math.floor(r() * (i + 1)), tmp = fichas[i]; fichas[i] = fichas[k2]; fichas[k2] = tmp; }
      for (i = 0; i + 1 < fichas.length; i += 2) {
        if (fichas[i] === fichas[i + 1]) { var o = i + 2 < fichas.length ? i + 2 : -1; if (o > -1) { tmp = fichas[i + 1]; fichas[i + 1] = fichas[o]; fichas[o] = tmp; } }
        if (fichas[i] !== fichas[i + 1]) jogo(fichas[i], fichas[i + 1], r() < 0.5);
      }
      ordem.sort(function (a, b) { return pts[b] - pts[a] || sg[b] - sg[a] || (r() - 0.5); });
      /* pontos de quem termina na linha de corte: o campeão, o último da vaga e o primeiro fora da zona */
      corte.titulo.push(pts[ordem[0]]);
      if (regra.vaga) corte.vaga.push(pts[ordem[regra.vaga - 1]]);
      if (regra.cai) corte.escapa.push(pts[ordem[n - regra.cai - 1]]);
      ordem.forEach(function (tm, p) {
        var x = conta[tm];
        x.pos += p + 1;
        if (p === 0) x.titulo++;
        if (regra.vaga && p < regra.vaga) x.vaga++;
        if (regra.cai && p >= n - regra.cai) x.cai++;
        if (p < 8) x.top8++;
        if (p < 24) x.top24++;
      });
    }
    var mediana = function (L) { if (!L.length) return null; L.sort(function (a, b) { return a - b; }); return L[Math.floor(L.length / 2)]; };
    return { regra: regra, n: n, corte: { titulo: mediana(corte.titulo), vaga: mediana(corte.vaga), escapa: mediana(corte.escapa) }, times: times.map(function (x, k) {
      var q = conta[k];
      return { nome: x.nome, pts: x.pts, j: x.j, resta: Math.max(0, regra.jogos - x.j), titulo: q.titulo / SIMULACOES, vaga: q.vaga / SIMULACOES, cai: q.cai / SIMULACOES, top8: q.top8 / SIMULACOES, top24: q.top24 / SIMULACOES, pos: q.pos / SIMULACOES };
    }) };
  }
  /* chance de cada resultado num jogo só: força dos dois pela tabela do campeonato (pontos e saldo por jogo) ou, sem
     tabela, pelos últimos jogos (window.FORMA_FUTEBOL). Devolve [casa vence, empate, fora vence] ou null */
  function forcaTabela(c, nome) {
    var t = c && c.tabela; if (!t || !t.linhas) return null;
    var iT = t.colunas.indexOf('Time'), iP = t.colunas.indexOf('Pts'), iJ = t.colunas.indexOf('J'), iS = t.colunas.indexOf('SG');
    if (iT < 0 || iP < 0 || iJ < 0) return null;
    var tot = 0, jt = 0, x = null;
    t.linhas.forEach(function (l) { tot += +l[iP] || 0; jt += +l[iJ] || 0; if (l[iT] === nome) x = l; });
    if (!x || !jt) return null;
    var j = +x[iJ] || 0, pts = +x[iP] || 0, sg = iS > -1 ? parseInt(String(x[iS]).replace('+', ''), 10) || 0 : 0, w = j / (j + 8);
    return j ? w * (0.55 * sg / j + 0.75 * (pts / j - tot / jt)) : 0;
  }
  function forcaForma(nome) {
    var L = ((window.FORMA_FUTEBOL || {}).times || {})[nome]; if (!L || !L.length) return null;
    var pts = 0, sg = 0; L.forEach(function (g) { sg += g[2] - g[3]; pts += g[2] > g[3] ? 3 : g[2] === g[3] ? 1 : 0; });
    var w = L.length / (L.length + 8);
    return w * (0.55 * sg / L.length + 0.75 * (pts / L.length - 1.37));
  }
  function poissonP(l, k) { var p = Math.exp(-l); for (var i = 1; i <= k; i++) p *= l / i; return p; }
  window.chancesPartida = function (c, casa, fora) {
    var a = forcaTabela(c, casa), b = forcaTabela(c, fora);
    if (a == null || b == null) { a = forcaForma(casa); b = forcaForma(fora); }
    if (a == null || b == null) return null;
    var d = a - b, lc = 1.32 * Math.exp(d / 2 + 0.11), lf = 1.32 * Math.exp(-d / 2 - 0.11), pc = 0, pe = 0, pf = 0;
    for (var i = 0; i <= 10; i++) for (var k = 0; k <= 10; k++) { var p = poissonP(lc, i) * poissonP(lf, k); if (i > k) pc += p; else if (i === k) pe += p; else pf += p; }
    var t = pc + pe + pf; return [pc / t, pe / t, pf / t];
  };

  var guardado = {};
  window.chancesDe = function (c) { if (!(c.slug in guardado)) guardado[c.slug] = simular(c); return guardado[c.slug]; };

  function pct(v, cls) {
    cls = 'ch-pct' + (cls ? ' ' + cls : '');
    if (!v) return '<td class="' + cls + ' ch-zero">–</td>';
    var p = v * 100, txt = p >= 99.95 ? '100%' : p < 0.1 ? '&lt;0,1%' : (p >= 10 ? Math.round(p) : p.toFixed(1).replace('.', ',')) + '%';
    return '<td class="' + cls + '" style="--p:' + Math.max(4, Math.round(p)) + '%">' + txt + '</td>';
  }
  /* ---------- matemática: quanto cada time precisa ---------- */
  /* situação matemática de um time para ficar entre os k primeiros (sem contar critério de desempate) */
  function situacao(T, x, k) {
    var max = function (y) { return y.pts + 3 * y.resta; }, outros = T.filter(function (y) { return y !== x; });
    if (outros.filter(function (y) { return max(y) >= x.pts; }).length < k) return 'garantido';
    if (outros.filter(function (y) { return y.pts > max(x); }).length >= k) return 'impossivel';
    return 'aberto';
  }
  function meta(T, x, nome, k, corte, dica) {
    var sit = situacao(T, x, k), falta = corte == null ? null : Math.max(0, corte - x.pts), max = 3 * x.resta;
    var txt = sit === 'garantido' ? 'Garantido pela matemática.' : sit === 'impossivel' ? 'Não dá mais pela matemática.' :
      falta == null ? '' : falta === 0 ? 'Já tem os pontos que costumam bastar.' : falta > max ? 'Precisa de ' + falta + ' pontos, mas só restam ' + max + ' em disputa.' :
      'Precisa de mais <b>' + falta + ' pontos</b> em ' + x.resta + ' jogos (' + Math.round(falta / max * 100) + '% de aproveitamento).';
    return '<div class="mx-meta mx-' + sit + '"><small>' + nome + '</small><b>' + (corte != null ? '~' + corte + ' pts' : '') + '</b><span>' + txt + '</span><em>' + dica + '</em></div>';
  }
  function matematica(c, R, nome) {
    var T = R.times, x = T.filter(function (t) { return t.nome === nome; })[0] || T[0], g = R.regra;
    var metas = meta(T, x, 'Título', 1, R.corte.titulo, 'pontos que o campeão costuma fazer nas simulações') +
      (g.vaga ? meta(T, x, g.nomeVaga + ' (top ' + g.vaga + ')', g.vaga, R.corte.vaga, 'pontos do ' + g.vaga + 'º colocado nas simulações') : '');
    if (g.cai) {
      /* escapar: ficar entre os n - cai primeiros */
      metas += meta(T, x, 'Escapar do rebaixamento', R.n - g.cai, R.corte.escapa, 'pontos do ' + (R.n - g.cai) + 'º colocado nas simulações');
    }
    return '<div class="mx-time"><b>' + window.escudoTime(x.nome) + esc(x.nome) + '</b><span>' + x.pts + ' pontos · ' + x.resta + ' jogos restantes · pode chegar a ' + (x.pts + 3 * x.resta) + '</span></div><div class="mx-metas">' + metas + '</div>';
  }
  window.matematicaHTML = function (c, nome) {
    var R = window.chancesDe(c);
    if (!R || R.regra.fase) return '';
    var lista = R.times.map(function (t) { return t.nome; }).sort(function (a, b) { return a.localeCompare(b, 'pt'); });
    var meu = nome || ((window.meuTime && window.meuTime('futebol')) || {}).nome || R.times[0].nome;
    if (lista.indexOf(meu) < 0) meu = R.times[0].nome;
    return '<section class="mx-bloco" data-comp="' + esc(c.slug) + '"><h3>Matemática: quanto falta</h3><p class="mx-cortes">Linhas de corte estimadas: título <b>~' + R.corte.titulo + ' pts</b>' +
      (R.regra.vaga ? ' · ' + esc(R.regra.nomeVaga) + ' <b>~' + R.corte.vaga + ' pts</b>' : '') + (R.regra.cai ? ' · escapar <b>~' + R.corte.escapa + ' pts</b>' : '') + '</p>' +
      '<label class="mx-escolha">Time <select class="mx-sel">' + lista.map(function (t) { return '<option' + (t === meu ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
      '<div class="mx-corpo">' + matematica(c, R, meu) + '</div>' +
      '<p class="ch-nota">"Garantido" e "não dá mais" são pela conta de pontos, sem critério de desempate. As linhas de corte vêm das simulações.</p></section>';
  };
  /* troca de time na matemática (o bloco é desenhado como texto por quem chama, então o evento fica no documento) */
  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('mx-sel')) return;
    var bl = e.target.closest('.mx-bloco'), c = (window.COMPETICOES || []).filter(function (x) { return x.slug === bl.getAttribute('data-comp'); })[0];
    if (c) bl.querySelector('.mx-corpo').innerHTML = matematica(c, window.chancesDe(c), e.target.value);
  });

  window.chancesHTML = function (c) {
    var R = window.chancesDe(c);
    if (!R) return '';
    var fase = R.regra.fase;
    var cab = fase ? ['Top 8 (direto nas oitavas)', 'Top 24 (segue no torneio)'] : ['Título', R.regra.nomeVaga, 'Rebaixamento'];
    var dica = fase ? ['Termina entre os 8 primeiros e vai direto para as oitavas', 'Termina entre os 24 primeiros e segue no torneio'] : ['Termina em 1º', R.regra.dicaVaga, R.regra.dicaCai || 'Termina entre os ' + R.regra.cai + ' últimos'];
    return '<div class="ft-tab-wrap ch-wrap"><table class="ft-tab ch-tab"><thead><tr><th scope="col">Pos</th><th scope="col">Time</th><th scope="col">Pts</th>' +
      cab.map(function (h, i) { return '<th scope="col" title="' + esc(dica[i]) + '">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      R.times.map(function (x, i) {
        return '<tr><td>' + (i + 1) + '</td><td class="ft-tab-time"><a href="' + window.linkTime(x.nome) + '">' + window.escudoTime(x.nome) + esc(x.nome) + '</a></td><td>' + x.pts + '</td>' +
          (fase ? pct(x.top8) + pct(x.top24) : pct(x.titulo) + pct(x.vaga) + pct(x.cai, 'ch-cai')) + '</tr>';
      }).join('') + '</tbody></table></div>' +
      (window.matematicaHTML(c) || '') + '<p class="ch-nota">Chances calculadas pelo site: o resto do campeonato é simulado ' + SIMULACOES.toLocaleString('pt-BR') + ' vezes, com a força de cada time pelos pontos e pelo saldo de gols até agora. É uma estimativa, não uma certeza.</p>';
  };
})();
