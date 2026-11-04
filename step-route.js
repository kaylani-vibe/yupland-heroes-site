/* Decorative route: reveal once, without a persistent scroll loop. */
(() => {
  const steps = document.querySelector('.steps');
  if (!steps || !('IntersectionObserver' in window)) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || document.documentElement.dataset.motion === 'reduced') return;
  const articles = [...steps.querySelectorAll('article')].slice(0, -1);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('route-shown');
      observer.unobserve(entry.target);
    });
  }, { threshold: .25 });
  articles.forEach(article => observer.observe(article));
  steps.classList.add('route-enhanced');
  const finish = () => {
    if (!reduced.matches && document.documentElement.dataset.motion !== 'reduced') return;
    observer.disconnect();
    steps.classList.remove('route-enhanced');
  };
  reduced.addEventListener('change', finish);
  document.addEventListener('yupland:motion-change', finish);
})();
