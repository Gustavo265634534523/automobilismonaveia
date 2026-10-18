/* Imagens do site: uma por esporte (assets/img/esportes). Todo o automobilismo usa a imagem da bandeirada.
   fotoNoticia continua existindo para quem já chamava (entrada.js, capa.js, noticias.js, .github/paginas-noticias.js). */
window.IMG_ESPORTE = {
  automobilismo: { src: 'assets/img/esportes/automobilismo-m.webp', grande: 'assets/img/esportes/automobilismo.webp', jpg: 'assets/img/esportes/automobilismo.jpg' },
  futebol: { src: 'assets/img/esportes/futebol-m.webp', grande: 'assets/img/esportes/futebol.webp', jpg: 'assets/img/esportes/futebol.jpg' },
  basquete: { src: 'assets/img/esportes/basquete-m.webp', grande: 'assets/img/esportes/basquete.webp', jpg: 'assets/img/esportes/basquete.jpg' }
};
window.fotoNoticia = function () { return window.IMG_ESPORTE.automobilismo; };
/* capa de vídeo do YouTube; se a capa não carregar (vídeo sem capa grande ou YouTube bloqueado), tenta a média e depois usa a imagem do esporte */
window.capaVideo = function (id, q, esporte, extra) {
  var f = (window.IMG_ESPORTE[esporte] || window.IMG_ESPORTE.automobilismo).src, y = 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/';
  return '<img src="' + y + (q || 'hqdefault') + '.jpg" alt="" loading="lazy" data-capa2="' + y + 'hqdefault.jpg" data-capa3="' + f + '"' + (extra || '') +
    ' onerror="var a=this.getAttribute(\'data-capa2\');if(a&&this.src!==a&&!/hqdefault/.test(this.src)){this.src=a}else{this.onerror=null;this.src=this.getAttribute(\'data-capa3\')}">';
};
