import { positionFingerprint } from '../chess/authoritative-chess.mjs';

const RAW_MISSIONS = [
  { id:'world1-1', world:1, order:1, title:"Le langage de l'échiquier", kind:'interaction', status:'draft', rewardXp:50, definition:{type:'square',target:'e4'} },
  { id:'world1-2', world:1, order:2, title:'La Tour prend la route', kind:'interaction', status:'draft', rewardXp:60, definition:{type:'rook',origin:'d4'} },
  { id:'world1-3', world:1, order:3, title:'Les diagonales du Fou', kind:'interaction', status:'draft', rewardXp:70, definition:{type:'bishop',origin:'c3'} },
  { id:'world1-4', world:1, order:4, title:'Le saut du Cavalier', kind:'interaction', status:'draft', rewardXp:80, definition:{type:'knight',origin:'e4'} },
  { id:'world1-5', world:1, order:5, title:'Première épreuve', kind:'interaction', status:'draft', rewardXp:100, definition:{type:'square',target:'g6'} },
  { id:'world3-1', world:3, order:1, title:'La fourchette', kind:'chess_move', status:'certified', rewardXp:140, definition:{sideToMove:'white',position:{b5:'♘',e8:'♚',a8:'♜',d8:'♛',g8:'♞',e1:'♔'},expectedMove:{from:'b5',to:'c7'}} },
  { id:'world3-2', world:3, order:2, title:'Le clouage', kind:'chess_move', status:'draft', rewardXp:150, definition:{sideToMove:'white',position:{c4:'♗',c6:'♞',e8:'♚',a8:'♜',e1:'♔'},expectedMove:{from:'c4',to:'b5'}} },
  { id:'world3-3', world:3, order:3, title:"L’enfilade", kind:'chess_move', status:'draft', rewardXp:160, definition:{sideToMove:'white',position:{e1:'♖',e8:'♚',e7:'♛',a8:'♜',g1:'♔'},expectedMove:{from:'e1',to:'e6'}} },
  { id:'world3-4', world:3, order:4, title:'Attaque découverte', kind:'chess_move', status:'draft', rewardXp:170, definition:{sideToMove:'white',position:{b1:'♗',d3:'♘',h7:'♛',e8:'♚',e1:'♔'},expectedMove:{from:'d3',to:'f4'}} },
  { id:'world3-5', world:3, order:5, title:'Tactique ou calme ?', kind:'chess_move', status:'draft', rewardXp:190, definition:{sideToMove:'white',position:{g1:'♔',d1:'♕',a1:'♖',f3:'♘',g2:'♙',h2:'♙',g8:'♚',d8:'♛'},expectedMove:{from:'h2',to:'h3'}} },
];

function deepFreeze(value){ if(value && typeof value==='object' && !Object.isFrozen(value)){ Object.freeze(value); for(const v of Object.values(value)) deepFreeze(v); } return value; }
function versioned(m){
  const definition = m.kind==='chess_move' ? {...m.definition, positionFingerprint:positionFingerprint(m.definition.position)} : m.definition;
  return deepFreeze({...m, version:1, definition});
}
export const MISSION_CATALOG = deepFreeze(RAW_MISSIONS.map(versioned));
export function getMission(id, version=1){ return MISSION_CATALOG.find(m=>m.id===id && m.version===version) ?? null; }
export function getCertifiedMission(id, version=1){ const m=getMission(id,version); return m?.status==='certified' ? m : null; }
export function toChessValidationMission(catalogMission){
  if(!catalogMission || catalogMission.kind!=='chess_move' || catalogMission.status!=='certified') throw new Error('mission is not certified for chess validation');
  const d=catalogMission.definition; return {id:catalogMission.id,sideToMove:d.sideToMove,position:d.position,expectedMove:d.expectedMove};
}
