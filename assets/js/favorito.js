/* Conta e favorito (carregado por site.js em todas as páginas):
   1. aviso de login: quem não está logado e toca para ler uma notícia ou usar o "meu time" vê o convite para entrar
      ou criar a conta grátis. Depois do login volta para onde estava. Sem o servidor das contas (fora do ar ou na
      prévia), não trava nada; para ver o aviso mesmo assim, abra a página com ?testar-login=1
      (e ?testar-favorito=1 para ver a escolha de esporte e equipe).
   2. depois do login: "Escolha seu esporte favorito" (Futebol, Basquete ou Fórmula 1) e "Escolha sua equipe favorita".
      O site inteiro fica na cor da equipe (NAVEIA_TEMA, cores em NAVEIA_EQUIPES no site.js) e ela vira o "meu time". */
(function () {
  var esc = window.esc;
  var aqui = location.pathname.split('/').pop() || 'index.html';
  var testar = /[?&]testar-login=1/.test(location.search);
  var ESPORTES = [
    ['futebol', 'Futebol', '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z"/></svg>'],
    ['basquete', 'Basquete', '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6a9 9 0 0 1 0 12.8M18.4 5.6a9 9 0 0 0 0 12.8"/></svg>'],
    ['formula-1', 'Fórmula 1', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15.5l1.8-4.8A2 2 0 0 1 6.7 9.4h9.1a2 2 0 0 1 1.6.8l2.6 3.3H21v2H3z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/></svg>']
  ];
  function grupo(esp) { return esp === 'formula-1' ? 'Fórmula 1' : esp === 'basquete' ? 'Basquete' : 'Futebol'; }
  function lerFav() { return window.NAVEIA_FAV ? window.NAVEIA_FAV() : {}; }
  function janela(id, html, travada) {
    var d = document.getElementById(id); if (d) d.remove();
    d = document.createElement('div'); d.id = id; d.className = 'bv fv'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="bv-caixa">' + (travada ? '' : '<button type="button" class="bv-fechar" aria-label="Fechar">×</button>') + html + '</div>';
    document.body.appendChild(d);
    d.fechar = function () { d.classList.remove('ativo'); setTimeout(function () { d.remove(); }, 250); };
    if (!travada) {
      d.querySelector('.bv-fechar').addEventListener('click', d.fechar);
      d.addEventListener('click', function (e) { if (e.target === d) d.fechar(); });
    }
    setTimeout(function () { d.classList.add('ativo'); }, 20);
    return d;
  }

  /* 1. aviso de login */
  var TRAVA = 'a[href*="noticia-"], .ft-not, .bq-not, .pg-not, .pg-fatos a, .hm-card, [data-mt-escolher], .mt-convite, #pg-meu';
  function avisoLogin(destino, meuTime, travada) {
    if (!/^[a-z0-9-]+\.html(#[a-z0-9-]*)?$/i.test(destino)) destino = aqui;
    var v = encodeURIComponent(destino);
    janela('fv-login', '<p class="bv-rot">Arena Sports</p><h2>Entre para continuar</h2>' +
      '<p class="bv-sub">' + (meuTime ? 'Entre na sua conta para escolher o seu time e ver os jogos dele primeiro.' : 'Crie sua conta grátis ou entre para ler as notícias. É rápido e não custa nada.') + '</p>' +
      '<div class="bv-acoes"><a class="bv-conta" href="entrar.html?volta=' + v + '#criar">Criar conta grátis</a><a class="bv-salvar" href="entrar.html?volta=' + v + '">Já tenho conta: entrar</a></div>' +
      (travada ? '<p class="bv-nota"><a href="inicio.html">Voltar para o início</a></p>' : '<p class="bv-nota">Depois de entrar você escolhe seu esporte e sua equipe, e o site fica com as cores dela.</p>'), travada);
  }
  window.NAVEIA_EU.then(function (r) {
    var logado = r && r.logado;
    if (logado || (r && r.semServidor && !testar) || /entrar|conta|redefinir|privacidade|termos/.test(aqui)) return;
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest && ev.target.closest(TRAVA); if (!el) return;
      ev.preventDefault(); ev.stopPropagation();
      avisoLogin(el.getAttribute('href') || aqui, el.matches('[data-mt-escolher], .mt-convite, #pg-meu'));
    }, true);
    if (/^noticia-/.test(aqui)) avisoLogin(aqui, false, true); /* notícia aberta direto (link ou Google) */
  });

  /* 2. esporte e equipe favoritos */
  function escolher(u) {
    var fav = lerFav(), esp = fav.esporte || '';
    var d = janela('fv-escolha', '<p class="bv-rot">Bem-vindo' + (u && u.nome ? ', ' + esc(String(u.nome).split(' ')[0]) : '') + '</p>' +
      '<h2>Escolha seu esporte favorito</h2><div class="fv-esportes">' + ESPORTES.map(function (e) {
        return '<button type="button" class="fv-esp" data-esp="' + e[0] + '" aria-pressed="' + (esp === e[0]) + '">' + e[2] + '<span>' + e[1] + '</span></button>';
      }).join('') + '</div><div class="fv-equipes" id="fv-equipes"></div>' +
      '<div class="bv-acoes"><button type="button" class="bv-salvar fv-pronto" disabled>Pronto</button></div>');
    var escolha = { esporte: esp, equipe: fav.equipe || '' };
    function times() {
      var caixa = d.querySelector('#fv-equipes');
      if (!escolha.esporte) { caixa.innerHTML = ''; return; }
      var lista = (window.NAVEIA_EQUIPES || []).filter(function (e) { return e.c === grupo(escolha.esporte); });
      caixa.innerHTML = '<h3>Escolha sua equipe favorita</h3><p class="bv-sub">O site inteiro fica com a cor dela.</p><div class="fv-times">' + lista.map(function (e) {
        var img = (window.ESCUDOS || {})[e.n];
        return '<button type="button" class="fv-time" data-eq="' + esc(e.n) + '" aria-pressed="' + (escolha.equipe === e.n) + '" style="--c:' + e.cor + '">' +
          (img ? '<img src="' + img + '" alt="" loading="lazy">' : '<i aria-hidden="true"></i>') + '<span>' + esc(e.n) + '</span></button>';
      }).join('') + '</div>';
    }
    d.addEventListener('click', function (ev) {
      var b = ev.target.closest('.fv-esp');
      if (b) {
        escolha.esporte = b.getAttribute('data-esp'); escolha.equipe = '';
        [].forEach.call(d.querySelectorAll('.fv-esp'), function (x) { x.setAttribute('aria-pressed', x === b); });
        d.querySelector('.fv-pronto').disabled = true; times(); return;
      }
      var t = ev.target.closest('.fv-time');
      if (t) {
        escolha.equipe = t.getAttribute('data-eq');
        [].forEach.call(d.querySelectorAll('.fv-time'), function (x) { x.setAttribute('aria-pressed', x === t); });
        window.NAVEIA_TEMA(escolha.equipe); /* a cor muda na hora, para a pessoa ver */
        d.querySelector('.fv-pronto').disabled = false;
      }
    });
    d.querySelector('.fv-pronto').addEventListener('click', function () {
      var f = lerFav(); f.esporte = escolha.esporte; f.equipe = escolha.equipe; window.NAVEIA_FAV(f);
      /* vira o "meu time" do esporte (futebol e basquete) */
      if (escolha.esporte !== 'formula-1') {
        if (window.marcarMeuTime) window.marcarMeuTime(escolha.esporte, escolha.equipe);
        else try { var m = JSON.parse(localStorage.getItem('naveia-meu-time') || '{}'); m[escolha.esporte] = escolha.equipe; localStorage.setItem('naveia-meu-time', JSON.stringify(m)); } catch (e) {}
      }
      /* guarda na conta, para valer em qualquer aparelho */
      if (u && u.nome && window.NAVEIA_API) window.NAVEIA_API('perfil', { nome: u.nome, piloto: u.piloto || '', equipe: escolha.equipe }).catch(function () {});
      d.fechar();
    });
    times();
  }
  window.NAVEIA_ESCOLHER_FAVORITO = function () { window.NAVEIA_EU.then(function (r) { escolher((r && r.usuario) || {}); }); };
  window.NAVEIA_EU.then(function (r) {
    if (!(r && r.logado) && !/[?&]testar-favorito=1/.test(location.search)) return;
    if (lerFav().esporte || /entrar|redefinir|privacidade|termos/.test(aqui)) return;
    setTimeout(function () { escolher((r && r.usuario) || {}); }, 600);
  });
})();
