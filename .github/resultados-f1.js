/* Resultados do fim de semana da F1 (bloco ao lado de "Números da pista" na próxima etapa): pole da sprint, sprint,
   pole e corrida do GP que está acontecendo, com os 3 primeiros de cada. Lê o OpenF1 e grava assets/dados/resultados-f1.json.
   Roda no GitHub (f1-pos-corrida.yml, a cada 30 min) ou no PC. */
const fs = require('fs');
const path = require('path');
const ARQ = path.join(__dirname, '..', 'assets/dados/resultados-f1.json');
const API = 'https://api.openf1.org/v1/';
const NOMES = { 'Sprint Qualifying': 'Pole da sprint', 'Sprint Shootout': 'Pole da sprint', 'Sprint': 'Vencedor da sprint', 'Qualifying': 'Pole para a corrida', 'Race': 'Vencedor da corrida' };

async function get(q) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(API + q, { headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)' } }).catch(() => null);
    if (r && r.ok) return r.json();
    await new Promise(ok => setTimeout(ok, 2000));
  }
  throw new Error('OpenF1 indisponível: ' + q);
}
function tempo(s) { const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3); }
function tempoLongo(s) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + (r < 10 ? '0' : '') + r.toFixed(3); }

(async () => {
  const ano = new Date().getUTCFullYear();
  const agora = Date.now();
  const ses = (await get('sessions?year=' + ano)).filter(s => NOMES[s.session_name] && s.date_end && Date.parse(s.date_end) + 20 * 60e3 < agora);
  if (!ses.length) { console.log('resultados-f1: nenhuma sessão terminada'); return; }
  /* o GP mais recente que já teve classificação, sprint ou corrida */
  const ult = ses.sort((a, b) => Date.parse(b.date_start) - Date.parse(a.date_start))[0];
  const doGp = ses.filter(s => s.meeting_key === ult.meeting_key).sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start));
  const pilotos = {};
  (await get('drivers?session_key=' + ult.session_key)).forEach(d => { pilotos[d.driver_number] = d; });
  const sessoes = [];
  for (const s of doGp) {
    const res = (await get('session_result?session_key=' + s.session_key)).filter(x => x.position && x.position <= 3).sort((a, b) => a.position - b.position);
    if (!res.length) continue;
    const corrida = /Race|Sprint$/.test(s.session_name) && s.session_type === 'Race';
    sessoes.push({
      tipo: s.session_name, titulo: NOMES[s.session_name], data: s.date_start.slice(0, 10),
      top: res.map(x => {
        const d = pilotos[x.driver_number] || {};
        const dur = Array.isArray(x.duration) ? x.duration.filter(Boolean).pop() : x.duration;
        const gap = Array.isArray(x.gap_to_leader) ? x.gap_to_leader[x.gap_to_leader.length - 1] : x.gap_to_leader;
        return {
          pos: x.position, n: x.driver_number,
          nome: d.first_name ? d.first_name + ' ' + d.last_name : (d.full_name || '#' + x.driver_number),
          equipe: d.team_name || '', cor: d.team_colour ? '#' + d.team_colour : '#8e979f',
          tempo: x.position === 1 ? (dur ? (corrida ? tempoLongo(dur) : tempo(dur)) : '') : (typeof gap === 'number' ? '+' + gap.toFixed(3) + 's' : (gap || ''))
        };
      })
    });
  }
  const novo = JSON.stringify({ meeting: ult.meeting_key, local: ult.location, pais: ult.country_name, data: ult.date_start.slice(0, 10), sessoes }, null, 1) + '\n';
  const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
  if (novo === antes) { console.log('resultados-f1: sem novidade'); return; }
  fs.writeFileSync(ARQ, novo);
  console.log('resultados-f1:', ult.location, '|', sessoes.map(s => s.titulo + ': ' + s.top[0].nome).join(' | '));
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
