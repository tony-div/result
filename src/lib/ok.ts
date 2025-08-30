import { Result } from "./result";

export type Ok<T extends NonNullable<unknown>> = Result<T, never>;

/**
 * Create a successful Result containing the provided non-null value.
 *
 * The returned value is an Ok<T> (i.e., Result<T, never>) representing success with no error variant.
 *
 * @param val - The non-null value to wrap as an Ok result
 * @returns The Ok result containing `val`
 */
export function Ok<T extends NonNullable<unknown>>(val: T): Ok<T> {
	return new OkFactory(val)
}


	class OkFactory<T extends NonNullable<unknown>> extends Result<T, never> {
		constructor(val: T) {
			super(val)
		}
	}