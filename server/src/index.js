import http from 'node:http';
import { analyze } from './pipeline.js';
import { chat, MODELS } from './nebius.js';

const PORT = process.env.PORT || 8080;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 200_000) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {});
    if (req.method === 'GET' && req.url === '/api/health') {
      return send(res, 200, { ok: true, models: MODELS, keyConfigured: !!process.env.NEBIUS_API_KEY });
    }
    if (req.method === 'POST' && req.url === '/api/analyze') {
      const body = JSON.parse(await readBody(req) || '{}');
      if (!body.letter || typeof body.letter !== 'string' || body.letter.trim().length < 20) {
        return send(res, 400, { error: 'Provide { "letter": "<full letter text>" } (min 20 chars).' });
      }
      const result = await analyze(body.letter);
      return send(res, 200, result);
    }
    if (req.method === 'POST' && req.url === '/api/ping-model') {
      // Smoke-tests a single tier. Body: { "tier": "nano"|"super"|"ultra"|"omni" }
      const body = JSON.parse(await readBody(req) || '{}');
      const r = await chat({ model: MODELS[body.tier] || MODELS.nano, messages: [{ role: 'user', content: 'Reply with the word: ok' }], maxTokens: 10 });
      return send(res, 200, r);
    }
    return send(res, 404, { error: 'not found' });
  } catch (err) {
    return send(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, () => console.log(`Form Friend server on :${PORT}`));
