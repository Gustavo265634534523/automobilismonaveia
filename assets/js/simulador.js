/* Simulador de campeonato de todas as categorias (simulador.html).
   A pessoa escolhe o pódio de cada corrida que falta e a tabela muda na hora.
   Classificação atual e pilotos vêm de dados.js. Os sistemas de pontos e as corridas que faltam ficam em REGRAS, abaixo.
   Para atualizar depois de uma etapa: atualize a classificação em dados.js e tire a etapa que já aconteceu de REGRAS. */
(function () {
  var esc = window.esc;
  var CATS = window.CATEGORIAS || [];
  var PORSLUG = {}; CATS.forEach(function (c) { PORSLUG[c.slug] = c; });

  /* Pontos do 1º, 2º e 3º em cada tipo de corrida */
  var P = {
    f1: [25, 18, 15], f1Sprint: [8, 7, 6],
    f2: [25, 18, 15], f2Sprint: [10, 8, 6],
    moto: [25, 20, 16], motoSprint: [12, 9, 7],
    stockPrincipal: [80, 74, 69], stockSprint: [55, 50, 46],
    porsche1: [28, 25, 23], porsche2: [25, 22, 20],
    rali: [25, 17, 15], raliExtra: [5, 4, 3],
    wec: [25, 18, 15]
  };
  function gp(nome, data, sessoes) { return { n: nome, d: data, s: sessoes }; }
  function s(nome, pontos) { return { t: nome, p: pontos }; }

  var REGRAS = {
    'formula-1': {
      etapas: [
        gp('GP do Bahrein, em Sepang', '2026-10-04', [s('Corrida', P.f1)]),
        gp('GP de Singapura', '2026-10-11', [s('Sprint', P.f1Sprint), s('Corrida', P.f1)]),
        gp('GP dos Estados Unidos', '2026-10-25', [s('Corrida', P.f1)]),
        gp('GP da Cidade do México', '2026-11-01', [s('Corrida', P.f1)]),
        gp('GP de São Paulo', '2026-11-08', [s('Corrida', P.f1)]),
        gp('GP de Las Vegas', '2026-11-21', [s('Corrida', P.f1)]),
        gp('GP do Catar', '2026-11-29', [s('Corrida', P.f1)]),
        gp('GP de Abu Dhabi', '2026-12-06', [s('Corrida', P.f1)])
      ],
      nota: 'Conta o pódio de cada corrida (25, 18 e 15 pontos) e da sprint de Singapura (8, 7 e 6).',
      pilotosDoGrid: true
    },
    'formula-2': {
      etapas: [
        gp('Catar', '2026-11-29', [s('Sprint', P.f2Sprint), s('Principal', P.f2)]),
        gp('Abu Dhabi', '2026-12-06', [s('Sprint', P.f2Sprint), s('Principal', P.f2)])
      ],
      nota: 'Conta o pódio da sprint (10, 8 e 6) e da principal (25, 18 e 15). Pontos de pole e volta mais rápida ficam de fora.'
    },
    'motogp': {
      etapas: [
        gp('GP do Japão', '2026-10-04', [s('Sprint', P.motoSprint), s('Corrida', P.moto)]),
        gp('GP da Indonésia', '2026-10-11', [s('Sprint', P.motoSprint), s('Corrida', P.moto)]),
        gp('GP da Austrália', '2026-10-25', [s('Sprint', P.motoSprint), s('Corrida', P.moto)]),
        gp('GP da Malásia', '2026-11-01', [s('Sprint', P.motoSprint), s('Corrida', P.moto)]),
        gp('GP do Catar', '2026-11-08', [s('Sprint', P.motoSprint), s('Corrida', P.moto)]),
        gp('GP de Portugal', '2026-11-22', [s('Sprint', P.motoSprint), s('Corrida', P.moto)]),
        gp('GP de Valência', '2026-11-29', [s('Sprint', P.motoSprint), s('Corrida', P.moto)])
      ],
      nota: 'Conta o pódio da sprint (12, 9 e 7) e da corrida (25, 20 e 16) de cada GP.'
    },
    'stock-car': {
      etapas: [
        gp('Etapa 10, Cascavel', '2026-10-18', [s('Corrida sprint', P.stockSprint), s('Corrida principal', P.stockPrincipal)]),
        gp('Etapa 11, Velopark', '2026-11-15', [s('Corrida sprint', P.stockSprint), s('Corrida principal', P.stockPrincipal)]),
        gp('Final, Interlagos', '2026-12-13', [s('Corrida sprint', P.stockSprint), s('Corrida principal', P.stockPrincipal)])
      ],
      nota: 'Conta o pódio da sprint (55, 50 e 46) e da principal (80, 74 e 69). A etapa de Brasília (endurance) ainda não entrou na tabela. Os descartes dos piores resultados não entram na conta.'
    },
    'porsche-cup': {
      etapas: [
        gp('Interlagos', '2026-11-08', [s('Corrida 1', P.porsche1), s('Corrida 2 (grid invertido)', P.porsche2)]),
        gp('Interlagos', '2026-11-22', [s('Corrida 1', P.porsche1), s('Corrida 2 (grid invertido)', P.porsche2)])
      ],
      nota: 'Campeonato Sprint da Carrera Cup. Conta o pódio da corrida 1 (28, 25 e 23) e da corrida 2 (25, 22 e 20). As provas de endurance têm campeonato próprio.'
    },
    'rally': {
      etapas: [
        gp('Rally Itália Sardenha', '2026-10-04', [s('Resultado final', P.rali), s('Super Sunday', P.raliExtra), s('Power Stage', P.raliExtra)])
      ],
      nota: 'Última etapa. Conta o pódio final (25, 17 e 15), o Super Sunday e a Power Stage (5, 4 e 3 cada).'
    },
    'endurance': {
      etapas: [
        gp('6 Horas de Barcelona', '2026-10-18', [s('Corrida', P.wec)]),
        gp('6 Horas de Monza', '2026-11-08', [s('Corrida', P.wec)])
      ],
      nota: 'Hypercar. Você escolhe o carro, e os pontos vão para a dupla ou o trio dele (25, 18 e 15). Os pontos de pole ficam de fora.',
      porCarro: true
    },
    'nascar': {
      fora: 'A NASCAR decide o título no Chase, com regras próprias de classificação, e não só pela soma de pontos. Por isso ela não entra no simulador.'
    }
  };
  var ORDEM = ['formula-1', 'motogp', 'stock-car', 'porsche-cup', 'formula-2', 'rally', 'endurance', 'nascar', 'formula-3', 'formula-e', 'indycar', 'motocross'];

  var abas = document.getElementById('sm-cats');
  var caixa = document.getElementById('simulador');
  if (!caixa) return;
  /* Modo básico (demonstração da página inicial): data-so="formula-1" mostra só essa categoria, sem as abas */
  var so = caixa.getAttribute('data-so');
  var catAtual, escolhas, base, opcoesHtml;

  if (abas) abas.innerHTML = ORDEM.filter(function (sl) { return PORSLUG[sl]; }).map(function (sl) {
    var r = REGRAS[sl];
    var fim = !r;
    return '<button type="button" class="sm-cat' + (fim ? ' sm-cat-fim' : '') + '" data-cat="' + sl + '" aria-pressed="false">' + esc(PORSLUG[sl].nome) +
      (fim ? '<small>Encerrado</small>' : '') + '</button>';
  }).join('');

  function abrir(slug) {
    catAtual = slug;
    if (abas) [].forEach.call(abas.children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === slug); });
    if (!so && history.replaceState) history.replaceState(null, '', '#' + slug);
    var c = PORSLUG[slug], r = REGRAS[slug];

    if (!r) { /* temporada encerrada */
      caixa.innerHTML = '<div class="sm-aviso"><h2>' + esc(c.nome) + ': temporada encerrada.</h2><p><b>' + esc(c.lider.nome) + '</b>, ' + esc(c.lider.info) + '.</p>' +
        '<p>Não há mais corridas para simular. Veja a classificação final na <a href="' + slug + '.html#classificacao">página da ' + esc(c.nome) + '</a>.</p></div>';
      return;
    }
    if (r.fora) {
      caixa.innerHTML = '<div class="sm-aviso"><h2>' + esc(c.nome) + '</h2><p>' + esc(r.fora) + '</p><p>Acompanhe o Chase na <a href="' + slug + '.html#classificacao">página da ' + esc(c.nome) + '</a>.</p></div>';
      return;
    }

    /* Classificação atual */
    var cl = c.classificacao;
    base = cl.linhas.map(function (l) {
      return { nome: l[1], equipe: l.length > 3 ? l[2] : '', pts: parseInt(l[l.length - 1], 10) || 0 };
    });

    /* Quem pode ser escolhido */
    var grupos = [];
    if (r.pilotosDoGrid && c.equipes) {
      grupos = c.equipes.map(function (e) { return { n: e.n, p: e.p.map(function (nome) { return { v: nome, t: nome }; }) }; });
    } else if (r.porCarro) {
      grupos = [{ n: 'Hypercar', p: base.map(function (b) { return { v: b.nome, t: b.equipe + ' (' + b.nome + ')' }; }) }];
    } else {
      var porEquipe = {}, ordem = [];
      base.forEach(function (b) {
        var eq = b.equipe && b.equipe !== '—' ? b.equipe : 'Outros';
        if (!porEquipe[eq]) { porEquipe[eq] = []; ordem.push(eq); }
        porEquipe[eq].push({ v: b.nome, t: b.nome });
      });
      grupos = ordem.map(function (eq) { return { n: eq, p: porEquipe[eq] }; });
    }
    opcoesHtml = function (sel) {
      return '<option value="">Escolher</option>' + grupos.map(function (g) {
        return '<optgroup label="' + esc(g.n) + '">' + g.p.map(function (p) {
          return '<option value="' + esc(p.v) + '"' + (p.v === sel ? ' selected' : '') + '>' + esc(p.t) + '</option>';
        }).join('') + '</optgroup>';
      }).join('');
    };

    /* Corridas (cada sessão vira uma linha) */
    var linhas = [];
    r.etapas.forEach(function (e) { e.s.forEach(function (x) { linhas.push({ e: e, s: x }); }); });
    escolhas = linhas.map(function () { return ['', '', '']; });

    caixa.innerHTML = '<div class="pl-sim-grade"><div class="pl-sim-corridas">' +
      linhas.map(function (l, i) {
        return '<div class="pl-corrida"><div class="pl-corrida-nome"><b>' + esc(l.e.n) + '</b><span>' + esc(l.s.t) + ' · ' + window.dataCurta(l.e.d) + '</span></div>' +
          [0, 1, 2].map(function (k) {
            return '<label><span>P' + (k + 1) + ' <em>+' + l.s.p[k] + '</em></span><select data-c="' + i + '" data-k="' + k + '">' + opcoesHtml('') + '</select></label>';
          }).join('') + '</div>';
      }).join('') +
      '<button type="button" class="pl-botao pl-botao-linha pl-limpar">Limpar escolhas</button></div>' +
      '<div class="pl-sim-res"><h3>Como ficaria o campeonato</h3><div id="sim-tabela"></div><p class="nota">' + esc(r.nota) + '</p></div></div>';
    caixa.linhasSim = linhas;
    desenharTabela();
  }

  function desenharTabela() {
    var linhas = caixa.linhasSim, r = REGRAS[catAtual];
    var proj = base.map(function (p, i) {
      var extra = 0;
      escolhas.forEach(function (c, ci) { c.forEach(function (nome, k) { if (nome === p.nome) extra += linhas[ci].s.p[k]; }); });
      return { nome: p.nome, equipe: p.equipe, pts: p.pts + extra, extra: extra, antes: i + 1 };
    }).sort(function (a, b) { return b.pts - a.pts || a.antes - b.antes; });
    var restante = linhas.reduce(function (s, l, i) { return s + (escolhas[i].some(function (x) { return !x; }) ? l.s.p[0] : 0); }, 0);
    var lider = proj[0], vice = proj[1];
    var titulo = '';
    if (lider && vice && escolhas.every(function (c) { return c.every(Boolean); })) titulo = '<p class="sm-campeao">Com essas escolhas, <b>' + esc(r.porCarro ? lider.equipe : lider.nome) + '</b> é campeão, com ' + (lider.pts - vice.pts) + ' pontos de vantagem.</p>';
    else if (lider && vice && lider.pts - vice.pts > restante) titulo = '<p class="sm-campeao"><b>' + esc(r.porCarro ? lider.equipe : lider.nome) + '</b> já garante o título com essas escolhas.</p>';
    document.getElementById('sim-tabela').innerHTML = titulo +
      '<table class="tabela pl-sim-tab"><thead><tr><th>Pos</th><th>' + (r.porCarro ? 'Carro' : 'Piloto') + '</th><th>Ganho</th><th>Pts</th></tr></thead><tbody>' +
      proj.map(function (p, i) {
        var mud = p.antes - (i + 1);
        var seta = mud > 0 ? '<i class="pl-sobe">▲ ' + mud + '</i>' : mud < 0 ? '<i class="pl-desce">▼ ' + (-mud) + '</i>' : '';
        var nome = r.porCarro ? p.equipe + ' <small class="sm-trio">' + esc(p.nome) + '</small>' : esc(p.nome);
        return '<tr class="p' + (i + 1) + '"><td>' + (i + 1) + '</td><td>' + nome + ' ' + seta + '</td><td>' + (p.extra ? '+' + p.extra : '') + '</td><td>' + p.pts + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  caixa.addEventListener('change', function (e) {
    var sel = e.target; if (sel.tagName !== 'SELECT') return;
    var c = +sel.getAttribute('data-c'), k = +sel.getAttribute('data-k');
    escolhas[c][k] = sel.value;
    /* o mesmo piloto não pode ficar em duas posições da mesma corrida */
    if (sel.value) [0, 1, 2].forEach(function (o) {
      if (o !== k && escolhas[c][o] === sel.value) {
        escolhas[c][o] = '';
        caixa.querySelector('select[data-c="' + c + '"][data-k="' + o + '"]').value = '';
      }
    });
    desenharTabela();
  });
  caixa.addEventListener('click', function (e) {
    if (!e.target.classList.contains('pl-limpar')) return;
    escolhas = escolhas.map(function () { return ['', '', '']; });
    [].forEach.call(caixa.querySelectorAll('select'), function (s) { s.value = ''; });
    desenharTabela();
  });
  if (abas) abas.addEventListener('click', function (e) {
    var b = e.target.closest('.sm-cat'); if (b) abrir(b.getAttribute('data-cat'));
  });

  function comecar() {
    var inicial = so || location.hash.slice(1);
    abrir(PORSLUG[inicial] ? inicial : 'formula-1');
  }
  if (so) { comecar(); return; } /* demonstração da página inicial: livre para todos */

  /* Simulador completo: só para o plano Master. No computador (localhost, sem servidor PHP) abre em modo de teste. */
  var local = /^(localhost|127.0.0.1|)$/.test(location.hostname);
  if (abas) abas.hidden = true;
  caixa.innerHTML = '<p class="nota">Carregando…</p>';
  function trava(titulo, texto, botoes) {
    caixa.innerHTML = '<div class="sm-trava"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="sm-trava-acoes">' + botoes + '</div>' +
      '<p class="sm-trava-demo">Quer experimentar antes? A <a href="index.html#simulador-demo">demonstração só da Fórmula 1</a> está liberada na página inicial.</p></div>';
  }
  (window.NAVEIA_EU || Promise.resolve({ gratis: true })).then(function (r) {
    if (r.gratis) { /* site grátis: liberado para todos */ }
    else if (r.semServidor) {
      if (!local) return trava('Simulador indisponível agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="simulador.html">Tentar de novo</a>');
      caixa.insertAdjacentHTML('beforebegin', '<p class="sm-teste">Modo de teste no seu computador. No site no ar, só assinantes Master veem esta página.</p>');
    } else if (!r.logado) {
      return trava('Exclusivo do plano Master', 'Entre na sua conta para usar o simulador completo. Se ainda não assina, conheça o Master.', '<a class="pl-botao" href="entrar.html?volta=simulador.html">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
    } else if (r.usuario.plano !== 'master') {
      return trava('Exclusivo do plano Master', 'Seu plano atual não inclui o simulador completo. Mude para o Master e simule todas as categorias.', '<a class="pl-botao" href="planos.html">Conhecer o Master</a>');
    }
    if (abas) abas.hidden = false;
    comecar();
  });
})();
