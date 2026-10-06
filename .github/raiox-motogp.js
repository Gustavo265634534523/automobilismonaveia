/* Raio-x da MotoGP: última corrida (domingo) com o tempo de cada volta, velocidade máxima e pneus de cada piloto.
   Fontes: API de resultados da MotoGP (classificação) e o PDF oficial "Analysis" da corrida, lido com o pdftotext.
   Gera assets/dados/raiox-motogp.js. Roda no GitHub (f1-pos-corrida.yml) ou à mão: node .github/raiox-motogp.js
   Precisa do pdftotext (pacote poppler-utils). */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ARQ = path.join(__dirname, '..', 'assets', 'dados', 'raiox-motogp.js');
const API = 'https://api.motogp.pulselive.com/motogp/v1/results/';

async function get(q) {
  for (let t = 0; t < 4; t++) {
    try { const r = await fetch(API + q, { signal: AbortSignal.timeout(30000) }); if (r.ok) return await r.json(); } catch (e) {}
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('API da MotoGP não respondeu: ' + q);
}
function seg(t) { /* "1'43.488" ou "59.123" -> segundos */
  const m = String(t).match(/^(?:(\d+)')?(\d+\.\d+)$/); return m ? (+(m[1] || 0)) * 60 + +m[2] : null;
}

/* Lê o texto "raw" do PDF Analysis: blocos por piloto, com voltas (tempo, número, setores, velocidade) */
function lerAnalise(txt) {
  const L = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean), pilotos = {};
  let atual = null;
  for (let i = 0; i < L.length; i++) {
    /* cabeçalho do piloto: número / equipe / país (3 letras) / Nome SOBRENOME */
    if (/^\d{1,2}$/.test(L[i]) && L[i + 1] && !/^\d/.test(L[i + 1]) && /^[A-Z]{3}$/.test(L[i + 2] || '') && /[a-z].* [A-ZÀ-Ý'\-]{2,}/.test(L[i + 3] || '')) {
      const num = +L[i];
      atual = pilotos[num] = pilotos[num] || { num, equipe: L[i + 1], nome: L[i + 3], voltas: {}, pneus: '' };
      i += 3; continue;
    }
    if (!atual) continue;
    const pn = L[i].match(/^1 (Slick-\w+|Wet-\w+) (Slick-\w+|Wet-\w+)/);
    if (pn && !atual.pneus) { atual.pneus = pn[1].replace(/^(Slick|Wet)-/, '') + ' / ' + pn[2].replace(/^(Slick|Wet)-/, ''); continue; }
    const tv = L[i].match(/^(\d+'\d\d\.\d{3}|\d\d\.\d{3})(\s*\*)?(\s*P)?$/);
    if (tv) {
      const prox = (L[i + 1] || '').split(/\s+/);
      if (/^\d+$/.test(prox[0]) && prox.length >= 3) {
        const n = +prox[0], vel = prox.filter(x => /^\d{3}\.\d$/.test(x)).pop();
        atual.voltas[n] = { n, t: seg(tv[1]), anulada: !!tv[2], box: !!tv[3], vel: vel ? +vel : null };
        i++;
        if (/^\d\d\.\d{3}(\s*\*)?$/.test(L[i + 1] || '')) i++; /* o tempo do 4º setor vem sozinho na linha seguinte */
      }
    }
  }
  return pilotos;
}

(async () => {
  const temporada = (await get('seasons')).find(s => s.current) || (await get('seasons')).sort((a, b) => b.year - a.year)[0];
  const cat = (await get('categories?seasonUuid=' + temporada.id)).find(c => /^MotoGP/i.test(c.name));
  const eventos = (await get('events?seasonUuid=' + temporada.id + '&isFinished=true')).filter(e => !e.test).sort((a, b) => a.date_start < b.date_start ? -1 : 1);
  let ev = null, corrida = null;
  for (let k = eventos.length - 1; k >= 0 && !corrida; k--) {
    const ss = await get('sessions?eventUuid=' + eventos[k].id + '&categoryUuid=' + cat.id);
    const r = ss.find(s => s.type === 'RAC' && s.status === 'FINISHED' && s.session_files && s.session_files.analysis);
    if (r) { ev = eventos[k]; corrida = r; }
  }
  if (!corrida) { console.log('raiox motogp: nenhuma corrida terminada'); return; }
  const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
  if (antes.indexOf('"sessao":"' + corrida.id + '"') > -1 && !process.argv.includes('--forcar')) { console.log('raiox motogp: já está em dia (' + ev.name + ')'); return; }

  const cls = (await get('session/' + corrida.id + '/classification?test=false')).classification || [];
  const pdf = path.join(os.tmpdir(), 'motogp-analysis.pdf');
  const r = await fetch(corrida.session_files.analysis.url, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error('PDF da análise não abriu: ' + r.status);
  fs.writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
  const txt = execFileSync('pdftotext', ['-raw', pdf, '-'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  const an = lerAnalise(txt);

  const pilotos = cls.map(c => {
    const a = an[c.rider.number] || { voltas: {}, pneus: '' };
    const voltas = Object.values(a.voltas).sort((x, y) => x.n - y.n);
    const validas = voltas.filter(v => v.t && !v.anulada && !v.box && v.n > 1);
    const melhor = validas.reduce((m, v) => !m || v.t < m.t ? v : m, null);
    return {
      pos: c.position || null, num: c.rider.number, nome: c.rider.full_name, pais: c.rider.country && c.rider.country.iso,
      equipe: c.team && c.team.name, moto: c.constructor && c.constructor.name, tempo: c.time || null,
      dif: c.gap && +c.gap.lap > 0 ? '+' + c.gap.lap + (+c.gap.lap === 1 ? ' volta' : ' voltas') : (c.gap && c.gap.first && c.gap.first !== '0.000' ? '+' + c.gap.first : ''), status: c.status || '', voltasTotal: c.total_laps || voltas.length,
      pneus: a.pneus, melhor: melhor ? Math.round(melhor.t * 1000) / 1000 : null, melhorN: melhor ? melhor.n : null,
      velMax: voltas.reduce((m, v) => v.vel && v.vel > m ? v.vel : m, 0) || null,
      voltas: voltas.map(v => [v.n, v.t ? Math.round(v.t * 1000) / 1000 : null, v.vel, v.box ? 1 : 0])
    };
  });
  const comVoltas = pilotos.filter(p => p.voltas.length).length;
  if (comVoltas < 5) throw new Error('poucos pilotos com voltas lidas do PDF (' + comVoltas + ')');

  const dados = { sessao: corrida.id, gp: ev.name, circuito: ev.circuit && ev.circuit.name, data: (corrida.date || ev.date_end || '').slice(0, 10), pilotos };
  fs.writeFileSync(ARQ, '/* Gerado por .github/raiox-motogp.js (resultados oficiais da MotoGP). Não editar à mão. */\nwindow.RAIOX_MOTOGP = ' + JSON.stringify(dados) + ';\n');
  console.log('raiox motogp: ' + ev.name + ', ' + pilotos.length + ' pilotos, ' + comVoltas + ' com voltas, ' + (fs.statSync(ARQ).size / 1024).toFixed(0) + ' KB');
})().catch(e => { console.error('raiox motogp: erro', e.message); process.exit(1); });
