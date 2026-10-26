/* Aba "Ao vivo" / "Campo" da página do jogo (partida.js): o campo com os 22 jogadores em bolinhas (nome e número),
   cada time na formação real do jogo. É uma ilustração, não a posição real de cada um (esse dado é pago): o time que
   está pressionando avança, e em cada lance (gol, cartão, troca, chance) o jogador envolvido acende e a bola vai até lá.
   Jogo encerrado: dá para rever o jogo inteiro em 45 segundos (Reproduzir). Jogo rolando: fica no minuto atual.
   Também: linha do tempo com os lances e posse de bola. (Mapa de chutes: a ESPN não manda a posição dos chutes.) */
(function () {
  var esc = window.esc, L = 105, A = 68;
  var COR = { casa: '#2563eb', fora: '#f97316' };
  var ICONE = { gol: '⚽', 'gol-penalti': '⚽', 'gol-contra': '⚽', amarelo: '🟨', vermelho: '🟥', troca: '⇄', 'penalti-perdido': '✕' };
  var estado = { min: 0, tocando: false, ultimo: 0, raf: 0, aviso: '', avisoAte: 0, bola: { x: 52.5, y: 34 } };

  function minuto(s) { var m = String(s || '').match(/(\d+)(?:'\s*\+\s*(\d+))?/); return m ? +m[1] + (m[2] ? +m[2] / 10 : 0) : 0; }
  function sobrenome(n) { var p = String(n).trim().split(/\s+/); return p.length > 1 && p[p.length - 1].length > 2 ? p[p.length - 1] : n; }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /* posições base: goleiro perto do gol, linhas avançando até o meio; casa ataca para a direita */
  function montarTime(E, lado, linhas) {
    var rows = linhas(E, lado === 'fora'), out = [];
    rows.forEach(function (ln, i) {
      var x = i === 0 ? 6.5 : 13 + (i - 1) * (36 / Math.max(1, rows.length - 2));
      ln.forEach(function (a, k) {
        var y = A * (k + 1) / (ln.length + 1);
        out.push({ a: a, lado: lado, bx: lado === 'casa' ? x : L - x, by: y, linha: i, fase: Math.random() * 6, x: 0, y: 0 });
      });
    });
    return out;
  }
  /* quem está em campo no minuto m (troca: "quem" entra e "extra" sai) */
  function emCampo(J, D, m) {
    J.forEach(function (p) { p.atual = p.a; });
    (D.lances || []).forEach(function (l) {
      if (l.tipo !== 'troca' || minuto(l.min) > m) return;
      J.forEach(function (p) { if (norm(p.atual.n) === norm(l.extra)) { var lado = p.lado === 'casa' ? D.escalacoes.casa : D.escalacoes.fora; var r = (lado.reservas || []).filter(function (x) { return norm(x.n) === norm(l.quem); })[0]; p.atual = r || { n: l.quem, num: '' }; } });
    });
  }
  function eventos(D) {
    return (D.lances || []).filter(function (l) { return l.min && ICONE[l.tipo]; }).map(function (l) {
      var lado = l.time === D.casa ? 'casa' : l.time === D.fora ? 'fora' : '';
      return { m: minuto(l.min), l: l, lado: lado };
    }).sort(function (a, b) { return a.m - b.m; });
  }
  function duracao(D, ev) { var ult = ev.length ? ev[ev.length - 1].m : 0; return Math.max(90, Math.ceil(ult)); }
  function posse(D) { var s = (D.estatisticas || []).filter(function (e) { return /posse/i.test(e[0]); })[0]; return s ? [parseFloat(s[1]) || 50, parseFloat(s[2]) || 50] : null; }

  function campoSVG() {
    var l = 'stroke="rgba(255,255,255,.75)" stroke-width=".35" fill="none"';
    var listras = ''; for (var i = 0; i < 10; i++) listras += '<rect x="' + i * 10.5 + '" y="0" width="10.5" height="' + A + '" fill="' + (i % 2 ? '#2f8f3a' : '#34993f') + '"/>';
    return '<svg class="pc-campo" viewBox="-2 -2 ' + (L + 4) + ' ' + (A + 4) + '" role="img" aria-label="Campo com os jogadores">' +
      '<rect x="-2" y="-2" width="' + (L + 4) + '" height="' + (A + 4) + '" fill="#2b8436"/>' + listras +
      '<rect x="0" y="0" width="' + L + '" height="' + A + '" ' + l + '/><line x1="52.5" y1="0" x2="52.5" y2="' + A + '" ' + l + '/>' +
      '<circle cx="52.5" cy="34" r="9.15" ' + l + '/><circle cx="52.5" cy="34" r=".5" fill="#fff"/>' +
      '<rect x="0" y="13.84" width="16.5" height="40.32" ' + l + '/><rect x="88.5" y="13.84" width="16.5" height="40.32" ' + l + '/>' +
      '<rect x="0" y="24.84" width="5.5" height="18.32" ' + l + '/><rect x="99.5" y="24.84" width="5.5" height="18.32" ' + l + '/>' +
      '<rect x="-1.6" y="30.34" width="1.6" height="7.32" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width=".3"/><rect x="' + L + '" y="30.34" width="1.6" height="7.32" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width=".3"/>' +
      '<g class="pc-jogs"></g><circle class="pc-bola" r="1.1" fill="#fff" stroke="#111" stroke-width=".25"/>' +
      '</svg>';
  }

  window.PARTIDA_CAMPO = {
    html: function (D, j) {
      if (!D.escalacoes) return '<p class="pt-vazio">O campo aparece quando saírem as escalações (perto do começo do jogo).</p>';
      var ev = eventos(D), dur = duracao(D, ev), vivo = !!(j && j.vivo), P = posse(D);
      var marcas = ev.map(function (e) {
        return '<span class="pc-ev pc-ev-' + e.lado + '" style="left:' + (Math.min(e.m, dur) / dur * 100).toFixed(1) + '%" title="' + esc(e.l.min + ' ' + (e.l.quem || '')) + '">' + ICONE[e.l.tipo] + '</span>';
      }).join('');
      return '<section class="pc">' +
        '<div class="pc-legenda"><span><i style="background:' + COR.casa + '"></i>' + esc(D.casa) + ' →</span><span>← ' + esc(D.fora) + '<i style="background:' + COR.fora + '"></i></span></div>' +
        '<div class="pc-tela">' + campoSVG() + '<div class="pc-aviso" hidden></div><div class="pc-mini"></div></div>' +
        '<div class="pc-linha"><div class="pc-trilho"><div class="pc-feito"></div>' + marcas + '<div class="pc-cursor"></div></div>' +
          '<div class="pc-mins"><span>0\'</span><span>45\'</span><span>' + dur + '\'</span></div></div>' +
        '<div class="pc-botoes">' + (vivo ? '<span class="pc-vivo"><i></i>Acompanhando ao vivo</span>' : '<button type="button" class="ft-btn pc-play">▶ Reproduzir o jogo</button>') +
          '</div>' +
        (P ? '<div class="pc-posse"><b style="color:' + COR.casa + '">' + Math.round(P[0]) + '%</b><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.9" fill="none" stroke="' + COR.fora + '" stroke-width="5"/>' +
          '<circle cx="21" cy="21" r="15.9" fill="none" stroke="' + COR.casa + '" stroke-width="5" stroke-dasharray="' + P[0].toFixed(1) + ' ' + (100 - P[0]).toFixed(1) + '" stroke-dashoffset="25"/><text x="21" y="22.5" text-anchor="middle">Posse</text></svg><b style="color:' + COR.fora + '">' + Math.round(P[1]) + '%</b></div>' : '') +
        '<p class="pc-nota">Ilustração do jogo: cada time na formação real, com os lances no minuto em que aconteceram. As bolinhas não mostram a posição exata de cada jogador.</p>' +
        '</section>';
    },
    iniciar: function (caixa, D, j, linhas) {
      cancelAnimationFrame(estado.raf);
      var svg = caixa.querySelector('.pc-campo'); if (!svg || !D.escalacoes) return;
      var J = montarTime(D.escalacoes.casa, 'casa', linhas).concat(montarTime(D.escalacoes.fora, 'fora', linhas));
      var ev = eventos(D), dur = duracao(D, ev), vivo = !!(j && j.vivo);
      var agora = vivo ? minuto(j.vivo.min) || dur : (estado.tocando ? estado.min : dur);
      if (!estado.tocando) estado.min = agora;
      var gJ = svg.querySelector('.pc-jogs'), bola = svg.querySelector('.pc-bola'), aviso = caixa.querySelector('.pc-aviso');
      var cursor = caixa.querySelector('.pc-cursor'), feito = caixa.querySelector('.pc-feito'), mini = caixa.querySelector('.pc-mini');
      gJ.innerHTML = J.map(function (p, i) {
        return '<g class="pc-j" data-i="' + i + '"><circle r="2.3" fill="' + COR[p.lado] + '" stroke="#fff" stroke-width=".35"/><text class="pc-num" y=".85" text-anchor="middle"></text><text class="pc-nome" y="4.6" text-anchor="middle"></text></g>';
      }).join('');
      var nos = [].slice.call(gJ.children);
      var bp = caixa.querySelector('.pc-play');
      if (bp) bp.addEventListener('click', function () {
        if (estado.tocando) { estado.tocando = false; bp.textContent = '▶ Reproduzir o jogo'; return; }
        estado.tocando = true; if (estado.min >= dur) estado.min = 0; estado.feitos = {}; bp.textContent = '⏸ Pausar';
      });
      if (bp && estado.tocando) bp.textContent = '⏸ Pausar';
      /* clicar na linha do tempo leva para aquele minuto */
      caixa.querySelector('.pc-trilho').addEventListener('click', function (e) {
        var r = this.getBoundingClientRect(); estado.min = Math.max(0, Math.min(dur, (e.clientX - r.left) / r.width * dur)); estado.feitos = {};
      });
      estado.feitos = estado.feitos || {};
      var destaque = null, alvoBola = { x: 52.5, y: 34 };
      function lance(e) {
        var l = e.l, quem = norm(l.quem), p = J.filter(function (q) { return norm(q.atual.n) === quem; })[0];
        destaque = p ? { p: p, ate: performance.now() + 2200 } : null;
        var gol = /^gol/.test(l.tipo), lado = l.tipo === 'gol-contra' ? (e.lado === 'casa' ? 'fora' : 'casa') : e.lado;
        if (gol) alvoBola = { x: lado === 'casa' ? L + 0.5 : -0.5, y: 34 + (Math.random() - 0.5) * 5 };
        else if (p) alvoBola = { x: p.x, y: p.y };
        estado.aviso = (ICONE[l.tipo] || '') + ' ' + l.min + ' ' + (gol ? 'GOL! ' : l.tipo === 'troca' ? 'Entra ' : '') + (l.quem || '') + (l.tipo === 'troca' && l.extra ? ', sai ' + l.extra : '') + (gol && l.extra ? ' (assistência: ' + l.extra + ')' : '');
        estado.avisoAte = performance.now() + 2600;
      }
      function quadro(t) {
        var dt = Math.min(0.05, (t - (estado.ultimo || t)) / 1000); estado.ultimo = t;
        if (estado.tocando) {
          var antes = estado.min; estado.min = Math.min(dur, estado.min + dt * dur / 45);
          ev.forEach(function (e, i) { if (e.m > antes && e.m <= estado.min && !estado.feitos[i]) { estado.feitos[i] = 1; lance(e); } });
          if (estado.min >= dur) { estado.tocando = false; if (bp) bp.textContent = '▶ Reproduzir de novo'; }
        }
        emCampo(J, D, estado.min);
        /* pressão: quem fez o último lance (até 6 minutos antes) avança um pouco; sem lance, segue a posse de bola */
        var rec = ev.filter(function (e) { return e.m <= estado.min && estado.min - e.m < 6 && e.lado; }).pop(), P = posse(D) || [50, 50];
        var empurra = rec ? (rec.lado === 'casa' ? 1 : -1) : (P[0] - P[1]) / 40;
        J.forEach(function (p, i) {
          p.fase += dt * 0.8;
          var avanco = p.linha === 0 ? 0 : empurra * (2 + p.linha * 1.3);
          p.x = p.bx + avanco + Math.sin(p.fase + i) * 1.1; p.y = p.by + Math.cos(p.fase * 0.8 + i * 1.7) * 1.3;
          var no = nos[i], on = destaque && destaque.p === p && t < destaque.ate;
          no.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ')' + (on ? ' scale(1.35)' : ''));
          no.classList.toggle('pc-on', !!on);
          var tx = no.children; if (tx[1].textContent !== String(p.atual.num || '')) tx[1].textContent = p.atual.num || '';
          var nm = sobrenome(p.atual.n); if (tx[2].textContent !== nm) tx[2].textContent = nm;
        });
        /* a bola passeia pelo campo do time que pressiona e vai até cada lance */
        if (!destaque || t > destaque.ate) { if (Math.random() < dt * 0.8) alvoBola = { x: 52.5 + empurra * 20 + (Math.random() - 0.5) * 40, y: 8 + Math.random() * 52 }; }
        estado.bola.x += (alvoBola.x - estado.bola.x) * Math.min(1, dt * 2.2); estado.bola.y += (alvoBola.y - estado.bola.y) * Math.min(1, dt * 2.2);
        bola.setAttribute('cx', estado.bola.x.toFixed(2)); bola.setAttribute('cy', estado.bola.y.toFixed(2));
        var pc = (estado.min / dur * 100).toFixed(2) + '%'; cursor.style.left = pc; feito.style.width = pc;
        /* placar no minuto mostrado (no replay ele vai mudando a cada gol) */
        var gc = 0, gf = 0; ev.forEach(function (e) { if (e.m > estado.min || !/^gol/.test(e.l.tipo)) return; var a = e.l.tipo === 'gol-contra' ? (e.lado === 'casa' ? 'fora' : 'casa') : e.lado; if (a === 'casa') gc++; else if (a === 'fora') gf++; });
        var txt = Math.floor(estado.min) + "' · " + gc + ' x ' + gf; if (mini.textContent !== txt) mini.textContent = txt;
        if (t < estado.avisoAte) { if (aviso.hidden || aviso.textContent !== estado.aviso) { aviso.textContent = estado.aviso; aviso.hidden = false; } } else aviso.hidden = true;
        if (document.body.contains(svg)) estado.raf = requestAnimationFrame(quadro);
      }
      /* ao vivo: lance novo desde a última atualização acende no campo */
      if (vivo && estado.nEv != null && ev.length > estado.nEv) lance(ev[ev.length - 1]);
      estado.nEv = ev.length;
      estado.raf = requestAnimationFrame(quadro);
    }
  };
})();
