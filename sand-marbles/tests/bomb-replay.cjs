// Player input traces. No world mutations, disabled hazards or synthetic scoring.
const{World}=require('../core.js'),levels=require('../levels.js'),sol=require('./solutions.cjs');
function run(id,seed,mode,delay=0,ticks=2){const w=new World(levels[id-1],{seed}),routes=structuredClone(sol[id-1]);
 if(mode==='avoid'){ /* default routes now leave deliberate space around optional pads */
  
  if(id===15){routes[3]=[[115,335],[115,369],[110,425],[155,490],[200,545],[221,575]];routes[4]=[[425,455],[425,489],[350,510],[338,575]];routes[5]=[[385,310],[385,344],[335,395],[350,475],[338,575]];}
 }else{
  if(id===8){routes[0]=[[260,380],[260,414],[300,455],[280,495],[185,520],[120,575]];routes.reverse();}
  if(id===11)routes[1]=[[345,300],[345,334],[275,385],[295,505],[285,575]];
  if(id===15)routes[4]=[[425,455],[425,489],[420,535],[338,575]];
  if(id===14){routes[4]=[[380,335],[380,369],[455,430],[420,490],[338,575]];routes.unshift(routes.pop());}
 }
 for(let i=0;i<delay*120;i++)w.step();
 for(const path of routes){const r=path.slice().reverse();for(let i=1;i<r.length;i++)for(let k=1;k<=20;k++){const a=r[i-1],b=r[i];w.dig([a[0]+(b[0]-a[0])*(k-1)/20,a[1]+(b[1]-a[1])*(k-1)/20],[a[0]+(b[0]-a[0])*k/20,a[1]+(b[1]-a[1])*k/20]);for(let t=0;t<ticks;t++)w.step();}}
 for(let t=0;t<2400&&w.state==='playing';t++)w.step();return{w,routes};}
module.exports=run;
