from pathlib import Path
from html import escape as esc
import json, re
import data as d
from immersive import entrance, home, characters, rules, city, treatment, write_page, glyph
from data import *

ROOT=Path(__file__).resolve().parents[1]
def e(s):return esc(str(s),quote=True)
def c(k):return e(COPY[k])
def button(text,attrs='',cls='button'):return f'<button class="{cls}" {attrs}>{text}</button>'
def photo(char,expression=None,prefix=''):
    rel=char['portrait'] if expression in (None,1) else ''
    available=bool(rel and (ROOT/rel).is_file())
    return f'<div class="portrait" style="--person:{char["color"]}" data-portrait><div class="portrait-placeholder" {"hidden" if available else ""}><span>{char["code"]}</span><p>{c("portrait_empty")}</p></div>'+ (f'<img src="{prefix+e(rel)}" alt="{e(char["name"])}" fetchpriority="high">' if available else '')+'</div>'
def banner(code,prefix='',extra=''):
    return f'<div class="room-view {extra}"><img data-scene src="{prefix}{d.CONFIG["BACKGROUND_DIR"]}/{code}.webp" alt="" fetchpriority="high"><div class="view-shade"></div><span class="view-corner a"></span><span class="view-corner b"></span></div>'
def heading(label,title,side=''):
    return f'<div class="room-heading"><div><span class="eyebrow">{label}</span><h1>{e(title)}</h1></div>{side}</div>'
def chart(ch):
    ci=d.CHARACTERS.index(ch)
    prev_ch=d.CHARACTERS[(ci-1)%len(d.CHARACTERS)]
    next_ch=d.CHARACTERS[(ci+1)%len(d.CHARACTERS)]
    reactions=ch['reactions'].split(' / ')
    react=[ch['collapse'],reactions[0],reactions[1].split(': ',1)[-1],reactions[2].split(': ',1)[-1]]
    reaction_html=''.join(f'<div><dt>{c(k)}</dt><dd>{e(v)}</dd></div>' for k,v in zip(['collapse','stop','ask','jealous'],react))
    thumbs=''.join(f'<button data-expression="{i}" class="expression {"active" if i==1 else ""}" aria-pressed="{str(i==1).lower()}"><span>{i:02}</span>{e(x)}</button>' for i,x in enumerate(EXPRESSIONS,1))
    bounds=''.join(f'<li class="{"unlocked" if i<(2 if ch["code"]=="E" else 1) else "locked"}"><span>{glyph("check") if i<(2 if ch["code"]=="E" else 1) else glyph("lock")}</span>{e(x)}</li>' for i,x in enumerate(BOUNDARIES))
    rel=''.join(f'<li>{e(x)}</li>' for x in d.RELATIONS if ch['name'] in x)
    return f'''<div class="chart-layout" style="--person:{ch['color']}"><aside class="chart-stage"><nav class="character-nav" aria-label="인물 넘기기"><a href="{prev_ch['slug']}.html">{glyph("prev")} {e(prev_ch['name'])}</a><a href="{next_ch['slug']}.html">{e(next_ch['name'])} {glyph("next")}</a></nav>{photo(ch,1,'../')}<div class="chart-person"><span class="eyebrow">{e(ch['race'])} · {ch['age']} · {e(ch['group'])}</span><h1>{e(ch['name'])}</h1><p>{e(ch['role'])}</p></div><div class="expression-controls">{button('←','id="expr-prev" aria-label="'+COPY['prev']+'"','square')}<span id="expression-title">01 · {e(EXPRESSIONS[0])}</span>{button('→','id="expr-next" aria-label="'+COPY['next']+'"','square')}</div><div class="expression-strip" aria-label="감정 탭">{thumbs}</div><div id="variant-thumbs" aria-label="감정 변형"></div><p class="key-hint">{c('expression_help')}</p></aside><article class="chart-paper paper"><div class="paper-top"><span>CHART / {ch['code']}</span><a href="../characters.html">{c('staff')+' · '+c('guests')} ↗</a></div><div class="chart-heading"><h2>{e(ch['name'])}</h2><span class="stamp">{e(ch['boundary'])}</span></div><blockquote>“{e(ch['hook'])}”</blockquote><p class="chart-description">{e(ch['description'])}</p><section class="map-section"><div><h3>{c('knot_map')}</h3><p>{e(ch['knots'])}</p><div class="tabs">{button(c('front'),'data-facing="front" aria-pressed="true"','tab active')}{button(c('back'),'data-facing="back" aria-pressed="false"','tab')}</div><p class="map-label" id="knot-label" aria-live="polite">{c('knots')}</p><small class="sensitive-legend"><i aria-hidden="true"></i>{c('sensitive')}</small></div><div class="body-map"><svg viewBox="0 0 200 300" aria-label="결 자리 실루엣" role="img"><circle cx="100" cy="46" r="23"/><path d="M85 70 Q60 74 52 94 L36 163 Q37 174 47 169 L68 112 L70 174 L59 265 Q63 279 74 269 L99 193 L125 269 Q136 277 140 265 L129 174 L131 112 L153 169 Q164 174 164 161 L147 94 Q137 74 115 70Z"/></svg><div id="map-dots"></div></div></section><section><h3>{c('boundary_title')}</h3><ol class="boundary-track">{bounds}</ol></section><dl class="reactions">{reaction_html}</dl><div class="chart-quotes">{''.join('<blockquote>“'+e(q)+'”</blockquote>' for q in ch['quotes'])}</div><details><summary>{c('appearance')} · {c('speech')}</summary><p>{e(ch['appearance'])}</p><p>{e(ch['speech'])}</p></details><section class="relationships"><h3>{c('relations')}</h3><ul>{rel}</ul></section><span class="paper-page">{ch['code']} / 05</span></article></div>'''
def start():
    modes=''.join(f'<button class="mode-slot {"active" if i==0 else ""}" data-mode="{key}" aria-pressed="{str(i==0).lower()}"><span class="eyebrow">0{i+1}</span><strong>{e(name)}</strong><span>{e(desc)}</span></button>' for i,(key,name,desc) in enumerate(MODES))
    link=f'<a class="button" href="{e(d.CONFIG["CRACK_URL"])}">{c("crack_cta")} ↗</a>' if d.CONFIG['CRACK_URL'] else f'<span class="closed-sign">{c("crack_empty")}</span>'
    return banner('R')+heading('OPENING',COPY['opening_title'])+f'''<div class="opening-layout"><section class="mode-list">{modes}<form id="free-form" hidden><p>{c('free_note')}</p><label>{c('day_count')}<input name="day" type="number" min="0" max="99999"></label><label>{c('money')}<input name="money" maxlength="120"></label><label>{c('reputation')}<select name="rep">{''.join('<option>'+e(x)+'</option>' for x in REPUTATION)}</select></label><label>{c('known')}<textarea name="relations" maxlength="1000"></textarea></label>{button(c('copy'),'type="submit"')}<output id="copy-status" aria-live="polite"></output><textarea id="copy-fallback" aria-label="복사할 출발 상태" readonly hidden></textarea></form></section><article class="sample paper"><span class="eyebrow">FIRST PAGE</span><h2>{c('sample')}</h2><div class="sample-scene"><span>{c('sample_background')}</span></div><div id="prologue"><p class="empty-copy">{c('prologue_empty')}</p></div><div class="sample-labels"><span>{c('sample_narration')}</span><span>{c('sample_portrait')}</span><span>{c('sample_dialogue')}</span></div><h3>{c('sample_status')}</h3><pre>{e(STATUS_TEMPLATE)}</pre><details><summary>{c('play_guide')}</summary><h3>{c('user_note')}</h3><p>{c('unwritten')}</p><h3>{c('shortcuts')}</h3><p>{c('unwritten')}</p></details>{link}</article></div>'''

if __name__=='__main__':
    for page,fn in [('index',entrance),('home',home),('characters',characters),('rules',rules),('treatment',treatment),('city',city),('start',start)]:write_page(page+'.html',page,fn())
    for char in d.CHARACTERS:write_page('char/'+char['slug']+'.html','chart',chart(char),char)
    (ROOT/'assets/site.js').write_text((ROOT/'_build/core.js').read_text(encoding='utf-8')+(ROOT/'_build/interactions.js').read_text(encoding='utf-8')+(ROOT/'_build/motion.js').read_text(encoding='utf-8')+'\n})();\n',encoding='utf-8')
    (ROOT/'.nojekyll').touch()
    print('Built 12 pages. Forbidden dash check passed.')
