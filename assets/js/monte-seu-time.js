/* Monte seu time (monte-seu-time.html): a pessoa monta o time dela e o do adversário no mesmo campo.
   Digita o nome de qualquer jogador e aperta Enter: ele vai sozinho para a posição dele na formação escolhida.
   Os craques da lista (assets/dados/jogadores-craques.js) aparecem na hora; qualquer outro jogador que já jogou
   é buscado no Wikidata (posição e foto). Clicar num jogador do campo seleciona; clicar em outra posição troca os dois
   de lugar; o "x" tira do time. Os times ficam salvos neste aparelho e podem ser enviados por link. */
(function () {
  var raiz = document.getElementById('mn');
  if (!raiz) return;
  var esc = window.esc;

  /* formações: linhas do goleiro para o ataque; em cada linha, do lado esquerdo para o direito do time */
  var FORMACOES = {
    '4-3-3': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['MC', 'VOL', 'MC'], ['PE', 'CA', 'PD']],
    '4-4-2': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['PE', 'MC', 'VOL', 'PD'], ['CA', 'CA']],
    '4-2-3-1': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['VOL', 'VOL'], ['PE', 'MEI', 'PD'], ['CA']],
    '3-5-2': [['GOL'], ['ZAG', 'ZAG', 'ZAG'], ['LE', 'MC', 'VOL', 'MC', 'LD'], ['CA', 'CA']],
    '3-4-3': [['GOL'], ['ZAG', 'ZAG', 'ZAG'], ['LE', 'MC', 'MC', 'LD'], ['PE', 'CA', 'PD']],
    '4-1-2-1-2': [['GOL'], ['LE', 'ZAG', 'ZAG', 'LD'], ['VOL'], ['MC', 'MC'], ['MEI'], ['CA', 'CA']]
  };
  var NOME_POS = { GOL: 'Goleiro', LD: 'Lateral direito', ZAG: 'Zagueiro', LE: 'Lateral esquerdo', VOL: 'Volante', MC: 'Meio-campo', MEI: 'Meia', PD: 'Ponta direita', PE: 'Ponta esquerda', CA: 'Centroavante' };
  /* se a posição do jogador já estiver ocupada, tenta as parecidas, nesta ordem */
  var PARECIDAS = { GOL: ['GOL'], LD: ['LD', 'ZAG', 'LE', 'VOL'], LE: ['LE', 'ZAG', 'LD', 'VOL'], ZAG: ['ZAG', 'VOL', 'LD', 'LE'], VOL: ['VOL', 'MC', 'ZAG', 'MEI'],
    MC: ['MC', 'VOL', 'MEI', 'PE', 'PD'], MEI: ['MEI', 'MC', 'PE', 'PD', 'CA'], PD: ['PD', 'PE', 'MEI', 'CA', 'MC'], PE: ['PE', 'PD', 'MEI', 'CA', 'MC'], CA: ['CA', 'PE', 'PD', 'MEI'] };

  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  var CRAQUES = (window.JOGADORES_CRAQUES || []).map(function (x) { var p = x.split('|'); return { n: p[0], pos: p[1], k: norm(p[0]) }; });

  /* estado: dois times, cada um com nome, formação e os 11 lugares */
  function vazio(nome) { return { nome: nome, formacao: '4-3-3', lugares: new Array(11).fill(null) }; }
  var E = { times: [vazio('Meu time'), vazio('Adversário')], ativo: 0 };
  try { var salvo = JSON.parse(localStorage.getItem('arena-monte-seu-time') || 'null'); if (salvo && salvo.times && salvo.times.length === 2) E = salvo; } catch (e) { /* sem armazenamento */ }
  /* link compartilhado (#t=...) tem preferência */
  try {
    var h = location.hash.match(/#t=([^&]+)/);
    if (h) { var d = JSON.parse(decodeURIComponent(escape(atob(h[1].replace(/-/g, '+').replace(/_/g, '/'))))); if (d && d.times && d.times.length === 2) E = d; }
  } catch (e) { /* link estragado: fica o salvo */ }
  E.ativo = E.ativo === 1 ? 1 : 0;
  function salvar() { try { localStorage.setItem('arena-monte-seu-time', JSON.stringify(E)); } catch (e) { /* modo privado */ } }
  function slots(t) { var out = []; FORMACOES[t.formacao].forEach(function (ln, li) { ln.forEach(function (pos) { out.push({ pos: pos, linha: li }); }); }); return out; }

  var aviso = '';
  function colocar(j, ti) {
    var t = E.times[ti], S = slots(t);
    if (t.lugares.some(function (x) { return x && norm(x.n) === norm(j.n); })) { aviso = esc(j.n) + ' já está no ' + esc(t.nome) + '.'; return false; }
    var ordem = PARECIDAS[j.pos] || ['CA', 'MEI', 'MC'], i = -1;
    ordem.some(function (p) { i = S.findIndex(function (s, k) { return s.pos === p && !t.lugares[k]; }); return i > -1; });
    if (i < 0 && j.pos !== 'GOL') i = S.findIndex(function (s, k) { return s.pos !== 'GOL' && !t.lugares[k]; });
    if (i < 0) { aviso = j.pos === 'GOL' ? 'O ' + esc(t.nome) + ' já tem goleiro. Tire o atual para trocar.' : 'O ' + esc(t.nome) + ' já está completo. Tire alguém para colocar ' + esc(j.n) + '.'; return false; }
    t.lugares[i] = { n: j.n, pos: j.pos, foto: j.foto || '' };
    aviso = esc(j.n) + ' entrou como ' + NOME_POS[S[i].pos].toLowerCase() + ' no ' + esc(t.nome) + '.';
    salvar(); return true;
  }

  /* ---------- desenho ---------- */
  var sel = null; /* { t, i } jogador selecionado para trocar de lugar */
  function sobrenome(n) { var p = String(n).replace(/\s*\(.*\)$/, '').trim().split(/\s+/); return p.length > 1 && p[p.length - 1].length > 2 ? p[p.length - 1] : p.join(' '); }
  function iniciais(n) { var p = String(n).trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
  function metade(ti) {
    var t = E.times[ti], S = slots(t), linhas = [];
    S.forEach(function (s, k) { (linhas[s.linha] = linhas[s.linha] || []).push(k); });
    return '<div class="pt-meio pt-meio-' + (ti ? 'fora' : 'casa') + '">' + linhas.map(function (ln) {
      var ks = ti ? ln.slice().reverse() : ln; /* o adversário ataca para o outro lado: o lado esquerdo dele fica embaixo */
      return '<div class="pt-linha">' + ks.map(function (k) {
        var j = t.lugares[k], s = S[k], marcado = sel && sel.t === ti && sel.i === k;
        return '<button type="button" class="pt-jog mn-slot' + (j ? '' : ' mn-livre') + (marcado ? ' mn-sel' : '') + '" data-t="' + ti + '" data-i="' + k + '" title="' + (j ? esc(j.n) + ' · ' : '') + NOME_POS[s.pos] + '">' +
          '<i>' + (j ? (j.foto ? '<img src="' + esc(j.foto) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + esc(iniciais(j.n)) : '+') + '</i>' +
          '<small>' + (j ? esc(sobrenome(j.n)) : s.pos) + '</small>' + (j ? '<span class="mn-x" data-tirar="1" aria-label="Tirar ' + esc(j.n) + '">×</span>' : '') + '</button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  }
  function pintar() {
    var t0 = E.times[0], t1 = E.times[1], cheio = function (t) { return t.lugares.filter(Boolean).length; };
    raiz.innerHTML =
      '<div class="mn-cab">' + [0, 1].map(function (ti) {
        var t = E.times[ti];
        return '<div class="mn-time mn-time-' + ti + (E.ativo === ti ? ' mn-ativo' : '') + '">' +
          '<input class="mn-nome" data-t="' + ti + '" value="' + esc(t.nome) + '" maxlength="24" aria-label="Nome do time">' +
          '<div class="mn-linha"><select data-t="' + ti + '" aria-label="Formação">' + Object.keys(FORMACOES).map(function (f) { return '<option' + (f === t.formacao ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select>' +
          '<span class="mn-conta">' + cheio(t) + '/11</span></div></div>';
      }).join('<span class="mn-vs">x</span>') + '</div>' +
      '<form class="mn-busca" autocomplete="off"><div class="mn-para" role="group" aria-label="Colocar no">' +
        '<button type="button" data-ativo="0" aria-pressed="' + (E.ativo === 0) + '">' + esc(t0.nome) + '</button><button type="button" data-ativo="1" aria-pressed="' + (E.ativo === 1) + '">' + esc(t1.nome) + '</button></div>' +
        '<div class="mn-campo-busca"><input id="mn-q" type="search" placeholder="Digite um jogador e aperte Enter (ex.: Harry Kane, Pelé, Xavi)" aria-label="Buscar jogador"><button type="submit">Colocar</button>' +
        '<ul class="mn-sug" id="mn-sug" hidden></ul></div></form>' +
      '<p class="mn-aviso" id="mn-aviso" role="status">' + aviso + '</p>' +
      '<div class="pt-rotulos"><span>' + esc(t0.nome) + ' · ' + t0.formacao + '</span><span>' + esc(t1.nome) + ' · ' + t1.formacao + '</span></div>' +
      '<div class="pt-gramado mn-gramado">' + metade(0) + metade(1) + '</div>' +
      '<p class="mn-dica">Toque num jogador e depois em outra posição do mesmo time para trocar os dois de lugar. O × tira do time.</p>' +
      '<div class="mn-acoes"><button type="button" class="ft-btn" id="mn-link">Copiar link dos times</button><button type="button" class="ft-btn ft-btn-linha" id="mn-limpar">Limpar ' + esc(E.times[E.ativo].nome) + '</button></div>';
    ligar();
  }

  /* ---------- busca ---------- */
  var sugestoes = [], marc = -1, pedido = 0;
  function locais(q) {
    var k = norm(q); if (k.length < 2) return [];
    return CRAQUES.filter(function (c) { return c.k.indexOf(k) > -1 || c.k.split(' ').some(function (w) { return w.indexOf(k) === 0; }); })
      .sort(function (a, b) { return (a.k.indexOf(k) === 0 ? 0 : 1) - (b.k.indexOf(k) === 0 ? 0 : 1) || a.n.length - b.n.length; }).slice(0, 6)
      .map(function (c) { return { n: c.n, pos: c.pos, desc: NOME_POS[c.pos] }; });
  }
  /* Wikidata: busca o nome, fica só com quem é jogador de futebol, lê a posição (P413) e a foto (P18) */
  var rotulosPos = {};
  function posDe(rotulo) {
    var r = String(rotulo || '').toLowerCase();
    if (/goal ?keeper|goleiro/.test(r)) return 'GOL';
    if (/left[- ]?(back|wing[- ]?back)|lateral esquerdo/.test(r)) return 'LE';
    if (/right[- ]?(back|wing[- ]?back)|lateral direito|full[- ]?back|wing[- ]?back|lateral/.test(r)) return 'LD';
    if (/centre[- ]?back|center[- ]?back|defender|sweeper|libero|zagueiro|defensor/.test(r)) return 'ZAG';
    if (/defensive midfield|holding|volante/.test(r)) return 'VOL';
    if (/attacking midfield|playmaker|meia/.test(r)) return 'MEI';
    if (/left wing|ponta esquerda/.test(r)) return 'PE';
    if (/right wing|ponta direita|winger|wing/.test(r)) return 'PD';
    if (/midfield|meio/.test(r)) return 'MC';
    if (/forward|striker|centre[- ]?forward|atacante|centroavante/.test(r)) return 'CA';
    return null;
  }
  function wiki(q) {
    var api = 'https://www.wikidata.org/w/api.php?format=json&origin=*';
    return fetch(api + '&action=wbsearchentities&type=item&limit=12&language=pt&uselang=pt&search=' + encodeURIComponent(q)).then(function (r) { return r.json(); })
      .then(function (r) {
        var ids = (r.search || []).map(function (x) { return x.id; });
        if (!ids.length) return [];
        return fetch(api + '&action=wbgetentities&props=labels|descriptions|claims&languages=pt|en&ids=' + ids.join('|')).then(function (x) { return x.json(); }).then(function (d) {
          var jog = ids.map(function (id) { return d.entities && d.entities[id]; }).filter(function (e) {
            return e && e.claims && (e.claims.P106 || []).some(function (c) { return ((c.mainsnak.datavalue || {}).value || {}).id === 'Q937857'; });
          });
          var posIds = [];
          jog.forEach(function (e) { (e.claims.P413 || []).forEach(function (c) { var id = ((c.mainsnak.datavalue || {}).value || {}).id; if (id && !rotulosPos[id] && posIds.indexOf(id) < 0) posIds.push(id); }); });
          var antes = posIds.length ? fetch(api + '&action=wbgetentities&props=labels&languages=en|pt&ids=' + posIds.slice(0, 50).join('|')).then(function (x) { return x.json(); }).then(function (p) {
            Object.keys(p.entities || {}).forEach(function (id) { var l = p.entities[id].labels || {}; rotulosPos[id] = (l.en || l.pt || {}).value || ''; });
          }) : Promise.resolve();
          return antes.then(function () {
            return jog.map(function (e) {
              var nome = ((e.labels.pt || e.labels.en || {}).value) || '', pos = null;
              (e.claims.P413 || []).some(function (c) { pos = posDe(rotulosPos[((c.mainsnak.datavalue || {}).value || {}).id]); return !!pos; });
              var img = (((e.claims.P18 || [])[0] || {}).mainsnak || {}).datavalue;
              return { n: nome, pos: pos || 'MC', desc: ((e.descriptions.pt || e.descriptions.en || {}).value) || 'jogador de futebol', semPos: !pos,
                foto: img ? 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(img.value) + '?width=96' : '' };
            }).filter(function (x) { return x.n; });
          });
        });
      });
  }
  function mostrar(lista) {
    var ul = document.getElementById('mn-sug'); if (!ul) return;
    sugestoes = lista; marc = lista.length ? 0 : -1;
    ul.hidden = !lista.length;
    ul.innerHTML = lista.map(function (s, i) {
      return '<li role="option" data-i="' + i + '" aria-selected="' + (i === marc) + '"><b>' + esc(s.n) + '</b><span>' + esc(s.desc || '') + '</span><em>' + esc(s.pos) + '</em></li>';
    }).join('');
    [].forEach.call(ul.children, function (li) { li.addEventListener('mousedown', function (e) { e.preventDefault(); escolher(sugestoes[+li.getAttribute('data-i')]); }); });
  }
  function escolher(j) {
    if (!j) return;
    colocar(j, E.ativo); pintar();
    var q = document.getElementById('mn-q'); if (q) q.focus();
  }
  function buscar(q, entao) {
    var meu = ++pedido, loc = locais(q);
    mostrar(loc);
    if (norm(q).length < 3) { if (entao) entao(loc); return; }
    wiki(q).then(function (w) {
      if (meu !== pedido) return;
      var ja = {}; loc.forEach(function (x) { ja[norm(x.n)] = 1; });
      var todos = loc.concat(w.filter(function (x) { return !ja[norm(x.n)]; })).slice(0, 8);
      mostrar(todos); if (entao) entao(todos);
    }).catch(function () { if (meu === pedido && entao) entao(loc); });
  }

  /* ---------- eventos ---------- */
  function ligar() {
    var q = document.getElementById('mn-q'), t = null;
    q.addEventListener('input', function () { clearTimeout(t); var v = q.value; t = setTimeout(function () { buscar(v); }, 280); });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!sugestoes.length) return;
        marc = (marc + (e.key === 'ArrowDown' ? 1 : -1) + sugestoes.length) % sugestoes.length;
        [].forEach.call(document.querySelectorAll('#mn-sug li'), function (li, i) { li.setAttribute('aria-selected', i === marc); });
      } else if (e.key === 'Escape') { mostrar([]); }
    });
    q.addEventListener('blur', function () { setTimeout(function () { mostrar([]); }, 150); });
    raiz.querySelector('.mn-busca').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = q.value.trim(); if (!v) return;
      if (sugestoes.length && marc > -1) { escolher(sugestoes[marc]); return; }
      document.getElementById('mn-aviso').textContent = 'Procurando ' + v + '…';
      buscar(v, function (lista) {
        if (lista.length) escolher(lista[0]);
        else { aviso = 'Não achei "' + esc(v) + '". Confira o nome e tente de novo.'; pintar(); }
      });
    });
    [].forEach.call(raiz.querySelectorAll('[data-ativo]'), function (b) { b.addEventListener('click', function () { E.ativo = +b.getAttribute('data-ativo'); salvar(); aviso = ''; pintar(); document.getElementById('mn-q').focus(); }); });
    [].forEach.call(raiz.querySelectorAll('.mn-time'), function (d, ti) { d.addEventListener('click', function (e) { if (e.target.tagName === 'DIV' || e.target === d) { E.ativo = ti; salvar(); pintar(); } }); });
    [].forEach.call(raiz.querySelectorAll('.mn-nome'), function (inp) {
      inp.addEventListener('change', function () { E.times[+inp.getAttribute('data-t')].nome = inp.value.trim() || (inp.getAttribute('data-t') === '0' ? 'Meu time' : 'Adversário'); salvar(); pintar(); });
    });
    [].forEach.call(raiz.querySelectorAll('.mn-cab select'), function (s) {
      s.addEventListener('change', function () {
        /* troca a formação e recoloca todo mundo pelas posições de cada um */
        var t = E.times[+s.getAttribute('data-t')], antes = t.lugares.filter(Boolean);
        t.formacao = s.value; t.lugares = new Array(11).fill(null);
        antes.sort(function (a, b) { return a.pos === 'GOL' ? -1 : b.pos === 'GOL' ? 1 : 0; }).forEach(function (j) { colocar(j, +s.getAttribute('data-t')); });
        aviso = 'Formação ' + s.value + ' no ' + esc(t.nome) + '.'; salvar(); pintar();
      });
    });
    [].forEach.call(raiz.querySelectorAll('.mn-slot'), function (b) {
      b.addEventListener('click', function (e) {
        var ti = +b.getAttribute('data-t'), i = +b.getAttribute('data-i'), t = E.times[ti];
        if (e.target.getAttribute('data-tirar')) { aviso = esc(t.lugares[i].n) + ' saiu do ' + esc(t.nome) + '.'; t.lugares[i] = null; sel = null; salvar(); pintar(); return; }
        if (sel && sel.t === ti && sel.i !== i) {
          var x = t.lugares[sel.i]; t.lugares[sel.i] = t.lugares[i]; t.lugares[i] = x; sel = null; aviso = 'Trocados de lugar.'; salvar(); pintar(); return;
        }
        if (!t.lugares[i]) { E.ativo = ti; sel = null; aviso = 'Digite o jogador para essa posição (' + NOME_POS[slots(t)[i].pos].toLowerCase() + ').'; pintar(); document.getElementById('mn-q').focus(); return; }
        sel = sel && sel.t === ti && sel.i === i ? null : { t: ti, i: i };
        aviso = sel ? 'Agora toque na posição para onde ' + esc(t.lugares[i].n) + ' vai.' : ''; pintar();
      });
    });
    document.getElementById('mn-limpar').addEventListener('click', function () {
      var t = E.times[E.ativo]; if (!t.lugares.some(Boolean) || !confirm('Tirar todos os jogadores do ' + t.nome + '?')) return;
      t.lugares = new Array(11).fill(null); aviso = esc(t.nome) + ' zerado.'; salvar(); pintar();
    });
    document.getElementById('mn-link').addEventListener('click', function () {
      var cod = btoa(unescape(encodeURIComponent(JSON.stringify({ times: E.times, ativo: 0 })))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      var url = location.origin + location.pathname + '#t=' + cod;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { aviso = 'Link copiado. Mande para o seu amigo ver os dois times.'; pintar(); })
        .catch(function () { prompt('Copie o link:', url); });
    });
  }
  pintar();
})();
