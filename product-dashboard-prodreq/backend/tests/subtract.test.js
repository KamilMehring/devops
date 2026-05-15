const test = require('node:test');
const assert = require('node:assert/strict');
const { subtract } = require('../utils/subtract');

test('subtract: odejmuje dwie dodatnie liczby', () => {
  assert.equal(subtract(10, 4), 7);
});

test('subtract: może zwrócić wynik ujemny', () => {
  assert.equal(subtract(4, 10), -6);
});

test('subtract: rzuca błąd dla niepoprawnych danych', () => {
  assert.throws(() => subtract('10', 4), {
    name: 'TypeError'
  });
});