// Player input traces. No world mutations, disabled hazards or synthetic scoring.
const{World}=require('../core.js'),levels=require('../levels.js'),sol=require('./solutions.cjs');
function run(id,seed,mode,delay=0,ticks=2){const w=new World(levels[id-1],{seed});let crossedClearedRock=false;const step=()=>{w.step();if(w.rocks.some(r=>r.broken&&w.balls.some(b=>b.active&&((b.x-r.x)/r.rx)**2+((b.y-r.y)/r.ry)**2<1)))crossedClearedRock=true;};const routes=structuredClone(sol[id-1]);
 if(mode==='ignite'){
  if(id===8){routes[1]=[[90,120],[90,154],[280,240],[380,320],[450,410],[435,575]];routes.reverse();}
  if(id===11)routes[1]=[[345,300],[375,335],[415,340],[375,420],[310,500],[285,575]];
  if(id===14)routes[0]=[[150,105],[150,139],[245,155],[275,230],[250,280],[145,315],[70,430],[104,575]];
  if(id===15)routes[1]=[[355,105],[355,139],[300,165],[270,245],[400,270],[490,340],[490,470],[456,575]];
 }
 for(let i=0;i<delay*120;i++)step();
 for(const path of routes){const r=path.slice().reverse();for(let i=1;i<r.length;i++)for(let k=1;k<=20;k++){const a=r[i-1],b=r[i];w.dig([a[0]+(b[0]-a[0])*(k-1)/20,a[1]+(b[1]-a[1])*(k-1)/20],[a[0]+(b[0]-a[0])*k/20,a[1]+(b[1]-a[1])*k/20]);for(let t=0;t<ticks;t++)step();}}
 for(let t=0;t<9600&&w.state==='playing';t++)step();return{w,routes,crossedClearedRock};}
module.exports=run;
