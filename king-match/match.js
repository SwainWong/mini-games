(function(root){
'use strict';
const COLS=8,ROWS=7;
function matches(board){
 const hit=new Set();
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const i=r*COLS+c,v=board[i];if(v==null||v<0)continue;
  if(c===0||board[i-1]!==v){let n=1;while(c+n<COLS&&board[i+n]===v)n++;if(n>=3)for(let j=0;j<n;j++)hit.add(i+j);}
  if(r===0||board[i-COLS]!==v){let n=1;while(r+n<ROWS&&board[i+n*COLS]===v)n++;if(n>=3)for(let j=0;j<n;j++)hit.add(i+j*COLS);}
 }
 return [...hit];
}
function preview(board,a,b){
 const adjacent=Math.abs(a%COLS-b%COLS)+Math.abs(Math.floor(a/COLS)-Math.floor(b/COLS))===1;
 if(a<0||b<0||a>=board.length||b>=board.length||!adjacent||board[a]==null||board[b]==null||board[a]<0||board[b]<0||board[a]===board[b])return null;
 const after=[...board];[after[a],after[b]]=[after[b],after[a]];const cells=matches(after);
 if(!cells.includes(a)&&!cells.includes(b))return null;
 return {a,b,after,cells};
}
function legal(board){const moves=[];for(let i=0;i<board.length;i++)for(const j of [i%COLS<7?i+1:-1,i+COLS]){const m=preview(board,i,j);if(m)moves.push(m);}return moves;}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function paint(mask,seed,colors=4){
 const rnd=rng(seed);
 for(let tries=0;tries<100;tries++){
  const b=[];for(let i=0;i<mask.length;i++){
   if(mask[i]===null||mask[i]===-1){b.push(mask[i]);continue;}
   const offset=Math.floor(rnd()*colors),choices=Array.from({length:colors},(_,v)=>(v+offset)%colors);
   b.push(choices.find(v=>!(i%8>=2&&b[i-1]===v&&b[i-2]===v)&&!(i>=16&&b[i-8]===v&&b[i-16]===v)));
  }
  if(legal(b).length>=3)return b;
 }return null;
}
function gravity(board){
 const result=Array(board.length).fill(null),moves=[];
 for(let c=0;c<COLS;c++){let to=(ROWS-1)*COLS+c;
  for(let r=ROWS-1;r>=0;r--){const from=r*COLS+c,v=board[from];
   if(v===-1){result[from]=-1;to=from-COLS;}
   else if(v!=null){result[to]=v;if(from!==to)moves.push({from,to,color:v});to-=COLS;}
  }
 }return {board:result,moves};
}
function resolve(board,a,b){
 const m=preview(board,a,b);if(!m)return null;
 let result=m.after,hit=m.cells,cleared=0,cascades=0;
 while(hit.length){for(const i of hit)result[i]=null;cleared+=hit.length;cascades++;result=gravity(result).board;hit=matches(result);}
 return {board:result,cleared,cascades};
}
// Estimated number of still-solid cells on a downward route to the outlet.
function routeCost(board){
 const d=Array(56).fill(Infinity),todo=[];for(const i of [5,6,7]){d[i]=board[i]==null?0:1;todo.push(i);}
 while(todo.length){todo.sort((a,b)=>d[b]-d[a]);const i=todo.pop();const r=Math.floor(i/8),c=i%8;for(const j of [c?i-1:-1,c<7?i+1:-1,r<6?i+8:-1]){if(j<0||board[j]===-1)continue;const cost=d[i]+(board[j]==null?0:1);if(cost<d[j]){d[j]=cost;todo.push(j);}}}
 return Math.min(...d.slice(48));
}
function plan(board,maxDepth=8,width=100){
 const intake=board.includes(-1)?[5,6,7,13,14,15,21,22,23]:[6,7];
 let frontier=[{board,path:[],score:0}];const seen=new Set();
 for(let depth=0;depth<maxDepth;depth++){
  const next=[];for(const state of frontier)for(const m of legal(state.board)){
   const b=resolve(state.board,m.a,m.b).board;const path=[...state.path,[m.a,m.b]],cost=routeCost(b);
   // Clear the inlet chamber as well as a continuous outlet path to unload the shield.
   if(cost===0&&intake.every(i=>b[i]===null))return {board:b,path};
   const key=b.map(v=>v==null?'.':v).join('');if(seen.has(key))continue;seen.add(key);
   const useful=b.reduce((n,v,i)=>n+(v==null&&i%8>=4?1:0),0);next.push({board:b,path,score:-cost*20+useful+intake.filter(i=>b[i]===null).length*3});
  }next.sort((a,b)=>b.score-a.score);frontier=next.slice(0,width);if(!frontier.length)break;
 }
 return null;
}
const api={matches,preview,legal,paint,rng,gravity,resolve,routeCost,plan};if(typeof module!=='undefined')module.exports=api;else root.KingMatch=api;
})(globalThis);
