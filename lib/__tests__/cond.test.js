'use strict';

var _require = require('../cond'),
    cond = _require.cond,
    trap = _require.trap,
    fallback = _require.fallback;

test('it should work', function () {
  var match = cond(trap(['exists', 'name'], function (obj) {
    return obj.name;
  }), trap(['range', 'age', [17, 34]], function (obj) {
    return obj.age;
  }), fallback(function () {
    return 99;
  }));
  expect(match({ name: 'foobar' })).toEqual('foobar');
  expect(match({ age: 30 })).toEqual(30);
  expect(match({ age: 80 })).toEqual(99);
  expect(match({ user: 'bob' })).toEqual(99);
});