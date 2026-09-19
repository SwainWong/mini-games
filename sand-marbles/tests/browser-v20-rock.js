async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4208/sand-marbles/?level=8&seed=17&v=20');await page.waitForFunction(()=>sandGame.snapshot().assetsReady);await page.locator('#codex-confirm').click();
 const cdp=await page.context().newCDPSession(page),box=await page.locator('#game').boundingBox(),p=([x,y])=>({x:box.x+x*box.width/560,y:box.y+y*box.height/760});
 const stroke=async(a,b)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(a)]});for(let k=1;k<=25;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p([a[0]+(b[0]-a[0])*k/25,a[1]+(b[1]-a[1])*k/25])]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 const initial=await page.evaluate(()=>sandGame.snapshot().rocks);await stroke([310,350],[450,350]);await stroke([310,380],[450,380]);await stroke([310,410],[450,410]);const samples=[];
 for(let i=0;i<60;i++){const s=await page.evaluate(()=>{const s=sandGame.snapshot();return{t:s.time,state:s.state,rival:s.rival,rocks:s.rocks}});samples.push(s);if(i===10||i===40)await page.screenshot({path:'output/playwright/v20-rock-mobile-'+i+'.png'});if(s.state!=='playing')break;await page.waitForTimeout(120);}
 const first=samples[0],last=samples.at(-1),rockMoved=samples.some(s=>s.rocks.some((r,i)=>Math.hypot(r.x-initial[i].x,r.y-initial[i].y)>1||Math.abs((r.angle||0)-(initial[i].angle||0))>.02)),travel=Math.hypot(first.rival.x-last.rival.x,first.rival.y-last.rival.y);
 if(!rockMoved||travel<20||errors.length)throw Error(JSON.stringify({rockMoved,travel,errors}));return{rockMoved,travel,samples,errors};
}
