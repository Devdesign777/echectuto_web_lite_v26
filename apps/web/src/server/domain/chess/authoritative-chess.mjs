import { createHash } from 'node:crypto';

const PIECES = {
  '♔': ['white','king'], '♕': ['white','queen'], '♖': ['white','rook'], '♗': ['white','bishop'], '♘': ['white','knight'], '♙': ['white','pawn'],
  '♚': ['black','king'], '♛': ['black','queen'], '♜': ['black','rook'], '♝': ['black','bishop'], '♞': ['black','knight'], '♟': ['black','pawn'],
};
const FILES='abcdefgh';
export function isSquare(s){ return typeof s==='string' && /^[a-h][1-8]$/.test(s); }
export function normalizePosition(position){
  if(!position || typeof position!=='object' || Array.isArray(position)) throw new Error('invalid position');
  const out={};
  for(const [sq,piece] of Object.entries(position)){
    if(!isSquare(sq) || !PIECES[piece]) throw new Error('invalid position entry');
    out[sq]=piece;
  }
  return Object.fromEntries(Object.entries(out).sort(([a],[b])=>a.localeCompare(b)));
}
export function positionFingerprint(position){
  return createHash('sha256').update(JSON.stringify(normalizePosition(position))).digest('hex');
}
function coords(s){return [FILES.indexOf(s[0]), Number(s[1])-1];}
function square(x,y){return x>=0&&x<8&&y>=0&&y<8 ? `${FILES[x]}${y+1}` : null;}
function rayClear(position, from, to){
  const [fx,fy]=coords(from),[tx,ty]=coords(to); const sx=Math.sign(tx-fx),sy=Math.sign(ty-fy);
  let x=fx+sx,y=fy+sy; while(x!==tx||y!==ty){ if(position[square(x,y)]) return false; x+=sx;y+=sy; } return true;
}
function pseudoLegal(position, move, side){
  const {from,to,promotion}=move||{}; if(!isSquare(from)||!isSquare(to)||from===to) return false;
  const piece=position[from]; if(!piece) return false; const [color,type]=PIECES[piece]; if(color!==side) return false;
  const target=position[to]; if(target && PIECES[target][0]===color) return false;
  const [fx,fy]=coords(from),[tx,ty]=coords(to), dx=tx-fx,dy=ty-fy, ax=Math.abs(dx),ay=Math.abs(dy);
  if(type==='king'){
    if(ax<=1&&ay<=1) return true;
    if(dy===0&&ax===2){
      const homeRank=color==='white'?0:7; if(fy!==homeRank||fx!==4) return false;
      const rookFrom=dx>0?square(7,homeRank):square(0,homeRank); const rookPiece=color==='white'?'♖':'♜';
      if(position[rookFrom]!==rookPiece) return false;
      const step=Math.sign(dx); for(let x=fx+step;x!==(dx>0?7:0);x+=step) if(position[square(x,homeRank)]) return false;
      return true;
    }
    return false;
  }
  if(type==='knight') return (ax===1&&ay===2)||(ax===2&&ay===1);
  if(type==='rook') return (dx===0||dy===0)&&rayClear(position,from,to);
  if(type==='bishop') return ax===ay&&rayClear(position,from,to);
  if(type==='queen') return (dx===0||dy===0||ax===ay)&&rayClear(position,from,to);
  if(type==='pawn'){
    const dir=color==='white'?1:-1, start=color==='white'?1:6, last=color==='white'?7:0;
    let ok=false;
    if(dx===0&&dy===dir&&!target) ok=true;
    if(dx===0&&fy===start&&dy===2*dir&&!target&&!position[square(fx,fy+dir)]) ok=true;
    if(ax===1&&dy===dir&&target&&PIECES[target][0]!==color) ok=true;
    if(!ok) return false;
    if(ty===last) return ['queen','rook','bishop','knight'].includes(promotion);
    return promotion==null;
  }
  return false;
}
export function applyMove(position, move){
  const next={...normalizePosition(position)}; const piece=next[move.from]; delete next[move.from]; next[move.to]=piece;
  if(piece && PIECES[piece][1]==='king'){ const [fx,fy]=coords(move.from),[tx]=coords(move.to); if(Math.abs(tx-fx)===2){ const rookFrom=tx>fx?square(7,fy):square(0,fy), rookTo=tx>fx?square(5,fy):square(3,fy); next[rookTo]=next[rookFrom]; delete next[rookFrom]; } }
  if(move.promotion){ const color=PIECES[piece][0]; const map={queen:['♕','♛'],rook:['♖','♜'],bishop:['♗','♝'],knight:['♘','♞']}; next[move.to]=map[move.promotion][color==='white'?0:1]; }
  return normalizePosition(next);
}
export function isSquareAttacked(position, target, attacker){
  for(const [from,piece] of Object.entries(position)){
    if(PIECES[piece][0]!==attacker) continue;
    const type=PIECES[piece][1]; const [fx,fy]=coords(from),[tx,ty]=coords(target),dx=tx-fx,dy=ty-fy,ax=Math.abs(dx),ay=Math.abs(dy);
    if(type==='pawn' && ax===1 && dy===(attacker==='white'?1:-1)) return true;
    if(type!=='pawn' && pseudoLegal(position,{from,to:target},attacker)) return true;
  } return false;
}
export function isInCheck(position, side){
  const p=normalizePosition(position); const kingPiece=side==='white'?'♔':'♚'; const king=Object.keys(p).find(s=>p[s]===kingPiece);
  if(!king) return false; return isSquareAttacked(p,king,side==='white'?'black':'white');
}
export function legalMoves(position, side){
  const p=normalizePosition(position), out=[];
  for(const [from,piece] of Object.entries(p)){
    if(PIECES[piece][0]!==side) continue;
    for(const f of FILES) for(let r=1;r<=8;r++){
      const to=`${f}${r}`; if(from===to) continue;
      const base={from,to};
      if(PIECES[piece][1]==='pawn' && (r===1||r===8)){ for(const promotion of ['queen','rook','bishop','knight']) if(isLegalMove(p,{...base,promotion},side)) out.push({...base,promotion}); }
      else if(isLegalMove(p,base,side)) out.push(base);
    }
  }
  return out;
}
export function isCheckmate(position, side){ return isInCheck(position,side) && legalMoves(position,side).length===0; }
export function isLegalMove(position, move, side){
  const p=normalizePosition(position); if(!['white','black'].includes(side)||!pseudoLegal(p,move,side)) return false;
  const piece=p[move.from];
  if(piece && PIECES[piece][1]==='king'){ const [fx,fy]=coords(move.from),[tx]=coords(move.to); if(Math.abs(tx-fx)===2){
    if(isInCheck(p,side)) return false; const step=Math.sign(tx-fx); const transit=square(fx+step,fy); if(isSquareAttacked(p,transit,side==='white'?'black':'white')) return false;
  }}
  const next=applyMove(p,move); const kingPiece=side==='white'?'♔':'♚'; const king=Object.keys(next).find(s=>next[s]===kingPiece);
  if(!king) return false; return !isSquareAttacked(next,king,side==='white'?'black':'white');
}
export function validateMissionEvidence({mission, evidence}){
  if(!mission?.id || !mission.position || !mission.expectedMove) throw new Error('invalid mission definition');
  if(!evidence || evidence.missionId!==mission.id) return {passed:false,reason:'mission_mismatch'};
  if(evidence.positionFingerprint!==positionFingerprint(mission.position)) return {passed:false,reason:'position_mismatch'};
  const move=evidence.move; if(!isLegalMove(mission.position,move,mission.sideToMove)) return {passed:false,reason:'illegal_move'};
  const e=mission.expectedMove;
  if(move.from!==e.from||move.to!==e.to||(move.promotion??null)!==(e.promotion??null)) return {passed:false,reason:'objective_not_met'};
  const finalPosition=applyMove(mission.position,move);
  const objective=mission.objective ?? 'exact_move'; const opponent=mission.sideToMove==='white'?'black':'white';
  if(objective==='escape_check' && isInCheck(finalPosition,mission.sideToMove)) return {passed:false,reason:'king_still_in_check'};
  if(objective==='give_check' && !isInCheck(finalPosition,opponent)) return {passed:false,reason:'check_not_delivered'};
  if(objective==='mate_in_one' && !isCheckmate(finalPosition,opponent)) return {passed:false,reason:'mate_not_delivered'};
  if(objective==='occupy_center' && !['d4','e4','d5','e5'].includes(move.to)) return {passed:false,reason:'center_not_occupied'};
  if(objective==='develop_minor'){ const moved=mission.position[move.from]; if(!moved || !['knight','bishop'].includes(PIECES[moved][1])) return {passed:false,reason:'minor_piece_not_developed'}; }
  if(objective==='castle_kingside'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='king' || move.from!==(mission.sideToMove==='white'?'e1':'e8') || move.to!==(mission.sideToMove==='white'?'g1':'g8')) return {passed:false,reason:'kingside_castle_not_completed'}; }
  if(objective==='complete_development'){ const developed=['c3','f3','c4','f4','b5','g5','e2','d2']; const minors=Object.entries(finalPosition).filter(([sq,p])=>PIECES[p]?.[0]===mission.sideToMove && ['knight','bishop'].includes(PIECES[p][1]) && developed.includes(sq)); if(minors.length<3) return {passed:false,reason:'development_incomplete'}; }
  if(objective==='pawn_structure_break'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='pawn' || !['d5','e5','c5','f5','d4','e4'].includes(move.to)) return {passed:false,reason:'structural_break_not_found'}; }
  if(objective==='create_outpost'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='knight') return {passed:false,reason:'outpost_piece_invalid'}; const [x,y]=coords(move.to), dir=mission.sideToMove==='white'?-1:1; const friendlyPawn=mission.sideToMove==='white'?'♙':'♟'; const supports=[square(x-1,y+dir),square(x+1,y+dir)].filter(Boolean).some(s=>finalPosition[s]===friendlyPawn); if(!supports) return {passed:false,reason:'outpost_not_supported'}; const enemyPawn=mission.sideToMove==='white'?'♟':'♙'; const enemyDir=mission.sideToMove==='white'?1:-1; const challengers=[square(x-1,y+enemyDir),square(x+1,y+enemyDir)].filter(Boolean).some(s=>finalPosition[s]===enemyPawn); if(challengers) return {passed:false,reason:'outpost_can_be_chased'}; }
  if(objective==='occupy_open_file'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='rook') return {passed:false,reason:'rook_required'}; const file=move.to[0]; const pawns=Object.entries(finalPosition).filter(([sq,p])=>sq[0]===file && PIECES[p]?.[1]==='pawn'); if(pawns.length) return {passed:false,reason:'file_not_open'}; }
  if(objective==='gain_space'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='pawn') return {passed:false,reason:'space_pawn_required'}; const [,fromRank]=coords(move.from),[,toRank]=coords(move.to); if(mission.sideToMove==='white' ? toRank<=fromRank : toRank>=fromRank) return {passed:false,reason:'space_not_gained'}; }
  if(objective==='improve_worst_piece'){ const moved=mission.position[move.from]; if(!moved || !['knight','bishop','rook'].includes(PIECES[moved][1])) return {passed:false,reason:'inactive_piece_not_improved'}; const [fx,fy]=coords(move.from),[tx,ty]=coords(move.to); const homeRank=mission.sideToMove==='white'?0:7; if(fy!==homeRank || ty===homeRank) return {passed:false,reason:'piece_not_activated'}; }
  if(objective==='strategic_pawn_break'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='pawn') return {passed:false,reason:'pawn_break_required'}; const centralFiles=['c','d','e','f']; if(!centralFiles.includes(move.to[0])) return {passed:false,reason:'strategic_break_not_central'}; }
  if(objective==='activate_king_endgame'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='king') return {passed:false,reason:'king_activation_required'}; const [fx,fy]=coords(move.from),[tx,ty]=coords(move.to); const centerDistance=([x,y])=>Math.abs(x-3.5)+Math.abs(y-3.5); if(centerDistance([tx,ty])>=centerDistance([fx,fy])) return {passed:false,reason:'king_not_activated'}; }
  if(objective==='create_passed_pawn'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='pawn') return {passed:false,reason:'pawn_required'}; const [x,y]=coords(move.to); const enemyPawn=mission.sideToMove==='white'?'♟':'♙'; const forward=mission.sideToMove==='white'?1:-1; for(const [sq,p] of Object.entries(finalPosition)){ if(p!==enemyPawn) continue; const [px,py]=coords(sq); if(Math.abs(px-x)<=1 && (py-y)*forward>0) return {passed:false,reason:'pawn_not_passed'}; } }
  if(objective==='enter_pawn_square'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='king') return {passed:false,reason:'king_required'}; const enemyPawnEntry=Object.entries(finalPosition).find(([,p])=>p===(mission.sideToMove==='white'?'♟':'♙')); if(!enemyPawnEntry) return {passed:false,reason:'enemy_pawn_missing'}; const [pawnSq,pawnPiece]=enemyPawnEntry,[kx,ky]=coords(move.to),[px,py]=coords(pawnSq); const promotionY=PIECES[pawnPiece][0]==='white'?7:0; const movesToPromote=Math.abs(promotionY-py); if(Math.max(Math.abs(kx-px),Math.abs(ky-promotionY))>movesToPromote) return {passed:false,reason:'king_outside_pawn_square'}; }
  if(objective==='take_opposition'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='king') return {passed:false,reason:'king_required'}; const enemyKing=Object.entries(finalPosition).find(([,p])=>p===(mission.sideToMove==='white'?'♚':'♔'))?.[0]; if(!enemyKing) return {passed:false,reason:'enemy_king_missing'}; const [x1,y1]=coords(move.to),[x2,y2]=coords(enemyKing); const direct=(x1===x2&&Math.abs(y1-y2)===2)||(y1===y2&&Math.abs(x1-x2)===2); if(!direct) return {passed:false,reason:'opposition_not_taken'}; }
  if(objective==='rook_behind_passed_pawn'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='rook') return {passed:false,reason:'rook_required'}; const friendlyPawn=Object.entries(finalPosition).find(([,p])=>p===(mission.sideToMove==='white'?'♙':'♟')); if(!friendlyPawn) return {passed:false,reason:'passed_pawn_missing'}; const [pawnSq]=friendlyPawn; if(move.to[0]!==pawnSq[0]) return {passed:false,reason:'rook_not_on_pawn_file'}; const [,ry]=coords(move.to),[,py]=coords(pawnSq); if(mission.sideToMove==='white'?ry>=py:ry<=py) return {passed:false,reason:'rook_not_behind_pawn'}; }
  if(objective==='safe_promotion_progress'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='pawn') return {passed:false,reason:'pawn_required'}; const [,rank]=coords(move.to); if(mission.sideToMove==='white'?rank!==6:rank!==1) return {passed:false,reason:'pawn_not_on_seventh'}; const opponentMoves=legalMoves(finalPosition,opponent); if(opponentMoves.length===0 && !isInCheck(finalPosition,opponent)) return {passed:false,reason:'stalemate_created'}; }
  if(objective==='convert_endgame_advantage'){ const moved=mission.position[move.from]; if(!moved || PIECES[moved][1]!=='king') return {passed:false,reason:'king_required'}; const friendlyPawn=Object.entries(finalPosition).find(([,p])=>p===(mission.sideToMove==='white'?'♙':'♟')); if(!friendlyPawn) return {passed:false,reason:'friendly_pawn_missing'}; const [pawnSq]=friendlyPawn,[kx,ky]=coords(move.to),[px,py]=coords(pawnSq); if(Math.max(Math.abs(kx-px),Math.abs(ky-py))>1) return {passed:false,reason:'king_not_supporting_pawn'}; }
  return {passed:true,reason:'validated',finalPosition};
}
