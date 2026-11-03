"""
GUIDES INDEX UPDATER  (templates/update-guides-index.py)

Rebuilds the two lists on /resources/ (word lists and how-to guides) from
the guide pages themselves, newest first, with each page's date shown.
Also makes sure every guide is in sitemap.xml with an up-to-date <lastmod>.

  python templates/update-guides-index.py

Run it after adding or editing any page in public/resources/.
(build-wordlist-page.py runs it for you.)

Where each card's details come from, inside each page's <head>:
  <meta name="lgp:card-title" content="...">   the name shown on /resources/
  <meta name="lgp:card" content="...">         the one-line description
  JSON-LD "datePublished" / "dateModified"     the dates (YYYY-MM-DD)
  JSON-LD "DefinedTermSet"                     present = a word list page
"""
import glob, html, json, os, re, sys
from datetime import date

SITE = 'https://liveglossarypro.com'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, 'public', 'resources')
INDEX = os.path.join(RES, 'index.html')
SITEMAP = os.path.join(ROOT, 'public', 'sitemap.xml')
esc = lambda s: html.escape(s, quote=True)

def nice(d):   # 2026-11-03 -> November 3, 2026
    y, m, dd = map(int, d.split('-'))
    return date(y, m, dd).strftime('%B ') + str(dd) + date(y, m, dd).strftime(', %Y')

index = open(INDEX, encoding='utf-8').read()

# Cards already on the index (used once to fill in pages that lack the lgp: meta tags,
# and to keep the current order for pages published on the same day).
old_cards = {m.group(1): (html.unescape(m.group(2)), html.unescape(m.group(3)))
             for m in re.finditer(r'<li><a href="/resources/([^/]+)/"><strong>(.*?)</strong>(?:<time[^>]*>.*?</time>)?<span>(.*?)</span>', index)}
old_order = list(old_cards)

pages = []
for path in sorted(glob.glob(os.path.join(RES, '*', 'index.html'))):
    slug = os.path.basename(os.path.dirname(path))
    s = open(path, encoding='utf-8').read()
    meta = lambda name: (re.search(rf'<meta name="{name}" content="([^"]*)"', s) or [None, None])[1]
    title, card = meta('lgp:card-title'), meta('lgp:card')
    if not (title and card):
        if slug not in old_cards:
            sys.exit(f'{slug}: add <meta name="lgp:card-title"> and <meta name="lgp:card"> to its <head>.')
        title, card = old_cards[slug]
        # Store them in the page so the index can always be rebuilt from the pages alone
        tags = (f'  <!-- Card on /resources/: name and one-line description -->\n'
                f'  <meta name="lgp:card-title" content="{esc(title)}" />\n'
                f'  <meta name="lgp:card" content="{esc(card)}" />\n')
        s = s.replace('  <link rel="canonical"', tags + '  <link rel="canonical"', 1)
        open(path, 'w', encoding='utf-8').write(s)
    else:
        title, card = html.unescape(title), html.unescape(card)
    pub = re.search(r'"datePublished":\s*"(\d{4}-\d{2}-\d{2})"', s)
    mod = re.search(r'"dateModified":\s*"(\d{4}-\d{2}-\d{2})"', s)
    if not pub: sys.exit(f'{slug}: no datePublished in its structured data.')
    pages.append(dict(slug=slug, title=title, card=card, pub=pub[1], mod=mod[1] if mod else pub[1],
                      wordlist='"DefinedTermSet"' in s))

# Newest first. Same day: keep the current index order; brand-new pages go first.
rank = lambda p: old_order.index(p['slug']) if p['slug'] in old_order else -1
pages.sort(key=lambda p: (p['pub'], -rank(p)), reverse=True)

def items(ps):
    out = []
    for p in ps:
        when = f'<time datetime="{p["pub"]}">{nice(p["pub"])}</time>'
        if p['mod'] > p['pub']:
            when = f'<time datetime="{p["mod"]}">Updated {nice(p["mod"])}</time>'
        out.append(f'      <li><a href="/resources/{p["slug"]}/"><strong>{esc(p["title"])}</strong>{when}<span>{esc(p["card"])}</span></a></li>')
    return '\n'.join(out)

lists = [p for p in pages if p['wordlist']]
guides = [p for p in pages if not p['wordlist']]

# Rebuild everything between the lede and </main>
body = ''
if lists:
    body += f'''    <!-- WORD LISTS: rebuilt by templates/update-guides-index.py — don't edit by hand -->
    <h2 id="word-lists">Vocabulary word lists</h2>
    <ul class="guide-list wordlists">
{items(lists)}
    </ul>

    <h2 id="how-to">How-to guides</h2>
'''
body += f'''    <!-- GUIDE LIST: rebuilt by templates/update-guides-index.py — don't edit by hand -->
    <ul class="guide-list">
{items(guides)}
    </ul>
'''
new_index, n = re.subn(r'(<p class="lede">.*?</p>\n\n).*?(  </main>)', lambda m: m.group(1) + body + m.group(2), index, flags=re.S)
if n != 1: sys.exit('Could not find the list area in public/resources/index.html')
open(INDEX, 'w', encoding='utf-8').write(new_index)

# Sitemap: every page listed, <lastmod> = last change
sm = open(SITEMAP, encoding='utf-8').read()
for p in pages:
    loc = f'{SITE}/resources/{p["slug"]}/'
    block = re.search(rf'(<loc>{re.escape(loc)}</loc>\s*<lastmod>)([^<]*)(</lastmod>)', sm)
    if block: sm = sm.replace(block[0], block[1] + p['mod'] + block[3])
    else: sm = sm.replace('</urlset>', f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>{p["mod"]}</lastmod>\n  </url>\n</urlset>')
latest = max(p['mod'] for p in pages)   # the /resources/ page changes whenever a guide does
idx = re.search(rf'(<loc>{re.escape(SITE)}/resources/</loc>\s*<lastmod>)([^<]*)(</lastmod>)', sm)
if idx: sm = sm.replace(idx[0], idx[1] + latest + idx[3])
open(SITEMAP, 'w', encoding='utf-8').write(sm)

print(f'/resources/ rebuilt: {len(lists)} word lists, {len(guides)} guides, newest first. Sitemap updated.')
