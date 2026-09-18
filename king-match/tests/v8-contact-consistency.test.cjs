const {test}=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../engine.js'),C=require('../clamp.js');
function game(tiles,particles){const g=new Game(0);g.start();g.sourceEnabled=false;g.particles=particles.map(p=>({vx:0,vy:0,angle:0,spin:0,...p}));g.spawned=g.supplied=particles.length;g.operation={kind:'fall',started:0,matched:[],after:Array(56).fill(null),tiles};return g;}
test('a rounded upper corner that stops a falling brick is also a pressure contact',()=>{
 const y=672+Math.sqrt(49-36),upper={from:32,x:24,y:624,startY:624,targetY:638},lower={from:49,x:72,y:y+7,startY:y+7,targetY:y+7};
 const g=game([upper,lower],[{id:0,x:78,y,r:7}]);g.mechanicalTime=.01;g.resolveClamps();
 assert.equal(g.clamps.size,1);const v=[...g.clamps.values()][0];assert.equal(v.contactId,0);assert.ok(Math.abs(v.topGap)<1e-8);assert.equal(g.crushed,0,'an open side must remain open');
});
test('the lower gem corner uses the same circular contact surface',()=>{
 const lower={from:48,x:24,y:686},p={id:0,x:78,y:686-Math.sqrt(49-36),r:7};
 assert.equal(C.support(p,[lower],[p],{}).lower,lower);
 assert.equal(C.support({...p,y:p.y-1.2},[lower],[p],{}),null);
});
test('rolling between adjacent level support bricks preserves the bearing-surface identity',()=>{
 const tiles=[{from:48,x:24,y:686},{from:49,x:72,y:686},{from:50,x:120,y:686}];
 const a={id:0,x:66,y:679,r:7},b={...a,x:80};
 const left=C.support(a,tiles,[a],{}),right=C.support(b,tiles,[b],{});
 assert.notEqual(left.lower.from,right.lower.from);assert.equal(left.supportKey,right.supportKey);
 assert.equal(left.supportKey,'48,49,50');
});
test('a downstream supporting grain is evidence of load but is not itself a crush candidate',()=>{
 const upper={from:32,x:24,y:610,startY:610,targetY:638},lower={from:48,x:24,y:686,startY:686,targetY:686};
 const g=game([upper,lower],[{id:0,x:48,y:665,r:7},{id:1,x:48,y:679,r:7}]);g.mechanicalTime=.01;g.resolveClamps();
 assert.deepEqual([...g.clamps.values()].map(v=>v.id),[0]);assert.deepEqual([...g.clamps.values()][0].chain,[1,0]);
});
test('a blocked heavy brick transmits downward load without moving or deleting a grain',()=>{
 const upper={from:32,x:24,y:610,startY:610,targetY:638},lower={from:48,x:24,y:686,startY:686,targetY:686};
 const g=game([upper,lower],[{id:0,x:48,y:665,r:7},{id:1,x:48,y:679,r:7}]);g.time=1;g.mechanicalTime=1;
 const before=g.particles.map(p=>[p.id,p.x,p.y]);g.animateSwap();
 assert.equal(upper.y,610);assert.ok(g.particles[0].vy>0);assert.deepEqual(g.particles.map(p=>[p.id,p.x,p.y]),before);assert.equal(g.crushed,0);
});
test('a grain exactly tangent to a brick side cannot act as an invisible vertical ledge',()=>{
 const upper={from:17,x:72,y:534.6513164664464,startY:494,targetY:542},lower={from:24,x:24,y:590,startY:590,targetY:590};
 const g=game([upper,lower],[{id:0,x:64.67131674601697,y:582.6713167460169,r:7.328683253983035}]);g.time=2;g.mechanicalTime=2;
 const before=upper.y;g.animateSwap();assert.ok(upper.y>before+5);assert.equal(g.crushed,0);assert.ok(g.overlap()<.001);
});
