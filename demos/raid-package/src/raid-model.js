// Pointy hexes use sqrt(3)*R horizontally and 1.5*R vertically.
const LAYOUTS={
 landscape:{COLS:6,ROWS:4,R:125,WORLD:{width:1600,height:1000},origin:[180,170],battleStart:[1,3],villageStart:[2,2],objects:{
  resource:{cell:[0,2],footprint:[[0,2]],access:[[1,2]],art:'chest-closed-art-lite.webp',size:235,box:[235,298],anchor:{x:225,y:610}},
  trader:{cell:[4,1],footprint:[[3,0],[4,0],[5,0],[3,1],[4,1],[5,1]],access:[[3,2]],art:'market-building-lite.webp',size:530,box:[530,330],anchor:{x:1080,y:415},baked:true},
  armorer:{cell:[4,3],footprint:[[4,2],[5,2],[4,3],[5,3]],access:[[2,3]],art:'armory-building-lite.webp',size:530,box:[530,430],anchor:{x:1220,y:830},baked:true},
  enemy:{cell:[4,2],footprint:[[4,2]],access:[[2,3]],art:'skeleton-art-lite.webp',size:340,box:[340,360],anchor:{x:1060,y:550}}
 }},
 portrait:{COLS:4,ROWS:6,R:100,WORLD:{width:900,height:1600},origin:[150,450],battleStart:[0,5],villageStart:[1,4],objects:{
  resource:{cell:[0,2],footprint:[[0,2]],access:[[1,2]],art:'chest-closed-art-lite.webp',size:220,box:[220,279],anchor:{x:155,y:820}},
  trader:{cell:[2,1],footprint:[[2,0],[3,0],[2,1],[3,1],[2,2],[3,2]],access:[[0,3]],art:'market-building-lite.webp',size:560,box:[560,365],anchor:{x:600,y:800},baked:true},
  armorer:{cell:[2,5],footprint:[[1,3],[2,3],[3,3],[2,4],[3,4],[1,5],[2,5],[3,5]],access:[[0,5]],art:'armory-building-lite.webp',size:540,box:[540,460],anchor:{x:600,y:1245},baked:true},
  enemy:{cell:[2,2],footprint:[[2,1],[2,2]],access:[[1,4]],art:'skeleton-art-lite.webp',size:340,box:[340,360],anchor:{x:600,y:760}}
 }}
};

export function createRaidModel(layout='landscape'){
 if(!Object.prototype.hasOwnProperty.call(LAYOUTS,layout))throw new RangeError('Unknown raid layout: '+layout);
 const spec=LAYOUTS[layout],{COLS,ROWS,R,WORLD}=spec,OBJECTS=spec.objects;
 const key=p=>p.join(','),same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 const center=([x,y])=>({x:spec.origin[0]+Math.sqrt(3)*R*(x+(y-Math.floor(y/2)*2)*.5),y:spec.origin[1]+1.5*R*y});
 const axial=([x,y])=>[x-Math.floor(y/2),y];
 const distance=(a,b)=>{const[q,r]=axial(a),[u,v]=axial(b);return(Math.abs(q-u)+Math.abs(r-v)+Math.abs(q+r-u-v))/2;};
 const POINTS=Object.fromEntries(Object.entries(OBJECTS).map(([k,v])=>[k,v.cell]));
 const SCENERY=[],BATTLE_SCENERY=[];
 const topRow=Array.from({length:COLS},(_,x)=>key([x,0]));
 const BLOCKED=new Set([...topRow,'0,1',...['resource','trader','armorer'].flatMap(id=>OBJECTS[id].footprint.map(key))]);
 const BATTLE_BLOCKED=new Set([...topRow,...(layout==='portrait'
  ?[...Array.from({length:ROWS},(_,y)=>key([3,y])),'0,1','0,2']
  :[...Array.from({length:ROWS},(_,y)=>key([0,y])),...Array.from({length:ROWS},(_,y)=>key([5,y])),'4,3']),...OBJECTS.enemy.footprint.map(key)]);
 const sceneFor=s=>['encounter','revenge','complete'].includes(s.phase)?'battle':'village';
 const blockedFor=scene=>scene==='battle'?BATTLE_BLOCKED:BLOCKED;
 const inside=([x,y])=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<COLS&&y>=0&&y<ROWS;
 const walkable=(p,scene='village')=>inside(p)&&!blockedFor(scene).has(key(p));
 const rawNeighbors=([x,y])=>{const dx=y%2?1:-1;return[[x-1,y],[x+1,y],[x,y-1],[x+dx,y-1],[x,y+1],[x+dx,y+1]];};
 const neighbors=(p,scene='village')=>rawNeighbors(p).filter(n=>walkable(n,scene));
 const near=(a,b)=>distance(a,b)<=1;
 const canInteract=(s,id)=>OBJECTS[id]?.access.some(p=>same(p,s.pos))??false;
 function pathTo(start,target,scene='village'){
  if(!walkable(start,scene)||!walkable(target,scene))return null;
  const open=[{pos:start,path:[],g:0,dir:null}],best=new Map();
  while(open.length){
   open.sort((a,b)=>(a.g+distance(a.pos,target))-(b.g+distance(b.pos,target))||a.path.length-b.path.length);
   const node=open.shift();if(same(node.pos,target))return node.path;
   for(const next of neighbors(node.pos,scene)){
    const a=axial(node.pos),b=axial(next),dir=[b[0]-a[0],b[1]-a[1]].join(',');
    const g=node.g+1+(node.dir&&node.dir!==dir?0.025:0),k=key(next)+'/'+dir;
    if((best.get(k)??Infinity)<=g)continue;best.set(k,g);open.push({pos:next,path:[...node.path,next],g,dir});
   }
  }
  return null;
 }
 const pathToObject=(pos,id)=>{const paths=OBJECTS[id].access.map(p=>pathTo(pos,p,id==='enemy'?'battle':'village')).filter(p=>p!==null);return paths.sort((a,b)=>a.length-b.length)[0]??null;};
 const targetId=s=>['encounter','revenge','complete'].includes(s.phase)?'enemy':s.phase==='collect'?'resource':s.phase==='sell'?'trader':'armorer';
 const targetFor=s=>POINTS[targetId(s)];
 const freshState=()=>({version:6,layout,phase:'encounter',pos:[...spec.battleStart],resource:0,gold:0,artifact:false,equipped:false,chestOpened:false,firstAttempted:false,enemyDefeated:false});
 function transition(s,e,d){
  if(s.phase==='complete')return s;
  if(e.type==='MOVE')return neighbors(s.pos,sceneFor(s)).some(p=>same(p,e.pos))?{...s,pos:[...e.pos]}:s;
  if(!canInteract(s,targetId(s)))return s;
  if(e.type==='FIRST_BATTLE_LOST'&&s.phase==='encounter'&&!s.equipped)return{...s,phase:'collect',firstAttempted:true,pos:[...spec.villageStart]};
  if(e.type==='DEFEAT_ENEMY'&&s.phase==='revenge'&&s.equipped&&s.firstAttempted)return{...s,phase:'complete',enemyDefeated:true};
  if(e.type==='OPEN_CHEST'&&s.phase==='collect')return{...s,chestOpened:true};
  if(e.type==='COLLECT'&&s.phase==='collect'&&s.chestOpened)return{...s,phase:'sell',resource:d.resource.sceneQuantity};
  if(e.type==='SELL'&&s.phase==='sell'&&s.resource>0)return{...s,phase:'buy',resource:0,gold:s.gold+s.resource*d.resource.saleUnitGold};
  if(e.type==='BUY'&&s.phase==='buy'&&s.gold>=d.artifact.goldPrice)return{...s,phase:'equip',gold:s.gold-d.artifact.goldPrice,artifact:true};
  if(e.type==='EQUIP'&&s.phase==='equip'&&s.artifact)return{...s,phase:'revenge',equipped:true,pos:[...spec.battleStart]};return s;
 }
 const validateData=d=>d?.version===1&&Number.isInteger(d.resource?.sceneQuantity)&&d.resource.sceneQuantity>0&&Number.isFinite(d.resource.saleUnitGold)&&d.resource.saleUnitGold>0&&Number.isFinite(d.artifact?.goldPrice)&&d.artifact.goldPrice>0&&d.resource.sceneQuantity*d.resource.saleUnitGold>=d.artifact.goldPrice&&Number.isFinite(d.artifact.statAmount)&&d.artifact.statAmount>0&&[d.hero,d.resource,d.artifact,d.enemy].every(v=>v?.name?.ru&&v.name?.en&&/^[a-zA-Z0-9._-]+$/.test(v.image));
 function restoreState(s,d){
  const sourceLayout=s?.version===5?'landscape':s?.version===6?s.layout:null;
  if(!sourceLayout||!Object.prototype.hasOwnProperty.call(LAYOUTS,sourceLayout)||!['encounter','collect','sell','buy','equip','revenge','complete'].includes(s.phase)||!Array.isArray(s.pos)||s.pos.length!==2||typeof s.chestOpened!=='boolean'||typeof s.firstAttempted!=='boolean'||typeof s.enemyDefeated!=='boolean')return null;
  const sourceWalkable=sourceLayout===layout?walkable:createRaidModel(sourceLayout).walkable;
  if(!sourceWalkable(s.pos,sceneFor(s)))return null;
  const total=d.resource.sceneQuantity*d.resource.saleUnitGold;
  const expected={encounter:[0,0,false,false,false,false],collect:[0,0,false,false,true,false],sell:[d.resource.sceneQuantity,0,false,false,true,false],buy:[0,total,false,false,true,false],equip:[0,total-d.artifact.goldPrice,true,false,true,false],revenge:[0,total-d.artifact.goldPrice,true,true,true,false],complete:[0,total-d.artifact.goldPrice,true,true,true,true]}[s.phase];
  if(![s.resource,s.gold,s.artifact,s.equipped,s.firstAttempted,s.enemyDefeated].every((v,i)=>v===expected[i])||(!['encounter','collect'].includes(s.phase)&&!s.chestOpened)||(s.phase==='encounter'&&s.chestOpened))return null;
  const pos=sourceLayout===layout?[...s.pos]:[...(sceneFor(s)==='battle'?spec.battleStart:spec.villageStart)];
  return{...freshState(),...s,version:6,layout,pos};
 }
 return{layout,COLS,ROWS,R,WORLD,key,same,center,axial,distance,OBJECTS,POINTS,SCENERY,BATTLE_SCENERY,BLOCKED,BATTLE_BLOCKED,sceneFor,blockedFor,inside,walkable,rawNeighbors,neighbors,near,canInteract,pathTo,pathToObject,targetId,targetFor,freshState,transition,validateData,restoreState};
}

const landscape=createRaidModel();
export const{layout,COLS,ROWS,R,WORLD,key,same,center,axial,distance,OBJECTS,POINTS,SCENERY,BATTLE_SCENERY,BLOCKED,BATTLE_BLOCKED,sceneFor,blockedFor,inside,walkable,rawNeighbors,neighbors,near,canInteract,pathTo,pathToObject,targetId,targetFor,freshState,transition,validateData,restoreState}=landscape;
