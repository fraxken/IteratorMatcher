// Import Internal Dependencies
import { IteratorMatcherExpected } from "./IteratorMatcher.js";

export class UnorderedExpectedValues<T> {
  private expectedValues: IteratorMatcherExpected<T>[] = [];
  private expectedOccurence = 0;
  public matchingValue = 0;

  constructor(expectedValues: IteratorMatcherExpected<T>[]) {
    // This step is required to clone each row of the array.
    // We do not need any library cause there is no deep objects (to date at least).
    for (const expectation of expectedValues) {
      if (expectation.mandatory) {
        this.expectedOccurence += expectation.occurence;
      }
      this.expectedValues.push({ ...expectation });
    }
  }

  hasRemainingMandatoryValues() {
    return this.expectedValues.some(
      (expectation) => expectation.mandatory === true
    );
  }

  isMatching() {
    return this.matchingValue >= this.expectedOccurence;
  }

  satisfies(currentIteratedValue: T): boolean {
    for (let index = 0; index < this.expectedValues.length; index++) {
      const expectation = this.expectedValues[index];
      const valueSatisfiesExpectation = expectation.predicate(currentIteratedValue);

      if (valueSatisfiesExpectation) {
        this.matchingValue++;

        if (--expectation.occurence === 0) {
          this.expectedValues.splice(index, 1);
        }

        return true;
      }
    }

    return false;
  }
}
