async page=>{
 await page.setViewportSize({width:1280,height:900});await page.getByRole('button',{name:'选择关卡'}).click();await page.locator('[data-level="2"]').click();await page.locator('#game').scrollIntoViewIfNeeded();
 const box=await page.locator('#game').boundingBox(),s=await page.evaluate(()=>sandGame.snapshot()),target=280+s.porter.offset;
 const route=[[85,300],[85,334],[135,390],[target,490],[target,575]].reverse(),xy=p=>({x:box.x+p[0]*box.width/560,y:box.y+p[1]*box.height/760});
 await page.mouse.move(xy(route[0]).x,xy(route[0]).y);await page.mouse.down();for(const p of route.slice(1))await page.mouse.move(xy(p).x,xy(p).y,{steps:20});await page.mouse.up();
 const samples=[];for(let i=0;i<80;i++){const r=await page.evaluate(()=>sandGame.snapshot());samples.push({t:r.time,c:r.collected,x:r.jars[0].x,state:r.state});if(r.collected>0&&Math.abs(r.jars[0].x-280)>35){await page.locator('#game').screenshot({path:'output/playwright/away-catch.png'});await page.evaluate(r=>window.__awayCatch=r,{collected:r.collected,x:r.jars[0].x,homeX:280,samples});return;}if(r.state!=='playing')break;await page.waitForTimeout(50);}throw Error(JSON.stringify(samples));
}
