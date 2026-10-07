/* Prévia da etapa completa (plano Master): a próxima corrida da Fórmula 1 com horários, o que está em jogo,
   previsão do tempo (Open-Meteo), mapa e números da pista, cenários de título e o pódio mais votado do bolão. */
(function () {
  var esc = window.esc;
  /* na página inicial (#previa-home) a prévia aparece aberta e mais curta: horários, previsão, números da pista e cenários de título */
  var home = document.getElementById('previa-home');
  var caixa = home || document.getElementById('previa');
  if (!caixa) return;
  var f1 = window.CATEGORIAS.filter(function (c) { return c.slug === 'formula-1'; })[0];
  var hoje = window.hojeISO();
  var restantes = f1.calendario.filter(function (e) { return !e.venc; });
  var etapa = restantes.filter(function (e) { return e.d && e.d >= hoje; })[0] || restantes[0];

  function bloco(titulo, corpo, extra) { return '<section class="pl-bloco' + (extra || '') + '"><h3>' + titulo + '</h3>' + corpo + '</section>'; }
  function aviso(t) { return '<p class="pl-vazio">' + t + '</p>'; }
  function dataBR(iso) { return iso.split('-').reverse().slice(0, 2).join('/'); }

  function montar() {
    if (!etapa) { caixa.innerHTML = aviso('A temporada terminou. A próxima prévia sai no começo do ano que vem.'); return; }
    var pista = (window.PREVIA_PISTAS || {})[etapa.l] || null;
    var linhas = f1.classificacao.linhas.map(function (l) { return { nome: l[1], equipe: l[2], pts: +l[3] || 0 }; });
    var L = linhas[0], S = linhas[1], n = restantes.length, gap = L.pts - S.pts;

    var cab = '<header class="pl-previa-cab"><span>Fórmula 1, etapa ' + etapa.e + ' de ' + f1.calendario.length + '</span>' +
      '<h3>' + esc(etapa.n) + '</h3><p>' + esc(etapa.l) + ', ' + window.dataCurta(etapa.d) + (etapa.nota ? '. ' + esc(etapa.nota.charAt(0).toUpperCase() + etapa.nota.slice(1)) + '.' : '') + '</p>' + window.contagem(etapa) + '</header>';

    var horarios = etapa.s ? window.sessoes(etapa) : aviso('Os horários entram assim que a categoria divulgar.');

    var jogo = '<ul class="pl-itens">' +
      '<li><b>' + esc(L.nome) + '</b> lidera com ' + L.pts + ' pontos, ' + gap + ' à frente de <b>' + esc(S.nome) + '</b>.</li>' +
      '<li>Se ' + esc(L.nome.split(' ').pop()) + ' vencer e ' + esc(S.nome.split(' ').pop()) + ' não pontuar, a vantagem vai a ' + (gap + 25) + ' pontos.</li>' +
      '<li>Se ' + esc(S.nome.split(' ').pop()) + ' vencer e ' + esc(L.nome.split(' ').pop()) + ' não pontuar, a vantagem cai para ' + (gap - 25) + '.</li>' +
      '<li>Restam ' + n + ' corridas, com até ' + (25 * n) + ' pontos em jogo para cada piloto, sem contar sprints.</li></ul>';

    var vivos = linhas.filter(function (p) { return p.pts + 25 * n >= L.pts; }), depois = n - 1, fecha = gap + 25 > 25 * depois;
    var cenarios = '<ul class="pl-itens">' +
      '<li>' + (fecha ? '<b>' + esc(L.nome) + '</b> pode sair desta etapa campeão se vencer e ' + esc(S.nome.split(' ').pop()) + ' não pontuar.'
        : '<b>' + esc(L.nome) + '</b> ainda não fecha o título aqui. Para isso precisaria abrir mais de ' + (25 * depois) + ' pontos.') + '</li>' +
      vivos.slice(1, 4).map(function (p) {
        var d = L.pts - p.pts;
        return '<li><b>' + esc(p.nome) + '</b> precisa tirar em média ' + (Math.ceil(d / n * 10) / 10).toString().replace('.', ',') + ' pontos por corrida do líder.</li>';
      }).join('') + '<li>' + vivos.length + ' pilotos ainda têm chance matemática.</li></ul>';

    var numeros = pista ? '<ul class="pl-numeros"><li><b>' + pista.km.toFixed(3).replace('.', ',') + ' km</b><span>por volta</span></li>' +
      '<li><b>' + pista.voltas + '</b><span>voltas</span></li><li><b>' + Math.round(pista.km * pista.voltas) + ' km</b><span>de corrida</span></li></ul>' +
      (pista.venc ? '<p class="pl-sub-tab">' + esc(pista.vencTitulo || 'Vencedores dos últimos anos') + '</p><table class="tabela pl-mini"><thead><tr><th>Ano</th><th>Vencedor</th></tr></thead><tbody>' +
        pista.venc.map(function (v) { return '<tr><td>' + v[0] + '</td><td>' + esc(v[1]) + '</td></tr>'; }).join('') + '</tbody></table>' : '')
      : aviso('Os números desta pista entram em breve.');

    if (home) {
      caixa.innerHTML = cab + '<div class="pl-previa-grade">' +
        bloco('Horários no fuso de Brasília', horarios) +
        bloco('Previsão do tempo', '<div id="pv-tempo">' + (pista ? aviso('Buscando a previsão…') : aviso('Previsão indisponível para esta pista.')) + '</div>') +
        bloco('Números da pista', numeros) +
        bloco('Cenários de título', cenarios) +
        '</div>';
      if (pista) previsao(pista);
      return;
    }
    caixa.innerHTML = cab + '<div class="pl-previa-grade">' +
      bloco('Horários no fuso de Brasília', horarios) +
      bloco('O que está em jogo', jogo) +
      bloco('Previsão do tempo', '<div id="pv-tempo">' + (pista ? aviso('Buscando a previsão…') : aviso('Previsão indisponível para esta pista.')) + '</div>') +
      bloco('A pista', '<p>' + esc(pista ? pista.txt : 'Descrição da pista em breve.') + '</p>') +
      bloco('Raio-x do circuito', mapa(pista)) +
      bloco('Números da pista', numeros) +
      bloco('Cenários de título', cenarios) +
      '</div>';

    if (pista) previsao(pista);
  }

  /* mapa da pista desenhado a partir do traçado de circuitos.js */
  function mapa(pista) {
    var c = pista && pista.circuito && (window.CIRCUITOS || []).filter(function (x) { return x.nome === pista.circuito; })[0];
    if (!c) return aviso('Mapa desta pista em breve.');
    var nums = (c.d.match(/-?\d+(\.\d+)?/g) || []).map(Number), xs = [], ys = [];
    for (var i = 0; i + 1 < nums.length; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys), m = 8;
    var vb = (x0 - m) + ' ' + (y0 - m) + ' ' + (x1 - x0 + 2 * m) + ' ' + (y1 - y0 + 2 * m);
    return '<svg class="pv-mapa" viewBox="' + vb + '" role="img" aria-label="Traçado de ' + esc(c.nome) + '">' +
      '<path d="' + c.d + '" fill="none" stroke="#3a3f46" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="' + c.d + '" fill="none" stroke="#e4e7ea" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + xs[0] + '" cy="' + ys[0] + '" r="4.5" fill="#e3343c"/></svg>' +
      '<p class="pv-legenda"><i></i>Largada e chegada</p>';
  }

  /* previsão do tempo nos dias das sessões (Open-Meteo, grátis e sem chave; dá até 16 dias antes) */
  function previsao(pista) {
    var el = document.getElementById('pv-tempo');
    var dias = {}; (etapa.s || []).forEach(function (x) { dias[x.d] = (dias[x.d] || []).concat(x.t); });
    if (!Object.keys(dias).length && etapa.d) dias[etapa.d] = ['Corrida'];
    var lista = Object.keys(dias).sort(), ini = lista[0], fim = lista[lista.length - 1];
    if ((new Date(ini + 'T12:00:00') - new Date(hoje + 'T12:00:00')) / 864e5 > 15) { el.innerHTML = aviso('A previsão aparece a partir de 15 dias antes da corrida.'); return; }
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + pista.lat + '&longitude=' + pista.lon +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=' + ini + '&end_date=' + fim;
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var d = j.daily; if (!d || !d.time) throw 0;
      el.innerHTML = '<ul class="pv-tempo">' + d.time.map(function (dia, i) {
        if (!dias[dia]) return '';
        var chuva = d.precipitation_probability_max[i], ic = chuva >= 60 ? '🌧️' : chuva >= 30 ? '🌦️' : '☀️';
        return '<li><span class="pv-dia">' + dataBR(dia) + ' · ' + esc(dias[dia].join(', ')) + '</span><b>' + ic + ' ' + Math.round(d.temperature_2m_max[i]) + '° / ' + Math.round(d.temperature_2m_min[i]) + '°</b>' +
          '<span class="pv-chuva">Chance de chuva: ' + (chuva == null ? '—' : chuva + '%') + '</span></li>';
      }).join('') + '</ul><p class="pv-fonte">Previsão no horário local da pista. Fonte: Open-Meteo.</p>';
    }).catch(function () { el.innerHTML = aviso('Não foi possível buscar a previsão agora.'); });
  }

  if (home) montar();
  else window.TRAVA_MASTER(document.getElementById('pv-trava'), 'a Prévia da etapa', 'previa.html', montar);
})();
