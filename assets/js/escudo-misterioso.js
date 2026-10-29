/* Escudo misterioso (escudo-misterioso.html): o escudo aparece borrado, em preto e branco e de perto. A cada erro ele
   fica mais nítido. São 5 tentativas para acertar o time. Futebol (times dos campeonatos do site) e basquete
   (NBA, NBB e Euroleague), só os que têm escudo. Começa no escudo do dia (o mesmo para todo mundo); "Próximo escudo"
   sorteia outro. Dicas: o campeonato desde o começo e, depois do 2º erro, a primeira letra. */
(function () {
  var caixa = document.getElementById('em'), JB = window.JOGOS_BASE;
  if (!caixa || !JB || !window.todosTimes) return;
  var esc = window.esc, norm = JB.norm, TENTATIVAS = 5;
  /* do mais difícil ao mais fácil: borrão, zoom e cor */
  var NIVEL = [[6, 1.45, .3], [4, 1.3, .1], [2.5, 1.15, 0], [1.2, 1.05, 0], [.5, 1, 0], [0, 1, 0]];
  var esporte = JB.esporteDaPagina(), G = JB.ler('arena-escudo', null) || { dia: {}, placar: {} };
  G.n = G.n || {}; /* quantos "Próximo escudo" a pessoa pediu hoje, por esporte (0 = o escudo do dia) */
  var atual = null, tentativas = [];

  var pools = {};
  function pool(esp) {
    if (pools[esp]) return pools[esp];
    var E = window.ESCUDOS || {};
    var comps = window.COMPETICOES || [], nomeComp = function (sl) { var c = comps.filter(function (x) { return x.slug === sl; })[0]; return c ? c.menu || c.nome : ''; };
    return pools[esp] = window.todosTimes(esp).filter(function (t) { return E[t.nome]; }).map(function (t) { return { nome: t.nome, img: E[t.nome], comp: nomeComp((t.comps || [])[0]) }; });
  }
  function numero() { return G.n[JB.hoje + ':' + esporte] || 0; }
  function chave() { var n = numero(); return JB.hoje + ':' + esporte + (n ? ':' + n : ''); }
  function carregar() {
    var L = pool(esporte), n = numero();
    atual = L[JB.semente(JB.hoje + ':escudo:' + esporte + (n ? ':' + n : '')) % L.length];
    var d = G.dia[chave()]; tentativas = d ? d.t.slice() : [];
  }
  function proximo() {
    G.n[JB.hoje + ':' + esporte] = numero() + 1;
    Object.keys(G.n).forEach(function (k) { if (k.slice(0, 10) !== JB.hoje) delete G.n[k]; });
    delete G.dia[chave()]; JB.guardar('arena-escudo', G); pintar();
    var q = document.getElementById('em-q'); if (q) q.focus();
  }
  function certo(t) { return norm(t) === norm(atual.nome); }
  function acabou() { return tentativas.some(certo) || tentativas.length >= TENTATIVAS; }
  function pintar() {
    var L = pool(esporte);
    if (!L.length) { caixa.innerHTML = JB.topo(esporte, '', false, 'circuito') + '<p class="pt-vazio">Sem escudos para jogar agora.</p>'; ligar(); return; }
    carregar();
    var fim = acabou(), ganhou = tentativas.some(certo), n = fim ? NIVEL.length - 1 : Math.min(tentativas.length, NIVEL.length - 1), v = NIVEL[n];
    var P = G.placar[esporte] || { jogos: 0, acertos: 0, seq: 0, melhor: 0 };
    var compart = 'Fan Zone · Escudo misterioso' + (numero() ? '' : ' do dia') + (esporte === 'basquete' ? ' (basquete)' : '') + ': ' + (ganhou ? tentativas.length : 'X') + '/' + TENTATIVAS + ' ' +
      tentativas.map(function (t) { return certo(t) ? '🟩' : '🟥'; }).join('');
    caixa.innerHTML = JB.topo(esporte, '', false, 'circuito') +
      '<section class="av-jogo es-jogo"><header><h2>De quem é esse escudo?</h2><p>A cada erro, o escudo fica mais nítido. ' + TENTATIVAS + ' tentativas.</p></header>' +
      (fim ? '' : '<p class="es-dica">' + (atual.comp ? 'Campeonato: <b>' + esc(atual.comp) + '</b>' : '') + (tentativas.length >= 2 ? (atual.comp ? ' · ' : '') + 'Começa com <b>' + esc(atual.nome.charAt(0)) + '</b>' : '') + '</p>') +
      '<div class="es-moldura"><div class="es-img" role="img" aria-label="Escudo escondido" style="background-image:url(\'' + atual.img + '\');filter:blur(' + v[0] + 'px) grayscale(' + v[2] + ');transform:scale(' + v[1] + ')"></div></div>' +
      (tentativas.length ? '<ul class="av-tentativas">' + tentativas.map(function (t) { return '<li class="' + (certo(t) ? 'av-certo' : 'av-errado') + '">' + (certo(t) ? '✓ ' : '✕ ') + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      (fim ? '<div class="av-fim' + (ganhou ? ' av-ganhou' : '') + '"><p>' + (ganhou ? (tentativas.length === 1 ? 'De primeira! ' : 'Acertou em ' + tentativas.length + '! ') : 'Não foi dessa vez. ') + 'É o <b>' + esc(atual.nome) + '</b>.</p>' +
          '<div class="av-placar"><span><b>' + P.acertos + '</b>acertos</span><span><b>' + P.jogos + '</b>jogos</span><span><b>' + P.seq + '</b>seguidos</span><span><b>' + P.melhor + '</b>melhor sequência</span></div>' +
          '<div class="av-botoes">' + '<button type="button" class="ft-btn" data-acao="proximo">Próximo escudo</button>' +
          '<button type="button" class="ft-btn ft-btn-linha" data-acao="compartilhar" data-txt="' + esc(compart) + '">Compartilhar resultado</button></div></div>'
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
    G.dia[chave()] = { t: tentativas.slice() };
    var limite = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    Object.keys(G.dia).forEach(function (k) { if (k.slice(0, 10) < limite) delete G.dia[k]; });
    JB.guardar('arena-escudo', G); pintar();
    var q = document.getElementById('em-q'); if (q) q.focus();
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
    var inp = document.getElementById('em-q'); if (!inp) return;
    JB.autocompletar(inp, inp.nextSibling, pool(esporte).map(function (t) { return t.nome; }).sort(function (a, b) { return a.localeCompare(b, 'pt'); }), chutar);
    document.getElementById('em-ok').addEventListener('click', function () { chutar(inp.value); });
  }
  pintar();
})();
