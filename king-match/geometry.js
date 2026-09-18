(function(root){
'use strict';
const slope=82/342,tip=348;
const RAMP=[[24,150],[tip,150+(tip-24)*slope],[tip,166+(tip-24)*slope],[24,166]],PLATFORM={x:24,y:378,w:268,h:20},BEAM={x:216,y:542,w:192,h:48};
const RAMP_BOUNDS={minX:Math.min(...RAMP.map(p=>p[0])),maxX:Math.max(...RAMP.map(p=>p[0])),minY:Math.min(...RAMP.map(p=>p[1])),maxY:Math.max(...RAMP.map(p=>p[1]))};
function rampTop(x){const [a,b]=RAMP;return a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]);}
const roofSlope=(RAMP[1][1]-RAMP[0][1])/(RAMP[1][0]-RAMP[0][0]),ROOF_NORMAL={x:roofSlope/Math.hypot(1,roofSlope),y:-1/Math.hypot(1,roofSlope)};
function nearRamp(p){const b=RAMP_BOUNDS;return p.x+p.r>=b.minX&&p.x-p.r<=b.maxX&&p.y+p.r>=b.minY&&p.y-p.r<=b.maxY;}
function contact(p,points){
 let inside=true,best=Infinity,qx=0,qy=0,nx=0,ny=0;
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
  if(dx*(p.y-a[1])-dy*(p.x-a[0])<0)inside=false;
  const t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/len2)),x=a[0]+t*dx,y=a[1]+t*dy,d2=(p.x-x)**2+(p.y-y)**2;
  if(d2<best){best=d2;qx=x;qy=y;nx=dy/Math.sqrt(len2);ny=-dx/Math.sqrt(len2);}
 }
 const d=Math.sqrt(best);if(!inside&&d>1e-8){nx=(p.x-qx)/d;ny=(p.y-qy)/d;}
 return{depth:inside?p.r+d:Math.max(0,p.r-d),nx,ny};
}
function project(p,poly){const c=contact(p,poly);if(c.depth>0){p.x+=c.nx*(c.depth+.001);p.y+=c.ny*(c.depth+.001);const vn=(p.vx||0)*c.nx+(p.vy||0)*c.ny;if(vn<0){p.vx-=vn*c.nx;p.vy-=vn*c.ny;}}return c;}
function boxDepth(p,b){
 if(p.x+p.r<=b.x||p.x-p.r>=b.x+b.w||p.y+p.r<=b.y||p.y-p.r>=b.y+b.h)return 0;
 const dx=p.x-Math.max(b.x,Math.min(b.x+b.w,p.x)),dy=p.y-Math.max(b.y,Math.min(b.y+b.h,p.y));
 if(dx||dy)return Math.max(0,p.r-Math.hypot(dx,dy));return p.r+Math.min(p.x-b.x,b.x+b.w-p.x,p.y-b.y,b.y+b.h-p.y);
}
// Project against the union, skipping shared/internal edges between touching
// bricks. Candidate rays traverse only connected obstructions, not empty space.
function rectUnion(p,boxes,left=-Infinity,right=Infinity){
 if(!boxes.some(b=>boxDepth(p,b)>.00001))return false;
 const hits=boxes.filter(b=>boxDepth(p,b)>.00001),candidates=[];
 const accept=q=>q.x-p.r>=left&&q.x+p.r<=right&&!boxes.some(b=>boxDepth(q,b)>.00001);
 // A seam can require simultaneous x/y correction. Axis-only rays can skip
 // the nearby free corner and incorrectly choose the far side of a platform.
 const xs=[p.x],ys=[p.y];for(const b of hits){xs.push(b.x-p.r-.001,b.x+b.w+p.r+.001);ys.push(b.y-p.r-.001,b.y+b.h+p.r+.001);}
 if(Number.isFinite(p.px)&&Number.isFinite(p.py)){xs.push(p.px);ys.push(p.py);}
 for(const x of xs)for(const y of ys){const q={x,y,r:p.r};if(accept(q))candidates.push(q);}
 for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]]){
  const q={x:p.x,y:p.y,r:p.r};let steps=0;
  while(steps++<=boxes.length){const hits=boxes.filter(b=>boxDepth(q,b)>.00001);if(!hits.length)break;
   for(const b of hits){if(dx<0)q.x=Math.min(q.x,b.x-p.r-.001);if(dx>0)q.x=Math.max(q.x,b.x+b.w+p.r+.001);if(dy<0)q.y=Math.min(q.y,b.y-p.r-.001);if(dy>0)q.y=Math.max(q.y,b.y+b.h+p.r+.001);}
  }
  if(q.x-p.r>=left&&q.x+p.r<=right&&!boxes.some(b=>boxDepth(q,b)>.00001))candidates.push(q);
 }
 if(!candidates.length)return false;
 candidates.sort((a,b)=>(a.x-p.x)**2+(a.y-p.y)**2-((b.x-p.x)**2+(b.y-p.y)**2));
 const q=candidates[0],dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy),nx=dx/d,ny=dy/d,vn=(p.vx||0)*nx+(p.vy||0)*ny;
 p.x=q.x;p.y=q.y;if(vn<0){p.vx-=vn*nx;p.vy-=vn*ny;}return true;
}
// Resolve a grain against the hinged flap AND the ramp/wall union. The last
// valid position is a contact fallback, never a jump across a narrow wedge.
function gateContact(p,poly){
 const valid=q=>q.x+q.r<=408+.00001&&q.x-q.r>=24-.00001&&contact(q,poly).depth<.00001&&(!nearRamp(q)||contact(q,RAMP).depth<.00001);
 if(valid(p))return {x:p.x,y:p.y};
 const candidates=[];
 if(Number.isFinite(p.px)&&valid({...p,x:p.px,y:p.py}))candidates.push({x:p.px,y:p.py});
 for(const reverse of [false,true]){const q={...p};for(let i=0;i<12;i++){
  if(reverse){project(q,poly);if(nearRamp(q))project(q,RAMP);}else{if(nearRamp(q))project(q,RAMP);project(q,poly);}
  q.x=Math.max(24+q.r,Math.min(408-q.r,q.x));if(valid(q)){candidates.push(q);break;}
 }}
 candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));return candidates[0]||null;
}
const api={gateContact,RAMP,RAMP_BOUNDS,rampTop,ROOF_NORMAL,nearRamp,PLATFORM,BEAM,contact,project,boxDepth,rectUnion};if(typeof module!=='undefined')module.exports=api;else root.KingGeometry=api;
})(globalThis);
