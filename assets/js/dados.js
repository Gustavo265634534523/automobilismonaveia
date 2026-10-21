/* Dados das categorias. Atualizado em 27/09/2026.
   Para atualizar: troque os valores abaixo. Datas no formato AAAA-MM-DD.
   Uma etapa com "venc" (vencedor) aparece como encerrada. Sem "d", a data fica "a confirmar". */

window.ATUALIZADO = '18 de outubro de 2026';
/* Horários das sessões (s) sempre no horário de Brasília. */
window.YOUTUBE = 'https://www.youtube.com/@EsporteNaVeia';

window.CATEGORIAS = [
{
  slug: 'formula-1', nome: 'Fórmula 1', menu: 'Fórmula 1', principal: true,
  foto: 'assets/img/fotos/automobilismo.webp',
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
}
];
