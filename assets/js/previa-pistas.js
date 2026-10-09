/* Dados das pistas das próximas etapas da F1, para a Prévia da etapa (plano Master).
   Chave = campo "l" da etapa em dados.js. circuito = nome em circuitos.js (para desenhar o mapa; null se não tiver).
   lat/lon = previsão do tempo (Open-Meteo). venc = vencedores de anos anteriores (só os confirmados). */
window.PREVIA_PISTAS = {
  'Sepang (Malásia)': { circuito: 'Sepang', lat: 2.7606, lon: 101.7381, km: 5.543, voltas: 56,
    txt: 'Duas retas longas ligadas por um grampo fechado, onde se ultrapassa na freada. Calor tropical e chuva forte no meio da tarde mudam a corrida em minutos. A F1 volta a Sepang pela primeira vez desde 2017.',
    venc: [['2014', 'Lewis Hamilton'], ['2015', 'Sebastian Vettel'], ['2016', 'Daniel Ricciardo'], ['2017', 'Max Verstappen']], vencTitulo: 'Últimas vitórias da F1 em Sepang' },
  'Marina Bay': { circuito: 'Marina Bay', lat: 1.2914, lon: 103.8640, km: 4.940, voltas: 62,
    txt: 'Corrida noturna entre muros, com calor e umidade que desidratam o piloto. O safety car aparece com frequência, e ultrapassar exige paciência.',
    venc: [['2022', 'Sergio Pérez'], ['2023', 'Carlos Sainz'], ['2024', 'Lando Norris'], ['2025', 'George Russell']] },
  'Austin': { circuito: 'Circuito das Américas', lat: 30.1328, lon: -97.6411, km: 5.513, voltas: 56,
    txt: 'A subida até a curva 1 abre a pista em leque e convida a atacar por fora. O trecho de curvas em S castiga quem perde o ritmo.',
    venc: [['2022', 'Max Verstappen'], ['2023', 'Max Verstappen'], ['2024', 'Charles Leclerc'], ['2025', 'Max Verstappen']] },
  'Hermanos Rodríguez': { circuito: 'Hermanos Rodríguez', lat: 19.4042, lon: -99.0907, km: 4.304, voltas: 71,
    txt: 'A 2.200 metros de altitude, o ar rarefeito tira força dos motores e aderência das asas. A reta longa até a curva 1 é o melhor ponto de ultrapassagem, e o fim da volta passa por dentro de um estádio lotado.' },
  'Interlagos': { circuito: 'Interlagos', lat: -23.7036, lon: -46.6997, km: 4.309, voltas: 71,
    txt: 'Pista no sentido anti-horário, com o S do Senna logo depois da largada e a subida dos boxes até a reta. Chuva de repente é comum em São Paulo e embaralha a corrida.' },
  'Las Vegas': { circuito: null, lat: 36.1147, lon: -115.1728, km: 6.201, voltas: 50,
    txt: 'Corrida de madrugada nas ruas da cidade, com uma reta de quase 2 km na avenida principal. O frio da noite deixa os pneus difíceis de aquecer.' },
  'Lusail': { circuito: 'Lusail', lat: 25.4900, lon: 51.4542, km: 5.419, voltas: 57,
    txt: 'Curvas de alta velocidade em sequência cansam os pneus e o pescoço dos pilotos. Corrida noturna, com calor e vento do deserto.' },
  'Yas Marina': { circuito: 'Yas Marina', lat: 24.4672, lon: 54.6031, km: 5.281, voltas: 58,
    txt: 'A corrida de encerramento começa de dia e termina à noite, sob as luzes. Duas retas longas no meio da volta são o lugar de ultrapassar.' }
};
