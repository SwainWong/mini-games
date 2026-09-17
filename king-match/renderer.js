(function(root){
'use strict';
const {W,H,CELL,BOARD_X,BOARD_Y,COLS,ROWS}=root.KingLevels;
const SOURCES=[[43,21,361,347],[447,20,363,348],[858,19,362,349],[12,381,447,409],[560,365,155,430],[835,398,379,394],[21,785,393,449],[440,819,366,392],[824,824,397,390]];
class Renderer{
 constructor(canvas,assets){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.assets=assets;this.sprites=SOURCES.map(s=>{const c=document.createElement('canvas');c.width=s[2];c.height=s[3];c.getContext('2d').drawImage(assets.atlas,...s,0,0,s[2],s[3]);return c;});this.effects=[];this.hint=[];this.hintUntil=0;this.hover=[];this.keyboard=-1;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.resize();}
 resize(){const d=Math.min(2,devicePixelRatio||1);this.canvas.width=W*d;this.canvas.height=H*d;this.ctx.setTransform(d,0,0,d,0,0);}
 sprite(id,x,y,w,h){this.ctx.drawImage(this.sprites[id],x,y,w,h);}
 burst(indices,board,t){for(const i of indices){const x=BOARD_X+i%COLS*CELL+CELL/2,y=BOARD_Y+Math.floor(i/COLS)*CELL+CELL/2;for(let n=0;n<7;n++){const a=n*Math.PI*2/7;this.effects.push({x,y,vx:Math.cos(a)*65,vy:Math.sin(a)*65-25,t,color:['#ffda85','#77c5ff','#ff9580'][board[i]],life:.48});}}}
 rockFx(x,y,t){if(this.reduced)return;for(let i=0;i<2;i++)this.effects.push({x,y,vx:(i?1:-1)*23,vy:-24,t,life:.4,color:'#fbe0a0'});}
 label(text,x,y,size=10,color='#e6d4b2',align='center'){const c=this.ctx;c.font=`${size}px "PingFang SC",system-ui,sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(text,x,y);}
 polygon(points){const c=this.ctx;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
 masonry(points){const c=this.ctx;c.save();this.polygon(points);c.clip();c.fillStyle="#786953";c.fillRect(0,0,W,H);for(let y=100;y<740;y+=64)for(let x=20;x<430;x+=78)c.drawImage(this.sprites[8],35,60,300,250,x,y,82,68);c.fillStyle='#181f2555';c.fillRect(0,0,W,H);c.restore();this.polygon(points);c.lineWidth=3;c.strokeStyle='#c7a163';c.stroke();}
 draw(g,t){
  const c=this.ctx;c.clearRect(0,0,W,H);c.drawImage(this.assets.castle,0,0,W,H);
  if(g.level.beam){c.fillStyle='#25235840';c.fillRect(24,0,384,H);}
  const shade=c.createLinearGradient(0,0,0,395);shade.addColorStop(0,'#09131b3d');shade.addColorStop(1,'#060c11aa');c.fillStyle=shade;c.fillRect(24,0,384,398);
  // Physical surfaces have the same silhouette in render and solver.
  this.masonry([[24,150],[284,230],[284,246],[24,166]]);
  this.masonry([[24,378],[266,378],[266,398],[24,398]]);
  c.save();c.fillStyle='#090e15a8';c.beginPath();c.ellipse(173,376,76,9,0,0,Math.PI*2);c.fill();
  const breathing=this.reduced?0:Math.sin(t*2.1)*1.1;
  if(g.state==='won')this.sprite(6,110,236+Math.sin(t*7)*2,119,142);else this.sprite(3,105,243+breathing,148,135-breathing);
  // Fixed shield: the right edge is exactly the physical x=266 face.
  this.sprite(4,229,257,37,123);
  if(g.state==='lost'){c.fillStyle='#15233275';c.fillRect(82,235,185,143);}
  c.restore();
  this.label(g.state==='won'?'呼，得救了！':g.health<40?'快撑不住了！':'拜托啦，勇士！',164,235,12,'#f8e5ba');

  c.fillStyle='#101b20';c.fillRect(24,398,384,338);
  for(let i=0;i<g.board.length;i++){
   const x=BOARD_X+i%COLS*CELL,y=BOARD_Y+Math.floor(i/COLS)*CELL,v=g.board[i];
   if(v===-1)continue;
   if(v!=null){this.sprite(v,x+1,y+1,CELL-2,CELL-2);if(this.hover.includes(i)||this.hintUntil>t&&this.hint.includes(i)){c.strokeStyle='#fff1a2';c.lineWidth=2.3;c.shadowBlur=10;c.shadowColor='#ffd97c';c.strokeRect(x+2,y+2,44,44);c.shadowBlur=0;}}
   else{c.strokeStyle='#e1bf7510';c.lineWidth=1;c.strokeRect(x+.5,y+.5,47,47);}
  }
  if(g.level.beam){this.masonry([[264,590],[408,545],[408,590]]);this.label('绕左侧',337,579,10,'#ffedc7');}
  // Particle artwork is bounded by the actual radius; visually solid falling stones.
  for(const p of g.particles){c.save();c.translate(p.x,p.y);c.rotate(p.angle);this.sprite(g.level.beam?7:5,-p.r,-p.r,p.r*2,p.r*2);c.restore();}
  const outlet=c.createLinearGradient(0,739,0,780);outlet.addColorStop(0,'#79c7b810');outlet.addColorStop(1,'#64c4ae72');c.fillStyle=outlet;c.fillRect(24,739,384,41);c.strokeStyle='#92c6af99';c.lineWidth=1;c.setLineDash([4,5]);c.beginPath();c.moveTo(29,754);c.lineTo(403,754);c.stroke();c.setLineDash([]);this.label('↓     安 全 出 口     ↓',216,773,10,'#c8e7d1');
  for(const p of this.effects){const a=t-p.t;if(a<0||a>p.life)continue;c.globalAlpha=1-a/p.life;c.fillStyle=p.color;c.save();c.translate(p.x+p.vx*a,p.y+p.vy*a+120*a*a);c.rotate(a*5);c.fillRect(-2,-2,4,4);c.restore();}c.globalAlpha=1;this.effects=this.effects.filter(p=>t-p.t<p.life);
  if(this.keyboard>=0){const i=this.keyboard;c.strokeStyle='#fff';c.lineWidth=3;c.strokeRect(BOARD_X+i%COLS*CELL+4,BOARD_Y+Math.floor(i/COLS)*CELL+4,40,40);}
  if(g.state==='ready'){this.label(g.level.beam?'02  ·  水晶密室':'01  ·  王室金库',216,13,8,'#f3d89b');}
 }
}
root.KingRenderer=Renderer;
})(globalThis);
