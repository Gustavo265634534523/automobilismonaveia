/* Jogos do plano Master: Largada, Adivinhe o circuito e Piloto misterioso.
   Só abre para quem está logado com o plano Master. No computador (localhost, sem servidor PHP) abre em modo de teste. */
(function () {
  var esc = window.esc;
  var caixa = document.getElementById('jg-conteudo');
  var local = !!window.NAVEIA_TESTE;

  function guardar(chave, valor) { try { localStorage.setItem('naveia-jogo-' + chave, JSON.stringify(valor)); } catch (e) {} }
  function ler(chave, padrao) { try { var v = localStorage.getItem('naveia-jogo-' + chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function embaralhar(lista) { var a = lista.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function semAcento(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }

  /* ---------- Quem pode jogar ---------- */
  function bloquear(titulo, texto, botoes) {
    caixa.innerHTML = '<div class="jg-trava">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="jg-trava-acoes">' + botoes + '</div>' +
      '<ul class="jg-trava-lista"><li><b>Largada</b>As cinco luzes vermelhas apagam. Qual é o seu tempo de reação?</li>' +
      '<li><b>Adivinhe o circuito</b>Só o desenho da pista. Você reconhece?</li>' +
      '<li><b>Piloto misterioso</b>Dica por dica, descubra quem é. Menos dicas, mais pontos.</li>' +
      '<li><b>Chefe de Equipe</b>Escolha a cor do seu carro e comande a estratégia: ritmo, pit stop e pneus.</li></ul></div>';
  }
  window.NAVEIA_EU.then(function (r) {
    if (r.semServidor) {
      if (local) return liberar(true);
      if (!window.NAVEIA_PC) return bloquear('Jogos indisponíveis agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="jogos.html">Tentar de novo</a>');
      r = { logado: false };
    }
    if (!r.logado) return bloquear('Exclusivo do plano Master', 'Entre na sua conta para jogar. Se ainda não assina, conheça o Master.', '<a class="pl-botao" href="entrar.html?volta=jogos.html">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
    if (r.usuario.plano !== 'master') return bloquear('Exclusivo do plano Master', 'Seu plano atual não inclui os jogos. Mude para o Master e libere os três.', '<a class="pl-botao" href="planos.html">Conhecer o Master</a>');
    liberar(false);
  });

  /* ---------- Página dos jogos ---------- */
  var JOGOS = [
    ['largada', 'Largada', 'Reflexo'],
    ['circuito', 'Adivinhe o circuito', 'Traçados'],
    ['piloto', 'Piloto misterioso', 'Dicas'],
    ['chefe', 'Chefe de Equipe', 'Estratégia']
  ];
  function liberar(teste) {
    caixa.innerHTML = (teste ? '<p class="jg-teste">Modo de teste no seu computador. No site no ar, só assinantes Master veem esta página.</p>' : '') +
      '<div class="jg-abas" role="tablist" aria-label="Jogos">' + JOGOS.map(function (j, i) {
        return '<button type="button" role="tab" class="jg-aba" id="aba-' + j[0] + '" aria-controls="jogo-' + j[0] + '" aria-selected="' + (i === 0) + '"><small>' + j[2] + '</small>' + j[1] + '</button>';
      }).join('') + '</div>' +
      JOGOS.map(function (j, i) { return '<section class="jg-jogo" id="jogo-' + j[0] + '" role="tabpanel" aria-labelledby="aba-' + j[0] + '"' + (i ? ' hidden' : '') + '></section>'; }).join('');
    var abas = caixa.querySelectorAll('.jg-aba');
    function abrir(id) {
      [].forEach.call(abas, function (a) { var sim = a.id === 'aba-' + id; a.setAttribute('aria-selected', sim); document.getElementById(a.getAttribute('aria-controls')).hidden = !sim; });
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    }
    [].forEach.call(abas, function (a) { a.addEventListener('click', function () { abrir(a.id.slice(4)); }); });
    largada(document.getElementById('jogo-largada'));
    circuito(document.getElementById('jogo-circuito'));
    piloto(document.getElementById('jogo-piloto'));
    if (window.JOGO_CHEFE) window.JOGO_CHEFE(document.getElementById('jogo-chefe'));
    var h = location.hash.slice(1);
    if (document.getElementById('jogo-' + h)) abrir(h);
  }

  /* ---------- 1. Largada ---------- */
  function largada(el) {
    el.innerHTML = '<div class="jg-cab-jogo"><h2>Largada</h2><p>Toque na área escura quando as cinco luzes apagarem. Se tocar antes, queimou a largada.</p>' +
      '<button type="button" class="lg-som" id="lg-som" aria-pressed="true"></button></div>' +
      '<div class="lg-area" id="lg-area" tabindex="0" role="button" aria-label="Área da largada. Toque ou aperte espaço.">' +
        '<div class="lg-luzes">' + new Array(6).join('<div class="lg-poste"><i></i><i></i></div>') + '</div>' +
        '<p class="lg-tempo" id="lg-tempo">0,000</p><p class="lg-msg" id="lg-msg">Toque aqui para começar</p>' +
      '</div>' +
      '<div class="jg-placar"><div><span>Seu recorde</span><b id="lg-recorde">--</b></div><div><span>Média das últimas 5</span><b id="lg-media">--</b></div><div><span>Pilotos de F1</span><b>0,200 s</b></div></div>' +
      '<ol class="lg-hist" id="lg-hist" aria-label="Últimas tentativas"></ol>';
    var area = el.querySelector('#lg-area'), postes = el.querySelectorAll('.lg-poste'), tempo = el.querySelector('#lg-tempo'), msg = el.querySelector('#lg-msg');
    var estado = 'parado', timers = [], apagouEm = 0, hist = ler('largada-hist', []);
    function fmt(ms) { return (ms / 1000).toFixed(3).replace('.', ',') + ' s'; }

    /* Som: um bipe a cada luz que acende (sintetizado pelo navegador, sem arquivo) e um ronco grave na largada queimada */
    var somLigado = ler('largada-som', true), audio = null;
    var btnSom = el.querySelector('#lg-som');
    function desenharSom() {
      btnSom.setAttribute('aria-pressed', somLigado);
      btnSom.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>' +
        (somLigado ? '<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' : '<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>') +
        '</svg>' + (somLigado ? 'Som ligado' : 'Som desligado');
    }
    btnSom.addEventListener('click', function () { somLigado = !somLigado; guardar('largada-som', somLigado); desenharSom(); });
    desenharSom();
    function prepararAudio() {
      if (!somLigado) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state === 'suspended') audio.resume();
      } catch (e) { audio = null; }
    }
    function bipe(freq, dur, tipo, volume) {
      if (!somLigado || !audio) return;
      var t = audio.currentTime, osc = audio.createOscillator(), ganho = audio.createGain();
      osc.type = tipo || 'square'; osc.frequency.setValueAtTime(freq, t);
      ganho.gain.setValueAtTime(0.0001, t);
      ganho.gain.exponentialRampToValueAtTime(volume || 0.12, t + 0.01);
      ganho.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(ganho); ganho.connect(audio.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    }
    function placar() {
      var rec = ler('largada-recorde', 0);
      el.querySelector('#lg-recorde').textContent = rec ? fmt(rec) : '--';
      var val = hist.filter(function (h) { return h > 0; }).slice(0, 5);
      el.querySelector('#lg-media').textContent = val.length ? fmt(val.reduce(function (s, v) { return s + v; }, 0) / val.length) : '--';
      el.querySelector('#lg-hist').innerHTML = hist.slice(0, 8).map(function (h) { return '<li' + (h < 0 ? ' class="queimou"' : '') + '>' + (h < 0 ? 'Queimou' : fmt(h)) + '</li>'; }).join('');
    }
    function limpar() { timers.forEach(clearTimeout); timers = []; [].forEach.call(postes, function (p) { p.classList.remove('aceso'); }); }
    function veredito(ms) {
      if (ms < 100) return 'Reflexo impossível. Adivinhou a hora?';
      if (ms < 200) return 'Nível Fórmula 1. Largada de pole position!';
      if (ms < 250) return 'Muito rápido. Ganhou posições na largada.';
      if (ms < 320) return 'Boa largada. Manteve a posição.';
      if (ms < 450) return 'Largada lenta. Dois carros passaram.';
      return 'Ainda está no grid? O pelotão já foi embora.';
    }
    function comecar() {
      limpar(); estado = 'acendendo'; area.className = 'lg-area armado'; tempo.textContent = '0,000'; msg.textContent = 'Espere as luzes apagarem…';
      prepararAudio();
      [].forEach.call(postes, function (p, i) { timers.push(setTimeout(function () { p.classList.add('aceso'); bipe(880, 0.18); }, 900 * (i + 1))); });
      var espera = 900 * 5 + 250 + Math.random() * 2750;
      timers.push(setTimeout(function () {
        [].forEach.call(postes, function (p) { p.classList.remove('aceso'); });
        estado = 'valendo'; apagouEm = performance.now(); area.className = 'lg-area valendo'; msg.textContent = 'VAI!';
      }, espera));
    }
    function tocar(ev) {
      if (ev) ev.preventDefault();
      if (estado === 'parado' || estado === 'fim') return comecar();
      if (estado === 'acendendo') {
        limpar(); estado = 'fim'; area.className = 'lg-area queimou'; bipe(110, 0.45, 'sawtooth', 0.14);
        tempo.textContent = 'Queimou'; msg.textContent = 'Largada queimada: drive-through! Toque para tentar de novo.';
        hist.unshift(-1); hist = hist.slice(0, 20); guardar('largada-hist', hist); placar(); return;
      }
      if (estado === 'valendo') {
        var ms = performance.now() - apagouEm; estado = 'fim'; area.className = 'lg-area fim';
        tempo.textContent = fmt(ms).replace(' s', '');
        var rec = ler('largada-recorde', 0), novo = !rec || ms < rec;
        if (novo && ms >= 100) guardar('largada-recorde', Math.round(ms));
        msg.textContent = veredito(ms) + (novo && ms >= 100 ? ' Novo recorde!' : '') + ' Toque para tentar de novo.';
        hist.unshift(Math.round(ms)); hist = hist.slice(0, 20); guardar('largada-hist', hist); placar();
      }
    }
    area.addEventListener('pointerdown', tocar);
    area.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) tocar(e); } });
    placar();
  }

  /* ---------- 2. Adivinhe o circuito ---------- */
  function circuito(el) {
    var TODOS = window.CIRCUITOS || [];
    var RODADAS = 10;
    if (TODOS.length < 4) { el.innerHTML = '<p class="nota">Os traçados ainda não foram carregados.</p>'; return; }
    el.innerHTML = '<div class="jg-cab-jogo"><h2>Adivinhe o circuito</h2><p>Só o desenho da pista. Você reconhece? No modo difícil, o traçado aparece girado.</p></div>' +
      '<div class="ci-topo"><div class="ci-modo" role="group" aria-label="Dificuldade"><button type="button" class="ci-botao" data-modo="facil" aria-pressed="true">Normal</button><button type="button" class="ci-botao" data-modo="dificil" aria-pressed="false">Difícil</button></div>' +
      '<p class="ci-cont" id="ci-cont"></p></div>' +
      '<div class="ci-palco"><svg viewBox="0 0 400 300" id="ci-svg" role="img" aria-label="Traçado de um circuito"><path id="ci-sombra" class="ci-sombra"/><path id="ci-pista" class="ci-pista" pathLength="1"/></svg></div>' +
      '<div class="ci-opcoes" id="ci-opcoes"></div><p class="ci-res" id="ci-res" role="status"></p>' +
      '<div class="jg-placar"><div><span>Pontos</span><b id="ci-pontos">0</b></div><div><span>Recorde (normal)</span><b id="ci-rec-facil">--</b></div><div><span>Recorde (difícil)</span><b id="ci-rec-dificil">--</b></div></div>' +
      '<p class="jg-credito">Traçados: © colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>, licença ODbL.</p>';
    var modo = 'facil', fila, rodada, pontos, atual, travado;
    var svgPista = el.querySelector('#ci-pista'), svgSombra = el.querySelector('#ci-sombra'), opcoes = el.querySelector('#ci-opcoes'), res = el.querySelector('#ci-res');
    function recordes() {
      ['facil', 'dificil'].forEach(function (m) { var r = ler('circuito-rec-' + m, null); el.querySelector('#ci-rec-' + m).textContent = r === null ? '--' : r + '/' + RODADAS; });
    }
    function nova() { fila = embaralhar(TODOS).slice(0, Math.min(RODADAS, TODOS.length)); rodada = 0; pontos = 0; proxima(); }
    function proxima() {
      if (rodada >= fila.length) return fim();
      travado = false; atual = fila[rodada];
      el.querySelector('#ci-cont').textContent = 'Pista ' + (rodada + 1) + ' de ' + fila.length;
      el.querySelector('#ci-pontos').textContent = pontos;
      var giro = modo === 'dificil' ? sortear([90, 180, 270]) : 0;
      var g = 'rotate(' + giro + ' 200 150)' + (giro % 180 ? ' translate(50 -37.5) scale(.75)' : '');
      [svgPista, svgSombra].forEach(function (p) { p.setAttribute('d', atual.d); p.setAttribute('transform', g); });
      svgPista.classList.remove('desenhando'); void svgPista.getBBox(); svgPista.classList.add('desenhando');
      var erradas = embaralhar(TODOS.filter(function (c) { return c !== atual; })).slice(0, 3);
      opcoes.innerHTML = embaralhar(erradas.concat([atual])).map(function (c) {
        return '<button type="button" class="ci-op" data-nome="' + esc(c.nome) + '"><b>' + esc(c.nome) + '</b><small>' + esc(c.local) + '</small></button>';
      }).join('');
      res.textContent = '';
    }
    function fim() {
      var chave = 'circuito-rec-' + modo, rec = ler(chave, null), novo = rec === null || pontos > rec;
      if (novo) guardar(chave, pontos);
      recordes();
      opcoes.innerHTML = '<div class="jg-fim"><b>' + pontos + ' de ' + fila.length + '</b><span>' +
        (pontos === fila.length ? 'Gabaritou! Você conhece o calendário de cor.' : pontos >= 7 ? 'Olho de engenheiro de pista.' : pontos >= 4 ? 'Nada mal. Mais umas voltas de treino.' : 'Hora de assistir mais corridas.') +
        (novo ? ' Novo recorde!' : '') + '</span><button type="button" class="pl-botao" id="ci-denovo">Jogar de novo</button></div>';
      res.textContent = '';
      el.querySelector('#ci-denovo').addEventListener('click', nova);
    }
    opcoes.addEventListener('click', function (e) {
      var b = e.target.closest('.ci-op');
      if (!b || travado) return;
      travado = true;
      var certo = b.getAttribute('data-nome') === atual.nome;
      if (certo) pontos++;
      [].forEach.call(opcoes.children, function (x) { if (x.getAttribute('data-nome') === atual.nome) x.classList.add('certo'); else if (x === b) x.classList.add('errado'); });
      res.textContent = certo ? 'Isso! ' + atual.nome + ', ' + atual.local + '.' : 'Era ' + atual.nome + ', ' + atual.local + '.';
      el.querySelector('#ci-pontos').textContent = pontos;
      rodada++;
      setTimeout(proxima, 1600);
    });
    el.querySelector('.ci-modo').addEventListener('click', function (e) {
      var b = e.target.closest('[data-modo]'); if (!b) return;
      modo = b.getAttribute('data-modo');
      [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); });
      nova();
    });
    recordes(); nova();
  }

  /* ---------- 3. Piloto misterioso ---------- */
  var PILOTOS = [
    { n: 'Ayrton Senna', p: 'BR', e: 1980, d: ['Na estreia em Mônaco, em 1984, chegou em segundo com um carro da Toleman, numa corrida interrompida pela chuva.', 'Fez 65 pole positions na carreira.', 'Venceu seis vezes em Mônaco.'] },
    { n: 'Nelson Piquet', p: 'BR', e: 1980, d: ['Em 1983, foi o primeiro campeão da história com um carro de motor turbo.', 'Venceu o primeiro GP da Hungria, em 1986, com uma ultrapassagem por fora sobre Senna.', 'Foi campeão pela Brabham e pela Williams.'] },
    { n: 'Emerson Fittipaldi', p: 'BR', e: 1970, d: ['Venceu as 500 Milhas de Indianápolis em 1989 e em 1993.', 'Em 1972, virou o campeão mais jovem da história até então, com 25 anos.', 'Correu pela Copersucar, a equipe da própria família.'] },
    { n: 'Rubens Barrichello', p: 'BR', e: 2000, d: ['Em 2009, venceu duas corridas pela Brawn.', 'Foi por anos o recordista de largadas da Fórmula 1, com mais de 300 GPs.', 'A primeira vitória veio na Alemanha, em 2000, largando em 18º.'] },
    { n: 'Felipe Massa', p: 'BR', e: 2000, d: ['Venceu o GP da Turquia três anos seguidos, de 2006 a 2008.', 'Perdeu o título de 2008 por um ponto.', 'Em 2009, na Hungria, foi atingido no capacete por uma mola.'] },
    { n: 'Gabriel Bortoleto', p: 'BR', e: 2020, d: ['Foi agenciado pela empresa de Fernando Alonso.', 'Venceu a Fórmula 3 e a Fórmula 2 em anos seguidos, como Oscar Piastri.', 'Estreou na Fórmula 1 em 2025, pela Sauber.'] },
    { n: 'Carlos Pace', p: 'BR', e: 1970, d: ['Venceu uma única corrida na Fórmula 1, em casa, em 1975.', 'Morreu num acidente de avião em 1977.', 'Hoje dá nome a um autódromo famoso.'] },
    { n: 'Felipe Nasr', p: 'BR', e: 2010, d: ['Foi campeão do IMSA, o maior campeonato de endurance dos Estados Unidos.', 'Correu duas temporadas de Fórmula 1 pela Sauber.', 'Na estreia, na Austrália em 2015, terminou em quinto.'] },
    { n: 'Bruno Senna', p: 'BR', e: 2010, d: ['Estreou na Fórmula 1 em 2010, pela HRT.', 'Em 2012, correu pela Williams.', 'É sobrinho de um tricampeão mundial.'] },
    { n: 'Lucas di Grassi', p: 'BR', e: 2010, d: ['Correu na Fórmula 1 em 2010, pela Virgin.', 'Venceu a primeira corrida da história da Fórmula E, em Pequim, em 2014.', 'Foi campeão da Fórmula E na temporada 2016-17.'] },
    { n: 'Pietro Fittipaldi', p: 'BR', e: 2020, d: ['Correu dois GPs pela Haas em 2020, no lugar de Romain Grosjean.', 'Foi piloto reserva da Haas por várias temporadas.', 'É neto de um bicampeão mundial.'] },
    { n: 'Lewis Hamilton', p: 'GB', e: 2010, d: ['Foi campeão da GP2 em 2006.', 'É o piloto com mais pole positions da história.', 'Ganhou o primeiro título na última curva, em Interlagos, em 2008.'] },
    { n: 'Lando Norris', p: 'GB', e: 2020, d: ['A primeira pole veio na Rússia, em 2021.', 'Estreou em 2019 na mesma equipe que Carlos Sainz.', 'A primeira vitória foi em Miami, em 2024.'] },
    { n: 'George Russell', p: 'GB', e: 2020, d: ['Em 2020, substituiu Hamilton na Mercedes no GP de Sakhir.', 'Foi campeão da GP3 em 2017 e da Fórmula 2 em 2018.', 'A primeira vitória foi em Interlagos, em 2022.'] },
    { n: 'Nigel Mansell', p: 'GB', e: 1990, d: ['Foi campeão da Fórmula Indy em 1993, no ano de estreia.', 'Os torcedores da Ferrari o chamavam de O Leão.', 'Foi campeão da Fórmula 1 em 1992, pela Williams.'] },
    { n: 'Jenson Button', p: 'GB', e: 2000, d: ['Venceu no Canadá, em 2011, depois de cair para último, na corrida mais longa da história.', 'Foi companheiro de Hamilton na McLaren.', 'Foi campeão em 2009, pela Brawn.'] },
    { n: 'Damon Hill', p: 'GB', e: 1990, d: ['Foi o primeiro filho de campeão a também ser campeão da Fórmula 1.', 'Deu à Jordan a primeira vitória da equipe, em Spa, em 1998.', 'Foi campeão em 1996, pela Williams.'] },
    { n: 'Jackie Stewart', p: 'GB', e: 1970, d: ['Depois de parar, fundou a própria equipe de Fórmula 1.', 'Foi um dos maiores defensores da segurança nas pistas.', 'Foi campeão em 1969, 1971 e 1973.'] },
    { n: 'Jim Clark', p: 'GB', e: 1960, d: ['Venceu as 500 Milhas de Indianápolis em 1965.', 'Morreu numa corrida de Fórmula 2 em Hockenheim, em 1968.', 'Foi campeão em 1963 e 1965, pela Lotus.'] },
    { n: 'Graham Hill', p: 'GB', e: 1960, d: ['É o único piloto a vencer Mônaco, as 500 Milhas de Indianápolis e as 24 Horas de Le Mans.', 'Venceu cinco vezes em Mônaco.', 'Foi campeão em 1962 e 1968.'] },
    { n: 'Michael Schumacher', p: 'DE', e: 2000, d: ['Estreou em Spa, em 1991, no lugar de um piloto que estava preso.', 'Venceu 13 corridas em 2004.', 'Voltou à Fórmula 1 em 2010, pela Mercedes.'] },
    { n: 'Sebastian Vettel', p: 'DE', e: 2010, d: ['Marcou ponto na estreia, em 2007, pela BMW Sauber, e virou o mais jovem a pontuar até então.', 'A primeira vitória foi em Monza, com a Toro Rosso.', 'Foi tetracampeão pela Red Bull.'] },
    { n: 'Nico Rosberg', p: 'DE', e: 2010, d: ['É filho do campeão de 1982.', 'Correu pela Williams antes de ir para a Mercedes.', 'Foi campeão em 2016 e anunciou a aposentadoria cinco dias depois.'] },
    { n: 'Max Verstappen', p: 'NL', e: 2020, d: ['O pai foi companheiro de Schumacher na Benetton, em 1994.', 'Venceu 19 corridas numa só temporada, em 2023.', 'Venceu em 2016, aos 18 anos, na estreia pela Red Bull.'] },
    { n: 'Fernando Alonso', p: 'ES', e: 2000, d: ['Voltou à Fórmula 1 em 2021, depois de dois anos fora.', 'Venceu as 24 Horas de Le Mans e tentou as 500 Milhas de Indianápolis.', 'Em 2005, virou o campeão mais jovem da história até então.'] },
    { n: 'Carlos Sainz', p: 'ES', e: 2020, d: ['O pai é bicampeão mundial de rali.', 'Estreou na Toro Rosso ao lado de Max Verstappen.', 'A primeira vitória veio em Silverstone, em 2022.'] },
    { n: 'Charles Leclerc', p: 'MC', e: 2020, d: ['Foi campeão da GP3 em 2016 e da Fórmula 2 em 2017.', 'Estreou em 2018, pela Sauber.', 'Em 2019, venceu em Monza e acabou com o jejum da Ferrari em casa.'] },
    { n: 'Oscar Piastri', p: 'AU', e: 2020, d: ['Em 2022, a Alpine anunciou sua contratação, mas ele foi para a McLaren.', 'Foi campeão da Fórmula 3 e da Fórmula 2 nos anos de estreia.', 'A primeira vitória veio na Hungria, em 2024.'] },
    { n: 'Daniel Ricciardo', p: 'AU', e: 2010, d: ['Ficou famoso por beber champanhe no próprio sapato no pódio.', 'A primeira vitória foi no Canadá, em 2014.', 'Venceu Mônaco em 2018, pela Red Bull.'] },
    { n: 'Kimi Antonelli', p: 'IT', e: 2020, d: ['Venceu a Fórmula 4 italiana e a alemã no mesmo ano.', 'Pulou a Fórmula 3 e fez só um ano de Fórmula 2.', 'Estreou em 2025, no lugar de um heptacampeão.'] },
    { n: 'Mario Andretti', p: 'US', e: 1970, d: ['Venceu a Daytona 500 em 1967 e as 500 Milhas de Indianápolis em 1969.', 'Nasceu na Itália e cresceu nos Estados Unidos.', 'Foi campeão da Fórmula 1 em 1978, pela Lotus.'] },
    { n: 'Kimi Räikkönen', p: 'FI', e: 2000, d: ['Chegou à Fórmula 1 com apenas 23 corridas de carro no currículo.', 'Correu também no Mundial de Rali e na NASCAR.', 'Foi campeão em 2007 por um ponto.'] },
    { n: 'Mika Häkkinen', p: 'FI', e: 1990, d: ['Sofreu um acidente grave em Adelaide, em 1995.', 'Foi o grande rival de Schumacher no fim dos anos 1990.', 'Foi campeão em 1998 e 1999, pela McLaren.'] },
    { n: 'Valtteri Bottas', p: 'FI', e: 2010, d: ['Correu quatro temporadas pela Williams.', 'A primeira vitória veio na Rússia, em 2017.', 'Foi companheiro de Hamilton na Mercedes por cinco anos.'] },
    { n: 'Niki Lauda', p: 'AT', e: 1970, d: ['Ganhou o título de 1984 por meio ponto.', 'Fundou uma companhia aérea.', 'Voltou a correr seis semanas depois de um acidente com fogo em Nürburgring.'] },
    { n: 'Alain Prost', p: 'FR', e: 1980, d: ['Garantiu o título de 1986 na última corrida, na Austrália.', 'Tinha o apelido de O Professor.', 'Foi tetracampeão e grande rival de Senna.'] },
    { n: 'Pierre Gasly', p: 'FR', e: 2020, d: ['Foi rebaixado da Red Bull para a Toro Rosso em 2019.', 'Foi campeão da GP2, que virou Fórmula 2, em 2016.', 'Venceu em Monza, em 2020, pela AlphaTauri.'] },
    { n: 'Esteban Ocon', p: 'FR', e: 2020, d: ['Foi campeão da Fórmula 3 Europeia em 2014, à frente de Max Verstappen.', 'Correu pela Force India e pela Renault.', 'A primeira vitória veio na Hungria, em 2021, pela Alpine.'] },
    { n: 'Juan Manuel Fangio', p: 'AR', e: 1950, d: ['Foi campeão por Alfa Romeo, Mercedes, Ferrari e Maserati.', 'Ganhou o último título aos 46 anos.', 'Foi pentacampeão nos anos 1950.'] },
    { n: 'Franco Colapinto', p: 'AR', e: 2020, d: ['Estreou em Monza, em 2024, pela Williams.', 'Foi o primeiro piloto do seu país na Fórmula 1 desde 2001.', 'Em 2025, foi para a Alpine.'] },
    { n: 'Sergio Pérez', p: 'MX', e: 2020, d: ['A primeira vitória veio em Sakhir, em 2020, depois de cair para último na primeira volta.', 'Correu pela Sauber, McLaren, Force India e Racing Point.', 'Foi companheiro de Verstappen na Red Bull.'] },
    { n: 'Jacques Villeneuve', p: 'CA', e: 1990, d: ['Venceu as 500 Milhas de Indianápolis em 1995.', 'O pai dá nome ao circuito de Montreal.', 'Foi campeão da Fórmula 1 em 1997, pela Williams.'] },
    { n: 'Gilles Villeneuve', p: 'CA', e: 1970, d: ['Foi vice-campeão em 1979, pela Ferrari.', 'Morreu num treino em Zolder, em 1982.', 'Hoje dá nome ao circuito de Montreal.'] }
  ];
  function piloto(el) {
    var MAX_DICAS = 3;
    el.innerHTML = '<div class="jg-cab-jogo"><h2>Piloto misterioso</h2><p>Até três dicas e quatro opções. Acertou com uma dica, 3 pontos; com duas, 2 pontos; com três, 1 ponto. Resposta errada libera a próxima dica.</p></div>' +
      '<div class="pm-palco"><ol class="pm-dicas" id="pm-dicas"></ol>' +
      '<div class="pm-opcoes" id="pm-opcoes" role="group" aria-label="Quem é o piloto?"></div>' +
      '<div class="pm-acoes"><button type="button" class="pl-botao pl-botao-linha" id="pm-dica">Mais uma dica</button><button type="button" class="pl-botao" id="pm-prox" hidden>Próximo piloto</button></div>' +
      '<p class="ci-res" id="pm-res" role="status"></p></div>' +
      '<div class="jg-placar"><div><span>Pontos na sessão</span><b id="pm-pontos">0</b></div><div><span>Acertos seguidos</span><b id="pm-seq">0</b></div><div><span>Recorde de acertos seguidos</span><b id="pm-rec">0</b></div></div>';
    var dicasEl = el.querySelector('#pm-dicas'), opEl = el.querySelector('#pm-opcoes'), res = el.querySelector('#pm-res'),
      btnDica = el.querySelector('#pm-dica'), btnProx = el.querySelector('#pm-prox');
    var atual, dicas, mostradas, pontos = 0, seq = 0, recentes = [], acabou;
    function placar() {
      el.querySelector('#pm-pontos').textContent = pontos;
      el.querySelector('#pm-seq').textContent = seq;
      el.querySelector('#pm-rec').textContent = ler('piloto-rec', 0);
    }
    function desenharDicas() {
      dicasEl.innerHTML = dicas.map(function (t, i) {
        return '<li class="' + (i < mostradas ? 'vista' : '') + '"><span>' + (i + 1) + '</span>' + (i < mostradas ? esc(t) : 'Dica escondida') + '</li>';
      }).join('');
      btnDica.disabled = acabou || mostradas >= MAX_DICAS;
    }
    function nova() {
      var livres = PILOTOS.filter(function (p) { return recentes.indexOf(p.n) < 0; });
      atual = sortear(livres); recentes.push(atual.n); if (recentes.length > 8) recentes.shift();
      dicas = atual.d.slice(0, MAX_DICAS);
      mostradas = 1; acabou = false; res.textContent = '';
      /* opções erradas parecidas: mesmo país primeiro, depois mesma época, depois qualquer um */
      var resto = embaralhar(PILOTOS.filter(function (p) { return p !== atual; }));
      var peso = function (p) { return (p.p === atual.p ? 2 : 0) + (Math.abs(p.e - atual.e) <= 10 ? 1 : 0); };
      var erradas = resto.sort(function (a, b) { return peso(b) - peso(a); }).slice(0, 3);
      opEl.innerHTML = embaralhar(erradas.concat([atual])).map(function (p) {
        return '<button type="button" class="pm-op" data-nome="' + esc(p.n) + '">' + esc(p.n) + '</button>';
      }).join('');
      btnProx.hidden = true; btnDica.hidden = false;
      desenharDicas();
    }
    function terminar(acertou) {
      acabou = true;
      [].forEach.call(opEl.children, function (b) { b.disabled = true; if (b.getAttribute('data-nome') === atual.n) b.classList.add('certo'); });
      if (acertou) {
        var ganhou = MAX_DICAS + 1 - mostradas;
        pontos += ganhou; seq++;
        if (seq > ler('piloto-rec', 0)) guardar('piloto-rec', seq);
        res.textContent = 'Acertou! Era ' + atual.n + '. +' + ganhou + (ganhou === 1 ? ' ponto.' : ' pontos.');
      } else {
        seq = 0; res.textContent = 'Não foi dessa vez. Era ' + atual.n + '.';
      }
      btnDica.hidden = true; btnProx.hidden = false;
      desenharDicas(); placar();
    }
    opEl.addEventListener('click', function (e) {
      var b = e.target.closest('.pm-op'); if (!b || acabou || b.disabled) return;
      if (b.getAttribute('data-nome') === atual.n) { terminar(true); return; }
      b.disabled = true; b.classList.add('errado');
      if (mostradas >= MAX_DICAS) { terminar(false); return; }
      mostradas++; res.textContent = 'Não é ' + b.getAttribute('data-nome') + '. Mais uma dica liberada.'; desenharDicas();
    });
    btnDica.addEventListener('click', function () { if (!acabou && mostradas < MAX_DICAS) { mostradas++; desenharDicas(); } });
    btnProx.addEventListener('click', nova);
    placar(); nova();
  }
})();
