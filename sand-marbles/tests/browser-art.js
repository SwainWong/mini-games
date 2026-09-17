async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1280,height:1000});
  const select=async n=>{await page.locator('#choose-level').click();await page.locator(`[data-level="${n-1}"]`).click();};
  const start=async()=>{const b=await page.locator('#game').boundingBox();await page.mouse.click(b.x+20*b.width/560,b.y+70*b.height/760);};
  for(const [seed,phase]of [[1,'think'],[300,'wipe']]){
    await page.addInitScript(seed=>{Math.random=()=>seed/4294967296;},seed);await page.reload();await page.waitForFunction(()=>window.sandGame?.snapshot().assetsReady);await select(3);await start();
    await page.waitForFunction(phase=>sandGame.snapshot().porter.phase===phase,phase);await page.locator('#game').screenshot({path:`output/playwright/porter-${phase}.png`});
  }
  await select(15);await start();await page.waitForFunction(()=>sandGame.snapshot().time>3);const desktop=await page.evaluate(()=>sandGame.snapshot());if(desktop.worms.length!==4||desktop.effects.wormCells<300)throw Error('Worms do not excavate');if(desktop.jars.some(j=>j.x<104||j.x>456))throw Error('Porter out of frame');await page.screenshot({path:'output/playwright/v7-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await select(9);await start();await page.waitForFunction(()=>sandGame.snapshot().time>1);await page.screenshot({path:'output/playwright/v7-mobile.png',fullPage:true});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  await page.evaluate(r=>window.__artChecks=r,{states:['think','wipe'],worms:desktop.worms.length,excavated:desktop.effects.wormCells,desktop:true,mobile:true,errors});if(errors.length)throw Error(errors.join(';'));
}
