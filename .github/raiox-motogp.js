/* Raio-x da MotoGP: último GP com corrida, sprint e classificação. Para cada piloto: tempo de cada volta,
   os 4 setores, velocidade máxima e pneus. Fontes: API de resultados da MotoGP (classificação) e os PDFs oficiais
   "Analysis" de cada sessão, lidos com o pdftotext. A MotoGP não publica telemetria (acelerador, freio).
   Gera assets/dados/raiox-motogp.js. Roda no GitHub (f1-pos-corrida.yml) ou à mão: node .github/raiox-motogp.js [--forcar]
   Precisa do pdftotext (pacote poppler-utils). */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ARQ = path.join(__dirname, '..', 'assets', 'dados', 'raiox-motogp.js');
const API = 'https://api.motogp.pulselive.com/motogp/v1/results/';
const SESSOES = [['RAC', 'Corrida'], ['SPR', 'Sprint'], ['Q2', 'Classificação Q2'], ['Q1', 'Classificação Q1']];

async function get(q) {
  for (let t = 0; t < 4; t++) {
    try { const r = await fetch(API + q, { signal: AbortSignal.timeout(30000) }); if (r.ok) return await r.json(); } catch (e) {}
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('API da MotoGP não respondeu: ' + q);
}
function seg(t) { const m = String(t).match(/^(?:(\d+)')?(\d+\.\d+)$/); return m ? (+(m[1] || 0)) * 60 + +m[2] : null; }
const r3 = v => v == null ? null : Math.round(v * 1000) / 1000;

/* Texto "raw" do PDF Analysis: por piloto, cada volta vem como
   [tempo da volta (+ * anulada, P box)] / [nº, T1, T2, T3, velocidade] / [T4] / [* *: volta anulada] */
function lerAnalise(txt) {
  const L = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean), pilotos = {};
  let atual = null, ultima = null;
  for (let i = 0; i < L.length; i++) {
    if (/^\d{1,2}$/.test(L[i]) && L[i + 1] && !/^\d/.test(L[i + 1]) && /^[A-Z]{3}$/.test(L[i + 2] || '') && /[a-z].* [A-ZÀ-Ý'\-]{2,}/.test(L[i + 3] || '')) {
      const num = +L[i];
      atual = pilotos[num] = pilotos[num] || { num, equipe: L[i + 1], voltas: {}, pneus: '' };
      ultima = null; i += 3; continue;
    }
    /* na classificação, número e equipe vêm na mesma linha: "89 Aprilia Racing" / país / Nome SOBRENOME */
    const cab = L[i].match(/^(\d{1,2}) ([A-Za-z].+)$/);
    if (cab && /^[A-Z]{3}$/.test(L[i + 1] || '') && /[a-z].* [A-ZÀ-Ý'\-]{2,}/.test(L[i + 2] || '')) {
      const num = +cab[1];
      atual = pilotos[num] = pilotos[num] || { num, equipe: cab[2], voltas: {}, pneus: '' };
      ultima = null; i += 2; continue;
    }
    if (!atual) continue;
    if (L[i] === '*' && ultima) { ultima.anulada = true; continue; }
    const pit = L[i].match(/^P (\d\d\.\d{3})$/); /* volta que termina no box: o 4º setor vem com "P" */
    if (pit && ultima && ultima.s == null) { ultima.box = true; continue; }
    const pn = L[i].match(/^1 ((?:Slick|Wet)-\w+) ((?:Slick|Wet)-\w+)/);
    if (pn && !atual.pneus) { atual.pneus = pn[1].replace(/^(Slick|Wet)-/, '') + ' / ' + pn[2].replace(/^(Slick|Wet)-/, ''); continue; }
    const tv = L[i].match(/^(\d+'\d\d\.\d{3}|\d\d\.\d{3})(\s*\*)?(\s*P)?$/);
    if (!tv) continue;
    const prox = (L[i + 1] || '').split(/\s+/);
    if (!/^\d+$/.test(prox[0]) || prox.length < 3) continue;
    const n = +prox[0], setores = prox.slice(1).filter(x => /^\d+\.\d{3}$/.test(x)).map(Number), vel = prox.filter(x => /^\d{3}\.\d$/.test(x)).pop();
    i++;
    if (/^\d\d\.\d{3}$/.test(L[i + 1] || '')) { setores.push(+L[i + 1]); i++; }
    ultima = atual.voltas[n] = { n, t: seg(tv[1]), anulada: !!tv[2], box: !!tv[3], vel: vel ? +vel : null, s: setores.length === 4 ? setores : null };
  }
  return pilotos;
}

async function sessao(s, rotulo) {
  const cls = (await get('session/' + s.id + '/classification?test=false')).classification || [];
  const pdf = path.join(os.tmpdir(), 'motogp-' + s.id + '.pdf');
  const r = await fetch(s.session_files.analysis.url, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error('PDF não abriu: ' + r.status);
  fs.writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
  const an = lerAnalise(execFileSync('pdftotext', ['-raw', pdf, '-'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }));
  const pilotos = cls.map(c => {
    const a = an[c.rider.number] || { voltas: {}, pneus: '' };
    const voltas = Object.values(a.voltas).sort((x, y) => x.n - y.n);
    const validas = voltas.filter(v => v.t && !v.anulada && !v.box && (s.type !== 'RAC' && s.type !== 'SPR' || v.n > 1));
    const melhor = validas.reduce((m, v) => !m || v.t < m.t ? v : m, null);
    return {
      pos: c.position || null, num: c.rider.number, nome: c.rider.full_name, pais: c.rider.country && c.rider.country.iso,
      equipe: c.team && c.team.name, moto: c.constructor && c.constructor.name, tempo: c.time || (c.best_lap && c.best_lap.time) || null,
      dif: c.gap && +c.gap.lap > 0 ? '+' + c.gap.lap + (+c.gap.lap === 1 ? ' volta' : ' voltas') : (c.gap && c.gap.first && c.gap.first !== '0.000' ? '+' + c.gap.first : ''),
      voltasTotal: c.total_laps || voltas.length, pneus: a.pneus,
      melhor: melhor ? r3(melhor.t) : null, melhorN: melhor ? melhor.n : null, velMax: voltas.reduce((m, v) => v.vel && v.vel > m ? v.vel : m, 0) || null,
      /* volta: [nº, tempo, T1, T2, T3, T4, velocidade, box, anulada] */
      voltas: voltas.map(v => [v.n, r3(v.t), ...(v.s ? v.s.map(r3) : [null, null, null, null]), v.vel, v.box ? 1 : 0, v.anulada ? 1 : 0])
    };
  });
  const lidos = pilotos.filter(p => p.voltas.length).length;
  if (lidos < Math.min(5, pilotos.length)) throw new Error(rotulo + ': poucos pilotos lidos do PDF (' + lidos + ')');
  return { tipo: s.type, nome: rotulo, id: s.id, data: (s.date || '').slice(0, 10), pilotos };
}

(async () => {
  const temporadas = await get('seasons');
  const temporada = temporadas.find(s => s.current) || temporadas.sort((a, b) => b.year - a.year)[0];
  const cat = (await get('categories?seasonUuid=' + temporada.id)).find(c => /^MotoGP/i.test(c.name));
  const eventos = (await get('events?seasonUuid=' + temporada.id + '&isFinished=true')).filter(e => !e.test).sort((a, b) => a.date_start < b.date_start ? -1 : 1);
  let ev = null, todas = [];
  for (let k = eventos.length - 1; k >= 0 && !ev; k--) {
    const ss = await get('sessions?eventUuid=' + eventos[k].id + '&categoryUuid=' + cat.id);
    if (ss.some(s => s.type === 'RAC' && s.status === 'FINISHED' && s.session_files && s.session_files.analysis)) { ev = eventos[k]; todas = ss; }
  }
  if (!ev) { console.log('raiox motogp: nenhuma corrida terminada'); return; }
  const corridaId = todas.find(s => s.type === 'RAC').id;
  const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
  if (antes.indexOf('"sessao":"' + corridaId + '"') > -1 && antes.indexOf('"sessoes"') > -1 && !process.argv.includes('--forcar')) { console.log('raiox motogp: já está em dia (' + ev.name + ')'); return; }

  const sessoes = [];
  for (const [tipo, rotulo] of SESSOES) {
    const s = todas.find(x => (x.type + (x.number ? x.number : '')) === tipo || (x.type === tipo && !x.number));
    if (!s || s.status !== 'FINISHED' || !s.session_files || !s.session_files.analysis) continue;
    try { sessoes.push(await sessao(s, rotulo)); } catch (e) { console.log('raiox motogp: ' + rotulo + ' ficou de fora (' + e.message + ')'); if (tipo === 'RAC') throw e; }
  }
  const corrida = sessoes.find(s => s.tipo === 'RAC');
  const dados = { sessao: corridaId, gp: ev.name, circuito: ev.circuit && ev.circuit.name, data: corrida.data || (ev.date_end || '').slice(0, 10), pilotos: corrida.pilotos, sessoes };
  fs.writeFileSync(ARQ, '/* Gerado por .github/raiox-motogp.js (resultados oficiais da MotoGP). Não editar à mão. */\nwindow.RAIOX_MOTOGP = ' + JSON.stringify(dados) + ';\n');
  console.log('raiox motogp: ' + ev.name + ', sessões: ' + sessoes.map(s => s.nome + ' (' + s.pilotos.filter(p => p.voltas.length).length + ')').join(', ') + ', ' + (fs.statSync(ARQ).size / 1024).toFixed(0) + ' KB');
})().catch(e => { console.error('raiox motogp: erro', e.message); process.exit(1); });
