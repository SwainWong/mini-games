// Historical v16 refill-only browser trace; effect removed in v19. Current verification: browser-v16-magic.js.
// Historical diagnostic for the pre-redesign level-12 map; retained for failure provenance.
// Current verification is browser-v16-refill-route.js. Do not run these coordinates against the new map.
// Actual touch with measured world-time checkpoints. Diagnostic, not a winning-route claim.
async page=>{
 await page.setViewportSize({width:390,height:900});await page.goto('http://127.0.0.1:4208/sand-marbles/?level=12&seed=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>sandGame.snapshot().assetsReady);await page.locator('#codex-confirm').click();await page.waitForTimeout(500);
 const cdp=await page.context().newCDPSession(page),routes=[[[75,110],[75,144],[245,190],[405,265],[495,380],[456,575]],[[225,440],[225,474],[140,490],[104,575]],[[165,275],[165,309],[240,355],[300,430],[280,575]],[[420,440],[420,474],[495,490],[456,575]]],trace=[];let completed=0,cursor=0;
 const state=()=>page.evaluate(()=>sandGame.snapshot());
 const record=async tag=>{const s=await state();trace.push({tag,time:s.time,score:s.score,dug:s.dug,loss:s.losses,magic:s.magic,balls:s.balls});return s;};
 const stroke=async route=>{const box=await page.locator('#game').boundingBox(),p=([x,y])=>({x:box.x+x*box.width/560,y:box.y+y*box.height/760}),r=route.slice().reverse();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(r[0])]});for(let i=1;i<r.length;i++)for(let k=1;k<=5;k++){const a=r[i-1],b=r[i];await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p([a[0]+(b[0]-a[0])*k/5,a[1]+(b[1]-a[1])*k/5])]});}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 await record('start');for(let guard=0;guard<800;guard++){let s=await state();if(s.state!=='playing')break;if(s.magic.paused){await page.waitForTimeout(100);continue;}const n=s.magic.completed.filter(e=>e.kind==='refill').length;if(n>completed){completed=n;cursor=0;await record('refill completed');}if(cursor<routes.length){await record('before stroke '+cursor);await stroke(routes[cursor++]);await record('after stroke '+(cursor-1));}else await page.waitForTimeout(100);}
 const end=await state();await page.screenshot({path:'output/playwright/v16-refill-trace.png'});return{state:end.state,cause:end.endCause,score:end.score,stars:end.stars,remaining:end.remainingPotential,loss:end.losses,trace};
}
