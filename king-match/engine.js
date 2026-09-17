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
  else{const ds=[p.x-x,x+w-p.x,p.y-y,y+h-p.y],k=ds.indexOf(Math.min(...ds));surface(p,k===0?-1:k===1?1:0,k===2?-1:k===3?1:0,p.r+ds[k]);}
}
function segment(p,x1,y1,x2,y2){
  const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((p.x-x1)*dx+(p.y-y1)*dy)/(dx*dx+dy*dy)));
  const ox=p.x-(x1+dx*t),oy=p.y-(y1+dy*t),d=Math.hypot(ox,oy);
  if(d<p.r&&d>1e-8)surface(p,ox/d,oy/d,p.r-d);
}
function collideWorld(g,p){
  rect(p,0,-100,24,1000);rect(p,408,-100,24,1000);
  segment(p,24,150,326,232);
  rect(p,24,378,268,20);
  const penetration=g.shield.x-(p.x-p.r);
  if(p.y>231&&p.y<378&&p.x>=g.shield.x-1&&penetration>0){
    g.normalImpulse+=Math.max(0,g.shield.vx-p.vx)/4;
    g.compression+=penetration/4;
  }
  rect(p,g.shield.x-12,231,12,147);
  if(g.level.beam){segment(p,264,590,408,545);rect(p,264,590,144,1);}
  const minC=Math.max(0,Math.floor((p.x-p.r-BOARD_X)/CELL)),maxC=Math.min(COLS-1,Math.floor((p.x+p.r-BOARD_X)/CELL));
  const minR=Math.max(0,Math.floor((p.y-p.r-BOARD_Y)/CELL)),maxR=Math.min(ROWS-1,Math.floor((p.y+p.r-BOARD_Y)/CELL));
  for(let r=minR;r<=maxR;r++)for(let c=minC;c<=maxC;c++)if(g.board[r*COLS+c]!=null&&g.board[r*COLS+c]>=0)rect(p,BOARD_X+c*CELL,BOARD_Y+r*CELL,CELL,CELL);
}
function pairs(particles){
  const buckets=new Map(),size=19;
  for(let i=0;i<particles.length;i++){const p=particles[i],cx=Math.floor(p.x/size),cy=Math.floor(p.y/size);for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++){const list=buckets.get(x+','+y);if(!list)continue;for(const j of list){const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,rr=p.r+q.r,d2=dx*dx+dy*dy;if(d2>=rr*rr)continue;const d=Math.sqrt(d2)||.001,nx=d2?dx/d:1,ny=d2?dy/d:0,fix=(rr-d)*.5;p.x+=nx*fix;p.y+=ny*fix;q.x-=nx*fix;q.y-=ny*fix;const vn=(p.vx-q.vx)*nx+(p.vy-q.vy)*ny;if(vn<0){const imp=-vn*.52;p.vx+=imp*nx;p.vy+=imp*ny;q.vx-=imp*nx;q.vy-=imp*ny;}const slip=(p.vx-q.vx)*(-ny)+(p.vy-q.vy)*nx;p.spin=slip/p.r*.25;q.spin=slip/q.r*.25;}}
    const key=cx+','+cy;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);
  }
}
class Game{
 constructor(index=0){
  this.levelIndex=index;this.level=L.levels[index];this.board=[...this.level.board];this.state='ready';this.reason='';this.time=0;this.accumulator=0;this.collected=0;this.actions=0;this.operation=null;this.events=[];this.particles=[];this.cleared=0;this.random=random(this.level.seed);this.sourceEnabled=true;this.spawnClock=0;this.queued=0;this.supplied=0;this.spawned=0;this.contact=0;this.contactForce=0;this.normalImpulse=0;this.compression=0;this.shield={x:this.level.shieldStart,vx:0,mass:20,damping:18,resistance:36};this.clearance=this.shield.x-BODY_WIDTH-SPIKE_X;this.safeTime=0;this.remixes=2;
  for(let i=0;i<this.level.initial;i++)this.addParticle(307+(i%6)*17,368-Math.floor(i/6)*16);this.supplied=this.spawned;
 }
 addParticle(x,y){this.particles.push({id:this.spawned++,x,y,r:6.8+this.random()*.7,vx:0,vy:0,angle:this.random()*6.28,spin:0});}
 start(){if(this.state==='ready')this.state='playing';}
 swap(a,b){
  if(this.state!=='playing'||this.operation)return false;
  if(a<0||b<0||a>=56||b>=56||this.board[a]==null||this.board[b]==null||this.board[a]<0||this.board[b]<0||Math.abs(a%8-b%8)+Math.abs(Math.floor(a/8)-Math.floor(b/8))!==1)return false;
  const m=M.preview(this.board,a,b);this.operation={a,b,before:[...this.board],after:m?.after,matched:m?.cells||[],valid:!!m,started:this.time,switched:false,blasted:false};if(m)this.actions++;return !!m;
 }
 animateSwap(){
  const op=this.operation;if(!op)return;const age=this.time-op.started;
  if(op.valid){
   if(age>=.16&&!op.switched){this.board=[...op.after];op.switched=true;}
   if(age>=.34&&!op.blasted){op.blasted=true;for(const i of op.matched)this.board[i]=null;this.cleared+=op.matched.length;this.events.push({type:'match',indices:[...op.matched],colors:op.after});}
   if(age>=.58){this.operation=null;if(!M.legal(this.board).length)this.events.push({type:'stalled'});}
  }else if(age>=.3){this.events.push({type:'invalid'});this.operation=null;}
 }
 remix(){
  if(this.state!=='playing'||this.operation||this.remixes<=0)return false;
  const b=M.paint(this.board,this.level.seed+this.spawned+this.remixes*7109);if(!b)return false;
  this.board=b;this.remixes--;this.events.push({type:'remix'});return true;
 }
 hint(){const p=M.plan(this.board,7,45);if(p?.path.length)return p.path[0];const all=M.legal(this.board);return all.length?[all[0].a,all[0].b]:[];}
 update(dt){if(this.state!=='playing')return;this.accumulator+=Math.min(.1,Math.max(0,dt));while(this.accumulator+1e-9>=DT&&this.state==='playing'){this.step();this.accumulator-=DT;}}
 emit(){
  if(!this.sourceEnabled)return;
  this.spawnClock+=this.level.rate*DT;
  while(this.spawnClock>=1){this.spawnClock--;this.supplied++;this.queued++;}
  if(this.queued>0&&this.particles.length<700){
   for(let tryIndex=0;tryIndex<6;tryIndex++){const x=40+this.random()*220,y=18;if(this.particles.every(p=>(p.x-x)**2+(p.y-y)**2>260)){this.addParticle(x,y);this.queued--;break;}}
  }
 }
 step(){
  this.time+=DT;this.animateSwap();this.emit();this.normalImpulse=0;this.compression=0;
  for(const p of this.particles){p.vy=Math.min(570,p.vy+680*DT);p.vx*=.999;p.x+=p.vx*DT;p.y+=p.vy*DT;p.angle+=p.spin*DT;p.spin*=.995;}
  for(let pass=0;pass<4;pass++){pairs(this.particles);for(const p of this.particles)collideWorld(this,p);}
  const remaining=[];for(const p of this.particles){if(p.y-p.r>754){this.collected++;this.events.push({type:'drain',x:p.x,y:754});}else remaining.push(p);}this.particles=remaining;
  this.contact=remaining.filter(p=>p.y>231&&p.y<378&&p.x>=this.shield.x-1&&p.x-p.r<this.shield.x+1.5).length;
  // Static granular load comes from actual touching bodies; impulse/compression
  // add the dynamic part. Queued or merely existing stones exert no force.
  const load=this.contact*7+this.normalImpulse/DT*.018+this.compression*24;
  this.contactForce+=(load-this.contactForce)*.04;
  const s=this.shield,acc=(s.resistance-this.contactForce-s.damping*s.vx)/s.mass;
  s.vx=Math.max(-2.1,Math.min(1.8,s.vx+acc*DT));s.x+=s.vx*DT;
  if(s.x>=this.level.shieldStart){s.x=this.level.shieldStart;s.vx=Math.min(0,s.vx);}
  this.clearance=s.x-BODY_WIDTH-SPIKE_X;
  // King rear intersects the fixed spike tips at y=322/344.
  if(this.clearance<=0){this.state='lost';this.reason='spikes';this.sourceEnabled=false;this.events.push({type:'spikes'});return;}
  if(this.contactForce<32&&this.clearance>24)this.safeTime+=DT;else this.safeTime=0;
  if(this.collected>=this.level.target&&this.safeTime>=2){this.state='won';this.sourceEnabled=false;}
 }
 snapshot(){return{level:this.levelIndex+1,state:this.state,reason:this.reason,actions:this.actions,collected:this.collected,target:this.level.target,time:+this.time.toFixed(3),spawned:this.spawned,supplied:this.supplied,queued:this.queued,active:this.particles.length,valve:this.sourceEnabled,contact:this.contact,contactForce:+this.contactForce.toFixed(3),shield:{x:+this.shield.x.toFixed(3),velocity:+this.shield.vx.toFixed(3)},clearance:+this.clearance.toFixed(3),safeTime:+this.safeTime.toFixed(3),board:[...this.board],phase:this.operation?{valid:this.operation.valid,age:+(this.time-this.operation.started).toFixed(3),blasted:this.operation.blasted,matched:[...this.operation.matched]}:null,remixes:this.remixes,stars:this.state==='won'?(this.actions<=this.level.par?3:this.actions<=this.level.par+3?2:1):0};}
}
const api={Game};if(typeof module!=='undefined')module.exports=api;else root.KingEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
