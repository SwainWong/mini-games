const {test}=require('node:test');
const assert=require('node:assert/strict');
let core={};try{core=require('../core.js');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
test('unfinished and failed attempts earn zero stars; won attempts respect inclusive budgets',()=>{
  assert.equal(typeof core.rating,'function','rating must be implemented');
  for(const [state,dug,want] of [['playing',0,0],['lost',0,0],['lost',160,0],['won',0,3],['won',100,3],['won',101,2],['won',160,2],['won',161,1]])assert.equal(core.rating(state,dug,{three:100,two:160}),want);
});
test('only newly removed player sand counts; empty strokes and worm dig do not',()=>{
  assert.equal(typeof core.Terrain,'function','Terrain must be implemented');
  const t=new core.Terrain([]);
  const first=t.dig(100,150,20,'player');assert.ok(first>0);assert.equal(t.playerCells,first);
  assert.equal(t.dig(100,150,20,'player'),0);assert.equal(t.playerCells,first);
  assert.ok(t.dig(300,150,20,'worm')>0);assert.equal(t.playerCells,first);
});
test('stone cannot be dug or charged to the player',()=>{
  assert.equal(typeof core.Terrain,'function');const t=new core.Terrain([{x:100,y:150,rx:30,ry:30}]);
  assert.equal(t.dig(100,150,15,'player'),0);assert.equal(t.playerCells,0);assert.ok(t.solid(100,150));
});
test('refill excludes active balls and never directly charges the player',()=>{
  assert.equal(typeof core.Terrain,'function');const t=new core.Terrain([]);t.dig(150,200,25,'worm');
  t.refill({x:130,y:180,w:40,h:40},[{x:150,y:200,r:10,active:true}]);assert.equal(t.solid(150,200),false);assert.equal(t.playerCells,0);
  assert.ok(t.solid(132,182));
});
