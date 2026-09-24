import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { analyze } from './pipeline.js';
import { chat, MODELS } from './nebius.js';

const PORT = process.env.PORT || 8080;
const STATIC_DIR = process.env.STATIC_DIR || new URL('../client/dist/client/browser', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.woff2': 'font/woff2' };

async function serveStatic(req, res) {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') path = '/index.html';
  const file = normalize(join(STATIC_DIR, path));
  if (!file.startsWith(normalize(STATIC_DIR))) { res.writeHead(403); return res.end(); }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    return res.end(data);
  } catch {
    try { // SPA fallback
      const data = await readFile(join(STATIC_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(data);
    } catch {
      res.writeHead(404); return res.end('Client not built yet. Run: cd client && npm ci && npx ng build');
    }
  }
}

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
    if (req.method === 'GET') return serveStatic(req, res);
    return send(res, 404, { error: 'not found' });
  } catch (err) {
    return send(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, () => console.log(`Form Friend server on :${PORT}`));
