export function rankingMass(state) {
 const saved=Number.isFinite(state.rankingBestMass)&&state.rankingBestMass>=0?state.rankingBestMass:0;
 return state.cheatUsed?saved:Math.max(saved,state.mass||0);
}
