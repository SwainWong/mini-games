// Real pointer regression: no state writes and no manual advance call/button.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4298/king-match/continuous/';
const output = process.env.ARTIFACT_DIR || 'output/playwright/auto-walk';
(async () => {
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const reports=[];
  try {
    for (const scenario of [
      {name:'desktop-clear-all',width:1280,height:720,touch:false,clearAll:true},
      {name:'phone-remaining-bricks',width:390,height:700,touch:true,clearAll:false}
    ]) {
      const context=await browser.newContext({viewport:{width:scenario.width,height:scenario.height},isMobile:scenario.touch,hasTouch:scenario.touch});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base);
      await page.waitForFunction(()=>window.kingJourney);
      assert.equal(await page.locator('#advance').count(),0,'manual advance must not be required');
      const swap=async(pair)=>{
        const r=await page.locator('#scene').boundingBox();
        for(const i of pair){
          const x=r.x+(60+i%4*90+45)/720*r.width;
          const y=r.y+(360+(i>>2)*90+45)/1060*r.height;
          if(scenario.touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
        }
      };
      for(let level=0;level<2;level++){
        await page.locator('#begin').click();
        await swap(level?[10,11]:[6,7]);
        if(!level&&scenario.clearAll){
          await page.waitForFunction(()=>kingJourney.snapshot().stages[0].phase==='idle');
          await swap([4,5]);
        }
        await page.waitForFunction(()=>kingJourney.snapshot().phase==='walking',null,{timeout:20000});
        const walking=await page.evaluate(()=>kingJourney.snapshot());
        assert.equal(walking.stages[level].complete,false,'opening a door is not arrival');
        if(!level&&scenario.clearAll)assert.ok(walking.stages[0].board.every(v=>v==null));
        if(!level){
          await page.locator('#pause').click();
          const paused=await page.evaluate(()=>kingJourney.snapshot());
          const before=await page.locator('#scene').screenshot();
          await page.waitForTimeout(500);
          assert.deepEqual(await page.evaluate(()=>kingJourney.snapshot()),paused);
          assert.ok(before.equals(await page.locator('#scene').screenshot()),'pause freezes pixels too');
          await page.locator('#pause').click();
        }
        await page.waitForFunction(level=>level?kingJourney.snapshot().phase==='won':kingJourney.snapshot().active===1,level,{timeout:25000});
        if(!level){const b=await page.evaluate(()=>kingJourney.snapshot().stages[1]);assert.equal(b.time,0);assert.equal(b.hp,100);}
      }
      const result=await page.evaluate(()=>{const s=kingJourney.snapshot();delete s.particles;return s;});
      assert.ok(result.stages.every(s=>s.complete&&s.hp>0));
      await page.screenshot({path:path.join(output,scenario.name+'-won.png'),fullPage:true});
      await page.reload();await page.waitForFunction(()=>window.kingJourney);
      const reset=await page.evaluate(()=>kingJourney.snapshot());assert.equal(reset.active,0);assert.equal(reset.phase,'ready');
      assert.deepEqual(errors,[]);
      reports.push({scenario:scenario.name,base,result,errors});
      await context.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(reports,null,2));
  console.log(JSON.stringify(reports.map(r=>({scenario:r.scenario,phase:r.result.phase,errors:r.errors}))));
})().catch(e=>{console.error(e);process.exitCode=1;});
