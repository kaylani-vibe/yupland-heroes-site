/* The existing map gains two accessible points; no gameplay state is changed. */
(() => {
  const map = document.querySelector('.map-explorer');
  const copy = document.getElementById('map-detail');
  if (!map || !copy) return;
  const points = [...map.querySelectorAll('[data-map-place]')];
  let selected = null;
  const content = {
    ru: {
      intro: 'Открывай карту, исследуй новые места и ищи дорогу к следующему испытанию.',
      hint: 'Выбери отметку на карте', shortHint: 'Выбери отметку',
      forest: ['Леса', 'Исследуй зелёные долины и леса Юпленда.'],
      castle: ['Замок', 'Твой дом и отправная точка для новых приключений.']
    },
    en: {
      intro: 'Open the map, explore new places and find your next challenge.',
      hint: 'Choose a point on the map', shortHint: 'Choose a point',
      forest: ['Forests', 'Explore Yupland’s green valleys and forests.'],
      castle: ['Castle', 'Your home and starting point for new adventures.']
    }
  };
  const render = () => {
    const text = content[document.documentElement.lang === 'en' ? 'en' : 'ru'];
    map.setAttribute('aria-label', text.hint);
    map.querySelector('.map-hint').textContent = text.shortHint;
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
  map.classList.add('map-ready');
})();
