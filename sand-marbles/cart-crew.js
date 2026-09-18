(function(root,factory){const C=factory();if(typeof module==='object')module.exports=C;else root.SandCrew=C;})(globalThis,()=>{
  class Crew{
    constructor(world){this.w=world;const count=world.level.mechanics.crewCount??(world.level.mechanics.porter?1:0),indices=world.jars.map((_,i)=>i);for(let i=indices.length-1;i>0;i--){const j=Math.floor(world.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}world.porters=indices.slice(0,count).map(jar=>({jar,phase:'grip',elapsed:0,duration:.5,moving:false,direction:world.random()<.5?-1:1,target:world.jars[jar].x}));this.order=world.jars.map((_,i)=>i).sort((a,b)=>world.jars[a].x-world.jars[b].x);}
    bounds(p){const w=this.w,at=this.order.indexOf(p.jar),j=w.jars[p.jar];const reach=w.level.id<=5?36:w.level.id<=8?50:65;let left=at?w.jars[this.order[at-1]].x+104:96,right=at<this.order.length-1?w.jars[this.order[at+1]].x-104:496;
      left=Math.max(left,j.homeX-reach);right=Math.min(right,j.homeX+reach);
      for(const r of w.rocks)if(!r.broken&&r.y+r.ry>584&&r.y-r.ry<655){if(r.x<j.x)left=Math.max(left,r.x+r.rx+51);else right=Math.min(right,r.x-r.rx-51);}return{left,right};}
    step(dt){const w=this.w;for(const p of w.porters){const j=w.jars[p.jar];p.elapsed+=dt;if(!j.intact){p.phase='leave';p.leaveAge=(p.leaveAge||0)+dt;p.moving=false;continue;}const {left,right}=this.bounds(p);
        if(p.moving){const from=j.x,speed=34+28*Math.sin(Math.min(1,p.elapsed/p.duration)*Math.PI),step=p.direction*speed*dt;j.x=Math.max(Math.min(from,left),Math.min(Math.max(from,right),from+step));if(left>right)j.x=from;
          if(Math.abs(j.x-from)<.001||p.elapsed>=p.duration||(p.direction>0?j.x>=p.target:j.x<=p.target)){p.moving=false;p.elapsed=0;p.duration=.55+w.random()*1.1;p.phase=['rest','wipe','think'][Math.floor(w.random()*3)];if(Math.abs(j.x-from)<.001)p.direction=-p.direction;w.events.push({type:'rest'});}
        }else if(p.elapsed>=p.duration){p.direction=w.random()<.3?-p.direction:p.direction;if(j.x<=left+2)p.direction=1;if(j.x>=right-2)p.direction=-1;p.target=Math.max(left,Math.min(right,j.x+p.direction*(15+w.random()*65)));p.duration=.65+w.random()*.8;p.elapsed=0;p.moving=true;p.phase=p.direction>0?'walk':'return';w.effects.porterTrips++;w.events.push({type:'shuffle'});}
      }}
  }return Crew;
});
