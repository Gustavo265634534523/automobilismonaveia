/* Barra de rolagem no celular: no canto direito da tela, dá para segurar e arrastar para descer ou subir rápido
   (a barra normal do celular é fininha e não dá para arrastar). Só aparece em tela de toque e em página comprida. */
(function () {
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  var trilho = document.createElement('div');
  trilho.className = 'rolador'; trilho.setAttribute('aria-hidden', 'true');
  trilho.innerHTML = '<i class="rolador-polegar"></i>';
  document.body.appendChild(trilho);
  var polegar = trilho.firstChild, arrastando = false, inicioY = 0, inicioScroll = 0, altPolegar = 0, timer = 0;

  function medidas() {
    var doc = document.documentElement.scrollHeight, tela = window.innerHeight;
    return { doc: doc, tela: tela, max: Math.max(1, doc - tela), livre: Math.max(1, tela - altPolegar) };
  }
  function desenhar() {
    var m = medidas();
    trilho.hidden = m.doc < m.tela * 2;
    altPolegar = Math.max(56, Math.min(m.tela * 0.35, m.tela * m.tela / m.doc));
    polegar.style.height = altPolegar + 'px';
    polegar.style.transform = 'translateY(' + (window.scrollY / m.max * (m.tela - altPolegar)).toFixed(1) + 'px)';
  }
  function acender() {
    trilho.classList.add('ativo');
    clearTimeout(timer);
    timer = setTimeout(function () { if (!arrastando) trilho.classList.remove('ativo'); }, 1500);
  }
  window.addEventListener('scroll', function () { desenhar(); acender(); }, { passive: true });
  window.addEventListener('resize', desenhar);

  polegar.addEventListener('touchstart', function (e) {
    arrastando = true; inicioY = e.touches[0].clientY; inicioScroll = window.scrollY;
    trilho.classList.add('ativo', 'segurando');
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchmove', function (e) {
    if (!arrastando) return;
    var m = medidas();
    window.scrollTo(0, inicioScroll + (e.touches[0].clientY - inicioY) / m.livre * m.max);
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', function () {
    if (!arrastando) return;
    arrastando = false; trilho.classList.remove('segurando'); acender();
  });

  desenhar();
  /* a página cresce quando as notícias e as imagens carregam */
  setTimeout(desenhar, 1500); setTimeout(desenhar, 4000);
})();
