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
