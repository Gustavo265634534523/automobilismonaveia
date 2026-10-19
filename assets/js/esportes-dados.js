/* Dados de futebol e basquete. Atualizado em 19/10/2026.
   Para atualizar: troque os valores abaixo. Datas no formato AAAA-MM-DD, horários (h) no horário de Brasília.
   Um jogo com "p" (placar) aparece como encerrado. Sem "d", aparece só a fase (ex.: data a confirmar).
   tabela.linhas: só o que foi conferido em mais de uma fonte; o resto vai em tabela.nota. */

window.ESPORTES_ATUALIZADO = '19 de outubro de 2026';

window.ESPORTES = [
{
  slug: 'futebol', nome: 'Futebol', pagina: 'futebol.html',
  frase: 'Brasileirão, Libertadores, Sul-Americana e as cinco grandes ligas da Europa.',
  grupos: [
    { nome: 'No Brasil e na América do Sul', slugs: ['brasileirao', 'libertadores', 'sul-americana'] },
    { nome: 'Na Europa', slugs: ['champions-league', 'premier-league', 'la-liga', 'bundesliga', 'serie-a', 'ligue-1'] }
  ]
},
{
  slug: 'basquete', nome: 'Basquete', pagina: 'basquete.html',
  frase: 'NBA, Euroleague e o NBB, o campeonato brasileiro.',
  grupos: [
    { nome: 'Ligas', slugs: ['nba', 'euroleague', 'nbb'] }
  ]
}
];

window.COMPETICOES = [

/* ---------------- Futebol ---------------- */
{
  slug: 'brasileirao',
  esporte: 'futebol',
  nome: 'Brasileirão Série A',
  menu: 'Brasileirão',
  regiao: 'Brasil',
  temporada: '2026',
  frase: 'Trinta e oito rodadas, vinte clubes e nenhuma rodada fácil.',
  intro: 'Pontos corridos em turno e returno: todo mundo joga contra todo mundo duas vezes e quem somar mais pontos é campeão. Os primeiros colocados vão para a Libertadores e os quatro últimos caem para a Série B.',
  fase: 'Pontos corridos – 31ª rodada (falta Corinthians x Vitória, 19/10)',
  lider: { nome: 'Flamengo', info: '67 pontos após a 31ª rodada, um à frente do Palmeiras (66). Retomou a ponta ao vencer o Bahia por 3 x 0 na Fonte Nova.' },
  tabela: {
    titulo: 'Classificação após a 31ª rodada',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [
      ['1', 'Flamengo', '67'],
      ['2', 'Palmeiras', '66'],
      ['3', 'Athletico-PR', '53'],
      ['4', 'Cruzeiro', '51'],
      ['5', 'Fluminense', '51'],
      ['6', 'Atlético-MG', '50'],
      ['7', 'Bahia', '49'],
      ['8', 'Santos', '45'],
      ['9', 'São Paulo', '42'],
      ['10', 'Red Bull Bragantino', '41'],
      ['11', 'Botafogo', '39'],
      ['12', 'Coritiba', '39'],
      ['13', 'Vitória', '36'],
      ['14', 'Mirassol', '36'],
      ['15', 'Vasco', '35'],
      ['16', 'Corinthians', '32'],
      ['17', 'Internacional', '32'],
      ['18', 'Grêmio', '31'],
      ['19', 'Remo', '26'],
      ['20', 'Chapecoense', '18']
    ],
    nota: 'Tabela após os jogos de 16 a 18/10, antes de Corinthians x Vitória (19/10, 20h), que fecha a 31ª rodada. Corinthians e Vitória têm um jogo a menos, e a Chapecoense (30 jogos) também. As fontes consultadas não traziam jogos, vitórias e saldo de gols de todos os times, por isso só aparecem os pontos.'
  },
  jogos: [
    { fase: '31ª rodada', d: '2026-10-17', casa: 'Athletico-PR', fora: 'Palmeiras', l: 'Arena da Baixada', p: '0 x 2' },
    { fase: '31ª rodada', d: '2026-10-17', casa: 'Botafogo', fora: 'Chapecoense', p: '1 x 0' },
    { fase: '31ª rodada', d: '2026-10-18', casa: 'Bahia', fora: 'Flamengo', l: 'Arena Fonte Nova', p: '0 x 3' },
    { fase: '31ª rodada', d: '2026-10-18', casa: 'Remo', fora: 'Red Bull Bragantino', p: '1 x 1' },
    { fase: '31ª rodada', d: '2026-10-19', h: '20:00', casa: 'Corinthians', fora: 'Vitória', l: 'Neo Química Arena' },
    { fase: '32ª rodada', d: '2026-10-24', h: '16:30', casa: 'Mirassol', fora: 'São Paulo', l: 'Mirassol (SP)' },
    { fase: '32ª rodada', d: '2026-10-24', h: '18:30', casa: 'Vasco', fora: 'Corinthians', l: 'São Januário' },
    { fase: '32ª rodada', d: '2026-10-24', h: '21:00', casa: 'Santos', fora: 'Bahia', l: 'Vila Belmiro' },
    { fase: '31ª rodada', casa: 'Mirassol', fora: 'Internacional', p: '2 x 0' },
    { fase: '31ª rodada', casa: 'Atlético-MG', fora: 'Coritiba', p: '1 x 0' },
    { fase: '31ª rodada', casa: 'São Paulo', fora: 'Vasco', p: '1 x 0' },
    { fase: '31ª rodada', casa: 'Fluminense', fora: 'Santos', p: '1 x 2' },
    { fase: '31ª rodada', casa: 'Grêmio', fora: 'Cruzeiro', p: '2 x 4' }
  ],
  destaques: {
    titulo: 'Artilheiros (após a 30ª rodada)',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Kevin Viveros', 'Athletico-PR', '21'],
      ['Pedro', 'Flamengo', '16'],
      ['Gabigol', 'Santos', '14'],
      ['Carlos Vinícius', 'Grêmio', '10']
    ]
  },
  sobre: [
    ['Primeira edição', '1971 (a CBF reconhece como títulos brasileiros as conquistas desde 1959)'],
    ['Clubes', '20, em pontos corridos com turno e returno (38 rodadas)'],
    ['Rebaixamento', 'Os 4 últimos caem para a Série B'],
    ['Maior campeão', 'Palmeiras, com 12 títulos'],
    ['Atual campeão', 'Flamengo (2025)'],
    ['Artilheiro de 2025', 'Kaio Jorge (Cruzeiro), com 21 gols']
  ],
  campeoes: [
    ['2025', 'Flamengo', 'Palmeiras'],
    ['2024', 'Botafogo', 'Palmeiras'],
    ['2023', 'Palmeiras', 'Grêmio'],
    ['2022', 'Palmeiras', 'Internacional'],
    ['2021', 'Atlético-MG', 'Flamengo'],
    ['2020', 'Flamengo', 'Internacional'],
    ['2019', 'Flamengo', 'Palmeiras'],
    ['2018', 'Palmeiras', 'Flamengo']
  ]
},
{
  slug: 'libertadores',
  esporte: 'futebol',
  nome: 'Copa Libertadores',
  menu: 'Libertadores',
  regiao: 'América do Sul',
  temporada: '2026',
  frase: 'A Glória Eterna se decide em mata-mata.',
  intro: 'O maior torneio de clubes da América do Sul. Depois da fase de grupos, tudo é mata-mata em ida e volta até a final, que é jogo único em campo escolhido antes do torneio.',
  fase: 'Semifinais (jogos de volta em 21 e 22/10)',
  lider: { nome: 'Flamengo', info: 'Atual campeão (2025). Empatou a ida da semifinal com o Estudiantes por 0 x 0 e decide a vaga no Maracanã.' },
  confrontos: [
    { fase: 'Semifinal', a: 'Fluminense', b: 'Palmeiras', ida: '1 x 2', situacao: 'Volta em 21/10, às 21h30, no Nubank Parque (São Paulo). O Palmeiras avança com um empate; o Fluminense precisa vencer por dois gols para se classificar no tempo normal.' },
    { fase: 'Semifinal', a: 'Estudiantes', b: 'Flamengo', ida: '0 x 0', situacao: 'Volta em 22/10, às 21h30, no Maracanã (Rio de Janeiro). Quem vencer avança; novo empate leva a decisão para os pênaltis.' }
  ],
  jogos: [
    { fase: 'Semifinal – ida', d: '2026-10-14', h: '21:30', casa: 'Fluminense', fora: 'Palmeiras', l: 'Maracanã', p: '1 x 2' },
    { fase: 'Semifinal – ida', d: '2026-10-15', h: '21:30', casa: 'Estudiantes', fora: 'Flamengo', l: 'Estádio Jorge Luis Hirschi (UNO), La Plata', p: '0 x 0' },
    { fase: 'Semifinal – volta', d: '2026-10-21', h: '21:30', casa: 'Palmeiras', fora: 'Fluminense', l: 'Nubank Parque' },
    { fase: 'Semifinal – volta', d: '2026-10-22', h: '21:30', casa: 'Flamengo', fora: 'Estudiantes', l: 'Maracanã' },
    { fase: 'Final', d: '2026-11-28', casa: 'A definir', fora: 'A definir', l: 'Estádio Centenario, Montevidéu' }
  ],
  nota: 'Nas quartas, Estudiantes eliminou o Corinthians, Flamengo passou pelo Independiente del Valle e Fluminense pelo Platense.',
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Álex Arce', 'Independiente Rivadavia', '9'],
      ['Charli González', 'Independiente del Valle', '7'],
      ['Bruno Henrique', 'Flamengo', '5'],
      ['Matheus Pereira', 'Cruzeiro', '4'],
      ['Fernando Zampedri', 'Universidad Católica', '4'],
      ['Lorenzo Melgarejo', 'Libertad', '4']
    ]
  },
  sobre: [
    ['Criação', '1960'],
    ['Organização', 'CONMEBOL'],
    ['Maior campeão', 'Independiente (ARG), com 7 títulos'],
    ['Atual campeão', 'Flamengo (2025), que venceu o Palmeiras por 1 x 0 na final em Lima'],
    ['Final de 2026', 'Jogo único em 28/11, no Estádio Centenario, em Montevidéu'],
    ['Semifinais de 2026', 'Três brasileiros (Flamengo, Fluminense e Palmeiras) e o argentino Estudiantes']
  ],
  campeoes: [
    ['2025', 'Flamengo', 'Palmeiras'],
    ['2024', 'Botafogo', 'Atlético-MG'],
    ['2023', 'Fluminense', 'Boca Juniors'],
    ['2022', 'Flamengo', 'Athletico-PR'],
    ['2021', 'Palmeiras', 'Flamengo'],
    ['2020', 'Palmeiras', 'Santos'],
    ['2019', 'Flamengo', 'River Plate'],
    ['2018', 'River Plate', 'Boca Juniors']
  ]
},
{
  slug: 'sul-americana',
  esporte: 'futebol',
  nome: 'Copa Sul-Americana',
  menu: 'Sul-Americana',
  regiao: 'América do Sul',
  temporada: '2026',
  frase: 'Dois brasileiros a um passo da final.',
  intro: 'O segundo torneio de clubes da Conmebol. Os mata-matas são em ida e volta e a final é em jogo único. O campeão ganha vaga na Libertadores do ano seguinte.',
  fase: 'Semifinais (jogos de volta em 20 e 21/10)',
  lider: { nome: 'Lanús', info: 'Atual campeão (2025), venceu o Atlético-MG na final. Em 2026, Vasco e Atlético-MG venceram as idas das semifinais.' },
  confrontos: [
    { fase: 'Semifinal', a: 'Boca Juniors', b: 'Vasco', ida: '0 x 1', situacao: 'Volta em 20/10, às 21h30, no Maracanã. O Vasco joga pelo empate para chegar à sua primeira final de Sul-Americana.' },
    { fase: 'Semifinal', a: 'Atlético-MG', b: 'Montevideo City Torque', ida: '3 x 0', situacao: 'Volta em 21/10, às 19h, no Estádio Centenario, em Montevidéu. O Atlético pode perder por até dois gols de diferença.' }
  ],
  jogos: [
    { fase: 'Semifinal – ida', d: '2026-10-13', h: '21:30', casa: 'Boca Juniors', fora: 'Vasco', l: 'La Bombonera, Buenos Aires', p: '0 x 1' },
    { fase: 'Semifinal – ida', d: '2026-10-14', h: '19:00', casa: 'Atlético-MG', fora: 'Montevideo City Torque', l: 'Arena MRV, Belo Horizonte', p: '3 x 0' },
    { fase: 'Semifinal – volta', d: '2026-10-20', h: '21:30', casa: 'Vasco', fora: 'Boca Juniors', l: 'Maracanã' },
    { fase: 'Semifinal – volta', d: '2026-10-21', h: '19:00', casa: 'Montevideo City Torque', fora: 'Atlético-MG', l: 'Estádio Centenario, Montevidéu' },
    { fase: 'Final', d: '2026-11-21', casa: 'A definir', fora: 'A definir', l: 'Barranquilla (Colômbia)' }
  ],
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Salomón Rodríguez', 'Montevideo City Torque', '7'],
      ['Gabriel Barbosa (Gabigol)', 'Santos', '6'],
      ['Rodrigo Contreras', 'Millonarios', '5']
    ]
  },
  sobre: [
    ['Criação', '2002'],
    ['Organização', 'CONMEBOL'],
    ['Maiores campeões', 'Vários clubes com 2 títulos, entre eles Boca Juniors, Independiente, LDU, Athletico-PR, Independiente del Valle e Lanús'],
    ['Atual campeão', 'Lanús (2025), que venceu o Atlético-MG na final'],
    ['Final de 2026', 'Jogo único em 21/11, em Barranquilla, na Colômbia'],
    ['Maior artilheiro da história', 'Hernán Barcos, com 19 gols']
  ],
  campeoes: [
    ['2025', 'Lanús', 'Atlético-MG'],
    ['2024', 'Racing', 'Cruzeiro'],
    ['2023', 'LDU', 'Fortaleza'],
    ['2022', 'Independiente del Valle', 'São Paulo'],
    ['2021', 'Athletico-PR', 'Red Bull Bragantino'],
    ['2020', 'Defensa y Justicia', 'Lanús'],
    ['2019', 'Independiente del Valle', 'Colón'],
    ['2018', 'Athletico-PR', 'Junior Barranquilla']
  ]
},
{
  slug: 'champions-league',
  esporte: 'futebol',
  nome: 'Champions League',
  menu: 'Champions',
  regiao: 'Europa',
  temporada: '2026/27',
  frase: 'Os melhores clubes da Europa numa só tabela.',
  intro: 'Na fase de liga, os 36 clubes jogam oito partidas contra adversários diferentes. Os oito primeiros vão direto às oitavas, do 9º ao 24º disputam um playoff e os outros 12 estão fora.',
  fase: 'Fase de liga — 3ª rodada (20 e 21/10/2026)',
  lider: { nome: 'Paris Saint-Germain', info: '6 pontos e saldo +7 após 2 rodadas; nove clubes têm 100% de aproveitamento' },
  tabela: {
    titulo: 'Fase de liga — classificação após a 2ª rodada',
    colunas: ['Pos', 'Time', 'Pts', 'SG'],
    linhas: [
      ['1', 'Paris Saint-Germain', '6', '+7'],
      ['2', 'Barcelona', '6', '+7'],
      ['3', 'Aston Villa', '6', '+7'],
      ['4', 'Stuttgart', '6', '+5'],
      ['5', 'Liverpool', '6', '+4'],
      ['6', 'Sporting', '6', '+4'],
      ['7', 'Arsenal', '6', '+4'],
      ['8', 'Real Madrid', '6', '+2'],
      ['9', 'Real Betis', '6', '+2'],
      ['10', 'Bayern de Munique', '4', '+5']
    ],
    nota: 'Top 10 confirmado após a 2ª rodada (13 e 14/10). PSG, Barcelona e Aston Villa empatam em pontos e saldo; PSG lidera pelo número de gols marcados. Os 8 primeiros vão direto às oitavas; do 9º ao 24º disputam os playoffs.'
  },
  jogos: [
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Galatasaray', fora: 'Barcelona', p: '1 x 4' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Arsenal', fora: 'Lille', l: 'Emirates Stadium', p: '3 x 0' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Lens', fora: 'Sporting', p: '0 x 2' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'RB Leipzig', fora: 'PSV', p: '1 x 0' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Villarreal', fora: 'Napoli', p: '3 x 1' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Inter de Milão', fora: 'Club Brugge', p: '3 x 4' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Viking', fora: 'Bayern de Munique', p: '3 x 3' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Atlético de Madrid', fora: 'Manchester United', p: '2 x 0' },
    { fase: '2ª rodada', d: '2026-10-13', casa: 'Sabah', fora: 'Slavia Praga', p: '2 x 0' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Manchester City', fora: 'Paris Saint-Germain', l: 'Etihad Stadium', p: '2 x 4' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Roma', fora: 'Real Madrid', p: '3 x 4' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Aston Villa', fora: 'Fenerbahçe', l: 'Villa Park', p: '6 x 0' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'LASK', fora: 'Liverpool', p: '3 x 6' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Slovan Bratislava', fora: 'Stuttgart', p: '0 x 3' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Real Betis', fora: 'Porto', p: '3 x 2' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Feyenoord', fora: 'Como', p: '3 x 2' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Shakhtar Donetsk', fora: 'AEK Atenas', p: '3 x 1' },
    { fase: '3ª rodada', d: '2026-10-20', h: '13:45', casa: 'Fenerbahçe', fora: 'Slavia Praga', l: 'Estádio Şükrü Saracoğlu' },
    { fase: '3ª rodada', d: '2026-10-20', h: '13:45', casa: 'Sabah', fora: 'Borussia Dortmund' },
    { fase: '3ª rodada', d: '2026-10-20', h: '16:00', casa: 'Roma', fora: 'Slovan Bratislava', l: 'Estádio Olímpico' },
    { fase: '3ª rodada', d: '2026-10-20', h: '16:00', casa: 'Porto', fora: 'PSV', l: 'Estádio do Dragão' },
    { fase: '3ª rodada', d: '2026-10-20', h: '16:00', casa: 'Liverpool', fora: 'Villarreal', l: 'Anfield' },
    { fase: '3ª rodada', d: '2026-10-20', h: '16:00', casa: 'Manchester City', fora: 'AEK Atenas', l: 'Etihad Stadium' },
    { fase: '3ª rodada', d: '2026-10-20', h: '16:00', casa: 'Paris Saint-Germain', fora: 'Barcelona', l: 'Parc des Princes' },
    { fase: '3ª rodada', d: '2026-10-20', h: '16:00', casa: 'Napoli', fora: 'Bodø/Glimt', l: 'Estádio Diego Armando Maradona' },
    { fase: '3ª rodada', d: '2026-10-20', h: '16:00', casa: 'Stuttgart', fora: 'Atlético de Madrid', l: 'MHPArena' },
    { fase: '3ª rodada', d: '2026-10-21', h: '13:45', casa: 'Como', fora: 'Manchester United', l: 'Estádio Giuseppe Sinigaglia' },
    { fase: '3ª rodada', d: '2026-10-21', h: '13:45', casa: 'Lille', fora: 'Galatasaray', l: 'Estádio Pierre-Mauroy' },
    { fase: '3ª rodada', d: '2026-10-21', h: '16:00', casa: 'Aston Villa', fora: 'Viking', l: 'Villa Park' },
    { fase: '3ª rodada', d: '2026-10-21', h: '16:00', casa: 'Club Brugge', fora: 'Lens', l: 'Estádio Jan Breydel' },
    { fase: '3ª rodada', d: '2026-10-21', h: '16:00', casa: 'Bayern de Munique', fora: 'Arsenal', l: 'Allianz Arena' },
    { fase: '3ª rodada', d: '2026-10-21', h: '16:00', casa: 'Inter de Milão', fora: 'Shakhtar Donetsk', l: 'San Siro' },
    { fase: '3ª rodada', d: '2026-10-21', h: '16:00', casa: 'Real Madrid', fora: 'RB Leipzig', l: 'Santiago Bernabéu' },
    { fase: '3ª rodada', d: '2026-10-21', h: '16:00', casa: 'Real Betis', fora: 'Feyenoord' },
    { fase: '3ª rodada', d: '2026-10-21', h: '16:00', casa: 'Sporting', fora: 'LASK', l: 'Estádio José Alvalade' }
  ],
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Erling Haaland', 'Manchester City', '4'],
      ['Ermedin Demirović', 'Stuttgart', '4'],
      ['Nicolò Tresoldi', 'Club Brugge', '4'],
      ['Bradley Barcola', 'Liverpool', '3'],
      ['Ousmane Dembélé', 'Paris Saint-Germain', '3'],
      ['Ferran Torres', 'Paris Saint-Germain', '3'],
      ['Harry Kane', 'Bayern de Munique', '3'],
      ['Nicolas Jackson', 'Aston Villa', '3']
    ]
  },
  sobre: [
    ['Criação', '1955 (como Copa dos Campeões; Champions League desde 1992/93)'],
    ['Clubes na fase de liga', '36'],
    ['Maior campeão', 'Real Madrid (15 títulos)'],
    ['Atual campeão', 'Paris Saint-Germain (2025/26, bicampeão seguido)'],
    ['Final 2027', 'Estadio Metropolitano, Madri — 5 de junho de 2027']
  ],
  campeoes: [
    ['2025/26', 'Paris Saint-Germain', 'Arsenal'],
    ['2024/25', 'Paris Saint-Germain', 'Inter de Milão'],
    ['2023/24', 'Real Madrid', 'Borussia Dortmund'],
    ['2022/23', 'Manchester City', 'Inter de Milão'],
    ['2021/22', 'Real Madrid', 'Liverpool'],
    ['2020/21', 'Chelsea', 'Manchester City'],
    ['2019/20', 'Bayern de Munique', 'Paris Saint-Germain'],
    ['2018/19', 'Liverpool', 'Tottenham']
  ]
},
{
  slug: 'premier-league',
  esporte: 'futebol',
  nome: 'Premier League',
  menu: 'Premier League',
  regiao: 'Inglaterra',
  temporada: '2026/27',
  frase: 'A liga mais rica do mundo.',
  intro: 'Vinte clubes em pontos corridos, 38 rodadas de agosto a maio. Os primeiros vão para a Champions League e os três últimos caem para a Championship.',
  fase: '7ª rodada (Tottenham x Coventry fecha a rodada em 19/10)',
  lider: { nome: 'Manchester City', info: '21 pontos, 100% de aproveitamento em 7 jogos; Arsenal é o vice com 18' },
  tabela: {
    titulo: 'Classificação após a 7ª rodada (parcial)',
    colunas: ['Pos', 'Time', 'J', 'Pts'],
    linhas: [
      ['1', 'Manchester City', '7', '21'],
      ['2', 'Arsenal', '7', '18'],
      ['3', 'Brighton', '7', '16'],
      ['4', 'Chelsea', '7', '13'],
      ['5', 'Liverpool', '7', '12'],
      ['6', 'Brentford', '7', '10'],
      ['7', 'Leeds United', '7', '10'],
      ['8', 'Everton', '7', '10'],
      ['9', 'Hull City', '7', '9'],
      ['10', 'Ipswich Town', '7', '9'],
      ['11', 'Newcastle', '7', '8'],
      ['12', 'Aston Villa', '7', '8'],
      ['13', 'Manchester United', '7', '7'],
      ['14', 'Crystal Palace', '7', '7'],
      ['15', 'Coventry City', '6', '6'],
      ['16', 'Bournemouth', '7', '6'],
      ['17', 'Fulham', '7', '5'],
      ['18', 'Nottingham Forest', '7', '5'],
      ['19', 'Sunderland', '7', '4'],
      ['20', 'Tottenham', '6', '3']
    ],
    nota: 'Após os jogos de 17 e 18/10; Tottenham x Coventry (19/10) ainda não entrou. A ordem entre times empatados em pontos (11º–12º e 15º–16º) pode variar por saldo de gols.'
  },
  jogos: [
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Everton', fora: 'Chelsea', p: '0 x 2' },
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Brentford', fora: 'Liverpool', l: 'Gtech Community Stadium', p: '1 x 2' },
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Fulham', fora: 'Hull City', l: 'Craven Cottage', p: '1 x 0' },
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Manchester City', fora: 'Ipswich Town', l: 'Etihad Stadium', p: '3 x 2' },
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Newcastle', fora: 'Aston Villa', l: 'St James\' Park', p: '0 x 1' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Bournemouth', fora: 'Sunderland', p: '2 x 0' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Brighton', fora: 'Crystal Palace', l: 'Amex Stadium', p: '5 x 0' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Leeds United', fora: 'Manchester United', l: 'Elland Road', p: '1 x 1' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Nottingham Forest', fora: 'Arsenal', l: 'City Ground', p: '0 x 1' },
    { fase: '7ª rodada', d: '2026-10-19', h: '16:00', casa: 'Tottenham', fora: 'Coventry City', l: 'Tottenham Hotspur Stadium' },
    { fase: '8ª rodada', d: '2026-10-23', h: '16:00', casa: 'Ipswich Town', fora: 'Nottingham Forest', l: 'Portman Road' },
    { fase: '8ª rodada', d: '2026-10-24', h: '08:30', casa: 'Aston Villa', fora: 'Manchester City', l: 'Villa Park' },
    { fase: '8ª rodada', d: '2026-10-24', h: '11:00', casa: 'Arsenal', fora: 'Everton', l: 'Emirates Stadium' },
    { fase: '8ª rodada', d: '2026-10-24', h: '11:00', casa: 'Coventry City', fora: 'Fulham', l: 'Coventry Building Society Arena' },
    { fase: '8ª rodada', d: '2026-10-24', h: '13:30', casa: 'Chelsea', fora: 'Tottenham', l: 'Stamford Bridge' },
    { fase: '8ª rodada', d: '2026-10-25', casa: 'Sunderland', fora: 'Leeds United', l: 'Stadium of Light' },
    { fase: '8ª rodada', d: '2026-10-25', h: '11:00', casa: 'Crystal Palace', fora: 'Newcastle', l: 'Selhurst Park' },
    { fase: '8ª rodada', d: '2026-10-25', h: '11:00', casa: 'Hull City', fora: 'Brentford', l: 'MKM Stadium' },
    { fase: '8ª rodada', d: '2026-10-25', h: '11:00', casa: 'Liverpool', fora: 'Brighton', l: 'Anfield' },
    { fase: '8ª rodada', d: '2026-10-25', h: '11:00', casa: 'Manchester United', fora: 'Bournemouth', l: 'Old Trafford' }
  ],
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Erling Haaland', 'Manchester City', '8'],
      ['João Pedro', 'Chelsea', '5'],
      ['Alexander Isak', 'Liverpool', '5'],
      ['Rayan Cherki', 'Manchester City', '4'],
      ['Morgan Rogers', 'Aston Villa', '4']
    ]
  },
  sobre: [
    ['Criação', '1992 (primeira temporada em 1992/93)'],
    ['Clubes', '20'],
    ['Maior campeão', 'Manchester United (13 títulos da Premier League)'],
    ['Atual campeão', 'Arsenal (2025/26, primeiro título desde 2003/04)'],
    ['Rebaixamento', '3 clubes caem para a Championship']
  ],
  campeoes: [
    ['2025/26', 'Arsenal', 'Manchester City'],
    ['2024/25', 'Liverpool', 'Arsenal'],
    ['2023/24', 'Manchester City', 'Arsenal'],
    ['2022/23', 'Manchester City', 'Arsenal'],
    ['2021/22', 'Manchester City', 'Liverpool'],
    ['2020/21', 'Manchester City', 'Manchester United'],
    ['2019/20', 'Liverpool', 'Manchester City'],
    ['2018/19', 'Manchester City', 'Liverpool']
  ]
},
{
  slug: 'la-liga',
  esporte: 'futebol',
  nome: 'La Liga',
  menu: 'La Liga',
  regiao: 'Espanha',
  temporada: '2026/27',
  frase: 'Barcelona e Real Madrid, e quem tiver coragem de se meter.',
  intro: 'O Campeonato Espanhol: 20 clubes, pontos corridos e 38 rodadas. Os quatro primeiros vão para a Champions League e os três últimos caem.',
  fase: '9ª rodada (Getafe x Rayo Vallecano fecha a rodada em 19/10)',
  lider: { nome: 'Barcelona', info: '27 pontos, 9 vitórias em 9 jogos; Atlético de Madrid é o vice com 22' },
  tabela: {
    titulo: 'Classificação após a 9ª rodada (parcial)',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [
      ['1', 'Barcelona', '27'],
      ['2', 'Atlético de Madrid', '22'],
      ['3', 'Real Madrid', '21'],
      ['4', 'Real Betis', '19'],
      ['5', 'Real Sociedad', '16'],
      ['6', 'Sevilla', '14'],
      ['7', 'Alavés', '11'],
      ['8', 'Celta de Vigo', '11'],
      ['9', 'Deportivo La Coruña', '11'],
      ['10', 'Osasuna', '11'],
      ['11', 'Athletic Bilbao', '9'],
      ['12', 'Villarreal', '9'],
      ['13', 'Espanyol', '8'],
      ['14', 'Rayo Vallecano', '8'],
      ['15', 'Getafe', '8'],
      ['16', 'Racing Santander', '8'],
      ['17', 'Levante', '7'],
      ['18', 'Elche', '7'],
      ['19', 'Valencia', '6'],
      ['20', 'Málaga', '4']
    ],
    nota: 'Após os jogos de 16 a 18/10; Getafe x Rayo Vallecano (19/10) ainda não entrou. Barcelona, Atlético, Real Madrid, Alavés, Villarreal e Málaga têm 9 jogos; Getafe e Rayo têm 8; o Athletic tem 7 (dois jogos a menos).'
  },
  jogos: [
    { fase: '9ª rodada', d: '2026-10-16', casa: 'Deportivo La Coruña', fora: 'Levante', l: 'Riazor', p: '1 x 1' },
    { fase: '9ª rodada', d: '2026-10-17', casa: 'Espanyol', fora: 'Atlético de Madrid', l: 'RCDE Stadium', p: '0 x 1' },
    { fase: '9ª rodada', d: '2026-10-17', casa: 'Villarreal', fora: 'Elche', l: 'Estádio de La Cerámica', p: '0 x 0' },
    { fase: '9ª rodada', d: '2026-10-17', casa: 'Real Betis', fora: 'Barcelona', l: 'Estádio de La Cartuja', p: '2 x 5' },
    { fase: '9ª rodada', d: '2026-10-17', casa: 'Valencia', fora: 'Athletic Bilbao', l: 'Mestalla', p: '0 x 0' },
    { fase: '9ª rodada', d: '2026-10-18', casa: 'Real Madrid', fora: 'Sevilla', l: 'Santiago Bernabéu', p: '4 x 1' },
    { fase: '9ª rodada', d: '2026-10-18', casa: 'Málaga', fora: 'Real Sociedad', l: 'La Rosaleda', p: '2 x 5' },
    { fase: '9ª rodada', d: '2026-10-18', casa: 'Celta de Vigo', fora: 'Alavés', l: 'Balaídos', p: '2 x 1' },
    { fase: '9ª rodada', d: '2026-10-18', casa: 'Osasuna', fora: 'Racing Santander', l: 'El Sadar', p: '2 x 0' },
    { fase: '9ª rodada', d: '2026-10-19', casa: 'Getafe', fora: 'Rayo Vallecano', l: 'Coliseum' },
    { fase: '10ª rodada', d: '2026-10-23', h: '16:00', casa: 'Alavés', fora: 'Málaga', l: 'Mendizorroza' },
    { fase: '10ª rodada', d: '2026-10-24', h: '09:00', casa: 'Rayo Vallecano', fora: 'Elche', l: 'Estádio de Vallecas' },
    { fase: '10ª rodada', d: '2026-10-24', h: '11:15', casa: 'Racing Santander', fora: 'Espanyol', l: 'El Sardinero' },
    { fase: '10ª rodada', d: '2026-10-24', h: '13:30', casa: 'Valencia', fora: 'Villarreal', l: 'Mestalla' },
    { fase: '10ª rodada', d: '2026-10-24', h: '16:00', casa: 'Atlético de Madrid', fora: 'Deportivo La Coruña', l: 'Metropolitano' },
    { fase: '10ª rodada', d: '2026-10-25', casa: 'Athletic Bilbao', fora: 'Getafe', l: 'San Mamés' },
    { fase: '10ª rodada', d: '2026-10-25', h: '12:15', casa: 'Celta de Vigo', fora: 'Real Betis', l: 'Balaídos' },
    { fase: '10ª rodada', d: '2026-10-25', h: '14:30', casa: 'Real Sociedad', fora: 'Levante', l: 'Reale Arena' },
    { fase: '10ª rodada', d: '2026-10-25', h: '17:00', casa: 'Barcelona', fora: 'Real Madrid', l: 'Camp Nou' },
    { fase: '10ª rodada', d: '2026-10-26', h: '17:00', casa: 'Sevilla', fora: 'Osasuna', l: 'Ramón Sánchez-Pizjuán' }
  ],
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Raphinha', 'Barcelona', '12'],
      ['Kylian Mbappé', 'Real Madrid', '9'],
      ['Lamine Yamal', 'Barcelona', '8']
    ]
  },
  sobre: [
    ['Criação', '1929'],
    ['Clubes', '20'],
    ['Maior campeão', 'Real Madrid (36 títulos)'],
    ['Atual campeão', 'Barcelona (2025/26, 29º título e bicampeonato seguido)'],
    ['Rebaixamento', '3 clubes caem para a Segunda Divisão']
  ],
  campeoes: [
    ['2025/26', 'Barcelona', 'Real Madrid'],
    ['2024/25', 'Barcelona', 'Real Madrid'],
    ['2023/24', 'Real Madrid', 'Barcelona'],
    ['2022/23', 'Barcelona', 'Real Madrid'],
    ['2021/22', 'Real Madrid', 'Barcelona'],
    ['2020/21', 'Atlético de Madrid', 'Real Madrid'],
    ['2019/20', 'Real Madrid', 'Barcelona'],
    ['2018/19', 'Barcelona', 'Atlético de Madrid']
  ]
},
{
  slug: 'bundesliga',
  esporte: 'futebol',
  nome: 'Bundesliga',
  menu: 'Bundesliga',
  regiao: 'Alemanha',
  temporada: '2026/27',
  frase: 'Estádios cheios e o Bayern sempre por perto.',
  intro: 'O Campeonato Alemão tem 18 clubes e 34 rodadas. Os quatro primeiros vão para a Champions League, os dois últimos caem e o 16º disputa a repescagem contra o 3º da segunda divisão.',
  fase: 'Após a 6ª rodada; 7ª rodada de 23 a 25/10/2026',
  lider: { nome: 'Bayern de Munique', info: '14 pontos em 6 jogos (4V 2E), saldo +17; empatado em pontos com o Borussia Dortmund (+7)' },
  tabela: {
    titulo: 'Classificação da Bundesliga 2026/27 – após a 6ª rodada',
    colunas: ['Pos', 'Time', 'J', 'Pts'],
    linhas: [
      ['1', 'Bayern de Munique', '6', '14'],
      ['2', 'Borussia Dortmund', '6', '14'],
      ['3', 'Freiburg', '6', '13'],
      ['4', 'Bayer Leverkusen', '6', '13'],
      ['5', 'Mainz 05', '6', '10'],
      ['6', 'Elversberg', '6', '10'],
      ['7', 'RB Leipzig', '6', '9'],
      ['8', 'Werder Bremen', '6', '9'],
      ['9', 'Hamburgo', '6', '9'],
      ['10', 'Augsburg', '6', '8'],
      ['11', 'Eintracht Frankfurt', '6', '8'],
      ['12', 'Colônia', '6', '7'],
      ['13', 'Stuttgart', '6', '6'],
      ['14', 'Hoffenheim', '6', '6'],
      ['15', 'Schalke 04', '6', '5'],
      ['16', 'Paderborn', '6', '5'],
      ['17', 'Union Berlin', '6', '5'],
      ['18', 'Borussia Mönchengladbach', '6', '0']
    ],
    nota: 'Tabela conferida em Reviersport e Sportschau após a 6ª rodada (16 a 18/10/2026). Bayern e Dortmund empatados em pontos; Bayern à frente no saldo de gols.'
  },
  jogos: [
    { fase: '6ª rodada', d: '2026-10-16', casa: 'Eintracht Frankfurt', fora: 'Colônia', l: 'Deutsche Bank Park', p: '1 x 0' },
    { fase: '6ª rodada', d: '2026-10-17', casa: 'Union Berlin', fora: 'Borussia Dortmund', l: 'Stadion An der Alten Försterei', p: '0 x 0' },
    { fase: '6ª rodada', d: '2026-10-17', casa: 'Bayern de Munique', fora: 'RB Leipzig', l: 'Allianz Arena', p: '6 x 1' },
    { fase: '6ª rodada', d: '2026-10-18', casa: 'Bayer Leverkusen', fora: 'Freiburg', l: 'BayArena', p: '2 x 1' },
    { fase: '6ª rodada', d: '2026-10-18', h: '12:30', casa: 'Borussia Mönchengladbach', fora: 'Hoffenheim', l: 'Borussia-Park', p: '1 x 2' },
    { fase: '7ª rodada', d: '2026-10-23', h: '15:30', casa: 'Stuttgart', fora: 'Borussia Mönchengladbach', l: 'MHPArena' },
    { fase: '7ª rodada', d: '2026-10-24', h: '10:30', casa: 'RB Leipzig', fora: 'Elversberg', l: 'Red Bull Arena' },
    { fase: '7ª rodada', d: '2026-10-24', h: '10:30', casa: 'Augsburg', fora: 'Union Berlin', l: 'WWK Arena' },
    { fase: '7ª rodada', d: '2026-10-24', h: '10:30', casa: 'Mainz 05', fora: 'Werder Bremen', l: 'Mewa Arena' },
    { fase: '7ª rodada', d: '2026-10-24', h: '10:30', casa: 'Colônia', fora: 'Schalke 04', l: 'RheinEnergieStadion' },
    { fase: '7ª rodada', d: '2026-10-24', h: '10:30', casa: 'Paderborn', fora: 'Hamburgo', l: 'Home Deluxe Arena' },
    { fase: '7ª rodada', d: '2026-10-24', h: '13:30', casa: 'Borussia Dortmund', fora: 'Eintracht Frankfurt', l: 'Signal Iduna Park' },
    { fase: '7ª rodada', d: '2026-10-25', h: '11:30', casa: 'Hoffenheim', fora: 'Bayer Leverkusen', l: 'PreZero Arena' },
    { fase: '7ª rodada', d: '2026-10-25', h: '13:30', casa: 'Freiburg', fora: 'Bayern de Munique', l: 'Europa-Park Stadion' },
    { fase: '6ª rodada', casa: 'Hamburgo', fora: 'Stuttgart', p: '1 x 0' },
    { fase: '6ª rodada', casa: 'Werder Bremen', fora: 'Paderborn', p: '2 x 2' },
    { fase: '6ª rodada', casa: 'Schalke 04', fora: 'Mainz 05', p: '0 x 1' },
    { fase: '6ª rodada', casa: 'Elversberg', fora: 'Augsburg', p: '4 x 3' }
  ],
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Niclas Füllkrug', 'Werder Bremen', '6'],
      ['Younes Ebnoutalib', 'Eintracht Frankfurt', '5'],
      ['Patrik Schick', 'Bayer Leverkusen', '5'],
      ['Phillip Tietz', 'Mainz 05', '5'],
      ['Luis Díaz', 'Bayern de Munique', '4']
    ]
  },
  sobre: [
    ['Criação', '1963 (primeira temporada em 1963/64)'],
    ['Clubes', '18'],
    ['Maior campeão', 'Bayern de Munique – 34 títulos da Bundesliga (35 títulos alemães no total)'],
    ['Atual campeão', 'Bayern de Munique (2025/26)'],
    ['Recorde de gols', 'Bayern marcou 105 gols em 2025/26, recorde da competição'],
    ['Rebaixamento', 'Dois últimos caem direto; o 16º disputa playoff com o 3º da 2. Bundesliga']
  ],
  campeoes: [
    ['2025/26', 'Bayern de Munique', 'Borussia Dortmund'],
    ['2024/25', 'Bayern de Munique', 'Bayer Leverkusen'],
    ['2023/24', 'Bayer Leverkusen', 'Stuttgart'],
    ['2022/23', 'Bayern de Munique', 'Borussia Dortmund'],
    ['2021/22', 'Bayern de Munique', 'Borussia Dortmund'],
    ['2020/21', 'Bayern de Munique', 'RB Leipzig'],
    ['2019/20', 'Bayern de Munique', 'Borussia Dortmund'],
    ['2018/19', 'Bayern de Munique', 'Borussia Dortmund']
  ]
},
{
  slug: 'serie-a',
  esporte: 'futebol',
  nome: 'Serie A',
  menu: 'Serie A',
  regiao: 'Itália',
  temporada: '2026/27',
  frase: 'O Campeonato Italiano, onde cada gol custa caro.',
  intro: 'Vinte clubes em pontos corridos, 38 rodadas. Os quatro primeiros vão para a Champions League e os três últimos caem para a Serie B.',
  fase: '7ª rodada em andamento (faltam Monza x Cagliari e Parma x Torino, nesta segunda, 19/10); 8ª rodada de 23 a 25/10/2026',
  lider: { nome: 'Inter de Milão e Lazio', info: '19 pontos em 7 jogos cada; a Roma vem logo atrás com 17' },
  tabela: {
    titulo: 'Classificação da Serie A 2026/27 – 7ª rodada (parcial)',
    colunas: ['Pos', 'Time', 'J', 'Pts'],
    linhas: [
      ['1', 'Inter de Milão', '7', '19'],
      ['2', 'Lazio', '7', '19'],
      ['3', 'Roma', '7', '17'],
      ['4', 'Milan', '7', '15'],
      ['5', 'Como', '7', '14'],
      ['6', 'Frosinone', '7', '13'],
      ['7', 'Cagliari', '6', '13'],
      ['8', 'Juventus', '7', '11'],
      ['9', 'Napoli', '7', '10'],
      ['10', 'Atalanta', '7', '9'],
      ['11', 'Lecce', '7', '9'],
      ['12', 'Sassuolo', '7', '8'],
      ['13', 'Torino', '6', '7'],
      ['14', 'Bologna', '7', '5'],
      ['–', 'Udinese', '7', '4'],
      ['–', 'Fiorentina', '7', '4'],
      ['–', 'Genoa', '7', '4'],
      ['–', 'Monza', '6', '4'],
      ['–', 'Parma', '6', '4'],
      ['20', 'Venezia', '7', '3']
    ],
    nota: 'Pontos conferidos com resultados da 7ª rodada (Corriere dello Sport, Virgilio, Sky) até 18/10/2026; ainda faltam Monza x Cagliari e Parma x Torino. Ordem entre Inter/Lazio, Atalanta/Lecce e entre os cinco times com 4 pontos não confirmada (critérios de desempate).'
  },
  jogos: [
    { fase: '7ª rodada', d: '2026-10-16', h: '15:45', casa: 'Frosinone', fora: 'Sassuolo', l: 'Stadio Benito Stirpe', p: '4 x 2' },
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Venezia', fora: 'Napoli', l: 'Stadio Pier Luigi Penzo', p: '1 x 0' },
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Bologna', fora: 'Inter de Milão', l: 'Stadio Renato Dall\'Ara', p: '1 x 3' },
    { fase: '7ª rodada', d: '2026-10-17', h: '15:45', casa: 'Roma', fora: 'Genoa', l: 'Stadio Olimpico', p: '2 x 0' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Udinese', fora: 'Lecce', l: 'Bluenergy Stadium', p: '0 x 3' },
    { fase: '7ª rodada', d: '2026-10-19', h: '13:30', casa: 'Monza', fora: 'Cagliari', l: 'U-Power Stadium' },
    { fase: '7ª rodada', d: '2026-10-19', h: '15:45', casa: 'Parma', fora: 'Torino', l: 'Stadio Ennio Tardini' },
    { fase: '8ª rodada', d: '2026-10-23', h: '15:45', casa: 'Torino', fora: 'Monza', l: 'Stadio Olimpico Grande Torino' },
    { fase: '8ª rodada', d: '2026-10-24', h: '10:00', casa: 'Cagliari', fora: 'Bologna', l: 'Unipol Domus' },
    { fase: '8ª rodada', d: '2026-10-24', h: '10:00', casa: 'Como', fora: 'Sassuolo', l: 'Stadio Giuseppe Sinigaglia' },
    { fase: '8ª rodada', d: '2026-10-24', h: '13:00', casa: 'Napoli', fora: 'Roma', l: 'Stadio Diego Armando Maradona' },
    { fase: '8ª rodada', d: '2026-10-24', h: '15:45', casa: 'Lazio', fora: 'Parma', l: 'Stadio Olimpico' },
    { fase: '8ª rodada', d: '2026-10-25', h: '08:30', casa: 'Inter de Milão', fora: 'Fiorentina', l: 'San Siro' },
    { fase: '8ª rodada', d: '2026-10-25', h: '11:00', casa: 'Atalanta', fora: 'Frosinone', l: 'Bérgamo' },
    { fase: '8ª rodada', d: '2026-10-25', h: '11:00', casa: 'Genoa', fora: 'Venezia', l: 'Stadio Luigi Ferraris' },
    { fase: '8ª rodada', d: '2026-10-25', h: '14:00', casa: 'Lecce', fora: 'Juventus', l: 'Stadio Via del Mare' },
    { fase: '8ª rodada', d: '2026-10-25', h: '16:45', casa: 'Udinese', fora: 'Milan', l: 'Bluenergy Stadium' },
    { fase: '7ª rodada', casa: 'Juventus', fora: 'Lazio', l: 'Allianz Stadium', p: '0 x 3' },
    { fase: '7ª rodada', casa: 'Milan', fora: 'Atalanta', l: 'San Siro', p: '3 x 2' },
    { fase: '7ª rodada', casa: 'Fiorentina', fora: 'Como', l: 'Stadio Artemio Franchi', p: '1 x 3' }
  ],
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Antonio Raimondo', 'Frosinone', '7'],
      ['Donyell Malen', 'Roma', '6'],
      ['Lautaro Martínez', 'Inter de Milão', '4']
    ]
  },
  sobre: [
    ['Criação', 'Campeonato Italiano disputado desde 1898; Serie A em turno único desde 1929/30'],
    ['Clubes', '20'],
    ['Maior campeão', 'Juventus – 36 títulos'],
    ['Atual campeão', 'Inter de Milão (2025/26), 21º scudetto'],
    ['Campanha do título 2025/26', 'Inter somou 87 pontos e garantiu o título com três rodadas de antecedência, em 3/5/2026'],
    ['Rebaixamento', 'Os três últimos caem para a Serie B']
  ],
  campeoes: [
    ['2025/26', 'Inter de Milão', 'Napoli'],
    ['2024/25', 'Napoli', 'Inter de Milão'],
    ['2023/24', 'Inter de Milão', 'Milan'],
    ['2022/23', 'Napoli', 'Lazio'],
    ['2021/22', 'Milan', 'Inter de Milão'],
    ['2020/21', 'Inter de Milão', 'Milan'],
    ['2019/20', 'Juventus', 'Inter de Milão'],
    ['2018/19', 'Juventus', 'Napoli']
  ]
},
{
  slug: 'ligue-1',
  esporte: 'futebol',
  nome: 'Ligue 1',
  menu: 'Ligue 1',
  regiao: 'França',
  temporada: '2026/27',
  frase: 'Quatro times empatados na ponta.',
  intro: 'O Campeonato Francês tem 18 clubes e 34 rodadas, de agosto a maio. Os primeiros vão para a Champions League e os últimos caem para a Ligue 2.',
  fase: 'Após a 7ª rodada; 8ª rodada de 23 a 25/10/2026',
  lider: { nome: 'Lyon', info: '14 pontos em 7 jogos (4V 2E 1D), saldo +8; lidera no saldo em empate quíntuplo com PSG, Paris FC, Lille e Monaco' },
  tabela: {
    titulo: 'Classificação da Ligue 1 2026/27 – após a 7ª rodada',
    colunas: ['Pos', 'Time', 'J', 'Pts'],
    linhas: [
      ['1', 'Lyon', '7', '14'],
      ['2', 'Paris Saint-Germain', '7', '14'],
      ['3', 'Paris FC', '7', '14'],
      ['4', 'Lille', '7', '14'],
      ['5', 'Monaco', '7', '14'],
      ['6', 'Rennes', '7', '13'],
      ['7', 'Lorient', '7', '11'],
      ['8', 'Lens', '7', '10'],
      ['–', 'Olympique de Marselha', '7', '9'],
      ['–', 'Brest', '7', '9'],
      ['–', 'Toulouse', '7', '9'],
      ['–', 'Auxerre', '7', '9'],
      ['–', 'Nice', '7', '8'],
      ['–', 'Strasbourg', '7', '7'],
      ['18', 'Le Havre', '7', '2']
    ],
    nota: 'Após a 7ª rodada (16 a 18/10/2026), segundo Sports Infos/L\'Équipe. Cinco clubes empatados com 14 pontos, algo inédito a essa altura de uma temporada da Ligue 1. Posições entre os times com 9 pontos não confirmadas; Angers, Le Mans e Troyes ficaram de fora por falta de dados consistentes.'
  },
  jogos: [
    { fase: '7ª rodada', d: '2026-10-17', casa: 'Strasbourg', fora: 'Paris Saint-Germain', l: 'Stade de la Meinau', p: '1 x 3' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Le Havre', fora: 'Auxerre', l: 'Stade Océane', p: '1 x 3' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Paris FC', fora: 'Rennes', p: '4 x 3' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Angers', fora: 'Olympique de Marselha', l: 'Stade Raymond-Kopa', p: '2 x 5' },
    { fase: '7ª rodada', d: '2026-10-18', casa: 'Lyon', fora: 'Nice', l: 'Groupama Stadium', p: '2 x 1' },
    { fase: '8ª rodada', d: '2026-10-23', h: '15:45', casa: 'Brest', fora: 'Nice', l: 'Stade Francis-Le Blé' },
    { fase: '8ª rodada', d: '2026-10-24', h: '12:15', casa: 'Toulouse', fora: 'Troyes', l: 'Stadium de Toulouse' },
    { fase: '8ª rodada', d: '2026-10-24', h: '15:45', casa: 'Lens', fora: 'Paris FC', l: 'Stade Bollaert-Delelis' },
    { fase: '8ª rodada', d: '2026-10-25', h: '11:00', casa: 'Monaco', fora: 'Lille', l: 'Stade Louis-II' },
    { fase: '8ª rodada', d: '2026-10-25', h: '13:15', casa: 'Rennes', fora: 'Strasbourg', l: 'Roazhon Park' },
    { fase: '8ª rodada', d: '2026-10-25', h: '13:15', casa: 'Olympique de Marselha', fora: 'Le Havre', l: 'Orange Vélodrome' },
    { fase: '8ª rodada', d: '2026-10-25', h: '13:15', casa: 'Auxerre', fora: 'Le Mans', l: 'Stade de l\'Abbé-Deschamps' },
    { fase: '8ª rodada', d: '2026-10-25', h: '13:15', casa: 'Angers', fora: 'Lorient', l: 'Stade Raymond-Kopa' },
    { fase: '8ª rodada', d: '2026-10-25', h: '16:45', casa: 'Paris Saint-Germain', fora: 'Lyon', l: 'Parque dos Príncipes' },
    { fase: '7ª rodada', casa: 'Lorient', fora: 'Monaco', p: '1 x 0' },
    { fase: '7ª rodada', casa: 'Lille', fora: 'Brest', p: '1 x 1' },
    { fase: '7ª rodada', casa: 'Troyes', fora: 'Lens', p: '1 x 3' },
    { fase: '7ª rodada', casa: 'Le Mans', fora: 'Toulouse', p: '0 x 3' }
  ],
  destaques: {
    titulo: 'Artilheiros',
    colunas: ['Jogador', 'Time', 'Gols'],
    linhas: [
      ['Estéban Lepaul', 'Rennes', '7'],
      ['Lassine Sinayoko', 'Paris FC', '6'],
      ['Casper Tengstedt', 'Toulouse', '5'],
      ['Amine Gouiri', 'Olympique de Marselha', '5'],
      ['Ferran Torres', 'Paris Saint-Germain', '4'],
      ['Paris Brunner', 'Monaco', '4'],
      ['Cameron Archer', 'Auxerre', '4']
    ]
  },
  sobre: [
    ['Criação', '1932 (primeira edição profissional em 1932/33)'],
    ['Clubes', '18'],
    ['Maior campeão', 'Paris Saint-Germain – 14 títulos'],
    ['Atual campeão', 'Paris Saint-Germain (2025/26), quinto título seguido'],
    ['Vice 2025/26', 'Lens, de Pierre Sage'],
    ['Rebaixamento', 'Dois últimos caem direto; o 16º disputa playoff com time da Ligue 2']
  ],
  campeoes: [
    ['2025/26', 'Paris Saint-Germain', 'Lens'],
    ['2024/25', 'Paris Saint-Germain', 'Olympique de Marselha'],
    ['2023/24', 'Paris Saint-Germain', 'Monaco'],
    ['2022/23', 'Paris Saint-Germain', 'Lens'],
    ['2021/22', 'Paris Saint-Germain', 'Olympique de Marselha'],
    ['2020/21', 'Lille', 'Paris Saint-Germain'],
    ['2019/20', 'Paris Saint-Germain', 'Olympique de Marselha'],
    ['2018/19', 'Paris Saint-Germain', 'Lille']
  ]
},

/* ---------------- Basquete ---------------- */
{
  slug: 'nba',
  esporte: 'basquete',
  nome: 'NBA',
  menu: 'NBA',
  regiao: 'Estados Unidos e Canadá',
  temporada: '2026/27',
  frase: 'A temporada começa na terça, 20 de outubro.',
  intro: 'Trinta times divididos em Conferência Leste e Oeste, 82 jogos cada na temporada regular. Os seis primeiros de cada lado vão direto aos playoffs, do 7º ao 10º jogam o play-in e as séries são melhor de sete até as Finais.',
  fase: 'Pré-temporada: a temporada regular 2026/27 começa em 20/10/2026',
  lider: { nome: 'New York Knicks', info: 'Atual campeão: venceu o San Antonio Spurs por 4 a 1 nas Finais de 2026 e encerrou um jejum de 53 anos' },
  jogos: [
    { fase: 'Temporada regular (abertura)', d: '2026-10-20', h: '16:00', casa: 'Detroit Pistons', fora: 'Boston Celtics', l: 'Little Caesars Arena (Detroit)' },
    { fase: 'Temporada regular (abertura)', d: '2026-10-20', h: '20:00', casa: 'New York Knicks', fora: 'Philadelphia 76ers', l: 'Madison Square Garden (Nova York)' },
    { fase: 'Temporada regular (abertura)', d: '2026-10-20', h: '22:30', casa: 'San Antonio Spurs', fora: 'Oklahoma City Thunder', l: 'Frost Bank Center (San Antonio)' },
    { fase: 'Temporada regular', d: '2026-10-21', h: '20:30', casa: 'Miami Heat', fora: 'Minnesota Timberwolves', l: 'Kaseya Center (Miami)' },
    { fase: 'Temporada regular', d: '2026-10-21', h: '23:00', casa: 'Los Angeles Lakers', fora: 'Golden State Warriors', l: 'Crypto.com Arena (Los Angeles)' },
    { fase: 'Temporada regular', d: '2026-10-22', h: '20:00', casa: 'Philadelphia 76ers', fora: 'Cleveland Cavaliers', l: 'Xfinity Mobile Arena (Filadélfia)' },
    { fase: 'Temporada regular', d: '2026-10-22', h: '22:30', casa: 'Oklahoma City Thunder', fora: 'Denver Nuggets', l: 'Paycom Center (Oklahoma City)' },
    { fase: 'Temporada regular', d: '2026-10-23', h: '20:00', casa: 'Boston Celtics', fora: 'New York Knicks', l: 'TD Garden (Boston)' },
    { fase: 'Temporada regular', d: '2026-10-23', h: '22:30', casa: 'San Antonio Spurs', fora: 'Houston Rockets', l: 'Austin (Texas), quadra neutra' }
  ],
  nota: 'LeBron James começa a 24ª temporada, recorde, agora no Philadelphia 76ers. Giannis Antetokounmpo estreia pelo Miami Heat no dia 21, contra o Minnesota. A fase de grupos da Copa da NBA vai de 30/10 a 27/11.',
  tabela: {
    titulo: 'Conferência Leste: classificação final da temporada regular 2025/26 (temporada passada)',
    colunas: ['Pos', 'Time', 'V-D'],
    linhas: [
      ['1', 'Detroit Pistons', '60-22'],
      ['2', 'Boston Celtics', '56-26'],
      ['3', 'New York Knicks', '53-29'],
      ['4', 'Cleveland Cavaliers', '52-30'],
      ['5', 'Toronto Raptors', '46-36'],
      ['6', 'Atlanta Hawks', '46-36'],
      ['7', 'Philadelphia 76ers', '45-37'],
      ['8', 'Orlando Magic', '45-37'],
      ['9', 'Charlotte Hornets', '44-38'],
      ['10', 'Miami Heat', '43-39'],
      ['11', 'Milwaukee Bucks', '32-50'],
      ['12', 'Chicago Bulls', '31-51'],
      ['13', 'Brooklyn Nets', '20-62'],
      ['14', 'Indiana Pacers', '19-63'],
      ['15', 'Washington Wizards', '17-65']
    ],
    nota: 'Temporada 2025/26, encerrada em 12/04/2026. As vagas de 7º a 10º foram decididas no play-in: os 76ers ficaram com a 7ª vaga e o Magic com a 8ª. O New York Knicks foi o campeão da NBA.'
  },
  tabela2: {
    titulo: 'Conferência Oeste: classificação final da temporada regular 2025/26 (temporada passada)',
    colunas: ['Pos', 'Time', 'V-D'],
    linhas: [
      ['1', 'Oklahoma City Thunder', '64-18'],
      ['2', 'San Antonio Spurs', '62-20'],
      ['3', 'Denver Nuggets', '54-28'],
      ['4', 'Los Angeles Lakers', '53-29'],
      ['5', 'Houston Rockets', '52-30'],
      ['6', 'Minnesota Timberwolves', '49-33'],
      ['7', 'Phoenix Suns', '45-37'],
      ['8', 'Portland Trail Blazers', '42-40'],
      ['9', 'LA Clippers', '42-40'],
      ['10', 'Golden State Warriors', '37-45'],
      ['11', 'New Orleans Pelicans', '26-56'],
      ['12', 'Dallas Mavericks', '26-56'],
      ['13', 'Memphis Grizzlies', '25-57'],
      ['14', 'Sacramento Kings', '22-60'],
      ['15', 'Utah Jazz', '22-60']
    ],
    nota: 'Temporada 2025/26. O Thunder teve a melhor campanha da liga. Portland garantiu vaga direto no play-in, e o Golden State caiu na repescagem. Os Spurs eliminaram o Thunder em sete jogos na final do Oeste.'
  },
  destaques: {
    titulo: 'Prêmios da temporada 2025/26',
    colunas: ['Prêmio', 'Jogador', 'Time'],
    linhas: [
      ['MVP', 'Shai Gilgeous-Alexander', 'Oklahoma City Thunder'],
      ['MVP das Finais', 'Jalen Brunson', 'New York Knicks'],
      ['Calouro do Ano', 'Cooper Flagg', 'Dallas Mavericks'],
      ['Defensor do Ano', 'Victor Wembanyama', 'San Antonio Spurs'],
      ['Sexto Homem do Ano', 'Keldon Johnson', 'San Antonio Spurs'],
      ['Jogador que Mais Evoluiu', 'Nickeil Alexander-Walker', 'Atlanta Hawks'],
      ['Jogador Decisivo (Clutch)', 'Shai Gilgeous-Alexander', 'Oklahoma City Thunder'],
      ['Técnico do Ano', 'Joe Mazzulla', 'Boston Celtics']
    ]
  },
  sobre: [
    ['Criação', '1946'],
    ['Número de times', '30 (15 por conferência)'],
    ['Temporada regular', '82 jogos por time'],
    ['Maior campeão', 'Boston Celtics, com 18 títulos'],
    ['Atual campeão (2025/26)', 'New York Knicks, 3º título da história e o primeiro desde 1973'],
    ['Temporada 2026/27', '81ª temporada regular, de 20/10/2026 a abril de 2027']
  ],
  campeoes: [
    ['2025/26', 'New York Knicks', 'San Antonio Spurs'],
    ['2024/25', 'Oklahoma City Thunder', 'Indiana Pacers'],
    ['2023/24', 'Boston Celtics', 'Dallas Mavericks'],
    ['2022/23', 'Denver Nuggets', 'Miami Heat'],
    ['2021/22', 'Golden State Warriors', 'Boston Celtics'],
    ['2020/21', 'Milwaukee Bucks', 'Phoenix Suns'],
    ['2019/20', 'Los Angeles Lakers', 'Miami Heat'],
    ['2018/19', 'Toronto Raptors', 'Golden State Warriors']
  ]
},
{
  slug: 'euroleague',
  esporte: 'basquete',
  nome: 'Euroleague',
  menu: 'Euroleague',
  regiao: 'Europa',
  temporada: '2026/27',
  frase: 'O melhor basquete fora da NBA.',
  intro: 'Vinte clubes jogam todos contra todos em turno e returno. Os seis primeiros vão aos playoffs, do 7º ao 10º disputam o play-in e os quatro que sobrarem decidem o título no Final Four.',
  fase: 'Temporada regular: 6 de 38 rodadas disputadas (a rodada 7 é em 22 e 23/10)',
  lider: { nome: 'Panathinaikos', info: '5-1, melhor saldo do trio empatado com Fenerbahçe e Olympiacos; perdeu a invencibilidade para o Hapoel Tel Aviv na 6ª rodada' },
  tabela: {
    titulo: 'Classificação após a 6ª rodada (2026/27)',
    colunas: ['Pos', 'Time', 'V-D'],
    linhas: [
      ['1', 'Panathinaikos', '5-1'],
      ['2', 'Fenerbahçe', '5-1'],
      ['3', 'Olympiacos', '5-1'],
      ['4', 'Valencia Basket', '4-2'],
      ['5', 'Crvena Zvezda', '4-2'],
      ['6', 'Hapoel Tel Aviv', '4-2'],
      ['7', 'Virtus Bologna', '4-2'],
      ['8', 'Dubai Basketball', '4-2'],
      ['9', 'Real Madrid', '3-3'],
      ['10', 'Barcelona', '3-3'],
      ['11', 'Partizan', '3-3'],
      ['12', 'Beşiktaş', '3-3'],
      ['13', 'Anadolu Efes', '2-4'],
      ['14', 'Žalgiris', '2-4'],
      ['15', 'Bayern de Munique', '2-4'],
      ['16', 'Maccabi Tel Aviv', '2-4'],
      ['17', 'ASVEL', '2-4'],
      ['18', 'Paris Basketball', '1-5'],
      ['19', 'Olimpia Milano', '1-5'],
      ['20', 'Baskonia', '1-5']
    ],
    nota: 'Do 1º ao 6º lugar vão aos playoffs, e do 7º ao 10º ao play-in. A ordem entre Maccabi e ASVEL (16º e 17º) e entre Partizan e Beşiktaş (11º e 12º) pode variar pelos critérios de desempate. Confira na tabela oficial.'
  },
  jogos: [
    { fase: 'Rodada 6', d: '2026-10-15', casa: 'Fenerbahçe', fora: 'Partizan', l: 'Istambul', p: '74 x 65' },
    { fase: 'Rodada 6', d: '2026-10-16', casa: 'Panathinaikos', fora: 'Hapoel Tel Aviv', l: 'Atenas', p: '81 x 91' },
    { fase: 'Rodada 6', d: '2026-10-16', casa: 'Beşiktaş', fora: 'Bayern de Munique', l: 'Istambul', p: '95 x 87' },
    { fase: 'Rodada 7', d: '2026-10-22', casa: 'Anadolu Efes', fora: 'Beşiktaş', l: 'Istambul' },
    { fase: 'Rodada 7', d: '2026-10-22', casa: 'Partizan', fora: 'Crvena Zvezda', l: 'Belgrado' },
    { fase: 'Rodada 7', d: '2026-10-22', casa: 'Bayern de Munique', fora: 'Dubai Basketball', l: 'Munique' },
    { fase: 'Rodada 6', casa: 'Crvena Zvezda', fora: 'Paris Basketball', l: 'Belgrado', p: '90 x 81' },
    { fase: 'Rodada 6', casa: 'Barcelona', fora: 'Olympiacos', l: 'Palau Blaugrana (Barcelona)', p: '100 x 105 (prorrogação)' },
    { fase: 'Rodada 6', casa: 'Virtus Bologna', fora: 'Baskonia', l: 'Bolonha', p: '86 x 78' },
    { fase: 'Rodada 6', casa: 'Žalgiris', fora: 'Anadolu Efes', l: 'Kaunas', p: '70 x 85' }
  ],
  destaques: {
    titulo: 'Prêmios da temporada 2025/26',
    colunas: ['Prêmio', 'Jogador', 'Time'],
    linhas: [
      ['MVP da temporada', 'Sasha Vezenkov', 'Olympiacos'],
      ['MVP do Final Four', 'Evan Fournier', 'Olympiacos'],
      ['Troféu Alphonso Ford (cestinha, 19,0 pts)', 'Sasha Vezenkov', 'Olympiacos'],
      ['Revelação (Rising Star)', 'Jean Montero', 'Valencia Basket'],
      ['Melhor Defensor', 'Alpha Diallo', 'AS Monaco'],
      ['Técnico do Ano', 'Pedro Martínez', 'Valencia Basket'],
      ['MVP da 6ª rodada de 2026/27', 'Sasha Vezenkov', 'Olympiacos'],
      ['MVP da 5ª rodada de 2026/27', 'Jean Montero', 'Valencia Basket']
    ]
  },
  sobre: [
    ['Criação', '1958 (como Copa dos Campeões da FIBA); organizada pela Euroleague Basketball desde 2000'],
    ['Número de times', '20 na temporada 2026/27'],
    ['Formato', 'Temporada regular de 38 rodadas, play-in, playoffs e Final Four'],
    ['Maior campeão', 'Real Madrid, com 11 títulos'],
    ['Atual campeão (2025/26)', 'Olympiacos, que venceu o Real Madrid por 92 x 85 na final em Atenas (4º título)']
  ],
  campeoes: [
    ['2025/26', 'Olympiacos', 'Real Madrid'],
    ['2024/25', 'Fenerbahçe', 'AS Monaco'],
    ['2023/24', 'Panathinaikos', 'Real Madrid'],
    ['2022/23', 'Real Madrid', 'Olympiacos'],
    ['2021/22', 'Anadolu Efes', 'Real Madrid'],
    ['2020/21', 'Anadolu Efes', 'Barcelona'],
    ['2019/20', 'Cancelada (pandemia de covid-19)', '-'],
    ['2018/19', 'CSKA Moscou', 'Anadolu Efes']
  ]
},
{
  slug: 'nbb',
  esporte: 'basquete',
  nome: 'NBB',
  menu: 'NBB',
  regiao: 'Brasil',
  temporada: '2026/27',
  frase: 'O Novo Basquete Brasil está de volta.',
  intro: 'O campeonato brasileiro de basquete. Na primeira fase, 18 equipes jogam em turno e returno, 34 jogos cada, e as melhores seguem para os playoffs.',
  fase: '1ª fase (turno e returno): primeira semana da temporada 2026/27, iniciada em 17/10/2026',
  lider: { nome: 'Sesi Franca', info: 'Atual pentacampeão: venceu o Pinheiros por 3 a 1 na final de 2025/26' },
  jogos: [
    { fase: '1ª fase', d: '2026-10-17', casa: 'Unifacisa', fora: 'Basket Osasco', l: 'Arena Unifacisa (Campina Grande)', p: '96 x 70' },
    { fase: '1ª fase', d: '2026-10-17', h: '16:00', casa: 'Mogi Basquete', fora: 'Corinthians', l: 'Ginásio Prof. Hugo Ramos (Mogi das Cruzes)', p: '84 x 73' },
    { fase: '1ª fase', d: '2026-10-17', h: '18:00', casa: 'Caxias do Sul Basquete', fora: 'Itatiaiuçu Cruzeiro', l: 'Ginásio do Sesi (Caxias do Sul)', p: '61 x 72' },
    { fase: '1ª fase', d: '2026-10-18', h: '11:00', casa: 'Flamengo', fora: 'Bauru Basket', l: 'Maracanãzinho (Rio de Janeiro)', p: '81 x 82' },
    { fase: '1ª fase', d: '2026-10-19', casa: 'Sesi Franca', fora: 'São José Basketball', l: 'Franca (SP)' },
    { fase: '1ª fase', d: '2026-10-19', h: '19:30', casa: 'Unifacisa', fora: 'Pinheiros', l: 'Campina Grande (PB)' },
    { fase: '1ª fase', d: '2026-10-20', h: '18:00', casa: 'Flamengo', fora: 'Botafogo', l: 'Tijuca Tênis Clube (Rio de Janeiro)' },
    { fase: '1ª fase', d: '2026-10-20', h: '19:30', casa: 'Caxias do Sul Basquete', fora: 'Minas Storm', l: 'Caxias do Sul (RS)' },
    { fase: '1ª fase', d: '2026-10-21', h: '19:30', casa: 'Pato Basquete', fora: 'Paulistano', l: 'Ginásio do Sesi (Pato Branco)' },
    { fase: '1ª fase', d: '2026-10-22', h: '19:30', casa: 'União Corinthians', fora: 'Minas Storm', l: 'Santa Cruz do Sul (RS)' },
    { fase: '1ª fase', d: '2026-10-22', h: '20:15', casa: 'CAIXA/Brasília', fora: 'Corinthians', l: 'Brasília (DF)' }
  ],
  nota: 'O Brasília só estreia na 2ª rodada, em 22 de outubro, por causa da Liga Sul-Americana.',
  tabela: {
    titulo: 'Classificação parcial após os primeiros jogos (17 e 18/10)',
    colunas: ['Pos', 'Time', 'V-D'],
    linhas: [
      ['1', 'Unifacisa', '1-0'],
      ['2', 'Mogi Basquete', '1-0'],
      ['3', 'Itatiaiuçu Cruzeiro', '1-0'],
      ['4', 'Bauru Basket', '1-0'],
      ['5', 'Flamengo', '0-1'],
      ['6', 'Corinthians', '0-1'],
      ['7', 'Caxias do Sul Basquete', '0-1'],
      ['8', 'Basket Osasco', '0-1']
    ],
    nota: 'Tabela montada a partir dos quatro resultados confirmados, com a ordem definida pelo saldo de pontos. As demais equipes das 18 ainda não tinham estreado até 18/10. O placar de Caxias x Cruzeiro foi tirado de uma tabela de classificação, não de súmula. Confira a classificação oficial em lnb.com.br.'
  },
  destaques: {
    titulo: 'Melhores do ano do NBB CAIXA 2025/26',
    colunas: ['Prêmio', 'Jogador', 'Time'],
    linhas: [
      ['MVP da temporada (Troféu Wlamir Marques)', 'Georginho de Paula', 'Sesi Franca'],
      ['MVP das Finais (Troféu Amaury Pasos)', 'Georginho de Paula', 'Sesi Franca'],
      ['Melhor técnico (Troféu Hélio Rubens Garcia)', 'Gustavo De Conti', 'Pinheiros'],
      ['Melhor sexto homem', 'Alex Negrete', 'Flamengo'],
      ['Melhor defensor', 'Felipe Gregate', 'Pinheiros'],
      ['Melhor ala', 'Elyjah Clark', 'Corinthians'],
      ['Melhor ala', 'David Jackson', 'Sesi Franca'],
      ['Melhor pivô', 'Lucas Dias', 'Sesi Franca'],
      ['Melhor pivô', 'Andrezão', 'Bauru Basket']
    ]
  },
  sobre: [
    ['Criação', '2008 (primeira temporada: 2008/09), organizado pela Liga Nacional de Basquete (LNB)'],
    ['Número de times', '18 na temporada 2026/27 (eram 20 em 2025/26)'],
    ['Formato', 'Turno e returno com 34 jogos por clube; os 16 melhores vão aos playoffs em séries melhor de cinco'],
    ['Maior campeão', 'Flamengo, com 7 títulos'],
    ['Atual campeão (2025/26)', 'Sesi Franca, que fechou a final contra o Pinheiros em 3 a 1 e chegou ao 5º título seguido'],
    ['Transmissão', 'Todos os jogos da temporada 2026/27 serão transmitidos']
  ],
  campeoes: [
    ['2025/26', 'Sesi Franca', 'Pinheiros'],
    ['2024/25', 'Sesi Franca', 'Minas'],
    ['2023/24', 'Sesi Franca', 'Flamengo'],
    ['2022/23', 'Sesi Franca', 'São Paulo'],
    ['2021/22', 'Sesi Franca', 'Flamengo'],
    ['2020/21', 'Flamengo', 'São Paulo'],
    ['2019/20', 'Sem campeão (temporada encerrada pela pandemia)', '-'],
    ['2018/19', 'Flamengo', 'Franca']
  ]
}
];

/* Jogadores em destaque (página de Basquete e página inicial). Médias da última temporada regular completa.
   Fontes: Basketball-Reference, StatMuse e ESPN. "cor" e "cor2" são as cores do time atual. */
window.JOGADORES_DESTAQUE = [
  { nome: 'LeBron James', foto: 'lebron', time: 'Philadelphia 76ers', num: '23', pos: 'Ala', cor: '#006bb6', cor2: '#ed174c',
    altura: '2,06 m', peso: '113 kg', nasc: '1984-12-30', de: 'Akron, Ohio (EUA)', estreia: '2003', antes: 'Lakers (2018-26)',
    temporada: '2025/26 pelo Lakers, 60 jogos', pts: '20,9', reb: '6,1', ast: '7,2',
    nota: 'Maior pontuador da história da NBA, começa a 24ª temporada, recorde da liga.',
    proximo: { d: '2026-10-20', h: '20:00', txt: '76ers x Knicks, em Nova York' } },
  { nome: 'Giannis Antetokounmpo', foto: 'giannis', time: 'Miami Heat', num: '7', pos: 'Ala-pivô', cor: '#98002e', cor2: '#f9a01b',
    altura: '2,11 m', peso: '110 kg', nasc: '1994-12-06', de: 'Atenas (Grécia)', estreia: '2013', antes: 'Bucks (2013-26)',
    temporada: '2025/26 pelo Bucks, 36 jogos', pts: '27,6', reb: '9,8', ast: '5,4',
    nota: 'Duas vezes MVP, chegou ao Heat numa troca em julho. Usou a camisa 7 na pré-temporada.',
    proximo: { d: '2026-10-21', txt: 'Heat x Timberwolves, a estreia pelo Miami' } }
];
