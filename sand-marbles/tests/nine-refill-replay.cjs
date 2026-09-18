// Recovery strokes use visible live bead positions; no world mutations.
const {World}=require('../core.js'),levels=require('../levels.js'),solutions=require('./solutions.cjs');
module.exports=function replayDoubleRefill(mode=0,seed=34){const w=new World(levels[8],{seed}),base=structuredClone(solutions[8]),log=[],inputs=[];let commands=[],cur=0,refills=0,reopen=false;
function add(path,fast=false){const p=path.slice().reverse();for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],n=fast?Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/12)):20;for(let k=1;k<=n;k++)commands.push([[a[0]+(b[0]-a[0])*(k-1)/n,a[1]+(b[1]-a[1])*(k-1)/n],[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]]);}}
function build(first){commands=[];cur=0;if(first){for(const p of base)add(p);return;}
const colors=mode===0?['jade','blue','rose','amber']:['blue','rose','jade','amber'];for(const color of colors){const bs=w.balls.filter(b=>b.active&&!b.held&&b.color===color);if(!bs.length)continue;const low=bs.reduce((a,b)=>a.y>b.y?a:b),top=bs.reduce((a,b)=>a.y<b.y?a:b),x=bs.reduce((a,b)=>a+b.x,0)/bs.length,y=Math.max(...bs.map(b=>b.y)),jar=w.jars.find(j=>j.color===color);let p;
if(color==='blue'&&!w.treasures[1].opened)p=[[x,y],[365,420],[338,575]];
else if(color==='rose'&&y<300)p=[[x,y],[440,Math.max(y+35,250)],[505,360],[456,575]];
else p=[[x,y],[jar.homeX,Math.min(550,y+80)],[jar.homeX,575]];
add(p,mode>=2);for(const b of bs)add([[b.x,b.y],[x,y]],mode>=2);
}log.push({t:w.time,refills,paths:commands.length,balls:w.balls.filter(b=>b.active).map(b=>({x:b.x,y:b.y,color:b.color})),score:w.score});}
function step(){w.step();const n=w.magic.completed.filter(e=>e.kind==='refill').length;if(n>refills){refills=n;reopen=true;}}build(true);for(let guard=0;guard<30000&&w.state==='playing';guard++){if(w.inputLocked){step();continue;}if(reopen){build(false);reopen=false;}if(cur<commands.length){const c=commands[cur++];inputs.push({t:w.time,a:c[0],b:c[1]});w.dig(...c);for(let k=0;k<2;k++){step();while(w.magic.pausesWorld&&w.state==='playing')step();}}else step();}return{w,mode,score:w.score,state:w.state,stars:w.stars,dug:w.terrain.units,completed:w.magic.completed,loss:w.losses,log,inputs,events:w.events.filter(e=>e.type==='loss')};};
