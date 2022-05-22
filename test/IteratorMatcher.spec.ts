// Import Third-party Dependencies
import { expect } from "chai";

// Import Internal Dependencies
import { IteratorMatcher } from "../src/IteratorMatcher.js";

describe("IteratorMatcher", () => {
  it("should throw an Error if no expected values has been added to the IteratorMatcher instance", () => {
    function* dummyGen() {
      yield "foo";
    }

    expect(() => new IteratorMatcher().execute(dummyGen()))
      .to.throw("Unable to execute with no expected values");
  });

  it("should match the two expected values returned by the iterator", () => {
    function* dummyGen() {
      yield "foo";
      yield "bar";
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .execute(dummyGen());

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 2
    });
  });

  it("should stop at the third expectation because it doesn't match", () => {
    function* dummyGen() {
      yield "foo";
      yield "bar";
      yield 10;
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .expect(5)
      .execute(dummyGen());

    expect(result).to.deep.equal({
      isMatching: false,
      elapsedSteps: 3
    });
  });

  it("should match multiple occurence of the same expectation", () => {
    function* dummyGen() {
      yield "foo";
      yield "foo";
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("foo", { occurence: 3 })
      .execute(dummyGen());

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 3
    });
  });

  it("should not match any value because expected value is not mandatory but still return isMatching true", () => {
    function* dummyGen() {
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("bar", { mandatory: false })
      .execute(dummyGen());

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 1
    });
  });

  it(`should not match any value because expected value is not mandatory
  but return isMatching false because we don't allow no matching values`, () => {
    function* dummyGen() {
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("bar", { mandatory: false })
      .execute(dummyGen(), { allowNoMatchingValues: false });

    expect(result).to.deep.equal({
      isMatching: false,
      elapsedSteps: 1
    });
  });

  it("should match the first expected value and break even if the second expectation doesn't match", () => {
    function* dummyGen() {
      yield "foo";
      yield 2;
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect(10)
      .execute(dummyGen(), { stopOnFirstMatch: true });

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 1
    });
  });

  it("should accept an Array of values as expectation", () => {
    function* dummyGen() {
      yield "trace";
      yield "error";
    }

    const result = new IteratorMatcher()
      .expect(["trace", "error"], { occurence: 2 })
      .execute(dummyGen());

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 2
    });
  });

  it("should accept an ES6 Set of values as expectation", () => {
    function* dummyGen() {
      yield "trace";
      yield "error";
    }

    const result = new IteratorMatcher()
      .expect(new Set(["trace", "error"]), { occurence: 2 })
      .execute(dummyGen());

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 2
    });
  });
});
