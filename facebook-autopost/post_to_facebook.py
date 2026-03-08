#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path
from urllib import request, parse, error

ROOT = Path(__file__).resolve().parent
ENV_FILE = ROOT / '.env'
QUEUE_FILE = ROOT / 'posts_queue.json'


def load_env_file(path: Path):
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip())


def fb_post(page_id: str, token: str, message: str, graph_version: str = 'v21.0'):
    endpoint = f"https://graph.facebook.com/{graph_version}/{page_id}/feed"
    payload = parse.urlencode({
        'message': message,
        'access_token': token,
    }).encode('utf-8')
    req = request.Request(endpoint, data=payload, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')

    try:
        with request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data
    except error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"Facebook API error {e.code}: {body}") from e


def ensure_required(page_id: str, token: str):
    missing = []
    if not page_id:
        missing.append('FB_PAGE_ID')
    if not token:
        missing.append('FB_PAGE_ACCESS_TOKEN')
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")


def post_from_queue(page_id: str, token: str, graph_version: str):
    if not QUEUE_FILE.exists():
        raise RuntimeError(f"Queue file not found: {QUEUE_FILE}")

    items = json.loads(QUEUE_FILE.read_text(encoding='utf-8'))
    changed = False
    posted = 0

    for item in items:
        if item.get('published'):
            continue
        msg = (item.get('message') or '').strip()
        if not msg:
            item['published'] = True
            changed = True
            continue

        result = fb_post(page_id, token, msg, graph_version)
        item['published'] = True
        item['facebook_post_id'] = result.get('id')
        changed = True
        posted += 1
        break  # one post per run for safe pacing

    if changed:
        QUEUE_FILE.write_text(json.dumps(items, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    return posted


def main():
    load_env_file(ENV_FILE)

    parser = argparse.ArgumentParser(description='Facebook Page auto-poster')
    parser.add_argument('--message', help='Post a single message now')
    parser.add_argument('--from-queue', action='store_true', help='Publish next unpublished queue item')
    args = parser.parse_args()

    page_id = os.getenv('FB_PAGE_ID', '').strip()
    token = os.getenv('FB_PAGE_ACCESS_TOKEN', '').strip()
    graph_version = os.getenv('FB_GRAPH_VERSION', 'v21.0').strip() or 'v21.0'

    try:
        ensure_required(page_id, token)

        if args.message:
            res = fb_post(page_id, token, args.message.strip(), graph_version)
            print(json.dumps({'ok': True, 'posted': True, 'id': res.get('id')}, indent=2))
            return

        if args.from_queue:
            posted = post_from_queue(page_id, token, graph_version)
            print(json.dumps({'ok': True, 'posted_count': posted}, indent=2))
            return

        print('Nothing to do. Use --message or --from-queue')
    except Exception as exc:
        print(json.dumps({'ok': False, 'error': str(exc)}, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()
