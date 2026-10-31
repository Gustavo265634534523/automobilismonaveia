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

  /* vídeo de fundo (assets/video/entrada/<esporte>.mp4, curto, sem som, em repetição): só os que existem estão aqui.
     Com vídeo, o objeto do esporte (bola, capacete) sai da frente. Quem pediu menos movimento fica com a foto. */
  var VIDEOS = { futebol: { d: 'assets/video/entrada/futebol.mp4?v=1', m: 'assets/video/entrada/futebol-m.mp4?v=1' }, basquete: { d: 'assets/video/entrada/basquete.mp4?v=1', m: 'assets/video/entrada/basquete-m.mp4?v=1' },
    automobilismo: { d: 'assets/video/entrada/automobilismo.mp4?v=4', m: 'assets/video/entrada/automobilismo-m.mp4?v=4' } };
  /* versão em pé (celular) só quando a tela está mesmo em pé; confere de novo se a janela mudar de tamanho
     (a página pode abrir numa moldura que ainda nem tem o tamanho final) */
  function emPe() { return innerWidth > 0 && innerHeight > 0 && innerWidth / innerHeight < 0.85; }
  function fonte(esp) { return emPe() ? VIDEOS[esp].m : VIDEOS[esp].d; }
  var trocaT = null;
  window.addEventListener('resize', function () {
    clearTimeout(trocaT);
    trocaT = setTimeout(function () {
      bgs.forEach(function (b) {
        var v = b.querySelector('video'), esp = b.getAttribute('data-esp'); if (!v || !VIDEOS[esp]) return;
        var certo = fonte(esp); if (v.getAttribute('src') === certo) return;
        v.src = certo; if (b.classList.contains('ativo')) v.play().catch(function () {});
      });
    }, 250);
  });
  function video(esp) {
    var b = bgs.filter(function (x) { return x.getAttribute('data-esp') === esp; })[0];
    if (!b || calmo || !VIDEOS[esp] || b.querySelector('video')) return;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.addEventListener('loadeddata', function () { b.classList.add('tem-video'); body.classList.toggle('ld-video', b.classList.contains('ativo')); });
    v.src = fonte(esp); b.appendChild(v);
  }
  function letras(nome) {
    titulo.style.setProperty('--letras', nome.length);
    titulo.innerHTML = nome.split('').map(function (c, i) {
      return c === ' ' ? '<span class="ld-esp"></span>' : '<span class="ld-l" style="--i:' + i + '" data-l="' + c + '">' + c + '</span>';
    }).join('');
  }
  /* frases da entrada, como manchetes de jornal: motivação e curiosidades de cada esporte. Trocam a cada 3,5 s */
  var FRASES = {
    futebol: [
      ['Você sabia?', 'O Brasil é o único país que jogou todas as edições da Copa do Mundo.'],
      ['Motivação', 'Quem treina no frio da manhã comemora no calor da arquibancada.'],
      ['Você sabia?', 'Pentacampeão: 1958, 1962, 1970, 1994 e 2002.'],
      ['Motivação', 'O gol mais bonito é sempre o próximo.'],
      ['Você sabia?', 'Uma partida tem 90 minutos, mas a bola rola de verdade por menos de 60.'],
      ['Motivação', 'Camisa pesa. Quem aguenta o peso, levanta a taça.'],
      ['Você sabia?', 'A final de 1950 levou mais de 170 mil pessoas ao Maracanã.'],
      ['Motivação', 'Time que joga junto não tem jogo perdido antes do apito final.']
    ],
    basquete: [
      ['Você sabia?', 'O basquete nasceu em 1891, com cestos de pêssego pregados na parede.'],
      ['Motivação', 'Cada arremesso errado é um treino para o que vai entrar.'],
      ['Você sabia?', 'O aro fica a 3,05 metros do chão. Sempre foi assim.'],
      ['Motivação', 'Quem não para de pular um dia alcança o aro.'],
      ['Você sabia?', 'O relógio de 24 segundos de posse chegou à NBA em 1954.'],
      ['Motivação', 'Jogo decidido no último segundo é de quem não desistiu no primeiro.'],
      ['Você sabia?', 'A linha de três pontos estreou na NBA na temporada 1979/80.'],
      ['Motivação', 'Defesa ganha jogo. Coração ganha campeonato.']
    ],
    automobilismo: [
      ['Você sabia?', 'Um pit stop de Fórmula 1 pode durar menos de 2 segundos.'],
      ['Motivação', 'Na reta todo mundo é rápido. Campeão se faz na curva.'],
      ['Você sabia?', 'A primeira corrida do Mundial de Fórmula 1 foi em Silverstone, em 1950.'],
      ['Motivação', 'Largar atrás não é desculpa: é ponto de partida.'],
      ['Você sabia?', 'O Brasil tem três campeões mundiais: Emerson Fittipaldi, Nelson Piquet e Ayrton Senna.'],
      ['Motivação', 'Cada décimo de segundo é conquistado, nunca dado.'],
      ['Você sabia?', 'Numa freada forte, o piloto sente mais de cinco vezes o próprio peso.'],
      ['Motivação', 'A bandeirada só chega para quem continua acelerando.']
    ]
  };
  var frase = document.getElementById('ld-frase'), fraseI = {}, fraseT = null;
  function mostrarFrase(esp) {
    if (!frase) return;
    var L = FRASES[esp]; fraseI[esp] = fraseI[esp] === undefined ? Math.floor(Math.random() * L.length) : (fraseI[esp] + 1) % L.length;
    var f = L[fraseI[esp]];
    frase.classList.add('sai');
    setTimeout(function () {
      frase.innerHTML = '<small>' + f[0] + '</small><span>' + f[1] + '</span>';
      frase.classList.remove('sai');
    }, calmo || !frase.textContent ? 0 : 350);
    clearTimeout(fraseT); fraseT = setTimeout(function () { mostrarFrase(ESP[atual]); }, 3500);
  }
  function pintar(primeira) {
    var esp = ESP[atual];
    raiz.style.setProperty('--cor', CORES[esp]);
    bgs.forEach(function (b) { b.classList.toggle('ativo', b.getAttribute('data-esp') === esp); var v = b.querySelector('video'); if (v) { if (b.classList.contains('ativo')) { v.currentTime = 0; v.play().catch(function () {}); } else v.pause(); } });
    video(esp); body.classList.toggle('ld-video', !!bgs.filter(function (b) { return b.classList.contains('ativo') && b.classList.contains('tem-video'); }).length);
    objs.forEach(function (o) { var a = o.getAttribute('data-esp') === esp; o.classList.toggle('ativo', a); o.setAttribute('tabindex', a ? '0' : '-1'); o.setAttribute('aria-hidden', a ? 'false' : 'true'); });
    abas.forEach(function (b, i) { b.setAttribute('aria-selected', i === atual ? 'true' : 'false'); });
    links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-esp') === esp); });
    cta.href = LINKS[esp];
    cta.textContent = esp === 'automobilismo' ? 'Entrar na Fórmula 1' : 'Entrar no ' + NOMES[esp].toLowerCase();
    mostrarFrase(esp);
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
