from html.parser import HTMLParser
from collections import Counter
from pathlib import Path
import json, re, sys
root=Path(__file__).resolve().parent.parent
errors=[]
class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.ids=[]; self.refs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='script' and a.get('src'): self.refs.append(a['src'])
        if tag=='link' and a.get('href') and not a['href'].startswith(('http:','https:','#')): self.refs.append(a['href'])
p=Parser(); p.feed((root/'index.html').read_text(encoding='utf-8'))
dup=[i for i,n in Counter(p.ids).items() if n>1]
if dup: errors.append('Duplicate HTML ids: '+', '.join(dup))
for ref in p.refs:
    clean=ref.split('?',1)[0].lstrip('./')
    if clean and not (root/clean).exists(): errors.append('Missing local asset: '+ref)
try: json.loads((root/'manifest.webmanifest').read_text(encoding='utf-8'))
except Exception as e: errors.append('Invalid manifest JSON: '+str(e))
sw=(root/'sw.js').read_text(encoding='utf-8')
if 'v191' not in sw: errors.append('Service worker cache is not pinned to v191')
app=(root/'app.js').read_text(encoding='utf-8')
required=['safeStorage','ECONOMY_KEYS','PROGRESS_KEY','GAME_PROFILE_KEY','LEARNING_CENTER_KEY','CHALLENGE_KEY','CLAN_KEY']
for marker in required:
    if marker not in app: errors.append('Missing expected v191 marker: '+marker)
if errors:
    print('\n'.join('FAIL: '+e for e in errors)); sys.exit(1)
print(f'Prototype structural checks: OK ({len(p.ids)} ids, {len(p.refs)} local refs checked)')
