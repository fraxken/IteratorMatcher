// Import Internal Dependencies
import { UnorderedExpectedValues } from "./UnorderedExpectedValues.js";

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

interface DefaultUnpreservedIteratorMatcherExecutorOptions extends DefaultIteratorMatcherExecutorOptions {
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

  #executeWithoutPreservedOrder(
    iterator: Iterable<T>,
    options: Required<DefaultUnpreservedIteratorMatcherExecutorOptions>
  ): IteratorMatcherExecutorResult {
    let elapsedSteps = 0;
    const expectedValues = new UnorderedExpectedValues<T>(this.#expectedValues);

    for (const currentIteratedValue of iterator) {
      const valueSatisfiesExpectation = expectedValues.satisfies(currentIteratedValue);

      elapsedSteps++;
      if (valueSatisfiesExpectation && options.stopOnFirstMatch) {
        return { isMatching: true, elapsedSteps };
      }
      if (!valueSatisfiesExpectation && !options.allowUnexpectedValue) {
        return { isMatching: false, elapsedSteps };
      }
    }
    const hasNoMatchingValues = options.allowNoMatchingValues && expectedValues.matchingValue === 0;

    if (!hasNoMatchingValues && expectedValues.hasRemainingMandatoryValues()) {
      return { isMatching: false, elapsedSteps };
    }

    return {
      isMatching: hasNoMatchingValues ? true : expectedValues.isMatching(),
      elapsedSteps
    };
  }

  #executeWithPreservedOrder(
    iterator: Iterable<T>,
    options: Required<DefaultIteratorMatcherExecutorOptions>
  ): IteratorMatcherExecutorResult {
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

      if (valueSatisfiesExpectation && options.stopOnFirstMatch) {
        return { isMatching: true, elapsedSteps };
      }
      if (!valueSatisfiesExpectation && expectation.mandatory) {
        return { isMatching: false, elapsedSteps };
      }
      if (valueSatisfiesExpectation) {
        matchingValue++;
      }

      if (this.#expectedValues.length === index) {
        break;
      }
    }

    return {
      isMatching: options.allowNoMatchingValues && matchingValue === 0 ? true : matchingValue > 0,
      elapsedSteps
    };
  }

  execute(
    iterator: Iterable<T>,
    options: IteratorMatcherExecutorOptions = Object.create(null)
  ): IteratorMatcherExecutorResult {
    if (this.#expectedValues.length === 0) {
      throw new Error("Unable to execute with no expected values");
    }
    const {
      stopOnFirstMatch = false,
      allowNoMatchingValues = true
    } = options;

    if (options?.preserveExpectationOrder ?? true) {
      return this.#executeWithPreservedOrder(iterator, {
        stopOnFirstMatch,
        allowNoMatchingValues
      });
    }

    return this.#executeWithoutPreservedOrder(iterator, {
      stopOnFirstMatch,
      allowNoMatchingValues,
      allowUnexpectedValue: (options as DefaultUnpreservedIteratorMatcherExecutorOptions)?.allowUnexpectedValue ?? false
    });
  }
}
