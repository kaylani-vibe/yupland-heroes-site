/* Runs before styles: saved/system preferences apply before the first animation. */
(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'yupland.site.motion.v1';
  let manual = false;
  const read = () => { try { manual = localStorage.getItem(key) === 'reduced'; } catch {} };
  read();
  const render = () => {
    const reduced = system.matches || manual;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    const english = root.lang === 'en';
    const label = english ? 'Less motion' : 'Меньше движения';
    const suffix = system.matches ? (english ? ' · system setting' : ' · по системе') : '';
    document.querySelectorAll('[data-motion-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(reduced));
      button.setAttribute('aria-label', label + suffix);
      button.title = label + suffix;
      button.disabled = system.matches;
      button.querySelector('.motion-label').textContent = label + suffix;
    });
    document.dispatchEvent(new CustomEvent('yupland:motion-change', { detail: { reduced } }));
  };
  // Set only the preference now; controls and effects bind after the document is ready.
  root.dataset.motion = system.matches || manual ? 'reduced' : 'full';
  const ready = () => {
    const pageVisibility = () => { root.dataset.pageHidden = String(document.hidden); };
    document.addEventListener('visibilitychange', pageVisibility);
    pageVisibility();
    document.querySelectorAll('[data-motion-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        if (system.matches) return;
        manual = !manual;
        try { if (manual) localStorage.setItem(key, 'reduced'); else localStorage.removeItem(key); } catch {}
        render();
      });
    });
    const hero = document.getElementById('top');
    if (hero?.classList.contains('hero')) {
      const pause = visible => {
        root.dataset.heroPaused = document.hidden || !visible ? 'true' : 'false';
      };
      let visible = false;
      if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        pause(visible);
      }, { threshold: 0 }).observe(hero);
      else visible = true;
      document.addEventListener('visibilitychange', () => pause(visible));
      hero.addEventListener('animationend', event => {
        if (event.animationName === 'hero-enter') hero.classList.add('motion-entered');
      });
      document.addEventListener('yupland:motion-change', () => {
        if (root.dataset.motion === 'reduced') hero.classList.add('motion-entered');
      });
      pause(visible);
    }
    new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ['lang'] });
    root.dataset.motionReady = 'true';
    render();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
  system.addEventListener('change', render);
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) { read(); render(); } });
})();
