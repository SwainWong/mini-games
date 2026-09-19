/* Shared deterministic terrain, scoring and physics. No DOM, network or persistence. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.SandCore=api;})(globalThis,()=>{
  const G=typeof module==='object'?require('./rock-geometry.js'):globalThis.SandRock;
  'use strict';
  const Magic=typeof module==='object'?require('./magic.js'):globalThis.SandMagic;
  const Cargo=typeof module==='object'?require('./cart-cargo.js'):globalThis.SandCargo;
  const Crew=typeof module==='object'?require('./cart-crew.js'):globalThis.SandCrew;
  const Hazards=typeof module==='object'?require('./hazards.js'):globalThis.SandHazards;
  const Rival=typeof module==='object'?require('./rival.js'):globalThis.SandRival;
  const W=560,H=760,BOTTOM=564,CELL=2,GW=W/CELL,GH=BOTTOM/CELL,STEP=1/120;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const TYPES={glass:{r:8.5,mass:1,gravity:740,bounce:.08},heavy:{r:10,mass:2.4,gravity:900,bounce:.04},rubber:{r:8.5,mass:.8,gravity:740,bounce:.48},light:{r:8,mass:.45,gravity:400,bounce:.12}};
  const samples=Array.from({length:24},(_,i)=>[Math.cos(i*Math.PI/12),Math.sin(i*Math.PI/12)]);
  function rating(state,dug,budget){return state!=='won'?0:dug<=budget.three?3:dug<=budget.two?2:1;}
  class Terrain{
    constructor(rocks=[]){this.grid=new Uint8Array(GW*GH).fill(1);this.rockMask=new Uint8Array(GW*GH);this.playerCells=0;this.playerMask=new Uint8Array(GW*GH);this.revision=0;this.changes=[];
      this.rebuildRockMask(rocks);
    }
    rebuildRockMask(rocks){this.rockMask.fill(0);let changed=false;for(const r of rocks){if(r.broken)continue;const e=G.extent(r);for(let gy=Math.max(0,Math.floor((r.y-e.y)/2));gy<Math.min(GH,(r.y+e.y)/2);gy++)for(let gx=Math.max(0,Math.floor((r.x-e.x)/2));gx<Math.min(GW,(r.x+e.x)/2);gx++)if(G.contains(r,gx*2+1,gy*2+1)){const i=gy*GW+gx;this.rockMask[i]=1;if(this.grid[i]){this.grid[i]=0;this.changes.push(i);changed=true;}}}if(changed)this.revision++;}
    sandSolid(x,y){if(x<0||x>=W||y<0)return true;if(y>=BOTTOM)return false;return this.grid[Math.floor(y/2)*GW+Math.floor(x/2)]===1;}
    solid(x,y){return this.sandSolid(x,y)||(x>=0&&x<W&&y>=0&&y<BOTTOM&&this.rockMask[Math.floor(y/2)*GW+Math.floor(x/2)]===1);}
    dig(x,y,r=24,source='player'){
      if(y<51||y>BOTTOM+r)return 0;let removed=0,unique=0;
      const xa=clamp(Math.floor((x-r)/2),0,GW-1),xb=clamp(Math.ceil((x+r)/2),0,GW-1),ya=clamp(Math.floor((y-r)/2),0,GH-1),yb=clamp(Math.ceil((y+r)/2),0,GH-1);
      for(let gy=ya;gy<=yb;gy++)for(let gx=xa;gx<=xb;gx++){const i=gy*GW+gx;if(!this.rockMask[i]&&this.grid[i]&&(gx*2+1-x)**2+(gy*2+1-y)**2<r*r){this.grid[i]=0;removed++;if(source==='player'&&!this.playerMask[i]){this.playerMask[i]=1;unique++;}this.changes.push(i);}}
      if(source==='player')this.playerCells+=unique;if(removed)this.revision++;return removed;
    }
    line(a,b,r=24,source='player'){const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4));let removed=0;for(let i=0;i<=steps;i++){const t=i/steps;removed+=this.dig(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,source);}return removed;}
    path(points,r=24,source='player'){for(let i=1;i<points.length;i++)this.line(points[i-1],points[i],r,source);}
    get units(){return Math.ceil(this.playerCells*4/100);}
  }
  function setupTerrain(level){const t=new Terrain(level.rocks);for(const p of level.tunnels)t.path(p,30,'initial');for(const g of level.groups)t.dig(g.x,g.y,40,'initial');return t;}
  function budgets(level){return {...level.budget};}
  // The visible inner aperture is the center-crossing boundary, shared with the renderer.
  const CART_MOUTH=Object.freeze({y:590,halfWidth:46,halfHeight:7,rimWidth:3});
  const jarMouth=j=>({...CART_MOUTH,x:j.x,y:CART_MOUTH.y-j.lift});
  class World{
    constructor(level,{seed=Math.floor(Math.random()*4294967296)}={}){if(level.jars.length>4)throw new Error("At most 4 minecarts are allowed");this.droppedBags=[];this.level=level;this.initialSeed=seed>>>0;this.seed=seed>>>0;this.rivalSeed=(seed^0x6d2b79f5)>>>0;this.rocks=level.rocks.map((r,id)=>({...r,id,angle:r.angle||0,omega:0,vx:0,vy:0,warning:0,phase:'stable',broken:false}));this.terrain=setupTerrain(level);this.budget=budgets(level);this.time=0;this.timeLimit=level.timeLimit??60;this.endCause=null;this.started=true;this.state='playing';this.reason='';this.collected=0;this.score=0;this.losses={'wrong-color':0,missed:0,stolen:0};this.interactions=[];this.frameFailure=null;this.treasures=(level.treasures||[]).map((t,i)=>({...t,id:i,r:t.r||16,opened:false}));this.catches=[];this.events=[];this.effects={wormCells:0,porterTrips:0};this.balls=[];this.jars=level.jars.map(j=>({...j,homeX:j.x,lift:0,intact:true,balls:[],flash:0}));this.failure=null;this.worms=(level.mechanics.worms||[]).map((w,i)=>({...w,alive:true,homeX:w.x,homeY:w.y,vx:Math.cos(w.angle??i*2.1)*w.speed,vy:Math.sin(w.angle??i*2.1)*w.speed}));
      this.cargo=new Cargo(this);this.crew=new Crew(this);
      for(const group of level.groups)for(let i=0;i<group.count;i++){const type=group.types?.[i%group.types.length]||group.type||'glass',spec=TYPES[type],row=Math.floor(i/3),col=i%3,count=Math.min(3,group.count-row*3);this.balls.push({x:group.x+(col-(count-1)/2)*22,y:group.y+18-row*22,vx:0,vy:0,color:group.color,type,...spec,active:true,hitAt:-1});}
      this.total=this.balls.length;this.targetScore=level.targetScore??this.total*10;this.rival=level.mechanics.rival?new Rival({...level,rocks:this.rocks},this.balls):null;this.hazards=new Hazards(this);this.magic=new Magic(this);
    }
    get inputLocked(){return this.state!=='playing'||this.timeRemaining<=1e-9||this.magic.pausesWorld;}
    dig(a,b,r=20){if(this.inputLocked)return 0;return this.terrain.line(a,b,r);}
    random(stream='crew'){const key=stream==='rival'?'rivalSeed':'seed';this[key]=(Math.imul(this[key],1664525)+1013904223)>>>0;return this[key]/4294967296;}
    get porter(){return this.porters?.[0]||null;}
    wormPoint(w){return{x:w.x,y:w.y};}
    moveWorm(w,dt){
      const clear=(x,y)=>x>=20&&x<=W-20&&y>=80&&y<=BOTTOM-25&&this.rocks.filter(r=>!r.broken).every(r=>!G.contains(r,x,y,19));
      let x=w.x+w.vx*dt,y=w.y+w.vy*dt;
      if(x<w.homeX-w.range||x>w.homeX+w.range||!clear(x,w.y)){w.vx=-w.vx;x=w.x+w.vx*dt;}
      if(y<w.homeY-w.depth||y>w.homeY+w.depth||!clear(w.x,y)){w.vy=-w.vy;y=w.y+w.vy*dt;}
      if(!clear(x,y)){w.vx=-w.vx;w.vy=-w.vy;x=w.x+w.vx*dt;y=w.y+w.vy*dt;}
      if(clear(x,y)){const removed=this.terrain.line([w.x,w.y],[x,y],17,'worm');w.dug=(w.dug||0)+removed;this.effects.wormCells+=removed;w.x=x;w.y=y;}
    }
    mechanisms(dt){
      for(const w of this.worms)if(w.alive)this.moveWorm(w,dt);
      this.crew.step(dt);
    }
    receive(j,b,contact={x:b.x,y:jarMouth(j).y,mouthX:j.x}){if(!b.active||!j?.intact)return;if(!this.cargo.freeSlots(j)){this.cargo.bounce(j,b,contact);return;}b.active=false;this.score+=b.value??10;this.cargo.store(j,b);j.flash=1;this.collected++;this.catches.push({...contact,offset:contact.x-contact.mouthX,color:b.color,material:b.type,r:b.r});this.events.push({type:'collect',x:contact.x,y:contact.y,color:b.color,points:b.value??10,count:this.collected});}
    resolveBead(b,outcome,contact={},jar=null){
      if(!b.active)return;
      if(outcome==='collected'){this.receive(jar||this.jars.find(j=>j.color===b.color&&j.intact),b,Object.keys(contact).length?contact:undefined);return;}
      b.active=false;b.outcome=outcome;b.stolen=outcome==='stolen';this.losses[outcome]++;this.events.push({type:'loss',outcome,x:contact.x??b.x,y:contact.y??b.y,color:b.color});
      this.frameFailure={kind:outcome,x:contact.x??b.x,y:contact.y??b.y,r:b.r,material:b.type,color:b.color,...contact,ball:b};
    }
    recoverableBag(){const r=this.rival;if(!r||r.escaped)return[];const active=this.balls.some(b=>b.active),bombChance=(this.bombs.some(b=>b.state==='burning'||b.state==='idle'&&active)||this.magic?.canScare);return r.torn||r.fleeing||bombChance||r.bag.length+this.balls.filter(b=>b.active).length>6?r.bag:[];}
    remainingPotential(){const active=[...this.balls.filter(b=>b.active),...this.droppedBags.flatMap(b=>b.balls)],recoverable=this.recoverableBag();return this.cargo.availablePotential([...active,...recoverable])+(active.length||recoverable.length?this.magic.potential():0);}
    roundReport(){
      const collected=new Set(this.jars.flatMap(j=>j.balls)),dropped=new Set(this.droppedBags.flatMap(b=>b.balls));
      const free=this.balls.filter(b=>b.active&&!b.held),held=this.balls.filter(b=>b.active&&b.held),recoverable=this.recoverableBag();
      const candidates=[...free,...held,...dropped,...recoverable],value=bs=>bs.reduce((n,b)=>n+(b.value??10),0);
      const colors=[...new Set(this.balls.map(b=>b.color))].map(color=>{const row={color,total:0,collected:0,stolen:0,wrong:0,missed:0,unsettled:0,points:0};
        for(const b of this.balls.filter(b=>b.color===color)){row.total++;if(collected.has(b)){row.collected++;row.points+=b.value??10;}else if(b.active||dropped.has(b))row.unsettled++;else if(b.stolen)row.stolen++;else if(b.outcome==='wrong-color')row.wrong++;else if(b.outcome==='missed')row.missed++;else row.unsettled++;}return row;});
      const beadPoints=colors.reduce((n,c)=>n+c.points,0),beadPotential=this.cargo.availablePotential(candidates),remaining=this.remainingPotential();
      return{colors,beadPoints,bonusPoints:this.score-beadPoints,remaining,beadPotential,treasurePotential:remaining-beadPotential,rawBeadValue:value(candidates),freeCount:free.length,heldCount:held.length,droppedCount:dropped.size,recoverableCount:recoverable.length,unopenedBags:this.treasures.filter(t=>!t.opened&&t.kind==='bag').length,unopenedChests:this.treasures.filter(t=>!t.opened&&t.kind==='chest').length};
    }
    queueInteraction(e){this.interactions.push({...e,u:Math.max(0,Math.min(1,e.u??1))});}
    resolveInteractions(){
      const priority={treasure:0,collect:1,damage:2,theft:3,loss:4,trigger:5};
      while(this.interactions.length&&this.state==='playing'){
        this.interactions.sort((a,b)=>a.u-b.u||(priority[a.kind]??4)-(priority[b.kind]??4));const u=this.interactions[0].u;this.contactU=u;
        while(this.interactions.some(e=>Math.abs(e.u-u)<1e-7)&&this.state==='playing'){
          this.interactions.sort((a,b)=>a.u-b.u||(priority[a.kind]??4)-(priority[b.kind]??4));this.interactions.shift().apply();
        }
        this.checkOutcome(false);
      }
      this.interactions.length=0;delete this.contactU;this.checkOutcome();
    }
    get timeRemaining(){return Math.max(0,this.timeLimit-this.time);}
    checkOutcome(settleDeadline=true){
      if(this.state!=='playing'||this.magic.pending)return;
      const qualified=this.score>=this.targetScore,remaining=this.remainingPotential();
      // Passing the gate never stops the round; keep every remaining scoring opportunity.
      if(this.time<this.timeLimit&&qualified&&!this.balls.some(b=>b.active)&&!this.recoverableBag().length&&!this.droppedBags.some(b=>b.balls.length)){this.end(true,`珠子已全部结算。最终 ${this.score} 分，过关门槛 ${this.targetScore} 分。`,null,'exhausted');return;}
      if(settleDeadline&&this.time>=this.timeLimit){this.end(qualified,`时间到！最终 ${this.score} 分，过关门槛 ${this.targetScore} 分。`,qualified?null:{kind:'timeout'},'timeout');return;}
      if(this.score+remaining>=this.targetScore)return;
      const f=this.frameFailure;if(f?.ball&&f.u!==undefined&&this.stepMouths)this.freezeCrossing(f.ball,f,this.stepMouths);
      const failure=f?Object.fromEntries(Object.entries(f).filter(([k])=>k!=='ball')):{kind:'unreachable'};
      if(failure.mouthX!==undefined)failure.targetX=failure.mouthX;
      this.end(false,`当前 ${this.score} + 剩余最高 ${remaining} < 目标 ${this.targetScore}。积分已不足，重来试试另一条路线。`,failure,'unreachable');
    }
    freezeCrossing(b,contact,mouths){
      // Render loss at the same instant used by the swept catch test, including moving carts.
      for(let i=0;i<this.jars.length;i++){const j=this.jars[i];j.x=mouths[i].x+(j.x-mouths[i].x)*contact.u;}
      this.cargo.sync();b.x=contact.x;b.y=contact.y;
    }
    collide(b){
      for(let iteration=0;iteration<9;iteration++){let nx=0,ny=0,hits=0;for(const[dx,dy]of samples)if(this.terrain.solid(b.x+dx*b.r,b.y+dy*b.r)){nx-=dx;ny-=dy;hits++;}if(!hits)break;const n=Math.hypot(nx,ny);if(n<.01){b.y-=1;continue;}nx/=n;ny/=n;b.x+=nx*.8;b.y+=ny*.8;const vn=b.vx*nx+b.vy*ny;if(vn<0){if(vn<-90&&this.time-b.hitAt>.16){this.events.push({type:'hit',speed:-vn});b.hitAt=this.time;}b.vx-=(1+b.bounce)*vn*nx;b.vy-=(1+b.bounce)*vn*ny;}b.vx*=.985;}
      for(const rock of this.rocks.filter(r=>!r.broken)){const p=G.local(rock,b.x,b.y),rx=rock.rx+b.r,ry=rock.ry+b.r,d=Math.hypot(p.x/rx,p.y/ry);if(d<1){const angle=Math.atan2(p.y/ry,p.x/rx),q=G.point(rock,Math.cos(angle)*rx,Math.sin(angle)*ry);b.x=q.x;b.y=q.y;const normal=G.point({...rock,x:0,y:0},Math.cos(angle)/rx,Math.sin(angle)/ry),n=Math.hypot(normal.x,normal.y),nx=normal.x/n,ny=normal.y/n,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+b.bounce)*vn*nx;b.vy-=(1+b.bounce)*vn*ny;}}}

    }
    step(dt=STEP){let left=dt;while(left>1e-10&&this.state==='playing'){const part=Math.min(left,this.magic.untilBoundary());this.stepSlice(part);left-=part;}}
    stepSlice(dt){
      if(this.state!=='playing')return;this.interactions=[];this.frameFailure=null;const frozen=this.magic.pausesWorld||this.timeRemaining<=1e-9;this.magic.step(frozen?dt:Math.min(dt,this.timeRemaining),{physical:!frozen});if(frozen){this.checkOutcome();return;}if(this.started){dt=Math.min(dt,this.timeRemaining);if(dt<=1e-9){this.time=this.timeLimit;this.checkOutcome();return;}}const mouths=this.jars.map(jarMouth);this.stepMouths=mouths;for(const b of this.balls){b.previousX=b.x;b.previousY=b.y;}if(this.started){this.time=Math.min(this.timeLimit,this.time+dt);if(this.timeLimit-this.time<1e-9)this.time=this.timeLimit;this.mechanisms(dt);this.hazards.step(dt);}
      for(const b of this.balls){if(!b.active||b.held)continue;const gravity=b.gravity;
        b.vy=clamp(b.vy+gravity*dt,-220,390);b.vx=clamp(b.vx*.999,-180,180);b.x+=b.vx*dt;b.y+=b.vy*dt;this.collide(b);
      }
      for(let repeat=0;repeat<3;repeat++)for(let i=0;i<this.balls.length;i++){const a=this.balls[i];if(!a.active||a.held)continue;for(let j=i+1;j<this.balls.length;j++){const b=this.balls[j];if(!b.active||b.held)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=a.r+b.r)continue;if(d<.001){dx=.01;dy=.01;d=Math.hypot(dx,dy);}const nx=dx/d,ny=dy/d,overlap=a.r+b.r-d,ia=1/a.mass,ib=1/b.mass,inv=ia+ib;a.x-=nx*overlap*ia/inv;a.y-=ny*overlap*ia/inv;b.x+=nx*overlap*ib/inv;b.y+=ny*overlap*ib/inv;const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(relative<0){const impulse=-(1+Math.min(a.bounce,b.bounce))*relative/inv;a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;}}this.collide(a);}
      for(const b of this.balls){
        if(!b.active||b.held)continue;this.hazards.touchBead(b);let missed=null;
        for(let i=0;i<this.jars.length;i++){
          const j=this.jars[i],before=mouths[i],now=jarMouth(j),above=b.previousY-before.y,below=b.y-now.y;
          // Swept crossing in the moving mouth's frame, never the jar's home position.
          if(above>0||below<0||below<=above)continue;
          const u=-above/(below-above),x=b.previousX+(b.x-b.previousX)*u,mouthX=before.x+(now.x-before.x)*u;
          const contact={x,y:now.y,mouthX,u},offset=x-mouthX;
          // A center inside the painted opening rolls over the lip into the cart.
          // Do not silently inset the aperture by the radius of each bead material.
          if(Math.abs(offset)>now.halfWidth+1e-7){if(!missed||Math.abs(offset)<Math.abs(missed.offset))missed={...contact,offset,j};continue;}
          this.queueInteraction({u,kind:'collect',apply:()=>{if(!b.active)return;if(j.intact&&!this.cargo.freeSlots(j)){this.cargo.bounce(j,b,contact);return;}if(j.intact&&j.color===b.color)this.resolveBead(b,'collected',contact,j);else this.resolveBead(b,'wrong-color',{...contact,target:j.color,targetX:mouthX,targetY:now.y});}});
          missed=null;break;
        }
        if(missed)this.queueInteraction({u:missed.u,kind:'loss',apply:()=>this.resolveBead(b,'missed',{x:missed.x,y:missed.y,mouthX:missed.mouthX,u:missed.u,offset:missed.offset,targetX:missed.mouthX,targetY:missed.y})});
        else if(b.y>620)this.queueInteraction({u:1,kind:'loss',apply:()=>this.resolveBead(b,'missed',{x:b.x,y:b.y})});
      }
      if(this.started&&this.rival)this.rival.step(this,dt);
      this.resolveInteractions();
      for(const j of this.jars)j.flash=Math.max(0,j.flash-dt*2);
    }
    end(won,reason='',failure=null,cause=null){this.cargo.finishAt(this.contactU??1);this.endCause=cause;this.failure=failure;this.state=won?'won':'lost';this.reason=reason;this.events.push({type:this.state});}
    get stars(){return rating(this.state,this.terrain.units,this.budget);}
    snapshot(){return{version:18,seed:this.initialSeed,magic:this.magic.snapshot(),inputLocked:this.inputLocked,operator:this.operator?{...this.operator}:null,droppedBags:this.droppedBags.map(b=>({x:b.x,y:b.y,count:b.balls.length,age:b.age})),...this.hazards.snapshot(),state:this.state,endCause:this.endCause,timeLimit:this.timeLimit,timeRemaining:Number(this.timeRemaining.toFixed(3)),qualified:this.score>=this.targetScore,score:this.score,targetScore:this.targetScore,remainingPotential:this.remainingPotential(),losses:{...this.losses},collected:this.collected,catches:this.catches.map(c=>({...c})),total:this.total,dug:this.terrain.units,stars:this.stars,budget:this.budget,time:Math.round(this.time*10)/10,effects:{...this.effects},worms:this.worms.map(w=>({alive:w.alive,x:w.x,y:w.y,vx:w.vx,vy:w.vy})),balls:this.balls.filter(b=>b.active).map(b=>({x:Math.round(b.x),y:Math.round(b.y),type:b.type,color:b.color,value:b.value??10,waste:!!b.waste,held:!!b.held})),failure:this.failure?{...this.failure}:null,rival:this.rival?.snapshot()||null,porter:this.porters[0]?{...this.porters[0]}:null,porters:this.porters.map(p=>({...p})),jars:this.jars.map(j=>({color:j.color,intact:j.intact,x:j.x,homeX:j.homeX,mouthY:jarMouth(j).y,count:j.balls.length,capacity:j.capacity,rockLoad:this.cargo.rockLoad(j),freeSlots:this.cargo.freeSlots(j),cargo:j.balls.map(b=>({color:b.color,type:b.type,value:b.value??10,x:j.x+b.cargoX,y:jarMouth(j).y+b.cargoY}))}))};}
  }
  return{W,H,BOTTOM,CELL,GW,GH,STEP,TYPES,Terrain,World,jarMouth,CART_MOUTH,rating,budgets};
});
