/* One operator routes smooth motor commands to one cart at a time. */
(function(root,factory){const C=factory();if(typeof module==='object')module.exports=C;else root.SandCrew=C;})(globalThis,()=>{
  const G=typeof module==='object'?require('./rock-geometry.js'):globalThis.SandRock;
  const GAP=104,ACCEL=96,CRUISE=48;
  const approach=(v,target,amount)=>v+Math.max(-amount,Math.min(amount,target-v));
  class Crew{
    constructor(world){
      this.w=world;
      const requested=world.level.mechanics.crewCount??(world.level.mechanics.porter?1:0),count=requested&&world.jars.length===4?4:requested,indices=world.jars.map((_,i)=>i);
      for(let i=indices.length-1;i>0;i--){const j=Math.floor(world.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
      // These are eligible motors, not multiple people. Only activeJar receives power.
      world.porters=indices.slice(0,count).map(jar=>({jar,phase:'grip',velocity:0,elapsed:0,moving:false,direction:world.random()<.5?-1:1,target:world.jars[jar].x}));
      world.operator=count?{x:448,y:725,phase:'control',age:0,flee:false,activeJar:null,signalColor:null,steering:0,speed:0,driveAge:0,pointTime:0,pointDirection:-1}:null;
      this.order=world.jars.map((_,i)=>i).sort((a,b)=>world.jars[a].x-world.jars[b].x);
      this.selectionBag=[];this.selectionDurations=[];this.controlClock=0;this.lastSelected=new Map();this.select();
    }
    planCycle(eligible){
      const w=this.w,o=w.operator,ids=eligible.map(p=>p.jar),permutations=[];
      const visit=(prefix,left)=>{if(!left.length){if(prefix.length<2||prefix[0]!==o.activeJar)permutations.push(prefix);return;}for(const id of left)visit([...prefix,id],left.filter(i=>i!==id));};visit([],ids);
      for(let i=permutations.length-1;i>0;i--){const k=Math.floor(w.random()*(i+1));[permutations[i],permutations[k]]=[permutations[k],permutations[i]];}
      let durations=ids.map(()=>3.5+w.random()*2);
      const fits=order=>{let start=this.controlClock;for(let i=0;i<order.length;i++){if(start-(this.lastSelected.get(order[i])??this.controlClock)>24.95)return false;start+=durations[i]+CRUISE/ACCEL+.03;}return true;};
      let order=permutations.find(fits);
      // Retain random order, but shorten dwell within the approved range if a
      // long previous cycle would otherwise starve an early-selected color.
      if(!order){durations=ids.map(()=>3.5);order=permutations.find(fits);}
      this.selectionBag=order||ids;this.selectionDurations=durations;
    }
    select(){const w=this.w,o=w.operator;if(!o)return;const eligible=w.porters.filter(p=>w.jars[p.jar].intact);
      for(let i=this.selectionBag.length-1;i>=0;i--)if(!eligible.some(p=>p.jar===this.selectionBag[i])){this.selectionBag.splice(i,1);this.selectionDurations.splice(i,1);}
      if(!this.selectionBag.length)this.planCycle(eligible);
      const selected=this.selectionBag.shift(),duration=this.selectionDurations.shift(),p=eligible.find(p=>p.jar===selected);if(p)this.lastSelected.set(p.jar,this.controlClock);
      for(const motor of w.porters){motor.velocity=0;motor.moving=false;motor.phase=w.jars[motor.jar].intact?'idle':'leave';}
      o.activeJar=p?.jar??null;o.signalColor=p?w.jars[p.jar].color:null;o.driveAge=0;o.switchAfter=duration??3.5;o.stalled=0;o.pointTime=p?.7:0;o.speed=0;o.steering=0;
      if(p){const j=w.jars[p.jar],{left,right}=this.bounds(p);if(j.x<=left+.5)p.direction=1;if(j.x>=right-.5)p.direction=-1;p.target=p.direction>0?right:left;o.pointDirection=j.x<o.x?-1:1;w.effects.porterTrips++;}
    }
    bounds(p){const w=this.w,j=w.jars[p.jar],reach=w.jars.length>=4?24:w.jars.length===3?38:w.level.id<=5?36:w.level.id<=8?50:65;let left=Math.max(96,j.homeX-reach),right=Math.min(496,j.homeX+reach);
      for(const r of w.rocks){const e=G.extent(r);if(!r.broken&&!r.carriers?.length&&r.y+e.y>584&&r.y-e.y<655){if(r.x<j.x)left=Math.max(left,r.x+e.x+51);else right=Math.min(right,r.x-e.x-51);}}return{left,right};}
    capacity(index,dir,visited=new Set()){
      const w=this.w,group=w.cargo.group(index),key=group.join(',');if(visited.has(key))return Infinity;visited.add(key);let room=Infinity;
      for(const i of group){const j=w.jars[i];if(!j.intact)return 0;const limits=this.bounds({jar:i});room=Math.min(room,Math.max(0,dir>0?limits.right-j.x:j.x-limits.left));const at=this.order.indexOf(i),next=this.order[at+dir];if(next!==undefined&&!group.includes(next)){const gap=w.cargo.separation(group,w.cargo.group(next),dir);room=Math.min(room,gap+this.capacity(next,dir,new Set(visited)));}}
      for(const r of w.rocks.filter(r=>!r.broken&&r.carriers?.some(i=>group.includes(i)))){const e=G.extent(r);room=Math.min(room,dir>0?559-r.x-e.x:r.x-e.x-1);for(const other of w.rocks)if(!other.broken&&!other.carriers?.length&&dir*(other.x-r.x)>0)room=Math.min(room,w.cargo.stoneGap(r,other,dir));}return Math.max(0,room);
    }
    push(index,amount,dir,visited=new Set()){
      if(amount<=0)return;const w=this.w,group=w.cargo.group(index),key=group.join(',');if(visited.has(key))return;visited.add(key);
      // Outer member contacts are processed first; internal members never push each other.
      const ordered=[...group].sort((a,b)=>dir*(w.jars[b].x-w.jars[a].x));
      for(const i of ordered){const j=w.jars[i],at=this.order.indexOf(i),next=this.order[at+dir];if(next!==undefined&&!group.includes(next)){const other=w.jars[next],gap=w.cargo.separation(group,w.cargo.group(next),dir),transfer=Math.max(0,amount-gap);if(transfer>0){this.push(next,transfer,dir,visited);if(!j.bumpTime&&!other.bumpTime)w.events.push({type:'cart-bump',x:(j.x+other.x)/2,y:621});j.bumpTime=other.bumpTime=.2;other.pushed=true;}}}
      for(const i of group)w.jars[i].x+=dir*amount;w.cargo.sync();
    }
    brake(){const w=this.w;for(const p of w.porters){p.velocity=0;p.moving=false;}if(w.operator){w.operator.speed=0;w.operator.steering=0;w.operator.signalColor=null;}}
    scare(){const w=this.w,o=w.operator;if(!o||o.phase==='gone'||o.phase==='flee')return;o.phase='scared';o.age=0;o.flee=o.flee||w.random()<.35;this.brake();w.events.push({type:'operator-scared',x:o.x,y:680});}
    step(dt){const w=this.w,o=w.operator;for(const j of w.jars){j.bumpTime=Math.max(0,(j.bumpTime||0)-dt);j.pushed=false;}if(!o)return;
      if(o.phase!=='control'){o.age+=dt;if(o.phase==='scared'&&o.age>=.9){o.phase=o.flee?'flee':'control';o.age=0;w.events.push({type:o.flee?'operator-flee':'operator-return',x:o.x,y:680});}if(o.phase==='flee'){o.x+=155*dt;if(o.x>610)o.phase='gone';}if(o.phase!=='control'){this.brake();return;}}
      this.controlClock+=dt;let p=w.porters.find(p=>p.jar===o.activeJar&&w.jars[p.jar].intact);
      if(!p){this.select();p=w.porters.find(p=>p.jar===o.activeJar);if(!p)return;}
      for(const other of w.porters)if(other!==p){other.velocity=0;other.moving=false;other.phase=w.jars[other.jar].intact?'idle':'leave';}
      const j=w.jars[p.jar],before=j.x,eligible=w.porters.filter(p=>w.jars[p.jar].intact).length;
      o.driveAge+=dt;o.pointTime=Math.max(0,o.pointTime-dt);o.pointDirection=j.x<o.x?-1:1;
      p.velocity??=0;p.elapsed+=dt;const oldV=p.velocity,switching=eligible>1&&(o.driveAge>=o.switchAfter||o.stalled>=.8);
      let room=this.capacity(p.jar,p.direction);
      if(room<.03&&Math.abs(p.velocity)<1.8&&!switching){p.direction=-p.direction;room=this.capacity(p.jar,p.direction);w.effects.porterTrips++;}
      // Braking distance is derived from speed, not a random duration. The 0.85
      // safety factor reserves a small margin for the discrete 120 Hz integrator.
      const desired=switching?0:p.direction*Math.min(CRUISE,Math.max(0,.85*Math.sqrt(2*ACCEL*room)-ACCEL*dt));
      p.velocity=approach(oldV,desired,ACCEL*dt);
      const travel=(oldV+p.velocity)*.5*dt,dir=Math.sign(travel)||p.direction,allowed=this.capacity(p.jar,dir),amount=Math.min(Math.abs(travel),allowed);
      this.push(p.jar,amount,dir);if(amount+1e-7<Math.abs(travel))p.velocity=0;
      p.moving=Math.abs(j.x-before)>1e-7;p.phase=p.moving?(p.velocity<0?'return':'walk'):'grip';p.target=p.direction>0?this.bounds(p).right:this.bounds(p).left;
      o.stalled=p.moving?0:o.stalled+dt;o.speed=(j.x-before)/dt;o.steering=Math.abs(o.speed)>.1?o.speed/CRUISE:0;o.signalColor=j.color;
      if(switching&&Math.abs(p.velocity)<.01)this.select();
    }
  }return Crew;
});
