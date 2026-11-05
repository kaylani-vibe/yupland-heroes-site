const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
}
const token = process.env.POSTHOG_PROJECT_TOKEN || env.POSTHOG_PROJECT_TOKEN;
const host = process.env.POSTHOG_HOST || env.POSTHOG_HOST;
if (!token || !host) throw new Error('POSTHOG_PROJECT_TOKEN and POSTHOG_HOST are required');
if (!/^https:\/\/[^/]+$/.test(host)) throw new Error('POSTHOG_HOST must be an HTTPS origin');

const template = fs.readFileSync(path.join(__dirname, 'analytics-init.template.js'), 'utf8');
const output = template
  .replace('__POSTHOG_PROJECT_TOKEN__', JSON.stringify(token))
  .replace('__POSTHOG_HOST__', JSON.stringify(host));
const file = path.join(root, 'analytics-init.generated.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== output) {
    console.error('analytics-init.generated.js is out of date; run scripts/build-analytics.cjs');
    process.exitCode = 1;
  } else {
    console.log('analytics-init.generated.js is current');
  }
} else {
  fs.writeFileSync(file, output);
  console.log('Generated analytics-init.generated.js');
}
