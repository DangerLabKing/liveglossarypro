// ═══════════════════════════════════════════════════════════════════════════
// NETLIFY FORMS  (src/lib/forms.js)
//
// Sends a form to Netlify, which stores it in your Netlify dashboard
// (Project → Forms) and can email you about each one. No server needed.
//
// Two things make this work:
//   1. index.html contains hidden copies of each form (name + field names),
//      so Netlify knows they exist when it builds the site.
//   2. "Form detection" must be switched on once in Netlify: Project
//      configuration → Forms → Enable form detection.
//
// Spam protection: every form has a hidden "bot-field". People never see it;
// spam bots fill it in, and Netlify throws those submissions away.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param {string} formName  must match a <form name="…"> in index.html
 * @param {object} fields    { fieldName: value } – plain text only
 */
export async function sendForm(formName, fields) {
  const clean = {};
  for (const [k, v] of Object.entries(fields)) clean[k] = String(v ?? '').slice(0, 2000);
  const body = new URLSearchParams({ 'form-name': formName, ...clean }).toString();
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Form "${formName}" was not accepted (${res.status})`);
}

/** Light check that an email address has the usual shape (name@school.org). */
export const looksLikeEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());
