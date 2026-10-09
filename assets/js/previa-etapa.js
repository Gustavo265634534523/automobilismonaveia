/* Prévia da próxima etapa de uma categoria: horários de Brasília, previsão do tempo (com o que ela muda na corrida),
   campeonato, números da pista e o mapa da pista. Usada na página de cada categoria (categoria.js) e na página inicial.
   Localização das pistas: locais-pistas.js e previa-pistas.js. Mapas: assets/dados/pista-proxima.json (F1, com setores)
   e assets/dados/pistas-categorias.json (as outras; feitos pelos robôs .github/pista-proxima.js e .github/pistas-categorias.js).
   window.PREVIA_ETAPA(categoria, elemento) desenha dentro do elemento e devolve false quando a categoria não tem próxima etapa. */
(function () {
  var esc = window.esc;
  var mapas = {};
  function tempoVolta(s) { var m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3); }
  function nomeBonito(s) { return String(s).toLowerCase().replace(/(^|[\s-])\S/g, function (x) { return x.toUpperCase(); }); }
  function buscar(arq) {
    if (!mapas[arq]) mapas[arq] = fetch('assets/dados/' + arq + '?t=' + Math.floor(Date.now() / 6e5)).then(function (r) { return r.json(); }).catch(function () { return null; });
    return mapas[arq];
  }

  function proxima(c) {
    var hoje = window.hojeISO();
    return c.calendario.filter(function (x) { return !x.venc && x.d && x.d >= hoje; })[0] || null;
  }

  function desenharMapa(caixa, M, e) {
    var COR = ['#e3343c', '#3fa9f5', '#f5c518'], V = M.volta;
    var setores = (M.setores && M.setores.length ? M.setores : [M.d]).map(function (d, i) { return '<path d="' + d + '" stroke="' + (M.setores ? COR[i] : '#e3343c') + '"/>'; }).join('');
    var curvas = (M.curvas || []).map(function (k) { return '<g><circle cx="' + k.t[0] + '" cy="' + k.t[1] + '" r="10"/><text x="' + k.t[0] + '" y="' + (k.t[1] + 4) + '">' + esc(k.n) + '</text></g>'; }).join('');
    var larg = M.largada && M.largada.p ? '<circle class="pv-mapa-larg" cx="' + M.largada.p[0] + '" cy="' + M.largada.p[1] + '" r="7"/>' : '';
    var leg = M.setores ? '<ul class="pv-mapa-leg">' + [0, 1, 2].map(function (i) { return '<li><i style="background:' + COR[i] + '"></i>Setor ' + (i + 1) + (V && V.s && V.s[i] ? ' <b>' + V.s[i].toFixed(3).replace('.', ',') + 's</b>' : '') + '</li>'; }).join('') + '<li><i class="pv-mapa-li-larg"></i>Largada</li></ul>' : '';
    var nota;
    if (V) nota = 'Setores medidos na volta mais rápida da ' + esc(String(M.fonteSetores || '').replace(/^Sprint Qualifying/, 'classificação sprint').replace(/^Qualifying/, 'classificação').replace(/^Race/, 'corrida')) + ': ' + esc(nomeBonito(V.nome || V.sigla)) + ', ' + tempoVolta(V.tempo) + '.' + (M.pit && M.pit.normal ? ' Parada nos boxes custa cerca de ' + String(M.pit.normal).replace('.', ',') + 's.' : '') + ' Dados: OpenF1 e MultiViewer.';
    else if (M.fonte === 'f1') nota = 'Traçado e curvas numeradas oficiais da Fórmula 1 neste circuito' + (M.circuito ? ' (' + esc(M.circuito) + ')' : '') + '. Dados: MultiViewer.';
    else nota = 'Traçado real da pista' + (M.km ? ', ' + String(M.km.toFixed(2)).replace('.', ',') + ' km por volta' : '') + '. Mapa © colaboradores do OpenStreetMap.';
    caixa.innerHTML = '<h3>Mapa da pista</h3><svg class="pv-mapa" viewBox="0 0 400 400" role="img" aria-label="Desenho da pista de ' + esc(e.l) + '"><g class="pv-mapa-base"><path d="' + M.d + '"/></g><g class="pv-mapa-set">' + setores + '</g>' + larg + '<g class="pv-mapa-curvas">' + curvas + '</g></svg>' + leg + '<p class="pv-fonte">' + nota + '</p>';
    caixa.hidden = false;
    /* corta o espaço vazio em volta do desenho */
    try { var svg = caixa.querySelector('svg'), b = svg.getBBox(); if (b.width) svg.setAttribute('viewBox', [b.x - 14, b.y - 14, b.width + 28, b.height + 28].join(' ')); } catch (er) {}
  }

  function previsao(el, c, e, loc) {
    var MOTO = /motogp|superbike|motocross/.test(c.slug), hoje = window.hojeISO();
    var dias = {}; (e.s || []).forEach(function (x) { if (x.d) dias[x.d] = (dias[x.d] || []).concat(x.t); });
    if (!Object.keys(dias).length) dias[e.d] = ['Corrida'];
    var lista = Object.keys(dias).sort(), ini = lista[0], fim = lista[lista.length - 1];
    if ((new Date(ini + 'T12:00:00') - new Date(hoje + 'T12:00:00')) / 864e5 > 15) { el.innerHTML = '<p class="pv-vazio">A previsão aparece a partir de 15 dias antes da etapa.</p>'; return; }
    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat + '&longitude=' + loc.lon +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&start_date=' + ini + '&end_date=' + fim)
      .then(function (r) { return r.json(); }).then(function (j) {
        var d = j.daily; if (!d || !d.time) throw 0;
        var forte = [], talvez = [], ventos = [], calor = [], frio = [];
        var html = '<ul class="pv-tempo">' + d.time.map(function (dia, i) {
          if (!dias[dia]) return '';
          var chuva = d.precipitation_probability_max[i], tmax = Math.round(d.temperature_2m_max[i]), tmin = Math.round(d.temperature_2m_min[i]);
          var vento = Math.round(d.wind_speed_10m_max[i] || 0), raj = Math.round(d.wind_gusts_10m_max[i] || 0);
          var ic = chuva >= 60 ? '🌧️' : chuva >= 30 ? '🌦️' : '☀️';
          var quando = dia.split('-').reverse().slice(0, 2).join('/');
          if (chuva >= 60) forte.push(quando + ' (' + chuva + '%)'); else if (chuva >= 30) talvez.push(quando + ' (' + chuva + '%)');
          if (raj >= 45 || vento >= 30) ventos.push(quando + ' (rajadas de ' + raj + ' km/h)');
          if (tmax >= 32) calor.push(quando + ' (' + tmax + '°)'); else if (tmax <= 12) frio.push(quando + ' (' + tmax + '°)');
          return '<li><span class="pv-dia">' + quando + ' · ' + esc(dias[dia].join(', ')) + '</span><b>' + ic + ' ' + tmax + '° / ' + tmin + '°</b>' +
            '<span class="pv-det">Chuva: ' + (chuva == null ? '—' : chuva + '%') + ' · Vento: ' + vento + ' km/h' + (raj > vento ? ' (rajadas de ' + raj + ')' : '') + '</span></li>';
        }).join('') + '</ul>';
        function juntar(l) { return l.length > 1 ? l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1] : l[0]; }
        var notas = [];
        if (forte.length) notas.push('Grande chance de chuva em ' + juntar(forte) + '. Pista molhada embaralha o grid e a escolha de pneus vira loteria.');
        if (talvez.length) notas.push('Pode chover em ' + juntar(talvez) + '. As equipes ficam de olho no radar.');
        if (ventos.length) notas.push('Vento forte em ' + juntar(ventos) + '. ' + (MOTO ? 'A moto balança nas retas e o piloto sofre para segurar nas freadas.' : 'O carro fica instável nas retas e nas freadas, e o vento de frente ou de trás muda a velocidade final.'));
        if (calor.length) notas.push('Calor em ' + juntar(calor) + '. Os pneus desgastam mais rápido e o piloto se cansa mais.');
        if (frio.length) notas.push('Frio em ' + juntar(frio) + '. Os pneus demoram a esquentar nas primeiras voltas.');
        if (!notas.length) notas.push('Tempo firme, sem vento forte nem calor extremo: deve ser uma etapa sem surpresas do clima.');
        el.innerHTML = html + '<p class="pv-sub">O que o tempo muda na corrida</p><ul class="pv-lista">' + notas.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' +
          '<p class="pv-fonte">Previsão no horário local da pista. Fonte: Open-Meteo.</p>';
      }).catch(function () { el.innerHTML = '<p class="pv-vazio">Não foi possível buscar a previsão agora.</p>'; });
  }

  window.PREVIA_PROXIMA = proxima;
  window.PREVIA_ETAPA = function (c, alvo, opc) {
    opc = opc || {};
    var e = proxima(c);
    if (!e || !alvo) return false;
    var L = window.LOCAIS_PISTAS || {}, PP = window.PREVIA_PISTAS || {};
    var pista = /^formula-[12]$/.test(c.slug) ? PP[e.l] : null;
    var loc = L[c.slug + '|' + e.n] || L[e.l] || PP[e.l] || null;
    var restam = c.calendario.filter(function (x) { return !x.venc; }).length;
    function pts(l) { return parseInt(String(l[l.length - 1]).replace(/\D/g, ''), 10) || 0; }
    var lin = (c.classificacao && c.classificacao.linhas || []).slice(0, 3);
    var camp = '';
    if (lin.length >= 2) {
      var gap = pts(lin[0]) - pts(lin[1]);
      camp = '<ul class="pv-lista"><li><b>' + esc(lin[0][1]) + '</b> lidera com ' + pts(lin[0]) + ' pontos, ' + gap + ' à frente de <b>' + esc(lin[1][1]) + '</b>.</li>' +
        (lin[2] ? '<li><b>' + esc(lin[2][1]) + '</b> é o 3º, a ' + (pts(lin[0]) - pts(lin[2])) + ' pontos do líder.</li>' : '') +
        '<li>' + (restam === 1 ? 'Esta é a última etapa da temporada.' : 'Restam ' + restam + ' etapas, contando esta.') + '</li></ul>';
    }
    var numeros = pista ? '<ul class="pv-num"><li><b>' + pista.km.toFixed(3).replace('.', ',') + ' km</b><span>por volta</span></li><li><b>' + pista.voltas + '</b><span>voltas</span></li><li><b>' + Math.round(pista.km * pista.voltas) + ' km</b><span>de corrida</span></li></ul>' +
      (pista.venc ? '<p class="pv-sub">' + esc(pista.vencTitulo || 'Vencedores dos últimos anos') + '</p><ul class="pv-venc">' + pista.venc.map(function (v) { return '<li><span>' + v[0] + '</span>' + esc(v[1]) + '</li>'; }).join('') + '</ul>' : '') : '';
    var titulo = opc.comCategoria ? esc(c.nome) + ' · ' : '';
    alvo.innerHTML = '<p class="oa-rot">' + titulo + 'Próxima etapa · etapa ' + e.e + ' de ' + c.calendario.length + '</p>' +
      '<h2 class="pv-cat-t">' + esc(e.n) + '</h2><p class="pv-onde">' + esc(e.l) + ', ' + window.dataCurta(e.d) + (e.nota ? '. ' + esc(e.nota.charAt(0).toUpperCase() + e.nota.slice(1)) + '.' : '') + '</p>' + window.contagem(e) +
      '<div class="pv-grade">' +
        '<div class="pv-bloco"><h3>Horários de Brasília</h3>' + ((e.s && e.s.length) ? window.sessoes(e) : '<p class="pv-vazio">Os horários entram assim que a categoria divulgar.</p>') + '</div>' +
        '<div class="pv-bloco pv-tempo-bloco"><h3>Previsão do tempo</h3><div class="pv-tempo-caixa">' + (loc ? '<p class="pv-vazio">Buscando a previsão…</p>' : '<p class="pv-vazio">Previsão indisponível para esta pista.</p>') + '</div></div>' +
        (camp ? '<div class="pv-bloco"><h3>Campeonato</h3>' + camp + '</div>' : '') +
        (numeros ? '<div class="pv-bloco"><h3>Números da pista</h3>' + numeros + '</div>' : '') +
        '<div class="pv-bloco pv-mapa-bloco" hidden></div>' +
      '</div>' + (opc.rodape || '');
    /* mapa da pista */
    var caixaMapa = alvo.querySelector('.pv-mapa-bloco');
    if (c.slug === 'formula-1') buscar('pista-proxima.json').then(function (M) { if (M && M.etapa === e.n && M.d && alvo.contains(caixaMapa)) desenharMapa(caixaMapa, M, e); });
    else buscar('pistas-categorias.json').then(function (T) { var M = T && T[c.slug]; if (M && M.etapa === e.n && M.d && alvo.contains(caixaMapa)) desenharMapa(caixaMapa, M, e); });
    if (loc) previsao(alvo.querySelector('.pv-tempo-caixa'), c, e, loc);
    return true;
  };
})();
