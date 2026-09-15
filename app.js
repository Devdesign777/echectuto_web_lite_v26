
// ===== v41: safe local storage — repaired =====
const safeStorage={
  getItem(key){
    try{return window.localStorage.getItem(key)}
    catch(e){return null}
  },
  setItem(key,value){
    try{window.localStorage.setItem(key,value);return true}
    catch(e){return false}
  },
  removeItem(key){
    try{window.localStorage.removeItem(key);return true}
    catch(e){return false}
  }
};

// ===== v41: persistent cumulative economy — top-level =====
const ECONOMY_KEYS={
  xp:'echectuto-economy-xp-v36',
  coins:'echectuto-economy-coins-v36',
  stars:'echectuto-economy-stars-v36',
  inventory:'echectuto-shop-inventory-v36',
  equipped:'echectuto-shop-equipped-v36'
};

function economyRead(key,fallback=0){
  const raw=safeStorage.getItem(key);
  const n=Number(raw);
  return Number.isFinite(n)?n:fallback;
}

let playerEconomy={
  xp:economyRead(ECONOMY_KEYS.xp,0),
  coins:economyRead(ECONOMY_KEYS.coins,0),
  stars:economyRead(ECONOMY_KEYS.stars,0)
};


function economySave(){
  safeStorage.setItem(ECONOMY_KEYS.xp,String(playerEconomy.xp));
  safeStorage.setItem(ECONOMY_KEYS.coins,String(playerEconomy.coins));
  safeStorage.setItem(ECONOMY_KEYS.stars,String(playerEconomy.stars));
}

function updateEconomyUI(){
  document.querySelectorAll('[data-economy]').forEach(el=>{
    const key=el.dataset.economy;
    if(key in playerEconomy){
      el.textContent=playerEconomy[key].toLocaleString('fr-FR');
    }
  });
  const shopETS=document.getElementById('shopETSBalance');
  if(shopETS){
    const coins=Number(playerEconomy?.coins||0);
    shopETS.textContent=coins.toLocaleString('fr-FR');
  }

  updateShopETSBalance();
}

function addXP(amount){
  amount=Math.max(0,Number(amount)||0);
  const coins=Math.max(1,Math.round(amount/20));
  const before={...playerEconomy};
  playerEconomy.xp+=amount;
  playerEconomy.coins+=coins;
  economySave();
  const after={...playerEconomy};
  updateEconomyUI();
  lastRewardPayload={xp:amount,coins,stars:0,before,after};
  return playerEconomy.xp;
}

function addCoins(amount){
  playerEconomy.coins=Math.max(0,playerEconomy.coins+(Number(amount)||0));
  economySave();
  updateEconomyUI();
}
function addStars(amount){
  playerEconomy.stars=Math.max(0,playerEconomy.stars+(Number(amount)||0));
  economySave();
  updateEconomyUI();
}
function spendCoins(amount){
  amount=Math.max(0,Number(amount)||0);
  if(playerEconomy.coins<amount)return false;
  playerEconomy.coins-=amount;
  economySave();
  updateEconomyUI();
  return true;
}

// ===== Appearance / themes =====
const rootEl = document.documentElement;
const appearancePanel = document.getElementById('appearancePanel');
const themeToggle = document.getElementById('themeToggle');
const closeAppearance = document.getElementById('closeAppearance');
const reduceMotionToggle = document.getElementById('reduceMotionToggle');
const themeCards = [...document.querySelectorAll('.theme-card')];

const THEME_KEY = 'echectuto-theme';
const MOTION_KEY = 'echectuto-reduce-motion';

function resolveSystemTheme(){
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light-ivory'
    : 'dark-royal';
}
function applyTheme(theme){
  const resolved = theme === 'system' ? resolveSystemTheme() : theme;
  rootEl.dataset.theme = resolved;
  rootEl.dataset.themePreference = theme;
  themeCards.forEach(card => card.classList.toggle('active', card.dataset.theme === theme));
}
function setTheme(theme){
  safeStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}
const savedTheme = safeStorage.getItem(THEME_KEY) || 'dark-royal';
applyTheme(savedTheme);

themeToggle?.addEventListener('click', ()=>{
  appearancePanel.classList.toggle('open');
  appearancePanel.setAttribute('aria-hidden', appearancePanel.classList.contains('open') ? 'false' : 'true');
});
closeAppearance?.addEventListener('click', ()=>{
  appearancePanel.classList.remove('open');
  appearancePanel.setAttribute('aria-hidden','true');
});
themeCards.forEach(card => card.addEventListener('click', ()=> setTheme(card.dataset.theme)));

if(window.matchMedia){
  const mm = window.matchMedia('(prefers-color-scheme: light)');
  const refreshSystem = ()=> {
    if((safeStorage.getItem(THEME_KEY) || 'dark-royal') === 'system') applyTheme('system');
  };
  if(mm.addEventListener) mm.addEventListener('change', refreshSystem);
}

const savedMotion = safeStorage.getItem(MOTION_KEY) === '1';
reduceMotionToggle.checked = savedMotion;
rootEl.classList.toggle('reduce-motion', savedMotion);
reduceMotionToggle.addEventListener('change', ()=>{
  const reduced = reduceMotionToggle.checked;
  rootEl.classList.toggle('reduce-motion', reduced);
  safeStorage.setItem(MOTION_KEY, reduced ? '1' : '0');
});

document.addEventListener('pointerdown', (e)=>{
  if(!appearancePanel.classList.contains('open')) return;
  if(!appearancePanel.contains(e.target) && !themeToggle.contains(e.target)){
    appearancePanel.classList.remove('open');
    appearancePanel.setAttribute('aria-hidden','true');
  }
});



const boot = document.getElementById('boot');
window.addEventListener('load',()=>setTimeout(()=>boot.classList.add('hide'),900));

const pieces = [
  '♜','♞','♝','♛','♚','♝','♞','♜',
  '♟','♟','♟','♟','♟','♟','♟','♟',
  '','','','','','','','',
  '','','','','','','','',
  '','','','','','','','',
  '','','','','','','','',
  '♙','♙','♙','♙','♙','♙','♙','♙',
  '♖','♘','♗','♕','♔','♗','♘','♖'
];

function buildBoard(el, demo=false){
  el.innerHTML='';
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const sq=document.createElement('div');
      sq.className='square '+(((r+c)%2===0)?'light':'dark');
      const file=String.fromCharCode(97+c);
      const rank=8-r;
      sq.dataset.square=file+rank;
      if(!demo){
        sq.textContent=pieces[r*8+c];
        if((file+rank)==='e4') sq.classList.add('pulse');
      }else{
        sq.title=file+rank;
        sq.setAttribute('aria-label',file+rank);
      }
      el.appendChild(sq);
    }
  }
}
buildBoard(document.getElementById('board'));
buildBoard(document.getElementById('demoBoard'), true);

document.querySelectorAll('[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>document.querySelector(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'}));
});

const io = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  })
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const menuBtn=document.getElementById('menuBtn');
const mobileMenu=document.getElementById('mobileMenu');
menuBtn.addEventListener('click',()=>mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

document.querySelectorAll('.tilt-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(window.innerWidth<900) return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(900px) rotateY(${x*7}deg) rotateX(${y*-7}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
});


// ===== v3: real mission progression =====
const modal=document.getElementById('missionModal');
const missionHub=document.getElementById('missionHub');
const missionMap=document.getElementById('missionMap');
const hubProgress=document.getElementById('hubProgress');
const hubProgressBar=document.getElementById('hubProgressBar');
const worldProgressLabel=document.getElementById('worldProgressLabel');
const worldProgressPct=document.getElementById('worldProgressPct');
const worldProgressBar=document.getElementById('worldProgressBar');

const missionEyebrow=document.getElementById('missionEyebrow');
const missionTitle=document.getElementById('missionTitle');
const missionDescription=document.getElementById('missionDescription');
const missionObjective=document.getElementById('missionObjective');
const missionStatus=document.getElementById('missionStatus');
const missionReward=document.getElementById('missionReward');
const nextMissionBtn=document.getElementById('nextMission');
const demoBoard=document.getElementById('demoBoard');

const PROGRESS_KEY='echectuto-world1-progress-v3';
const BOSS_KEY='echectuto-world1-boss-v8';

const missions=[
  {
    id:1, icon:'⌖', title:"Le langage de l'échiquier",
    desc:"Apprends à lire les coordonnées de l'échiquier.",
    objective:'Trouve la case <b>e4</b>.',
    type:'square', target:'e4', reward:50,
    success:'Parfait. Tu viens de lire correctement la case e4.'
  },
  {
    id:2, icon:'♖', title:"La Tour prend la route",
    desc:"Découvre comment la Tour se déplace en lignes droites.",
    objective:'Clique sur une case que la <b>Tour en d4</b> peut atteindre en un coup.',
    type:'rook', origin:'d4', reward:60,
    success:'Exact. La Tour se déplace horizontalement ou verticalement.'
  },
  {
    id:3, icon:'♗', title:"Les diagonales du Fou",
    desc:"Apprends à reconnaître instantanément les diagonales.",
    objective:'Depuis <b>c3</b>, trouve une case accessible au Fou.',
    type:'bishop', origin:'c3', reward:70,
    success:'Bien vu. Le Fou reste toujours sur la même couleur de case.'
  },
  {
    id:4, icon:'♞', title:"Le saut du Cavalier",
    desc:"Le Cavalier est la seule pièce qui saute par-dessus les autres.",
    objective:'Depuis <b>e4</b>, trouve une destination légale du Cavalier.',
    type:'knight', origin:'e4', reward:80,
    success:'Excellent. Tu reconnais maintenant le mouvement en L.'
  },
  {
    id:5, icon:'♚', title:"Première épreuve",
    desc:"Combine ce que tu viens d'apprendre dans une situation un peu plus exigeante.",
    objective:'Trouve la case <b>g6</b> pour ouvrir l’accès au Boss.',
    type:'square', target:'g6', reward:100,
    success:'Épreuve réussie. Le Boss du chapitre est maintenant accessible.'
  }
];

let completedIds = JSON.parse(safeStorage.getItem(PROGRESS_KEY) || '[]');
if(!Array.isArray(completedIds)) completedIds=[];
let bossCompleted = safeStorage.getItem(BOSS_KEY)==='1';
let currentMissionId=1;
let currentCompleted=false;

function saveProgress(){
  safeStorage.setItem(PROGRESS_KEY, JSON.stringify(completedIds));
  updateProgressUI();
  renderWorldTwo();renderWorldTwoBoss();
}

function openBossMission(replay=false){
  clearMissionSuccess();
  currentMissionId=99;
  currentCompleted=!!bossCompleted;

  missionEyebrow.textContent='BOSS — MONDE 01';
  missionTitle.textContent='Le Gardien des 64 Cases';
  missionDescription.textContent=bossCompleted
    ? 'Boss déjà vaincu. Tu peux le rejouer librement.'
    : 'Dernière épreuve du Monde 01.';
  missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';
  missionReward.textContent=bossCompleted
    ? 'Entraînement libre — aucune récompense principale supplémentaire'
    : 'Récompense : +150 XP + Badge Éclaireur';
  missionStatus.textContent=bossCompleted
    ? 'Appuie sur « Rejouer » pour lancer une nouvelle tentative.'
    : 'Aucune aide directe. Observe bien les coordonnées.';

  buildEmptyDemo();

  if(bossCompleted){
    configureMissionFooter('boss-completed');
    nextMissionBtn.disabled=false;
    nextMissionBtn.textContent='Mission suivante → Monde 02';
    nextMissionBtn.onclick=()=>{
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      openWorldTwoHub();
    };
  }else{
    configureMissionFooter('boss-active');
    nextMissionBtn.disabled=true;
    nextMissionBtn.textContent='Mission suivante →';
    nextMissionBtn.onclick=null;
  }

  closeHub();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function bindBossButton(){
  const btn=document.getElementById('bossBtn');
  if(!btn) return;
  btn.onclick=()=>{
    const unlocked=completedIds.length>=missions.length || bossCompleted;
    if(!unlocked) return;
    openBossMission(!!bossCompleted);
  };
}

function unlockedMissionId(){
  return Math.min(completedIds.length + 1, missions.length);
}
function updateProgressUI(){
  const done=completedIds.length;
  const pct=Math.round((done/missions.length)*100);
  worldProgressLabel.textContent=`${done} / ${missions.length} missions`;
  worldProgressPct.textContent=`${pct}%`;
  worldProgressBar.style.width=`${pct}%`;
  hubProgress.textContent=`${done} / ${missions.length} missions`;
  hubProgressBar.style.width=`${pct}%`;
  renderMissionMap();
  renderBossState();
  bindBossButton();
}

function renderBossState(){
  const btn=document.getElementById('bossBtn');
  const bossCard=document.getElementById('bossNode') || document.querySelector('.boss-node');
  const remaining=Math.max(0,missions.length-completedIds.length);
  const unlocked=completedIds.length>=missions.length || bossCompleted;

  if(bossCard){
    bossCard.classList.toggle('boss-locked',!unlocked);
    bossCard.classList.toggle('boss-ready',unlocked && !bossCompleted);
    bossCard.classList.toggle('boss-completed',!!bossCompleted);
    bossCard.setAttribute('aria-disabled',unlocked?'false':'true');
  }

  if(!btn) return;

  if(bossCompleted){
    btn.disabled=false;
    btn.classList.add('boss-live');
    btn.textContent='Rejouer';
    document.getElementById('routeStatus').textContent='Boss vaincu — entraînement disponible';
  }else if(unlocked){
    btn.disabled=false;
    btn.classList.add('boss-live');
    btn.textContent='Affronter le Boss';
    document.getElementById('routeStatus').textContent='Boss disponible';
  }else{
    btn.disabled=true;
    btn.classList.remove('boss-live');
    btn.textContent=`Encore ${remaining} mission${remaining>1?'s':''}`;
    document.getElementById('routeStatus').textContent=`${remaining} mission${remaining>1?'s':''} avant le Boss`;
  }
}

function renderMissionMap(){
  const map=document.getElementById('missionMap');
  if(!map) return;
  map.innerHTML='';

  const nextId=Math.min(completedIds.length+1,missions.length);
  missions.forEach(m=>{
    const done=completedIds.includes(m.id);
    const available=done || m.id===nextId || bossCompleted;
    const n=document.createElement('article');
    n.className='mission-node '+(done?'completed':available?'available':'locked');
    n.innerHTML=`
      <div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div>
      <div class="mission-node-icon">${done?'✓':m.icon}</div>
      <h3>${m.title}</h3>
      <p>${done?'Mission validée — entraînement libre':available?m.desc:'Termine la mission précédente.'}</p>
      <button ${available?'':'disabled'}>${done?'Rejouer':available?'Jouer':'Verrouillée'}</button>`;
    n.querySelector('button').onclick=()=>{ if(available) openMission(m.id); };
    map.appendChild(n);
  });

  const pct=Math.round(completedIds.length/missions.length*100);
  const h=document.getElementById('hubProgress');
  const b=document.getElementById('hubProgressBar');
  if(h) h.textContent=`${completedIds.length} / ${missions.length} missions`;
  if(b) b.style.width=pct+'%';

  renderBossState();
  bindBossButton();
}

document.getElementById('startWorld').addEventListener('click',()=>{
  updateProgressUI();
  missionHub.classList.add('open');
  missionHub.setAttribute('aria-hidden','false');
});
document.getElementById('closeMissionHub').addEventListener('click',closeHub);
missionHub.querySelector('.mission-hub-backdrop').addEventListener('click',closeHub);
function closeHub(){missionHub.classList.remove('open');missionHub.setAttribute('aria-hidden','true');}

document.getElementById('closeModal').addEventListener('click',closeMission);
modal.querySelector('.mission-backdrop').addEventListener('click',closeMission);
function closeMission(){
  stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
}

function buildEmptyDemo(){
  buildBoard(demoBoard,true);
  demoBoard.querySelectorAll('.square').forEach(sq=>{
    sq.textContent='';
    sq.classList.remove('correct','wrong','selected','move-origin','move-target','target-hint');
  });
}
function getCoords(square){
  return [square.charCodeAt(0)-97, parseInt(square[1],10)];
}
function isLegalFor(type, origin, target){
  const [ox,oy]=getCoords(origin), [tx,ty]=getCoords(target);
  const dx=Math.abs(tx-ox), dy=Math.abs(ty-oy);
  if(origin===target) return false;
  if(type==='rook') return dx===0 || dy===0;
  if(type==='bishop') return dx===dy;
  if(type==='knight') return (dx===1&&dy===2)||(dx===2&&dy===1);
  return false;
}
function placePiece(square, piece){
  const el=demoBoard.querySelector(`[data-square="${square}"]`);
  if(el){ el.textContent=piece; el.style.fontSize='34px'; el.classList.add('move-origin'); }
}


// ===== v34: real chess exercise layer =====
let realPuzzle=null;
let realPuzzleSelected=null;
function loadRealPosition(puzzle){
  realPuzzle=puzzle; realPuzzleSelected=null;
  buildEmptyDemo();
  Object.entries(puzzle.position||{}).forEach(([square,piece])=>{
    const el=demoBoard.querySelector(`[data-square="${square}"]`);
    if(el){el.textContent=piece;el.classList.add('real-piece');}
  });
}
function clearRealSelection(){
  realPuzzleSelected=null;
  demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('selected','legal-target','wrong'));
}
function markRealMove(from,to){
  const a=demoBoard.querySelector(`[data-square="${from}"]`), b=demoBoard.querySelector(`[data-square="${to}"]`);
  if(!a||!b)return;
  const piece=a.textContent;
  a.textContent='';a.classList.add('move-origin','correct');
  b.textContent=piece;b.classList.add('move-target','correct');
}
function playRealPuzzleSquare(square){
  if(!realPuzzle || currentCompleted) return true;
  const expected=realPuzzle.move;
  if(!realPuzzleSelected){
    if(square!==expected.from){
      const el=demoBoard.querySelector(`[data-square="${square}"]`);el?.classList.add('wrong');
      missionStatus.textContent='Commence par sélectionner la pièce qui doit jouer.';
      return true;
    }
    realPuzzleSelected=square;
    const from=demoBoard.querySelector(`[data-square="${square}"]`);from?.classList.add('selected');
    const target=demoBoard.querySelector(`[data-square="${expected.to}"]`);target?.classList.add('legal-target');
    missionStatus.textContent='Pièce sélectionnée. Choisis maintenant sa case d’arrivée.';
    return true;
  }
  if(square===realPuzzleSelected){clearRealSelection();missionStatus.textContent='Sélection annulée. Choisis une pièce.';return true;}
  if(realPuzzleSelected===expected.from && square===expected.to){
    demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','selected','legal-target'));
    markRealMove(expected.from,expected.to);
    if(currentMissionId===399){
      const first=!world3BossCompleted;currentCompleted=true;world3BossCompleted=true;safeStorage.setItem(WORLD3_BOSS_KEY,'1');
      if(first){try{grantAndShowMissionReward({xp:300,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(300)}catch(_){}}}
      setMissionSuccess(first?'Viper est vaincu ! Tu as trouvé la combinaison sur l’échiquier.':'Viper est vaincu à nouveau !');
      missionReward.textContent=first?'Récompenses obtenues : +300 XP • Badge Œil Tactique':'Entraînement validé — aucune nouvelle récompense principale.';
      const resetBtn=document.getElementById('resetMission');if(resetBtn){resetBtn.style.display='';resetBtn.disabled=false;resetBtn.textContent='Rejouer';}
      renderWorldThree();renderWorldThreeBoss();renderWorldFour();
      nextMissionBtn.disabled=false;nextMissionBtn.textContent='Mission suivante → Monde 04';
      nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldFourHub();};
    }else if(currentMissionId>=301&&currentMissionId<=305&&activeWorld3Mission){
      setMissionSuccess(realPuzzle.success||'Coup correct !');
      completeWorldThreeMission(activeWorld3Mission);
      missionStatus.textContent=realPuzzle.success||'Coup correct !';
    }
    return true;
  }
  const el=demoBoard.querySelector(`[data-square="${square}"]`);el?.classList.add('wrong');
  missionStatus.textContent='Ce déplacement ne réalise pas le motif recherché. Repars de la position.';
  clearRealSelection();
  return true;
}


function setMissionSuccess(message){registerMissionSuccessRuntime();
  challengeRecordMission(currentMissionId);
  queueLearningDebrief('victory',message);
  missionStatus.textContent=message;
  missionStatus.classList.add('success-state');
  const missionShell=document.querySelector('#missionModal .mission-shell, #missionModal .mission-panel, #missionModal .mission-content');
  missionShell?.classList.remove('mission-win-burst');
  requestAnimationFrame(()=>missionShell?.classList.add('mission-win-burst'));
  setTimeout(()=>missionShell?.classList.remove('mission-win-burst'),1100);

  setTimeout(()=>ensureVictoryFeedback(message||'Mission réussie !'),120);
}
function clearMissionSuccess(){
  missionStatus.classList.remove('success-state');
}

function configureMissionFooter(mode){
  const resetBtn=document.getElementById('resetMission');
  if(!resetBtn) return;

  if(mode==='boss-completed'){
    resetBtn.style.display='';
    resetBtn.textContent='Rejouer';
    resetBtn.disabled=false;
  }else if(mode==='boss-active'){
    resetBtn.style.display='none';
    resetBtn.disabled=true;
  }else if(mode==='world1'){
    resetBtn.style.display='none';
    resetBtn.disabled=true;
  }else{
    resetBtn.style.display='';
    resetBtn.textContent='Recommencer';
    resetBtn.disabled=false;
  }
}

function openMission(id){
  closeMissionDefeatFeedback(false);
  stopMissionTimer();
  clearMissionSuccess();
  configureMissionFooter('world1');
  setMissionDifficulty('easy');

  const m=missions.find(x=>x.id===id);
  if(!m) return;

  const alreadyValidated=completedIds.includes(id);
  currentMissionId=id;
  currentCompleted=false;

  missionEyebrow.textContent=`MISSION ${id} / ${missions.length} • FACILE`;
  missionTitle.textContent=m.title;
  missionDescription.textContent=m.desc;
  setNeutralMissionObjective(m.objective);
  missionReward.textContent=alreadyValidated
    ? 'Entraînement libre — récompense principale déjà obtenue'
    : `Récompense : +${m.reward} XP`;
  missionStatus.textContent=alreadyValidated
    ? 'Mission déjà validée — rejoue-la librement. Le chrono repart pour cette tentative.'
    : 'La mission commence maintenant. Observe l’échiquier puis joue.';

  nextMissionBtn.disabled=!alreadyValidated;
  nextMissionBtn.textContent=id>=missions.length
    ? (alreadyValidated?'Chapitre terminé ✓':'Termine la mission')
    : 'Mission suivante →';

  buildEmptyDemo();
  demoBoard.classList.remove('mission-failed');
  if(m.type==='rook') placePiece(m.origin,'♖');
  if(m.type==='bishop') placePiece(m.origin,'♗');
  if(m.type==='knight') placePiece(m.origin,'♘');

  missionHub.classList.remove('open');
  missionHub.setAttribute('aria-hidden','true');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');

  requestAnimationFrame(()=>{
    buildEmptyDemo();
    if(m.type==='rook') placePiece(m.origin,'♖');
    if(m.type==='bishop') placePiece(m.origin,'♗');
    if(m.type==='knight') placePiece(m.origin,'♘');
    demoBoard.classList.add('mission-ready');
    resetMissionRuntime();
  });
}

demoBoard.addEventListener('click',e=>{
  const sq=e.target.closest('.square');
  if(!sq) return;
  if(demoBoard.classList.contains('mission-failed')) return;
  if((currentMissionId===399 || (currentMissionId>=301&&currentMissionId<=305)) && realPuzzle){playRealPuzzleSquare(sq.dataset.square);return;}
  if(currentMissionId>=201 && currentMissionId<=204 && activeWorld2Mission){
    if(currentCompleted) return;
    const m=activeWorld2Mission;
    demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    let ok=m.type==='square'?sq.dataset.square===m.target:isLegalFor(m.type,m.origin,sq.dataset.square);
    if(ok){
      sq.classList.add('correct','move-target');currentCompleted=true;
      if(!world2Completed.includes(m.id)){world2Completed.push(m.id);world2Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD2_KEY,JSON.stringify(world2Completed))}
      missionStatus.textContent='Mission réussie. La prochaine étape est déverrouillée.';
      nextMissionBtn.disabled=m.id>=world2Missions.length;nextMissionBtn.textContent=m.id>=world2Missions.length?'Monde 02 : première série terminée ✓':'Mission suivante →';
      renderWorldTwo();
    }else{sq.classList.add('wrong');missionStatus.textContent='Ce choix ne répond pas à la consigne. Observe encore la position.'}
    return;
  }
  if(currentMissionId===1299){if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square==="e7"){const first=!world12BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world12BossCompleted=true;safeStorage.setItem(WORLD12_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:2500,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(2500)}catch(_){}}}setMissionSuccess("Le Grand Ma\u00eetre de la Citadelle est vaincu !");missionReward.textContent=first?"R\u00e9compenses obtenues : +2500 XP \u2022 Badge Citadelle":'Entraînement validé — récompense principale déjà obtenue.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldTwelve();renderWorldTwelveBoss();nextMissionBtn.disabled=false;nextMissionBtn.textContent='Campagne principale terminée ✓';nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
if(currentMissionId>=1201&&currentMissionId<=1207&&activeWorld12Mission){const m=activeWorld12Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldTwelveMission(m)}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
if(currentMissionId===1199){if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square==="e5"){const first=!world11BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world11BossCompleted=true;safeStorage.setItem(WORLD11_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:1800,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(1800)}catch(_){}}}setMissionSuccess("Titan, le Ma\u00eetre est vaincu !");missionReward.textContent=first?"R\u00e9compenses obtenues : +1800 XP \u2022 Badge Ma\u00eetre":'Entraînement validé — récompense principale déjà obtenue.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldEleven();renderWorldElevenBoss();renderWorldTwelve();nextMissionBtn.disabled=false;nextMissionBtn.textContent='Mission suivante → Monde 12';nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldTwelveHub()};}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
if(currentMissionId>=1101&&currentMissionId<=1107&&activeWorld11Mission){const m=activeWorld11Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldElevenMission(m)}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
if(currentMissionId===1099){if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square==="g7"){const first=!world10BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world10BossCompleted=true;safeStorage.setItem(WORLD10_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:1400,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(1400)}catch(_){}}}setMissionSuccess("Chronos, le Ma\u00eetre du Temps est vaincu !");missionReward.textContent=first?"R\u00e9compenses obtenues : +1400 XP \u2022 Badge Comp\u00e9titeur":'Entraînement validé — récompense principale déjà obtenue.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldTen();renderWorldTenBoss();renderWorldEleven();nextMissionBtn.disabled=false;nextMissionBtn.textContent='Mission suivante → Monde 11';nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldElevenHub()};}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
if(currentMissionId>=1001&&currentMissionId<=1007&&activeWorld10Mission){const m=activeWorld10Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldTenMission(m)}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
if(currentMissionId===999){
    if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square==='g6'){const first=!world9BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world9BossCompleted=true;safeStorage.setItem(WORLD9_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:1200,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(1200)}catch(_){}}}setMissionSuccess(first?'Aegis est vaincue ! Tu as transformé la défense en contre-jeu.':'Aegis est vaincue à nouveau.');missionReward.textContent=first?'Récompenses obtenues : +1200 XP • Badge Bouclier Royal':'Entraînement validé — aucune nouvelle récompense principale.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldNine();renderWorldNineBoss();renderWorldTen();
nextMissionBtn.disabled=false;nextMissionBtn.textContent='Mission suivante → Monde 10';nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldTenHub()}}else{sq.classList.add('wrong');missionStatus.textContent='La menace reste dangereuse. Cherche une défense qui réduit l’attaque tout en gardant de l’activité.'}return;
  }
  if(currentMissionId>=901&&currentMissionId<=907&&activeWorld9Mission){const m=activeWorld9Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldNineMission(m)}else{sq.classList.add('wrong');missionStatus.textContent='Cette défense ne résout pas complètement la menace. Vérifie ce que l’adversaire jouerait ensuite.'}return;}
  if(currentMissionId===899){
    if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square==='f6'){const first=!world8BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world8BossCompleted=true;safeStorage.setItem(WORLD8_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:1000,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(1000)}catch(_){}}}setMissionSuccess(first?'Mirror est vaincu ! Tu as calculé au-delà du premier coup.':'Mirror est vaincu à nouveau.');missionReward.textContent=first?'Récompenses obtenues : +1000 XP • Badge Oracle du Calcul':'Entraînement validé — aucune nouvelle récompense principale.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldEight();renderWorldEightBoss();renderWorldNine();
      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 09';
      nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldNineHub()}}else{sq.classList.add('wrong');missionStatus.textContent='La variante se brise avant cette case. Reviens au premier coup et cherche la meilleure défense.'}return;
  }
  if(currentMissionId>=801&&currentMissionId<=807&&activeWorld8Mission){const m=activeWorld8Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldEightMission(m)}else{sq.classList.add('wrong');missionStatus.textContent='Variante incorrecte. Recalcule depuis la position initiale sans déplacer mentalement les pièces au hasard.'}return;}
  if(currentMissionId===799){
    if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square==='e6'){const first=!world7BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world7BossCompleted=true;safeStorage.setItem(WORLD7_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:800,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(800)}catch(_){}}}setMissionSuccess(first?'Fortress est vaincu ! Finale convertie avec précision.':'Fortress est vaincu à nouveau.');missionReward.textContent=first?'Récompenses obtenues : +800 XP • Badge Gardien des Finales':'Entraînement validé — aucune nouvelle récompense principale.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldSeven();renderWorldSevenBoss();renderWorldEight();
      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 08';
      nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldEightHub()}}else{sq.classList.add('wrong');missionStatus.textContent='Ce chemin ne convertit pas encore l’avantage. Active davantage ton roi.'}return;
  }
  if(currentMissionId>=701&&currentMissionId<=707&&activeWorld7Mission){const m=activeWorld7Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldSevenMission(m)}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
  if(currentMissionId===699){
    if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square==='d6'){const first=!world6BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world6BossCompleted=true;safeStorage.setItem(WORLD6_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:650,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(650)}catch(_){}}}setMissionSuccess(first?'Atlas est vaincu ! Ton premier grand plan stratégique est validé.':'Atlas est vaincu à nouveau.');missionReward.textContent=first?'Récompenses obtenues : +650 XP • Badge Architecte':'Entraînement validé — aucune nouvelle récompense principale.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldSix();renderWorldSixBoss();renderWorldSeven();
      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 07';
      nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldSevenHub()}}else{sq.classList.add('wrong');missionStatus.textContent='Ce n’est pas le meilleur point d’ancrage. Analyse la structure et l’activité des pièces.'}return;
  }
  if(currentMissionId>=601&&currentMissionId<=606&&activeWorld6Mission){const m=activeWorld6Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldSixMission(m)}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
  if(currentMissionId===599){
    if(currentCompleted)return;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square==='d4'){const first=!world5BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world5BossCompleted=true;safeStorage.setItem(WORLD5_BOSS_KEY,'1');if(first){try{grantAndShowMissionReward({xp:500,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(500)}catch(_){}}}setMissionSuccess(first?'Orion est vaincu ! Développement maîtrisé.':'Orion est vaincu à nouveau.');missionReward.textContent=first?'Récompenses obtenues : +500 XP • Badge Commandant':'Entraînement validé — aucune nouvelle récompense principale.';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}renderWorldFive();renderWorldFiveBoss();renderWorldSix();
      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 06';
      nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldSixHub()}}else{sq.classList.add('wrong');missionStatus.textContent='Ce n’est pas le point clé. Pense au centre et à la coordination.'}return;
  }
  if(currentMissionId>=501&&currentMissionId<=506&&activeWorld5Mission){const m=activeWorld5Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldFiveMission(m)}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;}
  if(currentMissionId===499){
    if(currentCompleted)return;
    demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square==='h8'){
      const first=!world4BossCompleted;sq.classList.add('correct','move-target');currentCompleted=true;world4BossCompleted=true;safeStorage.setItem(WORLD4_BOSS_KEY,'1');
      if(first){try{grantAndShowMissionReward({xp:400,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(400)}catch(_){}}}setMissionSuccess(first?'Échec et mat ! Le Roi de Fer est vaincu.':'Le Roi de Fer est vaincu à nouveau.');
      missionReward.textContent=first?'Récompenses obtenues : +400 XP • Badge Mat Royal':'Entraînement validé — aucune nouvelle récompense principale.';
      const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'};renderWorldFour();renderWorldFourBoss();
      renderWorldFive();
      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 05';
      nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldFiveHub();};
    }else{sq.classList.add('wrong');missionStatus.textContent='Ce coup ne termine pas encore la partie. Cherche toutes les cases de fuite.'}return;
  }
  if(currentMissionId>=401&&currentMissionId<=405&&activeWorld4Mission){
    const m=activeWorld4Mission;demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square===m.target){sq.classList.add('correct','move-target');completeWorldFourMission(m)}else{sq.classList.add('wrong');registerMissionMistake('Mauvaise réponse.')}return;
  }

  if(currentMissionId===399){
    if(currentCompleted) return;
    demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square==='e6'){
      const first=!world3BossCompleted;
      sq.classList.add('correct','move-target');
      currentCompleted=true;
      world3BossCompleted=true;
      safeStorage.setItem(WORLD3_BOSS_KEY,'1');
      if(first){try{grantAndShowMissionReward({xp:300,stars:2,title:'Boss vaincu !',message:'Félicitations, vous avez gagné cette épreuve finale.'})}catch(e){try{addXP?.(300)}catch(_){}}}
      setMissionSuccess(first?'Viper est vaincu ! Royaume des Tacticiens terminé.':'Viper est vaincu à nouveau !');
      missionReward.textContent=first
        ? 'Récompenses obtenues : +300 XP • Badge Œil Tactique'
        : 'Entraînement validé — aucune nouvelle récompense principale.';
      const resetBtn=document.getElementById('resetMission');
      if(resetBtn){resetBtn.style.display='';resetBtn.disabled=false;resetBtn.textContent='Rejouer';}
      renderWorldThree();
      renderWorldThreeBoss();
      renderWorldFour();
      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 04';
      nextMissionBtn.onclick=()=>{stopMissionTimer();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');openWorldFourHub();};
    }else{
      sq.classList.add('wrong');
      missionStatus.textContent=`${sq.dataset.square} n'est pas le point tactique recherché.`;
    }
    return;
  }

  if(currentMissionId>=301 && currentMissionId<=305 && activeWorld3Mission){
    const m=activeWorld3Mission;
    demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));
    if(sq.dataset.square===m.target){
      sq.classList.add('correct','move-target');
      completeWorldThreeMission(m);
    }else{
      sq.classList.add('wrong');
      registerMissionMistake('Mauvaise réponse.');
    }
    return;
  }

  if(currentMissionId===299){
    if(currentCompleted) return;

    demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));

    if(sq.dataset.square==='f7'){
      const firstVictory=!world2BossCompleted;
      sq.classList.add('correct','move-target');

      currentCompleted=true;
      world2BossCompleted=true;
      safeStorage.setItem(WORLD2_BOSS_KEY,'1');

      setMissionSuccess(firstVictory
        ? 'Boss vaincu ! La Sentinelle est tombée.'
        : 'Boss vaincu à nouveau !');

      missionReward.textContent=firstVictory
        ? 'Récompenses obtenues : +200 XP • Badge Sentinelle'
        : 'Entraînement validé — aucune nouvelle récompense principale.';

      if(firstVictory){
        try{ addXP?.(200); }catch(e){}
      }

      const resetBtn=document.getElementById('resetMission');
      if(resetBtn){
        resetBtn.style.display='';
        resetBtn.disabled=false;
        resetBtn.textContent='Rejouer';
      }

      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 03';

      renderWorldTwo();
      renderWorldTwoBoss();
      renderWorldThree();
      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 03';
      nextMissionBtn.onclick=()=>{
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
        openWorldThreeHub();
      };
    }else{
      sq.classList.add('wrong');
      missionStatus.textContent=`${sq.dataset.square} n'est pas la bonne case. La Sentinelle résiste encore.`;
    }
    return;
  }

  if(currentMissionId===99){
    // When the boss is already completed, the user must explicitly press "Rejouer"
    // before a new attempt is accepted.
    if(currentCompleted) return;

    demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));

    if(sq.dataset.square==='c6'){
      const firstVictory=!bossCompleted;
      sq.classList.add('correct','move-target');

      currentCompleted=true;
      bossCompleted=true;
      safeStorage.setItem(BOSS_KEY,'1');

      setMissionSuccess(firstVictory
        ? 'Boss vaincu ! Le Monde 02 est maintenant accessible.'
        : 'Boss vaincu à nouveau !');

      missionReward.textContent=firstVictory
        ? 'Récompenses obtenues : +150 XP • Badge Éclaireur'
        : 'Entraînement validé — pas de nouvelle récompense principale.';

      configureMissionFooter('boss-completed');
      renderBossState();
      renderWorldTwo();

      nextMissionBtn.disabled=false;
      nextMissionBtn.textContent='Mission suivante → Monde 02';
      nextMissionBtn.onclick=()=>{
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
        openWorldTwoHub();
      };
    }else{
      sq.classList.add('wrong');
      missionStatus.textContent=`${sq.dataset.square} n'est pas la bonne case. Le Gardien résiste encore.`;
    }
    return;
  }

  const m=missions.find(x=>x.id===currentMissionId);
  if(!m || currentCompleted) return;

  demoBoard.querySelectorAll('.square').forEach(x=>x.classList.remove('wrong','correct','move-target','selected'));

  let ok=false;
  if(m.type==='square') ok=sq.dataset.square===m.target;
  else ok=isLegalFor(m.type,m.origin,sq.dataset.square);

  if(ok){
    sq.classList.add('correct','move-target');
    currentCompleted=true;
    const firstVictory=!completedIds.includes(m.id);

    if(firstVictory){
      // addXP also adds the cumulative ETS amount and stores the before/after snapshot
      // used by setMissionSuccess -> ensureVictoryFeedback for the animated reward flight.
      addXP(m.reward);
      completedIds.push(m.id);
      completedIds.sort((a,b)=>a-b);
      saveProgress();
      missionReward.textContent=`Récompenses obtenues : +${m.reward} XP • +${Math.max(1,Math.round(m.reward/20))} ETS`;
    }else{
      // Replay remains fully playable, but never farms XP/ETS.
      lastRewardPayload=null;
      missionReward.textContent='Entraînement validé — récompense principale déjà obtenue.';
    }

    setMissionSuccess(firstVictory
      ? `${m.success} Récompenses ajoutées à ton profil.`
      : `${m.success} Mission rejouée sans nouvelle récompense.`);
    nextMissionBtn.disabled=false;
    nextMissionBtn.textContent=m.id<missions.length?'Mission suivante →':'Chapitre terminé ✓';
  }else{
    sq.classList.add('wrong');
    const feedback=m.type==='square'
      ? `${sq.dataset.square} n'est pas la bonne case. Observe les coordonnées.`
      : `${sq.dataset.square} n'est pas une destination légale pour cette pièce. Essaie encore.`;
    registerMissionMistake(feedback);
  }
});

document.getElementById('resetMission').addEventListener('click',()=>{resetMissionRuntime();
  if(currentMissionId===399){clearMissionSuccess();currentCompleted=false;loadRealPosition({position:{g1:'♔',d1:'♕',f3:'♘',c4:'♗',g8:'♚',d8:'♛',f7:'♟',h7:'♟'},move:{from:'f3',to:'g5'},success:'Coup tactique trouvé.'});missionStatus.textContent='Nouvelle tentative : sélectionne une pièce puis joue le coup.';return;}
  if(currentMissionId>=301&&currentMissionId<=305&&activeWorld3Mission){clearMissionSuccess();currentCompleted=false;loadRealPosition(activeWorld3Mission);missionStatus.textContent='Nouvelle tentative : sélectionne une pièce puis joue le coup.';return;}
  if(currentMissionId===1099 && world10BossCompleted){currentCompleted=false;clearMissionSuccess();resetMissionRuntime();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative.';return;}
  if(currentMissionId>=1001 && currentMissionId<=1007 && activeWorld10Mission){openWorld10Mission(activeWorld10Mission.id);return;}
  if(currentMissionId===1199 && world11BossCompleted){currentCompleted=false;clearMissionSuccess();resetMissionRuntime();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative.';return;}
  if(currentMissionId>=1101 && currentMissionId<=1107 && activeWorld11Mission){openWorld11Mission(activeWorld11Mission.id);return;}
  if(currentMissionId===1299 && world12BossCompleted){currentCompleted=false;clearMissionSuccess();resetMissionRuntime();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative.';return;}
  if(currentMissionId>=1201 && currentMissionId<=1207 && activeWorld12Mission){openWorld12Mission(activeWorld12Mission.id);return;}
  if(currentMissionId===999 && world9BossCompleted){currentCompleted=false;clearMissionSuccess();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative : trouve la ressource sur g6.';return;}
  if(currentMissionId>=901 && currentMissionId<=907 && activeWorld9Mission){openWorld9Mission(activeWorld9Mission.id);return;}
  if(currentMissionId===899 && world8BossCompleted){currentCompleted=false;clearMissionSuccess();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative : calcule jusqu’à f6.';return;}
  if(currentMissionId>=801 && currentMissionId<=807 && activeWorld8Mission){openWorld8Mission(activeWorld8Mission.id);return;}
  if(currentMissionId===799 && world7BossCompleted){currentCompleted=false;clearMissionSuccess();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative : trouve la case e6.';return;}
  if(currentMissionId>=701 && currentMissionId<=707 && activeWorld7Mission){openWorld7Mission(activeWorld7Mission.id);return;}
  if(currentMissionId===699 && world6BossCompleted){currentCompleted=false;clearMissionSuccess();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative : trouve la case d6.';return;}
  if(currentMissionId>=601 && currentMissionId<=606 && activeWorld6Mission){openWorld6Mission(activeWorld6Mission.id);return;}
  if(currentMissionId===599 && world5BossCompleted){currentCompleted=false;clearMissionSuccess();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative : trouve la case d4.';return;}
  if(currentMissionId>=501 && currentMissionId<=506 && activeWorld5Mission){openWorld5Mission(activeWorld5Mission.id);return;}
  if(currentMissionId===499 && world4BossCompleted){currentCompleted=false;clearMissionSuccess();buildEmptyDemo();missionStatus.textContent='Nouvelle tentative : trouve la case h8.';return;}
  if(currentMissionId>=401 && currentMissionId<=405 && activeWorld4Mission){openWorld4Mission(activeWorld4Mission.id);return;}

  if(currentMissionId===399 && world3BossCompleted){
    currentCompleted=false;
    clearMissionSuccess();
    buildEmptyDemo();
    missionStatus.textContent='Nouvelle tentative : trouve la case e6 pour vaincre Viper.';
    missionReward.textContent='Entraînement libre — aucune récompense principale supplémentaire';
    return;
  }

  if(currentMissionId>=301 && currentMissionId<=305 && activeWorld3Mission){
    openWorld3Mission(activeWorld3Mission.id);
    return;
  }

  if(currentMissionId===299 && world2BossCompleted){
    currentCompleted=false;
    clearMissionSuccess();
    buildEmptyDemo();
    missionStatus.textContent='Nouvelle tentative : retrouve la case f7 pour vaincre la Sentinelle.';
    missionReward.textContent='Entraînement libre — aucune récompense principale supplémentaire';
    const resetBtn=document.getElementById('resetMission');
    if(resetBtn){
      resetBtn.style.display='';
      resetBtn.disabled=false;
      resetBtn.textContent='Rejouer';
    }
    nextMissionBtn.disabled=false;
    nextMissionBtn.textContent='Mission suivante → Monde 03';
    return;
  }

  if(currentMissionId===99 && bossCompleted){
    // Genuine boss replay: reset the attempt, keep progression intact.
    currentCompleted=false;
    clearMissionSuccess();
    buildEmptyDemo();
    missionStatus.textContent='Nouvelle tentative : retrouve la case c6 pour vaincre le Gardien.';
    missionReward.textContent='Entraînement libre — aucune récompense principale supplémentaire';
    configureMissionFooter('boss-completed');
    nextMissionBtn.disabled=false;
    nextMissionBtn.textContent='Mission suivante → Monde 02';
    nextMissionBtn.onclick=()=>{
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      openWorldTwoHub();
    };
    return;
  }

  if(currentMissionId>=201 && currentMissionId<=204 && activeWorld2Mission){
    openWorld2Mission(activeWorld2Mission.id);
    return;
  }

  if(currentMissionId>=1 && currentMissionId<=missions.length){
    openMission(currentMissionId);
  }
});
nextMissionBtn.addEventListener('click',()=>{
  if(currentMissionId>=1 && currentMissionId<missions.length && completedIds.includes(currentMissionId)){
    openMission(currentMissionId+1);
  }
});

updateProgressUI();



// ===== v191: anti-revelation objective layer =====
function neutralizeObjectiveHtml(raw=''){
  const source=String(raw||'');
  const containsSquare=/<b>\s*[a-h][1-8]\s*<\/b>/i.test(source) || /\b[a-h][1-8]\b/i.test(source);
  if(!containsSquare)return source;
  return 'Analyse la position et trouve le meilleur choix sans indication de case.';
}
function setNeutralMissionObjective(raw){
  missionObjective.innerHTML=neutralizeObjectiveHtml(raw);
}

document.getElementById('coachBtn')?.addEventListener('click',updateCoachMessage);

let soundOn=false;
document.getElementById('soundToggle').addEventListener('click',e=>{
  soundOn=!soundOn;
  e.currentTarget.textContent=soundOn?'◉':'◎';
  e.currentTarget.title=soundOn?'Ambiance activée (prototype visuel)':'Ambiance coupée';
});

const heroBoard=document.getElementById('heroBoard');
window.addEventListener('pointermove',e=>{
  if(window.innerWidth<900) return;
  const x=(e.clientX/window.innerWidth-.5)*8;
  const y=(e.clientY/window.innerHeight-.5)*8;
  heroBoard.style.marginLeft=`${x}px`;
  heroBoard.style.marginTop=`${y}px`;
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}




// ===== v18: World 02 — Premières Batailles =====
const WORLD2_KEY='echectuto-world2-progress-v9';
const WORLD2_BOSS_KEY='echectuto-world2-boss-v18';

let world2Completed=[];
try{
  world2Completed=JSON.parse(safeStorage.getItem(WORLD2_KEY)||'[]');
}catch(e){
  world2Completed=[];
}
if(!Array.isArray(world2Completed)) world2Completed=[];
let world2BossCompleted=safeStorage.getItem(WORLD2_BOSS_KEY)==='1';

const world2Missions=[
 {id:1,icon:'⚔',title:'Pièce attaquée',desc:'Repère immédiatement une pièce menacée.',objective:'La Tour blanche est en <b>d4</b>. Clique sur la case <b>d8</b>.',type:'square',target:'d8',reward:80},
 {id:2,icon:'🛡',title:'Sauver sa pièce',desc:'Une bonne défense évite de perdre du matériel gratuitement.',objective:'Ton Cavalier est en <b>e4</b>. Trouve une case légale pour le mettre à l’abri.',type:'knight',origin:'e4',reward:90},
 {id:3,icon:'♜',title:'Capture rentable',desc:'Apprends à voir les occasions simples de gagner du matériel.',objective:'Depuis <b>a1</b>, trouve une case accessible à la Tour.',type:'rook',origin:'a1',reward:100},
 {id:4,icon:'◎',title:'Vision de menace',desc:'Dernier test : lis la position avant d’agir.',objective:'Trouve la case <b>f7</b>, souvent sensible au début d’une partie.',type:'square',target:'f7',reward:120}
];

function isWorldTwoUnlocked(){
  return bossCompleted || safeStorage.getItem(BOSS_KEY)==='1';
}

function renderWorldTwo(){
  const unlocked=isWorldTwoUnlocked();
  const done=world2Completed.length;
  const total=world2Missions.length;
  const pct=Math.round(done/total*100);

  const card=document.getElementById('world2Card');
  const btn=document.getElementById('world2Btn');
  const lock=document.getElementById('world2Lock');
  const status=document.getElementById('world2Status');
  const progress=document.getElementById('world2Progress');
  const pctEl=document.getElementById('world2ProgressPct');
  const count=document.getElementById('world2Count');

  card?.classList.toggle('locked',!unlocked);
  card?.classList.toggle('active',unlocked);
  card?.classList.toggle('unlocked',unlocked);
  card?.setAttribute('aria-disabled',unlocked?'false':'true');

  if(lock){
    lock.textContent=unlocked?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';
    lock.classList.toggle('lock',!unlocked);
    lock.classList.toggle('success',unlocked);
  }
  if(status){
    status.textContent=unlocked
      ? (world2BossCompleted?'Monde terminé — la Sentinelle est vaincue.':'Premières Batailles est disponible.')
      : 'Bats le Gardien des 64 Cases pour continuer.';
  }
  if(count) count.textContent=`${done} / ${total} missions`;
  if(pctEl) pctEl.textContent=`${pct}%`;
  if(progress) progress.style.width=`${pct}%`;

  if(btn){
    btn.disabled=!unlocked;
    btn.textContent=unlocked
      ? (world2BossCompleted?'Rejouer le Monde 02':'Entrer dans le Monde 02')
      : 'Vaincre le Boss du Monde 01';
    btn.onclick=()=>{ if(isWorldTwoUnlocked()) openWorldTwoHub(); };
  }

  renderWorldTwoBoss();
}

function renderWorld2Map(){
  const map=document.getElementById('missionMapTwo');
  if(!map) return;
  map.innerHTML='';

  const nextId=Math.min(world2Completed.length+1,world2Missions.length);
  world2Missions.forEach(m=>{
    const done=world2Completed.includes(m.id);
    const available=done || m.id===nextId;
    const n=document.createElement('article');
    n.className='mission-node '+(done?'completed':available?'available':'locked');
    n.innerHTML=`
      <div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div>
      <div class="mission-node-icon">${done?'✓':m.icon}</div>
      <h3>${m.title}</h3>
      <p>${done?'Mission validée':available?m.desc:'Termine la mission précédente.'}</p>
      <button ${available?'':'disabled'}>${done?'Rejouer':available?'Jouer':'Verrouillée'}</button>`;
    n.querySelector('button').onclick=()=>{ if(available) openWorld2Mission(m.id); };
    map.appendChild(n);
  });

  const pct=Math.round(world2Completed.length/world2Missions.length*100);
  const h=document.getElementById('hubProgressTwo');
  const b=document.getElementById('hubProgressBarTwo');
  if(h) h.textContent=`${world2Completed.length} / ${world2Missions.length} missions`;
  if(b) b.style.width=pct+'%';

  renderWorldTwoBoss();
}

function openWorldTwoHub(){
  if(!isWorldTwoUnlocked()) return;
  renderWorld2Map();
  const hub=document.getElementById('missionHubTwo');
  if(!hub) return;
  hub.classList.add('open');
  hub.setAttribute('aria-hidden','false');
}

function closeWorld2Hub(){
  const hub=document.getElementById('missionHubTwo');
  if(!hub) return;
  hub.classList.remove('open');
  hub.setAttribute('aria-hidden','true');
}

document.getElementById('closeMissionHubTwo')?.addEventListener('click',closeWorld2Hub);
document.querySelector('#missionHubTwo .mission-hub-backdrop')?.addEventListener('click',closeWorld2Hub);

let activeWorld2Mission=null;
function openWorld2Mission(id){setMissionDifficulty('easy');
  clearMissionSuccess();resetMissionRuntime();
  configureMissionFooter('world2');
  const m=world2Missions.find(x=>x.id===id);
  if(!m) return;
  activeWorld2Mission=m;
  currentMissionId=200+id;
  currentCompleted=world2Completed.includes(id);

  missionEyebrow.textContent=`MONDE 02 — MISSION ${id}/${world2Missions.length}`;
  missionTitle.textContent=m.title;
  missionDescription.textContent=m.desc;
  setNeutralMissionObjective(m.objective);
  missionReward.textContent=`Récompense : +${m.reward} XP`;
  missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Observe avant de cliquer.';
  nextMissionBtn.disabled=true;
  nextMissionBtn.textContent='Mission suivante →';

  buildEmptyDemo();
  if(m.origin){
    if(m.type==='knight') placePiece(m.origin,'♘');
    if(m.type==='rook') placePiece(m.origin,'♖');
  }

  closeWorld2Hub();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function renderWorldTwoBoss(){
  const btn=document.getElementById('world2BossBtn');
  const card=document.getElementById('world2BossCard');
  if(!btn) return;

  const unlocked=world2Completed.length>=world2Missions.length || world2BossCompleted;

  if(card){
    card.classList.toggle('boss-locked',!unlocked);
    card.classList.toggle('boss-ready',unlocked && !world2BossCompleted);
    card.classList.toggle('boss-completed',!!world2BossCompleted);
    card.setAttribute('aria-disabled',unlocked?'false':'true');
  }

  btn.disabled=!unlocked;
  btn.classList.toggle('boss-live',unlocked);

  if(world2BossCompleted){
    btn.textContent='Rejouer';
  }else if(unlocked){
    btn.textContent='Affronter la Sentinelle';
  }else{
    btn.textContent='Boss verrouillé';
  }

  btn.onclick=()=>{
    if(!unlocked) return;
    openWorldTwoBossMission();
  };
}

function openWorldTwoBossMission(){setMissionDifficulty('easy');
  clearMissionSuccess();resetMissionRuntime();
  currentMissionId=299;
  currentCompleted=!!world2BossCompleted;
  activeWorld2Mission=null;

  missionEyebrow.textContent='BOSS — MONDE 02';
  missionTitle.textContent='La Sentinelle des Menaces';
  missionDescription.textContent=world2BossCompleted
    ? 'Boss déjà vaincu. Tu peux rejouer cette épreuve librement.'
    : 'Épreuve finale de Premières Batailles.';
  missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';
  missionReward.textContent=world2BossCompleted
    ? 'Entraînement libre — aucune récompense principale supplémentaire'
    : 'Récompense : +200 XP + Badge Sentinelle';
  missionStatus.textContent=world2BossCompleted
    ? 'Appuie sur « Rejouer » pour lancer une nouvelle tentative.'
    : 'Observe les coordonnées et trouve la bonne case.';

  buildEmptyDemo();

  const resetBtn=document.getElementById('resetMission');
  if(world2BossCompleted){
    if(resetBtn){
      resetBtn.style.display='';
      resetBtn.disabled=false;
      resetBtn.textContent='Rejouer';
    }
    nextMissionBtn.disabled=false;
    nextMissionBtn.textContent='Mission suivante → Monde 03';
  }else{
    if(resetBtn){
      resetBtn.style.display='none';
      resetBtn.disabled=true;
    }
    nextMissionBtn.disabled=true;
    nextMissionBtn.textContent='Mission suivante →';
  }

  closeWorld2Hub();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}


function completeWorldTwoMission(m){
  if(!m) return;
  if(!world2Completed.includes(m.id)){
    world2Completed.push(m.id);
    world2Completed.sort((a,b)=>a-b);
    safeStorage.setItem(WORLD2_KEY,JSON.stringify(world2Completed));
    addXP?.(m.reward);
    missionReward.textContent=`Récompenses obtenues : +${m.reward} XP • +${Math.max(1,Math.round(m.reward/20))} ETS`;
  }else{
    lastRewardPayload=null;
    missionReward.textContent='Entraînement validé — récompense principale déjà obtenue.';
  }
  currentCompleted=true;
  setMissionSuccess('Mission réussie !');
  renderWorldTwo();
  renderWorld2Map();

  const next=world2Missions.find(x=>x.id===m.id+1);
  if(next){
    nextMissionBtn.disabled=false;
    nextMissionBtn.textContent='Mission suivante →';
    nextMissionBtn.onclick=()=>openWorld2Mission(next.id);
  }else{
    nextMissionBtn.disabled=false;
    renderWorldTwoBoss();
    nextMissionBtn.textContent='Affronter le Boss du Monde 02';
    nextMissionBtn.onclick=()=>openWorldTwoBossMission();
  }
}

function completeWorldTwoBoss(){
  if(!world2BossCompleted){
    world2BossCompleted=true;
    safeStorage.setItem(WORLD2_BOSS_KEY,'1');
    addXP?.(200);
  }
  currentCompleted=true;
  setMissionSuccess('Boss vaincu ! Monde 02 terminé.');
  missionReward.textContent='Récompenses obtenues : +200 XP • Badge Sentinelle';
  nextMissionBtn.disabled=false;
  nextMissionBtn.textContent='Voir la prochaine étape';
  nextMissionBtn.onclick=()=>{
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.querySelector('#aventure')?.scrollIntoView({behavior:'smooth'});
  };
  renderWorldTwo();
}


function openWorldOneHubReplay(){
  renderMissionMap();
  const hub=document.getElementById('missionHub');
  if(!hub) return;
  hub.classList.add('open');
  hub.setAttribute('aria-hidden','false');
}




function isFirstWorldOneCompletion(id){
  return !completedIds.includes(id);
}


// ===== v26: World 03 — Royaume des Tacticiens =====
const WORLD3_KEY='echectuto-world3-progress-v26';
const WORLD3_BOSS_KEY='echectuto-world3-boss-v26';

let world3Completed=[];
try{
  world3Completed=JSON.parse(safeStorage.getItem(WORLD3_KEY)||'[]');
}catch(e){
  world3Completed=[];
}
if(!Array.isArray(world3Completed)) world3Completed=[];
let world3BossCompleted=safeStorage.getItem(WORLD3_BOSS_KEY)==='1';

const world3Missions=[
  {id:1,icon:'♞',title:'La fourchette',desc:'Un cavalier peut attaquer plusieurs pièces importantes en un seul coup.',objective:'Joue le coup qui crée une fourchette royale. Sélectionne d’abord ta pièce, puis sa case d’arrivée.',reward:140,
   position:{b5:'♘',e8:'♚',a8:'♜',d8:'♛',g8:'♞',e1:'♔'},move:{from:'b5',to:'c7'},success:'Fourchette réussie : le cavalier attaque simultanément le roi et la tour.'},
  {id:2,icon:'📌',title:'Le clouage',desc:'Immobilise une pièce parce que son déplacement exposerait le roi.',objective:'Joue le coup de fou qui crée un clouage sur le cavalier noir.',reward:150,
   position:{c4:'♗',c6:'♞',e8:'♚',a8:'♜',e1:'♔'},move:{from:'c4',to:'b5'},success:'Clouage créé : le cavalier c6 ne peut plus bouger librement devant son roi.'},
  {id:3,icon:'↗',title:'L’enfilade',desc:'Force une pièce de grande valeur à bouger pour gagner celle qui se trouve derrière.',objective:'Trouve le coup de tour qui force le roi à quitter la ligne et expose la dame.',reward:160,
   position:{e1:'♖',e8:'♚',e7:'♛',a8:'♜',g1:'♔'},move:{from:'e1',to:'e6'},success:'Enfilade trouvée : l’échec force le roi et laisse la dame exposée sur la colonne.'},
  {id:4,icon:'✦',title:'Attaque découverte',desc:'Déplace une pièce avec tempo pour libérer l’attaque d’une autre.',objective:'Déplace le cavalier afin de découvrir l’attaque du fou sur la dame noire.',reward:170,
   position:{b1:'♗',d3:'♘',h7:'♛',e8:'♚',e1:'♔'},move:{from:'d3',to:'f4'},success:'Attaque découverte réussie : le déplacement du cavalier libère la diagonale du fou.'},
  {id:5,icon:'◎',title:'Tactique ou calme ?',desc:'Une bonne position ne contient pas toujours une combinaison forcée. Savoir jouer un coup utile est aussi une compétence tactique.',objective:'Il n’y a pas de combinaison gagnante immédiate. Joue le coup calme qui donne une case de fuite au roi.',reward:190,
   position:{g1:'♔',d1:'♕',a1:'♖',f3:'♘',g2:'♙',h2:'♙',g8:'♚',d8:'♛'},move:{from:'h2',to:'h3'},success:'Exact : tu n’as pas inventé une tactique. h3 améliore simplement la sécurité du roi.'}
];

function isWorldThreeUnlocked(){
  return world2BossCompleted || safeStorage.getItem(WORLD2_BOSS_KEY)==='1';
}

function renderWorldThree(){
  const unlocked=isWorldThreeUnlocked();
  const done=world3Completed.length;
  const total=world3Missions.length;
  const pct=Math.round(done/total*100);

  const card=document.getElementById('world3Card');
  const btn=document.getElementById('world3Btn');
  const lock=document.getElementById('world3Lock');
  const status=document.getElementById('world3Status');

  card?.classList.toggle('locked',!unlocked);
  card?.classList.toggle('unlocked',unlocked);
  card?.setAttribute('aria-disabled',unlocked?'false':'true');

  if(lock){
    lock.textContent=unlocked?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';
    lock.classList.toggle('lock',!unlocked);
    lock.classList.toggle('success',unlocked);
  }
  if(status){
    status.textContent=unlocked
      ? (world3BossCompleted?'Monde terminé — Viper est vaincu.':'Les tactiques sont maintenant accessibles.')
      : 'Vaincs La Sentinelle des Menaces pour continuer.';
  }
  document.getElementById('world3Count')?.replaceChildren(document.createTextNode(`${done} / ${total} missions`));
  const pctEl=document.getElementById('world3ProgressPct');
  const bar=document.getElementById('world3Progress');
  if(pctEl) pctEl.textContent=`${pct}%`;
  if(bar) bar.style.width=`${pct}%`;

  if(btn){
    btn.disabled=!unlocked;
    btn.textContent=unlocked ? (world3BossCompleted?'Rejouer le Monde 03':'Entrer dans le Monde 03') : 'Vaincre le Boss du Monde 02';
    btn.onclick=()=>{ if(unlocked) openWorldThreeHub(); };
  }
  renderWorldThreeBoss();
}

function renderWorld3Map(){
  const map=document.getElementById('missionMapThree');
  if(!map) return;
  map.innerHTML='';
  const nextId=Math.min(world3Completed.length+1,world3Missions.length);

  world3Missions.forEach(m=>{
    const done=world3Completed.includes(m.id);
    const available=done || m.id===nextId || world3BossCompleted;
    const node=document.createElement('article');
    node.className='mission-node '+(done?'completed':available?'available':'locked');
    node.innerHTML=`
      <div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div>
      <div class="mission-node-icon">${done?'✓':m.icon}</div>
      <h3>${m.title}</h3>
      <p>${done?'Mission validée — entraînement libre':available?m.desc:'Termine la mission précédente.'}</p>
      <button ${available?'':'disabled'}>${done?'Rejouer':available?'Jouer':'Verrouillée'}</button>`;
    node.querySelector('button').onclick=()=>{ if(available) openWorld3Mission(m.id); };
    map.appendChild(node);
  });

  const pct=Math.round(world3Completed.length/world3Missions.length*100);
  const hp=document.getElementById('hubProgressThree');
  const hb=document.getElementById('hubProgressBarThree');
  if(hp) hp.textContent=`${world3Completed.length} / ${world3Missions.length} missions`;
  if(hb) hb.style.width=pct+'%';
  renderWorldThreeBoss();
}

function openWorldThreeHub(){
  if(!isWorldThreeUnlocked()) return;
  renderWorld3Map();
  const hub=document.getElementById('missionHubThree');
  hub?.classList.add('open');
  hub?.setAttribute('aria-hidden','false');
}

function closeWorld3Hub(){
  const hub=document.getElementById('missionHubThree');
  hub?.classList.remove('open');
  hub?.setAttribute('aria-hidden','true');
}

document.getElementById('closeMissionHubThree')?.addEventListener('click',closeWorld3Hub);
document.querySelector('#missionHubThree .mission-hub-backdrop')?.addEventListener('click',closeWorld3Hub);

let activeWorld3Mission=null;

function openWorld3Mission(id){setMissionDifficulty('easy');
  clearMissionSuccess();resetMissionRuntime();
  const m=world3Missions.find(x=>x.id===id);
  if(!m) return;
  activeWorld3Mission=m;
  activeWorld2Mission=null;
  currentMissionId=300+id;
  currentCompleted=world3Completed.includes(id);

  missionEyebrow.textContent=`MONDE 03 — MISSION ${id}/${world3Missions.length}`;
  missionTitle.textContent=m.title;
  missionDescription.textContent=m.desc;
  setNeutralMissionObjective(m.objective);
  missionReward.textContent=`Récompense : +${m.reward} XP`;
  missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Observe la position avant de répondre.';
  nextMissionBtn.disabled=true;
  nextMissionBtn.textContent='Mission suivante →';

  const resetBtn=document.getElementById('resetMission');
  if(resetBtn){
    resetBtn.style.display='';
    resetBtn.disabled=false;
    resetBtn.textContent='Recommencer';
  }

  loadRealPosition(m);
  missionStatus.textContent=currentCompleted?'Mission déjà validée — rejoue le coup sur l’échiquier.':'Sélectionne une pièce puis joue le meilleur coup.';
  currentCompleted=false;
  closeWorld3Hub();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function completeWorldThreeMission(m){
  if(!m) return;
  const first=!world3Completed.includes(m.id);
  if(first){
    world3Completed.push(m.id);
    world3Completed.sort((a,b)=>a-b);
    safeStorage.setItem(WORLD3_KEY,JSON.stringify(world3Completed));
    try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}
  }
  currentCompleted=true;
  setMissionSuccess('Tactique trouvée !');
  renderWorldThree();
  renderWorld3Map();

  const next=world3Missions.find(x=>x.id===m.id+1);
  nextMissionBtn.disabled=false;
  if(next){
    nextMissionBtn.textContent='Mission suivante →';
    nextMissionBtn.onclick=()=>openWorld3Mission(next.id);
  }else{
    nextMissionBtn.textContent='Affronter Viper';
    nextMissionBtn.onclick=()=>openWorldThreeBossMission();
  }
}

function renderWorldThreeBoss(){
  const btn=document.getElementById('world3BossBtn');
  const card=document.getElementById('world3BossCard');
  if(!btn) return;
  const unlocked=world3Completed.length>=world3Missions.length || world3BossCompleted;

  card?.classList.toggle('boss-locked',!unlocked);
  card?.classList.toggle('boss-ready',unlocked&&!world3BossCompleted);
  card?.classList.toggle('boss-completed',world3BossCompleted);

  btn.disabled=!unlocked;
  btn.classList.toggle('boss-live',unlocked);
  btn.textContent=world3BossCompleted?'Rejouer':unlocked?'Affronter Viper':'Boss verrouillé';
  btn.onclick=()=>{ if(unlocked) openWorldThreeBossMission(); };
}

function openWorldThreeBossMission(){setMissionDifficulty('easy');
  clearMissionSuccess();resetMissionRuntime();
  currentMissionId=399;
  currentCompleted=!!world3BossCompleted;
  activeWorld3Mission=null;

  missionEyebrow.textContent='BOSS — MONDE 03';
  missionTitle.textContent='Viper, l’Œil Tactique';
  missionDescription.textContent=world3BossCompleted
    ? 'Viper a déjà été vaincu. Tu peux rejouer le duel.'
    : 'Épreuve finale du Royaume des Tacticiens.';
  missionObjective.innerHTML='Viper menace ton roi. Trouve et joue le coup tactique qui retourne immédiatement la position.';
  missionReward.textContent=world3BossCompleted
    ? 'Entraînement libre — aucune récompense principale supplémentaire'
    : 'Récompense : +300 XP + Badge Œil Tactique';
  missionStatus.textContent=world3BossCompleted
    ? 'Appuie sur « Rejouer » pour une nouvelle tentative.'
    : 'Aucune aide directe : sélectionne la bonne pièce et joue la combinaison.';

  loadRealPosition({position:{g1:'♔',d1:'♕',f3:'♘',c4:'♗',g8:'♚',d8:'♛',f7:'♟',h7:'♟'},move:{from:'f3',to:'g5'},success:'Coup tactique trouvé.'});
  currentCompleted=false;

  const resetBtn=document.getElementById('resetMission');
  if(world3BossCompleted){
    if(resetBtn){resetBtn.style.display='';resetBtn.disabled=false;resetBtn.textContent='Rejouer';}
  }else{
    if(resetBtn){resetBtn.style.display='none';resetBtn.disabled=true;}
  }
  nextMissionBtn.disabled=true;
  nextMissionBtn.textContent='Mission suivante →';

  closeWorld3Hub();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}


// ===== v27: World 04 — Royaume du Mat =====
const WORLD4_KEY='echectuto-world4-progress-v27';
const WORLD4_BOSS_KEY='echectuto-world4-boss-v27';
let world4Completed=[];
try{world4Completed=JSON.parse(safeStorage.getItem(WORLD4_KEY)||'[]')}catch(e){world4Completed=[]}
if(!Array.isArray(world4Completed)) world4Completed=[];
let world4BossCompleted=safeStorage.getItem(WORLD4_BOSS_KEY)==='1';

const world4Missions=[
 {id:1,icon:'♚',title:'Reconnaître l’échec',desc:'Le roi est attaqué : identifie la case critique.',objective:'Trouve la case <b>e8</b>.',target:'e8',reward:180},
 {id:2,icon:'▦',title:'Fermer une fuite',desc:'Un mat se construit en contrôlant les sorties du roi.',objective:'Trouve la case de fuite <b>h7</b>.',target:'h7',reward:190},
 {id:3,icon:'♜',title:'Mat de la dernière rangée',desc:'Reconnais le danger d’un roi enfermé derrière ses pions.',objective:'Trouve la case tactique <b>e8</b>.',target:'e8',reward:210},
 {id:4,icon:'♛',title:'Dame et roi coordonnés',desc:'La dame donne le mat mais doit être correctement soutenue.',objective:'Trouve la case de mat <b>h7</b>.',target:'h7',reward:230},
 {id:5,icon:'★',title:'Mat en un',desc:'Aucune indication tactique supplémentaire : observe toutes les réponses du roi.',objective:'Trouve la case décisive <b>g7</b>.',target:'g7',reward:260}
];

function isWorldFourUnlocked(){return world3BossCompleted||safeStorage.getItem(WORLD3_BOSS_KEY)==='1'}

function renderWorldFour(){
 const unlocked=isWorldFourUnlocked(), done=world4Completed.length, total=world4Missions.length, pct=Math.round(done/total*100);
 const card=document.getElementById('world4Card'), btn=document.getElementById('world4Btn'), lock=document.getElementById('world4Lock');
 card?.classList.toggle('locked',!unlocked); card?.classList.toggle('unlocked',unlocked); card?.setAttribute('aria-disabled',unlocked?'false':'true');
 if(lock){lock.textContent=unlocked?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';lock.classList.toggle('lock',!unlocked);lock.classList.toggle('success',unlocked)}
 const st=document.getElementById('world4Status'); if(st) st.textContent=unlocked?(world4BossCompleted?'Monde terminé — Le Roi de Fer est vaincu.':'Les secrets du mat sont accessibles.'):'Vaincs Viper pour continuer.';
 const cnt=document.getElementById('world4Count'), pe=document.getElementById('world4ProgressPct'), bar=document.getElementById('world4Progress');
 if(cnt)cnt.textContent=`${done} / ${total} missions`; if(pe)pe.textContent=`${pct}%`; if(bar)bar.style.width=pct+'%';
 if(btn){btn.disabled=!unlocked;btn.textContent=unlocked?(world4BossCompleted?'Rejouer le Monde 04':'Entrer dans le Monde 04'):'Vaincre Viper';btn.onclick=()=>{if(unlocked)openWorldFourHub()}}
 renderWorldFourBoss();
}
function renderWorld4Map(){
 const map=document.getElementById('missionMapFour'); if(!map)return; map.innerHTML='';
 const nextId=Math.min(world4Completed.length+1,world4Missions.length);
 world4Missions.forEach(m=>{const done=world4Completed.includes(m.id), available=done||m.id===nextId||world4BossCompleted;
  const node=document.createElement('article');node.className='mission-node '+(done?'completed':available?'available':'locked');
  node.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':available?m.desc:'Termine la mission précédente.'}</p><button ${available?'':'disabled'}>${done?'Rejouer':available?'Jouer':'Verrouillée'}</button>`;
  node.querySelector('button').onclick=()=>{if(available)openWorld4Mission(m.id)};map.appendChild(node)});
 const pct=Math.round(world4Completed.length/world4Missions.length*100), hp=document.getElementById('hubProgressFour'), hb=document.getElementById('hubProgressBarFour');
 if(hp)hp.textContent=`${world4Completed.length} / ${world4Missions.length} missions`;if(hb)hb.style.width=pct+'%';renderWorldFourBoss();
}
function openWorldFourHub(){if(!isWorldFourUnlocked())return;renderWorld4Map();const h=document.getElementById('missionHubFour');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorld4Hub(){const h=document.getElementById('missionHubFour');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}
document.getElementById('closeMissionHubFour')?.addEventListener('click',closeWorld4Hub);
document.querySelector('#missionHubFour .mission-hub-backdrop')?.addEventListener('click',closeWorld4Hub);
let activeWorld4Mission=null;
function openWorld4Mission(id){setMissionDifficulty('easy');
 clearMissionSuccess();resetMissionRuntime();const m=world4Missions.find(x=>x.id===id);if(!m)return;activeWorld4Mission=m;activeWorld3Mission=null;activeWorld2Mission=null;currentMissionId=400+id;currentCompleted=world4Completed.includes(id);
 missionEyebrow.textContent=`MONDE 04 — MISSION ${id}/${world4Missions.length}`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Observe avant de répondre.';
 nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorld4Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false);
}
function completeWorldFourMission(m){
 const first=!world4Completed.includes(m.id);if(first){world4Completed.push(m.id);world4Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD4_KEY,JSON.stringify(world4Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}
 currentCompleted=true;setMissionSuccess('Mat compris !');renderWorldFour();renderWorld4Map();const next=world4Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;
 if(next){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld4Mission(next.id)}else{nextMissionBtn.textContent='Affronter le Roi de Fer';nextMissionBtn.onclick=()=>openWorldFourBossMission()}
}
function renderWorldFourBoss(){
 const btn=document.getElementById('world4BossBtn'),card=document.getElementById('world4BossCard');if(!btn)return;const unlocked=world4Completed.length>=world4Missions.length||world4BossCompleted;
 card?.classList.toggle('boss-locked',!unlocked);card?.classList.toggle('boss-ready',unlocked&&!world4BossCompleted);card?.classList.toggle('boss-completed',world4BossCompleted);
 btn.disabled=!unlocked;btn.classList.toggle('boss-live',unlocked);btn.textContent=world4BossCompleted?'Rejouer':unlocked?'Affronter le Roi de Fer':'Boss verrouillé';btn.onclick=()=>{if(unlocked)openWorldFourBossMission()}
}
function openWorldFourBossMission(){setMissionDifficulty('easy');
 clearMissionSuccess();resetMissionRuntime();currentMissionId=499;currentCompleted=!!world4BossCompleted;activeWorld4Mission=null;
 missionEyebrow.textContent='BOSS — MONDE 04';missionTitle.textContent='Le Roi de Fer';missionDescription.textContent=world4BossCompleted?'Boss déjà vaincu — entraînement libre.':'Épreuve finale du Royaume du Mat.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world4BossCompleted?'Entraînement libre — récompense principale déjà obtenue':'Récompense : +400 XP + Badge Mat Royal';missionStatus.textContent=world4BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Trouve le coup final sans indice supplémentaire.';
 buildEmptyDemo();const r=document.getElementById('resetMission');if(world4BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';closeWorld4Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false);
}


// ===== v28: World 05 — Royaume du Développement =====
const WORLD5_KEY='echectuto-world5-progress-v28', WORLD5_BOSS_KEY='echectuto-world5-boss-v28';
let world5Completed=[];try{world5Completed=JSON.parse(safeStorage.getItem(WORLD5_KEY)||'[]')}catch(e){world5Completed=[]}
if(!Array.isArray(world5Completed))world5Completed=[];
let world5BossCompleted=safeStorage.getItem(WORLD5_BOSS_KEY)==='1';
const world5Missions=[
{id:1,icon:'◎',title:'Prendre le centre',desc:'Le centre donne de l’espace et facilite le développement.',objective:'Trouve une case centrale importante : <b>e4</b>.',target:'e4',reward:220},
{id:2,icon:'♘',title:'Sortir les cavaliers',desc:'Développe une pièce vers une case active.',objective:'Trouve la case naturelle du cavalier : <b>f3</b>.',target:'f3',reward:230},
{id:3,icon:'♗',title:'Libérer le fou',desc:'Ouvre une diagonale et place le fou sur une case utile.',objective:'Trouve la case de développement : <b>c4</b>.',target:'c4',reward:240},
{id:4,icon:'♔',title:'Mettre le roi à l’abri',desc:'Le roque améliore souvent la sécurité du roi et active une tour.',objective:'Identifie la case d’arrivée du roi après petit roque blanc : <b>g1</b>.',target:'g1',reward:260},
{id:5,icon:'⏱',title:'Ne pas perdre de temps',desc:'Évite de déplacer plusieurs fois la même pièce sans raison.',objective:'Repère la case de développement saine : <b>d2</b>.',target:'d2',reward:280},
{id:6,icon:'⚔',title:'Développement complet',desc:'Coordonne centre, pièces mineures et sécurité du roi.',objective:'Trouve la case clé <b>e2</b> qui complète la coordination.',target:'e2',reward:310}
];
function isWorldFiveUnlocked(){return world4BossCompleted||safeStorage.getItem(WORLD4_BOSS_KEY)==='1'}
function renderWorldFive(){
 const u=isWorldFiveUnlocked(),d=world5Completed.length,t=world5Missions.length,p=Math.round(d/t*100),c=document.getElementById('world5Card'),b=document.getElementById('world5Btn'),l=document.getElementById('world5Lock');
 c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);c?.setAttribute('aria-disabled',u?'false':'true');
 if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('lock',!u);l.classList.toggle('success',u)}
 const s=document.getElementById('world5Status');if(s)s.textContent=u?(world5BossCompleted?'Monde terminé — Orion est vaincu.':'Construis maintenant de vrais débuts de partie.'):'Vaincs le Roi de Fer pour continuer.';
 const n=document.getElementById('world5Count'),pe=document.getElementById('world5ProgressPct'),pb=document.getElementById('world5Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';
 if(b){b.disabled=!u;b.textContent=u?(world5BossCompleted?'Rejouer le Monde 05':'Entrer dans le Monde 05'):'Vaincre le Roi de Fer';b.onclick=()=>{if(u)openWorldFiveHub()}}renderWorldFiveBoss();
}
function renderWorld5Map(){
 const map=document.getElementById('missionMapFive');if(!map)return;map.innerHTML='';const next=Math.min(world5Completed.length+1,world5Missions.length);
 world5Missions.forEach(m=>{const done=world5Completed.includes(m.id),avail=done||m.id===next||world5BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':avail?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':avail?m.desc:'Termine la mission précédente.'}</p><button ${avail?'':'disabled'}>${done?'Rejouer':avail?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(avail)openWorld5Mission(m.id)};map.appendChild(n)});
 const p=Math.round(world5Completed.length/world5Missions.length*100),h=document.getElementById('hubProgressFive'),bar=document.getElementById('hubProgressBarFive');if(h)h.textContent=`${world5Completed.length} / ${world5Missions.length} missions`;if(bar)bar.style.width=p+'%';renderWorldFiveBoss();
}
function openWorldFiveHub(){if(!isWorldFiveUnlocked())return;renderWorld5Map();const h=document.getElementById('missionHubFive');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorld5Hub(){const h=document.getElementById('missionHubFive');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}
document.getElementById('closeMissionHubFive')?.addEventListener('click',closeWorld5Hub);document.querySelector('#missionHubFive .mission-hub-backdrop')?.addEventListener('click',closeWorld5Hub);
let activeWorld5Mission=null;
function openWorld5Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world5Missions.find(x=>x.id===id);if(!m)return;activeWorld5Mission=m;activeWorld4Mission=null;activeWorld3Mission=null;activeWorld2Mission=null;currentMissionId=500+id;currentCompleted=world5Completed.includes(id);missionEyebrow.textContent=`MONDE 05 — MISSION ${id}/${world5Missions.length}`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Choisis la case demandée.';nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorld5Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldFiveMission(m){const first=!world5Completed.includes(m.id);if(first){world5Completed.push(m.id);world5Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD5_KEY,JSON.stringify(world5Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}currentCompleted=true;setMissionSuccess('Principe de développement validé !');renderWorldFive();renderWorld5Map();const nx=world5Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;if(nx){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld5Mission(nx.id)}else{nextMissionBtn.textContent='Affronter Orion';nextMissionBtn.onclick=()=>openWorldFiveBossMission()}}
function renderWorldFiveBoss(){const b=document.getElementById('world5BossBtn'),c=document.getElementById('world5BossCard');if(!b)return;const u=world5Completed.length>=world5Missions.length||world5BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world5BossCompleted);c?.classList.toggle('boss-completed',world5BossCompleted);b.disabled=!u;b.classList.toggle('boss-live',u);b.textContent=world5BossCompleted?'Rejouer':u?'Affronter Orion':'Boss verrouillé';b.onclick=()=>{if(u)openWorldFiveBossMission()}}
function openWorldFiveBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=599;currentCompleted=!!world5BossCompleted;activeWorld5Mission=null;missionEyebrow.textContent='BOSS — MONDE 05';missionTitle.textContent='Orion, le Commandant';missionDescription.textContent=world5BossCompleted?'Orion a déjà été vaincu — entraînement libre.':'Épreuve finale du Royaume du Développement.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world5BossCompleted?'Entraînement libre — récompense principale déjà obtenue':'Récompense : +500 XP + Badge Commandant';missionStatus.textContent=world5BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Centre, développement, sécurité : choisis le point clé.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world5BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';closeWorld5Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}


// ===== v29: World 06 — Royaume du Stratège =====
const WORLD6_KEY='echectuto-world6-progress-v29', WORLD6_BOSS_KEY='echectuto-world6-boss-v29';
let world6Completed=[];try{world6Completed=JSON.parse(safeStorage.getItem(WORLD6_KEY)||'[]')}catch(e){world6Completed=[]}
if(!Array.isArray(world6Completed))world6Completed=[];
let world6BossCompleted=safeStorage.getItem(WORLD6_BOSS_KEY)==='1';

const world6Missions=[
{id:1,icon:'♟',title:'Lire la structure de pions',desc:'Les pions définissent les routes, faiblesses et plans possibles.',objective:'Identifie la case centrale structurante : <b>d5</b>.',target:'d5',reward:280},
{id:2,icon:'◇',title:'Créer une case forte',desc:'Une case difficile à chasser peut devenir un avant-poste.',objective:'Trouve la case forte : <b>e5</b>.',target:'e5',reward:300},
{id:3,icon:'♜',title:'Occuper une colonne ouverte',desc:'Les tours deviennent puissantes lorsqu’elles disposent d’une colonne libre.',objective:'Trouve la case d’entrée de la tour : <b>d1</b>.',target:'d1',reward:320},
{id:4,icon:'◎',title:'Gagner de l’espace',desc:'L’espace réduit les cases disponibles pour les pièces adverses.',objective:'Trouve la case d’avancée utile : <b>e5</b>.',target:'e5',reward:340},
{id:5,icon:'⇧',title:'Améliorer sa pire pièce',desc:'Avant d’attaquer, demande-toi quelle pièce participe le moins au jeu.',objective:'Trouve sa meilleure case d’amélioration : <b>c3</b>.',target:'c3',reward:370},
{id:6,icon:'🧭',title:'Construire un plan',desc:'Combine structure, espace, activité et sécurité avant de choisir ton plan.',objective:'Trouve la case stratégique clé : <b>c5</b>.',target:'c5',reward:410}
];

function isWorldSixUnlocked(){return world5BossCompleted||safeStorage.getItem(WORLD5_BOSS_KEY)==='1'}
function renderWorldSix(){
 const u=isWorldSixUnlocked(),d=world6Completed.length,t=world6Missions.length,p=Math.round(d/t*100),c=document.getElementById('world6Card'),b=document.getElementById('world6Btn'),l=document.getElementById('world6Lock');
 c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);c?.setAttribute('aria-disabled',u?'false':'true');
 if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('lock',!u);l.classList.toggle('success',u)}
 const s=document.getElementById('world6Status');if(s)s.textContent=u?(world6BossCompleted?'Monde terminé — Atlas est vaincu.':'La stratégie devient maintenant ton arme principale.'):'Vaincs Orion pour continuer.';
 const n=document.getElementById('world6Count'),pe=document.getElementById('world6ProgressPct'),pb=document.getElementById('world6Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';
 if(b){b.disabled=!u;b.textContent=u?(world6BossCompleted?'Rejouer le Monde 06':'Entrer dans le Monde 06'):'Vaincre Orion';b.onclick=()=>{if(u)openWorldSixHub()}}renderWorldSixBoss();
}
function renderWorld6Map(){
 const map=document.getElementById('missionMapSix');if(!map)return;map.innerHTML='';const next=Math.min(world6Completed.length+1,world6Missions.length);
 world6Missions.forEach(m=>{const done=world6Completed.includes(m.id),avail=done||m.id===next||world6BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':avail?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':avail?m.desc:'Termine la mission précédente.'}</p><button ${avail?'':'disabled'}>${done?'Rejouer':avail?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(avail)openWorld6Mission(m.id)};map.appendChild(n)});
 const p=Math.round(world6Completed.length/world6Missions.length*100),h=document.getElementById('hubProgressSix'),bar=document.getElementById('hubProgressBarSix');if(h)h.textContent=`${world6Completed.length} / ${world6Missions.length} missions`;if(bar)bar.style.width=p+'%';renderWorldSixBoss();
}
function openWorldSixHub(){if(!isWorldSixUnlocked())return;renderWorld6Map();const h=document.getElementById('missionHubSix');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorld6Hub(){const h=document.getElementById('missionHubSix');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}
document.getElementById('closeMissionHubSix')?.addEventListener('click',closeWorld6Hub);document.querySelector('#missionHubSix .mission-hub-backdrop')?.addEventListener('click',closeWorld6Hub);
let activeWorld6Mission=null;
function openWorld6Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world6Missions.find(x=>x.id===id);if(!m)return;activeWorld6Mission=m;activeWorld5Mission=null;activeWorld4Mission=null;activeWorld3Mission=null;activeWorld2Mission=null;currentMissionId=600+id;currentCompleted=world6Completed.includes(id);missionEyebrow.textContent=`MONDE 06 — MISSION ${id}/${world6Missions.length}`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Analyse la position avant de choisir.';nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorld6Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldSixMission(m){const first=!world6Completed.includes(m.id);if(first){world6Completed.push(m.id);world6Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD6_KEY,JSON.stringify(world6Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}currentCompleted=true;setMissionSuccess('Plan stratégique validé !');renderWorldSix();renderWorld6Map();const nx=world6Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;if(nx){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld6Mission(nx.id)}else{nextMissionBtn.textContent='Affronter Atlas';nextMissionBtn.onclick=()=>openWorldSixBossMission()}}
function renderWorldSixBoss(){const b=document.getElementById('world6BossBtn'),c=document.getElementById('world6BossCard');if(!b)return;const u=world6Completed.length>=world6Missions.length||world6BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world6BossCompleted);c?.classList.toggle('boss-completed',world6BossCompleted);b.disabled=!u;b.classList.toggle('boss-live',u);b.textContent=world6BossCompleted?'Rejouer':u?'Affronter Atlas':'Boss verrouillé';b.onclick=()=>{if(u)openWorldSixBossMission()}}
function openWorldSixBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=699;currentCompleted=!!world6BossCompleted;activeWorld6Mission=null;missionEyebrow.textContent='BOSS — MONDE 06';missionTitle.textContent='Atlas, l’Architecte';missionDescription.textContent=world6BossCompleted?'Atlas a déjà été vaincu — entraînement libre.':'Épreuve finale du Royaume du Stratège.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world6BossCompleted?'Entraînement libre — récompense principale déjà obtenue':'Récompense : +650 XP + Badge Architecte';missionStatus.textContent=world6BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Ne cherche pas seulement un coup : trouve le plan.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world6BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';closeWorld6Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}


// ===== v30: World 07 — Royaume des Finales =====
const WORLD7_KEY='echectuto-world7-progress-v30', WORLD7_BOSS_KEY='echectuto-world7-boss-v30';
let world7Completed=[];try{world7Completed=JSON.parse(safeStorage.getItem(WORLD7_KEY)||'[]')}catch(e){world7Completed=[]}
if(!Array.isArray(world7Completed))world7Completed=[];
let world7BossCompleted=safeStorage.getItem(WORLD7_BOSS_KEY)==='1';
const world7Missions=[
{id:1,icon:'♔',title:'Activer le roi',desc:'En finale, le roi devient une pièce de combat.',objective:'Trouve la case active du roi : <b>e4</b>.',target:'e4',reward:340},
{id:2,icon:'♙',title:'Créer un pion passé',desc:'Un pion sans pion adverse devant lui ni sur les colonnes voisines peut devenir décisif.',objective:'Trouve la case d’avancée : <b>d6</b>.',target:'d6',reward:360},
{id:3,icon:'□',title:'La règle du carré',desc:'Évalue rapidement si le roi peut rattraper un pion passé.',objective:'Trouve la case frontière du carré : <b>e5</b>.',target:'e5',reward:380},
{id:4,icon:'↔',title:'L’opposition',desc:'Dans les finales de rois, un seul tempo peut décider du résultat.',objective:'Prends l’opposition sur <b>e5</b>.',target:'e5',reward:410},
{id:5,icon:'♜',title:'Tour derrière le pion',desc:'La tour est souvent plus active derrière un pion passé.',objective:'Trouve la case active de la tour : <b>d1</b>.',target:'d1',reward:440},
{id:6,icon:'♛',title:'Promouvoir sans pat',desc:'Gagner ne suffit pas : il faut éviter de supprimer tous les coups adverses trop tôt.',objective:'Trouve la case de progression sûre : <b>g7</b>.',target:'g7',reward:470},
{id:7,icon:'⚖',title:'Convertir l’avantage',desc:'Simplifie lorsque cela rend la victoire plus claire, pas automatiquement.',objective:'Trouve la case clé de conversion : <b>c6</b>.',target:'c6',reward:520}
];
function isWorldSevenUnlocked(){return world6BossCompleted||safeStorage.getItem(WORLD6_BOSS_KEY)==='1'}
function renderWorldSeven(){
 const u=isWorldSevenUnlocked(),d=world7Completed.length,t=world7Missions.length,p=Math.round(d/t*100),c=document.getElementById('world7Card'),b=document.getElementById('world7Btn'),l=document.getElementById('world7Lock');
 c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);c?.setAttribute('aria-disabled',u?'false':'true');
 if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('lock',!u);l.classList.toggle('success',u)}
 const s=document.getElementById('world7Status');if(s)s.textContent=u?(world7BossCompleted?'Monde terminé — Fortress est vaincu.':'Les finales fondamentales sont maintenant accessibles.'):'Vaincs Atlas pour continuer.';
 const n=document.getElementById('world7Count'),pe=document.getElementById('world7ProgressPct'),pb=document.getElementById('world7Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';
 if(b){b.disabled=!u;b.textContent=u?(world7BossCompleted?'Rejouer le Monde 07':'Entrer dans le Monde 07'):'Vaincre Atlas';b.onclick=()=>{if(u)openWorldSevenHub()}}renderWorldSevenBoss();
}
function renderWorld7Map(){
 const map=document.getElementById('missionMapSeven');if(!map)return;map.innerHTML='';const next=Math.min(world7Completed.length+1,world7Missions.length);
 world7Missions.forEach(m=>{const done=world7Completed.includes(m.id),avail=done||m.id===next||world7BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':avail?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':avail?m.desc:'Termine la mission précédente.'}</p><button ${avail?'':'disabled'}>${done?'Rejouer':avail?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(avail)openWorld7Mission(m.id)};map.appendChild(n)});
 const p=Math.round(world7Completed.length/world7Missions.length*100),h=document.getElementById('hubProgressSeven'),bar=document.getElementById('hubProgressBarSeven');if(h)h.textContent=`${world7Completed.length} / ${world7Missions.length} missions`;if(bar)bar.style.width=p+'%';renderWorldSevenBoss();
}
function openWorldSevenHub(){if(!isWorldSevenUnlocked())return;renderWorld7Map();const h=document.getElementById('missionHubSeven');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorld7Hub(){const h=document.getElementById('missionHubSeven');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}
document.getElementById('closeMissionHubSeven')?.addEventListener('click',closeWorld7Hub);document.querySelector('#missionHubSeven .mission-hub-backdrop')?.addEventListener('click',closeWorld7Hub);
let activeWorld7Mission=null;
function openWorld7Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world7Missions.find(x=>x.id===id);if(!m)return;activeWorld7Mission=m;activeWorld6Mission=null;activeWorld5Mission=null;activeWorld4Mission=null;activeWorld3Mission=null;activeWorld2Mission=null;currentMissionId=700+id;currentCompleted=world7Completed.includes(id);missionEyebrow.textContent=`MONDE 07 — MISSION ${id}/${world7Missions.length}`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'En finale, calcule avant de choisir.';nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorld7Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldSevenMission(m){const first=!world7Completed.includes(m.id);if(first){world7Completed.push(m.id);world7Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD7_KEY,JSON.stringify(world7Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}currentCompleted=true;setMissionSuccess('Technique de finale validée !');renderWorldSeven();renderWorld7Map();const nx=world7Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;if(nx){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld7Mission(nx.id)}else{nextMissionBtn.textContent='Affronter Fortress';nextMissionBtn.onclick=()=>openWorldSevenBossMission()}}
function renderWorldSevenBoss(){const b=document.getElementById('world7BossBtn'),c=document.getElementById('world7BossCard');if(!b)return;const u=world7Completed.length>=world7Missions.length||world7BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world7BossCompleted);c?.classList.toggle('boss-completed',world7BossCompleted);b.disabled=!u;b.classList.toggle('boss-live',u);b.textContent=world7BossCompleted?'Rejouer':u?'Affronter Fortress':'Boss verrouillé';b.onclick=()=>{if(u)openWorldSevenBossMission()}}
function openWorldSevenBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=799;currentCompleted=!!world7BossCompleted;activeWorld7Mission=null;missionEyebrow.textContent='BOSS — MONDE 07';missionTitle.textContent='Fortress, le Gardien des Finales';missionDescription.textContent=world7BossCompleted?'Fortress a déjà été vaincu — entraînement libre.':'Épreuve finale du Royaume des Finales.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world7BossCompleted?'Entraînement libre — récompense principale déjà obtenue':'Récompense : +800 XP + Badge Gardien des Finales';missionStatus.textContent=world7BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Active le roi et trouve le chemin de conversion.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world7BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';closeWorld7Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}


// ===== v31: World 08 — Royaume du Calcul =====
const WORLD8_KEY='echectuto-world8-progress-v31', WORLD8_BOSS_KEY='echectuto-world8-boss-v31';
let world8Completed=[];try{world8Completed=JSON.parse(safeStorage.getItem(WORLD8_KEY)||'[]')}catch(e){world8Completed=[]}
if(!Array.isArray(world8Completed))world8Completed=[];
let world8BossCompleted=safeStorage.getItem(WORLD8_BOSS_KEY)==='1';
const world8Missions=[
{id:1,icon:'?',title:'Générer des candidats',desc:'Avant de calculer, sélectionne quelques coups plausibles au lieu d’examiner tout au hasard.',objective:'Identifie la case du candidat prioritaire : <b>e5</b>.',target:'e5',reward:420},
{id:2,icon:'1',title:'Calculer un coup plus loin',desc:'Imagine ton coup puis la meilleure réponse adverse.',objective:'Trouve la case finale de la première séquence : <b>f7</b>.',target:'f7',reward:450},
{id:3,icon:'2',title:'Comparer deux variantes',desc:'Deux coups semblent bons. Calcule leurs conséquences avant de choisir.',objective:'La meilleure branche mène à <b>d6</b>.',target:'d6',reward:480},
{id:4,icon:'3',title:'Voir trois demi-coups',desc:'Ton coup, sa réponse, puis ta continuation : garde la position mentale stable.',objective:'La séquence correcte termine sur <b>g5</b>.',target:'g5',reward:520},
{id:5,icon:'◌',title:'Visualiser sans déplacer',desc:'Construis la position future mentalement avant de toucher une pièce.',objective:'Après la séquence, la case critique est <b>c6</b>.',target:'c6',reward:560},
{id:6,icon:'⚠',title:'Détecter le coup intermédiaire',desc:'La réponse forcée n’est pas toujours la recapture immédiate.',objective:'Trouve la case du coup intermédiaire : <b>h7</b>.',target:'h7',reward:600},
{id:7,icon:'⚡',title:'Calcul sous pression',desc:'Choisis avec précision sans abandonner la vérification des réponses adverses.',objective:'La variante gagnante passe par <b>e7</b>.',target:'e7',reward:650}
];
function isWorldEightUnlocked(){return world7BossCompleted||safeStorage.getItem(WORLD7_BOSS_KEY)==='1'}
function renderWorldEight(){
 const u=isWorldEightUnlocked(),d=world8Completed.length,t=world8Missions.length,p=Math.round(d/t*100),c=document.getElementById('world8Card'),b=document.getElementById('world8Btn'),l=document.getElementById('world8Lock');
 c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);c?.setAttribute('aria-disabled',u?'false':'true');
 if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('lock',!u);l.classList.toggle('success',u)}
 const s=document.getElementById('world8Status');if(s)s.textContent=u?(world8BossCompleted?'Monde terminé — Mirror est vaincu.':'Ton entraînement au calcul est disponible.'):'Vaincs Fortress pour continuer.';
 const n=document.getElementById('world8Count'),pe=document.getElementById('world8ProgressPct'),pb=document.getElementById('world8Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';
 if(b){b.disabled=!u;b.textContent=u?(world8BossCompleted?'Rejouer le Monde 08':'Entrer dans le Monde 08'):'Vaincre Fortress';b.onclick=()=>{if(u)openWorldEightHub()}}renderWorldEightBoss();
}
function renderWorld8Map(){
 const map=document.getElementById('missionMapEight');if(!map)return;map.innerHTML='';const next=Math.min(world8Completed.length+1,world8Missions.length);
 world8Missions.forEach(m=>{const done=world8Completed.includes(m.id),avail=done||m.id===next||world8BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':avail?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':avail?m.desc:'Termine la mission précédente.'}</p><button ${avail?'':'disabled'}>${done?'Rejouer':avail?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(avail)openWorld8Mission(m.id)};map.appendChild(n)});
 const p=Math.round(world8Completed.length/world8Missions.length*100),h=document.getElementById('hubProgressEight'),bar=document.getElementById('hubProgressBarEight');if(h)h.textContent=`${world8Completed.length} / ${world8Missions.length} missions`;if(bar)bar.style.width=p+'%';renderWorldEightBoss();
}
function openWorldEightHub(){if(!isWorldEightUnlocked())return;renderWorld8Map();const h=document.getElementById('missionHubEight');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorld8Hub(){const h=document.getElementById('missionHubEight');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}
document.getElementById('closeMissionHubEight')?.addEventListener('click',closeWorld8Hub);document.querySelector('#missionHubEight .mission-hub-backdrop')?.addEventListener('click',closeWorld8Hub);
let activeWorld8Mission=null;
function openWorld8Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world8Missions.find(x=>x.id===id);if(!m)return;activeWorld8Mission=m;activeWorld7Mission=null;activeWorld6Mission=null;activeWorld5Mission=null;activeWorld4Mission=null;activeWorld3Mission=null;activeWorld2Mission=null;currentMissionId=800+id;currentCompleted=world8Completed.includes(id);missionEyebrow.textContent=`MONDE 08 — MISSION ${id}/${world8Missions.length}`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Calcule avant de cliquer.';nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorld8Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldEightMission(m){const first=!world8Completed.includes(m.id);if(first){world8Completed.push(m.id);world8Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD8_KEY,JSON.stringify(world8Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}currentCompleted=true;setMissionSuccess('Variante correctement calculée !');renderWorldEight();renderWorld8Map();const nx=world8Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;if(nx){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld8Mission(nx.id)}else{nextMissionBtn.textContent='Affronter Mirror';nextMissionBtn.onclick=()=>openWorldEightBossMission()}}
function renderWorldEightBoss(){const b=document.getElementById('world8BossBtn'),c=document.getElementById('world8BossCard');if(!b)return;const u=world8Completed.length>=world8Missions.length||world8BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world8BossCompleted);c?.classList.toggle('boss-completed',world8BossCompleted);b.disabled=!u;b.classList.toggle('boss-live',u);b.textContent=world8BossCompleted?'Rejouer':u?'Affronter Mirror':'Boss verrouillé';b.onclick=()=>{if(u)openWorldEightBossMission()}}
function openWorldEightBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=899;currentCompleted=!!world8BossCompleted;activeWorld8Mission=null;missionEyebrow.textContent='BOSS — MONDE 08';missionTitle.textContent='Mirror, l’Oracle';missionDescription.textContent=world8BossCompleted?'Mirror a déjà été vaincu — entraînement libre.':'Épreuve finale du Royaume du Calcul.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world8BossCompleted?'Entraînement libre — récompense principale déjà obtenue':'Récompense : +1000 XP + Badge Oracle du Calcul';missionStatus.textContent=world8BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Ne joue pas au premier regard. Calcule la meilleure défense adverse.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world8BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';closeWorld8Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}


// ===== v32: World 09 — Royaume de la Défense =====
const WORLD9_KEY='echectuto-world9-progress-v32', WORLD9_BOSS_KEY='echectuto-world9-boss-v32';
let world9Completed=[];try{world9Completed=JSON.parse(safeStorage.getItem(WORLD9_KEY)||'[]')}catch(e){world9Completed=[]}
if(!Array.isArray(world9Completed))world9Completed=[];
let world9BossCompleted=safeStorage.getItem(WORLD9_BOSS_KEY)==='1';
const world9Missions=[
{id:1,icon:'!',title:'Identifier la menace',desc:'Avant ton propre plan, demande-toi toujours ce que l’adversaire menace.',objective:'Repère la case visée par la menace : <b>f2</b>.',target:'f2',reward:500},
{id:2,icon:'🛡',title:'Défendre sans paniquer',desc:'Une menace n’impose pas toujours un recul. Cherche la réponse la plus efficace.',objective:'Trouve la case défensive : <b>e3</b>.',target:'e3',reward:530},
{id:3,icon:'↩',title:'Prophylaxie',desc:'Empêche le plan adverse avant qu’il ne devienne dangereux.',objective:'Trouve la case prophylactique : <b>h3</b>.',target:'h3',reward:570},
{id:4,icon:'♔',title:'Sécuriser le roi',desc:'Réduis les lignes d’attaque et donne des cases de fuite à ton roi.',objective:'Trouve la case de sécurité : <b>h2</b>.',target:'h2',reward:610},
{id:5,icon:'⛓',title:'Défendre une pièce clouée',desc:'Une pièce immobilisée peut devenir une cible. Défends la structure plutôt que le symptôme.',objective:'Trouve la case de soutien : <b>e2</b>.',target:'e2',reward:650},
{id:6,icon:'⚔',title:'Créer du contre-jeu',desc:'La meilleure défense peut forcer l’adversaire à répondre à ta propre menace.',objective:'Trouve la case de contre-jeu : <b>c5</b>.',target:'c5',reward:700},
{id:7,icon:'◎',title:'Tenir une position difficile',desc:'Simplifie les menaces, échange les bonnes pièces et garde les cases essentielles.',objective:'Trouve la case qui stabilise la position : <b>f6</b>.',target:'f6',reward:760}
];
function isWorldNineUnlocked(){return world8BossCompleted||safeStorage.getItem(WORLD8_BOSS_KEY)==='1'}
function renderWorldNine(){
 const u=isWorldNineUnlocked(),d=world9Completed.length,t=world9Missions.length,p=Math.round(d/t*100),c=document.getElementById('world9Card'),b=document.getElementById('world9Btn'),l=document.getElementById('world9Lock');
 c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);c?.setAttribute('aria-disabled',u?'false':'true');
 if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('lock',!u);l.classList.toggle('success',u)}
 const s=document.getElementById('world9Status');if(s)s.textContent=u?(world9BossCompleted?'Monde terminé — Aegis est vaincue.':'Ton entraînement défensif est disponible.'):'Vaincs Mirror pour continuer.';
 const n=document.getElementById('world9Count'),pe=document.getElementById('world9ProgressPct'),pb=document.getElementById('world9Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';
 if(b){b.disabled=!u;b.textContent=u?(world9BossCompleted?'Rejouer le Monde 09':'Entrer dans le Monde 09'):'Vaincre Mirror';b.onclick=()=>{if(u)openWorldNineHub()}}renderWorldNineBoss();
}
function renderWorld9Map(){
 const map=document.getElementById('missionMapNine');if(!map)return;map.innerHTML='';const next=Math.min(world9Completed.length+1,world9Missions.length);
 world9Missions.forEach(m=>{const done=world9Completed.includes(m.id),avail=done||m.id===next||world9BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':avail?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':avail?m.desc:'Termine la mission précédente.'}</p><button ${avail?'':'disabled'}>${done?'Rejouer':avail?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(avail)openWorld9Mission(m.id)};map.appendChild(n)});
 const p=Math.round(world9Completed.length/world9Missions.length*100),h=document.getElementById('hubProgressNine'),bar=document.getElementById('hubProgressBarNine');if(h)h.textContent=`${world9Completed.length} / ${world9Missions.length} missions`;if(bar)bar.style.width=p+'%';renderWorldNineBoss();
}
function openWorldNineHub(){if(!isWorldNineUnlocked())return;renderWorld9Map();const h=document.getElementById('missionHubNine');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorld9Hub(){const h=document.getElementById('missionHubNine');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}
document.getElementById('closeMissionHubNine')?.addEventListener('click',closeWorld9Hub);document.querySelector('#missionHubNine .mission-hub-backdrop')?.addEventListener('click',closeWorld9Hub);
let activeWorld9Mission=null;
function openWorld9Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world9Missions.find(x=>x.id===id);if(!m)return;activeWorld9Mission=m;activeWorld8Mission=null;activeWorld7Mission=null;activeWorld6Mission=null;activeWorld5Mission=null;activeWorld4Mission=null;activeWorld3Mission=null;activeWorld2Mission=null;currentMissionId=900+id;currentCompleted=world9Completed.includes(id);missionEyebrow.textContent=`MONDE 09 — MISSION ${id}/${world9Missions.length}`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Commence par identifier le plan adverse.';nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorld9Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldNineMission(m){const first=!world9Completed.includes(m.id);if(first){world9Completed.push(m.id);world9Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD9_KEY,JSON.stringify(world9Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}currentCompleted=true;setMissionSuccess('Défense correctement construite !');renderWorldNine();renderWorld9Map();const nx=world9Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;if(nx){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld9Mission(nx.id)}else{nextMissionBtn.textContent='Affronter Aegis';nextMissionBtn.onclick=()=>openWorldNineBossMission()}}
function renderWorldNineBoss(){const b=document.getElementById('world9BossBtn'),c=document.getElementById('world9BossCard');if(!b)return;const u=world9Completed.length>=world9Missions.length||world9BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world9BossCompleted);c?.classList.toggle('boss-completed',world9BossCompleted);b.disabled=!u;b.classList.toggle('boss-live',u);b.textContent=world9BossCompleted?'Rejouer':u?'Affronter Aegis':'Boss verrouillé';b.onclick=()=>{if(u)openWorldNineBossMission()}}
function openWorldNineBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=999;currentCompleted=!!world9BossCompleted;activeWorld9Mission=null;missionEyebrow.textContent='BOSS — MONDE 09';missionTitle.textContent='Aegis, la Sentinelle';missionDescription.textContent=world9BossCompleted?'Aegis a déjà été vaincue — entraînement libre.':'Épreuve finale du Royaume de la Défense.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world9BossCompleted?'Entraînement libre — récompense principale déjà obtenue':'Récompense : +1200 XP + Badge Bouclier Royal';missionStatus.textContent=world9BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Survis à l’attaque, puis retourne l’initiative.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world9BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;nextMissionBtn.textContent='Mission suivante →';closeWorld9Hub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}


// ===== v33: World 10 — Royaume de la Compétition =====
const WORLD10_KEY='echectuto-world10-progress-v33', WORLD10_BOSS_KEY='echectuto-world10-boss-v33';
let world10Completed=[];try{world10Completed=JSON.parse(safeStorage.getItem(WORLD10_KEY)||'[]')}catch(e){world10Completed=[]}if(!Array.isArray(world10Completed))world10Completed=[];
let world10BossCompleted=safeStorage.getItem(WORLD10_BOSS_KEY)==='1';
const world10Missions=[
{id:1,icon:"\u23f1",title:"G\u00e9rer son temps",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve le point de d\u00e9cision : <b>e4</b>.",target:"e4",reward:620},
{id:2,icon:"\u26a1",title:"Jouer sous pression",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case pratique : <b>c5</b>.",target:"c5",reward:650},
{id:3,icon:"\ud83c\udfaf",title:"Choisir ses priorit\u00e9s",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la priorit\u00e9 : <b>f7</b>.",target:"f7",reward:680},
{id:4,icon:"\ud83e\udde0",title:"Rester lucide",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case s\u00fbre : <b>h3</b>.",target:"h3",reward:720},
{id:5,icon:"\ud83d\udccb",title:"Pr\u00e9parer une partie",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve le point du plan : <b>d4</b>.",target:"d4",reward:760},
{id:6,icon:"\ud83d\udd01",title:"Rebondir apr\u00e8s une erreur",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la ressource : <b>e6</b>.",target:"e6",reward:800},
{id:7,icon:"\ud83c\udfc1",title:"Finir sous pression",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case d\u00e9cisive : <b>g7</b>.",target:"g7",reward:850}];
function isWorldTenUnlocked(){return world9BossCompleted||safeStorage.getItem(WORLD9_BOSS_KEY)==='1'}
function renderWorldTen(){const u=isWorldTenUnlocked(),d=world10Completed.length,t=7,p=Math.round(d/t*100),c=document.getElementById('world10Card'),b=document.getElementById('world10Btn'),l=document.getElementById('world10Lock');c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('success',u)};const s=document.getElementById('world10Status');if(s)s.textContent=u?(world10BossCompleted?'Monde terminé — Boss vaincu.':'Nouvelles épreuves disponibles.'):'Monde verrouillé.';const n=document.getElementById('world10Count'),pe=document.getElementById('world10ProgressPct'),pb=document.getElementById('world10Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';if(b){b.disabled=!u;b.textContent=u?(world10BossCompleted?'Rejouer le Monde 10':'Entrer dans le Monde 10'):'Monde verrouillé';b.onclick=()=>{if(u)openWorldTenHub()}}renderWorldTenBoss()}
function renderWorld10Map(){const map=document.getElementById('missionMapTen');if(!map)return;map.innerHTML='';const nx=Math.min(world10Completed.length+1,7);world10Missions.forEach(m=>{const done=world10Completed.includes(m.id),a=done||m.id===nx||world10BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':a?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':a?m.desc:'Termine la mission précédente.'}</p><button ${a?'':'disabled'}>${done?'Rejouer':a?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(a)openWorld10Mission(m.id)};map.appendChild(n)});const p=Math.round(world10Completed.length/7*100),h=document.getElementById('hubProgressTen'),bar=document.getElementById('hubProgressBarTen');if(h)h.textContent=`${world10Completed.length} / 7 missions`;if(bar)bar.style.width=p+'%';renderWorldTenBoss()}
function openWorldTenHub(){if(!isWorldTenUnlocked())return;renderWorld10Map();const h=document.getElementById('missionHubTen');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorldTenHub(){const h=document.getElementById('missionHubTen');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}document.getElementById('closeMissionHubTen')?.addEventListener('click',closeWorldTenHub);document.querySelector('#missionHubTen .mission-hub-backdrop')?.addEventListener('click',closeWorldTenHub);
let activeWorld10Mission=null;
function openWorld10Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world10Missions.find(x=>x.id===id);if(!m)return;activeWorld10Mission=m;currentMissionId=1000+id;currentCompleted=world10Completed.includes(id);missionEyebrow.textContent=`MONDE 10 — MISSION ${id}/7`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Analyse avant de répondre.';nextMissionBtn.disabled=true;const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorldTenHub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldTenMission(m){if(!world10Completed.includes(m.id)){world10Completed.push(m.id);world10Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD10_KEY,JSON.stringify(world10Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}currentCompleted=true;setMissionSuccess('Épreuve validée !');renderWorldTen();renderWorld10Map();const nx=world10Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;if(nx){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld10Mission(nx.id)}else{nextMissionBtn.textContent="Affronter Chronos, le Ma\u00eetre du Temps";nextMissionBtn.onclick=()=>openWorldTenBossMission()}}
function renderWorldTenBoss(){const b=document.getElementById('world10BossBtn'),c=document.getElementById('world10BossCard');if(!b)return;const u=world10Completed.length>=7||world10BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world10BossCompleted);c?.classList.toggle('boss-completed',world10BossCompleted);b.disabled=!u;b.textContent=world10BossCompleted?'Rejouer':u?"Affronter Chronos, le Ma\u00eetre du Temps":'Boss verrouillé';b.onclick=()=>{if(u)openWorldTenBossMission()}}
function openWorldTenBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=1099;currentCompleted=!!world10BossCompleted;activeWorld10Mission=null;missionEyebrow.textContent='BOSS — MONDE 10';missionTitle.textContent="Chronos, le Ma\u00eetre du Temps";missionDescription.textContent=world10BossCompleted?'Boss déjà vaincu — entraînement libre.':'Épreuve finale du monde.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world10BossCompleted?'Entraînement libre — récompense principale déjà obtenue':"R\u00e9compense : +1400 XP + Badge Comp\u00e9titeur";missionStatus.textContent=world10BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Mobilise toutes les compétences acquises.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world10BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;closeWorldTenHub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}


// ===== v33: World 11 — Royaume des Maîtres =====
const WORLD11_KEY='echectuto-world11-progress-v33', WORLD11_BOSS_KEY='echectuto-world11-boss-v33';
let world11Completed=[];try{world11Completed=JSON.parse(safeStorage.getItem(WORLD11_KEY)||'[]')}catch(e){world11Completed=[]}if(!Array.isArray(world11Completed))world11Completed=[];
let world11BossCompleted=safeStorage.getItem(WORLD11_BOSS_KEY)==='1';
const world11Missions=[
{id:1,icon:"\u265e",title:"Combiner tactique et strat\u00e9gie",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case charni\u00e8re : <b>d5</b>.",target:"d5",reward:760},
{id:2,icon:"\u265c",title:"Transformer l\u2019activit\u00e9",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve l\u2019infiltration : <b>c7</b>.",target:"c7",reward:800},
{id:3,icon:"\u265b",title:"Attaquer sans se d\u00e9couvrir",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case d\u2019\u00e9quilibre : <b>e6</b>.",target:"e6",reward:840},
{id:4,icon:"\u2654",title:"D\u00e9fendre puis contre-attaquer",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la ressource : <b>f5</b>.",target:"f5",reward:880},
{id:5,icon:"\u25c8",title:"Calculer un plan long",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve le point final : <b>h6</b>.",target:"h6",reward:930},
{id:6,icon:"\u2696",title:"Convertir un petit avantage",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case de conversion : <b>c6</b>.",target:"c6",reward:980},
{id:7,icon:"\u2605",title:"Position de ma\u00eetre",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve le meilleur point : <b>e5</b>.",target:"e5",reward:1050}];
function isWorldElevenUnlocked(){return world10BossCompleted||safeStorage.getItem(WORLD10_BOSS_KEY)==='1'}
function renderWorldEleven(){const u=isWorldElevenUnlocked(),d=world11Completed.length,t=7,p=Math.round(d/t*100),c=document.getElementById('world11Card'),b=document.getElementById('world11Btn'),l=document.getElementById('world11Lock');c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('success',u)};const s=document.getElementById('world11Status');if(s)s.textContent=u?(world11BossCompleted?'Monde terminé — Boss vaincu.':'Nouvelles épreuves disponibles.'):'Monde verrouillé.';const n=document.getElementById('world11Count'),pe=document.getElementById('world11ProgressPct'),pb=document.getElementById('world11Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';if(b){b.disabled=!u;b.textContent=u?(world11BossCompleted?'Rejouer le Monde 11':'Entrer dans le Monde 11'):'Monde verrouillé';b.onclick=()=>{if(u)openWorldElevenHub()}}renderWorldElevenBoss()}
function renderWorld11Map(){const map=document.getElementById('missionMapEleven');if(!map)return;map.innerHTML='';const nx=Math.min(world11Completed.length+1,7);world11Missions.forEach(m=>{const done=world11Completed.includes(m.id),a=done||m.id===nx||world11BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':a?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':a?m.desc:'Termine la mission précédente.'}</p><button ${a?'':'disabled'}>${done?'Rejouer':a?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(a)openWorld11Mission(m.id)};map.appendChild(n)});const p=Math.round(world11Completed.length/7*100),h=document.getElementById('hubProgressEleven'),bar=document.getElementById('hubProgressBarEleven');if(h)h.textContent=`${world11Completed.length} / 7 missions`;if(bar)bar.style.width=p+'%';renderWorldElevenBoss()}
function openWorldElevenHub(){if(!isWorldElevenUnlocked())return;renderWorld11Map();const h=document.getElementById('missionHubEleven');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorldElevenHub(){const h=document.getElementById('missionHubEleven');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}document.getElementById('closeMissionHubEleven')?.addEventListener('click',closeWorldElevenHub);document.querySelector('#missionHubEleven .mission-hub-backdrop')?.addEventListener('click',closeWorldElevenHub);
let activeWorld11Mission=null;
function openWorld11Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world11Missions.find(x=>x.id===id);if(!m)return;activeWorld11Mission=m;currentMissionId=1100+id;currentCompleted=world11Completed.includes(id);missionEyebrow.textContent=`MONDE 11 — MISSION ${id}/7`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Analyse avant de répondre.';nextMissionBtn.disabled=true;const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorldElevenHub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldElevenMission(m){
  const first=!world11Completed.includes(m.id);

  if(first){
    world11Completed.push(m.id);
    world11Completed.sort((a,b)=>a-b);
    safeStorage.setItem(WORLD11_KEY,JSON.stringify(world11Completed));

    // Reward is granted BEFORE the success state so the player always sees
    // the exact earned amounts in the victory overlay.
    grantAndShowMissionReward({
      xp:m.reward,
      stars:1,
      title:'Félicitations, vous avez gagné !',
      message:`Mission ${m.id}/7 — ${m.title} réussie.`
    });
  }else{
    // Replay: victory feedback remains visible, but anti-farming prevents duplicate gains.
    showVictoryReward({
      title:'Félicitations, mission réussie !',
      message:`${m.title} est de nouveau validée. Récompense principale déjà obtenue.`,
      xp:0,coins:0,stars:0,
      before:getEconomySnapshot(),
      after:getEconomySnapshot()
    });
  }

  currentCompleted=true;
  registerMissionSuccessRuntime();
  missionStatus.textContent='Épreuve validée !';
  missionStatus.classList.add('success-state');
  missionReward.textContent=first
    ?`Récompenses obtenues : +${m.reward} XP • +${Math.max(1,Math.round(m.reward/20))} ETS • +1 Étoile`
    :'Mission rejouée — récompense principale déjà obtenue.';

  renderWorldEleven();
  renderWorld11Map();

  const nx=world11Missions.find(x=>x.id===m.id+1);
  nextMissionBtn.disabled=false;
  if(nx){
    nextMissionBtn.textContent='Mission suivante →';
    nextMissionBtn.onclick=()=>openWorld11Mission(nx.id);
  }else{
    nextMissionBtn.textContent="Affronter Titan, le Maître";
    nextMissionBtn.onclick=()=>openWorldElevenBossMission();
  }
}
function renderWorldElevenBoss(){const b=document.getElementById('world11BossBtn'),c=document.getElementById('world11BossCard');if(!b)return;const u=world11Completed.length>=7||world11BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world11BossCompleted);c?.classList.toggle('boss-completed',world11BossCompleted);b.disabled=!u;b.textContent=world11BossCompleted?'Rejouer':u?"Affronter Titan, le Ma\u00eetre":'Boss verrouillé';b.onclick=()=>{if(u)openWorldElevenBossMission()}}
function openWorldElevenBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=1199;currentCompleted=!!world11BossCompleted;activeWorld11Mission=null;missionEyebrow.textContent='BOSS — MONDE 11';missionTitle.textContent="Titan, le Ma\u00eetre";missionDescription.textContent=world11BossCompleted?'Boss déjà vaincu — entraînement libre.':'Épreuve finale du monde.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world11BossCompleted?'Entraînement libre — récompense principale déjà obtenue':"R\u00e9compense : +1800 XP + Badge Ma\u00eetre";missionStatus.textContent=world11BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Mobilise toutes les compétences acquises.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world11BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;closeWorldElevenHub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}


// ===== v33: World 12 — La Citadelle =====
const WORLD12_KEY='echectuto-world12-progress-v33', WORLD12_BOSS_KEY='echectuto-world12-boss-v33';
let world12Completed=[];try{world12Completed=JSON.parse(safeStorage.getItem(WORLD12_KEY)||'[]')}catch(e){world12Completed=[]}if(!Array.isArray(world12Completed))world12Completed=[];
let world12BossCompleted=safeStorage.getItem(WORLD12_BOSS_KEY)==='1';
const world12Missions=[
{id:1,icon:"\u2160",title:"\u00c9preuve de vision",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case critique : <b>f6</b>.",target:"f6",reward:900},
{id:2,icon:"\u2161",title:"\u00c9preuve tactique",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve le coup d\u00e9cisif : <b>h7</b>.",target:"h7",reward:950},
{id:3,icon:"\u2162",title:"\u00c9preuve strat\u00e9gique",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve le point du plan : <b>d6</b>.",target:"d6",reward:1000},
{id:4,icon:"\u2163",title:"\u00c9preuve de finale",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case de conversion : <b>e6</b>.",target:"e6",reward:1050},
{id:5,icon:"\u2164",title:"\u00c9preuve de calcul",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la fin de variante : <b>g5</b>.",target:"g5",reward:1100},
{id:6,icon:"\u2165",title:"\u00c9preuve d\u00e9fensive",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la ressource : <b>c5</b>.",target:"c5",reward:1150},
{id:7,icon:"\u2166",title:"\u00c9preuve int\u00e9grale",desc:"\u00c9preuve avanc\u00e9e : applique les acquis pr\u00e9c\u00e9dents avant de choisir.",objective:"Trouve la case finale : <b>e7</b>.",target:"e7",reward:1250}];
function isWorldTwelveUnlocked(){return world11BossCompleted||safeStorage.getItem(WORLD11_BOSS_KEY)==='1'}
function renderWorldTwelve(){const u=isWorldTwelveUnlocked(),d=world12Completed.length,t=7,p=Math.round(d/t*100),c=document.getElementById('world12Card'),b=document.getElementById('world12Btn'),l=document.getElementById('world12Lock');c?.classList.toggle('locked',!u);c?.classList.toggle('unlocked',u);if(l){l.textContent=u?'MONDE DÉVERROUILLÉ':'MONDE VERROUILLÉ';l.classList.toggle('success',u)};const s=document.getElementById('world12Status');if(s)s.textContent=u?(world12BossCompleted?'Monde terminé — Boss vaincu.':'Nouvelles épreuves disponibles.'):'Monde verrouillé.';const n=document.getElementById('world12Count'),pe=document.getElementById('world12ProgressPct'),pb=document.getElementById('world12Progress');if(n)n.textContent=`${d} / ${t} missions`;if(pe)pe.textContent=p+'%';if(pb)pb.style.width=p+'%';if(b){b.disabled=!u;b.textContent=u?(world12BossCompleted?'Rejouer le Monde 12':'Entrer dans le Monde 12'):'Monde verrouillé';b.onclick=()=>{if(u)openWorldTwelveHub()}}renderWorldTwelveBoss()}
function renderWorld12Map(){const map=document.getElementById('missionMapTwelve');if(!map)return;map.innerHTML='';const nx=Math.min(world12Completed.length+1,7);world12Missions.forEach(m=>{const done=world12Completed.includes(m.id),a=done||m.id===nx||world12BossCompleted,n=document.createElement('article');n.className='mission-node '+(done?'completed':a?'available':'locked');n.innerHTML=`<div class="mission-node-index">MISSION ${String(m.id).padStart(2,'0')}</div><div class="mission-node-icon">${done?'✓':m.icon}</div><h3>${m.title}</h3><p>${done?'Mission validée — entraînement libre':a?m.desc:'Termine la mission précédente.'}</p><button ${a?'':'disabled'}>${done?'Rejouer':a?'Jouer':'Verrouillée'}</button>`;n.querySelector('button').onclick=()=>{if(a)openWorld12Mission(m.id)};map.appendChild(n)});const p=Math.round(world12Completed.length/7*100),h=document.getElementById('hubProgressTwelve'),bar=document.getElementById('hubProgressBarTwelve');if(h)h.textContent=`${world12Completed.length} / 7 missions`;if(bar)bar.style.width=p+'%';renderWorldTwelveBoss()}
function openWorldTwelveHub(){if(!isWorldTwelveUnlocked())return;renderWorld12Map();const h=document.getElementById('missionHubTwelve');h?.classList.add('open');h?.setAttribute('aria-hidden','false')}
function closeWorldTwelveHub(){const h=document.getElementById('missionHubTwelve');h?.classList.remove('open');h?.setAttribute('aria-hidden','true')}document.getElementById('closeMissionHubTwelve')?.addEventListener('click',closeWorldTwelveHub);document.querySelector('#missionHubTwelve .mission-hub-backdrop')?.addEventListener('click',closeWorldTwelveHub);
let activeWorld12Mission=null;
function openWorld12Mission(id){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();const m=world12Missions.find(x=>x.id===id);if(!m)return;activeWorld12Mission=m;currentMissionId=1200+id;currentCompleted=world12Completed.includes(id);missionEyebrow.textContent=`MONDE 12 — MISSION ${id}/7`;missionTitle.textContent=m.title;missionDescription.textContent=m.desc;setNeutralMissionObjective(m.objective);missionReward.textContent=`Récompense : +${m.reward} XP`;missionStatus.textContent=currentCompleted?'Mission déjà validée — entraînement libre.':'Analyse avant de répondre.';nextMissionBtn.disabled=true;const r=document.getElementById('resetMission');if(r){r.style.display='';r.disabled=false;r.textContent='Recommencer'}buildEmptyDemo();closeWorldTwelveHub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}
function completeWorldTwelveMission(m){if(!world12Completed.includes(m.id)){world12Completed.push(m.id);world12Completed.sort((a,b)=>a-b);safeStorage.setItem(WORLD12_KEY,JSON.stringify(world12Completed));try{grantAndShowMissionReward({xp:m.reward,stars:1,title:'Félicitations, vous avez gagné !',message:`${m.title} est validée.`})}catch(e){try{addXP?.(m.reward)}catch(_){}}}currentCompleted=true;setMissionSuccess('Épreuve validée !');renderWorldTwelve();renderWorld12Map();const nx=world12Missions.find(x=>x.id===m.id+1);nextMissionBtn.disabled=false;if(nx){nextMissionBtn.textContent='Mission suivante →';nextMissionBtn.onclick=()=>openWorld12Mission(nx.id)}else{nextMissionBtn.textContent="Affronter Le Grand Ma\u00eetre de la Citadelle";nextMissionBtn.onclick=()=>openWorldTwelveBossMission()}}
function renderWorldTwelveBoss(){const b=document.getElementById('world12BossBtn'),c=document.getElementById('world12BossCard');if(!b)return;const u=world12Completed.length>=7||world12BossCompleted;c?.classList.toggle('boss-locked',!u);c?.classList.toggle('boss-ready',u&&!world12BossCompleted);c?.classList.toggle('boss-completed',world12BossCompleted);b.disabled=!u;b.textContent=world12BossCompleted?'Rejouer':u?"Affronter Le Grand Ma\u00eetre de la Citadelle":'Boss verrouillé';b.onclick=()=>{if(u)openWorldTwelveBossMission()}}
function openWorldTwelveBossMission(){setMissionDifficulty('easy');clearMissionSuccess();resetMissionRuntime();currentMissionId=1299;currentCompleted=!!world12BossCompleted;activeWorld12Mission=null;missionEyebrow.textContent='BOSS — MONDE 12';missionTitle.textContent="Le Grand Ma\u00eetre de la Citadelle";missionDescription.textContent=world12BossCompleted?'Boss déjà vaincu — entraînement libre.':'Épreuve finale du monde.';missionObjective.innerHTML='Analyse la position et trouve la meilleure ressource sans indication de case.';missionReward.textContent=world12BossCompleted?'Entraînement libre — récompense principale déjà obtenue':"R\u00e9compense : +2500 XP + Badge Citadelle";missionStatus.textContent=world12BossCompleted?'Appuie sur « Rejouer » pour recommencer.':'Mobilise toutes les compétences acquises.';buildEmptyDemo();const r=document.getElementById('resetMission');if(world12BossCompleted){if(r){r.style.display='';r.disabled=false;r.textContent='Rejouer'}}else if(r){r.style.display='none';r.disabled=true}nextMissionBtn.disabled=true;closeWorldTwelveHub();modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!missionTimerRunning)startMissionTimer(false)}

// ===== v5: chess engine — castling, en passant, promotion, AI ladder, XP =====
const gameBoardEl=document.getElementById('gameBoard'),turnLabel=document.getElementById('turnLabel'),
gameStateLabel=document.getElementById('gameStateLabel'),gameLogEl=document.getElementById('gameLog'),
moveCountEl=document.getElementById('moveCount'),newGameBtn=document.getElementById('newGameBtn'),
undoBtn=document.getElementById('undoBtn'),aiMoveBtn=document.getElementById('aiMoveBtn'),
hintGameBtn=document.getElementById('hintGameBtn'),promotionPicker=document.getElementById('promotionPicker');

const PIECE_UNICODE={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};
const VALUES={P:100,N:320,B:330,R:500,Q:900,K:20000};
const AI_LEVELS={
 milo:{name:"Milo l'Apprenti",rating:300,avatar:'♞',desc:"Débutant curieux. Il voit les captures évidentes mais commet encore beaucoup d'erreurs.",depth:0,noise:1},
 nova:{name:"Nova",rating:500,avatar:'✦',desc:"Elle protège mieux ses pièces et recherche les échanges avantageux.",depth:1,noise:.65},
 guard:{name:"Le Garde",rating:700,avatar:'♜',desc:"Plus discipliné : il valorise le matériel, le centre et la sécurité du roi.",depth:1,noise:.3}
};
const GAME_PROFILE_KEY='echectuto-game-profile-v5';
let profile=JSON.parse(safeStorage.getItem(GAME_PROFILE_KEY)||'{"xp":0,"wins":0,"aiWinsById":{},"mastery":0}');
if(!profile.aiWinsById) profile.aiWinsById={};
if(typeof profile.mastery!=='number') profile.mastery=0;
// v190 audit: one XP ledger for missions and AI matches.
// Migrate the larger historic value without double-counting.
if(Number(profile.xp||0)>Number(playerEconomy.xp||0)){
  playerEconomy.xp=Number(profile.xp)||0;
  economySave();
}
profile.xp=Number(playerEconomy.xp)||0;
let currentAI='milo';
let matchStats={captures:0,coachUsed:false,result:null,xpEarned:0};
let pendingAIPostGame=false;
let pendingAIPostGameResult=null;

function initialChessBoard(){return[
 ['bR','bN','bB','bQ','bK','bB','bN','bR'],['bP','bP','bP','bP','bP','bP','bP','bP'],
 [null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],
 ['wP','wP','wP','wP','wP','wP','wP','wP'],['wR','wN','wB','wQ','wK','wB','wN','wR']
]}
let chessBoard,turn,selectedSquare,legalTargets,gameOver,moveHistory,snapshots,castling,enPassant,lastMove,pendingPromotion,resultAwarded;

const clone=b=>b.map(r=>r.slice()), colorOf=p=>p?p[0]:null,typeOf=p=>p?p[1]:null,
inBounds=(r,c)=>r>=0&&r<8&&c>=0&&c<8, sqName=(r,c)=>String.fromCharCode(97+c)+(8-r);

function resetGame(){
 chessBoard=initialChessBoard();turn='w';selectedSquare=null;legalTargets=[];gameOver=false;moveHistory=[];snapshots=[];
 castling={wK:true,wQ:true,bK:true,bQ:true};enPassant=null;lastMove=null;pendingPromotion=null;resultAwarded=false;
 matchStats={captures:0,coachUsed:false,result:null,xpEarned:0};
 gameLogEl.innerHTML='<p>Nouvelle partie. À toi de jouer.</p>';
 updateMatchObjective();
 renderGameBoard();
}
function saveProfile(){profile.xp=Number(playerEconomy.xp)||0;safeStorage.setItem(GAME_PROFILE_KEY,JSON.stringify(profile));renderProfile()}
function renderProfile(){
 profile.xp=Number(playerEconomy.xp)||0;
 const level=Math.floor(profile.xp/100)+1, within=profile.xp%100;
 document.getElementById('playerLevel').textContent=level;document.getElementById('playerXp').textContent=profile.xp;
 document.getElementById('aiWins').textContent=profile.wins;document.getElementById('playerXpBar').style.width=within+'%';
 document.getElementById('nextLevelText').textContent=`${100-within} XP avant le niveau ${level+1}`;
 renderAIUnlocks();
 try{renderClan()}catch{}
 try{renderCoachProfile()}catch{}
 try{renderChallenges()}catch{}
}
function isAIUnlocked(id){
 if(id==='milo') return true;
 if(id==='nova') return (profile.aiWinsById.milo||0)>=1;
 if(id==='guard') return (profile.aiWinsById.nova||0)>=1;
 return false;
}
function renderAIUnlocks(){
 document.querySelectorAll('.ai-level').forEach(btn=>{
   const unlocked=isAIUnlocked(btn.dataset.ai);
   btn.classList.toggle('locked',!unlocked);
   btn.disabled=!unlocked;
   if(!unlocked){
     btn.title=btn.dataset.ai==='nova'?'Bats Milo pour déverrouiller Nova':'Bats Nova pour déverrouiller Le Garde';
   } else btn.title='';
 });
}
function snapshot(){return{board:clone(chessBoard),turn,history:moveHistory.slice(),castling:{...castling},enPassant:enPassant?[...enPassant]:null,lastMove:lastMove?JSON.parse(JSON.stringify(lastMove)):null}}
function restore(s){chessBoard=clone(s.board);turn=s.turn;moveHistory=s.history.slice();castling={...s.castling};enPassant=s.enPassant?[...s.enPassant]:null;lastMove=s.lastMove;gameOver=false;selectedSquare=null;legalTargets=[]}

function attacks(board,r,c){
 const p=board[r][c];if(!p)return[];const col=colorOf(p),t=typeOf(p),out=[];
 if(t==='P'){const d=col==='w'?-1:1;for(const dc of[-1,1])if(inBounds(r+d,c+dc))out.push([r+d,c+dc]);return out}
 if(t==='N'){for(const[d,e]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])if(inBounds(r+d,c+e))out.push([r+d,c+e]);return out}
 if(t==='K'){for(let d=-1;d<=1;d++)for(let e=-1;e<=1;e++)if((d||e)&&inBounds(r+d,c+e))out.push([r+d,c+e]);return out}
 const dirs=[];if(t==='B'||t==='Q')dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);if(t==='R'||t==='Q')dirs.push([-1,0],[1,0],[0,-1],[0,1]);
 for(const[d,e]of dirs){let rr=r+d,cc=c+e;while(inBounds(rr,cc)){out.push([rr,cc]);if(board[rr][cc])break;rr+=d;cc+=e}}return out
}
function findKing(board,col){for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]===col+'K')return[r,c];return null}
function attacked(board,r,c,by){for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++)if(board[rr][cc]&&colorOf(board[rr][cc])===by&&attacks(board,rr,cc).some(x=>x[0]===r&&x[1]===c))return true;return false}
function inCheck(board,col){const k=findKing(board,col);return !k||attacked(board,k[0],k[1],col==='w'?'b':'w')}

function rawMoves(board,r,c,includeCastle=true){
 const p=board[r][c];if(!p)return[];const col=colorOf(p),enemy=col==='w'?'b':'w',t=typeOf(p),out=[];
 const add=(rr,cc)=>{if(!inBounds(rr,cc))return false;if(!board[rr][cc]){out.push([rr,cc]);return true}if(colorOf(board[rr][cc])===enemy)out.push([rr,cc]);return false};
 if(t==='P'){
  const d=col==='w'?-1:1,start=col==='w'?6:1;if(inBounds(r+d,c)&&!board[r+d][c]){out.push([r+d,c]);if(r===start&&!board[r+2*d][c])out.push([r+2*d,c])}
  for(const dc of[-1,1]){let rr=r+d,cc=c+dc;if(inBounds(rr,cc)&&board[rr][cc]&&colorOf(board[rr][cc])===enemy)out.push([rr,cc]);if(enPassant&&enPassant[0]===rr&&enPassant[1]===cc)out.push([rr,cc])}
 }else if(t==='N'){for(const[d,e]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])if(inBounds(r+d,c+e)&&(!board[r+d][c+e]||colorOf(board[r+d][c+e])===enemy))out.push([r+d,c+e])}
 else if(t==='B'||t==='R'||t==='Q'){const ds=[];if(t==='B'||t==='Q')ds.push([-1,-1],[-1,1],[1,-1],[1,1]);if(t==='R'||t==='Q')ds.push([-1,0],[1,0],[0,-1],[0,1]);for(const[d,e]of ds){let rr=r+d,cc=c+e;while(inBounds(rr,cc)){if(!add(rr,cc))break;rr+=d;cc+=e}}}
 else if(t==='K'){
  for(let d=-1;d<=1;d++)for(let e=-1;e<=1;e++)if((d||e)&&inBounds(r+d,c+e)&&(!board[r+d][c+e]||colorOf(board[r+d][c+e])===enemy))out.push([r+d,c+e]);
  if(includeCastle&&!inCheck(board,col)){
   const row=col==='w'?7:0,opp=enemy;
   if(castling[col+'K']&&board[row][5]===null&&board[row][6]===null&&board[row][7]===col+'R'&&!attacked(board,row,5,opp)&&!attacked(board,row,6,opp))out.push([row,6]);
   if(castling[col+'Q']&&board[row][1]===null&&board[row][2]===null&&board[row][3]===null&&board[row][0]===col+'R'&&!attacked(board,row,3,opp)&&!attacked(board,row,2,opp))out.push([row,2]);
  }
 }return out
}
function simulate(board,from,to){
 let b=clone(board),p=b[from[0]][from[1]];
 if(typeOf(p)==='P'&&enPassant&&to[0]===enPassant[0]&&to[1]===enPassant[1]&&!b[to[0]][to[1]])b[from[0]][to[1]]=null;
 b[to[0]][to[1]]=p;b[from[0]][from[1]]=null;
 if(typeOf(p)==='K'&&Math.abs(to[1]-from[1])===2){let rookFrom=to[1]===6?7:0,rookTo=to[1]===6?5:3;b[to[0]][rookTo]=b[to[0]][rookFrom];b[to[0]][rookFrom]=null}
 return b
}
function legalMovesFor(board,r,c){let p=board[r][c];if(!p)return[];return rawMoves(board,r,c).filter(to=>!inCheck(simulate(board,[r,c],to),colorOf(p)))}
function allLegal(board,col){let a=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]&&colorOf(board[r][c])===col)for(const to of legalMovesFor(board,r,c))a.push({from:[r,c],to,piece:board[r][c],capture:board[to[0]][to[1]]});return a}

function renderGameBoard(){
 gameBoardEl.innerHTML='';const wk=findKing(chessBoard,'w'),bk=findKing(chessBoard,'b'),wc=inCheck(chessBoard,'w'),bc=inCheck(chessBoard,'b');
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){let e=document.createElement('button');e.type='button';e.className='game-square '+((r+c)%2?'dark':'light');e.dataset.r=r;e.dataset.c=c;e.setAttribute('aria-label',`Case ${sqName(r,c)}`);
  if(chessBoard[r][c]){
    const pieceSpan=document.createElement('span');
    pieceSpan.className='game-piece '+(colorOf(chessBoard[r][c])==='w'?'white-piece':'black-piece');
    pieceSpan.textContent=PIECE_UNICODE[chessBoard[r][c]];
    e.appendChild(pieceSpan);
  }
  if(selectedSquare&&selectedSquare[0]===r&&selectedSquare[1]===c)e.classList.add('selected');
  if(legalTargets.some(x=>x[0]===r&&x[1]===c))e.classList.add(chessBoard[r][c]?'capture':'legal');
  if(lastMove&&([lastMove.from,lastMove.to].some(x=>x[0]===r&&x[1]===c)))e.classList.add('last-move');
  if((wc&&wk&&wk[0]===r&&wk[1]===c)||(bc&&bk&&bk[0]===r&&bk[1]===c))e.classList.add('check');
  e.onclick=()=>handleSquare(r,c);gameBoardEl.appendChild(e)
 }turnLabel.textContent=turn==='w'?'Blancs':'Noirs';updateState()
}
function logGame(t){let p=document.createElement('p');p.textContent=t;gameLogEl.prepend(p)}
function updateState(){
 let legal=allLegal(chessBoard,turn),check=inCheck(chessBoard,turn);
 if(!legal.length){
   gameOver=true;
   const isMate=check;
   const whiteWon=isMate&&turn==='b';
   const draw=!check;
   gameStateLabel.textContent=isMate?'Échec et mat':'Pat';

   if(!resultAwarded){
     resultAwarded=true;
     let earned=0;
     if(whiteWon){
       earned=50+Math.floor(AI_LEVELS[currentAI].rating/10);
       if(!matchStats.coachUsed) earned+=20;
       profile.wins++;
       profile.aiWinsById[currentAI]=(profile.aiWinsById[currentAI]||0)+1;
       profile.mastery=Math.min(100,(profile.mastery||0)+(matchStats.coachUsed?2:5));
       matchStats.result='Victoire';
       challengeRecordAIWin(!matchStats.coachUsed);
     }else if(draw){
       earned=15;
       matchStats.result='Nulle';
     }else{
       earned=5;
       matchStats.result='Défaite';
     }
     const aiReward=addXP(earned);
     profile.xp=Number(playerEconomy.xp)||0;
     matchStats.xpEarned=earned;
     matchStats.coinsEarned=Math.max(1,Math.round(earned/20));
     saveProfile();
     updateMatchObjective();

     // Feed complete AI games into the adaptive learning profile.
     const aiLearningSkill=matchStats.result==='Défaite'
       ? 'Défense'
       : (matchStats.captures>=3?'Tactique':'Stratégie');
     learningRecordDebrief({
       result:matchStats.result==='Victoire'?'victory':matchStats.result==='Défaite'?'defeat':'draw',
       skill:aiLearningSkill,
       error:matchStats.result==='Défaite'?'Sécurité du roi / menaces':'Aucune erreur critique',
       time:'Partie complète',
       priority:matchStats.result==='Défaite'?'Vérifier les menaces adverses':'Consolider les bonnes décisions',
       title:`Match contre ${AI_LEVELS[currentAI].name}`
     });

     pendingAIPostGame=true;
     pendingAIPostGameResult=matchStats.result;

     if(matchStats.result==='Victoire'){
       const p=lastRewardPayload;
       lastRewardPayload=null;
       showVictoryReward({
         title:`Victoire contre ${AI_LEVELS[currentAI].name} !`,
         message:'Match gagné. Les récompenses ont été ajoutées à ton profil.',
         xp:earned,
         coins:matchStats.coinsEarned,
         stars:0,
         before:p?.before||getEconomySnapshot(),
         after:p?.after||getEconomySnapshot()
       });
     }else if(matchStats.result==='Défaite'){
       showMissionDefeatFeedback(`Défaite contre ${AI_LEVELS[currentAI].name}. Le bilan va t’aider à comprendre les erreurs principales.`);
     }else{
       setTimeout(()=>{
         pendingAIPostGame=false;
         pendingAIPostGameResult=null;
         showPostGame();
       },350);
     }
   }
 } else {
   gameOver=false;
   gameStateLabel.textContent=check?'Échec':'Partie en cours';
 }
 moveCountEl.textContent=`${moveHistory.length} ${moveHistory.length>1?'coups':'coup'}`
}
function executeMove(from,to,byAI=false,promo='Q'){
 let p=chessBoard[from[0]][from[1]],capt=chessBoard[to[0]][to[1]];snapshots.push(snapshot());
 if(capt) matchStats.captures++;
 let special='';
 if(typeOf(p)==='P'&&enPassant&&to[0]===enPassant[0]&&to[1]===enPassant[1]&&!capt){capt=chessBoard[from[0]][to[1]];chessBoard[from[0]][to[1]]=null;special=' e.p.'}
 if(typeOf(p)==='K'&&Math.abs(to[1]-from[1])===2){let rf=to[1]===6?7:0,rt=to[1]===6?5:3;chessBoard[to[0]][rt]=chessBoard[to[0]][rf];chessBoard[to[0]][rf]=null;special=' roque'}
 chessBoard[to[0]][to[1]]=p;chessBoard[from[0]][from[1]]=null;
 if(typeOf(p)==='K'){castling[colorOf(p)+'K']=false;castling[colorOf(p)+'Q']=false}
 if(typeOf(p)==='R'){if(from[1]===0)castling[colorOf(p)+'Q']=false;if(from[1]===7)castling[colorOf(p)+'K']=false}
 if(capt&&typeOf(capt)==='R'){if(to[1]===0)castling[colorOf(capt)+'Q']=false;if(to[1]===7)castling[colorOf(capt)+'K']=false}
 enPassant=null;if(typeOf(p)==='P'&&Math.abs(to[0]-from[0])===2)enPassant=[(to[0]+from[0])/2,to[1]];
 if(typeOf(p)==='P'&&(to[0]===0||to[0]===7))chessBoard[to[0]][to[1]]=colorOf(p)+promo;
 lastMove={from:[...from],to:[...to]};let notation=`${PIECE_UNICODE[p]} ${sqName(...from)} → ${sqName(...to)}${capt?' × '+PIECE_UNICODE[capt]:''}${special}`;
 moveHistory.push(notation);logGame(`${byAI?AI_LEVELS[currentAI].name:'Toi'} : ${notation}`);selectedSquare=null;legalTargets=[];turn=turn==='w'?'b':'w';renderGameBoard();
 if(!gameOver&&turn==='b'&&!byAI)setTimeout(aiMove,500)
}
function makeMove(from,to,byAI=false){
 let p=chessBoard[from[0]][from[1]];
 if(!byAI&&typeOf(p)==='P'&&(to[0]===0||to[0]===7)){pendingPromotion={from,to};promotionPicker.classList.add('open');promotionPicker.setAttribute('aria-hidden','false');return}
 executeMove(from,to,byAI,'Q')
}
promotionPicker.querySelectorAll('button').forEach(b=>{
  b.classList.add('white-piece');
  b.onclick=()=>{if(pendingPromotion){let x=pendingPromotion;pendingPromotion=null;promotionPicker.classList.remove('open');promotionPicker.setAttribute('aria-hidden','true');executeMove(x.from,x.to,false,b.dataset.piece)}}});

function handleSquare(r,c){
 if(gameOver||turn!=='w'||pendingPromotion)return;let p=chessBoard[r][c];
 if(selectedSquare&&legalTargets.some(x=>x[0]===r&&x[1]===c)){makeMove(selectedSquare,[r,c]);return}
 if(p&&colorOf(p)==='w'){selectedSquare=[r,c];legalTargets=legalMovesFor(chessBoard,r,c)}else{selectedSquare=null;legalTargets=[]}renderGameBoard()
}
function evalBoard(b){let s=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(b[r][c])s+=(colorOf(b[r][c])==='b'?1:-1)*VALUES[typeOf(b[r][c])];return s}
function scoreMove(m,level){
 let b=simulate(chessBoard,m.from,m.to),score=evalBoard(b);
 if(m.capture)score+=VALUES[typeOf(m.capture)]*.6;
 if(inCheck(b,'w'))score+=35;
 let center=Math.abs(m.to[0]-3.5)+Math.abs(m.to[1]-3.5);score+=(7-center)*(level==='guard'?6:2);
 return score+(Math.random()-.5)*AI_LEVELS[level].noise*500
}
function aiMove(){
 if(gameOver||turn!=='b')return;let moves=allLegal(chessBoard,'b');if(!moves.length){updateState();return}
 moves.sort((a,b)=>scoreMove(b,currentAI)-scoreMove(a,currentAI));let cfg=AI_LEVELS[currentAI],pick;
 if(cfg.depth===0)pick=moves[Math.floor(Math.random()*Math.min(moves.length,8))];else pick=moves[Math.floor(Math.random()*Math.min(moves.length,currentAI==='guard'?2:4))];
 makeMove(pick.from,pick.to,true)
}
function coachHint(){
 if(gameOver||turn!=='w')return;
 matchStats.coachUsed=true;
 updateMatchObjective();let moves=allLegal(chessBoard,'w');if(!moves.length)return;
 moves.sort((a,b)=>{let av=(a.capture?VALUES[typeOf(a.capture)]:0),bv=(b.capture?VALUES[typeOf(b.capture)]:0);return bv-av});
 let m=moves[0],txt=m.capture?`Regarde ${sqName(...m.from)} : une capture intéressante est possible vers ${sqName(...m.to)}.`:`Commence par vérifier tes pièces actives. ${sqName(...m.from)} possède un coup légal utile vers ${sqName(...m.to)}.`;
 document.getElementById('gameCoachText').textContent=txt;
 let els=[...gameBoardEl.children];for(const [r,c]of[m.from,m.to])els[r*8+c]?.classList.add('hint-square')
}
document.querySelectorAll('.ai-level').forEach(btn=>btn.onclick=()=>{
 if(!isAIUnlocked(btn.dataset.ai)) return;
 currentAI=btn.dataset.ai;document.querySelectorAll('.ai-level').forEach(x=>x.classList.toggle('active',x===btn));let a=AI_LEVELS[currentAI];
 document.getElementById('aiName').textContent=a.name;document.getElementById('aiAvatar').textContent=a.avatar;document.getElementById('aiDescription').textContent=`≈ ${a.rating} Elo — ${a.desc}`;resetGame()
});
newGameBtn.onclick=resetGame;aiMoveBtn.onclick=aiMove;hintGameBtn.onclick=coachHint;
undoBtn.onclick=()=>{if(gameOver||resultAwarded||!snapshots.length)return;let s=snapshots.pop();if(s.turn==='b'&&snapshots.length)s=snapshots.pop();restore(s);gameLogEl.innerHTML='<p>Coup annulé. Continue la partie.</p>';renderGameBoard()};

function updateMatchObjective(){
 const title=document.getElementById('matchObjectiveTitle');
 const text=document.getElementById('matchObjectiveText');
 const bar=document.getElementById('matchObjectiveBar');
 const state=document.getElementById('matchObjectiveState');
 if(!title)return;
 title.textContent=`Gagner contre ${AI_LEVELS[currentAI].name}`;
 text.textContent=matchStats.coachUsed
   ? "Tu as utilisé le Coach. Tu peux toujours gagner, mais le bonus de +20 XP sans aide ne sera pas accordé."
   : "Termine la partie sans aide du Coach pour obtenir un bonus de +20 XP.";
 let pct=gameOver&&matchStats.result==='Victoire'?100:(moveHistory.length?35:0);
 bar.style.width=pct+'%';
 state.textContent=gameOver&&matchStats.result==='Victoire'?'Objectif accompli ✓':'Objectif en cours';
}

function deriveAnalysis(){
 let captures=matchStats.captures;
 let strength='Bonne discipline dans le développement.';
 let weakness='Continue à vérifier les menaces adverses.';
 let recommendation='Mission : repérer les pièces non protégées.';
 if(captures>=3) strength='Tu as bien exploité les occasions de capture.';
 if(matchStats.coachUsed) weakness='Essaie la prochaine partie sans utiliser le Coach.';
 if(matchStats.result==='Défaite'){
   weakness='Travaille la sécurité du roi et les menaces en un coup.';
   recommendation='Entraînement conseillé : Défendre son roi.';
 }else if(matchStats.result==='Victoire'&&!matchStats.coachUsed){
   strength='Victoire autonome : excellente progression.';
   recommendation=`Prochain objectif : affronter ${currentAI==='milo'?'Nova':currentAI==='nova'?'Le Garde':'une IA plus forte'}.`;
 }
 return {strength,weakness,recommendation};
}

function showPostGame(){
 const modal=document.getElementById('postGameModal');
 const a=deriveAnalysis();
 document.getElementById('postGameIcon').textContent=matchStats.result==='Victoire'?'♔':matchStats.result==='Nulle'?'♙':'♟';
 document.getElementById('postGameTitle').textContent=matchStats.result==='Victoire'?'Victoire !':matchStats.result==='Nulle'?'Partie nulle':'Défaite — nouvelle faiblesse identifiée';
 document.getElementById('postGameSubtitle').textContent=matchStats.result==='Victoire'
   ? `Tu as battu ${AI_LEVELS[currentAI].name}. Ton profil vient d'être mis à jour.`
   : 'Le résultat devient une information utile pour ton prochain entraînement.';
 document.getElementById('pgResult').textContent=matchStats.result||'—';
 document.getElementById('pgMoves').textContent=moveHistory.length;
 document.getElementById('pgCaptures').textContent=matchStats.captures;
 document.getElementById('pgXp').textContent='+'+matchStats.xpEarned;
 document.getElementById('pgCoins').textContent='+'+(matchStats.coinsEarned||0);
 document.getElementById('pgStrength').textContent=a.strength;
 document.getElementById('pgWeakness').textContent=a.weakness;
 document.getElementById('pgRecommendation').textContent=a.recommendation;
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}

document.getElementById('closePostGame')?.addEventListener('click',()=>{
 const m=document.getElementById('postGameModal');m.classList.remove('open');m.setAttribute('aria-hidden','true');
});
document.querySelector('.postgame-backdrop')?.addEventListener('click',()=>{
 const m=document.getElementById('postGameModal');m.classList.remove('open');m.setAttribute('aria-hidden','true');
});
document.getElementById('reviewGameBtn')?.addEventListener('click',()=>{
 const modal=document.getElementById('postGameModal');
 modal.classList.remove('open');
 modal.setAttribute('aria-hidden','true');
 document.getElementById('jouer')?.scrollIntoView({behavior:'smooth',block:'start'});
 gameLogEl?.classList.add('game-log-review-focus');
 setTimeout(()=>gameLogEl?.classList.remove('game-log-review-focus'),1800);
});
document.getElementById('nextChallengeBtn')?.addEventListener('click',()=>{
 const pgm=document.getElementById('postGameModal');pgm.classList.remove('open');pgm.setAttribute('aria-hidden','true');
 if(currentAI==='milo'&&isAIUnlocked('nova')){
   document.querySelector('[data-ai="nova"]')?.click();
 }else if(currentAI==='nova'&&isAIUnlocked('guard')){
   document.querySelector('[data-ai="guard"]')?.click();
 }else{
   resetGame();
 }
});


renderProfile();resetGame();

renderWorldTwo();


// ===== v18 final initialization =====
document.addEventListener('DOMContentLoaded',()=>{
  try{
    bossCompleted = bossCompleted || safeStorage.getItem(BOSS_KEY)==='1';
    renderBossState();
    bindBossButton();
    renderWorldTwo();
  }catch(e){
    console.error('EchecTuto adventure initialization error:',e);
  }
});
setTimeout(()=>{try{renderWorldTwo();}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{
  try{
    renderMissionMap();
  }catch(e){
    console.warn('World 01 replay init skipped',e);
  }
});

document.addEventListener('DOMContentLoaded',()=>{
  try{renderWorldThree();}catch(e){console.warn('World 03 init skipped',e);}
});
setTimeout(()=>{try{renderWorldThree();}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{try{renderWorldFour()}catch(e){console.warn('World 04 init skipped',e)}});
setTimeout(()=>{try{renderWorldFour()}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{try{renderWorldFive()}catch(e){console.warn('World 05 init skipped',e)}});setTimeout(()=>{try{renderWorldFive()}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{try{renderWorldSix()}catch(e){console.warn('World 06 init skipped',e)}});setTimeout(()=>{try{renderWorldSix()}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{try{renderWorldSeven()}catch(e){console.warn('World 07 init skipped',e)}});setTimeout(()=>{try{renderWorldSeven()}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{try{renderWorldEight()}catch(e){console.warn('World 08 init skipped',e)}});setTimeout(()=>{try{renderWorldEight()}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{try{renderWorldNine()}catch(e){console.warn('World 09 init skipped',e)}});setTimeout(()=>{try{renderWorldNine()}catch(e){}},0);

document.addEventListener('DOMContentLoaded',()=>{try{renderWorldTen();renderWorldEleven();renderWorldTwelve()}catch(e){console.warn('Final worlds init skipped',e)}});setTimeout(()=>{try{renderWorldTen();renderWorldEleven();renderWorldTwelve()}catch(e){}},0);

// ===== v35: Formal difficulty ladder =====
const ECHETSUTO_DIFFICULTY_LADDER=[
 {id:'very-easy',label:'Très facile',order:1,worlds:12,status:'foundation'},
 {id:'easy',label:'Facile',order:2,worlds:12,status:'active'},
 {id:'medium',label:'Moyen',order:3,worlds:12,status:'locked'},
 {id:'hard',label:'Difficile',order:4,worlds:12,status:'locked'},
 {id:'very-hard',label:'Très difficile',order:5,worlds:12,status:'locked'},
 {id:'expert',label:'Expert',order:6,worlds:12,status:'locked'},
 {id:'master',label:'Maître',order:7,worlds:12,status:'locked'},
 {id:'grandmaster',label:'Grand Maître',order:8,worlds:12,status:'locked'}
];
const ECHETSUTO_ACTIVE_DIFFICULTY='easy';
function getDifficultyDefinition(id){return ECHETSUTO_DIFFICULTY_LADDER.find(x=>x.id===id)||ECHETSUTO_DIFFICULTY_LADDER[0]}




// ===== v39: Victory reward presentation & animated accumulation =====
let lastRewardPayload=null;

function getEconomySnapshot(){
  return {xp:playerEconomy.xp,coins:playerEconomy.coins,stars:playerEconomy.stars};
}


function animateEconomyCounter(key,fromValue,toValue,duration=1100){
  const els=[...document.querySelectorAll(`[data-economy="${key}"]`)];
  if(!els.length)return;
  const start=performance.now();
  const diff=toValue-fromValue;
  const tick=(now)=>{
    const t=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-t,3);
    const value=Math.round(fromValue+diff*eased);
    els.forEach(el=>{
      el.textContent=value.toLocaleString('fr-FR');
      el.classList.toggle('economy-counter-pulse',t<1);
    });
    if(t<1)requestAnimationFrame(tick);
    else els.forEach(el=>el.classList.remove('economy-counter-pulse'));
  };
  requestAnimationFrame(tick);
}

function scatterRewardParticles({key,label,icon,count=10,delay=0}){
  const target=document.querySelector(`.hero-player-strip [data-economy="${key}"]`)
            ||document.querySelector(`[data-economy="${key}"]`);
  const origin=document.querySelector('#rewardEarnedList');
  if(!target||!origin)return;

  const o=origin.getBoundingClientRect();
  const t=target.getBoundingClientRect();

  setTimeout(()=>{
    for(let i=0;i<count;i++){
      const p=document.createElement('div');
      p.className=`reward-particle reward-particle-${key}`;
      p.textContent=icon;
      const startX=o.left+o.width/2+(Math.random()-.5)*80;
      const startY=o.top+o.height/2+(Math.random()-.5)*40;
      const scatterX=(Math.random()-.5)*180;
      const scatterY=(Math.random()-.5)*120;

      p.style.left=`${startX}px`;
      p.style.top=`${startY}px`;
      document.body.appendChild(p);

      requestAnimationFrame(()=>{
        p.style.transform=`translate(${scatterX}px,${scatterY}px) scale(${.75+Math.random()*.5}) rotate(${(Math.random()-.5)*180}deg)`;
      });

      setTimeout(()=>{
        const current=p.getBoundingClientRect();
        const dx=(t.left+t.width/2)-(current.left+current.width/2);
        const dy=(t.top+t.height/2)-(current.top+current.height/2);
        p.classList.add('fly-to-counter');
        p.style.transform=`translate(${scatterX+dx}px,${scatterY+dy}px) scale(.22) rotate(360deg)`;
        p.style.opacity='0';
      },350+Math.random()*180);

      setTimeout(()=>p.remove(),1300);
    }

    const fly=document.createElement('div');
    fly.className='reward-fly-label';
    fly.textContent=label;
    fly.style.left=`${o.left+o.width/2}px`;
    fly.style.top=`${o.top+o.height/2}px`;
    document.body.appendChild(fly);
    requestAnimationFrame(()=>{
      const dx=(t.left+t.width/2)-(o.left+o.width/2);
      const dy=(t.top+t.height/2)-(o.top+o.height/2);
      fly.style.transform=`translate(${dx}px,${dy}px) scale(.45)`;
      fly.style.opacity='0';
    });
    setTimeout(()=>fly.remove(),1200);
  },delay);
}

function showVictoryReward({title='Félicitations, vous avez gagné !', message='Mission réussie.', xp=0, coins=0, stars=0, badge=null, before=null, after=null}){
  const modalEl=document.getElementById('rewardModal');
  if(!modalEl)return;
  document.getElementById('rewardModalTitle').textContent=title;
  document.getElementById('rewardModalMessage').textContent=message;
  const list=document.getElementById('rewardEarnedList');
  list.innerHTML='';
  const rewards=[];
  if(xp>0)rewards.push({icon:'XP',label:`+${xp} XP`,cls:'xp'});
  if(coins>0)rewards.push({icon:'🪙',label:`+${coins} ETS`,cls:'coins'});
  if(stars>0)rewards.push({icon:'★',label:`+${stars} Étoile${stars>1?'s':''}`,cls:'stars'});
  if(badge)rewards.push({icon:'🏅',label:badge,cls:'badge'});
  rewards.forEach((r,i)=>{
    const el=document.createElement('div');
    el.className=`reward-earned ${r.cls}`;
    el.style.animationDelay=`${i*90}ms`;
    el.innerHTML=`<span>${r.icon}</span><strong>${r.label}</strong>`;
    list.appendChild(el);
  });
  modalEl.classList.add('open');
  modalEl.setAttribute('aria-hidden','false');

  if(before&&after){
    // Keep displayed totals at the old values while the victory panel is shown.
    document.querySelectorAll('[data-economy="xp"]').forEach(el=>el.textContent=before.xp.toLocaleString('fr-FR'));
    document.querySelectorAll('[data-economy="coins"]').forEach(el=>el.textContent=before.coins.toLocaleString('fr-FR'));
    document.querySelectorAll('[data-economy="stars"]').forEach(el=>el.textContent=before.stars.toLocaleString('fr-FR'));

    setTimeout(()=>{
      if(xp>0){
        scatterRewardParticles({key:'xp',label:`+${xp} XP`,icon:'✦',count:12,delay:0});
        setTimeout(()=>animateEconomyCounter('xp',before.xp,after.xp),650);
      }
      if(coins>0){
        scatterRewardParticles({key:'coins',label:`+${coins} ETS`,icon:'●',count:12,delay:170});
        setTimeout(()=>animateEconomyCounter('coins',before.coins,after.coins),820);
      }
      if(stars>0){
        scatterRewardParticles({key:'stars',label:`+${stars} Étoile${stars>1?'s':''}`,icon:'★',count:8,delay:340});
        setTimeout(()=>animateEconomyCounter('stars',before.stars,after.stars),990);
      }
    },500);
  }
}

function closeRewardModal(){
  const m=document.getElementById('rewardModal');
  if(!m)return;
  m.classList.remove('open');
  m.setAttribute('aria-hidden','true');
  if(pendingAIPostGame){
    pendingAIPostGame=false;
    pendingAIPostGameResult=null;
    setTimeout(showPostGame,180);
    return;
  }
  setTimeout(showPendingLearningDebrief,180);
}




function grantAndShowMissionReward({xp=0,stars=0,badge=null,title='Félicitations, vous avez gagné !',message='Mission réussie.'}){
  lastRewardPayload=null;
  const before=getEconomySnapshot();
  const coins=Math.max(0,Math.round((Number(xp)||0)/20));
  if(xp>0){
    playerEconomy.xp += Number(xp)||0;
    playerEconomy.coins += coins;
  }
  if(stars>0)playerEconomy.stars += Number(stars)||0;
  economySave();
  const after=getEconomySnapshot();
  updateEconomyUI();
  showVictoryReward({title,message,xp,coins,stars,badge,before,after});
  return {before,after,xp,coins,stars,badge};
}




// ===== v150-v159: adaptive learning analysis =====
const LEARNING_PATTERN_KEY='echectuto-learning-patterns-v159';
let learningPatterns={};
try{learningPatterns=JSON.parse(safeStorage.getItem(LEARNING_PATTERN_KEY)||'{}')}catch{learningPatterns={}}
if(!learningPatterns||typeof learningPatterns!=='object')learningPatterns={};

function saveLearningPatterns(){
  try{safeStorage.setItem(LEARNING_PATTERN_KEY,JSON.stringify(learningPatterns))}catch{}
}
function classifyMissionSkill(){
  const title=(missionTitle?.textContent||'').toLowerCase();
  const obj=(missionObjective?.textContent||'').toLowerCase();
  const text=title+' '+obj;
  if(/mat|échec|roi/.test(text))return 'Calcul de mat';
  if(/tact|fourchette|clou|attaque|enfil/.test(text))return 'Tactique';
  if(/développ|centre|activité/.test(text))return 'Développement';
  if(/final|promotion|opposition/.test(text))return 'Finale';
  if(/déf|menace|protection/.test(text))return 'Défense';
  if(/calcul|variante/.test(text))return 'Calcul';
  if(/strat|plan|structure/.test(text))return 'Stratégie';
  return 'Observation';
}
function classifyLikelyError(reason=''){
  const txt=(reason+' '+(missionStatus?.textContent||'')).toLowerCase();
  if(/temps|chrono/.test(txt))return 'Gestion du temps';
  if(/vie|mauvaise|bonne case|destination/.test(txt))return 'Vérification insuffisante';
  if(/menace|déf/.test(txt))return 'Menace adverse ignorée';
  if(/calcul|variante/.test(txt))return 'Calcul incomplet';
  return 'Observation incomplète';
}
function estimateTimeQuality(result){
  const rule=DIFFICULTY_GAMEPLAY_RULES[getMissionDifficulty()];
  if(!rule?.countdown)return 'Sans pression';
  const remaining=Number(missionRemainingSeconds||0);
  const ratio=rule.seconds?remaining/rule.seconds:0;
  if(result==='defeat'&&remaining<=0)return 'Temps épuisé';
  if(ratio>.6)return 'Rapide';
  if(ratio>.25)return 'Correcte';
  return result==='victory'?'Sous pression':'Trop lente';
}
function priorityFrom(skill,error){
  if(error==='Gestion du temps')return 'Décider plus vite';
  if(error==='Menace adverse ignorée')return 'Voir les menaces';
  if(error==='Calcul incomplet')return 'Calculer la réponse';
  if(skill==='Tactique')return 'Chercher les coups forcés';
  if(skill==='Défense')return 'Sécuriser avant d’attaquer';
  return 'Observer avant de jouer';
}
function recordLearningPattern(result,skill,error){
  const key=`${skill}|${error}`;
  const prev=learningPatterns[key]||{attempts:0,losses:0,wins:0};
  prev.attempts++;
  if(result==='victory')prev.wins++;else prev.losses++;
  learningPatterns[key]=prev;
  saveLearningPatterns();
  return prev;
}
function mostRecurringLearningPattern(){
  const entries=Object.entries(learningPatterns);
  if(!entries.length)return null;
  entries.sort((a,b)=>(b[1].losses*2+b[1].attempts)-(a[1].losses*2+a[1].attempts));
  return {key:entries[0][0],...entries[0][1]};
}
function recommendedExerciseFor(skill,error){
  if(error==='Gestion du temps')return {title:'Sprint de décision',why:'Des positions courtes pour apprendre à choisir sous pression.'};
  if(skill==='Tactique')return {title:'Détection tactique',why:'Travaille les échecs, captures et menaces avant toute décision.'};
  if(skill==='Défense')return {title:'Menaces adverses',why:'Entraîne-toi à identifier le plan adverse avant ton propre plan.'};
  if(skill==='Calcul')return {title:'Calcul en 2 variantes',why:'Compare deux coups candidats et anticipe la meilleure réponse.'};
  if(skill==='Finale')return {title:'Technique de finale',why:'Révise les principes essentiels de conversion.'};
  return {title:'Lecture de position',why:'Renforce l’observation des pièces, cases et menaces.'};
}
function checklistFor(skill,result){
  const common=['Quelle est la menace adverse ?','Quels sont mes coups forcés ?','Que répond l’adversaire ?'];
  if(skill==='Tactique')common.push('Y a-t-il une pièce non protégée ?');
  if(skill==='Défense')common.push('Mon roi et mes pièces sont-ils suffisamment protégés ?');
  if(skill==='Finale')common.push('Mon roi peut-il être activé ?');
  if(result==='defeat')common.push('Puis-je éliminer une hypothèse avant de jouer ?');
  return common.slice(0,5);
}
function enrichLearningDebrief(data){
  const skill=classifyMissionSkill();
  const error=data.result==='victory'?'Aucune erreur critique':classifyLikelyError(data.summary);
  const timeQuality=estimateTimeQuality(data.result);
  const priority=priorityFrom(skill,error);
  const pattern=recordLearningPattern(data.result,skill,error);
  const recurring=mostRecurringLearningPattern();
  const exercise=recommendedExerciseFor(skill,error);

  return {
    ...data,skill,error,timeQuality,priority,pattern,recurring,exercise,
    checklist:checklistFor(skill,data.result)
  };
}


// ===== v160-v189: persistent Learning Center =====
const LEARNING_CENTER_KEY='echectuto-learning-center-v189';
const LEARNING_REVIEW_DELAY={
  'Nouveau':0,
  'En apprentissage':1,
  'Compris':3,
  'Acquis':7,
  'Maîtrisé':14,
  'À réviser':0
};
const LEARNING_SKILLS=['Observation','Tactique','Calcul de mat','Développement','Finale','Défense','Calcul','Stratégie'];

let learningCenterData={history:[],skills:{},reviews:[],visits:[],goals:{},lastUpdated:null};
try{
  const saved=JSON.parse(safeStorage.getItem(LEARNING_CENTER_KEY)||'null');
  if(saved&&typeof saved==='object')learningCenterData={...learningCenterData,...saved};
}catch{}
if(!learningCenterData.skills||typeof learningCenterData.skills!=='object')learningCenterData.skills={};
if(!Array.isArray(learningCenterData.history))learningCenterData.history=[];
if(!Array.isArray(learningCenterData.reviews))learningCenterData.reviews=[];
if(!Array.isArray(learningCenterData.visits))learningCenterData.visits=[];

function learningSave(){
  learningCenterData.lastUpdated=Date.now();
  try{safeStorage.setItem(LEARNING_CENTER_KEY,JSON.stringify(learningCenterData))}catch{}
}
function learningSkillRecord(name){
  if(!learningCenterData.skills[name]){
    learningCenterData.skills[name]={attempts:0,wins:0,losses:0,score:0,status:'Nouveau',lastSeen:0,streak:0};
  }
  return learningCenterData.skills[name];
}
function learningMasteryStatus(score){
  if(score>=90)return 'Maîtrisé';
  if(score>=75)return 'Acquis';
  if(score>=55)return 'Compris';
  if(score>=25)return 'En apprentissage';
  return 'Nouveau';
}
function learningMasteryScore(rec){
  if(!rec?.attempts)return 0;
  const accuracy=rec.wins/rec.attempts;
  const experience=Math.min(1,rec.attempts/8);
  const streakBoost=Math.min(10,(rec.streak||0)*2);
  return Math.max(0,Math.min(100,Math.round(accuracy*70+experience*20+streakBoost)));
}
function learningToday(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function learningRegisterVisit(){
  const t=learningToday();
  if(!learningCenterData.visits.includes(t)){
    learningCenterData.visits.push(t);
    learningCenterData.visits=learningCenterData.visits.slice(-90);
    learningSave();
  }
}
function learningStudyStreak(){
  const visits=learningCenterData.visits||[];
  if(!visits.length)return 0;
  let streak=0, d=new Date();
  for(let i=0;i<90;i++){
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if(visits.includes(k)){streak++;d.setDate(d.getDate()-1)}
    else if(i===0){d.setDate(d.getDate()-1)}
    else break;
  }
  return streak;
}
function learningScheduleReview(skill,status){
  const days=LEARNING_REVIEW_DELAY[status]??1;
  const due=Date.now()+days*86400000;
  const existing=learningCenterData.reviews.find(x=>x.skill===skill);
  if(existing){existing.due=due;existing.status=status}
  else learningCenterData.reviews.push({skill,due,status});
  learningCenterData.reviews=learningCenterData.reviews.slice(-40);
}
function learningDueReviews(){
  const now=Date.now();
  return learningCenterData.reviews.filter(x=>x.due<=now).sort((a,b)=>a.due-b.due);
}
function learningRecordDebrief(data){
  if(!data?.result)return;
  learningRegisterVisit();
  const skill=data.skill||'Observation';
  const rec=learningSkillRecord(skill);
  rec.attempts++;
  if(data.result==='victory'){
    rec.wins++;rec.streak=(rec.streak||0)+1;
  }else if(data.result==='defeat'){
    rec.losses++;rec.streak=0;
  }else{
    // Draw: useful analysed attempt, but neither a win nor a loss.
    rec.streak=Math.max(0,rec.streak||0);
  }
  rec.lastSeen=Date.now();
  rec.score=learningMasteryScore(rec);
  rec.status=learningMasteryStatus(rec.score);

  if(data.result==='defeat' || rec.score<55){
    learningScheduleReview(skill, data.result==='defeat'?'À réviser':rec.status);
  }else{
    learningScheduleReview(skill,rec.status);
  }

  learningCenterData.history.unshift({
    ts:Date.now(),
    result:data.result,
    skill,
    error:data.error||'—',
    time:data.timeQuality||'—',
    priority:data.priority||'—',
    score:rec.score,
    title:data.title||'Partie'
  });
  learningCenterData.history=learningCenterData.history.slice(0,40);
  learningSave();
}
function learningOverallMastery(){
  const vals=Object.values(learningCenterData.skills).filter(x=>x.attempts);
  if(!vals.length)return 0;
  return Math.round(vals.reduce((s,x)=>s+(x.score||0),0)/vals.length);
}
function learningWinRate(){
  const h=learningCenterData.history;
  if(!h.length)return 0;
  return Math.round(h.filter(x=>x.result==='victory').length/h.length*100);
}
function learningStrongWeak(){
  const rows=Object.entries(learningCenterData.skills).filter(([,r])=>r.attempts).map(([name,r])=>({name,...r}));
  rows.sort((a,b)=>(b.score||0)-(a.score||0));
  return {strong:rows[0]||null,weak:rows[rows.length-1]||null};
}
function learningDifficultyRecommendation(){
  const mastery=learningOverallMastery();
  const total=learningCenterData.history.length;
  const recent=learningCenterData.history.slice(0,8);
  const rate=recent.length?recent.filter(x=>x.result==='victory').length/recent.length:0;
  if(total>=12&&mastery>=80&&rate>=.75)return {label:'Moyen bientôt',text:'Ta maîtrise suggère que tu peux bientôt tester moins d’indices et plus de calcul.'};
  if(total>=6&&mastery<40)return {label:'Facile — consolider',text:'Reste sur Facile et priorise les révisions recommandées avant d’augmenter la pression.'};
  return {label:'Facile',text:'Continue la campagne actuelle tout en corrigeant les priorités détectées.'};
}
function learningRecentTrend(){
  const h=learningCenterData.history.slice(0,12).reverse();
  if(h.length<3)return 'Données insuffisantes';
  const first=h.slice(0,Math.ceil(h.length/2));
  const last=h.slice(Math.ceil(h.length/2));
  const avg=a=>a.reduce((s,x)=>s+(x.score||0),0)/Math.max(1,a.length);
  const diff=avg(last)-avg(first);
  return diff>6?'En progression':diff<-6?'À consolider':'Stable';
}
function learningGoals(){
  const mastery=learningOverallMastery();
  const due=learningDueReviews().length;
  const h=learningCenterData.history;
  const today=learningToday();
  const todayCount=h.filter(x=>{
    const d=new Date(x.ts);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===today;
  }).length;
  return [
    {title:'Analyser 3 parties aujourd’hui',done:todayCount>=3,text:`${Math.min(3,todayCount)} / 3`},
    {title:'Terminer les révisions dues',done:due===0,text:due?`${due} à revoir`:'À jour'},
    {title:'Atteindre 60% de maîtrise',done:mastery>=60,text:`${mastery}% / 60%`}
  ];
}
function learningRecommendedAction(){
  const due=learningDueReviews();
  if(due.length)return {icon:'↻',title:`Réviser ${due[0].skill}`,text:'Cette compétence est arrivée à échéance dans ton cycle de révision.',type:'review'};
  const {weak}=learningStrongWeak();
  if(weak&&weak.score<60)return {icon:'◎',title:`Renforcer ${weak.name}`,text:`Maîtrise actuelle : ${weak.score}%. Une séance ciblée est recommandée.`,type:'training'};
  return {icon:'→',title:'Continuer la campagne',text:'Aucune révision urgente. Poursuis le prochain monde disponible.',type:'campaign'};
}
function learningMarkReviewDone(skill){
  // A review is NOT considered mastered by clicking a button.
  // Keep it due until the player actually succeeds in a later exercise/debrief.
  safeStorage.setItem('echectuto-learning-review-target-v190',skill);
  closeLearningCenter();
  document.getElementById('trainingArchive')?.scrollIntoView({behavior:'smooth',block:'center'});
}
function learningPatternRows(){
  return Object.entries(learningPatterns||{})
    .map(([key,val])=>({key,...val}))
    .filter(x=>x.attempts>0)
    .sort((a,b)=>(b.losses*2+b.attempts)-(a.losses*2+a.attempts))
    .slice(0,6);
}
function renderLearningCenter(){
  const root=document.getElementById('learningCenterModal');
  if(!root)return;
  learningRegisterVisit();

  const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};
  const mastery=learningOverallMastery();
  const history=learningCenterData.history;
  const due=learningDueReviews();
  const streak=learningStudyStreak();
  const {strong,weak}=learningStrongWeak();
  const advice=learningDifficultyRecommendation();
  const trend=learningRecentTrend();

  set('learningOverallMastery',`${mastery}%`);
  const bar=document.getElementById('learningOverallBar');if(bar)bar.style.width=`${mastery}%`;
  set('learningAnalyzedCount',String(history.length));
  set('learningWinRate',`${learningWinRate()}% réussite`);
  set('learningReviewCount',String(due.length));
  set('learningReviewNext',due.length?`${due[0].skill} prioritaire`:'Aucune urgence');
  set('learningStudyStreak',`${streak} jour${streak>1?'s':''}`);
  set('learningStudyStatus',streak?'Série active':'Commence aujourd’hui');
  set('learningStrongestSkill',strong?`Fort : ${strong.name}`:'—');
  set('learningWeakestSkill',weak?`À travailler : ${weak.name}`:'—');
  set('learningStrengthTitle',strong?.name||'Profil en construction');
  set('learningStrengthText',strong?`${strong.score}% de maîtrise • ${strong.wins}/${strong.attempts} réussites.`:'Joue quelques parties pour construire ton profil.');
  set('learningWeaknessTitle',weak?.name||'Profil en construction');
  set('learningWeaknessText',weak?`${weak.score}% de maîtrise. Priorité : consolider cette compétence.`:'Les priorités apparaîtront ici.');
  set('learningDifficultyAdvice',advice.label);
  set('learningTrendLabel',trend);

  const skillList=document.getElementById('learningSkillList');
  if(skillList){
    skillList.innerHTML=LEARNING_SKILLS.map(name=>{
      const r=learningSkillRecord(name);
      const score=r.score||0;
      return `<article class="learning-skill-row">
        <div><strong>${name}</strong><span>${r.status}</span></div>
        <i><b style="width:${score}%"></b></i>
        <em>${score}%</em>
      </article>`;
    }).join('');
  }

  const reviewList=document.getElementById('learningReviewList');
  if(reviewList){
    const reviews=due.slice(0,6);
    reviewList.innerHTML=reviews.length?reviews.map(r=>`
      <article>
        <div><strong>${r.skill}</strong><span>${r.status}</span></div>
        <button type="button" data-learning-review="${r.skill}">Entraîner</button>
      </article>`).join(''):'<p class="learning-empty">Tu es à jour. Les prochaines révisions apparaîtront ici.</p>';
    reviewList.querySelectorAll('[data-learning-review]').forEach(b=>b.addEventListener('click',()=>learningMarkReviewDone(b.dataset.learningReview)));
  }

  const patterns=learningPatternRows();
  set('learningPatternCount',`${patterns.length} tendance${patterns.length!==1?'s':''}`);
  const patternList=document.getElementById('learningPatternList');
  if(patternList){
    patternList.innerHTML=patterns.length?patterns.map(p=>{
      const [skill,error]=p.key.split('|');
      return `<article><span>${skill}</span><strong>${error}</strong><small>${p.losses} échec${p.losses!==1?'s':''} / ${p.attempts} tentative${p.attempts!==1?'s':''}</small></article>`;
    }).join(''):'<p class="learning-empty">Aucune erreur récurrente détectée.</p>';
  }

  const action=learningRecommendedAction();
  set('learningNextIcon',action.icon);set('learningNextTitle',action.title);set('learningNextText',action.text);
  const actionBtn=document.getElementById('learningNextAction');
  if(actionBtn)actionBtn.onclick=()=>{
    closeLearningCenter();
    if(action.type==='review'||action.type==='training')document.getElementById('trainingArchive')?.scrollIntoView({behavior:'smooth',block:'center'});
    else commandOpenRecommended?.();
  };

  const goals=learningGoals();
  set('learningGoalStatus',`${goals.filter(x=>x.done).length} / ${goals.length}`);
  const goalList=document.getElementById('learningGoalList');
  if(goalList)goalList.innerHTML=goals.map(g=>`<article class="${g.done?'done':''}"><span>${g.done?'✓':'○'}</span><div><strong>${g.title}</strong><small>${g.text}</small></div></article>`).join('');

  const hist=document.getElementById('learningHistoryList');
  if(hist){
    hist.innerHTML=history.slice(0,8).map(h=>{
      const d=new Date(h.ts);
      return `<article class="${h.result}">
        <span>${h.result==='victory'?'✓':'↺'}</span>
        <div><strong>${h.title}</strong><small>${h.skill} • ${h.error}</small></div>
        <time>${d.toLocaleDateString('fr-FR')}</time>
      </article>`;
    }).join('')||'<p class="learning-empty">Aucun débrief enregistré pour le moment.</p>';
  }

  const trendBars=document.getElementById('learningTrendBars');
  if(trendBars){
    const recent=history.slice(0,10).reverse();
    trendBars.innerHTML=recent.length?recent.map(h=>`<i title="${h.title} — ${h.score}%"><b style="height:${Math.max(8,h.score||0)}%"></b></i>`).join(''):'<p class="learning-empty">La courbe apparaîtra après quelques parties.</p>';
  }
}
function openLearningCenter(){
  closeProfileModal?.();
  renderLearningCenter();
  const modal=document.getElementById('learningCenterModal');
  if(!modal)return;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('learningCenterClose')?.focus(),0);
}
function closeLearningCenter(){
  const modal=document.getElementById('learningCenterModal');
  if(!modal)return;
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
}
function initLearningCenter(){
  learningRegisterVisit();
  document.getElementById('openLearningCenterBtn')?.addEventListener('click',openLearningCenter);
  document.getElementById('learningCenterClose')?.addEventListener('click',closeLearningCenter);
  document.getElementById('learningCenterBackdrop')?.addEventListener('click',closeLearningCenter);
  document.getElementById('learningReviewAllBtn')?.addEventListener('click',()=>{
    const due=learningDueReviews();
    if(!due.length)return;
    closeLearningCenter();
    document.getElementById('trainingArchive')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.getElementById('learningCenterModal')?.classList.contains('open'))closeLearningCenter();
  });
}


// ===== v191: live challenges, local clans, adaptive coach =====
const CHALLENGE_KEY='echectuto-live-challenges-v191';
const CLAN_KEY='echectuto-local-clan-v191';

function dateKeyLocal(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function weekKeyLocal(d=new Date()){
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);
  return dateKeyLocal(x);
}
function defaultChallengeState(){
  return {day:dateKeyLocal(),week:weekKeyLocal(),dailyMissionIds:[],aiNoHintWins:0,bossIds:[],claimed:{daily:false,ai:false,boss:false}};
}
let challengeMemoryState=null;
function loadChallengeState(){
  let s=challengeMemoryState;
  if(!s){
    try{s=JSON.parse(safeStorage.getItem(CHALLENGE_KEY)||'null')}catch{}
  }
  if(!s||typeof s!=='object')s=defaultChallengeState();
  const today=dateKeyLocal(),week=weekKeyLocal();
  s.claimed=s.claimed||{daily:false,ai:false,boss:false};
  if(s.day!==today){s.day=today;s.dailyMissionIds=[];s.claimed.daily=false}
  if(s.week!==week){s.week=week;s.aiNoHintWins=0;s.bossIds=[];s.claimed.ai=false;s.claimed.boss=false}
  challengeMemoryState=s;
  return s;
}
let liveChallenges=loadChallengeState();
function saveChallengeState(){
  challengeMemoryState=liveChallenges;
  safeStorage.setItem(CHALLENGE_KEY,JSON.stringify(liveChallenges));
}
function challengeReward(type){
  const cfg={daily:{xp:120,coins:6},ai:{xp:300,coins:15},boss:{xp:250,coins:13}}[type];
  if(!cfg||liveChallenges.claimed[type])return;
  const ready=type==='daily'?liveChallenges.dailyMissionIds.length>=3:type==='ai'?liveChallenges.aiNoHintWins>=3:liveChallenges.bossIds.length>=1;
  if(!ready)return;
  const before=getEconomySnapshot();
  playerEconomy.xp+=cfg.xp;playerEconomy.coins+=cfg.coins;
  liveChallenges.claimed[type]=true;saveChallengeState();economySave();updateEconomyUI();
  showVictoryReward({title:'Défi accompli !',message:'La récompense du défi a été ajoutée à ton profil.',xp:cfg.xp,coins:cfg.coins,stars:0,before,after:getEconomySnapshot()});
  renderChallenges();
}
function challengeRecordMission(id){
  if(!id)return;liveChallenges=loadChallengeState();const key=String(id);
  if(!liveChallenges.dailyMissionIds.includes(key)){liveChallenges.dailyMissionIds.push(key)}
  if(key.endsWith('99')&&!liveChallenges.bossIds.includes(key)){liveChallenges.bossIds.push(key)}
  saveChallengeState();renderChallenges();
}
function challengeRecordAIWin(noHint){
  if(!noHint)return;liveChallenges=loadChallengeState();
  liveChallenges.aiNoHintWins=Math.min(3,Number(liveChallenges.aiNoHintWins||0)+1);
  saveChallengeState();renderChallenges();
}
function syncChallengeCard(type,value,target,barId,textId,buttonId){
  const pct=Math.min(100,Math.round(value/target*100));
  const bar=document.getElementById(barId),text=document.getElementById(textId),btn=document.getElementById(buttonId);
  if(bar)bar.style.width=pct+'%';if(text)text.textContent=`${Math.min(value,target)} / ${target}`;
  if(btn){const claimed=!!liveChallenges.claimed[type],ready=value>=target;btn.disabled=claimed||!ready;btn.textContent=claimed?'Réclamé ✓':ready?'Réclamer':'En cours'}
}
function renderChallenges(){
  liveChallenges=loadChallengeState();
  syncChallengeCard('daily',liveChallenges.dailyMissionIds.length,3,'challengeDailyBar','challengeDailyProgress','challengeDailyClaim');
  syncChallengeCard('ai',liveChallenges.aiNoHintWins,3,'challengeAIBar','challengeAIProgress','challengeAIClaim');
  syncChallengeCard('boss',liveChallenges.bossIds.length,1,'challengeBossBar','challengeBossProgress','challengeBossClaim');
}
function initChallenges(){
  document.getElementById('challengeDailyClaim')?.addEventListener('click',()=>challengeReward('daily'));
  document.getElementById('challengeAIClaim')?.addEventListener('click',()=>challengeReward('ai'));
  document.getElementById('challengeBossClaim')?.addEventListener('click',()=>challengeReward('boss'));
  renderChallenges();
}

function completedMissionTotal(){
  const arrays=[completedIds,world2Completed,world3Completed,world4Completed,world5Completed,world6Completed,world7Completed,world8Completed,world9Completed,world10Completed,world11Completed,world12Completed];
  return arrays.reduce((s,a)=>s+(Array.isArray(a)?a.length:0),0);
}
function bossTotal(){
  return [bossCompleted,world2BossCompleted,world3BossCompleted,world4BossCompleted,world5BossCompleted,world6BossCompleted,world7BossCompleted,world8BossCompleted,world9BossCompleted,world10BossCompleted,world11BossCompleted,world12BossCompleted].filter(Boolean).length;
}
function clanContributionScore(){return completedMissionTotal()*4+bossTotal()*40+Number(profile?.wins||0)*12}
let activeClan=safeStorage.getItem(CLAN_KEY)||'';
function loadClan(){return activeClan||safeStorage.getItem(CLAN_KEY)||''}
function saveClan(id){
  activeClan=id||'';
  if(activeClan)safeStorage.setItem(CLAN_KEY,activeClan);
  else safeStorage.removeItem(CLAN_KEY);
}
function renderClan(){
  const id=loadClan(),names={cavaliers:"Les Cavaliers d'Or",tours:"Les Tours Noires"},contribution=clanContributionScore();
  const name=document.getElementById('clanPlayerName'),status=document.getElementById('clanPlayerStatus'),leave=document.getElementById('clanLeaveBtn');
  if(name)name.textContent=id?names[id]:'Aucun clan rejoint';
  if(status)status.textContent=id?'Ta contribution provient uniquement de ta vraie progression locale. Aucun résultat multijoueur n’est inventé dans cette version Lite.':'Choisis un clan de démonstration. Ton choix est sauvegardé localement dans cette version Lite.';
  if(leave)leave.disabled=!id;
  document.querySelectorAll('[data-clan-join]').forEach(btn=>{const active=btn.dataset.clanJoin===id;btn.disabled=active;btn.textContent=active?'Membre ✓':id?'Changer de clan':'Rejoindre';btn.closest('.clan')?.classList.toggle('player-clan',active)});
  document.getElementById('clanContribution') && (document.getElementById('clanContribution').textContent=contribution);
  document.getElementById('clanMissionContribution') && (document.getElementById('clanMissionContribution').textContent=completedMissionTotal());
  document.getElementById('clanAIContribution') && (document.getElementById('clanAIContribution').textContent=Number(profile?.wins||0));
  document.getElementById('clanCavaliersScore') && (document.getElementById('clanCavaliersScore').textContent=742+(id==='cavaliers'?contribution:0));
  document.getElementById('clanToursScore') && (document.getElementById('clanToursScore').textContent=731+(id==='tours'?contribution:0));
}
function initClans(){
  document.querySelectorAll('[data-clan-join]').forEach(btn=>btn.addEventListener('click',()=>{saveClan(btn.dataset.clanJoin);renderClan()}));
  document.getElementById('clanLeaveBtn')?.addEventListener('click',()=>{saveClan('');renderClan()});
  renderClan();
}

function learningScoreFor(skill){return Math.max(0,Math.min(100,Number(learningCenterData?.skills?.[skill]?.score||0)))}
function renderCoachProfile(){
  [['coachVisionBar','coachVisionValue','Observation'],['coachTacticBar','coachTacticValue','Tactique'],['coachEndgameBar','coachEndgameValue','Finale']].forEach(([barId,valId,skill])=>{
    const score=learningScoreFor(skill),bar=document.getElementById(barId),val=document.getElementById(valId);
    if(bar)bar.style.width=score+'%';if(val)val.textContent=score+'%';
  });
}
function personalizedCoachAdvice(){
  const due=typeof learningDueReviews==='function'?learningDueReviews():[];
  const sw=typeof learningStrongWeak==='function'?learningStrongWeak():{weak:null};
  if(due.length)return [`Une révision est arrivée à échéance : ${due[0].skill}.`,'Commence par une courte séance de révision avant d’ajouter de nouveaux concepts.'];
  if(sw.weak)return [`Ta compétence la plus fragile actuellement est « ${sw.weak.name} » (${sw.weak.score||0}%).`,`Pendant la prochaine partie, concentre-toi sur un seul objectif lié à ${sw.weak.name.toLowerCase()}.`];
  if(Number(profile?.wins||0)===0)return ['Ton profil est encore en construction.','Joue quelques missions et une partie IA : le Coach adaptera ensuite ses conseils à tes résultats.'];
  return ['Ta progression est équilibrée pour le moment.','Poursuis la campagne et essaie une partie IA sans indice pour mesurer ton autonomie.'];
}
function updateCoachMessage(){
  renderCoachProfile();const [main,hint]=personalizedCoachAdvice();const box=document.getElementById('coachMessage');if(!box)return;
  try{box.animate([{opacity:.25,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:320,easing:'ease-out'})}catch{}
  box.innerHTML=`<p>${main}</p><p class="hint">${hint}</p>`;
}
function initAdaptiveCoach(){renderCoachProfile();document.getElementById('coachLearningBtn')?.addEventListener('click',openLearningCenter)}

function initShopShowcaseLinks(){
  document.querySelectorAll('[data-shop-showcase]').forEach(btn=>btn.addEventListener('click',()=>openShopAtItem(btn.dataset.shopShowcase)));
}

// ===== v149: pedagogical post-match debrief =====
let pendingLearningDebrief=null;

const GENERIC_DEBRIEF_LIBRARY={
  victory:{
    why:"Tu as identifié le bon élément de la position et tu as transformé ton observation en décision correcte.",
    lesson:"Avant de jouer, relie toujours la position, la menace et le but du coup. Une bonne décision n’est pas seulement un coup juste : c’est un coup que tu comprends.",
    strengths:"Tu as réussi à choisir une réponse cohérente avec l’objectif de la position.",
    next:"Essaie maintenant de verbaliser en une phrase pourquoi ton coup fonctionne avant de le jouer."
  },
  defeat:{
    why:"La décision choisie ne répondait pas complètement au problème posé par la position, ou le temps disponible s’est écoulé avant que l’analyse soit terminée.",
    lesson:"Une erreur est utile si tu peux identifier ce qui t’a manqué : observation, menace, calcul, sécurité du roi, activité des pièces ou gestion du temps.",
    solutions:[
      "Commence par identifier les menaces immédiates des deux camps.",
      "Cherche d’abord les coups forcés : échecs, captures et menaces directes.",
      "Compare au moins deux candidats avant de jouer.",
      "Vérifie la meilleure réponse adverse avant de valider ton choix."
    ],
    next:"Au prochain essai, prends quelques secondes pour suivre la boucle : observer → candidats → réponse adverse → décision."
  }
};

function currentMissionLearningContext(){
  let m=null;
  if(currentMissionId>=1 && currentMissionId<=missions.length) m=missions.find(x=>x.id===currentMissionId);
  else if(currentMissionId>=201&&currentMissionId<=204) m=activeWorld2Mission;
  else if(currentMissionId>=301&&currentMissionId<=305) m=activeWorld3Mission;
  else if(currentMissionId>=401&&currentMissionId<=405) m=activeWorld4Mission;
  else if(currentMissionId>=501&&currentMissionId<=506) m=activeWorld5Mission;
  else if(currentMissionId>=601&&currentMissionId<=606) m=activeWorld6Mission;
  else if(currentMissionId>=701&&currentMissionId<=707) m=activeWorld7Mission;
  else if(currentMissionId>=801&&currentMissionId<=807) m=activeWorld8Mission;
  else if(currentMissionId>=901&&currentMissionId<=907) m=activeWorld9Mission;
  else if(currentMissionId>=1001&&currentMissionId<=1007) m=activeWorld10Mission;
  else if(currentMissionId>=1101&&currentMissionId<=1107) m=activeWorld11Mission;
  else if(currentMissionId>=1201&&currentMissionId<=1207) m=activeWorld12Mission;
  return m||null;
}
function buildLearningDebrief(result,reason=''){
  const m=currentMissionLearningContext();
  const title=m?.title||missionTitle?.textContent||'Partie';
  const objective=(m?.desc||missionDescription?.textContent||'').replace(/<[^>]*>/g,'');
  if(result==='victory'){
    return {
      result:'victory',
      title,
      summary:`Tu as terminé « ${title} ». ${objective||'La position a été résolue.'}`,
      why:m?.success||GENERIC_DEBRIEF_LIBRARY.victory.why,
      lesson:GENERIC_DEBRIEF_LIBRARY.victory.lesson,
      strengths:GENERIC_DEBRIEF_LIBRARY.victory.strengths,
      solutions:[],
      nextTitle:'Transformer la victoire en compétence',
      next:GENERIC_DEBRIEF_LIBRARY.victory.next
    };
  }
  return {
    result:'defeat',
    title,
    summary:reason||`Cette tentative sur « ${title} » n’a pas abouti.`,
    why:GENERIC_DEBRIEF_LIBRARY.defeat.why,
    lesson:GENERIC_DEBRIEF_LIBRARY.defeat.lesson,
    strengths:"Tu as obtenu une information précieuse : tu sais maintenant qu’une autre méthode d’analyse est nécessaire.",
    solutions:[...GENERIC_DEBRIEF_LIBRARY.defeat.solutions],
    nextTitle:'Plan pour la prochaine tentative',
    next:GENERIC_DEBRIEF_LIBRARY.defeat.next
  };
}
function queueLearningDebrief(result,reason=''){
  pendingLearningDebrief=enrichLearningDebrief(buildLearningDebrief(result,reason));
  learningRecordDebrief(pendingLearningDebrief);
}
function renderLearningDebrief(data){
  if(!data)return;
  const modal=document.getElementById('learningDebriefModal');
  if(!modal)return;
  const isWin=data.result==='victory';
  document.getElementById('learningDebriefResult')?.classList.toggle('defeat',!isWin);
  const icon=document.getElementById('learningDebriefResultIcon');
  if(icon)icon.textContent=isWin?'✓':'↺';
  const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val||''};
  set('learningDebriefResultTitle',isWin?'Victoire analysée':'Défaite analysée');
  set('learningDebriefSummary',data.summary);
  set('learningDebriefWhy',data.why);
  set('learningDebriefLesson',data.lesson);
  set('learningDebriefStrengths',data.strengths);
  set('learningDebriefNextTitle',data.nextTitle);
  set('learningDebriefNextText',data.next);

  const solPanel=document.getElementById('learningDebriefSolutionsPanel');
  const list=document.getElementById('learningDebriefSolutions');
  if(solPanel)solPanel.hidden=isWin;
  if(list)list.innerHTML=(data.solutions||[]).map(x=>`<li>${x}</li>`).join('');

  set('learningDebriefSkill',data.skill);
  set('learningDebriefSkillTag',data.skill);
  set('learningDebriefErrorType',data.error);
  set('learningDebriefTimeQuality',data.timeQuality);
  set('learningDebriefPriority',data.priority);

  if(data.recurring){
    const [skillName,errorName]=data.recurring.key.split('|');
    set('learningDebriefRecurringTitle',`${skillName} — ${errorName}`);
    set('learningDebriefRecurringText',
      `${data.recurring.losses} échec${data.recurring.losses>1?'s':''} observé${data.recurring.losses>1?'s':''} sur ${data.recurring.attempts} tentative${data.recurring.attempts>1?'s':''}.`);
  }else{
    set('learningDebriefRecurringTitle','Aucune tendance détectée');
    set('learningDebriefRecurringText','Continue à jouer pour permettre au Coach d’identifier des habitudes.');
  }

  set('learningDebriefRecommendedExercise',data.exercise?.title||'Mission ciblée');
  set('learningDebriefRecommendedWhy',data.exercise?.why||'Entraînement conseillé selon la partie.');

  const checklist=document.getElementById('learningDebriefChecklist');
  if(checklist)checklist.innerHTML=(data.checklist||[]).map((x,i)=>`<span><b>${i+1}</b>${x}</span>`).join('');

  const train=document.getElementById('learningDebriefStartExercise');
  if(train){
    train.onclick=()=>{
      closeLearningDebrief();
      document.getElementById('trainingArchive')?.scrollIntoView({behavior:'smooth',block:'center'});
    };
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('learningDebriefContinue')?.focus(),0);
}
function showPendingLearningDebrief(){
  if(!pendingLearningDebrief)return;
  const data=pendingLearningDebrief;
  pendingLearningDebrief=null;
  renderLearningDebrief(data);
}
function closeLearningDebrief(){
  const modal=document.getElementById('learningDebriefModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
}
function initLearningDebrief(){
  document.getElementById('learningDebriefClose')?.addEventListener('click',closeLearningDebrief);
  document.getElementById('learningDebriefBackdrop')?.addEventListener('click',closeLearningDebrief);
  document.getElementById('learningDebriefContinue')?.addEventListener('click',closeLearningDebrief);
  document.getElementById('learningDebriefReview')?.addEventListener('click',()=>{
    closeLearningDebrief();
    document.getElementById('resetMission')?.click();
  });
}

// ===== v148: defeat feedback =====
function showMissionDefeatFeedback(message='Mission échouée. Recommence quand tu es prêt.'){
  const overlay=document.getElementById('missionDefeatOverlay');
  const msg=document.getElementById('missionDefeatMessage');
  if(msg)msg.textContent=message;
  if(!overlay)return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('missionDefeatRetry')?.focus(),0);
}
function closeMissionDefeatFeedback(showDebrief=true){
  const overlay=document.getElementById('missionDefeatOverlay');
  if(!overlay)return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  if(!showDebrief)return;
  if(pendingAIPostGame){
    pendingAIPostGame=false;
    pendingAIPostGameResult=null;
    setTimeout(showPostGame,180);
    return;
  }
  setTimeout(showPendingLearningDebrief,180);
}
function initMissionDefeatFeedback(){
  document.getElementById('missionDefeatRetry')?.addEventListener('click',()=>{
    closeMissionDefeatFeedback(true);
  });
  document.getElementById('missionDefeatBackdrop')?.addEventListener('click',closeMissionDefeatFeedback);
}

// ===== v38: difficulty-aware mission lives & countdown =====
const MISSION_MAX_LIVES=3;

const DIFFICULTY_GAMEPLAY_RULES={
  'very-easy':{
    label:'Très facile',
    countdown:false,
    seconds:null,
    lives:3,
    feature:'Apprentissage sans pression temporelle'
  },
  'easy':{
    label:'Facile',
    countdown:true,
    seconds:120,
    lives:3,
    feature:'Compte à rebours'
  },
  'medium':{
    label:'Moyen',
    countdown:true,
    seconds:105,
    lives:3,
    feature:'Compte à rebours + moins d’indices'
  },
  'hard':{
    label:'Difficile',
    countdown:true,
    seconds:90,
    lives:3,
    feature:'Réponses adverses + calcul'
  },
  'very-hard':{
    label:'Très difficile',
    countdown:true,
    seconds:75,
    lives:2,
    feature:'Précision + pression accrue'
  },
  'expert':{
    label:'Expert',
    countdown:true,
    seconds:60,
    lives:2,
    feature:'Variantes profondes'
  },
  'master':{
    label:'Maître',
    countdown:true,
    seconds:50,
    lives:1,
    feature:'Autonomie quasi totale'
  },
  'grandmaster':{
    label:'Grand Maître',
    countdown:true,
    seconds:45,
    lives:1,
    feature:'Défis ultimes'
  }
};

let currentMissionDifficulty='easy';
let missionLives=MISSION_MAX_LIVES;
let missionRemainingSeconds=120;
let missionTimerHandle=null;
let missionTimerRunning=false;

function getMissionDifficulty(){
  return DIFFICULTY_GAMEPLAY_RULES[currentMissionDifficulty]
      ? currentMissionDifficulty
      : 'easy';
}
function setMissionDifficulty(level){
  currentMissionDifficulty=DIFFICULTY_GAMEPLAY_RULES[level]?level:'easy';
  const rule=DIFFICULTY_GAMEPLAY_RULES[currentMissionDifficulty];
  missionLives=rule.lives;
  missionRemainingSeconds=rule.countdown?rule.seconds:0;
  updateMissionRuntimeUI();
}
function updateMissionRuntimeUI(){
  const rule=DIFFICULTY_GAMEPLAY_RULES[getMissionDifficulty()];
  const livesEl=document.getElementById('missionLives');
  const timerEl=document.getElementById('missionTimer');
  const timerItem=document.getElementById('missionTimerItem');
  const timerLabel=document.getElementById('missionTimerLabel');

  if(livesEl){
    const max=rule.lives;
    const full='♥ '.repeat(Math.max(0,missionLives)).trim();
    const empty='♡ '.repeat(Math.max(0,max-missionLives)).trim();
    livesEl.textContent=(full+(full&&empty?' ':'')+empty).trim();
    livesEl.classList.toggle('danger',missionLives===1);
    livesEl.classList.toggle('empty',missionLives<=0);
  }

  if(timerItem){
    timerItem.classList.toggle('timer-disabled',!rule.countdown);
  }
  if(timerLabel){
    timerLabel.textContent=rule.countdown?'Compte à rebours':'Temps libre';
  }
  if(timerEl){
    if(!rule.countdown){
      timerEl.textContent='∞';
      timerEl.classList.remove('urgent','critical');
    }else{
      const m=Math.floor(missionRemainingSeconds/60).toString().padStart(2,'0');
      const s=(missionRemainingSeconds%60).toString().padStart(2,'0');
      timerEl.textContent=`${m}:${s}`;
      timerEl.classList.toggle('urgent',missionRemainingSeconds<=30 && missionRemainingSeconds>10);
      timerEl.classList.toggle('critical',missionRemainingSeconds<=10);
    }
  }
}

function stopMissionTimer(){
  if(missionTimerHandle){clearInterval(missionTimerHandle);missionTimerHandle=null}
  missionTimerRunning=false;
}

function handleMissionTimeout(){
  stopMissionTimer();
  missionLives=0;
  updateMissionRuntimeUI();
  missionStatus.textContent='Temps écoulé. Recommence la mission pour tenter une nouvelle fois.';
  queueLearningDebrief('defeat','Le compte à rebours est arrivé à zéro avant la résolution.');
  showMissionDefeatFeedback('Temps écoulé. Le compte à rebours est terminé. Recommence la mission.');
  missionStatus.classList.remove('success-state');
  const board=document.getElementById('demoBoard');
  if(board)board.classList.add('mission-failed');
  nextMissionBtn.disabled=true;
  const reset=document.getElementById('resetMission');
  if(reset){
    reset.style.display='';
    reset.disabled=false;
    reset.textContent='Recommencer la mission';
  }
}

function startMissionTimer(reset=true){
  stopMissionTimer();
  const rule=DIFFICULTY_GAMEPLAY_RULES[getMissionDifficulty()];
  if(reset){
    missionLives=rule.lives;
    missionRemainingSeconds=rule.countdown?rule.seconds:0;
  }
  updateMissionRuntimeUI();

  // Très facile: no timer pressure.
  if(!rule.countdown){
    missionTimerRunning=false;
    return;
  }

  missionTimerRunning=true;
  missionTimerHandle=setInterval(()=>{
    if(!missionTimerRunning)return;
    missionRemainingSeconds=Math.max(0,missionRemainingSeconds-1);
    updateMissionRuntimeUI();
    if(missionRemainingSeconds<=0)handleMissionTimeout();
  },1000);
}

function resetMissionRuntime(){
  closeMissionDefeatFeedback(false);
  const rule=DIFFICULTY_GAMEPLAY_RULES[getMissionDifficulty()];
  missionLives=rule.lives;
  missionRemainingSeconds=rule.countdown?rule.seconds:0;
  const board=document.getElementById('demoBoard');
  if(board)board.classList.remove('mission-failed');
  updateMissionRuntimeUI();
  startMissionTimer(false);
}

function registerMissionMistake(message='Mauvaise réponse.'){
  if(currentCompleted)return;
  missionLives=Math.max(0,missionLives-1);
  updateMissionRuntimeUI();
  if(missionLives<=0){
    stopMissionTimer();
    missionStatus.textContent='Plus de vies. Recommence la mission pour réessayer.';
    queueLearningDebrief('defeat','Toutes les vies de cette tentative ont été utilisées.');
    showMissionDefeatFeedback('Tu as utilisé toutes tes vies. Analyse la position puis recommence.');
    missionStatus.classList.remove('success-state');
    const board=document.getElementById('demoBoard');
    if(board)board.classList.add('mission-failed');
    nextMissionBtn.disabled=true;
    const reset=document.getElementById('resetMission');
    if(reset){
      reset.style.display='';
      reset.disabled=false;
      reset.textContent='Recommencer la mission';
    }
    return false;
  }
  missionStatus.textContent=`${message} Il te reste ${missionLives} vie${missionLives>1?'s':''}.`;
  return true;
}

function registerMissionSuccessRuntime(){
  closeMissionDefeatFeedback(false);
  stopMissionTimer();
  const board=document.getElementById('demoBoard');
  if(board)board.classList.remove('mission-failed');
  updateMissionRuntimeUI();
}

// ===== v36: functional Lite shop =====
const SHOP_ITEMS=[
 {id:'board-ivory',name:'Échiquier Ivoire',type:'board',price:40,rarity:'Commun',icon:'▦'},
 {id:'board-midnight',name:'Échiquier Minuit',type:'board',price:80,rarity:'Rare',icon:'◫'},
 {id:'pieces-royal',name:'Pièces Royales',type:'pieces',price:120,rarity:'Épique',icon:'♛'},
 {id:'frame-gold',name:'Cadre Or',type:'frame',price:95,rarity:'Rare',icon:'✦'},
 {id:'banner-tactics',name:'Bannière Tacticien',type:'banner',price:70,rarity:'Rare',icon:'⚔'},
 {id:'effect-victory',name:'Éclat de Victoire',type:'effect',price:150,rarity:'Épique',icon:'✺'}
];
let shopInventory=[];try{shopInventory=JSON.parse(safeStorage.getItem(ECONOMY_KEYS.inventory)||'[]')}catch(e){shopInventory=[]}
if(!Array.isArray(shopInventory))shopInventory=[];
let shopEquipped={};try{shopEquipped=JSON.parse(safeStorage.getItem(ECONOMY_KEYS.equipped)||'{}')}catch(e){shopEquipped={}}

function saveShop(){
 safeStorage.setItem(ECONOMY_KEYS.inventory,JSON.stringify(shopInventory));
 safeStorage.setItem(ECONOMY_KEYS.equipped,JSON.stringify(shopEquipped));
}
// ===== v36: random world ribbons =====
const WORLD_RIBBONS=[
 'MISSION DU JOUR','BONUS XP','TACTIQUE','DÉFI RAPIDE','ENTRAÎNEMENT',
 'À REJOUER','OBJECTIF BONUS','ÉPREUVE SPÉCIALE','COACH IA','SANS INDICE'
];
function applyRandomWorldRibbons(){
  document.querySelectorAll('.world-card').forEach((card,idx)=>{
    card.querySelectorAll('.random-world-ribbon').forEach(x=>x.remove());
    // Deterministic-ish per session but visibly varied; around 45% of worlds get a ribbon.
    if(Math.random()<0.45){
      const r=document.createElement('span');
      r.className='random-world-ribbon variant-'+((idx+Math.floor(Math.random()*3))%3);
      r.textContent=WORLD_RIBBONS[Math.floor(Math.random()*WORLD_RIBBONS.length)];
      card.appendChild(r);
    }
  });
}

document.addEventListener('DOMContentLoaded',()=>{updateEconomyUI();applyRandomWorldRibbons()});
setTimeout(()=>{updateEconomyUI();applyRandomWorldRibbons()},0);


function ensureVictoryFeedback(message='Mission réussie !'){
  const modalEl=document.getElementById('rewardModal');
  if(modalEl?.classList.contains('open'))return;
  if(lastRewardPayload){
    const p=lastRewardPayload;
    lastRewardPayload=null;
    showVictoryReward({
      title:'Félicitations, vous avez gagné !',
      message,
      xp:p.xp||0,
      coins:p.coins||0,
      stars:p.stars||0,
      before:p.before||getEconomySnapshot(),
      after:p.after||getEconomySnapshot()
    });
    return;
  }
  showVictoryReward({
    title:'Félicitations, vous avez gagné !',
    message,
    xp:0,coins:0,stars:0,
    before:getEconomySnapshot(),
    after:getEconomySnapshot()
  });
}



const PRIMARY_SHOP_VISUAL_ITEMS=[{"id": "showcase-1", "name": "Royaume de Glace", "price": 1200, "icon": "♜", "type": "Échiquier", "rarity": "Épique"}, {"id": "showcase-2", "name": "Forge Écarlate", "price": 1600, "icon": "♞", "type": "Pièces", "rarity": "Épique"}, {"id": "showcase-3", "name": "Échiquier Aurora", "price": 2400, "icon": "✦", "type": "Effet", "rarity": "Légendaire"}, {"id": "showcase-4", "name": "La Sentinelle des Menaces", "price": 900, "icon": "♔", "type": "Avatar", "rarity": "Rare"}, {"id": "showcase-5", "name": "Le Gardien des 64 Cases", "price": 1800, "icon": "◈", "type": "Cadre", "rarity": "Légendaire"}, {"id": "showcase-6", "name": "Viper, l’Œil Tactique", "price": 2200, "icon": "◆", "type": "Thème", "rarity": "Légendaire"}, {"id": "showcase-7", "name": "Le Roi de Fer", "price": 2500, "icon": "♞", "type": "Collection", "rarity": "Rare"}, {"id": "showcase-8", "name": "Orion, le Commandant", "price": 2750, "icon": "♞", "type": "Collection", "rarity": "Rare"}, {"id": "showcase-9", "name": "Atlas, l’Architecte", "price": 3000, "icon": "♞", "type": "Collection", "rarity": "Rare"}, {"id": "showcase-10", "name": "Fortress, le Gardien des Finales", "price": 3250, "icon": "♞", "type": "Collection", "rarity": "Rare"}, {"id": "showcase-11", "name": "Mirror, l’Oracle", "price": 3500, "icon": "♞", "type": "Collection", "rarity": "Rare"}, {"id": "showcase-12", "name": "Aegis, la Sentinelle", "price": 3750, "icon": "♞", "type": "Collection", "rarity": "Rare"}];

const SHOWCASE_OWNED_KEY='echectuto-shop-showcase-owned-v45';
let showcaseOwned=(()=>{
  try{
    const raw=JSON.parse(safeStorage.getItem(SHOWCASE_OWNED_KEY)||'[]');
    return Array.isArray(raw)?raw:[];
  }catch(e){return []}
})();
function saveShowcaseOwned(){
  safeStorage.setItem(SHOWCASE_OWNED_KEY,JSON.stringify(showcaseOwned));
}
const SHOP_BOARD_ITEMS=[{"id": "board-classique-bois", "name": "Classique Bois", "price": 500, "rarity": "Commun", "desc": "L’élégance intemporelle.", "image": "assets/shop/boards/classique-bois.webp"}, {"id": "board-marbre-imperial", "name": "Marbre Impérial", "price": 800, "rarity": "Commun", "desc": "Noble et raffiné.", "image": "assets/shop/boards/marbre-imperial.webp"}, {"id": "board-glace-eternelle", "name": "Glace Éternelle", "price": 1200, "rarity": "Rare", "desc": "La beauté du givre.", "image": "assets/shop/boards/glace-eternelle.webp"}, {"id": "board-foret-enchantee", "name": "Forêt Enchantée", "price": 1200, "rarity": "Rare", "desc": "L’harmonie de la nature.", "image": "assets/shop/boards/foret-enchantee.webp"}, {"id": "board-volcanique", "name": "Volcanique", "price": 2400, "rarity": "Épique", "desc": "Forgé dans le feu.", "image": "assets/shop/boards/volcanique.webp"}, {"id": "board-cosmos", "name": "Cosmos", "price": 2000, "rarity": "Épique", "desc": "Les échecs sans frontières.", "image": "assets/shop/boards/cosmos.webp"}, {"id": "board-dragon-royal", "name": "Dragon Royal", "price": 2200, "rarity": "Épique", "desc": "La puissance légendaire.", "image": "assets/shop/boards/dragon-royal.webp"}, {"id": "board-or-royal", "name": "Or Royal", "price": 2500, "rarity": "Légendaire", "desc": "Brillez dans la victoire.", "image": "assets/shop/boards/or-royal.webp"}, {"id": "board-futuriste", "name": "Futuriste", "price": 1800, "rarity": "Rare", "desc": "L’innovation en jeu.", "image": "assets/shop/boards/futuriste.webp"}, {"id": "board-jardin-zen", "name": "Jardin Zen", "price": 1000, "rarity": "Rare", "desc": "Calme et maîtrise.", "image": "assets/shop/boards/jardin-zen.webp"}, {"id": "board-divin", "name": "Divin", "price": 3500, "rarity": "Légendaire", "desc": "Un échiquier hors du temps.", "image": "assets/shop/boards/divin.webp"}, {"id": "board-ombre-eternelle", "name": "Ombre Éternelle", "price": 3500, "rarity": "Légendaire", "desc": "La beauté de l’obscurité.", "image": "assets/shop/boards/ombre-eternelle.webp"}];


const SHOP_BOARD_THEME_CLASS_PREFIX='equipped-board-';
const SHOP_BOARD_THEME_MAP={
  'board-classique-bois':'classique-bois',
  'board-marbre-imperial':'marbre-imperial',
  'board-glace-eternelle':'glace-eternelle',
  'board-foret-enchantee':'foret-enchantee',
  'board-volcanique':'volcanique',
  'board-cosmos':'cosmos',
  'board-dragon-royal':'dragon-royal',
  'board-or-royal':'or-royal',
  'board-futuriste':'futuriste',
  'board-jardin-zen':'jardin-zen',
  'board-divin':'divin',
  'board-ombre-eternelle':'ombre-eternelle'
};

function applyEquippedBoardTheme(){
  const root=document.documentElement;
  Object.values(SHOP_BOARD_THEME_MAP).forEach(slug=>{
    root.classList.remove(`${SHOP_BOARD_THEME_CLASS_PREFIX}${slug}`);
  });
  const slug=SHOP_BOARD_THEME_MAP[shopBoardEquipped] || 'classique-bois';
  root.classList.add(`${SHOP_BOARD_THEME_CLASS_PREFIX}${slug}`);

  const item=(typeof SHOP_BOARD_ITEMS!=='undefined'
    ? SHOP_BOARD_ITEMS.find(x=>x.id===shopBoardEquipped)
    : null);
  document.querySelectorAll('[data-active-board-label]').forEach(el=>{
    el.textContent=item?item.name:'Classique Bois';
  });
}


const SHOP_BOARD_FAVORITES_KEY='echectuto-shop-board-favorites-v66';
const SHOP_BOARD_HISTORY_KEY='echectuto-shop-board-history-v66';
let shopBoardFavorites=safeStorage.getJSON
  ? (safeStorage.getJSON(SHOP_BOARD_FAVORITES_KEY,[])||[])
  : (()=>{try{return JSON.parse(localStorage.getItem(SHOP_BOARD_FAVORITES_KEY)||'[]')}catch{return []}})();
let shopBoardHistory=(()=>{
  try{return JSON.parse(safeStorage.getItem(SHOP_BOARD_HISTORY_KEY)||'[]')}catch{return []}
})();
let shopBoardFilter='all';

let shopBoardSearch='';
let shopBoardRarity='all';
let shopBoardAffordableOnly=false;
let shopBoardSort='smart';
let shopBoardPreviewId=null;
const SHOP_BOARD_RECENT_KEY='echectuto-shop-board-recent-v76';

const SHOP_PREFS_KEY='echectuto-shop-prefs-v86';
const SHOP_COMPARE_KEY='echectuto-shop-compare-v86';
let shopHideOwned=false;
let shopPriceRange='all';
let shopBoardCompare=(()=>{
  try{return JSON.parse(safeStorage.getItem(SHOP_COMPARE_KEY)||'[]')}catch{return []}
})();
function loadShopPrefs(){
  try{
    const p=JSON.parse(safeStorage.getItem(SHOP_PREFS_KEY)||'{}');
    if(typeof p.search==='string')shopBoardSearch=p.search;
    if(typeof p.rarity==='string')shopBoardRarity=p.rarity;
    if(typeof p.affordable==='boolean')shopBoardAffordableOnly=p.affordable;
    if(typeof p.hideOwned==='boolean')shopHideOwned=p.hideOwned;
    if(typeof p.priceRange==='string')shopPriceRange=p.priceRange;
    if(typeof p.sort==='string')shopBoardSort=p.sort;
  }catch{}
}
loadShopPrefs();
function saveShopPrefs(){
  try{
    safeStorage.setItem(SHOP_PREFS_KEY,JSON.stringify({
      search:shopBoardSearch,
      rarity:shopBoardRarity,
      affordable:shopBoardAffordableOnly,
      hideOwned:shopHideOwned,
      priceRange:shopPriceRange,
      sort:shopBoardSort
    }));
  }catch{}
}
function saveCompare(){
  try{safeStorage.setItem(SHOP_COMPARE_KEY,JSON.stringify(shopBoardCompare.slice(0,3)))}catch{}
}
function boardMatchesPriceRange(item){
  if(shopPriceRange==='all')return true;
  if(shopPriceRange==='0-1000')return item.price<=1000;
  if(shopPriceRange==='1001-2000')return item.price>=1001&&item.price<=2000;
  if(shopPriceRange==='2001-3000')return item.price>=2001&&item.price<=3000;
  if(shopPriceRange==='3001+')return item.price>=3001;
  return true;
}
function toggleBoardCompare(id){
  if(shopBoardCompare.includes(id)){
    shopBoardCompare=shopBoardCompare.filter(x=>x!==id);
  }else{
    if(shopBoardCompare.length>=3){
      showShopTransient('Comparaison limitée à 3 échiquiers.','error');
      return;
    }
    shopBoardCompare.push(id);
  }
  saveCompare();
  renderCompareTray();
  refreshCompareButtons();
}
function refreshCompareButtons(){
  document.querySelectorAll('.board-compare-btn').forEach(btn=>{
    const id=btn.closest('.board-product-card')?.dataset.shopItemId;
    const on=shopBoardCompare.includes(id);
    btn.classList.toggle('active',on);
    btn.textContent=on?'✓ Comparer':'Comparer';
  });
}
function renderCompareTray(){
  const tray=document.getElementById('shopCompareTray');
  const list=document.getElementById('shopCompareList');
  if(!tray||!list)return;
  const items=shopBoardCompare.map(id=>SHOP_BOARD_ITEMS.find(x=>x.id===id)).filter(Boolean);
  if(!items.length){
    tray.classList.remove('open');
    tray.setAttribute('aria-hidden','true');
    list.innerHTML='';
    return;
  }
  tray.classList.add('open');
  tray.setAttribute('aria-hidden','false');
  list.innerHTML=items.map(item=>`
    <article class="shop-compare-card">
      <img src="${item.image}" alt="${item.name}">
      <div><strong>${item.name}</strong><small>${item.rarity}</small></div>
      <b>${isBoardOwned(item.id)?'Possédé':item.price.toLocaleString('fr-FR')+' ETS'}</b>
    </article>`).join('');
}
function showPurchaseReceipt(item,before,after){
  const receipt=document.getElementById('shopReceipt');
  const title=document.getElementById('shopReceiptTitle');
  const details=document.getElementById('shopReceiptDetails');
  if(!receipt||!title||!details)return;
  title.textContent=item.name;
  details.innerHTML=`
    <div><span>Prix</span><b>${item.price.toLocaleString('fr-FR')} ETS</b></div>
    <div><span>Solde avant</span><b>${before.toLocaleString('fr-FR')} ETS</b></div>
    <div><span>Solde après</span><b>${after.toLocaleString('fr-FR')} ETS</b></div>`;
  receipt.classList.add('open');
  receipt.setAttribute('aria-hidden','false');
  clearTimeout(showPurchaseReceipt._timer);
  showPurchaseReceipt._timer=setTimeout(()=>{
    receipt.classList.remove('open');
    receipt.setAttribute('aria-hidden','true');
  },5000);
}
function discoverRandomBoard(){
  const candidates=getFilteredSortedBoards();
  if(!candidates.length){
    showShopTransient('Aucun échiquier disponible avec ces filtres.','error');
    return;
  }
  const item=candidates[Math.floor(Math.random()*candidates.length)];
  openBoardDetail(item);
}
let shopBoardRecent=(()=>{
  try{return JSON.parse(localStorage.getItem(SHOP_BOARD_RECENT_KEY)||'[]')}catch{return []}
})();

function saveBoardRecent(){
  try{localStorage.setItem(SHOP_BOARD_RECENT_KEY,JSON.stringify(shopBoardRecent.slice(0,6)))}catch{}
}
function rememberBoardViewed(id){
  shopBoardRecent=[id,...shopBoardRecent.filter(x=>x!==id)].slice(0,6);
  saveBoardRecent();
  renderRecentBoards();
}
function renderRecentBoards(){
  const host=document.getElementById('shopRecentList');
  if(!host)return;
  const items=shopBoardRecent.map(id=>SHOP_BOARD_ITEMS.find(x=>x.id===id)).filter(Boolean);
  if(!items.length){
    host.innerHTML='<span class="shop-recent-empty">Aucun aperçu pour le moment.</span>';
    return;
  }
  host.innerHTML='';
  items.forEach(item=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='shop-recent-chip';
    btn.innerHTML=`<img src="${item.image}" alt=""><span>${item.name}</span>`;
    btn.addEventListener('click',()=>openBoardDetail(item));
    host.appendChild(btn);
  });
}
function renderCollectionMilestones(){
  const host=document.getElementById('shopMilestoneList');
  if(!host)return;
  const owned=SHOP_BOARD_ITEMS.filter(x=>isBoardOwned(x.id)).length;
  const total=SHOP_BOARD_ITEMS.length;
  const pct=Math.round((owned/total)*100);
  const milestones=[
    {pct:25,label:'Collectionneur I'},
    {pct:50,label:'Collectionneur II'},
    {pct:75,label:'Collectionneur III'},
    {pct:100,label:'Maître des Plateaux'}
  ];
  host.innerHTML=milestones.map(m=>{
    const done=pct>=m.pct;
    return `<span class="shop-milestone${done?' complete':''}" title="${m.pct}%">${done?'✓':'○'} ${m.label}</span>`;
  }).join('');
}
function updateShopStats(){
  const owned=SHOP_BOARD_ITEMS.filter(x=>isBoardOwned(x.id)).length;
  const balance=Number(playerEconomy?.coins||0);
  const affordable=SHOP_BOARD_ITEMS.filter(x=>!isBoardOwned(x.id) && x.price<=balance).length;
  const legendary=SHOP_BOARD_ITEMS.filter(x=>x.rarity==='Légendaire' && isBoardOwned(x.id)).length;
  const ownedEl=document.getElementById('shopStatOwned');
  const affEl=document.getElementById('shopStatAffordable');
  const legEl=document.getElementById('shopStatLegendary');
  if(ownedEl)ownedEl.textContent=`${owned} possédés`;
  if(affEl)affEl.textContent=`${affordable} accessibles`;
  if(legEl)legEl.textContent=`${legendary} légendaires`;
}
function previewBoardTemporarily(id){
  const item=SHOP_BOARD_ITEMS.find(x=>x.id===id);
  if(!item)return;
  shopBoardPreviewId=id;
  const root=document.documentElement;
  Object.values(SHOP_BOARD_THEME_MAP).forEach(slug=>{
    root.classList.remove(`${SHOP_BOARD_THEME_CLASS_PREFIX}${slug}`);
  });
  const slug=SHOP_BOARD_THEME_MAP[id]||'classique-bois';
  root.classList.add(`${SHOP_BOARD_THEME_CLASS_PREFIX}${slug}`);

  const panel=document.getElementById('shopLivePreview');
  const name=document.getElementById('shopLivePreviewName');
  if(name)name.textContent=item.name;
  if(panel){
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
  }
}
function restoreEquippedBoardPreview(){
  shopBoardPreviewId=null;
  applyEquippedBoardTheme();
  const panel=document.getElementById('shopLivePreview');
  if(panel){
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
  }
}


function saveBoardFavorites(){
  try{localStorage.setItem(SHOP_BOARD_FAVORITES_KEY,JSON.stringify(shopBoardFavorites))}catch{}
}
function saveBoardHistory(){
  try{localStorage.setItem(SHOP_BOARD_HISTORY_KEY,JSON.stringify(shopBoardHistory.slice(0,40)))}catch{}
}
function isBoardOwned(id){
  return id==='board-classique-bois' || shopBoardsOwned.includes(id);
}
function getBoardRarityWeight(rarity){
  return ({'Commun':1,'Rare':2,'Épique':3,'Légendaire':4})[rarity]||0;
}
function showShopTransient(text,type='success'){
  const notice=document.getElementById('shopPurchaseNotice');
  if(!notice)return;
  notice.textContent=text;
  notice.classList.remove('error','success');
  notice.classList.add('visible',type);
  clearTimeout(showShopTransient._timer);
  showShopTransient._timer=setTimeout(()=>{
    notice.classList.remove('visible','error','success');
    notice.textContent='';
  },1000);
}
function updateBoardCollectionProgress(){
  const owned=SHOP_BOARD_ITEMS.filter(x=>isBoardOwned(x.id)).length;
  const total=SHOP_BOARD_ITEMS.length;
  const text=document.getElementById('shopCollectionProgressText');
  const bar=document.getElementById('shopCollectionProgressBar');
  if(text)text.textContent=`${owned} / ${total}`;
  if(bar)bar.style.width=`${Math.round((owned/total)*100)}%`;
  renderCollectionMilestones();
  updateShopStats();
}
function renderBoardHistory(){
  const list=document.getElementById('shopHistoryList');
  if(!list)return;
  if(!shopBoardHistory.length){
    list.innerHTML='<div class="shop-history-empty">Aucun achat enregistré.</div>';
    return;
  }
  list.innerHTML=shopBoardHistory.map(entry=>`
    <div class="shop-history-entry">
      <div><strong>${entry.name}</strong><small>${entry.rarity||'Échiquier'}</small></div>
      <div><b>− ${Number(entry.price||0).toLocaleString('fr-FR')} ETS</b><small>${entry.when||''}</small></div>
    </div>`).join('');
}
function openBoardDetail(item){
  const panel=document.getElementById('shopBoardDetail');
  if(!panel)return;
  rememberBoardViewed(item.id);
  const owned=isBoardOwned(item.id);
  const equipped=shopBoardEquipped===item.id;
  const favorite=shopBoardFavorites.includes(item.id);
  panel.innerHTML=`
    <button type="button" class="shop-detail-close" aria-label="Fermer">×</button>
    <img src="${item.image}" alt="${item.name}">
    <div>
      <small>${item.rarity} · Échiquier</small>
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <div class="shop-detail-state">${equipped?'Équipé':owned?'Possédé':item.price.toLocaleString('fr-FR')+' ETS'} · ${favorite?'★ Favori':'☆ Non favori'}</div>
      <div class="shop-detail-actions">
        <button type="button" class="shop-preview-btn">Prévisualiser sur le plateau</button>
        ${owned&&!equipped?'<button type="button" class="shop-detail-equip">Équiper</button>':''}
      </div>
    </div>`;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden','false');
  panel.querySelector('.shop-preview-btn')?.addEventListener('click',()=>previewBoardTemporarily(item.id));
  panel.querySelector('.shop-detail-equip')?.addEventListener('click',()=>{
    equipBoardInPlace(item.id);
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
  });
  panel.querySelector('.shop-detail-close')?.addEventListener('click',()=>{
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
  },{once:true});
}
function getFilteredSortedBoards(){
  let items=[...SHOP_BOARD_ITEMS];
  const balance=Number(playerEconomy?.coins||0);
  const query=shopBoardSearch.trim().toLocaleLowerCase('fr');

  if(shopBoardFilter==='available')items=items.filter(x=>!isBoardOwned(x.id));
  if(shopBoardFilter==='owned')items=items.filter(x=>isBoardOwned(x.id));
  if(shopBoardFilter==='favorites')items=items.filter(x=>shopBoardFavorites.includes(x.id));
  if(shopBoardRarity!=='all')items=items.filter(x=>x.rarity===shopBoardRarity);
  if(shopBoardAffordableOnly)items=items.filter(x=>isBoardOwned(x.id)||x.price<=balance);
  if(shopHideOwned)items=items.filter(x=>!isBoardOwned(x.id));
  items=items.filter(boardMatchesPriceRange);
  if(query){
    items=items.filter(x=>
      x.name.toLocaleLowerCase('fr').includes(query) ||
      x.desc.toLocaleLowerCase('fr').includes(query) ||
      x.rarity.toLocaleLowerCase('fr').includes(query)
    );
  }

  if(shopBoardSort==='smart'){
    items.sort((a,b)=>{
      const score=(x)=>{
        let s=0;
        if(shopBoardFavorites.includes(x.id))s+=30;
        if(isBoardOwned(x.id))s+=8;
        if(!isBoardOwned(x.id) && x.price<=balance)s+=18;
        s+=getBoardRarityWeight(x.rarity)*3;
        return s;
      };
      return score(b)-score(a) || a.price-b.price;
    });
  }
  if(shopBoardSort==='price-asc')items.sort((a,b)=>a.price-b.price);
  if(shopBoardSort==='price-desc')items.sort((a,b)=>b.price-a.price);
  return items;
}
function createBoardEquipButton(item){
  const btn=document.createElement('button');
  btn.className='board-equip-icon';
  btn.type='button';
  btn.title='Équiper cet échiquier';
  btn.setAttribute('aria-label',`Équiper ${item.name}`);
  btn.textContent='⚔';
  return btn;
}
function syncBoardCardsAfterEquip(){
  const grid=document.getElementById('shopModalGrid');
  if(!grid)return;
  grid.querySelectorAll('.board-product-card').forEach(card=>{
    const id=card.dataset.shopItemId;
    const item=SHOP_BOARD_ITEMS.find(x=>x.id===id);
    if(!item)return;
    const wrap=card.querySelector('.board-product-image-wrap');
    const oldBadge=card.querySelector('.board-equipped-badge');
    const oldIcon=card.querySelector('.board-equip-icon');
    if(id===shopBoardEquipped){
      if(oldIcon)oldIcon.remove();
      if(!oldBadge && wrap){
        const badge=document.createElement('span');
        badge.className='board-equipped-badge';
        badge.textContent='Équipé';
        wrap.appendChild(badge);
      }
      card.classList.add('is-equipped');
    }else{
      if(oldBadge)oldBadge.remove();
      if(isBoardOwned(id) && !oldIcon && wrap){
        wrap.appendChild(createBoardEquipButton(item));
      }
      card.classList.remove('is-equipped');
    }
  });
}
function equipBoardInPlace(id){
  const item=SHOP_BOARD_ITEMS.find(x=>x.id===id);
  if(!item || !isBoardOwned(id))return;
  shopBoardEquipped=id;
  saveShopBoards();
  updateEquippedBoardUI();
  applyEquippedBoardTheme();
  syncBoardCardsAfterEquip();
  showShopTransient(`${item.name} est équipé.`,'success');
  pushShopActivity(`Équipé : ${item.name}`);
  syncShopAdvancedUI();
}
function purchaseBoardInPlace(item,card){
  if(!item || !card || isBoardOwned(item.id))return;
  const balance=Number(playerEconomy?.coins||0);
  const price=Number(item.price||0);
  if(balance<price){
    const missing=price-balance;
    card.classList.add('purchase-error','shop-shake');
    let local=card.querySelector('.card-purchase-feedback');
    if(!local){
      local=document.createElement('div');
      local.className='card-purchase-feedback';
      card.appendChild(local);
    }
    local.textContent=`Fonds insuffisants · manque ${missing.toLocaleString('fr-FR')} ETS`;
    showShopTransient(`Fonds insuffisants — Il manque ${missing.toLocaleString('fr-FR')} ETS.`,'error');
    setTimeout(()=>{
      card.classList.remove('purchase-error','shop-shake');
      local.remove();
    },1000);
    return;
  }

  const balanceBefore=balance;
  playerEconomy.coins=balance-price;
  if(!shopBoardsOwned.includes(item.id))shopBoardsOwned.push(item.id);
  shopBoardHistory.unshift({
    id:item.id,name:item.name,price:item.price,rarity:item.rarity,
    when:new Date().toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
  });
  saveShopBoards();
  saveBoardHistory();
  economySave();
  updateEconomyUI();
  updateShopETSBalance();
  showPurchaseReceipt(item,balanceBefore,Number(playerEconomy.coins||0));
  updateBoardCollectionProgress();
  renderBoardHistory();
  renderCollectionMilestones();
  updateShopStats();

  const footer=card.querySelector('.board-card-footer');
  if(footer)footer.innerHTML='<div class="board-owned-state">Possédé</div>';
  const wrap=card.querySelector('.board-product-image-wrap');
  if(wrap && !wrap.querySelector('.board-equip-icon'))wrap.appendChild(createBoardEquipButton(item));
  card.classList.add('purchase-success');
  setTimeout(()=>card.classList.remove('purchase-success'),1000);
  showShopTransient(`Achat réussi — ${item.name}.`,'success');
  pushShopActivity(`Achat : ${item.name}`);
  syncShopAdvancedUI();
}
function refreshBoardFavoriteButton(card,id){
  const btn=card?.querySelector('.board-favorite-btn');
  if(!btn)return;
  const on=shopBoardFavorites.includes(id);
  btn.classList.toggle('active',on);
  btn.textContent=on?'★':'☆';
  btn.setAttribute('aria-label',on?'Retirer des favoris':'Ajouter aux favoris');
  btn.title=on?'Retirer des favoris':'Ajouter aux favoris';
}
function toggleBoardFavorite(id,card){
  if(shopBoardFavorites.includes(id)){
    shopBoardFavorites=shopBoardFavorites.filter(x=>x!==id);
  }else{
    shopBoardFavorites.push(id);
  }
  saveBoardFavorites();
  refreshBoardFavoriteButton(card,id);
  syncShopAdvancedUI();
  if(shopBoardFilter==='favorites' && !shopBoardFavorites.includes(id)){
    card.classList.add('shop-card-leave');
    setTimeout(()=>card.remove(),180);
  }
}
const SHOP_BOARD_OWNED_KEY='echectuto-shop-boards-owned-v47';
const SHOP_BOARD_EQUIPPED_KEY='echectuto-shop-board-equipped-v47';
let shopBoardsOwned=(()=>{
  try{const v=JSON.parse(safeStorage.getItem(SHOP_BOARD_OWNED_KEY)||'[]');return Array.isArray(v)?v:[]}
  catch(e){return []}
})();
let shopBoardEquipped=safeStorage.getItem(SHOP_BOARD_EQUIPPED_KEY)||'board-classique-bois';
function saveShopBoards(){
  safeStorage.setItem(SHOP_BOARD_OWNED_KEY,JSON.stringify(shopBoardsOwned));
  safeStorage.setItem(SHOP_BOARD_EQUIPPED_KEY,shopBoardEquipped);
}

function getEquippedBoardItem(){
  return (typeof SHOP_BOARD_ITEMS!=='undefined'
    ? SHOP_BOARD_ITEMS.find(x=>x.id===shopBoardEquipped)
    : null) || null;
}

function updateEquippedBoardUI(){
  const item=getEquippedBoardItem();
  document.querySelectorAll('[data-equipped-board-name]').forEach(el=>{
    el.textContent=item?item.name:'Aucun';
  });
  const profile=document.getElementById('profileEquippedValue');
  if(profile)profile.textContent=item?`Échiquier : ${item.name}`:'Aucun échiquier équipé';
}
// ===== v39: animated shop modal =====



function updateShopETSBalance(){
  const el=document.getElementById('shopETSBalance');
  if(!el)return;
  const balance=Math.max(0,Number(playerEconomy?.coins||0));
  el.textContent=`${balance.toLocaleString('fr-FR')} ETS`;
}

function openShopModal(){
  updateEquippedBoardUI();
  const modal=document.getElementById('shopModal');
  if(!modal)return;
  renderShopModal();
  renderCompareTray();
  updateEconomyUI();
  updateShopETSBalance();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}

function closeShopModal(){
  restoreEquippedBoardPreview();
  const modal=document.getElementById('shopModal');
  if(!modal)return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

function renderShopModal(){
  const grid=document.getElementById('shopModalGrid');
  const msg=document.getElementById('shopModalMessage');
  if(!grid)return;

  const alertMsg=document.getElementById('shopAlertMessage');
  grid.innerHTML='';

  // 1) REAL INDIVIDUAL CHESSBOARDS — primary catalogue
  // 1) REAL INDIVIDUAL CHESSBOARDS — stable, filterable catalogue
  const visibleBoards=getFilteredSortedBoards();
  visibleBoards.forEach((item,idx)=>{
    const owned=isBoardOwned(item.id);
    const equipped=shopBoardEquipped===item.id;
    const favorite=shopBoardFavorites.includes(item.id);

    const card=document.createElement('article');
    const rarityClass=item.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    card.className=`shop-modal-item board-product-card rarity-${rarityClass}${equipped?' is-equipped':''}`;
    card.dataset.shopItemId=item.id;
    card.dataset.shopCategory='board';
    card.tabIndex=0;
    card.setAttribute('aria-label',`${item.name}, ${item.rarity}, ${owned?'possédé':item.price.toLocaleString('fr-FR')+' ETS'}`);
    card.style.animationDelay=`${Math.min(idx*35,280)}ms`;

    card.innerHTML=`
      <div class="board-product-image-wrap">
        <img class="board-product-image" src="${item.image}" alt="${item.name}" loading="eager">
        <span class="board-rarity">${item.rarity}</span>
        ${!owned&&item.price<=Number(playerEconomy?.coins||0)?'<span class="board-affordable-badge">Achetable</span>':''}
        ${shopBoardFavorites.includes(item.id)&&!owned?'<span class="board-wishlist-badge">Souhait</span>':''}
        <button type="button" class="board-favorite-btn${favorite?' active':''}" aria-label="${favorite?'Retirer des favoris':'Ajouter aux favoris'}" title="${favorite?'Retirer des favoris':'Ajouter aux favoris'}">${favorite?'★':'☆'}</button>
        ${equipped?'<span class="board-equipped-badge">Équipé</span>':''}
        ${owned&&!equipped?'<button class="board-equip-icon" type="button" title="Équiper cet échiquier" aria-label="Équiper '+item.name+'">⚔</button>':''}
      </div>
      <div class="shop-modal-meta board-meta-compact">
        <small>Échiquier</small>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
      <div class="board-compare-row">
        <button type="button" class="board-compare-btn${shopBoardCompare.includes(item.id)?' active':''}">${shopBoardCompare.includes(item.id)?'✓ Comparer':'Comparer'}</button>
      </div>
      <div class="board-card-footer">
        ${owned
          ? '<div class="board-owned-state">Possédé</div>'
          : `<div class="board-price">${item.price.toLocaleString('fr-FR')} ETS</div>
             <small class="board-after-buy">${Number(playerEconomy?.coins||0)>=item.price?'Reste '+(Number(playerEconomy.coins)-item.price).toLocaleString('fr-FR')+' ETS':'Manque '+(item.price-Number(playerEconomy?.coins||0)).toLocaleString('fr-FR')+' ETS'}</small>
             <button class="board-buy-btn" type="button">Acheter</button>`}
      </div>`;

    card.querySelector('.board-product-image')?.addEventListener('error',()=>{
      card.classList.add('image-load-failed');
      if(msg)msg.textContent=`Le visuel de ${item.name} n’a pas pu être chargé.`;
    });

    card.querySelector('.board-buy-btn')?.addEventListener('click',(e)=>{
      e.preventDefault(); e.stopPropagation();
      purchaseBoardInPlace(item,card);
    });
    card.querySelector('.board-equip-icon')?.addEventListener('click',(e)=>{
      e.preventDefault(); e.stopPropagation();
      equipBoardInPlace(item.id);
    });
    card.querySelector('.board-favorite-btn')?.addEventListener('click',(e)=>{
      e.preventDefault(); e.stopPropagation();
      toggleBoardFavorite(item.id,card);
    });
    card.querySelector('.board-compare-btn')?.addEventListener('click',(e)=>{
      e.preventDefault(); e.stopPropagation();
      toggleBoardCompare(item.id);
    });
    card.querySelector('.board-product-image-wrap')?.addEventListener('dblclick',(e)=>{
      if(e.target.closest('button'))return;
      openBoardDetail(item);
    });
    card.querySelector('.shop-modal-meta')?.addEventListener('click',()=>openBoardDetail(item));

    let previewTimer=null;
    card.addEventListener('mouseenter',()=>{
      clearTimeout(previewTimer);
      previewTimer=setTimeout(()=>previewBoardTemporarily(item.id),350);
    });
    card.addEventListener('mouseleave',()=>{
      clearTimeout(previewTimer);
      restoreEquippedBoardPreview();
    });
    card.addEventListener('focusin',()=>{
      clearTimeout(previewTimer);
      previewTimer=setTimeout(()=>previewBoardTemporarily(item.id),350);
    });
    card.addEventListener('focusout',()=>{
      clearTimeout(previewTimer);
      restoreEquippedBoardPreview();
    });

    grid.appendChild(card);
  });
  if(!visibleBoards.length){
    const empty=document.createElement('div');
    empty.className='shop-board-empty';
    empty.innerHTML=`
      <strong>${shopBoardFilter==='favorites'?'Aucun échiquier favori pour le moment.':'Aucun échiquier dans cette sélection.'}</strong>
      <button type="button" class="shop-reset-filters">Réinitialiser les filtres</button>`;
    empty.querySelector('.shop-reset-filters')?.addEventListener('click',()=>{
      shopBoardFilter='all';
      shopBoardSearch='';
      shopBoardRarity='all';
      shopBoardAffordableOnly=false;
      shopHideOwned=false;
      shopPriceRange='all';
      shopBoardSort='smart';
      saveShopPrefs();
      renderShopModal();
    });
    grid.appendChild(empty);
  }
  updateBoardCollectionProgress();
  renderBoardHistory();

  // 2) Existing cosmetic catalogue — stable DOM, no full rerender after purchase/equip
  SHOP_ITEMS.forEach((item,idx)=>{
    const initiallyOwned=shopInventory.includes(item.id);
    const initiallyEquipped=shopEquipped[item.type]===item.id;
    const card=document.createElement('article');
    card.className='shop-modal-item legacy-cosmetic-card '+(initiallyOwned?'owned ':'')+(initiallyEquipped?'equipped':'');
    card.dataset.legacyShopId=item.id;
    card.dataset.legacyShopType=item.type;
    card.style.animationDelay=`${(visibleBoards.length+idx)*35}ms`;

    card.innerHTML=`
      <div class="shop-modal-visual shop-product-visual" data-product-type="${String(item.type||'collection').toLowerCase()}">
        <div class="shop-modal-orbit"></div>
        <div class="shop-product-art" aria-hidden="true"></div>
        <span class="shop-product-icon">${item.icon}</span>
      </div>
      <div class="shop-modal-meta">
        <small>${item.rarity}</small>
        <h3>${item.name}</h3>
        <p>${item.type}</p>
      </div>
      <div class="shop-modal-buy">
        <strong class="legacy-shop-price">${initiallyOwned?'Possédé':item.price.toLocaleString('fr-FR')+' ETS'}</strong>
        <button type="button" class="legacy-shop-action" ${initiallyEquipped?'disabled':''}>${initiallyEquipped?'Équipé':initiallyOwned?'Équiper':'Acheter'}</button>
      </div>`;

    const action=card.querySelector('.legacy-shop-action');
    const priceEl=card.querySelector('.legacy-shop-price');
    action.onclick=()=>{
      const ownedNow=shopInventory.includes(item.id);
      const equippedNow=shopEquipped[item.type]===item.id;

      if(!ownedNow){
        if(!spendCoins(item.price)){
          if(msg)msg.textContent=`Fonds insuffisants : ${item.price.toLocaleString('fr-FR')} ETS nécessaires.`;
          card.classList.add('shop-shake','purchase-error');
          setTimeout(()=>card.classList.remove('shop-shake','purchase-error'),600);
          return;
        }
        shopInventory.push(item.id);
        saveShop();
        card.classList.add('owned','purchase-success');
        priceEl.textContent='Possédé';
        action.textContent='Équiper';
        if(msg)msg.textContent=`${item.name} acheté avec succès.`;
        setTimeout(()=>card.classList.remove('purchase-success'),900);
        pushShopActivity?.(`Achat : ${item.name}`);
        return;
      }

      if(equippedNow)return;
      shopEquipped[item.type]=item.id;
      saveShop();
      document.querySelectorAll(`.legacy-cosmetic-card[data-legacy-shop-type="${item.type}"]`).forEach(other=>{
        const otherId=other.dataset.legacyShopId;
        const otherBtn=other.querySelector('.legacy-shop-action');
        const active=otherId===item.id;
        other.classList.toggle('equipped',active);
        if(otherBtn){
          otherBtn.disabled=active;
          otherBtn.textContent=active?'Équipé':'Équiper';
        }
      });
      if(msg)msg.textContent=`${item.name} est maintenant équipé.`;
      pushShopActivity?.(`Équipé : ${item.name}`);
    };

    grid.appendChild(card);
  });

  // 3) Showcase-derived cosmetics available only in real shop
  PRIMARY_SHOP_VISUAL_ITEMS.forEach((item,idx)=>{
    const owned=showcaseOwned.includes(item.id);
    const card=document.createElement('article');
    card.className='shop-modal-item shop-visual-source-item'+(owned?' owned':'');
    card.dataset.shopItemId=item.id;
    card.style.animationDelay=`${(getFilteredSortedBoards().length+SHOP_ITEMS.length+idx)*35}ms`;

    card.innerHTML=`
      <div class="shop-modal-visual shop-product-visual" data-product-type="${String(item.type||'collection').toLowerCase()}">
        <div class="shop-modal-orbit"></div>
        <div class="shop-product-art" aria-hidden="true"></div>
        <span class="shop-product-icon">${item.icon}</span>
      </div>
      <div class="shop-modal-meta">
        <small>${item.rarity}</small>
        <h3>${item.name}</h3>
        <p>${item.type}</p>
      </div>
      <div class="shop-modal-buy">
        <strong>${item.price.toLocaleString('fr-FR')} ETS</strong>
        <button type="button" ${owned?'disabled':''}>${owned?'Acheté':'Acheter'}</button>
      </div>`;

    card.querySelector('button').onclick=()=>{
      if(showcaseOwned.includes(item.id)){
        if(msg)msg.textContent=`${item.name} est déjà dans ta collection.`;
        return;
      }
      if(playerEconomy.coins<item.price){
        const deficit=item.price-playerEconomy.coins;
        const text=`Fonds insuffisants : ${item.price.toLocaleString('fr-FR')} ETS nécessaires. Solde : ${playerEconomy.coins.toLocaleString('fr-FR')} ETS. Il manque ${deficit.toLocaleString('fr-FR')} ETS.`;
        if(msg)msg.textContent=text;
        if(alertMsg){
          alertMsg.textContent=text;
          alertMsg.classList.add('visible','error');
          setTimeout(()=>alertMsg.classList.remove('visible'),4500);
        }
        card.classList.add('shop-shake','purchase-error');
        let local=card.querySelector('.card-purchase-feedback');
        if(!local){
          local=document.createElement('div');
          local.className='card-purchase-feedback';
          card.appendChild(local);
        }
        local.textContent='Fonds insuffisants';
        setTimeout(()=>card.classList.remove('shop-shake','purchase-error'),650);
        setTimeout(()=>local?.remove(),3600);
        return;
      }
      playerEconomy.coins-=item.price;
      showcaseOwned.push(item.id);
      saveShowcaseOwned();
      economySave();
      updateEconomyUI();
      if(msg)msg.textContent=`Achat réussi : ${item.name} rejoint ta collection.`;
      renderShopModal();
    };

    grid.appendChild(card);
  });

  updateEconomyUI();
}

// ===== v40: reliable modal bindings =====
function initInteractiveOverlays(){
  document.getElementById('rewardModalClose')?.addEventListener('click',closeRewardModal);
  document.getElementById('rewardModalBackdrop')?.addEventListener('click',closeRewardModal);
  document.getElementById('rewardConfirmBtn')?.addEventListener('click',closeRewardModal);

  document.getElementById('shopModalClose')?.addEventListener('click',closeShopModal);
  document.getElementById('shopModalBackdrop')?.addEventListener('click',closeShopModal);

  document.querySelectorAll('[data-open-shop="1"], a[href="#boutique"]').forEach(el=>{
    if(el.dataset.shopBound==='1')return;
    el.dataset.shopBound='1';
    el.addEventListener('click',(e)=>{
      e.preventDefault();
      openShopModal();
    });
  });
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initInteractiveOverlays,{once:true});
}else{
  initInteractiveOverlays();
}



// ===== v43: primary shop item deep-linking =====
function openShopAtItem(itemId){
  openShopModal();
  requestAnimationFrame(()=>{
    setTimeout(()=>{
      const card=document.querySelector(`#shopModalGrid [data-shop-item-id="${itemId}"]`);
      if(card){
        card.scrollIntoView({behavior:'smooth',block:'center'});
        card.classList.add('shop-target-highlight');
        setTimeout(()=>card.classList.remove('shop-target-highlight'),1800);
      }
    },120);
  });
}


// ===== v43: profile modal =====
function openProfileModal(){
  updateEquippedBoardUI();
  const m=document.getElementById('profileModal');
  if(!m)return;
  updateEconomyUI();
  m.classList.add('open');
  m.setAttribute('aria-hidden','false');
}
function closeProfileModal(){
  const m=document.getElementById('profileModal');
  if(!m)return;
  m.classList.remove('open');
  m.setAttribute('aria-hidden','true');
}
document.addEventListener('click',(event)=>{
  const opener=event.target.closest?.('[data-open-profile="1"]');
  if(opener){
    event.preventDefault();
    openProfileModal();
  }
});




// ===== v44: robust profile close handling =====
document.addEventListener('click',(event)=>{
  const closeProfile=event.target.closest?.('#profileModalClose,#profileModalBackdrop');
  if(closeProfile){
    event.preventDefault();
    event.stopPropagation();
    closeProfileModal();
    return;
  }
});
document.addEventListener('keydown',(event)=>{
  if(event.key==='Escape' && document.getElementById('profileModal')?.classList.contains('open')){
    closeProfileModal();
  }
});



// ===== v44: home Boutique button scrolls to page section =====
function scrollToShopSection(){
  const target=document.getElementById('boutique');
  if(!target)return;
  target.scrollIntoView({behavior:'smooth',block:'start'});
  target.classList.add('shop-section-focus');
  setTimeout(()=>target.classList.remove('shop-section-focus'),1200);
}
document.addEventListener('click',(event)=>{
  const trigger=event.target.closest?.('[data-scroll-shop="1"]');
  if(!trigger)return;
  event.preventDefault();
  scrollToShopSection();
});



// ===== v49: single reliable shop interaction bootstrap =====
function initShopInteractions(){
  const modal=document.getElementById('shopModal');
  if(!modal)return;

  document.addEventListener('click',(event)=>{
    const closeTarget=event.target.closest?.('#shopModalClose,#shopModalBackdrop');
    if(closeTarget){
      event.preventDefault();
      event.stopPropagation();
      closeShopModal();
      return;
    }

    const opener=event.target.closest?.('#openShopModalBtnPrimary,[data-open-shop="1"]');
    if(opener){
      event.preventDefault();
      event.stopPropagation();
      openShopModal();
      return;
    }
  },true);

  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape' && modal.classList.contains('open')){
      closeShopModal();
    }
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initShopInteractions,{once:true});
}else{
  initShopInteractions();
}


window.EchecTutoShopDebug={
  open:()=>openShopModal(),
  close:()=>closeShopModal(),
  status:()=>({
    modal:!!document.getElementById('shopModal'),
    grid:!!document.getElementById('shopModalGrid'),
    primaryButton:!!document.getElementById('openShopModalBtnPrimary'),
    open:document.getElementById('shopModal')?.classList.contains('open')||false
  })
};

window.EchecTutoShopDebug=window.EchecTutoShopDebug||{};
window.EchecTutoShopDebug.getShopBalance=()=>({
  economyCoins:Number(playerEconomy?.coins||0),
  renderedETS:document.getElementById('shopETSBalance')?.textContent||null
});



const SHOP_ACTIVITY_KEY='echectuto-shop-activity-v116';
let shopActivity=(()=>{try{return JSON.parse(safeStorage.getItem(SHOP_ACTIVITY_KEY)||'[]')}catch{return []}})();
function pushShopActivity(text){
  shopActivity.unshift({text,at:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})});
  shopActivity=shopActivity.slice(0,8);
  try{safeStorage.setItem(SHOP_ACTIVITY_KEY,JSON.stringify(shopActivity))}catch{}
  renderShopActivity();
}
function renderShopActivity(){
  const host=document.getElementById('shopActivityFeed'); if(!host)return;
  host.innerHTML=shopActivity.length?shopActivity.map(x=>`<div class="shop-activity-item"><span>${x.text}</span><small>${x.at}</small></div>`).join(''):'<small>Aucune activité récente.</small>';
}
function renderAdvancedCollection(){
  const owned=SHOP_BOARD_ITEMS.filter(x=>isBoardOwned(x.id));
  const balance=Number(playerEconomy?.coins||0);
  const value=owned.reduce((s,x)=>s+Number(x.price||0),0);
  const weights=owned.map(x=>getBoardRarityWeight(x.rarity));
  const avg=weights.length?weights.reduce((a,b)=>a+b,0)/weights.length:0;
  const avgLabel=avg>=3.5?'Légendaire':avg>=2.5?'Épique':avg>=1.5?'Rare':'Commun';
  const pct=Math.round(owned.length/SHOP_BOARD_ITEMS.length*100);
  const next=[25,50,75,100].find(x=>x>pct)||100;
  const cheapest=SHOP_BOARD_ITEMS.filter(x=>!isBoardOwned(x.id)).sort((a,b)=>a.price-b.price)[0];
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set('shopCollectionValue',`${value.toLocaleString('fr-FR')} ETS`);
  set('shopAverageRarity',avgLabel);
  set('shopNextGoal',pct>=100?'Collection complète':`${next} %`);
  set('shopBudgetProjection',cheapest?`${Math.max(0,balance-cheapest.price).toLocaleString('fr-FR')} ETS`:'—');

  const gallery=document.getElementById('shopOwnedGallery');
  if(gallery){
    gallery.innerHTML=owned.map(item=>`<button type="button" data-owned-board="${item.id}" title="${item.name}"><img src="${item.image}" alt=""><span>${item.name}</span></button>`).join('');
    gallery.querySelectorAll('[data-owned-board]').forEach(btn=>btn.addEventListener('click',()=>{
      const item=SHOP_BOARD_ITEMS.find(x=>x.id===btn.dataset.ownedBoard); if(item)openBoardDetail(item);
    }));
  }
  renderWishlistSummary();
  renderRecommendation();
}
function renderWishlistSummary(){
  const host=document.getElementById('shopWishlistSummary');if(!host)return;
  const fav=SHOP_BOARD_ITEMS.filter(x=>shopBoardFavorites.includes(x.id)&&!isBoardOwned(x.id));
  const total=fav.reduce((s,x)=>s+x.price,0);
  host.innerHTML=fav.length?`<b>${fav.length} souhait${fav.length>1?'s':''}</b><span>${total.toLocaleString('fr-FR')} ETS au total</span>`:'<span>Aucun favori non possédé.</span>';
}
function renderRecommendation(){
  const host=document.getElementById('shopRecommendation');if(!host)return;
  const balance=Number(playerEconomy?.coins||0);
  const candidates=SHOP_BOARD_ITEMS.filter(x=>!isBoardOwned(x.id));
  candidates.sort((a,b)=>{
    const sa=(a.price<=balance?30:0)+(shopBoardFavorites.includes(a.id)?20:0)+getBoardRarityWeight(a.rarity)*4;
    const sb=(b.price<=balance?30:0)+(shopBoardFavorites.includes(b.id)?20:0)+getBoardRarityWeight(b.rarity)*4;
    return sb-sa||a.price-b.price;
  });
  const item=candidates[0];
  host.innerHTML=item?`<button type="button" data-recommended="${item.id}"><img src="${item.image}" alt=""><span><b>${item.name}</b><small>${item.price.toLocaleString('fr-FR')} ETS · ${item.rarity}</small></span></button>`:'<span>Collection complète ✓</span>';
  host.querySelector('[data-recommended]')?.addEventListener('click',()=>openBoardDetail(item));
}
function runQuickShopAction(type){
  const balance=Number(playerEconomy?.coins||0);
  let pool=SHOP_BOARD_ITEMS.filter(x=>!isBoardOwned(x.id));
  let item=null;
  if(type==='cheapest')item=[...pool].sort((a,b)=>a.price-b.price)[0];
  if(type==='rare')item=[...pool].sort((a,b)=>getBoardRarityWeight(b.rarity)-getBoardRarityWeight(a.rarity)||a.price-b.price)[0];
  if(type==='favorite')item=pool.find(x=>shopBoardFavorites.includes(x.id));
  if(type==='affordable')item=[...pool].filter(x=>x.price<=balance).sort((a,b)=>getBoardRarityWeight(b.rarity)-getBoardRarityWeight(a.rarity))[0];
  if(item)openBoardDetail(item); else showShopTransient('Aucun échiquier correspondant.','error');
}
function syncShopAdvancedUI(){
  renderAdvancedCollection(); renderShopActivity(); updateShopStats(); updateBoardCollectionProgress(); updateInventoryShortcutBadges();
}


function updateInventoryShortcutBadges(){
  const owned=SHOP_BOARD_ITEMS.filter(x=>isBoardOwned(x.id)).length;
  const fav=shopBoardFavorites.length;
  const c=document.getElementById('openCollectionCenterBtn');
  const f=document.getElementById('openFavoritesCenterBtn');
  if(c)c.dataset.count=String(owned);
  if(f)f.dataset.count=String(fav);
}

// ===== v127-v146: Player Command Center =====
const COMMAND_STATE_KEY='echectuto-command-center-v146';
const COMMAND_NOTIF_KEY='echectuto-command-notifications-v146';
const COMMAND_TRAINING_KEY='echectuto-command-training-v146';
const COMMAND_VISIT_KEY='echectuto-command-visits-v146';
const COMMAND_WEEK_KEY='echectuto-command-week-v146';

const COMMAND_WORLDS=[
  {n:1,name:"Royaume de l’Échiquier",missions:5,progress:'echectuto-world1-progress-v3',boss:'echectuto-world1-boss-v8',btn:'startWorld',bossName:'Gardien des 64 Cases'},
  {n:2,name:"Premières Batailles",missions:4,progress:'echectuto-world2-progress-v9',boss:'echectuto-world2-boss-v18',btn:'world2Btn',bossName:'Sentinelle des Menaces'},
  {n:3,name:"Royaume des Tacticiens",missions:5,progress:'echectuto-world3-progress-v26',boss:'echectuto-world3-boss-v26',btn:'world3Btn',bossName:'Viper'},
  {n:4,name:"Royaume du Mat",missions:5,progress:'echectuto-world4-progress-v27',boss:'echectuto-world4-boss-v27',btn:'world4Btn',bossName:'Roi de Fer'},
  {n:5,name:"Royaume du Développement",missions:6,progress:'echectuto-world5-progress-v28',boss:'echectuto-world5-boss-v28',btn:'world5Btn',bossName:'Orion'},
  {n:6,name:"Royaume du Stratège",missions:6,progress:'echectuto-world6-progress-v29',boss:'echectuto-world6-boss-v29',btn:'world6Btn',bossName:'Atlas'},
  {n:7,name:"Royaume des Finales",missions:7,progress:'echectuto-world7-progress-v30',boss:'echectuto-world7-boss-v30',btn:'world7Btn',bossName:'Fortress'},
  {n:8,name:"Royaume du Calcul",missions:7,progress:'echectuto-world8-progress-v31',boss:'echectuto-world8-boss-v31',btn:'world8Btn',bossName:'Mirror'},
  {n:9,name:"Royaume de la Défense",missions:7,progress:'echectuto-world9-progress-v32',boss:'echectuto-world9-boss-v32',btn:'world9Btn',bossName:'Aegis'},
  {n:10,name:"Royaume de la Compétition",missions:7,progress:'echectuto-world10-progress-v33',boss:'echectuto-world10-boss-v33',btn:'world10Btn',bossName:'Chronos'},
  {n:11,name:"Royaume des Maîtres",missions:7,progress:'echectuto-world11-progress-v33',boss:'echectuto-world11-boss-v33',btn:'world11Btn',bossName:'Titan'},
  {n:12,name:"La Citadelle",missions:7,progress:'echectuto-world12-progress-v33',boss:'echectuto-world12-boss-v33',btn:'world12Btn',bossName:'Grand Maître'}
];

let commandSessionStarted=Date.now();
let commandFocusMode=false;
let commandNotifications=[];
let commandInitialSnapshot=null;

function commandReadArray(key){
  try{
    const raw=safeStorage.getItem(key);
    const val=JSON.parse(raw||'[]');
    return Array.isArray(val)?val:[];
  }catch{return []}
}
function commandReadBool(key){
  try{return safeStorage.getItem(key)==='1'}catch{return false}
}
function commandWorldState(w){
  const done=Math.min(w.missions,commandReadArray(w.progress).length);
  const boss=commandReadBool(w.boss);
  const complete=done>=w.missions&&boss;
  return {...w,done,boss,complete,pct:Math.round(done/w.missions*100)};
}
function commandSnapshot(){
  const worlds=COMMAND_WORLDS.map(commandWorldState);
  const missions=worlds.reduce((s,w)=>s+w.done,0);
  const total=worlds.reduce((s,w)=>s+w.missions,0);
  const bosses=worlds.filter(w=>w.boss).length;
  const completed=worlds.filter(w=>w.complete).length;
  return {worlds,missions,total,bosses,completed,pct:Math.round((missions+bosses)/(total+12)*100)};
}
function commandTodayKey(){
  const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function commandWeekKey(){
  const d=new Date(), t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);
  const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));
  const week=Math.ceil((((t-y)/86400000)+1)/7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2,'0')}`;
}
function commandLoadJSON(key,fallback){
  try{return JSON.parse(safeStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}
}
function commandSaveJSON(key,val){
  try{safeStorage.setItem(key,JSON.stringify(val))}catch{}
}
function commandRegisterVisit(){
  const today=commandTodayKey();
  const visits=commandLoadJSON(COMMAND_VISIT_KEY,[]);
  if(!visits.includes(today)){visits.push(today);commandSaveJSON(COMMAND_VISIT_KEY,visits.slice(-60))}
  let streak=1;
  let cursor=new Date();
  for(let i=1;i<60;i++){
    cursor.setDate(cursor.getDate()-1);
    const k=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
    if(visits.includes(k))streak++; else break;
  }
  return streak;
}
function commandBuildNotifications(snap){
  const read=commandLoadJSON(COMMAND_NOTIF_KEY,{read:[]});
  const items=[];
  if(snap.completed>0)items.push({id:`worlds-${snap.completed}`,title:`${snap.completed} monde${snap.completed>1?'s':''} terminé${snap.completed>1?'s':''}`,text:'Tes archives d’entraînement ont été mises à jour.'});
  if(snap.bosses>0)items.push({id:`bosses-${snap.bosses}`,title:`${snap.bosses} Boss vaincu${snap.bosses>1?'s':''}`,text:'Ta campagne gagne en profondeur.'});
  if(snap.pct>=25)items.push({id:'campaign-25',title:'Cap des 25 % franchi',text:'La campagne Facile est bien engagée.'});
  if(snap.pct>=50)items.push({id:'campaign-50',title:'Mi-parcours',text:'Tu as dépassé la moitié de la campagne Facile.'});
  if(snap.pct>=75)items.push({id:'campaign-75',title:'Citadelle en vue',text:'Les derniers mondes approchent.'});
  if(snap.pct>=100)items.push({id:'campaign-100',title:'Campagne Facile terminée',text:'Un nouveau palier de maîtrise peut être préparé.'});
  commandNotifications=items.map(x=>({...x,read:read.read.includes(x.id)}));
}
function commandRenderNotifications(){
  const list=document.getElementById('commandNotificationList');
  const unread=commandNotifications.filter(x=>!x.read);
  const badge=document.getElementById('commandUnreadBadge');
  const preview=document.getElementById('commandNotificationPreview');
  if(badge)badge.textContent=String(unread.length);
  if(preview)preview.textContent=(unread[0]||commandNotifications[0])?.title||'Aucune nouvelle notification.';
  if(list){
    list.innerHTML=commandNotifications.length?commandNotifications.map(n=>`
      <article class="command-notification-item${n.read?' read':''}" data-command-notif="${n.id}">
        <i></i><div><strong>${n.title}</strong><p>${n.text}</p></div>
        <span>${n.read?'Lu':'Nouveau'}</span>
      </article>`).join(''):'<div class="command-notification-empty">Aucune notification pour le moment.</div>';
  }
}
function commandMarkNotificationsRead(){
  const ids=commandNotifications.map(x=>x.id);
  commandSaveJSON(COMMAND_NOTIF_KEY,{read:ids});
  commandNotifications.forEach(x=>x.read=true);
  commandRenderNotifications();
}
function commandRecommendedWorld(snap){
  for(const w of snap.worlds){
    const btn=document.getElementById(w.btn);
    if(w.complete)continue;
    if(btn && !btn.disabled)return w;
  }
  return snap.worlds.find(w=>!w.complete)||snap.worlds[snap.worlds.length-1];
}
function commandOpenRecommended(){
  const snap=commandSnapshot();
  const w=commandRecommendedWorld(snap);
  const btn=document.getElementById(w.btn);
  if(btn && !btn.disabled){btn.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>btn.click(),420);return;}
  document.getElementById(`world${w.n}Card`)?.scrollIntoView({behavior:'smooth',block:'center'});
}
function commandOpenWorld(n){
  const w=COMMAND_WORLDS.find(x=>x.n===n);if(!w)return;
  const btn=document.getElementById(w.btn);
  const card=document.getElementById(n===1?'world1Card':`world${n}Card`);
  (card||btn)?.scrollIntoView({behavior:'smooth',block:'center'});
  if(btn&&!btn.disabled)setTimeout(()=>btn.click(),350);
}
function commandTrainingState(){
  return commandLoadJSON(COMMAND_TRAINING_KEY,{date:'',done:false});
}
function commandMarkTraining(){
  commandSaveJSON(COMMAND_TRAINING_KEY,{date:commandTodayKey(),done:true});
  updatePlayerCommandCenter();
}
function commandDailyBaseline(){
  const today=commandTodayKey();
  const state=commandLoadJSON(COMMAND_STATE_KEY,{});
  const snap=commandSnapshot();
  if(state.day!==today){
    const fresh={day:today,missions:snap.missions,bosses:snap.bosses};
    commandSaveJSON(COMMAND_STATE_KEY,fresh);return fresh;
  }
  return state;
}
function commandWeeklyBaseline(){
  const wk=commandWeekKey();
  const snap=commandSnapshot();
  const state=commandLoadJSON(COMMAND_WEEK_KEY,{});
  if(state.week!==wk){
    const fresh={week:wk,missions:snap.missions};commandSaveJSON(COMMAND_WEEK_KEY,fresh);return fresh;
  }
  return state;
}
function commandUpdateArchive(snap){
  const a=document.getElementById('archiveCompletedWorlds');
  const h=document.getElementById('archiveReplayHint');
  if(a)a.textContent=`${snap.completed} monde${snap.completed>1?'s':''} terminé${snap.completed>1?'s':''}`;
  if(h)h.textContent=snap.completed?`${snap.completed} monde${snap.completed>1?'s sont':' est'} disponible${snap.completed>1?'s':''} en entraînement libre.`:'Termine un monde pour enrichir les archives.';
}
function commandRenderWorldGrid(snap){
  const grid=document.getElementById('commandWorldGrid');if(!grid)return;
  grid.innerHTML=snap.worlds.map(w=>{
    const btn=document.getElementById(w.btn);
    const unlocked=!!btn&&!btn.disabled;
    const cls=w.complete?'complete':unlocked?'active':'locked';
    return `<button type="button" class="${cls}" data-command-world="${w.n}" ${!unlocked&&!w.complete?'disabled':''}>
      <span>${String(w.n).padStart(2,'0')}</span><i>${w.complete?'✓':w.boss?'♛':w.done+'/'+w.missions}</i>
    </button>`;
  }).join('');
  grid.querySelectorAll('[data-command-world]').forEach(b=>b.addEventListener('click',()=>commandOpenWorld(Number(b.dataset.commandWorld))));
}
function updatePlayerCommandCenter(){
  const root=document.getElementById('playerCommandCenter');if(!root)return;
  const snap=commandSnapshot();
  const baseline=commandDailyBaseline();
  const week=commandWeeklyBaseline();
  const training=commandTrainingState();
  const streak=commandRegisterVisit();
  const recommended=commandRecommendedWorld(snap);
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
  const width=(id,val)=>{const el=document.getElementById(id);if(el)el.style.width=`${Math.max(0,Math.min(100,val))}%`};

  set('commandCampaignPct',`${snap.pct}%`);width('commandCampaignBar',snap.pct);
  set('commandMissionCount',`${snap.missions} / ${snap.total}`);
  set('commandMissionRemaining',`${Math.max(0,snap.total-snap.missions)} restante${snap.total-snap.missions!==1?'s':''}`);
  set('commandBossCount',`${snap.bosses} / 12`);
  const nextBoss=snap.worlds.find(w=>!w.boss);
  set('commandNextBoss',nextBoss?`Prochain : ${nextBoss.bossName}`:'Tous les Boss vaincus');
  set('commandStreak',`${streak} jour${streak>1?'s':''}`);
  set('commandLastVisit','Activité enregistrée aujourd’hui');
  set('commandWorldSummary',`${snap.completed} terminé${snap.completed>1?'s':''}`);

  set('commandResumeTitle',`Monde ${String(recommended.n).padStart(2,'0')} — ${recommended.name}`);
  set('commandResumeReason',recommended.done?`${recommended.done}/${recommended.missions} missions validées. Continue ce monde.`:'Prochaine étape recommandée de ta campagne.');

  const dm=Math.min(1,Math.max(0,snap.missions-baseline.missions));
  const db=Math.min(1,Math.max(0,snap.bosses-baseline.bosses));
  const trainingDone=training.date===commandTodayKey()&&training.done;
  set('dailyMissionText',`${dm} / 1`);width('dailyMissionBar',dm*100);
  set('dailyBossText',`${db} / 1`);width('dailyBossBar',db*100);
  set('dailyTrainingText',trainingDone?'Terminé':'À faire');width('dailyTrainingBar',trainingDone?100:0);
  document.querySelector('[data-command-objective="missions"]')?.classList.toggle('done',dm>=1);
  document.querySelector('[data-command-objective="boss"]')?.classList.toggle('done',db>=1);
  document.querySelector('[data-command-objective="training"]')?.classList.toggle('done',trainingDone);

  const weekDone=Math.max(0,snap.missions-week.missions);
  set('commandWeeklyText',`${Math.min(10,weekDone)} / 10 missions`);
  width('commandWeeklyBar',Math.min(100,weekDone/10*100));

  commandRenderWorldGrid(snap);
  commandBuildNotifications(snap);commandRenderNotifications();
  commandUpdateArchive(snap);
  if(typeof updateEconomyUI==='function')updateEconomyUI();
  commandInitialSnapshot ||= snap;
}
function commandTickSession(){
  const elapsed=Math.floor((Date.now()-commandSessionStarted)/1000);
  const mm=String(Math.floor(elapsed/60)).padStart(2,'0');
  const ss=String(elapsed%60).padStart(2,'0');
  const el=document.getElementById('commandSessionTime');if(el)el.textContent=`${mm}:${ss}`;
}
function commandOpenNotifications(){
  updatePlayerCommandCenter();
  const m=document.getElementById('commandNotificationModal');if(!m)return;
  m.classList.add('open');m.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('commandNotificationClose')?.focus(),0);
}
function commandCloseNotifications(){
  const m=document.getElementById('commandNotificationModal');if(!m)return;
  m.classList.remove('open');m.setAttribute('aria-hidden','true');
}
function commandToggleFocus(){
  commandFocusMode=!commandFocusMode;
  document.body.classList.toggle('echectuto-focus-mode',commandFocusMode);
  const btn=document.getElementById('commandFocusBtn');
  if(btn){btn.setAttribute('aria-pressed',String(commandFocusMode));btn.textContent=commandFocusMode?'Quitter focus':'Mode focus'}
}
function initPlayerCommandCenter(){
  if(!document.getElementById('playerCommandCenter'))return;
  updatePlayerCommandCenter();
  setInterval(commandTickSession,1000);
  setInterval(updatePlayerCommandCenter,2500);
  document.getElementById('commandResumeBtn')?.addEventListener('click',commandOpenRecommended);
  document.getElementById('commandNotificationsBtn')?.addEventListener('click',commandOpenNotifications);
  document.getElementById('commandNotificationClose')?.addEventListener('click',commandCloseNotifications);
  document.getElementById('commandNotificationBackdrop')?.addEventListener('click',commandCloseNotifications);
  document.getElementById('commandMarkAllRead')?.addEventListener('click',commandMarkNotificationsRead);
  document.getElementById('commandFocusBtn')?.addEventListener('click',commandToggleFocus);
  document.getElementById('commandArchiveBtn')?.addEventListener('click',()=>{
    document.getElementById('trainingArchive')?.scrollIntoView({behavior:'smooth',block:'center'});
    commandMarkTraining();
  });
  document.getElementById('commandInventoryBtn')?.addEventListener('click',()=>openProfileModal?.());
  document.getElementById('commandProfileBtn')?.addEventListener('click',()=>openProfileModal?.());
  document.addEventListener('keydown',(e)=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(e.key.toLowerCase()==='r'){e.preventDefault();commandOpenRecommended()}
    if(e.key.toLowerCase()==='n'){e.preventDefault();commandOpenNotifications()}
    if(e.key==='Escape'&&document.getElementById('commandNotificationModal')?.classList.contains('open'))commandCloseNotifications();
  });
}
function openInventoryWindow(kind){
  const id=kind==='collection'?'collectionCenterModal':'favoritesCenterModal';
  const modal=document.getElementById(id);
  if(!modal)return;
  if(kind==='collection')renderAdvancedCollection();
  if(kind==='favorites'){
    renderWishlistSummary();
    renderRecommendation();
    renderShopActivity();
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('inventory-window-open');
  setTimeout(()=>modal.querySelector('.inventory-window-close')?.focus(),0);
}
function closeInventoryWindow(kind){
  const id=kind==='collection'?'collectionCenterModal':'favoritesCenterModal';
  const modal=document.getElementById(id);
  if(!modal)return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  if(!document.querySelector('.inventory-overlay-modal.open')){
    document.body.classList.remove('inventory-window-open');
  }
}
function initInventoryWindows(){
  document.getElementById('openCollectionCenterBtn')?.addEventListener('click',()=>openInventoryWindow('collection'));
  document.getElementById('openFavoritesCenterBtn')?.addEventListener('click',()=>openInventoryWindow('favorites'));
  document.getElementById('collectionCenterClose')?.addEventListener('click',()=>closeInventoryWindow('collection'));
  document.getElementById('favoritesCenterClose')?.addEventListener('click',()=>closeInventoryWindow('favorites'));
  document.querySelectorAll('[data-close-inventory-window]').forEach(el=>{
    el.addEventListener('click',()=>closeInventoryWindow(el.dataset.closeInventoryWindow));
  });
  document.addEventListener('keydown',(e)=>{
    if(e.key!=='Escape')return;
    if(document.getElementById('collectionCenterModal')?.classList.contains('open'))closeInventoryWindow('collection');
    if(document.getElementById('favoritesCenterModal')?.classList.contains('open'))closeInventoryWindow('favorites');
  });
}
function initShopBoardControls(){
  const search=document.getElementById('shopBoardSearch');
  const sort=document.getElementById('shopBoardSort');
  const affordable=document.getElementById('shopAffordableToggle');
  const hideOwned=document.getElementById('shopHideOwnedToggle');
  const priceRange=document.getElementById('shopPriceRange');

  if(search)search.value=shopBoardSearch;
  if(sort)sort.value=shopBoardSort;
  if(priceRange)priceRange.value=shopPriceRange;
  if(affordable){
    affordable.classList.toggle('active',shopBoardAffordableOnly);
    affordable.setAttribute('aria-pressed',String(shopBoardAffordableOnly));
  }
  if(hideOwned){
    hideOwned.classList.toggle('active',shopHideOwned);
    hideOwned.setAttribute('aria-pressed',String(shopHideOwned));
  }

  document.querySelectorAll('.shop-filter').forEach(btn=>{
    btn.addEventListener('click',()=>{
      shopBoardFilter=btn.dataset.shopFilter||'all';
      document.querySelectorAll('.shop-filter').forEach(x=>x.classList.toggle('active',x===btn));
      renderShopModal();
    });
  });

  document.querySelectorAll('.shop-rarity-filter').forEach(btn=>{
    btn.classList.toggle('active',(btn.dataset.rarityFilter||'all')===shopBoardRarity);
    btn.addEventListener('click',()=>{
      shopBoardRarity=btn.dataset.rarityFilter||'all';
      saveShopPrefs();
      document.querySelectorAll('.shop-rarity-filter').forEach(x=>x.classList.toggle('active',x===btn));
      renderShopModal();
    });
  });

  if(search){
    let timer=null;
    search.addEventListener('input',()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        shopBoardSearch=search.value||'';
        saveShopPrefs();
        renderShopModal();
      },120);
    });
  }

  affordable?.addEventListener('click',()=>{
    shopBoardAffordableOnly=!shopBoardAffordableOnly;
    saveShopPrefs();
    affordable.classList.toggle('active',shopBoardAffordableOnly);
    affordable.setAttribute('aria-pressed',String(shopBoardAffordableOnly));
    renderShopModal();
  });

  hideOwned?.addEventListener('click',()=>{
    shopHideOwned=!shopHideOwned;
    saveShopPrefs();
    hideOwned.classList.toggle('active',shopHideOwned);
    hideOwned.setAttribute('aria-pressed',String(shopHideOwned));
    renderShopModal();
  });

  priceRange?.addEventListener('change',()=>{
    shopPriceRange=priceRange.value||'all';
    saveShopPrefs();
    renderShopModal();
  });

  sort?.addEventListener('change',()=>{
    shopBoardSort=sort.value;
    saveShopPrefs();
    renderShopModal();
  });

  document.getElementById('shopDiscoverBtn')?.addEventListener('click',discoverRandomBoard);
  document.getElementById('shopCompareClear')?.addEventListener('click',()=>{
    shopBoardCompare=[];
    saveCompare();
    renderCompareTray();
    refreshCompareButtons();
  });
  document.getElementById('shopReceiptClose')?.addEventListener('click',()=>{
    const receipt=document.getElementById('shopReceipt');
    receipt?.classList.remove('open');
    receipt?.setAttribute('aria-hidden','true');
  });

  const historyBtn=document.getElementById('shopHistoryBtn');
  const historyPanel=document.getElementById('shopHistoryPanel');
  const historyClose=document.getElementById('shopHistoryClose');
  historyBtn?.addEventListener('click',()=>{
    renderBoardHistory();
    historyPanel?.classList.add('open');
    historyPanel?.setAttribute('aria-hidden','false');
  });
  historyClose?.addEventListener('click',()=>{
    historyPanel?.classList.remove('open');
    historyPanel?.setAttribute('aria-hidden','true');
  });

  document.getElementById('shopLivePreviewRestore')?.addEventListener('click',restoreEquippedBoardPreview);

  const grid=document.getElementById('shopModalGrid');
  grid?.addEventListener('keydown',(e)=>{
    const cards=[...grid.querySelectorAll('.board-product-card')];
    const current=e.target.closest('.board-product-card');
    const idx=cards.indexOf(current);
    if(idx<0)return;
    let next=idx;
    if(e.key==='ArrowRight')next=Math.min(cards.length-1,idx+1);
    if(e.key==='ArrowLeft')next=Math.max(0,idx-1);
    if(e.key==='ArrowDown')next=Math.min(cards.length-1,idx+3);
    if(e.key==='ArrowUp')next=Math.max(0,idx-3);
    if(next!==idx){
      e.preventDefault();
      cards[next]?.focus();
    }
    if(e.key==='Enter' && e.target===current){
      const item=SHOP_BOARD_ITEMS.find(x=>x.id===current.dataset.shopItemId);
      if(item)openBoardDetail(item);
    }
  });

  document.addEventListener('keydown',(e)=>{
    const modal=document.getElementById('shopModal');
    if(!modal?.classList.contains('open'))return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault();
      search?.focus();
      search?.select();
    }
  });


  document.getElementById('collectionCenterToggle')?.addEventListener('click',(e)=>{
    const body=document.getElementById('collectionCenterBody');
    const collapsed=body?.classList.toggle('collapsed');
    e.currentTarget.textContent=collapsed?'Déployer':'Réduire';
    e.currentTarget.setAttribute('aria-expanded',String(!collapsed));
  });
  document.querySelectorAll('[data-quick-shop]').forEach(btn=>btn.addEventListener('click',()=>runQuickShopAction(btn.dataset.quickShop)));
  document.getElementById('shopClearSearch')?.addEventListener('click',()=>{
    shopBoardSearch=''; const input=document.getElementById('shopBoardSearch'); if(input)input.value='';
    saveShopPrefs(); renderShopModal();
  });
  syncShopAdvancedUI();
  renderCompareTray();

  renderRecentBoards();
  renderCollectionMilestones();
  updateInventoryShortcutBadges();
  updateShopStats();
  renderCompareTray();
}
document.addEventListener('DOMContentLoaded',()=>{
  try{
    updateShopETSBalance();
    updateEquippedBoardUI();
    applyEquippedBoardTheme();
  }catch(e){
    console.warn('EchecTuto v56 init',e);
  }
});

document.addEventListener('DOMContentLoaded',initShopBoardControls);

document.addEventListener('DOMContentLoaded',initInventoryWindows);

document.addEventListener('DOMContentLoaded',initPlayerCommandCenter);

document.addEventListener('DOMContentLoaded',initMissionDefeatFeedback);

document.addEventListener('DOMContentLoaded',initLearningDebrief);

document.addEventListener('DOMContentLoaded',initLearningCenter);

document.addEventListener('DOMContentLoaded',()=>{initChallenges();initClans();initAdaptiveCoach();initShopShowcaseLinks();});
