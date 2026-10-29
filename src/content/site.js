// ═══════════════════════════════════════════════════════════════════════════
// SITE CONTENT  (src/content/site.js)
//
// Everything here is plain data — no code to understand. Edit freely:
//   STORE         links to your TPT store and Buy Me a Coffee
//   FORMATS       the 8 downloadable formats (order = order on screen)
//   THEMES        colour choices for the printed files
//   SAMPLE_LISTS  free starter word lists (load in one click on the site)
// (Later, the admin area will edit this file for you.)
// ═══════════════════════════════════════════════════════════════════════════

// ── Store links ──────────────────────────────────────────────────────────────
// Leave tptUrl empty ('') and the site simply hides every "on TPT" button.
// When your store page is ready, paste its address between the quotes.
export const STORE = {
    tptUrl: 'https://www.teacherspayteachers.com/store/liveglossarypro-resources',                                        // e.g. 'https://www.teacherspayteachers.com/store/your-store'
  coffeeUrl: 'https://buymeacoffee.com/cliffowright',
};

// ── Formats ──────────────────────────────────────────────────────────────────
//   id     must match a key in GENERATORS (src/worksheets/index.js), or 'glossary'
//   short  label on the format tabs
//   slug   used in the downloaded file name, e.g. "word-search-2026-10-23.html"
//   img    picture on the landing page (files live in /public/img)
export const FORMATS = [
  { id: 'flashcards', label: 'Flash cards',       short: 'Flash cards',  slug: 'flashcards',     img: '/img/ws-flashcards.jpg',
    desc: '8 to a sheet. Print double-sided — the backs line up.' },
  { id: 'studysheet', label: 'Study sheet',       short: 'Study sheet',  slug: 'study-sheet',    img: '/img/ws-studysheet.jpg',
    desc: 'Word study, fill-in-the-blank with a word bank, and matching.' },
  { id: 'quiz',       label: 'Quiz',              short: 'Quiz',         slug: 'quiz',           img: '/img/ws-quiz.jpg',
    desc: 'Multiple choice + matching, up to four shuffled versions.' },
  { id: 'bingo',      label: 'Bingo & word wall', short: 'Bingo',        slug: 'bingo-wordwall', img: '/img/ws-bingo.jpg',
    desc: 'Unique cards, a caller sheet, and cut-out word wall cards.' },
  { id: 'wordsearch', label: 'Word search',       short: 'Word search',  slug: 'word-search',    img: '/img/ws-wordsearch.jpg',
    desc: 'Easy, medium or challenge. Picture word list included.' },
  { id: 'crossword',  label: 'Crossword',         short: 'Crossword',    slug: 'crossword',      img: '/img/ws-crossword.jpg',
    desc: 'Clues from your definitions, with letter counts.' },
  { id: 'frayer',     label: 'Frayer model',      short: 'Frayer',       slug: 'frayer-model',   img: '/img/ws-frayer.jpg',
    desc: 'Definition, picture, examples and non-examples.' },
  { id: 'glossary',   label: 'Class glossary',    short: 'Class glossary', slug: 'class-glossary', img: null,
    desc: 'A searchable A–Z page your class can add to and edit.' },
];
export const formatById = (id) => FORMATS.find(f => f.id === id) || FORMATS[0];

// ── Colour themes for the printed files ──────────────────────────────────────
// accent = borders, titles, highlights · accentDark = darker shade · accentPale = light fills
export const THEMES = [
  { name: 'Gold',    accent: '#DAD80A', accentDark: '#B8B608', accentPale: '#FAFACC', nav: '#1A1A1A', bg: '#1A1A1A', pageBg: '#F5F5F0', cardBg: '#FEFEFD', text: '#0A0A0A' },
  { name: 'Amber',   accent: '#D4B351', accentDark: '#A8892F', accentPale: '#F7EFD6', nav: '#1A1A1A', bg: '#1A1A1A', pageBg: '#F5F5F0', cardBg: '#FEFEFD', text: '#0A0A0A' },
  { name: 'Ocean',   accent: '#2196F3', accentDark: '#1565C0', accentPale: '#E3F2FD', nav: '#0D1B2A', bg: '#0D1B2A', pageBg: '#F0F4F8', cardBg: '#FAFCFF', text: '#0A0A0A' },
  { name: 'Forest',  accent: '#4CAF50', accentDark: '#388E3C', accentPale: '#E8F5E9', nav: '#1B2420', bg: '#1B2420', pageBg: '#F2F5F2', cardBg: '#FDFEFB', text: '#0A0A0A' },
  { name: 'Crimson', accent: '#E63946', accentDark: '#C1121F', accentPale: '#FFECEE', nav: '#1D1A22', bg: '#1D1A22', pageBg: '#FBF5F5', cardBg: '#FFFCFD', text: '#0A0A0A' },
  { name: 'Purple',  accent: '#9C27B0', accentDark: '#7B1FA2', accentPale: '#F3E5F5', nav: '#1A1020', bg: '#1A1020', pageBg: '#F5F0F7', cardBg: '#FEFBFF', text: '#0A0A0A' },
];

// ── Free starter word lists ──────────────────────────────────────────────────
// These are starter examples — replace or add your own teacher-written lists.
//   grade   shown on the card's folder tab
//   band    one of 'K–2', '3–5', '6–8', '9–12' (used by the grade filter)
//   color   folder-tab colour
//   words   [term, definition] pairs
export const SAMPLE_LISTS = [
  {
    id: 'g5-science', title: 'Earth, Life & Energy', subject: 'Science', grade: 'Grade 5', band: '3–5', color: '#FFB74D',
    words: [
      ['Photosynthesis', 'The process plants use to make food from sunlight, water, and carbon dioxide.'],
      ['Evaporation', 'When liquid water is heated and changes into water vapor, a gas.'],
      ['Condensation', 'When water vapor cools and changes back into liquid droplets, like on a cold glass.'],
      ['Precipitation', 'Water that falls from clouds as rain, snow, sleet, or hail.'],
      ['Habitat', 'The natural home of an animal or plant where it finds food, water, and shelter.'],
      ['Ecosystem', 'All the living and nonliving things in an area that interact with each other.'],
      ['Predator', 'An animal that hunts and eats other animals.'],
      ['Prey', 'An animal that is hunted and eaten by another animal.'],
      ['Fossil', 'The preserved remains or traces of a plant or animal that lived long ago.'],
      ['Erosion', 'The movement of rock and soil from one place to another by wind, water, or ice.'],
      ['Volcano', "An opening in the Earth's crust where melted rock, called magma, erupts."],
      ['Magnet', 'An object that attracts iron and steel and has a north and south pole.'],
      ['Gravity', 'The force that pulls objects toward each other, such as toward the center of Earth.'],
      ['Friction', 'A force that slows down moving objects when two surfaces rub together.'],
      ['Circuit', 'A closed path that electricity flows through.'],
      ['Orbit', 'The curved path an object takes around a planet or star.'],
    ],
  },
  {
    id: 'g7-math', title: 'Ratios & Expressions', subject: 'Math', grade: 'Grade 7', band: '6–8', color: '#81C784',
    words: [
      ['Ratio', 'A comparison of two quantities, such as 3 to 4 (3:4).'],
      ['Rate', 'A ratio that compares two quantities with different units, such as miles per hour.'],
      ['Unit rate', 'A rate in which the second quantity is 1, such as 60 miles per 1 hour.'],
      ['Proportion', 'An equation stating that two ratios are equal.'],
      ['Percent', 'A ratio that compares a number to 100.'],
      ['Integer', 'A whole number or its opposite, such as −3, 0, or 5.'],
      ['Absolute value', 'The distance of a number from zero on a number line.'],
      ['Variable', 'A letter or symbol that stands for an unknown number.'],
      ['Coefficient', 'The number multiplied by a variable, such as 4 in 4x.'],
      ['Expression', 'A math phrase with numbers, variables, and operations but no equal sign.'],
      ['Equation', 'A math sentence that shows two expressions are equal.'],
      ['Inequality', 'A math sentence that compares two values using <, >, ≤, or ≥.'],
      ['Exponent', 'A number that shows how many times a base is multiplied by itself.'],
      ['Circumference', 'The distance around a circle.'],
      ['Probability', 'How likely an event is to happen, from 0 (impossible) to 1 (certain).'],
    ],
  },
  {
    id: 'ela-speech', title: 'Parts of Speech', subject: 'English', grade: 'Grades 3–6', band: '3–5', color: '#E57373',
    words: [
      ['Noun', 'A word that names a person, place, thing, or idea.'],
      ['Pronoun', 'A word that takes the place of a noun, such as he, she, it, or they.'],
      ['Verb', 'A word that shows action or a state of being.'],
      ['Adjective', 'A word that describes a noun or pronoun.'],
      ['Adverb', 'A word that describes a verb, adjective, or another adverb, often telling how, when, or where.'],
      ['Preposition', 'A word that shows how a noun relates to another word, such as in, on, or under.'],
      ['Conjunction', 'A word that joins words or groups of words, such as and, but, or or.'],
      ['Interjection', 'A word or phrase that shows strong feeling, such as Wow! or Oops!'],
      ['Article', 'The words a, an, and the, which come before a noun.'],
      ['Subject', 'The part of a sentence that tells who or what the sentence is about.'],
      ['Predicate', 'The part of a sentence that tells what the subject does or is.'],
      ['Synonym', 'A word that means the same or almost the same as another word.'],
      ['Antonym', 'A word that means the opposite of another word.'],
      ['Prefix', 'A word part added to the beginning of a word that changes its meaning, such as un- or re-.'],
      ['Suffix', 'A word part added to the end of a word that changes its meaning, such as -ful or -less.'],
    ],
  },
];

// Little instruction sheet included in the "Download all formats" zip.
export const ZIP_README = `Live Glossary Pro – your vocabulary files
==========================================

Each .html file opens in any web browser (double-click it). No internet needed.

PRINTING
  1. Open a worksheet file.
  2. Choose US Letter or A4 in the bar at the top, then click "Print / Save as PDF".
  3. In the print dialog set Scale to 100% and Margins to "Default" or "None".
     Choose "Save as PDF" as the printer to get a PDF instead.

TIPS
  • Answer keys are always on their own pages at the end – print pages selectively.
  • Flash cards: print double-sided, flip on the LONG edge, then cut on the dashed lines.
  • The Class Glossary file is interactive: add, edit and search words, then use
    "Save updated glossary" to keep your changes, or "Export CSV" to reuse the list.
`;
