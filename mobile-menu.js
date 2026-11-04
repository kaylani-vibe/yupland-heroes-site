(() => {
  const dialog = document.getElementById('mobile-menu-dialog');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('mobile-menu-close');
  const slot = document.getElementById('mobile-menu-slot');
  const header = document.querySelector('.site-head');
  if (!dialog?.showModal || !nav || !toggle || !slot) return;
  const desktop = window.matchMedia('(min-width: 761px)');
  let target = null;
  let handoff = false;
  function label() {
    const english = document.documentElement.lang === 'en';
    close.setAttribute('aria-label', english ? 'Close menu' : 'Закрыть меню');
    document.getElementById('mobile-menu-title').textContent = english ? 'EXPLORE YUPLAND' : 'ОТКРОЙ ЮПЛЕНД';
  }
  function shut() { if (dialog.open) dialog.close(); }
  toggle.addEventListener('click', () => {
    if (desktop.matches) return;
    target = null; handoff = false;
    slot.append(nav);
    nav.hidden = false;
    nav.dataset.floating = 'false';
    toggle.setAttribute('aria-expanded','true');
    document.documentElement.classList.add('mobile-menu-open');
    label();
    dialog.showModal();
    close.focus();
  });
  close.addEventListener('click', shut);
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) shut();
  }});
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
    if (!dialog.open || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute('href');
    handoff = link.hasAttribute('data-launch');
    target = href.startsWith('#') ? document.getElementById(href.slice(1))?.querySelector('h2,h3') : null;
    shut();
  }));
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('mobile-menu-open');
    toggle.setAttribute('aria-expanded','false');
    if (!desktop.matches) { header.append(nav); nav.hidden = true; }
    else document.dispatchEvent(new Event('yupland:nav-resize'));
    if (handoff) return;
    if (target) {
      const heading = target;
      target = null;
      heading.setAttribute('tabindex','-1');
      requestAnimationFrame(() => heading.focus({preventScroll:true}));
    } else if (!desktop.matches) toggle.focus({preventScroll:true});
    else header.querySelector('.logo').focus({preventScroll:true});
  });
  desktop.addEventListener('change', shut);
  new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.documentElement.dataset.mobileMenuReady = 'true';
  label();
})();
