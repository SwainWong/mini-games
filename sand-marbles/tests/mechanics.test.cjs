const {test}=require('node:test');const assert=require('node:assert/strict');const {World,STEP}=require('../core.js');const levels=require('../levels.js');
const fixture=(mechanics={},type='glass')=>({title:'fixture',rocks:[],tunnels:[[[200,110],[200,565]]],groups:[{x:200,y:110,color:'amber',count:1,type}],jars:[{x:200,color:'amber'}],routes:[[[200,110],[200,575]]],mechanics});
const run=(w,seconds)=>{for(let i=0;i<seconds/STEP;i++)w.step(STEP);};
test('hazards wait for first player dig; worm excavation changes terrain without player charge',()=>{
  const w=new World(levels[4]);run(w,4);assert.equal(w.time,0);assert.equal(w.effects.wormCells,0);w.dig([50,70],[50,70],14);const before=w.terrain.units;run(w,3);assert.ok(w.effects.wormCells>200);assert.equal(w.terrain.units,before);
});
test('earthquake performs two bounded refills and never changes excavation tally',()=>{
  const w=new World(levels[6]),q=w.level.mechanics.quake;w.dig([40,80],[40,80],14);for(const p of q.patches)w.terrain.dig(p.x+6,p.y+5,14,'worm');const before=w.terrain.units;run(w,30);assert.equal(w.effects.quakes,2);assert.ok(w.effects.refilled>0);assert.equal(w.terrain.units,before);
});
test('heavy and light materials actually differ in acceleration',()=>{
  const heavy=new World(fixture({},'heavy')),light=new World(fixture({},'light'));run(heavy,.15);run(light,.15);assert.ok(heavy.balls[0].vy>light.balls[0].vy*1.8);
});
test('wind pushes balls and mud slows them inside the indicated zones',()=>{
  const base=new World(fixture()),wind=new World(fixture({winds:[{x:170,y:70,w:60,h:300,force:90}]})),mud=new World(fixture({muds:[{x:170,y:70,w:60,h:300}]}));run(base,.15);run(wind,.15);run(mud,.15);assert.ok(wind.balls[0].vx>5);assert.ok(mud.balls[0].vy<base.balls[0].vy*.7);
});
test('magnet attracts heavy balls but not glass',()=>{
  const m={magnets:[{x:240,y:150,range:100,force:150}]},heavy=new World(fixture(m,'heavy')),glass=new World(fixture(m));run(heavy,.15);run(glass,.15);assert.ok(heavy.balls[0].vx>8);assert.equal(glass.balls[0].vx,0);
});
test('closed gate holds a ball and reopening releases it into its jar',()=>{
  const w=new World(fixture({gates:[{x:155,y:230,w:90,h:9,period:4.5,closed:2.2}]}));w.dig([20,70],[20,70],14);run(w,1.2);assert.ok(w.balls[0].y<231);assert.ok(w.effects.gate>0);assert.equal(w.collected,0);run(w,6);assert.equal(w.state,'won');
});
