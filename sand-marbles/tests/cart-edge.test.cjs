const {test}=require('node:test');
const assert=require('node:assert/strict');
const {World,jarMouth,STEP}=require('../core.js');
function board(type='glass',jars=[{x:280,color:'blue'}]){
 return new World({jars,groups:[{x:280,y:120,color:'blue',count:1,type}],rocks:[],tunnels:[],budget:{three:100,two:200},mechanics:{}},{seed:1});
}
function drop(w,x,y=589,vy=240){Object.assign(w.balls[0],{x,y,vx:0,vy});for(let i=0;i<100&&w.state==='playing';i++)w.step();return w;}
for(const type of ['glass','heavy','rubber','light']){
 test(`${type}: both visible inner edges receive the bead center, without a hidden radius inset`,()=>{
  for(const offset of [-46,-45.9,-44,-40,0,40,44,45.9,46]){const w=drop(board(type),280+offset);assert.equal(w.state,'won',`${type} offset ${offset}`);assert.equal(w.collected,1);assert.equal(w.jars[0].balls.length,1);}
 });
 test(`${type}: centers outside the opening miss at the opening, before passing through the cart`,()=>{
  for(const offset of [-60,-48,-46.1,46.1,48,60]){const w=drop(board(type),280+offset);assert.equal(w.failure?.kind,'missed');assert.equal(w.failure.y,590);assert.equal(w.collected,0);assert.equal(w.stars,0);}
 });
}
test('a visible-edge catch still enforces color',()=>{
 const w=board();w.balls[0].color='amber';drop(w,324);assert.equal(w.failure?.kind,'wrong-color');assert.equal(w.collected,0);assert.equal(w.failure.y,590);
});
test('a bead in the narrow gap is not attracted to either adjacent cart',()=>{
 const w=board('heavy',[{x:280,color:'blue'},{x:376,color:'amber'}]);drop(w,328);assert.equal(w.failure?.kind,'missed');assert.equal(w.collected,0);
});
test('moving cart receives at the interpolated crossing, for both rims and bead directions',()=>{
 // Controlled cart translations isolate relative crossing from the random walking schedule.
 for(const type of ['glass','heavy','rubber','light'])for(const speed of [-400,-120,0,120,400])for(const vx of [-180,0,180])for(const vy of [60,390])for(const offset of [-46.1,-45.9,45.9,46.1]){
  const w=board(type),b=w.balls[0],u=.25/(Math.min(390,vy+b.gravity*STEP)*STEP);
  w.mechanisms=dt=>{w.jars[0].x+=speed*dt;};
  Object.assign(b,{x:280+offset+(speed-vx*.999)*STEP*u,y:589.75,vx,vy});w.step();
  assert.equal(w.state,Math.abs(offset)<46?'won':'lost',JSON.stringify({type,speed,vx,vy,offset,s:w.snapshot()}));
  if(w.state==='lost')assert.equal(w.failure.kind,'missed');
 }
});
test('the cart cannot collect an ascending bead or one already below its mouth',()=>{
 for(const [y,vy] of [[603,200],[595,-200]]){const w=board();Object.assign(w.balls[0],{x:280,y,vy,vx:0});w.step();assert.equal(w.collected,0);assert.equal(w.state,'playing');}
});
test('a miss freezes the cart at the failed crossing instead of its later position',()=>{
 const w=board(),b=w.balls[0];w.mechanisms=dt=>{w.jars[0].x-=300*dt;};Object.assign(b,{x:330,y:589.75,vy:240,vx:0});w.step();assert.equal(w.state,'lost');assert.ok(w.time<=STEP);assert.equal(w.failure.y,jarMouth(w.jars[0]).y);assert.equal(w.jars[0].x,w.failure.mouthX);assert.equal(w.failure.targetX,w.failure.mouthX);const snap=w.snapshot();for(let i=0;i<100;i++)w.step();assert.deepEqual(w.snapshot(),snap);
});

test('actual porter stride freezes at its crossing position for either outside edge',()=>{
 for(const seed of [1,3,300,1000])for(const side of [-1,1]){
  const level={jars:[{x:280,color:'blue'}],groups:[{x:280,y:120,color:'blue',count:1}],rocks:[],tunnels:[],budget:{three:100,two:200},mechanics:{porter:true}};
  const w=new World(level,{seed}),preview=new World(level,{seed});
  for(let i=0;i<41;i++){w.mechanisms(STEP);preview.mechanisms(STEP);}const before=w.jars[0].x;preview.mechanisms(STEP);
  const b=w.balls[0],u=.25/((240+b.gravity*STEP)*STEP),mouthX=before+(preview.jars[0].x-before)*u;
  Object.assign(b,{x:mouthX+side*46.1,y:589.75,vy:240,vx:0});w.step();assert.equal(w.failure?.kind,'missed');assert.equal(w.failure.mouthX,w.jars[0].x);assert.ok(Math.abs(b.x-w.jars[0].x)>46);
 }
});
