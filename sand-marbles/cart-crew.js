/* One operator routes smooth motor commands to one cart at a time. */
(function(root,factory){const C=factory();if(typeof module==='object')module.exports=C;else root.SandCrew=C;})(globalThis,()=>{
  const G=typeof module==='object'?require('./rock-geometry.js'):globalThis.SandRock;
  const GAP=104,ACCEL=96,CRUISE=48;
  const approach=(v,target,amount)=>v+Math.max(-amount,Math.min(amount,target-v));
  class Crew{
    constructor(world){
      this.w=world;
      const count=world.level.mechanics.crewCount??(world.level.mechanics.porter?1:0),indices=world.jars.map((_,i)=>i);
      for(let i=indices.length-1;i>0;i--){const j=Math.floor(world.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
      // These are eligible motors, not multiple people. Only activeJar receives power.
      world.porters=indices.slice(0,count).map(jar=>({jar,phase:'grip',velocity:0,elapsed:0,moving:false,direction:world.random()<.5?-1:1,target:world.jars[jar].x}));
      world.operator=count?{x:448,y:725,phase:'control',age:0,flee:false,activeJar:null,signalColor:null,steering:0,speed:0,driveAge:0,pointTime:0,pointDirection:-1}:null;
      this.order=world.jars.map((_,i)=>i).sort((a,b)=>world.jars[a].x-world.jars[b].x);
      this.select();
    }
    select(){const w=this.w,o=w.operator;if(!o)return;const eligible=w.porters.filter(p=>w.jars[p.jar].intact),previous=eligible.findIndex(p=>p.jar===o.activeJar),p=eligible[(previous+1)%eligible.length];
      for(const motor of w.porters){motor.velocity=0;motor.moving=false;motor.phase=w.jars[motor.jar].intact?'idle':'leave';}
      o.activeJar=p?.jar??null;o.signalColor=p?w.jars[p.jar].color:null;o.driveAge=0;o.switchAfter=4.5+w.random()*2.5;o.pointTime=p?.7:0;o.speed=0;o.steering=0;
      if(p){const j=w.jars[p.jar],{left,right}=this.bounds(p);if(j.x<=left+.5)p.direction=1;if(j.x>=right-.5)p.direction=-1;p.target=p.direction>0?right:left;o.pointDirection=j.x<o.x?-1:1;w.effects.porterTrips++;}
    }
    bounds(p){const w=this.w,j=w.jars[p.jar],reach=w.jars.length>=4?24:w.jars.length===3?38:w.level.id<=5?36:w.level.id<=8?50:65;let left=Math.max(96,j.homeX-reach),right=Math.min(496,j.homeX+reach);
      for(const r of w.rocks){const e=G.extent(r);if(!r.broken&&r.y+e.y>584&&r.y-e.y<655){if(r.x<j.x)left=Math.max(left,r.x+e.x+51);else right=Math.min(right,r.x-e.x-51);}}return{left,right};}
    capacity(index,dir){const w=this.w,j=w.jars[index];if(!j.intact)return 0;const limits=this.bounds({jar:index});let room=Math.max(0,dir>0?limits.right-j.x:j.x-limits.left),at=this.order.indexOf(index),next=this.order[at+dir];if(next!==undefined){const gap=Math.max(0,(w.jars[next].x-j.x)*dir-GAP);room=Math.min(room,gap+this.capacity(next,dir));}return room;}
    push(index,amount,dir){if(amount<=0)return;const w=this.w,j=w.jars[index],at=this.order.indexOf(index),next=this.order[at+dir];if(next!==undefined){const other=w.jars[next],gap=Math.max(0,(other.x-j.x)*dir-GAP),transfer=Math.max(0,amount-gap);if(transfer>0){this.push(next,transfer,dir);if(!j.bumpTime&&!other.bumpTime)w.events.push({type:'cart-bump',x:(j.x+other.x)/2,y:621});j.bumpTime=other.bumpTime=.2;other.pushed=true;}}j.x+=dir*amount;}
    brake(){const w=this.w;for(const p of w.porters){p.velocity=0;p.moving=false;}if(w.operator){w.operator.speed=0;w.operator.steering=0;w.operator.signalColor=null;}}
    scare(){const w=this.w,o=w.operator;if(!o||o.phase==='gone'||o.phase==='flee')return;o.phase='scared';o.age=0;o.flee=o.flee||w.random()<.35;this.brake();w.events.push({type:'operator-scared',x:o.x,y:680});}
    step(dt){const w=this.w,o=w.operator;for(const j of w.jars){j.bumpTime=Math.max(0,(j.bumpTime||0)-dt);j.pushed=false;}if(!o)return;
      if(o.phase!=='control'){o.age+=dt;if(o.phase==='scared'&&o.age>=.9){o.phase=o.flee?'flee':'control';o.age=0;w.events.push({type:o.flee?'operator-flee':'operator-return',x:o.x,y:680});}if(o.phase==='flee'){o.x+=155*dt;if(o.x>610)o.phase='gone';}if(o.phase!=='control'){this.brake();return;}}
      let p=w.porters.find(p=>p.jar===o.activeJar&&w.jars[p.jar].intact);
      if(!p){this.select();p=w.porters.find(p=>p.jar===o.activeJar);if(!p)return;}
      for(const other of w.porters)if(other!==p){other.velocity=0;other.moving=false;other.phase=w.jars[other.jar].intact?'idle':'leave';}
      const j=w.jars[p.jar],before=j.x,eligible=w.porters.filter(p=>w.jars[p.jar].intact).length;
      o.driveAge+=dt;o.pointTime=Math.max(0,o.pointTime-dt);o.pointDirection=j.x<o.x?-1:1;
      p.velocity??=0;p.elapsed+=dt;const oldV=p.velocity,switching=eligible>1&&o.driveAge>=o.switchAfter;
      let room=this.capacity(p.jar,p.direction);
      if(room<.03&&Math.abs(p.velocity)<1.8&&!switching){p.direction=-p.direction;room=this.capacity(p.jar,p.direction);w.effects.porterTrips++;}
      // Braking distance is derived from speed, not a random duration. The 0.85
      // safety factor reserves a small margin for the discrete 120 Hz integrator.
      const desired=switching?0:p.direction*Math.min(CRUISE,Math.max(0,.85*Math.sqrt(2*ACCEL*room)-ACCEL*dt));
      p.velocity=approach(oldV,desired,ACCEL*dt);
      const travel=(oldV+p.velocity)*.5*dt,dir=Math.sign(travel)||p.direction,allowed=this.capacity(p.jar,dir),amount=Math.min(Math.abs(travel),allowed);
      this.push(p.jar,amount,dir);if(amount+1e-7<Math.abs(travel))p.velocity=0;
      p.moving=Math.abs(j.x-before)>1e-7;p.phase=p.moving?(p.velocity<0?'return':'walk'):'grip';p.target=p.direction>0?this.bounds(p).right:this.bounds(p).left;
      o.speed=(j.x-before)/dt;o.steering=Math.abs(o.speed)>.1?o.speed/CRUISE:0;o.signalColor=j.color;
      if(switching&&Math.abs(p.velocity)<.01)this.select();
    }
  }return Crew;
});
