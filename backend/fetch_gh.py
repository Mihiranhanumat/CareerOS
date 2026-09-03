import urllib.request
import json

url = 'https://api.github.com/users/Mihiranhanumat/repos?sort=updated&per_page=20'
req = urllib.request.Request(url, headers={'User-Agent': 'CareerOS-Agent'})
try:
    with urllib.request.urlopen(req) as resp:
        repos = json.loads(resp.read().decode())
        print(f"Total Repos: {len(repos)}")
        for r in repos:
            print(f"- {r.get('name')} (Lang: {r.get('language')})")
            print(f"  Desc: {r.get('description')}")
            print(f"  URL: {r.get('html_url')}")
except Exception as e:
    print('Error:', e)
