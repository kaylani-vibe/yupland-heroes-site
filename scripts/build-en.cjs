const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'layered.js'), 'utf8');
const marker = 'const en = ';
const start = script.indexOf(marker);
const end = script.indexOf('\n  };', start);
if (start < 0 || end < 0) throw new Error('English copy object not found');
const dictionary = vm.runInNewContext(`(${script.slice(start + marker.length, end + 4)})`);

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const missing = new Set();
let translated = 0;
html = html.replace(/(<[a-z][^>]*\bdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/[^>]+>)/gi, (full, open, key, _copy, close) => {
  if (!(key in dictionary)) { missing.add(key); return full; }
  translated++;
  return open + escapeHtml(dictionary[key]) + close;
});
if (missing.size) throw new Error(`Missing English copy: ${[...missing].join(', ')}`);
const total = (html.match(/data-i18n="/g) || []).length;
if (translated !== total) throw new Error(`Translated ${translated} of ${total} labels; inspect nested data-i18n markup`);

html = html.replace('<html lang="ru">', '<html lang="en">');
html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Yupland Heroes is a fantasy world where you choose your own path. Explore, build, trade and fight. Try the demo and start playing.">');
html = html.replace(/<title>[^<]*<\/title>/, '<title>Yupland Heroes — explore a world, choose your path</title>');
html = html.replace('<link rel="canonical" href="https://heroes.yupland.io/">', '<link rel="canonical" href="https://heroes.yupland.io/en.html">');
html = html.replace(/<link rel="alternate" hreflang="x-default" href="https:\/\/heroes\.yupland\.io\/">/, '<link rel="alternate" hreflang="x-default" href="https://heroes.yupland.io/">');

// Static labels without data-i18n are used in dialogs and accessible names.
const literals = new Map([
  ['aria-label="Yupland Heroes — наверх"', 'aria-label="Yupland Heroes — back to top"'],
  ['aria-label="Разделы сайта"', 'aria-label="Site sections"'],
  ['aria-label="Открыть меню"', 'aria-label="Open menu"'],
  ['aria-label="Играть в первый рейд"', 'aria-label="Play the first raid"'],
  ['aria-label="Играть в раскопки"', 'aria-label="Play excavations"'],
  ['aria-label="Открыть газету за 31 октября 2026 года"', 'aria-label="Open the newspaper from 31 October 2026"'],
  ['aria-label="Закрыть путеводитель"', 'aria-label="Close the field guide"'],
  ['aria-label="Закрыть выбор способа игры"', 'aria-label="Close game options"'],
  ['aria-label="Закрыть демо"', 'aria-label="Close demo"'],
  ['aria-label="Открыть игрового бота в Telegram"', 'aria-label="Open the game bot in Telegram"'],
  ['aria-label="Меньше движения"', 'aria-label="Reduce motion"'],
  ['aria-label="Карта Юпленда"', 'aria-label="Map of Yupland"'],
  ['aria-label="Леса"', 'aria-label="Forests"'],
  ['aria-label="Замок"', 'aria-label="Castle"'],
  ['aria-label="Рубрики и архив газеты"', 'aria-label="Newspaper sections and archive"'],
  ['aria-label="Закрыть меню"', 'aria-label="Close menu"'],
  ['alt="Рыцарь со светящимся мечом готовится к реваншу со скелетом на лесной поляне; рядом сундук с находкой"', 'alt="A knight with a glowing sword faces a skeleton in a forest clearing beside a treasure chest"'],
  ['alt="Юпик в шахте выбирает место для раскопок"', 'alt="Yupik chooses where to dig in a mine"'],
  ['alt="Газета «Вестник героев», выпуск за 31 октября 2026 года, две страницы рядом"', 'alt="The Heroes Gazette from 31 October 2026, two pages side by side"'],
  ['title="Yupland Heroes — первый рейд"', 'title="Yupland Heroes — first raid"'],
  ['title="Игровое демо Yupland Heroes"', 'title="Yupland Heroes game demo"'],
  ['<span>Играть</span>', '<span>Play</span>'],
  ['>Меньше движения<', '>Reduce motion<'],
  ['>Закрыть демо<', '>Close demo<'],
  ['>Загружаем рейд…<', '>Loading the raid…<'],
  ['>Повторить<', '>Retry<'],
  ['>ОТКРОЙ ЮПЛЕНД<', '>EXPLORE YUPLAND<'],
  ['>ПЕРВЫЙ РЕЙД<', '>FIRST RAID<'],
  ['>Загружаем приключение<', '>Loading your adventure<'],
  ['>Сейчас здесь появится игровое поле.<', '>The game board will appear here.<'],
  ['>Выбери удобный способ игры.<', '>Choose how you want to play.<'],
]);
for (const [from, to] of literals) html = html.replaceAll(from, to);
if (/[А-Яа-яЁё]/.test(html)) throw new Error('Cyrillic copy remains in en.html; update the English translation');

const output = path.join(root, 'en.html');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== html) {
    console.error('en.html is out of date; run scripts/build-en.cjs');
    process.exitCode = 1;
  } else {
    console.log('en.html is current');
  }
} else {
  fs.writeFileSync(output, html);
  console.log('Generated en.html');
}
