(function(){
'use strict';
const $=id=>document.getElementById(id),{W,H,CELL,BOARD_X,BOARD_Y,COLS,ROWS,levels}=KingLevels;
const canvas=$('game'),audio=new KingAudio(),achievements=[0,0];
let game=new KingEngine.Game(0),renderer,paused=false,previous=0,uiTime=0,toastUntil=0,pointerStart=null,lastState='ready',autoPausedByDialog=false,selected=-1,resultAt=0,tutorialShown=false;
function load(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('美术资源加载失败'));i.src=url;});}
function notify(text){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=uiTime+2.3;}
function cellAt(e){const r=canvas.getBoundingClientRect(),c=Math.floor(((e.clientX-r.left)*W/r.width-BOARD_X)/CELL),row=Math.floor(((e.clientY-r.top)*H/r.height-BOARD_Y)/CELL);return c>=0&&c<COLS&&row>=0&&row<ROWS?row*COLS+c:-1;}
function renderHud(){
 const s=game.snapshot(),margin=Math.max(0,Math.ceil(s.clearance/66*100));$('moves').textContent=s.actions;$('collected').textContent=s.collected;$('target').textContent=s.target;$('health').innerHTML=`${margin}<small>%</small>`;$('drain-fill').style.width=Math.min(100,s.collected/s.target*100)+'%';
 $('shield-state').textContent=s.clearance<25?'逼近尖刺':'后退余地';document.querySelector('.shield-stat').classList.toggle('danger',s.clearance<25);$('pause').innerHTML=paused?'▶ <span>继续</span>':'Ⅱ <span>暂停</span>';$('remix-label').textContent=`重排 ${s.remixes}`;
}
function loadLevel(index){
 game=new KingEngine.Game(index);resultAt=0;paused=false;pointerStart=null;selected=-1;lastState='ready';$('ready').hidden=false;$('result').hidden=true;$('pause-overlay').hidden=true;$('chapter-label').textContent=`LEVEL 0${index+1} / 02`;$('level-title').textContent=game.level.name;
 $('ready-title').textContent=index?'绕过石梁，救下国王。':'别让国王退到尖刺！';$('ready-description').innerHTML='点一颗宝石，再点相邻宝石交换。<br><b>横向或纵向连成 3 颗</b>，才会消除。';$('status').textContent='源源不断的落石，只有开路才能卸力。';
 document.querySelectorAll('.chapter').forEach((e,i)=>e.classList.toggle('active',i===index));if(renderer){renderer.effects=[];renderer.hint=[];renderer.hover=[];renderer.selected=-1;renderer.keyboard=-1;renderer.combo=null;renderer.hitAt=0;}renderHud();
}
function setPaused(value){if(game.state!=='playing')return;paused=value;$('pause-overlay').hidden=!paused;renderHud();}
function exchange(a,b){
 if(paused||game.state!=='playing'||game.operation)return;
 const valid=game.swap(a,b);selected=-1;renderer.selected=-1;renderer.hint=[];
 if(valid){audio.play('clear');$('status').textContent='三消开路！观察落石有没有连到底部。';}
 else if(!game.operation)notify('只能交换两颗相邻的宝石');renderHud();
}
function act(index){
 if(paused||game.state!=='playing'||game.operation||!renderer)return;
 if(index<0||game.board[index]==null){selected=-1;renderer.selected=-1;return;}
 if(game.board[index]===-1){notify('石梁不能移动，沿它左边开路');return;}
 if(index===selected){selected=-1;renderer.selected=-1;return;}
 if(selected>=0&&Math.abs(index%8-selected%8)+Math.abs(Math.floor(index/8)-Math.floor(selected/8))===1)exchange(selected,index);
 else{selected=index;renderer.selected=index;}
}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType!=='touch')return;pointerStart={x:e.clientX,y:e.clientY,id:e.pointerId,index:cellAt(e)};canvas.setPointerCapture(e.pointerId);e.preventDefault();});
canvas.addEventListener('pointerup',e=>{if(pointerStart?.id===e.pointerId){const distance=Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y);if(distance<10)act(cellAt(e));else{const to=cellAt(e);if(pointerStart.index>=0&&to>=0)exchange(pointerStart.index,to);}}pointerStart=null;});canvas.addEventListener('pointercancel',()=>pointerStart=null);
canvas.addEventListener('keydown',e=>{if(!renderer)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter','Escape'].includes(e.key)){e.preventDefault();let i=renderer.keyboard<0?48:renderer.keyboard;if(e.key==='ArrowLeft')i=Math.max(0,i-1);if(e.key==='ArrowRight')i=Math.min(55,i+1);if(e.key==='ArrowUp')i=Math.max(0,i-8);if(e.key==='ArrowDown')i=Math.min(55,i+8);renderer.keyboard=i;if(e.key===' '||e.key==='Enter')act(i);if(e.key==='Escape'){selected=-1;renderer.selected=-1;}}});
$('start').onclick=()=>{game.start();$('ready').hidden=true;$('status').textContent=game.level.lesson;if(game.levelIndex===0&&!tutorialShown){tutorialShown=true;renderer.hint=game.hint();renderer.hintUntil=uiTime+5;notify('试试交换亮起的两颗，横竖连成三颗');}renderHud();};$('restart').onclick=()=>loadLevel(game.levelIndex);
$('hint').onclick=()=>{if(!renderer||game.state!=='playing'||paused||game.operation)return;renderer.hint=game.hint();renderer.hintUntil=uiTime+4;notify(renderer.hint.length?'交换亮起的两颗，试着接通落石通道':'暂无可交换组合；可重排颜色或重来');};
$('remix').onclick=()=>{if(paused)return;if(game.remix()){selected=-1;renderer.selected=-1;renderer.hint=[];notify('只重排颜色，已打开的通道保留');}else notify('不能继续重排，试着重来规划路线');renderHud();};
$('pause').onclick=()=>setPaused(!paused);$('resume').onclick=()=>setPaused(false);
$('sound').onclick=()=>{const on=audio.toggle();$('sound').textContent='音效 '+(on?'开':'关');$('sound').setAttribute('aria-pressed',String(on));$('sound').setAttribute('aria-label',on?'关闭音效':'开启音效');};
function openDialog(id){autoPausedByDialog=game.state==='playing'&&!paused;if(autoPausedByDialog)setPaused(true);$(id).showModal();}
$('rules').onclick=()=>openDialog('rules-dialog');$('choose-level').onclick=()=>openDialog('level-dialog');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
for(const id of ['rules-dialog','level-dialog'])$(id).addEventListener('close',()=>{if(autoPausedByDialog)setPaused(false);autoPausedByDialog=false;});
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{loadLevel(Number(b.dataset.level));autoPausedByDialog=false;if($('level-dialog').open)$('level-dialog').close();});
$('result-retry').onclick=()=>loadLevel(game.levelIndex);$('result-next').onclick=()=>loadLevel(game.state==='won'?(game.levelIndex+1)%2:game.levelIndex);
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);previous=0;});window.addEventListener('blur',()=>setPaused(true));window.addEventListener('resize',()=>renderer?.resize());
function showResult(){
 renderHud();const s=game.snapshot();if(s.state==='won'){achievements[game.levelIndex]=Math.max(achievements[game.levelIndex],s.stars);$('stars').textContent='✦ '.repeat(s.stars).trim();$('result-kicker').textContent='PRESSURE RELEASED';$('result-title').textContent=game.levelIndex?'尖刺危机，全部化解！':'稳住了，国王得救！';$('result-detail').textContent=`排出 ${s.collected} 颗 · ${s.actions} 次有效交换。压力稳定降低，供料闸门已关闭。`;$('result-next').textContent=game.levelIndex?'再闯第一关 →':'前往水晶密室 →';audio.play('win');}
 else{$('stars').textContent='⚠';$('result-kicker').textContent='THE SPIKES GOT TOO CLOSE';$('result-title').textContent='国王被推到尖刺了。';$('result-detail').textContent=`落石堵住出口，国王一步步后退。下次先找能接通料井与底部的三消，别只消旁边的宝石。`;$('result-next').textContent='重新救援 ↻';}
 $('result').hidden=false;$('status').textContent=s.state==='won'?'减压成功，关阀救援！':'尖刺触碰失败，换个开路顺序试试。';
}
let lastHud=0;
function frame(ms){const t=ms/1000,delta=previous?t-previous:0;previous=t;uiTime=t;if(renderer){if(!paused)game.update(delta);for(const e of game.events.splice(0)){if(e.type==='drain'){renderer.rockFx(e.x,e.y,t);audio.play('drain');}else if(e.type==='match'){renderer.burst(e.indices,e.colors,t);audio.play('win');}else if(e.type==='spikes'){renderer.hitAt=t;audio.play('lose');$('status').textContent='碰到尖刺了！先从底部找排石路线。';}else if(e.type==='invalid')notify('交换后要横竖连成至少 3 颗');else if(e.type==='stalled'){notify('已无可交换组合，可重排或重来');$('status').textContent='若通道尚未接通，试试重排或重来。';}}renderer.draw(game,t);if(t-lastHud>.1){renderHud();lastHud=t;}if(lastState!==game.state){lastState=game.state;if(game.state==='won')showResult();else if(game.state==='lost')resultAt=t+.65;}if(resultAt&&t>=resultAt){resultAt=0;showResult();}if(t>toastUntil)$('toast').classList.remove('show');}requestAnimationFrame(frame);}
window.kingGame=Object.freeze({snapshot:()=>({...game.snapshot(),paused,selected,achievements:[...achievements]})});
Promise.all([load('assets/royal-atlas.png'),load('assets/castle.png'),load('assets/spikes-v2.png')]).then(([atlas,castle,spikes])=>{renderer=new KingRenderer(canvas,{atlas,castle,spikes});$('start').disabled=false;$('start').textContent='开始救援  →';loadLevel(0);requestAnimationFrame(frame);}).catch(()=>{$('start').textContent='资源未加载，请刷新重试';$('ready-description').textContent='城堡美术加载失败，请检查连接后刷新。';});
})();
