import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = '/home/rustwood/.openclaw/workspace/integrations/google-workspace';
const statePath = path.join(root, 'secrets', 'email-check-state.json');
const rawClient = JSON.parse(fs.readFileSync(path.join(root, 'secrets', 'client.json'), 'utf8'));
const cfg = rawClient.installed || rawClient.web;
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'secrets', 'token.json'), 'utf8'));

let state = { lastCheckIso: '2026-03-12T05:04:33.000Z' };
if (fs.existsSync(statePath)) state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const lastCheck = new Date(state.lastCheckIso);
const afterSeconds = Math.floor(lastCheck.getTime() / 1000);

const oauth2 = new google.auth.OAuth2(cfg.client_id, cfg.client_secret, cfg.redirect_uris?.[0] || 'http://localhost');
oauth2.setCredentials(tokens);
const gmail = google.gmail({ version: 'v1', auth: oauth2 });

const q = `in:inbox is:unread after:${afterSeconds}`;
const list = await gmail.users.messages.list({ userId: 'me', q, maxResults: 50 });
const msgs = list.data.messages || [];
const results = [];
for (const m of msgs) {
  const detail = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From','Subject','Date'] });
  const headers = Object.fromEntries((detail.data.payload?.headers || []).map(h => [h.name, h.value]));
  results.push({ from: headers.From || '', subject: headers.Subject || '', date: headers.Date || '', snippet: detail.data.snippet || '' });
}
state.lastCheckIso = new Date().toISOString();
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
console.log(JSON.stringify({ count: results.length, messages: results }, null, 2));
