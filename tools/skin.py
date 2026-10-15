"""Convert delivered UI art (design/incoming/*.png) into site-ready WebP files in assets/skin/.

Each entry: output name -> (source png, crop box or None, max width).
Crop boxes trim the empty margin around thin strips and plates so CSS can size them directly.
State pairs share one crop box so they stay aligned when cross-faded.
Run: python tools/skin.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'design/incoming'
OUT = ROOT / 'assets/skin'

SPEC = {
    # controls
    'btn-primary': ('btn-primary-idle', (17, 44, 704, 141), 687),
    'btn-secondary': ('btn-secondary-idle', (30, 40, 570, 113), 540),
    'btn-round': ('btn-round-idle', (4, 3, 188, 186), 128),
    'chip': ('chip-idle', (7, 18, 344, 84), 337),
    'chip-on': ('chip-active', (7, 18, 344, 84), 337),
    'field': ('field-idle', (1, 19, 800, 86), 800),
    'field-on': ('field-focus', (1, 19, 800, 86), 800),
    'field-area': ('field-area-idle', (5, 28, 794, 242), 789),
    'field-area-on': ('field-area-focus', (5, 28, 794, 242), 789),
    'divider': ('divider', (0, 18, 1600, 28), 1600),
    'medal-num': ('chapter-medal', None, 96),
    'tag': ('tag-blank', (7, 10, 213, 56), 206),
    'tag-reserved': ('tag-reserved', (4, 11, 157, 55), 153),
    # icons
    **{f'i-{n}': (f'icon-{n}', None, 64) for n in ['arrow-right', 'arrow-left', 'arrow-down', 'close', 'zoom', 'sound-on', 'sound-off', 'menu', 'bell', 'plus']},
    **{f'room-{n}': (f'room-{n}', None, 256) for n in ['ledger', 'portrait', 'bottle', 'curtain', 'gate', 'key']},
    # brand, entrance
    'logo': ('logo-veilhaun-large', (63, 89, 1556, 399), 1200),
    'logo-small': ('logo-veilhaun-small', (25, 26, 529, 105), 504),
    'sign-open': ('sign-open', None, 300),
    'bell': ('bell-idle', None, 200),
    'bell-ring': ('bell-ring', None, 200),
    'badge-19': ('badge-19', None, 96),
    'lamp': ('lamp-on', (29, 6, 99, 122), 70),
    # menu and dialogs
    'menu-backdrop': ('menu-backdrop', None, 2400),
    'menu-card': ('menu-card-idle', None, 840),
    'rumor-note': ('rumor-note', None, 1120),
    # home
    'desk-status': ('desk-status', (1, 57, 2558, 133), 2557),
    'ribbon': ('rumor-ribbon', (0, 41, 1600, 55), 1600),
    'frame-tall': ('room-frame-tall', None, 1000),
    'frame-wide': ('room-frame-wide', None, 760),
    'menu-board': ('menu-board-titled', None, 1440),
    'ledger': ('ledger-page', None, 1200),
    'stamp': ('rep-stamped', None, 120),
    'partition': ('partition', None, 2000),
    'partition-shadow': ('partition-shadow', None, 400),
    # characters and chart
    'pick': ('pick-idle', None, 560),
    'pick-on': ('pick-active', None, 560),
    'medal': ('medal-idle', None, 220),
    'name-ribbon': ('name-ribbon', None, 260),
    'karte': ('karte-sheet', None, 1000),
    'seal-staff': ('seal-staff', None, 200),
    'seal-guest': ('seal-guest', None, 200),
    'viewer-frame': ('viewer-frame', None, 1840),
    'thumb': ('thumb-idle', None, 220),
    'thumb-on': ('thumb-active', None, 220),
    'body-front': ('body-front', None, 600),
    'body-back': ('body-back', None, 600),
    'knot': ('knot-mark', None, 72),
    'knot-sensitive': ('knot-sensitive', None, 72),
    'step-locked': ('step-locked', None, 112),
    'step-open': ('step-open', None, 112),
    'rel-locked': ('relation-locked', None, 112),
    'react-card': ('react-card', None, 640),
    'voice-card': ('voice-card', None, 760),
    'pager-card': ('pager-card', None, 1300),
    # guide
    'toc': ('toc-active', (2, 17, 478, 100), 476),
    'progress-1': ('progress-1', None, 520),
    'progress-2': ('progress-2', None, 520),
    'progress-3': ('progress-3', None, 520),
    'progress-4': ('progress-4', None, 520),
    'depth-surface': ('depth-surface', None, 1600),
    'depth-vessel': ('depth-vessel', None, 1600),
    'depth-core': ('depth-core', None, 1600),
    'heat-tube': ('heat-tube', (1, 47, 1799, 71), 1798),
    'heat-fill': ('heat-fill', (8, 25, 1793, 36), 1785),
    'heat-knob': ('heat-knob', (12, 10, 107, 108), 96),
    'heat-ember': ('heat-ember', None, 240),
    'oil-calm': ('oil-calm', None, 360),
    'oil-warm': ('oil-warm', None, 360),
    'oil-unknown': ('oil-unknown', None, 360),
    'shelf': ('shelf', (0, 53, 1600, 73), 1600),
    'oil-note': ('oil-note', (51, 55, 1450, 204), 1399),
    # treatment
    'curtain-left': ('curtain-left', None, 1200),
    'curtain-right': ('curtain-right', None, 1200),
    'curtain-open-left': ('curtain-open-left', None, 450),
    'curtain-open-right': ('curtain-open-right', None, 450),
    'valance': ('valance', (0, 52, 2880, 186), 2880),
    'booths': ('booths', None, 1720),
    # city
    'pin': ('pin-idle', None, 96),
    'pin-on': ('pin-active', None, 96),
    'pin-shop': ('pin-shop', None, 120),
    'label': ('place-label-idle', None, 300),
    'label-on': ('place-label-active', None, 300),
    'place-card': ('place-card', None, 940),
    # start
    'mode-opening': ('mode-opening-idle', None, 1300),
    'mode-opening-on': ('mode-opening-selected', None, 1300),
    'mode-free': ('mode-free-idle', None, 1300),
    'mode-free-on': ('mode-free-selected', None, 1300),
    'select': ('select-off', None, 64),
    'select-on': ('select-on', None, 64),
    'prologue-frame': ('prologue-frame', None, 1400),
    'sample-frame': ('sample-frame', None, 1100),
}
# Full-scene art replaces the earlier generated pictures in assets/art.
ART = {
    'key-visual': ('key-visual', 2400),
    'perfumery': ('perfumery', 2400),
    'atlas': ('atlas', 2400),
}


def save(im, dest, width, quality):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, 'WEBP', quality=quality, method=6)
    return im.size


def main():
    OUT.mkdir(exist_ok=True)
    sizes = {}
    for name, (src, box, width) in SPEC.items():
        im = Image.open(SRC / f'{src}.png')
        im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
        if box:
            im = im.crop(box)
        sizes[name] = save(im, OUT / f'{name}.webp', width, 88 if im.mode == 'RGBA' else 82)
    for name, (src, width) in ART.items():
        im = Image.open(SRC / f'{src}.png').convert('RGB')
        sizes[name] = save(im, ROOT / f'assets/art/{name}.webp', width, 80)
    print(f'Converted {len(sizes)} images.')


if __name__ == '__main__':
    main()
