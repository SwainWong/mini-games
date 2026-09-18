/* Environmental actors share the world's ordered contact queue. */
(function(root,factory){const C=factory();if(typeof module==='object')module.exports=C;else root.SandHazards=C;})(globalThis,()=>{
  function contact(b,p,r){const ax=b.previousX??b.x,ay=b.previousY??b.y,dx=b.x-ax,dy=b.y-ay,x=ax-p.x,y=ay-p.y,c=x*x+y*y-r*r;if(c<=0)return 0;const a=dx*dx+dy*dy,d=x*dx+y*dy,disc=d*d-a*c;if(!a||disc<0)return null;const u=(-d-Math.sqrt(disc))/a;return u>=0&&u<=1?u:null;}
  function ellipseDistance(p,r){const x=Math.abs(p.x-r.x),y=Math.abs(p.y-r.y);if((x/r.rx)**2+(y/r.ry)**2<=1)return 0;const d=t=>(r.rx*Math.cos(t)-x)**2+(r.ry*Math.sin(t)-y)**2;let lo=0,hi=Math.PI/2;for(let i=0;i<45;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(d(a)<d(b))hi=b;else lo=a;}return Math.sqrt(Math.min(d(0),d(Math.PI/2),d((lo+hi)/2)));}
  class Hazards{
    constructor(world){this.w=world;world.bombs=(world.level.bombs||[]).map((b,id)=>({...b,id,pad:{...b.pad},state:'idle',age:0,radius:78}));}
    support(r,y=r.y){let n=0;for(let k=0;k<7;k++){const dx=(k-3)*r.rx*.23,x=r.x+dx,py=y+r.ry*Math.sqrt(1-(dx/r.rx)**2)+3;if(py>=675||this.w.terrain.sandSolid(x,py)||this.w.rocks.some(o=>o!==r&&!o.broken&&((x-o.x)/o.rx)**2+((py-o.y)/o.ry)**2<=1))n++;}return n;}
    bombPoint(b){const r=this.w.rocks[b.rock];return r?{x:r.x+r.rx*.45,y:r.y-r.ry*.3}:{x:b.pad.x,y:b.pad.y};}
    breakCart(j){if(!j.intact)return;j.intact=false;this.w.events.push({type:'cart-broken',x:j.x,y:590});this.w.frameFailure={kind:'crushed',x:j.x,y:590};}
    impact(r,u){const w=this.w;if(r.vy<55)return;const intersects=(x,y,pad)=>((x-r.x)/(r.rx+pad))**2+((y-r.y)/(r.ry+pad))**2<=1;
      for(const j of w.jars)if(j.intact&&Math.abs(r.x-j.x)<r.rx+46&&r.y+r.ry>=584&&r.y-r.ry<652)w.queueInteraction({u,kind:'damage',apply:()=>this.breakCart(j)});
      for(const worm of w.worms)if(worm.alive&&intersects(worm.x,worm.y,12))w.queueInteraction({u,kind:'damage',apply:()=>{if(worm.alive){worm.alive=false;w.events.push({type:'puff',x:worm.x,y:worm.y});}}});
      if(w.rival&&intersects(w.rival.x,w.rival.y,16)&&!r.hitRival){r.hitRival=true;w.queueInteraction({u,kind:'damage',apply:()=>w.rival.stun(w,4)});}
    }
    step(dt){const w=this.w;let moved=false;for(const r of w.rocks){if(r.broken)continue;const supported=this.support(r)>=2;if(supported){r.phase='stable';r.warning=0;r.vy=0;continue;}if(r.phase!=='falling'){r.phase='warning';r.warning+=dt;if(r.warning<.55)continue;r.phase='falling';}
        r.vy=Math.min(350,r.vy+420*dt);const distance=r.vy*dt,n=Math.max(1,Math.ceil(distance/2));for(let i=0;i<n;i++){const next=r.y+distance/n;if(this.support(r,next)>=2){r.vy=0;r.phase='stable';r.warning=0;break;}r.y=next;this.impact(r,(i+1)/n);moved=true;}
      }if(moved)w.terrain.rebuildRockMask(w.rocks);
      for(const b of w.bombs){const r=w.rocks[b.rock];if(b.state==='idle'&&r?.broken)b.state='disabled';if(b.state!=='burning')continue;const before=b.age;b.age+=dt;if(b.age>=3)w.queueInteraction({u:Math.max(0,(3-before)/dt),kind:'damage',apply:()=>this.explode(b)});}
    }
    touchBead(ball){const w=this.w;for(const t of w.treasures){if(t.opened)continue;const u=contact(ball,t,t.r+ball.r);if(u!==null)w.queueInteraction({u,kind:'treasure',apply:()=>{if(t.opened||!ball.active)return;t.opened=true;w.score+=t.points;w.events.push({type:'treasure',x:t.x,y:t.y,points:t.points});}});}
      for(const b of w.bombs){if(b.state!=='idle')continue;const u=contact(ball,b.pad,12+ball.r);if(u!==null)w.queueInteraction({u,kind:'trigger',apply:()=>{if(b.state==='idle'&&ball.active){b.state='burning';b.age=0;w.events.push({type:'ignite',...b.pad});}}});}
    }
    explode(b){if(b.state!=='burning')return;const w=this.w,p=this.bombPoint(b);b.state='spent';const near=(q,extra=0)=>Math.hypot(q.x-p.x,q.y-p.y)<=b.radius+extra;
      const chains=w.bombs.filter(o=>o!==b&&o.state==='burning'&&near(this.bombPoint(o)));
      for(const r of w.rocks)if(!r.broken&&ellipseDistance(p,r)<=b.radius){r.broken=true;r.phase='broken';}
      w.terrain.rebuildRockMask(w.rocks);w.terrain.dig(p.x,p.y,b.radius,'bomb');for(const worm of w.worms)if(worm.alive&&near(worm,12))worm.alive=false;
      if(w.rival&&near(w.rival,16))w.rival.stun(w,4);for(const j of w.jars)if(Math.hypot(p.x-Math.max(j.x-52,Math.min(j.x+52,p.x)),p.y-Math.max(582,Math.min(649,p.y)))<=b.radius)this.breakCart(j);
      for(const gem of w.balls)if(gem.active&&near(gem)){const dx=gem.x-p.x,dy=gem.y-p.y,d=Math.max(1,Math.hypot(dx,dy));gem.vx+=dx/d*75;gem.vy-=45;}
      w.events.push({type:'blast',...p,radius:b.radius});for(const other of chains)this.explode(other);
    }
    snapshot(){return{rocks:this.w.rocks.map(({x,y,rx,ry,phase,warning,broken})=>({x,y,rx,ry,phase,warning,broken})),bombs:this.w.bombs.map(b=>({...b,position:this.bombPoint(b)})),treasures:this.w.treasures.map(t=>({...t}))};}
  }return Hazards;
});
