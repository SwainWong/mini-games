(function(root){
'use strict';
const L=typeof module!=='undefined'?require('./levels.js'):root.KingLevels;
const {CELL,BOARD_X,BOARD_Y,COLS,ROWS}=L,DT=1/120;
function groupAt(board,index,cols=COLS){
  if(index<0||index>=board.length||board[index]==null||board[index]<0)return [];
  const color=board[index],seen=new Set([index]),queue=[index];
  for(let n=0;n<queue.length;n++){const i=queue[n],c=i%cols;for(const j of [c?i-1:-1,c<cols-1?i+1:-1,i-cols,i+cols])if(j>=0&&j<board.length&&!seen.has(j)&&board[j]===color){seen.add(j);queue.push(j);}}
  return queue;
}
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
  segment(p,24,150,284,230);
  rect(p,24,378,242,20);rect(p,250,262,16,116);
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
    this.levelIndex=index;this.level=L.levels[index];this.board=[...this.level.board];this.moves=this.level.moves;this.state='ready';this.reason='';this.time=0;this.accumulator=0;this.collected=0;this.health=100;this.contact=0;this.pressure=0;this.lastDrain=0;this.exhaustedAt=null;this.events=[];this.particles=[];this.cleared=0;
    const rnd=random(this.level.seed);
    for(let i=0;i<this.level.total;i++)this.particles.push({id:i,x:38+i%22*16.6+(rnd()-.5)*1.2,y:18+Math.floor(i/22)*17,r:6.8+rnd()*.8,vx:0,vy:0,angle:rnd()*Math.PI*2,spin:0});
  }
  start(){if(this.state==='ready')this.state='playing';}
  clear(index){
    if(this.state!=='playing'||this.moves<=0)return [];
    const group=groupAt(this.board,index);if(group.length<2)return [];
    for(const i of group)this.board[i]=null;this.moves--;this.cleared+=group.length;
    if(this.moves===0||!this.hasMoves())this.exhaustedAt=this.time;
    return group;
  }
  hasMoves(){return this.board.some((v,i)=>v!=null&&v>=0&&((i%COLS<COLS-1&&this.board[i+1]===v)||this.board[i+COLS]===v));}
  hint(){for(const i of this.level.solution){const g=groupAt(this.board,i);if(g.length>=2)return g;}return [];}
  update(dt){
    if(this.state!=='playing')return;
    this.accumulator+=Math.min(.1,Math.max(0,dt));
    while(this.accumulator+1e-9>=DT&&this.state==='playing'){this.step();this.accumulator-=DT;}
  }
  step(){
    this.time+=DT;
    for(const p of this.particles){p.vy=Math.min(570,p.vy+680*DT);p.vx*=.999;p.x+=p.vx*DT;p.y+=p.vy*DT;p.angle+=p.spin*DT;p.spin*=.995;}
    for(let pass=0;pass<4;pass++){pairs(this.particles);for(const p of this.particles)collideWorld(this,p);}
    const remaining=[];
    for(const p of this.particles){if(p.y-p.r>754){this.collected++;this.lastDrain=this.time;this.events.push({type:'drain',x:p.x,y:754});}else remaining.push(p);}
    this.particles=remaining;
    this.contact=remaining.filter(p=>p.y>=262&&p.y<=378&&p.x>=266&&p.x-p.r<268.5).length;
    this.pressure+=(this.contact-this.pressure)*.045;
    if(this.time>12){if(this.pressure>1.5)this.health=Math.max(0,this.health-(this.pressure-1.5)*(this.levelIndex===0?.55:.75)*DT);else if(this.pressure<.5)this.health=Math.min(100,this.health+2*DT);}
    if(this.collected>=this.level.target){this.state='won';return;}
    if(this.health<=0){this.state='lost';this.reason='shield';return;}
    if(this.exhaustedAt!=null){const waited=this.time-this.exhaustedAt,quiet=this.time-this.lastDrain,mean=remaining.reduce((s,p)=>s+Math.hypot(p.vx,p.vy),0)/Math.max(1,remaining.length);if(waited>=10||(waited>=3&&quiet>=3&&mean<12)){this.state='lost';this.reason='moves';}}
  }
  snapshot(){return{level:this.levelIndex+1,state:this.state,reason:this.reason,moves:this.moves,collected:this.collected,total:this.level.total,target:this.level.target,health:+this.health.toFixed(2),contact:this.contact,pressure:+this.pressure.toFixed(2),time:+this.time.toFixed(3),remaining:this.particles.length,board:[...this.board],hint:this.hint(),stars:this.state==='won'?(this.moves>=3?3:this.moves>=1?2:1):0};}
}
const api={Game,groupAt};if(typeof module!=='undefined')module.exports=api;else root.KingEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
