async (page) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>window.sandGame?.snapshot().assetsReady);
  const cdp=await page.context().newCDPSession(page);
  const select=async()=>{await page.getByRole('button',{name:'选择关卡'}).click();await page.locator('[data-level="2"]').click();await page.locator('#game').scrollIntoViewIfNeeded();};
  const draw=async points=>{const b=await page.locator('#game').boundingBox(),point=p=>({x:b.x+p[0]*b.width/560,y:b.y+p[1]*b.height/760});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(points[0])]});for(let i=1;i<points.length;i++){const a=points[i-1],z=points[i];for(let k=1;k<=20;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point([a[0]+(z[0]-a[0])*k/20,a[1]+(z[1]-a[1])*k/20])]});await page.waitForTimeout(16);}}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  const routes=[[[85,300],[85,334],[135,390],[245,465],[280,575]],[[450,110],[450,144],[405,245],[325,360],[280,480],[280,575]]];
  await select();await draw([[20,70]]);await page.waitForFunction(()=>sandGame.snapshot().time>=3);
  const away=await page.evaluate(()=>sandGame.snapshot());if(Math.abs(away.jars[0].x-away.jars[0].homeX)<40)throw Error('Jar failed to move');
  await page.locator('#game').screenshot({path:'output/playwright/mobile-moving-jar.png'});
  await page.waitForFunction(()=>sandGame.snapshot().time>=3);
  for(const r of routes)await draw(r.slice().reverse());
  await page.waitForFunction(()=>sandGame.snapshot().state!=='playing',null,{timeout:20000});const won=await page.evaluate(()=>sandGame.snapshot());if(won.state!=='won'||won.stars!==3||won.collected!==11)throw Error(JSON.stringify(won));
  await page.screenshot({path:'output/playwright/mobile-moving-win.png',fullPage:true});
  await page.getByRole('button',{name:'重来',exact:true}).click();await draw(routes[0].slice().reverse());
  await page.waitForFunction(()=>sandGame.snapshot().state==='lost',null,{timeout:15000});const lost=await page.evaluate(()=>sandGame.snapshot());if(lost.stars!==0||!lost.failure)throw Error('Miss did not fail');
  await page.getByRole('button',{name:'查看失误位置',exact:true}).click();await page.waitForTimeout(500);const frozen=await page.evaluate(()=>sandGame.snapshot());if(JSON.stringify(frozen)!==JSON.stringify(lost))throw Error('Failure state not frozen');
  await page.getByRole('button',{name:'重来',exact:true}).click();await page.getByRole('button',{name:'开启音效',exact:true}).click();await draw([[20,70],[30,75]]);let audio=await page.evaluate(()=>sandGame.snapshot());if(!audio.soundEnabled||audio.audioPlayed===0)throw Error('Sound did not play');await page.getByRole('button',{name:'关闭音效',exact:true}).click();
  await page.reload();await page.waitForFunction(()=>window.sandGame?.snapshot().assetsReady);const reset=await page.evaluate(()=>sandGame.snapshot());if(reset.level!==1||reset.best.length||reset.collected||reset.dug||reset.soundEnabled)throw Error('Refresh did not reset');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');if(errors.length)throw Error(errors.join(';'));
  await page.evaluate(r=>window.__movingTouchChecks=r,{realTouch:true,won:{stars:won.stars,collected:won.collected},miss:{kind:lost.failure.kind,stars:lost.stars,jarX:lost.jars[0].x,homeX:lost.jars[0].homeX},awayX:away.jars[0].x,frozen:true,restart:true,sound:true,refresh:true,errors});
}
