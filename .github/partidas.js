/* Lance a lance e escalações dos jogos de futebol (página partida.html): para cada jogo de ontem, de hoje e dos
   que começam nas próximas 3 horas, busca o resumo do jogo na ESPN e grava assets/dados/partidas/<id>.json com
   os lances (gols, cartões, substituições, pênaltis perdidos) e as escalações (formação, titulares e reservas).
   Jogo encerrado que já tem o arquivo final não é buscado de novo. Arquivos com mais de 10 dias são apagados.
   Roda no GitHub junto com o placar (.github/workflows/placar.yml) ou no PC: node .github/partidas.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'assets/dados/partidas');
const API = 'https://site.api.espn.com/apis/site/v2/sports/';

const w = {};
new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/ao-vivo.js'), 'utf8'))(w);
const AV = w.AO_VIVO || {}, IDS = AV.ids || {};
fs.mkdirSync(PASTA, { recursive: true });

async function pedir(u) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) ArenaSports/1.0' } });
      if (r.ok) return await r.json();
      if (r.status < 500) return null;
    } catch (e) { /* rede: tenta de novo */ }
  }
  return null;
}
const nomeTime = t => (t && (IDS['s' + t.id] || t.displayName || t.name)) || '';
const pessoa = a => (a && (a.displayName || a.shortName || a.fullName)) || '';

const tiposDesconhecidos = new Set();
/* lance da ESPN -> lance do site (tipo e texto em português) */
function lance(k) {
  const t = String((k.type && (k.type.type || k.type.text)) || '').toLowerCase(), txt = String((k.type && k.type.text) || '').toLowerCase();
  const p = (k.participants || []).map(x => pessoa(x.athlete)).filter(Boolean);
  let tipo = null, quem = p[0] || '', extra = '';
  if (/own/.test(t + txt)) { tipo = 'gol-contra'; }
  else if (/penalty.*(miss|saved)|(miss|saved).*penalty/.test(t + ' ' + txt)) { tipo = 'penalti-perdido'; }
  else if (k.scoringPlay || /goal/.test(t + txt)) { tipo = /penalty/.test(t + txt) ? 'gol-penalti' : 'gol'; if (p[1]) extra = p[1]; }
  else if (/red/.test(t + txt)) { tipo = 'vermelho'; }
  else if (/yellow/.test(t + txt)) { tipo = 'amarelo'; }
  else if (/sub/.test(t + txt)) { tipo = 'troca'; quem = p[0] || ''; extra = p[1] || ''; }
  else if (/halftime|half-time/.test(t + txt)) { tipo = 'intervalo'; }
  else if (/end|full ?time|final/.test(t + txt) && /end|final|full/.test(txt)) { tipo = 'fim'; }
  else if (/kickoff|start/.test(t + txt)) { tipo = 'inicio'; }
  if (!tipo) { tiposDesconhecidos.add(t + ' / ' + txt); return null; }
  return { min: (k.clock && k.clock.displayValue) || '', tipo, time: k.team ? nomeTime(k.team) : '', quem, extra };
}

/* escalação de um time */
function escalacao(r) {
  const atletas = (r.roster || []).map(a => ({
    n: pessoa(a.athlete), num: a.jersey || '', pos: (a.position && a.position.abbreviation) || '', lugar: +a.formationPlace || 0,
    titular: !!a.starter, entrou: !!a.subbedIn, saiu: !!a.subbedOut
  })).filter(a => a.n);
  return { time: nomeTime(r.team), formacao: r.formation || '', titulares: atletas.filter(a => a.titular).sort((a, b) => a.lugar - b.lugar), reservas: atletas.filter(a => !a.titular) };
}

(async () => {
  const agora = Date.now(), alvo = [];
  for (const [slug, c] of Object.entries(AV.comps || {})) {
    if (!/^soccer\//.test(c.liga || '')) continue;
    for (const j of c.jogos || []) {
      if (!j.id || !j.d) continue;
      const t = Date.parse(j.d + 'T' + (j.h || '12:00') + ':00-03:00');
      if (t > agora + 3 * 3600e3 || t < agora - 36 * 3600e3) continue;
      const arq = path.join(PASTA, j.id + '.json');
      if (j.p && fs.existsSync(arq)) { try { if (JSON.parse(fs.readFileSync(arq, 'utf8')).fim) continue; } catch (e) { /* refaz */ } }
      alvo.push({ slug, liga: c.liga, j, arq });
    }
  }
  let feitos = 0;
  for (const a of alvo) {
    const r = await pedir(API + a.liga + '/summary?event=' + a.j.id);
    if (!r) continue;
    const lances = (r.keyEvents || []).map(lance).filter(Boolean);
    const esc = (r.rosters || []).filter(x => (x.roster || []).length);
    const casa = esc.find(x => x.homeAway === 'home'), fora = esc.find(x => x.homeAway === 'away');
    const dados = {
      id: a.j.id, comp: a.slug, d: a.j.d, h: a.j.h || '', casa: a.j.casa, fora: a.j.fora, p: a.j.p || (a.j.vivo && a.j.vivo.p) || '',
      status: a.j.p ? 'Encerrado' : a.j.vivo ? (a.j.vivo.min || 'Ao vivo') : '', fim: !!a.j.p,
      lances, escalacoes: casa && fora ? { casa: escalacao(casa), fora: escalacao(fora) } : null
    };
    const novo = JSON.stringify(dados);
    if (fs.existsSync(a.arq) && fs.readFileSync(a.arq, 'utf8') === novo) continue;
    fs.writeFileSync(a.arq, novo);
    feitos++;
    console.log(a.j.casa, a.j.p || '', a.j.fora, '|', lances.length, 'lances |', dados.escalacoes ? 'com escalações' : 'sem escalações');
  }
  /* limpa jogos antigos */
  for (const f of fs.readdirSync(PASTA)) {
    const p = path.join(PASTA, f);
    let d = ''; try { d = JSON.parse(fs.readFileSync(p, 'utf8')).d || ''; } catch (e) { /* arquivo estragado: apaga */ }
    if (!d || Date.now() - Date.parse(d + 'T12:00:00-03:00') > 10 * 864e5) fs.unlinkSync(p);
  }
  if (tiposDesconhecidos.size) console.log('lances ignorados:', [...tiposDesconhecidos].join(' | '));
  console.log('partidas: ' + alvo.length + ' jogos na janela, ' + feitos + ' arquivos novos ou mudados');
})();
