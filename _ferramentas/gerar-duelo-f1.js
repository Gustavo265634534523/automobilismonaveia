/* Gera assets/dados/duelo-f1.js com a posição de cada piloto em cada classificação, sprint e corrida da F1 2026 (OpenF1).
   Usado pela página Duelo de pilotos (plano Master). Roda sozinho depois de cada Raio-x novo (raiox-automatico.js).
   Uso manual: node _ferramentas/gerar-duelo-f1.js */
const fs = require('fs');
const path = require('path');
const PASTA = path.join(__dirname, '..');
const ANO = 2026;

const espera = ms => new Promise(r => setTimeout(r, ms));
async function get(fim) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch('https://api.openf1.org/v1/' + fim, { signal: AbortSignal.timeout(60000) });
    if (r.status === 429) { await espera(2000 * (t + 1)); continue; }
    const j = await r.json();
    await espera(400); /* sem pressa, para não sobrecarregar o OpenF1 */
    return Array.isArray(j) ? j : [];
  }
  return [];
}
const semAcento = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function dataBrasilia(iso) { return new Date(Date.parse(iso) - 3 * 36e5).toISOString().slice(0, 10); }

(async () => {
  global.window = {};
  require(path.join(PASTA, 'assets', 'js', 'dados.js'));
  const f1 = window.CATEGORIAS.find(c => c.slug === 'formula-1');
  const nomesSite = f1.classificacao.linhas.map(l => l[1]);
  /* "Andrea Kimi ANTONELLI" do OpenF1 vira "Kimi Antonelli", como no site (pelo sobrenome) */
  function nomeSite(d) {
    const sob = semAcento(d.last_name || '');
    return nomesSite.find(n => semAcento(n).endsWith(' ' + sob)) ||
      (d.first_name + ' ' + (d.last_name || '').charAt(0) + (d.last_name || '').slice(1).toLowerCase());
  }

  const sessoes = (await get(`sessions?year=${ANO}`))
    .filter(s => ['Race', 'Qualifying', 'Sprint'].includes(s.session_name) && !s.is_cancelled && s.date_end && Date.parse(s.date_end) < Date.now())
    .sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start));

  const etapas = {}; /* por meeting_key */
  const numGeral = {}; /* número → nome, para sessões em que o OpenF1 não trouxe a lista de pilotos */
  for (const s of sessoes) {
    const res = await get('session_result?session_key=' + s.session_key);
    if (!res.some(r => r.position === 1)) continue; /* resultado ainda não saiu */
    const pilotos = await get('drivers?session_key=' + s.session_key);
    const porNum = Object.assign({}, numGeral); pilotos.forEach(d => { porNum[d.driver_number] = numGeral[d.driver_number] = nomeSite(d); });
    const pos = {};
    res.forEach(r => {
      const n = porNum[r.driver_number]; if (!n) return;
      pos[n] = r.dsq ? 'DSQ' : r.dns ? 'NL' : (r.dnf || !r.position) ? 'NC' : r.position;
    });
    const k = s.meeting_key;
    if (!etapas[k]) etapas[k] = { d: null, n: 'GP ' + s.country_name };
    const e = etapas[k];
    if (s.session_name === 'Race') {
      e.d = dataBrasilia(s.date_start);
      const cal = f1.calendario.find(c => c.d === e.d) || f1.calendario.find(c => c.d === s.date_start.slice(0, 10));
      if (cal) e.n = cal.n;
      e.corrida = pos;
    } else if (s.session_name === 'Qualifying') e.quali = pos;
    else e.sprint = pos;
  }

  const lista = Object.values(etapas).filter(e => e.corrida).sort((a, b) => a.d < b.d ? -1 : 1);
  const saida = { atualizado: new Date().toISOString().slice(0, 10), etapas: lista };
  fs.writeFileSync(path.join(PASTA, 'assets', 'dados', 'duelo-f1.js'),
    '/* Gerado por _ferramentas/gerar-duelo-f1.js a partir do OpenF1. Não editar à mão. */\nwindow.DUELO_F1 = ' + JSON.stringify(saida) + ';\n');
  console.log('duelo-f1.js: ' + lista.length + ' corridas');
})().catch(e => { console.error('erro: ' + e.message); process.exit(1); });
