/* Bolão (bolao.html): palpites de futebol (placar), NBA (vencedor e diferença) e Fórmula 1 (pole e pódio).
   Os jogos abertos, os resultados e o ranking vêm do robô .github/bolao.js (assets/dados/bolao.json); as regras dos
   pontos, de assets/js/bolao-regras.js.
   Os palpites ficam guardados neste aparelho e, para quem tem conta, também no servidor do bolão (servidor/bolao),
   que é o que vale para o ranking. Sem o servidor no ar, o bolão funciona só no aparelho. */
(function () {
  var caixa = document.getElementById('bl');
  if (!caixa) return;
  var esc = window.esc, R = window.BOLAO_REGRAS;
  var SERVIDOR_PADRAO = 'https://arena-bolao.naveia-contas.workers.dev/';
  var CHAVE_LOCAL = 'arena-bolao';
  var B = { jogos: [], resultados: {}, ranking: null }, servidor = '', online = false, logado = false, nome = '';
  var meus = {}; /* chave -> [valor, hora] */
  try { meus = JSON.parse(localStorage.getItem(CHAVE_LOCAL) || '{}') || {}; } catch (e) { meus = {}; }
  function guardar() { try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(meus)); } catch (e) {} }

  var ABAS = [['futebol', 'Futebol'], ['basquete', 'NBA'], ['f1', 'Fórmula 1'], ['pontos', 'Meus pontos'], ['ranking', 'Ranking']];
  var aba = (location.hash || '').slice(1);
  if (!ABAS.some(function (a) { return a[0] === aba; })) aba = 'futebol';
  var filtroComp = '', grupoRanking = 'geral';

  function fechado(j) { return Date.now() >= Date.parse(j.fecha); }
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  var SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function dia(d) { return quando(d) + ', ' + SEMANA[new Date(d + 'T12:00:00').getDay()]; }
  function horaFecha(iso) { var d = new Date(iso); return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }); }

  /* resultados: os do robô e, mais frescos, os do placar automático */
  function resultados() {
    var r = {}; Object.keys(B.resultados || {}).forEach(function (k) { r[k] = B.resultados[k][0]; });
    var av = (window.AO_VIVO || {}).comps || {};
    Object.keys(av).forEach(function (s) {
      var t = /^basketball/.test(av[s].liga) ? 'b' : 'f';
      (av[s].jogos || []).forEach(function (j) { if (j.id && j.p && !j.vivo) r[t + ':' + j.id] = j.p; });
    });
    return r;
  }

  /* ---------- servidor ---------- */
  function sessao() { try { return localStorage.getItem('naveia-sessao'); } catch (e) { return null; } }
  function pedir(acao, dados) {
    var op = { headers: { Authorization: 'Bearer ' + sessao() } };
    if (dados) { op.method = 'POST'; op.headers['Content-Type'] = 'application/json'; op.body = JSON.stringify(dados); }
    return fetch(servidor + '?acao=' + acao, op).then(function (r) { return r.json(); });
  }
  function enviar(chave) {
    if (!online || !logado || !meus[chave]) return Promise.resolve();
    return pedir('palpite', { chave: chave, v: meus[chave][0] }).then(function (r) { if (r && r.ok) { meus[chave][1] = r.t; meus[chave][2] = 1; guardar(); } }).catch(function () {});
  }
  function sincronizar() {
    return pedir('meus').then(function (r) {
      if (!r || !r.ok) return;
      nome = r.nome || '';
      var jogo = {}; B.jogos.forEach(function (j) { jogo[j.chave] = j; });
      Object.keys(r.palpites || {}).forEach(function (k) { meus[k] = [r.palpites[k][0], r.palpites[k][1], 1]; });
      /* palpites feitos neste aparelho antes de entrar: sobem enquanto o jogo está aberto */
      var sobe = Object.keys(meus).filter(function (k) { return !meus[k][2] && jogo[k] && !fechado(jogo[k]); });
      guardar();
      return Promise.all(sobe.map(enviar));
    }).catch(function () {});
  }

  /* ---------- palpitar ---------- */
  function salvar(chave, v) {
    var j = B.jogos.filter(function (x) { return x.chave === chave; })[0];
    if (!j || fechado(j)) return;
    if (v === '' || v == null) delete meus[chave]; else meus[chave] = [v, new Date().toISOString(), 0];
    guardar();
    var marca = caixa.querySelector('[data-chave="' + chave + '"] .bl-salvo');
    if (marca) marca.textContent = v ? (online && logado ? 'Salvando…' : 'Salvo neste aparelho') : '';
    enviar(chave).then(function () { if (marca && v && meus[chave] && meus[chave][2]) marca.textContent = 'Palpite salvo'; });
  }
  function selo(chave, j) {
    if (fechado(j)) return '<span class="bl-salvo bl-fechado">Fechado</span>';
    var m = meus[chave];
    return '<span class="bl-salvo">' + (m ? (m[2] ? 'Palpite salvo' : online && logado ? 'Enviando…' : 'Salvo neste aparelho') : '') + '</span>';
  }

  function regras(tipo) {
    return '<details class="bl-regras"><summary>Como funciona a pontuação</summary><ul>' + R.PONTOS[tipo].map(function (p) { return '<li><b>' + p[1] + ' pontos</b> ' + esc(p[0]) + '</li>'; }).join('') + '</ul>' +
      '<p>O palpite fecha quando o ' + (tipo === 'f1' ? 'treino de classificação começa' : 'jogo começa') + '. Até lá dá para mudar quantas vezes quiser.</p></details>';
  }
  function futebol() {
    var J = B.jogos.filter(function (j) { return j.chave.charAt(0) === 'f'; });
    if (!J.length) return '<p class="pt-vazio">Os jogos dos próximos dias aparecem aqui assim que forem confirmados.</p>';
    var comps = []; J.forEach(function (j) { if (comps.indexOf(j.nome) < 0) comps.push(j.nome); });
    var lista = J.filter(function (j) { return !filtroComp || j.nome === filtroComp; });
    var porDia = {}, dias = [];
    lista.forEach(function (j) { if (!porDia[j.d]) { porDia[j.d] = []; dias.push(j.d); } porDia[j.d].push(j); });
    return regras('futebol') + '<div class="bl-filtro" role="group" aria-label="Campeonato"><button type="button" data-comp="" aria-pressed="' + !filtroComp + '">Todos</button>' +
      comps.map(function (c) { return '<button type="button" data-comp="' + esc(c) + '" aria-pressed="' + (filtroComp === c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' +
      dias.map(function (d) {
        return '<h3 class="bl-dia">' + dia(d) + '</h3><div class="bl-grade">' + porDia[d].map(function (j) {
          var p = R.placar(meus[j.chave] && meus[j.chave][0]) || ['', ''], f = fechado(j);
          return '<div class="bl-jogo" data-chave="' + j.chave + '"><div class="bl-topo"><span>' + esc(j.nome) + (j.fase ? ' · ' + esc(j.fase) : '') + '</span><span>' + esc(j.h) + '</span></div>' +
            '<div class="bl-placar"><span class="bl-time">' + window.escudoTime(j.casa) + '<b>' + esc(j.casa) + '</b></span>' +
            '<input type="number" inputmode="numeric" min="0" max="20" aria-label="Gols do ' + esc(j.casa) + '" value="' + p[0] + '"' + (f ? ' disabled' : '') + '>' +
            '<i>x</i><input type="number" inputmode="numeric" min="0" max="20" aria-label="Gols do ' + esc(j.fora) + '" value="' + p[1] + '"' + (f ? ' disabled' : '') + '>' +
            '<span class="bl-time bl-fora"><b>' + esc(j.fora) + '</b>' + window.escudoTime(j.fora) + '</span></div>' + selo(j.chave, j) + '</div>';
        }).join('') + '</div>';
      }).join('');
  }
  function basquete() {
    var J = B.jogos.filter(function (j) { return j.chave.charAt(0) === 'b'; });
    if (!J.length) return regras('nba') + '<p class="pt-vazio">Os jogos da NBA dos próximos dias aparecem aqui assim que forem confirmados.</p>';
    var porDia = {}, dias = [];
    J.forEach(function (j) { if (!porDia[j.d]) { porDia[j.d] = []; dias.push(j.d); } porDia[j.d].push(j); });
    return regras('nba') + dias.map(function (d) {
      return '<h3 class="bl-dia">' + dia(d) + '</h3><div class="bl-grade">' + porDia[d].map(function (j) {
        var v = String((meus[j.chave] || [])[0] || '').split('|'), f = fechado(j);
        function bt(lado, time) { return '<button type="button" class="bl-escolha" data-lado="' + lado + '" aria-pressed="' + (v[0] === lado) + '"' + (f ? ' disabled' : '') + '>' + window.escudoTime(time) + '<b>' + esc(time) + '</b></button>'; }
        return '<div class="bl-jogo bl-nba" data-chave="' + j.chave + '"><div class="bl-topo"><span>NBA' + (j.fase ? ' · ' + esc(j.fase) : '') + '</span><span>' + esc(j.h) + '</span></div>' +
          '<p class="bl-perg">Quem vence?</p><div class="bl-duas">' + bt('fora', j.fora) + bt('casa', j.casa) + '</div>' +
          '<p class="bl-perg">Por quantos pontos?</p><div class="bl-faixas">' + R.FAIXAS.map(function (x) { return '<button type="button" class="bl-faixa" data-faixa="' + x + '" aria-pressed="' + (v[1] === x) + '"' + (f || !v[0] ? ' disabled' : '') + '>' + x + '</button>'; }).join('') + '</div>' +
          selo(j.chave, j) + '</div>';
      }).join('') + '</div>';
    }).join('');
  }
  function f1() {
    var J = B.jogos.filter(function (j) { return j.chave.charAt(0) === '1'; });
    if (!J.length) return regras('f1') + '<p class="pt-vazio">A próxima corrida aparece aqui quando o calendário for confirmado.</p>';
    var ROT = ['Pole position', 'Vencedor', '2º lugar', '3º lugar'];
    return regras('f1') + '<div class="bl-f1-grade">' + J.map(function (j) {
      var v = String((meus[j.chave] || [])[0] || '|||').split('|'), f = fechado(j);
      return '<div class="bl-jogo bl-f1" data-chave="' + j.chave + '"><div class="bl-topo"><span>Etapa ' + esc(j.etapa) + ' · ' + esc(j.local) + '</span><span>' + window.dataCurta(j.d) + '</span></div>' +
        '<h3>' + esc(j.gp) + '</h3><p class="bl-perg">Fecha ' + horaFecha(j.fecha) + ' (horário de Brasília)</p>' +
        ROT.map(function (r, i) {
          return '<label class="bl-f1-l"><span>' + r + '</span><select data-i="' + i + '"' + (f ? ' disabled' : '') + '><option value="">Escolha o piloto</option>' +
            (j.pilotos || []).map(function (p) { return '<option' + (v[i] === p ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('') + '</select></label>';
        }).join('') + selo(j.chave, j) + '</div>';
    }).join('') + '</div>';
  }
  function descrever(k, v) {
    if (k.charAt(0) === 'f') return v.replace('x', ' x ');
    if (k.charAt(0) === 'b') { var p = v.split('|'); return (p[0] === 'casa' ? 'mandante' : 'visitante') + (p[1] ? ' por ' + p[1] : ''); }
    var q = v.split('|'); return 'Pole ' + (q[0] || '–') + ' · pódio ' + [q[1], q[2], q[3]].map(function (x) { return x || '–'; }).join(', ');
  }
  function pontos() {
    var res = resultados(), info = {};
    Object.keys(B.resultados || {}).forEach(function (k) { info[k] = B.resultados[k]; });
    B.jogos.forEach(function (j) { info[j.chave] = info[j.chave] || [null, j.fecha, j.casa || j.gp, j.fora || '']; });
    var feitos = Object.keys(meus).filter(function (k) { return res[k]; }), total = 0, cheios = 0;
    var linhas = feitos.map(function (k) {
      var pts = R.pontos(k, meus[k][0], res[k]) || 0, i = info[k] || [];
      total += pts;
      if ((k.charAt(0) === 'f' && pts === 10) || (k.charAt(0) === 'b' && pts === 8) || (k.charAt(0) === '1' && pts >= 15)) cheios++;
      return { k: k, pts: pts, t: i[1] || '', html: '<li class="' + (pts ? 'bl-ganhou' : '') + '"><span><b>' + esc(i[2] || '') + (i[3] ? ' x ' + esc(i[3]) : '') + '</b><small>Seu palpite: ' + esc(descrever(k, meus[k][0])) + ' · Resultado: ' + esc(k.charAt(0) === '1' ? descrever(k, res[k]).replace('Pole', 'pole') : res[k]) + '</small></span><em>' + pts + ' pts</em></li>' };
    }).sort(function (a, b) { return a.t < b.t ? 1 : -1; });
    var abertos = Object.keys(meus).filter(function (k) { return !res[k]; }).length;
    return '<div class="bl-resumo"><div><b>' + total + '</b><span>pontos</span></div><div><b>' + feitos.length + '</b><span>palpites com resultado</span></div><div><b>' + cheios + '</b><span>acertos em cheio</span></div><div><b>' + abertos + '</b><span>esperando o jogo</span></div></div>' +
      (linhas.length ? '<ul class="bl-hist">' + linhas.map(function (l) { return l.html; }).join('') + '</ul>' : '<p class="pt-vazio">Seus pontos aparecem aqui quando os jogos que você palpitou terminarem.</p>');
  }
  function ranking() {
    var RK = B.ranking;
    var G = [['geral', 'Geral'], ['futebol', 'Futebol'], ['nba', 'NBA'], ['f1', 'Fórmula 1']];
    if (!online && !(RK && RK.participantes)) return '<p class="pt-vazio">O ranking com todo mundo abre em breve. Enquanto isso, seus palpites ficam guardados neste aparelho e você acompanha seus pontos em <b>Meus pontos</b>.</p>';
    var L = (RK && RK[grupoRanking]) || [];
    return '<div class="dq-abas bl-rk-abas" role="tablist">' + G.map(function (g) { return '<button type="button" role="tab" data-g="' + g[0] + '" aria-selected="' + (grupoRanking === g[0]) + '">' + g[1] + '</button>'; }).join('') + '</div>' +
      (L.length ? '<div class="ft-tab-wrap"><table class="ft-tab bl-rk"><thead><tr><th>#</th><th>Nome</th><th>Pontos</th><th title="Palpites com resultado">Palpites</th><th title="Acertos em cheio">Na mosca</th></tr></thead><tbody>' +
        L.map(function (l, i) { return '<tr' + (nome && l[0] === nome ? ' class="bl-eu"' : '') + '><td>' + (i + 1) + '</td><td class="td-jogador">' + esc(l[0]) + '</td><td><b>' + l[1] + '</b></td><td>' + l[2] + '</td><td>' + l[3] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<p class="dq-nota">' + (RK.participantes || 0) + ' participantes. O ranking é atualizado a cada 10 minutos.</p>'
        : '<p class="pt-vazio">Ninguém pontuou ainda. O ranking aparece quando os primeiros jogos palpitados terminarem.</p>');
  }

  function aviso() {
    if (online && logado) return '<div class="bl-aviso bl-ok"><b>Palpitando como ' + esc(nome || 'você') + '.</b> Seus palpites valem para o ranking.</div>';
    if (online) return '<div class="bl-aviso"><span><b>Entre na sua conta para entrar no ranking.</b> Sem conta, os palpites ficam só neste aparelho.</span><a class="ft-btn" href="entrar.html?volta=bolao.html">Entrar</a></div>';
    return '<div class="bl-aviso"><span>Seus palpites ficam guardados <b>neste aparelho</b> e os pontos aparecem em Meus pontos. O ranking com todo mundo abre em breve.</span></div>';
  }
  function pintar() {
    var corpo = aba === 'futebol' ? futebol() : aba === 'basquete' ? basquete() : aba === 'f1' ? f1() : aba === 'pontos' ? pontos() : ranking();
    caixa.innerHTML = aviso() + '<div class="ft-abas bl-abas" role="tablist">' + ABAS.map(function (a) { return '<button type="button" role="tab" data-aba="' + a[0] + '" aria-selected="' + (aba === a[0]) + '">' + a[1] + '</button>'; }).join('') + '</div>' +
      '<div class="bl-corpo">' + corpo + '</div>';
    document.body.setAttribute('data-esporte', aba === 'basquete' ? 'basquete' : 'futebol');
    ligar();
  }
  function ligar() {
    [].forEach.call(caixa.querySelectorAll('.bl-abas button'), function (b) { b.addEventListener('click', function () { aba = b.getAttribute('data-aba'); history.replaceState(null, '', '#' + aba); pintar(); }); });
    [].forEach.call(caixa.querySelectorAll('.bl-filtro button'), function (b) { b.addEventListener('click', function () { filtroComp = b.getAttribute('data-comp'); pintar(); }); });
    [].forEach.call(caixa.querySelectorAll('.bl-rk-abas button'), function (b) { b.addEventListener('click', function () { grupoRanking = b.getAttribute('data-g'); pintar(); }); });
    /* futebol: os dois números; só salva com os dois preenchidos */
    [].forEach.call(caixa.querySelectorAll('.bl-jogo:not(.bl-nba):not(.bl-f1)'), function (el) {
      var ins = el.querySelectorAll('input');
      [].forEach.call(ins, function (inp) {
        inp.addEventListener('input', function () {
          var a = ins[0].value, b = ins[1].value;
          if (a === '' && b === '') return salvar(el.getAttribute('data-chave'), '');
          if (a === '' || b === '') return;
          salvar(el.getAttribute('data-chave'), Math.min(20, Math.max(0, parseInt(a, 10) || 0)) + 'x' + Math.min(20, Math.max(0, parseInt(b, 10) || 0)));
        });
      });
    });
    /* NBA: quem vence e a faixa da diferença */
    [].forEach.call(caixa.querySelectorAll('.bl-nba'), function (el) {
      var k = el.getAttribute('data-chave');
      function atual() { return String((meus[k] || [])[0] || '').split('|'); }
      [].forEach.call(el.querySelectorAll('.bl-escolha'), function (b) {
        b.addEventListener('click', function () { var v = atual(); salvar(k, b.getAttribute('data-lado') + (v[1] ? '|' + v[1] : '')); pintar(); });
      });
      [].forEach.call(el.querySelectorAll('.bl-faixa'), function (b) {
        b.addEventListener('click', function () { var v = atual(); if (!v[0]) return; salvar(k, v[0] + (v[1] === b.getAttribute('data-faixa') ? '' : '|' + b.getAttribute('data-faixa'))); pintar(); });
      });
    });
    /* F1: pole e pódio (o mesmo piloto não pode estar em dois lugares do pódio) */
    [].forEach.call(caixa.querySelectorAll('.bl-f1'), function (el) {
      var k = el.getAttribute('data-chave'), sels = el.querySelectorAll('select');
      [].forEach.call(sels, function (s) {
        s.addEventListener('change', function () {
          var v = [].map.call(sels, function (x) { return x.value; });
          var i = +s.getAttribute('data-i');
          if (i > 0 && s.value) for (var q = 1; q <= 3; q++) if (q !== i && v[q] === s.value) { v[q] = ''; sels[q].value = ''; }
          salvar(k, v.some(Boolean) ? v.join('|') : '');
        });
      });
    });
  }

  /* começa: dados do bolão, servidor e conta */
  fetch('assets/dados/bolao.json?t=' + Math.floor(Date.now() / 3e5)).then(function (r) { return r.json(); }).catch(function () { return null; }).then(function (d) {
    if (d) B = d;
    servidor = B.servidor || SERVIDOR_PADRAO;
    pintar();
    var ctl = window.AbortController ? new AbortController() : null;
    if (ctl) setTimeout(function () { ctl.abort(); }, 5000);
    return fetch(servidor + '?acao=status', ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.json(); }).then(function (r) { online = !!(r && r.ok); }).catch(function () { online = false; });
  }).then(function () {
    if (!online) return pintar();
    return (window.NAVEIA_EU || Promise.resolve({})).then(function (r) {
      logado = !!(r && r.logado);
      if (logado && r.usuario && r.usuario.nome) { var p = r.usuario.nome.trim().split(/\s+/); nome = p.length > 1 ? p[0] + ' ' + p[p.length - 1].charAt(0) + '.' : p[0]; }
      return logado ? sincronizar() : null;
    }).then(pintar);
  });
  /* o palpite fecha na hora do jogo: repinta a cada minuto para travar o que começou */
  setInterval(function () { if (!document.hidden && /futebol|basquete|f1/.test(aba) && !caixa.contains(document.activeElement)) pintar(); }, 60e3);
})();
