// Player input traces. No world mutations, disabled hazards or synthetic scoring.
const{World}=require('../core.js'),levels=require('../levels.js'),sol=require('./solutions.cjs');
function run(id,seed,mode,delay=0,ticks=2){const w=new World(levels[id-1],{seed});const routes=structuredClone(sol[id-1]);
 if(mode==='ignite'){
  if(id===8){routes[1]=[[90,120],[90,154],[280,240],[380,320],[450,410],[435,575]];routes.reverse();}
  if(id===11)routes[1]=[[345,300],[375,335],[415,340],[375,420],[310,500],[285,575]];
  if(id===14){routes[0]=[[150,105],[150,139],[245,155],[275,230],[250,280],[145,315],[70,430],[104,575]];
   // Prepare the other catch channels before releasing the upstream bomb group.
   routes.push(routes.shift());}
  if(id===15)routes[1]=[[355,105],[355,139],[300,165],[270,245],[400,270],[490,340],[490,470],[456,575]];
 }
 const result=require('./input-replay.cjs')(w,routes,{delay,ticks});return{...result,routes};}
module.exports=run;
