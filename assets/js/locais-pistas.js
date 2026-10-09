/* Localização dos autódromos (latitude e longitude), para a previsão do tempo da prévia da próxima etapa em cada categoria.
   Chave = campo "l" da etapa em dados.js, ou "categoria|nome da etapa" quando o "l" é só o país.
   A F1 e a F2 usam window.PREVIA_PISTAS (previa-pistas.js), que já tem a localização e os números da pista.
   Ao entrar uma pista nova no calendário, acrescente aqui. */
window.LOCAIS_PISTAS = {
  'Cascavel (PR)': { lat: -24.9726, lon: -53.4065 },
  'Goiânia (GO)': { lat: -16.7196, lon: -49.1913 },
  'Velopark (RS)': { lat: -29.7955, lon: -51.2829 },
  'Interlagos (SP)': { lat: -23.7036, lon: -46.6997 },
  'Interlagos': { lat: -23.7036, lon: -46.6997 },
  'Montmeló': { lat: 41.5700, lon: 2.2611 },
  'Monza': { lat: 45.6156, lon: 9.2811 },
  'Charlotte': { lat: 35.3520, lon: -80.6830 },
  'Phoenix': { lat: 33.3750, lon: -112.3110 },
  'Talladega': { lat: 33.5670, lon: -86.0640 },
  'Martinsville': { lat: 36.6340, lon: -79.8510 },
  'Homestead-Miami': { lat: 25.4520, lon: -80.4080 },
  'Mandalika': { lat: -8.8960, lon: 116.3050 },
  'Phillip Island': { lat: -38.5020, lon: 145.2350 },
  'Sepang': { lat: 2.7606, lon: 101.7380 },
  'Lusail': { lat: 25.4900, lon: 51.4540 },
  'Portimão': { lat: 37.2270, lon: -8.6270 },
  'Ricardo Tormo': { lat: 39.4850, lon: -0.6300 },
  'Jerez': { lat: 36.7080, lon: -6.0340 },
  'Hockenheim': { lat: 49.3270, lon: 8.5660 },
  'Estoril': { lat: 38.7510, lon: -9.3940 },
  'dtm|Hockenheim (final)': { lat: 49.3270, lon: 8.5660 },
  'superbike|Estoril': { lat: 38.7510, lon: -9.3940 }
};
