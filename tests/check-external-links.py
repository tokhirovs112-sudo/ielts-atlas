#!/usr/bin/env python3
"""Checks that outside links (YouTube videos, Telegram, IELTS.org) still work.

Runs weekly on GitHub. A removed or private YouTube video is reported by name
so it can be replaced. Run locally with: python tests/check-external-links.py
"""
import glob
import json
import re
import sys
import urllib.parse
import urllib.request

SKIP = ("fonts.googleapis", "fonts.gstatic", "w3.org", "schema.org", "api.dictionaryapi.dev", "workers.dev", "t.me/share")
files = ["index.html"] + glob.glob("pages/*.html") + glob.glob("articles/*.html") + glob.glob("js/*.js")
links = set()
for f in files:
    for url in re.findall(r"https?://[^\s\"'<>`)\\]+", open(f, encoding="utf-8").read()):
        url = url.rstrip(".,;")
        if not any(s in url for s in SKIP) and url not in ("https://t.me/",):
            links.add(url)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Englisity link check)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.status, r.read(200_000).decode("utf-8", "replace")


broken = []
for url in sorted(links):
    try:
        if "youtube.com/watch" in url or "youtu.be/" in url:
            status, body = fetch("https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(url, safe=""))
            title = json.loads(body).get("title", "")
            print(f"ok  {url}  ({title})")
        else:
            status, _ = fetch(url)
            print(f"ok  {url}")
    except Exception as e:
        broken.append((url, str(e)[:120]))
        print(f"BROKEN  {url}  {e}")

print()
if broken:
    print(f"{len(broken)} of {len(links)} outside links are broken:")
    for url, why in broken:
        print(f"  - {url}: {why}")
    sys.exit(1)
print(f"All {len(links)} outside links work.")
