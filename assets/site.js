'use strict';
(()=>{
document.documentElement.classList.add('js');
const D=JSON.parse(document.getElementById('site-data').textContent);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const pad=n=>String(n).padStart(2,'0');
function read(k,f){try{return localStorage.getItem(k)??f;}catch{return f;}}
function save(k,v){try{localStorage.setItem(k,v);}catch{}}
try{localStorage.removeItem('vh-time');}catch{}

/* ---------- sound: synthesized bell and soft clicks, only after a user gesture */
let sound=read('vh-sound','on')==='on',ctx,unlocked=false,bgm;
function unlock(){if(unlocked)return;unlocked=true;if(D.config.BGM&&!bgm){bgm=new Audio(D.prefix+D.config.BGM);bgm.loop=true;bgm.volume=.18;if(sound)bgm.play().catch(()=>{});}}
document.addEventListener('pointerdown',unlock,{once:true});document.addEventListener('keydown',unlock,{once:true});
function sfx(kind='tick'){
  if(!sound||!unlocked||document.hidden)return;
  try{
    ctx??=new(window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const now=ctx.currentTime,out=ctx.createGain();out.gain.value=kind==='bell'?.05:.022;out.connect(ctx.destination);
    const tones={bell:[[1318,0],[1976,0],[2637,.0],[1318,.32],[1976,.32]],glass:[[880,0],[1320,.04]],tick:[[520,0]],curtain:[[180,0],[240,.08]]}[kind]||[[520,0]];
    const length=kind==='bell'?1.8:kind==='curtain'?.9:.35;
    tones.forEach(([f,t])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='curtain'?'triangle':'sine';o.frequency.setValueAtTime(f,now+t);g.gain.setValueAtTime(0,now+t);g.gain.linearRampToValueAtTime(1,now+t+.01);g.gain.exponentialRampToValueAtTime(.0001,now+t+length);o.connect(g);g.connect(out);o.start(now+t);o.stop(now+t+length+.05);});
  }catch{}
}
const soundBtn=$('#sound');
function updateSound(){if(soundBtn){soundBtn.setAttribute('aria-pressed',String(sound));soundBtn.setAttribute('aria-label',sound?'효과음 켜짐':'효과음 꺼짐');}save('vh-sound',sound?'on':'off');if(bgm){if(sound)bgm.play().catch(()=>{});else bgm.pause();}}
soundBtn?.addEventListener('click',()=>{sound=!sound;updateSound();sfx('glass');});updateSound();

/* ---------- header state */
const hdr=$('.hdr');if(hdr){const onScroll=()=>hdr.classList.toggle('scrolled',scrollY>24);onScroll();addEventListener('scroll',onScroll,{passive:true});}

/* ---------- dialogs */
function openModal(d){if(!d||d.open)return;d.showModal();sfx('tick');if(!reduced.matches&&d.id==='directory')$$('.dir-nav a',d).forEach((a,i)=>a.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:700,delay:80+i*55,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));}
$('#menu-open')?.addEventListener('click',()=>openModal($('#directory')));
$$('dialog').forEach(d=>d.addEventListener('click',ev=>{if(ev.target===d||ev.target.tagName==='IMG'&&d.classList.contains('lightbox'))d.close();}));

/* ---------- page transitions */
function navigate(url){if(reduced.matches){location.href=url;return;}document.body.classList.add('leaving');setTimeout(()=>location.href=url,430);}
document.addEventListener('click',ev=>{const a=ev.target.closest('a[href]');if(!a||ev.defaultPrevented||ev.button||ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey||a.target||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.endsWith('.html')||url.pathname===location.pathname&&url.hash)return;ev.preventDefault();sfx('tick');navigate(a.href);});
addEventListener('pageshow',()=>document.body.classList.remove('leaving'));

/* ---------- entrance */
$('#enter')?.addEventListener('click',()=>{try{sessionStorage.setItem('vh-adult','yes');}catch{}window.name='VH_ADULT_SESSION';unlock();sfx('bell');setTimeout(()=>navigate('home.html'),reduced.matches?0:380);});
$$('[data-exit]').forEach(a=>a.addEventListener('click',()=>{try{sessionStorage.removeItem('vh-adult');}catch{}if(window.name==='VH_ADULT_SESSION')window.name='';}));

/* ---------- rumors */
let rumor=Math.floor(Math.random()*D.rumors.length);
function nextRumor(){const p=$('#rumor-text');if(!p)return;p.textContent=D.rumors[rumor++%D.rumors.length];if(!reduced.matches)p.animate([{opacity:0,filter:'blur(6px)'},{opacity:1,filter:'none'}],{duration:700});sfx('bell');}
$('#bell')?.addEventListener('click',()=>{nextRumor();openModal($('#rumor-dialog'));});
$('#rumor-next')?.addEventListener('click',nextRumor);

/* ---------- voices behind partitions */
let voice=Math.floor(Math.random()*D.voices.length);
function whisper(el){if(!el)return;el.classList.add('blur');setTimeout(()=>{el.textContent=D.voices[voice++%D.voices.length].replace(/^"|"$/g,'');el.classList.remove('blur');},reduced.matches?0:380);sfx('glass');}
$('#partition')?.addEventListener('click',()=>whisper($('#voice')));
$$('.booth').forEach(b=>{let t;b.addEventListener('click',()=>whisper($('.booth-voice',b)));b.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse')t=setTimeout(()=>whisper($('.booth-voice',b)),600);});b.addEventListener('pointerleave',()=>clearTimeout(t));});

/* ---------- characters */
let cast=0;
function selectCast(i){
  const list=D.characters;cast=(i+list.length)%list.length;const ch=list[cast];
  const sec=$('.cast');sec.style.setProperty('--c',ch.color);
  $$('.cast-slide').forEach(s=>s.classList.toggle('on',+s.dataset.slide===cast));
  $('#cast-en').textContent=ch.en;$('#cast-name').textContent=ch.name;$('#cast-meta').textContent=ch.race+' · '+ch.age+'세';
  $('#cast-role').textContent=ch.role;$('#cast-quote').textContent='“'+ch.hook+'”';$('#cast-link').href='char/'+ch.slug+'.html';
  $('#cast-count').textContent=pad(cast+1)+' / '+pad(list.length);$('#cast-group').textContent=(ch.group==='직원'?'Staff':'Guest')+' · '+ch.group;
  $$('[data-cast]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.cast===cast)));
  const copy=$('.cast-copy');copy.classList.remove('swap');void copy.offsetWidth;copy.classList.add('swap');
  const pick=$(`[data-cast="${cast}"]`),rail=$('.cast-picker');if(rail.scrollWidth>rail.clientWidth)rail.scrollTo({left:pick.offsetLeft-rail.clientWidth/2+pick.clientWidth/2,behavior:reduced.matches?'auto':'smooth'});
  sfx('tick');
}
if(D.page==='characters'){
  $$('[data-cast]').forEach(b=>b.addEventListener('click',()=>selectCast(+b.dataset.cast)));
  $$('[data-cast-step]').forEach(b=>b.addEventListener('click',()=>selectCast(cast+ +b.dataset.castStep)));
  let sx=null;const stage=$('.cast');stage.addEventListener('touchstart',e=>{if(!e.target.closest('.cast-picker'))sx=e.touches[0].clientX;},{passive:true});stage.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>60)selectCast(cast+(dx<0?1:-1));});
  // relations: highlight one character's lines
  const map=$('.rel-map'),relList=$('.rel-list');
  function focusNode(slug){map.classList.toggle('focus',!!slug);relList.classList.toggle('dim',!!slug);
    $$('.rel-node').forEach(n=>n.classList.toggle('hit',n.dataset.node===slug));
    $$('[data-rel]').forEach(x=>{const hit=x.dataset.a===slug||x.dataset.b===slug;x.classList.toggle('hit',hit);if(hit&&x.tagName!=='LI'){$$('.rel-node').forEach(n=>{if(n.dataset.node===x.dataset.a||n.dataset.node===x.dataset.b)n.classList.add('hit');});}});}
  let pinned=null;
  $$('.rel-node').forEach(n=>{n.addEventListener('pointerenter',()=>{if(!pinned)focusNode(n.dataset.node);});n.addEventListener('pointerleave',()=>{if(!pinned)focusNode(null);});n.addEventListener('click',()=>{pinned=pinned===n.dataset.node?null:n.dataset.node;focusNode(pinned);sfx('tick');});n.addEventListener('focus',()=>{if(!pinned)focusNode(n.dataset.node);});n.addEventListener('blur',()=>{if(!pinned)focusNode(null);});});
}

/* ---------- character chart */
const chartIndex=D.characters.findIndex(c=>c.slug===D.character);
let expression=0,variant=0,loadTicket=0;
async function showImage(src){
  const img=$('.viewer-img');if(!img)return;const full=D.prefix+src,ticket=++loadTicket;
  const next=new Image();next.src=full;try{await next.decode();}catch{}
  if(ticket!==loadTicket)return;img.src=full;$('.viewer-blur').style.backgroundImage=`url("${full}")`;
  if(!reduced.matches)img.animate([{opacity:0,transform:'scale(1.02)'},{opacity:1,transform:'none'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});
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
  if(group.length>1)group.forEach((src,i)=>{const b=document.createElement('button'),im=new Image();b.type='button';b.dataset.variant=i;b.setAttribute('aria-label',D.expressions[n]+' '+(i+1));im.src=D.prefix+src;im.alt='';im.loading='lazy';im.decoding='async';b.append(im);b.addEventListener('click',()=>{variant=i;drawExpression();sfx('tick');});strip.append(b);});
  drawExpression();
}
function stepVariant(s){const g=D.characters[chartIndex].gallery[expression];if(g.length<2)return;variant=(variant+s+g.length)%g.length;drawExpression();sfx('tick');}
function setFacing(side){
  $$('[data-facing]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.facing===side)));
  const dots=$('#map-dots'),list=$('#knot-list');dots.replaceChildren();list.replaceChildren();
  D.knots[D.character][side].forEach(([x,y,name,type],k)=>{
    const dot=document.createElement('span');dot.className='knot-dot '+(type||'');dot.style.left=x+'%';dot.style.top=y+'%';dot.style.animationDelay=k*.3+'s';dots.append(dot);
    const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className=type||'';b.textContent=name+(type?' · '+D.copy.sensitive:'');
    const on=v=>{dot.classList.toggle('on',v);b.classList.toggle('on',v);};
    b.addEventListener('pointerenter',()=>on(true));b.addEventListener('pointerleave',()=>on(false));b.addEventListener('focus',()=>on(true));b.addEventListener('blur',()=>on(false));
    li.append(b);list.append(li);
  });
}
if(D.page==='chart'){
  setExpression(0);setFacing('front');
  $$('[data-expression]').forEach(b=>b.addEventListener('click',()=>{setExpression(+b.dataset.expression);sfx('tick');}));
  $$('[data-facing]').forEach(b=>b.addEventListener('click',()=>{setFacing(b.dataset.facing);sfx('tick');}));
  $('#expr-prev').addEventListener('click',()=>stepVariant(-1));$('#expr-next').addEventListener('click',()=>stepVariant(1));
  const zoom=()=>{const img=$('.viewer-img'),box=$('#art-lightbox img');box.src=img.src;box.alt=img.alt;openModal($('#art-lightbox'));};
  $('.viewer-zoom').addEventListener('click',zoom);
  let sx=null,swiped=false;const frame=$('.viewer-frame');
  frame.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;swiped=false;},{passive:true});
  frame.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>60){swiped=true;stepVariant(dx<0?1:-1);}});
  $('.viewer-img').addEventListener('click',()=>{if(!swiped)zoom();swiped=false;});
}

/* ---------- guide */
if(D.page==='rules'){
  const links=$$('[data-spy]');
  const spy=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.dataset.spy===en.target.id));const on=$('.guide-toc a.on');const toc=$('.guide-toc');if(on&&toc.scrollWidth>toc.clientWidth)toc.scrollTo({left:on.offsetLeft-16,behavior:'smooth'});}}),{rootMargin:'-35% 0px -60% 0px'});
  $$('.guide-sec').forEach(s=>spy.observe(s));
  $$('[data-depth]').forEach(b=>b.addEventListener('click',()=>{$$('[data-depth]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sfx('tick');}));
  const heat=$('#heat-range'),wrap=$('.heat');
  const setHeat=()=>{const v=+heat.value;wrap.style.setProperty('--h',v/4);$('#heat-label').textContent=D.heat[v];heat.setAttribute('aria-valuetext',D.heat[v]);$$('.heat-ticks li').forEach(li=>li.classList.toggle('on',+li.dataset.tick===v));};
  heat.addEventListener('input',()=>{setHeat();sfx('tick');});setHeat();
  $$('.heat-ticks li').forEach(li=>li.addEventListener('click',()=>{heat.value=li.dataset.tick;setHeat();sfx('tick');}));
  $$('[data-oil]').forEach(b=>b.addEventListener('click',()=>{
    $$('[data-oil]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const k=b.dataset.oil;
    $('#oil-name').textContent=k==='unknown'?D.copy.unknown:D.copy[k];$('#oil-note').textContent=D.copy[k==='unknown'?'unknown_result':k+'_effect'];
    if(!reduced.matches)$('.oil-card').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:500});sfx('glass');
  }));
}

/* ---------- treatment curtain */
function curtain(open){document.body.classList.toggle('curtains-open',open);$('#draw-curtain')?.setAttribute('aria-expanded',String(open));sfx('curtain');if(open)setTimeout(()=>whisper($('.booth-voice')),reduced.matches?0:1500);}
$('#draw-curtain')?.addEventListener('click',()=>curtain(true));
$('#close-curtain')?.addEventListener('click',()=>curtain(false));

/* ---------- city */
let place=0;
function selectPlace(i,scroll=true){
  place=(i+D.places.length)%D.places.length;const p=D.places[place],img=$('.place-img');
  img.src=D.prefix+D.config.BACKGROUND_DIR+'/'+p.code+'.webp';img.alt=p.name;img.classList.remove('swap');void img.offsetWidth;img.classList.add('swap');
  $('#place-name').textContent=p.name;$('#place-number').textContent=pad(place+1);$('#place-text').textContent=p.text;
  const guest=$('#place-guest');guest.replaceChildren();
  const ch=D.characters.find(c=>c.name===p.guest);
  if(ch){const a=document.createElement('a');a.className='guest-link';a.href='char/'+ch.slug+'.html';a.style.setProperty('--c',ch.color);a.innerHTML=`<img src="${D.prefix+ch.portrait}" alt="" style="object-position:${ch.face[0]}% ${ch.face[1]}%"><span><small>${D.copy.from_here}</small><strong></strong></span>`;$('strong',a).textContent=ch.name+' · '+ch.role;guest.append(a);}
  $$('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.place===place)));
  const scroller=$('.map-scroll'),pin=$(`.pin[data-place="${place}"]`);
  if(scroll&&scroller.scrollWidth>scroller.clientWidth)scroller.scrollTo({left:pin.offsetLeft-scroller.clientWidth/2,behavior:reduced.matches?'auto':'smooth'});
  sfx('tick');
}
if(D.page==='city'){
  $$('[data-place]').forEach(b=>b.addEventListener('click',()=>selectPlace(+b.dataset.place)));
  $$('[data-place-step]').forEach(b=>b.addEventListener('click',()=>selectPlace(place+ +b.dataset.placeStep)));
  const scroller=$('.map-scroll'),center=()=>{const pin=$('.pin[aria-pressed=true]');if(scroller.scrollWidth>scroller.clientWidth)scroller.scrollLeft=pin.offsetLeft-scroller.clientWidth/2;};
  $('.map-img').complete?center():$('.map-img').addEventListener('load',center);
}

/* ---------- start */
function mode(key){
  $$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===key)));
  $$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==key);
  const text=D.config.PROLOGUES[key],pro=$('#prologue');
  if(key==='opening'){pro.textContent=text||D.copy.prologue_empty;pro.classList.toggle('empty',!text);}
  sfx('tick');
}
if(D.page==='start'){
  $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));mode('opening');
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

/* ---------- pointer parallax */
const par=$('[data-parallax]');
if(par&&matchMedia('(pointer:fine)').matches){let raf=0,px=0,py=0;addEventListener('pointermove',e=>{if(reduced.matches||document.hidden)return;px=(e.clientX/innerWidth-.5)*-14;py=(e.clientY/innerHeight-.5)*-8;if(!raf)raf=requestAnimationFrame(()=>{par.style.transform=`translate3d(${px}px,${py}px,0)`;raf=0;});},{passive:true});}

/* ---------- lamplight motes */
const canvas=$('#motes');
if(canvas){const c2=canvas.getContext('2d');let w=0,h=0,frame=0,last=0;const dots=Array.from({length:42},(_,i)=>({x:.35+((i*.6180339)%1)*.65,y:(i*.37)%1,r:.6+(i%4)*.45,s:.006+(i%5)*.003,a:.15+(i%3)*.12}));
  const resize=()=>{const dpr=Math.min(devicePixelRatio||1,1.5);w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;c2.setTransform(dpr,0,0,dpr,0,0);};
  const draw=t=>{if(document.hidden||reduced.matches){frame=0;return;}const dt=Math.min((t-last)/1000,.05);last=t;c2.clearRect(0,0,w,h);for(const p of dots){p.y-=p.s*dt;if(p.y<-.02)p.y=1.02;const x=p.x*w+Math.sin(t/3000+p.y*9)*14,y=p.y*h;const g=c2.createRadialGradient(x,y,0,x,y,p.r*4);g.addColorStop(0,`rgba(255,214,150,${p.a})`);g.addColorStop(1,'rgba(255,214,150,0)');c2.fillStyle=g;c2.beginPath();c2.arc(x,y,p.r*4,0,Math.PI*2);c2.fill();}frame=requestAnimationFrame(draw);};
  const resume=()=>{if(!document.hidden&&!reduced.matches&&!frame){last=performance.now();frame=requestAnimationFrame(draw);}};
  resize();addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',resume);resume();}

document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('page-hidden',document.hidden);if(bgm){if(document.hidden)bgm.pause();else if(sound&&unlocked)bgm.play().catch(()=>{});}});
})();
