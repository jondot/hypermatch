const { filter, find, tail, initial } = require('lodash')
const run = require('./index')

const trap = (rule, func) => ({rule, func})
const fallback = (func) => ({ func })

const cond = (...args) => {
  const conds = filter(args, ({rule}) => rule)
  const fallback = find(args, ({rule}) => !rule)

  return obj => {
    const found = find(conds, ({rule}) => run(rule, obj)) || fallback
    if (found){
      return found.func(obj)
    }
  }
}

module.exports = {
  cond,
  trap,
  fallback,
}
