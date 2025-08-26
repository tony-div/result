import { Result } from "./result";

export type Err<E extends NonNullable<unknown>> = Result<never, E>;

/**
 * 
 * @param err the {@link Err} value to be wrapped in a {@link Result}
 * @returns an {@link Err} which inherits {@link Result}
 */
export function Err<E extends NonNullable<unknown>>(err: E) {
  class ErrFactory extends Result<never, E>{
    constructor(err: E) {
      super(undefined, err);
    }
  }
  return new ErrFactory(err) as Err<E>;
}
