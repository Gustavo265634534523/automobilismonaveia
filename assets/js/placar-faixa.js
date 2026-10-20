/* Faixa de placar ao vivo no alto de todas as páginas (carregada por site.js): jogos de hoje do futebol e do basquete
   (ao vivo primeiro, com o minuto; depois os que ainda vão começar e os encerrados) e as sessões da F1 do dia.
   Dados: esportes-dados.js, ao-vivo.js (robô do placar, a cada 10 minutos) e escudos.js; se a página não tiver
   carregado esses arquivos, a faixa carrega sozinha. Com jogo rolando, pergunta o placar à ESPN a cada minuto. */
(function () {
  var V = (document.querySelector('script[src*="site.js?v="]') || { src: '' }).src.split('?v=')[1] || '';
  function carregar(src, pronto) {
    var s = document.createElement('script'); s.src = src + (V ? '?v=' + V : ''); s.onload = s.onerror = pronto; document.body.appendChild(s);
  }
  var falta = [];
  if (!window.COMPETICOES) falta.push('assets/js/esportes-dados.js');
  if (!window.AO_VIVO) falta.push('assets/dados/ao-vivo.js');
  if (!window.ESCUDOS) falta.push('assets/dados/escudos.js');
  (function proximo() { if (falta.length) carregar(falta.shift(), proximo); else iniciar(); })();

  function iniciar() {
    var esc = window.esc, COMPS = window.COMPETICOES || [], AV = window.AO_VIVO || {};
    var topo = document.getElementById('topo'); if (!topo) return;
    var hoje = window.hojeISO();
    /* junta os jogos do robô (mais novos) com os escritos à mão, sem repetir */
    function jogosDe(c) {
      var v = AV.comps && AV.comps[c.slug], lista = (v && v.jogos) ? v.jogos.slice() : [];
      (c.jogos || []).forEach(function (j) { if (!lista.some(function (x) { return x.casa === j.casa && x.fora === j.fora && x.d === j.d; })) lista.push(j); });
      return lista;
    }
    var hora = function (j) { return j.d && j.h ? Date.parse(j.d + 'T' + j.h + ':00-03:00') : 0; };
    function rolando(j) { var t = hora(j), a = Date.now(); return !!j.vivo || (!j.p && t && a > t && a < t + 2.5 * 3600e3); }
    function escudo(n) { var s = (window.ESCUDOS || {})[n]; return s ? '<img src="' + s + '" alt="" loading="lazy">' : ''; }
    var faixa = document.createElement('div');
    faixa.className = 'pf'; faixa.setAttribute('aria-label', 'Placar de hoje');
    topo.insertBefore(faixa, topo.firstChild);

    function pintar() {
      var itens = [];
      COMPS.forEach(function (c) {
        jogosDe(c).forEach(function (j) {
          if (j.d !== hoje || !j.casa || !j.fora || /a definir/i.test(j.casa)) return;
          var vivo = rolando(j), pl = j.vivo ? j.vivo.p : j.p;
          itens.push({ ordem: vivo ? 0 : !j.p ? 1 : 2, t: hora(j), html: '<a class="pf-j' + (vivo ? ' pf-vivo' : '') + '" href="' + c.slug + '.html#jogos" title="' + esc(c.menu) + '">' +
            '<small>' + (vivo ? '<i></i>' + (j.vivo && j.vivo.min ? esc(j.vivo.min) : 'Ao vivo') : j.p ? 'Fim' : esc(j.h || '--:--')) + '</small>' +
            escudo(j.casa) + '<b>' + esc(j.casa) + '</b>' + (pl ? '<em>' + esc(String(pl).replace(' x ', ' – ')) + '</em>' : '<em class="pf-x">x</em>') + '<b>' + esc(j.fora) + '</b>' + escudo(j.fora) + '</a>' });
        });
      });
      /* F1: as sessões de hoje */
      (window.CATEGORIAS || []).forEach(function (c) {
        (c.calendario || []).forEach(function (e) {
          (e.s || []).forEach(function (s) {
            if (s.d !== hoje || !/corrida|sprint|classifica/i.test(s.t)) return;
            var t = Date.parse(s.d + 'T' + (s.h || '12:00') + ':00-03:00'), vivo = Date.now() > t && Date.now() < t + 2 * 3600e3;
            itens.push({ ordem: vivo ? 0 : Date.now() < t ? 1 : 2, t: t, html: '<a class="pf-j' + (vivo ? ' pf-vivo' : '') + '" href="formula-1.html#calendario">' +
              '<small>' + (vivo ? '<i></i>Ao vivo' : esc(s.h || '')) + '</small><b>F1 · ' + esc(e.n) + '</b><em class="pf-x">' + esc(s.t) + '</em></a>' });
          });
        });
      });
      if (!itens.length) { faixa.hidden = true; document.documentElement.classList.remove('com-placar'); return; }
      itens.sort(function (a, b) { return a.ordem - b.ordem || a.t - b.t; });
      var vivos = itens.filter(function (x) { return x.ordem === 0; }).length;
      faixa.hidden = false; document.documentElement.classList.add('com-placar');
      faixa.innerHTML = '<span class="pf-rot">' + (vivos ? '<i></i>' + vivos + ' ao vivo' : 'Hoje') + '</span><div class="pf-lista">' + itens.map(function (x) { return x.html; }).join('') + '</div>';
    }
    pintar();
    setInterval(pintar, 60e3);

    /* com jogo rolando: placar e minuto direto da ESPN, a cada minuto */
    function atualizar() {
      if (document.hidden || !AV.comps) return;
      var ligas = {};
      COMPS.forEach(function (c) { var v = AV.comps[c.slug]; if (v && v.liga && jogosDe(c).some(function (j) { return j.d === hoje && (rolando(j) || (!j.p && hora(j) && Date.now() > hora(j) - 10 * 60e3)); })) ligas[v.liga] = v; });
      Object.keys(ligas).forEach(function (liga) {
        fetch('https://site.api.espn.com/apis/site/v2/sports/' + liga + '/scoreboard').then(function (r) { return r.json(); }).then(function (r) {
          (r.events || []).forEach(function (ev) {
            var j = (ligas[liga].jogos || []).filter(function (x) { return x.id === ev.id; })[0]; if (!j) return;
            var cp = ev.competitions[0], tp = (ev.status || {}).type || {};
            var ca = cp.competitors.filter(function (x) { return x.homeAway === 'home'; })[0], fo = cp.competitors.filter(function (x) { return x.homeAway === 'away'; })[0];
            var p = (ca.score || '0') + ' x ' + (fo.score || '0');
            if (tp.state === 'in') { j.vivo = { p: p, min: tp.shortDetail || '' }; delete j.p; }
            else if (tp.state === 'post' && tp.completed) { j.p = p; delete j.vivo; }
          });
          pintar();
        }).catch(function () { /* sem acesso à ESPN: fica o placar do robô */ });
      });
    }
    setTimeout(atualizar, 2000); setInterval(atualizar, 60e3);
  }
})();
