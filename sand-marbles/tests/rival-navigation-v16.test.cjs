const {test}=require('node:test'),a=require('node:assert/strict'),Rival=require('../rival.js');
const bead=(x,y)=>({x,y,r:8.5,color:'jade',vx:0,vy:0,active:true});
function scene(x=279,y=247,balls=[bead(400,300)],rocks=[{x:280,y:300,rx:60,ry:40,angle:0}]){
 const r=new Rival({rocks,mechanics:{rival:{speed:38}}},balls);Object.assign(r,{x,y,hearingCooldown:100});
 const w={time:0,balls,rocks,events:[],random:()=>.99,terrain:{solid:()=>false,dig:()=>0},queueInteraction:e=>e.apply(),resolveBead:b=>{a.equal(b.active,true);b.active=false;b.stolen=true;}};
 return {r,w};
}
function run(s,seconds,move){for(let i=0;i<seconds*120;i++){const prev={x:s.r.x,y:s.r.y};s.w.time+=1/120;move?.(s,i);s.r.step(s.w,1/120);a.ok(s.r.clear(s.r.x,s.r.y),'rival crossed a rock');a.ok(Math.hypot(s.r.x-prev.x,s.r.y-prev.y)<1,'rival teleported');}}
test('actual position connects to a collision-clear first path segment at rock edge',()=>{
 const {r,w}=scene();const path=r.route(w.balls[0]);a.ok(path.length);let from=r;for(const to of path){a.ok(r.lineClear(from,to),JSON.stringify({from:{x:from.x,y:from.y},to}));from=to;}
});
test('single bead pursuit around both rock edges reaches the sack instead of looping for 15 seconds',()=>{
 for(const mirror of [false,true]){const s=scene(mirror?281:279,247,[bead(mirror?160:400,300)]);run(s,20);a.equal(s.r.bag.length,1);a.equal(s.r.bag[0],s.w.balls[0]);}
});
test('only unreachable bead causes visible patrol and later retries without inventing theft',()=>{
 const s=scene(70,230,[bead(9,232)],[]),start={x:s.r.x,y:s.r.y};run(s,6);a.ok(Math.hypot(s.r.x-start.x,s.r.y-start.y)>20);a.equal(s.r.bag.length,0);a.equal(s.w.balls[0].active,true);
});
test('a moving single target is followed and stowed when it comes to rest',()=>{
 const s=scene(100,180,[bead(320,190)],[]);run(s,20,({w},i)=>{if(i<480){w.balls[0].x=320+Math.sin(i/120)*45;w.balls[0].vx=Math.cos(i/120)*45;}else w.balls[0].vx=0;});a.equal(s.r.bag.length,1);
});
test('same-stamina real travel reflects 0,3,6,10,20 bead load monotonically',()=>{
 const distances=[];for(const n of [0,3,6,10,20]){const s=scene(70,200,[bead(490,200)],[]);s.r.bag=Array.from({length:n},()=>({...bead(0,0),active:false}));run(s,.5);distances.push(Math.hypot(s.r.x-70,s.r.y-200));}
 for(let i=1;i<distances.length;i++)a.ok(distances[i]<distances[i-1]);a.ok(distances[2]/distances[0]<.67&&distances[2]/distances[0]>.57,distances.join(','));a.ok(distances[3]/distances[0]<.54&&distances[3]/distances[0]>.45,distances.join(','));
});
test('zero-speed blocked travel does not drain stamina merely for intending to walk',()=>{
 const s=scene(100,200,[bead(490,200)],[]);s.r.speed=0;const initial=s.r.stamina;run(s,1);a.equal(s.r.stamina,initial);
});
test('40 rotated rock-edge starts complete single-bead pursuit without crossing rock or losing identity',()=>{
 for(const angle of [0,.25,-.35,.6])for(let k=0;k<10;k++){
  const t=k*Math.PI/5,dx=Math.cos(t)*76,dy=Math.sin(t)*56,c=Math.cos(angle),sn=Math.sin(angle),rock={x:280,y:300,rx:60,ry:40,angle};
  const s=scene(280+dx*c-dy*sn,300+dx*sn+dy*c,[bead(k%2?140:420,300)],[rock]);
  run(s,24);a.equal(s.r.bag.length,1,JSON.stringify({angle,k,r:s.r.snapshot()}));a.equal(s.r.bag[0],s.w.balls[0]);
 }
});
test('a formerly unreachable single bead is pursued after a rock clears the route',()=>{
 const s=scene(90,200,[bead(280,300)]);run(s,4);a.equal(s.r.bag.length,0);s.w.rocks[0].broken=true;run(s,20);a.equal(s.r.bag.length,1);
});
test('pursuer replans after the blocking rock moves without crossing its new boundary',()=>{
 const s=scene(90,240,[bead(440,300)]);run(s,1);s.w.rocks[0].y+=45;run(s,20);a.equal(s.r.bag.length,1);
});
test('unreachable nearest bead does not starve a farther reachable bead',()=>{
 const s=scene(80,232,[bead(9,232),bead(300,270)],[]);run(s,16);a.equal(s.r.bag.length,1);a.equal(s.r.bag[0],s.w.balls[1]);a.equal(s.w.balls[0].active,true);
});
test('loaded escape stays slow when entering the visible screen-edge exit segment',()=>{
 for(const n of [0,6,20]){const {r,w}=scene(100,200,[bead(450,300)],[]);r.bag=Array.from({length:n},()=>({...bead(0,0),active:false}));r.scare(w);let reached=false;
  for(let i=0;i<2400&&!r.escaped;i++){const x=r.x,y=r.y;w.time+=1/120;r.step(w,1/120);if(r.atExit&&!r.escaped){reached=true;const speed=Math.hypot(r.x-x,r.y-y)*120;a.ok(Math.abs(speed-110*r.loadFactor)<.001,JSON.stringify({n,speed}));}}
  a.ok(reached);a.ok(r.escaped);
 }
});
