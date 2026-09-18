(function(root){
'use strict';
const G=typeof module!=='undefined'?require('./geometry.js'):root.KingGeometry;
// A failed coarse search is NOT proof of confinement. The optimistic graph
// reduces radius by a half-cell diagonal, so every continuous circle path has
// a free nearest-grid-node path. Extra corner-cutting paths are allowed here.
function escape(p,boxes,sweeps,{optimistic=false,step=4,destination=null,gravity=false}={}){
 const radius=optimistic?Math.max(0,p.r-Math.SQRT2*step/2-.02):p.r;
 const left=24+radius,right=408-radius,top=gravity?Math.max(394,p.y-p.r*2-(optimistic?Math.SQRT2*step/2+.02:0)):394,bottom=770;
 const minX=p.x+Math.ceil((left-p.x)/step)*step,minY=p.y+Math.ceil((top-p.y)/step)*step;
 const nx=Math.floor((right-minX)/step)+1,ny=Math.floor((bottom-minY)/step)+1;
 if(nx<=0||ny<=0||p.y<top||p.y>bottom)return {status:'unknown'};
 const ix=Math.round((p.x-minX)/step),iy=Math.round((p.y-minY)/step),start=iy*nx+ix;
 const seen=new Uint8Array(nx*ny),free=new Int8Array(nx*ny),parent=new Int32Array(nx*ny);parent.fill(-1);
 const queue=[start];seen[start]=1;
 const point=id=>({x:minX+(id%nx)*step,y:minY+Math.floor(id/nx)*step,r:radius});
 const clear=q=>!boxes.some(b=>G.boxDepth(q,b)>.001);
 const isFree=id=>{if(!free[id])free[id]=clear(point(id))?1:-1;return free[id]===1;};
 const goal=q=>destination?destination(q):q.y<=top+step||q.y>=bottom-step||!sweeps.some(b=>G.boxDepth({...q,r:optimistic?Math.max(0,p.r-Math.SQRT2*step/2-.02):p.r},b)>0);
 const edge=(a,b)=>{for(let t=.25;t<=1;t+=.25)if(!clear({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,r:radius}))return false;return true;};
 for(let head=0;head<queue.length;head++){
  const id=queue[head],q=point(id);
  if(goal(q)){let at=id;const route=[];while(at!==start&&at>=0){route.push(point(at));at=parent[at];}route.reverse();return {status:'open',route};}
  for(const [dx,dy]of [[0,1],[-1,0],[1,0],[-1,1],[1,1],[0,-1],[-1,-1],[1,-1]]){
   const x=id%nx+dx,y=Math.floor(id/nx)+dy;if(x<0||x>=nx||y<0||y>=ny)continue;
   const next=y*nx+x;if(seen[next]||!isFree(next)||!optimistic&&!edge(q,point(next)))continue;
   seen[next]=1;parent[next]=id;queue.push(next);
  }
 }
 return {status:optimistic?'closed':'unknown'};
}
function support(p,tiles,particles,upper){
 const queue=[p],seen=new Set([p.id]),parent=new Map,parents=new Map,ends=[];
 for(let i=0;i<queue.length;i++){
  const a=queue[i];
  const lower=tiles.find(t=>{const dx=Math.max(t.x-a.x,0,a.x-t.x-48);return t!==upper&&dx<a.r&&a.y<=t.y&&Math.abs(t.y-a.y-Math.sqrt(a.r*a.r-dx*dx))<=.6;});
  if(lower)ends.push({id:a.id,lower});
  for(const b of particles)if(b.y>a.y+.5&&Math.abs(b.x-a.x)<=a.r+b.r+.6&&Math.hypot(b.x-a.x,b.y-a.y)<=a.r+b.r+.6){
   if(!parents.has(b.id))parents.set(b.id,[]);parents.get(b.id).push(a.id);
   if(!seen.has(b.id)){seen.add(b.id);parent.set(b.id,a.id);queue.push(b);}
  }
 }
 if(!ends.length)return null;
 const lower=ends[0].lower,chain=[ends[0].id];let id=ends[0].id;while(parent.has(id)){id=parent.get(id);chain.push(id);}
 const members=new Set,back=ends.filter(e=>e.lower===lower).map(e=>e.id);
 while(back.length){const id=back.pop();if(members.has(id))continue;members.add(id);back.push(...(parents.get(id)||[]));}
 const paths={};for(const member of members){
  const up=[member];let id=member;while(parent.has(id)){id=parent.get(id);up.push(id);}
  const down=[];id=member;while(!ends.some(e=>e.id===id&&e.lower===lower)){
   const next=[...members].find(q=>(parents.get(q)||[]).includes(id));if(next==null)break;down.unshift(next);id=next;
  }paths[member]=[...down,...up];
 }
 // Adjacent level bricks are one physical bearing surface. Keep its identity
 // stable when the contact chain rolls from one leaf to its neighbor.
 const surface=new Set([lower]);let added=true;
 while(added){added=false;for(const t of tiles)if(!surface.has(t)&&Math.abs(t.y-lower.y)<.01&&[...surface].some(q=>Math.abs(t.x-q.x)<=48+.01)){surface.add(t);added=true;}}
 const supportKey=[...surface].map(t=>t.from).sort((a,b)=>a-b).join(',');
 return {lower,supportKey,chain,members:[...members],paths};
}
const api={escape,support};if(typeof module!=='undefined')module.exports=api;else root.KingClamp=api;
})(globalThis);
