// ═══════════════════════════════════════════════════════════════════════════
// SMALL LINE ICONS used around the site (decorative → aria-hidden).
// Each takes an optional `color` (defaults to the current text colour).
// ═══════════════════════════════════════════════════════════════════════════
const base = { viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

export const LockIcon = ({ color = 'currentColor' }) => (
  <svg {...base} width="18" height="18"><rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2.4" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="2.4" /></svg>
);
export const DownloadIcon = ({ color = 'currentColor' }) => (
  <svg {...base}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke={color} strokeWidth="2.6" /></svg>
);
export const CopyIcon = ({ color = 'currentColor' }) => (
  <svg {...base}><rect x="8" y="8" width="12" height="12" rx="2" stroke={color} strokeWidth="2.4" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke={color} strokeWidth="2.4" /></svg>
);
export const CheckIcon = ({ color = 'currentColor', width = 3 }) => (
  <svg {...base}><path d="M5 12l4 4 10-10" stroke={color} strokeWidth={width} /></svg>
);
export const WarnIcon = ({ color = '#8A5A00' }) => (
  <svg {...base}><circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2.6" /><path d="M12 8v5M12 16v.5" stroke={color} strokeWidth="2.6" /></svg>
);
export const ScissorsIcon = () => (
  <svg {...base}><circle cx="6" cy="6" r="3" stroke="#2B2B2B" strokeWidth="2" /><circle cx="6" cy="18" r="3" stroke="#2B2B2B" strokeWidth="2" /><path d="M8.5 7.5 21 18M8.5 16.5 21 6" stroke="#2B2B2B" strokeWidth="2" /></svg>
);
export const ArrowNote = () => (
  <svg width="54" height="34" viewBox="0 0 54 34" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M52 6C36 4 18 10 8 26" stroke="#DAD80A" strokeWidth="2.6" /><path d="M4 18l4 9 9-3" stroke="#DAD80A" strokeWidth="2.6" />
  </svg>
);
export const UploadIcon = ({ color = 'currentColor' }) => (
  <svg {...base}><path d="M12 15V4M7 9l5-5 5 5M5 20h14" stroke={color} strokeWidth="2.6" /></svg>
);
export const NewTabIcon = ({ color = 'currentColor' }) => (
  <svg {...base}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke={color} strokeWidth="2.4" /></svg>
);

// Feature icons (landing page)
export const PictureIcon = () => (
  <svg {...base}><rect x="3" y="4" width="18" height="16" rx="2" stroke="#2B2B2B" strokeWidth="2.2" /><circle cx="9" cy="10" r="2" stroke="#2B2B2B" strokeWidth="2" /><path d="M4 18l5-5 4 4 3-3 4 4" stroke="#2B2B2B" strokeWidth="2.2" /></svg>
);
export const PageCheckIcon = () => (
  <svg {...base}><path d="M6 3h9l4 4v14H6z" stroke="#2B2B2B" strokeWidth="2.2" /><path d="M9 12l2 2 4-4" stroke="#2B2B2B" strokeWidth="2.2" /></svg>
);
export const KeyIcon = () => (
  <svg {...base}><path d="M4 6h10M4 12h10M4 18h7" stroke="#2B2B2B" strokeWidth="2.2" /><path d="M16 15l2 2 4-5" stroke="#D32F2F" strokeWidth="2.4" /></svg>
);
export const LevelsIcon = () => (
  <svg {...base}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="#2B2B2B" strokeWidth="2.4" /></svg>
);
export const PenIcon = () => (
  <svg {...base}><path d="M4 20h4L19 9l-4-4L4 16z" stroke="#2B2B2B" strokeWidth="2.2" /></svg>
);
