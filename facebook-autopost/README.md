# Facebook Auto Posting (Grit & Groove Karaoke)

This setup posts to your Facebook Page via Graph API.

## What is already set up
- Target page resolved from share URL:
  - Name: **Grit & Groove Karaoke**
  - URL: `https://www.facebook.com/people/Grit-Groove-Karaoke/61584210056627/`
  - Candidate Page/Profile ID: `61584210056627`
- Posting script created: `post_to_facebook.py`
- Queue format created: `posts_queue.json`

## Required to go live (one-time)
You must provide a valid **Page Access Token** with posting permissions.

### 1) Create/get token in Meta Graph API Explorer
1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app (or create one).
3. Generate a User Access Token with scopes:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
4. Use `/me/accounts` to list pages and copy:
   - actual `page_id`
   - corresponding `access_token` (Page token)

### 2) Save env vars
Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Set:
- `FB_PAGE_ID`
- `FB_PAGE_ACCESS_TOKEN`

### 3) Test single post
```bash
python3 post_to_facebook.py --message "Test post from Howard automation"
```

### 4) Auto-post queued content
Use:
```bash
python3 post_to_facebook.py --from-queue
```

## Queue file format (`posts_queue.json`)
```json
[
  {"message":"Tonight at 7:30pm — karaoke kicks off 🎤","published":false},
  {"message":"New songs added to the set list!","published":false}
]
```

The script marks posted items as `"published": true` after successful publish.

## Optional scheduling
Run every hour (crontab example):
```cron
0 * * * * cd /home/rustwood/.openclaw/workspace/facebook-autopost && /usr/bin/python3 post_to_facebook.py --from-queue >> autopost.log 2>&1
```

---
If you send me the Page token + final Page ID, I can finish the live wiring and run a verified publish test.
