// Actual player strokes with visible bead groups reconnected after a refill.
const {World}=require('../core.js'),levels=require('../levels.js'),solutions=require('./solutions.cjs');
module.exports=function replay(seed,{reverse=false,split=false,blueOutlet=120,ticks=2}={}){
 const w=new World(levels[7],{seed});let commands=[],cursor=0,refills=0,reopen=false;
 function add(path){const p=path.slice().reverse();for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/12));for(let k=1;k<=n;k++)commands.push([[a[0]+(b[0]-a[0])*(k-1)/n,a[1]+(b[1]-a[1])*(k-1)/n],[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]]);}}
 function build(first){commands=[];cursor=0;if(first){const base=structuredClone(solutions[7]);base[1]=[[90,120],[90,154],[250,180],[465,230],[505,350],[450,410],[435,575]];if(reverse)base.reverse();base.forEach(add);return;}
 const amber=split?['amber-high','amber-low']:['amber'],labels=reverse?[...amber,'blue']:['blue',...amber];
 for(const label of labels){const color=label.split('-')[0],bs=w.balls.filter(b=>b.active&&!b.held&&b.color===color&&(!split||color==='blue'||(label==='amber-high'?b.y<300:b.y>=300)));if(!bs.length)continue;
 const x=bs.reduce((sum,b)=>sum+b.x,0)/bs.length,y=Math.max(...bs.map(b=>b.y)),jar=w.jars.find(j=>j.color===color),end=split&&color==='blue'?blueOutlet:jar.homeX,p=[[x,y]];
 if(color==='blue'){if(!w.treasures[0].opened&&y<470)p.push([185,460]);p.push([end,Math.min(550,y+90)],[end,575]);}
 else{if(y<180)p.push([250,180],[465,230],[505,350]);else if(y<350&&x<440)p.push([465,Math.max(230,y+20)],[505,350]);if(!w.treasures[1].opened&&y<430)p.push([450,410]);p.push([end,Math.max(490,Math.min(550,y+80))],[end,575]);}
 add(p);for(const b of bs)add([[b.x,b.y],[x,y]]);
 }}
 function step(){w.step();const n=w.magic.completed.filter(e=>e.kind==='refill').length;if(n>refills){refills=n;reopen=true;}}
 build(true);for(let guard=0;guard<30000&&w.state==='playing';guard++){if(w.inputLocked){step();continue;}if(reopen){build(false);reopen=false;}if(cursor<commands.length){w.dig(...commands[cursor++]);for(let k=0;k<ticks;k++){step();while(w.magic.pausesWorld&&w.state==='playing')step();}}else step();}return w;
};
