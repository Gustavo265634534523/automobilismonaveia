/* Servidor do bolão (Cloudflare Worker "arena-bolao", com um KV chamado PALPITES). Guarda os palpites de quem tem
   conta no site; quem é a pessoa vem do servidor de contas (naveia-contas, ação "eu"), com a mesma sessão do site.
   Ações (?acao=...):
   - status: responde se está no ar;
   - meus (GET, com sessão): os palpites da pessoa;
   - palpite (POST, com sessão): {chave, v} grava um palpite com a hora do servidor (o robô do ranking só conta
     palpite feito antes do jogo começar);
   - todos (GET, cabeçalho X-Chave = segredo BOLAO_CHAVE): todos os palpites, para o robô .github/bolao.js.
   Publicado pelo GitHub (.github/workflows/bolao-servidor.yml). */
const CONTAS = 'https://naveia-contas.naveia-contas.workers.dev/';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Naveia', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const CHAVE = /^(f|b):\d{1,12}$|^1:\d{4}-\d{1,2}$/;
const VALOR = { f: /^\d{1,2}x\d{1,2}$/, b: /^(casa|fora)(\|(1-5|6-10|11\+))?$/, 1: /^[^|]{0,40}(\|[^|]{0,40}){3}$/ };
const json = (d, s) => new Response(JSON.stringify(d), { status: s || 200, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS) });

async function hash(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('arena-bolao:' + s));
  return [...new Uint8Array(b)].slice(0, 12).map(x => x.toString(16).padStart(2, '0')).join('');
}
/* quem está pedindo: pergunta ao servidor de contas com a sessão que veio */
async function quem(req) {
  const aut = req.headers.get('Authorization');
  if (!aut) return null;
  try {
    const r = await fetch(CONTAS + '?acao=eu', { headers: { Authorization: aut, 'X-Naveia': '1' } });
    const d = await r.json();
    if (!d || !d.logado || !d.usuario) return null;
    const u = d.usuario, base = u.id || u.email;
    if (!base) return null;
    const p = String(u.nome || 'Torcedor').trim().split(/\s+/);
    return { id: await hash(String(base)), nome: p.length > 1 ? p[0] + ' ' + p[p.length - 1].charAt(0) + '.' : p[0] };
  } catch (e) { return null; }
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const acao = new URL(req.url).searchParams.get('acao');
    if (acao === 'status') return json({ ok: true });
    if (acao === 'todos') {
      if (!env.BOLAO_CHAVE || req.headers.get('X-Chave') !== env.BOLAO_CHAVE) return json({ ok: false }, 403);
      const usuarios = [];
      let cursor;
      do {
        const l = await env.PALPITES.list({ prefix: 'u:', cursor });
        for (const k of l.keys) { const v = await env.PALPITES.get(k.name, 'json'); if (v) usuarios.push({ id: k.name.slice(2), nome: v.nome, p: v.p }); }
        cursor = l.list_complete ? null : l.cursor;
      } while (cursor);
      return json({ ok: true, usuarios });
    }
    const u = await quem(req);
    if (!u) return json({ ok: false, erro: 'Entre na sua conta para palpitar.' }, 401);
    const chaveKV = 'u:' + u.id;
    const atual = (await env.PALPITES.get(chaveKV, 'json')) || { nome: u.nome, p: {} };
    if (acao === 'meus') return json({ ok: true, nome: u.nome, palpites: atual.p });
    if (acao === 'palpite' && req.method === 'POST') {
      let d; try { d = await req.json(); } catch (e) { return json({ ok: false, erro: 'Pedido inválido.' }, 400); }
      const k = String(d.chave || ''), v = String(d.v || '');
      if (!CHAVE.test(k) || !VALOR[k[0]].test(v)) return json({ ok: false, erro: 'Palpite inválido.' }, 400);
      if (!atual.p[k] && Object.keys(atual.p).length >= 5000) return json({ ok: false, erro: 'Limite de palpites.' }, 400);
      atual.p[k] = [v, new Date().toISOString()];
      atual.nome = u.nome;
      await env.PALPITES.put(chaveKV, JSON.stringify(atual));
      return json({ ok: true, chave: k, t: atual.p[k][1] });
    }
    return json({ ok: false, erro: 'Ação desconhecida.' }, 400);
  }
};
