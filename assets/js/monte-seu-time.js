/* Monte seu time (monte-seu-time.html): a pessoa monta o time dela e o do adversário no mesmo campo, só com jogadores
   em atividade. Digita o nome e aperta Enter: o jogador vai sozinho para a posição dele na formação escolhida.
   A busca usa os elencos atuais das principais ligas (assets/dados/jogadores-todos.js, robô .github/jogadores-espn.js);
   a lista de craques (assets/dados/jogadores-craques.js) só acerta a posição exata. Nome que não está nos elencos
   entra do jeito que foi digitado, numa vaga do meio-campo (ou na vaga que a pessoa tocou).
   Clicar num jogador do campo seleciona; clicar em outra posição troca os dois de lugar; o "x" tira do time.
   Os times ficam salvos neste aparelho e podem ser enviados por link. */
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
  var NOME_POS = { DEF: 'Defensor', MEIO: 'Meio-campista', ATA: 'Atacante', GOL: 'Goleiro', LD: 'Lateral direito', ZAG: 'Zagueiro', LE: 'Lateral esquerdo', VOL: 'Volante', MC: 'Meio-campo', MEI: 'Meia', PD: 'Ponta direita', PE: 'Ponta esquerda', CA: 'Centroavante' };
  /* se a posição do jogador já estiver ocupada, tenta as parecidas, nesta ordem */
  var PARECIDAS = { GOL: ['GOL'], LD: ['LD', 'ZAG', 'LE', 'VOL'], LE: ['LE', 'ZAG', 'LD', 'VOL'], ZAG: ['ZAG', 'VOL', 'LD', 'LE'], VOL: ['VOL', 'MC', 'ZAG', 'MEI'],
    MC: ['MC', 'VOL', 'MEI', 'PE', 'PD'], MEI: ['MEI', 'MC', 'PE', 'PD', 'CA'], PD: ['PD', 'PE', 'MEI', 'CA', 'MC'], PE: ['PE', 'PD', 'MEI', 'CA', 'MC'], CA: ['CA', 'PE', 'PD', 'MEI'],
    /* elencos da ESPN só dizem defensor, meio-campista ou atacante */
    DEF: ['ZAG', 'LD', 'LE', 'VOL'], MEIO: ['MC', 'VOL', 'MEI', 'PE', 'PD'], ATA: ['CA', 'PE', 'PD', 'MEI'] };

  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  /* foto do jogador: a guardada no site (craques, robô .github/fotos-jogadores.js) ou a que veio da busca */
  function chave(n) { return String(n).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function fotoDe(j) { var f = (window.FOTOS_JOGADORES || {})[chave(j.n)]; return f ? 'mosaico' : (j.foto || ''); }
  /* a foto: recorte do mosaico (craques) ou imagem da busca */
  function fotoHTML(j) {
    var f = (window.FOTOS_JOGADORES || {})[chave(j.n)], M = window.FOTOS_MOSAICO;
    if (f && M && f.i != null) {
      var c = f.i % M.colunas, l = Math.floor(f.i / M.colunas);
      return '<span class="mn-foto" style="background-image:url(' + M.src + ');background-size:' + (M.colunas * 100) + '% ' + (M.linhas * 100) + '%;background-position:' +
        (M.colunas > 1 ? c / (M.colunas - 1) * 100 : 0) + '% ' + (M.linhas > 1 ? l / (M.linhas - 1) * 100 : 0) + '%"></span>';
    }
    return j.foto ? '<img src="' + esc(j.foto) + '" alt="" loading="lazy" onerror="this.parentNode.classList.remove(\'mn-com-foto\');this.remove()">' : '';
  }
  /* só jogadores em atividade: a busca usa os elencos atuais (JOGADORES_TODOS); a lista de craques só acerta a
     posição exata de quem está nela (os elencos da ESPN dizem só defensor, meio-campista ou atacante) */
  var POS_EXATA = {}; (window.JOGADORES_CRAQUES || []).forEach(function (x) { var p = x.split('|'); POS_EXATA[norm(p[0])] = p[1]; });
  var CRAQUES = [], pronto = false;
  /* todos os jogadores atuais (elencos da ESPN, assets/dados/jogadores-todos.js): carregam depois da página */
  (function () {
    var tag = document.querySelector('script[src*="monte-seu-time.js"]'), v = tag ? (tag.src.split('?v=')[1] || '') : '';
    var sc = document.createElement('script'); sc.src = 'assets/dados/jogadores-todos.js' + (v ? '?v=' + v : '');
    sc.onload = function () {
      (window.JOGADORES_TODOS || []).forEach(function (x) {
        var p = x.split('|'), k = norm(p[0]);
        CRAQUES.push({ n: p[0], pos: POS_EXATA[k] || p[1], time: p[2], id: p[3], k: k, cr: POS_EXATA[k] ? 1 : 0 });
      });
      pronto = true;
    };
    sc.onerror = function () { pronto = true; };
    document.body.appendChild(sc);
  })();

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

  var aviso = '', alvo = null; /* vaga vazia que a pessoa tocou: o próximo jogador vai para ela */
  function colocar(j, ti) {
    var t = E.times[ti], S = slots(t);
    if (alvo && alvo.t === ti && !t.lugares[alvo.i] && !t.lugares.some(function (x) { return x && norm(x.n) === norm(j.n); })) {
      var a = alvo.i; alvo = null;
      t.lugares[a] = { n: j.n, pos: j.pos || S[a].pos, foto: j.foto || '' };
      aviso = esc(j.n) + ' entrou como ' + NOME_POS[S[a].pos].toLowerCase() + ' no ' + esc(t.nome) + '.'; salvar(); return true;
    }
    if (t.lugares.some(function (x) { return x && norm(x.n) === norm(j.n); })) { aviso = esc(j.n) + ' já está no ' + esc(t.nome) + '.'; return false; }
    var ordem = PARECIDAS[j.pos] || [], i = -1;
    ordem.some(function (p) { i = S.findIndex(function (s, k) { return s.pos === p && !t.lugares[k]; }); return i > -1; });
    /* nome desconhecido: entra pelo meio, deixando goleiro e centroavante por último (para quem tem posição certa) */
    if (i < 0 && !j.pos) ['MC', 'MEI', 'VOL', 'ZAG', 'LE', 'LD', 'PE', 'PD', 'CA', 'GOL'].some(function (p) { i = S.findIndex(function (s, k) { return s.pos === p && !t.lugares[k]; }); return i > -1; });
    if (i < 0 && j.pos !== 'GOL') i = S.findIndex(function (s, k) { return s.pos !== 'GOL' && !t.lugares[k]; });
    if (i < 0) { aviso = j.pos === 'GOL' ? 'O ' + esc(t.nome) + ' já tem goleiro. Tire o atual para trocar.' : 'O ' + esc(t.nome) + ' já está completo. Tire alguém para colocar ' + esc(j.n) + '.'; return false; }
    t.lugares[i] = { n: j.n, pos: j.pos || S[i].pos, foto: j.foto || '' };
    aviso = esc(j.n) + ' entrou como ' + NOME_POS[S[i].pos].toLowerCase() + ' no ' + esc(t.nome) + '.' + (j.pos ? '' : ' Para mudar de posição, toque nele e depois na vaga certa.');
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
          '<i' + (j && fotoDe(j) ? ' class="mn-com-foto"' : '') + '>' + (j ? fotoHTML(j) + esc(iniciais(j.n)) : '+') + '</i>' +
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
        '<div class="mn-campo-busca"><input id="mn-q" type="search" placeholder="Digite um jogador e aperte Enter (ex.: Haaland, Vini Jr., Yamal)" aria-label="Buscar jogador"><button type="submit">Colocar</button>' +
        '<ul class="mn-sug" id="mn-sug" hidden></ul></div></form>' +
      '<p class="mn-aviso" id="mn-aviso" role="status">' + aviso + '</p>' +
      '<div class="pt-rotulos"><span>' + esc(t0.nome) + ' · ' + t0.formacao + '</span><span>' + esc(t1.nome) + ' · ' + t1.formacao + '</span></div>' +
      '<div class="pt-gramado mn-gramado">' + metade(0) + metade(1) + '</div>' +
      '<p class="mn-dica">Toque num jogador e depois em outra posição do mesmo time para trocar os dois de lugar. O × tira do time.</p>' +
      creditos() +
      '<div class="mn-acoes"><button type="button" class="ft-btn" id="mn-link">Copiar link dos times</button><button type="button" class="ft-btn ft-btn-linha" id="mn-limpar">Limpar ' + esc(E.times[E.ativo].nome) + '</button></div>';
    ligar();
  }

  function creditos() {
    var F = window.FOTOS_JOGADORES || {}, usados = [];
    E.times.forEach(function (t) { t.lugares.forEach(function (j) { var f = j && F[chave(j.n)]; if (f && f.arq && usados.indexOf(f) < 0) usados.push(f); }); });
    var temOutras = E.times.some(function (t) { return t.lugares.some(function (j) { return j && j.foto && !F[chave(j.n)]; }); });
    if (!usados.length && !temOutras) return '';
    return '<details class="mn-creditos"><summary>Fotos dos jogadores: Wikipédia e Wikimedia Commons (licenças livres)</summary><p>' +
      usados.map(function (f) { return '<a href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(f.arq) + '" target="_blank" rel="noopener">' + esc(f.pagina || f.arq) + '</a>'; }).join(' · ') +
      (temOutras ? (usados.length ? ' · ' : '') + 'as demais fotos vêm da página do jogador na Wikipédia.' : '') + '</p></details>';
  }

  /* ---------- busca ---------- */
  var sugestoes = [], marc = -1, pedido = 0;
  function locais(q) {
    var k = norm(q); if (k.length < 2) return [];
    return CRAQUES.filter(function (c) { return c.k.indexOf(k) > -1 || c.k.split(' ').some(function (w) { return w.indexOf(k) === 0; }); })
      .map(function (c) { return { c: c, nota: c.k === k ? 0 : (' ' + c.k + ' ').indexOf(' ' + k + ' ') > -1 ? 1 : c.k.indexOf(k) === 0 ? 2 : (' ' + c.k).indexOf(' ' + k) > -1 ? 3 : 4 }; })
      .sort(function (a, b) { return (a.nota > 3) - (b.nota > 3) || (b.c.cr || 0) - (a.c.cr || 0) || a.nota - b.nota || a.c.n.length - b.c.n.length; }).slice(0, 8)
      .map(function (x) { var c = x.c; return { n: c.n, pos: c.pos, foto: c.id ? 'https://a.espncdn.com/i/headshots/soccer/players/full/' + c.id + '.png' : '', desc: (c.time ? c.time + ' · ' : '') + NOME_POS[c.pos] }; });
  }
  function mostrar(lista) {
    var ul = document.getElementById('mn-sug'); if (!ul) return;
    sugestoes = lista; marc = lista.length ? 0 : -1;
    ul.hidden = !lista.length;
    ul.innerHTML = lista.map(function (s, i) {
      return '<li role="option" data-i="' + i + '" aria-selected="' + (i === marc) + '"><b>' + esc(s.n) + '</b><span>' + esc(s.desc || '') + '</span><em>' + esc(({ DEF: 'DEF', MEIO: 'MEI', ATA: 'ATA' })[s.pos] || s.pos || '') + '</em></li>';
    }).join('');
    [].forEach.call(ul.children, function (li) { li.addEventListener('mousedown', function (e) { e.preventDefault(); escolher(sugestoes[+li.getAttribute('data-i')]); }); });
  }
  function comTempo(p, ms) { return Promise.race([p, new Promise(function (ok, erro) { setTimeout(function () { erro(new Error('tempo')); }, ms); })]); }
  function fotoWikipedia(nome) {
    var u = function (l) { return 'https://' + l + '.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=3&gsrnamespace=0&prop=pageimages|description&piprop=thumbnail&pithumbsize=160&gsrsearch=' + encodeURIComponent(nome + (l === 'en' ? ' footballer' : ' futebolista')); };
    function pega(l) {
      return comTempo(fetch(u(l)).then(function (r) { return r.json(); }), 4000).then(function (r) {
        var ps = r && r.query && r.query.pages ? Object.keys(r.query.pages).map(function (k) { return r.query.pages[k]; }).sort(function (a, b) { return a.index - b.index; }) : [];
        var p = ps.filter(function (x) { return x.thumbnail && /futebol|football|soccer|goleiro|goalkeeper/i.test(x.description || ''); })[0];
        return p ? p.thumbnail.source : '';
      });
    }
    return pega('pt').then(function (f) { return f || pega('en'); }).catch(function () { return ''; });
  }
  function escolher(j) {
    if (!j) return;
    var ti = E.ativo, ok = colocar(j, ti); pintar();
    if (ok && !fotoDe(j)) fotoWikipedia(j.n).then(function (f) {
      if (!f) return;
      E.times[ti].lugares.forEach(function (x) { if (x && x.n === j.n && !x.foto) x.foto = f; });
      salvar(); pintar();
    });
    var q = document.getElementById('mn-q'); if (q) q.focus();
  }
  function buscar(q, entao) {
    var lista = locais(q);
    mostrar(lista);
    if (entao) {
      if (pronto) entao(lista);
      else setTimeout(function () { buscar(q, entao); }, 300); /* os elencos ainda estão chegando */
    }
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
      var bate = function (s) { return s && norm(s.n).indexOf(norm(v)) > -1; };
      if (marc > -1 && bate(sugestoes[marc])) { escolher(sugestoes[marc]); return; }
      document.getElementById('mn-aviso').textContent = 'Procurando ' + v + '…';
      buscar(v, function (lista) {
        var achou = lista.filter(bate)[0];
        /* não achou ninguém com esse nome: entra o nome do jeito que foi digitado */
        escolher(achou || { n: v.replace(/\s+/g, ' ').replace(/(^|\s)\S/g, function (x) { return x.toUpperCase(); }) });
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
        if (sel && sel.t === ti && !t.lugares[i]) { t.lugares[i] = t.lugares[sel.i]; t.lugares[sel.i] = null; sel = null; aviso = 'Mudou de posição.'; salvar(); pintar(); return; }
        if (!t.lugares[i]) { E.ativo = ti; sel = null; alvo = { t: ti, i: i }; aviso = 'Digite o jogador para essa posição (' + NOME_POS[slots(t)[i].pos].toLowerCase() + ').'; pintar(); document.getElementById('mn-q').focus(); return; }
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
