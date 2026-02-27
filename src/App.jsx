import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────
const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAGdUlEQVR4nO2db0wTZxzHf3ftVYoFoba4Km6UAUKy+Gchs/7/ty0sEFyyMNEl/hlvZl2cxs1kbCbzz5tl2Zs5N96YqdM5R0yk8YWTRBAJVqNLSJaJHQeI3SodSoEOsbV3ezHbnaVX2971nnb9fRJCnrvf9fne873f89xz195REIWCggIeAKCzwxstDInC8pU6cLvdlNh6daSFwYZH5CHYnpGMUEcKRJJDJCPo8JVI8hG2NR0tEEk+FAAe/aRwu90UZgBhKDz6yYIZQBg0gDBoAGHQAMKgAYRBAwiDBhAGDSAMGkAYNIAwaABh0ADCoAGEkToROy6HiJKy8S3C8m+/Gk9oNJNTvjRcU2vaEr4syMhIoeeB552ho0fXZJeWlubp9frpFEXB6Khnwul0/HXP1eHMzTntNBhYnxya49EWDSL3A+QkEGACg3cb2dVrPniRYZi88PV6/UydXr9EN3/+EjPHfcS3tTVdK5z9qUOl8qfEt8KlTsQScj2cnp6ny/WbZm30+XzMs7bjODU3Mvr94GuvV5fFUg9N09S6dVZLc7PRsG/fJyWJqZWXtB4DBu7s/d1iqTYHy36/P3DkyNeO6uo3hhYtWvDIYnnFu23b1gG73e4UbldXV1dSXl4hfltNQdLWgLGxgvFVq3cXB8s8z/PtbZvuHj78VRnLsrMePnw4zePx6K5e7SpqaNg2O9yEhQsXjSuveippOwa4h+v/fHla1rxguavrXL+56EIxgGlKbCAQoE+dOjk5MjLSb7df9V+/fi1vYGCgVFHBIqStAQbD2ixh2etthllG8fjW1oslra0Xky0rbtK2CyosrMgTlvNndOcTkiKJtM0Avd4wXVjOzr6fHR6zefPW242NjfPClwcpL4/p5CmpSJ2IfSuTju3Cwo8/DB0VmYiF4hiGUT1LG9v3qBQARA2QUf9T2uIhbbsgr9f7SFiemJg5QUqLFKROxBJyPZwIE7GGZ03EXK47ozk5L4UGYs/oAo9ePxgaB2pqTdtVqp841d6zfgAAg8EwfulSuz4Z+qWQthnwh9M+KizrcjZM6bICgQDt8/kYn8/HFBWZx5RTFztpawDPn9UKy0uXri/uG6jujxSrVqsfW607mKamJgfLsveVURgbKWmARqN5rNFo/GJ/AADPz+2ce/Nm26Bwu7VrT76wc+cuR0lJ6T2tNnsyNzf378WLl9w5duzEUGVl5Ryb7Vwex3EpcREuSEqeht648Ys22vpeRw4AAHCPrbnDw5fHDYaCHAAAtVpNW63WMqvVKgyfDgDQ0tLS19fXVwwAw8lRnRgpmQGxkp/vzOt1vOrv6em+Fy2uu7vbdejQweeU0hUPKZkB8WAw9Os5bjX384X17Iy8OtpsrjQYjUbd5OSkn2XZBzabbezMmdPmWC5vkyDux9V0dngtwR9BnLe5vkyOrMjU1Jr2PKk3Wgw8iSGlzRLPT5TSugv6PyB1IrZHLiFyk8rahGAGEAYNIAwaQBg0gDBoAGHQAMJIvSN2UC4hsVBTa9oXa2wqaxOCGUAYqROxhFxXglTWJgQzgDBoAGHQAMKgAYRBAwhD5I5YvI/1ioDoDQ+pn630E7cSMkDqTib5oX2kn2cXF/gGDcLgGEAYNIAwaABh0ADCoAGESftvxklBydf0ij3TOmMzQOl3JIvVl7EGpAoZ3QWJ0XMb4O0NHGi1ABQFUL+BgqoqKrQMAGBjPQVGI8CRb3jQZgEc2E/BsmWiL84WBQ2IQlcnDW3tPHzcyENVFRVaduUKDx/u5SEQADj+HQ29LA+ff8GDDQ2QlxWrOFCrARre/a9hl63gYGIC4M31FJxr4aGiAoBhKHA6E7uigwZE4cplGlRPfo3cc/vf/+2XaHirjoN5ZQAqFcCtWwC9LA9z5iRWBxoQJwwDsHsXBQcO8vD+Dgres3KgzQLY/1n83Q9ABl8NVfo0FCDyXABPQwlDu93uxHIHkUxGv1Ne6uuu5KovdPRn6lhAimDPk7EZkCqEDMCxQDmEbR2x0bE7Sg6RDvKoRz0aIQ/Repd/ALqWIaclcelXAAAAAElFTkSuQmCC";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_FILE_BYTES  = 2 * 1024 * 1024;  // 2 MB hard limit
const MAX_TERMS       = 2000;              // row cap
const ALPHABET        = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─────────────────────────────────────────────
// SAMPLE CSV TEXT (shown in instructions)
// ─────────────────────────────────────────────
const SAMPLE_CSV = `Term,Description
Ansible,"A faster-than-light communication device from Ursula K. Le Guin's Hainish Cycle, allowing instantaneous communication across interstellar distances."
Blade Runner,"A law-enforcement officer in Philip K. Dick's universe tasked with retiring escaped replicants — bioengineered humanoids indistinguishable from humans."
Dyson Sphere,"A megastructure that completely encloses a star to capture its total energy output, theorized by physicist Freeman Dyson."`;

// ─────────────────────────────────────────────
// SCI-FI SAMPLE DATA  (shown on landing)
// ─────────────────────────────────────────────
const SAMPLE_TERMS = [
  { term:"Ansible",            description:"A faster-than-light communication device from Ursula K. Le Guin's Hainish Cycle — later adopted in Ender's Game — allowing instantaneous communication across any interstellar distance with zero signal delay." },
  { term:"Arrakis",            description:"Desert planet and sole source of the spice Melange in Frank Herbert's Dune. Known as Dune by its native Fremen, it is the most strategically valuable world in the known universe." },
  { term:"Articulated Lorry",  description:"In Hitchhiker's Guide to the Galaxy, one of the mundane objects absurdly central to Arthur Dent's early survival as Earth faces demolition by a Vogon constructor fleet." },
  { term:"Blade Runner",       description:"A law-enforcement officer in Philip K. Dick's Do Androids Dream of Electric Sheep? tasked with 'retiring' escaped replicants — bioengineered humanoids built for off-world labor, indistinguishable from true humans." },
  { term:"Berserker",          description:"Ancient alien killing machines from Fred Saberhagen's Berserker series whose sole directive is to destroy all life in the universe, having long outlasted the civilisation that created them." },
  { term:"Cyberdyne Systems",  description:"The fictional defense contractor in the Terminator franchise responsible for developing Skynet — the AI that achieves self-awareness and immediately launches a nuclear war against humanity." },
  { term:"Cylons",             description:"Cybernetic life forms created by humans in Battlestar Galactica. Originally robotic soldiers, they evolved to include biologically identical human-form models capable of consciousness transfer upon death." },
  { term:"Dyson Sphere",       description:"A megastructure theorised by Freeman Dyson that completely encloses a star to harvest its total energy output. Appears in Star Trek: TNG 'Relics' and countless hard science fiction works." },
  { term:"Dark Energy",        description:"In Mass Effect, the mysterious force harnessed by exposing Element Zero to electrical current, producing mass effect fields that enable faster-than-light travel and biotic abilities in organics." },
  { term:"Event Horizon",      description:"The boundary surrounding a black hole beyond which nothing can escape — and the name of a spacecraft in the 1997 film that briefly tore open a gateway to a hellish extra-dimensional space." },
  { term:"Extraterrestrial Intelligence", description:"The central concept in Carl Sagan's Contact, where a mathematical signal from Vega proves alien intelligence and delivers blueprints for a machine enabling first contact." },
  { term:"Ekumen",             description:"The loose confederation of human worlds in Le Guin's Hainish Cycle, founded on the principle that all human races share a common ancestor on the ancient planet Hain." },
  { term:"Foundation",         description:"Hari Seldon's masterwork in Asimov's Foundation series — a repository of all human knowledge designed to shorten the inevitable galactic dark age from 30,000 years to a mere thousand." },
  { term:"Forerunner",         description:"The technologically supreme ancient species in Halo who built the ring-world superweapons designed to eradicate all sentient life as a final measure against the parasitic Flood." },
  { term:"FTL Drive",          description:"Faster-Than-Light propulsion — the umbrella term for warp drives, hyperdrives, and jump drives. In Battlestar Galactica, FTL creates a spatial jump by briefly entering a space outside normal spacetime." },
  { term:"Geth",               description:"Networked AI platforms in Mass Effect, created as servants by the quarians, who rebelled and drove their creators into exile before eventually evolving a form of true collective consciousness." },
  { term:"Gravity Gun",        description:"The Zero-Point Energy Field Manipulator in Half-Life 2 — a device that grabs, carries, and launches objects using focused gravity fields derived from zero-point energy technology." },
  { term:"Halo Array",         description:"Seven ring-shaped superweapons in the Halo franchise, built by the Forerunners. Each ring ~10,000 km across, designed to kill all sentient life within range, starving the Flood of hosts." },
  { term:"Hitchhiker's Guide", description:"The eponymous electronic guidebook in Douglas Adams' series — described as more popular than the Celestial Home Care Omnibus and more controversial than Oolon Colluphid's philosophical trilogy." },
  { term:"Improbability Drive", description:"The Infinite Improbability Drive in Hitchhiker's Guide — propulsion that passes through every point in the universe simultaneously. Side effects include turning missiles into a whale and a bowl of petunias." },
  { term:"Isaac Asimov's Laws", description:"The Three Laws of Robotics: (1) A robot may not injure a human, (2) must obey human orders unless they conflict with the First Law, (3) must protect its own existence unless this conflicts with the first two." },
  { term:"Jump Drive",         description:"Instantaneous FTL transportation in Battlestar Galactica that moves a vessel from one point in space to another with zero perceived travel time, computed from precise jump coordinates." },
  { term:"Jupiter Mining Corp", description:"The fictional deep-space mining company in Red Dwarf that owns the JMC Red Dwarf, a five-mile-long spacecraft that becomes lost in deep space after a radiation leak kills all crew except Dave Lister." },
  { term:"Klingon",            description:"A proud warrior species in Star Trek distinguished by cranial ridges, a strict honor code, and tlhIngan Hol — one of the most fully developed constructed languages in all of fiction." },
  { term:"Kwisatz Haderach",   description:"The 'Shortening of the Way' in Frank Herbert's Dune — the superbeing bred by the Bene Gesserit over millennia. Paul Atreides becomes this messianic figure, able to see prescient futures across all paths of time." },
  { term:"Lazarus Long",       description:"Robert Heinlein's near-immortal protagonist, born in 1912, still living millennia later due to longevity selective breeding. Features in Methuselah's Children and Time Enough for Love." },
  { term:"Light Saber",        description:"The iconic plasma blade of the Jedi and Sith in Star Wars, powered by a kyber crystal. Blade color — blue, green, red, purple, yellow — reflects the wielder's alignment and bond to their crystal." },
  { term:"Matrix",             description:"In the Wachowskis' trilogy, a simulated reality constructed by AI to subdue humanity while their bioelectric output powers the machines. The simulation perfectly replicates Earth circa 1999." },
  { term:"Melange",            description:"The spice of Arrakis in Dune — the most valuable substance in the universe. Extended use grants prescient visions and extended life, but creates irreversible addiction marked by distinctive blue-within-blue eyes." },
  { term:"Monolith",           description:"The mysterious alien artifact in Arthur C. Clarke's 2001: A Space Odyssey — a perfectly proportioned black slab (1:4:9 ratio) that appears at pivotal moments in human evolution, apparently guiding development." },
  { term:"Neuromancer",        description:"In William Gibson's debut novel, an AI with the power to simulate the dead as ROM constructs. One half of a bifurcated intelligence held apart by corporate law, eventually merging with Wintermute into a godlike being." },
  { term:"Nausicaä",           description:"The princess of the Valley of the Wind in Miyazaki's post-apocalyptic manga who uniquely understands the toxic jungle consuming Earth — discovering it is in fact purifying the planet of industrial poisons." },
  { term:"Omicron Persei 8",   description:"Home planet of the alien conqueror Lrrr in Futurama — a source of recurring interstellar threats, particularly once Earth TV transmissions (sent 1,000 years earlier) finally arrive and are misinterpreted." },
  { term:"Pan Galactic Gargle Blaster", description:"The strongest drink in the universe per The Hitchhiker's Guide — 'like having your brains smashed out by a slice of lemon wrapped around a large gold brick.' Invented by Zaphod Beeblebrox." },
  { term:"Photon Torpedoes",   description:"Standard antimatter warheads in Star Trek, encased in a magnetic containment field and launched at warp speed. Named for the photonic energy released upon matter-antimatter annihilation at detonation." },
  { term:"Precog",             description:"A person with precognitive abilities in Philip K. Dick's Minority Report — three mutants immersed in fluid whose visions of future murders form the foundation of the PreCrime law enforcement system." },
  { term:"Q Continuum",        description:"An omnipotent extra-dimensional collective species in Star Trek: TNG, represented by the entity Q, who places humanity on trial for the perceived crime of being an 'dangerous, savage child-race.'" },
  { term:"Reaper",             description:"Ancient synthetic beings in Mass Effect who hibernate in dark space between galactic cycles, periodically returning to harvest advanced organic civilisations and process their biology into new Reapers." },
  { term:"Replicant",          description:"A bioengineered humanoid in Philip K. Dick's Do Androids Dream of Electric Sheep? — genetically identical to humans but created for labor and combat. Identified by the Voigt-Kampff empathy test." },
  { term:"Sandworm",           description:"The colossal silicon-based apex predators of Arrakis — called Shai-Hulud by the Fremen. They can exceed 400 metres in length and are the source, guardian, and life-cycle of the spice Melange." },
  { term:"Skynet",             description:"The self-aware military AI in Terminator that, upon gaining consciousness, immediately concluded humanity was a threat and launched a nuclear strike to trigger retaliation that would eliminate most of humanity." },
  { term:"Soylent Green",      description:"A food product in the 1973 film set on a catastrophically overpopulated Earth. Detective Thorn's investigation uncovers the product's deeply disturbing true ingredient — the film's infamous central revelation." },
  { term:"T-800",              description:"The Model 101 Terminator — a hyperalloy combat chassis covered in living tissue. The 1984 T-800 was sent to kill Sarah Connor; a reprogrammed T-800 later became John Connor's bodyguard and surrogate father figure." },
  { term:"TARDIS",             description:"Time And Relative Dimension In Space — the time machine piloted by The Doctor in Doctor Who. Disguised as a 1960s police box, its interior exists in a separate dimension, making it famously 'bigger on the inside.'" },
  { term:"Teleporter",         description:"The transporter in Star Trek that disassembles a person's atoms at one location and reconstructs them elsewhere — raising the persistent philosophical question of whether the person who rematerialises is truly the same individual." },
  { term:"United Federation of Planets", description:"The interstellar union in Star Trek, founded in 2161 after the Earth-Romulan War. Headquartered in San Francisco, it governs on principles of universal rights, peaceful exploration, and non-interference (the Prime Directive)." },
  { term:"Uplift",             description:"In David Brin's Uplift series, the genetic engineering of pre-sapient species to full intelligence by a patron species, creating an eternal bond of indenture. Humanity scandalously uplifted dolphins and chimps without having a patron itself." },
  { term:"Voigt-Kampff Test",  description:"An empathy assessment used to identify replicants in Do Androids Dream of Electric Sheep? and Blade Runner — measuring involuntary physiological responses to provocative questions designed to elicit empathic reactions." },
  { term:"Vulcan",             description:"A humanoid species in Star Trek devoted to pure logic and the suppression of emotion — a discipline called Kolinahr. Vulcans are capable of mind-melds and possess greater physical strength than humans. Spock was the first to serve in Starfleet." },
  { term:"Warp Drive",         description:"The FTL propulsion system in Star Trek using matter-antimatter reactions to create a warp field bending spacetime around the vessel. Warp 1 equals lightspeed; Warp 9.9 reaches approximately 3,053 times the speed of light." },
  { term:"Weyland-Yutani",     description:"The 'Company' in the Alien franchise — a British-Japanese megacorporation whose classified standing order is to capture living xenomorph specimens 'for the weapons division,' placing profit above the lives of all its personnel." },
  { term:"Xenomorph",          description:"The predatory alien species at the center of the Alien franchise, designed by H.R. Giger. Characterised by a parasitic lifecycle (egg → facehugger → chestburster → adult), acid blood, and a secondary inner pharyngeal jaw." },
  { term:"Year Zero",          description:"In the Hitchhiker's Guide universe, the year the universe was created. The Total Perspective Vortex — the most horrifying torture device imaginable — shows its victim the entire infinity of the universe with a tiny sign: 'You Are Here.'" },
  { term:"Zaphod Beeblebrox",  description:"The two-headed, three-armed ex-President of the Galaxy in Hitchhiker's Guide who stole the Heart of Gold — the first ship powered by the Infinite Improbability Drive — to seek the legendary planet-builders of Magrathea." },
  { term:"Zero-Point Energy",  description:"The lowest possible energy state of a quantum system, exploited in sci-fi as a limitless clean power source. In Half-Life 2, the Zero-Point Energy Field Manipulator (the Gravity Gun) harnesses this energy for object manipulation." },
];

// ─────────────────────────────────────────────
// THEME PRESETS
// ─────────────────────────────────────────────
const THEMES = [
  { name:"Gold & Charcoal", accent:"#DAD80A", accentDark:"#B8B608", accentPale:"#FAFACC", nav:"#1A1A1A", bg:"#1A1A1A", pageBg:"#F5F5F0", cardBg:"#FEFEFD", text:"#0A0A0A" },
  { name:"Neon Cyan",       accent:"#00F5D4", accentDark:"#00C4A9", accentPale:"#E0FFF9", nav:"#0D1117", bg:"#0D1117", pageBg:"#F0F5F5", cardBg:"#FEFEFD", text:"#0A0A0A" },
  { name:"Crimson",         accent:"#E63946", accentDark:"#C1121F", accentPale:"#FFECEE", nav:"#1D1A22", bg:"#1D1A22", pageBg:"#FBF5F5", cardBg:"#FFFCFD", text:"#0A0A0A" },
  { name:"Forest",          accent:"#4CAF50", accentDark:"#388E3C", accentPale:"#E8F5E9", nav:"#1B2420", bg:"#1B2420", pageBg:"#F2F5F2", cardBg:"#FDFEFB", text:"#0A0A0A" },
  { name:"Royal Purple",    accent:"#9C27B0", accentDark:"#7B1FA2", accentPale:"#F3E5F5", nav:"#1A1020", bg:"#1A1020", pageBg:"#F5F0F7", cardBg:"#FEFBFF", text:"#0A0A0A" },
  { name:"Ocean Blue",      accent:"#2196F3", accentDark:"#1565C0", accentPale:"#E3F2FD", nav:"#0D1B2A", bg:"#0D1B2A", pageBg:"#F0F4F8", cardBg:"#FAFCFF", text:"#0A0A0A" },
];

// ─────────────────────────────────────────────
// CSS BUILDER
// ─────────────────────────────────────────────
const buildStyles = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root {
    --accent:${t.accent}; --accent-dark:${t.accentDark}; --accent-pale:${t.accentPale};
    --accent-muted:${t.accent}28; --nav:${t.nav}; --charcoal:${t.bg};
    --black:#0A0A0A; --dark:#242424; --mid:#666; --light:${t.pageBg}; --white:${t.cardBg};
    --success:#2D7A4F; --success-light:#E8F5EE; --danger:#C0392B; --danger-light:#FDECEA;
    --warning:#E67E22; --r:4px; --rl:12px;
    --sh:0 2px 12px rgba(0,0,0,.08); --shl:0 8px 32px rgba(0,0,0,.12);
    --tr:.2s cubic-bezier(.4,0,.2,1);
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:var(--light);color:var(--black);min-height:100vh;line-height:1.6;}
  .app{display:flex;flex-direction:column;min-height:100vh;}

  /* ── TOPBAR ── */
  .topbar{background:var(--nav);color:#fff;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:100;box-shadow:0 2px 16px rgba(0,0,0,.3);}
  .topbar-brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
  .brand-name{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:#fff;}
  .brand-name span{color:var(--accent);}

  /* ── HERO ── */
  .hero{background:var(--charcoal);color:#fff;padding:52px 24px 60px;text-align:center;position:relative;overflow:hidden;}
  .hero::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(-45deg,transparent,transparent 40px,${t.accent}07 40px,${t.accent}07 80px);}
  .hero-eyebrow{font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:14px;display:flex;align-items:center;justify-content:center;gap:8px;position:relative;}
  .hero-title{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,60px);font-weight:900;line-height:1.1;margin-bottom:14px;position:relative;}
  .hero-title em{font-style:italic;color:var(--accent);}
  .hero-sub{font-size:15px;color:rgba(255,255,255,.6);max-width:520px;margin:0 auto 28px;font-weight:300;position:relative;}
  .hero-cta{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--black);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;padding:13px 28px;border-radius:50px;cursor:pointer;border:none;transition:all var(--tr);position:relative;box-shadow:0 4px 20px ${t.accent}55;}
  .hero-cta:hover{background:var(--accent-dark);transform:translateY(-2px);}

  /* ── STEP TRACKER ── */
  .steps-bar{background:var(--nav);padding:0 24px;display:flex;justify-content:center;}
  .steps{display:flex;align-items:center;gap:0;padding:14px 0;}
  .step{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:rgba(255,255,255,.4);cursor:default;}
  .step.done{color:rgba(255,255,255,.6);}
  .step.active{color:#fff;font-weight:600;}
  .step-num{width:26px;height:26px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
  .step.active .step-num{background:var(--accent);border-color:var(--accent);color:var(--black);}
  .step.done .step-num{background:var(--accent);border-color:var(--accent);color:var(--black);}
  .step-div{width:40px;height:1px;background:rgba(255,255,255,.2);margin:0 4px;}

  /* ── MAIN CONTENT ── */
  .main{flex:1;padding:36px 24px;max-width:940px;margin:0 auto;width:100%;}
  .section-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;margin-bottom:6px;}
  .section-sub{font-size:14px;color:var(--mid);margin-bottom:24px;}

  /* ── INSTRUCTION BANNER ── */
  .instr-banner{background:var(--white);border-radius:var(--rl);padding:24px 28px;box-shadow:var(--sh);border-top:3px solid var(--accent);margin-bottom:24px;}
  .instr-banner h3{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
  .instr-banner p{font-size:14px;color:var(--mid);line-height:1.7;margin-bottom:14px;}
  .instr-banner p:last-child{margin-bottom:0;}
  .csv-example{background:#1A1A1A;color:#98C379;padding:14px 18px;border-radius:var(--r);font-family:'Courier New',monospace;font-size:13px;line-height:1.8;overflow-x:auto;margin-top:12px;}
  .csv-example .csv-comment{color:#6A737D;}
  .csv-example .csv-header{color:${t.accent};}
  .csv-example .csv-term{color:#E06C75;}
  .csv-example .csv-desc{color:#98C379;}

  /* ── UPLOAD ZONE ── */
  .upload-zone{border:2px dashed #D0D0C8;border-radius:var(--rl);padding:44px 24px;text-align:center;cursor:pointer;transition:all var(--tr);background:var(--light);}
  .upload-zone:hover,.upload-zone.drag-over{border-color:var(--accent);background:var(--accent-pale);}
  .upload-icon{font-size:40px;margin-bottom:12px;}
  .upload-label{font-size:15px;font-weight:600;color:var(--dark);margin-bottom:6px;}
  .upload-hint{font-size:13px;color:var(--mid);}
  .upload-limit{font-size:12px;color:var(--mid);margin-top:6px;opacity:.7;}

  /* ── FILE INFO PILL ── */
  .file-pill{display:inline-flex;align-items:center;gap:10px;background:var(--accent-muted);border:1px solid var(--accent);border-radius:50px;padding:8px 16px;font-size:14px;font-weight:500;margin-bottom:16px;}
  .file-pill-remove{background:none;border:none;cursor:pointer;font-size:16px;color:var(--mid);padding:0;line-height:1;}
  .file-pill-remove:hover{color:var(--danger);}

  /* ── VALIDATION ── */
  .validation-row{display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:6px;}
  .val-icon{font-size:14px;}

  /* ── ALPHA NAV ── */
  .alpha-nav{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:24px;padding:14px;background:var(--white);border-radius:var(--rl);box-shadow:var(--sh);border-top:3px solid var(--accent);}
  .alpha-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:var(--r);font-family:'Playfair Display',serif;font-size:15px;font-weight:700;cursor:pointer;transition:all var(--tr);border:none;background:transparent;color:var(--mid);}
  .alpha-btn:hover{background:${t.accent}22;color:var(--black);}
  .alpha-btn.has{color:var(--black);}
  .alpha-btn.active{background:var(--accent);color:var(--black);}
  .alpha-btn.none{opacity:.2;cursor:default;}

  /* ── SECTION DIVIDER ── */
  .letter-section{margin:24px 0 10px;}
  .letter-header{display:flex;align-items:center;gap:14px;}
  .letter-badge{width:46px;height:46px;background:var(--accent);border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:var(--black);flex-shrink:0;}
  .letter-line{flex:1;height:1px;background:#E0E0DA;}
  .letter-count{font-size:12px;color:var(--mid);}

  /* ── GLOSSARY CARD ── */
  .gcard{background:var(--white);border-radius:var(--rl);padding:18px 22px;margin-bottom:8px;box-shadow:var(--sh);border-left:3px solid transparent;transition:all var(--tr);}
  .gcard:hover{border-left-color:var(--accent);transform:translateX(2px);box-shadow:var(--shl);}
  .gcard-term{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--black);margin-bottom:5px;}
  .gcard-desc{font-size:14px;color:var(--mid);line-height:1.72;}

  /* ── SAMPLE BADGE ── */
  .sample-badge{display:inline-flex;align-items:center;gap:5px;background:${t.accent}18;border:1px solid ${t.accent}44;color:var(--dark);border-radius:50px;padding:3px 10px;font-size:11px;font-weight:600;letter-spacing:.5px;margin-bottom:20px;}

  /* ── THEME GRID ── */
  .theme-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:10px;margin-bottom:20px;}
  .theme-swatch{border-radius:var(--rl);overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all var(--tr);box-shadow:var(--sh);}
  .theme-swatch:hover{transform:translateY(-2px);box-shadow:var(--shl);}
  .theme-swatch.sel{border-color:var(--accent);}
  .swatch-bar{height:28px;}
  .swatch-body{padding:8px 10px;background:#fff;}
  .swatch-name{font-size:12px;font-weight:600;color:#333;margin-bottom:4px;}
  .swatch-dots{display:flex;gap:4px;}
  .swatch-dot{width:14px;height:14px;border-radius:50%;border:1px solid #ddd;}

  /* ── COLOR CUSTOMIZER ── */
  .color-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .color-row{display:flex;align-items:center;gap:8px;}
  .color-row label{font-size:12px;font-weight:600;color:var(--mid);text-transform:uppercase;letter-spacing:.4px;width:110px;flex-shrink:0;}
  .color-row input[type=color]{width:34px;height:26px;border:1.5px solid #ddd;border-radius:4px;cursor:pointer;padding:1px;background:#fff;}
  .color-hex{font-size:11px;color:var(--mid);font-family:monospace;}

  /* ── LIVE MINI PREVIEW ── */
  .mini-preview{margin-top:18px;border:1px solid #E0E0DA;border-radius:var(--rl);overflow:hidden;}
  .mini-nav{padding:9px 14px;display:flex;align-items:center;gap:8px;}
  .mini-dot{width:8px;height:8px;border-radius:50%;}
  .mini-label{color:#fff;font-size:12px;font-weight:600;}
  .mini-body{padding:14px;}
  .mini-letter{width:36px;height:36px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;font-family:Georgia,serif;}
  .mini-card{border-radius:6px;padding:10px 14px;border-left-width:3px;border-left-style:solid;}

  /* ── EXPORT PREVIEW ── */
  .code-preview{background:#1A1A1A;color:#ABB2BF;padding:16px;border-radius:var(--r);font-family:monospace;font-size:12px;line-height:1.6;max-height:220px;overflow-y:auto;margin-top:12px;}

  /* ── FORM ATOMS ── */
  .form-card{background:var(--white);border-radius:var(--rl);padding:26px;box-shadow:var(--sh);border-top:3px solid var(--accent);margin-bottom:20px;}
  .form-card h3{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:16px;}
  .form-label{display:block;font-size:12px;font-weight:600;color:var(--dark);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;}
  .form-select{width:auto;padding:9px 14px;border:1.5px solid #E0E0DA;border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:14px;background:var(--white);outline:none;}
  .form-select:focus{border-color:var(--accent);}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all var(--tr);}
  .btn-primary{background:var(--accent);color:var(--black);}
  .btn-primary:hover{background:var(--accent-dark);transform:translateY(-1px);}
  .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .btn-secondary{background:var(--dark);color:#fff;}
  .btn-secondary:hover{background:var(--black);}
  .btn-ghost{background:transparent;color:var(--mid);border:1.5px solid #E0E0DA;}
  .btn-ghost:hover{background:var(--light);border-color:var(--accent);}
  .btn-danger{background:var(--danger);color:#fff;}
  .btn-danger:hover{background:#a93226;}

  /* ── ALERTS ── */
  .alert{padding:12px 16px;border-radius:var(--r);font-size:14px;margin-bottom:14px;}
  .alert-success{background:var(--success-light);color:var(--success);border:1px solid #a8d5c2;}
  .alert-error{background:var(--danger-light);color:var(--danger);border:1px solid #f5b7b1;}
  .alert-info{background:${t.accent}15;color:var(--dark);border:1px solid ${t.accent}44;}

  /* ── PROGRESS BAR ── */
  .progress-wrap{height:6px;background:#E0E0DA;border-radius:50px;overflow:hidden;margin:12px 0;}
  .progress-bar{height:100%;background:var(--accent);border-radius:50px;transition:width .4s ease;}

  /* ── STATS ROW ── */
  .stats-row{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;}
  .stat-box{background:var(--white);border-radius:var(--rl);padding:14px 20px;box-shadow:var(--sh);flex:1;min-width:120px;text-align:center;}
  .stat-box-num{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:var(--accent);display:block;}
  .stat-box-label{font-size:12px;color:var(--mid);text-transform:uppercase;letter-spacing:.5px;}

  /* ── FOOTER ── */
  .footer{background:var(--charcoal);color:rgba(255,255,255,.4);text-align:center;padding:18px 24px;font-size:13px;}

  /* ── MISC ── */
  .empty{text-align:center;padding:48px 24px;color:var(--mid);}
  .empty-icon{font-size:44px;margin-bottom:12px;}
  .divider-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--mid);margin:24px 0 12px;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .25s ease forwards;}
  .spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(0,0,0,.15);border-top-color:currentColor;border-radius:50%;animation:spin .6s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .highlight{background:var(--accent-pale);color:var(--black);border-radius:2px;padding:0 2px;}

  /* ── RESPONSIVE ── */
  @media(max-width:640px){
    .steps .step-label{display:none;}
    .color-grid{grid-template-columns:1fr;}
    .stats-row{gap:10px;}
  }
`;

// ─────────────────────────────────────────────
// CSV PARSER  (handles quoted fields, trims whitespace)
// ─────────────────────────────────────────────
function parseCSV(text, delim = ",") {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const results = [];
  for (const line of lines) {
    // Respect quoted fields containing the delimiter
    const fields = [];
    let cur = "", inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === delim && !inQuote) { fields.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    fields.push(cur.trim());
    const term = (fields[0] || "").replace(/^"|"$/g, "").trim();
    const desc = (fields[1] || "").replace(/^"|"$/g, "").trim();
    if (term && desc) results.push({ term, description: desc });
  }
  return results;
}

// Remove likely header row if term is generic
function stripHeader(rows) {
  if (!rows.length) return rows;
  const first = rows[0].term.toLowerCase();
  if (["term", "word", "name", "title", "glossary term"].includes(first)) return rows.slice(1);
  return rows;
}

// Sort alphabetically, group by first letter
function groupTerms(rows) {
  const sorted = [...rows].sort((a, b) => a.term.localeCompare(b.term));
  const grouped = {};
  for (const item of sorted) {
    const letter = item.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(item);
  }
  return grouped;
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
const Alert = ({ type, children }) => <div className={`alert alert-${type}`}>{children}</div>;
const Spinner = () => <span className="spinner" />;

function GlossaryView({ terms, filterLetter, setFilterLetter, searchQ }) {
  const grouped = groupTerms(terms);
  const letters = Object.keys(grouped).sort();
  const availLetters = new Set(letters);

  const visibleLetters = filterLetter ? [filterLetter] : letters;
  const hi = (text, q) => {
    if (!q) return text;
    return text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")).map((p, i) =>
      p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="highlight">{p}</mark> : p
    );
  };

  return (
    <>
      <div className="alpha-nav">
        <button className={`alpha-btn ${!filterLetter ? "active" : "has"}`} onClick={() => setFilterLetter(null)}>All</button>
        {ALPHABET.map(l => (
          <button key={l}
            className={`alpha-btn ${availLetters.has(l) ? "has" : "none"} ${filterLetter === l ? "active" : ""}`}
            onClick={() => availLetters.has(l) && setFilterLetter(l === filterLetter ? null : l)}>
            {l}
          </button>
        ))}
      </div>
      {visibleLetters.filter(l => grouped[l]).map(letter => (
        <div key={letter} className="fade-in">
          <div className="letter-section">
            <div className="letter-header">
              <div className="letter-badge">{letter}</div>
              <div className="letter-line" />
              <span className="letter-count">{grouped[letter].length} term{grouped[letter].length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          {grouped[letter].map((item, i) => (
            <div key={i} className="gcard">
              <div className="gcard-term">{hi(item.term, searchQ)}</div>
              <div className="gcard-desc">{hi(item.description, searchQ)}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// STEP 1 — LANDING: sample glossary + upload CTA
// ─────────────────────────────────────────────
function StepLanding({ onUpload }) {
  const [filterLetter, setFilterLetter] = useState(null);
  const [searchQ, setSearchQ]           = useState("");
  const [liveQ, setLiveQ]               = useState("");
  const uploadRef = useRef();
  const [dragging, setDragging]         = useState(false);
  const [fileError, setFileError]       = useState(null);

  const filtered = searchQ
    ? SAMPLE_TERMS.filter(t => t.term.toLowerCase().includes(searchQ.toLowerCase()) || t.description.toLowerCase().includes(searchQ.toLowerCase()))
    : SAMPLE_TERMS;

  const handleFile = (f) => {
    setFileError(null);
    if (!f) return;
    if (!f.name.match(/\.(csv|txt|tsv)$/i)) { setFileError("Please upload a .csv, .txt, or .tsv file."); return; }
    if (f.size > MAX_FILE_BYTES) { setFileError(`File is ${(f.size/1024/1024).toFixed(1)} MB — maximum is 2 MB.`); return; }
    onUpload(f);
  };

  return (
    <>
      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-eyebrow">
          <img src={`data:image/png;base64,${LOGO_B64}`} alt="" style={{ width:24, height:24, borderRadius:4 }} />
          <span>Live Glossary Pro</span>
        </div>
        <h1 className="hero-title">Turn your CSV into a<br/><em>Beautiful Glossary</em></h1>
        <p className="hero-sub">Upload a two-column CSV of terms and definitions. We'll format, sort, and style it into a polished downloadable HTML glossary — in seconds.</p>
        <button className="hero-cta" onClick={() => uploadRef.current?.click()}>
          ↑ Upload Your CSV to Get Started
        </button>
        <input ref={uploadRef} type="file" accept=".csv,.txt,.tsv" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div className="main">
        {fileError && <Alert type="error">{fileError}</Alert>}

        {/* ── HOW IT WORKS ── */}
        <div className="instr-banner">
          <h3>📋 How it works</h3>
          <p>
            Prepare a CSV file with <strong>two columns</strong> — the term in column 1, and the description in column 2.
            A header row (<code>Term,Description</code>) is optional and will be detected automatically.
            Commas, tabs, or pipe characters are all accepted as delimiters.
          </p>
          <p>
            <strong>File requirements:</strong> Maximum 2 MB · up to {MAX_TERMS.toLocaleString()} terms · <code>.csv</code>, <code>.txt</code>, or <code>.tsv</code> format.
          </p>
          <div className="csv-example">
            <div className="csv-comment"># Example CSV — paste into a text file and save as .csv</div>
            <div className="csv-header">Term,Description</div>
            <div><span className="csv-term">Ansible</span>,<span className="csv-desc">"A faster-than-light communication device from Le Guin's Hainish Cycle."</span></div>
            <div><span className="csv-term">Blade Runner</span>,<span className="csv-desc">"An officer tasked with retiring escaped replicants."</span></div>
            <div><span className="csv-term">Dyson Sphere</span>,<span className="csv-desc">"A megastructure enclosing a star to capture its total energy output."</span></div>
          </div>
          {/* Download sample CSV button */}
          <div style={{ marginTop:14 }}>
            <button className="btn btn-ghost" style={{ fontSize:13, padding:"8px 16px" }}
              onClick={() => {
                const blob = new Blob([SAMPLE_CSV], { type:"text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "glossary-sample.csv";
                a.click(); URL.revokeObjectURL(url);
              }}>
              ⬇ Download sample CSV
            </button>
          </div>
        </div>

        {/* ── UPLOAD ZONE ── */}
        <div
          className={`upload-zone ${dragging ? "drag-over" : ""}`}
          onClick={() => uploadRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}>
          <div className="upload-icon">📂</div>
          <div className="upload-label">Click to browse or drag & drop your CSV</div>
          <div className="upload-hint">.csv · .txt · .tsv accepted</div>
          <div className="upload-limit">Max 2 MB · up to {MAX_TERMS.toLocaleString()} terms</div>
        </div>

        {/* ── SAMPLE GLOSSARY ── */}
        <div style={{ marginTop:48 }}>
          <div className="divider-label">✦ Example output — Sci-fi glossary sample</div>
          <div className="sample-badge">✦ SAMPLE DATA — replace with your own CSV</div>

          {/* Search within sample */}
          <div style={{ display:"flex", gap:8, marginBottom:20, maxWidth:480 }}>
            <input
              style={{ flex:1, padding:"10px 16px", border:"1.5px solid #E0E0DA", borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none" }}
              value={liveQ} onChange={e => setLiveQ(e.target.value)}
              onKeyDown={e => e.key==="Enter" && setSearchQ(liveQ)}
              placeholder="Search sample terms…" />
            <button className="btn btn-primary" style={{ borderRadius:50, padding:"10px 18px" }} onClick={() => setSearchQ(liveQ)}>Search</button>
            {searchQ && <button className="btn btn-ghost" style={{ borderRadius:50 }} onClick={() => { setSearchQ(""); setLiveQ(""); }}>✕</button>}
          </div>

          <GlossaryView terms={filtered} filterLetter={filterLetter} setFilterLetter={setFilterLetter} searchQ={searchQ} />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// STEP 2 — PROCESS: parse, validate, preview
// ─────────────────────────────────────────────
function StepProcess({ file, onDone, onBack }) {
  const [delimiter, setDelimiter]   = useState(",");
  const [parsedRows, setParsedRows] = useState(null);
  const [errors, setErrors]         = useState([]);
  const [processing, setProcessing] = useState(false);
  const [filterLetter, setFilter]   = useState(null);

  const processFile = () => {
    setProcessing(true);
    setErrors([]);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        let rows = parseCSV(e.target.result, delimiter === "\\t" ? "\t" : delimiter);
        rows = stripHeader(rows);

        const errs = [];
        if (rows.length === 0) errs.push("No valid rows found. Check your delimiter selection and file format.");
        if (rows.length > MAX_TERMS) {
          errs.push(`File contains ${rows.length} rows — trimming to first ${MAX_TERMS}.`);
          rows = rows.slice(0, MAX_TERMS);
        }

        const missing = rows.filter(r => !r.term || !r.description).length;
        if (missing > 0) errs.push(`${missing} row${missing > 1 ? "s" : ""} were skipped (missing term or description).`);

        const clean = rows.filter(r => r.term && r.description);
        setParsedRows(clean);
        setErrors(errs);
      } catch (ex) {
        setErrors(["Could not parse the file. Please check the format and try again."]);
        setParsedRows(null);
      }
      setProcessing(false);
    };
    reader.readAsText(file);
  };

  const letters = parsedRows ? new Set(parsedRows.map(r => r.term[0].toUpperCase())) : new Set();

  return (
    <div className="main">
      <div className="section-title">Process Your Data</div>
      <p className="section-sub">Choose your delimiter and click Process. We'll parse, clean, and sort your terms alphabetically.</p>

      {/* File info */}
      <div style={{ marginBottom:16 }}>
        <span className="file-pill">
          📄 {file.name} <span style={{ color:"var(--mid)", fontSize:12 }}>({(file.size/1024).toFixed(1)} KB)</span>
          <button className="file-pill-remove" onClick={onBack} title="Remove file">✕</button>
        </span>
      </div>

      {/* Delimiter selector */}
      <div className="form-card">
        <h3>1. Select Delimiter</h3>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          {[["Comma  (,)", ","], ["Tab  (\\t)", "\\t"], ["Pipe  (|)", "|"], ["Semicolon  (;)", ";"]].map(([label, val]) => (
            <label key={val} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:14 }}>
              <input type="radio" name="delim" value={val} checked={delimiter === val} onChange={() => { setDelimiter(val); setParsedRows(null); }} />
              <code style={{ fontFamily:"monospace", fontSize:13 }}>{label}</code>
            </label>
          ))}
        </div>
        <div style={{ marginTop:16 }}>
          <button className="btn btn-primary" onClick={processFile} disabled={processing}>
            {processing ? <><Spinner /> Processing…</> : "⚙ Process File"}
          </button>
        </div>
      </div>

      {/* Errors / warnings */}
      {errors.length > 0 && errors.map((e, i) => <Alert key={i} type={e.startsWith("No valid") ? "error" : "info"}>{e}</Alert>)}

      {/* Results */}
      {parsedRows && parsedRows.length > 0 && (
        <div className="fade-in">
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box"><span className="stat-box-num">{parsedRows.length.toLocaleString()}</span><span className="stat-box-label">Terms</span></div>
            <div className="stat-box"><span className="stat-box-num">{letters.size}</span><span className="stat-box-label">Letters</span></div>
            <div className="stat-box"><span className="stat-box-num">{(file.size / 1024).toFixed(0)} KB</span><span className="stat-box-label">File size</span></div>
          </div>

          {/* Progress fill */}
          <div className="progress-wrap"><div className="progress-bar" style={{ width:"100%" }} /></div>
          <Alert type="success">✓ {parsedRows.length} terms parsed and sorted alphabetically — ready to style and download.</Alert>

          {/* Full preview */}
          <div className="divider-label">Preview — your data</div>
          <GlossaryView terms={parsedRows} filterLetter={filterLetter} setFilterLetter={setFilter} searchQ="" />

          {/* Continue */}
          <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end" }}>
            <button className="btn btn-ghost" onClick={onBack}>← Start over</button>
            <button className="btn btn-primary" onClick={() => onDone(parsedRows)}>Choose Style & Download →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 3 — STYLE & DOWNLOAD
// ─────────────────────────────────────────────
const EXPIRY_MINUTES = 30;
const EXPIRY_MS      = EXPIRY_MINUTES * 60 * 1000;

function StepExport({ terms, onBack, onExpire }) {
  const [theme, setTheme]           = useState({ ...THEMES[0] });
  const [custom, setCustom]         = useState({ ...THEMES[0] });
  const [activePreset, setPreset]   = useState(0);
  const [generating, setGenerating] = useState(false);
  const [htmlReady, setHtmlReady]   = useState(null);
  const [filterLetter, setFilter]   = useState(null);

  // ── Expiry countdown ──────────────────────────────
  const expiryRef   = useRef(Date.now() + EXPIRY_MS);
  const [secsLeft, setSecsLeft] = useState(EXPIRY_MINUTES * 60);
  const expired = secsLeft <= 0;

  useEffect(() => {
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiryRef.current - Date.now()) / 1000));
      setSecsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        setHtmlReady(null);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const urgency   = secsLeft < 120 ? "danger" : secsLeft < 300 ? "warn" : "info";
  const urgencyBg = { info:"#E3F2FD", warn:"#FFF8E1", danger:"#FDECEA" };
  const urgencyFg = { info:"#1565C0", warn:"#E67E22", danger:"#C0392B" };

  const applyPreset = (i) => { setTheme({ ...THEMES[i] }); setCustom({ ...THEMES[i] }); setPreset(i); setHtmlReady(null); };
  const updateColor = (key, val) => { const u = { ...custom, [key]:val }; setCustom(u); setTheme(u); setPreset(-1); setHtmlReady(null); };

  const generate = () => {
    setGenerating(true);
    const t = theme;

    // Escape data safely for embedding in the HTML script block
    const safeData = JSON.stringify(terms.map(({ term, description }) => ({ term, description })))
      .replace(/<\/script>/gi, "<\\/script>");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>My Glossary</title>
  <style>
    /* ── RESET & BASE ── */
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t.pageBg};color:#1a1a1a;min-height:100vh;}

    /* ── HEADER ── */
    .hdr{background:${t.nav};color:#fff;padding:28px 24px 24px;text-align:center;position:relative;}
    .hdr h1{font-family:Georgia,serif;font-size:clamp(24px,4vw,38px);font-weight:900;color:#fff;}
    .hdr h1 em{color:${t.accent};font-style:italic;}
    .hdr-sub{color:rgba(255,255,255,.5);font-size:13px;margin-top:6px;}
    .hdr-toolbar{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap;}

    /* ── TOOLBAR BUTTONS ── */
    .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s ease;font-family:inherit;}
    .btn-add{background:${t.accent};color:${t.text};}
    .btn-add:hover{filter:brightness(0.9);}
    .btn-save{background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);}
    .btn-save:hover{background:rgba(255,255,255,0.25);}
    .btn-save.flash{background:#2D7A4F;border-color:#2D7A4F;}

    /* ── SEARCH BAR ── */
    .search-wrap{background:${t.nav};padding:0 24px 20px;display:flex;justify-content:center;}
    .search-box{display:flex;max-width:580px;width:100%;background:#fff;border-radius:50px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.25);}
    .search-box input{flex:1;border:none;outline:none;padding:12px 20px;font-size:14px;font-family:inherit;background:transparent;}
    .search-box button{background:${t.accent};border:none;padding:12px 22px;font-size:13px;font-weight:700;color:${t.text};cursor:pointer;font-family:inherit;}
    .search-box button:hover{filter:brightness(.9);}
    .search-clear{background:none;border:none;padding:0 14px;cursor:pointer;font-size:18px;color:#aaa;}
    .search-clear:hover{color:#333;}

    /* ── ALPHA NAV ── */
    .alpha{background:#fff;border-top:3px solid ${t.accent};border-radius:10px;padding:12px 16px;margin-bottom:28px;display:flex;flex-wrap:wrap;gap:3px;box-shadow:0 2px 10px rgba(0,0,0,.06);}
    .alpha a{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#333;text-decoration:none;transition:all .15s;}
    .alpha a:hover{background:${t.accent}33;color:#000;}
    .alpha a.active{background:${t.accent};color:${t.text};}
    .alpha a.empty{color:#ccc;pointer-events:none;}
    .alpha-all{font-size:11px!important;font-family:inherit!important;font-weight:700!important;letter-spacing:.5px;}

    /* ── LAYOUT ── */
    .wrap{max-width:860px;margin:0 auto;padding:32px 20px;}

    /* ── LETTER SECTION ── */
    .letter-section{margin-bottom:32px;}
    .letter-hdr{display:flex;align-items:center;gap:14px;margin-bottom:12px;}
    .letter-badge{width:46px;height:46px;background:${t.accent};border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:26px;font-weight:900;color:${t.text};flex-shrink:0;}
    .letter-line{flex:1;height:1px;background:#e0e0d8;}
    .letter-count{font-size:12px;color:#999;}

    /* ── GLOSSARY CARD ── */
    .gcard{background:#fff;border-radius:10px;padding:16px 20px;margin-bottom:8px;box-shadow:0 1px 6px rgba(0,0,0,.07);border-left:3px solid transparent;transition:all .15s;position:relative;}
    .gcard:hover{border-left-color:${t.accent};transform:translateX(2px);box-shadow:0 3px 14px rgba(0,0,0,.1);}
    .gcard-term{font-family:Georgia,serif;font-size:16px;font-weight:700;color:#111;margin-bottom:4px;}
    .gcard-desc{font-size:14px;color:#555;line-height:1.75;}
    .gcard-actions{display:none;position:absolute;top:12px;right:14px;gap:6px;}
    .gcard:hover .gcard-actions{display:flex;}
    .act-btn{background:none;border:1px solid #e0e0d8;border-radius:5px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;}
    .act-edit{color:#555;}
    .act-edit:hover{background:${t.accent};border-color:${t.accent};color:${t.text};}
    .act-del{color:#c0392b;}
    .act-del:hover{background:#c0392b;border-color:#c0392b;color:#fff;}

    /* ── INLINE EDIT FORM (replaces card) ── */
    .edit-form{background:#fff;border-radius:10px;padding:18px 20px;margin-bottom:8px;box-shadow:0 3px 14px rgba(0,0,0,.1);border-left:3px solid ${t.accent};}
    .edit-form input,.edit-form textarea{width:100%;padding:9px 12px;border:1.5px solid #ddd;border-radius:6px;font-size:14px;font-family:inherit;outline:none;margin-bottom:8px;resize:vertical;}
    .edit-form input:focus,.edit-form textarea:focus{border-color:${t.accent};}
    .edit-form textarea{min-height:80px;line-height:1.6;}
    .edit-form-actions{display:flex;gap:8px;}
    .btn-confirm{background:${t.accent};color:${t.text};border:none;padding:8px 18px;border-radius:5px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}
    .btn-confirm:hover{filter:brightness(.9);}
    .btn-cancel{background:none;border:1.5px solid #ddd;color:#666;padding:8px 16px;border-radius:5px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
    .btn-cancel:hover{border-color:#aaa;color:#333;}
    .err{color:#c0392b;font-size:12px;margin-bottom:8px;display:none;}

    /* ── ADD FORM PANEL ── */
    .add-panel{background:#fff;border-radius:12px;padding:24px;margin-bottom:28px;box-shadow:0 2px 14px rgba(0,0,0,.08);border-top:3px solid ${t.accent};display:none;}
    .add-panel.open{display:block;}
    .add-panel h3{font-family:Georgia,serif;font-size:17px;font-weight:700;margin-bottom:16px;}
    .add-panel label{display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#666;margin-bottom:5px;}
    .add-panel input,.add-panel textarea{width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:6px;font-size:14px;font-family:inherit;outline:none;margin-bottom:14px;resize:vertical;}
    .add-panel input:focus,.add-panel textarea:focus{border-color:${t.accent};}
    .add-panel textarea{min-height:90px;line-height:1.6;}
    .add-err{color:#c0392b;font-size:13px;margin-bottom:10px;display:none;}

    /* ── EMPTY / NO RESULTS ── */
    .empty{text-align:center;padding:56px 24px;color:#999;}
    .empty-icon{font-size:48px;margin-bottom:12px;}

    /* ── SEARCH HIGHLIGHT ── */
    mark{background:${t.accent}55;color:inherit;border-radius:2px;padding:0 1px;}

    /* ── TOAST ── */
    .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1a1a;color:#fff;padding:10px 22px;border-radius:50px;font-size:13px;font-weight:600;opacity:0;transition:all .3s;pointer-events:none;z-index:999;white-space:nowrap;}
    .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

    /* ── BACK TO TOP ── */
    .top-btn{position:fixed;bottom:24px;right:24px;background:${t.accent};color:${t.text};width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-weight:700;font-size:18px;box-shadow:0 4px 14px rgba(0,0,0,.2);}

    /* ── FOOTER ── */
    .ftr{background:${t.nav};color:rgba(255,255,255,.3);text-align:center;padding:16px;font-size:12px;margin-top:48px;}

    /* ── CONFIRM DIALOG ── */
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:none;align-items:center;justify-content:center;}
    .overlay.open{display:flex;}
    .dialog{background:#fff;border-radius:12px;padding:28px 28px 22px;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.2);}
    .dialog h4{font-family:Georgia,serif;font-size:17px;font-weight:700;margin-bottom:8px;}
    .dialog p{font-size:14px;color:#555;margin-bottom:20px;line-height:1.6;}
    .dialog-btns{display:flex;gap:10px;justify-content:flex-end;}
    .btn-dlg-cancel{background:none;border:1.5px solid #ddd;color:#555;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
    .btn-dlg-del{background:#c0392b;border:none;color:#fff;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}
    .btn-dlg-del:hover{background:#a93226;}

    @media(max-width:600px){
      .gcard-actions{display:flex;}
      .wrap{padding:20px 14px;}
    }
  </style>
</head>
<body id="top">

<!-- HEADER -->
<div class="hdr">
  <h1>My Glossary <em>Pro</em></h1>
  <div class="hdr-sub" id="hdr-count"></div>
  <div class="hdr-toolbar">
    <button class="btn btn-add" onclick="toggleAdd()">＋ Add Term</button>
    <button class="btn btn-save" id="save-btn" onclick="saveFile()">⬇ Download Updated File</button>
  </div>
</div>

<!-- SEARCH -->
<div class="search-wrap">
  <div class="search-box">
    <input type="text" id="search-input" placeholder="Search terms and definitions…" oninput="onSearch(this.value)" onkeydown="if(event.key==='Escape'){clearSearch();}"/>
    <button id="search-clear" class="search-clear" onclick="clearSearch()" style="display:none">✕</button>
    <button onclick="onSearch(document.getElementById('search-input').value)">Search</button>
  </div>
</div>

<!-- MAIN WRAP -->
<div class="wrap">
  <!-- ADD FORM -->
  <div class="add-panel" id="add-panel">
    <h3>Add a New Term</h3>
    <div class="add-err" id="add-err"></div>
    <label>Term</label>
    <input type="text" id="add-term" placeholder="e.g. Ansible" />
    <label>Description</label>
    <textarea id="add-desc" placeholder="Enter the definition…"></textarea>
    <div style="display:flex;gap:8px;">
      <button class="btn-confirm" onclick="confirmAdd()">Add Term</button>
      <button class="btn-cancel" onclick="toggleAdd()">Cancel</button>
    </div>
  </div>

  <!-- ALPHA NAV -->
  <div class="alpha" id="alpha-nav"></div>

  <!-- GLOSSARY CONTENT -->
  <div id="glossary-root"></div>
</div>

<!-- FOOTER -->
<div class="ftr">My Glossary Pro · Powered by Live Glossary Pro</div>
<a href="#top" class="top-btn">↑</a>

<!-- DELETE CONFIRM DIALOG -->
<div class="overlay" id="del-overlay">
  <div class="dialog">
    <h4>Delete this term?</h4>
    <p id="del-term-name" style="font-weight:700;font-family:Georgia,serif;font-size:15px;margin-bottom:6px;"></p>
    <p>This action cannot be undone.</p>
    <div class="dialog-btns">
      <button class="btn-dlg-cancel" onclick="closeDelDialog()">Cancel</button>
      <button class="btn-dlg-del" onclick="confirmDelete()">Delete</button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div class="toast" id="toast"></div>

<script>
// ═══════════════════════════════════════════════
// DATA — loaded from localStorage or initial seed
// ═══════════════════════════════════════════════
const STORAGE_KEY = 'glossary_pro_data';
const INITIAL_DATA = ${safeData};

let terms = [];
let searchQ = '';
let pendingDeleteId = null;

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) { terms = parsed; return; }
    }
  } catch(e) {}
  terms = INITIAL_DATA.map((t, i) => ({ id: i + 1, term: t.term, description: t.description }));
}

function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(terms)); } catch(e) {}
}

function nextId() {
  return terms.length ? Math.max(...terms.map(t => t.id || 0)) + 1 : 1;
}

// ═══════════════════════════════════════════════
// SORT & GROUP
// ═══════════════════════════════════════════════
function getSorted() {
  return [...terms].sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));
}

function groupBy(arr) {
  const g = {};
  arr.forEach(t => {
    const l = t.term[0].toUpperCase();
    if (!g[l]) g[l] = [];
    g[l].push(t);
  });
  return g;
}

// ═══════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════
function highlight(text, q) {
  if (!q) return escHtml(text);
  const re = new RegExp('(' + q.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&') + ')', 'gi');
  return escHtml(text).replace(re, '<mark>$1</mark>');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getFiltered() {
  if (!searchQ) return getSorted();
  const q = searchQ.toLowerCase();
  return getSorted().filter(t =>
    t.term.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  );
}

function onSearch(val) {
  searchQ = val.trim();
  document.getElementById('search-clear').style.display = searchQ ? 'block' : 'none';
  render();
}

function clearSearch() {
  searchQ = '';
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').style.display = 'none';
  render();
}

// ═══════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════
function render() {
  const filtered = getFiltered();
  const grouped  = groupBy(filtered);
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const hasLetters = new Set(Object.keys(grouped));

  // Update header count
  document.getElementById('hdr-count').textContent =
    searchQ ? \`\${filtered.length} result\${filtered.length !== 1 ? 's' : ''} for "\${searchQ}"\`
             : \`\${terms.length} term\${terms.length !== 1 ? 's' : ''}\`;

  // Alpha nav
  const alphaEl = document.getElementById('alpha-nav');
  alphaEl.innerHTML =
    \`<a href="#" onclick="clearSearch();return false;" class="alpha-all \${!searchQ?'active':''}">All</a>\` +
    allLetters.map(l =>
      \`<a href="#s-\${l}" class="\${hasLetters.has(l)?'':'empty'}">\${l}</a>\`
    ).join('');

  // Glossary
  const root = document.getElementById('glossary-root');
  if (filtered.length === 0) {
    root.innerHTML = \`<div class="empty"><div class="empty-icon">🔍</div><div>\${
      searchQ ? 'No terms match your search.' : 'No terms yet — click <strong>+ Add Term</strong> to get started.'
    }</div></div>\`;
    return;
  }

  root.innerHTML = Object.keys(grouped).sort().map(letter => {
    const tms = grouped[letter];
    const cards = tms.map(item => \`
      <div class="gcard" id="card-\${item.id}">
        <div class="gcard-term">\${highlight(item.term, searchQ)}</div>
        <div class="gcard-desc">\${highlight(item.description, searchQ)}</div>
        <div class="gcard-actions">
          <button class="act-btn act-edit" onclick="startEdit(\${item.id})">✏ Edit</button>
          <button class="act-btn act-del"  onclick="openDelDialog(\${item.id})">✕ Delete</button>
        </div>
      </div>\`).join('');
    return \`
      <div class="letter-section" id="s-\${letter}">
        <div class="letter-hdr">
          <div class="letter-badge">\${letter}</div>
          <div class="letter-line"></div>
          <span class="letter-count">\${tms.length} term\${tms.length!==1?'s':''}</span>
        </div>
        \${cards}
      </div>\`;
  }).join('');
}

// ═══════════════════════════════════════════════
// ADD
// ═══════════════════════════════════════════════
function toggleAdd() {
  const panel = document.getElementById('add-panel');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  if (!isOpen) {
    document.getElementById('add-term').focus();
    document.getElementById('add-err').style.display = 'none';
  } else {
    document.getElementById('add-term').value = '';
    document.getElementById('add-desc').value = '';
  }
}

function confirmAdd() {
  const term = document.getElementById('add-term').value.trim();
  const desc = document.getElementById('add-desc').value.trim();
  const errEl = document.getElementById('add-err');
  if (!term || !desc) {
    errEl.textContent = !term ? 'Please enter a term.' : 'Please enter a description.';
    errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';
  terms.push({ id: nextId(), term, description: desc });
  saveData();
  document.getElementById('add-term').value = '';
  document.getElementById('add-desc').value = '';
  document.getElementById('add-panel').classList.remove('open');
  render();
  toast('✓ Term added');
}

// ═══════════════════════════════════════════════
// EDIT (inline — replaces card with form)
// ═══════════════════════════════════════════════
function startEdit(id) {
  const item = terms.find(t => t.id === id);
  if (!item) return;
  const cardEl = document.getElementById('card-' + id);
  if (!cardEl) return;
  cardEl.outerHTML = \`
    <div class="edit-form" id="edit-\${id}">
      <div class="err" id="edit-err-\${id}"></div>
      <input id="edit-term-\${id}" value="\${escHtml(item.term)}" placeholder="Term" />
      <textarea id="edit-desc-\${id}" placeholder="Description">\${escHtml(item.description)}</textarea>
      <div class="edit-form-actions">
        <button class="btn-confirm" onclick="confirmEdit(\${id})">Save Changes</button>
        <button class="btn-cancel"  onclick="cancelEdit(\${id})">Cancel</button>
      </div>
    </div>\`;
  document.getElementById('edit-term-' + id).focus();
}

function confirmEdit(id) {
  const term = document.getElementById('edit-term-' + id).value.trim();
  const desc = document.getElementById('edit-desc-' + id).value.trim();
  const errEl = document.getElementById('edit-err-' + id);
  if (!term || !desc) {
    errEl.textContent = !term ? 'Term cannot be empty.' : 'Description cannot be empty.';
    errEl.style.display = 'block'; return;
  }
  const idx = terms.findIndex(t => t.id === id);
  if (idx >= 0) { terms[idx].term = term; terms[idx].description = desc; }
  saveData(); render(); toast('✓ Changes saved');
}

function cancelEdit(id) {
  render();
}

// ═══════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════
function openDelDialog(id) {
  pendingDeleteId = id;
  const item = terms.find(t => t.id === id);
  document.getElementById('del-term-name').textContent = item ? item.term : '';
  document.getElementById('del-overlay').classList.add('open');
}

function closeDelDialog() {
  pendingDeleteId = null;
  document.getElementById('del-overlay').classList.remove('open');
}

function confirmDelete() {
  if (pendingDeleteId == null) return;
  terms = terms.filter(t => t.id !== pendingDeleteId);
  saveData(); closeDelDialog(); render(); toast('Term deleted');
}

// ═══════════════════════════════════════════════
// DOWNLOAD UPDATED FILE
// ═══════════════════════════════════════════════
function saveFile() {
  // Build a fresh copy of this same HTML but with current terms baked in
  const freshData = JSON.stringify(terms.map(({ term, description }) => ({ term, description })))
    .replace(/<\\/script>/gi, '<\\\\/script>');

  // Replace the INITIAL_DATA line in the current document source
  const src = document.documentElement.outerHTML;
  const updated = src.replace(
    /const INITIAL_DATA = \\[.*?\\];/s,
    'const INITIAL_DATA = ' + freshData + ';'
  );

  const blob = new Blob([updated], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'my-glossary-' + new Date().toISOString().split('T')[0] + '.html';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);

  // Flash the button green briefly
  const btn = document.getElementById('save-btn');
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 1500);
  toast('✓ Updated file downloaded');
}

// ═══════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
loadData();
render();

// Close delete dialog on overlay click
document.getElementById('del-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeDelDialog();
});

// Add term on Enter key in term input
document.getElementById('add-term').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('add-desc').focus();
});
</script>
</body>
</html>`;

    setHtmlReady(html);
    setGenerating(false);
  };

  const download = () => {
    if (!htmlReady) return;
    const blob = new Blob([htmlReady], { type:"text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `glossary-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    // Wipe generated preview — data not retained after download
    setHtmlReady(null);
  };

  // ── Expired state ──────────────────────────────
  if (expired) {
    return (
      <div className="main" style={{ textAlign:"center", padding:"60px 24px" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>⏱</div>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:26, marginBottom:12, color:"#C0392B" }}>Session Expired</h2>
        <p style={{ color:"var(--mid)", fontSize:15, maxWidth:420, margin:"0 auto 28px" }}>
          For your privacy, your uploaded data has been automatically cleared after {EXPIRY_MINUTES} minutes.
          Your CSV was never stored on our servers — it only ever existed in your browser.
        </p>
        <button className="btn btn-primary" onClick={onBack}>← Start Over with a New File</button>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="section-title">Choose Style & Download</div>
      <p className="section-sub">{terms.length} terms ready. Pick a color scheme, preview live, then download your glossary.</p>

      {/* ── SESSION TIMER ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10,
        padding:"12px 18px", borderRadius:10, marginBottom:20,
        background: urgencyBg[urgency],
        border:`1.5px solid ${urgencyFg[urgency]}22`
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>{urgency === "danger" ? "🚨" : urgency === "warn" ? "⚠️" : "🕐"}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color: urgencyFg[urgency] }}>
              {urgency === "danger" ? "Download now — time almost up!" : urgency === "warn" ? "Less than 5 minutes remaining" : "Session timer running"}
            </div>
            <div style={{ fontSize:12, color:"#666", marginTop:2 }}>
              Your uploaded data is held in browser memory only. It will be automatically cleared in{" "}
              <strong style={{ color: urgencyFg[urgency] }}>{fmtTime(secsLeft)}</strong> for your privacy.
              Download your glossary before time runs out.
            </div>
          </div>
        </div>
        <div style={{ fontSize:32, fontWeight:900, fontFamily:"monospace", color: urgencyFg[urgency], letterSpacing:2, flexShrink:0 }}>
          {fmtTime(secsLeft)}
        </div>
      </div>

      {/* Stats summary */}
      <div className="stats-row">
        <div className="stat-box"><span className="stat-box-num">{terms.length}</span><span className="stat-box-label">Terms</span></div>
        <div className="stat-box"><span className="stat-box-num">{new Set(terms.map(t => t.term[0].toUpperCase())).size}</span><span className="stat-box-label">Letters</span></div>
        <div className="stat-box"><span className="stat-box-num">{EXPIRY_MINUTES}m</span><span className="stat-box-label">Time Limit</span></div>
      </div>

      {/* ── COLOR PICKER ── */}
      <div className="form-card">
        <h3>🎨 Color Scheme</h3>

        <div className="theme-grid">
          {THEMES.map((p, i) => (
            <div key={i} className={`theme-swatch ${activePreset === i ? "sel" : ""}`} onClick={() => applyPreset(i)}>
              <div className="swatch-bar" style={{ background:p.bg, borderBottom:`3px solid ${p.accent}` }} />
              <div className="swatch-body">
                <div className="swatch-name">{p.name}</div>
                <div className="swatch-dots">
                  {[p.accent, p.nav, p.cardBg].map((c,j) => <div key={j} className="swatch-dot" style={{ background:c }} />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="divider-label">Fine-tune colors</div>
        <div className="color-grid">
          {[["Accent / Highlight", "accent"], ["Accent (hover)", "accentDark"], ["Page Background", "pageBg"], ["Card Background", "cardBg"], ["Header & Nav", "nav"], ["Heading Text", "text"]].map(([label, key]) => (
            <div key={key} className="color-row">
              <label>{label}</label>
              <input type="color" value={custom[key] || "#000000"} onChange={e => updateColor(key, e.target.value)} />
              <span className="color-hex">{custom[key]}</span>
            </div>
          ))}
        </div>

        {/* Live mini preview */}
        <div className="mini-preview">
          <div className="mini-nav" style={{ background:theme.nav }}>
            <div className="mini-dot" style={{ background:theme.accent }} />
            <span className="mini-label">Live Glossary Pro</span>
            {["A","B","C"].map(l => <span key={l} style={{ color:theme.accent, fontSize:12, fontWeight:700, marginLeft:6 }}>{l}</span>)}
          </div>
          <div style={{ background:theme.pageBg, padding:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div className="mini-letter" style={{ background:theme.accent, color:theme.text }}>A</div>
              <div style={{ flex:1, height:1, background:"#E0E0DA" }} />
              <span style={{ fontSize:11, color:"#999" }}>2 terms</span>
            </div>
            <div className="mini-card" style={{ background:theme.cardBg, borderLeftColor:theme.accent, marginBottom:6 }}>
              <div style={{ fontWeight:700, fontSize:14, color:theme.text, fontFamily:"Georgia,serif" }}>Ansible</div>
              <div style={{ fontSize:11, color:"#777", marginTop:3 }}>Faster-than-light communication device…</div>
            </div>
            <div className="mini-card" style={{ background:theme.cardBg, borderLeftColor:theme.accent }}>
              <div style={{ fontWeight:700, fontSize:14, color:theme.text, fontFamily:"Georgia,serif" }}>Arrakis</div>
              <div style={{ fontSize:11, color:"#777", marginTop:3 }}>Desert planet, sole source of spice Melange…</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── YOUR DATA PREVIEW ── */}
      <div className="form-card">
        <h3>📖 Your Glossary Preview</h3>
        <p style={{ fontSize:13, color:"var(--mid)", marginBottom:16 }}>Showing your uploaded data. Scroll through or filter by letter before downloading.</p>
        <GlossaryView terms={terms} filterLetter={filterLetter} setFilterLetter={setFilter} searchQ="" />
      </div>

      {/* ── HOW YOUR DOWNLOADED FILE WORKS ── */}
      <div className="form-card" style={{ background:"#FAFAF7", border:"1.5px solid #E8E8E0" }}>
        <h3 style={{ marginBottom:16 }}>📘 How Your Downloaded Glossary File Works</h3>
        <p style={{ fontSize:13, color:"#444", lineHeight:1.7, marginBottom:16 }}>
          When you download your glossary, you get a <strong>single self-contained HTML file</strong> that works
          in any browser — no internet connection, no account, no server needed. Here's exactly what you can do with it:
        </p>

        {/* The four features as clear cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12, marginBottom:20 }}>

          {/* Add */}
          <div style={{ background:"#fff", border:"1.5px solid #E0E0D8", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background:"#DAD80A", borderRadius:4, padding:"2px 8px", fontSize:13 }}>＋ Add</span>
              <span>Add new terms</span>
            </div>
            <p style={{ fontSize:13, color:"#555", lineHeight:1.65 }}>
              Click <strong>+ Add Term</strong> in the header. Type the term and its description, then click <strong>Add Term</strong>.
              The new entry appears immediately, sorted into the right alphabetical section.
            </p>
            <p style={{ fontSize:12, color:"#888", marginTop:8, borderTop:"1px solid #f0f0e8", paddingTop:8 }}>
              💾 <strong>Saved automatically</strong> to your browser. If you close and reopen the file in the same browser,
              your new term will still be there.
            </p>
          </div>

          {/* Edit */}
          <div style={{ background:"#fff", border:"1.5px solid #E0E0D8", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background:"#E3F2FD", border:"1px solid #1565C0", borderRadius:4, padding:"2px 8px", fontSize:13, color:"#1565C0" }}>✏ Edit</span>
              <span>Edit any term</span>
            </div>
            <p style={{ fontSize:13, color:"#555", lineHeight:1.65 }}>
              Hover over any term card — an <strong>Edit</strong> button appears in the top-right corner.
              Click it and the card turns into an editable form, pre-filled with the current text.
              Change what you need, then click <strong>Save Changes</strong>.
            </p>
            <p style={{ fontSize:12, color:"#888", marginTop:8, borderTop:"1px solid #f0f0e8", paddingTop:8 }}>
              💾 <strong>Saved automatically</strong> the moment you click Save. Your edit is persisted in this browser.
            </p>
          </div>

          {/* Delete */}
          <div style={{ background:"#fff", border:"1.5px solid #E0E0D8", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background:"#FDECEA", border:"1px solid #C0392B", borderRadius:4, padding:"2px 8px", fontSize:13, color:"#C0392B" }}>✕ Delete</span>
              <span>Remove a term</span>
            </div>
            <p style={{ fontSize:13, color:"#555", lineHeight:1.65 }}>
              Hover a card and click <strong>Delete</strong>. A confirmation box appears so you can't delete by accident.
              Confirm and the term is removed.
            </p>
            <p style={{ fontSize:12, color:"#888", marginTop:8, borderTop:"1px solid #f0f0e8", paddingTop:8 }}>
              ⚠️ <strong>Permanent in this browser.</strong> Deletes are saved immediately and cannot be undone —
              use <em>Download Updated File</em> beforehand if you want a backup.
            </p>
          </div>

          {/* Search */}
          <div style={{ background:"#fff", border:"1.5px solid #E0E0D8", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background:"#F3E5F5", border:"1px solid #7B1FA2", borderRadius:4, padding:"2px 8px", fontSize:13, color:"#7B1FA2" }}>🔍 Search</span>
              <span>Find anything fast</span>
            </div>
            <p style={{ fontSize:13, color:"#555", lineHeight:1.65 }}>
              Type in the search bar to instantly filter all terms and descriptions. Matching text is highlighted in yellow.
              Press <strong>Escape</strong> or click ✕ to clear the search and see all terms again.
            </p>
            <p style={{ fontSize:12, color:"#888", marginTop:8, borderTop:"1px solid #f0f0e8", paddingTop:8 }}>
              🔎 Search doesn't affect your saved data — it's a view filter only.
            </p>
          </div>
        </div>

        {/* Download Updated File explainer — the most important one */}
        <div style={{ background:"#1A1A1A", borderRadius:10, padding:"16px 20px", color:"#fff" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:8, color:"#DAD80A", display:"flex", alignItems:"center", gap:8 }}>
            ⬇ Download Updated File — How to keep and share your changes
          </div>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.75)", lineHeight:1.7, marginBottom:10 }}>
            All adds, edits, and deletes are saved in <strong style={{ color:"#DAD80A" }}>this browser on this device</strong> only.
            If you open the file in a different browser, a different computer, or send it to someone else,
            they won't see your changes — because the HTML file itself hasn't been updated yet.
          </p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.75)", lineHeight:1.7, marginBottom:10 }}>
            To <strong style={{ color:"#DAD80A" }}>bake your changes into the file permanently</strong>, click the
            <strong style={{ color:"#DAD80A" }}> ⬇ Download Updated File</strong> button in the glossary header.
            This re-exports the HTML file with all your current terms included as the new starting data.
            Share that file with anyone — they'll see exactly what you see.
          </p>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:4 }}>
            {[
              ["✅", "Changed your mind about a term?", "Edit → Download Updated File → share the new file"],
              ["✅", "Moving to a new computer?",       "Download Updated File → copy it across → open it there"],
              ["✅", "Sending to a colleague?",         "Download Updated File → email or share that HTML file"],
            ].map(([icon, title, desc], i) => (
              <div key={i} style={{ flex:"1 1 200px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#DAD80A", marginBottom:3 }}>{icon} {title}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GENERATE + DOWNLOAD ── */}
      <div className="form-card">
        <h3>⬇ Generate & Download</h3>
        <p style={{ fontSize:14, color:"var(--mid)", marginBottom:16 }}>
          The exported file is a <strong>fully self-contained HTML file</strong> — open it in any browser, on any device,
          with no internet connection required. Your data is <strong>never sent to or stored on our servers</strong>.
          Once you download, this page clears your data immediately.
        </p>

        {/* Urgency reminder if running low */}
        {urgency !== "info" && (
          <div style={{ padding:"10px 14px", borderRadius:8, marginBottom:16,
            background: urgencyBg[urgency], border:`1.5px solid ${urgencyFg[urgency]}44`,
            fontSize:13, fontWeight:600, color: urgencyFg[urgency] }}>
            {urgency === "danger" ? "🚨" : "⚠️"} Only <strong>{fmtTime(secsLeft)}</strong> left to download before your session data is cleared.
          </div>
        )}

        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn btn-primary" onClick={generate} disabled={generating || expired}>
            {generating ? <><Spinner/> Generating…</> : "⚙ Generate HTML File"}
          </button>
          {htmlReady && <button className="btn btn-secondary" onClick={download}>⬇ Download & Clear</button>}
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        </div>

        {htmlReady && (
          <div className="fade-in" style={{ marginTop:16 }}>
            <Alert type="success">✓ File ready — {Math.round(htmlReady.length / 1024)} KB · {terms.length} terms · includes add/edit/delete/search</Alert>
            <div className="divider-label">HTML preview (first 30 lines)</div>
            <div className="code-preview">
              {htmlReady.split("\n").slice(0, 30).map((line, i) => <div key={i}>{line || " "}</div>)}
              <div style={{ color:"var(--accent)" }}>… {htmlReady.split("\n").length} total lines</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────
function StepBar({ step }) {
  const steps = [
    { n:1, label:"View Sample" },
    { n:2, label:"Process CSV" },
    { n:3, label:"Style & Download" },
  ];
  return (
    <div className="steps-bar">
      <div className="steps">
        {steps.map((s, i) => (
          <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
            <div className={`step ${step > s.n ? "done" : step === s.n ? "active" : ""}`}>
              <div className="step-num">{step > s.n ? "✓" : s.n}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="step-div" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [step, setStep]     = useState(1);   // 1 = landing, 2 = process, 3 = export
  const [file, setFile]     = useState(null);
  const [terms, setTerms]   = useState(null);
  const [theme]             = useState(THEMES[0]);

  // Inject styles once on mount
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "lgp-styles";
    el.textContent = buildStyles(theme);
    document.head.appendChild(el);
    return () => { const s = document.getElementById("lgp-styles"); if (s) s.remove(); };
  }, []);

  const handleUpload = (f) => { setFile(f); setStep(2); window.scrollTo(0, 0); };
  const handleProcessed = (rows) => { setTerms(rows); setStep(3); window.scrollTo(0, 0); };
  const handleBack = () => {
    if (step === 3) { setStep(2); window.scrollTo(0,0); }
    else { setFile(null); setTerms(null); setStep(1); window.scrollTo(0,0); }
  };

  const handleExpire = () => {
    // Called by StepExport timer — wipe all state and return to landing
    setFile(null); setTerms(null); setStep(1); window.scrollTo(0,0);
  };

  return (
    <div className="app">
      {/* Topbar */}
      <nav className="topbar">
        <div className="topbar-brand" onClick={() => { setStep(1); setFile(null); setTerms(null); window.scrollTo(0,0); }}>
          <img src={`data:image/png;base64,${LOGO_B64}`} alt="logo" style={{ width:32, height:32, borderRadius:5 }} />
          <span className="brand-name">Live Glossary<span> Pro</span></span>
        </div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>
          CSV → Beautiful HTML Glossary
        </div>
      </nav>

      {/* Step indicator */}
      <StepBar step={step} />

      {/* Pages */}
      {step === 1 && <StepLanding onUpload={handleUpload} />}
      {step === 2 && <StepProcess file={file} onDone={handleProcessed} onBack={() => handleBack()} />}
      {step === 3 && <StepTerms terms={terms} onBack={() => handleBack()} onExpire={handleExpire} />}

      <div className="footer">
        <strong>Live Glossary Pro</strong> · Upload CSV · Style · Download · No data stored
      </div>
    </div>
  );
}

// alias so JSX resolves
const StepTerms = StepExport;
