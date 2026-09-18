async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:900});
 await page.goto('http://127.0.0.1:4208/sand-marbles/?level=12&seed=34',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>sandGame.snapshot().assetsReady);
 const cdp=await page.context().newCDPSession(page),state=()=>page.evaluate(()=>sandGame.snapshot());
 const base=[
  [[345,105],[345,140],[445,205],[445,300],[456,420],[456,575]],
  [[205,265],[205,295],[260,315],[260,380],[280,470],[280,575]],
  [[210,455],[210,485],[145,510],[104,575]],
  [[475,455],[475,490],[456,575]]
 ];
 const recovery=s=>{
  const paths=[];
  for(const label of ['blue-high','jade','amber','blue-low']){
   const color=label.split('-')[0],bs=s.balls.filter(b=>!b.held&&b.color===color&&(color!=='blue'||(label==='blue-low'?b.y>=400:b.y<400)));
   if(!bs.length)continue;
   const x=bs.reduce((sum,b)=>sum+b.x,0)/bs.length,y=Math.max(...bs.map(b=>b.y)),home={amber:104,jade:280,blue:456}[color],p=[[x,y]];
   const bag=color==='jade'?s.treasures[0]:color==='blue'?s.treasures[1]:null;
   if(bag&&!bag.opened&&y<bag.y)p.push([bag.x,Math.max(y+20,bag.y-60)],[bag.x,bag.y]);
   p.push([home,Math.min(550,Math.max(y+80,p.at(-1)[1]+80))],[home,575]);paths.push(p);
   for(const b of bs)paths.push([[b.x,b.y],[x,y]]);
  }
  return paths;
 };
 const box=await page.locator('#game').boundingBox();
 const point=([x,y])=>({x:box.x+x*box.width/560,y:box.y+y*box.height/760});
 const stroke=async route=>{
  const r=route.slice().reverse();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(r[0])]});
  for(let i=1;i<r.length;i++){
   const a=r[i-1],b=r[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/16));
   for(let k=1;k<=n;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])]});
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 };
 let routes=base,cursor=0,refills=0;const log=[],strokes=[];
 await page.locator('#codex-confirm').click();
 for(let guard=0;guard<800;guard++){
  const s=await state();if(s.state!=='playing')break;
  if(s.magic.paused){await page.waitForTimeout(80);continue;}
  const n=s.magic.completed.filter(e=>e.kind==='refill').length;
  if(n>refills){refills=n;routes=recovery(s);cursor=0;log.push({t:s.time,score:s.score,refills,paths:routes,balls:s.balls});}
  if(cursor<routes.length){const path=routes[cursor++];await stroke(path);strokes.push({start:s.time,end:(await state()).time,path});}else await page.waitForTimeout(80);
 }
 const end=await state();await page.screenshot({path:'output/playwright/v16-refill-route-result.png'});
 const result={state:end.state,score:end.score,stars:end.stars,dug:end.dug,losses:end.losses,completed:end.magic.completed,refills,log,strokes,errors};
 if(end.state!=='won'||end.stars!==(end.dug<=end.budget.three?3:end.dug<=end.budget.two?2:1)||refills!==2||end.magic.completed.length!==2||errors.length)throw Error('two-refill recovery failed: '+JSON.stringify(result));
 return result;
}
