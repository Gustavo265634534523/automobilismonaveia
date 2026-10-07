/* Páginas para o Google: "horário e onde assistir" de cada corrida, mais a página central horarios.html.
   O texto vai pronto dentro do HTML (o Google lê sem esperar o JavaScript).
   Lê assets/js/dados.js e assets/js/onde-assistir-dados.js. Roda no GitHub junto com a agenda (.github/workflows/agenda.yml)
   e também no PC: node .github/paginas-horarios.js
   Páginas de corridas antigas não são apagadas: continuam no ar mostrando o resultado. */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const SITE = 'https://automobilismonaveia.com.br/';
global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/onde-assistir-dados.js'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
window.esc = esc;
const O = window.ONDE_ASSISTIR, CATS = window.CATEGORIAS;
/* mesma versão (?v=) das outras páginas, lida do sw.js */
const V = (fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8').match(/naveia-v(\d+)/) || [])[1] || '1';
const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
const DESDE = '2026-09-01';

const CURTO = { 'formula-1': 'F1', 'formula-2': 'F2', 'formula-3': 'F3', 'endurance': 'WEC', 'rally': 'WRC' };
const curto = c => CURTO[c.slug] || c.menu || c.nome;
const slugTexto = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/* o mesmo nome é montado em assets/js/categoria.js (link da próxima etapa) */
const arquivo = (c, e) => 'horario-' + c.slug + '-' + slugTexto(e.n) + '-' + e.d.slice(0, 4) + '.html';
const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'], SEMLONGO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESLONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dia = iso => new Date(iso + 'T12:00:00Z').getUTCDay();
const dataCurta = iso => SEM[dia(iso)] + ', ' + iso.slice(8) + '/' + iso.slice(5, 7);
const dataLonga = iso => SEMLONGO[dia(iso)] + ', ' + (+iso.slice(8)) + ' de ' + MESLONGO[+iso.slice(5, 7) - 1];
const hora = h => h ? h.replace(':00', 'h').replace(':', 'h') : 'a confirmar';
const principal = e => (e.s || []).filter(s => /Corrida|Principal/i.test(s.t)).slice(-1)[0] || (e.s || []).slice(-1)[0];

const BTN = (cat, rotulo) => `<button type="button" class="alerta-bt" data-alerta="${cat}" data-rotulo="${rotulo}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 20.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span class="alerta-txt">${rotulo}</span></button>`;
const CSS = `<style>
.hr-pag { padding: calc(var(--topo) + 34px) 0 70px; }
.hr-pag .moldura { max-width: 980px; }
.hr-trilha { font-size: 14px; color: var(--aco); margin: 0 0 12px; }
.hr-trilha a { color: var(--aco); }
.hr-rot { margin: 0 0 6px; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--sangue-vivo); }
.hr-pag h1 { margin: 0 0 12px; font-family: var(--display); font-weight: 400; font-size: clamp(30px, 4.6vw, 52px); line-height: 1.06; }
.hr-lead { margin: 0 0 22px; font-size: 18px; color: #c3c8cd; max-width: 820px; }
.hr-pag h2 { margin: 30px 0 12px; font-size: 22px; }
.hr-status { display: inline-block; margin: 0 0 22px; padding: 8px 14px; background: var(--carbono); border: 1px solid var(--linha); border-left: 4px solid var(--sangue-vivo); font-weight: 700; }
.hr-tab { width: 100%; border-collapse: collapse; background: var(--carbono); border: 1px solid var(--linha); }
.hr-tab th, .hr-tab td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--linha); font-size: 16px; }
.hr-tab th { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--aco); }
.hr-tab td:last-child { font-weight: 800; white-space: nowrap; }
.hr-tab tr.hr-corrida td { background: rgba(227,52,60,.12); color: #fff; }
.hr-nota { font-size: 14px; color: var(--aco); margin: 10px 0 0; }
.hr-camp { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.hr-camp li { display: flex; gap: 12px; padding: 10px 14px; background: var(--carbono); border: 1px solid var(--linha); }
.hr-camp b { min-width: 28px; color: var(--sangue-vivo); }
.hr-camp span:last-child { margin-left: auto; color: var(--aco); }
.hr-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
.hr-links a { padding: 10px 14px; border: 1px solid var(--linha); color: var(--cromo); text-decoration: none; font-weight: 600; }
.hr-links a:hover { border-color: var(--sangue-vivo); }
.hr-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }
.hr-card { display: block; padding: 16px; background: var(--carbono); border: 1px solid var(--linha); border-bottom: 3px solid var(--sangue-vivo); color: var(--cromo); text-decoration: none; }
.hr-card:hover { border-color: var(--sangue-vivo); }
.hr-card small { display: block; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--sangue-vivo); }
.hr-card b { display: block; margin: 4px 0 8px; font-size: 20px; }
.hr-card p { margin: 3px 0; font-size: 15px; color: #c3c8cd; }
.hr-card em { font-style: normal; font-weight: 800; color: #fff; }
.hr-alerta { margin: 0 0 22px; }
.hr-dia { margin: 30px 0 12px; font-size: 15px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--aco); }
</style>`;

function pagina(o) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="assets/js/idioma.js?v=${V}"></script>
<title>${esc(o.titulo)}</title>
<meta name="description" content="${esc(o.desc)}">
<meta name="theme-color" content="#141619">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="assets/app/apple-touch-icon.png">
<meta property="og:title" content="${esc(o.titulo)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:image" content="${SITE}${esc(o.foto || 'assets/img/compartilhar.jpg')}">
<link rel="canonical" href="${SITE}${o.arq}">
<meta property="og:url" content="${SITE}${o.arq}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Automobilismo Na Veia">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23141619'/%3E%3Cpath d='M9 26L15 6h5l-6 20z' fill='%23b0121b'/%3E%3Cpath d='M17 26l6-20h4l-6 20z' fill='%23e4e7ea'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Exo+2:wght@700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/estilo.css?v=${V}">
${CSS}
${o.ld ? '<script type="application/ld+json">' + JSON.stringify(o.ld).replace(/</g, '\\u003c') + '</script>' : ''}
</head>
<body data-pagina="horarios">
<a class="pular" href="#hr">Pular para o conteúdo</a>
<header id="topo"></header>
<main class="hr-pag" id="hr">
  <div class="moldura">
${o.corpo}
  </div>
</main>
<footer id="rodape"></footer>
<script src="assets/js/dados.js?v=${V}"></script>
<script src="assets/js/site.js?v=${V}"></script>
</body>
</html>
`;
}

function canais(slug) {
  const d = O.cats[slug];
  if (!d) return '<p>Ainda sem transmissão confirmada no Brasil.</p>';
  return O.quadro(slug) || '';
}

/* ---------- página de cada corrida ---------- */
const feitas = [];
CATS.forEach(c => {
  const total = c.calendario.length;
  c.calendario.forEach(e => {
    if (!e.d || e.d < DESDE) return;
    const arq = arquivo(c, e), ano = e.d.slice(0, 4), cc = curto(c), p = principal(e);
    const titulo = `${e.n} ${ano} (${cc}): horário e onde assistir | Na Veia`;
    const quandoTxt = dataLonga(e.d) + (p && p.h ? ', às ' + hora(p.h) : '');
    const desc = e.venc
      ? `${e.n} ${ano} da ${c.nome}: vencedor ${e.venc}. Horários de todas as sessões (Brasília) e onde assistir no Brasil.`
      : `Que horas é o ${e.n} ${ano} da ${c.nome}? ${p && p.h ? 'Corrida ' + quandoTxt + ' (Brasília)' : 'Data: ' + dataLonga(e.d)}. Horários de todas as sessões e onde assistir: ${(O.cats[c.slug] || { canais: [] }).canais.slice(0, 3).map(x => x[0]).join(', ')}.`;
    const sessoes = (e.s || []).length
      ? '<table class="hr-tab"><thead><tr><th scope="col">Dia</th><th scope="col">Sessão</th><th scope="col">Horário (Brasília)</th></tr></thead><tbody>' +
        e.s.map(s => `<tr${s === p ? ' class="hr-corrida"' : ''}><td>${esc(dataCurta(s.d))}</td><td>${esc(s.t)}</td><td>${esc(hora(s.h))}</td></tr>`).join('') + '</tbody></table>'
      : `<p class="hr-status">Data: ${esc(dataLonga(e.d))}. Os horários das sessões saem na semana da corrida e aparecem aqui assim que forem confirmados.</p>`;
    const top = (c.classificacao && c.classificacao.linhas || []).slice(0, 5);
    const camp = top.length ? `<h2>Como está o campeonato</h2><ul class="hr-camp">${top.map(l => `<li><b>${esc(l[0])}º</b><span>${esc(l[1])}</span><span>${esc(l[l.length - 1])} pts</span></li>`).join('')}</ul>` : '';
    const status = e.venc ? `<p class="hr-status">Encerrada. Vencedor: ${esc(e.venc)}</p>` : '';
    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'SportsEvent', name: `${e.n} ${ano} - ${c.nome}`, sport: 'Automobilismo',
        startDate: p && p.h ? `${p.d}T${p.h}:00-03:00` : e.d, eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: e.l || e.n, address: e.l || e.n },
        description: desc, image: SITE + c.foto, url: SITE + arq },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Horários das corridas', item: SITE + 'horarios.html' },
        { '@type': 'ListItem', position: 2, name: c.nome, item: SITE + c.slug + '.html' },
        { '@type': 'ListItem', position: 3, name: e.n, item: SITE + arq }] }] };
    const corpo = `    <nav class="hr-trilha" aria-label="Você está em"><a href="horarios.html">Horários das corridas</a> / <a href="${c.slug}.html">${esc(c.nome)}</a> / ${esc(e.n)}</nav>
    <p class="hr-rot">${esc(c.nome)} · etapa ${e.e} de ${total}${e.l ? ' · ' + esc(e.l) : ''}</p>
    <h1>${esc(e.n)} ${ano}: horário e onde assistir</h1>
    <p class="hr-lead">${e.venc ? `O ${esc(e.n)} ${ano} já aconteceu. Veja o resultado, os horários que foram usados e onde passou no Brasil.` : p && p.h ? `A corrida é ${esc(quandoTxt)}, no horário de Brasília. Abaixo, todas as sessões do fim de semana e os canais que transmitem no Brasil.` : `A etapa está marcada para ${esc(dataLonga(e.d))}. Abaixo, onde assistir no Brasil.`}${e.nota ? ' ' + esc(e.nota.charAt(0).toUpperCase() + e.nota.slice(1)) + '.' : ''}</p>
    ${status}
    ${e.venc ? '' : '<p class="hr-alerta">' + BTN(c.slug, 'Avisar 30 min antes da largada') + '</p>'}
    <h2>Horários de todas as sessões</h2>
    ${sessoes}
    <p class="hr-nota">Horários de Brasília. Podem mudar por decisão da organização; esta página é atualizada todo dia.</p>
    <section class="oa-bloco" style="margin-top:30px"><h2 style="margin-top:0">Onde assistir no Brasil</h2>${canais(c.slug)}</section>
    ${camp}
    <div class="hr-links"><a href="${c.slug}.html#calendario">Calendário completo da ${esc(cc)}</a><a href="horarios.html">Horários de todas as categorias</a><a href="onde-assistir.html">Onde assistir cada categoria</a></div>`;
    fs.writeFileSync(path.join(RAIZ, arq), pagina({ arq, titulo, desc, corpo, ld, foto: c.foto }));
    feitas.push({ arq, c, e, p });
  });
});

/* ---------- página central: corridas dos próximos 14 dias e as seguintes ---------- */
const limite = new Date(Date.parse(hoje + 'T12:00:00Z') + 14 * 864e5).toISOString().slice(0, 10);
const proximas = feitas.filter(f => !f.e.venc && f.e.d >= hoje).sort((a, b) => a.e.d < b.e.d ? -1 : a.e.d > b.e.d ? 1 : 0);
const cartao = f => {
  const ss = (f.e.s || []).filter(s => /Corrida|Sprint|Principal|Classifica/i.test(s.t));
  const can = (O.cats[f.c.slug] || { canais: [] }).canais.slice(0, 3).map(x => x[0]).join(', ');
  return `<a class="hr-card" href="${f.arq}"><small>${esc(f.c.nome)}</small><b>${esc(f.e.n)}</b>` +
    (ss.length ? ss.map(s => `<p>${esc(s.t)}: <em>${esc(dataCurta(s.d))}, ${esc(hora(s.h))}</em></p>`).join('') : `<p>${esc(dataLonga(f.e.d))} · horários a confirmar</p>`) +
    (can ? `<p>📺 ${esc(can)}</p>` : '') + '</a>';
};
const porDia = {};
proximas.filter(f => f.e.d <= limite).forEach(f => { (porDia[f.e.d] = porDia[f.e.d] || []).push(f); });
const semana = Object.keys(porDia).sort().map(d => `<h2 class="hr-dia">${esc(dataLonga(d))}</h2><div class="hr-cards">${porDia[d].map(cartao).join('')}</div>`).join('');
const depois = proximas.filter(f => f.e.d > limite);
const corpoCentral = `    <p class="hr-rot">Agenda · horário de Brasília</p>
    <h1>Horário das corridas de hoje e do fim de semana</h1>
    <p class="hr-alerta">${BTN('*', 'Avisar 30 min antes de todas as largadas')}</p>
    <p class="hr-lead">Que horas é a corrida? Aqui estão os horários de Brasília de F1, MotoGP, Stock Car, NASCAR, IndyCar, WEC, DTM e mais categorias, com o canal que transmite no Brasil. Toque na corrida para ver todas as sessões.</p>
    ${semana || '<p>Sem corridas nos próximos 14 dias.</p>'}
    ${depois.length ? `<h2 class="hr-dia">Próximas etapas</h2><div class="hr-cards">${depois.slice(0, 30).map(cartao).join('')}</div>` : ''}
    <p class="hr-nota" style="margin-top:24px">Atualizado em ${esc(dataLonga(hoje))} de ${hoje.slice(0, 4)}. Os horários podem mudar por decisão da organização.</p>
    <div class="hr-links"><a href="onde-assistir.html">Onde assistir cada categoria</a><a href="noticias.html">Notícias</a><a href="guia.html">Guia para iniciantes</a></div>`;
fs.writeFileSync(path.join(RAIZ, 'horarios.html'), pagina({
  arq: 'horarios.html',
  titulo: 'Horário das corridas hoje: F1, MotoGP, Stock Car e mais | Na Veia',
  desc: 'Que horas é a corrida hoje? Horários de Brasília de F1, MotoGP, Stock Car, NASCAR, IndyCar, WEC e mais, com onde assistir no Brasil. Atualizado todo dia.',
  corpo: corpoCentral
}));

/* ---------- sitemap: troca o bloco das páginas de horário ---------- */
const SM = path.join(RAIZ, 'sitemap.xml');
const todas = fs.readdirSync(RAIZ).filter(a => /^horario-.*\.html$/.test(a)).sort();
let xml = fs.readFileSync(SM, 'utf8').replace(/\s*<url><loc>[^<]*\/horarios?[^<]*<\/loc>.*?<\/url>/g, '');
const bloco = [`  <url><loc>${SITE}horarios.html</loc><lastmod>${hoje}</lastmod><priority>0.9</priority></url>`]
  .concat(todas.map(a => `  <url><loc>${SITE}${a}</loc><lastmod>${hoje}</lastmod></url>`)).join('\n');
xml = xml.replace('</urlset>', bloco + '\n</urlset>');
fs.writeFileSync(SM, xml);
console.log('páginas de horário:', feitas.length, '| próximas 14 dias:', Object.values(porDia).flat().length);
