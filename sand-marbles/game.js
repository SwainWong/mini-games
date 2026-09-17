(() => {
  'use strict';
  const {W,H,BOTTOM:SOIL_BOTTOM,GW,CELL,STEP,World}=SandCore,levels=SandLevels;
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s);
  const colors={amber:{light:'#fff2d8',mid:'#e89a50',base:'#a7481f',dark:'#54200f',label:'琥珀'},blue:{light:'#effaff',mid:'#a3c8dc',base:'#557d99',dark:'#243b54',label:'冰蓝'},jade:{light:'#f1ffe2',mid:'#b1c68b',base:'#64875c',dark:'#344b33',label:'青玉'},rose:{light:'#fff0f2',mid:'#e1a1b1',base:'#ab597d',dark:'#612e4b',label:'玫瑰'}};
  const features={worm:['〰','蚯蚓'],porter:['♟','搬罐小哥']};
  const typeLabels={glass:'● 玻璃珠',heavy:'⊕ 重力珠',rubber:'◎ 弹力珠',light:'✧ 轻盈珠'};
  const soil=document.createElement('canvas'),texture=document.createElement('canvas'),earth=document.createElement('canvas');soil.width=texture.width=earth.width=W;soil.height=texture.height=SOIL_BOTTOM;earth.height=H;
  const sc=soil.getContext('2d'),tc=texture.getContext('2d'),ec=earth.getContext('2d'),sound=new SandAudio(),best=new Map();
  let world,current=0,brush=24,pointer=null,cursor=null,lastTime=0,accumulator=0,particles=[],seed=42,lastHud='',finished=false;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function status(text){$('#status').textContent=text;}
  function makeTextures(){
    seed=42+current;const data=tc.createImageData(W,SOIL_BOTTOM);
    for(let y=0;y<SOIL_BOTTOM;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,grain=(random()-.5)*24+(random()<.018?-30:0),cloud=Math.sin(x/49+Math.sin(y/58))*2.5+Math.cos(y/64)*3;data.data[i]=221+grain+cloud;data.data[i+1]=213+grain+cloud;data.data[i+2]=201+grain+cloud;data.data[i+3]=255;}
    tc.putImageData(data,0,0);sc.clearRect(0,0,W,SOIL_BOTTOM);sc.drawImage(texture,0,0);
    const gradient=ec.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#462719');gradient.addColorStop(.45,'#713d25');gradient.addColorStop(1,'#4e2617');ec.fillStyle=gradient;ec.fillRect(0,0,W,H);
    for(let i=0;i<24000;i++){ec.fillStyle=random()>.5?'#e6a87809':'#17080110';ec.fillRect(random()*W,random()*H,1,1);}ec.fillStyle='#2a170925';ec.fillRect(0,SOIL_BOTTOM,W,H-SOIL_BOTTOM);syncTerrain();
  }
  function syncTerrain(){for(const i of world.terrain.changes){const x=i%GW*CELL,y=Math.floor(i/GW)*CELL;if(world.terrain.grid[i])sc.drawImage(texture,x,y,2,2,x,y,2,2);else sc.clearRect(x,y,2,2);}world.terrain.changes.length=0;}
  function updateLevelGrid(){
    const grid=$('#level-grid');grid.replaceChildren();
    for(let chapter=0;chapter<3;chapter++){const title=document.createElement('h3');title.textContent=['01—05 · 初识沙径','06—10 · 地下奇遇','11—15 · 沙径大师'][chapter];grid.append(title);const row=document.createElement('div');row.className='chapter-grid';
      for(let i=chapter*5;i<chapter*5+5;i++){const b=document.createElement('button');b.dataset.level=i;b.setAttribute('aria-label',`第 ${i+1} 关：${levels[i].title}`);b.className=i===current?'active':'';const num=document.createElement('b');num.textContent=String(i+1).padStart(2,'0');const name=document.createElement('span');name.textContent=levels[i].title;const stars=document.createElement('small');stars.className='earned-stars';stars.textContent=best.has(i)?'★'.repeat(best.get(i)):'未通关';b.append(num,name,stars);b.addEventListener('click',()=>{$('#level-dialog').close();load(i);});row.append(b);}grid.append(row);
    }
  }
  function load(index){
    releasePointer();current=index;world=new World(levels[index]);finished=false;cursor=null;particles=[];accumulator=0;lastHud='';
    makeTextures();$('#level-number').textContent=String(index+1).padStart(2,'0');$('#level-title').textContent=levels[index].title;$('#difficulty').textContent=levels[index].difficulty;
    $('#result').hidden=true;$('#result-stars').hidden=true;$('#rules-budget').textContent=`本关：三星 ≤ ${world.budget.three} 沙量；二星 ≤ ${world.budget.two} 沙量。`;
    $('#features').replaceChildren();const types=[...new Set(levels[index].groups.flatMap(g=>g.types||['glass']))];
    for(const text of [...types.map(t=>typeLabels[t]),...levels[index].features.map(f=>features[f].join(' '))]){const s=document.createElement('span');s.textContent=text;$('#features').append(s);}
    updateLevelGrid();status(levels[index].note);updateHud();render();
  }
  function updateHud(){
    const key=`${world.collected}:${world.terrain.units}`;if(key!==lastHud){lastHud=key;$('#collected').textContent=`${world.collected} / ${world.total}`;$('#dug-count').textContent=world.terrain.units;$('#star-budget').textContent=`三星 ≤ ${world.budget.three} · 二星 ≤ ${world.budget.two}`;const meter=$('#sand-meter');meter.max=world.budget.two;meter.low=world.budget.three;meter.high=world.budget.two;meter.optimum=0;meter.value=Math.min(world.terrain.units,world.budget.two);meter.setAttribute('aria-valuetext',`已挖 ${world.terrain.units}，三星额度 ${world.budget.three}，二星额度 ${world.budget.two}`);}
    const waiting=world.jars.reduce((n,j)=>n+j.waiting.length,0);$('#board-instruction').textContent=waiting?`接珠盘暂存 ${waiting} 颗 · 等罐子回来装入`:world.started?'保留沙墙，送同色珠子回家':'按住划动，开始挖沙';
  }
  function finish(){
    if(finished)return;finished=true;releasePointer();const won=world.state==='won',last=current===levels.length-1;
    if(won)best.set(current,Math.max(best.get(current)||0,world.stars));
    $('#result-symbol').textContent=won?'':'↻';$('#result-symbol').hidden=won;$('#result-stars').hidden=!won;
    if(won){$('#result-stars').replaceChildren();for(let i=0;i<3;i++){const star=document.createElement('span');star.textContent='★';star.className=i<world.stars?'lit':'';$('#result-stars').append(star);}$('#result-stars').setAttribute('aria-label',`${world.stars} 星，满分 3 星`);}
    $('#result-score').hidden=!won;$('#result-score').textContent=`挖沙 ${world.terrain.units} · 三星额度 ${world.budget.three}`;
    $('#result-kicker').textContent=won?(last?(best.size===15?'FIFTEEN LITTLE VICTORIES':'FINALE COMPLETE'):'BEAUTIFULLY DONE'):'LET’S TRY AGAIN';
    $('#result-title').textContent=won?(last?(best.size===15?'十五段沙径，全部走过。':'终章通关，精彩收尾。'):world.stars===3?'不多不少，刚刚好。':'每颗珠子，都到家了。'):'换一条路，再试一次。';
    $('#result-description').textContent=won?`收集 ${world.collected} / ${world.total} 颗珠子。${world.stars<3?'试试更细的铲子，少挖一些沙，挑战三星。':'这条精细的沙径，值得三颗星。'}`:world.reason;
    $('#result-action').innerHTML=won?(last?'回到第一关 <span>↻</span>':'下一关 <span>→</span>'):'重新挑战 <span>↻</span>';
    $('#result-replay').hidden=!won;$('#result-replay').textContent='再玩一次，挑战更少挖沙';$('#result').hidden=false;updateLevelGrid();
  }
  function marble(c,x,y,r,color,alpha=1){
    const p=colors[color];c.save();c.globalAlpha=alpha;c.shadowColor='#160d0980';c.shadowBlur=2;c.shadowOffsetY=2;
    const g=c.createRadialGradient(x-r*.33,y-r*.42,r*.04,x,y,r);g.addColorStop(0,p.light);g.addColorStop(.23,p.light);g.addColorStop(.42,p.mid);g.addColorStop(.70,p.base);g.addColorStop(1,p.dark);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.shadowColor='transparent';c.strokeStyle=p.mid;c.lineWidth=.9;c.stroke();
    c.beginPath();c.ellipse(x-r*.29,y-r*.40,r*.31,r*.24,-.5,0,Math.PI*2);c.fillStyle='#ffffffed';c.fill();c.beginPath();c.arc(x+r*.15,y+r*.03,r*.67,.1,2.4);c.lineWidth=r*.16;c.strokeStyle=p.light+'99';c.stroke();c.restore();
  }
  function rockDraw(rock){
    ctx.save();ctx.translate(rock.x,rock.y);ctx.shadowColor='#24190d55';ctx.shadowBlur=7;ctx.shadowOffsetY=5;
    const g=ctx.createLinearGradient(-rock.rx,-rock.ry,rock.rx,rock.ry);g.addColorStop(0,'#b5afa2');g.addColorStop(.5,'#928d81');g.addColorStop(1,'#6c6a61');ctx.fillStyle=g;
    ctx.beginPath();for(let i=0;i<=12;i++){const angle=i/12*Math.PI*2,mod=1+Math.sin(i*9)*.045;const x=Math.cos(angle)*rock.rx*mod,y=Math.sin(angle)*rock.ry*mod;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#d1cbbd';ctx.lineWidth=1.5;ctx.stroke();
    ctx.strokeStyle='#5e5d5540';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-rock.rx*.5,-rock.ry*.15);ctx.lineTo(-rock.rx*.12,-rock.ry*.38);ctx.lineTo(rock.rx*.33,-rock.ry*.05);ctx.lineTo(rock.rx*.48,rock.ry*.43);ctx.stroke();ctx.fillStyle='#ece5d129';ctx.beginPath();ctx.ellipse(-rock.rx*.23,-rock.ry*.43,rock.rx*.40,rock.ry*.13,-.3,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function jarDraw(jar){
    const x=jar.x,y=630-jar.lift,w=100,h=75,p=colors[jar.color];
    ctx.save();ctx.shadowColor='#190a0790';ctx.shadowBlur=7;ctx.shadowOffsetY=3;
    const glass=ctx.createLinearGradient(x-w/2,y,x+w/2,y+h);glass.addColorStop(0,'#d8d7e05c');glass.addColorStop(.25,'#bbb2bd36');glass.addColorStop(.7,'#bbb2ca4d');glass.addColorStop(1,'#e6dce778');
    roundRect(ctx,x-w/2,y,w,h,11);ctx.fillStyle=glass;ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#291b1ac9';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#ddcbd2a3';ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<jar.balls.length;i++){const row=Math.floor(i/5),col=i%5;marble(ctx,x-35+col*17.5+(row%2)*2,y+h-12-row*16.5,8.1,jar.color,.95);}
    const shine=ctx.createLinearGradient(x-w/2,y,x+w/2,y);shine.addColorStop(0,'#ffffff15');shine.addColorStop(.45,'#ffffff00');shine.addColorStop(1,'#ffffff21');roundRect(ctx,x-w/2+3,y+3,w-6,h-6,9);ctx.fillStyle=shine;ctx.fill();ctx.strokeStyle='#eadde360';ctx.lineWidth=1;ctx.stroke();
    ctx.strokeStyle='#edf6ffad';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-w/2+11,y+10);ctx.lineTo(x-w/2+11,y+26);ctx.stroke();ctx.strokeStyle='#edf6ff40';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-w/2+10,y+35);ctx.lineTo(x-w/2+10,y+55);ctx.stroke();
    roundRect(ctx,x-40,y-13,80,11,4);ctx.fillStyle='#20140e';ctx.fill();ctx.strokeStyle='#ddcdd0b3';ctx.lineWidth=1.4;ctx.stroke();
    const lip=ctx.createLinearGradient(x-38,y-10,x+38,y-10);lip.addColorStop(0,p.dark);lip.addColorStop(.16,p.light);lip.addColorStop(.28,p.mid);lip.addColorStop(.42,p.base);lip.addColorStop(.65,p.light);lip.addColorStop(.8,p.mid);lip.addColorStop(1,p.dark);roundRect(ctx,x-37,y-10,74,5,2);ctx.fillStyle=lip;ctx.fill();
    if(jar.flash>0){ctx.globalAlpha=jar.flash*.5;ctx.strokeStyle=p.light;ctx.lineWidth=3;roundRect(ctx,x-w/2-3,y-3,w+6,h+6,13);ctx.stroke();}
    ctx.restore();
  }
  function drawMaterial(b){
    if(b.type==='glass')return;ctx.save();ctx.translate(b.x,b.y);ctx.strokeStyle='#fff9e9d9';ctx.lineWidth=1.25;
    if(b.type==='heavy'){ctx.strokeStyle='#4a3b44b3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.moveTo(0,-5);ctx.lineTo(0,5);ctx.stroke();}
    if(b.type==='rubber'){ctx.beginPath();ctx.ellipse(0,0,b.r*.80,b.r*.34,-.7,0,Math.PI*2);ctx.stroke();}
    if(b.type==='light'){ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(3,0);ctx.lineTo(0,4);ctx.lineTo(-3,0);ctx.closePath();ctx.stroke();}ctx.restore();
  }
  function mechanismDraw(){
    const m=levels[current].mechanics,t=world.time;
    for(const w of m.worms||[]){ctx.save();for(let i=6;i>=0;i--){const p=world.wormPoint(w,i*.13);ctx.beginPath();ctx.ellipse(p.x,p.y,6.5-i*.35,5.5-i*.2,0,0,Math.PI*2);ctx.fillStyle=i%2?'#b8796b':'#d39d88';ctx.fill();ctx.strokeStyle='#815544';ctx.lineWidth=.7;ctx.stroke();}const p=world.wormPoint(w);ctx.fillStyle='#fff3df';ctx.beginPath();ctx.arc(p.x+2,p.y-2,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#422c20';ctx.beginPath();ctx.arc(p.x+2.6,p.y-2,1,0,Math.PI*2);ctx.fill();ctx.restore();}
  }
  function docksDraw(){
    for(const j of world.jars){const p=colors[j.color],x=j.homeX;ctx.save();ctx.strokeStyle=p.mid;ctx.fillStyle='#37251e';ctx.lineWidth=3;roundRect(ctx,x-43,580,86,24,5);ctx.fill();ctx.stroke();ctx.fillStyle=p.light;ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(j.waiting.length?`暂存 ${j.waiting.length}`:p.label,x,613);
      for(let i=0;i<Math.min(j.waiting.length,8);i++)marble(ctx,x-32+(i%8)*9,587-Math.floor(i/8)*9,5,j.color);
      if(Math.abs(j.x-j.homeX)<9){ctx.strokeStyle=p.mid+'66';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-25,604);ctx.lineTo(x-20,616);ctx.moveTo(x+25,604);ctx.lineTo(x+20,616);ctx.stroke();}ctx.restore();}
  }
  function porterDraw(front=false){
    const p=world.porter;if(!p)return;const j=world.jars[p.jar],t=world.time,moving=p.moving,bob=moving?Math.sin(t*22)*2:Math.sin(t*3)*1.2,x=j.x,y=630-j.lift;
    ctx.save();ctx.translate(x,y);ctx.lineCap='round';ctx.lineJoin='round';
    const ellipse=(x,y,rx,ry,fill)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    if(!front){ellipse(0,108+j.lift,48,7,'#160e0a50');const step=moving?Math.sin(t*22)*7:0;ctx.strokeStyle='#665b4d';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-17,65);ctx.lineTo(-20+step,96+j.lift);ctx.moveTo(17,65);ctx.lineTo(20-step,96+j.lift);ctx.stroke();ellipse(-25+step,103+j.lift,17,8,'#36251e');ellipse(25-step,103+j.lift,17,8,'#36251e');ellipse(0,31,37,43,'#bd7442');
      // A tiny head, an oversized jar and knees buckling under its weight.
      ctx.save();ctx.translate(0,-29+bob);ctx.rotate(moving?Math.sin(t*11)*.07:-.08);ellipse(0,0,24,23,'#efc698');ellipse(-22,1,5,7,'#e1af83');ellipse(22,1,5,7,'#e1af83');ellipse(-12,7,7,4,'#d78f75');ellipse(12,7,7,4,'#d78f75');ctx.strokeStyle='#50352a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,-3);ctx.lineTo(-6,-1);ctx.moveTo(6,-1);ctx.lineTo(13,-3);ctx.stroke();ellipse(0,4,5,4,'#dba27c');if(p.phase==='rest')ellipse(0,14,4,5,'#673d2e');else{ctx.beginPath();ctx.moveTo(-6,13);ctx.quadraticCurveTo(0,9,6,13);ctx.stroke();}ellipse(0,-19,27,11,'#d9a844');ctx.fillStyle='#e7bd5c';roundRect(ctx,-22,-34,44,20,10);ctx.fill();ctx.strokeStyle='#ba8333';ctx.beginPath();ctx.moveTo(0,-31);ctx.lineTo(0,-17);ctx.stroke();ctx.restore();
      if(p.phase==='rest'||p.phase==='lift'){const side=x>420?-1:1;ctx.fillStyle='#fff1d9';roundRect(ctx,side>0?31:-96,-58,65,26,12);ctx.fill();ctx.fillStyle='#785038';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(p.phase==='rest'?'呼…好重':'嘿——咻',side>0?63:-63,-40);}
      if(p.phase!=='home'){ctx.fillStyle='#9dd7df';ctx.beginPath();ctx.moveTo(29,-25);ctx.quadraticCurveTo(21,-12,30,-12);ctx.quadraticCurveTo(36,-15,29,-25);ctx.fill();}
    }else{ctx.strokeStyle='#bd7442';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-32,0);ctx.quadraticCurveTo(-62,12,-46,39);ctx.moveTo(32,0);ctx.quadraticCurveTo(62,12,46,39);ctx.stroke();ellipse(-45,40,8,7,'#efc698');ellipse(45,40,8,7,'#efc698');}
    ctx.restore();
  }
  function render(){
    syncTerrain();ctx.clearRect(0,0,W,H);ctx.drawImage(earth,0,0);ctx.save();ctx.shadowColor='#281a16b0';ctx.shadowBlur=7;ctx.shadowOffsetY=3;ctx.drawImage(soil,0,0);ctx.restore();levels[current].rocks.forEach(rockDraw);mechanismDraw();docksDraw();porterDraw();
    for(const b of world.balls)if(b.active){marble(ctx,b.x,b.y,b.r,b.color);drawMaterial(b);}world.jars.forEach(jarDraw);porterDraw(true);
    for(const p of particles){ctx.globalAlpha=Math.max(0,Math.min(1,p.life*1.7));ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;
    if(cursor&&world.state==='playing'){ctx.beginPath();ctx.arc(cursor.x,cursor.y,brush,0,Math.PI*2);ctx.strokeStyle=pointer?'#fff8e7aa':'#fff8e770';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(cursor.x,cursor.y,2,0,Math.PI*2);ctx.fillStyle='#fff9e8c0';ctx.fill();}

  }
  function drainEvents(){
    for(const e of world.events){sound.play(e.type,e.count||e.speed||0);if(e.type==='collect')for(let i=0;i<6;i++)particles.push({x:e.x,y:613,vx:(random()-.5)*80,vy:-random()*80,life:.6,color:colors[e.color].mid,size:2});}
    world.events.length=0;if(world.started&&levels[current].mechanics.worms)sound.play('worm');if(world.state!=='playing')finish();
  }
  function frame(time){const delta=Math.min((time-lastTime)/1000||0,.05);lastTime=time;const paused=document.hidden||$('#level-dialog').open||$('#rules-dialog').open;
    if(!paused){if(world.state==='playing'){accumulator+=delta;while(accumulator>=STEP&&world.state==='playing'){world.step(STEP);accumulator-=STEP;}drainEvents();}for(const p of particles){p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=150*delta;p.life-=delta;}particles=particles.filter(p=>p.life>0);updateHud();render();}else accumulator=0;requestAnimationFrame(frame);
  }
  function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  function dig(a,b){const removed=world.dig([a.x,a.y],[b.x,b.y],brush);if(removed){sound.play('dig');for(let i=0;i<3;i++)particles.push({x:b.x+(random()-.5)*brush,y:b.y,vx:(random()-.5)*70,vy:random()*60,life:.35+random()*.25,color:'#d2bfa1',size:1+random()*2});}}
  function releasePointer(){if(pointer&&canvas.hasPointerCapture(pointer.id))canvas.releasePointerCapture(pointer.id);pointer=null;}
  canvas.addEventListener('pointerdown',e=>{if(world.state!=='playing'||pointer||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();pointer={...position(e),id:e.pointerId};cursor=pointer;canvas.setPointerCapture(e.pointerId);dig(pointer,pointer);});
  canvas.addEventListener('pointermove',e=>{const p=position(e);cursor=p;if(pointer?.id===e.pointerId){dig(pointer,p);pointer={...p,id:e.pointerId};}});
  for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,e=>{if(pointer?.id===e.pointerId)releasePointer();if(e.pointerType!=='mouse')cursor=null;});canvas.addEventListener('lostpointercapture',()=>pointer=null);canvas.addEventListener('pointerleave',()=>{if(!pointer)cursor=null;});
  $('#restart').addEventListener('click',()=>load(current));
  $('#result-action').addEventListener('click',()=>load(world.state==='won'?(current+1)%levels.length:current));$('#result-replay').addEventListener('click',()=>load(current));
  $('#choose-level').addEventListener('click',()=>{releasePointer();updateLevelGrid();$('#level-dialog').showModal();});$('#rules').addEventListener('click',()=>{releasePointer();$('#rules-dialog').showModal();});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
  document.querySelectorAll('[data-brush]').forEach(b=>b.addEventListener('click',()=>{brush=Number(b.dataset.brush);document.querySelectorAll('[data-brush]').forEach(btn=>{const active=Number(btn.dataset.brush)===brush;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));});}));
  $('#sound').addEventListener('click',async()=>{const button=$('#sound');button.disabled=true;try{const on=await sound.toggle();button.setAttribute('aria-label',on?'关闭音效':'开启音效');button.setAttribute('aria-pressed',String(on));button.title=on?'关闭音效':'开启音效';$('#sound-label').textContent=on?'音效 开':'音效 关';$('#sound-waves').setAttribute('d',on?'M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14':'m16 9 5 6m0-6-5 6');}catch(e){status(e.message);}finally{button.disabled=false;}});
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();accumulator=0;releasePointer();});
  window.sandGame=Object.freeze({snapshot:()=>({level:current+1,...world.snapshot(),brush,soundEnabled:sound.enabled,audioPlayed:sound.played,best:[...best]}),levels:()=>levels.map(l=>({id:l.id,title:l.title,features:[...l.features]}))});
  load(0);requestAnimationFrame(frame);
})();
