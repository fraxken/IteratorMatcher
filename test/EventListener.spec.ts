// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import { EventEmitter } from "node:events";

// Import Internal Dependencies
import { EventListener, IteratorMatcher } from "../src/IteratorMatcher.ts";

describe("EventListener", () => {
  it("should listen and count 3 listeners and register their eventName in call order", () => {
    const ee = new EventEmitter();
    const el = new EventListener(ee, ["foo", "bar"]);

    ee.emit("foo");
    ee.emit("bar");
    ee.emit("bar");
    const expectedListenerCount = 3;

    assert.equal(el.listenerCount, expectedListenerCount);
    assert.equal(el.eventNameListenerCount("foo"), 1);
    assert.equal(el.eventNameListenerCount("bar"), 2);

    const { isMatching, elapsedSteps } = new IteratorMatcher()
      .expect("foo")
      .expect("bar", { occurence: 2 })
      .execute(el.names(), { allowNoMatchingValues: false });
    assert.ok(isMatching);
    assert.equal(elapsedSteps, expectedListenerCount);
  });

  it("should listen and return listener arguments", () => {
    const ee = new EventEmitter();
    const el = new EventListener<number[]>(ee, "foo");

    ee.emit("foo", [1, 2]);
    assert.equal(el.listenerCount, 1);

    const args = [...el.arguments()];
    assert.deepEqual(el.argumentAt(0), [1, 2]);
    assert.deepEqual(args[0], [1, 2]);
  });

  it("should detect untriggered event names", () => {
    const ee = new EventEmitter();
    const el = new EventListener<number[]>(ee, ["foo", "bar", "xd"]);

    ee.emit("foo");
    assert.deepEqual(el.untriggeredNames(), ["bar", "xd"]);
  });
});
