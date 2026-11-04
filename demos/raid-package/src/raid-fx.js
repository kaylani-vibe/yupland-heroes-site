// Visual effects use local scene coordinates. Cancelling resolves every pending effect.
export function createEffects({layer,world,hero,hud,asset,reduced}){
 let generation=0;const active=new Set();
 const point=el=>{const w=world.getBoundingClientRect(),r=el.getBoundingClientRect(),s=w.width/world.offsetWidth;return{x:(r.x+r.width/2-w.x)/s,y:(r.y+r.height/2-w.y)/s};};
 function animate(duration,update){
  const id=generation;let handle;
  return new Promise(resolve=>{const finish=()=>{cancelAnimationFrame(handle);active.delete(finish);resolve(id===generation);};active.add(finish);const began=performance.now();
   function frame(now){if(id!==generation){finish();return;}const p=Math.min(1,(now-began)/(reduced()?1:duration));update(p);if(p===1)finish();else handle=requestAnimationFrame(frame);}handle=requestAnimationFrame(frame);
  });
 }
 function cancel(){generation++;for(const end of [...active])end();layer.replaceChildren();hero.classList.remove('celebrate');}
 async function fly(image,from,to,count=4,{duration=570,spread=65,arc=65}={}){
  const nodes=[];const countSafe=reduced()?1:count;
  const jobs=Array.from({length:countSafe},(_,i)=>{const el=document.createElement('img');el.src=asset(image);el.alt='';el.className='flying-item'+(image==='gold.webp'?' coin':'');layer.append(el);nodes.push(el);
   return animate(duration+i*spread,p=>{const q=Math.max(0,Math.min(1,(p*(duration+i*spread)-i*spread)/duration)),e=1-(1-q)**3;el.style.left=(from.x+(to.x-from.x)*e+(i%3-1)*Math.sin(q*Math.PI)*10)+'px';el.style.top=(from.y+(to.y-from.y)*e-Math.sin(q*Math.PI)*arc)+'px';el.style.opacity=q===0||q===1?'0':'1';el.style.transform=`translate(-50%,-50%) scale(${.65+Math.sin(q*Math.PI)*.6}) rotate(${(i%2?1:-1)*q*70}deg)`;});
  });
  const ok=(await Promise.all(jobs)).every(Boolean);nodes.forEach(n=>n.remove());return ok;
 }
 async function counter(el,from,to,format){return animate(850,p=>el.textContent=format(Math.round(from+(to-from)*(1-(1-p)**3))));}
 function pop(at,text,image){
  const el=document.createElement('span');el.className='world-pop';el.style.left=at.x+'px';el.style.top=at.y+'px';
  if(image){const img=document.createElement('img');img.src=asset(image);img.alt='';el.append(img);}el.append(document.createTextNode(text));layer.append(el);
  animate(1400,p=>{el.style.translate=`0 ${-p*45}px`;el.style.opacity=p<.75?'1':String((1-p)*4);}).then(()=>el.remove());
 }
 async function power(){
  hero.classList.add('celebrate');const at=point(hero);const particles=[];
  for(let i=0;i<(reduced()?0:16);i++){const el=document.createElement('i');el.className='power-spark';layer.append(el);particles.push(el);const a=Math.PI*2*i/16;
   animate(850,p=>{el.style.left=(at.x+Math.cos(a)*p*180)+'px';el.style.top=(at.y+30+Math.sin(a)*p*100)+'px';el.style.opacity=String(1-p);el.style.transform=`rotate(${a}rad) scale(${1-p*.7})`;});}
  const ok=await animate(1100,()=>{});particles.forEach(n=>n.remove());hero.classList.remove('celebrate');return ok;
 }
 return{cancel,fly,counter,pop,power,point,animate,hero:()=>{const p=point(hero);return{x:p.x+14,y:p.y+12};},balance:()=>point(hud)};
}
