(() => {
  const button = document.getElementById('compact-launch');
  const hero = document.getElementById('top');
  if (!button || !hero || !('IntersectionObserver' in window)) return;
  const primary = [...document.querySelectorAll('.btn[data-launch], [data-play]')].filter(node => node !== button);
  const visiblePrimary = new Set();
  const dialogs = [...document.querySelectorAll('dialog')];
  const raid = document.getElementById('raid-slot');
  let beyondHero = false;
  let footerVisible = false;
  let visionVisible = false;
  let returnHere = false;
  const update = () => {
    button.hidden = !beyondHero || footerVisible || visionVisible || visiblePrimary.size > 0 ||
      dialogs.some(dialog => dialog.open) || (raid && !raid.hidden);
  };
  new IntersectionObserver(entries => {
    beyondHero = entries[0].boundingClientRect.bottom <= 0;
    update();
  }, {threshold:0}).observe(hero);
  const primaryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visiblePrimary.add(entry.target) : visiblePrimary.delete(entry.target));
    update();
  }, {threshold:0});
  primary.forEach(node => primaryObserver.observe(node));
  const vision = document.getElementById('creator-vision');
  if (vision) new IntersectionObserver(entries => {
    visionVisible = entries[0].isIntersecting;
    update();
  }, {threshold:0}).observe(vision);
  const footer = document.querySelector('.site-footer');
  if (footer) new IntersectionObserver(entries => {
    footerVisible = entries[0].isIntersecting;
    update();
  }, {threshold:0}).observe(footer);
  dialogs.forEach(dialog => new MutationObserver(update).observe(dialog,{attributes:true,attributeFilter:['open']}));
  if (raid) new MutationObserver(update).observe(raid,{attributes:true,attributeFilter:['hidden']});
  button.addEventListener('click', event => {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) returnHere = true;
  });
  document.getElementById('launch-dialog')?.addEventListener('close', () => {
    if (!returnHere) return;
    returnHere = false;
    requestAnimationFrame(() => {
      update();
      if (!button.hidden) button.focus({preventScroll:true});
    });
  });
  const translate = () => {
    button.querySelector('span').textContent = document.documentElement.lang === 'en' ? 'Play' : 'Играть';
  };
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  translate();
  update();
})();
