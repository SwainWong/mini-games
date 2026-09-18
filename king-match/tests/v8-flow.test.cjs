const {test}=require('node:test'),assert=require('node:assert/strict'),{Game}=require('../engine.js');
function pocket(){const g=new Game(0);g.start();g.sourceEnabled=false;g.particles=[{id:0,x:48,y:679,r:7,vx:0,vy:0,angle:0,spin:0}];g.spawned=g.supplied=1;g.operation={kind:'fall',started:0,matched:[],after:Array(56).fill(null),tiles:[{from:32,x:24,y:624,startY:624,targetY:638},{from:48,x:24,y:686,startY:686,targetY:686},{from:41,x:72,y:638,startY:638,targetY:638}]};return g;}
function probe(g,seconds,before=()=>{}){for(let i=0;i<seconds*120;i++){g.mechanicalTime+=1/120;before(g,i);g.resolveClamps();}}
test('a very slow continuously descending contact is not a blocked compression',()=>{const g=pocket();probe(g,12,()=>{for(const t of g.operation.tiles){t.y+=.0002;t.lastAdvance=.0002;}for(const p of g.particles)p.y+=.0002;});assert.equal(g.crushed,0);assert.equal(g.particles.length,1);assert.ok(g.particles[0].y>679.28);});
test('opening a real side route interrupts the sustained crush condition',()=>{const g=pocket();probe(g,.05);assert.equal(g.crushed,0);g.operation.tiles.pop();probe(g,3);assert.equal(g.crushed,0);assert.equal(g.particles.length,1);});
test('floor or a single upper face cannot substitute for two gem supports',()=>{const g=pocket();g.operation.tiles.splice(1,1);probe(g,3);assert.equal(g.crushed,0);assert.equal(g.particles.length,1);});
test('a different lower supporting gem begins a new pressure event',()=>{const g=pocket();probe(g,.05);g.operation.tiles[1].from=49;probe(g,.05);assert.equal(g.crushed,0);probe(g,1);assert.equal(g.crushed,1);assert.equal(g.collected,0);assert.equal(g.crushLog[0].lower,49);assert.ok(g.crushLog[0].duration>=.05);});
test('a very slow open downward flow receives no artificial steering',()=>{
 const g=pocket();g.operation.tiles.splice(1);probe(g,3,()=>{g.particles[0].y+=.0002;assert.equal(g.guides.size,0);});assert.equal(g.guides.size,0);assert.equal(g.crushed,0);
});
test('guidance releases a grain immediately when it progresses or leaves the falling sweep',()=>{
 for(const outside of [false,true]){const g=pocket(),p=g.particles[0];g.operation.tiles.splice(1);if(outside)p.x=200;
 p.px=p.x;p.py=p.y-(outside?0:.0002);g.guides.set(p.id,[{x:p.x+8,y:p.y+8}]);g.particleStep();assert.equal(g.guides.size,0);assert.equal(g.crushed,0);}
});
