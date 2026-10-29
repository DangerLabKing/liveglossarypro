// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE  (the home page, "/")
// Sections, top to bottom:
//   Hero → Worksheet formats → How it works → Word lists → Request a list
//   → Made for real classrooms → Free & private → (footer is in App.jsx)
// Text lives right here in the markup, so it's easy to reword.
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { FORMATS, SAMPLE_LISTS, STORE } from '../content/site.js';
import { RequestForm } from './Forms.jsx';
import { LockIcon, ArrowNote, ScissorsIcon, CheckIcon, PictureIcon, PageCheckIcon, KeyIcon, LevelsIcon, PenIcon } from './Icons.jsx';

const BANDS = ['All grades', 'K–2', '3–5', '6–8', '9–12'];

/**
 * @param go          navigate: go('/make')
 * @param loadSample  load one of SAMPLE_LISTS and open the worksheet screen
 * @param rows        the words currently loaded (shows the "in progress" bar when not empty)
 * @param listName    name of that list, if it has one
 * @param newList     clear the list (with Undo) and open the worksheet screen
 */
export function Landing({ go, loadSample, rows = [], listName = '', newList }) {
  const [band, setBand] = useState('All grades');
  const lists = band === 'All grades' ? SAMPLE_LISTS : SAMPLE_LISTS.filter(l => l.band === band);
  const toMake = (e) => { e.preventDefault(); go('/make'); };

  return (
    <main id="top">
      {/* ── "YOU HAVE WORDS IN PROGRESS" bar — only while a list is loaded ── */}
      {rows.length > 0 && (
        <div className="in-progress" role="region" aria-label="Your list in progress">
          <div className="wrap">
            <span className="ip-icon" aria-hidden="true"><PenIcon /></span>
            <p>
              <strong>You have {rows.length} word{rows.length === 1 ? '' : 's'} in progress</strong>
              {listName && <span className="ip-name"> · {listName}</span>}
              <span className="ip-words"> — {rows.slice(0, 3).map(r => r.term).join(', ')}{rows.length > 3 ? '…' : ''}</span>
            </p>
            <div className="ip-actions">
              <a className="btn btn-gold btn-small" href="/make" onClick={toMake}>Back to my words</a>
              <button type="button" className="link-btn" onClick={newList}>Start a new list</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO (chalkboard) ── */}
      <section className="hero on-chalk">
        <div className="wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="pills">
              <span className="pill gold">For K–12 teachers</span>
              <span className="pill soft">Free</span>
              <span className="pill soft">No sign-up</span>
            </div>
            <h1>Type your <span className="nowrap">word list.</span><br /><span className="highlight">Print the worksheets.</span></h1>
            <p className="lede">Flash cards, bingo, word searches, crosswords, quizzes and Frayer models — made from your own vocabulary in seconds, with the answer key on its own page.</p>
            <div className="ctas">
              <a className="btn btn-gold btn-big" href="/make" onClick={toMake}>Make worksheets — it’s free</a>
              <button type="button" className="btn btn-line btn-big" onClick={() => loadSample(SAMPLE_LISTS[0])}>Try a sample list</button>
            </div>
            <p className="small-print"><LockIcon color="#DAD80A" /> Nothing to install. Your list never leaves your computer.</p>
          </div>
          <div className="collage" aria-hidden="true">
            <div className="sheet s1"><img src="/img/ws-flashcards.jpg" alt="" /><span className="tape" style={{ top: -12, left: '34%', transform: 'rotate(4deg)' }} /></div>
            <div className="sheet s2"><img src="/img/ws-bingo.jpg" alt="" /><span className="tape" style={{ top: -12, left: '30%', transform: 'rotate(-5deg)' }} /></div>
            <div className="sheet s3"><img src="/img/ws-wordsearch.jpg" alt="" /><span className="tape" style={{ top: -12, left: '38%', transform: 'rotate(2deg)' }} /></div>
            <div className="note"><ArrowNote /> pictures picked for every word!</div>
          </div>
        </div>
      </section>

      {/* ── FORMATS ── */}
      <section id="formats" className="wrap section">
        <div className="section-head">
          <h2 className="section-title outlined">Eight ways to practice<br />the same words</h2>
          <p className="muted">One list makes all of them. Every part starts on a fresh page, nothing gets cut off, and answer keys print separately.</p>
        </div>
        <div className="format-grid">
          {FORMATS.map((f, i) => f.img ? (
            <article key={f.id} className="card format-card">
              <div className="thumb"><img src={f.img} alt={`Example ${f.label.toLowerCase()} worksheet`} loading="lazy" style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }} /></div>
              <div className="body"><h3>{f.label}</h3><p>{f.desc}</p></div>
            </article>
          ) : (
            <article key={f.id} className="card format-card dark">
              <div className="mini-glossary" aria-hidden="true">
                <div className="search">Search your words…</div>
                <div className="letters"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>
                <div className="entry"><b style={{ color: '#F5F5F0' }}>Atom</b> — the smallest unit of an element…</div>
              </div>
              <div className="body"><h3>{f.label}</h3><p>{f.desc}</p></div>
            </article>
          ))}
        </div>
      </section>

      <div className="wrap"><div className="cutline" aria-hidden="true"><ScissorsIcon /><span /></div></div>

      {/* ── HOW IT WORKS (sticky notes on lined paper) ── */}
      <section id="how" className="ruled">
        <div className="wrap">
          <h2 className="section-title">Three steps. About a minute.</h2>
          <div className="steps">
            <div className="sticky gold">
              <span className="num">1</span>
              <h3>Add your words</h3>
              <p>Paste them in — one word per line, a dash, then the meaning. Or upload a CSV, or pick a sample list.</p>
              <div className="sample">volcano — an opening in the Earth’s crust…<br />magnet — an object that attracts iron<br />orbit — the curved path around a star</div>
            </div>
            <div className="sticky paper">
              <span className="num">2</span>
              <h3>Pick a worksheet</h3>
              <p>See it laid out exactly as it will print. Change the topic, the difficulty or the number of quiz versions.</p>
              <div className="chips"><span className="on">Quiz</span><span>Bingo</span><span>Frayer</span><span>+5 more</span></div>
            </div>
            <div className="sticky amber">
              <span className="num">3</span>
              <h3>Print or save a PDF</h3>
              <p>US Letter or A4. The answer key is always on its own page, so you can print it separately.</p>
              <p className="hand" style={{ fontSize: 22 }}>Done before the bell. ✓</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── READY-MADE WORD LISTS ── */}
      <section id="lists" className="wrap section">
        <div className="section-head">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
            <h2 className="section-title">No list yet? <span className="outlined">Start with ours.</span></h2>
            <p className="muted">Free starter lists you can use right now. Click one and your worksheets are ready to print.</p>
          </div>
          <div className="band-tabs" role="group" aria-label="Filter by grade">
            {BANDS.map(b => <button key={b} type="button" aria-pressed={band === b} onClick={() => setBand(b)}>{b}</button>)}
          </div>
        </div>
        <div className="list-grid">
          {lists.length === 0 && <p className="muted">More lists for these grades are on the way — <a href="#request">request one</a>!</p>}
          {lists.map(l => (
            <article key={l.id} className="index-card">
              <span className="tab" style={{ background: l.color }}>{l.grade}</span>
              <div className="face">
                <div className="top">
                  <span className="subject">{l.subject}</span>
                  <h3>{l.title}</h3>
                </div>
                <div className="bottom">
                  <p className="muted" style={{ fontSize: 15 }}>{l.words.length} words · e.g. <i>{l.words.slice(0, 4).map(w => w[0].toLowerCase()).join(', ')}</i></p>
                  <div className="actions">
                    <button type="button" className="btn btn-gold btn-small" style={{ fontFamily: 'var(--display)', fontSize: 16 }} onClick={() => loadSample(l)}>Use this list free</button>
                    {l.tpt && <a href={l.tpt} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, fontSize: 15 }}>Full set on TPT</a>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {STORE.tptUrl && (
          <div className="store-row">
            <div className="includes">
              <h3 style={{ fontSize: 22 }}>Every full set includes</h3>
              <ul>
                                {['24 teacher-checked words with pictures', '7 activities in one print-ready PDF', 'Answer keys for everything', 'Teacher notes with a ready-made week plan']
                  .map(t => <li key={t}><CheckIcon color="#2B2B2B" />{t}</li>)}
              </ul>
            </div>
            <div className="bundle">
              <span className="tape" />
              <span className="hand" style={{ fontSize: 22, color: '#DAD80A' }}>best value</span>
                            <h3 style={{ fontSize: 26 }}>5th Grade Science bundle</h3>
              <p style={{ color: '#CFCBC0' }}>Every unit in one download, and new packs are added free. Try the free sampler first.</p>
              <a className="btn btn-gold" style={{ alignSelf: 'flex-start', borderColor: '#F5F5F0' }} href={STORE.tptUrl} target="_blank" rel="noopener noreferrer">See bundles in the TPT store</a>
            </div>
          </div>
        )}
      </section>

      {/* ── REQUEST A LIST ── */}
      <section id="request" className="wrap" style={{ paddingTop: 56, paddingBottom: 24 }}>
        <div className="request">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 'clamp(30px, 3.6vw, 42px)' }}>Teaching something we don’t have yet?</h2>
            <p style={{ fontSize: 18 }}>Tell us your next unit and we’ll write a word list for it. Leave your email and we’ll let you know when it’s ready.</p>
            <span className="hand" style={{ fontSize: 23, transform: 'rotate(-2deg)', alignSelf: 'flex-start' }}>every request is read by a real person ✎</span>
          </div>
          <RequestForm />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="wrap section" style={{ paddingBottom: 80 }}>
        <h2 className="section-title" style={{ marginBottom: 36 }}>Made for real classrooms</h2>
        <div className="features">
          <Feature icon={<PictureIcon />} title="A picture for every word">Clipart is matched to each term automatically — a volcano for “volcano”, a magnet for “magnet”.</Feature>
          <Feature icon={<PageCheckIcon />} title="Nothing gets cut off">Questions never split across pages, and every section starts on a fresh sheet.</Feature>
          <Feature icon={<KeyIcon />} title="Answer keys on their own page">Print student copies without the answers, then print the key for yourself.</Feature>
          <Feature icon="A/B" title="Quiz versions A–D">Same questions, shuffled order. Neighbors can’t copy letters.</Feature>
          <Feature icon={<LevelsIcon />} title="Levels for every grade">Easy word searches for young readers, challenge mode for middle and high school.</Feature>
          <Feature icon={<PenIcon />} title="Your name on the page">Add your own footer line — perfect if you share or sell your sets.</Feature>
        </div>
      </section>

      {/* ── FREE & PRIVATE ── */}
      <section id="free" className="free-band on-chalk">
        <div className="wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="section-title">Free. No account.<br />Your list stays with you.</h2>
            <p>Everything happens in your browser. Your words are never uploaded or stored, and the files you download work offline — on any computer.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
            <a className="btn btn-gold btn-big" href="/make" onClick={toMake}>Make your first worksheet</a>
            <span className="hand" style={{ fontSize: 24, color: '#CFCBC0', transform: 'rotate(-2deg)' }}>ready for Monday morning ☺</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="feature">
      <span className="icon" aria-hidden="true">{icon}</span>
      <div><h3>{title}</h3><p>{children}</p></div>
    </div>
  );
}
