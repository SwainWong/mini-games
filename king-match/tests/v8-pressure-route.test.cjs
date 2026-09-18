const {test}=require('node:test'),assert=require('node:assert/strict'),{Game}=require('../engine.js');
const routes=[{name:'four-gem tail',wait:0,path:[[10,18],[42,50],[35,43],[44,52],[44,52],[31,39],[40,48],[14,22],[24,32],[52,53],[46,47],[48,49]],won:true},{name:'formerly blocked after thirty seconds',wait:30,path:[[15,23],[34,42],[44,52],[40,48]],won:false}];
for(const r of routes)test(r.name+' returns from every gravity operation within ten mechanical seconds',()=>{
 const g=new Game(0,{rallySeed:1});g.start();for(let i=0;i<r.wait*120;i++){g.update(1/120);g.events=[];}
 for(const move of r.path){assert.ok(g.swap(...move));let ticks=0;while(g.operation){assert.ok(ticks++<1200,'gravity stalled after '+JSON.stringify(move));g.update(1/120);g.events=[];assert.ok(g.particles.filter(p=>p.y<150).length/g.initialUpper>.85,'upper reservoir must remain filled while settling');assert.equal(g.spawned,g.particles.length+g.collected+g.crushed);}}
 assert.ok(g.hp>0);assert.equal(g.state,r.won?'won':'playing');if(r.won){assert.equal(g.reason,'no-moves');assert.equal(g.snapshot().remaining,4);}else assert.ok(g.swap(31,39),'the next real legal swap must still be accepted');
});
