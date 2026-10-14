'use strict';
(()=>{
const root=document.documentElement;root.classList.add('js');
const D=JSON.parse(document.getElementById('site-data').textContent);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const pad=n=>String(n).padStart(2,'0');
const wait=ms=>new Promise(r=>setTimeout(r,reduced.matches?0:ms));
function read(k,f){try{return localStorage.getItem(k)??f;}catch{return f;}}
function save(k,v){try{localStorage.setItem(k,v);}catch{}}
try{localStorage.removeItem('vh-time');}catch{}

/* ---------- images: hold each one until decoded, then fade it in */
function settle(img){
  if(img.complete&&img.naturalWidth){img.classList.remove('is-pending');return Promise.resolve();}
  img.classList.add('is-pending');
  return new Promise(res=>{const done=()=>{img.classList.remove('is-pending');res();};img.addEventListener('load',()=>(img.decode?img.decode().catch(()=>{}):Promise.resolve()).then(done),{once:true});img.addEventListener('error',done,{once:true});});
}
$$('img').forEach(settle);
function loadImage(src){const im=new Image();im.decoding='async';im.src=src;return (im.decode?im.decode():new Promise((r,j)=>{im.onload=r;im.onerror=j;})).catch(()=>{}).then(()=>im);}

/* ---------- page reveal: keep the veil until fonts and the first picture are ready */
function reveal(){root.classList.add('ready');}
const hero=$('main img[fetchpriority="high"]');
Promise.race([Promise.all([document.fonts?document.fonts.ready:null,hero?settle(hero):null]),wait(1600)]).then(()=>requestAnimationFrame(()=>requestAnimationFrame(reveal)));
addEventListener('pageshow',ev=>{document.body.classList.remove('leaving');if(ev.persisted)reveal();});

/* ---------- sound: synthesized bell and soft clicks, only after a user gesture */
let sound=read('vh-sound','on')==='on',ctx,unlocked=false,bgm;
function unlock(){if(unlocked)return;unlocked=true;if(D.config.BGM&&!bgm){bgm=new Audio(D.prefix+D.config.BGM);bgm.loop=true;bgm.volume=0;if(sound)fadeBgm(true);}}
function fadeBgm(on){if(!bgm)return;if(on)bgm.play().catch(()=>{});const from=bgm.volume,to=on?.18:0,t0=performance.now();const step=t=>{const k=Math.min((t-t0)/900,1);bgm.volume=from+(to-from)*k;if(k<1)requestAnimationFrame(step);else if(!on)bgm.pause();};requestAnimationFrame(step);}
document.addEventListener('pointerdown',unlock,{once:true});document.addEventListener('keydown',unlock,{once:true});
function sfx(kind='tick'){
  if(!sound||!unlocked||document.hidden)return;
  try{
    ctx??=new(window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const now=ctx.currentTime,out=ctx.createGain();out.gain.value=kind==='bell'?.045:.016;out.connect(ctx.destination);
    const tones={bell:[[1318,0],[1976,0],[1318,.32],[1976,.32]],glass:[[880,0],[1320,.04]],tick:[[520,0]],curtain:[[180,0],[240,.08]]}[kind]||[[520,0]];
    const length=kind==='bell'?1.8:kind==='curtain'?.9:.3;
    tones.forEach(([f,t])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='curtain'?'triangle':'sine';o.frequency.setValueAtTime(f,now+t);g.gain.setValueAtTime(0,now+t);g.gain.linearRampToValueAtTime(1,now+t+.02);g.gain.exponentialRampToValueAtTime(.0001,now+t+length);o.connect(g);g.connect(out);o.start(now+t);o.stop(now+t+length+.05);});
  }catch{}
}
const soundBtn=$('#sound');
function updateSound(){if(soundBtn){soundBtn.setAttribute('aria-pressed',String(sound));soundBtn.setAttribute('aria-label',sound?'효과음 켜짐':'효과음 꺼짐');}save('vh-sound',sound?'on':'off');fadeBgm(sound);}
soundBtn?.addEventListener('click',()=>{sound=!sound;updateSound();sfx('glass');});
if(soundBtn){soundBtn.setAttribute('aria-pressed',String(sound));}

/* ---------- header state */
const hdr=$('.hdr');if(hdr){let raf=0;const onScroll=()=>{if(raf)return;raf=requestAnimationFrame(()=>{hdr.classList.toggle('scrolled',scrollY>24);raf=0;});};onScroll();addEventListener('scroll',onScroll,{passive:true});}

/* ---------- dialogs open and close with the same easing */
function openModal(d){
  if(!d||d.open)return;d.classList.remove('closing');d.showModal();sfx('tick');
  if(!reduced.matches&&d.id==='directory')$$('.dir-nav a',d).forEach((a,i)=>a.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:800,delay:120+i*60,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
}
function closeModal(d){
  if(!d||!d.open||d.classList.contains('closing'))return;
  if(reduced.matches){d.close();return;}
  d.classList.add('closing');
  const end=()=>{d.classList.remove('closing');d.close();};
  d.addEventListener('animationend',function f(ev){if(ev.target!==d)return;d.removeEventListener('animationend',f);end();});
  setTimeout(()=>{if(d.classList.contains('closing'))end();},500);
}
$('#menu-open')?.addEventListener('click',()=>openModal($('#directory')));
$$('dialog').forEach(d=>{
  d.addEventListener('cancel',ev=>{ev.preventDefault();closeModal(d);});
  $('form[method=dialog]',d)?.addEventListener('submit',ev=>{ev.preventDefault();closeModal(d);});
  d.addEventListener('click',ev=>{if(ev.target===d||ev.target.tagName==='IMG'&&d.classList.contains('lightbox'))closeModal(d);});
});

/* ---------- page transitions: fade to the same dark, then the next page fades up */
function navigate(url){
  if(reduced.matches){location.href=url;return;}
  document.body.classList.add('leaving');
  const d=$('dialog[open]');if(d)closeModal(d);
  setTimeout(()=>location.href=url,440);
}
document.addEventListener('click',ev=>{const a=ev.target.closest('a[href]');if(!a||ev.defaultPrevented||ev.button||ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey||a.target||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.endsWith('.html')||url.pathname===location.pathname&&url.hash)return;ev.preventDefault();sfx('tick');navigate(a.href);});

/* ---------- entrance */
$('#enter')?.addEventListener('click',()=>{try{sessionStorage.setItem('vh-adult','yes');}catch{}window.name='VH_ADULT_SESSION';unlock();sfx('bell');setTimeout(()=>navigate('home.html'),reduced.matches?0:350);});
$$('[data-exit]').forEach(a=>a.addEventListener('click',()=>{try{sessionStorage.removeItem('vh-adult');}catch{}if(window.name==='VH_ADULT_SESSION')window.name='';}));

/* ---------- soft text swap: fade the block out, change it, fade it back */
const swapTokens=new WeakMap();
async function swapText(box,update,cls='fading'){
  const token=(swapTokens.get(box)||0)+1;swapTokens.set(box,token);
  if(reduced.matches){update();return;}
  box.classList.add(cls);await wait(280);
  if(swapTokens.get(box)!==token)return;
  update();requestAnimationFrame(()=>box.classList.remove(cls));
}
/* ---------- soft image swap: stack the new picture on top and cross-fade */
async function crossfade(current,src,{blur,fadeOld}={}){
  const full=src;const im=await loadImage(full);
  const fresh=current.cloneNode(false);fresh.removeAttribute('fetchpriority');fresh.classList.remove('is-pending');fresh.classList.add('fresh');fresh.src=im.src;
  current.after(fresh);
  let bfresh;if(blur){bfresh=blur.cloneNode(false);bfresh.classList.add('fresh');bfresh.style.backgroundImage=`url("${full}")`;blur.after(bfresh);}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{fresh.classList.remove('fresh');bfresh?.classList.remove('fresh');if(fadeOld){current.classList.add('gone');blur?.classList.add('gone');}}));
  await wait(750);current.remove();blur?.remove();
  return {img:fresh,blur:bfresh};
}

/* ---------- rumors */
let rumor=Math.floor(Math.random()*D.rumors.length);
function nextRumor(){const p=$('#rumor-text');if(!p)return;swapText(p,()=>{p.textContent=D.rumors[rumor++%D.rumors.length];},'is-fading');sfx('bell');}
$('#bell')?.addEventListener('click',()=>{const p=$('#rumor-text');p.textContent=D.rumors[rumor++%D.rumors.length];openModal($('#rumor-dialog'));sfx('bell');});
$('#rumor-next')?.addEventListener('click',nextRumor);

/* ---------- voices behind partitions */
let voice=Math.floor(Math.random()*D.voices.length);
function whisper(el){if(!el)return;el.classList.add('blur');setTimeout(()=>{el.textContent=D.voices[voice++%D.voices.length].replace(/^"|"$/g,'');requestAnimationFrame(()=>el.classList.remove('blur'));},reduced.matches?0:700);sfx('glass');}
$('#partition')?.addEventListener('click',()=>whisper($('#voice')));
$$('.booth').forEach(b=>{let t;b.addEventListener('click',()=>whisper($('.booth-voice',b)));b.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse')t=setTimeout(()=>whisper($('.booth-voice',b)),600);});b.addEventListener('pointerleave',()=>clearTimeout(t));});

/* ---------- characters */
let cast=0;
function selectCast(i){
  const list=D.characters,next=(i+list.length)%list.length;if(next===cast)return;cast=next;const ch=list[cast];
  const sec=$('.cast');
  $$('.cast-slide').forEach(s=>s.classList.toggle('on',+s.dataset.slide===cast));
  $$('[data-cast]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.cast===cast)));
  swapText($('.cast-copy'),()=>{
    sec.style.setProperty('--c',ch.color);
    $('#cast-en').textContent=ch.en;$('#cast-name').textContent=ch.name;$('#cast-meta').textContent=ch.race+' · '+ch.age+'세';
    $('#cast-role').textContent=ch.role;$('#cast-quote').textContent='“'+ch.hook+'”';$('#cast-link').href='char/'+ch.slug+'.html';
    $('#cast-count').textContent=pad(cast+1)+' / '+pad(list.length);$('#cast-group').textContent=(ch.group==='직원'?'Staff':'Guest')+' · '+ch.group;
  });
  const pick=$(`[data-cast="${cast}"]`),rail=$('.cast-picker');if(rail.scrollWidth>rail.clientWidth)rail.scrollTo({left:pick.offsetLeft-rail.clientWidth/2+pick.clientWidth/2,behavior:reduced.matches?'auto':'smooth'});
  sfx('tick');
}
if(D.page==='characters'){
  $$('[data-cast]').forEach(b=>b.addEventListener('click',()=>selectCast(+b.dataset.cast)));
  $$('[data-cast-step]').forEach(b=>b.addEventListener('click',()=>selectCast(cast+ +b.dataset.castStep)));
  let sx=null;const stage=$('.cast');stage.addEventListener('touchstart',e=>{sx=e.target.closest('.cast-picker')?null:e.touches[0].clientX;},{passive:true});stage.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>60)selectCast(cast+(dx<0?1:-1));});
  const map=$('.rel-map'),relList=$('.rel-list');
  function focusNode(slug){map.classList.toggle('focus',!!slug);relList.classList.toggle('dim',!!slug);
    $$('.rel-node').forEach(n=>n.classList.toggle('hit',n.dataset.node===slug));
    $$('[data-rel]').forEach(x=>{const hit=!!slug&&(x.dataset.a===slug||x.dataset.b===slug);x.classList.toggle('hit',hit);if(hit&&x.tagName!=='LI')$$('.rel-node').forEach(n=>{if(n.dataset.node===x.dataset.a||n.dataset.node===x.dataset.b)n.classList.add('hit');});});}
  let pinned=null;
  $$('.rel-node').forEach(n=>{n.addEventListener('pointerenter',()=>{if(!pinned)focusNode(n.dataset.node);});n.addEventListener('pointerleave',()=>{if(!pinned)focusNode(null);});n.addEventListener('click',()=>{pinned=pinned===n.dataset.node?null:n.dataset.node;focusNode(pinned);sfx('tick');});n.addEventListener('focus',()=>{if(!pinned)focusNode(n.dataset.node);});n.addEventListener('blur',()=>{if(!pinned)focusNode(null);});});
}

/* ---------- character chart */
const chartIndex=D.characters.findIndex(c=>c.slug===D.character);
let expression=0,variant=0,viewer=null,viewerBlur=null,viewerQueue=Promise.resolve(),viewerWant='';
function showImage(src){
  const full=D.prefix+src;viewerWant=full;
  viewerQueue=viewerQueue.then(async()=>{
    if(viewerWant!==full||viewer.src===new URL(full,location.href).href)return;
    const r=await crossfade(viewer,full,{blur:viewerBlur,fadeOld:true});viewer=r.img;viewerBlur=r.blur;
  });
}
function drawExpression(){
  const group=D.characters[chartIndex].gallery[expression];
  if(group.length)showImage(group[variant]);
  $('#expression-title').textContent=D.expressions[expression]+(group.length?` · ${variant+1} / ${group.length}`:' · '+D.copy.variant_empty);
  $('#expr-prev').disabled=$('#expr-next').disabled=group.length<2;
  $$('[data-expression]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.expression===expression)));
  $$('[data-variant]').forEach(b=>{const on=+b.dataset.variant===variant;b.setAttribute('aria-pressed',String(on));if(on){const strip=b.parentElement;strip.scrollTo({left:b.offsetLeft-strip.clientWidth/2+b.clientWidth/2,behavior:reduced.matches?'auto':'smooth'});}});
}
function setExpression(n){
  expression=n;variant=0;const group=D.characters[chartIndex].gallery[n],strip=$('#variant-thumbs');strip.replaceChildren();
  if(group.length>1)group.forEach((src,i)=>{const b=document.createElement('button'),im=new Image();b.type='button';b.dataset.variant=i;b.setAttribute('aria-label',D.expressions[n]+' '+(i+1));im.alt='';im.loading='lazy';im.decoding='async';im.src=D.prefix+src;settle(im);b.append(im);b.addEventListener('click',()=>{variant=i;drawExpression();sfx('tick');});strip.append(b);});
  drawExpression();
}
function stepVariant(s){const g=D.characters[chartIndex].gallery[expression];if(g.length<2)return;variant=(variant+s+g.length)%g.length;drawExpression();sfx('tick');}
function setFacing(side){
  $$('[data-facing]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.facing===side)));
  const dots=$('#map-dots'),list=$('#knot-list');
  const build=()=>{dots.replaceChildren();list.replaceChildren();
    D.knots[D.character][side].forEach(([x,y,name,type],k)=>{
      const dot=document.createElement('span');dot.className='knot-dot '+(type||'');dot.style.left=x+'%';dot.style.top=y+'%';dot.style.animationDelay=k*.3+'s';dots.append(dot);
      const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className=type||'';b.textContent=name+(type?' · '+D.copy.sensitive:'');
      const on=v=>{dot.classList.toggle('on',v);b.classList.toggle('on',v);};
      b.addEventListener('pointerenter',()=>on(true));b.addEventListener('pointerleave',()=>on(false));b.addEventListener('focus',()=>on(true));b.addEventListener('blur',()=>on(false));
      li.append(b);list.append(li);
    });};
  if(!dots.childElementCount){build();return;}
  swapText(dots.parentElement.parentElement,build);
}
if(D.page==='chart'){
  viewer=$('.viewer-img');viewerBlur=$('.viewer-blur');viewerBlur.style.backgroundImage=`url("${viewer.src}")`;
  setExpression(0);setFacing('front');
  $$('[data-expression]').forEach(b=>b.addEventListener('click',()=>{if(+b.dataset.expression===expression)return;setExpression(+b.dataset.expression);sfx('tick');}));
  $$('[data-facing]').forEach(b=>b.addEventListener('click',()=>{if(b.getAttribute('aria-pressed')==='true')return;setFacing(b.dataset.facing);sfx('tick');}));
  $('#expr-prev').addEventListener('click',()=>stepVariant(-1));$('#expr-next').addEventListener('click',()=>stepVariant(1));
  const zoom=()=>{const box=$('#art-lightbox img');box.src=viewer.src;box.alt=viewer.alt;openModal($('#art-lightbox'));};
  $('.viewer-zoom').addEventListener('click',zoom);
  let sx=null,swiped=false;const frame=$('.viewer-frame');
  frame.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;swiped=false;},{passive:true});
  frame.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>60){swiped=true;stepVariant(dx<0?1:-1);}});
  frame.addEventListener('click',ev=>{if(ev.target.closest('button'))return;if(!swiped)zoom();swiped=false;});
}

/* ---------- guide */
if(D.page==='rules'){
  const links=$$('[data-spy]');
  const spy=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.dataset.spy===en.target.id));const on=$('.guide-toc a.on'),toc=$('.guide-toc');if(on&&toc.scrollWidth>toc.clientWidth)toc.scrollTo({left:on.offsetLeft-16,behavior:'smooth'});}}),{rootMargin:'-35% 0px -60% 0px'});
  $$('.guide-sec').forEach(s=>spy.observe(s));
  $$('[data-depth]').forEach(b=>b.addEventListener('click',()=>{$$('[data-depth]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('tick');}));
  const heat=$('#heat-range'),wrap=$('.heat');
  const setHeat=()=>{const v=+heat.value;wrap.style.setProperty('--h',v/4);$('#heat-label').textContent=D.heat[v];heat.setAttribute('aria-valuetext',D.heat[v]);$$('.heat-ticks li').forEach(li=>li.classList.toggle('on',+li.dataset.tick===v));};
  heat.addEventListener('input',()=>{setHeat();sfx('tick');});setHeat();
  $$('.heat-ticks li').forEach(li=>li.addEventListener('click',()=>{heat.value=li.dataset.tick;setHeat();sfx('tick');}));
  $$('[data-oil]').forEach(b=>b.addEventListener('click',()=>{
    if(b.getAttribute('aria-pressed')==='true')return;
    $$('[data-oil]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const k=b.dataset.oil;
    swapText($('.oil-card'),()=>{$('#oil-name').textContent=k==='unknown'?D.copy.unknown:D.copy[k];$('#oil-note').textContent=D.copy[k==='unknown'?'unknown_result':k+'_effect'];});sfx('glass');
  }));
}

/* ---------- treatment curtain */
function curtain(open){document.body.classList.toggle('curtains-open',open);$('#draw-curtain')?.setAttribute('aria-expanded',String(open));sfx('curtain');if(open)setTimeout(()=>whisper($('.booth-voice')),reduced.matches?0:1700);}
$('#draw-curtain')?.addEventListener('click',()=>curtain(true));
$('#close-curtain')?.addEventListener('click',()=>curtain(false));

/* ---------- city */
let place=0,placeImg=null,placeQueue=Promise.resolve();
function selectPlace(i,scroll=true){
  const next=(i+D.places.length)%D.places.length;if(next===place)return;place=next;const p=D.places[place];
  const src=D.prefix+D.config.BACKGROUND_DIR+'/'+p.code+'.webp';
  placeQueue=placeQueue.then(async()=>{if(D.places[place]!==p)return;const r=await crossfade(placeImg,src);placeImg=r.img;placeImg.alt=p.name;});
  swapText($('.place-body'),()=>{
    $('#place-name').textContent=p.name;$('#place-number').textContent=pad(place+1);$('#place-text').textContent=p.text;
    const guest=$('#place-guest');guest.replaceChildren();
    const ch=D.characters.find(c=>c.name===p.guest);
    if(ch){const a=document.createElement('a');a.className='guest-link';a.href='char/'+ch.slug+'.html';a.style.setProperty('--c',ch.color);a.innerHTML=`<img src="${D.prefix+ch.portrait}" alt="" style="object-position:${ch.face[0]}% ${ch.face[1]}%"><span><small>${D.copy.from_here}</small><strong></strong></span>`;$('strong',a).textContent=ch.name+' · '+ch.role;settle($('img',a));guest.append(a);}
  });
  $$('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.place===place)));
  const scroller=$('.map-scroll'),pin=$(`.pin[data-place="${place}"]`);
  if(scroll&&scroller.scrollWidth>scroller.clientWidth)scroller.scrollTo({left:pin.offsetLeft-scroller.clientWidth/2,behavior:reduced.matches?'auto':'smooth'});
  sfx('tick');
}
if(D.page==='city'){
  placeImg=$('.place-img');
  $$('[data-place]').forEach(b=>b.addEventListener('click',()=>selectPlace(+b.dataset.place)));
  $$('[data-place-step]').forEach(b=>b.addEventListener('click',()=>selectPlace(place+ +b.dataset.placeStep)));
  const scroller=$('.map-scroll'),center=()=>{const pin=$('.pin[aria-pressed=true]');if(scroller.scrollWidth>scroller.clientWidth)scroller.scrollLeft=pin.offsetLeft-scroller.clientWidth/2;};
  $('.map-img').complete?center():$('.map-img').addEventListener('load',center);
}

/* ---------- start */
function mode(key,quiet){
  const btn=$(`[data-mode="${key}"]`);if(!quiet&&btn.getAttribute('aria-pressed')==='true')return;
  $$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===key)));
  $$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==key);
  const text=D.config.PROLOGUES[key],pro=$('#prologue');
  if(key==='opening'){pro.textContent=text||D.copy.prologue_empty;pro.classList.toggle('empty',!text);}
  if(!quiet)sfx('tick');
}
if(D.page==='start'){
  $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));mode('opening',true);
  $('#free-form').addEventListener('submit',async ev=>{
    ev.preventDefault();const f=new FormData(ev.target);
    const text=['경과일: '+f.get('day'),'소지금: '+f.get('money'),'평판: '+f.get('rep'),'아는 인물과 관계: '+f.get('relations')].join('\n');
    const status=$('#copy-status'),fb=$('#copy-fallback');
    try{await navigator.clipboard.writeText(text);status.textContent=D.copy.copied;fb.hidden=true;sfx('glass');}
    catch{status.textContent=D.copy.copy_failed;fb.hidden=false;fb.value=text;fb.select();}
  });
}

/* ---------- keyboard */
const ROUTES=['home','characters','rules','treatment','city','start'];
document.addEventListener('keydown',ev=>{
  if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.repeat)return;
  if(ev.key==='Escape'){if(!$('dialog[open]')&&D.page!=='index'){ev.preventDefault();openModal($('#directory'));}return;}
  if($('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName))return;
  const k=ev.key.toLowerCase();
  if(k==='m'){sound=!sound;updateSound();return;}
  if(D.page==='index')return;
  if(/^[1-6]$/.test(k))return navigate(D.prefix+ROUTES[+k-1]+'.html');
  if(D.page==='characters'&&(k==='arrowleft'||k==='arrowright')){ev.preventDefault();selectCast(cast+(k==='arrowleft'?-1:1));}
  else if(D.page==='chart'){if(k==='arrowleft'||k==='arrowright'){ev.preventDefault();stepVariant(k==='arrowleft'?-1:1);}else if(k==='q'||k==='e')navigate(D.characters[(chartIndex+(k==='q'?D.characters.length-1:1))%D.characters.length].slug+'.html');}
  else if(D.page==='city'&&(k==='arrowup'||k==='arrowdown')){ev.preventDefault();selectPlace(place+(k==='arrowup'?-1:1));}
});

/* ---------- reveal on scroll */
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});$$('.reveal').forEach(x=>io.observe(x));}
else $$('.reveal').forEach(x=>x.classList.add('in'));

/* ---------- pointer parallax, eased so the picture never jumps */
const par=$('[data-parallax]');
if(par&&matchMedia('(pointer:fine)').matches){
  let tx=0,ty=0,x=0,y=0,raf=0;
  const tick=()=>{x+=(tx-x)*.06;y+=(ty-y)*.06;par.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;raf=Math.abs(tx-x)+Math.abs(ty-y)>.05?requestAnimationFrame(tick):0;};
  addEventListener('pointermove',e=>{if(reduced.matches||document.hidden)return;tx=(e.clientX/innerWidth-.5)*-12;ty=(e.clientY/innerHeight-.5)*-7;if(!raf)raf=requestAnimationFrame(tick);},{passive:true});
}

/* ---------- lamplight motes, faded in with the page */
const canvas=$('#motes');
if(canvas){const c2=canvas.getContext('2d');let w=0,h=0,frame=0,last=0,alpha=0;const dots=Array.from({length:36},(_,i)=>({x:.35+((i*.6180339)%1)*.65,y:(i*.37)%1,r:.6+(i%4)*.45,s:.006+(i%5)*.003,a:.12+(i%3)*.1}));
  const resize=()=>{const dpr=Math.min(devicePixelRatio||1,1.5);w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;c2.setTransform(dpr,0,0,dpr,0,0);};
  const draw=t=>{if(document.hidden||reduced.matches){frame=0;return;}const dt=Math.min((t-last)/1000,.05);last=t;if(root.classList.contains('ready'))alpha=Math.min(alpha+dt/2.5,1);c2.clearRect(0,0,w,h);for(const p of dots){p.y-=p.s*dt;if(p.y<-.02)p.y=1.02;const px=p.x*w+Math.sin(t/3000+p.y*9)*14,py=p.y*h,a=p.a*alpha;const g=c2.createRadialGradient(px,py,0,px,py,p.r*4);g.addColorStop(0,`rgba(255,214,150,${a})`);g.addColorStop(1,'rgba(255,214,150,0)');c2.fillStyle=g;c2.beginPath();c2.arc(px,py,p.r*4,0,Math.PI*2);c2.fill();}frame=requestAnimationFrame(draw);};
  const resume=()=>{if(!document.hidden&&!reduced.matches&&!frame){last=performance.now();frame=requestAnimationFrame(draw);}};
  resize();addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',resume);resume();}

document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('page-hidden',document.hidden);if(bgm){if(document.hidden)bgm.pause();else if(sound&&unlocked)bgm.play().catch(()=>{});}});
})();
