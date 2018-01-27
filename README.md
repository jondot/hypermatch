# Hypermatch

<img src="https://travis-ci.org/jondot/hypermatch.svg?branch=master">

A fast, sandboxed matching engine with serializable rules.


Using Hypermatch, you can define streams of traffic, audiences, or just a partition of
objects using simple logical rules. A collection of rules like "Browser is
Firefox" and "Browser is Chrome or query string matches 'mobile'" form such
audiences. Each rule definition is already a fully compatible JSON object, so
that the rules are serializable by default.


## Rules

The rules are lisp-ish. They are recursive by default, and you can mix and match
any constructs you like. The engine runs against a target object and ends
with a boolean result value.


## Logic

High level constructs, `expr` can be another high level constructs or a terminal.

* `[ and, [expr] ]`
* `[ or, [expr] ]`
* `[ not, [expr] ]`

Examples:

Verify that `age` needs to be within the range `18..25` or `email` can be `.*test-user.*`.

```javascript
['or',
  ['range',
    'age',
    [18, 25]],
  ['regex',
    'email',
    '.*test-user.*']]
```

For this rule `{ age: 84, email: 'test-user@acme.org'}` matches while `{ age: 84, email: 'bob@gmail.com'}` doesn't.

## Collections

Terminals, dealing with collections.

* `[ excludes, key, ary ]`
* `[ includes, key, ary ]`
* `[ subset, key, ary ]` - verify that the collection behind `key` is a subset of `ary` defined in the rules.
* `[ intersects, key, ary]` - verify that the collection behind `key` intersects with `ary`
* `[ range, key, [start, end] ]` - verify that the value behind `key` is between `start` and `end`.
* `[ all, key, [expr] ]` - verify that all values conform to the expression.
* `[ any, key, [expr] ]` - verify that at least one value conform to the expression.
* `[ one, key, [expr] ]` - verify that exactly one value conform to the expression.
* `[ none, key, [expr] ]` - verify that no values conform to the expression.

Examples:

Verify that the whitelist `['a']` contains the value under `name`.

```javascript
['includes',
  'name',
  ['a']],
```

For this rule `{ name: 'a' }` validates while `{ name: 'foo' }` doesn't.

Verify that all users in the collection have age in the correct range and are active.

```javascript
['all', 'users',
  ['and',
    ['range',
      'age',
      [18, 25]],
    ['exists',
      'active']]
```

```
{
  users: [
    { name: 'bob', age: 19, active: true },
    { name: 'bill', age: 24, active: true }
  ]
}
```

## Matchers

Terminals, dealing with individual values.

* `[ equals, key, val ]` - performs deep equal.
* `[ regex, key, regexp ]`
* `[ exists, key ]`

Examples:

Verify that `'.*Android.*'` matches the user agent under `ua`.

```javascript
['regex',
  'ua',
  '.*Android.*']
```

For this rule `{ ua: 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko...'}` validates while `{ ua: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1'}` doesn't.

## Bonus: cond

This library includes a minimal conditions construct that uses Hypermatch. It will go over
the rules, run them and execute the related effect for the rule that succeeds (and stop there).

Here's how to use it:

```
import { cond, trap, fallback } from 'rules/cond'

const match = cond(
  trap(['exists', 'name'], obj => obj.name),
  trap(['range', 'age', [17, 34]], obj => obj.age),
  fallback(() => 99)
)

match({age: 30})        // -> 30
match({age: 80})        // -> 99
match({user: 'bob'})    // -> 99
```
