/* Telemetria completa da F1 (plano Master): escolhe a sessão, dois pilotos e uma volta de cada.
   Tudo vem direto do OpenF1 no navegador; o cálculo e o desenho ficam em telemetria-graf.js. */
(function () {
  var esc = window.esc, T = window.TELEMETRIA;
  var caixa = document.getElementById('tl'), form = document.getElementById('tl-escolha'), status = document.getElementById('tl-status');
  var local = !!window.NAVEIA_TESTE;
  var NOMES = { 'Race': 'Corrida', 'Qualifying': 'Classificação', 'Sprint': 'Sprint', 'Sprint Qualifying': 'Classificação sprint', 'Sprint Shootout': 'Classificação sprint', 'Practice 1': 'Treino livre 1', 'Practice 2': 'Treino livre 2', 'Practice 3': 'Treino livre 3' };
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* Os dados vêm pelo servidor do site (?acao=f1), que guarda as respostas da OpenF1: chega rápido e sem o erro 429
     (a OpenF1 grátis aceita poucos pedidos por segundo). Um pedido por vez; se o servidor falhar, pede direto à OpenF1. */
  var fila = Promise.resolve();
  function get(q) {
    var p = fila.then(function () { return buscar(q, 0); });
    fila = p.catch(function () {});
    return p;
  }
  function buscar(q, tent) {
    var direto = tent >= 2 || !window.NAVEIA_SERVIDOR;
    var url = direto ? 'https://api.openf1.org/v1/' + q : window.NAVEIA_SERVIDOR + '?acao=f1&q=' + encodeURIComponent(q);
    return fetch(url).then(function (r) {
      if ((r.status === 429 || r.status >= 500) && tent < 4) return espera(1000 * (tent + 1)).then(function () { return buscar(q, tent + 1); });
      return r.json();
    }).then(function (j) {
      if (Array.isArray(j)) return j;
      if (tent < 4) return espera(1000 * (tent + 1)).then(function () { return buscar(q, tent + 1); });
      throw new Error('sem dados');
    }, function (er) {
      if (tent < 4) return espera(1000 * (tent + 1)).then(function () { return buscar(q, tent + 1); });
      throw er;
    });
  }

  var sessoes = [], pilotos = [], voltas = {};
  var selS = form.querySelector('[name=sessao]'), selA = form.querySelector('[name=a]'), selB = form.querySelector('[name=b]'),
    selVA = form.querySelector('[name=va]'), selVB = form.querySelector('[name=vb]'), botao = form.querySelector('button');

  function nomeGP(s) {
    var f1 = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'formula-1'; })[0], d = s.date_start.slice(0, 10);
    if (f1) {
      var lim = new Date(Date.parse(d + 'T12:00:00Z') + 4 * 864e5).toISOString().slice(0, 10);
      var e = f1.calendario.filter(function (x) { return x.d && x.d >= d && x.d <= lim; })[0];
      if (e) return e.n;
    }
    return 'GP ' + s.country_name;
  }
  function opcoesVoltas(sel, num) {
    var vs = voltas[num] || [], melhor = vs.slice().sort(function (a, b) { return a.lap_duration - b.lap_duration; })[0];
    sel.innerHTML = vs.length ? vs.map(function (v) {
      return '<option value="' + v.lap_number + '"' + (v === melhor ? ' selected' : '') + '>Volta ' + v.lap_number + ' · ' + T.fmtTempo(v.lap_duration) + (v === melhor ? ' (mais rápida)' : '') + '</option>';
    }).join('') : '<option value="">Sem voltas válidas</option>';
  }
  function carregarSessao() {
    var s = sessoes[selS.value]; if (!s) return;
    T.video(document.getElementById('tl-video'), s.session_key);
    botao.disabled = true; status.textContent = 'Carregando pilotos e voltas…';
    Promise.all([get('drivers?session_key=' + s.session_key), get('laps?session_key=' + s.session_key), get('session_result?session_key=' + s.session_key).catch(function () { return []; })]).then(function (r) {
      var pos = {}; r[2].forEach(function (x) { pos[x.driver_number] = x.position || 99; });
      voltas = {};
      r[1].forEach(function (l) { if (l.lap_duration && l.date_start && !l.is_pit_out_lap) (voltas[l.driver_number] = voltas[l.driver_number] || []).push(l); });
      pilotos = r[0].filter(function (p) { return voltas[p.driver_number]; }).sort(function (a, b) { return (pos[a.driver_number] || 99) - (pos[b.driver_number] || 99); });
      var op = pilotos.map(function (p) { return '<option value="' + p.driver_number + '">' + esc(p.full_name ? p.first_name + ' ' + p.last_name.charAt(0) + p.last_name.slice(1).toLowerCase() : '#' + p.driver_number) + (pos[p.driver_number] && pos[p.driver_number] < 99 ? ' (P' + pos[p.driver_number] + ')' : '') + '</option>'; }).join('');
      selA.innerHTML = op; selB.innerHTML = op;
      if (pilotos[1]) selB.value = pilotos[1].driver_number;
      opcoesVoltas(selVA, +selA.value); opcoesVoltas(selVB, +selB.value);
      status.textContent = pilotos.length ? '' : 'Esta sessão ainda não tem dados de voltas.';
      botao.disabled = pilotos.length < 2;
      if (pilotos.length >= 2) comparar();
    }).catch(function () { status.textContent = 'O OpenF1 não respondeu agora. Tente de novo em alguns segundos.'; botao.disabled = false; });
  }
  function dadosVolta(s, num, lapN) {
    var v = (voltas[num] || []).filter(function (x) { return x.lap_number === lapN; })[0];
    if (!v) return Promise.reject(new Error('volta'));
    var ini = Date.parse(v.date_start), de = new Date(ini - 1000).toISOString(), ate = new Date(ini + v.lap_duration * 1000 + 1000).toISOString();
    var q = '&driver_number=' + num + '&date>=' + de + '&date<' + ate;
    return get('car_data?session_key=' + s.session_key + q).then(function (car) {
      return get('location?session_key=' + s.session_key + q).catch(function () { return []; }).then(function (loc) { return T.volta(car, loc, ini, v.lap_duration); });
    });
  }
  function sigla(num) { var p = pilotos.filter(function (x) { return x.driver_number === num; })[0]; return p ? (p.name_acronym || p.last_name) : '#' + num; }
  function comparar() {
    var s = sessoes[selS.value], a = +selA.value, b = +selB.value;
    if (!s || !a || !b) return;
    botao.disabled = true; status.textContent = 'Buscando a telemetria das duas voltas…';
    dadosVolta(s, a, +selVA.value).then(function (VA) {
      return dadosVolta(s, b, +selVB.value).then(function (VB) {
        if (!VA || !VB) throw new Error('incompleto');
        var r = T.comparar(VA, VB);
        var na = sigla(a), nb = sigla(b);
        if (a === b) { na += ' v' + selVA.value; nb += ' v' + selVB.value; }
        T.desenhar(caixa, r, { nomes: [na, nb] });
        status.textContent = '';
      });
    }).catch(function () {
      caixa.innerHTML = '';
      status.textContent = 'Não deu para montar essa comparação: faltam dados de telemetria dessa volta no OpenF1. Escolha outra volta.';
    }).then(function () { botao.disabled = false; });
  }

  function comecar() {
    form.hidden = false; status.textContent = 'Carregando as sessões da temporada…';
    get('sessions?year=' + new Date().getFullYear()).then(function (ss) {
      sessoes = ss.filter(function (s) { return Date.parse(s.date_end) < Date.now() && NOMES[s.session_name]; }).reverse();
      selS.innerHTML = sessoes.map(function (s, i) {
        return '<option value="' + i + '">' + esc(nomeGP(s)) + ' · ' + NOMES[s.session_name] + '</option>';
      }).join('');
      /* começa pela última classificação (a normal ou a da sprint, a que for mais recente) */
      var q = 0; sessoes.some(function (s, i) { if (/^(Qualifying|Sprint Qualifying|Sprint Shootout)$/.test(s.session_name)) { q = i; return true; } });
      selS.value = q;
      carregarSessao();
    }).catch(function () { status.textContent = 'O OpenF1 não respondeu agora. Recarregue a página em alguns segundos.'; });
    selS.addEventListener('change', carregarSessao);
    selA.addEventListener('change', function () { opcoesVoltas(selVA, +selA.value); });
    selB.addEventListener('change', function () { opcoesVoltas(selVB, +selB.value); });
    form.addEventListener('submit', function (ev) { ev.preventDefault(); comparar(); });
  }

  /* Dentro do Raio-x F1 (raiox.html, aba Telemetria): a trava do Master é a da página inteira,
     e a telemetria só começa a buscar dados quando a aba é aberta pela primeira vez. */
  if (document.getElementById('rx')) {
    var comecou = false;
    window.TL_ABRIR = function () { if (!comecou) { comecou = true; comecar(); } };
    return;
  }

  /* Só para o plano Master */
  function trava(titulo, texto, botoes) {
    caixa.innerHTML = '<div class="sm-trava"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="sm-trava-acoes">' + botoes + '</div></div>';
  }
  form.hidden = true;
  caixa.innerHTML = '<p class="nota">Carregando…</p>';
  window.NAVEIA_LIVRE.then(function (r) {
    if (r.semServidor && !local && window.NAVEIA_PC) r = { logado: false };
    if (r.semServidor) {
      if (!local) return trava('Telemetria indisponível agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="telemetria.html">Tentar de novo</a>');
    } else if (!r.logado) {
      return trava('Exclusivo do plano Master', 'Entre na sua conta para usar a telemetria. Se ainda não assina, conheça o Master.', '<a class="pl-botao" href="entrar.html?volta=telemetria.html">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
    } else if (r.usuario.plano !== 'master') {
      return trava('Exclusivo do plano Master', 'Seu plano atual não inclui a telemetria. Mude para o Master e compare quem você quiser, volta a volta.', '<a class="pl-botao" href="planos.html">Conhecer o Master</a>');
    }
    caixa.innerHTML = '';
    comecar();
  });
})();
