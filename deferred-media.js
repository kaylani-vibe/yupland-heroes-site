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
