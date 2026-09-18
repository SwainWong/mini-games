const {test}=require('node:test'),assert=require('node:assert/strict'),{Game}=require('../engine.js'),M=require('../match.js'),solutions=require('./solutions.cjs');
test('an open receiving chamber drains the chute freely without emptying its reservoir',()=>{const g=new Game(0,{rallySeed:1});g.start();for(let i=0;i<1200;i++)g.update(1/120);
 // Use the real six-gem tail after seven moves: it has an open outlet but
 // still a legal last exchange, so the new no-moves victory must not trigger.
 let tail=[...g.level.board];for(const [a,b]of solutions[0].slice(0,7))tail=M.resolve(tail,a,b).board;assert.ok(M.legal(tail).length);g.board=tail;const crossed=new Set;let overlap=0;
 for(let i=0;i<1200;i++){g.update(1/120);for(const p of g.particles)if(p.py<260&&p.y>=260)crossed.add(p.id);if(i%60===0)overlap=Math.max(overlap,g.overlap());}
 assert.ok(crossed.size>500,`only ${crossed.size} grains passed the outlet in ten seconds`);assert.ok(g.snapshot().stockFill>.85);assert.ok(overlap<.05);assert.equal(g.spawned,g.particles.length+g.collected);assert.equal(g.state,'playing');});
