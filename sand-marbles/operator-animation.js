(function(root){
  'use strict';
  // A single source frame per draw. Never blend two silhouettes.
  class OperatorAnimation {
    constructor(){this.reset();}
    reset(){this.time=null;this.wheelAngle=0;this.frame=5;this.turn=5;this.credit=0;this.jar=null;this.pending=null;this.gesture=null;}
    update(o,time){
      if(this.time!==null&&time<this.time)this.reset();
      const dt=this.time===null?0:Math.max(0,Math.min(.1,time-this.time));this.time=time;
      if(!o||o.phase!=='control'){this.gesture=null;this.pending=null;this.jar=null;this.turn=5;this.frame=5;this.credit=0;return this.frame;}
      if(o.activeJar!==this.jar){
        this.jar=o.activeJar;
        this.pending=o.activeJar===null?null:(o.pointDirection<0?12:18);
      }
      // Return the hands to neutral before letting one hand leave the wheel.
      const target=this.pending!==null||this.gesture?5:Math.round(5+Math.max(-1,Math.min(1,o.steering||0))*5);
      const desiredAngle=(5-target)*.14;this.wheelAngle+=Math.max(-dt*2.2,Math.min(dt*2.2,desiredAngle-this.wheelAngle));
      this.credit=Math.min(1,this.credit+dt*16);
      if(this.turn!==target&&this.credit>=1){this.turn+=Math.sign(target-this.turn);this.credit-=1;}
      if(this.pending!==null&&this.turn===5&&!this.gesture){this.gesture={base:this.pending,age:0};this.pending=null;}
      if(this.gesture){
        this.gesture.age+=dt;
        // Raise, extend, hold, retract, and regrip. Holding a pose is not blending.
        const sequence=[0,1,2,3,4,4,3,2,5,1,0],i=Math.floor(this.gesture.age/.085);
        if(i<sequence.length)this.frame=this.gesture.base+sequence[i];
        else{this.gesture=null;this.frame=5;this.credit=0;}
      }else this.frame=this.turn;
      return this.frame;
    }
  }
  if(typeof module==='object'&&module.exports)module.exports=OperatorAnimation;
  else root.SandOperatorAnimation=OperatorAnimation;
})(typeof globalThis!=='undefined'?globalThis:this);
