/* Only the lantern light animates; the artwork and text stay still. */
(() => {
  const art = document.querySelector('.guide-art');
  if (!art || !('IntersectionObserver' in window)) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const update = () => {
    art.classList.toggle('is-lit', visible && !document.hidden && !reduced.matches &&
      document.documentElement.dataset.motion !== 'reduced');
  };
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }, { threshold: .05 }).observe(art);
  document.addEventListener('visibilitychange', update);
  document.addEventListener('yupland:motion-change', update);
  reduced.addEventListener('change', update);
  new MutationObserver(update).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-motion']
  });
})();
