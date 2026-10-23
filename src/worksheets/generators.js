// ═══════════════════════════════════════════════════════════════════════════
// WORKSHEET GENERATORS  (src/worksheets/generators.js)
//
// One function per worksheet type. Each one receives:
//   data – the cleaned word list: [{ term, description, icon }]
//          (icon = clipart name picked in index.js, or null → letter tile)
//   o    – options from the app: { topic, bingoCards, versions, … }
// and returns an object:
//   { title, sections, css, empty? }
//     title     shown big at the top of each section and in the footer
//     sections  array of HTML built with flowSection() / fixedSection()
//               (each section always starts on a new page – see engine.js)
//     css       extra styles just for this worksheet type
//     empty     optional message if there aren't enough words to build it
//
// To add a new worksheet type: write a function here, then register it in
// index.js (GENERATORS) and add a card for it in App.jsx (format list).
// ═══════════════════════════════════════════════════════════════════════════
import { esc, shuffle, maskTerm, puzzleWord, chunk, chunkBy, flowSection, fixedSection } from './engine.js';
import { iconMarkup } from './clipart.js';

// Rainbow number-circle class for item i: n0, n1 … n6, then repeats.
const nc = (i) => `n${i % 7}`;
const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Letter-count hint for crossword clues: "Warp Drive" → "(4, 5)"
const lenHint = (term) => {
  const parts = String(term).split(/[\s-]+/).map(w => puzzleWord(w).length).filter(Boolean);
  return parts.length ? `(${parts.join(', ')})` : '';
};

/**
 * Build matching exercises ("draw a line from the word to its meaning").
 * The words are split into small SETS of up to 6. Each set is one box with its
 * own A–F letters, so a set is never split across two pages.
 *   pairs    the words to use (in the order they should be numbered)
 *   startNo  first question number (so numbering can continue after Part A)
 * Returns { html: [one string per set], key: [{ n, letter, term }] }
 */
function matchingSets(pairs, startNo) {
  // weight ≈ how tall a row will be: a base amount + length of the definition
  const sets = chunkBy(pairs, 6, 560, d => 40 + Math.min(d.description.length, 320));
  let no = startNo;
  const key = [];
  const html = sets.map((set, si) => {
    // Right-hand column: the same definitions in a shuffled order.
    // defs[k] = { d: word, i: its row on the left }
    const defs = shuffle(set.map((d, i) => ({ d, i })));
    const rows = set.map((d, i) => {
      const n = no + i;
      const letterIdx = defs.findIndex(x => x.i === i);   // where this word's definition ended up
      key.push({ n, letter: LET[letterIdx], term: d.term });
      const r = defs[i].d;                                 // definition shown on the right of this row
      return `<div class="mrow">
  <div class="mL"><span class="mblank"></span><span class="num ${nc(n - 1)}">${n}</span><span class="mterm">${esc(d.term)}</span><span class="dot"></span></div>
  <div class="mR"><span class="dot"></span><span class="mlet">${LET[i]}</span><span class="mdef">${esc(maskTerm(r.description, r.term))}</span></div>
</div>`;
    }).join('');
    no += set.length;
    return `<div class="mset">${sets.length > 1 ? `<div class="mset-h">Set ${si + 1}</div>` : ''}${rows}</div>`;
  });
  return { html, key };
}

// Styles shared by every worksheet that has a matching section.
const MATCH_CSS = `
.mset{border:2.5px solid #2B2B2B;border-radius:14px;padding:8px 12px 4px;margin-bottom:12px;}
.mset-h{font-family:'Fredoka',sans-serif;font-weight:600;font-size:11pt;color:var(--ink);margin-bottom:2px;}
.mrow{display:flex;gap:.85in;align-items:center;padding:6px 0;border-bottom:1px dashed var(--soft);}
.mrow:last-child{border-bottom:0;}
.mL{flex:0 0 33%;display:flex;align-items:center;gap:7px;}
.mR{flex:1;display:flex;align-items:flex-start;gap:7px;}
.mblank{display:inline-block;width:.32in;border-bottom:1.5px solid var(--line);height:1.1em;flex:none;}
.mterm{flex:1;font-weight:700;font-size:12.5pt;}
.dot{width:11px;height:11px;border-radius:50%;background:#2B2B2B;flex:none;margin-top:.3em;}
.mL .dot{margin-top:0;}
.mlet{font-family:'Fredoka',sans-serif;font-weight:600;flex:none;width:18px;}
.mdef{flex:1;font-size:11pt;}`;

// Styles shared by every answer-key page.
const KEY_CSS = `
.key-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px 16px;}
.key-list.two{grid-template-columns:repeat(2,minmax(0,1fr));}
.kh{grid-column:1/-1;font-family:'Fredoka',sans-serif;font-weight:600;font-size:13pt;margin:10px 0 4px;padding-bottom:2px;border-bottom:2px solid var(--soft);}
.kh:first-child{margin-top:0;}
.ki{font-size:11pt;display:flex;gap:6px;align-items:baseline;break-inside:avoid;}
.ki b{min-width:1.6em;text-align:right;}
.ki .ans{flex:1;}
.knote{grid-column:1/-1;font-size:10pt;color:#666;margin-top:6px;}`;

// Answer-key building blocks: a heading row, and one "12. B  Volcano" line.
const keyHead = (txt) => `<div class="kh">${esc(txt)}</div>`;
const keyItem = (no, ans, extra) => `<div class="ki"><b>${esc(no)}</b><span class="ans">${esc(ans)}${extra ? ` <span style="color:#666;font-weight:400">${esc(extra)}</span>` : ''}</span></div>`;

// ─────────────────────────────────────────────────────────────────────────────
// FLASH CARDS — 8 per sheet, fronts then mirrored backs for double-sided print
//
// Pages come in pairs: FRONT sheet (picture + word), then BACK sheet
// (definition). Printed double-sided and flipped on the long edge, the left
// column of the front lands on the RIGHT column of the back – so the back
// sheet is mirrored left↔right to line each definition up with its word.
// ─────────────────────────────────────────────────────────────────────────────
export function flashCards(data, o) {
  const title = 'Flash Cards';
  const groups = chunk(data, 8);                        // 8 cards per sheet (2 columns × 4 rows)
  const pages = [];
  const head = (side, gi) => `<div class="fc-head">
  <span class="fc-title">${esc(o.topic || 'Vocabulary')} <span>Flash Cards</span></span>
  <span class="fc-side ${side === 'FRONT' ? 'f' : 'b'}">${side}</span>
  <span class="fc-sheet">Sheet ${gi + 1} of ${groups.length}</span>
</div>`;
  groups.forEach((g, gi) => {
    const slot = (i) => g[i] || null;                   // empty slots on the last sheet stay blank
    const front = Array.from({ length: 8 }, (_, i) => {
      const d = slot(i);
      return d ? `<div class="fc"><div class="fc-in front"><span class="fc-no">${gi * 8 + i + 1}</span>
  <div class="fc-art">${iconMarkup(d.icon, d.term)}</div>
  <div class="fc-term fit" data-max="26" data-min="10">${esc(d.term)}</div></div></div>` : `<div class="fc"></div>`;
    }).join('');
    // Back sheet: position k shows card r*2 + (1-c), i.e. columns swapped.
    const back = Array.from({ length: 8 }, (_, k) => {
      const r = Math.floor(k / 2), c = k % 2, i = r * 2 + (1 - c), d = slot(i);
      return d ? `<div class="fc"><div class="fc-in back"><span class="fc-no">${gi * 8 + i + 1}</span>
  <div class="fc-def fit" data-max="15" data-min="6">${esc(d.description)}</div></div></div>` : `<div class="fc"></div>`;
    }).join('');
    pages.push(`<div class="fc-wrap">${head('FRONT', gi)}<div class="fc-grid">${front}</div></div>`);
    pages.push(`<div class="fc-wrap">${head('BACK', gi)}<div class="fc-grid">${back}</div></div>`);
  });

  const css = `
.fc-wrap{height:100%;display:flex;flex-direction:column;}
.fc-head{height:.42in;display:flex;align-items:center;gap:12px;padding:0 2px 6px;}
.fc-title{font-family:'Fredoka',sans-serif;font-weight:600;font-size:15pt;flex:1;}
.fc-title span{color:var(--ink);}
.fc-side{font-family:'Fredoka',sans-serif;font-weight:600;font-size:11pt;border:2px solid #2B2B2B;border-radius:999px;padding:1px 12px;}
.fc-side.f{background:var(--accent);color:var(--on-accent);} .fc-side.b{background:#fff;}
.fc-sheet{font-size:9.5pt;color:#777;}
.fc-grid{flex:1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(4,minmax(0,1fr));border-top:1.5px dashed #9A9A9A;border-left:1.5px dashed #9A9A9A;min-height:0;}
.fc{border-right:1.5px dashed #9A9A9A;border-bottom:1.5px dashed #9A9A9A;padding:.14in;min-height:0;min-width:0;display:flex;overflow:hidden;}
.fc-in{flex:1;border-radius:14px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:.12in .16in;min-height:0;min-width:0;}
.fc-in.front{border:3px solid var(--accent);}
.fc-in.back{border:2px solid #BDBDBD;background:var(--tint);}
.fc-no{position:absolute;top:6px;left:10px;font-size:8pt;color:#999;font-weight:700;}
.fc-art{width:.95in;height:.95in;flex:none;margin-bottom:6px;}
.fc-term{font-family:'Fredoka',sans-serif;font-weight:600;text-align:center;line-height:1.1;width:100%;max-height:.75in;display:flex;align-items:center;justify-content:center;}
.fc-def{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.3;}`;
  return {
    title,
    sections: [fixedSection({ kind: 'plain' }, pages)],
    css,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDY SHEET — word study · fill in the blank · matching · answer key
// ─────────────────────────────────────────────────────────────────────────────
export function studySheet(data, o) {
  const title = 'Study Sheet';
  const sections = [];

  // Part A — picture dictionary: every word with its picture and definition.
  const pd = data.map((d, i) => `<div class="pd">
  <div class="pd-art">${iconMarkup(d.icon, d.term)}</div>
  <div class="pd-txt"><div class="pd-term"><span class="num ${nc(i)}">${i + 1}</span>${esc(d.term)}</div><div class="pd-def">${esc(d.description)}</div></div>
</div>`);
  sections.push(flowSection({ title, topic: o.topic, label: 'Part A', heading: 'Word Study', icon: 'book',
    directions: 'Read each word and what it means. Say the word out loud. Look at the picture to help you remember.',
    listClass: 'pd-list' }, pd));

  // Part B — fill in the blank: the definition is given (word hidden), the
  // student writes the word. data-answer="…" tells the layout script which
  // words to list in that page's Word Bank.
  const fibData = shuffle(data).slice(0, 30);
  const fib = fibData.map((d, i) => `<div class="fib" data-answer="${esc(d.term)}">
  <span class="num ${nc(i)}">${i + 1}</span>
  <div class="fib-clue">${esc(maskTerm(d.description, d.term))}</div>
  <div class="fib-line"></div>
</div>`);
  sections.push(flowSection({ title, topic: o.topic, label: 'Part B', heading: 'Fill in the Blank', icon: 'pencil', bank: true,
    directions: 'Read each meaning. Write the word it describes on the line. Use the Word Bank — each word is used once on a page.',
    listClass: 'fib-list' }, fib));

  // Part C — matching (needs at least 3 words to be worth doing).
  let match = null;
  if (data.length >= 3) {
    match = matchingSets(shuffle(data).slice(0, 18), 1);
    sections.push(flowSection({ title, topic: o.topic, label: 'Part C', heading: 'Matching', icon: 'puzzle',
      directions: 'Draw a line from each word to its meaning, or write the letter on the blank.' }, match.html));
  }

  // Answer key — always its own section, so it starts on a fresh page.
  const key = [keyHead('Part B · Fill in the Blank'), ...fibData.map((d, i) => keyItem(`${i + 1}.`, d.term))];
  if (match) key.push(keyHead('Part C · Matching'), ...match.key.map(k => keyItem(`${k.n}.`, k.letter, k.term)));
  sections.push(flowSection({ title, topic: o.topic, kind: 'key', heading: 'Answers', icon: 'check', listClass: 'key-list' }, key));

  const css = MATCH_CSS + KEY_CSS + `
.pd{display:flex;gap:14px;align-items:flex-start;padding:8px 4px;border-bottom:1.5px dashed var(--soft);}
.pd-art{width:.62in;height:.62in;flex:none;}
.pd-txt{flex:1;min-width:0;}
.pd-term{font-family:'Fredoka',sans-serif;font-weight:600;font-size:15pt;display:flex;align-items:center;gap:8px;margin-bottom:2px;}
.pd-term .num{width:22px;height:22px;font-size:10pt;}
.pd-def{font-size:11.5pt;}
.fib{display:flex;gap:10px;align-items:flex-end;padding:9px 2px;}
.fib .num{align-self:flex-start;}
.fib-clue{flex:1;font-size:11.5pt;align-self:center;}
.fib-line{flex:0 0 2.1in;border-bottom:1.5px solid var(--line);height:1.4em;}`;
  return { title, sections, css };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ — multiple choice (two question styles) · matching · answer key
//
// VERSIONS (o.versions = 1–4): every version asks the SAME questions with the
// same answer choices, but the question order, the order of choices (A–D) and
// the matching order are reshuffled. Students sitting side by side can't copy
// letters, and every version is equally hard. Output order:
//   Version A pages, Version B pages, … then one answer key per version.
// ─────────────────────────────────────────────────────────────────────────────
export function quiz(data, o) {
  const title = 'Vocabulary Quiz';
  const versions = Math.max(1, Math.min(4, o.versions || 1));
  const nOpt = Math.min(4, data.length);                // 4 choices, or fewer if the list is tiny

  // ── 1. Decide the CONTENT once (shared by all versions) ──────────────────
  // Multiple choice: up to 15 words, each with its wrong answers fixed now.
  const questions = data.length >= 2 ? shuffle(data).slice(0, 15).map((item, qi) => {
    const wrong = shuffle(data.filter(d => d !== item)).slice(0, nOpt - 1);
    const choices = [item, ...wrong];
    // Two question styles, alternating:
    //   "What does VOLCANO mean?"            → choices are definitions
    //   "Which word matches this meaning?"   → choices are words
    // Long definitions always use the second style so a question can't get huge.
    const askTerm = qi % 2 === 1 || choices.some(x => x.description.length > 200);
    return { item, choices, askTerm };
  }) : [];
  // Matching: up to 10 words.
  const matchWords = data.length >= 3 ? shuffle(data).slice(0, 10) : [];
  const total = questions.length + matchWords.length;   // 1 point each → "Score __ / total"

  const student = [];                                    // all versions' student pages
  const keys = [];                                       // all versions' answer keys

  // ── 2. Build each version with its own shuffles ──────────────────────────
  for (let v = 0; v < versions; v++) {
    const ver = versions > 1 ? LET[v] : '';              // '' when there's only one version
    // The version goes in the coloured pill, which appears on EVERY page
    // (including "(continued)" pages), e.g. "Version B · Part A".
    const pill = (part) => ver ? `Version ${ver} · ${part}` : part;

    const mcKey = [];
    const mc = shuffle(questions).map((q, qi) => {
      const opts = shuffle(q.choices);                   // new A–D order for this version
      const ci = opts.indexOf(q.item);                   // index of the right answer
      mcKey.push({ n: qi + 1, letter: LET[ci], term: q.item.term });
      const texts = opts.map(x => q.askTerm ? x.term : x.description);
      // Lay the choices out in 4, 2 or 1 columns depending on how long they are.
      const longest = Math.max(...texts.map(s => s.length));
      const cols = q.askTerm ? (longest <= 16 ? 'c4' : 'c2') : (longest <= 34 ? 'c2' : 'c1');
      const prompt = q.askTerm
        ? `Which word matches this meaning? <span class="q-def">“${esc(maskTerm(q.item.description, q.item.term))}”</span>`
        : `What does <b class="q-term">${esc(q.item.term)}</b> mean?`;
      // The picture is only shown when the word is in the question (it would be a hint otherwise).
      return `<div class="q">
  <div class="q-top"><span class="num ${nc(qi)}">${qi + 1}</span><div class="q-text">${prompt}</div>${q.askTerm ? '' : `<div class="q-art">${iconMarkup(q.item.icon, q.item.term)}</div>`}</div>
  <div class="opts ${cols}">${texts.map((t, i) => `<div class="opt"><span class="bub">${LET[i]}</span><span class="ot">${esc(t)}</span></div>`).join('')}</div>
</div>`;
    });

    // Matching numbers continue after the multiple-choice questions.
    const match = matchWords.length ? matchingSets(shuffle(matchWords), mc.length + 1) : null;
    const partB = mc.length ? 'Part B' : 'Part A';

    if (mc.length) student.push(flowSection({ title, topic: o.topic, label: pill('Part A'), heading: 'Multiple Choice', icon: 'bulb', score: total,
      directions: 'Read each question. Circle the letter of the best answer.' }, mc));
    if (match) student.push(flowSection({ title, topic: o.topic, label: pill(partB), heading: 'Matching', icon: 'puzzle', score: mc.length ? null : total,
      directions: 'Draw a line from each word to its meaning, or write the letter on the blank.' }, match.html));

    const key = [];
    if (mc.length) key.push(keyHead('Part A · Multiple Choice'), ...mcKey.map(k => keyItem(`${k.n}.`, k.letter, k.term)));
    if (match) key.push(keyHead(`${partB} · Matching`), ...match.key.map(k => keyItem(`${k.n}.`, k.letter, k.term)));
    if (key.length) keys.push(flowSection({ title, topic: o.topic, kind: 'key', heading: `${ver ? `Version ${ver} answers` : 'Answers'} · ${total} points`, icon: 'check', listClass: 'key-list' }, key));
  }

  const css = MATCH_CSS + KEY_CSS + `
.q{border:2.5px solid #2B2B2B;border-radius:14px;padding:9px 12px 8px;margin-bottom:10px;}
.q-top{display:flex;gap:10px;align-items:center;margin-bottom:6px;}
.q-text{flex:1;font-size:12pt;}
.q-term{font-family:'Fredoka',sans-serif;font-weight:600;font-size:14pt;}
.q-def{display:block;font-size:11.5pt;margin-top:2px;}
.q-art{width:.48in;height:.48in;flex:none;}
.opts{display:grid;gap:4px 14px;padding-left:36px;}
.opts.c1{grid-template-columns:minmax(0,1fr);} .opts.c2{grid-template-columns:repeat(2,minmax(0,1fr));} .opts.c4{grid-template-columns:repeat(4,minmax(0,1fr));}
.opt{display:flex;gap:7px;align-items:flex-start;font-size:11pt;}
.bub{flex:none;width:21px;height:21px;border:2px solid #2B2B2B;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-weight:600;font-size:9.5pt;margin-top:1px;}
.ot{flex:1;}`;
  const sections = [...student, ...keys];
  return { title, sections, css, empty: !sections.length ? 'The quiz needs at least 2 terms.' : null };
}

// ─────────────────────────────────────────────────────────────────────────────
// BINGO — unique cards (grid size adapts to word count) · caller sheet · word wall
// ─────────────────────────────────────────────────────────────────────────────
export function bingo(data, o) {
  const title = 'Vocabulary Bingo';
  const n = data.length;
  const size = n >= 24 ? 5 : n >= 16 ? 4 : n >= 8 ? 3 : 0;
  if (!size) return { title, sections: [], css: '', empty: 'Bingo needs at least 8 terms (24 or more for a full 5×5 card).' };
  const hasFree = size % 2 === 1;
  const need = size * size - (hasFree ? 1 : 0);
  const count = Math.max(1, Math.min(40, o.bingoCards || 10));
  const COLS = size === 5 ? 'BINGO'.split('') : null;

  const seen = new Set();
  const cards = [];
  for (let k = 0; k < count; k++) {
    let pick, sig, tries = 0;
    do { pick = shuffle(data).slice(0, need); sig = pick.map(d => d.term).join('|'); tries++; } while (seen.has(sig) && tries < 20);
    seen.add(sig);
    const cells = [...pick];
    if (hasFree) cells.splice(Math.floor(size * size / 2), 0, null);
    cards.push(cells);
  }
  const cardHtml = (cells, idx) => `<div class="bingo">
  <div class="bg-head">${COLS ? COLS.map((l, i) => `<span class="bg-l ${nc(i)}">${l}</span>`).join('') : `<span class="bg-word">BINGO</span>`}</div>
  <div class="bg-grid" style="grid-template-columns:repeat(${size},minmax(0,1fr));grid-template-rows:repeat(${size},minmax(0,1fr))">
    ${cells.map(d => d ? `<div class="bc"><div class="bc-art">${iconMarkup(d.icon, d.term)}</div><div class="bc-t fit" data-max="${size === 5 ? 12 : 15}" data-min="6.5">${esc(d.term)}</div></div>`
      : `<div class="bc free"><div class="bc-art"><svg class="ic" viewBox="0 0 48 48"><path d="M24 4l5.9 12.4 13.6 1.7-10 9.4 2.6 13.5L24 34.4 11.9 41l2.6-13.5-10-9.4 13.6-1.7z" fill="#FFD54F" stroke="#2B2B2B" stroke-width="2.2" stroke-linejoin="round"/></svg></div><div class="bc-free">FREE</div></div>`).join('')}
  </div>
  <div class="bg-foot"><span>Name</span><i class="ln"></i><span class="bg-no">Card ${idx + 1}</span></div>
</div>`;
  const pages = chunk(cards, 2).map((pair, pi) => `<div class="bg-page">${pair.map((c, i) => cardHtml(c, pi * 2 + i)).join('<div class="cut"></div>')}</div>`);

  const caller = shuffle(data).map(d => `<div class="call"><span class="box"></span><div class="call-t"><b>${esc(d.term)}</b><span>${esc(d.description)}</span></div></div>`);
  const wall = data.map(d => `<div class="ww"><div class="ww-art">${iconMarkup(d.icon, d.term)}</div><div class="ww-term fit" data-max="26" data-min="12">${esc(d.term)}</div><div class="ww-def">${esc(d.description)}</div></div>`);

  const sections = [
    fixedSection({ kind: 'plain' }, pages),
    flowSection({ title, topic: o.topic, kind: 'teacher', heading: 'Caller Sheet', icon: 'speech',
      directions: 'Read a meaning aloud. Students find and cover the matching word. Tick the box so you know which words have been called.',
      listClass: 'call-list' }, caller),
    flowSection({ title: 'Word Wall', topic: o.topic, kind: 'plain', noName: true, heading: 'Cut out and display', icon: 'star',
      listClass: 'ww-list' }, wall),
  ];

  const css = `
.page.teacher .frame{border-style:dashed;border-color:#8A8A8A;}
.bg-page{height:100%;display:flex;flex-direction:column;}
.cut{border-top:1.5px dashed #9A9A9A;margin:.14in 0;flex:none;}
.bingo{flex:1;min-height:0;display:flex;flex-direction:column;border:3px solid #2B2B2B;border-radius:16px;padding:8px;}
.bg-head{display:flex;gap:6px;margin-bottom:6px;}
.bg-l{flex:1;text-align:center;color:#fff;font-family:'Fredoka',sans-serif;font-weight:600;font-size:24pt;line-height:1.25;border:2px solid #2B2B2B;border-radius:10px;}
.bg-word{flex:1;text-align:center;font-family:'Fredoka',sans-serif;font-weight:600;font-size:26pt;color:var(--accent);-webkit-text-stroke:5px #2B2B2B;paint-order:stroke fill;letter-spacing:6px;}
.bg-grid{flex:1;display:grid;min-height:0;border-top:2px solid #2B2B2B;border-left:2px solid #2B2B2B;}
.bc{border-right:2px solid #2B2B2B;border-bottom:2px solid #2B2B2B;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3px 4px;min-height:0;min-width:0;gap:2px;}
.bc-art{width:.34in;height:.34in;flex:none;}
.bc-t{width:100%;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;line-height:1.1;overflow-wrap:anywhere;}
.bc.free{background:var(--tint);}
.bc.free .bc-art{width:.5in;height:.5in;}
.bc-free{font-family:'Fredoka',sans-serif;font-weight:600;font-size:12pt;}
.bg-foot{display:flex;align-items:flex-end;gap:6px;margin-top:6px;font-weight:700;font-size:10.5pt;}
.bg-foot .ln{flex:1;border-bottom:1.5px solid var(--line);height:1em;}
.bg-no{color:#888;font-weight:400;margin-left:12px;}
.call{display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px dashed var(--soft);}
.box{width:16px;height:16px;border:2px solid #2B2B2B;border-radius:3px;flex:none;margin-top:3px;}
.call-t{font-size:11pt;}
.call-t b{font-family:'Fredoka',sans-serif;font-weight:600;font-size:12.5pt;margin-right:8px;}
.ww-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.2in;padding:.08in;}
.ww{min-width:0;min-height:2.6in;border:3px solid var(--accent);border-radius:16px;padding:.12in .16in;display:flex;flex-direction:column;align-items:center;outline:1.5px dashed #9A9A9A;outline-offset:.06in;}
.ww-art{width:.8in;height:.8in;flex:none;}
.ww-term{font-family:'Fredoka',sans-serif;font-weight:600;text-align:center;width:100%;height:.6in;flex:none;display:flex;align-items:center;justify-content:center;line-height:1.05;}
.ww-def{flex:1;width:100%;text-align:center;line-height:1.3;font-size:11pt;}`;
  return { title, sections, css };
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD SEARCH
//
// Difficulty (o.wsLevel) controls which directions words can run and how big
// the puzzle is:
//   easy    → across and down only, small grid, big letters, up to 10 words
//   medium  → also diagonals (reading forwards), up to 14 words
//   hard    → also backwards in every direction, up to 18 words
// ─────────────────────────────────────────────────────────────────────────────
const WS_LEVELS = {
  // dirs: [rowStep, colStep] — [0,1] = left→right, [1,0] = top→bottom, [1,1] = diagonal down-right…
  easy:   { dirs: [[0, 1], [1, 0]],                                                     minSize: 10, maxSize: 14, maxWords: 10,
            say: 'Words go across (→) and down (↓).' },
  medium: { dirs: [[0, 1], [1, 0], [1, 1], [-1, 1]],                                    minSize: 12, maxSize: 16, maxWords: 14,
            say: 'Words go across, down, and diagonally — always reading forwards.' },
  hard:   { dirs: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]], minSize: 14, maxSize: 18, maxWords: 18,
            say: 'Words go across, down, diagonally, and backwards.' },
};

export function wordSearch(data, o) {
  const title = 'Word Search';
  const L = WS_LEVELS[o.wsLevel] || WS_LEVELS.medium;

  // ── 1. Pick the words that can go in the grid ────────────────────────────
  const cands = [];        // usable words: { w: "VOLCANO", d: original row }
  const tooLong = [];      // terms longer than the biggest grid
  for (const d of shuffle(data)) {
    const w = puzzleWord(d.term);                       // "Warp Drive" → "WARPDRIVE"
    if (w.length < 3) continue;                         // too short to be worth finding
    if (w.length > L.maxSize) { tooLong.push(d.term); continue; }
    if (cands.some(c => c.w === w)) continue;           // same letters as a word we already have
    cands.push({ w, d });
  }
  if (!cands.length) return { title, sections: [], css: '', empty: `No terms of 3–${L.maxSize} letters to hide.` };

  // Grid size: a bit bigger than the longest word, within this level's limits.
  const longest = Math.max(...cands.map(c => c.w.length));
  const SIZE = Math.max(L.minSize, Math.min(L.maxSize, longest + 2));
  // Longest words first – they're hardest to fit, so place them while the grid is empty.
  const words = cands.slice(0, L.maxWords).sort((a, b) => b.w.length - a.w.length);
  const left = cands.slice(words.length).map(c => c.d.term);   // didn't make the cut (word limit)

  // ── 2. Place the words ───────────────────────────────────────────────────
  // For each word try every allowed direction and every starting square (in
  // random order) until one fits. Letters may cross where they match.
  // Repeat the whole thing up to 25 times and keep the attempt that placed most.
  let best = null;
  for (let attempt = 0; attempt < 25 && (!best || best.placed.length < words.length); attempt++) {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
    const placed = [];     // { w, d, r, c0, dr, dc } – start square + direction, used for the answer key
    for (const c of words) {
      let done = false;
      for (const [dr, dc] of shuffle(L.dirs)) {
        const starts = shuffle(Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE]));
        for (const [r, cc] of starts) {
          // Does every letter land inside the grid, on an empty square or the same letter?
          let ok = true;
          for (let i = 0; i < c.w.length; i++) {
            const nr = r + dr * i, nc2 = cc + dc * i;
            if (nr < 0 || nr >= SIZE || nc2 < 0 || nc2 >= SIZE) { ok = false; break; }
            const g = grid[nr][nc2];
            if (g && g !== c.w[i]) { ok = false; break; }
          }
          if (!ok) continue;
          for (let i = 0; i < c.w.length; i++) grid[r + dr * i][cc + dc * i] = c.w[i];
          placed.push({ ...c, r, c0: cc, dr, dc });
          done = true; break;
        }
        if (done) break;
      }
    }
    if (!best || placed.length > best.placed.length) best = { grid, placed };
  }
  const { grid, placed } = best;

  // ── 3. Fill the empty squares with random letters ────────────────────────
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) grid[r][c] = A[Math.floor(Math.random() * 26)];
  const notPlaced = words.filter(w => !placed.some(p => p.w === w.w)).map(w => w.d.term);
  const skipped = [...tooLong, ...left, ...notPlaced];  // listed on the answer key so nothing vanishes silently

  // ── 4. Build the HTML ────────────────────────────────────────────────────
  // Square size: as big as fits (max 0.36in; easy grids get bigger squares).
  const cell = Math.min(o.wsLevel === 'easy' ? 0.42 : 0.36, 4.7 / SIZE);
  // withKey = true draws a translucent coloured bar over each word (answer key).
  const gridHtml = (withKey) => `<div class="ws-grid" style="--n:${SIZE};--cell:${cell}in">
  ${grid.map(row => row.map(ch => `<span>${ch}</span>`).join('')).join('')}
  ${withKey ? `<svg class="ws-key" viewBox="0 0 ${SIZE} ${SIZE}" preserveAspectRatio="none">${placed.map((p, i) => {
    // the SVG uses one unit per square, so +0.5 is the centre of a square
    const x1 = p.c0 + 0.5, y1 = p.r + 0.5, x2 = p.c0 + p.dc * (p.w.length - 1) + 0.5, y2 = p.r + p.dr * (p.w.length - 1) + 0.5;
    const col = ['#E53935', '#FB8C00', '#43A047', '#1E88E5', '#8E24AA', '#D81B60', '#00897B'][i % 7];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-opacity=".32" stroke-width=".74" stroke-linecap="round"/>`;
  }).join('')}</svg>` : ''}
</div>`;
  const sortedPlaced = [...placed].sort((a, b) => a.d.term.localeCompare(b.d.term));
  const spaced = placed.some(p => /[^A-Za-z]/.test(p.d.term));   // any term with spaces/punctuation?
  const bank = `<div class="ws-bank"><div class="bank-h">Find these words</div><div class="ws-words">${sortedPlaced.map(p =>
    `<div class="ws-w"><span class="box"></span><span class="ws-ic">${iconMarkup(p.d.icon, p.d.term)}</span><span>${esc(p.d.term)}</span></div>`).join('')}</div></div>`;
  const levelName = { easy: 'Easy', medium: 'Medium', hard: 'Challenge' }[o.wsLevel] || 'Medium';

  const sections = [
    // Puzzle page: the grid goes in `pre` (top of the first page), the word list flows after it.
    flowSection({ title, topic: o.topic, label: `${levelName} · ${placed.length} words`, heading: 'Find the hidden words', icon: 'magnify',
      directions: `${L.say} Circle each word and tick it off the list.${spaced ? ' Spaces and punctuation are left out.' : ''}`,
      pre: gridHtml(false) }, [bank]),
    // Answer key page.
    flowSection({ title, topic: o.topic, kind: 'key', heading: 'Answers', icon: 'check',
      pre: gridHtml(true) }, skipped.length ? [`<p class="ws-note">Left out to keep the puzzle a good size: ${skipped.map(esc).join(', ')}.</p>`] : []),
  ];
  const css = `
.ws-grid{position:relative;display:grid;grid-template-columns:repeat(var(--n),var(--cell));grid-auto-rows:var(--cell);width:max-content;margin:4px auto 14px;border:3px solid #2B2B2B;border-radius:12px;padding:6px;}
.ws-grid span{display:flex;align-items:center;justify-content:center;font-family:'Andika',sans-serif;font-weight:700;font-size:calc(var(--cell) * .55);}
.ws-key{position:absolute;left:6px;top:6px;width:calc(var(--n) * var(--cell));height:calc(var(--n) * var(--cell));pointer-events:none;}
.ws-bank{border:2.5px solid #2B2B2B;border-radius:12px;padding:6px 12px 8px;}
.ws-words{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px 14px;}
.ws-w{display:flex;align-items:center;gap:6px;font-weight:700;font-size:11pt;}
.ws-ic{width:22px;height:22px;flex:none;}
.box{width:14px;height:14px;border:2px solid #2B2B2B;border-radius:3px;flex:none;}
.ws-note{font-size:10.5pt;color:#555;}`;
  return { title, sections, css };
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAYER MODEL — one "word map" per word: four boxes around the word.
//
//   ┌──────────────┬──────────────┐
//   │ 1 Definition │ 2 Draw it    │     Definition is filled in from the CSV,
//   │              │              │     with lines underneath for "in my own words".
//   ├──────────( WORD )───────────┤     The other three boxes are for students.
//   │ 3 Examples   │ 4 Non-       │
//   │              │   examples   │
//   └──────────────┴──────────────┘
//
// o.frayerPerPage = 1 (more writing room) or 2 (saves paper).
// A blank Frayer (no word) is added at the end for extra words.
// ─────────────────────────────────────────────────────────────────────────────
export function frayer(data, o) {
  const title = 'Frayer Model';
  const per = o.frayerPerPage === 1 ? 1 : 2;

  // One Frayer block. d = null makes a blank one with a line to write the word on.
  // A long definition (over ~200 characters) gets the whole Definition box –
  // the "in my own words" lines are dropped so the text never gets cut off.
  const block = (d) => {
    const long = d && d.description.length > (per === 1 ? 420 : 200);
    return `<div class="fy">
  <div class="fy-q q1${long ? ' long' : ''}">
    <div class="fy-h"><span class="num n0">1</span>Definition</div>
    ${d ? `<div class="fy-def fit" data-max="11.5" data-min="6.5">${esc(d.description)}</div>` : ''}
    ${d && !long ? `<div class="fy-sub">In my own words:</div>` : ''}
    ${long ? '' : `<div class="fy-lines"></div>`}
  </div>
  <div class="fy-q q2"><div class="fy-h"><span class="num n3">2</span>Draw a picture</div></div>
  <div class="fy-q q3"><div class="fy-h"><span class="num n2">3</span>Examples</div><div class="fy-lines"></div></div>
  <div class="fy-q q4"><div class="fy-h"><span class="num n4">4</span>Non-examples</div><div class="fy-lines"></div></div>
  <div class="fy-mid">
    ${d ? `<div class="fy-art">${iconMarkup(d.icon, d.term)}</div><div class="fy-term fit" data-max="${per === 1 ? 24 : 19}" data-min="9">${esc(d.term)}</div>`
        : `<div class="fy-blank">Word:</div><div class="fy-wline"></div>`}
  </div>
</div>`;
  };

  // Group the blocks into pages (1 or 2 per page). In 2-per-page mode a word
  // with a VERY long definition (over ~600 characters) gets a page to itself,
  // because half a page can't hold that much text. Blank Frayer(s) go last.
  const pages = [];
  let pending = [];                                      // blocks waiting to fill the current page
  const flush = () => { if (pending.length) pages.push(`<div class="fy-page">${pending.join('')}</div>`); pending = []; };
  for (const d of data) {
    if (per === 2 && d.description.length > 600) { flush(); pending.push(block(d)); flush(); continue; }
    pending.push(block(d));
    if (pending.length === per) flush();
  }
  flush();
  pages.push(`<div class="fy-page">${Array(per).fill(block(null)).join('')}</div>`);

  const sections = [fixedSection({ title, topic: o.topic, kind: 'student', label: 'Word Map', heading: `${data.length} words`, icon: 'puzzle',
    directions: 'Read the word and its definition. Rewrite the definition in your own words, draw a picture, then list examples and non-examples.' }, pages)];

  const css = `
.fy-page{height:100%;display:flex;flex-direction:column;gap:.18in;}
/* the 2×2 grid; .fy-mid (the oval) sits on top of the middle */
.fy{flex:1;min-height:0;position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));
  border:3px solid #2B2B2B;border-radius:16px;overflow:hidden;}
.fy-q{min-height:0;min-width:0;display:flex;flex-direction:column;padding:8px 12px;}
.q1{border-right:2px solid #2B2B2B;border-bottom:2px solid #2B2B2B;}
.q2{border-bottom:2px solid #2B2B2B;}
.q3{border-right:2px solid #2B2B2B;}
/* Keep text out from under the oval: headings sit in the OUTER corners
   (right-hand boxes are right-aligned), and the writing area keeps clear of the middle. */
.q1,.q3{padding-right:.5in;} .q2,.q4{padding-left:.5in;}
.q2 .fy-h,.q4 .fy-h{justify-content:flex-end;}
.q1.long .fy-def{max-height:none;flex:1;}
.fy-h{display:flex;align-items:center;gap:6px;position:relative;z-index:1;font-family:'Fredoka',sans-serif;font-weight:600;font-size:12.5pt;flex:none;}
.fy-h .num{width:22px;height:22px;font-size:10pt;}
.fy-def{flex:0 1 auto;max-height:45%;margin:4px 0 2px;line-height:1.3;background:var(--tint);border-radius:8px;padding:4px 8px;}
.fy-sub{font-size:9.5pt;color:#666;flex:none;}
/* ruled writing lines drawn with a repeating background */
.fy-lines{flex:1;min-height:0;background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(.33in - 1.5px),#9A9A9A calc(.33in - 1.5px),#9A9A9A .33in);}
.fy-mid{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${per === 1 ? 2.9 : 2.4}in;height:${per === 1 ? 1.75 : 1.35}in;
  background:#fff;border:3px solid #2B2B2B;border-radius:50%;box-shadow:0 0 0 5px var(--accent);
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 22px;}
.fy-art{width:${per === 1 ? 0.7 : 0.5}in;height:${per === 1 ? 0.7 : 0.5}in;flex:none;}
.fy-term{font-family:'Fredoka',sans-serif;font-weight:600;text-align:center;line-height:1.05;width:100%;max-height:50%;display:flex;align-items:center;justify-content:center;}
.fy-blank{font-family:'Fredoka',sans-serif;font-weight:600;font-size:12pt;}
.fy-wline{width:80%;border-bottom:1.5px solid var(--line);height:.35in;}`;
  return { title, sections, css, empty: data.length ? null : 'Add some terms first.' };
}

// ─────────────────────────────────────────────────────────────────────────────
// CROSSWORD
// ─────────────────────────────────────────────────────────────────────────────
function layoutCrossword(list, maxDim) {
  let best = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const longest = list.reduce((m, x) => (x.w.length > m.w.length ? x : m));
    const order = attempt === 0 ? [...list].sort((a, b) => b.w.length - a.w.length)
      : [longest, ...shuffle(list.filter(x => x !== longest))];
    const cells = new Map();                 // "r,c" → { ch, dirs:Set }
    const placed = [];
    let minR = 0, maxR = 0, minC = 0, maxC = 0;
    const get = (r, c) => cells.get(r + ',' + c);
    const fits = (w, r, c, dir) => {
      const dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0;
      if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
      let inter = 0;
      for (let i = 0; i < w.length; i++) {
        const rr = r + dr * i, cc = c + dc * i, cur = get(rr, cc);
        if (cur) {
          if (cur.ch !== w[i] || cur.dirs.has(dir)) return -1;
          inter++;
        } else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
      }
      const nMinR = Math.min(minR, r), nMaxR = Math.max(maxR, r + dr * (w.length - 1));
      const nMinC = Math.min(minC, c), nMaxC = Math.max(maxC, c + dc * (w.length - 1));
      if (nMaxR - nMinR + 1 > maxDim || nMaxC - nMinC + 1 > maxDim) return -1;
      const grow = (nMaxR - nMinR + 1) * (nMaxC - nMinC + 1) - (maxR - minR + 1) * (maxC - minC + 1);
      return inter ? inter * 10 - grow * 0.08 + 0.001 : -1;
    };
    const put = (item, r, c, dir) => {
      const dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0;
      for (let i = 0; i < item.w.length; i++) {
        const k = (r + dr * i) + ',' + (c + dc * i);
        if (!cells.has(k)) cells.set(k, { ch: item.w[i], dirs: new Set() });
        cells.get(k).dirs.add(dir);
      }
      minR = Math.min(minR, r); maxR = Math.max(maxR, r + dr * (item.w.length - 1));
      minC = Math.min(minC, c); maxC = Math.max(maxC, c + dc * (item.w.length - 1));
      placed.push({ ...item, r, c, dir });
    };
    put(order[0], 0, 0, 'A');
    let pending = order.slice(1);
    for (let pass = 0; pass < 2; pass++) {
      const still = [];
      for (const item of pending) {
        let opts = [];
        for (const p of placed) {
          const pdr = p.dir === 'D' ? 1 : 0, pdc = p.dir === 'A' ? 1 : 0, nd = p.dir === 'A' ? 'D' : 'A';
          const ndr = nd === 'D' ? 1 : 0, ndc = nd === 'A' ? 1 : 0;
          for (let i = 0; i < p.w.length; i++) for (let j = 0; j < item.w.length; j++) {
            if (p.w[i] !== item.w[j]) continue;
            const r = p.r + pdr * i - ndr * j, c = p.c + pdc * i - ndc * j;
            const s = fits(item.w, r, c, nd);
            if (s !== -1) opts.push({ r, c, dir: nd, s: s + Math.random() * 2 });
          }
        }
        if (opts.length) { opts.sort((a, b) => b.s - a.s); put(item, opts[0].r, opts[0].c, opts[0].dir); }
        else still.push(item);
      }
      pending = still;
    }
    const area = (maxR - minR + 1) * (maxC - minC + 1);
    const score = placed.length * 1000 - area;
    if (!best || score > best.score) best = { placed, cells, minR, maxR, minC, maxC, score, skipped: pending };
    if (best.placed.length === list.length && attempt > 12) break;
  }
  return best;
}

export function crossword(data, o) {
  const title = 'Crossword Puzzle';
  const MAXD = 19;
  const list = [];
  for (const d of shuffle(data)) {
    const w = puzzleWord(d.term);
    if (w.length < 3 || w.length > MAXD || list.some(x => x.w === w)) continue;
    list.push({ w, d });
    if (list.length >= 20) break;
  }
  if (list.length < 2) return { title, sections: [], css: '', empty: 'The crossword needs at least 2 terms of 3–19 letters.' };
  const L = layoutCrossword(list, MAXD);

  // number by reading order; across/down starting on the same square share a number
  const starts = [...new Set(L.placed.map(p => p.r + ',' + p.c))]
    .map(k => k.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const numAt = new Map(starts.map(([r, c], i) => [r + ',' + c, i + 1]));
  L.placed.forEach(p => { p.num = numAt.get(p.r + ',' + p.c); });

  const rows = L.maxR - L.minR + 1, cols = L.maxC - L.minC + 1;
  const cell = Math.min(0.4, 6.9 / cols, 5.3 / rows);
  const gridHtml = (fill) => {
    let h = '';
    for (let r = L.minR; r <= L.maxR; r++) for (let c = L.minC; c <= L.maxC; c++) {
      const x = L.cells.get(r + ',' + c), n = numAt.get(r + ',' + c);
      h += x ? `<span class="cw-c">${n ? `<i>${n}</i>` : ''}${fill ? `<b>${x.ch}</b>` : ''}</span>` : `<span class="cw-x"></span>`;
    }
    return `<div class="cw-grid" style="--cols:${cols};--rows:${rows};--cell:${fill ? Math.min(cell, 0.3) : cell}in">${h}</div>`;
  };
  const across = L.placed.filter(p => p.dir === 'A').sort((a, b) => a.num - b.num);
  const down = L.placed.filter(p => p.dir === 'D').sort((a, b) => a.num - b.num);
  const clue = (p) => `<div class="clue"><b>${p.num}</b><span>${esc(maskTerm(p.d.description, p.d.term))} <span class="len">${lenHint(p.d.term)}</span></span></div>`;
  const clueItems = [
    ...(across.length ? [`<div class="clue-h">${arrow('A')} Across</div>`, ...across.map(clue)] : []),
    ...(down.length ? [`<div class="clue-h">${arrow('D')} Down</div>`, ...down.map(clue)] : []),
  ];
  const keyItems = [
    ...(across.length ? [keyHead('Across'), ...across.map(p => keyItem(`${p.num}.`, p.w, p.w !== p.d.term.toUpperCase() ? p.d.term : ''))] : []),
    ...(down.length ? [keyHead('Down'), ...down.map(p => keyItem(`${p.num}.`, p.w, p.w !== p.d.term.toUpperCase() ? p.d.term : ''))] : []),
  ];
  if (L.skipped.length) keyItems.push(`<div class="knote">Couldn't fit into the grid: ${L.skipped.map(s => esc(s.d.term)).join(', ')}.</div>`);

  const sections = [
    flowSection({ title, topic: o.topic, label: `${L.placed.length} words`, heading: 'Solve the puzzle', icon: 'pencil',
      directions: 'Read each clue and write the word in the boxes, one letter per box. The number in brackets tells you how many letters.',
      pre: gridHtml(false), listClass: 'clue-list' }, clueItems),
    flowSection({ title, topic: o.topic, kind: 'key', heading: 'Answers', icon: 'check',
      pre: gridHtml(true), listClass: 'key-list two' }, keyItems),
  ];
  const css = KEY_CSS + `
.cw-grid{display:grid;grid-template-columns:repeat(var(--cols),var(--cell));grid-auto-rows:var(--cell);width:max-content;margin:4px auto 14px;}
.cw-c{position:relative;border:1.6px solid #2B2B2B;margin:0 -1.6px -1.6px 0;background:#fff;display:flex;align-items:center;justify-content:center;}
.cw-c i{position:absolute;top:1px;left:2px;font-style:normal;font-size:calc(var(--cell) * .26);font-weight:700;line-height:1;}
.cw-c b{font-family:'Andika',sans-serif;font-size:calc(var(--cell) * .55);color:var(--red);}
.cw-x{background:transparent;}
.clue-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 22px;}
.clue-h{grid-column:1/-1;font-family:'Fredoka',sans-serif;font-weight:600;font-size:14pt;display:flex;align-items:center;gap:6px;margin-top:6px;border-bottom:2px solid var(--soft);}
.clue-h svg{width:18px;height:18px;}
.clue{display:flex;gap:7px;font-size:10.5pt;align-items:baseline;}
.clue b{font-family:'Fredoka',sans-serif;font-weight:600;min-width:1.5em;text-align:right;font-size:11pt;}
.clue .len{color:#666;white-space:nowrap;}`;
  return { title, sections, css };
}

const arrow = (d) => d === 'A'
  ? `<svg viewBox="0 0 24 24"><path d="M3 12h15M13 6l6 6-6 6" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  : `<svg viewBox="0 0 24 24"><path d="M12 3v15M6 13l6 6 6-6" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
