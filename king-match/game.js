(function(){
'use strict';
const $=id=>document.getElementById(id),{W,H,CELL,BOARD_X,BOARD_Y,COLS,ROWS,levels}=KingLevels;
const canvas=$('game'),audio=new KingAudio(),achievements=[0,0];
let game=new KingEngine.Game(0),renderer,paused=false,previous=0,uiTime=0,toastUntil=0,pointerStart=null,lastState='ready',autoPausedByDialog=false,selected=-1,resultAt=0,tutorialShown=false;
function load(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('美术资源加载失败'));i.src=url;});}
function notify(text){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=uiTime+2.3;}
function cellAt(e){const r=canvas.getBoundingClientRect(),c=Math.floor(((e.clientX-r.left)*W/r.width-BOARD_X)/CELL),row=Math.floor(((e.clientY-r.top)*H/r.height-BOARD_Y)/CELL);return c>=0&&c<COLS&&row>=0&&row<ROWS?row*COLS+c:-1;}
function renderHud(){
 const s=game.snapshot(),margin=Math.max(0,Math.ceil(s.clearance/66*100));$('actions').textContent=s.actions;$('hp').innerHTML=`${s.hp}<small> HP</small>`;$('hp-fill').style.width=s.hp+'%';document.querySelector('.hp-stat').classList.toggle('danger',s.hp<=30);$('remaining').textContent=s.remaining;$('target').textContent=s.initialGems;$('clearance').innerHTML=s.rallyActive?`${s.rallyRemaining.toFixed(1)}<small>s</small>`:`${margin}<small>%</small>`;$('drain-fill').style.width=(1-s.remaining/s.initialGems)*100+'%';
 $('shield-state').textContent=s.rallyActive?'高能推盾':s.clearance<25?'逼近尖刺':'后退余地';document.querySelector('.shield-stat').classList.toggle('danger',s.clearance<25);$('pause').innerHTML=paused?'▶ <span>继续</span>':'Ⅱ <span>暂停</span>';$('remix-label').textContent=`重排 ${s.remixes}`;
}
function loadLevel(index){
 game=new KingEngine.Game(index);resultAt=0;paused=false;pointerStart=null;selected=-1;lastState='ready';$('ready').hidden=false;$('result').hidden=true;$('pause-overlay').hidden=true;$('chapter-label').textContent=`LEVEL 0${index+1} / 02`;$('level-title').textContent=game.level.name;
 $('ready-title').textContent=index?'绕过石梁，救下国王。':'疏通落石，守住国王的 HP。';$('ready-description').innerHTML='点一颗宝石，再点相邻宝石交换。<br><b>横向或纵向连成 3 颗</b>，才会消除。<br>宝石会下落连锁，<b>全部清空或已无有效交换</b>即通关。';$('status').textContent='清空宝石，或消到没有有效交换，即可通关。';
 document.querySelectorAll('.chapter').forEach((e,i)=>e.classList.toggle('active',i===index));if(renderer){renderer.effects=[];renderer.hint=[];renderer.hover=[];renderer.selected=-1;renderer.keyboard=-1;renderer.combo=null;renderer.hitAt=0;renderer.hurtAt=-10;}renderHud();
}
function setPaused(value){if(game.state!=='playing')return;paused=value;$('pause-overlay').hidden=!paused;renderHud();}
function exchange(a,b){
 if(paused||game.state!=='playing'||game.operation)return;
 const valid=game.swap(a,b);selected=-1;renderer.selected=-1;renderer.hint=[];
 if(valid){audio.play('clear');$('status').textContent='宝石会下落补空，落稳后还能连锁三消。';}
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
$('hint').onclick=()=>{if(!renderer||game.state!=='playing'||paused||game.operation)return;renderer.hint=game.hint();renderer.hintUntil=uiTime+4;notify(renderer.hint.length?'试试这组合法三消，再观察排石路线':'已无有效交换，落稳后自动通关');};
$('remix').onclick=()=>{if(paused)return;if(game.remix()){selected=-1;renderer.selected=-1;renderer.hint=[];notify('只重排颜色，落稳的位置保持不变');}else notify(game.remixes?'暂未找到可全清重排，次数保留':'重排次数用完了，可重新挑战');renderHud();};
$('pause').onclick=()=>setPaused(!paused);$('resume').onclick=()=>setPaused(false);
$('sound').onclick=()=>{const on=audio.toggle();$('sound').textContent='音效 '+(on?'开':'关');$('sound').setAttribute('aria-pressed',String(on));$('sound').setAttribute('aria-label',on?'关闭音效':'开启音效');};
function openDialog(id){autoPausedByDialog=game.state==='playing'&&!paused;if(autoPausedByDialog)setPaused(true);$(id).showModal();}
$('rules').onclick=()=>openDialog('rules-dialog');$('choose-level').onclick=()=>openDialog('level-dialog');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
for(const id of ['rules-dialog','level-dialog'])$(id).addEventListener('close',()=>{if(autoPausedByDialog)setPaused(false);autoPausedByDialog=false;});
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{loadLevel(Number(b.dataset.level));autoPausedByDialog=false;if($('level-dialog').open)$('level-dialog').close();});
$('result-retry').onclick=()=>loadLevel(game.levelIndex);$('result-next').onclick=()=>loadLevel(game.state==='won'?(game.levelIndex+1)%2:game.levelIndex);
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);previous=0;});window.addEventListener('blur',()=>setPaused(true));window.addEventListener('resize',()=>renderer?.resize());
function showResult(){
 renderHud();const s=game.snapshot();if(s.state==='won'){achievements[game.levelIndex]=Math.max(achievements[game.levelIndex],s.stars);$('stars').textContent='✦ '.repeat(s.stars).trim();$('result-kicker').textContent='PRESSURE RELEASED';$('result-title').textContent=s.reason==='no-moves'?'已无有效交换，关卡通过！':game.levelIndex?'尖刺危机，全部化解！':'稳住了，国王得救！';$('result-detail').textContent=(s.reason==='no-moves'?`剩余 ${s.remaining} 颗宝石已无法通过交换形成三消，无需重排。`:`全部 ${s.initialGems} 颗宝石已清空。`)+` ${s.actions} 次交换 · 剩余 ${s.hp} HP。国王得救，供料关闭。`;$('result-next').textContent=game.levelIndex?'再闯第一关 →':'前往水晶密室 →';audio.play('win');}
 else{$('stars').textContent='⚠';$('result-kicker').textContent='THE SPIKES GOT TOO CLOSE';$('result-title').textContent='国王的 HP 耗尽了。';$('result-detail').textContent=`持续碰刺会扣血。消除后宝石会落下，继续三消、连锁，才能打通排石路线。`;$('result-next').textContent='重新救援 ↻';}
 $('result').hidden=false;$('status').textContent=s.state==='won'?(s.reason==='no-moves'?'已无有效交换，关卡通过！':'宝石全部清空，国王得救！'):'HP 归零，换个消除顺序再救一次。';
}
let lastHud=0;
function frame(ms){const t=ms/1000,delta=previous?t-previous:0;previous=t;uiTime=t;if(renderer){if(!paused)game.update(delta);for(const e of game.events.splice(0)){if(e.type==='drain'){renderer.rockFx(e.x,e.y,t);audio.play('drain');}else if(e.type==='match'){renderer.burst(e.indices,e.colors,t,e.chain);audio.play('win');}else if(e.type==='hurt'){renderer.hurtAt=t;audio.play('lose');$('status').textContent=`碰刺损失 12 HP，还剩 ${e.hp} HP！`; }else if(e.type==='rally'){audio.play('win');notify('高能爆发！国王奋力推盾 2.2 秒');}else if(e.type==='spikes'){renderer.hitAt=t;audio.play('lose');$('status').textContent='碰到尖刺了！先从底部找排石路线。';}else if(e.type==='recovery'){$('status').textContent='集金槽自动疏通中 · 国王安全等待';}else if(e.type==='recovered'){$('status').textContent='宝石已落稳，继续消除！';}else if(e.type==='invalid')notify('交换后要横竖连成至少 3 颗');}renderer.draw(game,t);if(t-lastHud>.1){renderHud();lastHud=t;}if(lastState!==game.state){lastState=game.state;if(game.state==='won')showResult();else if(game.state==='lost')resultAt=t+.65;}if(resultAt&&t>=resultAt){resultAt=0;showResult();}if(t>toastUntil)$('toast').classList.remove('show');}requestAnimationFrame(frame);}
window.kingGame=Object.freeze({snapshot:(options={})=>({...game.snapshot(),paused,selected,achievements:[...achievements],...(options.geometry?{geometry:{maxOverlap:game.overlap(),stones:game.particles.map(p=>({id:p.id,x:p.x,y:p.y,r:p.r,z:p.z||0,tray:!!p.tray,lifting:!!p.tray?.lifting})),boxes:game.boxes().map(b=>({...b}))}}:{})})});
Promise.all([load('assets/royal-atlas.png'),load('assets/castle.png'),load('assets/spikes-v2.png'),load('assets/emerald-tile-v3.png'),load('assets/king-frames-v4.png')]).then(([atlas,castle,spikes,emerald,kingFrames])=>{renderer=new KingRenderer(canvas,{atlas,castle,spikes,emerald,kingFrames});$('start').disabled=false;$('start').textContent='开始救援  →';loadLevel(0);requestAnimationFrame(frame);}).catch(()=>{$('start').textContent='资源未加载，请刷新重试';$('ready-description').textContent='城堡美术加载失败，请检查连接后刷新。';});
})();
