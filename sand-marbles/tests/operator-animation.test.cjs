const {test}=require('node:test'),a=require('node:assert/strict'),Animation=require('../operator-animation.js');
const op=()=>({phase:'control',activeJar:0,pointDirection:-1,steering:0});
test('left/right gestures include release, full extension, return and regrip, with one frame each tick',()=>{
 const anim=new Animation(),o=op();let t=0;
 for(const [jar,dir,base]of [[0,-1,12],[1,1,18]]){
  o.activeJar=jar;o.pointDirection=dir;const seen=new Set();
  for(let n=0;n<120;n++){const f=anim.update(o,t);t+=1/120;a.ok(Number.isInteger(f)&&f>=0&&f<24);seen.add(f);}
  for(let n=0;n<6;n++)a.ok(seen.has(base+n),'missing pose '+(base+n));a.equal(anim.frame,5);
 }
});
test('hard reversal traverses every steering pose and never jumps more than one pose',()=>{
 const anim=new Animation(),o=op();let t=0;for(let n=0;n<130;n++){anim.update(o,t);t+=1/120;}
 o.steering=-1;for(let n=0;n<100;n++){anim.update(o,t);t+=1/120;}a.equal(anim.frame,0);
 o.steering=1;const seen=new Set([0]);let last=0;
 for(let n=0;n<140;n++){const f=anim.update(o,t);t+=1/120;a.ok(Math.abs(f-last)<=1);seen.add(f);last=f;}
 a.deepEqual([...seen],[0,1,2,3,4,5,6,7,8,9,10]);
});
test('gesture returns through lower hand poses without lifting the arm again',()=>{
 const anim=new Animation(),o=op(),frames=[];for(let n=0;n<120;n++){const f=anim.update(o,n/120);if(frames.at(-1)!==f)frames.push(f);}
 a.deepEqual(frames,[12,13,14,15,16,15,14,17,13,12,5]);
});
test('pause holds the exact pose; restart and scare discard unfinished gestures',()=>{
 const anim=new Animation(),o=op();anim.update(o,0);anim.update(o,.1);const f=anim.frame;
 for(let n=0;n<60;n++)a.equal(anim.update(o,.1),f);
 o.phase='scared';a.equal(anim.update(o,.2),5);a.equal(anim.gesture,null);
 o.phase='control';anim.update(o,0);a.equal(anim.gesture.age,0);a.equal(anim.frame,12);
});
test('wheel rotation eases with steering, pauses and holds its angle when control is scared',()=>{
 const anim=new Animation(),o=op();let t=0;
 for(let n=0;n<130;n++){anim.update(o,t);t+=1/120;}
 o.steering=1;let last=0;
 for(let n=0;n<80;n++){anim.update(o,t);t+=1/120;a.ok(Math.abs(anim.wheelAngle-last)<=2.2/120+1e-9);last=anim.wheelAngle;}
 a.ok(anim.wheelAngle<-.65);const angle=anim.wheelAngle;
 anim.update(o,t-1/120);a.equal(anim.wheelAngle,angle);
 o.phase='scared';anim.update(o,t);a.equal(anim.wheelAngle,angle);
 anim.reset();a.equal(anim.wheelAngle,0);
});
