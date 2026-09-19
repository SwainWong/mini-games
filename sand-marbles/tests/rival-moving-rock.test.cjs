const {test}=require('node:test'),a=require('node:assert/strict'),Rival=require('../rival.js'),G=require('../rock-geometry.js');
function scene(){
 const rock={x:280,y:300,rx:60,ry:40,angle:0},ball={x:420,y:330,r:8.5,color:'blue',vx:0,vy:0,active:true};
 const r=new Rival({rocks:[rock],mechanics:{rival:{speed:38}}},[ball]);Object.assign(r,{x:205,y:320,hearingCooldown:100});
 const w={time:0,balls:[ball],rocks:[rock],events:[],random:()=>.99,terrain:{solid:()=>false,dig:()=>0},queueInteraction:e=>e.apply(),resolveBead:b=>{b.active=false;b.stolen=true;}};
 return {r,w,rock,ball};
}
function tick(s){s.w.time+=1/120;s.r.step(s.w,1/120);}
test('slow rock entering navigation clearance pushes the thief out and pursuit resumes',()=>{
 const s=scene();a.equal(s.r.clear(s.r.x,s.r.y),true);s.rock.x-=10;
 a.equal(G.contains(s.rock,s.r.x,s.r.y),false);a.equal(s.r.clear(s.r.x,s.r.y),false);
 const start={x:s.r.x,y:s.r.y};for(let i=0;i<2400&&s.ball.active;i++)tick(s);
 a.ok(s.r.clear(s.r.x,s.r.y));a.equal(s.r.bag[0],s.ball);a.ok(Math.hypot(s.r.x-start.x,s.r.y-start.y)>30);
});
test('a rock keeps moving after its first stun without embedding the stunned thief',()=>{
 const s=scene();s.r.stun(s.w,.4);
 for(let i=0;i<48;i++){if(i<24)s.rock.x-=.5;const before={x:s.r.x,y:s.r.y};tick(s);a.ok(s.r.clear(s.r.x,s.r.y),'embedded at frame '+i);a.ok(Math.hypot(s.r.x-before.x,s.r.y-before.y)<2,'large jump');}
 for(let i=0;i<2400&&s.ball.active;i++)tick(s);a.equal(s.r.bag[0],s.ball);
});
test('tilted rock contact separates locally on every side without crossing to the opposite side',()=>{
 for(const angle of [0,.35,-.5])for(let i=0;i<8;i++){
  const s=scene();s.rock.angle=angle;const t=i*Math.PI/4,p=G.point(s.rock,Math.cos(t)*74,Math.sin(t)*54);
  Object.assign(s.r,p,{stunTime:.5});a.ok(s.r.clear(s.r.x,s.r.y));
  const d=Math.hypot(p.x-s.rock.x,p.y-s.rock.y);s.rock.x+=(p.x-s.rock.x)/d*4;s.rock.y+=(p.y-s.rock.y)/d*4;
  a.equal(s.r.clear(s.r.x,s.r.y),false);tick(s);a.ok(s.r.clear(s.r.x,s.r.y));a.ok(Math.hypot(s.r.x-p.x,s.r.y-p.y)<6);
 }
});
test('forced rock displacement releases the held bead and keeps its identity and future score',()=>{
 const s=scene();Object.assign(s.ball,{held:true,x:240,y:320});s.r.pickup={ball:s.ball,age:.45,contactFrame:2};s.rock.x-=10;tick(s);
 a.equal(s.r.pickup,null);a.equal(s.ball.held,false);a.equal(s.ball.active,true);a.equal(s.r.bag.length,0);a.ok(s.ball.theftImmuneUntil>s.w.time);a.ok(s.r.clear(s.r.x,s.r.y));
});
