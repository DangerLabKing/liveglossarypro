// ═══════════════════════════════════════════════════════════════════════════
// TERM-MATCHED CLIPART
// Sticker-style inline SVGs (dark outline, flat colour) — no external files.
// Each icon lists keywords. pickIcon() scores a term + definition against them;
// when nothing matches we fall back to a letter tile instead of a random picture.
// ═══════════════════════════════════════════════════════════════════════════

const O = '#2B2B2B'; // outline colour

// n = name, k = keywords (single words or phrases), s = inner SVG (48×48 box)
const ICONS = [
  // ── Language arts ────────────────────────────────────────────────────────
  { n:'book', k:'book books read reading reader story stories novel literature library chapter text page glossary dictionary vocabulary fiction nonfiction textbook journal biography autobiography genre',
    s:`<path d="M4 15v25c7-2 14-2 20 1 6-3 13-3 20-1V15" fill="#42A5F5"/><path d="M24 13c-5-3-12-3-18-1v25c6-2 13-2 18 1z" fill="#fff"/><path d="M24 13c5-3 12-3 18-1v25c-6-2-13-2-18 1z" fill="#fff"/><path d="M10 19c3-1 7-1 10 0M10 24c3-1 7-1 10 0M10 29c3-1 7-1 10 0M28 19c3-1 7-1 10 0M28 24c3-1 7-1 10 0M28 29c3-1 7-1 10 0" fill="none" stroke-width="1.5"/>` },
  { n:'pencil', k:'write writing writer pencil essay draft edit editing spell spelling grammar sentence paragraph punctuation homework compose capitalization revise revision',
    s:`<g transform="rotate(40 24 24)"><rect x="18" y="3" width="12" height="29" fill="#FFD54F"/><rect x="18" y="3" width="12" height="6" rx="1" fill="#F48FB1"/><rect x="18" y="9" width="12" height="3" fill="#B0BEC5"/><path d="M18 32l6 11 6-11z" fill="#FFE0B2"/><path d="M22.3 39.8l1.7 3.2 1.7-3.2z" fill="${O}"/></g>` },
  { n:'quill', k:'poem poems poetry poet rhyme stanza verse author declaration signature sign quill ink metaphor simile',
    s:`<path d="M40 4C27 6 16 17 13 33l4 1C22 21 31 12 40 4z" fill="#fff"/><path d="M40 4c-2 11-10 21-22 27" fill="none"/><path d="M15 33l-3 8" fill="none" stroke-width="2.4"/><path d="M6 40h14l-2 5H8z" fill="#42A5F5"/>` },
  { n:'speech', k:'speak speaking speech talk say said dialogue conversation communicate communication language discuss discussion argument opinion persuade persuasive quote quotation voice debate interview message',
    s:`<path d="M8 9h32a4 4 0 014 4v16a4 4 0 01-4 4H22l-9 8v-8H8a4 4 0 01-4-4V13a4 4 0 014-4z" fill="#fff"/><circle cx="15" cy="21" r="2.4" fill="${O}" stroke="none"/><circle cx="24" cy="21" r="2.4" fill="${O}" stroke="none"/><circle cx="33" cy="21" r="2.4" fill="${O}" stroke="none"/>` },
  { n:'masks', k:'drama theater theatre actor actress act scene character comedy tragedy emotion emotions feeling feelings mood stage performance',
    s:`<path d="M5 7h20v13c0 8-4 14-10 14S5 28 5 20z" fill="#FFD54F"/><path d="M23 14h20v13c0 8-4 14-10 14s-10-6-10-14z" fill="#42A5F5"/><path d="M10 15h3M17 15h3M10 23c2 3 8 3 10 0" fill="none"/><path d="M28 22h3M35 22h3M28 33c2-3 8-3 10 0" fill="none"/>` },
  { n:'abc', k:'alphabet letter letters vowel vowels consonant phonics syllable noun nouns verb verbs adjective adverb pronoun preposition conjunction prefix suffix root synonym antonym homophone homonym compound contraction',
    s:`<rect x="15" y="5" width="18" height="18" rx="2" fill="#FFD54F"/><rect x="4" y="25" width="18" height="18" rx="2" fill="#EF5350"/><rect x="26" y="25" width="18" height="18" rx="2" fill="#42A5F5"/><g stroke="none" font-family="Fredoka,Arial,sans-serif" font-weight="600" font-size="14" text-anchor="middle"><text x="24" y="19" fill="${O}">A</text><text x="13" y="39" fill="#fff">B</text><text x="35" y="39" fill="#fff">C</text></g>` },
  { n:'envelope', k:'mail envelope post postal email message send correspondence',
    s:`<rect x="5" y="11" width="38" height="26" rx="3" fill="#fff"/><path d="M6 13l18 14 18-14" fill="none"/><path d="M6 36l13-12M42 36L29 24" fill="none" stroke-width="1.5"/>` },

  // ── Science: chemistry & physics ─────────────────────────────────────────
  { n:'atom', k:'atom atoms atomic electron electrons proton protons neutron neutrons nucleus element elements molecule molecules particle particles matter nuclear isotope ion periodic',
    s:`<g fill="none" stroke="#1E88E5" stroke-width="2.4"><ellipse cx="24" cy="24" rx="19" ry="7"/><ellipse cx="24" cy="24" rx="19" ry="7" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="19" ry="7" transform="rotate(120 24 24)"/></g><circle cx="24" cy="24" r="4.5" fill="#EF5350"/>` },
  { n:'flask', k:'chemistry chemical chemicals experiment lab laboratory solution mixture liquid acid base reaction compound scientist hypothesis dissolve solvent solute substance beaker test-tube science scientific',
    s:`<path d="M20 6v12L9 38a3 3 0 003 4h24a3 3 0 003-4L28 18V6z" fill="#fff"/><path d="M13.4 30h21.2L39 38a3 3 0 01-3 4H12a3 3 0 01-3-4z" fill="#66BB6A" stroke="none"/><path d="M20 6v12L9 38a3 3 0 003 4h24a3 3 0 003-4L28 18V6M17 6h14M13.4 30h21.2" fill="none"/><circle cx="20" cy="36" r="2" fill="#fff" stroke-width="1.4"/><circle cx="27" cy="34" r="1.4" fill="#fff" stroke-width="1.2"/>` },
  { n:'magnet', k:'magnet magnets magnetic magnetism attract attraction repel pole poles',
    s:`<path d="M9 7v17a15 15 0 0030 0V7h-9v17a6 6 0 01-12 0V7z" fill="#EF5350"/><path d="M9 7h9v7H9zM30 7h9v7h-9z" fill="#ECEFF1"/>` },
  { n:'bolt', k:'electricity electric electrical current circuit circuits voltage charge static lightning thunder conductor insulator energy power watt',
    s:`<path d="M28 3L10 27h11l-4 18 21-26H26z" fill="#FFD54F"/>` },
  { n:'battery', k:'battery batteries store stored storage chemical-energy recharge',
    s:`<rect x="5" y="14" width="33" height="20" rx="3" fill="#fff"/><rect x="38" y="20" width="5" height="8" rx="1" fill="#B0BEC5"/><rect x="9" y="18" width="18" height="12" rx="1" fill="#66BB6A" stroke="none"/><path d="M16 20v8M12 24h8" fill="none" stroke="#fff" stroke-width="2"/>` },
  { n:'force', k:'force forces push pull friction inertia momentum motion move movement kinetic potential newton acceleration accelerate velocity gravity gravitational',
    s:`<rect x="22" y="15" width="21" height="21" rx="2" fill="#FFB74D"/><path d="M3 25h14" fill="none" stroke="#E53935" stroke-width="3.2"/><path d="M11 18l7 7-7 7" fill="none" stroke="#E53935" stroke-width="3.2"/><path d="M20 40h26" fill="none"/>` },
  { n:'thermometer', k:'temperature heat hot cold thermal degree degrees celsius fahrenheit thermometer warm cool fever',
    s:`<path d="M20 30V9a4 4 0 018 0v21a8 8 0 11-8 0z" fill="#fff"/><path d="M22 33V17h4v16z" fill="#EF5350" stroke="none"/><circle cx="24" cy="36" r="5" fill="#EF5350"/><path d="M31 11h4M31 16h3M31 21h4M31 26h3" fill="none" stroke-width="1.6"/>` },
  { n:'sound', k:'sound sounds noise loud quiet volume vibration vibrate echo hear hearing listen frequency amplitude audio acoustic speaker',
    s:`<path d="M6 18h8l10-8v28l-10-8H6z" fill="#B0BEC5"/><path d="M30 18c3 3 3 9 0 12M35 13c6 6 6 16 0 22" fill="none" stroke-width="2.6"/>` },
  { n:'gear', k:'machine machines gear gears engineering engineer mechanical mechanism technology simple-machine lever pulley wheel axle system process engine',
    s:`<g fill="#90A4AE"><rect x="20" y="2" width="8" height="10" rx="1.5"/><rect x="20" y="2" width="8" height="10" rx="1.5" transform="rotate(45 24 24)"/><rect x="20" y="2" width="8" height="10" rx="1.5" transform="rotate(90 24 24)"/><rect x="20" y="2" width="8" height="10" rx="1.5" transform="rotate(135 24 24)"/><rect x="20" y="2" width="8" height="10" rx="1.5" transform="rotate(180 24 24)"/><rect x="20" y="2" width="8" height="10" rx="1.5" transform="rotate(225 24 24)"/><rect x="20" y="2" width="8" height="10" rx="1.5" transform="rotate(270 24 24)"/><rect x="20" y="2" width="8" height="10" rx="1.5" transform="rotate(315 24 24)"/></g><circle cx="24" cy="24" r="14" fill="#90A4AE"/><circle cx="24" cy="24" r="5.5" fill="#fff"/>` },
  { n:'bulb', k:'idea ideas invent invention inventor innovation innovate create creative creativity discover discovery imagine imagination bright theory concept light-bulb brainstorm',
    s:`<path d="M24 4a13 13 0 00-8 23c2 2 2 4 2 6h12c0-2 0-4 2-6a13 13 0 00-8-23z" fill="#FFF176"/><rect x="18" y="33" width="12" height="5" rx="1" fill="#B0BEC5"/><path d="M20 38h8l-1 4h-6z" fill="#90A4AE"/><path d="M21 27l3-7 3 7" fill="none" stroke-width="1.6"/>` },

  // ── Science: life & body ─────────────────────────────────────────────────
  { n:'microscope', k:'microscope microscopic magnification specimen slide microorganism microorganisms bacteria bacterium observe',
    s:`<rect x="9" y="38" width="30" height="5" rx="2" fill="#78909C"/><path d="M31 38c7-3 8-13 2-18" fill="none" stroke-width="3"/><g transform="rotate(-30 22 17)"><rect x="18" y="5" width="8" height="18" rx="2" fill="#B0BEC5"/><rect x="16" y="2" width="12" height="4" rx="1" fill="#78909C"/><rect x="19" y="23" width="6" height="4" fill="#78909C"/></g><rect x="14" y="30" width="17" height="3" fill="#90A4AE"/>` },
  { n:'cell', k:'cell cells membrane cytoplasm mitochondria mitochondrion organelle organelles ribosome ribosomes vacuole chloroplast tissue organism organisms unicellular multicellular',
    s:`<ellipse cx="24" cy="24" rx="20" ry="16" fill="#C5E1A5"/><circle cx="21" cy="22" r="6.5" fill="#AB47BC"/><circle cx="20" cy="21" r="2.2" fill="#6A1B9A" stroke="none"/><ellipse cx="34" cy="29" rx="4.5" ry="2.2" fill="#FFA726" stroke-width="1.6"/><circle cx="12" cy="30" r="1.6" fill="${O}" stroke="none"/><circle cx="31" cy="15" r="1.6" fill="${O}" stroke="none"/><circle cx="16" cy="13" r="1.3" fill="${O}" stroke="none"/>` },
  { n:'dna', k:'dna gene genes genetic genetics heredity hereditary inherit inherited trait traits chromosome chromosomes mutation allele dominant recessive genome evolution adaptation adapt',
    s:`<path d="M17.5 8h13M18.5 20h11M18.5 28h11M17.5 40h13" fill="none" stroke="#90A4AE" stroke-width="2.2"/><path d="M16 4c0 10 16 10 16 20s-16 10-16 20" fill="none" stroke="#1E88E5" stroke-width="3.2"/><path d="M32 4c0 10-16 10-16 20s16 10 16 20" fill="none" stroke="#E53935" stroke-width="3.2"/>` },
  { n:'germ', k:'germ germs virus viruses microbe microbes infection infectious contagious disease bacteria',
    s:`<g fill="none" stroke-width="2.2"><path d="M24 4v8M24 36v8M4 24h8M36 24h8M10 10l6 6M32 32l6 6M38 10l-6 6M16 32l-6 6"/></g><g fill="#AED581"><circle cx="24" cy="4" r="2.4"/><circle cx="24" cy="44" r="2.4"/><circle cx="4" cy="24" r="2.4"/><circle cx="44" cy="24" r="2.4"/><circle cx="10" cy="10" r="2.4"/><circle cx="38" cy="38" r="2.4"/><circle cx="38" cy="10" r="2.4"/><circle cx="10" cy="38" r="2.4"/></g><circle cx="24" cy="24" r="12" fill="#AED581"/><circle cx="20" cy="21" r="2.5" fill="#7CB342" stroke="none"/><circle cx="28" cy="27" r="3" fill="#7CB342" stroke="none"/>` },
  { n:'heart', k:'heart cardiac blood circulation circulatory pulse love kindness kind care caring cardiovascular vein veins artery arteries heartbeat compassion empathy',
    s:`<path d="M24 41S5 30 5 17a9.5 9.5 0 0119-3 9.5 9.5 0 0119 3c0 13-19 24-19 24z" fill="#EF5350"/><path d="M11 17a5 5 0 015-5" fill="none" stroke="#fff" stroke-width="2.2"/>` },
  { n:'brain', k:'brain mind think thinking thought thoughts memory memorize remember learn learning nervous neuron neurons nerve nerves psychology cognitive intelligence intelligent smart knowledge mental reason reasoning logic concentrate focus',
    s:`<path d="M23 9c-3-3-10-2-10 2-5 0-7 6-4 9-3 3-1 9 3 9 0 5 6 8 10 4z" fill="#F48FB1"/><path d="M25 9c3-3 10-2 10 2 5 0 7 6 4 9 3 3 1 9-3 9 0 5-6 8-10 4z" fill="#F48FB1"/><path d="M14 18c3 0 5 2 5 5M12 27c3-1 6 0 7 2M34 18c-3 0-5 2-5 5M36 27c-3-1-6 0-7 2" fill="none" stroke-width="1.6"/>` },
  { n:'eye', k:'eye eyes see sight vision observe observation look visual view perspective optical lens watch witness notice',
    s:`<path d="M3 24c6-10 14-14 21-14s15 4 21 14c-6 10-14 14-21 14S9 34 3 24z" fill="#fff"/><circle cx="24" cy="24" r="8" fill="#42A5F5"/><circle cx="24" cy="24" r="3.5" fill="${O}"/><circle cx="26.5" cy="21.5" r="1.4" fill="#fff" stroke="none"/>` },
  { n:'tooth', k:'tooth teeth dental dentist enamel cavity cavities chew molar',
    s:`<path d="M14 8c4-2 7 1 10 1s6-3 10-1c6 3 5 12 2 17-2 4-2 15-6 15-3 0-2-9-6-9s-3 9-6 9c-4 0-4-11-6-15-3-5-4-14 2-17z" fill="#fff"/><path d="M15 13c1-2 3-2 4-1" fill="none" stroke-width="1.6"/>` },
  { n:'lungs', k:'lungs lung breathe breathing breath respiratory respiration oxygen inhale exhale carbon-dioxide',
    s:`<path d="M24 5v15" fill="none" stroke-width="2.6"/><path d="M22 18c-2-3-6-4-9 0-4 5-6 14-5 20 1 4 6 4 10 2 4-2 4-6 4-10z" fill="#F48FB1"/><path d="M26 18c2-3 6-4 9 0 4 5 6 14 5 20-1 4-6 4-10 2-4-2-4-6-4-10z" fill="#F48FB1"/><path d="M24 19l-4 5M24 19l4 5" fill="none"/>` },
  { n:'bone', k:'bone bones skeleton skeletal skull fossil fossils dinosaur dinosaurs extinct extinction paleontology prehistoric',
    s:`<g transform="rotate(-45 24 24)"><g fill="#FFF8E1"><rect x="10" y="20" width="28" height="8" rx="2"/><circle cx="10" cy="19" r="5"/><circle cx="10" cy="29" r="5"/><circle cx="38" cy="19" r="5"/><circle cx="38" cy="29" r="5"/></g><g fill="#FFF8E1" stroke="none"><rect x="10" y="20" width="28" height="8"/><circle cx="10" cy="19" r="3.9"/><circle cx="10" cy="29" r="3.9"/><circle cx="38" cy="19" r="3.9"/><circle cx="38" cy="29" r="3.9"/></g></g>` },
  { n:'firstaid', k:'medicine medical medication doctor health hospital illness sick vaccine vaccination nurse cure treatment symptom symptoms immune immunity injury wellness diagnosis',
    s:`<path d="M18 14v-4a2 2 0 012-2h8a2 2 0 012 2v4" fill="none"/><rect x="5" y="14" width="38" height="27" rx="4" fill="#fff"/><path d="M21 20h6v5h5v6h-5v5h-6v-5h-5v-6h5z" fill="#EF5350"/>` },
  { n:'dumbbell', k:'exercise fitness workout muscle muscles muscular strength strong gym physical endurance athletic training',
    s:`<rect x="16" y="21" width="16" height="6" fill="#B0BEC5"/><rect x="10" y="12" width="7" height="24" rx="2" fill="#90A4AE"/><rect x="31" y="12" width="7" height="24" rx="2" fill="#90A4AE"/><rect x="4" y="16" width="6" height="16" rx="2" fill="#78909C"/><rect x="38" y="16" width="6" height="16" rx="2" fill="#78909C"/>` },

  // ── Living things ────────────────────────────────────────────────────────
  { n:'leaf', k:'leaf leaves photosynthesis chlorophyll foliage green',
    s:`<path d="M8 40C6 22 18 8 41 7c0 23-14 35-33 33z" fill="#66BB6A"/><path d="M8 40L33 15M16 32l1-8M16 32l8 1M23 25l1-8M23 25l8 1" fill="none" stroke-width="1.6"/>` },
  { n:'sprout', k:'producer producers plant plants seed seeds sprout germinate germination grow growth root roots stem soil garden gardening seedling botany nutrient nutrients fertilizer',
    s:`<path d="M24 28V14" fill="none" stroke-width="2.4"/><path d="M24 19c-1-6-7-9-12-8 0 6 6 9 12 8zM24 15c1-6 7-9 12-8 0 6-6 9-12 8z" fill="#66BB6A"/><path d="M14 31h20l-3 13H17z" fill="#FF8A65"/><rect x="12" y="27" width="24" height="5" rx="1" fill="#FF7043"/>` },
  { n:'flower', k:'flower flowers bloom blossom petal petals pollen pollinate pollination pollinator nectar spring',
    s:`<path d="M24 26v18" fill="none" stroke-width="2.4"/><path d="M24 37c4-6 10-6 12-4-3 5-8 6-12 4z" fill="#66BB6A"/><g fill="#F48FB1"><circle cx="24" cy="9" r="5.5"/><circle cx="31" cy="14" r="5.5"/><circle cx="28.5" cy="22" r="5.5"/><circle cx="19.5" cy="22" r="5.5"/><circle cx="17" cy="14" r="5.5"/></g><circle cx="24" cy="16" r="4.5" fill="#FFD54F"/>` },
  { n:'tree', k:'tree trees forest forests woods wood timber rainforest jungle habitat habitats ecosystem ecosystems environment environmental nature deforestation branch canopy',
    s:`<rect x="21" y="28" width="6" height="15" fill="#8D6E63"/><path d="M24 4c8 0 14 6 13 13 4 3 3 11-3 12H14c-6-1-7-9-3-12-1-7 5-13 13-13z" fill="#66BB6A"/><path d="M17 15c1-3 3-5 6-5" fill="none" stroke="#fff" stroke-width="2"/>` },
  { n:'cactus', k:'desert deserts cactus arid dry drought sand dune dunes',
    s:`<path d="M20 28h-6a4 4 0 01-4-4v-6a2 2 0 014 0v5h6zM28 24h5v-6a2 2 0 014 0v6a4 4 0 01-4 4h-5z" fill="#81C784"/><path d="M20 42V12a4 4 0 018 0v30z" fill="#81C784"/><path d="M6 42h36" fill="none" stroke-width="2.4"/><path d="M23 16v4M25 26v4" fill="none" stroke-width="1.4"/>` },
  { n:'wheat', k:'farm farms farming farmer agriculture agricultural crop crops harvest grain grains wheat rural plantation cultivate livestock',
    s:`<path d="M24 45V7" fill="none" stroke-width="2.2"/><g fill="#FFCA28"><ellipse cx="19" cy="12" rx="3" ry="5" transform="rotate(-30 19 12)"/><ellipse cx="29" cy="12" rx="3" ry="5" transform="rotate(30 29 12)"/><ellipse cx="19" cy="20" rx="3" ry="5" transform="rotate(-30 19 20)"/><ellipse cx="29" cy="20" rx="3" ry="5" transform="rotate(30 29 20)"/><ellipse cx="19" cy="28" rx="3" ry="5" transform="rotate(-30 19 28)"/><ellipse cx="29" cy="28" rx="3" ry="5" transform="rotate(30 29 28)"/><ellipse cx="24" cy="6" rx="2.6" ry="4.5"/></g>` },
  // ── Social studies: government, history, civics ─────────────────────────
  { n:'gavel', k:'gavel judge judges court courts courtroom trial trials jury juries verdict lawyer lawyers attorney judicial supreme-court',
    s:`<g transform="rotate(-38 24 22)"><rect x="12" y="9" width="20" height="10" rx="2" fill="#8D6E63"/><rect x="9" y="7.5" width="5" height="13" rx="2" fill="#A1887F"/><rect x="30" y="7.5" width="5" height="13" rx="2" fill="#A1887F"/><rect x="20.5" y="19" width="3.5" height="22" rx="1.7" fill="#BCAAA4"/></g><rect x="25" y="37" width="20" height="7" rx="2" fill="#8D6E63"/>` },
  { n:'libertybell', k:'bell bells liberty-bell independence-hall philadelphia 1776',
    s:`<rect x="13" y="3" width="22" height="5" rx="1.5" fill="#8D6E63"/><path d="M24 8v3" fill="none"/><path d="M15 19c0-5 4-8 9-8s9 3 9 8v11c0 3 3 6 7 7H8c4-1 7-4 7-7z" fill="#C9A26B"/><path d="M26 17l-3 6 4 4-3 6" fill="none" stroke-width="1.8"/><circle cx="24" cy="41" r="3" fill="#8D6E63"/>` },
  { n:'handshake', k:'handshake agreement agreements alliance alliances ally allies compromise negotiate negotiation partnership partner partners deal deals',
    s:`<path d="M2 17h9l5 4-7 11H2z" fill="#42A5F5"/><path d="M46 17h-9l-5 4 7 11h7z" fill="#FFA726"/><path d="M11 20l9-4 7 3 8-2 4 5-4 5-9 10c-2 2-5 2-7 0l-9-9z" fill="#FFCC80"/><path d="M27 19l-6 6c-1 2 1 3 3 2l5-4M21 31l3 3M18 28l3 3M24 34l2 2" fill="none" stroke-width="1.6"/>` },
  { n:'wagon', k:'wagon wagons covered-wagon pioneer pioneers frontier westward expansion settler settlers homestead oregon-trail trail trails',
    s:`<path d="M9 27V18c0-7 7-11 15-11s15 4 15 11v9z" fill="#FFF8E1"/><path d="M17 9v18M24 7v20M31 9v18" fill="none" stroke-width="1.6"/><rect x="5" y="26" width="38" height="7" rx="1" fill="#8D6E63"/><circle cx="13" cy="38" r="6" fill="#fff"/><circle cx="35" cy="38" r="6" fill="#fff"/><path d="M13 32v12M7 38h12M35 32v12M29 38h12" fill="none" stroke-width="1.4"/>` },
  { n:'timeline', k:'timeline timelines chronology chronological sequence sequences events history-of',
    s:`<path d="M3 26h42" fill="none" stroke-width="3"/><circle cx="10" cy="26" r="4" fill="#EF5350"/><circle cx="24" cy="26" r="4" fill="#FFCA28"/><circle cx="38" cy="26" r="4" fill="#42A5F5"/><path d="M10 22V15M24 30v7M38 22V15" fill="none" stroke-width="1.8"/><rect x="4" y="7" width="12" height="8" rx="2" fill="#fff"/><rect x="18" y="37" width="12" height="8" rx="2" fill="#fff"/><rect x="32" y="7" width="12" height="8" rx="2" fill="#fff"/>` },
  { n:'newspaper', k:'newspaper newspapers news press journalist journalists journalism article articles headline headlines media report reporter reporters',
    s:`<path d="M6 9h31v29a4 4 0 004 4H10a4 4 0 01-4-4z" fill="#fff"/><path d="M37 17h5v21a2.5 2.5 0 01-5 0z" fill="#ECEFF1"/><rect x="10" y="13" width="23" height="5" fill="#2B2B2B" stroke="none"/><rect x="10" y="22" width="10" height="9" fill="#90CAF9"/><path d="M23 23h10M23 27h10M23 31h10M10 35h23" fill="none" stroke-width="1.6"/>` },
  { n:'torch', k:'torch torches liberty freedom freedoms free statue-of-liberty enlightenment',
    s:`<path d="M18 23h12l-4 21h-4z" fill="#FFCA28"/><rect x="15" y="19" width="18" height="5" rx="1.5" fill="#FFB300"/><path d="M24 2c4 5 9 8 9 13a9 9 0 01-18 0c0-3 2-6 4-8 0 3 2 5 4 5-1-3-1-7 1-10z" fill="#FF7043"/><path d="M24 9c2 3 4 5 4 7a4 4 0 01-8 0c0-2 2-4 4-7z" fill="#FFD54F"/>` },
  { n:'megaphone', k:'megaphone protest protests protester protesters rally rallies march marches activist activists activism civil-rights boycott',
    s:`<path d="M9 19h7l20-10v28L16 27H9z" fill="#EF5350"/><rect x="5" y="18" width="6" height="10" rx="2" fill="#ECEFF1"/><path d="M14 27l3 11h5l-2-10" fill="#ECEFF1"/><path d="M40 15l5-3M41 23h5M40 31l5 3" fill="none" stroke-width="2"/>` },

  // ── Seasons & holidays: winter ──────────────────────────────────────────
  { n:'snowman', k:'snowman snowmen snowball snowballs snow-day',
    s:`<circle cx="24" cy="34" r="11" fill="#fff"/><circle cx="24" cy="17.5" r="8" fill="#fff"/><path d="M14 10h20" fill="none" stroke-width="3"/><rect x="18" y="3" width="12" height="7" fill="#2B2B2B"/><circle cx="21" cy="16" r="1.2" fill="#2B2B2B" stroke="none"/><circle cx="27" cy="16" r="1.2" fill="#2B2B2B" stroke="none"/><path d="M24 18.5l6 2-6 1.5z" fill="#FF7043" stroke-width="1.2"/><path d="M16 24c5 2 11 2 16 0l1 4c-6 2-12 2-18 0z" fill="#E53935"/><circle cx="24" cy="32" r="1.3" fill="#2B2B2B" stroke="none"/><circle cx="24" cy="37" r="1.3" fill="#2B2B2B" stroke="none"/>` },
  { n:'mitten', k:'mitten mittens glove gloves scarf scarves winter-hat warm warmth bundle-up',
    s:`<path d="M14 38V18c0-7 4-12 10-12s10 5 10 12v4l4-4c2-2 5 0 4 3l-7 10v7z" fill="#42A5F5"/><path d="M17 20h14M17 26h14" fill="none" stroke="#E3F2FD" stroke-width="2.4"/><rect x="12" y="37" width="25" height="7" rx="2" fill="#E3F2FD"/>` },
  { n:'cocoa', k:'cocoa hot-chocolate mug mugs marshmallow marshmallows drink drinks beverage',
    s:`<path d="M10 19h24v17a6 6 0 01-6 6H16a6 6 0 01-6-6z" fill="#EF5350"/><path d="M34 23h3a5 5 0 010 10h-3" fill="none" stroke-width="2.6"/><ellipse cx="22" cy="19" rx="12" ry="3" fill="#8D6E63"/><rect x="15" y="15" width="5" height="5" rx="1" fill="#fff"/><rect x="22" y="14" width="5" height="5" rx="1" fill="#fff"/><path d="M16 11c-2-2 2-4 0-6M23 10c-2-2 2-4 0-6M30 11c-2-2 2-4 0-6" fill="none" stroke-width="1.8"/>` },
  { n:'sled', k:'sled sleds sledding sledge toboggan ski skis skiing skate skates skating ice-skating slope',
    s:`<rect x="7" y="18" width="31" height="7" rx="2" fill="#EF5350"/><path d="M14 25v7M30 25v7" fill="none" stroke-width="2.4"/><path d="M3 32h33c5 0 8-3 8-8" fill="none" stroke-width="3.2"/><path d="M10 21h25" fill="none" stroke="#FFCDD2" stroke-width="1.6"/>` },
  { n:'evergreen', k:'evergreen evergreens pine pines conifer conifers fir spruce needles pinecone christmas-tree',
    s:`<path d="M24 4l9 11h-4l8 10h-5l9 11H7l9-11h-5l8-10h-4z" fill="#43A047"/><rect x="21" y="36" width="6" height="8" fill="#8D6E63"/><path d="M18 20l3 1M28 27l3-1M16 32l3 1" fill="none" stroke="#C8E6C9" stroke-width="1.6"/>` },
  { n:'gift', k:'gift gifts present presents giving generous generosity surprise birthday',
    s:`<rect x="7" y="21" width="34" height="22" rx="2" fill="#42A5F5"/><rect x="5" y="15" width="38" height="8" rx="2" fill="#64B5F6"/><rect x="21.5" y="15" width="5" height="28" fill="#FFCA28"/><path d="M24 15c-4-8-13-8-11-2 1 3 6 3 11 2zM24 15c4-8 13-8 11-2-1 3-6 3-11 2z" fill="#FFCA28"/>` },
  { n:'penguin', k:'penguin penguins antarctica antarctic polar emperor-penguin',
    s:`<ellipse cx="24" cy="25" rx="13" ry="17" fill="#37474F"/><ellipse cx="24" cy="28" rx="8.5" ry="12" fill="#fff"/><circle cx="20.5" cy="16" r="2" fill="#fff" stroke="none"/><circle cx="27.5" cy="16" r="2" fill="#fff" stroke="none"/><circle cx="20.8" cy="16.3" r="1" fill="#2B2B2B" stroke="none"/><circle cx="27.2" cy="16.3" r="1" fill="#2B2B2B" stroke="none"/><path d="M21 20h6l-3 4z" fill="#FFA726" stroke-width="1.4"/><path d="M16 42h6l-1 3h-5zM26 42h6v3h-5z" fill="#FFA726" stroke-width="1.4"/>` },
  { n:'candle', k:'candle candles wax candlelight kwanzaa hanukkah diwali',
    s:`<rect x="17" y="18" width="14" height="24" rx="2" fill="#FFF3E0"/><path d="M27 18v6c0 2 2 2 2 0v-6" fill="#FFE0B2" stroke-width="1.4"/><path d="M12 43h24" fill="none" stroke-width="3"/><path d="M24 15v3" fill="none" stroke-width="1.6"/><path d="M24 3c3 4 5 6 5 9a5 5 0 01-10 0c0-3 2-5 5-9z" fill="#FFB300"/><path d="M24 8c1.5 2 2.5 3 2.5 4.5a2.5 2.5 0 01-5 0c0-1.5 1-2.5 2.5-4.5z" fill="#FFEB3B"/>` },

  // ── Seasons & holidays: fall / Thanksgiving ─────────────────────────────
  { n:'pumpkin', k:'pumpkin pumpkins gourd gourds squash jack-o-lantern halloween october',
    s:`<path d="M24 15c-11 0-19 6-19 15s8 14 19 14 19-5 19-14-8-15-19-15z" fill="#FB8C00"/><path d="M24 15c-5 0-7 7-7 15s2 14 7 14M24 15c5 0 7 7 7 15s-2 14-7 14M13 18c-3 3-4 7-4 12s2 9 5 11M35 18c3 3 4 7 4 12s-2 9-5 11" fill="none" stroke-width="1.8"/><path d="M22 15c0-4 1-8 4-10l3 2c-2 2-3 5-3 8z" fill="#8D6E63"/><path d="M28 8c4-3 9-2 11 1-4 2-8 2-11-1z" fill="#66BB6A"/>` },
  { n:'turkey', k:'turkey turkeys thanksgiving gobble gobbler poultry',
    s:`<g transform="translate(24 30)"><g fill="#EF5350"><ellipse cx="0" cy="-15" rx="5" ry="11" transform="rotate(-62)"/><ellipse cx="0" cy="-15" rx="5" ry="11" transform="rotate(62)"/></g><g fill="#FFA726"><ellipse cx="0" cy="-15" rx="5" ry="11" transform="rotate(-31)"/><ellipse cx="0" cy="-15" rx="5" ry="11" transform="rotate(31)"/></g><ellipse cx="0" cy="-15" rx="5" ry="11" fill="#FFD54F"/></g><circle cx="24" cy="31" r="10" fill="#8D6E63"/><circle cx="24" cy="21" r="5.5" fill="#A1887F"/><circle cx="22" cy="20" r="1.1" fill="#2B2B2B" stroke="none"/><circle cx="26" cy="20" r="1.1" fill="#2B2B2B" stroke="none"/><path d="M22 23h4l-2 3z" fill="#FFCA28" stroke-width="1.4"/><path d="M25.5 24.5c1.5 1 1.5 3.5 0 4.5" fill="none" stroke="#E53935" stroke-width="2"/><path d="M20 41v4M28 41v4M18 45h4M26 45h4" fill="none" stroke-width="1.8"/>` },
  { n:'pie', k:'pie pies dessert desserts bake baking baked bakery tart',
    s:`<path d="M5 25h38l-4 13H9z" fill="#FFCC80"/><path d="M5 25c0-6 9-9 19-9s19 3 19 9c0 3-9 5-19 5S5 28 5 25z" fill="#E65100"/><path d="M5 25c0 3 9 5 19 5s19-2 19-5" fill="none" stroke-width="2.2"/><path d="M13 20l4 9M21 17l4 13M29 17l4 12M10 23c8 2 20 2 28 0" fill="none" stroke="#FFCC80" stroke-width="2.4"/><path d="M9 38h30" fill="none"/>` },
  { n:'fallleaf', k:'autumn fall maple deciduous orange-leaves fall-leaves changing-leaves',
    s:`<path d="M24 4l4 8 6-3-1 8 7 1-5 6 4 4-9 1 1 7-7-4-7 4 1-7-9-1 4-4-5-6 7-1-1-8 6 3z" fill="#E64A19"/><path d="M24 16v28M24 26l-6-5M24 26l6-5" fill="none" stroke-width="1.6"/>` },
  { n:'corn', k:'corn maize cob cobs kernel kernels popcorn three-sisters',
    s:`<path d="M24 4c5 0 8 9 8 19s-3 17-8 17-8-7-8-17 3-19 8-19z" fill="#FFD54F"/><path d="M17 15h14M16 21h16M16 27h16M17 33h14M21 6v31M27 6v31" fill="none" stroke="#F9A825" stroke-width="1.4"/><path d="M24 45c-7-2-12-11-13-22 5 5 9 11 13 22z" fill="#66BB6A"/><path d="M24 45c7-2 12-11 13-22-5 5-9 11-13 22z" fill="#81C784"/>` },
  { n:'cornucopia', k:'cornucopia horn-of-plenty abundance plenty bounty bountiful',
    s:`<path d="M34 20C26 21 16 18 9 11c-3-3-7-1-5 2 4 14 15 26 30 26z" fill="#D7A86E"/><path d="M12 17c4 5 10 9 18 11M8 14c3 2 5 6 6 10M18 23c-1 4-1 9 1 13M26 26c-1 4-1 8 1 12" fill="none" stroke-width="1.4"/><ellipse cx="34" cy="29.5" rx="4.5" ry="9.5" fill="#8D5A2B"/><circle cx="40" cy="23" r="4.5" fill="#EF5350"/><circle cx="41.5" cy="32" r="4.5" fill="#FFA726"/><g fill="#AB47BC"><circle cx="35" cy="39" r="2.4"/><circle cx="39" cy="40" r="2.4"/><circle cx="37" cy="43.5" r="2.4"/></g><path d="M40 18.5c1-2 3-3 5-2" fill="none" stroke-width="1.6"/>` },

  { n:'apple', k:'apple apples fruit fruits food foods nutrition eat eating healthy diet snack vitamin vitamins',
    s:`<path d="M24 15c-4-3-13-3-14 7-1 9 5 19 10 19 2 0 3-1 4-1s2 1 4 1c5 0 11-10 10-19-1-10-10-10-14-7z" fill="#EF5350"/><path d="M24 15c0-4 1-7 3-9" fill="none"/><path d="M26 11c2-4 7-5 9-3-2 4-6 5-9 3z" fill="#66BB6A"/><path d="M15 22c0-3 2-5 4-5" fill="none" stroke="#fff" stroke-width="2"/>` },
  { n:'paw', k:'consumer consumers animal animals mammal mammals pet pets species wildlife creature creatures vertebrate vertebrates predator predators prey carnivore herbivore omnivore dog cat zoo hibernate hibernation',
    s:`<g fill="#A1887F"><ellipse cx="24" cy="32" rx="10" ry="9"/><ellipse cx="11" cy="20" rx="4" ry="5"/><ellipse cx="19" cy="12" rx="4" ry="5"/><ellipse cx="29" cy="12" rx="4" ry="5"/><ellipse cx="37" cy="20" rx="4" ry="5"/></g>` },
  { n:'fish', k:'fish fishes gills fins scales aquatic marine aquarium salmon shark',
    s:`<path d="M6 24c6-9 18-11 26-4l8-7v22l-8-7C24 35 12 33 6 24z" fill="#4FC3F7"/><circle cx="14" cy="22" r="2" fill="${O}" stroke="none"/><path d="M20 18c2 3 2 9 0 12" fill="none" stroke-width="1.6"/>` },
  { n:'bird', k:'scavenger scavengers vulture vultures bird birds feather feathers wing wings nest nests migrate migration beak egg eggs flock',
    s:`<path d="M11 28l-7-5 2 9z" fill="#42A5F5"/><path d="M10 28c0-10 8-16 16-14 8 2 12 10 10 18-2 6-10 10-18 8-5-2-8-6-8-12z" fill="#42A5F5"/><path d="M36 21l8 2.5-8 3z" fill="#FFA726"/><circle cx="30" cy="21" r="2" fill="${O}" stroke="none"/><path d="M15 26c5 0 10 2 12 8-6 1-10-2-12-8z" fill="#90CAF9"/>` },
  { n:'ladybug', k:'insect insects bug bugs beetle ant ants bee bees arthropod arthropods antenna antennae larva pupa',
    s:`<path d="M21 7l-3-4M27 7l3-4" fill="none"/><circle cx="24" cy="12" r="6" fill="${O}"/><ellipse cx="24" cy="28" rx="14" ry="15" fill="#EF5350"/><path d="M24 13v30" fill="none"/><g fill="${O}" stroke="none"><circle cx="17" cy="22" r="2.6"/><circle cx="31" cy="22" r="2.6"/><circle cx="16" cy="32" r="2.2"/><circle cx="32" cy="32" r="2.2"/><circle cx="20" cy="39" r="1.8"/><circle cx="28" cy="39" r="1.8"/></g>` },
  { n:'butterfly', k:'butterfly butterflies metamorphosis caterpillar cocoon chrysalis transform transformation life-cycle lifecycle moth',
    s:`<g fill="#AB47BC"><path d="M24 23C18 8 5 6 5 14s8 11 19 11z"/><path d="M24 23c6-15 19-17 19-9s-8 11-19 11z"/></g><g fill="#F48FB1"><path d="M24 25c-8 0-14 4-12 10s10 2 12-7z"/><path d="M24 25c8 0 14 4 12 10s-10 2-12-7z"/></g><path d="M24 13v24" fill="none" stroke-width="3.2"/><path d="M24 13l-4-7M24 13l4-7" fill="none" stroke-width="1.6"/>` },

  // ── Earth & space ────────────────────────────────────────────────────────
  { n:'sun', k:'sun sunny sunlight solar light day daytime summer shine ray rays',
    s:`<path d="M24 3v7M24 38v7M3 24h7M38 24h7M9 9l5 5M34 34l5 5M39 9l-5 5M14 34l-5 5" fill="none" stroke="#FB8C00" stroke-width="3"/><circle cx="24" cy="24" r="10" fill="#FFD54F"/>` },
  { n:'moon', k:'moon moons lunar night phase phases eclipse crater craters tide tides crescent',
    s:`<path d="M30 6a18 18 0 1 0 0 36 22 22 0 0 1 0-36z" fill="#FFE082"/><circle cx="17" cy="18" r="2.5" fill="#FFD54F" stroke-width="1.4"/><circle cx="14" cy="29" r="1.8" fill="#FFE082" stroke-width="1.4"/><circle cx="22" cy="34" r="2" fill="#FFE082" stroke-width="1.4"/>` },
  { n:'planet', k:'planet planets solar-system orbit orbits space astronomy universe galaxy galaxies mars jupiter saturn venus mercury neptune uranus asteroid comet cosmos interstellar megastructure',
    s:`<ellipse cx="24" cy="24" rx="21" ry="6.5" fill="none" stroke="#8D6E63" stroke-width="2.6" transform="rotate(-20 24 24)"/><circle cx="24" cy="24" r="11.5" fill="#FFB74D"/><path d="M3 24a21 6.5 0 0042 0" fill="none" stroke="#8D6E63" stroke-width="2.6" transform="rotate(-20 24 24)"/><path d="M15 20c3-4 9-5 12-4" fill="none" stroke="#fff" stroke-width="1.8"/>` },
  { n:'star', k:'star stars constellation constellations excellent best famous celebrity',
    s:`<path d="M24 4l5.9 12.4 13.6 1.7-10 9.4 2.6 13.5L24 34.4 11.9 41l2.6-13.5-10-9.4 13.6-1.7z" fill="#FFD54F"/><path d="M17 19l4-1" fill="none" stroke="#fff" stroke-width="2"/>` },
  { n:'rocket', k:'rocket rockets launch astronaut astronauts spacecraft spaceship starship nasa propulsion thrust drive warp mission',
    s:`<path d="M17 27l-6 8v5l7-4M31 27l6 8v5l-7-4" fill="#EF5350"/><path d="M24 4c7 6 9 16 7 27H17c-2-11 0-21 7-27z" fill="#ECEFF1"/><circle cx="24" cy="17" r="4" fill="#42A5F5"/><path d="M21 33c0 4 3 8 3 10 0-2 3-6 3-10z" fill="#FFA726"/>` },
  { n:'telescope', k:'telescope astronomer observatory stargazing',
    s:`<g transform="rotate(-28 24 20)"><rect x="5" y="15" width="30" height="9" rx="2" fill="#42A5F5"/><rect x="35" y="13" width="7" height="13" rx="1" fill="#90A4AE"/></g><path d="M22 27l-8 17M25 27l8 17M23.5 27v17" fill="none" stroke-width="2.2"/>` },
  { n:'globe', k:'earth world globe global geography continent continents country countries nation nations international hemisphere hemispheres equator latitude longitude population culture cultures',
    s:`<circle cx="24" cy="24" r="19" fill="#4FC3F7"/><path d="M12 12c4 0 7 3 9 6s-1 6-4 7-3 5-6 6c-3-3-5-8-5-12 1-3 3-5 6-7z" fill="#81C784"/><path d="M29 8c4 1 8 4 10 8-2 2-6 1-7 4s3 6 0 10-4 6-6 8c-2-4 0-8-2-11s-3-6 0-9 1-7 5-10z" fill="#81C784"/>` },
  { n:'map', k:'map maps location region regions territory territories border borders boundary route explore explorer explorers exploration journey travel coordinates atlas',
    s:`<path d="M4 10l12-4 16 4 12-4v32l-12 4-16-4-12 4z" fill="#FFF3C4"/><path d="M16 6v32M32 10v32" fill="none" stroke-width="1.6"/><path d="M9 31c4-6 10 2 14-4s7-8 11-11" fill="none" stroke="#E53935" stroke-width="2" stroke-dasharray="3 3"/><path d="M34 12l4 4M38 12l-4 4" fill="none" stroke="#E53935" stroke-width="2.4"/>` },
  { n:'compass', k:'compass direction directions north south east west navigate navigation cardinal orient orientation',
    s:`<circle cx="24" cy="24" r="19" fill="#fff"/><circle cx="24" cy="24" r="15" fill="none" stroke-width="1.3"/><path d="M24 9l5 15h-10z" fill="#EF5350"/><path d="M24 39l-5-15h10z" fill="#B0BEC5"/><circle cx="24" cy="24" r="2.2" fill="${O}"/>` },
  { n:'mountain', k:'mountain mountains landform landforms elevation peak peaks hill hills terrain plateau valley altitude summit range',
    s:`<path d="M2 41l15-27 8 12 5-7 16 22z" fill="#A1887F"/><path d="M17 14l-5 9 3-1 2 3 3-3 2 2z" fill="#fff"/><path d="M30 19l-3 5 2-.5 1.5 2 2-2z" fill="#fff" stroke-width="1.6"/>` },
  { n:'volcano', k:'volcano volcanoes volcanic lava magma eruption erupt mantle tectonic plate plates igneous',
    s:`<path d="M20 13c-3-2-1-6 2-5 0-3 5-4 6-1 3-1 5 2 3 4" fill="#ECEFF1"/><path d="M4 42l12-22h16l12 22z" fill="#A1887F"/><path d="M16 20h16l-2 4-3-2-3 6-3-5-3 3z" fill="#EF5350"/>` },
  { n:'quake', k:'earthquake earthquakes seismic fault faults tremor crust',
    s:`<path d="M8 10c2 2 2 4 0 6M14 8c3 3 3 7 0 10M40 10c-2 2-2 4 0 6M34 8c-3 3-3 7 0 10" fill="none" stroke-width="1.8"/><rect x="4" y="24" width="40" height="18" rx="2" fill="#A1887F"/><path d="M24 24l-4 6 5 3-4 9" fill="none" stroke-width="2.6"/>` },
  { n:'rock', k:'rock rocks mineral minerals stone stones sediment sedimentary metamorphic crystal crystals geology geologist weathering erosion pebble boulder',
    s:`<path d="M6 37l4-15 10-8 12 2 9 10 1 11z" fill="#B0BEC5"/><path d="M20 14l2 10 10 2M22 24l-8 13M32 26l4 11" fill="none" stroke-width="1.6"/>` },
  { n:'drop', k:'water drop drops droplet evaporation evaporate condensation condense water-cycle moisture hydration freshwater liquid',
    s:`<path d="M24 4C18 14 10 22 10 30a14 14 0 0028 0c0-8-8-16-14-26z" fill="#42A5F5"/><path d="M17 30a7 7 0 004 7" fill="none" stroke="#fff" stroke-width="2.2"/>` },
  { n:'wave', k:'ocean oceans sea seas wave waves marine coast coastal beach shore river rivers stream lake lakes flood current currents',
    s:`<path d="M2 28c4-4 8-4 12 0s8 4 12 0 8-4 12 0 6 3 8 2v14H2z" fill="#4FC3F7"/><path d="M2 19c4-4 8-4 12 0s8 4 12 0 8-4 12 0 6 3 8 2" fill="none" stroke="#1E88E5" stroke-width="2.6"/>` },
  { n:'cloud', k:'cloud clouds weather rain rainy precipitation storm storms forecast humidity atmosphere climate',
    s:`<path d="M16 36l-2 6M24 36l-2 6M32 36l-2 6" fill="none" stroke="#1E88E5" stroke-width="2.6"/><path d="M14 32a8 8 0 01-1-16 11 11 0 0121-3 8 8 0 015 15z" fill="#ECEFF1"/>` },
  { n:'snowflake', k:'snow snowflake ice icy frozen freeze freezing winter glacier glaciers frost',
    s:`<g fill="none" stroke="#1E88E5" stroke-width="2.8"><path d="M24 4v40M6.7 14l34.6 20M41.3 14L6.7 34"/><path d="M19 7l5 5 5-5M19 41l5-5 5 5M7 21l7-1-2-7M41 27l-7 1 2 7M41 21l-7-1 2-7M7 27l7 1-2 7" stroke-width="2.2"/></g>` },
  { n:'wind', k:'wind windy air breeze tornado hurricane blow gas gases pressure air-pressure',
    s:`<path d="M4 18h24a5 5 0 10-5-5M4 26h32a5 5 0 11-5 5M4 34h16" fill="none" stroke="#78909C" stroke-width="3.2"/>` },
  { n:'fire', k:'fire fires flame flames burn burning combustion wildfire campfire',
    s:`<path d="M24 4c2 8 12 12 12 24a12 12 0 01-24 0c0-6 3-9 5-12 1 4 3 5 4 5-1-6 1-12 3-17z" fill="#FFA726"/><path d="M24 26c2 3 6 5 6 10a6 6 0 01-12 0c0-3 2-6 6-10z" fill="#FFD54F"/>` },
  { n:'recycle', k:'decomposer decomposers decompose decomposition recycle recycling reuse reduce conservation conserve sustainable sustainability waste trash garbage renewable pollution cycle cycles',
    s:`<path d="M38 24a14 14 0 01-24 10M10 24a14 14 0 0124-10" fill="none" stroke="#43A047" stroke-width="4"/><path d="M34 7v8h-8M14 41v-8h8" fill="none" stroke="#43A047" stroke-width="4"/>` },

  // ── Math ─────────────────────────────────────────────────────────────────
  { n:'ruler', k:'measure measuring measurement measurements length width height distance ruler inch inches centimeter centimeters meter meters unit units metric customary perimeter',
    s:`<g transform="rotate(-15 24 24)"><rect x="2" y="16" width="44" height="16" rx="2" fill="#FFD54F"/><path d="M8 16v6M14 16v4M20 16v6M26 16v4M32 16v6M38 16v4" fill="none" stroke-width="1.8"/></g>` },
  { n:'shapes', k:'shape shapes geometry geometric polygon polygons triangle triangles square squares circle circles rectangle rectangles vertex vertices side sides symmetry symmetrical congruent quadrilateral hexagon pentagon octagon',
    s:`<path d="M14 5l11 19H3z" fill="#EF5350"/><rect x="27" y="7" width="16" height="16" rx="1" fill="#42A5F5"/><circle cx="13" cy="35" r="8.5" fill="#FFD54F"/><path d="M29 28h14l-4 13H25z" fill="#66BB6A"/>` },
  { n:'protractor', k:'angle angles acute obtuse right-angle protractor perpendicular parallel intersect intersecting line lines ray rays segment',
    s:`<path d="M4 36a20 20 0 0140 0z" fill="#FFF59D"/><path d="M12 36a12 12 0 0124 0" fill="none" stroke-width="1.5"/><path d="M24 36L36 17M24 36h19" fill="none" stroke="#E53935" stroke-width="2.8"/>` },
  { n:'operations', k:'number numbers add addition subtract subtraction multiply multiplication divide division sum difference quotient operation operations arithmetic math mathematics equation equations expression integer integers digit digits value count counting factor factors multiple multiples prime even odd negative positive variable algebra exponent',
    s:`<rect x="4" y="4" width="18" height="18" rx="3" fill="#EF5350"/><rect x="26" y="4" width="18" height="18" rx="3" fill="#42A5F5"/><rect x="4" y="26" width="18" height="18" rx="3" fill="#66BB6A"/><rect x="26" y="26" width="18" height="18" rx="3" fill="#FFB300"/><g fill="none" stroke="#fff" stroke-width="3"><path d="M13 8v10M8 13h10M30 13h10M9 31l8 8M17 31l-8 8M30 35h10"/></g><g fill="#fff" stroke="none"><circle cx="35" cy="31" r="1.7"/><circle cx="35" cy="39" r="1.7"/></g>` },
  { n:'calculator', k:'calculator calculate calculation compute computation estimate estimation',
    s:`<rect x="9" y="4" width="30" height="40" rx="4" fill="#455A64"/><rect x="13" y="8" width="22" height="9" rx="1.5" fill="#B2EBF2"/><g fill="#ECEFF1"><rect x="13" y="21" width="6" height="5" rx="1"/><rect x="21" y="21" width="6" height="5" rx="1"/><rect x="29" y="21" width="6" height="5" rx="1" fill="#FFB74D"/><rect x="13" y="29" width="6" height="5" rx="1"/><rect x="21" y="29" width="6" height="5" rx="1"/><rect x="29" y="29" width="6" height="5" rx="1" fill="#FFB74D"/><rect x="13" y="37" width="14" height="4" rx="1"/><rect x="29" y="37" width="6" height="4" rx="1" fill="#EF5350"/></g>` },
  { n:'fraction', k:'fraction fractions percent percentage ratio ratios proportion proportional part whole decimal decimals numerator denominator half halves quarter portion share',
    s:`<circle cx="24" cy="24" r="19" fill="#fff"/><path d="M24 24V5a19 19 0 0119 19z" fill="#FFA726"/><path d="M24 24h19a19 19 0 01-19 19z" fill="#FFD54F"/><circle cx="24" cy="24" r="19" fill="none"/><path d="M24 5v38M5 24h38" fill="none"/>` },
  { n:'graph', k:'graph graphs chart charts data statistics statistic survey mean median mode average plot trend analysis analyze results increase decrease bar-graph',
    s:`<rect x="11" y="26" width="7" height="14" fill="#42A5F5"/><rect x="21" y="16" width="7" height="24" fill="#66BB6A"/><rect x="31" y="9" width="7" height="31" fill="#EF5350"/><path d="M6 5v36h37" fill="none" stroke-width="2.6"/>` },
  { n:'cube', k:'volume cube cubes 3d three-dimensional prism prisms capacity dimension dimensions box solid-figure cylinder',
    s:`<path d="M24 4l18 10v20L24 44 6 34V14z" fill="#64B5F6"/><path d="M24 4l18 10-18 10L6 14z" fill="#BBDEFB"/><path d="M24 24l18-10v20L24 44z" fill="#42A5F5"/><path d="M6 14l18 10 18-10M24 24v20" fill="none"/>` },
  { n:'dice', k:'chance probability random odds likely unlikely outcome outcomes dice die luck',
    s:`<rect x="6" y="6" width="36" height="36" rx="7" fill="#fff"/><g fill="${O}" stroke="none"><circle cx="15" cy="15" r="3"/><circle cx="33" cy="15" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="15" cy="33" r="3"/><circle cx="33" cy="33" r="3"/></g>` },
  { n:'puzzle', k:'puzzle puzzles problem problems solve solving solution solutions strategy riddle piece pieces fit connect connection',
    s:`<path d="M8 14h9a4 4 0 118 0h9v9a4 4 0 110 8v9h-9a4 4 0 10-8 0H8z" fill="#AB47BC"/>` },

  // ── Time ─────────────────────────────────────────────────────────────────
  { n:'clock', k:'time clock clocks hour hours minute minutes second seconds schedule duration elapsed punctual deadline instantaneous',
    s:`<circle cx="24" cy="24" r="19" fill="#fff"/><path d="M24 8v3M24 37v3M8 24h3M37 24h3" fill="none" stroke-width="2"/><path d="M24 13v11l8 5" fill="none" stroke-width="2.8"/><circle cx="24" cy="24" r="2" fill="${O}"/>` },
  { n:'hourglass', k:'era eras century centuries decade decades age ages period periods past wait',
    s:`<rect x="10" y="4" width="28" height="5" rx="2" fill="#8D6E63"/><rect x="10" y="39" width="28" height="5" rx="2" fill="#8D6E63"/><path d="M13 9h22c0 9-8 11-8 15s8 6 8 15H13c0-9 8-11 8-15s-8-6-8-15z" fill="#E3F2FD"/><path d="M17 37c2-4 5-5 7-5s5 1 7 5zM18 15h12c-2 3-4 4-6 6-2-2-4-3-6-6z" fill="#FFCA28" stroke="none"/>` },
  { n:'calendar', k:'calendar date dates day days week weeks month months year years season seasons annual holiday holidays event events',
    s:`<rect x="6" y="9" width="36" height="33" rx="3" fill="#fff"/><path d="M6 12a3 3 0 013-3h30a3 3 0 013 3v7H6z" fill="#EF5350"/><path d="M15 5v8M33 5v8" fill="none" stroke-width="2.8"/><g fill="${O}" stroke="none"><circle cx="14" cy="26" r="1.8"/><circle cx="24" cy="26" r="1.8"/><circle cx="34" cy="26" r="1.8"/><circle cx="14" cy="34" r="1.8"/><circle cx="24" cy="34" r="1.8"/></g>` },

  // ── Social studies & civics ──────────────────────────────────────────────
  { n:'coins', k:'money coin coins dollar dollars cash cost costs price prices pay spend spending buy sell economy economic economics trade tax taxes budget income profit bank banks save saving savings wage wages salary market goods services currency finance financial credit debt loan invest investment consumer consumers producer producers supply demand business',
    s:`<ellipse cx="18" cy="37" rx="13" ry="5" fill="#FFCA28"/><path d="M5 31v6c0 3 6 5 13 5s13-2 13-5v-6" fill="#FFCA28"/><ellipse cx="18" cy="31" rx="13" ry="5" fill="#FFD54F"/><circle cx="31" cy="20" r="13" fill="#FFD54F"/><circle cx="31" cy="20" r="9" fill="none" stroke-width="1.5"/><text x="31" y="25.5" fill="${O}" stroke="none" font-family="Fredoka,Arial,sans-serif" font-weight="600" font-size="15" text-anchor="middle">$</text>` },
  { n:'factory', k:'factory factories industry industrial industrialization manufacture manufacturing production produce labor worker workers mill',
    s:`<path d="M36 8c-2-3 2-6 5-4 2-2 6 0 5 3" fill="#ECEFF1" stroke-width="1.8"/><path d="M4 42V22l10 6v-6l10 6v-6l10 6V10h8v32z" fill="#B0BEC5"/><g fill="#FFD54F" stroke-width="1.6"><rect x="9" y="32" width="5" height="5"/><rect x="19" y="32" width="5" height="5"/><rect x="29" y="32" width="5" height="5"/></g>` },
  { n:'house', k:'house houses home homes shelter neighborhood residence property household dwelling',
    s:`<path d="M10 20v22h28V20L24 9z" fill="#FFE0B2"/><path d="M5 22L24 6l19 16-3 3L24 11 8 25z" fill="#EF5350"/><rect x="20" y="30" width="8" height="12" fill="#8D6E63"/><rect x="13" y="25" width="6" height="6" fill="#81D4FA" stroke-width="1.6"/><rect x="29" y="25" width="6" height="6" fill="#81D4FA" stroke-width="1.6"/>` },
  { n:'city', k:'city cities urban town towns skyscraper skyscrapers downtown metropolitan suburb suburban infrastructure building buildings architecture',
    s:`<rect x="4" y="20" width="12" height="22" fill="#90CAF9"/><rect x="16" y="8" width="14" height="34" fill="#64B5F6"/><rect x="30" y="16" width="14" height="26" fill="#BBDEFB"/><g fill="#FFF59D" stroke="none"><rect x="7" y="24" width="3" height="3"/><rect x="7" y="31" width="3" height="3"/><rect x="20" y="12" width="3" height="3"/><rect x="25" y="12" width="3" height="3"/><rect x="20" y="19" width="3" height="3"/><rect x="25" y="19" width="3" height="3"/><rect x="20" y="26" width="3" height="3"/><rect x="25" y="26" width="3" height="3"/><rect x="34" y="20" width="3" height="3"/><rect x="34" y="27" width="3" height="3"/><rect x="39" y="20" width="3" height="3"/></g>` },
  { n:'capitol', k:'government governments democracy congress senate senator capitol federal president citizen citizens citizenship civic civics legislative legislature executive judicial branch branches republic parliament policy amendment greece greek rome roman temple museum',
    s:`<path d="M4 16L24 5l20 11z" fill="#ECEFF1"/><rect x="6" y="16" width="36" height="4" fill="#CFD8DC"/><g fill="#fff"><rect x="9" y="20" width="5" height="16"/><rect x="17.5" y="20" width="5" height="16"/><rect x="25.5" y="20" width="5" height="16"/><rect x="34" y="20" width="5" height="16"/></g><rect x="5" y="36" width="38" height="4" fill="#CFD8DC"/><rect x="3" y="40" width="42" height="4" fill="#B0BEC5"/>` },
  { n:'balance', k:'justice law laws fair fairness rights equality equal balance balanced mass weigh weight legal enforcement',
    s:`<path d="M24 6v34M14 42h20M7 12h34" fill="none" stroke-width="2.6"/><path d="M8 12L3 26M8 12l5 14M40 12l-5 14M40 12l5 14" fill="none" stroke-width="1.6"/><path d="M2 26a6 3.5 0 0012 0zM34 26a6 3.5 0 0012 0z" fill="#FFD54F"/><circle cx="24" cy="7" r="3" fill="#FFD54F"/>` },
  { n:'ballot', k:'vote votes voting voter voters election elections elect ballot candidate candidates campaign poll majority represent representative',
    s:`<path d="M17 23V8h14v15" fill="#fff"/><path d="M20 15l3 3 6-6" fill="none" stroke="#43A047" stroke-width="2.6"/><rect x="8" y="22" width="32" height="20" rx="2" fill="#42A5F5"/><rect x="14" y="22" width="20" height="3" fill="${O}"/><path d="M24 29l1.5 3 3.3.4-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.4z" fill="#fff" stroke="none"/>` },
  { n:'scroll', k:'history historical historian document documents constitution declaration treaty treaties charter bill record records primary-source source sources manuscript proclamation decree agreement contract',
    s:`<path d="M12 8h26a4 4 0 010 8h-2v22a4 4 0 01-4 4H10a4 4 0 010-8h2z" fill="#FFF3C4"/><path d="M38 16H14M10 34h22v4" fill="none"/><path d="M17 21h14M17 26h14M17 31h8" fill="none" stroke-width="1.5"/>` },
  { n:'crown', k:'king kings queen queens royal royalty monarch monarchy empire empires emperor kingdom kingdoms reign throne dynasty prince princess leader leaders leadership nobility noble lord',
    s:`<path d="M6 36L4 13l10 9 10-14 10 14 10-9-2 23z" fill="#FFD54F"/><rect x="6" y="35" width="36" height="7" rx="1" fill="#FFCA28"/><circle cx="16" cy="38.5" r="2" fill="#EF5350" stroke-width="1.3"/><circle cx="24" cy="38.5" r="2" fill="#42A5F5" stroke-width="1.3"/><circle cx="32" cy="38.5" r="2" fill="#66BB6A" stroke-width="1.3"/>` },
  { n:'castle', k:'castle castles medieval middle-ages fortress fort forts knight knights feudal feudalism moat',
    s:`<path d="M6 42V14h6v5h5v-5h6v5h2v-5h6v5h5v-5h6v28z" fill="#B0BEC5"/><path d="M20 42v-8a4 4 0 018 0v8z" fill="#8D6E63"/><path d="M24 14V3" fill="none" stroke-width="2"/><path d="M24 4h8l-2 3 2 3h-8z" fill="#EF5350" stroke-width="1.6"/>` },
  { n:'shield', k:'war wars battle battles conflict army armies military soldier soldiers revolution revolutionary defend defense protect protection conquer conquest invasion invade weapon weapons fight troops security safety guard warrior warriors superweapon',
    s:`<path d="M24 4l17 6v12c0 11-8 18-17 22C15 40 7 33 7 22V10z" fill="#42A5F5"/><path d="M24 9l12 4v9c0 8-5 13-12 16z" fill="#90CAF9" stroke="none"/><path d="M24 16l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8z" fill="#FFD54F" stroke-width="1.6"/>` },
  { n:'flag', k:'flag flags patriotism patriotic national symbol symbols independence colony colonies colonial colonist colonists pledge anthem',
    s:`<path d="M10 7c8-4 14 4 22 0s8-2 10-2v18c-4 0-6 2-10 2-8 4-14-4-22 0z" fill="#EF5350"/><path d="M10 14c8-4 14 4 22 0s8-2 10-2" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M10 7c8-4 14 4 22 0s8-2 10-2v18c-4 0-6 2-10 2-8 4-14-4-22 0z" fill="none"/><path d="M10 44V5" fill="none" stroke-width="2.8"/>` },
  { n:'pyramid', k:'pyramid pyramids egypt egyptian pharaoh pharaohs mummy archaeology archaeologist artifact artifacts civilization civilizations tomb nile monolith',
    s:`<circle cx="38" cy="10" r="5" fill="#FFD54F" stroke-width="1.8"/><path d="M2 42L24 8l22 34z" fill="#FFD54F"/><path d="M24 8l6 34" fill="none"/><path d="M8 33h32M13 25h22" fill="none" stroke-width="1.4"/>` },
  { n:'people', k:'population populations people person persons community communities society societies social group groups family families friend friends friendship cooperation cooperate together relationship relationships neighbor neighbors human humans humanity individual role tribe team teamwork volunteer humanoid humanoids',
    s:`<circle cx="32" cy="16" r="5.5" fill="#E0AC69"/><path d="M22 41c0-8 4-14 10-14s10 6 10 14z" fill="#EF5350"/><circle cx="17" cy="14" r="6.5" fill="#FFCC99"/><path d="M5 41c0-9 5-15 12-15s12 6 12 15z" fill="#42A5F5"/>` },
  { n:'school', k:'school schools student students teacher teachers class classroom education educational lesson lessons graduate graduation diploma college university scholar academic study',
    s:`<path d="M12 23v9c0 3 6 6 12 6s12-3 12-6v-9l-12 5z" fill="#37474F"/><path d="M2 18l22-10 22 10-22 10z" fill="#455A64"/><path d="M42 20v12" fill="none" stroke-width="1.8"/><circle cx="42" cy="34" r="2.4" fill="#FFD54F"/>` },

  // ── Transport ────────────────────────────────────────────────────────────
  { n:'ship', k:'ship ships boat boats sail sailing sailor sailors voyage voyages navy port harbor fleet vessel',
    s:`<path d="M24 4v26" fill="none" stroke-width="2.4"/><path d="M26 7l13 20H26z" fill="#fff"/><path d="M22 11L10 27h12z" fill="#ECEFF1"/><path d="M4 30h40l-6 10H10z" fill="#8D6E63"/><path d="M2 44c4-3 8-3 11 0s8 3 11 0 8-3 11 0 7 3 11 0" fill="none" stroke="#1E88E5" stroke-width="2"/>` },
  { n:'car', k:'car cars vehicle vehicles drive driver driving road roads traffic automobile transportation transport speed speeding lorry truck',
    s:`<path d="M4 33v-7a3 3 0 013-3h2l5-8h20l7 8h1a3 3 0 013 3v7z" fill="#EF5350"/><path d="M15 17h7v6h-11zM25 17h7l5 6H25z" fill="#B3E5FC" stroke-width="1.6"/><circle cx="14" cy="34" r="5" fill="#455A64"/><circle cx="34" cy="34" r="5" fill="#455A64"/><circle cx="14" cy="34" r="1.8" fill="#fff" stroke="none"/><circle cx="34" cy="34" r="1.8" fill="#fff" stroke="none"/>` },
  { n:'plane', k:'airplane airplanes plane planes aircraft pilot airport aviation flight flights fly flying',
    s:`<path d="M42 6c-2-2-5-1-7 1l-8 8-18-5-4 4 14 8-7 8-6-1-3 3 7 3 3 7 3-3-1-6 8-7 8 14 4-4-5-18 8-8c2-2 3-5 1-7z" fill="#ECEFF1"/>` },
  { n:'train', k:'train trains railroad railroads railway railways locomotive rail rails track tracks transcontinental station',
    s:`<rect x="10" y="5" width="28" height="31" rx="5" fill="#42A5F5"/><rect x="14" y="9" width="20" height="11" rx="2" fill="#B3E5FC"/><circle cx="17" cy="28" r="2.6" fill="#FFD54F"/><circle cx="31" cy="28" r="2.6" fill="#FFD54F"/><path d="M15 36l-4 7M33 36l4 7M8 43h32" fill="none" stroke-width="2.4"/>` },

  // ── Technology ───────────────────────────────────────────────────────────
  { n:'computer', k:'computer computers technology digital internet online software hardware program programming code coding website keyboard screen device devices network networks cyber app apps download file files algorithm algorithms simulation simulated virtual',
    s:`<rect x="5" y="7" width="38" height="26" rx="3" fill="#455A64"/><rect x="9" y="11" width="30" height="18" rx="1" fill="#81D4FA"/><path d="M19 15l-4 5 4 5M29 15l4 5-4 5" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M18 33l-2 7h16l-2-7" fill="#90A4AE"/><path d="M12 40h24" fill="none" stroke-width="2.4"/>` },
  { n:'robot', k:'robot robots robotic robotics artificial-intelligence ai automation automatic android androids cyborg cyborgs replicant replicants synthetic cybernetic',
    s:`<path d="M24 14V8" fill="none" stroke-width="2.2"/><circle cx="24" cy="6" r="2.6" fill="#FFD54F"/><rect x="6" y="20" width="4" height="9" rx="1" fill="#90A4AE"/><rect x="38" y="20" width="4" height="9" rx="1" fill="#90A4AE"/><rect x="10" y="14" width="28" height="22" rx="5" fill="#B0BEC5"/><circle cx="18" cy="24" r="4" fill="#fff"/><circle cx="30" cy="24" r="4" fill="#fff"/><circle cx="18" cy="24" r="1.8" fill="#EF5350" stroke="none"/><circle cx="30" cy="24" r="1.8" fill="#EF5350" stroke="none"/><path d="M18 31h12" fill="none"/><rect x="16" y="36" width="16" height="6" rx="1" fill="#90A4AE"/>` },
  { n:'magnify', k:'search searching investigate investigation detective clue clues evidence research examine inspect detail details find question questions inquiry',
    s:`<path d="M27 27l13 13" fill="none" stroke-width="5"/><circle cx="19" cy="19" r="12" fill="#E3F2FD"/><path d="M12 16a7 7 0 016-5" fill="none" stroke="#fff" stroke-width="2.4"/>` },
  { n:'check', k:'correct right true yes check checkmark answer answers accurate',
    s:`<circle cx="24" cy="24" r="19" fill="#66BB6A"/><path d="M14 25l7 7 13-15" fill="none" stroke="#fff" stroke-width="4.5"/><path d="M14 25l7 7 13-15" fill="none" stroke="${O}" stroke-width="1.2" opacity="0"/>` },
  { n:'clipboard', k:'list lists checklist procedure procedures steps plan planning organize task tasks rule rules instructions report test tests quiz exam assessment evaluate evaluation',
    s:`<rect x="8" y="9" width="32" height="35" rx="3" fill="#A1887F"/><rect x="12" y="13" width="24" height="27" rx="1" fill="#fff"/><rect x="17" y="5" width="14" height="8" rx="2" fill="#B0BEC5"/><path d="M16 21l2 2 3-4M16 30l2 2 3-4M24 21h8M24 30h8" fill="none" stroke-width="1.8"/>` },

  // ── Arts & recreation ────────────────────────────────────────────────────
  { n:'music', k:'music musical musician song songs sing singer singing rhythm melody pitch tempo instrument instruments band orchestra beat harmony composer lyrics opera choir tune chord',
    s:`<path d="M18 34V10l20-5v24M18 16l20-5" fill="none" stroke-width="2.8"/><ellipse cx="13" cy="35" rx="6" ry="5" fill="#AB47BC"/><ellipse cx="33" cy="30" rx="6" ry="5" fill="#AB47BC"/>` },
  { n:'palette', k:'art arts artist artists paint painting painter color colors colour colours draw drawing design sculpture artwork illustrate illustration portrait canvas mural hue',
    s:`<path d="M24 5C12 5 4 13 4 23s8 19 18 19c3 0 4-2 4-4s-2-3-2-5 2-4 5-4h5c5 0 10-3 10-10C44 11 35 5 24 5z" fill="#FFE0B2"/><g stroke-width="1.6"><circle cx="14" cy="18" r="3.5" fill="#EF5350"/><circle cx="23" cy="12" r="3.5" fill="#FFD54F"/><circle cx="33" cy="13" r="3.5" fill="#42A5F5"/><circle cx="38" cy="22" r="3.5" fill="#66BB6A"/></g><circle cx="15" cy="30" r="3.5" fill="#fff" stroke-width="1.6"/>` },
  { n:'ball', k:'sport sports game games ball soccer football basketball baseball athlete athletes coach score scoring olympics',
    s:`<circle cx="24" cy="24" r="19" fill="#fff"/><path d="M24 15l8.5 6.2-3.2 10H18.7l-3.2-10z" fill="${O}"/><path d="M24 15V5M32.5 21.2l9-3M29.3 31.2l5.5 8M18.7 31.2l-5.5 8M15.5 21.2l-9-3" fill="none" stroke-width="1.8"/>` },
  { n:'trophy', k:'compete competes competition competitor competitors win winner winners victory award awards prize prizes champion champions championship achievement achieve success successful goal goals reward honor',
    s:`<path d="M13 9c-6 0-8 3-7 7s4 6 9 6M35 9c6 0 8 3 7 7s-4 6-9 6" fill="none" stroke="#FFB300" stroke-width="2.8"/><path d="M12 6h24l-2 16c-1 6-6 9-10 9s-9-3-10-9z" fill="#FFD54F"/><rect x="21" y="31" width="6" height="6" fill="#FFCA28"/><rect x="14" y="37" width="20" height="6" rx="1" fill="#8D6E63"/>` },
];

// Build keyword → icon index
const WORD_INDEX = new Map();   // single word → [iconIdx]
const PHRASES    = [];          // [phrase, iconIdx]
ICONS.forEach((ic, i) => {
  ic.k.split(/\s+/).forEach(raw => {
    if (!raw) return;
    const key = raw.toLowerCase();
    if (key.includes('-')) PHRASES.push([key.replace(/-/g, ' '), i]);
    if (!WORD_INDEX.has(key)) WORD_INDEX.set(key, []);
    WORD_INDEX.get(key).push(i);
  });
});
export const ICON_NAMES = ICONS.map(i => i.n);
const BY_NAME = new Map(ICONS.map((ic, i) => [ic.n, i]));

const STOP = new Set('the a an and or of to in on for with by from at as is are was were be been being this that these those it its which who whom what when where why how not no but if than then so such can could may might will would should must do does did has have had into onto over under about between through during before after above below up down out off again further once only own same other some any each few more most very just also used use uses using called known one two three'.split(' '));

// Very small stemmer: try the word as written, then common endings removed.
function variants(w) {
  const v = [w];
  if (w.endsWith('ies') && w.length > 4) v.push(w.slice(0, -3) + 'y');
  if (w.endsWith('es')  && w.length > 4) v.push(w.slice(0, -2));
  if (w.endsWith('s')   && w.length > 3 && !w.endsWith('ss')) v.push(w.slice(0, -1));
  if (w.endsWith('ing') && w.length > 5) { v.push(w.slice(0, -3)); v.push(w.slice(0, -3) + 'e'); }
  if (w.endsWith('ed')  && w.length > 4) { v.push(w.slice(0, -2)); v.push(w.slice(0, -1)); }
  if (w.endsWith('al')  && w.length > 5) v.push(w.slice(0, -2));
  return v;
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // drop accents: é → e
const words = (s) => norm(s).split(/[^a-z0-9]+/).filter(w => w && !STOP.has(w));

function scoreText(text, weight, scores) {
  const ws = words(text);
  const n = ws.length || 1;
  ws.forEach((w, pos) => {
    // earlier words in a definition are usually the most telling ("A desert planet…")
    const early = weight * (1 + (1 - pos / n));
    for (const v of variants(w)) {
      const hits = WORD_INDEX.get(v);
      if (hits) { hits.forEach(i => { scores[i] = (scores[i] || 0) + early; }); break; }
    }
  });
  const flat = ' ' + ws.join(' ') + ' ';
  PHRASES.forEach(([p, i]) => { if (flat.includes(' ' + p + ' ')) scores[i] = (scores[i] || 0) + weight * 2.5; });
}

/**
 * Pick the best icon for a term. Returns an icon name, or null when nothing fits.
 * `hint` is the optional 3rd CSV column — an icon name or any keyword.
 */
export function pickIcon(term, description, hint) {
  if (hint) {
    const h = norm(hint).trim();
    if (BY_NAME.has(h)) return h;
    for (const v of variants(h)) { const hits = WORD_INDEX.get(v); if (hits) return ICONS[hits[0]].n; }
  }
  const scores = {};
  scoreText(term, 10, scores);
  scoreText(description, 1, scores);
  let best = -1, bestScore = 0;
  for (const [i, s] of Object.entries(scores)) if (s > bestScore) { best = +i; bestScore = s; }
  return bestScore >= 1.2 ? ICONS[best].n : null;
}

/** <symbol> sprite containing only the icons actually used. */
export function iconSprite(names) {
  const used = [...new Set(names.filter(Boolean))];
  if (!used.length) return '';
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${used.map(n => {
    const ic = ICONS[BY_NAME.get(n)];
    return `<symbol id="ic-${n}" viewBox="0 0 48 48"><g stroke="${O}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${ic.s}</g></symbol>`;
  }).join('')}</defs></svg>`;
}

const TILE_COLORS = ['#EF5350', '#FFA726', '#66BB6A', '#42A5F5', '#AB47BC', '#EC407A', '#26A69A', '#8D6E63'];

/** Markup for a term's picture: the matched icon, or a friendly letter tile. */
export function iconMarkup(name, term, cls = 'ic') {
  if (name) return `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true"><use href="#ic-${name}"/></svg>`;
  const ch = (String(term || '?').trim().charAt(0) || '?').toUpperCase().replace(/[<>&"]/g, '?');
  const color = TILE_COLORS[ch.charCodeAt(0) % TILE_COLORS.length];
  return `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="9" fill="${color}" stroke="${O}" stroke-width="2.2"/><text x="24" y="33.5" text-anchor="middle" font-family="Fredoka,Arial,sans-serif" font-weight="600" font-size="25" fill="#fff">${ch}</text></svg>`;
}

/** Decorative icon by name (used for page headers). */
export function decoIcon(name, cls = 'ic') {
  return `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true"><use href="#ic-${name}"/></svg>`;
}
