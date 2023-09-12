// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { IteratorMatcher } from "../dist/IteratorMatcher.js";

describe("IteratorMatcher", () => {
  it("should throw an Error if no expected values has been added to the IteratorMatcher instance", () => {
    function* dummyGen() {
      yield "foo";
    }

    assert.throws(
      () => new IteratorMatcher().execute(dummyGen()),
      {
        name: "Error",
        message: "Unable to execute with no expected values"
      }
    );
  });

  it("should accept an Array of values as expectation", () => {
    function* dummyGen() {
      yield "trace";
      yield "error";
    }

    const result = new IteratorMatcher()
      .expect(["trace", "error"], { occurence: 2 })
      .execute(dummyGen());

    assert.deepEqual(result, {
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

    assert.deepEqual(result, {
      isMatching: true,
      elapsedSteps: 2
    });
  });
});
