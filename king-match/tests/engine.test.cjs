const {test}=require('node:test'),assert=require('node:assert/strict');const {Game}=require('../engine.js');const M=require('../match.js');
const run=(g,s)=>{for(let n=0;n<s*60;n++)g.update(1/60);};
test('new match mechanics reject two-gem clicks and initial pre-matches',()=>{const g=new Game(0);assert.equal(M.matches(g.board).length,0);assert.ok(M.legal(g.board).length>=3);assert.equal(typeof g.clear,'undefined');});
test('swap phases preserve physical bricks until visible blast and reject concurrent input',()=>{const g=new Game(0);g.start();const m=M.legal(g.board)[0];assert.ok(g.swap(m.a,m.b));assert.equal(g.swap(m.a,m.b),false);run(g,.2);assert.ok(m.cells.every(i=>g.board[i]!=null));run(g,.2);assert.ok(m.cells.every(i=>g.board[i]===null));});
test('source continuously emits visible stones and conservation includes only queued upstream stock',()=>{const g=new Game(0);g.start();run(g,5);const n=g.spawned;run(g,5);assert.ok(g.spawned>n+20);assert.equal(g.spawned,g.particles.length+g.collected);assert.equal(g.supplied,g.spawned+g.queued);});
for(let l=0;l<2;l++)test(`level ${l+1}: no input physically pushes king into spikes`,()=>{const g=new Game(l);g.start();const x=g.shield.x;run(g,10);assert.ok(g.shield.x<x-2);run(g,65);assert.equal(g.state,'lost');assert.equal(g.reason,'spikes');assert.ok(g.clearance<=0);assert.equal(g.spawned,g.particles.length+g.collected);});
test('no real contact means no rearward force, even if upstream queue is huge',()=>{const g=new Game(0);g.start();g.particles=[];g.spawned=0;g.supplied=g.queued=500;g.sourceEnabled=false;run(g,1);assert.equal(g.shield.x,g.level.shieldStart);assert.equal(g.contactForce,0);});
const solutions=require('./solutions.cjs');
for(let l=0;l<2;l++)test(`level ${l+1}: near-spike drainage reverses pressure and wins by output, not clear count`,()=>{
 const g=new Game(l);g.start();run(g,l===0?24:21);const danger=g.clearance;assert.ok(danger>0&&danger<25);assert.ok(g.shield.vx<0);
 for(const [a,b] of solutions[l]){assert.ok(g.swap(a,b));run(g,1);}run(g,55);
 assert.equal(g.state,'won');assert.ok(g.clearance>danger);assert.ok(g.collected>=g.level.target);assert.ok(g.safeTime>=2);assert.equal(g.sourceEnabled,false);assert.equal(g.spawned,g.particles.length+g.collected);
});
test('remix retains permanent holes and beam, creates no free match, and keeps source running',()=>{
 const g=new Game(1);g.start();const [a,b]=solutions[1][0];g.swap(a,b);run(g,.7);const holes=g.board.map((v,i)=>v===null||v===-1?i:-1).filter(i=>i>=0),before=[...g.board],n=g.spawned;assert.ok(g.remix());
 for(const i of holes)assert.equal(g.board[i],before[i]);assert.equal(M.matches(g.board).length,0);assert.ok(M.legal(g.board).length>=3);assert.equal(g.remixes,1);run(g,2);assert.ok(g.spawned>n);assert.ok(g.remix());assert.equal(g.remix(),false);
});
