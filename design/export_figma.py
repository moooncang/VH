"""Editable SVG handoff for Figma; backgrounds are discrete embedded images.

Figma MCP Starter quota prevented native composition after reference capture.
These files are a local handoff, not a claim of completed native Figma editing.
"""
from pathlib import Path
from base64 import b64encode
from html import escape

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'design'
def text(x,y,value,size=14,fill='#f1e9d8',family='Pretendard',spacing=0):
    return f'<text x="{x}" y="{y}" fill="{fill}" font-family="{family}" font-size="{size}" letter-spacing="{spacing}">{escape(value)}</text>'
def rect(x,y,w,h,fill,stroke='none'):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"/>'
def art(name,w,h):
    src=b64encode((ROOT/'assets/art'/f'{name}.webp').read_bytes()).decode()
    return f'<image id="Generated-environment-{name}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" href="data:image/webp;base64,{src}"/>'
def header(w):
    return '<g id="Brand-and-utilities">'+text(60,49,'◇',40,'#d7b782','Cormorant Garamond')+text(110,46,'골목 시술소',20,family='Gowun Batang')+text(110,71,'V E I L H A U N',10,'#d7b782','Cormorant Garamond')+text(w-250,55,'낮     저녁     심야     ♪     ☰',12)+'</g>'
def nav(active,w=1440,h=900):
    names=['접수대','대기실','조향실','시술실','창밖','개업']
    body=rect(0,h-76,w,76,'#101a17')
    for i,name in enumerate(names):
        x=250+i*175
        body+=text(x,h-34,f'0{i+1}   {name}',13,'#d7b782' if i==active else '#b5b9a9')
        if i==active:body+=rect(x-15,h-76,90,2,'#d7b782')
    return '<g id="Room-navigation">'+body+'</g>'
def hotspot(x,y,label,num):
    return f'<g id="Hotspot-{num}"><circle cx="{x}" cy="{y}" r="24" fill="#d7b782" opacity=".12"/><circle cx="{x}" cy="{y}" r="16" fill="#152b20" stroke="#d7b782"/>'+text(x-5,y+4,num,11,'#d7b782','Cormorant Garamond')+rect(x-55,y+28,110,32,'#13291f','#786f4f')+text(x-42,y+49,label+'   ↗',11)+'</g>'
def save(name,body,w=1440,h=900):
    defs='<defs><linearGradient id="shade"><stop stop-color="#081611" stop-opacity=".78"/><stop offset=".7" stop-color="#081611" stop-opacity=".05"/></linearGradient></defs>'
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{defs}{body}</svg>',encoding='utf-8')

body=art('alley',1440,900)+rect(0,0,1440,900,'url(#shade)')+header(1440)
body+='<g id="Entry-editorial-copy">'+text(173,209,'A HOUSE IN THE BACK ALLEY',12,'#d7b782','Cormorant Garamond',3)+text(173,280,'✧',40,'#d7b782')+text(173,330,'자유교역도시 베일하운',13,'#b5b9a9')+text(173,467,'골목',112,family='Gowun Batang')+text(173,598,'시술소.',112,family='Gowun Batang')+text(173,645,'베일하운 뒷골목 마사지숍',13,'#b5b9a9')+'</g>'
body+='<g id="Enter-button">'+rect(173,683,300,80,'#13241f','#877f60')+text(196,715,'문을 열고 들어가기',14)+text(196,742,'만 19세 이상입니다',10,'#b5b9a9')+text(438,730,'↗',28,'#d7b782')+'</g>'+text(173,792,'19+   만 19세 미만은 입장할 수 없습니다',10,'#b5b9a9')
save('01-entry-desktop.svg',body)
body=art('reception',1440,900)+rect(0,0,1440,900,'url(#shade)')+header(1440)
body+='<g id="Reception-editorial-copy">'+text(86,235,'01 / RECEPTION',13,'#d7b782','Cormorant Garamond',2)+text(86,311,'잠시, 쉬어 가세요.',51,family='Gowun Batang')+text(86,365,'장부를 펼치거나, 칸막이 너머에 귀를 기울여 보세요.',13,'#b5b9a9')+'</g>'
for x,y,l,n in [(1037,529,'오늘의 장부','01'),(1253,645,'시술 메뉴','02'),(706,382,'칸막이 너머','03'),(389,490,'골목의 소문','04')]:body+=hotspot(x,y,l,n)
body+=text(86,751,'◎  빛나는 표식을 눌러 둘러보세요',12,'#b5b9a9')+text(1230,751,'대기실로 가기  →',12)+nav(0)
save('02-reception-desktop.svg',body)
body=art('perfumery',1440,900)+rect(0,0,1440,900,'url(#shade)')+header(1440)
body+=text(86,208,'03 / THE STILL ROOM',13,'#d7b782','Cormorant Garamond',2)+text(86,287,'향을 고르는 시간.',51,family='Gowun Batang')+text(86,340,'작은 병 하나에도, 풀어낼 매듭이 있습니다.',13,'#b5b9a9')+text(86,448,'ESSENCE / SELECT A BOTTLE',10,'#d7b782','Cormorant Garamond',2)+text(86,503,'향유병을 골라 보세요.',28,family='Gowun Batang')
for x,y,l,n in [(735,565,'진정 / CALM','01'),(893,556,'온열 / WARM','02'),(835,700,'?','03')]:body+=hotspot(x,y,l,n)
body+=text(86,736,'▤   레이나의 조향 노트     ↗',15)+nav(2)
save('03-perfumery-desktop.svg',body)
body=art('alley',390,844)+rect(0,0,390,844,'url(#shade)')
body+=text(23,46,'◇  골목 시술소',16,family='Gowun Batang')+text(245,44,'저녁   ♪   ☰',11)+text(35,180,'A HOUSE IN THE BACK ALLEY',9,'#d7b782','Cormorant Garamond',1.5)+text(35,236,'✧',30,'#d7b782')+text(35,273,'자유교역도시 베일하운',11,'#b5b9a9')+text(35,375,'골목',79,family='Gowun Batang')+text(35,468,'시술소.',79,family='Gowun Batang')+text(35,515,'베일하운 뒷골목 마사지숍',11,'#b5b9a9')+rect(35,552,265,86,'#14271f','#807859')+text(57,590,'문을 열고 들어가기',14)+text(57,617,'만 19세 이상입니다',10,'#b5b9a9')+text(266,605,'↗',25,'#d7b782')+text(35,674,'19+   만 19세 미만은 입장할 수 없습니다',9,'#b5b9a9')+text(35,814,'글 · 설정 문창놈',9,'#b5b9a9')
save('04-entry-mobile.svg',body,390,844)
print('Exported four layered SVG compositions for Figma import.')
