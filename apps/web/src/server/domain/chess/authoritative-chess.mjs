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
  if(type==='king') return ax<=1&&ay<=1;
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
  return {passed:true,reason:'validated',finalPosition};
}
