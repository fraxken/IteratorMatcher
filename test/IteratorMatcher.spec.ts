// Import Third-party Dependencies
import { expect } from "chai";

// Import Internal Dependencies
import { IteratorMatcher } from "../dist/IteratorMatcher.js";

describe("IteratorMatcher (general tests)", () => {
  it("should throw an Error if no expected values has been added to the IteratorMatcher instance", () => {
    function* dummyGen() {
      yield "foo";
    }

    expect(() => new IteratorMatcher().execute(dummyGen()))
      .to.throw("Unable to execute with no expected values");
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

describe("IteratorMatcher execution (expectation order preserved)", () => {
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

  it("should match with an empty Iterable and allowNoMatchingValues enabled", () => {
    const result = new IteratorMatcher()
      .expect("foo")
      .execute([]);

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 0
    });
  });

  it("should not match with an empty Iterable and allowNoMatchingValues disabled", () => {
    const result = new IteratorMatcher()
      .expect("foo")
      .execute([], { allowNoMatchingValues: false });

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 1
    });
  });
});

describe("IteratorMatcher execution (expectation order unpreserved)", () => {
  it("should match the two expected values returned by the iterator", () => {
    function* dummyGen() {
      yield "bar";
      yield "foo";
    }

    const result = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .execute(dummyGen(), { preserveExpectationOrder: false });

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
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

    expect(result).to.deep.equal({
      isMatching: true,
      elapsedSteps: 3
    });
  });
});
