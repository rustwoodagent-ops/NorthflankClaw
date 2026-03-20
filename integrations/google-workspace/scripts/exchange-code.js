import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = path.resolve(process.cwd());
const clientPath = path.join(root, 'secrets', 'client.json');
const tokenPath = path.join(root, 'secrets', 'token.json');

const input = process.argv[2];
if (!input) {
  console.error('Usage: npm run auth:token -- "<CODE_OR_REDIRECT_URL>"');
  process.exit(1);
}

const rawClient = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
const cfg = rawClient.installed || rawClient.web;
if (!cfg) throw new Error('Invalid client.json: expected installed/web');

const redirectUri = cfg.redirect_uris?.[0] || 'http://localhost';
const oauth2 = new google.auth.OAuth2(cfg.client_id, cfg.client_secret, redirectUri);

let code = input.trim();
if (code.startsWith('http://') || code.startsWith('https://')) {
  const url = new URL(code);
  code = url.searchParams.get('code') || '';
}
if (!code) {
  console.error('Could not find code value.');
  process.exit(1);
}

const { tokens } = await oauth2.getToken(code);
fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
fs.chmodSync(tokenPath, 0o600);

console.log('Token saved:', tokenPath);
console.log('Scopes granted:', (tokens.scope || '').split(' ').filter(Boolean).length);
