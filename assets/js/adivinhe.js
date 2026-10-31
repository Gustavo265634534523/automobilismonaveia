/* Adivinhe o jogador (adivinhe.html): aparecem todos os clubes por onde ele passou, em ordem, e a pessoa tem 5
   tentativas para acertar quem é. A cada erro, uma dica nova (país, posição, iniciais, tamanho do nome).
   Futebol e NBA. Começa no jogador do dia (o mesmo para todo mundo); "Próximo jogador" sorteia outro.
   Trajetórias: jogos-base.js (assets/dados/adivinhe.js com o time atual conferido nos dados da temporada). */
(function () {
  var caixa = document.getElementById('av'), JB = window.JOGOS_BASE;
  if (!caixa || !JB || !window.ADIVINHE) return;
  var esc = window.esc, norm = JB.norm, TENTATIVAS = 5;
  var esporte = JB.esporteDaPagina(), tentativas = [], atual = null;

  var CHAVE = 'arena-adivinhe', G = JB.ler(CHAVE, null) || { dia: {}, placar: {} };
  function guardar() { JB.guardar(CHAVE, G); }
  function doDia(esp) { var L = JB.trajetorias(esp); return L[JB.semente(JB.hoje + esp) % L.length]; }
  function placar(esp) { return G.placar[esp] = G.placar[esp] || { jogos: 0, acertos: 0, seq: 0, melhor: 0 }; }
  G.n = G.n || {}; /* quantos "Próximo jogador" a pessoa pediu hoje, por esporte (0 = o jogador do dia) */
  function numero() { return G.n[JB.hoje + ':' + esporte] || 0; }
  function chave() { var n = numero(); return JB.hoje + ':' + esporte + (n ? ':' + n : ''); }
  function carregar() {
    var n = numero(), L = JB.trajetorias(esporte);
    atual = n ? L[JB.semente(JB.hoje + esporte + ':' + n) % L.length] : doDia(esporte);
    var d = G.dia[chave()]; tentativas = d ? d.t.slice() : [];
  }
  function proximo() {
    G.n[JB.hoje + ':' + esporte] = numero() + 1;
    Object.keys(G.n).forEach(function (k) { if (k.slice(0, 10) !== JB.hoje) delete G.n[k]; });
    delete G.dia[chave()]; guardar(); pintar();
    var q = document.getElementById('av-q'); if (q) q.focus();
  }
  /* certo: o nome dele ou de outro com a mesma trajetória */
  function certo(palpite) {
    var p = norm(palpite);
    return JB.trajetorias(esporte).some(function (x) { return x.aceitos.indexOf(p) > -1 && x.clubes.join('|') === atual.clubes.join('|'); });
  }
  function acabou() { return tentativas.some(certo) || tentativas.length >= TENTATIVAS; }

  function dicas() {
    var D = [['País', atual.pais], ['Posição', atual.pos], ['Iniciais', atual.nome.split(/\s+/).map(function (p) { return p.charAt(0) + '.'; }).join(' ')],
      ['Letras no nome', atual.nome.replace(/[^A-Za-zÀ-ÿ]/g, '').length + ' letras']];
    var erros = tentativas.filter(function (t) { return !certo(t); }).length, fim = acabou();
    return '<div class="av-dicas">' + D.map(function (d, i) {
      var aberta = fim || i < erros;
      return '<div class="av-dica' + (aberta ? '' : ' av-fechada') + '"><small>' + d[0] + '</small><b>' + (aberta ? esc(d[1]) : 'Dica ' + (i + 1) + ': aparece no ' + (i + 1) + 'º erro') + '</b></div>';
    }).join('') + '</div>';
  }
  function trajetoria() {
    return '<ol class="av-clubes">' + atual.clubes.map(function (c, i) {
      return '<li><span class="av-n">' + (i + 1) + '</span>' + window.escudoTime(c, 'av-escudo') + '<b>' + esc(c) + '</b></li>';
    }).join('') + '</ol>';
  }
  function resultado() {
    var ganhou = tentativas.some(certo), n = tentativas.length, P = placar(esporte);
    var txt = ganhou ? (n === 1 ? 'De primeira! ' : 'Acertou em ' + n + ' tentativas! ') : 'Não foi dessa vez. ';
    var compart = 'Fan Zone · Adivinhe o jogador' + (numero() ? '' : ' do dia') + (esporte === 'basquete' ? ' (NBA)' : '') + ': ' + (ganhou ? n : 'X') + '/' + TENTATIVAS + ' ' +
      tentativas.map(function (t) { return certo(t) ? '🟩' : '🟥'; }).join('');
    return '<div class="av-fim' + (ganhou ? ' av-ganhou' : '') + '"><p>' + txt + 'Era <b>' + esc(atual.nome) + '</b>.</p>' +
      '<div class="av-placar"><span><b>' + P.acertos + '</b>acertos</span><span><b>' + P.jogos + '</b>jogos</span><span><b>' + P.seq + '</b>seguidos</span><span><b>' + P.melhor + '</b>melhor sequência</span></div>' +
      '<div class="av-botoes">' + '<button type="button" class="ft-btn" data-acao="proximo">Próximo jogador</button>' +
      '<button type="button" class="ft-btn ft-btn-linha" data-acao="compartilhar" data-txt="' + esc(compart) + '">Compartilhar resultado</button></div>' +
      '</div>';
  }
  function pintar() {
    carregar();
    var fim = acabou();
    caixa.innerHTML = JB.topo(esporte, '', false, 'piloto') +
      '<section class="av-jogo"><header><h2>Quem é?</h2><p>Todos os clubes por onde ele passou, do primeiro ao atual.</p></header>' +
      trajetoria() + dicas() +
      (tentativas.length ? '<ul class="av-tentativas">' + tentativas.map(function (t) { return '<li class="' + (certo(t) ? 'av-certo' : 'av-errado') + '">' + (certo(t) ? '✓ ' : '✕ ') + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      (fim ? resultado() : '<div class="av-form"><div class="cp-busca"><input id="av-q" type="search" autocomplete="off" placeholder="Quem é? Digite o nome" aria-label="Nome do jogador"><ul class="mn-sug" hidden role="listbox"></ul></div>' +
        '<button type="button" class="ft-btn" id="av-chutar">Chutar</button></div><p class="av-resta">' + (TENTATIVAS - tentativas.length) + ' de ' + TENTATIVAS + ' tentativas</p>') +
      '</section>';
    ligar();
  }
  function chutar(nome) {
    nome = String(nome || '').trim();
    if (!nome || acabou() || tentativas.some(function (t) { return norm(t) === norm(nome); })) return;
    tentativas.push(nome);
    if (acabou()) {
      var P = placar(esporte), ganhou = tentativas.some(certo);
      P.jogos++; if (ganhou) { P.acertos++; P.seq++; P.melhor = Math.max(P.melhor, P.seq); } else P.seq = 0;
    }
    G.dia[chave()] = { t: tentativas.slice() };
    /* guarda só os desafios da última semana */
    var limite = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    Object.keys(G.dia).forEach(function (k) { if (k.slice(0, 10) < limite) delete G.dia[k]; });
    guardar(); pintar();
    var q = document.getElementById('av-q'); if (q) q.focus();
  }
  function ligar() {
    JB.ligarTopo(caixa, function (e) { esporte = e; pintar(); }, function () {});
    [].forEach.call(caixa.querySelectorAll('.av-botoes button'), function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-acao');
        if (a === 'proximo') proximo();
        if (a === 'compartilhar') JB.compartilhar(b, b.getAttribute('data-txt') + ' ' + location.origin + location.pathname + '#' + esporte);
      });
    });
    var inp = document.getElementById('av-q'); if (!inp) return;
    var nomes = JB.trajetorias(esporte).map(function (x) { return x.nome; }).sort(function (a, b) { return a.localeCompare(b); });
    JB.autocompletar(inp, inp.nextSibling, nomes, chutar);
    document.getElementById('av-chutar').addEventListener('click', function () { chutar(inp.value); });
  }
  pintar();
})();
