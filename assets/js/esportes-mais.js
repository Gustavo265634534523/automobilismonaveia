/* Peças do futebol e do basquete que várias páginas usam. Carregar depois de esportes-dados.js, noticias-esportes.js,
   escudos.js e ao-vivo.js, e antes de competicao.js e futebol.js.
   1. junta o placar automático (assets/dados/ao-vivo.js, robô .github/placar.js) aos dados escritos à mão;
   2. placar ao vivo no navegador: enquanto há jogo rolando, pergunta à ESPN a cada minuto;
   3. página de cada time (time.html?t=...) e o "meu time" (fica guardado neste aparelho);
   4. onde assistir (assets/js/onde-assistir-dados.js);
   5. chaveamento do mata-mata e dos playoffs, líderes de estatística e cartões do mercado. */
(function () {
  var COMPS = window.COMPETICOES || [], esc = window.esc;
  var PORSLUG = {}; COMPS.forEach(function (c) { PORSLUG[c.slug] = c; });
  var AV = window.AO_VIVO || null;
  var ESPORTE_DE = {}; COMPS.forEach(function (c) { ESPORTE_DE[c.slug] = c.esporte; });

  function ordem(a, b) { var x = (a.d || '9999') + (a.h || '99'), y = (b.d || '9999') + (b.h || '99'); return x < y ? -1 : x > y ? 1 : 0; }
  function perto(a, b) { return !a || !b || Math.abs(Date.parse(a) - Date.parse(b)) <= 2 * 864e5; }
  var indef = /^(a definir|vencedor|perdedor|a confirmar)/i;

  /* 1. placar automático por cima dos dados à mão */
  if (AV && AV.comps) COMPS.forEach(function (c) {
    var v = AV.comps[c.slug]; if (!v) return;
    var antigos = c.jogos || [];
    var novos = (v.jogos || []).map(function (j) {
      var m = antigos.filter(function (a) { return a.casa === j.casa && a.fora === j.fora && perto(a.d, j.d); })[0];
      var n = {}; for (var k in j) n[k] = j[k];
      if (m) { if (m.fase) n.fase = m.fase; if (m.l) n.l = m.l; }
      return n;
    });
    var fica = antigos.filter(function (a) {
      if (novos.some(function (n) { return n.casa === a.casa && n.fora === a.fora && perto(a.d, n.d); })) return false;
      return !a.d || a.d < v.de || a.d > v.ate || indef.test(a.casa) || indef.test(a.fora);
    });
    c.jogos = fica.concat(novos).sort(ordem);
    if (v.tabela) {
      var hora = AV.atualizado ? new Date(AV.atualizado) : null;
      var nota = 'Atualizada automaticamente' + (hora ? ' em ' + hora.toLocaleDateString('pt-BR') + ', ' + hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '') + '. Fonte: ESPN.';
      if (c.esporte === 'basquete') {
        c.tabela = { titulo: 'Conferência Leste: temporada ' + c.temporada, colunas: v.tabela.colunas, linhas: v.tabela.linhas, nota: nota };
        if (v.tabela2) c.tabela2 = { titulo: 'Conferência Oeste: temporada ' + c.temporada, colunas: v.tabela2.colunas, linhas: v.tabela2.linhas, nota: nota };
        var lL = v.tabela.linhas[0], lO = v.tabela2 && v.tabela2.linhas[0];
        var melhor = lO && +lO[2].split('-')[0] - +lO[2].split('-')[1] > +lL[2].split('-')[0] - +lL[2].split('-')[1] ? [lO, 'Oeste'] : [lL, 'Leste'];
        if (!/^atual/i.test(c.lider.info) || c.jogos.some(function (j) { return j.p; })) c.lider = { nome: melhor[0][1], info: 'Melhor campanha da liga: ' + melhor[0][2] + ' (vitórias e derrotas), 1º do ' + melhor[1] + '.' };
      } else {
        var titulo = c.slug === 'champions-league' ? 'Fase de liga' : 'Classificação';
        var l1 = v.tabela.linhas[0], l2 = v.tabela.linhas[1];
        c.tabela = { titulo: titulo + ' após ' + l1[3] + ' jogos do líder', colunas: v.tabela.colunas, linhas: v.tabela.linhas, nota: nota };
        c.lider = { nome: l1[1], info: l1[2] + ' pontos em ' + l1[3] + ' jogos' + (l2 ? (l1[2] === l2[2] ? ', empatado em pontos com o ' + l2[1] : ', ' + (l1[2] - l2[2]) + (l1[2] - l2[2] === 1 ? ' ponto' : ' pontos') + ' à frente do ' + l2[1]) : '') + '.' };
      }
    }
  });
  if (AV && AV.atualizado) {
    var t = new Date(AV.atualizado);
    window.ESPORTES_ATUALIZADO = t.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) + ', às ' + t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (placar automático)';
  }

  /* 2. placar ao vivo: jogos de hoje que já começaram ou começam nos próximos 15 minutos */
  var ouvintes = [];
  window.aoMudarPlacar = function (fn) { ouvintes.push(fn); };
  function inicio(j) { return j.d && j.h ? Date.parse(j.d + 'T' + j.h + ':00-03:00') : 0; }
  function rolando(j) { var t = inicio(j), agora = Date.now(); return j.vivo || (!j.p && t && agora > t - 15 * 60e3 && agora < t + 3 * 3600e3); }
  window.jogoRolando = rolando;
  function ligasAgora() {
    var ligas = {};
    COMPS.forEach(function (c) { var v = AV && AV.comps && AV.comps[c.slug]; if (v && v.liga && (c.jogos || []).some(rolando)) ligas[v.liga] = c; });
    return ligas;
  }
  function atualizar() {
    var ligas = ligasAgora(), lista = Object.keys(ligas);
    if (!lista.length || document.hidden) return;
    Promise.all(lista.map(function (liga) {
      return fetch('https://site.api.espn.com/apis/site/v2/sports/' + liga + '/scoreboard').then(function (r) { return r.json(); }).then(function (r) {
        var c = ligas[liga], mudou = false;
        (r.events || []).forEach(function (ev) {
          var j = (c.jogos || []).filter(function (x) { return x.id === ev.id; })[0]; if (!j) return;
          var comp = ev.competitions[0], tipo = (ev.status || {}).type || {};
          var ca = comp.competitors.filter(function (x) { return x.homeAway === 'home'; })[0], fo = comp.competitors.filter(function (x) { return x.homeAway === 'away'; })[0];
          var p = (ca.score || '0') + ' x ' + (fo.score || '0');
          var antes = JSON.stringify([j.p, j.vivo]);
          if (tipo.state === 'in') { j.vivo = { p: p, min: tipo.shortDetail || '' }; delete j.p; }
          else if (tipo.state === 'post' && tipo.completed) { j.p = p; delete j.vivo; }
          if (antes !== JSON.stringify([j.p, j.vivo])) mudou = true;
        });
        return mudou;
      }).catch(function () { return false; });
    })).then(function (r) { if (r.some(Boolean)) ouvintes.forEach(function (fn) { try { fn(); } catch (e) { /* segue */ } }); });
  }
  if (AV) { setTimeout(atualizar, 1500); setInterval(atualizar, 60e3); }

  /* 3. times */
  var slugTime = window.slugTime = function (n) { return String(n).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  window.linkTime = function (n) { return 'time.html?t=' + slugTime(n); };
  /* todos os times do site, com o esporte e os campeonatos de cada um */
  var TIMES = {};
  COMPS.forEach(function (c) {
    function add(n) {
      if (!n || indef.test(n) || /^(sem campe|-$)/i.test(n)) return;
      var k = c.esporte + ':' + n;
      if (!TIMES[k]) TIMES[k] = { nome: n, esporte: c.esporte, slug: slugTime(n), comps: [] };
      if (TIMES[k].comps.indexOf(c.slug) < 0) TIMES[k].comps.push(c.slug);
    }
    (c.jogos || []).forEach(function (j) { add(j.casa); add(j.fora); });
    [c.tabela, c.tabela2].forEach(function (t) { if (!t) return; var i = t.colunas.indexOf('Time'); if (i > -1) t.linhas.forEach(function (l) { add(l[i]); }); });
  });
  window.todosTimes = function (esporte) {
    return Object.keys(TIMES).map(function (k) { return TIMES[k]; }).filter(function (t) { return !esporte || t.esporte === esporte; })
      .sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt'); });
  };
  window.acharTime = function (slug) { for (var k in TIMES) if (TIMES[k].slug === slug) return TIMES[k]; return null; };
  /* palavras que identificam o time nas notícias (Lakers, PSG, Bragantino...) */
  var APELIDOS = { 'Paris Saint-Germain': ['PSG'], 'Red Bull Bragantino': ['Bragantino'], 'Bayern de Munique': ['Bayern'], 'Inter de Milão': ['Inter'], 'Atlético de Madrid': ['Atlético de Madrid', 'Atleti'],
    'Manchester City': ['City'], 'Manchester United': ['United'], 'Olympique de Marselha': ['Olympique', 'Marselha'], 'Sesi Franca': ['Franca'], 'CAIXA/Brasília': ['Brasília'], 'Minas Storm': ['Minas'] };
  function termos(t) {
    var l = [t.nome].concat(APELIDOS[t.nome] || []);
    if (t.esporte === 'basquete' && (t.comps.indexOf('nba') > -1)) l.push(t.nome.split(' ').pop()); /* Lakers, Celtics */
    return l;
  }
  function citado(texto, t) {
    return termos(t).some(function (p) { return new RegExp('(^|[^\\wÀ-ú])' + p.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '($|[^\\wÀ-ú])').test(texto); });
  }
  window.infoTime = function (t) {
    var jogos = [], pos = [];
    COMPS.forEach(function (c) {
      if (c.esporte !== t.esporte) return;
      (c.jogos || []).forEach(function (j) { if (j.casa === t.nome || j.fora === t.nome) jogos.push({ c: c, j: j }); });
      [c.tabela, c.tabela2].forEach(function (tb) {
        if (!tb) return; var i = tb.colunas.indexOf('Time'); if (i < 0) return;
        var l = tb.linhas.filter(function (x) { return x[i] === t.nome; })[0];
        if (l) pos.push({ c: c, tabela: tb, linha: l, total: tb.linhas.length });
      });
    });
    jogos.sort(function (a, b) { return ordem(a.j, b.j); });
    var nots = (window.NOTICIAS_ESPORTES || []).filter(function (n) { return n.esporte === t.esporte && citado(n.t + ' ' + n.x, t); })
      .sort(function (a, b) { return a.d < b.d ? 1 : -1; });
    var merc = (window.MERCADO || []).filter(function (m) { return m.de === t.nome || m.para === t.nome; });
    return { jogos: jogos, feitos: jogos.filter(function (x) { return x.j.p; }), proximos: jogos.filter(function (x) { return !x.j.p && x.j.d && x.j.d >= window.hojeISO(); }), pos: pos, nots: nots, merc: merc };
  };

  /* meu time (um por esporte), guardado neste aparelho */
  var CHAVE = 'naveia-meu-time';
  function lerMeus() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  window.meuTime = function (esporte) { var n = lerMeus()[esporte]; return n ? window.acharTime(slugTime(n)) : null; };
  window.marcarMeuTime = function (esporte, nome) {
    var m = lerMeus(); if (nome) m[esporte] = nome; else delete m[esporte];
    try { localStorage.setItem(CHAVE, JSON.stringify(m)); } catch (e) { /* modo privado */ }
    document.dispatchEvent(new CustomEvent('naveia:meu-time'));
  };

  /* 4. onde assistir */
  window.canais = function (slug, max) {
    var c = ((window.ONDE_ASSISTIR || {}).cats || {})[slug];
    if (!c) return '';
    var l = c.canais.map(function (x) { return x[0]; });
    return l.slice(0, max || 3).join(', ') + ((max || 3) >= 3 && l.length > (max || 3) ? ' e +' + (l.length - (max || 3)) : ''); /* nas listas (2 canais), sem o "e +2" */
  };
  var TV = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg>';
  window.tvLinha = function (slug, max) { var t = window.canais(slug, max); return t ? '<span class="em-tv">' + TV + '<span>' + esc(t) + '</span></span>' : ''; };

  /* status curto de um jogo (ao vivo, encerrado, horário) */
  window.statusJogo = function (j) {
    if (j.vivo || rolando(j)) return '<span class="em-vivo"><i aria-hidden="true"></i>Ao vivo' + (j.vivo && j.vivo.min ? ' · ' + esc(j.vivo.min) : '') + '</span>';
    if (j.p) return 'Encerrado' + (j.pen ? ' (pên. ' + esc(j.pen) + ')' : '');
    if (j.adiado) return 'Adiado';
    return j.h ? esc(j.h) : 'Horário a confirmar';
  };
  window.placarJogo = function (j) { return j.vivo ? j.vivo.p : j.p || ''; };

  /* linha de jogo usada no ao vivo, no fim de semana e na página do time */
  window.linhaJogo = function (x, mostrarComp) {
    var j = x.j, pl = String(window.placarJogo(j)).split(/\s*x\s*/), tem = !!window.placarJogo(j);
    return '<li class="em-jogo' + (j.vivo ? ' vivo' : '') + '">' +
      (mostrarComp ? '<a class="em-comp" href="' + x.c.slug + '.html#jogos">' + esc(x.c.menu) + (j.fase ? ' · ' + esc(j.fase) : '') + '</a>' : '') +
      '<a class="em-time em-casa" href="' + window.linkTime(j.casa) + '">' + esc(j.casa) + window.escudoTime(j.casa) + '</a>' +
      '<span class="em-placar">' + (tem ? esc(pl[0]) + '<i>–</i>' + esc(pl[1] || '') : '<i>x</i>') + '</span>' +
      '<a class="em-time" href="' + window.linkTime(j.fora) + '">' + window.escudoTime(j.fora) + esc(j.fora) + '</a>' +
      '<span class="em-st">' + window.statusJogo(j) + (!j.p && !j.vivo ? window.tvLinha(x.c.slug, 2) : '') + '</span></li>';
  };

  /* bloco "ao vivo e hoje" de um esporte (ou dos dois): jogos de hoje; sem jogo hoje, os próximos */
  window.blocoAoVivo = function (el, esporte) {
    if (!el) return;
    function pintar() {
      var hoje = window.hojeISO(), todos = [];
      COMPS.forEach(function (c) { if (esporte && c.esporte !== esporte) return; (c.jogos || []).forEach(function (j) { if (j.casa && j.fora && !indef.test(j.casa)) todos.push({ c: c, j: j }); }); });
      var deHoje = todos.filter(function (x) { return x.j.d === hoje; });
      var peso = function (x) { return x.j.vivo || rolando(x.j) ? 0 : !x.j.p ? 1 : 2; };
      deHoje.sort(function (a, b) { return peso(a) - peso(b) || ordem(a.j, b.j); });
      var vivos = deHoje.filter(function (x) { return x.j.vivo || rolando(x.j); }).length;
      var prox = todos.filter(function (x) { return !x.j.p && x.j.d > hoje; }).sort(function (a, b) { return ordem(a.j, b.j); });
      var dia = prox[0] && prox[0].j.d, doDia = prox.filter(function (x) { return x.j.d === dia; });
      el.innerHTML = '<div class="em-vivo-cab"><h2>' + (vivos ? '<span class="em-vivo"><i aria-hidden="true"></i>' + vivos + (vivos > 1 ? ' jogos' : ' jogo') + ' ao vivo</span>' : deHoje.length ? 'Jogos de hoje' : 'Próximos jogos') + '</h2>' +
        '<a class="em-mais" href="fim-de-semana.html">Agenda do fim de semana →</a></div>' +
        (deHoje.length ? '<ul class="em-jogos">' + deHoje.slice(0, 6).map(function (x) { return window.linhaJogo(x, true); }).join('') + '</ul>'
          : doDia.length ? '<p class="em-dia">' + esc(window.quando(dia)) + ', ' + window.dataCurta(dia) + '</p><ul class="em-jogos">' + doDia.slice(0, 6).map(function (x) { return window.linhaJogo(x, true); }).join('') + '</ul>'
            : '<p class="ft-vazio">Sem jogos marcados nos próximos dias.</p>') +
        '<p class="em-fonte">' + (AV ? 'Placar atualizado sozinho' + (vivos ? ' a cada minuto' : '') + '. Horários de Brasília.' : 'Horários de Brasília.') + '</p>';
    }
    pintar();
    window.aoMudarPlacar(pintar);
  };

  /* cartão do meu time (página do esporte e página inicial) */
  /* soQuemEscolheu: na página inicial, o cartão só aparece para quem já escolheu um time */
  window.blocoMeuTime = function (el, esporte, soQuemEscolheu) {
    if (!el) return;
    function pintar() {
      var t = window.meuTime(esporte);
      if (!t) {
        /* convite discreto, numa linha só */
        el.innerHTML = soQuemEscolheu ? '' : '<button type="button" class="mt-convite" data-mt-escolher><span aria-hidden="true">☆</span> Escolha seu time ' + (esporte === 'basquete' ? 'de basquete' : 'de futebol') + ' para ver os jogos dele primeiro</button>';
      } else {
        var i = window.infoTime(t), px = i.proximos[0], ul = i.feitos[i.feitos.length - 1], p = i.pos[0];
        el.innerHTML = '<div class="mt-cartao">' +
          '<a class="mt-id" href="' + window.linkTime(t.nome) + '">' + window.escudoTime(t.nome, 'mt-escudo') + '<span><small>Meu time</small><b>' + esc(t.nome) + '</b>' +
            (p ? '<em>' + esc(p.linha[0]) + 'º ' + (p.c.tabela2 ? 'na conferência' : 'no ' + esc(p.c.menu)) + '</em>' : '') + '</span></a>' +
          '<div class="mt-info">' +
            '<div><small>Próximo jogo</small>' + (px ? '<b>' + esc(px.j.casa) + ' x ' + esc(px.j.fora) + '</b><span>' + esc(window.quando(px.j.d)) + ', ' + window.dataCurta(px.j.d) + (px.j.h ? ' · ' + esc(px.j.h) : '') + ' · ' + esc(px.c.menu) + '</span>' + window.tvLinha(px.c.slug, 3) : '<b>A confirmar</b>') + '</div>' +
            '<div><small>Último resultado</small>' + (ul ? '<b>' + esc(ul.j.casa) + ' ' + esc(ul.j.p) + ' ' + esc(ul.j.fora) + '</b><span>' + esc(ul.c.menu) + (ul.j.d ? ', ' + window.dataCurta(ul.j.d) : '') + '</span>' : '<b>—</b>') + '</div>' +
            (i.nots[0] ? '<div class="mt-not"><small>Última notícia</small><a href="' + window.linkTime(t.nome) + '#noticias">' + esc(i.nots[0].t) + '</a></div>' : '') +
          '</div><div class="mt-acoes"><a class="ft-btn" href="' + window.linkTime(t.nome) + '">Página do time</a><button type="button" class="mt-trocar" data-mt-escolher>Trocar</button></div></div>';
      }
    }
    el.addEventListener('click', function (e) { if (e.target.closest('[data-mt-escolher]')) window.escolherTime(esporte); });
    document.addEventListener('naveia:meu-time', pintar);
    pintar();
  };

  /* janela para escolher o time: escudos por campeonato e busca */
  window.escolherTime = function (esporte) {
    var d = document.getElementById('mt-janela');
    if (!d) { d = document.createElement('dialog'); d.id = 'mt-janela'; d.className = 'mt-janela'; document.body.appendChild(d); }
    var grupos = COMPS.filter(function (c) { return c.esporte === esporte; }).map(function (c) {
      var ts = window.todosTimes(esporte).filter(function (t) { return t.comps[0] === c.slug; });
      return ts.length ? '<h3>' + esc(c.menu) + '</h3><div class="mt-grade">' + ts.map(function (t) {
        return '<button type="button" data-time="' + esc(t.nome) + '" data-busca="' + esc(slugTime(t.nome)) + '">' + window.escudoTime(t.nome) + '<span>' + esc(t.nome) + '</span></button>';
      }).join('') + '</div>' : '';
    }).join('');
    d.innerHTML = '<div class="mt-j-cab"><h2>Escolha o seu time' + (esporte === 'basquete' ? ' de basquete' : ' de futebol') + '</h2><button type="button" class="mt-fechar" aria-label="Fechar">×</button></div>' +
      '<input type="search" class="mt-busca" placeholder="Buscar time" aria-label="Buscar time"><div class="mt-lista">' + grupos + '</div>' +
      (window.meuTime(esporte) ? '<p class="mt-tirar"><button type="button" data-time="">Não quero time favorito</button></p>' : '');
    d.onclick = function (e) {
      if (e.target === d || e.target.closest('.mt-fechar')) { d.close(); return; }
      var b = e.target.closest('[data-time]'); if (!b) return;
      window.marcarMeuTime(esporte, b.getAttribute('data-time')); d.close();
    };
    d.querySelector('.mt-busca').oninput = function () {
      var q = slugTime(this.value);
      [].forEach.call(d.querySelectorAll('.mt-grade button'), function (b) { b.hidden = q && b.getAttribute('data-busca').indexOf(q) < 0; });
      [].forEach.call(d.querySelectorAll('.mt-lista h3'), function (h) { h.hidden = ![].some.call(h.nextElementSibling.children, function (b) { return !b.hidden; }); });
    };
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  };

  /* 5. chaveamento: colunas por fase; cada confronto com os dois times, o placar e quem passou */
  function lado(nome, seed, gols, vence) {
    var def = !nome || indef.test(nome);
    return '<div class="ch-lado' + (vence ? ' vence' : '') + (def ? ' indef' : '') + '">' + (seed ? '<i class="ch-seed">' + esc(seed) + '</i>' : '') +
      (def ? '<span class="ch-nome">' + esc(nome || 'A definir') + '</span>' : '<a class="ch-nome" href="' + window.linkTime(nome) + '">' + window.escudoTime(nome) + '<span>' + esc(nome) + '</span></a>') +
      '<b>' + esc(gols == null ? '' : gols) + '</b></div>';
  }
  function soma(x) {
    /* placar agregado de ida e volta, do ponto de vista de "a" (mandante da ida) */
    var i = String(x.ida || '').split(/\s*x\s*/), v = String(x.volta || '').split(/\s*x\s*/);
    if (i.length < 2) return null;
    var a = +i[0], b = +i[1];
    if (v.length === 2 && v[0] !== '') { a += +v[1]; b += +v[0]; }
    return [a, b];
  }
  function confrontoHTML(x) {
    if (x.res != null || x.sa != null) { /* série de basquete */
      var r = String(x.res || '').split('-');
      return '<div class="ch-conf">' + lado(x.a, x.sa, r[0], x.vence && x.vence === x.a) + lado(x.b, x.sb, r[1], x.vence && x.vence === x.b) +
        (x.info ? '<small>' + esc(x.info) + '</small>' : '') + '</div>';
    }
    var s = x.unico ? String(x.unico).split(/\s*x\s*/) : soma(x);
    var det = x.unico ? 'Jogo único: ' + esc(x.unico) : [x.ida ? 'Ida ' + esc(x.ida) : '', x.volta ? 'volta ' + esc(x.volta) : ''].filter(Boolean).join(', ');
    return '<div class="ch-conf">' + lado(x.a, null, s ? s[0] : null, x.vence && x.vence === x.a) + lado(x.b, null, s ? s[1] : null, x.vence && x.vence === x.b) +
      ((det || x.pen || x.info) ? '<small>' + det + (x.pen ? ' · pênaltis ' + esc(x.pen) : '') + (x.info ? (det ? ' · ' : '') + esc(x.info) : '') + '</small>' : '') + '</div>';
  }
  /* chaveamento organizado por etapa: uma pílula por fase (Play-in, Primeira rodada, ... Final) e os confrontos dela em grade,
     com Leste e Oeste lado a lado quando houver; abre na fase que está rolando. Sem rolagem para os lados. */
  function semTime(n) { return !n || indef.test(n); }
  window.chaveHTML = function (ch) {
    if (!ch || !ch.fases || !ch.fases.length) return '';
    var grupos = [];
    ch.fases.forEach(function (f) {
      var g = grupos.filter(function (x) { return x.fase === f.fase; })[0];
      if (!g) grupos.push(g = { fase: f.fase, partes: [] });
      g.partes.push({ conf: f.conf || '', lista: f.confrontos || f.series || [] });
    });
    function todos(g) { return [].concat.apply([], g.partes.map(function (p) { return p.lista; })); }
    var ativo = -1;
    grupos.forEach(function (g, i) { if (ativo < 0 && todos(g).some(function (x) { return !x.vence && !semTime(x.a) && !semTime(x.b); })) ativo = i; });
    if (ativo < 0) grupos.forEach(function (g, i) { if (todos(g).some(function (x) { return !semTime(x.a) || !semTime(x.b); })) ativo = i; });
    if (ativo < 0) ativo = 0;
    var abas = grupos.length > 1 ? '<div class="ch-etapas" role="tablist">' + grupos.map(function (g, i) {
      return '<button type="button" role="tab" aria-selected="' + (i === ativo) + '" data-i="' + i + '">' + esc(g.fase) + '</button>';
    }).join('') + '</div>' : '';
    return '<div class="ch-tabs">' + abas + grupos.map(function (g, i) {
      var duas = g.partes.length > 1;
      return '<div class="ch-etapa' + (duas ? ' ch-duas' : '') + '" data-i="' + i + '"' + (i === ativo ? '' : ' hidden') + '>' + g.partes.map(function (p) {
        return '<div class="ch-parte">' + (p.conf ? '<h4>' + esc(p.conf) + '</h4>' : '') + '<div class="ch-grade' + (p.lista.length === 1 ? ' ch-um' : '') + '">' + p.lista.map(confrontoHTML).join('') + '</div></div>';
      }).join('') + '</div>';
    }).join('') + '</div>' + (ch.nota ? '<p class="nota ch-nota">' + esc(ch.nota) + '</p>' : '');
  };
  if (!window.__chEtapas) {
    window.__chEtapas = 1;
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.ch-etapas button'); if (!b) return;
      var box = b.closest('.ch-tabs'), i = b.getAttribute('data-i');
      [].forEach.call(box.querySelectorAll('.ch-etapas button'), function (x) { x.setAttribute('aria-selected', String(x === b)); });
      [].forEach.call(box.querySelectorAll('.ch-etapa'), function (x) { x.hidden = x.getAttribute('data-i') !== i; });
    });
  }
  /* playoffs projetados a partir da tabela atual: 1º x 8º, 4º x 5º, 3º x 6º, 2º x 7º (NBA e Euroleague; 7º a 10º no play-in) e 1º x 16º... (NBB) */
  window.chaveProjetada = function (c) {
    function nomes(t) { var i = t.colunas.indexOf('Time'); return t.linhas.map(function (l) { return l[i]; }); }
    function cruz(n, pares, conf, playin) {
      return { fase: 'Primeira rodada', conf: conf, series: pares.map(function (p) {
        return { a: n[p[0] - 1], sa: p[0], b: n[p[1] - 1], sb: p[1], info: playin && p[1] >= 7 ? 'A vaga ' + p[1] + ' é decidida no play-in' : '' };
      }) };
    }
    if (!c.tabela) return null;
    var n1 = nomes(c.tabela);
    if (c.slug === 'nbb') return n1.length < 16 ? null : { fases: [cruz(n1, [[1, 16], [8, 9], [4, 13], [5, 12], [2, 15], [7, 10], [3, 14], [6, 11]], '', false)] };
    if (n1.length < 8) return null;
    var f = [cruz(n1, [[1, 8], [4, 5], [3, 6], [2, 7]], c.tabela2 ? 'Leste' : '', true)];
    if (c.tabela2) f.push(cruz(nomes(c.tabela2), [[1, 8], [4, 5], [3, 6], [2, 7]], 'Oeste', true));
    return { fases: f };
  };

  /* craque do jogo: o melhor do jogo principal de cada dia (robô do placar, números da ESPN) */
  window.craqueHTML = function (esporte) {
    var L = (AV && AV.craques && AV.craques[esporte]) || [];
    if (!L.length) return '';
    var NOMES = {}; (window.COMPETICOES || []).forEach(function (c) { NOMES[c.slug] = c.menu || c.nome; });
    function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : window.dataCurta(d); }
    return L.map(function (x) {
      var j = x.jogador, pl = String(x.p).split(' x ');
      var rosto = j.foto ? '<img class="cq-foto" src="' + esc(j.foto) + '" alt="" loading="lazy">' : '<span class="cq-esc">' + window.escudoTime(j.time) + '</span>';
      return '<article class="cq">' +
        '<p class="cq-jogo"><small>' + esc(NOMES[x.comp] || '') + ' · ' + quando(x.d) + '</small>' +
          '<span class="cq-placar"><span class="cq-t cq-casa"><b>' + esc(x.casa) + '</b>' + window.escudoTime(x.casa) + '</span><em>' + esc(pl[0]) + ' – ' + esc(pl[1]) + '</em><span class="cq-t">' + window.escudoTime(x.fora) + '<b>' + esc(x.fora) + '</b></span></span></p>' +
        '<div class="cq-jog">' + rosto + '<div><span class="cq-rot">' + (esporte === 'basquete' ? 'Melhor em quadra' : 'Melhor em campo') + '</span>' +
          '<h3>' + esc(j.nome) + '</h3><a href="' + window.linkTime(j.time) + '">' + esc(j.time) + '</a></div></div>' +
        '<p class="cq-linha">' + esc(j.linha) + '</p></article>';
    }).join('');
  };

  /* líderes de estatística da NBA (robô) */
  window.lideresHTML = function () {
    var L = AV && AV.lideres && AV.lideres.nba;
    if (!L || !L.pts || !L.pts.length) return '';
    function col(t, l) {
      return '<div class="lid-col"><h4>' + t + '</h4><ol>' + l.slice(0, 5).map(function (x) {
        return '<li>' + window.escudoTime(x[1]) + '<span><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + (x[3] ? ' · ' + esc(x[3]) + ' jogos' : '') + '</small></span><em>' + esc(x[2]) + '</em></li>';
      }).join('') + '</ol></div>';
    }
    return '<div class="lid-grade">' + col('Pontos', L.pts) + col('Rebotes', L.reb || []) + col('Assistências', L.ast || []) + '</div>' +
      '<p class="nota">Médias por jogo na temporada ' + esc(L.temporada) + ' da NBA (só quem tem jogos suficientes). Atualizado sozinho. Fonte: ESPN.</p>';
  };

  /* cartão do mercado */
  function escudoSe(n) { return (window.ESCUDOS || {})[n] ? window.escudoTime(n) : ''; }
  var STATUS = { confirmado: ['Confirmado', 'ok'], saida: ['Saída', 'sai'], especulacao: ['Rumor', 'rumor'] };
  window.mercadoHTML = function (m) {
    var s = STATUS[m.status] || ['', ''];
    return '<div class="mk-card mk-' + s[1] + '"><div class="mk-topo"><span class="mk-st">' + s[0] + '</span><small>' + esc(m.cat) + ' · ' + window.dataCurta(m.d) + '</small></div>' +
      '<b class="mk-nome">' + esc(m.nome) + '</b>' +
      '<div class="mk-rota"><span>' + escudoSe(m.de) + esc(m.de) + '</span><i aria-hidden="true">→</i><span>' + escudoSe(m.para) + esc(m.para) + '</span></div>' +
      '<small class="mk-quando">' + esc(m.quando || '') + '</small>' + (m.nota ? '<p>' + esc(m.nota) + '</p>' : '') +
      (m.link ? '<a class="mk-link" href="' + esc(m.link) + '">Ler a notícia →</a>' : '') + '</div>';
  };
})();
