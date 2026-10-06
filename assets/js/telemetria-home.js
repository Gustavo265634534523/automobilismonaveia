/* Amostra grátis de telemetria na página inicial: pole x 2º da última classificação de F1 (assets/dados/telemetria-amostra.js).
   O nome do GP sai do calendário da F1 em dados.js (etapa até 3 dias depois da classificação). */
(function () {
  var A = window.TELEMETRIA_AMOSTRA, caixa = document.getElementById('tl-home');
  if (!A || !caixa || !window.TELEMETRIA) { var s = document.getElementById('telemetria'); if (s) s.hidden = true; return; }
  var f1 = (window.CATEGORIAS || []).filter(function (c) { return c.slug === 'formula-1'; })[0], gp = A.gp;
  if (f1) {
    var lim = new Date(Date.parse(A.data + 'T12:00:00Z') + 3 * 864e5).toISOString().slice(0, 10);
    var e = f1.calendario.filter(function (x) { return x.d && x.d >= A.data && x.d <= lim; })[0];
    if (e) gp = e.n;
  }
  var p = A.pilotos;
  var dif = Math.abs(A.r.tempoB - A.r.tempoA).toFixed(3).replace('.', ',');
  document.getElementById('tl-sessao').innerHTML = 'Classificação do <b>' + window.esc(gp) + '</b>: <b>' + window.esc(p[0].nome) + '</b>, pole position, contra <b>' + window.esc(p[1].nome) + '</b>, 2º colocado, ' + dif + 's atrás.';
  window.TELEMETRIA.video(document.getElementById('tl-video'), A.sessao);
  window.TELEMETRIA.desenhar(caixa, A.r, { nomes: [p[0].sigla, p[1].sigla], paineis: ['v', 'delta'] });
})();
