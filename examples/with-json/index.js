const run = require('../../src')
const rules = require('./rules.json')

console.log('pass?', run(rules,
    {uid: 'user1'}))

