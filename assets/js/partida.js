/* Página do jogo (partida.html?id=<id da ESPN>).
   Futebol: placar, lance a lance (gols, cartões, substituições), escalações desenhadas no campo e estatísticas.
   NBA: placar por quarto, placar completo de cada jogador e estatísticas dos times.
   Pré-jogo (os dois esportes): chance de vitória, últimos jogos, confronto na temporada, posição na tabela, artilheiros
   ou cestinhas e, na NBA, os desfalques. Dados: forma-futebol.js e nba-extras.js (robôs) e chances.js.
   Os dados vêm do robô .github/partidas.js (assets/dados/partidas/<id>.json, a cada 10 minutos); com o jogo rolando,
   a página busca o arquivo de novo a cada 2 minutos. */
(function () {
  var caixa = document.getElementById('pg');
  if (!caixa || document.body.getAttribute('data-pagina') !== 'partida') return;
  var esc = window.esc, id = (location.search.match(/[?&]id=(\d+)/) || [])[1];
  var COMPS = window.COMPETICOES || [];
  var achado = null;
  COMPS.forEach(function (c) { (c.jogos || []).forEach(function (j) { if (id && j.id === id) achado = { c: c, j: j }; }); });
  /* a página do jogo sempre abre no topo (o navegador às vezes mantinha a rolagem da página anterior e abria no rodapé) */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  var jaNoTopo = false;
  if (!id) { caixa.innerHTML = '<p class="pt-vazio">Jogo não encontrado. <a href="futebol.html">Voltar para o futebol</a>.</p>'; return; }

  var basq = achado ? achado.c.esporte === 'basquete' : false;
  /* jogo que ainda não começou abre no pré-jogo; o que já começou deixa o pré-jogo por último */
  var comecou = function () { return !!(achado && (achado.j.p || achado.j.vivo)); };
  var ABAS = function () {
    var A = basq ? [['box', 'Placar completo'], ['estatisticas', 'Estatísticas']] : [['campo', achado && achado.j.vivo ? 'Ao vivo' : 'Campo'], ['lances', 'Lance a lance'], ['escalacoes', 'Escalações'], ['estatisticas', 'Estatísticas']];
    return comecou() ? A.concat([['prejogo', 'Pré-jogo']]) : [['prejogo', 'Pré-jogo']].concat(A);
  };
  var aba = (location.hash || '').slice(1), dados = null;
  function abaValida() { if (!ABAS().some(function (a) { return a[0] === aba; })) aba = ABAS()[0][0]; }
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

  /* estatísticas lado a lado, com a barra de quem foi melhor */
  function valor(v) { var m = String(v).match(/-?[\d.]+/); return m ? parseFloat(m[0]) : 0; }
  var MENOS_E_MELHOR = /Faltas|Impedimentos|Cartões|Erros/;
  function estatisticas(D) {
    var E = D.estatisticas;
    if (!E || !E.length) return '<p class="pt-vazio">' + (D.fim || D.p ? 'A ESPN não publicou as estatísticas deste jogo.' : 'As estatísticas aparecem aqui quando o jogo começar.') + '</p>';
    return '<div class="pt-est"><div class="pt-est-cab"><span>' + window.escudoTime(D.casa) + esc(D.casa) + '</span><span>' + esc(D.fora) + window.escudoTime(D.fora) + '</span></div>' + E.map(function (e) {
      var a = valor(e[1]), b = valor(e[2]), t = a + b, pa = t ? a / t * 100 : 50;
      var ganha = a === b ? '' : (a > b) !== MENOS_E_MELHOR.test(e[0]) ? 'casa' : 'fora';
      return '<div class="pt-est-l' + (ganha ? ' pt-ganha-' + ganha : '') + '"><b>' + esc(e[1]) + '</b><span>' + esc(e[0]) + '</span><b>' + esc(e[2]) + '</b>' +
        '<i class="pt-est-barra" aria-hidden="true"><em style="width:' + pa.toFixed(1) + '%"></em><em style="width:' + (100 - pa).toFixed(1) + '%"></em></i></div>';
    }).join('') + '</div>';
  }

  /* NBA: placar por quarto e placar completo */
  function quartos(D) {
    var Q = D.quartos; if (!Q || !Q.casa.length) return '';
    var n = Q.casa.length, rot = function (i) { return i < 4 ? i + 1 + 'º' : 'P' + (i - 3); };
    var pl = String(D.p || '').split(/\s*x\s*/);
    function linha(time, q, total) { return '<tr><th>' + window.escudoTime(time) + esc(time) + '</th>' + q.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '<td class="pt-q-total">' + esc(total || '') + '</td></tr>'; }
    return '<table class="pt-quartos"><thead><tr><th>Time</th>' + Array.apply(null, Array(n)).map(function (x, i) { return '<td>' + rot(i) + '</td>'; }).join('') + '<td>Total</td></tr></thead><tbody>' +
      linha(D.casa, Q.casa, pl[0]) + linha(D.fora, Q.fora, pl[1]) + '</tbody></table>';
  }
  /* colunas mostradas (na ordem) e o nome em português; as marcadas com 1 somem no celular */
  var COLS = [['MIN', 'Min', 'Minutos'], ['PTS', 'Pts', 'Pontos'], ['REB', 'Reb', 'Rebotes'], ['AST', 'Ast', 'Assistências'], ['STL', 'Rou', 'Roubos de bola', 1], ['BLK', 'Toc', 'Tocos', 1],
    ['FG', 'Arr', 'Arremessos (cestas-tentativas)'], ['3PT', '3P', 'Bolas de 3 (cestas-tentativas)', 1], ['FT', 'LL', 'Lances livres (cestas-tentativas)', 1], ['TO', 'Err', 'Erros (turnovers)', 1],
    ['PF', 'Flt', 'Faltas', 1], ['+/-', '+/-', 'Saldo de pontos com ele em quadra', 1]];
  function boxTime(B) {
    var ix = COLS.map(function (c) { return B.colunas.indexOf(c[0]); });
    function celulas(v) { return COLS.map(function (c, k) { return '<td' + (c[3] ? ' class="pt-cel-extra"' : '') + '>' + esc(ix[k] > -1 ? v[ix[k]] || '' : '') + '</td>'; }).join(''); }
    var jogou = B.atletas.filter(function (a) { return !a.fora; }), nao = B.atletas.filter(function (a) { return a.fora; });
    var tit = jogou.filter(function (a) { return a.titular; }), banco = jogou.filter(function (a) { return !a.titular; });
    function linhas(l) { return l.map(function (a) { return '<tr><th><b>' + esc(a.n) + '</b><small>' + esc(a.pos) + '</small></th>' + celulas(a.s) + '</tr>'; }).join(''); }
    return '<div class="pt-box"><h3>' + window.escudoTime(B.time) + esc(B.time) + '</h3><table class="pt-box-t"><thead><tr><th>Titulares</th>' +
      COLS.map(function (c) { return '<td' + (c[3] ? ' class="pt-cel-extra"' : '') + ' title="' + c[2] + '">' + c[1] + '</td>'; }).join('') + '</tr></thead><tbody>' + linhas(tit) +
      (banco.length ? '<tr class="pt-box-sep"><th colspan="' + (COLS.length + 1) + '">Banco</th></tr>' + linhas(banco) : '') +
      (B.totais && B.totais.length ? '<tr class="pt-box-tot"><th>Total</th>' + celulas(B.totais) + '</tr>' : '') + '</tbody></table>' +
      (nao.length ? '<p class="pt-box-nao">Não jogaram: ' + nao.map(function (a) { return esc(a.n); }).join(', ') + '</p>' : '') + '</div>';
  }
  function box(D) {
    if (!D.box) return '<p class="pt-vazio">' + (D.fim || D.p ? 'A ESPN ainda não publicou o placar completo deste jogo.' : 'O placar completo aparece aqui quando o jogo começar.') + '</p>';
    D.box.casa.time = D.casa; D.box.fora.time = D.fora;
    return boxTime(D.box.casa) + boxTime(D.box.fora) +
      '<p class="pt-legenda">' + COLS.map(function (c) { return '<b>' + c[1] + '</b> ' + c[2].toLowerCase(); }).join(' · ') + '</p>';
  }

  /* ---------- pré-jogo ---------- */
  function pct(v) { return Math.round(v * 100) + '%'; }
  function barraChance(ch, casa, fora) {
    if (!ch) return '';
    var rot = basq ? [casa, fora] : [casa, 'Empate', fora], val = basq ? [ch[0], ch[2]] : ch;
    return '<section class="pj-bloco pj-chance"><h3>Chance de vitória</h3><div class="pj-barra">' + val.map(function (v, i) {
      return '<span class="pj-b' + (basq ? (i ? 2 : 0) : i) + '" style="flex:' + Math.max(v, .04).toFixed(3) + '"><b>' + pct(v) + '</b></span>';
    }).join('') + '</div><div class="pj-rotulos">' + rot.map(function (r) { return '<small>' + esc(r) + '</small>'; }).join('') + '</div>' +
      '<p class="pj-nota">Estimativa do site pela campanha dos dois times' + (basq ? ' (vitórias e derrotas, com a vantagem de jogar em casa).' : ' (pontos e saldo de gols, com a vantagem de jogar em casa).') + '</p></section>';
  }
  function letra(a, b) { return a > b ? 'V' : a < b ? 'D' : 'E'; }
  function formaTime(nome, L, comps) {
    if (!L || !L.length) return '<div class="pj-forma"><h4>' + window.escudoTime(nome) + esc(nome) + '</h4><p class="pj-nota">Sem jogos recentes registrados.</p></div>';
    var nomeComp = function (s) { var c = COMPS.filter(function (x) { return x.slug === s; })[0]; return c ? c.menu : s; };
    return '<div class="pj-forma"><h4>' + window.escudoTime(nome) + esc(nome) + '</h4><div class="pj-letras">' + L.slice(0, 5).map(function (g) {
      var r = letra(g[2], g[3]); return '<i class="pj-' + r + '" title="' + esc(g[1] + ' ' + g[2] + '–' + g[3]) + '">' + r + '</i>';
    }).join('') + '</div><ul>' + L.slice(0, 5).map(function (g) {
      return '<li><span>' + window.dataCurta(g[0]) + '</span><span>' + (g[5] ? 'x ' : '@ ') + esc(g[1]) + '</span><b class="pj-' + letra(g[2], g[3]) + '-t">' + g[2] + '–' + g[3] + '</b>' + (comps && g[4] ? '<small>' + esc(nomeComp(g[4])) + '</small>' : '') + '</li>';
    }).join('') + '</ul></div>';
  }
  /* jogos de um time pelo placar automático (NBA e quem não está na forma do robô): [data, adversário, feitos, sofridos, campeonato, em casa] */
  function jogosDoPlacar(nome) {
    var L = [];
    COMPS.forEach(function (c) { (c.jogos || []).forEach(function (j) {
      if (!j.p || (j.casa !== nome && j.fora !== nome)) return;
      var pl = j.p.split(/\s*x\s*/).map(Number), emCasa = j.casa === nome;
      L.push([j.d, emCasa ? j.fora : j.casa, emCasa ? pl[0] : pl[1], emCasa ? pl[1] : pl[0], c.slug, emCasa ? 1 : 0]);
    }); });
    return L.sort(function (a, b) { return a[0] < b[0] ? 1 : -1; });
  }
  function naTabela(nome) {
    var out = [];
    COMPS.forEach(function (c) { [c.tabela, c.tabela2].forEach(function (t) {
      if (!t || !t.linhas || /passada|final da temporada/i.test(t.titulo || '')) return;
      var iT = t.colunas.indexOf('Time'), iP = t.colunas.indexOf('Pts'), iV = t.colunas.indexOf('V-D');
      t.linhas.forEach(function (l, k) { if (l[iT] === nome) out.push([c.menu + (c.tabela2 ? ' · ' + t.titulo.replace('Conferência ', '') : ''), l[0] || String(k + 1), iP > -1 ? l[iP] + ' pts' : iV > -1 ? l[iV] : '']); });
    }); });
    return out;
  }
  function prejogo(D) {
    var j = achado ? achado.j : {}, c = achado ? achado.c : null, casa = D.casa || j.casa, fora = D.fora || j.fora;
    var FF = window.FORMA_FUTEBOL || {}, NB = window.NBA_EXTRAS || {};
    var Lc = !basq && (FF.times || {})[casa] || jogosDoPlacar(casa), Lf = !basq && (FF.times || {})[fora] || jogosDoPlacar(fora);
    /* chance */
    var ch = null;
    if (basq) {
      var rec = function (n) { var t = naTabela(n)[0]; if (!t) return null; var m = String(t[2]).match(/(\d+)-(\d+)/); return m && (+m[1] + +m[2]) ? +m[1] / (+m[1] + +m[2]) : null; };
      var a = rec(casa), b = rec(fora);
      if (a != null && b != null) { a = Math.min(.95, Math.max(.05, a)); b = Math.min(.95, Math.max(.05, b)); var p = (a - a * b) / (a + b - 2 * a * b); p = Math.min(.97, p + .04); ch = [p, 0, 1 - p]; }
    } else if (window.chancesPartida) ch = window.chancesPartida(c, casa, fora);
    /* confronto na temporada */
    var h2h = (Lc || []).filter(function (g) { return g[1] === fora; });
    var tabC = naTabela(casa), tabF = naTabela(fora);
    var tab = (tabC.length || tabF.length) ? '<section class="pj-bloco"><h3>Na tabela</h3><div class="pj-duas">' + [[casa, tabC], [fora, tabF]].map(function (x) {
      return '<div><h4>' + window.escudoTime(x[0]) + esc(x[0]) + '</h4>' + (x[1].length ? '<ul class="pj-tab">' + x[1].map(function (t) { return '<li><span>' + esc(t[0]) + '</span><b>' + esc(t[1]) + 'º</b><small>' + esc(t[2]) + '</small></li>'; }).join('') + '</ul>' : '<p class="pj-nota">Fora das tabelas de pontos corridos.</p>') + '</div>';
    }).join('') + '</div></section>' : '';
    var destaque = '';
    if (basq) {
      var cs = NB.cestinhas || {};
      if (cs[casa] || cs[fora]) destaque = '<section class="pj-bloco"><h3>Cestinhas' + (NB.temporadaCestinhas ? ' <small>' + esc(NB.temporadaCestinhas) + '</small>' : '') + '</h3><div class="pj-duas">' + [casa, fora].map(function (t) {
        var x = cs[t]; return '<div><h4>' + window.escudoTime(t) + esc(t) + '</h4>' + (x ? '<p class="pj-craque"><b>' + esc(x[0]) + '</b><span>' + String(x[1]).replace('.', ',') + ' pts · ' + String(x[2]).replace('.', ',') + ' reb · ' + String(x[3]).replace('.', ',') + ' ast por jogo</span></p>' : '<p class="pj-nota">Sem números ainda.</p>') + '</div>';
      }).join('') + '</div></section>';
      var les = NB.lesoes || [], lt = function (t) { return (les.filter(function (x) { return x.time === t; })[0] || {}).jogadores || []; };
      var LC = lt(casa), LF = lt(fora);
      destaque += '<section class="pj-bloco"><h3>Desfalques</h3><div class="pj-duas">' + [[casa, LC], [fora, LF]].map(function (x) {
        return '<div><h4>' + window.escudoTime(x[0]) + esc(x[0]) + '</h4>' + (x[1].length ? '<ul class="pj-des">' + x[1].map(function (p) { return '<li><b>' + esc(p[0]) + '</b><span>' + esc(p[2]) + '</span><small>' + esc(p[3]) + '</small></li>'; }).join('') + '</ul>' : '<p class="pj-nota">Ninguém no relatório de lesões.</p>') + '</div>';
      }).join('') + '</div></section>';
    } else {
      var art = FF.artilheiros || {};
      if (art[casa] || art[fora]) destaque = '<section class="pj-bloco"><h3>Artilheiros na temporada</h3><div class="pj-duas">' + [casa, fora].map(function (t) {
        var x = art[t] || []; return '<div><h4>' + window.escudoTime(t) + esc(t) + '</h4>' + (x.length ? '<ol class="pj-art">' + x.map(function (p) { return '<li><b>' + esc(p[0]) + '</b><span>' + p[1] + (p[1] === 1 ? ' gol' : ' gols') + (p[2] ? ' · ' + p[2] + (p[2] === 1 ? ' assist.' : ' assists.') : '') + '</span></li>'; }).join('') + '</ol>' : '<p class="pj-nota">Sem gols registrados.</p>') + '</div>';
      }).join('') + '</div></section>';
    }
    return barraChance(ch, casa, fora) +
      '<section class="pj-bloco"><h3>Últimos jogos</h3><div class="pj-duas">' + formaTime(casa, Lc, true) + formaTime(fora, Lf, true) + '</div></section>' +
      (h2h.length ? '<section class="pj-bloco"><h3>Confronto na temporada</h3><ul class="pj-h2h">' + h2h.map(function (g) {
        var pc = g[5] ? [casa, g[2], g[3], fora] : [fora, g[3], g[2], casa];
        return '<li><span>' + window.dataCurta(g[0]) + '</span><b>' + esc(pc[0]) + ' ' + pc[1] + ' x ' + pc[2] + ' ' + esc(pc[3]) + '</b></li>';
      }).join('') + '</ul></section>' : '') + tab + destaque;
  }

  function pintar() {
    var j = achado ? achado.j : {}, c = achado ? achado.c : {};
    var D = dados || { casa: j.casa, fora: j.fora, lances: [], escalacoes: null, fim: !!j.p };
    if (dados && !jaNoTopo && !location.hash) { jaNoTopo = true; setTimeout(function () { window.scrollTo(0, 0); }, 0); }
    if (D.esporte === 'basquete') basq = true;
    abaValida();
    document.body.setAttribute('data-esporte', basq ? 'basquete' : 'futebol'); document.getElementById('pg-main').setAttribute('data-esporte', basq ? 'basquete' : 'futebol');
    var casa = D.casa || j.casa || '', fora = D.fora || j.fora || '';
    var pl = String((j.vivo && j.vivo.p) || j.p || D.p || '').split(/\s*x\s*/), tem = pl[0] !== '';
    if (!D.p && (j.p || (j.vivo && j.vivo.p))) D.p = j.p || j.vivo.p;
    var status = j.vivo ? '<span class="pt-aovivo"><i></i>' + esc(j.vivo.min || 'Ao vivo') + '</span>' : j.p ? 'Encerrado' + (j.pen ? ' · pênaltis ' + esc(j.pen) : '') : (j.d ? quando(j.d) + (j.h ? ', ' + esc(j.h) : '') : '');
    document.title = casa + ' x ' + fora + ' | Arena Sports';
    caixa.innerHTML =
      '<a class="pt-voltar" href="' + (c.slug ? c.slug + '.html#jogos' : basq ? 'basquete.html' : 'futebol.html') + '">‹ ' + esc(c.menu || (basq ? 'Basquete' : 'Futebol')) + (j.fase ? ' · ' + esc(j.fase) : '') + '</a>' +
      '<section class="pt-placar">' +
        '<a class="pt-time" href="' + window.linkTime(casa) + '">' + window.escudoTime(casa, 'pt-escudo') + '<b>' + esc(casa) + '</b></a>' +
        '<div class="pt-meio-placar"><div class="pt-gols">' + (tem ? esc(pl[0]) + '<i>–</i>' + esc(pl[1] || '') : '<i>x</i>') + '</div><div class="pt-status">' + status + '</div>' +
          (j.l ? '<small>' + esc(j.l) + '</small>' : '') + '</div>' +
        '<a class="pt-time" href="' + window.linkTime(fora) + '">' + window.escudoTime(fora, 'pt-escudo') + '<b>' + esc(fora) + '</b></a>' +
      '</section>' + (basq ? quartos(D) : '') +
      '<div class="ft-abas pt-abas" role="tablist">' + ABAS().map(function (a) { return '<button type="button" role="tab" data-aba="' + a[0] + '" aria-selected="' + (aba === a[0]) + '">' + a[1] + '</button>'; }).join('') + '</div>' +
      '<div class="pt-corpo">' + (aba === 'prejogo' ? prejogo(D) : aba === 'campo' && window.PARTIDA_CAMPO ? window.PARTIDA_CAMPO.html(D, j) : aba === 'lances' ? lances(D) : aba === 'escalacoes' ? escalacoes(D) : aba === 'box' ? box(D) : estatisticas(D)) + '</div>' +
      '<p class="pt-fonte">Dados: ESPN. Atualizado sozinho' + (j.vivo ? ' durante o jogo' : '') + '.</p>';
    if (aba === 'campo' && window.PARTIDA_CAMPO) window.PARTIDA_CAMPO.iniciar(caixa, D, j, linhas);
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
  /* placar e minuto do jogo rolando (esportes-mais.js busca na ESPN a cada minuto) */
  if (window.aoMudarPlacar) window.aoMudarPlacar(function () { if (achado && achado.j.vivo) pintar(); });
})();
