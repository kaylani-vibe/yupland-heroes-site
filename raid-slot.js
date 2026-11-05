(() => {
  const slot = document.getElementById('raid-slot');
  let frame = document.getElementById('raid-frame');
  const status = document.getElementById('raid-slot-status');
  const title = document.getElementById('raid-slot-title');
  const retry = document.getElementById('raid-slot-retry');
  const exit = document.getElementById('raid-slot-exit');
  const preview = document.querySelector('.raid-trigger');
  if (!slot || !frame) return;
  let ready = false, pending = false, timer = 0, started = false, visible = false;
  let originButton = null;
  const origin = location.origin;
  const english = () => document.documentElement.lang === 'en';
  function text() {
    title.textContent = slot.dataset.state === 'error' ? (english() ? 'Could not load the raid' : 'Не удалось загрузить рейд') : (english() ? 'Loading the raid…' : 'Загружаем рейд…');
    retry.textContent = english() ? 'Try again' : 'Повторить';
    exit.textContent = english() ? 'Close demo' : 'Закрыть демо';
    frame.title = english() ? 'Yupland Heroes — first raid' : 'Yupland Heroes — первый рейд';
    send('language', {lang:english() ? 'en' : 'ru'});
  }
  function send(type, extra = {}) {
    if (ready) frame.contentWindow.postMessage({source:'yupland-heroes-host',version:1,type,...extra},origin);
  }
  function fail() {
    clearTimeout(timer); timer = 0; ready = false;
    frame.removeAttribute('src'); frame.hidden = true;
    slot.dataset.state = 'error'; status.hidden = false; retry.hidden = false;
    slot.setAttribute('aria-busy','false'); text();
  }
  function load() {
    clearTimeout(timer); ready = false;
    delete slot.dataset.complete;
    // Each attempt gets a new browsing context, so a stale ready cannot start a retry.
    const replacement = frame.cloneNode(false);
    frame.replaceWith(replacement);
    frame = replacement;
    frame.addEventListener('error', fail);
    slot.dataset.state = 'loading'; slot.setAttribute('aria-busy','true');
    status.hidden = false; retry.hidden = true; frame.hidden = true;
    frame.src = 'demos/raid-package/raid/index.html?v=20261105-light-3&embed=1&close=host&lang=' + (english() ? 'en' : 'ru');
    timer = setTimeout(fail,60000); text();
  }
  function start(button) {
    originButton = button; pending = true;
    preview.hidden = true; slot.hidden = false;
    if (!ready) load(); else { pending = false; send('start'); frame.focus(); }
    slot.scrollIntoView({behavior:document.documentElement.dataset.motion === 'reduced' ? 'instant' : 'smooth',block:'center'});
  }
  function close(focus = true) {
    send('pause'); clearTimeout(timer); timer = 0; ready = pending = started = false;
    frame.removeAttribute('src'); frame.hidden = true; slot.hidden = true; preview.hidden = false;
    if (focus) originButton?.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-play="demo"]').forEach(button => button.addEventListener('click', () => start(button)));
  retry.addEventListener('click', () => { pending = true; load(); exit.focus(); });
  exit.addEventListener('click', () => close());
  frame.addEventListener('error', fail);
  window.addEventListener('message', event => {
    const data = event.data;
    if (slot.hidden || !frame.getAttribute('src') || event.source !== frame.contentWindow || event.origin !== origin || data?.source !== 'yupland-heroes-demos' || data.version !== 1 || data.game !== 'raid') return;
    if (data.type === 'ready') {
      clearTimeout(timer); timer = 0; ready = true;
      slot.dataset.state = 'ready'; slot.setAttribute('aria-busy','false'); status.hidden = true; frame.hidden = false;
      send('language',{lang:english() ? 'en' : 'ru'});
      if (pending) { pending = false; send('start'); frame.focus(); }
      send('motion',{reduced:document.documentElement.dataset.motion === 'reduced'});
    } else if (data.type === 'error') fail();
    else if (data.type === 'start') { started = true; pause(); }
    else if (data.type === 'complete') slot.dataset.complete = 'true';
    else if (data.type === 'close') { send('pause'); exit.focus({preventScroll:true}); }
    else if (data.type === 'open-game') {
      close(false);
      document.querySelector('#demo [data-launch]').click();
    }
  });
  function pause() { if (started && (document.hidden || !visible)) send('pause'); }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; pause(); },{threshold:0}).observe(slot);
  document.addEventListener('visibilitychange',pause);
  document.addEventListener('yupland:motion-change', () => send('motion',{reduced:document.documentElement.dataset.motion === 'reduced'}));
  new MutationObserver(text).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.documentElement.dataset.raidSlotReady = 'true';
  text();
})();
