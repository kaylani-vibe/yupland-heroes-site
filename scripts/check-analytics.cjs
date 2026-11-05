const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'site-analytics.js'), 'utf8');
class Element {
  constructor(matches = {}, options = {}) {
    this.matches = matches;
    this.dataset = options.dataset || {};
    this.id = options.id || '';
    this.classList = {contains: name => (options.classes || []).includes(name)};
  }
  closest(selector) { return this.matches[selector] || null; }
}
const captured = [];
let click;
const document = {
  documentElement: {lang: 'en', dataset: {}},
  addEventListener(name, handler) { if (name === 'click') click = handler; },
};
const context = {
  Element, document,
  location: {hostname: 'heroes.yupland.io', pathname: '/en.html'},
  window: {posthog: {capture: (...args) => captured.push(args)}},
};
vm.runInNewContext(source, context);
assert.equal(typeof click, 'function');

const section = new Element({}, {id: 'demo'});
const launch = new Element({'section[id]': section});
click({target: new Element({'[data-launch]': launch})});
assert.equal(captured.length, 0, 'opening launch options is not an outbound click');

const telegram = new Element({}, {classes: ['launch-telegram']});
click({target: new Element({'.launch-option': telegram})});
assert.deepEqual(captured[0][0], 'site_game_launch_clicked');
assert.deepEqual(JSON.parse(JSON.stringify(captured[0][1])), {
  destination: 'telegram', placement: 'demo', page: '/en.html', language: 'en',
});

const demo = new Element({'section[id]': section}, {dataset: {play: 'demo'}});
click({target: new Element({'[data-play]': demo})});
assert.deepEqual(captured[1][0], 'site_demo_started');
assert.deepEqual(JSON.parse(JSON.stringify(captured[1][1])), {
  demo_type: 'raid', placement: 'demo', page: '/en.html', language: 'en',
});

document.documentElement.dataset = {raidSlotReady: 'true'};
click({target: new Element({'[data-play]': demo})});
assert.equal(captured.length, 2, 'an inactive demo button is not a start');

let localListener = false;
vm.runInNewContext(source, {
  Element,
  document: {addEventListener() { localListener = true; }},
  location: {hostname: '127.0.0.1', pathname: '/'},
  window: {posthog: {capture() { throw new Error('local event sent'); }}},
});
assert.equal(localListener, false);

const initSource = fs.readFileSync(path.join(__dirname, '..', 'analytics-init.generated.js'), 'utf8');
let sdkSource;
const scriptTag = {parentNode: {insertBefore(node) { sdkSource = node.src; }}};
const initWindow = {};
const initContext = {
  location: {hostname: 'heroes.yupland.io'},
  window: initWindow,
  document: {
    createElement() { return {}; },
    getElementsByTagName() { return [scriptTag]; },
  },
};
vm.runInNewContext(initSource, initContext);
assert.equal(initWindow.posthog._i.length, 1);
const [token, config] = initWindow.posthog._i[0];
assert.equal(typeof token, 'string');
assert.ok(token.length > 20);
assert.equal(config.api_host, 'https://eu.i.posthog.com');
assert.equal(config.autocapture, false);
assert.equal(config.capture_pageview, true);
assert.equal(config.disable_persistence, true);
assert.equal(config.disable_session_recording, true);
assert.ok(sdkSource.startsWith('https://eu-assets.i.posthog.com/'));

const localWindow = {};
vm.runInNewContext(initSource, {
  location: {hostname: 'localhost'},
  window: localWindow,
  document: {createElement() { throw new Error('SDK loaded on localhost'); }},
});
assert.equal(localWindow.posthog, undefined);
console.log('Site analytics event checks passed');
