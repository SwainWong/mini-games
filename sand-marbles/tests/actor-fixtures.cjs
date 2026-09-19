// Engine-only fixtures. Actor behavior tests must not depend on the tutorial debut level.
const levels=require('../levels.js');
exports.rivalField=()=>{const l=structuredClone(levels[1]);l.mechanics.rival={speed:30};return l;};
exports.movingCartField=()=>{const l=structuredClone(levels[2]);Object.assign(l.mechanics,{porter:true,crewCount:1});return l;};
