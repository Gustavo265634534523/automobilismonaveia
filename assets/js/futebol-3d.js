/* Futebol 3D (futebol-3d.html): lances de ataque em 3D. Você ataca de vermelho (5 jogadores) contra a defesa amarela e o
   goleiro. Arraste do jogador com a bola até um companheiro para tocar (a bola segue a linha que você desenhou),
   arraste até o gol para chutar (linha torta = chute com curva; quanto mais para dentro do gol, mais alto) ou arraste
   para um espaço vazio para conduzir a bola até lá. 5 lances por partida, cada um mais difícil.
   Three.js r128 do cdnjs (o mesmo do Arena Racing), carregado só nesta página. Tudo é desenhado aqui, sem modelos de fora. */
(function () {
  var caixa = document.getElementById('f3d');
  if (!caixa) return;
  var URL_THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var RECORDE = 'arena-futebol-3d';
  var LANCES = 5, TEMPO_LANCE = 25, GOL_Z = 52.5, GOL_X = 3.66, GOL_Y = 2.44;
  var NOMES = ['Yan', 'Davi', 'Caio', 'Léo', 'Rafa', 'Biel', 'Kauã', 'Theo'];

  caixa.innerHTML =
    '<div class="f3-tela"><canvas class="f3-canvas"></canvas>' +
      '<div class="f3-hud"><div class="f3-placar"><b class="f3-lance">LANCE 1/5</b><span class="f3-gols">GOLS 0</span><span class="f3-tempo">0:25</span></div>' +
        '<button type="button" class="f3-cheia" aria-label="Tela cheia">⛶</button></div>' +
      '<p class="f3-dica">Arraste do jogador com a bola até um companheiro para tocar. Arraste até o gol para chutar.</p>' +
      '<div class="f3-msg" hidden></div>' +
      '<div class="f3-inicio"><b>Futebol 3D</b><span>5 lances para marcar o máximo de gols.<br>Arraste até um companheiro para tocar, até o gol para chutar (linha torta faz curva) ou para um espaço vazio para conduzir.</span>' +
        '<button type="button" class="ft-btn f3-comecar">Carregando…</button><small class="f3-rec"></small></div>' +
    '</div>';
  var tela = caixa.querySelector('.f3-tela'), cv = caixa.querySelector('.f3-canvas'), inicio = caixa.querySelector('.f3-inicio'), btComecar = caixa.querySelector('.f3-comecar');
  var msg = caixa.querySelector('.f3-msg'), elLance = caixa.querySelector('.f3-lance'), elGols = caixa.querySelector('.f3-gols'), elTempo = caixa.querySelector('.f3-tempo');
  var rec = 0; try { rec = +localStorage.getItem(RECORDE) || 0; } catch (e) {}
  caixa.querySelector('.f3-rec').textContent = rec ? 'Seu recorde: ' + rec + ' gol' + (rec > 1 ? 's' : '') + ' em 5 lances.' : '';

  /* tela cheia (no iPhone só cobre a tela) */
  caixa.querySelector('.f3-cheia').addEventListener('click', function () {
    if (tela.classList.contains('f3-cheio')) { tela.classList.remove('f3-cheio'); document.documentElement.classList.remove('b1-travado'); if (document.fullscreenElement) document.exitFullscreen(); return; }
    tela.classList.add('f3-cheio'); document.documentElement.classList.add('b1-travado');
    var p = tela.requestFullscreen ? tela.requestFullscreen() : null;
    if (p && p.then) p.then(function () { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); }).catch(function () {});
  });
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement) { tela.classList.remove('f3-cheio'); document.documentElement.classList.remove('b1-travado'); } });

  var s = document.createElement('script'); s.src = URL_THREE; s.crossOrigin = 'anonymous';
  s.onload = function () { montar(); btComecar.textContent = 'Começar'; };
  s.onerror = function () { btComecar.textContent = 'Não deu para carregar o 3D. Tente de novo mais tarde.'; };
  document.head.appendChild(s);

  function tex(w, h, desenhar) { var c = document.createElement('canvas'); c.width = w; c.height = h; desenhar(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; return t; }

  var T, renderer, cena, camera, chao, jogo = null, tempoAnt = 0, ray, mouse;

  function montar() {
    T = THREE;
    renderer = new T.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputEncoding = T.sRGBEncoding;
    cena = new T.Scene();
    cena.background = new T.Color(0x0a1022); cena.fog = new T.Fog(0x0a1022, 70, 140);
    camera = new T.PerspectiveCamera(50, 16 / 9, 0.1, 300);
    cena.add(new T.HemisphereLight(0xdfe8ff, 0x2a4a1a, 0.85));
    var sol = new T.DirectionalLight(0xffffff, 0.75); sol.position.set(-20, 40, 10); cena.add(sol);
    ray = new T.Raycaster(); mouse = new T.Vector2();
    montarCampo(); montarEstadio();
    redimensionar(); window.addEventListener('resize', redimensionar);
    ligarToque();
    requestAnimationFrame(laco);
  }
  function redimensionar() {
    var w = tela.clientWidth, h = tela.clientHeight || w * 9 / 16;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 72 : 50; camera.updateProjectionMatrix(); /* celular em pé: ângulo mais aberto para ver os lados */
  }

  /* gramado com listras e todas as linhas da metade de ataque, numa textura só */
  function montarCampo() {
    var S = 14, W = 80, H = 66; /* x de -40 a 40, z de -5 a 61 */
    var t = tex(W * S, H * S, function (c, w, h) {
      for (var i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#2f8f3a' : '#37a344'; c.fillRect(0, i * h / 14, w, h / 14 + 1); }
      var g = c.createRadialGradient(w / 2, h * 0.6, 50, w / 2, h * 0.6, w * 0.8); g.addColorStop(0, 'rgba(255,255,220,.08)'); g.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (var k = 0; k < 6000; k++) { c.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.06).toFixed(3) + ')'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      function X(x) { return (x + 40) * S; } function Z(z) { return (z + 5) * S; }
      c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = 0.14 * S;
      function ret(x1, z1, x2, z2) { c.strokeRect(X(x1), Z(z1), X(x2) - X(x1), Z(z2) - Z(z1)); }
      ret(-34, -6, 34, GOL_Z); /* laterais e linha de fundo */
      c.beginPath(); c.moveTo(X(-34), Z(0)); c.lineTo(X(34), Z(0)); c.stroke();
      c.beginPath(); c.arc(X(0), Z(0), 9.15 * S, 0, Math.PI); c.stroke();
      ret(-20.16, GOL_Z - 16.5, 20.16, GOL_Z); ret(-9.16, GOL_Z - 5.5, 9.16, GOL_Z);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(X(0), Z(GOL_Z - 11), 0.2 * S, 0, 7); c.fill();
      c.beginPath(); c.arc(X(0), Z(GOL_Z - 11), 9.15 * S, Math.PI + 0.93, Math.PI * 2 - 0.93, false); c.stroke();
    });
    chao = new T.Mesh(new T.PlaneGeometry(80, 66), new T.MeshLambertMaterial({ map: t }));
    chao.rotation.x = -Math.PI / 2; chao.position.set(0, 0, 28); cena.add(chao);
    var fora = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshLambertMaterial({ color: 0x1f5e28 }));
    fora.rotation.x = -Math.PI / 2; fora.position.y = -0.02; cena.add(fora);
    /* gol: traves, travessão e rede */
    var branco = new T.MeshLambertMaterial({ color: 0xffffff });
    [-GOL_X, GOL_X].forEach(function (x) { var p = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, GOL_Y, 10), branco); p.position.set(x, GOL_Y / 2, GOL_Z); cena.add(p); });
    var tr = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, GOL_X * 2 + 0.14, 10), branco); tr.rotation.z = Math.PI / 2; tr.position.set(0, GOL_Y, GOL_Z); cena.add(tr);
    var redeT = tex(256, 256, function (c, w, h) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; for (var i = 0; i <= 16; i++) { c.beginPath(); c.moveTo(i * w / 16, 0); c.lineTo(i * w / 16, h); c.stroke(); c.beginPath(); c.moveTo(0, i * h / 16); c.lineTo(w, i * h / 16); c.stroke(); } });
    redeT.wrapS = redeT.wrapT = T.RepeatWrapping;
    var redeM = new T.MeshBasicMaterial({ map: redeT, transparent: true, side: T.DoubleSide, depthWrite: false });
    var rede = new T.Group(), fundo = 2.2;
    var tras = new T.Mesh(new T.PlaneGeometry(GOL_X * 2, GOL_Y), redeM.clone()); tras.material.map = redeT.clone(); tras.material.map.repeat.set(3, 1); tras.material.map.needsUpdate = true; tras.position.set(0, GOL_Y / 2, GOL_Z + fundo); rede.add(tras);
    var teto = new T.Mesh(new T.PlaneGeometry(GOL_X * 2, fundo), redeM); teto.rotation.x = Math.PI / 2; teto.position.set(0, GOL_Y, GOL_Z + fundo / 2); rede.add(teto);
    [-GOL_X, GOL_X].forEach(function (x) { var l = new T.Mesh(new T.PlaneGeometry(fundo, GOL_Y), redeM); l.rotation.y = Math.PI / 2; l.position.set(x, GOL_Y / 2, GOL_Z + fundo / 2); rede.add(l); });
    cena.add(rede); montarCampo.rede = rede;
  }

  /* estádio: arquibancadas com torcida (textura desenhada aqui), placas de LED e refletores */
  function torcidaTex() {
    return tex(1024, 512, function (c, w, h) {
      var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b0f1c'); g.addColorStop(1, '#1b2438'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      var peles = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'], cores = ['#dc2626', '#dc2626', '#facc15', '#facc15', '#e5e7eb', '#1d4ed8', '#111827', '#16a34a'];
      for (var y = 18; y < h; y += 26) {
        c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(0, y + 14, w, 3);
        for (var x = (y / 26 % 2) * 9; x < w; x += 15 + Math.random() * 5) {
          if (Math.random() < 0.05) continue;
          var pele = peles[Math.floor(Math.random() * peles.length)];
          if (Math.random() < 0.2) { c.strokeStyle = pele; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 5, y + 6); c.lineTo(x - 8, y - 9); c.moveTo(x + 5, y + 6); c.lineTo(x + 8, y - 9); c.stroke(); }
          c.fillStyle = cores[Math.floor(Math.random() * cores.length)]; c.fillRect(x - 7, y + 4, 14, 13);
          c.fillStyle = pele; c.beginPath(); c.arc(x, y, 5.5, 0, 7); c.fill();
        }
      }
    });
  }
  function montarEstadio() {
    var tt = torcidaTex(); tt.wrapS = T.RepeatWrapping;
    var mats = [];
    function arquibancada(larg, x, z, rotY) {
      var t = tt.clone(); t.needsUpdate = true; t.repeat.set(larg / 40, 1);
      var m = new T.MeshBasicMaterial({ map: t }); mats.push(m);
      var g = new T.Group();
      var p = new T.Mesh(new T.PlaneGeometry(larg, 26), m); p.rotation.x = -0.62; p.position.set(0, 9.5, -8); /* o campo fica para +z do grupo */ g.add(p);
      var muro = new T.Mesh(new T.BoxGeometry(larg, 2.2, 0.5), new T.MeshLambertMaterial({ color: 0x14203a })); muro.position.set(0, 1.1, 0); g.add(muro);
      g.position.set(x, 0, z); g.rotation.y = rotY; cena.add(g);
    }
    arquibancada(110, 0, GOL_Z + 9, Math.PI); /* atrás do gol (de frente para o campo) */
    arquibancada(90, -42, 22, Math.PI / 2); arquibancada(90, 42, 22, -Math.PI / 2);
    montarEstadio.mats = mats;
    /* placas de LED atrás da linha de fundo e nas laterais */
    var pt = tex(1024, 64, function (c, w, h) {
      var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0d1b3d'); g.addColorStop(1, '#091228'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.font = '800 30px Inter, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      ['ARENA SPORTS', 'FUTEBOL 3D', 'ARENA SPORTS', 'AO VIVO'].forEach(function (s, i) { c.fillStyle = i % 2 ? '#fbbf24' : '#60a5fa'; c.fillText(s, w / 8 + i * w / 4, h / 2 + 2); });
    });
    pt.wrapS = T.RepeatWrapping;
    function placa(larg, x, z, rotY) { var t = pt.clone(); t.needsUpdate = true; t.repeat.set(larg / 30, 1); var m = new T.Mesh(new T.BoxGeometry(larg, 0.9, 0.15), [0, 0, 0, 0, new T.MeshBasicMaterial({ map: t }), new T.MeshBasicMaterial({ color: 0x0a1228 })].map(function (q) { return q || new T.MeshBasicMaterial({ color: 0x0a1228 }); })); m.position.set(x, 0.45, z); m.rotation.y = rotY; cena.add(m); }
    placa(60, 0, GOL_Z + 4.5, Math.PI); placa(70, -37, 20, Math.PI / 2); placa(70, 37, 20, -Math.PI / 2);
    /* refletores */
    [[-38, GOL_Z + 14], [38, GOL_Z + 14], [-44, -4], [44, -4]].forEach(function (q) {
      var g = new T.Mesh(new T.BoxGeometry(5, 2, 0.6), new T.MeshBasicMaterial({ color: 0xfffbe6 })); g.position.set(q[0], 30, q[1]); g.lookAt(0, 0, 25); cena.add(g);
    });
  }

  /* boneco: pernas, braços e cabeça articulados, uniforme por time, número nas costas */
  function jogador(kit, numero, nome) {
    var g = new T.Group(), M = function (c) { return new T.MeshLambertMaterial({ color: c }); };
    var pele = M(kit.pele), camisa = M(kit.camisa), calcao = M(kit.calcao), meiao = M(kit.meiao), chut = M(kit.chuteira || 0x111111);
    function perna(lado) {
      var p = new T.Group(); p.position.set(0.11 * lado, 0.88, 0);
      var coxa = new T.Mesh(new T.CylinderGeometry(0.085, 0.075, 0.42, 8), pele); coxa.position.y = -0.21; p.add(coxa);
      var canela = new T.Mesh(new T.CylinderGeometry(0.075, 0.06, 0.4, 8), meiao); canela.position.y = -0.62; p.add(canela);
      var pe = new T.Mesh(new T.BoxGeometry(0.11, 0.08, 0.27), chut); pe.position.set(0, -0.83, 0.06); p.add(pe);
      g.add(p); return p;
    }
    function braco(lado) {
      var b = new T.Group(); b.position.set(0.27 * lado, 1.48, 0);
      var manga = new T.Mesh(new T.CylinderGeometry(0.07, 0.065, 0.22, 8), camisa); manga.position.y = -0.1; b.add(manga);
      var ante = new T.Mesh(new T.CylinderGeometry(0.055, 0.05, 0.4, 8), kit.luva ? M(kit.luva) : pele); ante.position.y = -0.38; b.add(ante);
      g.add(b); return b;
    }
    var pE = perna(-1), pD = perna(1);
    var short = new T.Mesh(new T.CylinderGeometry(0.21, 0.23, 0.26, 10), calcao); short.position.y = 0.92; short.scale.z = 0.75; g.add(short);
    var tronco = new T.Mesh(new T.CylinderGeometry(0.25, 0.2, 0.6, 12), camisa); tronco.position.y = 1.27; tronco.scale.z = 0.7; g.add(tronco);
    var bE = braco(-1), bD = braco(1);
    var pesc = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.1, 8), pele); pesc.position.y = 1.62; g.add(pesc);
    var cab = new T.Mesh(new T.SphereGeometry(0.135, 14, 12), pele); cab.position.y = 1.76; cab.scale.set(1, 1.1, 1); g.add(cab);
    var cabelo = new T.Mesh(new T.SphereGeometry(0.142, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(kit.cabelo || 0x1a120b)); cabelo.position.y = 1.79; cabelo.rotation.x = -0.2; g.add(cabelo);
    if (numero) {
      var nt = tex(128, 128, function (c, w, h) { c.font = '800 84px Inter, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = kit.numero || '#fff'; c.fillText(numero, w / 2, h / 2 + 4); });
      var nm = new T.Mesh(new T.PlaneGeometry(0.3, 0.3), new T.MeshBasicMaterial({ map: nt, transparent: true })); nm.position.set(0, 1.3, -0.18); nm.rotation.y = Math.PI; g.add(nm);
    }
    /* sombra redonda no chão */
    var sombra = new T.Mesh(new T.CircleGeometry(0.38, 16), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.02; g.add(sombra);
    /* anel de destaque (quem está com a bola / companheiro na mira) */
    var anel = new T.Mesh(new T.RingGeometry(0.55, 0.7, 28), new T.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.9, depthWrite: false }));
    anel.rotation.x = -Math.PI / 2; anel.position.y = 0.03; anel.visible = false; g.add(anel);
    if (nome) {
      var st = tex(256, 64, function (c, w, h) { c.font = '700 34px Inter, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText(nome, w / 2, h / 2); c.fillStyle = '#fff'; c.fillText(nome, w / 2, h / 2); });
      var sp = new T.Sprite(new T.SpriteMaterial({ map: st, depthTest: false })); sp.scale.set(1.6, 0.4, 1); sp.position.y = 2.35; g.add(sp);
    }
    cena.add(g);
    return { g: g, pE: pE, pD: pD, bE: bE, bD: bD, anel: anel, pos: g.position, fase: Math.random() * 6, chute: 0, vel: 0 };
  }
  function bolaNova() {
    var t = tex(256, 128, function (c, w, h) { c.fillStyle = '#f8fafc'; c.fillRect(0, 0, w, h); c.fillStyle = '#111827'; for (var i = 0; i < 9; i++) { c.beginPath(); c.arc((i % 5) * 56 + (i > 4 ? 28 : 0) + 14, i > 4 ? 92 : 36, 14, 0, 7); c.fill(); } });
    var m = new T.Mesh(new T.SphereGeometry(0.11, 18, 14), new T.MeshLambertMaterial({ map: t })); cena.add(m);
    var sb = new T.Mesh(new T.CircleGeometry(0.13, 14), new T.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false })); sb.rotation.x = -Math.PI / 2; cena.add(sb);
    return { m: m, sombra: sb, pos: m.position, estado: 'pe' };
  }

  var KIT_ATA = { camisa: 0xd62828, calcao: 0xffffff, meiao: 0xd62828, pele: 0xd9a27a, numero: '#fff' };
  var KIT_DEF = { camisa: 0xf5c518, calcao: 0x0f5132, meiao: 0xf5c518, pele: 0xe0ac69, numero: '#0f5132', cabelo: 0x3b2414 };
  var KIT_GOL = { camisa: 0x7c3aed, calcao: 0x111827, meiao: 0x7c3aed, pele: 0xc68642, luva: 0x22c55e, numero: '#fff' };
  var PELES = [0xd9a27a, 0x8d5524, 0xc68642, 0xf1c27d, 0xa8714a];

  /* um lance: posições iniciais variam, e a defesa cresce a cada lance */
  function novoLance() {
    limpar();
    var n = jogo.lance, r = function (a) { return (Math.random() - 0.5) * a; };
    var posAta = [[r(6), 20 + r(3)], [-15 + r(4), 31 + r(4)], [15 + r(4), 31 + r(4)], [-6 + r(4), 40 + r(3)], [8 + r(4), 41 + r(3)]];
    jogo.ata = posAta.map(function (p, i) {
      var k = Object.assign({}, KIT_ATA, { pele: PELES[i % PELES.length] });
      var j = jogador(k, String([10, 7, 11, 9, 8][i]), i ? NOMES[(i + n) % NOMES.length] : '');
      j.pos.set(p[0], 0, p[1]); j.base = new T.Vector3(p[0], 0, p[1]); return j;
    });
    var nDef = Math.min(5, 3 + Math.floor(n / 2) + (n >= 4 ? 1 : 0));
    jogo.def = [];
    for (var i = 0; i < nDef; i++) {
      var alvo = jogo.ata[i === 0 ? 0 : i];
      var d = jogador(Object.assign({}, KIT_DEF, { pele: PELES[(i + 2) % PELES.length] }), String(2 + i), '');
      d.pos.set(alvo.pos.x * 0.8 + r(2), 0, alvo.pos.z + 5 + r(2)); d.marca = alvo; d.pressiona = i === 0; jogo.def.push(d);
    }
    jogo.gk = jogador(KIT_GOL, '1', ''); jogo.gk.pos.set(0, 0, GOL_Z - 0.8);
    jogo.bola = bolaNova(); jogo.portador = jogo.ata[0]; jogo.portador.anel.visible = true;
    jogo.tempo = TEMPO_LANCE; jogo.estado = 'jogando'; jogo.contato = 0; jogo.camAlvo = null;
    elLance.textContent = 'LANCE ' + (n + 1) + '/' + LANCES; elGols.textContent = 'GOLS ' + jogo.gols;
    msg.hidden = true;
  }
  function limpar() {
    if (!jogo) return;
    (jogo.ata || []).concat(jogo.def || [], jogo.gk ? [jogo.gk] : []).forEach(function (j) { cena.remove(j.g); });
    if (jogo.bola) { cena.remove(jogo.bola.m); cena.remove(jogo.bola.sombra); }
    if (jogo.linha) { cena.remove(jogo.linha); jogo.linha = null; }
  }
  function comecar() {
    jogo = { lance: 0, gols: 0 }; inicio.hidden = true;
    novoLance();
  }
  btComecar.addEventListener('click', function () { if (window.THREE && cena) comecar(); });

  /* ---------- toque: desenhar a linha ---------- */
  var desenhando = false, pontos = [], mira = null;
  function pontoNoChao(e) {
    var r = cv.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    /* mira: onde o dedo aponta na "parede" do gol (para chutar no canto, no alto ou rasteiro) */
    var tg = (GOL_Z - ray.ray.origin.z) / ray.ray.direction.z, mg = tg > 0 ? ray.ray.origin.clone().add(ray.ray.direction.clone().multiplyScalar(tg)) : null;
    mira = mg && mg.y > -0.3 && mg.y < 4.2 && Math.abs(mg.x) < 8 ? mg : null;
    var t = -ray.ray.origin.y / ray.ray.direction.y; if (!(t > 0)) return null;
    return ray.ray.origin.clone().add(ray.ray.direction.clone().multiplyScalar(t));
  }
  function ligarToque() {
    cv.addEventListener('pointerdown', function (e) {
      if (!jogo || jogo.estado !== 'jogando' || jogo.bola.estado !== 'pe') return;
      var p = pontoNoChao(e); if (!p) return;
      desenhando = true; pontos = [jogo.portador.pos.clone()]; if (p.distanceTo(pontos[0]) > 0.6) pontos.push(p);
      try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!desenhando) return;
      var p = pontoNoChao(e); if (!p) return;
      if (p.distanceTo(pontos[pontos.length - 1]) > 0.5) { pontos.push(p); desenharLinha(); }
      var alvo = companheiroPerto(p); jogo.ata.forEach(function (j) { j.anel.visible = j === jogo.portador || j === alvo; });
    });
    cv.addEventListener('pointerup', function () { if (!desenhando) return; desenhando = false; soltar(); });
    cv.addEventListener('pointercancel', function () { desenhando = false; if (jogo && jogo.linha) { cena.remove(jogo.linha); jogo.linha = null; } });
  }
  function desenharLinha() {
    if (jogo.linha) cena.remove(jogo.linha);
    if (pontos.length < 2) return;
    var pos = [], larg = 0.18;
    for (var i = 0; i < pontos.length; i++) {
      var a = pontos[Math.max(0, i - 1)], b = pontos[Math.min(pontos.length - 1, i + 1)];
      var dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1, nx = -dz / l * larg, nz = dx / l * larg;
      pos.push(pontos[i].x + nx, 0.05, pontos[i].z + nz, pontos[i].x - nx, 0.05, pontos[i].z - nz);
    }
    var idx = []; for (var k = 0; k < pontos.length - 1; k++) { var q = k * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
    var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    jogo.linha = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: T.DoubleSide, depthWrite: false }));
    cena.add(jogo.linha);
  }
  function companheiroPerto(p) {
    var melhor = null, dm = 3.5;
    jogo.ata.forEach(function (j) { if (j === jogo.portador) return; var d = Math.hypot(j.pos.x - p.x, j.pos.z - p.z); if (d < dm) { dm = d; melhor = j; } });
    return melhor;
  }
  /* soltou o dedo: chute, passe ou condução */
  function soltar() {
    if (jogo.linha) { var l = jogo.linha; setTimeout(function () { cena.remove(l); }, 250); jogo.linha = null; }
    if (pontos.length < 2) return;
    var fim = pontos[pontos.length - 1], b = jogo.bola, port = jogo.portador;
    jogo.ata.forEach(function (j) { j.anel.visible = false; });
    if (mira || (fim.z > GOL_Z - 6 && Math.abs(fim.x) < 9)) { /* chute: no ponto do gol para onde o dedo apontou */
      var meio = pontos[Math.floor(pontos.length / 2)], ini = port.pos.clone();
      var alvo = mira ? new T.Vector3(mira.x, Math.max(0.15, mira.y), GOL_Z + 0.3) : new T.Vector3(Math.max(-6, Math.min(6, fim.x)), 0.25, GOL_Z + 0.3);
      var reta = ini.clone().lerp(new T.Vector3(alvo.x, 0, alvo.z), 0.5), desvio = new T.Vector3(meio.x - reta.x, 0, meio.z - reta.z);
      var ctrl = reta.clone().add(desvio.multiplyScalar(1.6)); ctrl.y = alvo.y * 1.4 + 0.6;
      var dist = ini.distanceTo(alvo);
      b.estado = 'chute'; b.t = 0; b.dur = Math.max(0.45, dist / 26); b.ini = ini.clone().setY(0.11); b.ctrl = ctrl; b.alvo = alvo;
      port.chute = 0.3;
      decidirGoleiro(alvo, dist);
      return;
    }
    var comp = companheiroPerto(fim);
    if (comp) { /* passe pela linha desenhada */
      var cam = pontos.slice(); cam[cam.length - 1] = comp.pos.clone();
      b.estado = 'passe'; b.caminho = cam; b.i = 0; b.alvoJ = comp; b.andou = 0; port.chute = 0.25;
      return;
    }
    /* condução até o fim da linha (no máximo 14 m) */
    var tot = 0, cam2 = [pontos[0]];
    for (var i = 1; i < pontos.length && tot < 14; i++) { tot += pontos[i].distanceTo(pontos[i - 1]); cam2.push(pontos[i]); }
    b.estado = 'conducao'; b.caminho = cam2; b.i = 0;
  }
  /* o goleiro decide na hora do chute se alcança: canto e alto são mais difíceis, e a dificuldade sobe a cada lance */
  function decidirGoleiro(alvo, dist) {
    var g = jogo.gk, dentro = Math.abs(alvo.x) < GOL_X - 0.1 && alvo.y < GOL_Y - 0.05;
    var canto = Math.min(1, Math.abs(alvo.x) / GOL_X), alto = alvo.y / GOL_Y;
    var chance = 0.55 - canto * 0.35 - (canto > 0.7 && alto > 0.55 ? 0.15 : 0) + jogo.lance * 0.05 - Math.max(0, 18 - dist) * 0.012;
    g.mergulho = { para: alvo.clone(), defende: dentro && Math.random() < Math.max(0.08, chance), t: 0 };
  }

  /* ---------- quadro a quadro ---------- */
  function mover(j, alvo, vel, dt) {
    var dx = alvo.x - j.pos.x, dz = alvo.z - j.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.05) { j.vel = 0; return d; }
    var passo = Math.min(d, vel * dt); j.pos.x += dx / d * passo; j.pos.z += dz / d * passo; j.vel = vel;
    j.g.rotation.y = Math.atan2(dx, dz); return d;
  }
  function animar(j, dt) {
    j.fase += dt * (4 + j.vel * 1.6);
    var a = j.vel > 0.2 ? Math.sin(j.fase) * Math.min(0.9, 0.25 + j.vel * 0.1) : 0;
    j.pE.rotation.x = a; j.pD.rotation.x = -a; j.bE.rotation.x = -a * 0.8; j.bD.rotation.x = a * 0.8;
    if (j.chute > 0) { j.chute -= dt; j.pD.rotation.x = j.chute > 0.15 ? 0.7 : -1.2; }
  }
  function terminar(texto, gol) {
    if (jogo.estado !== 'jogando') return;
    jogo.estado = 'parado';
    if (gol) { jogo.gols++; elGols.textContent = 'GOLS ' + jogo.gols; jogo.festa = 2.2; }
    msg.textContent = texto; msg.className = 'f3-msg' + (gol ? ' f3-gol' : ''); msg.hidden = false;
    setTimeout(function () {
      jogo.lance++;
      if (jogo.lance < LANCES) return novoLance();
      jogo.estado = 'fim';
      if (jogo.gols > rec) { rec = jogo.gols; try { localStorage.setItem(RECORDE, rec); } catch (e) {} }
      inicio.querySelector('b').textContent = jogo.gols + ' gol' + (jogo.gols === 1 ? '' : 's') + ' em 5 lances';
      inicio.querySelector('span').textContent = jogo.gols >= 4 ? 'Craque! Defesa nenhuma segurou.' : jogo.gols >= 2 ? 'Boa! Dá para fazer mais.' : 'A defesa levou a melhor. Tente de novo!';
      inicio.querySelector('.f3-rec').textContent = 'Seu recorde: ' + rec + ' gol' + (rec === 1 ? '' : 's') + ' em 5 lances.';
      btComecar.textContent = 'Jogar de novo'; inicio.hidden = false; msg.hidden = true;
    }, 2300);
  }
  function passo(dt) {
    var b = jogo.bola, port = jogo.portador;
    if (jogo.estado === 'jogando') {
      jogo.tempo -= dt;
      elTempo.textContent = '0:' + ('0' + Math.max(0, Math.ceil(jogo.tempo))).slice(-2);
      if (jogo.tempo <= 0) terminar('Acabou o tempo!');
    }
    /* bola */
    if (b.estado === 'pe' || b.estado === 'conducao') {
      if (b.estado === 'conducao') {
        var alvoC = b.caminho[b.i + 1];
        if (!alvoC) b.estado = 'pe';
        else if (mover(port, alvoC, 6.3, dt) < 0.3) b.i++;
      } else port.vel = 0;
      var fr = port.g.rotation.y;
      b.pos.set(port.pos.x + Math.sin(fr) * 0.45, 0.11, port.pos.z + Math.cos(fr) * 0.45);
      b.m.rotation.x += port.vel * dt * 4;
    } else if (b.estado === 'passe') {
      var alvoP = b.caminho[b.i + 1];
      if (!alvoP) { b.estado = 'pe'; jogo.portador = b.alvoJ; jogo.portador.anel.visible = true; }
      else {
        var dx = alvoP.x - b.pos.x, dz = alvoP.z - b.pos.z, d = Math.hypot(dx, dz), st = Math.min(d, 19 * dt);
        b.pos.x += dx / (d || 1) * st; b.pos.z += dz / (d || 1) * st; b.pos.y = 0.11; b.m.rotation.x += st * 4; b.andou += st;
        if (d < 0.25) b.i++;
        if (b.andou > 1.4) jogo.def.forEach(function (df) { if (jogo.estado === 'jogando' && Math.hypot(df.pos.x - b.pos.x, df.pos.z - b.pos.z) < 0.85) { b.estado = 'perdida'; terminar('Interceptado!'); } }); /* o primeiro metro e meio é livre */
      }
    } else if (b.estado === 'chute') {
      b.t += dt / b.dur; var t = Math.min(1, b.t), u = 1 - t;
      b.pos.set(u * u * b.ini.x + 2 * u * t * b.ctrl.x + t * t * b.alvo.x, Math.max(0.11, u * u * b.ini.y + 2 * u * t * b.ctrl.y + t * t * b.alvo.y), u * u * b.ini.z + 2 * u * t * b.ctrl.z + t * t * b.alvo.z);
      b.m.rotation.x += dt * 25;
      if (jogo.estado === 'jogando' && b.pos.y < 1.9) jogo.def.forEach(function (df) { if (jogo.estado === 'jogando' && t > 0.08 && Math.hypot(df.pos.x - b.pos.x, df.pos.z - b.pos.z) < 0.7) { b.estado = 'perdida'; terminar('Bloqueado!'); } });
      var gk = jogo.gk.mergulho;
      if (gk && gk.defende && t > 0.82 && jogo.estado === 'jogando') { b.estado = 'rebote'; b.vel = new T.Vector3((Math.random() - 0.5) * 6, 4, -9); terminar('Defendeu!'); }
      if (t >= 1 && jogo.estado === 'jogando') {
        var a = b.alvo;
        if (Math.abs(a.x) < GOL_X - 0.08 && a.y < GOL_Y - 0.06) { b.estado = 'rede'; b.vel = new T.Vector3(0, -1, 5); terminar('GOOOL!', true); }
        else if (Math.abs(a.x) < GOL_X + 0.15 && a.y < GOL_Y + 0.15) { b.estado = 'rebote'; b.vel = new T.Vector3(a.x > 0 ? 3 : -3, 3, -8); terminar('Na trave!'); }
        else { b.estado = 'fora'; b.vel = new T.Vector3(0, 0, 10); terminar('Pra fora!'); }
      }
    } else if (b.vel) { /* rebote, rede ou fora: a bola só segue com gravidade */
      b.vel.y -= 9.8 * dt; b.pos.addScaledVector(b.vel, dt);
      if (b.estado === 'rede' && b.pos.z > GOL_Z + 2) { b.pos.z = GOL_Z + 2; b.vel.z = -b.vel.z * 0.2; }
      if (b.pos.y < 0.11) { b.pos.y = 0.11; b.vel.y = -b.vel.y * 0.5; b.vel.x *= 0.8; b.vel.z *= 0.8; }
    }
    b.sombra.position.set(b.pos.x, 0.015, b.pos.z);

    /* companheiros: andam devagar para frente, abrindo espaço */
    jogo.ata.forEach(function (j, i) {
      if (j === jogo.portador) return;
      if (b.estado === 'passe' && b.alvoJ === j) { j.vel = 0; j.g.rotation.y = Math.atan2(b.pos.x - j.pos.x, b.pos.z - j.pos.z); return; }
      var alvo = j.base.clone(); alvo.z = Math.min(GOL_Z - 7, j.base.z + (TEMPO_LANCE - jogo.tempo) * 0.35); alvo.x += Math.sin(jogo.tempo * 0.6 + i) * 2;
      mover(j, alvo, 2.4, dt);
    });
    /* defesa: um pressiona quem está com a bola; os outros marcam, entre o atacante e o gol */
    var vel = 3.6 + jogo.lance * 0.35;
    jogo.def.forEach(function (d) {
      var alvo;
      if (d.pressiona && TEMPO_LANCE - jogo.tempo < 1.3) { d.vel = 0; return; } /* um respiro no começo do lance */
      if (d.pressiona && b.estado !== 'passe') alvo = port.pos.clone().lerp(new T.Vector3(0, 0, GOL_Z), 0.04);
      else { var m = d.marca === port ? port : d.marca; alvo = m.pos.clone().lerp(new T.Vector3(0, 0, GOL_Z), 0.18); }
      if (b.estado === 'passe' && !d.pressiona) alvo = alvo.lerp(b.pos, 0.25); /* tenta cortar o passe */
      mover(d, alvo, d.pressiona ? vel + 0.4 : vel, dt);
    });
    var marcador = jogo.def.filter(function (d) { return d.pressiona; })[0];
    if (marcador && jogo.estado === 'jogando' && (b.estado === 'pe' || b.estado === 'conducao')) {
      if (Math.hypot(marcador.pos.x - port.pos.x, marcador.pos.z - port.pos.z) < 1.05) { jogo.contato += dt; if (jogo.contato > 0.45) { b.estado = 'perdida'; terminar('Desarmado!'); } }
      else jogo.contato = Math.max(0, jogo.contato - dt);
    }
    /* goleiro: acompanha a bola na linha do gol e mergulha no chute */
    var g = jogo.gk, mg = g.mergulho;
    if (mg) {
      mg.t += dt; var k = Math.min(1, mg.t / 0.35);
      var alcX = mg.defende ? mg.para.x : mg.para.x * 0.55 - Math.sign(mg.para.x || 1) * 0.2;
      g.pos.x += (alcX - g.pos.x) * Math.min(1, dt * 9);
      g.g.rotation.z = -Math.sign(alcX - 0.0001) * k * (Math.abs(alcX) > 0.8 ? 1.25 : 0.2);
      g.pos.y = mg.para.y > 1 && Math.abs(alcX) > 0.8 ? k * 0.6 : 0; g.vel = 0;
    } else {
      g.pos.x += (Math.max(-2.6, Math.min(2.6, b.pos.x * 0.32)) - g.pos.x) * Math.min(1, dt * 3); g.g.rotation.y = Math.PI; g.vel = 0;
      g.bE.rotation.z = 0.5; g.bD.rotation.z = -0.5;
    }
    jogo.ata.concat(jogo.def).forEach(function (j) { animar(j, dt); });
    if (jogo.festa > 0) { jogo.festa -= dt; montarEstadio.mats.forEach(function (m, i) { m.map.offset.y = Math.sin(jogo.festa * 30 + i) * 0.006; }); }
    /* câmera atrás de quem está com a bola, olhando para o gol */
    var foco = b.estado === 'chute' || b.estado === 'rede' || b.estado === 'rebote' || b.estado === 'fora' ? new T.Vector3(b.pos.x * 0.5, 0, Math.min(b.pos.z, GOL_Z - 8)) : (b.estado === 'passe' ? b.pos : port.pos);
    var retrato = camera.aspect < 1, alt = retrato ? 12 : 7, tras = retrato ? 11 : 9.5;
    var desejo = new T.Vector3(foco.x * 0.7, alt, Math.min(foco.z - tras, GOL_Z - 20));
    if (desenhando) return; /* câmera parada enquanto a pessoa desenha a linha */
    camera.position.lerp(desejo, Math.min(1, dt * 2.5));
    var olhar = new T.Vector3(foco.x * 0.8, 0.5, Math.min(foco.z + (retrato ? 8 : 9), GOL_Z + 2));
    jogo.olhar = jogo.olhar ? jogo.olhar.lerp(olhar, Math.min(1, dt * 3)) : olhar;
    camera.lookAt(jogo.olhar);
  }
  /* para testes: posição na tela de um ponto do campo */
  window.FUTEBOL_3D = { jogo: function () { return jogo; }, naTela: function (v) { var p = v.clone().project(camera), r = cv.getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height }; } };
  function laco(t) {
    var dt = Math.min(0.033, (t - (tempoAnt || t)) / 1000); tempoAnt = t;
    if (tela.clientWidth && Math.abs(renderer.domElement.width / renderer.getPixelRatio() - tela.clientWidth) > 2) redimensionar();
    if (jogo && jogo.estado !== 'fim' && jogo.bola) passo(dt);
    else { camera.position.set(Math.sin(t / 4000) * 8, 10, 22); camera.lookAt(0, 0, GOL_Z - 4); }
    renderer.render(cena, camera);
    requestAnimationFrame(laco);
  }
})();
