// ═══════════════════════════════════════════════════════════════════════════
// PRINT ENGINE  (src/worksheets/engine.js)
//
// What this file does
// -------------------
// Every worksheet we generate is ONE self-contained .html file. Inside it:
//
//   1. <style>     – fonts (embedded, so it works offline) + page styles
//   2. <template>  – all the worksheet content, split into <section>s
//                    (Part A, Part B, Answer Key…). A <template> is never shown
//                    on screen; it's just a box of raw material.
//   3. <script>    – the "layout script" (see lgpRuntime below). When the file
//                    opens, it takes the raw material out of the <template> and
//                    pours it onto fixed-size paper pages, measuring as it goes.
//
// Why lay out in the browser instead of here?
// Only the browser knows exactly how tall a line of text will be with the real
// fonts. By measuring at open time we can guarantee:
//   • every section starts on a fresh page
//   • a question/item is never split across two pages – it moves to a
//     "(continued)" page instead
//   • long text inside fixed boxes (flash cards, bingo squares) shrinks to fit
//
// The generators (generators.js) only need to produce sections of HTML using
// flowSection() or fixedSection() below, then hand them to buildDoc().
// ═══════════════════════════════════════════════════════════════════════════
import { FONT_FREDOKA_600, FONT_ANDIKA_400, FONT_ANDIKA_700 } from './fonts.js';
import { iconSprite, decoIcon } from './clipart.js';

// ───────────────────────────────────────────────────────────────────────────
// SMALL HELPERS (used by the generators)
// ───────────────────────────────────────────────────────────────────────────

/** Make text safe to put inside HTML (stops "<b>" in a CSV from becoming bold, or worse). */
export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Return a shuffled COPY of an array (the original is untouched).
 * Fisher–Yates: walk backwards, swap each item with a random earlier one.
 * Every order is equally likely (the old `sort(() => Math.random() - 0.5)`
 * trick is biased).
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Escape characters that have special meaning inside a regular expression.
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Hide the term inside its own definition so a clue doesn't give the answer away.
 *   maskTerm("A volcano erupts lava", "Volcano")  →  "A _____ erupts lava"
 * Also catches simple plurals ("volcanoes"). \p{L} = any letter in any language.
 */
export function maskTerm(text, term) {
  const t = String(term || '').trim();
  if (t.length < 2) return String(text || '');
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])${reEsc(t)}(?:e?s)?(?=$|[^\\p{L}\\p{N}])`, 'giu');
  return String(text || '').replace(re, (m, pre) => `${pre}_____`);
}

/**
 * Turn a term into grid letters for word search / crossword:
 * accents removed (é → E, ñ → N), upper-case, letters only.
 *   puzzleWord("Café au lait") → "CAFEAULAIT"
 */
export const puzzleWord = (term) => String(term || '')
  .normalize('NFD').replace(/[\u0300-\u036F]/g, '')   // split "é" into "e" + accent, then drop the accent
  .toUpperCase().replace(/[^A-Z]/g, '');

/** Remove duplicate terms (case-insensitive). Duplicates make answer keys ambiguous. */
export function dedupe(data) {
  const seen = new Set();
  return data.filter(d => {
    const k = d.term.trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

/**
 * Split items into groups, closing a group when it reaches `maxCount` items
 * OR its total "weight" would pass `maxWeight`. Used for matching sets, where
 * weight ≈ how much text a row has, so a set never gets too tall for a page.
 */
export function chunkBy(items, maxCount, maxWeight, weight) {
  const out = []; let cur = []; let w = 0;
  for (const it of items) {
    const iw = weight(it);
    if (cur.length && (cur.length >= maxCount || w + iw > maxWeight)) { out.push(cur); cur = []; w = 0; }
    cur.push(it); w += iw;
  }
  if (cur.length) out.push(cur);
  return out;
}

/** Split an array into pieces of n:  chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]] */
export const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// ───────────────────────────────────────────────────────────────────────────
// COLOUR HELPERS – the app's themes include light accents (gold, cyan) that
// are unreadable as text on white paper, so we derive safe colours from them.
// ───────────────────────────────────────────────────────────────────────────

// Relative luminance (0 = black, 1 = white) – the standard WCAG formula.
function lum(hex) {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => {
    const v = parseInt(c.substr(i, 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Black or white text, whichever reads better on the given background colour. */
export const onColor = (hex) => (lum(hex) > 0.36 ? '#222222' : '#FFFFFF');

/** Darken a colour step by step until it is readable on white (contrast ≥ 4.6:1). */
function readableInk(hex) {
  let c = hex.replace('#', '');
  let [r, g, b] = [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16));
  for (let k = 0; k < 20; k++) {
    const h = '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    if ((1.05) / (lum(h) + 0.05) >= 4.6) return h;
    r *= 0.88; g *= 0.88; b *= 0.88;
  }
  return '#333333';
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION BUILDING BLOCKS
// ───────────────────────────────────────────────────────────────────────────

// "Name ____  Class ____  Date ____  [Score __ / 25]"
const nameRow = (score) => `
<div class="name-row">
  <span>Name</span><i class="ln wide"></i>
  <span>Class</span><i class="ln"></i>
  <span>Date</span><i class="ln"></i>
  ${score ? `<span class="score">Score <i class="ln tiny"></i> / ${score}</span>` : ''}
</div>`;

/**
 * Build the two header versions for a section. The layout script picks:
 *   .h-first – full header on the FIRST page of the section
 *   .h-cont  – slim header on any "(continued)" pages
 *
 * Options (all optional except title):
 *   title       big outlined title, e.g. "Vocabulary Quiz"
 *   topic       small line above the title, e.g. "Unit 3 Science"
 *   label       text in the coloured pill, e.g. "Part A"
 *   heading     text next to the pill, e.g. "Multiple Choice"
 *   directions  instruction sentence (may contain simple HTML)
 *   icon        clipart name for the picture beside the title
 *   kind        'student' (default) | 'key' (answer key) | 'teacher' | 'plain'
 *   score       if set, adds "Score __ / N" to the name row
 *   noName      true = leave out the Name/Class/Date row
 */
export function sectionHeads(o) {
  const isKey = o.kind === 'key', isTeacher = o.kind === 'teacher';
  const showName = !isKey && !isTeacher && !o.noName;   // answer keys & teacher pages don't need a name line
  const pill = isKey ? `<span class="pill key">Answer Key</span>`
    : isTeacher ? `<span class="pill teacher">Teacher Page</span>`
    : (o.label ? `<span class="pill">${esc(o.label)}</span>` : '');
  return `
<div class="h-first">
  ${showName ? nameRow(o.score) : ''}
  <div class="hd">
    ${o.icon ? `<div class="hd-art">${decoIcon(o.icon)}</div>` : ''}
    <div class="hd-txt">
      ${o.topic ? `<div class="kicker">${esc(o.topic)}</div>` : ''}
      <h1 class="ttl">${esc(o.title)}</h1>
    </div>
    ${isKey ? `<div class="stamp">For the teacher</div>` : ''}
  </div>
  ${(pill || o.heading) ? `<div class="part">${pill}<span class="part-name">${esc(o.heading || '')}</span></div>` : ''}
  ${o.directions ? `<p class="dir"><b>Directions:</b> ${o.directions}</p>` : ''}
</div>
<div class="h-cont">
  ${showName ? nameRow(o.score) : ''}
  <div class="part">${pill}<span class="part-name">${esc(o.heading || o.title)} <em>(continued)</em></span></div>
</div>`;
}

/**
 * A FLOWING section: a list of items poured onto as many pages as needed.
 * Each item (one HTML string) is kept whole – it is never split across pages.
 *
 *   items        array of HTML strings
 *   o.listClass  CSS class for the list (e.g. a 2-column grid)
 *   o.pre        HTML shown once at the top of the first page (e.g. a puzzle grid)
 *   o.bank       true = add a Word Bank to each page, built from the items on
 *                that page that carry data-answer="…"
 */
export function flowSection(o, items) {
  return `<section data-mode="flow" data-kind="${o.kind || 'student'}"${o.bank ? ' data-bank="1"' : ''}>
${sectionHeads(o)}
${o.pre ? `<div class="pre">${o.pre}</div>` : ''}
<div class="items ${o.listClass || ''}">${items.join('\n')}</div>
</section>`;
}

/**
 * A FIXED section: you supply the exact content of each page (flash cards,
 * bingo cards, Frayer models). One string in `pages` = one sheet of paper.
 * Pass header options (title, heading…) to get the normal header on the first
 * page and the slim "(continued)" header on the rest; omit them for no header.
 */
export function fixedSection(o, pages) {
  return `<section data-mode="fixed" data-kind="${o.kind || 'plain'}">
${o.title ? sectionHeads(o) : ''}
${pages.map(p => `<div class="fixed">${p}</div>`).join('\n')}
</section>`;
}

// ───────────────────────────────────────────────────────────────────────────
// SHARED STYLESHEET  – used by every worksheet; each generator can add more.
// Sizes use inches/points so they match real paper.
// ───────────────────────────────────────────────────────────────────────────
function baseCss(t) {
  const accent = t.accent, ink = readableInk(t.accentDark || t.accent);
  return `
@font-face{font-family:'Fredoka';font-weight:600;font-style:normal;src:url(data:font/woff2;base64,${FONT_FREDOKA_600}) format('woff2');}
@font-face{font-family:'Andika';font-weight:400;font-style:normal;src:url(data:font/woff2;base64,${FONT_ANDIKA_400}) format('woff2');}
@font-face{font-family:'Andika';font-weight:700;font-style:normal;src:url(data:font/woff2;base64,${FONT_ANDIKA_700}) format('woff2');}

/* Theme colours. --pw/--ph = paper width/height (changed by the Paper menu). */
:root{
  --pw:8.5in; --ph:11in;
  --accent:${accent}; --on-accent:${onColor(accent)}; --ink:${ink}; --tint:${t.accentPale};
  --line:#3A3A3A; --soft:#E7E4DC; --red:#D32F2F;
  --c0:#E53935; --c1:#FB8C00; --c2:#43A047; --c3:#1E88E5; --c4:#8E24AA; --c5:#D81B60; --c6:#00897B;
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#DCD8CF;}
body{font-family:'Andika','Trebuchet MS',Verdana,sans-serif;font-size:12pt;color:#222;line-height:1.35;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;}  /* print coloured fills, not just text */
.ic{display:block;width:100%;height:100%;}

/* ── toolbar at the top of the screen (hidden when printing) ── */
.toolbar{position:sticky;top:0;z-index:10;background:#2B2B2B;color:#fff;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:10px 18px;font:500 13px/1.3 system-ui,-apple-system,'Segoe UI',sans-serif;}
.toolbar b{font-weight:700;}
.toolbar .sp{flex:1;}
.toolbar button{background:var(--accent);color:var(--on-accent);border:0;border-radius:6px;padding:9px 18px;font:700 14px system-ui,sans-serif;cursor:pointer;}
.toolbar select{padding:6px 8px;border-radius:5px;border:0;font:13px system-ui,sans-serif;}
.toolbar .tip{opacity:.7;font-size:12px;}
.toolbar .warn{background:#FFF3CD;color:#7A5200;border-radius:4px;padding:3px 8px;display:none;}
.loading{text-align:center;padding:60px;font:15px system-ui,sans-serif;color:#555;}
body.ready .loading{display:none;}

/* ── a sheet of paper ── */
#lgp-pages{padding:24px 0 40px;}
.page{width:var(--pw);height:var(--ph);margin:0 auto 24px;background:#fff;padding:.42in;position:relative;overflow:hidden;
  display:flex;box-shadow:0 2px 10px rgba(0,0,0,.18);}
.page.overflow{outline:4px solid #E53935;}            /* only if something still didn't fit (rare) */
.frame{flex:1;display:flex;flex-direction:column;min-height:0;min-width:0;border:3px solid var(--accent);border-radius:20px;padding:.22in .28in .12in;}
.page.key .frame{border-style:dashed;border-color:var(--red);}      /* answer keys: red dashed border */
.page.plain .frame{border:0;border-radius:0;padding:0;}             /* cut-out pages: no border */
.body{flex:1;min-height:0;position:relative;overflow:hidden;}      /* the area content is poured into */
.foot{display:flex;justify-content:space-between;align-items:center;font-size:8pt;color:#8A8A8A;padding-top:6px;margin-top:4px;border-top:1px solid var(--soft);}
.page.plain .foot{border-top:0;}

/* ── header ── */
.name-row{display:flex;align-items:flex-end;gap:6px;font-size:11pt;font-weight:700;margin-bottom:10px;}
.name-row .ln{flex:1;border-bottom:1.5px solid var(--line);height:1.1em;min-width:.6in;}
.name-row .ln.wide{flex:2.4;}
.name-row .ln.tiny{display:inline-block;flex:none;width:.45in;}
.name-row .score{margin-left:10px;border:2px solid var(--line);border-radius:8px;padding:2px 8px;white-space:nowrap;}
.hd{display:flex;align-items:center;gap:12px;margin-bottom:6px;}
.hd-art{width:58px;height:58px;flex:none;}
.hd-txt{flex:1;min-width:0;}
.kicker{font-family:'Fredoka',sans-serif;font-weight:600;font-size:12pt;color:var(--ink);letter-spacing:.5px;text-transform:uppercase;}
/* outlined "sticker" title: thick dark stroke drawn behind the coloured fill */
.ttl{font-family:'Fredoka','Trebuchet MS',sans-serif;font-weight:600;font-size:31pt;line-height:1.05;color:var(--accent);
  -webkit-text-stroke:5px #2B2B2B;paint-order:stroke fill;letter-spacing:.5px;}
.stamp{font-family:'Fredoka',sans-serif;font-weight:600;color:var(--red);border:2.5px solid var(--red);border-radius:8px;padding:4px 10px;transform:rotate(-4deg);font-size:11pt;}
.part{display:flex;align-items:center;gap:10px;margin:4px 0 6px;}
.pill{display:inline-block;background:var(--accent);color:var(--on-accent);border:2px solid #2B2B2B;border-radius:999px;padding:1px 12px;font-family:'Fredoka',sans-serif;font-weight:600;font-size:12pt;white-space:nowrap;}
.pill.key{background:var(--red);color:#fff;}
.pill.teacher{background:#555;color:#fff;}
.part-name{font-family:'Fredoka',sans-serif;font-weight:600;font-size:15pt;color:#2B2B2B;}
.part-name em{font-style:normal;font-size:11pt;color:#888;}
.h-cont .part-name{font-size:13pt;}
.dir{font-size:11.5pt;margin:2px 0 12px;padding:7px 12px;background:var(--tint);border-radius:10px;}
.dir b{font-weight:700;}

/* ── reusable bits ── */
.num{display:inline-flex;align-items:center;justify-content:center;flex:none;width:26px;height:26px;border-radius:50%;
  color:#fff;font-family:'Fredoka',sans-serif;font-weight:600;font-size:11.5pt;border:2px solid #2B2B2B;}
/* rainbow number circles: n0…n6 cycle through 7 colours */
.n0{background:var(--c0)}.n1{background:var(--c1)}.n2{background:var(--c2)}.n3{background:var(--c3)}.n4{background:var(--c4)}.n5{background:var(--c5)}.n6{background:var(--c6)}
.wline{display:inline-block;border-bottom:1.5px solid var(--line);}
.ans{color:var(--red);font-weight:700;}
.tight{font-size:.9em;}       /* added by the layout script to an item that was too tall for a whole page */
.bank{border:2.5px solid #2B2B2B;border-radius:12px;padding:6px 12px 8px;margin-bottom:12px;background:#fff;}
.bank:empty{display:none;}
.bank-h{font-family:'Fredoka',sans-serif;font-weight:600;font-size:12pt;margin-bottom:3px;}
.bank-w{display:flex;flex-wrap:wrap;gap:4px 18px;font-weight:700;font-size:11.5pt;}
.fit{overflow:hidden;}        /* text the layout script shrinks until it fits its box */

/* ── printing: hide the toolbar, remove shadows/gaps, one .page per sheet ── */
@media print{
  html,body{background:#fff;}
  .toolbar,.loading{display:none!important;}
  #lgp-pages{padding:0;zoom:1!important;}
  .page{margin:0;box-shadow:none;break-after:page;page-break-after:always;}
  .page:last-child{break-after:auto;page-break-after:auto;}
  .page.overflow{outline:0;}
}`;
}

// ───────────────────────────────────────────────────────────────────────────
// THE LAYOUT SCRIPT
// This function is NOT run here. buildDoc() converts it to text and pastes it
// into each downloaded file, where it runs in the teacher's browser.
// Rules for editing it:
//   • it must not use anything from outside the function (no imports, no
//     variables from this file) – it runs in a completely different page
//   • keep it plain, old-style JavaScript so it works in any browser
// ───────────────────────────────────────────────────────────────────────────
function lgpRuntime() {
  var SRC = document.getElementById('lgp-src');      // the <template> holding all sections
  var OUT = document.getElementById('lgp-pages');    // where finished pages go
  var FOOT = document.body.getAttribute('data-foot') || '';
  var PAPER = { letter: ['8.5in', '11in'], a4: ['210mm', '297mm'] };

  // Change the paper size: update the CSS variables AND the @page rule the printer reads.
  function setPaper(p) {
    var s = PAPER[p] || PAPER.letter;
    var r = document.documentElement.style;
    r.setProperty('--pw', s[0]);
    r.setProperty('--ph', s[1]);
    document.getElementById('lgp-page-rule').textContent = '@page{size:' + s[0] + ' ' + s[1] + ';margin:0}';
  }

  // Direct children of `node` matching a CSS selector.
  function kids(node, sel) {
    return [].filter.call(node.children, function (c) { return c.matches(sel); });
  }

  // Create an empty sheet of paper for a section: border, header, body, footer.
  // cont = true → use the slim "(continued)" header.
  function newPage(sec, cont) {
    var pg = document.createElement('div');
    pg.className = 'page ' + (sec.getAttribute('data-kind') || 'student');
    var fr = document.createElement('div');
    fr.className = 'frame';
    var h = kids(sec, cont ? '.h-cont' : '.h-first')[0];
    if (h) fr.appendChild(h.cloneNode(true));
    var body = document.createElement('div');
    body.className = 'body';
    fr.appendChild(body);
    var ft = document.createElement('div');
    ft.className = 'foot';
    var left = document.createElement('span'); left.textContent = FOOT;
    var right = document.createElement('span'); right.className = 'pno';   // "Page X of Y" filled in later
    ft.appendChild(left); ft.appendChild(right);
    fr.appendChild(ft);
    pg.appendChild(fr);
    OUT.appendChild(pg);
    return { el: pg, body: body, hasPre: false };
  }

  // Is the page's content area overfull? (content taller/wider than the box)
  function over(p) {
    return p.body.scrollHeight > p.body.clientHeight + 1 || p.body.scrollWidth > p.body.clientWidth + 1;
  }

  // Shrink every .fit element inside `root` until its text fits its box.
  // data-max / data-min on the element set the starting and smallest font size (pt).
  function fit(root) {
    var list = [].slice.call(root.querySelectorAll('.fit'));
    if (root.classList && root.classList.contains('fit')) list.unshift(root);
    list.forEach(function (n) {
      var mx = parseFloat(n.getAttribute('data-max') || '14');
      var mn = parseFloat(n.getAttribute('data-min') || '7');
      var s = mx;
      n.style.fontSize = s + 'pt';
      while (s > mn && (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1)) {
        s -= 0.5;
        n.style.fontSize = s + 'pt';
      }
    });
  }

  // FLOW section: add items one at a time; when the page overflows, take the
  // last item back off, start a "(continued)" page, and put it there instead.
  function flow(sec) {
    var shell = kids(sec, '.items')[0];
    var pre = kids(sec, '.pre')[0];
    var useBank = sec.getAttribute('data-bank') === '1';
    var items = [].slice.call(shell.children);
    var p, list, bank;
    var prev = null;                              // the page before the current one (for the "lonely last page" fix)

    function start(cont) {
      if (p) prev = { p: p, list: list, bank: bank };
      p = newPage(sec, cont);
      if (!cont && pre) { p.body.appendChild(pre.cloneNode(true)); fit(p.body); p.hasPre = true; }
      bank = null;
      if (useBank) { bank = document.createElement('div'); bank.className = 'bank'; p.body.appendChild(bank); }
      list = shell.cloneNode(false);            // an empty copy of the list (keeps its grid/column CSS)
      p.body.appendChild(list);
    }

    // Rebuild this page's Word Bank from the items currently on it (alphabetical).
    function updBank() {
      if (!bank) return;
      var words = [].map.call(list.querySelectorAll('[data-answer]'), function (n) { return n.getAttribute('data-answer'); })
        .sort(function (a, b) { return a.localeCompare(b); });
      bank.innerHTML = '';
      if (!words.length) return;
      var h = document.createElement('div'); h.className = 'bank-h'; h.textContent = 'Word Bank'; bank.appendChild(h);
      var ws = document.createElement('div'); ws.className = 'bank-w';
      words.forEach(function (x) { var s = document.createElement('span'); s.textContent = x; ws.appendChild(s); });
      bank.appendChild(ws);
    }

    start(false);
    items.forEach(function (it) {
      var n = it.cloneNode(true);
      list.appendChild(n); fit(n); updBank();
      // Too full? Move this item to a new page – unless it's alone on the page
      // (then moving wouldn't help).
      if (over(p) && (list.children.length > 1 || p.hasPre)) {
        list.removeChild(n); updBank();
        start(true);
        list.appendChild(n); fit(n); updBank();
      }
      // Still too big even on its own page: shrink it a little, then flag it.
      if (over(p)) {
        n.classList.add('tight'); fit(n);
        if (over(p)) p.el.classList.add('overflow');
      }
    });

    // Lonely last page: if only 1–2 items spilled onto the final page, try to
    // pull them back by shrinking the previous page a little (down to 88%).
    // This saves a whole sheet of paper per student. If they still don't fit,
    // everything is put back exactly as it was.
    if (prev && !p.hasPre && list.children.length > 0 && list.children.length <= 2) {
      var moving = [].slice.call(list.children);
      moving.forEach(function (n) { prev.list.appendChild(n); });
      var z = 1;
      while (over(prev.p) && z > 0.88) { z -= 0.02; prev.list.style.zoom = z; }
      if (over(prev.p)) {
        prev.list.style.zoom = '';                 // didn't work – undo
        moving.forEach(function (n) { list.appendChild(n); });
      } else {
        OUT.removeChild(p.el);                     // worked – drop the now-empty page
        list = prev.list; bank = prev.bank; p = prev.p;
        updBank();                                 // the word bank now includes the moved items
      }
    }
  }

  // FIXED section: each .fixed block becomes exactly one page.
  function fixed(sec) {
    kids(sec, '.fixed').forEach(function (f, i) {
      var p = newPage(sec, i > 0);
      [].slice.call(f.cloneNode(true).childNodes).forEach(function (c) { p.body.appendChild(c); });
      fit(p.body);
      if (over(p)) p.el.classList.add('overflow');
    });
  }

  // On narrow screens (phones, the in-app preview) shrink the pages to fit the
  // width. Only the on-screen view is zoomed – printing always uses 100%.
  function zoomToFit() {
    var first = OUT.querySelector('.page');
    if (!first) return;
    OUT.style.zoom = '';
    var scale = Math.min(1, (window.innerWidth - 24) / first.offsetWidth);
    if (scale < 0.97) OUT.style.zoom = scale.toFixed(3);   // ignore tiny differences
  }

  // Lay out the whole document from scratch.
  function build() {
    OUT.style.zoom = '';           // measure at true size
    OUT.innerHTML = '';
    [].forEach.call(SRC.content.querySelectorAll('section'), function (sec) {
      if (sec.getAttribute('data-mode') === 'fixed') fixed(sec); else flow(sec);
    });
    var pages = OUT.querySelectorAll('.page');
    [].forEach.call(pages, function (pg, i) {
      var n = pg.querySelector('.pno');
      if (n) n.textContent = 'Page ' + (i + 1) + ' of ' + pages.length;
    });
    // Report results on <body> (handy for automated tests) and show a warning if needed.
    var bad = OUT.querySelectorAll('.page.overflow').length;
    document.body.setAttribute('data-overflow', bad);
    document.body.setAttribute('data-pages', pages.length);
    var w = document.getElementById('lgp-warn');
    if (w) w.style.display = bad ? 'inline-block' : 'none';
    zoomToFit();
  }

  // Remember the paper choice between visits (fails quietly where storage is blocked).
  var saved = 'letter';
  try { saved = localStorage.getItem('lgp-paper') || 'letter'; } catch (e) {}
  var sel = document.getElementById('lgp-paper');
  if (sel) {
    sel.value = saved;
    sel.onchange = function () {
      try { localStorage.setItem('lgp-paper', sel.value); } catch (e) {}
      setPaper(sel.value);
      build();
    };
  }
  var pb = document.getElementById('lgp-print');
  if (pb) pb.onclick = function () { window.print(); };
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(zoomToFit, 150); });

  // Wait for the embedded fonts before measuring (max 2 seconds), then lay out.
  var fonts = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('600 20px Fredoka'), document.fonts.load('400 12px Andika'), document.fonts.load('700 12px Andika')]).catch(function () {})
    : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 2000); })]).then(function () {
    setPaper(saved);
    build();
    document.body.classList.add('ready');
  });
}

// ───────────────────────────────────────────────────────────────────────────
// ASSEMBLE THE FINAL FILE
// ───────────────────────────────────────────────────────────────────────────
/**
 * opts:
 *   title     worksheet name, e.g. "Vocabulary Quiz"
 *   topic     optional topic line from the app
 *   theme     colours from the app's theme picker
 *   sections  array of section HTML (from flowSection / fixedSection)
 *   icons     clipart names used anywhere in the document (only these get embedded)
 *   css       extra CSS for this worksheet type
 *   footerText  optional teacher footer, e.g. "© Ms. Rivera 2026"
 *   credit      false = leave out "Made with Live Glossary Pro"
 */
export function buildDoc(o) {
  const t = o.theme;
  const docTitle = o.topic ? `${o.topic} — ${o.title}` : o.title;
  // Footer (bottom-left of every page): title · teacher's text · credit – whichever are present.
  const foot = [docTitle, o.footerText, o.credit === false ? '' : 'Made with Live Glossary Pro']
    .filter(Boolean).join('  ·  ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(docTitle)}</title>
<style id="lgp-page-rule">@page{size:8.5in 11in;margin:0}</style>
<style>${baseCss(t)}
${o.css || ''}</style>
</head>
<body data-foot="${esc(foot)}">
${iconSprite(o.icons || [])}
<div class="toolbar">
  <b>${esc(docTitle)}</b>
  <span class="warn" id="lgp-warn">Some text was too long and has been shrunk — check the red-outlined page.</span>
  <span class="sp"></span>
  <label>Paper <select id="lgp-paper"><option value="letter">US Letter</option><option value="a4">A4</option></select></label>
  <button id="lgp-print" type="button">Print / Save as PDF</button>
  <span class="tip">In the print dialog: Scale 100%, Margins “Default” or “None”.</span>
</div>
<div class="loading">Laying out pages…</div>
<main id="lgp-pages"></main>
<template id="lgp-src">
${o.sections.join('\n')}
</template>
<script>(${lgpRuntime.toString()})();</script>
</body>
</html>`;
}
