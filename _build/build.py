from pathlib import Path
import data as d
from pages import entrance, home, characters, chart, rules, treatment, city, start, write_page
ROOT=Path(__file__).resolve().parents[1]
if __name__=='__main__':
    for page,fn in [('index',entrance),('home',home),('characters',characters),('rules',rules),('treatment',treatment),('city',city),('start',start)]:
        write_page(page+'.html',page,fn())
    for character in d.CHARACTERS:
        write_page('char/'+character['slug']+'.html','chart',chart(character),character)
    (ROOT/'assets/site.js').write_text((ROOT/'_build/site.js').read_text(encoding='utf-8-sig'),encoding='utf-8')
    (ROOT/'.nojekyll').touch()
    print('Built 12 V6 pages.')
