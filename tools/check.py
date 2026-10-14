"""Validate generated pages and all declared images without extra dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import sys,json,re
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'_build'))
import data

class Links(HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.inline=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('img','script','link','a'):
            ref=a.get('src') or a.get('href')
            if ref:self.refs.append(ref)

errors=[];pages=list(ROOT.glob('*.html'))+list((ROOT/'char').glob('*.html'))
for page in pages:
    raw=page.read_text(encoding='utf-8')
    if re.search('[\u2013\u2014]',raw):errors.append(f'Forbidden dash: {page.name}')
    parser=Links();parser.feed(raw)
    for ref in parser.refs:
        parsed=urlsplit(ref)
        if parsed.scheme or ref.startswith('#'):continue
        target=(page.parent/unquote(parsed.path)).resolve()
        if not target.is_file():errors.append(f'{page.name}: missing {ref}')
    if 'https://cdn.' in raw:errors.append(f'External CDN: {page.name}')
    payload=json.loads(re.search(r'<script id="site-data" type="application/json">(.*?)</script>',raw,re.S)[1].replace('<\\/','</'))
    for char in payload['characters']:
        for group in char['gallery']:
            for rel in group:
                if not (ROOT/rel).is_file():errors.append('Gallery image missing: '+rel)
if len(pages)!=12:errors.append(f'Expected 12 pages, got {len(pages)}')
fonts=list((ROOT/'assets/fonts').glob('*.woff2'))
if len(fonts)!=4:errors.append('Expected four local font families')
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages, {len(list((ROOT/"images/CS").glob("*.webp")))} character images, local links, four fonts, no forbidden dashes.')
