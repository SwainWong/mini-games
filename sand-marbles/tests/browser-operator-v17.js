async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  if(window.actorAuditInstalled)return;window.actorAuditInstalled=true;
  const p=CanvasRenderingContext2D.prototype,clear=p.clearRect,draw=p.drawImage;
  window.actorAudit={frames:0,doubled:0,alpha:0,count:0};
  p.clearRect=function(...args){if(this.canvas.id==='game'){const a=window.actorAudit;if(a.count>1)a.doubled++;a.frames++;a.count=0;}return clear.apply(this,args);};
  p.drawImage=function(img,...args){if(this.canvas.id==='game'&&img?.src?.includes('operator-actor-v17')){window.actorAudit.count++;if(this.globalAlpha!==1)window.actorAudit.alpha++;}return draw.call(this,img,...args);};
 });
 await page.reload();await page.waitForFunction(()=>window.sandGame?.snapshot().assetsReady);
 await page.locator('#codex-confirm').click();await page.getByRole('button',{name:/选择关卡/}).click();await page.locator('[data-level="14"]').click();await page.locator('#codex-confirm').click();
 const seen=new Set();for(let i=0;i<90;i++){seen.add(await page.evaluate(()=>sandGame.snapshot().visual.operatorFrame));await page.waitForTimeout(80);}
 await page.getByRole('button',{name:/选择关卡/}).click();const paused=await page.evaluate(()=>sandGame.snapshot());await page.waitForTimeout(350);const still=await page.evaluate(()=>sandGame.snapshot());if(paused.time!==still.time||paused.visual.operatorFrame!==still.visual.operatorFrame)throw Error('pause changed animation');
 await page.locator('[data-close="level-dialog"]').click();await page.setViewportSize({width:390,height:900});await page.screenshot({path:'output/playwright/operator-mobile-verified.png'});await page.setViewportSize({width:1100,height:1000});await page.screenshot({path:'output/playwright/operator-desktop-verified.png'});
 const audit=await page.evaluate(()=>window.actorAudit);if(audit.doubled||audit.alpha)throw Error('double or blended actor draw '+JSON.stringify(audit));if(![...seen].some(f=>f>=12)||![...seen].some(f=>f<=10))throw Error('missing live gesture or steering');
 await page.locator('#restart').click();const reset=await page.evaluate(()=>sandGame.snapshot());if(reset.score||reset.time>.2)throw Error('restart');await page.reload();await page.waitForFunction(()=>window.sandGame?.snapshot().assetsReady);const fresh=await page.evaluate(()=>sandGame.snapshot());if(fresh.level!==1||fresh.score||fresh.best.length)throw Error('refresh state');if(errors.length)throw Error(errors.join(';'));
 return {seen:[...seen],audit,pause:true,restart:true,refresh:true,errors};
}
