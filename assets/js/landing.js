/* Entrada do site (index.html): Futebol, Basquete e Fórmula 1, um de cada vez. Troca sozinho a cada 7 segundos
   (para quando a pessoa mexe), pelas abas, pelas setas, arrastando, pela roda do mouse e pelo teclado.
   O nome do esporte entra letra por letra em 3D; o fundo e o objeto se mexem um pouco com o mouse.
   Clicar no objeto ou em Entrar abre o esporte. */
(function () {
  var ESP = ['futebol', 'basquete', 'automobilismo'];
  var CORES = { futebol: '#22a35a', basquete: '#f07a2a', automobilismo: '#e3343c' };
  var NOMES = { futebol: 'Futebol', basquete: 'Basquete', automobilismo: 'Fórmula 1' };
  var LINKS = { futebol: 'futebol.html', basquete: 'basquete.html', automobilismo: 'automobilismo.html' };
  var TEMPO = 7000;
  var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body, raiz = document.documentElement;
  var titulo = document.getElementById('ld-titulo'), cta = document.getElementById('ld-cta'), cena = document.getElementById('ld-cena');
  var bgs = [].slice.call(document.querySelectorAll('.ld-bg'));
  var objs = [].slice.call(document.querySelectorAll('.ld-obj'));
  var abas = [].slice.call(document.querySelectorAll('.ld-abas button'));
  var links = [].slice.call(document.querySelectorAll('.ld-nav a[data-esp]'));
  var atual = 0, saindo = false, auto = null, parado = false;

  /* se a imagem já vier recortada (fundo transparente), usa ela sem a máscara redonda */
  [].forEach.call(document.querySelectorAll('.ld-obj img'), function (img) {
    var alt = img.getAttribute('src').replace(/\.webp$/, '-recorte.webp'), t = new Image();
    t.onload = function () { img.src = alt; img.classList.add('recortado'); }; t.src = alt;
  });

  /* vídeo de fundo (assets/video/entrada/<esporte>.mp4, curto, sem som, em repetição): só os que existem estão aqui.
     Com vídeo, o objeto do esporte (bola, capacete) sai da frente. Quem pediu menos movimento fica com a foto. */
  var VIDEOS = { futebol: { d: 'assets/video/entrada/futebol.mp4?v=1', m: 'assets/video/entrada/futebol-m.mp4?v=1' }, basquete: { d: 'assets/video/entrada/basquete.mp4?v=1', m: 'assets/video/entrada/basquete-m.mp4?v=1' },
    automobilismo: { d: 'assets/video/entrada/automobilismo.mp4?v=4', m: 'assets/video/entrada/automobilismo-m.mp4?v=4' } };
  /* versão em pé (celular) só quando a tela está mesmo em pé; confere de novo se a janela mudar de tamanho
     (a página pode abrir numa moldura que ainda nem tem o tamanho final) */
  function emPe() { return innerWidth > 0 && innerHeight > 0 && innerWidth / innerHeight < 0.85; }
  function fonte(esp) { return emPe() ? VIDEOS[esp].m : VIDEOS[esp].d; }
  var trocaT = null;
  window.addEventListener('resize', function () {
    clearTimeout(trocaT);
    trocaT = setTimeout(function () {
      bgs.forEach(function (b) {
        var v = b.querySelector('video'), esp = b.getAttribute('data-esp'); if (!v || !VIDEOS[esp]) return;
        var certo = fonte(esp); if (v.getAttribute('src') === certo) return;
        v.src = certo; if (b.classList.contains('ativo')) v.play().catch(function () {});
      });
    }, 250);
  });
  function video(esp) {
    var b = bgs.filter(function (x) { return x.getAttribute('data-esp') === esp; })[0];
    if (!b || calmo || !VIDEOS[esp] || b.querySelector('video')) return;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.addEventListener('loadeddata', function () { b.classList.add('tem-video'); body.classList.toggle('ld-video', b.classList.contains('ativo')); });
    v.src = fonte(esp); b.appendChild(v);
  }
  function letras(nome) {
    titulo.style.setProperty('--letras', nome.length);
    titulo.innerHTML = nome.split('').map(function (c, i) {
      return c === ' ' ? '<span class="ld-esp"></span>' : '<span class="ld-l" style="--i:' + i + '" data-l="' + c + '">' + c + '</span>';
    }).join('');
  }
  /* frases da entrada, como manchetes de jornal: motivação e curiosidades de cada esporte. Trocam a cada 3,5 s */
  var FRASES = {
    futebol: [
      ['Você sabia?', 'O Brasil é o único país que jogou todas as edições da Copa do Mundo.'],
      ['Motivação', 'Quem treina no frio da manhã comemora no calor da arquibancada.'],
      ['Você sabia?', 'Pentacampeão: 1958, 1962, 1970, 1994 e 2002.'],
      ['Motivação', 'O gol mais bonito é sempre o próximo.'],
      ['Você sabia?', 'Uma partida tem 90 minutos, mas a bola rola de verdade por menos de 60.'],
      ['Motivação', 'Camisa pesa. Quem aguenta o peso, levanta a taça.'],
      ['Você sabia?', 'A final de 1950 levou mais de 170 mil pessoas ao Maracanã.'],
      ['Motivação', 'Time que joga junto não tem jogo perdido antes do apito final.']
    ],
    basquete: [
      ['Você sabia?', 'O basquete nasceu em 1891, com cestos de pêssego pregados na parede.'],
      ['Motivação', 'Cada arremesso errado é um treino para o que vai entrar.'],
      ['Você sabia?', 'O aro fica a 3,05 metros do chão. Sempre foi assim.'],
      ['Motivação', 'Quem não para de pular um dia alcança o aro.'],
      ['Você sabia?', 'O relógio de 24 segundos de posse chegou à NBA em 1954.'],
      ['Motivação', 'Jogo decidido no último segundo é de quem não desistiu no primeiro.'],
      ['Você sabia?', 'A linha de três pontos estreou na NBA na temporada 1979/80.'],
      ['Motivação', 'Defesa ganha jogo. Coração ganha campeonato.']
    ],
    automobilismo: [
      ['Você sabia?', 'Um pit stop de Fórmula 1 pode durar menos de 2 segundos.'],
      ['Motivação', 'Na reta todo mundo é rápido. Campeão se faz na curva.'],
      ['Você sabia?', 'A primeira corrida do Mundial de Fórmula 1 foi em Silverstone, em 1950.'],
      ['Motivação', 'Largar atrás não é desculpa: é ponto de partida.'],
      ['Você sabia?', 'O Brasil tem três campeões mundiais: Emerson Fittipaldi, Nelson Piquet e Ayrton Senna.'],
      ['Motivação', 'Cada décimo de segundo é conquistado, nunca dado.'],
      ['Você sabia?', 'Numa freada forte, o piloto sente mais de cinco vezes o próprio peso.'],
      ['Motivação', 'A bandeirada só chega para quem continua acelerando.']
    ]
  };
  var frase = document.getElementById('ld-frase'), fraseI = {}, fraseT = null;
  function mostrarFrase(esp) {
    if (!frase) return;
    var L = FRASES[esp]; fraseI[esp] = fraseI[esp] === undefined ? Math.floor(Math.random() * L.length) : (fraseI[esp] + 1) % L.length;
    var f = L[fraseI[esp]];
    frase.classList.add('sai');
    setTimeout(function () {
      frase.innerHTML = '<small>' + f[0] + '</small><span>' + f[1] + '</span>';
      frase.classList.remove('sai');
    }, calmo || !frase.textContent ? 0 : 350);
    clearTimeout(fraseT); fraseT = setTimeout(function () { mostrarFrase(ESP[atual]); }, 3500);
  }

  /* ---------- capa de jornal de antigamente: a história de cada esporte, texto corrido e misturado cobrindo a tela
     (só o nome do esporte fica livre). [manchete, texto]; com texto vazio é uma frase motivadora. A ordem muda a cada vez. */
  var HISTORIA = {
    futebol: [
      ['Mais de dois mil anos de bola nos pés', 'Muito antes das regras, os chineses já chutavam bola no cuju, jogo que a própria FIFA reconhece como a forma mais antiga do futebol.'],
      ['Londres escreve as regras', 'Numa taverna de Londres, em outubro de 1863, nasceu a Football Association. Ali o futebol ganhou suas primeiras regras e se separou de vez do rúgbi: com a bola, só os pés.'],
      ['O clube mais antigo do mundo', 'O Sheffield FC, fundado em 1857 na Inglaterra, é considerado o clube de futebol mais antigo ainda em atividade.'],
      ['Wanderers, o primeiro campeão', 'A Copa da Inglaterra começou em 1871 e é o torneio mais antigo do planeta. O primeiro campeão foi o Wanderers, que bateu o Royal Engineers por 1 a 0.'],
      ['Escócia e Inglaterra abrem a história', 'Em 30 de novembro de 1872, em Glasgow, escoceses e ingleses fizeram o primeiro jogo entre seleções. Ninguém marcou: 0 a 0.'],
      ['Nasce o pênalti', 'O pênalti foi criado em 1891, ideia do irlandês William McCrum, para punir quem derrubasse o adversário perto do gol.'],
      ['Duas bolas na mala', 'Charles Miller voltou dos estudos na Inglaterra em 1894 trazendo duas bolas e um livro de regras. Foi assim que o futebol chegou ao Brasil.'],
      ['O primeiro jogo no Brasil', 'Em abril de 1895, na várzea do Carmo, em São Paulo, funcionários da São Paulo Railway venceram os da Companhia de Gás por 4 a 2, com Charles Miller em campo.'],
      ['São Paulo Athletic, o pioneiro', 'O primeiro campeonato de futebol do país foi o Paulista de 1902. O campeão foi o São Paulo Athletic Club, o time de Charles Miller.'],
      ['Sete países criam a FIFA', 'Em maio de 1904, em Paris, sete federações europeias fundaram a FIFA para organizar o futebol entre as nações.'],
      ['Uruguai, o primeiro campeão do mundo', 'A primeira Copa foi em 1930, no Uruguai, com treze seleções. Na final, no Estádio Centenário, os donos da casa venceram a Argentina por 4 a 2.'],
      ['O gol número um', 'O francês Lucien Laurent fez o primeiro gol da história das Copas, contra o México, em 13 de julho de 1930.'],
      ['O silêncio do Maracanã', 'Em 1950, mais de 170 mil pessoas viram o Uruguai virar para 2 a 1 sobre o Brasil e ficar com a taça. O jogo ficou conhecido como Maracanazo.'],
      ['Um menino de 17 anos', 'Na Suécia, em 1958, o Brasil venceu os donos da casa por 5 a 2 e ganhou sua primeira Copa. Pelé, com 17 anos, marcou dois gols na final.'],
      ['Bahia, campeão do Brasil', 'A Taça Brasil de 1959, reconhecida como o primeiro Campeonato Brasileiro, terminou com o Bahia campeão em cima do Santos de Pelé.'],
      ['Peñarol abre a Libertadores', 'A primeira Libertadores da América foi disputada em 1960, e o uruguaio Peñarol foi o primeiro campeão.'],
      ['Amarelo e vermelho', 'Os cartões só apareceram na Copa de 1970, no México, a mesma em que o Brasil ganhou o tricampeonato e ficou com a Taça Jules Rimet para sempre.'],
      ['Ninguém lembra do placar do intervalo.', ''],
      ['O gol mais bonito é sempre o próximo.', ''],
      ['Camisa pesa. Quem aguenta o peso, levanta a taça.', ''],
      ['Time que joga junto não tem jogo perdido antes do apito final.', '']
    ],
    basquete: [
      ['Um professor e um inverno', 'Em dezembro de 1891, em Springfield, nos Estados Unidos, o professor canadense James Naismith inventou um jogo para os alunos não ficarem parados no frio.'],
      ['Cestos de pêssego', 'As primeiras cestas eram cestos de pêssego pregados na varanda do ginásio. A cada ponto, alguém subia para tirar a bola lá de dentro.'],
      ['Um a zero', 'O primeiro jogo teve nove de cada lado e terminou 1 a 0. A única cesta da partida foi de William Chase.'],
      ['Treze regras', 'O regulamento original tinha 13 regras. Correr com a bola não era permitido: ela só podia ser passada ou arremessada.'],
      ['Elas também jogam', 'Já em 1892 o basquete chegou às mulheres, no Smith College, pelas mãos da professora Senda Berenson, que adaptou as regras.'],
      ['A tabela contra a torcida', 'A tabela atrás do aro surgiu para impedir que torcedores, das galerias, desviassem os arremessos com a mão.'],
      ['Mackenzie, 1896', 'O professor americano Augusto Shaw trouxe o basquete para o Mackenzie, em São Paulo. Foi a chegada do esporte ao Brasil.'],
      ['Final na lama', 'A estreia olímpica foi em Berlim, em 1936. A final foi ao ar livre, numa quadra de terra encharcada, e os Estados Unidos venceram o Canadá por 19 a 8. Naismith estava lá para ver.'],
      ['Knicks 68, Huskies 66', 'O primeiro jogo da liga que viraria a NBA foi em Toronto, em 1º de novembro de 1946.'],
      ['Warriors, os primeiros campeões', 'O Philadelphia Warriors venceu a primeira temporada da liga, em 1947. Dois anos depois, ela passou a se chamar NBA.'],
      ['Vinte e quatro segundos', 'Em 1954 a NBA criou o relógio de posse. Acabou a era dos times que seguravam a bola e o jogo ficou muito mais rápido.'],
      ['Brasil bicampeão do mundo', 'A seleção masculina ganhou o Mundial no Chile, em 1959, e de novo em casa, no Rio, em 1963.'],
      ['Cem pontos numa noite', 'Em 2 de março de 1962, Wilt Chamberlain fez 100 pontos num único jogo, contra o New York Knicks. O recorde segue de pé.'],
      ['Onze anéis', 'Bill Russell ganhou 11 títulos da NBA com o Boston Celtics, mais do que qualquer outro jogador.'],
      ['A primeira de três', 'A linha de três pontos estreou na NBA em 1979. Chris Ford, do Celtics, fez a primeira cesta de três.'],
      ['Indianápolis, 1987', 'Na final do Pan-Americano, o Brasil de Oscar Schmidt venceu os Estados Unidos por 120 a 115, dentro da casa deles.'],
      ['Hortência e Paula', 'Em 1994, na Austrália, a seleção feminina foi campeã mundial, com Hortência e Paula comandando o time.'],
      ['Cada arremesso errado é um treino para o que vai entrar.', ''],
      ['Quem não para de pular um dia alcança o aro.', ''],
      ['Defesa ganha jogo. Coração ganha campeonato.', '']
    ],
    automobilismo: [
      ['Silverstone, 13 de maio de 1950', 'A primeira corrida do Mundial de Fórmula 1 foi o GP da Grã-Bretanha, com o rei George VI nas arquibancadas. Venceu Giuseppe Farina, da Alfa Romeo.'],
      ['Farina, o primeiro campeão', 'O italiano Nino Farina foi o primeiro campeão mundial de Fórmula 1, em 1950, pilotando uma Alfa Romeo.'],
      ['Mônaco desde o começo', 'As ruas de Monte Carlo já estavam no primeiro campeonato, em 1950. Quem venceu foi Juan Manuel Fangio.'],
      ['Indianápolis valia pontos', 'Entre 1950 e 1960, as 500 Milhas de Indianápolis faziam parte do Mundial de Fórmula 1, mesmo quase sem pilotos europeus.'],
      ['Oito pontos para o vencedor', 'No primeiro campeonato, a vitória valia 8 pontos. O segundo levava 6, o terceiro 4, e a volta mais rápida dava mais 1.'],
      ['Ascari bicampeão', 'Alberto Ascari ganhou os títulos de 1952 e 1953 com a Ferrari, os primeiros da equipe italiana.'],
      ['O mestre Fangio', 'O argentino Juan Manuel Fangio ganhou cinco títulos nos anos 1950. O recorde durou quase meio século, até Michael Schumacher.'],
      ['Chico Landi abre o caminho', 'O primeiro brasileiro na Fórmula 1 foi Chico Landi, no GP da Itália de 1951, em Monza.'],
      ['Vanwall, a primeira campeã', 'O Mundial de Construtores começou em 1958, e a primeira equipe campeã foi a britânica Vanwall.'],
      ['O motor foi para trás', 'Em 1959, Jack Brabham foi campeão com a Cooper e seu motor atrás do piloto. Em pouco tempo, todos os carros copiaram a ideia.'],
      ['Campeão com o próprio carro', 'Jack Brabham ganhou o título de 1966 num carro da sua própria equipe, feito que ninguém mais repetiu.'],
      ['Jim Clark e a Lotus', 'O escocês Jim Clark foi campeão em 1963 e 1965 pela Lotus, ganhando corridas com vantagens enormes.'],
      ['Sempre a Ferrari', 'A Ferrari é a única equipe que disputou todas as temporadas do Mundial desde a primeira, em 1950.'],
      ['Watkins Glen, 1970', 'Na sua quarta corrida na Fórmula 1, Emerson Fittipaldi venceu o GP dos Estados Unidos. Foi a primeira vitória de um brasileiro.'],
      ['Emerson, campeão do mundo', 'Em 1972, pela Lotus, Emerson Fittipaldi se tornou o primeiro brasileiro campeão e, na época, o mais jovem da história, com 25 anos. Em 1974, pela McLaren, foi bi.'],
      ['Interlagos entra no mapa', 'O GP do Brasil passou a valer pelo Mundial em 1973. E quem venceu a primeira corrida foi Emerson Fittipaldi.'],
      ['O carro de segurança', 'O safety car apareceu pela primeira vez no GP do Canadá de 1973.'],
      ['A volta de Lauda', 'Em 1976, Niki Lauda sofreu um acidente gravíssimo em Nürburgring. Seis semanas depois, ainda com as queimaduras, estava de volta ao carro.'],
      ['Piquet, três vezes', 'Nelson Piquet foi campeão em 1981 e 1983 pela Brabham e em 1987 pela Williams.'],
      ['Estoril, debaixo de chuva', 'A primeira vitória de Ayrton Senna foi no GP de Portugal de 1985, com a Lotus, numa corrida de chuva forte.'],
      ['Senna tricampeão', 'Pela McLaren, Ayrton Senna foi campeão em 1988, 1990 e 1991, e venceu 41 Grandes Prêmios.'],
      ['Na reta todo mundo é rápido. Campeão se faz na curva.', ''],
      ['Largar atrás não é desculpa: é ponto de partida.', ''],
      ['A bandeirada só chega para quem continua acelerando.', ''],
      ['Cada décimo de segundo é conquistado, nunca dado.', '']
    ]
  };
  function escH(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ESPACOS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  var ESTILOS = ['ld-m1', 'ld-m2', 'ld-m3', 'ld-m4', 'ld-m2', 'ld-m3'];
  function colunas(esp) {
    var M = document.getElementById('ld-mural'); if (!M) return;
    /* embaralha: cada vez a capa sai diferente */
    var H = HISTORIA[esp].slice();
    for (var i = H.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = H[i]; H[i] = H[j]; H[j] = t; }
    var caixas = ESPACOS.map(function () { return []; });
    H.forEach(function (h, i) {
      var html = !h[1] ? '<blockquote class="ld-cita">' + escH(h[0]) + '</blockquote>'
        : '<article class="ld-fato ' + ESTILOS[(i * 7 + h[0].length) % ESTILOS.length] + (i % 4 === 0 ? ' ld-capitular' : '') + '"><h3>' + escH(h[0]) + '</h3><p>' + escH(h[1]) + '</p></article>';
      caixas[i % ESPACOS.length].push(html + (i % 3 === 2 ? '<hr class="ld-fio">' : ''));
    });
    M.classList.add('sai');
    setTimeout(function () {
      M.innerHTML = caixas.map(function (c, i) { return '<div class="ld-mural-' + ESPACOS[i] + '">' + c.join('') + '</div>'; }).join('');
      M.classList.remove('sai');
    }, calmo ? 0 : 300);
  }
  function pintar(primeira) {
    var esp = ESP[atual];
    raiz.style.setProperty('--cor', CORES[esp]);
    bgs.forEach(function (b) { b.classList.toggle('ativo', b.getAttribute('data-esp') === esp); var v = b.querySelector('video'); if (v) { if (b.classList.contains('ativo')) { v.currentTime = 0; v.play().catch(function () {}); } else v.pause(); } });
    video(esp); body.classList.toggle('ld-video', !!bgs.filter(function (b) { return b.classList.contains('ativo') && b.classList.contains('tem-video'); }).length);
    objs.forEach(function (o) { var a = o.getAttribute('data-esp') === esp; o.classList.toggle('ativo', a); o.setAttribute('tabindex', a ? '0' : '-1'); o.setAttribute('aria-hidden', a ? 'false' : 'true'); });
    abas.forEach(function (b, i) { b.setAttribute('aria-selected', i === atual ? 'true' : 'false'); });
    links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-esp') === esp); });
    cta.href = LINKS[esp];
    cta.textContent = esp === 'automobilismo' ? 'Entrar na Fórmula 1' : 'Entrar no ' + NOMES[esp].toLowerCase();
    mostrarFrase(esp); colunas(esp);
    /* letras: as antigas saem, as novas entram */
    var velhas = titulo.querySelectorAll('.ld-l');
    if (primeira || calmo || !velhas.length) letras(NOMES[esp]);
    else {
      [].forEach.call(velhas, function (l) { l.classList.add('sai'); });
      clearTimeout(pintar.t); pintar.t = setTimeout(function () { letras(NOMES[ESP[atual]]); }, 380);
    }
  }
  function ir(i) {
    i = ((i % ESP.length) + ESP.length) % ESP.length;
    if (i === atual) return;
    atual = i; pintar(); armar();
  }
  /* troca automática; para de vez quando a pessoa escolhe sozinha */
  function armar() { clearTimeout(auto); if (!parado && !calmo) auto = setTimeout(function () { ir(atual + 1); }, TEMPO); }
  function parar() { parado = true; clearTimeout(auto); body.classList.add('ld-parado'); }

  function entrar() {
    if (saindo) return;
    saindo = true; parar();
    body.classList.add('ld-saindo');
    setTimeout(function () { location.href = LINKS[ESP[atual]]; }, calmo ? 0 : 450);
  }
  /* se a pessoa voltar pelo botão do navegador, a página aparece de novo normal */
  window.addEventListener('pageshow', function (e) { if (e.persisted) { saindo = false; body.classList.remove('ld-saindo'); } });

  abas.forEach(function (b, i) { b.addEventListener('click', function () { parar(); ir(i); }); });
  document.getElementById('ld-ant').addEventListener('click', function () { parar(); ir(atual - 1); });
  document.getElementById('ld-prox').addEventListener('click', function () { parar(); ir(atual + 1); });
  objs.forEach(function (o) { o.addEventListener('click', function (e) { e.preventDefault(); entrar(); }); });
  cta.addEventListener('click', function (e) { e.preventDefault(); entrar(); });

  /* roda do mouse: um esporte por gesto */
  var travaRoda = 0;
  window.addEventListener('wheel', function (e) {
    var agora = Date.now();
    if (Math.abs(e.deltaY) + Math.abs(e.deltaX) < 12 || agora - travaRoda < 900) return;
    travaRoda = agora; parar(); ir(atual + ((e.deltaY || e.deltaX) > 0 ? 1 : -1));
  }, { passive: true });
  /* arrastar para o lado (celular e mouse) */
  var x0 = null, y0 = 0;
  window.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
  window.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { parar(); ir(atual + (dx < 0 ? 1 : -1)); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { parar(); ir(atual + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { parar(); ir(atual - 1); e.preventDefault(); }
    else if (e.key === 'Enter' && !/^(BUTTON|A)$/.test((document.activeElement || {}).tagName)) { e.preventDefault(); entrar(); }
  });

  /* profundidade com o mouse: letras inclinam, objeto e fundo deslizam em sentidos diferentes */
  if (!calmo && window.matchMedia('(pointer: fine)').matches) {
    var alvo = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, rodando = false;
    window.addEventListener('pointermove', function (e) {
      alvo.x = e.clientX / innerWidth - .5; alvo.y = e.clientY / innerHeight - .5;
      if (!rodando) { rodando = true; requestAnimationFrame(passo); }
    });
    function passo() {
      pos.x += (alvo.x - pos.x) * .08; pos.y += (alvo.y - pos.y) * .08;
      titulo.style.setProperty('--tx', (pos.x * 14).toFixed(2) + 'deg');
      titulo.style.setProperty('--ty', (-pos.y * 8).toFixed(2) + 'deg');
      cena.style.setProperty('--ox', (pos.x * 26).toFixed(1) + 'px');
      cena.style.setProperty('--oy', (pos.y * 18).toFixed(1) + 'px');
      raiz.style.setProperty('--px', (pos.x * -18).toFixed(1) + 'px');
      raiz.style.setProperty('--py', (pos.y * -12).toFixed(1) + 'px');
      if (Math.abs(alvo.x - pos.x) + Math.abs(alvo.y - pos.y) > .001) requestAnimationFrame(passo); else rodando = false;
    }
  }

  pintar(true);
  armar();
  if (!calmo) { body.classList.add('ld-intro'); setTimeout(function () { body.classList.remove('ld-intro'); }, 60); }
})();
