/* Regras do bolão: quantos pontos vale cada palpite. O mesmo arquivo roda no navegador (bolao.js) e no robô do
   ranking (.github/bolao.js), para a conta ser sempre igual.
   Chave do palpite: "f:<id do jogo>" (futebol), "b:<id do jogo>" (NBA) e "1:<ano>-<etapa>" (Fórmula 1).
   Palpite: futebol "2x1"; NBA "casa|6-10" (quem vence e a diferença); F1 "pole|1º|2º|3º" (nomes dos pilotos).
   Resultado: futebol e NBA "2 x 1" (casa x fora); F1 "pole|1º|2º|3º". */
(function (raiz) {
  var R = {
    PONTOS: {
      futebol: [['Placar exato', 10], ['Vencedor e saldo de gols (ou empate com outro placar)', 7], ['Só o vencedor', 5]],
      nba: [['Vencedor', 5], ['Diferença de pontos na faixa certa', 3]],
      f1: [['Pole position', 5], ['Vencedor da corrida', 10], ['2º ou 3º lugar exato', 5], ['Piloto no pódio, mas em outra posição', 2]]
    },
    FAIXAS: ['1-5', '6-10', '11+'],
    faixa: function (d) { d = Math.abs(d); return d <= 5 ? '1-5' : d <= 10 ? '6-10' : '11+'; },
    placar: function (s) { var m = String(s || '').match(/(\d+)\s*x\s*(\d+)/i); return m ? [+m[1], +m[2]] : null; },
    /* pontos de um palpite; null quando ainda não há resultado */
    pontos: function (chave, palpite, resultado) {
      if (!palpite || !resultado) return null;
      var tipo = chave.charAt(0);
      if (tipo === 'f') {
        var p = R.placar(palpite), r = R.placar(resultado);
        if (!p || !r) return 0;
        if (p[0] === r[0] && p[1] === r[1]) return 10;
        var sp = Math.sign(p[0] - p[1]), sr = Math.sign(r[0] - r[1]);
        if (sp !== sr) return 0;
        return p[0] - p[1] === r[0] - r[1] ? 7 : 5;
      }
      if (tipo === 'b') {
        var q = String(palpite).split('|'), s = R.placar(resultado);
        if (!s || s[0] === s[1]) return 0;
        var vence = s[0] > s[1] ? 'casa' : 'fora';
        if (q[0] !== vence) return 0;
        return 5 + (q[1] && q[1] === R.faixa(s[0] - s[1]) ? 3 : 0);
      }
      if (tipo === '1') {
        var a = String(palpite).split('|'), b = String(resultado).split('|'), pts = 0;
        if (a[0] && a[0] === b[0]) pts += 5;
        var podio = b.slice(1, 4);
        for (var i = 1; i <= 3; i++) {
          if (!a[i]) continue;
          if (a[i] === b[i]) pts += i === 1 ? 10 : 5;
          else if (podio.indexOf(a[i]) > -1) pts += 2;
        }
        return pts;
      }
      return 0;
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
  else raiz.BOLAO_REGRAS = R;
})(this);
