'use strict';

const map = require('lodash/map');
const reduce = require('lodash/reduce');
const find = require('lodash/find');
const head = require('lodash/head');
const tail = require('lodash/tail');
const includes = require('lodash/includes');
const isEqual = require('lodash/isEqual');
const intersection = require('lodash/intersection');
const inRange = require('lodash/inRange');
const lto = require('lodash/lt');
const gto = require('lodash/gt');
const filter = require('lodash/filter');

const and = elems => reduce(elems, (a, e) => a && e, true);
const or = elems => !!find(elems, _ => !!_);
const excludes = (collection, value) => !includes(collection, value);
const equals = (left, right) => isEqual(left, right);
const not = e => !e;
const exists = e => !!e;
const subset = (left, right) => intersection(right, left).length === right.length;
const intersects = (left, right) => intersection(left, right).length !== 0;
const range = (left, right) => inRange(right, ...left);
// lodash.flip takes a lot of bytes. do it manually:
const lt = (left, right) => lto(right, left);
const gt = (left, right) => gto(right, left);

// to avoid incurring costs from compiling the same regex each time,
// when loading the AST, we need to encode/decode regexes
// http://stackoverflow.com/questions/12075927/serialization-of-regexp
const regex = (left, right) => !!right.match(left);

const all = (tree, collection) => reduce(collection, (result, item) => result && run(tree, item), true);
const any = (tree, collection) => reduce(collection, (result, item) => result || run(tree, item), false);
const one = (tree, collection) => filter(collection, item => run(tree, item)).length === 1;
const none = (tree, collection) => not(any(tree, collection));

const mapops = ['and', 'or'];
const unaryops = ['not'];
const prelude = {
  and,
  or,
  not,
  excludes,
  equals,
  includes,
  regex,
  subset,
  intersects,
  range,
  exists,
  gt,
  lt,
  all,
  any,
  one,
  none
};

const run = (tree, props, opts = { trace: false, log: console.log }) => {
  if (tree == null || tree.length === 0) {
    return true;
  }

  const h = head(tree);
  const t = tail(tree);
  const op = prelude[h];
  if (!op) {
    throw new Error(`
      No such operator '${h}'
      --
      ["${h}", ${JSON.stringify(t)}]
        ^----- no such operator
      `);
  }

  if (includes(mapops, h)) {
    if (opts.trace) {
      opts.log('op[>]  ', h, t);
    }
    return op(map(t, _ => run(_, props, opts)));
  } else if (includes(unaryops, h)) {
    if (opts.trace) {
      opts.log('op[1]  ', h, t);
    }
    return op(run(head(t), props, opts));
  } else {
    const val = props[head(t)];
    if (val === undefined) {
      return false;
    }
    const args = [...tail(t), val]; // (left: treevalue, right: objectvalue)
    const res = op(...args);
    if (opts.trace) {
      opts.log('op[.]  ', res, h, args);
    }
    return res;
  }
};

module.exports = run;