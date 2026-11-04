/* Host-only integration; the approved game artwork and route remain unchanged. */
(() => {
  const apply = reduced => { document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'; };
  try { apply(localStorage.getItem('yupland.site.motion.v1') === 'reduced'); } catch {}
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.source !== 'yupland-heroes-host' || event.data.version !== 1 || event.data.type !== 'motion') return;
    apply(event.data.reduced === true);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('#open-game')) event.preventDefault();
  },true);
})();
