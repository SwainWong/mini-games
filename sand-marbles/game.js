(() => {
  'use strict';
  const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
  const W = 560, H = 680, SOIL_BOTTOM = 564, CELL = 2, GW = W / CELL, GH = SOIL_BOTTOM / CELL;
  const BRUSH = 29, R = 8.5, STEP = 1 / 120;
  const colors = {
    amber: { light: '#fff2d8', mid: '#e89a50', base: '#a7481f', dark: '#54200f', label: '琥珀' },
    blue: { light: '#effaff', mid: '#a3c8dc', base: '#557d99', dark: '#243b54', label: '冰蓝' },
    jade: { light: '#f1ffe2', mid: '#b1c68b', base: '#64875c', dark: '#344b33', label: '青玉' }
  };
  const levels = [
    {
      title: '初识沙径', note: '接通断开的沙径，送两种颜色的珠子回家。',
      jars: [{ x: 136, color: 'blue' }, { x: 420, color: 'amber' }],
      groups: [{ x: 165, y: 116, color: 'blue', count: 8 }, { x: 416, y: 114, color: 'amber', count: 7 }, { x: 406, y: 296, color: 'amber', count: 7 }],
      tunnels: [ [[165,125],[208,182],[158,244],[124,311]], [[208,182],[260,130]], [[158,244],[91,218]], [[131,395],[123,470],[136,562]], [[131,395],[226,443]], [[415,396],[460,437],[448,506],[420,564]] ],
      rocks: [],
      routes: [ [[165,116],[181,207],[126,308],[127,408],[136,575]], [[416,114],[406,296],[415,393],[454,442],[445,509],[420,575]] ]
    },
    {
      title: '各走各的路', note: '石块挖不动。绕过去，让两条路线保持分开。',
      jars: [{ x: 126, color: 'amber' }, { x: 434, color: 'blue' }],
      groups: [{ x: 148, y: 126, color: 'amber', count: 10 }, { x: 407, y: 126, color: 'blue', count: 10 }],
      tunnels: [ [[148,125],[125,189]], [[407,125],[428,208]], [[99,398],[128,460],[126,562]], [[460,475],[434,564]] ],
      rocks: [{ x: 160, y: 310, rx: 62, ry: 49 }, { x: 399, y: 381, rx: 60, ry: 53 }],
      routes: [ [[148,126],[101,201],[65,284],[69,357],[101,415],[128,481],[126,575]], [[407,126],[454,232],[491,338],[489,418],[461,478],[434,575]] ]
    },
    {
      title: '三色归途', note: '三种颜色，三条沙径。留意中央石块和下方的珠子。',
      jars: [{ x: 94, color: 'amber' }, { x: 280, color: 'jade' }, { x: 466, color: 'blue' }],
      groups: [{ x: 104, y: 113, color: 'amber', count: 6 }, { x: 143, y: 288, color: 'amber', count: 5 }, { x: 280, y: 124, color: 'jade', count: 10 }, { x: 451, y: 113, color: 'blue', count: 6 }, { x: 429, y: 306, color: 'blue', count: 5 }],
      tunnels: [ [[104,119],[119,180]], [[280,131],[280,208]], [[451,120],[437,191]], [[95,463],[94,564]], [[466,452],[466,564]], [[319,490],[280,564]] ],
      rocks: [{ x: 270, y: 363, rx: 51, ry: 57 }, { x: 175, y: 441, rx: 30, ry: 25 }],
      routes: [ [[104,113],[124,219],[143,288],[104,372],[90,467],[94,575]], [[280,124],[282,223],[349,292],[351,398],[329,471],[280,575]], [[451,113],[437,217],[429,306],[466,403],[466,575]] ]
    }
  ];
  const soil = document.createElement('canvas'); soil.width = W; soil.height = SOIL_BOTTOM;
  const sc = soil.getContext('2d');
  const earth = document.createElement('canvas'); earth.width = W; earth.height = H;
  const ec = earth.getContext('2d');
  let grid, balls, jars, particles = [], current = 0, state = 'playing', hint = false, dragged = false;
  let pointer = null, cursor = null, elapsed = 0, accumulator = 0, lastTime = 0, collected = 0, total = 0;
  let muted = true, audioContext, completion = new Set();
  let seed = 32;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function makeTextures() {
    seed = 42 + current;
    const data = sc.createImageData(W, SOIL_BOTTOM);
    for (let y = 0; y < SOIL_BOTTOM; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const grain = (random() - .5) * 24 + (random() < .018 ? -30 : 0);
      const cloud = Math.sin(x / 49 + Math.sin(y / 58)) * 2.5 + Math.cos(y / 64) * 3;
      data.data[i] = 221 + grain + cloud; data.data[i + 1] = 213 + grain + cloud; data.data[i + 2] = 201 + grain + cloud; data.data[i + 3] = 255;
    }
    sc.globalCompositeOperation = 'source-over'; sc.putImageData(data, 0, 0);
    const gradient = ec.createLinearGradient(0,0,W,H); gradient.addColorStop(0,'#462719');gradient.addColorStop(.45,'#713d25');gradient.addColorStop(1,'#4e2617');
    ec.fillStyle = gradient;ec.fillRect(0,0,W,H);
    for(let i=0;i<32000;i++){const x=random()*W,y=random()*H;ec.fillStyle=random()>.5?'#e6a87809':'#17080110';ec.fillRect(x,y,1,1);}
    ec.fillStyle='#2a170925';ec.fillRect(0,SOIL_BOTTOM,W,H-SOIL_BOTTOM);
  }
  function carve(x,y,r = BRUSH, dust = false) {
    if (y < 51 || y > SOIL_BOTTOM + r) return;
    sc.globalCompositeOperation = 'destination-out';sc.beginPath();sc.arc(x,y,r,0,Math.PI*2);sc.fill();
    let removed = 0;
    const xa=clamp(Math.floor((x-r)/CELL),0,GW-1),xb=clamp(Math.ceil((x+r)/CELL),0,GW-1);
    const ya=clamp(Math.floor((y-r)/CELL),0,GH-1),yb=clamp(Math.ceil((y+r)/CELL),0,GH-1);
    for(let gy=ya;gy<=yb;gy++)for(let gx=xa;gx<=xb;gx++)if((gx*CELL+1-x)**2+(gy*CELL+1-y)**2<r*r){removed+=grid[gy*GW+gx];grid[gy*GW+gx]=0;}
    if(dust&&removed>6){for(let i=0;i<4;i++)particles.push({x:x+(random()-.5)*r,y:y+(random()-.5)*r,vx:(random()-.5)*70,vy:random()*60,life:.35+random()*.3,color:'#d2bfa1',size:1+random()*2});}
  }
  function carveLine(a,b,r=BRUSH,dust=false){const d=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(1,Math.ceil(d/5));for(let i=0;i<=steps;i++){const t=i/steps;carve(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,dust&&i%3===0);}}
  function pathCarve(points,r){for(let i=1;i<points.length;i++)carveLine(points[i-1],points[i],r);}
  function solid(x,y){if(x<0||x>=W||y<0)return true;if(y>=SOIL_BOTTOM)return false;return grid[Math.floor(y/CELL)*GW+Math.floor(x/CELL)]===1;}
  function status(text){document.querySelector('#status').textContent=text;}
  function load(index){
    current=index;state='playing';hint=false;dragged=false;pointer=null;cursor=null;particles=[];collected=0;elapsed=0;accumulator=0;
    grid=new Uint8Array(GW*GH).fill(1);balls=[];jars=levels[index].jars.map(j=>({...j,balls:[],flash:0}));
    makeTextures();levels[index].tunnels.forEach(p=>pathCarve(p,31));
    for(const group of levels[index].groups){
      carve(group.x,group.y,40);
      for(let i=0;i<group.count;i++){const row=Math.floor(i/4),col=i%4,count=Math.min(4,group.count-row*4);balls.push({x:group.x+(col-(count-1)/2)*18,y:group.y+19-row*17,vx:0,vy:0,color:group.color,r:R,active:true});}
    }
    total=balls.length;
    document.querySelector('#level-number').textContent=String(index+1).padStart(2,'0');document.querySelector('#level-title').textContent=levels[index].title;
    document.querySelector('#collected').textContent=`0 / ${total}`;
    document.querySelector('#result').hidden=true;document.querySelector('#hint').setAttribute('aria-pressed','false');
    document.querySelector('#board-instruction').textContent='按住并划动，挖出一条路';
    document.querySelectorAll('[data-level]').forEach((b,i)=>{b.classList.toggle('active',i===index);b.classList.toggle('done',completion.has(i));if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    status(levels[index].note);render();
  }
  function tone(frequency,duration=.12){if(muted)return;try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.055,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch(_){}}
  function finish(won,reason){
    if(state!=='playing')return;state=won?'won':'lost';pointer=null;
    if(won){completion.add(current);tone(880,.35);}
    else tone(160,.24);
    const last=current===levels.length-1;
    document.querySelector('#result-symbol').textContent=won?'✦':'↻';
    document.querySelector('#result-kicker').textContent=won?(last?'THREE LITTLE VICTORIES':'BEAUTIFULLY DONE'):'LET’S TRY AGAIN';
    document.querySelector('#result-title').textContent=won?(last?'三段沙径，全部通关。':'每颗珠子，都到家了。'):'换一条路，再试一次。';
    document.querySelector('#result-description').textContent=won?`已收集 ${collected} / ${total} 颗珠子。${last?'好好享受这份小小的成就感。':'慢慢来，也能刚刚好。'}`:reason;
    document.querySelector('#result-action').innerHTML=won?(last?'从第一关再玩 <span>↻</span>':'下一关 <span>→</span>'):'重新挑战 <span>↻</span>';
    document.querySelector('#result-replay').hidden=!won;
    document.querySelector('#result').hidden=false;
    document.querySelectorAll('[data-level]').forEach((b,i)=>b.classList.toggle('done',completion.has(i)));
  }
  const samples=Array.from({length:24},(_,i)=>[Math.cos(i*Math.PI/12),Math.sin(i*Math.PI/12)]);
  function collideSoil(b){
    for(let iteration=0;iteration<7;iteration++){
      let nx=0,ny=0,hits=0;
      for(const [dx,dy] of samples)if(solid(b.x+dx*b.r,b.y+dy*b.r)){nx-=dx;ny-=dy;hits++;}
      if(!hits)break;
      const n=Math.hypot(nx,ny);if(n<.01){b.y-=1;continue;}nx/=n;ny/=n;
      b.x+=nx*.8;b.y+=ny*.8;
      const vn=b.vx*nx+b.vy*ny;
      if(vn<0){b.vx-=1.08*vn*nx;b.vy-=1.08*vn*ny;}
      b.vx*=.985;
    }
    for(const rock of levels[current].rocks){
      const dx=b.x-rock.x,dy=b.y-rock.y,rx=rock.rx+b.r,ry=rock.ry+b.r;
      const d=Math.sqrt(dx*dx/(rx*rx)+dy*dy/(ry*ry));
      if(d<1){const angle=Math.atan2(dy/ry,dx/rx);b.x=rock.x+Math.cos(angle)*rx;b.y=rock.y+Math.sin(angle)*ry;let nx=Math.cos(angle)/rx,ny=Math.sin(angle)/ry;const n=Math.hypot(nx,ny);nx/=n;ny/=n;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.1*vn*nx;b.vy-=1.1*vn*ny;}}
    }
  }
  function physics(dt){
    elapsed+=dt;
    for(const b of balls){if(!b.active)continue;b.vy=Math.min(390,b.vy+740*dt);b.vx*=.999;b.x+=b.vx*dt;b.y+=b.vy*dt;collideSoil(b);}
    for(let repeat=0;repeat<3;repeat++){
      for(let i=0;i<balls.length;i++){const a=balls[i];if(!a.active)continue;
        for(let j=i+1;j<balls.length;j++){const b=balls[j];if(!b.active)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=R*2)continue;if(d<.001){dx=.01;dy=.01;d=Math.hypot(dx,dy);}const nx=dx/d,ny=dy/d,overlap=(R*2-d)*.5;a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(relative<0){const impulse=-relative*.52;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}}
        collideSoil(a);
      }
    }
    for(const b of balls){if(!b.active)continue;if(b.y>=582){const jar=jars.find(j=>Math.abs(j.x-b.x)<44);if(!jar){finish(false,'珠子从罐子旁边漏走了。把通道的出口对准罐口吧。');return;}if(jar.color!==b.color){finish(false,`${colors[b.color].label}珠子进入了${colors[jar.color].label}罐子。试着分开不同颜色的通道。`);return;}b.active=false;jar.balls.push(b.color);jar.flash=1;collected++;document.querySelector('#collected').textContent=`${collected} / ${total}`;tone(520+jar.balls.length*35);for(let k=0;k<5;k++)particles.push({x:b.x,y:585,vx:(random()-.5)*75,vy:-random()*80,life:.6,color:colors[b.color].mid,size:2});if(collected===total){finish(true);return;}}}
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
  function drawHint(){
    ctx.save();ctx.lineWidth=2;ctx.setLineDash([5,8]);ctx.lineDashOffset=-elapsed*12;ctx.strokeStyle='#fff9e1b0';ctx.shadowColor='#614224';ctx.shadowBlur=3;
    for(const route of levels[current].routes){ctx.beginPath();route.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();const p=route.at(-1);ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(p[0]-5,p[1]-8);ctx.lineTo(p[0],p[1]);ctx.lineTo(p[0]+5,p[1]-8);ctx.stroke();ctx.setLineDash([5,8]);}
    ctx.restore();
  }
  function render(){
    ctx.clearRect(0,0,W,H);ctx.drawImage(earth,0,0);ctx.save();ctx.shadowColor='#281a16b0';ctx.shadowBlur=7;ctx.shadowOffsetY=3;ctx.drawImage(soil,0,0);ctx.restore();
    levels[current].rocks.forEach(rockDraw);if(hint&&state==='playing')drawHint();
    for(const b of balls)if(b.active)marble(ctx,b.x,b.y,b.r,b.color);
    jars.forEach(jarDraw);
    for(const p of particles){ctx.globalAlpha=Math.max(0,p.life*1.7);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;
    if(cursor&&state==='playing'){ctx.beginPath();ctx.arc(cursor.x,cursor.y,BRUSH,0,Math.PI*2);ctx.strokeStyle=pointer?'#fff8e790':'#fff8e75c';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(cursor.x,cursor.y,2,0,Math.PI*2);ctx.fillStyle='#fff9e8b0';ctx.fill();}
    if(!dragged&&current===0&&state==='playing'&&!hint){const a=.50+Math.sin(elapsed*3)*.2;ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='#fffdf4';ctx.lineWidth=2;ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(128,327);ctx.lineTo(129,376);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(123,367);ctx.lineTo(129,376);ctx.lineTo(135,367);ctx.stroke();ctx.restore();}
  }
  function frame(time){
    const delta=Math.min((time-lastTime)/1000||0,.05);lastTime=time;
    if(!document.hidden){if(state==='playing'){accumulator+=delta;while(accumulator>=STEP&&state==='playing'){physics(STEP);accumulator-=STEP;}}for(const j of jars)j.flash=Math.max(0,j.flash-delta*2);for(const p of particles){p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=150*delta;p.life-=delta;}particles=particles.filter(p=>p.life>0);render();}
    requestAnimationFrame(frame);
  }
  function position(event){const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*W/rect.width,y:(event.clientY-rect.top)*H/rect.height};}
  canvas.addEventListener('pointerdown',e=>{if(state!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||pointer)return;e.preventDefault();pointer={...position(e),id:e.pointerId};cursor=pointer;canvas.setPointerCapture(e.pointerId);carve(pointer.x,pointer.y,BRUSH,true);dragged=true;document.querySelector('#board-instruction').textContent='让每种颜色，沿着自己的路';});
  canvas.addEventListener('pointermove',e=>{const p=position(e);cursor=p;if(pointer&&pointer.id===e.pointerId){carveLine([pointer.x,pointer.y],[p.x,p.y],BRUSH,true);pointer={...p,id:e.pointerId};} });
  function release(e){if(pointer?.id===e.pointerId){pointer=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}if(e.pointerType!=='mouse')cursor=null;}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',()=>pointer=null);canvas.addEventListener('pointerleave',()=>{if(!pointer)cursor=null;});
  document.querySelector('#restart').addEventListener('click',()=>load(current));
  document.querySelector('#hint').addEventListener('click',()=>{hint=!hint;document.querySelector('#hint').setAttribute('aria-pressed',String(hint));status(hint?'沿虚线慢慢挖，记得把通道一直连到罐口。':levels[current].note);});
  document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>load(Number(b.dataset.level))));
  document.querySelector('#result-action').addEventListener('click',()=>load(state==='won'?(current+1)%levels.length:current));
  document.querySelector('#result-replay').addEventListener('click',()=>load(current));
  document.querySelector('#sound').addEventListener('click',()=>{muted=!muted;const label=muted?'开启音效':'关闭音效';document.querySelector('#sound').setAttribute('aria-label',label);document.querySelector('#sound').title=label;document.querySelector('#sound-waves').setAttribute('d',muted?'m16 9 5 6m0-6-5 6':'M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14');tone(660);});
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();accumulator=0;pointer=null;});
  // Read-only diagnostics for reproducible browser verification; play still uses pointer events.
  window.sandGame = Object.freeze({ snapshot:()=>({level:current+1,state,collected,total,balls:balls.filter(b=>b.active).map(b=>({x:Math.round(b.x),y:Math.round(b.y),color:b.color})),jars:jars.map(j=>({color:j.color,count:j.balls.length})),hint}), routes:()=>structuredClone(levels[current].routes) });
  load(0);requestAnimationFrame(frame);
})();
