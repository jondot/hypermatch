'use strict';

var filter = require('lodash/filter');
var find = require('lodash/find');
var run = require('./index');

var trap = function trap(rule, func) {
  return { rule: rule, func: func };
};
var fallback = function fallback(func) {
  return { func: func };
};

var cond = function cond() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var conds = filter(args, function (_ref) {
    var rule = _ref.rule;
    return rule;
  });
  var fallback = find(args, function (_ref2) {
    var rule = _ref2.rule;
    return !rule;
  });

  return function (obj) {
    var found = find(conds, function (_ref3) {
      var rule = _ref3.rule;
      return run(rule, obj);
    }) || fallback;
    if (found) {
      return found.func(obj);
    }
  };
};

module.exports = {
  cond: cond,
  trap: trap,
  fallback: fallback
};