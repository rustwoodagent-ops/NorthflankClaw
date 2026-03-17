import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = path.resolve(process.cwd());
const clientPath = path.join(root, 'secrets', 'client.json');
const tokenPath = path.join(root, 'secrets', 'token.json');

if (!fs.existsSync(clientPath) || !fs.existsSync(tokenPath)) {
  console.error('Missing client/token. Run auth first.');
  process.exit(1);
}

const rawClient = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
const cfg = rawClient.installed || rawClient.web;
if (!cfg) {
  console.error('Invalid client.json: expected installed/web');
  process.exit(1);
}
const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

const oauth2 = new google.auth.OAuth2(
  cfg.client_id,
  cfg.client_secret,
  cfg.redirect_uris?.[0] || 'http://localhost'
);
oauth2.setCredentials(tokens);

const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2 });
const gmail = google.gmail({ version: 'v1', auth: oauth2 });
const drive = google.drive({ version: 'v3', auth: oauth2 });

const profile = await oauth2Api.userinfo.get();
const gmailProfile = await gmail.users.getProfile({ userId: 'me' });
const driveList = await drive.files.list({
  pageSize: 1,
  fields: 'files(id,name,mimeType)',
});

console.log('GOOGLE_AUTH_HEALTH_OK');
console.log('user:', profile.data.email || '(unknown)');
console.log('gmail_messages_total:', gmailProfile.data.messagesTotal ?? '(unknown)');
console.log('drive_sample_count:', driveList.data.files?.length || 0);
console.log('client_file:', clientPath);
console.log('token_file:', tokenPath);
