/* Seções de destaque das páginas de Futebol e Basquete, com os dados dos robôs (.github/estatisticas-futebol.js e
   .github/nba-extras.js):
   futebol.html: seleção da rodada do Brasileirão (no campo) e brasileiros na Europa (a semana e a temporada);
   basquete.html: noite da NBA, brasileiros na NBA e lesões.
   Seção sem dados fica escondida. */
(function () {
  var esc = window.esc;
  function mostrar(id, html) { var s = document.getElementById(id); if (!s) return null; if (!html) { s.hidden = true; return null; } s.hidden = false; s.querySelector('.dq-corpo').innerHTML = html; return s; }
  function quando(d) { var n = window.diasAte(d); return n === 0 ? 'Hoje' : n === -1 ? 'Ontem' : window.dataCurta(d); }
  function sobrenome(n) { var p = String(n).trim().split(/\s+/); return p.length > 1 && p[p.length - 1].length > 2 ? p[p.length - 1] : n; }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
  /* abas simples dentro de uma seção */
  function abas(s) {
    [].forEach.call(s.querySelectorAll('.dq-abas button'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(s.querySelectorAll('.dq-abas button'), function (x) { x.setAttribute('aria-selected', x === b); });
        [].forEach.call(s.querySelectorAll('[data-painel]'), function (p) { p.hidden = p.getAttribute('data-painel') !== b.getAttribute('data-aba'); });
      });
    });
  }
  /* "ver mais" de uma lista longa */
  function verMais(s) {
    [].forEach.call(s.querySelectorAll('.dq-mais'), function (b) {
      b.addEventListener('click', function () { [].forEach.call(b.parentNode.parentNode.querySelectorAll('.dq-escondido'), function (x) { x.classList.remove('dq-escondido'); }); b.parentNode.remove(); });
    });
  }

  /* ---------- futebol: seleção da rodada ---------- */
  var DF = window.DESTAQUES_FUTEBOL;
  var S = DF && DF.selecao;
  if (S && S.linhas) {
    var de = window.dataCurta(S.de), ate = window.dataCurta(S.ate);
    var campo = '<div class="sr-campo" aria-label="Seleção da rodada no campo, formação ' + esc(S.formacao) + '">' + S.linhas.map(function (ln) {
      return '<div class="sr-linha">' + ln.map(function (x) {
        var craque = S.craque && S.craque[1] === x[1];
        return '<span class="sr-jog' + (craque ? ' sr-craque' : '') + '" title="' + esc(x[1] + ' (' + x[2] + ')' + (x[4] ? ': ' + x[4] : '')) + '">' + window.escudoTime(x[2], 'sr-escudo') +
          '<b>' + esc(sobrenome(x[1])) + '</b><small>' + esc(x[0]) + '</small></span>';
      }).join('') + '</div>';
    }).join('') + '</div>';
    var todos = [].concat.apply([], S.linhas.slice().reverse());
    var lista = '<ol class="sr-lista">' + todos.map(function (x) {
      return '<li' + (S.craque && S.craque[1] === x[1] ? ' class="sr-craque"' : '') + '><em>' + esc(x[0]) + '</em><span><b>' + esc(x[1]) + '</b><small>' + window.escudoTime(x[2]) + esc(x[2]) + '</small></span><i>' + esc(x[4] || 'Bom jogo') + '</i></li>';
    }).join('') + '</ol>';
    var sec = mostrar('sec-selecao', '<p class="dq-sub">Brasileirão · ' + (de === ate ? de : de + ' a ' + ate) + ' · ' + plural(S.jogos, 'jogo', 'jogos') + ' · ' + esc(S.formacao) +
      (S.craque ? ' · <b>Craque da rodada: ' + esc(S.craque[1]) + '</b> (' + esc(S.craque[4]) + ')' : '') + '</p>' +
      '<div class="sr-grade">' + campo + lista + '</div><p class="dq-nota">Escolhidos pelos números da ESPN: gols, assistências, chutes no gol, defesas, jogo sem sofrer gol e resultado.</p>');
  } else mostrar('sec-selecao', '');

  /* ---------- futebol: brasileiros na Europa ---------- */
  var BR = DF && DF.brasileiros;
  if (BR && (BR.semana.length || BR.temporada.length)) {
    var semana = BR.semana.map(function (x, i) {
      /* x: nome, time, campeonato, data, adversário, placar, gols, assistências, titular, amarelos, vermelhos, defesas, gols sofridos */
      var fez = [];
      if (x[6]) fez.push(x[6] === 1 ? '⚽ 1 gol' : '⚽ ' + x[6] + ' gols');
      if (x[7]) fez.push(plural(x[7], 'assistência', 'assistências'));
      if (x[12] > -1) fez.push(x[12] === 0 ? 'não sofreu gol' : plural(x[12], 'gol sofrido', 'gols sofridos'));
      if (x[10]) fez.push('expulso');
      if (!fez.length) fez.push(x[8] ? 'Titular' : 'Entrou no 2º tempo');
      var pl = String(x[5]).split(' x ');
      return '<li class="br-item' + (x[6] || x[7] ? ' br-decisivo' : '') + (i >= 8 ? ' dq-escondido' : '') + '"><span class="br-quem"><b>' + esc(x[0]) + '</b><small>' + window.escudoTime(x[1]) + esc(x[1]) + ' · ' + esc(x[2]) + '</small></span>' +
        '<span class="br-jogo">' + quando(x[3]) + ' · contra ' + esc(x[4]) + ' <em>(' + esc(pl[0]) + ' x ' + esc(pl[1] || '') + ')</em></span><span class="br-fez">' + fez.join(' · ') + '</span></li>';
    }).join('');
    var temporada = BR.temporada.map(function (x, i) {
      return '<tr' + (i >= 10 ? ' class="dq-escondido"' : '') + '><td>' + (i + 1) + '</td><td class="td-jogador"><b>' + esc(x[0]) + '</b></td><td class="ft-tab-time">' + window.escudoTime(x[1]) + esc(x[1]) + '</td><td>' + esc(x[2]) + '</td><td>' + x[3] + '</td><td><b>' + x[4] + '</b></td><td>' + x[5] + '</td></tr>';
    }).join('');
    var s2 = mostrar('sec-brasileiros', '<div class="dq-abas" role="tablist"><button type="button" role="tab" data-aba="semana" aria-selected="true">Na semana</button><button type="button" role="tab" data-aba="temporada" aria-selected="false">Na temporada</button></div>' +
      '<div data-painel="semana">' + (semana ? '<ul class="br-lista">' + semana + '</ul>' + (BR.semana.length > 8 ? '<p class="ft-centro"><button type="button" class="ft-btn ft-btn-linha dq-mais">Ver todos (' + BR.semana.length + ')</button></p>' : '') : '<p class="ft-vazio">Sem jogos de brasileiros nos últimos dias.</p>') + '</div>' +
      '<div data-painel="temporada" hidden><div class="ft-tab-wrap"><table class="ft-tab br-tab"><thead><tr><th>#</th><th>Jogador</th><th>Time</th><th>Liga</th><th title="Jogos">J</th><th>Gols</th><th title="Assistências">Assist.</th></tr></thead><tbody>' + temporada + '</tbody></table></div>' +
        (BR.temporada.length > 10 ? '<p class="ft-centro"><button type="button" class="ft-btn ft-btn-linha dq-mais">Ver mais</button></p>' : '') + '</div>' +
      '<p class="dq-nota">' + BR.total + ' brasileiros nos elencos das ligas da Europa. Contam os jogos da Champions, Liga Europa, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 e Liga Portugal.</p>');
    if (s2) { abas(s2); verMais(s2); }
  } else mostrar('sec-brasileiros', '');

  /* ---------- basquete ---------- */
  var NB = window.NBA_EXTRAS;
  var N = NB && NB.noite;
  if (N && N.jogos && N.jogos.length) {
    var D = N.destaque;
    mostrar('sec-noite', '<p class="dq-sub">' + (quando(N.d) === 'Ontem' ? 'Ontem' : quando(N.d)) + ' · ' + plural(N.jogos.length, 'jogo', 'jogos') + '</p>' +
      (D ? '<a class="nt-dest" href="partida.html?id=' + esc(D.id) + '"><small>Jogador da noite</small><b>' + esc(D.nome) + '</b><span>' + window.escudoTime(D.time) + esc(D.time) + '</span><em>' + esc(D.linha) + '</em><i>' + esc(D.jogo) + '</i></a>' : '') +
      '<div class="nt-grade">' + N.jogos.map(function (j) {
        var pl = j.p.split(' x '), vc = +pl[0] > +pl[1];
        return '<a class="nt-jogo" href="partida.html?id=' + esc(j.id) + '"><span class="nt-l' + (vc ? ' nt-venceu' : '') + '">' + window.escudoTime(j.casa) + '<b>' + esc(j.casa) + '</b><em>' + esc(pl[0]) + '</em></span>' +
          '<span class="nt-l' + (!vc ? ' nt-venceu' : '') + '">' + window.escudoTime(j.fora) + '<b>' + esc(j.fora) + '</b><em>' + esc(pl[1]) + '</em></span>' +
          '<span class="nt-cest">' + j.cestinhas.map(function (c) { return '<small><b>' + esc(sobrenome(c[0])) + '</b> ' + c[2] + ' pts, ' + c[3] + ' reb, ' + c[4] + ' ast</small>'; }).join('') + '</span><span class="nt-ver">Placar completo →</span></a>';
      }).join('') + '</div>');
  } else mostrar('sec-noite', '');

  var BRN = NB && NB.brasileiros;
  if (BRN && BRN.length) {
    mostrar('sec-br-nba', '<div class="bn-grade">' + BRN.map(function (b) {
      var m = b.media;
      return '<article class="bn-card"><header><b>' + esc(b.nome) + '</b><span>' + window.escudoTime(b.time) + esc(b.time) + (b.pos ? ' · ' + esc(b.pos) : '') + (b.cidade ? ' · de ' + esc(b.cidade) : '') + '</span></header>' +
        (m ? '<dl class="bn-media"><div><dt>Pontos</dt><dd>' + String(m[2]).replace('.', ',') + '</dd></div><div><dt>Rebotes</dt><dd>' + String(m[3]).replace('.', ',') + '</dd></div><div><dt>Assist.</dt><dd>' + String(m[4]).replace('.', ',') + '</dd></div><div><dt>Minutos</dt><dd>' + String(m[1]).replace('.', ',') + '</dd></div></dl>' +
          '<p class="bn-temp">Média por jogo na temporada ' + esc(b.temporada) + ' · ' + plural(m[0], 'jogo', 'jogos') + '</p>' : '<p class="bn-temp">Ainda sem jogos na temporada.</p>') +
        (b.ultimos && b.ultimos.length ? '<ul class="bn-ult">' + b.ultimos.map(function (u) {
          return '<li><span>' + quando(u[0]) + ' · contra ' + esc(u[1]) + '</span><b>' + u[4] + ' pts · ' + u[5] + ' reb · ' + u[6] + ' ast</b><small>' + esc(u[3]) + ' min' + (u[7] ? ', titular' : '') + '</small></li>';
        }).join('') + '</ul>' : '') + '</article>';
    }).join('') + '</div>');
  } else mostrar('sec-br-nba', '');

  var LS = NB && NB.lesoes;
  if (LS && LS.length) {
    var SIT = { Fora: 'ls-fora', 'Fora da temporada': 'ls-fora', Suspenso: 'ls-fora', 'Dúvida': 'ls-duvida', 'Improvável': 'ls-fora', 'Provável': 'ls-ok' };
    function volta(d) { if (!d) return ''; var p = d.split('-'); return 'volta prevista ' + p[2] + '/' + p[1]; }
    var total = LS.reduce(function (s, t) { return s + t.jogadores.length; }, 0);
    var s3 = mostrar('sec-lesoes', '<div class="ls-filtro"><label for="ls-time">Time</label><select id="ls-time"><option value="">Todos os times (' + total + ' jogadores)</option>' +
      LS.map(function (t, i) { return '<option value="' + i + '">' + esc(t.time) + ' (' + t.jogadores.length + ')</option>'; }).join('') + '</select></div>' +
      '<div class="ls-grade">' + LS.map(function (t, i) {
        return '<section class="ls-time' + (i >= 6 ? ' dq-escondido' : '') + '" data-i="' + i + '"><h3>' + window.escudoTime(t.time) + esc(t.time) + '</h3><ul>' + t.jogadores.map(function (x) {
          return '<li><span class="ls-sit ' + (SIT[x[2]] || 'ls-duvida') + '">' + esc(x[2]) + '</span><b>' + esc(x[0]) + '</b><small>' + esc(x[3]) + (x[4] ? ' · ' + volta(x[4]) : '') + '</small></li>';
        }).join('') + '</ul></section>';
      }).join('') + '</div>' + (LS.length > 6 ? '<p class="ft-centro"><button type="button" class="ft-btn ft-btn-linha dq-mais">Ver todos os times (' + LS.length + ')</button></p>' : '') + '<p class="dq-nota">Situação de cada jogador pelo relatório de lesões da ESPN. Fora: não joga; Dúvida: decide na hora do jogo.</p>');
    if (s3) {
      verMais(s3);
      s3.querySelector('#ls-time').addEventListener('change', function () {
        var v = this.value, mais = s3.querySelector('.dq-mais');
        if (v !== '' && mais) { mais.parentNode.remove(); }
        [].forEach.call(s3.querySelectorAll('.ls-time'), function (x) { x.classList.remove('dq-escondido'); x.hidden = v !== '' && x.getAttribute('data-i') !== v; });
      });
    }
  } else mostrar('sec-lesoes', '');

  /* atalho para uma seção que ficou escondida (sem dados) some da faixa */
  [].forEach.call(document.querySelectorAll('.f1-atalhos a[href^="#"]'), function (a) {
    var alvo = document.getElementById(a.getAttribute('href').slice(1));
    if (!alvo || alvo.hidden) a.hidden = true;
  });
})();
