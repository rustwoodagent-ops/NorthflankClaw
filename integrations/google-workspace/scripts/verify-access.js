import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = path.resolve(process.cwd());
const clientPath = path.join(root, 'secrets', 'client.json');
const tokenPath = path.join(root, 'secrets', 'token.json');

if (!fs.existsSync(tokenPath)) {
  console.error('Missing token file. Run auth first.');
  process.exit(1);
}

const rawClient = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
const cfg = rawClient.installed || rawClient.web;
const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

const oauth2 = new google.auth.OAuth2(cfg.client_id, cfg.client_secret, cfg.redirect_uris?.[0] || 'http://localhost');
oauth2.setCredentials(tokens);

const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2 });
const gmail = google.gmail({ version: 'v1', auth: oauth2 });
const calendar = google.calendar({ version: 'v3', auth: oauth2 });
const drive = google.drive({ version: 'v3', auth: oauth2 });
const docs = google.docs({ version: 'v1', auth: oauth2 });
const sheets = google.sheets({ version: 'v4', auth: oauth2 });
const slides = google.slides({ version: 'v1', auth: oauth2 });

const profile = await oauth2Api.userinfo.get();
const gmailProfile = await gmail.users.getProfile({ userId: 'me' });
const calList = await calendar.calendarList.list({ maxResults: 1 });
const driveList = await drive.files.list({ pageSize: 1, fields: 'files(id,name,mimeType)' });

const doc = await docs.documents.create({ requestBody: { title: `Howard Docs Test ${new Date().toISOString()}` } });
const sheet = await sheets.spreadsheets.create({ requestBody: { properties: { title: `Howard Sheets Test ${new Date().toISOString()}` } } });
const presentation = await slides.presentations.create({ requestBody: { title: `Howard Slides Test ${new Date().toISOString()}` } });

console.log('✅ OAuth user:', profile.data.email);
console.log('✅ Gmail access: messagesTotal =', gmailProfile.data.messagesTotal);
console.log('✅ Calendar access: calendars >=', calList.data.items?.length || 0);
console.log('✅ Drive access: sample files fetched =', driveList.data.files?.length || 0);
console.log('✅ Docs create: documentId =', doc.data.documentId);
console.log('✅ Sheets create: spreadsheetId =', sheet.data.spreadsheetId);
console.log('✅ Slides create: presentationId =', presentation.data.presentationId);

console.log('\nVerification complete for: Gmail, Calendar, Drive, Docs, Sheets, Slides');
