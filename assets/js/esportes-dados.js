/* Dados de futebol e basquete. Atualizado em 18/10/2026.
   Para atualizar: troque os valores abaixo. Datas no formato AAAA-MM-DD, horários (h) no horário de Brasília.
   Um jogo com "p" (placar) aparece como encerrado. Sem "d", aparece só a fase (ex.: data a confirmar).
   tabela.linhas: só o que foi conferido em mais de uma fonte; o resto vai em tabela.nota. */

window.ESPORTES_ATUALIZADO = '18 de outubro de 2026, à noite';

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
  slug: 'brasileirao', esporte: 'futebol', nome: 'Brasileirão Série A', menu: 'Brasileirão', regiao: 'Brasil', temporada: '2026',
  frase: 'Trinta e oito rodadas, vinte clubes e nenhuma rodada fácil.',
  intro: 'Pontos corridos em turno e returno: todo mundo joga contra todo mundo duas vezes e quem somar mais pontos é campeão. Os primeiros colocados vão para a Libertadores e os quatro últimos caem para a Série B.',
  fase: '31ª rodada',
  lider: { nome: 'Palmeiras', info: '66 pontos; o Flamengo, com 64, ainda joga a 31ª rodada' },
  tabela: {
    titulo: 'Classificação após a 30ª rodada',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [
      ['1', 'Flamengo', '64'], ['2', 'Palmeiras', '63'], ['3', 'Athletico-PR', '53'], ['4', 'Fluminense', '51'],
      ['5', 'Bahia', '49'], ['6', 'Cruzeiro', '48'], ['7', 'Atlético-MG', '47'], ['8', 'Santos', '42'],
      ['9', 'Red Bull Bragantino', '40'], ['10', 'São Paulo', '39'], ['11', 'Coritiba', '39']
    ],
    nota: 'Zona de rebaixamento: Grêmio (31 pontos), Remo (25) e Chapecoense (18, com um jogo a menos) estão entre os quatro últimos.'
  },
  jogos: [
    { fase: '31ª rodada', d: '2026-10-16', h: '20:00', casa: 'Mirassol', fora: 'Internacional', p: '2 x 0' },
    { fase: '31ª rodada', d: '2026-10-17', h: '18:00', casa: 'Botafogo', fora: 'Chapecoense', p: '1 x 0' },
    { fase: '31ª rodada', d: '2026-10-17', h: '18:30', casa: 'Atlético-MG', fora: 'Coritiba', p: '1 x 0' },
    { fase: '31ª rodada', d: '2026-10-17', h: '19:30', casa: 'Athletico-PR', fora: 'Palmeiras', p: '0 x 2' },
    { fase: '31ª rodada', d: '2026-10-17', h: '21:00', casa: 'São Paulo', fora: 'Vasco', p: '1 x 0' },
    { fase: '31ª rodada', d: '2026-10-18', h: '16:00', casa: 'Fluminense', fora: 'Santos', p: '1 x 2' },
    { fase: '31ª rodada', d: '2026-10-18', h: '16:00', casa: 'Grêmio', fora: 'Cruzeiro' },
    { fase: '31ª rodada', d: '2026-10-18', h: '18:30', casa: 'Bahia', fora: 'Flamengo' },
    { fase: '31ª rodada', d: '2026-10-18', h: '19:30', casa: 'Remo', fora: 'Red Bull Bragantino' },
    { fase: '31ª rodada', d: '2026-10-19', h: '20:00', casa: 'Corinthians', fora: 'Vitória' }
  ]
},
{
  slug: 'libertadores', esporte: 'futebol', nome: 'Copa Libertadores', menu: 'Libertadores', regiao: 'América do Sul', temporada: '2026',
  frase: 'A Glória Eterna se decide em mata-mata.',
  intro: 'O maior torneio de clubes da América do Sul. Depois da fase de grupos, tudo é mata-mata em ida e volta até a final, que é jogo único em campo escolhido antes do torneio.',
  fase: 'Semifinais',
  lider: { nome: 'Semifinais', info: 'Final em 28/11, no Centenário (Montevidéu)' },
  confrontos: [
    { fase: 'Semifinal', a: 'Fluminense', b: 'Palmeiras', ida: '1 x 2', situacao: 'Palmeiras joga pelo empate na volta' },
    { fase: 'Semifinal', a: 'Estudiantes', b: 'Flamengo', ida: '0 x 0', situacao: 'Quem vencer no Maracanã vai à final' }
  ],
  jogos: [
    { fase: 'Semifinal, ida', d: '2026-10-14', casa: 'Fluminense', fora: 'Palmeiras', p: '1 x 2', l: 'Maracanã' },
    { fase: 'Semifinal, ida', d: '2026-10-15', casa: 'Estudiantes', fora: 'Flamengo', p: '0 x 0', l: 'La Plata' },
    { fase: 'Semifinal, volta', d: '2026-10-21', h: '21:30', casa: 'Palmeiras', fora: 'Fluminense', l: 'Nubank Parque, São Paulo' },
    { fase: 'Semifinal, volta', d: '2026-10-22', h: '21:30', casa: 'Flamengo', fora: 'Estudiantes', l: 'Maracanã' },
    { fase: 'Final', d: '2026-11-28', casa: 'A definir', fora: 'A definir', l: 'Estádio Centenário, Montevidéu' }
  ],
  nota: 'Nas quartas, Estudiantes eliminou o Corinthians, Flamengo passou pelo Independiente del Valle e Fluminense pelo Platense.'
},
{
  slug: 'sul-americana', esporte: 'futebol', nome: 'Copa Sul-Americana', menu: 'Sul-Americana', regiao: 'América do Sul', temporada: '2026',
  frase: 'Dois brasileiros a um passo da final.',
  intro: 'O segundo torneio de clubes da Conmebol. Os mata-matas são em ida e volta e a final é em jogo único. O campeão ganha vaga na Libertadores do ano seguinte.',
  fase: 'Semifinais',
  lider: { nome: 'Semifinais', info: 'Final em 21/11, em Barranquilla (Colômbia)' },
  confrontos: [
    { fase: 'Semifinal', a: 'Boca Juniors', b: 'Vasco', ida: '0 x 1', situacao: 'Vasco decide em São Januário com vantagem' },
    { fase: 'Semifinal', a: 'Atlético-MG', b: 'Montevideo City Torque', ida: '3 x 0', situacao: 'Atlético pode perder por até dois gols' }
  ],
  jogos: [
    { fase: 'Semifinal, ida', d: '2026-10-13', casa: 'Boca Juniors', fora: 'Vasco', p: '0 x 1', l: 'La Bombonera' },
    { fase: 'Semifinal, ida', d: '2026-10-14', casa: 'Atlético-MG', fora: 'Montevideo City Torque', p: '3 x 0', l: 'Arena MRV' },
    { fase: 'Semifinal, volta', d: '2026-10-20', h: '21:30', casa: 'Vasco', fora: 'Boca Juniors', l: 'São Januário' },
    { fase: 'Semifinal, volta', d: '2026-10-21', h: '19:00', casa: 'Montevideo City Torque', fora: 'Atlético-MG', l: 'Estádio Centenário, Montevidéu' },
    { fase: 'Final', d: '2026-11-21', casa: 'A definir', fora: 'A definir', l: 'Barranquilla' }
  ]
},
{
  slug: 'champions-league', esporte: 'futebol', nome: 'Champions League', menu: 'Champions', regiao: 'Europa', temporada: '2026/27',
  frase: 'Os melhores clubes da Europa numa só tabela.',
  intro: 'Na fase de liga, os 36 clubes jogam oito partidas contra adversários diferentes. Os oito primeiros vão direto às oitavas, do 9º ao 24º disputam um playoff e os outros 12 estão fora.',
  fase: 'Fase de liga, 3ª rodada',
  lider: { nome: '9 times com 100%', info: 'PSG, Barcelona, Arsenal, Real Madrid e mais cinco' },
  tabela: {
    titulo: 'Quem venceu as duas primeiras rodadas',
    colunas: ['Time', 'Pts'],
    linhas: [
      ['Paris Saint-Germain', '6'], ['Barcelona', '6'], ['Aston Villa', '6'], ['Stuttgart', '6'], ['Liverpool', '6'],
      ['Sporting', '6'], ['Arsenal', '6'], ['Real Madrid', '6'], ['Real Betis', '6']
    ],
    nota: 'Depois de duas rodadas, nove clubes têm 100% de aproveitamento. O Bayern de Munique é o melhor entre os que têm 4 pontos.'
  },
  jogos: [
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Real Madrid', fora: 'Roma', p: '4 x 3' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Liverpool', fora: 'LASK', p: '6 x 3' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Aston Villa', fora: 'Fenerbahçe', p: '6 x 0' },
    { fase: '2ª rodada', d: '2026-10-14', casa: 'Manchester City', fora: 'Paris Saint-Germain', p: '2 x 4' },
    { fase: '3ª rodada, 20 e 21/10', casa: 'Paris Saint-Germain', fora: 'Barcelona' },
    { fase: '3ª rodada, 20 e 21/10', casa: 'Liverpool', fora: 'Villarreal' }
  ]
},
{
  slug: 'premier-league', esporte: 'futebol', nome: 'Premier League', menu: 'Premier League', regiao: 'Inglaterra', temporada: '2026/27',
  frase: 'A liga mais rica do mundo.',
  intro: 'Vinte clubes em pontos corridos, 38 rodadas de agosto a maio. Os primeiros vão para a Champions League e os três últimos caem para a Championship.',
  fase: '8ª rodada',
  lider: { nome: 'Manchester City', info: '21 pontos em 7 jogos, invicto' },
  tabela: {
    titulo: 'Topo da tabela',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [['1', 'Manchester City', '21'], ['2', 'Arsenal', '18'], ['3', 'Brighton', '13']],
    nota: 'Logo atrás, Liverpool, Brentford, Everton, Leeds e Hull estão embolados entre 9 e 12 pontos.'
  },
  jogos: []
},
{
  slug: 'la-liga', esporte: 'futebol', nome: 'La Liga', menu: 'La Liga', regiao: 'Espanha', temporada: '2026/27',
  frase: 'Barcelona e Real Madrid, e quem tiver coragem de se meter.',
  intro: 'O Campeonato Espanhol: 20 clubes, pontos corridos e 38 rodadas. Os quatro primeiros vão para a Champions League e os três últimos caem.',
  fase: '9ª rodada',
  lider: { nome: 'Barcelona', info: '27 pontos, 9 vitórias em 9 jogos' },
  tabela: {
    titulo: 'Topo da tabela após a 8ª rodada',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [['1', 'Barcelona', '24'], ['2', 'Atlético de Madrid', '19'], ['3', 'Real Betis', '19'], ['4', 'Real Madrid', '18']],
    nota: 'O Barcelona fez 34 gols e sofreu 7 nas oito primeiras rodadas. O Levante é o lanterna, com 6 pontos.'
  },
  jogos: [
    { fase: '9ª rodada', d: '2026-10-17', casa: 'Real Betis', fora: 'Barcelona', p: '2 x 5', l: 'La Cartuja' },
    { fase: '9ª rodada, 16 a 19/10', casa: 'Espanyol', fora: 'Atlético de Madrid' }
  ]
},
{
  slug: 'bundesliga', esporte: 'futebol', nome: 'Bundesliga', menu: 'Bundesliga', regiao: 'Alemanha', temporada: '2026/27',
  frase: 'Estádios cheios e o Bayern sempre por perto.',
  intro: 'O Campeonato Alemão tem 18 clubes e 34 rodadas. Os quatro primeiros vão para a Champions League, os dois últimos caem e o 16º disputa a repescagem contra o 3º da segunda divisão.',
  fase: '6ª rodada',
  lider: { nome: 'Bayern de Munique', info: '14 pontos, empatado com o Dortmund' },
  tabela: {
    titulo: 'Topo da tabela',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [['1', 'Bayern de Munique', '14'], ['2', 'Borussia Dortmund', '14'], ['3', 'Freiburg', '13']],
    nota: 'O Bayern lidera no saldo de gols (22 marcados e 5 sofridos).'
  },
  jogos: []
},
{
  slug: 'serie-a', esporte: 'futebol', nome: 'Serie A', menu: 'Serie A', regiao: 'Itália', temporada: '2026/27',
  frase: 'O Campeonato Italiano, onde cada gol custa caro.',
  intro: 'Vinte clubes em pontos corridos, 38 rodadas. Os quatro primeiros vão para a Champions League e os três últimos caem para a Serie B.',
  fase: '7ª rodada',
  lider: { nome: 'Inter de Milão', info: '19 pontos em 7 jogos' },
  tabela: {
    titulo: 'Topo da tabela',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [['1', 'Inter de Milão', '19'], ['2', 'Roma', '17']],
    nota: 'A Lazio vem em terceiro. O Napoli está só em 9º, com 10 pontos. O Venezia é o lanterna, com 3.'
  },
  jogos: []
},
{
  slug: 'ligue-1', esporte: 'futebol', nome: 'Ligue 1', menu: 'Ligue 1', regiao: 'França', temporada: '2026/27',
  frase: 'Quatro times empatados na ponta.',
  intro: 'O Campeonato Francês tem 18 clubes e 34 rodadas, de agosto a maio. Os primeiros vão para a Champions League e os últimos caem para a Ligue 2.',
  fase: '8ª rodada',
  lider: { nome: 'Paris Saint-Germain', info: '14 pontos, empatado com Paris FC, Lille e Monaco' },
  tabela: {
    titulo: 'Topo da tabela após a 7ª rodada',
    colunas: ['Pos', 'Time', 'Pts'],
    linhas: [['1', 'Paris Saint-Germain', '14'], ['2', 'Paris FC', '14'], ['3', 'Lille', '14'], ['4', 'Monaco', '14'], ['5', 'Lyon', '11'], ['6', 'Nice', '11']],
    nota: 'Os quatro primeiros estão separados só pelo saldo de gols. Na parte de baixo, Le Havre (2 pontos), Troyes (4) e Le Mans (6).'
  },
  jogos: []
},

/* ---------------- Basquete ---------------- */
{
  slug: 'nba', esporte: 'basquete', nome: 'NBA', menu: 'NBA', regiao: 'Estados Unidos e Canadá', temporada: '2026/27',
  frase: 'A temporada começa na terça, 20 de outubro.',
  intro: 'Trinta times divididos em Conferência Leste e Oeste, 82 jogos cada na temporada regular. Os seis primeiros de cada lado vão direto aos playoffs, do 7º ao 10º jogam o play-in e as séries são melhor de sete até as Finais.',
  fase: 'Abertura da temporada',
  lider: { nome: 'New York Knicks', info: 'Atual campeão' },
  jogos: [
    { fase: 'Noite de abertura', d: '2026-10-20', h: '16:00', casa: 'Detroit Pistons', fora: 'Boston Celtics' },
    { fase: 'Noite de abertura', d: '2026-10-20', h: '20:00', casa: 'New York Knicks', fora: 'Philadelphia 76ers' },
    { fase: 'Noite de abertura', d: '2026-10-20', h: '22:30', casa: 'San Antonio Spurs', fora: 'Oklahoma City Thunder' }
  ],
  nota: 'LeBron James começa a 24ª temporada, recorde, agora no Philadelphia 76ers. Giannis Antetokounmpo estreia pelo Miami Heat no dia 21, contra o Minnesota. A fase de grupos da Copa da NBA vai de 30/10 a 27/11.'
},
{
  slug: 'euroleague', esporte: 'basquete', nome: 'Euroleague', menu: 'Euroleague', regiao: 'Europa', temporada: '2026/27',
  frase: 'O melhor basquete fora da NBA.',
  intro: 'Vinte clubes jogam todos contra todos em turno e returno. Os seis primeiros vão aos playoffs, do 7º ao 10º disputam o play-in e os quatro que sobrarem decidem o título no Final Four.',
  fase: 'Temporada regular',
  lider: { nome: 'Panathinaikos', info: 'Invicto, 5 vitórias em 5 jogos' },
  tabela: {
    titulo: 'Topo da tabela',
    colunas: ['Pos', 'Time', 'V-D'],
    linhas: [['1', 'Panathinaikos', '5-0'], ['2', 'Valencia', '4-1'], ['3', 'Fenerbahçe', '4-1'], ['4', 'Olympiacos', '4-1']],
    nota: 'Estrela Vermelha, Hapoel Tel Aviv, Barcelona, Partizan, Virtus Bologna e Dubai vêm logo atrás, com 3 vitórias e 2 derrotas.'
  },
  jogos: []
},
{
  slug: 'nbb', esporte: 'basquete', nome: 'NBB', menu: 'NBB', regiao: 'Brasil', temporada: '2026/27',
  frase: 'O Novo Basquete Brasil está de volta.',
  intro: 'O campeonato brasileiro de basquete. Na primeira fase, 18 equipes jogam em turno e returno, 34 jogos cada, e as melhores seguem para os playoffs.',
  fase: '1ª rodada',
  lider: { nome: 'Franca', info: 'Atual campeão' },
  jogos: [
    { fase: '1ª rodada', d: '2026-10-17', h: '16:00', casa: 'Mogi Basquete', fora: 'Corinthians', l: 'Ginásio Professor Hugo Ramos', p: '84 x 73' },
    { fase: '1ª rodada', d: '2026-10-17', casa: 'Caxias do Sul', fora: 'Cruzeiro', p: '61 x 72' },
    { fase: '1ª rodada', d: '2026-10-17', casa: 'Unifacisa', fora: 'Basket Osasco', p: '96 x 70' },
    { fase: '1ª rodada', d: '2026-10-18', h: '11:00', casa: 'Flamengo', fora: 'Bauru Basket', l: 'Maracanãzinho' },
    { fase: '1ª rodada', d: '2026-10-19', casa: 'Franca', fora: 'São José' }
  ],
  nota: 'O Brasília só estreia na 2ª rodada, em 22 de outubro, por causa da Liga Sul-Americana.'
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
