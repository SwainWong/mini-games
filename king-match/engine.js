(function(root){
'use strict';
const L=typeof module!=='undefined'?require('./levels.js'):root.KingLevels;
const {CELL,BOARD_X,BOARD_Y,COLS,ROWS,SPIKE_X,BODY_WIDTH}=L,DT=1/120;
const M=typeof module!=="undefined"?require("./match.js"):root.KingMatch;
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function surface(p,nx,ny,penetration){
  p.x+=nx*penetration;p.y+=ny*penetration;
  const vn=p.vx*nx+p.vy*ny;
  if(vn<0){p.vx-=1.08*vn*nx;p.vy-=1.08*vn*ny;const tx=-ny,ty=nx,vt=p.vx*tx+p.vy*ty;p.vx-=vt*tx*.012;p.vy-=vt*ty*.012;}
}
function rect(p,x,y,w,h){
  const cx=Math.max(x,Math.min(x+w,p.x)),cy=Math.max(y,Math.min(y+h,p.y));let dx=p.x-cx,dy=p.y-cy,d2=dx*dx+dy*dy;
  if(d2>=p.r*p.r)return;
  if(d2>1e-9){const d=Math.sqrt(d2);surface(p,dx/d,dy/d,p.r-d);}
  else if(p.py!=null&&p.py<=y+1){surface(p,0,-1,p.y-y+p.r);}
  else if(p.py!=null&&p.py>=y+h-1){surface(p,0,1,y+h-p.y+p.r);}
  else if(p.px!=null&&p.px<=x+1){surface(p,-1,0,p.x-x+p.r);}
  else if(p.px!=null&&p.px>=x+w-1){surface(p,1,0,x+w-p.x+p.r);}
  else{const ds=[p.x-x,x+w-p.x,p.y-y,y+h-p.y],k=ds.indexOf(Math.min(...ds));surface(p,k===0?-1:k===1?1:0,k===2?-1:k===3?1:0,p.r+ds[k]);}
}
function segment(p,x1,y1,x2,y2){
  const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((p.x-x1)*dx+(p.y-y1)*dy)/(dx*dx+dy*dy)));
  const ox=p.x-(x1+dx*t),oy=p.y-(y1+dy*t),d=Math.hypot(ox,oy);
  if(d<p.r&&d>1e-8)surface(p,ox/d,oy/d,p.r-d);
}
function collideWorld(g,p){
  if(p.x-p.r<24)surface(p,1,0,24-(p.x-p.r));if(p.x+p.r>408)surface(p,-1,0,p.x+p.r-408);
  segment(p,24,150,366,232);
  rect(p,24,378,268,20);
  const penetration=g.shield.x-(p.x-p.r);
  if(p.y>231&&p.y<378&&p.x>=g.shield.x-1&&penetration>0){
    g.normalImpulse+=Math.max(0,g.shield.vx-p.vx)/4;
    g.compression+=penetration/4;
  }
  rect(p,g.shield.x-12,221,12,157);
  // The visible roof, shield and platform enclose the king's protected cavity.
  // Resolve at the entry surface, never allow dense grains behind the shield.
  const roof=150+(p.x-24)*82/342;
  if(p.x<g.shield.x&&p.y>roof-p.r&&p.y<398){
   if(p.px>=g.shield.x-p.r-1&&p.py>220)surface(p,1,0,g.shield.x+p.r-p.x);
   else surface(p,82/Math.hypot(342,82),-342/Math.hypot(342,82),(p.y-roof+p.r)*342/Math.hypot(342,82));
  }
  if(g.level.beam)rect(p,264,542,144,48);
  if(g.operation?.kind==='fall'){
    for(const tile of g.operation.tiles)if(Math.abs(p.x-(tile.x+24))<p.r+24&&Math.abs(p.y-(tile.y+24))<p.r+24)rect(p,tile.x,tile.y,48,48);
    return;
  }
  const minC=Math.max(0,Math.floor((p.x-p.r-BOARD_X)/CELL)),maxC=Math.min(COLS-1,Math.floor((p.x+p.r-BOARD_X)/CELL));
  const minR=Math.max(0,Math.floor((p.y-p.r-BOARD_Y)/CELL)),maxR=Math.min(ROWS-1,Math.floor((p.y+p.r-BOARD_Y)/CELL));
  for(let r=minR;r<=maxR;r++)for(let c=minC;c<=maxC;c++)if(g.board[r*COLS+c]!=null&&g.board[r*COLS+c]>=0)rect(p,BOARD_X+c*CELL,BOARD_Y+r*CELL,CELL,CELL);
}
const heads=new Int32Array(4096),links=new Int32Array(2000);
function pairs(particles){
 heads.fill(-1);const size=19,stride=32;
 for(let i=0;i<particles.length;i++){
  const p=particles[i],cx=Math.floor(p.x/size),cy=Math.floor(p.y/size)+16;
  for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++){
   const key=y*stride+x;if(key<0||key>=heads.length)continue;
   for(let j=heads[key];j!==-1;j=links[j]){const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,rr=p.r+q.r,d2=dx*dx+dy*dy;if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||.001,nx=d2?dx/d:1,ny=d2?dy/d:0,fix=(rr-d)*.5;p.x+=nx*fix;p.y+=ny*fix;q.x-=nx*fix;q.y-=ny*fix;
    const vn=(p.vx-q.vx)*nx+(p.vy-q.vy)*ny;if(vn<0){const imp=-vn*.52;p.vx+=imp*nx;p.vy+=imp*ny;q.vx-=imp*nx;q.vy-=imp*ny;}
    const slip=(p.vx-q.vx)*(-ny)+(p.vy-q.vy)*nx;p.spin=slip/p.r*.25;q.spin=slip/q.r*.25;
   }
  }
  const key=(Math.floor(p.y/size)+16)*stride+Math.floor(p.x/size);links[i]=key>=0&&key<heads.length?heads[key]:-1;if(key>=0&&key<heads.length)heads[key]=i;
 }
}
class Game{
 constructor(index=0){
  this.levelIndex=index;this.level=L.levels[index];this.board=[...this.level.board];this.state='ready';this.reason='';this.time=0;this.accumulator=0;this.collected=0;this.actions=0;this.operation=null;this.events=[];this.particles=[];this.cleared=0;this.random=random(this.level.seed);this.sourceEnabled=true;this.spawnClock=0;this.queued=0;this.supplied=0;this.spawned=0;this.contact=0;this.contactForce=0;this.normalImpulse=0;this.compression=0;this.shield={x:this.level.shieldStart,vx:0,mass:20,damping:22,resistance:this.level.resistance||95};this.clearance=this.shield.x-BODY_WIDTH-SPIKE_X;this.safeTime=0;this.remixes=2;this.hp=100;this.maxHp=100;this.hits=0;this.nextDamageAt=0;this.chain=0;
  for(let row=0,y=9;y<390;y+=12.8,row++)for(let x=32+(row%2)*7.4;x<401;x+=14.8){
   const roof=150+(Math.min(x,366)-24)*82/342;
   if(x>374||y<roof-8||x>this.shield.x+8&&y>roof+24)this.addParticle(x,y);
  }
  this.supplied=this.spawned;this.initialStock=this.spawned;this.initialUpper=this.particles.filter(p=>p.y<150).length;
 }
 addParticle(x,y){this.particles.push({id:this.spawned++,x,y,r:6.8+this.random()*.7,vx:0,vy:0,angle:this.random()*6.28,spin:0});}
 start(){if(this.state==='ready')this.state='playing';}
 swap(a,b){
  if(this.state!=='playing'||this.operation)return false;
  if(a<0||b<0||a>=56||b>=56||this.board[a]==null||this.board[b]==null||this.board[a]<0||this.board[b]<0||Math.abs(a%8-b%8)+Math.abs(Math.floor(a/8)-Math.floor(b/8))!==1)return false;
  const m=M.preview(this.board,a,b);this.chain=0;this.operation={kind:'swap',a,b,before:[...this.board],after:m?.after,matched:m?.cells||[],valid:!!m,started:this.time,switched:false,blasted:false};if(m)this.actions++;return !!m;
 }
 animateSwap(){
  const op=this.operation;if(!op)return;const age=this.time-op.started;
  if(op.kind==='fall'){
   let done=true;for(const tile of op.tiles){tile.y=Math.min(tile.targetY,tile.startY+650*age*age);if(tile.y<tile.targetY)done=false;}
   if(done){this.board=op.after;this.operation=null;this.events.push({type:'land'});this.checkCascade();}return;
  }
  if(op.valid){
   if(age>=.16&&!op.switched){this.board=[...op.after];op.switched=true;}
   if(age>=.34&&!op.blasted){op.blasted=true;for(const i of op.matched)this.board[i]=null;this.cleared+=op.matched.length;this.chain++;this.events.push({type:'match',indices:[...op.matched],colors:op.after,chain:this.chain});}
   if(age>=.48)this.beginFall();
  }else if(age>=.3){this.events.push({type:'invalid'});this.operation=null;}
 }
 beginFall(){
  const settled=M.gravity(this.board);
  if(!settled.moves.length){this.operation=null;this.checkCascade();return;}
  const destinations=new Map(settled.moves.map(m=>[m.from,m.to]));
  const tiles=[];for(let i=0;i<this.board.length;i++)if(this.board[i]!=null&&this.board[i]>=0){const to=destinations.get(i)??i,y=BOARD_Y+Math.floor(i/8)*CELL;tiles.push({from:i,to,color:this.board[i],x:BOARD_X+i%8*CELL,startY:y,y,targetY:BOARD_Y+Math.floor(to/8)*CELL});}
  this.operation={kind:'fall',started:this.time,after:settled.board,tiles,matched:[],valid:true,blasted:true};
 }
 checkCascade(){
  const hit=M.matches(this.board);
  if(hit.length)this.operation={kind:'cascade',started:this.time,after:[...this.board],matched:hit,valid:true,switched:true,blasted:false};
  else if(!M.legal(this.board).length)this.events.push({type:'stalled'});
 }
 hazard(){
  if(this.state!=='playing'||this.clearance>1e-6||this.time+1e-8<this.nextDamageAt)return;
  this.hp=Math.max(0,this.hp-12);this.hits++;this.nextDamageAt=this.time+.8;this.events.push({type:'hurt',hp:this.hp});
  if(this.hp===0){this.state='lost';this.reason='hp';this.sourceEnabled=false;this.events.push({type:'spikes'});}
 }
 remix(){
  if(this.state!=='playing'||this.operation||this.remixes<=0)return false;
  const b=M.paint(this.board,this.level.seed+this.spawned+this.remixes*7109);if(!b)return false;
  this.board=b;this.remixes--;this.events.push({type:'remix'});return true;
 }
 hint(){const p=M.plan(this.board,7,45);if(p?.path.length)return p.path[0];const all=M.legal(this.board);return all.length?[all[0].a,all[0].b]:[];}
 update(dt){if(this.state!=='playing')return;this.accumulator+=Math.min(.1,Math.max(0,dt));while(this.accumulator+1e-9>=DT&&this.state==='playing'){this.step();this.accumulator-=DT;}}
 capacity(){
  // Only connected empty board space can receive grains; sealed cavities do
  // not justify squeezing more particles into the reservoir.
  const reached=new Set,stack=[5,6,7].filter(i=>this.board[i]===null);
  if(this.operation?.kind!=='fall')while(stack.length){const i=stack.pop();if(reached.has(i))continue;reached.add(i);for(const j of [i%8?i-1:-1,i%8<7?i+1:-1,i>=8?i-8:-1,i+8])if(j>=0&&j<56&&this.board[j]===null)stack.push(j);}
  const shieldSpace=Math.max(0,this.level.shieldStart-this.shield.x)*147;
  return Math.min(1600,this.initialStock+145+Math.floor((shieldSpace+reached.size*CELL*CELL)/190));
 }
 emit(){
  if(!this.sourceEnabled)return;
  this.spawnClock+=this.level.rate*DT;
  while(this.spawnClock>=1){this.spawnClock--;this.supplied++;this.queued++;}
  if(this.queued>0&&this.particles.length<this.capacity()){
   for(let tryIndex=0;tryIndex<6;tryIndex++){const x=32+this.random()*366,y=8;if(this.particles.every(p=>(p.x-x)**2+(p.y-y)**2>216)){this.addParticle(x,y);this.queued--;break;}}
  }
 }
 step(){
  this.time+=DT;this.animateSwap();this.emit();this.normalImpulse=0;this.compression=0;
  for(const p of this.particles){p.px=p.x;p.py=p.y;p.vy=Math.min(570,p.vy+680*DT);p.vx*=.999;p.x+=p.vx*DT;p.y+=p.vy*DT;p.angle+=p.spin*DT;p.spin*=.995;}
  for(let pass=0;pass<8;pass++){pairs(this.particles);for(const p of this.particles)collideWorld(this,p);}
  const remaining=[];for(const p of this.particles){if(p.y-p.r>754){this.collected++;this.events.push({type:'drain',x:p.x,y:754});}else remaining.push(p);}this.particles=remaining;
  this.contact=remaining.filter(p=>p.y>231&&p.y<378&&p.x>=this.shield.x-1&&p.x-p.r<this.shield.x+1.5).length;
  // Static granular load comes from actual touching bodies; impulse/compression
  // add the dynamic part. Queued or merely existing stones exert no force.
  const load=this.contact*7+this.normalImpulse/DT*.018+this.compression*24;
  this.contactForce+=(load-this.contactForce)*.04;
  const s=this.shield,acc=(s.resistance-this.contactForce-s.damping*s.vx)/s.mass;
  s.vx=Math.max(-1.8,Math.min(2.4,s.vx+acc*DT));s.x+=s.vx*DT;
  if(s.x>=this.level.shieldStart){s.x=this.level.shieldStart;s.vx=Math.min(0,s.vx);}
  this.clearance=s.x-BODY_WIDTH-SPIKE_X;
  if(this.clearance<0){s.x=BODY_WIDTH+SPIKE_X;s.vx=Math.max(0,s.vx);this.clearance=0;}
  this.hazard();if(this.state==='lost')return;
  if(this.contactForce<s.resistance*.85&&this.clearance>12)this.safeTime+=DT;else this.safeTime=0;
  if(this.collected>=this.level.target&&this.safeTime>=2){this.state='won';this.sourceEnabled=false;}
 }
 snapshot(){return{level:this.levelIndex+1,state:this.state,hp:this.hp,maxHp:this.maxHp,hits:this.hits,stockFill:+(this.particles.filter(p=>p.y<150).length/this.initialUpper).toFixed(3),reason:this.reason,actions:this.actions,collected:this.collected,target:this.level.target,time:+this.time.toFixed(3),spawned:this.spawned,supplied:this.supplied,queued:this.queued,active:this.particles.length,valve:this.sourceEnabled,contact:this.contact,contactForce:+this.contactForce.toFixed(3),shield:{x:+this.shield.x.toFixed(3),velocity:+this.shield.vx.toFixed(3)},clearance:+this.clearance.toFixed(3),safeTime:+this.safeTime.toFixed(3),board:[...this.board],falling:this.operation?.kind==='fall'?this.operation.tiles.map(p=>({from:p.from,to:p.to,y:+p.y.toFixed(2),targetY:p.targetY})):[],phase:this.operation?{kind:this.operation.kind,valid:this.operation.valid,age:+(this.time-this.operation.started).toFixed(3),blasted:this.operation.blasted,matched:[...this.operation.matched]}:null,remixes:this.remixes,stars:this.state==='won'?(this.actions<=this.level.par?3:this.actions<=this.level.par+3?2:1):0};}
}
const api={Game};if(typeof module!=='undefined')module.exports=api;else root.KingEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
