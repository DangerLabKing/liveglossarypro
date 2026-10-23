// ═══════════════════════════════════════════════════════════════════════════
// CLASS GLOSSARY FILE  (src/worksheets/glossary.js)
//
// Builds the interactive, self-contained "Class Glossary" .html file.
// Teachers open it in any browser (no internet needed) to search the list and
// add, edit or delete words. Then they can:
//   • Save updated glossary – downloads a new copy of this file with the changes
//   • Export CSV            – the list as a spreadsheet file (re-uploads cleanly)
//   • Copy list             – "word — meaning" lines for pasting anywhere
//
// SECURITY (see the build plan's security section):
//   • the word list lives in a JSON <script> block with < > & escaped, so no
//     word can break out of it or run as code
//   • each file gets its own id, so two glossary files never share saved edits
//   • everything is drawn with textContent / DOM methods – never as raw HTML
//   • CSV export guards cells that start with = + - @ (spreadsheet formulas)
// ═══════════════════════════════════════════════════════════════════════════
import { FONT_FREDOKA_600, FONT_ANDIKA_400, FONT_ANDIKA_700 } from './fonts.js';
import { iconSprite, pickIcon } from './clipart.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// JSON that is safe inside a <script> block: < > & and two invisible
// line-break characters become \uXXXX escapes.
const jsonForHtml = (v) => JSON.stringify(v).replace(/[<>&\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

/**
 * @param {object} t     theme colours (already validated as #RRGGBB)
 * @param {Array}  rows  [{ term, description, icon? }]
 * @param {object} opts  { topic, footerText, credit }
 */
export function buildGlossary(t, rows, opts = {}) {
  const topic = String(opts.topic || '').trim().slice(0, 60);
  const footerText = String(opts.footerText || '').trim().slice(0, 80);
  const credit = opts.credit !== false;
  // Picture for each word (same matching as the worksheets). Words the class adds later get a letter tile.
  const terms = rows.map(r => ({ term: r.term, description: r.description, icon: pickIcon(r.term, r.description, r.icon) }));
  const fileId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const data = jsonForHtml({ id: fileId, terms });
  const foot = [footerText, credit ? 'Made with Live Glossary Pro' : ''].filter(Boolean).join('  ·  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(topic ? topic + ' — Class Glossary' : 'Class Glossary')}</title>
<style>
@font-face{font-family:'Fredoka';font-weight:600;src:url(data:font/woff2;base64,${FONT_FREDOKA_600}) format('woff2');}
@font-face{font-family:'Andika';font-weight:400;src:url(data:font/woff2;base64,${FONT_ANDIKA_400}) format('woff2');}
@font-face{font-family:'Andika';font-weight:700;src:url(data:font/woff2;base64,${FONT_ANDIKA_700}) format('woff2');}
:root{--accent:${t.accent};--accent-pale:${t.accentPale};--ink:#2B2B2B;--chalk:#1A1A1A;--paper:#F5F5F0;--muted:#5A574F;--red:#B71C1C;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Andika','Trebuchet MS',sans-serif;background:var(--paper);color:var(--ink);line-height:1.45;font-size:16px;}
button,input,textarea{font:inherit;color:inherit;}
.hdr{background:var(--chalk);color:var(--paper);border-bottom:2.5px solid var(--ink);}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px;}
.hdr .wrap{padding-top:24px;padding-bottom:20px;display:flex;flex-direction:column;gap:14px;}
.title-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;}
.kicker{font-family:'Fredoka',sans-serif;font-weight:600;font-size:14px;color:var(--accent);letter-spacing:1px;text-transform:uppercase;}
h1{font-family:'Fredoka',sans-serif;font-weight:600;font-size:clamp(28px,4vw,38px);line-height:1.05;}
.count{margin-left:auto;font-size:14px;color:#CFCBC0;}
.tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}
.btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:8px 14px;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;border:2px solid var(--paper);background:transparent;color:var(--paper);}
.btn svg{width:16px;height:16px;}
.btn-main{font-family:'Fredoka',sans-serif;font-weight:600;font-size:16px;background:var(--accent);color:#1A1A1A;}
.btn-out{border-color:var(--accent);}
.btn:hover{filter:brightness(1.1);}
.btn.done{background:#2E7D32;border-color:#2E7D32;color:#fff;}
.sep{width:2px;height:30px;background:#555;}
.hint{font-size:13px;color:#CFCBC0;}
.search{display:flex;align-items:center;gap:10px;background:var(--paper);color:var(--ink);border-radius:999px;padding:4px 8px 4px 18px;max-width:640px;}
.search svg{width:18px;height:18px;flex:none;}
.search input{flex:1;border:0;background:transparent;padding:9px 0;outline:none;min-height:40px;}
.search .clear{border:0;background:none;font-size:20px;cursor:pointer;padding:0 8px;color:var(--muted);display:none;}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}
main.wrap{padding-top:22px;padding-bottom:40px;display:flex;flex-direction:column;gap:18px;}
.az{display:flex;flex-wrap:wrap;gap:6px;}
.az a{min-width:36px;min-height:36px;display:inline-flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-weight:600;text-decoration:none;color:var(--ink);background:#fff;border:2px solid var(--ink);border-radius:8px;}
.az a:hover{background:var(--accent-pale);}
.az a.off{opacity:.25;pointer-events:none;}
.letter{display:flex;align-items:center;gap:14px;margin-top:8px;scroll-margin-top:12px;}
.letter b{width:48px;height:48px;background:var(--accent);border:2.5px solid var(--ink);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-weight:600;font-size:28px;color:#1A1A1A;}
.letter span{flex:1;border-top:2.5px dashed var(--ink);}
.letter small{font-size:14px;color:var(--muted);}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
.card{background:#fff;border:2.5px solid var(--ink);border-radius:14px;box-shadow:3px 3px 0 var(--ink);padding:16px 18px;display:flex;gap:14px;}
.card.new{background:#FFFDF3;}
.card svg.ic{width:54px;height:54px;flex:none;}
.card .txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.card h2{font-family:'Fredoka',sans-serif;font-weight:600;font-size:21px;overflow-wrap:anywhere;}
.card p{font-size:15px;color:#444;overflow-wrap:anywhere;}
.card .acts{display:flex;gap:14px;margin-top:4px;}
.link{background:none;border:0;padding:0;font-weight:700;font-size:14px;text-decoration:underline;cursor:pointer;min-height:32px;}
.link.del{color:var(--red);}
mark{background:var(--accent);color:inherit;border-radius:2px;padding:0 1px;}
.form{background:#fff;border:2.5px solid var(--ink);border-radius:14px;box-shadow:4px 4px 0 var(--ink);padding:18px;display:flex;flex-direction:column;gap:10px;}
.form label{font-weight:700;font-size:14px;display:flex;flex-direction:column;gap:4px;}
.form input,.form textarea{border:2px solid var(--ink);border-radius:10px;padding:9px 10px;background:#FFFDF3;}
.form textarea{min-height:80px;resize:vertical;}
.form .row{display:flex;gap:10px;flex-wrap:wrap;}
.form .ok{font-family:'Fredoka',sans-serif;font-weight:600;background:var(--accent);border:2.5px solid var(--ink);border-radius:10px;padding:8px 16px;cursor:pointer;min-height:44px;}
.form .cancel{background:#fff;border:2px solid var(--ink);border-radius:10px;padding:8px 14px;cursor:pointer;min-height:44px;font-weight:700;}
.err{color:var(--red);font-size:14px;font-weight:700;}
.empty{text-align:center;padding:48px 20px;color:var(--muted);}
.loop{background:#fff;border:2.5px dashed var(--ink);border-radius:14px;padding:14px 18px;font-size:15px;}
.loop b{font-family:'Fredoka',sans-serif;font-weight:600;}
.foot{text-align:center;font-size:12px;color:var(--muted);padding:18px;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;z-index:50;}
.overlay.open{display:flex;}
.dialog{background:#fff;border:2.5px solid var(--ink);border-radius:14px;box-shadow:5px 5px 0 var(--ink);padding:22px;max-width:380px;width:90%;}
.dialog h3{font-family:'Fredoka',sans-serif;font-weight:600;font-size:19px;margin-bottom:6px;}
.dialog p{margin-bottom:16px;color:#444;}
.dialog .row{display:flex;gap:10px;justify-content:flex-end;}
.dialog .yes{background:var(--red);color:#fff;border:2px solid var(--ink);border-radius:10px;padding:8px 16px;font-weight:700;cursor:pointer;min-height:44px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(16px);background:var(--chalk);color:#fff;padding:10px 20px;border-radius:999px;font-weight:700;opacity:0;transition:all .25s;pointer-events:none;z-index:60;}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
@media print{.tools,.search,.az,.loop,.acts,.overlay,.toast,.form{display:none!important;}.hdr{background:#fff;color:var(--ink);border-bottom:2px solid var(--ink);}
  .card{box-shadow:none;break-inside:avoid;}body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style>
</head>
<body>
${iconSprite(terms.map(x => x.icon))}
<header class="hdr">
  <div class="wrap">
    <div class="title-row">
      <div>${topic ? `<div class="kicker">${esc(topic)}</div>` : ''}<h1>Class Glossary</h1></div>
      <span class="count" id="count"></span>
    </div>
    <div class="tools">
      <button class="btn btn-main" id="add-btn" type="button">+ Add a word</button>
      <button class="btn" id="save-btn" type="button">Save updated glossary</button>
      <span class="sep" aria-hidden="true"></span>
      <button class="btn btn-out" id="csv-btn" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Export CSV</button>
      <button class="btn btn-out" id="copy-btn" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>Copy list</button>
    </div>
    <p class="hint">Changes are kept in this browser. Use <b>Save updated glossary</b> to keep them in the file itself.</p>
    <label class="search"><span class="sr">Search the glossary</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="#5A574F" stroke-width="2.4"/><path d="M15 15l5 5" stroke="#5A574F" stroke-width="2.6" stroke-linecap="round"/></svg>
      <input id="q" type="search" placeholder="Search words and meanings…" autocomplete="off"/>
      <button class="clear" id="q-clear" type="button" aria-label="Clear search">×</button>
    </label>
  </div>
</header>
<main class="wrap">
  <div id="form-slot"></div>
  <nav class="az" id="az" aria-label="Jump to letter"></nav>
  <div id="list"></div>
  <p class="loop"><b>Words grow all year:</b> add words with your class → <b>Export CSV</b> → upload the file at Live Glossary Pro → new worksheets in seconds.</p>
</main>
${foot ? `<div class="foot">${esc(foot)}</div>` : ''}
<div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <div class="dialog"><h3 id="dlg-title">Delete this word?</h3><p id="dlg-word"></p>
    <div class="row"><button class="cancel link" id="dlg-no" type="button">Cancel</button><button class="yes" id="dlg-yes" type="button">Delete</button></div></div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script type="application/json" id="lgp-data">${data}</script>
<script>(${glossaryRuntime.toString()})();</script>
</body>
</html>`;
}

// ───────────────────────────────────────────────────────────────────────────
// THE GLOSSARY'S SCRIPT — runs inside the downloaded file, not in the app.
// Must not use anything from outside this function. Plain, old-style JS.
// ───────────────────────────────────────────────────────────────────────────
function glossaryRuntime() {
  var DATA = JSON.parse(document.getElementById('lgp-data').textContent);
  var KEY = 'lgp_glossary_' + DATA.id;           // this file's own storage slot
  var TILE = ['#EF5350', '#FFA726', '#66BB6A', '#42A5F5', '#AB47BC', '#EC407A', '#26A69A', '#8D6E63'];
  var terms = [], query = '', editing = null, pendingDelete = null, adding = false;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  // ── load / save in this browser ──
  function load() {
    try {
      var s = localStorage.getItem(KEY);
      if (s) { var p = JSON.parse(s); if (Array.isArray(p)) { terms = p; return; } }
    } catch (e) {}
    terms = DATA.terms.map(function (t, i) { return { id: i + 1, term: t.term, description: t.description, icon: t.icon || null }; });
  }
  function store() { try { localStorage.setItem(KEY, JSON.stringify(terms)); } catch (e) {} }
  function nextId() { return terms.reduce(function (m, t) { return Math.max(m, t.id || 0); }, 0) + 1; }

  // ── picture: the matched clipart, or a coloured letter tile ──
  function picture(t) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ic'); svg.setAttribute('viewBox', '0 0 48 48'); svg.setAttribute('aria-hidden', 'true');
    if (t.icon && document.getElementById('ic-' + t.icon)) {
      var use = document.createElementNS(NS, 'use'); use.setAttribute('href', '#ic-' + t.icon); svg.appendChild(use);
    } else {
      var ch = (t.term.trim().charAt(0) || '?').toUpperCase();
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', 5); r.setAttribute('y', 5); r.setAttribute('width', 38); r.setAttribute('height', 38); r.setAttribute('rx', 9);
      r.setAttribute('fill', TILE[ch.charCodeAt(0) % TILE.length]); r.setAttribute('stroke', '#2B2B2B'); r.setAttribute('stroke-width', '2.2');
      var tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', 24); tx.setAttribute('y', 33.5); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-family', 'Fredoka, Arial, sans-serif');
      tx.setAttribute('font-weight', '600'); tx.setAttribute('font-size', '25'); tx.setAttribute('fill', '#fff'); tx.textContent = ch;
      svg.appendChild(r); svg.appendChild(tx);
    }
    return svg;
  }

  // Put text into a node, wrapping search matches in <mark> (built safely, no HTML strings).
  function highlight(node, text) {
    if (!query) { node.textContent = text; return; }
    var lower = text.toLowerCase(), q = query.toLowerCase(), i = 0;
    while (i < text.length) {
      var f = lower.indexOf(q, i);
      if (f < 0) { node.appendChild(document.createTextNode(text.slice(i))); break; }
      if (f > i) node.appendChild(document.createTextNode(text.slice(i, f)));
      node.appendChild(el('mark', null, text.slice(f, f + q.length)));
      i = f + q.length;
    }
  }

  function firstLetter(t) { var c = t.term.trim().charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; }

  // ── draw everything ──
  function render() {
    var sorted = terms.slice().sort(function (a, b) { return a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }); });
    var q = query.toLowerCase();
    var shown = q ? sorted.filter(function (t) { return t.term.toLowerCase().indexOf(q) >= 0 || t.description.toLowerCase().indexOf(q) >= 0; }) : sorted;
    $('count').textContent = q ? shown.length + ' of ' + terms.length + ' words' : terms.length + ' word' + (terms.length === 1 ? '' : 's');

    var groups = {}, order = [];
    shown.forEach(function (t) { var L = firstLetter(t); if (!groups[L]) { groups[L] = []; order.push(L); } groups[L].push(t); });

    var az = $('az'); az.textContent = '';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (L) {
      var a = el('a', groups[L] ? '' : 'off', L); a.href = '#L-' + L; az.appendChild(a);
    });

    var list = $('list'); list.textContent = '';
    if (!shown.length) { list.appendChild(el('p', 'empty', q ? 'No words match your search.' : 'No words yet — add the first one!')); return; }
    order.forEach(function (L) {
      var head = el('div', 'letter'); head.id = 'L-' + L;
      head.appendChild(el('b', null, L)); head.appendChild(el('span')); head.appendChild(el('small', null, groups[L].length + (groups[L].length === 1 ? ' word' : ' words')));
      list.appendChild(head);
      var grid = el('div', 'grid');
      groups[L].forEach(function (t) { grid.appendChild(editing === t.id ? editForm(t) : card(t)); });
      list.appendChild(grid);
    });
  }

  function card(t) {
    var c = el('article', 'card' + (t.added ? ' new' : ''));
    c.appendChild(picture(t));
    var tx = el('div', 'txt');
    var h = el('h2'); highlight(h, t.term); tx.appendChild(h);
    var p = el('p'); highlight(p, t.description); tx.appendChild(p);
    var acts = el('div', 'acts');
    var e = el('button', 'link', 'Edit'); e.type = 'button'; e.onclick = function () { editing = t.id; render(); };
    var d = el('button', 'link del', 'Delete'); d.type = 'button'; d.onclick = function () { askDelete(t); };
    acts.appendChild(e); acts.appendChild(d); tx.appendChild(acts);
    c.appendChild(tx);
    return c;
  }

  // The same little form is used for adding and editing.
  function wordForm(start, onSave, onCancel) {
    var f = el('form', 'form');
    var err = el('p', 'err'); err.hidden = true;
    var l1 = el('label', null, 'Word'); var i1 = el('input'); i1.maxLength = 500; i1.value = start.term || ''; l1.appendChild(i1);
    var l2 = el('label', null, 'Meaning'); var i2 = el('textarea'); i2.maxLength = 5000; i2.value = start.description || ''; l2.appendChild(i2);
    var row = el('div', 'row');
    var ok = el('button', 'ok', 'Save'); ok.type = 'submit';
    var no = el('button', 'cancel', 'Cancel'); no.type = 'button'; no.onclick = onCancel;
    row.appendChild(ok); row.appendChild(no);
    f.appendChild(err); f.appendChild(l1); f.appendChild(l2); f.appendChild(row);
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var w = i1.value.trim(), m = i2.value.trim();
      if (!w || !m) { err.textContent = !w ? 'Please type the word.' : 'Please type its meaning.'; err.hidden = false; return; }
      var clash = terms.some(function (t) { return t.term.toLowerCase() === w.toLowerCase() && t.id !== start.id; });
      if (clash) { err.textContent = 'That word is already in the glossary.'; err.hidden = false; return; }
      onSave(w.slice(0, 500), m.slice(0, 5000));
    };
    setTimeout(function () { i1.focus(); }, 0);
    return f;
  }

  function editForm(t) {
    return wordForm(t, function (w, m) {
      if (w !== t.term) t.icon = null;               // a renamed word gets a letter tile
      t.term = w; t.description = m; editing = null; store(); render(); toast('Changes saved');
    }, function () { editing = null; render(); });
  }

  function toggleAdd() {
    var slot = $('form-slot'); slot.textContent = '';
    adding = !adding;
    if (!adding) return;
    slot.appendChild(wordForm({}, function (w, m) {
      terms.push({ id: nextId(), term: w, description: m, icon: null, added: true });
      adding = false; slot.textContent = ''; store(); render(); toast('Word added');
    }, function () { adding = false; slot.textContent = ''; }));
  }

  // ── delete with a confirmation box ──
  function askDelete(t) { pendingDelete = t.id; $('dlg-word').textContent = t.term; $('overlay').classList.add('open'); $('dlg-yes').focus(); }
  function closeDelete() { pendingDelete = null; $('overlay').classList.remove('open'); }
  function doDelete() { terms = terms.filter(function (t) { return t.id !== pendingDelete; }); closeDelete(); store(); render(); toast('Word deleted'); }

  // ── getting the words out ──
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function download(text, name, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type }));
    var a = el('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function plain() { return terms.map(function (t) { return { term: t.term, description: t.description }; }); }
  function safeJson(v) {
    return JSON.stringify(v).replace(/[<>&\u2028\u2029]/g, function (c) { return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4); });
  }

  // Save a clean copy of this file with the current words built in.
  function saveFile() {
    var copy = document.documentElement.cloneNode(true);
    copy.querySelector('#lgp-data').textContent = safeJson({ id: DATA.id, terms: terms.map(function (t) { return { term: t.term, description: t.description, icon: t.icon || null }; }) });
    ['list', 'az', 'form-slot', 'count'].forEach(function (id) { var n = copy.querySelector('#' + id); if (n) n.textContent = ''; });
    [].forEach.call(copy.querySelectorAll('.open,.show,.done'), function (n) { n.classList.remove('open', 'show', 'done'); });
    var q = copy.querySelector('#q'); if (q) q.removeAttribute('value');
    download('<!DOCTYPE html>\n' + copy.outerHTML, 'class-glossary-' + today() + '.html', 'text/html');
    flash('save-btn'); toast('Updated glossary downloaded');
  }

  // CSV cell: guard formulas, quote when needed. Same rules as the app's toCSV().
  function cell(v) {
    var s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    if (/[",\r\n]/.test(s) || /^\s|\s$/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function exportCsv() {
    var lines = ['Term,Description'].concat(plain().map(function (t) { return cell(t.term) + ',' + cell(t.description); }));
    download('\uFEFF' + lines.join('\r\n') + '\r\n', 'class-glossary-' + today() + '.csv', 'text/csv');
    flash('csv-btn'); toast('CSV downloaded');
  }
  function copyList() {
    var text = plain().map(function (t) { return t.term + ' — ' + t.description; }).join('\n');
    var done = function () { flash('copy-btn'); toast('List copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() {
      var ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Copy not allowed here'); }
      document.body.removeChild(ta);
    }
  }

  function flash(id) { var b = $(id); b.classList.add('done'); setTimeout(function () { b.classList.remove('done'); }, 1400); }
  var tt;
  function toast(msg) { var n = $('toast'); n.textContent = msg; n.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { n.classList.remove('show'); }, 2200); }

  // ── wire up ──
  $('add-btn').onclick = toggleAdd;
  $('save-btn').onclick = saveFile;
  $('csv-btn').onclick = exportCsv;
  $('copy-btn').onclick = copyList;
  $('q').oninput = function () { query = this.value.trim(); $('q-clear').style.display = query ? 'block' : 'none'; render(); };
  $('q-clear').onclick = function () { $('q').value = ''; query = ''; this.style.display = 'none'; render(); };
  $('dlg-no').onclick = closeDelete;
  $('dlg-yes').onclick = doDelete;
  $('overlay').onclick = function (e) { if (e.target === this) closeDelete(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDelete(); });
  load();
  render();
}
