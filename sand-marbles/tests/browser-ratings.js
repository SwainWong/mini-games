async (page) => {
  const solutions=/* SOLUTIONS */ null,results=[];
  const selectFirst=async()=>{await page.getByRole('button',{name:'选择关卡'}).click();await page.locator('[data-level="0"]').click();};
  const drag=async(points)=>{await page.locator('#game').scrollIntoViewIfNeeded();const b=await page.locator('#game').boundingBox();await page.mouse.move(b.x+points[0][0]*b.width/560,b.y+points[0][1]*b.height/760);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(b.x+p[0]*b.width/560,b.y+p[1]*b.height/760,{steps:14});await page.mouse.up();};
  if(await page.locator('#hint').count())throw Error('Hint button still present');
  if(await page.evaluate(()=>typeof window.sandGame.routes!=='undefined'||window.SandLevels.some(l=>l.routes)))throw Error('Runtime still exposes solutions');
  await page.getByRole('button',{name:'开启音效',exact:true}).click();
  for(const want of [2,1]){
    await selectFirst();if(want===2)await drag([[60,350],[60,450]]);else{await drag([[60,250],[60,530]]);await drag([[110,250],[110,530]]);}
    for(const route of solutions[0])await drag(route.slice().reverse());
    await page.waitForFunction(()=>window.sandGame.snapshot().state!=='playing',null,{timeout:20000});const s=await page.evaluate(()=>window.sandGame.snapshot());
    if(s.state!=='won'||s.stars!==want)throw Error(JSON.stringify(s));if(await page.locator('#result-stars .lit').count()!==want)throw Error('Visible stars mismatch');results.push({stars:s.stars,dug:s.dug});
  }
  const on=await page.evaluate(()=>window.sandGame.snapshot());if(!on.soundEnabled||on.audioPlayed<4)throw Error('Audio did not start from gesture');
  await page.getByRole('button',{name:'关闭音效',exact:true}).click();const audioBefore=await page.evaluate(()=>window.sandGame.snapshot().audioPlayed);
  await selectFirst();await drag([[50,575],[50,340],[135,210],[135,164],[135,130]]);await page.waitForFunction(()=>window.sandGame.snapshot().state==='lost',null,{timeout:20000});const lost=await page.evaluate(()=>window.sandGame.snapshot());if(lost.stars!==0||await page.locator('#result-stars').isVisible())throw Error('Failure awarded stars');if(lost.audioPlayed!==audioBefore||lost.soundEnabled)throw Error('Muted audio played');
  await page.getByRole('button',{name:'重新挑战'}).click();if((await page.evaluate(()=>window.sandGame.snapshot().dug))!==0)throw Error('Retry did not reset sand');
  await page.reload();const fresh=await page.evaluate(()=>({s:window.sandGame.snapshot(),storage:localStorage.length+sessionStorage.length}));if(fresh.s.level!==1||fresh.s.dug!==0||fresh.s.best.length||fresh.s.soundEnabled||fresh.storage)throw Error('Refresh contract failed');
  await page.evaluate(r=>window.__ratingChecks=r,{results,failedStars:0,audioOn:true,muteStopsNewAudio:true,refreshReset:true,noHints:true});
}
