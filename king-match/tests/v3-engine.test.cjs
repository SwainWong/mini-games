const {test}=require('node:test'),assert=require('node:assert/strict'),{Game}=require('../engine.js'),M=require('../match.js');
const run=(g,s)=>{for(let i=0;i<s*120;i++)g.update(1/120)};
test('ready is densely stocked, cannot advance physics or HP',()=>{const g=new Game(0),x=g.shield.x;assert.ok(g.particles.length>400);run(g,5);assert.equal(g.time,0);assert.equal(g.hp,100);assert.equal(g.shield.x,x);});
test('first spike contact survives, jitter respects cooldown and release stops damage',()=>{const g=new Game(0);g.start();g.clearance=0;g.hazard();assert.equal(g.hp,88);assert.equal(g.state,'playing');g.clearance=2;g.time=.3;g.hazard();g.clearance=0;g.time=.5;g.hazard();assert.equal(g.hp,88);g.time=.81;g.hazard();assert.equal(g.hp,76);g.clearance=2;g.time=3;g.hazard();assert.equal(g.hp,76);});
test('continuous spike contact exhausts HP only after the rescue window',()=>{const g=new Game(0);g.start();g.clearance=0;for(let i=0;i<=8;i++){g.time=i*.801;g.hazard();if(i<8)assert.equal(g.state,'playing');}assert.equal(g.hp,0);assert.equal(g.state,'lost');});
test('falling gems move continuously, block new input, then commit a supported board',()=>{const g=new Game(0);g.start();g.board=Array(56).fill(null);g.board[0]=0;g.board[16]=1;g.beginFall();assert.equal(g.operation.kind,'fall');const y=g.operation.tiles[0].y;assert.equal(g.swap(0,16),false);run(g,.1);assert.ok(g.operation.tiles[0].y>y);run(g,1);assert.deepEqual(M.gravity(g.board).board,g.board);assert.equal(g.board[40],0);assert.equal(g.board[48],1);});
test('falling brick collider follows visible y and the old slot becomes physically empty',()=>{
 const g=new Game(0);g.start();g.sourceEnabled=false;g.board=Array(56).fill(null);g.board[7]=0;g.beginFall();run(g,.3);const tile=g.operation.tiles[0];assert.ok(tile.y>398);
 g.particles=[{id:0,x:384,y:410,r:7,vx:0,vy:0,angle:0,spin:0}];run(g,1/120);assert.ok(g.particles[0].y>409,'old row does not push grain above398');
 const y=g.operation.tiles[0].y;g.particles=[{id:0,x:384,y:y+5,r:7,vx:0,vy:0,angle:0,spin:0,py:y-8,px:384}];run(g,1/120);const now=g.operation.tiles[0];assert.ok(g.particles[0].y+7<=now.y+.01||g.particles[0].y-7>=now.y+48-.01,'particle cannot stay inside moving brick');
});
const solutions=require('./solutions.cjs');
for(let l=0;l<2;l++)test(`level ${l+1}: wounded king can drain, leave spikes and preserve HP for two seconds`,()=>{
 const g=new Game(l);g.start();const move=([a,b])=>{assert.ok(g.swap(a,b));let n=0;while(g.operation&&g.state==='playing'&&n++<3600)g.update(1/120);};for(const m of solutions[l].slice(0,-1))move(m);
 while(g.hp===100&&g.time<65)g.update(1/120);assert.equal(g.hp,88);assert.equal(g.state,'playing');move(solutions[l].at(-1));
 while(g.clearance<.5&&g.state==='playing'&&g.time<80)g.update(1/120);const hp=g.hp;assert.ok(hp>0&&hp<100);run(g,2);assert.equal(g.hp,hp);assert.ok(g.clearance>.5);run(g,25);assert.equal(g.state,'won');assert.equal(g.hp,hp);
});
