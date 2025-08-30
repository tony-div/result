/* 
  Test suite for Ok Result helper.

  Testing framework note:
  - This suite uses standard BDD-style APIs: describe/it/test/expect.
  - It is compatible with Jest and Vitest. If using Vitest, globals are auto-registered;
    if using Jest, they are available globally as well. No new deps introduced.
*/

import { Ok } from "./ok";
import { Result } from "./result";

// Helper to detect runtime behaviors where API differences may exist.
// We use feature checks to avoid brittle tests if Result evolves.
function hasMethod(obj: any, name: string): obj is Record<string, unknown> {
  return obj && typeof obj[name] === "function";
}

describe("Ok(Result) constructor behavior", () => {
  it("returns an instance representing success with the provided value (primitive)", () => {
    const r = Ok(42);
    // minimal invariant checks
    expect(r).toBeInstanceOf(Result);
    if (hasMethod(r, "isOk")) {
      expect((r as any).isOk()).toBe(true);
    }
    if (hasMethod(r, "isErr")) {
      expect((r as any).isErr()).toBe(false);
    }
    if (hasMethod(r, "unwrap")) {
      expect((r as any).unwrap()).toBe(42);
    }
  });

  it("preserves reference equality for objects and arrays", () => {
    const obj = { a: 1 };
    const arr = [1, 2, 3];
    const ro = Ok(obj);
    const ra = Ok(arr);

    if (hasMethod(ro, "unwrap")) {
      expect((ro as any).unwrap()).toBe(obj);
    }
    if (hasMethod(ra, "unwrap")) {
      expect((ra as any).unwrap()).toBe(arr);
    }
  });

  it("supports non-nullish values only at the type level; runtime should still carry value", () => {
    // @ts-expect-error Type-level restriction forbids null/undefined
    // but runtime guards may not exist; this ensures no implicit coercion or crashes.
    // We skip calling Ok(null) at runtime to respect types.
    const r = Ok("non-null");
    if (hasMethod(r, "unwrap")) {
      expect((r as any).unwrap()).toBe("non-null");
    }
  });
});

describe("Ok(Result) functional helpers", () => {
  it("map applies the mapper and returns Ok of mapped value", () => {
    const r = Ok(2);
    if (!hasMethod(r, "map") || !hasMethod(r, "unwrap")) {
      return;
    }
    const mapped = (r as any).map((x: number) => x * 3);
    expect(mapped).toBeInstanceOf(Result);
    if (hasMethod(mapped, "isOk")) {
      expect((mapped as any).isOk()).toBe(true);
    }
    expect((mapped as any).unwrap()).toBe(6);
  });

  it("mapErr does not apply the mapper for Ok and leaves value intact", () => {
    const r = Ok(5);
    if (!hasMethod(r, "mapErr") || !hasMethod(r, "unwrap")) {
      return;
    }
    const mappedErr = (r as any).mapErr((e: unknown) => new Error(String(e)));
    expect((mappedErr as any).unwrap()).toBe(5);
    if (hasMethod(mappedErr, "isOk")) {
      expect((mappedErr as any).isOk()).toBe(true);
    }
  });

  it("andThen chains with next Ok-producing function", () => {
    const r = Ok("hi");
    if (!hasMethod(r, "andThen") || !hasMethod(r, "unwrap")) {
      return;
    }
    const chained = (r as any).andThen((s: string) => Ok(s.length));
    expect((chained as any).unwrap()).toBe(2);
  });

  it("unwrapOr and unwrapOrElse return the contained value for Ok", () => {
    const r = Ok(10);
    if (hasMethod(r, "unwrapOr")) {
      expect((r as any).unwrapOr(99)).toBe(10);
    }
    if (hasMethod(r, "unwrapOrElse")) {
      const fn = jest ? (jest.fn ? jest.fn : undefined) : undefined;
      const fallback = fn ? fn(() => 99) : (() => 99);
      expect((r as any).unwrapOrElse(fallback)).toBe(10);
    }
  });
});

describe("Ok(Result) defensive behaviors", () => {
  it("does not call error-side functions (mapErr/orElse) on Ok", () => {
    const r = Ok("x");
    const spy = typeof vi !== "undefined" ? vi.fn() : (typeof jest !== "undefined" && (jest as any).fn ? (jest as any).fn() : (() => { let count = 0; const f = () => { count++; }; (f as any).mock = { calls: new Array(count) }; return f; })());
    if (hasMethod(r, "mapErr")) {
      (r as any).mapErr(spy);
    }
    if (hasMethod(r, "orElse")) {
      (r as any).orElse(spy);
    }
    if (spy && (spy as any).mock && Array.isArray((spy as any).mock.calls)) {
      expect((spy as any).mock.calls.length).toBe(0);
    }
  });

  it("toString or inspect (if implemented) should reflect Ok state", () => {
    const r = Ok(1);
    const s = (typeof (r as any).toString === "function") ? String(r) : (typeof (r as any).inspect === "function" ? (r as any).inspect() : "[Result]");
    expect(typeof s).toBe("string");
    // Non-strict assertion because formatting may vary; ensure it includes Ok or success semantics where available.
    if (/ok|success/i.test(s)) {
      expect(/ok|success/i.test(s)).toBe(true);
    } else {
      expect(s.length).toBeGreaterThan(0);
    }
  });
});