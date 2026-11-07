/* The existing map gains two accessible points; no gameplay state is changed. */
(() => {
  const map = document.querySelector('.map-explorer');
  const copy = document.getElementById('map-detail');
  if (!map || !copy) return;
  const image = map.querySelector('img');
  const unavailable = map.querySelector('.map-unavailable');
  const points = [...map.querySelectorAll('[data-map-place]')];
  let selected = null;
  const content = {
    ru: {
      intro: 'Открывай новые земли, рыбачь, ищи клады и прячь свои.',
      label: 'Карта Юпленда',
      forest: ['Леса', 'Исследуй зелёные долины и леса Юпленда.'],
      castle: ['Замок', 'Твой дом и отправная точка для новых приключений.']
    },
    en: {
      intro: 'Discover new lands, go fishing, hunt for treasure, and hide your own.',
      label: 'Map of Yupland',
      forest: ['Forests', 'Explore Yupland’s green valleys and forests.'],
      castle: ['Castle', 'Your home and starting point for new adventures.']
    }
  };
  const render = () => {
    const text = content[document.documentElement.lang === 'en' ? 'en' : 'ru'];
    map.setAttribute('aria-label', text.label);
    points.forEach(button => {
      const key = button.dataset.mapPlace;
      button.setAttribute('aria-label', text[key][0]);
      button.setAttribute('aria-pressed', String(selected === key));
    });
    copy.replaceChildren();
    if (selected) {
      const title = document.createElement('strong');
      title.textContent = text[selected][0] + '. ';
      copy.append(title, document.createTextNode(text[selected][1]));
    } else copy.textContent = text.intro;
  };
  points.forEach(button => button.addEventListener('click', () => {
    selected = selected === button.dataset.mapPlace ? null : button.dataset.mapPlace;
    render();
  }));
  map.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !selected) return;
    selected = null;
    render();
    event.stopPropagation();
  });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
  const updateAvailability = () => {
    map.classList.toggle('map-ready', image.dataset.mediaState === 'ready');
    unavailable.hidden = image.dataset.mediaState !== 'failed';
  };
  image.addEventListener('yupland:media-state', updateAvailability);
  updateAvailability();
})();
