const test = require('node:test');
const assert = require('node:assert/strict');
const { multiply } = require('../utils/multiply');

test('multiply: mnoży dwie liczby dodatnie', () => {
  assert.equal(multiply(3, 4), 12);
});

test('multiply: mnoży przez zero', () => {
  assert.equal(multiply(5, 0), 0);
});

test('multiply: rzuca błąd dla niepoprawnych danych', () => {
  assert.throws(() => multiply('3', 4), {
    name: 'TypeError'
  });
});