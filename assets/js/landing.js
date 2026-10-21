/* Entrada do site (index.html): Futebol, Basquete e Fórmula 1, um de cada vez. Troca sozinho a cada 7 segundos
   (para quando a pessoa mexe), pelas abas, pelas setas, arrastando, pela roda do mouse e pelo teclado.
   O nome do esporte entra letra por letra em 3D; o fundo e o objeto se mexem um pouco com o mouse.
   Clicar no objeto ou em Entrar abre o esporte. */
(function () {
  var ESP = ['futebol', 'basquete', 'automobilismo'];
  var CORES = { futebol: '#22a35a', basquete: '#f07a2a', automobilismo: '#e3343c' };
  var NOMES = { futebol: 'Futebol', basquete: 'Basquete', automobilismo: 'Fórmula 1' };
  var LINKS = { futebol: 'futebol.html', basquete: 'basquete.html', automobilismo: 'automobilismo.html' };
  var TEMPO = 7000;
  var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body, raiz = document.documentElement;
  var titulo = document.getElementById('ld-titulo'), cta = document.getElementById('ld-cta'), cena = document.getElementById('ld-cena');
  var bgs = [].slice.call(document.querySelectorAll('.ld-bg'));
  var objs = [].slice.call(document.querySelectorAll('.ld-obj'));
  var abas = [].slice.call(document.querySelectorAll('.ld-abas button'));
  var links = [].slice.call(document.querySelectorAll('.ld-nav a[data-esp]'));
  var atual = 0, saindo = false, auto = null, parado = false;

  /* se a imagem já vier recortada (fundo transparente), usa ela sem a máscara redonda */
  [].forEach.call(document.querySelectorAll('.ld-obj img'), function (img) {
    var alt = img.getAttribute('src').replace(/\.webp$/, '-recorte.webp'), t = new Image();
    t.onload = function () { img.src = alt; img.classList.add('recortado'); }; t.src = alt;
  });

  function letras(nome) {
    titulo.style.setProperty('--letras', nome.length);
    titulo.innerHTML = nome.split('').map(function (c, i) {
      return c === ' ' ? '<span class="ld-esp"></span>' : '<span class="ld-l" style="--i:' + i + '" data-l="' + c + '">' + c + '</span>';
    }).join('');
  }
  function pintar(primeira) {
    var esp = ESP[atual];
    raiz.style.setProperty('--cor', CORES[esp]);
    bgs.forEach(function (b) { b.classList.toggle('ativo', b.getAttribute('data-esp') === esp); });
    objs.forEach(function (o) { var a = o.getAttribute('data-esp') === esp; o.classList.toggle('ativo', a); o.setAttribute('tabindex', a ? '0' : '-1'); o.setAttribute('aria-hidden', a ? 'false' : 'true'); });
    abas.forEach(function (b, i) { b.setAttribute('aria-selected', i === atual ? 'true' : 'false'); });
    links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-esp') === esp); });
    cta.href = LINKS[esp];
    cta.textContent = esp === 'automobilismo' ? 'Entrar na Fórmula 1' : 'Entrar no ' + NOMES[esp].toLowerCase();
    /* letras: as antigas saem, as novas entram */
    var velhas = titulo.querySelectorAll('.ld-l');
    if (primeira || calmo || !velhas.length) letras(NOMES[esp]);
    else {
      [].forEach.call(velhas, function (l) { l.classList.add('sai'); });
      clearTimeout(pintar.t); pintar.t = setTimeout(function () { letras(NOMES[ESP[atual]]); }, 380);
    }
  }
  function ir(i) {
    i = ((i % ESP.length) + ESP.length) % ESP.length;
    if (i === atual) return;
    atual = i; pintar(); armar();
  }
  /* troca automática; para de vez quando a pessoa escolhe sozinha */
  function armar() { clearTimeout(auto); if (!parado && !calmo) auto = setTimeout(function () { ir(atual + 1); }, TEMPO); }
  function parar() { parado = true; clearTimeout(auto); body.classList.add('ld-parado'); }

  function entrar() {
    if (saindo) return;
    saindo = true; parar();
    body.classList.add('ld-saindo');
    setTimeout(function () { location.href = LINKS[ESP[atual]]; }, calmo ? 0 : 450);
  }
  /* se a pessoa voltar pelo botão do navegador, a página aparece de novo normal */
  window.addEventListener('pageshow', function (e) { if (e.persisted) { saindo = false; body.classList.remove('ld-saindo'); } });

  abas.forEach(function (b, i) { b.addEventListener('click', function () { parar(); ir(i); }); });
  document.getElementById('ld-ant').addEventListener('click', function () { parar(); ir(atual - 1); });
  document.getElementById('ld-prox').addEventListener('click', function () { parar(); ir(atual + 1); });
  objs.forEach(function (o) { o.addEventListener('click', function (e) { e.preventDefault(); entrar(); }); });
  cta.addEventListener('click', function (e) { e.preventDefault(); entrar(); });

  /* roda do mouse: um esporte por gesto */
  var travaRoda = 0;
  window.addEventListener('wheel', function (e) {
    var agora = Date.now();
    if (Math.abs(e.deltaY) + Math.abs(e.deltaX) < 12 || agora - travaRoda < 900) return;
    travaRoda = agora; parar(); ir(atual + ((e.deltaY || e.deltaX) > 0 ? 1 : -1));
  }, { passive: true });
  /* arrastar para o lado (celular e mouse) */
  var x0 = null, y0 = 0;
  window.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
  window.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { parar(); ir(atual + (dx < 0 ? 1 : -1)); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { parar(); ir(atual + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { parar(); ir(atual - 1); e.preventDefault(); }
    else if (e.key === 'Enter' && !/^(BUTTON|A)$/.test((document.activeElement || {}).tagName)) { e.preventDefault(); entrar(); }
  });

  /* profundidade com o mouse: letras inclinam, objeto e fundo deslizam em sentidos diferentes */
  if (!calmo && window.matchMedia('(pointer: fine)').matches) {
    var alvo = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, rodando = false;
    window.addEventListener('pointermove', function (e) {
      alvo.x = e.clientX / innerWidth - .5; alvo.y = e.clientY / innerHeight - .5;
      if (!rodando) { rodando = true; requestAnimationFrame(passo); }
    });
    function passo() {
      pos.x += (alvo.x - pos.x) * .08; pos.y += (alvo.y - pos.y) * .08;
      titulo.style.setProperty('--tx', (pos.x * 14).toFixed(2) + 'deg');
      titulo.style.setProperty('--ty', (-pos.y * 8).toFixed(2) + 'deg');
      cena.style.setProperty('--ox', (pos.x * 26).toFixed(1) + 'px');
      cena.style.setProperty('--oy', (pos.y * 18).toFixed(1) + 'px');
      raiz.style.setProperty('--px', (pos.x * -18).toFixed(1) + 'px');
      raiz.style.setProperty('--py', (pos.y * -12).toFixed(1) + 'px');
      if (Math.abs(alvo.x - pos.x) + Math.abs(alvo.y - pos.y) > .001) requestAnimationFrame(passo); else rodando = false;
    }
  }

  pintar(true);
  armar();
  if (!calmo) { body.classList.add('ld-intro'); setTimeout(function () { body.classList.remove('ld-intro'); }, 60); }
})();
