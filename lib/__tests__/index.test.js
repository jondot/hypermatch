'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var run = require('../');

var t = ['or', ['or', ['includes', 'name', ['a']], ['equals', 'browser', 'firefox']], ['includes', 'uid', ['user1']]];

var t1 = ['and', ['includes', 'name', ['a']], ['equals', 'browser', 'firefox']];

var bad = ['and', ['incluuudes', 'name', ['a']], ['equals', 'browser', 'firefox']];

var t3 = ['not', ['equals', 'browser', 'firefox']];

var r1 = ['and', ['equals', 'uid', '1'], ['regex', 'name', /moo.*/]];

var Tracer = function () {
  function Tracer() {
    (0, _classCallCheck3.default)(this, Tracer);

    this.actions = [];
    this.log = this.log.bind(this);
  }

  (0, _createClass3.default)(Tracer, [{
    key: 'log',
    value: function log() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.actions.push(args);
    }
  }]);
  return Tracer;
}();

var testRun = function testRun(res, tree, props) {
  test((0, _stringify2.default)(tree) + ' ' + (res ? '✓' : '✕') + ' ' + (0, _stringify2.default)(props), function () {
    var tracer = new Tracer();
    expect(run(tree, props, { trace: true, log: tracer.log })).toEqual(res);
    expect(tracer.actions).toMatchSnapshot();
  });
};

test('handles bad syntax', function () {
  return expect(function () {
    run(bad, { name: 'a' });
  }).toThrow();
});

testRun(false, t1, { uid: 'doesnt', name: 'match' });
testRun(true, t1, { name: 'a', browser: 'firefox' });
testRun(false, t1, { name: 'a', browser: 'nope!' });

testRun(true, t, { uid: 'user1', name: 'b', browser: 'android' });

testRun(true, t3, { browser: 'android' });
testRun(false, t3, { browser: 'firefox' });

testRun(true, ['equals', 'name', 'foobar'], { name: 'foobar' });
testRun(false, ['equals', 'name', 'foobar'], { name: 'foo' });

testRun(true, ['includes', 'name', ['m1', 'm2']], { name: 'm2' });
testRun(false, ['includes', 'name', ['m1', 'm2']], { name: 'm3' });

testRun(false, t, { name: 'bad', browser: 'foobar', uid: 'poop' });

// regex
testRun(true, ['regex', 'name', 'moo.*'], { name: 'moomoo moo!', uid: '1' });
testRun(true, r1, { name: 'moomoo moo!', uid: '1' });
testRun(false, r1, { name: 'poop', uid: '1' });

// subset
testRun(true, ['subset', 'orderIds', ['O-1', 'O-2', 'O-3', 'O-4']], {
  orderIds: ['O-1', 'O-2', 'O-3']
});
testRun(false, ['subset', 'orderIds', ['O-1', 'O-2', 'O-3']], {
  orderIds: ['O-2', 'O-3', 'O-4']
});
testRun(true, ['subset', 'orderIds', ['O-1', 'O-2', 'O-3']], { orderIds: [] });
testRun(true, ['subset', 'orderIds', []], { orderIds: [] });

// intersects
testRun(true, ['intersects', 'professions', ['barista', 'baker', 'bartender', 'waiter']], {
  professions: ['chef', 'baker', 'bartender']
});
testRun(false, ['intersects', 'professions', ['baker', 'barista']], { 'professions': ['waiter'] });
testRun(true, ['intersects', 'professions', ['barista']], { professions: ['barista'] });

// range
testRun(true, ['range', 'age', [18, 40]], { age: 23 });
testRun(false, ['range', 'age', [18, 40]], { age: 66 });

// exists
testRun(true, ['exists', 'age'], { age: 23 });
testRun(false, ['exists', 'age'], { foobar: 23 });

// lt, gt
testRun(false, ['lt', 'age', 12], { age: 23 });
testRun(true, ['gt', 'age', 12], { age: 23 });
testRun(true, ['lt', 'age', 40], { age: 23 });
testRun(false, ['gt', 'age', 40], { age: 23 });

// all
testRun(true, ['all', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'john', 'age': 36, 'active': true }, { 'user': 'johnathan', 'age': 40, 'active': true }, { 'user': 'johny', 'age': 21, 'active': true }]
});
testRun(false, ['all', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'john', 'age': 36, 'active': true }, { 'user': 'johnathan', 'age': 40, 'active': false }, { 'user': 'johny', 'age': 21, 'active': true }]
});

// any
testRun(true, ['any', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'john', 'age': 36, 'active': false }, { 'user': 'johnathan', 'age': 40, 'active': false }, { 'user': 'johny', 'age': 21, 'active': true }]
});
testRun(false, ['any', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'john', 'age': 36, 'active': false }, { 'user': 'johnathan', 'age': 40, 'active': false }, { 'user': 'johny', 'age': 21, 'active': false }]
});

// one
testRun(true, ['one', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'john', 'age': 36, 'active': false }, { 'user': 'johnathan', 'age': 40, 'active': false }, { 'user': 'johny', 'age': 21, 'active': true }]
});
testRun(false, ['one', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'john', 'age': 36, 'active': true }, { 'user': 'johnathan', 'age': 40, 'active': false }, { 'user': 'johny', 'age': 21, 'active': true }]
});

// none
testRun(true, ['none', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'bob', 'age': 36, 'active': false }, { 'user': 'bill', 'age': 40, 'active': false }, { 'user': 'max', 'age': 21, 'active': true }]
});
testRun(false, ['none', 'users', ['and', ['regex', 'user', '^john'], ['exists', 'active']]], {
  users: [{ 'user': 'bob', 'age': 36, 'active': false }, { 'user': 'johnathan', 'age': 40, 'active': true }, { 'user': 'max', 'age': 21, 'active': true }]
});