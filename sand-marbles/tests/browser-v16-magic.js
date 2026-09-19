async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:900});const results=[],cdp=await page.context().newCDPSession(page);
 const stroke=async path=>{const box=await page.locator('#game').boundingBox(),p=([x,y])=>({x:box.x+x*box.width/560,y:box.y+y*box.height/760});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(path[0])]});for(let i=1;i<path.length;i++)for(let k=1;k<=16;k++){const a=path[i-1],b=path[i];await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p([a[0]+(b[0]-a[0])*k/16,a[1]+(b[1]-a[1])*k/16])]});}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 for(const [seed,kind]of [[3,'bomb'],[8,'coins20']]){
  await page.goto('http://127.0.0.1:4208/sand-marbles/?level=8&seed='+seed,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.sandGame?.snapshot().assetsReady);let s=await page.evaluate(()=>sandGame.snapshot());if(s.level!==8||s.seed!==seed||s.brush!==20||!s.paused)throw Error('seed/intro/shovel contract');if(await page.locator('[data-brush]').count())throw Error('old shovel controls remain');await page.locator('#codex-confirm').click();await stroke([[120,575],[185,460],[260,414],[260,380]]);
  await page.waitForFunction(()=>sandGame.snapshot().treasures[0].opened,null,{timeout:15000});const start=await page.evaluate(()=>sandGame.snapshot());
  if(kind==='coins20'){
   if(start.magic.pending||start.magic.paused||start.score<20)throw Error('former refill still pending or missing coins');
   await stroke([[40,520],[40,450]]);await page.waitForTimeout(300);s=await page.evaluate(()=>sandGame.snapshot());
   if(s.time<=start.time||s.dug<=start.dug)throw Error('coin bag paused time/input');
  }else await page.waitForFunction(()=>sandGame.snapshot().magic.completed.length>0,null,{timeout:7000});
  const end=await page.evaluate(()=>sandGame.snapshot());results.push({kind,seed,score:end.score,completed:end.magic.completed,waste:end.balls.filter(b=>b.waste).length});
  if(end.magic.completed.some(e=>e.kind!=='bomb'))throw Error('removed effect executed');
  if(end.state==='lost'){await page.waitForTimeout(500);await page.locator('#result-review').click();}
  await page.screenshot({path:`output/playwright/v19-magic-${kind}-resolved.png`});await page.setViewportSize({width:1200,height:1000});await page.screenshot({path:`output/playwright/v19-magic-${kind}-desktop.png`});await page.setViewportSize({width:390,height:900});
  await page.locator('#restart').click();s=await page.evaluate(()=>sandGame.snapshot());if(s.seed!==seed||s.score||s.magic.completed.length||s.treasures.some(t=>t.opened))throw Error('restart did not preserve seed/reset state');await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>sandGame.snapshot().assetsReady);s=await page.evaluate(()=>sandGame.snapshot());if(s.level!==8||s.seed!==seed||s.score||s.best.length||!s.paused)throw Error('shareable refresh did not reset progress/retain seed');
 }
 if(errors.length)throw Error(errors.join(';'));return{results,refresh:true,restart:true,errors};
}
