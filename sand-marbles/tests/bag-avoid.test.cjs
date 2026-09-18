const {test}=require('node:test'),a=require('node:assert/strict'),levels=require('../levels.js'),replay=require('./bag-avoid-replay.cjs');
for(const l of levels)test(`stage ${l.id}: actual route wins without opening any random bag across four seeds`,()=>{
 for(const seed of [1,300,1000,100000]){const {w}=replay(l.id,seed),evidence=JSON.stringify({id:l.id,seed,score:w.score,target:w.targetScore,loss:w.losses,dug:w.terrain.units});a.equal(w.treasures.some(t=>t.kind==='bag'&&t.opened),false,evidence);a.equal(w.state,'won',evidence);a.equal(w.stars,3,evidence);a.ok(w.score>=w.targetScore,evidence);}
});
