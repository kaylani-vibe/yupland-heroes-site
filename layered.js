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
    skip:'Skip to content',openGame:'Open the game',navHow:'How to play',navDemo:'Demo',navWorld:'World',navMini:'Excavations',navGuides:'Guides',navNews:'News',
    heroKicker:'ADVENTURE',hero1:'A WORLD',hero2:'AWAITS',hero3:'A HERO',heroDescription:'Your first raid: choose a hero, find the mine and face its guard.',playDemo:'Play the demo',
    howKicker:'HOW IT WORKS',how1:'CHOOSE A HERO.',how2:'EXPLORE THE WORLD.',howIntro:'Dangerous lands, mysterious mines and ancient secrets. Your adventure begins here.',
    step1:'CHOOSE A HERO',step1Copy:'Choose Yupik, Kaban or Drakoshka for your first raid and begin your story.',step2:'EXPLORE THE WORLD',step2Copy:'Open the map, explore new places and find your next challenge.',step3:'FIND THE MINE',step3Copy:'Enter the mine, collect a find and meet its guard on the way out.',
    guidesKicker:'FIELD GUIDE',guidesTitle1:'A GUIDE',guidesTitle2:'TO THE WORLD',guidesBlurb:'Move, collect finds and fight in your first raid. Then try excavations.',openGuides:'First steps',guideDialogTitle:'FIRST STEPS',guideDialogIntro:'Begin with a short raid: try moving, collecting finds and fighting. Then explore the world and try excavations.',tryExcavations:'Try excavations',
    demoKicker:'PLAY RIGHT HERE',demo1:'YOUR',demo2:'FIRST',demo3:'RAID',demoBlurb:'Move · Collect · Fight',startDemo:'Start the demo',
    worldKicker:'A VAST WORLD',world1:'MORE',world2:'THAN ONE',world3:'RAID',worldBlurb:'Beyond the first raid: new lands, heroes with their own stories and a castle to call home.',
    featureHero:'HEROES',featureHeroCopy:'Each has a style and story of their own.',featureWorld:'WORLD',featureWorldCopy:'Forests, valleys, caves and new places.',featureCastle:'CASTLE',featureCastleCopy:'A home and a place to begin new adventures.',
    miniKicker:'MINI-GAME',mini1:'TRY',mini2:'EXCAVATIONS',miniBlurb:'A short game right here in your browser. Help Yupik find what is hidden underground.',tryMini:'Try it',
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
  const guideDialog = document.getElementById('guide-dialog');
  const guideOpen = document.getElementById('guide-open');
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
  let guideReturnFocus;
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
    document.querySelector('.mini-trigger').setAttribute('aria-label', next === 'ru' ? 'Играть в раскопки' : 'Play excavations');
    document.querySelector('.news-paper').setAttribute('aria-label', next === 'ru' ? 'Открыть газету за 31 октября 2026 года' : 'Open the newspaper from 31 October 2026');
    document.getElementById('close-guide').setAttribute('aria-label', next === 'ru' ? 'Закрыть путеводитель' : 'Close the field guide');
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
    frame.src = 'experience.html?v=20261105-light-3&embed=' + mode + '&lang=' + language + '&session=' + encodeURIComponent(demoSession) + '#' + (mode === 'mini' ? 'minigame' : 'demo');
    demoTimeout = window.setTimeout(failDemo, 15000);
  }
  document.querySelectorAll('[data-play]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.play;
    if (mode === 'demo' && document.documentElement.dataset.raidSlotReady === 'true') return;
    returnFocus = button;
    dialog.dataset.mode = mode;
    dialogTitle.textContent = mode === 'mini' ? (language === 'ru' ? 'РАСКОПКИ' : 'EXCAVATIONS') : (language === 'ru' ? 'ПЕРВЫЙ РЕЙД' : 'FIRST RAID');
    dialog.showModal();
    loadDemo();
  }));
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
    if (event.data.type === 'yupland:open-game') {
      const origin = returnFocus;
      dialog.close();
      openLaunch(origin);
    } else if (event.data.type === 'yupland:open-guide') {
      const origin = returnFocus;
      dialog.close();
      guideReturnFocus = origin;
      guideDialog.showModal();
    }
  });
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { window.clearTimeout(demoTimeout); demoSession = ''; frame.removeAttribute('src'); returnFocus?.focus(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  guideOpen.addEventListener('click', () => { guideReturnFocus = guideOpen; guideDialog.showModal(); });
  document.getElementById('close-guide').addEventListener('click', () => guideDialog.close());
  guideDialog.addEventListener('close', () => guideReturnFocus?.focus());
  guideDialog.addEventListener('click', event => { if (event.target === guideDialog) guideDialog.close(); });
  guideDialog.querySelectorAll('[data-guide-play]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.guidePlay;
    guideDialog.close();
    document.querySelector('[data-play="' + mode + '"]').click();
  }));
  document.documentElement.classList.add('js');
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.08});
    reveals.forEach(node => observer.observe(node));
  } else reveals.forEach(node => node.classList.add('visible'));
  const pickaxe = document.querySelector('.mini-pickaxe');
  const miniSection = document.getElementById('mini');
  const worldSection = document.getElementById('world');
  const worldBackground = worldSection.querySelector('.world-bg');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const movingScenes = new Set();
  const scenesAvailable = 'IntersectionObserver' in window;
  const motionAllowed = () => !reducedMotion.matches && document.documentElement.dataset.motion !== 'reduced' && !document.hidden;
  const sceneVisible = scene => !scenesAvailable || movingScenes.has(scene);
  let pickaxeFrame = 0;
  let pickaxeProgress = null;
  let lastPickaxeFrame = 0;
  function updatePickaxe(time) {
    pickaxeFrame = 0;
    if (!motionAllowed() || (!sceneVisible(worldSection) && !sceneVisible(miniSection))) {
      pickaxe.style.removeProperty('--pickaxe-x');
      pickaxe.style.removeProperty('--pickaxe-angle');
      worldBackground.style.removeProperty('--world-shift');
      pickaxeProgress = null;
      lastPickaxeFrame = 0;
      return;
    }
    if (sceneVisible(worldSection)) {
    const worldRect = worldSection.getBoundingClientRect();
    const mobileWorld = window.innerWidth <= 600;
    const worldLimit = mobileWorld ? 24 : 60;
    const worldDistance = window.innerHeight / 2 - (worldRect.top + worldRect.height / 2);
    const worldShift = Math.max(-worldLimit, Math.min(worldLimit, worldDistance * (mobileWorld ? .07 : .14)));
    worldBackground.style.setProperty('--world-shift', `${worldShift.toFixed(1)}px`);
    } else worldBackground.style.removeProperty('--world-shift');
    if (!sceneVisible(miniSection)) {
      pickaxeProgress = null;
      lastPickaxeFrame = 0;
      return;
    }
    const section = miniSection.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (window.innerHeight - section.top) / (window.innerHeight + section.height)));
    if (pickaxeProgress === null) pickaxeProgress = progress;
    else {
      const elapsed = Math.min(64, time - (lastPickaxeFrame || time));
      pickaxeProgress += (progress - pickaxeProgress) * (1 - Math.exp(-elapsed / 105));
      if (Math.abs(progress - pickaxeProgress) < .001) pickaxeProgress = progress;
    }
    lastPickaxeFrame = time;
    const mobile = window.innerWidth <= 600;
    const travel = mobile ? 125 : Math.min(300, miniSection.clientWidth * .24);
    pickaxe.style.setProperty('--pickaxe-x', `${Math.round((mobile ? -25 : -30) + travel * pickaxeProgress)}px`);
    pickaxe.style.setProperty('--pickaxe-angle', `${(-19 + 10 * pickaxeProgress).toFixed(1)}deg`);
    if (pickaxeProgress !== progress) pickaxeFrame = window.requestAnimationFrame(updatePickaxe);
  }
  function queuePickaxe() {
    if (!motionAllowed() || (!sceneVisible(worldSection) && !sceneVisible(miniSection))) {
      if (pickaxeFrame) window.cancelAnimationFrame(pickaxeFrame);
      pickaxeFrame = 0;
      updatePickaxe(0);
      return;
    }
    if (!pickaxeFrame) pickaxeFrame = window.requestAnimationFrame(updatePickaxe);
  }
  if (scenesAvailable) {
    const sceneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? movingScenes.add(entry.target) : movingScenes.delete(entry.target));
      queuePickaxe();
    });
    sceneObserver.observe(worldSection);
    sceneObserver.observe(miniSection);
  }
  window.addEventListener('scroll', queuePickaxe, { passive: true });
  window.addEventListener('resize', queuePickaxe);
  reducedMotion.addEventListener('change', queuePickaxe);
  document.addEventListener('yupland:motion-change', queuePickaxe);
  document.addEventListener('visibilitychange', queuePickaxe);
  queuePickaxe();
  setLanguage(window.location.pathname.endsWith('/en.html') || new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ru');
  if (language === 'en' && location.hash === '#creator-vision') {
    requestAnimationFrame(() => document.getElementById('creator-vision')?.scrollIntoView({behavior:'instant'}));
  }
})();
