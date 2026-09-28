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
    document.getElementById('ct-sair').addEventListener('click', function () { API('sair', {}).then(function () { ir('index.html'); }, function () { ir('index.html'); }); });

    function desenharPlano(u) {
      var ate = u.plano !== 'gratis' && u.plano_ate ? '<p class="ct-sub">Válido até ' + new Date(u.plano_ate).toLocaleDateString('pt-BR') + '.</p>' : '';
      document.getElementById('ct-plano').innerHTML =
        '<p class="ct-plano-nome">' + NOMES[u.plano] + '</p>' +
        '<p class="ct-sub">' + (u.plano === 'gratis' ? 'Você usa o site de graça. Assine para receber os alertas e liberar os recursos dos planos.' :
          u.plano === 'medio' ? 'Alertas no Telegram, agenda do celular, resumo da segunda, sua página de categorias e o Chefe de Equipe.' : 'Tudo liberado: jogos, simulador, duelo, bolão e Raio-x.') + '</p>' + ate +
        (u.plano !== 'master' ? '<a class="pl-botao" href="planos.html">Ver os planos</a>' : '') +
        (modoTeste ? '<div class="ct-teste"><p>Modo teste (só na conta do dono): troque de plano na hora, sem pagar.</p>' +
          ['gratis', 'medio', 'master'].map(function (p) { return '<button type="button" class="ct-mini" data-plano="' + p + '"' + (p === u.plano ? ' aria-pressed="true"' : '') + '>' + NOMES[p] + '</button>'; }).join('') + '</div>' : '');
    }
    function desenharAtalhos(u) {
      var n = NIVEL[u.plano], itens = [
        ['minhas.html', 'Suas categorias', 1], ['minhas.html#agenda-celular', 'Agenda do celular', 1], ['jogos.html#chefe', 'Chefe de Equipe', 1],
        ['jogos.html', 'Todos os jogos', 2], ['simulador.html', 'Simulador completo', 2], ['duelo.html', 'Duelo de pilotos', 2], ['bolao.html', 'Bolão entre membros', 2], ['raiox.html', 'Raio-x pós-corrida', 2]];
      var meus = itens.filter(function (i) { return n >= i[2]; });
      document.getElementById('ct-atalhos').innerHTML = meus.length
        ? '<ul class="ct-atalhos">' + meus.map(function (i) { return '<li><a href="' + i[0] + '">' + i[1] + '</a></li>'; }).join('') + '</ul>'
        : bloqueio('medio');
    }
    desenharPlano(u); desenharAtalhos(u);
    document.getElementById('ct-plano').addEventListener('click', function (e) {
      var p = e.target.getAttribute('data-plano'); if (!p) return;
      API('plano_teste', { plano: p }).then(function (r) { if (r.ok) { u = r.usuario; desenharPlano(u); desenharAtalhos(u); } });
    });

    /* Categorias (ficam na conta; a página Suas categorias usa estas) */
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
