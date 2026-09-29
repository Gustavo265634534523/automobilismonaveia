/* Trava do plano Master para as páginas novas (Prévia da etapa e Maratona).
   Uso: window.TRAVA_MASTER(elementoOndeFicaATrava, 'nome do recurso', 'pagina.html', function () { ...monta a página... }) */
(function () {
  window.TRAVA_MASTER = function (caixa, recurso, pagina, liberar) {
    function trava(titulo, texto, botoes) {
      caixa.innerHTML = '<div class="sm-trava"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
        '<h2>' + titulo + '</h2><p>' + texto + '</p><div class="sm-trava-acoes">' + botoes + '</div></div>';
    }
    caixa.innerHTML = '<p class="nota">Carregando…</p>';
    window.NAVEIA_EU.then(function (r) {
      if (r.semServidor) return trava(recurso + ' indisponível agora', 'Não foi possível confirmar sua conta. Tente de novo em alguns minutos.', '<a class="pl-botao" href="' + pagina + '">Tentar de novo</a>');
      if (!r.logado) return trava('Exclusivo do plano Master', 'Entre na sua conta para abrir: ' + recurso + '. Se ainda não assina, conheça o Master.', '<a class="pl-botao" href="entrar.html?volta=' + pagina + '">Entrar</a><a class="pl-botao pl-botao-linha" href="planos.html">Ver os planos</a>');
      if (r.usuario.plano !== 'master') return trava('Exclusivo do plano Master', 'Seu plano atual não inclui: ' + recurso + '. Mude para o Master e libere tudo.', '<a class="pl-botao" href="planos.html">Conhecer o Master</a>');
      caixa.innerHTML = '';
      liberar(r.usuario);
    });
  };
})();
