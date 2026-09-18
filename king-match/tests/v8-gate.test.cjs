const {test}=require('node:test'),assert=require('node:assert/strict'),{Game}=require('../engine'),G=require('../geometry');
test('the feed flap rotates continuously from the wall and joins the ramp without deleting matter',()=>{
 const g=new Game();g.particles=[];g.recovery={};let before=null;
 for(let i=0;i<120;i++){g.updateGate();if(before)for(let j=0;j<4;j++)assert.ok(Math.hypot(g.feedGate[j][0]-before[j][0],g.feedGate[j][1]-before[j][1])<.85);before=g.feedGate.map(p=>[...p]);}
 assert.ok(Math.abs(g.gateLift-1)<1e-10);assert.ok(Math.abs(g.feedGate[2][0]-348)<1e-8);assert.equal(g.crushed,0);
 g.recovery=null;for(let i=0;i<121;i++)g.updateGate();assert.equal(g.gateLift,0);assert.equal(g.feedGate,null);
});
test('a closed inlet flap leaves already admitted gold free to fall below it',()=>{
 const g=new Game();g.start();g.sourceEnabled=false;g.particles=[];g.recovery={};for(let i=0;i<120;i++)g.updateGate();
 g.particles=[{id:0,x:375,y:280,r:7,vx:0,vy:20,angle:0,spin:0}];
 for(let i=0;i<30;i++){g.particleStep();g.finishConstraints();assert.ok(g.overlap()<.05);}
 assert.ok(g.particles[0].y>300);assert.equal(g.crushed,0);assert.equal(g.collected,0);
});
test('recovery still admits normal source gold without advancing the danger clock',()=>{
 const g=new Game();g.start();g.sourceEnabled=true;g.particles=[];g.spawned=g.supplied=g.queued=0;
 g.operation={kind:'fall',started:0,matched:[],after:g.board,tiles:[{from:0,to:8,x:24,y:398,startY:398,targetY:446}]};g.beginRecovery();const time=g.time;
 g.update(1/120);g.update(1/120);assert.ok(g.spawned>0);assert.equal(g.time,time);assert.equal(g.hp,100);assert.equal(g.supplied,g.spawned+g.queued);
});
