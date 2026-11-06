(() => {
  document.querySelectorAll('[data-paper-loading]').forEach(section => {
    const paper = section.querySelector('.paper-sheet img');
    if (!paper) return;

    function showParchment() {
      if (paper.naturalWidth > 0) delete section.dataset.paperLoading;
    }

    paper.addEventListener('load', showParchment);
    if (paper.complete) showParchment();
  });
})();

(() => {
  const retried = new WeakSet();

  function retry(image) {
    if (retried.has(image) || !image.hasAttribute('src')) return;

    const failedUrl = new URL(image.currentSrc || image.src);
    if (failedUrl.origin !== location.origin || !failedUrl.pathname.includes('/assets/')) return;
    retried.add(image);

    const source = Array.from(image.closest('picture')?.querySelectorAll('source[srcset]') || [])
      .find(candidate => new URL(candidate.srcset, document.baseURI).href === failedUrl.href);

    // Bypass the failed response and retain the selected desktop or mobile image.
    failedUrl.searchParams.set('retry', String(Date.now()));
    if (source) source.srcset = failedUrl.href;
    else image.src = failedUrl.href;
  }

  document.querySelectorAll('main img[src]').forEach(image => {
    image.addEventListener('error', () => retry(image));
    if (image.complete && !image.naturalWidth) retry(image);
  });
})();
