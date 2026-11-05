import{createRaidModel}from'./raid-model.js?v=20261105-images-1';
const requestedLayout=new URLSearchParams(location.search).get('layout'),chooseLayout=()=>['portrait','landscape'].includes(requestedLayout)?requestedLayout:innerHeight>innerWidth?'portrait':'landscape';
let raidModel=createRaidModel(chooseLayout());let{COLS,ROWS,R,WORLD,OBJECTS,SCENERY,BATTLE_SCENERY,blockedFor,sceneFor,key,same,center,walkable,neighbors,pathTo,pathToObject,canInteract,targetId,freshState,transition,validateData,restoreState}=raidModel;
import{createBattle}from'./raid-battle.js?v=20261105-images-1';import{copy}from'./raid-copy.js?v=20261105-images-1';import{createEffects}from'./raid-fx.js?v=20261105-images-1';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),embedded=params.get('embed')==='1',SVG='http://www.w3.org/2000/svg',SP=340,STORAGE='yh-raid-demo-v6';
const asset=f=>new URL('../assets/'+f,import.meta.url).href,reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.motion==='reduced';
let lang=params.get('lang')==='en'?'en':'ru',data,state=freshState(),mode='loading',saved=null,moving=false,busy=false,routeRaf=0,operation=0,loadVersion=0,loadAbort;
let visualPos=center(state.pos),up=false,left=false,returnFocus=null,promptOpen=false,renderedScene=null;
const objects={},tiles=[],hexes=[],fx=createEffects({layer:$('effects'),world:$('world'),hero:$('hero'),hud:$('gold-balance'),asset,reduced});
const t=(k,a={})=>(copy[lang][k]??k).replace(/\{(\w+)\}/g,(_,x)=>String(a[x]??'')),name=o=>o.name[lang],num=n=>new Intl.NumberFormat(lang==='ru'?'ru-RU':'en-US').format(n);
const battle=createBattle({fx,hero:$('hero'),enemy:()=>objects.enemy,t,announce,reduced});
let parentOrigin=location.origin;try{if(document.referrer)parentOrigin=new URL(document.referrer).origin;}catch{}
function send(type,payload={}){if(embedded&&parent!==window)parent.postMessage({source:'yupland-heroes-demos',version:1,game:'raid',type,...payload},parentOrigin);}
function save(){try{sessionStorage.setItem(STORAGE,JSON.stringify(state));}catch{}}
function announce(k,a={}){$('hint').textContent=t(k,a);}
function hidePrompt(){promptOpen=false;$('shop-prompt').hidden=true;}
function stop(){operation++;fx.cancel();battle.reset(state);busy=false;cancelAnimationFrame(routeRaf);moving=false;visualPos=center(state.pos);hidePrompt();paintHero();$('route').replaceChildren();hexes.forEach(({el})=>el.classList.remove('route-step'));}
function paintHero(now=performance.now()){
 const el=$('hero');el.style.left=visualPos.x+'px';el.style.top=visualPos.y+'px';el.style.zIndex=String(Math.round(visualPos.y));el.dataset.position=key(state.pos);
 const frame=moving&&!reduced()?Math.floor(now/60)%8:0,col=moving?frame:3,row=0;
 $('hero-sprite').style.backgroundPosition=`${-col*SP}px ${-row*SP}px`;$('hero-sprite').style.transform=left?'scaleX(-1)':'none';for(const id of ['hero-idle','hero-attack'])$(id).style.transform=left?'scaleX(-1)':'none';
 el.dataset.frame=String(frame);el.dataset.moving=String(moving);el.dataset.row=String(row);
}
function setMode(next){mode=next;$('app').dataset.mode=next;$('cover').hidden=next==='playing';$('hint').hidden=next!=='playing';$('stage').inert=next!=='playing';$('hud').inert=next!=='playing';send('view',{view:next});}
function cover(next){
 setMode(next);const error=next==='error',intro=next==='intro';$('cover-title').textContent=t(error?'errorTitle':intro?'title':'loading');$('cover-copy').textContent=t(error?'errorCopy':'intro');
 $('cover-copy').hidden=next==='loading';$('progress').hidden=next!=='loading';$('cover-action').hidden=next==='loading';$('cover-action').textContent=t(error?'retry':saved?'continue':'start');$('cover-secondary').hidden=!intro||!saved;$('cover-secondary').textContent=t('fresh');
 if(error||intro)$('cover-action').focus({preventScroll:true});
}
function setLanguage(next){
 lang=next==='en'?'en':'ru';document.documentElement.lang=lang;document.title='YupLand Heroes — '+t('title');document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
 $('language').textContent=lang==='ru'?'EN':'RU';$('language').setAttribute('aria-label',lang==='ru'?'Switch to English':'Переключить на русский');$('exit').setAttribute('aria-label',t('close'));$('restart').setAttribute('aria-label',t('restartTitle'));$('stage').setAttribute('aria-label',t('map'));$('progress').setAttribute('aria-label',t('loading'));
 if(data){render();if(mode!=='playing')cover(mode);}
}
async function load(){
 const version=++loadVersion;loadAbort?.abort();loadAbort=new AbortController();$('progress').value=0;cover('loading');const timeout=setTimeout(()=>loadAbort.abort(),12000);
 try{
  const r=await fetch(new URL('../data/raid.json',import.meta.url),{signal:loadAbort.signal,cache:'no-store'});if(!r.ok)throw Error('load');const d=await r.json();if(!validateData(d))throw Error('data');
  const files=[...new Set([d.hero.image,d.enemy.image,d.resource.image,d.artifact.image,'chest-closed-art.webp','chest-open-art.webp','battle-landscape.webp','village-landscape.webp','battle-portrait.webp','village-portrait.webp','ring-gold.webp','slash-gold.webp','knight-idle-art.webp','knight-attack-art.webp','market-building.webp','armory-building.webp','grass.webp','dirt.webp','paving.webp','gold.webp',...[...SCENERY,...BATTLE_SCENERY].map(p=>p.art)])];let done=0;
  await Promise.all(files.map(f=>new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>reject(Error('image timeout')),45000);im.onload=()=>{clearTimeout(timer);if(version===loadVersion)$('progress').value=++done/files.length*100;resolve();};im.onerror=()=>{clearTimeout(timer);reject(Error('image: '+f));};im.src=asset(f);})));if(version!==loadVersion)return;
  data=d;try{saved=restoreState(JSON.parse(sessionStorage.getItem(STORAGE)??sessionStorage.getItem('yh-raid-demo-v5')),data);}catch{saved=null;}if(saved?.phase==='complete')saved=null;state=saved??freshState();visualPos=center(state.pos);build();setLanguage(lang);cover('intro');send('ready');
 }catch(error){console.error('Raid demo load failed:',error);if(version===loadVersion){cover('error');send('error',{reason:'load'});}}finally{clearTimeout(timeout);}
}
function resize(){
 const next=chooseLayout();if(next!==raidModel.layout){const previous=state;stop();raidModel=createRaidModel(next);({COLS,ROWS,R,WORLD,OBJECTS,SCENERY,BATTLE_SCENERY,blockedFor,sceneFor,key,same,center,walkable,neighbors,pathTo,pathToObject,canInteract,targetId,freshState,transition,validateData,restoreState}=raidModel);state=data?(restoreState(previous,data)??freshState()):freshState();if(data&&saved)saved=restoreState(saved,data);visualPos=center(state.pos);if(data){build();save();if(mode==='playing'&&state.phase==='equip')equipRecovered();return;}}
 const a=$('app'),scale=Math.min(a.clientWidth/WORLD.width,a.clientHeight/WORLD.height),f=$('frame');f.dataset.layout=raidModel.layout;f.style.setProperty('--scene-width',WORLD.width+'px');f.style.setProperty('--scene-height',WORLD.height+'px');f.style.transform=`translate(${(a.clientWidth-WORLD.width*scale)/2}px,${(a.clientHeight-WORLD.height*scale)/2}px) scale(${scale})`;positionPrompt();
}
function hexPath(p){const c=center(p);return Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return`${i?'L':'M'}${c.x+R*Math.cos(a)},${c.y+R*Math.sin(a)}`;}).join(' ')+'Z';}
function objectCenter(id){return OBJECTS[id].anchor??center(OBJECTS[id].cell);}
function build(){
 renderedScene=sceneFor(state);$('frame').dataset.scene=renderedScene;$('scene-bg').src=asset(renderedScene+'-'+(raidModel.layout==='portrait'?'portrait':'landscape')+'.webp');for(const id of ['hex-floor','route'])$(id).setAttribute('viewBox',`0 0 ${WORLD.width} ${WORLD.height}`);fx.cancel();$('world').classList.toggle('battlefield',renderedScene==='battle');$('world').classList.remove('scene-arrival');void $('world').offsetWidth;$('world').classList.add('scene-arrival');
 $('actors').replaceChildren();$('hex-floor').replaceChildren();$('route').replaceChildren();tiles.length=0;hexes.length=0;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const p=[x,y],c=center(p),el=document.createElementNS(SVG,'path');el.setAttribute('d',hexPath(p));if(blockedFor(renderedScene).has(key(p)))el.classList.add('blocked');$('hex-floor').append(el);hexes.push({el,p});
  if(!walkable(p,renderedScene))continue;const b=document.createElement('button');b.type='button';b.className='map-tile';b.style.width=Math.sqrt(3)*R+'px';b.style.height=R*2+'px';b.style.left=c.x+'px';b.style.top=c.y+'px';b.dataset.cell=key(p);b.addEventListener('click',()=>travel(p));$('actors').append(b);tiles.push({b,p});
 }
 for(const prop of (renderedScene==='battle'?BATTLE_SCENERY:SCENERY)){const c=center(prop.cell),im=document.createElement('img');im.className='prop';im.src=asset(prop.art);im.alt='';im.style.cssText=`left:${c.x}px;top:${c.y}px;width:${prop.size}px;height:${prop.size}px;z-index:${Math.round(c.y)};`;im.setAttribute('aria-hidden','true');$('actors').append(im);}
 for(const[id,o]of Object.entries(OBJECTS)){
  const c=objectCenter(id),b=document.createElement('button');b.type='button';b.className='map-object';b.dataset.object=id;b.classList.toggle('baked',!!o.baked);b.style.cssText=`left:${c.x}px;top:${c.y}px;width:${o.box?.[0]??o.size}px;height:${o.box?.[1]??o.size}px;z-index:${Math.round(c.y)};`;
  const im=document.createElement('img');im.alt='';if(id==='enemy'){im.className='enemy-figure';const bar=document.createElement('span');bar.className='combat-health enemy-health';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',name(data.enemy));bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');const fill=document.createElement('i');fill.id='enemy-health-fill';bar.append(fill);b.append(bar);}b.append(im);const label=document.createElement('span');label.className='place-label';b.append(label);const pin=document.createElement('span');pin.className='object-pin';pin.setAttribute('aria-hidden','true');pin.textContent='↓';b.append(pin);b.addEventListener('click',()=>visit(id));$('actors').append(b);objects[id]=b;
 }
 $('hero-cargo').replaceChildren();for(let i=0;i<1;i++){const im=document.createElement('img');im.src=asset(data.resource.image);im.alt='';im.style.setProperty('--i',i);$('hero-cargo').append(im);}
 $('hero-artifact').src=asset(data.artifact.image);$('shop-item').src=asset(data.artifact.image);$('shop-price').textContent=num(data.artifact.goldPrice);battle.reset(state);resize();paintHero();render();
}
function priceLabel(el,text,n){el.replaceChildren(document.createTextNode(text));if(n!==undefined){const im=document.createElement('img');im.src=asset('gold.webp');im.alt='';el.append(im,document.createTextNode(num(n)));}}
function render(){
 if(!data)return;if(renderedScene!==sceneFor(state)){visualPos=center(state.pos);hidePrompt();build();return;}const phase=state.phase,id=targetId(state),index={encounter:0,collect:1,sell:2,buy:3,equip:3,revenge:4,complete:4}[phase];
 $('task-title').textContent=t('visualTitle'+phase[0].toUpperCase()+phase.slice(1));$('step-count').textContent=String(index+1).padStart(2,'0')+' / 05';$('resource-count').textContent=num(state.resource);$('gold-count').textContent=num(state.gold);
 $('resource-balance').setAttribute('aria-label',t('resourceBalance',{n:num(state.resource)}));$('gold-balance').setAttribute('aria-label',t('goldBalance',{n:num(state.gold)}));
 document.querySelectorAll('.step').forEach((el,i)=>{el.classList.toggle('current',i===index&&phase!=='complete');el.classList.toggle('done',i<index||phase==='complete');});
 for(const[k,b]of Object.entries(objects)){
  b.hidden=renderedScene==='battle'?k!=='enemy':k==='enemy';const active=k===id&&phase!=='complete';b.classList.toggle('active',active);b.classList.toggle('claimed',k==='resource'&&state.chestOpened);b.setAttribute('aria-disabled',String(busy||phase==='complete'));if(k==='enemy')b.classList.toggle('defeated',state.enemyDefeated);
  b.querySelector('img').src=asset(k==='resource'&&state.chestOpened?'chest-open-art.webp':OBJECTS[k].art);b.querySelector('.object-pin').hidden=!active;
  const text=k==='resource'?t(state.chestOpened?(raidModel.layout==='portrait'?'chest':'collected'):'open'):k==='trader'?t(active?'sellAt':'market'):k==='enemy'?(state.enemyDefeated?t('victory'):name(data.enemy)):t('armory');priceLabel(b.querySelector('.place-label'),text,active&&k==='trader'?data.resource.sceneQuantity*data.resource.saleUnitGold:active&&k==='armorer'?data.artifact.goldPrice:undefined);
  b.setAttribute('aria-label',t({resource:'chest',trader:'market',armorer:'armory',enemy:'enemy'}[k]));if(k==='enemy')b.querySelector('[role=progressbar]').setAttribute('aria-label',name(data.enemy));
 }
 for(const{b,p}of tiles){b.setAttribute('aria-label',t('cell',{x:p[0]+1,y:p[1]+1}));b.tabIndex=-1;}
 const carry=state.resource>0;$('hero').classList.toggle('carrying',carry);$('hero').classList.toggle('upgraded',state.equipped);$('hero-cargo').hidden=!carry;$('cargo-count').textContent=String(state.resource);$('cargo-count').hidden=!carry;$('hero-artifact').hidden=!state.equipped;
 $('stage').dataset.phase=phase;$('completion').hidden=phase!=='complete';$('completion-stat').textContent=`+${data.artifact.statAmount} ${t('attack')}`;$('power-badge').textContent=`+${data.artifact.statAmount} ${t('attack')}`;$('power-badge').hidden=!state.equipped;
 $('shop-name').textContent=name(data.artifact);$('shop-stat').textContent=`+${data.artifact.statAmount} ${t('attack')}`;$('shop-prompt').setAttribute('aria-label',`${t('buyShort')}: ${name(data.artifact)}, ${num(data.artifact.goldPrice)} ${t('gold')}`);
 $('shop-prompt').hidden=!promptOpen||!['buy','equip'].includes(phase);if(!moving&&!busy&&phase!=='complete')announce(phase==='buy'&&promptOpen?'offerHint':phase+'Hint');if(busy&&phase==='equip')announce('equipping');if(phase==='complete')announce('victoryHint');paintHero();positionPrompt();if(!moving&&!busy&&phase!=='complete')showRoute(pathToObject(state.pos,id)??[]);
}
function start(fresh=false){stop();state=fresh||!saved?freshState():saved;saved=null;up=false;left=false;visualPos=center(state.pos);battle.reset(state);save();setMode('playing');render();$('stage').focus({preventScroll:true});send('start');if(state.phase==='equip')equipRecovered();}
function showRoute(path){$('route').replaceChildren();hexes.forEach(({el,p})=>el.classList.toggle('route-step',path.some(q=>same(q,p))));const line=document.createElementNS(SVG,'polyline');line.setAttribute('points',[state.pos,...path].map(p=>{const c=center(p);return`${c.x},${c.y}`;}).join(' '));$('route').append(line);}
function follow(path,arrival){
 if(!path||moving||busy||mode!=='playing')return;hidePrompt();if(!path.length){arrival?.();return;}moving=true;announce('moving');showRoute(path);let index=0,from={...visualPos},to=center(path[0]),began=performance.now();
 function frame(now){const p=Math.min(1,(now-began)/(reduced()?1:330));up=to.y<from.y;left=to.x<from.x;visualPos={x:from.x+(to.x-from.x)*p,y:from.y+(to.y-from.y)*p};paintHero(now);
  if(p===1){state=transition(state,{type:'MOVE',pos:path[index]},data);save();index++;if(index===path.length){moving=false;visualPos=center(state.pos);$('route').replaceChildren();hexes.forEach(({el})=>el.classList.remove('route-step'));render();arrival?.();if(!arrival){if(canInteract(state,targetId(state)))interact(targetId(state));else announce('arrived');}return;}from={...to};to=center(path[index]);began=now;}routeRaf=requestAnimationFrame(frame);}
 routeRaf=requestAnimationFrame(frame);
}
function travel(pos){if(moving||busy||mode!=='playing'||state.phase==='complete')return;const path=pathTo(state.pos,pos,sceneFor(state));if(path===null){announce('blocked');return;}follow(path);}
function visit(id){if(moving||busy||mode!=='playing'||state.phase==='complete')return;if(id!==targetId(state)){announce(id==='resource'?'emptyCopy':'wrongCopy');return;}follow(pathToObject(state.pos,id),()=>interact(id));}
function commit(type,refresh=true){const before=state;state=transition(state,{type},data);if(before===state)return false;save();if(refresh)render();if(state.phase!==before.phase)send('step',{step:state.phase});return true;}
async function interact(id){
 if(!canInteract(state,id)||id!==targetId(state)||busy)return;
 if(state.phase==='buy'){promptOpen=true;render();$('shop-prompt').focus({preventScroll:true});return;}
 if(state.phase==='equip'){equipRecovered();return;}
 const ticket=++operation;busy=true;render();
 if(id==='enemy'){
  const valid=()=>ticket===operation;if(state.phase==='encounter'){if(await battle.first(valid)&&valid()){busy=false;commit('FIRST_BATTLE_LOST');announce('failedHint');$('stage').focus({preventScroll:true});}}
  else if(state.phase==='revenge'){const ok=await battle.revenge(valid,()=>{if(commit('DEFEAT_ENEMY')){send('complete');$('completion').hidden=true;}});if(ok&&valid()){busy=false;render();$('completion').focus({preventScroll:true});}}return;
 }
 if(state.phase==='collect'){
  commit('OPEN_CHEST');objects.resource.classList.add('opening');await fx.fly(data.resource.image,{...objectCenter('resource'),y:objectCenter('resource').y-110},fx.hero(),data.resource.sceneQuantity);objects.resource.classList.remove('opening');
  if(ticket!==operation)return;if(commit('COLLECT')){fx.pop({x:visualPos.x,y:visualPos.y-310},'+'+data.resource.sceneQuantity,data.resource.image);announce('flowCollect');}
 }else if(state.phase==='sell'){
  const amount=state.resource*data.resource.saleUnitGold;await fx.fly(data.resource.image,fx.hero(),{...objectCenter('trader'),y:objectCenter('trader').y-90},state.resource);if(ticket!==operation)return;
  if(commit('SELL')){fx.pop({x:visualPos.x,y:visualPos.y-310},'+'+num(amount),'gold.webp');$('hero-cargo').hidden=true;await Promise.all([fx.fly('gold.webp',{...objectCenter('trader'),y:objectCenter('trader').y-90},fx.balance(),12,{arc:180,duration:650,spread:30}),fx.counter($('gold-count'),state.gold-amount,state.gold,num)]);if(ticket!==operation)return;announce('flowSell');}
 }
 busy=false;render();
}
function positionPrompt(){if(!promptOpen)return;const box=$('shop-prompt'),portrait=raidModel.layout==='portrait',width=portrait?800:390;box.style.width=width+'px';box.style.left=Math.max(20,Math.min(WORLD.width-width-20,visualPos.x-width/2))+'px';box.style.top=Math.max(110,Math.min(WORLD.height-210,visualPos.y-(portrait?570:390)))+'px';}
async function buy(){
 if(busy||state.phase!=='buy'||!canInteract(state,'armorer'))return;const ticket=++operation,oldGold=state.gold;busy=true;hidePrompt();if(!commit('BUY')){busy=false;return;}
 await Promise.all([fx.fly('gold.webp',fx.balance(),{...objectCenter('armorer'),y:objectCenter('armorer').y-150},8,{arc:95}),fx.counter($('gold-count'),oldGold,state.gold,num)]);if(ticket!==operation)return;
 await fx.fly(data.artifact.image,{...objectCenter('armorer'),y:objectCenter('armorer').y-170},fx.hero(),1,{arc:80,duration:650});if(ticket!==operation)return;await finishUpgrade(ticket);
}
async function finishUpgrade(ticket){
 if(!commit('EQUIP',false)){busy=false;return;}$('hero').classList.add('upgraded');$('hero-artifact').hidden=false;
 fx.pop({x:visualPos.x,y:visualPos.y-310},`+${data.artifact.statAmount} ${t('attack')}`,data.artifact.image);await fx.power();if(ticket!==operation)return;
 busy=false;render();announce('powerReady');$('stage').focus({preventScroll:true});
}
async function equipRecovered(){if(busy||moving||mode!=='playing'||!$('restart-shade').hidden||state.phase!=='equip')return;if(!canInteract(state,'armorer')){follow(pathToObject(state.pos,'armorer'),()=>equipRecovered());return;}const ticket=++operation;busy=true;await finishUpgrade(ticket);}
function direction(code){if(moving||busy||mode!=='playing'||state.phase==='complete')return;const p=state.pos,choices=neighbors(p,sceneFor(state)),wanted={ArrowRight:0,KeyD:0,ArrowDown:Math.PI/2,KeyS:Math.PI/2,ArrowLeft:Math.PI,KeyA:Math.PI,ArrowUp:-Math.PI/2,KeyW:-Math.PI/2,KeyQ:-2*Math.PI/3,KeyE:-Math.PI/3}[code];if(wanted===undefined)return;const c=center(p),angle=q=>Math.atan2(center(q).y-c.y,center(q).x-c.x),diff=a=>Math.abs(Math.atan2(Math.sin(a-wanted),Math.cos(a-wanted)));choices.sort((a,b)=>diff(angle(a))-diff(angle(b)));if(choices[0]&&diff(angle(choices[0]))<Math.PI/2)follow([choices[0]]);else announce('blocked');}
function trap(event,container){if(event.key!=='Tab')return;const a=[...container.querySelectorAll('button,a')].filter(e=>!e.disabled&&!e.hidden),first=a[0],last=a.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
$('cover-action').addEventListener('click',()=>mode==='error'?load():start());$('cover-secondary').addEventListener('click',()=>start(true));$('replay').addEventListener('click',()=>start(true));$('language').addEventListener('click',()=>setLanguage(lang==='ru'?'en':'ru'));$('shop-prompt').addEventListener('click',buy);
$('restart').addEventListener('click',()=>{returnFocus=document.activeElement;stop();render();$('restart-shade').hidden=false;$('stage').inert=true;$('hud').inert=true;$('completion').inert=true;$('keep-playing').focus();});
function closeRestart(recover=true){$('restart-shade').hidden=true;$('stage').inert=mode!=='playing';$('hud').inert=mode!=='playing';$('completion').inert=false;returnFocus?.focus({preventScroll:true});if(recover&&state.phase==='equip')equipRecovered();}
$('keep-playing').addEventListener('click',()=>closeRestart());$('confirm-restart').addEventListener('click',()=>{closeRestart(false);start(true);});
$('stage').addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(e.code)){e.preventDefault();direction(e.code);}if(e.target===$('stage')&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();visit(targetId(state));}});
document.addEventListener('keydown',e=>{if(!$('restart-shade').hidden){trap(e,$('restart-shade'));if(e.key==='Escape')closeRestart();return;}if(e.key==='Escape'&&promptOpen){hidePrompt();render();objects.armorer.focus();return;}if(e.key==='Escape'&&embedded){stop();save();send('close');}});
$('exit').hidden=!embedded||params.get('close')==='host';$('exit').addEventListener('click',()=>{stop();save();send('close');});$('open-game').addEventListener('click',()=>send('open-game'));
window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==parentOrigin||e.data?.source!=='yupland-heroes-host'||e.data.version!==1)return;if(e.data.type==='language')setLanguage(e.data.lang);if(e.data.type==='pause'){stop();save();render();}if(e.data.type==='start'&&data&&mode==='intro')start();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(data){save();render();}}else if(data&&state.phase==='equip'&&mode==='playing')equipRecovered();});window.addEventListener('pagehide',()=>{stop();loadVersion++;loadAbort?.abort();});
new ResizeObserver(resize).observe($('app'));setLanguage(lang);load();
