/* Página de planos (prévia interna): amostra da Prévia da etapa e Simulador de campeonato da F1. */
(function () {
  var f1 = window.CATEGORIAS.filter(function (c) { return c.slug === 'formula-1'; })[0];
  var linhas = f1.classificacao.linhas.map(function (l) { return { nome: l[1], equipe: l[2], pts: +l[3] || 0 }; });
  var restantes = f1.calendario.filter(function (e) { return !e.venc; });
  var etapa = restantes[0];
  var PONTOS = [25, 18, 15];

  /* Dados fixos de cada pista (vencedores confirmados) */
  var PISTAS = {
    'Baku': { txt: 'Uma reta de 2,2 km termina na freada da curva 1, e o trecho do castelo aperta a pista entre muros. O vácuo decide as ultrapassagens, e o muro cobra cada freada atrasada.', venc: [['2022', 'Max Verstappen'], ['2023', 'Sergio Pérez'], ['2024', 'Oscar Piastri'], ['2025', 'Max Verstappen']] },
    'Sepang (Malásia)': { txt: 'Duas retas longas ligadas por um grampo fechado, onde se ultrapassa na freada. Calor tropical e chuva forte no meio da tarde mudam a corrida em minutos. A F1 volta a Sepang pela primeira vez desde 2017.', venc: [['2014', 'Lewis Hamilton'], ['2015', 'Sebastian Vettel'], ['2016', 'Daniel Ricciardo'], ['2017', 'Max Verstappen']], titulo: 'Últimas vitórias da F1 em Sepang' },
    'Marina Bay': { txt: 'Corrida noturna entre muros, com calor e umidade que desidratam o piloto. O safety car aparece com frequência, e ultrapassar exige paciência.', venc: [['2022', 'Sergio Pérez'], ['2023', 'Carlos Sainz'], ['2024', 'Lando Norris'], ['2025', 'George Russell']] },
    'Austin': { txt: 'A subida até a curva 1 abre a pista em leque e convida a atacar por fora. O trecho de curvas em S castiga quem perde o ritmo.', venc: [['2022', 'Max Verstappen'], ['2023', 'Max Verstappen'], ['2024', 'Charles Leclerc'], ['2025', 'Max Verstappen']] }
  };

  function bloco(titulo, corpo, master, extra) {
    return '<section class="pl-bloco' + (master ? ' pl-so-master' : '') + (extra || '') + '">' +
      (master ? '<span class="pl-selo">Master</span>' : '') +
      '<h3>' + titulo + '</h3>' + corpo +
      (master ? '<div class="pl-cadeado" aria-hidden="true"><b>Disponível no Master</b><span>Assine o Master para ver este bloco.</span></div>' : '') +
      '</section>';
  }
  function amostra(t) { return '<p class="pl-vazio">' + t + '</p>'; }

  /* Cada bloco só aparece se a página tiver o lugar dele (planos.html e painel.html usam este arquivo). */
  var previaEl = document.getElementById('previa') || document.createElement('div');

  /* Prévia da etapa */
  function montarPrevia() {
    if (!etapa) { previaEl.innerHTML = amostra('A temporada terminou. A próxima prévia sai no começo do ano que vem.'); return; }
    var pista = PISTAS[etapa.l];
    var L = linhas[0], S = linhas[1], n = restantes.length;
    var gap = L.pts - S.pts;

    var cab = '<header class="pl-previa-cab"><span>Fórmula 1, etapa ' + etapa.e + ' de ' + f1.calendario.length + '</span>' +
      '<h3>' + esc(etapa.n) + '</h3><p>' + esc(etapa.l) + ', ' + window.dataCurta(etapa.d) + '</p></header>';

    var horarios = etapa.s ? window.sessoes(etapa) : amostra('Os horários entram assim que a categoria divulgar.');
    var jogo = '<ul class="pl-itens">' +
      '<li><b>' + esc(L.nome) + '</b> lidera com ' + L.pts + ' pontos, ' + gap + ' à frente de <b>' + esc(S.nome) + '</b>.</li>' +
      '<li>Se ' + esc(L.nome.split(' ').pop()) + ' vencer e ' + esc(S.nome.split(' ').pop()) + ' não pontuar, a vantagem vai a ' + (gap + 25) + ' pontos.</li>' +
      '<li>Se ' + esc(S.nome.split(' ').pop()) + ' vencer e ' + esc(L.nome.split(' ').pop()) + ' não pontuar, a vantagem cai para ' + (gap - 25) + '.</li>' +
      '<li>Restam ' + n + ' corridas, com até ' + (25 * n) + ' pontos em jogo para cada piloto, sem contar sprints.</li></ul>';

    var essencial =
      bloco('Horários no fuso de Brasília', horarios) +
      bloco('O que está em jogo', jogo) +
      bloco('Previsão do tempo', amostra('Entra três dias antes da corrida, com chance de chuva para treino, classificação e corrida.')) +
      bloco('A pista', '<p>' + esc(pista ? pista.txt : 'Descrição da pista entra aqui.') + '</p>');

    /* Cenários de título: quem ainda alcança e o que precisa */
    var vivos = linhas.filter(function (p) { return p.pts + 25 * n >= L.pts; });
    var depois = n - 1;
    var fecha = gap + 25 > 25 * depois;
    var cenarios = '<ul class="pl-itens">' +
      '<li>' + (fecha ? '<b>' + esc(L.nome) + '</b> pode sair desta etapa campeão se vencer e ' + esc(S.nome.split(' ').pop()) + ' não pontuar.'
        : '<b>' + esc(L.nome) + '</b> ainda não fecha o título aqui. Para isso precisaria abrir mais de ' + (25 * depois) + ' pontos.') + '</li>' +
      vivos.slice(1, 4).map(function (p) {
        var d = L.pts - p.pts;
        return '<li><b>' + esc(p.nome) + '</b> precisa tirar em média ' + (Math.ceil(d / n * 10) / 10).toString().replace('.', ',') + ' pontos por corrida do líder.</li>';
      }).join('') +
      '<li>' + vivos.length + ' pilotos ainda têm chance matemática.</li></ul>';

    var numeros = pista ? (pista.titulo ? '<p style="margin-bottom:10px">' + esc(pista.titulo) + '</p>' : '') + '<table class="tabela pl-mini"><thead><tr><th>Ano</th><th>Vencedor</th></tr></thead><tbody>' +
      pista.venc.map(function (v) { return '<tr><td>' + v[0] + '</td><td>' + esc(v[1]) + '</td></tr>'; }).join('') + '</tbody></table>'
      : amostra('Vencedores dos últimos anos entram aqui.');

    var completa =
      bloco('Raio-x do circuito', '<div class="pl-mapa"><span>Mapa da pista com curvas numeradas, pontos de ultrapassagem e velocidade máxima.</span></div>', true) +
      bloco('Números da pista', numeros, true) +
      bloco('Cenários de título', cenarios, true) +
      bloco('Palpites do bolão', amostra('O pódio mais votado pelos membros e quanta gente apostou em cada piloto.'), true);

    previaEl.innerHTML = cab + '<div class="pl-previa-grade">' + essencial + completa + '</div>';
  }
  montarPrevia();

  var botoes = [].slice.call(document.querySelectorAll('.pl-troca-btn'));
  botoes.forEach(function (b) {
    b.addEventListener('click', function () {
      botoes.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      previaEl.setAttribute('data-plano', b.getAttribute('data-plano'));
    });
  });

  /* Simulador */
  var sim = document.getElementById('simulador') || document.createElement('div');
  /* Todo o grid atual (as 11 equipes de dados.js), agrupado por equipe */
  var equipes = f1.equipes || [];
  var escolhas = restantes.map(function () { return ['', '', '']; });

  function opcoes(sel) {
    return '<option value="">Escolher</option>' + equipes.map(function (eq) {
      return '<optgroup label="' + esc(eq.n) + '">' + eq.p.map(function (nome) {
        return '<option value="' + esc(nome) + '"' + (nome === sel ? ' selected' : '') + '>' + esc(nome) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }
  function corridas() {
    return restantes.map(function (e, i) {
      return '<div class="pl-corrida"><div class="pl-corrida-nome"><b>' + esc(e.n) + '</b><span>' + window.dataCurta(e.d) + '</span></div>' +
        [0, 1, 2].map(function (k) {
          return '<label><span>P' + (k + 1) + '</span><select data-c="' + i + '" data-k="' + k + '">' + opcoes(escolhas[i][k]) + '</select></label>';
        }).join('') + '</div>';
    }).join('');
  }
  function tabela() {
    var proj = linhas.map(function (p, i) {
      var extra = 0;
      escolhas.forEach(function (c) { c.forEach(function (nome, k) { if (nome === p.nome) extra += PONTOS[k]; }); });
      return { nome: p.nome, equipe: p.equipe, pts: p.pts + extra, extra: extra, antes: i + 1 };
    }).sort(function (a, b) { return b.pts - a.pts || a.antes - b.antes; }).slice(0, 10);
    return '<table class="tabela pl-sim-tab"><thead><tr><th>Pos</th><th>Piloto</th><th>Ganho</th><th>Pts</th></tr></thead><tbody>' +
      proj.map(function (p, i) {
        var mud = p.antes - (i + 1);
        var seta = mud > 0 ? '<i class="pl-sobe">▲ ' + mud + '</i>' : mud < 0 ? '<i class="pl-desce">▼ ' + (-mud) + '</i>' : '';
        return '<tr class="p' + (i + 1) + '"><td>' + (i + 1) + '</td><td>' + esc(p.nome) + ' ' + seta + '</td><td>' + (p.extra ? '+' + p.extra : '') + '</td><td>' + p.pts + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  function montarSim() {
    sim.innerHTML = '<div class="pl-sim-grade"><div class="pl-sim-corridas">' + corridas() +
      '<button type="button" class="pl-botao pl-botao-linha pl-limpar">Limpar escolhas</button></div>' +
      '<div class="pl-sim-res"><h3>Como ficaria o campeonato</h3><div id="sim-tabela">' + tabela() + '</div>' +
      '<p class="nota">Versão de amostra: conta só o pódio (25, 18 e 15 pontos) das corridas que faltam, sem sprints.</p></div></div>';
  }
  montarSim();

  sim.addEventListener('change', function (e) {
    var s = e.target; if (s.tagName !== 'SELECT') return;
    var c = +s.getAttribute('data-c'), k = +s.getAttribute('data-k');
    /* o mesmo piloto não pode ocupar duas posições na mesma corrida */
    escolhas[c] = escolhas[c].map(function (v, j) { return j !== k && v === s.value ? '' : v; });
    escolhas[c][k] = s.value;
    [].forEach.call(sim.querySelectorAll('select[data-c="' + c + '"]'), function (x) { x.value = escolhas[c][+x.getAttribute('data-k')]; });
    document.getElementById('sim-tabela').innerHTML = tabela();
  });
  sim.addEventListener('click', function (e) {
    if (!e.target.classList.contains('pl-limpar')) return;
    escolhas = restantes.map(function () { return ['', '', '']; });
    montarSim();
  });

  /* Maratona do fim de semana */
  var mar = document.getElementById('maratona') || document.createElement('div');
  var DIAS_L = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function duracao(t) { return /6 horas/.test(t) ? 360 : /2 horas/.test(t) ? 140 : /Corrida/.test(t) ? 110 : /Principal|Sprint/.test(t) ? 60 : /Power Stage/.test(t) ? 30 : 60; }
  function principal(t) { return /Corrida|Principal|Sprint|Classifica|Hyperpole|Power Stage/.test(t); }
  var agoraMs = Date.now();
  var todas = [];
  window.CATEGORIAS.forEach(function (c) {
    c.calendario.forEach(function (e) {
      (e.s || []).forEach(function (x) {
        var ini = new Date(x.d + 'T' + x.h + ':00-03:00').getTime();
        var fim = ini + duracao(x.t) * 6e4;
        if (fim > agoraMs && ini - agoraMs < 12 * 864e5) todas.push({ cat: c, e: e, x: x, ini: ini, fim: fim });
      });
    });
  });
  todas.sort(function (a, b) { return a.ini - b.ini; });
  var comSessao = window.CATEGORIAS.filter(function (c) { return todas.some(function (t) { return t.cat === c; }); });
  var favs = window.NAVEIA_FAVORITAS || [];
  var marcadas = {}; comSessao.forEach(function (c) { marcadas[c.slug] = !favs.length || favs.indexOf(c.slug) > -1; });
  var soPrincipais = true;

  function brt(ms) { return new Date(ms - 3 * 36e5); }
  function hora(ms) { var d = brt(ms); return ('0' + d.getUTCHours()).slice(-2) + 'h' + ('0' + d.getUTCMinutes()).slice(-2); }
  function diaChave(ms) { return brt(ms).toISOString().slice(0, 10); }
  function escolhidas() { return todas.filter(function (t) { return marcadas[t.cat.slug] && (!soPrincipais || principal(t.x.t)); }); }

  function montarMaratona() {
    if (!todas.length) { mar.innerHTML = amostra('Nenhuma sessão com horário confirmado nos próximos dias.'); return; }
    var lista = escolhidas();
    var dias = {};
    lista.forEach(function (t) {
      t.conflito = lista.some(function (o) { return o !== t && o.cat !== t.cat && o.ini < t.fim && t.ini < o.fim; });
      (dias[diaChave(t.ini)] = dias[diaChave(t.ini)] || []).push(t);
    });
    var conflitos = lista.filter(function (t) { return t.conflito; }).length;
    var madrugada = lista.filter(function (t) { return brt(t.ini).getUTCHours() < 6; }).length;

    var filtros = '<div class="pl-mar-filtros"><div class="pl-mar-cats">' + comSessao.map(function (c) {
      return '<label class="pl-chip"><input type="checkbox" data-cat="' + c.slug + '"' + (marcadas[c.slug] ? ' checked' : '') + '><span>' + esc(c.nome) + '</span></label>';
    }).join('') + '</div><label class="pl-chip pl-chip-alt"><input type="checkbox" id="mar-todas"' + (soPrincipais ? '' : ' checked') + '><span>Incluir treinos livres</span></label></div>';

    var resumo = '<div class="pl-mar-resumo"><p><b>' + lista.length + '</b> sessões</p><p><b>' + conflitos + '</b> em conflito</p><p><b>' + madrugada + '</b> de madrugada</p>' +
      '<button type="button" class="pl-botao pl-mar-baixar"' + (lista.length ? '' : ' disabled') + '>Mandar para a agenda</button></div>';

    var agenda = Object.keys(dias).sort().map(function (k) {
      var d = new Date(k + 'T12:00:00');
      return '<div class="pl-mar-dia"><h3>' + DIAS_L[d.getDay()] + ', ' + window.dataCurta(k) + '</h3><ol>' + dias[k].map(function (t) {
        var marcas = (t.ini <= agoraMs ? '<em class="pl-tag pl-tag-conf">Ao vivo</em>' : '') + (t.conflito ? '<em class="pl-tag pl-tag-conf">Conflito</em>' : '') + (brt(t.ini).getUTCHours() < 6 ? '<em class="pl-tag">Madrugada</em>' : '');
        return '<li class="pl-mar-item' + (t.conflito ? ' conflito' : '') + '"><time>' + hora(t.ini) + '</time><div><b>' + esc(t.cat.nome) + ', ' + esc(t.x.t) + '</b><span>' + esc(t.e.n) + ', ' + esc(t.e.l) + '</span></div><p>' + marcas + '</p></li>';
      }).join('') + '</ol></div>';
    }).join('') || amostra('Marque pelo menos uma categoria.');

    mar.innerHTML = filtros + '<div class="pl-mar-grade"><div class="pl-mar-agenda">' + agenda + '</div>' + resumo + '</div>';
  }
  montarMaratona();

  mar.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'mar-todas') soPrincipais = !t.checked;
    else if (t.getAttribute('data-cat')) marcadas[t.getAttribute('data-cat')] = t.checked;
    montarMaratona();
  });
  mar.addEventListener('click', function (e) {
    if (!e.target.classList.contains('pl-mar-baixar')) return;
    function ics(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; }
    var ev = escolhidas().map(function (t, i) {
      return ['BEGIN:VEVENT', 'UID:naveia-' + t.cat.slug + '-' + t.ini + '-' + i + '@naveia', 'DTSTAMP:' + ics(Date.now()),
        'DTSTART:' + ics(t.ini), 'DTEND:' + ics(t.fim), 'SUMMARY:' + t.cat.nome + ', ' + t.x.t + ' (' + t.e.n + ')',
        'LOCATION:' + t.e.l, 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Largada em 30 minutos', 'END:VALARM', 'END:VEVENT'].join('\r\n');
    });
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Automobilismo Na Veia//Maratona//PT', 'CALSCALE:GREGORIAN'].concat(ev, ['END:VCALENDAR']).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' }));
    a.download = 'maratona-na-veia.ics';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* Link direto para uma seção (ex.: planos.html#simulador-campeonato): rola até ela depois que tudo foi montado */
  if (location.hash.length > 1) {
    var alvo = document.getElementById(location.hash.slice(1));
    if (alvo) setTimeout(function () { alvo.scrollIntoView(); }, 60);
  }
})();
