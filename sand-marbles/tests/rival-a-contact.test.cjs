const{test}=require('node:test'),a=require('node:assert/strict'),Rival=require('../rival.js'),A=require('../rival-animation.js');
function scene(ball,rocks=[]){const r=new Rival({rocks,mechanics:{rival:{speed:38}}},[ball]);Object.assign(r,{x:280,y:250,fx:1,hearingCooldown:100});const w={time:0,balls:[ball],rocks,events:[],random:()=>.99,terrain:{solid:()=>false,dig:()=>0},queueInteraction:e=>e.apply(),resolveBead:b=>{b.active=false;b.stolen=true;}};return{r,w};}
const bead=(x,y,r=8.5)=>({x,y,r,color:'blue',vx:0,vy:0,active:true});
function tick(s){s.w.time+=1/120;s.r.step(s.w,1/120);}
test('48 approach directions and radii reach real palm, conserve bead identity and stow at the actual bag mouth',()=>{
 for(const radius of [8,8.5,10])for(const dir of [-1,1])for(let k=0;k<8;k++){
  const b=bead(280+Math.cos(k*Math.PI/4)*23,250+Math.sin(k*Math.PI/4)*23,radius),s=scene(b);s.r.fx=dir;let contacted=false,stowed=false;
  for(let i=0;i<900&&!stowed;i++){const old={x:b.x,y:b.y},wasHeld=b.held,root={x:s.r.x,y:s.r.y};tick(s);a.ok(Math.hypot(s.r.x-root.x,s.r.y-root.y)<1);
   if(!wasHeld&&b.held){contacted=true;a.ok(Math.hypot(b.x-old.x,b.y-old.y)<.01,'capture must not move the bead');a.ok(s.r.pickup.age>=.24);}
   if(b.held){const palm=A.palm(s.r);a.ok(Math.hypot(b.x-palm.x,b.y-palm.y)<=2.01);a.equal(b.active,true);}
   if(b.stolen){stowed=true;const mouth=s.r.bagPoint();a.ok(Math.hypot(b.x-mouth.x,b.y-mouth.y)<.01);a.equal(s.r.bag[0],b);}
  }a.ok(contacted&&stowed,JSON.stringify({radius,dir,k,r:s.r.snapshot()}));
 }
});
test('physical bead stays free throughout reach and rolling away cancels without pulling it back',()=>{
 const s=scene(bead(0,0)),b=s.w.balls[0];Object.assign(b,A.point(s.r,A.pickup[2]));tick(s);for(let i=0;i<20;i++){tick(s);a.equal(!!b.held,false);}b.x+=40;const x=b.x;tick(s);a.equal(b.x,x);a.equal(!!b.held,false);a.equal(s.r.bag.length,0);
});
test('a rock entering the hand path after grip releases that same bead before penetration',()=>{
 const s=scene(bead(0,0)),b=s.w.balls[0];Object.assign(b,A.point(s.r,A.pickup[2]));for(let i=0;i<31;i++)tick(s);a.ok(b.held);
 const next=A.point(s.r,A.pickup[9]);s.r.rocks.push({x:next.x,y:next.y-8,rx:11,ry:8,angle:0});for(let i=0;i<30&&b.held;i++)tick(s);a.equal(b.held,false);a.equal(b.active,true);a.equal(s.r.bag.length,0);a.ok(b.theftImmuneUntil>s.w.time);
});
test('bag load changes its size without moving the actual deposit aperture',()=>{
 const s=scene(bead(300,250));for(const dir of [-1,1]){s.r.fx=dir;const mouth=s.r.bagPoint();for(const count of [0,3,6,12]){s.r.bag=Array(count).fill({});a.deepEqual(s.r.bagPoint(),mouth);}}
});
test('stone-bottom and board-top/bottom contacts have a complete legal pose rather than a fixed low hand',()=>{
 for(const [x,y,by,rocks] of [[280,377,355,[{x:280,y:300,rx:60,ry:40,angle:0}]],[280,75,62,[]],[280,540,558,[]]]){
  const s=scene(bead(280,by),rocks);Object.assign(s.r,{x,y});const p=s.r.contactStance(s.w.balls[0]);a.ok(p,JSON.stringify({by}));a.ok(s.r.clear(p.x,p.y));
 }
});
