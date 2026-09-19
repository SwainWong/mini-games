const{test}=require('node:test'),a=require('node:assert/strict'),{World}=require('../core.js');
const base=extra=>({id:8,timeLimit:60,jars:[{x:280,color:'blue'}],groups:[{x:150,y:150,color:'blue',count:8}],rocks:[],tunnels:[[[100,100],[100,500]]],treasures:[{kind:'bag',x:200,y:300,r:16,points:20}],mechanics:{},budget:{three:1000,two:2000},targetScore:10,...extra});
const seedFor=kind=>{for(let seed=0;seed<1000;seed++){const w=new World(base(),{seed});if(w.treasures[0].outcome===kind)return seed;}throw Error('No '+kind+' outcomes');};
const opened=(kind,extra={})=>{const w=new World(base(extra),{seed:seedFor(kind)});w.magic.open(w.treasures[0],w.balls[0]);return w;};
const tick=(w,seconds)=>{for(let i=0;i<Math.ceil(seconds*120);i++)w.step();};
test('bags offer only coins and bombs independently of cart and rival random draws',()=>{const counts={};for(let seed=0;seed<3000;seed++){const w=new World(base(),{seed});counts[w.treasures[0].outcome]=(counts[w.treasures[0].outcome]||0)+1;}a.deepEqual(Object.keys(counts).sort(),['bomb','coins20','coins40']);for(const kind of ['coins20','coins40','bomb'])a.ok(counts[kind]>300,JSON.stringify(counts));for(const [kind,ratio]of Object.entries({coins20:.65,coins40:.2,bomb:.15}))a.ok(Math.abs(counts[kind]/3000-ratio)<.04);const seed=seedFor('bomb'),w=new World(base(),{seed});for(let i=0;i<100;i++){w.random();w.random('rival');}a.equal(w.treasures[0].outcome,new World(base(),{seed}).treasures[0].outcome);});
test('unopened bags expose safe +40 potential, coins resolve once, chests remain fixed',()=>{const w=new World(base({treasures:[{kind:'bag',x:200,y:300,points:20},{kind:'chest',x:400,y:300,points:30}]}),{seed:seedFor('coins40')});a.equal(w.remainingPotential(),150);w.magic.open(w.treasures[0],w.balls[0]);w.magic.open(w.treasures[0],w.balls[0]);a.equal(w.score,40);a.equal(w.remainingPotential(),110);w.magic.open(w.treasures[1],w.balls[0]);a.equal(w.score,70);});
test('small bomb has warning, devalues only in-range unscored gems and keeps old score',()=>{const w=opened('bomb');for(const b of w.balls)Object.assign(b,{x:500,y:100,held:true});const near=w.balls[0],outside=w.balls[1],scored=w.balls[2];w.receive(w.jars[0],scored);Object.assign(near,{x:270,y:300});Object.assign(outside,{x:273,y:300});tick(w,.89);a.equal(near.value,undefined);tick(w,.02);a.equal(near.value,3);a.equal(outside.value,undefined);a.equal(scored.value,undefined);a.equal(w.score,10);tick(w,.6);a.equal(w.magic.pending,false);w.receive(w.jars[0],near);a.equal(w.score,13);});
test('magic bomb affects recoverable sack beads at the sack world position',()=>{const w=opened('bomb',{mechanics:{rival:{speed:0}}}),r=w.rival,b=w.balls[0];b.active=false;r.bag.push(b);Object.assign(r,{x:215,y:310});const p=r.bagPoint();w.magic.blast({x:p.x,y:p.y,radius:72});a.equal(b.value,3);const value=b.value;w.magic.blast({x:p.x,y:p.y,radius:72});a.equal(b.value,value);});
test('bomb fear has sitting, drop-and-run and carry-and-run, and respects radius',()=>{for(const roll of [.1,.6,.9]){const w=new World(base({mechanics:{rival:{speed:20}}}),{seed:2}),r=w.rival;Object.assign(r,{x:210,y:300});w.random=()=>roll;w.magic.blast({x:200,y:300,radius:72});a.equal(r.resting,roll<.5);a.equal(r.fleeing,roll>=.5);if(roll>=.5)a.equal(r.dropBag,roll<.75);else a.equal(r.phase,'rest');}const w=new World(base({mechanics:{rival:{speed:20}}}),{seed:2});Object.assign(w.rival,{x:400,y:300});w.magic.blast({x:200,y:300,radius:72});a.equal(w.rival.fleeing,false);a.equal(w.rival.resting,false);});
test('last gem touching bomb bag and entering cart waits for complete effect before winning',()=>{const w=new World(base({groups:[{x:280,y:100,color:'blue',count:1}],treasures:[{kind:'bag',x:280,y:590,r:16,points:20}]}),{seed:seedFor('bomb')});Object.assign(w.balls[0],{x:280,y:589,vy:240});w.step();a.equal(w.collected,1);a.equal(w.state,'playing');a.equal(w.magic.pending,true);tick(w,1.5);a.equal(w.state,'won');a.equal(w.score,10);a.equal(w.events.filter(e=>e.type==='magic-blast').length,1);const snapshot=w.snapshot();tick(w,3);a.deepEqual(w.snapshot(),snapshot);});
test('deadline freezes score contacts and actors but drains two pending effects FIFO',()=>{const w=new World(base({timeLimit:.01,targetScore:0,treasures:[{kind:'bag',x:200,y:300},{kind:'bag',x:250,y:300}]}),{seed:40});a.deepEqual(w.treasures.map(t=>t.outcome),['bomb','bomb']);w.magic.open(w.treasures[0],w.balls[0]);w.magic.open(w.treasures[1],w.balls[0]);w.step(.01);const positions=w.balls.map(b=>[b.x,b.y]),score=w.score;a.equal(w.timeRemaining,0);a.equal(w.state,'playing');a.equal(w.dig([100,100],[100,500]),0);tick(w,4);a.equal(w.state,'won');a.equal(w.endCause,'timeout');a.equal(w.score,score);a.deepEqual(w.balls.map(b=>[b.x,b.y]),positions);a.equal(w.magic.pending,false);});
test('shareable initialization validates level and uint32 seed without unlocking gameplay',()=>{const M=require('../magic.js');a.deepEqual(M.parseStart('?level=8&seed=0'),{index:7,seed:0});a.deepEqual(M.parseStart('?level=15&seed=4294967295'),{index:14,seed:4294967295});for(const q of ['?level=16&seed=-1','?level=x&seed=abc','?level=0&seed=4294967296'])a.deepEqual(M.parseStart(q),{index:0,seed:undefined});const w=new World(base(),{seed:0});a.equal(w.snapshot().seed,0);a.equal(w.snapshot().version,18);});
test('collection before or at bomb ignition keeps full value; later arrival earns waste value',()=>{for(const when of ['early','same','late']){const w=new World(base({targetScore:0,groups:[{x:280,y:100,color:'blue',count:1}],treasures:[{kind:'bag',x:280,y:590,points:20}]}),{seed:seedFor('bomb')});w.magic.open(w.treasures[0],w.balls[0]);w.magic.step(.898);Object.assign(w.balls[0],{x:280,y:when==='early'?589.9:when==='same'?590-(100+740*.002)*.002:589.6,vy:100});w.step();a.equal(w.score,when==='late'?3:10,when);}});
test('an unopened magic bag cannot recover a small sealed thief sack when no free bead can trigger it',()=>{
 for(const won of [false,true]){const w=new World(base({groups:[{x:150,y:150,color:'blue',count:6}],mechanics:{rival:{speed:20}},targetScore:won?20:50}),{seed:3});
 for(const b of w.balls.slice(0,2))w.receive(w.jars[0],b);
 for(const b of w.balls.slice(2)){w.rival.bag.push(b);w.resolveBead(b,'stolen');}
 a.equal(w.rival.bag.length,4);a.equal(w.magic.canScare,false);a.equal(w.remainingPotential(),0);w.checkOutcome();a.equal(w.state,won?'won':'lost');a.equal(w.endCause,won?'exhausted':'unreachable');a.equal(w.time,0);
 }
});
test('live trigger beads and already lit magic bombs preserve small-sack recovery potential',()=>{
 const make=()=>new World(base({groups:[{x:150,y:150,color:'blue',count:6}],mechanics:{rival:{speed:20}},targetScore:50}),{seed:3});
 const w=make();for(const b of w.balls.slice(0,4)){w.rival.bag.push(b);w.resolveBead(b,'stolen');}a.equal(w.magic.canScare,true);a.equal(w.recoverableBag().length,4);
 w.magic.open(w.treasures[0],w.balls[4]);a.equal(w.treasures[0].outcome,'bomb');for(const b of w.balls.slice(4))w.resolveBead(b,'missed');a.equal(w.magic.canScare,true);a.equal(w.recoverableBag().length,4);w.checkOutcome();a.equal(w.state,'playing');
 const dropped=make();for(const b of dropped.balls.slice(0,4)){dropped.rival.bag.push(b);dropped.resolveBead(b,'stolen');}const spill=dropped.balls[4];for(const b of dropped.balls.slice(4))dropped.resolveBead(b,'missed');dropped.droppedBags.push({x:100,y:100,balls:[spill],age:0});a.equal(dropped.magic.canScare,true);a.equal(dropped.recoverableBag().length,4);
});
test('independent future spills can trigger a magic bag to clear a cargo stone before scoring',()=>{
 for(const release of ['torn','overloaded','drop']){const w=new World(base({groups:[{x:150,y:150,color:'blue',count:7}],mechanics:{rival:{speed:20}},targetScore:50,rocks:[{x:280,y:560,rx:40,ry:30}]}),{seed:3}),r=w.rival;
 for(const b of w.balls){r.bag.push(b);w.resolveBead(b,'stolen');}if(release!=='overloaded')r.bag.splice(4);r.torn=release==='torn';r.fleeing=r.dropBag=release==='drop';
 Object.assign(w.rocks[0],{phase:'cargo',carriers:[0],cartOffset:0,slotLoads:{0:w.jars[0].capacity}});a.equal(w.cargo.freeSlots(w.jars[0]),0);a.equal(w.magic.canScare,true,release);a.equal(w.remainingPotential(),r.bag.length*10+40,release);w.checkOutcome();a.equal(w.state,'playing',release);
 r.escaped=true;a.equal(w.magic.canScare,false,release);a.equal(w.remainingPotential(),0,release);
 }
});

test('former refill seeds award coins immediately without changing terrain, locking input or pausing time',()=>{
 for(const seed of [8,34]){
  const w=new World(base(),{seed});a.equal(w.treasures[0].outcome,'coins20');
  w.dig([250,200],[250,450],20);const grid=w.terrain.grid.slice(),dug=w.terrain.units;
  w.magic.open(w.treasures[0],w.balls[0]);a.equal(w.score,20);a.deepEqual(w.terrain.grid,grid);a.equal(w.terrain.units,dug);
  a.equal(w.magic.pending,false);a.equal(w.inputLocked,false);a.equal(w.magic.pausesWorld,false);
  const time=w.time;tick(w,2);a.ok(w.time>time+1.9);a.equal(w.terrain.sandSolid(250,400),false);
  a.ok(w.dig([300,200],[300,400],20)>0);a.equal(w.events.some(e=>e.type==='magic-refilled'),false);
 }
});
test('consecutive bomb bags drain once in FIFO order while game time keeps running',()=>{
 const w=new World(base({targetScore:0,treasures:[{kind:'bag',x:200,y:300},{kind:'bag',x:250,y:300}]}),{seed:40});
 for(const t of w.treasures)w.magic.open(t,w.balls[0]);tick(w,4);
 a.deepEqual(w.magic.completed,[{id:0,kind:'bomb'},{id:1,kind:'bomb'}]);a.equal(w.magic.pending,false);a.ok(Math.abs(w.time-4)<.009);
 a.equal(w.events.filter(e=>e.type==='magic-blast').length,2);
});
