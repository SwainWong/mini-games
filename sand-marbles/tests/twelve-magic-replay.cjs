// Only normal World construction, dig and step. No cloned/tweaked map or actors.
const {World}=require('../core.js'), levels=require('../levels.js'), routes=require('./twelve-routes.cjs');
module.exports = function replay({seed=1,ticks=2,open=false}={}) {
  const w=new World(levels[11],{seed});
  let commands=[],cursor=0,refills=0,rebuild=false;
  const add=path=>{
    const p=path.slice().reverse();
    for(let i=1;i<p.length;i++) {
      const a=p[i-1],b=p[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8));
      for(let k=1;k<=n;k++) commands.push([
        [a[0]+(b[0]-a[0])*(k-1)/n,a[1]+(b[1]-a[1])*(k-1)/n],
        [a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]
      ]);
    }
  };
  const build=first=>{
    commands=[];cursor=0;
    const initial=routes.initial(open);
    (first ? routes.order.map(i=>initial[i]) : routes.recovery(w,open)).forEach(add);
  };
  const step=()=>{
    w.step();
    const n=w.magic.completed.filter(e=>e.kind==='refill').length;
    if(n>refills){refills=n;rebuild=true;}
  };
  build(true);
  for(let guard=0;w.state==='playing'&&guard<30000;guard++) {
    if(w.inputLocked){step();continue;}
    if(rebuild){build(false);rebuild=false;}
    if(cursor<commands.length) {
      w.dig(...commands[cursor++]);
      for(let i=0;i<ticks;i++){step();while(w.magic.pausesWorld&&w.state==='playing')step();}
    }else step();
  }
  return w;
};
