/* Dados do widget / papel de parede (Wallpaper Engine, Scriptable no iPhone, KWGT no Android): assets/dados/widget.json.
   F1 (na raiz, como antes) + MotoGP e Stock Car (em "categorias"): próxima etapa com os horários de Brasília e a localização
   (para a previsão do tempo), pódio da última corrida, classificação completa (piloto favorito) e as últimas notícias do site.
   Lê assets/js/dados.js, circuitos.js, previa-pistas.js, locais-pistas.js, noticias-gerais.js, assets/dados/raiox-f1.js,
   raiox-motogp.js e pista-proxima.js. Roda no GitHub (agenda.yml e f1-pos-corrida.yml) e no PC: node .github/widget-dados.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
global.window = {};
['assets/js/dados.js', 'assets/js/circuitos.js', 'assets/js/previa-pistas.js', 'assets/js/locais-pistas.js', 'assets/js/noticias-gerais.js',
  'assets/dados/raiox-f1.js', 'assets/dados/raiox-motogp.js'].forEach(f => {
  try { eval(fs.readFileSync(path.join(RAIZ, f), 'utf8')); } catch (e) { console.log('sem', f); }
});
const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
const CURTO = { 'Treino livre 1': 'TL1', 'Treino livre 2': 'TL2', 'Treino livre 3': 'TL3', 'Classificação sprint': 'Quali sprint', 'Sprint': 'Sprint', 'Classificação': 'Quali', 'Classificação Q1': 'Quali Q1', 'Classificação Q2': 'Quali Q2', 'Corrida': 'Corrida', 'Corrida 1': 'Corrida 1', 'Corrida 2': 'Corrida 2', 'Treino': 'Treino' };
const SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
/* cores das equipes da MotoGP e da Stock Car (sem logo; só a cor para os marcadores) */
const CORES_FIXAS = { Ducati: '#c8102e', Aprilia: '#3f4fa3', KTM: '#ff6600', Honda: '#d6001c', Yamaha: '#2a52be', Gresini: '#59c4e8', VR46: '#f2d00a', Pramac: '#8a2be2', Trackhouse: '#1f6fd1', Tech3: '#ff6600', LCR: '#d6001c',
  Eurofarma: '#f2c500', AMattheis: '#1f6fd1', 'Full Time': '#e3343c', TMG: '#2fb36b', Cavaleiro: '#ff6600', Blau: '#3fa9f5', Ipiranga: '#f2c500', KTF: '#8e979f', 'Pole Motorsport': '#e3343c', Crown: '#cfd5db' };
const corFixa = eq => { const k = Object.keys(CORES_FIXAS).find(k => String(eq || '').indexOf(k) > -1); return k ? CORES_FIXAS[k] : '#8e979f'; };
const semAcento = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const sigla3 = nome => { const p = String(nome).split(' '); return semAcento(p[p.length - 1] || '').slice(0, 3).toUpperCase(); };
/* MotoGP e Stock Car: sobrenome inteiro (as siglas de 3 letras se repetem, ex.: Márquez e Martín) */
const sobrenome = nome => { const p = String(nome).split(' e ')[0].split(' '); return (p[p.length - 1] || '').toUpperCase(); };
const loc = (slug, e) => { const L = window.LOCAIS_PISTAS || {}, P = window.PREVIA_PISTAS || {}; const x = L[slug + '|' + e.n] || L[e.l] || P[e.l]; return x ? { lat: x.lat, lon: x.lon } : null; };

function categoria(slug, extra) {
  const c = window.CATEGORIAS.find(x => x.slug === slug);
  if (!c) return null;
  const e = c.calendario.find(x => !x.venc && x.d && x.d >= hoje);
  const corDe = extra.cor || corFixa;
  const siglaDe = extra.sigla || sobrenome;
  let proxima = null;
  if (e) {
    const datas = (e.s || []).map(s => s.d).concat(e.d).sort();
    const corrida = (e.s || []).filter(s => /Corrida|Principal/.test(s.t)).slice(-1)[0];
    proxima = {
      categoria: c.nome, etapa: e.e, total: c.calendario.length, n: e.n, local: e.l, inicio: datas[0], fim: datas[datas.length - 1],
      sessoes: (e.s || []).map(s => ({ t: s.t, curto: CURTO[s.t] || s.t, dia: SEM[new Date(s.d + 'T12:00:00Z').getUTCDay()], d: s.d, h: s.h, iso: s.d + 'T' + s.h + ':00-03:00' })),
      corrida: corrida ? { d: corrida.d, h: corrida.h, iso: corrida.d + 'T' + corrida.h + ':00-03:00' } : { d: e.d, h: null, iso: null },
      coord: loc(slug, e)
    };
    if (extra.proxima) Object.assign(proxima, extra.proxima(e));
  }
  const linhas = c.classificacao.linhas;
  const lider = +linhas[0][linhas[0].length - 1];
  const pilotos = linhas.map(l => ({ pos: +l[0], nome: l[1], sigla: siglaDe(l[1]), equipe: l.length > 3 ? l[2] : '', cor: corDe(l.length > 3 ? l[2] : ''), pts: +l[l.length - 1], dif: lider - +l[l.length - 1],
    ult: extra.ultimoResultado ? extra.ultimoResultado(l[1]) : null }));
  const equipes = (c.classificacao.extra ? c.classificacao.extra.linhas : []).slice(0, 5).map(l => ({ pos: +l[0], nome: l[1], cor: corDe(l[1]), pts: +l[l.length - 1] }));
  let ultima = extra.ultima ? extra.ultima() : null;
  const ultimaEtapa = c.calendario.filter(x => x.venc).slice(-1)[0];
  if (!ultima && ultimaEtapa) ultima = { n: ultimaEtapa.n, local: ultimaEtapa.l, d: ultimaEtapa.d, vencedor: ultimaEtapa.venc, podio: [] };
  /* últimos vencedores da categoria (mais recentes primeiro) */
  const vencedores = c.calendario.filter(x => x.venc && x.d).slice(-6).reverse().map(x => ({ n: x.n, d: x.d, venc: x.venc }));
  return { proxima, ultima, pilotos, equipes, vencedores };
}

/* F1: cores e siglas da OpenF1 (Raio-x), pódio do Raio-x, último resultado de cada piloto */
const R = window.RAIOX || null;
const corEquipe = {}, siglaPorNome = {}, finalPorNome = {};
if (R) R.pilotos.forEach(p => { corEquipe[p.equipe] = p.cor; siglaPorNome[p.nome] = p.sigla; finalPorNome[p.nome] = p.abandono ? 'Abandonou' : (p.final ? 'P' + p.final : '—'); });
const corF1 = eq => corEquipe[eq] || Object.keys(corEquipe).filter(k => k.indexOf(eq) === 0 || eq.indexOf(k) === 0).map(k => corEquipe[k])[0] || '#8e979f';
const f1 = categoria('formula-1', {
  cor: corF1, sigla: n => siglaPorNome[n] || sigla3(n),
  ultimoResultado: n => finalPorNome[n] ? { gp: R.titulo, res: finalPorNome[n] } : null,
  ultima: () => R ? { n: R.titulo, local: R.local, d: R.data, podio: R.pilotos.filter(p => p.final && p.final <= 3).sort((a, b) => a.final - b.final).map(p => ({ pos: p.final, sigla: p.sigla, nome: p.nome, equipe: p.equipe, cor: p.cor })) } : null,
  proxima: e => {
    const pista = (window.PREVIA_PISTAS || {})[e.l] || {};
    const circ = pista.circuito && (window.CIRCUITOS || []).find(c => c.nome === pista.circuito);
    return { pista: circ ? circ.d : null, km: pista.km || null, voltas: pista.voltas || null };
  }
});
/* mapa com curvas e setores (.github/pista-proxima.js), se for da mesma etapa */
try {
  const mapa = JSON.parse(fs.readFileSync(path.join(RAIZ, 'assets/dados/pista-proxima.json'), 'utf8'));
  if (f1.proxima && mapa.etapa === f1.proxima.n) f1.proxima.mapa = { circuito: mapa.circuito, d: mapa.d, setores: mapa.setores, largada: mapa.largada, curvas: mapa.curvas, fonteSetores: mapa.fonteSetores, volta: mapa.volta, clima: mapa.clima, pit: mapa.pit };
  if (f1.proxima && mapa.etapa === f1.proxima.n && mapa.ultimaSessao) f1.proxima.ultimaSessao = mapa.ultimaSessao;
} catch (e) {}

/* MotoGP: pódio e último resultado do Raio-x da MotoGP */
const RM = window.RAIOX_MOTOGP || null;
const igual = (a, b) => semAcento(a).toLowerCase() === semAcento(b).toLowerCase();
const motogp = categoria('motogp', {
  ultimoResultado: n => { if (!RM) return null; const p = RM.pilotos.find(x => igual(x.nome, n)); return p ? { gp: 'última corrida', res: p.pos ? 'P' + p.pos : 'Abandonou' } : null; },
  ultima: () => {
    if (!RM) return null;
    const cat = window.CATEGORIAS.find(x => x.slug === 'motogp'), etapa = cat.calendario.find(x => x.d === RM.data);
    return { n: etapa ? etapa.n : RM.gp, local: etapa ? etapa.l : RM.circuito, d: RM.data, podio: RM.pilotos.filter(p => p.pos && p.pos <= 3).sort((a, b) => a.pos - b.pos).map(p => ({ pos: p.pos, sigla: sobrenome(p.nome), nome: p.nome, equipe: p.moto || p.equipe, cor: corFixa(p.equipe) })) };
  }
});
const stock = categoria('stock-car', {});

/* últimas notícias do site (faixa de notícias) */
const NOMES = {}; window.CATEGORIAS.forEach(c => { NOMES[c.slug] = c.menu || c.nome; });
const noticias = (window.NOTICIAS_GERAIS || []).slice().sort((a, b) => a.d < b.d ? 1 : -1).slice(0, 12).map(n => ({ cat: NOMES[n.cat] || '', t: n.t, d: n.d }));

/* agenda da semana: todas as sessões de hoje até daqui a 7 dias, de todas as categorias (horário de Brasília) */
const ate = new Date(Date.parse(hoje + 'T12:00:00Z') + 7 * 864e5).toISOString().slice(0, 10);
const agenda = [];
window.CATEGORIAS.forEach(c => c.calendario.forEach(e => {
  if (e.venc) return;
  (e.s || []).forEach(s => { if (s.d && s.h && s.d >= hoje && s.d <= ate) agenda.push({ cat: c.menu || c.nome, slug: c.slug, etapa: e.n, t: CURTO[s.t] || s.t, d: s.d, h: s.h, iso: s.d + 'T' + s.h + ':00-03:00' }); });
  if (!(e.s || []).length && e.d && e.d >= hoje && e.d <= ate) agenda.push({ cat: c.menu || c.nome, slug: c.slug, etapa: e.n, t: 'Etapa', d: e.d, h: null, iso: e.d + 'T12:00:00-03:00' });
}));
agenda.sort((a, b) => a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0);
/* vencedores mais recentes de todas as categorias */
const vencedoresTodas = [];
window.CATEGORIAS.forEach(c => c.calendario.forEach(e => { if (e.venc && e.d) vencedoresTodas.push({ cat: c.menu || c.nome, n: e.n, d: e.d, venc: e.venc }); }));
vencedoresTodas.sort((a, b) => a.d < b.d ? 1 : a.d > b.d ? -1 : 0);
const saida = Object.assign({ atualizado: new Date().toISOString(), site: 'https://automobilismonaveia.com.br/' }, f1, {
  categorias: { 'motogp': motogp, 'stock-car': stock },
  noticias, agenda, vencedoresTodas: vencedoresTodas.slice(0, 10)
});
fs.writeFileSync(path.join(RAIZ, 'assets/dados/widget.json'), JSON.stringify(saida));
console.log('widget.json:', f1.proxima ? f1.proxima.n : 'sem próxima', '| MotoGP:', motogp && motogp.proxima ? motogp.proxima.n : '-', '| Stock:', stock && stock.proxima ? stock.proxima.n : '-', '|', noticias.length, 'notícias');
