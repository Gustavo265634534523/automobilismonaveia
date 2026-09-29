/* Confere se o OpenF1 já publicou a última corrida de F1 e, se sim, gera o Raio-x novo.
   Roda sozinho a cada 10 minutos pelo Agendador do Windows (_ferramentas/raiox-automatico.vbs).
   Uso manual: node _ferramentas/raiox-automatico.js */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const PASTA = path.join(__dirname, '..');
const ARQ = path.join(PASTA, 'assets', 'dados', 'raiox-f1.js');
const LOG = path.join(PASTA, '_privado', 'raiox-automatico.log');
const ANO = 2026;

function log(txt) {
  const agora = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 16).replace('T', ' ');
  console.log(agora + ' ' + txt); /* no GitHub não existe a pasta _privado: aí o registro fica só na tela da tarefa */
  try { if (fs.existsSync(path.dirname(LOG))) fs.appendFileSync(LOG, agora + ' ' + txt + '\n'); } catch (e) {}
}
async function get(fim) {
  const r = await fetch('https://api.openf1.org/v1/' + fim, { signal: AbortSignal.timeout(60000) });
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}
function dataBrasilia(iso) { return new Date(Date.parse(iso) - 3 * 36e5).toISOString().slice(0, 10); }

(async () => {
  /* Raio-x atual */
  let atual = '';
  try { const m = fs.readFileSync(ARQ, 'utf8').match(/"data":"(\d{4}-\d{2}-\d{2})"/); if (m) atual = m[1]; } catch (e) {}

  /* Última corrida que já terminou */
  const corridas = (await get(`sessions?year=${ANO}&session_name=Race`))
    .filter(s => !s.is_cancelled && s.date_end && Date.parse(s.date_end) < Date.now())
    .sort((a, b) => Date.parse(b.date_start) - Date.parse(a.date_start));
  const ultima = corridas[0];
  if (!ultima) return;
  const dataUtc = ultima.date_start.slice(0, 10);
  if (atual && atual >= dataUtc) return; /* já está atualizado: não faz nada nem escreve no log */

  /* O resultado já saiu? */
  const res = await get('session_result?session_key=' + ultima.session_key);
  if (!res.length || !res.some(r => r.position === 1)) { log('aguardando resultado de ' + ultima.country_name); return; }

  /* Nome e local do GP, pelo calendário do site */
  global.window = {};
  require(path.join(PASTA, 'assets', 'js', 'dados.js'));
  const f1 = window.CATEGORIAS.find(c => c.slug === 'formula-1');
  const d = dataBrasilia(ultima.date_start);
  const etapa = f1.calendario.find(e => e.d === d) || f1.calendario.find(e => e.d === dataUtc);
  const titulo = etapa ? etapa.n : 'GP ' + ultima.country_name;
  const local = etapa ? etapa.l : ultima.location;

  try {
    const saida = execFileSync(process.execPath, [path.join(__dirname, 'gerar-raiox.js'), ultima.country_name, titulo, local], { cwd: PASTA, encoding: 'utf8', timeout: 600000 });
    log('Raio-x gerado: ' + saida.trim().split('\n')[0]);
    /* duelo de pilotos: posições de cada corrida da F1 */
    try { log(execFileSync(process.execPath, [path.join(__dirname, 'gerar-duelo-f1.js')], { cwd: PASTA, encoding: 'utf8', timeout: 600000 }).trim()); }
    catch (e2) { log('duelo: erro ' + String(e2.message).slice(0, 120)); }
  } catch (e) {
    log('ainda sem dados completos de ' + titulo + ' (' + String(e.stdout || e.message).trim().slice(0, 120) + ')');
  }
})().catch(e => log('erro: ' + e.message));
