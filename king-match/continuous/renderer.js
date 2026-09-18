(function(root){
'use strict';
const {CELL,BX,BY,FLOOR,GATE_X,GATE_TRAVEL,SPAN,HEIGHT}=LinkedKing;
const ATLAS=[[43,21,361,347],[447,20,363,348],[858,19,362,349],[12,381,447,409],[560,365,155,430],[835,398,379,394],[21,785,393,449],[440,819,366,392],[824,824,397,390]];
class Renderer{
 constructor(canvas,assets){this.canvas=canvas;this.c=canvas.getContext('2d');this.a=assets;this.sprites=ATLAS.map(rect=>{const tile=document.createElement('canvas');tile.width=rect[2];tile.height=rect[3];tile.getContext('2d').drawImage(assets.atlas,...rect,0,0,tile.width,tile.height);return tile;});this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.selected=-1;this.hints=[];this.hintUntil=0;this.effects=[];this.scale=1;this.resize();}
 resize(){this.scale=Math.min(devicePixelRatio||1,2);this.canvas.width=720*this.scale;this.canvas.height=HEIGHT*this.scale;}
 atlas(id,x,y,w,h){this.c.drawImage(this.sprites[id],x,y,w,h);}
 text(s,x,y,size=24,color='#f5e5bf',align='center'){const c=this.c;c.fillStyle=color;c.font=`500 ${size}px "PingFang SC",system-ui,sans-serif`;c.textAlign=align;c.fillText(s,x,y);}
 plate(s,x,y,w=210){const c=this.c;c.fillStyle='#101e2ded';c.strokeStyle='#ad8750';c.lineWidth=2;c.beginPath();c.roundRect(x-w/2,y-24,w,36,6);c.fill();c.stroke();this.text(s,x,y,20);}
 stone(x,y,w,h){const c=this.c;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.fillStyle='#776959';c.fillRect(x,y,w,h);for(let yy=y;yy<y+h;yy+=38)for(let xx=x;xx<x+w;xx+=74){this.atlas(8,xx,yy,75,39);}c.strokeStyle='#c1a176';c.lineWidth=2;c.strokeRect(x,y,w,h);c.restore();}
 polyStone(points){const c=this.c;c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);this.stone(Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));c.restore();}
 rope(points){const c=this.c;c.lineWidth=5;c.strokeStyle='#a2743d';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.strokeStyle='#eac48a';c.lineWidth=2;c.stroke();}
 wheel(x,y){const c=this.c;c.fillStyle='#ad7938';c.strokeStyle='#f1c46d';c.lineWidth=3;c.beginPath();c.arc(x,y,15,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#26303a';c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill();}
 gem(v,x,y){if(v===3){const im=this.a.emerald;this.c.drawImage(im,im.width*.065,im.height*.075,im.width*.87,im.height*.82,x+2,y+2,CELL-4,CELL-4);}else this.atlas(v,x+2,y+2,CELL-4,CELL-4);}
 burst(cells,t){for(const i of cells)this.effects.push({x:BX+i%4*CELL+CELL/2,y:BY+(i>>2)*CELL+CELL/2,t,life:.55});}
 pose(pose,anchor,y,left){const c=this.c,{sheet,frame}=pose,im=this.a[sheet],split=sheet==='hurt'?654:627,sx=frame%2?(frame>=2?split:627):0,sy=frame>=2?627:0,sw=frame>=2?(frame%2?1254-split:split):627,scale=.22;
  const soles={single:[577,580,546,546],hurt:[575,582,540,539],idle:[594,597,580,578]},anchors={single:[594,578,591,590],hurt:[340,330,350,330],idle:[315,290,328,312]};c.save();if(left){c.translate(anchor*2,0);c.scale(-1,1);}c.drawImage(im,sx,sy,sw,627,anchor-anchors[sheet][frame]*scale,y-soles[sheet][frame]*scale,sw*scale,627*scale);c.restore();
 }
 king(x,y,walking,t,hurt=false,pose){const c=this.c;c.save();if(hurt)c.filter='brightness(1.2)';if(!walking){pose=pose||{sheet:'single',frame:0};this.pose(pose,x+(pose.sheet==='single'?14:78),y,true);}else if(walking==='stand'){this.pose({sheet:'idle',frame:0},x,y,false);}else{const frame=this.reduced?0:1+Math.floor(t*8)%4,w=this.a.king.width/4,h=this.a.king.height/2;c.drawImage(this.a.king,frame%4*w,Math.floor(frame/4)*h,w,h,x-70,y-143+(this.reduced?0:Math.sin(t*13)*2),140,143);}c.restore();if(!walking)this.atlas(4,x,180,26,140);}
 stairs(ax,ay,bx,by){const points=[[ax,ay]],n=Math.max(1,Math.ceil(Math.abs(by-ay)/18));for(let i=1;i<=n;i++){points.push([ax+(bx-ax)*i/n,ay+(by-ay)*(i-1)/n],[ax+(bx-ax)*i/n,ay+(by-ay)*i/n]);}points.push([bx,by+24],[ax,ay+24]);this.polyStone(points);}
 stage(s,game,t){const c=this.c;const base=s.index*SPAN;c.save();c.translate(base,0);c.drawImage(this.a.castle,0,-150,720,HEIGHT+180);
  c.fillStyle='#101824';c.fillRect(60,55,360,680);c.fillStyle='#172230';c.fillRect(126,726,228,319);
  this.stone(44,42,16,698);this.stone(420,360,22,420);this.stone(460,82,20,98);this.stone(460,320,260,32);
  this.polyStone([[420,360],[460,320],[720,320],[720,390],[420,390]]);
  this.polyStone([[60,720],[142,774],[135,790],[60,742]]);this.polyStone([[420,720],[338,774],[345,790],[420,742]]);
  this.stone(126,1038,228,16);
  // Visible bucket guide rails and rigid carriage arm, separate from the rope.
  c.strokeStyle='#88949a';c.lineWidth=7;c.beginPath();c.moveTo(22,735);c.lineTo(22,1038);c.stroke();
  const mouth=780+s.gate;
  this.rope([[26,mouth+12],[26,20],[650,20],[650,196-s.gate]]);this.wheel(26,20);this.wheel(650,20);
  c.strokeStyle='#9cabb1';c.lineWidth=10;c.beginPath();c.moveTo(26,mouth+12);c.lineTo(140,mouth+18);c.stroke();
  for(const yy of [mouth,mouth+28]){c.fillStyle='#535f66';c.beginPath();c.arc(22,yy,8,0,6.283);c.fill();}
  c.fillStyle='#2b3942';c.strokeStyle='#c49c55';c.lineWidth=5;c.beginPath();c.moveTo(134,mouth);c.lineTo(146,mouth+103);c.lineTo(338,mouth+103);c.lineTo(348,mouth);c.closePath();c.fill();c.stroke();
  c.fillStyle='#26333b';c.fillRect(132,mouth,216,8);
  // Door guide rails remain fixed; only the panel and its side spikes lift.
  c.strokeStyle='#b7a385';c.lineWidth=5;c.beginPath();c.moveTo(644,38);c.lineTo(644,320);c.moveTo(678,38);c.lineTo(678,320);c.stroke();
  c.fillStyle='#765335';c.strokeStyle='#d4ac5c';c.lineWidth=4;c.fillRect(649,196-s.gate,28,124);c.strokeRect(649,196-s.gate,28,124);
  for(const y of [216,245,275]){c.fillStyle='#c5d2d8';c.beginPath();c.moveTo(648,y-s.gate);c.lineTo(632,y+8-s.gate);c.lineTo(648,y+16-s.gate);c.fill();}
  if(s.latched){c.fillStyle='#e7c46c';c.fillRect(666,45,30,9);}
  if(s.op?.kind==='fall')for(const tile of s.op.tiles)this.gem(tile.color,tile.x,tile.y);
  else for(let i=0;i<16;i++)if(s.board[i]!=null){let x=BX+i%4*CELL,y=BY+(i>>2)*CELL;if(s.op?.kind==='swap'&&(i===s.op.a||i===s.op.b)){const other=i===s.op.a?s.op.b:s.op.a,progress=Math.sin(Math.min(1,s.op.age/.32)*Math.PI)*.65;x+=(other%4-i%4)*CELL*progress;y+=((other>>2)-(i>>2))*CELL*progress;}this.gem(s.board[i],x,y);}
  for(const p of s.particles){c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.beginPath();c.arc(0,0,p.r,0,6.283);c.clip();this.atlas(5,-p.r,-p.r,p.r*2,p.r*2);c.restore();}
  if(game.active===s.index&&['ready','playing','lost'].includes(game.phase))this.king(s.shield.x,FLOOR,false,t,s.time-s.lastHurt<.45,s.characterFrame());
  this.plate(s.cfg.label+' · '+s.cfg.name,565,102,210);
  this.text('石仓 · '+s.initial+' 颗',222,112,22,'#efd092');
  this.text(s.contact?'→ 石头正在压盾':'疏通底口，减轻石压',262,344,21,s.contact?'#ffd097':'#bbcbd0');
  this.plate('唯一消除区',239,765,230);
  this.text(s.collected+' / '+(s.cfg.weight+1)+' 颗',240,mouth+72,25,'#fff0be');
  this.text(s.latched?'门已锁定 ↑':'积重吊门 ↑',570,161,20,s.latched?'#91e9c9':'#e7cba1');
  c.strokeStyle='#bc9558';c.lineWidth=2;c.beginPath();c.moveTo(62,72);c.lineTo(62,154);c.stroke();
  if(game.active===s.index){for(const e of this.effects){const age=t-e.t;if(age<0||age>e.life)continue;c.save();c.globalAlpha=1-age/e.life;c.strokeStyle='#ffe3a0';c.lineWidth=4;c.beginPath();c.arc(e.x,e.y,12+age*70,0,Math.PI*2);c.stroke();if(!this.reduced)for(let j=0;j<8;j++){const a=j*Math.PI/4;c.fillStyle='#ffdf8c';c.fillRect(e.x+Math.cos(a)*age*110,e.y+Math.sin(a)*age*110,5,5);}c.restore();}this.effects=this.effects.filter(e=>t-e.t<e.life);for(let i=0;i<16;i++)if(i===this.selected||this.hintUntil>t&&this.hints.includes(i)){c.lineWidth=5;c.strokeStyle=i===this.selected?'#ffffff':'#ffdc75';c.strokeRect(BX+i%4*CELL+5,BY+(i>>2)*CELL+5,CELL-10,CELL-10);}}
  c.restore();
 }
 draw(game,t){const c=this.c;c.setTransform(this.scale,0,0,this.scale,0,0);c.clearRect(0,0,720,HEIGHT);c.fillStyle='#152230';c.fillRect(0,0,720,HEIGHT);c.save();c.translate(-game.cameraX,-game.cameraY);
  for(const s of game.stages)if(s.index*SPAN-game.cameraX<760&&s.index*SPAN+720-game.cameraX>-40)this.stage(s,game,t);
  // The inter-room stairway climbs ABOVE B's stone chamber, then descends
  // into its protected right-hand defence bay. It never crosses the ore well.
  this.stone(720,320,70,28);this.stairs(790,320,SPAN-40,60);this.stone(SPAN-40,60,530,22);
  // A guided automatic entry lift connects the upper gallery to B's bay.
  c.strokeStyle='#677d88';c.lineWidth=5;for(const x of [SPAN+490,SPAN+634]){c.beginPath();c.moveTo(x,60);c.lineTo(x,320);c.stroke();}
  this.rope([[SPAN+560,-40],[SPAN+560,game.entryLiftY]]);this.wheel(SPAN+560,-40);
  c.fillStyle='#c3a565';c.strokeStyle='#f0d9a5';c.lineWidth=3;c.fillRect(SPAN+490,game.entryLiftY,144,12);c.strokeRect(SPAN+490,game.entryLiftY,144,12);
  if(game.phase==='transition'&&game.actorX>=SPAN+480)this.plate('入场升降台 · 自动下降',SPAN+390,-65,300);
  if(game.cameraY< -20||game.phase==='transition')this.plate('王室连廊 · 前往水晶密室',SPAN+245,-95,330);
  this.stone(SPAN+720,320,120,28);
  for(const x of [790,SPAN+790]){c.fillStyle='#6bd9bf';c.beginPath();c.ellipse(x+20,316,24,5,0,0,6.283);c.fill();this.text(x===790?'P1':'P2',x+20,280,24);}
  if(['walking','transition','won'].includes(game.phase))this.king(game.actorX,game.actorY,game.phase==='won'||game.phase==='transition'&&game.waypoints[0]?.x===SPAN+560&&game.waypoints[0]?.y===FLOOR?'stand':true,t);
  c.restore();
 }
}
root.LinkedRenderer=Renderer;
})(globalThis);
