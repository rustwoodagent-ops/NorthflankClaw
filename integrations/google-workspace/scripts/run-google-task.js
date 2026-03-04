import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = path.resolve(process.cwd());
const clientPath = path.join(root, 'secrets', 'client.json');
const tokenPath = path.join(root, 'secrets', 'token.json');

function getArg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return fallback;
}

function usage() {
  console.log(`\nrun-google-task usage\n\nCommands:\n  inbox                               List latest Gmail messages\n  send --to <email> --subject <s> --body <b>\n                                      Send Gmail message\n  calendars                           List calendars\n  events --calendar <id> [--max 10]   List upcoming events\n  new-doc --title <title>             Create Google Doc\n  new-sheet --title <title>           Create Google Sheet\n  new-slides --title <title>          Create Google Slides\n  drive-list [--max 10]               List Drive files\n\nExamples:\n  npm run run-google-task -- inbox\n  npm run run-google-task -- send --to you@example.com --subject "Hi" --body "Hello"\n  npm run run-google-task -- new-doc --title "Meeting Notes"\n`);
}

function encodeBase64Url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd || cmd === '--help' || cmd === '-h') {
    usage();
    return;
  }

  if (!fs.existsSync(clientPath) || !fs.existsSync(tokenPath)) {
    throw new Error('Missing client/token. Run auth first.');
  }

  const rawClient = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
  const cfg = rawClient.installed || rawClient.web;
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

  const oauth2 = new google.auth.OAuth2(
    cfg.client_id,
    cfg.client_secret,
    cfg.redirect_uris?.[0] || 'http://localhost'
  );
  oauth2.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  const calendar = google.calendar({ version: 'v3', auth: oauth2 });
  const drive = google.drive({ version: 'v3', auth: oauth2 });
  const docs = google.docs({ version: 'v1', auth: oauth2 });
  const sheets = google.sheets({ version: 'v4', auth: oauth2 });
  const slides = google.slides({ version: 'v1', auth: oauth2 });

  if (cmd === 'inbox') {
    const list = await gmail.users.messages.list({ userId: 'me', maxResults: 10, labelIds: ['INBOX'] });
    const msgs = list.data.messages || [];
    console.log(`Inbox messages: ${msgs.length}`);
    for (const m of msgs) {
      const detail = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From', 'Subject', 'Date'] });
      const headers = detail.data.payload?.headers || [];
      const from = headers.find((h) => h.name === 'From')?.value || '(no from)';
      const subject = headers.find((h) => h.name === 'Subject')?.value || '(no subject)';
      const date = headers.find((h) => h.name === 'Date')?.value || '';
      console.log(`- ${subject}\n  From: ${from}\n  Date: ${date}`);
    }
    return;
  }

  if (cmd === 'send') {
    const to = getArg('--to');
    const subject = getArg('--subject', 'No subject');
    const body = getArg('--body', '');
    if (!to) throw new Error('send requires --to');

    const raw = [
      `To: ${to}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n');

    const encoded = encodeBase64Url(raw);
    const sent = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encoded },
    });
    console.log('Sent message id:', sent.data.id);
    return;
  }

  if (cmd === 'calendars') {
    const res = await calendar.calendarList.list({ maxResults: 50 });
    const items = res.data.items || [];
    console.log(`Calendars: ${items.length}`);
    for (const c of items) console.log(`- ${c.summary} (${c.id})`);
    return;
  }

  if (cmd === 'events') {
    const calendarId = getArg('--calendar', 'primary');
    const max = Number(getArg('--max', '10'));
    const res = await calendar.events.list({
      calendarId,
      maxResults: Number.isFinite(max) ? max : 10,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: new Date().toISOString(),
    });
    const items = res.data.items || [];
    console.log(`Upcoming events (${calendarId}): ${items.length}`);
    for (const ev of items) {
      const start = ev.start?.dateTime || ev.start?.date || '';
      console.log(`- ${start} | ${ev.summary || '(no title)'}`);
    }
    return;
  }

  if (cmd === 'new-doc') {
    const title = getArg('--title', `Doc ${new Date().toISOString()}`);
    const res = await docs.documents.create({ requestBody: { title } });
    console.log('Document created:', res.data.documentId);
    return;
  }

  if (cmd === 'new-sheet') {
    const title = getArg('--title', `Sheet ${new Date().toISOString()}`);
    const res = await sheets.spreadsheets.create({ requestBody: { properties: { title } } });
    console.log('Spreadsheet created:', res.data.spreadsheetId);
    return;
  }

  if (cmd === 'new-slides') {
    const title = getArg('--title', `Slides ${new Date().toISOString()}`);
    const res = await slides.presentations.create({ requestBody: { title } });
    console.log('Presentation created:', res.data.presentationId);
    return;
  }

  if (cmd === 'drive-list') {
    const max = Number(getArg('--max', '10'));
    const res = await drive.files.list({
      pageSize: Number.isFinite(max) ? max : 10,
      fields: 'files(id,name,mimeType,modifiedTime)',
      orderBy: 'modifiedTime desc',
    });
    const items = res.data.files || [];
    console.log(`Drive files: ${items.length}`);
    for (const f of items) {
      console.log(`- ${f.name} (${f.mimeType}) | ${f.id}`);
    }
    return;
  }

  usage();
  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
