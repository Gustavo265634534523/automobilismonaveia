/* Grade (grade.html): um quadro 3x3 com um time (ou um país) em cada linha e em cada coluna. Em cada casa, a pessoa
   diz um jogador que passou pelos dois. São 9 chutes para as 9 casas e cada jogador só vale uma vez.
   As grades são montadas com as trajetórias de jogos-base.js: só entra grade em que toda casa tem resposta.
   Começa no desafio do dia (a mesma grade para todo mundo); o botão Atualizar troca por outra grade (fica guardada no aparelho). */
(function () {
  var caixa = document.getElementById('gr'), JB = window.JOGOS_BASE;
  if (!caixa || !JB) return;
  var esc = window.esc, norm = JB.norm, CHUTES = 9;
  var BANDEIRA = { Brasil: '🇧🇷', Argentina: '🇦🇷', França: '🇫🇷', Portugal: '🇵🇹', Espanha: '🇪🇸', Inglaterra: '🏴', Alemanha: '🇩🇪', Uruguai: '🇺🇾', Bélgica: '🇧🇪',
    'Estados Unidos': '🇺🇸', Canadá: '🇨🇦', Austrália: '🇦🇺', Itália: '🇮🇹', Holanda: '🇳🇱', Colômbia: '🇨🇴', Sérvia: '🇷🇸', 'República Dominicana': '🇩🇴' };
  var esporte = JB.esporteDaPagina(), G = JB.ler('arena-grade', null) || { dia: {}, placar: {} };
  G.n = G.n || {}; /* quantas vezes a pessoa atualizou a grade hoje, por esporte (0 = desafio do dia) */
  var grade = null, estado = null, casa = null, aviso = '';

  /* critérios: clube com 3 ou mais jogadores, ou país com 3 ou mais */
  function criterios(esp) {
    var C = {};
    JB.trajetorias(esp).forEach(function (x) {
      x.clubes.filter(function (c, i, a) { return a.indexOf(c) === i; }).forEach(function (c) { (C['c:' + c] = C['c:' + c] || []).push(x); });
      (C['p:' + x.pais] = C['p:' + x.pais] || []).push(x);
    });
    Object.keys(C).forEach(function (k) { if (C[k].length < 3) delete C[k]; });
    return C;
  }
  function vale(x, k) { return k.charAt(0) === 'c' ? x.clubes.indexOf(k.slice(2)) > -1 : x.pais === k.slice(2); }
  function respostas(r, c) { return JB.trajetorias(esporte).filter(function (x) { return vale(x, r) && vale(x, c); }); }
  function montar(rng) {
    var C = criterios(esporte), K = Object.keys(C);
    for (var t = 0; t < 4000; t++) {
      var linhas = JB.embaralhar(K, rng).slice(0, 3);
      if (linhas.filter(function (k) { return k.charAt(0) === 'p'; }).length > 1) continue;
      var cols = JB.embaralhar(K, rng).filter(function (k) {
        return linhas.indexOf(k) < 0 && !(k.charAt(0) === 'p' && linhas.some(function (l) { return l.charAt(0) === 'p'; })) &&
          linhas.every(function (l) { return C[l].some(function (x) { return vale(x, k); }); });
      });
      /* no máximo um país na grade inteira */
      var paises = 0; cols = cols.filter(function (k) { if (k.charAt(0) !== 'p') return true; return paises++ === 0; });
      if (cols.length >= 3) return { linhas: linhas, colunas: cols.slice(0, 3) };
    }
    return null;
  }
  function carregar() {
    var n = numero();
    grade = montar(JB.aleatorio(JB.hoje + ':grade:' + esporte + (n ? ':' + n : '')));
    estado = G.dia[chave()] || { casas: {}, chutes: 0 };
  }
  function numero() { return G.n[JB.hoje + ':' + esporte] || 0; }
  function chave() { var n = numero(); return JB.hoje + ':' + esporte + (n ? ':' + n : ''); }
  function atualizar() {
    G.n[JB.hoje + ':' + esporte] = numero() + 1;
    Object.keys(G.n).forEach(function (k) { if (k.slice(0, 10) !== JB.hoje) delete G.n[k]; });
    casa = null; aviso = ''; salvar(); pintar();
  }
  function acabou() { return estado.chutes >= CHUTES || Object.keys(estado.casas).length >= 9; }
  function rotulo(k) {
    var n = k.slice(2);
    return k.charAt(0) === 'c' ? window.escudoTime(n, 'gr-escudo') + '<b>' + esc(n) + '</b>' : '<span class="gr-bandeira">' + (BANDEIRA[n] || '🌍') + '</span><b>' + esc(n) + '</b><small>país</small>';
  }
  function salvar() {
    G.dia[chave()] = estado;
    var limite = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    Object.keys(G.dia).forEach(function (k) { if (k.slice(0, 10) < limite) delete G.dia[k]; });
    JB.guardar('arena-grade', G);
  }
  function chutar(nome) {
    if (!casa || acabou()) return;
    var p = norm(nome), x = JB.trajetorias(esporte).filter(function (j) { return j.aceitos.indexOf(p) > -1; })[0];
    if (!x) { aviso = 'Não achei “' + esc(nome) + '” na nossa lista de jogadores. Escolha um nome das sugestões; esse chute não conta.'; pintar(); return; }
    var usados = Object.keys(estado.casas).map(function (k) { return estado.casas[k]; });
    if (usados.indexOf(x.nome) > -1) { aviso = esc(x.nome) + ' já está em outra casa. Cada jogador vale uma vez.'; pintar(); return; }
    estado.chutes++;
    var r = grade.linhas[casa[0]], c = grade.colunas[casa[1]];
    if (vale(x, r) && vale(x, c)) { estado.casas[casa.join('')] = x.nome; aviso = '✓ ' + esc(x.nome) + ' passou pelos dois.'; casa = null; }
    else { var falta = !vale(x, r) ? r : c; aviso = '✕ ' + esc(x.nome) + (falta.charAt(0) === 'p' ? ' não é ' + (falta.slice(2) === 'Estados Unidos' ? 'dos ' : 'do ') + esc(falta.slice(2)) : ' não passou pelo ' + esc(falta.slice(2))) + '.'; }
    if (acabou()) {
      casa = null;
      var P = G.placar[esporte] = G.placar[esporte] || { jogos: 0, casas: 0, completas: 0 };
      var n = Object.keys(estado.casas).length; P.jogos++; P.casas += n; if (n === 9) P.completas++;
    }
    salvar(); pintar();
    var inp = document.getElementById('gr-q'); if (inp) inp.focus();
  }
  function pintar() {
    carregar();
    if (!grade) { caixa.innerHTML = JB.topo(esporte, '', false, '') + '<p class="pt-vazio">Não deu para montar uma grade agora.</p>'; ligar(); return; }
    var fim = acabou(), certos = Object.keys(estado.casas).length;
    var cel = '<div class="gr-quadro"><div class="gr-canto"><b>' + (CHUTES - estado.chutes) + '</b><small>chutes</small></div>' +
      grade.colunas.map(function (k) { return '<div class="gr-cab">' + rotulo(k) + '</div>'; }).join('');
    grade.linhas.forEach(function (r, i) {
      cel += '<div class="gr-cab gr-cab-linha">' + rotulo(r) + '</div>';
      grade.colunas.forEach(function (c, j) {
        var k = '' + i + j, feito = estado.casas[k], sel = casa && casa[0] === i && casa[1] === j;
        var dica = fim && !feito ? respostas(r, c)[0] : null;
        cel += '<button type="button" class="gr-casa' + (feito ? ' gr-feita' : '') + (sel ? ' gr-sel' : '') + (dica ? ' gr-revela' : '') + '" data-i="' + i + '" data-j="' + j + '"' + (feito || fim ? ' disabled' : '') + '>' +
          (feito ? '<b>' + esc(feito) + '</b>' : dica ? '<small>Uma resposta:</small><b>' + esc(dica.nome) + '</b>' : '<span>+</span>') + '</button>';
      });
    });
    cel += '</div>';
    var compart = 'Fan Zone · Grade' + (numero() ? '' : ' do dia') + (esporte === 'basquete' ? ' (NBA)' : '') + ': ' + certos + '/9\n' +
      [0, 1, 2].map(function (i) { return [0, 1, 2].map(function (j) { return estado.casas['' + i + j] ? '🟩' : '⬜'; }).join(''); }).join('\n');
    var P = G.placar[esporte] || { jogos: 0, casas: 0, completas: 0 };
    caixa.innerHTML = JB.topo(esporte, '', false, '') +
      '<section class="av-jogo gr-jogo"><header><h2>Grade' + (numero() ? '' : ' do dia') + '</h2><p>Em cada casa, um jogador que passou pelo time da linha e pelo da coluna (ou que é do país). Toque na casa e digite. São 9 chutes.</p></header>' +
      cel +
      (fim ? '<div class="av-fim' + (certos >= 6 ? ' av-ganhou' : '') + '"><p>' + (certos === 9 ? 'Grade completa! ' : '') + 'Você acertou <b>' + certos + ' de 9</b>.' + (certos < 9 ? ' Nas casas vazias aparece uma resposta possível.' : '') + '</p>' +
          '<div class="av-placar"><span><b>' + P.jogos + '</b>grades</span><span><b>' + P.completas + '</b>completas</span><span><b>' + (P.jogos ? (P.casas / P.jogos).toFixed(1).replace('.', ',') : '0') + '</b>média de acertos</span><span><b>' + certos + '</b>nesta</span></div>' +
          '<div class="av-botoes">' + '<button type="button" class="ft-btn" data-acao="nova">↻ Nova grade</button>' +
          '<button type="button" class="ft-btn ft-btn-linha" data-acao="compartilhar" data-txt="' + esc(compart) + '">Compartilhar resultado</button></div></div>'
        : casa ? '<div class="gr-palpite"><p>' + esc(grade.linhas[casa[0]].slice(2)) + ' × ' + esc(grade.colunas[casa[1]].slice(2)) + '</p><div class="av-form"><div class="cp-busca"><input id="gr-q" type="search" autocomplete="off" placeholder="Digite o jogador" aria-label="Jogador"><ul class="mn-sug" hidden role="listbox"></ul></div><button type="button" class="ft-btn" id="gr-ok">Chutar</button></div></div>'
        : '<p class="av-resta">Toque numa casa vazia para chutar.</p>') +
      (aviso ? '<p class="gr-aviso">' + aviso + '</p>' : '') +
      (fim ? '' : '<div class="gr-atualizar"><button type="button" class="ft-btn ft-btn-linha" id="gr-atualizar">↻ Atualizar grade</button><small>Travou? Troque por outra grade.</small></div>') + '</section>';
    ligar();
  }
  function ligar() {
    JB.ligarTopo(caixa, function (e) { esporte = e; casa = null; aviso = ''; pintar(); }, function () {});
    var at = document.getElementById('gr-atualizar'); if (at) at.addEventListener('click', atualizar);
    [].forEach.call(caixa.querySelectorAll('.gr-casa:not([disabled])'), function (b) {
      b.addEventListener('click', function () { casa = [+b.getAttribute('data-i'), +b.getAttribute('data-j')]; aviso = ''; pintar(); var q = document.getElementById('gr-q'); if (q) q.focus(); });
    });
    [].forEach.call(caixa.querySelectorAll('.av-botoes button'), function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-acao');
        if (a === 'nova') atualizar();
        if (a === 'compartilhar') JB.compartilhar(b, b.getAttribute('data-txt') + '\n' + location.origin + location.pathname + '#' + esporte);
      });
    });
    var inp = document.getElementById('gr-q'); if (!inp) return;
    var nomes = JB.trajetorias(esporte).map(function (x) { return x.nome; }).sort(function (a, b) { return a.localeCompare(b); });
    JB.autocompletar(inp, inp.nextSibling, nomes, chutar);
    document.getElementById('gr-ok').addEventListener('click', function () { chutar(inp.value); });
  }
  pintar();
})();
