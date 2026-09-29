/* Service worker do app Na Veia.
   Páginas e dados: busca sempre a versão nova na internet e guarda uma cópia para abrir sem conexão.
   Imagens, estilos e fontes: usa a cópia guardada e atualiza por trás. */
var VERSAO = 'naveia-v117';

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.pathname.indexOf('/api/') > -1) return;               /* conta e avisos: nunca guardar */
  var estatico = /\.(webp|png|jpg|svg|css|woff2?)$/.test(url.pathname) || url.host.indexOf('fonts.') === 0;
  if (estatico) {
    e.respondWith(caches.open(VERSAO).then(function (c) {
      return c.match(req).then(function (salvo) {
        var rede = fetch(req).then(function (r) { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(function () { return salvo; });
        return salvo || rede;
      });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (r) {
    if (r.ok && url.origin === location.origin) { var copia = r.clone(); caches.open(VERSAO).then(function (c) { c.put(req, copia); }); }
    return r;
  }).catch(function () { return caches.match(req); }));
});
