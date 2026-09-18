const {World}=require('../core.js'),levels=require('../levels.js'),base=require('./bag-avoid-routes.cjs'),timing=require('./timing.cjs'),replay=require('./input-replay.cjs');
module.exports=(id,seed)=>{
 const routes=structuredClone(base[id-1]),w=new World(levels[id-1],{seed});let input={...timing[id][seed]};
 if(id===7)input={delay:.5,ticks:2};
 if([9,11,12,14,15].includes(id))input={delay:0,ticks:2};
 if(id===10)input={delay:1,ticks:2};
 if(id===13){input={delay:seed===100000?1:0,ticks:[1,300].includes(seed)?1:2};if(seed===1000)routes[1].at(-1)[0]=400;}
 return {...replay(w,routes,input),input,routes};
};
