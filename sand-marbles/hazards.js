/* Environmental actors share the world's ordered contact queue. */
(function(root,factory){const C=factory();if(typeof module==='object')module.exports=C;else root.SandHazards=C;})(globalThis,()=>{
  const G=typeof module==='object'?require('./rock-geometry.js'):globalThis.SandRock;
  function contact(b,p,r){const ax=b.previousX??b.x,ay=b.previousY??b.y,dx=b.x-ax,dy=b.y-ay,x=ax-p.x,y=ay-p.y,c=x*x+y*y-r*r;if(c<=0)return 0;const a=dx*dx+dy*dy,d=x*dx+y*dy,disc=d*d-a*c;if(!a||disc<0)return null;const u=(-d-Math.sqrt(disc))/a;return u>=0&&u<=1?u:null;}
  function ellipseDistance(p,r){const q=G.local(r,p.x,p.y),x=Math.abs(q.x),y=Math.abs(q.y);if((x/r.rx)**2+(y/r.ry)**2<=1)return 0;const d=t=>(r.rx*Math.cos(t)-x)**2+(r.ry*Math.sin(t)-y)**2;let lo=0,hi=Math.PI/2;for(let i=0;i<45;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(d(a)<d(b))hi=b;else lo=a;}return Math.sqrt(Math.min(d(0),d(Math.PI/2),d((lo+hi)/2)));}
  class Hazards{
    constructor(world){this.w=world;world.bombs=(world.level.bombs||[]).map((b,id)=>({...b,id,pad:{...b.pad},state:'idle',age:0,radius:78,fuseSeconds:b.fuseSeconds??3}));}
    supportInfo(r){const e=G.extent(r),points=[];let total=0;for(let i=-12;i<=12;i++){const dx=e.x*.9*i/12,x=r.x+dx,y=G.bottom(r,x)+3;total++;const hard=y>=675||this.w.rocks.some(o=>o!==r&&!(r.id!==undefined&&o.id===r.id)&&!o.broken&&G.contains(o,x,y));if(hard||this.w.terrain.sandSolid(x,y))points.push({x,y,hard});}const left=points[0]?.x??r.x,right=points.at(-1)?.x??r.x,coverage=points.length/total;return{points,coverage,left,right,balanced:points.length>0&&left<=r.x+2&&right>=r.x-2,strong:coverage>=.22||points.some(p=>{if(p.hard)return true;let width=2;for(const d of [-1,1])for(let step=2;step<=e.x*.5;step+=2){if(!this.w.terrain.sandSolid(p.x+d*step,p.y+2))break;width+=2;}return width>=Math.max(12,e.x*.44);})};}
    support(r,y=r.y){return this.supportInfo({...r,y}).points.length;}
    bombPoint(b){const r=this.w.rocks[b.rock];return r?G.point(r,r.rx*.45,-r.ry*.3):{x:b.pad.x,y:b.pad.y};}
    breakCart(j){if(!j.intact)return;j.intact=false;this.w.events.push({type:'cart-broken',x:j.x,y:590});this.w.frameFailure={kind:'crushed',x:j.x,y:590};}
    impact(r,u){const w=this.w;if(r.vy<55)return;const intersects=(x,y,pad)=>G.contains(r,x,y,pad),ext=G.extent(r);
      for(const j of w.jars)if(j.intact&&Math.abs(r.x-j.x)<ext.x+46&&r.y+ext.y>=584&&r.y-ext.y<652)w.queueInteraction({u,kind:'damage',apply:()=>this.breakCart(j)});
      for(const worm of w.worms)if(worm.alive&&intersects(worm.x,worm.y,12))w.queueInteraction({u,kind:'damage',apply:()=>{if(worm.alive){worm.alive=false;w.events.push({type:'puff',x:worm.x,y:worm.y});}}});
      if(w.rival&&intersects(w.rival.x,w.rival.y,16)&&!r.hitRival){r.hitRival=true;w.queueInteraction({u,kind:'damage',apply:()=>w.rival.stun(w,4)});}
    }
    step(dt){const w=this.w;let moved=false;
      for(const bag of w.droppedBags){bag.age+=dt;if(bag.age<.35)continue;bag.spill+=dt;while(bag.spill>=.12&&bag.balls.length){bag.spill-=.12;const b=bag.balls.pop(),x=bag.x+(bag.balls.length%3-1)*12,y=bag.y;w.terrain.dig(x,y,b.r+6,'rival');Object.assign(b,{x,y,previousX:x,previousY:y,active:true,held:false,stolen:false,vx:(bag.balls.length%3-1)*35,vy:20,theftImmuneUntil:w.time+3});w.losses.stolen=Math.max(0,w.losses.stolen-1);w.events.push({type:'spill',x,y,color:b.color});}}
      w.droppedBags=w.droppedBags.filter(b=>b.balls.length||b.age<2);
      for(const r of w.rocks){if(r.broken)continue;const support=this.supportInfo(r),e=G.extent(r);
        if(r.y+e.y>=675){r.y=675-e.y;r.vy=r.omega=r.vx=0;r.phase='stable';continue;}
        if(support.strong&&support.balanced){r.phase='stable';r.warning=0;r.vy=r.omega=r.vx=0;continue;}
        if(r.phase!=='falling'&&r.phase!=='tilting'){r.phase='warning';r.warning+=dt;if(r.warning<.55)continue;}
        if(support.points.length&&!support.strong){for(const p of support.points)w.terrain.dig(p.x,p.y,6,'rock');}
        if(support.strong&&!support.balanced){r.phase='tilting';const pivot=support.points.reduce((a,b)=>Math.abs(a.x-r.x)<Math.abs(b.x-r.x)?a:b),dir=r.x>=pivot.x?1:-1;r.omega=Math.max(-1.3,Math.min(1.3,r.omega+dir*2*dt));const da=r.omega*dt,dx=r.x-pivot.x,dy=r.y-pivot.y;r.x=pivot.x+dx*Math.cos(da)-dy*Math.sin(da);r.y=pivot.y+dx*Math.sin(da)+dy*Math.cos(da);r.angle+=da;r.vy=Math.max(0,Math.abs(r.omega*dx));moved=true;this.impact(r,1);}
        else{r.phase='falling';r.vy=Math.min(350,r.vy+420*dt);const distance=r.vy*dt,n=Math.max(1,Math.ceil(distance/2));for(let i=0;i<n;i++){const proposed={...r,y:r.y+distance/n},s=this.supportInfo(proposed);if(s.strong&&s.balanced){r.vy=0;r.phase='stable';r.warning=0;break;}r.y=proposed.y;r.angle+=r.omega*dt/n;r.omega*=.999;this.impact(r,(i+1)/n);moved=true;}}
        const bound=G.extent(r);r.x=Math.max(bound.x+1,Math.min(559-bound.x,r.x));if(r.y+bound.y>675){r.y=675-bound.y;r.vy=r.omega=0;r.phase='stable';}
      }if(moved)w.terrain.rebuildRockMask(w.rocks);
      for(const b of w.bombs){const r=w.rocks[b.rock];if(b.state==='idle'&&r?.broken)b.state='disabled';if(b.state!=='burning')continue;const before=b.age;b.age+=dt;if(b.age>=b.fuseSeconds)w.queueInteraction({u:Math.max(0,(b.fuseSeconds-before)/dt),kind:'damage',apply:()=>this.explode(b)});}
    }
    touchBead(ball){const w=this.w;for(const t of w.treasures){if(t.opened)continue;const u=contact(ball,t,t.r+ball.r);if(u!==null)w.queueInteraction({u,kind:'treasure',apply:()=>{if(t.opened||!ball.active)return;t.opened=true;w.score+=t.points;w.events.push({type:'treasure',x:t.x,y:t.y,points:t.points});}});}
      for(const b of w.bombs){if(b.state!=='idle')continue;const u=contact(ball,b.pad,12+ball.r);if(u!==null)w.queueInteraction({u,kind:'trigger',apply:()=>{if(b.state==='idle'&&ball.active){b.state='burning';b.age=0;w.events.push({type:'ignite',...b.pad});}}});}
    }
    explode(b){if(b.state!=='burning')return;const w=this.w,p=this.bombPoint(b);b.state='spent';const near=(q,extra=0)=>Math.hypot(q.x-p.x,q.y-p.y)<=b.radius+extra;
      const chains=w.bombs.filter(o=>o!==b&&o.state==='burning'&&near(this.bombPoint(o)));
      for(const r of w.rocks)if(!r.broken&&ellipseDistance(p,r)<=b.radius){r.broken=true;r.phase='broken';}
      w.terrain.rebuildRockMask(w.rocks);w.terrain.dig(p.x,p.y,b.radius,'bomb');for(const worm of w.worms)if(worm.alive&&near(worm,12))worm.alive=false;
      if(w.rival&&!w.rival.escaped&&Math.hypot(w.rival.x-p.x,w.rival.y-p.y)<=190){w.rival.scare(w);if(near(w.rival,16))w.rival.stun(w,.35);}w.crew.scare();for(const j of w.jars)if(Math.hypot(p.x-Math.max(j.x-52,Math.min(j.x+52,p.x)),p.y-Math.max(582,Math.min(649,p.y)))<=b.radius)this.breakCart(j);
      for(const gem of w.balls)if(gem.active&&near(gem)){const dx=gem.x-p.x,dy=gem.y-p.y,d=Math.max(1,Math.hypot(dx,dy));gem.vx+=dx/d*75;gem.vy-=45;}
      w.events.push({type:'blast',...p,radius:b.radius});for(const other of chains)this.explode(other);
    }
    snapshot(){return{rocks:this.w.rocks.map(({x,y,rx,ry,angle,omega,phase,warning,broken})=>({x,y,rx,ry,angle,omega,phase,warning,broken})),bombs:this.w.bombs.map(b=>({...b,position:this.bombPoint(b)})),treasures:this.w.treasures.map(t=>({...t}))};}
  }return Hazards;
});
