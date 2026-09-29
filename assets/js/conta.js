/* Entrar, Minha conta e Área do assinante. */
(function () {
  var pagina = document.body.getAttribute('data-pagina');
  var API = window.NAVEIA_API;
  var CATS = window.CATEGORIAS;
  var NOMES = { gratis: 'Grátis', medio: 'Médio', master: 'Master' };
  var NIVEL = { gratis: 0, medio: 1, master: 2 };
  var volta = new URLSearchParams(location.search).get('volta');
  if (volta && !/^[a-z0-9-]+\.html(#[a-z0-9-]*)?$/i.test(volta)) volta = null;

  function ir(url) { location.href = url; }
  function quando(txt) {
    var d = new Date(txt.replace(' ', 'T') + 'Z');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /* ---------- Entrar / criar conta ---------- */
  if (pagina === 'entrar') {
    var abas = [].slice.call(document.querySelectorAll('.ct-troca-btn'));
    function mostrar(id) {
      abas.forEach(function (b) { var sim = b.id === id; b.setAttribute('aria-selected', sim); document.getElementById(b.getAttribute('aria-controls')).hidden = !sim; });
    }
    abas.forEach(function (b) { b.addEventListener('click', function () { mostrar(b.id); }); });
    if (location.hash === '#criar') mostrar('t-criar');

    window.NAVEIA_EU.then(function (r) {
      if (r.semServidor) { document.querySelector('.ct-semservidor').hidden = false; return; }
      if (r.logado) ir(volta || 'conta.html');
    });

    /* Esqueceu a senha: troca o formulário de Entrar pelo de pedir o link */
    var fEntrar = document.getElementById('f-entrar'), fEsq = document.getElementById('f-esqueci');
    document.getElementById('ct-esqueci-btn').addEventListener('click', function () {
      fEntrar.hidden = true; fEsq.hidden = false; document.querySelector('.ct-troca').hidden = true;
      fEsq.email.value = fEntrar.email.value; fEsq.email.focus();
    });
    document.getElementById('ct-voltar-btn').addEventListener('click', function () {
      fEsq.hidden = true; fEntrar.hidden = false; document.querySelector('.ct-troca').hidden = false;
    });
    fEsq.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var erro = fEsq.querySelector('.ct-erro'), ok = fEsq.querySelector('.ct-ok'), btn = fEsq.querySelector('.ct-enviar');
      erro.hidden = true; ok.hidden = true; btn.disabled = true;
      API('esqueci', { email: fEsq.email.value }).then(function (r) {
        btn.disabled = false;
        if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
        ok.textContent = 'Pronto. Se existir uma conta com esse e-mail, o link chega em alguns minutos. Olhe também a caixa de spam.'; ok.hidden = false;
      }).catch(function () { erro.textContent = 'Não foi possível falar com o servidor. Tente de novo.'; erro.hidden = false; btn.disabled = false; });
    });

    [['f-entrar', 'entrar'], ['f-criar', 'cadastro']].forEach(function (par) {
      var f = document.getElementById(par[0]);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var dados = {}; [].forEach.call(f.elements, function (el) { if (el.name) dados[el.name] = el.value; });
        var erro = f.querySelector('.ct-erro'), btn = f.querySelector('.ct-enviar');
        erro.hidden = true; btn.disabled = true;
        API(par[1], dados).then(function (r) {
          if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; btn.disabled = false; return; }
          ir(volta || 'conta.html');
        }).catch(function () { erro.textContent = 'Não foi possível falar com o servidor. Tente de novo.'; erro.hidden = false; btn.disabled = false; });
      });
    });
    return;
  }

  /* As outras páginas exigem conta */
  window.NAVEIA_EU.then(function (r) {
    if (r.semServidor) { document.querySelector('main').innerHTML = '<div class="moldura ct-main"><p class="ct-sub">Não foi possível falar com o servidor de contas. Tente de novo em alguns minutos.</p></div>'; return; }
    if (r.teste) { document.querySelector('main').innerHTML = '<div class="moldura ct-main"><p class="ct-sub">Modo de teste ligado (?teste=1). Para ver sua conta de verdade, abra <a href="index.html?teste=0">o site como visitante</a> e entre.</p></div>'; return; }
    if (!r.logado) { ir('entrar.html?volta=' + pagina + '.html'); return; }
    if (pagina === 'conta') montarConta(r.usuario, r.modo_teste);
    if (pagina === 'painel') montarPainel(r.usuario);
  });

  function bloqueio(minimo) {
    return '<div class="ct-bloqueio"><b>Disponível no plano ' + NOMES[minimo] + '</b><span>Assine para liberar este recurso.</span><a class="pl-botao" href="planos.html">Ver os planos</a></div>';
  }

  /* ---------- Minha conta ---------- */
  function montarConta(u, modoTeste) {
    document.getElementById('ct-ola').textContent = 'Olá, ' + u.nome.split(' ')[0];
    /* Perfil: nome e e-mail da conta sempre à vista (é o e-mail para entrar e para pagar no Mercado Pago) */
    document.getElementById('ct-perfil').innerHTML =
      '<div><dt>Nome</dt><dd>' + esc(u.nome) + '</dd></div>' +
      '<div><dt>E-mail da conta</dt><dd>' + esc(u.email) + '</dd></div>' +
      '<p class="ct-sub">Use este e-mail para entrar no site. Na assinatura no cartão, o Mercado Pago precisa do mesmo e-mail que você usa lá.</p>';
    /* Foto do perfil: a imagem é diminuída no navegador (256x256) antes de ir para a conta */
    function desenharFoto(u) {
      var q = document.getElementById('ct-foto');
      q.innerHTML = u.foto ? '<img src="' + u.foto + '" alt="">' : '<span>' + esc((u.nome || '?').trim().charAt(0).toUpperCase()) + '</span>';
      document.getElementById('ct-foto-tirar').hidden = !u.foto;
      document.querySelector('.ct-foto-btn').firstChild.textContent = u.foto ? 'Trocar foto' : 'Colocar foto';
    }
    desenharFoto(u);
    var erroFoto = document.getElementById('ct-foto-erro');
    function salvarFoto(img) {
      erroFoto.hidden = true;
      API('foto', { imagem: img }).then(function (r) {
        if (!r.ok) { erroFoto.textContent = r.erro; erroFoto.hidden = false; return; }
        u = r.usuario; desenharFoto(u);
      }).catch(function () { erroFoto.textContent = 'Não foi possível salvar a foto. Tente de novo.'; erroFoto.hidden = false; });
    }
    document.getElementById('ct-foto-arquivo').addEventListener('change', function (e) {
      var arq = e.target.files && e.target.files[0]; e.target.value = '';
      if (!arq) return;
      if (!/^image\//.test(arq.type)) { erroFoto.textContent = 'Escolha um arquivo de imagem.'; erroFoto.hidden = false; return; }
      var img = new Image(), url = URL.createObjectURL(arq);
      img.onload = function () {
        var lado = Math.min(img.width, img.height), c = document.createElement('canvas');
        c.width = c.height = 256;
        c.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 256, 256);
        URL.revokeObjectURL(url);
        salvarFoto(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { erroFoto.textContent = 'Não foi possível abrir essa imagem. Tente outra.'; erroFoto.hidden = false; };
      img.src = url;
    });
    document.getElementById('ct-foto-tirar').addEventListener('click', function () { salvarFoto(''); });
    document.getElementById('ct-sair').addEventListener('click', function () { API('sair', {}).then(function () { ir('index.html'); }, function () { ir('index.html'); }); });

    function desenharPlano(u) {
      var ate = u.plano !== 'gratis' && u.plano_ate ? '<p class="ct-sub">Válido até ' + new Date(u.plano_ate).toLocaleDateString('pt-BR') + '.</p>' : '';
      document.getElementById('ct-plano').innerHTML =
        '<p class="ct-plano-nome">' + NOMES[u.plano] + '</p>' +
        '<p class="ct-sub">' + (u.plano === 'gratis' ? 'Você usa o site de graça. Assine para receber os alertas e liberar os recursos dos planos.' :
          u.plano === 'medio' ? 'Alertas e resumos no Telegram, aviso de mudança de horário, agenda do celular e o Chefe de Equipe.' : 'Tudo liberado: jogos, simulador, duelo, bolão e Raio-x.') + '</p>' + ate +
        (u.plano !== 'master' ? '<a class="pl-botao" href="planos.html">Ver os planos</a>' : '') +
        (u.assinatura ? '<p class="ct-sub">Assinatura no cartão ativa: cobra sozinha todo mês.</p><button type="button" class="ct-mini" id="ct-cancelar">Cancelar a cobrança automática</button><p class="ct-erro" id="ct-cancelar-erro" hidden></p>' : '') +
        (modoTeste ? '<div class="ct-teste"><p>Modo teste (só na conta do dono): troque de plano na hora, sem pagar.</p>' +
          ['gratis', 'medio', 'master'].map(function (p) { return '<button type="button" class="ct-mini" data-plano="' + p + '"' + (p === u.plano ? ' aria-pressed="true"' : '') + '>' + NOMES[p] + '</button>'; }).join('') + '</div>' : '');
    }
    desenharPlano(u);
    /* volta do Mercado Pago */
    var pg = new URLSearchParams(location.search).get('pagamento');
    if (pg) {
      var msg = { aprovado: 'Pagamento aprovado! Seu plano já está liberado. Se ainda aparecer o plano antigo, recarregue a página em 1 minuto.',
        pendente: 'Pagamento em análise. Assim que o Mercado Pago aprovar, seu plano libera sozinho.',
        assinatura: 'Assinatura recebida! Assim que o Mercado Pago confirmar o cartão, seu plano libera sozinho (normalmente em poucos minutos).' }[pg];
      if (msg) document.getElementById('ct-plano').insertAdjacentHTML('beforebegin', '<p class="ct-ok ct-pagamento">' + msg + '</p>');
      if (history.replaceState) history.replaceState(null, '', location.pathname);
    }
    document.getElementById('ct-plano').addEventListener('click', function (e) {
      if (e.target.id === 'ct-cancelar') {
        if (!confirm('Cancelar a cobrança automática? Seu plano continua até o fim do mês já pago.')) return;
        e.target.disabled = true;
        API('cancelar', {}).then(function (r) {
          if (!r.ok) { var er = document.getElementById('ct-cancelar-erro'); er.textContent = r.erro; er.hidden = false; e.target.disabled = false; return; }
          u = r.usuario; desenharPlano(u);
        });
        return;
      }
      var p = e.target.getAttribute('data-plano'); if (!p) return;
      API('plano_teste', { plano: p }).then(function (r) { if (r.ok) { u = r.usuario; desenharPlano(u); desenharAgenda(u); } });
    });

    /* Agenda do celular (plano Médio): cada categoria tem um arquivo .ics para assinar (assets/agenda/<categoria>.ics) */
    function desenharAgenda(u) {
      var el = document.getElementById('ct-agenda');
      var bloco = document.getElementById('agenda-celular');
      /* quem não tem plano não vê o bloco (o dono pediu para tirar o aviso de trancado) */
      bloco.hidden = NIVEL[u.plano] < 1;
      if (bloco.hidden) { el.innerHTML = ''; return; }
      var pasta = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '') + 'assets/agenda/';
      el.innerHTML = '<p class="ct-sub">Assine a agenda das categorias que você quer. Os horários entram sozinhos no calendário do celular, com aviso 30 minutos antes, e mudam sozinhos quando um horário muda.</p>' +
        '<ul class="ct-agenda">' + CATS.map(function (c) {
          var https = pasta + c.slug + '.ics';
          return '<li><b>' + esc(c.nome) + '</b><a class="ct-mini" href="' + esc(https.replace(/^https?:/, 'webcal:')) + '">Assinar no celular</a>' +
            '<button type="button" class="ct-mini ct-copiar" data-link="' + esc(https) + '">Copiar link</button></li>';
        }).join('') + '</ul>' +
        '<details class="ct-ajuda"><summary>Como assinar</summary><ol>' +
        '<li><b>iPhone:</b> toque em <b>Assinar no celular</b> e depois em <b>Assinar</b>.</li>' +
        '<li><b>Android (Google Agenda):</b> toque em <b>Copiar link</b>. No computador, abra calendar.google.com, clique no <b>+</b> ao lado de "Outras agendas", escolha <b>Do URL</b>, cole o link e clique em <b>Adicionar agenda</b>.</li>' +
        '<li><b>Outlook e outros:</b> use <b>Copiar link</b> e adicione como "agenda da internet".</li></ol></details>';
    }
    desenharAgenda(u);
    document.getElementById('ct-agenda').addEventListener('click', function (e) {
      var cp = e.target.closest('.ct-copiar'); if (!cp) return;
      var link = cp.getAttribute('data-link'), feito = function () { cp.textContent = 'Link copiado'; setTimeout(function () { cp.textContent = 'Copiar link'; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(feito, function () { window.prompt('Copie o link:', link); });
      else window.prompt('Copie o link:', link);
    });
  }

  /* ---------- Área do assinante ---------- */
  function montarPainel(u) {
    var nivel = NIVEL[u.plano];
    if (nivel === 0) document.getElementById('pa-titulo').textContent = 'Assine para liberar sua área.';
    [].forEach.call(document.querySelectorAll('.pa-secao'), function (s) {
      var minimo = s.getAttribute('data-minimo');
      if (nivel < NIVEL[minimo]) {
        var alvo = s.querySelector('.torre, .pl-previa, .pl-mar, .pl-sim, .pa-rx');
        if (alvo) alvo.outerHTML = bloqueio(minimo);
      }
    });

    /* Suas próximas sessões */
    var torre = document.getElementById('pa-torre');
    if (torre) {
      var hoje = window.hojeISO(), linhas = [];
      CATS.forEach(function (c) {
        if (u.categorias.length && u.categorias.indexOf(c.slug) < 0) return;
        var e = c.calendario.filter(function (x) { return x.d && x.d >= hoje && !x.venc; })[0];
        if (e) linhas.push({ c: c, e: e });
      });
      linhas.sort(function (a, b) { return a.e.d < b.e.d ? -1 : 1; });
      torre.innerHTML = linhas.map(function (p) {
        return window.linhaAgenda(p.c, p.e);
      }).join('') || '<p class="ct-vazio">Nenhuma etapa marcada para as suas categorias.</p>';
    }

    var prev = document.getElementById('previa');
    if (prev) prev.setAttribute('data-plano', nivel >= 2 ? 'master' : 'medio');
    window.NAVEIA_FAVORITAS = u.categorias;
    if (nivel >= 1) {
      var s = document.createElement('script');
      s.src = 'assets/js/planos.js';
      document.body.appendChild(s);
    }
  }
})();
