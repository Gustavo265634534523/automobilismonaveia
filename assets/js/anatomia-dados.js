/* Anatomia do carro de F1 (anatomia.html e o pôster para as redes): as peças com a posição na foto do carro genérico
   do site (assets/img/hero-1-lado.webp, imagem gerada, sem equipe nem marca), em % da largura e da altura. */
window.ANATOMIA_F1 = {
  foto: 'assets/img/hero-1-lado.webp',
  pecas: [
    { id: 'asa-dianteira', x: 9, y: 62, nome: 'Asa dianteira', numero: '1º contato com o ar',
      texto: 'É a primeira peça a cortar o ar. Ela gera pressão para baixo na frente do carro e manda o ar para o resto do carro do jeito certo. Desde 2026 ela é móvel: nas retas, as abas abrem para o carro ficar mais rápido.' },
    { id: 'pneus', x: 23.5, y: 60, nome: 'Pneus', numero: '18 polegadas',
      texto: 'São da Pirelli, com aro de 18 polegadas. Têm vários tipos de borracha: os macios são mais rápidos e gastam logo; os duros duram mais. Funcionam melhor quentes, por volta de 100 °C.' },
    { id: 'freios', x: 26, y: 64, nome: 'Freios', numero: 'até 1.000 °C',
      texto: 'Os discos são de carbono e chegam perto de 1.000 °C. O carro sai de mais de 300 km/h para menos de 100 km/h em poucos segundos, e o piloto sente uma força de 5 vezes o peso do corpo.' },
    { id: 'halo', x: 43, y: 43, nome: 'Halo', numero: 'aguenta 12 toneladas',
      texto: 'O arco de titânio em cima do cockpit protege a cabeça do piloto. Pesa uns 7 kg e aguenta um peso de mais de 12 toneladas, como um ônibus em cima dele. Já salvou pilotos em batidas graves.' },
    { id: 'volante', x: 41, y: 49, nome: 'Volante', numero: 'dezenas de botões',
      texto: 'É um computador nas mãos do piloto: tem tela, dezenas de botões e seletores para mudar o freio, a energia da bateria, o rádio e a estratégia, tudo a mais de 300 km/h.' },
    { id: 'motor', x: 60, y: 45, nome: 'Motor', numero: '≈ 1.000 cv',
      texto: 'É um V6 turbo de 1,6 litro junto com um motor elétrico. Desde 2026, quase metade da força vem da parte elétrica, e a gasolina é 100% sustentável. No total, perto de 1.000 cavalos.' },
    { id: 'bateria', x: 51, y: 57, nome: 'Bateria e laterais', numero: 'recupera energia na freada',
      texto: 'Nas laterais ficam os radiadores que esfriam o motor. A bateria guarda a energia que o carro recupera nas freadas e devolve nas retas, como um impulso extra.' },
    { id: 'assoalho', x: 47, y: 69, nome: 'Assoalho', numero: 'o carro "gruda" no chão',
      texto: 'O fundo do carro tem canais que aceleram o ar por baixo e puxam o carro contra o asfalto: é o efeito solo. Grande parte da pressão que segura o carro nas curvas vem daqui.' },
    { id: 'cambio', x: 76, y: 56, nome: 'Câmbio', numero: '8 marchas',
      texto: 'São 8 marchas para frente, trocadas por borboletas atrás do volante. Cada troca leva só alguns milésimos de segundo, sem o piloto tirar o pé.' },
    { id: 'asa-traseira', x: 89, y: 37, nome: 'Asa traseira', numero: 'abre nas retas',
      texto: 'Segura a traseira no chão nas curvas. Desde 2026 ela também é móvel: abre nas retas para cortar o ar e ganhar velocidade, e fecha antes da freada.' }
  ],
  ficha: [
    ['≈ 1.000 cv', 'de potência'], ['768 kg', 'peso mínimo com o piloto'], ['2,6 s', 'de 0 a 100 km/h'], ['+350 km/h', 'de velocidade máxima'], ['5 G', 'na freada']
  ]
};

/* MotoGP: moto genérica da categoria (assets/img/cat/motogp.jpg, imagem gerada, sem equipe nem marca) */
window.ANATOMIA_MOTOGP = {
  foto: 'assets/img/cat/motogp.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'asas', x: 31, y: 27, nome: 'Asas', numero: 'seguram a frente',
      texto: 'As asinhas na frente da moto empurram a roda dianteira contra o chão na aceleração, para a moto não empinar. Também ajudam a frear mais tarde.' },
    { id: 'pneu', x: 17, y: 69, nome: 'Pneu dianteiro', numero: 'aro 17',
      texto: 'Os pneus são da Michelin, com tipos de borracha macia, média e dura. O da frente é o que mais sofre na freada: se ele perde a aderência, a moto "fecha a frente" e o piloto cai.' },
    { id: 'freio', x: 24.5, y: 57, nome: 'Freios', numero: 'passam de 800 °C',
      texto: 'Os discos são de carbono e ficam vermelhos de tão quentes. Na freada mais forte, a moto sai de mais de 300 km/h para menos de 100 km/h em poucos segundos, com quase todo o peso na roda da frente.' },
    { id: 'carenagem', x: 46, y: 31, nome: 'Carenagem', numero: 'corta o ar',
      texto: 'É a "roupa" da moto: corta o ar e esconde os radiadores. As entradas de ar esfriam o motor e os freios.' },
    { id: 'guidao', x: 37, y: 13, nome: 'Guidão', numero: 'botões e ajustes',
      texto: 'Tem botões para mudar a força do motor, o controle de tração e o sistema de largada, tudo com a moto andando a mais de 300 km/h.' },
    { id: 'motor', x: 41.5, y: 57, nome: 'Motor', numero: '≈ 300 cv',
      texto: 'Motor de 1.000 cc e 4 cilindros, com perto de 300 cavalos para uma moto de 157 kg. Ele gira até perto de 18 mil rotações por minuto.' },
    { id: 'bolha', x: 53.5, y: 20, nome: 'Bolha', numero: 'proteção do vento',
      texto: 'Na reta, o piloto deita o capacete atrás da bolha para fugir do vento e ganhar velocidade.' },
    { id: 'capacete', x: 66, y: 24, nome: 'Capacete', numero: '≈ 1,4 kg',
      texto: 'Feito de fibra de carbono, leve e muito resistente. Tem entradas de ar e uma viseira escura para o sol.' },
    { id: 'macacao', x: 69, y: 42, nome: 'Macacão', numero: 'airbag por dentro',
      texto: 'De couro, com um airbag por dentro. Sensores percebem a queda e o airbag enche em milésimos de segundo, protegendo os ombros e o peito.' },
    { id: 'joelho', x: 59, y: 75, nome: 'Joelho no chão', numero: 'mais de 60°',
      texto: 'Nas curvas, a moto deita mais de 60°. O piloto encosta o joelho no asfalto, protegido por um "slider" de plástico, e às vezes até o cotovelo.' }
  ],
  ficha: [['≈ 300 cv', 'de potência'], ['157 kg', 'peso mínimo da moto'], ['+360 km/h', 'de velocidade máxima'], ['1.000 cc', 'motor'], ['+60°', 'de inclinação na curva']]
};
window.ANATOMIA_F1.w = 2400; window.ANATOMIA_F1.h = 1357;

/* Stock Car: carros genéricos da categoria (assets/img/cat/stock.jpg, imagem gerada, sem equipe nem marca) */
window.ANATOMIA_STOCK = {
  foto: 'assets/img/cat/stock.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'pneu', x: 8.5, y: 59, nome: 'Pneus', numero: 'slick no seco',
      texto: 'No seco, os pneus são lisos (slick) para ter o máximo de borracha no asfalto. Na chuva, entram os pneus com sulcos, que tiram a água do caminho.' },
    { id: 'cambio', x: 12, y: 47, nome: 'Câmbio', numero: '6 marchas',
      texto: 'O câmbio é sequencial, com 6 marchas: o piloto só puxa ou empurra para trocar, sem procurar a marcha. As trocas são muito mais rápidas que num carro de rua.' },
    { id: 'asa', x: 15, y: 27, nome: 'Asa traseira', numero: 'segura a traseira',
      texto: 'Empurra a traseira contra o chão nas curvas rápidas, para o carro não escapar de traseira. Quanto mais inclinada, mais pressão, mas menos velocidade na reta.' },
    { id: 'carroceria', x: 24, y: 33, nome: 'Carroceria', numero: 'cara de carro de rua',
      texto: 'Por fora, parece um carro de rua. Por baixo, todos usam o mesmo chassi tubular de aço, feito só para corrida. Assim a disputa fica parelha e quem faz a diferença é o piloto e a equipe.' },
    { id: 'motor', x: 30, y: 47, nome: 'Motor', numero: 'V8 5.7 aspirado',
      texto: 'Em 2026 o ronco do V8 voltou: um motor de 5,7 litros, sem turbo, com perto de 480 cavalos. É igual para todos os carros, e por isso o acerto e a pilotagem decidem as corridas.' },
    { id: 'cockpit', x: 33, y: 36, nome: 'Cockpit', numero: 'gaiola de aço',
      texto: 'O piloto senta dentro de uma gaiola de tubos de aço, com banco de corrida e cinto de vários pontos. Ela protege o piloto nas batidas e capotagens.' },
    { id: 'brasil', x: 40, y: 16, nome: 'Orgulho nacional', numero: 'desde 1979',
      texto: 'A Stock Car é a principal categoria do automobilismo brasileiro. Começou em 1979 e já passou por pistas como Interlagos, Goiânia, Cascavel e até corridas de rua.' },
    { id: 'splitter', x: 39, y: 68, nome: 'Para-choque', numero: 'corta o ar embaixo',
      texto: 'Embaixo do para-choque fica o splitter, uma lâmina que corta o ar e gera pressão na frente do carro. Ajuda o carro a virar nas curvas sem sair de frente.' },
    { id: 'farois', x: 48, y: 53, nome: 'Faróis', numero: 'de LED',
      texto: 'Os faróis de LED ajudam a ver e ser visto, principalmente em corridas longas e com tempo fechado, quando a luz cai no fim da tarde.' },
    { id: 'disputa', x: 64, y: 64, nome: 'Grid cheio', numero: 'lado a lado',
      texto: 'Como os carros são muito parecidos, as corridas são disputadas roda a roda até a bandeirada. Muitas vezes o grid inteiro fica separado por menos de um segundo na classificação.' }
  ],
  ficha: [['≈ 480 cv', 'de potência'], ['V8 5.7', 'motor aspirado'], ['≈ 1.100 kg', 'de peso'], ['6 marchas', 'câmbio sequencial'], ['1979', 'primeira temporada']]
};

/* Fórmula E: carro genérico da categoria (assets/img/cat/fe.jpg, imagem gerada, sem equipe nem marca). Números do carro novo (GEN4), temporada 2026/27 */
window.ANATOMIA_FE = {
  foto: 'assets/img/cat/fe.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'asa', x: 49, y: 41, nome: 'Asa traseira', numero: 'baixa pressão',
      texto: 'É bem menor que a de um F1. Com pouca asa, o carro corta melhor o ar e gasta menos energia, o que é essencial num carro elétrico.' },
    { id: 'regen', x: 50, y: 53, nome: 'Regeneração', numero: 'até 700 kW',
      texto: 'Na freada, os motores elétricos funcionam ao contrário e viram geradores: transformam a velocidade em energia para a bateria. Uma boa parte da energia da corrida é recuperada assim.' },
    { id: 'pneu', x: 61, y: 58, nome: 'Pneus', numero: 'aderência na rua',
      texto: 'Feitos para o asfalto de cidade, que é cheio de ondulações, faixas pintadas e tampas de bueiro, bem diferente de um autódromo.' },
    { id: 'piloto', x: 67.5, y: 45, nome: 'Piloto', numero: 'gerencia a energia',
      texto: 'Não basta acelerar: o piloto precisa economizar energia para chegar ao fim. Muitas vezes ele tira o pé antes da freada de propósito, para gastar menos.' },
    { id: 'halo', x: 72, y: 39, nome: 'Halo', numero: 'protege a cabeça',
      texto: 'O arco em cima do cockpit protege a cabeça do piloto em batidas e contra peças soltas. É obrigatório nos carros de fórmula da FIA.' },
    { id: 'bateria', x: 75, y: 53, nome: 'Bateria', numero: '55 kWh',
      texto: 'Fica atrás do piloto e guarda a energia da corrida inteira. No carro novo são 55 kWh para a corrida, somando o que vem da bateria cheia com o que é recuperado.' },
    { id: 'bico', x: 80, y: 61, nome: 'Bico', numero: 'nariz baixo',
      texto: 'O bico baixo corta o ar na frente e manda o fluxo para baixo e para os lados do carro.' },
    { id: 'tracao', x: 88, y: 52, nome: 'Tração', numero: 'nas 4 rodas',
      texto: 'O carro novo tem motor elétrico também na frente, com tração nas 4 rodas o tempo todo. Por isso ele sai de 0 a 100 km/h em cerca de 1,8 segundo, mais rápido que um F1.' },
    { id: 'rua', x: 92, y: 36, nome: 'Pista de rua', numero: 'no meio da cidade',
      texto: 'A Fórmula E corre em ruas fechadas no centro das cidades, com muros colados na pista. Não há espaço para errar.' },
    { id: 'asad', x: 93, y: 65, nome: 'Asa dianteira', numero: 'aguenta toques',
      texto: 'Nas ruas estreitas, os toques entre os carros são comuns. A asa dianteira é feita para aguentar pequenas batidas sem quebrar.' }
  ],
  ficha: [['600 kW', '≈ 816 cv no modo ataque'], ['1,8 s', 'de 0 a 100 km/h'], ['335 km/h', 'velocidade máxima'], ['700 kW', 'regeneração na freada'], ['4x4', 'tração nas 4 rodas']]
};

/* Fórmula 2: carro genérico da categoria (assets/img/cat/f2.jpg, imagem gerada, sem equipe nem marca). Carro usado desde 2024 */
window.ANATOMIA_F2 = {
  foto: 'assets/img/cat/f2.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'pneu', x: 46, y: 50, nome: 'Pneus', numero: '18 polegadas',
      texto: 'São da Pirelli, com aro de 18 polegadas, como na F1. Os pilotos já aprendem a cuidar do desgaste e a escolher a hora certa de parar nos boxes.' },
    { id: 'asa', x: 54, y: 32, nome: 'Asa traseira', numero: 'tem DRS',
      texto: 'Segura a traseira no chão nas curvas. Nas retas, o piloto que está a menos de um segundo do carro da frente pode abrir a asa (DRS) para ganhar velocidade e tentar a ultrapassagem.' },
    { id: 'freio', x: 55, y: 52, nome: 'Freios', numero: 'discos de carbono',
      texto: 'Os discos são de carbono, como num F1. Eles funcionam melhor muito quentes e param o carro em pouquíssimos metros.' },
    { id: 'motor', x: 64.5, y: 25, nome: 'Motor', numero: 'V6 3.4 turbo',
      texto: 'É um V6 de 3,4 litros com turbo, com cerca de 620 cavalos. A entrada de ar fica acima da cabeça do piloto. O motor é igual para todas as equipes.' },
    { id: 'piloto', x: 66.5, y: 34, nome: 'Piloto', numero: 'a escola da F1',
      texto: 'A F2 é o último degrau antes da F1. Corre nos mesmos fins de semana e nas mesmas pistas, e muitos campeões da F1 passaram por aqui.' },
    { id: 'halo', x: 72, y: 29, nome: 'Halo', numero: 'protege a cabeça',
      texto: 'O arco em cima do cockpit protege a cabeça do piloto em batidas e contra peças soltas, igual ao da F1.' },
    { id: 'bico', x: 77, y: 50, nome: 'Bico', numero: 'chassi de carbono',
      texto: 'Todas as equipes usam o mesmo chassi, feito pela Dallara em fibra de carbono. Assim, quem faz a diferença é o piloto e o acerto do carro.' },
    { id: 'laterais', x: 79, y: 38, nome: 'Laterais', numero: 'radiadores',
      texto: 'Nas laterais ficam os radiadores, que esfriam o motor com o ar que entra pelas aberturas.' },
    { id: 'suspensao', x: 85, y: 42, nome: 'Suspensão', numero: 'braços finos',
      texto: 'Os braços finos ligam as rodas ao carro. Eles são fininhos para atrapalhar o mínimo possível o ar que passa por ali.' },
    { id: 'asad', x: 91, y: 55, nome: 'Asa dianteira', numero: 'pressão no bico',
      texto: 'Gera pressão para baixo na frente do carro e manda o ar para o resto do carro. O carro de 2024 foi feito para ficar mais parecido com o F1 atual.' }
  ],
  ficha: [['620 cv', 'de potência'], ['V6 3.4', 'turbo'], ['795 kg', 'com piloto e gasolina'], ['≈ 335 km/h', 'velocidade máxima'], ['6 marchas', 'câmbio sequencial']]
};

/* Fórmula 3: carros genéricos da categoria (assets/img/cat/f3.jpg, imagem gerada, sem equipe nem marca). Carro usado desde 2025 */
window.ANATOMIA_F3 = {
  foto: 'assets/img/cat/f3.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'pneu', x: 11, y: 57, nome: 'Pneus', numero: 'aro 16',
      texto: 'São da Pirelli, com aro de 16 polegadas, menores que os da F1 e da F2. Os pilotos aprendem aqui a cuidar do desgaste dos pneus durante a corrida.' },
    { id: 'asad', x: 13, y: 71, nome: 'Asa dianteira', numero: 'pressão no bico',
      texto: 'Gera pressão para baixo na frente do carro e ajuda o carro a virar nas curvas. Num grid tão cheio, é a peça que mais sofre com os toques.' },
    { id: 'bico', x: 28, y: 62, nome: 'Bico', numero: 'carbono e kevlar',
      texto: 'O chassi é de fibra de carbono e kevlar, feito pela Dallara e igual para todas as equipes. Assim, quem faz a diferença é o piloto.' },
    { id: 'halo', x: 27.5, y: 40, nome: 'Halo', numero: 'de aço',
      texto: 'O arco em cima do cockpit protege a cabeça do piloto em batidas e contra peças soltas. Na F3 ele é de aço.' },
    { id: 'piloto', x: 33.5, y: 45, nome: 'Piloto', numero: 'os jovens talentos',
      texto: 'A F3 reúne os jovens mais promissores do mundo, muitos ainda adolescentes. É o degrau antes da F2, e corre nos mesmos fins de semana da F1.' },
    { id: 'motor', x: 34, y: 31, nome: 'Motor', numero: 'V6 3.4 aspirado',
      texto: 'É um V6 de 3,4 litros sem turbo, com cerca de 380 cavalos. A entrada de ar fica acima da cabeça do piloto. O motor é igual para todos.' },
    { id: 'suspensao', x: 39, y: 57, nome: 'Suspensão', numero: 'braços finos',
      texto: 'Os braços finos ligam as rodas ao carro. São fininhos para atrapalhar o mínimo possível o ar que passa por ali.' },
    { id: 'asa', x: 46, y: 36, nome: 'Asa traseira', numero: 'tem DRS',
      texto: 'Segura a traseira no chão nas curvas. Nas retas, o piloto que está perto do carro da frente pode abrir a asa (DRS) para ganhar velocidade e tentar a ultrapassagem.' },
    { id: 'freio', x: 49, y: 64, nome: 'Freios', numero: 'até –1,9 G',
      texto: 'Na freada mais forte, o piloto sente quase 2 vezes o peso do corpo sendo jogado para a frente. O carro sai de alta velocidade e entra na curva em poucos metros.' },
    { id: 'grid', x: 60, y: 44, nome: 'Grid cheio', numero: '30 carros',
      texto: 'São 30 carros na pista, todos iguais. As corridas são muito disputadas, com várias ultrapassagens e brigas em grupo do começo ao fim.' }
  ],
  ficha: [['380 cv', 'de potência'], ['V6 3.4', 'aspirado'], ['673 kg', 'com o piloto'], ['300 km/h', 'velocidade máx. (aprox.)'], ['6 marchas', 'câmbio sequencial']]
};

/* IndyCar: carro genérico da categoria (assets/img/cat/indy.jpg, imagem gerada, sem equipe nem marca). Números de 2026 */
window.ANATOMIA_INDY = {
  foto: 'assets/img/cat/indy.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'oval', x: 16, y: 30, nome: 'Ovais', numero: 'muro colado',
      texto: 'A marca da IndyCar são os ovais, como o de Indianápolis: o piloto fica com o pé no fundo quase a volta toda, a centímetros do muro. A categoria também corre em autódromos e em ruas.' },
    { id: 'asad', x: 21, y: 52, nome: 'Asa dianteira', numero: 'muda por pista',
      texto: 'O carro usa um pacote de asas para cada tipo de pista. Nos ovais as asas são menores e quase retas, para cortar o ar; nos autódromos são maiores, para segurar o carro nas curvas.' },
    { id: 'pneu', x: 29, y: 36, nome: 'Pneus', numero: 'Firestone',
      texto: 'Todos usam pneus Firestone. Nos ovais, os pneus de um lado são diferentes dos do outro, porque o carro só vira para a esquerda e o lado de fora trabalha muito mais.' },
    { id: 'suspensao', x: 36, y: 44, nome: 'Suspensão', numero: 'braços finos',
      texto: 'Os braços finos ligam as rodas ao carro. Nos ovais, o acerto é diferente de um lado e do outro, também por causa das curvas sempre para a esquerda.' },
    { id: 'bico', x: 36.5, y: 57, nome: 'Bico', numero: 'chassi Dallara',
      texto: 'Todas as equipes usam o mesmo chassi, feito pela Dallara. A diferença fica no motor, no acerto e no piloto.' },
    { id: 'aeroscreen', x: 55, y: 33, nome: 'Aeroscreen', numero: 'para-brisa blindado',
      texto: 'Em vez do halo da F1, a IndyCar usa o aeroscreen: um para-brisa reforçado em volta do cockpit, que protege a cabeça do piloto de batidas e de peças soltas em alta velocidade.' },
    { id: 'motor', x: 62, y: 36, nome: 'Motor', numero: 'V6 2.2 biturbo',
      texto: 'É um V6 de 2,2 litros com dois turbos, da Honda ou da Chevrolet. Gira até 12 mil rotações por minuto e a força muda conforme a pista, de 550 a 750 cavalos.' },
    { id: 'freio', x: 69, y: 60, nome: 'Freios', numero: 'discos de carbono',
      texto: 'Os discos são de carbono. Nos ovais quase não se freia, mas nos autódromos e nas pistas de rua os freios trabalham muito.' },
    { id: 'asa', x: 71, y: 32, nome: 'Asa traseira', numero: 'quase reta no oval',
      texto: 'Nos ovais a asa traseira fica quase reta, para o carro passar dos 370 km/h. Nas outras pistas ela é maior e mais inclinada, para segurar a traseira nas curvas.' },
    { id: 'hibrido', x: 77, y: 47, nome: 'Híbrido', numero: '+60 cv',
      texto: 'Desde 2024 o carro tem um sistema híbrido entre o motor e o câmbio. Ele recupera energia nas freadas e devolve até 60 cavalos a mais quando o piloto aperta o botão.' }
  ],
  ficha: [['até 750 cv', 'conforme a pista'], ['+60 cv', 'do sistema híbrido'], ['V6 2.2', 'biturbo'], ['380 km/h', 'nos ovais (aprox.)'], ['12 mil', 'rpm (máximo)']]
};

/* NASCAR: carros genéricos da categoria (assets/img/cat/nascar.jpg, imagem gerada, sem equipe nem marca). Carro Next Gen da Cup Series */
window.ANATOMIA_NASCAR = {
  foto: 'assets/img/cat/nascar.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'oval', x: 18, y: 24, nome: 'Oval inclinado', numero: 'curvas com rampa',
      texto: 'As curvas dos ovais são inclinadas, como uma rampa. Isso segura o carro e deixa o piloto fazer a curva quase de pé no fundo, colado no muro.' },
    { id: 'carroceria', x: 15, y: 45, nome: 'Carroceria', numero: 'cara de carro de rua',
      texto: 'Por fora, lembra um carro de rua da Chevrolet, da Ford ou da Toyota. Por baixo, todos usam o mesmo chassi de corrida, com peças iguais para todas as equipes.' },
    { id: 'pneu', x: 30, y: 55, nome: 'Pneus', numero: 'roda 18"',
      texto: 'As rodas são de alumínio, com 18 polegadas e presas por uma porca só, no meio. Assim a troca de pneus no pit stop fica muito rápida.' },
    { id: 'parachoque', x: 47, y: 65, nome: 'Para-choque', numero: 'aguenta toques',
      texto: 'Na NASCAR, encostar faz parte do jogo: os carros se tocam o tempo todo para ganhar espaço. O para-choque é feito para aguentar essas pancadas.' },
    { id: 'motor', x: 48, y: 50, nome: 'Motor', numero: 'V8 5.86 aspirado',
      texto: 'É um V8 de 5,86 litros sem turbo, com cerca de 670 cavalos na maioria das pistas. Nos ovais gigantes, como Daytona, a força é limitada para os carros não ficarem rápidos demais.' },
    { id: 'cockpit', x: 51, y: 40, nome: 'Cockpit', numero: 'gaiola de aço',
      texto: 'O piloto senta dentro de uma gaiola de tubos de aço, com banco que envolve o corpo e rede na janela. Ela protege nas batidas, que podem passar dos 300 km/h.' },
    { id: 'farol', x: 61, y: 59, nome: 'Faróis', numero: 'adesivos',
      texto: 'Os faróis não acendem: são adesivos desenhados para o carro parecer um modelo de rua. Nas corridas à noite, a pista é toda iluminada.' },
    { id: 'pelotao', x: 66, y: 39, nome: 'Pelotão', numero: '40 carros',
      texto: 'São cerca de 40 carros no grid, andando colados por horas. Uma batida na frente pode virar um acidente com vários carros, o famoso "big one".' },
    { id: 'faiscas', x: 67, y: 72, nome: 'Faíscas', numero: 'placas de titânio',
      texto: 'Embaixo do carro há placas de titânio. Quando o carro raspa no chão, elas soltam aquelas faíscas que aparecem nas corridas à noite.' },
    { id: 'vacuo', x: 82, y: 50, nome: 'Vácuo', numero: 'lado a lado',
      texto: 'Nos ovais, um carro atrás do outro anda mais rápido: o da frente abre o ar e o de trás vem no vácuo. Por isso as corridas são em fila e lado a lado até a bandeirada.' }
  ],
  ficha: [['670 cv', 'na maioria das pistas'], ['V8 5.86', 'aspirado'], ['≈ 1.540 kg', 'com piloto e gasolina'], ['5 marchas', 'câmbio sequencial'], ['40 carros', 'no grid']]
};

/* WEC: protótipo genérico da categoria Hypercar (assets/img/cat/le-mans-noite.jpg, imagem gerada, sem equipe nem marca). Regras de 2026 */
window.ANATOMIA_WEC = {
  foto: 'assets/img/cat/le-mans-noite.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'noite', x: 7.5, y: 27, nome: 'Noite adentro', numero: '24 horas',
      texto: 'As corridas do WEC são de resistência: duram de 6 a 24 horas. Nas 24 Horas de Le Mans, o carro corre de dia, de noite e às vezes na chuva, sem parar.' },
    { id: 'bico', x: 20, y: 58, nome: 'Bico', numero: 'gruda no chão',
      texto: 'O bico e o fundo do carro aceleram o ar por baixo e puxam o carro contra o asfalto. Isso dá aderência nas curvas rápidas de Le Mans.' },
    { id: 'cockpit', x: 33, y: 33, nome: 'Cockpit fechado', numero: '3 pilotos',
      texto: 'Diferente da F1, o cockpit é fechado, com teto e para-brisa. Três pilotos dividem o mesmo carro e se revezam ao volante durante a corrida.' },
    { id: 'entrada', x: 40, y: 26, nome: 'Entrada de ar', numero: 'no teto',
      texto: 'A entrada no teto leva ar fresco para o motor, que fica atrás do piloto. Ar mais frio ajuda o motor a render mais.' },
    { id: 'farol', x: 41, y: 49, nome: 'Faróis', numero: 'de LED',
      texto: 'Os faróis de LED são fortíssimos: à noite, nas retas de Le Mans, eles iluminam a pista a mais de 300 km/h. Cada marca tem um desenho de farol, que ajuda a reconhecer o carro no escuro.' },
    { id: 'barbatana', x: 46, y: 21, nome: 'Barbatana', numero: 'estabilidade',
      texto: 'A barbatana em cima do carro ajuda a mantê-lo reto. Se o carro rodar em alta velocidade, ela diminui o risco de ele levantar voo.' },
    { id: 'pneu', x: 50, y: 52, nome: 'Pneus', numero: 'turnos duplos',
      texto: 'Os pneus aguentam muito: muitas vezes um jogo de pneus dura dois turnos seguidos. Nas corridas de resistência, poupar pneu é tão importante quanto ser rápido.' },
    { id: 'motor', x: 59, y: 43, nome: 'Motor', numero: 'V6, V8 ou turbo',
      texto: 'Cada marca escolhe o seu motor: tem V6 turbo, V8 e até V12. Para ninguém sair na frente só pelo motor, a organização equilibra o desempenho dos carros (o BoP).' },
    { id: 'asa', x: 62, y: 31, nome: 'Asa traseira', numero: 'larga e baixa',
      texto: 'A asa larga segura a traseira nas curvas rápidas. Em Le Mans, que tem retas enormes, as equipes usam asas mais baixas para ganhar velocidade.' },
    { id: 'hibrido', x: 67, y: 47, nome: 'Híbrido', numero: 'na maioria dos carros',
      texto: 'A maioria dos carros é híbrida: um motor elétrico recupera energia nas freadas e devolve na aceleração. Somando tudo, o limite é de 500 kW, perto de 680 cavalos.' }
  ],
  ficha: [['500 kW', '≈ 680 cv (máximo)'], ['1.030 kg', 'peso mínimo'], ['24 horas', 'em Le Mans'], ['3 pilotos', 'por carro'], ['13,6 km', 'a pista de Le Mans']]
};

/* DTM: carros GT3 genéricos (assets/img/cat/dtm.jpg, imagem gerada, sem equipe nem marca). Potência e peso variam com o BoP */
window.ANATOMIA_DTM = {
  foto: 'assets/img/cat/dtm.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'rivais', x: 30, y: 47, nome: 'Marcas', numero: 'várias fábricas',
      texto: 'No DTM correm carros GT3 de várias marcas, como BMW, Mercedes-AMG, Porsche, Ferrari, Lamborghini, McLaren, Aston Martin e Ford. É uma briga de fábricas, principalmente alemãs.' },
    { id: 'pneu', x: 32, y: 66, nome: 'Pneus', numero: 'troca obrigatória',
      texto: 'Em cada corrida há uma parada obrigatória nos boxes para trocar os pneus. A hora de parar vira estratégia: parar cedo ou tarde pode ganhar ou perder posições.' },
    { id: 'retrovisor', x: 43, y: 52, nome: 'Retrovisor', numero: 'olho no rival',
      texto: 'Com o grid tão equilibrado, o piloto passa a corrida olhando o retrovisor. Defender a posição é tão importante quanto atacar.' },
    { id: 'carroceria', x: 49.5, y: 58, nome: 'Carroceria', numero: 'carro GT3',
      texto: 'Os carros GT3 são feitos a partir de esportivos de rua, mas viram máquinas de corrida: mais leves, mais baixos, com asa enorme e gaiola de segurança.' },
    { id: 'freio', x: 46, y: 70, nome: 'Freios', numero: 'ficam em brasa',
      texto: 'Nas freadas fortes, os discos ficam tão quentes que brilham em vermelho, dá para ver no escuro. Os GT3 também têm ABS, que evita travar as rodas.' },
    { id: 'lanterna', x: 63, y: 55, nome: 'Lanternas', numero: 'avisam a freada',
      texto: 'As luzes de trás acendem forte na freada, para avisar quem vem colado atrás. Nas corridas em fila, isso evita muitas batidas.' },
    { id: 'cockpit', x: 67, y: 40, nome: 'Cockpit', numero: 'gaiola de aço',
      texto: 'Dentro do carro há uma gaiola de tubos de aço em volta do piloto, com banco de corrida e cinto de vários pontos. O resto do interior do carro de rua sai todo.' },
    { id: 'difusor', x: 70, y: 72, nome: 'Difusor', numero: 'puxa para baixo',
      texto: 'Embaixo da traseira, o difusor acelera o ar que sai de baixo do carro e puxa o carro contra o chão. Ajuda muito nas curvas rápidas.' },
    { id: 'asa', x: 73, y: 33, nome: 'Asa traseira', numero: 'enorme',
      texto: 'A asa traseira enorme segura a traseira nas curvas. A inclinação dela também entra no equilíbrio entre os carros.' },
    { id: 'lastro', x: 85, y: 62, nome: 'Lastro', numero: 'equilíbrio (BoP)',
      texto: 'Para os carros de marcas diferentes andarem juntos, a organização ajusta peso, potência e altura de cada modelo a cada etapa. É o BoP, o equilíbrio de desempenho.' }
  ],
  ficha: [['≈ 580 cv', 'potência (varia por carro)'], ['≈ 1.300 kg', 'peso mínimo (varia)'], ['GT3', 'carros de várias marcas'], ['2 corridas', 'por fim de semana'], ['1 parada', 'obrigatória, troca de pneus']]
};

/* Porsche Cup: carros genéricos da categoria (assets/img/cat/porsche.jpg, imagem gerada). Números do 911 GT3 Cup (geração 992) */
window.ANATOMIA_PORSCHE = {
  foto: 'assets/img/cat/porsche.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'difusor', x: 20, y: 74, nome: 'Difusor', numero: 'puxa para baixo',
      texto: 'Embaixo da traseira, o difusor acelera o ar que sai de baixo do carro e puxa o carro contra o chão, dando mais aderência nas curvas.' },
    { id: 'asa', x: 22, y: 39, nome: 'Asa traseira', numero: 'pescoço de cisne',
      texto: 'A asa é presa por cima, e não por baixo. Assim a parte de baixo da asa, que é a mais importante, fica livre e trabalha melhor.' },
    { id: 'motor', x: 24, y: 60, nome: 'Motor', numero: 'atrás do eixo',
      texto: 'Como no 911 de rua, o motor fica lá atrás, depois do eixo traseiro. É um 6 cilindros boxer de 4 litros, sem turbo, com 510 cavalos e que gira até 8.750 rpm.' },
    { id: 'cockpit', x: 30, y: 46, nome: 'Cockpit', numero: 'gaiola de aço',
      texto: 'O interior de carro de rua sai todo: fica uma gaiola de tubos de aço, banco de corrida, cinto de vários pontos e um volante cheio de botões.' },
    { id: 'lanterna', x: 35, y: 56, nome: 'Lanternas', numero: 'faixa de LED',
      texto: 'A faixa de luz de ponta a ponta acende forte na freada, avisando quem vem colado atrás.' },
    { id: 'freio', x: 44, y: 70, nome: 'Freios', numero: 'sem ABS',
      texto: 'O carro da Cup não tem ABS: o piloto precisa dosar a freada no pé para não travar as rodas. É um dos motivos de a categoria ser uma grande escola.' },
    { id: 'retrovisor', x: 48.5, y: 46.5, nome: 'Retrovisor', numero: 'olho no rival',
      texto: 'Com todos os carros iguais, a diferença entre os pilotos é mínima. Defender a posição olhando o retrovisor faz parte da corrida inteira.' },
    { id: 'entrada', x: 53, y: 60, nome: 'Entrada de ar', numero: 'na lateral',
      texto: 'As entradas de ar na lateral levam ar fresco para os freios e para o motor, que trabalham no limite a corrida toda.' },
    { id: 'pneu', x: 55, y: 67, nome: 'Pneus', numero: 'iguais para todos',
      texto: 'Todos usam o mesmo tipo de pneu. Saber cuidar dele até o fim da corrida faz muita diferença.' },
    { id: 'iguais', x: 61, y: 48, nome: 'Todos iguais', numero: 'um modelo só',
      texto: 'Na Porsche Cup todo mundo corre com o mesmo carro, o 911 GT3 Cup, igualzinho. Não há ajuste de peso ou potência entre os carros: ganha quem pilota melhor.' }
  ],
  ficha: [['510 cv', 'motor 4.0 de 6 cilindros'], ['1.260 kg', 'com o piloto'], ['8.750', 'rpm (limite)'], ['6 marchas', 'câmbio sequencial'], ['1 modelo', 'todos os carros iguais']]
};

/* IMSA: protótipo genérico da classe GTP (assets/img/cat/imsa.jpg, imagem gerada, sem equipe nem marca). Regras de 2026 */
window.ANATOMIA_IMSA = {
  foto: 'assets/img/cat/imsa.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'hibrido', x: 4, y: 52, nome: 'Híbrido', numero: '50 kW',
      texto: 'Nos carros feitos pela regra LMDh, o sistema híbrido é igual para todos: um motor elétrico de 50 kW junto do câmbio, que recupera energia nas freadas e devolve na aceleração.' },
    { id: 'asa', x: 8, y: 32, nome: 'Asa traseira', numero: 'larga e baixa',
      texto: 'A asa larga segura a traseira nas curvas. Em pistas de alta velocidade, como Daytona, ela fica mais baixa para o carro ganhar velocidade nas retas.' },
    { id: 'motor', x: 14, y: 45, nome: 'Motor', numero: 'cada marca o seu',
      texto: 'Cada fábrica usa o seu motor, quase sempre V6 ou V8 com turbo. Somando o motor e a parte elétrica, o limite é de 500 kW, perto de 680 cavalos.' },
    { id: 'pneu', x: 24, y: 60, nome: 'Pneus', numero: 'Michelin',
      texto: 'Todos usam pneus Michelin. Nas corridas longas, os pneus muitas vezes aguentam mais de um turno seguido, e economizar pneu vira estratégia.' },
    { id: 'barbatana', x: 32, y: 20, nome: 'Barbatana', numero: 'estabilidade',
      texto: 'A barbatana em cima do carro ajuda a mantê-lo reto e diminui o risco de ele levantar voo se rodar em alta velocidade.' },
    { id: 'farol', x: 37, y: 57, nome: 'Faróis', numero: 'de LED',
      texto: 'As corridas longas, como as 24 Horas de Daytona e as 12 Horas de Sebring, entram pela noite. Os faróis de LED iluminam a pista e ajudam a reconhecer cada carro no escuro.' },
    { id: 'entrada', x: 38, y: 25, nome: 'Entrada de ar', numero: 'no teto',
      texto: 'A entrada no teto leva ar fresco para o motor, que fica atrás do piloto.' },
    { id: 'classes', x: 45, y: 10, nome: '4 classes', numero: 'juntas na pista',
      texto: 'No IMSA, quatro classes correm juntas: os protótipos GTP e LMP2 e os carros GT das classes GTD Pro e GTD. Os protótipos precisam passar os GTs o tempo todo, o que deixa a corrida cheia de ultrapassagens.' },
    { id: 'cockpit', x: 50, y: 35, nome: 'Cockpit fechado', numero: '3 ou 4 pilotos',
      texto: 'O cockpit é fechado, com teto e para-brisa. Nas corridas longas, três ou quatro pilotos dividem o mesmo carro e se revezam ao volante.' },
    { id: 'bico', x: 70, y: 72, nome: 'Bico', numero: 'gruda no chão',
      texto: 'O bico e o fundo do carro aceleram o ar por baixo e puxam o carro contra o asfalto, dando aderência nas curvas rápidas.' }
  ],
  ficha: [['500 kW', '≈ 680 cv (máximo)'], ['1.030 kg', 'peso mínimo (sem piloto)'], ['4 classes', 'na pista ao mesmo tempo'], ['24 horas', 'em Daytona'], ['50 kW', 'híbrido padrão (LMDh)']]
};

/* WRC: carro de rali genérico (assets/img/cat/rally.jpg, imagem gerada, sem equipe nem marca). Carro Rally1 de 2026, sem híbrido */
window.ANATOMIA_WRC = {
  foto: 'assets/img/cat/rally.jpg', w: 1344, h: 752,
  pecas: [
    { id: 'terra', x: 35, y: 68, nome: 'Piso', numero: 'terra, neve, asfalto',
      texto: 'O rali corre em estradas fechadas, cada etapa num tipo de chão: terra, cascalho, neve, gelo ou asfalto. O carro é acertado de um jeito diferente para cada um.' },
    { id: 'suspensao', x: 37, y: 57, nome: 'Suspensão', numero: 'curso longo',
      texto: 'A suspensão tem um curso muito longo para aguentar saltos, buracos e valetas. Nos saltos, o carro pode voar dezenas de metros e cair sem quebrar.' },
    { id: 'asa', x: 40, y: 35, nome: 'Asa traseira', numero: 'segura nos saltos',
      texto: 'A asa traseira gera pressão nas curvas rápidas e ajuda a manter o carro reto e equilibrado quando ele está no ar.' },
    { id: 'cockpit', x: 49, y: 38, nome: 'Navegador', numero: '2 a bordo',
      texto: 'No banco do lado vai o navegador, que lê as notas da estrada em voz alta: o tipo de curva, a distância até a próxima e os perigos. O piloto confia nele de olhos fechados.' },
    { id: 'pneu', x: 54, y: 65, nome: 'Pneus', numero: 'um tipo por piso',
      texto: 'Há pneus para terra, para asfalto e para neve. Nos ralis de neve, os pneus têm pregos de metal para agarrar no gelo.' },
    { id: 'entrada', x: 58, y: 34.5, nome: 'Entrada de ar', numero: 'no teto',
      texto: 'A entrada no teto manda ar fresco para dentro do carro. Com tanta poeira e calor, a cabine precisa de ventilação.' },
    { id: 'motor', x: 62, y: 48, nome: 'Motor', numero: '1.6 turbo',
      texto: 'É um motor pequeno, de 1,6 litro com turbo, mas muito forte: perto de 330 cavalos num carro compacto, com tração nas 4 rodas.' },
    { id: 'farol', x: 63, y: 55, nome: 'Faróis', numero: 'de LED',
      texto: 'Alguns trechos passam por florestas escuras ou são disputados no começo da manhã. Nos ralis noturnos, o carro ainda leva um painel extra de faróis no capô.' },
    { id: 'protecao', x: 70, y: 72, nome: 'Proteção', numero: 'embaixo do carro',
      texto: 'Embaixo do carro há placas grossas de proteção, que aguentam pancadas em pedras e protegem o motor e o câmbio.' },
    { id: 'parachoque', x: 78, y: 62, nome: 'Para-choque', numero: 'entradas de ar',
      texto: 'As aberturas grandes no para-choque levam ar para o radiador, o intercooler do turbo e os freios.' }
  ],
  ficha: [['≈ 330 cv', 'motor 1.6 turbo'], ['4x4', 'tração nas 4 rodas'], ['5 marchas', 'câmbio sequencial'], ['2 a bordo', 'piloto e navegador'], ['3 pisos', 'terra, neve e asfalto']]
};
