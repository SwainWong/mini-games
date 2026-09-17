const {test}=require('node:test'),assert=require('node:assert/strict'),{Game}=require('../engine.js');
test('an open receiving chamber drains the chute freely without emptying its reservoir',()=>{const g=new Game(0,{rallySeed:1});g.start();for(let i=0;i<1200;i++)g.update(1/120);
 // Diagnostic chamber isolates the outlet from match choices. Actual input
 // and the unchanged puzzles are covered separately by browser acceptance.
 g.board=Array(56).fill(null);g.board[48]=0;const crossed=new Set;let overlap=0;
 for(let i=0;i<1200;i++){g.update(1/120);for(const p of g.particles)if(p.py<260&&p.y>=260)crossed.add(p.id);if(i%60===0)overlap=Math.max(overlap,g.overlap());}
 assert.ok(crossed.size>500,`only ${crossed.size} grains passed the outlet in ten seconds`);assert.ok(g.snapshot().stockFill>.85);assert.ok(overlap<.05);assert.equal(g.spawned,g.particles.length+g.collected);assert.equal(g.state,'playing');});
