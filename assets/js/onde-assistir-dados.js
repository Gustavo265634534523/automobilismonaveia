/* Onde assistir cada categoria no Brasil, temporada 2026.
   Fontes: anúncios das emissoras e imprensa especializada (Grande Prêmio, Band, Máquina do Esporte, F1Mania, Tomada de Tempo), conferidos em out/2026.
   tipo: aberta (TV aberta), paga (TV por assinatura), stream (streaming pago), gratis (grátis na internet).
   Para atualizar: troque os canais aqui. O Box e a página onde-assistir.html leem este arquivo. */
window.ONDE_ASSISTIR = {
  atualizado: 'outubro de 2026',
  cats: {
    'formula-1': { canais: [['TV Globo', 'aberta'], ['SporTV', 'paga'], ['Globoplay', 'stream'], ['F1 TV Premium', 'stream']], nota: 'A Globo mostra 15 dos 24 GPs na TV aberta. O SporTV mostra todas as classificações, sprints e corridas.' },
    'formula-2': { canais: [['SporTV 3', 'paga'], ['Globoplay', 'stream'], ['F1 TV Premium', 'stream']], nota: 'Corridas no SporTV 3. Depois ficam inteiras no Globoplay.' },
    'formula-e': { canais: [['Band', 'aberta'], ['BandSports', 'paga'], ['Grande Prêmio (YouTube e GPTV)', 'gratis']], nota: 'A Band mostra classificação e corrida de algumas etapas. BandSports e Grande Prêmio mostram a temporada toda.' },
    'porsche-cup': { canais: [['Band', 'aberta'], ['BandSports', 'paga'], ['BandPlay', 'gratis'], ['YouTube Porsche Cup', 'gratis']], nota: '' },
    'endurance': { canais: [['BandSports', 'paga'], ['YouTube Esporte na Band', 'gratis'], ['Jovem Pan (YouTube)', 'gratis'], ['Grande Prêmio (YouTube e GPTV)', 'gratis']], nota: 'Todas as etapas do WEC ao vivo, com várias opções grátis no YouTube.' },
    'motogp': { canais: [['ESPN', 'paga'], ['Disney+', 'stream'], ['MotoGP VideoPass', 'stream']], nota: 'ESPN e Disney+ mostram todas as sessões de MotoGP, Moto2 e Moto3. Em 2026, a Band mostrou só o GP do Brasil.' },
  }
};

/* Endereço de cada canal (só os que conferimos). Canal sem endereço aparece sem o botão "Abrir". */
window.ONDE_ASSISTIR.links = {
  'TV Globo': 'https://globoplay.globo.com', 'Globoplay': 'https://globoplay.globo.com', 'SporTV': 'https://sportv.globo.com', 'SporTV 3': 'https://sportv.globo.com',
  'F1 TV Premium': 'https://f1tv.formula1.com', 'Band': 'https://www.band.com.br', 'BandSports': 'https://www.band.com.br', 'BandPlay': 'https://www.band.com.br',
  'ESPN': 'https://www.espn.com.br', 'Disney+': 'https://www.disneyplus.com', 'Rally.TV (DAZN)': 'https://www.dazn.com', 'Grande Prêmio (YouTube e GPTV)': 'https://www.grandepremio.com.br',
  'MotoGP VideoPass': 'https://www.motogp.com', 'WorldSBK VideoPass': 'https://www.worldsbk.com', 'IndyCar Live': 'https://www.indycar.com', 'IMSA TV': 'https://www.imsa.com'
};
/* Futebol e basquete no Brasil, temporada atual (2026 nos torneios sul-americanos, 2026/27 nos europeus e no basquete).
   Fontes: Lance, Máquina do Esporte, Meio & Mensagem, Terra, Mkt Esportivo e LNB, conferidos em out/2026.
   A divisão jogo a jogo muda a cada rodada: confira a grade do dia na emissora. */
(function (O) {
  var C = {
    'brasileirao': { canais: [['TV Globo', 'aberta'], ['Record', 'aberta'], ['SporTV', 'paga'], ['Premiere', 'paga'], ['Prime Video', 'stream'], ['CazéTV', 'gratis']], nota: 'Por rodada: a Globo mostra um jogo na TV aberta (clubes da Libra), Record e CazéTV dividem outro (clubes da Liga Forte União), o Prime Video tem um jogo exclusivo, o SporTV de 2 a 3 e o Premiere (pay-per-view) quase todos.' },
    'copa-do-brasil': { canais: [['TV Globo', 'aberta'], ['SporTV', 'paga'], ['Premiere', 'paga'], ['Prime Video', 'stream']], nota: 'Grupo Globo (TV Globo, SporTV e Premiere) e Prime Video dividem os jogos; alguns são exclusivos do Prime Video.' },
    'libertadores': { canais: [['TV Globo', 'aberta'], ['ESPN', 'paga'], ['Disney+', 'stream'], ['Paramount+', 'stream']], nota: 'A Globo mostra jogos escolhidos de times brasileiros na TV aberta. ESPN e Disney+ têm a maioria dos jogos e o Paramount+ tem jogos exclusivos; a divisão muda jogo a jogo.' },
    'sul-americana': { canais: [['SBT', 'aberta'], ['ESPN', 'paga'], ['Disney+', 'stream'], ['Paramount+', 'stream']], nota: 'O SBT mostra um jogo por rodada na TV aberta (2026 é o último ano dele). ESPN, Disney+ e Paramount+ dividem todos os jogos. A partir de 2027 a Sul-Americana vai para a TNT Sports.' },
    'champions-league': { canais: [['SBT', 'aberta'], ['TNT', 'paga'], ['HBO Max', 'stream'], ['TNT Sports (YouTube)', 'gratis']], nota: 'O HBO Max transmite todos os jogos. TNT e Space mostram jogos escolhidos, o SBT tem um jogo por rodada na TV aberta e a final, e alguns jogos passam de graça no YouTube da TNT Sports.' },
    'premier-league': { canais: [['ESPN', 'paga'], ['Disney+', 'stream'], ['CazéTV', 'gratis']], nota: 'O Disney+ tem os 380 jogos e a ESPN mostra jogos escolhidos. A CazéTV mostra um jogo por rodada de graça no YouTube.' },
    'la-liga': { canais: [['CazéTV', 'gratis'], ['SportyNet', 'paga']], nota: 'Desde 2026/27 a LaLiga é da CazéTV, com 8 jogos por rodada de graça no YouTube. A SportyNet tem 2 jogos por rodada, sem Real Madrid e Barcelona.' },
    'bundesliga': { canais: [['Jovem Pan', 'aberta'], ['SporTV', 'paga'], ['OneFootball', 'stream'], ['CazéTV', 'gratis']], nota: 'Os jogos ficam espalhados por vários canais, inclusive a Jovem Pan na TV aberta. O OneFootball tem a maior parte da rodada.' },
    'serie-a': { canais: [['ESPN', 'paga'], ['Disney+', 'stream'], ['SportyNet', 'gratis']], nota: 'ESPN e Disney+ têm os 380 jogos. A SportyNet mostra 2 jogos por rodada de graça no YouTube.' },
    'ligue-1': { canais: [['CazéTV', 'gratis']], nota: 'A CazéTV mostra jogos escolhidos de cada rodada de graça no YouTube.' },
    'nba': { canais: [['ESPN', 'paga'], ['Disney+', 'stream'], ['Prime Video', 'stream'], ['NBA League Pass', 'stream']], nota: 'A ESPN tem mais de 200 jogos (também no Disney+), incluindo Natal, playoffs e Finais. O Prime Video tem 147 jogos e a Copa da NBA. O League Pass tem todos os jogos.' },
    'euroleague': { canais: [['XSports', 'aberta'], ['EuroLeague TV', 'stream']], nota: 'A XSports tem jogos da Euroleague ao vivo na grade de outubro. O EuroLeague TV é o serviço oficial, pago, com todos os jogos.' },
    'nbb': { canais: [['XSports', 'aberta'], ['ESPN', 'paga'], ['SporTV', 'paga'], ['YouTube NBB', 'gratis']], nota: 'Todos os jogos são transmitidos: XSports na TV aberta, ESPN e SporTV na TV paga, e o resto no YouTube do NBB e nos canais dos clubes.' }
  };
  for (var k in C) O.cats[k] = C[k];
  var L = { 'Premiere': 'https://premiere.globo.com', 'Record': 'https://record.r7.com', 'CazéTV': 'https://www.youtube.com/@CazeTV', 'Prime Video': 'https://www.primevideo.com',
    'Paramount+': 'https://www.paramountplus.com/br/', 'SBT': 'https://www.sbt.com.br', 'TNT': 'https://www.tntsports.com.br', 'HBO Max': 'https://www.hbomax.com/br/pt',
    'TNT Sports (YouTube)': 'https://www.youtube.com/@TNTSportsBR', 'OneFootball': 'https://onefootball.com/pt-br/home', 'Jovem Pan': 'https://jovempan.com.br',
    'NBA League Pass': 'https://www.nba.com/watch/league-pass-stream', 'EuroLeague TV': 'https://euroleaguetv.com' };
  for (var n in L) if (!O.links[n]) O.links[n] = L[n];
})(window.ONDE_ASSISTIR);
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
