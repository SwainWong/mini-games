const {rivalField}=require('./actor-fixtures.cjs');
const {test}=require('node:test'),a=require('node:assert/strict'),{World}=require('../core.js'),levels=require('../levels.js');
test('round report follows recovered bead identity instead of double-counting theft',()=>{
 const w=new World(rivalField(),{seed:1}),b=w.balls[0],color=b.color;
 w.rival.bag.push(b);w.resolveBead(b,'stolen');a.equal(w.roundReport().colors.find(c=>c.color===color).stolen,1);
 w.rival.bag=[];Object.assign(b,{active:true,stolen:false});w.losses.stolen--;
 w.receive(w.jars.find(j=>j.color===color),b);const row=w.roundReport().colors.find(c=>c.color===color);
 a.equal(row.stolen,0);a.equal(row.collected,1);a.equal(row.points,10);
 a.equal(w.roundReport().colors.reduce((n,r)=>n+r.total,0),w.total);
});
test('report distinguishes wrong color, missed, held and waste points',()=>{
 const w=new World(rivalField(),{seed:1}),[b,c,d,e]=w.balls;
 w.resolveBead(b,'wrong-color');w.resolveBead(c,'missed');Object.assign(d,{value:3,waste:true});w.receive(w.jars.find(j=>j.color===d.color),d);e.held=true;
 const r=w.roundReport(),row=r.colors.find(c=>c.color===b.color);
 a.equal(row.wrong,1);a.equal(row.missed,1);a.equal(row.points,3);a.equal(r.heldCount,1);
 a.equal(r.beadPoints,3);a.equal(r.bonusPoints,0);a.equal(r.remaining,w.remainingPotential());
});
test('potential breakdown totals exact capacity-constrained ceiling and does not reveal hidden outcome',()=>{
 const w=new World(levels[7],{seed:34}),before=w.roundReport();
 a.equal(before.remaining,before.beadPotential+before.treasurePotential);
 a.equal(before.unopenedBags,2);a.equal(before.treasurePotential,80);
 a.equal(JSON.stringify(before).includes('refill'),false);
 w.score=40;w.receive(w.jars.find(j=>j.color===w.balls[0].color),w.balls[0]);
 a.equal(w.roundReport().bonusPoints,40);
});
test('report ceiling handles occupied and broken carts without losing the raw bead counts',()=>{
 const w=new World(rivalField(),{seed:1});w.jars[0].intact=false;
 const r=w.roundReport();a.equal(r.freeCount,w.total);a.equal(r.remaining,w.remainingPotential());a.ok(r.rawBeadValue>r.beadPotential);
});
test('held and dropped beads are disjoint, expired thief cargo is excluded from recoverable ceiling',()=>{
 const w=new World(rivalField(),{seed:1}),[held,drop,...bag]=w.balls;held.held=true;
 w.resolveBead(drop,'stolen');w.droppedBags.push({x:100,y:100,balls:[drop],age:0});
 for(const b of bag){w.resolveBead(b,'stolen');w.rival.bag.push(b);}
 let r=w.roundReport();a.equal(r.freeCount,0);a.equal(r.heldCount,1);a.equal(r.droppedCount,1);a.equal(r.recoverableCount,bag.length);
 a.equal(r.colors.reduce((n,c)=>n+c.unsettled,0),2);
 w.rival.escaped=true;r=w.roundReport();a.equal(r.recoverableCount,0);a.equal(r.remaining,w.remainingPotential());
 a.equal(r.colors.reduce((n,c)=>n+c.collected+c.stolen+c.wrong+c.missed+c.unsettled,0),w.total);
});
