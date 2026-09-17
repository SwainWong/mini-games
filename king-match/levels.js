(function(root){
  const W=432,H=780,CELL=48,BOARD_X=24,BOARD_Y=398,COLS=8,ROWS=7;
  const board=()=>Array.from({length:COLS*ROWS},(_,i)=>(Math.floor(i/COLS)+Math.floor(i%COLS/2))%3);
  const first=board(),second=board();
  // A permanent sloping beam occupies the three right cells of row four.
  second[29]=second[30]=second[31]=-1;
  second[27]=second[28]=2;second[26]=1; // pair immediately to the left of the beam
  const levels=[
    {name:'王室金库',subtitle:'先开出口，再疏通落石',chapter:'THE GOLDEN VAULT',theme:'gold',total:120,target:100,moves:10,seed:1709,board:first,solution:[54,46,38,30,22,14,6],description:'金矿堵住了王室地窖。消除相邻的同色砖，让落石从底部排走，替国王卸下重担。',lesson:'从右下方开始，向上连成一条通道。',beam:false},
    {name:'水晶密室',subtitle:'绕过石梁，接通另一条路',chapter:'THE EMERALD CHAMBER',theme:'emerald',total:150,target:125,moves:12,seed:2718,board:second,solution:[52,44,36,28,20,22,14,6],description:'古老石梁挡住了直路。先打开下方出口，再从石梁左边绕行，让水晶顺着斜面滑落。',lesson:'灰色石梁不能消除。沿它的左边，接通上下通道。',beam:true}
  ];
  const api={W,H,CELL,BOARD_X,BOARD_Y,COLS,ROWS,levels};
  if(typeof module!=='undefined')module.exports=api;else root.KingLevels=api;
})(typeof globalThis!=='undefined'?globalThis:this);
