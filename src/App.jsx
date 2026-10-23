// ═══════════════════════════════════════════════════════════════════════════
// APP ROOT  (src/App.jsx)
//
// Two pages:
//   "/"      → <Landing>    the home page
//   "/make"  → <Workspace>  paste words, pick a worksheet, preview, download
//
// The word list (`rows`) lives here so it survives moving between the pages.
// It is kept in memory only — never uploaded, never saved — and disappears
// when the tab is closed (or when "Clear my words" is pressed).
//
// Where things are:
//   src/content/site.js   formats, colours, sample lists, store links (edit freely)
//   src/components/       the pages and their parts
//   src/lib/              word-list reading/CSV, downloads, forms, zip
//   src/worksheets/       everything that builds the downloadable files
//   src/styles/site.css   the look of the website
// ═══════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { SiteHeader, SiteFooter } from './components/Layout.jsx';
import { Landing } from './components/Landing.jsx';
import { Workspace } from './components/Workspace.jsx';

export const APP_VERSION = '2.0.0';

// Which page the address bar points at.
const pageFromPath = () => (window.location.pathname.replace(/\/+$/, '') === '/make' ? 'make' : 'home');

export default function App() {
  const [page, setPage] = useState(pageFromPath);
  const [rows, setRows] = useState([]);            // the word list: [{ term, description, icon? }]
  const [listKey, setListKey] = useState(0);       // bump to refill the words panel with a new list
  const [downloaded, setDownloaded] = useState(false);

  // Back/forward buttons
  useEffect(() => {
    const onPop = () => setPage(pageFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** Move to a page without reloading. Optional `section` scrolls to an id on the home page. */
  const go = (path, section) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path + (section ? '#' + section : ''));
    setPage(path === '/make' ? 'make' : 'home');
    requestAnimationFrame(() => {
      const target = section && document.getElementById(section);
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    });
  };

  /** Load one of the sample lists and open the worksheet screen. */
  const loadSample = (list) => {
    setRows(list.words.map(([term, description]) => ({ term, description })));
    setListKey(k => k + 1);
    go('/make');
  };

  const clearWords = () => { setRows([]); setListKey(k => k + 1); setDownloaded(false); };

  return (
    <>
      <a href="#content" className="sr-only">Skip to content</a>
      {page === 'home' ? (
        <SiteHeader go={go} />
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
          {rows.length > 0 && <button type="button" className="link-btn" onClick={clearWords}>Clear my words</button>}
        </SiteHeader>
      )}
      <div id="content">
        {page === 'home'
          ? <Landing go={go} loadSample={loadSample} />
          : <Workspace rows={rows} setRows={setRows} listKey={listKey} onDownloaded={() => setDownloaded(true)} />}
      </div>
      <SiteFooter go={go} />
    </>
  );
}
