"""Convert only named character assets; never visits H or unrelated folders."""
from pathlib import Path
import argparse, concurrent.futures, re, sys
from PIL import Image, ImageOps
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'_build'))
from data import EXPRESSION_GROUPS
NUMBERS=sorted({n for group in EXPRESSION_GROUPS if group['start'] is not None for n in range(group['start'],group['end']+1)})

def convert(path, output, size, quality):
    dest=output/(path.stem+'.webp')
    if dest.exists() and dest.stat().st_mtime >= path.stat().st_mtime:return False
    with Image.open(path) as raw:
        im=ImageOps.exif_transpose(raw)
        im.thumbnail((size,size),Image.Resampling.LANCZOS)
        im.save(dest,'WEBP',quality=quality,method=4)
    return True

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folders',nargs='+',type=Path)
    p.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[1]/'images/CS')
    p.add_argument('--size','--width',type=int,default=1600)
    p.add_argument('--quality',type=int,default=76)
    p.add_argument('--backgrounds',action='store_true')
    args=p.parse_args();args.output.mkdir(parents=True,exist_ok=True)
    files=[]
    for folder in args.folders:
        dirs=[folder]+[x for x in folder.iterdir() if x.is_dir() and x.name in ['레이나','네르','세르피나','이브레아','카샤']]
        for source in dirs:
            for f in source.glob('*.png'):
                pat=r'[RWTNPUGJMKO]' if args.backgrounds else r'(?:[A-E]P|[A-E]_\d+)'
                if re.fullmatch(pat,f.stem) and (args.backgrounds or '_' not in f.stem or int(f.stem.split('_')[1]) in NUMBERS):files.append(f)
    if len({x.stem for x in files})!=len(files):raise SystemExit('Duplicate filenames across input folders. Choose one version per character.')
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        count=sum(pool.map(lambda f:convert(f,args.output,args.size,args.quality),files))
    if not args.backgrounds:
        for code in sorted({x.stem[0] for x in files}):
            missing=[str(n) for n in NUMBERS if not (args.output/f'{code}_{n}.webp').is_file()]
            if missing:print(f'Warning: {code} missing: '+','.join(missing))
    print(f'{count} converted; {len(files)-count} unchanged; {args.output}')
if __name__=='__main__':main()
