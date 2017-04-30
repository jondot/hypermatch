'use strict';

var Benchmark = require('benchmark');
var run = require('../');

var t = ['or', ['or', ['includes', 'name', ['a']], ['equals', 'browser', 'firefox']], ['includes', 'uid', ['user1']]];

var suite = new Benchmark.Suite();
suite.add('no relevant fields', function () {
  run(t, { some: 1, other: 2, object: 3 });
}).add('first match', function () {
  run(t, { name: 'a' });
}).add('last match', function () {
  run(t, { name: 'a', browser: 'foobar', uid: 'user1' });
}).add('no match', function () {
  run(t, { name: 'a', browser: 'foobar', uid: 'poop' });
}).on('cycle', function (event) {
  console.log('- ' + String(event.target));
}).on('complete', function () {
  console.log('Fastest is [' + this.filter('fastest').map('name') + ']');
}).run({ async: false });