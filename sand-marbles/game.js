(() => {
  'use strict';
  const {W,H,BOTTOM:SOIL_BOTTOM,GW,CELL,STEP,World,jarMouth}=SandCore,levels=SandLevels;
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s);
  const colors={amber:{light:'#fff9c8',mid:'#ffd35a',base:'#f28a15',dark:'#975012',label:'琥珀'},blue:{light:'#e8fcff',mid:'#75dcff',base:'#2494dd',dark:'#24549a',label:'冰蓝'},jade:{light:'#eaffc9',mid:'#9cee9c',base:'#37ad7e',dark:'#26734e',label:'青玉'},rose:{light:'#fff0fb',mid:'#ffaad6',base:'#df5ba6',dark:'#972d7a',label:'玫瑰'}};
  const features={worm:['〰','蚯蚓'],porter:['♟','搬罐小哥'],rival:['⚑','盗宝人']};
  const typeLabels={glass:'● 玻璃·顺滑',heavy:'⊕ 重力·更沉',rubber:'◎ 弹力·回弹',light:'◇ 轻盈·慢落'};
  const soil=document.createElement('canvas'),texture=document.createElement('canvas'),earth=document.createElement('canvas');soil.width=texture.width=earth.width=W;soil.height=texture.height=SOIL_BOTTOM;earth.height=H;
  const sc=soil.getContext('2d'),tc=texture.getContext('2d'),ec=earth.getContext('2d'),sound=new SandAudio(),best=new Map(),bestSand=new Map();
  const art={porter:new Image(),rival:new Image(),props:new Image(),jar:new Image()};let assetsReady=false;
  const assetLoad=Promise.all(Object.entries(art).map(([name,img])=>new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('角色素材加载失败，请重试'));img.src=`assets/${name}-v7.png`;})));
  let world,current=0,brush=24,pointer=null,cursor=null,lastTime=0,accumulator=0,particles=[],seed=42,lastHud='',finished=false,motionCheck=0,stillFor=0,motionPositions=[];
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function status(text){$('#status').textContent=text;}
  function makeTextures(){
    seed=42+current;const g=tc.createLinearGradient(0,0,W,SOIL_BOTTOM);g.addColorStop(0,'#ffdc96');g.addColorStop(.5,'#f8c77c');g.addColorStop(1,'#eeb36b');tc.fillStyle=g;tc.fillRect(0,0,W,SOIL_BOTTOM);
    for(let i=0;i<4300;i++){const x=random()*W,y=random()*SOIL_BOTTOM,r=.35+random()*1.1;tc.fillStyle=random()>.55?'#fff4d352':'#af702319';tc.beginPath();tc.ellipse(x,y,r*1.5,r,0,0,Math.PI*2);tc.fill();}
    for(let i=0;i<38;i++){const x=random()*W,y=60+random()*490;tc.fillStyle='#d9934525';tc.beginPath();tc.ellipse(x,y,4+random()*6,1.8,-.3,0,Math.PI*2);tc.fill();tc.fillStyle='#fff2bf55';tc.fillRect(x-3,y-2,5,1);}
    sc.clearRect(0,0,W,SOIL_BOTTOM);sc.drawImage(texture,0,0);
    const depth=ec.createLinearGradient(0,0,0,SOIL_BOTTOM);depth.addColorStop(0,'#9b542b');depth.addColorStop(1,'#733e2b');ec.fillStyle=depth;ec.fillRect(0,0,W,H);
    for(let i=0;i<1000;i++){ec.fillStyle=random()>.5?'#f1ba7930':'#381c1b20';ec.beginPath();ec.arc(random()*W,random()*SOIL_BOTTOM,random()*2,0,Math.PI*2);ec.fill();}
    const floor=ec.createLinearGradient(0,SOIL_BOTTOM,0,H);floor.addColorStop(0,'#d99151');floor.addColorStop(.4,'#efbb78');floor.addColorStop(1,'#f9d598');ec.fillStyle=floor;ec.fillRect(0,SOIL_BOTTOM,W,H-SOIL_BOTTOM);
    ec.fillStyle='#ad6c3720';ec.beginPath();ec.ellipse(280,710,310,32,0,0,Math.PI*2);ec.fill();
    for(let i=0;i<30;i++){const x=random()*W,y=704+random()*56;ec.fillStyle='#c6884329';ec.beginPath();ec.ellipse(x,y,2+random()*4,1.5,0,0,Math.PI*2);ec.fill();}
    syncTerrain();
  }
  function syncTerrain(){for(const i of world.terrain.changes){const x=i%GW*CELL,y=Math.floor(i/GW)*CELL;if(world.terrain.grid[i])sc.drawImage(texture,x,y,2,2,x,y,2,2);else sc.clearRect(x,y,2,2);}world.terrain.changes.length=0;}
  function updateLevelGrid(){
    const grid=$('#level-grid');grid.replaceChildren();$('#session-summary').textContent=`本次探索 ${best.size} / 15 关 · 已得 ${[...best.values()].reduce((a,b)=>a+b,0)} / 45 星`;
    for(let chapter=0;chapter<3;chapter++){const title=document.createElement('h3');title.textContent=['01—05 · 初识沙径','06—10 · 地下奇遇','11—15 · 沙径大师'][chapter];grid.append(title);const row=document.createElement('div');row.className='chapter-grid';
      for(let i=chapter*5;i<chapter*5+5;i++){const b=document.createElement('button');b.dataset.level=i;b.setAttribute('aria-label',`第 ${i+1} 关：${levels[i].title}`);b.className=i===current?'active':'';const num=document.createElement('b');num.textContent=String(i+1).padStart(2,'0');const name=document.createElement('span');name.textContent=levels[i].title;const stars=document.createElement('small');stars.className='earned-stars';stars.textContent=best.has(i)?'★'.repeat(best.get(i)):'未通关';b.append(num,name,stars);if(bestSand.has(i)){const record=document.createElement('small');record.className='sand-record';record.textContent=`最少 ${bestSand.get(i)} 沙`;b.append(record);}b.addEventListener('click',()=>{$('#level-dialog').close();load(i);});row.append(b);}grid.append(row);
    }
  }
  function load(index){
    releasePointer();current=index;world=new World(levels[index]);finished=false;cursor=null;particles=[];accumulator=0;lastHud='';motionCheck=0;stillFor=0;motionPositions=[];
    makeTextures();$('#level-number').textContent=String(index+1).padStart(2,'0');$('#level-title').textContent=levels[index].title;$('#difficulty').textContent=levels[index].difficulty;
    $('#result').hidden=true;$('#result-stars').hidden=true;$('#return-result').hidden=true;$('#rules-budget').textContent=`本关：三星 ≤ ${world.budget.three} 沙量；二星 ≤ ${world.budget.two} 沙量。`;
    $('#features').replaceChildren();const types=[...new Set(levels[index].groups.flatMap(g=>g.types||['glass']))];
    for(const text of [...types.map(t=>typeLabels[t]),...levels[index].features.map(f=>features[f].join(' '))]){const s=document.createElement('span');s.textContent=text;$('#features').append(s);}
    updateLevelGrid();status(levels[index].note);updateHud();render();
  }
  function updateHud(){
    const key=`${world.collected}:${world.terrain.units}`;if(key!==lastHud){lastHud=key;$('#collected').textContent=`${world.collected} / ${world.total}`;$('#dug-count').textContent=world.terrain.units;$('#star-budget').textContent=`三星 ≤ ${world.budget.three} · 二星 ≤ ${world.budget.two}`;const meter=$('#sand-meter');meter.max=world.budget.two;meter.low=world.budget.three;meter.high=world.budget.two;meter.optimum=0;meter.value=Math.min(world.terrain.units,world.budget.two);meter.setAttribute('aria-valuetext',`已挖 ${world.terrain.units}，三星额度 ${world.budget.three}，二星额度 ${world.budget.two}`);}
    if(world.started&&world.time-motionCheck>=1){const active=world.balls.filter(b=>b.active),moving=active.some((b,i)=>!motionPositions[i]||Math.hypot(b.x-motionPositions[i][0],b.y-motionPositions[i][1])>2);stillFor=moving||pointer?0:stillFor+world.time-motionCheck;motionPositions=active.map(b=>[b.x,b.y]);motionCheck=world.time;}
    $('#board-wrap').dataset.danger=world.state==='playing'?(world.rival?.danger||'distant'):'distant';
    $('#board-instruction').textContent=world.state==='won'?'宝藏全收齐！':world.state==='lost'?'失误已圈出 · 查看后可重来':stillFor>=6&&world.balls.some(b=>b.active)?`还有 ${world.balls.filter(b=>b.active).length} 颗停在沙中 · 可继续挖沙`:world.rival&&world.started?(world.rival.danger==='near'?'快！盗宝人就在珠子旁边':world.rival.danger==='approaching'?'小心，他越来越近了！':'盗宝人开挖了，快送珠子回家'):world.started?'送同色珠子回家':'按住划动，开始挖沙';
  }
  function finish(){
    if(finished)return;finished=true;releasePointer();const won=world.state==='won',last=current===levels.length-1;
    const oldRecord=bestSand.get(current);if(won){best.set(current,Math.max(best.get(current)||0,world.stars));bestSand.set(current,Math.min(oldRecord??Infinity,world.terrain.units));}
    $('#result-symbol').textContent=won?'':'↻';$('#result-symbol').hidden=won;$('#result-stars').hidden=!won;
    if(won){$('#result-stars').replaceChildren();for(let i=0;i<3;i++){const star=document.createElement('span');star.textContent='★';star.className=i<world.stars?'lit':'';$('#result-stars').append(star);}$('#result-stars').setAttribute('aria-label',`${world.stars} 星，满分 3 星`);}
    $('#result-score').hidden=!won;$('#result-score').textContent=`挖沙 ${world.terrain.units} · ${world.terrain.units<=world.budget.three?'三星余量 '+(world.budget.three-world.terrain.units):'距离三星还需少挖 '+(world.terrain.units-world.budget.three)} 沙`;
    $('#result-kicker').textContent=won?(last?(best.size===15?'FIFTEEN LITTLE VICTORIES':'FINALE COMPLETE'):'BEAUTIFULLY DONE'):'LET’S TRY AGAIN';
    $('#result-title').textContent=world.failure?.kind==='stolen'?'哎呀，珠子被抢走了！':won?(last?(best.size===15?'十五段沙径，全部走过。':'终章通关，精彩收尾。'):world.stars===3?'不多不少，刚刚好。':'每颗珠子，都到家了。'):'换一条路，再试一次。';
    $('#result-description').textContent=won?`收集 ${world.collected} / ${world.total} 颗珠子。${world.stars<3?'试试更细的铲子，少挖一些沙，挑战三星。':'这条精细的沙径，值得三颗星。'}`:world.reason;
    $('#result-action').innerHTML=won?(last?'回到第一关 <span>↻</span>':'下一关 <span>→</span>'):'重新挑战 <span>↻</span>';
    $('#result-review').hidden=won;$('#result-record').hidden=!won;$('#result-record').textContent=won?(oldRecord===undefined?`本次最佳：${world.terrain.units} 沙`:world.terrain.units<oldRecord?`新纪录！比上次少挖 ${oldRecord-world.terrain.units} 沙`:`本次最佳：${bestSand.get(current)} 沙 · 继续挑战更精细的路径`):'';$('#result-replay').hidden=!won;$('#result-replay').textContent='再玩一次，挑战更少挖沙';$('#result').hidden=false;updateLevelGrid();
  }
  function marble(c,x,y,r,color,alpha=1){
    const p=colors[color];c.save();c.globalAlpha=alpha;c.shadowColor='#160d0980';c.shadowBlur=2;c.shadowOffsetY=2;
    const g=c.createRadialGradient(x-r*.33,y-r*.42,r*.04,x,y,r);g.addColorStop(0,p.light);g.addColorStop(.23,p.light);g.addColorStop(.42,p.mid);g.addColorStop(.70,p.base);g.addColorStop(1,p.dark);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.shadowColor='transparent';c.strokeStyle=p.mid;c.lineWidth=.9;c.stroke();
    c.beginPath();c.ellipse(x-r*.29,y-r*.40,r*.31,r*.24,-.5,0,Math.PI*2);c.fillStyle='#ffffffed';c.fill();c.beginPath();c.arc(x+r*.15,y+r*.03,r*.67,.1,2.4);c.lineWidth=r*.16;c.strokeStyle=p.light+'99';c.stroke();c.restore();
  }
  function rockDraw(rock){
    if(!assetsReady)return;
    ctx.save();ctx.shadowColor='#603a2388';ctx.shadowBlur=8;ctx.shadowOffsetY=6;
    // The art is clipped to the same ellipse used by terrain and bead collision.
    ctx.beginPath();ctx.ellipse(rock.x,rock.y,rock.rx,rock.ry,0,0,Math.PI*2);ctx.fillStyle='#916044';ctx.fill();ctx.clip();
    ctx.drawImage(art.props,654,173,583,444,rock.x-rock.rx,rock.y-rock.ry,rock.rx*2,rock.ry*2);ctx.restore();
  }
  function jarLabel(jar){
    const x=jar.x,y=jarMouth(jar).y,p=colors[jar.color];ctx.save();
    ctx.fillStyle=p.dark;ctx.beginPath();ctx.ellipse(x,y,46,5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=p.base;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+1,48,7,0,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=p.light;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y-1,48,7,0,Math.PI,Math.PI*2);ctx.stroke();
    const badge=ctx.createLinearGradient(x,y+25,x,y+48);badge.addColorStop(0,p.base);badge.addColorStop(1,p.dark);ctx.fillStyle=badge;roundRect(ctx,x-24,y+25,48,23,8);ctx.fill();ctx.strokeStyle=p.light;ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#fffaf0';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(p.label,x,y+41);
    if(jar.balls.length){ctx.fillStyle=p.dark;ctx.font='bold 11px sans-serif';ctx.fillText(`${jar.balls.length} 颗`,x,y+64);}
    if(jar.flash>0){ctx.globalAlpha=jar.flash;ctx.strokeStyle='#fff6ac';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y,51,10,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
  }
  function jarDraw(jar,index){
    if(!assetsReady||world.porter?.jar===index)return;
    const x=jar.x,y=jarMouth(jar).y;ctx.save();ctx.fillStyle='#59392428';ctx.beginPath();ctx.ellipse(x,y+76,70,9,0,0,Math.PI*2);ctx.fill();
    // Neutral ceramic carries a live colour rim/badge; opening is exactly the physical mouth.
    ctx.drawImage(art.jar,22,375,1210,610,x-73,y-19,146,96);ctx.restore();jarLabel(jar);
  }
  function drawMaterial(b){
    if(b.type==='glass')return;ctx.save();ctx.translate(b.x,b.y);ctx.lineCap='round';
    if(b.type==='heavy'){ctx.strokeStyle='#3a3435';ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(0,0,b.r-.7,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#fff4d2';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.moveTo(0,-5);ctx.lineTo(0,5);ctx.stroke();}
    if(b.type==='rubber'){ctx.strokeStyle='#563747';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(-5,5);ctx.lineTo(5,-5);ctx.stroke();ctx.strokeStyle='#fff4dd';ctx.lineWidth=2.5;ctx.stroke();}
    if(b.type==='light'){ctx.fillStyle='#fffdf4';ctx.strokeStyle='#665e50';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,0);ctx.lineTo(0,6);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();
  }
  function mechanismDraw(){
    if(!assetsReady)return;
    for(const w of world.worms){const frame=Math.floor(world.time*7)%2;ctx.save();ctx.translate(w.x,w.y);ctx.rotate(Math.atan2(w.vy,w.vx));
      ctx.shadowColor='#66312266';ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.drawImage(art.props,frame?640:24,845,590,275,-44,-13,51,24);ctx.restore();}
  }
  const spriteFrames={rival:[[0,0,627,627],[627,0,627,627],[0,627,627,627],[627,627,627,627]]};
  function sprite(name,frame,x,y,w,h,flip=false,angle=0){if(!assetsReady)return;const r=spriteFrames[name][frame];ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(flip?-1:1,1);ctx.drawImage(art[name],...r,-w/2,-h/2,w,h);ctx.restore();}
  // Whole-body frames include the held jar and correct hand/handle occlusion.
  // Mouth landmarks are measured independently per frame, then pinned to jarMouth().
  const porterMouths=[[253,218,90],[254,219,90],[250,220,93],[278,229,91],[264,229,91],[261,232,92]];
  function porterDraw(){
    const p=world.porter;if(!p||!assetsReady)return;const j=world.jars[p.jar],t=world.time;
    const frame=p.moving?Math.floor(t*10)%2:p.phase==='wipe'?3:p.phase==='think'?4:p.phase==='lift'?5:2;
    const [mx,my,rx]=porterMouths[frame],sx=46/rx,sy=.43,mouth=jarMouth(j);
    ctx.save();ctx.fillStyle='#59392428';ctx.beginPath();ctx.ellipse(j.x,mouth.y+(480-my)*sy,72,8,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(art.porter,frame%3*512,Math.floor(frame/3)*512,512,512,j.x-mx*sx,mouth.y-my*sy,512*sx,512*sy);ctx.restore();jarLabel(j);
    if(p.moving){ctx.save();ctx.fillStyle='#fff0c284';for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(j.x-38+i*32,710+Math.sin(t*17+i)*3,5-i,2.5,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
  }
  function rivalDraw(){
    const r=world.rival;if(!r)return;const t=world.time,near=r.danger==='near',frame=r.phase==='caught'?3:r.phase==='running'?2:r.phase==='watching'?0:Math.floor(t*(near?9:6))%2;
    ctx.save();if(near){ctx.fillStyle=`rgba(221,63,72,${.13+Math.sin(t*8)*.05})`;ctx.beginPath();ctx.arc(r.x,r.y,37,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#68372135';ctx.beginPath();ctx.ellipse(r.x,r.y+26,29,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
    sprite('rival',frame,r.x,r.y-10+(r.phase==='running'?Math.sin(t*24)*2:0),90,96,r.fx<0,r.phase==='digging'?Math.sin(t*13)*.025:0);
    if(r.phase==='caught'&&r.captured)marble(ctx,r.x+(r.fx<0?-31:31),r.y-44,8,r.captured.color);
    if(r.phase==='digging'){ctx.save();ctx.fillStyle='#ffe1a5';for(let i=0;i<4;i++){const u=(t*2.8+i*.23)%1;ctx.beginPath();ctx.arc(r.x+r.fx*22+(i-1.5)*u*18,r.y+12-u*28+u*u*24,2.5*(1-u),0,Math.PI*2);ctx.fill();}ctx.restore();}

  }
  function failureDraw(){
    const f=world.failure;if(!f)return;ctx.save();ctx.strokeStyle='#b73a32';ctx.fillStyle='#fff1da';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,18,0,Math.PI*2);ctx.fill();ctx.stroke();marble(ctx,f.x,f.y,9,f.color);if(f.targetX!==undefined){roundRect(ctx,f.targetX-43,f.targetY-6,86,22,5);ctx.stroke();}const x=Math.max(76,Math.min(W-76,f.x));ctx.fillStyle='#9e342e';roundRect(ctx,x-72,518,144,34,7);ctx.fill();ctx.fillStyle='#fff9ee';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(f.kind==='stolen'?'被盗宝人抢走了！':f.target?`${colors[f.color].label} → ${colors[f.target].label} ×`:'珠子错过罐口',x,541);ctx.restore();
  }
  function render(){
    syncTerrain();ctx.clearRect(0,0,W,H);ctx.drawImage(earth,0,0);ctx.save();ctx.shadowColor='#54281d99';ctx.shadowBlur=6;ctx.shadowOffsetY=5;ctx.drawImage(soil,0,0);ctx.restore();levels[current].rocks.forEach(rockDraw);mechanismDraw();
    porterDraw();world.jars.forEach(jarDraw);
    for(const b of world.balls)if(b.active){marble(ctx,b.x,b.y,b.r,b.color);drawMaterial(b);}rivalDraw();failureDraw();
    for(const p of particles){ctx.globalAlpha=Math.max(0,Math.min(1,p.life*1.7));ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;
    if(cursor&&world.state==='playing'){ctx.beginPath();ctx.arc(cursor.x,cursor.y,brush,0,Math.PI*2);ctx.strokeStyle=pointer?'#fff8e7aa':'#fff8e770';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(cursor.x,cursor.y,2,0,Math.PI*2);ctx.fillStyle='#fff9e8c0';ctx.fill();}

  }
  function drainEvents(){
    for(const e of world.events){sound.play(e.type,e.count||e.speed||0);if(e.type==='collect')for(let i=0;i<6;i++)particles.push({x:e.x,y:e.y,vx:(random()-.5)*80,vy:-random()*80,life:.6,color:colors[e.color].mid,size:2});}
    world.events.length=0;if(world.started&&world.rival&&world.state==='playing'){if(world.rival.phase==='digging')sound.play('rival-dig');if(world.rival.danger==='near')sound.play('danger');}if(world.started&&levels[current].mechanics.worms)sound.play('worm');if(world.state!=='playing')finish();
  }
  function frame(time){const delta=Math.min((time-lastTime)/1000||0,.05);lastTime=time;const paused=!assetsReady||document.hidden||$('#level-dialog').open||$('#rules-dialog').open;
    if(!paused){if(world.state==='playing'){accumulator+=delta;while(accumulator>=STEP&&world.state==='playing'){world.step(STEP);accumulator-=STEP;}drainEvents();}for(const p of particles){p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=150*delta;p.life-=delta;}particles=particles.filter(p=>p.life>0);updateHud();render();}else accumulator=0;requestAnimationFrame(frame);
  }
  function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  function dig(a,b){const removed=world.dig([a.x,a.y],[b.x,b.y],brush);if(removed){sound.play('dig');for(let i=0;i<3;i++)particles.push({x:b.x+(random()-.5)*brush,y:b.y,vx:(random()-.5)*70,vy:random()*60,life:.35+random()*.25,color:'#d2bfa1',size:1+random()*2});}}
  function releasePointer(){if(pointer&&canvas.hasPointerCapture(pointer.id))canvas.releasePointerCapture(pointer.id);pointer=null;}
  canvas.addEventListener('pointerdown',e=>{if(!assetsReady||world.state!=='playing'||pointer||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();pointer={...position(e),id:e.pointerId};cursor=pointer;canvas.setPointerCapture(e.pointerId);dig(pointer,pointer);});
  canvas.addEventListener('pointermove',e=>{const p=position(e);cursor=p;if(pointer?.id===e.pointerId){dig(pointer,p);pointer={...p,id:e.pointerId};}});
  for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,e=>{if(pointer?.id===e.pointerId)releasePointer();if(e.pointerType!=='mouse')cursor=null;});canvas.addEventListener('lostpointercapture',()=>pointer=null);canvas.addEventListener('pointerleave',()=>{if(!pointer)cursor=null;});
  $('#restart').addEventListener('click',()=>load(current));
  $('#result-review').addEventListener('click',()=>{$('#result').hidden=true;$('#return-result').hidden=false;status(world.reason+' 地图已冻结，可查看后重来。');});$('#return-result').addEventListener('click',()=>{$('#result').hidden=false;$('#return-result').hidden=true;});
  $('#result-action').addEventListener('click',()=>load(world.state==='won'?(current+1)%levels.length:current));$('#result-replay').addEventListener('click',()=>load(current));
  $('#choose-level').addEventListener('click',()=>{releasePointer();updateLevelGrid();$('#level-dialog').showModal();});$('#rules').addEventListener('click',()=>{releasePointer();$('#rules-dialog').showModal();});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
  document.querySelectorAll('[data-brush]').forEach(b=>b.addEventListener('click',()=>{brush=Number(b.dataset.brush);document.querySelectorAll('[data-brush]').forEach(btn=>{const active=Number(btn.dataset.brush)===brush;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));});}));
  $('#sound').addEventListener('click',async()=>{const button=$('#sound');button.disabled=true;try{const on=await sound.toggle();button.setAttribute('aria-label',on?'关闭音效':'开启音效');button.setAttribute('aria-pressed',String(on));button.title=on?'关闭音效':'开启音效';$('#sound-label').textContent=on?'音效 开':'音效 关';$('#sound-waves').setAttribute('d',on?'M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14':'m16 9 5 6m0-6-5 6');}catch(e){status(e.message);}finally{button.disabled=false;}});
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();accumulator=0;releasePointer();});
  window.sandGame=Object.freeze({snapshot:()=>({level:current+1,...world.snapshot(),assetsReady,brush,soundEnabled:sound.enabled,audioPlayed:sound.played,best:[...best],bestSand:[...bestSand]}),levels:()=>levels.map(l=>({id:l.id,title:l.title,features:[...l.features]}))});
  load(0);requestAnimationFrame(frame);assetLoad.then(()=>{assetsReady=true;$('#loading').hidden=true;lastTime=performance.now();}).catch(e=>{$('#loading-text').textContent=e.message;$('#reload-assets').hidden=false;});$('#reload-assets').addEventListener('click',()=>location.reload());
})();
