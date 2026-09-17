(() => {
  'use strict';
  const {W,H,BOTTOM:SOIL_BOTTOM,GW,CELL,STEP,World}=SandCore,levels=SandLevels;
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s);
  const colors={amber:{light:'#fff2d8',mid:'#e89a50',base:'#a7481f',dark:'#54200f',label:'琥珀'},blue:{light:'#effaff',mid:'#a3c8dc',base:'#557d99',dark:'#243b54',label:'冰蓝'},jade:{light:'#f1ffe2',mid:'#b1c68b',base:'#64875c',dark:'#344b33',label:'青玉'},rose:{light:'#fff0f2',mid:'#e1a1b1',base:'#ab597d',dark:'#612e4b',label:'玫瑰'}};
  const features={worm:['〰','蚯蚓'],quake:['≈','地震 × 2'],wind:['↝','风口'],mud:['▨','黏土'],gate:['▥','定时闸门'],magnet:['∩','磁石']};
  const typeLabels={glass:'● 玻璃珠',heavy:'⊕ 重力珠',rubber:'◎ 弹力珠',light:'✧ 轻盈珠'};
  const soil=document.createElement('canvas'),texture=document.createElement('canvas'),earth=document.createElement('canvas');soil.width=texture.width=earth.width=W;soil.height=texture.height=SOIL_BOTTOM;earth.height=H;
  const sc=soil.getContext('2d'),tc=texture.getContext('2d'),ec=earth.getContext('2d'),sound=new SandAudio(),best=new Map();
  let world,current=0,brush=24,hint=false,pointer=null,cursor=null,lastTime=0,accumulator=0,particles=[],seed=42,lastHud='',finished=false,lastGateStates=[],quakeStatusUntil=0;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    releasePointer();current=index;world=new World(levels[index]);hint=false;finished=false;cursor=null;particles=[];accumulator=0;lastHud='';quakeStatusUntil=0;lastGateStates=[];
    makeTextures();$('#level-number').textContent=String(index+1).padStart(2,'0');$('#level-title').textContent=levels[index].title;$('#difficulty').textContent=levels[index].difficulty;
    $('#result').hidden=true;$('#result-stars').hidden=true;$('#hint').setAttribute('aria-pressed','false');$('#rules-budget').textContent=`本关：三星 ≤ ${world.budget.three} 沙量；二星 ≤ ${world.budget.two} 沙量。`;
    $('#features').replaceChildren();const types=[...new Set(levels[index].groups.flatMap(g=>g.types||['glass']))];
    for(const text of [...types.map(t=>typeLabels[t]),...levels[index].features.map(f=>features[f].join(' '))]){const s=document.createElement('span');s.textContent=text;$('#features').append(s);}
    updateLevelGrid();status(levels[index].note);updateHud();render();
  }
  function updateHud(){
    const key=`${world.collected}:${world.terrain.units}`;if(key!==lastHud){lastHud=key;$('#collected').textContent=`${world.collected} / ${world.total}`;$('#dug-count').textContent=world.terrain.units;$('#star-budget').textContent=`三星 ≤ ${world.budget.three} · 二星 ≤ ${world.budget.two}`;const meter=$('#sand-meter');meter.max=world.budget.two;meter.low=world.budget.three;meter.high=world.budget.two;meter.optimum=0;meter.value=Math.min(world.terrain.units,world.budget.two);meter.setAttribute('aria-valuetext',`已挖 ${world.terrain.units}，三星额度 ${world.budget.three}，二星额度 ${world.budget.two}`);}
    const q=levels[current].mechanics.quake;let text=world.started?'保留沙墙，送同色珠子回家':'按住划动，机关随第一铲开始';
    if(q&&world.started&&world.quakeCount<q.count){const remaining=q.first+world.quakeCount*q.interval-world.time;text=remaining<=2?`⚠ 地震即将发生 · ${Math.max(0,remaining).toFixed(1)} 秒`:`下次地震 ${Math.ceil(remaining)} 秒 · 还剩 ${q.count-world.quakeCount} 次`;}
    if(world.quakeLeft>0)text='≈ 地震中 · 珠子抖动，局部落沙';$('#board-instruction').textContent=text;
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
    const x=jar.x,y=590,w=100,h=75,p=colors[jar.color];
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
    for(const z of m.winds||[]){ctx.fillStyle='#d1e7ec22';ctx.fillRect(z.x,z.y,z.w,z.h);ctx.save();ctx.strokeStyle='#e9fcffc0';ctx.lineWidth=1.4;for(let i=0;i<6;i++){const x=z.x+((t*30+i*21)%z.w),y=z.y+13+i*15;ctx.beginPath();ctx.moveTo(x-8,y);ctx.lineTo(x+5,y);ctx.lineTo(x+1,y-3);ctx.moveTo(x+5,y);ctx.lineTo(x+1,y+3);ctx.stroke();}ctx.restore();}
    for(const z of m.muds||[]){ctx.fillStyle='#73644c48';ctx.fillRect(z.x,z.y,z.w,z.h);ctx.strokeStyle='#d0b79077';ctx.lineWidth=1;for(let y=z.y+10;y<z.y+z.h;y+=13){ctx.beginPath();ctx.moveTo(z.x+6,y);ctx.bezierCurveTo(z.x+30,y-7,z.x+60,y+7,z.x+z.w-6,y);ctx.stroke();}}
    if(m.quake){ctx.save();ctx.setLineDash([3,4]);ctx.strokeStyle=world.quakeLeft>0?'#ffdfa1':'#a97b5370';for(const p of m.quake.patches)ctx.strokeRect(p.x-2,p.y-2,p.w+4,p.h+4);ctx.restore();}
    for(const z of m.magnets||[]){ctx.save();ctx.translate(z.x,z.y);ctx.strokeStyle='#936055';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,-5);ctx.lineTo(-7,3);ctx.arc(0,3,7,Math.PI,0,true);ctx.lineTo(7,-5);ctx.stroke();ctx.strokeStyle='#f8ded0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-7,-7);ctx.lineTo(-7,-3);ctx.moveTo(7,-7);ctx.lineTo(7,-3);ctx.stroke();ctx.strokeStyle='#ca927363';ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.beginPath();ctx.arc(0,0,20+Math.sin(t*2)*3,0,Math.PI*2);ctx.stroke();ctx.restore();}
    for(const g of m.gates||[]){const open=world.gateOpen(g);ctx.save();ctx.strokeStyle=open?'#9bbaa2':'#c3a171';ctx.fillStyle='#564536';ctx.fillRect(g.x-4,g.y-3,7,g.h+6);ctx.fillRect(g.x+g.w-3,g.y-3,7,g.h+6);if(open){ctx.setLineDash([4,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.x,g.y+g.h/2);ctx.lineTo(g.x+g.w,g.y+g.h/2);ctx.stroke();}else{ctx.fillStyle='#8f785b';ctx.fillRect(g.x,g.y,g.w,g.h);ctx.lineWidth=1;for(let x=g.x+4;x<g.x+g.w;x+=9){ctx.beginPath();ctx.moveTo(x,g.y);ctx.lineTo(x+3,g.y+g.h);ctx.stroke();}}ctx.restore();}
    for(const w of m.worms||[]){ctx.save();for(let i=6;i>=0;i--){const p=world.wormPoint(w,i*.13);ctx.beginPath();ctx.ellipse(p.x,p.y,6.5-i*.35,5.5-i*.2,0,0,Math.PI*2);ctx.fillStyle=i%2?'#b8796b':'#d39d88';ctx.fill();ctx.strokeStyle='#815544';ctx.lineWidth=.7;ctx.stroke();}const p=world.wormPoint(w);ctx.fillStyle='#fff3df';ctx.beginPath();ctx.arc(p.x+2,p.y-2,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#422c20';ctx.beginPath();ctx.arc(p.x+2.6,p.y-2,1,0,Math.PI*2);ctx.fill();ctx.restore();}
  }
  function drawHint(){ctx.save();ctx.lineWidth=2;ctx.setLineDash([5,8]);ctx.lineDashOffset=-world.time*12;ctx.strokeStyle='#fff9e1b0';ctx.shadowColor='#614224';ctx.shadowBlur=3;for(const route of levels[current].routes){ctx.beginPath();route.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();const p=route.at(-1);ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(p[0]-5,p[1]-8);ctx.lineTo(p[0],p[1]);ctx.lineTo(p[0]+5,p[1]-8);ctx.stroke();ctx.setLineDash([5,8]);}ctx.restore();}
  function render(){
    syncTerrain();ctx.clearRect(0,0,W,H);ctx.drawImage(earth,0,0);ctx.save();ctx.shadowColor='#281a16b0';ctx.shadowBlur=7;ctx.shadowOffsetY=3;ctx.drawImage(soil,0,0);ctx.restore();levels[current].rocks.forEach(rockDraw);mechanismDraw();if(hint&&world.state==='playing')drawHint();
    for(const b of world.balls)if(b.active){marble(ctx,b.x,b.y,b.r,b.color);drawMaterial(b);}world.jars.forEach(jarDraw);
    for(const p of particles){ctx.globalAlpha=Math.max(0,Math.min(1,p.life*1.7));ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;
    if(cursor&&world.state==='playing'){ctx.beginPath();ctx.arc(cursor.x,cursor.y,brush,0,Math.PI*2);ctx.strokeStyle=pointer?'#fff8e7aa':'#fff8e770';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(cursor.x,cursor.y,2,0,Math.PI*2);ctx.fillStyle='#fff9e8c0';ctx.fill();}
    $('#board-wrap').classList.toggle('quaking',!reducedMotion&&world.quakeLeft>0);
  }
  function drainEvents(){
    for(const e of world.events){sound.play(e.type,e.count||e.speed||0);if(e.type==='collect')for(let i=0;i<6;i++)particles.push({x:e.x,y:583,vx:(random()-.5)*80,vy:-random()*80,life:.6,color:colors[e.color].mid,size:2});if(e.type==='quake'){status('地震来了：看看虚线框附近，必要时补挖一点沙。');quakeStatusUntil=world.time+2;for(const p of levels[current].mechanics.quake.patches)for(let i=0;i<12;i++)particles.push({x:p.x+random()*p.w,y:p.y,vx:(random()-.5)*35,vy:random()*60,life:1,color:'#d4bf99',size:2});}}
    world.events.length=0;
    (levels[current].mechanics.gates||[]).forEach((g,i)=>{const open=world.gateOpen(g);if(lastGateStates[i]!==undefined&&lastGateStates[i]!==open)sound.play('gate');lastGateStates[i]=open;});
    if(world.started&&levels[current].mechanics.worms)sound.play('worm');if(quakeStatusUntil&&world.time>quakeStatusUntil){status(levels[current].note);quakeStatusUntil=0;}
    if(world.state!=='playing')finish();
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
  $('#restart').addEventListener('click',()=>load(current));$('#hint').addEventListener('click',()=>{hint=!hint;$('#hint').setAttribute('aria-pressed',String(hint));status(hint?'沿虚线从罐口往上挖，再接通珠子；提示不扣星。':levels[current].note);});
  $('#result-action').addEventListener('click',()=>load(world.state==='won'?(current+1)%levels.length:current));$('#result-replay').addEventListener('click',()=>load(current));
  $('#choose-level').addEventListener('click',()=>{releasePointer();updateLevelGrid();$('#level-dialog').showModal();});$('#rules').addEventListener('click',()=>{releasePointer();$('#rules-dialog').showModal();});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
  document.querySelectorAll('[data-brush]').forEach(b=>b.addEventListener('click',()=>{brush=Number(b.dataset.brush);document.querySelectorAll('[data-brush]').forEach(btn=>{const active=Number(btn.dataset.brush)===brush;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));});}));
  $('#sound').addEventListener('click',async()=>{const button=$('#sound');button.disabled=true;try{const on=await sound.toggle();button.setAttribute('aria-label',on?'关闭音效':'开启音效');button.setAttribute('aria-pressed',String(on));button.title=on?'关闭音效':'开启音效';$('#sound-label').textContent=on?'音效 开':'音效 关';$('#sound-waves').setAttribute('d',on?'M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14':'m16 9 5 6m0-6-5 6');}catch(e){status(e.message);}finally{button.disabled=false;}});
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();accumulator=0;releasePointer();});
  window.sandGame=Object.freeze({snapshot:()=>({level:current+1,...world.snapshot(),hint,brush,soundEnabled:sound.enabled,audioPlayed:sound.played,best:[...best]}),routes:()=>structuredClone(levels[current].routes),levels:()=>levels.map(l=>({id:l.id,title:l.title,features:[...l.features]}))});
  load(0);requestAnimationFrame(frame);
})();
