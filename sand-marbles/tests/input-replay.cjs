// A player's scripted strokes; reacts only to visible refill completion by re-opening the same paths.
// No score/actor/terrain mutation, disabled hazards, or hidden outcome selection.
module.exports=function replay(w,routes,{delay=0,ticks=2,order}={}){
  let crossedClearedRock=false,refills=0,reopen=false;
  const step=()=>{w.step();if(w.rocks.some(r=>r.broken&&w.balls.some(b=>b.active&&((b.x-r.x)/r.rx)**2+((b.y-r.y)/r.ry)**2<1)))crossedClearedRock=true;const n=w.magic.completed.filter(e=>e.kind==='refill').length;if(n>refills){refills=n;reopen=true;}};
  const commands=[];for(const path of order?order.map(i=>routes[i]):routes){const r=path.slice().reverse();for(let i=1;i<r.length;i++)for(let k=1;k<=20;k++){const a=r[i-1],b=r[i];commands.push([[a[0]+(b[0]-a[0])*(k-1)/20,a[1]+(b[1]-a[1])*(k-1)/20],[a[0]+(b[0]-a[0])*k/20,a[1]+(b[1]-a[1])*k/20]]);}}
  for(let i=0;i<delay*120;i++)step();let cursor=0,guard=0;
  while(w.state==='playing'&&guard++<30000){if(w.inputLocked){step();continue;}if(reopen){cursor=0;reopen=false;}if(cursor<commands.length){w.dig(...commands[cursor++]);for(let i=0;i<ticks;i++){step();while(w.magic.pausesWorld&&w.state==='playing')step();}}else step();}
  return{w,crossedClearedRock,refills};
};
