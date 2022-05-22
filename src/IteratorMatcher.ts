export type IteratorMatcherExpected<T> = {
  predicate: (currentIteratedValue: T) => boolean;
} & Required<IteratorMatcherExpectOptions>;

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

export type IteratorMatcherExecutorResult = {
  isMatching: boolean;
  elapsedSteps: number;
}

export class IteratorMatcher<T> {
  #expectedValues: IteratorMatcherExpected<T>[] = [];

  #createExpectArrayValue(expectedValue: T | T[] | Set<T>, options: Required<IteratorMatcherExpectOptions>) {
    if (Array.isArray(expectedValue)) {
      return { ...options, predicate: (value: T) => expectedValue.includes(value) };
    }
    if (expectedValue instanceof Set) {
      return { ...options, predicate: (value: T) => expectedValue.has(value) };
    }

    return { ...options, predicate: (value: T) => expectedValue === value };
  }

  expect(
    expectedValue: T | T[] | Set<T>,
    options: IteratorMatcherExpectOptions = Object.create(null)
  ) {
    const { mandatory = true, occurence = 1 } = options;

    this.#expectedValues.push(
      this.#createExpectArrayValue(expectedValue, { mandatory, occurence })
    );

    return this;
  }

  execute(
    iterator: IterableIterator<T>,
    options: IteratorMatcherExecutorOptions = Object.create(null)
  ): IteratorMatcherExecutorResult {
    if (this.#expectedValues.length === 0) {
      throw new Error("Unable to execute with no expected values");
    }
    const { stopOnFirstMatch = false, allowNoMatchingValues = true } = options;

    let index = 0;
    let elapsedSteps = 0;
    let currentOccurenceCount = 1;
    let matchingValue = 0;
    for (const currentIteratedValue of iterator) {
      const expectation = this.#expectedValues[index];
      if (currentOccurenceCount <= 1) {
        currentOccurenceCount = expectation.occurence;
      }

      const valueSatisfiesExpectation = expectation.predicate(currentIteratedValue);
      if (currentOccurenceCount === 1) {
        index++;
      }
      else {
        currentOccurenceCount--;
      }
      elapsedSteps++;

      if (!valueSatisfiesExpectation && expectation.mandatory) {
        return { isMatching: false, elapsedSteps };
      }
      if (stopOnFirstMatch && valueSatisfiesExpectation) {
        return { isMatching: true, elapsedSteps };
      }
      if (valueSatisfiesExpectation) {
        matchingValue++;
      }

      if (this.#expectedValues.length === index) {
        break;
      }
    }

    return {
      isMatching: allowNoMatchingValues ? true : matchingValue > 0,
      elapsedSteps
    };
  }
}
