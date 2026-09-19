const {test}=require('node:test'),a=require('node:assert/strict'),replay=require('./twelve-magic-replay.cjs');
for(const open of [false,true])for(const seed of (open?[34,38,40,85]:[1,300,1000,100000]))for(const ticks of [1,2,3]) {
  test(`stage 12 seed ${seed}, ${open?'both bad bags':'no bags'}, input speed ${ticks}`,()=>{
    const w=replay({seed,ticks,open}),e=JSON.stringify({score:w.score,loss:w.losses,dug:w.terrain.units,completed:w.magic.completed});
    a.equal(w.state,'won',e);a.ok(w.score>=170,e);a.equal(w.stars,3,e);
    a.equal(w.losses['wrong-color'],0,e);
    a.deepEqual(w.treasures.map(t=>t.opened),[open,open],e);
    if(open){
      a.deepEqual(w.magic.completed.map(e=>e.id).sort(),[0,1],e);
      a.deepEqual(w.magic.completed.map(e=>e.kind).sort(),w.treasures.map(t=>t.outcome).sort(),e);
    }else a.equal(w.magic.completed.length,0,e);
  });
}
