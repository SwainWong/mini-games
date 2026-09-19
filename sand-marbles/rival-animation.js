/* Complete sprites and measured source anchors shared by simulation and rendering. */
(function(root,factory){const A=factory();if(typeof module==='object')module.exports=A;else root.SandRivalAnimation=A;})(globalThis,()=>{
  const pickupRoots=[190,555,945,1288,186,548,940,1280];
  const pickupPalms=[[310,352],[667,407],[1034,438],[1370,438],[260,714],[600,687],[1070,727],[1405,738]];
  const pickup=pickupRoots.map((x,i)=>({sheet:'pickup',source:[i%4*384,i<4?48:490,384,i<4?432:474],root:[x,i<4?476:958],palm:pickupPalms[i],scale:68/450,flip:i>=6}));
  const liftPalms=[[389,418],[859,366],[1327,320],[379,744],[818,720],[1280,690]],liftRoots=[290,772,1248,274,759,1227];
  const turnPalms=[[338,251],[774,255],[1270,255],[248,744],[662,748],[1148,777]],turnRoots=[270,754,1267,265,750,1280];
  for(let i=0;i<6;i++)pickup.push({sheet:'lift',source:[i%3*512,i<3?50:477,512,i<3?422:487],root:[liftRoots[i],i<3?466:958],palm:liftPalms[i],scale:68/450});
  for(let i=0;i<6;i++)pickup.push({sheet:'turn',source:[i%3*512,i<3?10:519,512,i<3?504:493],root:[turnRoots[i],i<3?510:1005],palm:turnPalms[i],scale:68/490});
  const drill=Array.from({length:12},(_,i)=>{const row=Math.floor(i/4),col=i%4,x=col*384,y=[35,355,677][row],feet=[338,666,995][row];return{sheet:'drill',source:[x,y,384,[306,316,322][row]],root:[x+176,feet],tip:[x+([322,704,1103,1487,324,700,1096,1489,346,716,1106,1486][i]-x),i<4?335:i<6?661:i<8?588:911],scale:68/310};});
  const reactions=Array.from({length:12},(_,i)=>{const row=Math.floor(i/4),col=i%4;return{sheet:'reactions',source:[col*384,[20,349,676][row],384,[320,320,335][row]],root:[col*384+210,[335,666,999][row]],scale:68/320};});
  const tips=[[360,43],[708,30],[1106,40],[1493,30],[360,373],[709,376],[1120,556],[1500,556],[372,860],[760,860],[1137,860],[1513,860]];
  const aim=Array.from({length:12},(_,i)=>{const row=Math.floor(i/4),col=i%4;return{sheet:'aim',source:[col*384,[20,350,700][row],384,[328,339,305][row]],root:[col*384+176,[343,680,998][row]],tip:tips[i],scale:68/310};});
  // Running strides reach slightly past nominal cells; tightly bounded source rectangles avoid neighbouring sprites.
  reactions[8].source=[44,676,355,327];reactions[8].root=[225,993];
  reactions[9].source=[476,676,308,327];reactions[9].root=[606,993];
  reactions[10].source=[858,676,235,332];reactions[10].root=[960,1000];
  const contactFrames=[2,0,4,5];
  const direction=r=>r.fx<0?-1:1;
  function local(frame,key='palm'){const p=frame[key],d=frame.flip?-1:1;return{x:(p[0]-frame.root[0])*frame.scale*d,y:(p[1]-frame.root[1])*frame.scale+16};}
  function point(r,frame,key='palm'){const p=local(frame,key);return{x:r.x+direction(r)*p.x,y:r.y+p.y};}
  function pickupFrame(p){
    const contact=p.contactFrame??2,t=p.age;
    if(t>=.7)return 14+Math.min(5,Math.floor((t-.7)/.05));
    if(t>=.4){const k=Math.min(5,Math.floor((t-.4)/.05));return contact===2?8+k:contact===0?[10,10,11,12,13,13][k]:[12,12,13,13,13,13][k];}
    if(contact===2)return t<.12?0:t<.24?1:t<.32?2:3;
    if(t<.24)return contact===0?0:4;
    return contact;
  }
  function palm(r){return point(r,pickup[pickupFrame(r.pickup)]);}
  function bag(r){return point(r,pickup[19]);}
  function carryFrames(contactFrame){return [...new Set(Array.from({length:77},(_,i)=>pickupFrame({contactFrame,age:.24+i/100})))];}
  function drillSelection(r){const f=Math.floor(r.digCycle*6)%6;return r.fy<-.2?{sheet:'aim',frame:f}:r.fy<.5?{sheet:'aim',frame:f+6}:{sheet:'drill',frame:f};}
  function drillPose(r){const s=drillSelection(r);return{...s,...({aim,drill}[s.sheet][s.frame])};}
  function selection(r){
    if(r.pickup)return{sheet:'pickup',frame:pickupFrame(r.pickup)};
    if(r.phase==='scared')return{sheet:'reactions',frame:r.fearAge<.25?4:5};
    if(r.phase==='dropping')return{sheet:'reactions',frame:r.fearAge<.8?6:7};
    if(r.phase==='fleeing'&&!r.fleeDigging)return{sheet:'reactions',frame:8+Math.floor(r.age*12*r.loadFactor)%2};
    if(r.phase==='listen')return{sheet:'reactions',frame:10};
    if(r.phase==='running'&&r.bag.length>=6)return{sheet:'reactions',frame:Math.floor(r.age*7*r.loadFactor)%4};
    if(r.phase==='digging'||r.phase==='fleeing'&&r.fleeDigging)return drillSelection(r);
    return{sheet:'drill',frame:r.phase==='running'?6+Math.floor(r.age*9*r.loadFactor)%6:6};
  }
  function pose(r){const s=selection(r);return{...s,...({pickup,drill,reactions,aim}[s.sheet][s.frame])};}
  function drawing(r,p=pose(r)){return{source:p.source,x:(p.source[0]-p.root[0])*p.scale,y:(p.source[1]-p.root[1])*p.scale+16,width:p.source[2]*p.scale,height:p.source[3]*p.scale,dir:direction(r)*(p.flip?-1:1)};}
  return{pickup,drill,reactions,aim,contactFrames,local,point,palm,bag,pickupFrame,selection,pose,drawing,drillPose,carryFrames};
});
