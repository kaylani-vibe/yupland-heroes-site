(() => {
  const hero = document.querySelector('.hero-yupik');
  if (!hero) return;
  const base = hero.querySelector('.hero-yupik-base');
  const eyelids = Array.from(hero.querySelectorAll('[data-blink-src]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const capeWarp = document.getElementById?.('yupik-cape-warp');
  const wingsWarp = document.getElementById?.('yupik-wings-warp');
  const capeMask = document.getElementById?.('yupik-cape-mask');
  const wingsMask = document.getElementById?.('yupik-wings-mask');
  const windNoise = document.getElementById?.('yupik-wind-noise');
  const breezeSupported = capeWarp && wingsWarp && capeMask && wingsMask && windNoise && window.CSS?.supports('filter','url("#yupik-cloth-filter")');
  let visible = false;
  let waiting = 0;
  let closing = 0;
  let firstBlink = true;
  let breezeFrame = 0;
  let breezeStart = null;
  let breezeLastPaint = null;
  let capeStrength = 0;
  let wingsStrength = 0;

  function motionAllowed() {
    return visible && !document.hidden && !reduced.matches && document.documentElement.dataset.motion !== 'reduced';
  }
  function frameReady() {
    return base.complete && base.naturalWidth > 0 && eyelids.every(image => image.complete && image.naturalWidth > 0);
  }
  function stop() {
    window.clearTimeout(waiting);
    window.clearTimeout(closing);
    waiting = closing = 0;
    hero.classList.remove('is-blinking');
    stopBreeze();
  }
  function stopBreeze() {
    if (breezeFrame) window.cancelAnimationFrame(breezeFrame);
    breezeFrame = 0;
    breezeStart = breezeLastPaint = null;
    hero.classList.remove('has-breeze');
    capeWarp?.setAttribute('scale','0');
    wingsWarp?.setAttribute('scale','0');
  }
  function paintBreeze(time) {
    breezeFrame = 0;
    if (!motionAllowed() || !base.complete || base.naturalWidth === 0) { stopBreeze(); return; }
    if (breezeStart === null) breezeStart = time;
    // SVG paint is capped below the display refresh rate; no layout reads here.
    if (breezeLastPaint === null || time - breezeLastPaint >= 1000 / 30) {
      const seconds = (time - breezeStart) / 1000;
      const entrance = .5 - .5 * Math.cos(Math.min(1, seconds / 1.2) * Math.PI);
      const cape = capeStrength * entrance * (.78 * Math.sin(seconds * Math.PI * 2 / 6.8) + .22 * Math.sin(seconds * Math.PI * 2 / 3.7));
      const wings = wingsStrength * entrance * Math.sin(seconds * Math.PI * 2 / 4.2 + .9);
      capeWarp.setAttribute('scale',cape.toFixed(3));
      wingsWarp.setAttribute('scale',wings.toFixed(3));
      breezeLastPaint = time;
    }
    breezeFrame = window.requestAnimationFrame(paintBreeze);
  }
  function startBreeze() {
    if (!breezeSupported || !motionAllowed() || !base.complete || base.naturalWidth === 0) return;
    const width = base.clientWidth;
    const height = base.clientHeight;
    if (!width || !height) return;
    [capeMask,wingsMask].forEach(mask => {
      mask.setAttribute('width',String(width));
      mask.setAttribute('height',String(height));
    });
    windNoise.setAttribute('baseFrequency',`${(2.5 / width).toFixed(6)} ${(3.2 / height).toFixed(6)}`);
    capeStrength = Math.min(12, Math.max(3, width * .016));
    wingsStrength = Math.min(8, Math.max(2, width * .01));
    hero.classList.add('has-breeze');
    if (!breezeFrame) breezeFrame = window.requestAnimationFrame(paintBreeze);
  }
  function schedule() {
    if (!motionAllowed() || !frameReady() || waiting || closing) return;
    waiting = window.setTimeout(() => {
      waiting = 0;
      if (!motionAllowed() || !frameReady()) return;
      firstBlink = false;
      hero.classList.add('is-blinking');
      closing = window.setTimeout(() => {
        closing = 0;
        hero.classList.remove('is-blinking');
        schedule();
      }, 170);
    }, firstBlink ? 1800 : 4800 + Math.random() * 4200);
  }
  function sync() {
    if (!motionAllowed()) { stop(); return; }
    startBreeze();
    eyelids.forEach(image => {
      if (!image.getAttribute('src')) image.src = image.dataset.blinkSrc;
    });
    schedule();
  }
  base.addEventListener('load', sync);
  eyelids.forEach(image => image.addEventListener('load', sync));
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('yupland:motion-change', sync);
  if (breezeSupported) {
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(base);
    else window.addEventListener('resize',sync);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .1;
      sync();
    }, {threshold: .1});
    observer.observe(hero);
  }
  // Without IntersectionObserver the original open-eyed art remains visible.
})();
