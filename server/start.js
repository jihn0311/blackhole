import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { adminPlugin } from './adminPlugin.js';

export function createAdminServer({ root = process.cwd(), publicOrigin, password }) {
  const origin = new URL(publicOrigin);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('관리자 서버의 HTTPS 주소를 설정해주세요.');
  if (typeof password !== 'string' || password.length < 9 || password.length > 256) throw new Error('ADMIN_PASSWORD를 9자 이상으로 설정해주세요.');
  let api;
  adminPlugin({ publicOrigin: origin.origin, password }).configureServer({
    config: { root }, middlewares: { use(_path, handler) { api = handler; } },
  });
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store');
    let url;
    try { url = new URL(req.url, origin.origin); } catch { res.writeHead(400).end(); return; }
    if (url.pathname === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok'); return; }
    if (url.pathname.startsWith('/__admin/')) {
      req.url = url.pathname.slice('/__admin'.length) + url.search;
      await api(req, res); return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
    try {
      if (url.pathname === '/' || url.pathname === '/index.html') {
        if (!url.searchParams.has('admin')) { res.writeHead(302, { Location: '/?admin' }).end(); return; }
        const html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
        const body = html.replace('<head>', '<head><script>window.__BLACKHOLE_PASSWORD_ADMIN__=true;</script>');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(req.method === 'HEAD' ? undefined : body); return;
      }
      // Serve only built asset filenames, never source, dotfiles, or secrets.
      if (!/^\/assets\/[a-zA-Z0-9_.-]+$/.test(url.pathname)) { res.writeHead(404).end(); return; }
      const body = await readFile(resolve(root, 'dist', url.pathname.slice(1)));
      const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
      res.writeHead(200, { 'Content-Type': types[extname(url.pathname)] || 'application/octet-stream' }).end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(404).end(); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = createAdminServer({ publicOrigin: process.env.RENDER_EXTERNAL_URL || process.env.ADMIN_PUBLIC_URL, password: process.env.ADMIN_PASSWORD });
  if (!process.env.BLACKHOLE_GITHUB_TOKEN) throw new Error('BLACKHOLE_GITHUB_TOKEN을 서버 환경 변수에 설정해주세요.');
  server.listen(Number(process.env.PORT || 10000), '0.0.0.0', () => console.log('관리자 서버가 시작되었습니다.'));
}
