/* A visible pursuer. Sand is diggable; rocks are never passable. No time-based loss. */
(function(root,factory){const Rival=factory();if(typeof module==='object')module.exports=Rival;else root.SandRival=Rival;})(globalThis,()=>{
  const SIZE=16,COLS=35,ROWS=35,RADIUS=10;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  class Rival{
    constructor(level,balls){
      this.rocks=level.rocks;this.speed=level.mechanics.rival.speed;this.age=0;this.phase='watching';this.danger='distant';this.distance=null;this.target=null;this.path=[];this.repath=0;this.fx=1;this.fy=0;this.removed=0;this.captured=null;
      const starts=[{x:48,y:76},{x:512,y:76}].filter(p=>this.clear(p.x,p.y));
      const initial=balls.filter(b=>b.active);starts.sort((a,b)=>Math.min(...initial.map(p=>distance(b,p)))-Math.min(...initial.map(p=>distance(a,p))));
      const start=starts[0]||{x:28,y:76};this.x=start.x;this.y=start.y;this.fx=start.x>280?-1:1;
      this.blocked=Array.from({length:COLS*ROWS},(_,i)=>!this.clear((i%COLS+.5)*SIZE,(Math.floor(i/COLS)+.5)*SIZE));
    }
    clear(x,y){return x>=42&&x<=518&&y>=58&&y<=548&&this.rocks.every(r=>((x-r.x)/(r.rx+RADIUS+3))**2+((y-r.y)/(r.ry+RADIUS+3))**2>1);}
    lineClear(a,b){const n=Math.ceil(distance(a,b)/4);for(let k=1;k<=n;k++)if(!this.clear(a.x+(b.x-a.x)*k/n,a.y+(b.y-a.y)*k/n))return false;return true;}
    canReach(from,ball){
      if(distance(from,ball)>=ball.r+26)return false;
      const n=Math.max(1,Math.ceil(distance(from,ball)/3));for(let i=1;i<=n;i++){const x=from.x+(ball.x-from.x)*i/n,y=from.y+(ball.y-from.y)*i/n;if(this.rocks.some(r=>((x-r.x)/r.rx)**2+((y-r.y)/r.ry)**2<=1))return false;}return true;
    }
    route(target){
      const reachPoint={x:Math.max(42,Math.min(518,target.x)),y:Math.max(58,Math.min(548,target.y))};
      const cell=p=>Math.max(0,Math.min(ROWS-1,Math.floor(p.y/SIZE)))*COLS+Math.max(0,Math.min(COLS-1,Math.floor(p.x/SIZE)));
      const point=i=>({x:(i%COLS+.5)*SIZE,y:(Math.floor(i/COLS)+.5)*SIZE});
      const nearest=p=>{let best=-1,d=Infinity;for(let i=0;i<this.blocked.length;i++){if(this.blocked[i])continue;const q=point(i),v=distance(p,q);if(v<d){d=v;best=i;}}return best;};
      let start=cell(this),goal=cell(reachPoint);if(this.blocked[start])start=nearest(this);if(this.blocked[goal])goal=nearest(reachPoint);if(start<0||goal<0)return[];
      const open=[start],came=new Map(),cost=new Map([[start,0]]),closed=new Set();
      while(open.length){let at=0;for(let i=1;i<open.length;i++)if(cost.get(open[i])+distance(point(open[i]),point(goal))<cost.get(open[at])+distance(point(open[at]),point(goal)))at=i;
        const current=open.splice(at,1)[0];if(current===goal){const out=[];let n=goal;while(n!==start){out.unshift(point(n));n=came.get(n);}if(this.lineClear(out.at(-1)||this,reachPoint))out.push(reachPoint);return out;}
        closed.add(current);const x=current%COLS,y=Math.floor(current/COLS);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if((!dx&&!dy)||x+dx<0||x+dx>=COLS||y+dy<0||y+dy>=ROWS)continue;const next=(y+dy)*COLS+x+dx;if(this.blocked[next]||closed.has(next)||!this.lineClear(point(current),point(next)))continue;const value=cost.get(current)+Math.hypot(dx,dy)*SIZE;if(value>=(cost.get(next)??Infinity))continue;cost.set(next,value);came.set(next,current);if(!open.includes(next))open.push(next);}
      }
      return[];
    }
    step(world,dt){
      this.age+=dt;const candidates=world.balls.filter(b=>b.active&&b.y<560);
      if(!candidates.length){this.phase='searching';this.target=null;this.danger='distant';this.distance=null;return;}
      this.repath-=dt;if(this.repath<=0||(this.target&&(!this.target.active||this.target.y>=560))){
        const calm=candidates.filter(b=>Math.hypot(b.vx,b.vy)<70),choices=calm.length?calm:candidates;
        choices.sort((a,b)=>distance(this,a)-distance(this,b));this.target=null;this.path=[];
        for(const candidate of [...choices,...candidates.filter(b=>!choices.includes(b))]){const path=this.route(candidate);if(this.canReach(path.at(-1)||this,candidate)){this.target=candidate;this.path=path;break;}}this.repath=.35;
      }
      let next=this.path[0];while(next&&distance(this,next)<.25){this.path.shift();next=this.path[0];}
      if(next){const d=distance(this,next),dx=(next.x-this.x)/d,dy=(next.y-this.y)/d;this.fx=dx;this.fy=dy;
        const digging=world.terrain.solid(this.x+dx*34,this.y+dy*34);this.phase=digging?'digging':'running';
        const amount=Math.min(d,this.speed*(digging?1:1.85)*(0.72+Math.max(0,Math.sin(this.age*13))*.85)*dt);
        const nx=this.x+dx*amount,ny=this.y+dy*amount;if(this.clear(nx,ny)){this.x=nx;this.y=ny;}else this.repath=0;
        const tip=this.toolPoint();this.removed+=world.terrain.dig(tip.x,tip.y,17,'rival');
      }else this.phase='searching';
      const nearest=candidates.reduce((a,b)=>distance(this,a)<distance(this,b)?a:b);this.distance=distance(this,nearest);
      this.danger=this.distance<58?'near':this.distance<115?'approaching':'distant';
      const caught=candidates.find(b=>this.canReach(this,b));
      if(caught){this.captured={x:caught.x,y:caught.y,color:caught.color};this.phase='caught';caught.active=false;caught.stolen=true;world.end(false,'盗宝人抢先挖到了珠子！下次要在他靠近前，把珠子送进罐子。',{kind:'stolen',x:caught.x,y:caught.y,color:caught.color});}
    }
    toolPoint(){return{x:this.x+this.fx*12,y:this.y+this.fy*12};}
    snapshot(){return{x:this.x,y:this.y,tool:this.toolPoint(),phase:this.phase,danger:this.danger,distance:this.distance,fx:this.fx,fy:this.fy,removed:this.removed,target:this.target?{x:this.target.x,y:this.target.y,color:this.target.color}:null,captured:this.captured?{...this.captured}:null};}
  }
  return Rival;
});
