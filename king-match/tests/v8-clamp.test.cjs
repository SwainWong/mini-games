const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../clamp.js');
const p={id:0,x:48,y:679,r:7},upper={x:24,y:624,w:48,h:48},lower={x:24,y:686,w:48,h:48},side={x:72,y:638,w:48,h:48},sweeps=[{x:24,y:624,w:48,h:62}];
test('a genuinely sealed upper/lower brick pocket has no optimistic escape',()=>{assert.equal(C.escape(p,[upper,lower,side],sweeps,{optimistic:true}).status,'closed');});
test('open side, downward flow and a narrow side passage cannot authorize crushing',()=>{for(const boxes of [[upper,lower],[upper],[{...upper,y:620},lower]])assert.equal(C.escape(p,boxes,sweeps,{optimistic:true}).status,'open');});
test('optimistic graph preserves a passage narrower than the sampling cell',()=>{const boxes=[upper,lower,{...side,y:640.5,h:31.5}];assert.equal(C.escape(p,boxes,sweeps,{optimistic:true}).status,'open');});
test('lower support must be a real gem on the downward pressure chain',()=>{const a={...p,y:665},b={id:1,x:48,y:679,r:7};const top={...upper,y:610};assert.deepEqual(C.support(a,[top,lower],[a,b],top).chain,[1,0]);assert.equal(C.support(a,[top],[a,b],top),null);assert.equal(C.support(a,[top,lower],[a,{...b,x:80}],top),null);});
