/* Onde assistir cada categoria no Brasil, temporada 2026.
   Fontes: anúncios das emissoras e imprensa especializada (Grande Prêmio, Band, Máquina do Esporte, F1Mania, Tomada de Tempo), conferidos em out/2026.
   tipo: aberta (TV aberta), paga (TV por assinatura), stream (streaming pago), gratis (grátis na internet).
   Para atualizar: troque os canais aqui. O Box e a página onde-assistir.html leem este arquivo. */
window.ONDE_ASSISTIR = {
  atualizado: 'outubro de 2026',
  cats: {
    'formula-1': { canais: [['TV Globo', 'aberta'], ['SporTV', 'paga'], ['Globoplay', 'stream'], ['F1 TV Premium', 'stream']], nota: 'A Globo mostra 15 dos 24 GPs na TV aberta. O SporTV mostra todas as classificações, sprints e corridas.' },
    'formula-2': { canais: [['SporTV 3', 'paga'], ['Globoplay', 'stream'], ['F1 TV Premium', 'stream']], nota: 'Corridas no SporTV 3. Depois ficam inteiras no Globoplay.' },
    'formula-3': { canais: [['F1 TV Premium', 'stream']], nota: 'Sem emissora confirmada no Brasil em 2026. O F1 TV Premium mostra todas as sessões.' },
    'formula-e': { canais: [['Band', 'aberta'], ['BandSports', 'paga'], ['Grande Prêmio (YouTube e GPTV)', 'gratis']], nota: 'A Band mostra classificação e corrida de algumas etapas. BandSports e Grande Prêmio mostram a temporada toda.' },
    'indycar': { canais: [['Band', 'aberta'], ['ESPN', 'paga'], ['Disney+', 'stream'], ['IndyCar Live', 'stream']], nota: 'A Band mostra boa parte das corridas, incluindo as 500 Milhas de Indianápolis. ESPN e Disney+ cobrem quase tudo.' },
    'stock-car': { canais: [['Band', 'aberta'], ['BandSports', 'paga'], ['BandPlay', 'gratis'], ['YouTube Stock Car e Esporte na Band', 'gratis']], nota: 'A Band mostra as duas corridas do fim de semana. A classificação passa de graça no YouTube.' },
    'porsche-cup': { canais: [['Band', 'aberta'], ['BandSports', 'paga'], ['BandPlay', 'gratis'], ['YouTube Porsche Cup', 'gratis']], nota: '' },
    'nascar': { canais: [['XSports', 'aberta'], ['ESPN', 'paga'], ['Disney+', 'stream']], nota: 'O XSports mostra a Cup Series na TV aberta. ESPN e Disney+ mostram as três divisões.' },
    'endurance': { canais: [['BandSports', 'paga'], ['YouTube Esporte na Band', 'gratis'], ['Jovem Pan (YouTube)', 'gratis'], ['Grande Prêmio (YouTube e GPTV)', 'gratis']], nota: 'Todas as etapas do WEC ao vivo, com várias opções grátis no YouTube.' },
    'le-mans': { canais: [['BandSports', 'paga'], ['Grande Prêmio (YouTube e GPTV)', 'gratis'], ['Jovem Pan (YouTube)', 'gratis']], nota: 'As 24 Horas fazem parte do WEC: mesma transmissão do Mundial de Endurance.' },
    'imsa': { canais: [['Grande Prêmio (YouTube e GPTV)', 'gratis'], ['IMSA TV', 'stream']], nota: 'O Grande Prêmio mostra a temporada completa, de graça e com imagens.' },
    'dtm': { canais: [['ESPN', 'paga'], ['Disney+', 'stream'], ['YouTube DTM', 'gratis']], nota: 'O YouTube oficial do DTM pode estar bloqueado no Brasil em algumas etapas.' },
    'rally': { canais: [['Rally.TV (DAZN)', 'stream']], nota: 'Todas as especiais ao vivo, com narração em inglês. Não há transmissão em português.' },
    'dakar': { canais: [['ESPN', 'paga'], ['Disney+', 'stream']], nota: 'Resumos diários de cada etapa. O Dakar não tem transmissão ao vivo completa.' },
    'motogp': { canais: [['ESPN', 'paga'], ['Disney+', 'stream'], ['MotoGP VideoPass', 'stream']], nota: 'ESPN e Disney+ mostram todas as sessões de MotoGP, Moto2 e Moto3. Em 2026, a Band mostrou só o GP do Brasil.' },
    'superbike': { canais: [['BandSports', 'paga'], ['WorldSBK VideoPass', 'stream']], nota: 'Em fins de semana com conflito de horário, o BandSports pode passar só o compacto (VT).' },
    'motocross': { canais: [['BandSports', 'paga'], ['MXGP-TV', 'stream']], nota: 'O BandSports mostra as corridas do Mundial MXGP e o Motocross das Nações.' }
  }
};

/* Endereço de cada canal (só os que conferimos). Canal sem endereço aparece sem o botão "Abrir". */
window.ONDE_ASSISTIR.links = {
  'TV Globo': 'https://globoplay.globo.com', 'Globoplay': 'https://globoplay.globo.com', 'SporTV': 'https://sportv.globo.com', 'SporTV 3': 'https://sportv.globo.com',
  'F1 TV Premium': 'https://f1tv.formula1.com', 'Band': 'https://www.band.com.br', 'BandSports': 'https://www.band.com.br', 'BandPlay': 'https://www.band.com.br',
  'ESPN': 'https://www.espn.com.br', 'Disney+': 'https://www.disneyplus.com', 'Rally.TV (DAZN)': 'https://www.dazn.com', 'Grande Prêmio (YouTube e GPTV)': 'https://www.grandepremio.com.br',
  'MotoGP VideoPass': 'https://www.motogp.com', 'WorldSBK VideoPass': 'https://www.worldsbk.com', 'IndyCar Live': 'https://www.indycar.com', 'IMSA TV': 'https://www.imsa.com'
};
window.ONDE_ASSISTIR.TIPOS = { aberta: 'TV aberta', paga: 'TV por assinatura', stream: 'Streaming', gratis: 'Grátis' };
/* Quadro de canais (página da categoria e página Onde assistir) */
window.ONDE_ASSISTIR.quadro = function (slug, curto) {
  var O = window.ONDE_ASSISTIR, d = O.cats[slug], esc = window.esc;
  if (!d) return '';
  var SIG = { 'F1 TV Premium': 'F1', 'Disney+': 'D+', 'Globoplay': 'G+', 'TV Globo': 'GL', 'SporTV': 'SV', 'SporTV 3': 'SV', 'BandSports': 'BS', 'BandPlay': 'BP', 'XSports': 'XS', 'Grande Prêmio (YouTube e GPTV)': 'GP', 'Jovem Pan (YouTube)': 'JP', 'Rally.TV (DAZN)': 'RT', 'MXGP-TV': 'MX', 'IMSA TV': 'IM', 'IndyCar Live': 'IC' };
  function sigla(n) { if (SIG[n]) return SIG[n]; var p = n.replace(/\(.*?\)/g, '').replace(/^TV /, '').split(/[\s.+-]+/).filter(Boolean); return (p.length > 1 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase(); }
  return '<div class="oa-canais' + (curto ? ' oa-curto' : '') + '">' + d.canais.map(function (c) {
    var url = O.links[c[0]], dom = url ? url.replace(/^https:\/\/(www\.)?/, '') : '';
    var dentro = '<span class="oa-selo oa-' + c[1] + '">' + esc(sigla(c[0])) + '</span><span class="oa-nome"><b>' + esc(c[0]) + '</b><small>' + esc(O.TIPOS[c[1]]) + '' + '</small></span>';
    return url ? '<a class="oa-canal" href="' + url + '" target="_blank" rel="noopener">' + dentro + '<span class="oa-abrir">Abrir →</span></a>' : '<div class="oa-canal">' + dentro + '</div>';
  }).join('') + '</div>' + (d.nota && !curto ? '<p class="oa-nota">' + esc(d.nota) + '</p>' : '');
};
