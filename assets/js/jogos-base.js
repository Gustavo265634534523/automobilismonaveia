/* Peças comuns dos jogos de futebol e basquete (Adivinhe o jogador, Grade, Mais ou menos e Escudo misterioso).
   - trajetorias(esporte): os jogadores de assets/dados/adivinhe.js, com o time atual conferido nos dados da temporada
     (temporada-futebol.js e temporada-nba.js): se ele mudou de time, o novo entra no fim da trajetória;
   - sorteio com semente (o desafio do dia é o mesmo para todo mundo), guardar e ler no aparelho;
   - busca com sugestões enquanto digita (a lista abre embaixo do campo);
   - topo dos jogos: abas Futebol / NBA, desafio do dia ou treino e o link de volta para a página de jogos. */
(function () {
  var esc = window.esc;
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
  var hoje = window.hojeISO ? window.hojeISO() : new Date().toISOString().slice(0, 10);

  /* time atual de cada jogador, pelo nome */
  var timeAtual = null;
  function montarTimeAtual() {
    timeAtual = {};
    var TF = window.TEMPORADA_FUTEBOL, TN = window.TEMPORADA_NBA, ultimo = {};
    ((TF && TF.jogadores) || []).forEach(function (l) { var k = norm(l[1]); if (!ultimo[k] || l[5] > ultimo[k][1]) ultimo[k] = [l[2], l[5]]; });
    Object.keys(ultimo).forEach(function (k) { timeAtual['futebol:' + k] = ultimo[k][0]; });
    Object.keys((TN && TN.temporadas) || {}).sort().forEach(function (t) { TN.temporadas[t].forEach(function (l) { timeAtual['basquete:' + norm(l[1])] = l[2]; }); });
  }
  var cache = {};
  function trajetorias(esp) {
    if (cache[esp]) return cache[esp];
    if (!timeAtual) montarTimeAtual();
    return cache[esp] = ((window.ADIVINHE || {})[esp] || []).map(function (x) {
      /* só nome com sobrenome e sem xará conhecido: "Marcelo" sozinho casaria com outro jogador */
      var clubes = x[3].slice(), agora = /\s/.test(x[0]) && x[5] !== 'xará' ? timeAtual[esp + ':' + norm(x[0])] : '';
      if (agora && norm(agora) !== norm(clubes[clubes.length - 1])) clubes.push(agora);
      return { nome: x[0], pais: x[1], pos: x[2], clubes: clubes, aceitos: [x[0]].concat(x[4] || []).map(norm) };
    });
  }

  /* sorteio com semente: mulberry32 */
  function semente(s) { var h = 1779033703; for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 3432918353), h = h << 13 | h >>> 19; return h >>> 0; }
  function aleatorio(seed) {
    var a = typeof seed === 'string' ? semente(seed) : seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function embaralhar(lista, r) { var a = lista.slice(); r = r || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function ler(chave, padrao) { try { var v = localStorage.getItem(chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function guardar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch (e) {} }

  /* sugestões enquanto digita. nomes: lista de textos; escolher(nome) é chamado no Enter ou no toque */
  function autocompletar(inp, ul, nomes, escolher) {
    var sug = [], sel = 0;
    function abrir() {
      var q = norm(inp.value); sel = 0;
      sug = q.length < 2 ? [] : nomes.filter(function (n) { var m = norm(n); return m.indexOf(q) === 0 || m.indexOf(' ' + q) > -1; }).slice(0, 6);
      ul.hidden = !sug.length;
      ul.innerHTML = sug.map(function (n, k) { return '<li role="option" aria-selected="' + (k === sel) + '" data-k="' + k + '"><b>' + esc(n) + '</b></li>'; }).join('');
    }
    inp.addEventListener('input', abrir);
    inp.addEventListener('keydown', function (e) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && sug.length) { e.preventDefault(); sel = Math.max(0, Math.min(sug.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1))); [].forEach.call(ul.children, function (li, k) { li.setAttribute('aria-selected', k === sel); }); }
      if (e.key === 'Enter') { e.preventDefault(); var v = !ul.hidden && sug[sel] ? sug[sel] : inp.value.trim(); if (v) { ul.hidden = true; escolher(v); } }
      if (e.key === 'Escape') ul.hidden = true;
    });
    ul.addEventListener('mousedown', function (e) { var li = e.target.closest('li'); if (li) { e.preventDefault(); ul.hidden = true; escolher(sug[+li.getAttribute('data-k')]); } });
    inp.addEventListener('blur', function () { setTimeout(function () { ul.hidden = true; }, 150); });
  }

  /* topo comum: volta para os jogos, abas do esporte e modo (dia ou treino). A aba Fórmula 1 leva para os jogos
     da F1 (jogos.html); f1: o jogo da F1 mais parecido com este (ex.: 'piloto' abre o Piloto misterioso) */
  function abasEsporte(esporte, f1) {
    return '<div class="dq-abas jb-esportes" role="tablist"><button type="button" role="tab" data-e="futebol" aria-selected="' + (esporte === 'futebol') + '">Futebol</button>' +
      '<button type="button" role="tab" data-e="basquete" aria-selected="' + (esporte === 'basquete') + '">NBA</button>' +
      (f1 === false ? '' : f1 === 'aqui' ? '<button type="button" role="tab" data-e="f1" aria-selected="' + (esporte === 'f1') + '">Fórmula 1</button>' : '<a role="tab" aria-selected="false" href="jogos.html' + (f1 ? '#' + f1 : '') + '">Fórmula 1</a>') + '</div>';
  }
  function topo(esporte, modo, comModo, f1) {
    return '<a class="pt-voltar" href="jogos-esportes.html#' + esporte + '">‹ Todos os jogos</a>' + abasEsporte(esporte, f1) +
      (comModo === false ? '' : '<div class="av-modos" role="group" aria-label="Modo"><button type="button" data-m="dia" aria-pressed="' + (modo === 'dia') + '">Desafio do dia</button><button type="button" data-m="treino" aria-pressed="' + (modo === 'treino') + '">Treino</button></div>');
  }
  function ligarTopo(caixa, aoTrocarEsporte, aoTrocarModo) {
    [].forEach.call(caixa.querySelectorAll('.jb-esportes button'), function (b) {
      /* troca de esporte recarrega a página, para o menu de cima mostrar o esporte certo */
      b.addEventListener('click', function () { var e = b.getAttribute('data-e'); history.replaceState(null, '', '#' + e); location.reload(); });
    });
    [].forEach.call(caixa.querySelectorAll('.av-modos button'), function (b) { b.addEventListener('click', function () { aoTrocarModo(b.getAttribute('data-m')); }); });
  }
  function esporteDaPagina() { var e = /basquete|nba/.test(location.hash) ? 'basquete' : 'futebol'; document.body.setAttribute('data-esporte', e); return e; }
  function compartilhar(botao, texto) {
    if (navigator.share) return navigator.share({ text: texto }).catch(function () {});
    (navigator.clipboard ? navigator.clipboard.writeText(texto) : Promise.reject()).then(function () { botao.textContent = 'Copiado!'; }).catch(function () { prompt('Copie:', texto); });
  }

  window.JOGOS_BASE = { norm: norm, hoje: hoje, trajetorias: trajetorias, aleatorio: aleatorio, semente: semente, embaralhar: embaralhar, ler: ler, guardar: guardar,
    autocompletar: autocompletar, topo: topo, abasEsporte: abasEsporte, ligarTopo: ligarTopo, esporteDaPagina: esporteDaPagina, compartilhar: compartilhar };
})();
