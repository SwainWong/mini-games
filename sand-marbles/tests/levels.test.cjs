const {test}=require('node:test');const assert=require('node:assert/strict');const {World,STEP}=require('../core.js');
let levels=[];try{levels=require('../levels.js');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
test('fifteen progressively introduced stages are playable, not placeholder entries',()=>{assert.equal(levels.length,15);assert.equal(new Set(levels.map(l=>l.title)).size,15);});
for(const [index,level] of levels.entries())test(`stage ${index+1}: actual simulated hint route wins with three stars`,()=>{
  const w=new World(level);for(let t=0;t<180;t++)w.step(STEP);
  for(const path of level.routes){const points=path.slice().reverse();for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],steps=20;for(let i=0;i<steps;i++){const p=[a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps],q=[a[0]+(b[0]-a[0])*(i+1)/steps,a[1]+(b[1]-a[1])*(i+1)/steps];w.dig(p,q,24);w.step(STEP);w.step(STEP);}}}
  for(let t=0;t<120*40&&w.state==='playing';t++)w.step(STEP);
  assert.equal(w.state,'won',JSON.stringify(w.snapshot()));assert.equal(w.collected,w.total);assert.equal(w.stars,3,JSON.stringify(w.snapshot()));
});
