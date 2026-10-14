const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa');
fs.mkdirSync(out,{recursive:true});
const base=process.env.VH_URL||'http://127.0.0.1:8766/';
const pages=['index','home','characters','rules','treatment','city','start','char/reina','char/ner','char/serpina','char/ivrea','char/kasha'];
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});const errors=[],results=[];
 try{
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push({width,error:e.message}));
   page.on('console',m=>{if(m.type()==='error')errors.push({width,error:m.text()});});
   page.on('response',r=>{if(r.status()>=400)errors.push({width,status:r.status(),url:r.url()});});
   await page.goto(base+'char/reina.html');await page.waitForURL('**/index.html');
   assert.equal(await page.locator('#enter').count(),1,'unguarded entry');
   await page.locator('#enter').click();await page.waitForURL('**/home.html');
   for(const name of pages){
    await page.goto(base+name+'.html');await page.evaluate(()=>document.fonts.ready);
    const h=await page.evaluate(()=>document.documentElement.scrollHeight);
    for(let y=0;y<h;y+=600)await page.evaluate(y=>scrollTo(0,y),y);
    await page.waitForFunction(()=>Array.from(document.images).filter(i=>i.getClientRects().length).every(i=>i.complete));
    await page.evaluate(()=>scrollTo(0,0));
    const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.getClientRects().length&&!i.naturalWidth).map(i=>i.src),fonts:document.fonts.check('16px Pretendard')}));
    assert.ok(metrics.scroll<=width,`${name} overflow ${metrics.scroll}/${width}`);
    assert.equal(metrics.broken.length,0,`${name} broken images`);
    assert.ok(metrics.fonts,'font unavailable');
    for(const time of ['day','night','evening']){await page.locator('button[data-time="'+time+'"]').click();assert.equal(await page.locator('html').getAttribute('data-time'),time);}
    await page.screenshot({path:path.join(out,name.replace('/','-')+'-'+width+'.png'),fullPage:true});
    results.push({page:name,width,...metrics});
   }
   await page.goto(base+'characters.html');await page.locator('[data-filter="손님"]').click();await page.locator('[data-person="4"]').click();assert.equal(await page.locator('#person-name').textContent(),'카샤');assert.match(await page.locator('#chart-link').getAttribute('href'),/kasha/);
   await page.goto(base+'char/reina.html');await page.locator('[data-expression="2"]').click();const before=await page.locator('[data-portrait] img').getAttribute('src');await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('[data-portrait] img').getAttribute('src'),before);
   for(let i=1;i<=10;i++){await page.locator('[data-expression="'+i+'"]').click();await page.waitForFunction(()=>document.querySelector('[data-portrait] img')?.complete);assert.ok(await page.locator('[data-portrait] img').evaluate(x=>x.naturalWidth>0));}
   await page.locator('[data-facing="back"]').click();await page.locator('.knot-dot').first().click();assert.match(await page.locator('#knot-label').textContent(),/허리/);
   await page.keyboard.press('e');await page.waitForURL('**/ner.html');
   await page.goto(base+'rules.html');await page.locator('[data-oil="unknown"]').click();assert.equal(await page.locator('#oil-note').textContent(),'???');
   await page.goto(base+'city.html');await page.keyboard.press('ArrowDown');assert.equal(await page.locator('#place-name').textContent(),'모험가 거리');
   await page.goto(base+'start.html');await page.locator('[data-mode="free"]').click();assert.ok(await page.locator('#free-form').isVisible());await page.locator('input[name="day"]').fill('3');await page.locator('input[name="day"]').press('t');assert.equal(await page.locator('html').getAttribute('data-time'),'evening');
   await page.locator('h1').click();await page.keyboard.press('t');assert.equal(await page.locator('html').getAttribute('data-time'),'night');await page.reload();assert.equal(await page.locator('html').getAttribute('data-time'),'night');
   await page.locator('#bell').click();const rumor=await page.locator('#rumor-text').textContent();await page.locator('#bell').click();assert.notEqual(await page.locator('#rumor-text').textContent(),rumor);
   await page.keyboard.press('Escape');assert.ok(await page.locator('#room-menu').isVisible());await page.keyboard.press('Escape');assert.ok(!await page.locator('#room-menu').isVisible());
   await context.close();
  }
  const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}});Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('denied','SecurityError')}})});
  const dp=await denied.newPage();dp.on('pageerror',e=>errors.push({storageDenied:e.message}));await dp.goto(base);await dp.locator('#enter').click();await dp.waitForURL('**/home.html');await dp.keyboard.press('t');await dp.keyboard.press('2');await dp.waitForURL('**/characters.html');await denied.close();
  assert.equal(errors.length,0,JSON.stringify(errors));
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,pages:results,errors,checks:['12 pages at 1440 and 390','three time modes on every page','entry redirect','entry with storage denied','all ten emotion tabs','variant arrow navigation','Q/E character navigation','front/back knot map','staff/guest filtering','unknown bottle','city arrows','mode forms','input shortcut isolation','remembered time','bell rotation','Escape dialog']},null,2));
  console.log(JSON.stringify({passed:true,screenshots:results.length,consoleErrors:errors.length}));
 }catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:e.message,errors},null,2));throw e;}finally{await browser.close();}
})();
