const WORLD_ARRAY_RE = /const\s+(missions|world(\d+)Missions)\s*=\s*\[([\s\S]*?)\n\];/g;
const OBJECT_RE = /\{id:(\d+),[\s\S]*?title:(?:"([^"]*)"|'([^']*)')[\s\S]*?objective:(?:"([^"]*)"|'([^']*)')[\s\S]*?reward:(\d+)(?:,[\s\S]*?(?:target:(?:"([a-h][1-8])"|'([a-h][1-8])')|move:\{from:(?:"([a-h][1-8])"|'([a-h][1-8])'),to:(?:"([a-h][1-8])"|'([a-h][1-8])')\}))?[\s\S]*?\}/g;

function clean(s=''){return s.replace(/<[^>]+>/g,'').replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));}
export function auditLegacyMissionSource(source){
  const missions=[]; let match;
  while((match=WORLD_ARRAY_RE.exec(source))){
    const world=match[1]==='missions'?1:Number(match[2]); const body=match[3]; let o;
    OBJECT_RE.lastIndex=0;
    while((o=OBJECT_RE.exec(body))){
      const id=Number(o[1]); const title=clean(o[2]??o[3]??''); const objective=clean(o[4]??o[5]??''); const reward=Number(o[6]);
      const target=o[7]??o[8]??null; const from=o[9]??o[10]??null; const to=o[11]??o[12]??null;
      missions.push({legacyId:`world${world}-${id}`,world,order:id,title,objective,rewardXp:reward,target,move:from&&to?{from,to}:null});
    }
  }
  const issues=[]; const ids=new Set();
  for(const m of missions){
    if(ids.has(m.legacyId)) issues.push({severity:'error',code:'duplicate-id',mission:m.legacyId}); ids.add(m.legacyId);
    if(!Number.isInteger(m.rewardXp)||m.rewardXp<=0) issues.push({severity:'error',code:'invalid-reward',mission:m.legacyId});
    if(m.target && !/^[a-h][1-8]$/.test(m.target)) issues.push({severity:'error',code:'invalid-square',mission:m.legacyId});
    if(m.world>=4 && m.target) issues.push({severity:'warning',code:'semantic-target-only',mission:m.legacyId,detail:'Advanced pedagogical claim is currently validated by clicking a named square, without an authoritative chess position.'});
  }
  const expectedWorlds=Array.from({length:12},(_,i)=>i+1); const present=new Set(missions.map(m=>m.world));
  for(const w of expectedWorlds) if(!present.has(w)) issues.push({severity:'error',code:'missing-world',world:w});
  const counts=Object.fromEntries(expectedWorlds.map(w=>[w,missions.filter(m=>m.world===w).length]));
  return {missions,issues,summary:{total:missions.length,worlds:present.size,counts,errors:issues.filter(i=>i.severity==='error').length,warnings:issues.filter(i=>i.severity==='warning').length}};
}
export function certificationRecommendation(mission){
  if(mission.move) return {status:'draft',reason:'requires chess-semantic review before certification'};
  if(mission.world<=2) return {status:'draft',reason:'interaction lesson requires server interaction validator'};
  return {status:'quarantined',reason:'advanced lesson has no authoritative chess position/evidence yet'};
}
