// A player's scripted strokes; only observable refill completion rebuilds the route list.
// No score/actor/terrain mutation, disabled hazards, or hidden outcome selection.
module.exports=function replay(w,routes,{delay=0,ticks=2,order,recoveryOrder,skipSettledColors=false}={}){
  let crossedClearedRock=false,refills=0,reopen=false,commands=[],cursor=0;
  const colors=routes.map(path=>w.level.groups.reduce((a,b)=>Math.hypot(a.x-path[0][0],a.y-path[0][1])<Math.hypot(b.x-path[0][0],b.y-path[0][1])?a:b).color);
  const build=recovery=>{commands=[];cursor=0;for(const index of (recovery&&recoveryOrder)||order||routes.map((_,i)=>i)){
    if(recovery&&skipSettledColors&&!w.balls.some(b=>b.active&&b.color===colors[index]))continue;
    const r=routes[index].slice().reverse();for(let i=1;i<r.length;i++)for(let k=1;k<=20;k++){const a=r[i-1],b=r[i];commands.push([[a[0]+(b[0]-a[0])*(k-1)/20,a[1]+(b[1]-a[1])*(k-1)/20],[a[0]+(b[0]-a[0])*k/20,a[1]+(b[1]-a[1])*k/20]]);}
  }};
  const step=()=>{w.step();if(w.rocks.some(r=>r.broken&&w.balls.some(b=>b.active&&((b.x-r.x)/r.rx)**2+((b.y-r.y)/r.ry)**2<1)))crossedClearedRock=true;const n=w.magic.completed.filter(e=>e.kind==='refill').length;if(n>refills){refills=n;reopen=true;}};
  build(false);for(let i=0;i<delay*120;i++)step();let guard=0;
  while(w.state==='playing'&&guard++<30000){if(w.inputLocked){step();continue;}if(reopen){build(true);reopen=false;}if(cursor<commands.length){w.dig(...commands[cursor++]);for(let i=0;i<ticks;i++){step();while(w.magic.pausesWorld&&w.state==='playing')step();}}else step();}
  return{w,crossedClearedRock,refills};
};
