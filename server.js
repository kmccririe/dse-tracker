#!/usr/bin/env node
/**
 * DSE Tracker dev server.
 * Serves index.html and proxies POST /api/analyze to Claude via Aperture.
 *
 * Usage:  node server.js         (port 8080)
 *         node server.js 3000    (custom port)
 *
 * Reads the same env vars Claude Code uses:
 *   ANTHROPIC_BEDROCK_BASE_URL   e.g. http://ai/bedrock
 *   ANTHROPIC_MODEL              model ID override
 */

import http   from 'http';
import https  from 'https';
import fs     from 'fs';
import path   from 'path';
import { fileURLToPath } from 'url';

const PORT     = parseInt(process.argv[2] || '8080', 10);
const __dir    = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = process.env.ANTHROPIC_BEDROCK_BASE_URL || 'http://ai/bedrock';
const MODEL    = process.env.ANTHROPIC_MODEL            || 'us.anthropic.claude-opus-4-6-v1';

// Build the Bedrock invoke URL — strip any existing :N suffix before appending
const MODEL_ID   = MODEL.replace(/:\d+$/, '');
const INVOKE_URL = `${BASE_URL}/model/${MODEL_ID}/invoke`;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.md': 'text/markdown', '.csv': 'text/csv',
};

function bedrockRequest(prompt) {
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
}

function proxyToAperture(prompt) {
  return new Promise((resolve, reject) => {
    const body   = bedrockRequest(prompt);
    const parsed = new URL(INVOKE_URL);
    const isHttps = parsed.protocol === 'https:';
    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (isHttps ? 443 : 80),
      path:     parsed.pathname,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const transport = isHttps ? https : http;
    const req = transport.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Aperture ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          const json = JSON.parse(data);
          resolve(json.content?.[0]?.text || '');
        } catch {
          reject(new Error('Invalid JSON from Aperture'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /api/analyze ─────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/analyze') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', async () => {
      try {
        const { prompt } = JSON.parse(body);
        if (!prompt) throw new Error('Missing prompt');
        const text = await proxyToAperture(prompt);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text }));
      } catch (err) {
        console.error('Analyze error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ── Static files ──────────────────────────────────────────────────────────
  let urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(__dir, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return; }
    const mime = MIME[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`DSE Tracker  →  http://localhost:${PORT}`);
  console.log(`Aperture     →  ${INVOKE_URL}`);
});
