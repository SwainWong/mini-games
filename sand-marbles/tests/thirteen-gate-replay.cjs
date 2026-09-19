// Input-only recovery: inspect visible bead positions and open the sand gate when the cart arrives.
const {World}=require('../core.js'),levels=require('../levels.js'),base=require('./solutions.cjs')[12];
function run({delay=.5,ticks=2,order=[0,1]}={}){const w=new World(levels[12],{seed:8});let commands=[],cursor=0,refills=0,rebuild=false,passes=0,lastBuild=0;const trace=[];let gates=[];
 const add=path=>{const p=path.slice().reverse();for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],n=passes<=1?20:Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8));for(let k=1;k<=n;k++)commands.push([[a[0]+(b[0]-a[0])*(k-1)/n,a[1]+(b[1]-a[1])*(k-1)/n],[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]]);}};
 const build=first=>{commands=[];cursor=0;gates=[];lastBuild=w.time;const paths=[];
 if(first)paths.push(...order.map(i=>base[i]));else{
 const colors=['amber','blue'];
 for(const color of colors){const balls=w.balls.filter(b=>b.active&&!b.held&&b.color===color);if(!balls.length)continue;const x=balls.reduce((s,b)=>s+b.x,0)/balls.length,y=Math.max(...balls.map(b=>b.y)),j=w.jars.find(j=>j.color===color),out=color==='blue'?150:430,path=[[x,y]];
 const original=structuredClone(base[color==='blue'?0:1]);original[original.length-1]=[out,520];paths.push(original);gates.push({color,out,opened:false});
 for(const b of balls){const next=original.find(p=>p[1]>=b.y+10)||original.at(-1);paths.push([[b.x,b.y],next]);}
 }
 }
 passes++;trace.push({time:w.time,score:w.score,paths,rival:{x:w.rival.x,y:w.rival.y},balls:w.snapshot().balls,jars:w.jars.map(j=>({x:j.x,color:j.color}))});paths.forEach(add);};
 const step=()=>{w.step();const n=w.magic.completed.filter(e=>e.kind==='refill').length;if(n>refills){refills=n;rebuild=true;}};
 for(let i=0;i<delay*120;i++)step();build(true);
 for(let guard=0;w.state==='playing'&&guard<30000;guard++){if(w.inputLocked){step();continue;}if(rebuild){build(false);rebuild=false;}for(const g of gates){if(g.opened)continue;const bs=w.balls.filter(b=>b.active&&!b.held&&b.color===g.color),near=bs.filter(b=>b.y>490&&Math.abs(b.x-g.out)<28),j=w.jars.find(j=>j.color===g.color);if(near.length>=Math.min(5,bs.length)&&near.length>0&&Math.abs(j.x-g.out)<22){g.opened=true;trace.push({gate:{...g},t:w.time,jarX:j.x,ready:near.length});const save=commands;commands=[];add([[g.out,520],[g.out,575]]);save.splice(cursor,0,...commands);commands=save;}}if(cursor<commands.length){w.dig(...commands[cursor++]);for(let i=0;i<ticks;i++){step();while(w.magic.pausesWorld&&w.state==='playing')step();}}else{step();if(w.time-lastBuild>2&&passes<3&&w.balls.some(b=>b.active&&!b.held))build(false);}}
 return{events:w.events.filter(e=>e.type==='loss'),failure:w.failure,input:{delay,ticks,order},state:w.state,score:w.score,dug:w.terrain.units,stars:w.stars,loss:w.losses,completed:w.magic.completed,opened:w.treasures.map(t=>t.opened),trace};
}
module.exports=run;
