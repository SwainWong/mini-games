(function(root){
'use strict';
const {W,H,CELL,BOARD_X,BOARD_Y,COLS,ROWS}=root.KingLevels;
const SOURCES=[[43,21,361,347],[447,20,363,348],[858,19,362,349],[12,381,447,409],[560,365,155,430],[835,398,379,394],[21,785,393,449],[440,819,366,392],[824,824,397,390]];
class Renderer{
 constructor(canvas,assets){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.assets=assets;this.sprites=SOURCES.map(s=>{const c=document.createElement('canvas');c.width=s[2];c.height=s[3];c.getContext('2d').drawImage(assets.atlas,...s,0,0,s[2],s[3]);return c;});this.effects=[];this.hint=[];this.hintUntil=0;this.hover=[];this.keyboard=-1;this.selected=-1;this.combo=null;this.hitAt=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.resize();}
 resize(){const d=Math.min(2,devicePixelRatio||1);this.canvas.width=W*d;this.canvas.height=H*d;this.ctx.setTransform(d,0,0,d,0,0);}
 sprite(id,x,y,w,h){this.ctx.drawImage(this.sprites[id],x,y,w,h);}
 burst(indices,board,t){
  this.combo={count:indices.length,t};
  for(const i of indices){const x=BOARD_X+i%COLS*CELL+CELL/2,y=BOARD_Y+Math.floor(i/COLS)*CELL+CELL/2;
   this.effects.push({type:'ring',x,y,t,color:'#ffe9a0',life:.45});
   for(let n=0;n<(this.reduced?0:8);n++){const a=n*Math.PI/4;this.effects.push({type:'shard',sprite:board[i],x,y,vx:Math.cos(a)*100,vy:Math.sin(a)*90-30,t,color:['#ffda85','#77c5ff','#ff9580'][board[i]],life:.62});}
  }
 }
 rockFx(x,y,t){if(this.reduced)return;for(let i=0;i<2;i++)this.effects.push({x,y,vx:(i?1:-1)*23,vy:-24,t,life:.4,color:'#fbe0a0'});}
 label(text,x,y,size=10,color='#e6d4b2',align='center'){const c=this.ctx;c.font=`${size}px "PingFang SC",system-ui,sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(text,x,y);}
 polygon(points){const c=this.ctx;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
 masonry(points){const c=this.ctx;c.save();this.polygon(points);c.clip();c.fillStyle="#786953";c.fillRect(0,0,W,H);for(let y=100;y<740;y+=64)for(let x=20;x<430;x+=78)c.drawImage(this.sprites[8],35,60,300,250,x,y,82,68);c.fillStyle='#181f2555';c.fillRect(0,0,W,H);c.restore();this.polygon(points);c.lineWidth=3;c.strokeStyle='#c7a163';c.stroke();}
 draw(g,t){
  const c=this.ctx;c.clearRect(0,0,W,H);c.drawImage(this.assets.castle,0,0,W,H);
  if(g.level.beam){c.fillStyle='#25235840';c.fillRect(24,0,384,H);}
  const shade=c.createLinearGradient(0,0,0,395);shade.addColorStop(0,'#09131b3d');shade.addColorStop(1,'#060c11aa');c.fillStyle=shade;c.fillRect(24,0,384,398);
  // Physical surfaces have the same silhouette in render and solver.
  this.masonry([[24,150],[326,232],[326,248],[24,166]]);
  this.masonry([[24,378],[292,378],[292,398],[24,398]]);
  c.drawImage(this.assets.spikes,20,248,61,140);
  if(g.clearance<25){c.fillStyle=`rgba(221,63,49,${.1+Math.sin(t*8)*.04})`;c.fillRect(24,250,90,128);}
  const kx=g.shield.x-148,ky=244;
  c.save();c.fillStyle='#090e15b8';c.beginPath();c.ellipse(kx+74,377,70,7,0,0,Math.PI*2);c.fill();
  if(g.state==='won')this.sprite(6,kx+6,236+(this.reduced?0:Math.sin(t*7)*2),119,142);
  else{
   const moving=g.state==='playing'&&Math.abs(g.shield.vx)>.1;
   const stride=this.reduced||!moving?0:Math.sin(g.time*(4+Math.abs(g.shield.vx)*2))*Math.min(4.5,Math.abs(g.shield.vx)*2.4);
   const impact=g.state==='lost'?Math.max(0,1-(t-this.hitAt)/.65):0;
   const lean=this.reduced?0:Math.min(.04,g.contactForce/4000)+impact*.045;
   c.translate(kx+130,378);c.rotate(-lean);c.translate(-130,-134);
   const im=this.sprites[3],cut=Math.floor(im.height*.76);
   const crouch=this.reduced?0:Math.min(3,g.contactForce/100);
   c.drawImage(im,0,0,im.width,cut,0,crouch,148,102-crouch);
   c.drawImage(im,0,cut,im.width/2,im.height-cut,stride*.65,102-Math.max(0,stride)*.65,74,32);
   c.drawImage(im,im.width/2,cut,im.width/2,im.height-cut,74-stride*.65,102-Math.max(0,-stride)*.65,74,32);
  }c.restore();
  this.sprite(4,g.shield.x-38,230,38,148);
  if(g.state==='lost'&&t-this.hitAt<.7){const a=Math.max(0,1-(t-this.hitAt)/.7);c.save();c.globalAlpha=a;c.shadowBlur=18;c.shadowColor='#ff8d66';c.strokeStyle='#ffe1bd';c.lineWidth=4;c.beginPath();c.arc(80,322,8+(1-a)*30,0,Math.PI*2);c.stroke();c.fillStyle='#ff725b55';c.fillRect(24,248,100,140);c.restore();this.label('啊！碰到尖刺了',151,270,15,'#ffd1b0');}
  this.label(g.state==='won'?'闸门关上了，得救了！':g.clearance<25?'尖刺就在身后！':g.contactForce>45?'快开路，我在后退！':'交换三颗，帮我卸力！',216,106,11,'#f8e5ba');
  this.label(g.sourceEnabled?(g.queued?'入口拥堵 · 等待石料落入':'▼  持续落石中'):'供料闸门已关闭',170,21,10,g.sourceEnabled?'#efd19b':'#a6dac8');
  // A visible measuring line ties the HUD to the actual rear-to-spike distance.
  c.strokeStyle=g.clearance<25?'#ff8b71':'#d7bc81';c.lineWidth=1;c.setLineDash([3,3]);c.beginPath();c.moveTo(78,390);c.lineTo(Math.max(78,kx),390);c.stroke();c.setLineDash([]);
  c.fillStyle='#101b20';c.fillRect(24,398,384,338);
  const op=g.operation,age=op?g.time-op.started:0;
  const pos=i=>({x:BOARD_X+i%COLS*CELL,y:BOARD_Y+Math.floor(i/COLS)*CELL});
  for(let i=0;i<g.board.length;i++){
   const {x,y}=pos(i),v=g.board[i];if(v===-1)continue;
   if(op&&(i===op.a||i===op.b)&&(!op.valid||age<.16))continue;
   if(v!=null){
    const flashing=op?.valid&&!op.blasted&&age>=.16&&op.matched.includes(i);
    const scale=flashing&&!this.reduced?1+Math.sin((age-.16)/.18*Math.PI)*.11:1;
    c.save();c.translate(x+24,y+24);if(flashing){c.shadowBlur=18;c.shadowColor='#fff2a6';}
    this.sprite(v,-23*scale,-23*scale,46*scale,46*scale);c.restore();
    if(flashing){c.fillStyle='#fff4b14a';c.fillRect(x+2,y+2,44,44);}
    if(i===this.selected||this.hintUntil>t&&this.hint.includes(i)){c.strokeStyle=i===this.selected?'#fff':'#ffcf55';c.lineWidth=3;c.shadowBlur=12;c.shadowColor='#ffd97c';c.strokeRect(x+2,y+2,44,44);c.shadowBlur=0;}
   }else{c.strokeStyle='#e1bf7510';c.lineWidth=1;c.strokeRect(x+.5,y+.5,47,47);}
  }
  if(op&&(!op.valid||age<.16)){
   const from=pos(op.a),to=pos(op.b),raw=op.valid?age/.16:age<.15?age/.15:1-(age-.15)/.15,p=Math.max(0,Math.min(1,raw)),ease=p*p*(3-2*p);
   this.sprite(op.before[op.a],from.x+(to.x-from.x)*ease+1,from.y+(to.y-from.y)*ease+1,46,46);
   this.sprite(op.before[op.b],to.x+(from.x-to.x)*ease+1,to.y+(from.y-to.y)*ease+1,46,46);
  }
  if(this.hintUntil>t&&this.hint.length===2){const a=pos(this.hint[0]),b=pos(this.hint[1]);c.strokeStyle='#fff2b0';c.lineWidth=3;c.beginPath();c.moveTo(a.x+24,a.y+24);c.lineTo(b.x+24,b.y+24);c.stroke();this.label(a.x===b.x?'↕':'↔',(a.x+b.x)/2+24,(a.y+b.y)/2+30,20,'#fff');}
  if(g.level.beam){this.masonry([[264,590],[408,545],[408,590]]);this.label('绕左侧',337,579,10,'#ffedc7');}
  // Particle artwork is bounded by the actual radius; visually solid falling stones.
  for(const p of g.particles){c.save();c.translate(p.x,p.y);c.rotate(p.angle);this.sprite(5,-p.r,-p.r,p.r*2,p.r*2);c.restore();}
  const outlet=c.createLinearGradient(0,739,0,780);outlet.addColorStop(0,'#79c7b810');outlet.addColorStop(1,'#64c4ae72');c.fillStyle=outlet;c.fillRect(24,739,384,41);c.strokeStyle='#92c6af99';c.lineWidth=1;c.setLineDash([4,5]);c.beginPath();c.moveTo(29,754);c.lineTo(403,754);c.stroke();c.setLineDash([]);this.label('↓     安 全 出 口     ↓',216,773,10,'#c8e7d1');
  for(const p of this.effects){const a=t-p.t;if(a<0||a>p.life)continue;c.globalAlpha=1-a/p.life;c.save();
   if(p.type==='ring'){c.strokeStyle=p.color;c.lineWidth=3*(1-a/p.life);c.beginPath();c.arc(p.x,p.y,8+a*78,0,Math.PI*2);c.stroke();}
   else{c.translate(p.x+p.vx*a,p.y+p.vy*a+150*a*a);c.rotate(a*7);if(p.type==='shard'){const im=this.sprites[p.sprite];c.drawImage(im,im.width*.23,im.height*.2,im.width*.35,im.height*.35,-5,-5,10,10);}else{c.fillStyle=p.color;c.fillRect(-2,-2,4,4);}}
   c.restore();}c.globalAlpha=1;this.effects=this.effects.filter(p=>t-p.t<p.life);
  if(this.combo&&t-this.combo.t<.85){const a=t-this.combo.t;c.globalAlpha=Math.min(1,(.85-a)*3);c.fillStyle='#1b2335e6';c.beginPath();c.roundRect(141,407-a*16,150,35,10);c.fill();this.label(`${this.combo.count} 连消 · 通道打开`,216,430-a*16,14,'#ffe49d');c.globalAlpha=1;}
  if(this.keyboard>=0){const i=this.keyboard;c.strokeStyle='#fff';c.lineWidth=3;c.strokeRect(BOARD_X+i%COLS*CELL+4,BOARD_Y+Math.floor(i/COLS)*CELL+4,40,40);}
  if(g.state==='ready'){this.label(g.level.beam?'02  ·  水晶密室':'01  ·  王室金库',216,13,8,'#f3d89b');}
 }
}
root.KingRenderer=Renderer;
})(globalThis);
