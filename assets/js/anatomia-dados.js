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
