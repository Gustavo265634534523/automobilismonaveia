// Gera assets/agenda/<categoria>.ics: as sessões de cada categoria para assinar na agenda do celular (plano Médio).
// A agenda do celular busca o arquivo de novo sozinha, então horários novos aparecem sem a pessoa fazer nada.
// Roda junto com exportar-agenda.js (a tarefa diária dos resultados chama os dois).
const fs = require('fs'), path = require('path');
global.window = {};
require(path.join(__dirname, '../assets/js/dados.js'));
const PASTA = path.join(__dirname, '../assets/agenda');
fs.mkdirSync(PASTA, { recursive: true });

const pad = n => String(n).padStart(2, '0');
function utc(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }
function txt(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
/* linhas de no máximo 75 caracteres, como a regra do formato pede */
function dobrar(l) { const out = []; while (Buffer.byteLength(l) > 74) { let n = 74; while (Buffer.byteLength(l.slice(0, n)) > 74) n--; out.push(l.slice(0, n)); l = ' ' + l.slice(n); } out.push(l); return out.join('\r\n'); }
function duracao(t) { return /corrida|race|principal|feature|500|6 horas|24 horas/i.test(t) ? 2 * 60 : /treino|shakedown|warm/i.test(t) ? 60 : 75; }

const agora = utc(new Date());
let total = 0;
for (const c of window.CATEGORIAS) {
  const ev = [];
  for (const e of c.calendario) {
    const onde = e.l + (e.nota ? ', ' + e.nota : '');
    if (e.s && e.s.length) {
      for (const x of e.s) {
        if (!x.d || !x.h) continue;
        const ini = new Date(x.d + 'T' + x.h + ':00-03:00'), fim = new Date(ini.getTime() + duracao(x.t) * 60000);
        ev.push(['UID:' + c.slug + '-' + e.e + '-' + x.d + '-' + x.t.replace(/\W+/g, '') + '@naveia', 'DTSTART:' + utc(ini), 'DTEND:' + utc(fim),
          'SUMMARY:' + txt(c.nome + ': ' + x.t + ' (' + e.n + ')'), 'LOCATION:' + txt(onde),
          'DESCRIPTION:' + txt('Horário de Brasília: ' + x.h.replace(':', 'h') + '. Automobilismo Na Veia.'),
          'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + txt(c.nome + ': ' + x.t + ' em 30 minutos'), 'TRIGGER:-PT30M', 'END:VALARM']);
      }
    } else if (e.d && !e.venc) {
      /* etapa sem horários ainda: evento do dia inteiro, que vira sessões quando os horários saírem */
      const d = e.d.replace(/-/g, ''), dia2 = new Date(e.d + 'T12:00:00Z'); dia2.setUTCDate(dia2.getUTCDate() + 1);
      ev.push(['UID:' + c.slug + '-' + e.e + '-dia@naveia', 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + dia2.toISOString().slice(0, 10).replace(/-/g, ''),
        'SUMMARY:' + txt(c.nome + ': ' + e.n), 'LOCATION:' + txt(onde), 'DESCRIPTION:' + txt('Horários ainda não divulgados. Automobilismo Na Veia.')]);
    }
  }
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Automobilismo Na Veia//Agenda//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:' + txt('Na Veia: ' + c.nome), 'X-WR-TIMEZONE:America/Sao_Paulo', 'REFRESH-INTERVAL;VALUE=DURATION:PT6H', 'X-PUBLISHED-TTL:PT6H'];
  for (const e of ev) linhas.push('BEGIN:VEVENT', 'DTSTAMP:' + agora, ...e, 'END:VEVENT');
  linhas.push('END:VCALENDAR');
  fs.writeFileSync(path.join(PASTA, c.slug + '.ics'), linhas.map(dobrar).join('\r\n') + '\r\n');
  total += ev.length;
}
console.log('agenda .ics: ' + window.CATEGORIAS.length + ' categorias, ' + total + ' eventos');
