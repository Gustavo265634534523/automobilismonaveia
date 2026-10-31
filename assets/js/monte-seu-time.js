/* Monte seu time (monte-seu-time.html): no mesmo estilo do "Monte sua equipe" da F1. A pessoa é dona de um clube
   novo e tem um orçamento sorteado para contratar o técnico e os 11 titulares na formação que escolher.
   Com o time completo e dentro do orçamento, simula o Brasileirão (38 rodadas, no lugar do lanterna da tabela de
   verdade) e mostra a posição final. Jogadores e técnicos são reais; a nota (estrelas) e o preço são do jogo.
   Times adversários: força pela pontuação na tabela atual (COMPETICOES em esportes-dados.js). */
(function () {
  var caixa = document.getElementById('mn'); if (!caixa) return;
  var esc = window.esc, B = window.BANDEIRAS || {};
  var ORCAMENTOS = [400, 500, 600, 700], RECORDE = 'arena-time-futebol';

  /* formações: linhas do goleiro para o ataque; em cada linha, do lado esquerdo para o direito do time */
  var LINHAS = {
    '4-3-3': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['MC', 'VOL', 'MC'], ['PE', 'CA', 'PD']],
    '4-4-2': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['PE', 'MC', 'VOL', 'PD'], ['CA', 'CA']],
    '4-2-3-1': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['VOL', 'VOL'], ['PE', 'MEI', 'PD'], ['CA']],
    '3-5-2': [['GOL'], ['ZAG', 'ZAG', 'ZAG'], ['LE', 'MC', 'VOL', 'MC', 'LD'], ['CA', 'CA']],
    '3-4-3': [['GOL'], ['ZAG', 'ZAG', 'ZAG'], ['LE', 'MC', 'MC', 'LD'], ['PE', 'CA', 'PD']],
    '4-1-2-1-2': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['VOL'], ['MC', 'MC'], ['MEI'], ['CA', 'CA']]
  };
  var FORMACOES = {}; Object.keys(LINHAS).forEach(function (f) { FORMACOES[f] = [].concat.apply([], LINHAS[f]); });
  var NOME_POS = { GOL: 'Goleiro', LD: 'Lateral direito', ZAG: 'Zagueiro', LE: 'Lateral esquerdo', VOL: 'Volante', MC: 'Meio-campo', MEI: 'Meia', PD: 'Ponta direita', PE: 'Ponta esquerda', CA: 'Centroavante' };
  var SETOR = { GOL: 'Defesa', LD: 'Defesa', ZAG: 'Defesa', LE: 'Defesa', VOL: 'Meio-campo', MC: 'Meio-campo', MEI: 'Meio-campo', PD: 'Ataque', PE: 'Ataque', CA: 'Ataque' };

  /* [nome, país, nota] por posição */
  var JOG = {
    GOL: [['Thibaut Courtois', 'Bélgica', 91], ['Alisson', 'Brasil', 90], ['Gianluigi Donnarumma', 'Itália', 89], ['Mike Maignan', 'França', 87], ['Jan Oblak', 'Eslovênia', 86], ['Ederson', 'Brasil', 84], ['Agustín Rossi', 'Argentina', 80], ['Hugo Souza', 'Brasil', 78], ['Léo Jardim', 'Brasil', 77], ['Weverton', 'Brasil', 73]],
    LD: [['Achraf Hakimi', 'Marrocos', 90], ['Trent Alexander-Arnold', 'Inglaterra', 86], ['Jules Koundé', 'França', 85], ['Jeremie Frimpong', 'Holanda', 84], ['Dani Carvajal', 'Espanha', 83], ['Wesley', 'Brasil', 80], ['Vanderson', 'Brasil', 79], ['Guillermo Varela', 'Uruguai', 76], ['Danilo', 'Brasil', 74]],
    ZAG: [['Virgil van Dijk', 'Holanda', 90], ['William Saliba', 'França', 89], ['Gabriel Magalhães', 'Brasil', 88], ['Rúben Dias', 'Portugal', 87], ['Marquinhos', 'Brasil', 86], ['Éder Militão', 'Brasil', 85], ['Pau Cubarsí', 'Espanha', 84], ['Gustavo Gómez', 'Paraguai', 79], ['Léo Ortiz', 'Brasil', 79], ['Fabrício Bruno', 'Brasil', 77], ['Murilo', 'Brasil', 76], ['Lucas Veríssimo', 'Brasil', 74]],
    LE: [['Nuno Mendes', 'Portugal', 89], ['Alejandro Grimaldo', 'Espanha', 85], ['Theo Hernández', 'França', 84], ['Alphonso Davies', 'Canadá', 84], ['Alejandro Balde', 'Espanha', 83], ['Alex Sandro', 'Brasil', 77], ['Ayrton Lucas', 'Brasil', 76], ['Piquerez', 'Uruguai', 76], ['Renan Lodi', 'Brasil', 74]],
    VOL: [['Rodri', 'Espanha', 91], ['Declan Rice', 'Inglaterra', 89], ['Moisés Caicedo', 'Equador', 87], ['Bruno Guimarães', 'Brasil', 87], ['Aurélien Tchouaméni', 'França', 85], ['Casemiro', 'Brasil', 80], ['André', 'Brasil', 79], ['Erick Pulgar', 'Chile', 77], ['Aníbal Moreno', 'Argentina', 76], ['Allan', 'Brasil', 72]],
    MC: [['Pedri', 'Espanha', 90], ['Vitinha', 'Portugal', 89], ['Federico Valverde', 'Uruguai', 88], ['João Neves', 'Portugal', 87], ['Nicolò Barella', 'Itália', 86], ['Frenkie de Jong', 'Holanda', 85], ['Gerson', 'Brasil', 80], ['Andreas Pereira', 'Brasil', 78], ['Jorginho', 'Itália', 77], ['Matheus Henrique', 'Brasil', 75]],
    MEI: [['Jude Bellingham', 'Inglaterra', 90], ['Jamal Musiala', 'Alemanha', 89], ['Florian Wirtz', 'Alemanha', 88], ['Cole Palmer', 'Inglaterra', 88], ['Martin Ødegaard', 'Noruega', 86], ['Bruno Fernandes', 'Portugal', 86], ['Giorgian de Arrascaeta', 'Uruguai', 84], ['Lucas Paquetá', 'Brasil', 83], ['Raphael Veiga', 'Brasil', 79], ['Matheus Pereira', 'Brasil', 78]],
    PD: [['Lamine Yamal', 'Espanha', 92], ['Ousmane Dembélé', 'França', 91], ['Mohamed Salah', 'Egito', 89], ['Raphinha', 'Brasil', 88], ['Bukayo Saka', 'Inglaterra', 88], ['Michael Olise', 'França', 87], ['Estêvão', 'Brasil', 83], ['Savinho', 'Brasil', 82], ['Luiz Henrique', 'Brasil', 80], ['Gabriel Veron', 'Brasil', 72]],
    PE: [['Vinícius Júnior', 'Brasil', 91], ['Khvicha Kvaratskhelia', 'Geórgia', 88], ['Luis Díaz', 'Colômbia', 86], ['Rafael Leão', 'Portugal', 85], ['Nico Williams', 'Espanha', 85], ['Gabriel Martinelli', 'Brasil', 83], ['Samuel Lino', 'Brasil', 79], ['Bruno Henrique', 'Brasil', 77], ['Everton Cebolinha', 'Brasil', 75]],
    CA: [['Kylian Mbappé', 'França', 93], ['Erling Haaland', 'Noruega', 92], ['Harry Kane', 'Inglaterra', 91], ['Lautaro Martínez', 'Argentina', 88], ['Julián Álvarez', 'Argentina', 87], ['Victor Osimhen', 'Nigéria', 86], ['Viktor Gyökeres', 'Suécia', 85], ['Pedro', 'Brasil', 80], ['Kaio Jorge', 'Brasil', 79], ['Vitor Roque', 'Brasil', 79], ['Germán Cano', 'Argentina', 73]]
  };
  var TECNICOS = [['Pep Guardiola', 'Espanha', 94], ['Carlo Ancelotti', 'Itália', 93], ['Luis Enrique', 'Espanha', 92], ['Xabi Alonso', 'Espanha', 90], ['Mikel Arteta', 'Espanha', 89], ['Abel Ferreira', 'Portugal', 88], ['Filipe Luís', 'Brasil', 86], ['Jorge Jesus', 'Portugal', 84], ['Leonardo Jardim', 'Portugal', 82], ['Fernando Diniz', 'Brasil', 79], ['Dorival Júnior', 'Brasil', 77]];

  function preco(n) { var f = Math.max(0, (n - 66) / 28); return Math.round(3 + 117 * f * f); }
  function op(x, pos) { return { id: x[0], nome: x[0], pais: x[1], nota: x[2], pos: pos, preco: pos === 'TEC' ? Math.max(2, Math.round(preco(x[2]) / 4)) : preco(x[2]) }; }
  var OPC = {}; Object.keys(JOG).forEach(function (p) { OPC[p] = JOG[p].map(function (x) { return op(x, p); }); });
  OPC.TEC = TECNICOS.map(function (x) { return op(x, 'TEC'); });

  function vagas() {
    var conta = {}, f = FORMACOES[est.form];
    return [{ k: 'tec', pos: 'TEC', t: 'Técnico', d: 'Monta o esquema e tira o melhor dos jogadores. Um bom técnico faz o time render acima da soma das notas.' }]
      .concat(f.map(function (p, i) {
        conta[p] = (conta[p] || 0) + 1;
        var n = f.filter(function (x) { return x === p; }).length;
        return { k: 's' + i, pos: p, t: NOME_POS[p] + (n > 1 ? ' ' + conta[p] : ''), d: '' };
      }));
  }
  function novo(nome, form) { return { orc: ORCAMENTOS[Math.floor(Math.random() * ORCAMENTOS.length)], form: form || '4-3-3', esc: {}, nome: nome || 'Fan Zone FC', aberta: 'tec', resultado: null }; }
  var est = novo();
  function achar(v) { return OPC[v.pos].filter(function (o) { return o.id === est.esc[v.k]; })[0]; }
  function gasto() { return vagas().reduce(function (s, v) { var o = achar(v); return s + (o ? o.preco : 0); }, 0); }
  function completo() { return vagas().every(function (v) { return achar(v); }); }
  function estrelas(n) { var e = Math.max(1, Math.min(5, Math.round((n - 66) / 6))); return '★★★★★'.slice(0, e) + '<i>' + '★★★★★'.slice(e) + '</i>'; }
  function bandeira(p) { return B[p] ? '<img class="av-bandeira" src="' + B[p] + '" alt="">' : ''; }
  function ocupados(v) { return vagas().filter(function (x) { return x.k !== v.k && x.pos === v.pos; }).map(function (x) { return est.esc[x.k]; }); }

  /* ---------- simulação do Brasileirão ---------- */
  function poisson(l) { var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
  function simular() {
    var V = vagas(), jog = V.slice(1).map(function (v) { return achar(v); }), tec = achar(V[0]);
    var setores = {}; jog.forEach(function (j) { var s = SETOR[j.pos]; (setores[s] = setores[s] || []).push(j.nota); });
    var media = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
    var forca = media(jog.map(function (j) { return j.nota; })) + (tec.nota - 82) * 0.18;
    var comp = (window.COMPETICOES || []).filter(function (c) { return c.slug === 'brasileirao'; })[0] || {};
    var linhas = ((comp.tabela || {}).linhas || []).slice();
    var maxP = Math.max.apply(null, [1].concat(linhas.map(function (l) { return +l[2] || 0; })));
    linhas.pop(); /* o seu clube entra no lugar do lanterna */
    var T = linhas.map(function (l) { return { nome: l[1], r: 74 + 12 * (+l[2] || 0) / maxP }; });
    var eu = { nome: est.nome, r: forca, minha: true }; T.push(eu);
    T.forEach(function (t) { t.pts = t.v = t.e = t.d = t.gp = t.gc = 0; });
    var gols = {};
    function jogo(a, b) {
      var ga = poisson(Math.max(.15, 1.35 * Math.exp((a.r - b.r) / 9) + .2)), gb = poisson(Math.max(.15, 1.1 * Math.exp((b.r - a.r) / 9)));
      a.gp += ga; a.gc += gb; b.gp += gb; b.gc += ga;
      if (ga > gb) { a.pts += 3; a.v++; b.d++; } else if (ga < gb) { b.pts += 3; b.v++; a.d++; } else { a.pts++; b.pts++; a.e++; b.e++; }
      [[a, ga], [b, gb]].forEach(function (x) {
        if (!x[0].minha) return;
        for (var g = 0; g < x[1]; g++) { /* quem fez o gol: atacantes têm mais chance */
          var peso = jog.map(function (j) { return ({ CA: 6, PD: 3.5, PE: 3.5, MEI: 3, MC: 1.5, VOL: .7, LD: .5, LE: .5, ZAG: .5, GOL: 0 })[j.pos] * (j.nota / 80); });
          var s = peso.reduce(function (x, y) { return x + y; }, 0), r = Math.random() * s, i = 0;
          while ((r -= peso[i]) > 0) i++;
          gols[jog[i].nome] = (gols[jog[i].nome] || 0) + 1;
        }
      });
    }
    T.forEach(function (a) { T.forEach(function (b) { if (a !== b) jogo(a, b); }); });
    T.sort(function (a, b) { return b.pts - a.pts || b.v - a.v || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp; });
    var pos = T.indexOf(eu) + 1, art = Object.keys(gols).sort(function (a, b) { return gols[b] - gols[a]; })[0];
    var areas = Object.keys(setores).map(function (s) { return [s, media(setores[s])]; }).sort(function (a, b) { return b[1] - a[1]; });
    est.resultado = { tabela: T, pos: pos, eu: eu, art: art, artGols: art ? gols[art] : 0, forte: areas[0][0], fraco: areas[areas.length - 1][0] };
    var rec = 99; try { rec = +localStorage.getItem(RECORDE) || 99; } catch (e) {}
    if (pos < rec) { try { localStorage.setItem(RECORDE, pos); } catch (e) {} est.resultado.recorde = true; }
  }
  function destino(p) { return p === 1 ? 'Campeão brasileiro!' : p <= 6 ? 'Vaga na Libertadores' : p <= 12 ? 'Vaga na Sul-Americana' : p >= 17 ? 'Rebaixado para a Série B' : 'Meio da tabela'; }

  /* ---------- tela ---------- */
  function sobrenome(n) { var p = String(n).trim().split(/\s+/); return p.length > 1 && p[p.length - 1].length > 2 ? p[p.length - 1] : p.join(' '); }
  function iniciais(n) { var p = String(n).trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
  function campo(V) {
    var k = 0;
    return '<div class="pt-meio pt-meio-casa">' + LINHAS[est.form].map(function (ln) {
      return '<div class="pt-linha">' + ln.map(function () {
        var v = V[++k], j = achar(v);
        return '<button type="button" class="pt-jog mn-slot' + (j ? '' : ' mn-livre') + (est.aberta === v.k ? ' mn-sel' : '') + '" data-abrir="' + v.k + '" title="' + esc(v.t) + (j ? ' · ' + esc(j.nome) : '') + '">' +
          '<i>' + (j ? esc(iniciais(j.nome)) : '+') + '</i><small>' + (j ? esc(sobrenome(j.nome)) : v.pos) + '</small>' +
          (j ? '<span class="mn-x" data-tirar="' + v.k + '" aria-label="Dispensar ' + esc(j.nome) + '">×</span>' : '') + '</button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  }
  function painel(V, resta) {
    var v = V.filter(function (x) { return x.k === est.aberta; })[0]; if (!v) return '';
    var sel = achar(v), ocup = ocupados(v);
    return '<section class="ef-vaga ef-aberta mn-painel" id="mn-painel"><div class="ef-cab"><span><b>Contratar: ' + esc(v.t) + '</b><small>' + (sel ? 'Contratado: ' + esc(sel.nome) + ' · € ' + sel.preco + ' mi' : 'Escolha um nome') + '</small></span></div>' +
      (v.d ? '<p class="ef-desc">' + esc(v.d) + '</p>' : '') + '<div class="ef-ops">' + OPC[v.pos].map(function (o) {
        var ja = sel && sel.id === o.id, caro = !ja && o.preco - (sel ? sel.preco : 0) > resta, ocupado = ocup.indexOf(o.id) > -1;
        return '<button type="button" class="ef-op' + (ja ? ' ef-sel' : '') + '" data-vaga="' + v.k + '" data-id="' + esc(o.id) + '"' + (ocupado ? ' disabled' : '') + '>' +
          '<b>' + esc(o.nome) + '</b><small>' + bandeira(o.pais) + esc(o.pais) + (ocupado ? ' · já contratado' : '') + '</small><span class="ef-nota">' + estrelas(o.nota) + '</span>' +
          '<span class="ef-preco' + (caro ? ' ef-caro' : '') + '">€ ' + o.preco + ' mi</span></button>';
      }).join('') + '</div></section>';
  }
  function pintar() {
    if (est.resultado) return pintarResultado();
    var V = vagas(), g = gasto(), resta = est.orc - g, pct = Math.min(100, g / est.orc * 100);
    var rec = 0; try { rec = +localStorage.getItem(RECORDE) || 0; } catch (e) {}
    caixa.innerHTML =
      '<section class="ef-orc"><div><small>Orçamento</small><b>€ ' + est.orc + ' mi</b></div>' +
        '<div><small>Gasto</small><b>€ ' + g + ' mi</b></div><div class="' + (resta < 0 ? 'ef-neg' : '') + '"><small>Sobra</small><b>€ ' + resta + ' mi</b></div>' +
        '<button type="button" class="ft-btn ft-btn-linha" data-acao="orc">Sortear outro orçamento</button>' +
        '<div class="ef-barra"><i style="width:' + pct.toFixed(1) + '%" class="' + (resta < 0 ? 'ef-neg' : '') + '"></i></div></section>' +
      '<div class="ef-nome"><label>Nome do clube <input id="ef-nome" maxlength="28" value="' + esc(est.nome) + '"></label>' +
        '<label>Formação <select id="ef-form">' + Object.keys(FORMACOES).map(function (f) { return '<option' + (f === est.form ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></label></div>' +
      '<button type="button" class="mn-tec' + (achar(V[0]) ? ' ef-ok' : '') + (est.aberta === 'tec' ? ' mn-sel' : '') + '" data-abrir="tec"><small>Técnico</small><b>' + (achar(V[0]) ? esc(achar(V[0]).nome) : 'A contratar') + '</b><em>' + (achar(V[0]) ? '✓' : '+') + '</em></button>' +
      '<div class="pt-rotulos"><span>' + esc(est.nome) + ' · ' + est.form + '</span><span>' + V.slice(1).filter(achar).length + '/11</span></div>' +
      '<div class="pt-gramado mn-gramado">' + campo(V) + '</div>' +
      '<p class="mn-dica">Toque numa posição do campo para contratar. O × dispensa o jogador.</p>' +
      painel(V, resta) +
      '<div class="ef-fim">' + (completo() && resta >= 0 ? '<button type="button" class="ft-btn" data-acao="simular">⚽ Simular o Brasileirão</button>'
        : '<p>' + (resta < 0 ? 'Passou do orçamento em € ' + (-resta) + ' mi. Troque alguém por uma opção mais barata.' : 'Faltam ' + V.filter(function (v) { return !achar(v); }).length + ' contratações para completar o time.') + '</p>') +
      (rec ? '<small>Seu recorde: ' + rec + 'º lugar no Brasileirão.</small>' : '') + '</div>';
  }
  function pintarResultado() {
    var R = est.resultado, eu = R.eu;
    caixa.innerHTML = '<section class="ef-res">' +
      '<p class="ef-pos"><b>' + R.pos + 'º</b><span>' + destino(R.pos) + (R.recorde ? ' · seu melhor resultado!' : '') + '</span></p>' +
      '<div class="av-placar"><span><b>' + eu.pts + '</b>pontos</span><span><b>' + eu.v + '</b>vitórias</span><span><b>' + eu.e + '</b>empates</span><span><b>' + eu.d + '</b>derrotas</span><span><b>' + eu.gp + ':' + eu.gc + '</b>gols</span></div>' +
      '<p class="ef-analise">Ponto forte: <b>' + esc(R.forte) + '</b> · Ponto fraco: <b>' + esc(R.fraco) + '</b>' + (R.art ? ' · Artilheiro: <b>' + esc(R.art) + '</b> (' + R.artGols + ' gols)' : '') + '</p>' +
      '<h3>Brasileirão</h3><ol class="ef-tab">' + R.tabela.map(function (t) { return '<li' + (t === eu ? ' class="ef-eu"' : '') + '><span>' + esc(t.nome) + '</span><b>' + t.pts + '</b></li>'; }).join('') + '</ol>' +
      '<div class="av-botoes"><button type="button" class="ft-btn" data-acao="de-novo">Simular de novo</button><button type="button" class="ft-btn ft-btn-linha" data-acao="editar">Mexer no time</button>' +
      '<button type="button" class="ft-btn ft-btn-linha" data-acao="nova">Novo time (outro orçamento)</button></div></section>';
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
      if (est.esc[vk]) { var prox = vagas().filter(function (v) { return !achar(v); })[0]; est.aberta = prox ? prox.k : ''; }
      pintar(); return;
    }
    if (a === 'orc') { var o; do { o = ORCAMENTOS[Math.floor(Math.random() * ORCAMENTOS.length)]; } while (o === est.orc); est.orc = o; pintar(); }
    if (a === 'simular' || a === 'de-novo') { simular(); pintar(); window.scrollTo({ top: caixa.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' }); }
    if (a === 'editar') { est.resultado = null; pintar(); }
    if (a === 'nova') { est = novo(est.nome, est.form); pintar(); }
  });
  caixa.addEventListener('input', function (e) { if (e.target.id === 'ef-nome') est.nome = e.target.value.trim() || 'Fan Zone FC'; });
  caixa.addEventListener('change', function (e) {
    if (e.target.id !== 'ef-form') return;
    /* troca a formação: quem tem posição na formação nova continua contratado */
    var antes = vagas().map(function (v) { return { pos: v.pos, id: est.esc[v.k] }; }).filter(function (x) { return x.id; });
    est.form = e.target.value; est.esc = {};
    vagas().forEach(function (v) { var i = antes.findIndex(function (x) { return x.pos === v.pos; }); if (i > -1) { est.esc[v.k] = antes[i].id; antes.splice(i, 1); } });
    var prox = vagas().filter(function (v) { return !achar(v); })[0]; est.aberta = prox ? prox.k : '';
    pintar();
  });
  pintar();
})();
