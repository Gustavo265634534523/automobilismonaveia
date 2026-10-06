/* Idioma do site: português (padrão) ou inglês.
   Carregado no <head> de todas as páginas, antes de tudo.
   Em inglês, carrega o dicionário (idioma-en.js) e troca cada texto da página pela tradução,
   inclusive os textos que os scripts criam depois (datas, contagens, placares).
   Para trocar: botão PT | EN no topo (site.js), que grava a escolha e recarrega a página. */
/* Reserva o espaço do topo antes de a página aparecer (faixa de categorias e aviso dos planos, que o site.js coloca depois),
   para o conteúdo não dar um pulo ao carregar (CLS). As regras são as mesmas do site.js. */
(function () {
  var h = document.documentElement, p = location.pathname;
  if (!/(^|\/)(index\.html)?$/.test(p)) h.classList.add('com-cats');
  try {
    var fechado = +localStorage.getItem('avisoPlanosFechado') || 0;
    if (p.indexOf('planos') < 0 && Date.now() - fechado > 7 * 864e5 && localStorage.getItem('naveia-sem-aviso') !== '1') h.classList.add('com-aviso');
  } catch (e) {}
})();

(function () {
  var escolha = null;
  try { escolha = localStorage.getItem('naveia-idioma'); } catch (e) {}
  var m = /[?&]lang=(pt|en)\b/.exec(location.search);
  if (m) { escolha = m[1]; try { localStorage.setItem('naveia-idioma', escolha); } catch (e) {} }
  var LANG = escolha === 'en' ? 'en' : 'pt';
  window.LANG = LANG;
  window.trocarIdioma = function (novo) {
    try { localStorage.setItem('naveia-idioma', novo); } catch (e) {}
    var url = location.href.replace(/([?&])lang=(pt|en)&?/, '$1').replace(/[?&]$/, '');
    location.href = url;
  };
  window.T = function (s) { return s; };
  if (LANG !== 'en') return;

  document.documentElement.lang = 'en';
  document.documentElement.classList.add('trad-pendente');
  document.write('<style>html.trad-pendente body{visibility:hidden}</style><script src="assets/js/idioma-en.js"><\/script>');

  var MES = { jan: 'Jan', fev: 'Feb', mar: 'Mar', abr: 'Apr', mai: 'May', jun: 'Jun', jul: 'Jul', ago: 'Aug', set: 'Sep', out: 'Oct', nov: 'Nov', dez: 'Dec' };
  var MES_LONGO = { janeiro: 'January', fevereiro: 'February', 'março': 'March', abril: 'April', maio: 'May', junho: 'June', julho: 'July', agosto: 'August', setembro: 'September', outubro: 'October', novembro: 'November', dezembro: 'December' };
  var DIA = { dom: 'Sun', seg: 'Mon', ter: 'Tue', qua: 'Wed', qui: 'Thu', sex: 'Fri', 'sáb': 'Sat' };
  var DIA_LONGO = { Domingo: 'Sunday', Segunda: 'Monday', 'Terça': 'Tuesday', Quarta: 'Wednesday', Quinta: 'Thursday', Sexta: 'Friday', 'Sábado': 'Saturday' };
  function ord(n) { n = +n; var s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'; return n + s; }
  function pts(n) { return n + (n === '1' ? ' point' : ' points'); }
  function num(s) { return String(s).replace(/(\d),(\d)/g, '$1.$2'); }
  var M = '(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)';

  /* Regras para textos que mudam (datas, números, nomes). Cada uma: [expressão, função que devolve o inglês] */
  var REGRAS = [
    [new RegExp('^(\\d{1,2}) ' + M + '$'), function (m) { return m[1] + ' ' + MES[m[2]]; }],
    [new RegExp('^(.+) · (\\d{1,2}) ' + M + '$'), function (m) { return tr(m[1]) + ' · ' + m[2] + ' ' + MES[m[3]]; }],
    [/^(dom|seg|ter|qua|qui|sex|sáb) (\d{2}), (\d{2})h(\d{2})$/, function (m) { return DIA[m[1]] + ' ' + m[2] + ', ' + m[3] + ':' + m[4]; }],
    [new RegExp('^(Domingo|Segunda|Terça|Quarta|Quinta|Sexta|Sábado), (\\d{1,2}) ' + M + '$'), function (m) { return DIA_LONGO[m[1]] + ', ' + m[2] + ' ' + MES[m[3]]; }],
    [/^(\d{2})h(\d{2})$/, function (m) { return m[1] + ':' + m[2]; }],
    [/^(\d{1,2}) de (\w+) de (\d{4})$/, function (m) { return (MES_LONGO[m[2]] || m[2]) + ' ' + m[1] + ', ' + m[3]; }],
    [/^Em (\d+) dias$/, function (m) { return 'In ' + m[1] + ' days'; }],
    [/^Etapa (\d+)$/, function (m) { return 'Round ' + m[1]; }],
    [/^Etapa (\d+), (.+)$/, function (m) { return 'Round ' + m[1] + ', ' + tr(m[2]); }],
    [/^Atualizado (hoje|ontem) às (\d{2})h(\d{2})\.$/, function (m) { return 'Updated ' + (m[1] === 'hoje' ? 'today' : 'yesterday') + ' at ' + m[2] + ':' + m[3] + '.'; }],
    [new RegExp('^Atualizado (\\d{1,2}) ' + M + ' às (\\d{2})h(\\d{2})\\.$'), function (m) { return 'Updated ' + m[1] + ' ' + MES[m[2]] + ' at ' + m[3] + ':' + m[4] + '.'; }],
    [/^Atualizado em (.+)\.$/, function (m) { return 'Updated on ' + tr(m[1]) + '.'; }],
    [/^Dados atualizados em (.+?)\. Fontes: (.+)$/, function (m) { return 'Data updated on ' + tr(m[1]) + '. Sources: official series websites, specialist media and Wikipedia.'; }],
    [/^(\d+) categorias acompanhadas de perto\. Dados atualizados em (.+)\.$/, function (m) { return m[1] + ' categories followed closely. Data updated on ' + tr(m[2]) + '.'; }],
    [/^Vencedor: (.+)$/, function (m) { return 'Winner: ' + vencedores(m[1]); }],
    [/^(Sprint|Principal|Principal 1|Principal 2): (.+)$/, function (m) { return vencedores(m[0]); }],
    [/^página da (.+)$/i, function (m) { return tr(m[1]) + ' page'; }],
    [/^(.+): temporada encerrada\.$/, function (m) { return tr(m[1]) + ': season over.'; }],
    [/^, (.+)\.$/, function (m) { return ', ' + lista(m[1]) + '.'; }],
    [/^(.*?)(\d+) pontos( à frente)?(\.?)$/, function (m) { if (m[1] && (!/, $/.test(m[1]) || m[1].length > 60 || /[.!?] /.test(m[1]))) return null; return (m[1] ? lista(m[1].replace(/, $/, '')) + (/, $/.test(m[1]) ? ', ' : ' ') : '') + pts(m[2]) + (m[3] ? ' ahead' : '') + m[4]; }],
    [/^(\d+) voltas$/, function (m) { return m[1] + ' laps'; }],
    [/^(\d+)º$/, function (m) { return ord(m[1]); }],
    [/^Volta (\d+) de (\d+)$/, function (m) { return 'Lap ' + m[1] + ' of ' + m[2]; }],
    [/^Você terminou em (\d+)º$/, function (m) { return 'You finished ' + ord(m[1]); }],
    [/^largou em (\d+)º$/, function (m) { return 'started ' + ord(m[1]); }],
    [/^(Macio|Médio|Duro|Intermediário|Chuva forte), (\d+)% gasto$/, function (m) { return tr(m[1]) + ', ' + m[2] + '% worn'; }],
    [/^Box, box! Seu carro para no fim desta volta para colocar pneu (\w+)\.$/, function (m) { return 'Box, box! Your car pits at the end of this lap for ' + tr(m[1][0].toUpperCase() + m[1].slice(1)).toLowerCase() + ' tyres.'; }],
    [/^Pit stop! Pneu (\w+) colocado\.$/, function (m) { return 'Pit stop! ' + tr(m[1][0].toUpperCase() + m[1].slice(1)) + ' tyres fitted.'; }],
    [/^Corrida em (.+)$/, function (m) { return 'Race at ' + m[1]; }],
    [/^Classificação · (.+)$/, function (m) { return 'Qualifying · ' + m[1].split(' · ').map(tr).join(' · '); }],
    [/^(.+) · (Fácil|Médio|Difícil)$/, function (m) { return tr(m[1]) + ' · ' + tr(m[2]); }],
    [/^Nível (Fácil|Médio|Difícil) · Melhor resultado:$/, function (m) { return tr(m[1]) + ' level · Best result:'; }],
    [/^Sua melhor volta: (.+)$/, function (m) { return 'Your best lap: ' + m[1]; }],
    [/^Volta de classificação em (.+)$/, function (m) { return 'Qualifying lap at ' + m[1]; }],
    [/^Você larga em (\d+)º$/, function (m) { return 'You start ' + ord(m[1]); }],
    [/^Última volta: ([\d:.]+)( · passou reto (\d+) (vez|vezes))?\. (.+)$/, function (m) { return 'Last lap: ' + m[1] + (m[2] ? ' · went off ' + m[3] + (m[3] === '1' ? ' time' : ' times') : '') + '. ' + tr(m[5]); }],
    [/^Você usou as (\d+) corridas de hoje$/, function (m) { return 'You have used your ' + m[1] + ' races for today'; }],
    [/^Amanhã tem mais (\d+)\. No plano Master você joga o Chefe de Equipe sem limite\.$/, function (m) { return 'Tomorrow you get ' + m[1] + ' more. On the Master plan you play Team Boss without limits.'; }],
    [/^Você usou as (\d+) corridas grátis$/, function (m) { return 'You have used your ' + m[1] + ' free races'; }],
    [/^Pista (\d+) de (\d+)$/, function (m) { return 'Track ' + m[1] + ' of ' + m[2]; }],
    [/^(\d+) de (\d+)$/, function (m) { return m[1] + ' of ' + m[2]; }],
    [new RegExp('^(.+), (\\d{1,2}) ' + M + '\\. (\\d+) voltas\\.$'), function (m) { return m[1] + ', ' + m[2] + ' ' + MES[m[3]] + '. ' + m[4] + ' laps.'; }],
    [/^Largou em (\d+)º e terminou em (\d+)º$/, function (m) { return 'Started ' + ord(m[1]) + ' and finished ' + ord(m[2]); }],
    [/^(\d+) de (\d+) voltas na frente$/, function (m) { return m[1] + ' of ' + m[2] + ' laps in front'; }],
    [/^([\d,]+) s na volta (\d+)$/, function (m) { return num(m[1]) + ' s on lap ' + m[2]; }],
    [/^Abandono na volta (\d+)$/, function (m) { return 'Retired on lap ' + m[1]; }],
    [/^(\d+) paradas?,$/, function (m) { return m[1] + (m[1] === '1' ? ' stop,' : ' stops,'); }],
    [/^Raio-x do (.+)$/, function (m) { return tr(m[1]) + ' X-ray'; }],
    [/^Posições de cada piloto a cada volta do (.+)\. A tabela abaixo traz os mesmos resultados\.$/, function (m) { return 'Each driver\'s position on every lap of the ' + tr(m[1]) + '. The table below shows the same results.'; }],
    [/^Abrir o Raio-x do (.+)$/, function (m) { return 'Open the ' + tr(m[1]) + ' X-ray'; }],
    [/^(\d+),(\d{3})( s)?$/, function (m) { return m[1] + '.' + m[2] + (m[3] || ''); }],
    [/^Acertou! Era (.+)\. \+(\d+) pontos?\.$/, function (m) { return 'Correct! It was ' + m[1] + '. +' + pts(m[2]) + '.'; }],
    [/^Não foi dessa vez\. Era (.+)\.$/, function (m) { return 'Not this time. It was ' + m[1] + '.'; }],
    [/^Não é (.+)\. Mais uma dica liberada\.$/, function (m) { return 'It\'s not ' + m[1] + '. Another clue unlocked.'; }],
    [/^Isso! (.+), (.+)\.$/, function (m) { return 'Yes! ' + tr(m[1]) + ', ' + tr(m[2]) + '.'; }],
    [/^Era (.+), (.+)\.$/, function (m) { return 'It was ' + tr(m[1]) + ', ' + tr(m[2]) + '.'; }],
    [/^é campeão, com (\d+) pontos? de vantagem\.$/, function (m) { return 'is champion, by ' + pts(m[1]) + '.'; }],
    [/^Com essas escolhas,$/, function () { return 'With these picks,'; }],
    [/^já garante o título com essas escolhas\.$/, function () { return 'already clinches the title with these picks.'; }],
    [/^Fórmula 1, etapa (\d+) de (\d+)$/, function (m) { return 'Formula 1, round ' + m[1] + ' of ' + m[2]; }],
    [/^lidera com (\d+) pontos, (\d+) à frente de$/, function (m) { return 'leads with ' + m[1] + ' points, ' + m[2] + ' ahead of'; }],
    [/^Se (.+) vencer e (.+) não pontuar, a vantagem vai a (\d+) pontos\.$/, function (m) { return 'If ' + m[1] + ' wins and ' + m[2] + ' fails to score, the gap grows to ' + m[3] + ' points.'; }],
    [/^Se (.+) vencer e (.+) não pontuar, a vantagem cai para (\d+)\.$/, function (m) { return 'If ' + m[1] + ' wins and ' + m[2] + ' fails to score, the gap drops to ' + m[3] + '.'; }],
    [/^Restam (\d+) corridas, com até (\d+) pontos em jogo para cada piloto, sem contar sprints\.$/, function (m) { return m[1] + ' races remain, with up to ' + m[2] + ' points at stake for each driver, not counting sprints.'; }],
    [/^ainda não fecha o título aqui\. Para isso precisaria abrir mais de (\d+) pontos\.$/, function (m) { return 'can\'t wrap up the title here yet. That would need a lead of more than ' + m[1] + ' points.'; }],
    [/^precisa tirar em média ([\d,]+) pontos por corrida do líder\.$/, function (m) { return 'needs to gain ' + num(m[1]) + ' points per race on average on the leader.'; }],
    [/^(\d+) pilotos ainda têm chance matemática\.$/, function (m) { return m[1] + ' drivers still have a mathematical chance.'; }],
    [/^pode sair desta etapa campeão se vencer e (.+) não pontuar\.$/, function (m) { return 'can leave this round as champion by winning if ' + m[1] + ' fails to score.'; }],
    [/^(.+) \((.+)\)$/, function (m) { var a = tr(m[1]), b = tr(m[2]); return a === m[1] && b === m[2] ? null : a + ' (' + b + ')'; }]
  ];
  function vencedores(s) {
    return s.replace(/Principal (\d): /g, 'Feature $1: ').replace(/Principal: /g, 'Feature: ').replace(/ e /g, ' and ')
      .replace(/\((Mercedes|Ferrari|McLaren|Red Bull|Aprilia|Ducati|KTM)\)/g, '($1)');
  }
  function lista(s) { return s.split(', ').map(function (p) { return tr(p); }).join(', ').replace(/^Campeão (\d{4})/, '$1 champion'); }

  var cache = {};
  function tr(txt) {
    var chave = txt.replace(/\s+/g, ' ').trim();
    if (!chave || !/[A-Za-zÀ-ú]/.test(chave)) return txt;
    if (cache[chave] !== undefined) return cache[chave] === null ? txt : cache[chave];
    var D = window.I18N_EN || {}, r = null;
    if (Object.prototype.hasOwnProperty.call(D, chave)) r = D[chave];
    if (r === null) for (var i = 0; i < REGRAS.length; i++) {
      var m = REGRAS[i][0].exec(chave);
      if (m) { var v = REGRAS[i][1](m); if (v != null) { r = v; break; } }
    }
    /* frases separadas por ponto: traduz cada uma, se todas estiverem no dicionário */
    if (r === null && /[.!?] /.test(chave)) {
      var partes = chave.split(/(?<=[.!?]) /), ok = true;
      var tradu = partes.map(function (p) { var t = D[p]; if (t === undefined) ok = false; return t; });
      if (ok) r = tradu.join(' ');
    }
    /* listas curtas separadas por vírgula (ex.: "Goiânia (GO), horários ainda não divulgados") */
    if (r === null && chave.length < 90 && chave.indexOf(', ') > 0 && !/[.!?]$/.test(chave)) {
      var pedacos = chave.split(', '), mudou = false;
      var t2 = pedacos.map(function (p) { var t = tr(p); if (t !== p) mudou = true; return t; });
      if (mudou) r = t2.join(', ');
    }
    cache[chave] = r;
    if (r === null) return txt;
    var ini = /^\s*/.exec(txt)[0], fim = /\s*$/.exec(txt)[0];
    return ini + r + fim;
  }
  window.T = function (s) { return tr(s); };

  var ATRIBUTOS = ['title', 'placeholder', 'aria-label', 'alt', 'label'];
  function traduzirNo(no) {
    if (no.nodeType === 3) {
      var p = no.parentNode && no.parentNode.nodeName;
      if (p === 'SCRIPT' || p === 'STYLE') return;
      var v = no.nodeValue, n = tr(v);
      if (n !== v) no.nodeValue = n;
      return;
    }
    if (no.nodeType !== 1 || no.nodeName === 'SCRIPT' || no.nodeName === 'STYLE') return;
    if (no.hasAttribute('data-sem-traducao')) return;
    ATRIBUTOS.forEach(function (a) { if (no.hasAttribute(a)) { var v = no.getAttribute(a), n = tr(v); if (n !== v) no.setAttribute(a, n); } });
    if (no.nodeName === 'INPUT' && (no.type === 'button' || no.type === 'submit') && no.value) no.value = tr(no.value);
    for (var c = no.firstChild; c; c = c.nextSibling) traduzirNo(c);
  }
  function traduzirTudo() {
    document.title = tr(document.title);
    [].forEach.call(document.querySelectorAll('meta[name=description],meta[property="og:title"],meta[property="og:description"]'), function (m) { m.setAttribute('content', tr(m.getAttribute('content'))); });
    traduzirNo(document.body);
  }
  function liberar() { document.documentElement.classList.remove('trad-pendente'); }
  document.addEventListener('DOMContentLoaded', function () {
    traduzirTudo();
    liberar();
    new MutationObserver(function (lista) {
      lista.forEach(function (mu) {
        if (mu.type === 'characterData') traduzirNo(mu.target);
        else if (mu.type === 'attributes') { var v = mu.target.getAttribute(mu.attributeName), n = v && tr(v); if (n && n !== v) mu.target.setAttribute(mu.attributeName, n); }
        else [].forEach.call(mu.addedNodes, traduzirNo);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
  });
  setTimeout(liberar, 2500); /* segurança: nunca deixa a página escondida */
})();
