/* Escudo misterioso (escudo-misterioso.html): o escudo aparece borrado, em preto e branco e de perto. A cada erro ele
   fica mais nítido. São 5 tentativas para acertar o time. Futebol (times dos campeonatos do site) e basquete
   (NBA, NBB e Euroleague), só os que têm escudo. Desafio do dia (o mesmo para todo mundo) e treino. */
(function () {
  var caixa = document.getElementById('em'), JB = window.JOGOS_BASE;
  if (!caixa || !JB || !window.todosTimes) return;
  var esc = window.esc, norm = JB.norm, TENTATIVAS = 5;
  /* do mais difícil ao mais fácil: borrão, zoom e cor */
  var NIVEL = [[16, 2.6, 1], [11, 2, 1], [7, 1.6, .6], [4, 1.25, .2], [1.5, 1, 0], [0, 1, 0]];
  var esporte = JB.esporteDaPagina(), modo = 'dia', treino = {}, G = JB.ler('arena-escudo', null) || { dia: {}, placar: {} };
  var atual = null, tentativas = [];

  var pools = {};
  function pool(esp) {
    if (pools[esp]) return pools[esp];
    var E = window.ESCUDOS || {};
    return pools[esp] = window.todosTimes(esp).filter(function (t) { return E[t.nome]; }).map(function (t) { return { nome: t.nome, img: E[t.nome] }; });
  }
  function carregar() {
    var L = pool(esporte);
    if (modo === 'dia') { atual = L[JB.semente(JB.hoje + ':escudo:' + esporte) % L.length]; var d = G.dia[JB.hoje + ':' + esporte]; tentativas = d ? d.t.slice() : []; }
    else { if (!treino[esporte]) sortear(); atual = treino[esporte]; }
  }
  function sortear() { var L = pool(esporte), x; do { x = L[Math.floor(Math.random() * L.length)]; } while (L.length > 1 && x === treino[esporte]); treino[esporte] = x; tentativas = []; }
  function certo(t) { return norm(t) === norm(atual.nome); }
  function acabou() { return tentativas.some(certo) || tentativas.length >= TENTATIVAS; }
  function pintar() {
    var L = pool(esporte);
    if (!L.length) { caixa.innerHTML = JB.topo(esporte, modo, true, 'circuito') + '<p class="pt-vazio">Sem escudos para jogar agora.</p>'; ligar(); return; }
    carregar();
    var fim = acabou(), ganhou = tentativas.some(certo), n = fim ? NIVEL.length - 1 : Math.min(tentativas.length, NIVEL.length - 1), v = NIVEL[n];
    var P = G.placar[esporte] || { jogos: 0, acertos: 0, seq: 0, melhor: 0 };
    var compart = 'Arena Sports · Escudo misterioso' + (modo === 'dia' ? ' do dia' : '') + (esporte === 'basquete' ? ' (basquete)' : '') + ': ' + (ganhou ? tentativas.length : 'X') + '/' + TENTATIVAS + ' ' +
      tentativas.map(function (t) { return certo(t) ? '🟩' : '🟥'; }).join('');
    caixa.innerHTML = JB.topo(esporte, modo, true, 'circuito') +
      '<section class="av-jogo es-jogo"><header><h2>De quem é esse escudo?</h2><p>A cada erro, o escudo fica mais nítido. ' + TENTATIVAS + ' tentativas.</p></header>' +
      '<div class="es-moldura"><div class="es-img" role="img" aria-label="Escudo escondido" style="background-image:url(\'' + atual.img + '\');filter:blur(' + v[0] + 'px) grayscale(' + v[2] + ');transform:scale(' + v[1] + ')"></div></div>' +
      (tentativas.length ? '<ul class="av-tentativas">' + tentativas.map(function (t) { return '<li class="' + (certo(t) ? 'av-certo' : 'av-errado') + '">' + (certo(t) ? '✓ ' : '✕ ') + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      (fim ? '<div class="av-fim' + (ganhou ? ' av-ganhou' : '') + '"><p>' + (ganhou ? (tentativas.length === 1 ? 'De primeira! ' : 'Acertou em ' + tentativas.length + '! ') : 'Não foi dessa vez. ') + 'É o <b>' + esc(atual.nome) + '</b>.</p>' +
          '<div class="av-placar"><span><b>' + P.acertos + '</b>acertos</span><span><b>' + P.jogos + '</b>jogos</span><span><b>' + P.seq + '</b>seguidos</span><span><b>' + P.melhor + '</b>melhor sequência</span></div>' +
          '<div class="av-botoes">' + (modo === 'dia' ? '<button type="button" class="ft-btn" data-acao="treino">Jogar mais (treino)</button>' : '<button type="button" class="ft-btn" data-acao="proximo">Próximo escudo</button>') +
          '<button type="button" class="ft-btn ft-btn-linha" data-acao="compartilhar" data-txt="' + esc(compart) + '">Compartilhar resultado</button></div>' + (modo === 'dia' ? '<p class="av-volta">Amanhã tem outro escudo.</p>' : '') + '</div>'
        : '<div class="av-form"><div class="cp-busca"><input id="em-q" type="search" autocomplete="off" placeholder="Qual é o time?" aria-label="Nome do time"><ul class="mn-sug" hidden role="listbox"></ul></div><button type="button" class="ft-btn" id="em-ok">Chutar</button></div>' +
          '<p class="av-resta">' + (TENTATIVAS - tentativas.length) + ' de ' + TENTATIVAS + ' tentativas</p>') +
      '</section>';
    ligar();
  }
  function chutar(nome) {
    nome = String(nome || '').trim();
    if (!nome || acabou() || tentativas.some(function (t) { return norm(t) === norm(nome); })) return;
    tentativas.push(nome);
    if (acabou()) {
      var P = G.placar[esporte] = G.placar[esporte] || { jogos: 0, acertos: 0, seq: 0, melhor: 0 }, ganhou = tentativas.some(certo);
      P.jogos++; if (ganhou) { P.acertos++; P.seq++; P.melhor = Math.max(P.melhor, P.seq); } else P.seq = 0;
    }
    if (modo === 'dia') G.dia[JB.hoje + ':' + esporte] = { t: tentativas.slice() };
    var limite = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    Object.keys(G.dia).forEach(function (k) { if (k.slice(0, 10) < limite) delete G.dia[k]; });
    JB.guardar('arena-escudo', G); pintar();
    var q = document.getElementById('em-q'); if (q) q.focus();
  }
  function ligar() {
    JB.ligarTopo(caixa, function (e) { esporte = e; pintar(); }, function (m) { modo = m; if (modo === 'treino' && !treino[esporte]) sortear(); pintar(); });
    [].forEach.call(caixa.querySelectorAll('.av-botoes button'), function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-acao');
        if (a === 'treino') { modo = 'treino'; sortear(); pintar(); }
        if (a === 'proximo') { sortear(); pintar(); var q = document.getElementById('em-q'); if (q) q.focus(); }
        if (a === 'compartilhar') JB.compartilhar(b, b.getAttribute('data-txt') + ' ' + location.origin + location.pathname + '#' + esporte);
      });
    });
    var inp = document.getElementById('em-q'); if (!inp) return;
    JB.autocompletar(inp, inp.nextSibling, pool(esporte).map(function (t) { return t.nome; }).sort(function (a, b) { return a.localeCompare(b, 'pt'); }), chutar);
    document.getElementById('em-ok').addEventListener('click', function () { chutar(inp.value); });
  }
  pintar();
})();
