/* Seeded bag results and a finite presentation queue, independent of physics time. */
(function(root,factory){const M=factory();if(typeof module==='object')module.exports=M;else root.SandMagic=M;})(globalThis,()=>{
  const G=typeof module==='object'?require('./rock-geometry.js'):globalThis.SandRock;
  function mixed(seed){let x=(seed^0xa511e9b3)>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return (x^(x>>>16))>>>0;}
  class Magic{
    constructor(w){this.w=w;this.queue=[];this.active=null;this.completed=[];this.scheduled=0;let seed=mixed(w.initialSeed);for(const t of w.treasures)if(t.kind==='bag'){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const u=seed/4294967296;t.outcome=u<.5?'coins20':u<.7?'coins40':u<.85?'bomb':'refill';}}
    get pending(){return !!this.active||this.queue.length>0||this.scheduled>0;}
    get pausesWorld(){return (this.active||this.queue[0])?.kind==='refill';}
    get canScare(){return this.w.treasures.some(t=>t.kind==='bag'&&!t.opened)||[this.active,...this.queue].some(e=>e?.kind==='bomb'&&!e.applied);}
    potential(){return this.w.treasures.filter(t=>!t.opened).reduce((n,t)=>n+(t.kind==='bag'?40:t.points||0),0);}
    open(t,b){if(t.opened||!b.active||this.w.time>this.w.timeLimit)return;t.opened=true;const kind=t.kind==='bag'?t.outcome:'fixed',points=kind==='coins20'?20:kind==='coins40'?40:kind==='fixed'?t.points||0:0;
      if(points){this.w.score+=points;this.w.events.push({type:'treasure',x:t.x,y:t.y,points});return;}
      if(kind!=='bomb'&&kind!=='refill')return;this.queue.push({id:t.id,kind,x:t.x,y:t.y,radius:72,age:0,phase:'pending',applied:false,rows:0});this.w.events.push({type:'magic-open',kind,x:t.x,y:t.y});
    }
    untilBoundary(){const e=this.active||this.queue[0];if(!e)return Infinity;return Math.max(1e-9,((e.kind==='bomb'?[.9,1.4]:[.35,1.55,1.8]).find(t=>t>e.age+1e-9)??(e.kind==='bomb'?1.4:1.8))-e.age);}
    step(dt,{physical=false}={}){const fullDt=dt;while(dt>1e-10&&(this.active||this.queue.length)){if(!this.active){this.active=this.queue.shift();this.active.phase='warning';this.w.events.push({type:'magic-warning',kind:this.active.kind,x:this.active.x,y:this.active.y});}const e=this.active,duration=e.kind==='bomb'?1.4:1.8,consume=Math.min(dt,duration-e.age);e.age+=consume;dt-=consume;
        if(e.kind==='bomb'){if(e.age>=.9-1e-9&&!e.applied){e.applied=true;if(physical){this.scheduled++;this.w.queueInteraction({u:Math.max(0,Math.min(1,(.9-(e.age-consume))/fullDt)),kind:'damage',apply:()=>{this.scheduled--;this.blast(e);}});}else this.blast(e);}e.phase=e.age<.9?'warning':'resolving';}
        else{e.phase=e.age<.35?'warning':'resolving';if(e.age>=.35){if(!e.target)this.prepareRefill(e);this.fillRows(e,Math.min(1,(e.age-.35)/1.2));if(e.age>=1.55-1e-9&&!e.applied){e.applied=true;this.fillRows(e,1);const r=this.w.rival;if(r){r.path=[];r.repath=0;r.noProgress=0;r.refreshObstacles();}this.w.events.push({type:'magic-refilled',x:e.x,y:e.y});}}}
        if(e.age>=duration-1e-9){e.phase='done';this.completed.push({id:e.id,kind:e.kind});this.active=null;}else break;
      }}
    blast(e){const w=this.w,near=p=>Math.hypot(p.x-e.x,p.y-e.y)<=e.radius+1e-7,devalue=b=>{if(b.value!==3){b.value=3;b.waste=true;}};
      for(const b of w.balls)if(b.active&&near(b))devalue(b);
      for(const bag of w.droppedBags)if(near(bag))for(const b of bag.balls)devalue(b);
      const r=w.rival;if(r&&!r.escaped){if(near(r.bagPoint()))for(const b of r.bag)devalue(b);if(near(r))r.magicScare(w);}
      w.hazards.fragmentRocks(e,e.radius);for(const worm of w.worms)if(worm.alive&&near(worm))worm.alive=false;w.crew.scare();w.events.push({type:'magic-blast',x:e.x,y:e.y,radius:e.radius});
    }
    prepareRefill(e){const w=this.w,t=w.terrain,target=new Uint8Array(t.grid.length).fill(1),width=280,height=282;
      const pocket=(x,y,r)=>{for(let gy=Math.max(0,Math.floor((y-r)/2));gy<Math.min(height,Math.ceil((y+r)/2));gy++)for(let gx=Math.max(0,Math.floor((x-r)/2));gx<Math.min(width,Math.ceil((x+r)/2));gx++)if((gx*2+1-x)**2+(gy*2+1-y)**2<=r*r)target[gy*width+gx]=0;};
      for(const b of w.balls)if(b.active)pocket(b.x,b.y,b.r+3);for(const worm of w.worms)if(worm.alive)pocket(worm.x,worm.y,17);
      const r=w.rival;if(r&&!r.escaped)for(let y=r.y-32;y<=r.y+8;y+=8)pocket(r.x,y,17);
      for(const rock of w.rocks)if(!rock.broken){const ex=G.extent(rock);for(let gy=Math.max(0,Math.floor((rock.y-ex.y)/2));gy<Math.min(height,Math.ceil((rock.y+ex.y)/2));gy++)for(let gx=Math.max(0,Math.floor((rock.x-ex.x)/2));gx<Math.min(width,Math.ceil((rock.x+ex.x)/2));gx++)if(G.contains(rock,gx*2+1,gy*2+1))target[gy*width+gx]=0;}
      e.target=target;e.rows=0;
    }
    fillRows(e,progress){const t=this.w.terrain,end=Math.min(282,Math.floor(progress*282+1e-7));let changed=false;for(let i=e.rows*280;i<end*280;i++)if(t.grid[i]!==e.target[i]){t.grid[i]=e.target[i];t.changes.push(i);changed=true;}e.rows=end;if(changed)t.revision++;}
    snapshot(){const e=this.active||this.queue[0];return{pending:this.pending,paused:this.pausesWorld,queue:this.queue.map(e=>({id:e.id,kind:e.kind,phase:e.phase})),active:e?{id:e.id,kind:e.kind,x:e.x,y:e.y,radius:e.radius,age:e.age,phase:e.phase,progress:e.kind==='refill'?Math.max(0,Math.min(1,(e.age-.35)/1.2)):Math.min(1,e.age/1.4)}:null,completed:this.completed.map(e=>({...e}))};}
    static parseStart(query){const p=new URLSearchParams(query),l=p.get('level'),s=p.get('seed'),valid=(v,max)=>v!==null&&/^\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)<=max;return{index:valid(l,15)&&Number(l)>=1?Number(l)-1:0,seed:valid(s,4294967295)?Number(s):undefined};}
  }return Magic;
});
