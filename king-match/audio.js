(function(root){
class Audio{
 constructor(){this.enabled=false;this.context=null;this.last=0;}
 toggle(){this.enabled=!this.enabled;if(this.enabled){this.context??=new(window.AudioContext||window.webkitAudioContext)();this.context.resume();this.play('clear');}return this.enabled;}
 play(type){if(!this.enabled||!this.context)return;const ctx=this.context;if(ctx.state==='suspended')ctx.resume();const now=ctx.currentTime;if(type==='drain'&&now-this.last<.1)return;this.last=now;const notes=type==='win'?[523,659,784,1046]:type==='lose'?[220,175]:type==='drain'?[240]:[660,880];notes.forEach((frequency,i)=>{const o=ctx.createOscillator(),a=ctx.createGain(),start=now+i*.07;o.type=type==='drain'?'triangle':'sine';o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(frequency*.75,start+.17);a.gain.setValueAtTime(0,start);a.gain.linearRampToValueAtTime(.035,start+.005);a.gain.exponentialRampToValueAtTime(.0001,start+.2);o.connect(a).connect(ctx.destination);o.start(start);o.stop(start+.22);});}
}
root.KingAudio=Audio;
})(globalThis);
