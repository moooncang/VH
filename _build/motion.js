  // V3: short, state-driven motion. No motion is required to use the interface.
  const liveMotions=new Set();
  function move(node,frames,options={}){
    if(!node||reduced.matches||document.hidden)return;
    const animation=node.animate(frames,{duration:520,easing:'cubic-bezier(.16,1,.3,1)',...options});
    liveMotions.add(animation);animation.finished.catch(()=>{}).finally(()=>liveMotions.delete(animation));return animation;
  }
  function stopMotion(){for(const motion of liveMotions)motion.cancel();liveMotions.clear();}
  reduced.addEventListener('change',()=>{if(reduced.matches)stopMotion();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMotion();});
  const selectedStage=$('#selected-person');
  if(selectedStage){
    const flare=document.createElement('div');flare.className='selection-flare';flare.setAttribute('aria-hidden','true');selectedStage.append(flare);
    const edge=document.createElement('div');edge.className='stage-edge';edge.setAttribute('aria-hidden','true');selectedStage.append(edge);
    selectedStage.addEventListener('personchange',()=>{
      $$('.character-caption>*',selectedStage).forEach((node,index)=>{
        node.getAnimations().forEach(a=>a.cancel());
        move(node,[{opacity:0,transform:'translateX(35px)'},{opacity:1,transform:'translateX(0)'}],{delay:index*45,duration:550});
      });
      flare.classList.remove('play');void flare.offsetWidth;if(!reduced.matches)flare.classList.add('play');
      move($('.portrait-counter'),[{transform:'translateY(-14px)',opacity:.2},{transform:'none',opacity:1}],{duration:400});
    });
  }
  $$('[data-portrait]').forEach(root=>root.addEventListener('portraitchange',()=>{
    const image=$('img',root);image?.getAnimations().forEach(a=>a.cancel());
    move(image,[{opacity:.25,transform:'translateX(24px) scale(1.035)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:680});
  }));
  // Stagger the real UI items only when they first enter view.
  const reveal=new IntersectionObserver(entries=>{
    entries.forEach(({target,isIntersecting})=>{
      if(!isIntersecting)return;reveal.unobserve(target);
      move(target,[{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}],{delay:Number(target.dataset.motionDelay||0),duration:600});
    });
  },{threshold:.08});
  $$('.room-tabs a,.hotspot,.person-row,.mode-slot,.place-row').forEach((node,i)=>{
    node.dataset.motionDelay=String((i%6)*55);reveal.observe(node);
  });
  // The gold impulse follows the press, rather than looping over the page.
  document.addEventListener('pointerdown',ev=>{
    if(reduced.matches||!ev.target.closest('button,a')||ev.button!==0)return;
    const button=ev.target.closest('button,a');
    const artwork=$('.ui-art',button);
    if(artwork)move(artwork,[{scale:'1'},{scale:'.86',offset:.25},{scale:'1.08',offset:.65},{scale:'1'}],{duration:360});
    for(let i=0;i<6;i++){
      const spark=document.createElement('i');spark.className='click-burst';spark.style.left=ev.clientX+'px';spark.style.top=ev.clientY+'px';document.body.append(spark);
      const angle=Math.PI*2*i/6,dist=18+Math.random()*24;
      const animation=move(spark,[{opacity:.9,transform:'translate(0,0) rotate(0deg)'},{opacity:0,transform:`translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) rotate(120deg)`}],{duration:430});
      if(animation)animation.finished.catch(()=>{}).finally(()=>spark.remove());else spark.remove();
    }
  },{passive:true});
  // Actual icon strokes draw on focus/hover, with the final icon always present.
  $$('button,a').forEach(control=>{
    const draw=()=>{$$('svg.control-icon path',control).forEach(path=>{
      const length=path.getTotalLength();move(path,[{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:420});
    });};
    control.addEventListener('pointerenter',draw);control.addEventListener('focus',draw);
  });
  const modalMotion=new MutationObserver(records=>records.forEach(({target})=>{
    if(!target.open)return;
    move(target,[{opacity:0,transform:'translateY(28px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:480});
    $$('.directory-room',target).forEach((tile,i)=>move(tile,[{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],{delay:70+i*55,duration:550}));
  }));
  $$('dialog').forEach(dialog=>modalMotion.observe(dialog,{attributes:true,attributeFilter:['open']}));
  $$('[data-book]').forEach(button=>button.addEventListener('click',()=>{
    const page=$('[data-book-page]:not([hidden])');
    move(page,[{opacity:0,transform:'perspective(900px) rotateY(-8deg) translateX(20px)'},{opacity:1,transform:'none'}],{duration:500});
  }));
  $$('[data-oil]').forEach(button=>button.addEventListener('click',()=>move($('#oil-note'),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:500})));
  $$('[data-place]').forEach(button=>button.addEventListener('click',()=>{
    move($('.city-info'),[{opacity:0,transform:'translateX(25px)'},{opacity:1,transform:'none'}],{duration:500});
  }));
  // Warm the next portrait only; the 450 expression variants remain on demand.
  if(selectedStage){
    selectedStage.addEventListener('personchange',()=>{
      const next=new Image();next.src=D.prefix+D.characters[(selected+1)%D.characters.length].portrait;
    });
  }
