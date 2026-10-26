/* Mais ou menos (mais-ou-menos.html): dois jogadores e um número da temporada. O da esquerda mostra o dele; a
   pessoa diz se o da direita tem mais ou menos. Acertou, o da direita passa para a esquerda e vem outro. Errou,
   acaba; conta quantos acertou em sequência (o recorde fica guardado no aparelho).
   Futebol: gols, assistências e participações em gol na temporada (mais-ou-menos-futebol.js, resumo do robô que soma os campeonatos).
   NBA: pontos, rebotes e assistências por jogo (temporada-nba.js; a temporada atual, ou a anterior no começo). */
(function () {
  var caixa = document.getElementById('mm'), JB = window.JOGOS_BASE;
  if (!caixa || !JB) return;
  var esc = window.esc;
  var esporte = JB.esporteDaPagina(), recorde = JB.ler('arena-mais-ou-menos', {}) || {};
  var pool = {}, stat = null, esq = null, dir = null, pontos = 0, fim = false, revela = false;

  var STATS = {
    futebol: [['g', 'gols na temporada'], ['a', 'assistências na temporada'], ['ga', 'gols + assistências na temporada']],
    basquete: [['pts', 'pontos por jogo'], ['reb', 'rebotes por jogo'], ['ast', 'assistências por jogo']]
  };
  function montarPool(esp) {
    if (pool[esp]) return pool[esp];
    var L = [];
    if (esp === 'futebol' && window.MAIS_OU_MENOS_FUTEBOL) { /* resumo do robô: [nome, time, gols, assistências] */
      L = window.MAIS_OU_MENOS_FUTEBOL.map(function (l) { return { nome: l[0], time: l[1], g: l[2], a: l[3], ga: l[2] + l[3] }; });
    } else if (esp === 'futebol') {
      var TF = window.TEMPORADA_FUTEBOL, por = {};
      ((TF && TF.jogadores) || []).forEach(function (l) {
        var x = por[l[0]] = por[l[0]] || { nome: l[1], time: l[2], j: 0, g: 0, a: 0 };
        x.j += l[5]; x.g += l[7]; x.a += l[8];
      });
      L = Object.keys(por).map(function (k) { var x = por[k]; x.ga = x.g + x.a; return x; }).filter(function (x) { return x.j >= 4 && x.ga >= 2; });
    } else {
      var TN = window.TEMPORADA_NBA, ts = Object.keys((TN && TN.temporadas) || {}).sort().reverse();
      var temp = ts.filter(function (t) { return TN.temporadas[t].filter(function (l) { return l[4] >= 5; }).length > 100; })[0] || ts[0];
      L = ((TN && TN.temporadas[temp]) || []).filter(function (l) { return l[4] >= 5 && l[5] >= 12; })
        .map(function (l) { return { nome: l[1], time: l[2], pts: l[6], reb: l[7], ast: l[8], temp: temp }; });
    }
    return pool[esp] = L;
  }
  function valor(x) { return stat[0] === 'ga' ? x.ga : x[stat[0]]; }
  function fmt(v) { return esporte === 'basquete' ? String((+v).toFixed(1)).replace('.', ',') : String(v); }
  /* o próximo: alguém com número diferente e não muito longe (fica mais difícil quanto mais acerta) */
  function proximo(base) {
    var L = montarPool(esporte), v = valor(base), tol = Math.max(0.25, 1.4 - pontos * 0.06);
    var cand = L.filter(function (x) { var w = valor(x); return x !== base && w !== v && Math.abs(w - v) <= Math.max(2, v * tol); });
    if (cand.length < 5) cand = L.filter(function (x) { return x !== base && valor(x) !== v; });
    return cand[Math.floor(Math.random() * cand.length)];
  }
  function novo() {
    var L = montarPool(esporte);
    stat = STATS[esporte][Math.floor(Math.random() * STATS[esporte].length)];
    pontos = 0; fim = false; revela = false;
    esq = L[Math.floor(Math.random() * L.length)]; dir = esq ? proximo(esq) : null;
  }
  function cartao(x, mostra, lado) {
    return '<div class="mm-cartao mm-' + lado + '">' + window.escudoTime(x.time, 'mm-escudo') + '<b>' + esc(x.nome) + '</b><small>' + esc(x.time) + '</small>' +
      (mostra ? '<strong>' + fmt(valor(x)) + '</strong><em>' + esc(stat[1]) + '</em>' : '<strong class="mm-oculto">?</strong><em>' + esc(stat[1]) + '</em>') + '</div>';
  }
  function pintar() {
    var L = montarPool(esporte);
    if (L.length < 10) { caixa.innerHTML = JB.topo(esporte, '', false, 'largada') + '<p class="pt-vazio">Os números da temporada ainda estão chegando. Volte em algumas horas.</p>'; ligar(); return; }
    if (!esq) novo();
    var rec = recorde[esporte] || 0;
    caixa.innerHTML = JB.topo(esporte, '', false, 'largada') +
      '<section class="av-jogo mm-jogo"><header><h2>Mais ou menos</h2><p>' + esc(dir.nome) + ' tem mais ou menos ' + esc(stat[1]) + ' que ' + esc(esq.nome) + '?' +
        (esporte === 'basquete' && esq.temp ? ' Temporada ' + esc(esq.temp) + ' da NBA.' : ' Somando todos os campeonatos da temporada.') + '</p></header>' +
      '<div class="mm-placar"><span>Sequência <b>' + pontos + '</b></span><span>Recorde <b>' + rec + '</b></span></div>' +
      '<div class="mm-duelo">' + cartao(esq, true, 'esq') + '<span class="mm-vs">x</span>' + cartao(dir, revela || fim, 'dir') + '</div>' +
      (fim ? '<div class="av-fim"><p>Errou! ' + esc(dir.nome) + ' tem <b>' + fmt(valor(dir)) + '</b>. Sua sequência: <b>' + pontos + '</b>' + (pontos > 0 && pontos >= rec ? ' (recorde!)' : '') + '.</p>' +
          '<div class="av-botoes"><button type="button" class="ft-btn" data-acao="de-novo">Jogar de novo</button><button type="button" class="ft-btn ft-btn-linha" data-acao="compartilhar" data-txt="' +
          esc('Fan Zone · Mais ou menos' + (esporte === 'basquete' ? ' (NBA)' : '') + ': acertei ' + pontos + ' seguidos') + '">Compartilhar</button></div></div>'
        : '<div class="mm-botoes"><button type="button" class="mm-mais" data-r="mais" ' + (revela ? 'disabled' : '') + '>▲ Mais</button><button type="button" class="mm-menos" data-r="menos" ' + (revela ? 'disabled' : '') + '>▼ Menos</button></div>') +
      '</section>';
    ligar();
  }
  function responder(r) {
    var a = valor(esq), b = valor(dir), certo = r === 'mais' ? b >= a : b <= a;
    revela = true; pintar();
    setTimeout(function () {
      revela = false;
      if (certo) { pontos++; esq = dir; dir = proximo(esq); }
      else {
        fim = true;
        if (pontos > (recorde[esporte] || 0)) { recorde[esporte] = pontos; JB.guardar('arena-mais-ou-menos', recorde); }
      }
      pintar();
    }, 900);
  }
  function ligar() {
    JB.ligarTopo(caixa, function (e) { esporte = e; esq = null; pintar(); }, function () {});
    [].forEach.call(caixa.querySelectorAll('.mm-botoes button'), function (b) { b.addEventListener('click', function () { responder(b.getAttribute('data-r')); }); });
    [].forEach.call(caixa.querySelectorAll('.av-botoes button'), function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-acao') === 'de-novo') { novo(); pintar(); }
        else JB.compartilhar(b, b.getAttribute('data-txt') + ' ' + location.origin + location.pathname + '#' + esporte);
      });
    });
  }
  pintar();
})();
