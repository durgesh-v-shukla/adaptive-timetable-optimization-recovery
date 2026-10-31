/**
 * server.js — Dev server for Adaptive Timetable Framework
 * Serves frontend/ and output/ on http://localhost:3000
 * POST /api/run?type=room&id=0  →  re-runs the C++ backend and returns fresh JSON
 */

const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const cp    = require('child_process');
const url   = require('url');

const PORT = 3000;
const ROOT = __dirname;
const EXE  = path.join(ROOT, 'build', 'timetable.exe');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.js'  : 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico' : 'image/x-icon',
  '.png' : 'image/png',
  '.svg' : 'image/svg+xml',
};

/* ── helpers ─────────────────────────────────────────────────────── */
function sendJSON(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + filePath);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type' : mime,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
}

/* ── server ──────────────────────────────────────────────────────── */
const server = http.createServer((req, res) => {
  const parsed  = url.parse(req.url, true);
  const urlPath = parsed.pathname;

  // ── CORS preflight ───────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST' });
    res.end();
    return;
  }

  // ── POST /api/run — re-runs the C++ backend ──────────────────────
  if (req.method === 'POST' && urlPath === '/api/run') {
    const type = parsed.query.type || 'room';
    const id   = parseInt(parsed.query.id || '0', 10);

    if (!fs.existsSync(EXE)) {
      return sendJSON(res, 500, { error: 'timetable.exe not found. Run run.bat first.' });
    }

    cp.execFile(EXE, [type, String(id)], { cwd: ROOT }, (err, stdout) => {
      if (err) {
        return sendJSON(res, 500, { error: err.message, stdout });
      }
      // Read freshly written JSON
      fs.readFile(path.join(ROOT, 'output', 'timetable.json'), 'utf8', (e2, data) => {
        if (e2) return sendJSON(res, 500, { error: 'JSON not written by backend.' });
        try {
          const json = JSON.parse(data);
          sendJSON(res, 200, { ok: true, stdout, data: json });
        } catch (e3) {
          sendJSON(res, 500, { error: 'JSON parse error.' });
        }
      });
    });
    return;
  }

  // ── GET static files ─────────────────────────────────────────────
  let filePath = urlPath;
  if (filePath === '/') filePath = '/frontend/index.html';

  // Prevent traversal
  const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
  serveFile(res, path.join(ROOT, safePath));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  Adaptive Timetable Framework — Dev Server');
  console.log('  ──────────────────────────────────────────');
  console.log('  http://localhost:' + PORT);
  console.log('  POST /api/run?type=[room|teacher|slot]&id=<n>');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
