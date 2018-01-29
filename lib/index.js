'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var map = require('lodash/map');
var reduce = require('lodash/reduce');
var find = require('lodash/find');
var head = require('lodash/head');
var tail = require('lodash/tail');
var includes = require('lodash/includes');
var isEqual = require('lodash/isEqual');
var intersection = require('lodash/intersection');
var inRange = require('lodash/inRange');
var lto = require('lodash/lt');
var gto = require('lodash/gt');
var filter = require('lodash/filter');

var and = function and(elems) {
  return reduce(elems, function (a, e) {
    return a && e;
  }, true);
};
var or = function or(elems) {
  return !!find(elems, function (_) {
    return !!_;
  });
};
var excludes = function excludes(collection, value) {
  return !includes(collection, value);
};
var equals = function equals(left, right) {
  return isEqual(left, right);
};
var not = function not(e) {
  return !e;
};
var exists = function exists(e) {
  return !!e;
};
var subset = function subset(left, right) {
  return intersection(right, left).length === right.length;
};
var intersects = function intersects(left, right) {
  return intersection(left, right).length !== 0;
};
var range = function range(left, right) {
  return inRange.apply(undefined, [right].concat((0, _toConsumableArray3.default)(left)));
};
// lodash.flip takes a lot of bytes. do it manually:
var lt = function lt(left, right) {
  return lto(right, left);
};
var gt = function gt(left, right) {
  return gto(right, left);
};

// to avoid incurring costs from compiling the same regex each time,
// when loading the AST, we need to encode/decode regexes
// http://stackoverflow.com/questions/12075927/serialization-of-regexp
var regex = function regex(left, right) {
  return !!right.match(left);
};

var all = function all(tree, collection) {
  return reduce(collection, function (result, item) {
    return result && run(tree, item);
  }, true);
};
var any = function any(tree, collection) {
  return reduce(collection, function (result, item) {
    return result || run(tree, item);
  }, false);
};
var one = function one(tree, collection) {
  return filter(collection, function (item) {
    return run(tree, item);
  }).length === 1;
};
var none = function none(tree, collection) {
  return not(any(tree, collection));
};

var mapops = ['and', 'or'];
var unaryops = ['not'];
var prelude = {
  and: and,
  or: or,
  not: not,
  excludes: excludes,
  equals: equals,
  includes: includes,
  regex: regex,
  subset: subset,
  intersects: intersects,
  range: range,
  exists: exists,
  gt: gt,
  lt: lt,
  all: all,
  any: any,
  one: one,
  none: none
};

var run = function run(tree, props) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { trace: false, log: console.log };

  if (tree == null || tree.length === 0) {
    return true;
  }

  var h = head(tree);
  var t = tail(tree);
  var op = prelude[h];
  if (!op) {
    throw new Error('\n      No such operator \'' + h + '\'\n      --\n      ["' + h + '", ' + (0, _stringify2.default)(t) + ']\n        ^----- no such operator\n      ');
  }

  if (includes(mapops, h)) {
    if (opts.trace) {
      opts.log('op[>]  ', h, t);
    }
    return op(map(t, function (_) {
      return run(_, props, opts);
    }));
  } else if (includes(unaryops, h)) {
    if (opts.trace) {
      opts.log('op[1]  ', h, t);
    }
    return op(run(head(t), props, opts));
  } else {
    var val = props[head(t)];
    if (val === undefined) {
      return false;
    }
    var args = [].concat((0, _toConsumableArray3.default)(tail(t)), [val]); // (left: treevalue, right: objectvalue)
    var res = op.apply(undefined, (0, _toConsumableArray3.default)(args));
    if (opts.trace) {
      opts.log('op[.]  ', res, h, args);
    }
    return res;
  }
};

module.exports = run;