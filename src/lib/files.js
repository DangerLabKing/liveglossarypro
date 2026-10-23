// ═══════════════════════════════════════════════════════════════════════════
// FILE HELPERS  (src/lib/files.js) — downloads, dates, names, clipboard
// ═══════════════════════════════════════════════════════════════════════════

/** Hand some data to the browser as a download with the given file name. */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Today's date as "2026-10-23" in the teacher's own time zone (not UTC). */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "Unit 3: Science!" → "unit-3-science" (safe for file names). Falls back if empty. */
export function slugify(s, fallback = 'vocabulary') {
  const out = String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  return out || fallback;
}

/** Copy text to the clipboard. Returns true if it worked. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / blocked clipboard: fall back to a hidden text box.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
