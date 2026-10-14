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
    ev.currentTarget.textContent=open?'커튼 닫기':'커튼 열기';
    $('.curtain-destination').hidden=!open;sfx('door');
  });
  const lightbox=$('#art-lightbox');
  function zoomPortrait(root){
    const source=$('img',root);if(!source)return;
    $('img',lightbox).src=source.src;$('img',lightbox).alt=source.alt;
    lightbox.showModal();
  }
  $$('[data-portrait]').forEach(root=>{
    const zoom=document.createElement('button');zoom.className='zoom-art';zoom.innerHTML='<svg class="control-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
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
    ev.preventDefault();const label=$('.transition-label');if(label)label.textContent=a.textContent.replace(/\s+/g,' ').trim();document.body.classList.add('leaving');
    setTimeout(()=>location.href=a.href,720);
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
