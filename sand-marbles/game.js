(() => {
  'use strict';
  const {W,H,BOTTOM:SOIL_BOTTOM,GW,CELL,STEP,World,jarMouth,CART_MOUTH}=SandCore,levels=SandLevels;
  const entry=SandMagic.parseStart(location.search),roundSeeds=new Map();
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s);
  const colors={amber:{light:'#fff9c8',mid:'#ffd35a',base:'#f28a15',dark:'#975012',label:'琥珀'},blue:{light:'#e8fcff',mid:'#75dcff',base:'#2494dd',dark:'#24549a',label:'冰蓝'},jade:{light:'#eaffc9',mid:'#9cee9c',base:'#37ad7e',dark:'#26734e',label:'青玉'},rose:{light:'#fff0fb',mid:'#ffaad6',base:'#df5ba6',dark:'#972d7a',label:'玫瑰'}};
  const features={worm:['〰','蚯蚓'],porter:['♟','方向盘操作员'],rival:['⚑','盗宝人']};
  const typeLabels={glass:'● 玻璃·顺滑',heavy:'⊕ 重力·更沉',rubber:'◎ 弹力·回弹',light:'◇ 轻盈·慢落'};
  const soil=document.createElement('canvas'),texture=document.createElement('canvas'),earth=document.createElement('canvas');soil.width=texture.width=earth.width=W;soil.height=texture.height=SOIL_BOTTOM;earth.height=H;
  const wall=document.createElement('canvas');wall.width=W;wall.height=SOIL_BOTTOM+12;const wc=wall.getContext('2d');let wallRevision=-1;
  const sc=soil.getContext('2d'),tc=texture.getContext('2d'),ec=earth.getContext('2d'),sound=new SandAudio(),best=new Map(),bestSand=new Map(),bestScores=new Map();
  const assetSources={lift:'rival-lift-v18',turn:'rival-turn-v18',drill:'rival-drill-v18',pickup:'rival-pickup-v18',reactions:'rival-reactions-v18',aim:'rival-drill-aim-v18',rest:'rival-rest-v16',console:'console-layers-v16',magic:'magic-kit-v16',props:'props-v7',cart:'cart-v8',loot:'mining-props-v10',motion:'rival-motion-v12',bomb:'bomb-kit-v12',operator:'operator-v13',blast:'blast-v13',controls:'control-props-v14',operatorComplete:'operator-actor-v17'};
  const art=Object.fromEntries(Object.keys(assetSources).map(name=>[name,new Image()]));let assetsReady=false;
  const assetLoad=Promise.all(Object.entries(art).map(([name,img])=>new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('角色素材加载失败，请重试'));img.src=`assets/${assetSources[name]}.png`;})));
  const sessionSeen=new Set();let pendingIntro=[],floaters=[],bursts=[];
  let manualPaused=false,resumeCueUntil=0;
  let world,current=0,brush=20,speech='',speechUntil=0,pointer=null,cursor=null,lastTime=0,accumulator=0,particles=[],dust=[],rivalDust=0,wormDust=new Map(),seed=42,lastHud='',finished=false,motionCheck=0,stillFor=0,motionPositions=[];
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function status(text){speech=text;speechUntil=(world?.time||0)+3;$('#status').textContent=text;}
  function makeTextures(){
    seed=42+current;wallRevision=-1;const g=tc.createLinearGradient(0,0,W,SOIL_BOTTOM);g.addColorStop(0,'#d99b56');g.addColorStop(.5,'#c58a48');g.addColorStop(1,'#b7743c');tc.fillStyle=g;tc.fillRect(0,0,W,SOIL_BOTTOM);
    for(let y=70;y<SOIL_BOTTOM;y+=62){tc.beginPath();tc.moveTo(0,y);for(let x=0;x<=W;x+=14)tc.lineTo(x,y+Math.sin(x*.018+y)*9);tc.strokeStyle='#78462426';tc.lineWidth=9;tc.stroke();}
    for(let i=0;i<4300;i++){const x=random()*W,y=random()*SOIL_BOTTOM,r=.35+random()*1.1;tc.fillStyle=random()>.55?'#fff4d352':'#af702319';tc.beginPath();tc.ellipse(x,y,r*1.5,r,0,0,Math.PI*2);tc.fill();}
    for(let i=0;i<38;i++){const x=random()*W,y=60+random()*490;tc.fillStyle='#d9934525';tc.beginPath();tc.ellipse(x,y,4+random()*6,1.8,-.3,0,Math.PI*2);tc.fill();tc.fillStyle='#fff2bf55';tc.fillRect(x-3,y-2,5,1);}
    sc.clearRect(0,0,W,SOIL_BOTTOM);sc.drawImage(texture,0,0);
    const depth=ec.createLinearGradient(0,0,0,SOIL_BOTTOM);depth.addColorStop(0,'#bd804a');depth.addColorStop(.5,'#956039');depth.addColorStop(1,'#70452e');ec.fillStyle=depth;ec.fillRect(0,0,W,H);
    for(let i=0;i<1000;i++){ec.fillStyle=random()>.5?'#f1ba7930':'#381c1b20';ec.beginPath();ec.arc(random()*W,random()*SOIL_BOTTOM,random()*2,0,Math.PI*2);ec.fill();}
    // Exposed earth has compressed strata, small stones and brighter grains.
    for(let y=62;y<SOIL_BOTTOM;y+=14){ec.beginPath();ec.moveTo(0,y);for(let x=0;x<=W;x+=16)ec.lineTo(x,y+Math.sin(x*.025+y)*3);ec.strokeStyle=y%3?'#e8b97820':'#46271826';ec.lineWidth=1+random()*2;ec.stroke();}
    for(let i=0;i<1300;i++){const x=random()*W,y=random()*SOIL_BOTTOM,r=.4+random()*1.5;ec.fillStyle=random()<.5?'#edbb734c':'#3a231a40';ec.beginPath();ec.ellipse(x,y,r*1.4,r,0,0,Math.PI*2);ec.fill();}
    const floor=ec.createLinearGradient(0,SOIL_BOTTOM,0,H);floor.addColorStop(0,'#d99151');floor.addColorStop(.4,'#efbb78');floor.addColorStop(1,'#f9d598');ec.fillStyle=floor;ec.fillRect(0,SOIL_BOTTOM,W,H-SOIL_BOTTOM);
    ec.fillStyle='#ad6c3720';ec.beginPath();ec.ellipse(280,710,310,32,0,0,Math.PI*2);ec.fill();
    for(let i=0;i<30;i++){const x=random()*W,y=704+random()*56;ec.fillStyle='#c6884329';ec.beginPath();ec.ellipse(x,y,2+random()*4,1.5,0,0,Math.PI*2);ec.fill();}
    syncTerrain();
  }
  function syncTerrain(){for(const i of world.terrain.changes){const x=i%GW*CELL,y=Math.floor(i/GW)*CELL;if(world.terrain.grid[i])sc.drawImage(texture,x,y,2,2,x,y,2,2);else sc.clearRect(x,y,2,2);}world.terrain.changes.length=0;
    if(wallRevision!==world.terrain.revision){wallRevision=world.terrain.revision;wc.clearRect(0,0,W,wall.height);
      wc.drawImage(soil,0,8);wc.globalCompositeOperation='source-in';wc.fillStyle='#5d382ccc';wc.fillRect(0,0,W,wall.height);wc.globalCompositeOperation='source-over';
      wc.save();wc.shadowColor='#35211688';wc.shadowBlur=5;wc.drawImage(soil,0,4);wc.restore();
      wc.globalCompositeOperation='source-in';wc.fillStyle='#9e643bdd';wc.fillRect(0,0,W,wall.height);wc.globalCompositeOperation='source-over';
    }
  }
  function updateLevelGrid(){
    const grid=$('#level-grid');grid.replaceChildren();$('#session-summary').textContent=`本次探索 ${best.size} / 15 关 · 已得 ${[...best.values()].reduce((a,b)=>a+b,0)} / 45 星`;
    for(let chapter=0;chapter<3;chapter++){const title=document.createElement('h3');title.textContent=['01—05 · 初识沙径','06—10 · 地下奇遇','11—15 · 沙径大师'][chapter];grid.append(title);const row=document.createElement('div');row.className='chapter-grid';
      for(let i=chapter*5;i<chapter*5+5;i++){const b=document.createElement('button');b.dataset.level=i;b.setAttribute('aria-label',`第 ${i+1} 关：${levels[i].title}`);b.className=i===current?'active':'';const num=document.createElement('b');num.textContent=String(i+1).padStart(2,'0');const name=document.createElement('span');name.textContent=levels[i].title;const stars=document.createElement('small');stars.className='earned-stars';stars.textContent=best.has(i)?'★'.repeat(best.get(i)):'未通关';b.append(num,name,stars);if(bestSand.has(i)){const record=document.createElement('small');record.className='sand-record';record.textContent=`最高 ${bestScores.get(i)} 分 · ${bestSand.get(i)} 沙`;b.append(record);}b.addEventListener('click',()=>{$('#level-dialog').close();load(i);});row.append(b);}grid.append(row);
    }
  }
  function load(index){
    operatorAnimation.reset();manualPaused=false;resumeCueUntil=0;$('#pause').textContent='Ⅱ 看图暂停';$('#pause').setAttribute('aria-pressed','false');$('#pause-note').hidden=true;$('#resume-cue').hidden=true;
    releasePointer();current=index;if(!roundSeeds.has(index))roundSeeds.set(index,entry.seed??Math.floor(Math.random()*4294967296));world=new World(levels[index],{seed:roundSeeds.get(index)});finished=false;speech='';speechUntil=0;cursor=null;particles=[];floaters=[];bursts=[];dust=[];rivalDust=0;wormDust.clear();accumulator=0;lastHud='';motionCheck=0;stillFor=0;motionPositions=[];
    makeTextures();$('#level-number').textContent=String(index+1).padStart(2,'0');$('#level-title').textContent=levels[index].title;$('#difficulty').textContent=levels[index].difficulty;
    $('#result').hidden=true;$('#result-stars').hidden=true;$('#return-result').hidden=true;$('#rules-budget').textContent=`本关：三星 ≤ ${world.budget.three} 沙量；二星 ≤ ${world.budget.two} 沙量。`;
    $('#features').replaceChildren();const types=[...new Set(levels[index].groups.flatMap(g=>g.types||['glass']))];
    for(const text of [...types.map(t=>typeLabels[t]),...levels[index].features.map(f=>features[f].join(' '))]){const s=document.createElement('span');s.textContent=text;$('#features').append(s);}
    updateLevelGrid();status(levels[index].note);updateHud();render();pendingIntro=SandCodex.forLevel(levels[index]).filter(id=>!sessionSeen.has(id));if(pendingIntro.length)openCodex(true);
  }
  function updateHud(){
    const seconds=Math.ceil(world.timeRemaining);$('#round-clock').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;$('#round-clock').setAttribute('aria-label',`剩余 ${seconds} 秒`);$('.score-panel').dataset.qualified=String(world.score>=world.targetScore);$('.score-panel').dataset.urgent=String(seconds<=10);
    const key=`${world.score}:${world.remainingPotential()}:${world.terrain.units}`;if(key!==lastHud){lastHud=key;$('#collected').textContent=`${world.score} / ${world.targetScore} 分`;$('#target-score').textContent=world.targetScore;$('#current-score').textContent=world.score;$('#remaining-score').textContent=world.remainingPotential();$('#score-meter').max=world.targetScore;$('#score-meter').value=world.score;$('#dug-count').textContent=world.terrain.units;$('#star-budget').textContent=`三星 ≤ ${world.budget.three} · 二星 ≤ ${world.budget.two}`;const meter=$('#sand-meter');meter.max=world.budget.two;meter.low=world.budget.three;meter.high=world.budget.two;meter.optimum=0;meter.value=Math.min(world.terrain.units,world.budget.two);meter.setAttribute('aria-valuetext',`已挖 ${world.terrain.units}，三星额度 ${world.budget.three}，二星额度 ${world.budget.two}`);}
    if(world.started&&world.time-motionCheck>=1){const active=world.balls.filter(b=>b.active),moving=active.some((b,i)=>!motionPositions[i]||Math.hypot(b.x-motionPositions[i][0],b.y-motionPositions[i][1])>2);stillFor=moving||pointer?0:stillFor+world.time-motionCheck;motionPositions=active.map(b=>[b.x,b.y]);motionCheck=world.time;}
    $('#board-wrap').dataset.danger=world.state==='playing'?(world.rival?.danger||'distant'):'distant';
    $('#board-instruction').textContent=world.magic.pending?(world.magic.snapshot().active?.kind==='refill'?'沙流回填中 · 暂停计时与操作':'小炸弹！快让珠子离开闪光圈'):world.state==='won'?'目标达成！':world.state==='lost'?(world.endCause==='timeout'?'时间到 · 未达过关门槛':'分数机会不足 · 可查看后重来'):world.score>=world.targetScore?'已达标，继续冲分！':!world.balls.some(b=>b.active)&&world.recoverableBag().length?'珠子在盗宝袋里！等漏珠或用爆炸追回。':stillFor>=6&&world.balls.some(b=>b.active)?`还有 ${world.balls.filter(b=>b.active).length} 颗停在沙中 · 可继续挖沙`:world.rival&&!world.rival.escaped&&world.started?(world.rival.danger==='near'?'快！盗宝人就在珠子旁边':world.rival.danger==='approaching'?'小心，他越来越近了！':'盗宝人开挖了，快送珠子回家'):'划开沙土，让珠子落入同色矿车';
    const line=$('#board-instruction').textContent;if((!speech||world.time>=speechUntil||world.magic.pending||world.state!=='playing')&&speech!==line){speech=line;speechUntil=world.time+1.2;$('#status').textContent=line;}
  }
  function finish(){
    if(finished)return;finished=true;releasePointer();const won=world.state==='won',last=current===levels.length-1;
    const oldRecord=bestSand.get(current),oldScore=bestScores.get(current);if(won){bestScores.set(current,Math.max(oldScore??0,world.score));best.set(current,Math.max(best.get(current)||0,world.stars));bestSand.set(current,Math.min(oldRecord??Infinity,world.terrain.units));}
    $('#result-symbol').textContent=won?'':'↻';$('#result-symbol').hidden=won;$('#result-stars').hidden=!won;
    if(won){$('#result-stars').replaceChildren();for(let i=0;i<3;i++){const star=document.createElement('span');star.textContent='★';star.className=i<world.stars?'lit':'';$('#result-stars').append(star);}$('#result-stars').setAttribute('aria-label',`${world.stars} 星，满分 3 星`);}
    $('#result-score').hidden=!won;$('#result-score').textContent=`挖沙 ${world.terrain.units} · ${world.terrain.units<=world.budget.three?'三星余量 '+(world.budget.three-world.terrain.units):'距离三星还需少挖 '+(world.terrain.units-world.budget.three)} 沙`;
    $('#result-kicker').textContent=won?(last?(best.size===15?'FIFTEEN LITTLE VICTORIES':'FINALE COMPLETE'):'BEAUTIFULLY DONE'):'LET’S TRY AGAIN';
    $('#result-title').textContent=won?(last?(best.size===15?'十五段沙径，全部走过。':'终章通关，精彩收尾。'):world.stars===3?'不多不少，刚刚好。':'目标达成，满载而归。'):'换一条路，再试一次。';
    $('#result-description').textContent=won?`${world.endCause==='timeout'?'时间到':'珠子全部结算'}！最终 ${world.score} 分，过关门槛 ${world.targetScore} 分，接到 ${world.collected} 颗珠子。${world.stars<3?'试试更短的路线，少挖一些沙，挑战三星。':'这条精细的沙径，值得三颗星。'}`:world.reason;
    renderBreakdown();
    $('#result-action').innerHTML=won?(last?'回到第一关 <span>↻</span>':'下一关 <span>→</span>'):'重新挑战 <span>↻</span>';
    $('#result-review').hidden=won;$('#result-review').textContent=world.endCause==='timeout'?'查看本局地图':'查看失误位置';$('#result-record').hidden=!won;$('#result-record').textContent=won?`${oldScore===undefined||world.score>oldScore?'本次新高！':'本次最高：'}${bestScores.get(current)} 分 · 最少 ${bestSand.get(current)} 沙`:'';$('#result-replay').hidden=!won;$('#result-replay').textContent='再玩一次，挑战更高分';$('#result').hidden=false;updateLevelGrid();
  }
  function marble(c,x,y,r,color,alpha=1){
    const p=colors[color];c.save();c.globalAlpha=alpha;c.shadowColor='#160d0980';c.shadowBlur=2;c.shadowOffsetY=2;
    const g=c.createRadialGradient(x-r*.33,y-r*.42,r*.04,x,y,r);g.addColorStop(0,p.light);g.addColorStop(.23,p.light);g.addColorStop(.42,p.mid);g.addColorStop(.70,p.base);g.addColorStop(1,p.dark);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.shadowColor='transparent';c.strokeStyle=p.mid;c.lineWidth=.9;c.stroke();
    c.beginPath();c.ellipse(x-r*.29,y-r*.40,r*.31,r*.24,-.5,0,Math.PI*2);c.fillStyle='#ffffffed';c.fill();c.beginPath();c.arc(x+r*.15,y+r*.03,r*.67,.1,2.4);c.lineWidth=r*.16;c.strokeStyle=p.light+'99';c.stroke();c.restore();
  }
  function rockDraw(rock){
    if(!assetsReady)return;ctx.save();ctx.translate(rock.x,rock.y);ctx.rotate(rock.angle||0);
    ctx.beginPath();ctx.ellipse(0,0,rock.rx,rock.ry,0,0,Math.PI*2);ctx.fillStyle='#916044';ctx.fill();ctx.clip();
    ctx.drawImage(art.props,654,173,583,444,-rock.rx,-rock.ry,rock.rx*2,rock.ry*2);ctx.restore();
  }
  function lootDraw(frame,x,y,w=42,h=42){if(!assetsReady)return;const cell=art.loot.width/2;ctx.drawImage(art.loot,frame%2*cell,Math.floor(frame/2)*cell,cell,cell,x-w/2,y-h/2,w,h);}
  function hazardDraw(){
    for(const bag of world.droppedBags){const cw=art.motion.width/4,ch=art.motion.height/3;ctx.save();ctx.globalAlpha=bag.balls.length?1:Math.max(0,2-bag.age);ctx.drawImage(art.motion,3*cw,2*ch,cw,ch,bag.x-21,bag.y-16,42,42);ctx.restore();}
    for(const t of world.treasures)if(!t.opened){if(t.kind==='bag')atlasSprite(art.magic,3,2,0,t.x,t.y,48,48);else lootDraw(1,t.x,t.y,42,42);ctx.fillStyle='#fff3bc';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.strokeStyle='#4b302b';ctx.lineWidth=3;ctx.strokeText(t.kind==='bag'?'! 随机风险':'+'+t.points,t.x,t.y+25);ctx.fillText(t.kind==='bag'?'! 随机风险':'+'+t.points,t.x,t.y+25);}
    for(const b of world.bombs){if(['spent','disabled'].includes(b.state))continue;const p=world.hazards.bombPoint(b),pad=b.pad,u=Math.min(1,b.age/b.fuseSeconds),burning=b.state==='burning';ctx.save();ctx.setLineDash([4,5]);ctx.strokeStyle=burning?'#ffca77':'#fff0bf66';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,b.radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      const bend={x:pad.x+(p.x-pad.x)*.5+20,y:(pad.y+p.y)*.5};const fuse=t=>({x:(1-t)**2*pad.x+2*(1-t)*t*bend.x+t*t*p.x,y:(1-t)**2*pad.y+2*(1-t)*t*bend.y+t*t*p.y});
      ctx.lineCap='round';ctx.strokeStyle='#54311b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(pad.x,pad.y);ctx.quadraticCurveTo(bend.x,bend.y,p.x,p.y);ctx.stroke();ctx.strokeStyle='#d7af73';ctx.lineWidth=2;ctx.setLineDash([2,3]);ctx.stroke();ctx.setLineDash([]);
      if(burning){ctx.strokeStyle='#5b3930';ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<=30;i++){const q=fuse(u*i/30);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();const q=fuse(u);ctx.shadowColor='#ff8d27';ctx.shadowBlur=15;ctx.fillStyle='#fffbd1';ctx.beginPath();ctx.arc(q.x,q.y,4,0,Math.PI*2);ctx.fill();for(let i=0;i<6;i++){const a=i*Math.PI/3+world.time*5;ctx.strokeStyle=i%2?'#ffd66c':'#ff842f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x+Math.cos(a)*5,q.y+Math.sin(a)*5);ctx.lineTo(q.x+Math.cos(a)*10,q.y+Math.sin(a)*10);ctx.stroke();}ctx.shadowBlur=0;}
      bombArt(ctx,0,p.x,p.y,48,45);bombArt(ctx,burning?2:1,pad.x,pad.y,37,31);if(burning){ctx.fillStyle='#fff0b6';ctx.beginPath();ctx.arc(p.x+15,p.y-12,2+Math.sin(world.time*16),0,Math.PI*2);ctx.fill();}ctx.restore();}
  }
  function bombArt(c,frame,x,y,w,h){if(!assetsReady)return;const cw=art.bomb.width/2,ch=art.bomb.height/2;c.drawImage(art.bomb,frame%2*cw,Math.floor(frame/2)*ch,cw,ch,x-w/2,y-h/2,w,h);}

  function railDraw(){
    ctx.save();for(let x=-12;x<W;x+=31){const g=ctx.createLinearGradient(0,622,0,660);g.addColorStop(0,'#b5844d');g.addColorStop(1,'#6c482e');ctx.fillStyle=g;roundRect(ctx,x,622,19,39,3);ctx.fill();ctx.strokeStyle='#dfb27688';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+4,627);ctx.lineTo(x+5,653);ctx.stroke();}
    for(const y of [627,646]){ctx.fillStyle='#4b4338';ctx.fillRect(0,y, W,5);ctx.fillStyle='#bdbca8';ctx.fillRect(0,y, W,2);ctx.fillStyle='#fff5d79c';ctx.fillRect(0,y, W,1);}
    ctx.restore();
  }
  function jarLabel(jar){
    const mouth=jarMouth(jar),{x,y,halfWidth,halfHeight,rimWidth}=mouth,p=colors[jar.color];ctx.save();
    ctx.strokeStyle=p.base;ctx.lineWidth=rimWidth;roundRect(ctx,x-halfWidth-rimWidth/2,y-halfHeight-rimWidth/2,halfWidth*2+rimWidth,halfHeight*2+rimWidth,5);ctx.stroke();ctx.strokeStyle=p.light;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-halfWidth+5,y-halfHeight-rimWidth/2);ctx.lineTo(x+halfWidth-5,y-halfHeight-rimWidth/2);ctx.stroke();
    const badge=ctx.createLinearGradient(x,y+22,x,y+42);badge.addColorStop(0,p.base);badge.addColorStop(1,p.dark);ctx.fillStyle=badge;roundRect(ctx,x-22,y+21,44,19,5);ctx.fill();ctx.strokeStyle=p.light;ctx.lineWidth=.8;ctx.stroke();
    ctx.fillStyle='#fffaf0';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(p.label+(jar.balls.length?' '+jar.balls.length:''),x,y+34);
    if(world.operator?.phase==='control'&&world.operator.activeJar===world.jars.indexOf(jar)){ctx.fillStyle=p.light;ctx.shadowColor=p.mid;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(x-30,y+31,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=p.light;ctx.lineWidth=2;roundRect(ctx,x-25,y+18,50,25,6);ctx.stroke();ctx.fillStyle=p.light;ctx.font='bold 13px sans-serif';ctx.fillText('驾驶中',x,y+57);}
    if(jar.flash>0){ctx.globalAlpha=jar.flash;ctx.strokeStyle='#fff6ac';ctx.lineWidth=4;roundRect(ctx,x-49,y-9,98,18,5);ctx.stroke();}ctx.restore();
  }
  function jarDraw(jar){
    if(!assetsReady)return;if(!jar.intact){lootDraw(3,jar.x,618,118,88);return;}const {x,y,halfWidth}=jarMouth(jar),scale=halfWidth/520;
    ctx.save();ctx.fillStyle='#43281733';ctx.beginPath();ctx.ellipse(x,648,54,5,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.rect(x-50,y-12,100,78);ctx.clip();ctx.drawImage(art.cart,x-782*scale,y-250*scale,1572*scale,1001*scale);ctx.restore();for(const side of [-1,1]){ctx.fillStyle=jar.bumpTime?'#cbb18a':'#514b44';roundRect(ctx,x+side*51-1,617,2,10,1);ctx.fill();}if(jar.bumpTime){ctx.strokeStyle='#ffe2a4';ctx.lineWidth=1.5;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(x+side*52,612);ctx.lineTo(x+side*55,608);ctx.moveTo(x+side*52,631);ctx.lineTo(x+side*55,635);ctx.stroke();}}
    // Spokes rotate with actual horizontal displacement, wheels stay on the rails.
    for(const wx of [x-29.5,x+29.5]){ctx.save();ctx.translate(wx,633.5);ctx.rotate((x-jar.homeX)/11.5);ctx.strokeStyle='#e6c28c88';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(9,0);ctx.stroke();}ctx.restore();}ctx.restore();
  }
  function cargoDraw(jar){
    if(!jar.intact)return;const mouth=jarMouth(jar);
    // Every stored bead is drawn once, with the same identity and material as its catch.
    for(const b of jar.balls){const age=Math.max(0,world.time-b.caughtAt),bounce=age<.35?Math.sin(age/.35*Math.PI)*4:0,x=jar.x+b.cargoX,y=mouth.y+b.cargoY-bounce;
      marble(ctx,x,y,5.5,b.color);ctx.save();ctx.translate(x,y);ctx.scale(.65,.65);drawMaterial({...b,x:0,y:0});ctx.restore();}
    // Only the near lip occludes the gems. Keep the upper opening and piled cargo visible.
    ctx.save();ctx.strokeStyle=colors[jar.color].base;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(jar.x-42,mouth.y+7);ctx.lineTo(jar.x+42,mouth.y+7);ctx.stroke();ctx.restore();
  }
  function drawMaterial(b){
    if(b.waste){ctx.save();ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.clip();ctx.drawImage(art.magic,586,590,362,362,b.x-b.r,b.y-b.r,b.r*2,b.r*2);ctx.restore();marble(ctx,b.x+b.r*.3,b.y-b.r*.4,b.r*.23,b.color);return;}if(b.type==='glass')return;ctx.save();ctx.translate(b.x,b.y);ctx.lineCap='round';
    if(b.type==='heavy'){ctx.strokeStyle='#3a3435';ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(0,0,b.r-.7,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#fff4d2';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.moveTo(0,-5);ctx.lineTo(0,5);ctx.stroke();}
    if(b.type==='rubber'){ctx.strokeStyle='#563747';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(-5,5);ctx.lineTo(5,-5);ctx.stroke();ctx.strokeStyle='#fff4dd';ctx.lineWidth=2.5;ctx.stroke();}
    if(b.type==='light'){ctx.fillStyle='#fffdf4';ctx.strokeStyle='#665e50';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,0);ctx.lineTo(0,6);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();
  }
  function mechanismDraw(){
    if(!assetsReady)return;
    for(const w of world.worms.filter(w=>w.alive)){const frame=Math.floor(world.time*7)%2;ctx.save();ctx.translate(w.x,w.y);ctx.rotate(Math.atan2(w.vy,w.vx));
      ctx.shadowColor='#66312266';ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.drawImage(art.props,frame?640:24,845,590,275,-44,-13,51,24);ctx.restore();}
  }
  function atlasSprite(img,columns,rows,frame,x,y,w,h,dir=1){const cw=img.width/columns,ch=img.height/rows;ctx.save();ctx.translate(x,y);ctx.scale(dir,1);ctx.drawImage(img,frame%columns*cw,Math.floor(frame/columns)*ch,cw,ch,-w/2,-h/2,w,h);ctx.restore();}
  const operatorAnimation=new SandOperatorAnimation();
  // Foot anchors are measured per cell; only one fully opaque frame is drawn.
  const operatorAnchors=[[123.0, 252], [122.0, 252], [122.0, 252], [122.0, 252], [121.0, 252], [123.0, 252], [137.0, 252], [137.0, 253], [135.5, 253], [135.5, 252], [134.5, 253], [122.5, 252], [126.0, 252], [126.5, 251], [126.0, 251], [125.5, 252], [127.0, 252], [123.0, 252], [126.0, 251], [126.0, 250], [126.5, 251], [126.0, 250], [128.0, 251], [124.5, 251]];
  function operatorSprite(frame,cx=ctx,x=448,foot=738,scale=.39){
    const [ax,ay]=operatorAnchors[frame];cx.drawImage(art.operatorComplete,frame%6*256,Math.floor(frame/6)*256,256,256,x-ax*scale,foot-ay*scale,256*scale,256*scale);
  }
  const signalOrder=['amber','jade','blue','rose'];
  function controlSignals(){
    const o=world.operator;if(!o)return;const x=525,y=686,h=84,w=84;
    atlasSprite(art.controls,3,2,1,x,y,w,h);
    // Measured lens centers in the generated post; socket and glow share anchors.
    const centers=[.254,.431,.607,.789];
    for(let i=0;i<4;i++){const color=signalOrder[i],cy=y-h/2+h*centers[i],available=world.jars.some(j=>j.color===color&&j.intact),lit=available&&o.phase==='control'&&o.signalColor===color;
      ctx.save();ctx.globalAlpha=lit?1:available?.18:.04;atlasSprite(art.controls,3,2,2+i,x,cy,26,26);ctx.restore();
      ctx.font='bold 13px sans-serif';ctx.textAlign='right';ctx.fillStyle=lit?colors[color].dark:'#92683f';if(lit)ctx.fillText(colors[color].label,x-15,cy+4);
    }
  }
  function emptyConsole(){
    // The plinth never translates or rotates. Only the isolated wheel layer turns.
    ctx.drawImage(art.console,0,0,768,1024,411.6,653.3,76.8,102.4);
    ctx.save();ctx.translate(450,673);ctx.scale(1,.88);ctx.rotate(operatorAnimation.wheelAngle);
    ctx.drawImage(art.console,809,145,684,680,-24,-24,48,48);ctx.restore();
  }
  function porterDraw(){
    if(!assetsReady||!world.operator)return;const o=world.operator,t=world.time;
    controlSignals();
    if(o.phase==='gone'||o.phase==='flee'){emptyConsole();if(o.phase==='flee')atlasSprite(art.operator,3,2,4+Math.floor(t*12)%2,o.x,692+Math.sin(t*25)*1.5,90,90);}
    else{
      ctx.save();ctx.globalAlpha=1;
      const frame=operatorAnimation.update(o,t);
      emptyConsole();
      if(o.phase==='scared')operatorSprite(13,ctx,448,738-Math.max(0,Math.sin(o.age*12))*3);
      else operatorSprite(frame);
      ctx.restore();
    }
    ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillStyle='#765333';ctx.fillText(o.phase==='gone'||o.phase==='flee'?'无人控制 · 车队停机':o.phase==='scared'?'受惊刹车':o.signalColor?colors[o.signalColor].label+' · '+(o.speed<-.5?'向左':o.speed>.5?'向右':'接管中'):'车队停机',445,750);
  }
  function sackDraw(r){const p=r.bagPoint(),size=38*r.bagScale,dir=r.fx<0?-1:1,bob=r.phase==='running'?Math.sin(world.time*15)*1.3:0,cw=art.motion.width/4,ch=art.motion.height/3;ctx.save();ctx.translate(p.x,p.y+bob);ctx.scale(dir,1);ctx.drawImage(art.motion,3*cw,2*ch,cw,ch,-size*.513,-size*.322,size,size);ctx.restore();if(r.bag.length){for(let i=0;i<Math.min(4,r.bag.length);i++)marble(ctx,p.x+(i-1.5)*4,p.y+bob,3,r.bag[r.bag.length-1-i].color);ctx.fillStyle='#4a3026';roundRect(ctx,p.x-9,p.y+size*.49,18,12,4);ctx.fill();ctx.fillStyle='#ffe9af';ctx.textAlign='center';ctx.font='bold 10px sans-serif';ctx.fillText(r.bag.length,p.x,p.y+size*.49+10);}if(r.torn){ctx.strokeStyle='#452b20';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-6,p.y+size*.43);ctx.lineTo(p.x-2,p.y+size*.37);ctx.lineTo(p.x+3,p.y+size*.45);ctx.stroke();}}
  function rivalDraw(){
    const r=world.rival;if(!r||r.escaped||!assetsReady)return;const t=world.time,dir=r.fx<0?-1:1,size=68;ctx.save();ctx.fillStyle='#52362c';roundRect(ctx,r.x-19,r.y-56,38,5,2);ctx.fill();ctx.fillStyle=r.stamina<35?'#ef9d47':'#80be77';roundRect(ctx,r.x-18,r.y-55,36*r.stamina/100,3,1);ctx.fill();ctx.restore();
    const restFrame=SandRivalRest.frame(r);
    sackDraw(r);
    if(restFrame!==null){const p=SandRivalRest.pose(restFrame);ctx.save();ctx.translate(r.x,r.y+16);ctx.scale(dir,1);ctx.drawImage(art.rest,...p.source,p.x,p.y,p.width,p.height);ctx.restore();}
    else {
      const pose=SandRivalAnimation.pose(r),draw=SandRivalAnimation.drawing(r,pose);
      ctx.save();ctx.translate(r.x,r.y);if(r.phase==='stun')ctx.rotate(dir*.25);ctx.scale(draw.dir,1);ctx.drawImage(art[pose.sheet],...draw.source,draw.x,draw.y,draw.width,draw.height);ctx.restore();
    }
    if(r.pickup||restFrame!==null||r.phase==='listen'||r.phase==='stun'||r.bag.length>=6&&r.phase==='running'){
      // Independent parked drill; never draw another body or a fabricated arm over a complete pose.
      const p=SandRivalAnimation.reactions[11];ctx.save();ctx.translate(r.x+dir*27,r.y+21);ctx.scale(dir,1);ctx.drawImage(art.reactions,...p.source,-10,-34,28,34);ctx.restore();
    }
    if(r.pickup?.ball.held){const b=r.pickup.ball;marble(ctx,b.x,b.y,b.r,b.color);drawMaterial(b);}
    if(r.phase==='listen'){ctx.fillStyle='#ffe79e';ctx.font='bold 20px sans-serif';ctx.fillText('!',r.x+26,r.y-28);}
    if(r.phase==='stun')for(let i=0;i<3;i++){ctx.fillStyle='#ffe687';ctx.font='14px sans-serif';ctx.fillText('★',r.x+Math.cos(t*3+i*2.1)*23-5,r.y-40+Math.sin(t*3+i*2.1)*5);}
  }
  function magicDraw(){
    const e=world.magic.snapshot().active;if(!e||!assetsReady)return;ctx.save();
    if(e.kind==='bomb'&&e.age<.9){atlasSprite(art.magic,3,2,1,e.x,e.y+7,45,45);const rise=Math.min(1,e.age/.22)*20;ctx.globalAlpha=.78+.22*Math.sin(e.age*40);atlasSprite(art.magic,3,2,2,e.x,e.y-rise,48,48);ctx.globalAlpha=1;ctx.strokeStyle='#ffda7e';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(e.x,e.y,e.radius,0,Math.PI*2);ctx.stroke();}
    if(e.kind==='refill'){atlasSprite(art.magic,3,2,3,e.x,e.y,70,90);if(e.age>=.35){const y=e.progress*SOIL_BOTTOM;for(let x=8;x<W;x+=22){const offset=Math.sin(x*.21+e.age*37);ctx.fillStyle=x%3?'#ffe2a6':'#d99751';ctx.fillRect(x,y-6+offset*7,2,6+offset*3);}for(let x=40;x<W;x+=90){ctx.globalAlpha=e.age<1.55?.55:Math.max(0,(1.8-e.age)/.25)*.55;atlasSprite(art.magic,3,2,5,x,y,130,65);}}}
    ctx.restore();
  }
  function speechDraw(){
    const el=$('#operator-speech'),o=world.operator;
    el.querySelector('span').textContent=speech;el.hidden=!speech;el.dataset.present=String(!!o&&!['flee','gone'].includes(o.phase));
  }
  function renderBreakdown(){
    const r=world.roundReport(),box=$('#result-breakdown');box.replaceChildren();
    const table=document.createElement('table');table.className='round-table';
    const head=document.createElement('tr');for(const label of ['珠色','接到','被盗','错色','漏接','剩余']){const th=document.createElement('th');th.textContent=label;head.append(th);}table.append(head);
    for(const c of r.colors){const row=document.createElement('tr');for(const value of [colors[c.color].label,c.collected,c.stolen,c.wrong,c.missed,c.unsettled]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}table.append(row);}
    const total=document.createElement('p');total.className='report-total';total.textContent=`接珠 ${r.beadPoints} + 宝物 ${r.bonusPoints} = ${world.score} 分`;
    const note=document.createElement('small');note.textContent='被盗只计未追回的珠子；剩余包含场内和掉落袋。';
    box.append(table,total,note);
  }
  function openPotential(){
    resetInput();const r=world.roundReport(),box=$('#potential-content');box.replaceChildren();
    for(const text of [`场内自由珠 ${r.freeCount} 颗 · 手中未装袋 ${r.heldCount} 颗`,`地上袋内 ${r.droppedCount} 颗 · 盗宝袋可能追回 ${r.recoverableCount} 颗`,`珠子原值 ${r.rawBeadValue} 分 → 按车位限制，上限 ${r.beadPotential} 分`,`未开问号袋 ${r.unopenedBags} 个 · 宝箱 ${r.unopenedChests} 个`,`仍可触发的宝物上限 ${r.treasurePotential} 分（问号袋每个最多40，并非保底）`,`剩余上限 ${r.beadPotential} + ${r.treasurePotential} = ${r.remaining} 分`,`已有 ${world.score} + 剩余上限 ${r.remaining}，对照门槛 ${world.targetScore} 分`]){const p=document.createElement('p');p.textContent=text;box.append(p);}
    $('#potential-dialog').showModal();
  }
  function failureDraw(){
    const f=world.failure;if(!f||!f.color||!Number.isFinite(f.x))return;ctx.save();ctx.strokeStyle='#b73a32';ctx.fillStyle='#fff1da';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,(f.r||9)+5,0,Math.PI*2);ctx.stroke();marble(ctx,f.x,f.y,f.r||9,f.color);drawMaterial({x:f.x,y:f.y,r:f.r||9,type:f.material||'glass'});if(f.targetX!==undefined){roundRect(ctx,f.targetX-CART_MOUTH.halfWidth,f.targetY-CART_MOUTH.halfHeight,CART_MOUTH.halfWidth*2,CART_MOUTH.halfHeight*2,5);ctx.stroke();}const x=Math.max(76,Math.min(W-76,f.x));ctx.fillStyle='#9e342e';roundRect(ctx,x-72,518,144,34,7);ctx.fill();ctx.fillStyle='#fff9ee';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(f.kind==='stolen'?'被盗宝人抢走了！':f.target?`${colors[f.color].label} → ${colors[f.target].label} ×`:'珠子错过车斗开口',x,541);ctx.restore();
  }
  function render(){
    syncTerrain();ctx.clearRect(0,0,W,H);ctx.drawImage(earth,0,0);ctx.drawImage(wall,0,0);ctx.save();ctx.shadowColor='#41261a88';ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.drawImage(soil,0,0);ctx.restore();world.rocks.filter(r=>!r.broken&&!r.carriers?.length).forEach(rockDraw);hazardDraw();mechanismDraw();
    railDraw();world.jars.forEach(jarDraw);world.jars.forEach(cargoDraw);world.rocks.filter(r=>!r.broken&&r.carriers?.length).forEach(rockDraw);porterDraw();world.jars.filter(j=>j.intact).forEach(jarLabel);
    for(const b of world.balls)if(b.active&&!b.held){marble(ctx,b.x,b.y,b.r,b.color);drawMaterial(b);}rivalDraw();magicDraw();failureDraw();speechDraw();
    for(const p of dust){ctx.globalAlpha=Math.max(0,p.life/p.maxLife)*.18;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);g.addColorStop(0,'#f5d399');g.addColorStop(1,'#e9bb7600');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    for(const p of particles){ctx.save();ctx.globalAlpha=Math.min(1,p.life*3);ctx.translate(p.x,p.y);ctx.rotate(p.angle||0);ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(-p.size,-p.size*.5);ctx.lineTo(p.size*.6,-p.size);ctx.lineTo(p.size,p.size*.5);ctx.lineTo(-p.size*.5,p.size);ctx.closePath();ctx.fill();ctx.fillStyle='#ffe7ac99';ctx.fillRect(-p.size*.5,-p.size*.55,p.size*.8,.8);ctx.restore();}
    for(const f of floaters){ctx.save();ctx.globalAlpha=Math.min(1,f.life*2);ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillStyle=f.color;ctx.strokeStyle='#462e23';ctx.lineWidth=3;ctx.strokeText(f.text,f.x,f.y);ctx.fillText(f.text,f.x,f.y);ctx.restore();}for(const b of bursts){if(b.type==='blast'){ctx.save();const age=(1-b.life)*1.2,frame=age<.10?4:age<.28?5:age<.65?6:7;ctx.globalAlpha=age<.65?1:Math.max(0,(1.2-age)/.55);const size=b.radius*(frame===4?.95:frame===5?2:2.25);atlasSprite(art.blast,4,1,frame-4,b.x,b.y,size,size);ctx.restore();}ctx.save();ctx.globalAlpha=b.life;ctx.strokeStyle='#fff0a5';ctx.lineWidth=5*b.life;ctx.beginPath();ctx.arc(b.x,b.y,b.radius*(1-b.life*.6),0,Math.PI*2);ctx.stroke();ctx.restore();}
    if(cursor&&world.state==='playing'){ctx.beginPath();ctx.arc(cursor.x,cursor.y,brush,0,Math.PI*2);ctx.strokeStyle=pointer?'#fff8e7aa':'#fff8e770';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(cursor.x,cursor.y,2,0,Math.PI*2);ctx.fillStyle='#fff9e8c0';ctx.fill();}

  }
  function spray(x,y,dx,dy,count=5){
    const palette=['#efc478','#c58c48','#a06b38','#ffdfa2'];for(let i=0;i<count;i++)particles.push({x:x+(random()-.5)*9,y:y+(random()-.5)*9,vx:(random()-.5)*130+dx*24,vy:-35-random()*110+dy*15,life:.35+random()*.55,color:palette[Math.floor(random()*4)],size:.7+random()*2.4,angle:random()*6,spin:(random()-.5)*10,soil:true});
    if(count>4){const life=.3+random()*.2;dust.push({x,y,vx:dx*12,vy:-15,size:5+random()*8,life,maxLife:life});}
    if(particles.length>650)particles.splice(0,particles.length-650);if(dust.length>70)dust.splice(0,dust.length-70);
  }
  function drainEvents(){
    for(const e of world.events){if(e.type==='magic-warning'&&e.kind==='refill')releasePointer();if(e.type==='magic-refilled'&&!world.inputLocked){releasePointer();resumeCueUntil=performance.now()+3200;status('沙流停止！游戏继续，松开后重新划线。');}if(e.type==='magic-blast'){bursts.push({...e,type:'blast',life:1});spray(e.x,e.y,0,-1,18);}if(e.type==='magic-open')status(e.kind==='bomb'?'袋子里是小炸弹！':'沙流魔法！坑道即将回填，计时暂停。');if(['operator-flee','operator-return','bag-dropped','rival-escaped'].includes(e.type))status({'operator-flee':'操作员逃岗了！矿车停止，仍可接珠。','operator-return':'操作员缓过神来，矿车恢复移动。','bag-dropped':'盗宝人丢下袋子了，快追回珠子！','rival-escaped':'盗宝人逃出矿场了。'}[e.type]);if(e.type==='cart-bump')spray(e.x,e.y,0,-1,4);if(e.type==='spill'||e.type==='bag-torn')floaters.push({x:e.x,y:e.y,life:1.3,text:e.type==='spill'?'掉出来了！':'袋子破了！',color:'#ffe6a0'});sound.play(e.type,e.count||e.speed||0);if(['collect','treasure','loss'].includes(e.type))floaters.push({x:e.x,y:e.y,life:1.4,text:e.type==='collect'?`+${e.points??10}`:e.type==='treasure'?`+${e.points}`:(e.outcome==='stolen'?'被偷':e.outcome==='wrong-color'?'错色':'漏接')+' +0',color:e.type==='loss'?'#fff0d4':'#ffec87'});if(e.type==='loss')status('这颗 +0，已得分不扣。剩余珠子和宝物仍可争取。');if(['blast','puff','stun','cart-broken'].includes(e.type)){bursts.push({...e,radius:e.radius||25,life:1});spray(e.x,e.y,0,-1,14);}if(e.type==='collect')for(let i=0;i<6;i++)particles.push({x:e.x,y:e.y,vx:(random()-.5)*80,vy:-random()*80,life:.6,color:colors[e.color].mid,size:2});}
    world.events.length=0;
    if(world.rival&&world.rival.removed>rivalDust+6){const r=world.rival,tip=r.lastDigPoint||r.toolPoint();spray(tip.x,tip.y,-r.fx,-r.fy,5);rivalDust=r.removed;}
    for(const w of world.worms)if((w.dug||0)>(wormDust.get(w)||0)+10){spray(w.x,w.y,-w.vx/w.speed,-w.vy/w.speed,3);wormDust.set(w,w.dug);}if(world.started&&world.rival&&world.state==='playing'){if(world.rival.danger==='near')sound.play('danger');}if(world.started&&levels[current].mechanics.worms)sound.play('worm');if(world.state!=='playing')finish();
  }
  function frame(time){$('#resume-cue').hidden=performance.now()>=resumeCueUntil||manualPaused||world.inputLocked;$('#resume-cue').textContent='沙流停止 · 游戏继续｜重新按住划线';const delta=Math.min((time-lastTime)/1000||0,.05);lastTime=time;const paused=isPaused();
    if(!paused){if(world.state==='playing'){accumulator+=delta;while(accumulator>=STEP&&world.state==='playing'){world.step(STEP);accumulator-=STEP;}drainEvents();}const fxDelta=delta;for(const p of particles){const ny=p.y+p.vy*fxDelta;if(p.soil&&p.vy>0&&world.terrain.solid(p.x,ny)&&!world.terrain.solid(p.x,p.y)){p.vy*=-.2;p.vx*=.45;p.life=Math.min(p.life,.18);}else p.y=ny;p.x+=p.vx*fxDelta;p.vy+=330*fxDelta;p.angle=(p.angle||0)+(p.spin||0)*fxDelta;p.life-=fxDelta;}particles=particles.filter(p=>p.life>0);for(const p of dust){p.x+=p.vx*fxDelta;p.y+=p.vy*fxDelta;p.size+=14*fxDelta;p.life-=fxDelta;}dust=dust.filter(p=>p.life>0);for(const f of floaters){f.y-=22*fxDelta;f.life-=fxDelta;}floaters=floaters.filter(f=>f.life>0);for(const b of bursts)b.life-=fxDelta/(b.type==='blast'?1.2:.66);bursts=bursts.filter(b=>b.life>0);updateHud();render();}else accumulator=0;sound.setDrilling(!paused&&world.state==='playing'&&!world.magic.pausesWorld&&world.rival?.digContact);requestAnimationFrame(frame);
  }
  function isPaused(){return manualPaused||!assetsReady||document.hidden||$('#level-dialog').open||$('#rules-dialog').open||$('#potential-dialog').open;}
  function resetInput(){releasePointer();cursor=null;accumulator=0;lastTime=performance.now();}
  function drawCodexArt(){if(!assetsReady)return;for(const c of document.querySelectorAll('.codex-art')){const cx=c.getContext('2d'),id=c.dataset.element;cx.clearRect(0,0,88,70);if(id==='porter')operatorSprite(5,cx,44,69,.27);else if(id==='rival'){const p=SandRivalAnimation.drill[0];cx.drawImage(art.drill,...p.source,3,3,82,65);}else if(id==='rock')cx.drawImage(art.props,654,173,583,444,5,8,78,54);else if(id==='worm')cx.drawImage(art.props,24,845,590,275,4,17,80,37);else if(id==='bomb')bombArt(cx,0,44,35,70,60);else if(id==='bag'){cx.drawImage(art.magic,0,0,512,512,9,0,70,70);}else if(id==='chest'){const cell=art.loot.width/2,frame={bag:0,chest:1,bomb:2}[id];cx.drawImage(art.loot,frame%2*cell,Math.floor(frame/2)*cell,cell,cell,9,0,70,70);}else if(id==='score'||id==='multi'){cx.drawImage(art.cart,0,0,1572,1001,0,9,88,56);}else{marble(cx,44,34,22,{heavy:'amber',rubber:'jade',light:'blue'}[id]);cx.fillStyle='#fff9df';cx.strokeStyle='#644734';cx.lineWidth=2;cx.font='bold 24px sans-serif';cx.textAlign='center';cx.strokeText({heavy:'+',rubber:'/',light:'◇'}[id],44,43);cx.fillText({heavy:'+',rubber:'/',light:'◇'}[id],44,43);}}}
  function openCodex(first){resetInput();const ids=first?pendingIntro:Object.keys(SandCodex.entries);$('#codex-title').textContent=first?'新发现 · 先认识再开采':'矿场图鉴';$('#codex-close').hidden=first;$('#codex-confirm').hidden=!first;$('#rules-dialog').dataset.first=String(first);const content=$('#codex-content');content.replaceChildren();for(const id of ids){const entry=SandCodex.entries[id],card=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=entry.icon+' '+entry.name;p.textContent=entry.short.join(' ');const detail=document.createElement('details'),summary=document.createElement('summary'),full=document.createElement('p');summary.textContent='查看详细规则';full.textContent=entry.text;detail.append(summary,full);const preview=document.createElement('canvas');preview.className='codex-art';preview.width=88;preview.height=70;preview.dataset.element=id;card.append(preview,h,p,detail);content.append(card);}$('#rules-dialog').showModal();content.scrollTop=0;drawCodexArt();}
  $('#codex-confirm').addEventListener('click',()=>{for(const id of pendingIntro)sessionSeen.add(id);pendingIntro=[];$('#rules-dialog').close();resetInput();});
  $('#codex-close').addEventListener('click',()=>{if($('#rules-dialog').dataset.first!=='true')$('#rules-dialog').close();});
  for(const dialog of document.querySelectorAll('dialog')){dialog.addEventListener('close',resetInput);dialog.addEventListener('cancel',e=>{if(dialog.id==='rules-dialog'&&dialog.dataset.first==='true')e.preventDefault();});dialog.addEventListener('click',e=>{if(e.target!==dialog||dialog.dataset.first==='true')return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});}
  function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  function dig(a,b){
    const before=world.terrain.changes.length,removed=world.dig([a.x,a.y],[b.x,b.y],brush);if(!removed)return;sound.play('dig',removed);
    const cells=world.terrain.changes.slice(before),n=Math.min(14,Math.max(2,Math.ceil(removed/65))),length=Math.hypot(b.x-a.x,b.y-a.y)||1;
    for(let k=0;k<n;k++){const cell=cells[Math.min(cells.length-1,Math.floor((k+.5)/n*cells.length))];spray(cell%GW*CELL+1,Math.floor(cell/GW)*CELL+1,(b.x-a.x)/length,(b.y-a.y)/length,5);}
  }
  function releasePointer(){if(pointer&&canvas.hasPointerCapture(pointer.id))canvas.releasePointerCapture(pointer.id);pointer=null;}
  canvas.addEventListener('pointerdown',e=>{if(isPaused()||world.inputLocked||pointer||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();pointer={...position(e),id:e.pointerId};cursor=pointer;canvas.setPointerCapture(e.pointerId);dig(pointer,pointer);});
  canvas.addEventListener('pointermove',e=>{const p=position(e);cursor=p;if(!isPaused()&&pointer?.id===e.pointerId){dig(pointer,p);pointer={...p,id:e.pointerId};}});
  for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,e=>{if(pointer?.id===e.pointerId)releasePointer();if(e.pointerType!=='mouse')cursor=null;});canvas.addEventListener('lostpointercapture',()=>pointer=null);canvas.addEventListener('pointerleave',()=>{if(!pointer)cursor=null;});
  $('#potential').addEventListener('click',openPotential);
  $('#pause').addEventListener('click',()=>{if(world.state!=='playing')return;manualPaused=!manualPaused;resetInput();$('#pause').textContent=manualPaused?'▶ 继续游戏':'Ⅱ 看图暂停';$('#pause').setAttribute('aria-pressed',String(manualPaused));$('#pause-note').hidden=!manualPaused;});
  $('#restart').addEventListener('click',()=>load(current));
  $('#result-review').addEventListener('click',()=>{$('#result').hidden=true;$('#return-result').hidden=false;status(world.reason+' 地图已冻结，可查看后重来。');});$('#return-result').addEventListener('click',()=>{$('#result').hidden=false;$('#return-result').hidden=true;});
  $('#result-action').addEventListener('click',()=>load(world.state==='won'?(current+1)%levels.length:current));$('#result-replay').addEventListener('click',()=>load(current));
  $('#choose-level').addEventListener('click',()=>{releasePointer();updateLevelGrid();$('#level-dialog').showModal();});$('#rules').addEventListener('click',()=>openCodex(false));
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
  $('#sound').addEventListener('click',async()=>{const button=$('#sound');button.disabled=true;try{const on=await sound.toggle();button.setAttribute('aria-label',on?'关闭音效':'开启音效');button.setAttribute('aria-pressed',String(on));button.title=on?'关闭音效':'开启音效';$('#sound-label').textContent=on?'音效 开':'音效 关';$('#sound-waves').setAttribute('d',on?'M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14':'m16 9 5 6m0-6-5 6');}catch(e){status(e.message);}finally{button.disabled=false;}});
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();accumulator=0;releasePointer();});
  window.sandGame=Object.freeze({snapshot:()=>({level:current+1,...world.snapshot(),report:world.roundReport(),assetsReady,manualPaused,paused:isPaused(),seen:[...sessionSeen],pendingIntro:[...pendingIntro],visual:{rivalPose:world.rival?SandRivalAnimation.selection(world.rival):null,rivalPalm:world.rival?.pickup?SandRivalAnimation.palm(world.rival):null,rivalRestFrame:SandRivalRest.frame(world.rival),operatorFrame:operatorAnimation.frame,operatorAtlasFrames:24,wheelAngle:operatorAnimation.wheelAngle,consolePosition:{x:450,y:673},speech:{text:speech,x:284,y:664,tail:!!(world.operator&&!['flee','gone'].includes(world.operator.phase))},grains:particles.length,dust:dust.length,workerHeight:90,operatorFacing:'mine',controlPosition:{x:448,y:694},signalColor:world.operator?.signalColor||null,pointing:!!(world.operator?.phase==='control'&&world.operator?.pointTime>0),operatorCount:world.operator&&world.operator.phase!=='gone'?1:0,blastFrames:bursts.filter(b=>b.type==='blast').map(b=>({x:b.x,y:b.y,progress:1-b.life})),rivalHeight:68,railY:646},brush,soundEnabled:sound.enabled,audioPlayed:sound.played,audioDrilling:!!sound.drillingVoice,best:[...best],bestSand:[...bestSand],bestScores:[...bestScores]}),levels:()=>levels.map(l=>({id:l.id,title:l.title,features:[...l.features]}))});
  load(entry.index);requestAnimationFrame(frame);assetLoad.then(()=>{assetsReady=true;drawCodexArt();$('#loading').hidden=true;lastTime=performance.now();}).catch(e=>{$('#loading-text').textContent=e.message;$('#reload-assets').hidden=false;});$('#reload-assets').addEventListener('click',()=>location.reload());
})();
