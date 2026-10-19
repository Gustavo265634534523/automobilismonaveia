/* Dados das categorias. Atualizado em 27/09/2026.
   Para atualizar: troque os valores abaixo. Datas no formato AAAA-MM-DD.
   Uma etapa com "venc" (vencedor) aparece como encerrada. Sem "d", a data fica "a confirmar". */

window.ATUALIZADO = '18 de outubro de 2026';
/* Horários das sessões (s) sempre no horário de Brasília. */
window.YOUTUBE = 'https://www.youtube.com/@EsporteNaVeia';

window.CATEGORIAS = [
{
  slug: 'formula-1', nome: 'Fórmula 1', menu: 'Fórmula 1', principal: true,
  foto: 'assets/img/esportes/automobilismo.webp',
  frase: 'O piloto encontra o limite a 340 km/h.',
  intro: 'Vinte e dois carros, mil cavalos em cada um. Na freada do fim da reta, o corpo pesa cinco vezes mais e o pé direito ainda espera o último metro. A Fórmula 1 decide campeonatos em milésimos.',
  lider: { nome: 'Kimi Antonelli', info: 'Mercedes, 340 pontos' },
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
    { e: 17, n: 'GP de Singapura', l: 'Marina Bay', d: '2026-10-11', nota: 'primeiro fim de semana de sprint em Singapura', s: [{ t: 'Treino livre 1', d: '2026-10-09', h: '05:30' }, { t: 'Classificação sprint', d: '2026-10-09', h: '09:30' }, { t: 'Sprint', d: '2026-10-10', h: '06:00' }, { t: 'Classificação', d: '2026-10-10', h: '10:00' }, { t: 'Corrida', d: '2026-10-11', h: '09:00' }], venc: 'Max Verstappen (Red Bull)' },
    { e: 18, n: 'GP dos Estados Unidos', l: 'Austin', d: '2026-10-25', s: [{ t: 'Treino livre 1', d: '2026-10-23', h: '14:30' }, { t: 'Treino livre 2', d: '2026-10-23', h: '18:00' }, { t: 'Treino livre 3', d: '2026-10-24', h: '14:30' }, { t: 'Classificação', d: '2026-10-24', h: '18:00' }, { t: 'Corrida', d: '2026-10-25', h: '17:00' }] },
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
      ['1', 'Kimi Antonelli', 'Mercedes', '340'], ['2', 'George Russell', 'Mercedes', '238'],
      ['3', 'Lewis Hamilton', 'Ferrari', '229'], ['4', 'Max Verstappen', 'Red Bull', '221'],
      ['5', 'Charles Leclerc', 'Ferrari', '215'], ['6', 'Lando Norris', 'McLaren', '201'],
      ['7', 'Oscar Piastri', 'McLaren', '138'], ['8', 'Isack Hadjar', 'Red Bull', '97'],
      ['9', 'Liam Lawson', 'Racing Bulls', '75'], ['10', 'Pierre Gasly', 'Alpine', '41'],
      ['11', 'Arvid Lindblad', 'Racing Bulls', '38'], ['12', 'Franco Colapinto', 'Alpine', '27'],
      ['13', 'Oliver Bearman', 'Haas', '23'], ['14', 'Nico Hülkenberg', 'Audi', '13'],
      ['15', 'Gabriel Bortoleto', 'Audi', '10'], ['16', 'Esteban Ocon', 'Haas', '7'],
      ['17', 'Fernando Alonso', 'Aston Martin', '7'], ['18', 'Carlos Sainz', 'Williams', '7'],
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
  foto: 'assets/img/esportes/automobilismo.webp',
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
    { e: 13, n: 'Catar', l: 'Lusail', d: '2026-11-29' },
    { e: 14, n: 'Abu Dhabi', l: 'Yas Marina', d: '2026-12-06' }
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
  slug: 'formula-e', nome: 'Fórmula E', menu: 'Fórmula E',
  foto: 'assets/img/esportes/automobilismo.webp',
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
  slug: 'endurance', nome: 'Endurance', menu: 'WEC',
  foto: 'assets/img/esportes/automobilismo.webp',
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
    { e: 7, n: '6 Horas de Barcelona', l: 'Montmeló', d: '2026-10-18', s: [{ t: 'Treino livre 1', d: '2026-10-16', h: '06:30' }, { t: 'Treino livre 2', d: '2026-10-16', h: '11:30' }, { t: 'Treino livre 3', d: '2026-10-17', h: '03:50' }, { t: 'Classificação LMGT3', d: '2026-10-17', h: '06:50' }, { t: 'Hyperpole LMGT3', d: '2026-10-17', h: '07:10' }, { t: 'Classificação Hypercar', d: '2026-10-17', h: '10:40' }, { t: 'Hyperpole Hypercar', d: '2026-10-17', h: '11:00' }, { t: 'Corrida', d: '2026-10-18', h: '07:00' }] },
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
  slug: 'porsche-cup', nome: 'Porsche Cup', menu: 'Porsche Cup', principal: true,
  foto: 'assets/img/esportes/automobilismo.webp',
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
  slug: 'motogp', nome: 'MotoGP', menu: 'MotoGP', principal: true,
  foto: 'assets/img/esportes/automobilismo.webp',
  frase: 'Cotovelo no asfalto a 60 graus de inclinação.',
  intro: 'Na MotoGP, o piloto pendura o corpo para fora da moto e arrasta o cotovelo na zebra. São 300 cavalos em duas rodas e 360 km/h na reta. Jorge Martín lidera com 12 pontos sobre Marc Márquez, faltando sete etapas.',
  lider: { nome: 'Jorge Martín', info: 'Aprilia, 355 pontos' },
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
    { e: 17, n: 'GP da Indonésia', l: 'Mandalika', d: '2026-10-11', s: [{ t: 'Treino livre 1', d: '2026-10-08', h: '23:45' }, { t: 'Treino', d: '2026-10-09', h: '04:00' }, { t: 'Treino livre 2', d: '2026-10-09', h: '23:10' }, { t: 'Classificação Q1', d: '2026-10-09', h: '23:50' }, { t: 'Classificação Q2', d: '2026-10-10', h: '00:15' }, { t: 'Sprint', d: '2026-10-10', h: '04:00' }, { t: 'Corrida', d: '2026-10-11', h: '04:00' }], venc: 'Marco Bezzecchi (Aprilia)' },
    { e: 18, n: 'GP da Austrália', l: 'Phillip Island', d: '2026-10-25' },
    { e: 19, n: 'GP da Malásia', l: 'Sepang', d: '2026-11-01' },
    { e: 20, n: 'GP do Catar', l: 'Lusail', d: '2026-11-08' },
    { e: 21, n: 'GP de Portugal', l: 'Portimão', d: '2026-11-22' },
    { e: 22, n: 'GP de Valência', l: 'Ricardo Tormo', d: '2026-11-29' }
  ],
  classificacao: {
    titulo: 'Pilotos',
    colunas: ['Pos', 'Piloto', 'Equipe', 'Pts'],
    linhas: [['1', 'Jorge Martín', 'Aprilia Racing', '355'], ['2', 'Marc Márquez', 'Ducati Lenovo', '353'], ['3', 'Marco Bezzecchi', 'Aprilia Racing', '309'], ['4', 'Ai Ogura', 'Trackhouse', '259'], ['5', 'Pedro Acosta', 'Red Bull KTM', '258'], ['6', 'Fabio Di Giannantonio', 'VR46', '245'], ['7', 'Raúl Fernández', 'Trackhouse', '236'], ['8', 'Álex Márquez', 'Gresini', '172'], ['9', 'Francesco Bagnaia', 'Ducati Lenovo', '166'], ['10', 'Fermín Aldeguer', 'Gresini', '125'], ['11', 'Enea Bastianini', 'KTM Tech3', '116'], ['12', 'Luca Marini', 'Honda HRC', '104'], ['13', 'Brad Binder', 'Red Bull KTM', '99'], ['14', 'Diogo Moreira', 'LCR Honda', '74'], ['15', 'Fabio Quartararo', 'Yamaha', '66'], ['16', 'Franco Morbidelli', 'VR46', '56'], ['17', 'Johann Zarco', 'LCR Honda', '45'], ['18', 'Joan Mir', 'Honda HRC', '33'], ['19', 'Jack Miller', 'Pramac Yamaha', '28'], ['20', 'Álex Rins', 'Yamaha', '24'], ['21', 'Toprak Razgatlıoğlu', 'Pramac Yamaha', '18'], ['22', 'Maverick Viñales', 'KTM Tech3', '10']],
    nota: 'Classificação após o GP da Indonésia (etapa 17 de 22). Martín lidera por 2 pontos sobre Márquez.'
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
}
];
