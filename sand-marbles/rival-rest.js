/* Shared, complete resting poses: no silhouette blending or oversized seated sprites. */
(function(root,factory){const R=factory();if(typeof module==='object')module.exports=R;else root.SandRivalRest=R;})(globalThis,()=>{
  const frames=[[74,51,184,430],[375,128,208,353],[694,199,193,283],[977,240,252,243],[57,570,260,269],[366,586,262,253],[680,589,259,250],[979,566,253,271],[68,952,252,275],[379,929,228,296],[694,898,220,327],[990,846,213,382]];
  function frame(r){
    if(!r||!['rest','wipe','drink'].includes(r.phase)||r.stunTime>0||r.fleeing)return null;
    if(!r.resting)return 11;
    const age=r.restAge||0,remaining=Math.max(2-age,(85-r.stamina)/26);
    if(age<.48)return Math.min(3,Math.floor(age/.12));
    if(remaining<=.6)return remaining>.4?9:remaining>.2?10:11;
    if(age<1.08)return 4+Math.min(2,Math.floor((age-.48)/.2));
    if(age<1.68)return age<1.48?7:8;
    return 6;
  }
  function pose(index){const [x,y,w,h]=frames[index],scale=index===11?68/h:68/430,anchor=(index%4)*314+165;return{source:[x,y,w,h],x:(x-anchor)*scale,y:-h*scale,width:w*scale,height:h*scale};}
  return{frames,frame,pose};
});
