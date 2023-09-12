// Import Node.js Dependencies
import { EventEmitter } from "node:events";

export type EventListenerKey = string | symbol;

export class EventListener<T> {
  #originalEventNames: Set<EventListenerKey> = new Set();
  #numberOfListenerTriggered = 0;
  #orderedEventNames: EventListenerKey[] = [];
  #arguments: T[] = [];

  constructor(ee: EventEmitter, events: EventListenerKey | EventListenerKey[]) {
    this.#originalEventNames = new Set(
      Array.isArray(events) ? events : [events]
    );

    for (const event of this.#originalEventNames) {
      ee.on(event, (args) => {
        this.#numberOfListenerTriggered++;
        this.#orderedEventNames.push(event);
        this.#arguments.push(args);
      });
    }
  }

  get listenerCount(): number {
    return this.#numberOfListenerTriggered;
  }

  eventNameListenerCount(eventName: string): number {
    let count = 0;
    for (const orderedEventName of this.#orderedEventNames) {
      if (orderedEventName === eventName) {
        count++;
      }
    }

    return count;
  }

  * names(): IterableIterator<EventListenerKey> {
    yield* this.#orderedEventNames;
  }

  untriggeredNames(): EventListenerKey[] {
    const matchedEventNames = new Set(this.names());

    return Array.from(this.#originalEventNames)
      .filter((eventName) => !matchedEventNames.has(eventName));
  }

  * arguments(): IterableIterator<T> {
    for (const arg of this.#arguments) {
      yield arg;
    }
  }

  argumentAt(position: number): T {
    return this.#arguments[position];
  }
}
