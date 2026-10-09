/* Página das pole positions da temporada (poles.html). Dados: assets/dados/poles.js, feito pelo robô .github/poles.js. */
(function () {
  var P = window.POLES || {}, esc = window.esc, CATS = window.CATEGORIAS || [];
  var ORDEM = ['formula-1', 'motogp', 'stock-car', 'formula-2', 'formula-3', 'formula-e', 'indycar', 'nascar', 'dtm', 'superbike', 'endurance', 'le-mans', 'imsa', 'porsche-cup'];
  var cats = ORDEM.map(function (sl) { return CATS.filter(function (c) { return c.slug === sl; })[0]; }).filter(function (c) { return c && P[c.slug] && P[c.slug].length; });
  var lista = document.getElementById('pl-lista');
  if (!cats.length) { lista.innerHTML = '<p class="pv-vazio">As poles aparecem aqui depois das primeiras corridas.</p>'; return; }

  /* quem fez a pole (nos fins de semana com duas corridas, conta cada uma; no WEC e na IMSA, sem o carro entre parênteses) */
  function nomes(p) { return p.pole.split(' · ').map(function (x) { return x.replace(/^Corrida \d+: /, '').replace(/\s*\(.*\)$/, '').trim(); }); }
  function contagem(c) {
    var n = {};
    P[c.slug].forEach(function (p) { nomes(p).forEach(function (x) { if (!/#\d/.test(x)) n[x] = (n[x] || 0) + 1; }); });
    return Object.keys(n).map(function (k) { return [k, n[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function bandeira(p) { return p.pais ? '<span class="pl-bandeira' + (p.pais === 'BRA' ? ' br' : '') + '">' + esc(p.pais === 'BRA' ? 'BR' : p.pais) + '</span>' : ''; }

  /* rei das poles de cada categoria */
  document.getElementById('pl-reis').innerHTML = cats.map(function (c) {
    var t = contagem(c), k = t[0];
    if (!k) return '';
    /* empate no topo: mostra todos */
    var reis = t.filter(function (x) { return x[1] === k[1]; }).map(function (x) { return x[0]; });
    var nome = reis.length > 1 ? reis.slice(0, -1).join(', ') + ' e ' + reis[reis.length - 1] : reis[0];
    return '<a class="pl-rei" href="#pl-' + c.slug + '"><small>' + esc(c.menu || c.nome) + '</small><b>' + esc(nome) + '</b><span>' + k[1] + (k[1] === 1 ? ' pole' : ' poles') + (reis.length > 1 ? ' cada' : '') + ' em ' + P[c.slug].length + (P[c.slug].length === 1 ? ' etapa' : ' etapas') + '</span></a>';
  }).join('');

  /* brasileiros na pole */
  var br = {};
  cats.forEach(function (c) { P[c.slug].forEach(function (p) { if (p.pais === 'BRA') { var k = nomes(p)[0] + '|' + (c.menu || c.nome); br[k] = (br[k] || 0) + 1; } }); });
  var chaves = Object.keys(br).sort(function (a, b) { return br[b] - br[a]; });
  if (chaves.length) {
    var caixa = document.getElementById('pl-br');
    caixa.innerHTML = '<h2>Brasileiros na pole em 2026</h2><ul>' + chaves.map(function (k) { var x = k.split('|'); return '<li><b>' + esc(x[0]) + '</b> · ' + esc(x[1]) + ': ' + br[k] + (br[k] === 1 ? ' pole' : ' poles') + '</li>'; }).join('') + '</ul>';
    caixa.hidden = false;
  }

  /* filtro por categoria e uma tabela por categoria */
  var filtro = document.getElementById('pl-filtro');
  filtro.innerHTML = '<button type="button" data-cat="" aria-pressed="true">Todas</button>' + cats.map(function (c) { return '<button type="button" data-cat="' + c.slug + '" aria-pressed="false">' + esc(c.menu || c.nome) + '</button>'; }).join('');
  lista.innerHTML = cats.map(function (c) {
    var k = contagem(c);
    return '<section class="pl-cat" id="pl-' + c.slug + '" data-cat="' + c.slug + '"><div class="pl-cat-cab"><h2><a href="' + c.slug + '.html">' + esc(c.nome) + '</a></h2><span>' + P[c.slug].length + ' de ' + c.calendario.length + ' etapas</span></div>' +
      '<div class="tabela-wrap"><table class="pl-tab"><thead><tr><th scope="col">#</th><th scope="col">Etapa</th><th scope="col">Data</th><th scope="col">Pole position</th></tr></thead><tbody>' +
      P[c.slug].map(function (p) {
        return '<tr><td>' + p.e + '</td><td>' + esc(p.n) + (p.l && p.l !== p.n ? ' <small>· ' + esc(p.l) + '</small>' : '') + '</td><td class="pl-data">' + window.dataCurta(p.d) + '</td><td class="pl-pole"><b>' + esc(p.pole) + '</b>' + bandeira(p) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (k.length ? '<p class="pl-contagem">Mais poles: ' + k.slice(0, 4).map(function (x) { return esc(x[0]) + ' (' + x[1] + ')'; }).join(', ') + '</p>' : '') + '</section>';
  }).join('');
  filtro.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    var sl = b.getAttribute('data-cat');
    [].forEach.call(filtro.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b); });
    [].forEach.call(lista.querySelectorAll('.pl-cat'), function (s) { s.hidden = !!sl && s.getAttribute('data-cat') !== sl; });
  });
  document.getElementById('pl-fonte').textContent = 'Fontes: as tabelas de resultados de cada temporada na Wikipédia e, no WEC e na IMSA, as reportagens das classificações. Na Stock Car, vale a pole da corrida 1 (a corrida 2 tem grid invertido). Atualizado em ' + String(window.POLES_ATUALIZADO || '').split('-').reverse().join('/') + '.';
})();
