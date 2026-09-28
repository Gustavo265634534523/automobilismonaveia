/* Visão 3D do Chefe de Equipe (estilo F1 Clash): pista, carros de F1 2026 sem marca e câmera atrás do carro.
   Usa a biblioteca Three.js (r128), carregada do cdnjs só quando a pessoa escolhe uma câmera 3D.
   jogo-chefe.js chama: CHEFE3D.carregar(cb), CHEFE3D.pronto(), CHEFE3D.falhou(), CHEFE3D.desenhar(caixa, o, modo, W, H), CHEFE3D.liberar().
   o = { PF, foco, clima, grafico ('baixo' | 'medio' | 'alto'), carros: [{ f, lado, visual, corPneu, freio, v, jog }] }.
   desenhar devolve { v: velocidade do seu carro em m/s, sol: [x, y] do sol na tela (0 a 1) ou null } para os efeitos de câmera. */
(function () {
  var URL_THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var estado = 'nada', espera = [], atual = null;
  var LARG = 14, W2 = LARG / 2, BASE = 0.18; /* pista de 14 m; carros andam 18 cm acima do chão (em cima do asfalto) */
  var DIR_SOL = [0.45, 0.8, 0.3]; /* direção de onde vem o sol */

  function carregar(cb) {
    if (window.THREE) { if (cb) cb(); return; }
    if (cb) espera.push(cb);
    if (estado !== 'nada') return;
    estado = 'carregando';
    var s = document.createElement('script'); s.src = URL_THREE; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = function () { estado = 'pronto'; var l = espera; espera = []; l.forEach(function (f) { try { f(); } catch (e) {} }); };
    s.onerror = function () { estado = 'falhou'; espera = []; };
    document.head.appendChild(s);
  }
  function pronto() { return !!window.THREE; }
  function falhou() { return estado === 'falhou'; }

  function liberar() {
    if (!atual) return;
    var A = atual; atual = null;
    A.scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
    });
    if (A.envMap) A.envMap.dispose();
    try { A.renderer.dispose(); A.renderer.forceContextLoss(); } catch (e) {}
    if (A.canvas.parentNode) A.canvas.parentNode.removeChild(A.canvas);
  }

  function texturaCanvas(w, h, pinta) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; pinta(c.getContext('2d'), w, h);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- Modelo 3D profissional do carro (gráficos Médio e Alto) ----------
     "2026 Aston Martin AMR26" de Dave Love (@Tyler_Dave, Sketchfab), licença CC BY 4.0.
     Modificado: toda a pintura, logos e patrocínios foram removidos (_ferramentas/limpar-modelo.js); o jogo pinta com as próprias cores.
     Carrega depois da página; até chegar, o jogo usa o carro montado com peças simples (abaixo). */
  var URL_GLTF = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
  var MODELO_URL = 'assets/modelos/carro-2026.glb';
  var modelo = { estado: 'nada', cena: null };
  /* que parte do carro é cada material do modelo (pelo nome) */
  var PARTE = {
    chasis: 'c', chassis2: 'c', redbull_detail: 'f', gp21_cinture: 'f', carbon: 'carbLiso', generics: 'aro', cockpit_metal: 'aro', chrome: 'aro',
    redbull_wheel_hub: 'aro', discs: 'escuro', TIRE_SIDES: 'pneu', TIRE_TREAD: 'pneu', mirrors: 'viseira', glass: 'viseira', rear_light: 'luz'
  };
  var VOLANTE_MAT = /^(rtt_sw|sw_plastic|gp21_LCD|CLEARLED|TAG_DRS|kers_)/;
  function carregarModelo() {
    if (modelo.estado !== 'nada' || !window.THREE) return;
    modelo.estado = 'carregando';
    function ler() {
      new THREE.GLTFLoader().load(MODELO_URL, function (gl) {
        try { modelo.cena = prepararModelo(gl.scene); modelo.estado = 'pronto'; if (atual && atual.gq !== 'baixo') { trocarCarros(); window.dispatchEvent(new Event('resize')); } }
        catch (e) { modelo.estado = 'falhou'; modelo.erro = String(e && e.message || e); }
      }, undefined, function () { modelo.estado = 'falhou'; });
    }
    if (THREE.GLTFLoader) ler();
    else { var sc = document.createElement('script'); sc.src = URL_GLTF; sc.crossOrigin = 'anonymous'; sc.onload = ler; sc.onerror = function () { modelo.estado = 'falhou'; }; document.head.appendChild(sc); }
  }
  /* deixa o modelo no padrão do jogo: frente em +x, ~5,6 m, rodas no chão; pinta por partes; rodas giram; volante marcado */
  function prepararModelo(cena) {
    var T = THREE, raiz = new T.Group(), gira = new T.Group();
    gira.add(cena); raiz.add(gira);
    raiz.updateMatrixWorld(true);
    var caixa = new T.Box3().setFromObject(cena), tam = caixa.getSize(new T.Vector3()), centro = caixa.getCenter(new T.Vector3());
    var eixoZ = tam.z >= tam.x, comp = eixoZ ? tam.z : tam.x;
    /* qual ponta é a traseira: a que tem a peça mais alta (asa traseira) */
    var topoA = -1e9, topoB = -1e9, bx = new T.Box3();
    cena.traverse(function (m) {
      if (!m.isMesh) return;
      bx.setFromObject(m); var c = bx.getCenter(new T.Vector3()), p = eixoZ ? c.z - centro.z : c.x - centro.x;
      if (p > comp * 0.33) topoA = Math.max(topoA, bx.max.y); else if (p < -comp * 0.33) topoB = Math.max(topoB, bx.max.y);
    });
    var frenteMais = topoB > topoA; /* traseira no lado negativo = frente no lado positivo */
    if (eixoZ) gira.rotation.y = frenteMais ? Math.PI / 2 : -Math.PI / 2; else gira.rotation.y = frenteMais ? 0 : Math.PI;
    var esc = 5.6 / comp; gira.scale.setScalar(esc);
    raiz.updateMatrixWorld(true);
    caixa.setFromObject(cena);
    var c2 = caixa.getCenter(new T.Vector3());
    gira.position.set(-c2.x - 0.05, -caixa.min.y, -c2.z);
    raiz.updateMatrixWorld(true);
    /* pintura por partes (sem nenhuma imagem); adesivos escondidos */
    var rodaPecas = [], volante = new T.Box3(), temVolante = false;
    cena.traverse(function (m) {
      if (!m.isMesh) return;
      var nome = (m.material && m.material.name) || '';
      if (nome === 'decal') { m.visible = false; return; }
      var chave = PARTE[nome] || 'escuro';
      m.userData.mat = chave; m.material = new T.MeshLambertMaterial({ color: 0x777777 });
      if (chave === 'luz') m.userData.luz = 1;
      if (VOLANTE_MAT.test(nome)) { m.userData.abertura = 1; volante.expandByObject(m); temVolante = true; }
      if (/^(TIRE_|redbull_wheel_hub|discs)/.test(nome)) rodaPecas.push(m);
    });
    /* rodas: junta as peças de cada roda num eixo que gira */
    var grupos = {};
    rodaPecas.forEach(function (m) { bx.setFromObject(m); var c = bx.getCenter(new T.Vector3()), k = (c.x > 0 ? 'F' : 'T') + (c.z > 0 ? 'E' : 'D'); (grupos[k] = grupos[k] || []).push(m); });
    Object.keys(grupos).forEach(function (k) {
      var pneus = grupos[k].filter(function (m) { return /^TIRE_/.test(m.material.name || '') || m.userData.mat === 'pneu'; });
      var cx = new T.Box3(); (pneus.length ? pneus : grupos[k]).forEach(function (m) { cx.expandByObject(m); });
      var cc = cx.getCenter(new T.Vector3()), tamR = cx.getSize(new T.Vector3());
      var eixo = new T.Group(); eixo.position.copy(cc); eixo.userData.roda = 1; if (k.charAt(0) === 'F') eixo.userData.frente = 1; raiz.add(eixo); eixo.updateMatrixWorld(true);
      grupos[k].forEach(function (m) { eixo.attach(m); });
      /* faixa colorida do composto na lateral de fora do pneu */
      var r = tamR.y / 2, lado = cc.z > 0 ? 1 : -1;
      var faixa = new T.Mesh(new T.TorusGeometry(r * 0.8, 0.028, 4, 32), new T.MeshBasicMaterial({ color: 0xe3343c }));
      faixa.userData.mat = 'comp'; faixa.position.set(0, 0, lado * (tamR.z / 2 + 0.006)); eixo.add(faixa);
    });
    /* sombra redonda (gráficos médio) */
    var sombra = new T.Mesh(new T.PlaneGeometry(6, 2.3), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.set(-0.2, 0.04, 0); sombra.userData.sombra = 1; raiz.add(sombra);
    raiz.userData.glb = 1;
    if (temVolante) { var cv0 = volante.getCenter(new T.Vector3()); raiz.userData.volante = [cv0.x, cv0.y, cv0.z]; }
    return raiz;
  }
  /* troca os carros que já estão na pista pelo modelo novo */
  function trocarCarros() {
    var A = atual; if (!A) return;
    Object.keys(A.carros).forEach(function (id) { A.scene.remove(A.carros[id].g); });
    A.carros = {}; A.molde = null;
  }

  /* ---------- Carro de F1 2026 (x = para a frente, em metros; ~5,6 m de comprimento e 2 m de largura) ----------
     O molde é montado uma vez; cada carro é uma cópia com as suas cores. */
  function moldeCarro() {
    if (modelo.estado === 'pronto' && atual.gq !== 'baixo') return modelo.cena;
    var T = THREE, g = new T.Group(), gq = atual.gq, baixo = gq === 'baixo';
    function peca(geo, chave, x, y, z, rx, ry, rz) {
      var m = new T.Mesh(geo, atual.matBase[chave]); m.userData.mat = chave; m.position.set(x || 0, y || 0, z || 0);
      if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
      g.add(m); return m;
    }
    function caixa(w, h, d) { return new T.BoxGeometry(w, h, d); }
    /* forma vista de cima (x, z) levantada em altura */
    function deCima(pts, altura, bevel) {
      var s = new T.Shape(); pts.forEach(function (p, k) { if (k) s.lineTo(p[0], -p[1]); else s.moveTo(p[0], -p[1]); });
      var geo = new T.ExtrudeGeometry(s, { depth: altura, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
      geo.rotateX(-Math.PI / 2); return geo;
    }
    /* forma vista de lado (x, y) com uma largura */
    function deLado(pts, largura, bevel) {
      var s = new T.Shape(); pts.forEach(function (p, k) { if (k) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); });
      var geo = new T.ExtrudeGeometry(s, { depth: largura, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
      geo.translate(0, 0, -largura / 2); return geo;
    }
    function espelho(pts) { return pts.concat(pts.slice().reverse().map(function (p) { return [p[0], -p[1]]; })); }
    /* sombra redonda (gráficos baixo e médio) */
    var sombra = new T.Mesh(new T.PlaneGeometry(6, 2.3), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.set(-0.2, 0.05, 0); sombra.visible = gq !== 'alto'; g.add(sombra);
    /* assoalho e difusor */
    peca(deCima(espelho([[2.05, 0.22], [1.1, 0.42], [0.45, 0.86], [-1.3, 0.9], [-2.15, 0.76], [-2.55, 0.6]]), 0.04, 0), 'carb', 0, 0.07, 0);
    peca(caixa(0.45, 0.2, 1.0), 'carb', -2.62, 0.2, 0, 0, 0, -0.35);
    /* monocoque e bico (bico fino e baixo, como em 2026) */
    peca(deLado([[-0.35, 0.14], [1.05, 0.14], [1.05, 0.5], [0.95, 0.62], [-0.35, 0.64]], 0.56, 0.05), 'c', 0, 0, 0).userData.abertura = 1;
    /* barra entre dois pontos (braços de suspensão, hastes) */
    function barra(a, b, r, chave) {
      var d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
      var m = new T.Mesh(new T.CylinderGeometry(r, r, L, 6), atual.matBase[chave]); m.userData.mat = chave;
      m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); g.add(m); return m;
    }
    /* bico: cone comprido, fino e arredondado, um pouco inclinado para baixo */
    var geoBico = new T.CylinderGeometry(0.07, 0.17, 1.8, baixo ? 8 : 16); geoBico.rotateZ(-Math.PI / 2); geoBico.scale(1, 0.72, 1);
    peca(geoBico, 'c', 1.92, 0.33, 0, 0, 0, -0.07);
    peca(new T.SphereGeometry(0.07, 12, 8), 'c', 2.82, 0.27, 0).scale.set(1, 0.72, 1);
    peca(caixa(0.3, 0.02, 0.05), 'f', 2.2, 0.47, 0, 0, 0, -0.07);
    /* sidepods */
    peca(deCima(espelho([[0.38, 0.3], [0.32, 0.78], [-0.1, 0.84], [-0.95, 0.74], [-1.7, 0.42], [-1.85, 0.3]]), 0.36, 0.07), 'c', 0, 0.14, 0);
    peca(caixa(0.1, 0.24, 0.34), 'escuro', 0.42, 0.34, 0.6); peca(caixa(0.1, 0.24, 0.34), 'escuro', 0.42, 0.34, -0.6);
    /* cobertura do motor com a tomada de ar e barbatana */
    peca(deLado([[0.0, 0.3], [0.0, 0.66], [-0.15, 0.98], [-0.55, 1.02], [-1.3, 0.8], [-2.35, 0.52], [-2.45, 0.3]], 0.42, 0.05), 'c', 0, 0, 0);
    peca(caixa(0.06, 0.2, 0.26), 'escuro', 0.02, 0.86, 0).userData.abertura = 1;
    if (!baixo) peca(deLado([[-0.9, 0.95], [-2.3, 1.0], [-2.3, 0.62], [-1.5, 0.78]], 0.02, 0), 'c', 0, 0, 0);
    /* faixa colorida no topo e câmera de TV */
    peca(caixa(3.2, 0.02, 0.1), 'f', 0.95, 0.52, 0).userData.abertura = 1;
    peca(caixa(1.9, 0.02, 0.09), 'f', -1.3, 0.83, 0, 0, 0, 0.2).userData.abertura = 1;
    peca(caixa(0.14, 0.07, 0.16), 'f', -0.3, 1.06, 0).userData.abertura = 1;
    /* cockpit, capacete e halo */
    peca(caixa(0.8, 0.04, 0.4), 'escuro', 0.5, 0.64, 0).userData.abertura = 1;
    peca(new T.SphereGeometry(0.16, 14, 10), 'f', 0.36, 0.76, 0).userData.capacete = 1;
    g.children[g.children.length - 1].userData.capacete = 1;
    peca(caixa(0.05, 0.07, 0.2), 'viseira', 0.5, 0.78, 0).userData.abertura = 1;
    var halo = peca(new T.TorusGeometry(0.36, 0.034, 8, 24, Math.PI * 1.5), 'carb', 0.42, 0.95, 0);
    halo.rotation.set(-Math.PI / 2, 0, -0.75 * Math.PI); halo.scale.set(1.3, 1, 1);
    peca(caixa(0.05, 0.32, 0.06), 'carb', 0.88, 0.8, 0, 0, 0, 0.25);
    /* retrovisores */
    if (!baixo) { [1, -1].forEach(function (s) { barra([0.7, 0.5, s * 0.42], [0.74, 0.76, s * 0.6], 0.012, 'carb'); peca(caixa(0.08, 0.07, 0.19), 'c', 0.76, 0.79, s * 0.64); peca(caixa(0.01, 0.05, 0.16), 'viseira', 0.715, 0.79, s * 0.64); }); }
    /* asa dianteira: plano principal de carbono, dois flaps coloridos e placas laterais */
    var SEG = baixo ? 6 : 14;
    [[0.34, 2.74, 0.075, 0.1, 0.08, 'carb'], [0.2, 2.6, 0.13, 0.15, 0.35, 'c'], [0.16, 2.49, 0.18, 0.19, 0.62, 'f']].forEach(function (el) {
      var corda = el[0], x = el[1], base = el[2], sobe = el[3], ataque = el[4], chave = el[5];
      function yEm(z) { return base + sobe * Math.pow(Math.abs(z) / 0.95, 1.6); }
      for (var k = 0; k < SEG; k++) {
        var z0 = -0.95 + 1.9 * k / SEG, z1 = -0.95 + 1.9 * (k + 1) / SEG, y0 = yEm(z0), y1 = yEm(z1), fi = Math.atan2(y1 - y0, z1 - z0);
        var seg = peca(caixa(corda, 0.02, Math.hypot(z1 - z0, y1 - y0) + 0.004), chave, x, (y0 + y1) / 2, (z0 + z1) / 2);
        seg.rotation.set(-fi, 0, ataque);
      }
    });
    [1, -1].forEach(function (s) {
      peca(deLado([[2.4, 0.04], [2.98, 0.04], [2.95, 0.3], [2.62, 0.42], [2.4, 0.4]], 0.025, 0), 'carb', 0, 0, s * 0.97);
      peca(caixa(0.3, 0.025, 0.03), 'f', 2.8, 0.31, s * 0.985);
      peca(caixa(0.3, 0.16, 0.02), 'carb', 2.62, 0.16, s * 0.13, 0, 0, 0.1);
    });
    /* asa traseira com placas, asa de feixe e pilone */
    peca(caixa(0.38, 0.035, 1.02), 'c', -2.68, 0.9, 0, 0, 0, -0.15);
    peca(caixa(0.22, 0.03, 1.0), 'f', -2.56, 1.03, 0, 0, 0, -0.5);
    [1, -1].forEach(function (s) { peca(deLado([[-2.98, 0.42], [-2.35, 0.42], [-2.35, 1.1], [-2.98, 1.14]], 0.03, 0), 'carb', 0, 0, s * 0.53); peca(caixa(0.6, 0.04, 0.035), 'f', -2.66, 1.12, s * 0.53); });
    peca(caixa(0.26, 0.03, 0.9), 'carb', -2.78, 0.45, 0, 0, 0, -0.2);
    peca(caixa(0.12, 0.5, 0.06), 'carb', -2.58, 0.66, 0);
    /* luz de freio e de chuva */
    var luz = peca(caixa(0.04, 0.1, 0.16), 'luz', -2.99, 0.62, 0); luz.userData.luz = 1;
    /* rodas: pneu com ombro arredondado, faixa colorida do composto e aro */
    function roda(x, z, r, larg) {
      var rg = new T.Group(); rg.position.set(x, r, z); rg.userData.roda = 1; if (x > 0) rg.userData.frente = 1;
      function p2(geo, chave, px, py, pz, rx) { var m = new T.Mesh(geo, atual.matBase[chave]); m.userData.mat = chave; m.position.set(px, py, pz); if (rx) m.rotation.x = rx; rg.add(m); return m; }
      p2(new T.CylinderGeometry(r - 0.03, r - 0.03, larg, 24), 'pneu', 0, 0, 0, Math.PI / 2);
      var s = z > 0 ? 1 : -1;
      if (!baixo) { p2(new T.TorusGeometry(r - 0.045, 0.045, 6, 24), 'pneu', 0, 0, s * (larg / 2 - 0.01)); p2(new T.TorusGeometry(r - 0.045, 0.045, 6, 24), 'pneu', 0, 0, -s * (larg / 2 - 0.01)); }
      p2(new T.TorusGeometry(r * 0.78, 0.03, 4, 28), 'comp', 0, 0, s * (larg / 2 + 0.02));
      p2(new T.CylinderGeometry(r * 0.6, r * 0.6, larg + 0.03, 16), 'aro', 0, 0, 0, Math.PI / 2);
      p2(caixa(r * 1.1, 0.05, 0.02), 'aro', 0, 0, s * (larg / 2 + 0.03));
      p2(new T.CylinderGeometry(0.06, 0.06, larg + 0.06, 8), 'luzAro', 0, 0, 0, Math.PI / 2);
      g.add(rg);
      /* braços da suspensão (triângulos de cima e de baixo) */
      var zc = s * (Math.abs(z) - larg / 2 - 0.04), frente = x > 0, zi = s * (frente ? 0.15 : 0.26);
      if (!baixo) {
        barra([x - 0.28, r + 0.12, zi], [x, r + 0.14, zc], 0.016, 'carb'); barra([x + 0.28, r + 0.12, zi], [x, r + 0.14, zc], 0.016, 'carb');
        barra([x - 0.3, 0.2, zi], [x, r - 0.14, zc], 0.016, 'carb'); barra([x + 0.3, 0.2, zi], [x, r - 0.14, zc], 0.016, 'carb');
        barra([x, r - 0.1, s * (Math.abs(zc) - 0.03)], [x - 0.12, frente ? 0.56 : 0.5, zi], 0.014, 'carb');
        if (frente) barra([x + 0.14, r + 0.02, zi], [x + 0.1, r, zc], 0.012, 'carb');
      } else barra([x, r, zi], [x, r, zc], 0.025, 'carb');
    }
    roda(1.6, 0.97, 0.36, 0.33); roda(1.6, -0.97, 0.36, 0.33); roda(-2.1, 0.93, 0.37, 0.42); roda(-2.1, -0.93, 0.37, 0.42);
    return g;
  }
  function criarCarro(visual) {
    var T = THREE, A = atual;
    if (!A.molde) A.molde = moldeCarro();
    var g = A.molde.clone(true), rodas = [], frente = [], luz = null, capacete = null, abertura = null;
    var mats = {
      c: visual.id === 'preto' ? (A.molde.userData.glb ? novoMat(0x121315, true) : (A.matPreto || (A.matPreto = matFibra()))) : novoMat(visual.cor, true), f: novoMat(visual.friso, true),
      comp: new T.MeshBasicMaterial({ color: 0xe3343c }), luz: new T.MeshBasicMaterial({ color: 0x3a0a0a })
    };
    g.traverse(function (m) {
      if (m.userData.roda) { rodas.push(m); if (m.userData.frente) frente.push(m); }
      if (m.isMesh && m.userData.mat) { m.material = mats[m.userData.mat] || A.matBase[m.userData.mat]; if (A.gq === 'alto') m.castShadow = true; }
      if (m.userData.luz) luz = m;
      if (m.userData.capacete) capacete = m;
      if (m.userData.abertura) (abertura = abertura || []).push(m);
      if (m.userData.sombra) m.visible = A.gq !== 'alto';
    });
    var spray = new T.Sprite(new T.SpriteMaterial({ map: A.texSpray, transparent: true, opacity: 0, depthWrite: false }));
    spray.position.set(-5, 0.9, 0); spray.scale.set(6, 2.4, 1); spray.visible = false; g.add(spray);
    var seta = new T.Mesh(new T.ConeGeometry(0.7, 1.4, 4), new T.MeshBasicMaterial({ color: 0xffe14d }));
    seta.rotation.z = Math.PI; seta.position.set(0, 4, 0); seta.visible = false; g.add(seta);
    A.scene.add(g);
    return { g: g, rodas: rodas, frente: frente, luz: luz, capacete: capacete, abertura: abertura, mComp: mats.comp, spray: spray, seta: seta, glb: !!A.molde.userData.glb, volante: A.molde.userData.volante };
  }
  /* ---------- Cockpit (câmera do piloto) ----------
     Interior de fibra de carbono, bordas na cor do carro e um volante no estilo dos F1 atuais (sem marca):
     formato recortado, pegadas de borracha, tela no meio, luzes de troca de marcha, botões e seletores giratórios.
     Fica preso ao seu carro, em metros (x = para a frente). */
  function criarCockpit(k, visual) {
    var T = THREE, A = atual, g = new T.Group();
    var mCarro = novoMat(visual.cor, true), mCarb = A.matBase.carb, mInterior = new T.MeshLambertMaterial({ color: 0x131417 }), mBorracha = new T.MeshLambertMaterial({ color: 0x0e0e10 });
    function peca(geo, mat, x, y, z, pai) { var m = new T.Mesh(geo, mat); m.position.set(x, y, z); (pai || g).add(m); return m; }
    /* interior: assoalho das pernas, paredes laterais escuras, painel da frente (só no carro simples; o modelo tem o cockpit dele) */
    if (!k.glb) peca(new T.BoxGeometry(1.3, 0.04, 0.5), mInterior, 0.4, 0.34, 0);
    if (!k.glb) [1, -1].forEach(function (s) {
      var parede = peca(new T.BoxGeometry(1.25, 0.34, 0.04), mInterior, 0.35, 0.5, s * 0.27); parede.rotation.x = s * 0.12;
      peca(new T.BoxGeometry(1.25, 0.025, 0.1), mCarro, 0.35, 0.68, s * 0.3);            /* borda do cockpit, na cor do carro */
      peca(new T.BoxGeometry(0.35, 0.12, 0.1), mInterior, -0.12, 0.72, s * 0.2);         /* apoio da cabeça */
    });
    if (!k.glb) {
      peca(new T.BoxGeometry(0.42, 0.05, 0.5), mCarb, 0.8, 0.58, 0);                        /* painel à frente das pernas */
      peca(new T.BoxGeometry(0.36, 0.03, 0.3), mCarro, 1.02, 0.6, 0);                     /* começo do bico */
      peca(new T.CylinderGeometry(0.018, 0.018, 0.28, 8), mCarb, 0.56, 0.6, 0).rotation.z = Math.PI / 2 + 0.35; /* coluna de direção */
    }
    /* volante: contorno recortado, levantado em espessura; a face vira para o piloto */
    function contorno(pts, prof, bevel, mat, pai) {
      var sh = new T.Shape(); pts.forEach(function (p, i) { if (i) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
      var geo = new T.ExtrudeGeometry(sh, { depth: prof, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 6 });
      geo.rotateY(-Math.PI / 2);
      var m = new T.Mesh(geo, mat); pai.add(m); return m;
    }
    var suporte = new T.Group(); suporte.rotation.z = -0.35; g.add(suporte);
    if (k.glb && k.volante) { suporte.position.set(k.volante[0] - 0.07, k.volante[1] + 0.01, 0); suporte.scale.setScalar(0.95); } else suporte.position.set(0.4, 0.66, 0);
    var vol = new T.Group(); suporte.add(vol);
    var FACE = -0.038;
    contorno([[-0.105, 0.065], [0.105, 0.065], [0.125, 0.05], [0.13, 0.02], [0.13, -0.05], [0.11, -0.075], [0.07, -0.06], [-0.07, -0.06], [-0.11, -0.075], [-0.13, -0.05], [-0.13, 0.02], [-0.125, 0.05]], 0.03, 0.006, mCarb, vol);
    var pega = [[0.12, 0.045], [0.165, 0.035], [0.178, 0.0], [0.172, -0.06], [0.15, -0.092], [0.12, -0.082], [0.124, -0.03]];
    contorno(pega, 0.05, 0.012, mBorracha, vol);
    contorno(pega.map(function (p) { return [-p[0], p[1]]; }).reverse(), 0.05, 0.012, mBorracha, vol);
    /* tela (atualizada 10 vezes por segundo) */
    var cv = document.createElement('canvas'); cv.width = 256; cv.height = 150;
    var tex = new T.CanvasTexture(cv);
    var moldura = peca(new T.PlaneGeometry(0.112, 0.07), new T.MeshBasicMaterial({ color: 0x050607 }), FACE - 0.001, 0.002, 0, vol); moldura.rotation.y = -Math.PI / 2;
    var tela = peca(new T.PlaneGeometry(0.104, 0.061), new T.MeshBasicMaterial({ map: tex }), FACE - 0.002, 0.002, 0, vol); tela.rotation.y = -Math.PI / 2;
    /* luzes de troca de marcha */
    var leds = [], coresLed = [0x2bd45a, 0x2bd45a, 0x2bd45a, 0x2bd45a, 0x2bd45a, 0xff2a2a, 0xff2a2a, 0xff2a2a, 0xff2a2a, 0xff2a2a, 0x8a5bff, 0x8a5bff, 0x8a5bff, 0x8a5bff, 0x8a5bff];
    coresLed.forEach(function (c, i) {
      var m = new T.MeshBasicMaterial({ color: 0x1a1a1a });
      peca(new T.BoxGeometry(0.004, 0.007, 0.0075), m, FACE - 0.001, 0.051, -0.0665 + i * 0.0095, vol);
      leds.push({ m: m, cor: c });
    });
    /* botões coloridos dos lados da tela */
    [[0.03, 0.09, 0x2bd45a], [0.005, 0.095, 0xf2c14e], [-0.022, 0.095, 0x1f6feb], [0.03, -0.09, 0xf07b2b], [0.005, -0.095, 0xd7263d], [-0.022, -0.095, 0xe9ecef]].forEach(function (b) {
      var bt = peca(new T.CylinderGeometry(0.0075, 0.0075, 0.008, 12), new T.MeshLambertMaterial({ color: b[2] }), FACE - 0.002, b[0], b[1], vol); bt.rotation.z = Math.PI / 2;
    });
    /* seletores giratórios embaixo, com anel colorido e marca branca */
    [[-0.075, -0.035, 0x22b8cf], [-0.078, 0.0, 0xf2c14e], [-0.075, 0.035, 0xd7263d]].forEach(function (r) {
      var gir = peca(new T.CylinderGeometry(0.012, 0.012, 0.012, 16), mBorracha, FACE - 0.003, r[0] + 0.02, r[1], vol); gir.rotation.z = Math.PI / 2;
      var anel = peca(new T.TorusGeometry(0.0125, 0.002, 6, 20), new T.MeshBasicMaterial({ color: r[2] }), FACE - 0.009, r[0] + 0.02, r[1], vol); anel.rotation.y = Math.PI / 2;
      peca(new T.BoxGeometry(0.002, 0.008, 0.002), new T.MeshBasicMaterial({ color: 0xffffff }), FACE - 0.01, r[0] + 0.026, r[1], vol);
    });
    k.g.add(g); g.visible = false;
    return { g: g, vol: vol, cv: cv, ctx: cv.getContext('2d'), tex: tex, leds: leds, esterco: 0, proxTela: 0 };
  }
  function atualizarCockpit(ck, c, dt, giroPorS, agora) {
    /* volante gira com a curva */
    var alvo = c.st != null ? c.st * 1.7 : Math.max(-1.4, Math.min(1.4, giroPorS * 1.6));
    ck.esterco += (alvo - ck.esterco) * Math.min(1, dt * 8);
    ck.vol.rotation.x = ck.esterco;
    var TOPO = [0, 85, 125, 160, 195, 230, 265, 300, 350], km = (c.v || 0) * 3.6, marcha = c.marcha || Math.max(1, Math.min(8, Math.ceil(km / 42)));
    var dentro = km <= 1 ? 0 : Math.min(1, km / TOPO[marcha]);
    var acesas = Math.round(dentro * 15), pisca = acesas >= 14 && Math.floor(agora / 80) % 2;
    ck.leds.forEach(function (l, i) { l.m.color.setHex(i < acesas && !pisca ? l.cor : 0x1a1a1a); });
    if (agora < ck.proxTela) return;
    ck.proxTela = agora + 100;
    var x = ck.ctx, W = 256, H = 150;
    x.fillStyle = '#05070a'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#2a2f36'; x.lineWidth = 2; x.strokeRect(58, 8, 140, 104);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = 'bold 76px Arial'; x.fillText(km < 2 ? 'N' : String(marcha), 128, 62);
    x.font = 'bold 26px Arial'; x.textAlign = 'left'; x.fillText(String(Math.round(km)), 6, 26);
    x.font = '14px Arial'; x.fillStyle = '#9aa0a6'; x.fillText('KM/H', 6, 48);
    x.textAlign = 'right'; x.font = 'bold 26px Arial'; x.fillStyle = '#ffffff'; x.fillText(c.pos ? 'P' + c.pos : 'Q', 250, 26);
    x.font = '14px Arial'; x.fillStyle = '#9aa0a6'; x.fillText(c.volta || '', 250, 48);
    /* bateria */
    var e = Math.max(0, Math.min(1, c.energia == null ? 1 : c.energia));
    x.fillStyle = '#1b1e22'; x.fillRect(8, 120, 240, 24);
    x.fillStyle = c.bat ? '#7cc4ff' : e > 0.25 ? '#f2d21e' : '#e3343c'; x.fillRect(8, 120, 240 * e, 24);
    x.fillStyle = '#0b0c0e'; x.font = 'bold 16px Arial'; x.textAlign = 'center'; x.fillText('⚡ ' + Math.round(e * 100) + '%', 128, 133);
    ck.tex.needsUpdate = true;
  }
  /* fibra de carbono brilhante (carro preto) */
  function matFibra() {
    var T = THREE, A = atual, tx = A.matBase.carb.map;
    if (A.gq === 'alto') return new T.MeshStandardMaterial({ color: 0x8c9096, map: tx, metalness: 0.2, roughness: 0.28, envMap: A.envMap, envMapIntensity: 0.45 });
    if (A.gq === 'baixo') return new T.MeshLambertMaterial({ color: 0x17181b });
    return new T.MeshPhongMaterial({ color: 0xd8d8d8, map: tx, shininess: 80, specular: 0x3a3a3a });
  }
  /* pintura: no alto, reflete o céu (metálica); no médio, brilho simples; no baixo, fosca */
  function novoMat(cor, brilho) {
    var T = THREE, A = atual;
    if (A.gq === 'alto') return new T.MeshStandardMaterial({ color: cor, metalness: brilho ? 0.35 : 0.15, roughness: brilho ? 0.22 : 0.5, envMap: A.envMap, envMapIntensity: 1.1 });
    if (A.gq === 'baixo') return new T.MeshLambertMaterial({ color: cor });
    return new T.MeshPhongMaterial({ color: cor, shininess: brilho ? 70 : 20, specular: brilho ? 0x555555 : 0x222222 });
  }

  /* ---------- Monta o mundo da pista ---------- */
  function montar(caixaEl, PF, clima, gq, relevo) {
    liberar();
    gq = gq === 'baixo' || gq === 'alto' ? gq : 'medio';
    var T = THREE, molh = clima && clima !== 'seco', baixo = gq === 'baixo', alto = gq === 'alto', medio = gq === 'medio', dpr = window.devicePixelRatio || 1;
    var renderer = new T.WebGLRenderer({ antialias: !baixo, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
    renderer.setPixelRatio(baixo ? Math.min(dpr, 1) * 0.75 : alto ? Math.min(dpr, 2) : Math.min(dpr, 1.5));
    if (alto) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; }
    var cv = renderer.domElement; cv.className = 'ch-3d'; caixaEl.insertBefore(cv, caixaEl.firstChild);
    var scene = new T.Scene();
    var ceu = molh ? (clima === 'forte' ? 0x5b646e : 0x78838e) : 0x9cc3e6, topoCeu = molh ? 0x4a525c : 0x3d7cc9;
    scene.background = new T.Color(ceu); scene.fog = new T.Fog(ceu, baixo ? 120 : 160, baixo ? 480 : molh ? (alto ? 720 : 620) : (alto ? 1500 : 1100));
    var camera = new T.PerspectiveCamera(60, 1, 0.5, baixo ? 900 : 2600);
    scene.add(new T.HemisphereLight(0xe4f0ff, 0x2c3a25, molh ? 0.8 : alto ? 0.75 : 1.0));
    var sol = new T.DirectionalLight(0xfff6e8, molh ? 0.3 : alto ? 1.1 : 0.8); sol.position.set(DIR_SOL[0] * 300, DIR_SOL[1] * 300, DIR_SOL[2] * 300); scene.add(sol); scene.add(sol.target);
    if (alto) {
      /* sombra de verdade, só perto do seu carro (a luz acompanha a câmera) */
      sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
      var sc0 = sol.shadow.camera; sc0.left = -45; sc0.right = 45; sc0.top = 45; sc0.bottom = -45; sc0.near = 1; sc0.far = 400; sol.shadow.bias = -0.0006;
    }
    atual = { caixa: caixaEl, PF: PF, clima: clima, gq: gq, relevo: relevo, renderer: renderer, canvas: cv, scene: scene, camera: camera, sol: sol, carros: {}, W: 0, H: 0, fov: 60 };
    atual.texSpray = texturaCanvas(64, 64, function (x, w, h) {
      var gr = x.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(230,236,244,.9)'); gr.addColorStop(1, 'rgba(230,236,244,0)');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
    });
    /* reflexo do céu na pintura (gráfico alto) */
    if (alto) {
      var pm = new T.PMREMGenerator(renderer), cenaEnv = new T.Scene(), eg = new T.SphereGeometry(50, 24, 12), ec = [];
      var cTopo = new T.Color(topoCeu), cHor = new T.Color(ceu), cChao = new T.Color(molh ? 0x2a3a2c : 0x3a5a36);
      for (var ei = 0; ei < eg.attributes.position.count; ei++) { var ey = eg.attributes.position.getY(ei) / 50, ecor = ey > 0 ? cHor.clone().lerp(cTopo, Math.min(1, ey * 1.8)) : cHor.clone().lerp(cChao, Math.min(1, -ey * 4)); ec.push(ecor.r, ecor.g, ecor.b); }
      eg.setAttribute('color', new T.Float32BufferAttribute(ec, 3));
      cenaEnv.add(new T.Mesh(eg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
      var sq = new T.Mesh(new T.SphereGeometry(3, 8, 6), new T.MeshBasicMaterial({ color: 0xffffff })); sq.position.set(DIR_SOL[0] * 45, DIR_SOL[1] * 45, DIR_SOL[2] * 45); cenaEnv.add(sq);
      atual.envMap = pm.fromScene(cenaEnv, 0.02).texture; pm.dispose();
      eg.dispose();
    }
    var texCarbono = baixo ? null : texturaCanvas(32, 32, function (x, w, h) { for (var a = 0; a < w; a += 4) for (var b = 0; b < h; b += 4) { x.fillStyle = ((a + b) / 4) % 2 ? '#1c1d21' : '#141518'; x.fillRect(a, b, 4, 4); } });
    if (texCarbono) { texCarbono.wrapS = texCarbono.wrapT = T.RepeatWrapping; texCarbono.repeat.set(4, 4); }
    if (!baixo) carregarModelo();
    atual.matBase = {
      carb: alto ? new T.MeshStandardMaterial({ color: 0xffffff, map: texCarbono, metalness: 0.3, roughness: 0.4, envMap: atual.envMap }) : texCarbono ? new T.MeshPhongMaterial({ map: texCarbono, shininess: 40, specular: 0x333333 }) : new T.MeshLambertMaterial({ color: 0x17181b }),
      escuro: new T.MeshLambertMaterial({ color: 0x08090a }),
      carbLiso: alto ? new T.MeshStandardMaterial({ color: 0x1b1c20, metalness: 0.3, roughness: 0.35, envMap: atual.envMap }) : baixo ? new T.MeshLambertMaterial({ color: 0x17181b }) : new T.MeshPhongMaterial({ color: 0x1b1c20, shininess: 60, specular: 0x333333 }),
      viseira: alto ? new T.MeshStandardMaterial({ color: 0x1b2733, metalness: 0.8, roughness: 0.1, envMap: atual.envMap }) : new T.MeshLambertMaterial({ color: 0x1b2733 }),
      pneu: alto ? new T.MeshStandardMaterial({ color: 0x151517, roughness: 0.85, metalness: 0 }) : new T.MeshLambertMaterial({ color: 0x151517 }),
      aro: alto ? new T.MeshStandardMaterial({ color: 0x2c2f35, metalness: 0.7, roughness: 0.35, envMap: atual.envMap }) : new T.MeshLambertMaterial({ color: 0x3a3d42 }),
      luzAro: new T.MeshLambertMaterial({ color: 0xb0121b }),
      comp: new T.MeshBasicMaterial({ color: 0xe3343c }), luz: new T.MeshBasicMaterial({ color: 0x3a0a0a }),
      c: new T.MeshLambertMaterial({ color: 0x777777 }), f: new T.MeshLambertMaterial({ color: 0xffffff })
    };

    /* pontos da pista em metros */
    var P = PF.P, N = PF.N, esc = PF.L / P.total, cx = 200, cy = 150;
    var X = new Float32Array(N), Z = new Float32Array(N), NX = new Float32Array(N), NZ = new Float32Array(N), i, j;
    for (i = 0; i < N; i++) { X[i] = (PF.pts[i].x - cx) * esc; Z[i] = (PF.pts[i].y - cy) * esc; }
    /* traçado liso: tira as "quinas" do desenho original (média com os vizinhos), para o carro contornar a curva sem trancos */
    /* (o desenho precisa desse alisamento para o carro não dar trancos; a velocidade das curvas vem da física, que usa o formato real) */
    for (var passada = 0; passada < 2; passada++) {
      var XS = new Float32Array(N), ZS = new Float32Array(N), PES = [1, 2, 3, 4, 3, 2, 1];
      for (i = 0; i < N; i++) { var sx = 0, sz = 0; for (var kp = -3; kp <= 3; kp++) { var ip = (i + kp + N) % N; sx += X[ip] * PES[kp + 3]; sz += Z[ip] * PES[kp + 3]; } XS[i] = sx / 16; ZS[i] = sz / 16; }
      X = XS; Z = ZS;
    }
    for (i = 0; i < N; i++) { var a = (i - 1 + N) % N, b = (i + 1) % N, tx = X[b] - X[a], tz = Z[b] - Z[a], l = Math.hypot(tx, tz) || 1; NX[i] = -tz / l; NZ[i] = tx / l; }
    var perto = new Uint8Array(N), zebra = new Uint8Array(N);
    PF.curvas.forEach(function (c) { for (var k = -16; k <= 10; k++) perto[(c + k + N) % N] = 1; for (k = -9; k <= 7; k++) zebra[(c + k + N) % N] = 1; });
    atual.esc = esc; atual.cx = cx; atual.cy = cy; atual.X = X; atual.Z = Z; atual.N = N;
    /* relevo real (circuitos-altura.js): altura em metros para cada fração da volta */
    /* relevo: só as subidas e descidas grandes (média larga, ~300 m), sem ondulação; ou pista plana */
    var ALT0 = relevo === 'plano' ? null : (window.CIRCUITOS_ALTURA || {})[P.nome] || null, ALT = null;
    if (ALT0) {
      var nA = ALT0.length, sig = 10, pesos = [], soma = 0;
      for (var kq = -30; kq <= 30; kq++) { var pw = Math.exp(-kq * kq / (2 * sig * sig)); pesos.push(pw); soma += pw; }
      ALT = ALT0.map(function (_, ia) { var t2 = 0; for (var kq = -30; kq <= 30; kq++) t2 += ALT0[(ia + kq + nA * 2) % nA] * pesos[kq + 30]; return t2 / soma; });
      var minA = Math.min.apply(null, ALT); ALT = ALT.map(function (v) { return v - minA; });
    }
    function altF(f) { if (!ALT) return 0; var n = ALT.length, x = (((f % 1) + 1) % 1) * n, i0 = Math.floor(x) % n, t = x - Math.floor(x); return ALT[i0] * (1 - t) + ALT[(i0 + 1) % n] * t; }
    var HY = new Float32Array(N); for (i = 0; i < N; i++) HY[i] = altF(i / N);
    atual.altF = altF;

    /* grade de busca rápida: qual ponto da pista está mais perto de um lugar */
    var CEL = 25, grade = {};
    for (i = 0; i < N; i++) { var kk = Math.floor(X[i] / CEL) + ',' + Math.floor(Z[i] / CEL); (grade[kk] || (grade[kk] = [])).push(i); }
    function maisPerto(x, z, raio) {
      var melhor = raio * raio, mi = -1, x0 = Math.floor((x - raio) / CEL), x1 = Math.floor((x + raio) / CEL), z0 = Math.floor((z - raio) / CEL), z1 = Math.floor((z + raio) / CEL);
      for (var gx = x0; gx <= x1; gx++) for (var gz = z0; gz <= z1; gz++) {
        var lst = grade[gx + ',' + gz]; if (!lst) continue;
        for (var q = 0; q < lst.length; q++) { var k = lst[q], dd = (X[k] - x) * (X[k] - x) + (Z[k] - z) * (Z[k] - z); if (dd < melhor) { melhor = dd; mi = k; } }
      }
      return { d: Math.sqrt(melhor), i: mi };
    }
    /* um ponto a "d" metros do centro da pista só vale se não cair por cima de outra parte da pista (curva fechada ou trecho vizinho) */
    function livre(x, z, d, minimo) { var r = Math.max(Math.abs(d), minimo || 0); return maisPerto(x, z, r).d >= r - 0.8; }

    function faixa(offA, offB, y, cor, filtro, corDe, checar) {
      var pos = [], col = [], uv = [], c = new T.Color();
      for (var i = 0; i < N; i++) {
        if (filtro && !filtro(i)) continue;
        var j = (i + 1) % N;
        var a0 = typeof offA === 'function' ? offA(i) : offA, b0 = typeof offB === 'function' ? offB(i) : offB;
        var a1 = typeof offA === 'function' ? offA(j) : offA, b1 = typeof offB === 'function' ? offB(j) : offB;
        var p1x = X[i] + NX[i] * a0, p1z = Z[i] + NZ[i] * a0, p2x = X[i] + NX[i] * b0, p2z = Z[i] + NZ[i] * b0;
        var p3x = X[j] + NX[j] * a1, p3z = Z[j] + NZ[j] * a1, p4x = X[j] + NX[j] * b1, p4z = Z[j] + NZ[j] * b1;
        if (checar && !(livre(p1x, p1z, a0) && livre(p2x, p2z, b0) && livre(p3x, p3z, a1) && livre(p4x, p4z, b1))) continue;
        var yi = y + HY[i], yj = y + HY[j];
        pos.push(p1x, yi, p1z, p2x, yi, p2z, p3x, yj, p3z, p2x, yi, p2z, p4x, yj, p4z, p3x, yj, p3z);
        var v0 = i * PF.ds / 12, v1 = v0 + PF.ds / 12; uv.push(0, v0, 1, v0, 0, v1, 1, v0, 1, v1, 0, v1);
        c.set(corDe ? corDe(i) : cor); for (var k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
      }
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
      return g;
    }
    function add(geo, mat) { var m = new T.Mesh(geo, mat); if (alto) m.receiveShadow = true; scene.add(m); return m; }
    function ruido(tam, base, varia, seed) {
      var sd = seed || 3; function r() { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; }
      return texturaCanvas(tam, tam, function (x, w, h) { x.fillStyle = base; x.fillRect(0, 0, w, h); for (var k = 0; k < w * h / 6; k++) { var v = (r() - 0.5) * varia; x.fillStyle = v > 0 ? 'rgba(255,255,255,' + v + ')' : 'rgba(0,0,0,' + (-v) + ')'; x.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5); } });
    }
    var mCor = new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide });

    /* grama com faixas de corte */
    var texGrama = texturaCanvas(alto ? 256 : 64, alto ? 256 : 64, function (x, w, h) {
      if (PF.rua) { /* cidade: calçada e asfalto velho no lugar da grama */
        x.fillStyle = molh ? '#55585c' : '#7a7c80'; x.fillRect(0, 0, w, h); x.fillStyle = molh ? '#4f5256' : '#727478'; x.fillRect(0, 0, w, h / 2);
        x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, h / 2 - 1, w, 2); x.fillRect(w / 2 - 1, 0, 2, h);
      } else { x.fillStyle = molh ? '#2a4a2a' : '#3a6b35'; x.fillRect(0, 0, w, h); x.fillStyle = molh ? '#264427' : '#346230'; x.fillRect(0, 0, w / 2, h); }
      if (alto) { var sd = 5; for (var k = 0; k < 9000; k++) { sd = (sd * 9301 + 49297) % 233280; var a = sd / 233280; sd = (sd * 9301 + 49297) % 233280; var b = sd / 233280; x.fillStyle = k % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; x.fillRect(a * w, b * h, 2, 2); } }
    });
    texGrama.wrapS = texGrama.wrapT = T.RepeatWrapping; texGrama.repeat.set(290, 290);
    var mGrama = new T.MeshLambertMaterial({ map: texGrama });
    var minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    for (i = 0; i < N; i++) { minX = Math.min(minX, X[i]); maxX = Math.max(maxX, X[i]); minZ = Math.min(minZ, Z[i]); maxZ = Math.max(maxZ, Z[i]); }
    /* altura do chão: abaixo de TODAS as partes da pista por perto (assim a grama nunca aparece por cima do asfalto) */
    function chaoEm(x, z) {
      var raio = 55, minH = 1e9, md = 1e12, mi = 0, x0 = Math.floor((x - raio) / CEL), x1 = Math.floor((x + raio) / CEL), z0 = Math.floor((z - raio) / CEL), z1 = Math.floor((z + raio) / CEL);
      for (var gx = x0; gx <= x1; gx++) for (var gz = z0; gz <= z1; gz++) {
        var lst = grade[gx + ',' + gz]; if (!lst) continue;
        for (var q = 0; q < lst.length; q++) { var k = lst[q], dd = (X[k] - x) * (X[k] - x) + (Z[k] - z) * (Z[k] - z); if (dd < raio * raio && HY[k] < minH) minH = HY[k]; if (dd < md) { md = dd; mi = k; } }
      }
      if (minH < 1e9) {
        /* média das alturas por perto, pesando muito mais o ponto mais perto (assim o chão acompanha a pista sem valas nas subidas) */
        var sp = 0, sh = 0;
        for (var gx2 = x0; gx2 <= x1; gx2++) for (var gz2 = z0; gz2 <= z1; gz2++) {
          var l2 = grade[gx2 + ',' + gz2]; if (!l2) continue;
          for (var q2 = 0; q2 < l2.length; q2++) { var k3 = l2[q2], d3 = (X[k3] - x) * (X[k3] - x) + (Z[k3] - z) * (Z[k3] - z); if (d3 < raio * raio) { var pw2 = 1 / Math.pow(d3 + 4, 2); sp += pw2; sh += HY[k3] * pw2; } }
        }
        return { h: Math.min(sh / sp, HY[mi]) - 0.45, d: Math.sqrt(md) };
      }
      for (var k2 = 0; k2 < N; k2 += 3) { var d2 = (X[k2] - x) * (X[k2] - x) + (Z[k2] - z) * (Z[k2] - z); if (d2 < md) { md = d2; mi = k2; } }
      var dist = Math.sqrt(md);
      return { h: HY[mi] - 0.45 - Math.min(10, Math.max(0, dist - 55) * 0.02), d: dist };
    }
    var longe = add(new T.PlaneGeometry(9000, 9000), mGrama); longe.rotation.x = -Math.PI / 2; longe.position.y = -3;
    if (ALT) {
      var tam = Math.max(maxX - minX, maxZ - minZ) + 1400, seg = baixo ? 80 : 150;
      var tg = new T.PlaneGeometry(tam, tam, seg, seg); tg.rotateX(-Math.PI / 2); tg.translate((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
      var tp = tg.attributes.position;
      for (var vi2 = 0; vi2 < tp.count; vi2++) tp.setY(vi2, chaoEm(tp.getX(vi2), tp.getZ(vi2)).h);
      tg.computeVertexNormals();
      var texT = texGrama.clone(); texT.needsUpdate = true; texT.wrapS = texT.wrapT = T.RepeatWrapping; texT.repeat.set(tam / 31, tam / 31);
      add(tg, new T.MeshLambertMaterial({ map: texT }));
    } else { longe.position.y = -0.2; }
    /* brita nas curvas, acostamento, asfalto, trilho de borracha, marcas de freada, faixas brancas e zebras */
    var RUA = !!PF.rua, MURO_RUA = PF.muro || 11;
    function MW(i) { return PF.meia ? PF.meia[i] : 7; } /* meia largura da pista neste ponto */
    if (!RUA) add(faixa(function (i) { return -MW(i) - 26; }, function (i) { return MW(i) + 26; }, 0.06, molh ? 0x6e6552 : 0x9a8b6c, function (i) { return perto[i]; }), mCor);
    if (RUA) add(faixa(function (i) { return -MW(i) - MURO_RUA - 0.2; }, function (i) { return MW(i) + MURO_RUA + 0.2; }, 0.12, 0x44484e), mCor); else add(faixa(function (i) { return -MW(i) - 5; }, function (i) { return MW(i) + 5; }, 0.12, 0x4d5258), mCor);
    var texAsf = baixo ? null : ruido(128, '#ffffff', 0.35, 11);
    if (texAsf) { texAsf.wrapS = texAsf.wrapT = T.RepeatWrapping; }
    var mAsfalto = molh ? new T.MeshPhongMaterial({ vertexColors: true, side: T.DoubleSide, shininess: alto ? 90 : 70, specular: alto ? 0x6a7684 : 0x55606c, map: texAsf })
      : texAsf ? new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide, map: texAsf }) : mCor;
    add(faixa(function (i) { return -MW(i); }, MW, 0.18, molh ? 0x26292d : 0x3b3e43), mAsfalto);
    add(faixa(-2.6, 2.6, 0.2, molh ? 0x2d333b : 0x33363b), mAsfalto);
    if (!baixo) {
      /* marcas de pneu nas freadas antes das curvas lentas */
      var freadas = new Uint8Array(N);
      PF.curvas.forEach(function (c) { if (PF.lim[c] < 45) for (var k = -16; k <= -2; k++) freadas[(c + k + N) % N] = 1; });
      var corMarca = molh ? 0x22262b : 0x26282c;
      add(faixa(-1.35, -0.75, 0.205, corMarca, function (i) { return freadas[i]; }), mAsfalto);
      add(faixa(0.75, 1.35, 0.205, corMarca, function (i) { return freadas[i]; }), mAsfalto);
    }
    add(faixa(function (i) { return -MW(i) - 0.1; }, function (i) { return -MW(i) + 0.45; }, 0.24, 0xe8eaec, null, null, true), mCor); add(faixa(function (i) { return MW(i) - 0.45; }, function (i) { return MW(i) + 0.1; }, 0.24, 0xe8eaec, null, null, true), mCor);
    var ds = PF.ds;
    function corZebra(i) { return Math.floor(i * ds / 3) % 2 ? 0xd0202a : 0xf2f2f2; }
    add(faixa(function (i) { return MW(i) + 0.1; }, function (i) { return MW(i) + 1.7; }, 0.26, null, function (i) { return zebra[i]; }, corZebra, true), mCor);
    add(faixa(function (i) { return -MW(i) - 1.7; }, function (i) { return -MW(i) - 0.1; }, 0.26, null, function (i) { return zebra[i]; }, corZebra, true), mCor);
    /* muros (barreira de pneus nas curvas, concreto no resto) e, no médio e alto, alambrado em cima */
    var texAlamb = baixo ? null : texturaCanvas(32, 32, function (x, w, h) { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(210,215,220,.75)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke(); x.fillStyle = 'rgba(120,125,130,.9)'; x.fillRect(0, 0, 2, h); });
    if (texAlamb) { texAlamb.wrapS = texAlamb.wrapT = T.RepeatWrapping; }
    var mAlamb = texAlamb ? new T.MeshLambertMaterial({ map: texAlamb, transparent: true, side: T.DoubleSide, depthWrite: false }) : null;
    function muro(sinal) {
      var pos = [], col = [], fpos = [], fuv = [], c = new T.Color();
      for (var i = 0; i < N; i++) {
        var j = (i + 1) % N, di = sinal * (MW(i) + (RUA ? MURO_RUA : perto[i] ? 30 : 10)), dj = sinal * (MW(j) + (RUA ? MURO_RUA : perto[j] ? 30 : 10));
        var ax = X[i] + NX[i] * di, az = Z[i] + NZ[i] * di, bx = X[j] + NX[j] * dj, bz = Z[j] + NZ[j] * dj;
        /* não deixa muro cair em cima de outra parte da pista */
        if (!livre(ax, az, di, RUA ? MW(i) + MURO_RUA * 0.8 : MW(i) + 7) || !livre(bx, bz, dj, RUA ? MW(j) + MURO_RUA * 0.8 : MW(j) + 7)) continue;
        var hi = HY[i] - 0.6, hj = HY[j] - 0.6, top = RUA ? 1.9 : 1.8;
        pos.push(ax, hi, az, bx, hj, bz, ax, hi + top, az, ax, hi + top, az, bx, hj, bz, bx, hj + top, bz);
        /* rua: blocos de concreto (um tom a cada 4 m) e barreira vermelha e branca nas curvas */
        if (RUA) c.set(perto[i] ? (Math.floor(i * ds / 3) % 2 ? 0xc8202a : 0xf0f0f0) : (Math.floor(i * ds / 4) % 2 ? 0xa8acb1 : 0x989ca2));
        else c.set(perto[i] ? (Math.floor(i * ds / 4) % 2 ? 0xc8202a : 0xf0f0f0) : 0xb9bfc5);
        for (var k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
        if (mAlamb && (RUA || !perto[i])) {
          var fi = hi + top, fj = hj + top, u0 = i * ds / 2, u1 = u0 + ds / 2;
          var hf = RUA ? 4 : 3;
          fpos.push(ax, fi, az, bx, fj, bz, ax, fi + hf, az, ax, fi + hf, az, bx, fj, bz, bx, fj + hf, bz);
          fuv.push(u0, 0, u1, 0, u0, 1.5, u0, 1.5, u1, 0, u1, 1.5);
        }
      }
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
      add(g, mCor);
      if (fpos.length) { var gf = new T.BufferGeometry(); gf.setAttribute('position', new T.Float32BufferAttribute(fpos, 3)); gf.setAttribute('uv', new T.Float32BufferAttribute(fuv, 2)); gf.computeVertexNormals(); scene.add(new T.Mesh(gf, mAlamb)); }
    }
    muro(1); muro(-1);
    /* linha de chegada quadriculada */
    var texXadrez = texturaCanvas(128, 16, function (x, w, h) { for (var a = 0; a < 16; a++) for (var b = 0; b < 2; b++) { x.fillStyle = (a + b) % 2 ? '#f4f6f7' : '#0b0c0e'; x.fillRect(a * 8, b * 8, 8, 8); } });
    var chegada = add(new T.PlaneGeometry(MW(0) * 2, 1.6), new T.MeshBasicMaterial({ map: texXadrez }));
    chegada.position.set(X[0], 0.27 + HY[0], Z[0]);
    chegada.rotation.set(-Math.PI / 2, 0, -Math.atan2(NZ[0], NX[0]));
    /* marcas do grid (8 m entre os carros, em zigue-zague) */
    var mGrid = new T.MeshBasicMaterial({ color: 0xf0f0f0 });
    for (var gI = 0; gI < 10; gI++) {
      var fg = -gI * 8 / PF.L, pg = P.ponto(fg), ag = Math.atan2(P.ponto(fg + 5 / PF.L).y - P.ponto(fg - 5 / PF.L).y, P.ponto(fg + 5 / PF.L).x - P.ponto(fg - 5 / PF.L).x);
      var ld = (gI % 2 ? 1 : -1) * 3.5, gx = (pg.x - cx) * esc - Math.sin(ag) * ld, gz = (pg.y - cy) * esc + Math.cos(ag) * ld;
      var marca = add(new T.PlaneGeometry(0.25, 2.2), mGrid); marca.rotation.set(-Math.PI / 2, 0, -ag); marca.position.set(gx + Math.cos(ag) * 3.2, 0.26 + altF(fg), gz + Math.sin(ag) * 3.2);
    }
    /* placas de distância (150, 100, 50 m) antes das curvas lentas, do lado de fora */
    if (!baixo) {
      var texPlaca = {};
      [150, 100, 50].forEach(function (n) { texPlaca[n] = texturaCanvas(64, 48, function (x, w, h) { x.fillStyle = '#f4f6f7'; x.fillRect(0, 0, w, h); x.strokeStyle = '#11131a'; x.lineWidth = 3; x.strokeRect(2, 2, w - 4, h - 4); x.fillStyle = '#11131a'; x.font = 'bold 30px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), w / 2, h / 2 + 2); }); });
      var mPoste = new T.MeshLambertMaterial({ color: 0x9aa0a6 }), usadas = 0;
      PF.curvas.forEach(function (c) {
        if (PF.lim[c] > 42 || usadas > 30) return;
        /* só se houver reta antes (sem outra curva nos últimos 200 m) */
        var antes = Math.round(200 / ds); for (var k = 2; k <= antes; k++) if (PF.curvas.indexOf((c - k + N) % N) >= 0) return;
        var a1 = Math.atan2(Z[(c + 8) % N] - Z[c], X[(c + 8) % N] - X[c]), a0 = Math.atan2(Z[c] - Z[(c - 8 + N) % N], X[c] - X[(c - 8 + N) % N]);
        var giro = ((a1 - a0 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI, lado = giro > 0 ? -1 : 1;
        [150, 100, 50].forEach(function (n) {
          var ib = (c - Math.round((n + 30) / ds) + N) % N, off = lado * (W2 + 5), bx = X[ib] + NX[ib] * off, bz = Z[ib] + NZ[ib] * off;
          if (!livre(bx, bz, off, W2 + 3)) return;
          var placa = add(new T.PlaneGeometry(1.4, 1.05), new T.MeshLambertMaterial({ map: texPlaca[n], side: T.DoubleSide }));
          var angT = Math.atan2(-NZ[ib] * 0 + (Z[(ib + 1) % N] - Z[ib]), X[(ib + 1) % N] - X[ib]);
          placa.position.set(bx, HY[ib] + 1.3, bz); placa.rotation.y = -angT - Math.PI / 2;
          var poste = add(new T.BoxGeometry(0.08, 1.0, 0.08), mPoste); poste.position.set(bx, HY[ib] + 0.4, bz);
        });
        usadas++;
      });
    }
    /* prédio dos boxes e arquibancadas cobertas na reta de largada (só se não encostarem em outra parte da pista) */
    var iA = (N - 30) % N, iB = 6, mx = (X[iA] + X[iB]) / 2, mz = (Z[iA] + Z[iB]) / 2, comp = Math.hypot(X[iB] - X[iA], Z[iB] - Z[iA]), ang = Math.atan2(Z[iB] - Z[iA], X[iB] - X[iA]);
    var nx = -Math.sin(ang), nz = Math.cos(ang), h0 = HY[0] - 0.5, dx = Math.cos(ang) * comp / 2, dz = Math.sin(ang) * comp / 2;
    function areaLivre(off, larg) {
      for (var t = -1; t <= 1; t += 0.5) for (var u = -1; u <= 1; u += 2) {
        var px = mx + nx * (off + u * larg / 2) + dx * t, pz = mz + nz * (off + u * larg / 2) + dz * t;
        if (maisPerto(px, pz, W2 + 8).d < W2 + 8) return false;
      }
      return true;
    }
    if (areaLivre(-(W2 + 26), 14)) {
      var boxes = add(new T.BoxGeometry(comp, 9, 14), new T.MeshLambertMaterial({ color: 0xd9dde1 }));
      boxes.position.set(mx - nx * (W2 + 26), 4.5 + h0, mz - nz * (W2 + 26)); boxes.rotation.y = -ang;
      var faixaBox = add(new T.BoxGeometry(comp, 1.2, 14.2), new T.MeshLambertMaterial({ color: 0xb0121b }));
      faixaBox.position.set(boxes.position.x, 8 + h0, boxes.position.z); faixaBox.rotation.y = -ang;
    }
    if (areaLivre(W2 + 26, 24)) {
      var cores = [0x1f6feb, 0x2f7de1, 0x1d4f7a, 0xd7263d];
      for (var d = 0; d < 4; d++) {
        var matArq = new T.MeshLambertMaterial({ color: cores[d] });
        if (!baixo) {
          matArq = new T.MeshLambertMaterial({ map: texturaCanvas(256, 32, function (x, w, h) {
            x.fillStyle = '#' + cores[d].toString(16).padStart(6, '0'); x.fillRect(0, 0, w, h);
            var pal = ['#f2c14e', '#e3343c', '#ffffff', '#1f6feb', '#f07b2b', '#2b2b2b', '#e8b89a', '#7b4ae2'], sd = d * 7 + 1;
            for (var k = 0; k < 900; k++) { sd = (sd * 9301 + 49297) % 233280; x.fillStyle = pal[sd % pal.length]; x.fillRect((sd / 233280) * w, (k % 8) * 4, 2, 3); }
          }) });
        }
        var arq = add(new T.BoxGeometry(comp * 0.8, 2 + d * 2.2, 5), matArq);
        var off = W2 + 16 + d * 5;
        arq.position.set(mx + nx * off, (2 + d * 2.2) / 2 + h0, mz + nz * off); arq.rotation.y = -ang;
      }
      if (!baixo) {
        /* cobertura e faixa com o nome do site */
        var tetoOff = W2 + 26, teto = add(new T.BoxGeometry(comp * 0.82, 0.4, 24), new T.MeshLambertMaterial({ color: 0xe4e7ea }));
        teto.position.set(mx + nx * tetoOff, 13 + h0, mz + nz * tetoOff); teto.rotation.y = -ang;
        [-0.38, 0, 0.38].forEach(function (t) { var col = add(new T.BoxGeometry(0.4, 13, 0.4), new T.MeshLambertMaterial({ color: 0x9aa0a6 })); col.position.set(mx + nx * (W2 + 37) + dx * t * 2, 6.5 + h0, mz + nz * (W2 + 37) + dz * t * 2); });
        var texFaixa = texturaCanvas(512, 48, function (x, w, h) { x.fillStyle = '#b0121b'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.font = 'bold 30px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('AUTOMOBILISMO NA VEIA', w / 2, h / 2 + 1); });
        var faixaNome = add(new T.PlaneGeometry(Math.min(comp * 0.6, 90), 2.2), new T.MeshBasicMaterial({ map: texFaixa, side: T.DoubleSide }));
        faixaNome.position.set(mx + nx * (W2 + 13.4), 3.2 + h0, mz + nz * (W2 + 13.4)); faixaNome.rotation.y = -ang + Math.PI;
      }
    }
    /* ---------- cenário em volta de toda pista: arquibancadas, placas nos muros e construções ---------- */
    var sdC = 101; function rndC() { sdC = (sdC * 9301 + 49297) % 233280; return sdC / 233280; }
    var dirT = function (i) { var a2 = (i + 1) % N, b2 = (i - 1 + N) % N; return Math.atan2(Z[a2] - Z[b2], X[a2] - X[b2]); };
    /* distância do muro até o centro da pista neste ponto */
    function distMuro(i) { return MW(i) + (RUA ? MURO_RUA : perto[i] ? 30 : 10); }
    /* uma área retangular (comprimento x profundidade) está livre da pista? */
    function livreArea(cx, cz, ang, comp, prof, folga) {
      var ux = Math.cos(ang), uz = Math.sin(ang), vx = -uz, vz = ux;
      for (var a = -0.5; a <= 0.5; a += 0.25) for (var b = -0.5; b <= 0.5; b += 0.5) {
        var px = cx + ux * comp * a + vx * prof * b, pz = cz + uz * comp * a + vz * prof * b;
        if (maisPerto(px, pz, folga).d < folga) return false;
      }
      return true;
    }
    var texPublico = baixo ? null : [0, 1, 2].map(function (n) {
      return texturaCanvas(256, 32, function (x, w, h) {
        x.fillStyle = ['#2a3444', '#3a2a2a', '#2e3a2e'][n]; x.fillRect(0, 0, w, h);
        var pal = ['#f2c14e', '#e3343c', '#ffffff', '#1f6feb', '#f07b2b', '#2b2b2b', '#e8b89a', '#7b4ae2', '#3fae63'], sd = n * 13 + 5;
        for (var k = 0; k < 1000; k++) { sd = (sd * 9301 + 49297) % 233280; x.fillStyle = pal[sd % pal.length]; x.fillRect((sd / 233280) * w, (k % 8) * 4, 2, 3); }
      });
    });
    var coresArq = [0x1f6feb, 0xd7263d, 0x3a3f46, 0xe9ecef], mTeto = new T.MeshLambertMaterial({ color: 0xdfe3e7 }), mCol = new T.MeshLambertMaterial({ color: 0x8e949a });
    var arquibancadas = 0, MAX_ARQ = baixo ? 5 : alto ? 16 : 11;
    /* arquibancada: degraus subindo para longe da pista, cheios de gente; algumas cobertas */
    function arquibancada(i, lado, comp, teto) {
      var ang = dirT(i), off = lado * (distMuro(i) + 7), cx = X[i] + NX[i] * off, cz = Z[i] + NZ[i] * off;
      var prof = 14, meio = lado * (prof / 2);
      if (!livreArea(cx + NX[i] * meio, cz + NZ[i] * meio, ang, comp, prof, MW(i) + 8)) return false;
      var g = new T.Group(), h0 = chaoEm(cx, cz).h;
      var n = baixo ? 3 : 4;
      for (var d = 0; d < n; d++) {
        var alt = 1.6 + d * 1.7, cor = coresArq[(i + d) % coresArq.length];
        var mat = texPublico ? new T.MeshLambertMaterial({ map: texPublico[(i + d) % 3] }) : new T.MeshLambertMaterial({ color: cor });
        var deg = new T.Mesh(new T.BoxGeometry(comp, alt, 3.3), mat); deg.position.set(0, alt / 2, 1.5 + d * 3.3); g.add(deg);
      }
      var fundo = new T.Mesh(new T.BoxGeometry(comp, 8.5, 0.5), mCol); fundo.position.set(0, 4.25, 1.5 + n * 3.3); g.add(fundo);
      if (teto && !baixo) {
        var tt = new T.Mesh(new T.BoxGeometry(comp + 2, 0.35, prof + 1), mTeto); tt.position.set(0, 11, prof / 2 - 0.5); tt.rotation.x = -0.06; g.add(tt);
        [-0.45, 0, 0.45].forEach(function (p) { var c1 = new T.Mesh(new T.BoxGeometry(0.4, 11, 0.4), mCol); c1.position.set(p * comp, 5.5, prof - 0.5); g.add(c1); });
      }
      g.position.set(cx, h0, cz); g.rotation.y = -ang + (lado < 0 ? Math.PI : 0);
      if (alto) g.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      scene.add(g); arquibancadas++; return true;
    }
    /* lado de fora de cada curva: para onde a pista NÃO vira */
    function ladoFora(c) { var a1 = dirT((c + 6) % N), a0 = dirT((c - 6 + N) % N); return giro(a1 - a0) > 0 ? -1 : 1; }
    /* 1) curvas lentas (mais emoção), 2) retas longas, alternando os lados */
    var usados = [];
    function longeDeOutra(i) { for (var u = 0; u < usados.length; u++) { var dd = Math.abs(usados[u] - i); if (Math.min(dd, N - dd) * ds < 250) return false; } return true; }
    PF.curvas.slice().sort(function (a, b) { return PF.lim[a] - PF.lim[b]; }).forEach(function (c) {
      if (arquibancadas >= MAX_ARQ * 0.6 || !longeDeOutra(c)) return;
      if (arquibancada(c, ladoFora(c), 45 + rndC() * 35, rndC() < 0.5)) usados.push(c);
    });
    for (var ir = 0; ir < N && arquibancadas < MAX_ARQ; ir += Math.round(120 / ds)) {
      if (PF.lim[ir] < 70 || !longeDeOutra(ir)) continue;
      var ld = (ir / Math.round(120 / ds)) % 2 ? 1 : -1;
      if (arquibancada(ir, ld, 60 + rndC() * 50, rndC() < 0.35) || arquibancada(ir, -ld, 60 + rndC() * 50, false)) usados.push(ir);
    }
    /* 2) placas de propaganda em cima dos muros das retas (o nome do site, sem marcas) */
    if (!baixo) {
      var texPlacas = [
        texturaCanvas(256, 32, function (x, w, h) { x.fillStyle = '#b0121b'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = 'bold 20px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('AUTOMOBILISMO NA VEIA', w / 2, h / 2 + 1); }),
        texturaCanvas(256, 32, function (x, w, h) { x.fillStyle = '#141619'; x.fillRect(0, 0, w, h); x.fillStyle = '#e3343c'; x.font = 'bold 22px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NA VEIA', w / 2, h / 2 + 1); })
      ];
      var geoPlaca = new T.PlaneGeometry(10, 1.25), passoP = Math.max(2, Math.round(14 / ds)), qPl = new T.Quaternion(), mPl = new T.Matrix4(), sPl = new T.Vector3(1, 1, 1), pPl = new T.Vector3();
      var inst = texPlacas.map(function (tx) { return new T.InstancedMesh(geoPlaca, new T.MeshLambertMaterial({ map: tx, side: T.DoubleSide }), Math.ceil(N / passoP) * 2); }), cont = [0, 0];
      for (var ip2 = 0; ip2 < N; ip2 += passoP) {
        if (perto[ip2]) continue;
        [1, -1].forEach(function (sl) {
          var d2 = sl * (distMuro(ip2) - 0.3), px = X[ip2] + NX[ip2] * d2, pz = Z[ip2] + NZ[ip2] * d2;
          if (!livre(px, pz, d2, RUA ? MW(ip2) + MURO_RUA * 0.8 : MW(ip2) + 7)) return;
          var qual = (ip2 / passoP + (sl > 0 ? 0 : 1)) % 2 | 0;
          qPl.setFromAxisAngle(new T.Vector3(0, 1, 0), -dirT(ip2) + (sl > 0 ? Math.PI : 0));
          pPl.set(px, HY[ip2] + 0.55, pz); mPl.compose(pPl, qPl, sPl); inst[qual].setMatrixAt(cont[qual]++, mPl);
        });
      }
      inst.forEach(function (m, n2) { m.count = cont[n2]; if (cont[n2]) scene.add(m); });
    }
    /* 3) construções em volta do autódromo (boxes de equipes, hospitalidade, galpões, casas), mais afastadas */
    if (!RUA && !baixo) {
      var NCON = alto ? 160 : 90, cons = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshLambertMaterial({ color: 0xffffff }), NCON);
      var coresC = [0xe4e7ea, 0xcfd4d9, 0xbfc5cb, 0xd8cfc0, 0x9aa4ae, 0x6f7b88, 0xe9e2d4], mC4 = new T.Matrix4(), qC = new T.Quaternion(), sC = new T.Vector3(), pC = new T.Vector3(), cC = new T.Color(), nC = 0;
      for (var tc = 0; tc < 6000 && nC < NCON; tc++) {
        var ic = Math.floor(rndC() * N), ladoC = rndC() < 0.5 ? -1 : 1, distC = distMuro(ic) + 40 + rndC() * 260;
        var cxC = X[ic] + NX[ic] * ladoC * distC, czC = Z[ic] + NZ[ic] * ladoC * distC;
        var lg = 12 + rndC() * 30, pf = 10 + rndC() * 22, al = 5 + Math.pow(rndC(), 2.2) * 28;
        if (maisPerto(cxC, czC, MW(ic) + 34 + Math.max(lg, pf) / 2).d < MW(ic) + 34 + Math.max(lg, pf) / 2) continue;
        qC.setFromAxisAngle(new T.Vector3(0, 1, 0), -dirT(ic)); sC.set(lg, al, pf); pC.set(cxC, chaoEm(cxC, czC).h + al / 2, czC);
        mC4.compose(pC, qC, sC); cons.setMatrixAt(nC, mC4); cC.setHex(coresC[Math.floor(rndC() * coresC.length)]); cons.setColorAt(nC, cC); nC++;
      }
      cons.count = nC; if (cons.instanceColor) cons.instanceColor.needsUpdate = true;
      if (alto) { cons.castShadow = true; cons.receiveShadow = true; }
      scene.add(cons);
    }

    /* árvores longe da pista */
    if (RUA && !baixo) {
      var NPRED = alto ? 520 : 300, predios = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshLambertMaterial({ color: 0xffffff }), NPRED);
      var coresPred = [0xd8c8a8, 0xcdb994, 0xe2d6bd, 0xb9a88a, 0x9fb3c8, 0x7f95ab, 0xe8e2d6], mP = new T.Matrix4(), qP = new T.Quaternion(), sP = new T.Vector3(), pP = new T.Vector3(), cP = new T.Color(), nP = 0, sdP = 29;
      function rndP() { sdP = (sdP * 9301 + 49297) % 233280; return sdP / 233280; }
      for (var tp = 0; tp < 9000 && nP < NPRED; tp++) {
        var ib = Math.floor(rndP() * N), lado2 = rndP() < 0.5 ? -1 : 1, dist2 = W2 + MURO_RUA + 10 + rndP() * 110;
        var px2 = X[ib] + NX[ib] * lado2 * dist2, pz2 = Z[ib] + NZ[ib] * lado2 * dist2;
        var larg2 = 10 + rndP() * 22, prof2 = 10 + rndP() * 18, alt2 = 8 + Math.pow(rndP(), 2) * 55;
        if (maisPerto(px2, pz2, W2 + MURO_RUA + 6 + Math.max(larg2, prof2) / 2).d < W2 + MURO_RUA + 6 + Math.max(larg2, prof2) / 2) continue;
        var chP = chaoEm(px2, pz2), baseP = ALT ? chP.h : 0;
        qP.setFromAxisAngle(new T.Vector3(0, 1, 0), -Math.atan2(NZ[ib], NX[ib]));
        sP.set(larg2, alt2, prof2); pP.set(px2, baseP + alt2 / 2, pz2); mP.compose(pP, qP, sP); predios.setMatrixAt(nP, mP);
        cP.setHex(coresPred[Math.floor(rndP() * coresPred.length)]); predios.setColorAt(nP, cP); nP++;
      }
      predios.count = nP; if (predios.instanceColor) predios.instanceColor.needsUpdate = true;
      if (alto) { predios.castShadow = true; predios.receiveShadow = true; }
      scene.add(predios);
    }
    var NARV = baixo || RUA ? 0 : alto ? 750 : 320;
    var arvores = new T.InstancedMesh(new T.ConeGeometry(3.2, 11, alto ? 9 : 7), new T.MeshLambertMaterial({ color: molh ? 0x1e3d22 : 0x28542a }), Math.max(1, NARV));
    var troncos = alto ? new T.InstancedMesh(new T.CylinderGeometry(0.4, 0.5, 3, 6), new T.MeshLambertMaterial({ color: 0x4a3526 }), NARV) : null;
    var mat4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), pv = new T.Vector3(), feitas = 0, semente = 17;
    function rnd() { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; }
    for (var t = 0; t < 6000 && feitas < NARV; t++) {
      var ax2 = minX - 160 + rnd() * (maxX - minX + 320), az2 = minZ - 160 + rnd() * (maxZ - minZ + 320);
      if (maisPerto(ax2, az2, W2 + 45).d < W2 + 45) continue;
      var ch = chaoEm(ax2, az2), hA = ALT ? ch.h : 0;
      var h = 0.8 + rnd() * 0.7; sc.set(h, h, h); pv.set(ax2, 5.5 * h + (troncos ? 2 : 0) + hA, az2); mat4.compose(pv, q, sc); arvores.setMatrixAt(feitas, mat4);
      if (troncos) { pv.set(ax2, 1.5 + hA, az2); mat4.compose(pv, q, sc); troncos.setMatrixAt(feitas, mat4); }
      feitas++;
    }
    arvores.count = feitas; if (feitas) scene.add(arvores);
    if (troncos) { troncos.count = feitas; scene.add(troncos); arvores.castShadow = true; }
    /* céu em degradê e morros no horizonte (médio e alto) */
    if (!baixo) {
      var raioC = Math.max(maxX - minX, maxZ - minZ) / 2 + 900, meioX = (minX + maxX) / 2, meioZ = (minZ + maxZ) / 2;
      var ceuGeo = new T.SphereGeometry(2400, 24, 12), cc = [], topo = new T.Color(topoCeu), hor = new T.Color(ceu);
      for (var vi = 0; vi < ceuGeo.attributes.position.count; vi++) { var yy = ceuGeo.attributes.position.getY(vi) / 2400, cm = hor.clone().lerp(topo, Math.max(0, Math.min(1, yy * 2.2))); cc.push(cm.r, cm.g, cm.b); }
      ceuGeo.setAttribute('color', new T.Float32BufferAttribute(cc, 3));
      var ceuM = new T.Mesh(ceuGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })); ceuM.position.set(meioX, 0, meioZ); scene.add(ceuM);
      if (alto) {
        var mMorro = new T.MeshLambertMaterial({ color: molh ? 0x33443a : 0x3f5f45 });
        for (var mi = 0; mi < 26; mi++) {
          var am = mi / 26 * Math.PI * 2 + rnd() * 0.2, hM = 60 + rnd() * 140, rM = 180 + rnd() * 220;
          var morro = new T.Mesh(new T.ConeGeometry(rM, hM, 7), mMorro); morro.position.set(meioX + Math.cos(am) * raioC, hM / 2 - 5, meioZ + Math.sin(am) * raioC); scene.add(morro);
        }
      }
    }
    /* chuva caindo perto da câmera */
    if (molh) {
      var nG = (clima === 'forte' ? 900 : 450) * (baixo ? 0.4 : alto ? 1.5 : 1) | 0, pos = new Float32Array(nG * 6);
      for (i = 0; i < nG; i++) { var gx2 = (rnd() - 0.5) * 90, gy = rnd() * 30, gz2 = (rnd() - 0.5) * 90; pos.set([gx2, gy, gz2, gx2 - 0.1, gy + 0.9, gz2], i * 6); }
      var gGotas = new T.BufferGeometry(); gGotas.setAttribute('position', new T.BufferAttribute(pos, 3));
      atual.chuva = new T.LineSegments(gGotas, new T.LineBasicMaterial({ color: 0xc8d8ee, transparent: true, opacity: clima === 'forte' ? 0.55 : 0.35 }));
      scene.add(atual.chuva);
    }
  }

  /* ponto e direção na pista, numa curva lisa que passa pelos pontos (sem quinas) */
  function noMundo(A, P, L, f, lado) {
    var N = A.N, u = (((f % 1) + 1) % 1) * N, i1 = Math.floor(u) % N, t = u - Math.floor(u), i0 = (i1 - 1 + N) % N, i2 = (i1 + 1) % N, i3 = (i1 + 2) % N, X = A.X, Z = A.Z;
    function cr(a, b, c, d) { return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t); }
    function dcr(a, b, c, d) { return 0.5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (-a + 3 * b - 3 * c + d) * t * t); }
    var x = cr(X[i0], X[i1], X[i2], X[i3]), z = cr(Z[i0], Z[i1], Z[i2], Z[i3]), ang = Math.atan2(dcr(Z[i0], Z[i1], Z[i2], Z[i3]), dcr(X[i0], X[i1], X[i2], X[i3]));
    var y = A.altF ? A.altF(f) : 0, inc = A.altF ? Math.atan((A.altF(f + 6 / L) - A.altF(f - 6 / L)) / 12) : 0;
    return { x: x - Math.sin(ang) * (lado || 0), z: z + Math.cos(ang) * (lado || 0), y: y, inc: inc, ang: ang };
  }
  function giro(a) { return ((a + 3 * Math.PI) % (2 * Math.PI)) - Math.PI; }

  /* desenha um quadro. modo: '3d' (atrás do carro) ou '3dtv' (câmera alta) */
  function desenhar(caixaEl, o, modo, W, H) {
    if (!pronto()) return null;
    var gq = o.grafico === 'baixo' || o.grafico === 'alto' ? o.grafico : 'medio', relevo = o.relevo === 'plano' ? 'plano' : 'suave';
    if (!atual || atual.caixa !== caixaEl || atual.PF !== o.PF || atual.clima !== o.clima || atual.gq !== gq || atual.relevo !== relevo || !caixaEl.contains(atual.canvas)) montar(caixaEl, o.PF, o.clima, gq, relevo);
    var A = atual, P = o.PF.P, L = o.PF.L, molh = o.clima && o.clima !== 'seco';
    if (A.W !== W || A.H !== H) {
      A.renderer.setSize(W, H, false); A.canvas.style.width = W + 'px'; A.canvas.style.height = H + 'px';
      A.camera.aspect = W / H; A.camera.updateProjectionMatrix(); A.W = W; A.H = H;
    }
    var agora = performance.now(), dt = Math.min(0.1, (agora - (A.t || agora)) / 1000); A.t = agora;
    var pisca = Math.floor(agora / 250) % 2 === 0, vistos = {}, vEu = 0, kEu = null, cEu = null;
    o.carros.forEach(function (c) {
      var id = c.visual.id, k = A.carros[id] || (A.carros[id] = criarCarro(c.visual));
      vistos[id] = 1; k.g.visible = true;
      /* desvio lateral e direção suaves: o carro troca de lado e contorna a curva aos poucos, sem trancos */
      if (k.lado == null) k.lado = c.lado || 0;
      /* seu carro (modo Elite): segue a física quase na hora, só tirando os trancos de um quadro para o outro */
      if (c.direto) k.lado += ((c.lado || 0) - k.lado) * Math.min(1, dt * 18); else k.lado += ((c.lado || 0) - k.lado) * Math.min(1, dt * 2.2);
      k.psi = (k.psi || 0) + ((c.psi || 0) - (k.psi || 0)) * Math.min(1, dt * 15);
      var w = noMundo(A, P, L, c.f, k.lado);
      if (k.ang == null) { k.ang = w.ang; k.inc = w.inc; }
      var angAntes = k.ang;
      k.ang += giro(w.ang - k.ang) * Math.min(1, dt * 14);
      k.inc += (w.inc - k.inc) * Math.min(1, dt * 6);
      k.g.rotation.order = 'YZX'; k.g.position.set(w.x, BASE + w.y, w.z); k.g.rotation.set(0, -(k.ang + k.psi), k.inc);
      var giroS = dt > 0 ? giro(k.ang - angAntes) / dt : 0;
      if (c.jog) k.giroPorS = giroS;
      var v = c.v || 0; if (c.jog) { vEu = v; kEu = k; cEu = c; }
      /* rodas da frente viram: no modo Elite, pelo seu comando; nos outros, pela curva (entre-eixos de 3,6 m) */
      var alvoEst = c.st != null ? c.st * 0.36 : Math.max(-0.4, Math.min(0.4, giroS / Math.max(v, 4) * 3.6 * 1.3));
      k.est = (k.est || 0) + (alvoEst - (k.est || 0)) * Math.min(1, dt * 10);
      if (k.frente) k.frente.forEach(function (r) { r.rotation.y = -k.est; });
      if (k.capacete) k.capacete.visible = !(c.jog && modo === '3dcock');
      if (k.abertura) k.abertura.forEach(function (m) { m.visible = !(c.jog && modo === '3dcock'); });
      k.rodas.forEach(function (r) { r.rotation.z -= v * dt / 0.36; });
      k.mComp.color.set(c.corPneu || '#f2c14e');
      if (k.luz) k.luz.material.color.set(c.freio || (molh && pisca) ? 0xff2020 : 0x3a0a0a);
      var forca = molh ? Math.min(1, v / 60) * (o.clima === 'forte' ? 1 : 0.6) : 0;
      k.spray.visible = forca > 0.08 && A.gq !== 'baixo'; k.spray.material.opacity = forca * 0.75; k.spray.scale.set(4 + forca * 5, 1.6 + forca * 1.6, 1);
      k.seta.visible = !!c.jog && modo === '3dtv';
    });
    Object.keys(A.carros).forEach(function (id) { if (!vistos[id]) A.carros[id].g.visible = false; });
    /* câmera: atrás do seu carro, virando suave; abre o ângulo com a velocidade e treme um pouco quando está muito rápido */
    var f = noMundo(A, P, L, o.foco, cEu && cEu.direto && kEu ? kEu.lado || 0 : 0), angAlvo = f.ang + (cEu && cEu.direto && kEu ? (kEu.psi || 0) * 0.8 : 0);
    if (A.camAng == null) A.camAng = angAlvo;
    A.camAng += giro(angAlvo - A.camAng) * Math.min(1, dt * 4.5);
    var fx = Math.cos(A.camAng), fz = Math.sin(A.camAng), tv = modo === '3dtv', tras = tv ? 26 : 9.5, alto = tv ? 13 : 3.2, frente = tv ? 16 : 7;
    var hTras = A.altF ? A.altF(o.foco - tras / L) : 0, hFrente = A.altF ? A.altF(o.foco + frente / L) : 0;
    var rapido = Math.max(0, Math.min(1, (vEu - 25) / 65));
    var fovAlvo = modo === '3dcock' ? 72 + rapido * 6 : A.gq === 'baixo' || tv ? 60 : 58 + rapido * 12;
    A.fov += (fovAlvo - A.fov) * Math.min(1, dt * 3);
    if (Math.abs(A.camera.fov - A.fov) > 0.05) { A.camera.fov = A.fov; A.camera.updateProjectionMatrix(); }
    var treme = A.gq === 'baixo' || tv ? 0 : rapido * rapido * 0.005; /* vibração bem leve e lenta em alta velocidade */
    A.camera.position.set(f.x - fx * tras + Math.sin(agora * 0.017) * treme, alto + Math.max(hTras, f.y - 1) + Math.sin(agora * 0.023) * treme, f.z - fz * tras + Math.cos(agora * 0.019) * treme);
    A.camera.lookAt(f.x + fx * frente, (tv ? 0 : 1.1) + hFrente, f.z + fz * frente);
    var cock = modo === '3dcock' && kEu;
    if (kEu) {
      if (cock && !kEu.cock) kEu.cock = criarCockpit(kEu, cEu.visual);
      if (kEu.cock) { kEu.cock.g.visible = !!cock; if (cock) atualizarCockpit(kEu.cock, cEu, dt, kEu.giroPorS || 0, agora); }
    }
    var pertoAlvo = cock ? 0.03 : 0.5;
    if (A.camera.near !== pertoAlvo) { A.camera.near = pertoAlvo; A.camera.updateProjectionMatrix(); }
    if (cock) {
      /* visão do piloto: olhos logo acima do capacete, olhando para a frente do carro (vê o bico, as rodas e o halo) */
      kEu.g.updateMatrixWorld();
      var ov = kEu.glb && kEu.volante ? [kEu.volante[0] - 0.45, kEu.volante[1] + 0.16] : [0.02, 0.82];
      var olho = new THREE.Vector3(ov[0], ov[1], 0).applyMatrix4(kEu.g.matrixWorld), mira = new THREE.Vector3(20, ov[1] - 0.1, 0).applyMatrix4(kEu.g.matrixWorld);
      A.camera.position.set(olho.x, olho.y + Math.sin(agora * 0.023) * treme * 0.3, olho.z);
      A.camera.lookAt(mira);
    }
    if (A.gq === 'alto') { A.sol.position.set(f.x + DIR_SOL[0] * 160, f.y + DIR_SOL[1] * 160, f.z + DIR_SOL[2] * 160); A.sol.target.position.set(f.x, f.y, f.z); A.sol.target.updateMatrixWorld(); }
    /* chuva acompanha a câmera */
    if (A.chuva) {
      A.chuva.position.set(A.camera.position.x, f.y, A.camera.position.z);
      var arr = A.chuva.geometry.attributes.position.array, queda = (o.clima === 'forte' ? 34 : 26) * dt;
      for (var i = 0; i < arr.length; i += 6) { arr[i + 1] -= queda; arr[i + 4] -= queda; if (arr[i + 1] < 0) { arr[i + 1] += 30; arr[i + 4] += 30; } }
      A.chuva.geometry.attributes.position.needsUpdate = true;
    }
    A.renderer.render(A.scene, A.camera);
    /* onde o sol aparece na tela (para o brilho de lente) */
    var solTela = null;
    if (!molh) {
      var vs = new THREE.Vector3(A.camera.position.x + DIR_SOL[0] * 1000, A.camera.position.y + DIR_SOL[1] * 1000, A.camera.position.z + DIR_SOL[2] * 1000).project(A.camera);
      if (vs.z < 1 && Math.abs(vs.x) < 1.2 && Math.abs(vs.y) < 1.2) solTela = [(vs.x + 1) / 2, (1 - vs.y) / 2];
    }
    return { v: vEu, sol: solTela };
  }

  window.CHEFE3D = { modelo: function () { return modelo.estado + (modelo.erro ? ': ' + modelo.erro : ''); }, carregar: carregar, pronto: pronto, falhou: falhou, desenhar: desenhar, liberar: liberar };
})();
