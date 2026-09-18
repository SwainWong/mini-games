/* One rotated ellipse for rendering, terrain masks and all actors. */
(function(root,factory){const G=factory();if(typeof module==='object')module.exports=G;else root.SandRock=G;})(globalThis,()=>{
  const local=(r,x,y)=>{const c=Math.cos(r.angle||0),s=Math.sin(r.angle||0),dx=x-r.x,dy=y-r.y;return{x:c*dx+s*dy,y:-s*dx+c*dy};};
  const point=(r,x,y)=>{const c=Math.cos(r.angle||0),s=Math.sin(r.angle||0);return{x:r.x+c*x-s*y,y:r.y+s*x+c*y};};
  const contains=(r,x,y,pad=0)=>{const p=local(r,x,y);return(p.x/(r.rx+pad))**2+(p.y/(r.ry+pad))**2<=1;};
  const extent=r=>{const c=Math.cos(r.angle||0),s=Math.sin(r.angle||0);return{x:Math.hypot(r.rx*c,r.ry*s),y:Math.hypot(r.rx*s,r.ry*c)};};
  function bottom(r,x){const c=Math.cos(r.angle||0),s=Math.sin(r.angle||0),dx=x-r.x,A=s*s/r.rx**2+c*c/r.ry**2,B=2*c*s*dx*(1/r.rx**2-1/r.ry**2),C=dx*dx*(c*c/r.rx**2+s*s/r.ry**2)-1,D=B*B-4*A*C;return D<0?null:r.y+(-B+Math.sqrt(D))/(2*A);}
  return{local,point,contains,extent,bottom};
});
