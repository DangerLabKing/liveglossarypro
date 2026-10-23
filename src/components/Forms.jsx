// ═══════════════════════════════════════════════════════════════════════════
// FORMS: "Request a list" (landing page) and the email signup card
// (shown after a download). Both go to Netlify Forms — see src/lib/forms.js.
// Only what the teacher types in these boxes is sent. Never their word list.
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { sendForm, looksLikeEmail } from '../lib/forms.js';
import { CheckIcon } from './Icons.jsx';

export function RequestForm() {
  const [state, setState] = useState('idle');   // idle | sending | sent | error
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const unit = String(f.get('unit') || '').trim();
    const email = String(f.get('email') || '').trim();
    if (!unit) { setError('Please tell us the subject or unit.'); return; }
    if (email && !looksLikeEmail(email)) { setError('That email address doesn’t look quite right.'); return; }
    setError(''); setState('sending');
    try {
      await sendForm('request-list', {
        'bot-field': f.get('bot-field'),           // spam trap — real people leave it empty
        grade: f.get('grade'), unit, words: f.get('words'), email,
        monthly: f.get('monthly') ? 'yes' : 'no',
      });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <div className="card" style={{ padding: 24, display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: 'none' }} role="status">
        <span className="tick" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: '#2E7D32', border: '2.5px solid #2B2B2B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon color="#fff" width={3.2} /></span>
        <div><h3 style={{ fontSize: 22, marginBottom: 4 }}>Thanks — request received!</h3><p className="muted">We read every one. If you left an email, we’ll write when your list is ready.</p></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      {/* spam trap: hidden from people, tempting to bots */}
      <p className="honey" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <div className="row">
        <label className="field">Grade
          <select name="grade" defaultValue="">
            <option value="" disabled>Choose…</option>
            <option>K–2</option><option>3–5</option><option>6–8</option><option>9–12</option>
          </select>
        </label>
        <label className="field" style={{ flex: '2 1 220px' }}>Subject &amp; unit
          <input name="unit" maxLength={200} placeholder="e.g. 6th grade science — cells" />
        </label>
      </div>
      <label className="field">Words you’d like included <span className="opt">(optional)</span>
        <textarea name="words" rows={3} maxLength={2000} placeholder="mitochondria, nucleus, membrane…" />
      </label>
      <label className="field">Email <span className="opt">(optional — to hear when it’s ready)</span>
        <input name="email" type="email" maxLength={200} autoComplete="email" placeholder="you@school.org" />
      </label>
      <label className="check"><input type="checkbox" name="monthly" /> Also send me a free list each month</label>
      {error && <p className="notice error" role="alert">{error}</p>}
      {state === 'error' && <p className="notice error" role="alert">Sorry — that didn’t send. Please try again in a moment.</p>}
      <button type="submit" className="btn btn-dark" style={{ alignSelf: 'flex-start' }} disabled={state === 'sending'}>
        {state === 'sending' ? <><span className="spinner" /> Sending…</> : 'Request this list'}
      </button>
    </form>
  );
}

/**
 * Shown under the download buttons after a file is downloaded.
 * @param format   e.g. "quiz" — used in the heading and saved with the signup
 * @param onClose  hide the card ("No thanks")
 */
export function SignupCard({ label, onClose }) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') || '').trim();
    if (!looksLikeEmail(email)) { setError('Please check your email address.'); return; }
    setError(''); setState('sending');
    try {
      await sendForm('newsletter', { 'bot-field': f.get('bot-field'), email, source: 'after-download' });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="signup" role="region" aria-label="Free monthly word lists">
      <div className="msg">
        <span className="tick" aria-hidden="true"><CheckIcon color="#fff" width={3.2} /></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 20 }}>Your {label.toLowerCase()} is downloaded!</strong>
          <span className="muted" style={{ fontSize: 15 }}>
            {state === 'sent' ? 'You’re on the list — look out for your first free word list.' : 'Want a free, ready-made word list in your inbox each month? One email, a new list, and a teaching tip.'}
          </span>
        </div>
      </div>
      {state !== 'sent' && (
        <form onSubmit={submit} noValidate>
          <p className="honey" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
          <div className="row-wrap">
            <label className="field" style={{ flex: '1 1 200px' }}>Your email
              <input name="email" type="email" maxLength={200} autoComplete="email" placeholder="you@school.org" />
            </label>
            <button type="submit" className="btn btn-gold" style={{ alignSelf: 'flex-end' }} disabled={state === 'sending'}>
              {state === 'sending' ? <span className="spinner" /> : 'Send me lists'}
            </button>
          </div>
          {error && <p className="notice error" role="alert" style={{ fontSize: 14 }}>{error}</p>}
          {state === 'error' && <p className="notice error" role="alert" style={{ fontSize: 14 }}>Sorry — that didn’t send. Please try again.</p>}
          <div className="small">
            <span>Only your email is sent — never your word list. Unsubscribe anytime.</span>
            <button type="button" className="link-btn" style={{ fontSize: 13 }} onClick={onClose}>No thanks</button>
          </div>
        </form>
      )}
    </div>
  );
}
