(function(root){
const W=432,H=780,CELL=48,BOARD_X=24,BOARD_Y=398,COLS=8,ROWS=7,SPIKE_X=78,BODY_WIDTH=148;
const levels=[{"name":"王室金库","subtitle":"交换三消，抵住落石","chapter":"THE GOLDEN VAULT","theme":"gold","initial":78,"target":260,"rate":80,"seed":111,"board":[1,3,1,2,3,3,0,3,1,1,0,2,2,0,0,1,2,1,0,3,1,0,1,1,1,2,1,2,3,2,0,2,1,3,3,0,1,1,2,0,2,3,1,2,0,1,3,1,3,1,1,3,2,2,3,0],"beam":false,"shieldStart":292,"par":5,"lesson":"交换相邻宝石，横竖三连；先找能接通出口的消除。"},{"name":"水晶密室","subtitle":"绕开石梁，化解挤压","chapter":"THE EMERALD CHAMBER","theme":"emerald","initial":90,"target":320,"rate":85,"seed":219,"board":[3,3,0,0,3,2,0,3,3,1,3,1,2,1,3,0,0,0,1,1,3,2,3,0,2,1,2,3,3,-1,-1,-1,1,3,3,0,2,1,3,2,1,2,2,1,0,3,0,2,2,0,3,2,3,1,3,0],"beam":true,"shieldStart":292,"par":6,"lesson":"石梁挡住右侧直路，消除它左侧的宝石来绕行。"}];
const api={W,H,CELL,BOARD_X,BOARD_Y,COLS,ROWS,SPIKE_X,BODY_WIDTH,levels};if(typeof module!=="undefined")module.exports=api;else root.KingLevels=api;
})(globalThis);
