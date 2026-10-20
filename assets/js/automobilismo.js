/* Página da Fórmula 1 (automobilismo.html), no mesmo modelo das páginas de Futebol e Basquete (futebol.css):
   destaque com a próxima corrida e a contagem regressiva, pódio das últimas corridas, próximas corridas,
   classificação de pilotos e de construtores (e o resultado do último GP), notícias, mercado e atalhos.
   Dados: dados.js (CATEGORIAS: calendário, classificação, notícias), noticias-gerais.js, noticias-esportes.js (MERCADO)
   e onde-assistir-dados.js. */
(function () {
  var raiz = document.getElementById('ft');
  var F1 = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'formula-1'; })[0];
  if (!raiz || !F1) return;
  var esc = window.esc, hoje = window.hojeISO();
  var SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  function diaSemana(d) { return SEMANA[new Date(d + 'T12:00:00').getDay()]; }
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  var COR = {}; (window.NAVEIA_EQUIPES || []).forEach(function (e) { COR[e.n] = e.cor; });
  function equipe(n) { return '<i class="f1-cor" style="background:' + (COR[n] || '#8a8f94') + '" aria-hidden="true"></i>'; }
  function sessao(e, re) { return (e.s || []).filter(function (s) { return re.test(s.t); }).pop(); }
  var TV = window.ONDE_ASSISTIR && window.ONDE_ASSISTIR.cats['formula-1'] ? window.ONDE_ASSISTIR.cats['formula-1'].canais.map(function (c) { return c[0]; }).slice(0, 2).join(', ') : '';

  var cal = F1.calendario || [];
  var feitas = cal.filter(function (e) { return e.venc; });
  var proximas = cal.filter(function (e) { return !e.venc && e.d && e.d >= hoje; });

  /* 1. próxima corrida, com contagem regressiva até a largada */
  var px = proximas[0], caixa = document.getElementById('f1-proxima');
  if (px && caixa) {
    var corrida = sessao(px, /^Corrida/), quali = sessao(px, /^Classifica/);
    var alvo = corrida && corrida.h ? Date.parse(corrida.d + 'T' + corrida.h + ':00-03:00') : 0;
    caixa.innerHTML = '<div class="ft-grande f1-grande"><span class="ft-grande-rot">Próxima corrida · Etapa ' + esc(px.e) + '</span>' +
      '<span class="ft-grande-times"><b>' + esc(px.n) + '</b></span>' +
      '<span class="ft-grande-quando">' + esc(px.l) + ' · ' + (corrida ? diaSemana(corrida.d) + ', ' + window.dataCurta(corrida.d) + (corrida.h ? ' · largada ' + esc(corrida.h) : '') : window.dataCurta(px.d)) +
        (quali && quali.h ? ' · classificação ' + diaSemana(quali.d) + ', ' + esc(quali.h) : '') + '</span>' +
      (alvo ? '<span class="f1-conta" id="f1-conta"></span>' : '') + (TV ? '<span class="ft-grande-quando">' + esc(TV) + '</span>' : '') + '</div>' +
      '<a class="ft-btn" href="horarios.html">Todos os horários</a>';
    var conta = document.getElementById('f1-conta');
    var tick = function () {
      var ms = alvo - Date.now();
      if (ms <= 0) { conta.textContent = ms > -2 * 3600e3 ? 'Corrida em andamento' : 'Corrida encerrada'; return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      conta.innerHTML = '<b>' + d + '</b>d <b>' + h + '</b>h <b>' + m + '</b>min para a largada';
    };
    if (conta) { tick(); setInterval(tick, 30e3); }
  }

  /* 2. últimas corridas: o vencedor de cada GP, da mais recente para a mais antiga */
  var trilho = document.getElementById('ft-recentes');
  trilho.innerHTML = feitas.slice().reverse().slice(0, 12).map(function (e) {
    var v = String(e.venc).match(/^(.*?)\s*\((.*)\)$/) || [0, e.venc, ''];
    return '<a class="ft-res f1-res" href="formula-1.html#calendario"><span class="ft-res-topo"><span>Etapa ' + esc(e.e) + '</span><b>' + esc(e.l) + '</b><span>' + quando(e.d) + '</span></span>' +
      '<span class="f1-res-gp">' + esc(e.n) + '</span>' +
      '<span class="f1-res-venc"><span class="f1-trofeu" aria-hidden="true">1º</span><span><b>' + esc(v[1]) + '</b><small>' + (v[2] ? equipe(v[2]) + esc(v[2]) : '') + '</small></span></span></a>';
  }).join('');
  function rolar(d) { trilho.scrollBy({ left: d * trilho.clientWidth * .8, behavior: 'smooth' }); }
  document.getElementById('ft-rec-ant').addEventListener('click', function () { rolar(-1); });
  document.getElementById('ft-rec-prox').addEventListener('click', function () { rolar(1); });

  /* 3. próximas corridas (depois da que está no destaque) */
  document.getElementById('f1-agenda').innerHTML = proximas.slice(px ? 1 : 0, (px ? 1 : 0) + 6).map(function (e) {
    var corrida = sessao(e, /^Corrida/), quali = sessao(e, /^Classifica/), sprint = sessao(e, /^Sprint$/);
    return '<a class="ft-jogo f1-gp" href="formula-1.html#calendario"><span class="f1-gp-etapa">Etapa ' + esc(e.e) + '</span>' +
      '<b>' + esc(e.n) + '</b><small>' + esc(e.l) + (sprint ? ' · fim de semana com sprint' : '') + '</small>' +
      '<span class="ft-jogo-quando"><strong>' + (corrida ? diaSemana(corrida.d) + ', ' + window.dataCurta(corrida.d) : window.dataCurta(e.d)) + '</strong>' +
        (corrida && corrida.h ? 'Corrida às ' + esc(corrida.h) : 'Horário a confirmar') + (quali && quali.h ? ' · classificação ' + diaSemana(quali.d) + ' ' + esc(quali.h) : '') + '</span>' +
      (TV ? '<span class="ft-jogo-local">' + esc(TV) + '</span>' : '') + '<span class="ft-jogo-mais">Detalhes →</span></a>';
  }).join('') || '<p class="ft-vazio">O calendário da próxima temporada aparece aqui assim que sair.</p>';

  /* 4. classificação: pilotos, construtores (soma dos pontos dos pilotos de cada equipe) e o último GP */
  var T = [];
  var cl = F1.classificacao;
  if (cl && cl.linhas && cl.linhas.length) {
    var iP = cl.colunas.indexOf('Piloto'), iE = cl.colunas.indexOf('Equipe'), iPts = cl.colunas.indexOf('Pts');
    T.push({ nome: 'Pilotos', colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'], linhas: cl.linhas.map(function (l) { return [l[0], l[iP], l[iE], l[iPts]]; }), eq: 2 });
    var soma = {};
    cl.linhas.forEach(function (l) { soma[l[iE]] = (soma[l[iE]] || 0) + (+l[iPts] || 0); });
    T.push({ nome: 'Construtores', colunas: ['Pos', 'Equipe', 'Pts'], linhas: Object.keys(soma).sort(function (a, b) { return soma[b] - soma[a]; }).map(function (n, i) { return [String(i + 1), n, String(soma[n])]; }), eq: 1,
      nota: 'Soma dos pontos dos pilotos de cada equipe na classificação acima.' });
  }
  if (F1.destaque && F1.destaque.linhas) T.push({ nome: 'Último GP', titulo: F1.destaque.titulo, colunas: F1.destaque.colunas, linhas: F1.destaque.linhas, eq: F1.destaque.colunas.indexOf('Equipe') });
  var abasT = document.getElementById('ft-tab-abas'), caixaT = document.getElementById('ft-tabela');
  function tabela(t) {
    var ver = t.linhas.length > 10;
    return '<div class="ft-tab-wrap"><table class="ft-tab"><caption>' + esc(t.titulo || (t.nome === 'Pilotos' ? 'Campeonato de pilotos' : 'Campeonato de construtores')) + (t.nota ? '. ' + esc(t.nota) : '') + '</caption><thead><tr>' +
      t.colunas.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.linhas.slice(0, 10).map(function (l) { return '<tr>' + l.map(function (v, i) { return '<td' + (i === 1 ? ' class="ft-tab-time"' : '') + '>' + (i === t.eq ? equipe(v) : '') + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div><p class="ft-centro"><a class="ft-btn" href="formula-1.html#classificacao">' + (ver ? 'Tabela completa' : 'Ver tudo da F1') + '</a></p>';
  }
  function abrir(i) { [].forEach.call(abasT.children, function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); }); caixaT.innerHTML = tabela(T[i]); }
  abasT.innerHTML = T.map(function (t, i) { return '<button type="button" role="tab" data-i="' + i + '">' + esc(t.nome) + '</button>'; }).join('');
  [].forEach.call(abasT.children, function (b) { b.addEventListener('click', function () { abrir(+b.getAttribute('data-i')); }); });
  if (T.length) abrir(0);

  /* 5. notícias: as gerais da F1 e as da página da categoria, sem repetir; 6 de cada vez */
  var vistos = {}, NOTS = [];
  (window.NOTICIAS_GERAIS || []).concat(F1.noticias || []).forEach(function (n) {
    if ((n.cat && n.cat !== 'formula-1') || vistos[n.t]) return; vistos[n.t] = 1; NOTS.push(n);
  });
  NOTS.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
  var mostrar = 6, caixaN = document.getElementById('ft-noticias'), mais = document.getElementById('ft-not-mais');
  function pintarN() {
    caixaN.innerHTML = NOTS.slice(0, mostrar).map(function (n) {
      return '<a class="ft-not" href="' + (window.linkNoticia ? window.linkNoticia(n.t) : 'formula-1.html') + '"><span class="ft-not-tag">Fórmula 1</span>' +
        '<b>' + esc(n.t) + '</b><span>' + esc(String(n.x).split(/(?<=\.)\s/)[0]) + '</span><small>' + quando(n.d) + '</small></a>';
    }).join('');
    mais.hidden = NOTS.length <= mostrar;
  }
  mais.addEventListener('click', function () { mostrar += 6; pintarN(); });
  pintarN();

  /* 6. mercado: as 3 novidades mais recentes */
  var STATUS = { confirmado: ['Confirmado', 'ok'], saida: ['Saída', 'sai'], especulacao: ['Rumor', 'rumor'] };
  document.getElementById('mk-grade').innerHTML = (window.MERCADO || []).filter(function (m) { return m.esporte === 'automobilismo'; })
    .sort(function (a, b) { return a.d < b.d ? 1 : -1; }).slice(0, 3).map(function (m) {
      var s = STATUS[m.status] || ['', ''];
      return '<div class="mk-card mk-' + s[1] + '"><div class="mk-topo"><span class="mk-st">' + s[0] + '</span><small>' + window.dataCurta(m.d) + '</small></div>' +
        '<b class="mk-nome">' + esc(m.nome) + '</b><div class="mk-rota"><span>' + esc(m.de) + '</span><i aria-hidden="true">→</i><span>' + esc(m.para) + '</span></div>' +
        '<small class="mk-quando">' + esc(m.quando || '') + '</small>' + (m.nota ? '<p>' + esc(m.nota) + '</p>' : '') +
        (m.link ? '<a class="mk-link" href="' + esc(m.link) + '">Ler a notícia →</a>' : '') + '</div>';
    }).join('');

  /* 7. atalhos */
  document.getElementById('ft-camps').innerHTML = [
    ['formula-1.html', 'Temporada 2026', 'Calendário, pilotos e equipes'],
    ['raiox.html', 'Pós-corrida', 'Raio-x e telemetria'],
    ['simulador.html', 'Campeonato', 'Simulador do título'],
    ['guia-formula-1.html', 'Para iniciantes', 'Como funciona a F1'],
    ['jogos.html', 'Diversão', 'Jogos da F1']
  ].map(function (a) { return '<a class="ft-camp" href="' + a[0] + '"><small>' + a[1] + '</small><b>' + a[2] + '</b></a>'; }).join('');
})();
