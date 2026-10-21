/* Sonda temporária: imprime o formato dos dados da ESPN que as próximas funções vão usar. Apagar depois. */
const H = { 'User-Agent': 'Mozilla/5.0 ArenaSports/1.0', Origin: 'https://automobilismonaveia.com.br' };
async function g(u) { try { const r = await fetch(u, { headers: H }); const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) {} return { st: r.status, cors: r.headers.get('access-control-allow-origin'), j, t: t.slice(0, 300) }; } catch (e) { return { st: 'erro ' + e.message }; } }
const k = o => o && typeof o === 'object' ? Object.keys(o).join(',') : String(o);
(async () => {
  let r = await g('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/summary?event=401915399');
  console.log('1 FUT summary', r.st, 'cors', r.cors); const bt = r.j && r.j.boxscore && r.j.boxscore.teams;
  if (bt) console.log('  teams stats:', JSON.stringify(bt[0].statistics.map(s => [s.name, s.displayValue])));
  const ro = r.j && r.j.rosters && r.j.rosters[0].roster[0]; console.log('  roster item keys:', k(ro), '| athlete keys:', k(ro && ro.athlete), '| stats:', JSON.stringify((ro && ro.stats || []).map(s => s.name + '=' + s.value)));
  console.log('  athlete sample:', JSON.stringify(ro && ro.athlete).slice(0, 400));
  r = await g('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/382/roster');
  const a = r.j && r.j.athletes && (r.j.athletes[0].items ? r.j.athletes[0].items[0] : r.j.athletes[0]);
  console.log('2 roster', r.st, 'keys:', k(a)); console.log('  citizenship:', a && a.citizenship, '| flag:', JSON.stringify(a && a.flag), '| birthPlace:', JSON.stringify(a && a.birthPlace), '| citizenshipCountry', JSON.stringify(a && a.citizenshipCountry));
  r = await g('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=401909089');
  console.log('3 NBA summary', r.st, 'keys', k(r.j));
  const bp = r.j && r.j.boxscore && r.j.boxscore.players && r.j.boxscore.players[0];
  if (bp) { const s = bp.statistics[0]; console.log('  labels', JSON.stringify(s.labels), 'names', JSON.stringify(s.names)); console.log('  athlete0', JSON.stringify(s.athletes[0]).slice(0, 500)); }
  const btn = r.j && r.j.boxscore && r.j.boxscore.teams; if (btn) console.log('  team stats', JSON.stringify(btn[0].statistics.map(s => [s.name, s.displayValue])).slice(0, 800));
  r = await g('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries');
  console.log('4 injuries', r.st, 'keys', k(r.j)); const inj = r.j && (r.j.injuries || [])[0]; console.log('  ', JSON.stringify(inj).slice(0, 700));
  r = await g('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/18/roster');
  const na = r.j && r.j.athletes && r.j.athletes[0]; console.log('5 NBA roster', r.st, 'keys', k(na), '| birthPlace', JSON.stringify(na && na.birthPlace), '| citizenship', na && na.citizenship);
  r = await g('https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete?region=us&lang=en&contentorigin=espn&isqualified=false&page=1&limit=3&season=2027&seasontype=2&sort=offensive.avgPoints:desc');
  console.log('6 NBA byathlete', r.st, 'cors', r.cors, 'keys', k(r.j), 'cats', JSON.stringify((r.j && r.j.categories || []).map(c => [c.name, c.names])).slice(0, 900));
  console.log('  athlete0', JSON.stringify(r.j && r.j.athletes && r.j.athletes[0]).slice(0, 700));
  for (const u of ['https://site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/253989/overview', 'https://site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/253989/stats', 'https://site.web.api.espn.com/apis/common/v3/sports/soccer/eng.1/statistics/byathlete?limit=3']) {
    r = await g(u); console.log('7', u.split('/').slice(-2).join('/'), r.st, 'cors', r.cors, 'keys', k(r.j)); console.log('   ', (r.j ? JSON.stringify(r.j) : r.t).slice(0, 900));
  }
  r = await g('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard');
  console.log('8 scoreboard cors', r.st, r.cors);
  r = await g('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/summary?event=401841272');
  const ev = r.j && r.j.header && r.j.header.competitions && r.j.header.competitions[0];
  console.log('9 round info', JSON.stringify(r.j && r.j.header && r.j.header.week), JSON.stringify(ev && ev.notes).slice(0,200), JSON.stringify(r.j && r.j.header && r.j.header.season));
})();
