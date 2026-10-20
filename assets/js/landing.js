/* Entrada do site (index.html): carrossel 3D de Futebol, Basquete e Automobilismo, com o nome do esporte gigante atrás.
   Gira sozinho; também gira com a roda do mouse (um esporte por vez), arrastando, pelas setas e pelo teclado.
   Clicar no objeto da frente ou em Entrar abre o esporte. Atrás, traços de luz na cor do esporte (canvas). */
(function () {
  var CORES = { futebol: '#2ea062', basquete: '#f07a2a', automobilismo: '#e3343c' };
  var NOMES = { futebol: 'Futebol', basquete: 'Basquete', automobilismo: 'Fórmula 1' };
  var FRASES = {
    futebol: '<b>Brasileirão, Libertadores e Champions</b> e as grandes ligas da Europa.',
    basquete: '<b>NBA, Euroleague e NBB</b>: jogos, tabelas e destaques.',
    automobilismo: '<b>Fórmula 1</b>: corridas, classificação e horários de Brasília.'
  };
  var palavras = [].slice.call(document.querySelectorAll('.ld-palavra'));
  var links = [].slice.call(document.querySelectorAll('.ld-nav a[data-esp]'));
  var cta = document.getElementById('ld-cta'), frase = document.getElementById('ld-frase'), num = document.getElementById('ld-num');
  var contador = document.querySelector('.ld-contador');
  /* o tamanho do nome gigante depende do número de letras, para AUTOMOBILISMO caber na tela */
  palavras.forEach(function (p) { p.style.setProperty('--letras', p.textContent.trim().length); });
  /* se a imagem já vier recortada (fundo transparente), tira a máscara redonda */
  [].forEach.call(document.querySelectorAll('.ld-obj'), function (img) {
    var alt = img.getAttribute('src').replace(/\.webp$/, '-recorte.webp'), t = new Image();
    t.onload = function () { img.src = alt; img.classList.add('recortado'); }; t.src = alt;
  });
  var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body, raiz = document.documentElement;
  var palco = document.getElementById('ld-palco');
  var cards = [].slice.call(document.querySelectorAll('.ld-card'));
  var ambs = [].slice.call(document.querySelectorAll('.ld-amb'));
  var pontosBox = document.getElementById('ld-pontos');
  var n = cards.length, atual = 0, anterior = null, saindo = false;
  var impulso = 0; /* acelera os traços de luz quando o carrossel gira */

  var pontos = cards.map(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ld-ponto'; b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', NOMES[c.getAttribute('data-esp')] || '');
    b.addEventListener('click', function () { parar(); ir(i); });
    pontosBox.appendChild(b);
    return b;
  });

  /* posição de cada cartão em relação ao da frente: -1 (esquerda), 0 (frente), 1 (direita) */
  function rel(i) { var k = ((i - atual) % n + n) % n; return k > n / 2 ? k - n : k; }
  function pintar() {
    cards.forEach(function (c, i) {
      var k = rel(i), antes = anterior === null ? k : ((i - anterior) % n + n) % n;
      if (anterior !== null && antes > n / 2) antes -= n;
      c.classList.toggle('volta', anterior !== null && Math.abs(k - antes) > 1);
      c.style.setProperty('--k', k); c.style.setProperty('--ak', Math.abs(k));
      c.style.setProperty('--zi', k === 0 ? 3 : 1);
      c.classList.toggle('frente', k === 0);
      c.setAttribute('tabindex', k === 0 ? '0' : '-1');
      c.setAttribute('aria-hidden', k === 0 ? 'false' : 'true');
    });
    var esp = cards[atual].getAttribute('data-esp');
    ambs.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-esp') === esp); });
    pontos.forEach(function (p, i) { p.setAttribute('aria-selected', i === atual ? 'true' : 'false'); });
    raiz.style.setProperty('--cor', CORES[esp]);
    palavras.forEach(function (p) { p.classList.toggle('ativa', p.getAttribute('data-esp') === esp); });
    links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-esp') === esp); });
    if (cta) { cta.href = cards[atual].getAttribute('href'); cta.textContent = esp === 'automobilismo' ? 'Entrar na Fórmula 1' : 'Entrar no ' + NOMES[esp].toLowerCase(); }
    if (frase) frase.innerHTML = FRASES[esp];
    if (num) num.textContent = '0' + (atual + 1);
    if (contador) contador.style.setProperty('--prog', Math.round((atual + 1) / n * 100) + '%');
  }
  function ir(i) {
    i = ((i % n) + n) % n;
    if (i === atual) return;
    anterior = atual; atual = i; impulso = 1; pintar();
    /* o cartão que deu a volta reaparece depois de chegar ao outro lado */
    clearTimeout(ir.t); ir.t = setTimeout(function () { cards.forEach(function (c) { c.classList.remove('volta'); }); }, 700);
  }
  function passo(d) { ir(atual + d); }

  function entrar() {
    if (saindo) return;
    saindo = true; parar();
    var href = cards[atual].getAttribute('href');
    body.classList.add('ld-saindo');
    setTimeout(function () { location.href = href; }, calmo ? 0 : 450);
  }
  /* se a pessoa voltar pelo botão do navegador, a página aparece de novo normal */
  window.addEventListener('pageshow', function (e) { if (e.persisted) { saindo = false; body.classList.remove('ld-saindo'); } });

  cards.forEach(function (c, i) {
    c.addEventListener('click', function (e) {
      e.preventDefault();
      if (arrastou) return;
      if (i === atual) entrar(); else { parar(); ir(i); }
    });
  });
  if (cta) cta.addEventListener('click', function (e) { e.preventDefault(); entrar(); });
  document.getElementById('ld-ant').addEventListener('click', function () { parar(); passo(-1); });
  document.getElementById('ld-prox').addEventListener('click', function () { parar(); passo(1); });

  /* giro automático; para de vez quando a pessoa mexe */
  var auto = calmo ? null : setInterval(function () { if (!document.hidden) passo(1); }, 3500);
  function parar() { if (auto) { clearInterval(auto); auto = null; } }

  /* roda do mouse / trackpad: um esporte por gesto, rápido */
  var travado = false;
  window.addEventListener('wheel', function (e) {
    e.preventDefault();
    var d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (travado || Math.abs(d) < 8) return;
    parar(); passo(d > 0 ? 1 : -1);
    travado = true; setTimeout(function () { travado = false; }, 600);
  }, { passive: false });

  /* arrastar (mouse) e deslizar (toque) */
  var x0 = null, arrastou = false;
  palco.addEventListener('pointerdown', function (e) { x0 = e.clientX; arrastou = false; });
  window.addEventListener('pointermove', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0;
    if (Math.abs(dx) > 40) { arrastou = true; parar(); passo(dx < 0 ? 1 : -1); x0 = e.clientX; }
  });
  window.addEventListener('pointerup', function () { x0 = null; setTimeout(function () { arrastou = false; }, 0); });
  window.addEventListener('pointercancel', function () { x0 = null; arrastou = false; });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { parar(); passo(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { parar(); passo(-1); e.preventDefault(); }
    else if (e.key === 'Enter' && !/^(BUTTON)$/.test((document.activeElement || {}).tagName)) { e.preventDefault(); entrar(); }
  });

  pintar();
  /* abertura: os cartões chegam do fundo */
  if (!calmo) { body.classList.add('ld-intro'); setTimeout(function () { body.classList.remove('ld-intro'); impulso = 1.4; }, 120); }

  /* fundo: traços de luz vindo do centro, como velocidade; aceleram quando o carrossel gira */
  var cv = document.getElementById('ld-luzes');
  if (!cv || calmo || !cv.getContext) return;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var QTD = 90, ps = [];
  function medir() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function novo(p) {
    p = p || {};
    p.ang = Math.random() * Math.PI * 2; p.z = Math.random() * .9 + .1; p.v = .25 + Math.random() * .6;
    return p;
  }
  for (var i = 0; i < QTD; i++) ps.push(novo());
  medir(); window.addEventListener('resize', medir);
  function rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  var cor = rgb(CORES.futebol), alvo = cor.slice(), ult = performance.now();
  function quadro(t) {
    var dt = Math.min((t - ult) / 1000, .05); ult = t;
    alvo = rgb(CORES[cards[atual].getAttribute('data-esp')]);
    for (var c = 0; c < 3; c++) cor[c] += (alvo[c] - cor[c]) * Math.min(dt * 4, 1);
    impulso = Math.max(0, impulso - dt * 1.6);
    var vel = .18 + impulso * 1.8;
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, R = Math.hypot(cx, cy);
    ctx.lineCap = 'round';
    ps.forEach(function (p) {
      var z0 = p.z;
      p.z += p.v * vel * dt * p.z * 2.2 + dt * .02;
      if (p.z > 1.2) { novo(p); p.z = .05 + Math.random() * .1; return; }
      var r0 = z0 * z0 * R, r1 = p.z * p.z * R;
      var cos = Math.cos(p.ang), sin = Math.sin(p.ang);
      var a = Math.min(1, p.z) * (.25 + impulso * .5);
      ctx.strokeStyle = 'rgba(' + (cor[0] | 0) + ',' + (cor[1] | 0) + ',' + (cor[2] | 0) + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = .6 + p.z * 1.8;
      ctx.beginPath();
      ctx.moveTo(cx + cos * (r0 - 4 - impulso * 40 * p.z), cy + sin * (r0 - 4 - impulso * 40 * p.z));
      ctx.lineTo(cx + cos * r1, cy + sin * r1);
      ctx.stroke();
    });
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
})();
