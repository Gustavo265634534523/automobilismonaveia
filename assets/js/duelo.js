/* Duelo de pilotos (plano Master): dois pilotos lado a lado na temporada.
   Todas as categorias: posição, pontos e vitórias (de dados.js).
   Fórmula 1: também pódios, poles, abandonos e quem chegou na frente em cada corrida (assets/dados/duelo-f1.js, do OpenF1). */
(function () {
  var esc = window.esc;
  var caixa = document.getElementById('duelo'), abas = document.getElementById('dl-cats');
  var local = !!window.NAVEIA_TESTE;
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  var CATS = window.CATEGORIAS.filter(function (c) {
    return c.classificacao && c.classificacao.linhas.length >= 2 && c.classificacao.colunas.indexOf('Pts') > -1;
  });
  var cat = null, a = null, b = null;

  function pilotos(c) {
    var col = c.classificacao.colunas, iP = col.indexOf('Pts'), iE = col.indexOf('Equipe') > -1 ? col.indexOf('Equipe') : col.indexOf('Carro');
    return c.classificacao.linhas.map(function (l) {
      var pts = parseFloat(String(l[iP]).replace(',', '.'));
      return { nome: l[1], pos: l[0], equipe: iE > -1 ? l[iE] : '', pts: isNaN(pts) ? null : pts, ptsTxt: l[iP] };
    });
  }
  function vitorias(c, nome) {
    var n = norm(nome), lista = [];
    c.calendario.forEach(function (e) { if (e.venc && norm(e.venc).indexOf(n) > -1) lista.push(e.n); });
    return lista;
  }

  /* números da F1 a partir das posições de cada sessão */
  function numerosF1(nome) {
    var r = { podios: 0, poles: 0, nc: 0, soma: 0, cont: 0, melhor: null, corridas: 0 };
    (window.DUELO_F1 ? window.DUELO_F1.etapas : []).forEach(function (e) {
      var p = e.corrida[nome];
      if (p != null) {
        r.corridas++;
        if (typeof p === 'number') { r.soma += p; r.cont++; if (p <= 3) r.podios++; if (r.melhor === null || p < r.melhor) r.melhor = p; } else r.nc++;
      }
      if (e.quali && e.quali[nome] === 1) r.poles++;
    });
    r.media = r.cont ? r.soma / r.cont : null;
    return r;
  }
  function frente(nomeA, nomeB, campo) {
    var x = 0, y = 0;
    (window.DUELO_F1 ? window.DUELO_F1.etapas : []).forEach(function (e) {
      var s = e[campo]; if (!s) return;
      var pa = s[nomeA], pb = s[nomeB];
      if (pa == null || pb == null) return;
      var na = typeof pa === 'number' ? pa : 99, nb = typeof pb === 'number' ? pb : 99;
      if (na < nb) x++; else if (nb < na) y++;
    });
    return [x, y];
  }

  function linha(rot, va, vb, menorMelhor, txtA, txtB) {
    var ga = va != null && vb != null && (menorMelhor ? va < vb : va > vb);
    var gb = va != null && vb != null && (menorMelhor ? vb < va : vb > va);
    var tot = (va || 0) + (vb || 0), pa = 50;
    if (!menorMelhor && tot > 0) pa = Math.round((va || 0) / tot * 100);
    if (menorMelhor && va != null && vb != null) pa = Math.round(vb / (va + vb) * 100);
    return '<div class="dl-linha"><span class="dl-v dl-va' + (ga ? ' dl-ganha' : '') + '">' + esc(txtA != null ? txtA : (va == null ? '—' : va)) + '</span>' +
      '<div class="dl-meio"><span class="dl-rot">' + esc(rot) + '</span><span class="dl-barra"><i style="width:' + pa + '%"></i></span></div>' +
      '<span class="dl-v dl-vb' + (gb ? ' dl-ganha' : '') + '">' + esc(txtB != null ? txtB : (vb == null ? '—' : vb)) + '</span></div>';
  }
  function fmtPos(p) { return p == null ? '—' : typeof p === 'number' ? p + 'º' : p; }

  function seletor(id, lista, atual) {
    return '<select id="' + id + '" class="dl-sel">' + lista.map(function (p) {
      return '<option value="' + esc(p.nome) + '"' + (p.nome === atual ? ' selected' : '') + '>' + esc(p.pos + 'º ' + p.nome) + '</option>';
    }).join('') + '</select>';
  }

  function desenhar() {
    var lista = pilotos(cat);
    var A = lista.filter(function (p) { return p.nome === a; })[0], B = lista.filter(function (p) { return p.nome === b; })[0];
    var wa = vitorias(cat, a), wb = vitorias(cat, b);
    var h = '<div class="dl-escolha"><label class="dl-lado dl-lado-a"><span>Piloto 1</span>' + seletor('dl-a', lista, a) + '</label>' +
      '<span class="dl-x" aria-hidden="true">×</span>' +
      '<label class="dl-lado dl-lado-b"><span>Piloto 2</span>' + seletor('dl-b', lista, b) + '</label></div>';

    h += '<div class="dl-cartoes">' + [A, B].map(function (p, i) {
      return '<div class="dl-cartao dl-cartao-' + (i ? 'b' : 'a') + '"><b class="dl-pos">' + esc(p.pos) + 'º</b><h2>' + esc(p.nome) + '</h2>' +
        '<p>' + esc(p.equipe) + (p.ptsTxt ? ' · ' + esc(p.ptsTxt) + (p.pts != null ? ' pontos' : '') : '') + '</p></div>';
    }).join('') + '</div>';

    if (A.pts != null && B.pts != null && A !== B) {
      var dif = Math.abs(A.pts - B.pts), lider = A.pts >= B.pts ? A : B;
      h += '<p class="dl-resumo">' + (dif === 0 ? 'Empatados em pontos.' : '<b>' + esc(lider.nome) + '</b> está ' + dif + ' pontos à frente.') + '</p>';
    }

    h += '<div class="dl-tabela">';
    h += linha('Posição no campeonato', parseInt(A.pos, 10), parseInt(B.pos, 10), true, A.pos + 'º', B.pos + 'º');
    if (A.pts != null) h += linha('Pontos', A.pts, B.pts, false);
    h += linha('Vitórias', wa.length, wb.length, false);

    var f1 = cat.slug === 'formula-1' && window.DUELO_F1;
    if (f1) {
      var na = numerosF1(a), nb = numerosF1(b), fc = frente(a, b, 'corrida'), fq = frente(a, b, 'quali');
      h += linha('Pódios', na.podios, nb.podios, false);
      h += linha('Poles', na.poles, nb.poles, false);
      h += linha('Na frente nas corridas', fc[0], fc[1], false);
      h += linha('Na frente nas classificações', fq[0], fq[1], false);
      h += linha('Chegada média', na.media, nb.media, true, na.media ? na.media.toFixed(1) + 'º' : '—', nb.media ? nb.media.toFixed(1) + 'º' : '—');
      h += linha('Melhor resultado', na.melhor, nb.melhor, true, fmtPos(na.melhor), fmtPos(nb.melhor));
      h += linha('Abandonos', na.nc, nb.nc, true);
    }
    h += '</div>';

    if (wa.length || wb.length) {
      h += '<div class="dl-vits">' + [[a, wa], [b, wb]].map(function (x, i) {
        return '<div class="dl-vit dl-vit-' + (i ? 'b' : 'a') + '"><h3>Vitórias de ' + esc(x[0]) + '</h3>' +
          (x[1].length ? '<ul>' + x[1].map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '<p>Nenhuma ainda.</p>') + '</div>';
      }).join('') + '</div>';
    }

    if (f1) {
      h += '<h3 class="dl-sub">Corrida a corrida</h3><div class="dl-rolar"><table class="dl-corridas"><thead><tr><th scope="col">Etapa</th><th scope="col">Largada</th><th scope="col">' + esc(a) + '</th><th scope="col">' + esc(b) + '</th></tr></thead><tbody>' +
        window.DUELO_F1.etapas.map(function (e) {
          var pa = e.corrida[a], pb = e.corrida[b], qa = e.quali ? e.quali[a] : null, qb = e.quali ? e.quali[b] : null;
          var na2 = typeof pa === 'number' ? pa : 99, nb2 = typeof pb === 'number' ? pb : 99;
          return '<tr><th scope="row">' + esc(e.n) + '</th><td class="dl-q">' + fmtPos(qa) + ' × ' + fmtPos(qb) + '</td>' +
            '<td class="' + (pa != null && na2 < nb2 ? 'dl-ganha dl-td-a' : '') + '">' + fmtPos(pa) + '</td>' +
            '<td class="' + (pb != null && nb2 < na2 ? 'dl-ganha dl-td-b' : '') + '">' + fmtPos(pb) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<p class="dl-nota">Largada = posição na classificação. NC = não completou, NL = não largou. Dados do OpenF1, atualizados sozinhos depois de cada corrida.</p>';
    } else {
      h += '<p class="dl-nota">Nesta categoria o duelo compara posição, pontos e vitórias. Pódios, poles e corrida a corrida estão disponíveis na Fórmula 1.</p>';
    }
    caixa.innerHTML = h;
  }

  function abrir(slug) {
    cat = CATS.filter(function (c) { return c.slug === slug; })[0] || CATS[0];
    var l = pilotos(cat); a = l[0].nome; b = l[1].nome;
    abas.querySelectorAll('.sm-cat').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-cat') === cat.slug ? 'true' : 'false'); });
    desenhar();
  }

  function comecar() {
    abas.hidden = false;
    abas.innerHTML = CATS.map(function (c) { return '<button type="button" class="sm-cat" data-cat="' + c.slug + '" aria-pressed="false">' + esc(c.nome) + '</button>'; }).join('');
    abas.addEventListener('click', function (e) { var x = e.target.closest('.sm-cat'); if (x) abrir(x.getAttribute('data-cat')); });
    caixa.addEventListener('change', function (e) {
      if (e.target.id === 'dl-a') a = e.target.value;
      if (e.target.id === 'dl-b') b = e.target.value;
      desenhar();
    });
    abrir('formula-1');
  }

  /* Só para o plano Master */
  function trava(titulo, texto, botoes) {
    caixa.innerHTML = '<div class="sm-trava"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="sm-trava-acoes">' + botoes + '</div></div>';
  }
  abas.hidden = true;
  caixa.innerHTML = '<p class="nota">Carregando…</p>';
  window.NAVEIA_EU.then(function (r) {
    if (r.semServidor && !local && window.NAVEIA_PC) r = { logado: false };
    if (r.semServidor) {
      if (!local) return trava('Duelo indisponível agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="duelo.html">Tentar de novo</a>');
    } else if (!r.logado) {
      return trava('Exclusivo do plano Master', 'Entre na sua conta para ver o duelo de pilotos. Se ainda não assina, conheça o Master.', '<a class="pl-botao" href="entrar.html?volta=duelo.html">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
    } else if (r.usuario.plano !== 'master') {
      return trava('Exclusivo do plano Master', 'Seu plano atual não inclui o duelo de pilotos. Mude para o Master e compare quem você quiser.', '<a class="pl-botao" href="planos.html">Conhecer o Master</a>');
    }
    comecar();
  });
})();
