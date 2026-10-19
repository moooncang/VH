// Usage: node collect.js <out-dir> <WIDTHxHEIGHT>  (site served at http://localhost:8766/). See README.md.
// Collect every visible text box on every page/state/width, plus a screenshot to measure contrast against.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const OUT = process.argv[2];
const WIDTHS = (process.argv[3] || '1440x900,1280x800,1024x768,768x1024,390x844,360x740').split(',').map(s => s.split('x').map(Number));
const BASE = 'http://localhost:8766/';

const SCENES = [
  ['index', 'index.html'], ['home', 'home.html'], ['characters', 'characters.html'],
  ...[0, 1, 2, 3, 4].map(i => [`cast${i}`, 'characters.html', async p => { await p.evaluate(i => document.querySelector(`[data-cast="${i}"]`).click(), i); await p.waitForTimeout(1500); }]),
  ...['reina', 'ner', 'serpina', 'ivrea', 'kasha'].map(c => [`chart-${c}`, `char/${c}.html`]),
  ['rules', 'rules.html'], ['treatment', 'treatment.html'],
  ['treatment-open', 'treatment.html', async p => { await p.evaluate(() => document.querySelector('#draw-curtain').click()); await p.waitForTimeout(3200); }],
  ...[0, 1, 2, 3, 4, 5].map(i => [`city${i}`, 'city.html', async p => { if (i) { await p.evaluate(i => document.querySelector(`.place-index [data-place="${i}"]`).click(), i); await p.waitForTimeout(1500); } }]),
  ['start', 'start.html'],
  ['start-free', 'start.html', async p => { await p.evaluate(() => document.querySelector('[data-mode="free"]').click()); await p.waitForTimeout(900); }],
  ['menu', 'home.html', async p => { await p.evaluate(() => document.querySelector('#menu-open').click()); await p.waitForTimeout(1500); }],
  ['rumor', 'home.html', async p => { await p.evaluate(() => document.querySelector('#bell').click()); await p.waitForTimeout(1300); }],
];

function collect() {
  const vw = innerWidth, out = [];
  const visible = el => { const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const openDialog = document.querySelector('dialog[open]');
  for (const el of document.querySelectorAll('body *')) {
    if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    if (!own) continue;
    if (openDialog && !openDialog.contains(el)) continue;
    if (el.closest('[hidden],.sr-only,.skip-link,.marquee')) continue;
    // every ancestor must be visible too (opacity chains)
    let ok = true, op = 1;
    for (let a = el; a && a !== document.body; a = a.parentElement) { if (!visible(a)) { ok = false; break; } op *= +getComputedStyle(a).opacity; }
    if (!ok || op < 0.3) continue;
    const rects = [];
    for (const n of el.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const range = document.createRange(); range.selectNodeContents(n); rects.push(...[...range.getClientRects()].filter(r => r.width > 1 && r.height > 1)); }
    if (!rects.length) continue;
    const r = { left: Math.min(...rects.map(x => x.left)), top: Math.min(...rects.map(x => x.top)), right: Math.max(...rects.map(x => x.right)), bottom: Math.max(...rects.map(x => x.bottom)) };
    const cs = getComputedStyle(el);
    const issues = [];
    // clipped by itself
    if (/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY + cs.textOverflow)) {
      if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible') issues.push('self-clip-x');
      if (el.scrollHeight > el.clientHeight + 2 && cs.overflowY !== 'visible' && !/auto|scroll/.test(cs.overflowY)) issues.push('self-clip-y');
    }
    // clipped by an ancestor
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const acs = getComputedStyle(a);
      if (/auto|scroll/.test(acs.overflowX)) break; // scroll containers are fine
      if (acs.overflowX !== 'visible' || acs.overflowY !== 'visible' || acs.clipPath !== 'none') {
        const ar = a.getBoundingClientRect();
        if (r.left < ar.left - 1 || r.right > ar.right + 1 || r.top < ar.top - 1 || r.bottom > ar.bottom + 1) { issues.push('ancestor-clip:' + (a.id || a.className.toString().split(' ')[0] || a.tagName)); break; }
      }
    }
    // text must stay inside the painted window of its art card
    const BOX='.place-body,.k-cell,.k-name,.k-head,.karte-note,.pick-text,.pager-text,.dir-nav a,.mode,.voice-card,.booth,.prologue,.price-board,.ledger,.oil-card,.progress-chain li,.desk-status div,.note-body,.room-text,.react-grid li,.btn,.tag,.pin-label,.rel-name,.ost-meta,.expr-chips button,.place-index button,.facing button,.guide-toc a,.cast-pick';
    const box=el.closest(BOX);
    if(box&&box!==el){const br=box.getBoundingClientRect();if(r.left<br.left-1||r.right>br.right+1||r.top<br.top-1||r.bottom>br.bottom+1)issues.push('outside-box:'+box.className.toString().split(' ')[0]);}
    else if(box===el&&(el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2))issues.push('overflow-box:'+el.className.toString().split(' ')[0]);
    // off screen sideways (not in a horizontal scroller)
    let inScroller = false; for (let a = el.parentElement; a; a = a.parentElement) { const s = getComputedStyle(a).overflowX; if (/auto|scroll/.test(s) && a.scrollWidth > a.clientWidth) { inScroller = true; break; } }
    if (!inScroller && (r.left < -1 || r.right > vw + 1)) issues.push('offscreen');
    out.push({ text: own.slice(0, 60), tag: el.tagName, cls: (el.id ? '#' + el.id + ' ' : '') + (el.className.toString() || ('<' + el.parentElement.className.toString().split(' ')[0] + '>')).slice(0, 50), r, fs: parseFloat(cs.fontSize), fw: cs.fontWeight, color: cs.color, shadow: cs.textShadow !== 'none', issues, sy: scrollY });
  }
  return out;
}

(async () => {
  const b = await chromium.launch();
  const all = [];
  for (const [w, h] of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { sessionStorage.setItem('vh-adult', 'yes'); localStorage.setItem('vh-sound', 'off'); });
    const p = await ctx.newPage();
    for (const [name, url, act] of SCENES) {
      await p.goto(BASE + url, { waitUntil: 'load' });
      await p.waitForTimeout(700);
      if (act) await act(p);
      // reveal everything, then measure from the top of a full-page shot
      await p.evaluate(() => document.querySelectorAll('.reveal').forEach(x => x.classList.add('in')));
      await p.waitForTimeout(250);
      const full = !['menu', 'rumor'].includes(name);
      const shot = `${OUT}/${name}-${w}.png`;
      await p.evaluate(() => scrollTo(0, 0));
      await p.screenshot({ path: shot, fullPage: full });
      const items = await p.evaluate(collect);
      all.push({ scene: name, w, h, shot, full, items });
    }
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/collect-${WIDTHS[0][0]}.json`, JSON.stringify(all));
  await b.close();
  console.log('scenes', all.length);
})();
