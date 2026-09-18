(function(root){
'use strict';
const L=typeof module!=='undefined'?require('./levels.js'):root.KingLevels;
const {CELL,BOARD_X,BOARD_Y,COLS,ROWS,SPIKE_X,BODY_WIDTH}=L,DT=1/120;
// Require several rendered frames of unchanged, proven compression.
const CRUSH_HOLD=.05,MASONRY_LOAD=30000;
const G=typeof module!=='undefined'?require('./geometry.js'):root.KingGeometry;
const C=typeof module!=='undefined'?require('./clamp.js'):root.KingClamp;
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
function collideWorld(g,p){
  if(p.x-p.r<24)surface(p,1,0,24-(p.x-p.r));if(p.x+p.r>408)surface(p,-1,0,p.x+p.r-408);
  if(G.nearRamp(p))G.project(p,G.RAMP);
  if(g.feedGate&&p.x+p.r>338&&p.y+p.r>222&&p.y-p.r<306)G.project(p,g.feedGate);
  rect(p,24,378,268,20);
  const penetration=g.shield.x-(p.x-p.r);
  if(p.y>231&&p.y<378&&p.x>=g.shield.x-1&&penetration>0){
    g.normalImpulse+=Math.max(0,g.shield.vx-p.vx)/4;
    g.compression+=penetration/4;
  }
  const shield=g.shieldCollider();if(shield)rect(p,shield.x,shield.y,shield.w,shield.h);
  // The visible roof, shield and platform enclose the king's protected cavity.
  // Resolve at the entry surface, never allow dense grains behind the shield.
  const roof=G.rampTop(p.x);
  if(g.shieldLift>.999&&p.x<g.shield.x&&p.y>roof-p.r&&p.y<398){
   if(p.px>=g.shield.x-p.r-1&&p.py>220)surface(p,1,0,g.shield.x+p.r-p.x);
   else surface(p,G.ROOF_NORMAL.x,G.ROOF_NORMAL.y,(p.y-roof+p.r)*-G.ROOF_NORMAL.y);
  }
  if(g.level.beam)rect(p,G.BEAM.x,G.BEAM.y,G.BEAM.w,G.BEAM.h);
  if(g.operation?.kind==='fall'){
    for(const tile of g.operation.tiles)if(Math.abs(p.x-(tile.x+24))<p.r+24&&Math.abs(p.y-(tile.y+24))<p.r+24)rect(p,tile.x,tile.y,48,48);
    return;
  }
  const minC=Math.max(0,Math.floor((p.x-p.r-BOARD_X)/CELL)),maxC=Math.min(COLS-1,Math.floor((p.x+p.r-BOARD_X)/CELL));
  const minR=Math.max(0,Math.floor((p.y-p.r-BOARD_Y)/CELL)),maxR=Math.min(ROWS-1,Math.floor((p.y+p.r-BOARD_Y)/CELL));
  for(let r=minR;r<=maxR;r++)for(let c=minC;c<=maxC;c++)if(g.board[r*COLS+c]!=null&&g.board[r*COLS+c]>=0)rect(p,BOARD_X+c*CELL,BOARD_Y+r*CELL,CELL,CELL);
}
const heads=new Int32Array(4096);let links=new Int32Array(2000);
function pairs(particles){
 if(links.length<particles.length)links=new Int32Array(particles.length*2);
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
 constructor(index=0,options={}){
  this.levelIndex=index;this.level=L.levels[index];if(this.level.solution)M.remember(this.level.board,this.level.solution);this.board=[...this.level.board];this.state='ready';this.reason='';this.time=0;this.accumulator=0;this.collected=0;this.actions=0;this.operation=null;this.events=[];this.particles=[];this.cleared=0;this.random=random(this.level.seed);this.sourceEnabled=true;this.spawnClock=0;this.queued=0;this.supplied=0;this.spawned=0;this.contact=0;this.contactForce=0;this.normalImpulse=0;this.compression=0;this.shield={x:this.level.shieldStart,vx:0,mass:20,damping:22,resistance:this.level.resistance||95};this.clearance=this.shield.x-BODY_WIDTH-SPIKE_X;this.safeTime=0;this.remixes=2;this.hp=100;this.maxHp=100;this.hits=0;this.nextDamageAt=0;this.chain=0;this.initialGems=M.remaining(this.board);this.rallies=0;this.rallyUntil=0;this.rallyCooldown=0;this.lastHurt=-10;this.walkTime=0;this.rallySeed=options.rallySeed??Math.floor(Math.random()*4294967296);this.rallyRandom=random(this.rallySeed);this.recovery=null;this.recoveries=0;this.mechanicalTime=0;this.crushed=0;this.clamps=new Map;this.crushLog=[];this.guides=new Map;this.still=new Map;this.lastClampCheck=-1;this.shieldLift=1;this.calmFor=0;this.threat=true;this.gateLift=0;this.feedGate=null;this.behavior='brace';this.lastHurtMechanical=-10;
  for(let row=0,y=9;y<390;y+=12.8,row++)for(let x=32+(row%2)*7.4;x<401;x+=14.8){
   const roof=G.rampTop(Math.min(x,G.RAMP_BOUNDS.maxX));
   if(x>G.RAMP_BOUNDS.maxX+8||y<roof-8||x>this.shield.x+8&&y>roof+24)this.addParticle(x,y);
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
  const op=this.operation;if(!op)return;const age=this.time-op.started+(this.recovery?.elapsed||0);
  if(op.kind==='fall'){
   // Falling masonry cannot close a gap through a trapped grain. Pause the
   // connected fall briefly while downward compression rolls grains sideways.
   const moving=op.tiles.filter(t=>t.y<t.targetY-.0001).sort((a,b)=>b.y-a.y),contacts=[];
   const before=new Map(op.tiles.map(t=>[t,t.y]));
   for(const t of op.tiles)t.lastAdvance=0;
   for(const t of moving){const bottom=t.y+48,desired=Math.min(6,t.targetY-t.y,Math.max(0,650*age*age-(t.y-t.startY)));let advance=desired;
    // Each brick falls independently; only the actual brick or grain below
    // supports it. An obstructed column never suspends an unrelated column.
    for(const q of op.tiles)if(q!==t&&q.x===t.x&&q.y>=bottom-.001)advance=Math.min(advance,Math.max(0,q.y-bottom));
    for(const p of this.particles){
     const dx=Math.max(t.x-p.x,0,p.x-t.x-48);if(dx>=p.r-.001)continue;
     // The supporting point on a circular grain changes around a brick's
     // corner. Its bounding square must never become an invisible ledge.
     const gap=p.y-Math.sqrt(p.r*p.r-dx*dx)-bottom;
     if(gap>=-.01&&gap<advance+.02){advance=Math.min(advance,Math.max(0,gap-.02));contacts.push({t,p});}
    }
    t.y+=advance;t.lastAdvance=advance;
   }
   const supports=contacts.length?this.boxes():[];
   for(const {t,p} of contacts){
    // Heavy masonry transfers load through its actual circle contact normal.
    // A grain is dynamic matter, never an infinitely heavy support ledge.
    const cx=Math.max(t.x,Math.min(t.x+48,p.x)),ny=Math.max(0,p.y-(t.y+48)),nx=p.x-cx,length=Math.hypot(nx,ny)||1;
    p.vx=Math.max(-350,Math.min(350,p.vx+nx/length*MASONRY_LOAD*DT));
    p.vy=Math.min(570,p.vy+ny/length*MASONRY_LOAD*DT);
    if(this.guides.has(p.id))continue;let left=t.x,right=t.x+48;for(let n=0;n<moving.length;n++)for(const q of moving)if(Math.abs(before.get(q)-before.get(t))<.1&&q.x<=right&&q.x+48>=left){left=Math.min(left,q.x);right=Math.max(right,q.x+48);}
    const dl=left-p.r-24<0?Infinity:p.x-left,dr=right+p.r>408?Infinity:right-p.x;let dir=dl<dr?-1:1;
    // Test local downward clearance before choosing a rolling force. Near a
    // neighboring brick corner the open route can be inside this same column,
    // even when the wall prevents leaving the column on that side.
    const blocked=dx=>{const q={x:p.x+dx,y:p.y+4,r:p.r};return Math.max(0,24-q.x+q.r,q.x+q.r-408)+supports.reduce((sum,b)=>sum+G.boxDepth(q,b),0);};
    const down=blocked(0),a=blocked(-2),b=blocked(2);
    if(down<.00001)dir=0;else if(Math.abs(a-b)>.00001)dir=a<b?-1:1;
    p.vx=Math.max(-350,Math.min(350,p.vx+dir*4800*DT));
   }
   const done=op.tiles.every(t=>t.y>=t.targetY-.0001),progress=op.tiles.reduce((sum,t)=>sum+t.y-t.startY,0);
   if(op.progressAt==null||progress-(op.progressTravel||0)>.5){op.progressAt=this.mechanicalTime;op.progressTravel=progress;}
   if(!done&&!this.recovery&&(this.mechanicalTime-op.progressAt>.7||age>2.5)){this.beginRecovery();return;}
   if(done){this.board=op.after;this.operation=null;if(this.recovery)this.events.push({type:'recovered'});this.recovery=null;this.clamps.clear();this.guides.clear();this.events.push({type:'land'});this.checkCascade();}return;
  }
  if(op.valid){
   if(age>=.16&&!op.switched){this.board=[...op.after];op.switched=true;}
   if(age>=.34&&!op.blasted){op.blasted=true;for(const i of op.matched)this.board[i]=null;this.cleared+=op.matched.length;this.chain++;this.events.push({type:'match',indices:[...op.matched],colors:op.after,chain:this.chain});}
   if(age>=.48)this.beginFall();
  }else if(age>=.3){this.events.push({type:'invalid'});this.operation=null;}
 }
 // Recovery pauses danger, not matter. Only proven persistent two-brick
 // clamps may fracture; every open or uncertain route keeps its gold.
 beginRecovery(){
  if(this.operation?.kind!=='fall'||this.recovery)return;
  this.recovery={elapsed:0,batch:++this.recoveries};this.events.push({type:'recovery'});
 }
 recoverStep(){
  this.recovery.elapsed+=DT;this.animateSwap();this.updateGate();this.emit();this.particleStep();this.finishConstraints();
  if(this.recovery){for(let n=0;n<8&&this.recovery;n++){if(!this.resolveClamps())break;this.animateSwap();}}else this.checkOutcome();
 }
 resolveClamps(){
  const op=this.operation;if(op?.kind!=='fall')return;
  const moving=op.tiles.filter(t=>t.y<t.targetY-.001),boxes=this.boxes();
  const sweeps=moving.map(t=>({x:t.x,y:t.y,w:48,h:t.targetY-t.y+48}));
  const live=new Set;
  // Contact and displacement must persist each physics substep, not just at
  // the slower geometry-search cadence.
  for(const t of moving)for(const p of this.particles){
   const dx=Math.max(t.x-p.x,0,p.x-t.x-48);
   if(dx>=p.r-.001||p.y<t.y+48||Math.abs(p.y-Math.sqrt(p.r*p.r-dx*dx)-t.y-48)>.6)continue;
   const supported=C.support(p,op.tiles,this.particles,t);if(!supported)continue;
   // The chain proves support; fracture only the grain touching the upper brick.
   for(const id of [p.id]){
    const q=this.particles.find(q=>q.id===id),key=id+':'+t.from+':'+supported.supportKey;live.add(key);
    let v=this.clamps.get(key);
    // Preserve continuous static load while the brick closes its contact tolerance;
    // any new downward progress by the grain itself restarts confirmation.
    if(!v||q.y-(v.maxY??v.y)>1e-7||Math.abs(v.topY-t.y)>.6){v={id,upper:t.from,lower:supported.lower.from,since:this.mechanicalTime,x:q.x,y:q.y,maxY:Math.max(v?.maxY??q.y,q.y),topY:t.y};this.clamps.set(key,v);}
    v.lower=supported.lower.from;v.supportKey=supported.supportKey;v.chain=supported.paths[id];v.contactId=p.id;v.topGap=p.y-Math.sqrt(p.r*p.r-dx*dx)-t.y-48;
   }
  }

  for(const key of this.clamps.keys())if(!live.has(key))this.clamps.delete(key);
  if(this.mechanicalTime-this.lastClampCheck<(this.clamps.size?1/60:.1))return;this.lastClampCheck=this.mechanicalTime;
  const checkGuides=this.mechanicalTime-(this.lastGuideCheck??-1)>=.1;if(checkGuides){this.lastGuideCheck=this.mechanicalTime;this.guides.clear();}
  const bins=new Map;for(const p of this.particles){const key=Math.floor(p.x/20)+':'+Math.floor(p.y/20);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(p);}
  const vacancy=(q,p)=>{const x=Math.floor(q.x/20),y=Math.floor(q.y/20);for(let a=x-1;a<=x+1;a++)for(let b=y-1;b<=y+1;b++)for(const other of bins.get(a+':'+b)||[])if(other!==p&&Math.hypot(q.x-other.x,q.y-other.y)<q.r+other.r+.02)return false;return true;};
  for(const p of [...this.particles].sort((a,b)=>a.y-b.y)){
   if(!sweeps.some(b=>G.boxDepth(p,b)>0)||!checkGuides&&![...this.clamps.values()].some(v=>v.id===p.id))continue;
   const destination=q=>q.y>=754||q.y<=398||(!sweeps.some(b=>G.boxDepth(q,b)>0)&&vacancy(q,p));
   let optimistic=C.escape(p,boxes,sweeps,{optimistic:true,gravity:true,destination}),route;
   if(optimistic.status!=='closed'&&[...this.clamps.values()].some(v=>v.id===p.id)){
    route=C.escape(p,boxes,sweeps,{gravity:true,destination});
    if(route.status!=='open')for(const step of [2,1,.5]){
     optimistic=C.escape(p,boxes,sweeps,{optimistic:true,gravity:true,step,destination});
     if(optimistic.status==='closed')break;
    }
   }
   if(optimistic.status!=='closed'){
    for(const v of this.clamps.values())if(v.id===p.id)v.blockedSince=null;
    const previous=this.still.get(p.id);this.still.set(p.id,{x:p.x,y:p.y});
    if(!previous||p.y>previous.y+1e-7||Math.hypot(p.x-previous.x,p.y-previous.y)>2)continue;
    route=route||C.escape(p,boxes,sweeps,{gravity:true,destination});
    if(route.status==='open'&&route.route.length){const next=route.route[0];if((p.x-previous.x)*(next.x-p.x)+(p.y-previous.y)*(next.y-p.y)<=1e-7)this.guides.set(p.id,route.route);}
    continue;
   }
   const v=[...this.clamps.values()].find(v=>v.id===p.id);
   const t=v&&moving.find(t=>t.from===v.upper);
   if(!v)continue;if(v.blockedSince==null)v.blockedSince=this.mechanicalTime;
   if(this.mechanicalTime-v.since<CRUSH_HOLD||this.mechanicalTime-v.blockedSince<CRUSH_HOLD)continue;
   const proof={...v,at:this.mechanicalTime,duration:this.mechanicalTime-v.since,escape:'gravity-blocked',blockedDuration:this.mechanicalTime-v.blockedSince,displacement:Math.hypot(v.x-p.x,v.y-p.y),topGap:v.topGap};
   this.particles=this.particles.filter(q=>q!==p);this.crushed++;this.crushLog.push(proof);this.events.push({type:'crush',x:p.x,y:p.y,r:p.r,proof});
   // Never execute a stale batch. The next physics step must re-establish
   // support, progress and escape after this single particle leaves.
   for(const [key,v] of this.clamps)if(v.id===p.id)this.clamps.delete(key);this.guides.clear();this.lastClampCheck=-1;return true;
  }
 }
 particleStep(){
  this.normalImpulse=0;this.compression=0;
  const main=this.particles;
  const sweeps=this.guides.size&&this.operation?.kind==='fall'?this.operation.tiles.filter(t=>t.y<t.targetY-.001).map(t=>({x:t.x,y:t.y,w:48,h:t.targetY-t.y+48})):[];
  for(const p of main){
   let path=this.guides.get(p.id);
   if(path){const next=path[0],progress=p.py!=null&&(p.y>p.py+1e-7||next&&(p.x-p.px)*(next.x-p.x)+(p.y-p.py)*(next.y-p.y)>1e-7);
    if(progress||!sweeps.some(b=>G.boxDepth(p,b)>0)){this.guides.delete(p.id);path=null;}
   }
   if(path){while(path.length&&(Math.hypot(path[0].x-p.x,path[0].y-p.y)<1.5||p.px!=null&&((path[0].x-p.px)*(path[0].x-p.x)+(path[0].y-p.py)*(path[0].y-p.y))<=0))path.shift();if(!path.length)this.guides.delete(p.id);}
   const guide=path?.[0];
   if(guide){const dx=guide.x-p.x,dy=guide.y-p.y,d=Math.hypot(dx,dy);if(d>.5){const q={x:p.x+dx/d*.5,y:p.y+dy/d*.5,r:p.r};if(!this.boxes().some(b=>G.boxDepth(q,b)>.001)){p.vx=Math.max(-350,Math.min(350,p.vx+dx/d*4800*DT));p.vy=Math.max(-140,Math.min(570,p.vy+dy/d*4800*DT));}else this.guides.delete(p.id);}}
   p.px=p.x;p.py=p.y;p.vy=Math.min(570,p.vy+680*DT);p.vx*=.999;p.x+=p.vx*DT;p.y+=p.vy*DT;p.angle+=p.spin*DT;p.spin*=.995;
  }
  for(let pass=0;pass<8;pass++){pairs(main);for(const p of main)collideWorld(this,p);}
  this.particles=this.particles.filter(p=>{if(p.y-p.r>754){this.collected++;this.events.push({type:'drain',x:p.x,y:754});return false;}return true;});
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

 }
 checkOutcome(){
  if(this.state!=='playing'||this.hp<=0||this.operation||this.recovery||this.checkedBoard===this.board)return;
  // Only a settled board is terminal. Pending automatic matches must finish
  // before testing whether the player has any effective exchange left.
  if(M.matches(this.board).length){this.checkCascade();return;}
  this.checkedBoard=this.board;
  const remaining=M.remaining(this.board);
  if(remaining===0||M.legal(this.board).length===0){
   this.state='won';this.reason=remaining?'no-moves':'cleared';this.rallyUntil=0;this.sourceEnabled=false;
  }
 }
 hazard(){
  if(this.state!=='playing'||this.clearance>1e-6||this.time+1e-8<this.nextDamageAt)return;
  this.hp=Math.max(0,this.hp-12);this.hits++;this.nextDamageAt=this.time+.8;this.lastHurt=this.time;this.lastHurtMechanical=this.mechanicalTime;this.events.push({type:'hurt',hp:this.hp});
  if(this.hp===0){this.state='lost';this.rallyUntil=0;this.reason='hp';this.sourceEnabled=false;this.events.push({type:'spikes'});return;}
  if(this.hp<=40&&this.rallies<2&&this.time>=this.rallyCooldown&&this.rallyRandom()<.35){this.rallies++;this.rallyUntil=this.time+2.2;this.rallyCooldown=this.time+8;this.events.push({type:'rally'});}
 }
 remix(){
  if(this.state!=='playing'||this.operation||this.remixes<=0)return false;
  const candidate=M.paintSolvable(this.board,this.level.seed+this.spawned+this.remixes*7109);if(!candidate){this.events.push({type:'remix-miss'});return false;}
  this.board=candidate.board;this.remixes--;this.events.push({type:'remix'});return true;
 }
 hint(){const p=M.solveClear(this.board,2500);if(p?.path.length)return p.path[0];const all=M.legal(this.board);return all.length?[all[0].a,all[0].b]:[];}
 update(dt){if(this.state!=='playing'&&this.state!=='won')return;this.accumulator+=Math.min(.1,Math.max(0,dt));while(this.accumulator+1e-9>=DT){this.step();this.accumulator-=DT;if(this.state==='lost')break;}}
 capacity(){
  // Only connected empty board space can receive grains; sealed cavities do
  // not justify squeezing more particles into the reservoir.
  const reached=new Set,stack=[5,6,7].filter(i=>this.board[i]===null);
  if(this.operation?.kind!=='fall')while(stack.length){const i=stack.pop();if(reached.has(i))continue;reached.add(i);for(const j of [i%8?i-1:-1,i%8<7?i+1:-1,i>=8?i-8:-1,i+8])if(j>=0&&j<56&&this.board[j]===null)stack.push(j);}
  let openArea=reached.size*CELL*CELL;
  if(this.operation?.kind==='fall'){
   // Sample the actual moving brick positions, not their old board cells.
   // Flood only grain-sized space connected to the upper chute.
   if(!this.fallCapacity||this.fallCapacity.op!==this.operation||this.mechanicalTime-this.fallCapacity.at>=.1){
    const size=12,cols=32,rows=28,boxes=this.boxes(),free=new Uint8Array(cols*rows),seen=new Set,queue=[];
    for(let i=0;i<free.length;i++){const p={x:24+(i%cols+.5)*size,y:398+(Math.floor(i/cols)+.5)*size,r:7.5};free[i]=!boxes.some(b=>G.boxDepth(p,b)>0);if(i<cols&&p.x>292+7.5&&free[i])queue.push(i);}
    while(queue.length){const i=queue.pop();if(seen.has(i))continue;seen.add(i);for(const j of [i%cols?i-1:-1,i%cols<cols-1?i+1:-1,i-cols,i+cols])if(j>=0&&j<free.length&&free[j]&&!seen.has(j))queue.push(j);}
    this.fallCapacity={op:this.operation,at:this.mechanicalTime,area:seen.size*size*size};
   }
   openArea=this.fallCapacity.area;
  }
  const shieldSpace=Math.max(0,this.level.shieldStart-this.shield.x)*147;
  return Math.min(1600,this.initialStock+145+Math.floor((shieldSpace+openArea)/190));
 }
 emit(){
  if(!this.sourceEnabled)return;
  this.spawnClock+=this.level.rate*DT;
  while(this.spawnClock>=1){this.spawnClock--;this.supplied++;this.queued++;}
  if(this.queued>0&&this.particles.length<3200&&this.particles.filter(p=>!p.tray).length<this.capacity()){
   for(let tryIndex=0;tryIndex<6;tryIndex++){const x=32+this.random()*366,y=8;if(this.particles.every(p=>p.tray||(p.x-x)**2+(p.y-y)**2>216)){this.addParticle(x,y);this.queued--;break;}}
  }
 }
 step(){
  this.mechanicalTime+=DT;
  if(this.state==='won')return;
  if(this.recovery){this.recoverStep();return;}
  this.time+=DT;this.animateSwap();if(this.state!=='playing'||this.recovery)return;this.updateGate();this.emit();this.updateBehavior();this.particleStep();
  this.contact=this.particles.filter(p=>this.shieldLift>.95&&p.y>231&&p.y<378&&p.x>=this.shield.x-1&&p.x-p.r<this.shield.x+1.5).length;
  // Static granular load comes from actual touching bodies; impulse/compression
  // add the dynamic part. Queued or merely existing stones exert no force.
  const load=this.contact*7+this.normalImpulse/DT*.018+this.compression*24;
  this.contactForce+=(load-this.contactForce)*.04;
  const s=this.shield,boost=this.time<this.rallyUntil,acc=(s.resistance+(boost?1450:0)-this.contactForce-s.damping*s.vx)/s.mass;
  s.vx=Math.max(-1.8,Math.min(boost?26:2.4,s.vx+acc*DT));s.x+=s.vx*DT;if(Math.abs(s.vx)>.1)this.walkTime+=DT;
  if(s.x>=this.level.shieldStart){s.x=this.level.shieldStart;s.vx=Math.min(0,s.vx);}
  this.clearance=s.x-BODY_WIDTH-SPIKE_X;
  if(this.clearance<0){s.x=BODY_WIDTH+SPIKE_X;s.vx=Math.max(0,s.vx);this.clearance=0;}
  this.finishConstraints();this.hazard();if(this.state==='lost')return;
  if(this.contactForce<s.resistance*.85&&this.clearance>12)this.safeTime+=DT;else this.safeTime=0;
  this.checkOutcome();
 }
 updateGate(){
  const next=Math.max(0,Math.min(1,this.gateLift+(this.recovery?1:-1)*DT));
  if(!next){this.gateLift=0;this.feedGate=null;return;}
  const a=Math.PI/2+next*Math.PI/2,dx=Math.cos(a),dy=Math.sin(a),nx=-dy*4,ny=dx*4,x=412,y=236,ex=x+dx*64,ey=y+dy*64;
  const poly=[[x+nx,y+ny],[x-nx,y-ny],[ex-nx,ey-ny],[ex+nx,ey+ny]],contacts=[];
  for(const p of this.particles)if(p.x+p.r>338&&p.y+p.r>222&&p.y-p.r<306){
   const q=G.gateContact({...p,px:p.x,py:p.y},poly);
   // A crowded corner stalls the hinge instead of sweeping through a grain.
   if(!q||Math.hypot(q.x-p.x,q.y-p.y)>1.25)return;
   if(q.x!==p.x||q.y!==p.y)contacts.push({p,q});
  }
  this.gateLift=next;this.feedGate=poly;
  for(const {p,q}of contacts){const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);surface(p,dx/d,dy/d,d);}
 }
 shieldVisual(lift=this.shieldLift){const scale=.45+.55*lift;return {x:this.shield.x-38-40*(1-lift),y:221+55*(1-lift),w:38*scale,h:157*scale,alpha:lift};}
 shieldCollider(lift=this.shieldLift){if(lift<=.001)return null;const v=this.shieldVisual(lift);return {x:v.x+v.w*26/38,y:v.y,w:v.w*12/38,h:v.h};}
 updateBehavior(){
  // Predict a swept circle for longer than the .18 s shield lift. Gold resting
  // above the solid roof cannot fall through it and is not an incoming threat.
  this.threat=this.particles.some(p=>{
   if(p.x<G.RAMP_BOUNDS.maxX-p.r&&p.y<G.rampTop(p.x)+16+p.r)return false;
   for(let t=0;t<=.32;t+=.02){const x=p.x+p.vx*t,y=p.y+p.vy*t+340*t*t;
    if(x+p.r>=this.shield.x-38&&x-p.r<=this.shield.x+12&&y+p.r>=221&&y-p.r<=378)return true;
   }return false;
  });
  if(this.threat||this.contact>0||this.contactForce>8)this.calmFor=0;else this.calmFor+=DT;
  const raised=this.threat||this.contact>0||this.calmFor<.9||this.time<this.rallyUntil;
  const next=Math.max(0,Math.min(1,this.shieldLift+(raised?DT/.18:-DT/.45)));
  const collider=this.shieldCollider(next);
  // Expanding a visible shield may not materialize inside a grain. Contact
  // pauses the pose until the incoming particle has rolled clear.
  if(next<=this.shieldLift||!collider||!this.particles.some(p=>G.boxDepth(p,collider)>.05))this.shieldLift=next;
  this.behavior=this.mechanicalTime-this.lastHurtMechanical<.85?'hurt':this.time<this.rallyUntil?'rally':this.shieldLift<.001?'observe':this.shieldLift<.999?(raised?'raise':'stow'):['brace','single','back'][Math.floor(this.time/2.4)%3];
 }
 characterFrame(){
  if(this.behavior==='hurt')return {sheet:'hurt',frame:Math.min(3,Math.floor((this.mechanicalTime-this.lastHurtMechanical)/.215))};
  if(this.behavior==='observe'||this.behavior==='stow')return {sheet:'idle',frame:this.behavior==='stow'?0:Math.floor(this.mechanicalTime/1.1)%4};
  if(this.behavior==='back'){const age=this.time%2.4;return {sheet:'back',frame:age<.16?2:[0,1,3,1][Math.floor((age-.16)*3)%4]};}
  if(this.behavior==='single')return {sheet:'single',frame:Math.floor(this.mechanicalTime*3)%4};
  return {sheet:'walk',frame:this.pose()};
 }
 boxes(){
  const boxes=[G.PLATFORM],shield=this.shieldCollider();if(shield)boxes.push(shield);if(this.level.beam)boxes.push(G.BEAM);
  if(this.operation?.kind==='fall')for(const t of this.operation.tiles)boxes.push({x:t.x,y:t.y,w:48,h:48});
  else for(let i=0;i<56;i++)if(this.board[i]!=null&&this.board[i]>=0)boxes.push({x:24+i%8*48,y:398+Math.floor(i/8)*48,w:48,h:48});return boxes;
 }
 finishConstraints(){
  const boxes=this.boxes();
  for(const p of this.particles){if(p.tray)continue;
   // The moving shield has advanced since the contact-force solve. Resolve its
   // new boundary and any connected brick seam before exposing the next frame.
   for(let pass=0;pass<2;pass++){G.rectUnion(p,boxes,24,408);if(G.nearRamp(p))G.project(p,G.RAMP);}
   if(this.feedGate&&p.x+p.r>338&&p.y+p.r>222&&p.y-p.r<306){const q=G.gateContact(p,this.feedGate);if(q){const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d)surface(p,dx/d,dy/d,d);}}
  }
 }
 overlap(){const boxes=this.boxes();let maximum=0;for(const p of this.particles){if(p.tray&&(p.z||0)-p.r>=8)continue;for(const b of boxes)maximum=Math.max(maximum,G.boxDepth(p,b));if(G.nearRamp(p))maximum=Math.max(maximum,G.contact(p,G.RAMP).depth);if(this.feedGate)maximum=Math.max(maximum,G.contact(p,this.feedGate).depth);}return maximum;}
 pose(){if(this.time<this.rallyUntil)return this.rallyUntil-this.time>1.95?6:7;if(this.time-this.lastHurt<.5)return 5;if(this.state==='playing'&&Math.abs(this.shield.vx)>.1)return 1+Math.floor(this.walkTime*6)%4;return 0;}
 snapshot(){return{gateLift:this.gateLift,feedGate:this.feedGate,level:this.levelIndex+1,state:this.state,hp:this.hp,maxHp:this.maxHp,hits:this.hits,remaining:M.remaining(this.board),initialGems:this.initialGems,rallyActive:this.time<this.rallyUntil,rallyRemaining:Math.max(0,this.rallyUntil-this.time),rallies:this.rallies,rallySeed:this.rallySeed,pose:this.pose(),stockFill:+(this.particles.filter(p=>!p.tray&&p.y<150).length/this.initialUpper).toFixed(3),reason:this.reason,actions:this.actions,collected:this.collected,crushed:this.crushed,clampCandidates:[...this.clamps.values()].map(v=>({...v,duration:this.mechanicalTime-v.since})),crushLog:this.crushLog.slice(-20),behavior:this.behavior,characterFrame:this.characterFrame(),shieldVisual:this.shieldVisual(),shieldCollider:this.shieldCollider(),shieldLift:this.shieldLift,threat:this.threat,calmFor:this.calmFor,target:this.level.target,time:+this.time.toFixed(3),spawned:this.spawned,supplied:this.supplied,queued:this.queued,active:this.particles.length,mainActive:this.particles.filter(p=>!p.tray).length,trayActive:this.particles.filter(p=>p.tray).length,recoveries:this.recoveries,recovery:this.recovery?{elapsed:+this.recovery.elapsed.toFixed(3),batch:this.recovery.batch}:null,mechanicalTime:+this.mechanicalTime.toFixed(3),valve:this.sourceEnabled,contact:this.contact,contactForce:+this.contactForce.toFixed(3),shield:{x:+this.shield.x.toFixed(3),velocity:+this.shield.vx.toFixed(3)},clearance:+this.clearance.toFixed(3),safeTime:+this.safeTime.toFixed(3),board:[...this.board],falling:this.operation?.kind==='fall'?this.operation.tiles.map(p=>({from:p.from,to:p.to,y:+p.y.toFixed(2),targetY:p.targetY})):[],phase:this.operation?{kind:this.operation.kind,valid:this.operation.valid,age:+(this.time-this.operation.started).toFixed(3),blasted:this.operation.blasted,matched:[...this.operation.matched]}:null,remixes:this.remixes,stars:this.state==='won'?(this.actions<=this.level.par?3:this.actions<=this.level.par+3?2:1):0};}
}
const api={Game};if(typeof module!=='undefined')module.exports=api;else root.KingEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
