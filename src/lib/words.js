// ═══════════════════════════════════════════════════════════════════════════
// WORD LISTS  (src/lib/words.js)
//
// Everything about getting words IN and OUT of the app:
//   readWordList(text)  → turns pasted text or an uploaded file into rows
//   toCSV(rows)         → a CSV file that opens safely in Excel / Google Sheets
//   toText(rows)        → "word — meaning" lines for copying and pasting
//
// SECURITY: whatever a teacher pastes or uploads is treated as plain text.
// It is cleaned here (hidden/disguising characters removed, lengths capped)
// and is never inserted into a page as HTML anywhere in the app.
// ═══════════════════════════════════════════════════════════════════════════

export const LIMITS = {
  fileBytes: 2 * 1024 * 1024,   // biggest upload / paste we accept (2 MB)
  terms: 2000,                  // most words in one list
  term: 500,                    // longest word/term (characters)
  description: 5000,            // longest definition (characters)
};

/**
 * Remove characters that are invisible or can disguise text:
 *  - control characters (except tab and line breaks)
 *  - zero-width characters (U+200B–U+200D, U+2060, U+FEFF)
 *  - right-to-left / left-to-right override characters, which can make text
 *    display in a different order from how it is stored (U+202A–U+202E, U+2066–U+2069)
 * and convert accented letters to one standard form (NFC), so "é" typed two
 * different ways counts as the same letter.
 */
export function cleanText(s) {
  return String(s ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
}

// ───────────────────────────────────────────────────────────────────────────
// CSV reading
// ───────────────────────────────────────────────────────────────────────────

/** Split CSV text into records (handles quotes, "" escapes and line breaks inside quotes). */
function csvRecords(text, delim) {
  const records = [];
  let row = [], cur = '', inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else cur += ch;
    } else if (ch === '"' && cur.trim() === '') { inQuote = true; cur = ''; }
    else if (ch === delim) { row.push(cur.trim()); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur.trim()); records.push(row); row = []; cur = '';
    } else cur += ch;
  }
  row.push(cur.trim()); records.push(row);
  return records.filter(r => r.some(f => f !== ''));
}

/**
 * Guess which character separates the columns: comma, tab, pipe or semicolon.
 * Picks the one that appears (outside quotes) on the most of the first 20 lines.
 */
export function detectDelimiter(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim()).slice(0, 20);
  let best = ',', bestScore = -1;
  for (const d of [',', '\t', '|', ';']) {
    let score = 0;
    for (const line of lines) {
      let inQ = false, n = 0;
      for (const ch of line) { if (ch === '"') inQ = !inQ; else if (ch === d && !inQ) n++; }
      if (n > 0) score++;
    }
    if (score > bestScore) { best = d; bestScore = score; }
  }
  return best;
}

// Separators accepted in "pasted list" mode: word — meaning, word - meaning, word: meaning
const LINE_SEPARATORS = [' — ', ' – ', ' - ', '—', '–', ': ', ' = '];

// Where the first separator starts (-1 if none). The earliest one wins.
function sepIndex(line) {
  let best = -1;
  for (const sep of LINE_SEPARATORS) {
    const at = line.indexOf(sep);
    if (at > 0 && (best === -1 || at < best)) best = at;
  }
  return best;
}

// "volcano — an opening…" → ['volcano', 'an opening…']
function splitLine(line) {
  const at = sepIndex(line);
  if (at < 0) return null;
  const sep = LINE_SEPARATORS.filter(s => line.startsWith(s, at)).sort((a, b) => b.length - a.length)[0];
  return [line.slice(0, at).trim(), line.slice(at + sep.length).trim()];
}

// Words we recognise as a header row ("Term,Description") and skip.
const HEADER_WORDS = ['term', 'word', 'words', 'name', 'title', 'glossary term', 'vocabulary'];
const ICON_HEADERS = ['icon', 'picture', 'image', 'clipart'];

/**
 * Read a word list from pasted text or a file's contents.
 * Accepts either:
 *   • "word — meaning" lines (also word - meaning, word: meaning), or
 *   • CSV / TSV with columns Term, Description and an optional Icon column.
 *
 * Returns { rows, notes, problems }
 *   rows      [{ term, description, icon? }]   — clean, de-duplicated, capped
 *   notes     short messages about what was adjusted (for the screen)
 *   problems  [{ line, text, reason }]          — lines that couldn't be used
 */
export function readWordList(input) {
  const notes = [];
  const problems = [];
  let text = cleanText(input);
  if (text.length > LIMITS.fileBytes) {
    text = text.slice(0, LIMITS.fileBytes);
    notes.push('That was a very large list — only the first 2 MB was used.');
  }
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], notes, problems };

  // Undo the apostrophe our own CSV export adds in front of =, +, - or @
  const unguard = (s) => s.replace(/^'(?=[=+\-@])/, '');

  // Decide the mode: pasted "word — meaning" lines, or a spreadsheet-style file.
  // A line counts as "pasted style" only if its dash/colon comes BEFORE any
  // comma, tab, pipe or semicolon — so CSV definitions containing dashes don't fool it.
  const looksPasted = (l) => {
    const at = sepIndex(l);
    if (at < 0) return false;
    const firstDelim = l.search(/[,\t|;]/);
    return firstDelim === -1 || at < firstDelim;
  };
  const headerFirst = new RegExp(`^"?(${HEADER_WORDS.join('|')})"?\\s*[,\t|;]`, 'i').test(lines[0]);
  const dashLines = lines.filter(looksPasted).length;
  const pasteMode = !headerFirst && dashLines >= Math.ceil(lines.length * 0.6);

  let raw = [];   // [{ term, description, icon, line }]
  if (pasteMode) {
    lines.forEach((l, i) => {
      const parts = splitLine(l);
      if (parts && parts[0] && parts[1]) raw.push({ term: parts[0], description: parts[1], line: i + 1 });
      else problems.push({ line: i + 1, text: l.slice(0, 80), reason: 'no dash or colon between the word and its meaning' });
    });
  } else {
    const delim = detectDelimiter(text);
    const recs = csvRecords(text, delim);
    const hdr = (recs[0] || []).map(h => h.toLowerCase());
    const hasHeader = HEADER_WORDS.includes(hdr[0]);
    const iconCol = hasHeader && ICON_HEADERS.includes(hdr[2]);
    recs.slice(hasHeader ? 1 : 0).forEach((f, i) => {
      const term = unguard(f[0] || ''), description = unguard(f[1] || '');
      const line = i + 1 + (hasHeader ? 1 : 0);
      if (!term || !description) {
        problems.push({ line, text: f.join(' ').slice(0, 80), reason: term ? 'missing a meaning' : 'missing the word' });
        return;
      }
      // 3rd column = clipart keyword, used only when it looks like one (e.g. "volcano")
      const rawIcon = (f[2] || '').trim();
      const icon = (iconCol || /^[A-Za-z][A-Za-z -]{1,24}$/.test(rawIcon)) ? rawIcon.slice(0, 40) : '';
      raw.push({ term, description, icon, line });
    });
  }

  // Caps and duplicates
  let cut = 0;
  const seen = new Map();
  const rows = [];
  for (const r of raw) {
    if (r.term.length > LIMITS.term) { r.term = r.term.slice(0, LIMITS.term); cut++; }
    if (r.description.length > LIMITS.description) { r.description = r.description.slice(0, LIMITS.description); cut++; }
    const key = r.term.toLowerCase();
    if (seen.has(key)) {
      problems.push({ line: r.line, text: r.term, reason: `same word as line ${seen.get(key)} — skipped` });
      continue;
    }
    seen.set(key, r.line);
    rows.push(r.icon ? { term: r.term, description: r.description, icon: r.icon } : { term: r.term, description: r.description });
  }
  if (cut) notes.push(`${cut} very long ${cut === 1 ? 'entry was' : 'entries were'} shortened.`);
  if (rows.length > LIMITS.terms) {
    notes.push(`Only the first ${LIMITS.terms} words were kept (the list had ${rows.length}).`);
    rows.length = LIMITS.terms;
  }
  return { rows, notes, problems };
}

// ───────────────────────────────────────────────────────────────────────────
// Getting words OUT
// ───────────────────────────────────────────────────────────────────────────

/**
 * One CSV cell, made safe:
 *  - a cell starting with = + - @ (or tab / carriage return) could run as a
 *    formula when the file is opened in Excel, so it gets an apostrophe in front
 *    (readWordList removes it again when the file comes back in)
 *  - cells with commas, quotes or line breaks are wrapped in quotes
 */
export function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\r\n]/.test(s) || /^\s|\s$/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** A complete CSV file (with the invisible marker Excel needs to show accents correctly). */
export function toCSV(rows) {
  const withIcon = rows.some(r => r.icon);
  const head = withIcon ? ['Term', 'Description', 'Icon'] : ['Term', 'Description'];
  const body = rows.map(r => (withIcon ? [r.term, r.description, r.icon || ''] : [r.term, r.description]).map(csvCell).join(','));
  return '\uFEFF' + [head.join(','), ...body].join('\r\n') + '\r\n';
}

/** "word — meaning" lines, ready to paste back into the app or into a document. */
export function toText(rows) {
  return rows.map(r => `${r.term} — ${r.description}`).join('\n');
}
