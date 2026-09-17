async (page) => {
  // Run with playwright-cli run-code; range is a test-runner URL parameter only.
  const [from,to]=await page.evaluate(()=>{const url=new URL(location.href);return [Number(url.searchParams.get('verifyFrom')||1),Number(url.searchParams.get('verifyTo')||15)];});
  const solutions=/* SOLUTIONS */ null;
  const timing=/* TIMING */ null;
  // Deterministic test-only random choice; player pages still use real randomness.
  await page.addInitScript(()=>{Math.random=()=>1/4294967296;});await page.reload();await page.waitForFunction(()=>window.sandGame?.snapshot().assetsReady);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
  for(let number=from;number<=to;number++){
    await page.getByRole('button',{name:'选择关卡'}).click();
    await page.locator(`[data-level="${number-1}"]`).click();
    await page.locator('#game').scrollIntoViewIfNeeded();
    const box=await page.locator('#game').boundingBox();
    const routes=solutions[number-1];
    await page.locator('[data-brush="14"]').click();await page.mouse.click(box.x+20*box.width/560,box.y+70*box.height/760);await page.locator('[data-brush="24"]').click();
    await page.waitForFunction(delay=>sandGame.snapshot().time>=delay,timing[number][1].delay);
    for(const route of routes){const points=route.slice().reverse();await page.mouse.move(box.x+points[0][0]*box.width/560,box.y+points[0][1]*box.height/760);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(box.x+p[0]*box.width/560,box.y+p[1]*box.height/760,{steps:20});await page.mouse.up();}
    await page.waitForFunction(()=>window.sandGame.snapshot().state!=='playing',null,{timeout:30000});
    const s=await page.evaluate(()=>window.sandGame.snapshot());
    if(s.state!=='won'||s.collected!==s.total||s.stars!==3)throw Error(`Stage ${number}: ${JSON.stringify(s)}`);
    if(!(await page.locator('#result-stars').isVisible()))throw Error('Missing success stars');
    results.push({level:number,stars:s.stars,collected:s.collected,dug:s.dug,budget:s.budget,effects:s.effects});
  }
  if(errors.length)throw Error(errors.join('; '));
  await page.evaluate(result=>{window.__browserResults=[...(window.__browserResults||[]),...result];},results);
}
