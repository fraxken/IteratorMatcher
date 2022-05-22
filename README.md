# iterator-matcher
Easily found out if an ES6 Iterator match what you expected

## Limitations
- No built-in mechanism to match on non-primitive values.


## Requirements
- [Node.js](https://nodejs.org/en/) v16 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i iterator-matcher
# or
$ yarn add iterator-matcher
```

## Usage example
```js
import { IteratorMatcher } from "iterator-matcher";
import assert from "node:assert";

function* dummyGen() {
  yield "console";
  yield "trace";
  yield "error";
}

const result = new IteratorMatcher()
  .expect("console")
  .expect(["trace", "error"], { occurence: 2 })
  .execute(dummyGen());

assert.strictEqual(result.isMatching, true);
assert.strictEqual(result.elapsedSteps, 3);
```

> Note: you can re-use the same IteratorMatcher multiple time.

## API

<details><summary>constructor()</summary>

No options are required.
</details>

<details><summary>expect(expectedValue: T | T[] | Set< T >, options: IteratorMatcherExpectOptions): this</summary>

The options payload is described by the following TypeScript interface:
```ts
export interface IteratorMatcherExpectOptions {
  /**
   * When a value is not mandatory the Executor continue his job/execution.
   *
   * @default true
   */
  mandatory?: boolean;
  /**
   * Number of occurences of the expected value
   *
   * @default 1
   */
  occurence?: number;
}
```

In usage the expectedValue can be an Array or a ES6 Set.
```js
new IteratorMatcher()
  .expect("primitive", { mandatory: false })
  .expect([1, 2, 3])
  .expect(new Set(["oh", "hey", "oh"]), { occurence: 2 });
```
</details>

<details><summary>execute(iterator: IterableIterator< T >, options: IteratorMatcherExecutorOptions): IteratorMatcherExecutorResult</summary>

The options payload is described by the following TypeScript interface:
```ts
export interface IteratorMatcherExecutorOptions {
  /**
   * Stop the executor on the first matching value.
   *
   * @default false
   */
  stopOnFirstMatch?: boolean;

  /**
   * When enabled it return isMatching: true if no value has been matched (like an empty Iterator for example).
   *
   * @default true
   */
  allowNoMatchingValues?: boolean;
}
```

The response is described by the following TypeScript type:
```ts
export type IteratorMatcherExecutorResult = {
  isMatching: boolean;
  elapsedSteps: number;
}
```
</details>

## Roadmap

- Add `preserveExpectationOrder` option to execute method.
- Add `minOccurence` to expect method.

## License
MIT
