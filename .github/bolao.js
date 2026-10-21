/* Bolão: grava assets/dados/bolao.json com
   - jogos: o que dá para palpitar agora (futebol e NBA dos próximos 7 dias e as duas próximas corridas da F1), cada um
     com a hora em que o palpite fecha (o começo do jogo; na F1, a classificação);
   - resultados: o resultado de cada jogo e corrida que já terminou (fica guardado 120 dias), com a hora em que fechou;
   - ranking: geral e por esporte, com os palpites que estão no servidor do bolão (servidor/bolao). Só conta palpite
     feito antes de fechar. Sem o servidor (variáveis BOLAO_URL e BOLAO_CHAVE), o ranking fica vazio.
   Regras dos pontos: assets/js/bolao-regras.js. Roda no GitHub junto com o placar (.github/workflows/placar.yml). */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/bolao.json');
const REGRAS = require(path.join(RAIZ, 'assets/js/bolao-regras.js'));

const w = {};
new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/ao-vivo.js'), 'utf8'))(w);
new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'))(w);
const AV = w.AO_VIVO || {};
const F1 = (w.CATEGORIAS || []).find(c => c.slug === 'formula-1') || {};
let RF1 = null; try { RF1 = JSON.parse(fs.readFileSync(path.join(RAIZ, 'assets/dados/resultados-f1.json'), 'utf8')); } catch (e) { /* sem resultado */ }
let antes = {}; try { antes = JSON.parse(fs.readFileSync(ARQ, 'utf8')); } catch (e) { /* primeira vez */ }

const NOMES = { brasileirao: 'Brasileirão', 'copa-do-brasil': 'Copa do Brasil', libertadores: 'Libertadores', 'sul-americana': 'Sul-Americana', 'champions-league': 'Champions',
  'premier-league': 'Premier League', 'la-liga': 'La Liga', 'serie-a': 'Serie A', bundesliga: 'Bundesliga', 'ligue-1': 'Ligue 1', nba: 'NBA' };
/* hora de Brasília (UTC-3) -> ISO */
const iso = (d, h) => new Date(Date.parse(d + 'T' + (h || '12:00') + ':00-03:00')).toISOString();
const agora = Date.now(), ate = agora + 7 * 864e5;

const jogos = [], resultados = Object.assign({}, antes.resultados || {});
for (const [slug, c] of Object.entries(AV.comps || {})) {
  const tipo = /^basketball/.test(c.liga) ? 'b' : 'f';
  for (const j of c.jogos || []) {
    if (!j.id || !j.d) continue;
    const chave = tipo + ':' + j.id, fecha = iso(j.d, j.h);
    if (j.p && !j.vivo) { resultados[chave] = [j.p, fecha, j.casa, j.fora]; continue; }
    if (j.adiado || !j.h) continue;
    const t = Date.parse(fecha);
    if (t > agora && t < ate) jogos.push({ chave, comp: slug, nome: NOMES[slug] || slug, d: j.d, h: j.h, casa: j.casa, fora: j.fora, fase: j.fase || '', fecha });
  }
}
jogos.sort((a, b) => a.fecha < b.fecha ? -1 : 1);

/* F1: as duas próximas corridas; fecha na classificação (sem horário, ao meio-dia da véspera) */
const ano = (F1.calendario || []).length ? String((F1.calendario[0].d || '').slice(0, 4)) : String(new Date().getUTCFullYear());
const pilotos = ((F1.classificacao || {}).linhas || []).map(l => l[1]);
let f1 = 0;
for (const e of F1.calendario || []) {
  if (e.venc || !e.d) continue;
  const q = (e.s || []).find(s => /^Classifica[çc][ãa]o$/.test(s.t));
  const fecha = q ? iso(q.d, q.h) : iso(new Date(Date.parse(e.d) - 864e5).toISOString().slice(0, 10), '12:00');
  if (Date.parse(fecha) <= agora || f1 >= 2) continue;
  jogos.push({ chave: '1:' + ano + '-' + e.e, comp: 'formula-1', nome: 'Fórmula 1', d: e.d, etapa: e.e, gp: e.n, local: e.l, fecha, pilotos });
  f1++;
}
/* resultado da última corrida (resultados-f1.json, robô .github/resultados-f1.js) */
if (RF1 && RF1.sessoes) {
  const e = (F1.calendario || []).find(x => x.d === RF1.data);
  const quali = RF1.sessoes.find(s => s.tipo === 'Qualifying'), corrida = RF1.sessoes.find(s => s.tipo === 'Race');
  if (e && quali && corrida && corrida.top.length >= 3) {
    const q = (e.s || []).find(s => /^Classifica[çc][ãa]o$/.test(s.t));
    resultados['1:' + ano + '-' + e.e] = [[quali.top[0].nome, corrida.top[0].nome, corrida.top[1].nome, corrida.top[2].nome].join('|'), q ? iso(q.d, q.h) : iso(e.d, '00:00'), e.n];
  }
}
/* resultados velhos saem */
for (const [k, r] of Object.entries(resultados)) if (agora - Date.parse(r[1]) > 120 * 864e5) delete resultados[k];

async function ranking() {
  const url = process.env.BOLAO_URL, chave = process.env.BOLAO_CHAVE;
  if (!url || !chave) return antes.ranking || null;
  let todos = null;
  try {
    const r = await fetch(url.replace(/\/?$/, '/') + '?acao=todos', { headers: { 'X-Chave': chave }, signal: AbortSignal.timeout(30000) });
    if (r.ok) todos = await r.json();
  } catch (e) { /* servidor fora do ar */ }
  if (!todos || !todos.usuarios) { console.log('bolão: servidor não respondeu; mantém o ranking anterior'); return antes.ranking || null; }
  const linhas = todos.usuarios.map(u => {
    const s = { geral: [0, 0, 0], futebol: [0, 0, 0], nba: [0, 0, 0], f1: [0, 0, 0] }; /* pontos, palpites com resultado, acertos em cheio */
    for (const [k, [v, t]] of Object.entries(u.p || {})) {
      const r = resultados[k];
      if (!r || Date.parse(t) > Date.parse(r[1])) continue; /* sem resultado ou feito depois de fechar */
      const pts = REGRAS.pontos(k, v, r[0]);
      if (pts == null) continue;
      const esp = k[0] === 'f' ? 'futebol' : k[0] === 'b' ? 'nba' : 'f1';
      const cheio = k[0] === 'f' ? pts === 10 : k[0] === 'b' ? pts === 8 : pts >= 15;
      for (const g of ['geral', esp]) { s[g][0] += pts; s[g][1]++; if (cheio) s[g][2]++; }
    }
    return { nome: u.nome, id: u.id, s };
  });
  const out = {};
  for (const g of ['geral', 'futebol', 'nba', 'f1']) {
    out[g] = linhas.filter(l => l.s[g][1]).sort((a, b) => b.s[g][0] - a.s[g][0] || b.s[g][2] - a.s[g][2] || a.s[g][1] - b.s[g][1]).slice(0, 100)
      .map(l => [l.nome, l.s[g][0], l.s[g][1], l.s[g][2], l.id]);
  }
  out.participantes = linhas.length;
  return out;
}

(async () => {
  const rk = await ranking();
  const dados = { jogos, resultados, ranking: rk, servidor: process.env.BOLAO_URL || antes.servidor || '' };
  const igual = JSON.stringify(dados) === JSON.stringify({ jogos: antes.jogos, resultados: antes.resultados, ranking: antes.ranking, servidor: antes.servidor });
  if (igual) { console.log('bolão: sem novidade'); return; }
  dados.atualizado = new Date().toISOString();
  fs.writeFileSync(ARQ, JSON.stringify(dados));
  console.log('bolão:', jogos.length, 'jogos abertos,', Object.keys(resultados).length, 'resultados,', rk ? rk.participantes + ' participantes' : 'sem ranking');
})();
