(() => {
  function publishState(image, state) {
    image.dataset.mediaState = state;
    image.dispatchEvent(new Event('yupland:media-state'));
    if (state === 'ready') {
      const paper = image.closest('.paper-sheet');
      if (paper) paper.closest('[data-paper-loading]')?.removeAttribute('data-paper-loading');
    }
  }

  function watch(image) {
    const retries = new Set();
    const loaded = () => {
      const url = image.currentSrc;
      if (!url || !image.naturalWidth) return;
      image.decode().then(() => {
        if (image.currentSrc === url) publishState(image, 'ready');
      }).catch(() => {
        if (image.currentSrc === url && image.complete) failed();
      });
    };
    const failed = () => {
      if (!image.hasAttribute('src')) return;
      const url = new URL(image.currentSrc || image.src);
      url.searchParams.delete('retry');
      if (url.origin !== location.origin || !url.pathname.includes('/assets/') || retries.has(url.pathname)) {
        publishState(image, 'failed');
        return;
      }

      const sources = [...(image.closest('picture')?.querySelectorAll('source[srcset]') || [])];
      const selected = sources.find(source => new URL(source.srcset, document.baseURI).href === url.href);
      retries.add(url.pathname);
      if (selected?.type === 'image/avif') {
        sources.filter(source => source.type === 'image/avif').forEach(source => source.removeAttribute('srcset'));
        return;
      }
      url.searchParams.set('retry', String(Date.now()));
      if (selected) selected.srcset = url.href;
      else image.src = url.href;
    };

    image.addEventListener('load', loaded);
    image.addEventListener('error', failed);
    if (image.hasAttribute('src') && image.complete) {
      if (image.naturalWidth) loaded();
      else failed();
    }
  }

  const directHow = location.hash === '#how';
  const howPriority = '#how .map-explorer img[data-deferred-src], #how .steps article:nth-child(3) img[data-deferred-src]';
  function activate(target) {
    if (target.hasAttribute('data-deferred-background')) {
      target.removeAttribute('data-deferred-background');
      return;
    }
    if (directHow && target.matches(howPriority)) {
      target.fetchPriority = 'high';
    }
    const picture = target.closest('picture');
    picture?.querySelectorAll('source[data-deferred-srcset]').forEach(source => {
      source.srcset = source.dataset.deferredSrcset;
    });
    target.src = target.dataset.deferredSrc;
  }

  const images = document.querySelectorAll('main img[src], main img[data-deferred-src]');
  images.forEach(watch);
  if (directHow) document.querySelectorAll(howPriority).forEach(activate);

  const deferred = document.querySelectorAll('img[data-deferred-src]:not([src]), [data-deferred-background]');
  if ('IntersectionObserver' in window) {
    const loadVisible = (entries, observer) => {
      for (const {isIntersecting, target} of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        activate(target);
      }
    };
    const atViewport = new IntersectionObserver(loadVisible);
    const nearViewport = new IntersectionObserver(loadVisible, {rootMargin: '120px 0px'});
    deferred.forEach(target => {
      const observer = target.closest('.steps') ? atViewport : nearViewport;
      observer.observe(target);
    });
  } else {
    deferred.forEach(activate);
  }
})();
