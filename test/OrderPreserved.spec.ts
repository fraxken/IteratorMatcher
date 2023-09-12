// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { IteratorMatcher } from "../dist/IteratorMatcher.js";

describe("IteratorMatcher (expect OrderPreserved)", () => {
  it("should match the two expected values returned by the iterator", () => {
    function* dummyGen() {
      yield "foo";
      yield "bar";
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .execute(dummyGen());

    assert.deepEqual(result, {
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

    assert.deepEqual(result, {
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

    assert.deepEqual(result, {
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

    assert.deepEqual(result, {
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

    assert.deepEqual(result, {
      isMatching: false,
      elapsedSteps: 1
    });
  });

  it("should match with an empty Iterable and allowNoMatchingValues enabled", () => {
    const result = new IteratorMatcher()
      .expect("foo")
      .execute([]);

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 0
    });
  });

  it("should not match with an empty Iterable and allowNoMatchingValues disabled", () => {
    const result = new IteratorMatcher()
      .expect("foo")
      .execute([], { allowNoMatchingValues: false });

    assert.deepEqual(result, {
      isMatching: false,
      elapsedSteps: 0
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

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 1
    });
  });
});
