import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = path.resolve(process.cwd());
const clientPath = path.join(root, 'secrets', 'client.json');
const scopesPath = path.join(root, 'scopes.json');

const rawClient = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
const cfg = rawClient.installed || rawClient.web;
if (!cfg) throw new Error('Invalid client.json: expected installed/web');

const scopes = JSON.parse(fs.readFileSync(scopesPath, 'utf8')).scopes;
const redirectUri = cfg.redirect_uris?.[0] || 'http://localhost';

const oauth2 = new google.auth.OAuth2(cfg.client_id, cfg.client_secret, redirectUri);
const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
});

console.log('=== GOOGLE OAUTH CONSENT URL ===');
console.log(authUrl);
console.log('\nAfter approval, copy either:');
console.log('1) the full redirected URL (http://localhost/?code=...)');
console.log('2) or just the `code` value');
console.log('\nThen run: npm run auth:token -- "<PASTE_CODE_OR_URL>"');
