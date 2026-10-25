/* Busca (busca.html?q=...): um campo só para achar tudo do site enquanto digita.
   - Times (futebol e basquete): próximo jogo, último resultado e posição nas tabelas;
   - Jogadores: o mais parecido com o que foi digitado vira um cartão completo (time, números da temporada, o que fez
     no último jogo, próximo jogo do time e notícias que falam dele); os outros, uma linha com os números.
     Números: temporada-futebol.js e temporada-nba.js (carregados depois que a página abre); último jogo: o arquivo
     do jogo (assets/dados/partidas/<id>.json) e, para os brasileiros da NBA, nba-extras.js;
   - Pilotos da F1: o procurado vira um cartão completo (campeonato, vitórias, a última corrida pelo Raio-x,
     próxima corrida e notícias);
   - Campeonatos e notícias.
   A lupa do topo do site (site.js) traz para cá. */
(function () {
  var caixa = document.getElementById('bu');
  if (!caixa) return;
  var esc = window.esc, COMPS = window.COMPETICOES || [], hoje = window.hojeISO();
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
  var SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  function dia(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : SEMANA[new Date(d + 'T12:00:00').getDay()] + ', ' + window.dataCurta(d); }
  var APELIDOS = { 'Paris Saint-Germain': 'psg', 'Bayern de Munique': 'bayern', 'Inter de Milão': 'inter', 'Manchester United': 'man united', 'Manchester City': 'man city', 'Atlético de Madrid': 'atleti', 'Red Bull Bragantino': 'bragantino', 'Olympique de Marselha': 'marseille', 'Los Angeles Lakers': 'lakers', 'Golden State Warriors': 'warriors gsw' };

  /* ---------- o que dá para achar ---------- */
  function compDe(slug) { return COMPS.filter(function (c) { return c.slug === slug; })[0]; }
  var TIMES = (window.todosTimes ? window.todosTimes() : []).map(function (t) { return { tipo: 'time', nome: t.nome, t: t, busca: norm(t.nome + ' ' + (APELIDOS[t.nome] || '') + (t.esporte === 'basquete' ? ' ' + t.nome.split(' ').pop() : '')) }; });
  var CAMPS = COMPS.map(function (c) { return { tipo: 'camp', nome: c.nome, c: c, busca: norm(c.nome + ' ' + c.menu + ' ' + c.slug) }; });
  var F1 = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'formula-1'; })[0];
  if (F1) CAMPS.push({ tipo: 'camp', nome: 'Fórmula 1', c: { slug: 'automobilismo', nome: 'Fórmula 1', menu: 'Fórmula 1', esporte: 'automobilismo' }, busca: 'formula 1 f1 formula um' });
  var PILOTOS = [];
  if (F1 && F1.classificacao) {
    var T = F1.classificacao, ip = T.colunas.indexOf('Piloto'), ie = T.colunas.indexOf('Equipe'), ipt = T.colunas.indexOf('Pts');
    PILOTOS = T.linhas.map(function (l) { return { tipo: 'piloto', nome: l[ip], equipe: l[ie], pts: l[ipt], pos: l[0], busca: norm(l[ip] + ' ' + l[ie]) }; });
  }
  var NOTS = (window.NOTICIAS_ESPORTES || []).map(function (n) { return { tipo: 'not', n: n, esp: n.esporte, busca: norm(n.t + ' ' + (n.x || '')) }; })
    .concat((window.NOTICIAS_GERAIS || []).map(function (n) { return { tipo: 'not', n: n, esp: 'automobilismo', busca: norm(n.t + ' ' + (n.x || '')) }; }));
  var JOG = null; /* jogadores: montados quando os números da temporada chegam */
  function montarJogadores() {
    var TF = window.TEMPORADA_FUTEBOL, TN = window.TEMPORADA_NBA;
    if (!TF && !TN) return;
    var por = {};
    ((TF && TF.jogadores) || []).forEach(function (l) {
      var x = por[l[0]] = por[l[0]] || { tipo: 'jog', esp: 'futebol', id: l[0], nome: l[1], time: l[2], pos: l[3], j: 0, g: 0, a: 0 };
      x.j += l[5]; x.g += l[7]; x.a += l[8];
    });
    JOG = Object.keys(por).map(function (k) { var x = por[k]; x.busca = norm(x.nome); return x; });
    var ts = Object.keys((TN && TN.temporadas) || {}).sort().reverse();
    var t = ts.filter(function (k) { return TN.temporadas[k].some(function (l) { return l[4] >= 5; }); })[0] || ts[0];
    /* números da temporada com jogos suficientes; o time é sempre o da temporada mais nova (quem trocou de time já aparece no novo) */
    var novo = {}; ((ts[0] && TN.temporadas[ts[0]]) || []).forEach(function (l) { novo[l[0]] = l; });
    var vistos = {};
    ((t && TN.temporadas[t]) || []).concat((ts[0] && ts[0] !== t && TN.temporadas[ts[0]]) || []).forEach(function (l) {
      if (vistos[l[0]]) return; vistos[l[0]] = 1;
      var n = novo[l[0]], usaNovo = n && n[4] >= 3;
      var v = usaNovo ? n : l;
      JOG.push({ tipo: 'jog', esp: 'basquete', id: l[0], nome: l[1], time: n ? n[2] : l[2], pos: l[3], temp: usaNovo ? ts[0] : (t && TN.temporadas[t].indexOf(l) > -1 ? t : ts[0]), v: v, busca: norm(l[1]) });
    });
  }

  /* nota de quanto o texto bate: nome igual > começa igual > uma palavra começa igual > contém */
  function nota(x, q, termos) {
    var b = x.busca;
    if (!termos.every(function (t) { return b.indexOf(t) > -1; })) return 0;
    var nn = norm(x.nome || '');
    if (nn === q) return 100;
    if (nn.indexOf(q) === 0) return 80;
    if ((' ' + nn).indexOf(' ' + termos[0]) > -1) return 60;
    return 30;
  }
  function achar(lista, q, termos, max, peso) {
    return lista.map(function (x) { return { x: x, n: nota(x, q, termos) }; }).filter(function (r) { return r.n > 0; })
      .map(function (r) { if (peso) r.n += peso(r.x); return r; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, max).map(function (r) { return r.x; });
  }

  /* ---------- cartões ---------- */
  function jogosDoTime(nome, esporte) {
    var L = [];
    COMPS.forEach(function (c) { if (c.esporte !== esporte) return; (c.jogos || []).forEach(function (j) { if (j.casa === nome || j.fora === nome) L.push({ c: c, j: j }); }); });
    return L.sort(function (a, b) { return (a.j.d + (a.j.h || '')) < (b.j.d + (b.j.h || '')) ? -1 : 1; });
  }
  function cartaoTime(x) {
    var t = x.t, L = jogosDoTime(t.nome, t.esporte);
    var prox = L.filter(function (g) { return !g.j.p && g.j.d && g.j.d >= hoje; })[0], ult = L.filter(function (g) { return g.j.p; }).pop();
    var vivo = L.filter(function (g) { return g.j.vivo; })[0];
    function adv(g) { return g.j.casa === t.nome ? g.j.fora : g.j.casa; }
    var linhas = [];
    if (vivo) linhas.push('<li class="bu-vivo"><span>Ao vivo</span><b>' + esc(vivo.j.casa) + ' ' + esc(vivo.j.vivo.p) + ' ' + esc(vivo.j.fora) + '</b><small>' + esc(vivo.j.vivo.min || '') + '</small></li>');
    if (prox) linhas.push('<li><span>Próximo jogo</span><b>' + dia(prox.j.d) + (prox.j.h ? ', ' + esc(prox.j.h) : '') + ' · ' + (prox.j.casa === t.nome ? 'x ' : '@ ') + esc(adv(prox)) + '</b><small>' + esc(prox.c.menu) + (prox.j.fase ? ' · ' + esc(prox.j.fase) : '') + '</small></li>');
    if (ult) {
      var pl = ult.j.p.split(/\s*x\s*/).map(Number), meu = ult.j.casa === t.nome ? pl[0] : pl[1], deles = ult.j.casa === t.nome ? pl[1] : pl[0], r = meu > deles ? 'V' : meu < deles ? 'D' : 'E';
      linhas.push('<li><span>Último resultado</span><b><i class="pj-' + r + ' bu-r">' + r + '</i>' + meu + '–' + deles + ' ' + (ult.j.casa === t.nome ? 'x ' : '@ ') + esc(adv(ult)) + '</b><small>' + dia(ult.j.d) + ' · ' + esc(ult.c.menu) + '</small></li>');
    }
    t.comps.forEach(function (s) {
      var c = compDe(s); if (!c) return;
      [c.tabela, c.tabela2].forEach(function (tb) {
        if (!tb || !tb.linhas || /passada|final da temporada/i.test(tb.titulo || '')) return;
        var iT = tb.colunas.indexOf('Time'), iP = tb.colunas.indexOf('Pts'), iV = tb.colunas.indexOf('V-D');
        tb.linhas.forEach(function (l, k) { if (l[iT] === t.nome) linhas.push('<li><span>' + esc(c.menu) + '</span><b>' + esc(l[0] || k + 1) + 'º lugar</b><small>' + (iP > -1 ? esc(l[iP]) + ' pontos' : iV > -1 ? esc(l[iV]) : '') + '</small></li>'); });
      });
    });
    var links = '<a href="' + window.linkTime(t.nome) + '">Página do time</a>' + (prox && window.linkPartida && window.linkPartida(prox.j, t.esporte) ? '<a href="' + window.linkPartida(prox.j, t.esporte) + '">Pré-jogo</a>' : '');
    return '<article class="bu-card bu-time"><header>' + window.escudoTime(t.nome, 'bu-escudo') + '<div><b>' + esc(t.nome) + '</b><small>' + (t.esporte === 'basquete' ? 'Basquete' : 'Futebol') + ' · ' +
      t.comps.map(function (s) { var c = compDe(s); return c ? esc(c.menu) : ''; }).filter(Boolean).join(', ') + '</small></div></header>' +
      (linhas.length ? '<ul class="bu-info">' + linhas.join('') + '</ul>' : '') + '<nav class="bu-links">' + links + '</nav></article>';
  }
  /* ---------- jogador em destaque ---------- */
  var POS = { GOL: 'Goleiro', ZAG: 'Zagueiro', LE: 'Lateral', LD: 'Lateral', MEI: 'Meio-campo', ATA: 'Atacante', G: 'Armador', F: 'Ala', C: 'Pivô', PG: 'Armador', SG: 'Ala-armador', SF: 'Ala', PF: 'Ala-pivô' };
  /* notícias do esporte dele que citam o nome inteiro; ou o sobrenome junto com o nome do time (George sozinho
     pegaria o George Russell da F1) */
  function noticiasDe(nome, esp, time) {
    var n = norm(nome), p = n.split(' '), sob = p.length > 1 && p[p.length - 1].length >= 4 ? p[p.length - 1] : '';
    var tm = norm(time).split(' ').filter(function (w) { return w.length >= 4; }).pop() || '';
    var doEsporte = NOTS.filter(function (x) { return x.esp === esp; });
    var achou = doEsporte.filter(function (x) { return x.busca.indexOf(n) > -1; });
    if (achou.length < 3 && sob && tm) achou = achou.concat(doEsporte.filter(function (x) { return achou.indexOf(x) < 0 && (' ' + x.busca + ' ').indexOf(' ' + sob + ' ') > -1 && x.busca.indexOf(tm) > -1; }));
    return achou.sort(function (a, b) { return a.n.d < b.n.d ? 1 : -1; }).slice(0, 4);
  }
  function cartaoJogadorDestaque(x) {
    var esp = x.esp, L = jogosDoTime(x.time, esp), prox = L.filter(function (g) { return !g.j.p && g.j.d && g.j.d >= hoje; })[0];
    var temporada = esp === 'futebol' ? '<b>' + x.g + (x.g === 1 ? ' gol' : ' gols') + ' · ' + x.a + (x.a === 1 ? ' assistência' : ' assistências') + '</b><small>' + x.j + (x.j === 1 ? ' jogo' : ' jogos') + ' na temporada, somando os campeonatos</small>'
      : '<b>' + String(x.v[6]).replace('.', ',') + ' pts · ' + String(x.v[7]).replace('.', ',') + ' reb · ' + String(x.v[8]).replace('.', ',') + ' ast</b><small>por jogo · ' + x.v[4] + ' jogos · temporada ' + esc(x.temp) + '</small>';
    var adv = function (g) { return g.j.casa === x.time ? g.j.fora : g.j.casa; };
    var nots = noticiasDe(x.nome, esp, x.time);
    return '<article class="bu-card bu-time bu-jog" data-jog="' + esc(x.id) + '"><header>' + window.escudoTime(x.time, 'bu-escudo') + '<div><b>' + esc(x.nome) + '</b><small>' + esc(x.time) + ' · ' + (esp === 'futebol' ? 'Futebol' : 'NBA') + (POS[x.pos] ? ' · ' + POS[x.pos] : '') + '</small></div></header>' +
      '<ul class="bu-info"><li><span>Temporada</span>' + temporada + '</li>' +
      '<li class="bu-ultimo"><span>Último jogo</span><b>Procurando…</b></li>' +
      (prox ? '<li><span>Próximo jogo do ' + esc(x.time.split(' ').slice(-1)[0]) + '</span><b>' + dia(prox.j.d) + (prox.j.h ? ', ' + esc(prox.j.h) : '') + ' · ' + (prox.j.casa === x.time ? 'x ' : '@ ') + esc(adv(prox)) + '</b><small>' + esc(prox.c.menu) + '</small></li>' : '') + '</ul>' +
      (nots.length ? '<div class="bu-jnots"><span>Notícias sobre ele</span>' + nots.map(cartaoNot).join('') + '</div>' : '') +
      '<nav class="bu-links"><a href="comparar.html#' + esp + ':' + esc(x.id) + ',">Comparar com outro jogador</a><a href="' + window.linkTime(x.time) + '">Página do ' + esc(x.time) + '</a></nav></article>';
  }
  /* último jogo do jogador: o último jogo encerrado do time, no arquivo do jogo (escalação e lances ou placar completo) */
  function preencherUltimo(x) {
    var el = res.querySelector('.bu-jog[data-jog="' + x.id + '"] .bu-ultimo'); if (!el) return;
    var L = jogosDoTime(x.time, x.esp).filter(function (g) { return g.j.p && g.j.id; }), ult = L[L.length - 1];
    function escreve(b, sm) { el.innerHTML = '<span>Último jogo</span><b>' + b + '</b><small>' + sm + '</small>'; }
    /* brasileiro da NBA: o robô já guarda os últimos jogos dele */
    var br = ((window.NBA_EXTRAS || {}).brasileiros || []).filter(function (b) { return norm(b.nome) === norm(x.nome); })[0];
    if (br && br.ultimos && br.ultimos.length) {
      var u = br.ultimos[0];
      return escreve(u[4] + ' pts · ' + u[5] + ' reb · ' + u[6] + ' ast', dia(u[0]) + ' · contra ' + esc(u[1]) + ' (' + esc(u[2]) + ') · ' + esc(u[3]) + ' min' + (u[7] ? ', titular' : ', saiu do banco'));
    }
    if (!ult) return escreve('Sem jogo nos últimos 7 dias', 'O ' + esc(x.time) + ' não entrou em campo nesse período.'.replace('em campo', x.esp === 'basquete' ? 'em quadra' : 'em campo'));
    var g = ult.j, pl = g.p.split(/\s*x\s*/), meu = g.casa === x.time ? pl[0] : pl[1], deles = g.casa === x.time ? pl[1] : pl[0];
    var placar = dia(g.d) + ' · ' + (g.casa === x.time ? 'x ' : '@ ') + esc(g.casa === x.time ? g.fora : g.casa) + ' (' + meu + '–' + deles + ')';
    fetch('assets/dados/partidas/' + g.id + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (D) {
      var n = norm(x.nome);
      if (x.esp === 'basquete' && D.box) {
        var a = null, cols = [];
        [D.box.casa, D.box.fora].forEach(function (B) { B.atletas.forEach(function (y) { if (norm(y.n) === n) { a = y; cols = B.colunas; } }); });
        if (!a) return escreve('Não entrou em quadra', placar);
        if (a.fora || !a.s.length) return escreve('Não jogou' + (a.motivo ? ' (' + esc(a.motivo) + ')' : ''), placar);
        var v = function (k) { return a.s[cols.indexOf(k)] || '0'; };
        return escreve(v('PTS') + ' pts · ' + v('REB') + ' reb · ' + v('AST') + ' ast', placar + ' · ' + v('MIN') + ' min' + (a.titular ? ', titular' : ', saiu do banco'));
      }
      if (x.esp === 'futebol' && D.escalacoes) {
        var e = null;
        [D.escalacoes.casa, D.escalacoes.fora].forEach(function (E) { E.titulares.concat(E.reservas).forEach(function (y) { if (norm(y.n) === n) e = y; }); });
        var gols = (D.lances || []).filter(function (l) { return /^gol(?!-contra)/.test(l.tipo) && norm(l.quem) === n; }).length;
        var ass = (D.lances || []).filter(function (l) { return /^gol/.test(l.tipo) && norm(l.extra) === n; }).length;
        var cart = (D.lances || []).filter(function (l) { return /amarelo|vermelho/.test(l.tipo) && norm(l.quem) === n; }).map(function (l) { return l.tipo === 'vermelho' ? 'expulso' : 'amarelo'; });
        if (!e) return escreve('Não foi relacionado', placar);
        var fez = [];
        if (gols) fez.push(gols === 1 ? '1 gol' : gols + ' gols');
        if (ass) fez.push(ass === 1 ? '1 assistência' : ass + ' assistências');
        cart.forEach(function (c) { fez.push(c); });
        var como = e.titular ? (e.saiu ? 'Titular, saiu durante o jogo' : 'Titular, jogou o jogo todo') : e.entrou ? 'Entrou durante o jogo' : 'Ficou no banco';
        return escreve(fez.length ? fez.join(' · ') : como, placar + (fez.length ? ' · ' + como : ''));
      }
      escreve(meu + '–' + deles, placar);
    }).catch(function () { escreve((+meu > +deles ? 'Vitória' : +meu < +deles ? 'Derrota' : 'Empate') + ' do ' + esc(x.time), placar); });
  }

  function cartaoJogador(x) {
    var nums = x.esp === 'futebol' ? x.j + (x.j === 1 ? ' jogo' : ' jogos') + ' · ' + x.g + (x.g === 1 ? ' gol' : ' gols') + ' · ' + x.a + (x.a === 1 ? ' assistência' : ' assistências')
      : String(x.v[6]).replace('.', ',') + ' pts · ' + String(x.v[7]).replace('.', ',') + ' reb · ' + String(x.v[8]).replace('.', ',') + ' ast por jogo (' + esc(x.temp) + ')';
    return '<a class="bu-card bu-linha" href="comparar.html#' + x.esp + ':' + esc(x.id) + ',">' + window.escudoTime(x.time, 'bu-escudo-p') + '<div><b>' + esc(x.nome) + '</b><small>' + esc(x.time) + ' · ' + (x.esp === 'futebol' ? 'Futebol' : 'NBA') + '</small><span>' + nums + '</span></div><i>Comparar →</i></a>';
  }
  /* ---------- piloto em destaque ---------- */
  function seg(v) { if (!v) return ''; var m = Math.floor(v / 60), r = (v - m * 60).toFixed(3); return m + ':' + (r < 10 ? '0' : '') + r.replace('.', ','); }
  function cartaoPilotoDestaque(x) {
    var cal = (F1 && F1.calendario) || [], feitas = cal.filter(function (e) { return e.venc; });
    var vitorias = feitas.filter(function (e) { return e.venc.indexOf(x.nome) === 0; });
    var lider = PILOTOS[0], frente = PILOTOS[PILOTOS.indexOf(x) - 1];
    var gap = x === lider ? (PILOTOS[1] ? '+' + (x.pts - PILOTOS[1].pts) + ' pts sobre o 2º' : '') : (+lider.pts - +x.pts) + ' pts atrás do líder' + (frente && frente !== lider ? ' · ' + (+frente.pts - +x.pts) + ' do ' + frente.pos + 'º' : '');
    /* última corrida: resultado completo do Raio-x */
    var RX = window.RAIOX, ultima = '';
    if (RX && RX.pilotos) {
      var p = RX.pilotos.filter(function (y) { return norm(y.nome) === norm(x.nome); })[0];
      if (p) {
        var ganhou = p.grid && p.final ? p.grid - p.final : 0;
        ultima = '<li><span>Última corrida · ' + esc(RX.titulo) + '</span><b>' + (p.abandono ? 'Abandonou' : 'Chegou em ' + p.final + 'º') + '</b><small>Largou em ' + p.grid + 'º' +
          (!p.abandono && ganhou ? (ganhou > 0 ? ' · ganhou ' + ganhou : ' · perdeu ' + (-ganhou)) + (Math.abs(ganhou) === 1 ? ' posição' : ' posições') : '') +
          ' · ' + (p.paradas || []).length + ((p.paradas || []).length === 1 ? ' parada' : ' paradas') + (p.melhor ? ' · melhor volta ' + seg(p.melhor) : '') + '</small></li>';
      }
    }
    var prox = cal.filter(function (e) { return !e.venc && e.d && e.d >= hoje; })[0], corrida = prox && (prox.s || []).filter(function (s) { return /^Corrida/.test(s.t); })[0];
    var nots = NOTS.filter(function (y) { return y.esp === 'automobilismo' && y.busca.indexOf(norm(x.nome)) > -1; }).sort(function (a, b) { return a.n.d < b.n.d ? 1 : -1; }).slice(0, 4);
    if (nots.length < 2) {
      var sob = norm(x.nome).split(' ').pop();
      NOTS.forEach(function (y) { if (nots.length < 4 && y.esp === 'automobilismo' && nots.indexOf(y) < 0 && (' ' + y.busca + ' ').indexOf(' ' + sob + ' ') > -1) nots.push(y); });
    }
    x.nots = nots;
    return '<article class="bu-card bu-time bu-jog"><header><span class="bu-pos bu-pos-g">' + esc(x.pos) + 'º</span><div><b>' + esc(x.nome) + '</b><small>' + esc(x.equipe) + ' · Fórmula 1</small></div></header>' +
      '<ul class="bu-info"><li><span>Campeonato</span><b>' + esc(x.pos) + 'º lugar · ' + esc(x.pts) + ' pts</b><small>' + esc(gap) + '</small></li>' +
      '<li><span>Vitórias na temporada</span><b>' + vitorias.length + (vitorias.length === 1 ? ' vitória' : ' vitórias') + ' em ' + feitas.length + ' corridas</b><small>' + (vitorias.length ? vitorias.map(function (e) { return esc(e.n.replace(/^GP d[aoe]s? /, '')); }).join(', ') : 'Ainda sem vitória') + '</small></li>' +
      ultima +
      (prox ? '<li><span>Próxima corrida</span><b>' + esc(prox.n) + '</b><small>' + (corrida ? dia(corrida.d) + (corrida.h ? ', largada ' + esc(corrida.h) : '') : dia(prox.d)) + ' · ' + esc(prox.l) + '</small></li>' : '') + '</ul>' +
      (nots.length ? '<div class="bu-jnots"><span>Notícias sobre ele</span>' + nots.map(cartaoNot).join('') + '</div>' : '') +
      '<nav class="bu-links"><a href="comparar.html#f1:' + norm(x.nome).replace(/ /g, '-') + ',">Comparar com outro piloto</a><a href="raiox.html">Raio-x da última corrida</a><a href="formula-1.html">Classificação e calendário</a></nav></article>';
  }
  function cartaoPiloto(x) {
    return '<a class="bu-card bu-linha" href="comparar.html#f1:' + norm(x.nome).replace(/ /g, '-') + ',"><span class="bu-pos">' + esc(x.pos) + 'º</span><div><b>' + esc(x.nome) + '</b><small>' + esc(x.equipe) + ' · Fórmula 1</small><span>' + esc(x.pts) + ' pontos no campeonato</span></div><i>Comparar →</i></a>';
  }
  function cartaoCamp(x) {
    var c = x.c, href = c.slug === 'automobilismo' ? 'automobilismo.html' : c.slug + '.html';
    var lider = c.tabela && c.tabela.linhas && c.tabela.linhas[0] ? c.tabela.linhas[0][c.tabela.colunas.indexOf('Time')] : '';
    return '<a class="bu-card bu-linha" href="' + href + '"><span class="bu-pos bu-camp">' + esc((c.menu || c.nome).slice(0, 3)) + '</span><div><b>' + esc(c.nome) + '</b><small>' + (lider ? 'Na ponta: ' + esc(lider) : 'Jogos, tabela e notícias') + '</small></div><i>Abrir →</i></a>';
  }
  function cartaoNot(x) {
    var n = x.n, interno = n.link && !/^https?:/.test(n.link) ? n.link : x.esp === 'automobilismo' && window.linkNoticia ? window.linkNoticia(n.t) : '';
    var corpo = '<small>' + dia(n.d) + ' · ' + (x.esp === 'automobilismo' ? 'Fórmula 1' : x.esp === 'basquete' ? 'Basquete' : 'Futebol') + (n.fonte ? ' · Fonte: ' + esc(n.fonte) : '') + '</small><b>' + esc(n.t) + '</b>';
    return interno ? '<a class="bu-card bu-not" href="' + esc(interno) + '">' + corpo + '</a>' : '<div class="bu-card bu-not">' + corpo + '</div>';
  }

  /* ---------- tela ---------- */
  var SUGESTOES = ['Flamengo', 'Palmeiras', 'Corinthians', 'Real Madrid', 'Lakers', 'Vinícius Júnior', 'Brasileirão', 'Verstappen'];
  function resultados(q) {
    var nq = norm(q), termos = nq.split(' ').filter(Boolean);
    if (nq.length < 2) return '<div class="bu-sug"><p>Experimente:</p>' + SUGESTOES.map(function (s) { return '<button type="button" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>';
    var times = achar(TIMES, nq, termos, 4), camps = achar(CAMPS, nq, termos, 3), pil = achar(PILOTOS, nq, termos, 4);
    var jog = JOG ? achar(JOG, nq, termos, 6, function (x) { return x.esp === 'futebol' ? Math.min(20, x.j) / 2 : Math.min(20, x.v[4]) / 2; }) : null;
    var nots = NOTS.filter(function (x) { return termos.every(function (t) { return x.busca.indexOf(t) > -1; }); }).sort(function (a, b) { return a.n.d < b.n.d ? 1 : -1; }).slice(0, 6);
    var h = '';
    if (times.length) h += '<section class="bu-sec"><h2>Times</h2><div class="bu-times">' + times.map(cartaoTime).join('') + '</div></section>';
    /* o piloto que bate pelo nome vira o cartão completo */
    var pDest = pil.length && nota(pil[0], nq, termos) >= 60 ? pil[0] : null;
    if (pil.length) h += '<section class="bu-sec"><h2>' + (pDest ? 'Piloto' : 'Pilotos') + '</h2>' + (pDest ? cartaoPilotoDestaque(pDest) : '') + pil.slice(pDest ? 1 : 0).map(cartaoPiloto).join('') + '</section>';
    /* o jogador que bate pelo nome vira o cartão completo; os outros ficam numa linha */
    var dest = jog && jog.length && nota(jog[0], nq, termos) >= 60 ? jog[0] : null;
    destaque = dest;
    var hJog = '';
    if (jog && jog.length) hJog = '<section class="bu-sec"><h2>' + (dest ? 'Jogador' : 'Jogadores') + '</h2>' + (dest ? cartaoJogadorDestaque(dest) : '') +
      (jog.length > (dest ? 1 : 0) ? (dest ? '<h3 class="bu-outros">Outros com esse nome</h3>' : '') + jog.slice(dest ? 1 : 0).map(cartaoJogador).join('') : '') + '</section>';
    /* digitou o nome do jogador (ex.: "Gui Santos"): ele vem antes dos times que só batem num pedaço ("Santos") */
    var timeExato = times.length && norm(times[0].nome) === nq;
    if (pDest && !dest) hJog = ''; /* procurou um piloto: jogador com pedaço do nome parecido não aparece */
    if (dest && nota(dest, nq, termos) >= 80 && !timeExato && !pDest) h = hJog + h; else h += hJog;
    if (!jog) h += '<p class="bu-carrega">Procurando jogadores…</p>';
    if (camps.length) h += '<section class="bu-sec"><h2>Campeonatos</h2>' + camps.map(cartaoCamp).join('') + '</section>';
    if (pDest && pDest.nots) nots = nots.filter(function (x) { return pDest.nots.indexOf(x) < 0; });
    /* as notícias que já estão no cartão do jogador não se repetem embaixo */
    if (dest) { var noCartao = noticiasDe(dest.nome, dest.esp, dest.time); nots = nots.filter(function (x) { return noCartao.indexOf(x) < 0; }); }
    if (nots.length) h += '<section class="bu-sec"><h2>' + (dest || pDest ? 'Outras notícias' : 'Notícias') + '</h2>' + nots.map(cartaoNot).join('') + '</section>';
    return h || '<p class="pt-vazio">Nada encontrado para “' + esc(q) + '”. Tente só o nome do time, do jogador ou do campeonato.</p>';
  }
  var q0 = decodeURIComponent((location.search.match(/[?&]q=([^&]*)/) || [])[1] || '').replace(/\+/g, ' ');
  caixa.innerHTML = '<form class="bu-form" role="search" action="busca.html"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
    '<input id="bu-q" name="q" type="search" autocomplete="off" placeholder="Time, jogador, piloto ou campeonato" aria-label="Buscar no site" value="' + esc(q0) + '"></form><div id="bu-res" aria-live="polite"></div>';
  var inp = document.getElementById('bu-q'), res = document.getElementById('bu-res'), espera = null;
  var destaque = null;
  function pintar() {
    destaque = null;
    res.innerHTML = resultados(inp.value);
    if (destaque) preencherUltimo(destaque);
    [].forEach.call(res.querySelectorAll('.bu-sug button'), function (b) { b.addEventListener('click', function () { inp.value = b.getAttribute('data-q'); atualizar(); }); });
  }
  function atualizar() {
    history.replaceState(null, '', inp.value.trim() ? 'busca.html?q=' + encodeURIComponent(inp.value.trim()) : 'busca.html');
    pintar();
  }
  inp.addEventListener('input', function () { clearTimeout(espera); espera = setTimeout(atualizar, 120); });
  caixa.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); atualizar(); inp.blur(); });
  pintar();
  inp.focus();
  /* os números dos jogadores são grandes: chegam depois, sem travar a busca */
  var faltam = 0;
  ['assets/dados/temporada-futebol.js', 'assets/dados/temporada-nba.js'].forEach(function (src) {
    faltam++;
    var s = document.createElement('script'); s.src = src + '?v=384';
    s.onload = s.onerror = function () { if (--faltam === 0) { montarJogadores(); if (!JOG) JOG = []; pintar(); } };
    document.body.appendChild(s);
  });
})();
