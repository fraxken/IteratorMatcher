// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { IteratorMatcher } from "../src/IteratorMatcher.js";

describe("IteratorMatcher (expect OrderUnpreserved)", () => {
  it("should match the two expected values returned by the iterator", () => {
    function* dummyGen() {
      yield "bar";
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .execute(dummyGen(), { preserveExpectationOrder: false });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 2
    });
  });

  it("should match the two expected values returned by the iterator while accepting an unexpected value", () => {
    function* dummyGen() {
      yield "bar";
      yield 5;
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .execute(dummyGen(), {
        preserveExpectationOrder: false,
        allowUnexpectedValue: true
      });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 3
    });
  });

  it("should not match because the unexpected value has not been unabled", () => {
    function* dummyGen() {
      yield "bar";
      yield 5;
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .execute(dummyGen(), {
        preserveExpectationOrder: false,
        allowUnexpectedValue: false
      });

    assert.deepEqual(result, {
      isMatching: false,
      elapsedSteps: 2
    });
  });

  it(`should match on the third 'foo' iterable value even if other values are not expected
  because allowUnexpectedValue option is enabled`, () => {
    function* dummyGen() {
      yield 10;
      yield 5;
      yield "foo";
      yield 2;
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .execute(dummyGen(), {
        stopOnFirstMatch: true,
        preserveExpectationOrder: false,
        allowUnexpectedValue: true
      });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 3
    });
  });

  it("should not match because allowUnexpectedValue is disabled so stopOnFirstMatch will have no effects", () => {
    function* dummyGen() {
      yield 10;
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .execute(dummyGen(), {
        stopOnFirstMatch: true,
        preserveExpectationOrder: false
      });

    assert.deepEqual(result, {
      isMatching: false,
      elapsedSteps: 1
    });
  });

  it("should match on the first iterated value because stopOnFirstMatch is enabled", () => {
    function* dummyGen() {
      yield "foo";
      yield 2;
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .execute(dummyGen(), {
        stopOnFirstMatch: true,
        preserveExpectationOrder: false
      });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 1
    });
  });

  it("should match multiple occurence of the same expectation", () => {
    function* dummyGen() {
      yield "foo";
      yield "bar";
      yield "foo";
      yield "bar";
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("foo", { occurence: 3 })
      .expect("bar", { occurence: 2 })
      .execute(dummyGen(), { preserveExpectationOrder: false });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 5
    });
  });

  it("should not match any value because expected value is not mandatory and allowUnexpectedValue is disabled", () => {
    function* dummyGen() {
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("bar", { mandatory: false })
      .execute(dummyGen(), {
        preserveExpectationOrder: false,
        allowUnexpectedValue: false
      });

    assert.deepEqual(result, {
      isMatching: false,
      elapsedSteps: 1
    });
  });

  it("should match because even there is no value matching the expectation because allowUnexpectedValue is enabled", () => {
    function* dummyGen() {
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("bar", { mandatory: false })
      .execute(dummyGen(), {
        preserveExpectationOrder: false,
        allowUnexpectedValue: true
      });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 1
    });
  });

  it("should not match because mandatory value are missing", () => {
    function* dummyGen() {
      yield "xd";
    }

    const result = new IteratorMatcher()
      .expect("xd", { mandatory: true, occurence: 2 })
      .expect("bar", { mandatory: false })
      .execute(dummyGen(), {
        preserveExpectationOrder: false
      });

    assert.deepEqual(result, {
      isMatching: false,
      elapsedSteps: 1
    });
  });

  it("should match because mandatory are matched (even if non-mandatory value is missing)", () => {
    function* dummyGen() {
      yield "xd";
      yield "xd";
    }

    const result = new IteratorMatcher()
      .expect("xd", { mandatory: true, occurence: 2 })
      .expect("bar", { mandatory: false })
      .execute(dummyGen(), {
        preserveExpectationOrder: false
      });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 2
    });
  });

  it("should match because mandatory and non-mandatory are matched", () => {
    function* dummyGen() {
      yield "xd";
      yield "bar";
      yield "xd";
    }

    const result = new IteratorMatcher()
      .expect("xd", { mandatory: true, occurence: 2 })
      .expect("bar", { mandatory: false })
      .execute(dummyGen(), {
        preserveExpectationOrder: false
      });

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 3
    });
  });
});
