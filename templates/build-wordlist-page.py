"""
WORD LIST PAGE BUILDER  (templates/build-wordlist-page.py)

Makes one vocabulary word list page under public/resources/<slug>/ from a
pack CSV (columns: Term, Description) plus a few settings in a JSON file.

  python templates/build-wordlist-page.py templates/wordlists/thanksgiving.json

What it does:
  1. Copies the CSV next to the page, so teachers can download it and
     upload it straight into Live Glossary Pro.
  2. Writes public/resources/<slug>/index.html (word list, copy button,
     how-to-use text, TPT pack link, quick answers, structured data).
  3. Runs update-guides-index.py, which lists the page on /resources/
     (newest first, with its date) and adds it to public/sitemap.xml,
     so the weekly SEO workflow moves on.

The words and meanings always come from YOUR CSV. Nothing is invented here.
"""
import csv, html, json, os, re, shutil, sys

SITE = 'https://liveglossarypro.com'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # project folder
PUB = os.path.join(ROOT, 'public')
esc = lambda s: html.escape(str(s), quote=True)

cfg_path = sys.argv[1]
C = json.load(open(cfg_path, encoding='utf-8'))
cfg_dir = os.path.dirname(os.path.abspath(cfg_path))
slug = C['slug']
url = f'{SITE}/resources/{slug}/'
out_dir = os.path.join(PUB, 'resources', slug)
os.makedirs(out_dir, exist_ok=True)

# ── 1. Read the words (and keep a downloadable copy of the CSV) ─────────────
src_csv = os.path.join(cfg_dir, C['csv'])
rows = [(r[0].strip(), r[1].strip()) for r in csv.reader(open(src_csv, encoding='utf-8-sig')) if len(r) >= 2 and r[0].strip()]
if rows and rows[0][0].lower() in ('term', 'word', 'words', 'vocabulary'): rows = rows[1:]   # skip header row
meaning = dict(rows)
csv_name = C['csvDownloadName']
shutil.copyfile(src_csv, os.path.join(out_dir, csv_name))

# Groups are optional: {"Heading": ["Term", ...]}. Every word must appear once.
groups = C.get('groups') or {'Word list': [t for t, _ in rows]}
grouped = [t for ts in groups.values() for t in ts]
missing = [t for t, _ in rows if t not in grouped]
unknown = [t for t in grouped if t not in meaning]
if missing or unknown or len(grouped) != len(set(grouped)):
    sys.exit(f'Groups do not match the CSV. Missing: {missing}  Not in CSV: {unknown}')

# ── 2. Build the page ───────────────────────────────────────────────────────
def word_rows(terms):
    return '\n'.join(f'          <div class="wl-row" data-term="{esc(t)}" data-meaning="{esc(meaning[t])}"><dt>{esc(t)}</dt><dd>{esc(meaning[t])}</dd></div>' for t in terms)

groups_html = '\n'.join(f'''      <h3>{esc(h)} <span class="count">{len(ts)} words</span></h3>
      <div class="wordlist">
        <dl class="wl">
{word_rows(ts)}
        </dl>
      </div>''' for h, ts in groups.items())

paras = lambda ps: '\n'.join(f'      <p>{p}</p>' for p in ps)   # paragraphs may contain simple HTML
sections_html = '\n'.join(f'\n      <h2>{esc(h)}</h2>\n{paras(ps)}' for h, ps in C.get('sections', []))
faq = C.get('faq', [])
faq_html = ('\n      <h2>Quick answers</h2>\n' + '\n'.join(f'      <h3>{esc(q)}</h3>\n      <p>{esc(a)}</p>' for q, a in faq)) if faq else ''
more_html = ''.join(f'<li><a href="/resources/{s}/">{esc(t)}</a></li>' for s, t in C.get('related', []))

pack = C.get('pack')
pack_html = f'''
      <!-- TPT PACK: the ready-made version of this list -->
      <section class="pack">
        <p class="pack-kicker">Want it ready to print?</p>
        <h2>{esc(pack['name'])}</h2>
        <p>{pack['blurb']}</p>
        <a class="btn" href="{esc(pack['url'])}" target="_blank" rel="noopener noreferrer">See it on Teachers Pay Teachers</a>
      </section>''' if pack else ''

ld = [
  {"@context": "https://schema.org", "@type": "Article", "headline": C['title'], "description": C['meta'],
   "datePublished": C['date'], "dateModified": C['date'], "author": {"@type": "Person", "name": "Cliff Wright"},
   "publisher": {"@type": "Organization", "name": "Live Glossary Pro", "url": SITE + "/"}, "mainEntityOfPage": url},
  # DefinedTermSet: marks the list as a set of terms with definitions
  {"@context": "https://schema.org", "@type": "DefinedTermSet", "name": C['title'], "url": url,
   "hasDefinedTerm": [{"@type": "DefinedTerm", "name": t, "description": d} for t, d in rows]},
]
if faq:
    ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]})
ld_html = '\n'.join(f'  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)

page = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Built by templates/build-wordlist-page.py from {esc(C['csv'])} — edit the JSON and rebuild rather than editing this file -->
  <title>{esc(C['title'])} | Live Glossary Pro</title>
  <meta name="description" content="{esc(C['meta'])}" />
  <!-- Card on /resources/: name and one-line description -->
  <meta name="lgp:card-title" content="{esc(C['title'])}" />
  <meta name="lgp:card" content="{esc(C['card'])}" />
  <link rel="canonical" href="{url}" />
  <meta name="theme-color" content="#1A1A1A" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{esc(C['title'])}" />
  <meta property="og:description" content="{esc(C['meta'])}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:image" content="{SITE}/img/og-share.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="stylesheet" href="/resources/resources.css" />
  <!-- Structured data: the article, the word list as defined terms, and the quick answers -->
{ld_html}
</head>
<body>

  <!-- HEADER: same brand and button as the app -->
  <header class="site-head">
    <nav aria-label="Main">
      <a href="/" class="brand"><img src="/logo.svg" alt="" width="44" height="44" /><span>Live Glossary <span class="pro-pill">Pro</span></span></a>
      <a class="btn btn-gold" href="/make">Make worksheets</a>
    </nav>
  </header>

  <main class="read">
    <p class="crumbs"><a href="/">Home</a> › <a href="/resources/">Teacher guides</a></p>

    <article>
      <h1>{esc(C['h1'][0])} <span class="hl">{esc(C['h1'][1])}</span></h1>
      <p class="byline">By Cliff Wright · {esc(C['dateText'])} · {len(rows)} words</p>

      <p class="lede">{C['lede']}</p>

      <!-- ACTIONS: copy the list, download the CSV, open the generator -->
      <div class="actions">
        <button type="button" class="btn btn-gold" id="copy-list">Copy the word list</button>
        <a class="btn" href="{esc(csv_name)}" download>Download CSV</a>
        <a class="btn" href="/make">Make worksheets</a>
      </div>
      <p class="actions-note">Copy the list and paste it into Live Glossary Pro, or upload the CSV. Then pick any worksheet.</p>

{groups_html}
{sections_html}
{pack_html}
{faq_html}

      <!-- MORE GUIDES -->
      <section class="more">
        <h2>More teacher guides</h2>
        <ul>{more_html}</ul>
      </section>

      <section class="cta">
        <h2>Make worksheets from this list</h2>
        <p>Free for teachers. No sign-up. Your word list is never uploaded.</p>
        <a class="btn btn-gold btn-big" href="/make">Make worksheets</a>
      </section>
    </article>
  </main>

  <!-- FOOTER: same links and privacy line as the app -->
  <footer class="site-foot">
    <div class="wrap">
      <a href="/" class="brand"><img src="/logo.svg" alt="" width="34" height="34" /><span>Live Glossary <span class="pro-pill">Pro</span></span></a>
      <a href="/make">Make worksheets</a>
      <a href="/resources/">Teacher guides</a>
      <a href="https://www.teacherspayteachers.com/store/liveglossarypro-resources" target="_blank" rel="noopener noreferrer">Our TPT store</a>
      <a href="https://buymeacoffee.com/cliffowright" target="_blank" rel="noopener noreferrer">Buy me a coffee</a>
      <span style="font-size:14px;color:var(--muted)">© 2026 Live Glossary Pro</span>
      <p class="privacy-line">Privacy: worksheets are made in your browser, and your word lists are never uploaded. Only the request form and email signup send anything to us.</p>
    </div>
  </footer>

  <!-- COPY BUTTON: puts "word — meaning" lines on the clipboard, the format Live Glossary Pro reads -->
  <script>
  (function () {{
    var btn = document.getElementById('copy-list');
    if (!btn) return;
    btn.addEventListener('click', function () {{
      var lines = Array.prototype.map.call(document.querySelectorAll('.wl-row'), function (r) {{
        return r.getAttribute('data-term') + ' — ' + r.getAttribute('data-meaning');
      }}).join('\\n');
      function done(ok) {{ btn.textContent = ok ? 'Copied! Now paste it in' : 'Copy failed — use Download CSV'; setTimeout(function () {{ btn.textContent = 'Copy the word list'; }}, 2500); }}
      if (navigator.clipboard && navigator.clipboard.writeText) {{
        navigator.clipboard.writeText(lines).then(function () {{ done(true); }}, function () {{ done(false); }});
      }} else {{
        // Older browsers: copy from a hidden text box
        var t = document.createElement('textarea'); t.value = lines; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        var ok = false; try {{ ok = document.execCommand('copy'); }} catch (e) {{}}
        document.body.removeChild(t); done(ok);
      }}
    }});
  }})();
  </script>
</body>
</html>
'''
open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf-8').write(page)

# ── 3. List it on /resources/ and in the sitemap ────────────────────────────
# The index and sitemap are rebuilt from all the pages, newest first.
import subprocess
subprocess.run([sys.executable, os.path.join(ROOT, 'templates', 'update-guides-index.py')], check=True)
print(f'Built /resources/{slug}/ with {len(rows)} words.')
