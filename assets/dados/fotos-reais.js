/* Imagens do site: uma por esporte (assets/img/esportes). Todo o automobilismo usa a imagem da bandeirada.
   fotoNoticia continua existindo para quem já chamava (entrada.js, capa.js, noticias.js, .github/paginas-noticias.js). */
window.IMG_ESPORTE = {
  automobilismo: { src: 'assets/img/esportes/automobilismo-m.webp', grande: 'assets/img/esportes/automobilismo.webp', jpg: 'assets/img/esportes/automobilismo.jpg' },
  futebol: { src: 'assets/img/esportes/futebol-m.webp', grande: 'assets/img/esportes/futebol.webp', jpg: 'assets/img/esportes/futebol.jpg' },
  basquete: { src: 'assets/img/esportes/basquete-m.webp', grande: 'assets/img/esportes/basquete.webp', jpg: 'assets/img/esportes/basquete.jpg' }
};
window.fotoNoticia = function () { return window.IMG_ESPORTE.automobilismo; };
