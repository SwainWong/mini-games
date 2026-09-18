/* Audio is synthesized locally and only unlocked by the sound button gesture. */
(() => {
  class SandAudio {
    constructor(){this.enabled=false;this.context=null;this.voices=new Set();this.last={};this.played=0;}
    async toggle(){
      if(this.enabled){this.enabled=false;for(const o of this.voices){try{o.stop();}catch(_){}}this.voices.clear();return false;}
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)throw new Error('这个浏览器暂不支持音效');
      this.context ||= new AudioContext();await this.context.resume();this.enabled=true;this.play('on');return true;
    }
    voice(frequency,duration,volume=.04,delay=0,type='sine'){
      if(!this.enabled||this.context.state!=='running')return;
      const c=this.context,start=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
      o.type=type;o.frequency.setValueAtTime(frequency,start);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(volume,start+.006);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(c.destination);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};o.start(start);o.stop(start+duration+.01);this.played++;
    }
    noise(duration,frequency,volume){
      if(!this.enabled||this.context.state!=='running')return;
      const c=this.context,n=Math.floor(c.sampleRate*duration),buffer=c.createBuffer(1,n,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);
      const s=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();s.buffer=buffer;filter.type='lowpass';filter.frequency.value=frequency;gain.gain.value=volume;s.connect(filter);filter.connect(gain);gain.connect(c.destination);this.voices.add(s);s.onended=()=>{this.voices.delete(s);s.disconnect();filter.disconnect();gain.disconnect();};s.start();this.played++;
    }
    play(event,amount=0){
      if(!this.enabled)return;const now=this.context.currentTime,interval={dig:.08,hit:.09,collect:.04,worm:.8,'rival-dig':.32,danger:.75}[event]||0;
      if(now-(this.last[event]??-100)<interval)return;this.last[event]=now;
      if(event==='dig'){this.noise(.12,1400,.035);this.noise(.045,4200,.012);}
      else if(event==='hit')this.voice(550+Math.min(amount,180),.055,.013);
      else if(event==='collect'){this.voice(520+(amount%8)*65,.18,.05);this.voice(1040+(amount%8)*130,.08,.012);}
      else if(event==='won')[523,659,784,1047].forEach((f,i)=>this.voice(f,.32,.05,i*.12));
      else if(event==='lost'){this.voice(260,.2,.04);this.voice(195,.28,.035,.16);}
      else if(event==='cart-bump'){this.noise(.1,900,.035);this.voice(110,.1,.025,0,'triangle');}
      else if(event==='stow')this.noise(.13,650,.022);
      else if(event==='bag-torn')this.noise(.23,1900,.033);
      else if(event==='spill')this.voice(850,.12,.025);
      else if(event==='shuffle')this.noise(.12,700,.025);
      else if(event==='rest'){this.voice(140,.16,.022,0,'triangle');this.voice(115,.22,.018,.17,'triangle');}
      else if(event==='rival-dig')this.noise(.07,1300,.018);
      else if(event==='danger'){this.voice(210,.07,.025,0,'triangle');this.voice(240,.07,.02,.13,'triangle');}
      else if(event==='treasure'){[660,880,1320].forEach((f,i)=>this.voice(f,.2,.04,i*.06));}
      else if(event==='ignite')this.noise(.35,4200,.022);
      else if(event==='magic-warning'){this.voice(440,.1,.025);this.voice(660,.13,.025,.13);}
      else if(event==='magic-refilled')this.noise(.35,900,.025);
      else if(event==='blast'||event==='magic-blast'||event==='cart-broken'){this.noise(.4,450,.08);this.voice(65,.3,.06,0,'triangle');}
      else if(event==='stun'){this.voice(450,.18,.035);this.voice(620,.22,.025,.12);}
      else if(event==='loss')this.voice(180,.08,.016);
      else if(event==='listen')this.voice(900,.08,.02);
      else if(event==='worm')this.noise(.12,450,.022);
      else this.voice(660,.14,.035);
    }
  }
  window.SandAudio=SandAudio;
})();
