import { createServer } from 'node:http';
import path from 'node:path';
import { regular, walk } from './validate.mjs';
import { exactOrigin } from '../public/sdk/protocol.js';
const prefix = 'dist/angular-basic/browser/', allowed = new Set((await walk('dist/angular-basic/browser')).map(p => p.slice(prefix.length)));
const parent = process.env['DEMO_PARENT_ORIGIN'] ?? 'http://127.0.0.1:4173';
if (!exactOrigin(parent)) throw Error('DEMO_PARENT_ORIGIN must be an exact HTTP(S) origin.');
const assets = 'https://dezrez-partner-developers-systest.azurewebsites.net';
const csp = `default-src 'none'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' ${assets} https://use.typekit.net https://p.typekit.net; style-src-attr 'none'; font-src 'self' ${assets} https://use.typekit.net https://p.typekit.net data:; img-src 'self' data: https://p.typekit.net; connect-src 'self'; frame-src 'self'; frame-ancestors 'self' ${parent}; form-action 'none'`;
const headers = { 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin', 'Cache-Control': 'no-store', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' };
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  const reply = (code, body) => { res.writeHead(code, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end(req.method === 'HEAD' ? undefined : body); };
  if (!['GET', 'HEAD'].includes(req.method)) return reply(405, 'Method not allowed');
  let route; try { route = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); } catch { return reply(400, 'Invalid path'); }
  if (/[\\%\0:]/.test(route) || !route.startsWith('/')) return reply(400, 'Invalid path');
  const name = route === '/' ? 'index.html' : route.slice(1); if (!allowed.has(name)) return reply(404, 'Not found');
  try { const data = await regular(prefix + name); res.writeHead(200, { ...headers, 'Content-Type': types[path.extname(name)] ?? 'application/octet-stream', 'Content-Length': data.length }); res.end(req.method === 'HEAD' ? undefined : data); } catch { return reply(404, 'Not found'); }
});
const port = Number(process.env['PORT'] ?? 4200); if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('PORT must be a valid port.');
server.listen(port, '127.0.0.1', () => console.log(`Your Angular app: http://127.0.0.1:${port}/ — mock host: http://127.0.0.1:${port}/mock-host.html`));
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close());
