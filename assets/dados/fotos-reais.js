/* Imagens do site (assets/img/fotos, feitas no Higgsfield): a principal de cada esporte e, para variar nas notícias,
   outras do mesmo esporte (VARIACOES); cada notícia fica sempre com a mesma, escolhida pelo título.
   fotoNoticia continua existindo para quem já chamava (entrada.js, capa.js, noticias.js, .github/paginas-noticias.js). */
window.IMG_ESPORTE = {
  automobilismo: { src: 'assets/img/fotos/automobilismo-m.webp', grande: 'assets/img/fotos/automobilismo.webp', jpg: 'assets/img/fotos/automobilismo.jpg' },
  futebol: { src: 'assets/img/fotos/futebol-m.webp', grande: 'assets/img/fotos/futebol.webp', jpg: 'assets/img/fotos/futebol.jpg' },
  basquete: { src: 'assets/img/fotos/basquete-m.webp', grande: 'assets/img/fotos/basquete.webp', jpg: 'assets/img/fotos/basquete.jpg' }
};
function fotoEsp(n) { return { src: 'assets/img/fotos/' + n + '-m.webp', grande: 'assets/img/fotos/' + n + '.webp', jpg: 'assets/img/fotos/' + n + '.jpg' }; }
window.FOTOS_VARIACOES = { automobilismo: [window.IMG_ESPORTE.automobilismo, fotoEsp('automobilismo-2')], futebol: [window.IMG_ESPORTE.futebol, fotoEsp('futebol-2')], basquete: [window.IMG_ESPORTE.basquete] };
/* foto de uma notícia do esporte: sempre a mesma para o mesmo título */
window.fotoDoTitulo = function (esporte, titulo) {
  var L = window.FOTOS_VARIACOES[esporte] || [window.IMG_ESPORTE[esporte] || window.IMG_ESPORTE.futebol], h = 0, t = String(titulo || '');
  for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
  return L[Math.abs(h) % L.length];
};
window.fotoNoticia = function (cat, titulo) { return window.fotoDoTitulo('automobilismo', titulo); };

/* capa de vídeo do YouTube; se a capa não carregar (vídeo sem capa grande ou YouTube bloqueado), tenta a média e depois usa a imagem do esporte */
window.capaVideo = function (id, q, esporte, extra) {
  var f = (window.IMG_ESPORTE[esporte] || window.IMG_ESPORTE.automobilismo).src, y = 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/';
  return '<img src="' + y + (q || 'hqdefault') + '.jpg" alt="" loading="lazy" data-capa2="' + y + 'hqdefault.jpg" data-capa3="' + f + '"' + (extra || '') +
    ' onerror="var a=this.getAttribute(\'data-capa2\');if(a&&this.src!==a&&!/hqdefault/.test(this.src)){this.src=a}else{this.onerror=null;this.src=this.getAttribute(\'data-capa3\')}">';
};
