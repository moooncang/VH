"""V6 page templates. Story facts, copy and image paths stay in data.py."""
from pathlib import Path
from html import escape as e
import json, re
import data as d

ROOT = Path(__file__).resolve().parents[1]
VERSION = '6'

# slug, Korean label, English label, icon
ROOMS = [
    ('home', '가게', 'Front Desk', 'ledger'),
    ('characters', '인물', 'Characters', 'portrait'),
    ('rules', '시술 안내', 'Guide', 'bottle'),
    ('treatment', '시술실', 'Treatment', 'curtain'),
    ('city', '베일하운', 'Veilhaun', 'gate'),
    ('start', '시작', 'Begin', 'key'),
]
LABELS = {slug: ko for slug, ko, en, icon in ROOMS}
CH = d.CHARACTERS


def n2(i):
    return f'{i:02d}'


def icon(name):
    paths = {
        'arrow': '<path d="M3 12h17M14 6l6 6-6 6"/>',
        'back': '<path d="M21 12H4M10 6l-6 6 6 6"/>',
        'down': '<path d="M12 4v15M6 13l6 6 6-6"/>',
        'zoom': '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
        'close': '<path d="M5 5l14 14M19 5L5 19"/>',
        'sound': '<path d="M4 9h4l5-4v14l-5-4H4z"/><path class="wave" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
        'bell': '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
        'copy': '<rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/>',
    }
    return f'<svg class="i i-{name}" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>'


def img(src, alt='', cls='', priority=False, style=''):
    load = 'fetchpriority="high" decoding="async"' if priority else 'loading="lazy" decoding="async"'
    st = f' style="{style}"' if style else ''
    return f'<img src="{e(src)}" alt="{e(alt)}" class="{cls}"{st} {load}>'


def face(ch):
    x, y = ch['face']
    return f'object-position:{x}% {y}%;--fo:{x}% {y}%'


def button(label, href=None, cls='btn', attrs='', ico='arrow'):
    tag = 'a' if href else 'button'
    href_attr = f' href="{e(href)}"' if href else ' type="button"'
    return f'<{tag} class="{cls}"{href_attr} {attrs}><span>{label}</span>{icon(ico)}</{tag}>'


def title(en, ko, kicker='', level=1, cls=''):
    k = f'<p class="kicker">{kicker}</p>' if kicker else ''
    return f'<header class="title {cls}">{k}<h{level} class="title-en">{en}</h{level}><p class="title-ko">{ko}</p></header>'


def chapter(num, en, ko):
    return f'<div class="chapter"><span class="chapter-num">{num}</span><h2 class="chapter-en">{en}</h2><span class="chapter-ko">{ko}</span></div>'


def unavailable(text):
    return f'<p class="pending"><span class="pending-dot"></span>{e(text)}</p>'


def parse_relations():
    names = {c['name']: c['slug'] for c in CH}
    out = []
    for line in d.RELATIONS:
        head, text = line.split(': ', 1)
        mutual = '↔' in head
        a, b = [x.strip() for x in re.split('↔|→', head)]
        out.append(dict(a=names[a], b=names[b], mutual=mutual, text=text, line=line))
    return out


# ------------------------------------------------------------------ pages

def entrance():
    return f'''<section class="gate">
<div class="gate-art" data-parallax>{img('assets/art/title-v5.webp', '', 'gate-img', True)}</div>
<div class="gate-shade"></div><canvas id="motes" aria-hidden="true"></canvas>
<div class="gate-copy">
<p class="kicker"><span class="age-mark">19</span>An Adult Story · Veilhaun</p>
<h1 class="wordmark"><span class="wm-small">The Backstreet Parlor</span><span class="wm-big">Veilhaun</span></h1>
<p class="gate-ko">{e(d.CONFIG['TITLE'])} · {e(d.CONFIG['SHOP_NAME'])}</p>
<p class="gate-lede">모험가 거리 안쪽 골목에 결을 손으로 푸는 가게가 있습니다. 문은 밤에도 열려 있습니다.</p>
<div class="gate-actions">{button('입장하기', cls='btn btn-gold btn-lg', attrs='id="enter"', ico='bell')}<p class="gate-note">만 19세 이상만 이용할 수 있습니다.<br>입장하면 접수 벨이 울립니다.</p></div>
</div>
<div class="shop-sign" aria-hidden="true"><i class="chain l"></i><i class="chain r"></i><div class="plate"><small>Est. Veilhaun</small><strong>Open</strong><small>After Dark</small></div></div>
<p class="gate-credit">Written by {e(d.CONFIG['AUTHOR'])}</p>
</section>'''


def home():
    reina = CH[0]
    cards = [
        ('characters', 'Characters', '인물', '직원 둘, 손님 셋', CH[0]['portrait'], face(CH[0]), 'portrait', 'wide'),
        ('rules', 'Guide', '시술 안내', '결 · 달아오름 · 향유', 'assets/art/perfumery.webp', 'object-position:50% 60%', 'bottle', ''),
        ('treatment', 'Treatment', '시술실', '두 칸, 얇은 칸막이', 'assets/art/title-v5.webp', 'object-position:70% 50%', 'curtain', ''),
        ('city', 'Veilhaun', '베일하운', '자유교역도시의 지도', 'assets/art/atlas.webp', 'object-position:50% 40%', 'gate', ''),
        ('start', 'Begin', '시작하기', '개업 · 자유모드', 'images/B/R.webp', 'object-position:55% 50%', 'key', ''),
    ]
    room_cards = ''.join(
        f'<a class="room-card {size}" href="{slug}.html"><span class="room-media">{img(src, "", "", False, pos)}</span>'
        f'<span class="room-icon">{img("assets/ui/icon-" + ic + ".webp")}</span>'
        f'<span class="room-text"><span class="room-num">{n2(i)}</span><strong class="room-en">{en}</strong><span class="room-ko">{ko}<small>{sub}</small></span></span>{icon("arrow")}</a>'
        for i, (slug, en, ko, sub, src, pos, ic, size) in enumerate(cards, 1))
    menu = ''.join(
        f'<li><span class="menu-name">{e(n)}{f"<em>{e(t)}</em>" if t else ""}</span><span class="menu-dots"></span><span class="menu-price">{e(p)}</span></li>'
        for n, p, t in d.MENUS)
    reservations = ''.join(
        f'<li><span>{e(r.get("time", ""))}</span><span>{e(r.get("name", ""))}</span><span>{e(r.get("menu", ""))}</span></li>'
        for r in d.CONFIG['RESERVATIONS'])
    ledger = f'<ol class="ledger-lines">{reservations}</ol>' if reservations else f'<p class="ledger-empty">{e(d.COPY["no_reservation"])}</p>'
    rep = ''.join(f'<li class="{"on" if i == 0 else ""}"><i></i><span>{e(x)}</span></li>' for i, x in enumerate(d.REPUTATION))
    rumors = ''.join(f'<span>{e(r)}</span><i>✦</i>' for r in d.RUMORS)
    return f'''<section class="home-hero">
<div class="home-art" data-parallax>{img('assets/art/title-v5.webp', '', '', True)}</div><div class="home-shade"></div><canvas id="motes" aria-hidden="true"></canvas>
<div class="home-hero-copy wrap">
<p class="kicker"><span class="live-dot"></span>Open tonight · {e(d.COPY['open'])}</p>
<h1 class="display">Good evening,<br>Proprietor.</h1>
<blockquote class="hero-quote"><p>“{e(reina['hook'])}”</p><cite><span class="swatch" style="--c:{reina['color']}"></span>{e(reina['name'])} · {e(reina['role'])}</cite></blockquote>
<a class="scroll-cue" href="#rooms"><span>둘러보기</span>{icon('down')}</a>
</div>
<dl class="desk-status wrap"><div><dt>예약</dt><dd>{len(d.CONFIG['RESERVATIONS'])}건</dd></div><div><dt>평판</dt><dd>{e(d.REPUTATION[0])}</dd></div><div><dt>직원</dt><dd>{sum(1 for c in CH if c['group'] == '직원')}명</dd></div><div><dt>단골 후보</dt><dd>{sum(1 for c in CH if c['group'] == '손님')}명</dd></div></dl>
</section>
<section class="rooms wrap" id="rooms" aria-label="방 안내">{room_cards}</section>
<div class="marquee" aria-label="골목 소문"><div class="marquee-track">{rumors}{rumors}</div></div>
<section class="desk wrap">
{chapter('01', 'Price Board', '시술 메뉴')}
<div class="desk-grid">
<div class="price-board reveal"><ol class="menu-list">{menu}</ol><p class="board-foot">{e(d.COPY['currency'])}</p><p class="board-hand">{e(d.COPY['menu_note'])}</p></div>
<div class="ledger reveal"><div class="ledger-head"><span>Ledger</span><span>{e(d.COPY['reservation'])}</span></div>{ledger}<h3 class="ledger-sub">{e(d.COPY['reputation'])}</h3><ol class="rep-track">{rep}</ol></div>
</div>
</section>
<section class="partition wrap reveal">
{chapter('02', 'Behind the Partition', d.COPY['partition'])}
<button class="partition-panel" id="partition" type="button" aria-describedby="voice-hint"><span class="partition-glass"></span><span class="partition-voice" id="voice" aria-live="polite"></span><span class="partition-hint" id="voice-hint">{e(d.COPY['partition_hint'])} · 누를 때마다 다른 소리</span></button>
</section>'''


def characters():
    first = CH[0]
    slides = ''.join(
        f'<figure class="cast-slide{" on" if i == 0 else ""}" data-slide="{i}">{img(c["portrait"], c["name"], "", i == 0, face(c))}</figure>'
        for i, c in enumerate(CH))
    choices = ''.join(
        f'<button class="cast-pick" type="button" data-cast="{i}" aria-pressed="{str(i == 0).lower()}" style="--c:{c["color"]}">'
        f'<span class="pick-thumb">{img(c["portrait"], "", "", False, face(c))}</span>'
        f'<span class="pick-text"><small>{n2(i + 1)} · {"Staff" if c["group"] == "직원" else "Guest"}</small><strong>{e(c["en"])}</strong><span>{e(c["name"])}</span></span></button>'
        for i, c in enumerate(CH))
    rel = parse_relations()
    pos = [(50, 12), (88, 40), (74, 88), (26, 88), (12, 40)]
    idx = {c['slug']: i for i, c in enumerate(CH)}
    edges = ''
    for k, r in enumerate(rel):
        (x1, y1), (x2, y2) = pos[idx[r['a']]], pos[idx[r['b']]]
        dx, dy = x2 - x1, y2 - y1
        k2 = 11 / (dx * dx + dy * dy) ** .5
        x1, y1, x2, y2 = [round(v, 2) for v in (x1 + dx * k2, y1 + dy * k2, x2 - dx * k2, y2 - dy * k2)]
        edges += f'<line class="rel-edge{" mutual" if r["mutual"] else ""}" data-rel="{k}" data-a="{r["a"]}" data-b="{r["b"]}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" marker-end="url(#rel-head)"/>'
    nodes = ''.join(
        f'<button class="rel-node" type="button" data-node="{c["slug"]}" style="left:{pos[i][0]}%;top:{pos[i][1]}%;--c:{c["color"]}" aria-label="{e(c["name"])} 관계 보기">'
        f'<span class="rel-face">{img(c["portrait"], "", "", False, face(c))}</span><span class="rel-name">{e(c["name"])}</span></button>'
        for i, c in enumerate(CH))
    rel_list = ''.join(
        f'<li data-rel="{k}" data-a="{r["a"]}" data-b="{r["b"]}"><span class="rel-pair">{e(r["line"].split(": ")[0])}</span><span>{e(r["text"])}</span></li>'
        for k, r in enumerate(rel))
    return f'''<section class="cast" style="--c:{first['color']}">
<div class="cast-stage" aria-hidden="true">{slides}</div><div class="cast-shade"></div>
<div class="cast-copy wrap" aria-live="polite">
<p class="kicker"><span id="cast-count">01 / 05</span><span class="dash"></span><span id="cast-group">{'Staff' if first['group'] == '직원' else 'Guest'} · {e(first['group'])}</span></p>
<h1 class="cast-en" id="cast-en">{e(first['en'])}</h1>
<p class="cast-ko"><strong id="cast-name">{e(first['name'])}</strong><span id="cast-meta">{e(first['race'])} · {first['age']}세</span></p>
<p class="cast-role" id="cast-role">{e(first['role'])}</p>
<blockquote class="cast-quote" id="cast-quote">“{e(first['hook'])}”</blockquote>
<div class="cast-actions">{button(d.COPY['chart'], 'char/' + first['slug'] + '.html', 'btn btn-gold', 'id="cast-link"')}<div class="stepper"><button type="button" data-cast-step="-1" aria-label="이전 인물">{icon('back')}</button><button type="button" data-cast-step="1" aria-label="다음 인물">{icon('arrow')}</button></div></div>
</div>
<nav class="cast-picker wrap" aria-label="인물 선택">{choices}</nav>
</section>
<section class="relations wrap">
{chapter('02', 'Relations', d.COPY['relations'])}
<div class="rel-layout">
<div class="rel-map reveal"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="rel-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs>{edges}</svg>{nodes}</div>
<ol class="rel-list reveal">{rel_list}</ol>
</div>
</section>'''


def chart(ch):
    i = CH.index(ch)
    prev_c, next_c = CH[(i - 1) % 5], CH[(i + 1) % 5]
    chips = ''.join(f'<button type="button" data-expression="{n}" aria-pressed="{str(n == 0).lower()}">{e(name)}</button>' for n, name in enumerate(d.EXPRESSIONS))
    reactions = ch['reactions'].split(' / ')
    react_vals = [ch['collapse'], reactions[0], reactions[1].split(': ', 1)[-1], reactions[2].split(': ', 1)[-1]]
    react_en = ['When it breaks', 'When stopping', 'When asking first', 'When jealous']
    react_cards = ''.join(
        f'<li><span class="react-en">{en}</span><strong>{e(d.COPY[k])}</strong><p>{e(v)}</p></li>'
        for en, k, v in zip(react_en, ['collapse', 'stop', 'ask', 'jealous'], react_vals))
    unlocked = 2 if ch['code'] == 'E' else 1
    bounds = ''.join(f'<li class="{"on" if n < unlocked else ""}"><i>{n2(n + 1)}</i><span>{e(x)}</span></li>' for n, x in enumerate(d.BOUNDARIES))
    quotes = ''.join(f'<blockquote class="voice-card reveal"><span class="voice-mark">“</span><p>{e(q)}</p></blockquote>' for q in ch['quotes'])
    rel = [r for r in parse_relations() if ch['slug'] in (r['a'], r['b'])]
    rel_items = ''.join(f'<li><span class="rel-pair">{e(r["line"].split(": ")[0])}</span><span>{e(r["text"])}</span></li>' for r in rel)
    knot_text, _, sensitive = ch['knots'].partition(' / ')
    group_en = 'Staff' if ch['group'] == '직원' else 'Guest'
    pager = ''.join(
        f'<a class="pager-card {side}" href="{c["slug"]}.html" style="--c:{c["color"]}"><span class="pager-thumb">{img("../" + c["portrait"], "", "", False, face(c))}</span>'
        f'<span class="pager-text"><small>{label}</small><strong>{e(c["en"])}</strong><span>{e(c["name"])}</span></span>{icon("back" if side == "prev" else "arrow")}</a>'
        for side, label, c in [('prev', 'Previous', prev_c), ('next', 'Next', next_c)])
    return f'''<section class="chart-hero">
<div class="chart-bg" aria-hidden="true">{img('../' + ch['portrait'], '', 'chart-bg-img', False, face(ch))}</div>
<div class="chart-top wrap"><a class="back-link" href="../characters.html">{icon('back')}<span>인물 목록</span></a><span class="kicker">Chart No. {ch['code']} · {group_en}</span></div>
<div class="chart-grid wrap">
<div class="viewer">
<div class="viewer-frame"><div class="viewer-blur" aria-hidden="true"></div>{img('../' + ch['portrait'], ch['name'], 'viewer-img', True)}
<button class="viewer-zoom" type="button" aria-label="그림 크게 보기">{icon('zoom')}</button>
<div class="viewer-nav"><button type="button" id="expr-prev" aria-label="이전 변형">{icon('back')}</button><span id="expression-title" aria-live="polite">첫등장</span><button type="button" id="expr-next" aria-label="다음 변형">{icon('arrow')}</button></div>
</div>
<nav class="expr-chips" aria-label="감정 선택">{chips}</nav>
<div class="filmstrip" id="variant-thumbs" aria-label="표정 변형"></div>
</div>
<article class="karte">
<header class="karte-head"><span>Veilhaun Back-Alley Parlor</span><span>Chart · {ch['code']}</span></header>
<div class="karte-stamp" aria-hidden="true"><span>{e(ch['group'])}</span></div>
<h1 class="karte-en">{e(ch['en'])}</h1>
<p class="karte-ko">{e(ch['name'])}</p>
<dl class="karte-fields">
<div><dt>종족</dt><dd>{e(ch['race'])}</dd></div><div><dt>나이</dt><dd>{ch['age']}</dd></div>
<div class="wide"><dt>직책</dt><dd>{e(ch['role'])}</dd></div>
<div class="wide"><dt>{e(d.COPY['knots'])}</dt><dd>{e(knot_text)}</dd></div>
{f'<div class="wide"><dt>{e(d.COPY["sensitive"])}</dt><dd>{e(sensitive.split(": ", 1)[-1])}</dd></div>' if sensitive else ''}
<div class="wide"><dt>{e(d.COPY['boundary'])}</dt><dd>{e(ch['boundary'])}</dd></div>
</dl>
<p class="karte-note">{e(ch['hook'])}</p>
</article>
</div>
</section>
<article class="record wrap" id="record">
<section class="record-block profile reveal">{chapter('01', 'Profile', '인물 기록')}<p class="profile-text">{e(ch['description'])}</p></section>
<section class="record-block reveal">{chapter('02', 'Knot Map', d.COPY['knot_map'])}
<div class="knot-layout"><div class="body-map"><div class="facing" role="group" aria-label="방향"><button type="button" data-facing="front" aria-pressed="true">{d.COPY['front']}</button><button type="button" data-facing="back" aria-pressed="false">{d.COPY['back']}</button></div>
<svg viewBox="0 0 200 300" aria-hidden="true"><circle cx="100" cy="46" r="23"/><path d="M85 70Q60 74 52 94L36 163Q37 174 47 169L68 112 70 174 59 265Q63 279 74 269L99 193 125 269Q136 277 140 265L129 174 131 112 153 169Q164 174 164 161L147 94Q137 74 115 70Z"/></svg><div id="map-dots"></div></div>
<div class="knot-side"><p class="knot-lead">{e(ch['knots'])}</p><ul class="knot-list" id="knot-list"></ul><p class="knot-legend"><span class="dot"></span>결 <span class="dot sensitive"></span>{e(d.COPY['sensitive'])}</p></div></div>
</section>
<section class="record-block reveal">{chapter('03', 'Boundary', d.COPY['boundary'])}<ol class="step-track bounds">{bounds}</ol><ul class="react-grid">{react_cards}</ul></section>
<section class="record-block">{chapter('04', 'Voice', '대사')}<div class="voice-grid">{quotes}</div></section>
<section class="record-block notes reveal">{chapter('05', 'Notes', '외형 · 말투 · 관계')}
<div class="notes-grid"><div><h3>{e(d.COPY['appearance'])}</h3><p>{e(ch['appearance'])}</p></div><div><h3>{e(d.COPY['speech'])}</h3><p>{e(ch['speech'])}</p></div><div><h3>{e(d.COPY['relations'])}</h3><ul class="rel-list compact">{rel_items}</ul></div></div>
</section>
<nav class="pager" aria-label="다른 인물">{pager}</nav>
</article>'''


def rules():
    toc = [('knots', 'The Knots', '결'), ('depth', 'Depth', d.COPY['depth']), ('heat', 'Warmth', d.COPY['heat']), ('bounds', 'Boundaries', '허용선과 관계'), ('oils', 'Perfumery', '향유')]
    toc_html = ''.join(f'<a href="#{k}" data-spy="{k}"><span>{n2(i)}</span>{en}<small>{ko}</small></a>' for i, (k, en, ko) in enumerate(toc, 1))
    progress = ''.join(f'<li><i>{n2(i)}</i><span>{e(x)}</span></li>' for i, x in enumerate(d.COPY['knots_progress'].split(' → '), 1))
    depths = ''.join(
        f'<button type="button" class="stratum s{i}" data-depth="{i}" aria-pressed="{str(i == 0).lower()}"><span class="stratum-num">{n2(i + 1)}</span><strong>{e(n)}</strong><span class="stratum-text">{e(t)}</span></button>'
        for i, (n, t) in enumerate(d.DEPTHS))
    heat_ticks = ''.join(f'<li data-tick="{i}" style="--t:{i}"><span>{e(x)}</span></li>' for i, x in enumerate(d.HEAT))
    bounds = ''.join(f'<li><i>{n2(i + 1)}</i><span>{e(x)}</span></li>' for i, x in enumerate(d.BOUNDARIES))
    stages = ''.join(f'<li><i>{n2(i + 1)}</i><span>{e(x)}</span></li>' for i, x in enumerate(d.RELATION_STAGES))
    bottles = ''.join(
        f'<button type="button" class="bottle {k}" data-oil="{k}" aria-pressed="false"><span class="bottle-glow"></span>{bottle_svg(k)}<span class="bottle-label">{e(name)}</span></button>'
        for k, name in [('calm', d.COPY['calm']), ('warm', d.COPY['warm']), ('unknown', '???')])
    return f'''<section class="page-hero guide-hero">
<div class="page-hero-art">{img('assets/art/perfumery.webp', '', '', True)}</div><div class="page-hero-shade"></div>
<div class="wrap">{title('Treatment Guide', '시술 안내 · 결을 손으로 푸는 법', 'Still Room Manual')}</div>
</section>
<div class="guide wrap">
<nav class="guide-toc" aria-label="안내 목차">{toc_html}<a class="toc-extra" href="treatment.html">{icon('arrow')}<span>시술실로</span></a></nav>
<div class="guide-body">
<section id="knots" class="guide-sec reveal">{chapter('01', 'The Knots', d.COPY['knots_title'])}<p class="lead">{e(d.COPY['knots_definition'])}</p><ol class="progress-chain">{progress}</ol></section>
<section id="depth" class="guide-sec reveal">{chapter('02', 'Depth', d.COPY['depth'])}<div class="strata">{depths}</div><p class="strata-note">층을 눌러 깊이를 비교해 보세요.</p></section>
<section id="heat" class="guide-sec reveal">{chapter('03', 'Warmth', d.COPY['heat'])}
<div class="heat"><div class="heat-meter" aria-hidden="true"><span class="heat-fill"></span><span class="heat-ember"></span></div>
<label class="heat-input"><span class="sr-only">달아오름 단계</span><input type="range" id="heat-range" min="0" max="4" step="1" value="0" aria-valuetext="{e(d.HEAT[0])}"></label>
<ol class="heat-ticks">{heat_ticks}</ol><p class="heat-now"><small>현재</small><strong id="heat-label">{e(d.HEAT[0])}</strong></p></div></section>
<section id="bounds" class="guide-sec reveal">{chapter('04', 'Boundaries', '허용선과 관계')}
<h3 class="sub">{e(d.COPY['boundary_title'])}</h3><ol class="step-track">{bounds}</ol>
<h3 class="sub">{e(d.COPY['relation_title'])}</h3><ol class="step-track rel">{stages}</ol></section>
<section id="oils" class="guide-sec reveal">{chapter('05', 'Perfumery', d.COPY['oil_shelf'])}
<div class="shelf">{bottles}</div><div class="oil-card" aria-live="polite"><small id="oil-name">레이나의 선반</small><p id="oil-note">병을 하나 골라 보세요.</p></div></section>
</div>
</div>'''


def bottle_svg(kind):
    if kind == 'calm':
        body = '<path class="glass" d="M42 40h16v10c14 6 22 18 22 34 0 22-14 36-30 36S20 106 20 84c0-16 8-28 22-34z"/><path class="liquid" d="M24 86c8-4 18 4 26 0s18-4 26 0c0 18-12 30-26 30S24 104 24 86z"/>'
        cap = '<rect class="cap" x="40" y="22" width="20" height="18" rx="3"/>'
        label = '<rect class="tag" x="35" y="80" width="30" height="16" rx="2"/>'
    elif kind == 'warm':
        body = '<path class="glass" d="M44 36h12v18l18 14v46c0 4-3 6-6 6H32c-3 0-6-2-6-6V68l18-14z"/><path class="liquid" d="M28 80c8-3 14 3 22 0s14-3 22 0v34c0 2-1 3-3 3H31c-2 0-3-1-3-3z"/>'
        cap = '<path class="cap" d="M42 14h16l-2 22H44z"/>'
        label = '<rect class="tag" x="34" y="88" width="32" height="16" rx="2"/>'
    else:
        body = '<path class="glass" d="M43 42h14v12c10 4 16 12 16 24v34c0 5-4 8-8 8H35c-4 0-8-3-8-8V78c0-12 6-20 16-24z"/><path class="liquid" d="M30 100c6-2 12 2 20 0s14-2 20 0v12c0 3-2 5-5 5H35c-3 0-5-2-5-5z"/>'
        cap = '<path class="cap" d="M41 28h18v14H41z"/>'
        label = '<path class="tag torn" d="M33 82h34v10l-4 3 3 4-6 3H33z"/>'
    return f'<svg class="bottle-svg" viewBox="0 0 100 124" aria-hidden="true">{body}{label}{cap}<path class="shine" d="M32 74c0-8 4-14 10-17"/></svg>'


def treatment():
    link = button(d.COPY['treatment_cta'], d.CONFIG['MASA_URL'], 'btn btn-gold') if d.CONFIG['MASA_URL'] else unavailable('시술 체험은 준비 중입니다')
    booths = ''.join(
        f'<button type="button" class="booth" data-booth="{k}"><span class="booth-num">Booth {k + 1}</span><span class="booth-voice" aria-live="polite"></span><span class="booth-hint">{e(d.COPY["partition_touch"])}</span></button>'
        for k in range(2))
    return f'''<section class="curtain-stage">
<div class="room-behind">{img('assets/art/title-v5.webp', '시술실', '', True)}</div><div class="room-glow"></div>
<div class="behind-copy wrap"><p class="kicker">Two booths · thin partition</p><div class="booths">{booths}</div><div class="behind-cta">{link}</div><button type="button" class="btn" id="close-curtain"><span>커튼 닫기</span>{icon('close')}</button></div>
<div class="valance" aria-hidden="true"></div>
<div class="drape left" aria-hidden="true"><i class="tieback"></i></div><div class="drape right" aria-hidden="true"><i class="tieback"></i></div>
<div class="curtain-copy">{title('Behind the Curtain', d.COPY['treatment_note'], 'Treatment Room')}{button('커튼 열기', cls='btn btn-gold btn-lg', attrs='id="draw-curtain" aria-expanded="false"')}</div>
</section>'''


def city():
    p = d.PLACES[0]
    pins = ''.join(
        f'<button type="button" class="pin" data-place="{i}" aria-pressed="{str(i == 0).lower()}" style="left:{x["x"]}%;top:{x["y"]}%"><span class="pin-dot"></span><span class="pin-label">{e(x["name"])}</span></button>'
        for i, x in enumerate(d.PLACES))
    sx, sy = d.SHOP_PIN
    shop = f'<span class="pin shop" style="left:{sx}%;top:{sy}%" aria-hidden="true"><span class="pin-dot"></span><span class="pin-label">{e(d.CONFIG["SHOP_NAME"])}</span></span>'
    places = ''.join(f'<button type="button" data-place="{i}" aria-pressed="{str(i == 0).lower()}"><span>{n2(i + 1)}</span>{e(x["name"])}</button>' for i, x in enumerate(d.PLACES))
    return f'''<section class="city-head wrap">{title('Veilhaun', e(d.COPY['city_note']) + ' · ' + e(d.COPY['city_intro']), 'Free Trade City')}</section>
<section class="city wrap">
<div class="map"><div class="map-scroll"><div class="map-canvas">{img('assets/art/atlas.webp', '베일하운 지도', 'map-img', True)}{pins}{shop}</div></div><p class="map-hint">지도의 표식을 눌러 장소를 고르세요.</p></div>
<aside class="place-card" aria-live="polite">
<div class="place-strip">{img(d.CONFIG['BACKGROUND_DIR'] + '/' + p['code'] + '.webp', p['name'], 'place-img', True)}</div>
<div class="place-body"><p class="kicker"><span id="place-number">01</span> / {n2(len(d.PLACES))}</p><h2 id="place-name">{e(p['name'])}</h2><p id="place-text">{e(p['text'])}</p><div id="place-guest"></div>
<div class="stepper"><button type="button" data-place-step="-1" aria-label="이전 장소">{icon('back')}</button><button type="button" data-place-step="1" aria-label="다음 장소">{icon('arrow')}</button></div></div>
</aside>
</section>
<nav class="place-index wrap" aria-label="도시 장소">{places}</nav>'''


def start():
    modes = [('opening', 'Opening Day'), ('free', 'Free Mode')]
    mode_cards = ''.join(
        f'<button type="button" class="mode" data-mode="{key}" aria-pressed="{str(i == 0).lower()}"><span class="mode-num">{n2(i + 1)}</span><strong class="mode-en">{dict(modes)[key]}</strong><span class="mode-ko">{e(name)}</span><span class="mode-desc">{e(desc)}</span><span class="mode-check"></span></button>'
        for i, (key, name, desc) in enumerate(d.MODES))
    link = button(d.COPY['crack_cta'], d.CONFIG['CRACK_URL'], 'btn btn-gold btn-lg') if d.CONFIG['CRACK_URL'] else unavailable(d.COPY['crack_empty'])
    sample = f'''<div class="sample">
<div class="sample-part bg"><span class="tag">{d.COPY['sample_background']}</span>{img('images/B/R.webp', '')}</div>
<div class="sample-part narr"><span class="tag">{d.COPY['sample_narration']}</span><i></i><i></i><i class="short"></i></div>
<div class="sample-part talk"><span class="tag">{d.COPY['sample_portrait']}</span>{img(CH[0]['portrait'], '', 'sample-face', False, face(CH[0]))}<div><b>{e(CH[0]['name'])}</b><span class="tag inline">{d.COPY['sample_dialogue']}</span><i></i></div></div>
<div class="sample-part status"><span class="tag">{d.COPY['sample_status']}</span><pre>{e(d.STATUS_TEMPLATE)}</pre></div>
</div>'''
    reps = ''.join(f'<option>{e(x)}</option>' for x in d.REPUTATION)
    return f'''<section class="page-hero start-hero">
<div class="page-hero-art">{img('images/B/R.webp', '', 'wide', True)}</div><div class="page-hero-shade"></div>
<div class="wrap">{title('Open the Doors', '시작하기 · 두 가지 방식으로 가게를 엽니다', 'New Story')}</div>
</section>
<section class="start wrap">
<div class="modes">{mode_cards}</div>
<div class="start-grid">
<div class="start-main">
<div class="mode-panel" data-panel="opening">{chapter('A', 'Prologue', '프롤로그')}<div id="prologue" class="prologue"></div></div>
<form class="mode-panel free-form" data-panel="free" id="free-form" hidden>{chapter('A', 'Starting State', '출발 상태')}
<p class="form-note">{e(d.COPY['free_note'])}</p>
<div class="fields"><label><span>{e(d.COPY['day_count'])}</span><input name="day" type="number" min="0" max="99999" value="0" inputmode="numeric"></label>
<label><span>{e(d.COPY['money'])}</span><input name="money" maxlength="120" placeholder="예: 금화 1 · 은화 4"></label>
<label><span>평판</span><select name="rep">{reps}</select></label>
<label class="full"><span>{e(d.COPY['known'])}</span><textarea name="relations" maxlength="1000" rows="4" placeholder="예: 레이나 · 신뢰"></textarea></label></div>
<div class="form-foot">{button(d.COPY['copy'], cls='btn btn-gold', attrs='type="submit"', ico='copy')}<output id="copy-status" aria-live="polite"></output></div>
<textarea id="copy-fallback" aria-label="복사할 출발 상태" readonly hidden></textarea></form>
<details class="fold"><summary>{e(d.COPY['play_guide'])}<span></span></summary><p>{e(d.COPY['unwritten'])}</p></details>
<div class="start-cta">{link}</div>
</div>
<aside class="start-side">{chapter('B', 'Output Sample', d.COPY['sample'])}{sample}</aside>
</div>
</section>'''


# ------------------------------------------------------------------ shell

def write_page(filename, page, body, char=None):
    prefix = '../' if '/' in filename else ''
    label = char['name'] if char else LABELS.get(page, '입구')
    chars = []
    for c in CH:
        item = {k: c[k] for k in ('code', 'slug', 'name', 'en', 'race', 'age', 'group', 'role', 'color', 'hook', 'portrait', 'face')}
        if char and c['slug'] == char['slug']:
            item['gallery'] = [[c['portrait']] if (ROOT / c['portrait']).is_file() else []] + [
                [f"{d.CONFIG['CHARACTER_DIR']}/{c['code']}_{n}.webp" for n in range(g['start'], g['end'] + 1)
                 if (ROOT / f"{d.CONFIG['CHARACTER_DIR']}/{c['code']}_{n}.webp").is_file()]
                for g in d.EXPRESSION_GROUPS[1:]]
        chars.append(item)
    payload = dict(config={k: d.CONFIG[k] for k in ('BGM', 'PROLOGUES', 'BACKGROUND_DIR')}, characters=chars, rumors=d.RUMORS,
                   voices=d.VOICES, places=d.PLACES, expressions=d.EXPRESSIONS, heat=d.HEAT,
                   copy={k: d.COPY[k] for k in ('calm', 'warm', 'unknown', 'calm_effect', 'warm_effect', 'unknown_result', 'prologue_empty', 'copied', 'copy_failed', 'variant_empty', 'sensitive', 'from_here')},
                   knots=d.KNOT_MAP, page=page, character=char['slug'] if char else None, prefix=prefix)
    current = 'characters' if page == 'chart' else page
    nav = ''.join(
        f'<a href="{prefix}{slug}.html"{" aria-current=page" if current == slug else ""}><span class="n">{n2(i)}</span>{ko}</a>'
        for i, (slug, ko, en, ic) in enumerate(ROOMS, 1))
    directory = ''.join(
        f'<a href="{prefix}{slug}.html"{" aria-current=page" if current == slug else ""}><span class="dir-icon">{img(prefix + "assets/ui/icon-" + ic + ".webp")}</span><span class="dir-n">{n2(i)}</span><strong>{en}</strong><span class="dir-ko">{ko}</span></a>'
        for i, (slug, ko, en, ic) in enumerate(ROOMS, 1))
    guard = '' if page == 'index' else f'<script src="{prefix}assets/guard.js?v={VERSION}"></script>'
    accent = f' style="--c:{char["color"]}"' if char else ''
    header = '' if page == 'index' else f'''<header class="hdr"><a class="mark" href="{prefix}home.html"><span class="mark-en">Veilhaun</span><span class="mark-ko">{e(d.CONFIG['SHOP_NAME'])}</span></a>
<nav class="hdr-nav" aria-label="주 메뉴">{nav}</nav>
<div class="hdr-tools"><button id="sound" class="tool" type="button" aria-pressed="false" aria-label="효과음">{icon('sound')}</button><button id="menu-open" class="tool menu-btn" type="button" aria-haspopup="dialog"><span>Menu</span><i aria-hidden="true"></i></button></div></header>'''
    footer = '' if page == 'index' else f'''<footer class="ftr wrap"><div class="ftr-brand"><span class="mark-en">Veilhaun</span><span>{e(d.CONFIG['TITLE'])} · 글 · 설정 {e(d.CONFIG['AUTHOR'])}</span></div>
<div class="ftr-tools"><button id="bell" type="button">{icon('bell')}<span>{e(d.COPY['rumor'])}</span></button><a href="{prefix}index.html" data-exit>{e(d.COPY['exit'])}</a></div>
<p class="ftr-keys">{e(d.COPY['keyboard'])} · 1~6 방 이동 · M 효과음 · ESC 방 안내</p></footer>'''
    html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0d0f0c"><meta name="description" content="{e(d.CONFIG['TITLE'])}. 베일하운 뒷골목 가게의 인물과 시술, 도시를 둘러보세요."><meta name="robots" content="noindex"><title>{e(label)} · {e(d.CONFIG['SHOP_NAME'])}</title>{guard}<link rel="icon" href="{prefix}assets/favicon.svg"><link rel="preload" href="{prefix}assets/fonts/CormorantGaramond.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="{prefix}assets/fonts/pretendard/pretendard.css"><link rel="stylesheet" href="{prefix}assets/site.css?v={VERSION}"><script id="site-data" type="application/json">{json.dumps(payload, ensure_ascii=False).replace('</', '<\\/')}</script><script defer src="{prefix}assets/site.js?v={VERSION}"></script></head>
<body class="page-{page}"{accent}><a href="#main" class="skip-link">{e(d.COPY['skip'])}</a>{header}<main id="main">{body}</main>{footer}
<dialog id="directory" class="directory" aria-label="방 안내"><form method="dialog"><button class="close" aria-label="{e(d.COPY['close'])}">{icon('close')}</button></form><div class="dir-head"><span class="mark-en">Veilhaun</span><span>{e(d.CONFIG['SHOP_NAME'])} · 방 안내</span></div><nav class="dir-nav">{directory}</nav><p class="dir-foot">글 · 설정 {e(d.CONFIG['AUTHOR'])}</p></dialog>
<dialog id="art-lightbox" class="lightbox" aria-label="그림 크게 보기"><form method="dialog"><button class="close" aria-label="{e(d.COPY['close'])}">{icon('close')}</button></form><img alt=""></dialog>
<dialog id="rumor-dialog" class="rumor-dialog" aria-label="{e(d.COPY['rumor'])}"><form method="dialog"><button class="close" aria-label="{e(d.COPY['close'])}">{icon('close')}</button></form><p class="kicker">Around the Alley</p><h2 class="title-en">Rumors</h2><p id="rumor-text" aria-live="polite"></p>{button('다음 소문', cls='btn', attrs='id="rumor-next"')}</dialog>
<div class="wipe" aria-hidden="true"></div></body></html>'''
    if any(x in html for x in ['–', '—']):
        raise ValueError('Forbidden dash in ' + filename)
    dest = ROOT / filename
    dest.parent.mkdir(exist_ok=True)
    dest.write_text(html, encoding='utf-8')
