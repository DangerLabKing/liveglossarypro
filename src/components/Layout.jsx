// ═══════════════════════════════════════════════════════════════════════════
// SITE HEADER & FOOTER  (shared by every page)
// ═══════════════════════════════════════════════════════════════════════════
import { STORE } from '../content/site.js';

/** "Live Glossary Pro" with the logo. `go` navigates without reloading the page. */
export function Brand({ go, small }) {
  return (
    <a href="/" className="brand" onClick={(e) => { e.preventDefault(); go('/'); }}>
      <img src="/logo.svg" alt="" width={small ? 34 : 44} height={small ? 34 : 44} />
      <span>Live Glossary <span className="pro-pill">Pro</span></span>
    </a>
  );
}

/**
 * Header. On the landing page it shows section links; on the worksheet
 * screen pass `children` (the step indicator) instead.
 */
export function SiteHeader({ go, children }) {
  return (
    <header className="site-head">
      <nav className="wrap" aria-label="Main">
        <Brand go={go} />
        {children || (
          <>
            <a className="nav-link" href="#formats">Worksheets</a>
            <a className="nav-link" href="#how">How it works</a>
            <a className="nav-link" href="#lists">Word lists</a>
            <a className="nav-link" href="#free">Free &amp; private</a>
            <a className="btn btn-gold" href="/make" onClick={(e) => { e.preventDefault(); go('/make'); }}>Make worksheets</a>
          </>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter({ go }) {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <Brand go={go} small />
        <a href="/make" onClick={(e) => { e.preventDefault(); go('/make'); }}>Make worksheets</a>
        <a href="/#lists" onClick={(e) => { e.preventDefault(); go('/', 'lists'); }}>Word lists</a>
        {STORE.tptUrl && <a href={STORE.tptUrl} target="_blank" rel="noopener noreferrer">Our TPT store</a>}
        {STORE.coffeeUrl && <a href={STORE.coffeeUrl} target="_blank" rel="noopener noreferrer">Buy me a coffee</a>}
        <span className="muted" style={{ fontSize: 14 }}>© {new Date().getFullYear()} Live Glossary Pro</span>
      </div>
    </footer>
  );
}
