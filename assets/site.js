'use strict';
(() => {
  const D=JSON.parse(document.getElementById('site-data').textContent);
  const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
  const read=(k,f)=>{try{return localStorage.getItem(k)??f;}catch{return f;}};
  const save=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let period=['day','evening','night'].includes(read('vh-time',''))?read('vh-time'):'evening';
  let sound=read('vh-sound','on')==='on', ctx, unlocked=false, bgm;
  function unlock(){unlocked=true;if(sound)audio();if(D.config.BGM&&!bgm){bgm=new Audio(D.prefix+D.config.BGM);bgm.loop=true;bgm.volume=period==='night'?.12:.22;if(sound)bgm.play().catch(()=>{});}}
  function audio(){try{ctx??=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});}catch{}return ctx;}
  function sfx(kind='bell'){
    if(!sound||!unlocked||document.hidden)return;
    const ac=audio();if(!ac)return;const now=ac.currentTime;
    const tones={bell:[880,1320,1760],door:[660,990,1320],step:[95,72],fire:[160,230,320],paper:[1700,2100],bottle:[420,840],water:[1100,600]};
    (tones[kind]||tones.bell).forEach((freq,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=['step','paper','fire'].includes(kind)?'triangle':'sine';o.frequency.setValueAtTime(freq,now+i*.045);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.75),now+.3+i*.045);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.022,now+.012+i*.045);g.gain.exponentialRampToValueAtTime(.0001,now+.45+i*.045);o.connect(g);g.connect(ac.destination);o.start(now);o.stop(now+.65);});
  }
  document.addEventListener('pointerdown',()=>unlock(),{once:true});
  document.addEventListener('keydown',()=>unlock(),{once:true});
  function updateSound(){ $('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',D.copy.sound+(sound?' 끄기':' 켜기'));$('#sound').classList.toggle('muted',!sound);save('vh-sound',sound?'on':'off');if(bgm){if(sound)bgm.play().catch(()=>{});else bgm.pause();}}
  function setTime(id,play=true){period=id;document.documentElement.dataset.time=id;save('vh-time',id);const t=D.times.find(x=>x.id===id);$$('[data-time]').filter(x=>x.tagName==='BUTTON').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.time===id)));$$('[data-period]').forEach(x=>x.textContent=t.name);$$('[data-status]').forEach(x=>x.textContent=t.status);$$('[data-hours]').forEach(x=>x.textContent=t.note);if(D.page==='treatment')$('[data-scene]').src=D.prefix+D.config.BACKGROUND_DIR+'/'+(id==='night'?'N':'T')+'.webp';if(bgm)bgm.volume=id==='night'?.12:id==='day'?.18:.22;if(play)sfx('fire');}
  function changeTime(){setTime(D.times[(D.times.findIndex(t=>t.id===period)+1)%3].id);}
  $$('button[data-time]').forEach(x=>x.addEventListener('click',()=>setTime(x.dataset.time)));
  $('#sound').addEventListener('click',()=>{sound=!sound;updateSound();sfx('bottle');});
  setTime(period,false);updateSound();
  $$('[data-date]').forEach(x=>{x.textContent=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(new Date());});
  function exit(){try{sessionStorage.removeItem('vh-adult');}catch{}if(window.name==='VH_ADULT_SESSION')window.name='';}
  $$('[data-exit]').forEach(a=>a.addEventListener('click',exit));
  const dialog=$('#room-menu');$('#menu-open').addEventListener('click',()=>dialog.showModal());dialog.addEventListener('click',ev=>{if(ev.target===dialog){const b=dialog.getBoundingClientRect();if(ev.clientX<b.left||ev.clientX>b.right||ev.clientY<b.top||ev.clientY>b.bottom)dialog.close();}});
  $$('a').forEach(a=>a.addEventListener('click',()=>sfx('step')));
  $('#enter')?.addEventListener('click',()=>{try{sessionStorage.setItem('vh-adult','yes');}catch{}window.name='VH_ADULT_SESSION';sfx('door');document.body.classList.add('entering');setTimeout(()=>location.href='home.html',reduced.matches?0:650);});
  let rumor=0;function nextRumor(){ $('#rumor-text').textContent=D.rumors[rumor++%D.rumors.length];$('#rumor-note').hidden=false;$('#bell').setAttribute('aria-expanded','true');sfx('bell');}
  $('#bell').addEventListener('click',nextRumor);$('#rumor-close').addEventListener('click',()=>{$('#rumor-note').hidden=true;$('#bell').setAttribute('aria-expanded','false');$('#bell').focus();});
  let partitionTimer,voice=0,nearPartition=false;
  function showVoice(){if(document.hidden||!nearPartition)return;$('#voice').textContent=D.voices[voice++%D.voices.length].replace(/^"|"$/g,'');$('#partition').classList.add('listening');}
  const partition=$('#partition');
  if(partition){partition.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse'){nearPartition=true;showVoice();}});partition.addEventListener('pointerleave',()=>{nearPartition=false;clearTimeout(partitionTimer);/* Keep the last heard line visible. */});partition.addEventListener('pointerdown',()=>{nearPartition=true;partitionTimer=setTimeout(showVoice,550);});['pointerup','pointercancel'].forEach(event=>partition.addEventListener(event,()=>{clearTimeout(partitionTimer);nearPartition=false;}));partition.addEventListener('click',ev=>{nearPartition=true;showVoice();nearPartition=false;});}
  // A single visibility-aware clock; no background updates when the page is hidden.
  let visible=new Set();const obs=new IntersectionObserver(entries=>entries.forEach(en=>en.isIntersecting?visible.add(en.target):visible.delete(en.target)));
  $$('.rumor-wall,#partition,.bell-note').forEach(x=>obs.observe(x));
  setInterval(()=>{if(document.hidden||reduced.matches)return;if(nearPartition&&visible.has(partition))showVoice();const notes=$$('.pinned-note');if(notes.length&&visible.has($('.rumor-wall'))){const i=Math.floor(rumor/4)%notes.length;notes[i].textContent=D.rumors[rumor++%D.rumors.length];}if(!$('#rumor-note').hidden&&visible.has($('#rumor-note')))$('#rumor-text').textContent=D.rumors[rumor++%D.rumors.length];},9000);
  function renderPortrait(root,ch,src){const placeholder=$('.portrait-placeholder',root);$('span',placeholder).textContent=ch.code;let img=$('img',root);root.style.setProperty('--person',ch.color);if(!src){img?.remove();placeholder.hidden=false;return;}placeholder.hidden=true;if(!img){img=new Image();root.append(img);}img.alt=ch.name;img.onload=()=>{placeholder.hidden=true;};img.onerror=()=>{img.remove();placeholder.hidden=false;};img.src=D.prefix+src;}
  let selected=0;function selectPerson(index){selected=index;const ch=D.characters[index];const stage=$('#selected-person');if(!stage)return;stage.style.setProperty('--person',ch.color);renderPortrait($('[data-portrait]',stage),ch,ch.availablePortrait?ch.portrait:'');$('#person-meta').textContent=`${ch.race} · ${ch.age} · ${ch.role}`;$('#person-name').textContent=ch.name;$('#person-count').textContent=String(index+1).padStart(2,'0');$('#person-hook').textContent='“'+ch.hook+'”';$('#chart-link').href='char/'+ch.slug+'.html';$$('[data-person]').forEach(x=>{x.classList.toggle('selected',+x.dataset.person===index);x.setAttribute('aria-pressed',String(+x.dataset.person===index));});}
  function filter(group){$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x.dataset.filter===group);x.setAttribute('aria-pressed',String(x.dataset.filter===group));});$$('[data-person]').forEach(x=>x.hidden=group!=='전체'&&x.dataset.group!==group);selectPerson(group==='전체'?0:D.characters.findIndex(x=>x.group===group));}
  $$('[data-filter]').forEach(x=>x.addEventListener('click',()=>filter(x.dataset.filter)));
  $$('[data-person]').forEach(x=>{x.addEventListener('click',()=>selectPerson(+x.dataset.person));x.addEventListener('focus',()=>selectPerson(+x.dataset.person));});
  if(D.page==='characters')filter('전체');
  const chartIndex=D.characters.findIndex(x=>x.slug===D.character);let expression=1,variant=0,facing='front';
  function drawExpression(){const ch=D.characters[chartIndex],group=ch.gallery[expression-1];renderPortrait($('[data-portrait]'),ch,group[variant]||'');$('#expression-title').textContent=D.expressions[expression-1]+' · '+(group.length?`${variant+1} / ${group.length}`:D.copy.variant_empty);$('#expr-prev').disabled=group.length<2;$('#expr-next').disabled=group.length<2;$$('[data-expression]').forEach(x=>{x.classList.toggle('active',+x.dataset.expression===expression);x.setAttribute('aria-pressed',String(+x.dataset.expression===expression));});$$('[data-variant]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.variant===variant)));sfx('paper');}
  function setExpression(n){expression=n;const ch=D.characters[chartIndex],group=ch.gallery[expression-1];variant=group.length?Math.floor(Math.random()*group.length):0;$('#variant-thumbs').replaceChildren();if(group.length>1)group.forEach((src,i)=>{const b=document.createElement('button'),img=new Image();b.className='variant-thumb';b.dataset.variant=i;b.setAttribute('aria-label',D.expressions[expression-1]+' '+D.copy.variant+' '+(i+1));img.src=D.prefix+src;img.alt='';img.loading='lazy';b.append(img);b.addEventListener('click',()=>{variant=i;drawExpression();});$('#variant-thumbs').append(b);});drawExpression();}
  function nextVariant(delta){const group=D.characters[chartIndex].gallery[expression-1];variant=group.length?(variant+delta+group.length)%group.length:0;drawExpression();}
  function setFacing(value){facing=value;$$('[data-facing]').forEach(x=>{x.classList.toggle('active',x.dataset.facing===facing);x.setAttribute('aria-pressed',String(x.dataset.facing===facing));});$('#map-dots').replaceChildren();for(const [x,y,name,type] of D.knots[D.character][facing]){const dot=document.createElement('button');dot.className='knot-dot '+(type||'');dot.style.left=x+'%';dot.style.top=y+'%';dot.setAttribute('aria-label',name+(type?' · '+D.copy.sensitive:''));dot.addEventListener('click',()=>{$('#knot-label').textContent=name+(type?' · '+D.copy.sensitive:'');sfx('water');});$('#map-dots').append(dot);}$('#knot-label').textContent=D.copy.knots;}
  if(D.page==='chart'){setFacing('front');setExpression(1);$$('[data-facing]').forEach(x=>x.addEventListener('click',()=>setFacing(x.dataset.facing)));$$('[data-expression]').forEach(x=>x.addEventListener('click',()=>setExpression(+x.dataset.expression)));$('#expr-prev').addEventListener('click',()=>nextVariant(-1));$('#expr-next').addEventListener('click',()=>nextVariant(1));}
  $$('[data-oil]').forEach(x=>x.addEventListener('click',()=>{const key=x.dataset.oil;$('#oil-note').textContent=D.copy[key==='unknown'?'unknown_result':key+'_effect'];sfx(key==='unknown'?'bottle':'water');$$('[data-oil]').forEach(b=>{b.classList.toggle('selected',b===x);b.setAttribute('aria-pressed',String(b===x));});}));
  $$('[data-heat]').forEach(x=>x.addEventListener('click',()=>{$$('[data-heat]').forEach(b=>{b.classList.toggle('active',b===x);b.setAttribute('aria-pressed',String(b===x));});sfx('fire');}));
  let place=0;function selectPlace(index){place=(index+D.places.length)%D.places.length;const p=D.places[place];$('[data-scene]').src=D.prefix+D.config.BACKGROUND_DIR+'/'+p.code+'.webp';$('[data-scene]').alt=p.name;$('#place-name').textContent=p.name;$('#place-text').textContent=p.text;$('#place-guest').textContent=p.guest?D.copy.from_here+' · '+p.guest:'';$('#place-number').textContent=String(place+1).padStart(2,'0')+' / VEILHAUN';$$('[data-place]').forEach(x=>{x.classList.toggle('active',+x.dataset.place===place);x.setAttribute('aria-pressed',String(+x.dataset.place===place));});sfx('step');}
  $$('[data-place]').forEach(x=>x.addEventListener('click',()=>selectPlace(+x.dataset.place)));
  function mode(key){$$('[data-mode]').forEach(x=>{x.classList.toggle('active',x.dataset.mode===key);x.setAttribute('aria-pressed',String(x.dataset.mode===key));});$('#free-form').hidden=key!=='free';const p=document.createElement('p');p.textContent=D.config.PROLOGUES[key]||D.copy.prologue_empty;p.className=D.config.PROLOGUES[key]?'':'empty-copy';$('#prologue').replaceChildren(p);sfx('paper');}
  $$('[data-mode]').forEach(x=>x.addEventListener('click',()=>mode(x.dataset.mode)));
  if(D.page==='start'){mode('opening');$('#free-form').addEventListener('submit',async ev=>{ev.preventDefault();const f=new FormData(ev.target);const text=[D.copy.day_count+': '+f.get('day'),D.copy.money+': '+f.get('money'),D.copy.reputation+': '+f.get('rep'),D.copy.known+': '+f.get('relations')].join('\n');try{await navigator.clipboard.writeText(text);$('#copy-status').textContent=D.copy.copied;}catch{$('#copy-status').textContent=D.copy.copy_failed;$('#copy-fallback').hidden=false;$('#copy-fallback').value=text;$('#copy-fallback').select();}});}
  document.addEventListener('keydown',ev=>{if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.repeat)return;if(ev.key==='Escape'){if(!$('dialog[open]')){ev.preventDefault();dialog.showModal();}return;}if($('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)||ev.target.isContentEditable)return;const k=ev.key.toLowerCase();if(k==='t'){ev.preventDefault();changeTime();}else if(k==='m'){sound=!sound;updateSound();}else if(/^[1-6]$/.test(k)&&D.page!=='index'){location.href=D.prefix+['home','characters','rules','treatment','city','start'][+k-1]+'.html';}else if(k==='7'){dialog.showModal();}else if(k==='enter'&&!ev.target.closest('a,button,summary')){ev.preventDefault();nextRumor();}else if(D.page==='chart'){if(['arrowleft','arrowright'].includes(k)){ev.preventDefault();nextVariant(k==='arrowleft'?-1:1);}else if(['q','e'].includes(k)){location.href=D.characters[(chartIndex+(k==='q'?4:1))%5].slug+'.html';}}else if(D.page==='city'&&['arrowup','arrowdown'].includes(k)){ev.preventDefault();selectPlace(place+(k==='arrowup'?-1:1));}});
  document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('page-hidden',document.hidden);if(bgm){if(document.hidden)bgm.pause();else if(sound&&unlocked)bgm.play().catch(()=>{});}});
  $$('img').forEach(img=>img.addEventListener('error',()=>{if(img.closest('[data-portrait]')){img.hidden=true;$('.portrait-placeholder',img.parentElement).hidden=false;}else img.style.visibility='hidden';}));
  // Objects, notebook and gallery interactions share the native dialog lifecycle.
  $$('[data-open]').forEach(button=>button.addEventListener('click',()=>{
    document.getElementById(button.dataset.open).showModal();sfx('paper');
  }));
  $$('dialog').forEach(modal=>modal.addEventListener('click',ev=>{
    if(ev.target!==modal)return;
    const r=modal.getBoundingClientRect();
    if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)modal.close();
  }));
  $$('[data-person-step]').forEach(button=>button.addEventListener('click',()=>{
    const visible=$$('[data-person]').filter(b=>!b.hidden).map(b=>+b.dataset.person);
    selectPerson(visible[(visible.indexOf(selected)+ +button.dataset.personStep+visible.length)%visible.length]);sfx('paper');
  }));
  let bookPage=0;
  function turnBook(n){
    bookPage=(n+3)%3;
    $$('[data-book-page]').forEach(page=>page.hidden=+page.dataset.bookPage!==bookPage);
    $$('[data-book]').forEach(button=>button.setAttribute('aria-pressed',String(+button.dataset.book===bookPage)));
    $('#book-count').textContent=String(bookPage+1).padStart(2,'0')+' / 03';sfx('paper');
  }
  $$('[data-book]').forEach(button=>button.addEventListener('click',()=>turnBook(+button.dataset.book)));
  $$('[data-book-step]').forEach(button=>button.addEventListener('click',()=>turnBook(bookPage+ +button.dataset.bookStep)));
  $$('[data-heat]').forEach(button=>button.addEventListener('click',()=>{
    $('.heat-meter').style.setProperty('--heat',((+button.dataset.heat+1)/$$('[data-heat]').length*100)+'%');
    $('.heat-label').textContent=button.textContent;
  }));
  $('#draw-curtain')?.addEventListener('click',ev=>{
    const open=!$('.treatment-room').classList.contains('curtains-open');
    $('.treatment-room').classList.toggle('curtains-open',open);
    ev.currentTarget.setAttribute('aria-expanded',String(open));
    ev.currentTarget.textContent=open?'커튼 닫기 ↙':'커튼 걷어 보기 ↗';
    $('.curtain-destination').hidden=!open;sfx('door');
  });
  const lightbox=$('#art-lightbox');
  function zoomPortrait(root){
    const source=$('img',root);if(!source)return;
    $('img',lightbox).src=source.src;$('img',lightbox).alt=source.alt;
    lightbox.showModal();
  }
  $$('[data-portrait]').forEach(root=>{
    const zoom=document.createElement('button');zoom.className='zoom-art';zoom.textContent='⤢';
    zoom.setAttribute('aria-label','그림 크게 보기');zoom.addEventListener('click',()=>zoomPortrait(root));root.append(zoom);
    let touch,swiped=false;
    root.addEventListener('click',ev=>{if(ev.target.tagName==='IMG'&&!swiped)zoomPortrait(root);});
    root.addEventListener('pointerdown',ev=>{swiped=false;if(ev.pointerType==='touch')touch={x:ev.clientX,y:ev.clientY};});
    root.addEventListener('pointerup',ev=>{
      if(!touch)return;const dx=ev.clientX-touch.x,dy=ev.clientY-touch.y;touch=null;
      if(Math.abs(dx)>70&&Math.abs(dy)<45){swiped=true;
        if(D.page==='chart')nextVariant(dx<0?1:-1);
        else if(D.page==='characters')$(`[data-person-step="${dx<0?1:-1}"]`).click();
      }
    });
  });
  // Local navigation fades without intercepting external links or modifier clicks.
  document.addEventListener('click',ev=>{
    const a=ev.target.closest('a[href]');
    if(!a||ev.defaultPrevented||ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey||a.target||a.hasAttribute('download'))return;
    const dest=new URL(a.href,location.href);
    if(dest.origin!==location.origin||dest.hash||!dest.pathname.endsWith('.html'))return;
    if(reduced.matches)return;
    ev.preventDefault();document.body.classList.add('leaving');
    setTimeout(()=>location.href=a.href,280);
  });
  window.addEventListener('pageshow',()=>document.body.classList.remove('leaving','entering'));
  // Restrained parallax; disabled for touch and motion-sensitive visitors.
  const environment=$('.environment');
  if(environment&&matchMedia('(pointer:fine)').matches){
    document.addEventListener('pointermove',ev=>{
      if(reduced.matches||document.hidden)return;
      environment.style.setProperty('--px',((ev.clientX/innerWidth-.5)*-10)+'px');
      environment.style.setProperty('--py',((ev.clientY/innerHeight-.5)*-7)+'px');
    },{passive:true});
  }
  // One visibility-aware animation loop for rain outside and dust inside.
  const canvas=$('#atmosphere'),paint=canvas.getContext('2d');
  let width=0,height=0,lastFrame=0,animation=0;
  const rain=D.page==='index';
  const particles=Array.from({length:rain?75:30},()=>({x:Math.random(),y:Math.random(),speed:.15+Math.random()*.4,size:.5+Math.random()*1.2,phase:Math.random()*6}));
  function resizeAtmosphere(){
    width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=width*ratio;canvas.height=height*ratio;paint.setTransform(ratio,0,0,ratio,0,0);
  }
  function frame(t){
    if(document.hidden||reduced.matches){animation=0;return;}
    const dt=Math.min((t-lastFrame)/1000,.05);lastFrame=t;paint.clearRect(0,0,width,height);
    for(const p of particles){
      p.y+=(rain?p.speed*.25:-p.speed*.018)*dt;p.x+=(rain?-.015:Math.sin(t/3000+p.phase)*.002)*dt;
      if(p.y>1.05)p.y=-.05;if(p.y<-.05)p.y=1.05;if(p.x<0)p.x=1;if(p.x>1)p.x=0;
      if(rain){paint.strokeStyle='rgba(185,210,202,.19)';paint.lineWidth=.65;paint.beginPath();paint.moveTo(p.x*width,p.y*height);paint.lineTo(p.x*width-3,p.y*height+12+p.speed*15);paint.stroke();}
      else{paint.fillStyle=`rgba(224,194,128,${.15+Math.sin(t/2000+p.phase)*.1})`;paint.beginPath();paint.arc(p.x*width,p.y*height,p.size,0,Math.PI*2);paint.fill();}
    }
    animation=requestAnimationFrame(frame);
  }
  function manageAnimation(){
    cancelAnimationFrame(animation);animation=0;
    if(!document.hidden&&!reduced.matches){lastFrame=performance.now();animation=requestAnimationFrame(frame);}
    else paint.clearRect(0,0,width,height);
  }
  resizeAtmosphere();manageAnimation();
  window.addEventListener('resize',resizeAtmosphere,{passive:true});
  document.addEventListener('visibilitychange',manageAnimation);
  reduced.addEventListener('change',manageAnimation);

})();
