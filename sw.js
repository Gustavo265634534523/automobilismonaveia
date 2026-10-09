/* Service worker do app Na Veia.
   Páginas e dados: busca sempre a versão nova na internet e guarda uma cópia para abrir sem conexão.
   Imagens e fontes: usa a cópia guardada e atualiza por trás. */
var VERSAO = 'naveia-v246';

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Alerta de largada: o servidor manda um toque sem conteúdo; aqui pergunta o que mostrar e mostra a notificação */
var SERVIDOR = 'https://naveia-contas.naveia-contas.workers.dev/';
self.addEventListener('push', function (e) {
  e.waitUntil(self.registration.pushManager.getSubscription().then(function (s) {
    return fetch(SERVIDOR + '?acao=push_alerta', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Naveia': '1' }, body: JSON.stringify({ endpoint: s ? s.endpoint : '' }) });
  }).then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (a) {
    return self.registration.showNotification(a.titulo || 'Largada em breve', {
      body: a.texto || 'Uma corrida que você segue começa daqui a pouco.', icon: 'assets/app/icone-192.png', badge: 'assets/app/icone-192.png',
      tag: a.tag || 'largada', data: { url: a.url || 'horarios.html' }
    });
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
    for (var i = 0; i < lista.length; i++) if (lista[i].url === url && 'focus' in lista[i]) return lista[i].focus();
    return self.clients.openWindow(url);
  }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.pathname.indexOf('/api/') > -1) return;               /* conta e avisos: nunca guardar */
  /* imagens e fontes: cópia guardada primeiro. Estilos (css), scripts e páginas: sempre a versão nova (com cópia para usar sem internet) */
  var estatico = /\.(webp|png|jpg|svg|woff2?)$/.test(url.pathname) || url.host.indexOf('fonts.') === 0;
  if (estatico) {
    e.respondWith(caches.open(VERSAO).then(function (c) {
      return c.match(req).then(function (salvo) {
        var rede = fetch(req).then(function (r) { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(function () { return salvo; });
        return salvo || rede;
      });
    }));
    return;
  }
  /* no-cache: confere com o servidor se o arquivo mudou (evita página nova com estilo velho logo depois de publicar) */
  e.respondWith(fetch(req, url.origin === location.origin ? { cache: 'no-cache' } : undefined).then(function (r) {
    if (r.ok && url.origin === location.origin) { var copia = r.clone(); caches.open(VERSAO).then(function (c) { c.put(req, copia); }); }
    return r;
  }).catch(function () { return caches.match(req); }));
});
