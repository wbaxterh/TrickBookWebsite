const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chooseHomepage } = require('../lib/homepageExperiment.cjs');

test('production is unchanged unless enabled; URL overrides cannot enroll visitors', () => {
  assert.equal(
    chooseHomepage({ enabled: false, requested: 'progression', bucket: 0 }).variant,
    'control',
  );
  assert.equal(
    chooseHomepage({ enabled: true, requested: 'progression', bucket: 99 }).variant,
    'control',
  );
});
test('preview compares designs without assigning a visitor', () => {
  assert.deepEqual(
    ['control', 'progression', 'invalid'].map(
      (requested) => chooseHomepage({ preview: true, requested }).variant,
    ),
    ['control', 'progression', 'progression'],
  );
  assert.equal(chooseHomepage({ preview: true }).setCookie, false);
});
test('allocation is balanced and returning visitors stay in their arm', () => {
  const results = Array.from({ length: 100 }, (_, bucket) =>
    chooseHomepage({ enabled: true, bucket }),
  );
  assert.equal(results.filter((result) => result.variant === 'progression').length, 50);
  assert.equal(
    chooseHomepage({ enabled: true, bucket: 99, cookie: 'progression' }).variant,
    'progression',
  );
  assert.equal(chooseHomepage({ enabled: true, bucket: 0, cookie: 'control' }).setCookie, false);
});
test('unsupported locales remain translated control', () => {
  assert.equal(chooseHomepage({ enabled: true, locale: 'fr', bucket: 0 }).mode, 'off');
});
test('invalid inputs are safe; rollout gates override old assignments', () => {
  assert.equal(chooseHomepage({ enabled: true, cookie: 'forged', bucket: 1 }).setCookie, true);
  assert.equal(chooseHomepage({ enabled: true, percentage: 'bad', bucket: 75 }).variant, 'control');
  assert.equal(chooseHomepage({ enabled: false, cookie: 'progression' }).variant, 'control');
});
