/* Bate-papo da torcida: botão flutuante em todas as páginas.
   Todo mundo lê; para escrever precisa entrar na conta. Mensagens ficam no servidor de contas (ações chat_ler,
   chat_enviar e chat_apagar) e somem depois de 7 dias. O site só pergunta por mensagens novas com o chat aberto
   (a cada 6 segundos) e, fechado, a cada 90 segundos para acender o aviso de mensagem nova. */
(function () {
  if (!window.NAVEIA_API || /entrar|redefinir/.test(location.pathname)) return;
  var esc = window.esc;
  var ultimo = 0, aberto = false, carregou = false, timer = null, info = { logado: false, dono: false, bloqueado: false };
  var vistoAte = 0;
  try { vistoAte = +localStorage.getItem('naveia-chat-visto') || 0; } catch (e) {}

  var bt = document.createElement('button');
  bt.type = 'button'; bt.className = 'chat-bt'; bt.setAttribute('aria-expanded', 'false'); bt.setAttribute('aria-controls', 'chat-caixa');
  bt.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>Bate-papo</span><i class="chat-novo" hidden></i>';

  var caixa = document.createElement('section');
  caixa.id = 'chat-caixa'; caixa.className = 'chat-caixa'; caixa.hidden = true; caixa.setAttribute('aria-label', 'Chat da torcida');
  caixa.innerHTML = '<header class="chat-cab"><div><b>Chat da torcida</b><small>Respeito sempre. Sem links. As mensagens somem em 7 dias.</small></div>' +
    '<button type="button" class="chat-fechar" aria-label="Fechar o bate-papo">×</button></header>' +
    '<div class="chat-enq" data-enquete="chat"></div>' +
    '<ol class="chat-lista" aria-live="polite"><li class="chat-vazio">Carregando…</li></ol>' +
    '<div class="chat-pe"></div>';
  document.body.appendChild(bt); document.body.appendChild(caixa);
  /* o botão flutuante fica escondido: o chat abre pelo item "Chat" do menu e do painel do celular */
  document.addEventListener('click', function (ev) {
    var l = ev.target.closest && ev.target.closest('a[href="#bate-papo"]'); if (!l) return;
    ev.preventDefault(); ev.stopPropagation();
    var t = document.querySelector('.todas'); if (t && t.getAttribute('aria-expanded') === 'true') t.click();
    if (!aberto) bt.click();
  }, true);
  var lista = caixa.querySelector('.chat-lista'), pe = caixa.querySelector('.chat-pe');

  function hora(iso) {
    var d = new Date(iso), s = (Date.now() - d) / 1000;
    if (s < 60) return 'agora';
    if (s < 3600) return Math.floor(s / 60) + ' min';
    var h = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    return new Date().toDateString() === d.toDateString() ? h : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + h;
  }
  function desenharPe() {
    if (info.bloqueado) { pe.innerHTML = '<p class="chat-aviso">Sua conta não pode mais escrever no bate-papo.</p>'; return; }
    if (!info.logado) {
      var volta = location.pathname.split('/').pop() || 'index.html';
      pe.innerHTML = '<p class="chat-aviso"><a href="entrar.html?volta=' + encodeURIComponent(volta) + '">Entre na sua conta</a> para conversar. Ainda não tem? <a href="entrar.html?volta=' + encodeURIComponent(volta) + '#criar">Crie grátis</a>.</p>';
      return;
    }
    pe.innerHTML = '<form class="chat-form"><input type="text" name="texto" maxlength="280" autocomplete="off" placeholder="Escreva sua mensagem…" aria-label="Sua mensagem">' +
      '<button type="submit" class="chat-enviar">Enviar</button></form><p class="chat-erro" role="alert" hidden></p>';
    var f = pe.querySelector('form'), erro = pe.querySelector('.chat-erro');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var texto = f.texto.value.trim(); if (!texto) return;
      var b = f.querySelector('button'); b.disabled = true; erro.hidden = true;
      window.NAVEIA_API('chat_enviar', { texto: texto }).then(function (r) {
        b.disabled = false;
        if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
        f.texto.value = ''; buscar();
      }).catch(function () { b.disabled = false; erro.textContent = 'Não foi possível enviar. Tente de novo.'; erro.hidden = false; });
    });
  }
  function linha(m) {
    var selo = m.box ? '<span class="chat-selo-box">robô do site</span>' : ''; /* tudo grátis: sem selo de plano; o Box tem o dele */
    if (m.box) return '<li class="chat-msg chat-box" data-id="' + m.id + '"><i class="chat-av chat-av-box" aria-hidden="true"></i>' +
      '<div><p class="chat-quem"><b>Box</b>' + selo + '<time datetime="' + esc(m.em) + '">' + hora(m.em) + '</time></p>' +
      '<p class="chat-texto">' + esc(m.texto) + '</p><div class="reacoes" data-alvo="m:' + m.id + '"></div></div></li>';
    var acoes = '';
    if (m.minha || info.dono) acoes += '<button type="button" class="chat-acao" data-apagar="' + m.id + '">apagar</button>';
    if (info.dono && !m.minha) acoes += '<button type="button" class="chat-acao" data-bloquear="' + m.id + '">bloquear</button>';
    return '<li class="chat-msg' + (m.minha ? ' chat-minha' : '') + '" data-id="' + m.id + '">' +
      (m.foto ? '<img class="chat-av" src="' + esc(m.foto) + '" alt="">' : '<i class="chat-av">' + esc(m.nome.charAt(0).toUpperCase()) + '</i>') +
      '<div><p class="chat-quem"><b>' + esc(m.nome) + '</b>' + selo + '<time datetime="' + esc(m.em) + '">' + hora(m.em) + '</time>' + acoes + '</p>' +
      '<p class="chat-texto">' + esc(m.texto) + '</p><div class="reacoes" data-alvo="m:' + m.id + '"></div></div></li>';
  }
  function buscar() {
    return window.NAVEIA_API('chat_ler' + (ultimo ? '&depois=' + ultimo : '')).then(function (r) {
      if (!r || !r.ok) return;
      var mudouInfo = r.logado !== info.logado || r.dono !== info.dono || r.bloqueado !== info.bloqueado || !carregou;
      info = { logado: r.logado, dono: r.dono, bloqueado: r.bloqueado };
      (r.apagadas || []).forEach(function (id) { var el = lista.querySelector('[data-id="' + id + '"]'); if (el) el.remove(); });
      var perto = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 80;
      if (!carregou) lista.innerHTML = '';
      if (r.mensagens.length) {
        lista.insertAdjacentHTML('beforeend', r.mensagens.map(linha).join(''));
        ultimo = r.mensagens[r.mensagens.length - 1].id;
      }
      if (!lista.children.length) lista.innerHTML = '<li class="chat-vazio">Ninguém falou nada ainda. Comece a conversa!</li>';
      else { var v = lista.querySelector('.chat-vazio'); if (v && lista.children.length > 1) v.remove(); }
      if (!carregou || perto) lista.scrollTop = lista.scrollHeight;
      carregou = true;
      if (aberto) reacoes(lista);
      if (mudouInfo) desenharPe();
      if (aberto) marcarVisto(); else if (ultimo > vistoAte) { bt.querySelector('.chat-novo').hidden = false; [].forEach.call(document.querySelectorAll('.nav-chat'), function (x) { x.classList.add('tem-novo'); }); }
    }).catch(function () { if (!carregou) lista.innerHTML = '<li class="chat-vazio">Não foi possível abrir o bate-papo agora.</li>'; });
  }
  function marcarVisto() {
    vistoAte = ultimo; bt.querySelector('.chat-novo').hidden = true; [].forEach.call(document.querySelectorAll('.nav-chat'), function (x) { x.classList.remove('tem-novo'); });
    try { localStorage.setItem('naveia-chat-visto', String(ultimo)); } catch (e) {}
  }
  function ciclo() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (!document.hidden) buscar(); ciclo(); }, aberto ? 6000 : 90000);
  }
  function abrir(sim) {
    aberto = sim; caixa.hidden = !sim; bt.setAttribute('aria-expanded', sim ? 'true' : 'false');
    document.documentElement.classList.toggle('chat-aberto', sim);
    if (sim) { enquete(caixa.querySelector('.chat-enq')); buscar().then(function () { var i = pe.querySelector('input'); if (i && window.matchMedia('(min-width: 700px)').matches) i.focus(); }); }
    ciclo();
  }
  bt.addEventListener('click', function () { abrir(!aberto); });
  /* clique no fundo escuro (fora da janela) ou Esc fecham o chat */
  document.addEventListener('click', function (ev) { if (aberto && ev.target === document.body) abrir(false); });
  document.addEventListener('keydown', function (ev) { if (aberto && ev.key === 'Escape') abrir(false); });
  caixa.querySelector('.chat-fechar').addEventListener('click', function () { abrir(false); bt.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && aberto) abrir(false); });
  lista.addEventListener('click', function (e) {
    var a = e.target.closest('[data-apagar],[data-bloquear]'); if (!a) return;
    var bloquear = a.hasAttribute('data-bloquear'), id = +(a.getAttribute('data-apagar') || a.getAttribute('data-bloquear'));
    if (!confirm(bloquear ? 'Bloquear esta pessoa? Todas as mensagens dela somem e ela não poderá mais escrever.' : 'Apagar esta mensagem?')) return;
    window.NAVEIA_API('chat_apagar', { id: id, bloquear: bloquear }).then(function (r) {
      if (!r.ok) { alert(r.erro); return; }
      var el = lista.querySelector('[data-id="' + id + '"]'); if (el) el.remove();
      if (bloquear) { carregou = false; ultimo = 0; buscar(); }
    });
  });
  /* primeira olhada (depois de a página carregar) só para acender o aviso de mensagem nova */
  setTimeout(function () { buscar(); ciclo(); }, 4000);

  /* ---------- Reações (🔥 😂 😱 🏁) e enquete "Quem vence?": sem conta ----------
     "quem" é um código aleatório guardado no navegador (não identifica a pessoa). Qualquer elemento
     .reacoes[data-alvo] ou [data-enquete] da página ganha os botões (a página de notícias e a inicial usam). */
  var EMOJIS = ['🔥', '😂', '😱', '🏁'];
  function quem() {
    var q = '';
    try { q = localStorage.getItem('naveia-quem') || ''; } catch (e) {}
    if (!/^[A-Za-z0-9_-]{12,40}$/.test(q)) {
      var b = new Uint8Array(12); (window.crypto || window.msCrypto).getRandomValues(b);
      q = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      try { localStorage.setItem('naveia-quem', q); } catch (e) {}
    }
    return q;
  }
  function botoes(el, dados) {
    el.innerHTML = EMOJIS.map(function (e) {
      var d = dados[e] || { n: 0, meu: false };
      return '<button type="button" class="reacao' + (d.meu ? ' minha' : '') + '" data-emoji="' + e + '" aria-pressed="' + d.meu + '" aria-label="Reagir com ' + e + '">' + e + (d.n ? '<b>' + d.n + '</b>' : '') + '</button>';
    }).join('');
  }
  function reacoes(raiz) {
    var els = [].slice.call((raiz || document).querySelectorAll('.reacoes[data-alvo]'));
    if (!els.length) return;
    els.forEach(function (el) { if (!el.children.length) botoes(el, {}); });
    for (var i = 0; i < els.length; i += 80) (function (grupo) {
      window.NAVEIA_API('reacoes_ver&quem=' + quem() + '&alvos=' + grupo.map(function (el) { return el.getAttribute('data-alvo'); }).join(',')).then(function (r) {
        if (!r || !r.ok) return;
        grupo.forEach(function (el) { botoes(el, r.reacoes[el.getAttribute('data-alvo')] || {}); });
      }).catch(function () {});
    })(els.slice(i, i + 80));
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.reacao'); if (!b) return;
    var caixaR = b.parentNode, alvo = caixaR.getAttribute('data-alvo'), emoji = b.getAttribute('data-emoji');
    /* mostra na hora; o servidor confirma */
    var liga = !b.classList.contains('minha'), num = b.querySelector('b'), n = (num ? +num.textContent : 0) + (liga ? 1 : -1);
    b.classList.toggle('minha', liga); b.setAttribute('aria-pressed', liga);
    b.innerHTML = emoji + (n > 0 ? '<b>' + n + '</b>' : '');
    if (liga) { b.classList.remove('pulou'); void b.offsetWidth; b.classList.add('pulou'); }
    window.NAVEIA_API('reagir', { alvo: alvo, emoji: emoji, quem: quem() }).catch(function () {});
  });
  window.NAVEIA_REACOES = reacoes;

  function enquete(el) {
    if (!el) return;
    window.NAVEIA_API('enquete_ver&quem=' + quem()).then(function (r) {
      if (!r || !r.ok || !r.enquetes || !r.enquetes.length) { el.hidden = true; return; }
      var lista = r.enquetes.filter(function (e) { return e.aberta; });
      if (!lista.length) lista = r.enquetes;
      var atual = +(el.getAttribute('data-atual') || 0); if (!lista[atual]) atual = 0;
      var e = lista[atual], total = 0;
      Object.keys(e.votos).forEach(function (k) { total += e.votos[k]; });
      var mostra = !!e.meu || !e.aberta;
      el.hidden = false;
      el.innerHTML = '<div class="enq-cab"><span class="enq-rot">Enquete · ' + esc(e.categoria) + '</span>' +
        (lista.length > 1 ? '<span class="enq-abas">' + lista.map(function (x, i) { return '<button type="button" data-enq-aba="' + i + '" aria-pressed="' + (i === atual) + '">' + esc(x.categoria) + '</button>'; }).join('') + '</span>' : '') + '</div>' +
        '<p class="enq-perg">' + esc(e.pergunta) + '</p>' +
        '<div class="enq-ops">' + e.opcoes.map(function (o) {
          var n = e.votos[o] || 0, p = total ? Math.round(n * 100 / total) : 0;
          return '<button type="button" class="enq-op' + (e.meu === o ? ' meu' : '') + (mostra ? ' com-res' : '') + '" data-voto="' + esc(o) + '"' + (mostra ? ' disabled' : '') + '>' +
            (mostra ? '<i style="width:' + p + '%"></i>' : '') + '<span>' + esc(o) + '</span>' + (mostra ? '<b>' + p + '%</b>' : '') + '</button>';
        }).join('') + '</div>' +
        '<p class="enq-pe">' + (mostra ? total + (total === 1 ? ' voto' : ' votos') + (e.aberta ? ' · fecha na largada' : ' · votação encerrada') : 'Toque para votar. Sem conta, um toque só.') + '</p>';
      el.setAttribute('data-atual', atual);
      el.onclick = function (ev) {
        var aba = ev.target.closest('[data-enq-aba]');
        if (aba) { el.setAttribute('data-atual', aba.getAttribute('data-enq-aba')); enquete(el); return; }
        var op = ev.target.closest('.enq-op'); if (!op || op.disabled) return;
        [].forEach.call(el.querySelectorAll('.enq-op'), function (x) { x.disabled = true; });
        window.NAVEIA_API('enquete_votar', { enquete: e.id, voto: op.getAttribute('data-voto'), quem: quem() }).then(function (rv) {
          if (rv && !rv.ok) alert(rv.erro);
          enquete(el);
        }).catch(function () { enquete(el); });
      };
    }).catch(function () { el.hidden = true; });
  }
  window.NAVEIA_ENQUETE = enquete;
  /* elementos já na página (notícias, página inicial) */
  reacoes(document.querySelector('main') || document);
  [].forEach.call(document.querySelectorAll('[data-enquete]:not(.chat-enq)'), enquete);

  /* ---------- Dia de corrida: o botão do chat aparece pulsando ----------
     Quando a F1, a MotoGP ou a Stock Car tem classificação, sprint ou corrida hoje (horário de Brasília). */
  (function () {
    var hoje = window.hojeISO ? window.hojeISO() : new Date().toISOString().slice(0, 10), tem = null;
    (window.CATEGORIAS || []).forEach(function (c) {
      if (!/^(formula-1|motogp|stock-car)$/.test(c.slug)) return;
      c.calendario.forEach(function (e) { (e.s || []).forEach(function (s) { if (s.d === hoje && /Classifica|Sprint|Corrida|Principal/.test(s.t)) tem = tem || (c.menu || c.nome); }); });
    });
    if (!tem) return;
    bt.classList.add('chat-vivo');
    bt.querySelector('span').innerHTML = '<i class="chat-vivo-ponto" aria-hidden="true"></i>Chat da corrida';
    bt.setAttribute('aria-label', 'Abrir o chat da corrida, ao vivo');
  })();
})();
