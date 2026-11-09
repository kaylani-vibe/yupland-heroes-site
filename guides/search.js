(() => {
  const form = document.querySelector('#guide-search');
  const query = form.elements.q;
  const catalog = document.querySelector('#guide-catalog');
  const results = document.querySelector('#guide-results');
  const status = document.querySelector('#guide-search-status');
  const guides = JSON.parse(document.querySelector('#guide-search-data').textContent);

  const words = text => (text.toLowerCase().replaceAll('ё', 'е').match(/[а-яa-z0-9]+/g) || []);
  const stem = word => word.length > 4 ? word.replace(/[аеёиоуыэюяь]+$/, '') : word;
  const matches = (term, word) => word.startsWith(term) || word.startsWith(stem(term));
  const score = (terms, vocabulary) => terms.filter(term => vocabulary.some(word => matches(term, word))).length;

  for (const guide of guides) {
    guide.titleWords = words(guide.title);
    for (const section of guide.sections) section.words = words(section.heading + ' ' + section.text);
    guide.words = guide.sections.flatMap(section => section.words).concat(guide.titleWords);
  }

  function search() {
    const value = query.value.trim();
    const terms = [...new Set(words(value))];
    const url = new URL(location.href);
    if (value) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    if (url.href !== location.href) history.replaceState(null, '', url);
    catalog.hidden = terms.length > 0;
    results.hidden = !terms.length;
    results.replaceChildren();
    status.textContent = 'Например, дуб, энергия или карта.';
    if (!terms.length) return;

    const found = guides.filter(guide => score(terms, guide.words) === terms.length).map(guide => {
      const titleMatches = score(terms, guide.titleWords);
      const section = guide.sections.reduce((best, next) => (
        score(terms, next.words) > score(terms, best.words) ? next : best
      ));
      return { guide, titleMatches, section };
    });
    found.sort((a, b) => b.titleMatches - a.titleMatches);
    status.textContent = found.length ? 'Найдено: ' + found.length : 'Ничего не найдено. Попробуй другое слово.';

    for (const {guide, titleMatches, section} of found) {
      const entry = document.createElement('li');
      const link = document.createElement('a');
      const text = document.createElement('span');
      const arrow = document.createElement('span');
      const goToStep = titleMatches < terms.length && section.id;
      link.href = guide.url + (goToStep ? '#' + section.id : '');
      text.textContent = guide.title;
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden', 'true');
      const excerpt = section.text.split('\n').sort((a, b) => score(terms, words(b)) - score(terms, words(a)))[0];
      if (excerpt) {
        const note = document.createElement('span');
        note.className = 'library-result-note';
        const preview = excerpt.length > 150 ? excerpt.slice(0, 147).trimEnd() + '…' : excerpt;
        note.textContent = (goToStep ? section.heading + ' · ' : '') + preview;
        text.append(note);
      }
      link.append(text, arrow);
      entry.append(link);
      results.append(entry);
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    search();
    results.querySelector('a')?.focus();
  });
  query.addEventListener('input', search);
  query.value = new URLSearchParams(location.search).get('q')?.slice(0, query.maxLength) || '';
  form.hidden = false;
  search();
})();
