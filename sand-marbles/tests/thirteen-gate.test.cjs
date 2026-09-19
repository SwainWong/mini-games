const {test}=require('node:test'),a=require('node:assert/strict'),replay=require('./thirteen-gate-replay.cjs');
for(const ticks of [1])for(const delay of [0,.5,1])test(`stage 13 former refill seed awards coins without refilling: ticks ${ticks}, delay ${delay}`,()=>{
 const r=replay({ticks,delay}),e=JSON.stringify(r);
 a.equal(r.state,'won',e);a.ok(r.score>=160,e);a.ok(r.stars>=2,e);
 a.deepEqual(r.completed,[]);a.ok(r.opened[0],e);
});
