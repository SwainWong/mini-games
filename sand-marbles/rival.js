/* A visible pursuer. Sand is diggable; rocks are never passable. No time-based loss. */
(function(root,factory){const Rival=factory();if(typeof module==='object')module.exports=Rival;else root.SandRival=Rival;})(globalThis,()=>{
  const A=typeof module==='object'?require('./rival-animation.js'):globalThis.SandRivalAnimation;
  const G=typeof module==='object'?require('./rock-geometry.js'):globalThis.SandRock;
  const SIZE=16,COLS=35,ROWS=35,RADIUS=10;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  class Rival{
    constructor(level,balls){
      this.targetCooldown=new WeakMap();this.noProgress=0;this.recoveries=0;this.patrolPoint=null;this.fleeing=false;this.escaped=false;this.fearAge=0;this.dropBag=false;this.bag=[];this.torn=false;this.movingSeconds=0;this.spillSeconds=0;this.pickup=null;this.digContact=false;this.digCycle=0;this.rocks=level.rocks;this.stamina=100;this.resting=false;this.restAge=0;this.stunTime=0;this.hearingCooldown=0;this.listenTime=0;this.sprint=0;this.bagTime=0;this.speed=level.mechanics.rival.speed;this.age=0;this.phase='watching';this.danger='distant';this.distance=null;this.target=null;this.path=[];this.repath=0;this.fx=1;this.fy=0;this.removed=0;this.captured=null;
      const starts=[{x:48,y:76},{x:512,y:76}].filter(p=>this.clear(p.x,p.y));
      const initial=balls.filter(b=>b.active);starts.sort((a,b)=>Math.min(...initial.map(p=>distance(b,p)))-Math.min(...initial.map(p=>distance(a,p))));
      const start=starts[0]||{x:28,y:76};this.x=start.x;this.y=start.y;this.fx=start.x>280?-1:1;
      this.blocked=Array.from({length:COLS*ROWS},(_,i)=>!this.clear((i%COLS+.5)*SIZE,(Math.floor(i/COLS)+.5)*SIZE));
    }
    clear(x,y){return x>=42&&x<=518&&y>=58&&y<=548&&this.rocks.filter(r=>!r.broken).every(r=>!G.contains(r,x,y,RADIUS+3));}
    lineClear(a,b){const n=Math.ceil(distance(a,b)/4);for(let k=1;k<=n;k++)if(!this.clear(a.x+(b.x-a.x)*k/n,a.y+(b.y-a.y)*k/n))return false;return true;}
    canReach(from,ball){
      if(distance(from,ball)>=ball.r+18)return false;
      const n=Math.max(1,Math.ceil(distance(from,ball)/3));for(let i=1;i<=n;i++){const x=from.x+(ball.x-from.x)*i/n,y=from.y+(ball.y-from.y)*i/n;if(this.rocks.filter(r=>!r.broken).some(r=>G.contains(r,x,y)))return false;}return true;
    }
    contactStance(ball){
      const choices=[];
      for(const contactFrame of A.contactFrames)for(const dir of [this.fx<0?-1:1,this.fx<0?1:-1]){
        const palm=A.local(A.pickup[contactFrame]),p={x:ball.x-dir*palm.x,y:ball.y-palm.y,dir,contactFrame};
        if(!this.clear(p.x,p.y)||!this.lineClear(this,p)||!this.canReach(p,ball))continue;
        // A reachable stance is insufficient if the real bead cannot travel along the complete hand sequence.
        const actor={...p,fx:dir},points=[{x:ball.x,y:ball.y},...A.carryFrames(contactFrame).map(f=>A.point(actor,A.pickup[f]))];
        let blocked=false;for(let i=1;i<points.length&&!blocked;i++){const from=points[i-1],to=points[i],n=Math.max(1,Math.ceil(distance(from,to)/2));for(let k=0;k<=n;k++)if(this.rocks.some(r=>!r.broken&&G.contains(r,from.x+(to.x-from.x)*k/n,from.y+(to.y-from.y)*k/n,ball.r))){blocked=true;break;}}
        if(!blocked)choices.push(p);
      }
      choices.sort((a,b)=>distance(this,a)-distance(this,b));return choices[0]||null;
    }
    alignPickup(world,ball,stance,dt){
      const d=distance(this,stance),speed=Math.min(80,this.speed*1.65*(.8+.3*this.stamina/100)*this.loadFactor),amount=Math.min(d,speed*dt);
      this.phase='running';this.fx=stance.dir;this.fy=0;
      if(d>.6){if(amount>0){this.x+=(stance.x-this.x)/d*amount;this.y+=(stance.y-this.y)/d*amount;this.stamina=Math.max(0,this.stamina-dt*6*(1+this.bag.length*.06));this.moveBag(world,dt,amount);}return false;}
      this.pickup={ball,age:0,start:{x:ball.x,y:ball.y},contactFrame:stance.contactFrame};this.phase='reach';return true;
    }
    route(target){
      const end={x:Math.max(42,Math.min(518,target.x)),y:Math.max(58,Math.min(548,target.y))};
      const bead=Number.isFinite(target.r),usable=p=>!bead||this.canReach(p,target);
      if(this.clear(end.x,end.y)&&usable(end)&&this.lineClear(this,end))return[end];
      const point=i=>({x:(i%COLS+.5)*SIZE,y:(Math.floor(i/COLS)+.5)*SIZE});
      // A virtual source connects the actual actor to visible grid nodes. Starting
      // at its cell center without this edge check can point straight into rock.
      const open=[],came=new Map(),cost=new Map(),goals=new Map(),closed=new Set();
      for(let i=0;i<this.blocked.length;i++){
        if(this.blocked[i])continue;const q=point(i);
        if(distance(this,q)<=SIZE*3&&this.lineClear(this,q)){open.push(i);cost.set(i,distance(this,q));came.set(i,null);}
        if(distance(q,end)<=SIZE*3){
          if(this.clear(end.x,end.y)&&usable(end)&&this.lineClear(q,end))goals.set(i,end);
          else if(bead&&this.canReach(q,target))goals.set(i,q);
        }
      }
      if(!open.length||!goals.size)return[];
      const heuristic=i=>Math.max(0,distance(point(i),end)-(bead?target.r+18:0));
      while(open.length){let at=0;for(let i=1;i<open.length;i++)if(cost.get(open[i])+heuristic(open[i])<cost.get(open[at])+heuristic(open[at]))at=i;
        const current=open.splice(at,1)[0];if(goals.has(current)){const out=[];let n=current;while(n!==null){out.unshift(point(n));n=came.get(n);}const last=goals.get(current);if(distance(out.at(-1),last)>.01)out.push(last);return out;}
        closed.add(current);const x=current%COLS,y=Math.floor(current/COLS);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if((!dx&&!dy)||x+dx<0||x+dx>=COLS||y+dy<0||y+dy>=ROWS)continue;const next=(y+dy)*COLS+x+dx;if(this.blocked[next]||closed.has(next)||!this.lineClear(point(current),point(next)))continue;const value=cost.get(current)+Math.hypot(dx,dy)*SIZE;if(value>=(cost.get(next)??Infinity))continue;cost.set(next,value);came.set(next,current);if(!open.includes(next))open.push(next);}
      }
      return[];
    }
    avoidTarget(ball,seconds=2){if(ball&&!ball.patrol)this.targetCooldown.set(ball,this.age+seconds);this.target=null;this.path=[];this.repath=0;this.noProgress=0;this.recoveries++;}
    patrol(){
      if(this.patrolPoint&&distance(this,this.patrolPoint)>28){const path=this.route(this.patrolPoint);if(path.length)return path;}
      for(const p of [{x:this.x<280?440:120,y:this.y},{x:this.x,y:this.y<280?440:120},{x:280,y:100},{x:280,y:500}]){if(!this.clear(p.x,p.y)||distance(this,p)<30)continue;const target={...p,r:8,active:true,patrol:true,vx:0,vy:0},path=this.route(target);if(path.length){this.patrolPoint=target;return path;}}
      return[];
    }
    watchProgress(previous,dt){
      if(distance(previous,this)>.001){this.noProgress=0;return;}
      this.noProgress+=dt;if(this.noProgress>=1.5)this.avoidTarget(this.target);
      else if(this.noProgress>=.75)this.repath=0;
    }
    get loadFactor(){return Math.max(.38,1/(1+this.bag.length*.10));}
    refreshObstacles(){this.blocked=Array.from({length:COLS*ROWS},(_,i)=>!this.clear((i%COLS+.5)*SIZE,(Math.floor(i/COLS)+.5)*SIZE));}
    stun(world,seconds=4){this.releaseHeld(world);this.pickup=null;this.stunTime=Math.max(this.stunTime,seconds);this.phase='stun';this.path=[];this.repath=0;this.listenTime=0;this.sprint=0;this.refreshObstacles();if(!this.clear(this.x,this.y)){let best=null,d=Infinity;for(let y=64;y<549;y+=8)for(let x=44;x<519;x+=8)if(this.clear(x,y)){const n=Math.hypot(x-this.x,y-this.y);if(n<d){d=n;best={x,y};}}if(best)Object.assign(this,best);}world.events.push({type:'stun',x:this.x,y:this.y});}
    magicScare(world){if(this.escaped)return;this.releaseHeld(world);this.pickup=null;this.target=null;this.path=[];this.repath=0;this.listenTime=0;this.sprint=0;this.danger='distant';const roll=world.random('rival');this.fleeing=roll>=.5;this.resting=roll<.5;this.magicSit=this.resting;
      if(this.resting){this.restAge=0;this.stamina=Math.min(this.stamina,20);this.phase='rest';}else{this.dropBag=roll<.75;this.fearAge=0;this.phase='scared';}world.events.push({type:'rival-scared',x:this.x,y:this.y});}
    scare(world){if(this.escaped||this.fleeing)return;this.releaseHeld(world);this.pickup=null;this.fleeing=true;this.dropBag=world.random('rival')<.5;this.fearAge=0;this.phase='scared';this.danger='distant';this.target=null;this.path=[];this.repath=0;world.events.push({type:'rival-scared',x:this.x,y:this.y});}
    flee(world,dt){
      this.fearAge+=dt;if(this.fearAge<.55){this.phase='scared';return;}
      if(this.dropBag&&this.bag.length&&this.fearAge<1){this.phase='dropping';return;}
      if(this.dropBag&&this.bag.length){const p=this.bagPoint();world.terrain.dig(p.x,p.y,24,'rival');world.droppedBags.push({...p,age:0,spill:0,balls:this.bag.splice(0)});world.events.push({type:'bag-dropped',...p});}
      this.phase='fleeing';this.repath-=dt;
      if(!this.exitPoint||this.repath<=0){this.refreshObstacles();const exits=[];for(const x of [44,516])for(let y=72;y<=536;y+=32){if(!this.clear(x,y))continue;const path=this.route({x,y});if(!path.length)continue;let length=0,last=this;for(const p of path){length+=distance(last,p);last=p;}exits.push({x,y,path,length});}exits.sort((a,b)=>a.length-b.length);const chosen=exits[0];if(chosen){this.exitPoint={x:chosen.x,y:chosen.y};this.path=chosen.path;}this.repath=.7;}
      const old={x:this.x,y:this.y};let next=this.path[0];while(next&&distance(this,next)<1){this.path.shift();next=this.path[0];}
      if(this.exitPoint&&distance(this,this.exitPoint)<3){this.atExit=true;this.exitSide=this.exitPoint.x<280?-1:1;}
      if(this.atExit){this.fx=this.exitSide;this.fy=0;this.x+=this.exitSide*110*this.loadFactor*dt;const tip=this.toolPoint(),dug=world.terrain.dig(tip.x,tip.y,20,'rival');this.removed+=dug;this.digContact=dug>0;if(dug)this.lastDigPoint={...tip};if(this.x<-45||this.x>605){this.escaped=true;this.phase='escaped';this.bag.length=0;world.events.push({type:'rival-escaped',x:this.x,y:this.y});}}
      else if(next){const d=distance(this,next),speed=110*this.loadFactor,amount=Math.min(d,speed*dt),dx=(next.x-this.x)/d,dy=(next.y-this.y)/d;this.fx=dx;this.fy=dy;this.fleeDigging=world.terrain.solid(this.x+dx*26,this.y+dy*26);this.digCycle=(this.digCycle+dt*3)%1;if(this.clear(this.x+dx*amount,this.y+dy*amount)){this.x+=dx*amount;this.y+=dy*amount;const tip=this.toolPoint(),dug=world.terrain.dig(tip.x,tip.y,20,'rival');this.removed+=dug;this.digContact=dug>0;if(dug)this.lastDigPoint={...tip};}else this.repath=0;if(distance(old,this)>.001)this.stamina=Math.max(0,this.stamina-dt*12*(1+this.bag.length*.06));}
      if(!this.escaped)this.moveBag(world,dt,distance(old,this));
    }
    step(world,dt){
      if(this.escaped)return;

      this.digContact=false;this.age+=dt;this.hearingCooldown=Math.max(0,this.hearingCooldown-dt);this.sprint=Math.max(0,this.sprint-dt);
      if(this.stunTime>0){this.stunTime=Math.max(0,this.stunTime-dt);this.phase='stun';return;}
      if(this.fleeing){this.flee(world,dt);return;}
      if(this.pickup){this.stepPickup(world,dt);return;}
      if(this.stamina<=20&&!this.resting){this.resting=true;this.restAge=0;this.listenTime=0;this.sprint=0;}
      if(this.resting){this.restAge+=dt;this.stamina=Math.min(100,this.stamina+26*dt);this.phase=this.magicSit?'rest':this.restAge<.7?'wipe':this.restAge<1.5?'drink':'rest';if(this.restAge>=2&&this.stamina>=85){this.resting=false;this.magicSit=false;this.repath=0;}return;}
      if(this.listenTime>0){this.listenTime=Math.max(0,this.listenTime-dt);this.phase='listen';if(!this.listenTime&&this.stamina>25)this.sprint=1.3;return;}
      if(this.hearingCooldown===0&&this.stamina>25&&world.balls.some(b=>b.active&&Math.hypot(b.vx,b.vy)>=65&&distance(this,b)<=120)){this.listenTime=.35;this.hearingCooldown=6;this.phase='listen';world.events.push({type:'listen',x:this.x,y:this.y});return;}
      const candidates=world.balls.filter(b=>b.active&&!b.held&&b.y<560&&(b.theftImmuneUntil??0)<=(world.time??this.age));
      if(!candidates.length){this.danger='distant';this.distance=null;if(this.bag.length&&(this.torn||this.bag.length>6)){this.patrolGoal??={x:this.x<280?480:80,y:110,r:8,active:true,patrol:true,vx:0,vy:0};if(distance(this,this.patrolGoal)<30)this.patrolGoal.x=this.patrolGoal.x>280?80:480;candidates.push(this.patrolGoal);}else{this.phase='searching';this.target=null;return;}}
      const available=candidates.filter(b=>(this.targetCooldown.get(b)??0)<=this.age);
      const close=available.find(b=>!b.patrol&&this.canReach(this,b));if(close){const stance=this.contactStance(close);if(stance){const previous={x:this.x,y:this.y};this.alignPickup(world,close,stance,dt);this.watchProgress(previous,dt);return;}this.avoidTarget(close,.5);}
      const previous={x:this.x,y:this.y};this.repath-=dt;if(this.repath<=0||(this.target&&(!this.target.active||this.target.y>=560))){
        this.refreshObstacles();const calm=available.filter(b=>Math.hypot(b.vx,b.vy)<70),choices=calm.length?calm:available;
        choices.sort((a,b)=>distance(this,a)-distance(this,b));this.target=null;this.path=[];
        for(const candidate of [...choices,...available.filter(b=>!choices.includes(b))]){const path=this.route(candidate);if(this.canReach(path.at(-1)||this,candidate)){this.target=candidate;this.path=path;break;}}if(!this.target)this.path=this.patrol();this.repath=.35;
      }
      let next=this.path[0];while(next&&distance(this,next)<.25){this.path.shift();next=this.path[0];}
      if(next){const d=distance(this,next),dx=(next.x-this.x)/d,dy=(next.y-this.y)/d;this.fx=dx;this.fy=dy;
        const digging=world.terrain.solid(this.x+dx*34,this.y+dy*34);this.phase=digging?'digging':'running';
        const load=1+this.bag.length*.06,energy=(.8+.3*this.stamina/100)*this.loadFactor;this.digCycle=(this.digCycle+dt*(1.8*energy))%1;const amount=Math.min(d,this.speed*(digging?1:1.65)*energy*(this.sprint>0?1.5:1)*(.75+Math.max(0,Math.sin(this.age*13))*.5)*dt);
        const nx=this.x+dx*amount,ny=this.y+dy*amount;if(this.clear(nx,ny)){this.x=nx;this.y=ny;}else this.repath=0;
        const tip=this.toolPoint();let excavated=0;if(amount>0)excavated=world.terrain.dig(tip.x,tip.y,20,'rival');this.digContact=excavated>0;if(excavated)this.lastDigPoint={...tip};this.removed+=excavated;
        if(distance(this,previous)>.001||excavated>0)this.stamina=Math.max(0,this.stamina-((excavated>0?10:6)+(this.sprint>0?8:0))*load*dt);
      }else this.phase='searching';
      this.watchProgress(previous,dt);
      const nearest=candidates.reduce((a,b)=>distance(this,a)<distance(this,b)?a:b);this.distance=nearest.patrol?null:distance(this,nearest);
      this.danger=this.distance===null?'distant':this.distance<58?'near':this.distance<115?'approaching':'distant';
      this.moveBag(world,dt,distance(this,previous));
    }
    get bagScale(){return 1+Math.min(1.15,this.bag.length*.085);}
    bagPoint(){return A.bag(this);}
    heldPoint(){if(!this.pickup)return this.bagPoint();const p=A.palm(this),g=this.pickup.grip||{x:0,y:0},fade=this.pickup.age<.7?1:Math.max(0,(1-this.pickup.age)/.3);return{x:p.x+g.x*fade,y:p.y+g.y*fade};}
    releaseHeld(world){const b=this.pickup?.ball;if(!b?.held)return;b.held=false;b.vx=-(this.fx<0?-1:1)*35;b.vy=15;b.theftImmuneUntil=(world.time??this.age)+1.5;world.terrain.dig(b.x,b.y,b.r+4,'rival');}
    stepPickup(world,dt){const p=this.pickup,b=p.ball;p.age+=dt;
      if(!b.active||(!b.held&&!this.canReach(this,b))){this.releaseHeld(world);this.pickup=null;this.avoidTarget(b,.25);this.phase='searching';return;}
      this.phase=p.age<.24?'reach':p.age<.4?'contact':p.age<.7?'lifting':'bagging';
      if(p.age>=.24&&!b.held){const palm=A.point(this,A.pickup[p.contactFrame]);if(distance(palm,b)>2){this.pickup=null;this.avoidTarget(b,.15);this.phase='searching';return;}p.start={x:b.x,y:b.y};p.grip={x:b.x-palm.x,y:b.y-palm.y};b.held=true;this.captured={x:b.x,y:b.y,color:b.color};}
      if(b.held){const point=this.heldPoint(),steps=Math.max(1,Math.ceil(distance(b,point)/2));for(let i=1;i<=steps;i++){const x=b.x+(point.x-b.x)*i/steps,y=b.y+(point.y-b.y)*i/steps;if(this.rocks.some(r=>!r.broken&&G.contains(r,x,y,b.r))){this.releaseHeld(world);this.pickup=null;this.phase='searching';this.avoidTarget(b,1.2);return;}}Object.assign(b,point,{vx:0,vy:0});}
      this.stamina=Math.max(0,this.stamina-dt*(4+this.bag.length*.5));
      if(p.age>=1)world.queueInteraction({u:1,kind:'theft',apply:()=>{if(this.pickup!==p||this.stunTime>0||!b.active)return;b.held=false;this.bag.push(b);this.pickup=null;this.repath=0;world.resolveBead(b,'stolen');world.events.push({type:'stow',...this.bagPoint()});}});
    }
    moveBag(world,dt,travel){if(travel<=.001)return;
      if(!this.torn&&this.bag.length>6){this.movingSeconds+=dt;while(this.movingSeconds>=1){this.movingSeconds-=1;if(world.random('rival')<.05){this.torn=true;world.events.push({type:'bag-torn',...this.bagPoint()});break;}}}else if(!this.torn)this.movingSeconds=0;
      if(this.torn&&this.bag.length){this.spillSeconds+=dt;while(this.spillSeconds>=.75&&this.bag.length){this.spillSeconds-=.75;const b=this.bag.pop(),p=this.bagPoint();if(!this.clear(p.x,p.y))Object.assign(p,{x:this.x,y:this.y});world.terrain.dig(p.x,p.y,b.r+6,'rival');Object.assign(b,p,{previousX:p.x,previousY:p.y,active:true,held:false,stolen:false,vx:-(this.fx<0?-1:1)*25,vy:35,theftImmuneUntil:(world.time??this.age)+2});world.losses.stolen=Math.max(0,world.losses.stolen-1);world.events.push({type:'spill',...p,color:b.color});}}
    }
    toolPoint(){const p=A.pose(this);return A.point(this,p.tip?p:A.drillPose(this),'tip');}
    snapshot(){return{noProgress:this.noProgress,recoveries:this.recoveries,loadFactor:this.loadFactor,fleeDigging:!!this.fleeDigging,escaped:this.escaped,fleeing:this.fleeing,dropBag:this.dropBag,fearAge:this.fearAge,bagCount:this.bag.length,bagScale:this.bagScale,torn:this.torn,digCycle:this.digCycle,pickup:this.pickup?{frame:A.pickupFrame(this.pickup),contactFrame:this.pickup.contactFrame,palm:A.palm(this),age:this.pickup.age,color:this.pickup.ball.color,held:!!this.pickup.ball.held,point:this.heldPoint()}:null,stamina:this.stamina,stunTime:this.stunTime,sprint:this.sprint,resting:this.resting,x:this.x,y:this.y,tool:this.toolPoint(),phase:this.phase,danger:this.danger,distance:this.distance,fx:this.fx,fy:this.fy,digContact:this.digContact,removed:this.removed,target:this.target?{x:this.target.x,y:this.target.y,color:this.target.color}:null,captured:this.captured?{...this.captured}:null};}
  }
  return Rival;
});
