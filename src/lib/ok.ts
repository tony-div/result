import { Result } from "./result";

export type Ok<T extends NonNullable<unknown>> = Result<T, never>;

/**
 * 
 * @param val the {@link Ok} value to be wrapped in a {@link Result}
 * @returns an {@link Ok} which inherits {@link Result}
 */
export function Ok<T extends NonNullable<unknown>>(val: T): Ok<T> {
	return new OkFactory(val)
}


	class OkFactory<T extends NonNullable<unknown>> extends Result<T, never> {
		constructor(val: T) {
			super(val)
		}
	}