/* Arena Racing: corrida arcade em 3D, você pilota (substitui o Chefe de Equipe).
   Câmera atrás do carro, 11 adversários do computador, nas pistas reais do site (circuitos.js, OpenStreetMap).
   Categoria: Fórmula 1 (os outros carros continuam no código, ocultos), com carros desenhados no próprio jogo, sem marca.
   Three.js r128 é carregado do cdnjs só quando a pessoa entra na corrida. Chamado por jogos.js: window.JOGO_CORRIDA(elemento). */
(function () {
  var URL_THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var URL_CEU = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Sky.js';
  var estadoThree = 'nada', esperaThree = [];
  function carregarThree(ok, falha) {
    if (window.THREE) return ok();
    esperaThree.push([ok, falha]);
    if (estadoThree === 'carregando') return;
    estadoThree = 'carregando';
    var s = document.createElement('script'); s.src = URL_THREE; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = function () {
      var sk = document.createElement('script'); sk.src = URL_CEU; sk.async = true; sk.crossOrigin = 'anonymous';
      sk.onload = sk.onerror = function () { estadoThree = 'pronto'; var l = esperaThree; esperaThree = []; l.forEach(function (f) { f[0](); }); };
      document.head.appendChild(sk);
    };
    s.onerror = function () { estadoThree = 'nada'; var l = esperaThree; esperaThree = []; l.forEach(function (f) { if (f[1]) f[1](); }); };
    document.head.appendChild(s);
  }

  function ler(k, p) { try { var v = localStorage.getItem('naveia-jogo-' + k); return v ? JSON.parse(v) : p; } catch (e) { return p; } }
  function guardar(k, v) { try { localStorage.setItem('naveia-jogo-' + k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return window.esc ? window.esc(s) : String(s); }
  function tempo(s) {
    if (!isFinite(s) || s <= 0) return '--:--.---';
    var m = Math.floor(s / 60), r = s - m * 60;
    return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function limitar(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------- Categorias (números de arcade: velocidade em m/s, acelerações em m/s²) ---------- */
  /* Números de cada carro (aproximados dos reais): massa com piloto (kg), potência (kW), área de arrasto CdA (m²),
     aderência dos pneus (g), ganho de aderência e de frenagem com a velocidade (asa/fundo), tração máxima (g).
     Velocidade máxima, aceleração e frenagem saem da física; ers = bateria (só F1). */
  var CLASSES = {
    f1: { nome: 'Fórmula 1', curto: 'F1', tipo: 'formula', esc: 1, comp: 5.3, larg: 1.9, cam: 6.4, ers: true, marchas: 8,
      massa: 768, kw: 700, cdA: 1.38, mu: 1.9, aeroLat: 0.0062, aeroFreio: 0.0047, tracao: 1.55 },
    wec: { nome: 'WEC', curto: 'WEC', grupo: ['hyper', 'gt3'], oculta: true }, /* fora do jogo: o site agora é só Fórmula 1 */
    porsche: { nome: 'Porsche Cup', curto: 'Cup', oculta: true, tipo: 'gt', esc: 1, comp: 4.6, larg: 1.9, cam: 6.9, comb: true, marchas: 6,
      massa: 1260, kw: 375, cdA: 1.28, mu: 1.42, aeroLat: 0.0009, aeroFreio: 0.0008, tracao: 0.95 },
    hyper: { nome: 'Hypercar', curto: 'HY', tipo: 'proto', esc: 1, comp: 5.0, larg: 2.0, cam: 7.2, oculta: true, comb: true, marchas: 7,
      massa: 1060, kw: 515, cdA: 1.0, mu: 1.78, aeroLat: 0.0034, aeroFreio: 0.0028, tracao: 1.15 },
    gt3: { nome: 'GT3', curto: 'GT3', tipo: 'gt', esc: 1, comp: 4.7, larg: 2.0, cam: 7.0, oculta: true, comb: true, marchas: 6,
      massa: 1300, kw: 410, cdA: 1.17, mu: 1.68, aeroLat: 0.0016, aeroFreio: 0.0011, tracao: 1.0 }
  };
  var GRAV = 9.81;
  /* velocidade no corte de giro de cada marcha (marchas mais longas em cima, como num câmbio de corrida) */
  function vMarcha(Cc, g) { return Cc.vmax * Math.pow(g / Cc.marchas, 0.6) * 1.02; }
  function marchaAuto(Cc, v) { var g = 1; while (g < Cc.marchas && v > vMarcha(Cc, g) * 0.96) g++; return g; }
  function arrasto(Cc, v) { return 0.6 * Cc.cdA * v * v / Cc.massa + 0.15; }
  function acelC(Cc, v, mult, vac) { return Math.min(Cc.tracao * GRAV + Cc.aeroLat * 0.35 * v * v, Cc.kw * 1000 * (mult == null ? 1 : mult) / (Cc.massa * Math.max(v, 3))) - arrasto(Cc, v) * (1 - VACUO * (vac || 0)); }
  var VACUO = 0.28; /* no vácuo cheio o arrasto cai 28% (uns 9% a mais de velocidade final) */
  function freioC(Cc, v) { return Cc.mu * GRAV + Cc.aeroFreio * v * v + arrasto(Cc, v); }
  function latC(Cc, v) { return Cc.mu * GRAV + Cc.aeroLat * v * v; }
  /* velocidade máxima: onde a potência só vence o arrasto */
  Object.keys(CLASSES).forEach(function (k) { var Cc = CLASSES[k]; if (!Cc.kw) return; var v = 20; while (v < 130 && acelC(Cc, v, 1) > 0) v += 0.1; Cc.vmax = v; });
  var NIVEIS = {
    facil: { nome: 'Fácil', habil: [0.8, 0.87] },
    medio: { nome: 'Médio', habil: [0.88, 0.935] },
    dificil: { nome: 'Difícil', habil: [0.94, 0.985] }
  };
  var NOMES = ['R. Moura', 'T. Kessler', 'L. Andrade', 'M. Ferraz', 'J. Okafor', 'A. Lindqvist', 'D. Vargas', 'S. Nakamura', 'P. Rossetti', 'E. Clarke', 'N. Haddad'];
  var LARG_PISTA = 15, SOBRA = 11; /* pista de 15 m; muro a 11 m da borda (grama e brita) */

  /* velocidade máxima em cada ponto para uma categoria (curvas + freadas) */
  function perfilVel(T, C) {
    var N = T.N, ds = T.ds, v = new Float32Array(N);
    /* na curva: v² k = aderência(v) = mu g + aero v²  =>  v² = mu g / (k - aero) */
    for (var i = 0; i < N; i++) { var kk = Math.abs(T.k[i]); v[i] = kk <= C.aeroLat ? C.vmax : Math.min(C.vmax, Math.sqrt(C.mu * GRAV / (kk - C.aeroLat))); }
    var acel = function (u) { return Math.max(0.3, acelC(C, u, 1)); };
    for (var rep = 0; rep < 2; rep++) {
      for (var f = 0; f < N; f++) { var a = v[(f - 1 + N) % N]; v[f] = Math.min(v[f], Math.sqrt(a * a + 2 * acel(a) * ds)); }
      for (var b = N - 1; b >= 0; b--) { var n = v[(b + 1) % N]; v[b] = Math.min(v[b], Math.sqrt(n * n + 2 * freioC(C, n) * 0.9 * ds)); }
    }
    return v;
  }
  function gradeDistancia(T) {
    var G = {}, CEL = 30;
    for (var i = 0; i < T.N; i += 2) { var k = Math.floor(T.x[i] / CEL) + ',' + Math.floor(T.z[i] / CEL); (G[k] = G[k] || []).push(i); }
    return function (x, z, raio) {
      var cx = Math.floor(x / CEL), cz = Math.floor(z / CEL), r = Math.ceil(raio / CEL), m = Infinity;
      for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) {
        var l = G[(cx + dx) + ',' + (cz + dz)];
        if (l) for (var j = 0; j < l.length; j++) { var q = l[j], d = Math.hypot(T.x[q] - x, T.z[q] - z); if (d < m) m = d; }
      }
      return m;
    };
  }

  /* ---------- Qualidade gráfica e cores ----------
     Q.pbr: materiais com reflexo (MeshStandard + mapa do céu); Q.sombras: sombras de verdade; Q.lin: saída em sRGB (cores convertidas). */
  var Q = { nivel: 'alto', pbr: true, sombras: true, mapa: 2048, arvores: 1100, lin: true, env: null };
  function corL(hex) { var c = new THREE.Color(hex); if (Q.lin) c.convertSRGBToLinear(); return c; }
  function vL(c) { return Q.lin ? [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)] : c; }
  function srgb(t) { if (Q.lin) t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }
  function rnd(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* placa de vídeo: sem aceleração (SwiftShader etc.) o 3D roda no processador e fica a 1-2 quadros por segundo */
  var PLACA = null;
  function placaDeVideo() {
    if (PLACA) return PLACA;
    try {
      var c = document.createElement('canvas'), gl = c.getContext('webgl'), d = gl && gl.getExtension('WEBGL_debug_renderer_info'), nome = d ? String(gl.getParameter(d.UNMASKED_RENDERER_WEBGL)) : '';
      var perder = gl && gl.getExtension('WEBGL_lose_context'); if (perder) perder.loseContext();
      PLACA = { nome: nome, soft: /swiftshader|llvmpipe|software|basic render/i.test(nome) };
    } catch (e) { PLACA = { nome: '', soft: false }; }
    return PLACA;
  }
  function definirQualidade(n) {
    Q.nivel = n; Q.pbr = n !== 'leve'; Q.sombras = n !== 'leve'; Q.mapa = n === 'alto' ? 2048 : 1024; Q.arvores = n === 'alto' ? 1000 : n === 'medio' ? 600 : 260; MATS = {}; MAT_MEC = null; MAT_LONGE = null;
  }

  /* ---------- Texturas feitas no navegador ---------- */
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function texturaAsfalto() {
    var c = canvas(512, 512), g = c.getContext('2d'), img = g.createImageData(512, 512), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var p = i / 4, x = p % 512, y = (p / 512) | 0, grao = (Math.random() - 0.5) * 34, mancha = Math.sin(x * 0.021 + Math.sin(y * 0.013) * 3) * 5 + Math.sin(y * 0.031) * 4;
      var v = 104 + grao + mancha + (Math.random() < 0.012 ? 40 : 0);
      d[i] = v; d[i + 1] = v; d[i + 2] = v + 3; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    var t = srgb(new THREE.CanvasTexture(c)); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function texturaGrama(cor1, cor2) {
    var c = canvas(512, 512), g = c.getContext('2d'), img = g.createImageData(512, 512), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var p = i / 4, x = p % 512, faixa = Math.floor(x / 64) % 2, b = faixa ? cor1 : cor2, n = (Math.random() - 0.5) * 26;
      d[i] = b[0] + n; d[i + 1] = b[1] + n * 1.2; d[i + 2] = b[2] + n * 0.6; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    var t = srgb(new THREE.CanvasTexture(c)); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  /* placas de patrocínio (marcas inventadas) */
  var PLACAS = [['ARENA', '#c2185b', '#fff'], ['TURBO COLA', '#1565c0', '#fff'], ['ARENA SPORTS', '#111418', '#e3343c'], ['PNEUS BRAVO', '#f9a825', '#111'],
    ['SOLARIS', '#00838f', '#fff'], ['VELOX', '#c62828', '#fff'], ['GRID 22', '#2e7d32', '#fff'], ['MOTORLAB', '#f2f2f2', '#c2185b']];
  function texturaPlacas() {
    var c = canvas(2048, 128), g = c.getContext('2d');
    PLACAS.forEach(function (p, i) {
      var x = i * 256; g.fillStyle = p[1]; g.fillRect(x, 0, 256, 128);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x, 0, 256, 40);
      g.fillStyle = p[2]; g.font = 'italic 900 ' + (p[0].length > 12 ? 30 : 44) + 'px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(p[0], x + 128, 66, 236);
    });
    var t = srgb(new THREE.CanvasTexture(c)); t.wrapS = THREE.RepeatWrapping; return t;
  }
  function texturaAlambrado() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.strokeStyle = 'rgba(40,44,48,.85)'; g.lineWidth = 2;
    g.beginPath(); for (var k = -64; k < 128; k += 16) { g.moveTo(k, 0); g.lineTo(k + 64, 64); g.moveTo(k + 64, 0); g.lineTo(k, 64); } g.stroke();
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function texturaNumero(n, fundo, letra) {
    var c = canvas(128, 128), g = c.getContext('2d');
    g.fillStyle = fundo; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill();
    g.fillStyle = letra; g.font = 'italic 900 72px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 68);
    return srgb(new THREE.CanvasTexture(c));
  }
  function texturaSombra() {
    var c = canvas(64, 64), g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 4, 32, 32, 32);
    r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  function texturaTorcida() {
    var c = canvas(512, 128), g = c.getContext('2d'); g.fillStyle = '#2b2f35'; g.fillRect(0, 0, 512, 128);
    for (var f = 0; f < 8; f++) { g.fillStyle = f % 2 ? '#3a3f46' : '#33383e'; g.fillRect(0, f * 16, 512, 16); }
    var cores = ['#e3343c', '#f2f2f2', '#2d6cdf', '#f5c518', '#1f9d55', '#ff8a00', '#c2185b', '#111', '#f2d0b0', '#8d5a3c'];
    for (var i = 0; i < 2600; i++) { g.fillStyle = cores[i % cores.length]; var x = Math.random() * 512, y = Math.floor(Math.random() * 8) * 16 + 4; g.fillRect(x, y, 3, 6); g.fillRect(x + 0.5, y - 2.5, 2, 2); }
    var t = srgb(new THREE.CanvasTexture(c)); t.wrapS = THREE.RepeatWrapping; return t;
  }
  function texturaJanelas() {
    var c = canvas(256, 64), g = c.getContext('2d'); g.fillStyle = '#d9dde1'; g.fillRect(0, 0, 256, 64);
    for (var i = 0; i < 16; i++) { var gr = g.createLinearGradient(0, 18, 0, 50); gr.addColorStop(0, '#5f7f99'); gr.addColorStop(1, '#22313f'); g.fillStyle = gr; g.fillRect(i * 16 + 2, 16, 12, 34); }
    var t = srgb(new THREE.CanvasTexture(c)); t.wrapS = THREE.RepeatWrapping; return t;
  }
  function texturaNuvem() {
    var c = canvas(256, 128), g = c.getContext('2d');
    for (var i = 0; i < 18; i++) {
      var x = 40 + Math.random() * 176, y = 50 + Math.random() * 40, r = 18 + Math.random() * 34, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    }
    return srgb(new THREE.CanvasTexture(c));
  }
  function texturaBrilho() {
    var c = canvas(128, 128), g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,240,210,.9)'); r.addColorStop(0.2, 'rgba(255,210,150,.35)'); r.addColorStop(1, 'rgba(255,190,120,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- Geometria ---------- */
  var MATS = {};
  function mat(cor, brilho) {
    var k = cor + '|' + brilho;
    if (!MATS[k]) {
      if (Q.pbr) {
        var r = brilho >= 120 ? 0.06 : brilho >= 80 ? 0.22 : brilho >= 50 ? 0.4 : brilho <= 10 ? 0.92 : 0.75, me = brilho >= 120 ? 0.5 : brilho >= 80 ? 0.25 : 0.05;
        MATS[k] = new THREE.MeshStandardMaterial({ color: corL(cor), roughness: r, metalness: me, envMapIntensity: brilho >= 80 ? 1.1 : 0.6, side: THREE.DoubleSide }); /* dois lados: alguns modelos têm painéis de uma face só */
      } else if (brilho <= 10) MATS[k] = new THREE.MeshLambertMaterial({ color: corL(cor) });
      else MATS[k] = new THREE.MeshPhongMaterial({ color: corL(cor), shininess: brilho || 30, specular: brilho > 50 ? 0x666666 : 0x222222 });
    }
    return MATS[k];
  }
  function matPlano(opc) {
    if (Q.pbr) return new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.92, metalness: 0 }, opc));
    var o = Object.assign({}, opc); delete o.roughness; delete o.metalness; return new THREE.MeshLambertMaterial(o);
  }
  function caixa(x, y, z, sx, sy, sz, m, rz) {
    var g = new THREE.BoxGeometry(sx, sy, sz); if (rz) g.rotateZ(rz); g.translate(x, y, z);
    return new THREE.Mesh(g, m);
  }
  function perfil(pts, larg, m, planta) {
    var s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    var g = new THREE.ExtrudeGeometry(s, { depth: larg, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 1, curveSegments: 4 });
    g.translate(0, 0, -larg / 2);
    if (planta) {
      var p = g.attributes.position;
      for (var j = 0; j < p.count; j++) p.setZ(j, p.getZ(j) * planta(p.getX(j), p.getY(j)));
      g.computeVertexNormals();
    }
    return new THREE.Mesh(g, m);
  }
  function barra(a, b, r, m) {
    var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
    var g = new THREE.CylinderGeometry(r, r, len, 5); g.translate(0, len / 2, 0);
    var me = new THREE.Mesh(g, m); me.position.set(a[0], a[1], a[2]);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / len, dy / len, dz / len));
    return me;
  }
  function roda(r, w, x, z, mAro) {
    var grupo = new THREE.Group();
    var pneu = new THREE.CylinderGeometry(r, r, w, 18); pneu.rotateX(Math.PI / 2);
    grupo.add(new THREE.Mesh(pneu, mat(0x18191b, 8)));
    var aro = new THREE.CylinderGeometry(r * 0.6, r * 0.6, w + 0.012, 12); aro.rotateX(Math.PI / 2);
    grupo.add(new THREE.Mesh(aro, mAro));
    var raio = new THREE.BoxGeometry(r * 1.1, r * 0.12, w + 0.02);
    grupo.add(new THREE.Mesh(raio, mat(0x2a2d31, 20)));
    grupo.position.set(x, r, z);
    return grupo;
  }
  function decal(tex, x, y, z, tam, giroY, deitado) {
    var g = new THREE.PlaneGeometry(tam, tam);
    if (deitado) g.rotateX(-Math.PI / 2);
    if (giroY) g.rotateY(giroY);
    g.translate(x, y, z);
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  }

  /* carroceria arredondada: seções (superelipses) ao longo do carro, da frente (+x) para trás.
     cada chave: [x, meia largura, chão da seção, topo da seção, arredondamento (2 = oval, 4 = quase quadrado), estreita no topo, estreita embaixo] */
  function loft(chaves, m, lados, passos) {
    lados = lados || 22; passos = passos || 3;
    var est = [];
    for (var i = 0; i < chaves.length - 1; i++) for (var k = 0; k < passos; k++) {
      var a = chaves[i], b = chaves[i + 1], t = k / passos, u = t * t * (3 - 2 * t);
      est.push(a.map(function (v, j) { return j === 0 ? lerp(a[0], b[0], t) : lerp(v, b[j] === undefined ? v : b[j], u); }));
    }
    est.push(chaves[chaves.length - 1]);
    var pos = [], idx = [], M = lados;
    est.forEach(function (s) {
      var h = (s[3] - s[2]) / 2, ym = (s[3] + s[2]) / 2, n = s[4] || 3, topo = s[5] || 1, base = s[6] || 1;
      for (var j = 0; j < M; j++) {
        var an = j / M * Math.PI * 2, c = Math.cos(an), sn = Math.sin(an);
        var pz = (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), 2 / n), py = (sn < 0 ? -1 : 1) * Math.pow(Math.abs(sn), 2 / n);
        var f = py > 0 ? lerp(1, topo, py) : lerp(1, base, -py);
        pos.push(s[0], ym + py * h, pz * s[1] * f);
      }
    });
    for (var e = 0; e < est.length - 1; e++) for (var q = 0; q < M; q++) {
      var a0 = e * M + q, b0 = e * M + (q + 1) % M, c0 = (e + 1) * M + q, d0 = (e + 1) * M + (q + 1) % M;
      idx.push(a0, b0, c0, b0, d0, c0);
    }
    /* tampas da frente e de trás */
    [0, est.length - 1].forEach(function (e2, w) {
      var ini = pos.length / 3, s = est[e2], cx = 0, cy = 0;
      for (var j = 0; j < M; j++) { var o = (e2 * M + j) * 3; pos.push(pos[o], pos[o + 1], pos[o + 2]); cy += pos[o + 1]; }
      pos.push(s[0], cy / M, cx);
      for (var j2 = 0; j2 < M; j2++) { var p1 = ini + j2, p2 = ini + (j2 + 1) % M, cc = ini + M; if (w) idx.push(cc, p1, p2); else idx.push(cc, p2, p1); }
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return new THREE.Mesh(g, m);
  }

  /* carro: base = cor do carro, det = cor dos detalhes; devolve { grupo, rodas, frente } */
  function montarCarro(tipo, base, det, numero, capacete) {
    var g = new THREE.Group(), mB = mat(base, 80), mD = mat(det, 60), mP = mat(0x16181b, 25), mAro = mat(0x8d949b, 90), mV = mat(0x0b1118, 140);
    var rodas = [], frente = [], claro = corClara(base), tex = texturaNumero(numero, claro ? '#111' : '#f2f2f2', claro ? '#f2f2f2' : '#111');
    function addRoda(r, w, x, z, dianteira) { var rd = roda(r, w, x, z, mAro); g.add(rd); rodas.push(rd); if (dianteira) frente.push(rd); }
    if (tipo === 'formula') {
      g.add(caixa(-0.35, 0.07, 0, 4.4, 0.04, 1.5, mP));
      /* bico e chassi */
      g.add(loft([[2.82, 0.1, 0.16, 0.25, 2.4], [2.3, 0.18, 0.14, 0.34, 2.6], [1.5, 0.29, 0.12, 0.46, 2.8, 0.8], [0.85, 0.41, 0.12, 0.6, 3, 0.75], [0.25, 0.44, 0.12, 0.65, 3, 0.7],
        [-0.45, 0.42, 0.12, 0.6, 3, 0.7], [-1.3, 0.3, 0.12, 0.52, 3], [-2.25, 0.17, 0.14, 0.44, 2.8], [-2.48, 0.11, 0.16, 0.38, 2.5]], mB));
      /* laterais (sidepods) */
      g.add(loft([[0.62, 0.5, 0.13, 0.26, 4], [0.4, 0.76, 0.12, 0.56, 4, 0.82], [-0.4, 0.75, 0.12, 0.55, 4, 0.82], [-1.2, 0.55, 0.12, 0.43, 3.5], [-1.95, 0.26, 0.13, 0.3, 3]], mB));
      /* tampa do motor e entrada de ar acima do piloto */
      g.add(loft([[-0.15, 0.17, 0.5, 0.92, 2.6], [-0.42, 0.24, 0.5, 1.07, 2.6, 0.55], [-1.0, 0.24, 0.45, 0.94, 2.8, 0.6], [-1.8, 0.17, 0.4, 0.72, 2.8], [-2.35, 0.1, 0.36, 0.55, 2.6]], mD));
      g.add(perfil([[-1.0, 0.92], [-2.3, 0.6], [-2.35, 0.78], [-1.3, 0.98]], 0.02, mD));
      /* asa dianteira (2 planos) e traseira */
      g.add(caixa(2.6, 0.09, 0, 0.46, 0.04, 1.95, mP));
      g.add(caixa(2.5, 0.16, 0, 0.3, 0.03, 1.9, mD, 0.2));
      g.add(caixa(2.58, 0.15, 0.97, 0.55, 0.22, 0.03, mB)); g.add(caixa(2.58, 0.15, -0.97, 0.55, 0.22, 0.03, mB));
      g.add(caixa(-2.55, 0.88, 0, 0.36, 0.05, 0.98, mP));
      g.add(caixa(-2.47, 0.98, 0, 0.22, 0.04, 0.98, mD, -0.25));
      g.add(caixa(-2.55, 0.74, 0.5, 0.64, 0.52, 0.03, mB)); g.add(caixa(-2.55, 0.74, -0.5, 0.64, 0.52, 0.03, mB));
      g.add(caixa(-2.4, 0.56, 0, 0.08, 0.48, 0.05, mP));
      g.add(caixa(-2.6, 0.44, 0, 0.28, 0.04, 0.88, mP));
      /* halo, piloto, retrovisores */
      var halo = new THREE.CatmullRomCurve3([[-0.3, 0.64, -0.32], [-0.08, 0.84, -0.3], [0.18, 0.88, -0.17], [0.3, 0.88, 0], [0.18, 0.88, 0.17], [-0.08, 0.84, 0.3], [-0.3, 0.64, 0.32]].map(function (q) { return new THREE.Vector3(q[0], q[1], q[2]); }));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(halo, 24, 0.034, 6, false), mP));
      g.add(barra([0.5, 0.62, 0], [0.3, 0.88, 0], 0.03, mP));
      var cap = new THREE.SphereGeometry(0.14, 14, 10); cap.translate(-0.02, 0.8, 0);
      g.add(new THREE.Mesh(cap, mat(capacete, 90)));
      var visor = new THREE.SphereGeometry(0.142, 12, 8, -0.7, 1.4, 1.2, 0.5); visor.translate(-0.02, 0.8, 0);
      g.add(new THREE.Mesh(visor, mV));
      g.add(caixa(0.42, 0.68, 0.45, 0.08, 0.05, 0.15, mP)); g.add(caixa(0.42, 0.68, -0.45, 0.08, 0.05, 0.15, mP));
      [[1.75, 0.82], [-1.85, 0.8]].forEach(function (q) {
        [1, -1].forEach(function (s) {
          g.add(barra([q[0] - 0.15, 0.4, 0.3 * s], [q[0], 0.38, (q[1] - 0.12) * s], 0.018, mP));
          g.add(barra([q[0] - 0.05, 0.2, 0.3 * s], [q[0], 0.26, (q[1] - 0.12) * s], 0.018, mP));
        });
      });
      addRoda(0.36, 0.3, 1.75, 0.82, true); addRoda(0.36, 0.3, 1.75, -0.82, true);
      addRoda(0.37, 0.4, -1.85, 0.8); addRoda(0.37, 0.4, -1.85, -0.8);
      g.add(decal(tex, 1.25, 0.47, 0, 0.3, 0, true));
      g.add(decal(tex, -0.45, 0.38, 0.75, 0.28, 0)); g.add(decal(tex, -0.45, 0.38, -0.75, 0.28, Math.PI));
      g.add(decal(tex, -2.55, 0.74, 0.52, 0.34, 0)); g.add(decal(tex, -2.55, 0.74, -0.52, 0.34, Math.PI));
    } else if (tipo === 'proto') {
      g.add(caixa(0, 0.07, 0, 4.9, 0.04, 1.8, mP));
      g.add(loft([[2.58, 0.86, 0.12, 0.3, 3.2, 0.9], [2.25, 0.98, 0.1, 0.5, 3.6, 0.9, 0.82], [1.55, 1.0, 0.1, 0.72, 3.8, 0.85, 0.78], [0.9, 0.96, 0.1, 0.56, 3.8, 0.9, 0.8],
        [0.0, 0.98, 0.1, 0.6, 3.8, 0.9, 0.82], [-0.9, 0.99, 0.1, 0.7, 3.8, 0.88, 0.8], [-1.55, 1.0, 0.1, 0.84, 3.8, 0.85, 0.78], [-2.3, 0.98, 0.12, 0.84, 3.6, 0.9], [-2.55, 0.92, 0.3, 0.8, 3]], mB, 24));
      /* cabine (bolha de vidro) e teto */
      g.add(loft([[1.05, 0.3, 0.5, 0.62, 2.4], [0.55, 0.52, 0.52, 0.98, 2.4, 0.72], [-0.2, 0.56, 0.52, 1.1, 2.6, 0.7], [-0.9, 0.5, 0.55, 1.0, 2.6, 0.72], [-1.45, 0.3, 0.6, 0.8, 2.4]], mV));
      g.add(loft([[0.3, 0.18, 1.02, 1.06, 2], [-0.2, 0.26, 1.08, 1.12, 2], [-0.8, 0.22, 1.0, 1.04, 2]], mB, 12));
      g.add(perfil([[-0.7, 1.0], [-2.3, 0.86], [-2.38, 1.12], [-1.4, 1.1]], 0.03, mD));
      g.add(caixa(-2.38, 1.08, 0, 0.36, 0.06, 1.9, mP));
      g.add(caixa(-2.32, 0.9, 0.95, 0.7, 0.4, 0.04, mD)); g.add(caixa(-2.32, 0.9, -0.95, 0.7, 0.4, 0.04, mD));
      g.add(caixa(2.45, 0.1, 0, 0.5, 0.04, 1.9, mP));
      var luz = new THREE.MeshBasicMaterial({ color: 0xfff6d8 });
      g.add(caixa(2.2, 0.47, 0.66, 0.24, 0.05, 0.3, luz)); g.add(caixa(2.2, 0.47, -0.66, 0.24, 0.05, 0.3, luz));
      g.add(caixa(-2.56, 0.66, 0, 0.04, 0.05, 1.6, new THREE.MeshBasicMaterial({ color: 0xff2a2a })));
      addRoda(0.36, 0.34, 1.55, 0.82, true); addRoda(0.36, 0.34, 1.55, -0.82, true);
      addRoda(0.37, 0.36, -1.55, 0.82); addRoda(0.37, 0.36, -1.55, -0.82);
      g.add(decal(tex, -0.3, 0.42, 0.97, 0.42, 0)); g.add(decal(tex, -0.3, 0.42, -0.97, 0.42, Math.PI));
      g.add(decal(tex, 1.75, 0.74, 0.52, 0.34, 0, true)); g.add(decal(tex, -1.95, 0.88, 0.45, 0.4, 0, true));
    } else {
      g.add(caixa(0, 0.1, 0, 4.3, 0.04, 1.7, mP));
      /* carroceria do 911: frente curta, faróis em cima dos para-lamas, traseira em rampa */
      g.add(loft([[2.34, 0.8, 0.2, 0.5, 3, 0.9], [2.16, 0.92, 0.14, 0.62, 3.4, 0.88, 0.82], [1.6, 0.96, 0.13, 0.72, 3.6, 0.86, 0.8], [0.8, 0.96, 0.13, 0.79, 3.6, 0.84, 0.82],
        [0.0, 0.95, 0.13, 0.82, 3.6, 0.84, 0.84], [-0.9, 0.98, 0.13, 0.85, 3.6, 0.84, 0.82], [-1.6, 0.99, 0.13, 0.84, 3.6, 0.84, 0.8], [-2.15, 0.94, 0.16, 0.76, 3.4, 0.86], [-2.35, 0.86, 0.26, 0.64, 3]], mB, 24));
      /* teto e vidros */
      g.add(loft([[0.85, 0.62, 0.72, 0.78, 2.6], [0.3, 0.68, 0.74, 1.08, 2.8, 0.82], [-0.25, 0.66, 0.76, 1.28, 2.8, 0.8], [-0.8, 0.64, 0.78, 1.26, 2.8, 0.8], [-1.4, 0.6, 0.8, 1.06, 2.6, 0.82], [-1.95, 0.5, 0.78, 0.86, 2.4]], mV));
      g.add(loft([[0.05, 0.42, 1.2, 1.25, 2], [-0.45, 0.52, 1.27, 1.32, 2], [-1.0, 0.48, 1.2, 1.26, 2], [-1.35, 0.4, 1.06, 1.12, 2]], mB, 12));
      g.add(caixa(-2.12, 1.24, 0, 0.36, 0.05, 1.75, mP));
      g.add(caixa(-2.05, 1.07, 0.42, 0.12, 0.32, 0.04, mP)); g.add(caixa(-2.05, 1.07, -0.42, 0.12, 0.32, 0.04, mP));
      g.add(caixa(-2.12, 1.17, 0.86, 0.4, 0.2, 0.03, mD)); g.add(caixa(-2.12, 1.17, -0.86, 0.4, 0.2, 0.03, mD));
      var farol = new THREE.SphereGeometry(0.12, 12, 8), mf = new THREE.MeshBasicMaterial({ color: 0xfff6d8 });
      [0.62, -0.62].forEach(function (z) { var f = farol.clone(); f.scale(1, 0.8, 1); f.translate(1.98, 0.66, z); g.add(new THREE.Mesh(f, mf)); });
      g.add(caixa(-2.33, 0.68, 0, 0.04, 0.06, 1.55, new THREE.MeshBasicMaterial({ color: 0xff2a2a })));
      g.add(caixa(2.36, 0.2, 0, 0.3, 0.05, 1.75, mP));
      addRoda(0.34, 0.3, 1.3, 0.83, true); addRoda(0.34, 0.3, 1.3, -0.83, true);
      addRoda(0.35, 0.34, -1.25, 0.83); addRoda(0.35, 0.34, -1.25, -0.83);
      g.add(decal(tex, -0.45, 1.33, 0, 0.5, 0, true));
      g.add(decal(tex, 0.15, 0.5, 0.97, 0.42, 0)); g.add(decal(tex, 0.15, 0.5, -0.97, 0.42, Math.PI));
    }
    var sombra = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.8), new THREE.MeshBasicMaterial({ map: SOMBRA, transparent: true, depthWrite: false, opacity: Q.sombras ? 0.55 : 1 }));
    sombra.geometry.rotateX(-Math.PI / 2); sombra.position.y = 0.02; g.add(sombra);
    return { grupo: g, rodas: rodas, frente: frente };
  }
  var SOMBRA = null;

  /* ---------- Carros 3D de verdade ----------
     Modelos .glb preparados por _ferramentas/modelos-3d/otimizar-carro.mjs: sem pintura nem logos, peças separadas por tipo
     (c = pintura, f = detalhe, carb, metal, aro, escuro, pneu, vidro, luz), 4 rodas e uma versão leve para carros longe.
     Todos do Sketchfab, licença CC BY 4.0 (créditos em CREDITOS, embaixo do menu). O jogo pinta com as próprias cores.
     Se o modelo não carregar, o jogo usa o carro desenhado (montarCarro). */
  var URL_GLTF = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
  var MODELOS = {
    f1: { esc: 0.94 /* 2026: 3,40 m entre eixos, ~1,95 m de largura */, url: 'assets/modelos/jogo-f1.glb?v=353', painel: 'f1w', volante: 'assets/modelos/jogo-volante-f1.glb?v=353', cabine: 'assets/modelos/jogo-f1-cabine.glb?v=353', espelhos: [], olho: [-0.34, 1.08, 0], olharDesce: 1.05, capaceteCab: [-0.06, 0.84, 0.135], olhoPiloto: [0.44, -0.2, -0.1] /* Cockpit: frente, altura, olhar menos para baixo */, capacete: [-0.12, 0.79, 0.135], numeros: [[1.35, 3, 0, 0, -1, 0, 0.3], [-0.85, 0.72, 3, 0, 0, -1, 0.3], [-0.85, 0.72, -3, 0, 0, 1, 0.3]] },
    peugeot: { url: 'assets/modelos/jogo-peugeot.glb?v=353', painel: 'peugeot', cabine: 'assets/modelos/jogo-peugeot-cabine.glb?v=353', olhoAj: [0.15, -0.06], tomTex: 0.45, tomInt: 0.5, espelhos: [[0.6, 0.915, 0.06, 0.26, 0.045, 'C']], numeros: [[1.6, 3, 0, 0, -1, 0, 0.42], [-0.3, 0.6, 3, 0, 0, -1, 0.46], [-0.3, 0.6, -3, 0, 0, 1, 0.46]] },
    gt3: { url: 'assets/modelos/jogo-gt3.glb?v=353', cabine: 'assets/modelos/jogo-gt3-cabine.glb?v=353', espelhos: [[0.55, 0.86, -0.95, 0.15, 0.085, 'E'], [0.24, 0.945, -0.03, 0.2, 0.05, 'C']], numeros: [[1.45, 3, 0, 0, -1, 0, 0.42], [0.05, 0.55, 3, 0, 0, -1, 0.46], [0.05, 0.55, -3, 0, 0, 1, 0.46]] },
    mercedes: { url: 'assets/modelos/jogo-mercedes.glb?v=353', cabine: 'assets/modelos/jogo-mercedes-cabine.glb?v=353', painel: 'mercedes-gt3', espelhos: [[0.22, 1.06, 0.12, 0.22, 0.055, 'C'], [0.1, 0.88, -1.0, 0.15, 0.085, 'E'], [0.032, 0.826, -0.108, 0.15, 0.088, 'C', [-0.94, 0.21, -0.27]]] /* o último é o monitor da câmera de ré */, numeros: [[1.6, 3, 0, 0, -1, 0, 0.42], [0.05, 0.6, 3, 0, 0, -1, 0.46], [0.05, 0.6, -3, 0, 0, 1, 0.46]] },
    porsche: { url: 'assets/modelos/jogo-porsche.glb?v=353', painel: 'porsche', cabine: 'assets/modelos/jogo-porsche-cabine.glb?v=353', espelhos: [[0.40, 0.84, -0.82, 0.15, 0.085, 'E'], [0.25, 0.985, -0.025, 0.25, 0.065, 'C']], numeros: [[1.5, 3, 0, 0, -1, 0, 0.42], [0.15, 0.55, 3, 0, 0, -1, 0.46], [0.15, 0.55, -3, 0, 0, 1, 0.46]] }
  };
  /* carros de cada classe (os adversários se revezam; quem joga escolhe no menu) */
  var VARIANTES = { f1: ['f1'], hyper: ['peugeot'], gt3: ['mercedes', 'gt3'], porsche: ['porsche'] };
  MODELOS.sc = { url: 'assets/modelos/jogo-safety-car.glb?v=353' }; /* safety car */
  var NOME_CARRO = { f1: 'F1 2026', peugeot: 'Peugeot 9X8', gt3: 'McLaren 720S', mercedes: 'Mercedes-AMG', porsche: 'Porsche 911' };
  var MOLDES = {}; /* modelo -> molde pronto, ou 'falhou' */
  function carregarModelos(classes, pronto, progresso) {
    function info(k) { return MODELOS[k.replace(/^cab:/, '')]; }
    function url(k) { var i = info(k); return i && (/^cab:/.test(k) ? i.cabine : i.url); }
    var falta = classes.filter(function (k) { return url(k) && !MOLDES[k]; }), feito = false, carregado = {};
    if (!falta.length) return pronto();
    function fim() { if (!feito) { feito = true; clearTimeout(limite); pronto(); } }
    var limite = setTimeout(function () { falta.forEach(function (k) { if (!MOLDES[k]) MOLDES[k] = 'falhou'; }); fim(); }, 25000);
    function ler() {
      var n = falta.length;
      falta.forEach(function (k) {
        new THREE.GLTFLoader().load(url(k), function (gl) {
          try { MOLDES[k] = k === 'sc' ? gl.scene : /^cab:/.test(k) ? prepararCabine(gl.scene) : prepararMolde(gl.scene, info(k)); } catch (e) { MOLDES[k] = 'falhou'; }
          var iv = info(k), M = MOLDES[k];
          if (/^cab:/.test(k) && iv.volante && M !== 'falhou') new THREE.GLTFLoader().load(iv.volante, function (g2) { g2.scene.traverse(function (o) { if (o.isMesh && !M.volModelo) M.volModelo = o; }); if (!--n) fim(); }, null, function () { if (!--n) fim(); });
          else if (!--n) fim();
        }, function (ev) {
          if (!ev.total || !progresso) return;
          carregado[k] = ev.loaded / ev.total;
          progresso(Math.round(falta.reduce(function (s, q) { return s + (carregado[q] || 0); }, 0) / falta.length * 100));
        }, function () { MOLDES[k] = 'falhou'; if (!--n) fim(); });
      });
    }
    if (THREE.GLTFLoader) ler();
    else {
      var sc = document.createElement('script'); sc.src = URL_GLTF; sc.crossOrigin = 'anonymous'; sc.onload = ler;
      sc.onerror = function () { falta.forEach(function (k) { MOLDES[k] = 'falhou'; }); fim(); };
      document.head.appendChild(sc);
    }
  }
  /* separa as peças do modelo: carroceria e rodas (cada roda com o centro no eixo, para girar), perto e longe;
     acha na superfície os lugares do número (raios de cima e dos lados) */
  function prepararMolde(cena, info) {
    var niveis = { P: { corpo: [], rodas: {} }, L: { corpo: [], rodas: {} } }, raio = new THREE.Raycaster(), alvos = [];
    cena.updateMatrixWorld(true);
    cena.traverse(function (n) {
      if (!n.isMesh) return;
      var nome = n.name, nv = niveis[/_longe$/.test(nome) ? 'L' : 'P'], base = nome.replace(/_longe$/, ''), r = /^roda(..)_(.+)$/.exec(base);
      var geo = n.geometry.clone(); geo.applyMatrix4(n.matrixWorld);
      var peca = { geo: geo, parte: r ? r[2] : base };
      if (r) (nv.rodas[r[1]] = nv.rodas[r[1]] || []).push(peca);
      else { nv.corpo.push(peca); if (nv === niveis.P && /^(c|f|carb)$/.test(peca.parte)) alvos.push(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))); }
    });
    ['P', 'L'].forEach(function (k) {
      var lista = [];
      Object.keys(niveis[k].rodas).forEach(function (canto) {
        var pecas = niveis[k].rodas[canto], cx = new THREE.Box3();
        pecas.forEach(function (p) { p.geo.computeBoundingBox(); cx.union(p.geo.boundingBox); });
        var c = cx.getCenter(new THREE.Vector3());
        pecas.forEach(function (p) { p.geo.translate(-c.x, -c.y, -c.z); });
        lista.push({ pos: c, frente: canto.charAt(0) === 'F', pecas: pecas });
      });
      niveis[k].rodas = lista;
    });
    var numeros = [];
    (info.numeros || []).forEach(function (q) {
      raio.set(new THREE.Vector3(q[0], q[1], q[2]), new THREE.Vector3(q[3], q[4], q[5]).normalize());
      var hit = raio.intersectObjects(alvos)[0];
      if (!hit) return;
      var nrm = hit.face.normal.clone(); if (nrm.dot(raio.ray.direction) > 0) nrm.negate();
      numeros.push({ p: hit.point.clone().addScaledVector(nrm, 0.012), n: nrm, tam: q[6] });
    });
    return { P: niveis.P, L: niveis.L, numeros: numeros, capacete: info.capacete };
  }
  var MATS_CARRO = {};
  function matPintura(cor) {
    var k = 'pint' + cor + Q.pbr;
    if (!MATS_CARRO[k]) {
      var ouro = cor === COR_OURO;
      MATS_CARRO[k] = Q.pbr ? new THREE.MeshStandardMaterial({ color: corL(cor), roughness: ouro ? 0.3 : 0.3, metalness: ouro ? 0.9 : 0.15, envMapIntensity: ouro ? 1 : 1.15, side: THREE.DoubleSide })
        : new THREE.MeshPhongMaterial({ color: corL(cor), shininess: 90, specular: ouro ? 0x886622 : 0x555555 });
    }
    return MATS_CARRO[k];
  }
  function matParte(parte, base, det) {
    switch (parte) {
      case 'c': return matPintura(base);
      case 'f': return matPintura(det);
      case 'carb': return mat(0x1c1d20, 60);
      case 'metal': return mat(0x9aa0a6, 120);
      case 'aro': return mat(0x34383d, 90);
      case 'pneu': return mat(0x18191b, 8);
      case 'vidro': return mat(0x0b1118, 140);
      case 'luz': return MATS_CARRO.luz || (MATS_CARRO.luz = new THREE.MeshBasicMaterial({ color: 0xff2a2a }));
      case 'farol': return MATS_CARRO.farol || (MATS_CARRO.farol = new THREE.MeshBasicMaterial({ color: 0xfff3d6 }));
      default: return mat(0x222427, 30);
    }
  }
  var MAT_LONGE = null, MAT_SOMBRA = null;
  /* geometria da sombra do carro: o modelo de longe numa peça só (só posição) */
  function sombraDe(molde) {
    if (molde.sombra) return molde.sombra;
    var pos = [];
    function add(g, t) { var p = g.attributes.position, ix = g.index, k = escalaAttr(p), n = ix ? ix.count : p.count; for (var q = 0; q < n; q++) { var i = ix ? ix.getX(q) : q; pos.push(p.getX(i) * k + (t ? t.x : 0), p.getY(i) * k + (t ? t.y : 0), p.getZ(i) * k + (t ? t.z : 0)); } }
    molde.L.corpo.forEach(function (p) { if (!/^(vidro|luz|farol)$/.test(p.parte)) add(p.geo); });
    molde.L.rodas.forEach(function (r) { r.pecas.forEach(function (p) { if (p.parte === 'pneu') add(p.geo, r.pos); }); });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return (molde.sombra = g);
  }
  function carroLonge(molde, base, det) {
    var cache = molde.longe || (molde.longe = {}), k = base + '|' + det;
    if (cache[k]) return cache[k];
    function corDe(parte) { var c = matParte(parte, base, det).color, e = Q.lin ? 1 / 2.2 : 1; return [Math.pow(c.r, e), Math.pow(c.g, e), Math.pow(c.b, e)]; }
    /* 3 pedaços: pintura (cor do carro), detalhe (segunda cor) e o resto (cores nos vértices) — a pintura usa o mesmo material de perto (com reflexo) */
    var grupos = { c: [], f: [], resto: [] };
    molde.L.corpo.forEach(function (p) { (grupos[p.parte] || grupos.resto).push({ g: p.geo, cor: corDe(p.parte) }); });
    molde.L.rodas.forEach(function (r) { r.pecas.forEach(function (p) { var g = p.geo.clone(); g.translate(r.pos.x, r.pos.y, r.pos.z); grupos.resto.push({ g: g, cor: corDe(p.parte) }); }); });
    return (cache[k] = { c: grupos.c.length ? juntar(grupos.c) : null, f: grupos.f.length ? juntar(grupos.f) : null, resto: juntar(grupos.resto) });
  }
  function montarCarroModelo(molde, base, det, numero, capacete) {
    var g = new THREE.Group(), lod = new THREE.Group(), rodas = [], frente = [], claro = base === COR_OURO || corClara(base), longe = null;
    function nivel(nv, perto) {
      var grupo = new THREE.Group();
      nv.corpo.forEach(function (p) { var m = new THREE.Mesh(p.geo, matParte(p.parte, base, det)); grupo.add(m); }); /* a sombra vem de uma peça única (sombraDe) */
      nv.rodas.forEach(function (r) {
        var rg = new THREE.Group(); rg.position.copy(r.pos);
        r.pecas.forEach(function (p) { var m = new THREE.Mesh(p.geo, matParte(p.parte, base, det)); rg.add(m); });
        grupo.add(rg); rodas.push(rg); if (r.frente) frente.push(rg);
      });
      return grupo;
    }
    var perto = nivel(Q.nivel === 'leve' ? molde.L : molde.P, true);
    if (molde.capacete) {
      var cp = molde.capacete, cap = new THREE.Mesh(new THREE.SphereGeometry(cp[2], 14, 10), mat(capacete, 90));
      cap.position.set(cp[0], cp[1], 0); perto.add(cap);
      var visor = new THREE.Mesh(new THREE.SphereGeometry(cp[2] * 1.015, 12, 8, -0.7, 1.4, 1.2, 0.5), mat(0x0b1118, 140));
      visor.position.copy(cap.position); perto.add(visor);
    }
    var tex = texturaNumero(numero, claro ? '#111' : '#f2f2f2', claro ? '#f2f2f2' : '#111'), numerosLonge = [];
    var mNum = new THREE.MeshBasicMaterial({ map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
    molde.numeros.forEach(function (q) {
      var d = new THREE.Mesh(new THREE.PlaneGeometry(q.tam, q.tam), mNum);
      d.position.copy(q.p); d.lookAt(q.p.clone().add(q.n));
      /* número em pé (deitado em cima: frente do número para a frente do carro) */
      if (Math.abs(q.n.y) > 0.7) d.rotateZ(-Math.PI / 2);
      perto.add(d);
      if (Q.nivel !== 'leve') numerosLonge.push(d);
    });
    lod.add(perto);
    if (Q.nivel !== 'leve') {
      if (!MAT_LONGE) MAT_LONGE = Q.pbr ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
      var GL = carroLonge(molde, base, det); longe = new THREE.Group();
      if (GL.c) longe.add(new THREE.Mesh(GL.c, matPintura(base)));
      if (GL.f) longe.add(new THREE.Mesh(GL.f, matPintura(det)));
      longe.add(new THREE.Mesh(GL.resto, MAT_LONGE));
      if (numerosLonge.length) { var gn = numerosLonge.map(function (d) { d.updateMatrix(); var q = d.geometry.clone(); q.applyMatrix4(d.matrix); return q.toNonIndexed(); }), pn = [], un = [];
        gn.forEach(function (q) { pn.push.apply(pn, q.attributes.position.array); un.push.apply(un, q.attributes.uv.array); });
        var gnum = new THREE.BufferGeometry(); gnum.setAttribute('position', new THREE.Float32BufferAttribute(pn, 3)); gnum.setAttribute('uv', new THREE.Float32BufferAttribute(un, 2));
        longe.add(new THREE.Mesh(gnum, numerosLonge[0].material)); } /* os números de longe numa peça só */
      longe.visible = false; lod.add(longe);
    }
    g.add(lod); /* perto e longe ficam num grupo próprio (o cockpit esconde/mostra os filhos do carro) */
    var sombra = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.8), new THREE.MeshBasicMaterial({ map: SOMBRA, transparent: true, depthWrite: false, opacity: Q.sombras ? 0.55 : 1 }));
    sombra.geometry.rotateX(-Math.PI / 2); sombra.position.y = 0.02; g.add(sombra);
    return { grupo: g, rodas: rodas, frente: frente, perto: perto, longe: longe };
  }
  /* ---------- Cockpit: câmera em primeira pessoa nos carros fechados (Hypercar, GT3, Porsche Cup) ----------
     Modelos jogo-<classe>-cabine.glb (feitos por otimizar-carro.mjs ... cabine): o carro inteiro com o interior,
     o volante separado (extras: eixo e raio) e a posição dos olhos do piloto (extras da cena: olho).
     As mãos e os braços são desenhados aqui; os retrovisores mostram o que uma câmera virada para trás vê. */
  function prepararCabine(cena) {
    var pecas = [], volante = null;
    cena.updateMatrixWorld(true);
    cena.traverse(function (n) {
      if (!n.isMesh) return;
      if (n.name === 'volante') {
        volante = { geo: n.geometry, pos: n.position.clone(), eixo: new THREE.Vector3().fromArray(n.userData.eixo || [-1, 0.2, 0]).normalize(), raio: n.userData.raio || 0.15 };
      }
      else { var geo = n.geometry.clone(); geo.applyMatrix4(n.matrixWorld); pecas.push({ geo: geo, parte: n.userData.parte || n.name.replace(/^roda.._/, ''), tex: n.userData.textura ? n.material : null, mat: n.userData.mat || '' }); }
    });
    var o = cena.userData.olho || [-0.3, 0.95, -0.3];
    return { pecas: pecas, volante: volante, olho: new THREE.Vector3(o[0], o[1], o[2]) };
  }
  function matCabine(parte, base, det, cores, tom) {
    tom = parte === 'volante' || parte === 'tela' ? 1 : (tom || 0.8); /* tom: escurece o interior claro demais de alguns modelos */
    var k = 'cab|' + parte + '|' + base + '|' + det + '|' + Q.pbr + '|' + !!cores + '|' + tom;
    if (MATS_CARRO[k]) return MATS_CARRO[k];
    var m, tabela = { int: [0x26282c, 20], banco: [0x131416, 10], rede: [0x0f0f10, 10], cinto: [0xa3231a, 30], metal: [0x404348, 90], carb: [0x1c1d20, 60], volante: [0x1a1b1e, 40] };
    if (cores && parte === 'tela') m = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
    else if (cores) m = Q.pbr ? new THREE.MeshStandardMaterial({ vertexColors: true, color: new THREE.Color(tom, tom, tom), roughness: parte === 'volante' ? 0.55 : 0.75, metalness: 0.1, side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ vertexColors: true, color: new THREE.Color(tom, tom, tom), side: THREE.DoubleSide });
    else if (parte === 'vidro') m = new THREE.MeshBasicMaterial({ color: 0xc6d6e2, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
    else if (parte === 'tela') m = new THREE.MeshBasicMaterial({ color: 0x0f3346 });
    else if (parte === 'c' || parte === 'f') { m = matPintura(parte === 'c' ? base : det).clone(); m.side = THREE.FrontSide; } /* pintura só por fora; por dentro aparece o forro escuro (carbono) */
    else { m = (tabela[parte] ? mat(tabela[parte][0], tabela[parte][1]) : matParte(parte, base, det)).clone(); m.side = THREE.DoubleSide; }
    return (MATS_CARRO[k] = m);
  }
  function matTextura(t, parte, tom) {
    tom = /^(int|banco|rede)$/.test(parte) ? (tom || 0.75) : 1; /* cabine fechada fica na sombra do teto: interior mais escuro */
    var k = 'tex|' + t.uuid + '|' + Q.pbr + '|' + tom;
    if (MATS_CARRO[k]) return MATS_CARRO[k];
    var o = { map: t.map, color: (t.color ? t.color.clone() : new THREE.Color(1, 1, 1)).multiplyScalar(tom), side: THREE.DoubleSide, alphaTest: t.alphaTest || 0 };
    var m = Q.pbr ? new THREE.MeshStandardMaterial(Object.assign(o, { roughness: parte === 'tela' ? 0.2 : 0.72, metalness: 0.05, envMapIntensity: 0.55 })) : new THREE.MeshLambertMaterial(o);
    return (MATS_CARRO[k] = m);
  }
  /* painel do Mercedes-AMG GT3: a imagem original do painel com os números da corrida por cima.
     A imagem do modelo é guardada de cabeça para baixo (como as texturas do glTF), então o texto é escrito invertido. */
  /* Telas originais de cada carro. tam = tamanho de referência das coordenadas; inv = imagem guardada de cabeça para baixo (o texto é escrito invertido).
     Itens: ['t', dado, x, y, l, a, cx, cy, fonte, cor, fundo] texto; ['b', dado, x, y, l, a, cor] barra que enche de baixo para cima;
            ['q', dado, x, y, l, a] quadrado colorido pelo desgaste do pneu; ['r', x, y, l, a, cor] retângulo (tapa logos); ['box'] faixa do limite do box (Mercedes). */
  var PAINEIS = {
    'mercedes-gt3': { mat: /Cockpit_Screen/, tam: [1024, 1024], inv: true, fundo: '#000', itens: [
      ['t', 'tempo', 86, 318, 288, 77, 230, 362, 64], ['t', 'marcha', 420, 322, 182, 203, 511, 437, 190], ['t', 'gas', 655, 318, 283, 77, 795, 362, 82],
      ['t', 'oleo', 87, 452, 132, 70, 152, 493, 58], ['t', 'cambio', 242, 452, 132, 70, 307, 493, 58], ['t', '=4', 655, 452, 78, 70, 694, 493, 58], ['t', '=3', 757, 452, 78, 70, 795, 493, 58], ['t', '=1', 860, 452, 78, 70, 898, 493, 58],
      ['t', 'agua', 87, 584, 132, 68, 152, 628, 58], ['t', 'bat', 242, 584, 132, 68, 307, 628, 58], ['t', 'ultima', 398, 586, 232, 104, 513, 637, 50], ['t', 'vel', 655, 584, 283, 68, 795, 630, 80], ['box']] },
    porsche: { mat: /^DISPLAY$/, tam: [1024, 512], inv: true, fundo: '#0a0a0a', itens: [
      ['r', 4, 60, 64, 76, '#0a0a0a'],
      ['t', 'marcha', 401, 196, 220, 184, 511, 290, 150], ['t', 'vel', 401, 394, 220, 46, 511, 418, 38], ['t', 'tempo', 637, 289, 278, 64, 776, 322, 40],
      ['t', 'ultima', 781, 197, 131, 56, 846, 226, 24], ['t', 'volta', 733, 407, 66, 25, 766, 420, 21], ['t', 'gas', 300, 198, 84, 36, 342, 216, 22],
      ['q', 'pneu', 401, 73, 106, 50], ['q', 'pneu', 517, 73, 106, 50], ['q', 'pneu', 401, 131, 106, 27], ['q', 'pneu', 517, 131, 106, 27]] },
    peugeot: { mat: /^boulon_68$/, tam: [2000, 2000], inv: false, fundo: '#000', itens: [
      ['t', 'marcha', 527, 242, 346, 416, 700, 455, 300], ['t', 'vel', 890, 440, 432, 218, 1106, 552, 150], ['t', 'volta', 403, 286, 110, 66, 458, 321, 56],
      ['t', 'gas', 890, 745, 432, 270, 1106, 880, 130], ['b', 'giro', 1342, 378, 51, 640, '#3ddc5a'],
      ['q', 'pneu', 542, 742, 154, 106], ['q', 'pneu', 705, 742, 154, 106], ['q', 'pneu', 542, 857, 154, 158], ['q', 'pneu', 705, 857, 154, 158]] },
    /* plano: [x, y, largura, altura, z] da tela no volante W11 (medidas do modelo, largura total = 1) */
    f1w: { mat: /^$/, plano: [0.005, -0.116, 0.346, 0.222, 0.016], tam: [512, 328], inv: false, fundo: '#101214', itens: [
      ['r', 0, 0, 512, 328, '#020304'], ['h', 'giro', 8, 6, 496, 20],
      ['l', 'KM/H', 94, 40, 18, '#8a929c'], ['t', 'vel', 12, 52, 164, 76, 94, 92, 64],
      ['t', 'marcha', 190, 36, 132, 168, 256, 122, 150, '#fff', '#16191c'],
      ['l', 'DELTA', 418, 40, 18, '#8a929c'], ['t', 'delta', 336, 52, 164, 76, 418, 92, 46, '#3ddc5a'],
      ['l', 'VOLTA ATUAL', 94, 146, 16, '#8a929c'], ['t', 'tempo', 12, 158, 164, 46, 94, 182, 32],
      ['l', 'ÚLTIMA', 418, 146, 16, '#8a929c'], ['t', 'ultima', 336, 158, 164, 46, 418, 182, 30],
      ['q', 'pneu', 196, 214, 58, 46], ['q', 'pneu', 258, 214, 58, 46], ['q', 'pneu', 196, 264, 58, 46], ['q', 'pneu', 258, 264, 58, 46],
      ['l', 'VOLTA', 52, 226, 16, '#8a929c'], ['t', 'volta', 12, 238, 80, 44, 52, 260, 32], ['l', 'POS', 136, 226, 16, '#8a929c'], ['t', 'pos', 96, 238, 80, 44, 136, 260, 32],
      ['l', 'COMB', 376, 226, 16, '#8a929c'], ['t', 'gas', 336, 238, 80, 44, 376, 260, 30], ['l', 'BATERIA', 460, 226, 16, '#8a929c'], ['b', 'carga', 434, 240, 52, 76, '#ff8a00'],
      ['h', 'acel', 12, 296, 164, 20, '#5ce048']] },
    f1: { mat: /^gp21_LCD$/, tam: [1024, 1024], inv: false, fundo: '#000', itens: [
      ['t', 'marcha', 426, 311, 171, 151, 511, 390, 140, '#fff', '#222322'], ['t', 'vel', 140, 408, 200, 64, 245, 441, 56], ['t', 'gas', 140, 550, 130, 46, 205, 575, 38],
      ['t', 'delta', 708, 344, 197, 81, 806, 386, 52, '#3ddc5a', '#000'], ['t', 'tempo', 712, 478, 196, 48, 810, 503, 40], ['t', 'ultima', 712, 560, 196, 46, 810, 584, 36],
      ['t', 'volta', 730, 650, 74, 44, 768, 673, 34], ['t', 'pos', 808, 650, 86, 44, 850, 673, 34],
      ['b', 'acel', 78, 271, 49, 195, '#5ce048'], ['b', 'carga', 920, 348, 17, 412, '#ff8a00'],
      ['q', 'pneu', 391, 496, 74, 74], ['q', 'pneu', 556, 496, 74, 74], ['q', 'pneu', 391, 604, 74, 74], ['q', 'pneu', 556, 604, 74, 74]] }
  };
  function criarPainel(mapa, nome) {
    var E = PAINEIS[nome], img = mapa && mapa.image, w = img ? img.width : E.tam[0], h = img ? img.height : E.tam[1], red = Math.min(1, 512 / Math.max(w, h));
    w = Math.round(w * red); h = Math.round(h * red); /* no máximo 512 px: atualizar 10x por segundo uma tela de 2048 px travava o jogo */
    var c = canvas(w, h), g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
    tex.flipY = !!E.plano; /* tela própria num plano: textura normal; telas do modelo (glTF): sem virar */ if (Q.lin) tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    if (mapa) { tex.wrapS = mapa.wrapS; tex.wrapT = mapa.wrapT; } /* algumas telas usam coordenadas fora de 0..1 */
    return { c: c, g: g, tex: tex, fundo: img, E: E, k: [w / E.tam[0], h / E.tam[1]], ult: '' };
  }
  function desenharPainel(P, d) {
    var chave = JSON.stringify(d); if (chave === P.ult) return; P.ult = chave;
    var g = P.g, E = P.E;
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (P.fundo) g.drawImage(P.fundo, 0, 0, P.c.width, P.c.height); else { g.fillStyle = '#000'; g.fillRect(0, 0, P.c.width, P.c.height); }
    g.setTransform(P.k[0], 0, 0, P.k[1], 0, 0);
    function texto(txt, cx, cy, fonte, cor, larg) {
      g.save(); g.translate(cx, cy); if (E.inv) g.scale(1, -1); g.fillStyle = cor || '#fff'; g.font = 'bold ' + fonte + 'px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, 0, 0, larg); g.restore();
    }
    function corPneu(p) { return p > 60 ? '#22d84a' : p > 30 ? '#f5c518' : '#ff3b30'; }
    E.itens.forEach(function (it) {
      if (it[0] === 'r') { g.fillStyle = it[5]; g.fillRect(it[1], it[2], it[3], it[4]); return; }
      if (it[0] === 'l') { texto(it[1], it[2], it[3], it[4], it[5]); return; }
      if (it[0] === 'h') {
        var hv = Math.max(0, Math.min(1, d[it[1]] || 0)), nl = it[1] === 'giro' ? 15 : 0;
        g.fillStyle = '#15181b'; g.fillRect(it[2], it[3], it[4], it[5]);
        if (!nl) { g.fillStyle = it[6] || '#5ce048'; g.fillRect(it[2], it[3], it[4] * hv, it[5]); return; }
        for (var li = 0; li < nl; li++) { var lw = it[4] / nl; g.fillStyle = li / nl < hv ? (li < 5 ? '#22d84a' : li < 10 ? '#ff2a1f' : '#3a6bff') : '#24282c'; g.beginPath(); g.arc(it[2] + lw * (li + 0.5), it[3] + it[5] / 2, it[5] * 0.42, 0, 7); g.fill(); }
        return;
      }
      if (it[0] === 'box') {
        if (!d.box) { g.fillStyle = '#000'; g.fillRect(70, 712, 884, 92); return; }
        g.fillStyle = '#0000c8'; g.fillRect(76, 719, 870, 77); texto('PITSPEED ACTIVE    ' + d.vel + 'km/h', 511, 758, 58, '#fff', 850); return;
      }
      var x = it[2], y = it[3], l = it[4], a = it[5];
      if (it[0] === 'q') { g.fillStyle = corPneu(d.pneu); g.fillRect(x + 2, y + 2, l - 4, a - 4); if (l > 60) texto(d.pneu + '%', x + l / 2, y + a / 2, Math.min(a * 0.5, 40), '#000', l - 8); return; }
      if (it[0] === 'b') {
        var v = Math.max(0, Math.min(1, d[it[1]] || 0)); g.fillStyle = '#000'; g.fillRect(x, y, l, a); g.fillStyle = it[6];
        if (E.inv) g.fillRect(x, y, l, a * v); else g.fillRect(x, y + a * (1 - v), l, a * v); return;
      }
      var val = it[1].charAt(0) === '=' ? it[1].slice(1) : d[it[1]];
      g.fillStyle = it[10] || E.fundo; g.fillRect(x, y, l, a);
      var cor = it[9] || (it[1] === 'marcha' && d.marcha === 'N' ? '#3ddc5a' : it[1] === 'gas' && d.gasPouca ? '#ff3b30' : '#fff');
      texto(String(val), it[6], it[7], it[8], cor, l - 8);
    });
    g.setTransform(1, 0, 0, 1, 0, 0);
    P.tex.needsUpdate = true;
  }
  /* luzes de troca: cada bolinha é um grupo de vértices; acendem da ponta para o meio com a rotação */
  function criarLeds(geo) {
    var p = geo.attributes.position, n = p.count, zs = [];
    for (var i = 0; i < n; i++) zs.push(p.getZ(i));
    var ord = zs.slice().sort(function (a, b) { return a - b; }), grupos = [], lim = 0.004;
    ord.forEach(function (z) { if (!grupos.length || z - grupos[grupos.length - 1] > lim) grupos.push(z); });
    var idx = zs.map(function (z) { var b = 0; for (var k = 0; k < grupos.length; k++) if (Math.abs(grupos[k] - z) <= Math.abs(grupos[b] - z)) b = k; return b; });
    var cores = new Float32Array(n * 3).fill(0.12); geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    return { geo: geo, idx: idx, n: grupos.length, ult: -1 };
  }
  function acenderLeds(L, rpm, pisca) {
    var acesas = pisca ? (Date.now() / 90 | 0) % 2 ? L.n : 0 : Math.round(rpm * L.n), chave = acesas;
    if (chave === L.ult) return; L.ult = chave;
    var cor = L.geo.attributes.color, a = cor.array, meio = (L.n - 1) / 2;
    for (var i = 0; i < L.idx.length; i++) {
      var k = L.idx[i], ordem = Math.abs(k - meio), acesa = (meio - ordem) < acesas / 2 + 0.01, c = acesa ? (ordem > meio * 0.6 ? [0.15, 1, 0.3] : ordem > meio * 0.25 ? [1, 0.15, 0.1] : [0.3, 0.5, 1]) : [0.08, 0.08, 0.09];
      a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2];
    }
    cor.needsUpdate = true;
  }
  function tirarVolanteVelho(geo, c, eixo, cima, larg) {
    if (geo.userData.semVolante) return; geo.userData.semVolante = true;
    var p = geo.attributes.position, idx = geo.index.array, novo = [], d = new THREE.Vector3(), lado = new THREE.Vector3().crossVectors(cima, eixo);
    for (var t = 0; t < idx.length; t += 3) {
      d.set(0, 0, 0); for (var k = 0; k < 3; k++) d.x += p.getX(idx[t + k]) / 3, d.y += p.getY(idx[t + k]) / 3, d.z += p.getZ(idx[t + k]) / 3;
      d.sub(c);
      if (Math.abs(d.dot(eixo)) < 0.09 && Math.abs(d.dot(lado)) < larg * 0.6 && Math.abs(d.dot(cima)) < larg * 0.36) continue;
      novo.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    geo.setIndex(novo);
  }
  var CORES_SC = [[/tyre/i, 0x151515, 5], [/wheel/i, 0x2c3035, 80, 0.6], [/disc/i, 0x6b6f75, 60, 0.6], [/glass|window/i, 0x0e1419, 120, 0.2],
    [/refmina/i, 0xa9afb6, 120, 0.8], [/grl|grille|carbon/i, 0x111214, 30], [/lgt/i, 0xbfc5cc, 120, 0.3], [/^(H1|H3)Mtl|Meshpart/i, 0x202326, 40]];
  function montarSafetyCar(cena) {
    var g = cena.clone(true), giro = [];
    g.traverse(function (o) {
      if (!o.isMesh) return;
      var n = o.material.name || '', m;
      if (/Headlights|Drls/i.test(n)) m = new THREE.MeshBasicMaterial({ color: 0xf4f7ff });
      else if (/Brakes|RearRls/i.test(n)) m = new THREE.MeshBasicMaterial({ color: 0xc8141a });
      else if (/Indicators/i.test(n)) m = new THREE.MeshBasicMaterial({ color: 0xff9a1a });
      else if (/^(H1Mtl|Meshpart6Mtl)$/.test(n)) { m = new THREE.MeshBasicMaterial({ color: 0x3a2a00 }); giro.push(m); } /* giroflex no teto */
      else if (/paint|yesdrt/i.test(n)) m = matPintura(0x0b4f3e); /* verde, a mesma pintura dos carros */
      else { var r = CORES_SC.filter(function (q) { return q[0].test(n); })[0] || [0, 0x1c1d20, 25]; m = mat(r[1], r[2]).clone(); m.side = THREE.DoubleSide; }
      o.material = m;
    });
    var grupo = new THREE.Group(); grupo.add(g); grupo.visible = false;
    if (Q.sombras) { /* sombra: todas as peças numa só */
      var ps = []; g.updateMatrixWorld(true); g.traverse(function (o) { if (!o.isMesh) return; var p = o.geometry.attributes.position, ix = o.geometry.index, v = new THREE.Vector3(), n = ix ? ix.count : p.count; for (var q = 0; q < n; q++) { v.fromBufferAttribute(p, ix ? ix.getX(q) : q).applyMatrix4(o.matrixWorld); ps.push(v.x, v.y, v.z); } });
      var gs = new THREE.BufferGeometry(); gs.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3));
      var px = new THREE.Mesh(gs, new THREE.MeshBasicMaterial()); px.castShadow = true; px.layers.set(1); grupo.add(px);
    }
    return { grupo: grupo, giro: giro };
  }
  function montarCabine(molde, base, det, capa, info) {
    var g = new THREE.Group(), forro = mat(0x1d1f22, 15).clone(); forro.side = THREE.BackSide;
    var painel = null, leds = null, volExtra = [];
    molde.pecas.forEach(function (p) {
      var mt;
      if (p.tex && /^tela/.test(p.parte) && info.painel && PAINEIS[info.painel].mat.test(p.mat)) { painel = criarPainel(p.tex.map, info.painel); mt = new THREE.MeshBasicMaterial({ map: painel.tex, toneMapped: false, side: THREE.DoubleSide }); }
      else if (p.tex && p.parte === 'leds') { leds = criarLeds(p.geo); mt = new THREE.MeshBasicMaterial({ map: p.tex.map, vertexColors: true, toneMapped: false }); }
      else if (p.tex) mt = matTextura(p.tex, p.parte, info.tomTex);
      else mt = matCabine(p.parte, base, det, !!p.geo.attributes.color, info.tomInt);
      var m = new THREE.Mesh(p.geo, mt); m.name = p.parte;
      if (p.parte === 'telavol') volExtra.push(m); else g.add(m); /* a tela do volante gira junto com ele */
      if (p.parte === 'c' || p.parte === 'f') g.add(new THREE.Mesh(p.geo, forro));
    });
    /* a cabine não faz nem recebe sombra: a sombra do carro no chão vem da peça única (e de tão perto a sombra fica quadriculada) */
    /* volante: gira em volta do próprio eixo; as mãos vão junto */
    var V = molde.volante, pivo = new THREE.Group(), giro = new THREE.Group(), maos = [], h = new THREE.Vector3(0, 1, 0).cross(V.eixo).normalize();
    pivo.position.copy(V.pos); pivo.add(giro); g.add(pivo);
    var aro = new THREE.Mesh(V.geo, matCabine('volante', base, det, !!V.geo.attributes.color));
    if (molde.volModelo) {
      /* volante próprio (largura 1, frente +Z): X = direita do piloto, Z = eixo do volante (para o piloto) */
      if (!V.geo.boundingBox) V.geo.computeBoundingBox();
      var bb = V.geo.boundingBox, larg = (bb.max.z - bb.min.z) * 1.02, cima = new THREE.Vector3().crossVectors(V.eixo, new THREE.Vector3(0, 0, 1)).normalize();
      var wm = molde.volModelo, mo = wm.material, nv = new THREE.Mesh(wm.geometry, Q.pbr ? new THREE.MeshStandardMaterial({ map: mo.map, normalMap: mo.normalMap, emissiveMap: mo.map, emissive: 0x3a3a3a, roughness: 0.6, metalness: 0, envMapIntensity: 0.35 }) /* botões e escritas legíveis, como iluminados */ : new THREE.MeshLambertMaterial({ map: mo.map })), base3 = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), cima.clone().negate(), V.eixo); /* modelo vem de cabeça para baixo: tela em cima, botões giratórios embaixo */
      nv.matrixAutoUpdate = false; nv.matrix.copy(base3).multiply(new THREE.Matrix4().makeScale(larg, larg, larg)); giro.add(nv);
      if (info.painel && PAINEIS[info.painel].plano) {
        var E0 = PAINEIS[info.painel], tl = new THREE.Mesh(new THREE.PlaneGeometry(E0.plano[2], E0.plano[3]), null);
        painel = criarPainel(null, info.painel); tl.material = new THREE.MeshBasicMaterial({ map: painel.tex, toneMapped: false });
        tl.position.set(E0.plano[0], E0.plano[1], E0.plano[4]); tl.rotation.z = Math.PI; nv.add(tl); /* texto em pé */
      }
      volExtra = [];
      /* tira do resto da cabine as peças do volante antigo (botões, manoplas, tela) */
      g.children.forEach(function (m) { if (m.isMesh && m.geometry.index) tirarVolanteVelho(m.geometry, V.pos, V.eixo, cima, larg); });
    } else giro.add(aro);
    volExtra.forEach(function (m) { m.geometry = m.geometry.clone(); m.geometry.translate(-V.pos.x, -V.pos.y, -V.pos.z); giro.add(m); });
    /* retrovisores: quadros virados para o piloto com um pedaço da imagem da câmera de trás (espelhada) */
    var espelhos = [];
    (info.espelhos || []).forEach(function (q) {
      var faixa = q[5] === 'C' ? [0.25, 0.75] : q[5] === 'E' ? [0.62, 1] : [0, 0.38];
      var geo = new THREE.PlaneGeometry(q[3], q[4]), uv = geo.attributes.uv;
      for (var i = 0; i < uv.count; i++) uv.setX(i, faixa[1] + (faixa[0] - faixa[1]) * uv.getX(i));
      var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x8c96a0 })), pos = new THREE.Vector3(q[0], q[1], q[2]);
      if (q[6]) { var nn = new THREE.Vector3().fromArray(q[6]).normalize(); pos.addScaledVector(nn, 0.004); m.position.copy(pos); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(pos.clone().add(nn), pos, new THREE.Vector3(0, 1, 0))); } /* tela presa no painel, virada para onde ela aponta */
      else { m.position.copy(pos); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(molde.olho, pos, new THREE.Vector3(0, 1, 0))); } /* virado para o piloto, sem inclinar */
      var moldura = new THREE.Mesh(new THREE.PlaneGeometry(q[3] + 0.014, q[4] + 0.014), mat(0x0d0e10, 20)); moldura.position.set(0, 0, -0.004); m.add(moldura);
      g.add(m); espelhos.push(m);
    });
    var capG = null;
    if (info.capaceteCab) {
      /* capacete visto de trás (câmera atrás do piloto): casco na cor do piloto, faixa branca e viseira escura */
      var cc = info.capaceteCab; capG = new THREE.Group(); var casco = new THREE.Mesh(new THREE.SphereGeometry(cc[2], 24, 16), mat(capa, 110));
      casco.scale.set(1.08, 0.96, 0.94); capG.add(casco);
      var faixa = new THREE.Mesh(new THREE.TorusGeometry(cc[2] * 0.985, cc[2] * 0.07, 6, 32, Math.PI), mat(0xf2f2f2, 90)); faixa.rotation.y = 0; faixa.scale.set(1.08, 0.96, 0.94); capG.add(faixa);
      var viseira = new THREE.Mesh(new THREE.SphereGeometry(cc[2] * 1.01, 16, 10, Math.PI - 0.8, 1.6, 1.15, 0.55), mat(0x0b1118, 140)); capG.add(viseira);
      capG.position.set(cc[0], cc[1], cc[3] || 0); g.add(capG);
      if (Q.sombras) capG.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
    }
    var cab = { olhoPiloto: info.olhoPiloto, capG: capG, painel: painel, leds: leds, grupo: g, giro: giro, eixo: V.eixo, centro: V.pos, olho: (info.olho ? new THREE.Vector3().fromArray(info.olho) : molde.olho.clone()).add(new THREE.Vector3(info.olhoAj ? info.olhoAj[0] : 0, info.olhoAj ? info.olhoAj[1] : 0, 0)), maos: maos, espelhos: espelhos, desce: info.olharDesce || 0.85 };
    virarVolante(cab, 0);
    return cab;
  }
  function osso(m, a, b) {
    var d = b.clone().sub(a), l = d.length();
    m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(1, l, 1);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }
  /* gira o volante (ang em radianos; positivo = anti-horário visto pelo piloto) e leva punhos e braços junto */
  function virarVolante(cab, ang) {
    cab.giro.quaternion.setFromAxisAngle(cab.eixo, ang);
    cab.maos.forEach(function (m) {
      var mao = m.p.clone().applyAxisAngle(cab.eixo, ang).add(cab.centro);
      var pulso = m.p.clone().addScaledVector(cab.eixo, 0.07).applyAxisAngle(cab.eixo, ang).add(cab.centro);
      var cotovelo = cab.centro.clone().add(new THREE.Vector3(-0.34, -0.2, m.lado * 0.3)); /* o braço de cima fica fora da tela */
      osso(m.punho, mao.clone().addScaledVector(cab.eixo, 0.03), pulso);
      osso(m.antebraco, pulso, cotovelo);
    });
  }
  /* cores do carro do jogador: [pintura, detalhe, nome] */
  /* ícones dos botões do celular (traço branco, como nos jogos de corrida) */
  function svgI(d, extra) { return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + (extra || '') + '</svg>'; }
  var ICONES = {
    cam: svgI('<rect x="6" y="14" width="26" height="20" rx="4"/><path d="M32 21l10-6v18l-10-6z"/>'),
    engrenagem: svgI('<circle cx="24" cy="24" r="6"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/><circle cx="24" cy="24" r="12.5"/>'),
    raio: svgI('<path d="M27 5L12 27h11l-3 16 16-23H25z"/>'),
    box: svgI('<path d="M9 40V8"/><path d="M9 9h26l-5 7 5 7H9"/>'),
    /* volante de corrida: aro, raios, cubo e a marca do centro (vermelha) */
    esq: svgI('<path d="M29 10L15 24l14 14" stroke-width="5"/>'),
    dir: svgI('<path d="M19 10l14 14-14 14" stroke-width="5"/>'),
    volante: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="41" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="9"/>' +
      '<path d="M12 54h26M62 54h26M50 62v27" stroke="rgba(255,255,255,.85)" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="54" r="12" fill="rgba(20,22,26,.85)" stroke="rgba(255,255,255,.85)" stroke-width="4"/>' +
      '<rect x="46" y="5" width="8" height="12" rx="2" fill="#e3343c"/></svg>',
    sobe: svgI('<path d="M12 30l12-12 12 12" stroke-width="4.5"/>'),
    desce: svgI('<path d="M12 18l12 12 12-12" stroke-width="4.5"/>'),
    freio: '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M10 14q0-6 6-6h28q6 0 6 6v20q0 6-6 6H16q-6 0-6-6z" fill="rgba(255,255,255,.18)" stroke="#fff" stroke-width="3"/>' +
      '<path d="M17 17h26M17 24h26M17 31h26" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><path d="M30 40v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
    acel: '<svg viewBox="0 0 60 80" aria-hidden="true"><path d="M16 10q0-6 6-6h16q6 0 6 6v46q0 6-6 6H22q-6 0-6-6z" fill="rgba(255,255,255,.18)" stroke="#fff" stroke-width="3"/>' +
      '<path d="M22 14h16M22 22h16M22 30h16M22 38h16M22 46h16M22 54h16" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><path d="M30 62v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>'
  };
  var CORES_CARRO = { preto: [0x141414, 0xe3343c, 'Preto'], branco: [0xf2f2f2, 0xe3343c, 'Branco'], ouro: [null, 0x141414, 'Dourado'], vermelho: [0xc8102e, 0xf2f2f2, 'Vermelho'],
    rosa: [0xff4fa3, 0x141414, 'Rosa'], azul: [0x1f5fd6, 0xf2f2f2, 'Azul'], verde: [0x0f9d58, 0xf2f2f2, 'Verde'], laranja: [0xff7a00, 0x141414, 'Laranja'], roxo: [0x6a3fc9, 0xf2f2f2, 'Roxo'] };
  /* cores dos rivais: [pintura, detalhe] */
  var PALETA_IA = [[0x141414, 0xf2f2f2], [0xf2f2f2, 0x141414], [0x1f5fd6, 0xf2f2f2], [0xc8102e, 0xf2f2f2], [0x0f9d58, 0x141414], [0xff7a00, 0x141414],
    [0xff4fa3, 0x141414], [0x5a5f66, 0xf2f2f2], [0xf5c518, 0x141414], [0x6a3fc9, 0xf2f2f2], [0x00a7c8, 0x141414], [0x8a1538, 0xf2f2f2]];
  function corClara(h) { var r = (h >> 16) & 255, g = (h >> 8) & 255, b = h & 255; return 0.299 * r + 0.587 * g + 0.114 * b > 150; } /* número escuro em carro claro */
  var COR_OURO = 0xb8862b;
  var CREDITOS = '<p class="jg-credito">Pistas e arredores: © colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> (ODbL); relevo: <a href=\"https://registry.opendata.aws/terrain-tiles/\" target=\"_blank\" rel=\"noopener\">Terrain Tiles</a> (Mapzen, na AWS) com dados SRTM e GMTED (USGS), EU-DEM (Copernicus), Geoscience Australia e outros.</p><p class="jg-credito">Carros 3D do Sketchfab, licença <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>, modificados (pintura, logos, patrocínios e interior removidos; peças simplificadas). F1: <a href="https://sketchfab.com/3d-models/2026-aston-martin-amr26-be9fbc27a1fd4e97ad4302f5aa5125d5" target="_blank" rel="noopener">"2026 Aston Martin AMR26", de Dave Love</a> · Hypercar: <a href="https://sketchfab.com/3d-models/peugeot-9x8-hypercar-f77715deedb14cda8afe96a83c4daf31" target="_blank" rel="noopener">"Peugeot 9x8 Hypercar", de kilianhoffmann13</a> · GT3: <a href="https://sketchfab.com/3d-models/2021-mclaren-720s-gt3x-fd16600b1e594ceea5cec2470ab560c4" target="_blank" rel="noopener">"2021 McLaren 720S GT3X", de Ddiaz Design</a> · GT3: <a href="https://sketchfab.com/3d-models/mercedes-amg-gt3-evo-2020-wwwvecarzcom-39e77243109f4e5cb7134b6f31c8f619" target="_blank" rel="noopener">"Mercedes AMG GT3 Evo 2020", de vecarz</a> · Porsche Cup: <a href="https://sketchfab.com/3d-models/2024-porsche-992-gt3-r-b76c9b2ae2d548c3869426eac4ab8a19" target="_blank" rel="noopener">"2024 Porsche 992 GT3 R", de Dave Love</a>. Volante da F1: <a href="https://sketchfab.com/3d-models/f1-steering-wheel-w11-97e6f81365714a78a784c4bc92903b7b" target="_blank" rel="noopener">"F1 Steering Wheel W11", de pawel7557</a> (licença Sketchfab Standard). Safety car: <a href="https://sketchfab.com/3d-models/roblox-f1-aston-martin-medic-car-2022-58139ff6ee6e414fbc9431d0d7bb917b" target="_blank" rel="noopener">"Roblox F1 Aston Martin Medic Car 2022", de Ajb_B00m</a> (CC BY 4.0, pintado pelo jogo).</p>';


  /* fita ao longo da pista entre os afastamentos a e b (metros; + = direita; podem ser funções do ponto), na altura y.
     uv: [metros por repetição ao longo, repetições na largura] */
  function fita(T, a, b, y, cor, incluir, uv) {
    var N = T.N, pos = new Float32Array((N + 1) * 6), col = new Float32Array((N + 1) * 6), uvs = uv ? new Float32Array((N + 1) * 4) : null, idx = [];
    var fixo = typeof cor === 'function' ? null : vL(cor);
    for (var i = 0; i <= N; i++) {
      var j = i % N, px = T.x[j], pz = T.z[j], nx = T.nx[j], nz = T.nz[j], o = i * 6, A = typeof a === 'function' ? a(j) : a, B = typeof b === 'function' ? b(j) : b;
      var yy = y + T.y[j]; pos[o] = px + nx * A; pos[o + 1] = yy; pos[o + 2] = pz + nz * A; pos[o + 3] = px + nx * B; pos[o + 4] = yy; pos[o + 5] = pz + nz * B;
      var c = fixo || vL(cor(j));
      col[o] = col[o + 3] = c[0]; col[o + 1] = col[o + 4] = c[1]; col[o + 2] = col[o + 5] = c[2];
      if (uvs) { var v = i * T.ds / uv[0]; uvs[i * 4] = 0; uvs[i * 4 + 1] = v; uvs[i * 4 + 2] = uv[1]; uvs[i * 4 + 3] = v; }
      if (i < N && (!incluir || incluir(j))) { var k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (uvs) g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  /* parede vertical ao longo da pista no afastamento w, de y0 a y1 (só onde ok(j)); uv ao longo em metros por repetição */
  function parede(T, w, y0, y1, ok, metros) {
    var N = T.N, pos = new Float32Array((N + 1) * 6), uvs = new Float32Array((N + 1) * 4), idx = [];
    for (var i = 0; i <= N; i++) {
      var j = i % N, x = T.x[j] + T.nx[j] * w, z = T.z[j] + T.nz[j] * w, o = i * 6, u = i * T.ds / metros;
      pos[o] = x; pos[o + 1] = y0 + T.y[j]; pos[o + 2] = z; pos[o + 3] = x; pos[o + 4] = y1 + T.y[j]; pos[o + 5] = z;
      uvs[i * 4] = u; uvs[i * 4 + 1] = 0; uvs[i * 4 + 2] = u; uvs[i * 4 + 3] = 1;
      if (i < N && ok(j)) { var k = i * 2; if (w > 0) idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); else idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  /* junta várias geometrias numa só, com cor por vértice (para as árvores) */
  /* atributos comprimidos do glTF (inteiros "normalizados"): getX devolve o número cru (ex.: normal de -127 a 127), aqui vira -1 a 1 */
  function escalaAttr(a) { if (!a || !a.normalized) return 1; var r = a.array; return r instanceof Int8Array ? 1 / 127 : r instanceof Uint8Array ? 1 / 255 : r instanceof Int16Array ? 1 / 32767 : r instanceof Uint16Array ? 1 / 65535 : 1; }
  function juntar(lista) {
    var pos = [], nor = [], col = [];
    lista.forEach(function (it) {
      /* lê pelo índice direto (toNonIndexed do three r128 estraga atributos intercalados, como os dos modelos comprimidos: o carro de longe saía em pedaços) */
      var g = it.g, ix = g.index, p = g.attributes.position, n = g.attributes.normal, kp = escalaAttr(p), kn = escalaAttr(n), tot = ix ? ix.count : p.count;
      if (!n) { g.computeVertexNormals(); n = g.attributes.normal; kn = 1; }
      for (var q = 0; q < tot; q++) {
        var i = ix ? ix.getX(q) : q;
        var x = p.getX(i) * kp, y = p.getY(i) * kp, z = p.getZ(i) * kp, c = vL(typeof it.cor === 'function' ? it.cor(x, y, z) : it.cor);
        var nx = n.getX(i) * kn, ny = n.getY(i) * kn, nz = n.getZ(i) * kn, nl = Math.hypot(nx, ny, nz) || 1;
        pos.push(x, y, z); nor.push(nx / nl, ny / nl, nz / nl); col.push(c[0], c[1], c[2]);
      }
    });
    var r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); r.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return r;
  }
  function arvoreFolhas() {
    var partes = [{ g: (function () { var t = new THREE.CylinderGeometry(0.22, 0.38, 4.2, 7); t.translate(0, 2.1, 0); return t; })(), cor: [0.36, 0.26, 0.18] }];
    [[0, 5.2, 0, 2.5], [1.4, 4.5, 0.7, 1.9], [-1.2, 4.7, -0.8, 2.0], [0.3, 6.6, -0.2, 1.7], [-0.6, 5.6, 1.2, 1.6]].forEach(function (b, k) {
      var s = new THREE.IcosahedronGeometry(b[3] * 1.08, 0), p = s.attributes.position;
      for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), f = 1 + (rnd(x * 3.1 + y * 7.7 + z * 5.3 + k) - 0.5) * 0.3; p.setXYZ(i, x * f, y * f * 0.9, z * f); }
      s.computeVertexNormals(); s.translate(b[0], b[1], b[2]);
      partes.push({ g: s, cor: function (x, y, z) { var v = 0.75 + rnd(x * 1.7 + z * 2.3 + y) * 0.35, sombra = Math.min(1, 0.55 + (y - 3) * 0.12); return [0.2 * v * sombra, 0.42 * v * sombra, 0.16 * v * sombra]; } });
    });
    return juntar(partes);
  }
  function palmeira() {
    var curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 3, 0), new THREE.Vector3(0.9, 6, 0), new THREE.Vector3(1.6, 8.6, 0)]);
    var partes = [{ g: new THREE.TubeGeometry(curva, 10, 0.22, 6, false), cor: function (x, y) { var v = 0.85 + (Math.floor(y * 3) % 2) * 0.12; return [0.45 * v, 0.36 * v, 0.25 * v]; } }];
    for (var f = 0; f < 9; f++) {
      var fr = new THREE.PlaneGeometry(0.9, 4.6, 1, 6), p = fr.attributes.position;
      for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i) + 2.3, t = y / 4.6; p.setXYZ(i, x * (1 - t * 0.75), 0, y); p.setY(i, -t * t * 1.9 + t * 0.6); }
      fr.computeVertexNormals(); fr.rotateY(f / 9 * Math.PI * 2); fr.translate(1.6, 8.6, 0);
      partes.push({ g: fr, cor: function (x, y, z) { var v = 0.8 + rnd(x + z * 3) * 0.3; return [0.22 * v, 0.45 * v, 0.14 * v]; } });
    }
    return juntar(partes);
  }

  /* ---------- Pistas de verdade ----------
     Dados gerados por _ferramentas/pistas-jogo.js: traçado (OpenStreetMap), relevo (Copernicus DEM via Open-Meteo)
     e arredores (prédios, água, mata, areia e marcos do OpenStreetMap). O jogo desenha tudo em estilo cartoon. */
  var PISTAS = {
    'interlagos': 'Interlagos', 'silverstone': 'Silverstone', 'suzuka': 'Suzuka', 'spa': 'Spa-Francorchamps', 'monza': 'Monza', 'zandvoort': 'Zandvoort',
    'albert-park': 'Albert Park', 'lusail': 'Lusail', 'xangai': 'Xangai', 'barcelona': 'Barcelona-Catalunha',
    'le-mans': 'Le Mans', 'hockenheim': 'Hockenheim', 'laguna-seca': 'Laguna Seca', 'road-atlanta': 'Road Atlanta', 'bathurst': 'Bathurst', 'portimao': 'Portimão', 'sebring': 'Sebring'
  };
  var LISTA_PISTAS = {
    f1: ['interlagos', 'silverstone', 'suzuka', 'spa', 'monza', 'zandvoort', 'albert-park', 'lusail', 'xangai', 'barcelona'],
    wec: ['le-mans', 'spa', 'hockenheim', 'laguna-seca', 'road-atlanta', 'bathurst', 'portimao', 'sebring']
  };
  LISTA_PISTAS.porsche = LISTA_PISTAS.f1.concat(LISTA_PISTAS.wec.filter(function (p) { return LISTA_PISTAS.f1.indexOf(p) < 0; }));
  /* clima de cada lugar: cor da grama, tipos de árvore, morros no horizonte */
  var TEMAS = {
    'interlagos': { grama: [90, 140, 62], arv: { folha: 0.7, palma: 0.3 }, montes: 0.5 },
    'silverstone': { grama: [96, 148, 66], arv: { folha: 1 }, montes: 0.2 },
    'suzuka': { grama: [86, 138, 60], arv: { folha: 0.6, pinheiro: 0.4 }, montes: 1 },
    'spa': { grama: [80, 132, 58], arv: { pinheiro: 0.7, folha: 0.3 }, montes: 1 },
    'monza': { grama: [90, 142, 62], arv: { folha: 1 }, montes: 0.4 },
    'zandvoort': { grama: [156, 160, 104], arv: { arbusto: 0.7, pinheiro: 0.3 }, montes: 0, mar: true },
    'albert-park': { grama: [98, 148, 66], arv: { folha: 0.75, palma: 0.25 }, montes: 0.2 },
    'lusail': { grama: [206, 180, 132], deserto: true, arv: { palma: 1 }, montes: 0.1 },
    'xangai': { grama: [92, 142, 64], arv: { folha: 1 }, montes: 0 },
    'barcelona': { grama: [132, 142, 78], arv: { pinheiro: 0.6, folha: 0.4 }, montes: 1 },
    'le-mans': { grama: [98, 148, 66], arv: { folha: 0.6, pinheiro: 0.4 }, montes: 0.2 },
    'hockenheim': { grama: [92, 142, 62], arv: { pinheiro: 0.8, folha: 0.2 }, montes: 0.4 },
    'laguna-seca': { grama: [178, 162, 98], arv: { folha: 1 }, montes: 1.2 },
    'road-atlanta': { grama: [96, 144, 64], arv: { pinheiro: 0.6, folha: 0.4 }, montes: 0.5 },
    'bathurst': { grama: [122, 144, 76], arv: { folha: 1 }, montes: 0.8 },
    'portimao': { grama: [142, 142, 86], arv: { pinheiro: 0.5, folha: 0.5 }, montes: 0.8 },
    'sebring': { grama: [104, 152, 70], arv: { palma: 0.5, folha: 0.5 }, montes: 0 }
  };
  var DADOS_PISTA = {};
  function carregarPista(id, pronto, falha) {
    if (DADOS_PISTA[id]) return pronto();
    fetch('assets/dados/pistas/' + id + '.json?v=353').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { DADOS_PISTA[id] = d; pronto(); }).catch(falha);
  }

  /* traçado real em metros (já com a largada no ponto 0) + altura da pista em cada ponto */
  function montarPista(id) {
    var D = DADOS_PISTA[id], pts = D.pista.map(function (q) { return [q[0] / 10, q[1] / 10]; });
    function reamostrar(xs, zs, n) {
      var c = [0], t = 0, m = xs.length;
      for (var q = 1; q <= m; q++) { t += Math.hypot(xs[q % m] - xs[q - 1], zs[q % m] - zs[q - 1]); c.push(t); }
      var ox = new Float32Array(n), oz = new Float32Array(n), seg = 0;
      for (var r = 0; r < n; r++) {
        var alvo = r / n * t;
        while (c[seg + 1] < alvo) seg++;
        var f = (alvo - c[seg]) / ((c[seg + 1] - c[seg]) || 1), s0 = seg % m, s1 = (seg + 1) % m;
        ox[r] = lerp(xs[s0], xs[s1], f); oz[r] = lerp(zs[s0], zs[s1], f);
      }
      return { x: ox, z: oz, L: t };
    }
    var N = Math.round(D.comp / 2), R = reamostrar(pts.map(function (q) { return q[0]; }), pts.map(function (q) { return q[1]; }), N);
    /* suaviza um pouco as quinas do mapa */
    for (var pass = 0; pass < 2; pass++) {
      var sx2 = new Float32Array(N), sz2 = new Float32Array(N), W = 3;
      for (var u = 0; u < N; u++) { var sx = 0, sz = 0; for (var w = -W; w <= W; w++) { var id2 = (u + w + N) % N; sx += R.x[id2]; sz += R.z[id2]; } sx2[u] = sx / (2 * W + 1); sz2[u] = sz / (2 * W + 1); }
      R.x = sx2; R.z = sz2;
    }
    R = reamostrar(Array.prototype.slice.call(R.x), Array.prototype.slice.call(R.z), N);
    var X = R.x, Z = R.z, L = R.L, ds = L / N;
    var mx = Infinity, Mx = -Infinity, mz = Infinity, Mz = -Infinity;
    for (var c = 0; c < N; c++) { mx = Math.min(mx, X[c]); Mx = Math.max(Mx, X[c]); mz = Math.min(mz, Z[c]); Mz = Math.max(Mz, Z[c]); }
    var tx = new Float32Array(N), tz = new Float32Array(N), nxx = new Float32Array(N), nzz = new Float32Array(N), ang = new Float32Array(N);
    for (var g = 0; g < N; g++) {
      var ax = X[(g + 2) % N] - X[(g - 2 + N) % N], az = Z[(g + 2) % N] - Z[(g - 2 + N) % N], l = Math.hypot(ax, az) || 1;
      tx[g] = ax / l; tz[g] = az / l; nxx[g] = -tz[g]; nzz[g] = tx[g]; ang[g] = Math.atan2(tz[g], tx[g]);
    }
    var kr = new Float32Array(N), ks = new Float32Array(N), KW = 6;
    for (var h = 0; h < N; h++) { var d = ang[(h + 3) % N] - ang[(h - 3 + N) % N]; d = ((d + 3 * Math.PI) % (2 * Math.PI)) - Math.PI; kr[h] = d / (6 * ds); }
    for (var v = 0; v < N; v++) { var sm = 0; for (var o = -KW; o <= KW; o++) sm += kr[(v + o + N) % N]; ks[v] = sm / (2 * KW + 1); }
    var A = Math.round(36 / ds), lin = new Float32Array(N), MAXL = LARG_PISTA / 2 - 1.8;
    for (var y = 0; y < N; y++) lin[y] = limitar(520 * (ks[y] - 0.5 * ks[(y + A) % N] - 0.5 * ks[(y - A + N) % N]), -MAXL, MAXL);
    var lin2 = new Float32Array(N);
    for (var y2 = 0; y2 < N; y2++) { var sl = 0; for (var o2 = -10; o2 <= 10; o2++) sl += lin[(y2 + o2 + N) % N]; lin2[y2] = sl / 21; }
    /* altura: perfil do relevo (a cada ~10 m) interpolado e suavizado (o mapa de relevo tem ruído) */
    var alt = new Float32Array(N), na = D.alt.length;
    for (var a2 = 0; a2 < N; a2++) { var f = a2 / N * na, i0 = Math.floor(f), t2 = f - i0; alt[a2] = lerp(D.alt[i0 % na], D.alt[(i0 + 1) % na], t2) / 10; }
    for (var p2 = 0; p2 < 3; p2++) {
      var ys = new Float32Array(N), WA = Math.round(24 / ds);
      for (var b = 0; b < N; b++) { var sa = 0; for (var oa = -WA; oa <= WA; oa++) sa += alt[(b + oa + N) % N]; ys[b] = sa / (2 * WA + 1); }
      alt = ys;
    }
    /* pontes: onde a pista passa por cima dela mesma (Suzuka), o trecho de cima sobe uns 8 m (rampa de ~150 m de cada lado) */
    var ponte = new Float32Array(N), cruz = [];
    for (var pa = 0; pa < N; pa += 2) for (var pb = pa + 2; pb < N; pb += 2) {
      if (Math.min(pb - pa, N - (pb - pa)) * ds < 250) continue;
      var dd2 = Math.hypot(X[pa] - X[pb], Z[pa] - Z[pb]); if (dd2 > 12) continue;
      var cg = cruz.filter(function (q) { return Math.abs(q[0] - pa) < 60 && Math.abs(q[1] - pb) < 60; })[0];
      if (!cg) cruz.push([pa, pb, dd2]); else if (dd2 < cg[2]) { cg[0] = pa; cg[1] = pb; cg[2] = dd2; }
    }
    cruz.forEach(function (q) {
      var cima = alt[q[1]] >= alt[q[0]] ? q[1] : q[0], baixo = cima === q[1] ? q[0] : q[1], sobe = Math.max(0, alt[baixo] + 8.5 - alt[cima]), R0 = Math.round(30 / ds), R1 = Math.round(180 / ds);
      for (var o = -R1; o <= R1; o++) { var k = (cima + o + N) % N, t = limitar((Math.abs(o) - R0) / (R1 - R0), 0, 1), w = 1 - t * t * (3 - 2 * t); ponte[k] = Math.max(ponte[k], sobe * w); }
    });
    for (var pk = 0; pk < N; pk++) alt[pk] += ponte[pk];
    var inc = new Float32Array(N);
    for (var e = 0; e < N; e++) inc[e] = (alt[(e + 3) % N] - alt[(e - 3 + N) % N]) / (6 * ds);
    var T = { id: id, nome: D.nome, local: D.local, D: D, N: N, L: L, ds: ds, x: X, z: Z, y: alt, inc: inc, ponte: ponte, /* ponte[i] > 4: trecho em cima da ponte (sem grama, com mureta) */ tx: tx, tz: tz, nx: nxx, nz: nzz, ang: ang, k: ks, linha: lin2,
      raio: Math.max(Mx - mx, Mz - mz) / 2, cx: (mx + Mx) / 2, cz: (mz + Mz) / 2 };
    T.box = criarBox(T);
    return T;
  }
  /* ponto da pista mais perto de (x, z) e a distância */
  function gradeIndice(T) {
    var G = {}, CEL = 30;
    for (var i = 0; i < T.N; i += 2) { var k = Math.floor(T.x[i] / CEL) + ',' + Math.floor(T.z[i] / CEL); (G[k] = G[k] || []).push(i); }
    var r0 = { d: Infinity, i: 0 };
    return function (x, z, raio) {
      var cx = Math.floor(x / CEL), cz = Math.floor(z / CEL), r = Math.ceil(raio / CEL), m = Infinity, mi = 0;
      for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) {
        var l = G[(cx + dx) + ',' + (cz + dz)];
        if (l) for (var j = 0; j < l.length; j++) { var q = l[j], dd = (T.x[q] - x) * (T.x[q] - x) + (T.z[q] - z) * (T.z[q] - z); if (dd < m) { m = dd; mi = q; } }
      }
      r0.d = Math.sqrt(m); r0.i = mi; return r0;
    };
  }
  function dentro(px, pz, pol) { /* pol = [x0, z0, x1, z1, ...] */
    var s = false;
    for (var i = 0, j = pol.length - 2; i < pol.length; j = i, i += 2) {
      var xi = pol[i], zi = pol[i + 1], xj = pol[j], zj = pol[j + 1];
      if ((zi > pz) !== (zj > pz) && px < (xj - xi) * (pz - zi) / (zj - zi) + xi) s = !s;
    }
    return s;
  }
  function caixaPol(pol) { var b = [Infinity, Infinity, -Infinity, -Infinity]; for (var i = 0; i < pol.length; i += 2) { b[0] = Math.min(b[0], pol[i]); b[1] = Math.min(b[1], pol[i + 1]); b[2] = Math.max(b[2], pol[i]); b[3] = Math.max(b[3], pol[i + 1]); } return b; }
  function texturaFachada() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64);
    var gr = g.createLinearGradient(0, 14, 0, 46); gr.addColorStop(0, '#6f8ea6'); gr.addColorStop(1, '#2f4152');
    g.fillStyle = gr; g.fillRect(14, 16, 36, 30);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 58, 64, 6);
    var t = srgb(new THREE.CanvasTexture(c)); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function pinheiro() {
    var partes = [{ g: (function () { var t = new THREE.CylinderGeometry(0.2, 0.32, 3, 6); t.translate(0, 1.5, 0); return t; })(), cor: [0.34, 0.24, 0.16] }];
    [[2.6, 4.2, 2.2], [2.1, 3.8, 4.4], [1.5, 3.2, 6.4], [0.9, 2.4, 8.1]].forEach(function (c) {
      var g = new THREE.ConeGeometry(c[0], c[1], 8); g.translate(0, c[2] + c[1] / 2 - 0.6, 0);
      partes.push({ g: g, cor: function (x, y) { var v = 0.8 + rnd(x * 2.1 + y * 3.7) * 0.25; return [0.12 * v, 0.33 * v, 0.17 * v]; } });
    });
    return juntar(partes);
  }
  function arbusto() {
    var s = new THREE.IcosahedronGeometry(1.4, 1), p = s.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), f = 1 + (rnd(x * 5 + y * 3 + z * 7) - 0.5) * 0.4; p.setXYZ(i, x * f * 1.3, Math.max(-0.2, y * f * 0.7) + 0.6, z * f * 1.3); }
    s.computeVertexNormals();
    return juntar([{ g: s, cor: function (x, y, z) { var v = 0.8 + rnd(x + z * 2) * 0.3; return [0.36 * v, 0.46 * v, 0.24 * v]; } }]);
  }
  /* marcos de cada lugar (caixa d'água, roda-gigante, torre) */
  function marco(tipo) {
    var g = new THREE.Group();
    if (tipo === 'caixa') {
      var haste = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.6, 36, 12), mat(0xdfe3e8, 40)); haste.position.y = 18; g.add(haste);
      var cone = new THREE.Mesh(new THREE.ConeGeometry(9, 7, 16), mat(0x4f97d1, 70)); cone.rotation.x = Math.PI; cone.position.y = 37.5; g.add(cone);
      var tanque = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 6, 16), mat(0x4f97d1, 70)); tanque.position.y = 44; g.add(tanque);
      var tampa = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x3d82bb, 70)); tampa.scale.y = 0.45; tampa.position.y = 47; g.add(tampa);
    } else if (tipo === 'roda') {
      var mRoda = mat(0xf2f2f2, 60), aro = new THREE.Mesh(new THREE.TorusGeometry(26, 0.7, 8, 64), mRoda); aro.position.y = 32; g.add(aro);
      var aro2 = aro.clone(); aro2.position.z = 2.4; g.add(aro2);
      for (var r = 0; r < 16; r++) {
        var an = r / 16 * Math.PI * 2, raio = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 26, 4), mRoda);
        raio.position.set(Math.cos(an) * 13, 32 + Math.sin(an) * 13, 1.2); raio.rotation.z = an - Math.PI / 2; g.add(raio);
        var cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), mat([0xe3343c, 0xf5c518, 0x2d6cdf, 0x1f9d55][r % 4], 60));
        cab.position.set(Math.cos(an) * 26, 32 + Math.sin(an) * 26 - 1.6, 1.2); g.add(cab);
      }
      [-1, 1].forEach(function (s) { var perna = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 34, 6), mRoda); perna.position.set(s * 8, 16, 1.2); perna.rotation.z = s * 0.25; g.add(perna); });
    } else {
      for (var b = 0; b < 7; b++) { var t = new THREE.Mesh(new THREE.CylinderGeometry(1.4 - b * 0.12, 1.5 - b * 0.12, 9, 8), mat(b % 2 ? 0xffffff : 0xd8262e, 40)); t.position.y = 4.5 + b * 9; g.add(t); }
      var ant = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 12, 4), mat(0x9aa0a6, 80)); ant.position.y = 69; g.add(ant);
    }
    g.traverse(function (o) { if (o.isMesh) o.castShadow = Q.sombras; });
    return g;
  }

  /* terreno com relevo, água, prédios, mata, árvores e marcos */
  function montarArredores(scene, T, maisPerto) {
    var D = T.D, G = D.grade, tema = TEMAS[T.id] || {}, MW = LARG_PISTA / 2, WM = MW + SOBRA;
    function hDem(x, z) {
      var fx = limitar((x - G.x0) / G.passo, 0, G.nx - 1.001), fz = limitar((z - G.z0) / G.passo, 0, G.nz - 1.001), ix = Math.floor(fx), iz = Math.floor(fz), tx = fx - ix, tz = fz - iz;
      var h00 = G.h[iz * G.nx + ix], h10 = G.h[iz * G.nx + ix + 1], h01 = G.h[(iz + 1) * G.nx + ix], h11 = G.h[(iz + 1) * G.nx + ix + 1];
      return lerp(lerp(h00, h10, tx), lerp(h01, h11, tx), tz) / 10;
    }
    /* perto da pista o chão acompanha a pista (um pouco abaixo, por baixo da grama da área de escape) e depois volta ao relevo */
    function hChao(x, z) {
      var h = hDem(x, z), p = maisPerto(x, z, 110);
      if (p.d < 110) { var hr = chaoPista(p.i), t = limitar((p.d - WM - 3) / 80, 0, 1); t = t * t * (3 - 2 * t); h = lerp(hr, h, t); }
      return h;
    }
    T.hChao = hChao;
    function chaoPista(k) { return T.y[k] - 0.45 - (T.ponte[k] > 4 ? T.ponte[k] : 0); } /* debaixo da ponte o chão fica no nível original */
    function zonaBox(x, z) {
      var B = T.box, p = maisPerto(x, z, 60), i = p.i;
      if (p.d > B.off + 40) return false;
      var u = B.u(i * T.ds); if (u > B.len + 40 && u < T.L - 40) return false;
      return ((x - T.x[i]) * T.nx[i] + (z - T.z[i]) * T.nz[i]) * B.lado > 0;
    }
    var x0 = G.x0, z0 = G.z0, LX = (G.nx - 1) * G.passo, LZ = (G.nz - 1) * G.passo;
    var passo = Math.max(12, Math.max(LX, LZ) / (Q.nivel === 'alto' ? 170 : Q.nivel === 'medio' ? 130 : 90));
    var nx = Math.ceil(LX / passo) + 1, nz = Math.ceil(LZ / passo) + 1;
    var pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3), idx = [];
    var gr = tema.grama || [92, 142, 62], mata = D.mata.map(function (m) { return { tipo: m[0], pol: m.slice(1), bb: caixaPol(m.slice(1)) }; });
    var areia = D.areia.map(function (p) { return { pol: p, bb: caixaPol(p) }; });
    function em(lista, x, z) { for (var i = 0; i < lista.length; i++) { var b = lista[i].bb; if (x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3] && dentro(x, z, lista[i].pol)) return lista[i]; } return null; }
    for (var iz = 0; iz < nz; iz++) for (var ix = 0; ix < nx; ix++) {
      var x = x0 + Math.min(ix * passo, LX), z = z0 + Math.min(iz * passo, LZ), k = (iz * nx + ix) * 3, h = hChao(x, z);
      pos[k] = x; pos[k + 1] = h; pos[k + 2] = z;
      var v = 0.9 + rnd(x * 0.013 + z * 0.021) * 0.18, c = gr;
      var mm = em(mata, x, z), aa = !mm && em(areia, x, z);
      if (mm) c = mm.tipo ? [112, 128, 70] : [62, 104, 50]; else if (aa) c = [222, 204, 160];
      var cc = vL([c[0] / 255 * v, c[1] / 255 * v, c[2] / 255 * v]);
      col[k] = cc[0]; col[k + 1] = cc[1]; col[k + 2] = cc[2];
    }
    /* perto da pista o terreno nunca fica acima dela (as células da grade, de 12 a 30 m, cortavam a pista onde dois trechos têm alturas diferentes) */
    var rT = WM + passo * 1.3;
    for (var kp = 0; kp < T.N; kp++) {
      var lim = chaoPista(kp), cx0 = Math.floor((T.x[kp] - rT - x0) / passo), cx1 = Math.ceil((T.x[kp] + rT - x0) / passo), cz0 = Math.floor((T.z[kp] - rT - z0) / passo), cz1 = Math.ceil((T.z[kp] + rT - z0) / passo);
      for (var gz = Math.max(0, cz0); gz <= Math.min(nz - 1, cz1); gz++) for (var gx = Math.max(0, cx0); gx <= Math.min(nx - 1, cx1); gx++) {
        var kk = (gz * nx + gx) * 3; if (Math.hypot(pos[kk] - T.x[kp], pos[kk + 2] - T.z[kp]) < rT && pos[kk + 1] > lim) pos[kk + 1] = lim;
      }
    }
    for (var jz = 0; jz < nz - 1; jz++) for (var jx = 0; jx < nx - 1; jx++) { var a = jz * nx + jx, b = a + 1, c2 = a + nx, d = c2 + 1; idx.push(a, c2, b, b, c2, d); }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    var terreno = new THREE.Mesh(geo, matPlano({ vertexColors: true })); terreno.receiveShadow = Q.sombras; scene.add(terreno);
    /* chão além do mapa, até o horizonte */
    var hBorda = Math.min(hDem(x0, z0), hDem(x0 + LX, z0), hDem(x0, z0 + LZ), hDem(x0 + LX, z0 + LZ)) - 1.5;
    var fora = new THREE.Mesh(new THREE.PlaneGeometry(14000, 14000), matPlano({ color: corL(new THREE.Color(gr[0] / 255, gr[1] / 255, gr[2] / 255).multiplyScalar(0.92).getHex()) }));
    fora.geometry.rotateX(-Math.PI / 2); fora.position.set(x0 + LX / 2, hBorda, z0 + LZ / 2); scene.add(fora);
    /* mar (Zandvoort) e lagos */
    var mAgua = Q.pbr ? new THREE.MeshStandardMaterial({ color: corL(0x2f7fbf), roughness: 0.12, metalness: 0.2 }) : new THREE.MeshPhongMaterial({ color: corL(0x2f7fbf), shininess: 90 });
    if (D.mar || tema.mar) { var mar = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), mAgua); mar.geometry.rotateX(-Math.PI / 2); mar.position.set(x0 + LX / 2, -D.base + 0.4, z0 + LZ / 2); scene.add(mar); fora.visible = false; }
    D.agua.forEach(function (pol) {
      var cont = [], hm = Infinity;
      for (var i = 0; i < pol.length; i += 2) { cont.push(new THREE.Vector2(pol[i], pol[i + 1])); hm = Math.min(hm, hDem(pol[i], pol[i + 1])); }
      if (cont.length < 3) return;
      var tris = THREE.ShapeUtils.triangulateShape(cont, []), p3 = [];
      tris.forEach(function (t) { t.forEach(function (q) { p3.push(cont[q].x, hm + 0.35, cont[q].y); }); });
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p3, 3)); g.computeVertexNormals();
      var m = new THREE.Mesh(g, mAgua); m.material.side = THREE.DoubleSide; scene.add(m);
    });
    /* prédios: paredes com janelas e teto, tudo numa malha só */
    var limite = Q.nivel === 'alto' ? 2200 : Q.nivel === 'medio' ? 1100 : 450, ocupados = {}, CEL = 25;
    var CORES = { c: [[241, 230, 208], [232, 211, 176], [244, 244, 238], [226, 196, 154], [214, 180, 150]], p: [[216, 221, 226], [201, 206, 214], [230, 225, 214], [185, 198, 211], [160, 176, 194]], g: [[223, 227, 230], [200, 208, 216], [185, 196, 204]], a: [[140, 147, 154]] };
    var TETO = { c: [181, 82, 59], p: [125, 132, 140], g: [141, 153, 166], a: [233, 236, 239] };
    var pedacos = {}, bp, bc, bu;
    D.predios.slice(0, limite).forEach(function (b, n) {
      var tipo = b[0], h = b[1], pol = b.slice(2), np = pol.length / 2, cx = 0, cz = 0, perto = false;
      for (var i = 0; i < pol.length; i += 2) { cx += pol[i]; cz += pol[i + 1]; if (maisPerto(pol[i], pol[i + 1], WM + 6).d < WM + 4) perto = true; }
      if (perto || np < 3) return;
      cx /= np; cz /= np;
      if (zonaBox(cx, cz)) return;
      var kc = Math.floor(cx / 500) + ',' + Math.floor(cz / 500), ch = pedacos[kc] || (pedacos[kc] = { p: [], c: [], u: [] }); bp = ch.p; bc = ch.c; bu = ch.u;
      var y0 = hChao(cx, cz) - 1.5, y1 = y0 + h + 1.5, paleta = CORES[tipo] || CORES.p, cw = paleta[Math.floor(rnd(n * 1.7) * paleta.length)], ct = TETO[tipo] || TETO.p;
      var cW = vL([cw[0] / 255, cw[1] / 255, cw[2] / 255]), cT = vL([ct[0] / 255, ct[1] / 255, ct[2] / 255]);
      var area = 0; for (var a2 = 0; a2 < pol.length; a2 += 2) { var j2 = (a2 + 2) % pol.length; area += pol[a2] * pol[j2 + 1] - pol[j2] * pol[a2 + 1]; }
      var sentido = area > 0 ? 1 : -1, u = 0, andar = tipo === 'g' ? 4.5 : 3.2;
      for (var e = 0; e < pol.length; e += 2) {
        var f = (e + 2) % pol.length, xa = pol[e], za = pol[e + 1], xb = pol[f], zb = pol[f + 1], comp = Math.hypot(xb - xa, zb - za), u2 = u + comp / 3.6;
        if (sentido < 0) { var tx2 = xa; xa = xb; xb = tx2; var tz2 = za; za = zb; zb = tz2; }
        bp.push(xa, y0, za, xb, y0, zb, xb, y1, zb, xa, y0, za, xb, y1, zb, xa, y1, za);
        var v0 = 0, v1 = (y1 - y0) / andar;
        bu.push(u, v0, u2, v0, u2, v1, u, v0, u2, v1, u, v1);
        for (var q = 0; q < 6; q++) bc.push(cW[0], cW[1], cW[2]);
        u = u2;
      }
      var cont = []; for (var c3 = 0; c3 < pol.length; c3 += 2) cont.push(new THREE.Vector2(pol[c3], pol[c3 + 1]));
      THREE.ShapeUtils.triangulateShape(cont, []).forEach(function (t) {
        var ord = sentido > 0 ? [t[0], t[2], t[1]] : t;
        ord.forEach(function (qq) { bp.push(cont[qq].x, y1, cont[qq].y); bu.push(0.02, 0.02); bc.push(cT[0], cT[1], cT[2]); });
      });
      var kk = Math.floor(cx / CEL) + ',' + Math.floor(cz / CEL); ocupados[kk] = 1;
    });
    var mPred = matPlano({ map: texturaFachada(), vertexColors: true });
    Object.keys(pedacos).forEach(function (k) {
      var ch = pedacos[k]; if (!ch.p.length) return;
      var gp = new THREE.BufferGeometry();
      gp.setAttribute('position', new THREE.Float32BufferAttribute(ch.p, 3)); gp.setAttribute('color', new THREE.Float32BufferAttribute(ch.c, 3)); gp.setAttribute('uv', new THREE.Float32BufferAttribute(ch.u, 2));
      gp.computeVertexNormals(); gp.computeBoundingSphere();
      var predios = new THREE.Mesh(gp, mPred); predios.castShadow = Q.sombras; predios.receiveShadow = Q.sombras && Q.nivel === 'alto'; scene.add(predios);
    });
    function livre(x, z) { var cx = Math.floor(x / CEL), cz = Math.floor(z / CEL); for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) if (ocupados[(cx + a) + ',' + (cz + b)]) return false; return true; }
    /* árvores: dentro das matas do mapa, em volta da pista e espalhadas */
    var maxArv = Q.arvores * (tema.deserto ? 0.4 : 1.4), lista = [], aguaB = D.agua.map(function (p) { return { pol: p, bb: caixaPol(p) }; });
    function plantar(x, z, esc) {
      if (lista.length >= maxArv) return;
      if (maisPerto(x, z, WM + 10).d < WM + 5 || !livre(x, z) || em(aguaB, x, z) || zonaBox(x, z)) return;
      lista.push([x, hChao(x, z), z, esc, rnd(x + z) * 6.3]);
    }
    var areaMata = mata.reduce(function (s, m) { return s + (m.bb[2] - m.bb[0]) * (m.bb[3] - m.bb[1]); }, 0) || 1;
    mata.forEach(function (m, n) {
      var cota = maxArv * 0.6 * ((m.bb[2] - m.bb[0]) * (m.bb[3] - m.bb[1]) / areaMata), tent = 0;
      for (var k2 = 0; k2 < cota && tent < cota * 4; tent++) {
        var x = lerp(m.bb[0], m.bb[2], rnd(n * 13.1 + tent * 1.37)), z = lerp(m.bb[1], m.bb[3], rnd(n * 7.7 + tent * 2.91));
        if (dentro(x, z, m.pol)) { plantar(x, z, 0.85 + rnd(tent) * 0.6); k2++; }
      }
    });
    for (var t3 = 0; t3 < T.N && lista.length < maxArv * 0.85; t3 += Math.round(14 / T.ds)) {
      [1, -1].forEach(function (s) { var o = s * (WM + 8 + rnd(t3 * 3.1 + s) * 70); if (rnd(t3 * 1.9 + s) < 0.55) plantar(T.x[t3] + T.nx[t3] * o, T.z[t3] + T.nz[t3] * o, 0.75 + rnd(t3) * 0.7); });
    }
    for (var rr = 0; rr < 5000 && lista.length < maxArv; rr++) plantar(x0 + rnd(rr * 1.11) * LX, z0 + rnd(rr * 2.23 + 5) * LZ, 0.8 + rnd(rr) * 0.8);
    var tipos = tema.arv || { folha: 1 }, modelos = { folha: arvoreFolhas, palma: palmeira, pinheiro: pinheiro, arbusto: arbusto }, grupos = {};
    lista.forEach(function (p, i) {
      var r = rnd(i * 1.37), soma = 0, esc = 'folha';
      for (var k in tipos) { soma += tipos[k]; if (r < soma) { esc = k; break; } }
      (grupos[esc] = grupos[esc] || []).push(p);
    });
    var Mt = new THREE.Matrix4(), Rq = new THREE.Quaternion(), Ve = new THREE.Vector3(), Yv = new THREE.Vector3(0, 1, 0), Pv = new THREE.Vector3();
    var mArv = matPlano({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85 }), ARVORES = [];
    Object.keys(grupos).forEach(function (k) {
      var base = modelos[k](), porPedaco = {};
      grupos[k].forEach(function (p) { var kc = Math.floor(p[0] / 800) + ',' + Math.floor(p[2] / 800); /* pedaços de 800 m: em Le Mans eram 300+ objetos com 1 a 7 árvores cada */ (porPedaco[kc] = porPedaco[kc] || []).push(p); });
      Object.keys(porPedaco).forEach(function (kc) {
        var l = porPedaco[kc], geo = new THREE.BufferGeometry();
        Object.keys(base.attributes).forEach(function (a) { geo.setAttribute(a, base.attributes[a]); }); /* mesmos dados, esfera própria */
        var cx = 0, cz = 0, cy = 0; l.forEach(function (p) { cx += p[0]; cy += p[1]; cz += p[2]; }); cx /= l.length; cy /= l.length; cz /= l.length;
        var r = 0; l.forEach(function (p) { r = Math.max(r, Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz)); });
        geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy + 6, cz), r + 16);
        var inst = new THREE.InstancedMesh(geo, mArv, l.length);
        l.forEach(function (p, i) {
          Rq.setFromAxisAngle(Yv, p[4]); Ve.set(p[3], p[3] * (0.9 + rnd(i) * 0.25), p[3]); Pv.set(p[0], p[1] - 0.2, p[2]);
          Mt.compose(Pv, Rq, Ve); inst.setMatrixAt(i, Mt);
          var v = 0.82 + rnd(p[0] + p[2]) * 0.32; inst.setColorAt(i, new THREE.Color(v, v * (0.95 + rnd(i) * 0.1), v * 0.9));
        });
        scene.add(inst); ARVORES.push(inst);
      });
    });
    T.arvores = ARVORES;
    /* árvores longe somem (na névoa quase não aparecem e cada pedaço é um objeto a mais para desenhar) */
    T.arvDist = Q.nivel === 'alto' ? 1500 : Q.nivel === 'medio' ? 1000 : 650;
    T.verArvores = function (p) { ARVORES.forEach(function (a) { var e = a.geometry.boundingSphere, v = Math.hypot(e.center.x - p.x, e.center.z - p.z) - e.radius < T.arvDist; if (a.visible !== v) a.visible = v; }); };
    /* marcos: até 2 caixas d'água, 1 roda-gigante, 3 torres */
    var usados = { caixa: 0, roda: 0, torre: 0 }, maxM = { caixa: 2, roda: 1, torre: 3 };
    D.marcos.forEach(function (m) {
      if (usados[m[0]] >= maxM[m[0]] || maisPerto(m[1], m[2], 40).d < WM + 15) return;
      usados[m[0]]++;
      var g = marco(m[0]); g.position.set(m[1], hChao(m[1], m[2]) - 0.5, m[2]); g.rotation.y = rnd(m[1]) * 6.3; scene.add(g);
    });
    /* morros no horizonte, além do mapa */
    var corM = new THREE.Color(tema.deserto ? 0xc9a77a : 0x6f8f7c), R0 = Math.max(LX, LZ) / 2, morros = []; /* todos os morros num objeto só (eram 26) */
    for (var mo = 0; mo < (tema.montes ? 26 : 0); mo++) {
      var am = mo / 26 * Math.PI * 2, Rm = R0 + 900 + rnd(mo * 3.3) * 900, altM = (110 + rnd(mo * 5.1) * 260) * tema.montes;
      var gcone = new THREE.ConeGeometry(altM * 2.2, altM, 7); gcone.translate(x0 + LX / 2 + Math.cos(am) * Rm, hBorda + altM / 2 - 8, z0 + LZ / 2 + Math.sin(am) * Rm);
      morros.push({ g: gcone, cor: [corM.r, corM.g, corM.b] });
    }
    if (morros.length) scene.add(new THREE.Mesh(juntar(morros), matPlano({ vertexColors: true })));
    return livre;
  }

  /* ---------- Boxes ----------
     O pit lane vem do mapa (entrada, saída e lado). No jogo ele é uma faixa paralela à pista: rampa de entrada,
     trecho com limite de 80 km/h e 12 garagens (uma para cada carro), rampa de saída. u = metros desde a entrada. */
  var PIT_LIM = 22.2; /* 80 km/h */
  function criarBox(T) {
    var D = T.D, X = D.box || { ini: D.comp - 320, fim: 260, lado: 1, off: 22 }, k = T.L / D.comp, MWp = LARG_PISTA / 2;
    var ini = ((X.ini * k) % T.L + T.L) % T.L, len = (((X.fim - X.ini) * k) % T.L + T.L) % T.L;
    var off = limitar(X.off || 22, 19, 26), R = limitar(len * 0.2, 80, 150);
    if (len - 2 * R < 150) len = 2 * R + 150;
    var M = len - 2 * R, esp = limitar((M - 30) / 12, 9, 14), meia = 6 * esp, vagas = [];
    /* garagens centradas na linha de largada (como nos autódromos), dentro do pit lane */
    var uL = (((0 - ini) % T.L) + T.L) % T.L, uc = uL <= len ? uL : len / 2;
    uc = limitar(uc, R + meia + 5, len - R - meia - 5);
    for (var v = 0; v < 12; v++) vagas.push(uc - meia + (v + 0.5) * esp);
    function suave(t) { t = limitar(t, 0, 1); return t * t * (3 - 2 * t); }
    var B = { ini: ini, len: len, lado: X.lado || 1, off: off, R: R, esp: esp, vagas: vagas, pl: 4.5, real: !X.padrao,
      limIni: Math.max(R * 0.7, uc - meia - 70), limFim: Math.min(len - R * 0.7, uc + meia + 70) }; /* limite de 80 km/h perto das garagens */
    B.u = function (s) { return ((s - ini) % T.L + T.L) % T.L; };
    /* centro do pit lane (lado da pista em metros) */
    B.d = function (u) {
      var a = MWp - 1, b = off - 1.6;
      if (u < R) return B.lado * lerp(a, b, suave(u / R));
      if (u > len - R) return B.lado * lerp(a, b, suave((len - u) / R));
      return B.lado * b;
    };
    /* ponto do mundo em u (ao longo do pit) e d (de lado) */
    B.ponto = function (u, d) {
      var s = (ini + u) % T.L, i = Math.floor(s / T.ds) % T.N, f = s / T.ds - Math.floor(s / T.ds), j = (i + 1) % T.N;
      return { x: lerp(T.x[i], T.x[j], f) + lerp(T.nx[i], T.nx[j], f) * d, z: lerp(T.z[i], T.z[j], f) + lerp(T.nz[i], T.nz[j], f) * d, y: lerp(T.y[i], T.y[j], f), ang: T.ang[i] };
    };
    return B;
  }
  /* mecânico (frente = +z): pernas, tronco, braços para a frente; o macacão leva a cor da equipe.
     São só 2 objetos para todos os mecânicos (instâncias): corpo (pintado na cor de cada equipe) e o resto (capacete, viseira, luvas, botas). */
  function geosMecanico() {
    function peca(geo, x, y, z, rx, c) { if (rx) geo.rotateX(rx); geo.translate(x, y, z); return { g: geo, cor: c }; }
    var B1 = [1, 1, 1], esc = [0.07, 0.07, 0.08], cap = [0.95, 0.95, 0.95], vis = [0.03, 0.05, 0.07];
    var corpo = juntar([
      peca(new THREE.CylinderGeometry(0.085, 0.07, 0.8, 6), 0.1, 0.48, 0, 0, B1), peca(new THREE.CylinderGeometry(0.085, 0.07, 0.8, 6), -0.1, 0.48, 0, 0, B1),
      peca(new THREE.CylinderGeometry(0.2, 0.16, 0.64, 8), 0, 1.16, 0, 0, B1), peca(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0, 1.47, 0, 0, B1),
      peca(new THREE.CylinderGeometry(0.055, 0.048, 0.58, 6), 0.26, 1.14, 0.16, -0.6, B1), peca(new THREE.CylinderGeometry(0.055, 0.048, 0.58, 6), -0.26, 1.14, 0.16, -0.6, B1)
    ]);
    var resto = juntar([
      peca(new THREE.BoxGeometry(0.13, 0.1, 0.26), 0.1, 0.05, 0.04, 0, esc), peca(new THREE.BoxGeometry(0.13, 0.1, 0.26), -0.1, 0.05, 0.04, 0, esc),
      peca(new THREE.SphereGeometry(0.06, 6, 4), 0.26, 0.9, 0.33, 0, esc), peca(new THREE.SphereGeometry(0.06, 6, 4), -0.26, 0.9, 0.33, 0, esc),
      peca(new THREE.SphereGeometry(0.16, 10, 8), 0, 1.7, 0, 0, cap),
      peca(new THREE.SphereGeometry(0.165, 10, 6, Math.PI / 2 - 0.75, 1.5, 1.2, 0.5), 0, 1.7, 0, 0, vis)
    ]);
    return { corpo: corpo, resto: resto };
  }
  function texturaPlaca(tipo) {
    var c = canvas(128, 128), g = c.getContext('2d');
    if (tipo === 'pit') { g.fillStyle = '#1556c9'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#fff'; g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.fillText('PIT', 64, 62); g.font = 'bold 44px Arial'; g.fillText('→', 64, 112); }
    else { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = tipo === 'fim' ? '#555' : '#d0161e'; g.lineWidth = 14; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke();
      g.fillStyle = '#111'; g.font = 'bold 52px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('80', 64, 66);
      if (tipo === 'fim') { g.strokeStyle = '#333'; g.lineWidth = 8; g.beginPath(); g.moveTo(24, 104); g.lineTo(104, 24); g.stroke(); } }
    return srgb(new THREE.CanvasTexture(c));
  }
  var MAT_MEC = null;
  function texturaGaragem() {
    var c = canvas(128, 128), g = c.getContext('2d');
    g.fillStyle = '#e4e7ea'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#2b3a48'; g.fillRect(6, 10, 116, 22);                 /* janelas do andar de cima */
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(6, 10, 116, 5);
    var gr = g.createLinearGradient(0, 52, 0, 128); gr.addColorStop(0, '#2a2d31'); gr.addColorStop(1, '#4a4e54');
    g.fillStyle = gr; g.fillRect(8, 52, 112, 76);                          /* porta da garagem aberta */
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(14, 56, 100, 3);   /* luz do teto */
    g.fillStyle = '#c8ccd0'; g.fillRect(0, 48, 128, 4);
    return srgb(new THREE.CanvasTexture(c));
  }
  /* garagens, faixas do pit lane e equipes (feito depois dos carros, para usar a cor de cada um) */
  function montarBoxes(scene, T, carros) {
    var B = T.box, tex = texturaGaragem(), mTeto = mat(0xdfe3e7, 40), mFrente = matPlano({ map: tex });
    var branco = new THREE.MeshBasicMaterial({ color: corL(0xe8e8e8), side: THREE.DoubleSide });
    var dGar = B.lado * (B.off + B.pl + 0.8 + 6.2), equipes = [], mecs = [], pneus = [], cp = [], cc = [];
    /* retângulo pintado no chão (cx ao longo do pit, cz de lado, a partir do ponto p) */
    function chao(p, ca, sa, cx, cz, w, h, c) {
      [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].forEach(function (q) {
        var a = cx + q[0], b = cz + q[1]; cp.push(p.x + a * ca - b * sa, p.y + 0.075, p.z + a * sa + b * ca); cc.push(c[0], c[1], c[2]);
      });
    }
    B.vagas.forEach(function (u, k) {
      var c = carros[k], cor = c ? c.cor : 0x8c939a, p = B.ponto(u, dGar);
      var mats = [mTeto, mTeto, mTeto, mTeto, B.lado > 0 ? mTeto : mFrente, B.lado > 0 ? mFrente : mTeto];
      var gar = new THREE.Mesh(new THREE.BoxGeometry(B.esp - 0.25, 7.6, 12), mats);
      gar.position.set(p.x, p.y + 3.5, p.z); gar.rotation.y = -p.ang; gar.castShadow = Q.sombras; gar.receiveShadow = Q.sombras; scene.add(gar);
      /* faixa na cor da equipe acima da porta e o número no chão do box */
      var pf = B.ponto(u, B.lado * (B.off + B.pl + 0.75)), faixa = caixa(0, 0, 0, B.esp - 0.6, 0.6, 0.12, mat(cor, 60));
      faixa.position.set(pf.x, pf.y + 4.0, pf.z); faixa.rotation.y = -pf.ang; scene.add(faixa);
      var pc = B.ponto(u, B.lado * (B.off + 1.6)), ca = Math.cos(pc.ang), sa = Math.sin(pc.ang);
      /* box no chão: contorno na cor da equipe, faixa branca de parada e o número */
      var cl = vL([((cor >> 16) & 255) / 255, ((cor >> 8) & 255) / 255, (cor & 255) / 255]);
      [[0, -1.6, B.esp - 1, 0.14], [0, 1.6, B.esp - 1, 0.14], [-(B.esp - 1) / 2, 0, 0.14, 3.2], [(B.esp - 1) / 2, 0, 0.14, 3.2]].forEach(function (r) { chao(pc, ca, sa, r[0], r[1] * B.lado, r[2], r[3], cl); });
      chao(pc, ca, sa, 2.6, 0, 0.25, 2.4, [0.9, 0.9, 0.9]);
      /* pilhas de pneus novos na frente da garagem */
      [-0.32, 0.32].forEach(function (k2) { var pp = B.ponto(u + k2 * B.esp, B.lado * (B.off + B.pl + 0.55)); for (var h = 0; h < 3; h++) pneus.push([pp.x, pp.y + 0.16 + h * 0.31, pp.z]); });
      /* equipe: 4 nos pneus, 1 no macaco da frente, 1 na gasolina (carros com reabastecimento) ou no macaco de trás */
      var lista = [], n = 6;
      lista.ref = { x: pc.x, z: pc.z, th: pc.ang };
      for (var m = 0; m < n; m++) {
        var pe = B.ponto(u + (m - (n - 1) / 2) * 1.0, B.lado * (B.off + B.pl + 0.35)), rot = Math.atan2(-B.lado * T.nx[Math.floor(((B.ini + u) % T.L) / T.ds) % T.N], -B.lado * T.nz[Math.floor(((B.ini + u) % T.L) / T.ds) % T.N]);
        lista.push({ i: mecs.length, cor: cor, pos: new THREE.Vector3(pe.x, pe.y, pe.z), rot: rot, sy: 1, casa: new THREE.Vector3(pe.x, pe.y, pe.z), rotCasa: rot });
        mecs.push(lista[lista.length - 1]);
      }
      equipes.push(lista);
    });
    /* linhas do limite de velocidade e placas de 80 km/h (início e fim) */
    var mPost = mat(0x9aa0a6, 60);
    function placa(u, d, tipo, alt) {
      var p = B.ponto(u, d), g = new THREE.Group(), poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, alt, 6), mPost); poste.position.y = alt / 2; g.add(poste);
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: texturaPlaca(tipo), side: THREE.DoubleSide })); pl.position.y = alt + 0.5; g.add(pl);
      g.position.set(p.x, p.y, p.z); g.rotation.y = Math.atan2(-Math.cos(p.ang), -Math.sin(p.ang)); scene.add(g);
    }
    [B.limIni, B.limFim].forEach(function (u, k) {
      var p = B.ponto(u, B.d(u)), l = new THREE.Mesh(new THREE.PlaneGeometry(0.5, B.pl * 2), branco);
      l.geometry.rotateX(-Math.PI / 2); l.position.set(p.x, p.y + 0.07, p.z); l.rotation.y = -p.ang; scene.add(l);
      placa(u, B.lado * (B.off - B.pl - 0.5), k ? 'fim' : '80', 1.6);
    });
    placa(12, B.lado * (LARG_PISTA / 2 + 2.5), 'pit', 1.4); /* placa da entrada dos boxes */
    /* faixa tracejada entre a pista rápida e a área de trabalho */
    for (var ut = B.limIni; ut < B.limFim; ut += 6) { var pt = B.ponto(ut, B.lado * (B.off - 0.5)); chao(pt, Math.cos(pt.ang), Math.sin(pt.ang), 0, 0, 3, 0.15, [0.9, 0.9, 0.9]); }
    /* semáforo verde na saída */
    var ps = B.ponto(B.len - B.R * 0.6, B.lado * (B.off - B.pl - 0.5)), sem = new THREE.Group(), cxs = caixa(0, 1.9, 0, 0.3, 0.7, 0.3, mat(0x15171a, 30)); sem.add(cxs);
    var luzV = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0x22ff55 })); luzV.position.set(0, 1.75, 0); sem.add(luzV);
    var pos2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), mPost); pos2.position.y = 0.8; sem.add(pos2); sem.position.set(ps.x, ps.y, ps.z); scene.add(sem);
    /* tudo que é pintado no chão: um objeto só */
    var gc = new THREE.BufferGeometry(); gc.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); gc.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3));
    scene.add(new THREE.Mesh(gc, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })));
    /* pneus (instâncias) */
    var gp = new THREE.CylinderGeometry(0.33, 0.33, 0.3, 14), iP = new THREE.InstancedMesh(gp, mat(0x141416, 25), pneus.length), M4 = new THREE.Matrix4();
    pneus.forEach(function (q, k) { M4.makeTranslation(q[0], q[1], q[2]); iP.setMatrixAt(k, M4); }); iP.frustumCulled = false; iP.castShadow = Q.sombras; scene.add(iP);
    /* mecânicos (instâncias): corpo na cor da equipe + capacete/luvas/botas */
    var G = geosMecanico(), mC = matPlano({ vertexColors: true }), mR = matPlano({ vertexColors: true });
    var iC = new THREE.InstancedMesh(G.corpo, mC, mecs.length), iR = new THREE.InstancedMesh(G.resto, mR, mecs.length);
    mecs.forEach(function (m, k) { iC.setColorAt(k, corL(m.cor)); iR.setColorAt(k, new THREE.Color(1, 1, 1)); });
    iC.frustumCulled = iR.frustumCulled = false; iC.castShadow = iR.castShadow = Q.sombras; scene.add(iC); scene.add(iR);
    var boneco = new THREE.Object3D();
    equipes.atualizar = function () {
      mecs.forEach(function (m) { boneco.position.copy(m.pos); boneco.rotation.set(0, m.rot, 0); boneco.scale.set(1, m.sy, 1); boneco.updateMatrix(); iC.setMatrixAt(m.i, boneco.matrix); iR.setMatrixAt(m.i, boneco.matrix); });
      iC.instanceMatrix.needsUpdate = true; iR.instanceMatrix.needsUpdate = true;
    };
    equipes.atualizar();
    return equipes;
  }
  /* posição de trabalho de cada mecânico em volta do carro parado (frente do carro = +x) */
  var POS_MEC = [[1.55, 1.3], [1.55, -1.3], [-1.45, 1.3], [-1.45, -1.3], [3.1, 0], [-3.0, 0]];

  /* ---------- Cenário ---------- */
  function montarCenario(scene, T) {
    var dist = gradeDistancia(T), MW = LARG_PISTA / 2, deserto = (TEMAS[T.id] || {}).deserto, WM = MW + SOBRA;
    function receber(m) { m.receiveShadow = Q.sombras; return m; }
    var B = T.box, PL = B.pl;
    function uDe(j) { return B.u(j * T.ds); }
    var livre = montarArredores(scene, T, gradeIndice(T));
    var mV = matPlano({ vertexColors: true, side: THREE.DoubleSide });
    /* pit lane */
    var noBox = function (j) { return uDe(j) <= B.len; }, dP = function (j) { var u = uDe(j); return u <= B.len ? B.d(u) : 0; };
    var asfP = texturaAsfalto();
    scene.add(receber(new THREE.Mesh(fita(T, function (j) { return dP(j) - PL; }, function (j) { return dP(j) + PL; }, 0.045, [1, 1, 1], noBox, [12, 1.2]), matPlano({ map: asfP, color: corL(0x7d8086), side: THREE.DoubleSide }))));
    var brP = new THREE.MeshBasicMaterial({ color: corL(0xe8e8e8), side: THREE.DoubleSide });
    scene.add(new THREE.Mesh(fita(T, function (j) { return dP(j) - PL + 0.1; }, function (j) { return dP(j) - PL + 0.3; }, 0.06, [1, 1, 1], noBox), brP));
    scene.add(new THREE.Mesh(fita(T, function (j) { return dP(j) + PL - 0.3; }, function (j) { return dP(j) + PL - 0.1; }, 0.06, [1, 1, 1], noBox), brP));
    var meioBox = function (j) { var u = uDe(j); return u >= B.R && u <= B.len - B.R; };
    var muroBox = new THREE.Mesh(parede(T, B.lado * (B.off - PL - 1), 0, 1.1, meioBox, 8), matPlano({ color: corL(0xe9ecef), side: THREE.DoubleSide })); muroBox.castShadow = Q.sombras; scene.add(muroBox);
    var alambB = texturaAlambrado(); alambB.repeat.set(1, 3);
    scene.add(new THREE.Mesh(parede(T, B.lado * (B.off - PL - 1), 1.1, 3.0, meioBox, 0.8), new THREE.MeshBasicMaterial({ map: alambB, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, color: corL(0x8e959b) })));
    var zonaGar = function (j) { var u = uDe(j); return u >= B.vagas[0] - B.esp / 2 - 1 && u <= B.vagas[11] + B.esp / 2 + 1; };
    scene.add(receber(new THREE.Mesh(parede(T, B.lado * (B.off + PL + 0.8), 0, 1.1, function (j) { return noBox(j) && !zonaGar(j); }, 8), matPlano({ color: corL(0xb9bcbf), side: THREE.DoubleSide }))));
    /* área de escape: grama (ou areia) mais viva até o muro */
    var gramaTex = deserto ? texturaGrama([206, 178, 128], [198, 170, 120]) : texturaGrama([92, 150, 66], [80, 136, 58]);
    var chaoOk = function (j) { return !(T.ponte[j] > 4); }; /* em cima da ponte não tem área de escape */
    scene.add(receber(new THREE.Mesh(fita(T, -WM, WM, 0.02, [1, 1, 1], chaoOk, [16, 1.5]), matPlano({ map: gramaTex, side: THREE.DoubleSide }))));
    /* faixa pintada depois da linha branca (como em Miami e Abu Dhabi) */
    var corEscape = function (j) { return Math.abs(T.k[j]) > 1 / 160 ? [0.5, 0.5, 0.5] : [0.25, 0.47, 0.27]; }; /* curva: asfalto de escape; reta: grama sintética verde */
    scene.add(receber(new THREE.Mesh(fita(T, MW, MW + 3.2, 0.035, corEscape, chaoOk), mV)));
    scene.add(receber(new THREE.Mesh(fita(T, -MW - 3.2, -MW, 0.035, corEscape, chaoOk), mV)));
    /* caixas de brita do lado de fora das curvas (até uns 25 m antes e depois) */
    var britaTex = texturaGrama([196, 180, 150], [190, 174, 144]), fora = [new Uint8Array(T.N), new Uint8Array(T.N)], alcance = Math.round(25 / T.ds);
    for (var jb = 0; jb < T.N; jb++) if (Math.abs(T.k[jb]) > 1 / 110) for (var e2 = -alcance; e2 <= alcance; e2++) fora[T.k[jb] > 0 ? 1 : 0][(jb + e2 + T.N) % T.N] = 1; /* k > 0: curva para +n, o lado de fora é -n */
    var mBrita = matPlano({ map: britaTex, color: corL(0xd8cfbf), side: THREE.DoubleSide }), naoBox = function (j) { var u = uDe(j); return u > B.len + 10 && u < T.L - 10; };
    scene.add(receber(new THREE.Mesh(fita(T, MW + 3.2, WM - 1, 0.03, [1, 1, 1], function (j) { return fora[0][j] && chaoOk(j) && (B.lado !== 1 || naoBox(j)); }, [6, 1.2]), mBrita)));
    scene.add(receber(new THREE.Mesh(fita(T, -WM + 1, -MW - 3.2, 0.03, [1, 1, 1], function (j) { return fora[1][j] && chaoOk(j) && (B.lado !== -1 || naoBox(j)); }, [6, 1.2]), mBrita)));
    /* asfalto */
    var asf = texturaAsfalto(); asf.repeat.set(1, 1);
    scene.add(receber(new THREE.Mesh(fita(T, -MW, MW, 0.05, [1, 1, 1], null, [12, 1.6]), matPlano({ map: asf, color: corL(0x8a8d92), side: THREE.DoubleSide }))));
    /* borracha no traçado ideal (mais escuro) */
    var borracha = new THREE.Mesh(fita(T, function (j) { return T.linha[j] - 1.4; }, function (j) { return T.linha[j] + 1.4; }, 0.055, [0, 0, 0]),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
    scene.add(borracha);
    var branco = new THREE.MeshBasicMaterial({ color: corL(0xe8e8e8), side: THREE.DoubleSide });
    scene.add(new THREE.Mesh(fita(T, MW - 0.45, MW - 0.2, 0.07, [1, 1, 1]), branco));
    scene.add(new THREE.Mesh(fita(T, -MW + 0.2, -MW + 0.45, 0.07, [1, 1, 1]), branco));
    /* zebras nas curvas */
    var corZebra = function (j) { return Math.floor(j * T.ds / 3) % 2 ? [0.95, 0.95, 0.95] : [0.82, 0.1, 0.12]; };
    var curva = function (j) { return Math.abs(T.k[j]) > 1 / 160; };
    scene.add(receber(new THREE.Mesh(fita(T, MW, MW + 1.4, 0.06, corZebra, curva), mV)));
    scene.add(receber(new THREE.Mesh(fita(T, -MW - 1.4, -MW, 0.06, corZebra, curva), mV)));
    /* muros com placas de patrocínio e alambrado em cima (só onde o muro não invade outro trecho da pista) */
    var placas = texturaPlacas(), alamb = texturaAlambrado(), mPlaca = matPlano({ map: placas, side: THREE.DoubleSide }), mConc = matPlano({ color: corL(0xb9bcbf), side: THREE.DoubleSide });
    var mAlamb = new THREE.MeshBasicMaterial({ map: alamb, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, color: corL(0x8e959b) });
    alamb.repeat.set(1, 4);
    var postes = [];
    [1, -1].forEach(function (s) {
      var w = s * WM, ok = function (j) { if (!chaoOk(j)) return false; if (s === B.lado) { var u = uDe(j); if (u <= B.len + 6 || u > T.L - 6) return false; } return dist(T.x[j] + T.nx[j] * w, T.z[j] + T.nz[j] * w, WM + 2) > WM - 1.5; };
      var conc = new THREE.Mesh(parede(T, w + s * 0.25, 0, 1.25, ok, 8), mConc); conc.castShadow = Q.sombras; receber(conc); scene.add(conc);
      scene.add(new THREE.Mesh(parede(T, w, 0.12, 1.1, ok, 7 * 8), mPlaca));
      scene.add(new THREE.Mesh(parede(T, w + s * 0.25, 1.25, 4.2, ok, 0.8), mAlamb));
      for (var j = 0; j < T.N; j += Math.round(9 / T.ds)) if (ok(j)) postes.push([T.x[j] + T.nx[j] * (w + s * 0.25), T.z[j] + T.nz[j] * (w + s * 0.25), T.y[j]]);
    });
    /* ponte: mureta dos dois lados, beirada de concreto, laje por baixo e pilares fora da pista de baixo */
    var naPonte = function (j) { return T.ponte[j] > 4; };
    if (T.ponte.some(function (p) { return p > 4; })) {
      var mPonte = matPlano({ color: corL(0xa9adb1), side: THREE.DoubleSide }), mLaje = matPlano({ color: corL(0x6c7075), side: THREE.DoubleSide });
      [1, -1].forEach(function (s2) {
        var mur = new THREE.Mesh(parede(T, s2 * (MW + 1.1), 0, 1.0, naPonte, 8), mPonte); mur.castShadow = Q.sombras; receber(mur); scene.add(mur);
        scene.add(receber(new THREE.Mesh(fita(T, s2 > 0 ? MW : -MW - 1.2, s2 > 0 ? MW + 1.2 : -MW, 0.04, [0.62, 0.63, 0.64], naPonte), mV)));
        scene.add(new THREE.Mesh(parede(T, s2 * (MW + 1.25), -1.0, 1.0, naPonte, 8), mLaje));
      });
      scene.add(new THREE.Mesh(fita(T, -MW - 1.25, MW + 1.25, -1.0, [0.4, 0.41, 0.43], naPonte), mV));
      for (var jp = 0; jp < T.N; jp += Math.round(22 / T.ds)) {
        if (T.ponte[jp] < 5) continue;
        var livreP = true; for (var q2 = 0; q2 < T.N; q2 += 2) { if (Math.min(Math.abs(q2 - jp), T.N - Math.abs(q2 - jp)) * T.ds < 250) continue; if (Math.hypot(T.x[q2] - T.x[jp], T.z[q2] - T.z[jp]) < MW + 4) { livreP = false; break; } }
        if (!livreP) continue; /* pilar não cai em cima da pista de baixo */
        var alt0 = T.y[jp] - T.ponte[jp] - 1, hP = T.ponte[jp] + 0.1, pil = new THREE.Mesh(new THREE.BoxGeometry(1.4, hP, LARG_PISTA - 2), mLaje);
        pil.position.set(T.x[jp], alt0 + hP / 2, T.z[jp]); pil.rotation.y = -T.ang[jp]; pil.castShadow = Q.sombras; scene.add(pil);
      }
    }
    var poste = new THREE.CylinderGeometry(0.06, 0.08, 4.3, 5); poste.translate(0, 2.15, 0);
    var iPoste = new THREE.InstancedMesh(poste, mat(0x6d7378, 60), postes.length), M4 = new THREE.Matrix4();
    postes.forEach(function (p, i) { M4.makeTranslation(p[0], p[2], p[1]); iPoste.setMatrixAt(i, M4); });
    iPoste.frustumCulled = false; scene.add(iPoste);
    /* largada: faixa quadriculada e pórtico */
    var cq = canvas(64, 8), gq = cq.getContext('2d');
    for (var q = 0; q < 16; q++) for (var r = 0; r < 2; r++) { gq.fillStyle = (q + r) % 2 ? '#111' : '#f4f4f4'; gq.fillRect(q * 4, r * 4, 4, 4); }
    var linha = new THREE.Mesh(new THREE.PlaneGeometry(LARG_PISTA, 1.6), new THREE.MeshBasicMaterial({ map: srgb(new THREE.CanvasTexture(cq)) }));
    linha.geometry.rotateX(-Math.PI / 2); linha.geometry.rotateY(-T.ang[0] + Math.PI / 2);
    linha.position.set(T.x[0], T.y[0] + 0.08, T.z[0]); scene.add(linha);
    var portico = new THREE.Group(), mPort = mat(0x2a2e33, 60);
    portico.add(caixa(0, 3.5, MW + 1.2, 0.5, 7, 0.5, mPort)); portico.add(caixa(0, 3.5, -MW - 1.2, 0.5, 7, 0.5, mPort));
    var mPlP = matPlano({ map: placas }), faixaP = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, LARG_PISTA + 3), [mPlP, mPlP, mPort, mPort, mPort, mPort]);
    faixaP.position.y = 6.6; portico.add(faixaP);
    portico.position.set(T.x[0], T.y[0], T.z[0]); portico.rotation.y = -T.ang[0]; scene.add(portico);
    /* caixas do grid */
    for (var gi = 0; gi < 12; gi++) {
      var sg = (T.N - Math.round((14 + gi * 9) / T.ds)) % T.N, lado = gi % 2 ? 2.6 : -2.6;
      var bx = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.18), branco);
      bx.geometry.rotateX(-Math.PI / 2); bx.geometry.rotateY(-T.ang[sg] + Math.PI / 2);
      bx.position.set(T.x[sg] + T.nx[sg] * lado + T.tx[sg] * 3, T.y[sg] + 0.08, T.z[sg] + T.nz[sg] * lado + T.tz[sg] * 3); scene.add(bx);
    }
    /* arquibancadas com cobertura e prédio dos boxes com janelas */
    var torcida = texturaTorcida(), janelas = texturaJanelas(), mCinza = mat(0x8c939a, 40), mTeto = mat(0xe9ecef, 50);
    for (var a = -5; a <= 4; a++) {
      var ia = (Math.round(a * 58 / T.ds) + T.N) % T.N, off = WM + 12, lA = -B.lado;
      var px = T.x[ia] + T.nx[ia] * off * lA, pz = T.z[ia] + T.nz[ia] * off * lA;
      if (dist(px, pz, off + 12) > off - 7 && livre(px, pz)) {
        var arq = new THREE.Group();
        var deg = caixa(0, 5.5, 5.2, 50, 11, 0.6, mCinza);
        var frente = new THREE.Mesh(new THREE.PlaneGeometry(50, 13), matPlano({ map: torcida, side: THREE.DoubleSide }));
        frente.rotation.x = 0.75; frente.position.set(0, 5.2, 0.4); arq.add(frente); arq.add(deg);
        var teto = new THREE.Mesh(new THREE.BoxGeometry(52, 0.4, 16), mTeto); teto.position.set(0, 13.5, 0.5); arq.add(teto);
        [-24, 0, 24].forEach(function (xx) { arq.add(caixa(xx, 6.8, 7.5, 0.4, 13.5, 0.4, mCinza)); });
        arq.traverse(function (o) { if (o.isMesh) { o.castShadow = Q.sombras; o.receiveShadow = Q.sombras; } });
        arq.position.set(px, T.y[ia] - 0.3, pz); arq.rotation.y = -T.ang[ia] + (lA < 0 ? Math.PI : 0); scene.add(arq);
      }
    }
    var nuv = texturaNuvem();
    for (var n = 0; n < 16; n++) {
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: nuv, transparent: true, opacity: 0.85, fog: false, depthWrite: false }));
      var an = Math.random() * Math.PI * 2, rn = 1400 + Math.random() * 1200;
      sp.position.set(Math.cos(an) * rn, 260 + Math.random() * 380, Math.sin(an) * rn); sp.scale.set(700 + Math.random() * 500, 220 + Math.random() * 120, 1); scene.add(sp);
    }
    return dist;
  }

  /* ---------- Som do motor (sintetizado) ---------- */
  function Motor() {
    var A = null, o1, o2, filtro, ganho, ligado = ler('corrida-som', true);
    return {
      ligar: function () {
        if (!ligado || A) return;
        try {
          A = new (window.AudioContext || window.webkitAudioContext)();
          o1 = A.createOscillator(); o1.type = 'sawtooth'; o2 = A.createOscillator(); o2.type = 'square';
          filtro = A.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 900;
          ganho = A.createGain(); ganho.gain.value = 0.0001;
          o1.connect(filtro); o2.connect(filtro); filtro.connect(ganho); ganho.connect(A.destination);
          o1.start(); o2.start();
        } catch (e) { A = null; }
      },
      atualizar: function (rpm, carga) {
        if (!A) return;
        var t = A.currentTime, f = 40 + rpm / 60 * 1.5;
        o1.frequency.setTargetAtTime(f, t, 0.03); o2.frequency.setTargetAtTime(f * 0.5, t, 0.03);
        filtro.frequency.setTargetAtTime(500 + carga * 1800 + rpm * 0.08, t, 0.05);
        ganho.gain.setTargetAtTime(0.035 + carga * 0.05, t, 0.05);
      },
      retomar: function () { if (A && A.state === 'suspended') A.resume(); },
      parar: function () { if (A) { try { A.close(); } catch (e) {} A = null; } },
      ligado: function () { return ligado; },
      trocar: function () { ligado = !ligado; guardar('corrida-som', ligado); if (!ligado) this.parar(); else this.ligar(); return ligado; }
    };
  }

  /* ---------- O jogo ---------- */
  window.JOGO_CORRIDA = function (el) {
    function pistasDaClasse() { return LISTA_PISTAS[cfg.classe] || LISTA_PISTAS.f1; }
    var toque = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    /* tela cheia do navegador (precisa ser pedida no clique). No iPhone o Safari não deixa: lá fica a tela cheia do site (ou abra pelo ícone na tela de início) */
    function emTelaCheia() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
    function pedirTelaCheia() {
      var d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
      if (!f || emTelaCheia()) return;
      try { var p = f.call(d, { navigationUI: 'hide' }); if (p && p.then) p.then(deitar).catch(function () {}); else deitar(); } catch (e) {}
    }
    function deitar() { try { if (toque && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); } catch (e) {} }
    function sairTelaCheia() { var x = document.exitFullscreen || document.webkitExitFullscreen; if (x && emTelaCheia()) try { x.call(document); } catch (e) {} }
    /* saiu da tela cheia pelo Esc: o jogo volta para o tamanho da página */
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) { document.addEventListener(ev, function () { var cj = el.querySelector('#nv-jogo'); if (!emTelaCheia() && cj && !toque && cj.classList.contains('nv-cheio')) { cj.classList.remove('nv-cheio'); document.documentElement.classList.remove('nv-jogando'); window.dispatchEvent(new Event('resize')); } }); });
    var cfg = ler('corrida-cfg', { classe: 'f1', pista: 'Interlagos', voltas: 2, nivel: 'medio', cor: 'preto', auto: toque });
    var recordes = ler('corrida-recordes', {});
    var jogo = null, raf = 0, porTimer = false, vigia = 0;
    /* alguns navegadores embutidos (apps, prévias) não rodam requestAnimationFrame: nesse caso o jogo anda por setTimeout */
    function agendar(f) { return porTimer ? setTimeout(function () { f(performance.now()); }, 16) : requestAnimationFrame(f); }

    function chips(nome, lista, atual) {
      return '<div class="nv-op"><span>' + nome + '</span><div class="nv-chips">' + lista.map(function (o) {
        return '<button type="button" class="nv-chip" data-k="' + o[0] + '" data-v="' + o[1] + '" aria-pressed="' + (String(atual) === String(o[1])) + '">' + esc(o[2]) + '</button>';
      }).join('') + '</div></div>';
    }
    /* no WEC a pessoa escolhe a classe; nas outras categorias a classe é a própria categoria */
    function classeJog() { return cfg.classe === 'wec' ? (cfg.wecCls === 'gt3' ? 'gt3' : 'hyper') : CLASSES[cfg.classe] ? cfg.classe : 'f1'; }
    function nomeJog() { return cfg.classe === 'wec' ? 'WEC ' + CLASSES[classeJog()].nome : CLASSES[classeJog()].nome; }
    function distFreio(Cc) { var v = 200 / 3.6, d = 0; while (v > 0.5) { d += v * 0.01; v -= freioC(Cc, v) * 0.01; } return d; }
    function chaveRec() { return classeJog() + '|' + cfg.pista; }
    function carroJog() { var k = classeJog(), v = VARIANTES[k] || [k], esc = (cfg.carros || {})[k]; return v.indexOf(esc) >= 0 ? esc : v[0]; }
    function modelosCorrida() {
      var lista = [];
      (cfg.classe === 'wec' ? ['hyper', 'gt3'] : [classeJog()]).forEach(function (k) { (VARIANTES[k] || [k]).forEach(function (m) { lista.push(m); }); });
      return lista.concat(['cab:' + carroJog(), 'sc']);
    }
    function menu() {
      parar();
      if (!CLASSES[cfg.classe] || CLASSES[cfg.classe].oculta) cfg.classe = 'f1'; /* F2, F3, WEC e Porsche Cup saíram do jogo */
      if (pistasDaClasse().indexOf(cfg.pista) < 0) cfg.pista = pistasDaClasse()[0]; /* cada categoria tem as suas pistas */
      var chave = chaveRec(), rec = recordes[chave];
      el.innerHTML = '<div class="jg-cab-jogo"><h2>Arena Racing</h2><p>Você pilota. Escolha a categoria e a pista, largue no meio do pelotão e tente vencer. ' +
        (toque ? 'Use os botões na tela; com "Acelerar sozinho" você só vira e freia. BOX, no alto, chama o pit stop.' + (cfg.classe === 'f1' ? ' ⚡ usa a bateria.' : '') : 'Setas ou W A S D para pilotar, Q sobe e E desce a marcha (câmbio manual), C troca a câmera, B chama o box' + (cfg.classe === 'f1' ? ', espaço usa a bateria (⚡).' : '.')) + ' Pneus gastam e a gasolina acaba (o tanque dura umas 3 voltas): nas corridas longas, pare no box.' + '</p></div>' +
        '<div class="nv-menu">' +
          chips('Categoria', Object.keys(CLASSES).filter(function (k) { return !CLASSES[k].oculta; }).map(function (k) { return ['classe', k, CLASSES[k].nome]; }), cfg.classe) +
          (function () { var Cc = CLASSES[classeJog()]; return '<p class="nv-rec">' + esc(Cc.nome) + ': ' + Cc.massa + ' kg · ' + Math.round(Cc.kw * 1.36).toLocaleString('pt-BR') + ' cv · máx. ' + Math.round(Cc.vmax * 3.6) + ' km/h · freia de 200 a 0 em ' + Math.round(distFreio(Cc)) + ' m</p>'; })() +
          (cfg.classe === 'wec' ? chips('Sua classe', [['wecCls', 'hyper', 'Hypercar'], ['wecCls', 'gt3', 'GT3']], classeJog()) +
            '<p class="nv-rec">No WEC, 6 Hypercars e 6 GT3 correm juntos. O Hypercar é mais rápido; no GT3 você é ultrapassado e briga dentro da sua classe.</p>' : '') +
          '<div class="nv-op"><span>Pista</span><select class="nv-sel" id="nv-pista">' + pistasDaClasse().map(function (id) { return '<option value="' + id + '"' + (id === cfg.pista ? ' selected' : '') + '>' + esc(PISTAS[id]) + '</option>'; }).join('') + '</select></div>' +
          chips('Voltas', [['voltas', 1, '1'], ['voltas', 2, '2'], ['voltas', 3, '3'], ['voltas', 5, '5'], ['voltas', 8, '8']], cfg.voltas) +
          chips('Adversários', Object.keys(NIVEIS).map(function (k) { return ['nivel', k, NIVEIS[k].nome]; }), cfg.nivel) +
          ((VARIANTES[classeJog()] || []).length > 1 ? chips('Seu carro', VARIANTES[classeJog()].map(function (m) { return ['carro', m, NOME_CARRO[m]]; }), carroJog()) : '') +
          chips('Cor', Object.keys(CORES_CARRO).map(function (k) { return ['cor', k, CORES_CARRO[k][2]]; }), CORES_CARRO[cfg.cor] ? cfg.cor : 'preto') +
          chips('Acelerar sozinho', [['auto', true, 'Sim'], ['auto', false, 'Não']], cfg.auto) +
          chips('Câmbio', [['cambio', 'auto', 'Automático'], ['cambio', 'manual', toque ? 'Manual (− e +)' : 'Manual (Q e E)']], cfg.cambio === 'manual' ? 'manual' : 'auto') +
          chips('Câmera', [['cam', 0, 'Atrás'], ['cam', 1, 'Alta'], ['cam', 2, cfg.classe === 'f1' ? 'Atrás do capacete' : 'Primeira pessoa']].concat(cfg.classe === 'f1' ? [['cam', 3, 'Cockpit']] : []), cfg.classe === 'f1' ? ler('corrida-cam', 0) : Math.min(2, ler('corrida-cam', 0))) +
          chips('Horário', [['hora', 'tarde', 'Fim de tarde'], ['hora', 'dia', 'Dia']], cfg.hora || 'tarde') +
          chips('Gráfico', [['grafico', 'alto', 'Bonito'], ['grafico', 'medio', 'Médio'], ['grafico', 'leve', 'Leve (celular fraco)']], cfg.grafico || (toque ? 'medio' : 'alto')) +
          '<div class="nv-acoes"><button type="button" class="nv-correr" id="nv-correr">Correr</button>' +
          '<p class="nv-rec">Seu recorde: <b>' + (rec ? tempo(rec) : 'sem volta ainda') + '</b> · ' + esc(nomeJog()) + ' em ' + esc(PISTAS[cfg.pista]) + '</p></div>' +
        '</div>' + CREDITOS;
      [].forEach.call(el.querySelectorAll('.nv-chip'), function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
          if (k === 'cam') { guardar('corrida-cam', +v); menu(); return; }
          if (k === 'carro') { cfg.carros = cfg.carros || {}; cfg.carros[classeJog()] = v; guardar('corrida-cfg', cfg); menu(); return; }
          cfg[k] = k === 'voltas' ? +v : k === 'auto' ? v === 'true' : v; guardar('corrida-cfg', cfg); menu();
        });
      });
      el.querySelector('#nv-pista').addEventListener('change', function (e) { cfg.pista = e.target.value; guardar('corrida-cfg', cfg); menu(); });
      el.querySelector('#nv-correr').addEventListener('click', function () {
        if (toque) pedirTelaCheia(); /* no celular a corrida já abre em tela cheia (tem que ser aqui, no clique) */
        var bt = this; bt.disabled = true; bt.textContent = 'Carregando…';
        carregarThree(function () {
          bt.textContent = 'Carregando pista…';
          /* se a pessoa trocar a categoria enquanto carrega, carrega também os carros da nova antes de largar */
          (function largar() {
            var precisa = modelosCorrida(), pista = cfg.pista;
            carregarPista(pista, function () {
              bt.textContent = 'Carregando carros…';
              carregarModelos(precisa, function () {
                var agora = modelosCorrida();
                if (agora.join() === precisa.join() && pista === cfg.pista) iniciar(); else largar();
              }, function (p) { bt.textContent = 'Carregando carros… ' + p + '%'; });
            }, function () { bt.disabled = false; bt.textContent = 'Correr'; alert('Não foi possível carregar a pista. Confira a internet e tente de novo.'); });
          })();
        }, function () { bt.disabled = false; bt.textContent = 'Correr'; alert('Não foi possível carregar o 3D. Confira a internet e tente de novo.'); });
      });
    }

    function parar() {
      if (raf) { cancelAnimationFrame(raf); clearTimeout(raf); } raf = 0; clearTimeout(vigia);
      document.documentElement.classList.remove('nv-jogando');
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
      if (jogo) {
        jogo.motor.parar();
        window.removeEventListener('keydown', jogo.kd); window.removeEventListener('keyup', jogo.ku);
        if (jogo.ro) jogo.ro.disconnect();
        try { jogo.renderer.dispose(); jogo.renderer.forceContextLoss(); jogo.scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); } catch (e) {}
        jogo = null; MATS = {};
      }
    }

    function iniciar() {
      parar();
      var multi = cfg.classe === 'wec', kJ = classeJog(), C = CLASSES[kJ], MEDIDORES = ['pneu'].concat(C.ers ? ['turbo'] : []).concat(C.comb ? ['comb'] : []), T = montarPista(cfg.pista), VEL = perfilVel(T, C);
      var VELS = {}; VELS[kJ] = VEL;
      el.innerHTML = '<div class="nv-jogo" id="nv-jogo"><canvas class="nv-tela" id="nv-tela"></canvas><div class="nv-hud">' +
        /* esquerda: tempo da volta, volta/melhor e a torre de posições com as diferenças */
        '<div class="nv-torre"><div class="nv-t-tempo"><b id="nv-atual">0:00.000</b><span>VOLTA <em id="nv-volta">1</em>/' + cfg.voltas + '</span><span>MELHOR <em id="nv-melhor">--:--.---</em></span><b id="nv-pos" hidden>-</b></div>' +
          (multi ? '<p class="nv-t-cls">' + C.nome.toUpperCase() + '</p>' : '') + '<ol class="nv-tabela" id="nv-tabela"></ol></div>' +
        /* direita: câmera e configurações (pequenos) e os setores */
        '<div class="nv-dir-topo"><div class="nv-bts2"><button type="button" data-a="cam" title="Trocar câmera (C)" aria-label="Trocar câmera">' + ICONES.cam + '</button><button type="button" data-a="config" title="Configurações (P)" aria-label="Configurações">' + ICONES.engrenagem + '</button></div>' +
          '<dl class="nv-setores"><div><dt>S1</dt><dd id="nv-s1">-</dd></div><div><dt>S2</dt><dd id="nv-s2">-</dd></div><div><dt>S3</dt><dd id="nv-s3">-</dd></div></dl></div>' +
        '<div class="nv-centro" id="nv-centro"></div><div class="nv-aviso" id="nv-aviso"></div>' +
        '<div class="nv-medidores">' + MEDIDORES.map(function (m) {
          return '<div class="nv-med nv-med-' + m + '" title="' + { pneu: 'Pneus', turbo: 'Bateria', comb: 'Gasolina' }[m] + '"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" class="nv-fundo"/><circle cx="20" cy="20" r="17" class="nv-arco" id="nv-m-' + m + '"/></svg>' +
            '<i>' + { carro: '♥', pneu: '◎', turbo: '⚡', comb: '⛽' }[m] + '</i><b id="nv-v-' + m + '">100</b></div>';
        }).join('') + '</div>' +
        '<div class="nv-vel"><div class="nv-leds" id="nv-leds">' + new Array(13).join('<i></i>') + '</div>' +
          '<div class="nv-vel-meio"><span class="nv-marcha" id="nv-marcha">N</span><div class="nv-km"><b id="nv-km">0</b><small>KM/H</small></div></div>' +
          '<div class="nv-rpm"><span id="nv-rpm">0</span> rpm</div><div class="nv-ped"><i><s id="nv-p-acel"></s></i><i><s id="nv-p-freio"></s></i></div></div>' +
        '<div class="nv-band-am" id="nv-amarela"><i></i><span>AMARELA</span></div><div class="nv-azul" id="nv-azul" title="Bandeira azul: Hypercar chegando"><i></i><span>HYPERCAR</span></div><div class="nv-sc" id="nv-sc"></div><div class="nv-gpu" id="nv-gpu" hidden></div>' +
        '<canvas class="nv-mapa" id="nv-mapa" width="150" height="150"></canvas>' +
        '<div class="nv-pitbox" id="nv-pitbox"></div>' +
        (toque ? '<p class="nv-girar">Melhor com o celular deitado</p>' : '') +
        (toque ? '<div class="nv-toque">' +
          '<div class="nv-t-esq"><div class="nv-lado"><button type="button" data-c="esq" class="nv-seta" aria-label="Esquerda">' + ICONES.esq + '</button><button type="button" data-c="dir" class="nv-seta" aria-label="Direita">' + ICONES.dir + '</button></div><div class="nv-icones">' +
            (C.ers ? '<button type="button" data-c="turbo" class="nv-ic" aria-label="Bateria">' + ICONES.raio + '</button>' : '') +
          '</div></div>' +
          '<div class="nv-t-dir">' + (cfg.cambio === 'manual' ? '<div class="nv-marchas"><button type="button" data-c="sobe" class="nv-ic nv-mch" aria-label="Subir marcha">+</button><button type="button" data-c="desce" class="nv-ic nv-mch" aria-label="Reduzir marcha">−</button></div>' : '') +
            '<div class="nv-pedais"><button type="button" data-c="freio" class="nv-pedal nv-pedal-freio" aria-label="Freio">' + ICONES.freio + '</button>' +
            '<button type="button" data-c="acel" class="nv-pedal nv-pedal-acel" aria-label="Acelerador">' + ICONES.acel + '</button></div></div>' + /* os dois pedais sempre (com Acelerar sozinho o carro já acelera) */
        '</div>' : '') +
        '<div class="nv-pausa" id="nv-pausa" hidden></div>' +
        '</div></div><p class="nv-dica">' + esc(nomeJog()) + ' · ' + esc(T.nome) + ' · ' + cfg.voltas + (cfg.voltas > 1 ? ' voltas' : ' volta') + ' · <button type="button" class="nv-link" id="nv-sair">Mudar corrida</button></p>';
      var caixaJ = el.querySelector('#nv-jogo'), canvas = el.querySelector('#nv-tela');
      var semGPU = placaDeVideo().soft;
      definirQualidade(semGPU ? 'leve' : cfg.grafico || (toque ? 'medio' : 'alto'));
      if (toque) { Q.mapa = 1024; Q.arvores = Math.round(Q.arvores * 0.7); } /* celular: mesma cara, menos peso */
      var dpr = semGPU ? 0.6 : Math.min(window.devicePixelRatio || 1, Q.nivel === 'alto' ? (toque ? 1.25 : 1.5) : Q.nivel === 'medio' ? 1.1 : 1);
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: Q.nivel !== 'leve' && dpr < 1.4, powerPreference: 'high-performance' });
      renderer.setPixelRatio(dpr);
      renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled = Q.sombras; renderer.shadowMap.type = THREE.PCFShadowMap;
      /* sol e céu: fim de tarde (sol baixo, luz dourada) ou dia */
      var tarde = cfg.hora !== 'dia', H = tarde ? { elev: 10, azim: 205, exp: 0.55, sol: 0xffc28a, solI: 3.0, ceu: 0xa9c6ff, chaoH: 0x6b5a42, hemi: 0.85, nevoa: 0xe6c8a6 }
        : { elev: 44, azim: 160, exp: 0.5, sol: 0xfff3e2, solI: 2.7, ceu: 0xbad6ff, chaoH: 0x5e6a48, hemi: 1.0, nevoa: 0xcfdeea };
      renderer.toneMappingExposure = H.exp;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.3, 7000);
      var dirSol = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - H.elev), THREE.MathUtils.degToRad(H.azim));
      function ceuNovo() {
        var c = new THREE.Sky(); c.scale.setScalar(6000);
        var U = c.material.uniforms; U.turbidity.value = tarde ? 2.6 : 2; U.rayleigh.value = tarde ? 1.8 : 1.1; U.mieCoefficient.value = 0.004; U.mieDirectionalG.value = 0.82; U.sunPosition.value.copy(dirSol);
        return c;
      }
      if (THREE.Sky) {
        scene.add(ceuNovo());
        if (Q.pbr) { var pm = new THREE.PMREMGenerator(renderer), so = new THREE.Scene(); so.add(ceuNovo()); scene.environment = pm.fromScene(so).texture; pm.dispose(); }
      } else scene.background = corL(H.nevoa);
      scene.fog = new THREE.Fog(corL(H.nevoa), 600, 3400);
      scene.add(new THREE.HemisphereLight(corL(H.ceu), corL(H.chaoH), H.hemi * (Q.pbr ? 1 : 2.4)));
      var sol = new THREE.DirectionalLight(corL(H.sol), H.solI); scene.add(sol); scene.add(sol.target);
      if (Q.sombras) {
        sol.castShadow = true; sol.shadow.mapSize.set(Q.mapa, Q.mapa); 
        var sc = sol.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 10; sc.far = 800;
        sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.04;
      }
      var brilhoSol = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaBrilho(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
      brilhoSol.scale.set(tarde ? 1400 : 900, tarde ? 1400 : 900, 1); scene.add(brilhoSol);
      SOMBRA = SOMBRA || texturaSombra();
      var dist = montarCenario(scene, T);

      /* carros: 12 no grid, você larga em 8º */
      var cab = null, mkJ = '', painelT = 0, ajustes = ler('corrida-camaj', {}), POS_JOG = multi ? (kJ === 'hyper' ? 4 : 9) : 7, carros = [], nv = NIVEIS[cfg.nivel], nomes = NOMES.slice().sort(function () { return Math.random() - 0.5; });
      for (var i = 0; i < 12; i++) {
        var eu = i === POS_JOG, base, det, capa, kc = multi ? (i < 6 ? 'hyper' : 'gt3') : kJ, cc = CLASSES[kc];
        if (eu) { var cj = CORES_CARRO[cfg.cor] || CORES_CARRO.preto; base = cj[0] === null ? COR_OURO : cj[0]; det = cj[1]; capa = cj[1] === 0x141414 ? 0xe3343c : cj[1]; }
        else { var ip = (i * 5 + (kc === 'porsche' ? 2 : 0)) % PALETA_IA.length, pi = PALETA_IA[ip], cjj = CORES_CARRO[cfg.cor] || CORES_CARRO.preto; if (pi[0] === cjj[0]) pi = PALETA_IA[(ip + 1) % PALETA_IA.length]; /* nunca da mesma cor que você */ base = pi[0]; det = pi[1]; capa = [0xf5c518, 0x2d6cdf, 0xf2f2f2, 0x1f9d55][i % 4]; } /* cada rival de uma cor */
        var num = eu ? 27 : [3, 5, 7, 11, 14, 16, 22, 31, 44, 63, 81, 88][i];
        if (multi && kc === 'gt3' && !eu) det = 0xff8a00; /* GT3 com detalhe laranja, como no WEC */
        var vs = VARIANTES[kc] || [kc], mk = eu ? carroJog() : vs[i % vs.length];
        if (eu) mkJ = mk;
        var molde = MOLDES[mk], m = molde && molde !== 'falhou' ? montarCarroModelo(molde, base, det, num, capa) : montarCarro(cc.tipo, base, det, num, capa);
        m.grupo.scale.setScalar(cc.esc * ((MODELOS[mk] && MODELOS[mk].esc) || 1)); scene.add(m.grupo); /* esc do modelo: acerta o tamanho real */
        if (Q.sombras) {
          var sg = molde && molde !== 'falhou' ? sombraDe(molde) : null;
          if (sg) { var px = new THREE.Mesh(sg, MAT_SOMBRA || (MAT_SOMBRA = new THREE.MeshBasicMaterial())); px.castShadow = true; px.layers.set(1); px.userData.sombra = true; m.grupo.add(px); } /* só aparece no cálculo da sombra (camada 1) */
          else m.grupo.traverse(function (o) { if (o.isMesh && !(o.material && o.material.transparent)) o.castShadow = true; });
        }
        var mc = MOLDES['cab:' + mk];
        if (eu && mc && mc !== 'falhou' && mc.volante) { cab = montarCabine(mc, base, det, capa, MODELOS[mk]); cab.grupo.visible = false; m.grupo.add(cab.grupo); }
        var sGrid = multi && i >= 6 ? Math.max(450, T.L * 0.12) - (14 + (i - 6) * 9) : -(14 + i * 9), lado = i % 2 ? 2.6 : -2.6;
        carros.push({ eu: eu, nome: eu ? 'Você' : nomes[i > POS_JOG ? i - 1 : i], num: num, m: m, s: (sGrid + T.L) % T.L, d: lado, v: 0, dist: sGrid,
          habil: eu ? 1 : lerp(nv.habil[0], nv.habil[1], Math.random()), lado: (Math.random() - 0.5) * 1.6, alvoD: lado, ultr: 0, agr: Math.random(), lf: 1, lo: 0, dentro: 0, trocaL: 0, defT: 0, voltas: multi && kc === 'gt3' ? 0 : 1, /* GT3 do WEC largam à frente: a 1ª passagem pela linha só abre a volta 1 */ meio: false, fim: 0,
          x: 0, z: 0, th: 0, idx: 0, vy: 0, k: kc, C: cc, cor: det, corBase: base, VEL: VELS[kc] || (VELS[kc] = perfilVel(T, cc)) });
      }
      var J = carros[POS_JOG], manual = cfg.cambio === 'manual'; J.marcha = 1;
      /* safety car: entra depois de uma batida forte sua, ou (corridas de 3+ voltas) às vezes no meio da prova; fica 1 volta na frente do líder */
      var SC = MOLDES.sc && MOLDES.sc !== 'falhou' ? montarSafetyCar(MOLDES.sc) : null, scPlano = cfg.voltas >= 3 && Math.random() < 0.45 ? T.L * (1.3 + Math.random() * (cfg.voltas - 2.3)) : 0;
      if (SC) { scene.add(SC.grupo); SC.s = 0; SC.d = 0; SC.v = 0; SC.dist = 0; SC.x = 0; SC.z = 0; SC.idx = 0; SC.th = 0; SC.sc = true; }
      var espelho = null, camTras = null, quadroN = 0, alvoTras = new THREE.Vector3();
      renderer.shadowMap.autoUpdate = false; /* a sombra é calculada uma vez por quadro (o retrovisor reaproveita) */
      if (cab && cab.espelhos.length && Q.nivel !== 'leve') {
        espelho = new THREE.WebGLRenderTarget(toque ? 256 : 384, toque ? 96 : 128, { generateMipmaps: false }); camTras = new THREE.PerspectiveCamera(24, 3, 2.2, 180);
        cab.espelhos.forEach(function (m) { m.material.map = espelho.texture; m.material.color.set(0xffffff); m.material.needsUpdate = true; });
      }
      function posMundo(c) {
        var i = Math.floor(c.s / T.ds) % T.N, f = c.s / T.ds - Math.floor(c.s / T.ds), j = (i + 1) % T.N;
        var x = lerp(T.x[i], T.x[j], f), z = lerp(T.z[i], T.z[j], f), nx = lerp(T.nx[i], T.nx[j], f), nz = lerp(T.nz[i], T.nz[j], f);
        c.x = x + nx * c.d; c.z = z + nz * c.d; c.idx = i;
        var da = T.ang[j] - T.ang[i]; da = ((da + 3 * Math.PI) % (2 * Math.PI)) - Math.PI; c.ang = T.ang[i] + da * f; /* rumo da pista entre dois pontos */
      }
      function alturaS(s) { s = ((s % T.L) + T.L) % T.L; var i = Math.floor(s / T.ds) % T.N, f = s / T.ds - Math.floor(s / T.ds); return lerp(T.y[i], T.y[(i + 1) % T.N], f); }
      function virar(c, alvo, dt, k) { var d = ((alvo - c.th + 3 * Math.PI) % (2 * Math.PI)) - Math.PI; c.th += d * Math.min(1, dt * (k || 10)); }
      carros.forEach(function (c) { posMundo(c); c.th = T.ang[c.idx]; });

      var cmd = { esq: false, dir: false, acel: false, freio: false, turbo: false, vol: null }; /* vol: volante da tela (−1 a 1); null = teclado */
      var est = { fase: 'luzes', t: 0, corrida: 0, volta: 0, melhor: 0, ultima: 0, camModo: Math.min(C.tipo === 'formula' ? 3 : 2, ler('corrida-cam', 0)), pausa: false, dano: 100, pneu: 100, turbo: 100,
        st: 0, contramao: 0, batida: 0, tranco: 0, setores: [null, null, null], setCor: ['', '', ''], setMelhor: [0, 0, 0], setK: 0, setIni: 0, chegou: false, aviso: '', avisoT: 0, azul: 0, comb: 100, boxPedido: false, alertaT: 0 };
      var B = T.box, CONS = 100 / (3.2 * T.L), DESG = 100 / (4.5 * T.L); /* gasolina: tanque de ~3 voltas; pneus: ~4,5 voltas */
      var equipes = montarBoxes(scene, T, carros), pitTxt = '';
      carros.forEach(function (c, i) { c.vaga = i; c.pneu = 100; c.comb = 100; c.querBox = false; c.pit = null; c.vac = 0; });
      var motor = Motor(); motor.ligar();
      var mapa = el.querySelector('#nv-mapa'), mctx = mapa.getContext('2d'), fundoMapa = document.createElement('canvas');
      (function () {
        fundoMapa.width = fundoMapa.height = 150;
        var g = fundoMapa.getContext('2d'), esc2 = 120 / (T.raio * 2);
        g.lineJoin = 'round'; g.lineCap = 'round';
        function tr(lw, cor) { g.strokeStyle = cor; g.lineWidth = lw; g.beginPath(); for (var q = 0; q <= T.N; q += 3) { var k = q % T.N, x = 75 + (T.x[k] - T.cx) * esc2, y = 75 + (T.z[k] - T.cz) * esc2; if (q) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.stroke(); }
        tr(7, 'rgba(0,0,0,.55)'); tr(3.5, '#f4f4f4');
        mapa.esc = esc2;
      })();

      function avisoGPU(lento) {
        var g = el.querySelector('#nv-gpu'); if (!g || !g.hidden) return;
        g.innerHTML = semGPU || !lento ? '<b>O jogo está lento porque o navegador está sem aceleração de vídeo.</b><br>Chrome: Configurações › Sistema › ligue <b>“Usar aceleração de gráficos quando disponível”</b> e clique em Reiniciar. (No Edge: “Usar a aceleração de hardware quando disponível”.) (toque para fechar)'
          : '<b>O jogo está pesado para este aparelho agora.</b><br>Feche outras abas e programas. Se continuar, confira se o navegador está com a <b>aceleração de hardware</b> ligada (Configurações › Sistema). (toque para fechar)';
        g.hidden = false; g.onclick = function () { g.hidden = true; };
      }
      if (semGPU) setTimeout(avisoGPU, 1500);
      var kd = function (e) {
        var k = e.key.toLowerCase(), uso = true; motor.retomar();
        if (k === 'arrowleft' || k === 'a') cmd.esq = true; else if (k === 'arrowright' || k === 'd') cmd.dir = true;
        else if (k === 'arrowup' || k === 'w') cmd.acel = true; else if (k === 'arrowdown' || k === 's') cmd.freio = true;
        else if (k === ' ' || k === 'shift') cmd.turbo = true; else if (k === 'q') trocarMarcha(1); else if (k === 'e') trocarMarcha(-1); else if (k === 'c') trocarCam(); else if (k === 'b') chamarBox(); else if (k === 'p' || k === 'escape') pausar(); else if (k === 'r') voltarPista();
        else uso = false;
        if (uso && el.offsetParent) e.preventDefault();
      };
      var ku = function (e) {
        var k = e.key.toLowerCase();
        if (k === 'arrowleft' || k === 'a') cmd.esq = false; else if (k === 'arrowright' || k === 'd') cmd.dir = false;
        else if (k === 'arrowup' || k === 'w') cmd.acel = false; else if (k === 'arrowdown' || k === 's') cmd.freio = false;
        else if (k === ' ' || k === 'shift') cmd.turbo = false;
      };
      window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
      [].forEach.call(el.querySelectorAll('.nv-toque button'), function (b) {
        var c = b.getAttribute('data-c');
        b.addEventListener('pointerdown', function (e) {
          e.preventDefault(); motor.retomar(); try { b.setPointerCapture(e.pointerId); } catch (er) {}
          if (c === 'sobe' || c === 'desce') trocarMarcha(c === 'sobe' ? 1 : -1); else if (c === 'cam') trocarCam(); else if (c === 'box') chamarBox(); else cmd[c] = true;
          b.classList.add('ativo'); if (navigator.vibrate && (c === 'sobe' || c === 'desce')) try { navigator.vibrate(12); } catch (er) {}
        });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { b.addEventListener(ev, function () { if (c in cmd) cmd[c] = false; if (c !== 'box') b.classList.remove('ativo'); }); });
        b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      });
      (function () {
        var vol = el.querySelector('#nv-volante'); if (!vol) return;
        var MAX = 2.0, rot = 0, a0 = 0, r0 = 0, dedo = null, svg = vol.querySelector('svg'); /* gira até 115° para cada lado */
        /* arrastar o dedo para os lados vira o volante (pelo ângulo do dedo ele trocava de lado sozinho quando o dedo passava perto do centro) */
        var x0 = 0;
        function mostrar() { svg.style.transform = 'rotate(' + rot + 'rad)'; cmd.vol = dedo === null ? null : Math.max(-1, Math.min(1, rot / MAX)); }
        vol.addEventListener('pointerdown', function (e) { e.preventDefault(); motor.retomar(); if (dedo !== null) return; dedo = e.pointerId; try { vol.setPointerCapture(dedo); } catch (er) {} x0 = e.clientX; rot = 0; vol.classList.add('ativo'); svg.style.transition = 'none'; mostrar(); });
        vol.addEventListener('pointermove', function (e) {
          if (e.pointerId !== dedo) return; var w = vol.getBoundingClientRect().width;
          rot = Math.max(-MAX, Math.min(MAX, (e.clientX - x0) / (w * 0.55) * MAX)); /* meio volante de arrasto = volante todo virado */
          mostrar();
        });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { vol.addEventListener(ev, function (e) { if (e.pointerId !== dedo) return; dedo = null; rot = 0; svg.style.transition = 'transform .18s ease-out'; mostrar(); vol.classList.remove('ativo'); }); });
        vol.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      })();
      [].forEach.call(el.querySelectorAll('.nv-bts2 button'), function (b) {
        b.addEventListener('click', function () {
          var a = b.getAttribute('data-a');
          if (a === 'pausa' || a === 'config') pausar(); else if (a === 'cam') trocarCam(); else if (a === 'box') chamarBox();
          else if (a === 'som') { b.textContent = motor.trocar() ? '🔊' : '🔈'; }
          else if (a === 'tela') telaCheia(); else if (a === 'sair') { sairTelaCheia(); menu(); }
        });
      });
      el.querySelector('#nv-sair').addEventListener('click', menu);
      function trocarCam() { est.camModo = (est.camModo + 1) % (C.tipo === 'formula' ? 4 : 3); /* F1 tem a 4ª: Cockpit (olho do piloto) */ guardar('corrida-cam', est.camModo); }
      function cheio(sim) { caixaJ.classList.toggle('nv-cheio', sim); document.documentElement.classList.toggle('nv-jogando', sim); setTimeout(ajustar, 50); }
      function telaCheia() {
        var entrar = !caixaJ.classList.contains('nv-cheio') || (!emTelaCheia() && !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen));
        cheio(entrar); if (entrar) pedirTelaCheia(); else sairTelaCheia();
      }
      if (toque) cheio(true);
      function pausar(forcar) {
        if (est.fase === 'fim') return;
        est.pausa = forcar !== undefined ? forcar : !est.pausa;
        var p = el.querySelector('#nv-pausa'); p.hidden = !est.pausa;
        if (est.pausa) {
          p.classList.remove('nv-ajuste');
          p.innerHTML = '<div class="nv-caixa"><h3>Configurações</h3><button type="button" class="nv-correr" data-p="voltar">Continuar</button>' +
            '<button type="button" class="nv-sec" data-p="camera">Ajustar câmera</button><button type="button" class="nv-sec" data-p="box">' + (est.boxPedido ? 'Cancelar o box' : 'Chamar o box (B)') + '</button>' +
            '<button type="button" class="nv-sec" data-p="som">Som: ' + (ler('corrida-som', true) ? 'ligado' : 'desligado') + '</button><button type="button" class="nv-sec" data-p="tela">Tela cheia</button>' +
            '<button type="button" class="nv-sec" data-p="reiniciar">Reiniciar</button><button type="button" class="nv-sec" data-p="sair">Mudar corrida</button></div>';
          p.querySelector('[data-p="box"]').onclick = function () { chamarBox(); this.textContent = est.boxPedido ? 'Cancelar o box' : 'Chamar o box (B)'; };
          p.querySelector('[data-p="som"]').onclick = function () { this.textContent = 'Som: ' + (motor.trocar() ? 'ligado' : 'desligado'); };
          p.querySelector('[data-p="tela"]').onclick = function () { telaCheia(); };
          p.querySelector('[data-p="camera"]').onclick = ajustarCamera;
          p.querySelector('[data-p="voltar"]').onclick = function () { pausar(false); };
          p.querySelector('[data-p="reiniciar"]').onclick = iniciar;
          p.querySelector('[data-p="sair"]').onclick = function () { sairTelaCheia(); menu(); };
        }
      }
      function voltarPista() {
        if (est.fase !== 'corrida' || J.pit) return;
        J.d = 0; J.v = Math.min(J.v, 12); posMundo(J); J.th = T.ang[J.idx]; aviso('De volta à pista');
      }
      function aviso(t) { est.aviso = t; est.avisoT = 1.6; }
      function aj() { var k = mkJ + '|' + est.camModo; var A = ajustes[k] || (ajustes[k] = { f: 0, a: 0, z: 0 }); if (A.i == null) A.i = 0; return A; }
      /* painel para a pessoa ajeitar a câmera (fica por cima do jogo pausado, que continua desenhando) */
      function ajustarCamera() {
        var p = el.querySelector('#nv-pausa'), dentro = est.camModo >= 2;
        var passoF = dentro ? 0.04 : 0.4, passoA = dentro ? 0.03 : 0.3, limF = dentro ? 0.6 : 4, limA = dentro ? 0.4 : 3;
        function linha(rot, k) { return '<div class="nv-aj-linha"><span>' + rot + '</span><button type="button" class="nv-aj-bt" data-aj="' + k + '" data-s="-1">−</button><b data-v="' + k + '"></b><button type="button" class="nv-aj-bt" data-aj="' + k + '" data-s="1">+</button></div>'; }
        p.classList.add('nv-ajuste');
        p.innerHTML = '<div class="nv-caixa nv-aj"><p class="nv-rot">Ajustar câmera · ' + ['Atrás', 'Alta', C.tipo === 'formula' ? 'Atrás do capacete' : 'Primeira pessoa', 'Cockpit'][est.camModo] + '</p>' +
          linha('Mais para frente', 'f') + linha('Altura', 'a') + linha('Inclinação', 'i') + linha('Zoom', 'z') +
          '<div class="nv-fim-bts"><button type="button" class="nv-sec" data-p="trocar">Trocar câmera</button><button type="button" class="nv-sec" data-p="zerar">Restaurar</button><button type="button" class="nv-correr" data-p="pronto">Pronto</button></div></div>';
        function mostrar() {
          var A = aj(), u = function (v) { return (v > 0 ? '+' : '') + (dentro ? Math.round(v * 100) + ' cm' : v.toFixed(1).replace('.', ',') + ' m'); };
          p.querySelector('[data-v="f"]').textContent = u(A.f); p.querySelector('[data-v="a"]').textContent = u(A.a);
          p.querySelector('[data-v="i"]').textContent = (A.i > 0 ? '+' : '') + A.i + '°';
          p.querySelector('[data-v="z"]').textContent = (A.z < 0 ? '+' : A.z > 0 ? '−' : '') + Math.abs(A.z);
        }
        [].forEach.call(p.querySelectorAll('[data-aj]'), function (b) {
          b.onclick = function () {
            var A = aj(), k = b.getAttribute('data-aj'), sn = +b.getAttribute('data-s');
            if (k === 'f') A.f = limitar(A.f + sn * passoF, -limF, limF);
            else if (k === 'a') A.a = limitar(A.a + sn * passoA, -limA, limA);
            else if (k === 'i') A.i = limitar(A.i + sn * 2, -24, 24); /* + inclina para cima */
            else A.z = limitar(A.z - sn * 3, -21, 21); /* + aproxima (campo de visão menor) */
            guardar('corrida-camaj', ajustes); mostrar();
          };
        });
        p.querySelector('[data-p="trocar"]').onclick = function () { trocarCam(); ajustarCamera(); };
        p.querySelector('[data-p="zerar"]').onclick = function () { delete ajustes[mkJ + '|' + est.camModo]; guardar('corrida-camaj', ajustes); mostrar(); };
        p.querySelector('[data-p="pronto"]').onclick = function () { p.classList.remove('nv-ajuste'); pausar(false); };
        mostrar();
      }

      /* posição do jogador na pista (s e d) a partir de x e z */
      function projetar(c, larga) {
        var N = T.N, best = Infinity, bi = c.idx, R = larga ? N : 60;
        for (var o = -R; o <= R; o++) {
          var i = ((c.idx + o) % N + N) % N, dx = c.x - T.x[i], dz = c.z - T.z[i], d2 = dx * dx + dz * dz;
          if (d2 < best) { best = d2; bi = i; }
        }
        var dx2 = c.x - T.x[bi], dz2 = c.z - T.z[bi], ao = dx2 * T.tx[bi] + dz2 * T.tz[bi];
        var sNovo = ((bi * T.ds + ao) % T.L + T.L) % T.L, delta = sNovo - c.s;
        if (delta > T.L / 2) delta -= T.L; else if (delta < -T.L / 2) delta += T.L;
        c.idx = bi; c.d = dx2 * T.nx[bi] + dz2 * T.nz[bi];
        return { s: sNovo, delta: delta };
      }
      function acelerar(c, Cc, v, mult) { return acelC(Cc, v, mult, c.vac); }
      /* vácuo: logo atrás de outro carro (até 45 m, quase na mesma linha) o ar fica mais leve */
      function calcVacuo() {
        carros.forEach(function (c) {
          var melhor = 0;
          if (!c.pit && c.v > 20) carros.forEach(function (o) {
            if (o === c || o.pit || o.fora || o.v < 15) return;
            var gap = gapS(o, c);
            if (gap < 3 || gap > 45 || Math.abs(o.d - c.d) > 1.7) return;
            melhor = Math.max(melhor, gap < 8 ? 1 : 1 - (gap - 8) / 37);
          });
          c.vac += (melhor - (c.vac || 0)) * 0.08; /* entra e sai aos poucos */
        });
      }
      /* setor: a volta dividida em 3 partes iguais a partir da linha de chegada */
      function fecharSetor(k) {
        var t = est.corrida - est.setIni; est.setores[k] = t; est.setIni = est.corrida;
        var melhor = !est.setMelhor[k] || t <= est.setMelhor[k]; est.setCor[k] = melhor ? 'melhor' : 'pior'; if (melhor) est.setMelhor[k] = t;
      }
      function passoSetores() {
        if (est.fase !== 'corrida') return;
        var k = Math.min(2, Math.floor(J.s / (T.L / 3)));
        if (k === est.setK + 1) { fecharSetor(est.setK); est.setK = k; }
      }
      function contarVolta(c, sAntes, sDepois) {
        if (sDepois > T.L * 0.4 && sDepois < T.L * 0.6) c.meio = true;
        if (sAntes > T.L * 0.8 && sDepois < T.L * 0.2 && c.meio) {
          c.meio = false; c.voltas++;
          if (c.eu) {
            if (est.setK === 2) fecharSetor(2); est.setUlt = est.setores.slice(); est.setores = [null, null, null]; est.setK = 0; est.setIni = est.corrida; /* nova volta: setores zerados */
            var tv = est.corrida - est.volta; est.ultima = tv; est.volta = est.corrida;
            if (c.voltas >= 2) {
              if (!est.melhor || tv < est.melhor) { est.melhor = tv; aviso('Melhor volta ' + tempo(tv)); }
              var chave = chaveRec();
              if (!recordes[chave] || tv < recordes[chave]) { recordes[chave] = tv; guardar('corrida-recordes', recordes); aviso('Recorde! ' + tempo(tv)); }
            }
            if (c.voltas > cfg.voltas) terminar();
          } else if (c.voltas > cfg.voltas && !c.fim) c.fim = est.corrida;
        }
      }

      /* rodada: o carro gira 360° derrapando e perde velocidade (o jogador fica sem controle por um instante) */
      function rodar(c, lado) { c.rod = { t: 0, dur: 1.5 + Math.random() * 0.6, sent: lado || (Math.random() < 0.5 ? 1 : -1), ang: 0 }; if (c.eu) aviso('Rodou!'); }
      function amarela(c, motivo) {
        if (est.sc && est.sc.fase !== 'fim') return; /* com safety car na pista já está tudo neutralizado */
        est.amarela = { t: 10, s: c.s };
      }
      /* trecho de bandeira amarela: de 400 m antes até 100 m depois do lugar da batida */
      function naAmarela(c) { if (!est.amarela || est.amarela.t <= 0) return false; var g = ((est.amarela.s - c.s) % T.L + T.L) % T.L; return g < 400 || g > T.L - 100; }
      function batidaForte(atras, frente, imp) {
        atras.batT = frente.batT = 1.2; /* não conta a mesma batida duas vezes */
        faiscas((atras.x + frente.x) / 2, T.y[frente.idx] + 0.35, (atras.z + frente.z) / 2, 34, true);
        rodar(frente); atras.v *= 0.7;
        if (atras.eu || frente.eu) { est.dano = Math.max(0, est.dano - Math.min(35, imp * 1.8)); est.tranco = 1; aviso(atras.eu ? 'Você bateu no carro da frente!' : 'Bateram em você!'); }
        if (imp > 15 && !frente.eu) { frente.fora = 'vai'; } /* batida muito forte: o carro da frente abandona */
        if (imp > 15 && !atras.eu && Math.random() < 0.5) { rodar(atras); atras.fora = 'vai'; }
        acionarSC('acidente entre ' + (atras.eu ? 'você' : '#' + atras.num) + ' e ' + (frente.eu ? 'você' : '#' + frente.num));
      }
      /* faíscas e pedaços de carbono (um só objeto de pontos, reaproveitado) */
      var NF = 90, fPos = new Float32Array(NF * 3), fVel = new Float32Array(NF * 3), fVida = new Float32Array(NF), fCor = new Float32Array(NF * 3), fProx = 0;
      var fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3)); fGeo.setAttribute('color', new THREE.BufferAttribute(fCor, 3));
      var fPontos = new THREE.Points(fGeo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fPontos.frustumCulled = false; scene.add(fPontos);
      for (var fi0 = 0; fi0 < NF; fi0++) fPos[fi0 * 3 + 1] = -999;
      function faiscas(x, y, z, n, pedacos) {
        for (var q = 0; q < n; q++) {
          var k = fProx++ % NF, sp = 3 + Math.random() * 9, a = Math.random() * 6.28;
          fPos[k * 3] = x; fPos[k * 3 + 1] = y; fPos[k * 3 + 2] = z;
          fVel[k * 3] = Math.cos(a) * sp; fVel[k * 3 + 1] = 1.5 + Math.random() * 4; fVel[k * 3 + 2] = Math.sin(a) * sp; fVida[k] = 0.35 + Math.random() * 0.5;
          var peca = pedacos && q % 3 === 0; fCor[k * 3] = peca ? 0.25 : 1; fCor[k * 3 + 1] = peca ? 0.25 : 0.55 + Math.random() * 0.35; fCor[k * 3 + 2] = peca ? 0.27 : 0.15; /* laranja (faísca) ou cinza (carbono) */
        }
      }
      function passoFaiscas(dt) {
        for (var k = 0; k < NF; k++) {
          if (fVida[k] <= 0) continue;
          fVida[k] -= dt; fVel[k * 3 + 1] -= 9.8 * dt;
          fPos[k * 3] += fVel[k * 3] * dt; fPos[k * 3 + 1] += fVel[k * 3 + 1] * dt; fPos[k * 3 + 2] += fVel[k * 3 + 2] * dt;
          if (fVida[k] <= 0) fPos[k * 3 + 1] = -999;
        }
        fGeo.attributes.position.needsUpdate = true; fGeo.attributes.color.needsUpdate = true;
      }
      /* quanto 'a' está à frente de 'b' na pista (negativo = atrás), entre -meia volta e +meia volta.
         Antes usava a quilometragem: quem estava uma volta atrás (ou um GT3 sendo passado por um Hypercar) ficava 'invisível',
         os carros se atravessavam e depois o jogo empurrava um deles de repente (o TP). */
      function gapS(a, b) { var g = ((a.s - b.s) % T.L + T.L) % T.L; return g > T.L / 2 ? g - T.L : g; }
      /* faixa livre para ir de c.d até d (ninguém ao lado, a até 12 m) */
      function faixaLivre(c, d, ignorar) {
        var lo = Math.min(c.d, d) - 2.2, hi = Math.max(c.d, d) + 2.2;
        return !carros.some(function (o) { return o !== c && o !== ignorar && !o.pit && !o.fora && Math.abs(gapS(o, c)) < 12 && o.d > lo && o.d < hi; });
      }
      /* traçado da IA: mistura do traçado ideal com variações; sorteia de novo a cada 200-450 m */
      function linhaIA(c, i, dt) {
        if ((c.trocaL -= c.v * dt) <= 0) {
          c.trocaL = 200 + Math.random() * 250;
          var r = Math.random();
          if (r < 0.4) { c.lf = 1; c.lo = 0; c.dentro = 0; }                                   /* ideal */
          else if (r < 0.6) { c.lf = 0.6; c.lo = 0; c.dentro = 0.55 + c.agr * 0.3; }            /* por dentro (defensivo / mergulho) */
          else if (r < 0.8) { c.lf = 1.15; c.lo = 0; c.dentro = 0; }                            /* aberto, saída rápida */
          else { c.lf = 0.8 + Math.random() * 0.3; c.lo = (Math.random() - 0.5) * 3; c.dentro = 0; } /* deslocado */
        }
        var base = T.linha[i] * c.lf + c.lo + c.lado * 0.5;
        if (c.dentro) { var kf = T.k[(i + Math.round(40 / T.ds)) % T.N]; if (Math.abs(kf) > 1 / 250) base = lerp(base, (kf > 0 ? 1 : -1) * (LARG_PISTA / 2 - 2), c.dentro); }
        return base;
      }
      function trocarMarcha(d) {
        if (!manual) { aviso('Câmbio automático: escolha Manual no menu para trocar com Q / E'); return; }
        var g = J.marcha + d;
        if (g < 1 || g > C.marchas) return;
        if (d < 0 && J.v > vMarcha(C, g) * 1.01) { aviso('Giro alto demais para reduzir: freie mais'); return; } /* proteção do motor */
        J.marcha = g;
      }
      function lider() { return carros.reduce(function (a, b) { return b.dist > a.dist ? b : a; }); }
      function acionarSC(motivo) {
        if (!SC || (est.sc && est.sc.fase !== 'fim') || est.fase !== 'corrida') return; /* pode haver outro safety car depois */
        /* sai do box: começa no fim do pit lane (depois do limite de 80) e entra na pista pela saída dos boxes */
        SC.u = Math.min(B.len - 40, Math.max(B.limFim + 5, B.len - B.R - 10)); /* fica parado no fim do pit lane, como na vida real */ SC.box = true; SC.naPista = false; SC.voltando = false; SC.v = 8; SC.perc = 0; SC.s = (B.ini + SC.u) % T.L; SC.d = B.d(SC.u); SC.grupo.visible = true;
        est.sc = { fase: 'pista', ate: Math.min(T.L * 0.95, 3500), t: 0, busca: true, tb: 0, fdF: T.L }; /* busca: corre até ficar na frente de todo mundo */ /* uma volta (no máximo 3,5 km: em Le Mans seria eterno) */ aviso('SAFETY CAR NA PISTA' + (motivo ? ' · ' + motivo : '') + ': não ultrapasse');
      }
      var SC_V = Math.min(48, C.vmax * 0.5); /* ritmo do safety car */
      /* velocidade máxima de um carro com o safety car: fila indiana atrás do carro (ou do safety car) da frente, a uns 15 m */
      function limiteSC(c) {
        if (SC.naPista) {
          if (est.sc.busca) { if (((c.s - SC.s) % T.L + T.L) % T.L <= est.sc.fdF + 1) return c.C.vmax * 0.35; } /* entre o safety car e a frente do pelotão: devagar, para ele passar */
          else if (gapS(c, SC) > 0) return SC_V * 1.6; /* ficou na frente: dá a volta e entra no fim da fila */
        }
        var gap = 1e9, fv = SC_V;
        carros.concat(SC.naPista ? [SC] : []).forEach(function (o) { if (o === c || o.pit || o.fora || (o.k && o.k !== c.k && c.k === 'hyper')) return; var gd = gapS(o, c); /* Hypercar não fica preso atrás de GT3 */ if (gd > 0 && gd < gap) { gap = gd; fv = o.v; } });
        if (gap > 400) return SC_V * 1.6; /* longe da fila: devagar (bandeira amarela), mas encosta */
        return Math.max(0, fv + (gap - 15) * 0.45);
      }
      function passoSC(dt) {
        if (!SC || ((!est.sc || est.sc.fase === 'fim') && !SC.voltando)) return;
        var i = Math.floor(SC.s / T.ds) % T.N, inc = 0;
        if (SC.box) {
          /* no pit lane (saindo ou voltando): segue o desenho do pit, a 80 km/h perto das garagens */
          var alvoP = SC.u > B.limIni && SC.u < B.limFim ? PIT_LIM : Math.min(VEL[i] * 0.8, SC.voltando || est.sc.fase === 'entrando' ? 24 : 40);
          SC.v += limitar(alvoP - SC.v, -8 * dt, 6 * dt); SC.u += SC.v * dt;
          inc = (B.d(SC.u + 1) - B.d(SC.u)); SC.d = B.d(SC.u); SC.s = (B.ini + SC.u) % T.L;
          /* entrou no pit lane: bandeira verde; ele segue até a garagem e some */
          if (est.sc && est.sc.fase === 'entrando' && SC.u > 35) { est.sc = { fase: 'fim' }; SC.voltando = true; aviso('BANDEIRA VERDE! Relargada'); }
          if (SC.voltando && SC.u >= B.vagas[11] + B.esp) { SC.grupo.visible = false; SC.box = false; SC.voltando = false; return; }
          if (est.sc && est.sc.fase === 'pista' && SC.u >= B.len - 0.5) { SC.box = false; SC.naPista = true; SC.s = (B.ini + B.len) % T.L; } /* entrou na pista */
        } else {
          var uS0 = B.u(SC.s), alvo = est.sc.fase === 'entrando' ? Math.min(VEL[i] * 0.9, C.vmax * 0.8, uS0 > T.L - 300 ? 26 : 99) : est.sc.busca ? Math.min(VEL[i] * 0.97, 85) : Math.min(SC_V, VEL[i] * 0.72);
          SC.v += limitar(alvo - SC.v, -9 * dt, 5 * dt);
          SC.s = (SC.s + SC.v * dt) % T.L; if (!est.sc.busca) SC.perc += SC.v * dt;
          if (est.sc.busca) {
            /* passa os carros que estão na frente (eles vão devagar e abrem espaço); acaba quando não tem ninguém a 1,5 km na frente */
            /* frente do pelotão = carro com o maior espaço vazio na frente; o safety car passa todos até ficar na frente dele */
            est.sc.tb += dt; var gMin = 1e9, fr = null, fds = [];
            carros.forEach(function (o) { if (o.pit || o.fora) return; var fd = ((o.s - SC.s) % T.L + T.L) % T.L; fds.push(fd); if (fd < gMin) { gMin = fd; fr = o; } });
            fds.sort(function (a, b) { return a - b; });
            var gMaior = fds.length ? T.L - fds[fds.length - 1] + fds[0] : 0, fdF = -1; /* gMaior começa com o espaço que tem o safety car no meio */
            for (var q3 = 0; q3 < fds.length - 1; q3++) if (fds[q3 + 1] - fds[q3] > gMaior) { gMaior = fds[q3 + 1] - fds[q3]; fdF = fds[q3]; }
            if (fdF < 0 && fds.length && fds[fds.length - 1] < T.L / 2) fdF = fds[fds.length - 1]; /* pelotão inteiro logo à frente (mais perto na frente do que atrás): vai buscar */
            est.sc.fdF = fdF;
            var alvoD = 0; if (fr && gMin < 50 && Math.abs(fr.d - SC.d) < 3) alvoD = fr.d > 0 ? fr.d - 3.6 : fr.d + 3.6;
            SC.d += limitar(limitar(alvoD, -LARG_PISTA / 2 + 1.3, LARG_PISTA / 2 - 1.3) - SC.d, -4 * dt, 4 * dt);
            if (fdF < 0 || est.sc.tb > 200) { est.sc.busca = false; aviso('Safety car na frente: todos em fila atrás dele'); }
          }
          var uS = B.u(SC.s);
          if (est.sc.fase === 'pista' && SC.perc >= est.sc.ate) { est.sc.fase = 'entrando'; est.sc.longe = T.L - uS > 3000; aviso('Safety car entra nos boxes: prepare a relargada'); }
          if (est.sc.fase === 'entrando') {
            est.sc.t += dt;
            if (uS > T.L - 120) SC.d += (B.lado * (LARG_PISTA / 2 - 1) - SC.d) * Math.min(1, dt * 1.5); /* encosta do lado dos boxes */
            else if (!est.sc.longe) SC.d += (0 - SC.d) * Math.min(1, dt);
            if (uS < 30 && est.sc.t > 1) { SC.box = true; SC.naPista = false; SC.u = uS; } /* entra no pit lane */
            else if (est.sc.longe) { /* box muito longe (Le Mans): sai pela área de escape */
              SC.d += (B.lado * (LARG_PISTA / 2 + 6) - SC.d) * Math.min(1, dt * 1.2);
              if (Math.abs(SC.d) > LARG_PISTA / 2 + 4) { SC.grupo.visible = false; SC.naPista = false; est.sc = { fase: 'fim' }; aviso('BANDEIRA VERDE! Relargada'); return; }
            }
          } else if (!est.sc.busca) SC.d += (0 - SC.d) * Math.min(1, dt * 0.8);
        }
        posMundo(SC); virar(SC, SC.ang + Math.atan(inc), dt);
      }
      function passoJogador(dt) {
        if (J.pit) { passoBox(J, dt); return; }
        var c = J, mult = 1 * (0.86 + 0.14 * est.dano / 100);
        var turbo = C.ers && cmd.turbo && est.turbo > 1 && est.fase === 'corrida'; /* bateria (ERS): só no F1 */
        if (turbo) { mult *= 1.18; est.turbo = Math.max(0, est.turbo - 16 * dt); }
        var fora = Math.abs(c.d) > LARG_PISTA / 2 + 1.3;
        var grip = latC(C, c.v) * (0.78 + 0.22 * est.pneu / 100) * (fora ? 0.55 : 1);
        var acelera = cfg.auto ? !cmd.freio : cmd.acel;
        if (!manual) c.marcha = marchaAuto(C, c.v);
        var vt = vMarcha(C, c.marcha), rpm = c.v / vt;
        mult *= rpm >= 1 ? 0 : Math.min(1, 0.3 + 1.6 * rpm); /* marcha alta demais: o motor fica sem força */
        var a = 0;
        if (est.fase === 'corrida') {
          if (c.rod) a = 0;
          else if (cmd.freio) { a = -freioC(C, c.v) * (c.v > 1 ? 1 : 0) * (0.85 + 0.15 * est.pneu / 100); if (C.ers) est.turbo = Math.min(100, est.turbo + 7 * dt); }
          else if (acelera) a = acelerar(c, C, c.v, mult);
          else a = -arrasto(C, c.v) * (1 - VACUO * c.vac) - 1.5; /* tirando o pé: arrasto e freio-motor */
        }
        a -= 0.00035 * c.v * c.v * (fora ? 3 : 0) + (fora ? 6 : 0);
        if (C.ers && !turbo && !cmd.freio) est.turbo = Math.min(100, est.turbo + 1.5 * dt);
        c.v = Math.max(0, Math.min(C.comb && est.comb <= 0 ? 14 : 200, c.v + a * dt)); /* sem gasolina: anda devagar */
        if (c.v > vt && !c.rod) c.v = Math.max(vt, c.v - 4 * dt); /* corte de giro */
        if (est.sc && est.sc.busca && SC.naPista && !(est.avisoSC > 0)) { var gJ = ((J.s - SC.s) % T.L + T.L) % T.L; if (gJ < 300 && gJ <= est.sc.fdF + 1) { aviso('Safety car vindo atrás: devagar e deixe ele passar'); est.avisoSC = 6; } }
        if (est.avisoSC > 0) est.avisoSC -= dt;
        if (est.sc && est.sc.fase !== 'fim') { var capSC = limiteSC(c); if (c.v > capSC) c.v = Math.max(capSC, c.v - 14 * dt); } /* safety car: não dá para passar a fila */
        /* direção: o volante pede uma curva; a aderência limita */
        if (c.rod) { /* rodada */
          var R0 = c.rod; R0.t += dt; c.v = Math.max(0, c.v - 11 * dt);
          if (R0.dir == null) R0.dir = c.th;
          R0.ang = R0.sent * Math.PI * 2 * Math.min(1, R0.t / R0.dur) * (2 - Math.min(1, R0.t / R0.dur));
          c.th = R0.dir; est.st = 0;
          if (R0.t >= R0.dur) { c.rod = null; c.th = R0.dir; }
        }
        var alvo = c.rod ? 0 : cmd.vol !== null ? cmd.vol : (cmd.dir ? 1 : 0) - (cmd.esq ? 1 : 0);
        est.st += (alvo - est.st) * Math.min(1, dt * (cmd.vol !== null ? 14 : alvo ? 5 : 8)); /* volante da tela responde mais rápido (o dedo já é suave) */
        var rMax = Math.min(1.7, grip / Math.max(c.v, 4)), r = est.st * rMax;
        if (Math.abs(est.st) > 0.85 && c.v > 25) c.v -= 1.5 * dt * Math.abs(est.st);
        if (est.fase === 'corrida' && !c.rod) c.th += r * dt;
        var sAntes = c.s;
        c.x += Math.cos(c.th) * c.v * dt; c.z += Math.sin(c.th) * c.v * dt;
        var p = projetar(c);
        /* muro */
        var lim = T.ponte[c.idx] > 4 ? LARG_PISTA / 2 + 0.3 : LARG_PISTA / 2 + SOBRA - 1.2, uM = B.u(c.s); /* na ponte, a mureta fica logo depois da linha branca */
        if (c.d * B.lado > 0 && uM >= B.R - 10 && uM <= B.len - B.R + 10) lim = B.off - B.pl - 2.2;
        if (Math.abs(c.d) > lim) {
          var s = c.d > 0 ? 1 : -1, ex = (Math.abs(c.d) - lim);
          c.x -= T.nx[c.idx] * ex * s; c.z -= T.nz[c.idx] * ex * s; c.d = lim * s;
          var rel = ((c.th - T.ang[c.idx] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI, vn = c.v * Math.abs(Math.sin(rel)); /* vn: velocidade contra o muro */
          c.th = T.ang[c.idx] + rel * 0.3;
          faiscas(c.x + T.nx[c.idx] * s * 0.9, T.y[c.idx] + 0.3, c.z + T.nz[c.idx] * s * 0.9, vn > 6 ? 26 : 6, vn > 6);
          if (vn < 5) c.v *= 0.985; /* só raspou */
          else {
            c.v *= Math.max(0.12, 1 - vn / (c.v + 1) * 1.15);
            if (est.batida <= 0) {
              est.dano = Math.max(0, est.dano - Math.min(40, vn * 1.5)); est.tranco = Math.min(1, vn / 25); est.batida = 0.8;
              aviso(est.dano < 75 ? 'Carro danificado: conserte no box (B)' : 'Bateu no muro!');
              if (vn > 17) { rodar(c, s); acionarSC('batida forte'); } else if (vn > 7) amarela(c, 'batida no muro');
            }
          }
        }
        c.s = p.s; c.dist += p.delta;
        if (fora) est.pneu = Math.max(0, est.pneu - c.v * dt * 0.004);
        est.pneu = Math.max(0, est.pneu - c.v * dt * DESG);
        if (C.comb) est.comb = Math.max(0, est.comb - c.v * dt * CONS);
        /* entrou na entrada dos boxes pela área de escape: o carro entra sozinho */
        var uJ = B.u(c.s);
        /* entra no box só se pediu (B) ou se entrou mesmo no pit lane; passar pela área de escape não prende mais o carro */
        if (est.fase === 'corrida' && uJ < 45 && c.d * B.lado > LARG_PISTA / 2 + (est.boxPedido ? 1.2 : 4.5) && Math.cos(c.th - T.ang[c.idx]) > 0.4) { entrarBox(c, 'entrada'); return; }
        if (est.fase === 'corrida' && est.boxPedido && uJ > T.L - 170) { entrarBox(c, 'aprox'); return; }
        /* contramão */
        var dir = Math.cos(c.th) * T.tx[c.idx] + Math.sin(c.th) * T.tz[c.idx];
        est.contramao = dir < -0.3 && c.v > 3 ? est.contramao + dt : 0;
        if (est.fase === 'corrida') contarVolta(c, sAntes, c.s);
      }

      function chamarBox() {
        if (est.fase !== 'corrida' || J.pit) return;
        est.boxPedido = !est.boxPedido;
        aviso(est.boxPedido ? 'Box chamado: o carro entra sozinho na entrada dos boxes' : 'Box cancelado');
        var bt = el.querySelector('.nv-bt-box'); if (bt) bt.classList.toggle('ativo', est.boxPedido);
        var bi = el.querySelector('.nv-ic-box'); if (bi) bi.classList.toggle('ativo', est.boxPedido);
      }
      function entrarBox(c, fase) {
        c.pit = { fase: fase, t: 0, dur: 0, lista: [] };
        if (c.eu) { est.boxPedido = false; var bt = el.querySelector('.nv-bt-box'); if (bt) bt.classList.remove('ativo'); aviso('Entrando no box'); }
      }
      function servico(c) {
        var P = c.pit, pneu = c.eu ? est.pneu : c.pneu, comb = c.eu ? est.comb : c.comb, dano = c.eu ? est.dano : 100, l = [], r = c.eu ? 1 : 1 + Math.random() * 0.3;
        if (c.C.comb && comb < 98) l.push({ n: 'Gasolina', dur: (100 - comb) / 100 * 7 * r, tipo: 'comb', de: comb });
        if (pneu < 99) l.push({ n: 'Pneus novos', dur: (c.C.tipo === 'formula' ? 2.4 : 5) * r, tipo: 'pneu' });
        if (dano < 97) l.push({ n: 'Reparo', dur: (100 - dano) / 100 * 8, tipo: 'dano' });
        if (!l.length) l.push({ n: 'Pneus novos', dur: c.C.tipo === 'formula' ? 2.4 : 5, tipo: 'pneu' });
        P.lista = l; P.dur = l.reduce(function (a, b) { return a + b.dur; }, 0);
      }
      function passoBox(c, dt) {
        var P = c.pit, i = Math.floor(c.s / T.ds) % T.N, u = B.u(c.s), uv = B.vagas[c.vaga], alvoV = PIT_LIM, alvoD, Cc = c.C;
        if (P.fase === 'aprox') {
          alvoV = c.VEL[i] * (c.eu ? 0.95 : c.habil); alvoD = B.lado * (LARG_PISTA / 2 - 1.6);
          if (u < 40) P.fase = 'entrada';
        }
        if (P.fase === 'entrada') {
          alvoV = u < B.limIni ? Math.min(c.VEL[i], Math.sqrt(PIT_LIM * PIT_LIM + 2 * 9 * (B.limIni - u))) : PIT_LIM; /* freia até a linha e chega nela a 80 */
          var falta = uv - u;
          if (falta < 70) alvoV = Math.min(alvoV, Math.sqrt(Math.max(0, 2 * 7 * (falta - 0.2))) + 0.3);
          alvoD = falta < 30 ? lerp(B.d(u), B.lado * (B.off + 1.6), 1 - falta / 30) : B.d(u);
          if (falta <= 0.25) { P.fase = 'parado'; P.t = 0; c.v = 0; servico(c); }
        }
        if (P.fase === 'parado') {
          c.v = 0; alvoD = B.lado * (B.off + 1.6); P.t += dt;
          var acum = 0;
          P.lista.forEach(function (it) {
            var feito = limitar((P.t - acum) / it.dur, 0, 1); acum += it.dur; it.p = feito;
            if (it.tipo === 'comb') { var v = it.de + (100 - it.de) * feito; if (c.eu) est.comb = v; else c.comb = v; }
            if (feito >= 1 && !it.ok) { it.ok = true; if (it.tipo === 'pneu') { if (c.eu) est.pneu = 100; else c.pneu = 100; } if (it.tipo === 'dano' && c.eu) est.dano = 100; }
          });
          if (P.t >= P.dur) { P.fase = 'saida'; if (c.eu) aviso('Saindo do box: limite de 80 km/h'); }
        } else if (P.fase === 'saida') {
          alvoV = u > B.limFim ? Math.min(c.VEL[i], PIT_LIM + (u - B.limFim) * 0.3) : PIT_LIM;
          var passou = u - uv; alvoD = passou < 30 ? lerp(B.lado * (B.off + 1.6), B.d(u), limitar(passou / 30, 0, 1)) : B.d(u);
          if (u >= B.len - 1 && u < B.len + 80) {
            c.pit = null; c.querBox = false; c.d = limitar(c.d, -LARG_PISTA / 2 - SOBRA + 1.5, LARG_PISTA / 2 + SOBRA - 1.5); c.alvoD = B.lado * (LARG_PISTA / 2 - 1.2); posMundo(c); c.th = T.ang[c.idx]; /* volta para a pista deslizando, sem pular */
            if (c.eu) { est.st = 0; aviso('De volta à pista!'); }
            return;
          }
        }
        if (P.fase !== 'parado') { if (c.v < alvoV) c.v = Math.min(alvoV, c.v + Math.max(1, acelC(Cc, c.v, 1)) * 0.85 * dt); else c.v = Math.max(alvoV, c.v - freioC(Cc, c.v) * 0.6 * dt); }
        var rD = 3 * dt * Math.max(1, c.v / 14); c.d += limitar(alvoD - c.d, -rD, rD);
        var sAntes = c.s; c.s = (c.s + c.v * dt) % T.L; c.dist += c.v * dt; posMundo(c);
        virar(c, c.ang + Math.atan2(alvoD - c.d, 10) * 0.3, dt);
        if (c.eu) est.st += (0 - est.st) * Math.min(1, dt * 6);
        contarVolta(c, sAntes, c.s);
      }
      function passoRival(c, dt) {
        if (est.fase !== 'corrida') return;
        if (c.pit) { passoBox(c, dt); return; }
        if (c.rod || c.fora) { /* rodando: freia arrastando e escorrega para fora; abandonou: para na área de escape */
          if (c.rod) { var R1 = c.rod; R1.t += dt; R1.ang = R1.sent * Math.PI * 2 * Math.min(1, R1.t / R1.dur) * (2 - Math.min(1, R1.t / R1.dur)); if (R1.t >= R1.dur && !c.fora) c.rod = null; }
          var ladoF = c.d >= 0 ? 1 : -1, alvoF = c.fora ? ladoF * (LARG_PISTA / 2 + 5) : c.d;
          c.v = Math.max(0, c.v - (c.fora ? 14 : 9) * dt); c.d += limitar(alvoF - c.d, -4 * dt, 4 * dt);
          if (c.fora === 'vai' && c.v === 0) { c.fora = 'parado'; if (c.rod) c.rod.t = c.rod.dur; }
          var sA = c.s; c.s = (c.s + c.v * dt) % T.L; c.dist += c.v * dt; posMundo(c); virar(c, c.ang, dt, 6); contarVolta(c, sA, c.s);
          return;
        }
        /* desgaste e gasolina; decide parar quando não chega ao fim */
        c.pneu = Math.max(0, c.pneu - c.v * dt * DESG); if (c.C.comb) c.comb = Math.max(0, c.comb - c.v * dt * CONS);
        var uR = B.u(c.s);
        if (!c.querBox && uR > T.L - 260 && uR < T.L - 200) {
          var resta = (cfg.voltas - c.voltas) * T.L + (T.L - c.s);
          if (resta > 600 && ((c.C.comb && c.comb < resta * CONS + 4) || c.pneu - resta * DESG < 8)) c.querBox = true;
        }
        if (c.querBox && uR > T.L - 170) { entrarBox(c, 'aprox'); passoBox(c, dt); return; }
        var i = Math.floor(c.s / T.ds) % T.N, olhar = (i + Math.round(Math.max(8, c.v * 0.6) / T.ds)) % T.N;
        var lim = Math.min(c.VEL[i], c.VEL[olhar] + 4), reta = lim >= c.C.vmax - 0.5;
        /* reta: pé no fundo, como você (o vácuo dá a velocidade a mais); curva: o nível decide o quanto ela arrisca; pneu gasto tira aderência igual ao seu */
        var alvoV = reta ? c.C.vmax * (1 + 0.09 * c.vac) : lim * Math.min(0.995, c.habil * (1 + 0.012 * c.agr)) * Math.sqrt(0.78 + 0.22 * c.pneu / 100);
        /* carro à frente na mesma linha (pelo lugar na pista: vale também para retardatário e para outra classe) */
        var frente = null, menor = 45, comSC = est.sc && est.sc.fase !== 'fim';
        carros.forEach(function (o) {
          if (o === c || o.pit || o.fora) return;
          var g = gapS(o, c);
          if (g > 0 && g < menor && Math.abs(o.d - c.d) < 2.3) { menor = g; frente = o; }
        });
        if (frente) {
          /* mais rápido: tenta passar por um lado livre */
          var freada = c.VEL[(i + Math.round(70 / T.ds)) % T.N] < c.v * 0.85; /* curva chegando */
          if ((!comSC || frente.k !== c.k) && !naAmarela(c) && c.ultr <= 0 && menor < 35 + c.agr * 15 && (alvoV > frente.v + 1 - c.agr * 0.9 || (freada && c.agr > 0.45 && menor < 22))) {
            var mw = LARG_PISTA / 2 - 1.4, kf = T.k[(i + Math.round(60 / T.ds)) % T.N], dentro = kf > 0 ? 1 : -1;
            var op = [frente.d - 3.3, frente.d + 3.3].filter(function (d) { return Math.abs(d) < mw && faixaLivre(c, d, frente); });
            /* com curva chegando, o agressivo escolhe o lado de dentro (mergulho); senão, sorteia */
            if (op.length) { c.alvoD = op.length > 1 ? (freada && c.agr > 0.3 ? (dentro > 0 ? op[1] : op[0]) : op[Math.random() < 0.5 ? 1 : 0]) : op[0]; c.ultr = 2.5 + Math.random() * 1.5 + c.agr; c.ataque = freada; }
          }
          /* enquanto não sai de trás: segue perto (agressivo cola mais), sem encostar */
          alvoV = Math.min(alvoV, Math.max(0, frente.v + (menor - (8 - c.agr * 3.5)) * 0.9));
        }
        /* lado a lado na freada: o agressivo freia um pouco mais tarde */
        if (c.ultr > 0 && c.ataque && !reta) alvoV *= 1 + 0.035 * c.agr;
        /* defesa: carro mais rápido colado atrás → fecha a porta por dentro da próxima curva (uma vez por reta) */
        if (!comSC && c.defT <= 0 && c.ultr <= 0 && c.agr > 0.25) {
          var atk = carros.some(function (o) { var g = gapS(c, o); return o !== c && o.k === c.k && !o.pit && !o.fora && g > 0 && g < 16 && o.v > c.v - 0.5; });
          if (atk) { var kd = T.k[(i + Math.round(80 / T.ds)) % T.N]; if (Math.abs(kd) > 1 / 300) { var dd2 = (kd > 0 ? 1 : -1) * (LARG_PISTA / 2 - 2.2); if (faixaLivre(c, dd2)) { c.alvoD = dd2; c.ultr = 2.2; c.defT = 9; } } }
        }
        if (c.defT > 0) c.defT -= dt;
        if (c.ultr > 0) c.ultr -= dt; else { c.alvoD = linhaIA(c, i, dt); c.ataque = false; }
        if (est.sc && est.sc.busca && SC && SC.naPista) { var gS = ((c.s - SC.s) % T.L + T.L) % T.L; if (gS < 120) c.alvoD = (SC.d >= 0 ? -1 : 1) * (LARG_PISTA / 2 - 2); } /* safety car chegando: vai para o outro lado */
        c.alvoD = limitar(c.alvoD, -LARG_PISTA / 2 + 1.3, LARG_PISTA / 2 - 1.3);
        /* de lado: não entra em cima de quem está do lado */
        var pd = limitar(c.alvoD - c.d, -2.2 * dt * Math.max(1, c.v / 30), 2.2 * dt * Math.max(1, c.v / 30)), nd = c.d + pd;
        if (pd && carros.some(function (o) { return o !== c && !o.pit && !o.fora && Math.abs(gapS(o, c)) < 5.5 && Math.abs(o.d - nd) < 2.2 && Math.abs(o.d - nd) < Math.abs(o.d - c.d); })) { pd = 0; c.alvoD = c.d; }
        c.d += pd;
        if (est.sc && est.sc.fase !== 'fim') { c.ultr = 0; alvoV = Math.min(alvoV, limiteSC(c)); }
        else if (naAmarela(c)) { c.ultr = 0; alvoV *= 0.9; if (frente) alvoV = Math.min(alvoV, Math.max(0, frente.v + (menor - 10) * 0.9)); } /* amarela: devagar e sem ultrapassar */
        if (c.v < alvoV) c.v = Math.min(alvoV, c.v + acelerar(c, c.C, c.v, 1) * dt);
        else c.v = Math.max(alvoV, c.v - freioC(c.C, c.v) * 0.95 * dt);
        var sAntes = c.s;
        c.s = (c.s + c.v * dt) % T.L; c.dist += c.v * dt;
        posMundo(c);
        virar(c, c.ang + Math.atan2(c.alvoD - c.d, 14) * 0.25, dt); /* gira aos poucos: sem tranco quando muda de faixa */
        contarVolta(c, sAntes, c.s);
      }

      /* toques entre carros (no sistema da pista: s ao longo, d de lado) */
      function contatos() {
        for (var a = 0; a < carros.length; a++) for (var b = a + 1; b < carros.length; b++) {
          var p = carros[a], q = carros[b], ds = gapS(q, p), dd = q.d - p.d, ia = !p.eu && !q.eu;
          if ((p.pit && p.pit.fase !== 'aprox') || (q.pit && q.pit.fase !== 'aprox') || p.fora || q.fora) continue; /* carro abandonado fica fora da pista */
          var CL = (p.C.comp * p.C.esc + q.C.comp * q.C.esc) * 0.46, CW = (p.C.larg + q.C.larg) * 0.51;
          if (Math.abs(ds) > CL || Math.abs(dd) > CW) continue;
          var atras = ds > 0 ? p : q, frente = ds > 0 ? q : p;
          if (Math.abs(ds) / CL > Math.abs(dd) / CW) {
            var imp = atras.v - frente.v; /* velocidade da batida na traseira */
            if (imp > 0) { var media = Math.max(0, (atras.v + frente.v) / 2); atras.v = media * 0.97; frente.v = Math.max(frente.v, media); }
            if (imp > 10 && !atras.batT && !frente.batT) batidaForte(atras, frente, imp); /* grave: roda e entra o safety car */
            else if (imp > 4 && !atras.batT && !frente.batT) { atras.batT = frente.batT = 1.2; faiscas((atras.x + frente.x) / 2, T.y[frente.idx] + 0.35, (atras.z + frente.z) / 2, 10); amarela(frente, 'toque entre carros'); } /* leve: bandeira amarela */
            var emp = Math.min(ia ? 0.08 : 0.3, CL - Math.abs(ds)); /* poucos cm por passo: separa sem pular */
            if (atras.eu) { atras.x -= T.tx[atras.idx] * emp; atras.z -= T.tz[atras.idx] * emp; atras.dist -= emp; } else { atras.s = (atras.s - emp + T.L) % T.L; atras.dist -= emp; }
          } else {
            var sep = Math.min(ia ? 0.04 : 0.15, (CW - Math.abs(dd)) / 2 + 0.05), sg = dd >= 0 ? 1 : -1;
            [[p, -sg], [q, sg]].forEach(function (par) {
              var c = par[0];
              if (c.eu) { c.x += T.nx[c.idx] * sep * par[1]; c.z += T.nz[c.idx] * sep * par[1]; c.d += sep * par[1]; } else { c.d += sep * par[1]; c.alvoD = c.d; }
              c.v *= 0.985;
            });
          }
          if ((p.eu || q.eu) && est.batida <= 0 && Math.abs(p.v - q.v) > 3) { est.dano = Math.max(0, est.dano - 4); est.batida = 0.6; est.tranco = 0.25; faiscas((p.x + q.x) / 2, T.y[p.idx] + 0.3, (p.z + q.z) / 2, 8); }
        }
      }

      function terminar() {
        est.fase = 'fim'; est.chegou = true;
        var ord = carros.slice().sort(function (a, b) { return (multi && a.k !== b.k ? (a.k === 'hyper' ? -1 : 1) : 0) || (!!a.fora - !!b.fora) || b.dist - a.dist; }), ordC = ord.filter(function (c) { return c.C === C; }), pos = ordC.indexOf(J) + 1;
        var vm = T.L / Math.max(est.melhor || 90, 30);
        var linhas = ord.map(function (c, i) {
          var daClasse = ord.filter(function (o) { return o.k === c.k; }), lider = daClasse[0], atr = lider.dist - c.dist, nv2 = Math.floor(atr / T.L);
          var dif = c.fora ? 'Abandonou' : c === lider ? (c.C === C ? tempo(est.corrida - Math.max(0, (lider.dist - J.dist) / vm)) : 'Líder') : nv2 >= 1 ? '+' + nv2 + (nv2 > 1 ? ' voltas' : ' volta') : '+' + (atr / vm).toFixed(1).replace('.', ',') + ' s';
          return '<li' + (c.eu ? ' class="nv-eu"' : '') + '><b>' + (daClasse.indexOf(c) + 1) + '</b><span>#' + c.num + ' ' + esc(c.nome) + (multi ? ' <small class="nv-cls nv-cls-' + c.k + '">' + c.C.curto + '</small>' : '') + '</span><em>' + dif + '</em></li>';
        }).join('');
        var p = el.querySelector('#nv-pausa'); p.hidden = false;
        p.innerHTML = '<div class="nv-caixa nv-fim"><p class="nv-rot">Bandeira quadriculada</p><h3>' + pos + 'º lugar' + (multi ? ' na ' + C.nome : '') + '</h3>' +
          '<p class="nv-res">Tempo total <b>' + tempo(est.corrida) + '</b> · Melhor volta <b>' + tempo(est.melhor) + '</b></p><ol class="nv-class">' + linhas + '</ol>' +
          '<div class="nv-fim-bts"><button type="button" class="nv-correr" data-p="de-novo">Correr de novo</button><button type="button" class="nv-sec" data-p="menu">Mudar corrida</button><button type="button" class="nv-sec" data-p="comp">Compartilhar</button></div></div>';
        p.querySelector('[data-p="de-novo"]').onclick = iniciar;
        p.querySelector('[data-p="menu"]').onclick = menu;
        p.querySelector('[data-p="comp"]').onclick = function () {
          var txt = 'Terminei em ' + pos + 'º' + (multi ? ' na ' + C.nome : '') + ' com volta de ' + tempo(est.melhor) + ' de ' + nomeJog() + ' em ' + T.nome + ' no Arena Racing. Duvido você bater!', url = 'https://automobilismonaveia.com.br/jogos.html#corrida';
          if (navigator.share) navigator.share({ title: 'Arena Racing', text: txt, url: url }).catch(function () {});
          else if (navigator.clipboard) navigator.clipboard.writeText(txt + ' ' + url).then(function () { aviso('Link copiado'); });
        };
      }

      function passo(dt) {
        if (est.pausa || est.fase === 'fim') return;
        est.t += dt;
        if (est.fase === 'luzes') { if (est.t >= 3.2) { est.fase = 'corrida'; est.t = 0; } }
        else est.corrida += dt;
        if (est.batida > 0) est.batida -= dt;
        carros.forEach(function (c) { if (c.batT > 0) c.batT -= dt; });
        if (est.amarela && est.amarela.t > 0) est.amarela.t -= dt;
        if (est.avisoT > 0) est.avisoT -= dt;
        if (est.fase === 'corrida') calcVacuo();
        if (scPlano && !est.sc && est.fase === 'corrida' && lider().dist > scPlano) acionarSC('acidente na pista');
        passoSC(dt);
        passoJogador(dt); passoSetores();
        carros.forEach(function (c) { if (!c.eu) passoRival(c, dt); });
        if (est.fase === 'corrida') contatos();
        /* WEC de GT3: avisa quando um Hypercar mais rápido chega por trás */
        if (est.azul > 0) est.azul -= dt;
        if (multi && kJ === 'gt3' && est.fase === 'corrida' && carros.some(function (o) { var g = gapS(J, o); return o.k === 'hyper' && !o.pit && !o.fora && g > 0 && g < 70 && o.v > J.v + 1; })) est.azul = 1.5; /* fica uns segundos depois que ele passa */
      }

      var arvT = 0, camY = null, alvoCam = new THREE.Vector3(), olhar = new THREE.Vector3(), camTh = null, E = {}, sombraCada = 1, qSombra = 0;
      ['nv-pitbox', 'nv-pos', 'nv-tabela', 'nv-volta', 'nv-atual', 'nv-melhor', 'nv-km', 'nv-leds', 'nv-marcha', 'nv-p-acel', 'nv-p-freio', 'nv-sc', 'nv-gpu', 'nv-azul', 'nv-amarela', 'nv-s1', 'nv-s2', 'nv-s3', 'nv-rpm', 'nv-centro', 'nv-aviso', 'nv-m-pneu', 'nv-m-turbo', 'nv-v-pneu', 'nv-v-turbo', 'nv-m-comb', 'nv-v-comb'].forEach(function (id) { E[id] = el.querySelector('#' + id); });
      var tabAnt = '', hudLed = -1, hudPed = [-1, -1], torreT = 0;
      /* velocidade média de referência (para mostrar a diferença em segundos) */
      var vRef = (function () { var t = 0; for (var q = 0; q < T.N; q++) t += T.ds / Math.max(5, VEL[q]); return T.L / t; })();
      function sigla(n) { var p = String(n).trim().split(/\s+/), u = p[p.length - 1]; return u.slice(0, 3).toUpperCase(); }
      function segs(t) { return t >= 60 ? Math.floor(t / 60) + ':' + ('0' + (t % 60).toFixed(3)).slice(-6) : t.toFixed(3); }
      function desenhar(dt) {
        /* carros */
        var LOD_D = Q.nivel === 'alto' ? (toque ? 45 : 75) : toque ? 32 : 48;
        carros.forEach(function (c) {
          if (c.m.longe && !c.eu) {
            var dc = camera.position.distanceTo(c.m.grupo.position), longeAgora = c.m.longe.visible;
            var quer = longeAgora ? dc > LOD_D - 10 : dc > LOD_D + 10;
            if (quer !== longeAgora) { c.m.longe.visible = quer; c.m.perto.visible = !quer; }
            var some = dc > 450; if (c.m.grupo.visible === some) c.m.grupo.visible = !some;
          }
          var i0 = Math.floor(c.s / T.ds) % T.N, i1 = (i0 + 1) % T.N, fi = c.s / T.ds - Math.floor(c.s / T.ds), yc = lerp(T.y[i0], T.y[i1], fi); /* altura pelo lugar na pista (s), entre dois pontos: sem degraus (o idx do jogador é o ponto mais perto, que às vezes é o seguinte) */
          c.m.grupo.position.set(c.x, 0.05 + yc + (c.pit && c.pit.fase === 'parado' && c.pit.t > 0.4 ? 0.06 : 0), c.z); c.m.grupo.rotation.order = 'YZX'; c.m.grupo.rotation.y = -c.th - (c.rod ? c.rod.ang : 0);
          if (c.fora === 'parado' && est.sc && est.sc.fase === 'fim' && c.m.grupo.visible) c.m.grupo.visible = false; /* o guincho levou */
          var dirc = Math.cos(c.th) * T.tx[c.idx] + Math.sin(c.th) * T.tz[c.idx]; c.m.grupo.rotation.z = Math.atan(lerp(T.inc[i0], T.inc[i1], fi)) * (dirc >= 0 ? 1 : -1); /* sobe e desce com a pista */
          var giro = c.v * dt / 0.36;
          c.m.rodas.forEach(function (r) { r.rotation.z -= giro; });
          var es = c.eu ? est.st * 0.35 : 0;
          c.m.frente.forEach(function (r) { r.rotation.y = -es; });
        });
        if (SC && SC.grupo.visible) {
          SC.grupo.position.set(SC.x, 0.04 + T.y[SC.idx], SC.z); SC.grupo.rotation.y = -SC.th;
          var pisca = (est.t * 4 | 0) % 2;
          SC.giro.forEach(function (m, n) { m.color.setHex((pisca + n) % 2 ? 0xffa200 : 0x2a1c00); });
        }
        if (T.verArvores && (arvT -= dt) <= 0) { arvT = 0.3; T.verArvores(camera.position); }
        /* equipes dos boxes: vão até o carro quando ele para */
        equipes.forEach(function (lista, k) {
          var c = carros[k], P = c && c.pit, parado = P && P.fase === 'parado', vem = P && P.fase === 'entrada' && B.vagas[c.vaga] - B.u(c.s) < 120;
          var ref = parado ? c : vem ? lista.ref : null;
          lista.forEach(function (m, n) {
            var alvoX = m.casa.x, alvoZ = m.casa.z, abaixa = 1, olhaX = null, olhaZ = 0;
            if (ref) {
              /* posição em volta do carro: esperando (um pouco mais longe, em pé) ou trabalhando (ajoelhado nas rodas) */
              var q = POS_MEC[n], e = c.C.esc * (parado ? 1 : 1.35), lx = q[0] * e, lz = q[1] * e * (n === 5 ? B.lado : 1), th = ref.th;
              alvoX = ref.x + lx * Math.cos(th) - lz * Math.sin(th); alvoZ = ref.z + lx * Math.sin(th) + lz * Math.cos(th);
              olhaX = ref.x + Math.cos(th) * q[0] * 0.6; olhaZ = ref.z + Math.sin(th) * q[0] * 0.6; abaixa = parado && n < 4 ? 0.7 : 1;
            }
            var kk = Math.min(1, dt * 5), dx = alvoX - m.pos.x, dz = alvoZ - m.pos.z;
            m.pos.x += dx * kk; m.pos.z += dz * kk; m.pos.y = m.casa.y;
            /* virado para onde corre; parado, virado para o carro (ou para o pit lane) */
            var alvoRot = Math.hypot(dx, dz) > 0.6 ? Math.atan2(dx, dz) : olhaX !== null ? Math.atan2(olhaX - m.pos.x, olhaZ - m.pos.z) : m.rotCasa;
            m.rot += (((alvoRot - m.rot + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * Math.min(1, dt * 8); m.sy += (abaixa - m.sy) * kk;
          });
        });
        equipes.atualizar();
        /* câmera */
        /* a câmera segue o rumo do carro com um pequeno atraso (sem ficar para trás em alta velocidade) */
        if (camTh === null) camTh = J.th;
        var dTh = ((J.th - camTh + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
        camTh += dTh * Math.min(1, dt * (est.camModo >= 2 ? 30 : 6));
        var fx = Math.cos(camTh), fz = Math.sin(camTh), gx = Math.cos(J.th), gz = Math.sin(J.th);
        var retrato = camera.aspect < 1, dc = C.cam * (retrato ? 1.45 : 1), hc = retrato ? 0.9 : 0; /* celular em pé: câmera mais longe e mais alta */
        var yJ = J.m.grupo.position.y - 0.05, yTras = alturaS(J.s - dc * (est.camModo === 1 ? 1.7 : 1)); /* alturas interpoladas (a altura em degraus de 2 m fazia a câmera pular) */ /* altura da pista no carro e atrás dele */
        /* primeira pessoa: olhos do piloto dentro do carro, volante e braços acompanham a direção */
        var cockpit = est.camModo >= 2 && !!cab, A = aj(), piloto = cockpit && est.camModo === 3 && cab.olhoPiloto;
        if (cab && cab.grupo.visible !== cockpit) J.m.grupo.children.forEach(function (ch) { ch.visible = ch.userData.sombra || (cockpit ? ch === cab.grupo : ch !== cab.grupo); });
        if (cockpit) {
          J.m.grupo.updateMatrixWorld(true);
          virarVolante(cab, -est.st * 0.9);
          var tremor = Math.sin(est.t * 37) * 0.0015 * Math.min(1, J.v / 40);
          alvoCam.copy(cab.olho); alvoCam.z -= est.st * 0.02; alvoCam.y += tremor;
          olhar.copy(cab.olho); olhar.x += 10; olhar.y -= cab.desce; olhar.z -= est.st * 0.2;
          alvoCam.x += A.f; alvoCam.y += A.a; olhar.x += A.f; olhar.y += A.a;
          if (piloto) { alvoCam.x += piloto[0]; alvoCam.y += piloto[1]; olhar.x += piloto[0]; olhar.y += piloto[1] + piloto[2]; } /* Cockpit: olho na altura do piloto */
          if (cab.capG) cab.capG.visible = !piloto && A.f < 0.1; /* F1: com a câmera para a frente vira a visão do piloto (sem o capacete, com o volante) */
          cab.grupo.localToWorld(alvoCam); cab.grupo.localToWorld(olhar);
        }
        else if (est.camModo === 0) { alvoCam.set(J.x - fx * (dc - A.f), Math.max(yJ, yTras) + (C.tipo === 'formula' ? 2.3 : 2.7) + hc + A.a, J.z - fz * (dc - A.f)); olhar.set(J.x + fx * 6, yJ + 1.0, J.z + fz * 6); }
        else if (est.camModo === 1) { alvoCam.set(J.x - fx * (dc * 1.7 - A.f), Math.max(yJ, yTras) + 4.4 + hc + A.a, J.z - fz * (dc * 1.7 - A.f)); olhar.set(J.x + fx * 8, yJ + 0.6, J.z + fz * 8); }
        else { var cabeca = C.tipo === 'formula' ? -0.1 : 0.2; alvoCam.set(J.x + gx * (cabeca + A.f), yJ + (C.tipo === 'formula' ? 1.12 : 1.25) + A.a, J.z + gz * (cabeca + A.f)); olhar.set(J.x + gx * 30, T.y[(J.idx + Math.round(30 / T.ds)) % T.N] + 0.9, J.z + gz * 30); }
        if (est.tranco > 0) { est.tranco = Math.max(0, est.tranco - dt * 2.2); var tr = est.tranco * (cockpit ? 0.05 : 0.18); alvoCam.x += (Math.random() - 0.5) * tr; alvoCam.y += (Math.random() - 0.5) * tr; alvoCam.z += (Math.random() - 0.5) * tr; }
        passoFaiscas(dt);
        if (!cockpit && est.camModo < 2) { camY = camY === null ? alvoCam.y : camY + (alvoCam.y - camY) * Math.min(1, dt * 8); alvoCam.y = camY; } else camY = null;
        camera.position.copy(alvoCam);
        camera.lookAt(olhar);
        if (A.i) camera.rotateX(A.i * Math.PI / 180); /* inclinação escolhida no ajuste de câmera */
        camera.near = cockpit ? 0.04 : 0.3;
        camera.fov = limitar((cockpit ? (piloto ? (retrato ? 54 : 40) : retrato ? 60 : 46) + Math.min(4, J.v / C.vmax * 4) : (retrato ? 72 : 60) + Math.min(14, J.v / C.vmax * 14)) + A.z, 25, 100); camera.updateProjectionMatrix();
        sol.position.set(J.x + dirSol.x * 320, yJ + dirSol.y * 320, J.z + dirSol.z * 320); sol.target.position.set(J.x, yJ, J.z); sol.target.updateMatrixWorld();
        brilhoSol.position.copy(camera.position).addScaledVector(dirSol, 3000);
        renderer.shadowMap.needsUpdate = (qSombra++ % sombraCada) === 0;
        renderer.render(scene, camera); camera.layers.disable(1);
        if (cockpit && espelho && quadroN++ % (toque ? 3 : 2) === 0) {
          camTras.position.set(-0.4, 1.2, 0); cab.grupo.localToWorld(camTras.position);
          alvoTras.set(-20, 0.9, 0); cab.grupo.localToWorld(alvoTras); camTras.lookAt(alvoTras);
          renderer.setRenderTarget(espelho); renderer.render(scene, camTras); camTras.layers.disable(1); renderer.setRenderTarget(null);
        }
        /* placar */
        var ord = carros.slice().sort(function (a, b) { return b.dist - a.dist; }), ordC = multi ? ord.filter(function (c) { return c.C === C; }) : ord, pos = ordC.indexOf(J);
        E['nv-pos'].textContent = pos + 1;
        var mch = J.v < 0.8 && !manual ? 0 : J.marcha, giro = Math.max(0.12, Math.min(1, J.v / vMarcha(C, J.marcha)));
        if (cockpit && (cab.painel || cab.leds) && (painelT -= dt) <= 0) {
          painelT = 0.1;
          if (cab.leds) acenderLeds(cab.leds, giro, giro > 0.97 && mch < 6);
          if (cab.painel) {
            var tv = est.fase === 'luzes' ? 0 : est.corrida - est.volta, mm = Math.floor(tv / 60), ss = Math.floor(tv % 60), ms = Math.floor((tv % 1) * 1000);
            var u = est.ultima, ultima = u ? Math.floor(u / 60) + ':' + ('0' + Math.floor(u % 60)).slice(-2) + ':' + ('0' + Math.floor((u % 1) * 100)).slice(-2) : '--:--:--';
            var aq = Math.min(1, est.corrida / 240);
            desenharPainel(cab.painel, { tempo: ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2) + ':' + ('00' + ms).slice(-3), marcha: mch ? String(mch) : 'N',
              gas: (est.comb * 1.2).toFixed(1).replace('.', ','), gasPouca: est.comb < 15, oleo: String(Math.round(78 + aq * 30)), cambio: String(Math.round(70 + aq * 22)), agua: String(Math.round(74 + aq * 16)),
              bat: (13.6 + giro * 0.6).toFixed(1), ultima: ultima, vel: String(Math.round(J.v * 3.6)), box: !!(J.pit && J.pit.fase !== 'aprox'),
              volta: String(Math.max(1, Math.min(cfg.voltas, J.voltas))), pos: 'P' + (pos + 1), pneu: Math.round(est.pneu), carga: est.turbo / 100, giro: Math.round(giro * 20) / 20,
              acel: (cfg.auto ? !cmd.freio : cmd.acel) ? 1 : 0, delta: est.melhor && est.volta ? (tv - est.melhor >= 0 ? '+' : '') + (tv - est.melhor).toFixed(2) : '0.00' });
          }
        }
        torreT -= dt || 0; if (!(torreT > 0)) { /* torre: líder, quem está na sua frente, você e quem vem atrás, com a diferença para o líder */
          torreT = 0.25;
          var mostrar = [0, pos - 1, pos, pos + 1].filter(function (x, i, arr) { return x >= 0 && x < ordC.length && arr.indexOf(x) === i; }), L0 = ordC[0];
          var tab = mostrar.map(function (x) {
            var c = ordC[x], dd = L0.dist - c.dist, dif = x === 0 ? 'LÍDER' : dd >= T.L ? '+' + Math.floor(dd / T.L) + (dd >= 2 * T.L ? ' VOLTAS' : ' VOLTA') : '+' + (dd / vRef).toFixed(3);
            return '<li' + (c.eu ? ' class="nv-eu"' : '') + '><b>' + (x + 1) + '</b><i style="background:#' + ('00000' + (c.corBase || 0).toString(16)).slice(-6) + '"></i><span>' + (c.eu ? 'VOCÊ' : esc(sigla(c.nome))) + '</span><em>' + dif + '</em></li>';
          }).join('');
          if (tab !== tabAnt) { E['nv-tabela'].innerHTML = tab; tabAnt = tab; }
        }
        /* setores: tempo de cada um (roxo = seu melhor, amarelo = mais lento); o atual corre */
        for (var ks = 0; ks < 3; ks++) {
          var tS = est.setores[ks], txtS = tS != null ? segs(tS) : ks === est.setK && est.fase === 'corrida' ? segs(est.corrida - est.setIni) : '-', clS = tS != null ? est.setCor[ks] : ks === est.setK ? 'corre' : '';
          var eS = E['nv-s' + (ks + 1)]; if (eS.textContent !== txtS) eS.textContent = txtS; if (eS.className !== clS) eS.className = clS;
        }
        E['nv-rpm'].textContent = Math.round(3800 + giro * 8700).toLocaleString('pt-BR');
        E['nv-volta'].textContent = Math.max(1, Math.min(cfg.voltas, J.voltas));
        E['nv-atual'].textContent = tempo(est.fase === 'luzes' ? 0.0001 : est.corrida - est.volta);
        E['nv-melhor'].textContent = tempo(est.melhor);
        E['nv-km'].textContent = Math.round(J.v * 3.6);
        E['nv-marcha'].textContent = mch ? mch : 'N';
        var nLed = Math.round(giro * 12), pisc = giro > 0.97 && mch < 6;
        if (nLed !== hudLed || pisc) { hudLed = nLed; [].forEach.call(E['nv-leds'].children, function (l, n) { l.className = (pisc ? (est.t * 12 | 0) % 2 : n < nLed) ? (n < 4 ? 'v' : n < 8 ? 'r' : 'a') : ''; }); }
        var pa = (cfg.auto ? !cmd.freio : cmd.acel) && est.fase === 'corrida' ? 1 : 0, pf = cmd.freio ? 1 : 0;
        if (pa !== hudPed[0]) { hudPed[0] = pa; E['nv-p-acel'].style.transform = 'scaleX(' + pa + ')'; }
        if (pf !== hudPed[1]) { hudPed[1] = pf; E['nv-p-freio'].style.transform = 'scaleX(' + pf + ')'; }
        var uL = B.u(J.s), limOn = !!(J.pit && J.pit.fase !== 'aprox' && uL >= B.limIni - 2 && uL <= B.limFim);
        var cxV = E['nv-km'].closest('.nv-vel');
        if (cxV.classList.contains('nv-lim') !== limOn) { cxV.classList.toggle('nv-lim', limOn); E['nv-km'].nextSibling.textContent = limOn ? 'LIMITADOR 80' : 'KM/H'; }
        var amOn = !!(est.amarela && est.amarela.t > 0 && !(est.sc && est.sc.fase !== 'fim')); if (E['nv-amarela'].classList.contains('ativo') !== amOn) E['nv-amarela'].classList.toggle('ativo', amOn);
        var azulOn = est.azul > 0; if (E['nv-azul'].classList.contains('ativo') !== azulOn) E['nv-azul'].classList.toggle('ativo', azulOn);
        var scTxt = est.sc && est.sc.fase === 'pista' ? 'SAFETY CAR' : est.sc && est.sc.fase === 'entrando' ? 'SAFETY CAR ENTRA NOS BOXES' : '';
        if (E['nv-sc'].textContent !== scTxt) { E['nv-sc'].textContent = scTxt; E['nv-sc'].className = 'nv-sc' + (scTxt ? ' ativo' : ''); }
        var semKm = !!(cockpit && cab && cab.painel), caixaVel = E['nv-km'].closest('.nv-vel'); if (caixaVel.hidden !== semKm) caixaVel.hidden = semKm; /* dentro do carro a velocidade aparece na tela do volante/painel */
        MEDIDORES.map(function (m) { return [m, m === 'pneu' ? est.pneu : m === 'turbo' ? est.turbo : est.comb]; }).forEach(function (m) {
          E['nv-m-' + m[0]].style.strokeDashoffset = String(106.8 * (1 - m[1] / 100));
          E['nv-v-' + m[0]].textContent = Math.round(m[1]);
        });
        var centro = E['nv-centro'], txt = '';
        if (est.fase === 'luzes') txt = est.t < 1 ? '3' : est.t < 2 ? '2' : est.t < 3 ? '1' : 'GO!';
        else if (est.corrida < 1) txt = 'GO!';
        else if (est.contramao > 1.2 && !J.pit) txt = 'CONTRAMÃO';
        else if (J.voltas === cfg.voltas && cfg.voltas > 1 && J.s < 400 && J.meio === false) txt = 'ÚLTIMA VOLTA';
        if (centro.textContent !== txt) { centro.textContent = txt; centro.className = 'nv-centro' + (txt ? ' ativo' : ''); }
        E['nv-aviso'].textContent = est.avisoT > 0 ? est.aviso : '';
        /* painel do pit stop */
        var pt = '';
        if (J.pit && J.pit.fase === 'parado') {
          pt = '<b>PIT STOP</b><em>' + J.pit.t.toFixed(1).replace('.', ',') + ' s</em>' + J.pit.lista.map(function (it) {
            return '<div class="nv-pit-it"><span>' + it.n + '</span><i><s style="width:' + Math.round((it.p || 0) * 100) + '%"></s></i></div>';
          }).join('');
        } else if (J.pit && J.pit.fase !== 'aprox' && B.u(J.s) >= B.limIni && B.u(J.s) <= B.limFim) pt = '<b>LIMITE 80 km/h</b>';
        else if (est.boxPedido) pt = '<b>BOX</b><em>entra nesta volta</em>';
        if (pt !== pitTxt) { E['nv-pitbox'].innerHTML = pt; E['nv-pitbox'].className = 'nv-pitbox' + (pt ? ' ativo' : ''); pitTxt = pt; }
        /* alertas de gasolina e pneus */
        if ((est.alertaT -= dt) <= 0 && est.fase === 'corrida' && !J.pit && !est.boxPedido) {
          if (C.comb && est.comb < 22) { aviso(est.comb <= 0 ? 'Sem gasolina! Chame o box (B)' : 'Gasolina na reserva: chame o box (B)'); est.alertaT = 9; }
          else if (est.pneu < 22) { aviso('Pneus gastos: chame o box (B)'); est.alertaT = 9; }
        }
        /* mapa */
        mctx.clearRect(0, 0, 150, 150); mctx.drawImage(fundoMapa, 0, 0);
        carros.forEach(function (c) {
          mctx.fillStyle = c.eu ? '#e3343c' : ordC[0] === c ? '#f5c518' : multi && c.k === 'gt3' ? '#ff9f43' : '#cfd4d9';
          mctx.beginPath(); mctx.arc(75 + (c.x - T.cx) * mapa.esc, 75 + (c.z - T.cz) * mapa.esc, c.eu ? 4.5 : 3, 0, 7); mctx.fill();
        });
        if (SC && SC.grupo.visible) { mctx.fillStyle = '#29d16b'; mctx.beginPath(); mctx.arc(75 + (SC.x - T.cx) * mapa.esc, 75 + (SC.z - T.cz) * mapa.esc, 4, 0, 7); mctx.fill(); }
        motor.atualizar(3800 + giro * 8700, (cfg.auto ? !cmd.freio : cmd.acel) ? 1 : 0.2);
      }

      function ajustar() {
        var w = caixaJ.clientWidth, h = caixaJ.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      }
      var ro = window.ResizeObserver ? new ResizeObserver(ajustar) : null;
      if (ro) ro.observe(caixaJ); else window.addEventListener('resize', ajustar);
      ajustar();
      if (SC) SC.grupo.visible = true;
      var gancho = new THREE.LOD(); gancho.update = function (cm) { cm.layers.enable(1); }; scene.add(gancho);
      try { renderer.compile(scene, camera); } catch (e) {}
      if (SC) SC.grupo.visible = false; /* prepara todos os materiais antes da largada (evita travadinhas no meio da corrida) */
      var ult = performance.now();
      /* aparelho lento: depois de uns segundos de corrida, tira as sombras e baixa a resolução */
      var medida = { n: 0, soma: 0, degrau: Q.nivel === 'leve' ? 1 : 0 };
      function medirFluidez(ms) {
        if (medida.degrau >= 3 || est.pausa || ms > 3000) return;
        medida.n++; medida.soma += Math.min(ms, 1000);
        if (est.fase === 'luzes' && est.t < 1.5) return; /* começo: a placa ainda está preparando os materiais */
        if (medida.n < 60 && !(medida.n >= 8 && medida.soma / medida.n > 300)) return; /* travando muito: decide rápido */
        var media = medida.soma / medida.n; medida.n = 0; medida.soma = 0;
        if (media < 24) return; /* acima de ~40 quadros por segundo: está bom */
        if (medida.degrau === 2) {
          medida.degrau = 3; renderer.setPixelRatio(0.5); ajustar();
          (T.arvores || []).forEach(function (a) { a.count = 0; });
          if (media > 60) avisoGPU(true); aviso('Gráfico no mínimo para rodar liso'); return;
        }
        if (medida.degrau === 1) {
          medida.degrau = 2; renderer.setPixelRatio(Math.min(1, dpr) * 0.75); ajustar();
          (T.arvores || []).forEach(function (a) { a.count = Math.floor(a.count / 2); });
          aviso('Gráfico ajustado para rodar mais liso'); return;
        }
        medida.degrau = 1;
        renderer.setPixelRatio(1); ajustar();
        if (renderer.shadowMap.enabled) { sol.shadow.mapSize.set(1024, 1024); if (sol.shadow.map) { sol.shadow.map.dispose(); sol.shadow.map = null; } sombraCada = 2; } /* sombra menor e a cada 2 quadros (desligar recompilava tudo e travava) */
        aviso('Gráfico ajustado para rodar mais liso');
      }
      function quadro(t) {
        rodou = true; raf = agendar(quadro);
        medirFluidez(t - ult);
        var dt = Math.min(0.1, (t - ult) / 1000); ult = t;
        if (!el.offsetParent) { if (!est.pausa && est.fase === 'corrida') pausar(true); return; }
        var n = Math.ceil(dt / 0.0125), sub = dt / n;
        for (var q = 0; q < n; q++) passo(sub);
        desenhar(dt);
      }
      jogo = { renderer: renderer, scene: scene, motor: motor, kd: kd, ku: ku, ro: ro };
      if (/^(localhost|127.)/.test(location.hostname)) window.NV_TESTE = { J: J, T: T, est: est, cmd: cmd, carros: carros, VEL: VEL, R: renderer, S: scene, sol: sol, cam: camera, cab: cab, esp: function () { return [espelho, camTras]; }, sc: function () { acionarSC('teste'); }, amarela: function () { amarela(J, 'teste'); }, cheio: function () { cheio(true); }, SC: SC, rodar: function (seg) { for (var q = 0, n = Math.round(seg / 0.0125); q < n; q++) passo(0.0125); desenhar(0.016); }, fisica: function (seg) { for (var q = 0, n = Math.round(seg / 0.0125); q < n; q++) passo(0.0125); } };
      var rodou = false; porTimer = false; raf = agendar(quadro);
      vigia = setTimeout(function () { if (!rodou && jogo && document.visibilityState === 'visible') { porTimer = true; cancelAnimationFrame(raf); ult = performance.now(); raf = agendar(quadro); } }, 900);
      document.addEventListener('visibilitychange', function () { if (document.hidden && jogo && !est.pausa && est.fase === 'corrida') pausar(true); });
    }
    menu();
    /* teste automático (só no computador local): ?nvauto={"cfg":{...},"cam":2,"t":6} larga sozinho, em tela cheia, e para a corrida depois de t segundos */
    if (/^(localhost|127.)/.test(location.hostname)) {
      var qa = new URLSearchParams(location.search).get('nvauto');
      if (qa) try {
        var o = JSON.parse(qa); Object.assign(cfg, o.cfg || {}); if (o.cam != null) guardar('corrida-cam', o.cam); if (o.aj) guardar('corrida-camaj', o.aj); menu();
        setTimeout(function () { [].forEach.call(document.querySelectorAll('[role=dialog], .bv-fundo, .boas-vindas'), function (d) { d.remove(); }); el.querySelector('#nv-correr').click(); }, 200);
        if (o.acel) setInterval(function () { if (window.NV_TESTE) window.NV_TESTE.cmd.acel = true; }, 100);
        if (o.adiantar) var adi = setInterval(function () { var N = window.NV_TESTE; if (!N || !N.rodar) return; clearInterval(adi); N.est.pausa = false; N.rodar(3.4); if (o.sc) N.sc(); N.rodar(o.adiantar); if (o.azul) N.est.azul = 999; if (o.box) { var TT = N.T, sJ = ((TT.box.ini - 120) % TT.L + TT.L) % TT.L, iJ = Math.floor(sJ / TT.ds) % TT.N; N.J.s = sJ; N.J.idx = iJ; N.J.d = 0; N.J.x = TT.x[iJ]; N.J.z = TT.z[iJ]; N.J.th = TT.ang[iJ]; N.J.v = 30; N.est.boxPedido = true; for (var bq = 0; bq < 6000 && !(N.J.pit && N.J.pit.fase === 'parado' && N.J.pit.t > o.box); bq++) { N.est.pausa = false; N.fisica(0.05); } for (var bq2 = 0; bq2 < 30; bq2++) N.rodar(0.0125); } if (o.batida) { var R = N.carros.filter(function (c) { return !c.eu; })[0]; R.dist = N.J.dist + 12; R.s = ((R.dist % N.T.L) + N.T.L) % N.T.L; R.d = N.J.d; R.alvoD = N.J.d; R.v = 15; R.ultr = 99; N.J.v = 60; N.rodar(o.batida); } if (o.scPerto) { N.SC.box = false; N.SC.naPista = true; N.SC.s = (N.J.s + o.scPerto) % N.T.L; N.SC.d = N.J.d; N.SC.v = 0; N.rodar(0.02); } }, 300); /* pula para o meio da corrida */
        var espera = setInterval(function () { var b = el.querySelector('[data-a=config]'); if (b && window.NV_TESTE) { clearInterval(espera); window.NV_TESTE.cheio(); if (o.t) setTimeout(function () { var p = el.querySelector('[data-a=config]'); if (p) p.click(); var pz = el.querySelector('#nv-pausa'); if (pz) pz.hidden = true; }, o.t * 1000); } }, 200);
      } catch (e) {}
    }
  };
  /* para a vitrine de teste dos carros */
  window.JOGO_CORRIDA.montarCarro = function (t, b, d, n, c) { SOMBRA = SOMBRA || texturaSombra(); return montarCarro(t, b, d, n, c); };
  window.JOGO_CORRIDA.CLASSES = CLASSES;
})();
