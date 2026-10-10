/* Menu, rodapé e revelações. Usado em todas as páginas. */
(function () {
  var CATS = window.CATEGORIAS || [];
  var SECOES = [
    ['noticias', 'Notícias'], ['resultados', 'Resultados'], ['classificacao', 'Classificação'],
    ['calendario', 'Calendário'], ['pilotos', 'Pilotos'], ['equipes', 'Equipes']
  ];
  window.SECOES = SECOES;
  var atual = document.body.getAttribute('data-cat');
  var paginaAtual = document.body.getAttribute('data-pagina');
  var seta = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  function pagina(c) { return c.slug + '.html'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  window.esc = esc;

  /* As 17 categorias organizadas em 5 grupos (usado no painel, na página inicial e no rodapé) */
  var PORSLUG = {}; CATS.forEach(function (c) { PORSLUG[c.slug] = c; });
  var GRUPOS = [
    { nome: 'Monopostos', desc: 'Carros de fórmula, com rodas descobertas', slugs: ['formula-1', 'formula-2', 'formula-3', 'formula-e', 'indycar'] },
    { nome: 'Turismo', desc: 'Carros de carroceria fechada', slugs: ['stock-car', 'porsche-cup', 'nascar', 'dtm'] },
    { nome: 'Endurance', desc: 'Corridas longas, de 6 a 24 horas', slugs: ['endurance', 'le-mans', 'imsa'] },
    { nome: 'Rally', desc: 'Estradas de terra, asfalto e neve', slugs: ['rally', 'dakar'] },
    { nome: 'Motos', desc: 'Duas rodas', slugs: ['motogp', 'superbike', 'motocross'] }
  ].map(function (g) { g.cats = g.slugs.map(function (s) { return PORSLUG[s]; }).filter(Boolean); return g; });
  window.GRUPOS = GRUPOS;

  /* Topo */
  var topo = document.getElementById('topo');
  if (topo) {
    /* Menu principal com ícones: Início, Notícias, Guia e Categorias (abre o painel com todas). As categorias ficam na faixa logo abaixo (e na entrada da página inicial). */
    var IC = {
      inicio: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h5v-6h3v6h5V10"/>',
      noticias: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M7 9h10M7 12.5h10M7 16h6"/>',
      agenda: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
      categorias: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
      jogos: '<path d="M7 8h10a4 4 0 0 1 4 4v1.5a3.5 3.5 0 0 1-6.3 2.1L13.5 14h-3l-1.2 1.6A3.5 3.5 0 0 1 3 13.5V12a4 4 0 0 1 4-4z"/><path d="M8 10.5v3M6.5 12h3M16 11.5h.01M17.5 13h.01"/>',
      chat: '<path d="M4 5h16v11H9l-5 4z"/>',
      raiox: '<path d="M3 13h4l2.5-6 4 11 2.5-5H21"/>',
      tv: '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
      box: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
      guia: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>'
    };
    function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }
    var inicio = /(^|\/)(index\.html)?$/.test(location.pathname);
    var itensMenu = [
      ['inicio', './', 'Início', inicio],
      ['noticias', 'noticias.html', 'Notícias', paginaAtual === 'noticias'],
      ['tv', 'onde-assistir.html', 'Onde assistir', /onde-assistir/.test(location.pathname)],
      ['categorias', '#categorias-menu', 'Categorias', false],
      ['jogos', 'jogos.html', 'Jogos', /jogos/.test(location.pathname)],
      ['chat', '#bate-papo', 'Chat', false],
      ['guia', 'guia.html', 'Guia', /guia/.test(location.pathname)]
    ];
    var menu = itensMenu.map(function (m) {
      return '<a class="nav-link nav-' + m[0] + '" href="' + m[1] + '"' + (m[3] ? ' aria-current="page"' : '') + '>' + ic(m[0]) + '<span>' + m[2] + '</span></a>';
    }).join('');

    topo.className = 'topo';
    topo.innerHTML =
      '<div class="moldura topo-in">' +
        '<a class="marca" href="./" aria-label="Automobilismo Na Veia, início"><span class="marca-sinal" aria-hidden="true"><i></i><i></i></span>' +
        '<span class="marca-nome"><small>AUTOMOBILISMO</small>NA VEIA</span></a>' +
        '<nav class="nav" aria-label="Menu principal">' + menu + '</nav>' +
        '<a class="conta-link" id="conta-link" href="entrar.html">Entrar</a>' +
        '<button class="todas" aria-expanded="false" aria-controls="painel" title="Todas as categorias"><span class="todas-txt">Todas as categorias</span><span class="todas-menu">Menu</span>' +
        '<span class="grade-ic" aria-hidden="true">' + new Array(10).join('<i></i>') + '</span><span class="sr">Abrir todas as categorias</span></button>' +
        '<button type="button" class="compartilhar-bt" id="compartilhar-bt" aria-label="' + (window.LANG === 'en' ? 'Share this page' : 'Compartilhar esta página') + '" title="' + (window.LANG === 'en' ? 'Share' : 'Compartilhar') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg></button>' +
        '<button type="button" class="idioma-btn" id="idioma-btn" data-sem-traducao aria-label="' + (window.LANG === 'en' ? 'Change the site language' : 'Mudar o idioma do site') + '" title="' + (window.LANG === 'en' ? 'Português' : 'English') + '">' +
          '<span' + (window.LANG !== 'en' ? ' class="ativo"' : '') + '>PT</span><i aria-hidden="true"></i><span' + (window.LANG === 'en' ? ' class="ativo"' : '') + '>EN</span></button>' +
      '</div>';

    var painel = document.createElement('div');
    painel.className = 'painel'; painel.id = 'painel';
    painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-label', 'Todas as categorias');
    /* no celular o menu de cima some: os mesmos botões aparecem no topo do painel */
    var menuPainel = '<nav class="painel-menu" aria-label="Menu">' + itensMenu.filter(function (m) { return m[0] !== 'categorias'; }).concat([['raiox', './#analise', 'Raio-x e telemetria', false]]).map(function (m) {
      return '<a class="painel-menu-it" href="' + m[1] + '"' + (m[3] ? ' aria-current="page"' : '') + '>' + ic(m[0]) + '<span>' + m[2] + '</span></a>';
    }).join('') + '</nav>';
    painel.innerHTML = '<div class="moldura painel-in">' + menuPainel + '<a class="painel-noticias" href="noticias.html"><b>Notícias</b><span>Tudo o que está acontecendo no automobilismo</span></a>' + GRUPOS.map(function (g) {
      return '<section class="painel-grupo"><h2>' + esc(g.nome) + '</h2><ul class="painel-lista">' + g.cats.map(function (c) {
        return '<li><a class="painel-cat" href="' + pagina(c) + '"><strong>' + esc(c.nome) + '</strong><span><em>' + esc(c.lider.nome) + '</em><br>' + esc(c.lider.info) + '</span></a>' +
          '<ul class="painel-secoes">' + SECOES.slice(1, 5).map(function (s) { return '<li><a href="' + pagina(c) + '#' + s[0] + '">' + s[1] + '</a></li>'; }).join('') + '</ul></li>';
      }).join('') + '</ul></section>';
    }).join('') +
      '<section class="painel-planos" aria-label="Atalhos">' +
        '<div class="painel-planos-acoes"><a class="botao" href="jogos.html">Jogos</a><a class="painel-guia" href="./#analise">Raio-x e telemetria</a><a class="painel-guia" href="area-master.html">Ferramentas grátis</a><a class="painel-guia" href="horarios.html">Horários e alerta de largada</a><a class="painel-guia" href="guia.html">Novo por aqui? Guia para iniciantes</a><a class="painel-guia painel-conta" href="entrar.html">Entrar ou minha conta</a><a class="painel-guia" href="#bate-papo">Chat da torcida</a><a class="painel-guia" href="#instalar-app">Instalar o app no celular</a></div>' +
      '</section></div>';
    topo.after(painel);

    /* Faixa fina com as categorias, logo abaixo do menu (menos na página inicial, que já mostra as categorias na entrada).
       No celular ela desliza para o lado. Ponto vermelho = corre nos próximos 7 dias. */
    if (!inicio) {
      var h7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), hj = new Date().toISOString().slice(0, 10);
      var ordemCats = ['formula-1', 'motogp', 'stock-car', 'formula-2', 'formula-3', 'formula-e', 'indycar', 'nascar', 'porsche-cup', 'dtm', 'endurance', 'le-mans', 'imsa', 'rally', 'dakar', 'superbike', 'motocross'];
      var faixa = document.createElement('nav');
      faixa.className = 'faixa-cats'; faixa.setAttribute('aria-label', 'Categorias');
      faixa.innerHTML = '<div class="moldura faixa-cats-in">' + ordemCats.map(function (slug) {
        var c = PORSLUG[slug]; if (!c) return '';
        var prox = c.calendario.filter(function (e) { return !e.venc && e.d && e.d >= hj; })[0];
        var corre = prox && ((prox.s && prox.s[0] && prox.s[0].d) || prox.d) <= h7;
        return '<a class="faixa-cat" href="' + pagina(c) + '"' + (c.slug === atual ? ' aria-current="page"' : '') + '>' + esc(c.menu || c.nome) + (corre ? '<i aria-hidden="true"></i>' : '') + '</a>';
      }).join('') + '</div>';
      topo.querySelector('.topo-in').after(faixa);
      document.documentElement.classList.add('com-cats');
      var ativo = faixa.querySelector('[aria-current]'); if (ativo) faixa.querySelector('.faixa-cats-in').scrollLeft = ativo.offsetLeft - 16;
    }

    topo.addEventListener('click', function (e) {
      var bx = e.target.closest('a[href="#box"]'); if (bx) { e.preventDefault(); if (window.BOX_ABRIR) window.BOX_ABRIR(true); return; }
      var l = e.target.closest('a[href="#categorias-menu"], a[href="#bate-papo"]'); if (!l) return;
      e.preventDefault();
      if (l.getAttribute('href') === '#categorias-menu') { var t = topo.querySelector('.todas'); if (t) t.click(); }
      else { var c = document.querySelector('.chat-bt'); if (c) c.click(); }
    });
    /* compartilhar: manda o link da página aberta (no celular, abre WhatsApp, Instagram...; no computador, copia o link) */
    document.getElementById('compartilhar-bt').addEventListener('click', function () {
      var url = location.href.split('#')[0] + (location.hash === '#telemetria' ? '#telemetria' : ''), bt = this;
      function aviso(t) { var a = document.createElement('div'); a.className = 'compartilhar-aviso'; a.setAttribute('role', 'status'); a.textContent = t; document.body.appendChild(a); setTimeout(function () { a.remove(); }, 2600); }
      function copiar() {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { aviso('Link copiado! Cole no WhatsApp, no Instagram ou onde quiser.'); }, function () { aviso(url); });
        else aviso(url);
      }
      if (navigator.share) navigator.share({ title: document.title, text: 'Olha isso no Automobilismo Na Veia', url: url }).catch(function (e) { if (!e || e.name !== 'AbortError') copiar(); });
      else copiar();
      bt.blur();
    });
    document.getElementById('idioma-btn').addEventListener('click', function () { window.trocarIdioma(window.LANG === 'en' ? 'pt' : 'en'); });

    var itens = topo.querySelectorAll('.nav-item');
    function fecharSubs(exceto) {
      itens.forEach(function (it) { if (it !== exceto) { it.classList.remove('aberto'); it.firstChild.setAttribute('aria-expanded', 'false'); } });
    }
    itens.forEach(function (it) {
      var btn = it.firstChild;
      var abertoEm = 0;
      it.addEventListener('mouseenter', function () { abertoEm = Date.now(); });
      btn.addEventListener('click', function () {
        /* se o mouse acabou de abrir o menu, o clique confirma em vez de fechar */
        var abrir = !it.classList.contains('aberto') || Date.now() - abertoEm < 600;
        fecharSubs(it); fecharPainel();
        it.classList.toggle('aberto', abrir); btn.setAttribute('aria-expanded', abrir);
      });
      if (window.matchMedia('(hover: hover)').matches) {
        var t;
        it.addEventListener('mouseenter', function () { clearTimeout(t); fecharSubs(it); it.classList.add('aberto'); btn.setAttribute('aria-expanded', 'true'); });
        it.addEventListener('mouseleave', function () { t = setTimeout(function () { it.classList.remove('aberto'); btn.setAttribute('aria-expanded', 'false'); }, 180); });
      }
    });

    var todas = topo.querySelector('.todas');
    function fecharPainel() { painel.classList.remove('aberto'); todas.setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = ''; }
    todas.addEventListener('click', function () {
      var abrir = !painel.classList.contains('aberto');
      fecharSubs();
      painel.classList.toggle('aberto', abrir); todas.setAttribute('aria-expanded', abrir);
      document.documentElement.style.overflow = abrir ? 'hidden' : '';
    });
    painel.addEventListener('click', function (e) { if (e.target.closest('a')) fecharPainel(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fecharSubs(); fecharPainel(); } });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav-item')) fecharSubs(); });
    topo.querySelectorAll('.sub a').forEach(function (a) { a.addEventListener('click', function () { fecharSubs(); }); });
  }

  /* Sem modo de teste: o site é igual no computador do dono e no ar (o dono testa os planos pela conta dele, em Minha conta). */
  window.NAVEIA_PC = /^(localhost|127.0.0.1|)$/.test(location.hostname);
  window.NAVEIA_TESTE = false;
  try { localStorage.removeItem('naveia-teste'); } catch (e) {}

  /* Conta: servidor de contas no Cloudflare (_ferramentas/contas).
     O login fica num token guardado no navegador e vai no cabeçalho Authorization.
     Servidor de teste local (npx wrangler dev, porta 8787) só se ligado à mão: localStorage naveia-servidor-local = 1. */
  var servLocal = false; try { servLocal = localStorage.getItem('naveia-servidor-local') === '1'; } catch (e) {}
  window.NAVEIA_SERVIDOR = servLocal ? 'http://' + (location.hostname || 'localhost') + ':8787/' : 'https://naveia-contas.naveia-contas.workers.dev/';
  function lerSessao() { try { return localStorage.getItem('naveia-sessao') || ''; } catch (e) { return ''; } }
  window.NAVEIA_API = function (acao, dados) {
    var cab = { 'X-Naveia': '1' }, s = lerSessao();
    if (s) cab.Authorization = 'Bearer ' + s;
    var op = { headers: cab };
    if (dados) { op.method = 'POST'; cab['Content-Type'] = 'application/json'; op.body = JSON.stringify(dados); }
    return fetch(window.NAVEIA_SERVIDOR + '?acao=' + acao, op).then(function (r) { return r.json(); }).then(function (r) {
      try {
        if (r && r.sessao) localStorage.setItem('naveia-sessao', r.sessao);
        if (acao === 'sair' || (acao === 'eu' && r && r.ok && !r.logado)) localStorage.removeItem('naveia-sessao');
      } catch (e) {}
      return r;
    });
  };
  window.NAVEIA_EU = /^https?:/.test(location.protocol)
    ? window.NAVEIA_API('eu').catch(function () { return { ok: false, logado: false, semServidor: true }; })
    : Promise.resolve({ ok: false, logado: false, semServidor: true });
  /* Tudo grátis (desde 07/10/2026): as páginas que eram do plano Master abrem para todo mundo, com ou sem conta.
     Bolão, chat e Box continuam usando NAVEIA_EU (precisam de uma conta grátis). */
  window.NAVEIA_LIVRE = window.NAVEIA_EU.then(function (r) {
    var u = r && r.logado && r.usuario ? r.usuario : {};
    u.plano = 'master';
    return { ok: true, logado: true, livre: true, contaDeVerdade: !!(r && r.logado), usuario: u };
  });
  /* Convite para criar conta (só para quem não está logado): no fim das notícias e das páginas das categorias e na página inicial */
  window.NAVEIA_EU.then(function (r) {
    if (!r || r.logado || r.semServidor || /entrar|conta|redefinir|planos/.test(location.pathname)) return;
    var volta = encodeURIComponent((location.pathname.split('/').pop() || 'index.html'));
    var html = '<aside class="convite-conta" aria-label="Crie sua conta grátis"><div class="convite-txt"><b>Crie sua conta grátis</b>' +
      '<span>Tudo no site é grátis. Com a conta você também <em>conversa no chat da torcida</em>, fala com o Box e recebe os alertas de largada.</span></div>' +
      '<a class="convite-bt" href="entrar.html?volta=' + volta + '#criar">Criar conta grátis</a></aside>';
    function colocar(alvo, onde) { if (alvo) alvo.insertAdjacentHTML(onde, '<div class="moldura convite-vaga">' + html + '</div>'); }
    if (document.body.getAttribute('data-cat')) colocar(document.getElementById('paineis'), 'afterend');
    else if (document.getElementById('feed')) { var f = document.getElementById('feed'); f.insertAdjacentHTML('beforeend', html); }
    else if (document.querySelector('.box-faixa')) colocar(document.querySelector('.box-faixa'), 'afterend');
    else if (document.getElementById('oa')) colocar(document.querySelector('#oa .moldura'), 'beforeend');
  });

  window.NAVEIA_EU.then(function (r) {
    var l = document.getElementById('conta-link');
    if (!l) return;
    if (r.semServidor) { l.remove(); var pc = document.querySelector('.painel-conta'); if (pc) pc.remove(); return; }
    if (r.logado) {
      l.href = 'conta.html';
      l.innerHTML = '<span class="conta-longo">Meu </span>perfil';
    }
    if (/conta|entrar|painel/.test(location.pathname)) l.setAttribute('aria-current', 'page');
    /* faixa de cima conforme a conta: sem conta = convite para o teste grátis; no teste = dias que faltam; assinante = some */
    var faixa = document.querySelector('.aviso-planos p');
    if (!faixa) return;
    var u = r.logado && r.usuario;
    if (!(u && u.plano !== 'gratis' && !u.teste)) { try { localStorage.removeItem('naveia-sem-aviso'); } catch (e) {} }
    if (u && u.teste) {
      var dias = Math.max(1, Math.ceil((new Date(u.teste_ate) - Date.now()) / 864e5));
      faixa.innerHTML = '<span class="aviso-longo">Teste grátis do Master: ' + (dias === 1 ? 'último dia' : 'faltam ' + dias + ' dias') + '. Continue por R$ 24,90 no primeiro mês.</span><span class="aviso-curto">Teste grátis: ' + (dias === 1 ? 'último dia' : dias + ' dias') + '</span>';
      faixa.nextElementSibling.textContent = 'Assinar';
    } else if (u && u.plano !== 'gratis') {
      var av = document.querySelector('.aviso-planos'); av.remove(); document.documentElement.classList.remove('com-aviso');
      try { localStorage.setItem('naveia-sem-aviso', '1'); } catch (e) {} /* plano pago: na próxima visita o topo já nasce sem o aviso */
    } else if (!u) {
      faixa.innerHTML = '<span class="aviso-longo">Crie sua conta e ganhe 7 dias do plano Master grátis.</span><span class="aviso-curto">7 dias de Master grátis.</span>';
      faixa.nextElementSibling.textContent = 'Criar conta';
      faixa.nextElementSibling.href = 'entrar.html#criar';
    }
  });

  /* Bate-papo da torcida (botão flutuante): carrega o estilo e o script só depois do resto da página */
  if (/^https?:/.test(location.protocol) && !document.documentElement.classList.contains('rx-embutido')) { /* no Raio-x embutido na página inicial não carrega chat, Box nem app */
    var chatCss = document.createElement('link'); chatCss.rel = 'stylesheet'; chatCss.href = 'assets/css/chat.css?v=250'; document.head.appendChild(chatCss);
    var chatJs = document.createElement('script'); chatJs.src = 'assets/js/chat.js?v=250'; chatJs.defer = true; document.body.appendChild(chatJs);
    var appJs = document.createElement('script'); appJs.src = 'assets/js/app-instalar.js?v=250'; appJs.defer = true; document.body.appendChild(appJs);
    /* Box: assistente de voz (box.js) */
    var boxCss = document.createElement('link'); boxCss.rel = 'stylesheet'; boxCss.href = 'assets/css/box.css?v=250'; document.head.appendChild(boxCss);
    var boxJs = document.createElement('script'); boxJs.src = 'assets/js/box.js?v=250'; boxJs.defer = true; document.body.appendChild(boxJs);
    var alertaJs = document.createElement('script'); alertaJs.src = 'assets/js/alerta.js?v=250'; alertaJs.defer = true; document.body.appendChild(alertaJs);
    var rolJs = document.createElement('script'); rolJs.src = 'assets/js/rolador.js'; rolJs.defer = true; document.body.appendChild(rolJs);
  }

  /* Contador de visitas (Cloudflare Web Analytics): sem cookies e sem identificar ninguém. Só no site no ar. */
  if (/automobilismonaveia.com.br$/.test(location.hostname)) {
    var cf = document.createElement('script');
    cf.defer = true; cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.setAttribute('data-cf-beacon', '{"token": "f6b86becc1dc4cea8156ca8e152b3b9e"}');
    document.body.appendChild(cf);
  }

  /* Olhinho nos campos de senha: aperta para ver a senha, aperta de novo para esconder */
  var OLHO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    RISCO = '<path d="M4 20L20 4" stroke="currentColor" stroke-width="1.8"/>';
  document.querySelectorAll('input[type="password"]').forEach(function (campo) {
    var caixa = document.createElement('span');
    caixa.className = 'senha-caixa';
    campo.parentNode.insertBefore(caixa, campo);
    caixa.appendChild(campo);
    var bt = document.createElement('button');
    bt.type = 'button'; bt.className = 'senha-olho';
    function desenhar() {
      var vendo = campo.type === 'text';
      bt.innerHTML = OLHO + (vendo ? '' : RISCO) + '</svg>';
      bt.setAttribute('aria-label', vendo ? 'Esconder a senha' : 'Mostrar a senha');
      bt.setAttribute('aria-pressed', vendo ? 'true' : 'false');
    }
    bt.addEventListener('click', function (e) {
      e.preventDefault();
      campo.type = campo.type === 'password' ? 'text' : 'password';
      desenhar();
    });
    desenhar();
    caixa.appendChild(bt);
  });
  /* ao enviar o formulário, a senha volta a ficar escondida (o navegador não guarda o texto aberto) */
  document.addEventListener('submit', function (e) {
    e.target.querySelectorAll && e.target.querySelectorAll('.senha-caixa input').forEach(function (c) { c.type = 'password'; });
    e.target.querySelectorAll && e.target.querySelectorAll('.senha-olho').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Mostrar a senha'); b.innerHTML = OLHO + RISCO + '</svg>'; });
  }, true);

  /* Service worker: guarda páginas e imagens para abrir mais rápido. Com o manifest.webmanifest, o site pode ser instalado como app (app-instalar.js). */
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  /* Rodapé */
  var rod = document.getElementById('rodape');
  if (rod) {
    rod.className = 'rodape';
    function coluna(titulo, itens) {
      return '<nav class="rodape-col" aria-label="' + esc(titulo) + '"><h2>' + esc(titulo) + '</h2><ul>' + itens.join('') + '</ul></nav>';
    }
    function li(href, txt, fora) { return '<li><a href="' + href + '"' + (fora ? ' target="_blank" rel="noopener"' : '') + '>' + txt + '</a></li>'; }
    var local = /^(localhost|127.0.0.1|)$/.test(location.hostname);
    rod.innerHTML = '<div class="moldura"><div class="rodape-grade"><div class="rodape-marca">' +
      '<a class="marca" href="./"><span class="marca-sinal" aria-hidden="true"><i></i><i></i></span><span class="marca-nome"><small>AUTOMOBILISMO</small>NA VEIA</span></a>' +
      '<p>' + CATS.length + ' categorias acompanhadas de perto. Dados atualizados em ' + esc(window.ATUALIZADO) + '.</p>' +
      '<p class="rodape-contato"><span>Contato:</span> <a href="mailto:automobilismonaveiacontato@gmail.com">automobilismonaveiacontato@gmail.com</a>' +
        '<button type="button" class="copiar-email" data-email="automobilismonaveiacontato@gmail.com">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span>Copiar</span></button></p></div>' +
      /* no rodapé, os 5 grupos viram 3 colunas para não ficar espalhado */
      [['Monopostos', ['Monopostos']], ['Turismo e Endurance', ['Turismo', 'Endurance']], ['Rally e Motos', ['Rally', 'Motos']]].map(function (col) {
        var cats = [].concat.apply([], GRUPOS.filter(function (g) { return col[1].indexOf(g.nome) > -1; }).map(function (g) { return g.cats; }));
        return coluna(col[0], cats.map(function (c) { return li(pagina(c), esc(c.nome)); }));
      }).join('') +
      coluna('O site', [li('noticias.html', 'Notícias'), li('guia.html', 'Guia para iniciantes'), li('onde-assistir.html', 'Onde assistir'), li('horarios.html', 'Horários das corridas'), li('conta.html', 'Minha conta'), li('#instalar-app', 'Instalar o app'), li('privacidade.html', 'Política de privacidade'), li('termos.html', 'Termos de uso')]) +
      '</div>' +
      '<div class="rodape-base"><span>Imagens do site geradas por inteligência artificial, sem equipe, marca ou patrocinador real.</span>' +
        '<span class="rodape-responsavel">Responsável: Gustavo Teixeira · Estrada Doutor Manoel Reis, Rio de Janeiro, Brasil</span></div></div>';
  }

  /* Aviso de privacidade e cookies (LGPD): aparece na primeira visita até a pessoa aceitar */
  (function () {
    var CHAVE = 'naveia-privacidade';
    function aceito() { try { return !!localStorage.getItem(CHAVE); } catch (e) { return false; } }
    function mostrar(forcar) {
      if ((!forcar && aceito()) || document.getElementById('aviso-priv')) return;
      var d = document.createElement('div');
      d.id = 'aviso-priv'; d.className = 'aviso-priv'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-live', 'polite'); d.setAttribute('aria-label', 'Aviso de privacidade');
      d.innerHTML = '<div class="aviso-priv-caixa"><p><b>Sua privacidade.</b> Usamos cookies e o armazenamento do navegador só para o site funcionar: manter você conectado e lembrar suas escolhas, como idioma e recordes dos jogos. Não usamos anúncios nem rastreadores. Ao continuar, você concorda com a nossa <a href="privacidade.html">Política de privacidade</a>.</p>' +
        '<div class="aviso-priv-acoes"><a class="aviso-priv-link" href="privacidade.html">Saiba mais</a><button type="button" class="aviso-priv-ok">Aceitar e fechar</button></div></div>';
      document.body.appendChild(d);
      d.offsetWidth; /* aplica a posição inicial antes de animar */
      setTimeout(function () { d.classList.add('ativo'); }, 30);
      d.querySelector('.aviso-priv-ok').addEventListener('click', function () {
        try { localStorage.setItem(CHAVE, new Date().toISOString()); } catch (e) {}
        d.classList.remove('ativo'); setTimeout(function () { d.remove(); }, 300);
      });
    }
    window.NAVEIA_AVISO_PRIVACIDADE = mostrar;
    mostrar(false);
  })();

  /* Copiar o e-mail do rodapé (funciona no celular, mesmo sem HTTPS) */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.copiar-email');
    if (!b) return;
    var email = b.getAttribute('data-email'), rot = b.querySelector('span');
    function pronto(ok) {
      rot.textContent = ok ? (window.LANG === 'en' ? 'Copied!' : 'Copiado!') : (window.LANG === 'en' ? 'Hold to copy' : 'Segure para copiar');
      b.classList.toggle('ok', ok);
      setTimeout(function () { rot.textContent = window.LANG === 'en' ? 'Copy' : 'Copiar'; b.classList.remove('ok'); }, 2200);
    }
    function reserva() {
      var t = document.createElement('textarea');
      t.value = email; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, email.length);
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      t.remove(); pronto(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(email).then(function () { pronto(true); }, reserva);
    else reserva();
  });

  /* Revelação suave */
  var alvos = document.querySelectorAll('.revelar');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    alvos.forEach(function (a) { io.observe(a); });
  } else { alvos.forEach(function (a) { a.classList.add('visto'); }); }

  /* Datas */
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  window.dataCurta = function (iso) { if (!iso) return 'A confirmar'; var p = iso.split('-'); return p[2] + ' ' + MESES[+p[1] - 1]; };
  window.hojeISO = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  window.diasAte = function (iso) { var a = new Date(window.hojeISO() + 'T12:00:00'), b = new Date(iso + 'T12:00:00'); return Math.round((b - a) / 864e5); };
  window.quando = function (iso) {
    var n = window.diasAte(iso);
    if (n === 0) return 'Hoje'; if (n === 1) return 'Amanhã'; if (n > 1) return 'Em ' + n + ' dias';
    return 'Encerrada';
  };

  /* Horários das sessões (horário de Brasília) */
  var DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  /* Contagem regressiva até a próxima sessão (atualiza a cada segundo) */
  function duracaoSessao(t) { return (/6 horas/.test(t) ? 360 : /2 horas/.test(t) ? 140 : /Corrida/.test(t) ? 110 : /Principal|Sprint/.test(t) ? 60 : 60) * 6e4; }
  function tipoSessao(t) { return /Corrida|Principal|Sprint|Power Stage/.test(t) ? 'corrida' : /Classifica|Hyperpole|Q1|Q2/.test(t) ? 'classificacao' : 'treino'; }
  window.contagem = function (e) {
    if (!e.s || !e.s.length) return '';
    var agora = Date.now();
    for (var i = 0; i < e.s.length; i++) {
      var x = e.s[i], ini = new Date(x.d + 'T' + x.h + ':00-03:00').getTime();
      if (ini + duracaoSessao(x.t) > agora) {
        return '<span class="contagem contagem-' + tipoSessao(x.t) + '" data-ini="' + ini + '" data-fim="' + (ini + duracaoSessao(x.t)) + '">' +
          '<span class="contagem-rot"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5V8l2.5 1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
          '<span class="contagem-nome">' + esc(x.t) + '</span> <span class="contagem-em">em</span></span><b class="contagem-tempo">--:--:--</b></span>';
      }
    }
    return '';
  };
  function doisDig(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var agora = Date.now();
    [].forEach.call(document.querySelectorAll('.contagem'), function (el) {
      var ini = +el.getAttribute('data-ini'), fim = +el.getAttribute('data-fim'), b = el.querySelector('.contagem-tempo');
      if (agora >= fim) { el.classList.add('contagem-fim'); b.textContent = 'Encerrada'; return; }
      if (agora >= ini) { el.classList.add('contagem-vivo'); el.querySelector('.contagem-em').textContent = 'ao vivo'; b.textContent = 'Agora'; return; }
      var s = Math.floor((ini - agora) / 1000), d = Math.floor(s / 86400); s -= d * 86400;
      var txt = (d ? d + 'd ' : '') + doisDig(Math.floor(s / 3600)) + ':' + doisDig(Math.floor(s % 3600 / 60)) + ':' + doisDig(s % 60);
      if (b.textContent !== txt) b.textContent = txt;
    });
  }
  document.addEventListener('DOMContentLoaded', function () { tick(); setInterval(tick, 1000); });

  window.sessoes = function (e) {
    if (!e.s || !e.s.length) return '';
    var agora = Date.now(), proxima = -1;
    var itens = e.s.map(function (x, i) {
      var t = new Date(x.d + 'T' + x.h + ':00-03:00').getTime();
      var fim = t + (/Corrida de 6/.test(x.t) ? 6 : /Corrida|Principal|Sprint/.test(x.t) ? 2 : 1) * 36e5;
      var estado = fim < agora ? 'passou' : (t <= agora ? 'agora' : '');
      if (!estado && proxima < 0) proxima = i;
      return { x: x, estado: estado };
    });
    return '<ol class="sessoes">' + itens.map(function (it, i) {
      var x = it.x, dt = new Date(x.d + 'T12:00:00');
      var cls = it.estado === 'passou' ? ' passou' : (it.estado === 'agora' ? ' agora' : (i === proxima ? ' proxima' : ''));
      return '<li class="sessao' + cls + '"><span>' + esc(x.t) + (it.estado === 'agora' ? ', ao vivo' : '') + '</span>' +
        '<time datetime="' + x.d + 'T' + x.h + '-03:00">' + DIAS[dt.getDay()] + ' ' + x.d.slice(8) + ', ' + x.h.replace(':', 'h') + '</time></li>';
    }).join('') + '</ol>';
  };

  /* Linha da agenda: etapa, data e contagem. Todos os horários ficam escondidos atrás de um botão. */
  var nLinha = 0;
  window.linhaAgenda = function (c, e) {
    var n = window.diasAte(e.d), id = 'hor-' + (++nLinha);
    var temSessoes = e.s && e.s.length;
    return '<div class="torre-linha' + (n <= 1 ? ' quente' : '') + '">' +
      '<a class="torre-cat" href="' + c.slug + '.html">' + esc(c.nome) + '</a>' +
      '<div class="torre-info"><a class="torre-evento" href="' + c.slug + '.html#calendario">' + esc(e.n) + '</a>' +
      '<span class="torre-local">' + esc(e.l) + (e.nota ? ', ' + esc(e.nota) : '') + '</span>' +
      (temSessoes ? '<button type="button" class="torre-horarios" aria-expanded="false" aria-controls="' + id + '">Ver todos os horários</button>' +
        '<div class="torre-sessoes" id="' + id + '" hidden>' + window.sessoes(e) + '</div>' : '') +
      '</div>' +
      '<div class="torre-quando">' + window.dataCurta(e.d) + '<small>' + window.quando(e.d) + '</small>' + window.contagem(e) + '</div></div>';
  };
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.torre-horarios');
    if (!b) return;
    var alvo = document.getElementById(b.getAttribute('aria-controls')), abrir = alvo.hidden;
    alvo.hidden = !abrir;
    b.setAttribute('aria-expanded', abrir);
    b.textContent = abrir ? 'Esconder horários' : 'Ver todos os horários';
  });

  /* Paralaxe de imagens (espera as outras páginas montarem o conteúdo) */
  document.addEventListener('DOMContentLoaded', paralaxe);
  function paralaxe() {
  var par = document.querySelectorAll('[data-paralaxe]');
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (par.length && !reduz) {
    var tick = false;
    function mover() {
      tick = false;
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var f = parseFloat(el.getAttribute('data-paralaxe')) || .15;
        var c = (r.top + r.height / 2 - vh / 2) * -f;
        el.style.transform = 'translate3d(0,' + c.toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(mover); } }, { passive: true });
    window.addEventListener('resize', mover);
    mover();
  }
  }
})();
