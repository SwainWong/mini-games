// Bounded negative-outcome coverage, not a claim that every bag branch is complete.
const{test}=require('node:test'),a=require('node:assert/strict'),{World}=require('../core.js'),levels=require('../levels.js'),solutions=require('./solutions.cjs'),replay=require('./input-replay.cjs');
const cases=[
 {id:6,seed:3,kinds:['bomb']},{id:6,seed:8,kinds:['refill']},
 {id:7,seed:3,kinds:['bomb'],delay:.5},{id:7,seed:8,kinds:['refill']},
 {id:9,seed:40,kinds:['bomb','bomb']},
 {id:10,seed:3,kinds:['bomb'],outlets:[136,136,400,400]},
 {id:10,seed:8,kinds:['refill'],outlets:[136,136,480,480],recoveryOrder:[3,2,0,1],skipSettledColors:true},
 ...[[34,['refill','refill']],[38,['refill','bomb']],[40,['bomb','bomb']],[85,['bomb','refill']]].map(([seed,kinds])=>({id:11,seed,kinds})),
 {id:13,seed:3,kinds:['bomb']},{id:13,seed:8,kinds:['refill'],delay:.75},
 {id:14,seed:34,kinds:['refill','refill'],order:[0,1,4,2,3]},{id:14,seed:40,kinds:['bomb','bomb']},
 {id:14,seed:38,kinds:['refill','bomb'],order:[0,1,4,2,3],skipSettledColors:true},
 {id:14,seed:85,kinds:['bomb','refill'],order:[0,1,4,2,3],skipSettledColors:true},
 {id:15,seed:38,kinds:['refill','bomb'],ticks:1,order:[0,1,2,5,4,3],recoveryOrder:[0,1,2,5,4,3],skipSettledColors:true},
 {id:15,seed:85,kinds:['bomb','refill'],delay:.25,order:[0,1,2,5,4,3],recoveryOrder:[0,1,2,5,4,3],skipSettledColors:true},
 {id:15,seed:40,kinds:['bomb','bomb']},{id:15,seed:34,kinds:['refill','refill'],delay:.25,order:[0,1,2,5,4,3],recoveryOrder:[0,1,2,5,4,3],skipSettledColors:true}
];
for(const c of cases)test(`stage ${c.id} seed ${c.seed}: win after actually completing ${c.kinds.join(' + ')}`,()=>{
 const w=new World(levels[c.id-1],{seed:c.seed}),routes=structuredClone(solutions[c.id-1]);if(c.outlets)routes.forEach((p,i)=>p.at(-1)[0]=c.outlets[i]);
 if(c.id===15){routes[3]=[[115,335],[150,350],[220,360],[240,410],[240,490],[221,575]];routes[5]=[[385,310],[385,330],[440,350],[450,410],[420,490],[338,575]];}
 const bags=w.treasures.filter(t=>t.kind==='bag');a.deepEqual(bags.map(t=>t.outcome),c.kinds);replay(w,routes,{ticks:2,...c});
 const evidence=JSON.stringify({id:c.id,seed:c.seed,score:w.score,loss:w.losses,completed:w.magic.completed,dug:w.terrain.units});
 a.ok(bags.every(t=>t.opened),evidence);a.deepEqual(w.magic.completed.map(e=>e.id).sort((a,b)=>a-b),bags.map(t=>t.id).sort((a,b)=>a-b),evidence);a.equal(w.state,'won',evidence);a.ok(w.score>=w.targetScore,evidence);a.equal(w.stars,3,evidence);
});

test('stage 9 seed 34: reconnect actual bead pockets after each of two refills',()=>{const r=require('./nine-refill-replay.cjs')();a.equal(r.state,'won');a.equal(r.score,170);a.equal(r.stars,3);a.deepEqual(r.completed,[{id:0,kind:'refill'},{id:1,kind:'refill'}]);a.equal(r.loss['wrong-color'],0);a.equal(r.loss.missed,0);});

for(const c of [{seed:34,reverse:true,score:110},{seed:40,score:103},{seed:85,reverse:true,split:true,blueOutlet:160,score:120},{seed:38,reverse:true,split:true,ticks:1,score:110}])test(`stage 8 seed ${c.seed}: both optional bags complete and recovery still reaches the gate`,()=>{
 const w=require('./eight-magic-replay.cjs')(c.seed,c);a.ok(w.treasures.every(t=>t.opened));a.deepEqual(w.magic.completed.map(e=>e.id).sort(),[0,1]);a.equal(w.state,'won');a.equal(w.score,c.score);a.equal(w.stars,w.terrain.units<=w.budget.three?3:w.terrain.units<=w.budget.two?2:1);
});

for(const [seed,kinds] of [[38,['refill','bomb']],[85,['bomb','refill']]])test(`stage 9 seed ${seed}: reconnect visible blue pockets first after mixed magic`,()=>{
 const r=require('./nine-refill-replay.cjs')(2,seed);a.equal(r.state,'won');a.ok(r.score>=r.w.targetScore);a.equal(r.stars,3);a.ok(r.w.treasures.every(t=>t.opened));a.deepEqual(r.completed.map(e=>e.id),[0,1]);a.deepEqual(r.completed.map(e=>e.kind),kinds);
});
