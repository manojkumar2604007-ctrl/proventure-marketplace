import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK = "true";
(process.env as any).NODE_ENV = "test";

export { describe, it, before, after, beforeEach, afterEach, assert };

export function expect(actual: any) {
  return {
    toBe: (expected: any) => assert.strictEqual(actual, expected),
    not: {
      toBe: (expected: any) => assert.notStrictEqual(actual, expected),
    },
    toEqual: (expected: any) => assert.deepStrictEqual(actual, expected),
    toBeDefined: () => assert.notStrictEqual(actual, undefined),
    toBeNull: () => assert.strictEqual(actual, null),
    toBeFalsy: () => assert.ok(!actual),
    toBeTruthy: () => assert.ok(actual),
    toBeGreaterThan: (expected: number) => assert.ok(actual > expected, `Expected ${actual} > ${expected}`),
    toBeGreaterThanOrEqual: (expected: number) => assert.ok(actual >= expected, `Expected ${actual} >= ${expected}`),
    toBeLessThan: (expected: number) => assert.ok(actual < expected, `Expected ${actual} < ${expected}`),
    toBeLessThanOrEqual: (expected: number) => assert.ok(actual <= expected, `Expected ${actual} <= ${expected}`),
    toBeCloseTo: (expected: number, precision: number = 2) => {
      const diff = Math.abs(actual - expected);
      assert.ok(diff < 0.05, `Expected ${actual} close to ${expected}`);
    },
    toBeInstanceOf: (cls: any) => assert.ok(actual instanceof cls, `Expected instance of ${cls}`),
    toContain: (sub: string) => assert.ok(String(actual).toLowerCase().includes(sub.toLowerCase()), `Expected "${actual}" to contain "${sub}"`),
    toHaveLength: (len: number) => assert.strictEqual(actual.length, len),
    toThrow: (expected?: string | RegExp) => {
      if (expected) {
        assert.throws(actual, new RegExp(expected));
      } else {
        assert.throws(actual);
      }
    },
    rejects: {
      toThrow: async (expected?: string | RegExp) => {
        if (expected) {
          await assert.rejects(actual, new RegExp(expected));
        } else {
          await assert.rejects(actual);
        }
      },
    },
  };
}
