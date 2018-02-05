'use strict';

var _require = require('../cond');

const cond = _require.cond,
      trap = _require.trap,
      fallback = _require.fallback;


test('it should work', () => {
  const match = cond(trap(['exists', 'name'], obj => obj.name), trap(['range', 'age', [17, 34]], obj => obj.age), fallback(() => 99));
  expect(match({ name: 'foobar' })).toEqual('foobar');
  expect(match({ age: 30 })).toEqual(30);
  expect(match({ age: 80 })).toEqual(99);
  expect(match({ user: 'bob' })).toEqual(99);
});