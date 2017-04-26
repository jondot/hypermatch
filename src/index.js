const {map, reduce, find, head, tail, includes, isEqual, intersection, inRange} = require('lodash')

const and = elems => reduce(elems, (a, e) => a && e, true)
const or = elems => !!find(elems, _ => !!_)
const excludes = (collection, value) => !includes(collection, value)
const equals = (left, right) => isEqual(left, right)
const not = e => !e
const exists = e => !!e
const subset = (left, right) => intersection(right, left).length === right.length
const range = (left, right) => inRange(right, ...left)

// to avoid incurring costs from compiling the same regex each time,
// when loading the AST, we need to encode/decode regexes
// http://stackoverflow.com/questions/12075927/serialization-of-regexp
const regex = (left, right) => !!right.match(left)

const mapops = ['and', 'or']
const unaryops = ['not']
const prelude = {
  and,
  or,
  not,
  excludes,
  equals,
  includes,
  regex,
  subset,
  range,
  exists,
}

const run = (tree, props, opts = {trace: false, log: console.log}) => {
  if (tree == null || tree.length == 0){
    return true
  }

  const h = head(tree)
  const t = tail(tree)
  const op = prelude[h]
  if (!op){
    throw new Error(`
      No such operator '${h}'
      --
      ["${h}", ${JSON.stringify(t)}]
        ^----- no such operator
      `)
  }

  if (includes(mapops, h)){
    if (opts.trace){ opts.log('op[>]  ', h, t) }
    return op(map(t, _ => run(_, props, opts)))
  } else if (includes(unaryops, h)){
    if (opts.trace){ opts.log('op[1]  ', h, t) }
    return op(run(head(t), props, opts))
  } else {
    const val = props[head(t)]
    if (val === undefined){
      return false
    }
    const args = [...tail(t), val] // (left: treevalue, right: objectvalue)
    const res = op(...args)
    if (opts.trace){ opts.log('op[.]  ', res, h, args) }
    return res
  }
}

module.exports = run
