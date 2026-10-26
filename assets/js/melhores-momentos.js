/* Melhores momentos (melhores-momentos.html): os vídeos de lances dos canais oficiais, por esporte (abas) e por
   campeonato (filtros). Futebol e basquete: assets/dados/videos-esportes.js; Fórmula 1: VIDEOS_F1 em video-capa.js
   (robôs .github/videos-esportes.js e .github/video-capa.js). Os vídeos abrem no YouTube, porque vários canais
   oficiais não deixam tocar fora de lá. */
(function () {
  var caixa = document.getElementById('mm-videos'); if (!caixa) return;
  var esc = window.esc;
  var ABAS = [['futebol', 'Futebol'], ['basquete', 'Basquete'], ['f1', 'Fórmula 1']];
  var todos = (window.VIDEOS_ESPORTES || []).filter(function (v) { return v && v.id; })
    .concat((window.VIDEOS_F1 || []).map(function (v) { return { id: v.id, titulo: v.titulo, publicado: v.publicado, esporte: 'f1', comp: 'formula-1', nome: 'Fórmula 1' }; }))
    .sort(function (a, b) { return String(b.publicado).localeCompare(String(a.publicado)); });
  var aba = /basquete|nba/.test(location.hash) ? 'basquete' : /f1|formula/.test(location.hash) ? 'f1' : 'futebol', filtro = '';
  function quando(p) { var n = window.diasAte(String(p).slice(0, 10)); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : window.dataCurta(String(p).slice(0, 10)); }
  function cartao(v) {
    var img = window.capaVideo ? window.capaVideo(v.id, 'hqdefault', v.esporte === 'f1' ? 'automobilismo' : v.esporte) : '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg" alt="" loading="lazy">';
    return '<a class="vd-cartao" href="https://www.youtube.com/watch?v=' + encodeURIComponent(v.id) + '" target="_blank" rel="noopener" aria-label="Assistir no YouTube: ' + esc(v.titulo) + '">' +
      '<span class="vd-img">' + img + '<i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></i></span>' +
      '<small>' + esc(v.nome) + ' · ' + esc(quando(v.publicado)) + '</small><b>' + esc(v.titulo) + '</b></a>';
  }
  function pintar() {
    var doEsporte = todos.filter(function (v) { return v.esporte === aba; });
    var comps = []; doEsporte.forEach(function (v) { if (comps.indexOf(v.nome) < 0) comps.push(v.nome); });
    if (comps.indexOf(filtro) < 0) filtro = '';
    var lista = doEsporte.filter(function (v) { return !filtro || v.nome === filtro; });
    caixa.innerHTML = '<div class="mmv-abas" role="tablist">' + ABAS.map(function (a) { return '<button type="button" role="tab" data-aba="' + a[0] + '" aria-selected="' + (a[0] === aba) + '">' + a[1] + '</button>'; }).join('') + '</div>' +
      (comps.length > 1 ? '<div class="mmv-filtros">' + ['Todos'].concat(comps).map(function (c) { var v = c === 'Todos' ? '' : c; return '<button type="button" data-filtro="' + esc(v) + '" aria-pressed="' + (v === filtro) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '') +
      (lista.length ? '<div class="vd-grade">' + lista.map(cartao).join('') + '</div>' : '<p class="pt-vazio">Ainda não tem vídeo novo aqui. Os melhores momentos aparecem logo depois dos jogos.</p>') +
      '<p class="vd-nota">Vídeos dos canais oficiais dos campeonatos e da Fórmula 1. Toque para assistir no YouTube.</p>';
  }
  caixa.addEventListener('click', function (e) {
    var a = e.target.closest('[data-aba]'), f = e.target.closest('[data-filtro]');
    if (a) { aba = a.getAttribute('data-aba'); filtro = ''; history.replaceState(null, '', '#' + aba); pintar(); }
    if (f) { filtro = f.getAttribute('data-filtro'); pintar(); }
  });
  pintar();
})();
