/* Box: assistente de voz do Na Veia ("Box, box!", como no rádio da equipe).
   A pessoa fala (ou digita) e o Box responde em texto e em voz, com os dados do próprio site:
   horário das sessões, previsão do tempo na pista (Open-Meteo), líder e classificação, último vencedor
   e colocar uma categoria ou uma corrida na agenda do celular (planos Médio e Master).
   Voz: natural (Azure, ação box_voz) para quem tem conta; senão, a do próprio navegador. Perguntas livres vão para a IA (ação box_ia). */
(function () {
  var CATS = window.CATEGORIAS || [];
  if (!CATS.length || document.getElementById('box-bt')) return;
  var esc = window.esc;

  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  var PORSLUG = {}; CATS.forEach(function (c) { PORSLUG[c.slug] = c; });

  /* Nomes que as pessoas falam para cada categoria (o mais comprido é testado primeiro) */
  var APELIDOS = {
    'formula-1': ['formula 1', 'formula um', 'f1', 'formula one'], 'formula-2': ['formula 2', 'formula dois', 'f2'], 'formula-3': ['formula 3', 'formula tres', 'f3'],
    'formula-e': ['formula e'], 'stock-car': ['stock car', 'stockcar', 'stock'], 'porsche-cup': ['porsche cup', 'porsche'], nascar: ['nascar'],
    indycar: ['indycar', 'indy car', 'formula indy', 'indy'], endurance: ['mundial de endurance', 'endurance', 'wec'], 'le-mans': ['24 horas de le mans', 'le mans'],
    imsa: ['imsa'], dtm: ['dtm'], superbike: ['superbike', 'super bike', 'wsbk'], dakar: ['rally dakar', 'rali dakar', 'dakar'],
    rally: ['mundial de rali', 'mundial de rally', 'wrc', 'rally', 'rali'], motocross: ['motocross', 'moto cross', 'mxgp'], motogp: ['motogp', 'moto gp']
  };
  var LISTA_AP = [];
  Object.keys(APELIDOS).forEach(function (s) { APELIDOS[s].forEach(function (a) { LISTA_AP.push([a, s]); }); });
  LISTA_AP.sort(function (a, b) { return b[0].length - a[0].length; });
  function acharCat(q) {
    for (var i = 0; i < LISTA_AP.length; i++) if (PORSLUG[LISTA_AP[i][1]] && new RegExp('(^| )' + LISTA_AP[i][0] + '( |$)').test(q)) return PORSLUG[LISTA_AP[i][1]];
    return null;
  }
  /* Etapa pelo nome ou lugar ("singapura", "interlagos", "mandalika"), de preferência a próxima */
  var VAZIAS = { gp: 1, de: 1, do: 1, da: 1, dos: 1, das: 1, grande: 1, premio: 1, etapa: 1, final: 1, horas: 1, rally: 1, rali: 1, corrida: 1, round: 1 };
  function acharEtapa(q, cat) {
    var hoje = window.hojeISO(), melhor = null;
    (cat ? [cat] : CATS).forEach(function (c) {
      c.calendario.forEach(function (e) {
        var palavras = norm(e.n + ' ' + (e.l || '')).split(' ').filter(function (w) { return w.length > 3 && !VAZIAS[w] && !/^\d+$/.test(w); });
        if (!palavras.some(function (w) { return new RegExp('(^| )' + w + '( |$)').test(q); })) return;
        var futura = e.d && e.d >= hoje && !e.venc, nota = (futura ? 0 : 1e9) + Math.abs(Date.parse((e.d || '2100-01-01') + 'T12:00:00') - Date.now());
        if (!melhor || nota < melhor.nota) melhor = { c: c, e: e, nota: nota };
      });
    });
    return melhor;
  }
  function proxima(c) { var h = window.hojeISO(); return c.calendario.filter(function (e) { return e.d && e.d >= h && !e.venc; })[0] || null; }
  function ultima(c) { var f = c.calendario.filter(function (e) { return e.venc; }); return f[f.length - 1] || null; }
  function sessao(e, q) {
    var s = e.s || [], sprint = /sprint/.test(q), a;
    if (/classifica|quali|pole/.test(q)) {
      a = s.filter(function (x) { return /Classifica|Quali/.test(x.t) && /sprint/i.test(x.t) === sprint; });
      if (!a.length) a = s.filter(function (x) { return /Classifica|Quali/.test(x.t); });
      if (a.length) return a[0];
    }
    var quer = /treino/.test(q) ? /Treino/ : sprint ? /^Sprint/ : null;
    if (quer) { a = s.filter(function (x) { return quer.test(x.t); }); if (a.length) return a[0]; }
    var c = s.filter(function (x) { return /Corrida|Principal|Race/.test(x.t); });
    return c[c.length - 1] || null;
  }
  var SEM = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function quandoTxt(d) {
    var n = window.diasAte(d), dt = new Date(d + 'T12:00:00');
    var base = n === 0 ? 'hoje' : n === 1 ? 'amanhã' : SEM[dt.getDay()] + ', ' + (+d.slice(8)) + ' de ' + MES[+d.slice(5, 7) - 1];
    return base;
  }
  function horaTxt(h) { var p = h.split(':'); return 'às ' + (+p[0]) + 'h' + (p[1] !== '00' ? p[1] : ''); }
  /* artigo de cada categoria: "da Stock Car", "do DTM", "de Le Mans" */
  var MASC = { dtm: 1, imsa: 1, endurance: 1, rally: 1, motocross: 1, dakar: 1, superbike: 1 };
  function de(c) { return c.slug === 'le-mans' ? 'de ' + c.nome : (MASC[c.slug] ? 'do ' : 'da ') + c.nome; }
  function art(c) { return c.slug === 'le-mans' ? c.nome : (MASC[c.slug] ? 'o ' : 'a ') + c.nome; }

  /* ---------- respostas ---------- */
  function rHorario(c, e, q) {
    if (!e) return { t: 'Não achei a próxima etapa ' + de(c) + ' no calendário. A temporada pode ter acabado.' };
    var s = sessao(e, q), oQue = s ? (/Corrida|Principal|Race/.test(s.t) ? 'a corrida' : 'a ' + s.t.toLowerCase()) : 'a etapa';
    var txt = c.nome + ', ' + e.n + ': ' + oQue + ' é ' + quandoTxt(s ? s.d : e.d) + (s ? ', ' + horaTxt(s.h) + ', no horário de Brasília.' : '. O horário ainda não foi confirmado.');
    var dias = window.diasAte(s ? s.d : e.d);
    if (dias > 1) txt += ' Faltam ' + dias + ' dias.';
    return { t: txt, link: [c.slug + '.html#calendario', 'Ver todos os horários'] };
  }
  function rProximaGeral() {
    var agora = Date.now(), melhor = null;
    CATS.forEach(function (c) { c.calendario.forEach(function (e) { (e.s || []).forEach(function (x) {
      if (!/Corrida|Principal|Race/.test(x.t)) return;
      var t = new Date(x.d + 'T' + x.h + ':00-03:00').getTime();
      if (t > agora && (!melhor || t < melhor.t)) melhor = { c: c, e: e, x: x, t: t };
    }); }); });
    if (!melhor) return { t: 'Não achei corridas com horário marcado nos próximos dias.' };
    return { t: 'A próxima largada é ' + de(melhor.c) + ': ' + melhor.e.n + ', ' + quandoTxt(melhor.x.d) + ', ' + horaTxt(melhor.x.h) + ', no horário de Brasília.', link: [melhor.c.slug + '.html#calendario', 'Ver a etapa'] };
  }
  function rLider(c) {
    var l = c.classificacao && c.classificacao.linhas || [], txt;
    if (c.classificacao.colunas.indexOf('Pts') < 0) return { t: c.nome + ': ' + c.lider.nome + ', ' + c.lider.info.charAt(0).toLowerCase() + c.lider.info.slice(1) + '.', link: [c.slug + '.html#classificacao', 'Ver o resultado'] };
    if (/campe[aã]o/i.test(c.lider.info)) txt = c.lider.nome + ' é ' + c.lider.info.split(',')[0].toLowerCase() + ' ' + de(c) + '.';
    else txt = 'Quem lidera ' + art(c) + ' é ' + c.lider.nome + ', ' + c.lider.info + '.';
    if (l[1] && c.classificacao.colunas.indexOf('Pts') > -1) txt += ' Em segundo vem ' + l[1][1] + ', com ' + l[1][l[1].length - 1] + (l[2] ? ', e em terceiro ' + l[2][1] + ', com ' + l[2][l[2].length - 1] : '') + '.';
    return { t: txt, link: [c.slug + '.html#classificacao', 'Ver a classificação'] };
  }
  function rResultado(c, e) {
    e = e && e.venc ? e : ultima(c);
    if (!e) return { t: c.nome + ' ainda não teve corrida nesta temporada.' };
    return { t: c.nome + ', ' + e.n + '. Vencedor: ' + e.venc + '.', link: [c.slug + '.html#resultados', 'Ver os resultados'] };
  }

  /* previsão do tempo na pista, na hora da sessão */
  var pistasPromessa = null;
  function pistas() {
    if (window.PREVIA_PISTAS) return Promise.resolve(window.PREVIA_PISTAS);
    if (!pistasPromessa) pistasPromessa = new Promise(function (ok) { var s = document.createElement('script'); s.src = 'assets/js/previa-pistas.js'; s.onload = s.onerror = function () { ok(window.PREVIA_PISTAS || {}); }; document.head.appendChild(s); });
    return pistasPromessa;
  }
  function coordenadas(e) {
    return pistas().then(function (P) {
      var p = P[e.l]; if (p && p.lat) return { lat: p.lat, lon: p.lon };
      var nome = String(e.l || e.n).replace(/\(.*?\)/g, '').split(',')[0].trim();
      return fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=pt&name=' + encodeURIComponent(nome)).then(function (r) { return r.json(); })
        .then(function (j) { var g = j.results && j.results[0]; return g ? { lat: g.latitude, lon: g.longitude } : null; });
    });
  }
  function rClima(c, e, q) {
    if (!e) return Promise.resolve({ t: 'Não achei a próxima etapa ' + de(c) + ' para ver a previsão.' });
    var s = sessao(e, q), dia = s ? s.d : e.d, n = window.diasAte(dia);
    if (n > 15) return Promise.resolve({ t: c.nome + ', ' + e.n + ': faltam ' + n + ' dias. A previsão do tempo só sai uns 15 dias antes. Pergunte de novo mais perto da corrida.' });
    return coordenadas(e).then(function (g) {
      if (!g) throw 0;
      return fetch('https://api.open-meteo.com/v1/forecast?latitude=' + g.lat + '&longitude=' + g.lon + '&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&start_date=' + dia + '&end_date=' + dia)
        .then(function (r) { return r.json(); }).then(function (j) {
          var txt;
          if (s && j.hourly && j.hourly.time) {
            var i = j.hourly.time.indexOf(dia + 'T' + s.h.slice(0, 2) + ':00'); if (i < 0) i = 0;
            var tC = Math.round(j.hourly.temperature_2m[i]), ch = j.hourly.precipitation_probability[i];
            txt = c.nome + ', ' + e.n + ', ' + quandoTxt(dia) + ': na hora ' + (/Corrida|Principal|Race/.test(s.t) ? 'da largada' : 'da ' + s.t.toLowerCase()) + ', a previsão é de ' + tC + ' graus' + (ch != null ? ', com ' + ch + '% de chance de chuva.' : '.');
          } else {
            var d = j.daily; txt = c.nome + ', ' + e.n + ', ' + quandoTxt(dia) + ': máxima de ' + Math.round(d.temperature_2m_max[0]) + ' e mínima de ' + Math.round(d.temperature_2m_min[0]) + ' graus, com ' + d.precipitation_probability_max[0] + '% de chance de chuva.';
          }
          return { t: txt + ' Previsões mudam, então vale conferir de novo no dia.' };
        });
    }).catch(function () { return { t: 'Não consegui buscar a previsão do tempo agora. Tente de novo daqui a pouco.' }; });
  }

  /* agenda do celular (planos Médio e Master) */
  var pasta = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '') + 'assets/agenda/';
  function plano() {
    return Promise.resolve('master'); /* tudo grátis: agenda inteira liberada para todos */
  }
  function ics(c, e, s) {
    var ini = new Date(s.d + 'T' + s.h + ':00-03:00'), fim = new Date(ini.getTime() + 2 * 36e5);
    var f = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); };
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Automobilismo Na Veia//Box//PT', 'BEGIN:VEVENT', 'UID:' + c.slug + '-' + e.e + '-' + s.d + '@automobilismonaveia.com.br',
      'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(ini), 'DTEND:' + f(fim), 'SUMMARY:' + c.nome + ': ' + e.n + (s.t ? ' (' + s.t + ')' : ''), 'LOCATION:' + (e.l || ''),
      'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Largada em 30 minutos', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var google = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(c.nome + ': ' + e.n) + '&dates=' + f(ini) + '/' + f(fim) + '&location=' + encodeURIComponent(e.l || '');
    return { arquivo: URL.createObjectURL(new Blob([txt], { type: 'text/calendar' })), nome: c.slug + '-' + s.d + '.ics', google: google };
  }
  function rAgenda(c, e, q, unica) {
    return plano().then(function (p) {
      var pago = p === 'medio' || p === 'master';
      if (unica && e && sessao(e, q)) pago = true; /* uma corrida só: grátis para todos */
      if (!pago) {
        var r = { t: 'Assinar a agenda inteira ' + de(c) + ', com todas as etapas e os horários se atualizando sozinhos, faz parte dos planos Médio e Master. De graça, eu coloco uma corrida por vez: diga, por exemplo, "coloca a próxima corrida ' + de(c) + ' na agenda".' };
        return r;
      }
      if (unica && e) {
        var s = sessao(e, q);
        if (!s) return { t: 'O horário de ' + e.n + ' ainda não foi confirmado, então não dá para colocar só essa corrida. Posso colocar a agenda inteira ' + de(c) + ', que se atualiza sozinha.', botoes: assinatura(c) };
        var a = ics(c, e, s);
        return { t: 'Pronto. Toque em "Adicionar à agenda" para confirmar: ' + c.nome + ', ' + e.n + ', ' + quandoTxt(s.d) + ', ' + horaTxt(s.h) + ', com aviso 30 minutos antes.',
          botoes: [['Adicionar à agenda', a.arquivo, a.nome], ['Google Agenda', a.google]] };
      }
      return { t: 'Pronto. Toque em "Assinar no celular" para confirmar. Todas as etapas ' + de(c) + ' entram na sua agenda, com aviso 30 minutos antes, e os horários mudam sozinhos quando mudarem.', botoes: assinatura(c) };
    });
  }
  function assinatura(c) {
    var https = pasta + c.slug + '.ics', webcal = https.replace(/^https?:/, 'webcal:');
    return [['Assinar no celular', webcal], ['Google Agenda', 'https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(webcal)]];
  }

  /* onde assistir (assets/js/onde-assistir-dados.js, carregado quando precisa) */
  var oaPromessa = null;
  function dadosOA() {
    if (window.ONDE_ASSISTIR) return Promise.resolve(window.ONDE_ASSISTIR);
    if (!oaPromessa) oaPromessa = new Promise(function (ok) { var sc = document.createElement('script'); sc.src = 'assets/js/onde-assistir-dados.js?v=239'; sc.onload = sc.onerror = function () { ok(window.ONDE_ASSISTIR || null); }; document.head.appendChild(sc); });
    return oaPromessa;
  }
  function rOndeAssistir(c, e, q) {
    return dadosOA().then(function (O) {
      var d = O && O.cats[c.slug];
      if (!d) return { t: 'Ainda não tenho os canais ' + de(c) + '.', link: ['onde-assistir.html', 'Ver onde assistir'] };
      var TP = { aberta: '(TV aberta)', paga: '(TV por assinatura)', stream: '(streaming)', gratis: '(grátis na internet)' }, grupos = {};
      d.canais.forEach(function (x) { (grupos[x[1]] = grupos[x[1]] || []).push(x[0]); });
      var partes = ['aberta', 'paga', 'stream', 'gratis'].filter(function (k) { return grupos[k]; }).map(function (k) { return grupos[k].join(' e ') + ' ' + TP[k]; });
      var txt = 'Onde assistir ' + (c.menu && c.menu !== c.nome ? c.menu : c.nome) + ': ' + partes.join('; ') + '.';
      var s = e && sessao(e, q);
      if (s) txt += ' A próxima ' + (/Corrida|Principal|Race/.test(s.t) ? 'corrida' : s.t.toLowerCase()) + ' é ' + quandoTxt(s.d) + ', ' + horaTxt(s.h) + '.';
      if (d.nota) txt += ' ' + d.nota;
      return { t: txt, link: [c.slug + '.html#onde-assistir', 'Ver os canais'] };
    });
  }

  /* Perguntas livres: vão para a IA do servidor (ação box_ia), junto com os dados atuais do site,
     para a resposta usar líderes e próximas corridas certos. Guarda as últimas trocas para entender "e ele?". */
  var historico = [];
  function contextoSite() {
    var linhas = CATS.map(function (c) {
      var e = proxima(c), s2 = e && sessao(e, ''), l = (c.classificacao && c.classificacao.linhas) || [];
      var top = l.slice(0, 3).map(function (x) { return x[0] + 'º ' + x[1] + ' ' + x[x.length - 1]; }).join(', ');
      var venc = c.calendario.filter(function (x) { return x.venc; }).slice(-2).map(function (x) { return x.n + ': ' + x.venc; }).join('; ');
      return (c.menu && c.menu !== c.nome ? c.nome + ' (' + c.menu + ')' : c.nome) + ': líder ' + c.lider.nome + ' (' + c.lider.info + ')' +
        (top ? '; classificação: ' + top : '') + (venc ? '; últimas: ' + venc : '') +
        (e ? '; próxima: ' + e.n + ' em ' + (e.l || '') + ', ' + e.d + (s2 ? ' às ' + s2.h + ' de Brasília' : '') : '; sem próxima etapa marcada');
    });
    var nots = (window.NOTICIAS_GERAIS || []).slice(0, 8).map(function (n) { return '- ' + n.t; });
    return linhas.join('\n') + (nots.length ? '\nManchetes recentes:\n' + nots.join('\n') : '');
  }
  /* Corrige nomes de pilotos escritos errado (o reconhecimento de voz erra muito sobrenome): compara cada palavra
     com os sobrenomes dos pilotos do site e troca pela grafia certa quando a diferença é de 1 ou 2 letras. */
  var SOBRENOMES = null;
  function sobrenomes() {
    if (SOBRENOMES) return SOBRENOMES;
    var vistos = {};
    CATS.forEach(function (c) {
      var nomes = [];
      (c.equipes || []).forEach(function (e) { nomes = nomes.concat(e.p || []); });
      ((c.classificacao && c.classificacao.linhas) || []).forEach(function (l) { nomes.push(l[1]); });
      nomes.forEach(function (n) { String(n).split(/[\s,]+/).forEach(function (w) { if (w.length >= 5 && /^[A-ZÀ-Ý]/.test(w)) vistos[w] = 1; }); });
    });
    SOBRENOMES = Object.keys(vistos);
    return SOBRENOMES;
  }
  function distancia(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  var COMUNS = {}; 'quantos quantas quando corrida corridas campeao campeoes piloto pilotos equipe equipes temporada primeiro segundo terceiro ganhou venceu titulos titulo classificacao proxima proximo musica carro carros horas sobre agora ainda depois antes hoje amanha ontem melhor maior menor mundial brasil brasileiro largada vitoria vitorias pontos lider lidera tempo chuva chover onde assistir canal agenda coloca falar fale conhece conheceu nasceu morreu historia curiosidade quanto quais quantos porque gosta torcida cantam cantar canta noticias noticia'.split(' ').forEach(function (w) { COMUNS[w] = 1; });
  function corrigirNomes(texto) {
    var lista = sobrenomes();
    return texto.replace(/[A-Za-zÀ-ÿ]{5,}/g, function (w) {
      var nw = norm(w), melhor = null, md = 3;
      if (COMUNS[nw]) return w;
      lista.forEach(function (s) { var d = distancia(nw, norm(s)); if (d < md && d <= (nw.length >= 8 ? 2 : 1)) { md = d; melhor = s; } });
      return melhor && md > 0 ? melhor : w;
    });
  }
  function perguntarIA(texto) {
    texto = corrigirNomes(texto);
    if (!window.NAVEIA_API) return Promise.resolve({ t: 'Ainda não sei responder isso. ' + AJUDA });
    return window.NAVEIA_API('box_ia', { pergunta: texto, contexto: contextoSite(), historico: historico.slice(-4) }).then(function (r) {
      if (!r || !r.ok || !r.texto) return { t: (r && r.erro) || 'Não consegui responder agora. ' + AJUDA };
      historico.push({ r: 'user', t: texto }, { r: 'assistant', t: r.texto });
      return { t: r.texto };
    }).catch(function () { return { t: 'Não consegui falar com o servidor agora. Tente de novo daqui a pouco.' }; });
  }

  var AJUDA = 'Pergunte, por exemplo: "que horas é a corrida da Fórmula 1?", "onde passa a MotoGP?", "vai chover em Singapura?", "quem lidera a MotoGP?" ou "coloca a Porsche Cup na minha agenda".';
  var VAZIAS_Q = { e: 1, a: 1, o: 1, da: 1, do: 1, de: 1, na: 1, no: 1, sobre: 1, me: 1, fala: 1, fale: 1, e_a: 1, como: 1, esta: 1, ta: 1, que: 1, tem: 1, hoje: 1, agora: 1, entao: 1, ai: 1, box: 1 };
  function sobra(q, c) {
    var t = ' ' + q + ' ';
    (APELIDOS[c.slug] || []).concat([norm(c.nome), norm(c.menu || '')]).forEach(function (a) { if (a) t = t.split(' ' + a + ' ').join(' '); });
    return t.split(' ').filter(function (w) { return w && !VAZIAS_Q[w]; }).length;
  }
  function responder(texto) {
    var q = norm(texto), c = acharCat(q), ev = acharEtapa(q, c);
    if (!c && ev) c = ev.c;
    var e = ev && (!c || ev.c === c) ? ev.e : (c ? proxima(c) : null), etapaDita = !!(ev && ev.c === c);
    if (/^(oi|ola|e ai|bom dia|boa tarde|boa noite|box)( box)?$/.test(q)) return Promise.resolve({ t: 'Box, box! Sou o Box, o assistente do Na Veia. ' + AJUDA });
    if (/(agenda|calendario|lembrete|me avisa|me lembra)/.test(q)) {
      if (!c) return Promise.resolve({ t: 'Qual categoria você quer na agenda? Diga, por exemplo: "coloca a Stock Car na minha agenda".' });
      var unica = etapaDita || (/(proxima|corrida|etapa|gp)/.test(q) && !/(todas|inteira|temporada|campeonato)/.test(q));
      return rAgenda(c, e, q, unica);
    }
    if (/(onde (assistir|assisto|passa|vai passar|ver|vejo|transmite)|qual canal|que canal|em que canal|passa na|passa no|transmissao|transmite|qual emissora)/.test(q)) {
      if (!c) return Promise.resolve({ t: 'De qual categoria? Diga, por exemplo: "onde passa a Stock Car?". Ou veja todas na página Onde assistir.', link: ['onde-assistir.html', 'Ver onde assistir'] });
      return rOndeAssistir(c, e, q);
    }
    if (/(temperatura|clima|chuva|chover|chove|calor|frio|previsao|tempo vai|vai fazer|graus)/.test(q)) {
      if (!c) return Promise.resolve({ t: 'De qual corrida você quer a previsão? Diga, por exemplo: "vai chover no GP de Singapura?".' });
      return rClima(c, e, q);
    }
    if (/(quem (ganhou|venceu)|vencedor|venceu|ganhou|resultado)/.test(q)) {
      if (!c) return Promise.resolve({ t: 'De qual categoria? Diga, por exemplo: "quem ganhou a última da MotoGP?".' });
      return Promise.resolve(rResultado(c, etapaDita ? e : null));
    }
    if (/(que horas|horario|quando|comeca|largada|que dia|qual dia|proxima|hora)/.test(q)) {
      if (!c) return Promise.resolve(rProximaGeral());
      return Promise.resolve(rHorario(c, e, q));
    }
    if (/(lider|lidera|liderando|campeonato|tabela|pontos|campeao|classificacao geral|em primeiro)/.test(q)) {
      if (!c) return Promise.resolve({ t: 'De qual categoria? Diga, por exemplo: "quem lidera a Stock Car?".' });
      return Promise.resolve(rLider(c));
    }
    /* resumo da categoria só quando a pessoa diz praticamente só o nome dela ("e a Fórmula 1?"); com mais assunto, vai para a IA */
    if (c && sobra(q, c) <= 1) {
      var r1 = rHorario(c, e, q), r2 = rLider(c);
      return Promise.resolve({ t: r1.t + ' ' + r2.t, link: r1.link });
    }
    return perguntarIA(texto);
  }

  /* ---------- tela cheia com a esfera vermelha ---------- */
  var MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var bt = document.createElement('button');
  bt.type = 'button'; bt.id = 'box-bt'; bt.className = 'box-bt'; bt.setAttribute('aria-label', 'Abrir o Box, assistente de voz');
  var ORBE = '<svg class="orbe-ic" viewBox="0 0 100 100" aria-hidden="true"><g><ellipse cx="50" cy="50" rx="40" ry="17"/></g><g><ellipse cx="50" cy="50" rx="17" ry="40"/></g><g><ellipse cx="50" cy="50" rx="38" ry="24" transform="rotate(45 50 50)"/></g><g><ellipse cx="50" cy="50" rx="38" ry="22" transform="rotate(-40 50 50)"/></g><g><ellipse cx="50" cy="50" rx="34" ry="31"/></g><g><circle cx="50" cy="50" r="9" class="orbe-nucleo"/></g></svg>';
  bt.innerHTML = ORBE + '<span>Box</span><i class="box-escuta" aria-hidden="true"></i>';
  document.body.appendChild(bt);

  var tela = document.createElement('div');
  tela.className = 'box-tela'; tela.hidden = true; tela.setAttribute('role', 'dialog'); tela.setAttribute('aria-modal', 'true'); tela.setAttribute('aria-label', 'Box, assistente de voz');
  tela.innerHTML = '<div class="box-topo"><b>Box</b><span>Seu engenheiro de corrida</span>' +
    '<button type="button" class="box-som" aria-pressed="true" title="Ler as respostas em voz alta">🔊</button><button type="button" class="box-fechar" aria-label="Fechar">×</button></div>' +
    '<div class="box-palco"><canvas class="box-esfera" aria-hidden="true"></canvas>' +
    '<p class="box-estado" aria-live="polite"></p><p class="box-pergunta"></p><div class="box-resposta" aria-live="polite"></div>' +
    '<div class="box-sug"></div></div>' +
    '<div class="box-base">' + (Rec || (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && navigator.mediaDevices && window.MediaRecorder) ? '<button type="button" class="box-mic" aria-label="Falar">' + MIC + '</button>' : '') +
    '<form class="box-form"><input type="text" class="box-campo" placeholder="' + (Rec ? 'Ou digite sua pergunta' : 'Digite sua pergunta') + '" maxlength="200" autocomplete="off"><button type="submit" class="box-enviar" aria-label="Enviar">➤</button></form>' +
    (Rec ? '<label class="box-maos"><input type="checkbox" class="box-maos-ck"> Abrir quando eu falar "Box, box" (com o site aberto)</label>' : '') + '</div>';
  document.body.appendChild(tela);

  var estadoEl = tela.querySelector('.box-estado'), perguntaEl = tela.querySelector('.box-pergunta'), respEl = tela.querySelector('.box-resposta');
  var campo = tela.querySelector('.box-campo'), mic = tela.querySelector('.box-mic'), somBt = tela.querySelector('.box-som'), sug = tela.querySelector('.box-sug');
  var SUG = ['Que horas é a corrida da Fórmula 1?', 'Vai chover na próxima da MotoGP?', 'Quem lidera a Stock Car?', 'Coloca a Porsche Cup na minha agenda'];
  sug.innerHTML = SUG.map(function (s) { return '<button type="button">' + esc(s) + '</button>'; }).join('');

  /* esfera: anéis de luz vermelha que giram; a energia sobe quando ouve e quando fala */
  var cv = tela.querySelector('.box-esfera'), cx = cv.getContext('2d'), energia = .25, alvo = .25, falando = false, anim = 0, t0 = performance.now();
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function estado(qual, txt) {
    alvo = { parado: .25, ouvindo: 1, pensando: .55, falando: .8 }[qual] || .25;
    falando = qual === 'falando';
    tela.setAttribute('data-estado', qual);
    estadoEl.textContent = txt || '';
  }
  function desenharEsfera(agora) {
    if (tela.hidden) { anim = 0; return; }
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var t = (agora - t0) / 1000;
    energia += (alvo + (falando ? Math.abs(Math.sin(t * 9)) * .35 : 0) - energia) * .08;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, w, h);
    var R = Math.min(w, h) * .3, mx = w / 2, my = h / 2;
    var brilho = cx.createRadialGradient(mx, my, 0, mx, my, R * 1.9);
    brilho.addColorStop(0, 'rgba(227,52,60,' + (.16 + energia * .18) + ')'); brilho.addColorStop(1, 'rgba(227,52,60,0)');
    cx.fillStyle = brilho; cx.fillRect(0, 0, w, h);
    cx.globalCompositeOperation = 'lighter';
    var vel = reduz ? 0 : (.25 + energia * 1.2);
    for (var k = 0; k < 9; k++) {
      var fase = k * 0.7, amp = .05 + energia * .14 + (k % 3) * .02, lobos = 2 + (k % 4);
      cx.beginPath();
      for (var i = 0; i <= 120; i++) {
        var a = i / 120 * Math.PI * 2;
        var r = R * (1 + amp * Math.sin(lobos * a + t * vel * (1 + k * .13) + fase) + amp * .5 * Math.cos((lobos + 1) * a - t * vel * .8 + fase));
        var x = mx + r * Math.cos(a + t * vel * .15 * (k % 2 ? 1 : -1)), y = my + r * Math.sin(a + t * vel * .15 * (k % 2 ? 1 : -1)) * (.92 + .08 * Math.sin(t + k));
        if (i) cx.lineTo(x, y); else cx.moveTo(x, y);
      }
      cx.strokeStyle = 'rgba(' + (k % 3 === 0 ? '255,120,120' : '227,52,60') + ',' + (.28 + energia * .3) + ')';
      cx.lineWidth = 1.2 + (k % 3) * .6;
      cx.shadowColor = 'rgba(227,52,60,.9)'; cx.shadowBlur = 14;
      cx.stroke();
    }
    cx.shadowBlur = 0;
    cx.globalCompositeOperation = 'source-over';
    anim = requestAnimationFrame(desenharEsfera);
  }

  /* voz do Box */
  var som = true;
  try { som = localStorage.getItem('box-som') !== '0'; } catch (e) {}
  function mostrarSom() { somBt.setAttribute('aria-pressed', som); somBt.textContent = som ? '🔊' : '🔇'; }
  mostrarSom();
  somBt.addEventListener('click', function () {
    som = !som; mostrarSom();
    try { localStorage.setItem('box-som', som ? '1' : '0'); } catch (e) {}
    if (!som) { pararFala(); estado('parado'); }
  });
  /* Voz do Box: masculina e natural quando o aparelho tiver. As vozes "Natural/Online" da Microsoft (Edge) são as melhores;
     depois as vozes masculinas comuns do Windows, Android e iPhone. Sem voz masculina, usa a voz em português que existir. */
  var MASC = ['Antonio', 'Donato', 'Fabio', 'Humberto', 'Julio', 'Nicolau', 'Valerio', 'Daniel', 'Felipe', 'Ricardo', 'Reed', 'Rocko'];
  var vozCache = null;
  function vozBox() {
    if (vozCache) return vozCache;
    var v = (window.speechSynthesis ? speechSynthesis.getVoices() : []).filter(function (x) { return /^pt(-|_)BR/i.test(x.lang) || /Brazil|Brasil/i.test(x.name); });
    if (!v.length) return null;
    function nota(x) {
      var masc = MASC.some(function (n) { return x.name.indexOf(n) > -1; }) || /male|masculin/i.test(x.name) && !/female|feminin/i.test(x.name);
      var natural = /Natural|Online|Neural|Premium|Enhanced|aprimorad/i.test(x.name);
      return (masc ? 10 : 0) + (natural ? 5 : 0) + (/Antonio/.test(x.name) ? 2 : 0);
    }
    vozCache = v.slice().sort(function (a, b) { return nota(b) - nota(a); })[0];
    return vozCache;
  }
  if (window.speechSynthesis) speechSynthesis.addEventListener('voiceschanged', function () { vozCache = null; });
  /* Voz natural (Azure, voz masculina Antonio), gerada no servidor (ação box_voz). Só para quem tem conta.
     Se o servidor não responder ou a cota do mês acabar, usa a voz do próprio aparelho. */
  var CEL = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var tocador = new Audio(), vozNaturalOff = false, falaN = 0;
  var SILENCIO = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV';
  var ctxAtual = null, fonteAtual = null;
  function soltarAudio() {
    try { tocador.pause(); } catch (e) {} /* não esvazia o tocador: no iPhone ele perderia a liberação do primeiro toque */
    try { if (fonteAtual) fonteAtual.stop(); } catch (e) {}
    try { if (ctxAtual) ctxAtual.close(); } catch (e) {}
    fonteAtual = null; ctxAtual = null;
  }
  function tocarNoCelular(blob, minha, fim, falhou) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !blob.arrayBuffer) return falhou();
    blob.arrayBuffer().then(function (buf) {
      if (minha !== falaN) return;
      var ctx = new AC(); ctxAtual = ctx;
      return ctx.decodeAudioData(buf).then(function (audio) {
        if (minha !== falaN) { ctx.close(); return; }
        var f = ctx.createBufferSource(); f.buffer = audio; f.connect(ctx.destination); fonteAtual = f;
        f.onended = function () { if (ctxAtual === ctx) { ctxAtual = null; fonteAtual = null; } try { ctx.close(); } catch (e) {} if (minha === falaN) fim(); };
        (ctx.state === 'suspended' ? ctx.resume() : Promise.resolve()).then(function () { estado('falando'); f.start(0); });
      });
    }).catch(function () { falhou(); });
  }
  function pararFala() { falaN++; soltarAudio(); if (window.speechSynthesis) speechSynthesis.cancel(); }
  function falar(t, depois) {
    if (!som) { estado('parado'); if (depois) depois(); return; }
    var sessao = null; try { sessao = localStorage.getItem('naveia-sessao'); } catch (e) {}
    if (vozNaturalOff || !sessao || !window.NAVEIA_SERVIDOR || !window.fetch) return falarAparelho(t, depois);
    var minha = ++falaN;
    if (window.speechSynthesis) speechSynthesis.cancel();
    fetch(window.NAVEIA_SERVIDOR + '?acao=box_voz', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Naveia': '1', Authorization: 'Bearer ' + sessao }, body: JSON.stringify({ texto: t.replace(/\bF1\b/g, 'Fórmula 1') }) })
      .then(function (r) { if (!r.ok) { if (r.status === 503 || r.status === 429) vozNaturalOff = true; throw 0; } return r.blob(); })
      .then(function (b) {
        if (minha !== falaN) return;
        var fimFala = function () { if (tela.getAttribute('data-estado') === 'falando') estado('parado', 'Toque no microfone para perguntar de novo'); if (depois) depois(); };
        /* tocador de áudio comum (liberado no primeiro toque): é o único que o iPhone deixa tocar depois de esperar a resposta */
        if (tocador.src && /^blob:/.test(tocador.src)) { try { URL.revokeObjectURL(tocador.src); } catch (e) {} }
        tocador.src = URL.createObjectURL(b);
        tocador.onplaying = function () { estado('falando'); };
        tocador.onended = tocador.onerror = function () { if (minha !== falaN) return; soltarAudio(); if (tela.getAttribute('data-estado') === 'falando') estado('parado', 'Toque no microfone para perguntar de novo'); if (depois) depois(); };
        var p = tocador.play(); if (p) p.catch(function () { if (minha === falaN) falarAparelho(t, depois); });
      })
      .catch(function () { if (minha === falaN) falarAparelho(t, depois); });
  }

  var vozLiberada = false;
  function liberarVoz() {
    if (vozLiberada || !window.speechSynthesis) return;
    try { var z = new SpeechSynthesisUtterance(' '); z.volume = 0; z.lang = 'pt-BR'; speechSynthesis.speak(z); vozLiberada = true; } catch (e) {}
    try { tocador.src = SILENCIO; var p = tocador.play(); if (p) p.catch(function () {}); } catch (e) {}
  }
  document.addEventListener('pointerdown', function (ev) { if (ev.target.closest && ev.target.closest('#box-bt, .box-tela, a[href="#box"]')) liberarVoz(); }, true);
  function falarAparelho(t, depois) {
    if (!som || !window.speechSynthesis) { estado('parado'); if (depois) depois(); return; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t.replace(/\bF1\b/g, 'Fórmula 1').replace(/(\d+)h(\d\d)/g, '$1 e $2').replace(/(\d+)h\b/g, '$1 horas'));
    u.lang = 'pt-BR';
    var vz = vozBox(); if (vz) u.voice = vz;
    /* velocidade por tipo de voz: as vozes naturais do Edge aceleram pouco; as do celular e do Chrome aceleram muito */
    var celular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    u.rate = celular ? 1 : vz && /Natural|Online|Neural/i.test(vz.name) ? 1.6 : 1.2;
    u.onstart = function () { estado('falando'); };
    try { speechSynthesis.resume(); } catch (e) {}
    u.onend = u.onerror = function () { if (tela.getAttribute('data-estado') === 'falando') estado('parado', 'Toque no microfone para perguntar de novo'); if (depois) depois(); };
    setTimeout(function () { speechSynthesis.speak(u); }, 90);
  }

  function perguntar(texto, porVoz) {
    texto = String(texto || '').trim(); if (!texto || bloqueado) return;
    sug.hidden = true;
    perguntaEl.textContent = '“' + texto + '”';
    respEl.innerHTML = '';
    estado('pensando', 'Pensando…');
    responder(texto).then(function (r) {
      var html = '<p>' + esc(r.t) + '</p>';
      if (r.botoes) html += '<div class="box-acoes">' + r.botoes.map(function (b, i) {
        return '<a class="box-acao' + (i ? ' box-acao-2' : '') + '" href="' + esc(b[1]) + '"' + (b[2] ? ' download="' + esc(b[2]) + '"' : '') + (/^https:/.test(b[1]) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(b[0]) + '</a>';
      }).join('') + '</div>';
      if (r.link) html += '<a class="box-link" href="' + esc(r.link[0]) + '">' + esc(r.link[1]) + ' →</a>';
      respEl.innerHTML = html;
      estado('parado');
      if (porVoz !== false) falar(r.t); else estado('parado', 'Toque no microfone para perguntar de novo');
    });
  }

  /* microfone: uma pergunta por vez */
  var rec = null, ouvindo = false;
  /* No celular o microfone precisa de um respiro: depois da voz do Box ou do "Box, box", o aparelho demora a liberar o áudio. */
  var tentou = 0;
  /* ---------- celular: grava a pergunta e o servidor transcreve (Whisper). Pede o microfone uma vez só por visita. ---------- */
  var GRAVA = CEL && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  var gravando = false, paraGravacao = null;
  function ouvirGravando() {
    if (gravando) { if (paraGravacao) paraGravacao(); return; }
    pararFala();
    var sessao = null; try { sessao = localStorage.getItem('naveia-sessao'); } catch (e) {}
    if (!sessao) { estado('parado', 'Entre na sua conta para falar com o Box.'); return; }
    gravando = true; mic.classList.add('ouvindo'); perguntaEl.textContent = ''; respEl.innerHTML = '';
    estado('ouvindo', 'Preparando o microfone…');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then(function (stream) {
      var tipo = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].filter(function (t) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t); })[0];
      var gr = tipo ? new MediaRecorder(stream, { mimeType: tipo }) : new MediaRecorder(stream), pedacos = [];
      var AC = window.AudioContext || window.webkitAudioContext, ctx = AC ? new AC() : null, an = null, dados = null;
      if (ctx) { an = ctx.createAnalyser(); an.fftSize = 1024; ctx.createMediaStreamSource(stream).connect(an); dados = new Uint8Array(an.fftSize); }
      var falou = false, ultimoSom = Date.now(), comeco = Date.now(), timer = null, acabou = false;
      function encerrar() {
        if (acabou) return; acabou = true; clearInterval(timer);
        try { if (gr.state !== 'inactive') gr.stop(); } catch (e) {}
      }
      paraGravacao = encerrar;
      gr.ondataavailable = function (e) { if (e.data && e.data.size) pedacos.push(e.data); };
      gr.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        try { if (ctx) ctx.close(); } catch (e) {}
        gravando = false; paraGravacao = null; mic.classList.remove('ouvindo');
        if (!falou && ctx) { estado('parado', 'Não ouvi nada. Toque no microfone e fale.'); return; }
        var audio = new Blob(pedacos, { type: gr.mimeType || tipo || 'audio/mp4' });
        estado('pensando', 'Entendendo…');
        fetch(window.NAVEIA_SERVIDOR + '?acao=box_ouvir', { method: 'POST', headers: { 'Content-Type': audio.type || 'application/octet-stream', 'X-Naveia': '1', Authorization: 'Bearer ' + sessao }, body: audio })
          .then(function (r) { return r.json(); })
          .then(function (r) {
            var t = r && r.ok ? String(r.texto || '').trim() : '';
            if (t) perguntar(t, true); else estado('parado', (r && r.erro) || 'Não entendi. Toque no microfone e fale de novo.');
          })
          .catch(function () { estado('parado', 'Sem conexão com o servidor. Tente de novo.'); });
      };
      gr.start(250);
      estado('ouvindo', 'Ouvindo… pode falar');
      /* para sozinho: 1,3 s de silêncio depois de falar, 6 s sem falar nada, ou 12 s no máximo */
      timer = setInterval(function () {
        var agora = Date.now();
        if (an) {
          an.getByteTimeDomainData(dados);
          var pico = 0; for (var i = 0; i < dados.length; i++) { var v = Math.abs(dados[i] - 128); if (v > pico) pico = v; }
          if (pico > 14) { falou = true; ultimoSom = agora; }
          if (falou && agora - ultimoSom > 1300) encerrar();
          if (!falou && agora - comeco > 6000) encerrar();
        } else if (agora - comeco > 6000) { falou = true; encerrar(); }
        if (agora - comeco > 12000) encerrar();
      }, 100);
    }).catch(function (e) {
      gravando = false; mic.classList.remove('ouvindo');
      estado('parado', e && e.name === 'NotAllowedError' ? 'Para falar com o Box, toque em "Permitir" quando o celular pedir o microfone. Ou digite a pergunta.' : 'Não consegui abrir o microfone. Ou digite a pergunta.');
    });
  }

  function ouvir(repetindo) {
    if (GRAVA) return ouvirGravando();
    if (!rec || ouvindo) return;
    if (!repetindo) tentou = 0;
    pararEspera();
    pararFala();
    var final = '', parcial = '', erroMic = '', inicio = 0;
    try { if (rec) rec.abort(); } catch (e) {}
    rec = new Rec(); rec.lang = 'pt-BR'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = function (ev) {
      final = ''; parcial = '';
      for (var i = 0; i < ev.results.length; i++) { if (ev.results[i].isFinal) final += ev.results[i][0].transcript; else parcial += ev.results[i][0].transcript; }
      perguntaEl.textContent = final || parcial;
    };
    rec.onend = function () {
      ouvindo = false; mic.classList.remove('ouvindo');
      var t = (final || parcial).trim();
      if (t) { perguntar(t, true); retomarEspera(); return; }
      /* fechou sozinho em menos de 1 segundo, sem erro: o aparelho ainda estava com o áudio preso. Tenta de novo uma vez. */
      if ((!erroMic && Date.now() - inicio < 1000 || /outro app/.test(erroMic)) && tentou < 3) { tentou++; soltarAudio(); setTimeout(function () { ouvir(true); }, 700 * tentou); return; }
      estado('parado', erroMic || 'Não ouvi nada. Toque no microfone e fale.');
      retomarEspera();
    };
    rec.onerror = function (ev) {
      var m = { 'not-allowed': 'Libere o microfone para este site nas configurações do navegador, ou digite a pergunta.', 'service-not-allowed': 'Este navegador não deixa usar o microfone aqui. Digite a pergunta.',
        'audio-capture': 'Não achei o microfone, ou outro app está usando. Feche outros apps e tente de novo.', 'network': 'Sem internet para entender a voz agora. Digite a pergunta.', 'no-speech': 'Não ouvi nada. Toque no microfone e fale mais perto do celular.' };
      if (m[ev.error]) erroMic = m[ev.error];
    };
    estado('ouvindo', 'Preparando o microfone…'); perguntaEl.textContent = ''; respEl.innerHTML = ''; mic.classList.add('ouvindo');
    setTimeout(function () {
      if (tela.hidden) { mic.classList.remove('ouvindo'); return; }
      try { rec.start(); ouvindo = true; inicio = Date.now(); estado('ouvindo', 'Ouvindo… pode falar'); }
      catch (e) { mic.classList.remove('ouvindo'); estado('parado', 'Toque no microfone e fale.'); }
    }, CEL ? 500 : 60);
  }
  if (GRAVA && mic) {
    mic.addEventListener('click', function () { ouvir(); });
  } else if (Rec && mic) {
    rec = new Rec(); rec.lang = 'pt-BR'; rec.interimResults = true; rec.maxAlternatives = 1;
    mic.addEventListener('click', function () { if (ouvindo) rec.stop(); else if (!mic.classList.contains('ouvindo')) ouvir(); });
  }

  /* O Box é para quem tem conta (grátis). Quem tem conta ganha uma saudação com o nome, conforme a hora do dia. */
  var bloqueado = false, saudou = false;
  function conta() {
    return (window.NAVEIA_EU || Promise.resolve({})).then(function (r) {
      if (r && r.logado && r.usuario) return r.usuario;
      if (r && r.semServidor && window.NAVEIA_PC) return { nome: 'Visitante' }; /* teste no computador, sem o servidor */
      return null;
    }).catch(function () { return null; });
  }
  function saudacao() { var h = new Date().getHours(); return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
  function travar() {
    bloqueado = true; tela.setAttribute('data-bloqueado', '1'); sug.hidden = true; perguntaEl.textContent = '';
    var volta = encodeURIComponent((location.pathname.split('/').pop() || 'index.html') + location.search);
    estado('parado', 'Exclusivo para quem tem conta');
    respEl.innerHTML = '<p>O Box é para quem tem conta no Na Veia. É grátis e leva menos de um minuto.</p>' +
      '<div class="box-acoes"><a class="box-acao" href="entrar.html?volta=' + volta + '#criar">Criar conta grátis</a><a class="box-acao box-acao-2" href="entrar.html?volta=' + volta + '">Já tenho conta</a></div>';
  }
  function abrir(jaOuvir) {
    tela.hidden = false; document.documentElement.classList.add('box-aberto');
    /* o botão "voltar" do celular fecha o Box em vez de sair da página */
    if (!(history.state && history.state.box)) { try { history.pushState({ box: 1 }, ''); } catch (e) {} }
    if (!anim) { t0 = performance.now(); anim = requestAnimationFrame(desenharEsfera); }
    conta().then(function (u) {
      if (!u) { travar(); return; }
      bloqueado = false; tela.removeAttribute('data-bloqueado');
      if (!saudou) {
        saudou = true;
        var nome = String(u.nome || '').trim().split(/\s+/)[0];
        var oi = saudacao() + (nome ? ', ' + nome : '') + '! Sou o Box. Em que posso ajudar?';
        perguntaEl.textContent = ''; respEl.innerHTML = '<p>' + esc(oi) + '</p>'; sug.hidden = false;
        estado('parado', '');
        falar(oi, function () { if (jaOuvir && (rec || GRAVA) && !tela.hidden) ouvir(); else estado('parado', Rec ? 'Toque no microfone e pergunte' : 'Digite sua pergunta'); });
        return;
      }
      if (!respEl.innerHTML) { estado('parado', Rec ? 'Toque no microfone e pergunte' : 'Digite sua pergunta'); sug.hidden = false; }
      if (jaOuvir && (rec || GRAVA)) setTimeout(ouvir, 250);
    });
  }
  function fechar() {
    if (history.state && history.state.box) { history.back(); return; } /* o popstate fecha */
    fecharDeVez();
  }
  window.addEventListener('popstate', function () { if (!tela.hidden) fecharDeVez(); });
  function fecharDeVez() {
    tela.hidden = true; document.documentElement.classList.remove('box-aberto');
    pararFala();
    if (ouvindo) rec.abort();
    retomarEspera();
  }
  bt.addEventListener('click', function () { abrir(true); });
  tela.querySelector('.box-fechar').addEventListener('click', fechar);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !tela.hidden) fechar(); });
  sug.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) perguntar(b.textContent, true); });
  tela.querySelector('.box-form').addEventListener('submit', function (ev) { ev.preventDefault(); var t = campo.value; campo.value = ''; perguntar(t, true); });

  /* "Box, box": escuta contínua, só se a pessoa ligar. Fica ouvindo só com o site aberto e na tela. */
  var espera = null, esperando = false, maosLigado = false;
  var ck = tela.querySelector('.box-maos-ck');
  try { maosLigado = localStorage.getItem('box-maos') === '1'; } catch (e) {}
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { maosLigado = false; var lbM = tela.querySelector('.box-maos'); if (lbM) lbM.remove(); }
  if (ck) ck.checked = maosLigado;
  function pararEspera() { if (espera && esperando) { esperando = false; try { espera.abort(); } catch (e) {} } bt.classList.remove('esperando'); }
  function retomarEspera() {
    if (!maosLigado || !Rec || document.hidden || ouvindo || esperando || !tela.hidden && ouvindo) return;
    if (!espera) {
      espera = new Rec(); espera.lang = 'pt-BR'; espera.continuous = true; espera.interimResults = true;
      espera.onresult = function (ev) {
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          if (/\bbox\W*box\b|\bboxbox\b|\bbox,? box\b/i.test(ev.results[i][0].transcript)) { pararEspera(); abrir(true); return; }
        }
      };
      espera.onend = function () { var era = esperando; esperando = false; if (era) setTimeout(retomarEspera, 400); };
      espera.onerror = function (ev) { if (ev.error === 'not-allowed') { maosLigado = false; if (ck) ck.checked = false; } };
    }
    try { espera.start(); esperando = true; bt.classList.add('esperando'); } catch (e) {}
  }
  if (ck) ck.addEventListener('change', function () {
    maosLigado = ck.checked;
    try { localStorage.setItem('box-maos', maosLigado ? '1' : '0'); } catch (e) {}
    if (maosLigado) retomarEspera(); else pararEspera();
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pararEspera(); else retomarEspera(); });
  if (maosLigado) setTimeout(retomarEspera, 1500);

  /* qualquer link para #box (menu do topo, chamada da página inicial) abre o Box */
  document.addEventListener('click', function (ev) { var l = ev.target.closest && ev.target.closest('a[href="#box"]'); if (l) { ev.preventDefault(); abrir(true); } });
  window.BOX_PERGUNTAR = perguntar; /* usado nos testes */
  window.BOX_ABRIR = abrir;
})();
