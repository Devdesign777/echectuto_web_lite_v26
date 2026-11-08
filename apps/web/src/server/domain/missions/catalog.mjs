import { positionFingerprint } from '../chess/authoritative-chess.mjs';

const RAW_MISSIONS = [
  { id:'world1-1', world:1, order:1, title:"Le langage de l'échiquier", kind:'interaction', status:'draft', rewardXp:50, definition:{type:'square',target:'e4'} },
  { id:'world1-2', world:1, order:2, title:'La Tour prend la route', kind:'interaction', status:'draft', rewardXp:60, definition:{type:'rook',origin:'d4'} },
  { id:'world1-3', world:1, order:3, title:'Les diagonales du Fou', kind:'interaction', status:'draft', rewardXp:70, definition:{type:'bishop',origin:'c3'} },
  { id:'world1-4', world:1, order:4, title:'Le saut du Cavalier', kind:'interaction', status:'draft', rewardXp:80, definition:{type:'knight',origin:'e4'} },
  { id:'world1-5', world:1, order:5, title:'Première épreuve', kind:'interaction', status:'draft', rewardXp:100, definition:{type:'square',target:'g6'} },
  { id:'world3-1', world:3, order:1, title:'La fourchette', kind:'chess_move', status:'certified', rewardXp:140, definition:{sideToMove:'white',objective:'give_check',position:{b5:'♘',e8:'♚',a8:'♜',d8:'♛',g8:'♞',e1:'♔'},expectedMove:{from:'b5',to:'c7'}} },
  { id:'world3-2', world:3, order:2, title:'Le clouage', kind:'chess_move', status:'draft', rewardXp:150, definition:{sideToMove:'white',position:{c4:'♗',c6:'♞',e8:'♚',a8:'♜',e1:'♔'},expectedMove:{from:'c4',to:'b5'}} },
  { id:'world3-3', world:3, order:3, title:"L’enfilade", kind:'chess_move', status:'draft', rewardXp:160, definition:{sideToMove:'white',position:{e1:'♖',e8:'♚',e7:'♛',a8:'♜',g1:'♔'},expectedMove:{from:'e1',to:'e6'}} },
  { id:'world3-4', world:3, order:4, title:'Attaque découverte', kind:'chess_move', status:'draft', rewardXp:170, definition:{sideToMove:'white',position:{b1:'♗',d3:'♘',h7:'♛',e8:'♚',e1:'♔'},expectedMove:{from:'d3',to:'f4'}} },
  { id:'world3-5', world:3, order:5, title:'Tactique ou calme ?', kind:'chess_move', status:'draft', rewardXp:190, definition:{sideToMove:'white',position:{g1:'♔',d1:'♕',a1:'♖',f3:'♘',g2:'♙',h2:'♙',g8:'♚',d8:'♛'},expectedMove:{from:'h2',to:'h3'}} },
  { id:'world4-1', world:4, order:1, title:'Reconnaître l’échec', kind:'chess_move', status:'certified', rewardXp:180, definition:{sideToMove:'white',objective:'escape_check',position:{e1:'♔',a1:'♖',e8:'♜',a8:'♚'},expectedMove:{from:'e1',to:'f2'}} },
  { id:'world4-2', world:4, order:2, title:'Fermer une fuite', kind:'chess_move', status:'certified', rewardXp:190, definition:{sideToMove:'white',objective:'mate_in_one',position:{f6:'♔',g6:'♕',h8:'♚'},expectedMove:{from:'g6',to:'g7'}} },
  { id:'world4-3', world:4, order:3, title:'Mat de la dernière rangée', kind:'chess_move', status:'certified', rewardXp:210, definition:{sideToMove:'white',objective:'mate_in_one',position:{g1:'♔',e1:'♖',g8:'♚',f7:'♟',g7:'♟',h7:'♟'},expectedMove:{from:'e1',to:'e8'}} },
  { id:'world4-4', world:4, order:4, title:'Dame et roi coordonnés', kind:'chess_move', status:'certified', rewardXp:230, definition:{sideToMove:'white',objective:'mate_in_one',position:{f6:'♔',e7:'♕',h8:'♚'},expectedMove:{from:'e7',to:'g7'}} },
  { id:'world4-5', world:4, order:5, title:'Mat en un', kind:'chess_move', status:'certified', rewardXp:260, definition:{sideToMove:'white',objective:'mate_in_one',position:{f7:'♔',d3:'♗',g1:'♖',h8:'♚'},expectedMove:{from:'g1',to:'g8'}} },
  { id:'world5-1', world:5, order:1, title:'Prendre le centre', kind:'chess_move', status:'certified', rewardXp:220, definition:{sideToMove:'white',objective:'occupy_center',position:{e1:'♔',e2:'♙',e8:'♚'},expectedMove:{from:'e2',to:'e4'}} },
  { id:'world5-2', world:5, order:2, title:'Sortir les cavaliers', kind:'chess_move', status:'certified', rewardXp:230, definition:{sideToMove:'white',objective:'develop_minor',position:{e1:'♔',g1:'♘',e8:'♚'},expectedMove:{from:'g1',to:'f3'}} },
  { id:'world5-3', world:5, order:3, title:'Libérer le fou', kind:'chess_move', status:'certified', rewardXp:240, definition:{sideToMove:'white',objective:'develop_minor',position:{e1:'♔',f1:'♗',e8:'♚'},expectedMove:{from:'f1',to:'c4'}} },
  { id:'world5-4', world:5, order:4, title:'Mettre le roi à l’abri', kind:'chess_move', status:'certified', rewardXp:260, definition:{sideToMove:'white',objective:'castle_kingside',position:{e1:'♔',h1:'♖',e8:'♚'},expectedMove:{from:'e1',to:'g1'}} },
  { id:'world5-5', world:5, order:5, title:'Ne pas perdre de temps', kind:'chess_move', status:'certified', rewardXp:280, definition:{sideToMove:'white',objective:'develop_minor',position:{e1:'♔',b1:'♘',e8:'♚'},expectedMove:{from:'b1',to:'d2'}} },
  { id:'world5-6', world:5, order:6, title:'Développement complet', kind:'chess_move', status:'certified', rewardXp:310, definition:{sideToMove:'white',objective:'complete_development',position:{g1:'♔',f1:'♖',a1:'♖',b1:'♘',c4:'♗',f3:'♘',e2:'♙',e8:'♚'},expectedMove:{from:'b1',to:'c3'}} },
  { id:'world6-1', world:6, order:1, title:'Lire la structure de pions', kind:'chess_move', status:'certified', rewardXp:280, definition:{sideToMove:'white',objective:'pawn_structure_break',position:{g1:'♔',d4:'♙',e4:'♙',c5:'♟',e5:'♟',g8:'♚'},expectedMove:{from:'d4',to:'d5'}} },
  { id:'world6-2', world:6, order:2, title:'Créer une case forte', kind:'chess_move', status:'certified', rewardXp:300, definition:{sideToMove:'white',objective:'create_outpost',position:{g1:'♔',f3:'♘',d4:'♙',f4:'♙',a7:'♟',b7:'♟',h7:'♟',g8:'♚'},expectedMove:{from:'f3',to:'e5'}} },
  { id:'world6-3', world:6, order:3, title:'Occuper une colonne ouverte', kind:'chess_move', status:'certified', rewardXp:320, definition:{sideToMove:'white',objective:'occupy_open_file',position:{g1:'♔',a1:'♖',c2:'♙',e2:'♙',c7:'♟',e7:'♟',g8:'♚'},expectedMove:{from:'a1',to:'d1'}} },
  { id:'world6-4', world:6, order:4, title:'Gagner de l’espace', kind:'chess_move', status:'certified', rewardXp:340, definition:{sideToMove:'white',objective:'gain_space',position:{g1:'♔',e4:'♙',c4:'♙',e6:'♟',c6:'♟',g8:'♚'},expectedMove:{from:'e4',to:'e5'}} },
  { id:'world6-5', world:6, order:5, title:'Améliorer sa pire pièce', kind:'chess_move', status:'certified', rewardXp:370, definition:{sideToMove:'white',objective:'improve_worst_piece',position:{g1:'♔',a1:'♖',f1:'♖',b1:'♘',f3:'♘',c4:'♗',e2:'♙',d3:'♙',g8:'♚'},expectedMove:{from:'b1',to:'c3'}} },
  { id:'world6-6', world:6, order:6, title:'Construire un plan', kind:'chess_move', status:'certified', rewardXp:410, definition:{sideToMove:'white',objective:'strategic_pawn_break',position:{g1:'♔',a1:'♖',f1:'♖',c3:'♘',f3:'♘',g2:'♗',c4:'♙',d4:'♙',e4:'♙',b6:'♟',d6:'♟',e6:'♟',g8:'♚'},expectedMove:{from:'c4',to:'c5'}} },
  { id:'world7-1', world:7, order:1, title:'Activer le roi', kind:'chess_move', status:'certified', rewardXp:340, definition:{sideToMove:'white',objective:'activate_king_endgame',position:{d3:'♔',a2:'♙',h2:'♙',d6:'♚',a7:'♟',h7:'♟'},expectedMove:{from:'d3',to:'e4'}} },
  { id:'world7-2', world:7, order:2, title:'Créer un pion passé', kind:'chess_move', status:'certified', rewardXp:360, definition:{sideToMove:'white',objective:'create_passed_pawn',position:{g1:'♔',d5:'♙',c6:'♟',e6:'♟',g8:'♚'},expectedMove:{from:'d5',to:'e6'}} },
  { id:'world7-3', world:7, order:3, title:'La règle du carré', kind:'chess_move', status:'certified', rewardXp:380, definition:{sideToMove:'white',objective:'enter_pawn_square',position:{f4:'♔',a2:'♙',c6:'♟',h8:'♚'},expectedMove:{from:'f4',to:'e5'}} },
  { id:'world7-4', world:7, order:4, title:'L’opposition', kind:'chess_move', status:'certified', rewardXp:410, definition:{sideToMove:'white',objective:'take_opposition',position:{e4:'♔',e7:'♚',a2:'♙',h7:'♟'},expectedMove:{from:'e4',to:'e5'}} },
  { id:'world7-5', world:7, order:5, title:'Tour derrière le pion', kind:'chess_move', status:'certified', rewardXp:440, definition:{sideToMove:'white',objective:'rook_behind_passed_pawn',position:{g1:'♔',a1:'♖',d5:'♙',g8:'♚',h7:'♟'},expectedMove:{from:'a1',to:'d1'}} },
  { id:'world7-6', world:7, order:6, title:'Promouvoir sans pat', kind:'chess_move', status:'certified', rewardXp:470, definition:{sideToMove:'white',objective:'safe_promotion_progress',position:{f6:'♔',g6:'♙',h8:'♚'},expectedMove:{from:'g6',to:'g7'}} },
  { id:'world7-7', world:7, order:7, title:'Convertir l’avantage', kind:'chess_move', status:'certified', rewardXp:520, definition:{sideToMove:'white',objective:'convert_endgame_advantage',position:{b5:'♔',c5:'♙',a7:'♚',h7:'♟'},expectedMove:{from:'b5',to:'c6'}} },
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
  const d=catalogMission.definition; return {id:catalogMission.id,sideToMove:d.sideToMove,position:d.position,expectedMove:d.expectedMove,objective:d.objective};
}
