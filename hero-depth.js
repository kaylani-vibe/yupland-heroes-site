(() => {
  const scene = document.getElementById('top');
  const hero = scene?.querySelector('.hero-yupik');
  const background = scene?.querySelector('.hero-bg');
  if (!scene || !hero || !background || !('IntersectionObserver' in window)) return;
  const desktopMouse = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let bounds = null;
  let frame = 0;
  let lastTime = null;
  let x = 0, y = 0, targetX = 0, targetY = 0;

  function allowed() {
    return visible && desktopMouse.matches && !reduced.matches && !document.hidden && document.documentElement.dataset.motion !== 'reduced';
  }
  function paint() {
    hero.style.setProperty('--hero-depth-x',`${(x * 6).toFixed(3)}px`);
    hero.style.setProperty('--hero-depth-y',`${(y * 4).toFixed(3)}px`);
    background.style.setProperty('--hero-bg-depth-x',`${(-x * 3).toFixed(3)}px`);
    background.style.setProperty('--hero-bg-depth-y',`${(-y * 2).toFixed(3)}px`);
  }
  function stop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
    bounds = null;
    x = y = targetX = targetY = 0;
    ['--hero-depth-x','--hero-depth-y'].forEach(name => hero.style.removeProperty(name));
    ['--hero-bg-depth-x','--hero-bg-depth-y'].forEach(name => background.style.removeProperty(name));
  }
  function tick(time) {
    frame = 0;
    if (!allowed()) { stop(); return; }
    const elapsed = lastTime === null ? 16 : Math.max(0,Math.min(64,time - lastTime));
    lastTime = time;
    const amount = 1 - Math.exp(-elapsed / 100);
    x += (targetX - x) * amount;
    y += (targetY - y) * amount;
    if (Math.abs(targetX - x) < .0008 && Math.abs(targetY - y) < .0008) {
      x = targetX; y = targetY;
      paint(); lastTime = null;
      return;
    }
    paint();
    frame = window.requestAnimationFrame(tick);
  }
  function queue() {
    if (!frame) frame = window.requestAnimationFrame(tick);
  }
  function neutral() {
    targetX = targetY = 0;
    if (!allowed()) { stop(); return; }
    if (Math.abs(x) > .0008 || Math.abs(y) > .0008) queue();
  }
  scene.addEventListener('pointerenter', () => { bounds = null; });
  scene.addEventListener('pointermove', event => {
    if (!allowed()) return;
    if (event.pointerType && event.pointerType !== 'mouse') { stop(); return; }
    if (event.target?.closest?.('a,button,input,select,textarea,[role="button"]')) { neutral(); return; }
    if (!bounds) bounds = scene.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    targetX = Math.max(-1,Math.min(1,(event.clientX - bounds.left) / bounds.width * 2 - 1));
    targetY = Math.max(-1,Math.min(1,(event.clientY - bounds.top) / bounds.height * 2 - 1));
    queue();
  }, {passive:true});
  scene.addEventListener('pointerleave',neutral);
  scene.addEventListener('pointercancel',neutral);
  scene.addEventListener('focusin',neutral);
  window.addEventListener('blur',stop);
  window.addEventListener('resize',stop);
  window.addEventListener('scroll',() => { bounds = null; neutral(); },{passive:true});
  desktopMouse.addEventListener('change',stop);
  reduced.addEventListener('change',stop);
  document.addEventListener('visibilitychange',stop);
  document.addEventListener('yupland:motion-change',stop);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .1;
    if (!visible) stop();
  },{threshold:.1});
  observer.observe(scene);
})();
