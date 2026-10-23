// ═══════════════════════════════════════════════════════════════════════════
// UNDO MESSAGE  — "List cleared · Undo"
// Pops up at the bottom of the screen for a few seconds after a list is
// cleared or replaced (App.jsx decides when, and how long).
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param message  e.g. "List cleared" or "Switched to “Ratios & Expressions”"
 * @param onUndo   bring the previous list back
 * @param onClose  hide the message
 */
export function UndoToast({ message, onUndo, onClose }) {
  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="btn btn-gold btn-small" onClick={onUndo}>Undo</button>
      <button type="button" className="close" aria-label="Dismiss" onClick={onClose}>×</button>
    </div>
  );
}
