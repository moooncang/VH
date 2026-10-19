"""Score each collected text box: clipping flags from the browser, plus contrast measured against
the pixels actually painted around the glyphs in the screenshot (a ring just outside the text box,
which is what the eye compares the letters to). Prints the problems grouped by element."""
import json, re, sys
from collections import defaultdict
from PIL import Image
import numpy as np

OUT = sys.argv[1]
MIN_RATIO = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
import glob
data = [x for f in sorted(glob.glob(f'{OUT}/collect-*.json')) for x in json.load(open(f))]


def lum(rgb):
    c = np.asarray(rgb, dtype=float) / 255
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


problems = defaultdict(list)
for scene in data:
    im = np.asarray(Image.open(scene['shot']).convert('RGB'))
    H, W = im.shape[:2]
    for it in scene['items']:
        r = it['r']
        key = f"{it['cls'] or it['tag']}"
        tag = f"{scene['scene']}@{scene['w']}"
        for iss in it['issues']:
            problems[(key, iss)].append((tag, it['text']))
        if it['fs'] < 11.5:
            problems[(key, f"tiny {it['fs']:.1f}px")].append((tag, it['text']))
        m = re.match(r'rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?', it['color'])
        if not m:
            continue
        col = [float(m.group(i)) for i in (1, 2, 3)]
        x0, x1 = int(r['left']), int(r['right'])
        y0, y1 = int(r['top'] + (it['sy'] if scene['full'] else 0)), int(r['bottom'] + (it['sy'] if scene['full'] else 0))
        if x1 <= x0 or y1 <= y0 or x0 >= W or y0 >= H or x1 < 0 or y1 < 0:
            continue
        # background = pixels inside the box that are far from the text colour (gaps between glyphs), else a ring outside
        box = im[max(0, y0):min(H, y1), max(0, x0):min(W, x1)].reshape(-1, 3).astype(float)
        far = box[np.abs(box - col).sum(1) > 90]
        if len(far) < 20:
            pad = 4
            ring = np.concatenate([im[max(0, y0 - pad):max(0, y0), max(0, x0):min(W, x1)].reshape(-1, 3), im[min(H, y1):min(H, y1 + pad), max(0, x0):min(W, x1)].reshape(-1, 3)])
            far = ring.astype(float)
        if not len(far):
            continue
        bl = lum(far)
        tl = float(lum(np.array(col)))
        # judge against the worst 15% of the background behind the letters (busy art)
        worst = np.percentile(bl, 85) if tl < bl.mean() else np.percentile(bl, 15) if tl > bl.mean() else bl.mean()
        cr = ratio(tl, float(np.median(bl)))
        crw = ratio(tl, float(worst))
        need = MIN_RATIO if (it['fs'] >= 18 or (it['fs'] >= 14 and int(it['fw']) >= 700)) else 4.5
        if cr < need or crw < need * 0.7:
            problems[(key, 'contrast')].append((tag, f"{it['text']} | {cr:.1f}/{crw:.1f} fs{it['fs']:.0f}"))

# texts drawn on top of each other
for scene in data:
    its = scene['items']
    for i in range(len(its)):
        a = its[i]['r']
        for j in range(i + 1, len(its)):
            b = its[j]['r']
            ix = min(a['right'], b['right']) - max(a['left'], b['left'])
            iy = min(a['bottom'], b['bottom']) - max(a['top'], b['top'])
            if ix <= 2 or iy <= 2:
                continue
            small = min((a['right'] - a['left']) * (a['bottom'] - a['top']), (b['right'] - b['left']) * (b['bottom'] - b['top']))
            if small and ix * iy / small > 0.35 and iy > 6:
                k = (its[i]['cls'] or its[i]['tag']) + ' x ' + (its[j]['cls'] or its[j]['tag'])
                problems[(k[:44], 'overlap')].append((f"{scene['scene']}@{scene['w']}", its[i]['text'][:30] + ' / ' + its[j]['text'][:30]))

for (key, iss), hits in sorted(problems.items(), key=lambda kv: (-len(kv[1]), kv[0])):
    scenes = sorted({h[0].split('@')[0] for h in hits})
    widths = sorted({int(h[0].split('@')[1]) for h in hits})
    print(f"[{len(hits):3d}] {iss:28s} {key[:44]:44s} widths={widths} scenes={','.join(scenes)[:70]}")
    for h in hits[:2]:
        print('        ', h[0], '|', h[1][:80])
