const{test}=require('node:test'),a=require('node:assert/strict'),Rest=require('../rival-rest.js'),{World}=require('../core.js');
const make=()=>new World({id:2,jars:[{x:280,color:'blue'}],groups:[{x:280,y:500,color:'blue',count:12}],rocks:[],tunnels:[],mechanics:{rival:{speed:30}},budget:{three:100,two:200},targetScore:20},{seed:2});
test('natural fatigue plays lowering, seated sweat/drink and rise without stealing or sliding',()=>{
 const w=make(),r=w.rival;const frames=[];r.stamina=21;for(let i=0;i<900;i++){const x=r.x,y=r.y,bag=r.bag.length,dug=r.removed;r.step(w,1/120);w.resolveInteractions();const f=Rest.frame(r);if(f!==null){if(frames.at(-1)!==f)frames.push(f);a.equal(r.x,x);a.equal(r.y,y);a.equal(r.bag.length,bag);a.equal(r.removed,dug);}if(frames.length&&!r.resting)break;}
 a.deepEqual(frames,[0,1,2,3,4,5,6,7,8,6,9,10,11]);
});
test('seated poses keep the same ground anchor and smaller height, without duplicating an actor',()=>{
 for(let i=0;i<12;i++){const p=Rest.pose(i);a.equal(p.y+p.height,0);a.ok(p.source[0]+p.source[2]<=1254&&p.source[1]+p.source[3]<=1254);a.ok(p.height<=68);}
 for(const i of [3,4,5,6,7,8])a.ok(Rest.pose(i).height<45);a.equal(Rest.frame({phase:'stun',stunTime:2}),null);a.equal(Rest.frame({phase:'fleeing',fleeing:true}),null);
});
test('magic fright sits through recovery and paused pose sampling is stable',()=>{
 const w=make(),r=w.rival;w.random=()=>.1;r.magicScare(w);let seated=false,rose=false;for(let i=0;i<400;i++){r.step(w,1/120);const f=Rest.frame(r);a.equal(Rest.frame(r),f);if(f>=3&&f<=8)seated=true;if(f>=9)rose=true;if(!r.resting)break;}a.ok(seated&&rose);a.equal(r.resting,false);a.equal(r.magicSit,false);
});
