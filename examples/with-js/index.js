const run = require('../../src')
const rules = require('./rules')

console.log('pass?', run(rules,
    {uid: 'user1'}))

