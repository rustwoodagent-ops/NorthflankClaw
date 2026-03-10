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
  console.log(`\ndrive-upload usage\n\n  node scripts/drive-upload.js --file <path> [--folder "Howard Weekly Backups"]\n\nOutputs JSON: { folderId, fileId, name, webViewLink }\n`);
}

async function getAuth() {
  if (!fs.existsSync(clientPath) || !fs.existsSync(tokenPath)) {
    throw new Error('Missing client/token. Run auth first (see README.md).');
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
  return oauth2;
}

async function ensureFolder(drive, folderName) {
  const q = [
    `mimeType = 'application/vnd.google-apps.folder'`,
    `name = '${folderName.replace(/'/g, "\\'")}'`,
    `'root' in parents`,
    'trashed = false',
  ].join(' and ');

  const res = await drive.files.list({
    q,
    fields: 'files(id,name)',
    pageSize: 10,
  });

  const found = (res.data.files || [])[0];
  if (found?.id) return found.id;

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root'],
    },
    fields: 'id',
  });

  return created.data.id;
}

async function main() {
  const filePath = getArg('--file');
  const folderName = getArg('--folder', 'Howard Weekly Backups');

  if (!filePath || filePath === '--help' || filePath === '-h') {
    usage();
    process.exit(filePath ? 0 : 1);
  }

  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error(`File not found: ${abs}`);

  const auth = await getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const folderId = await ensureFolder(drive, folderName);
  const name = path.basename(abs);

  const res = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
    },
    media: {
      mimeType: 'application/gzip',
      body: fs.createReadStream(abs),
    },
    fields: 'id,name,webViewLink',
  });

  const out = {
    folderId,
    fileId: res.data.id,
    name: res.data.name,
    webViewLink: res.data.webViewLink,
  };

  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
