/* Suas categorias (planos Médio e Master): a pessoa marca as categorias que segue e a página junta
   próximas sessões, últimos vencedores, líderes, notícias e o link da agenda do celular (assets/agenda/<categoria>.ics).
   As escolhas ficam no navegador; quando o login estiver no ar, passam a ficar na conta. */
(function () {
  var esc = window.esc;
  var caixa = document.getElementById('minhas');
  var local = !!window.NAVEIA_TESTE;
  var CHAVE = 'naveia-minhas-categorias';
  var CATS = window.CATEGORIAS;

  function lerSel() { try { var v = JSON.parse(localStorage.getItem(CHAVE)); return Array.isArray(v) ? v : null; } catch (e) { return null; } }
  var naConta = false; /* logado de verdade: as categorias ficam na conta (servidor) */
  function guardarSel(v) {
    try { localStorage.setItem(CHAVE, JSON.stringify(v)); } catch (e) {}
    if (naConta) window.NAVEIA_API('preferencias', { categorias: v }).catch(function () {});
  }
  var sel = lerSel() || [];

  function linkAgenda(c) {
    var base = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '') + 'assets/agenda/' + c.slug + '.ics';
    return { https: base, webcal: base.replace(/^https?:/, 'webcal:') };
  }

  function desenhar() {
    var escolhidas = CATS.filter(function (c) { return sel.indexOf(c.slug) > -1; });
    /* Seguir: um cartão com foto para cada categoria, e "Seguir todas" */
    var todas = escolhidas.length === CATS.length;
    var h = '<section class="mc-seguir" aria-labelledby="mc-seguir-t"><div class="mc-seguir-cab"><div><h2 id="mc-seguir-t">Categorias que você segue</h2>' +
      '<p class="mc-info">' + (todas ? 'Você segue todas as categorias: a página mostra tudo.' : escolhidas.length ? 'Você segue ' + escolhidas.length + ' de ' + CATS.length + '. A página mostra só estas.' : 'Siga pelo menos uma categoria para montar a sua página.') + '</p></div>' +
      '<button type="button" class="pl-botao' + (todas ? ' pl-botao-linha' : '') + '" data-todas="' + (todas ? '0' : '1') + '">' + (todas ? 'Deixar de seguir todas' : 'Seguir todas as categorias') + '</button></div>' +
      '<div class="mc-cats">' + CATS.map(function (c) {
        var sim = sel.indexOf(c.slug) > -1;
        return '<button type="button" class="mc-cat' + (sim ? ' seguindo' : '') + '" data-cat="' + c.slug + '" aria-pressed="' + sim + '">' +
          '<img src="' + esc(c.foto) + '" alt="" loading="lazy"><span class="mc-cat-nome">' + esc(c.nome) + '</span>' +
          '<span class="mc-cat-acao">' + (sim ? 'Seguindo ✓' : 'Seguir') + '</span></button>';
      }).join('') + '</div></section>';

    if (!escolhidas.length) { caixa.innerHTML = h; return; }

    /* 1. próximas etapas (até 2 por categoria), por data */
    var hoje = window.hojeISO(), prox = [];
    escolhidas.forEach(function (c) {
      c.calendario.filter(function (e) { return !e.venc && e.d && e.d >= hoje; }).slice(0, 2).forEach(function (e) { prox.push({ c: c, e: e }); });
    });
    prox.sort(function (a, b) { return a.e.d < b.e.d ? -1 : a.e.d > b.e.d ? 1 : 0; });
    h += '<section class="mc-bloco"><h2>Próximas etapas</h2>' + (prox.length
      ? '<div class="torre">' + prox.map(function (p) { return window.linhaAgenda(p.c, p.e); }).join('') + '</div>'
      : '<p class="mc-vazio">Nenhuma etapa marcada nas suas categorias.</p>') + '</section>';

    /* 2. últimos vencedores e líderes */
    h += '<section class="mc-bloco"><h2>Vencedores e líderes</h2><div class="mc-grade">' + escolhidas.map(function (c) {
      var ult = c.calendario.filter(function (e) { return e.venc; }).slice(-1)[0];
      return '<a class="mc-cartao" href="' + c.slug + '.html"><h3>' + esc(c.nome) + '</h3>' +
        (ult ? '<p><span>Última etapa · ' + esc(ult.n) + '</span>' + esc(ult.venc) + '</p>' : '') +
        (c.lider ? '<p><span>Líder</span>' + esc(c.lider.nome) + (c.lider.info ? ' <small>' + esc(c.lider.info) + '</small>' : '') + '</p>' : '') + '</a>';
    }).join('') + '</div></section>';

    /* 3. notícias das suas categorias */
    var nots = [];
    escolhidas.forEach(function (c) { (c.noticias || []).forEach(function (n) { nots.push({ c: c, n: n }); }); });
    nots.sort(function (a, b) { return a.n.d < b.n.d ? 1 : a.n.d > b.n.d ? -1 : 0; });
    h += '<section class="mc-bloco"><h2>Notícias</h2>' + (nots.length ? '<ul class="mc-nots">' + nots.slice(0, 10).map(function (x) {
      return '<li><span class="mc-nots-cat">' + esc(x.c.nome) + ' · ' + window.dataCurta(x.n.d) + '</span><a href="' + x.c.slug + '.html"><b>' + esc(x.n.t) + '</b></a><p>' + esc(x.n.x) + '</p></li>';
    }).join('') + '</ul>' : '<p class="mc-vazio">Sem notícias novas.</p>') + '</section>';

    /* 4. agenda do celular */
    h += '<section class="mc-bloco" id="agenda-celular"><h2>Agenda do celular</h2>' +
      '<p class="mc-info">Assine a agenda de cada categoria. Os horários entram sozinhos no calendário do seu celular, com aviso 30 minutos antes, e mudam sozinhos quando a categoria muda um horário.</p>' +
      '<ul class="mc-agenda">' + escolhidas.map(function (c) {
        var l = linkAgenda(c);
        return '<li><b>' + esc(c.nome) + '</b><a class="pl-botao" href="' + esc(l.webcal) + '">Assinar no celular</a>' +
          '<button type="button" class="pl-botao pl-botao-linha mc-copiar" data-link="' + esc(l.https) + '">Copiar link</button></li>';
      }).join('') + '</ul>' +
      '<details class="mc-ajuda"><summary>Como assinar</summary><ol>' +
      '<li><b>iPhone:</b> toque em <b>Assinar no celular</b> e depois em <b>Assinar</b>.</li>' +
      '<li><b>Android (Google Agenda):</b> toque em <b>Copiar link</b>. No computador, abra calendar.google.com, clique no <b>+</b> ao lado de "Outras agendas", escolha <b>Do URL</b>, cole o link e clique em <b>Adicionar agenda</b>. Em alguns minutos ela aparece no celular.</li>' +
      '<li><b>Outlook e outros:</b> use <b>Copiar link</b> e adicione como "agenda da internet".</li></ol></details></section>';

    caixa.innerHTML = h;
  }

  function comecar() {
    desenhar();
    caixa.addEventListener('click', function (e) {
      var tb = e.target.closest('[data-todas]');
      if (tb) { sel = tb.getAttribute('data-todas') === '1' ? CATS.map(function (c) { return c.slug; }) : []; guardarSel(sel); desenhar(); return; }
      var b = e.target.closest('.mc-cat');
      if (b) {
        var s = b.getAttribute('data-cat'), i = sel.indexOf(s);
        if (i > -1) sel.splice(i, 1); else sel.push(s);
        guardarSel(sel); desenhar(); return;
      }
      var cp = e.target.closest('.mc-copiar');
      if (cp) {
        var feito = function () { cp.textContent = 'Link copiado'; setTimeout(function () { cp.textContent = 'Copiar link'; }, 2200); };
        if (navigator.clipboard) navigator.clipboard.writeText(cp.getAttribute('data-link')).then(feito, function () { window.prompt('Copie o link:', cp.getAttribute('data-link')); });
        else window.prompt('Copie o link:', cp.getAttribute('data-link'));
      }
    });
  }

  /* Planos Médio e Master (no computador, só com ?teste=1 ou ?teste=medio) */
  function trava(titulo, texto, botoes) {
    caixa.innerHTML = '<div class="sm-trava"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="sm-trava-acoes">' + botoes + '</div></div>';
  }
  caixa.innerHTML = '<p class="nota">Carregando…</p>';
  window.NAVEIA_EU.then(function (r) {
    if (r.semServidor && !local && window.NAVEIA_PC) r = { logado: false };
    if (r.semServidor) {
      if (!local) return trava('Página indisponível agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="minhas.html">Tentar de novo</a>');
    } else if (!r.logado) {
      return trava('Exclusivo dos planos Médio e Master', 'Entre na sua conta para montar a sua página com as categorias que você segue.', '<a class="pl-botao" href="entrar.html?volta=minhas.html">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
    } else if (r.usuario.plano !== 'medio' && r.usuario.plano !== 'master') {
      return trava('Exclusivo dos planos Médio e Master', 'Seu plano atual não inclui esta página. Assine o Médio ou o Master.', '<a class="pl-botao" href="planos.html">Ver os planos</a>');
    }
    if (r.logado && !r.teste) { naConta = true; sel = (r.usuario.categorias || []).slice(); /* com conta, vale o que está salvo na conta */ }
    comecar();
  });
})();
