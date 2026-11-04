// Choreography for the isolated demo. Bars show relative strength, not live game stats.
export function createBattle({fx,hero,enemy,t,announce,reduced}){
 const mob=()=>enemy(),figure=()=>mob()?.querySelector('.enemy-figure');
 function health(id,value){const e=document.getElementById(id);if(e){e.style.width=value+'%';e.parentElement.setAttribute('aria-valuenow',String(value));}}
 function reset(state){
  hero.style.translate='';hero.classList.remove('combat-hurt','combat-strike');const b=mob();if(b){b.style.translate='';b.classList.remove('combat-hurt');b.classList.toggle('settled',state.enemyDefeated);}
  health('hero-health-fill',100);health('enemy-health-fill',state.enemyDefeated?0:100);
 }
 async function lunge(el,toward,amount=24){
  const a=fx.point(el),b=fx.point(toward),len=Math.hypot(b.x-a.x,b.y-a.y)||1,dx=(b.x-a.x)/len*amount,dy=(b.y-a.y)/len*amount;
  const ok=await fx.animate(370,p=>el.style.translate=`${dx*Math.sin(p*Math.PI)}px ${dy*Math.sin(p*Math.PI)}px`);el.style.translate='';return ok;
 }
 async function slash(powered){
  const a=fx.point(hero),b=fx.point(mob()),p={x:(a.x+b.x)/2,y:(a.y+b.y)/2},layer=document.getElementById('effects'),el=document.createElement('span');el.className='combat-slash'+(powered?' super-slash':'');el.style.left=p.x+'px';el.style.top=(p.y+20)+'px';layer.append(el);
  const ok=await fx.animate(powered?680:370,p=>{el.style.opacity=String(Math.min(1,p*6,(1-p)*5));el.style.transform=`translate(-50%,-50%) rotate(${-60+p*130}deg) scale(${.5+p*.65})`;});el.remove();return ok;
 }
 async function strike(powered,hp){
  hero.classList.add('combat-strike');const ok=(await Promise.all([lunge(hero,mob(),powered?65:42),slash(powered)])).every(Boolean);hero.classList.remove('combat-strike');if(!ok)return false;
  health('enemy-health-fill',hp);mob()?.classList.add('combat-hurt');const held=await fx.animate(150,()=>{});mob()?.classList.remove('combat-hurt');return held;
 }
 async function first(valid){
  announce('firstFight');if(!await strike(false,92)||!valid())return false;
  fx.pop({...fx.point(mob()),y:fx.point(mob()).y-150},t('blockedStrike'));if(!await fx.animate(320,()=>{})||!valid())return false;
  if(!await lunge(mob(),hero,65)||!valid())return false;health('hero-health-fill',35);hero.classList.add('combat-hurt');announce('needPower');
  if(!await fx.animate(950,()=>{})||!valid())return false;hero.classList.remove('combat-hurt');return true;
 }
 async function revenge(valid,onDefeat){
  announce('revengeFight');for(const hp of [66,31,0]){if(!await strike(true,hp)||!valid())return false;if(hp&&(!await fx.animate(170,()=>{})||!valid()))return false;}
  onDefeat();fx.pop({...fx.point(mob()),y:fx.point(mob()).y-150},t('victory'));announce('victoryHint');
  await Promise.all([fx.power(),fx.animate(1050,()=>{})]);return valid();
 }
 return{reset,first,revenge};
}
