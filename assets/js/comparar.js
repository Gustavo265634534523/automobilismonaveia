/* Comparar jogadores (comparar.html): dois jogadores lado a lado, com a vantagem de cada um em destaque.
   Futebol: números da temporada por campeonato (assets/dados/temporada-futebol.js, robô .github/estatisticas-futebol.js).
   NBA: médias por temporada (assets/dados/temporada-nba.js, robô .github/nba-extras.js).
   O endereço guarda a escolha (comparar.html#futebol:id1,id2) para mandar a comparação para alguém. */
(function () {
  var caixa = document.getElementById('cp');
  if (!caixa) return;
  var esc = window.esc, TF = window.TEMPORADA_FUTEBOL, TN = window.TEMPORADA_NBA;
  var norm = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var num = function (v, casas) { return (casas ? (+v).toFixed(casas) : String(Math.round(v * 10) / 10)).replace('.', ','); };

  /* ---------- futebol: um registro por jogador, somando os campeonatos escolhidos ---------- */
  var POS = { GOL: 'Goleiro', ZAG: 'Zagueiro', LE: 'Lateral', LD: 'Lateral', MEI: 'Meio-campo', ATA: 'Atacante' };
  function futebol(comp) {
    var por = {};
    ((TF && TF.jogadores) || []).forEach(function (l) {
      if (comp && l[4] !== comp) return;
      var x = por[l[0]] = por[l[0]] || { id: l[0], nome: l[1], time: l[2], pos: l[3], v: [0, 0, 0, 0, 0, 0, 0, 0, 0], comps: [] };
      for (var i = 0; i < 9; i++) x.v[i] += l[5 + i];
      x.comps.push(TF.comps[l[4]] || l[4]);
    });
    return Object.keys(por).map(function (k) { return por[k]; });
  }
  /* linhas da comparação: [rótulo, valor, menos é melhor, formato] */
  function linhasFutebol(a, b) {
    var gol = a.pos === 'GOL' || b.pos === 'GOL';
    var L = [
      ['Jogos', function (x) { return x.v[0]; }], ['Como titular', function (x) { return x.v[1]; }],
      ['Gols', function (x) { return x.v[2]; }], ['Assistências', function (x) { return x.v[3]; }],
      ['Gols + assistências', function (x) { return x.v[2] + x.v[3]; }],
      ['Gols por jogo', function (x) { return x.v[0] ? x.v[2] / x.v[0] : 0; }, false, 2],
      ['Finalizações', function (x) { return x.v[4]; }], ['Chutes no gol', function (x) { return x.v[5]; }],
      ['Chutes no gol (%)', function (x) { return x.v[4] ? x.v[5] / x.v[4] * 100 : 0; }, false, 0, '%'],
      ['Cartões amarelos', function (x) { return x.v[6]; }, true], ['Cartões vermelhos', function (x) { return x.v[7]; }, true]
    ];
    if (gol) L.splice(2, 0, ['Defesas', function (x) { return x.v[8]; }], ['Defesas por jogo', function (x) { return x.v[0] ? x.v[8] / x.v[0] : 0; }, false, 1]);
    return L;
  }

  /* ---------- NBA ---------- */
  var COL_NBA = (TN && TN.colunas) || [];
  function nba(temp) {
    return (((TN && TN.temporadas) || {})[temp] || []).map(function (l) { return { id: String(l[0]), nome: l[1], time: l[2], pos: l[3], v: l.slice(4) }; });
  }
  function linhasNba() {
    var menos = { Erros: true };
    return COL_NBA.map(function (c, i) {
      var pct = / %$/.test(c);
      return [c.replace(' %', ' (%)'), function (x) { return x.v[i] || 0; }, !!menos[c], pct || i === 0 || /Duplos|Triplos/.test(c) ? 0 : 1, pct ? '%' : ''];
    });
  }

  /* ---------- estado ---------- */
  var esporte = /basquete|nba/.test(location.hash) ? 'basquete' : 'futebol';
  var comp = '', temp = '', lista = [], escolha = [null, null];
  var temps = Object.keys((TN && TN.temporadas) || {}).sort().reverse();
  /* temporada atual só quando já tem jogos de verdade; senão, a anterior */
  temp = temps.filter(function (t) { return (TN.temporadas[t] || []).some(function (l) { return l[4] >= 5; }); })[0] || temps[0] || '';
  function carregar() {
    lista = esporte === 'futebol' ? futebol(comp) : nba(temp);
    lista.forEach(function (x) { x.busca = norm(x.nome + ' ' + x.time); });
  }
  function porId(id) { for (var i = 0; i < lista.length; i++) if (String(lista[i].id) === String(id)) return lista[i]; return null; }
  function padrao() {
    var ord = lista.slice().sort(esporte === 'futebol' ? function (a, b) { return (b.v[2] + b.v[3]) - (a.v[2] + a.v[3]); } : function (a, b) { return b.v[2] - a.v[2]; });
    return [ord[0] || null, ord[1] || null];
  }
  function lerHash() {
    var m = location.hash.match(/^#(futebol|basquete):([^,]*),(.*)$/);
    if (!m) return;
    esporte = m[1];
    carregar();
    escolha = [porId(m[2]), porId(m[3])];
  }
  function gravarHash() {
    history.replaceState(null, '', '#' + esporte + ':' + (escolha[0] ? escolha[0].id : '') + ',' + (escolha[1] ? escolha[1].id : ''));
  }

  /* ---------- busca de jogador ---------- */
  function sugestoes(q) {
    q = norm(q.trim()); if (q.length < 2) return [];
    var comeco = [], meio = [];
    lista.forEach(function (x) {
      var n = norm(x.nome), k = n.indexOf(q);
      if (k === 0 || n.indexOf(' ' + q) > -1) comeco.push(x); else if (x.busca.indexOf(q) > -1) meio.push(x);
    });
    var peso = esporte === 'futebol' ? function (x) { return x.v[0]; } : function (x) { return x.v[0] * x.v[1]; };
    var ord = function (a, b) { return peso(b) - peso(a); };
    return comeco.sort(ord).concat(meio.sort(ord)).slice(0, 8);
  }
  function campo(i) {
    var x = escolha[i];
    return '<div class="cp-lado cp-lado-' + i + '"><label class="sr" for="cp-b' + i + '">Jogador ' + (i + 1) + '</label>' +
      '<div class="cp-busca"><input id="cp-b' + i + '" type="search" autocomplete="off" placeholder="Digite o nome do jogador ' + (i + 1) + '" value="' + (x ? esc(x.nome) : '') + '"><ul class="mn-sug" hidden role="listbox"></ul></div>' +
      (x ? '<div class="cp-quem"><b>' + esc(x.nome) + '</b><span>' + window.escudoTime(x.time) + esc(x.time) + (x.pos ? ' · ' + esc(POS[x.pos] || x.pos) : '') + '</span>' +
        (x.comps && !comp ? '<small>' + esc(x.comps.filter(function (c, k, a) { return a.indexOf(c) === k; }).join(', ')) + '</small>' : '') + '</div>' : '<div class="cp-quem cp-vazio">Escolha um jogador</div>') + '</div>';
  }
  function tabela() {
    var a = escolha[0], b = escolha[1];
    if (!a || !b) return '<p class="pt-vazio">Escolha os dois jogadores para comparar.</p>';
    var L = esporte === 'futebol' ? linhasFutebol(a, b) : linhasNba();
    var pa = 0, pb = 0;
    var linhas = L.map(function (l) {
      var va = l[1](a), vb = l[1](b), menos = l[2], casas = l[3] || 0, suf = l[4] || '';
      var ga = va !== vb && ((va > vb) !== !!menos), gb = va !== vb && !ga;
      if (ga) pa++; if (gb) pb++;
      var t = Math.abs(va) + Math.abs(vb), w = t ? Math.abs(va) / t * 100 : 50;
      return '<div class="pt-est-l' + (ga ? ' pt-ganha-casa' : gb ? ' pt-ganha-fora' : '') + '"><b>' + num(va, casas) + suf + '</b><span>' + esc(l[0]) + '</span><b>' + num(vb, casas) + suf + '</b>' +
        '<i class="pt-est-barra" aria-hidden="true"><em style="width:' + w.toFixed(1) + '%"></em><em style="width:' + (100 - w).toFixed(1) + '%"></em></i></div>';
    }).join('');
    return '<div class="cp-placar"><span><b>' + pa + '</b> ' + esc(a.nome) + '</span><small>itens em vantagem</small><span>' + esc(b.nome) + ' <b>' + pb + '</b></span></div>' +
      '<div class="pt-est cp-est">' + linhas + '</div>';
  }
  function pintar() {
    var filtro = esporte === 'futebol'
      ? '<label for="cp-filtro">Campeonato</label><select id="cp-filtro"><option value="">Todos os campeonatos</option>' + Object.keys((TF && TF.comps) || {}).map(function (k) { return '<option value="' + k + '"' + (k === comp ? ' selected' : '') + '>' + esc(TF.comps[k]) + '</option>'; }).join('') + '</select>'
      : '<label for="cp-filtro">Temporada</label><select id="cp-filtro">' + temps.map(function (t) { return '<option' + (t === temp ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>';
    var semDados = esporte === 'futebol' ? !(TF && TF.jogadores && TF.jogadores.length) : !temps.length;
    caixa.innerHTML = '<div class="dq-abas cp-esportes" role="tablist"><button type="button" role="tab" data-e="futebol" aria-selected="' + (esporte === 'futebol') + '">Futebol</button><button type="button" role="tab" data-e="basquete" aria-selected="' + (esporte === 'basquete') + '">NBA</button></div>' +
      (semDados ? '<p class="pt-vazio">Os números da temporada estão sendo preparados. Volte em algumas horas.</p>' :
      '<div class="cp-filtro ls-filtro">' + filtro + '</div><div class="cp-lados">' + campo(0) + '<span class="cp-vs">x</span>' + campo(1) + '</div>' + tabela() +
      '<p class="dq-nota">' + (esporte === 'futebol' ? 'Números da ESPN na temporada ' + (comp ? 'do campeonato escolhido' : 'somando Brasileirão, Copa do Brasil, Libertadores, Sul-Americana, Champions, Liga Europa e as ligas da Europa') + '. Atualizado em ' + window.dataCurta(TF.atualizado) + '.'
        : 'Média por jogo na temporada regular da NBA (ESPN). Atualizado em ' + window.dataCurta(TN.atualizado) + '.') + '</p>');
    document.body.setAttribute('data-esporte', esporte);
    document.getElementById('pg-main').setAttribute('data-esporte', esporte);
    [].forEach.call(caixa.querySelectorAll('.cp-esportes button'), function (b) {
      b.addEventListener('click', function () { if (esporte === b.getAttribute('data-e')) return; esporte = b.getAttribute('data-e'); comp = ''; carregar(); escolha = padrao(); gravarHash(); pintar(); });
    });
    var f = document.getElementById('cp-filtro');
    if (f) f.addEventListener('change', function () {
      if (esporte === 'futebol') comp = f.value; else temp = f.value;
      var ids = escolha.map(function (x) { return x && x.id; });
      carregar();
      escolha = ids.map(porId);
      if (!escolha[0] || !escolha[1]) { var p = padrao(); escolha = [escolha[0] || (p[0] !== escolha[1] ? p[0] : p[1]), escolha[1] || (p[1] !== escolha[0] ? p[1] : p[0])]; }
      gravarHash(); pintar();
    });
    [0, 1].forEach(function (i) {
      var inp = document.getElementById('cp-b' + i); if (!inp) return;
      var ul = inp.nextSibling, atual = [], sel = 0;
      function abrir() {
        atual = sugestoes(inp.value); sel = 0;
        ul.hidden = !atual.length;
        ul.innerHTML = atual.map(function (x, k) { return '<li role="option" aria-selected="' + (k === sel) + '" data-k="' + k + '"><b>' + esc(x.nome) + '</b><span>' + esc(x.time) + '</span><em>' + esc(esporte === 'futebol' ? x.v[2] + ' gols' : num(x.v[2]) + ' pts') + '</em></li>'; }).join('');
      }
      function escolher(x) { escolha[i] = x; gravarHash(); pintar(); }
      inp.addEventListener('input', abrir);
      inp.addEventListener('focus', function () { inp.select(); });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, Math.min(atual.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1))); [].forEach.call(ul.children, function (li, k) { li.setAttribute('aria-selected', k === sel); }); }
        if (e.key === 'Enter' && atual[sel]) { e.preventDefault(); escolher(atual[sel]); }
        if (e.key === 'Escape') ul.hidden = true;
      });
      ul.addEventListener('mousedown', function (e) { var li = e.target.closest('li'); if (li) { e.preventDefault(); escolher(atual[+li.getAttribute('data-k')]); } });
      inp.addEventListener('blur', function () { setTimeout(function () { ul.hidden = true; }, 150); });
    });
  }

  carregar();
  escolha = padrao();
  lerHash();
  if (!escolha[0] || !escolha[1]) { var p = padrao(); escolha = [escolha[0] || p[0], escolha[1] || p[1]]; }
  pintar();
  window.addEventListener('hashchange', function () {
    var e = /basquete|nba/.test(location.hash) ? 'basquete' : 'futebol';
    if (e !== esporte) { esporte = e; comp = ''; carregar(); escolha = padrao(); lerHash(); pintar(); }
  });
})();
