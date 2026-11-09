(() => {
  const gallery = document.querySelector('.guide-gallery');
  const track = gallery.querySelector('.guide-gallery-track');
  const controls = gallery.querySelector('.guide-gallery-controls');
  const previous = controls.querySelector('.guide-gallery-prev');
  const next = controls.querySelector('.guide-gallery-next');
  const count = controls.querySelector('.guide-gallery-count');
  const slides = [...track.children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const edgeTolerance = 2;

  const maxScroll = () => track.scrollWidth - track.clientWidth;

  function update() {
    const { left, right } = track.getBoundingClientRect();
    const visible = slides.map((slide, index) => {
      const bounds = slide.getBoundingClientRect();
      return Math.min(right, bounds.right) - Math.max(left, bounds.left) >= bounds.width / 2
        ? index + 1 : null;
    }).filter(Boolean);
    if (visible.length) {
      const first = visible[0];
      const last = visible.at(-1);
      const range = first === last ? 'Кадр ' + first : 'Кадры ' + first + '–' + last;
      const label = range + ' из ' + slides.length;
      if (count.textContent !== label) count.textContent = label;
    }
    previous.setAttribute('aria-disabled', String(track.scrollLeft <= edgeTolerance));
    next.setAttribute('aria-disabled', String(track.scrollLeft >= maxScroll() - edgeTolerance));
  }

  function scrollTo(left) {
    track.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  function turn(direction) {
    const { left } = track.getBoundingClientRect();
    const offsets = slides.map(slide => slide.getBoundingClientRect().left - left);
    const offset = direction < 0
      ? offsets.findLast(value => value < -edgeTolerance)
      : offsets.find(value => value > edgeTolerance);
    if (offset !== undefined) scrollTo(track.scrollLeft + offset);
  }

  previous.addEventListener('click', () => {
    if (previous.getAttribute('aria-disabled') === 'false') turn(-1);
  });
  next.addEventListener('click', () => {
    if (next.getAttribute('aria-disabled') === 'false') turn(1);
  });
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') turn(-1);
    else if (event.key === 'ArrowRight') turn(1);
    else if (event.key === 'Home') scrollTo(0);
    else if (event.key === 'End') scrollTo(maxScroll());
    else return;
    event.preventDefault();
  });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  controls.hidden = false;
  update();
})();
