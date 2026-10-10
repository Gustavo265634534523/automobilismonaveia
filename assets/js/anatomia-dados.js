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
