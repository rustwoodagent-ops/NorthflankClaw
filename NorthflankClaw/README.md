# OpenClaw Northflank Deployment Guide

## Overview
This repository contains everything needed to deploy OpenClaw to Northflank with your existing configuration.

## Files
- `Dockerfile` - Container definition
- `wrapper/` - Web server that handles setup and proxies to OpenClaw
- `northflank.json` - Northflank template configuration
- `backup-openclaw.sh` - Script to backup your local OpenClaw data
- `restore-openclaw.sh` - Script to restore data on Northflank

## Deployment Steps

### 1. Backup Your Local OpenClaw

Run the backup script on your local machine:

```bash
./backup-openclaw.sh
```

This creates a tarball: `openclaw-backup-YYYYMMDD-HHMMSS.tar.gz`

### 2. Prepare Secrets

Before deploying, you need to set these secrets in Northflank:

- `SETUP_PASSWORD` - Password for the setup wizard (generate a strong one)
- `OPENCLAW_GATEWAY_TOKEN` - Will be auto-generated
- `OPENCLAW_STATE_DIR` - Set to `/data/.openclaw`
- `OPENCLAW_WORKSPACE_DIR` - Set to `/data/workspace`

### 3. Deploy to Northflank

Option A: Use the template
```bash
# Go to Northflank dashboard
# Create new project from this GitHub repo
# The northflank.json template will configure everything
```

Option B: Manual deployment
1. Create a new service in Northflank
2. Connect to this GitHub repo
3. Set build context to `/`
4. Add environment variables
5. Add a volume mounted at `/data`

### 4. Restore Your Data

After deployment:
1. Access the Northflank volume
2. Upload your backup tarball
3. Extract it to `/data`

```bash
# On Northflank (via shell access)
cd /data
tar -xzf openclaw-backup-YYYYMMDD-HHMMSS.tar.gz
mv openclaw-backup-*/.openclaw .
mv openclaw-backup-*/workspace .
# etc...
```

### 5. Complete Setup

1. Visit `https://your-app.code.run/setup`
2. Enter your `SETUP_PASSWORD`
3. Configure your bot tokens (Telegram, Discord, WhatsApp)
4. OpenClaw will start automatically

### 6. Verify

- Check health: `https://your-app.code.run/healthz`
- Access OpenClaw: `https://your-app.code.run/`
- Access Control UI: `https://your-app.code.run/openclaw`

## Post-Deployment

### Connecting Your Bots

**Telegram:**
1. Message @BotFather on Telegram
2. Run `/newbot` and follow prompts
3. Copy the token to the setup wizard

**Discord:**
1. Go to https://discord.com/developers/applications
2. Create New Application → Bot → Copy Token
3. Paste into setup wizard

**WhatsApp:**
1. Enable in setup wizard
2. Scan QR code when prompted

### Persistent Data

The `/data` volume persists across redeploys:
- OpenClaw config: `/data/.openclaw/`
- Workspace files: `/data/workspace/`
- Agent data: `/data/agents/`
- Memory: `/data/memory/`

## Troubleshooting

**Container won't start:**
- Check logs in Northflank dashboard
- Verify SETUP_PASSWORD is set

**Can't access /setup:**
- Make sure you're using HTTPS
- Check that port 8080 is exposed

**Bots not responding:**
- Verify bot tokens are correct
- Check that webhooks are configured (for Telegram/Discord)

**Data not persisting:**
- Ensure volume is mounted at `/data`
- Check volume permissions

## Security Notes

- Never commit secrets to this repo
- Use Northflank's secret manager for all sensitive values
- Rotate bot tokens if they were ever exposed
- Use strong SETUP_PASSWORD

## Support

- OpenClaw docs: https://docs.openclaw.ai
- Northflank docs: https://northflank.com/docs
- Issues: Open an issue in this repo
