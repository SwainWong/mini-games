(function(root){
'use strict';
const DT=1/90,CELL=90,BX=60,BY=360,FLOOR=320,GATE_X=650,GATE_TRAVEL=156,SPAN=1100,HEIGHT=1060;
const configs=[
 {name:'王室金库',label:'A',seed:317,weight:42,stock:330,board:[0,1,2,3,1,0,3,2,0,1,2,3,0,1,2,3]},
 {name:'水晶密室',label:'B',seed:829,weight:68,stock:380,board:[3,0,1,2,3,0,1,2,0,3,2,1,3,0,1,2]}
];
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function matches(b){const hits=new Set();for(let i=0;i<16;i++){const v=b[i];if(v==null)continue;const x=i%4,y=i>>2;if(x===0||b[i-1]!==v){let n=1;while(x+n<4&&b[i+n]===v)n++;if(n>=3)for(let j=0;j<n;j++)hits.add(i+j);}if(y===0||b[i-4]!==v){let n=1;while(y+n<4&&b[i+n*4]===v)n++;if(n>=3)for(let j=0;j<n;j++)hits.add(i+j*4);}}return [...hits];}
function preview(b,a,c){if(a<0||c<0||a>=16||c>=16||b[a]==null||b[c]==null||Math.abs(a%4-c%4)+Math.abs((a>>2)-(c>>2))!==1)return null;const out=[...b];[out[a],out[c]]=[out[c],out[a]];const hit=matches(out);return hit.includes(a)||hit.includes(c)?{board:out,hit}:null;}
function legal(b){const out=[];for(let a=0;a<16;a++)for(const c of [a%4<3?a+1:-1,a+4]){const p=preview(b,a,c);if(p)out.push({a,b:c,...p});}return out;}
function gravity(b){const out=Array(16).fill(null),tiles=[];for(let c=0;c<4;c++){let row=3;for(let r=3;r>=0;r--)if(b[r*4+c]!=null){const to=row*4+c;out[to]=b[r*4+c];tiles.push({color:b[r*4+c],x:BX+c*CELL,y:BY+r*CELL,targetY:BY+row*CELL,from:r*4+c,to,vy:0});row--;}}return{board:out,tiles};}
function push(p,nx,ny,depth){if(depth<=0)return;p.x+=nx*depth;p.y+=ny*depth;const vn=p.vx*nx+p.vy*ny;if(vn<0){p.vx-=vn*nx*1.03;p.vy-=vn*ny*1.03;}}
function rect(p,x,y,w,h){const qx=Math.max(x,Math.min(x+w,p.x)),qy=Math.max(y,Math.min(y+h,p.y));let dx=p.x-qx,dy=p.y-qy,dd=dx*dx+dy*dy;if(dd>=p.r*p.r)return;if(dd>1e-8){const d=Math.sqrt(dd);push(p,dx/d,dy/d,p.r-d);}else{const a=[p.x-x,x+w-p.x,p.y-y,y+h-p.y],k=a.indexOf(Math.min(...a));push(p,k===0?-1:k===1?1:0,k===2?-1:k===3?1:0,a[k]+p.r);}}
function segment(p,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((p.x-ax)*dx+(p.y-ay)*dy)/(dx*dx+dy*dy)));const x=ax+t*dx,y=ay+t*dy,vx=p.x-x,vy=p.y-y,d=Math.hypot(vx,vy);if(d<p.r+3&&d>1e-6)push(p,vx/d,vy/d,p.r+3-d);}
function pairs(ps){const grid=new Map(),size=18;for(let i=0;i<ps.length;i++){const p=ps[i],cx=Math.floor(p.x/size),cy=Math.floor(p.y/size);for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++){const list=grid.get(x+','+y);if(!list)continue;for(const q of list){const dx=p.x-q.x,dy=p.y-q.y,rr=p.r+q.r,d2=dx*dx+dy*dy;if(d2>=rr*rr)continue;const d=Math.sqrt(d2)||.001,nx=d2?dx/d:1,ny=d2?dy/d:0,fix=(rr-d)*.5;p.x+=nx*fix;p.y+=ny*fix;q.x-=nx*fix;q.y-=ny*fix;const vn=(p.vx-q.vx)*nx+(p.vy-q.vy)*ny;if(vn<0){p.vx-=vn*nx*.52;p.vy-=vn*ny*.52;q.vx+=vn*nx*.52;q.vy+=vn*ny*.52;}}}const key=cx+','+cy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(p);}}
class Stage{
 constructor(index){this.index=index;this.cfg=configs[index];this.board=[...this.cfg.board];this.hp=100;this.time=0;this.particles=[];this.collected=0;this.gate=0;this.gateVelocity=0;this.latched=false;this.complete=false;this.shield={x:460,vx:0};this.contact=0;this.maxContact=0;this.force=0;this.nextHurt=0;this.hits=0;this.actions=0;this.op=null;this.events=[];this.remixes=2;this.lastHurt=-10;const r=rng(this.cfg.seed);
  for(let row=0,y=88;y<346;y+=15.6,row++)for(let x=69+(row%2)*8;x<454;x+=16){if(x>420&&y>780-x-10)continue;if(this.particles.length>=this.cfg.stock)break;this.particles.push({id:this.particles.length,x:x+(r()-.5)*.8,y,r:7.1,vx:0,vy:0,angle:r()*6.28,captured:false});}
  this.initial=this.particles.length;
 }
 swap(a,b){if(this.op||this.complete||!this.hp)return false;const p=preview(this.board,a,b);this.op={kind:'swap',a,b,age:0,valid:!!p,result:p};if(p)this.actions++;return !!p;}
 hint(){const all=legal(this.board);if(!all.length)return[];const best=all.sort((a,b)=>b.hit.reduce((n,i)=>n+(i%4>=2?2:1),0)-a.hit.reduce((n,i)=>n+(i%4>=2?2:1),0))[0];return[best.a,best.b];}
 remix(){if(this.op||!this.remixes)return false;const positions=this.board.flatMap((v,i)=>v==null?[]:[i]);if(positions.length<3)return false;const random=rng(this.cfg.seed+this.actions+this.remixes*11);for(let n=0;n<80;n++){const b=[...this.board];for(const i of positions)b[i]=Math.floor(random()*4);if(!matches(b).length&&legal(b).length){this.board=b;this.remixes--;return true;}}return false;}
 tickBoard(){if(!this.op)return;const op=this.op;op.age+=DT;
  if(op.kind==='swap'||op.kind==='cascade'){if(op.age<.32)return;if(!op.valid){this.op=null;this.events.push({type:'invalid'});return;}this.board=[...op.result.board];const colors=[...this.board];for(const i of op.result.hit)this.board[i]=null;this.events.push({type:'match',cells:op.result.hit,colors});const fall=gravity(this.board);this.op={kind:'fall',age:0,...fall};return;}
  let done=true;for(const t of op.tiles){if(t.y<t.targetY){t.vy=Math.min(250,t.vy+650*DT);t.y=Math.min(t.targetY,t.y+t.vy*DT);if(t.y<t.targetY)done=false;}}
  if(done){this.board=op.board;const hit=matches(this.board);this.op=hit.length?{kind:'cascade',age:0,valid:true,result:{board:[...this.board],hit}}:null;}
 }
 collide(p){
  if(p.captured){const mouth=780+this.gate;rect(p,132,mouth,8,115);rect(p,340,mouth,8,115);rect(p,132,mouth+100,216,10);return;}
  rect(p,44,-100,16,830);rect(p,420,360,22,420);rect(p,460,82,20,98);rect(p,460,320,270,32);
  // The right-high basin floor is the same segment drawn by the renderer.
  if(p.x>=418&&p.x<=462&&p.y+p.r>780-p.x){const d=(p.y+p.x-780)/Math.SQRT2+p.r;if(p.y<365)push(p,-Math.SQRT1_2,-Math.SQRT1_2,d);}
  rect(p,this.shield.x,180,12,140);
  if(p.y<180&&p.x+p.r>460)push(p,-1,0,p.x+p.r-460);
  if(this.op?.kind==='fall'){for(const t of this.op.tiles)rect(p,t.x,t.y,CELL,CELL);}
  else for(let i=0;i<16;i++)if(this.board[i]!=null)rect(p,BX+i%4*CELL,BY+(i>>2)*CELL,CELL,CELL);
  segment(p,60,724,142,774);segment(p,420,724,338,774);
  // Fixed vertical guides keep the funnel aligned with the moving bucket.
  if(p.y>774){rect(p,125,774,10,290);rect(p,345,774,10,290);}
 }
 step(){this.time+=DT;this.tickBoard();
  for(const p of this.particles){p.vy=Math.min(480,p.vy+590*DT);p.vx*=.998;p.x+=p.vx*DT;p.y+=p.vy*DT;p.angle+=p.vx*DT*.025;}
  for(let n=0;n<5;n++){pairs(this.particles);for(const p of this.particles)this.collide(p);}
  this.contact=this.particles.filter(p=>!p.captured&&p.y>=183&&p.y<=317&&Math.abs(p.x+p.r-this.shield.x)<1.6).length;this.maxContact=Math.max(this.maxContact,this.contact);this.force+=(this.contact*65-this.force)*.12;
  const s=this.shield;s.vx+=((this.force-10)-s.vx*12)/18*DT;s.vx=Math.max(-5,Math.min(5.5,s.vx));s.x=Math.max(460,Math.min(GATE_X-116,s.x+s.vx*DT));
  for(const p of this.particles)if(!p.captured)rect(p,s.x,180,12,140);
  if(!this.latched&&this.gate<145&&s.x>=GATE_X-116-.01&&this.time>=this.nextHurt){this.hp=Math.max(0,this.hp-12);this.nextHurt=this.time+.8;this.hits++;this.lastHurt=this.time;this.events.push({type:'hurt'});}
  if(!this.hp)return;
  const mouth=780+this.gate;for(const p of this.particles)if(!p.captured&&p.y-p.r>=mouth&&p.x-p.r>=135&&p.x+p.r<=345){p.captured=true;this.collected++;this.events.push({type:'collect'});}
  if(!this.latched&&this.collected>this.cfg.weight){this.gateVelocity=Math.min(95,this.gateVelocity+((this.collected-this.cfg.weight)*2.4-this.gateVelocity*1.8)*DT);this.gate=Math.min(GATE_TRAVEL,this.gate+this.gateVelocity*DT);if(this.gate>=GATE_TRAVEL){this.latched=true;this.events.push({type:'open'});}}
 }
 characterFrame(){if(this.time-this.lastHurt<.85)return{sheet:'hurt',frame:Math.min(3,Math.floor((this.time-this.lastHurt)/.215))};return this.contact>0?{sheet:'single',frame:Math.floor(this.time*3)%4}:{sheet:'idle',frame:Math.floor(this.time/1.1)%4};}
 snapshot(){return{characterFrame:this.characterFrame(),label:this.cfg.label,time:+this.time.toFixed(3),hp:this.hp,board:[...this.board],actions:this.actions,phase:this.op?.kind||'idle',contact:this.contact,force:+this.force.toFixed(2),shieldX:+this.shield.x.toFixed(2),gate:+this.gate.toFixed(2),bucketDrop:+this.gate.toFixed(2),latched:this.latched,collected:this.collected,required:this.cfg.weight+1,stock:this.initial,activeStones:this.particles.filter(p=>!p.captured).length,complete:this.complete,hits:this.hits,remixes:this.remixes};}
}
class Adventure{
 constructor(){this.stages=[new Stage(0),new Stage(1)];this.active=0;this.phase='ready';this.paused=false;this.accumulator=0;this.actorX=460;this.cameraX=0;this.travelTarget=0;this.actorY=FLOOR;this.cameraY=0;this.waypoints=[];this.entryLiftY=60;this.events=[];}
 start(){if(this.phase==='ready')this.phase='playing';}
 swap(a,b){return this.phase==='playing'&&!this.paused?this.stages[this.active].swap(a,b):false;}
 advance(){if(this.phase!=='playing'||this.paused||!this.stages[this.active].latched)return false;this.phase='walking';this.actorY=FLOOR;this.actorX=this.active*SPAN+this.stages[this.active].shield.x+80;this.travelTarget=this.active*SPAN+790;return true;}
 restart(){this.stages[this.active]=new Stage(this.active);this.phase='ready';this.paused=false;this.actorX=this.active*SPAN+460;this.cameraX=this.active*SPAN;this.accumulator=0;this.actorY=FLOOR;this.cameraY=0;this.waypoints=[];this.entryLiftY=this.active===1?320:60;}
 update(delta){if(this.paused||['ready','lost','won'].includes(this.phase))return;this.accumulator+=Math.min(.08,Math.max(0,delta));while(this.accumulator>=DT){this.accumulator-=DT;this.tick();if(['ready','lost','won'].includes(this.phase))break;}}
 tick(){const s=this.stages[this.active];if(this.phase==='playing'){s.step();if(!s.hp){this.phase='lost';this.events.push({type:'lost'});}this.actorX=this.active*SPAN+s.shield.x;return;}
  // No new inputs or off-screen hazard simulation during the protected walk.
  if(this.phase==='walking'||this.phase==='transition'){
   const target=this.phase==='transition'?this.waypoints[0]:{x:this.travelTarget,y:FLOOR};
   const dx=target.x-this.actorX,dy=target.y-this.actorY,d=Math.hypot(dx,dy),travel=145*DT;
   if(d<=travel){this.actorX=target.x;this.actorY=target.y;}else{this.actorX+=dx/d*travel;this.actorY+=dy/d*travel;}
   if(this.phase==='transition'&&target.x===SPAN+560&&target.y===FLOOR)this.entryLiftY=this.actorY;
   const desired=Math.max(this.active*SPAN,Math.min(this.active===1?SPAN+350:SPAN,this.actorX-460));this.cameraX+=(desired-this.cameraX)*.075;this.cameraY+=(Math.min(0,this.actorY-260)-this.cameraY)*.075;
   if(d<=travel){if(this.phase==='walking'){s.complete=s.hp>0;if(!s.complete){this.phase='lost';return;}if(this.active===1){this.phase='won';this.events.push({type:'won'});}else{this.phase='transition';this.waypoints=[{x:SPAN-40,y:60},{x:SPAN+560,y:60},{x:SPAN+560,y:FLOOR},{x:SPAN+540,y:FLOOR}];this.events.push({type:'checkpoint'});}}else{this.waypoints.shift();if(!this.waypoints.length){this.active=1;this.phase='ready';this.cameraX=SPAN;this.cameraY=0;this.actorX=SPAN+460;this.actorY=FLOOR;this.events.push({type:'entered'});}}}
  }
 }
 snapshot(){return{active:this.active,phase:this.phase,paused:this.paused,entryLiftY:this.entryLiftY,actorX:+this.actorX.toFixed(2),cameraX:+this.cameraX.toFixed(2),actorY:+this.actorY.toFixed(2),cameraY:+this.cameraY.toFixed(2),stages:this.stages.map(s=>s.snapshot())};}
}
const api={Adventure,Stage,matches,preview,legal,gravity,configs,CELL,BX,BY,FLOOR,GATE_X,GATE_TRAVEL,SPAN,HEIGHT,DT};if(typeof module!=='undefined')module.exports=api;else root.LinkedKing=api;
})(globalThis);
