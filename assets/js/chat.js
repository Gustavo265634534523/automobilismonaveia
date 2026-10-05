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
  caixa.id = 'chat-caixa'; caixa.className = 'chat-caixa'; caixa.hidden = true; caixa.setAttribute('aria-label', 'Bate-papo da torcida');
  caixa.innerHTML = '<header class="chat-cab"><div><b>Bate-papo da torcida</b><small>Respeito sempre. Sem links. As mensagens somem em 7 dias.</small></div>' +
    '<button type="button" class="chat-fechar" aria-label="Fechar o bate-papo">×</button></header>' +
    '<ol class="chat-lista" aria-live="polite"><li class="chat-vazio">Carregando…</li></ol>' +
    '<div class="chat-pe"></div>';
  document.body.appendChild(bt); document.body.appendChild(caixa);
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
    var selo = m.plano === 'master' ? '<span class="chat-selo chat-master">Master</span>' : m.plano === 'medio' ? '<span class="chat-selo">Médio</span>' : '';
    var acoes = '';
    if (m.minha || info.dono) acoes += '<button type="button" class="chat-acao" data-apagar="' + m.id + '">apagar</button>';
    if (info.dono && !m.minha) acoes += '<button type="button" class="chat-acao" data-bloquear="' + m.id + '">bloquear</button>';
    return '<li class="chat-msg' + (m.minha ? ' chat-minha' : '') + '" data-id="' + m.id + '">' +
      (m.foto ? '<img class="chat-av" src="' + esc(m.foto) + '" alt="">' : '<i class="chat-av">' + esc(m.nome.charAt(0).toUpperCase()) + '</i>') +
      '<div><p class="chat-quem"><b>' + esc(m.nome) + '</b>' + selo + '<time datetime="' + esc(m.em) + '">' + hora(m.em) + '</time>' + acoes + '</p>' +
      '<p class="chat-texto">' + esc(m.texto) + '</p></div></li>';
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
      if (mudouInfo) desenharPe();
      if (aberto) marcarVisto(); else if (ultimo > vistoAte) bt.querySelector('.chat-novo').hidden = false;
    }).catch(function () { if (!carregou) lista.innerHTML = '<li class="chat-vazio">Não foi possível abrir o bate-papo agora.</li>'; });
  }
  function marcarVisto() {
    vistoAte = ultimo; bt.querySelector('.chat-novo').hidden = true;
    try { localStorage.setItem('naveia-chat-visto', String(ultimo)); } catch (e) {}
  }
  function ciclo() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (!document.hidden) buscar(); ciclo(); }, aberto ? 6000 : 90000);
  }
  function abrir(sim) {
    aberto = sim; caixa.hidden = !sim; bt.setAttribute('aria-expanded', sim ? 'true' : 'false');
    document.documentElement.classList.toggle('chat-aberto', sim);
    if (sim) { buscar().then(function () { var i = pe.querySelector('input'); if (i && window.matchMedia('(min-width: 700px)').matches) i.focus(); }); }
    ciclo();
  }
  bt.addEventListener('click', function () { abrir(!aberto); });
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
})();
