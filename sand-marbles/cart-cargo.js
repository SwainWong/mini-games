/* Cargo ownership, capacities and common motion for carts sharing a boulder. */
(function(root,factory){const C=factory();if(typeof module==='object')module.exports=C;else root.SandCargo=C;})(globalThis,()=>{
  const G=typeof module==='object'?require('./rock-geometry.js'):globalThis.SandRock;
  class Cargo{
    constructor(world){this.w=world;for(const j of world.jars)j.capacity=world.level.groups.filter(g=>g.color===j.color).reduce((n,g)=>n+g.count,0)+2;}
    stones(index){return this.w.rocks.filter(r=>!r.broken&&!r.pendingCargo&&r.carriers?.includes(index));}
    rockLoad(j){const index=this.w.jars.indexOf(j);return Math.min(j.capacity,this.stones(index).reduce((sum,r)=>sum+(r.slotLoads?.[index]||0),0));}
    freeSlots(j){return Math.max(0,j.capacity-j.balls.length-this.rockLoad(j));}
    group(index){const group=new Set([index]);let changed=true;while(changed){changed=false;for(const r of this.w.rocks)if(!r.broken&&!r.pendingCargo&&r.carriers?.some(i=>group.has(i)))for(const i of r.carriers)if(!group.has(i)){group.add(i);changed=true;}}return [...group].sort((a,b)=>a-b);}
    sync(){let moved=false;for(const r of this.w.rocks)if(!r.broken&&r.carriers?.length){const x=this.w.jars[r.carriers[0]].x+r.cartOffset;if(Math.abs(x-r.x)>1e-9)moved=true;r.x=x;}if(moved)this.w.terrain.rebuildRockMask(this.w.rocks);}
    side(r,y,dir){const c=Math.cos(r.angle||0),s=Math.sin(r.angle||0),v=r.rx*r.rx*s*s+r.ry*r.ry*c*c,cov=(r.rx*r.rx-r.ry*r.ry)*s*c,d=y-r.y;return r.x+cov*d/v+dir*Math.sqrt(Math.max(0,r.rx*r.rx*r.ry*r.ry/v*(1-d*d/v)));}
    railEdge(r,dir){const e=G.extent(r),lo=Math.max(582,r.y-e.y),hi=Math.min(655,r.y+e.y);if(hi<lo)return null;const cov=(r.rx*r.rx-r.ry*r.ry)*Math.sin(r.angle||0)*Math.cos(r.angle||0),peak=r.y+dir*cov/e.x;return this.side(r,Math.max(lo,Math.min(hi,peak)),dir);}
    stoneGap(a,b,dir){const ea=G.extent(a),eb=G.extent(b);let lo=Math.max(a.y-ea.y,b.y-eb.y),hi=Math.min(a.y+ea.y,b.y+eb.y);if(hi-lo<1e-7)return Infinity;const distance=y=>dir*(this.side(b,y,-dir)-this.side(a,y,dir));const ends=Math.min(distance(lo),distance(hi));for(let i=0;i<28;i++){const p=lo+(hi-lo)/3,q=hi-(hi-lo)/3;if(distance(p)<distance(q))hi=q;else lo=p;}return Math.min(ends,distance((lo+hi)/2));}
    separation(a,b,dir){const w=this.w,ra=w.rocks.filter(r=>!r.broken&&r.carriers?.some(i=>a.includes(i))),rb=w.rocks.filter(r=>!r.broken&&r.carriers?.some(i=>b.includes(i)));let gap=Infinity;
      for(const i of a)for(const k of b)gap=Math.min(gap,dir*(w.jars[k].x-w.jars[i].x)-104);
      for(const r of ra){const edge=this.railEdge(r,dir);if(edge!==null)for(const i of b)gap=Math.min(gap,dir*(w.jars[i].x-dir*51-edge));}
      for(const r of rb){const edge=this.railEdge(r,-dir);if(edge!==null)for(const i of a)gap=Math.min(gap,dir*(edge-w.jars[i].x-dir*51));}
      for(const r of ra)for(const s of rb)gap=Math.min(gap,this.stoneGap(r,s,dir));return Math.max(0,gap);
    }
    store(j,b){const n=j.balls.length;b.cargoX=(n%6-2.5)*12+(Math.floor(n/6)%2)*3;b.cargoY=-2-Math.floor(n/6)*9;b.caughtAt=this.w.time;j.balls.push(b);}
    bounce(j,b,contact){const dir=Math.sign(contact.x-contact.mouthX)||Math.sign(b.vx)||1;b.x=contact.x;b.y=contact.y-b.r-1;b.vx=dir*65;b.vy=-110;b.cartBounceUntil=this.w.time+.2;this.w.events.push({type:'cart-full',x:b.x,y:b.y,color:b.color});}
    // Maximum lower ellipse point over the actual opening, not the bounding box.
    bottomOver(r,j){const e=G.extent(r),lo=Math.max(r.x-e.x,j.x-46),hi=Math.min(r.x+e.x,j.x+46);if(hi-lo<=1e-7)return null;const c=Math.cos(r.angle||0),s=Math.sin(r.angle||0),peak=r.x+(r.rx*r.rx-r.ry*r.ry)*s*c/e.y;return G.bottom(r,Math.max(lo,Math.min(hi,peak)));}
    land(r,before,u0=0,u1=1){if(r.broken||r.carriers?.length)return false;let first=null;
      const pose=t=>({...r,x:before.x+(r.x-before.x)*t,y:before.y+(r.y-before.y)*t,angle:before.angle+(r.angle-before.angle)*t});
      for(let i=0;i<this.w.jars.length;i++){const j=this.w.jars[i];if(!j.intact)continue;const y=590-j.lift,a=this.bottomOver(before,j),b=this.bottomOver(r,j);if(b===null||b<y||a!==null&&a>y+1e-6)continue;let lo=0,hi=1;for(let k=0;k<30;k++){const mid=(lo+hi)/2,v=this.bottomOver(pose(mid),j);if(v!==null&&v>=y)hi=mid;else lo=mid;}if(!first||hi<first.t-1e-8||Math.abs(hi-first.t)<1e-8&&j.x<this.w.jars[first.index].x)first={t:hi,index:i};}
      if(!first)return false;const p=pose(first.t);r.x=p.x;r.y=p.y;r.angle=p.angle;const e=G.extent(r),owners=this.w.jars.map((j,i)=>({j,i})).filter(({j})=>j.intact&&Math.min(j.x+46,r.x+e.x)-Math.max(j.x-46,r.x-e.x)>1e-7).sort((a,b)=>a.j.x-b.j.x);
      // Keep spatial order for stable grouping; primary is separately recorded.
      r.carriers=owners.map(o=>o.i);r.primaryCarrier=first.index;r.cartOffset=r.x-this.w.jars[r.carriers[0]].x;r.slotLoads={};
      for(const {j,i} of owners){const overlap=Math.min(j.x+46,r.x+e.x)-Math.max(j.x-46,r.x-e.x);r.slotLoads[i]=Math.min(j.capacity,Math.ceil(r.rx*r.ry*(overlap/(2*e.x))/64));}
      r.phase='cargo';r.vy=r.vx=r.omega=0;r.warning=0;r.pendingCargo=true;const contactU=u0+(u1-u0)*first.t;r.pendingLanding={start:r.frameStartPose||before,stop:p,u:Math.max(1e-9,contactU)};this.w.queueInteraction({u:contactU,kind:'damage',apply:()=>{r.pendingCargo=false;delete r.pendingLanding;if(!r.broken)this.w.events.push({type:'rock-loaded',x:r.x,y:r.y,carriers:[...r.carriers]});}});return true;
    }
    finishAt(u){let changed=false;for(const r of this.w.rocks)if(r.pendingCargo){const pending=r.pendingLanding,t=Math.max(0,Math.min(1,u/pending.u));for(const key of ['x','y','angle'])r[key]=pending.start[key]+(pending.stop[key]-pending.start[key])*t;r.phase=r.broken?'broken':'falling';r.pendingCargo=false;delete r.pendingLanding;delete r.carriers;delete r.slotLoads;delete r.primaryCarrier;delete r.cartOffset;changed=true;}if(changed)this.w.terrain.rebuildRockMask(this.w.rocks);}
    availablePotential(beads){let sum=0;const canBreak=this.w.bombs.some(b=>b.state==='burning'||b.state==='idle'&&beads.length);
      for(const color of new Set(beads.map(b=>b.color))){const jars=this.w.jars.filter(j=>j.intact&&j.color===color),slots=jars.reduce((n,j)=>n+(canBreak?Math.max(0,j.capacity-j.balls.length):this.freeSlots(j)),0);sum+=beads.filter(b=>b.color===color).map(b=>b.value??10).sort((a,b)=>b-a).slice(0,slots).reduce((a,b)=>a+b,0);}return sum;
    }
  }return Cargo;
});
