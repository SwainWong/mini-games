/* Every stage includes a playable witness route; tested with the real physics engine. */
(function(root,factory){const levels=factory();if(typeof module==='object')module.exports=levels;else root.SandLevels=levels;})(globalThis,()=>{
  const palette=['amber','blue','jade','rose'];
  const titles=['第一条沙径','两色分流','绕石而行','沉甸甸的朋友','蚯蚓邻居','弹跳三重奏','大地轻轻晃','风的方向','慢慢穿过黏土','等一扇门打开','磁石与重力珠','四季的颜色','地下交响曲','风口与闸门','沙径大师'];
  const notes=[
    '连接中间的缺口。挖得越少，通关星级越高。',
    '两种颜色各走各的路，保留中间的沙墙。',
    '灰色石块挖不动，绕开它再对准罐口。',
    '带十字纹的重力珠更大、更沉，需要稍宽的弯道。',
    '蚯蚓会自己挖洞。观察它的路线；它挖的沙不计入你的用量。',
    '带环纹的弹力珠更爱跳。三种颜色分流，弯道留些余量。',
    '地震预警后珠子会抖动，虚线框内少量回填。本关只有两次震动。',
    '轻盈珠落得慢，也更容易被风吹偏；用沙墙保护路线。',
    '深色黏土区会减速，但不会吞掉珠子。别因为慢就挖太多。',
    '闸门交替开合。珠子可以在门上等待，不必急着挖旁路。',
    '磁石只吸引重力珠。提前留出弯道空间，其他珠子不受影响。',
    '四种颜色、四个罐子。起点错落，仔细保留相邻路线的边界。',
    '蚯蚓、地震和黏土一起出现。先观察，再动手。',
    '穿过风口，等待闸门。分开四种颜色，防止轻盈珠走错路。',
    '六种机关同场。四种材质、四种颜色，精细规划你的最后一段沙径。'
  ];
  function stage(i,{n=2,turn=30,rocks=false,types=['glass'],extra=false,features=[]}={}){
    const centers=n===1?[280]:n===2?[145,415]:n===3?[95,280,465]:[75,210,350,485];
    const level={id:i+1,title:titles[i],note:notes[i],chapter:i<5?'初识沙径':i<10?'地下奇遇':'沙径大师',difficulty:i<3?'入门':i<7?'进阶':i<11?'挑战':'大师',jars:[],groups:[],tunnels:[],rocks:[],routes:[],mechanics:{},features};
    centers.forEach((x,k)=>{
      const sign=k%2===0?-1:1,offset=i>2?sign*(i>10?22:12):0,startY=113+(i>8?(k%2)*38:0),color=palette[k];
      level.jars.push({x,color});
      level.groups.push({x:x+offset,y:startY,color,count:n===1?8:6,types});
      let route=[[x+offset,startY],[x+offset,211+(k%2)*10],[x+sign*turn,275],[x+sign*turn,360],[x-sign*turn*.35,465],[x,575]];
      if(n===1)route=[[x,startY],[x,250],[x,420],[x,575]];
      level.routes.push(route);
      level.tunnels.push([[x+offset,startY+5],[x+offset,175+(k%2)*16]],[[x,525],[x,565]]);
      if(n===1){level.tunnels=[[[x,startY],[x,265]],[[x,414],[x,565]]];}
      if(rocks)level.rocks.push({x,y:304+(k%2)*10,rx:n===4?17:22,ry:30+(i>10?9:0)});
      if(extra){const p=route.at(-2);level.groups.push({x:p[0],y:p[1]-7,color,count:3,types:types.slice().reverse()});}
    });
    if(features.includes('worm'))level.mechanics.worms=[{x:centers[0]-10,y:345,range:n===4?24:42,depth:34,speed:.62}];
    if(features.includes('quake'))level.mechanics.quake={first:6,interval:8,count:2,patches:centers.map((x,k)=>({x:x+(k%2===0?-1:1)*turn+14,y:335,w:12,h:10}))};
    if(features.includes('wind'))level.mechanics.winds=centers.filter((_,k)=>k%2===0).map(x=>({x:x-51,y:360,w:102,h:110,force:65}));
    if(features.includes('mud'))level.mechanics.muds=[{x:centers.at(-1)-49,y:370,w:98,h:75}];
    if(features.includes('gate'))level.mechanics.gates=centers.map((x,k)=>({x:x-45,y:430,w:90,h:9,period:4.5,closed:2.2,phase:k*.6}));
    if(features.includes('magnet'))level.mechanics.magnets=[{x:centers[0]+43,y:389,range:105,force:125}];
    return level;
  }
  return[
    stage(0,{n:1,turn:0}),stage(1,{n:2,turn:18}),stage(2,{n:2,turn:49,rocks:true}),
    stage(3,{n:2,turn:49,rocks:true,types:['glass','heavy']}),
    stage(4,{n:2,turn:42,rocks:true,features:['worm']}),
    stage(5,{n:3,turn:42,rocks:true,types:['glass','rubber']}),
    stage(6,{n:3,turn:42,rocks:true,features:['quake']}),
    stage(7,{n:3,turn:43,rocks:true,types:['glass','light'],features:['wind']}),
    stage(8,{n:3,turn:44,rocks:true,types:['glass','heavy'],features:['mud']}),
    stage(9,{n:3,turn:43,rocks:true,extra:true,features:['gate']}),
    stage(10,{n:3,turn:46,rocks:true,types:['glass','heavy'],extra:true,features:['magnet']}),
    stage(11,{n:4,turn:34,rocks:true,types:['glass','rubber'],extra:true}),
    stage(12,{n:4,turn:34,rocks:true,types:['glass','heavy'],extra:true,features:['worm','quake','mud']}),
    stage(13,{n:4,turn:34,rocks:true,types:['light','glass','rubber'],extra:true,features:['wind','gate','worm']}),
    stage(14,{n:4,turn:34,rocks:true,types:['glass','heavy','rubber','light'],extra:true,features:['worm','quake','wind','mud','gate','magnet']})
  ];
});
