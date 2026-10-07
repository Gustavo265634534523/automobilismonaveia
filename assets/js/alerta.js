/* Alerta de largada pelo site: notificação do navegador 30 minutos antes de cada classificação, sprint e corrida.
   Não precisa de conta. Qualquer botão com data-alerta="formula-1" (ou "*" = todas as categorias) liga e desliga o alerta.
   O servidor de contas guarda o endereço de notificação deste navegador e manda o aviso (cron a cada 5 minutos);
   o sw.js mostra a notificação. No iPhone só funciona com o app instalado na Tela de Início (iOS 16.4 ou mais novo). */
(function () {
  var CHAVE = 'BP4oEiHkx1dL8_jqS70E7z_F45ow9-W4m5PCosfUrmXMlPXnv--FDlwbf4OVyd0Vxdj5PxmwjH7LO-w7Mc5O3Ys';
  var suporta = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  var iphone = /iP(hone|ad|od)/.test(navigator.userAgent);
  var cats = null; /* categorias ligadas neste navegador (null = ainda não sabe) */

  function chaveBytes() {
    var b = atob(CHAVE.replace(/-/g, '+').replace(/_/g, '/')), a = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return a;
  }
  function registro() {
    return navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; });
  }
  function ligadoEm(c) { return !!cats && (cats.indexOf(c) > -1 || (c !== '*' && cats.indexOf('*') > -1)); }
  function desenhar() {
    [].forEach.call(document.querySelectorAll('[data-alerta]'), function (b) {
      var on = ligadoEm(b.getAttribute('data-alerta')), t = b.querySelector('.alerta-txt');
      b.classList.toggle('alerta-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (t) t.textContent = on ? 'Alerta de largada ligado' : (b.getAttribute('data-rotulo') || 'Avisar 30 min antes da largada');
    });
  }
  function aviso(b, txt) {
    var p = b.nextElementSibling;
    if (!p || !p.classList.contains('alerta-msg')) { p = document.createElement('small'); p.className = 'alerta-msg'; p.setAttribute('role', 'status'); b.after(p); }
    p.textContent = txt;
  }
  function ligar(c) {
    return Notification.requestPermission().then(function (p) {
      if (p !== 'granted') throw new Error('As notificações estão bloqueadas neste navegador. Libere no cadeado ao lado do endereço do site e tente de novo.');
      return registro();
    }).then(function (reg) {
      return reg.pushManager.getSubscription().then(function (s) { return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveBytes() }); });
    }).then(function (s) {
      return window.NAVEIA_API('push_inscrever', { endpoint: s.endpoint, cats: [c], modo: 'somar' });
    }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.erro) || 'Não deu certo. Tente de novo.');
      cats = r.cats;
      return 'Pronto! Você recebe um aviso 30 minutos antes de cada classificação, sprint e corrida' + (c === '*' ? '.' : ' desta categoria.');
    });
  }
  function desligar(c) {
    return registro().then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (s) {
      if (!s) { cats = []; return 'Alerta desligado.'; }
      var tirar = c === '*' ? ['*'] : [c, '*'];
      return window.NAVEIA_API('push_inscrever', { endpoint: s.endpoint, cats: tirar, modo: 'tirar' }).then(function (r) {
        cats = (r && r.cats) || [];
        if (!cats.length) s.unsubscribe().catch(function () {});
        return 'Alerta desligado.';
      });
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-alerta]');
    if (!b) return;
    e.preventDefault();
    var c = b.getAttribute('data-alerta');
    if (!suporta) {
      var app = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
      return aviso(b, iphone && !app ? 'No iPhone, primeiro instale o app: toque em Compartilhar e depois em "Adicionar à Tela de Início". Abra o app e ligue o alerta por lá.' : 'Este navegador não aceita notificações. Tente pelo Chrome.');
    }
    b.disabled = true;
    (ligadoEm(c) ? desligar(c) : ligar(c))
      .then(function (msg) { if (msg) aviso(b, msg); })
      .catch(function (er) { aviso(b, (er && er.message) || 'Não deu certo. Tente de novo.'); })
      .then(function () { b.disabled = false; desenhar(); });
  });

  /* estado ao abrir a página: se este navegador já ligou o alerta, os botões já aparecem ligados */
  desenhar();
  if (suporta && Notification.permission === 'granted' && window.NAVEIA_API) {
    navigator.serviceWorker.getRegistration().then(function (reg) { return reg && reg.pushManager.getSubscription(); }).then(function (s) {
      if (!s) { cats = []; return desenhar(); }
      return window.NAVEIA_API('push_inscrever', { endpoint: s.endpoint }).then(function (r) { cats = (r && r.cats) || []; desenhar(); });
    }).catch(function () {});
  }
  window.NAVEIA_ALERTA_DESENHAR = desenhar;
})();
