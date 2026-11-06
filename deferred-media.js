(() => {
  const sections = [...document.querySelectorAll('[data-media-pending]')];
  const backgrounds = [...document.querySelectorAll('[data-background-pending]')];
  function load(element) {
    const paper = element.querySelector('.paper-sheet img');
    if (paper && element.hasAttribute('data-paper-loading')) {
      paper.addEventListener('load', () => {
        if (paper.naturalWidth > 1) delete element.dataset.paperLoading;
      });
    }
    element.querySelectorAll('source[data-srcset]').forEach(source => {
      source.srcset = source.dataset.srcset;
      delete source.dataset.srcset;
    });
    element.querySelectorAll('img[data-src]').forEach(image => {
      image.src = image.dataset.src;
      delete image.dataset.src;
    });
    delete element.dataset.mediaPending;
    delete element.dataset.backgroundPending;
  }
  let started = false;
  function start() {
    if (started) return;
    started = true;
    window.removeEventListener('scroll', beginOnScroll);
    if (!('IntersectionObserver' in window)) {
      [...sections, ...backgrounds].forEach(load);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.hasAttribute('data-background-pending')) {
          delete entry.target.dataset.backgroundPending;
        } else {
          load(entry.target);
        }
        observer.unobserve(entry.target);
      });
    }, {rootMargin: '120px 0px'});
    [...sections, ...backgrounds].forEach(element => observer.observe(element));
  }
  function beginOnScroll() {
    if (window.scrollY > 8) start();
  }
  if (window.scrollY > 8 || (location.hash && !['#top', '#main'].includes(location.hash))) start();
  else window.addEventListener('scroll', beginOnScroll, {passive:true});
  window.addEventListener('hashchange', start, {once:true});
})();
