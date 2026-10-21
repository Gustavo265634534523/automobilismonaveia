/* Adivinhe o jogador (adivinhe.html): aparecem todos os clubes por onde ele passou, em ordem, e a pessoa tem 5
   tentativas para acertar quem é. A cada erro, uma dica nova (país, posição, iniciais, tamanho do nome).
   Futebol e NBA. Dois modos: o desafio do dia (o mesmo para todo
   mundo, um por dia) e o treino (um atrás do outro). Dados: assets/dados/adivinhe.js; o time atual é conferido com
   os números da temporada (o robô atualiza), para a trajetória não ficar velha quando o jogador muda de time. */
(function () {
  var caixa = document.getElementById('av');
  if (!caixa || !window.ADIVINHE) return;
  var esc = window.esc, TENTATIVAS = 5;
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
  var ESPORTES = [['futebol', 'Futebol', 'Adivinhe o jogador'], ['basquete', 'NBA', 'Adivinhe o jogador']];
  var esporte = /basquete|nba/.test(location.hash) ? 'basquete' : 'futebol';
  var modo = 'dia', treino = {}, tentativas = [], atual = null;

  /* ---------- time atual pelos dados da temporada ---------- */
  var timeAtual = {};
  (function () {
    var TF = window.TEMPORADA_FUTEBOL, TN = window.TEMPORADA_NBA, ultimo = {};
    ((TF && TF.jogadores) || []).forEach(function (l) { var k = norm(l[1]); if (!ultimo[k] || l[5] > ultimo[k][1]) ultimo[k] = [l[2], l[5]]; });
    Object.keys(ultimo).forEach(function (k) { timeAtual['futebol:' + k] = ultimo[k][0]; });
    var temps = Object.keys((TN && TN.temporadas) || {}).sort().reverse();
    temps.slice().reverse().forEach(function (t) { TN.temporadas[t].forEach(function (l) { timeAtual['basquete:' + norm(l[1])] = l[2]; }); });
  })();
  function lista(esp) {
    return window.ADIVINHE[esp].map(function (x) {
      var clubes = x[3].slice(), agora = /\s/.test(x[0]) && x[5] !== 'xará' ? timeAtual[esp + ':' + norm(x[0])] : '';
      if (agora && norm(agora) !== norm(clubes[clubes.length - 1])) clubes.push(agora);
      return { nome: x[0], pais: x[1], pos: x[2], clubes: clubes, aceitos: [x[0]].concat(x[4] || []).map(norm) };
    });
  }
  var LISTAS = {}; ESPORTES.forEach(function (e) { LISTAS[e[0]] = lista(e[0]); });

  /* ---------- placar guardado neste aparelho ---------- */
  var CHAVE = 'arena-adivinhe', G = { dia: {}, placar: {} };
  try { G = JSON.parse(localStorage.getItem(CHAVE) || 'null') || G; } catch (e) {}
  function guardar() { try { localStorage.setItem(CHAVE, JSON.stringify(G)); } catch (e) {} }
  var hoje = window.hojeISO ? window.hojeISO() : new Date().toISOString().slice(0, 10);
  function doDia(esp) {
    var h = 0, s = hoje + esp; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    var L = LISTAS[esp]; return L[h % L.length];
  }
  function placar(esp) { return G.placar[esp] = G.placar[esp] || { jogos: 0, acertos: 0, seq: 0, melhor: 0 }; }
  function sortear() {
    var L = LISTAS[esporte], ant = treino[esporte], x;
    do { x = L[Math.floor(Math.random() * L.length)]; } while (L.length > 1 && x === ant);
    treino[esporte] = x; tentativas = [];
  }
  function carregar() {
    if (modo === 'dia') {
      atual = doDia(esporte);
      var d = G.dia[hoje + ':' + esporte];
      tentativas = d ? d.t.slice() : [];
    } else { if (!treino[esporte]) sortear(); atual = treino[esporte]; }
  }
  /* certo: o nome dele ou de outro com a mesma trajetória */
  function certo(palpite) {
    var p = norm(palpite);
    return LISTAS[esporte].some(function (x) { return x.aceitos.indexOf(p) > -1 && x.clubes.join('|') === atual.clubes.join('|'); });
  }
  function acabou() { return tentativas.some(certo) || tentativas.length >= TENTATIVAS; }

  /* ---------- tela ---------- */
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
    var ganhou = tentativas.some(certo), n = tentativas.length;
    var P = placar(esporte);
    var txt = ganhou ? (n === 1 ? 'De primeira! ' : 'Acertou em ' + n + ' tentativas! ') : 'Não foi dessa vez. ';
    var compart = 'Arena Sports · ' + ESPORTES.filter(function (e) { return e[0] === esporte; })[0][2] + (modo === 'dia' ? ' do dia' : '') + ': ' + (ganhou ? n + '/' + TENTATIVAS : 'X/' + TENTATIVAS) + ' ' +
      tentativas.map(function (t) { return certo(t) ? '🟩' : '🟥'; }).join('');
    return '<div class="av-fim' + (ganhou ? ' av-ganhou' : '') + '"><p>' + txt + 'Era <b>' + esc(atual.nome) + '</b>.</p>' +
      '<div class="av-placar"><span><b>' + P.acertos + '</b>acertos</span><span><b>' + P.jogos + '</b>jogos</span><span><b>' + P.seq + '</b>seguidos</span><span><b>' + P.melhor + '</b>melhor sequência</span></div>' +
      '<div class="av-botoes">' + (modo === 'dia' ? '<button type="button" class="ft-btn" data-acao="treino">Jogar mais (treino)</button>' : '<button type="button" class="ft-btn" data-acao="proximo">Próximo jogador</button>') +
      '<button type="button" class="ft-btn ft-btn-linha" data-acao="compartilhar" data-txt="' + esc(compart) + '">Compartilhar resultado</button></div>' +
      (modo === 'dia' ? '<p class="av-volta">Amanhã tem outro desafio.</p>' : '') + '</div>';
  }
  function pintar() {
    carregar();
    var fim = acabou(), nomeJogo = ESPORTES.filter(function (e) { return e[0] === esporte; })[0][2];
    caixa.innerHTML = '<div class="dq-abas av-esportes" role="tablist">' + ESPORTES.map(function (e) { return '<button type="button" role="tab" data-e="' + e[0] + '" aria-selected="' + (esporte === e[0]) + '">' + e[1] + '</button>'; }).join('') + '</div>' +
      '<div class="av-modos" role="group" aria-label="Modo"><button type="button" data-m="dia" aria-pressed="' + (modo === 'dia') + '">Desafio do dia</button><button type="button" data-m="treino" aria-pressed="' + (modo === 'treino') + '">Treino</button></div>' +
      '<section class="av-jogo"><header><h2>' + nomeJogo + '</h2><p>' + 'Todos os clubes por onde ele passou, do primeiro ao atual.' + '</p></header>' +
      trajetoria() + dicas() +
      (tentativas.length ? '<ul class="av-tentativas">' + tentativas.map(function (t) { return '<li class="' + (certo(t) ? 'av-certo' : 'av-errado') + '">' + (certo(t) ? '✓ ' : '✕ ') + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      (fim ? resultado() : '<form class="av-form" autocomplete="off"><div class="cp-busca"><input id="av-q" type="search" placeholder="Quem é? Digite o nome" aria-label="Nome do jogador"><ul class="mn-sug" hidden role="listbox"></ul></div>' +
        '<button type="submit" class="ft-btn">Chutar</button></form><p class="av-resta">' + (TENTATIVAS - tentativas.length) + ' de ' + TENTATIVAS + ' tentativas</p>') +
      '</section>';
    document.body.setAttribute('data-esporte', esporte === 'basquete' ? 'basquete' : 'futebol');
    ligar();
  }
  function chutar(nome) {
    nome = String(nome || '').trim();
    if (!nome || acabou()) return;
    if (tentativas.some(function (t) { return norm(t) === norm(nome); })) return;
    tentativas.push(nome);
    if (acabou()) {
      var P = placar(esporte), ganhou = tentativas.some(certo);
      P.jogos++; if (ganhou) { P.acertos++; P.seq++; P.melhor = Math.max(P.melhor, P.seq); } else P.seq = 0;
    }
    if (modo === 'dia') G.dia[hoje + ':' + esporte] = { t: tentativas.slice() };
    /* guarda só os desafios da última semana */
    Object.keys(G.dia).forEach(function (k) { if (k.slice(0, 10) < new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)) delete G.dia[k]; });
    guardar(); pintar();
    var q = document.getElementById('av-q'); if (q) q.focus();
  }
  function ligar() {
    [].forEach.call(caixa.querySelectorAll('.av-esportes button'), function (b) { b.addEventListener('click', function () { esporte = b.getAttribute('data-e'); history.replaceState(null, '', '#' + esporte); pintar(); }); });
    [].forEach.call(caixa.querySelectorAll('.av-modos button'), function (b) { b.addEventListener('click', function () { modo = b.getAttribute('data-m'); if (modo === 'treino' && !treino[esporte]) sortear(); pintar(); }); });
    [].forEach.call(caixa.querySelectorAll('.av-botoes button'), function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-acao');
        if (a === 'treino') { modo = 'treino'; sortear(); pintar(); }
        if (a === 'proximo') { sortear(); pintar(); var q = document.getElementById('av-q'); if (q) q.focus(); }
        if (a === 'compartilhar') {
          var t = b.getAttribute('data-txt') + ' ' + location.origin + location.pathname + '#' + esporte;
          if (navigator.share) navigator.share({ text: t }).catch(function () {});
          else (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Copiado!'; }).catch(function () { prompt('Copie o resultado:', t); });
        }
      });
    });
    var f = caixa.querySelector('.av-form'); if (!f) return;
    var inp = f.querySelector('input'), ul = f.querySelector('.mn-sug'), sug = [], sel = 0;
    var NOMES = LISTAS[esporte].map(function (x) { return x.nome; }).sort(function (a, b) { return a.localeCompare(b); });
    function abrir() {
      var q = norm(inp.value); sel = 0;
      sug = q.length < 2 ? [] : NOMES.filter(function (n) { var m = norm(n); return m.indexOf(q) === 0 || m.indexOf(' ' + q) > -1; }).slice(0, 6);
      ul.hidden = !sug.length;
      ul.innerHTML = sug.map(function (n, k) { return '<li role="option" aria-selected="' + (k === sel) + '" data-k="' + k + '"><b>' + esc(n) + '</b></li>'; }).join('');
    }
    inp.addEventListener('input', abrir);
    inp.addEventListener('keydown', function (e) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && sug.length) { e.preventDefault(); sel = Math.max(0, Math.min(sug.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1))); [].forEach.call(ul.children, function (li, k) { li.setAttribute('aria-selected', k === sel); }); }
      if (e.key === 'Escape') ul.hidden = true;
    });
    ul.addEventListener('mousedown', function (e) { var li = e.target.closest('li'); if (li) { e.preventDefault(); chutar(sug[+li.getAttribute('data-k')]); } });
    inp.addEventListener('blur', function () { setTimeout(function () { ul.hidden = true; }, 150); });
    f.addEventListener('submit', function (e) { e.preventDefault(); chutar(!ul.hidden && sug[sel] ? sug[sel] : inp.value); });
  }
  pintar();
})();
