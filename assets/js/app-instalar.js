/* "App" do Na Veia: o site pode ser instalado no celular (ícone na tela, abre como app).
   Botão fixo "Instalar app" no canto de baixo, à esquerda (celular sempre, até instalar; computador só se o navegador souber instalar).
   Também abre pelo menu do topo e pelo rodapé (#instalar-app). No Android usa o botão do navegador;
   no iPhone mostra os 2 passos (Compartilhar → Adicionar à Tela de Início). */
(function () {
  var instalado = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var celular = ios || /android|mobile/i.test(navigator.userAgent);
  var pedido = null;

  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* conta as visitas (uma por dia) */
  var hoje = new Date().toISOString().slice(0, 10);
  if (ler('naveia-app-dia') !== hoje) { gravar('naveia-app-dia', hoje); gravar('naveia-app-visitas', String((+ler('naveia-app-visitas') || 0) + 1)); }

  function instrucoes() {
    var j = document.createElement('div');
    j.className = 'app-janela'; j.setAttribute('role', 'dialog'); j.setAttribute('aria-modal', 'true'); j.setAttribute('aria-label', 'Instalar o app');
    j.innerHTML = '<div class="app-caixa"><button type="button" class="app-x" aria-label="Fechar">×</button>' +
      '<img src="assets/app/icone-192.png" alt="" width="56" height="56"><h2>Instale o Na Veia</h2>' +
      (ios
        ? '<ol><li>Toque em <b>Compartilhar</b> <span class="app-ico" aria-hidden="true">⬆︎</span> na barra do Safari.</li><li>Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.</li></ol>'
        : celular
          ? '<ol><li>Toque no menu <b>⋮</b> do navegador, no canto de cima.</li><li>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li></ol>'
          : '<ol><li>Clique no ícone de instalar, no lado direito da barra de endereço, ou abra o menu <b>⋮</b> do navegador.</li><li>Escolha <b>Instalar Automobilismo Na Veia</b>.</li></ol><p>Se já instalou, o app está no menu Iniciar do computador.</p>') +
      '<p>O ícone aparece na tela do celular e o site abre como um app. É grátis e não ocupa quase nada.</p></div>';
    document.body.appendChild(j);
    j.addEventListener('click', function (e) { if (e.target === j || e.target.closest('.app-x')) j.remove(); });
  }
  function instalar() {
    if (pedido) {
      pedido.prompt();
      pedido.userChoice.then(function () { pedido = null; });
    } else instrucoes();
  }
  /* botão fixo "Instalar app" no canto de baixo, à esquerda: aparece sempre no navegador
     (celular e computador); só não aparece dentro do próprio app já aberto */
  function mostrarAviso() {
    if (instalado || document.getElementById('app-aviso')) return;
    var a = document.createElement('div');
    a.id = 'app-aviso'; a.className = 'app-bt';
    a.innerHTML = '<button type="button" class="app-sim"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v7m-3-3 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Instalar app</button>';
    document.body.appendChild(a);
    a.querySelector('.app-sim').addEventListener('click', instalar);
  }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedido = e; mostrarAviso(); });
  setTimeout(mostrarAviso, 1500);

  /* link "Instalar o app" do rodapé */
  document.addEventListener('click', function (e) {
    var l = e.target.closest('a[href="#instalar-app"]'); if (!l) return;
    e.preventDefault();
    instalar();
  });
})();
