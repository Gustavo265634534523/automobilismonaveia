/* Monte seu time da NBA (monte-seu-time-basquete.html): igual ao do futebol. A pessoa é dona de uma franquia nova,
   tem um teto de salários sorteado e contrata o técnico, os 5 titulares e 3 reservas. Cada contratado aparece na
   quadra, na posição dele. Com o elenco completo e dentro do teto, simula a temporada regular (82 jogos, no lugar
   do pior time da última temporada, na mesma conferência) e os playoffs.
   Jogadores e técnicos são reais; a nota (estrelas) e o salário são do jogo.
   Adversários: força pela campanha da última temporada (COMPETICOES em esportes-dados.js, tabela e tabela2). */
(function () {
  var caixa = document.getElementById('mn'); if (!caixa) return;
  var esc = window.esc, B = window.BANDEIRAS || {};
  var ORCAMENTOS = [150, 180, 210, 240], RECORDE = 'arena-time-nba';
  var NOME_POS = { PG: 'Armador', SG: 'Ala-armador', SF: 'Ala', PF: 'Ala-pivô', C: 'Pivô' };

  /* [nome, país, nota] por posição */
  var JOG = {
    PG: [['Shai Gilgeous-Alexander', 'Canadá', 96], ['Luka Dončić', 'Eslovênia', 95], ['Stephen Curry', 'Estados Unidos', 90], ['Jalen Brunson', 'Estados Unidos', 89], ['Cade Cunningham', 'Estados Unidos', 89], ['Trae Young', 'Estados Unidos', 85], ['Ja Morant', 'Estados Unidos', 84], ['LaMelo Ball', 'Estados Unidos', 84], ['Jamal Murray', 'Canadá', 84], ['De\'Aaron Fox', 'Estados Unidos', 83], ['Dennis Schröder', 'Alemanha', 77], ['T.J. McConnell', 'Estados Unidos', 74], ['Mike Conley', 'Estados Unidos', 72]],
    SG: [['Anthony Edwards', 'Estados Unidos', 93], ['Donovan Mitchell', 'Estados Unidos', 90], ['Devin Booker', 'Estados Unidos', 88], ['Jaylen Brown', 'Estados Unidos', 88], ['Austin Reaves', 'Estados Unidos', 84], ['Tyler Herro', 'Estados Unidos', 83], ['Desmond Bane', 'Estados Unidos', 83], ['Derrick White', 'Estados Unidos', 82], ['Zach LaVine', 'Estados Unidos', 80], ['Bennedict Mathurin', 'Canadá', 78], ['Kentavious Caldwell-Pope', 'Estados Unidos', 75]],
    SF: [['Jayson Tatum', 'Estados Unidos', 91], ['LeBron James', 'Estados Unidos', 89], ['Kevin Durant', 'Estados Unidos', 89], ['Kawhi Leonard', 'Estados Unidos', 88], ['Jalen Williams', 'Estados Unidos', 87], ['Franz Wagner', 'Alemanha', 85], ['Cooper Flagg', 'Estados Unidos', 84], ['Jimmy Butler', 'Estados Unidos', 84], ['Mikal Bridges', 'Estados Unidos', 82], ['OG Anunoby', 'Inglaterra', 82], ['Brandon Miller', 'Estados Unidos', 80], ['Gui Santos', 'Brasil', 72]],
    PF: [['Giannis Antetokounmpo', 'Grécia', 96], ['Paolo Banchero', 'Estados Unidos', 88], ['Evan Mobley', 'Estados Unidos', 87], ['Scottie Barnes', 'Canadá', 86], ['Pascal Siakam', 'Camarões', 85], ['Jaren Jackson Jr.', 'Estados Unidos', 85], ['Lauri Markkanen', 'Finlândia', 84], ['Zion Williamson', 'Estados Unidos', 84], ['Julius Randle', 'Estados Unidos', 82], ['Aaron Gordon', 'Estados Unidos', 80], ['Draymond Green', 'Estados Unidos', 78], ['Tristan da Silva', 'Brasil', 73]],
    C: [['Nikola Jokić', 'Sérvia', 98], ['Victor Wembanyama', 'França', 95], ['Anthony Davis', 'Estados Unidos', 89], ['Karl-Anthony Towns', 'República Dominicana', 88], ['Joel Embiid', 'Camarões', 87], ['Alperen Şengün', 'Turquia', 87], ['Bam Adebayo', 'Estados Unidos', 86], ['Domantas Sabonis', 'Lituânia', 86], ['Chet Holmgren', 'Estados Unidos', 85], ['Rudy Gobert', 'França', 84], ['Jarrett Allen', 'Estados Unidos', 82], ['Ivica Zubac', 'Croácia', 82], ['Steven Adams', 'Nova Zelândia', 76], ['Al Horford', 'República Dominicana', 75]]
  };
  var TECNICOS = [['Erik Spoelstra', 'Estados Unidos', 94], ['Steve Kerr', 'Estados Unidos', 93], ['Mark Daigneault', 'Estados Unidos', 92], ['Joe Mazzulla', 'Estados Unidos', 90], ['Kenny Atkinson', 'Estados Unidos', 89], ['Tyronn Lue', 'Estados Unidos', 88], ['J.B. Bickerstaff', 'Estados Unidos', 88], ['Ime Udoka', 'Estados Unidos', 87], ['Rick Carlisle', 'Estados Unidos', 86], ['Jason Kidd', 'Estados Unidos', 85], ['JJ Redick', 'Estados Unidos', 82], ['Mike Budenholzer', 'Estados Unidos', 80]];

  function preco(n) { var f = Math.max(0, (n - 68) / 30); return Math.round(2 + 58 * Math.pow(f, 1.7)); }
  function op(x, pos) { return { id: x[0], nome: x[0], pais: x[1], nota: x[2], pos: pos, preco: pos === 'TEC' ? Math.max(2, Math.round(preco(x[2]) / 5)) : preco(x[2]) }; }
  var OPC = { TEC: TECNICOS.map(function (x) { return op(x, 'TEC'); }) };
  Object.keys(JOG).forEach(function (p) { OPC[p] = JOG[p].map(function (x) { return op(x, p); }); });
  OPC.G = OPC.PG.concat(OPC.SG).sort(function (a, b) { return b.nota - a.nota; });
  OPC.F = OPC.SF.concat(OPC.PF).sort(function (a, b) { return b.nota - a.nota; });
  OPC.R = OPC.C;

  /* x e y em % na quadra (cesta à esquerda) */
  var VAGAS = [
    { k: 'tec', pos: 'TEC', t: 'Técnico', d: 'Define o sistema de jogo e a rotação. Um bom técnico faz o time render acima da soma das notas.' },
    { k: 'pg', pos: 'PG', t: 'Armador', rot: 'PG', x: 70, y: 50 },
    { k: 'sg', pos: 'SG', t: 'Ala-armador', rot: 'SG', x: 52, y: 16 },
    { k: 'sf', pos: 'SF', t: 'Ala', rot: 'SF', x: 46, y: 84 },
    { k: 'pf', pos: 'PF', t: 'Ala-pivô', rot: 'PF', x: 26, y: 26 },
    { k: 'c', pos: 'C', t: 'Pivô', rot: 'C', x: 16, y: 64 },
    { k: 'r1', pos: 'G', t: 'Reserva: armador', rot: 'RES', banco: true, d: 'Sai do banco para dar descanso aos armadores.' },
    { k: 'r2', pos: 'F', t: 'Reserva: ala', rot: 'RES', banco: true, d: 'Sai do banco para dar descanso aos alas.' },
    { k: 'r3', pos: 'R', t: 'Reserva: pivô', rot: 'RES', banco: true, d: 'Sai do banco para dar descanso ao pivô.' }
  ];
  function novo(nome) { return { orc: ORCAMENTOS[Math.floor(Math.random() * ORCAMENTOS.length)], esc: {}, nome: nome || 'Fan Zone Ballers', aberta: 'tec', resultado: null }; }
  var est = novo();
  function achar(v) { return OPC[v.pos].filter(function (o) { return o.id === est.esc[v.k]; })[0]; }
  function gasto() { return VAGAS.reduce(function (s, v) { var o = achar(v); return s + (o ? o.preco : 0); }, 0); }
  function completo() { return VAGAS.every(function (v) { return achar(v); }); }
  function estrelas(n) { var e = Math.max(1, Math.min(5, Math.round((n - 68) / 6))); return '★★★★★'.slice(0, e) + '<i>' + '★★★★★'.slice(e) + '</i>'; }
  function bandeira(p) { return B[p] ? '<img class="av-bandeira" src="' + B[p] + '" alt="">' : ''; }
  function ocupados(v) { return VAGAS.filter(function (x) { return x.k !== v.k && x.pos !== 'TEC'; }).map(function (x) { return est.esc[x.k]; }); }

  /* ---------- simulação: temporada regular e playoffs ---------- */
  function vence(a, b, casa) { return Math.random() < 1 / (1 + Math.exp(-((a.r - b.r) + (casa ? 1.2 : -1.2)) / 3.2)); }
  function simular() {
    var jog = VAGAS.slice(1).map(function (v) { return { v: v, j: achar(v) }; }), tec = achar(VAGAS[0]);
    var media = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
    var tit = jog.filter(function (x) { return !x.v.banco; }), res = jog.filter(function (x) { return x.v.banco; });
    var forca = media(tit.map(function (x) { return x.j.nota; })) * 0.8 + media(res.map(function (x) { return x.j.nota; })) * 0.2 + (tec.nota - 85) * 0.15;
    var nba = (window.COMPETICOES || []).filter(function (c) { return c.slug === 'nba'; })[0] || {};
    var T = [];
    [['Leste', nba.tabela], ['Oeste', nba.tabela2]].forEach(function (c) {
      ((c[1] || {}).linhas || []).forEach(function (l) { var vd = String(l[2]).split('-'), p = (+vd[0] || 0) / Math.max(1, (+vd[0] || 0) + (+vd[1] || 0)); T.push({ nome: l[1], conf: c[0], r: 76 + 13 * p, p: p }); });
    });
    var pior = T.slice().sort(function (a, b) { return a.p - b.p; })[0] || { conf: 'Leste' };
    T.splice(T.indexOf(pior), 1);
    var eu = { nome: est.nome, conf: pior.conf, r: forca, minha: true, substitui: pior.nome }; T.push(eu);
    T.forEach(function (t) { t.v = t.d = 0; });
    function jogo(a, b) { if (vence(a, b, true)) { a.v++; b.d++; } else { b.v++; a.d++; } }
    /* 82 jogos: dois contra cada um (58) e mais 24 em rodadas sorteadas */
    T.forEach(function (a) { T.forEach(function (b) { if (a !== b) jogo(a, b); }); });
    for (var r = 0; r < 12; r++) {
      var s = T.slice().sort(function () { return Math.random() - .5; });
      for (var i = 0; i + 1 < s.length; i += 2) { jogo(s[i], s[i + 1]); jogo(s[i + 1], s[i]); }
    }
    var ord = function (a, b) { return b.v - a.v || b.r - a.r; };
    T.sort(ord);
    var conf = T.filter(function (t) { return t.conf === eu.conf; }), posConf = conf.indexOf(eu) + 1, posLiga = T.indexOf(eu) + 1;
    /* playoffs: os 8 melhores de cada conferência, séries de melhor de 7 */
    function serie(a, b) { var wa = 0, wb = 0, n = 0; while (wa < 4 && wb < 4) { var casaA = [0, 1, 4, 6].indexOf(n) > -1; if (vence(a, b, casaA)) wa++; else wb++; n++; } return { w: wa > wb ? a : b, placar: Math.max(wa, wb) + '-' + Math.min(wa, wb), a: a, b: b }; }
    var fases = [];
    function chave(lista) {
      var r1 = [[0, 7], [3, 4], [2, 5], [1, 6]].map(function (p) { return serie(lista[p[0]], lista[p[1]]); });
      var r2 = [serie(r1[0].w, r1[1].w), serie(r1[2].w, r1[3].w)];
      var fin = serie(r2[0].w, r2[1].w);
      return { r1: r1, r2: r2, fin: fin };
    }
    var L = chave(T.filter(function (t) { return t.conf === 'Leste'; }).slice(0, 8)), O = chave(T.filter(function (t) { return t.conf === 'Oeste'; }).slice(0, 8));
    var finais = serie(L.fin.w, O.fin.w);
    var minha = function (s) { return s.a === eu || s.b === eu; };
    [['Primeira rodada', L.r1.concat(O.r1)], ['Semifinal de conferência', L.r2.concat(O.r2)], ['Final de conferência', [L.fin, O.fin]], ['Finais da NBA', [finais]]].forEach(function (f) {
      var s = f[1].filter(minha)[0]; if (s) fases.push({ nome: f[0], s: s });
    });
    var campanha = posConf > 8 ? 'Fora dos playoffs' : finais.w === eu ? 'Campeão da NBA!' : fases.length ? 'Caiu na ' + fases[fases.length - 1].nome.toLowerCase().replace('finais da nba', 'final da NBA') : '';
    var setores = [['Armação', media(jog.filter(function (x) { return /PG|SG/.test(x.v.pos); }).map(function (x) { return x.j.nota; }))], ['Alas', media(jog.filter(function (x) { return /SF|PF/.test(x.v.pos); }).map(function (x) { return x.j.nota; }))], ['Garrafão', achar(VAGAS[5]).nota], ['Banco', media(res.map(function (x) { return x.j.nota; }))]].sort(function (a, b) { return b[1] - a[1]; });
    est.resultado = { tabela: conf, eu: eu, posConf: posConf, posLiga: posLiga, fases: fases, campeao: finais.w, campanha: campanha, forte: setores[0][0], fraco: setores[3][0] };
    var nivel = posConf > 8 ? 0 : finais.w === eu ? 5 : fases.length, rec = -1; try { rec = localStorage.getItem(RECORDE); rec = rec === null ? -1 : +rec; } catch (e) {}
    if (nivel > rec) { try { localStorage.setItem(RECORDE, nivel); } catch (e) {} if (rec > -1) est.resultado.recorde = true; }
  }
  var NIVEL_TXT = ['Fora dos playoffs', 'Primeira rodada', 'Semifinal de conferência', 'Final de conferência', 'Finais da NBA', 'Campeão da NBA'];

  /* ---------- tela ---------- */
  function sobrenome(n) { var p = String(n).trim().split(/\s+/); return p.length > 1 && p[p.length - 1].length > 3 ? p[p.length - 1] : p.length > 1 ? p.slice(-2).join(' ') : p[0]; }
  function iniciais(n) { var p = String(n).replace(/\./g, '').trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[1][0] : '')).toUpperCase(); }
  function slot(v, estilo) {
    var j = achar(v);
    return '<button type="button" class="pt-jog mn-slot' + (j ? '' : ' mn-livre') + (est.aberta === v.k ? ' mn-sel' : '') + '" data-abrir="' + v.k + '"' + (estilo ? ' style="' + estilo + '"' : '') + ' title="' + esc(v.t) + (j ? ' · ' + esc(j.nome) : '') + '">' +
      '<i>' + (j ? esc(iniciais(j.nome)) : '+') + '</i><small>' + (j ? esc(sobrenome(j.nome)) : v.rot) + '</small>' +
      (j ? '<span class="mn-x" data-tirar="' + v.k + '" aria-label="Dispensar ' + esc(j.nome) + '">×</span>' : '') + '</button>';
  }
  function quadra() {
    return '<div class="bq-quadra mn-gramado"><span class="bq-garrafao"></span><span class="bq-lance"></span><span class="bq-tres"></span><span class="bq-aro"></span>' +
      VAGAS.filter(function (v) { return v.x; }).map(function (v) { return slot(v, 'left:' + v.x + '%;top:' + v.y + '%'); }).join('') + '</div>' +
      '<div class="bq-banco mn-gramado"><small>Banco</small>' + VAGAS.filter(function (v) { return v.banco; }).map(function (v) { return slot(v); }).join('') + '</div>';
  }
  function painel(resta) {
    var v = VAGAS.filter(function (x) { return x.k === est.aberta; })[0]; if (!v) return '';
    var sel = achar(v), ocup = ocupados(v);
    return '<section class="ef-vaga ef-aberta mn-painel" id="mn-painel"><div class="ef-cab"><span><b>Contratar: ' + esc(v.t) + '</b><small>' + (sel ? 'Contratado: ' + esc(sel.nome) + ' · US$ ' + sel.preco + ' mi' : 'Escolha um nome') + '</small></span></div>' +
      (v.d ? '<p class="ef-desc">' + esc(v.d) + '</p>' : '') + '<div class="ef-ops">' + OPC[v.pos].map(function (o) {
        var ja = sel && sel.id === o.id, caro = !ja && o.preco - (sel ? sel.preco : 0) > resta, ocupado = ocup.indexOf(o.id) > -1;
        return '<button type="button" class="ef-op' + (ja ? ' ef-sel' : '') + '" data-vaga="' + v.k + '" data-id="' + esc(o.id) + '"' + (ocupado ? ' disabled' : '') + '>' +
          '<b>' + esc(o.nome) + '</b><small>' + bandeira(o.pais) + esc(o.pais) + (o.pos !== 'TEC' && v.banco ? ' · ' + NOME_POS[o.pos] : '') + (ocupado ? ' · já contratado' : '') + '</small><span class="ef-nota">' + estrelas(o.nota) + '</span>' +
          '<span class="ef-preco' + (caro ? ' ef-caro' : '') + '">US$ ' + o.preco + ' mi</span></button>';
      }).join('') + '</div></section>';
  }
  function pintar() {
    if (est.resultado) return pintarResultado();
    var g = gasto(), resta = est.orc - g, pct = Math.min(100, g / est.orc * 100), tec = achar(VAGAS[0]);
    var rec = -1; try { var x = localStorage.getItem(RECORDE); rec = x === null ? -1 : +x; } catch (e) {}
    caixa.innerHTML =
      '<section class="ef-orc"><div><small>Teto de salários</small><b>US$ ' + est.orc + ' mi</b></div>' +
        '<div><small>Gasto</small><b>US$ ' + g + ' mi</b></div><div class="' + (resta < 0 ? 'ef-neg' : '') + '"><small>Sobra</small><b>US$ ' + resta + ' mi</b></div>' +
        '<button type="button" class="ft-btn ft-btn-linha" data-acao="orc">Sortear outro teto</button>' +
        '<div class="ef-barra"><i style="width:' + pct.toFixed(1) + '%" class="' + (resta < 0 ? 'ef-neg' : '') + '"></i></div></section>' +
      '<div class="ef-nome"><label>Nome da franquia <input id="ef-nome" maxlength="28" value="' + esc(est.nome) + '"></label></div>' +
      '<button type="button" class="mn-tec' + (tec ? ' ef-ok' : '') + (est.aberta === 'tec' ? ' mn-sel' : '') + '" data-abrir="tec"><small>Técnico</small><b>' + (tec ? esc(tec.nome) : 'A contratar') + '</b><em>' + (tec ? '✓' : '+') + '</em></button>' +
      '<div class="pt-rotulos"><span>' + esc(est.nome) + '</span><span>' + VAGAS.slice(1).filter(achar).length + '/8</span></div>' +
      quadra() +
      '<p class="mn-dica">Toque numa posição da quadra ou do banco para contratar. O × dispensa o jogador.</p>' +
      painel(resta) +
      '<div class="ef-fim">' + (completo() && resta >= 0 ? '<button type="button" class="ft-btn" data-acao="simular">🏀 Simular a temporada</button>'
        : '<p>' + (resta < 0 ? 'Passou do teto em US$ ' + (-resta) + ' mi. Troque alguém por uma opção mais barata.' : 'Faltam ' + VAGAS.filter(function (v) { return !achar(v); }).length + ' contratações para completar o elenco.') + '</p>') +
      (rec > -1 ? '<small>Seu recorde: ' + NIVEL_TXT[rec] + '.</small>' : '') + '</div>';
  }
  function pintarResultado() {
    var R = est.resultado, eu = R.eu;
    caixa.innerHTML = '<section class="ef-res">' +
      '<p class="ef-pos"><b>' + eu.v + '-' + eu.d + '</b><span>' + esc(R.campanha) + (R.recorde ? ' · seu melhor resultado!' : '') + '</span></p>' +
      '<div class="av-placar"><span><b>' + R.posConf + 'º</b>no ' + eu.conf + '</span><span><b>' + R.posLiga + 'º</b>na liga</span><span><b>' + eu.v + '</b>vitórias</span><span><b>' + eu.d + '</b>derrotas</span></div>' +
      '<p class="ef-analise">Ponto forte: <b>' + esc(R.forte) + '</b> · Ponto fraco: <b>' + esc(R.fraco) + '</b> · Entrou no lugar do ' + esc(eu.substitui) + '</p>' +
      (R.fases.length ? '<h3>Playoffs</h3><ul class="ef-pil">' + R.fases.map(function (f) {
        var adv = f.s.a === eu ? f.s.b : f.s.a, ganhou = f.s.w === eu;
        return '<li><b>' + esc(f.nome) + '</b><span>' + (ganhou ? 'Venceu o ' : 'Perdeu para o ') + esc(adv.nome) + ' (' + f.s.placar + ')</span></li>';
      }).join('') + '</ul>' : '') +
      (R.campeao !== eu ? '<p class="ef-analise">Campeão: <b>' + esc(R.campeao.nome) + '</b></p>' : '') +
      '<h3>Conferência ' + eu.conf + '</h3><ol class="ef-tab">' + R.tabela.map(function (t) { return '<li' + (t === eu ? ' class="ef-eu"' : '') + '><span>' + esc(t.nome) + '</span><b>' + t.v + '-' + t.d + '</b></li>'; }).join('') + '</ol>' +
      '<div class="av-botoes"><button type="button" class="ft-btn" data-acao="de-novo">Simular de novo</button><button type="button" class="ft-btn ft-btn-linha" data-acao="editar">Mexer no elenco</button>' +
      '<button type="button" class="ft-btn ft-btn-linha" data-acao="nova">Novo time (outro teto)</button></div></section>';
  }
  caixa.addEventListener('click', function (e) {
    var x = e.target.closest('[data-tirar]');
    if (x) { var vt = x.getAttribute('data-tirar'); est.esc[vt] = undefined; est.aberta = vt; pintar(); return; }
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-acao');
    if (b.hasAttribute('data-abrir')) { est.aberta = b.getAttribute('data-abrir'); pintar(); var pn = document.getElementById('mn-painel'); if (pn) pn.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (b.hasAttribute('data-vaga')) {
      var vk = b.getAttribute('data-vaga'), id = b.getAttribute('data-id');
      est.esc[vk] = est.esc[vk] === id ? undefined : id;
      if (est.esc[vk]) { var prox = VAGAS.filter(function (v) { return !achar(v); })[0]; est.aberta = prox ? prox.k : ''; }
      pintar(); return;
    }
    if (a === 'orc') { var o; do { o = ORCAMENTOS[Math.floor(Math.random() * ORCAMENTOS.length)]; } while (o === est.orc); est.orc = o; pintar(); }
    if (a === 'simular' || a === 'de-novo') { simular(); pintar(); window.scrollTo({ top: caixa.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' }); }
    if (a === 'editar') { est.resultado = null; pintar(); }
    if (a === 'nova') { est = novo(est.nome); pintar(); }
  });
  caixa.addEventListener('input', function (e) { if (e.target.id === 'ef-nome') est.nome = e.target.value.trim() || 'Fan Zone Ballers'; });
  pintar();
})();
