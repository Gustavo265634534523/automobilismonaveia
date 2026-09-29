/* Bolão entre membros (plano Master): palpite do pódio de cada corrida da F1 e ranking da temporada.
   Pontos: 5 por piloto na posição certa, 2 se ele subir no pódio em outra posição, +3 se acertar o pódio inteiro na ordem.
   Os palpites ficam no servidor de contas (ações bolao_palpite e bolao_ranking), e o ranking junta todos os membros.
   Resultados: assets/dados/duelo-f1.js (OpenF1), atualizado sozinho depois de cada corrida.
   Palpite salvo depois da largada não conta (a hora do palpite vem do servidor). */
(function () {
  var esc = window.esc;
  var caixa = document.getElementById('bolao');
  var f1 = window.CATEGORIAS.filter(function (c) { return c.slug === 'formula-1'; })[0];
  var membros = [];

  function chave(e) { return 'formula-1:' + e.e; }
  function pontos(palpite, pos) {
    var podio = [null, null, null];
    Object.keys(pos).forEach(function (n) { if (pos[n] >= 1 && pos[n] <= 3) podio[pos[n] - 1] = n; });
    var tot = 0, certos = 0;
    palpite.forEach(function (n, i) {
      if (podio[i] === n) { tot += 5; certos++; } else if (podio.indexOf(n) > -1) tot += 2;
    });
    if (certos === 3) tot += 3;
    return { pts: tot, podio: podio };
  }
  function resultado(etapa) {
    var d = window.DUELO_F1 ? window.DUELO_F1.etapas.filter(function (x) { return x.n === etapa.n; })[0] : null;
    return d ? d.corrida : null;
  }
  function inicioCorrida(e) {
    var s = (e.s || []).filter(function (x) { return x.t === 'Corrida'; })[0];
    return s ? { t: new Date(s.d + 'T' + s.h + ':00-03:00').getTime(), txt: s.d.split('-').reverse().slice(0, 2).join('/') + ', ' + s.h.replace(':', 'h') }
      : e.d ? { t: new Date(e.d + 'T00:00:00-03:00').getTime(), txt: e.d.split('-').reverse().slice(0, 2).join('/') } : null;
  }
  /* pontos de um membro na temporada: só palpites feitos antes da largada, em corridas com resultado */
  function pontosDe(m) {
    var tot = 0, feitas = 0;
    f1.calendario.forEach(function (e) {
      var pal = m.palpites[chave(e)], res = resultado(e), ini = inicioCorrida(e);
      if (!pal || !res || !ini || Date.parse(pal.em) >= ini.t) return;
      tot += pontos(pal.p, res).pts; feitas++;
    });
    return { pts: tot, corridas: feitas };
  }

  function desenhar() {
    var agora = Date.now();
    var eu = membros.filter(function (m) { return m.eu; })[0] || { palpites: {} };
    var pilotos = f1.classificacao.linhas.map(function (l) { return l[1]; });
    var proxima = f1.calendario.filter(function (e) { var i = inicioCorrida(e); return !e.venc && i && i.t > agora; })[0];
    var h = '';

    /* 1. Palpite da próxima corrida */
    if (proxima) {
      var ini = inicioCorrida(proxima), salvo = eu.palpites[chave(proxima)], meu = salvo ? salvo.p : ['', '', ''];
      h += '<section class="bl-bloco bl-palpite"><p class="bl-rot">Próxima corrida</p><h2>' + esc(proxima.n) + '</h2>' +
        '<p class="bl-info">' + esc(proxima.l) + ' · Largada ' + esc(ini.txt) + ' (horário de Brasília). Os palpites fecham na largada.</p>' +
        '<form class="bl-form" id="bl-form">' + ['1º lugar', '2º lugar', '3º lugar'].map(function (rot, i) {
          return '<label class="bl-campo bl-campo-' + (i + 1) + '"><span>' + rot + '</span><select name="p' + i + '" required><option value="">Escolha</option>' +
            pilotos.map(function (n) { return '<option' + (meu[i] === n ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select></label>';
        }).join('') +
        '<button class="pl-botao" type="submit">' + (salvo ? 'Trocar palpite' : 'Salvar palpite') + '</button></form>' +
        '<p class="bl-aviso" id="bl-aviso">' + (salvo ? 'Palpite salvo. Você pode trocar até a largada.' : '') + '</p></section>';
    } else {
      h += '<section class="bl-bloco"><p class="bl-rot">Próxima corrida</p><p class="bl-info">A temporada acabou. O bolão volta na primeira corrida do ano que vem.</p></section>';
    }

    /* 2. Seus palpites e pontos */
    var meus = f1.calendario.filter(function (e) { return eu.palpites[chave(e)] && (!proxima || e.e !== proxima.e); });
    var linhas = meus.map(function (e) {
      var pal = eu.palpites[chave(e)], res = resultado(e), ini = inicioCorrida(e);
      var tarde = ini && Date.parse(pal.em) >= ini.t, p = res && !tarde ? pontos(pal.p, res) : null;
      return '<tr><th scope="row">' + esc(e.n) + '</th><td>' + pal.p.map(esc).join(', ') + '</td>' +
        '<td>' + (tarde ? 'Feito depois da largada' : p ? p.podio.map(function (n) { return esc(n || '—'); }).join(', ') : 'Aguardando resultado') + '</td>' +
        '<td class="bl-pts">' + (p ? p.pts : '—') + '</td></tr>';
    }).join('');
    h += '<section class="bl-bloco"><h2 class="bl-sub">Seus palpites</h2>' + (meus.length
      ? '<div class="bl-rolar"><table class="bl-tabela"><thead><tr><th scope="col">Corrida</th><th scope="col">Seu pódio</th><th scope="col">Pódio real</th><th scope="col">Pontos</th></tr></thead><tbody>' + linhas + '</tbody></table></div>'
      : '<p class="bl-info">Você ainda não tem palpites em corridas que já aconteceram. Faça o primeiro acima.</p>') + '</section>';

    /* 3. Ranking da temporada: todos os membros que palpitaram */
    var ranking = membros.map(function (m) { var r = pontosDe(m); return { nome: m.eu ? m.nome + ' (você)' : m.nome, foto: m.foto, pts: r.pts, corridas: r.corridas, eu: m.eu }; });
    if (!ranking.some(function (r) { return r.eu; })) ranking.push({ nome: 'Você', pts: 0, corridas: 0, eu: true });
    ranking.sort(function (x, y) { return y.pts - x.pts || y.corridas - x.corridas; });
    h += '<section class="bl-bloco"><h2 class="bl-sub">Ranking da temporada</h2><p class="bl-info bl-total">' + membros.length + ' ' + (membros.length === 1 ? 'membro participando' : 'membros participando') + '</p><ol class="bl-ranking">' +
      ranking.map(function (r, i) {
        return '<li class="' + (r.eu ? 'bl-eu' : '') + '"><b>' + (i + 1) + 'º</b><span class="bl-quem">' +
          (r.foto ? '<img src="' + r.foto + '" alt="">' : '<i>' + esc(r.nome.charAt(0).toUpperCase()) + '</i>') + esc(r.nome) + '</span><em>' + r.pts + ' pts</em></li>';
      }).join('') + '</ol></section>';

    caixa.innerHTML = h;
    var form = document.getElementById('bl-form');
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var p = [form.p0.value, form.p1.value, form.p2.value], aviso = document.getElementById('bl-aviso'), bt = form.querySelector('button');
      if (!p[0] || !p[1] || !p[2]) { aviso.textContent = 'Escolha os três pilotos.'; return; }
      if (p[0] === p[1] || p[0] === p[2] || p[1] === p[2]) { aviso.textContent = 'Escolha três pilotos diferentes.'; return; }
      bt.disabled = true; aviso.textContent = 'Salvando…';
      window.NAVEIA_API('bolao_palpite', { etapa: chave(proxima), p: p, largada: new Date(inicioCorrida(proxima).t).toISOString() }).then(function (r) {
        bt.disabled = false;
        if (!r.ok) { aviso.textContent = r.erro; return; }
        carregar();
      }).catch(function () { bt.disabled = false; aviso.textContent = 'Não foi possível salvar. Tente de novo.'; });
    });
  }

  function carregar() {
    window.NAVEIA_API('bolao_ranking').then(function (r) {
      if (!r || !r.ok) throw new Error(r && r.erro);
      membros = r.membros || []; desenhar();
    }).catch(function () { caixa.innerHTML = '<p class="bl-info">Não foi possível carregar o bolão agora. Tente de novo em alguns minutos.</p>'; });
  }

  /* Só para o plano Master */
  function trava(titulo, texto, botoes) {
    caixa.innerHTML = '<div class="sm-trava"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="sm-trava-acoes">' + botoes + '</div></div>';
  }
  caixa.innerHTML = '<p class="nota">Carregando…</p>';
  window.NAVEIA_EU.then(function (r) {
    if (r.semServidor) return trava('Bolão indisponível agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="bolao.html">Tentar de novo</a>');
    if (!r.logado) return trava('Exclusivo do plano Master', 'Entre na sua conta para participar do bolão. Se ainda não assina, conheça o Master.', '<a class="pl-botao" href="entrar.html?volta=bolao.html">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
    if (r.usuario.plano !== 'master') return trava('Exclusivo do plano Master', 'Seu plano atual não inclui o bolão. Mude para o Master e dispute o ranking com os outros membros.', '<a class="pl-botao" href="planos.html">Conhecer o Master</a>');
    carregar();
  });
})();
