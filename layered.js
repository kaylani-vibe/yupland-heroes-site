(() => {
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  if (requestedLanguage === 'en' && !window.location.pathname.endsWith('/en.html')) {
    const englishUrl = new URL('en.html', window.location.href);
    englishUrl.search = window.location.search;
    englishUrl.searchParams.delete('lang');
    englishUrl.hash = window.location.hash;
    window.location.replace(englishUrl.href);
    return;
  }
  const en = {
    skip:'Skip to content',openGame:'Open the game',navHow:'How to play',navDemo:'Demo',navWorld:'World',navMini:'Crown',navGuides:'Guides (RU)',navNews:'News',
    heroKicker:'ADVENTURE',hero1:'A WORLD',hero2:'AWAITS',hero3:'A HERO',heroDescription:'Choose your own path. Explore the world, develop your hero, trade, and build.',playDemo:'Play the demo',
    mapUnavailable:'Map temporarily unavailable',howKicker:'HOW IT WORKS',how1:'CHOOSE A HERO.',how2:'EXPLORE THE WORLD.',howIntro:'Decide how you want to live in Yupland: where to go, what to build up, and what to do today.',
    step1:'CHOOSE A HERO',step1Copy:'Start with Yupik, Kaban, or Drakoshka and develop your hero.',step2:'EXPLORE THE WORLD',step2Copy:'Discover new lands, go fishing, hunt for treasure, and hide your own.',step3:'PLAY YOUR WAY',step3Copy:'Build up your castle, take on bosses, or gather resources in the mines.',
    guidesKicker:'FIELD GUIDE',guidesTitle1:'A GUIDE',guidesTitle2:'TO THE WORLD',guidesBlurb:'Learn how to move your hero, read the map, and prepare for an expedition.',allGuides:'All guides (RU)',openGuides:'First steps',
    demoKicker:'PLAY RIGHT HERE',demo1:'YOUR',demo2:'FIRST',demo3:'RAID',demoBlurb:'Move · Collect · Fight',startDemo:'Start the demo',
    worldKicker:'A VAST WORLD',world1:'YOUR',world2:'PATH IN',world3:'YUPLAND',worldBlurb:'There is plenty to do between expeditions. Trade, make your castle your own, and get ready for your next adventure.',
    featureHero:'HEROES',featureHeroCopy:'Choose a hero and develop them at your own pace.',featureWorld:'WORLD',featureWorldCopy:'New lands, fishing spots, and hidden treasures.',featureCastle:'CASTLE',featureCastleCopy:'Build and make your castle your own.',
    miniKicker:'MINI-GAME',mini1:'CROWN OF THE',mini2:'BUCKWHEAT',mini3:'KINGDOM',miniBlurb:'Match pieces and bring three crowns down to the exits in 30 moves.',tryMini:'Play the demo',playCrownFull:'Play the full game',
    newsKicker:'WORLD NEWS',newsTitle1:'CHRONICLES OF',newsTitle2:'YUPLAND',newsIntro:'World news, hero stories, and newspaper issues. Read the Heroes Gazette and follow events across Yupland.',latestIssue:'31 OCTOBER 2026 · LATEST ISSUE',readIssue:'Read the issue',archiveTitle:'ALL ISSUES',dailyTitle:'DAILY BULLETIN',dailyIntro:'Short news from the world of Yupland.',weeklyTitle:'WEEKLY GAZETTE',weeklyIntro:'Longer stories and highlights from Yupland.',issue31:'31 OCTOBER',issue30:'30 OCTOBER',issue29:'29 OCTOBER',spread1:'Spread 1',spread2:'Spread 2',
    finalKicker:'JOIN THE GAME',final1:'YOUR',final2:'ADVENTURE',final3:'STARTS',final4:'HERE',openTelegram:'Open the game in Telegram',
    launchTitle:'YOUR ADVENTURE',launchIntro:'Choose how you want to play.',launchOnline:'Play online',launchTelegram:'In Telegram',launchTelegramCopy:'Open the game bot in Telegram.',launchBrowser:'In your browser',launchBrowserCopy:'Go to the game website.',launchDownloads:'Download for your computer',launchPreparing:'This version is being prepared.',launchSoon:'Coming soon',launchDownloadNote:'Official downloads and installation instructions will appear here when the versions are available. You can play online now.',launchRecommended:'Recommended for you',
    launchQrTitle:'Continue on your phone',launchQrCopy:'Scan the code with your phone camera to open the game bot in Telegram.',demoLoading:'Loading your adventure',demoLoadingCopy:'The game board will appear here.',demoFailed:'The game could not load',demoFailedCopy:'Try again, or open the full game.',demoRetry:'Try again',demoFullGame:'Open the full game'
  };
  const langButton = document.getElementById('lang');
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav');
  const dialog = document.getElementById('play-dialog');
  const frame = document.getElementById('play-frame');
  const dialogTitle = document.getElementById('dialog-title');
  const launchDialog = document.getElementById('launch-dialog');
  const launchPlatformNote = document.getElementById('launch-platform-note');
  const launchDownloads = document.getElementById('launch-download-options');
  const playStatus = document.getElementById('play-status');
  const playStatusTitle = document.getElementById('play-status-title');
  const playStatusCopy = document.getElementById('play-status-copy');
  const playRecovery = document.getElementById('play-recovery');
  let launchReturnFocus;
  let demoSession = '';
  let demoAttempt = 0;
  let demoTimeout;
  let language = 'ru';
  let returnFocus;
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next;
    document.title = next === 'ru' ? 'Yupland Heroes — исследуй мир и выбери свой путь' : 'Yupland Heroes — explore a world, choose your path';
    document.querySelectorAll('[data-i18n]').forEach(node => {
      if (!node.dataset.ru) node.dataset.ru = node.textContent;
      node.textContent = next === 'ru' ? node.dataset.ru : en[node.dataset.i18n] || node.dataset.ru;
    });
    langButton.innerHTML = next === 'ru' ? 'RU <span>/</span> EN' : 'EN <span>/</span> RU';
    langButton.setAttribute('aria-label', next === 'ru' ? 'Переключить на английский' : 'Switch language to Russian');
    menuButton.setAttribute('aria-label', next === 'ru' ? 'Открыть меню' : 'Open menu');
    document.querySelector('.raid-trigger').setAttribute('aria-label', next === 'ru' ? 'Играть в первый рейд' : 'Play the first raid');
    document.querySelector('.mini-trigger').setAttribute('aria-label', next === 'ru' ? 'Играть в «Корону гречневого королевства»' : 'Play Crown of the Buckwheat Kingdom');
    document.querySelector('.news-paper').setAttribute('aria-label', next === 'ru' ? 'Открыть газету за 31 октября 2026 года' : 'Open the newspaper from 31 October 2026');
    document.getElementById('close-launch').setAttribute('aria-label', next === 'ru' ? 'Закрыть выбор способа игры' : 'Close game options');
    document.getElementById('close-dialog').setAttribute('aria-label', next === 'ru' ? 'Закрыть демо' : 'Close demo');
    document.getElementById('launch-qr-link').setAttribute('aria-label', next === 'ru' ? 'Открыть игрового бота в Telegram' : 'Open the game bot in Telegram');
    frame.title = next === 'ru' ? 'Игровое демо Yupland Heroes' : 'Yupland Heroes game demo';
    updateLaunchRecommendation();
    updateDemoStatusText();
  }
  function detectPlatform() {
    const platform = [navigator.userAgentData?.platform, navigator.platform, navigator.userAgent].filter(Boolean).join(' ');
    if (/Android/i.test(platform)) return 'android';
    if (/iPhone|iPad|iPod/i.test(platform) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Win/i.test(platform)) return 'windows';
    if (/Mac/i.test(platform)) return 'macos';
    if (/Linux/i.test(platform)) return 'linux';
    return 'unknown';
  }
  function updateLaunchRecommendation() {
    const platform = detectPlatform();
    const desktop = ['macos','windows','linux'].includes(platform);
    const mobile = ['ios','android'].includes(platform);
    const names = {macos:'macOS',windows:'Windows',linux:'Linux',ios:'iOS',android:'Android'};
    launchPlatformNote.textContent = names[platform]
      ? (language === 'ru' ? `Твоё устройство: ${names[platform]}. Способ игры можно выбрать ниже.` : `Your device: ${names[platform]}. Choose how to play below.`)
      : (language === 'ru' ? 'Выбери удобный способ игры.' : 'Choose the way you prefer to play.');
    launchDialog.querySelectorAll('[data-launch-recommendation]').forEach(node => {
      node.hidden = !((desktop && node.dataset.launchRecommendation === 'browser') || (mobile && node.dataset.launchRecommendation === 'telegram'));
    });
    launchDownloads.querySelectorAll('[data-platform]').forEach(node => {
      node.classList.toggle('platform-match', node.dataset.platform === platform);
    });
    const preferred = launchDownloads.querySelector(`[data-platform="${platform}"]`);
    if (preferred) launchDownloads.prepend(preferred);
    document.getElementById('launch-qr').hidden = !desktop;
  }
  function openLaunch(link) {
    launchReturnFocus = nav.contains(link) && window.innerWidth <= 760 ? menuButton : link;
    nav.hidden = window.innerWidth <= 760;
    menuButton.setAttribute('aria-expanded','false');
    updateLaunchRecommendation();
    launchDialog.showModal();
    document.documentElement.classList.add('launch-open');
  }
  document.querySelectorAll('[data-launch]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openLaunch(link);
  }));
  document.getElementById('close-launch').addEventListener('click', () => launchDialog.close());
  launchDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('launch-open');
    launchReturnFocus?.focus();
  });
  launchDialog.addEventListener('click', event => {
    if (event.target !== launchDialog) return;
    const bounds = launchDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) launchDialog.close();
  });
  langButton.addEventListener('click', () => {
    const nextPage = new URL(language === 'ru' ? 'en.html' : './', window.location.href);
    nextPage.hash = window.location.hash;
    window.location.assign(nextPage.href);
  });
  menuButton.addEventListener('click', () => {
    if (document.documentElement.dataset.mobileMenuReady === 'true') return;
    nav.hidden = !nav.hidden;
    menuButton.setAttribute('aria-expanded', String(!nav.hidden));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.hidden = window.innerWidth <= 760;
    menuButton.setAttribute('aria-expanded','false');
  }));
  document.addEventListener('keydown', event => {
    if (document.documentElement.dataset.mobileMenuReady !== 'true' && event.key === 'Escape' && window.innerWidth <= 760 && !nav.hidden) { nav.hidden = true; menuButton.setAttribute('aria-expanded','false'); menuButton.focus(); }
  });
  function updateDemoStatusText() {
    const failed = dialog.dataset.state === 'error';
    playStatusTitle.textContent = language === 'ru' ? (failed ? 'Не удалось загрузить игру' : 'Загружаем приключение') : en[failed ? 'demoFailed' : 'demoLoading'];
    if (failed && dialog.dataset.mode === 'mini') {
      playStatusCopy.textContent = language === 'ru' ? 'Попробуй загрузить игру ещё раз.' : 'Try loading the game again.';
      return;
    }
    playStatusCopy.textContent = language === 'ru' ? (failed ? 'Попробуй ещё раз или открой полную игру.' : 'Сейчас здесь появится игровое поле.') : en[failed ? 'demoFailedCopy' : 'demoLoadingCopy'];
  }
  function setDemoState(state) {
    dialog.dataset.state = state;
    const ready = state === 'ready';
    frame.hidden = !ready;
    if (ready) frame.removeAttribute('inert'); else frame.setAttribute('inert','');
    playStatus.hidden = ready;
    playRecovery.hidden = state !== 'error';
    updateDemoStatusText();
  }
  function failDemo() {
    if (!dialog.open || dialog.dataset.state !== 'loading') return;
    window.clearTimeout(demoTimeout);
    demoSession = '';
    frame.removeAttribute('src');
    setDemoState('error');
  }
  function loadDemo() {
    window.clearTimeout(demoTimeout);
    demoSession = `${Date.now()}-${++demoAttempt}`;
    setDemoState('loading');
    const mode = dialog.dataset.mode;
    const params = new URLSearchParams({lang: language, session: demoSession});
    frame.src = mode === 'mini'
      ? 'demos/buckwheat/index.html?' + params
      : 'experience.html?v=20261105-light-3&embed=demo&' + params + '#demo';
    demoTimeout = window.setTimeout(failDemo, 15000);
  }
  function openDemo(mode, trigger) {
    if (mode === 'demo' && document.documentElement.dataset.raidSlotReady === 'true') return;
    returnFocus = trigger;
    dialog.dataset.mode = mode;
    dialogTitle.textContent = mode === 'mini' ? (language === 'ru' ? 'КОРОНА ГРЕЧНЕВОГО КОРОЛЕВСТВА' : 'CROWN OF THE BUCKWHEAT KINGDOM') : (language === 'ru' ? 'ПЕРВЫЙ РЕЙД' : 'FIRST RAID');
    dialog.showModal();
    loadDemo();
  }
  document.querySelectorAll('[data-play]').forEach(button => button.addEventListener('click', () => openDemo(button.dataset.play, button)));
  document.getElementById('play-retry').addEventListener('click', () => { loadDemo(); document.getElementById('close-dialog').focus(); });
  document.getElementById('play-full-game').addEventListener('click', () => {
    const origin = returnFocus;
    dialog.close();
    openLaunch(origin);
  });
  frame.addEventListener('error', failDemo);
  window.addEventListener('message', event => {
    if (!demoSession || !dialog.open || event.source !== frame.contentWindow || event.origin !== window.location.origin || event.data?.session !== demoSession) return;
    if (event.data.type === 'yupland:demo-ready' && dialog.dataset.state === 'loading') {
      window.clearTimeout(demoTimeout);
      setDemoState('ready');
    }
    if (dialog.dataset.state !== 'ready') return;
    if (event.data.type === 'yupland:demo-close' && dialog.dataset.mode === 'mini') {
      dialog.close();
    } else if (event.data.type === 'yupland:open-game' && dialog.dataset.mode !== 'mini') {
      const origin = returnFocus;
      dialog.close();
      openLaunch(origin);
    } else if (event.data.type === 'yupland:open-guide') {
      window.location.assign(new URL('guides/first-outing.html', window.location.href));
    }
  });
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { window.clearTimeout(demoTimeout); demoSession = ''; frame.removeAttribute('src'); returnFocus?.focus({preventScroll:true}); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  document.documentElement.classList.add('js');
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.08});
    reveals.forEach(node => observer.observe(node));
  } else reveals.forEach(node => node.classList.add('visible'));
  const worldSection = document.getElementById('world');
  const worldBackground = worldSection.querySelector('.world-bg');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let worldVisible = !('IntersectionObserver' in window);
  let worldFrame = 0;
  function updateWorldShift() {
    worldFrame = 0;
    if (!worldVisible || reducedMotion.matches || document.documentElement.dataset.motion === 'reduced' || document.hidden) {
      worldBackground.style.removeProperty('--world-shift');
      return;
    }
    const rect = worldSection.getBoundingClientRect();
    const mobile = window.innerWidth <= 600;
    const limit = mobile ? 24 : 60;
    const distance = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const shift = Math.max(-limit, Math.min(limit, distance * (mobile ? .07 : .14)));
    worldBackground.style.setProperty('--world-shift', `${shift.toFixed(1)}px`);
  }
  function queueWorldShift() {
    if (!worldFrame) worldFrame = window.requestAnimationFrame(updateWorldShift);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      worldVisible = entry.isIntersecting;
      queueWorldShift();
    }).observe(worldSection);
  }
  window.addEventListener('scroll', queueWorldShift, { passive: true });
  window.addEventListener('resize', queueWorldShift);
  reducedMotion.addEventListener('change', queueWorldShift);
  document.addEventListener('yupland:motion-change', queueWorldShift);
  document.addEventListener('visibilitychange', queueWorldShift);
  queueWorldShift();
  setLanguage(window.location.pathname.endsWith('/en.html') || new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ru');
  if (language === 'en' && location.hash === '#creator-vision') {
    requestAnimationFrame(() => document.getElementById('creator-vision')?.scrollIntoView({behavior:'instant'}));
  }
})();
