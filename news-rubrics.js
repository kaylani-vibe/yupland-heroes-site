(() => {
  const archive = document.getElementById('issue-archive');
  if (!archive) return;
  document.querySelectorAll('[data-open-news-archive]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
      archive.open = true;
      requestAnimationFrame(() => archive.querySelector('summary').focus({preventScroll:true}));
    });
  });
})();
