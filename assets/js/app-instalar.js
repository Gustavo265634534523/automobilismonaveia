/* "App" do Na Veia: o site pode ser instalado no celular (ícone na tela, abre como app).
   Aviso discreto só no celular, a partir da 2ª visita, se o site ainda não estiver instalado; fechou, volta em 30 dias.
   Também abre pelo link "Instalar o app" do rodapé (#instalar-app). No Android usa o botão do navegador;
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

  function fecharAviso() {
    var a = document.getElementById('app-aviso'); if (a) a.remove();
    gravar('naveia-app-fechado', String(Date.now()));
  }
  function instrucoes() {
    var j = document.createElement('div');
    j.className = 'app-janela'; j.setAttribute('role', 'dialog'); j.setAttribute('aria-modal', 'true'); j.setAttribute('aria-label', 'Instalar o app');
    j.innerHTML = '<div class="app-caixa"><button type="button" class="app-x" aria-label="Fechar">×</button>' +
      '<img src="assets/app/icone-192.png" alt="" width="56" height="56"><h2>Instale o Na Veia</h2>' +
      (ios
        ? '<ol><li>Toque em <b>Compartilhar</b> <span class="app-ico" aria-hidden="true">⬆︎</span> na barra do Safari.</li><li>Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.</li></ol>'
        : '<ol><li>Toque no menu <b>⋮</b> do navegador, no canto de cima.</li><li>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li></ol>') +
      '<p>O ícone aparece na tela do celular e o site abre como um app. É grátis e não ocupa quase nada.</p></div>';
    document.body.appendChild(j);
    j.addEventListener('click', function (e) { if (e.target === j || e.target.closest('.app-x')) j.remove(); });
  }
  function instalar() {
    if (pedido) {
      pedido.prompt();
      pedido.userChoice.then(function () { pedido = null; fecharAviso(); });
    } else instrucoes();
  }
  function mostrarAviso() {
    if (instalado || !celular || document.getElementById('app-aviso')) return;
    if ((+ler('naveia-app-visitas') || 0) < 2) return;
    if (Date.now() - (+ler('naveia-app-fechado') || 0) < 30 * 864e5) return;
    if (!pedido && !ios) return; /* navegador que não sabe instalar: não insiste */
    var a = document.createElement('div');
    a.id = 'app-aviso'; a.className = 'app-aviso';
    a.innerHTML = '<img src="assets/app/icone-192.png" alt="" width="36" height="36"><p><b>Instale o Na Veia</b><span>Abra com um toque, direto da tela do celular.</span></p>' +
      '<button type="button" class="app-sim">Instalar</button><button type="button" class="app-nao" aria-label="Agora não">×</button>';
    document.body.appendChild(a);
    a.querySelector('.app-sim').addEventListener('click', instalar);
    a.querySelector('.app-nao').addEventListener('click', fecharAviso);
  }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedido = e; setTimeout(mostrarAviso, 6000); });
  window.addEventListener('appinstalled', function () { instalado = true; fecharAviso(); });
  if (ios) setTimeout(mostrarAviso, 6000);

  /* link "Instalar o app" do rodapé */
  document.addEventListener('click', function (e) {
    var l = e.target.closest('a[href="#instalar-app"]'); if (!l) return;
    e.preventDefault();
    if (instalado) { alert('O Na Veia já está instalado neste aparelho. 👍'); return; }
    instalar();
  });
})();
