/* Página de jogos do futebol e do basquete (jogos-esportes.html#futebol ou #basquete): os jogos de cada esporte,
   com o aviso de quem já fez o desafio do dia neste aparelho. Os jogos usam assets/js/jogos-base.js. */
(function () {
  var caixa = document.getElementById('je'), JB = window.JOGOS_BASE;
  if (!caixa || !JB) return;
  var esc = window.esc, esporte = JB.esporteDaPagina();
  var IC = {
    adivinhe: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
    grade: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>',
    mais: '<path d="M7 14l5-5 5 5"/><path d="M7 20l5-5 5 5" opacity=".45"/><path d="M4 4h16"/>',
    escudo: '<path d="M12 3l8 3v6c0 4.5-3.3 8-8 9-4.7-1-8-4.5-8-9V6z"/><path d="M9 12h6M12 9v6"/>',
    monte: '<path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>'
  };
  /* [ícone, página, nome, o que é, chave do desafio do dia no aparelho] */
  var JOGOS = [
    ['adivinhe', 'adivinhe.html', 'Adivinhe o jogador', 'Aparecem todos os clubes por onde ele passou. Em 5 tentativas, quem é?', 'arena-adivinhe'],
    ['grade', 'grade.html', 'Grade', 'Um quadro 3x3 de times. Em cada casa, um jogador que passou pelos dois.', 'arena-grade'],
    ['mais', 'mais-ou-menos.html', 'Mais ou menos', 'Quem tem mais gols, pontos ou assistências? Acerte o máximo em sequência.', ''],
    ['escudo', 'escudo-misterioso.html', 'Escudo misterioso', 'O escudo aparece borrado e vai ficando nítido. Que time é?', 'arena-escudo'],
    ['monte', 'monte-seu-time.html', 'Monte seu time', 'Seu time dos sonhos contra o do adversário, com os jogadores de hoje.', '', 'futebol']
  ];
  function pintar() {
    var lista = JOGOS.filter(function (j) { return !j[5] || j[5] === esporte; });
    caixa.innerHTML = '<div class="dq-abas jb-esportes" role="tablist"><button type="button" role="tab" data-e="futebol" aria-selected="' + (esporte === 'futebol') + '">Futebol</button>' +
      '<button type="button" role="tab" data-e="basquete" aria-selected="' + (esporte === 'basquete') + '">NBA</button></div>' +
      '<div class="je-grade">' + lista.map(function (j, i) {
        var G = j[4] ? JB.ler(j[4], null) : null, feito = G && G.dia && G.dia[JB.hoje + ':' + esporte];
        var status = !j[4] ? '' : feito ? '<span class="je-feito">✓ Desafio de hoje feito</span>' : '<span class="je-novo">Desafio de hoje disponível</span>';
        var href = j[1] + (j[0] === 'monte' ? '' : '#' + esporte);
        return '<a class="je-card' + (i === 0 ? ' je-dest' : '') + '" href="' + href + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC[j[0]] + '</svg><b>' + esc(j[2]) + '</b><small>' + esc(j[3]) + '</small>' + status + '<i>Jogar</i></a>';
      }).join('') + '</div><p class="dq-nota">Grátis e sem cadastro. Seus resultados e recordes ficam guardados neste aparelho.</p>';
    [].forEach.call(caixa.querySelectorAll('.jb-esportes button'), function (b) {
      b.addEventListener('click', function () { esporte = b.getAttribute('data-e'); history.replaceState(null, '', '#' + esporte); document.body.setAttribute('data-esporte', esporte); pintar(); });
    });
  }
  pintar();
})();
