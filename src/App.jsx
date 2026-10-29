// ═══════════════════════════════════════════════════════════════════════════
// APP ROOT  (src/App.jsx)
//
// Two pages:
//   "/"      → <Landing>    the home page
//   "/make"  → <Workspace>  paste words, pick a worksheet, preview, download
//
// The word list (`rows`) lives here so it survives moving between the pages.
// It is kept in memory only — never uploaded, never saved — and disappears
// when the tab is closed.
//
// Keeping teachers oriented (so a list is never "lost" or "stuck"):
//   • the list has a name (sample title, file name, or the Topic box)
//   • the home page shows a "You have N words in progress" bar while words are loaded,
//     and the header button becomes "Back to my words (N)"
//   • replacing or clearing a list (New list, sample, upload) shows an Undo message
//   • the browser warns before closing/refreshing the tab while words are loaded
//
// Where things are:
//   src/content/site.js   formats, colours, sample lists, store links (edit freely)
//   src/components/       the pages and their parts
//   src/lib/              word-list reading/CSV, downloads, forms, zip
//   src/worksheets/       everything that builds the downloadable files
//   src/styles/site.css   the look of the website
// ═══════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';
import { SiteHeader, SiteFooter } from './components/Layout.jsx';
import { Landing } from './components/Landing.jsx';
import { Workspace } from './components/Workspace.jsx';
import { UndoToast } from './components/UndoToast.jsx';

export const APP_VERSION = '2.1.0';

const UNDO_SECONDS = 10;   // how long the "Undo" message stays up

// Which page the address bar points at.
const pageFromPath = () => (window.location.pathname.replace(/\/+$/, '') === '/make' ? 'make' : 'home');

export default function App() {
  const [page, setPage] = useState(pageFromPath);
  const [rows, setRows] = useState([]);            // the word list: [{ term, description, icon? }]
  const [listName, setListName] = useState('');    // e.g. "Grade 7 · Ratios & Expressions" or a file name
  const [listKey, setListKey] = useState(0);       // bump to refill the words panel with a new list
  const [downloaded, setDownloaded] = useState(false);
  const [undo, setUndo] = useState(null);          // { message, rows, name } — the list before the last replace
  const undoTimer = useRef(null);

  // Back/forward buttons
  useEffect(() => {
    const onPop = () => setPage(pageFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Warn before the tab is closed or refreshed while a list is loaded
  // (the words only live in this tab, so leaving would lose them).
  useEffect(() => {
    if (!rows.length) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [rows.length]);

  /** Move to a page without reloading. Optional `section` scrolls to an id on the home page. */
  const go = (path, section) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path + (section ? '#' + section : ''));
    setPage(path === '/make' ? 'make' : 'home');
    requestAnimationFrame(() => {
      const target = section && document.getElementById(section);
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    });
  };

  /** Show the Undo message for a few seconds, remembering the list it can bring back. */
  const offerUndo = (message, oldRows, oldName) => {
    clearTimeout(undoTimer.current);
    if (!oldRows.length) { setUndo(null); return; }          // nothing was lost — no need for Undo
    setUndo({ message, rows: oldRows, name: oldName });
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_SECONDS * 1000);
  };

  /**
   * Swap in a whole new list (or an empty one) and offer Undo.
   * @param newRows  the new word list ([] = start fresh)
   * @param name     the new list's name
   * @param message  what the Undo message says, e.g. "List cleared"
   * @param refill   true = refill the words panel's text box from newRows.
   *                 (Upload/sample inside the panel fill the box themselves, so they pass false.)
   */
  const replaceList = (newRows, name, message, refill = true) => {
    offerUndo(message, rows, listName);
    setRows(newRows);
    setListName(name);
    setDownloaded(false);
    if (refill) setListKey(k => k + 1);
  };

  /** Typing in the words box: just update the list (no Undo — that's ordinary editing). */
  const editRows = (newRows) => {
    setRows(newRows);
    if (!newRows.length) setListName('');                     // box emptied by hand → list has no name any more
  };

  const undoReplace = () => {
    if (!undo) return;
    clearTimeout(undoTimer.current);
    setRows(undo.rows);
    setListName(undo.name);
    setListKey(k => k + 1);
    setUndo(null);
  };

  /** Load one of the sample lists and open the worksheet screen. */
  const loadSample = (list) => {
    replaceList(list.words.map(([term, description, icon]) => (icon ? { term, description, icon } : { term, description })), `${list.grade} · ${list.title}`,
      `Switched to “${list.title}”`);
    go('/make');
  };

  /** "Start a new list": empty the list (with Undo) and open the worksheet screen. */
  const newList = () => {
    replaceList([], '', 'List cleared');
    go('/make');
  };

  return (
    <>
      <a href="#content" className="sr-only">Skip to content</a>
      {page === 'home' ? (
        <SiteHeader go={go} wordCount={rows.length} />
      ) : (
        <SiteHeader go={go}>
          {/* step indicator: Words → Worksheet → Print */}
          <ol className="progress" aria-label="Progress">
            <li className={rows.length ? 'done' : 'now'}><span className="dot">{rows.length ? '✓' : '1'}</span>Words</li>
            <li className="dash" aria-hidden="true" />
            <li className={rows.length ? (downloaded ? 'done' : 'now') : 'later'}><span className="dot">{downloaded ? '✓' : '2'}</span>Worksheet</li>
            <li className="dash" aria-hidden="true" />
            <li className={downloaded ? 'now' : 'later'}><span className="dot">3</span>Print</li>
          </ol>
        </SiteHeader>
      )}
      <div id="content">
        {page === 'home'
          ? <Landing go={go} loadSample={loadSample} rows={rows} listName={listName} newList={newList} />
          : <Workspace rows={rows} editRows={editRows} replaceList={replaceList} newList={newList}
              listName={listName} listKey={listKey} onDownloaded={() => setDownloaded(true)} />}
      </div>
      <SiteFooter go={go} />
      {undo && <UndoToast message={undo.message} onUndo={undoReplace} onClose={() => setUndo(null)} />}
    </>
  );
}
