const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../match.js'),{levels}=require('../levels.js');
// Conservative connected-space check: include the partial intake at column 5,
// allow upward paths, and allow lateral passage above the sloping beam. Its
// solid base blocks downward passage. This admits extra possible paths rather
// than hiding physical shortcuts behind an overly restrictive grid model.
function openRoute(b){
 const seen=new Set,stack=[5,6,7].filter(i=>b[i]===null);
 while(stack.length){const i=stack.pop();if(seen.has(i))continue;seen.add(i);if(i>=48)return true;
  for(const j of [i%8?i-1:-1,i%8<7?i+1:-1,i>=8?i-8:-1,i+8]){
   if(j<0||j>=56||!(b[j]===null||b[j]===-1))continue;
   if(j===i+8&&b[i]===-1||j===i-8&&b[j]===-1)continue;
   stack.push(j);
  }
 }return false;
}
test('second level has no drainage shortcut in four or fewer normal swaps',()=>{
 let frontier=[levels[1].board],seen=new Set;
 for(let depth=1;depth<=4;depth++){
  const next=[];for(const b of frontier)for(const m of M.legal(b)){
   const a=m.after;for(const i of m.cells)a[i]=null;
   assert.equal(openRoute(a),false,`shortcut at ${depth} swaps`);
   const key=a.map(v=>v===null?'.':v).join('');if(!seen.has(key)){seen.add(key);next.push(a);}
  }frontier=next;
 }
 assert.ok(seen.size>10000,'Search must examine all reachable shallow states');
});
