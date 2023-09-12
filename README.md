# iterator-matcher
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/fraxken/IteratorMatcher/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/fraxken/IteratorMatcher/commit-activity)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/nodejs/security-wg/blob/master/processes/responsible_disclosure_template.md
)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/fraxken/IteratorMatcher/blob/master/LICENSE)

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

assert.ok(result.isMatching, true);
assert.equal(result.elapsedSteps, 3);
```

> [!NOTE]
> You can re-use the same IteratorMatcher multiple time.

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
interface DefaultIteratorMatcherExecutorOptions {
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

interface DefaultUnpreservedIteratorMatcherExecutorOptions
  extends DefaultIteratorMatcherExecutorOptions {
  /**
   * Authorize unexpected value to appear
   *
   * @default false
   */
  allowUnexpectedValue?: boolean;
}

export type IteratorMatcherExecutorOptions = {
  /**
   * When enabled it preserve the order of expectation
   */
  preserveExpectationOrder?: true;
} & DefaultIteratorMatcherExecutorOptions | {
  /**
   * When disabled it will iterate all expectations and try to match them all with no order.
   */
  preserveExpectationOrder?: false;
} & DefaultUnpreservedIteratorMatcherExecutorOptions;
```

The response is described by the following TypeScript type:
```ts
export type IteratorMatcherExecutorResult = {
  isMatching: boolean;
  elapsedSteps: number;
}
```
</details>

### EventListener

The IteratorMatcher expose an additional `EventListener` helper class useful for testing purpose with Node.js EventEmitter.

Here a real world example extracted from the UT one of my package:

```ts
import assert from "node:assert";
import { test } from "node:test";

import { TimeStore } from "@openally/timestore";
import { IteratorMatcher, EventListener } from "iterator-matcher";

test("Example with TimeStore, IteratorMatcher and EventListener", () => {
  const store = new TimeStore({ ttl })
  .add("foo").add("bar");
  const eeListener = new EventListener(store, TimeStore.Expired);

  // Doing some work with store

  assert.equal(eeListener.listenerCount, 2);
  const { isMatching } = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .execute(eeListener.names(), { allowNoMatchingValues: false });
  assert.ok(isMatching, true);
});
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/fraxken/IteratorMatcher/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/fraxken/IteratorMatcher/issues?q=author%3Afraxken" title="Bug reports">🐛</a> <a href="https://github.com/fraxken/IteratorMatcher/commits?author=fraxken" title="Documentation">📖</a> <a href="#security-fraxken" title="Security">🛡️</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
