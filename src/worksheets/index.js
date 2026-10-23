// Entry point: build a printable worksheet file.
// Loaded on demand from App.jsx, so the fonts and generators stay out of the main bundle.
import { buildDoc, dedupe, esc, flowSection } from './engine.js';
import { pickIcon } from './clipart.js';
import { flashCards, studySheet, quiz, bingo, wordSearch, crossword, frayer } from './generators.js';

const GENERATORS = {
  flashcards: flashCards,
  studysheet: studySheet,
  quiz,
  bingo,
  wordsearch: wordSearch,
  crossword,
  frayer,
};

export const WORKSHEET_FORMATS = Object.keys(GENERATORS);

/**
 * @param {string} format   one of WORKSHEET_FORMATS
 * @param {object} theme    sanitized theme colours
 * @param {Array}  rows     [{ term, description, icon? }]
 * @param {object} opts     options from the app – see wsOpts in App.jsx
 *                          { topic, bingoCards, versions, … }
 */
export function buildWorksheet(format, theme, rows, opts = {}) {
  const gen = GENERATORS[format];
  if (!gen) throw new Error('Unknown worksheet format: ' + format);
  const topic = String(opts.topic || '').trim().slice(0, 60);
  const data = dedupe(rows).map(r => ({ ...r, icon: pickIcon(r.term, r.description, r.icon) }));
  const out = gen(data, { ...opts, topic });
  let sections = out.sections;
  if (out.empty || !sections.length) {
    sections = [flowSection({ title: out.title, topic, noName: true, heading: 'Not enough words yet', icon: 'clipboard' },
      [`<p style="font-size:13pt">${esc(out.empty || 'Add more terms to your CSV and generate again.')}</p>`])];
  }
  const icons = ['book', 'pencil', 'puzzle', 'bulb', 'magnify', 'check', 'speech', 'star', 'clipboard', ...data.map(d => d.icon)];
  const footerText = String(opts.footerText || '').trim().slice(0, 80);
  return buildDoc({ title: out.title, topic, theme, sections, icons, css: out.css, footerText, credit: opts.credit !== false });
}
