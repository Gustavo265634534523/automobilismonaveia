/* Botões "Assinar" dos planos (página inicial e página de planos).
   Sem conta: manda para Entrar/Criar conta e volta para cá. Com conta: a pessoa escolhe a forma de pagar
   e vai para a página do Mercado Pago. O plano libera sozinho quando o pagamento é aprovado. */
(function () {
  var botoes = document.querySelectorAll('[data-assinar]');
  if (!botoes.length) return;
  var esc = window.esc;
  var PRECO = { medio: '14,90', master: '29,90' }, NOME = { medio: 'Médio', master: 'Master' };
  var eu = null;
  window.NAVEIA_EU.then(function (r) { eu = r; });

  var caixa = document.createElement('div');
  caixa.className = 'as-fundo'; caixa.hidden = true;
  caixa.innerHTML = '<div class="as-caixa" role="dialog" aria-modal="true" aria-labelledby="as-titulo"><button type="button" class="as-fechar" aria-label="Fechar">×</button><div id="as-conteudo"></div></div>';
  document.body.appendChild(caixa);
  var cont = caixa.querySelector('#as-conteudo');

  function fechar() { caixa.hidden = true; document.documentElement.style.overflow = ''; }
  caixa.addEventListener('click', function (e) { if (e.target === caixa || e.target.closest('.as-fechar')) fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !caixa.hidden) fechar(); });

  function abrir(plano) {
    var pagina = location.pathname.split('/').pop() || 'index.html';
    if (!eu || !eu.logado || eu.teste) { location.href = 'entrar.html?volta=' + encodeURIComponent(pagina) + '#criar'; return; }
    var atual = eu.usuario.plano;
    cont.innerHTML = '<p class="as-rot">Assinar</p><h2 id="as-titulo">Plano ' + NOME[plano] + ' <span>R$ ' + PRECO[plano] + ' por mês</span></h2>' +
      (atual === plano ? '<p class="as-nota">Você já tem este plano' + (eu.usuario.plano_ate ? ' até ' + new Date(eu.usuario.plano_ate).toLocaleDateString('pt-BR') : '') + '. Pagar de novo soma mais um mês.</p>' : '') +
      '<div class="as-opcoes">' +
        '<section class="as-op"><h3>Cartão de crédito</h3><p>Cobra sozinho todo mês. Cancele quando quiser em Minha conta.</p>' +
          '<label class="as-email">Seu e-mail no Mercado Pago<input type="email" id="as-email-mp" value="' + esc(eu.usuario.email) + '" autocomplete="email"></label>' +
          '<p class="as-alerta"><b>Atenção:</b> use o mesmo e-mail da sua conta no Mercado Pago. Se for outro e-mail, o pagamento é recusado.</p>' +
          '<button type="button" class="pl-botao" data-forma="cartao">Assinar no cartão</button></section>' +
        '<section class="as-op"><h3>Pix</h3><p>Paga uma vez e usa por 30 dias. Para continuar, é só pagar de novo.</p>' +
          '<button type="button" class="pl-botao pl-botao-linha" data-forma="pix">Pagar com Pix</button></section>' +
      '</div>' +
      '<p class="as-erro" role="alert" hidden></p>' +
      '<p class="as-legal">O pagamento é feito na página segura do Mercado Pago. Você pode desistir em até 7 dias e receber o dinheiro de volta. Veja os <a href="termos.html">Termos de uso</a>.</p>';
    caixa.hidden = false; document.documentElement.style.overflow = 'hidden';
    cont.querySelectorAll('[data-forma]').forEach(function (b) {
      b.addEventListener('click', function () {
        var erro = cont.querySelector('.as-erro'); erro.hidden = true;
        cont.querySelectorAll('[data-forma]').forEach(function (x) { x.disabled = true; });
        var dados = { plano: plano, forma: b.getAttribute('data-forma') };
        b.textContent = dados.forma === 'pix' ? 'Gerando o Pix…' : 'Abrindo o Mercado Pago…';
        if (dados.forma === 'cartao') dados.email_mp = cont.querySelector('#as-email-mp').value;
        window.NAVEIA_API('assinar', dados).then(function (r) {
          if (r.ok && r.pix) { mostrarPix(plano, r.pix); return; }
          if (r.ok && r.link) { location.href = r.link; return; }
          throw new Error(r.erro || 'Não foi possível abrir o pagamento.');
        }).catch(function (e) {
          erro.textContent = e.message && e.message !== 'Failed to fetch' ? e.message : 'Não foi possível falar com o servidor. Tente de novo.';
          erro.hidden = false;
          cont.querySelectorAll('[data-forma]').forEach(function (x) { x.disabled = false; });
          b.textContent = b.getAttribute('data-forma') === 'cartao' ? 'Assinar no cartão' : 'Pagar com Pix';
        });
      });
    });
    cont.querySelector('[data-forma]').focus();
  }

  /* Pix na própria janela: QR Code, botão de copiar e conferência automática a cada 4 segundos */
  var espera = null;
  function mostrarPix(plano, pix) {
    cont.innerHTML = '<p class="as-rot">Pagar com Pix</p><h2 id="as-titulo">Plano ' + NOME[plano] + ' <span>R$ ' + PRECO[plano] + ' · 30 dias</span></h2>' +
      '<div class="as-pix">' +
        (pix.imagem ? '<img class="as-pix-qr" src="data:image/png;base64,' + pix.imagem + '" alt="QR Code do Pix" width="220" height="220">' : '') +
        '<div class="as-pix-lado"><ol class="as-pix-passos"><li>Abra o app do seu banco e escolha <b>Pix</b>.</li><li>Leia o QR Code ou use o <b>Pix Copia e Cola</b>.</li><li>Confira o valor e pague.</li></ol>' +
        '<label class="as-pix-codigo">Código Pix (copia e cola)<textarea readonly rows="3">' + esc(pix.codigo) + '</textarea></label>' +
        '<button type="button" class="pl-botao" id="as-copiar">Copiar código Pix</button></div>' +
      '</div>' +
      '<p class="as-pix-status" id="as-pix-status" role="status"><i></i>Esperando o pagamento… o plano libera sozinho assim que o Pix for pago.</p>' +
      '<p class="as-legal">O código vale por 30 minutos. O pagamento vai para o Mercado Pago do Automobilismo Na Veia.</p>';
    var btn = cont.querySelector('#as-copiar'), txt = cont.querySelector('textarea');
    btn.addEventListener('click', function () {
      var ok = function () { btn.textContent = 'Código copiado!'; setTimeout(function () { btn.textContent = 'Copiar código Pix'; }, 2500); };
      if (navigator.clipboard) navigator.clipboard.writeText(pix.codigo).then(ok, function () { txt.select(); document.execCommand('copy'); ok(); });
      else { txt.select(); document.execCommand('copy'); ok(); }
    });
    var inicio = Date.now(), status = cont.querySelector('#as-pix-status');
    clearInterval(espera);
    espera = setInterval(function () {
      if (caixa.hidden || Date.now() - inicio > 31 * 60000) { clearInterval(espera); return; }
      window.NAVEIA_API('pix_status', { id: pix.id }).then(function (r) {
        if (!r.ok) return;
        if (r.status === 'approved') {
          clearInterval(espera);
          if (eu) eu.usuario = r.usuario;
          cont.innerHTML = '<p class="as-rot">Pagamento aprovado</p><h2 id="as-titulo">Pronto! Seu plano ' + NOME[plano] + ' está liberado.</h2>' +
            '<p class="as-nota">Vale até ' + (r.usuario.plano_ate ? new Date(r.usuario.plano_ate).toLocaleDateString('pt-BR') : 'daqui a 30 dias') + '.</p>' +
            '<a class="pl-botao" href="conta.html">Ir para Minha conta</a>';
        } else if (r.status === 'cancelled' || r.status === 'rejected') {
          clearInterval(espera);
          status.textContent = 'Este Pix venceu ou foi cancelado. Feche a janela e gere um novo.';
        }
      }).catch(function () {});
    }, 4000);
  }
  [].forEach.call(botoes, function (b) { b.addEventListener('click', function () { abrir(b.getAttribute('data-assinar')); }); });
})();

/* volta do Mercado Pago com pagamento recusado */
(function () {
  if (new URLSearchParams(location.search).get('pagamento') !== 'recusado') return;
  var p = document.createElement('p'); p.className = 'as-recusado'; p.setAttribute('role', 'alert');
  p.textContent = 'O pagamento não foi aprovado. Nada foi cobrado. Você pode tentar de novo com outra forma de pagamento.';
  var alvo = document.querySelector('main .moldura') || document.querySelector('main');
  if (alvo) alvo.insertBefore(p, alvo.firstChild);
  if (history.replaceState) history.replaceState(null, '', location.pathname);
})();
