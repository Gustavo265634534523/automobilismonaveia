/* Página de jogos do futebol, do basquete e da F1 (jogos-esportes.html#futebol, #basquete ou #f1): os jogos de cada
   esporte, com o aviso de quem já fez o desafio do dia neste aparelho. Os de futebol e basquete usam
   assets/js/jogos-base.js; os da F1 ficam em jogos.html. */
(function () {
  var caixa = document.getElementById('je'), JB = window.JOGOS_BASE;
  if (!caixa || !JB) return;
  var esc = window.esc, esporte = /f1/.test(location.hash) ? 'f1' : JB.esporteDaPagina();
  var IC = {
    adivinhe: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
    grade: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>',
    mais: '<path d="M7 14l5-5 5 5"/><path d="M7 20l5-5 5 5" opacity=".45"/><path d="M4 4h16"/>',
    escudo: '<path d="M12 3l8 3v6c0 4.5-3.3 8-8 9-4.7-1-8-4.5-8-9V6z"/><path d="M9 12h6M12 9v6"/>',
    quadra: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6a9 9 0 0 1 0 12.8M18.4 5.6a9 9 0 0 0 0 12.8"/>',
    campo: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.5"/><path d="M3 9.5h2.5v5H3M21 9.5h-2.5v5H21"/>',
    monte: '<path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
    corrida: '<path d="M3 15.5l1.8-4.8A2 2 0 0 1 6.7 9.4h9.1a2 2 0 0 1 1.6.8l2.6 3.3H21v2H3z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    largada: '<circle cx="5" cy="12" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="20" cy="12" r="2"/>',
    circuito: '<path d="M5 18c-2-3 0-7 3-7h4c2 0 2-3 0-4s-1-3 2-3 6 2 5 6-3 4-5 5-1 3 1 4-1 3-4 2-4-1-6-3z"/>',
    piloto: '<path d="M4 13a8 8 0 0 1 16 0v3H4z"/><path d="M4 13h10l2 3"/>'
  };
  /* [ícone, página, nome, o que é, chave do desafio do dia no aparelho] */
  var JOGOS = [
    ['adivinhe', 'adivinhe.html', 'Adivinhe o jogador', 'Aparecem todos os clubes por onde ele passou. Em 5 tentativas, quem é?', 'arena-adivinhe'],
    ['grade', 'grade.html', 'Grade', 'Um quadro 3x3 de times. Em cada casa, um jogador que passou pelos dois.', 'arena-grade'],
    ['mais', 'mais-ou-menos.html', 'Mais ou menos', 'Quem tem mais gols, pontos ou assistências? Acerte o máximo em sequência.', ''],
    ['escudo', 'escudo-misterioso.html', 'Escudo misterioso', 'O escudo aparece borrado e vai ficando nítido. Que time é?', 'arena-escudo'],
    ['campo', 'futebol-1x1.html', 'Futebol 1x1', 'Cabeção contra o computador em 2 minutos: chute, cabeceie e faça gols.', '', 'futebol'],
    ['quadra', 'basquete-1x1.html', 'Basquete 1x1', 'Você contra o computador em 2 minutos: arremesse, roube e dê o toco.', '', 'basquete'],
    ['monte', 'monte-seu-time.html', 'Monte seu time', 'Seu time dos sonhos contra o do adversário, com os jogadores de hoje.', '', 'futebol'],
    /* os da F1 (jogos.html) */
    ['corrida', 'jogos.html#corrida', 'Fan Zone Racing', 'Pilote um F1 em 3D contra 11 adversários.', '', 'f1'],
    ['largada', 'jogos.html#largada', 'Largada', 'As cinco luzes apagam. Qual é o seu tempo de reação?', '', 'f1'],
    ['circuito', 'jogos.html#circuito', 'Adivinhe o circuito', 'Só o desenho da pista. Você reconhece?', '', 'f1'],
    ['piloto', 'jogos.html#piloto', 'Piloto misterioso', 'Dica por dica, descubra quem é o piloto.', '', 'f1']
  ];
  function pintar() {
    var lista = JOGOS.filter(function (j) { return esporte === 'f1' ? j[5] === 'f1' : !j[5] || j[5] === esporte; });
    var sub = document.querySelector('.mn-sub');
    if (sub) sub.textContent = esporte === 'f1' ? 'Pilote em 3D, teste seu reflexo na largada e mostre que conhece as pistas e os pilotos.' : 'Para jogar e mostrar que entende de ' + (esporte === 'basquete' ? 'NBA' : 'futebol') + '. Tem desafio novo todo dia.';
    caixa.innerHTML = JB.abasEsporte(esporte, 'aqui') +
      '<div class="je-grade">' + lista.map(function (j, i) {
        var G = j[4] ? JB.ler(j[4], null) : null, feito = G && G.dia && G.dia[JB.hoje + ':' + esporte];
        var status = !j[4] ? '' : feito ? '<span class="je-feito">✓ Desafio de hoje feito</span>' : '<span class="je-novo">Desafio de hoje disponível</span>';
        var href = j[1] + (j[0] === 'monte' || j[5] === 'f1' ? '' : '#' + esporte);
        return '<a class="je-card' + (i === 0 ? ' je-dest' : '') + '" href="' + href + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC[j[0]] + '</svg><b>' + esc(j[2]) + '</b><small>' + esc(j[3]) + '</small>' + status + '<i>Jogar</i></a>';
      }).join('') + '</div><p class="dq-nota">Grátis e sem cadastro. Seus resultados e recordes ficam guardados neste aparelho.</p>';
    [].forEach.call(caixa.querySelectorAll('.jb-esportes button'), function (b) {
      b.addEventListener('click', function () { history.replaceState(null, '', '#' + b.getAttribute('data-e')); location.reload(); });
    });
  }
  pintar();
})();
