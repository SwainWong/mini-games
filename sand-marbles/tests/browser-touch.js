// Moving-target touch, failure/restart and refresh checks are maintained in browser-moving.js.
async (page) => {
  const solutions=/* SOLUTIONS */ null;
  await page.setViewportSize({width:390,height:844});await page.reload();
  await page.getByRole('button',{name:'选择关卡'}).click();await page.locator('[data-level="0"]').click();
  await page.locator('#game').scrollIntoViewIfNeeded();const box=await page.locator('#game').boundingBox();const cdp=await page.context().newCDPSession(page);
  const point=p=>({x:box.x+p[0]*box.width/560,y:box.y+p[1]*box.height/760});
  for(const route of solutions[0]){const points=route.slice().reverse();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(points[0])]});for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];for(let k=1;k<=15;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point([a[0]+(b[0]-a[0])*k/15,a[1]+(b[1]-a[1])*k/15])]});}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  await page.waitForFunction(()=>window.sandGame.snapshot().state!=='playing',null,{timeout:25000});const state=await page.evaluate(()=>window.sandGame.snapshot());if(state.state!=='won'||state.stars!==3)throw Error(JSON.stringify(state));
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
  await page.evaluate(r=>window.__touchChecks=r,{level:1,state:state.state,stars:state.stars,realTouch:true,noHorizontalOverflow:true});
  await page.getByRole('button',{name:'选择关卡'}).click();await page.locator('[data-level="14"]').click();await page.locator('#game').scrollIntoViewIfNeeded();
  const b=await page.locator('#game').boundingBox();await page.mouse.click(b.x+280*b.width/560,b.y+70*b.height/760);
  await page.waitForFunction(()=>window.sandGame.snapshot().porter.phase==='rest',null,{timeout:10000});
  await page.screenshot({path:'output/playwright/mobile-porter.png',fullPage:true});await page.locator('#game').screenshot({path:'output/playwright/cover-v3.png'});
}
