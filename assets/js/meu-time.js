/* Página Meu time (meu-time.html): o cartão do time de futebol e do de basquete (blocoMeuTime, de esportes-mais.js)
   e a chave dos avisos de gol (avisos-gol.js). */
(function () {
  if (window.blocoMeuTime) { window.blocoMeuTime(document.getElementById('mtp-futebol'), 'futebol', false); window.blocoMeuTime(document.getElementById('mtp-basquete'), 'basquete', false); }
  var caixa = document.getElementById('mtp-avisos'); if (!caixa) return;
  function pintar() {
    var A = window.avisosGol, ligado = A && A.ligado(), bloqueado = 'Notification' in window && Notification.permission === 'denied';
    caixa.innerHTML = '<div class="mtp-av-txt"><b>🔔 Avisos de gol</b><span>' + (ligado
      ? 'Ligados. Com o site aberto (pode ser em outra aba), avisamos quando o jogo do seu time começar, a cada gol e no fim do jogo.'
      : 'Receba um aviso quando o jogo do seu time começar, a cada gol e no fim do jogo.') + '</span>' +
      (ligado && bloqueado ? '<small>As notificações estão bloqueadas no navegador: os avisos aparecem só na tela do site.</small>' : '') +
      '<small>Por enquanto funciona com o site aberto. No app do Arena Sports, que vai chegar às lojas, os avisos vão chegar mesmo com ele fechado.</small></div>' +
      '<div class="mtp-av-bt"><button type="button" class="ft-btn' + (ligado ? ' ft-btn-linha' : '') + '" data-av="ligar">' + (ligado ? 'Desligar avisos' : 'Ligar avisos') + '</button>' +
      (ligado ? '<button type="button" class="ft-btn ft-btn-linha" data-av="testar">Ver um aviso de teste</button>' : '') + '</div>';
  }
  caixa.addEventListener('click', function (e) {
    var b = e.target.closest('[data-av]'); if (!b || !window.avisosGol) return;
    if (b.getAttribute('data-av') === 'ligar') window.avisosGol.ligar(!window.avisosGol.ligado()); else window.avisosGol.testar();
  });
  document.addEventListener('naveia:avisos', pintar);
  pintar();
})();
