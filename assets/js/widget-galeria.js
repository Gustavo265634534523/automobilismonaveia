/* Página widget.html: galeria de widgets para o iPhone (app Scriptable).
   Cada modelo tem prévia ao vivo (mesmos dados do widget: assets/dados/widget.json) e o botão "Usar este widget",
   que copia a configuração (ex.: tipo=sessoes;cat=f1) para colar no campo Parameter do widget.
   O desenho imita assets/widget/na-veia-iphone.js; ao mudar um, mude o outro. */
(function () {
  var esc = window.esc;
  var grade = document.getElementById('wg-grade');
  var D = null;
  var MODELOS = [
    { id: 'completo', nome: 'Próxima corrida', desc: 'Horários do fim de semana, contagem regressiva e o mapa da pista (F1).', cats: ['f1', 'motogp', 'stock'], tam: ['p', 'm', 'g'], ini: 'm' },
    { id: 'sessoes', nome: 'Próximas sessões', desc: 'As próximas sessões de uma categoria ou de todas, no horário de Brasília.', cats: ['todas', 'f1', 'motogp', 'stock'], tam: ['p', 'm', 'g'], ini: 'm' },
    { id: 'vencedores', nome: 'Últimos vencedores', desc: 'Quem venceu as últimas corridas, de uma categoria ou de todas.', cats: ['todas', 'f1', 'motogp', 'stock'], tam: ['p', 'm', 'g'], ini: 'm' },
    { id: 'classificacao', nome: 'Campeonato', desc: 'A classificação de pilotos (e de equipes, no grande).', cats: ['f1', 'motogp', 'stock'], tam: ['p', 'm', 'g'], ini: 'm' },
    { id: 'contagem', nome: 'Contagem regressiva', desc: 'Quanto falta para a próxima sessão.', cats: ['f1', 'motogp', 'stock'], tam: ['p', 'm'], ini: 'p' },
    { id: 'favorito', nome: 'Seu piloto', desc: 'Posição, pontos, diferença para o líder e o último resultado do seu piloto.', cats: ['f1', 'motogp', 'stock'], tam: ['p', 'm', 'g'], ini: 'm', fav: true },
    { id: 'mapa', nome: 'Mapa da pista', desc: 'A próxima pista da F1 com os setores e as curvas numeradas.', cats: ['f1'], tam: ['g'], ini: 'g' }
  ];
  var NOMES_CAT = { todas: 'Todas as categorias', f1: 'Fórmula 1', motogp: 'MotoGP', stock: 'Stock Car' };
  var SLUG = { f1: 'formula-1', motogp: 'motogp', stock: 'stock-car' };
  var SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
  function nomeCurto(n) { return String(n || '').replace(/^GP (de |do |da |dos |das )?/, ''); }
  function hora(h) { return h ? h.replace(':', 'h') : '—'; }
  function dataCurta(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : ''; }
  function dia(d) { return SEM[new Date(d + 'T12:00:00Z').getUTCDay()]; }
  function falta(iso) {
    var ms = Date.parse(iso) - Date.now(); if (ms <= 0) return 'agora';
    var h = Math.floor(ms / 36e5), mi = Math.floor(ms % 36e5 / 6e4);
    return 'em ' + (h >= 24 ? Math.floor(h / 24) + ' d ' + (h % 24) + ' h' : h ? h + ' h ' + mi + ' min' : mi + ' min');
  }
  function catDados(cat) { return cat === 'f1' || cat === 'todas' ? D : (D.categorias && D.categorias[SLUG[cat]]) || D; }
  function marca(extra) { return '<div class="mk">AUTOMOBILISMO<b>NA VEIA</b>' + (extra ? '<i>' + esc(extra) + '</i>' : '') + '</div>'; }
  function sessoesDe(cat) {
    var agora = Date.now();
    if (cat === 'todas') return (D.agenda || []).filter(function (x) { return Date.parse(x.iso) + 36e5 > agora; }).map(function (x) { return { rot: x.cat, t: x.t, etapa: x.etapa, iso: x.iso, d: x.d, h: x.h }; });
    var P = catDados(cat).proxima; if (!P) return [];
    return (P.sessoes || []).filter(function (s) { return Date.parse(s.iso) + 36e5 > agora; }).map(function (s) { return { rot: '', t: s.curto, etapa: P.n, iso: s.iso, d: s.d, h: s.h }; });
  }
  function mapaSvg(M, lado, curvas) {
    var CS = ['#e3343c', '#3fa9f5', '#f5c518'];
    var h = '<svg viewBox="0 0 400 400" width="' + lado + '" height="' + lado + '">' + (M.setores || [M.d]).map(function (d, i) { return '<path d="' + d + '" fill="none" stroke="' + (M.setores ? CS[i] : '#fff') + '" stroke-width="9" stroke-linejoin="round"/>'; }).join('');
    if (M.largada) h += '<circle cx="' + M.largada.p[0] + '" cy="' + M.largada.p[1] + '" r="8" fill="#fff"/>';
    if (curvas) h += (M.curvas || []).map(function (c) { return '<circle cx="' + c.t[0] + '" cy="' + c.t[1] + '" r="11" fill="#15171a"/><text x="' + c.t[0] + '" y="' + (c.t[1] + 5) + '" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">' + esc(c.n) + '</text>'; }).join('');
    return h + '</svg>';
  }

  /* ---------- prévias (iguais ao widget) ---------- */
  function previa(m, cat, tam, fav) {
    var C = catDados(cat), f1 = cat === 'f1', P = C.proxima, peq = tam === 'p', gr = tam === 'g', h = '';
    var agora = Date.now();
    if (m === 'sessoes') {
      var L = sessoesDe(cat), n = peq ? 3 : gr ? 11 : 5;
      h += marca(peq ? '' : NOMES_CAT[cat]) + '<div class="rt">Próximas sessões</div>';
      if (cat !== 'todas' && P && !peq) h += '<div class="sb">' + esc(nomeCurto(P.n)) + ' · horário de Brasília</div>';
      h += L.slice(0, n).map(function (s, i) { return '<div class="ln' + (i === 0 ? ' dest' : '') + '"><b>' + dia(s.d) + ' ' + hora(s.h) + '</b><span style="margin-left:0;color:' + (i ? '#8e979f' : '#fff') + '">' + esc((s.rot ? s.rot + ' · ' : '') + s.t + (cat === 'todas' && !peq ? ' · ' + nomeCurto(s.etapa) : '')) + '</span></div>'; }).join('') || '<div class="sb">Sem sessões nos próximos dias.</div>';
      if (L[0] && !peq) h += '<div class="sb" style="margin-top:3px">Começa <b style="color:#fff">' + falta(L[0].iso) + '</b></div>';
    } else if (m === 'vencedores') {
      var V = cat === 'todas' ? (D.vencedoresTodas || []) : (C.vencedores || []), nv = peq ? 3 : gr ? 8 : 3;
      h += marca(peq ? '' : NOMES_CAT[cat]) + '<div class="rt">Últimos vencedores</div>';
      h += V.slice(0, nv).map(function (v) { return '<div class="vc"><small>' + esc((v.cat ? v.cat + ' · ' : '') + nomeCurto(v.n) + ' · ' + dataCurta(v.d)) + '</small><b>' + esc(String(v.venc).replace(/\s*\(.+\)$/, '')) + '</b></div>'; }).join('');
    } else if (m === 'classificacao') {
      var nc = peq ? 4 : gr ? 10 : 5;
      h += marca(peq ? '' : NOMES_CAT[cat]) + '<div class="rt">Campeonato de pilotos</div>';
      h += (C.pilotos || []).slice(0, nc).map(function (x) { return '<div class="ln"><b style="color:#8e979f;width:14px">' + x.pos + '</b><i class="br" style="background:' + esc(x.cor) + '"></i><b>' + esc(peq ? x.sigla : String(x.nome).split(' e ')[0]) + '</b><span>' + x.pts + '</span></div>'; }).join('');
      if (gr && C.equipes && C.equipes.length) h += '<div class="rt">Equipes</div>' + C.equipes.slice(0, 3).map(function (x) { return '<div class="ln"><b style="color:#8e979f;width:14px">' + x.pos + '</b><i class="br" style="background:' + esc(x.cor) + '"></i><b>' + esc(x.nome) + '</b><span>' + x.pts + '</span></div>'; }).join('');
    } else if (m === 'contagem' || (m === 'completo' && peq)) {
      var s = sessoesDe(cat)[0];
      h += marca('') + '<div style="margin-top:auto"></div><div class="rt">' + esc(P ? (P.categoria + ' · ' + nomeCurto(P.n)) : NOMES_CAT[cat]) + '</div>';
      if (s) h += '<div class="ti">' + esc(s.t) + '</div><div class="sb" style="font-size:11px">' + dia(s.d) + ' · ' + hora(s.h) + ' (Brasília)</div><div style="font-size:' + (peq ? 14 : 18) + 'px;font-weight:800;margin-top:4px">' + falta(s.iso) + '</div>';
      else if (P) h += '<div class="ti">' + esc(nomeCurto(P.n)) + '</div><div class="sb">' + dataCurta(P.inicio) + ' · horários a confirmar</div>';
      h += '<div style="margin-top:auto"></div>';
    } else if (m === 'favorito') {
      var F = fav ? (C.pilotos || []).filter(function (x) { return semAcento(x.nome).indexOf(semAcento(fav)) > -1 || semAcento(x.sigla) === semAcento(fav); })[0] : null;
      h += marca(peq ? '' : NOMES_CAT[cat]) + '<div class="rt">Seu piloto</div>';
      if (!F) h += '<div class="ti" style="font-size:14px;margin-top:4px">' + (fav ? 'Não achei "' + esc(fav) + '"' : 'Digite o nome do piloto') + '</div>';
      else {
        h += '<div style="display:flex;gap:6px;margin-top:3px"><i class="br" style="height:34px;background:' + esc(F.cor) + '"></i><div><div class="ti" style="font-size:' + (peq ? 15 : 18) + 'px">' + esc(F.nome) + '</div><div class="sb">' + esc(F.equipe) + '</div></div></div>';
        h += '<div style="display:flex;gap:14px;margin-top:8px;' + (peq ? 'flex-direction:column;gap:4px' : '') + '"><div class="num">P' + F.pos + '<small>no campeonato</small></div><div class="num">' + F.pts + '<small>pts · ' + (F.dif ? 'a ' + F.dif + ' do líder' : 'líder') + '</small></div>' + (!peq && F.ult ? '<div class="num">' + esc(F.ult.res) + '<small>' + esc(F.ult.gp) + '</small></div>' : '') + '</div>';
        if (gr && P) { var s2 = sessoesDe(cat)[0]; h += '<div class="rt" style="margin-top:14px">Próxima etapa</div><div class="ti" style="font-size:15px">' + esc(nomeCurto(P.n)) + '</div>' + (s2 ? '<div class="sb" style="font-size:11px">' + esc(s2.t) + ' · ' + dia(s2.d) + ' ' + hora(s2.h) + ' · ' + falta(s2.iso) + '</div>' : ''); }
      }
    } else { /* completo e mapa */
      var ses = P ? P.sessoes || [] : [], prox = ses.filter(function (x) { return Date.parse(x.iso) > agora; })[0];
      h += marca('') + '<div class="lin2" style="margin-top:6px"><div><div class="rt" style="margin-top:0">' + esc(P ? P.categoria + ' · etapa ' + P.etapa + ' de ' + P.total : 'Temporada encerrada') + '</div>';
      if (P) {
        h += '<div class="ti">' + esc(nomeCurto(P.n)) + '</div><div class="sb">' + esc(P.local) + ' · horário de Brasília</div><div style="height:5px"></div>';
        h += ses.slice(-(gr ? 7 : 4)).map(function (x) { var feita = Date.parse(x.iso) + 36e5 < agora, eP = prox && x.iso === prox.iso; return '<div class="ln' + (feita ? ' apag' : eP ? ' dest' : '') + '"><b>' + esc(x.curto) + '</b><span style="color:inherit">' + x.dia + ' ' + hora(x.h) + '</span></div>'; }).join('');
        if (prox) h += '<div class="sb" style="margin-top:3px">' + esc(prox.t) + ' <b style="color:#fff">' + falta(prox.iso) + '</b></div>';
      }
      h += '</div><div style="flex:0 0 auto">';
      var M = f1 && P && P.mapa;
      if (M) h += mapaSvg(M, m === 'mapa' ? 165 : gr ? 150 : 118, gr);
      else if (C.ultima) h += '<div class="rt" style="margin-top:0">Última etapa</div><b style="font-size:11px">' + esc(nomeCurto(C.ultima.n)) + '</b>' + ((C.ultima.podio || []).map(function (x) { return '<div class="ln"><b style="color:#8e979f">P' + x.pos + '</b><b style="color:' + esc(x.cor) + '">' + esc(x.sigla) + '</b></div>'; }).join('') || '<div class="sb" style="max-width:120px;white-space:normal">' + esc(C.ultima.vencedor || '') + '</div>');
      h += '</div></div>';
      if (gr) {
        h += '<div class="lin2" style="margin-top:8px"><div><div class="rt">Campeonato</div>' + (C.pilotos || []).slice(0, 3).map(function (x) { return '<div class="ln"><i class="br" style="background:' + esc(x.cor) + '"></i><b>' + x.pos + '. ' + esc(String(x.nome).split(' e ')[0].split(' ').slice(-1)[0]) + '</b><span>' + x.pts + '</span></div>'; }).join('') + '</div>';
        if (f1 && C.ultima && C.ultima.podio) h += '<div><div class="rt">' + esc(nomeCurto(C.ultima.n)) + '</div>' + C.ultima.podio.map(function (x) { return '<div class="ln"><b style="color:#8e979f">P' + x.pos + '</b><b>' + esc(x.sigla) + '</b></div>'; }).join('') + '</div>';
        h += '</div><div class="rod"><span>automobilismonaveia.com.br</span></div>';
      }
    }
    return '<div class="ww ' + tam + '">' + h + '</div>';
  }

  /* ---------- cartões ---------- */
  function montar() {
    grade.innerHTML = MODELOS.map(function (m) {
      return '<article class="wg-card" data-m="' + m.id + '"><h2>' + m.nome + '</h2><p>' + m.desc + '</p><div class="wg-ctl">' +
        (m.cats.length > 1 ? '<select aria-label="Categoria" data-c>' + m.cats.map(function (c) { return '<option value="' + c + '">' + NOMES_CAT[c] + '</option>'; }).join('') + '</select>' : '') +
        (m.tam.length > 1 ? '<span class="wg-tam" role="group" aria-label="Tamanho">' + m.tam.map(function (t) { return '<button type="button" data-t="' + t + '" aria-pressed="' + (t === m.ini) + '">' + { p: 'Pequeno', m: 'Médio', g: 'Grande' }[t] + '</button>'; }).join('') + '</span>' : '') +
        (m.fav ? '<input type="text" data-f placeholder="Nome do piloto" value="Bortoleto" aria-label="Nome do piloto">' : '') +
        '</div><div class="wg-palco"></div><button type="button" class="wg-botao" data-usar>Usar este widget</button><p class="wg-msg" role="status"></p></article>';
    }).join('');
    [].forEach.call(grade.querySelectorAll('.wg-card'), atualizar);
  }
  function estado(card) {
    var m = MODELOS.filter(function (x) { return x.id === card.getAttribute('data-m'); })[0];
    var sel = card.querySelector('[data-c]'), tb = card.querySelector('[data-t][aria-pressed="true"]'), fi = card.querySelector('[data-f]');
    return { m: m, cat: sel ? sel.value : m.cats[0], tam: tb ? tb.getAttribute('data-t') : m.tam[0], fav: fi ? fi.value.trim() : '' };
  }
  function atualizar(card) {
    var e = estado(card);
    card.querySelector('.wg-palco').innerHTML = D ? previa(e.m.id, e.cat, e.tam, e.fav) : '<p class="sb">Carregando…</p>';
  }
  grade.addEventListener('change', function (ev) { var c = ev.target.closest('.wg-card'); if (c) atualizar(c); });
  grade.addEventListener('input', function (ev) { var c = ev.target.closest('.wg-card'); if (c && ev.target.hasAttribute('data-f')) atualizar(c); });
  grade.addEventListener('click', function (ev) {
    var c = ev.target.closest('.wg-card'); if (!c) return;
    var tb = ev.target.closest('[data-t]');
    if (tb) { [].forEach.call(c.querySelectorAll('[data-t]'), function (b) { b.setAttribute('aria-pressed', b === tb); }); atualizar(c); return; }
    if (ev.target.closest('[data-usar]')) {
      var e = estado(c), conf = 'tipo=' + e.m.id + ';cat=' + e.cat + (e.m.fav && e.fav ? ';fav=' + e.fav : '');
      var msg = c.querySelector('.wg-msg'), tamNome = { p: 'pequeno', m: 'médio', g: 'grande' }[e.tam];
      copiar(conf, function () { msg.textContent = 'Copiado! No iPhone: segure o widget (' + tamNome + ') › Editar widget › Parameter › Colar.'; }, function () { msg.textContent = 'Copie e cole no Parameter: ' + conf; });
    }
  });
  function copiar(t, ok, falhou) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, antigo); else antigo();
    function antigo() {
      var a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0';
      document.body.appendChild(a); a.select(); a.setSelectionRange(0, t.length);
      try { document.execCommand('copy'); ok(); } catch (e) { falhou(); }
      a.remove();
    }
  }
  /* código do widget (primeira vez) */
  var codigo = '';
  fetch('assets/widget/na-veia-iphone.js?v=' + Date.now()).then(function (r) { return r.text(); }).then(function (t) { codigo = t; }).catch(function () {});
  document.getElementById('wg-copiar').addEventListener('click', function () {
    var ok = document.getElementById('wg-ok');
    if (!codigo) { ok.textContent = 'Espere um segundo e toque de novo.'; return; }
    copiar(codigo, function () { ok.textContent = 'Código copiado! Agora abra o Scriptable (passo 3).'; }, function () { ok.textContent = 'Não deu para copiar. Recarregue a página e tente de novo.'; });
  });
  montar();
  fetch('assets/dados/widget.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (j) { D = j; [].forEach.call(grade.querySelectorAll('.wg-card'), atualizar); }).catch(function () {});
  setInterval(function () { if (D) [].forEach.call(grade.querySelectorAll('.wg-card'), atualizar); }, 60000);
})();
