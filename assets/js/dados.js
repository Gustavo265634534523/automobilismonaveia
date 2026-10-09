/* Dados das categorias. Atualizado em 27/09/2026.
   Para atualizar: troque os valores abaixo. Datas no formato AAAA-MM-DD.
   Uma etapa com "venc" (vencedor) aparece como encerrada. Sem "d", a data fica "a confirmar". */

window.ATUALIZADO = '9 de outubro de 2026';
/* Horários das sessões (s) sempre no horário de Brasília. */
window.YOUTUBE = 'https://www.youtube.com/@EsporteNaVeia';

window.CATEGORIAS = [
{
  slug: 'formula-1', nome: 'Fórmula 1', menu: 'Fórmula 1', principal: true,
  foto: 'assets/img/cat/f1.jpg',
  frase: 'O piloto encontra o limite a 340 km/h.',
  intro: 'Vinte e dois carros, mil cavalos em cada um. Na freada do fim da reta, o corpo pesa cinco vezes mais e o pé direito ainda espera o último metro. A Fórmula 1 decide campeonatos em milésimos.',
  lider: { nome: 'Kimi Antonelli', info: 'Mercedes, 320 pontos' },
  noticias: [
    { d: '2026-09-26', t: 'Russell segura Verstappen e vence em Baku', x: 'George Russell ganhou o GP do Azerbaijão com 0s196 de vantagem sobre Max Verstappen, numa corrida com dois safety cars e seis abandonos. Antonelli saiu de 16º, chegou em quinto e ainda lidera por 66 pontos.' },
    { d: '2026-09-26', t: 'Colapinto causa batida tripla na relargada', x: 'O argentino errou a freada na curva 1 e acertou Pierre Gasly, que levou junto Lando Norris. Norris pediu gancho de uma corrida para o piloto da Alpine.' },
    { d: '2026-09-26', t: 'Bortoleto perde duas posições com punição', x: 'O brasileiro da Audi recebeu 10 segundos por ultrapassar sob bandeira amarela e caiu de 13º para 15º. A FIA admitiu que fiscais mostraram placas de safety car por engano.' },
    { d: '2026-09-25', t: 'Russell crava a pole em Baku', x: 'George Russell marcou 1:42.526 e largou na frente no Azerbaijão, 0s837 à frente de Charles Leclerc. Antonelli bateu no Q1 e largou em 16º.' }
  ],
  destaque: {
    titulo: 'Resultado do GP do Bahrein em Sepang',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Tempo/Diferença'],
    linhas: [
      ['1', 'Max Verstappen', 'Red Bull', '1:47:14.808'], ['2', 'Kimi Antonelli', 'Mercedes', '+2.307'],
      ['3', 'Lewis Hamilton', 'Ferrari', '+4.919'], ['4', 'Charles Leclerc', 'Ferrari', '+7.258'],
      ['5', 'Isack Hadjar', 'Red Bull', '+8.571'], ['6', 'Oscar Piastri', 'McLaren', '+9.454'],
      ['7', 'Liam Lawson', 'Racing Bulls', '+12.753'], ['8', 'Fernando Alonso', 'Aston Martin', '+13.372'],
      ['9', 'Lando Norris', 'McLaren', '—'], ['10', 'Arvid Lindblad', 'Racing Bulls', '—']
    ]
  },
  calendario: [
    { e: 1, n: 'GP da Austrália', l: 'Melbourne', d: '2026-03-08', venc: 'George Russell (Mercedes)' },
    { e: 2, n: 'GP da China', l: 'Xangai', d: '2026-03-15', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 3, n: 'GP do Japão', l: 'Suzuka', d: '2026-03-29', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 4, n: 'GP de Miami', l: 'Miami', d: '2026-05-03', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 5, n: 'GP do Canadá', l: 'Montreal', d: '2026-05-24', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 6, n: 'GP de Mônaco', l: 'Monte Carlo', d: '2026-06-07', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 7, n: 'GP de Barcelona', l: 'Montmeló', d: '2026-06-14', venc: 'Lewis Hamilton (Ferrari)' },
    { e: 8, n: 'GP da Áustria', l: 'Spielberg', d: '2026-06-28', venc: 'George Russell (Mercedes)' },
    { e: 9, n: 'GP da Inglaterra', l: 'Silverstone', d: '2026-07-05', venc: 'Charles Leclerc (Ferrari)' },
    { e: 10, n: 'GP da Bélgica', l: 'Spa-Francorchamps', d: '2026-07-19', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 11, n: 'GP da Hungria', l: 'Budapeste', d: '2026-07-26', venc: 'Lando Norris (McLaren)' },
    { e: 12, n: 'GP da Holanda', l: 'Zandvoort', d: '2026-08-23', venc: 'Lando Norris (McLaren)' },
    { e: 13, n: 'GP da Itália', l: 'Monza', d: '2026-09-06', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 14, n: 'GP da Espanha', l: 'Madri', d: '2026-09-13', venc: 'Kimi Antonelli (Mercedes)' },
    { e: 15, n: 'GP do Azerbaijão', l: 'Baku', d: '2026-09-26', s: [{ t: 'Treino livre 1', d: '2026-09-24', h: '05:30' }, { t: 'Treino livre 2', d: '2026-09-24', h: '09:00' }, { t: 'Treino livre 3', d: '2026-09-25', h: '05:30' }, { t: 'Classificação', d: '2026-09-25', h: '09:00' }, { t: 'Corrida', d: '2026-09-26', h: '08:00' }], venc: 'George Russell (Mercedes)' },
    { e: 16, n: 'GP do Bahrein', l: 'Sepang (Malásia)', d: '2026-10-04', nota: 'transferido do Bahrein para a Malásia', s: [{ t: 'Treino livre 1', d: '2026-10-02', h: '01:30' }, { t: 'Treino livre 2', d: '2026-10-02', h: '05:00' }, { t: 'Treino livre 3', d: '2026-10-03', h: '01:30' }, { t: 'Classificação', d: '2026-10-03', h: '05:00' }, { t: 'Corrida', d: '2026-10-04', h: '04:00' }], venc: 'Max Verstappen (Red Bull)' },
    { e: 17, n: 'GP de Singapura', l: 'Marina Bay', d: '2026-10-11', nota: 'primeiro fim de semana de sprint em Singapura', s: [{ t: 'Treino livre 1', d: '2026-10-09', h: '05:30' }, { t: 'Classificação sprint', d: '2026-10-09', h: '09:30' }, { t: 'Sprint', d: '2026-10-10', h: '06:00' }, { t: 'Classificação', d: '2026-10-10', h: '10:00' }, { t: 'Corrida', d: '2026-10-11', h: '09:00' }] },
    { e: 18, n: 'GP dos Estados Unidos', l: 'Austin', d: '2026-10-25' },
    { e: 19, n: 'GP da Cidade do México', l: 'Hermanos Rodríguez', d: '2026-11-01' },
    { e: 20, n: 'GP de São Paulo', l: 'Interlagos', d: '2026-11-08' },
    { e: 21, n: 'GP de Las Vegas', l: 'Las Vegas', d: '2026-11-21' },
    { e: 22, n: 'GP do Catar', l: 'Lusail', d: '2026-11-29' },
    { e: 23, n: 'GP de Abu Dhabi', l: 'Yas Marina', d: '2026-12-06' }
  ],
  classificacao: {
    titulo: 'Pilotos',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [
      ['1', 'Kimi Antonelli', 'Mercedes', '320'], ['2', 'George Russell', 'Mercedes', '236'],
      ['3', 'Lewis Hamilton', 'Ferrari', '214'], ['4', 'Charles Leclerc', 'Ferrari', '191'],
      ['5', 'Lando Norris', 'McLaren', '188'], ['6', 'Max Verstappen', 'Red Bull', '188'],
      ['7', 'Oscar Piastri', 'McLaren', '128'], ['8', 'Isack Hadjar', 'Red Bull', '96'],
      ['9', 'Liam Lawson', 'Racing Bulls', '65'], ['10', 'Pierre Gasly', 'Alpine', '41'],
      ['11', 'Arvid Lindblad', 'Racing Bulls', '38'], ['12', 'Franco Colapinto', 'Alpine', '27'],
      ['13', 'Oliver Bearman', 'Haas', '20'], ['14', 'Gabriel Bortoleto', 'Audi', '10'],
      ['15', 'Nico Hülkenberg', 'Audi', '7'], ['16', 'Esteban Ocon', 'Haas', '7'],
      ['17', 'Carlos Sainz', 'Williams', '7'], ['18', 'Fernando Alonso', 'Aston Martin', '7'],
      ['19', 'Alexander Albon', 'Williams', '5'], ['20', 'Yuki Tsunoda', 'Racing Bulls', '1'],
      ['21', 'Lance Stroll', 'Aston Martin', '0'], ['22', 'Valtteri Bottas', 'Cadillac', '0'],
      ['23', 'Sergio Pérez', 'Cadillac', '0']
    ],
    extra: {
      titulo: 'Construtores',
      colunas: ['Pos', 'Equipe', 'Pts'],
      linhas: [['1', 'Mercedes', '556'], ['2', 'Ferrari', '405'], ['3', 'McLaren', '316'], ['4', 'Red Bull', '257'], ['5', 'Racing Bulls', '92'], ['6', 'Alpine', '68'], ['7', 'Haas', '27'], ['8', 'Audi', '17'], ['9', 'Williams', '12'], ['10', 'Aston Martin', '7'], ['11', 'Cadillac', '0']]
    }
  },
  equipes: [
    { n: 'Mercedes', i: 'Motor Mercedes', p: ['Kimi Antonelli', 'George Russell'] },
    { n: 'Ferrari', i: 'Motor Ferrari', p: ['Lewis Hamilton', 'Charles Leclerc'] },
    { n: 'McLaren', i: 'Motor Mercedes', p: ['Lando Norris', 'Oscar Piastri'] },
    { n: 'Red Bull', i: 'Motor Red Bull Ford', p: ['Max Verstappen', 'Isack Hadjar'] },
    { n: 'Racing Bulls', i: 'Motor Red Bull Ford', p: ['Liam Lawson', 'Arvid Lindblad'] },
    { n: 'Alpine', i: 'Motor Mercedes', p: ['Pierre Gasly', 'Franco Colapinto'] },
    { n: 'Haas', i: 'Motor Ferrari', p: ['Oliver Bearman', 'Esteban Ocon'] },
    { n: 'Audi', i: 'Motor Audi', p: ['Gabriel Bortoleto', 'Nico Hülkenberg'] },
    { n: 'Williams', i: 'Motor Mercedes', p: ['Carlos Sainz', 'Alexander Albon'] },
    { n: 'Aston Martin', i: 'Motor Honda', p: ['Fernando Alonso', 'Lance Stroll'] },
    { n: 'Cadillac', i: 'Motor Ferrari', p: ['Valtteri Bottas', 'Sergio Pérez'] }
  ],
  videos: ['Fórmula 1 2026 melhores momentos', 'GP do Azerbaijão 2026 classificação', 'Kimi Antonelli 2026 onboard']
},
{
  slug: 'formula-2', nome: 'Fórmula 2', menu: 'Fórmula 2',
  foto: 'assets/img/cat/f2.jpg',
  frase: 'A última porta antes da Fórmula 1.',
  intro: 'Carro igual, pneu igual, motor igual. Sobra o piloto. Na Fórmula 2, quem freia depois ganha contrato. O brasileiro Rafael Câmara lidera a temporada por sete pontos.',
  lider: { nome: 'Rafael Câmara', info: 'Invicta, 7 pontos à frente' },
  noticias: [
    { d: '2026-09-26', t: 'Câmara herda a vitória e abre sete pontos', x: 'Alex Dunne cruzou em primeiro na principal 2 de Baku, mas levou 5 segundos por passar da linha na entrada dos boxes. Rafael Câmara ficou com a vitória e agora lidera com sete pontos sobre Nikola Tsolov.' },
    { d: '2026-09-25', t: 'Câmara passa na linha e assume a liderança', x: 'Na última volta da corrida principal em Baku, o brasileiro passou Noel León na linha de chegada, fechou em quarto e tomou a ponta de Nikola Tsolov por um ponto.' },
    { d: '2026-09-25', t: 'Dunne vence em Baku e entra na briga', x: 'Alex Dunne dominou a corrida principal depois de uma bandeira vermelha na largada e chegou a 174 pontos. Tsolov saiu num acidente com vários carros.' },
    { d: '2026-09-13', t: 'Beganovic vence em Madri', x: 'O sueco da DAMS ganhou a corrida principal no circuito novo de Madring, um dia depois de Ritomo Miyata levar a sprint.' }
  ],
  calendario: [
    { e: 1, n: 'Austrália', l: 'Albert Park', d: '2026-03-08', venc: 'Sprint: Joshua Dürksen. Principal: Nikola Tsolov' },
    { e: 2, n: 'Miami', l: 'Miami', d: '2026-05-03', venc: 'Sprint: Nikola Tsolov. Principal: Gabriele Minì' },
    { e: 3, n: 'Canadá', l: 'Montreal', d: '2026-05-24', venc: 'Sprint: Noel León. Principal: Martinius Stenshorne' },
    { e: 4, n: 'Mônaco', l: 'Monte Carlo', d: '2026-06-07', venc: 'Sprint: Noel León. Principal: Nikola Tsolov' },
    { e: 5, n: 'Barcelona', l: 'Montmeló', d: '2026-06-14', venc: 'Sprint: Kush Maini. Principal: Rafael Câmara' },
    { e: 6, n: 'Áustria', l: 'Spielberg', d: '2026-06-28', venc: 'Sprint: John Bennett. Principal: Nikola Tsolov' },
    { e: 7, n: 'Inglaterra', l: 'Silverstone', d: '2026-07-05', venc: 'Sprint: Nikola Tsolov. Principal: Nikola Tsolov' },
    { e: 8, n: 'Bélgica', l: 'Spa-Francorchamps', d: '2026-07-19', venc: 'Sprint: Joshua Dürksen. Principal: Rafael Câmara' },
    { e: 9, n: 'Hungria', l: 'Hungaroring', d: '2026-07-26', venc: 'Sprint: Gabriele Minì. Principal: Noel León' },
    { e: 10, n: 'Itália', l: 'Monza', d: '2026-09-06', venc: 'Sprint: Joshua Dürksen. Principal: Joshua Dürksen' },
    { e: 11, n: 'Espanha', l: 'Madring', d: '2026-09-13', venc: 'Sprint: Ritomo Miyata. Principal: Dino Beganovic' },
    { e: 12, n: 'Azerbaijão', l: 'Baku', d: '2026-09-26', venc: 'Sprint: Dino Beganovic. Principal 1: Alex Dunne. Principal 2: Rafael Câmara' },
    { e: 13, n: 'Catar', l: 'Lusail', d: '2026-11-29', nota: 'data a confirmar' },
    { e: 14, n: 'Abu Dhabi', l: 'Yas Marina', d: '2026-12-06', nota: 'data a confirmar' }
  ],
  classificacao: {
    titulo: 'Pilotos (após Baku)',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [['1', 'Rafael Câmara', 'Invicta Racing', '207'], ['2', 'Nikola Tsolov', 'Campos Racing', '200'], ['3', 'Alex Dunne', 'Rodin Motorsport', '189'], ['4', 'Gabriele Minì', 'MP Motorsport', '163'], ['5', 'Dino Beganovic', 'DAMS Lucas Oil', '137'], ['6', 'Noel León', 'Campos Racing', '133'], ['7', 'Martinius Stenshorne', 'Rodin Motorsport', '107'], ['8', 'Joshua Dürksen', 'Invicta Racing', '90'], ['9', 'Kush Maini', 'ART Grand Prix', '90'], ['10', 'Laurens van Hoepen', 'Trident', '90'], ['11', 'Tasanapol Inthraphuvasak', 'ART Grand Prix', '71'], ['12', 'Ritomo Miyata', 'Hitech', '70'], ['13', 'Rafael Villagómez', 'Van Amersfoort Racing', '42'], ['14', 'John Bennett', 'Trident', '38'], ['15', 'Oliver Goethe', 'MP Motorsport', '37'], ['16', 'Roman Bilinski', 'DAMS Lucas Oil', '36'], ['17', 'Sebastián Montoya', 'Prema Racing', '30'], ['18', 'Emerson Fittipaldi Jr.', 'AIX Racing', '28'], ['19', 'Colton Herta', 'Hitech', '26'], ['20', 'Mari Boya', 'Prema Racing', '21'], ['21', 'Nicolás Varrone', 'Van Amersfoort Racing', '15'], ['22', 'Cian Shields', 'AIX Racing', '10']],
    extra: { titulo: 'Equipes', colunas: ['Pos', 'Equipe', 'Pts'], linhas: [['1', 'Campos Racing', '310'], ['2', 'Invicta Racing', '272'], ['3', 'Rodin Motorsport', '267'], ['4', 'MP Motorsport', '198'], ['5', 'DAMS Lucas Oil', '166']] }
  },
  equipes: [
    { n: 'Invicta Racing', p: ['Rafael Câmara', 'Joshua Dürksen'] },
    { n: 'Campos Racing', p: ['Nikola Tsolov', 'Noel León'] },
    { n: 'Rodin Motorsport', p: ['Alex Dunne', 'Martinius Stenshorne'] },
    { n: 'MP Motorsport', p: ['Gabriele Minì', 'Oliver Goethe'] },
    { n: 'DAMS Lucas Oil', p: ['Dino Beganovic', 'Roman Bilinski'] },
    { n: 'ART Grand Prix', p: ['Kush Maini', 'Tasanapol Inthraphuvasak'] },
    { n: 'Hitech', p: ['Ritomo Miyata', 'Colton Herta'] },
    { n: 'Prema Racing', p: ['Sebastián Montoya', 'Mari Boya'] },
    { n: 'Trident', p: ['Laurens van Hoepen', 'John Bennett', 'Rafael Villagómez'] },
    { n: 'AIX Racing', p: ['Emerson Fittipaldi Jr.', 'Cian Shields'] },
    { n: 'Van Amersfoort Racing', p: ['Hiyu Yamakoshi', 'Nico Varrone'] }
  ],
  videos: ['Fórmula 2 2026 Baku corrida principal', 'Rafael Câmara F2 2026', 'Fórmula 2 2026 melhores momentos']
},
{
  slug: 'formula-3', nome: 'Fórmula 3', menu: 'Fórmula 3',
  foto: 'assets/img/cat/f3.jpg',
  frase: 'Trinta carros disputam a mesma curva.',
  intro: 'A Fórmula 3 junta trinta jovens num pelotão em que ninguém cede um centímetro. Largada lotada, roda com roda até a bandeirada. Ugo Ugochukwu saiu de Madri com o título.',
  lider: { nome: 'Ugo Ugochukwu', info: 'Campeão 2026, Campos, 159 pontos' },
  noticias: [
    { d: '2026-09-13', t: 'Ugochukwu é campeão em Madri', x: 'O piloto da Campos chegou em segundo na última corrida e fechou o ano com 159 pontos, 14 à frente de Freddie Slater.' },
    { d: '2026-09-13', t: 'Campos leva também o título de equipes', x: 'Ugochukwu, Théophile Naël e Ernesto Rivera terminaram entre os quatro primeiros e deram à Campos a dobradinha de títulos.' },
    { d: '2026-07-26', t: 'Slater vence na Hungria e encosta', x: 'A vitória no Hungaroring colocou o piloto da Trident na briga direta pelo título até a última etapa.' }
  ],
  calendario: [
    { e: 1, n: 'Austrália', l: 'Albert Park', d: '2026-03-08', venc: 'Sprint: Bruno del Pino. Principal: Ugo Ugochukwu' },
    { e: 2, n: 'Mônaco', l: 'Monte Carlo', d: '2026-06-07', venc: 'Sprint: Gerrard Xie. Principal: Brando Badoer' },
    { e: 3, n: 'Barcelona', l: 'Montmeló', d: '2026-06-14', venc: 'Sprint: James Wharton. Principal: Théophile Naël' },
    { e: 4, n: 'Áustria', l: 'Spielberg', d: '2026-06-28', venc: 'Sprint: Ernesto Rivera. Principal: Noah Strømsted' },
    { e: 5, n: 'Inglaterra', l: 'Silverstone', d: '2026-07-05', venc: 'Sprint: Ugo Ugochukwu. Principal: Maciej Gładysz' },
    { e: 6, n: 'Bélgica', l: 'Spa-Francorchamps', d: '2026-07-19', venc: 'Sprint: Jin Nakamura. Principal: Ernesto Rivera' },
    { e: 7, n: 'Hungria', l: 'Hungaroring', d: '2026-07-26', venc: 'Sprint: Théophile Naël. Principal: Freddie Slater' },
    { e: 8, n: 'Itália', l: 'Monza', d: '2026-09-06', venc: 'Sprint: Taito Kato. Principal: Nicola Lacorte' },
    { e: 9, n: 'Espanha', l: 'Madring', d: '2026-09-13', venc: 'Sprint: Théophile Naël. Principal 2: Tuukka Taponen' }
  ],
  classificacao: {
    titulo: 'Pilotos (final)',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [
      ['1', 'Ugo Ugochukwu', 'Campos Racing', '159'], ['2', 'Freddie Slater', 'Trident', '145'],
      ['3', 'Tuukka Taponen', 'MP Motorsport', '109'], ['4', 'Taito Kato', 'ART Grand Prix', '105'],
      ['5', 'Théophile Naël', 'Campos Racing', '88'], ['6', 'Pedro Clerot', 'Rodin Motorsport', '88'],
      ['7', 'Ernesto Rivera', 'Campos Racing', '87'], ['8', 'Brando Badoer', 'Rodin Motorsport', '71'],
      ['9', 'Hiyu Yamakoshi', 'Van Amersfoort Racing', '71'], ['10', 'Noah Strømsted', 'Trident', '65']
    ],
    extra: { titulo: 'Equipes', colunas: ['Pos', 'Equipe', 'Pts'], linhas: [['1', 'Campos Racing', '334'], ['2', 'Trident', '217']] },
    nota: 'Naël fica na 5ª posição na frente de Clerot por critério de desempate, com os mesmos 88 pontos.'
  },
  equipes: [
    { n: 'Campos Racing', i: 'Campeã de equipes 2026', p: ['Ugo Ugochukwu', 'Théophile Naël', 'Ernesto Rivera'] },
    { n: 'Trident', p: ['Freddie Slater', 'Noah Strømsted', 'Matteo De Palo'] },
    { n: 'MP Motorsport', p: ['Tuukka Taponen', 'Mattia Colnaghi', 'Alessandro Giusti'] },
    { n: 'ART Grand Prix', p: ['Taito Kato', 'Maciej Gładysz', 'Kanato Le'] }
  ],
  videos: ['Fórmula 3 2026 Madri final', 'Ugo Ugochukwu campeão F3 2026', 'Fórmula 3 2026 melhores momentos']
},
{
  slug: 'formula-e', nome: 'Fórmula E', menu: 'Fórmula E',
  foto: 'assets/img/cat/fe.jpg',
  frase: 'Silêncio. Depois, o chicote do torque.',
  intro: 'Sem ronco, sobra o assobio do motor elétrico e o pneu raspando no muro. A Fórmula E corre no centro das cidades e decide a vitória na energia que resta na última volta. Pascal Wehrlein fechou a temporada 12 como campeão.',
  lider: { nome: 'Pascal Wehrlein', info: 'Campeão da temporada 12, Porsche' },
  noticias: [
    { d: '2026-08-16', t: 'Wehrlein é campeão em Londres', x: 'O alemão da Porsche venceu a corrida de sábado no ExCeL e fechou a temporada como campeão. A Porsche levou o campeonato de marcas e a Jaguar o de equipes.' },
    { d: '2026-08-16', t: 'Barnard vence a última da era Gen3', x: 'Taylor Barnard ganhou a corrida de domingo em Londres, à frente de Nyck de Vries e Edoardo Mortara. Foi a despedida do carro Gen3.' },
    { d: '2026-07-26', t: 'De Vries vence de novo em Tóquio', x: 'Terceira vitória do holandês da Mahindra na temporada, depois de Madri e Mônaco.' }
  ],
  calendario: [
    { e: 1, n: 'São Paulo E-Prix', l: 'Anhembi', d: '2025-12-06', venc: 'Jake Dennis' },
    { e: 2, n: 'Cidade do México E-Prix', l: 'Hermanos Rodríguez', d: '2026-01-10', venc: 'Nick Cassidy' },
    { e: 3, n: 'Miami E-Prix', l: 'Homestead', d: '2026-01-31', venc: 'Mitch Evans' },
    { e: 4, n: 'Jeddah E-Prix 1', l: 'Jeddah', d: '2026-02-13', venc: 'Pascal Wehrlein' },
    { e: 5, n: 'Jeddah E-Prix 2', l: 'Jeddah', d: '2026-02-14', venc: 'António Félix da Costa' },
    { e: 6, n: 'Madri E-Prix', l: 'Jarama', d: '2026-03-21', venc: 'Nyck de Vries' },
    { e: 7, n: 'Berlim E-Prix 1', l: 'Tempelhof', d: '2026-05-02', venc: 'Nico Müller' },
    { e: 8, n: 'Berlim E-Prix 2', l: 'Tempelhof', d: '2026-05-03', venc: 'Mitch Evans' },
    { e: 9, n: 'Mônaco E-Prix 1', l: 'Monte Carlo', d: '2026-05-16', venc: 'Nyck de Vries' },
    { e: 10, n: 'Mônaco E-Prix 2', l: 'Monte Carlo', d: '2026-05-17', venc: 'Oliver Rowland' },
    { e: 11, n: 'Sanya E-Prix', l: 'Sanya', d: '2026-06-20', venc: 'Jake Dennis' },
    { e: 12, n: 'Xangai E-Prix 1', l: 'Xangai', d: '2026-07-04', venc: 'Pascal Wehrlein' },
    { e: 13, n: 'Xangai E-Prix 2', l: 'Xangai', d: '2026-07-05', venc: 'Lucas di Grassi' },
    { e: 14, n: 'Tóquio E-Prix 1', l: 'Tóquio', d: '2026-07-25', venc: 'Dan Ticktum' },
    { e: 15, n: 'Tóquio E-Prix 2', l: 'Tóquio', d: '2026-07-26', venc: 'Nyck de Vries' },
    { e: 16, n: 'Londres E-Prix 1', l: 'ExCeL', d: '2026-08-15', venc: 'Pascal Wehrlein' },
    { e: 17, n: 'Londres E-Prix 2', l: 'ExCeL', d: '2026-08-16', venc: 'Taylor Barnard' }
  ],
  classificacao: {
    titulo: 'Pilotos (final da temporada 12)',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [
      ['1', 'Pascal Wehrlein', 'Porsche', '169'], ['2', 'Jake Dennis', 'Andretti', '164'],
      ['3', 'Mitch Evans', 'Jaguar TCS Racing', '160'], ['4', 'Oliver Rowland', 'Nissan', '137'],
      ['5', 'Edoardo Mortara', 'Mahindra', '137'], ['6', 'António Félix da Costa', 'Jaguar TCS Racing', '128'],
      ['7', 'Nyck de Vries', 'Mahindra', '115'], ['8', 'Nick Cassidy', 'Citroën Racing', '114'],
      ['9', 'Nico Müller', 'Porsche', '102'], ['10', 'Sébastien Buemi', 'Envision Racing', '97']
    ],
    extra: { titulo: 'Equipes', colunas: ['Pos', 'Equipe', 'Pts'], linhas: [['1', 'Jaguar TCS Racing', '288']] },
    nota: 'Campeã de equipes: Jaguar TCS Racing, com 288 pontos. Campeã de marcas (fabricantes): Porsche, título garantido antes da última corrida. Rowland e Mortara terminaram empatados em pontos; Rowland fica na 4ª posição por critério de desempate.'
  },
  equipes: [
    { n: 'Porsche', i: 'Campeã de marcas', p: ['Pascal Wehrlein', 'Nico Müller'] },
    { n: 'Jaguar TCS Racing', i: 'Campeã de equipes', p: ['Mitch Evans', 'António Félix da Costa'] },
    { n: 'Andretti', p: ['Jake Dennis', 'Felipe Drugovich'] },
    { n: 'DS Penske', p: ['Maximilian Günther', 'Taylor Barnard'] },
    { n: 'Nissan', p: ['Oliver Rowland', 'Norman Nato'] },
    { n: 'Citroën Racing', p: ['Jean-Éric Vergne', 'Nick Cassidy'] },
    { n: 'Mahindra Racing', p: ['Nyck de Vries', 'Edoardo Mortara'] },
    { n: 'Envision Racing', p: ['Sébastien Buemi', 'Joel Eriksson'] },
    { n: 'Lola Yamaha ABT', p: ['Lucas di Grassi', 'Zane Maloney'] },
    { n: 'Cupra Kiro', p: ['Dan Ticktum', 'Pepe Martí'] }
  ],
  videos: ['Fórmula E Londres 2026 melhores momentos', 'Pascal Wehrlein campeão Fórmula E', 'Fórmula E São Paulo E-Prix']
},
{
  slug: 'stock-car', nome: 'Stock Car', menu: 'Stock Car', principal: true,
  foto: 'assets/img/cat/stock.jpg',
  frase: 'Porta com porta, até a tinta sair.',
  intro: 'A Stock Car transforma o autódromo brasileiro em briga de rua com regulamento. Toque na traseira, pressão na curva, pit stop no grito. Felipe Fraga chega a Brasília com 141 pontos de vantagem.',
  lider: { nome: 'Felipe Fraga', info: 'Eurofarma RC, 746 pontos' },
  noticias: [
    { d: '2026-09-25', t: 'Brasília recebe a etapa de endurance', x: 'A 9ª etapa roda no Autódromo Nelson Piquet de 25 a 27 de setembro, em formato longo, junto com Stock Light, F4 e Turismo Nacional.' },
    { d: '2026-09-06', t: 'Léo Reis e César Ramos vencem em Curvelo', x: 'Na volta ao circuito mineiro, Léo Reis levou a primeira corrida e César Ramos a segunda. Fraga manteve a ponta.' },
    { d: '2026-06-30', t: 'Scuderia Bandeiras deixa o grid', x: 'A equipe saiu do campeonato depois de disputas com o regulamento e das desclassificações de Rubens Barrichello e Nelson Piquet Jr.' }
  ],
  calendario: [
    { e: 1, n: 'Etapa 1', l: 'Curvelo (MG)', d: '2026-03-08', venc: 'Felipe Fraga e Felipe Fraga' },
    { e: 2, n: 'Etapa 2', l: 'Cascavel (PR)', d: '2026-03-29', venc: 'Guilherme Salas e Nelson Piquet Jr.' },
    { e: 3, n: 'Etapa 3', l: 'Interlagos (SP)', d: '2026-04-26', venc: 'Léo Reis e Guilherme Salas' },
    { e: 4, n: 'Etapa 4', l: 'Goiânia (GO)', d: '2026-05-17', venc: 'Felipe Fraga e Gaetano di Mauro' },
    { e: 5, n: 'Etapa 5', l: 'Cuiabá (MT)', d: '2026-06-20', venc: 'Felipe Baptista e Nelson Piquet Jr.' },
    { e: 6, n: 'Etapa 6', l: 'Mogi Guaçu (SP)', d: '2026-07-26', venc: 'Gaetano di Mauro e Felipe Baptista' },
    { e: 7, n: 'Etapa 7', l: 'Santa Cruz do Sul (RS)', d: '2026-08-09', venc: 'Felipe Baptista e Felipe Fraga' },
    { e: 8, n: 'Etapa 8', l: 'Curvelo (MG)', d: '2026-09-06', venc: 'Léo Reis e César Ramos' },
    { e: 9, n: 'Etapa 9, endurance', l: 'Brasília (DF)', d: '2026-09-27', s: [{ t: 'Classificação', d: '2026-09-26', h: '14:15' }, { t: 'Warm-up', d: '2026-09-27', h: '09:15' }, { t: 'Corrida de 2 horas', d: '2026-09-27', h: '12:15' }], venc: 'Sérgio Sette Câmara e Lucas di Grassi' },
    { e: 10, n: 'Etapa 10, endurance', l: 'Goiânia (GO)', d: '2026-10-18', nota: 'primeira prova de endurance da história da Stock Car, 3 horas em duplas, no Autódromo Internacional de Goiânia' },
    { e: 11, n: 'Etapa 11', l: 'Velopark (RS)', d: '2026-11-15' },
    { e: 12, n: 'Final', l: 'Interlagos (SP)', d: '2026-12-13' }
  ],
  classificacao: {
    titulo: 'Pilotos (após 8 etapas)',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [['1', 'Felipe Fraga', 'Eurofarma RC', '746'], ['2', 'Gabriel Casagrande', 'AMattheis Vogel', '605'], ['3', 'Gaetano di Mauro', 'Eurofarma RC', '594'], ['4', 'Felipe Massa', 'TMG Racing', '532'], ['5', 'Rafael Suzuki', 'Scuderia Bandeiras', '524'], ['6', 'Guilherme Salas', 'Cavaleiro Sports', '518'], ['7', 'Sérgio Sette Câmara', 'RCM Motorsport', '515'], ['8', 'Enzo Elias', 'AMattheis TMG', '506'], ['9', 'Felipe Baptista', 'Sterling Racing', '499'], ['10', 'Arthur Leist', 'Crown Racing', '483'], ['11', 'César Ramos', 'Mercado Livre Racing', '471'], ['12', 'Júlio Campos', 'TMG Racing', '462'], ['13', 'Thiago Camilo', '—', '445'], ['14', 'Léo Reis', '—', '442'], ['15', 'Zezinho Muggiati', '—', '393']]
  },
  equipes: [
    { n: 'Eurofarma RC', p: ['Felipe Fraga', 'Gaetano di Mauro'] },
    { n: 'TMG Racing', p: ['Felipe Massa', 'Júlio Campos'] },
    { n: 'AMattheis Vogel', p: ['Gabriel Casagrande'] },
    { n: 'AMattheis TMG', p: ['Enzo Elias'] },
    { n: 'RCM Motorsport', p: ['Sérgio Sette Câmara'] },
    { n: 'Cavaleiro Sports', p: ['Guilherme Salas'] },
    { n: 'Sterling Racing', p: ['Felipe Baptista'] },
    { n: 'Mercado Livre Racing', p: ['César Ramos'] },
    { n: 'Crown Racing', p: ['Arthur Leist'] }
  ],
  videos: ['Stock Car 2026 melhores momentos', 'Stock Car Curvelo 2026', 'Felipe Fraga Stock Car 2026']
},
{
  slug: 'rally', nome: 'Rally', menu: 'WRC',
  foto: 'assets/img/cat/rally.jpg',
  frase: 'O carro voa. O copiloto continua lendo.',
  intro: 'Cascalho, neve, lama e asfalto. No rali, o piloto ataca uma estrada que conhece só pela voz do copiloto. Uma palavra trocada e o carro sai da estrada. Elfyn Evans lidera por 17 pontos antes da Sardenha.',
  lider: { nome: 'Elfyn Evans', info: 'Campeão mundial 2026, Toyota, 243 pontos' },
  noticias: [
    { d: '2026-09-13', t: 'Solberg vence no Chile', x: 'Oliver Solberg ganhou o Rally Chile e ficou a 21 pontos de Elfyn Evans. Três pilotos da Toyota chegam à Sardenha separados por 21 pontos.' },
    { d: '2026-08-30', t: 'Pajari fecha trinca no Paraguai', x: 'Sami Pajari venceu Estônia, Finlândia e Paraguai em sequência e subiu para segundo no campeonato.' },
    { d: '2026-09-13', t: 'Toyota é campeã de construtores pela sexta vez seguida', x: 'A Toyota Gazoo Racing chega à Sardenha com o título garantido e mais de 200 pontos sobre a Hyundai.' }
  ],
  calendario: [
    { e: 1, n: 'Rally Monte Carlo', l: 'Mônaco', d: '2026-01-25', venc: 'Oliver Solberg' },
    { e: 2, n: 'Rally da Suécia', l: 'Umeå', d: '2026-02-15', venc: 'Elfyn Evans' },
    { e: 3, n: 'Safari Rally', l: 'Quênia', d: '2026-03-15', venc: 'Takamoto Katsuta' },
    { e: 4, n: 'Rally da Croácia', l: 'Rijeka', d: '2026-04-12', venc: 'Takamoto Katsuta' },
    { e: 5, n: 'Rally Ilhas Canárias', l: 'Gran Canaria', d: '2026-04-26', venc: 'Sébastien Ogier' },
    { e: 6, n: 'Rally de Portugal', l: 'Matosinhos', d: '2026-05-10', venc: 'Thierry Neuville' },
    { e: 7, n: 'Rally do Japão', l: 'Toyota City', d: '2026-05-31', venc: 'Elfyn Evans' },
    { e: 8, n: 'Rally Acrópole', l: 'Grécia', d: '2026-06-28', venc: 'Sébastien Ogier' },
    { e: 9, n: 'Rally da Estônia', l: 'Tartu', d: '2026-07-19', venc: 'Sami Pajari' },
    { e: 10, n: 'Rally da Finlândia', l: 'Jyväskylä', d: '2026-08-02', venc: 'Sami Pajari' },
    { e: 11, n: 'Rally do Paraguai', l: 'Encarnación', d: '2026-08-30', venc: 'Sami Pajari' },
    { e: 12, n: 'Rally do Chile', l: 'Concepción', d: '2026-09-13', venc: 'Oliver Solberg' },
    { e: 13, n: 'Rally Itália Sardenha', l: 'Alghero', d: '2026-10-04', s: [{ t: 'Shakedown', d: '2026-10-01', h: '04:01' }, { t: 'Especial de abertura', d: '2026-10-01', h: '11:05' }, { t: 'Dia 2, primeira especial', d: '2026-10-02', h: '03:01' }, { t: 'Dia 3, primeira especial', d: '2026-10-03', h: '03:01' }, { t: 'Dia 4, primeira especial', d: '2026-10-04', h: '03:31' }, { t: 'Power Stage', d: '2026-10-04', h: '09:15' }], venc: 'Oliver Solberg' }
  ],
  classificacao: {
    titulo: 'Pilotos (final)',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [
      ['1', 'Elfyn Evans', 'Toyota', '243'], ['2', 'Oliver Solberg', 'Toyota', '238'], ['3', 'Sami Pajari', 'Toyota', '237'],
      ['4', 'Sébastien Ogier', 'Toyota', '189'], ['5', 'Adrien Fourmaux', 'Hyundai', '183'], ['6', 'Takamoto Katsuta', 'Toyota', '175'],
      ['7', 'Thierry Neuville', 'Hyundai', '134'], ['8', 'Hayden Paddon', 'Hyundai', '38'], ['9', 'Josh McErlean', 'M-Sport Ford', '35'],
      ['10', 'Esapekka Lappi', 'Hyundai', '33']
    ],
    nota: 'Classificação final da temporada. Elfyn Evans é campeão mundial de pilotos, o primeiro título da carreira, depois de Oliver Solberg sair da pista a duas curvas do fim da Power Stage em Sardenha. Construtores: Toyota Gazoo Racing campeã antecipada, 6º título seguido. O Rally da Arábia Saudita foi cancelado.'
  },
  equipes: [
    { n: 'Toyota Gazoo Racing', i: 'GR Yaris Rally1', p: ['Elfyn Evans', 'Sami Pajari', 'Oliver Solberg', 'Takamoto Katsuta', 'Sébastien Ogier'] },
    { n: 'Hyundai Shell Mobis', i: 'i20 N Rally1', p: ['Thierry Neuville', 'Adrien Fourmaux', 'Esapekka Lappi', 'Dani Sordo', 'Hayden Paddon'] },
    { n: 'M-Sport Ford', i: 'Puma Rally1', p: ['Josh McErlean', 'Jon Armstrong', 'Mārtiņš Sesks'] }
  ],
  videos: ['WRC 2026 Rally Chile melhores momentos', 'WRC 2026 Rally Finlândia saltos', 'WRC 2026 onboard']
},
{
  slug: 'endurance', nome: 'Endurance', menu: 'WEC',
  foto: 'assets/img/cat/endurance.jpg',
  frase: 'Seis horas, vinte e quatro horas. O relógio também corre.',
  intro: 'Três pilotos dividem o mesmo carro e trocam de lugar no escuro. Farol cortando a neblina de Le Mans, disco de freio em brasa às quatro da manhã. No Mundial de Endurance, terminar já é metade da vitória.',
  lider: { nome: 'Buemi, Hartley e Hirakawa', info: 'Toyota #8, 89 pontos' },
  noticias: [
    { d: '2026-09-27', t: 'Toyota #8 vence em casa e assume a liderança', x: 'Ryo Hirakawa, Sébastien Buemi e Brendon Hartley saíram de oitavo e venceram as 6 Horas de Fuji. O Alpine #36, que largou na pole, ficou em segundo e o BMW #15 completou o pódio.' },
    { d: '2026-09-06', t: 'Ferrari vence a Lone Star Le Mans', x: 'A Ferrari 499P #50 ganhou em Austin, no Circuito das Américas, e voltou ao topo do pódio depois de uma primeira metade de ano dominada por Toyota e BMW.' },
    { d: '2026-07-12', t: 'BMW vence as 6 Horas de São Paulo', x: 'O BMW #15 venceu em Interlagos. O carro irmão #20, de Robin Frijns e René Rast, segue na ponta do campeonato de pilotos.' },
    { d: '2026-06-14', t: 'Toyota #7 vence as 24 Horas de Le Mans', x: 'Kamui Kobayashi, Mike Conway e Nyck de Vries levaram a prova mais longa do calendário. As etapas do Catar e do Bahrein foram canceladas, e o campeonato termina em Monza.' }
  ],
  calendario: [
    { e: 1, n: '6 Horas de Ímola', l: 'Ímola', d: '2026-04-19', venc: 'Toyota #8' },
    { e: 2, n: '6 Horas de Spa', l: 'Spa-Francorchamps', d: '2026-05-09', venc: 'BMW #20' },
    { e: 3, n: '24 Horas de Le Mans', l: 'Le Mans', d: '2026-06-14', venc: 'Toyota #7' },
    { e: 4, n: '6 Horas de São Paulo', l: 'Interlagos', d: '2026-07-12', venc: 'BMW #15' },
    { e: 5, n: 'Lone Star Le Mans', l: 'Austin', d: '2026-09-06', venc: 'Ferrari #50' },
    { e: 6, n: '6 Horas de Fuji', l: 'Fuji', d: '2026-09-27', venc: 'Toyota #8' },
    { e: 7, n: '6 Horas de Barcelona', l: 'Montmeló', d: '2026-10-18' },
    { e: 8, n: '6 Horas de Monza', l: 'Monza', d: '2026-11-08' }
  ],
  classificacao: {
    titulo: 'Hypercar, pilotos',
    colunas: ['Pos', 'Pilotos', 'Carro', 'Pts'],
    linhas: [['1', 'Buemi, Hartley e Hirakawa', 'Toyota #8', '89'], ['2', 'Conway, Kobayashi e De Vries', 'Toyota #7', '79'], ['3', 'Rast e Frijns', 'BMW #20', '75'], ['4', 'Magnussen e Marciello', 'BMW #15', '69'], ['5', 'Pier Guidi, Calado e Giovinazzi', 'Ferrari #51', '59'], ['6', 'Milesi e Habsburg', 'Alpine #35', '56'], ['7', 'Fuoco, Molina e Nielsen', 'Ferrari #50', '54'], ['8', 'Nato e Stevens', 'Cadillac #12', '50']],
    nota: 'Após Fuji (etapa 6 de 8). Sheldon van der Linde (BMW #20) tem 65 pontos e Dries Vanthoor (BMW #15) tem 63, porque não fizeram todas as etapas.'
  },
  equipes: [
    { n: 'BMW M Team WRT', i: 'BMW M Hybrid V8', p: ['Robin Frijns', 'René Rast', 'Kevin Magnussen', 'Raffaele Marciello'] },
    { n: 'Toyota Racing', i: 'Toyota TR010 Hybrid', p: ['Mike Conway', 'Kamui Kobayashi', 'Nyck de Vries', 'Sébastien Buemi', 'Brendon Hartley', 'Ryō Hirakawa'] },
    { n: 'Ferrari AF Corse', i: 'Ferrari 499P', p: ['Antonio Fuoco', 'Miguel Molina', 'Nicklas Nielsen', 'James Calado', 'Antonio Giovinazzi'] },
    { n: 'Peugeot TotalEnergies', i: 'Peugeot 9X8', p: ['Nick Cassidy', 'Paul di Resta', 'Stoffel Vandoorne', 'Loïc Duval'] },
    { n: 'Genesis Magma Racing', i: 'Genesis GMR-001', p: ['Pipo Derani', 'André Lotterer', 'Paul-Loup Chatin', 'Mathieu Jaminet'] }
  ],
  videos: ['24 Horas de Le Mans 2026 melhores momentos', 'WEC 6 Horas de São Paulo 2026', 'WEC Hypercar 2026 onboard noite']
},
{
  slug: 'indycar', nome: 'IndyCar', menu: 'IndyCar',
  foto: 'assets/img/cat/indy.jpg',
  frase: 'Oval, 370 km/h, e o muro a um palmo.',
  intro: 'Na IndyCar, o carro raspa o concreto do oval dentro de um pelotão colado. Uma bolha de ar muda a corrida inteira. Álex Palou fechou 2026 com o quinto título, o quarto seguido.',
  lider: { nome: 'Álex Palou', info: 'Campeão 2026, Chip Ganassi' },
  noticias: [
    { d: '2026-09-06', t: 'Palou fecha o ano com o quinto título', x: 'O espanhol da Chip Ganassi terminou 86 pontos à frente de Kyle Kirkwood e emendou o quarto campeonato seguido. McLaughlin venceu a final em Monterey.' },
    { d: '2026-08-30', t: 'O\'Ward vence as duas em Milwaukee', x: 'Pato O\'Ward ganhou as duas corridas da rodada dupla no oval de uma milha e levou a rodada dupla inteira.' },
    { d: '2026-05-24', t: 'Rosenqvist vence a 110ª Indy 500', x: 'Felix Rosenqvist deu à Meyer Shank a vitória em Indianápolis.' }
  ],
  calendario: [
    { e: 1, n: 'GP de St. Petersburg', l: 'St. Petersburg', d: '2026-03-01', venc: 'Álex Palou' },
    { e: 2, n: 'Phoenix 250', l: 'Phoenix', d: '2026-03-07', venc: 'Josef Newgarden' },
    { e: 3, n: 'GP de Arlington', l: 'Arlington', d: '2026-03-15', venc: 'Kyle Kirkwood' },
    { e: 4, n: 'GP do Alabama', l: 'Barber', d: '2026-03-29', venc: 'Álex Palou' },
    { e: 5, n: 'GP de Long Beach', l: 'Long Beach', d: '2026-04-19', venc: 'Álex Palou' },
    { e: 6, n: 'GP de Indianápolis', l: 'Misto de Indy', d: '2026-05-09', venc: 'Christian Lundgaard' },
    { e: 7, n: '110ª Indy 500', l: 'Indianápolis', d: '2026-05-24', venc: 'Felix Rosenqvist' },
    { e: 8, n: 'GP de Detroit', l: 'Detroit', d: '2026-05-31', venc: 'Álex Palou' },
    { e: 9, n: 'Gateway 500', l: 'Madison', d: '2026-06-07', venc: 'Josef Newgarden' },
    { e: 10, n: 'GP de Road America', l: 'Elkhart Lake', d: '2026-06-21', venc: 'Christian Lundgaard' },
    { e: 11, n: 'Indy 200 de Mid-Ohio', l: 'Lexington', d: '2026-07-05', venc: 'Pato O\'Ward' },
    { e: 12, n: 'GP de Nashville', l: 'Nashville', d: '2026-07-20', venc: 'Álex Palou' },
    { e: 13, n: 'GP de Portland', l: 'Portland', d: '2026-08-09', venc: 'Álex Palou' },
    { e: 14, n: 'Indy de Markham', l: 'Markham', d: '2026-08-16', venc: 'Marcus Ericsson' },
    { e: 15, n: 'GP de Washington', l: 'Washington, D.C.', d: '2026-08-23', venc: 'Kyle Kirkwood' },
    { e: 16, n: 'Milwaukee Mile 1', l: 'Milwaukee', d: '2026-08-29', venc: 'Pato O\'Ward' },
    { e: 17, n: 'Milwaukee Mile 2', l: 'Milwaukee', d: '2026-08-30', venc: 'Pato O\'Ward' },
    { e: 18, n: 'GP de Monterey', l: 'Laguna Seca', d: '2026-09-06', venc: 'Scott McLaughlin' }
  ],
  classificacao: {
    titulo: 'Pilotos (final)',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [
      ['1', 'Álex Palou', 'Chip Ganassi', '631'], ['2', 'Kyle Kirkwood', 'Andretti Global', '545'],
      ['3', 'Christian Lundgaard', 'Arrow McLaren', '535'], ['4', 'Pato O\'Ward', 'Arrow McLaren', '522'],
      ['5', 'David Malukas', 'Team Penske', '514'], ['6', 'Scott McLaughlin', 'Team Penske', '482'],
      ['7', 'Marcus Ericsson', 'Andretti Global', '429'], ['8', 'Josef Newgarden', 'Team Penske', '423'],
      ['9', 'Felix Rosenqvist', 'Meyer Shank', '412'], ['10', 'Rinus VeeKay', '—', '378'],
      ['11', 'Will Power', 'Andretti Global', '368'], ['12', 'Scott Dixon', 'Chip Ganassi', '331'],
      ['13', 'Kyffin Simpson', 'Chip Ganassi', '327']
    ],
    nota: 'Estreante do ano: Dennis Hauger (Dale Coyne). Honda venceu a Taça de Fabricantes. David Malukas foi o campeão de ovais. Rosenqvist venceu a Indy 500.'
  },
  equipes: [
    { n: 'Chip Ganassi Racing', i: 'Motor Honda', p: ['Álex Palou', 'Scott Dixon', 'Kyffin Simpson'] },
    { n: 'Team Penske', i: 'Motor Chevrolet', p: ['Josef Newgarden', 'Scott McLaughlin', 'David Malukas'] },
    { n: 'Andretti Global', i: 'Motor Honda', p: ['Kyle Kirkwood', 'Will Power', 'Marcus Ericsson'] },
    { n: 'Arrow McLaren', i: 'Motor Chevrolet', p: ['Pato O\'Ward', 'Christian Lundgaard', 'Nolan Siegel'] },
    { n: 'Meyer Shank Racing', i: 'Motor Honda', p: ['Felix Rosenqvist', 'Marcus Armstrong'] },
    { n: 'Ed Carpenter Racing', i: 'Motor Chevrolet', p: ['Alexander Rossi', 'Christian Rasmussen'] },
    { n: 'Rahal Letterman Lanigan', i: 'Motor Honda', p: ['Graham Rahal', 'Mick Schumacher', 'Louis Foster'] },
    { n: 'Dale Coyne Racing', i: 'Motor Honda', p: ['Romain Grosjean', 'Dennis Hauger'] }
  ],
  videos: ['Indy 500 2026 melhores momentos', 'IndyCar 2026 Milwaukee', 'Álex Palou campeão 2026']
},
{
  slug: 'porsche-cup', nome: 'Porsche Cup', menu: 'Porsche Cup', principal: true,
  foto: 'assets/img/cat/porsche.jpg',
  frase: 'Trinta 911 iguais. Só o pé direito muda.',
  intro: 'Mesmo carro, mesmo acerto, mesmo pneu. Na Porsche Cup, o seis cilindros berra atrás do banco e a diferença entre o primeiro e o décimo cabe num piscar de olhos. Marçal Müller lidera a Carrera Cup.',
  lider: { nome: 'Marçal Müller', info: 'Carrera Cup, 159 pontos' },
  noticias: [
    { d: '2026-07-12', t: 'Müller e Di Mauro vencem o endurance em Portimão', x: 'A dupla levou a prova longa no Algarve e Marçal Müller abriu 24 pontos na Carrera Cup.' },
    { d: '2026-07-05', t: 'Salles vence em Portugal', x: 'Lucas Salles ganhou a segunda corrida em Portimão, um dia depois de mais uma vitória de Müller, e subiu para vice-líder.' },
    { d: '2026-06-13', t: 'Porsche Cup Brasil corre em Le Mans', x: 'O grid brasileiro acelerou no Circuito de la Sarthe, com corridas de 45 minutos. Jeff Giassi e Pietro Fantin venceram.' }
  ],
  calendario: [
    { e: 1, n: 'Etapa 1', l: 'Interlagos (SP)', d: '2026-03-01', venc: 'Marçal Müller e Jeff Giassi' },
    { e: 2, n: 'Etapa 2', l: 'Velocitta (SP)', d: '2026-03-29', venc: 'Marçal Müller e Thiago Vivacqua' },
    { e: 3, n: 'Etapa 3', l: 'Le Mans (França)', d: '2026-06-13', venc: 'Jeff Giassi e Pietro Fantin' },
    { e: 4, n: 'Etapa 4', l: 'Portimão (Portugal)', d: '2026-07-05', venc: 'Marçal Müller e Lucas Salles' },
    { e: 5, n: 'Endurance', l: 'Portimão (Portugal)', d: '2026-07-12', venc: 'Marçal Müller e Gaetano di Mauro' },
    { e: 6, n: 'Etapa 6', l: 'Interlagos (SP)', d: '2026-09-06', venc: 'Marçal Müller', nota: 'Carrera Cup, na chuva, de ponta a ponta' },
    { e: 7, n: 'Endurance', l: 'Brasília (DF)', d: '2026-10-03', nota: 'transferido de Goiânia para o Autódromo Nelson Piquet, por causa das obras no circuito goiano; 300 km em duplas, na chuva', s: [{ t: 'Corrida', d: '2026-10-03', h: '13:00' }], venc: 'Matheus Comparatto e Felipe Baptista' },
    { e: 8, n: 'Etapa 8, Challenge e Trophy', l: 'Interlagos (SP)', d: '2026-11-22', nota: 'não acontece mais em Goiânia, porque o reparo do asfalto do autódromo não ficou pronto a tempo; remarcada para Interlagos, nos dias 21 e 22 de novembro' },
    { e: 9, n: 'Etapa 9', l: 'Interlagos (SP)', d: '2026-11-08' },
    { e: 10, n: 'Endurance final', l: 'Interlagos (SP)', d: '2026-11-28' }
  ],
  classificacao: {
    titulo: 'Carrera Cup, pilotos',
    colunas: ['Pos', 'Piloto', 'Pts'],
    linhas: [['1', 'Marçal Müller', '159'], ['2', 'Lucas Salles', '135'], ['3', 'Antonella Bassani', '133'], ['4', 'Jeff Giassi', '130'], ['5', 'Miguel Paludo', '124'], ['6', 'Marcos Regadas', '108'], ['7', 'Matheus Comparatto', '103'], ['8', 'Thiago Vivacqua', '100'], ['9', 'Sebá Malucelli', '87'], ['10', 'Pietro Fantin', '83']],
    nota: 'Classificação após a etapa 6, em Interlagos (pontuação da Carrera Cup; a etapa de Brasília foi disputada pelo campeonato de Endurance).'
  },
  equipes: [
    { n: 'Carrera Cup', i: 'Porsche 911 GT3 Cup (992)', p: ['Marçal Müller', 'Lucas Salles', 'Antonella Bassani', 'Jeff Giassi', 'Miguel Paludo', 'Marcos Regadas', 'Matheus Comparatto', 'Thiago Vivacqua', 'Sebá Malucelli', 'Pietro Fantin'] },
    { n: 'Challenge e Trophy', i: 'Categorias de acesso da Porsche Cup Brasil', p: [] }
  ],
  videos: ['Porsche Cup Brasil 2026 Le Mans', 'Porsche Cup Brasil 2026 Interlagos', 'Porsche Cup Brasil onboard']
},
{
  slug: 'nascar', nome: 'NASCAR', menu: 'NASCAR',
  foto: 'assets/img/cat/nascar.jpg',
  frase: 'Quarenta carros, um vácuo, nenhum espaço.',
  intro: 'Nos ovais americanos, os carros andam colados a 300 km/h e o vácuo empurra o pelotão inteiro. Um toque e dez carros saem de cena. O Chase começou: Kyle Larson lidera por um ponto.',
  lider: { nome: 'Kyle Larson', info: 'Hendrick, lidera o Chase' },
  noticias: [
    { d: '2026-09-19', t: 'Logano vence a corrida noturna de Bristol', x: 'Joey Logano ganhou sob as luzes da meia milha mais rápida do mundo. Larson segue um ponto à frente de Denny Hamlin.' },
    { d: '2026-09-13', t: 'Larson vence em St. Louis', x: 'O piloto da Hendrick levou a segunda corrida do Chase e assumiu a ponta.' },
    { d: '2026-09-06', t: 'Bell abre o Chase com vitória em Darlington', x: 'Christopher Bell venceu a Southern 500, a primeira das dez corridas que decidem o título.' }
  ],
  calendario: [
    { e: 25, n: 'New Hampshire', l: 'Loudon', d: '2026-08-23', venc: 'Ryan Blaney' },
    { e: 26, n: 'Coke Zero Sugar 400', l: 'Daytona', d: '2026-08-29', venc: 'Ryan Preece' },
    { e: 27, n: 'Southern 500', l: 'Darlington', d: '2026-09-06', venc: 'Christopher Bell' },
    { e: 28, n: 'Enjoy Illinois 300', l: 'St. Louis', d: '2026-09-13', venc: 'Kyle Larson' },
    { e: 29, n: 'Bristol Night Race', l: 'Bristol', d: '2026-09-19', venc: 'Joey Logano' },
    { e: 30, n: 'Hollywood Casino 400', l: 'Kansas', d: '2026-09-27', s: [{ t: 'Treino', d: '2026-09-26', h: '11:00' }, { t: 'Classificação', d: '2026-09-26', h: '12:10' }, { t: 'Corrida', d: '2026-09-27', h: '16:00' }], venc: 'Kyle Larson' },
    { e: 31, n: 'South Point 400', l: 'Las Vegas', d: '2026-10-04', s: [{ t: 'Treino', d: '2026-10-03', h: '17:30' }, { t: 'Classificação', d: '2026-10-03', h: '18:35' }, { t: 'Corrida', d: '2026-10-04', h: '18:30' }], venc: 'Chase Briscoe' },
    { e: 32, n: 'Bank of America 400', l: 'Charlotte', d: '2026-10-11', s: [{ t: 'Treino', d: '2026-10-10', h: '14:00' }, { t: 'Classificação', d: '2026-10-10', h: '15:05' }, { t: 'Corrida', d: '2026-10-11', h: '16:00' }] },
    { e: 33, n: 'Freeway Insurance 500', l: 'Phoenix', d: '2026-10-18' },
    { e: 34, n: 'YellaWood 500', l: 'Talladega', d: '2026-10-25' },
    { e: 35, n: 'Xfinity 500', l: 'Martinsville', d: '2026-11-01' },
    { e: 36, n: 'Final', l: 'Homestead-Miami', d: '2026-11-08' }
  ],
  classificacao: {
    titulo: 'Chase, após Bristol',
    colunas: ['Pos', 'Piloto', 'Equipe'],
    linhas: [['1', 'Kyle Larson', 'Hendrick (Chevrolet)'], ['2', 'Denny Hamlin', 'Joe Gibbs (Toyota)'], ['3', 'Ryan Blaney', 'Penske (Ford)'], ['4', 'Tyler Reddick', '23XI (Toyota)'], ['5', 'Joey Logano', 'Penske (Ford)'], ['6', 'Christopher Bell', 'Joe Gibbs (Toyota)'], ['7', 'Chase Elliott', 'Hendrick (Chevrolet)'], ['8', 'Ty Gibbs', 'Joe Gibbs (Toyota)'], ['9', 'Chase Briscoe', 'Joe Gibbs (Toyota)'], ['10', 'Carson Hocevar', 'Spire (Chevrolet)'], ['11', 'Shane van Gisbergen', 'Trackhouse (Chevrolet)'], ['12', 'Corey Heim', '23XI (Toyota)']],
    nota: 'Larson lidera por 1 ponto. O calendário mostra a reta final da temporada.'
  },
  equipes: [
    { n: 'Hendrick Motorsports', i: 'Chevrolet', p: ['Kyle Larson', 'Chase Elliott', 'William Byron', 'Alex Bowman'] },
    { n: 'Joe Gibbs Racing', i: 'Toyota', p: ['Denny Hamlin', 'Christopher Bell', 'Ty Gibbs', 'Chase Briscoe'] },
    { n: 'Team Penske', i: 'Ford', p: ['Ryan Blaney', 'Joey Logano', 'Austin Cindric'] },
    { n: '23XI Racing', i: 'Toyota', p: ['Tyler Reddick', 'Bubba Wallace', 'Riley Herbst', 'Corey Heim'] },
    { n: 'Trackhouse Racing', i: 'Chevrolet', p: ['Shane van Gisbergen'] },
    { n: 'Spire Motorsports', i: 'Chevrolet', p: ['Carson Hocevar', 'Daniel Suárez', 'Michael McDowell'] },
    { n: 'RFK Racing', i: 'Ford', p: ['Brad Keselowski', 'Chris Buescher', 'Ryan Preece'] },
    { n: 'Richard Childress Racing', i: 'Chevrolet', p: ['Austin Dillon', 'Kyle Busch'] }
  ],
  videos: ['NASCAR Cup 2026 Bristol melhores momentos', 'NASCAR Chase 2026', 'NASCAR Daytona 2026 final']
},
{
  slug: 'motocross', nome: 'Motocross', menu: 'Motocross',
  foto: 'assets/img/cat/motocross.jpg',
  frase: 'A moto sai do chão. O piloto decide onde ela pousa.',
  intro: 'Terra vermelha, sulcos de meio metro, saltos de trinta metros. No Motocross, o antebraço queima na décima volta e a pista muda a cada passagem. Jeffrey Herlings fechou o Mundial MXGP com 973 pontos e o sexto título.',
  lider: { nome: 'Jeffrey Herlings', info: 'Campeão MXGP 2026, Honda' },
  noticias: [
    { d: '2026-09-20', t: 'Herlings fecha o ano vencendo em Darwin', x: 'O holandês ganhou as duas baterias na Austrália e terminou 168 pontos à frente de Romain Febvre. Foi o sexto título mundial, o primeiro pela Honda.' },
    { d: '2026-09-20', t: 'Vialle garante o terceiro no desempate', x: 'Tom Vialle superou Andrea Adamo no critério de desempate em Darwin e fechou a última etapa no pódio.' },
    { d: '2026-09-13', t: 'Herlings vence na China', x: 'Oitava vitória seguida do holandês, que chegou a Xangai com o título praticamente definido.' }
  ],
  calendario: [
    { e: 1, n: 'GP da Argentina', l: 'Bariloche', d: '2026-03-08', venc: 'Jeffrey Herlings' },
    { e: 2, n: 'GP da Andaluzia', l: 'Almonte', d: '2026-03-22', venc: 'Lucas Coenen' },
    { e: 3, n: 'GP da Suíça', l: 'Frauenfeld', d: '2026-03-29', venc: 'Tom Vialle' },
    { e: 4, n: 'GP da Sardenha', l: 'Riola Sardo', d: '2026-04-12', venc: 'Lucas Coenen' },
    { e: 5, n: 'GP do Trentino', l: 'Pietramurata', d: '2026-04-19', venc: 'Jeffrey Herlings' },
    { e: 6, n: 'GP da França', l: 'Lacapelle-Marival', d: '2026-05-24', venc: 'Jeffrey Herlings' },
    { e: 7, n: 'GP da Alemanha', l: 'Teutschenthal', d: '2026-05-31', venc: 'Lucas Coenen' },
    { e: 8, n: 'GP da Letônia', l: 'Ķegums', d: '2026-06-07', venc: 'Lucas Coenen' },
    { e: 9, n: 'GP da Itália', l: 'Montevarchi', d: '2026-06-21', venc: 'Jeffrey Herlings' },
    { e: 10, n: 'GP de Portugal', l: 'Águeda', d: '2026-06-28', venc: 'Jeffrey Herlings' },
    { e: 11, n: 'GP da África do Sul', l: 'Joanesburgo', d: '2026-07-05', venc: 'Lucas Coenen' },
    { e: 12, n: 'GP da Grã-Bretanha', l: 'Swindon', d: '2026-07-19', venc: 'Jeffrey Herlings' },
    { e: 13, n: 'GP da República Tcheca', l: 'Loket', d: '2026-07-26', venc: 'Jeffrey Herlings' },
    { e: 14, n: 'GP de Flandres', l: 'Lommel', d: '2026-08-02', venc: 'Jeffrey Herlings' },
    { e: 15, n: 'GP da Suécia', l: 'Uddevalla', d: '2026-08-16', venc: 'Jeffrey Herlings' },
    { e: 16, n: 'GP da Holanda', l: 'Arnhem', d: '2026-08-23', venc: 'Jeffrey Herlings' },
    { e: 17, n: 'GP da Turquia', l: 'Afyonkarahisar', d: '2026-09-06', venc: 'Jeffrey Herlings' },
    { e: 18, n: 'GP da China', l: 'Xangai', d: '2026-09-13', venc: 'Jeffrey Herlings' },
    { e: 19, n: 'GP da Austrália', l: 'Darwin', d: '2026-09-20', venc: 'Jeffrey Herlings' }
  ],
  classificacao: {
    titulo: 'MXGP, pilotos (final)',
    colunas: ['Pos', 'Piloto', 'País', 'Pts'],
    linhas: [['1', 'Jeffrey Herlings', 'Holanda', '973'], ['2', 'Romain Febvre', 'França', '805'], ['3', 'Tim Gajser', 'Eslovênia', '659'], ['4', 'Tom Vialle', 'França', '641'], ['5', 'Andrea Adamo', 'Itália', '637'], ['6', 'Lucas Coenen', 'Bélgica', '566'], ['7', 'Rubén Fernández', 'Espanha', '523'], ['8', 'Maxime Renaux', 'França', '449'], ['9', 'Pauls Jonass', 'Letônia', '438'], ['10', 'Kay de Wolf', 'Holanda', '428']],
    nota: 'Na MX2, Guillem Farrés foi campeão na última etapa.'
  },
  equipes: [
    { n: 'Honda HRC Petronas', p: ['Jeffrey Herlings', 'Tom Vialle'] },
    { n: 'Kawasaki Racing Team', p: ['Romain Febvre'] },
    { n: 'Yamaha', p: ['Tim Gajser'] },
    { n: 'KTM', p: ['Lucas Coenen'] }
  ],
  videos: ['MXGP 2026 Darwin melhores momentos', 'Jeffrey Herlings campeão 2026', 'MXGP 2026 largada']
},
{
  slug: 'motogp', nome: 'MotoGP', menu: 'MotoGP', principal: true,
  foto: 'assets/img/cat/motogp.jpg',
  frase: 'Cotovelo no asfalto a 60 graus de inclinação.',
  intro: 'Na MotoGP, o piloto pendura o corpo para fora da moto e arrasta o cotovelo na zebra. São 300 cavalos em duas rodas e 360 km/h na reta. Jorge Martín lidera com 12 pontos sobre Marc Márquez, faltando sete etapas.',
  lider: { nome: 'Jorge Martín', info: 'Aprilia, 333 pontos' },
  noticias: [
    { d: '2026-09-20', t: 'Acosta vence na Áustria', x: 'Pedro Acosta deu à KTM a primeira vitória do ano em casa, no Red Bull Ring. Cinco pilotos seguem separados por 24 pontos.' },
    { d: '2026-09-13', t: 'Márquez vence em Misano', x: 'Marc Márquez emendou Aragão e San Marino e chegou a 190 pontos, 18 atrás do líder.' },
    { d: '2026-06-28', t: 'Ogura vence em Assen', x: 'O japonês da Trackhouse venceu na Holanda e entrou de vez na briga pelo título.' }
  ],
  calendario: [
    { e: 1, n: 'GP da Tailândia', l: 'Buriram', d: '2026-03-01', venc: 'Marco Bezzecchi (Aprilia)' },
    { e: 2, n: 'GP do Brasil', l: 'Goiânia', d: '2026-03-22', venc: 'Marco Bezzecchi (Aprilia)' },
    { e: 3, n: 'GP das Américas', l: 'Austin', d: '2026-03-29', venc: 'Marco Bezzecchi (Aprilia)' },
    { e: 4, n: 'GP da Espanha', l: 'Jerez', d: '2026-04-26', venc: 'Álex Márquez (Ducati)' },
    { e: 5, n: 'GP da França', l: 'Le Mans', d: '2026-05-10', venc: 'Jorge Martín (Aprilia)' },
    { e: 6, n: 'GP da Catalunha', l: 'Barcelona', d: '2026-05-17', venc: 'Fabio Di Giannantonio (Ducati)' },
    { e: 7, n: 'GP da Itália', l: 'Mugello', d: '2026-05-31', venc: 'Marco Bezzecchi (Aprilia)' },
    { e: 8, n: 'GP da Hungria', l: 'Balaton', d: '2026-06-07', venc: 'Marc Márquez (Ducati)' },
    { e: 9, n: 'GP da República Tcheca', l: 'Brno', d: '2026-06-21', venc: 'Marc Márquez (Ducati)' },
    { e: 10, n: 'GP da Holanda', l: 'Assen', d: '2026-06-28', venc: 'Ai Ogura (Aprilia)' },
    { e: 11, n: 'GP da Alemanha', l: 'Sachsenring', d: '2026-07-12', venc: 'Marc Márquez (Ducati)' },
    { e: 12, n: 'GP da Inglaterra', l: 'Silverstone', d: '2026-08-09', venc: 'Raúl Fernández (Aprilia)' },
    { e: 13, n: 'GP de Aragão', l: 'Alcañiz', d: '2026-08-30', venc: 'Marc Márquez (Ducati)' },
    { e: 14, n: 'GP de San Marino', l: 'Misano', d: '2026-09-13', venc: 'Marc Márquez (Ducati)' },
    { e: 15, n: 'GP da Áustria', l: 'Spielberg', d: '2026-09-20', venc: 'Pedro Acosta (KTM)' },
    { e: 16, n: 'GP do Japão', l: 'Motegi', d: '2026-10-04', s: [{ t: 'Treino livre 1', d: '2026-10-01', h: '22:45' }, { t: 'Treino', d: '2026-10-02', h: '03:00' }, { t: 'Treino livre 2', d: '2026-10-02', h: '22:10' }, { t: 'Classificação Q1', d: '2026-10-02', h: '22:50' }, { t: 'Classificação Q2', d: '2026-10-02', h: '23:15' }, { t: 'Sprint', d: '2026-10-03', h: '03:00' }, { t: 'Corrida', d: '2026-10-04', h: '02:00' }], venc: 'Marc Márquez (Ducati)' },
    { e: 17, n: 'GP da Indonésia', l: 'Mandalika', d: '2026-10-11', s: [{ t: 'Treino livre 1', d: '2026-10-08', h: '23:45' }, { t: 'Treino', d: '2026-10-09', h: '04:00' }, { t: 'Treino livre 2', d: '2026-10-09', h: '23:10' }, { t: 'Classificação Q1', d: '2026-10-09', h: '23:50' }, { t: 'Classificação Q2', d: '2026-10-10', h: '00:15' }, { t: 'Sprint', d: '2026-10-10', h: '04:00' }, { t: 'Corrida', d: '2026-10-11', h: '04:00' }] },
    { e: 18, n: 'GP da Austrália', l: 'Phillip Island', d: '2026-10-25' },
    { e: 19, n: 'GP da Malásia', l: 'Sepang', d: '2026-11-01' },
    { e: 20, n: 'GP do Catar', l: 'Lusail', d: '2026-11-08' },
    { e: 21, n: 'GP de Portugal', l: 'Portimão', d: '2026-11-22' },
    { e: 22, n: 'GP de Valência', l: 'Ricardo Tormo', d: '2026-11-29' }
  ],
  classificacao: {
    titulo: 'Pilotos',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [['1', 'Jorge Martín', 'Aprilia Racing', '333'], ['2', 'Marc Márquez', 'Ducati Lenovo', '331'], ['3', 'Marco Bezzecchi', 'Aprilia Racing', '284'], ['4', 'Pedro Acosta', 'Red Bull KTM', '243'], ['5', 'Ai Ogura', 'Trackhouse', '237'], ['6', 'Fabio Di Giannantonio', 'VR46', '230'], ['7', 'Raúl Fernández', 'Trackhouse', '216'], ['8', 'Francesco Bagnaia', 'Ducati Lenovo', '164'], ['9', 'Álex Márquez', 'Gresini', '158'], ['10', 'Fermín Aldeguer', 'Gresini', '122'], ['11', 'Enea Bastianini', 'KTM Tech3', '116'], ['12', 'Luca Marini', 'Honda HRC', '104'], ['13', 'Brad Binder', 'Red Bull KTM', '99'], ['14', 'Diogo Moreira', 'LCR Honda', '74'], ['15', 'Fabio Quartararo', 'Yamaha', '66'], ['16', 'Franco Morbidelli', 'VR46', '56'], ['17', 'Johann Zarco', 'LCR Honda', '45'], ['18', 'Joan Mir', 'Honda HRC', '33'], ['19', 'Jack Miller', 'Pramac Yamaha', '28'], ['20', 'Álex Rins', 'Yamaha', '24'], ['21', 'Toprak Razgatlıoğlu', 'Pramac Yamaha', '18'], ['22', 'Maverick Viñales', 'KTM Tech3', '10']],
    nota: 'Classificação após o GP do Japão (etapa 16 de 22). Martín lidera por 2 pontos sobre Márquez.'
  },
  equipes: [
    { n: 'Aprilia Racing', i: 'Aprilia', p: ['Jorge Martín', 'Marco Bezzecchi'] },
    { n: 'Ducati Lenovo', i: 'Ducati', p: ['Marc Márquez', 'Francesco Bagnaia'] },
    { n: 'Trackhouse Racing', i: 'Aprilia', p: ['Ai Ogura', 'Raúl Fernández'] },
    { n: 'VR46 Racing', i: 'Ducati', p: ['Fabio Di Giannantonio', 'Franco Morbidelli'] },
    { n: 'Gresini Racing', i: 'Ducati', p: ['Álex Márquez'] },
    { n: 'Red Bull KTM', i: 'KTM', p: ['Pedro Acosta', 'Brad Binder'] },
    { n: 'KTM Tech3', i: 'KTM', p: ['Maverick Viñales'] },
    { n: 'Monster Energy Yamaha', i: 'Yamaha', p: ['Fabio Quartararo', 'Álex Rins'] }
  ],
  videos: ['MotoGP 2026 Áustria melhores momentos', 'MotoGP 2026 Misano Marc Márquez', 'MotoGP 2026 onboard']
},
{
  slug: 'le-mans', nome: 'Le Mans', menu: 'Le Mans', guia: false,
  foto: 'assets/img/cat/le-mans-noite.jpg',
  frase: 'Um dia inteiro de corrida. Sem parar.',
  intro: 'A corrida mais famosa do mundo dura 24 horas: três pilotos revezam o mesmo carro, de dia, de noite e na neblina da madrugada. Em 2026, a Toyota #7 venceu por apenas 10 segundos depois de 381 voltas.',
  lider: { nome: 'Conway, Kobayashi e De Vries', info: 'Vencedores de 2026, Toyota #7' },
  noticias: [
    { d: '2026-06-14', t: 'Toyota #7 vence Le Mans por 10 segundos', x: 'Mike Conway, Kamui Kobayashi e Nyck de Vries venceram a 94ª edição depois de 381 voltas. O BMW #20 ficou em segundo, a 10,9 segundos, e a Toyota #8 fechou o pódio. Foi a primeira vitória da Toyota desde 2022.' },
    { d: '2026-06-14', t: 'Cadillac liderou a madrugada e perdeu no fim', x: 'O Cadillac #12 da Jota passou a noite na frente, com quase um minuto de vantagem, mas uma punição na 16ª hora tirou o carro da briga. Terminou em quarto.' },
    { d: '2026-06-14', t: 'Corvette vence na GT3, Inter Europol na LMP2', x: 'Na classe LMGT3, o Corvette #33 da TF Sport ganhou com Catsburg, Edgar e Keating. Eduardo Barrichello levou o Aston Martin #23 ao terceiro lugar da classe.' }
  ],
  calendario: [
    { e: 1, n: '24 Horas de Le Mans 2026', l: 'Circuito de La Sarthe, França', d: '2026-06-14', venc: 'Toyota #7 (Conway, Kobayashi e De Vries)' },
    { e: 2, n: '24 Horas de Le Mans 2027', l: 'Circuito de La Sarthe, França', nota: 'Data ainda não divulgada, normalmente em junho' }
  ],
  destaque: {
    titulo: 'Últimos vencedores',
    colunas: ['Ano', 'Pilotos', 'Carro'],
    linhas: [
      ['2026', 'Mike Conway, Kamui Kobayashi e Nyck de Vries', 'Toyota #7'],
      ['2025', 'Robert Kubica, Yifei Ye e Phil Hanson', 'Ferrari #83'],
      ['2024', 'Antonio Fuoco, Miguel Molina e Nicklas Nielsen', 'Ferrari #50'],
      ['2023', 'Alessandro Pier Guidi, James Calado e Antonio Giovinazzi', 'Ferrari #51'],
      ['2022', 'Sébastien Buemi, Brendon Hartley e Ryō Hirakawa', 'Toyota #8'],
      ['2021', 'Mike Conway, Kamui Kobayashi e José María López', 'Toyota #7']
    ]
  },
  classificacao: {
    titulo: 'Resultado geral 2026',
    colunas: ['Pos', 'Pilotos', 'Carro', 'Voltas'],
    linhas: [
      ['1', 'Conway, Kobayashi e De Vries', 'Toyota #7', '381'], ['2', 'Frijns, Rast e S. van der Linde', 'BMW #20', '381'],
      ['3', 'Buemi, Hartley e Hirakawa', 'Toyota #8', '381'], ['4', 'Delétraz, Nato e Stevens', 'Cadillac #12', '381'],
      ['5', 'Calado, Giovinazzi e Pier Guidi', 'Ferrari #51', '381'], ['6', 'Félix da Costa, Habsburg e Milesi', 'Alpine #35', '381'],
      ['7', 'Hanson, Kubica e Ye', 'Ferrari #83', '381'], ['8', 'Gamble, Gunn e Tincknell', 'Aston Martin #007', '379'],
      ['9', 'Albuquerque, J. Taylor e R. Taylor', 'Cadillac #101', '379']
    ],
    extra: {
      titulo: 'Vencedores por classe',
      colunas: ['Classe', 'Pilotos', 'Carro'],
      linhas: [
        ['Hypercar', 'Conway, Kobayashi e De Vries', 'Toyota #7'],
        ['LMP2', 'Dillmann, Śmiechowski e Yelloly', 'Inter Europol #43'],
        ['LMP2 Pro-Am', 'Heinrich, Kurtz e Quinn', 'CrowdStrike by APR #4'],
        ['LMGT3', 'Catsburg, Edgar e Keating', 'Corvette TF Sport #33']
      ]
    },
    nota: '94ª edição, 13 e 14 de junho de 2026, terceira etapa do Mundial de Endurance (WEC). 62 carros largaram em três classes. A Toyota venceu Le Mans pela sexta vez.'
  },
  equipes: [
    { n: 'Toyota Racing', i: 'Toyota TR010 Hybrid', p: ['Mike Conway', 'Kamui Kobayashi', 'Nyck de Vries', 'Sébastien Buemi', 'Brendon Hartley', 'Ryō Hirakawa'] },
    { n: 'BMW M Team WRT', i: 'BMW M Hybrid V8', p: ['Robin Frijns', 'René Rast', 'Sheldon van der Linde'] },
    { n: 'Cadillac Hertz Team Jota', i: 'Cadillac V-Series.R', p: ['Louis Delétraz', 'Norman Nato', 'Will Stevens'] },
    { n: 'Ferrari AF Corse', i: 'Ferrari 499P', p: ['James Calado', 'Antonio Giovinazzi', 'Alessandro Pier Guidi'] },
    { n: 'Alpine Endurance Team', i: 'Alpine A424', p: ['António Félix da Costa', 'Ferdinand Habsburg', 'Charles Milesi'] },
    { n: 'AF Corse', i: 'Ferrari 499P', p: ['Phil Hanson', 'Robert Kubica', 'Yifei Ye'] }
  ],
  videos: ['24 Horas de Le Mans 2026 melhores momentos', '24 Horas de Le Mans 2026 final Toyota', 'Le Mans 2026 onboard noite']
},
{
  slug: 'imsa', nome: 'IMSA', menu: 'IMSA', guia: false,
  foto: 'assets/img/cat/imsa.jpg',
  frase: 'O endurance dos Estados Unidos, de Daytona a Road Atlanta.',
  intro: 'O IMSA é o campeonato de endurance dos Estados Unidos: protótipos e carros GT dividem a pista em provas de 2h40 a 24 horas, como Daytona e Sebring. O brasileiro Felipe Nasr venceu as duas maiores do ano com a Porsche.',
  lider: { nome: 'Jack Aitken', info: 'Campeão 2026 da GTP, Cadillac, 3.020 pontos' },
  noticias: [
    { d: '2026-10-03', t: 'Porsche vence o Petit Le Mans; Aitken é campeão', x: 'O Porsche #6 de Campbell, Estre e Laurens Vanthoor venceu a última etapa, em Road Atlanta. Jack Aitken, da Cadillac Whelen, ficou com o título da classe GTP.' },
    { d: '2026-09-20', t: 'BMW vence em Indianápolis', x: 'Sheldon van der Linde e Dries Vanthoor deram ao BMW #24 a primeira vitória do ano, no misto de Indianápolis.' },
    { d: '2026-03-21', t: 'Felipe Nasr vence Daytona e Sebring', x: 'O brasileiro venceu as 24 Horas de Daytona e as 12 Horas de Sebring com o Porsche #7, ao lado de Julien Andlauer e Laurin Heinrich.' }
  ],
  calendario: [
    { e: 1, n: '24 Horas de Daytona', l: 'Daytona', d: '2026-01-25', venc: 'Porsche #7 (Andlauer, Heinrich e Felipe Nasr)' },
    { e: 2, n: '12 Horas de Sebring', l: 'Sebring', d: '2026-03-21', venc: 'Porsche #7 (Andlauer, Heinrich e Felipe Nasr)' },
    { e: 3, n: 'GP de Long Beach', l: 'Long Beach', d: '2026-04-18', venc: 'Acura #93 (Yelloly e van der Zande)' },
    { e: 4, n: 'Laguna Seca', l: 'Monterey', d: '2026-05-03', venc: 'Porsche #5 (Heinrich e van der Helm)' },
    { e: 5, n: 'Detroit', l: 'Detroit', d: '2026-05-30', venc: 'Cadillac #31 (Aitken e Bamber)' },
    { e: 6, n: '6 Horas de Watkins Glen', l: 'Watkins Glen', d: '2026-06-28', venc: 'Cadillac #31 (Aitken, Bamber e Vesti)' },
    { e: 7, n: 'Road America', l: 'Elkhart Lake', d: '2026-08-02', venc: 'Cadillac #10 (Albuquerque e Ricky Taylor)' },
    { e: 8, n: 'Indianápolis', l: 'Indianápolis', d: '2026-09-20', venc: 'BMW #24 (S. van der Linde e D. Vanthoor)' },
    { e: 9, n: 'Petit Le Mans', l: 'Road Atlanta', d: '2026-10-03', venc: 'Porsche #6 (Campbell, Estre e L. Vanthoor)' }
  ],
  classificacao: {
    titulo: 'GTP, pilotos (final)',
    colunas: ['Pos', 'Piloto', 'Carro', 'Pts'],
    linhas: [
      ['1', 'Jack Aitken', 'Cadillac #31', '3020'], ['2', 'Laurin Heinrich', 'Porsche #7', '2859'],
      ['3', 'Nick Yelloly e Renger van der Zande', 'Acura #93', '2723'], ['4', 'Kévin Estre', 'Porsche #6', '2709'],
      ['5', 'Earl Bamber', 'Cadillac #31', '2672'], ['6', 'S. van der Linde e D. Vanthoor', 'BMW #24', '2650']
    ],
    nota: 'Classificação final da classe GTP, a principal. As etapas de Mosport e Virginia foram só para as classes GT, por isso o calendário acima tem 9 provas.'
  },
  equipes: [
    { n: 'Cadillac Whelen', i: 'Cadillac V-Series.R', p: ['Jack Aitken', 'Earl Bamber', 'Frederik Vesti'] },
    { n: 'Porsche Penske Motorsport', i: 'Porsche 963', p: ['Felipe Nasr', 'Julien Andlauer', 'Laurin Heinrich', 'Kévin Estre', 'Matt Campbell', 'Laurens Vanthoor'] },
    { n: 'Acura Meyer Shank Racing', i: 'Acura ARX-06', p: ['Nick Yelloly', 'Renger van der Zande'] },
    { n: 'BMW M Team WRT', i: 'BMW M Hybrid V8', p: ['Sheldon van der Linde', 'Dries Vanthoor'] },
    { n: 'Cadillac Wayne Taylor Racing', i: 'Cadillac V-Series.R', p: ['Filipe Albuquerque', 'Ricky Taylor', 'Jordan Taylor'] },
    { n: 'JDC-Miller MotorSports', i: 'Porsche 963', p: ['Tijmen van der Helm'] }
  ],
  videos: ['IMSA 2026 Petit Le Mans melhores momentos', '24 Horas de Daytona 2026 Felipe Nasr', 'IMSA 2026 onboard GTP']
},
{
  slug: 'dtm', nome: 'DTM', menu: 'DTM', guia: false,
  foto: 'assets/img/cat/dtm.jpg',
  frase: 'Carros GT, porta com porta, nas pistas da Alemanha.',
  intro: 'O DTM é o campeonato alemão de turismo: Porsche, BMW, Mercedes, Ferrari, Aston Martin, McLaren e Ford na mesma pista, com duas corridas por fim de semana. Thomas Preining lidera por 23 pontos antes da final em Hockenheim.',
  lider: { nome: 'Thomas Preining', info: 'Manthey, Porsche, 197 pontos' },
  noticias: [
    { d: '2026-09-13', t: 'Wittmann e Dörr vencem em Sachsenring', x: 'Marco Wittmann ganhou a corrida de sábado e Ben Dörr a de domingo. Preining segue líder e leva 23 pontos de vantagem para Hockenheim.' },
    { d: '2026-08-16', t: 'Cairoli chega à terceira vitória no Nürburgring', x: 'Matteo Cairoli, da Ferrari Emil Frey, venceu a primeira corrida. Wittmann ganhou a segunda e entrou na briga pelo título.' },
    { d: '2026-07-05', t: 'Thiim vence as duas no Norisring', x: 'Nicki Thiim, da Aston Martin, ganhou sábado e domingo no circuito de rua de Nuremberg.' }
  ],
  calendario: [
    { e: 1, n: 'Red Bull Ring', l: 'Spielberg, Áustria', d: '2026-04-26', venc: 'Corrida 1: Thomas Preining · Corrida 2: Maro Engel' },
    { e: 2, n: 'Zandvoort', l: 'Holanda', d: '2026-05-24', venc: 'Corrida 1: Matteo Cairoli · Corrida 2: Kelvin van der Linde' },
    { e: 3, n: 'Lausitzring', l: 'Alemanha', d: '2026-06-21', venc: 'Corrida 1: Ben Dörr · Corrida 2: Matteo Cairoli' },
    { e: 4, n: 'Norisring', l: 'Nuremberg', d: '2026-07-05', venc: 'Corrida 1: Nicki Thiim · Corrida 2: Nicki Thiim' },
    { e: 5, n: 'Oschersleben', l: 'Alemanha', d: '2026-07-26', venc: 'Corrida 1: Thomas Preining · Corrida 2: Maro Engel' },
    { e: 6, n: 'Nürburgring', l: 'Alemanha', d: '2026-08-16', venc: 'Corrida 1: Matteo Cairoli · Corrida 2: Marco Wittmann' },
    { e: 7, n: 'Sachsenring', l: 'Alemanha', d: '2026-09-13', venc: 'Corrida 1: Marco Wittmann · Corrida 2: Ben Dörr' },
    { e: 8, n: 'Hockenheim (final)', l: 'Alemanha', d: '2026-10-11', s: [{ t: 'Classificação 1', d: '2026-10-10', h: '04:30' }, { t: 'Corrida 1', d: '2026-10-10', h: '08:30' }, { t: 'Classificação 2', d: '2026-10-11', h: '04:30' }, { t: 'Corrida 2', d: '2026-10-11', h: '08:30' }] }
  ],
  classificacao: {
    titulo: 'Pilotos',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [
      ['1', 'Thomas Preining', 'Manthey (Porsche)', '197'], ['2', 'Maro Engel', 'Winward (Mercedes)', '174'],
      ['3', 'Marco Wittmann', 'Schubert (BMW)', '173'], ['4', 'Lucas Auer', 'Landgraf (Mercedes)', '152'],
      ['5', 'Matteo Cairoli', 'Emil Frey (Ferrari)', '150'], ['6', 'Nicki Thiim', 'Comtoyou (Aston Martin)', '147'],
      ['7', 'Ben Dörr', 'Dörr (McLaren)', '123'], ['8', 'Arjun Maini', 'HRT (Ford)', '117']
    ],
    nota: 'Após Sachsenring (etapa 7 de 8). A final em Hockenheim, nos dias 10 e 11 de outubro, tem duas corridas e decide o título.'
  },
  equipes: [
    { n: 'Manthey Racing', i: 'Porsche 911 GT3 R', p: ['Thomas Preining'] },
    { n: 'Winward Racing', i: 'Mercedes-AMG GT3', p: ['Maro Engel'] },
    { n: 'Schubert Motorsport', i: 'BMW M4 GT3', p: ['Marco Wittmann', 'Kelvin van der Linde'] },
    { n: 'Emil Frey Racing', i: 'Ferrari 296 GT3', p: ['Matteo Cairoli'] },
    { n: 'Comtoyou Racing', i: 'Aston Martin Vantage GT3', p: ['Nicki Thiim'] },
    { n: 'Dörr Motorsport', i: 'McLaren 720S GT3', p: ['Ben Dörr'] },
    { n: 'HRT Ford Racing', i: 'Ford Mustang GT3', p: ['Arjun Maini'] }
  ],
  videos: ['DTM 2026 Sachsenring melhores momentos', 'DTM 2026 Norisring', 'DTM 2026 onboard']
},
{
  slug: 'superbike', nome: 'Superbike', menu: 'Superbike', guia: false,
  foto: 'assets/img/cat/superbike.jpg',
  frase: 'Motos de rua preparadas para a pista. Três corridas por fim de semana.',
  intro: 'No Mundial de Superbike, as motos são versões de corrida de modelos vendidos em loja. Cada etapa tem três corridas: a 1, a Superpole Race, curtinha, e a 2. Nicolò Bulega, da Ducati, já é campeão de 2026.',
  lider: { nome: 'Nicolò Bulega', info: 'Campeão mundial 2026, Ducati, 602 pontos' },
  noticias: [
    { d: '2026-09-27', t: 'Bulega é campeão mundial de Superbike', x: 'O italiano da Ducati garantiu o título com o segundo lugar na corrida 2 em Cremona, depois de dois vice-campeonatos seguidos. Iker Lecuona venceu as três corridas do fim de semana.' },
    { d: '2026-09-06', t: 'Bulega vence as três em Magny-Cours', x: 'Mais um fim de semana perfeito na França, o oitavo do ano em que ele venceu as três corridas.' },
    { d: '2026-07-12', t: 'Lecuona tira a primeira vitória de Bulega', x: 'Em Donington, o espanhol venceu a corrida 1 e quebrou a sequência do companheiro de equipe, que ganhou as outras duas.' }
  ],
  calendario: [
    { e: 1, n: 'Austrália', l: 'Phillip Island', d: '2026-02-22', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 2, n: 'Portugal', l: 'Portimão', d: '2026-03-29', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 3, n: 'Holanda', l: 'Assen', d: '2026-04-19', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 4, n: 'Hungria', l: 'Balaton Park', d: '2026-05-03', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 5, n: 'República Tcheca', l: 'Most', d: '2026-05-17', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 6, n: 'Aragão', l: 'Alcañiz', d: '2026-05-31', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 7, n: 'Emília-Romanha', l: 'Misano', d: '2026-06-14', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 8, n: 'Inglaterra', l: 'Donington Park', d: '2026-07-12', venc: 'Corrida 1: Iker Lecuona · Superpole e Corrida 2: Nicolò Bulega' },
    { e: 9, n: 'França', l: 'Magny-Cours', d: '2026-09-06', venc: 'Nicolò Bulega (3 corridas)' },
    { e: 10, n: 'Itália', l: 'Cremona', d: '2026-09-27', venc: 'Iker Lecuona (3 corridas)' },
    { e: 11, n: 'Estoril', l: 'Portugal', d: '2026-10-11', s: [{ t: 'Treino livre 1', d: '2026-10-09', h: '06:20' }, { t: 'Treino livre 2', d: '2026-10-09', h: '11:00' }, { t: 'Treino livre 3', d: '2026-10-10', h: '05:40' }, { t: 'Superpole', d: '2026-10-10', h: '07:15' }, { t: 'Corrida 1', d: '2026-10-10', h: '11:30' }, { t: 'Warm-up', d: '2026-10-11', h: '05:15' }, { t: 'Superpole Race', d: '2026-10-11', h: '07:10' }, { t: 'Corrida 2', d: '2026-10-11', h: '11:30' }] },
    { e: 12, n: 'Espanha', l: 'Jerez', d: '2026-10-18' }
  ],
  classificacao: {
    titulo: 'Pilotos',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [
      ['1', 'Nicolò Bulega', 'Aruba.it Ducati', '602'], ['2', 'Iker Lecuona', 'Aruba.it Ducati', '469'],
      ['3', 'Yari Montella', 'Barni Ducati', '269'], ['4', 'Alex Lowes', 'Bimota', '226'],
      ['5', 'Sam Lowes', 'Marc VDS Ducati', '219'], ['6', 'Lorenzo Baldassarri', 'Ducati', '193'],
      ['7', 'Axel Bassani', 'Bimota', '184'], ['8', 'Garrett Gerloff', 'Kawasaki', '145']
    ],
    nota: 'Após Cremona (etapa 10 de 12). Bulega garantiu o título em Cremona. Cada etapa vale até 62 pontos (25 + 12 + 25).'
  },
  equipes: [
    { n: 'Aruba.it Racing Ducati', i: 'Ducati Panigale V4 R', p: ['Nicolò Bulega', 'Iker Lecuona'] },
    { n: 'Bimota by Kawasaki', i: 'Bimota KB998', p: ['Alex Lowes', 'Axel Bassani'] },
    { n: 'Barni Spark Racing', i: 'Ducati Panigale V4 R', p: ['Yari Montella'] },
    { n: 'Marc VDS Racing', i: 'Ducati Panigale V4 R', p: ['Sam Lowes'] }
  ],
  videos: ['WorldSBK 2026 Cremona melhores momentos', 'Superbike 2026 Bulega campeão', 'WorldSBK 2026 onboard']
},
{
  slug: 'dakar', nome: 'Rally Dakar', menu: 'Dakar', guia: false,
  foto: 'assets/img/cat/dakar.jpg',
  frase: 'Duas semanas, quase 8 mil quilômetros de deserto.',
  intro: 'O Dakar é o rali mais duro do mundo: carros, motos e caminhões cruzam o deserto da Arábia Saudita em 13 etapas, sem estrada e guiados por navegação. Em 2026, Nasser Al-Attiyah ganhou pela sexta vez nos carros.',
  lider: { nome: 'Nasser Al-Attiyah', info: 'Campeão 2026 nos carros, Dacia' },
  noticias: [
    { d: '2026-01-17', t: 'Al-Attiyah conquista o sexto Dakar', x: 'O catariano venceu nos carros com a Dacia, 9min42s à frente de Nani Roma. O brasileiro Lucas Moraes terminou em sétimo, também de Dacia.' },
    { d: '2026-01-17', t: 'Benavides vence nas motos por 2 segundos', x: 'O argentino Luciano Benavides, da KTM, ganhou a categoria por apenas 2 segundos sobre Ricky Brabec, da Honda, depois de quase 49 horas de prova.' },
    { d: '2026-01-17', t: 'Caminhões: vitória de Žala com Iveco', x: 'Vaidotas Žala venceu entre os caminhões, à frente de Aleš Loprais. Nos carros de série (Stock), Rokas Baciuška ganhou.' }
  ],
  calendario: [
    { e: 1, n: 'Etapa 1', l: 'Yanbu', d: '2026-01-04', venc: 'Carros: Guillaume De Mévius · Motos: Edgar Canet' },
    { e: 2, n: 'Etapa 2', l: 'Yanbu a Al-Ula', d: '2026-01-05', venc: 'Carros: Seth Quintero · Motos: Daniel Sanders' },
    { e: 3, n: 'Etapa 3', l: 'Al-Ula', d: '2026-01-06', venc: 'Carros: Mitch Guthrie · Motos: Tosha Schareina' },
    { e: 4, n: 'Etapa 4 (maratona)', l: 'Al-Ula', d: '2026-01-07', venc: 'Carros: Henk Lategan · Motos: Tosha Schareina' },
    { e: 5, n: 'Etapa 5 (maratona)', l: 'Ha\'il', d: '2026-01-08', venc: 'Carros: Nani Roma · Motos: Luciano Benavides' },
    { e: 6, n: 'Etapa 6', l: 'Ha\'il a Riad', d: '2026-01-09', venc: 'Carros: Nasser Al-Attiyah · Motos: Ricky Brabec' },
    { e: 7, n: 'Etapa 7', l: 'Riad a Wadi ad-Dawasir', d: '2026-01-11', venc: 'Carros: Mattias Ekström · Motos: Luciano Benavides' },
    { e: 8, n: 'Etapa 8', l: 'Wadi ad-Dawasir', d: '2026-01-12', venc: 'Carros: Saood Variawa · Motos: Luciano Benavides' },
    { e: 9, n: 'Etapa 9', l: 'Wadi ad-Dawasir', d: '2026-01-13', venc: 'Carros: Eryk Goczał · Motos: Tosha Schareina' },
    { e: 10, n: 'Etapa 10', l: 'Bisha', d: '2026-01-14', venc: 'Carros: Mathieu Serradori · Motos: Adrien Van Beveren' },
    { e: 11, n: 'Etapa 11', l: 'Bisha a Al Henakiyah', d: '2026-01-15', venc: 'Carros: Mattias Ekström · Motos: Skyler Howes' },
    { e: 12, n: 'Etapa 12', l: 'Al Henakiyah a Yanbu', d: '2026-01-16', venc: 'Carros: Nasser Al-Attiyah · Motos: Ricky Brabec' },
    { e: 13, n: 'Etapa 13', l: 'Yanbu', d: '2026-01-17', venc: 'Carros: Mattias Ekström · Motos: Edgar Canet' }
  ],
  classificacao: {
    titulo: 'Carros (final)',
    colunas: ['Pos', 'Piloto', 'Carro', 'Tempo'],
    linhas: [
      ['1', 'Nasser Al-Attiyah', 'Dacia', '48:56:53'], ['2', 'Nani Roma', 'Ford', '+9min42s'],
      ['3', 'Mattias Ekström', 'Ford', '+14min33s'], ['4', 'Sébastien Loeb', 'Dacia', '+15min10s'],
      ['5', 'Carlos Sainz', 'Ford', '+28min30s'], ['6', 'Mathieu Serradori', 'Century', '+45min02s'],
      ['7', 'Lucas Moraes', 'Dacia', '+47min50s']
    ],
    extra: {
      titulo: 'Motos (final)',
      colunas: ['Pos', 'Piloto', 'Moto', 'Tempo'],
      linhas: [
        ['1', 'Luciano Benavides', 'KTM', '49:00:41'], ['2', 'Ricky Brabec', 'Honda', '+2s'],
        ['3', 'Tosha Schareina', 'Honda', '+25min12s'], ['4', 'Skyler Howes', 'Honda', '+56min41s'],
        ['5', 'Daniel Sanders', 'KTM', '+1h03min'], ['6', 'Adrien Van Beveren', 'Honda', '+1h04min']
      ]
    },
    nota: '48ª edição, de 3 a 17 de janeiro de 2026, na Arábia Saudita. Outras categorias: caminhões, Vaidotas Žala (Iveco); carros de série, Rokas Baciuška; T3, Pau Navarro; SSV, Brock Heger. A próxima edição está prevista para janeiro de 2027.'
  },
  equipes: [
    { n: 'Dacia Sandriders', i: 'Dacia Sandrider', p: ['Nasser Al-Attiyah', 'Sébastien Loeb', 'Lucas Moraes'] },
    { n: 'Ford Racing', i: 'Ford Raptor', p: ['Nani Roma', 'Mattias Ekström', 'Carlos Sainz', 'Mitch Guthrie'] },
    { n: 'Red Bull KTM', i: 'KTM 450 Rally', p: ['Luciano Benavides', 'Daniel Sanders', 'Edgar Canet'] },
    { n: 'Monster Energy Honda', i: 'Honda CRF 450 Rally', p: ['Ricky Brabec', 'Tosha Schareina', 'Skyler Howes', 'Adrien Van Beveren'] }
  ],
  videos: ['Dakar 2026 melhores momentos', 'Dakar 2026 Al-Attiyah', 'Dakar 2026 motos Benavides Brabec']
}
];
