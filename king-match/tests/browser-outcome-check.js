'use strict';
// Real pointer/touch path to the exact four occupied cells in the user's image.
module.exports=async function(page,{touch=false}={}){
 const assert=require('node:assert/strict'),M=require('../match.js');
 page.setDefaultTimeout(90000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const read=()=>page.evaluate(()=>kingGame.snapshot());
 const click=async index=>{const b=await page.locator('#game').boundingBox(),x=b.x+(24+(index%8+.5)*48)*b.width/432,y=b.y+(398+(Math.floor(index/8)+.5)*48)*b.height/780;if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);};
 const move=async(a,b)=>{await click(a);await click(b);await page.waitForFunction(()=>!kingGame.snapshot().phase||kingGame.snapshot().state!=='playing',null,{timeout:90000});};
 await page.locator('#start').click();
 const route=[[10,18],[42,50],[35,43],[44,52],[44,52],[31,39],[40,48],[14,22],[24,32],[52,53],[46,47],[48,49]],steps=[];
 for(const [a,b]of route){const before=await read();assert.equal(before.state,'playing');assert.ok(M.preview(before.board,a,b));await move(a,b);steps.push(await read());}
 await page.locator('#result').waitFor({state:'visible'});
 const won=await read(),title=await page.locator('#result-title').textContent(),detail=await page.locator('#result-detail').textContent();
 assert.equal(won.state,'won');assert.equal(won.reason,'no-moves');assert.equal(won.remaining,4);assert.equal(M.legal(won.board).length,0);assert.equal(won.valve,false);assert.equal(won.remixes,2);assert.match(title,/关卡通过/);assert.match(detail,/剩余 4 颗宝石/);assert.doesNotMatch(detail,/全部.*已清空/);
 const expected=Array(56).fill(null);expected[46]=1;expected[48]=3;expected[52]=0;expected[54]=2;assert.deepEqual(won.board,expected);
 await page.waitForTimeout(400);const frozen=await read();assert.equal(frozen.time,won.time);assert.equal(frozen.hp,won.hp);
 await page.locator('#result-next').click();let next=await read();assert.equal(next.level,2);assert.equal(next.state,'ready');assert.equal(next.remaining,52);await page.locator('#start').click();
 for(const [a,b]of [[16,17],[34,35],[12,13],[14,15],[40,41],[42,43],[44,45],[46,47]])await move(a,b);
 const clear=await read();assert.equal(clear.state,'won');assert.equal(clear.reason,'cleared');assert.equal(clear.remaining,0);
 await page.locator('#result-retry').click();const reset=await read();assert.equal(reset.state,'ready');assert.equal(reset.hp,100);assert.equal(reset.reason,'');
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});await page.locator('#start:enabled').waitFor();const refresh=await read();assert.equal(refresh.state,'ready');assert.equal(refresh.level,1);assert.equal(refresh.hp,100);assert.equal(refresh.actions,0);assert.deepEqual(errors,[]);
 return {steps,won,title,detail,frozen,next,clear,reset,refresh,errors};
};
