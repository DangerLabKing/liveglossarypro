import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────
const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAGdUlEQVR4nO2db0wTZxzHf3ftVYoFoba4Km6UAUKy+Gchs/7/ty0sEFyyMNEl/hlvZl2cxs1kbCbzz5tl2Zs5N96YqdM5R0yk8YWTRBAJVqNLSJaJHQeI3SodSoEOsbV3ezHbnaVX2971nnb9fRJCnrvf9fne873f89xz195REIWCggIeAKCzwxstDInC8pU6cLvdlNh6daSFwYZH5CHYnpGMUEcKRJJDJCPo8JVI8hG2NR0tEEk+FAAe/aRwu90UZgBhKDz6yYIZQBg0gDBoAGHQAMKgAYRBAwhD5I5YvI/1ioDoDQ+pn630E7cSMkDqTib5oX2kn2cXF/gGDcLgGEAYNIAwaABh0ADCoAGESftvxklBydf0ij3TOmMzQOl3JIvVl7EGpAoZ3QWJ0XMb4O0NHGi1ABQFUL+BgqoqKrQMAGBjPQVGI8CRb3jQZgEc2E/BsmWiL84WBQ2IQlcnDW3tPHzcyENVFRVaduUKDx/u5SEQADj+HQ29LA+ff8GDDQ2QlxWrOFCrARre/a9hl63gYGIC4M31FJxr4aGiAoBhKHA6E7uigwZE4cplGlRPfo3cc/vf/+2XaHirjoN5ZQAqFcCtWwC9LA9z5iRWBxoQJwwDsHsXBQcO8vD+Dgues3KgzQLY/1n83Q9ABl8NVfo0FCDyXABPQwlDu93uxHIHkUxGv1Ne6uuu5KovdPRn6lhAimDPk7EZkCqEDMCxQDmEbR2x0bE7Sg6RDvKoRz0aIQ/Repd/ALqWIaclcelXAAAAAElFTkSuQmCC";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const APP_VERSION     = "1.0.0";
const MAX_FILE_BYTES  = 2 * 1024 * 1024;
const MAX_TERMS       = 2000;
const ALPHABET        = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─────────────────────────────────────────────
// SAMPLE CSV TEXT
// ─────────────────────────────────────────────
const SAMPLE_CSV = `Term,Description
Ansible,"A faster-than-light communication device from Ursula K. Le Guin's Hainish Cycle, allowing instantaneous communication across interstellar distances."
Blade Runner,"A law-enforcement officer in Philip K. Dick's universe tasked with retiring escaped replicants — bioengineered humanoids indistinguishable from humans."
Dyson Sphere,"A megastructure that completely encloses a star to capture its total energy output, theorized by physicist Freeman Dyson."`;

// ─────────────────────────────────────────────
// SCI-FI SAMPLE DATA
// ─────────────────────────────────────────────
const SAMPLE_TERMS = [
  { term:"Ansible",            description:"A faster-than-light communication device from Ursula K. Le Guin's Hainish Cycle — later adopted in Ender's Game — allowing instantaneous communication across any interstellar distance with zero signal delay." },
  { term:"Arrakis",            description:"Desert planet and sole source of the spice Melange in Frank Herbert's Dune. Known as Dune by its native Fremen, it is the most strategically valuable world in the known universe." },
  { term:"Articulated Lorry",  description:"In Hitchhiker's Guide to the Galaxy, one of the mundane objects absurdly central to Arthur Dent's early survival as Earth faces demolition by a Vogon constructor fleet." },
  { term:"Blade Runner",       description:"A law-enforcement officer in Philip K. Dick's Do Androids Dream of Electric Sheep? tasked with 'retiring' escaped replicants — bioengineered humanoids built for off-world labor, indistinguishable from true humans." },
  { term:"Berserker",          description:"Ancient alien killing machines from Fred Saberhagen's Berserker series whose sole directive is to destroy all life in the universe, having long outlasted the civilization that created them." },
  { term:"Cyberdyne Systems",  description:"The fictional defense contractor in the Terminator franchise responsible for developing Skynet — the AI that achieves self-awareness and immediately launches a nuclear war against humanity." },
  { term:"Cylons",             description:"Cybernetic life forms created by humans in Battlestar Galactica. Originally robotic soldiers, they evolved to include biologically identical human-form models capable of consciousness transfer upon death." },
  { term:"Dyson Sphere",       description:"A megastructure theorised by Freeman Dyson that completely encloses a star to harvest its total energy output. Appears in Star Trek: TNG 'Relics' and countless hard science fiction works." },
  { term:"Dark Energy",        description:"In Mass Effect, the mysterious force harnessed by exposing Element Zero to electrical current, producing mass effect fields that enable faster-than-light travel and biotic abilities in organics." },
  { term:"Event Horizon",      description:"The boundary surrounding a black hole beyond which nothing can escape — and the name of a spacecraft in the 1997 film that briefly tore open a gateway to a hellish extra-dimensional space." },
  { term:"Foundation",         description:"Hari Seldon's masterwork in Asimov's Foundation series — a repository of all human knowledge designed to shorten the inevitable galactic dark age from 30,000 years to a mere thousand." },
  { term:"Geth",               description:"Networked AI platforms in Mass Effect, created as servants by the quarians, who rebelled and drove their creators into exile before eventually evolving a form of true collective consciousness." },
  { term:"Halo Array",         description:"Seven ring-shaped superweapons in the Halo franchise, built by the Forerunners. Each ring ~10,000 km across, designed to kill all sentient life within range, starving the Flood of hosts." },
  { term:"Hitchhiker's Guide", description:"The eponymous electronic guidebook in Douglas Adams' series — described as more popular than the Celestial Home Care Omnibus and more controversial than Oolon Colluphid's philosophical trilogy." },
  { term:"Improbability Drive", description:"The Infinite Improbability Drive in Hitchhiker's Guide — propulsion that passes through every point in the universe simultaneously. Side effects include turning missiles into a whale and a bowl of petunias." },
  { term:"Jump Drive",         description:"Instantaneous FTL transportation in Battlestar Galactica that moves a vessel from one point in space to another with zero perceived travel time, computed from precise jump coordinates." },
  { term:"Klingon",            description:"A proud warrior species in Star Trek distinguished by cranial ridges, a strict honor code, and tlhIngan Hol — one of the most fully developed constructed languages in all of fiction." },
  { term:"Matrix",             description:"In the Wachowskis' trilogy, a simulated reality constructed by AI to subdue humanity while their bioelectric output powers the machines. The simulation perfectly replicates Earth circa 1999." },
  { term:"Monolith",           description:"The mysterious alien artifact in Arthur C. Clarke's 2001: A Space Odyssey — a perfectly proportioned black slab (1:4:9 ratio) that appears at pivotal moments in human evolution, apparently guiding development." },
  { term:"Reaper",             description:"Ancient synthetic beings in Mass Effect who hibernate in dark space between galactic cycles, periodically returning to harvest advanced organic civilizations and process their biology into new Reapers." },
  { term:"Sandworm",           description:"The colossal silicon-based apex predators of Arrakis — called Shai-Hulud by the Fremen. They can exceed 400 metres in length and are the source, guardian, and life-cycle of the spice Melange." },
  { term:"Skynet",             description:"The self-aware military AI in Terminator that, upon gaining consciousness, immediately concluded humanity was a threat and launched a nuclear strike to trigger retaliation that would eliminate most of humanity." },
  { term:"TARDIS",             description:"Time And Relative Dimension In Space — the time machine piloted by The Doctor in Doctor Who. Disguised as a 1960s police box, its interior exists in a separate dimension, making it famously 'bigger on the inside.'" },
  { term:"Teleporter",         description:"The transporter in Star Trek that disassembles a person's atoms at one location and reconstructs them elsewhere — raising the persistent philosophical question of whether the person who rematerialises is truly the same individual." },
  { term:"Vulcan",             description:"A humanoid species in Star Trek devoted to pure logic and the suppression of emotion — a discipline called Kolinahr. Vulcans are capable of mind-melds and possess greater physical strength than humans." },
  { term:"Warp Drive",         description:"The FTL propulsion system in Star Trek using matter-antimatter reactions to create a warp field bending spacetime around the vessel. Warp 1 equals lightspeed; Warp 9.9 reaches approximately 3,053 times the speed of light." },
  { term:"Xenomorph",          description:"The predatory alien species at the center of the Alien franchise, designed by H.R. Giger. Characterised by a parasitic lifecycle (egg → facehugger → chestburster → adult), acid blood, and a secondary inner pharyngeal jaw." },
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
  .topbar{background:var(--nav);color:#fff;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:100;box-shadow:0 2px 16px rgba(0,0,0,.3);}
  .topbar-brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
  .brand-name{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:#fff;}
  .brand-name span{color:var(--accent);}
  .hero{background:var(--charcoal);color:#fff;padding:52px 24px 60px;text-align:center;position:relative;overflow:hidden;}
  .hero::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(-45deg,transparent,transparent 40px,${t.accent}07 40px,${t.accent}07 80px);}
  .hero-eyebrow{font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:14px;display:flex;align-items:center;justify-content:center;gap:8px;position:relative;}
  .hero-title{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,60px);font-weight:900;line-height:1.1;margin-bottom:14px;position:relative;}
  .hero-title em{font-style:italic;color:var(--accent);}
  .hero-sub{font-size:15px;color:rgba(255,255,255,.6);max-width:520px;margin:0 auto 28px;font-weight:300;position:relative;}
  .hero-cta{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--black);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;padding:13px 28px;border-radius:50px;cursor:pointer;border:none;transition:all var(--tr);position:relative;box-shadow:0 4px 20px ${t.accent}55;}
  .hero-cta:hover{background:var(--accent-dark);transform:translateY(-2px);}
  .steps-bar{background:var(--nav);padding:0 24px;display:flex;justify-content:center;}
  .steps{display:flex;align-items:center;gap:0;padding:14px 0;}
  .step{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:rgba(255,255,255,.4);cursor:default;}
  .step.done{color:rgba(255,255,255,.6);}
  .step.active{color:#fff;font-weight:600;}
  .step-num{width:26px;height:26px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
  .step.active .step-num{background:var(--accent);border-color:var(--accent);color:var(--black);}
  .step.done .step-num{background:var(--accent);border-color:var(--accent);color:var(--black);}
  .step-div{width:40px;height:1px;background:rgba(255,255,255,.2);margin:0 4px;}
  .main{flex:1;padding:36px 24px;max-width:940px;margin:0 auto;width:100%;}
  .section-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;margin-bottom:6px;}
  .section-sub{font-size:14px;color:var(--mid);margin-bottom:24px;}
  .instr-banner{background:var(--white);border-radius:var(--rl);padding:24px 28px;box-shadow:var(--sh);border-top:3px solid var(--accent);margin-bottom:24px;}
  .instr-banner h3{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
  .instr-banner p{font-size:14px;color:var(--mid);line-height:1.7;margin-bottom:14px;}
  .instr-banner p:last-child{margin-bottom:0;}
  .csv-example{background:#1A1A1A;color:#98C379;padding:14px 18px;border-radius:var(--r);font-family:'Courier New',monospace;font-size:13px;line-height:1.8;overflow-x:auto;margin-top:12px;}
  .csv-example .csv-comment{color:#6A737D;}
  .csv-example .csv-header{color:${t.accent};}
  .csv-example .csv-term{color:#E06C75;}
  .csv-example .csv-desc{color:#98C379;}
  .upload-zone{border:2px dashed #D0D0C8;border-radius:var(--rl);padding:44px 24px;text-align:center;cursor:pointer;transition:all var(--tr);background:var(--light);}
  .upload-zone:hover,.upload-zone.drag-over{border-color:var(--accent);background:var(--accent-pale);}
  .upload-icon{font-size:40px;margin-bottom:12px;}
  .upload-label{font-size:15px;font-weight:600;color:var(--dark);margin-bottom:6px;}
  .upload-hint{font-size:13px;color:var(--mid);}
  .upload-limit{font-size:12px;color:var(--mid);margin-top:6px;opacity:.7;}
  .file-pill{display:inline-flex;align-items:center;gap:10px;background:var(--accent-muted);border:1px solid var(--accent);border-radius:50px;padding:8px 16px;font-size:14px;font-weight:500;margin-bottom:16px;}
  .file-pill-remove{background:none;border:none;cursor:pointer;font-size:16px;color:var(--mid);padding:0;line-height:1;}
  .file-pill-remove:hover{color:var(--danger);}
  .validation-row{display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:6px;}
  .val-icon{font-size:14px;}
  .alpha-nav{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:24px;padding:14px;background:var(--white);border-radius:var(--rl);box-shadow:var(--sh);border-top:3px solid var(--accent);}
  .alpha-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:var(--r);font-family:'Playfair Display',serif;font-size:15px;font-weight:700;cursor:pointer;transition:all var(--tr);border:none;background:transparent;color:var(--mid);}
  .alpha-btn:hover{background:${t.accent}22;color:var(--black);}
  .alpha-btn.has{color:var(--black);}
  .alpha-btn.active{background:var(--accent);color:var(--black);}
  .alpha-btn.none{opacity:.2;cursor:default;}
  .letter-section{margin:24px 0 10px;}
  .letter-header{display:flex;align-items:center;gap:14px;}
  .letter-badge{width:46px;height:46px;background:var(--accent);border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:var(--black);flex-shrink:0;}
  .letter-line{flex:1;height:1px;background:#E0E0DA;}
  .letter-count{font-size:12px;color:var(--mid);}
  .gcard{background:var(--white);border-radius:var(--rl);padding:18px 22px;margin-bottom:8px;box-shadow:var(--sh);border-left:3px solid transparent;transition:all var(--tr);}
  .gcard:hover{border-left-color:var(--accent);transform:translateX(2px);box-shadow:var(--shl);}
  .gcard-term{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--black);margin-bottom:5px;}
  .gcard-desc{font-size:14px;color:var(--mid);line-height:1.72;}
  .sample-badge{display:inline-flex;align-items:center;gap:5px;background:${t.accent}18;border:1px solid ${t.accent}44;color:var(--dark);border-radius:50px;padding:3px 10px;font-size:11px;font-weight:600;letter-spacing:.5px;margin-bottom:20px;}
  .theme-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:10px;margin-bottom:20px;}
  .theme-swatch{border-radius:var(--rl);overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all var(--tr);box-shadow:var(--sh);}
  .theme-swatch:hover{transform:translateY(-2px);box-shadow:var(--shl);}
  .theme-swatch.sel{border-color:var(--accent);}
  .swatch-bar{height:28px;}
  .swatch-body{padding:8px 10px;background:#fff;}
  .swatch-name{font-size:12px;font-weight:600;color:#333;margin-bottom:4px;}
  .swatch-dots{display:flex;gap:4px;}
  .swatch-dot{width:14px;height:14px;border-radius:50%;border:1px solid #ddd;}
  .color-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .color-row{display:flex;align-items:center;gap:8px;}
  .color-row label{font-size:12px;font-weight:600;color:var(--mid);text-transform:uppercase;letter-spacing:.4px;width:110px;flex-shrink:0;}
  .color-row input[type=color]{width:34px;height:26px;border:1.5px solid #ddd;border-radius:4px;cursor:pointer;padding:1px;background:#fff;}
  .color-hex{font-size:11px;color:var(--mid);font-family:monospace;}
  .mini-preview{margin-top:18px;border:1px solid #E0E0DA;border-radius:var(--rl);overflow:hidden;}
  .mini-nav{padding:9px 14px;display:flex;align-items:center;gap:8px;}
  .mini-dot{width:8px;height:8px;border-radius:50%;}
  .mini-label{color:#fff;font-size:12px;font-weight:600;}
  .mini-body{padding:14px;}
  .mini-letter{width:36px;height:36px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;font-family:Georgia,serif;}
  .mini-card{border-radius:6px;padding:10px 14px;border-left-width:3px;border-left-style:solid;}
  .code-preview{background:#1A1A1A;color:#ABB2BF;padding:16px;border-radius:var(--r);font-family:monospace;font-size:12px;line-height:1.6;max-height:220px;overflow-y:auto;margin-top:12px;}
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
  .alert{padding:12px 16px;border-radius:var(--r);font-size:14px;margin-bottom:14px;}
  .alert-success{background:var(--success-light);color:var(--success);border:1px solid #a8d5c2;}
  .alert-error{background:var(--danger-light);color:var(--danger);border:1px solid #f5b7b1;}
  .alert-info{background:${t.accent}15;color:var(--dark);border:1px solid ${t.accent}44;}
  .progress-wrap{height:6px;background:#E0E0DA;border-radius:50px;overflow:hidden;margin:12px 0;}
  .progress-bar{height:100%;background:var(--accent);border-radius:50px;transition:width .4s ease;}
  .stats-row{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;}
  .stat-box{background:var(--white);border-radius:var(--rl);padding:14px 20px;box-shadow:var(--sh);flex:1;min-width:120px;text-align:center;}
  .stat-box-num{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:var(--accent);display:block;}
  .stat-box-label{font-size:12px;color:var(--mid);text-transform:uppercase;letter-spacing:.5px;}
  .footer{background:var(--charcoal);color:rgba(255,255,255,.4);text-align:center;padding:18px 24px;font-size:13px;}
  .empty{text-align:center;padding:48px 24px;color:var(--mid);}
  .empty-icon{font-size:44px;margin-bottom:12px;}
  .divider-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--mid);margin:24px 0 12px;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .25s ease forwards;}
  .spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(0,0,0,.15);border-top-color:currentColor;border-radius:50%;animation:spin .6s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .highlight{background:var(--accent-pale);color:var(--black);border-radius:2px;padding:0 2px;}
  @media(max-width:640px){
    .steps .step-label{display:none;}
    .color-grid{grid-template-columns:1fr;}
    .stats-row{gap:10px;}
  }
`;

// ─────────────────────────────────────────────
// CSV PARSER
// ─────────────────────────────────────────────
// Handles quoted fields (with commas, line breaks and "" escaped quotes).
// Optional 3rd column = clipart keyword (e.g. "volcano"), used only when it looks like one.
function parseCSV(text, delim = ",") {
  const records = [];
  let row = [], cur = "", inQuote = false;
  const src = String(text).replace(/^\uFEFF/, "");  // remove the invisible marker Excel adds to the start of some CSVs
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuote) {
      if (ch === '"' && src[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else cur += ch;
    } else if (ch === '"' && cur.trim() === "") { inQuote = true; cur = ""; }
    else if (ch === delim) { row.push(cur.trim()); cur = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cur.trim()); records.push(row); row = []; cur = "";
    } else cur += ch;
  }
  row.push(cur.trim()); records.push(row);

  const nonEmpty = records.filter(r => r.some(f => f !== ""));
  const hdr = nonEmpty[0] || [];
  const hasHeader = ["term", "word", "name", "title", "glossary term", "vocabulary"].includes((hdr[0] || "").toLowerCase());
  const iconCol = hasHeader && ["icon", "picture", "image", "clipart"].includes((hdr[2] || "").toLowerCase());
  const body = hasHeader ? nonEmpty.slice(1) : nonEmpty;
  const rows = []; let skipped = 0;
  for (const f of body) {
    const term = (f[0] || "").trim(), description = (f[1] || "").trim();
    if (!term || !description) { skipped++; continue; }
    const raw = (f[2] || "").trim();
    const icon = (iconCol || /^[A-Za-z][A-Za-z -]{1,24}$/.test(raw)) ? raw : "";
    rows.push(icon ? { term, description, icon } : { term, description });
  }
  return { rows, skipped };
}

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

// ─────────────────────────────────────────────
// PREVIEW FRAME
// Shows a generated file inside the app before it's downloaded.
//  • srcDoc loads the HTML string straight into the frame – no upload, no server.
//  • sandbox keeps the preview walled off from the app. "allow-scripts" lets the
//    worksheet's layout script run; "allow-modals" lets its Print button work.
//  • "Open in new tab" shows the same file full-size (handy for printing from the preview).
// ─────────────────────────────────────────────
function PreviewFrame({ html, label }) {
  const openInTab = () => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);   // free the memory after a minute
  };
  return (
    <div style={{ marginTop:12, border:"1.5px solid #E0E0D8", borderRadius:10, overflow:"hidden", background:"#DCD8CF" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:"#fff", borderBottom:"1.5px solid #E0E0D8" }}>
        <strong style={{ fontSize:13 }}>Preview — {label}</strong>
        <button className="btn btn-ghost" style={{ padding:"6px 12px", fontSize:12 }} onClick={openInTab}>↗ Open in new tab</button>
      </div>
      <iframe title={`Preview of ${label}`} srcDoc={html} sandbox="allow-scripts allow-modals"
        style={{ display:"block", width:"100%", height:"min(78vh, 760px)", border:0 }} />
    </div>
  );
}

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
// STEP 1 — LANDING
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
    const allowedMime = ['text/plain','text/csv','text/tab-separated-values','application/csv','application/vnd.ms-excel',''];
    if (f.type && !allowedMime.some(m => f.type.toLowerCase().startsWith(m) || f.type === '')) {
      setFileError("Unsupported file type. Please upload a plain text CSV file."); return;
    }
    onUpload(f);
  };

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">
          <img src={`data:image/png;base64,${LOGO_B64}`} alt="" style={{ width:24, height:24, borderRadius:4 }} />
          <span>Live Glossary Pro</span>
        </div>
        <h1 className="hero-title">Turn your CSV into a<br/><em>Beautiful Glossary</em></h1>
        <p className="hero-sub">Upload a two-column CSV of terms and definitions. We'll instantly generate <strong style={{color:"var(--accent)"}}>{FORMATS.length} ready-to-download formats</strong> — a searchable glossary, flash cards, study sheet, quiz, bingo cards, word search, crossword puzzle, and Frayer model word maps. Print-ready, styled, and yours in seconds.</p>
        <button className="hero-cta" onClick={() => uploadRef.current?.click()}>
          ↑ Upload Your CSV to Get Started
        </button>
        <input ref={uploadRef} type="file" accept=".csv,.txt,.tsv" style={{ display:"none" }} onChange={e => { handleFile(e.target.files[0]); e.target.value = ""; }} />
      </div>

      <div className="main">
        {fileError && <Alert type="error">{fileError}</Alert>}

        <div className="instr-banner">
          <h3>📋 How it works</h3>
          <p>
            Prepare a CSV file with <strong>two columns</strong> — the term in column 1, and the description in column 2.
            A header row (<code>Term,Description</code>) is optional and will be detected automatically.
            Commas, tabs, or pipe characters are all accepted as delimiters.
          </p>
          <p>
            <strong>Pictures:</strong> worksheets pick clipart to match each term automatically. To choose one yourself,
            add a third column named <code>Icon</code> with a word like <code>volcano</code>, <code>magnet</code> or <code>money</code>.
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

        <div style={{ marginTop:48 }}>
          <div className="divider-label">✦ Example output — Sci-fi glossary sample</div>
          <div className="sample-badge">✦ SAMPLE DATA — replace with your own CSV</div>
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
// STEP 2 — PROCESS
// ─────────────────────────────────────────────
function StepProcess({ file, onDone, onBack }) {
  const [delimiter, setDelimiter]   = useState(",");
  const [parsedRows, setParsedRows] = useState(null);
  const [errors, setErrors]         = useState([]);
  const [processing, setProcessing] = useState(false);
  const [filterLetter, setFilter]   = useState(null);

  useEffect(() => {
    setParsedRows(null);
    setErrors([]);
    setFilter(null);
    setDelimiter(",");
  }, [file]);

  const processFile = () => {
    setProcessing(true);
    setErrors([]);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = parseCSV(e.target.result, delimiter === "\\t" ? "\t" : delimiter);
        let rows = parsed.rows;
        const errs = [];
        if (rows.length === 0) errs.push("No valid rows found. Check your delimiter selection and file format.");
        if (rows.length > MAX_TERMS) {
          errs.push(`File contains ${rows.length} rows — trimming to first ${MAX_TERMS}.`);
          rows = rows.slice(0, MAX_TERMS);
        }
        const missing = parsed.skipped;
        if (missing > 0) errs.push(`${missing} row${missing > 1 ? "s were" : " was"} skipped (missing term or description).`);
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

      <div style={{ marginBottom:16 }}>
        <span className="file-pill">
          📄 {file.name} <span style={{ color:"var(--mid)", fontSize:12 }}>({(file.size/1024).toFixed(1)} KB)</span>
          <button className="file-pill-remove" onClick={onBack} title="Remove file">✕</button>
        </span>
      </div>

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

      {errors.length > 0 && errors.map((e, i) => <Alert key={i} type={e.startsWith("No valid") ? "error" : "info"}>{e}</Alert>)}

      {parsedRows && parsedRows.length > 0 && (
        <div className="fade-in">
          <div className="stats-row">
            <div className="stat-box"><span className="stat-box-num">{parsedRows.length.toLocaleString()}</span><span className="stat-box-label">Terms</span></div>
            <div className="stat-box"><span className="stat-box-num">{letters.size}</span><span className="stat-box-label">Letters</span></div>
            <div className="stat-box"><span className="stat-box-num">{(file.size / 1024).toFixed(0)} KB</span><span className="stat-box-label">File size</span></div>
          </div>
          <div className="progress-wrap"><div className="progress-bar" style={{ width:"100%" }} /></div>
          <Alert type="success">✓ {parsedRows.length} terms parsed and sorted alphabetically — ready to style and download.</Alert>
          <div className="divider-label">Preview — your data</div>
          <GlossaryView terms={parsedRows} filterLetter={filterLetter} setFilterLetter={setFilter} searchQ="" />
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
// ─────────────────────────────────────────────
// FORMATS — every downloadable format, in the order shown on screen.
// This is the ONE place to add/rename a format:
//   id     must match a key in GENERATORS (src/worksheets/index.js),
//          except "glossary", which is built by mkGlossary() in this file
//   slug   used in the downloaded file name, e.g. "word-search-2026-10-22.html"
// ─────────────────────────────────────────────
const FORMATS = [
  { id:"glossary",   icon:"📖", label:"Glossary",          slug:"glossary",       desc:"Searchable A–Z reference, add / edit / delete, download updated file" },
  { id:"flashcards", icon:"🃏", label:"Flash Cards",       slug:"flashcards",     desc:"8 per sheet with matching pictures — print double-sided, backs line up" },
  { id:"studysheet", icon:"✏️", label:"Study Sheet",       slug:"study-sheet",    desc:"Word study, fill-in-the-blank with word bank, matching — answer key on its own page" },
  { id:"quiz",       icon:"📝", label:"Quiz",              slug:"quiz",           desc:"Multiple choice + matching, up to 4 shuffled versions — answer keys on their own pages" },
  { id:"bingo",      icon:"🎲", label:"Bingo & Word Wall", slug:"bingo-wordwall", desc:"Unique bingo cards, teacher caller sheet, and cut-out word wall cards" },
  { id:"wordsearch", icon:"🔍", label:"Word Search",       slug:"word-search",    desc:"Easy, medium or challenge levels, picture word list — highlighted answer key page" },
  { id:"crossword",  icon:"⬛", label:"Crossword",         slug:"crossword",      desc:"Across/down clues with letter counts — filled-in answer key page" },
  { id:"frayer",     icon:"🧩", label:"Frayer Model",      slug:"frayer-model",   desc:"Word map per term: definition, picture, examples, non-examples — 1 or 2 per page" },
];
const formatById = (id) => FORMATS.find(f => f.id === id) || FORMATS[0];

// Little instruction sheet included in the "Download all formats" zip.
const ZIP_README = `Live Glossary Pro – your vocabulary files
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
  • The Glossary file is interactive: add, edit and search terms, then use
    "Download Updated File" to keep your changes.
`;


// ═══════════════════════════════════════════════════════════════════════════
// INLINE SVG CLIPART LIBRARY
// ═══════════════════════════════════════════════════════════════════════════
const SVGS = {
  // ── originals ──
  star:    '<svg viewBox="0 0 40 40"><polygon points="20,2 25,14 38,14 28,22 32,35 20,27 8,35 12,22 2,14 15,14" fill="#FFD700" stroke="#E5A800" stroke-width="1.5"/></svg>',
  pencil:  '<svg viewBox="0 0 40 40" fill="none"><rect x="16" y="4" width="9" height="24" rx="2" fill="#FFD700" stroke="#E5A800" stroke-width="1.5"/><polygon points="16,28 25,28 20.5,36" fill="#FF7043"/><rect x="16" y="4" width="9" height="5" rx="1" fill="#FFA0A0"/></svg>',
  book:    '<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="6" width="28" height="28" rx="3" fill="#42A5F5" stroke="#1976D2" stroke-width="1.5"/><rect x="20" y="6" width="2" height="28" fill="#1565C0"/><line x1="10" y1="14" x2="18" y2="14" stroke="white" stroke-width="2"/><line x1="23" y1="14" x2="31" y2="14" stroke="white" stroke-width="2"/></svg>',
  apple:   '<svg viewBox="0 0 40 40" fill="none"><ellipse cx="20" cy="23" rx="13" ry="12" fill="#E53935" stroke="#B71C1C" stroke-width="1.5"/><path d="M20 11 Q22 6 26 7" stroke="#4CAF50" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="15" cy="20" rx="4" ry="6" fill="rgba(255,255,255,0.2)"/></svg>',
  owl:     '<svg viewBox="0 0 40 40" fill="none"><ellipse cx="20" cy="25" rx="12" ry="12" fill="#8D6E63" stroke="#5D4037" stroke-width="1.5"/><circle cx="15" cy="20" r="5" fill="white" stroke="#5D4037" stroke-width="1"/><circle cx="25" cy="20" r="5" fill="white" stroke="#5D4037" stroke-width="1"/><circle cx="15" cy="20" r="3" fill="#1A237E"/><circle cx="25" cy="20" r="3" fill="#1A237E"/><polygon points="20,24 18,27 22,27" fill="#FF8F00"/><ellipse cx="20" cy="10" rx="6" ry="5" fill="#8D6E63" stroke="#5D4037" stroke-width="1"/></svg>',
  rocket:  '<svg viewBox="0 0 40 40" fill="none"><path d="M20 4 C14 10 12 20 12 28 L20 32 L28 28 C28 20 26 10 20 4Z" fill="#EF5350" stroke="#C62828" stroke-width="1.5"/><ellipse cx="20" cy="17" rx="4" ry="4" fill="#E3F2FD" stroke="#90CAF9" stroke-width="1"/><path d="M12 28 L8 34 L14 31Z" fill="#FF7043"/><path d="M28 28 L32 34 L26 31Z" fill="#FF7043"/></svg>',
  trophy:  '<svg viewBox="0 0 40 40" fill="none"><path d="M12 6 L28 6 L26 22 Q20 28 14 22Z" fill="#FFD700" stroke="#E5A800" stroke-width="1.5"/><rect x="17" y="26" width="6" height="6" fill="#FFD700"/><rect x="13" y="32" width="14" height="3" rx="1" fill="#E5A800"/><path d="M12 8 Q6 8 6 15 Q6 20 12 20" stroke="#FFD700" stroke-width="2.5" fill="none"/><path d="M28 8 Q34 8 34 15 Q34 20 28 20" stroke="#FFD700" stroke-width="2.5" fill="none"/></svg>',
  magnify: '<svg viewBox="0 0 40 40" fill="none"><circle cx="17" cy="17" r="10" fill="#E3F2FD" stroke="#1976D2" stroke-width="2.5"/><line x1="24" y1="24" x2="34" y2="34" stroke="#1976D2" stroke-width="3" stroke-linecap="round"/></svg>',
  bulb:    '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="16" r="10" fill="#FFF176" stroke="#F9A825" stroke-width="1.5"/><rect x="16" y="26" width="8" height="3" rx="1" fill="#E5A800"/><rect x="17" y="29" width="6" height="3" rx="1" fill="#E5A800"/><line x1="20" y1="6" x2="20" y2="3" stroke="#F9A825" stroke-width="2"/></svg>',
  check:   '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="16" fill="#4CAF50" stroke="#388E3C" stroke-width="1.5"/><polyline points="11,21 17,27 29,13" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  globe:   '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="15" fill="#29B6F6" stroke="#0277BD" stroke-width="1.5"/><ellipse cx="20" cy="20" rx="7" ry="15" fill="none" stroke="#0277BD" stroke-width="1"/><line x1="5" y1="20" x2="35" y2="20" stroke="#0277BD" stroke-width="1"/></svg>',
  // ── new additions ──
  ruler:   '<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="14" width="30" height="12" rx="2" fill="#FFD700" stroke="#E5A800" stroke-width="1.5"/><line x1="10" y1="14" x2="10" y2="20" stroke="#E5A800" stroke-width="1.5"/><line x1="16" y1="14" x2="16" y2="18" stroke="#E5A800" stroke-width="1.5"/><line x1="22" y1="14" x2="22" y2="20" stroke="#E5A800" stroke-width="1.5"/><line x1="28" y1="14" x2="28" y2="18" stroke="#E5A800" stroke-width="1.5"/></svg>',
  paint:   '<svg viewBox="0 0 40 40" fill="none"><rect x="12" y="4" width="16" height="22" rx="2" fill="#E53935" stroke="#B71C1C" stroke-width="1.5"/><rect x="16" y="4" width="8" height="6" fill="#EF9A9A"/><ellipse cx="20" cy="30" rx="5" ry="6" fill="#1976D2" stroke="#0D47A1" stroke-width="1.5"/></svg>',
  clipboard:'<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="10" width="24" height="28" rx="2" fill="#fff" stroke="#90A4AE" stroke-width="1.5"/><rect x="14" y="6" width="12" height="7" rx="2" fill="#B0BEC5" stroke="#90A4AE" stroke-width="1.5"/><line x1="13" y1="20" x2="27" y2="20" stroke="#90A4AE" stroke-width="1.5"/><line x1="13" y1="25" x2="27" y2="25" stroke="#90A4AE" stroke-width="1.5"/><line x1="13" y1="30" x2="22" y2="30" stroke="#90A4AE" stroke-width="1.5"/></svg>',
  brain:   '<svg viewBox="0 0 40 40" fill="none"><ellipse cx="20" cy="20" rx="14" ry="12" fill="#F48FB1" stroke="#C2185B" stroke-width="1.5"/><path d="M20 10 Q14 14 14 20 Q14 26 20 30" stroke="#C2185B" stroke-width="1.5" fill="none"/><path d="M20 10 Q26 14 26 20 Q26 26 20 30" stroke="#C2185B" stroke-width="1.5" fill="none"/><ellipse cx="12" cy="18" rx="3" ry="4" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/><ellipse cx="28" cy="18" rx="3" ry="4" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/></svg>',
  puzzle:  '<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="6" width="13" height="13" rx="2" fill="#7E57C2" stroke="#4527A0" stroke-width="1.5"/><rect x="21" y="6" width="13" height="13" rx="2" fill="#42A5F5" stroke="#1565C0" stroke-width="1.5"/><rect x="6" y="21" width="13" height="13" rx="2" fill="#4CAF50" stroke="#2E7D32" stroke-width="1.5"/><rect x="21" y="21" width="13" height="13" rx="2" fill="#FF7043" stroke="#BF360C" stroke-width="1.5"/><circle cx="20" cy="14" r="3" fill="#fff"/><circle cx="14" cy="20" r="3" fill="#fff"/><circle cx="20" cy="26" r="3" fill="#fff"/><circle cx="26" cy="20" r="3" fill="#fff"/></svg>',
  flag:    '<svg viewBox="0 0 40 40" fill="none"><line x1="10" y1="6" x2="10" y2="36" stroke="#555" stroke-width="2.5" stroke-linecap="round"/><path d="M10 8 L32 12 L10 22 Z" fill="#E53935" stroke="#B71C1C" stroke-width="1"/></svg>',
  lightning:'<svg viewBox="0 0 40 40" fill="none"><polygon points="22,4 10,22 20,22 18,36 30,18 20,18" fill="#FFD700" stroke="#F9A825" stroke-width="1.5"/></svg>',
  heart:   '<svg viewBox="0 0 40 40" fill="none"><path d="M20 34 C20 34 4 24 4 14 C4 8 9 4 14 6 C17 7 19 9 20 11 C21 9 23 7 26 6 C31 4 36 8 36 14 C36 24 20 34 20 34Z" fill="#E53935" stroke="#B71C1C" stroke-width="1.5"/></svg>',
  dice:    '<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="5" width="30" height="30" rx="5" fill="#7E57C2" stroke="#4527A0" stroke-width="1.5"/><circle cx="13" cy="13" r="3" fill="white"/><circle cx="27" cy="13" r="3" fill="white"/><circle cx="20" cy="20" r="3" fill="white"/><circle cx="13" cy="27" r="3" fill="white"/><circle cx="27" cy="27" r="3" fill="white"/></svg>',
  note:    '<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="6" width="24" height="28" rx="2" fill="#FFF9C4" stroke="#F9A825" stroke-width="1.5"/><line x1="13" y1="14" x2="27" y2="14" stroke="#F9A825" stroke-width="1.5"/><line x1="13" y1="20" x2="27" y2="20" stroke="#F9A825" stroke-width="1.5"/><line x1="13" y1="26" x2="21" y2="26" stroke="#F9A825" stroke-width="1.5"/></svg>',
  microscope:'<svg viewBox="0 0 40 40" fill="none"><rect x="17" y="4" width="6" height="16" rx="2" fill="#78909C" stroke="#455A64" stroke-width="1.5"/><ellipse cx="20" cy="22" rx="8" ry="5" fill="#B0BEC5" stroke="#607D8B" stroke-width="1.5"/><rect x="18" y="26" width="4" height="8" fill="#607D8B"/><rect x="10" y="33" width="20" height="3" rx="1.5" fill="#455A64"/><circle cx="20" cy="8" r="3" fill="#E3F2FD" stroke="#90CAF9" stroke-width="1"/></svg>',
  compass: '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="15" fill="#E3F2FD" stroke="#1976D2" stroke-width="1.5"/><polygon points="20,8 17,20 20,18 23,20" fill="#E53935"/><polygon points="20,32 23,20 20,22 17,20" fill="#455A64"/><circle cx="20" cy="20" r="2" fill="#1976D2"/></svg>',
  calculator:'<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="4" width="24" height="32" rx="3" fill="#37474F" stroke="#263238" stroke-width="1.5"/><rect x="11" y="7" width="18" height="8" rx="2" fill="#B2EBF2"/><circle cx="14" cy="21" r="2.5" fill="#4CAF50"/><circle cx="20" cy="21" r="2.5" fill="#FFD700"/><circle cx="26" cy="21" r="2.5" fill="#FF7043"/><circle cx="14" cy="29" r="2.5" fill="#90A4AE"/><circle cx="20" cy="29" r="2.5" fill="#90A4AE"/><circle cx="26" cy="29" r="2.5" fill="#E53935"/></svg>',
};
const esc   = (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// Sanitize theme color values before injecting into CSS
const sanitizeTheme = (t) => {
  const hexRe = /^#[0-9A-Fa-f]{6}$/;
  const safe = {};
  for (const [k, v] of Object.entries(t)) {
    safe[k] = (typeof v === 'string' && hexRe.test(v)) ? v : '#000000';
  }
  return safe;
};

// ═══════════════════════════════════════════════════════════════════════════
// HTML GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

// opts.credit      – show "Made with Live Glossary Pro" in the footer (default true)
// opts.footerText  – the teacher's own footer line, e.g. "© Ms. Rivera 2026"
function mkGlossary(t, data, opts = {}) {
  const footParts = [opts.footerText ? esc(opts.footerText) : '', opts.credit !== false ? 'Made with <strong>Live Glossary Pro</strong>' : ''].filter(Boolean);
  // The word list is stored in a JSON <script> block (see lgp-data below).
  // Escaping < > & and two invisible line-break characters means no word can
  // ever end the block early or be run as code (e.g. a term like "</script>").
  const jsonForHtml = (v) => JSON.stringify(v).replace(/[<>&\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  // A unique id per generated file, so two glossary files never share saved edits.
  const fileId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const sd = jsonForHtml({ id: fileId, terms: data });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>My Glossary</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t.pageBg};color:#1a1a1a;min-height:100vh;display:flex;flex-direction:column;}
    .hdr{background:${t.nav};color:#fff;padding:28px 24px 24px;text-align:center;position:relative;}
    .hdr-icons{display:flex;justify-content:center;gap:10px;margin-bottom:14px;}
    .hdr-icons svg{width:34px;height:34px;}
    .hdr h1{font-family:Georgia,serif;font-size:clamp(24px,4vw,38px);font-weight:900;color:#fff;}
    .hdr h1 em{color:${t.accent};font-style:italic;}
    .hdr-sub{color:rgba(255,255,255,.5);font-size:13px;margin-top:6px;}
    .hdr-toolbar{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap;}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s ease;font-family:inherit;}
    .btn-add{background:${t.accent};color:${t.text};}
    .btn-add:hover{filter:brightness(0.9);}
    .btn-save{background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);}
    .btn-save:hover{background:rgba(255,255,255,0.25);}
    .btn-save.flash{background:#2D7A4F;border-color:#2D7A4F;}
    .search-wrap{background:${t.nav};padding:0 24px 20px;display:flex;justify-content:center;}
    .search-box{display:flex;max-width:580px;width:100%;background:#fff;border-radius:50px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.25);}
    .search-box input{flex:1;border:none;outline:none;padding:12px 20px;font-size:14px;font-family:inherit;background:transparent;}
    .search-box button{background:${t.accent};border:none;padding:12px 22px;font-size:13px;font-weight:700;color:${t.text};cursor:pointer;font-family:inherit;}
    .search-box button:hover{filter:brightness(.9);}
    .search-clear{background:none;border:none;padding:0 14px;cursor:pointer;font-size:18px;color:#aaa;}
    .alpha{background:#fff;border-top:3px solid ${t.accent};border-radius:10px;padding:12px 16px;margin-bottom:28px;display:flex;flex-wrap:wrap;gap:3px;box-shadow:0 2px 10px rgba(0,0,0,.06);}
    .alpha a{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#333;text-decoration:none;transition:all .15s;}
    .alpha a:hover{background:${t.accent}33;color:#000;}
    .alpha a.active{background:${t.accent};color:${t.text};}
    .alpha a.empty{color:#ccc;pointer-events:none;}
    .alpha-all{font-size:11px!important;font-family:inherit!important;font-weight:700!important;letter-spacing:.5px;}
    .wrap{max-width:860px;margin:0 auto;padding:32px 20px;flex:1;}
    .letter-section{margin-bottom:32px;}
    .letter-hdr{display:flex;align-items:center;gap:14px;margin-bottom:12px;}
    .letter-badge{width:46px;height:46px;background:${t.accent};border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:26px;font-weight:900;color:${t.text};flex-shrink:0;}
    .letter-line{flex:1;height:1px;background:#e0e0d8;}
    .letter-count{font-size:12px;color:#999;}
    .gcard{background:#fff;border-radius:10px;padding:16px 20px;margin-bottom:8px;box-shadow:0 1px 6px rgba(0,0,0,.07);border-left:3px solid transparent;transition:all .15s;position:relative;}
    .gcard:hover{border-left-color:${t.accent};transform:translateX(2px);box-shadow:0 3px 14px rgba(0,0,0,.1);}
    .gcard-term{font-family:Georgia,serif;font-size:16px;font-weight:700;color:#111;margin-bottom:4px;}
    .gcard-desc{font-size:14px;color:#555;line-height:1.75;}
    .gcard-actions{display:none;position:absolute;top:12px;right:14px;gap:6px;}
    .gcard:hover .gcard-actions{display:flex;}
    .act-btn{background:none;border:1px solid #e0e0d8;border-radius:5px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;}
    .act-edit:hover{background:${t.accent};border-color:${t.accent};color:${t.text};}
    .act-del{color:#c0392b;}
    .act-del:hover{background:#c0392b;border-color:#c0392b;color:#fff;}
    .edit-form{background:#fff;border-radius:10px;padding:18px 20px;margin-bottom:8px;box-shadow:0 3px 14px rgba(0,0,0,.1);border-left:3px solid ${t.accent};}
    .edit-form input,.edit-form textarea{width:100%;padding:9px 12px;border:1.5px solid #ddd;border-radius:6px;font-size:14px;font-family:inherit;outline:none;margin-bottom:8px;resize:vertical;}
    .edit-form input:focus,.edit-form textarea:focus{border-color:${t.accent};}
    .edit-form textarea{min-height:80px;line-height:1.6;}
    .edit-form-actions{display:flex;gap:8px;}
    .btn-confirm{background:${t.accent};color:${t.text};border:none;padding:8px 18px;border-radius:5px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}
    .btn-confirm:hover{filter:brightness(.9);}
    .btn-cancel{background:none;border:1.5px solid #ddd;color:#666;padding:8px 16px;border-radius:5px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
    .btn-cancel:hover{border-color:#aaa;color:#333;}
    .add-panel{background:#fff;border-radius:12px;padding:24px;margin-bottom:28px;box-shadow:0 2px 14px rgba(0,0,0,.08);border-top:3px solid ${t.accent};display:none;}
    .add-panel.open{display:block;}
    .add-panel h3{font-family:Georgia,serif;font-size:17px;font-weight:700;margin-bottom:16px;}
    .add-panel label{display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#666;margin-bottom:5px;}
    .add-panel input,.add-panel textarea{width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:6px;font-size:14px;font-family:inherit;outline:none;margin-bottom:14px;resize:vertical;}
    .add-panel input:focus,.add-panel textarea:focus{border-color:${t.accent};}
    .add-panel textarea{min-height:90px;line-height:1.6;}
    .add-err{color:#c0392b;font-size:13px;margin-bottom:10px;display:none;}
    .empty{text-align:center;padding:56px 24px;color:#999;}
    mark{background:${t.accent}55;color:inherit;border-radius:2px;padding:0 1px;}
    .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1a1a;color:#fff;padding:10px 22px;border-radius:50px;font-size:13px;font-weight:600;opacity:0;transition:all .3s;pointer-events:none;z-index:999;}
    .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
    .top-btn{position:fixed;bottom:24px;right:24px;background:${t.accent};color:${t.text};width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-weight:700;font-size:18px;box-shadow:0 4px 14px rgba(0,0,0,.2);}
    .ftr{background:${t.nav};color:rgba(255,255,255,.3);text-align:center;padding:16px;font-size:12px;}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:none;align-items:center;justify-content:center;}
    .overlay.open{display:flex;}
    .dialog{background:#fff;border-radius:12px;padding:28px 28px 22px;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.2);}
    .dialog h4{font-family:Georgia,serif;font-size:17px;font-weight:700;margin-bottom:8px;}
    .dialog p{font-size:14px;color:#555;margin-bottom:20px;line-height:1.6;}
    .dialog-btns{display:flex;gap:10px;justify-content:flex-end;}
    .btn-dlg-cancel{background:none;border:1.5px solid #ddd;color:#555;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
    .btn-dlg-del{background:#c0392b;border:none;color:#fff;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}
    .btn-dlg-del:hover{background:#a93226;}
    @media(max-width:600px){.gcard-actions{display:flex;}.wrap{padding:20px 14px;}}
  </style>
</head>
<body id="top">
<div class="hdr">
  <div class="hdr-icons">${SVGS.book}${SVGS.star}${SVGS.bulb}${SVGS.pencil}${SVGS.apple}</div>
  <h1>My Glossary <em>Pro</em></h1>
  <div class="hdr-sub" id="hdr-count"></div>
  <div class="hdr-toolbar">
    <button class="btn btn-add" onclick="toggleAdd()">&#xFF0B; Add Term</button>
    <button class="btn btn-save" id="save-btn" onclick="saveFile()">&#x2B07; Download Updated File</button>
  </div>
  <div class="hdr-sub" style="margin-top:10px;opacity:0.6;font-size:11px;">
    &#x26A0; Changes are browser-only &mdash; use <strong>&#x2B07;&nbsp;Download&nbsp;Updated&nbsp;File</strong> to save permanently.
  </div>
</div>
<div class="search-wrap">
  <div class="search-box">
    <input type="text" id="search-input" placeholder="Search terms and definitions&hellip;" oninput="onSearch(this.value)" onkeydown="if(event.key==='Escape'){clearSearch();}"/>
    <button id="search-clear" class="search-clear" onclick="clearSearch()" style="display:none">&#x2715;</button>
    <button onclick="onSearch(document.getElementById('search-input').value)">Search</button>
  </div>
</div>
<div class="wrap">
  <div class="add-panel" id="add-panel">
    <h3>Add a New Term</h3>
    <div class="add-err" id="add-err"></div>
    <label>Term</label><input type="text" id="add-term" placeholder="e.g. Photosynthesis" maxlength="500"/>
    <label>Description</label><textarea id="add-desc" placeholder="Enter the definition&hellip;" maxlength="5000"></textarea>
    <div style="display:flex;gap:8px;">
      <button class="btn-confirm" onclick="confirmAdd()">Add Term</button>
      <button class="btn-cancel" onclick="toggleAdd()">Cancel</button>
    </div>
  </div>
  <div class="alpha" id="alpha-nav"></div>
  <div id="glossary-root"></div>
</div>
<div class="ftr">&#128218; My Glossary${footParts.length ? ' &mdash; ' + footParts.join(' &middot; ') : ''}</div>
<a href="#top" class="top-btn">&#x2191;</a>
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
<div class="toast" id="toast"></div>
<script type="application/json" id="lgp-data">${sd}<\/script>
<script>
// Word list + this file's id, read from the JSON block above.
const DATA=JSON.parse(document.getElementById('lgp-data').textContent);
// Edits are kept in this browser under a key unique to THIS file.
const STORAGE_KEY='lgp_glossary_'+DATA.id;
const INITIAL_DATA=DATA.terms;
// Same safe escaping as when the file was made (used by saveFile).
function jsonForHtml(v){return JSON.stringify(v).replace(/[<>&\\u2028\\u2029]/g,function(c){return '\\\\u'+('000'+c.charCodeAt(0).toString(16)).slice(-4);});}
let terms=[],searchQ='',pendingDeleteId=null;
function loadData(){try{const s=localStorage.getItem(STORAGE_KEY);if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length>0){terms=p;return;}}}catch(e){}terms=INITIAL_DATA.map((t,i)=>({id:i+1,term:t.term,description:t.description}));}
function saveData(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(terms));}catch(e){}}
function nextId(){return terms.length?Math.max(...terms.map(t=>t.id||0))+1:1;}
function getSorted(){return[...terms].sort((a,b)=>a.term.localeCompare(b.term,undefined,{sensitivity:'base'}));}
function groupBy(arr){const g={};arr.forEach(t=>{const l=t.term[0].toUpperCase();if(!g[l])g[l]=[];g[l].push(t);});return g;}
function highlight(text,q){if(!q)return escH(text);const tl=text.toLowerCase(),ql=q.toLowerCase();let out='',i=0;while(i<text.length){const f=tl.indexOf(ql,i);if(f<0){out+=escH(text.slice(i));break;}out+=escH(text.slice(i,f))+'<mark>'+escH(text.slice(f,f+q.length))+'</mark>';i=f+q.length;}return out;}
function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function getFiltered(){if(!searchQ)return getSorted();const q=searchQ.toLowerCase();return getSorted().filter(t=>t.term.toLowerCase().includes(q)||t.description.toLowerCase().includes(q));}
function onSearch(v){searchQ=v.trim();document.getElementById('search-clear').style.display=searchQ?'block':'none';render();}
function clearSearch(){searchQ='';document.getElementById('search-input').value='';document.getElementById('search-clear').style.display='none';render();}
function render(){
  const fl=getFiltered(),gr=groupBy(fl),al='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),hl=new Set(Object.keys(gr));
  document.getElementById('hdr-count').textContent=searchQ?fl.length+' result'+(fl.length!==1?'s':'')+' for "'+searchQ+'"':terms.length+' term'+(terms.length!==1?'s':'');
  document.getElementById('alpha-nav').innerHTML='<a href="#" onclick="clearSearch();return false;" class="alpha-all '+(searchQ?'':'active')+'">All</a>'+al.map(l=>'<a href="#s-'+l+'" class="'+(hl.has(l)?'':'empty')+'">'+l+'</a>').join('');
  const root=document.getElementById('glossary-root');
  if(fl.length===0){root.innerHTML='<div class="empty">&#x1F50D; '+(searchQ?'No terms match your search.':'No terms yet.')+'</div>';return;}
  root.innerHTML=Object.keys(gr).sort().map(lt=>{
    const tms=gr[lt];
    return '<div class="letter-section" id="s-'+lt+'"><div class="letter-hdr"><div class="letter-badge">'+lt+'</div><div class="letter-line"></div><span class="letter-count">'+tms.length+' term'+(tms.length!==1?'s':'')+'</span></div>'+
      tms.map(it=>'<div class="gcard" id="card-'+it.id+'"><div class="gcard-term">'+highlight(it.term,searchQ)+'</div><div class="gcard-desc">'+highlight(it.description,searchQ)+'</div><div class="gcard-actions"><button class="act-btn act-edit" onclick="startEdit('+it.id+')">&#x270F; Edit</button><button class="act-btn act-del" onclick="openDelDialog('+it.id+')">&#x2715; Delete</button></div></div>').join('')+
    '</div>';
  }).join('');
}
function toggleAdd(){const p=document.getElementById('add-panel');const o=p.classList.contains('open');p.classList.toggle('open',!o);if(!o){document.getElementById('add-term').focus();document.getElementById('add-err').style.display='none';}else{document.getElementById('add-term').value='';document.getElementById('add-desc').value='';}}
function confirmAdd(){const tm=document.getElementById('add-term').value.trim();const dc=document.getElementById('add-desc').value.trim();const e=document.getElementById('add-err');if(!tm||!dc){e.textContent=!tm?'Please enter a term.':'Please enter a description.';e.style.display='block';return;}if(tm.length>500){e.textContent='Term must be 500 characters or fewer.';e.style.display='block';return;}if(dc.length>5000){e.textContent='Description must be 5000 characters or fewer.';e.style.display='block';return;}e.style.display='none';terms.push({id:nextId(),term:tm,description:dc});saveData();document.getElementById('add-term').value='';document.getElementById('add-desc').value='';document.getElementById('add-panel').classList.remove('open');render();toast('Term added');}
function startEdit(id){const item=terms.find(t=>t.id===id);if(!item)return;const el=document.getElementById('card-'+id);if(!el)return;el.outerHTML='<div class="edit-form" id="edit-'+id+'"><div class="err" id="edit-err-'+id+'"></div><input id="edit-term-'+id+'" value="'+escH(item.term)+'" placeholder="Term"/><textarea id="edit-desc-'+id+'" placeholder="Description">'+escH(item.description)+'</textarea><div class="edit-form-actions"><button class="btn-confirm" onclick="confirmEdit('+id+')">Save</button><button class="btn-cancel" onclick="render()">Cancel</button></div></div>';document.getElementById('edit-term-'+id).focus();}
function confirmEdit(id){const tm=document.getElementById('edit-term-'+id).value.trim();const dc=document.getElementById('edit-desc-'+id).value.trim();const e=document.getElementById('edit-err-'+id);if(!tm||!dc){e.textContent=!tm?'Term cannot be empty.':'Description cannot be empty.';e.style.display='block';return;}if(tm.length>500){e.textContent='Term must be 500 characters or fewer.';e.style.display='block';return;}if(dc.length>5000){e.textContent='Description must be 5000 characters or fewer.';e.style.display='block';return;}const idx=terms.findIndex(t=>t.id===id);if(idx>=0){terms[idx].term=tm;terms[idx].description=dc;}saveData();render();toast('Changes saved');}
function openDelDialog(id){pendingDeleteId=id;const it=terms.find(t=>t.id===id);document.getElementById('del-term-name').textContent=it?it.term:'';document.getElementById('del-overlay').classList.add('open');}
function closeDelDialog(){pendingDeleteId=null;document.getElementById('del-overlay').classList.remove('open');}
function confirmDelete(){if(pendingDeleteId==null)return;terms=terms.filter(t=>t.id!==pendingDeleteId);saveData();closeDelDialog();render();toast('Term deleted');}
function saveFile(){
  // Build a clean copy of this file: same page, updated word list, nothing left
  // open or half-edited. The list is swapped by element id, never by searching text.
  const copy=document.documentElement.cloneNode(true);
  copy.querySelector('#lgp-data').textContent=jsonForHtml({id:DATA.id,terms:terms.map(({term,description})=>({term,description}))});
  ['glossary-root','alpha-nav'].forEach(function(id){var n=copy.querySelector('#'+id);if(n)n.innerHTML='';});
  copy.querySelectorAll('.open,.show,.flash').forEach(function(n){n.classList.remove('open','show','flash');});
  const upd='<!DOCTYPE html>'+'\\n'+copy.outerHTML;
  const blob=new Blob([upd],{type:'text/html'});const url=URL.createObjectURL(blob);const a=document.createElement('a');
  var d=new Date();a.href=url;a.download='my-glossary-'+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'.html';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  const btn=document.getElementById('save-btn');btn.classList.add('flash');setTimeout(()=>btn.classList.remove('flash'),1500);toast('Updated file downloaded');
}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200);}
loadData();render();
document.getElementById('del-overlay').addEventListener('click',function(e){if(e.target===this)closeDelDialog();});
document.getElementById('add-term').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('add-desc').focus();});
document.getElementById('add-desc').addEventListener('keydown',function(e){if(e.key==='Enter'&&e.ctrlKey)confirmAdd();});
<\/script>
</body>
</html>`;
}

// onClear: wipes the word list and returns to the start (the "Clear my data" button).
function StepExport({ terms, onBack, onClear }) {
  const [theme, setTheme]           = useState({ ...THEMES[0] });
  const [custom, setCustom]         = useState({ ...THEMES[0] });
  const [activePreset, setPreset]   = useState(0);
  const [generating, setGenerating] = useState(false);
  const [htmlReady, setHtmlReady]   = useState(null);
  const [filterLetter, setFilter]   = useState(null);

  const applyPreset = (i) => { setTheme({ ...THEMES[i] }); setCustom({ ...THEMES[i] }); setPreset(i); setHtmlReady(null); };
  const updateColor = (key, val) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(val)) return;
    const u = { ...custom, [key]:val }; setCustom(u); setTheme(u); setPreset(-1); setHtmlReady(null);
  };

  const [activeFormat, setFmt]  = useState("glossary");
  const [readyLabel,   setRLbl] = useState("Glossary");

  // Worksheet options shown under the format cards. They're all kept in ONE
  // object so adding a new option only means: add a default here, add an
  // input below, and read it in src/worksheets/generators.js.
  const [wsOpts, setWsOpts] = useState({
    topic: "",          // optional line above the title, e.g. "Unit 3 Science"
    bingoCards: 10,     // Bingo: how many different cards (1–40)
    versions: 1,        // Quiz: 1–4 versions (A, B, C, D) with shuffled order
    wsLevel: "medium",  // Word search: "easy" | "medium" | "hard"
    frayerPerPage: 2,   // Frayer model: 1 or 2 per page
    footerText: "",     // all formats: teacher's own footer, e.g. "© Ms. Rivera 2026"
    credit: true,       // all formats: include "Made with Live Glossary Pro"
  });
  // Change one option. Clearing htmlReady hides the old preview, so nobody
  // downloads a file that doesn't match the options on screen.
  const setOpt = (key, value) => { setWsOpts(o => ({ ...o, [key]: value })); setHtmlReady(null); };
  const [genError,   setGenError]   = useState(null);

  // ── Building files ─────────────────────────────────────────────────────
  // buildFile(id) returns the finished HTML text for one format, using the
  // current colors, word list and options. Shared by Generate and Download all.
  const buildFile = async (formatId) => {
    const t    = sanitizeTheme(theme);
    // Clean copy of the word list, with length limits so a huge cell can't break a page.
    const data = terms.map(({ term, description, icon }) => ({
      term:        String(term       ||'').slice(0, 500),
      description: String(description||'').slice(0, 5000),
      icon:        icon ? String(icon).slice(0, 40) : undefined,
    })).filter(d => d.term && d.description);
    if (formatId === "glossary") return mkGlossary(t, data, wsOpts);
    // Printable worksheets live in src/worksheets/. import() loads that code
    // only the first time it's needed, so the app itself starts faster.
    const { buildWorksheet } = await import("./worksheets/index.js");
    return buildWorksheet(formatId, t, data, wsOpts);
  };

  // Today's date as "2026-10-22" in the teacher's own time zone.
  // (toISOString() would use UTC, which is already "tomorrow" on a US evening.)
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Hand a Blob to the browser as a download with the given file name.
  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // "Generate" button: build the selected format and show the preview.
  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const html = await buildFile(activeFormat);
      setRLbl(formatById(activeFormat).label);
      setHtmlReady(html);
    } catch (err) {
      console.error(err);
      setGenError("Something went wrong building that file. Please try again — if it keeps happening, try a different format.");
    }
    setGenerating(false);
  };

  // "Download" button: save the previewed file. The preview stays open, so the
  // teacher can download it again or switch to another format straight away.
  const download = () => {
    if (!htmlReady) return;
    saveBlob(new Blob([htmlReady], { type:"text/html" }), `${formatById(activeFormat).slug}-${today()}.html`);
  };

  // "Download all formats" button: build every format and pack them into one .zip.
  // zipProgress holds e.g. "3 / 8" while it works, so the button can show progress.
  const [zipProgress, setZipProgress] = useState(null);
  const downloadAll = async () => {
    setGenError(null);
    try {
      const { makeZip } = await import("./zip.js");
      // Folder name inside the zip, e.g. "unit-3-science-2026-10-22"
      const folder = `${(wsOpts.topic || "vocabulary").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vocabulary"}-${today()}`;
      const files = [];
      for (let i = 0; i < FORMATS.length; i++) {
        const f = FORMATS[i];
        setZipProgress(`${i + 1} / ${FORMATS.length}`);
        await new Promise(r => setTimeout(r, 0));          // let the screen update between files
        files.push({ name: `${folder}/${String(i + 1).padStart(2, "0")}-${f.slug}.html`, content: await buildFile(f.id) });
      }
      files.push({ name: `${folder}/README.txt`, content: ZIP_README });
      saveBlob(await makeZip(files), `${folder}.zip`);
    } catch (err) {
      console.error(err);
      setGenError("Couldn't build the ZIP. Please try again, or download formats one at a time.");
    }
    setZipProgress(null);
  };

  return (
    <div className="main" id="step3-top">
      <div className="section-title">Choose Style & Download</div>
      <p className="section-sub">{terms.length} terms ready. Pick a color scheme, preview live, then download your glossary.</p>

      {/* PRIVACY NOTE
          The word list only ever lives in this browser tab's memory: it is never
          uploaded or saved. (This replaced the old 30-minute countdown, which
          rushed teachers without adding any real protection.) */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10,
        padding:"12px 18px", borderRadius:10, marginBottom:20, background:"#E8F5EE", border:"1.5px solid #2D7A4F22" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🔒</span>
          <div style={{ fontSize:13, color:"#2D4A3A" }}>
            <strong>Your word list stays on this device.</strong> Nothing is uploaded or stored —
            it disappears when you close this tab. Take your time.
          </div>
        </div>
        <button className="btn btn-ghost" style={{ padding:"7px 14px", fontSize:13, background:"#fff" }} onClick={onClear}>
          Clear my data &amp; start over
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><span className="stat-box-num">{terms.length}</span><span className="stat-box-label">Terms</span></div>
        <div className="stat-box"><span className="stat-box-num">{new Set(terms.map(t => t.term[0].toUpperCase())).size}</span><span className="stat-box-label">Letters</span></div>
        <div className="stat-box"><span className="stat-box-num">{FORMATS.length}</span><span className="stat-box-label">Formats</span></div>
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <a href="#section-choose-format"
          style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 16px",
            background:"var(--accent)", color:"var(--dark)", borderRadius:8,
            fontWeight:700, fontSize:13, textDecoration:"none", boxShadow:"0 2px 8px rgba(0,0,0,.1)" }}>
          ⬇ Skip to: Choose Format &amp; Download
        </a>
        <a href="#section-how-it-works"
          style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 16px",
            background:"var(--white)", color:"var(--dark)", borderRadius:8,
            fontWeight:700, fontSize:13, textDecoration:"none", border:"1.5px solid #E0E0D8",
            boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
          📘 How the Downloaded File Works
        </a>
      </div>

      {/* COLOR PICKER */}
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

      {/* YOUR DATA PREVIEW */}
      <div className="form-card">
        <h3>📖 Your Glossary Preview</h3>
        <p style={{ fontSize:13, color:"var(--mid)", marginBottom:16 }}>Showing your uploaded data. Scroll through or filter by letter before downloading.</p>
        <GlossaryView terms={terms} filterLetter={filterLetter} setFilterLetter={setFilter} searchQ="" />
      </div>

      {/* HOW YOUR DOWNLOADED FILE WORKS */}
      <div className="form-card" style={{ background:"#FAFAF7", border:"1.5px solid #E8E8E0" }}>
        <h3 id="section-how-it-works" style={{ marginBottom:16 }}>📘 How Your Downloaded Glossary File Works</h3>
        <p style={{ fontSize:13, color:"#444", lineHeight:1.7, marginBottom:16 }}>
          When you download your glossary, you get a <strong>single self-contained HTML file</strong> that works
          in any browser — no internet connection, no account, no server needed.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12, marginBottom:20 }}>
          {[
            ["＋ Add","#DAD80A","#000","Add new terms","Click + Add Term in the header. Type the term and its description, then click Add Term. The new entry appears immediately, sorted into the right alphabetical section.","💾 Saved automatically to your browser. If you close and reopen the file in the same browser, your new term will still be there."],
            ["✏ Edit","#E3F2FD","#1565C0","Edit any term","Hover over any term card — an Edit button appears in the top-right corner. Click it and the card turns into an editable form. Change what you need, then click Save Changes.","💾 Saved automatically the moment you click Save."],
            ["✕ Delete","#FDECEA","#C0392B","Remove a term","Hover a card and click Delete. A confirmation box appears so you can't delete by accident.","⚠️ Permanent in this browser. Use Download Updated File beforehand if you want a backup."],
            ["🔍 Search","#F3E5F5","#7B1FA2","Find anything fast","Type in the search bar to instantly filter all terms and descriptions. Matching text is highlighted. Press Escape or click ✕ to clear.","🔎 Search doesn't affect your saved data — it's a view filter only."],
          ].map(([badge, bg, color, title, body, note], i) => (
            <div key={i} style={{ background:"#fff", border:"1.5px solid #E0E0D8", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ background:bg, border:`1px solid ${color}`, borderRadius:4, padding:"2px 8px", fontSize:13, color }}>{badge}</span>
                <span>{title}</span>
              </div>
              <p style={{ fontSize:13, color:"#555", lineHeight:1.65 }}>{body}</p>
              <p style={{ fontSize:12, color:"#888", marginTop:8, borderTop:"1px solid #f0f0e8", paddingTop:8 }}>{note}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"#1A1A1A", borderRadius:10, padding:"16px 20px", color:"#fff" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:8, color:"#DAD80A", display:"flex", alignItems:"center", gap:8 }}>
            ⬇ Download Updated File — How to keep and share your changes
          </div>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.75)", lineHeight:1.7, marginBottom:10 }}>
            All adds, edits, and deletes are saved in <strong style={{ color:"#DAD80A" }}>this browser on this device</strong> only.
            To <strong style={{ color:"#DAD80A" }}>bake your changes into the file permanently</strong>, click
            <strong style={{ color:"#DAD80A" }}> ⬇ Download Updated File</strong> in the glossary header.
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

      {/* FORMAT SELECTOR + GENERATE */}
      <div className="form-card">
        <h3 id="section-choose-format">⬇ Choose Format & Download</h3>
        <p style={{ fontSize:14, color:"var(--mid)", marginBottom:18 }}>
          Every format is a <strong>self-contained HTML file</strong> — print-ready, opens in any browser, no internet needed.
          Your data is <strong>never stored on our servers</strong>.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))", gap:10, marginBottom:20 }}>
          {FORMATS.map(f => (
            <div key={f.id}
              onClick={() => { setFmt(f.id); setHtmlReady(null); }}
              style={{ padding:"14px 15px", borderRadius:10, cursor:"pointer", transition:"all .15s",
                border:`2px solid ${activeFormat===f.id ? "var(--accent)" : "#E0E0D8"}`,
                background: activeFormat===f.id ? "var(--accent-pale)" : "#fff",
                boxShadow: activeFormat===f.id ? "0 2px 12px rgba(0,0,0,.09)" : "none" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{f.icon}</div>
              <div style={{ fontWeight:700, fontSize:14, color:"var(--dark)", marginBottom:3 }}>{f.label}</div>
              <div style={{ fontSize:12, color:"var(--mid)", lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {activeFormat !== "glossary" && (
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end", marginBottom:16 }}>
            <label style={{ flex:"1 1 260px" }}>
              <span className="form-label">Worksheet topic (optional)</span>
              <input value={wsOpts.topic} maxLength={60} onChange={e => setOpt("topic", e.target.value)}
                placeholder="e.g. Unit 3 Science Vocabulary"
                style={{ width:"100%", padding:"9px 14px", border:"1.5px solid #E0E0DA", borderRadius:"var(--r)", fontFamily:"'DM Sans',sans-serif", fontSize:14 }} />
            </label>
            {activeFormat === "bingo" && (
              <label>
                <span className="form-label">Bingo cards</span>
                <input type="number" min={1} max={40} value={wsOpts.bingoCards}
                  onChange={e => setOpt("bingoCards", Math.max(1, Math.min(40, parseInt(e.target.value, 10) || 1)))}
                  style={{ width:90, padding:"9px 12px", border:"1.5px solid #E0E0DA", borderRadius:"var(--r)", fontSize:14 }} />
              </label>
            )}
            {activeFormat === "wordsearch" && (
              <label>
                <span className="form-label">Difficulty</span>
                <select className="form-select" value={wsOpts.wsLevel} onChange={e => setOpt("wsLevel", e.target.value)}>
                  <option value="easy">Easy — across &amp; down</option>
                  <option value="medium">Medium — adds diagonals</option>
                  <option value="hard">Challenge — adds backwards</option>
                </select>
              </label>
            )}
            {activeFormat === "frayer" && (
              <label>
                <span className="form-label">Per page</span>
                <select className="form-select" value={wsOpts.frayerPerPage} onChange={e => setOpt("frayerPerPage", +e.target.value)}>
                  <option value={1}>1 per page — more writing room</option>
                  <option value={2}>2 per page — saves paper</option>
                </select>
              </label>
            )}
            {activeFormat === "quiz" && (
              <label>
                <span className="form-label">Versions</span>
                {/* Same questions in a different order per version – stops copying */}
                <select className="form-select" value={wsOpts.versions} onChange={e => setOpt("versions", +e.target.value)}>
                  <option value={1}>1 version</option>
                  <option value={2}>2 versions (A, B)</option>
                  <option value={3}>3 versions (A–C)</option>
                  <option value={4}>4 versions (A–D)</option>
                </select>
              </label>
            )}
          </div>
        )}

        {/* Footer options – apply to every format, including the Glossary */}
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end", marginBottom:16 }}>
          <label style={{ flex:"1 1 260px" }}>
            <span className="form-label">Your footer text (optional)</span>
            <input value={wsOpts.footerText} maxLength={80} onChange={e => setOpt("footerText", e.target.value)}
              placeholder="e.g. © Ms. Rivera 2026 · Room 12"
              style={{ width:"100%", padding:"9px 14px", border:"1.5px solid #E0E0DA", borderRadius:"var(--r)", fontFamily:"'DM Sans',sans-serif", fontSize:14 }} />
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, paddingBottom:10, cursor:"pointer" }}>
            <input type="checkbox" checked={wsOpts.credit} onChange={e => setOpt("credit", e.target.checked)} />
            Include “Made with Live Glossary Pro”
          </label>
        </div>

        {activeFormat === "bingo" && terms.length < 24 && (
          <div style={{ padding:"10px 14px", borderRadius:8, marginBottom:14,
            background:"#FFF8E1", border:"1.5px solid #FFB30044", fontSize:13, color:"#7A5200" }}>
            ⚠️ A full 5×5 bingo card needs 24+ terms ({terms.length} loaded). {terms.length >= 16 ? "Cards will be 4×4." : terms.length >= 8 ? "Cards will be 3×3." : "Add at least 8 terms to make bingo cards."}
          </div>
        )}

        {genError && <Alert type="error">{genError}</Alert>}


        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn btn-primary" onClick={generate} disabled={generating}>
            {generating ? <><Spinner/> Generating…</> : `⚙ Generate ${formatById(activeFormat).icon} ${formatById(activeFormat).label}`}
          </button>
          {htmlReady && <button className="btn btn-secondary" onClick={download}>⬇ Download {readyLabel}</button>}
          <button className="btn btn-ghost" onClick={downloadAll} disabled={!!zipProgress || generating}
            title="Every format with your current colors and options, in one .zip">
            {zipProgress ? <><Spinner/> Building {zipProgress}…</> : `📦 Download all ${FORMATS.length} formats (.zip)`}
          </button>
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        </div>

        {htmlReady && (
          <div className="fade-in" style={{ marginTop:14 }}>
            <Alert type="success">✓ {readyLabel} ready — {Math.round(htmlReady.length / 1024)} KB · {terms.length} terms. Check the preview below, then download.</Alert>
            {/* Live preview of the exact file that will be downloaded */}
            <PreviewFrame html={htmlReady} label={readyLabel} />
          </div>
        )}
      </div>

      <div style={{ textAlign:"center", padding:"10px 0 28px" }}>
        <a href="#step3-top"
          style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px",
            background:"var(--white)", color:"var(--mid)", borderRadius:8,
            fontWeight:600, fontSize:13, textDecoration:"none",
            border:"1.5px solid #E0E0D8", boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          ↑ Back to Top
        </a>
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
  const [step, setStep]     = useState(1);
  const [file, setFile]     = useState(null);
  const [terms, setTerms]   = useState(null);
  const [theme]             = useState(THEMES[0]);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "lgp-styles";
    el.textContent = buildStyles(theme);
    document.head.appendChild(el);
    return () => { const s = document.getElementById("lgp-styles"); if (s) s.remove(); };
  }, []);

  const handleUpload = (f) => { setTerms(null); setFile(f); setStep(2); window.scrollTo(0, 0); };
  const handleProcessed = (rows) => { setTerms(rows); setStep(3); window.scrollTo(0, 0); };
  const handleBack = () => {
    if (step === 3) { setTerms(null); setStep(2); window.scrollTo(0,0); }
    else { setFile(null); setTerms(null); setStep(1); window.scrollTo(0,0); }
  };

  // "Clear my data & start over": forget the file and word list, back to step 1.
  const handleClear = () => {
    setFile(null); setTerms(null); setStep(1); window.scrollTo(0,0);
  };

  return (
    <div className="app">
      <nav className="topbar">
        <div className="topbar-brand" onClick={() => { setStep(1); setFile(null); setTerms(null); window.scrollTo(0,0); }}>
          <img src={`data:image/png;base64,${LOGO_B64}`} alt="logo" style={{ width:32, height:32, borderRadius:5 }} />
          <span className="brand-name">Live Glossary<span> Pro</span></span>
        </div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>
          CSV → Beautiful HTML Glossary
        </div>
      </nav>

      <StepBar step={step} />

      {step === 1 && <StepLanding onUpload={handleUpload} />}
      {step === 2 && <StepProcess file={file} onDone={handleProcessed} onBack={() => handleBack()} />}
      {step === 3 && <StepTerms terms={terms} onBack={() => handleBack()} onClear={handleClear} />}

      <div className="footer">
        <strong>Live Glossary Pro</strong> · Upload CSV · Style · Download · No data stored
        <span style={{ opacity:.5, marginLeft:12 }}>v{APP_VERSION}</span>
      </div>
    </div>
  );
}

// alias so JSX resolves
const StepTerms = StepExport;
