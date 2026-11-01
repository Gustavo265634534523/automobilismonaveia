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

  /* ---------- capa de jornal: a história de cada esporte, em blocos que cobrem a tela (só o nome do esporte fica livre) ----------
     [rótulo, título, texto]. Fatos históricos conferidos; "F" = frase motivadora. */
  var HISTORIA = {
    futebol: [
      ['Há mais de 2 mil anos', 'Antes da bola de couro', 'Jogos de chutar a bola existem há milênios. O cuju, da China antiga, é reconhecido pela FIFA como a forma mais antiga do esporte.'],
      ['1863 · Londres', 'Nasce o futebol moderno', 'Em 26 de outubro de 1863 foi fundada a Football Association, que escreveu as primeiras regras e separou de vez o futebol do rúgbi.'],
      ['1871', 'O torneio mais antigo do mundo', 'A Copa da Inglaterra começou na temporada 1871/72. O primeiro campeão foi o Wanderers, que venceu o Royal Engineers por 1 x 0 na final.'],
      ['F', 'Ninguém lembra do placar do intervalo.'],
      ['1872 · Glasgow', 'O primeiro jogo entre países', 'Em 30 de novembro de 1872, Escócia e Inglaterra fizeram o primeiro jogo internacional da história. Terminou 0 x 0.'],
      ['1894 · São Paulo', 'O futebol chega ao Brasil', 'Charles Miller voltou de seus estudos na Inglaterra com duas bolas e um livro de regras. Ele é chamado de pai do futebol brasileiro.'],
      ['1902', 'O primeiro campeonato brasileiro de clubes', 'O Campeonato Paulista de 1902 foi o primeiro torneio de futebol do país. O campeão foi o São Paulo Athletic Club, time de Charles Miller.'],
      ['1904 · Paris', 'Nasce a FIFA', 'A FIFA foi fundada em 21 de maio de 1904 por sete países europeus, para organizar o futebol entre as nações.'],
      ['F', 'O gol mais bonito é sempre o próximo.'],
      ['1930 · Uruguai', 'A primeira Copa do Mundo', 'Treze seleções disputaram a primeira Copa. Na final, no Estádio Centenário, o Uruguai venceu a Argentina por 4 x 2 e foi o primeiro campeão mundial.'],
      ['13 de julho de 1930', 'O primeiro gol de Copa', 'O francês Lucien Laurent marcou o primeiro gol da história das Copas, na vitória da França sobre o México por 4 x 1.'],
      ['1958 · Suécia', 'A primeira estrela do Brasil', 'O Brasil venceu a Suécia por 5 x 2 na final e ganhou sua primeira Copa. Pelé tinha 17 anos e marcou dois gols na decisão.'],
      ['1959', 'O primeiro campeão brasileiro', 'A Taça Brasil de 1959, reconhecida como o primeiro Campeonato Brasileiro, foi vencida pelo Bahia, que bateu o Santos de Pelé na final.'],
      ['F', 'Camisa pesa. Quem aguenta o peso, levanta a taça.']
    ],
    basquete: [
      ['Dezembro de 1891', 'Um esporte inventado numa aula', 'O professor canadense James Naismith criou o basquete em Springfield, nos Estados Unidos, para manter os alunos ativos durante o inverno.'],
      ['Cestos de pêssego', 'A primeira cesta tinha fundo', 'Os aros eram cestos de pêssego pregados na varanda do ginásio. A cada ponto, alguém subia para tirar a bola lá de dentro.'],
      ['21 de dezembro de 1891', 'O primeiro jogo', 'Foram nove contra nove, e a partida terminou 1 x 0. A única cesta foi de William Chase.'],
      ['13 regras', 'O regulamento original', 'Naismith escreveu 13 regras. Correr com a bola era proibido: ela só podia ser passada ou arremessada.'],
      ['F', 'Cada arremesso errado é um treino para o que vai entrar.'],
      ['1896', 'O basquete chega ao Brasil', 'O professor americano Augusto Shaw trouxe o basquete para o Mackenzie, em São Paulo. No começo, o jogo era praticado principalmente por mulheres.'],
      ['1936 · Berlim', 'A estreia olímpica', 'O basquete entrou nas Olimpíadas em 1936. A final foi ao ar livre, numa quadra de terra encharcada pela chuva, e os Estados Unidos venceram o Canadá por 19 x 8.'],
      ['1º de novembro de 1946', 'O primeiro jogo da NBA', 'A liga começou como BAA. O primeiro jogo foi em Toronto: New York Knickerbockers 68 x 66 Toronto Huskies. Em 1949 ela virou NBA.'],
      ['1947', 'O primeiro campeão', 'O Philadelphia Warriors venceu a primeira temporada da liga, batendo o Chicago Stags na final.'],
      ['F', 'Jogo decidido no último segundo é de quem não desistiu no primeiro.'],
      ['1954', 'O relógio que mudou o jogo', 'Para acabar com os times que seguravam a bola, a NBA criou o limite de 24 segundos para o ataque. O jogo ficou muito mais rápido.'],
      ['1959 e 1963', 'O Brasil bicampeão do mundo', 'A seleção brasileira ganhou o Mundial no Chile, em 1959, e repetiu o título em casa, no Rio de Janeiro, em 1963.'],
      ['12 de outubro de 1979', 'A primeira cesta de três', 'Chris Ford, do Boston Celtics, fez a primeira cesta de três pontos da NBA, na temporada em que a linha foi criada.'],
      ['F', 'Quem não para de pular um dia alcança o aro.']
    ],
    automobilismo: [
      ['1906 · Le Mans', 'O primeiro Grande Prêmio', 'O GP da França de 1906 é considerado o primeiro Grande Prêmio da história. O vencedor foi Ferenc Szisz, com um Renault.'],
      ['13 de maio de 1950', 'Nasce a Fórmula 1', 'A primeira corrida do Campeonato Mundial foi o GP da Grã-Bretanha, em Silverstone, vencido por Giuseppe Farina, da Alfa Romeo.'],
      ['1950', 'O primeiro campeão do mundo', 'O italiano Giuseppe "Nino" Farina foi o primeiro campeão mundial de Fórmula 1, pilotando para a Alfa Romeo.'],
      ['F', 'Na reta todo mundo é rápido. Campeão se faz na curva.'],
      ['1951 a 1957', 'O mestre Fangio', 'O argentino Juan Manuel Fangio ganhou cinco títulos mundiais nos anos 1950. O recorde só foi superado por Michael Schumacher, em 2003.'],
      ['1951', 'O primeiro brasileiro na F1', 'Chico Landi foi o primeiro brasileiro a correr na Fórmula 1, no GP da Itália de 1951, em Monza.'],
      ['1958', 'O Mundial de Construtores', 'O campeonato das equipes começou em 1958. A primeira campeã foi a britânica Vanwall.'],
      ['Desde 1950', 'Presença em todas as temporadas', 'A Ferrari é a única equipe que disputou todas as temporadas do Mundial de Fórmula 1 desde a primeira, em 1950.'],
      ['F', 'Largar atrás não é desculpa: é ponto de partida.'],
      ['1970 · Watkins Glen', 'A primeira vitória brasileira', 'Emerson Fittipaldi venceu o GP dos Estados Unidos de 1970, na sua quarta corrida na Fórmula 1. Foi a primeira vitória de um brasileiro.'],
      ['1972', 'O primeiro campeão brasileiro', 'Emerson Fittipaldi foi campeão mundial pela Lotus e se tornou, na época, o campeão mais jovem da história, com 25 anos.'],
      ['1973 · Interlagos', 'O primeiro GP do Brasil', 'O GP do Brasil entrou no Mundial em 1973, em Interlagos. E quem venceu foi ele de novo: Emerson Fittipaldi.'],
      ['1981, 1983 e 1987', 'Piquet tricampeão', 'Nelson Piquet ganhou três títulos mundiais, dois pela Brabham e um pela Williams.'],
      ['1988, 1990 e 1991', 'Senna tricampeão', 'Ayrton Senna conquistou três títulos pela McLaren e é lembrado como um dos maiores pilotos de todos os tempos.'],
      ['F', 'A bandeirada só chega para quem continua acelerando.']
    ]
  };
  function escH(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* oito espaços em volta do nome do esporte; os blocos enchem um por um, na ordem da história */
  var ESPACOS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  function colunas(esp) {
    var M = document.getElementById('ld-mural'); if (!M) return;
    var H = HISTORIA[esp], caixas = ESPACOS.map(function () { return []; });
    H.forEach(function (h, i) {
      caixas[Math.min(ESPACOS.length - 1, Math.floor(i * ESPACOS.length / H.length))].push(h[0] === 'F' ? '<blockquote class="ld-cita"><p>' + escH(h[1]) + '</p></blockquote>'
        : '<article class="ld-fato"><small>' + escH(h[0]) + '</small><h3>' + escH(h[1]) + '</h3><p>' + escH(h[2]) + '</p></article>');
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
