(function(root,factory){const C=factory();if(typeof module==='object')module.exports=C;else root.SandCodex=C;})(globalThis,()=>{
 const entries={
 score:{name:'矿场的目标',icon:'◆',text:'同色珠子入车 +10 分，目标分是过关门槛，达标后继续冲高分！时间耗尽或珠子全部结算时，最终分数达到门槛才通关。接错、漏接或被偷只失去这颗珠子的机会，不扣已经得到的分数。已有分数加剩余最高可得仍不够门槛时，提前结束。图鉴和后台暂停不扣时间。通关后按挖沙量评 1—3 星。'},
 rock:{name:'松动的岩石',icon:'⬟',text:'挖空石头下方，岩石先摇晃约半秒，再掉落。可以砸晕盗宝人 4 秒、清除虫子；也会砸坏矿车！看清落点再动手，损坏的矿车不会接珠，并留在轨道上。'},
 rival:{name:'盗宝人',icon:'⚑',text:'他先伸手抓珠子，再抱起、转身装袋；伸手时珠子仍可滚走，眩晕会让手里的珠子掉下。袋子越满越沉，走得更慢、耗体力更多。超过6颗后，每累计移动1秒有5%概率破袋；破了会边走边漏珠子，接回来仍能得分。他也会累：体力低时擦汗、喝水、休息。听到快速接近的珠子，他会侧耳确认再冲刺。抓住他休息或眩晕的时机！'},
 porter:{name:'推车队友',icon:'♟',text:'队友推着真正的目标矿车走走停停，会擦汗、思考、折返。瞄准移动中的车斗，不要瞄准它原来的位置。可以留一层沙，等矿车停稳再放珠。'},
 heavy:{name:'重力珠',icon:'⊕',text:'更沉、更大、下落更快。转弯和窄道需要多留一点空间；同色入车仍是 +10 分。'},
 worm:{name:'钻沙虫',icon:'〰',text:'虫子会不断挖开侧壁，形成新的岔路。它挖掉的沙不计入你的沙量；落石和爆炸都可以清除虫子。'},
 bag:{name:'问号宝袋',icon:'?',text:'让珠子撞开问号袋，立即 +20 分，珠子还能继续入车得分。每袋只能领一次。空挖或爆炸不能代领宝藏。'},
 rubber:{name:'弹力珠',icon:'◎',text:'碰壁回弹更强，弯道留出缓冲。认准珠子上的斜纹，分值仍为 +10。'},
 bomb:{name:'引线炸药',icon:'✹',text:'珠子碰到上游的金色压力盘才会点火。沿引线燃烧约1.8秒后，炸开下方挡路的岩石，开出近路或宝袋通道。虚线圈是范围：炸碎石头、晕人、除虫，也可能炸坏矿车。珠子只被推开，不被炸掉。不使用炸药也能通关。'},
 multi:{name:'单轨车队',icon:'⇆',text:'多名队友各推一辆车，但只有一条轨道。矿车不会穿过彼此或交换顺序；撞到邻车时，有人的车可以缓慢推着无人车一起走；缓冲器接触时会碰响。迎面推挤、残骸或落石挡住时会等候、转向。预留接珠的位置和时机。'},
 light:{name:'轻盈珠',icon:'◇',text:'带菱形纹路，落得较慢，容易被岔路和移动的车斗影响。它与其他珠子一样，同色入车 +10 分。'},
 chest:{name:'矿藏宝箱',icon:'▣',text:'珠子撞开宝箱 +30 分。先取宝藏再接珠，一颗珠子可以得到两笔分数；箱子只开一次。'}
 };
 function forLevel(l){const ids=['score'];if(l.rocks.length)ids.push('rock');if(l.mechanics.rival)ids.push('rival');if(l.mechanics.crewCount)ids.push('porter');if(l.mechanics.crewCount>1)ids.push('multi');if(l.mechanics.worms?.length)ids.push('worm');const types=new Set(l.groups.flatMap(g=>g.types||[g.type||'glass']));for(const t of ['heavy','rubber','light'])if(types.has(t))ids.push(t);if(l.treasures?.some(t=>t.kind==='bag'))ids.push('bag');if(l.treasures?.some(t=>t.kind==='chest'))ids.push('chest');if(l.bombs?.length)ids.push('bomb');return ids;}
 return{entries,forLevel};
});
