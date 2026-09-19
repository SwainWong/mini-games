/* Seeded bag results and a finite presentation queue, independent of physics time. */
(function(root,factory){const M=factory();if(typeof module==='object')module.exports=M;else root.SandMagic=M;})(globalThis,()=>{
  function mixed(seed){let x=(seed^0xa511e9b3)>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return (x^(x>>>16))>>>0;}
  class Magic{
    constructor(w){this.w=w;this.queue=[];this.active=null;this.completed=[];this.scheduled=0;let seed=mixed(w.initialSeed);for(const t of w.treasures)if(t.kind==='bag'){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const u=seed/4294967296;t.outcome=u<.5?'coins20':u<.7?'coins40':u<.85?'bomb':'coins20';}}
    get pending(){return !!this.active||this.queue.length>0||this.scheduled>0;}
    get pausesWorld(){return false;}
    get canScare(){const r=this.w.rival,independentSpill=r&&!r.escaped&&r.bag.length&&(r.torn||r.bag.length>6||r.fleeing&&r.dropBag),freeTrigger=this.w.balls.some(b=>b.active)||this.w.droppedBags.some(b=>b.balls.length)||independentSpill;return freeTrigger&&this.w.treasures.some(t=>t.kind==='bag'&&!t.opened)||[this.active,...this.queue].some(e=>e?.kind==='bomb'&&!e.applied);}
    potential(){return this.w.treasures.filter(t=>!t.opened).reduce((n,t)=>n+(t.kind==='bag'?40:t.points||0),0);}
    open(t,b){if(t.opened||!b.active||this.w.time>this.w.timeLimit)return;t.opened=true;const kind=t.kind==='bag'?t.outcome:'fixed',points=kind==='coins20'?20:kind==='coins40'?40:kind==='fixed'?t.points||0:0;
      if(points){this.w.score+=points;this.w.events.push({type:'treasure',x:t.x,y:t.y,points});return;}
      if(kind!=='bomb')return;this.queue.push({id:t.id,kind,x:t.x,y:t.y,radius:72,age:0,phase:'pending',applied:false});this.w.events.push({type:'magic-open',kind,x:t.x,y:t.y});
    }
    untilBoundary(){const e=this.active||this.queue[0];if(!e)return Infinity;return Math.max(1e-9,([.9,1.4].find(t=>t>e.age+1e-9)??1.4)-e.age);}
    step(dt,{physical=false}={}){const fullDt=dt;while(dt>1e-10&&(this.active||this.queue.length)){if(!this.active){this.active=this.queue.shift();this.active.phase='warning';this.w.events.push({type:'magic-warning',kind:this.active.kind,x:this.active.x,y:this.active.y});}const e=this.active,duration=1.4,consume=Math.min(dt,duration-e.age);e.age+=consume;dt-=consume;
        if(e.kind==='bomb'){if(e.age>=.9-1e-9&&!e.applied){e.applied=true;if(physical){this.scheduled++;this.w.queueInteraction({u:Math.max(0,Math.min(1,(.9-(e.age-consume))/fullDt)),kind:'damage',apply:()=>{this.scheduled--;this.blast(e);}});}else this.blast(e);}e.phase=e.applied?'resolving':'warning';}
        if(e.age>=duration-1e-9){e.phase='done';this.completed.push({id:e.id,kind:e.kind});this.active=null;}else break;
      }}
    blast(e){const w=this.w,near=p=>Math.hypot(p.x-e.x,p.y-e.y)<=e.radius+1e-7,devalue=b=>{if(b.value!==3){b.value=3;b.waste=true;}};
      for(const b of w.balls)if(b.active&&near(b))devalue(b);
      for(const bag of w.droppedBags)if(near(bag))for(const b of bag.balls)devalue(b);
      const r=w.rival;if(r&&!r.escaped){if(near(r.bagPoint()))for(const b of r.bag)devalue(b);if(near(r))r.magicScare(w);}
      w.hazards.fragmentRocks(e,e.radius);for(const worm of w.worms)if(worm.alive&&near(worm))worm.alive=false;w.crew.scare();w.events.push({type:'magic-blast',x:e.x,y:e.y,radius:e.radius});
    }
    snapshot(){const e=this.active||this.queue[0];return{pending:this.pending,paused:this.pausesWorld,queue:this.queue.map(e=>({id:e.id,kind:e.kind,phase:e.phase})),active:e?{id:e.id,kind:e.kind,x:e.x,y:e.y,radius:e.radius,age:e.age,phase:e.phase,progress:Math.min(1,e.age/1.4)}:null,completed:this.completed.map(e=>({...e}))};}
    static parseStart(query){const p=new URLSearchParams(query),l=p.get('level'),s=p.get('seed'),valid=(v,max)=>v!==null&&/^\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)<=max;return{index:valid(l,15)&&Number(l)>=1?Number(l)-1:0,seed:valid(s,4294967295)?Number(s):undefined};}
  }return Magic;
});
