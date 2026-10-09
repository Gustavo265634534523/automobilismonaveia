/* Dados do widget / papel de parede (Wallpaper Engine, Scriptable no iPhone, KWGT no Android): assets/dados/widget.json.
   Próxima etapa da F1 com os horários de Brasília, pódio da última corrida e o topo do campeonato.
   Lê assets/js/dados.js, circuitos.js, previa-pistas.js e assets/dados/raiox-f1.js.
   Roda no GitHub (agenda.yml e f1-pos-corrida.yml) e no PC: node .github/widget-dados.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
global.window = {};
['assets/js/dados.js', 'assets/js/circuitos.js', 'assets/js/previa-pistas.js', 'assets/dados/raiox-f1.js'].forEach(f => {
  try { eval(fs.readFileSync(path.join(RAIZ, f), 'utf8')); } catch (e) { console.log('sem', f); }
});
const f1 = window.CATEGORIAS.find(c => c.slug === 'formula-1');
const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
const CURTO = { 'Treino livre 1': 'TL1', 'Treino livre 2': 'TL2', 'Treino livre 3': 'TL3', 'Classificação sprint': 'Quali sprint', 'Sprint': 'Sprint', 'Classificação': 'Quali', 'Corrida': 'Corrida' };
const SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const R = window.RAIOX || null;
const corEquipe = {};
const siglaDe = {};
if (R) R.pilotos.forEach(p => { corEquipe[p.equipe] = p.cor; siglaDe[p.nome] = p.sigla; });
/* nomes das equipes em dados.js x OpenF1 (Red Bull, Racing Bulls...) */
const cor = eq => corEquipe[eq] || Object.keys(corEquipe).filter(k => k.indexOf(eq) === 0 || eq.indexOf(k) === 0).map(k => corEquipe[k])[0] || '#8e979f';

/* próxima etapa: a primeira sem vencedor que ainda não acabou */
const e = f1.calendario.find(x => !x.venc && x.d && x.d >= hoje);
let proxima = null;
if (e) {
  const pista = (window.PREVIA_PISTAS || {})[e.l] || {};
  const circ = pista.circuito && (window.CIRCUITOS || []).find(c => c.nome === pista.circuito);
  const datas = (e.s || []).map(s => s.d).concat(e.d).sort();
  proxima = {
    categoria: f1.nome, etapa: e.e, total: f1.calendario.length, n: e.n, local: e.l, inicio: datas[0], fim: datas[datas.length - 1],
    sessoes: (e.s || []).map(s => ({ t: s.t, curto: CURTO[s.t] || s.t, dia: SEM[new Date(s.d + 'T12:00:00Z').getUTCDay()], d: s.d, h: s.h, iso: s.d + 'T' + s.h + ':00-03:00' })),
    pista: circ ? circ.d : null,
    km: pista.km || null, voltas: pista.voltas || null
  };
}
/* última corrida: pódio do Raio-x (OpenF1) */
let ultima = null;
if (R) {
  ultima = { n: R.titulo, local: R.local, d: R.data, podio: R.pilotos.filter(p => p.final && p.final <= 3).sort((a, b) => a.final - b.final)
    .map(p => ({ pos: p.final, sigla: p.sigla, nome: p.nome, equipe: p.equipe, cor: p.cor })) };
}
const cl = f1.classificacao;
const pilotos = cl.linhas.slice(0, 5).map(l => ({ pos: +l[0], nome: l[1], sigla: siglaDe[l[1]] || l[1].split(' ').pop().slice(0, 3).toUpperCase(), equipe: l[2], cor: cor(l[2]), pts: +l[l.length - 1] }));
const equipes = (cl.extra ? cl.extra.linhas : []).slice(0, 5).map(l => ({ pos: +l[0], nome: l[1], cor: cor(l[1]), pts: +l[l.length - 1] }));
/* mapa com curvas e setores (.github/pista-proxima.js), se for da mesma etapa */
try {
  const mapa = JSON.parse(fs.readFileSync(path.join(RAIZ, 'assets/dados/pista-proxima.json'), 'utf8'));
  if (proxima && mapa.etapa === proxima.n) proxima.mapa = { circuito: mapa.circuito, d: mapa.d, setores: mapa.setores, largada: mapa.largada, curvas: mapa.curvas, fonteSetores: mapa.fonteSetores, volta: mapa.volta, clima: mapa.clima, pit: mapa.pit };
} catch (e) {}
const saida = { atualizado: new Date().toISOString(), site: 'https://automobilismonaveia.com.br/', proxima, ultima, pilotos, equipes };
fs.writeFileSync(path.join(RAIZ, 'assets/dados/widget.json'), JSON.stringify(saida));
console.log('widget.json:', proxima ? proxima.n : 'sem próxima', '|', ultima ? ultima.n : 'sem última', '|', pilotos.length, 'pilotos');
