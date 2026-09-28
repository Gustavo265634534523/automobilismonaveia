/* Bolão entre membros (plano Master): palpite do pódio de cada corrida da F1 e ranking da temporada.
   Pontos: 5 por piloto na posição certa, 2 se ele subir no pódio em outra posição, +3 se acertar o pódio inteiro na ordem.
   Resultados: assets/dados/duelo-f1.js (OpenF1), atualizado sozinho depois de cada corrida.
   Por enquanto os palpites ficam só no navegador (teste). Quando o login estiver no ar, vão para o servidor e o ranking junta todos os membros. */
(function () {
  var esc = window.esc;
  var caixa = document.getElementById('bolao');
  var local = !!window.NAVEIA_TESTE;
  var f1 = window.CATEGORIAS.filter(function (c) { return c.slug === 'formula-1'; })[0];
  var CHAVE = 'naveia-bolao-f1-2026';

  function lerPalpites() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function guardarPalpites(p) { try { localStorage.setItem(CHAVE, JSON.stringify(p)); } catch (e) {} }

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

  function desenhar() {
    var palpites = lerPalpites(), agora = Date.now();
    var pilotos = f1.classificacao.linhas.map(function (l) { return l[1]; });
    var proxima = f1.calendario.filter(function (e) { var i = inicioCorrida(e); return !e.venc && i && i.t > agora; })[0];
    var h = '';

    /* 1. Palpite da próxima corrida */
    if (proxima) {
      var ini = inicioCorrida(proxima), meu = palpites[proxima.e] || ['', '', ''];
      h += '<section class="bl-bloco bl-palpite"><p class="bl-rot">Próxima corrida</p><h2>' + esc(proxima.n) + '</h2>' +
        '<p class="bl-info">' + esc(proxima.l) + ' · Largada ' + esc(ini.txt) + ' (horário de Brasília). Os palpites fecham na largada.</p>' +
        '<form class="bl-form" id="bl-form">' + ['1º lugar', '2º lugar', '3º lugar'].map(function (rot, i) {
          return '<label class="bl-campo bl-campo-' + (i + 1) + '"><span>' + rot + '</span><select name="p' + i + '" required><option value="">Escolha</option>' +
            pilotos.map(function (n) { return '<option' + (meu[i] === n ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select></label>';
        }).join('') +
        '<button class="pl-botao" type="submit">' + (palpites[proxima.e] ? 'Trocar palpite' : 'Salvar palpite') + '</button></form>' +
        '<p class="bl-aviso" id="bl-aviso">' + (palpites[proxima.e] ? 'Palpite salvo. Você pode trocar até a largada.' : '') + '</p></section>';
    } else {
      h += '<section class="bl-bloco"><p class="bl-rot">Próxima corrida</p><p class="bl-info">A temporada acabou. O bolão volta na primeira corrida do ano que vem.</p></section>';
    }

    /* 2. Seus palpites e pontos */
    var meus = f1.calendario.filter(function (e) { return palpites[e.e] && (!proxima || e.e !== proxima.e); }), total = 0;
    var linhas = meus.map(function (e) {
      var res = resultado(e), p = res ? pontos(palpites[e.e], res) : null;
      if (p) total += p.pts;
      return '<tr><th scope="row">' + esc(e.n) + '</th><td>' + palpites[e.e].map(esc).join(', ') + '</td>' +
        '<td>' + (p ? p.podio.map(function (n) { return esc(n || '—'); }).join(', ') : 'Aguardando resultado') + '</td>' +
        '<td class="bl-pts">' + (p ? p.pts : '—') + '</td></tr>';
    }).join('');
    h += '<section class="bl-bloco"><h2 class="bl-sub">Seus palpites</h2>' + (meus.length
      ? '<div class="dl-rolar"><table class="bl-tabela"><thead><tr><th scope="col">Corrida</th><th scope="col">Seu pódio</th><th scope="col">Pódio real</th><th scope="col">Pontos</th></tr></thead><tbody>' + linhas + '</tbody></table></div>'
      : '<p class="bl-info">Você ainda não tem palpites em corridas que já aconteceram. Faça o primeiro acima.</p>') + '</section>';

    /* 3. Ranking da temporada */
    var ranking = [{ nome: 'Você', pts: total, eu: true }];
    if (local) ranking = ranking.concat([
      { nome: 'Membro de exemplo 1', pts: 38 }, { nome: 'Membro de exemplo 2', pts: 31 },
      { nome: 'Membro de exemplo 3', pts: 24 }, { nome: 'Membro de exemplo 4', pts: 12 }]);
    ranking.sort(function (x, y) { return y.pts - x.pts; });
    h += '<section class="bl-bloco"><h2 class="bl-sub">Ranking da temporada</h2><ol class="bl-ranking">' +
      ranking.map(function (r, i) { return '<li class="' + (r.eu ? 'bl-eu' : '') + '"><b>' + (i + 1) + 'º</b><span>' + esc(r.nome) + '</span><em>' + r.pts + ' pts</em></li>'; }).join('') + '</ol>' +
      (local ? '<p class="bl-nota">Teste no seu computador: os "membros de exemplo" são só para você ver como o ranking fica. Quando o login estiver no ar, aparecem aqui os membros de verdade.</p>' : '') + '</section>';

    caixa.innerHTML = h;
    var form = document.getElementById('bl-form');
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var esc3 = [form.p0.value, form.p1.value, form.p2.value], aviso = document.getElementById('bl-aviso');
      if (esc3[0] === esc3[1] || esc3[0] === esc3[2] || esc3[1] === esc3[2]) { aviso.textContent = 'Escolha três pilotos diferentes.'; return; }
      if (Date.now() >= inicioCorrida(proxima).t) { aviso.textContent = 'A corrida já começou. Os palpites fecharam.'; return; }
      palpites[proxima.e] = esc3; guardarPalpites(palpites); desenhar();
    });
  }

  /* Só para o plano Master (no computador, só com ?teste=1) */
  function trava(titulo, texto, botoes) {
    caixa.innerHTML = '<div class="sm-trava"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="sm-trava-acoes">' + botoes + '</div></div>';
  }
  caixa.innerHTML = '<p class="nota">Carregando…</p>';
  window.NAVEIA_EU.then(function (r) {
    if (r.semServidor && !local && window.NAVEIA_PC) r = { logado: false };
    if (r.semServidor) {
      if (!local) return trava('Bolão indisponível agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="bolao.html">Tentar de novo</a>');
    } else if (!r.logado) {
      return trava('Exclusivo do plano Master', 'Entre na sua conta para participar do bolão. Se ainda não assina, conheça o Master.', '<a class="pl-botao" href="entrar.html?volta=bolao.html">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
    } else if (r.usuario.plano !== 'master') {
      return trava('Exclusivo do plano Master', 'Seu plano atual não inclui o bolão. Mude para o Master e dispute o ranking com os outros membros.', '<a class="pl-botao" href="planos.html">Conhecer o Master</a>');
    }
    desenhar();
  });
})();
