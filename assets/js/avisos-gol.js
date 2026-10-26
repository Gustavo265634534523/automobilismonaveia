/* Avisos de gol do meu time (carregado por site.js em todas as páginas, só faz algo se a pessoa ligou os avisos).
   Com o site aberto (mesmo em outra aba), acompanha os jogos do meu time de futebol e de basquete direto no placar da
   ESPN, de minuto em minuto, e avisa: começou, gol (ou cesta, no basquete só o fim), e fim de jogo.
   O aviso aparece na tela e, se a pessoa deixou, também como notificação do navegador.
   Times: naveia-meu-time (esportes-mais.js). Ligas e jogos: assets/dados/ao-vivo.js (carregado aqui se a página não tiver).
   Com o app das lojas, os avisos vão chegar mesmo com o site fechado; aqui é só com ele aberto. */
(function () {
  var LIGADO = 'arena-avisos-gol', VISTOS = 'arena-avisos-vistos';
  function ler(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

  window.avisosGol = {
    ligado: function () { return !!ler(LIGADO, false); },
    ligar: function (sim) {
      guardar(LIGADO, !!sim);
      if (sim && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(function () {});
      if (sim) comecar();
      document.dispatchEvent(new CustomEvent('naveia:avisos'));
    }
  };

  var timer = null;
  function comecar() {
    if (timer || !window.avisosGol.ligado()) return;
    var meus = ler('naveia-meu-time', {});
    if (!meus.futebol && !meus.basquete) return;
    carregarDados(function () { checar(); timer = setInterval(checar, 60e3); });
  }
  function carregarDados(pronto) {
    if (window.AO_VIVO) return pronto();
    var s = document.createElement('script'); s.src = 'assets/dados/ao-vivo.js'; s.onload = pronto; document.head.appendChild(s);
  }
  function inicio(j) { return j.d && j.h ? Date.parse(j.d + 'T' + j.h + ':00-03:00') : 0; }

  /* ligas em que o meu time tem jogo agora (de 15 min antes até 3 h depois do horário) */
  function ligasAgora() {
    var meus = ler('naveia-meu-time', {}), AV = window.AO_VIVO || {}, ligas = {}, agora = Date.now();
    var alvo = {}; if (meus.futebol) alvo[norm(meus.futebol)] = 'futebol'; if (meus.basquete) alvo[norm(meus.basquete)] = 'basquete';
    Object.keys(AV.comps || {}).forEach(function (slug) {
      var c = AV.comps[slug];
      (c.jogos || []).forEach(function (j) {
        var t = inicio(j), meu = alvo[norm(j.casa)] ? j.casa : alvo[norm(j.fora)] ? j.fora : '';
        if (meu && j.id && !j.p && t && agora > t - 15 * 60e3 && agora < t + 3 * 3600e3) {
          var L = ligas[c.liga] = ligas[c.liga] || {};
          L[j.id] = { casa: j.casa, fora: j.fora, meu: meu, esporte: alvo[norm(meu)] }; /* nomes em português, do nosso arquivo */
        }
      });
    });
    return ligas;
  }
  function checar() {
    var ligas = ligasAgora();
    Object.keys(ligas).forEach(function (liga) {
      fetch('https://site.api.espn.com/apis/site/v2/sports/' + liga + '/scoreboard').then(function (r) { return r.json(); }).then(function (r) {
        var jogos = ligas[liga], vistos = ler(VISTOS, {});
        (r.events || []).forEach(function (ev) {
          var info = jogos[ev.id], comp = ev.competitions && ev.competitions[0]; if (!info || !comp) return;
          var ca = comp.competitors.filter(function (x) { return x.homeAway === 'home'; })[0], fo = comp.competitors.filter(function (x) { return x.homeAway === 'away'; })[0];
          if (!ca || !fo) return;
          var nc = info.casa, nf = info.fora;
          var ehMeu = function (n) { return n === info.meu; };
          var st = ((ev.status || {}).type || {}).state, gc = +ca.score || 0, gf = +fo.score || 0;
          var antes = vistos[ev.id], agora = { st: st, c: gc, f: gf };
          vistos[ev.id] = agora;
          var placar = nc + ' ' + gc + ' x ' + gf + ' ' + nf, link = 'partida.html?id=' + ev.id;
          if (!antes) { if (st === 'in') avisar('Ao vivo: ' + placar, 'O jogo do ' + info.meu + ' está rolando.', link); return; }
          if (antes.st === 'pre' && st === 'in') avisar('Começou! ' + nc + ' x ' + nf, 'O jogo do ' + info.meu + ' começou.', link);
          if (info.esporte === 'futebol' && st !== 'pre') {
            if (gc > antes.c) avisar((ehMeu(nc) ? '⚽ GOOOL DO ' + nc.toUpperCase() + '!' : 'Gol do ' + nc), placar, link);
            if (gf > antes.f) avisar((ehMeu(nf) ? '⚽ GOOOL DO ' + nf.toUpperCase() + '!' : 'Gol do ' + nf), placar, link);
          }
          if (antes.st !== 'post' && st === 'post') avisar('Fim de jogo', placar, link);
        });
        guardar(VISTOS, vistos);
      }).catch(function () {});
    });
  }

  /* aviso na tela (some sozinho) e notificação do navegador, se permitida */
  function avisar(titulo, texto, link) {
    var d = document.createElement('a');
    d.className = 'ag-aviso'; d.href = link; d.setAttribute('role', 'status');
    d.innerHTML = '<b></b><span></span><small>Toque para ver o jogo</small>';
    d.querySelector('b').textContent = titulo; d.querySelector('span').textContent = texto;
    d.style.marginTop = document.querySelectorAll('.ag-aviso').length * 104 + 'px'; /* vários avisos: um embaixo do outro */
    document.body.appendChild(d);
    setTimeout(function () { d.classList.add('ativo'); }, 20);
    setTimeout(function () { d.classList.remove('ativo'); setTimeout(function () { d.remove(); }, 400); }, 9000);
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try { var n = new Notification(titulo, { body: texto, icon: 'assets/app/icone-192.png', tag: 'arena-' + link }); n.onclick = function () { window.focus(); location.href = link; }; } catch (e) {}
    }
    if (navigator.vibrate) try { navigator.vibrate([120, 60, 120]); } catch (e) {}
  }
  window.avisosGol.checar = function () { checar(); };
  window.avisosGol.testar = function () { avisar('⚽ GOOOL! (teste)', 'É assim que o aviso aparece quando o seu time marcar.', 'meu-time.html'); };

  document.addEventListener('naveia:meu-time', function () { if (timer) { clearInterval(timer); timer = null; } comecar(); });
  comecar();
  document.dispatchEvent(new CustomEvent('naveia:avisos')); /* a página Meu time pinta a chave de novo, agora com o estado certo */
})();
