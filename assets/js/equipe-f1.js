/* Monte sua equipe de F1 (equipe-f1.html): a pessoa é dona de uma equipe nova e tem um orçamento sorteado para
   contratar dois pilotos, o motor e a equipe técnica (chefe de equipe, diretor técnico, engenheiros, cientista de
   dados, estrategista e chefe dos mecânicos). Com tudo dentro do orçamento, simula as 24 corridas da temporada
   contra as equipes reais e mostra a posição no Mundial de Construtores.
   Pilotos: os da F1 de verdade (NAVEIA_PILOTOS em site.js), com nota e preço pelos pontos no campeonato (dados.js).
   Equipe técnica: nomes inventados (não são pessoas reais). */
(function () {
  var caixa = document.getElementById('ef1'); if (!caixa) return;
  var esc = window.esc;
  var ORCAMENTOS = [110, 130, 150, 170], CORRIDAS = 24, PONTOS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  var RECORDE = 'arena-equipe-f1';

  /* ---------- pilotos: nota e preço pelos pontos no campeonato ---------- */
  var cat = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'formula-1'; })[0] || {};
  var linhas = (cat.classificacao && cat.classificacao.linhas) || [];
  var pts = {}; linhas.forEach(function (l) { pts[l[1]] = +l[3] || 0; });
  var maxPts = Math.max.apply(null, [1].concat(linhas.map(function (l) { return +l[3] || 0; })));
  var PILOTOS = ((window.NAVEIA_PILOTOS || {})['Fórmula 1'] || []).map(function (p) {
    var f = (pts[p[0]] || 0) / maxPts;
    return { id: p[0], nome: p[0], extra: p[2] + ' · ' + (pts[p[0]] || 0) + ' pts', nota: Math.round(68 + 28 * Math.sqrt(f)), preco: Math.round(4 + 52 * Math.pow(f, 0.85)) };
  }).sort(function (a, b) { return b.preco - a.preco || a.nome.localeCompare(b.nome); });

  /* ---------- motor e equipe técnica (nomes inventados) ---------- */
  var MOTORES = [['Mercedes', 95, 24], ['Ferrari', 92, 22], ['Red Bull Ford', 89, 20], ['Honda', 86, 17], ['Audi', 80, 13]].map(function (m) {
    return { id: m[0], nome: 'Motor ' + m[0], extra: 'Fornecedor', nota: m[1], preco: m[2] };
  });
  var NIVEIS = [['Lenda', 95, 1], ['Experiente', 86, .62], ['Promissor', 77, .38], ['Iniciante', 68, .2], ['Estagiário', 58, .08]];
  function staff(nomes, max) {
    return nomes.map(function (n, i) { var nv = NIVEIS[i]; return { id: n, nome: n, extra: nv[0], nota: nv[1], preco: Math.max(1, Math.round(max * nv[2])) }; });
  }
  var VAGAS = [
    { k: 'p1', t: 'Piloto 1', d: 'Quem pilota o primeiro carro. Faz a maior parte dos pontos.', op: PILOTOS, piloto: true },
    { k: 'p2', t: 'Piloto 2', d: 'O segundo carro. Uma dupla forte soma muito no Mundial de Construtores.', op: PILOTOS, piloto: true },
    { k: 'motor', t: 'Motor', d: 'A unidade de potência. Pesa direto no desempenho do carro.', op: MOTORES },
    { k: 'chefe', t: 'Chefe de equipe', d: 'Comanda tudo: deixa a equipe mais unida e o carro quebra menos.', op: staff(['Henrique Vasconcelos', 'Marta Lindqvist', 'Paolo Ferrante', 'Diego Arantes', 'Lucas Prado'], 15) },
    { k: 'tecnico', t: 'Diretor técnico', d: 'Projeta o carro. É a peça mais importante para ter um carro rápido.', op: staff(['Adriano Kessler', 'Sofia Brandão', 'James Whitfield', 'Renato Caldeira', 'Ana Paula Ruiz'], 18) },
    { k: 'corrida', t: 'Engenheiro de corrida', d: 'Fala com o piloto no rádio e acerta o carro para cada corrida.', op: staff(['Gianluca Moretti', 'Camila Teixeira', 'Tom Hartley', 'Bruno Sales', 'Júlia Mendes'], 8) },
    { k: 'pista', t: 'Engenheiro de pista', d: 'Cuida do acerto do carro para cada circuito e do desgaste dos pneus.', op: staff(['Klaus Ebner', 'Rafael Duarte', 'Hannah Clarke', 'Pedro Antunes', 'Lívia Castro'], 8) },
    { k: 'dados', t: 'Cientista de dados', d: 'Analisa a telemetria e encontra décimos de segundo nos números.', op: staff(['Yuki Morimoto', 'Fernanda Lopes', 'Erik Sandberg', 'Mateus Ribeiro', 'Carla Nogueira'], 7) },
    { k: 'estrategia', t: 'Estrategista', d: 'Decide a hora do pit stop e os pneus. Ganha posições sem precisar ultrapassar.', op: staff(['Isabel Ortega', 'Victor Lemaire', 'Gustavo Pires', 'Nina Kowalski', 'André Farias'], 7) },
    { k: 'mecanicos', t: 'Chefe dos mecânicos', d: 'Comanda o pit stop. Um pit stop de 2 segundos vale posições.', op: staff(['Marco Bellini', 'Thiago Rocha', 'Sam O’Connor', 'Priscila Melo', 'Caio Freitas'], 9) }
  ];

  var est = { orc: ORCAMENTOS[Math.floor(Math.random() * ORCAMENTOS.length)], esc: {}, nome: 'Fan Zone Racing Team', aberta: 'p1', resultado: null };
  function achar(v, id) { return v.op.filter(function (o) { return o.id === id; })[0]; }
  function gasto() { return VAGAS.reduce(function (s, v) { var o = achar(v, est.esc[v.k]); return s + (o ? o.preco : 0); }, 0); }
  function completo() { return VAGAS.every(function (v) { return est.esc[v.k]; }); }
  function estrelas(n) { var e = Math.max(1, Math.min(5, Math.round((n - 50) / 9))); return '★★★★★'.slice(0, e) + '<i>' + '★★★★★'.slice(e) + '</i>'; }

  /* ---------- simulação da temporada ---------- */
  function simular() {
    var N = function (k) { return achar(VAGAS.filter(function (v) { return v.k === k; })[0], est.esc[k]).nota; };
    var carro = 0.4 * N('tecnico') + 0.3 * N('motor') + 0.15 * N('pista') + 0.15 * N('dados');
    var corrida = 0.35 * N('estrategia') + 0.35 * N('corrida') + 0.3 * N('mecanicos');
    var quebra = Math.max(0.02, 0.1 - (N('chefe') - 55) / 500), uniao = 0.97 + (N('chefe') - 55) / 700;
    /* equipes reais: força do carro pelos pontos dos dois pilotos; os pilotos que a pessoa contratou saem delas */
    var meus = [est.esc.p1, est.esc.p2], times = {};
    (cat.equipes || []).forEach(function (e) { times[e.n] = { nome: e.n, pts: 0, pil: e.p.slice() }; });
    var somaMax = 1; Object.keys(times).forEach(function (k) { var s = times[k].pil.reduce(function (a, p) { return a + (pts[p] || 0); }, 0); times[k].forca = s; somaMax = Math.max(somaMax, s); });
    var carros = [];
    Object.keys(times).forEach(function (k) {
      var T = times[k], c = 75 + 17 * Math.sqrt(T.forca / somaMax);
      T.pil.forEach(function (p) {
        var nome = meus.indexOf(p) > -1 ? 'Piloto reserva' : p, nota = meus.indexOf(p) > -1 ? 66 : achar(VAGAS[0], p) ? achar(VAGAS[0], p).nota : 70;
        carros.push({ time: T, piloto: nome, base: c * 0.55 + nota * 0.45 + (c - 80) * 0.1, quebra: 0.07 });
      });
    });
    var eu = { nome: est.nome, pts: 0, minha: true };
    meus.forEach(function (p) {
      carros.push({ time: eu, piloto: p, base: (carro * 0.55 + achar(VAGAS[0], p).nota * 0.45 + (corrida - 78) * 0.18) * uniao, quebra: quebra, meu: true, pts: 0 });
    });
    var vit = 0, podios = 0, melhor = 99, abandonos = 0;
    carros.forEach(function (c) { c.pts = 0; });
    for (var r = 0; r < CORRIDAS; r++) {
      var ordem = carros.map(function (c) {
        var ruido = (Math.random() + Math.random() + Math.random() - 1.5) * 7;
        return { c: c, v: Math.random() < c.quebra ? -999 : c.base + ruido };
      }).sort(function (a, b) { return b.v - a.v; });
      ordem.forEach(function (x, i) {
        if (x.v < -900) { if (x.c.meu) abandonos++; return; }
        var p = PONTOS[i] || 0; x.c.pts += p; x.c.time.pts += p;
        if (x.c.meu) { if (i === 0) vit++; if (i < 3) podios++; melhor = Math.min(melhor, i + 1); }
      });
    }
    var tabela = Object.keys(times).map(function (k) { return times[k]; }).concat([eu]).sort(function (a, b) { return b.pts - a.pts; });
    var pos = tabela.indexOf(eu) + 1;
    var areas = [['Pilotos', (achar(VAGAS[0], meus[0]).nota + achar(VAGAS[0], meus[1]).nota) / 2], ['Carro', carro], ['Corrida e estratégia', corrida], ['Comando', N('chefe')]].sort(function (a, b) { return b[1] - a[1]; });
    est.resultado = { tabela: tabela, pos: pos, eu: eu, vit: vit, podios: podios, melhor: melhor, abandonos: abandonos, meusCarros: carros.filter(function (c) { return c.meu; }), forte: areas[0][0], fraco: areas[areas.length - 1][0] };
    var rec = 99; try { rec = +localStorage.getItem(RECORDE) || 99; } catch (e) {}
    if (pos < rec) { try { localStorage.setItem(RECORDE, pos); } catch (e) {} est.resultado.recorde = true; }
  }

  /* ---------- tela ---------- */
  function pintar() {
    var g = gasto(), resta = est.orc - g, pct = Math.min(100, g / est.orc * 100);
    var rec = 0; try { rec = +localStorage.getItem(RECORDE) || 0; } catch (e) {}
    if (est.resultado) return pintarResultado();
    caixa.innerHTML =
      '<section class="ef-orc"><div><small>Orçamento da temporada</small><b>US$ ' + est.orc + ' mi</b></div>' +
        '<div><small>Gasto</small><b>US$ ' + g + ' mi</b></div><div class="' + (resta < 0 ? 'ef-neg' : '') + '"><small>Sobra</small><b>US$ ' + resta + ' mi</b></div>' +
        '<button type="button" class="ft-btn ft-btn-linha" data-acao="orc">Sortear outro orçamento</button>' +
        '<div class="ef-barra"><i style="width:' + pct.toFixed(1) + '%" class="' + (resta < 0 ? 'ef-neg' : '') + '"></i></div></section>' +
      '<label class="ef-nome">Nome da sua equipe <input id="ef-nome" maxlength="28" value="' + esc(est.nome) + '"></label>' +
      VAGAS.map(function (v) {
        var sel = achar(v, est.esc[v.k]), aberta = est.aberta === v.k;
        var outro = v.piloto ? est.esc[v.k === 'p1' ? 'p2' : 'p1'] : null;
        return '<section class="ef-vaga' + (sel ? ' ef-ok' : '') + (aberta ? ' ef-aberta' : '') + '">' +
          '<button type="button" class="ef-cab" data-abrir="' + v.k + '"><span><b>' + esc(v.t) + '</b><small>' + (sel ? esc(sel.nome) + ' · US$ ' + sel.preco + ' mi' : 'A contratar') + '</small></span><em>' + (sel ? '✓' : aberta ? '−' : '+') + '</em></button>' +
          (aberta ? '<p class="ef-desc">' + esc(v.d) + '</p><div class="ef-ops">' + v.op.map(function (o) {
            var ja = est.esc[v.k] === o.id, caro = !ja && o.preco - (sel ? sel.preco : 0) > resta, ocupado = outro === o.id;
            return '<button type="button" class="ef-op' + (ja ? ' ef-sel' : '') + '" data-vaga="' + v.k + '" data-id="' + esc(o.id) + '"' + (ocupado ? ' disabled' : '') + '>' +
              '<b>' + esc(o.nome) + '</b><small>' + esc(o.extra) + (ocupado ? ' · já contratado' : '') + '</small><span class="ef-nota">' + estrelas(o.nota) + '</span>' +
              '<span class="ef-preco' + (caro ? ' ef-caro' : '') + '">US$ ' + o.preco + ' mi</span></button>';
          }).join('') + '</div>' : '') + '</section>';
      }).join('') +
      '<div class="ef-fim">' + (completo() && resta >= 0 ? '<button type="button" class="ft-btn" data-acao="simular">🏁 Simular a temporada</button>'
        : '<p>' + (resta < 0 ? 'Passou do orçamento em US$ ' + (-resta) + ' mi. Troque alguém por uma opção mais barata.' : 'Faltam ' + VAGAS.filter(function (v) { return !est.esc[v.k]; }).length + ' vagas para completar a equipe.') + '</p>') +
      (rec ? '<small>Seu recorde: ' + rec + 'º lugar no Mundial de Construtores.</small>' : '') + '</div>';
  }
  function pintarResultado() {
    var R = est.resultado, eu = R.eu;
    caixa.innerHTML = '<section class="ef-res">' +
      '<p class="ef-pos"><b>' + R.pos + 'º</b><span>lugar no Mundial de Construtores' + (R.recorde ? ' · seu melhor resultado!' : '') + '</span></p>' +
      '<div class="av-placar"><span><b>' + eu.pts + '</b>pontos</span><span><b>' + R.vit + '</b>vitórias</span><span><b>' + R.podios + '</b>pódios</span><span><b>' + (R.melhor < 99 ? R.melhor + 'º' : '—') + '</b>melhor chegada</span></div>' +
      '<p class="ef-analise">Ponto forte: <b>' + esc(R.forte) + '</b> · Ponto fraco: <b>' + esc(R.fraco) + '</b>' + (R.abandonos ? ' · ' + R.abandonos + ' abandono' + (R.abandonos > 1 ? 's' : '') : '') + '</p>' +
      '<ul class="ef-pil">' + R.meusCarros.map(function (c) { return '<li><b>' + esc(c.piloto) + '</b><span>' + c.pts + ' pts</span></li>'; }).join('') + '</ul>' +
      '<h3>Mundial de Construtores</h3><ol class="ef-tab">' + R.tabela.map(function (t) { return '<li' + (t === eu ? ' class="ef-eu"' : '') + '><span>' + esc(t.nome) + '</span><b>' + t.pts + '</b></li>'; }).join('') + '</ol>' +
      '<div class="av-botoes"><button type="button" class="ft-btn" data-acao="de-novo">Simular de novo</button><button type="button" class="ft-btn ft-btn-linha" data-acao="editar">Mexer na equipe</button>' +
      '<button type="button" class="ft-btn ft-btn-linha" data-acao="nova">Nova equipe (outro orçamento)</button></div></section>';
  }
  caixa.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-acao');
    if (b.hasAttribute('data-abrir')) { var k = b.getAttribute('data-abrir'); est.aberta = est.aberta === k ? '' : k; pintar(); return; }
    if (b.hasAttribute('data-vaga')) {
      var vk = b.getAttribute('data-vaga'), id = b.getAttribute('data-id');
      est.esc[vk] = est.esc[vk] === id ? undefined : id;
      if (est.esc[vk]) { var prox = VAGAS.filter(function (v) { return !est.esc[v.k]; })[0]; est.aberta = prox ? prox.k : ''; }
      pintar(); return;
    }
    if (a === 'orc') { var o; do { o = ORCAMENTOS[Math.floor(Math.random() * ORCAMENTOS.length)]; } while (o === est.orc); est.orc = o; pintar(); }
    if (a === 'simular' || a === 'de-novo') { simular(); pintar(); window.scrollTo({ top: caixa.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' }); }
    if (a === 'editar') { est.resultado = null; pintar(); }
    if (a === 'nova') { est = { orc: ORCAMENTOS[Math.floor(Math.random() * ORCAMENTOS.length)], esc: {}, nome: est.nome, aberta: 'p1', resultado: null }; pintar(); }
  });
  caixa.addEventListener('input', function (e) { if (e.target.id === 'ef-nome') est.nome = e.target.value.trim() || 'Fan Zone Racing Team'; });
  pintar();
})();
