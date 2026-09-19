const {test}=require('node:test'),a=require('node:assert/strict'),levels=require('../levels.js'),codex=require('../codex.js'),{World}=require('../core.js');
test('major actors arrive three levels apart and are truly absent before their debut',()=>{
 for(const [id,key,first]of [['rival','rival',4],['worm','worms',7],['porter','operator',10]]){
  for(const l of levels){const w=new World(l),present=key==='worms'?w.worms.length>0:!!w[key];a.equal(present,l.id>=first,`${id} stage ${l.id}`);}
 }
});
test('normal progression introduces at most one new codex concept per level',()=>{
 const seen=new Set(),first={};for(const l of levels){const fresh=codex.forLevel(l).filter(id=>!seen.has(id));a.ok(fresh.length<=1,JSON.stringify({level:l.id,fresh}));for(const id of fresh){seen.add(id);first[id]=l.id;}}
 a.deepEqual(first,{score:1,rock:2,rival:4,heavy:5,bag:6,worm:7,rubber:8,porter:10,bomb:11,multi:12,chest:13,light:14});
});
test('each first-discovery explanation is exactly two short sentences',()=>{
 for(const [id,entry]of Object.entries(codex.entries)){a.equal(entry.short.length,2);for(const line of entry.short)a.ok([...line].length<=24,`${id}: ${line}`);a.ok(entry.short.join('').length<=42,id);}
});
