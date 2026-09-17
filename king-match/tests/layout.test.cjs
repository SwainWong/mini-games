const {test}=require('node:test'),assert=require('node:assert/strict'),M=require('../match.js'),{levels}=require('../levels.js'),solutions=require('./solutions.cjs');
for(let l=0;l<2;l++)test(`level ${l+1}: gravity-aware layout needs several decisions and has a full chamber outlet solution`,()=>{
 let frontier=[levels[l].board],seen=new Set;assert.equal(M.matches(frontier[0]).length,0);assert.equal(new Set(frontier[0].filter(v=>v>=0)).size,4);
 for(let depth=1;depth<=(l===0?2:3);depth++){const next=[];for(const board of frontier)for(const m of M.legal(board)){const b=M.resolve(board,m.a,m.b).board;assert.notEqual(M.routeCost(b),0,`early route at ${depth}`);const key=b.map(v=>v==null?'.':v).join('');if(!seen.has(key)){seen.add(key);next.push(b)}}frontier=next;}
 let b=levels[l].board;for(const [a,c]of solutions[l]){const r=M.resolve(b,a,c);assert.ok(r);b=r.board;}assert.equal(M.routeCost(b),0);assert.deepEqual(M.gravity(b).board,b);assert.equal(M.matches(b).length,0);if(l)for(const i of [5,6,7,13,14,15,21,22,23])assert.equal(b[i],null);
});
