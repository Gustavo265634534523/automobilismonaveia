/* Página do jogo de futebol (partida.html?id=<id da ESPN>): placar, lance a lance (gols, cartões, substituições)
   e escalações desenhadas no campo. Os dados vêm do robô .github/partidas.js (assets/dados/partidas/<id>.json,
   a cada 10 minutos); com o jogo rolando, a página busca o arquivo de novo a cada 2 minutos. */
(function () {
  var caixa = document.getElementById('pg');
  if (!caixa || document.body.getAttribute('data-pagina') !== 'partida') return;
  var esc = window.esc, id = (location.search.match(/[?&]id=(\d+)/) || [])[1];
  var COMPS = window.COMPETICOES || [];
  var achado = null;
  COMPS.forEach(function (c) { (c.jogos || []).forEach(function (j) { if (id && j.id === id) achado = { c: c, j: j }; }); });
  if (!id) { caixa.innerHTML = '<p class="pt-vazio">Jogo não encontrado. <a href="futebol.html">Voltar para o futebol</a>.</p>'; return; }

  var aba = /escalacoes/.test(location.hash) ? 'escalacoes' : 'lances', dados = null;
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  function sobrenome(n) { var p = String(n).trim().split(/\s+/); return p.length > 1 && p[p.length - 1].length > 2 ? p[p.length - 1] : n; }

  /* textos de cada lance */
  var ICONE = { gol: '⚽', 'gol-penalti': '⚽', 'gol-contra': '⚽', amarelo: '<i class="pt-cartao"></i>', vermelho: '<i class="pt-cartao pt-verm"></i>',
    troca: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v13M3 13l4 4 4-4M17 20V7M13 11l4-4 4 4"/></svg>', 'penalti-perdido': '✕', intervalo: '⏸', fim: '🏁', inicio: '▶' };
  function texto(l) {
    switch (l.tipo) {
      case 'gol': return '<b>Gol do ' + esc(l.time) + '!</b> ' + esc(l.quem) + (l.extra ? '<small>Assistência de ' + esc(l.extra) + '</small>' : '');
      case 'gol-penalti': return '<b>Gol de pênalti do ' + esc(l.time) + '!</b> ' + esc(l.quem);
      case 'gol-contra': return '<b>Gol contra</b> de ' + esc(l.quem) + (l.time ? ' (' + esc(l.time) + ')' : '');
      case 'amarelo': return 'Cartão amarelo para <b>' + esc(l.quem) + '</b>';
      case 'vermelho': return 'Cartão vermelho para <b>' + esc(l.quem) + '</b>';
      case 'troca': return 'Entra <b>' + esc(l.quem) + '</b>' + (l.extra ? ', sai ' + esc(l.extra) : '');
      case 'penalti-perdido': return 'Pênalti perdido por <b>' + esc(l.quem) + '</b>';
      case 'intervalo': return 'Intervalo';
      case 'fim': return 'Fim de jogo';
      case 'inicio': return parseInt(l.min, 10) >= 45 ? 'Começa o 2º tempo' : 'Começa o jogo';
    }
    return '';
  }
  function lances(D) {
    var L = (D.lances || []).filter(function (l) { return !((l.tipo === 'inicio' || l.tipo === 'fim') && l.time); });
    if (!L.length) return '<p class="pt-vazio">' + (D.fim ? 'Sem lances registrados neste jogo.' : 'Os lances aparecem aqui assim que o jogo começar.') + '</p>';
    if (!D.fim) L.reverse(); /* ao vivo: o mais novo em cima */
    return '<ol class="pt-lances">' + L.map(function (l) {
      var lado = l.time && l.time === D.fora ? 'fora' : l.time ? 'casa' : 'centro', gol = /^gol/.test(l.tipo);
      return '<li class="pt-l pt-' + lado + (gol ? ' pt-gol' : '') + ' pt-t-' + l.tipo + '">' + (l.min ? '<span class="pt-min">' + esc(l.min) + '</span>' : '') +
        '<span class="pt-ic">' + (ICONE[l.tipo] || '') + '</span><span class="pt-txt">' + texto(l) + '</span></li>';
    }).join('') + '</ol>';
  }

  /* escalações: cada jogador vai para uma linha pela posição (defesa, volante, meio, meia, ataque), na ordem da
     formação ("4-2-3-1"); dentro da linha, do lado esquerdo para o direito do time */
  function fundo(p) {
    if (/^G/.test(p)) return 0;
    if (/^(CD|CB|RB|LB|SW|D\b|D-|RWB|LWB|WB)/.test(p)) return 1;
    if (/^(DM|CDM)/.test(p)) return 2;
    if (/^(AM|CAM)/.test(p)) return 4;
    if (/^(RF|LF|RW|LW)/.test(p)) return 4.5;
    if (/^(F|CF|ST|SS)/.test(p)) return 5;
    return 3;
  }
  /* de um lado ao outro: ponta/lateral esquerdo, centro-esquerda, centro, centro-direita, ponta/lateral direito */
  function ladoDe(p) { return /^L/.test(p) ? 0 : /-L$/.test(p) ? 1 : /^R/.test(p) ? 4 : /-R$/.test(p) ? 3 : 2; }
  function linhas(E, invertido) {
    var tit = E.titulares.slice().sort(function (a, b) { return fundo(a.pos) - fundo(b.pos) || a.lugar - b.lugar; });
    var gk = tit[0], resto = tit.slice(1), out = [[gk]];
    var forma = String(E.formacao || '').split('-').map(Number).filter(Boolean), soma = forma.reduce(function (s, n) { return s + n; }, 0);
    if (soma === resto.length) { var i = 0; forma.forEach(function (n) { out.push(resto.slice(i, i + n)); i += n; }); }
    else {
      var g = {}; resto.forEach(function (a) { var f = Math.round(fundo(a.pos)); (g[f] = g[f] || []).push(a); });
      Object.keys(g).sort().forEach(function (k) { out.push(g[k]); });
    }
    return out.map(function (ln) {
      ln = ln.slice().sort(function (a, b) { return ladoDe(a.pos) - ladoDe(b.pos); });
      return invertido ? ln.reverse() : ln;
    });
  }
  function metade(E, lado) {
    return '<div class="pt-meio pt-meio-' + lado + '">' + linhas(E, lado === 'fora').map(function (ln) {
      return '<div class="pt-linha">' + ln.map(function (a) {
        return '<span class="pt-jog' + (a.saiu ? ' pt-saiu' : '') + '"><i>' + esc(a.num) + '</i><small>' + esc(sobrenome(a.n)) + '</small></span>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  }
  function lista(E) {
    function pessoa(a) { return '<li><i>' + esc(a.num) + '</i><span>' + esc(a.n) + '</span>' + (a.saiu ? '<em class="pt-sai" title="Saiu">▼</em>' : '') + (a.entrou ? '<em class="pt-entra" title="Entrou">▲</em>' : '') + '<small>' + esc(a.pos) + '</small></li>'; }
    return '<div class="pt-lista"><h3>' + window.escudoTime(E.time) + esc(E.time) + (E.formacao ? ' <small>' + esc(E.formacao) + '</small>' : '') + '</h3>' +
      '<p class="pt-rot">Titulares</p><ul>' + E.titulares.map(pessoa).join('') + '</ul>' +
      (E.reservas.length ? '<p class="pt-rot">Reservas</p><ul>' + E.reservas.map(pessoa).join('') + '</ul>' : '') + '</div>';
  }
  function escalacoes(D) {
    var E = D.escalacoes;
    if (!E || !E.casa.titulares.length) return '<p class="pt-vazio">As escalações aparecem aqui cerca de uma hora antes do jogo, quando os times divulgam.</p>';
    return '<div class="pt-campo"><div class="pt-rotulos"><span>' + esc(E.casa.time) + (E.casa.formacao ? ' · ' + esc(E.casa.formacao) : '') + '</span><span>' + esc(E.fora.time) + (E.fora.formacao ? ' · ' + esc(E.fora.formacao) : '') + '</span></div>' +
      '<div class="pt-gramado">' + metade(E.casa, 'casa') + metade(E.fora, 'fora') + '</div></div>' +
      '<div class="pt-listas">' + lista(E.casa) + lista(E.fora) + '</div>';
  }

  function pintar() {
    var j = achado ? achado.j : {}, c = achado ? achado.c : {};
    var D = dados || { casa: j.casa, fora: j.fora, lances: [], escalacoes: null, fim: !!j.p };
    var casa = D.casa || j.casa || '', fora = D.fora || j.fora || '';
    var pl = String((j.vivo && j.vivo.p) || j.p || D.p || '').split(/\s*x\s*/), tem = pl[0] !== '';
    var status = j.vivo ? '<span class="pt-aovivo"><i></i>' + esc(j.vivo.min || 'Ao vivo') + '</span>' : j.p ? 'Encerrado' + (j.pen ? ' · pênaltis ' + esc(j.pen) : '') : (j.d ? quando(j.d) + (j.h ? ', ' + esc(j.h) : '') : '');
    document.title = casa + ' x ' + fora + ' | Arena Sports';
    caixa.innerHTML =
      '<a class="pt-voltar" href="' + (c.slug ? c.slug + '.html#jogos' : 'futebol.html') + '">‹ ' + esc(c.menu || 'Futebol') + (j.fase ? ' · ' + esc(j.fase) : '') + '</a>' +
      '<section class="pt-placar">' +
        '<a class="pt-time" href="' + window.linkTime(casa) + '">' + window.escudoTime(casa, 'pt-escudo') + '<b>' + esc(casa) + '</b></a>' +
        '<div class="pt-meio-placar"><div class="pt-gols">' + (tem ? esc(pl[0]) + '<i>–</i>' + esc(pl[1] || '') : '<i>x</i>') + '</div><div class="pt-status">' + status + '</div>' +
          (j.l ? '<small>' + esc(j.l) + '</small>' : '') + '</div>' +
        '<a class="pt-time" href="' + window.linkTime(fora) + '">' + window.escudoTime(fora, 'pt-escudo') + '<b>' + esc(fora) + '</b></a>' +
      '</section>' +
      '<div class="ft-abas pt-abas" role="tablist"><button type="button" role="tab" data-aba="lances" aria-selected="' + (aba === 'lances') + '">Lance a lance</button>' +
        '<button type="button" role="tab" data-aba="escalacoes" aria-selected="' + (aba === 'escalacoes') + '">Escalações</button></div>' +
      '<div class="pt-corpo">' + (aba === 'lances' ? lances(D) : escalacoes(D)) + '</div>' +
      '<p class="pt-fonte">Dados: ESPN. Atualizado sozinho' + (j.vivo ? ' durante o jogo' : '') + '.</p>';
    [].forEach.call(caixa.querySelectorAll('.pt-abas button'), function (b) {
      b.addEventListener('click', function () { aba = b.getAttribute('data-aba'); history.replaceState(null, '', '#' + aba); pintar(); });
    });
  }
  function buscar() {
    return fetch('assets/dados/partidas/' + id + '.json?t=' + Math.floor(Date.now() / 6e4)).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { dados = d; pintar(); }).catch(function () { pintar(); });
  }
  pintar();
  buscar();
  /* jogo rolando ou para começar: busca de novo a cada 2 minutos */
  setInterval(function () { if (!document.hidden && achado && !achado.j.p) buscar(); }, 120e3);
})();
