/* Shared deterministic terrain, scoring and physics. No DOM, network or persistence. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.SandCore=api;})(globalThis,()=>{
  'use strict';
  const W=560,H=760,BOTTOM=564,CELL=2,GW=W/CELL,GH=BOTTOM/CELL,STEP=1/120;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const TYPES={glass:{r:8.5,mass:1,gravity:740,bounce:.08},heavy:{r:10,mass:2.4,gravity:900,bounce:.04},rubber:{r:8.5,mass:.8,gravity:740,bounce:.48},light:{r:8,mass:.45,gravity:400,bounce:.12}};
  const samples=Array.from({length:24},(_,i)=>[Math.cos(i*Math.PI/12),Math.sin(i*Math.PI/12)]);
  function rating(state,dug,budget){return state!=='won'?0:dug<=budget.three?3:dug<=budget.two?2:1;}
  class Terrain{
    constructor(rocks=[]){this.grid=new Uint8Array(GW*GH).fill(1);this.rockMask=new Uint8Array(GW*GH);this.playerCells=0;this.revision=0;this.changes=[];
      for(const rock of rocks)for(let gy=Math.max(0,Math.floor((rock.y-rock.ry)/CELL));gy<Math.min(GH,(rock.y+rock.ry)/CELL);gy++)for(let gx=Math.max(0,Math.floor((rock.x-rock.rx)/CELL));gx<Math.min(GW,(rock.x+rock.rx)/CELL);gx++)if(((gx*2+1-rock.x)/rock.rx)**2+((gy*2+1-rock.y)/rock.ry)**2<=1)this.rockMask[gy*GW+gx]=1;
    }
    solid(x,y){if(x<0||x>=W||y<0)return true;if(y>=BOTTOM)return false;return this.grid[Math.floor(y/2)*GW+Math.floor(x/2)]===1;}
    dig(x,y,r=24,source='player'){
      if(y<51||y>BOTTOM+r)return 0;let removed=0;
      const xa=clamp(Math.floor((x-r)/2),0,GW-1),xb=clamp(Math.ceil((x+r)/2),0,GW-1),ya=clamp(Math.floor((y-r)/2),0,GH-1),yb=clamp(Math.ceil((y+r)/2),0,GH-1);
      for(let gy=ya;gy<=yb;gy++)for(let gx=xa;gx<=xb;gx++){const i=gy*GW+gx;if(!this.rockMask[i]&&this.grid[i]&&(gx*2+1-x)**2+(gy*2+1-y)**2<r*r){this.grid[i]=0;removed++;this.changes.push(i);}}
      if(source==='player')this.playerCells+=removed;if(removed)this.revision++;return removed;
    }
    line(a,b,r=24,source='player'){const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4));let removed=0;for(let i=0;i<=steps;i++){const t=i/steps;removed+=this.dig(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,source);}return removed;}
    path(points,r=24,source='player'){for(let i=1;i<points.length;i++)this.line(points[i-1],points[i],r,source);}
    get units(){return Math.ceil(this.playerCells*4/100);}
  }
  function setupTerrain(level){const t=new Terrain(level.rocks);for(const p of level.tunnels)t.path(p,30,'initial');for(const g of level.groups)t.dig(g.x,g.y,40,'initial');return t;}
  function budgets(level){return {...level.budget};}
  const phases=[['lift',.8,0],['walk',1.4,.55],['rest',1.1,.55],['walk',1.5,1],['rest',1.3,1],['return',1.5,.5],['rest',.9,.5],['return',1.5,0],['home',2.5,0]];
  class World{
    constructor(level,{seed=Math.floor(Math.random()*4294967296)}={}){this.level=level;this.seed=seed>>>0;this.terrain=setupTerrain(level);this.budget=budgets(level);this.time=0;this.started=false;this.state='playing';this.reason='';this.collected=0;this.events=[];this.effects={wormCells:0,porterTrips:0};this.balls=[];this.jars=level.jars.map(j=>({...j,homeX:j.x,lift:0,waiting:[],balls:[],flash:0}));this.porter=null;this.unloadClock=0;
      if(level.mechanics.porter)this.choosePorter();
      for(const group of level.groups)for(let i=0;i<group.count;i++){const type=group.types?.[i%group.types.length]||group.type||'glass',spec=TYPES[type],row=Math.floor(i/3),col=i%3,count=Math.min(3,group.count-row*3);this.balls.push({x:group.x+(col-(count-1)/2)*22,y:group.y+18-row*22,vx:0,vy:0,color:group.color,type,...spec,active:true,hitAt:-1});}
      this.total=this.balls.length;
    }
    dig(a,b,r=24){if(this.state!=='playing')return 0;this.started=true;return this.terrain.line(a,b,r);}
    random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
    choosePorter(){
      const previous=this.porter?.jar;let choices=this.jars.map((_,i)=>i).filter(i=>this.jars.length===1||i!==previous);const index=choices[Math.floor(this.random()*choices.length)],jar=this.jars[index];
      const left=Math.max(56,...this.jars.filter(j=>j.homeX<jar.homeX).map(j=>j.homeX+108)),right=Math.min(W-56,...this.jars.filter(j=>j.homeX>jar.homeX).map(j=>j.homeX-108));
      const direction=this.random()<.5?-1:1;let offset=direction*Math.min(90,direction<0?jar.homeX-left:right-jar.homeX);if(Math.abs(offset)<12)offset=-direction*Math.min(90,direction<0?right-jar.homeX:jar.homeX-left);
      this.porter={jar:index,phase:'lift',phaseIndex:0,elapsed:0,offset,progress:0,moving:false};this.effects.porterTrips++;
    }
    wormPoint(w,offset=0){const t=Math.max(0,this.time-offset);return{x:w.x+Math.sin(t*w.speed)*w.range,y:w.y+Math.sin(t*w.speed*.6)*w.depth};}
    mechanisms(dt){
      for(const w of this.level.mechanics.worms||[]){const p=this.wormPoint(w);this.effects.wormCells+=this.terrain.dig(p.x,p.y,12,'worm');}
      if(this.porter){const p=this.porter,j=this.jars[p.jar];p.elapsed+=dt;let phase=phases[p.phaseIndex];
        if(p.elapsed>=phase[1]){p.elapsed-=phase[1];p.phaseIndex++;if(p.phaseIndex===phases.length){j.x=j.homeX;j.lift=0;this.choosePorter();return;}phase=phases[p.phaseIndex];this.events.push({type:phase[0]==='rest'?'rest':'shuffle'});}
        p.phase=phase[0];p.moving=p.phase==='walk'||p.phase==='return';const u=clamp(p.elapsed/phase[1],0,1),ease=u*u*(3-2*u),from=phases[Math.max(0,p.phaseIndex-1)][2];p.progress=from+(phase[2]-from)*ease;j.x=j.homeX+p.offset*p.progress;j.lift=p.moving?10+Math.sin(this.time*22)*1.5:p.phase==='lift'?u*10:p.phase==='home'?0:2;
      }
    }
    receive(j,b){b.active=false;j.waiting.push(b);}
    unload(dt){this.unloadClock+=dt;if(this.unloadClock<.075)return;this.unloadClock=0;
      for(const j of this.jars){if(Math.abs(j.x-j.homeX)>9||!j.waiting.length)continue;const b=j.waiting.shift();j.balls.push(b.color);j.flash=1;this.collected++;this.events.push({type:'collect',x:j.homeX,color:b.color,count:this.collected});}
      if(this.collected===this.total)this.end(true);
    }
    collide(b){
      for(let iteration=0;iteration<9;iteration++){let nx=0,ny=0,hits=0;for(const[dx,dy]of samples)if(this.terrain.solid(b.x+dx*b.r,b.y+dy*b.r)){nx-=dx;ny-=dy;hits++;}if(!hits)break;const n=Math.hypot(nx,ny);if(n<.01){b.y-=1;continue;}nx/=n;ny/=n;b.x+=nx*.8;b.y+=ny*.8;const vn=b.vx*nx+b.vy*ny;if(vn<0){if(vn<-90&&this.time-b.hitAt>.16){this.events.push({type:'hit',speed:-vn});b.hitAt=this.time;}b.vx-=(1+b.bounce)*vn*nx;b.vy-=(1+b.bounce)*vn*ny;}b.vx*=.985;}
      for(const rock of this.level.rocks){const dx=b.x-rock.x,dy=b.y-rock.y,rx=rock.rx+b.r,ry=rock.ry+b.r,d=Math.sqrt(dx*dx/(rx*rx)+dy*dy/(ry*ry));if(d<1){const angle=Math.atan2(dy/ry,dx/rx);b.x=rock.x+Math.cos(angle)*rx;b.y=rock.y+Math.sin(angle)*ry;let nx=Math.cos(angle)/rx,ny=Math.sin(angle)/ry;const n=Math.hypot(nx,ny);nx/=n;ny/=n;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+b.bounce)*vn*nx;b.vy-=(1+b.bounce)*vn*ny;}}}
    }
    step(dt=STEP){
      if(this.state!=='playing')return;if(this.started){this.time+=dt;this.mechanisms(dt);}
      for(const b of this.balls){if(!b.active)continue;const gravity=b.gravity;
        b.vy=clamp(b.vy+gravity*dt,-220,390);b.vx=clamp(b.vx*.999,-180,180);b.x+=b.vx*dt;b.y+=b.vy*dt;this.collide(b);
      }
      for(let repeat=0;repeat<3;repeat++)for(let i=0;i<this.balls.length;i++){const a=this.balls[i];if(!a.active)continue;for(let j=i+1;j<this.balls.length;j++){const b=this.balls[j];if(!b.active)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=a.r+b.r)continue;if(d<.001){dx=.01;dy=.01;d=Math.hypot(dx,dy);}const nx=dx/d,ny=dy/d,overlap=a.r+b.r-d,ia=1/a.mass,ib=1/b.mass,inv=ia+ib;a.x-=nx*overlap*ia/inv;a.y-=ny*overlap*ia/inv;b.x+=nx*overlap*ib/inv;b.y+=ny*overlap*ib/inv;const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(relative<0){const impulse=-(1+Math.min(a.bounce,b.bounce))*relative/inv;a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;}}this.collide(a);}
      for(const b of this.balls){if(!b.active||b.y<582)continue;const j=this.jars.find(j=>Math.abs(j.homeX-b.x)<44);if(!j){this.end(false,'珠子漏过了罐口。把通道出口对准罐子再试试。');return;}if(j.color!==b.color){this.end(false,'珠子进入了不同颜色的罐子。留住两条路线之间的沙墙。');return;}this.receive(j,b);}
      this.unload(dt);
      for(const j of this.jars)j.flash=Math.max(0,j.flash-dt*2);
    }
    end(won,reason=''){this.state=won?'won':'lost';this.reason=reason;this.events.push({type:this.state});}
    get stars(){return rating(this.state,this.terrain.units,this.budget);}
    snapshot(){return{state:this.state,collected:this.collected,total:this.total,dug:this.terrain.units,stars:this.stars,budget:this.budget,time:Math.round(this.time*10)/10,effects:{...this.effects},balls:this.balls.filter(b=>b.active).map(b=>({x:Math.round(b.x),y:Math.round(b.y),type:b.type,color:b.color})),porter:this.porter?{...this.porter}:null,jars:this.jars.map(j=>({color:j.color,x:j.x,homeX:j.homeX,waiting:j.waiting.length,count:j.balls.length}))};}
  }
  return{W,H,BOTTOM,CELL,GW,GH,STEP,TYPES,Terrain,World,rating,budgets};
});
