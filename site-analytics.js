(() => {
  if (location.hostname !== 'heroes.yupland.io') return;
  let launchPlacement = 'unknown';
  const placement = element => element.closest('section[id]')?.id
    || (element.closest('.site-head') ? 'header' : null)
    || (element.closest('.site-footer') ? 'footer' : null)
    || (element.id === 'compact-launch' ? 'compact' : 'other');
  const capture = (event, properties) => {
    try {
      window.posthog?.capture(event, {
        ...properties,
        page: location.pathname,
        language: document.documentElement.lang,
      });
    } catch (_) {
      // Analytics must never prevent navigation or starting a demo.
    }
  };
  document.addEventListener('click', event => {
    const element = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!element) return;
    const launch = element.closest('[data-launch]');
    if (launch) launchPlacement = placement(launch);
    const demo = element.closest('[data-play]');
    if (demo && ['demo', 'mini'].includes(demo.dataset.play)) {
      capture('site_demo_started', {demo_type: demo.dataset.play === 'mini' ? 'excavations' : 'raid', placement: placement(demo)});
    }
    const option = element.closest('.launch-option');
    if (option?.classList.contains('launch-telegram')) {
      capture('site_game_launch_clicked', {destination: 'telegram', placement: launchPlacement});
    } else if (option?.classList.contains('launch-browser')) {
      capture('site_game_launch_clicked', {destination: 'browser', placement: launchPlacement});
    }
  }, true);
})();
