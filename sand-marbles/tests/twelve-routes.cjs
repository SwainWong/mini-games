// Reviewed level-12 routes, listed from a bead pocket down to its cart.
// Replay digs in reverse so the outlet is open before releasing the beads.
exports.initial = open => [
  [[210,455],[210,485],[145,510],[104,575]],
  open ? [[205,265],[205,295],[260,315],[260,380],[280,470],[280,575]]
    : [[205,265],[205,295],[350,330],[350,430],[280,510],[280,575]],
  [[475,455],[475,490],[456,575]],
  open ? [[345,105],[345,140],[445,205],[445,300],[456,420],[456,575]]
    : [[345,105],[345,140],[510,220],[510,425],[456,575]]
];
exports.order = [3,1,0,2];
exports.recovery = (world, open) => {
  const paths=[];
  for (const label of ['jade','blue-high','amber','blue-low']) {
    const color=label.split('-')[0];
    const balls=world.balls.filter(b => b.active && !b.held && b.color===color &&
      (color!=='blue' || (label==='blue-low' ? b.y>=400 : b.y<400)));
    if (!balls.length) continue;
    const x=balls.reduce((s,b)=>s+b.x,0)/balls.length, y=Math.max(...balls.map(b=>b.y));
    const home={amber:104,jade:280,blue:456}[color], path=[[x,y]];
    const bag=color==='jade' ? world.treasures[0] : color==='blue' ? world.treasures[1] : null;
    if (open && bag && !bag.opened && y<bag.y) path.push([bag.x,Math.max(y+20,bag.y-60)],[bag.x,bag.y]);
    path.push([home,Math.min(550,Math.max(y+80,path.at(-1)[1]+80))],[home,575]);
    paths.push(path);
    for (const b of balls) paths.push([[b.x,b.y],[x,y]]);
  }
  return paths;
};
