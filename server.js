#!/usr/bin/env node
/**
 * DSE Tracker dev server.
 * Serves index.html and proxies POST /api/analyze to Claude via Aperture (Bedrock).
 *
 * Usage:  node server.js         (port 8080)
 *         node server.js 3000    (custom port)
 */

import http from 'http';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const PORT    = parseInt(process.argv[2] || '8080', 10);
const __dir   = path.dirname(fileURLToPath(import.meta.url));

// Aperture config — mirrors the VS Code env vars
const client = new Anthropic({
  baseURL:    process.env.ANTHROPIC_BEDROCK_BASE_URL || 'http://ai/bedrock',
  apiKey:     'ignored',          // Aperture doesn't need a real key
  defaultHeaders: {
    'anthropic-version': '2023-06-01',
  },
});

const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.md':   'text/markdown',
  '.csv':  'text/csv',
  '.ico':  'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  // ── CORS headers (for browser fetches to /api/*) ──────────────────────────
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

        const msg = await client.messages.create({
          model:      process.env.ANTHROPIC_MODEL || 'us.anthropic.claude-opus-4-6-v1',
          max_tokens: 1024,
          messages:   [{ role: 'user', content: prompt }],
        });

        const text = msg.content?.[0]?.text || '';
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

  // ── Static file serving ───────────────────────────────────────────────────
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  // Strip query strings
  urlPath = urlPath.split('?')[0];
  const filePath = path.join(__dir, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`DSE Tracker → http://localhost:${PORT}`);
  console.log(`Aperture endpoint: ${process.env.ANTHROPIC_BEDROCK_BASE_URL || 'http://ai/bedrock'}`);
});
