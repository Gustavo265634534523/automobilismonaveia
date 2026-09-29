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

  /* As 12 categorias organizadas em 3 grupos (usado no painel, na página inicial e no rodapé) */
  var PORSLUG = {}; CATS.forEach(function (c) { PORSLUG[c.slug] = c; });
  var GRUPOS = [
    { nome: 'Monopostos', desc: 'Carros de fórmula, com rodas descobertas', slugs: ['formula-1', 'formula-2', 'formula-3', 'formula-e', 'indycar'] },
    { nome: 'Turismo e Endurance', desc: 'Carros de carroceria fechada e corridas longas', slugs: ['stock-car', 'porsche-cup', 'nascar', 'endurance'] },
    { nome: 'Motos e Terra', desc: 'Duas rodas e estradas de terra', slugs: ['motogp', 'motocross', 'rally'] }
  ].map(function (g) { g.cats = g.slugs.map(function (s) { return PORSLUG[s]; }).filter(Boolean); return g; });
  window.GRUPOS = GRUPOS;

  /* Topo */
  var topo = document.getElementById('topo');
  if (topo) {
    var principais = CATS.filter(function (c) { return c.principal; });
    var ordem = ['formula-1', 'motogp', 'stock-car', 'porsche-cup'];
    principais.sort(function (a, b) { return ordem.indexOf(a.slug) - ordem.indexOf(b.slug); });

    var nav = principais.map(function (c, i) {
      var subs = SECOES.filter(function (s) { return s[0] !== 'noticias'; }).map(function (s) { return '<li><a href="' + pagina(c) + '#' + s[0] + '">' + s[1] + '</a></li>'; }).join('');
      return '<div class="nav-item"><button class="nav-link" aria-expanded="false" aria-controls="sub-' + i + '"' + (c.slug === atual ? ' aria-current="page"' : '') + '>' + esc(c.menu) + seta + '</button>' +
        '<ul class="sub" id="sub-' + i + '"><li><a href="' + pagina(c) + '">Página da ' + esc(c.menu) + '</a></li>' + subs + '</ul></div>';
    }).join('');

    topo.className = 'topo';
    topo.innerHTML =
      '<div class="moldura topo-in">' +
        '<a class="marca" href="index.html" aria-label="Automobilismo Na Veia, início"><span class="marca-sinal" aria-hidden="true"><i></i><i></i></span>' +
        '<span class="marca-nome"><small>AUTOMOBILISMO</small>NA VEIA</span></a>' +
        '<nav class="nav" aria-label="Categorias principais"><div class="nav-item"><a class="nav-link" href="noticias.html"' + (paginaAtual === 'noticias' ? ' aria-current="page"' : '') + ' title="Notícias de todas as categorias">Últimas notícias</a></div>' + nav + '</nav>' +
        '<a class="conta-link" id="conta-link" href="entrar.html">Entrar</a>' +
        '<a class="planos-btn" href="planos.html"' + (location.pathname.indexOf('planos') > -1 ? ' aria-current="page"' : '') + '>Planos</a>' +
        '<button class="todas" aria-expanded="false" aria-controls="painel" title="Todas as categorias"><span class="todas-txt">Todas as categorias</span>' +
        '<span class="grade-ic" aria-hidden="true">' + new Array(10).join('<i></i>') + '</span><span class="sr">Abrir todas as categorias</span></button>' +
        '<button type="button" class="idioma-btn" id="idioma-btn" data-sem-traducao aria-label="' + (window.LANG === 'en' ? 'Change the site language' : 'Mudar o idioma do site') + '" title="' + (window.LANG === 'en' ? 'Português' : 'English') + '">' +
          '<span' + (window.LANG !== 'en' ? ' class="ativo"' : '') + '>PT</span><i aria-hidden="true"></i><span' + (window.LANG === 'en' ? ' class="ativo"' : '') + '>EN</span></button>' +
      '</div>';

    var painel = document.createElement('div');
    painel.className = 'painel'; painel.id = 'painel';
    painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-label', 'Todas as categorias');
    painel.innerHTML = '<div class="moldura painel-in"><a class="painel-noticias" href="noticias.html"><b>Notícias</b><span>Tudo o que está acontecendo no automobilismo</span></a>' + GRUPOS.map(function (g) {
      return '<section class="painel-grupo"><h2>' + esc(g.nome) + '</h2><ul class="painel-lista">' + g.cats.map(function (c) {
        return '<li><a class="painel-cat" href="' + pagina(c) + '"><strong>' + esc(c.nome) + '</strong><span><em>' + esc(c.lider.nome) + '</em><br>' + esc(c.lider.info) + '</span></a>' +
          '<ul class="painel-secoes">' + SECOES.slice(1, 5).map(function (s) { return '<li><a href="' + pagina(c) + '#' + s[0] + '">' + s[1] + '</a></li>'; }).join('') + '</ul></li>';
      }).join('') + '</ul></section>';
    }).join('') +
      '<section class="painel-planos" aria-labelledby="painel-planos-t">' +
        '<div class="painel-planos-cab"><h2 id="painel-planos-t">Mais perto da pista</h2><p>O site continua de graça. Os planos entregam o que vem antes da largada e depois da bandeirada.</p></div>' +
        '<div class="cp-grade">' +
          '<article class="cp-plano"><h3>Médio</h3><p class="cp-preco"><b>R$ 14,90</b> por mês</p><ul>' +
            '<li>Alerta 30 minutos antes da largada</li><li>Vencedor no celular logo depois da corrida</li><li>Sessões direto na agenda do celular</li>' +
            '<li>Resumo da segunda-feira</li><li>Página só com as suas categorias</li><li>Chefe de Equipe: 15 corridas por dia</li></ul></article>' +
          '<article class="cp-plano cp-master"><h3>Master</h3><p class="cp-preco"><b>R$ 29,90</b> por mês</p><ul>' +
            '<li>Tudo do plano Médio</li><li>Prévia da etapa completa</li><li>Maratona do fim de semana</li><li>Simulador completo</li>' +
            '<li>Duelo de pilotos</li><li>Raio-x pós-corrida com gráficos</li><li>Bolão entre membros</li><li>Grupo fechado</li><li>Jogos sem limite</li></ul></article>' +
        '</div>' +
        '<div class="painel-planos-acoes"><a class="botao" href="planos.html">Ver os planos</a><a class="painel-guia" href="guia.html">Novo por aqui? Guia para iniciantes</a><a class="painel-guia painel-conta" href="entrar.html">Entrar ou minha conta</a></div>' +
      '</section></div>';
    topo.after(painel);

    /* Faixa de anúncio dos planos (some na página de planos e fica fechada por 7 dias quando a pessoa fecha) */
    var fechadoEm = 0;
    try { fechadoEm = +localStorage.getItem('avisoPlanosFechado') || 0; } catch (e) {}
    if (location.pathname.indexOf('planos') < 0 && Date.now() - fechadoEm > 7 * 864e5) {
      var aviso = document.createElement('div');
      aviso.className = 'aviso-planos';
      aviso.innerHTML = '<div class="moldura"><p><span class="aviso-longo">Alertas de largada, prévias das etapas e simulador de campeonato.</span>' +
        '<span class="aviso-curto">Mais acesso com os planos.</span></p><a href="planos.html">Conhecer os planos</a></div>' +
        '<button class="aviso-fechar" type="button" aria-label="Fechar aviso">×</button>';
      topo.appendChild(aviso);
      document.documentElement.classList.add('com-aviso');
      aviso.querySelector('.aviso-fechar').addEventListener('click', function () {
        aviso.remove();
        document.documentElement.classList.remove('com-aviso');
        try { localStorage.setItem('avisoPlanosFechado', String(Date.now())); } catch (e) {}
      });
    }

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

  /* Modo de teste: só no computador e só quando pedido (?teste=1 liga, ?teste=0 desliga).
     Sem ele, o computador mostra o site igual ao visitante vê: tudo que é do plano fica trancado. */
  window.NAVEIA_PC = /^(localhost|127.0.0.1|)$/.test(location.hostname);
  try {
    var mTeste = location.search.match(/[?&]teste=(0|1|medio)/);
    if (mTeste && window.NAVEIA_PC) localStorage.setItem('naveia-teste', mTeste[1]);
    var vTeste = window.NAVEIA_PC ? localStorage.getItem('naveia-teste') : null;
    window.NAVEIA_TESTE = vTeste === '1' || vTeste === 'medio';
    window.NAVEIA_TESTE_PLANO = vTeste === 'medio' ? 'medio' : 'master'; /* ?teste=medio: vê o site como assinante do Médio */
  } catch (e) { window.NAVEIA_TESTE = false; }

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
  /* ?teste=1 / ?teste=medio no computador: finge um assinante, sem precisar de conta */
  window.NAVEIA_EU = window.NAVEIA_TESTE
    ? Promise.resolve({ ok: true, logado: true, teste: true, usuario: { nome: 'Teste', email: '', plano: window.NAVEIA_TESTE_PLANO, categorias: [] } })
    : /^https?:/.test(location.protocol)
      ? window.NAVEIA_API('eu').catch(function () { return { ok: false, logado: false, semServidor: true }; })
      : Promise.resolve({ ok: false, logado: false, semServidor: true });
  window.NAVEIA_EU.then(function (r) {
    var l = document.getElementById('conta-link');
    if (!l) return;
    if (r.semServidor) { l.remove(); var pc = document.querySelector('.painel-conta'); if (pc) pc.remove(); return; }
    if (r.logado) {
      l.href = 'conta.html';
      l.innerHTML = '<span class="conta-longo">Minha </span>conta';
    }
    if (/conta|entrar|painel/.test(location.pathname)) l.setAttribute('aria-current', 'page');
  });

  /* Service worker: guarda páginas e imagens para abrir mais rápido. O site não é instalável (sem manifest). */
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
      '<a class="marca" href="index.html"><span class="marca-sinal" aria-hidden="true"><i></i><i></i></span><span class="marca-nome"><small>AUTOMOBILISMO</small>NA VEIA</span></a>' +
      '<p>Doze categorias acompanhadas de perto. Dados atualizados em ' + esc(window.ATUALIZADO) + '.</p>' +
      '<p class="rodape-contato"><span>Contato:</span> <a href="mailto:automobilismonaveiacontato@gmail.com">automobilismonaveiacontato@gmail.com</a>' +
        '<button type="button" class="copiar-email" data-email="automobilismonaveiacontato@gmail.com">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span>Copiar</span></button></p></div>' +
      GRUPOS.map(function (g) { return coluna(g.nome, g.cats.map(function (c) { return li(pagina(c), esc(c.nome)); })); }).join('') +
      coluna('O site', [li('noticias.html', 'Notícias'), li('guia.html', 'Guia para iniciantes'), li('planos.html', 'Planos'), li('conta.html', 'Minha conta'), li('privacidade.html', 'Política de privacidade'), li('termos.html', 'Termos de uso')]) +
      '</div>' +
      /* Área de teste do dono: só aparece no computador (localhost), nunca no site no ar */
      (local ? '<nav class="rodape-teste" aria-label="Área de teste"><h2>Área de teste <small>só aparece no seu computador</small></h2><ul>' +
        [['minhas.html?teste=medio', 'Suas categorias (Médio)'], ['duelo.html?teste=1', 'Duelo de pilotos'], ['bolao.html?teste=1', 'Bolão entre membros'], ['jogos.html?teste=1', 'Jogos (Master)'], ['jogos.html?teste=medio#chefe', 'Chefe de Equipe (Médio)'], ['simulador.html?teste=1', 'Simulador completo'], ['raiox.html?teste=1', 'Raio-x']]
          .map(function (x) { return '<li><a href="' + x[0] + '">' + x[1] + '</a></li>'; }).join('') +
        '<li><a class="rodape-teste-sair" href="index.html?teste=0">' + (window.NAVEIA_TESTE ? 'Voltar a ver como visitante' : 'Vendo como visitante') + '</a></li></ul></nav>' : '') +
      '<div class="rodape-base"><span>Imagens do site geradas por inteligência artificial, sem equipe, marca ou patrocinador real.</span></div></div>';
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
