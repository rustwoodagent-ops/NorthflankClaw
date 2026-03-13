const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer({});

const PORT = process.env.PORT || 8080;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;
const OPENCLAW_STATE_DIR = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';
const OPENCLAW_WORKSPACE_DIR = process.env.OPENCLAW_WORKSPACE_DIR || '/data/workspace';

let openclawProcess = null;
let isSetupComplete = false;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check if OpenClaw is already configured
function checkSetup() {
  const configPath = path.join(OPENCLAW_STATE_DIR, 'openclaw.json');
  return fs.existsSync(configPath);
}

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', setup: isSetupComplete });
});

// Setup wizard page
app.get('/setup', (req, res) => {
  if (!SETUP_PASSWORD) {
    return res.status(500).send('SETUP_PASSWORD not configured');
  }
  
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${SETUP_PASSWORD}`) {
    return res.status(401).send(`
      <form method="post">
        <h1>OpenClaw Setup</h1>
        <input type="password" name="password" placeholder="Setup Password" required />
        <button type="submit">Continue</button>
      </form>
    `);
  }
  
  res.send(`
    <h1>OpenClaw Setup Wizard</h1>
    <form method="post" action="/setup/configure">
      <input type="hidden" name="password" value="${req.body?.password || ''}" />
      
      <h2>Telegram Bot Token (optional)</h2>
      <input type="text" name="telegramToken" placeholder="123456789:ABC..." />
      
      <h2>Discord Bot Token (optional)</h2>
      <input type="text" name="discordToken" placeholder="Discord bot token" />
      
      <h2>WhatsApp (pairing mode)</h2>
      <label><input type="checkbox" name="enableWhatsapp" /> Enable WhatsApp</label>
      
      <br/><br/>
      <button type="submit">Complete Setup</button>
    </form>
  `);
});

app.post('/setup', (req, res) => {
  if (req.body.password === SETUP_PASSWORD) {
    res.redirect('/setup?auth=true');
  } else {
    res.status(401).send('Invalid password');
  }
});

// Configure OpenClaw
app.post('/setup/configure', async (req, res) => {
  if (req.body.password !== SETUP_PASSWORD) {
    return res.status(401).send('Unauthorized');
  }
  
  try {
    // Run openclaw onboard
    const onboardCmd = spawn('openclaw', [
      'onboard',
      '--non-interactive',
      '--telegram', req.body.telegramToken || '',
      '--discord', req.body.discordToken || '',
      '--whatsapp', req.body.enableWhatsapp ? 'true' : 'false'
    ], {
      env: {
        ...process.env,
        HOME: OPENCLAW_STATE_DIR
      }
    });
    
    let output = '';
    onboardCmd.stdout.on('data', (data) => { output += data; });
    onboardCmd.stderr.on('data', (data) => { output += data; });
    
    onboardCmd.on('close', (code) => {
      if (code === 0) {
        isSetupComplete = true;
        startOpenClaw();
        res.send(`
          <h1>Setup Complete!</h1>
          <p>OpenClaw is now running.</p>
          <a href="/">Go to OpenClaw</a>
        `);
      } else {
        res.status(500).send(`Setup failed: ${output}`);
      }
    });
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Start OpenClaw gateway
function startOpenClaw() {
  if (openclawProcess) return;
  
  openclawProcess = spawn('openclaw', ['gateway', 'start'], {
    env: {
      ...process.env,
      HOME: OPENCLAW_STATE_DIR
    }
  });
  
  openclawProcess.stdout.on('data', (data) => {
    console.log(`[OpenClaw] ${data}`);
  });
  
  openclawProcess.stderr.on('data', (data) => {
    console.error(`[OpenClaw] ${data}`);
  });
  
  openclawProcess.on('close', (code) => {
    console.log(`OpenClaw exited with code ${code}`);
    openclawProcess = null;
  });
}

// Proxy all other requests to OpenClaw
app.use((req, res) => {
  if (!isSetupComplete && !checkSetup()) {
    return res.redirect('/setup');
  }
  
  if (!openclawProcess) {
    startOpenClaw();
  }
  
  proxy.web(req, res, { target: 'http://localhost:18789' }, (err) => {
    if (err) {
      res.status(503).send('OpenClaw is starting... Please refresh in a moment.');
    }
  });
});

// WebSocket support
app.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: 'http://localhost:18789' });
});

// Check if already configured on startup
if (checkSetup()) {
  console.log('OpenClaw already configured, starting...');
  isSetupComplete = true;
  startOpenClaw();
}

app.listen(PORT, () => {
  console.log(`OpenClaw wrapper listening on port ${PORT}`);
  console.log(`Setup URL: http://localhost:${PORT}/setup`);
});
