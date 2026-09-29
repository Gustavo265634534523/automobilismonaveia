// Avisos do canal do Telegram do Na Veia.
// Roda a cada 5 minutos (Agendador do Windows agora; GitHub Actions quando o site estiver no ar).
// Uso: node .github/avisos/telegram.js
// 1. Aviso antes de cada classificação, sprint e corrida (lê as sessões "s" de assets/js/dados.js).
// 2. Vencedor quando uma etapa ganha "venc" ou "parcial" novo.
//    Na F1 não espera o dados.js: pergunta ao OpenF1 logo depois da corrida e manda o vencedor na hora.
// 3. Resumo da segunda-feira (a partir das 9h): vencedores do fim de semana nas 12 categorias e os líderes.
// 4. Resumo pós-corrida: quando uma etapa ganha vencedor em dados.js, manda vencedor, pódio (se tiver), a notícia da corrida,
//    o líder do campeonato e a próxima etapa.
// 5. Mudança de horário: se o horário de uma sessão já anunciada muda em dados.js, avisa na hora.
// A chave vem das variáveis TELEGRAM_CHAVE e TELEGRAM_CANAL ou do arquivo _privado/telegram.env.
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '../..');
const ESTADO = path.join(__dirname, 'enviados.json');
const ANTES_MIN = 35;            // manda até 35 minutos antes (o GitHub às vezes atrasa alguns minutos)
const PULAR = /treino|shakedown|warm.?up/i;   // treinos não geram aviso, para o canal não virar spam

function config() {
  let chave = process.env.TELEGRAM_CHAVE || '', canal = process.env.TELEGRAM_CANAL || '';
  const arq = path.join(RAIZ, '_privado/telegram.env');
  if ((!chave || !canal) && fs.existsSync(arq)) {
    const s = fs.readFileSync(arq, 'utf8');
    chave = chave || (s.match(/^TELEGRAM_CHAVE=\s*(\S+)/m) || [])[1] || '';
    canal = canal || (s.match(/^TELEGRAM_CANAL=\s*(\S+)/m) || [])[1] || '';
  }
  return { chave, canal };
}

/* resumo pós-corrida de uma etapa, montado com o que dados.js já tem */
function resumoCorrida(c, e) {
  const L = ['🏁 <b>Resumo da corrida | ' + esc(c.nome) + ', ' + esc(e.n) + '</b>', '🏆 ' + esc(e.venc)];
  const d = c.destaque;
  if (d && d.titulo && d.titulo.indexOf(e.n) > -1 && d.linhas && d.linhas.length >= 3) {
    L.push('🥈 ' + esc(d.linhas[1][1]) + '\n🥉 ' + esc(d.linhas[2][1]));
  }
  const nots = (c.noticias || []).filter(n => e.d && n.d >= e.d).sort((a, b) => a.d < b.d ? -1 : 1).slice(0, 2);
  nots.forEach(n => L.push('📰 <b>' + esc(n.t) + '</b>\n' + esc(n.x)));
  if (c.lider && c.lider.nome) L.push('📊 Líder do campeonato: ' + esc(c.lider.nome) + (c.lider.info ? ' (' + esc(c.lider.info) + ')' : ''));
  const prox = c.calendario.find(x => !x.venc && x.d && e.d && x.d > e.d);
  if (prox) L.push('📅 Próxima etapa: ' + esc(prox.n) + ', ' + prox.d.split('-').reverse().slice(0, 2).join('/'));
  return L.join('\n\n');
}

function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function enviar(cfg, html) {
  const r = await fetch('https://api.telegram.org/bot' + cfg.chave + '/sendMessage', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: cfg.canal, text: html, parse_mode: 'HTML', disable_web_page_preview: true })
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.description);
}

(async () => {
  const cfg = config();
  if (!cfg.chave || !cfg.canal) { console.log('telegram: sem chave ou canal'); return; }
  global.window = {};
  require(path.join(RAIZ, 'assets/js/dados.js'));
  const estado = fs.existsSync(ESTADO) ? JSON.parse(fs.readFileSync(ESTADO, 'utf8')) : { enviados: {} };
  const primeira = !estado.iniciado;
  const agora = Date.now(), log = [];

  for (const c of window.CATEGORIAS) {
    for (const e of c.calendario) {
      for (const x of e.s || []) {
        if (PULAR.test(x.t) || !x.d || !x.h) continue;
        const falta = (new Date(x.d + 'T' + x.h + ':00-03:00').getTime() - agora) / 60000;
        if (falta <= 0 || falta > ANTES_MIN) continue;
        const chave = 'alerta:' + c.slug + ':' + e.e + ':' + x.t + ':' + x.d;
        if (estado.enviados[chave]) continue;
        await enviar(cfg, '🚦 <b>' + esc(c.nome) + ': ' + esc(x.t) + ' em ' + Math.max(1, Math.round(falta)) + ' minutos</b>\n' +
          esc(e.n) + ', ' + esc(e.l) + '. Começa às ' + x.h.replace(':', 'h') + ' (horário de Brasília).');
        estado.enviados[chave] = new Date().toISOString(); log.push(chave);
      }
      for (const [campo, rotulo] of [['venc', '🏆 Vencedor'], ['parcial', '📋 Resultado parcial']]) {
        if (!e[campo]) continue;
        const chave = 'resultado:' + c.slug + ':' + e.e + ':' + campo + ':' + e[campo];
        if (estado.enviados[chave]) continue;
        // na primeira vez só registra os resultados que já existiam, sem mandar nada
        if (!primeira) await enviar(cfg, campo === 'venc' ? resumoCorrida(c, e) : rotulo + ' | <b>' + esc(c.nome) + ', ' + esc(e.n) + '</b>\n' + esc(e[campo]));
        estado.enviados[chave] = new Date().toISOString(); if (!primeira) log.push(chave);
      }
    }
  }
  /* 5. Mudança de horário: compara com o horário guardado da última vez (sessões futuras, sem treinos) */
  const primeiraVezHorarios = !estado.horarios;
  estado.horarios = estado.horarios || {};
  for (const c of window.CATEGORIAS) {
    for (const e of c.calendario) {
      for (const x of e.s || []) {
        if (PULAR.test(x.t) || !x.d || !x.h) continue;
        const k = c.slug + ':' + e.e + ':' + x.t, agoraTxt = x.d + ' ' + x.h, antes = estado.horarios[k];
        estado.horarios[k] = agoraTxt;
        if (primeiraVezHorarios || !antes || antes === agoraTxt) continue;
        if (new Date(x.d + 'T' + x.h + ':00-03:00').getTime() < agora) continue; /* sessão que já passou: só guarda */
        const [ad, ah] = antes.split(' ');
        await enviar(cfg, '⏰ <b>Mudança de horário | ' + esc(c.nome) + ', ' + esc(e.n) + '</b>\n' + esc(x.t) + ' agora é <b>' +
          x.d.split('-').reverse().slice(0, 2).join('/') + ' às ' + x.h.replace(':', 'h') + '</b> (horário de Brasília).\nAntes era ' +
          ad.split('-').reverse().slice(0, 2).join('/') + ' às ' + ah.replace(':', 'h') + '.');
        log.push('horario:' + k);
      }
    }
  }

  /* 2b. F1: vencedor na hora, pelo OpenF1 (só olha entre 80 minutos e 6 horas depois da largada) */
  const f1 = window.CATEGORIAS.find(c => c.slug === 'formula-1');
  for (const e of f1 ? f1.calendario : []) {
    const x = (e.s || []).find(y => y.t === 'Corrida');
    if (!x || e.venc || estado.enviados['f1rapido:formula-1:' + e.e]) continue;
    const depois = (agora - new Date(x.d + 'T' + x.h + ':00-03:00').getTime()) / 60000;
    if (depois < 80 || depois > 360) continue;
    try {
      const get = async q => { const r = await fetch('https://api.openf1.org/v1/' + q, { signal: AbortSignal.timeout(30000) }); const j = await r.json(); return Array.isArray(j) ? j : []; };
      const ses = (await get('sessions?year=' + x.d.slice(0, 4) + '&session_name=Race')).find(z => Math.abs(Date.parse(z.date_start) - new Date(x.d + 'T' + x.h + ':00-03:00').getTime()) < 3 * 36e5);
      if (!ses) continue;
      const res = await get('session_result?session_key=' + ses.session_key);
      const podio = [1, 2, 3].map(p => res.find(r => r.position === p));
      if (!podio[0]) continue; /* resultado ainda não saiu: tenta de novo em 5 minutos */
      const pil = await get('drivers?session_key=' + ses.session_key);
      const nome = r => { const d = pil.find(p => p.driver_number === r.driver_number); return d ? d.first_name + ' ' + d.last_name.charAt(0) + d.last_name.slice(1).toLowerCase() + ' (' + d.team_name + ')' : '#' + r.driver_number; };
      await enviar(cfg, '🏆 Vencedor | <b>Fórmula 1, ' + esc(e.n) + '</b>\n' + esc(nome(podio[0])) +
        (podio[1] && podio[2] ? '\n\n🥈 ' + esc(nome(podio[1])) + '\n🥉 ' + esc(nome(podio[2])) : ''));
      estado.enviados['f1rapido:formula-1:' + e.e] = new Date().toISOString(); log.push('f1rapido:' + e.e);
    } catch (err) { console.log('openf1: ' + err.message); }
  }

  /* 3. Resumo da segunda-feira, a partir das 9h (horário de Brasília) */
  const br = new Date(agora - 3 * 36e5), semana = br.toISOString().slice(0, 10);
  if (br.getUTCDay() === 1 && br.getUTCHours() >= 9 && !estado.enviados['resumo:' + semana] && !primeira) {
    const ini = new Date(br.getTime() - 7 * 864e5).toISOString().slice(0, 10);
    const linhas = [];
    for (const c of window.CATEGORIAS) {
      const vs = c.calendario.filter(e => e.venc && e.d && e.d >= ini && e.d < semana);
      if (!vs.length) continue;
      linhas.push('<b>' + esc(c.nome) + '</b>\n' + vs.map(e => '🏆 ' + esc(e.n) + ': ' + esc(e.venc)).join('\n') +
        (c.lider ? '\nLíder: ' + esc(c.lider.nome) + (c.lider.info ? ' (' + esc(c.lider.info) + ')' : '') : ''));
    }
    if (linhas.length) await enviar(cfg, '📰 <b>Resumo do fim de semana</b>\n\n' + linhas.join('\n\n'));
    estado.enviados['resumo:' + semana] = new Date().toISOString(); log.push('resumo:' + semana + (linhas.length ? '' : ' (sem corridas)'));
  }

  estado.iniciado = true;
  fs.writeFileSync(ESTADO, JSON.stringify(estado, null, 1));
  console.log(new Date().toISOString().slice(0, 16) + ' ' + (log.length ? log.join(' | ') : 'nada novo'));
})().catch(e => { console.error('telegram: erro', e.message); process.exit(1); });
