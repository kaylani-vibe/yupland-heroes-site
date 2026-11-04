/* One short word reveal, using the existing approved headline in either language. */
(() => {
  const title = document.getElementById('world-title');
  if (!title || !('IntersectionObserver' in window)) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let signature = '';
  let finished = false;
  let observer;
  const finish = () => {
    finished = true;
    title.classList.remove('phrase-ready', 'phrase-shown');
    observer?.disconnect();
  };
  const build = () => {
    const groups = [...title.querySelectorAll('[data-i18n]')];
    const text = groups.map(group => group.textContent.trim());
    const next = text.join(' ');
    title.setAttribute('aria-label', next);
    if (signature === next) return;
    if (signature) finish();
    signature = next;
    let index = 0;
    groups.forEach((group, groupIndex) => {
      group.replaceChildren();
      text[groupIndex].split(/(\s+)/).filter(Boolean).forEach(part => {
        if (/^\s+$/.test(part)) { group.append(document.createTextNode(part)); return; }
        const word = document.createElement('i');
        word.className = 'phrase-word';
        word.textContent = part;
        word.style.setProperty('--word-delay', `${index++ * .11}s`);
        group.append(word);
      });
    });
  };
  build();
  new MutationObserver(build).observe(title, { childList: true, subtree: true });
  if (reduced.matches || document.documentElement.dataset.motion === 'reduced') return;
  observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || finished) return;
    title.classList.add('phrase-shown');
    observer.disconnect();
  }, { threshold: .2 });
  observer.observe(title);
  title.classList.add('phrase-ready');
  title.addEventListener('animationend', event => {
    if (event.animationName === 'world-word' &&
        event.target === [...title.querySelectorAll('.phrase-word')].at(-1)) finish();
  });
  const checkMotion = () => {
    if (reduced.matches || document.documentElement.dataset.motion === 'reduced') finish();
  };
  reduced.addEventListener('change', checkMotion);
  document.addEventListener('yupland:motion-change', checkMotion);
  new MutationObserver(checkMotion).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-motion']
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && title.classList.contains('phrase-shown')) finish();
  });
})();
