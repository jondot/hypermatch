const run = require('../')

const t = [
  'or',
  ['or', ['includes', 'name', ['a']], ['equals', 'browser', 'firefox']],
  ['includes', 'uid', ['user1']]
]

const t1 = [
  'and',
  ['includes', 'name', ['a']],
  ['equals', 'browser', 'firefox']
]

const bad = [
  'and',
  ['incluuudes', 'name', ['a']],
  ['equals', 'browser', 'firefox']
]

const t3 = ['not', ['equals', 'browser', 'firefox']]

const r1 = ['and', ['equals', 'uid', '1'], ['regex', 'name', /moo.*/]]

class Tracer {
  constructor() {
    this.actions = []
    this.log = this.log.bind(this)
  }
  log(...args) {
    this.actions.push(args)
  }
}

const testRun = (res, tree, props) => {
  test(`${JSON.stringify(tree)} ${res ? '✓' : '✕'} ${JSON.stringify(
    props
  )}`, () => {
    const tracer = new Tracer()
    expect(run(tree, props, { trace: true, log: tracer.log })).toEqual(res)
    expect(tracer.actions).toMatchSnapshot()
  })
}

test('handles bad syntax', () =>
  expect(() => {
    run(bad, { name: 'a' })
  }).toThrow())

testRun(false, t1, { uid: 'doesnt', name: 'match' })
testRun(true, t1, { name: 'a', browser: 'firefox' })
testRun(false, t1, { name: 'a', browser: 'nope!' })

testRun(true, t, { uid: 'user1', name: 'b', browser: 'android' })

testRun(true, t3, { browser: 'android' })
testRun(false, t3, { browser: 'firefox' })

testRun(true, ['equals', 'name', 'foobar'], { name: 'foobar' })
testRun(false, ['equals', 'name', 'foobar'], { name: 'foo' })

testRun(true, ['includes', 'name', ['m1', 'm2']], { name: 'm2' })
testRun(false, ['includes', 'name', ['m1', 'm2']], { name: 'm3' })

testRun(false, t, { name: 'bad', browser: 'foobar', uid: 'poop' })

// regex
testRun(true, ['regex', 'name', 'moo.*'], { name: 'moomoo moo!', uid: '1' })
testRun(true, r1, { name: 'moomoo moo!', uid: '1' })
testRun(false, r1, { name: 'poop', uid: '1' })

// subset
testRun(true, ['subset', 'orderIds', ['O-1', 'O-2', 'O-3', 'O-4']], {
  orderIds: ['O-1', 'O-2', 'O-3']
})
testRun(false, ['subset', 'orderIds', ['O-1', 'O-2', 'O-3']], {
  orderIds: ['O-2', 'O-3', 'O-4']
})
testRun(true, ['subset', 'orderIds', ['O-1', 'O-2', 'O-3']], { orderIds: [] })
testRun(true, ['subset', 'orderIds', []], { orderIds: [] })

// intersects
testRun(true, ['intersects', 'professions', ['barista', 'baker', 'bartender', 'waiter']], {
  professions: ['chef', 'baker', 'bartender']
})
testRun(false, ['intersects', 'professions', ['baker', 'barista']], { 'professions': ['waiter'] })
testRun(true, ['intersects', 'professions', ['barista']], { professions: ['barista'] })

// range
testRun(true, ['range', 'age', [18, 40]], { age: 23 })
testRun(false, ['range', 'age', [18, 40]], { age: 66 })

// exists
testRun(true, ['exists', 'age'], { age: 23 })
testRun(false, ['exists', 'age'], { foobar: 23 })

// lt, gt
testRun(false, ['lt', 'age', 12], { age: 23 })
testRun(true, ['gt', 'age', 12], { age: 23 })
testRun(true, ['lt', 'age', 40], { age: 23 })
testRun(false, ['gt', 'age', 40], { age: 23 })
