/* Reuse one navigation on desktop and mobile. No scroll loop or duplicate links. */
(() => {
  const nav = document.getElementById('nav');
  const home = nav?.parentElement;
  const main = document.querySelector('main');
  const header = document.querySelector('.hero-header');
  const hero = header?.closest('.hero');
  if (!nav || !home || !main || !header || !hero) return;
  const desktop = window.matchMedia('(min-width: 761px)');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll('#how,#guides,#demo,#world,#mini,#news')];
  const visible = new Set();
  let headerVisible = true;
  function position() {
    if (!desktop.matches && document.getElementById('mobile-menu-dialog')?.open) return;
    const floating = desktop.matches && !headerVisible;
    const active = nav.contains(document.activeElement) ? document.activeElement : null;
    if (floating && nav.parentElement !== document.body) document.body.insertBefore(nav, main);
    if (!floating && nav.parentElement !== home) home.append(nav);
    nav.dataset.floating = String(floating);
    nav.hidden = !desktop.matches;
    document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
    if (active && desktop.matches) active.focus({preventScroll:true});
    document.dispatchEvent(new Event('yupland:nav-position'));
  }
  function mark(id) {
    links.forEach(link => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || (event.button && event.button !== 0)) return;
    if (!desktop.matches) return;
    const section = document.getElementById(link.getAttribute('href').slice(1));
    const heading = section?.querySelector('h2,h3');
    if (heading) {
      heading.setAttribute('tabindex','-1');
      window.requestAnimationFrame(() => heading.focus({preventScroll:true}));
    }
    // Keep the native anchor, browser history and reduced-motion scroll behavior.
  }));
  if ('IntersectionObserver' in window) {
    let chapters;
    const observeChapters = () => {
      chapters?.disconnect();
      visible.clear();
      chapters = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      mark(sections.filter(section => visible.has(section)).at(-1)?.id || '');
      }, {rootMargin:`-${Math.round(window.innerHeight * .25)}px 0px -${Math.round(window.innerHeight * .74)}px 0px`,threshold:0});
      sections.forEach(section => chapters.observe(section));
    };
    observeChapters();
    window.addEventListener('resize', observeChapters);
    // The hero releases its sticky header at the section boundary. Move the
    // chapter row out before the foreground of the next section covers it.
    new IntersectionObserver(([entry]) => {
      const fullyVisible = entry.isIntersecting && entry.intersectionRatio >= .99;
      if (headerVisible === fullyVisible) return;
      headerVisible = fullyVisible;
      position();
    }, {threshold:.99}).observe(header);

    const headerStart = document.createElement('span');
    headerStart.className = 'hero-header-start';
    headerStart.setAttribute('aria-hidden', 'true');
    hero.prepend(headerStart);
    new IntersectionObserver(([entry]) => {
      header.toggleAttribute('data-pinned', entry.boundingClientRect.bottom <= 0);
    }).observe(headerStart);
  }
  const label = () => nav.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Page chapters' : 'Разделы сайта');
  new MutationObserver(label).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  desktop.addEventListener('change', position);
  document.addEventListener('yupland:nav-resize', position);
  label();
  position();
})();
