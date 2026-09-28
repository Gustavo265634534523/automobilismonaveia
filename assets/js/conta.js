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
    if (r.semServidor) { document.querySelector('main').innerHTML = '<div class="moldura ct-main"><p class="ct-sub">Esta página só funciona com o site aberto pelo servidor (localhost:8765 ou o site no ar).</p></div>'; return; }
    if (!r.logado) { ir('entrar.html?volta=' + pagina + '.html'); return; }
    if (pagina === 'conta') montarConta(r.usuario, r.modo_teste);
    if (pagina === 'painel') montarPainel(r.usuario);
  });

  /* ---------- Agenda do celular (.ics) ---------- */
  function baixarAgenda(favs) {
    function ics(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; }
    var ev = [], agora = Date.now();
    CATS.forEach(function (c) {
      if (favs.length && favs.indexOf(c.slug) < 0) return;
      c.calendario.forEach(function (e) {
        (e.s || []).forEach(function (x, i) {
          var ini = new Date(x.d + 'T' + x.h + ':00-03:00').getTime();
          if (ini < agora) return;
          ev.push(['BEGIN:VEVENT', 'UID:naveia-' + c.slug + '-' + e.e + '-' + i + '@naveia', 'DTSTAMP:' + ics(agora), 'DTSTART:' + ics(ini), 'DTEND:' + ics(ini + 36e5),
            'SUMMARY:' + c.nome + ', ' + x.t + ' (' + e.n + ')', 'LOCATION:' + e.l,
            'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Começa em 30 minutos', 'END:VALARM', 'END:VEVENT'].join('\r\n'));
        });
      });
    });
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Automobilismo Na Veia//Agenda//PT'].concat(ev, ['END:VCALENDAR']).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' }));
    a.download = 'agenda-na-veia.ics';
    document.body.appendChild(a); a.click(); a.remove();
    return ev.length;
  }

  function bloqueio(minimo) {
    return '<div class="ct-bloqueio"><b>Disponível no plano ' + NOMES[minimo] + '</b><span>Assine para liberar este recurso.</span><a class="pl-botao" href="planos.html">Ver os planos</a></div>';
  }

  /* ---------- Minha conta ---------- */
  function montarConta(u, modoTeste) {
    document.getElementById('ct-ola').textContent = 'Olá, ' + u.nome.split(' ')[0];
    document.getElementById('ct-sair').addEventListener('click', function () { API('sair', {}).then(function () { ir('index.html'); }); });

    function desenharPlano(u) {
      var niveis = ['medio', 'master'];
      document.getElementById('ct-plano').innerHTML =
        '<p class="ct-plano-nome">' + NOMES[u.plano] + '</p>' +
        '<p class="ct-sub">' + (u.plano === 'gratis' ? 'Você usa o site de graça. Assine para receber alertas, prévias e os recursos do Master.' :
          u.plano === 'medio' ? 'Alertas, agenda do celular, prévia essencial e sua página de categorias.' : 'Tudo liberado: prévia completa, Maratona, simulador e Raio-x.') + '</p>' +
        (u.plano !== 'master' ? '<a class="pl-botao" href="planos.html">Ver os planos</a>' : '') +
        (modoTeste ? '<div class="ct-teste"><p>Modo teste: troque de plano na hora, sem pagar.</p>' +
          ['gratis'].concat(niveis).map(function (p) { return '<button type="button" class="ct-mini" data-plano="' + p + '"' + (p === u.plano ? ' aria-pressed="true"' : '') + '>' + NOMES[p] + '</button>'; }).join('') + '</div>' : '');
    }
    desenharPlano(u);
    document.getElementById('ct-plano').addEventListener('click', function (e) {
      var p = e.target.getAttribute('data-plano'); if (!p) return;
      API('plano_teste', { plano: p }).then(function (r) { if (r.ok) { u = r.usuario; desenharPlano(u); desenharTelegram(u); desenharAgenda(u); } });
    });

    /* Avisos */
    function desenharAvisos() {
      API('avisos').then(function (r) {
        var lista = r.avisos || [];
        document.getElementById('ct-avisos').innerHTML = lista.length ? lista.map(function (a) {
          return '<li class="ct-aviso ct-aviso-' + a.tipo + (a.lido ? '' : ' novo') + '"><time>' + quando(a.criado_em) + (a.telegram ? ', enviado no Telegram' : '') + '</time><b>' + esc(a.titulo) + '</b><span>' + esc(a.texto) + '</span></li>';
        }).join('') : '<li class="ct-vazio">Nenhum aviso ainda. Com um plano ativo, os alertas de largada e os vencedores aparecem aqui.</li>';
        if (lista.some(function (a) { return !a.lido; })) setTimeout(function () { API('avisos_lidos', {}); }, 1500);
      });
    }
    desenharAvisos();
    var teste = document.getElementById('ct-teste');
    if (!modoTeste) teste.remove();
    else teste.addEventListener('click', function () { API('teste_aviso', {}).then(desenharAvisos); });

    /* Categorias */
    var favs = u.categorias.slice();
    var caixa = document.getElementById('ct-cats');
    caixa.innerHTML = CATS.map(function (c) {
      return '<label class="pl-chip"><input type="checkbox" value="' + c.slug + '"' + (favs.indexOf(c.slug) > -1 ? ' checked' : '') + '><span>' + esc(c.nome) + '</span></label>';
    }).join('');
    var ok = document.getElementById('ct-cats-ok'), t;
    caixa.addEventListener('change', function () {
      favs = [].slice.call(caixa.querySelectorAll('input:checked')).map(function (i) { return i.value; });
      API('preferencias', { categorias: favs }).then(function (r) {
        if (!r.ok) return; u = r.usuario; ok.hidden = false; clearTimeout(t); t = setTimeout(function () { ok.hidden = true; }, 2000);
      });
    });

    /* Telegram */
    function desenharTelegram(u) {
      var el = document.getElementById('ct-tg');
      if (NIVEL[u.plano] < 1) { el.innerHTML = bloqueio('medio'); return; }
      if (!u.telegram.configurado) {
        el.innerHTML = '<p class="ct-sub">O bot do Telegram do site ainda não foi configurado. Enquanto isso, os avisos aparecem na caixa de Avisos desta página.</p>';
        return;
      }
      if (u.telegram.ligado) {
        el.innerHTML = '<p class="ct-ligado">Telegram ligado. Os alertas chegam no seu celular.</p><button type="button" class="ct-mini" id="ct-tg-off">Desligar</button>';
        document.getElementById('ct-tg-off').addEventListener('click', function () { API('telegram_desligar', {}).then(function (r) { if (r.ok) desenharTelegram(r.usuario); }); });
        return;
      }
      el.innerHTML = '<p class="ct-sub">Receba o alerta de largada e o vencedor direto no Telegram.</p><button type="button" class="pl-botao" id="ct-tg-on">Ligar Telegram</button><div id="ct-tg-passos"></div>';
      document.getElementById('ct-tg-on').addEventListener('click', function () {
        API('telegram_codigo', {}).then(function (r) {
          var p = document.getElementById('ct-tg-passos');
          if (!r.ok) { p.innerHTML = '<p class="ct-erro">' + esc(r.erro) + '</p>'; return; }
          p.innerHTML = '<ol class="ct-passos"><li><a href="' + r.link + '" target="_blank" rel="noopener">Abra o bot do Na Veia no Telegram</a> e toque em Começar.</li>' +
            '<li>Se o Telegram pedir, mande a mensagem <b>/start ' + r.codigo + '</b>.</li><li>Em até 5 minutos chega a confirmação no seu Telegram.</li></ol>';
        });
      });
    }
    desenharTelegram(u);

    /* Agenda do celular */
    function desenharAgenda(u) {
      var el = document.getElementById('ct-agenda');
      if (NIVEL[u.plano] < 1) { el.innerHTML = bloqueio('medio'); return; }
      el.innerHTML = '<p class="ct-sub">Baixe um arquivo com todas as sessões das suas categorias. Ele abre no Google Agenda, no iPhone e no Outlook, com aviso 30 minutos antes.</p><button type="button" class="pl-botao" id="ct-ag-baixar">Baixar para a agenda</button><p class="ct-ok" id="ct-ag-ok" role="status" hidden></p>';
      document.getElementById('ct-ag-baixar').addEventListener('click', function () {
        var n = baixarAgenda(u.categorias);
        var m = document.getElementById('ct-ag-ok'); m.textContent = n + ' sessões baixadas.'; m.hidden = false;
      });
    }
    desenharAgenda(u);
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
