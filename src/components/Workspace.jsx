// ═══════════════════════════════════════════════════════════════════════════
// MAKE WORKSHEETS SCREEN  ("/make")
//
//   left:  <WordsPanel> — the word list
//   right: format tabs → options → live preview → download buttons
//
// The preview rebuilds automatically a moment after anything changes
// (words, format, options, colours), so what you see is what downloads.
// ═══════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';
import { FORMATS, THEMES, ZIP_README, formatById } from '../content/site.js';
import { saveBlob, today, slugify } from '../lib/files.js';
import { WordsPanel } from './WordsPanel.jsx';
import { SignupCard } from './Forms.jsx';
import { LockIcon, DownloadIcon, NewTabIcon } from './Icons.jsx';

// Only #RRGGBB colours ever reach the generated files' CSS.
const sanitizeTheme = (t) => {
  const out = {};
  for (const [k, v] of Object.entries(t)) out[k] = (typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v)) ? v : '#000000';
  return out;
};

// Remember whether the teacher said "No thanks" to the email card (this browser only).
const signupDismissed = () => { try { return localStorage.getItem('lgp-signup-dismissed') === '1'; } catch { return false; } };

/**
 * @param rows         the word list (from App.jsx)
 * @param editRows     update the list while typing
 * @param replaceList  swap in a whole new list, with Undo (upload, sample)
 * @param newList      clear the list, with Undo ("New list" button)
 * @param listName     name of the current list (shown in the words panel)
 * @param listKey      changes when a whole new list is loaded → refreshes the words panel
 * @param onDownloaded called after any download (moves the step indicator to "Print")
 */
export function Workspace({ rows, editRows, replaceList, newList, listName, listKey, onDownloaded }) {
  const [format, setFormat] = useState('quiz');
  const [themeIdx, setThemeIdx] = useState(0);
  // All worksheet options in one object. To add an option: add a default here,
  // an input below, and read it in src/worksheets/generators.js.
  const [opts, setOpts] = useState({
    topic: '',            // line above the title, e.g. "Unit 3 Science"
    bingoCards: 10,       // Bingo: number of different cards (1–40)
    versions: 1,          // Quiz: 1–4 shuffled versions
    wsLevel: 'medium',    // Word search: easy | medium | hard
    frayerPerPage: 2,     // Frayer: 1 or 2 per page
    footerText: '',       // every format: teacher's own footer line
    credit: true,         // every format: "Made with Live Glossary Pro"
  });
  const setOpt = (k, v) => setOpts(o => ({ ...o, [k]: v }));

  const [html, setHtml] = useState(null);        // the file currently previewed
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');
  const [zipProgress, setZipProgress] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const buildNo = useRef(0);                      // ignore results from older builds

  const fmt = formatById(format);

  // Build the HTML text for one format with the current words and options.
  const buildFile = async (formatId) => {
    const t = sanitizeTheme(THEMES[themeIdx]);
    const data = rows.map(({ term, description, icon }) => ({ term, description, icon }));
    const mod = await import('../worksheets/index.js');    // loaded the first time only
    return formatId === 'glossary' ? mod.buildGlossary(t, data, opts) : mod.buildWorksheet(formatId, t, data, opts);
  };

  // Live preview: rebuild shortly after any change.
  useEffect(() => {
    if (!rows.length) { setHtml(null); return; }
    const my = ++buildNo.current;
    setBuilding(true);
    const timer = setTimeout(async () => {
      try {
        const h = await buildFile(format);
        if (my === buildNo.current) { setHtml(h); setError(''); }
      } catch (err) {
        console.error(err);
        if (my === buildNo.current) setError('Something went wrong building this worksheet. Try another format, or check your list.');
      }
      if (my === buildNo.current) setBuilding(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [rows, format, opts, themeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterDownload = () => { onDownloaded?.(); if (!signupDismissed()) setShowSignup(true); };

  const download = () => {
    if (!html) return;
    saveBlob(new Blob([html], { type: 'text/html' }), `${fmt.slug}-${today()}.html`);
    afterDownload();
  };

  const downloadAll = async () => {
    setError('');
    try {
      const { makeZip } = await import('../lib/zip.js');
      const folder = `${slugify(opts.topic)}-${today()}`;
      const files = [];
      for (let i = 0; i < FORMATS.length; i++) {
        setZipProgress(`${i + 1} / ${FORMATS.length}`);
        await new Promise(r => setTimeout(r, 0));                 // let the screen update
        files.push({ name: `${folder}/${String(i + 1).padStart(2, '0')}-${FORMATS[i].slug}.html`, content: await buildFile(FORMATS[i].id) });
      }
      files.push({ name: `${folder}/README.txt`, content: ZIP_README });
      saveBlob(await makeZip(files), `${folder}.zip`);
      afterDownload();
    } catch (err) {
      console.error(err);
      setError('Couldn’t build the zip. Please try again, or download formats one at a time.');
    }
    setZipProgress(null);
  };

  const openInTab = () => {
    if (!html) return;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="wrap workspace">
      <WordsPanel key={listKey} rows={rows} editRows={editRows} replaceList={replaceList} newList={newList}
        listName={listName || opts.topic} />

      <section className="work-main" aria-labelledby="pick-h">
        <div className="title-row">
          <h1 id="pick-h" className="outlined">Pick a worksheet</h1>
          <span className="hand muted" style={{ fontSize: 20 }}>the preview is exactly what prints</span>
        </div>

        <div className="format-tabs" role="group" aria-label="Worksheet type">
          {FORMATS.map(f => (
            <button key={f.id} type="button" aria-pressed={format === f.id}
              className={f.id === 'glossary' ? 'glossary-tab' : ''} onClick={() => setFormat(f.id)}>{f.short}</button>
          ))}
        </div>
        <p className="format-blurb">{fmt.desc}</p>

        {/* ── options ── */}
        <div className="card options" style={{ boxShadow: 'none' }}>
          <label className="field grow">Topic <span className="opt">(shows above the title)</span>
            <input value={opts.topic} maxLength={60} onChange={e => setOpt('topic', e.target.value)} placeholder="e.g. Unit 3 Science" />
          </label>
          {format === 'quiz' && (
            <label className="field">Versions
              <select value={opts.versions} onChange={e => setOpt('versions', +e.target.value)}>
                <option value={1}>1 version</option><option value={2}>2 (A, B)</option><option value={3}>3 (A–C)</option><option value={4}>4 (A–D)</option>
              </select>
            </label>
          )}
          {format === 'wordsearch' && (
            <label className="field">Difficulty
              <select value={opts.wsLevel} onChange={e => setOpt('wsLevel', e.target.value)}>
                <option value="easy">Easy — across &amp; down</option><option value="medium">Medium — adds diagonals</option><option value="hard">Challenge — adds backwards</option>
              </select>
            </label>
          )}
          {format === 'frayer' && (
            <label className="field">Per page
              <select value={opts.frayerPerPage} onChange={e => setOpt('frayerPerPage', +e.target.value)}>
                <option value={1}>1 — more writing room</option><option value={2}>2 — saves paper</option>
              </select>
            </label>
          )}
          {format === 'bingo' && (
            <label className="field">Bingo cards
              <input type="number" min={1} max={40} value={opts.bingoCards} style={{ width: 90 }}
                onChange={e => setOpt('bingoCards', Math.max(1, Math.min(40, parseInt(e.target.value, 10) || 1)))} />
            </label>
          )}
          <div className="field">Colors
            <div className="swatches" role="group" aria-label="Colors">
              {THEMES.map((t, i) => (
                <button key={t.name} type="button" title={t.name} aria-label={t.name} aria-pressed={themeIdx === i}
                  style={{ background: t.accent }} onClick={() => setThemeIdx(i)} />
              ))}
            </div>
          </div>
          <details className="more-opts" style={{ flexBasis: '100%' }}>
            <summary>Footer &amp; credit</summary>
            <div className="row-wrap" style={{ alignItems: 'flex-end' }}>
              <label className="field" style={{ flex: '1 1 260px' }}>Your footer text <span className="opt">(optional)</span>
                <input value={opts.footerText} maxLength={80} onChange={e => setOpt('footerText', e.target.value)} placeholder="e.g. © Ms. Rivera 2026 · Room 12" />
              </label>
              <label className="check" style={{ paddingBottom: 10 }}>
                <input type="checkbox" checked={opts.credit} onChange={e => setOpt('credit', e.target.checked)} /> Include “Made with Live Glossary Pro”
              </label>
            </div>
          </details>
        </div>

        {format === 'bingo' && rows.length > 0 && rows.length < 24 && (
          <p className="notice warn">A full 5×5 bingo card needs 24+ words ({rows.length} now). {rows.length >= 16 ? 'Cards will be 4×4.' : rows.length >= 8 ? 'Cards will be 3×3.' : 'Add at least 8 words for bingo.'}</p>
        )}
        {error && <p className="notice error" role="alert">{error}</p>}

        {/* ── preview ── */}
        <div className="preview">
          <div className="bar">
            <strong>Preview — {fmt.label}{building && rows.length ? ' (updating…)' : ''}</strong>
            <button type="button" className="btn btn-small" onClick={openInTab} disabled={!html}><NewTabIcon /> Open in new tab</button>
          </div>
          {html ? (
            // sandbox: the preview can run its own layout script (and Print), but can't touch the app
            <iframe title={`Preview of ${fmt.label}`} srcDoc={html} sandbox="allow-scripts allow-modals" />
          ) : (
            <div className="placeholder">
              <span className="hand">Your worksheet will appear here</span>
              <span>Add some words on the left — or pick a sample list to try it out.</span>
            </div>
          )}
        </div>

        {/* ── downloads ── */}
        <div className="actions">
          <button type="button" className="btn btn-gold btn-big" onClick={download} disabled={!html || building}><DownloadIcon /> Download {fmt.label.toLowerCase()}</button>
          <button type="button" className="btn" onClick={downloadAll} disabled={!rows.length || !!zipProgress}
            title="Every format with your current colors and options, in one .zip">
            {zipProgress ? <><span className="spinner" /> Building {zipProgress}…</> : `Download all ${FORMATS.length} (.zip)`}
          </button>
          <span className="privacy"><LockIcon /> Stays on this device</span>
        </div>

        {showSignup && <SignupCard label={fmt.label} onClose={() => { setShowSignup(false); try { localStorage.setItem('lgp-signup-dismissed', '1'); } catch { /* storage blocked: fine */ } }} />}
      </section>
    </div>
  );
}
