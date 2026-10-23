// ═══════════════════════════════════════════════════════════════════════════
// "YOUR WORDS" PANEL  (left side of the worksheet screen)
//
// Three ways in:  paste/type in the box · Upload CSV · pick a sample list
// One list out:   `rows` (owned by App.jsx) — every format is built from it.
// Two ways out:   Save list (CSV) · Copy list
//
// The text box and the list stay in sync: typing re-reads the box; uploading
// or picking a sample rewrites the box. Pictures chosen in a CSV "Icon" column
// are remembered per word, so editing the box doesn't lose them.
// ═══════════════════════════════════════════════════════════════════════════
import { useMemo, useRef, useState } from 'react';
import { readWordList, toCSV, toText, LIMITS } from '../lib/words.js';
import { saveBlob, today, slugify, copyText } from '../lib/files.js';
import { pickIcon } from '../worksheets/clipart.js';
import { SAMPLE_LISTS } from '../content/site.js';
import { CheckIcon, WarnIcon, DownloadIcon, CopyIcon, UploadIcon } from './Icons.jsx';

const SHOW_MAX = 200;   // how many words to list in the checklist (all are still used)

/**
 * @param rows       current word list [{ term, description, icon? }]
 * @param setRows    replace the word list
 * @param listName   name of the list (topic), used for file names
 * When another part of the app swaps the whole list (e.g. a sample picked on
 * the home page), App.jsx re-creates this panel, so the box is refilled.
 */
export function WordsPanel({ rows, setRows, listName }) {
  const [text, setText] = useState(() => toText(rows));
  const [problems, setProblems] = useState([]);
  const [notes, setNotes] = useState([]);
  const [flash, setFlash] = useState('');
  const icons = useRef(new Map());            // word (lower case) → picture name from an Icon column
  const fileInput = useRef(null);
  const typingTimer = useRef(null);

  // Read the box, keep pictures from an earlier upload, and hand the rows to the app.
  const apply = (value) => {
    const res = readWordList(value);
    res.rows.forEach(r => {
      if (r.icon) icons.current.set(r.term.toLowerCase(), r.icon);
      else if (icons.current.has(r.term.toLowerCase())) r.icon = icons.current.get(r.term.toLowerCase());
    });
    setRows(res.rows);
    setProblems(res.problems);
    setNotes(res.notes);
  };

  const onType = (e) => {
    const v = e.target.value.slice(0, LIMITS.fileBytes);
    setText(v);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => apply(v), 350);   // wait until typing pauses
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';                                       // let the same file be chosen again
    if (!f) return;
    if (!/\.(csv|txt|tsv)$/i.test(f.name)) { setNotes(['Please choose a .csv, .tsv or .txt file.']); return; }
    if (f.size > LIMITS.fileBytes) { setNotes([`That file is ${(f.size / 1048576).toFixed(1)} MB — the limit is 2 MB.`]); return; }
    const content = await f.text();                            // read as plain text, never run
    const res = readWordList(content);
    icons.current = new Map(res.rows.filter(r => r.icon).map(r => [r.term.toLowerCase(), r.icon]));
    setText(toText(res.rows));
    setRows(res.rows);
    setProblems(res.problems);
    setNotes(res.rows.length ? res.notes : ['No words found in that file. Each row needs a word and its meaning.']);
  };

  const onSample = (e) => {
    const list = SAMPLE_LISTS.find(l => l.id === e.target.value);
    e.target.value = '';
    if (!list) return;
    const t = list.words.map(([w, d]) => `${w} — ${d}`).join('\n');
    icons.current = new Map();
    setText(t);
    apply(t);
  };

  const done = (what) => { setFlash(what); setTimeout(() => setFlash(''), 1500); };
  const saveCsv = () => { saveBlob(new Blob([toCSV(rows)], { type: 'text/csv' }), `${slugify(listName, 'word-list')}-${today()}.csv`); done('csv'); };
  const copyList = async () => { if (await copyText(toText(rows))) done('copy'); };

  // Picture status for the checklist (same matching the worksheets use).
  const checklist = useMemo(() => rows.slice(0, SHOW_MAX).map(r => ({ ...r, pic: pickIcon(r.term, r.description, r.icon) })), [rows]);
  const noPic = checklist.filter(r => !r.pic).length;

  return (
    <aside className="card words-panel" aria-labelledby="words-h">
      <div className="head">
        <h2 id="words-h">Your words</h2>
        <span className="count-pill" aria-label={`${rows.length} words`}>{rows.length}</span>
      </div>

      <label className="field">Paste or type — word, dash, meaning
        <textarea rows={8} value={text} onChange={onType} spellCheck="true"
          placeholder={'volcano — an opening in the Earth’s crust where magma erupts\nmagnet — an object that attracts iron and steel'} />
      </label>

      <div className="row-wrap">
        <button type="button" className="btn btn-small" onClick={() => fileInput.current?.click()}><UploadIcon /> Upload CSV</button>
        <input ref={fileInput} type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden onChange={onFile} />
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>Sample:
          <select defaultValue="" onChange={onSample} style={{ minHeight: 40 }}>
            <option value="" disabled>Choose a list…</option>
            {SAMPLE_LISTS.map(l => <option key={l.id} value={l.id}>{l.grade} · {l.title}</option>)}
          </select>
        </label>
      </div>

      {notes.map((n, i) => <p key={i} className="notice warn" role="status">{n}</p>)}

      {(rows.length > 0 || problems.length > 0) && (
        <ul className="word-check" aria-label="Word check">
          {problems.slice(0, 20).map((p, i) => (
            <li key={'p' + i} className="warn"><WarnIcon /><b>{p.text || `Line ${p.line}`}</b><span className="meta">line {p.line}: {p.reason}</span></li>
          ))}
          {checklist.map((r, i) => (
            <li key={i}>
              <CheckIcon color="#2E7D32" />
              <b title={r.term}>{r.term}</b>
              <span className="meta">{r.pic ? 'picture ✓' : 'letter tile'}</span>
            </li>
          ))}
          {rows.length > SHOW_MAX && <li><span className="meta" style={{ marginLeft: 0 }}>…and {rows.length - SHOW_MAX} more</span></li>}
        </ul>
      )}
      {noPic > 0 && rows.length > 0 && (
        <p className="muted" style={{ fontSize: 13 }}>Words without a matching picture get a letter tile. To choose one, add a third CSV column named <b>Icon</b> (e.g. volcano, magnet, money).</p>
      )}

      <div className="take-out">
        <div className="row-wrap">
          <button type="button" className="btn btn-small" onClick={saveCsv} disabled={!rows.length}><DownloadIcon /> {flash === 'csv' ? 'Saved!' : 'Save list (CSV)'}</button>
          <button type="button" className="btn btn-small" onClick={copyList} disabled={!rows.length}><CopyIcon /> {flash === 'copy' ? 'Copied!' : 'Copy list'}</button>
        </div>
        <span className="muted" style={{ fontSize: 13 }}>Opens in Excel or Google Sheets, and uploads straight back in.</span>
      </div>
    </aside>
  );
}
