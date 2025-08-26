import { Err } from "./err";
import { Panic } from "./errors/panic";
import { Ok } from "./ok";


export class Result<T, E> {
  #val: T | null = null;
  #err: E | null = null;
  #consumed = false;

  /** 
   * @protected you shouldn't call this in your code. use {@link Ok} or {@link Err} instead
   */
  protected constructor(val?: T, err?: E) {
    if(val) 
      this.#val = val;
    if(err)
      this.#err = err;
  }

  /**
   * 
   * @param okArm a function to consume the {@link Ok} value
   * @param errArm a function to consume the {@link Err} value
   * @returns the return of okArm if it was {@link Ok} or the return of errArm
   */
  match<U, F>(okArm?: (okVal: NonNullable<T>) => U, errArm?: (errVal: NonNullable<E>) => F): U | F | void {
    if(okArm != undefined && this.#val) {
      return okArm(this.#val);
    }
    if(errArm)
      return errArm(this.#err!);
  }

  /**
   * @throws panics if an error occurred, or the result was already consumed
   * @returns value wrapped in {@link Ok}
   */
  unwrap(): NonNullable<T> {
    return this.expect('');
  }

  /**
   * @throws panics if the result was already consumed
   * @returns if no error occurred
   */
  isOk(): boolean {
    this.#checkConsumed();
    return this.#err !== null;
  }

  /**
   * @throws panics if the result was already consumed
   * @param fn a pure function to be applied once on the {@link Ok} value
   * @returns false if {@link Result} was an {@link Err} without executing the provided function or true if {@link Result} was {@link Ok} and the provided function returns true when applied to the {@link Ok} value 
   */
  isOkAnd(fn: (okVal: Readonly<NonNullable<T>>) => boolean): boolean {
    this.#checkConsumed();
    return this.#val != null && fn(this.#val);
  }

  /**
   * @throws panics if the result was already consumed
   * @returns if error occurred
   */
  isErr(): boolean {
    this.#checkConsumed();
    return this.#err == null;
  }

  /**
   * @throws panics if the result was already consumed
   * @param fn a pure function to be applied once on the {@link Err} value
   * @returns false if {@link Result} was an {@link Ok} without executing the provided function or true if {@link Result} was {@link Err} and the provided function returns true when applied to the {@link Err} value 
   */
  isErrAnd(fn: (errValue: Readonly<NonNullable<E>>) => boolean): boolean {
    this.#checkConsumed();
    return this.#err != null && fn(this.#err);
  }

  /**
   * beware it consumes the result
   * @throws panics with custom message, or if the result was already consumed.
   * @returns contained {@link Ok}.
   */
  expect(msg: string): NonNullable<T> {
    this.#checkConsumed();
    this.#consumed = true;
    if(this.#val != null) 
      return this.#val;
    throw new Panic(msg);
  }

  /**
   * transform the {@link Ok} value without consumption
   * @throws panics if the result was already consumed
   * @param fn function to be applied on the contained {@link Ok} value
   * @returns the {@link Result} after applying the provided function to the contained {@link Ok}, leaving the {@link Err} untouched
   */
  map<U>(fn: (okVal: NonNullable<T>) => NonNullable<U>): Result<U, E> {
    this.#checkConsumed();
    if(this.#val != null) {
      return Ok(fn(this.#val))
    }
    return this as unknown as Result<U, E>;
  }

  /**
   * transforms the {@link Ok} value or returns the defaultVal if {@link Err} without consumption
   * @param defaultVal value to return if {@link Result} was {@link Err}
   * @param fn function to be applied on the contained {@link Ok} value
   * @throws panics if the result was already consumed
   * @returns mapped {@link Ok} value or the default value
   */
  mapOr<U>(defaultVal: U, fn: (okVal: NonNullable<T>) => U): U {
    this.#checkConsumed()
    return this.isErr()? defaultVal: fn(this.#val as NonNullable<T>);
  }

  /**
   * transform the {@link Err} value without consumption
   * @param fn function to be applied on the contained {@link Err} value
   * @throws panics if the result was already consumed
   * @returns the {@link Result} after applying the provided function to the contained {@link Err}, leaving the {@link Ok} untouched
   */
  mapErr<F>(fn: (errValue: NonNullable<E>) => NonNullable<F>): Result<T, F> {
    this.#checkConsumed();
    if(this.#err != null) {
      return Err(fn(this.#err))
    }
    return this as unknown as Result<T, F>;
  }

  /**
   * run some code on the {@link Ok} value (if no {@link Err}) without consuming or transforming the result.
   * @param fn a pure function to be applied to the contained {@link Ok}
   * @throws panics if the result was already consumed
   * @returns the original result
   */
  inspect<F>(fn: (okVal: Readonly<NonNullable<T>>) => F): Result<T, E> {
    this.#checkConsumed();
    if(this.#val != null) {
      fn(this.#val);
    }
    return this;
  }

  /**
   * run some code on the {@link Err} value (if no {@link Ok}) without consuming or transforming the result.
   * @param fn a pure function to be applied to the contained {@link Err}
   * @throws panics if the result was already consumed
   * @returns the original result
   */
  inspectErr<F>(fn: (errVal: Readonly<NonNullable<E>>) => F): Result<T, E> {
    this.#checkConsumed();
    if(this.#err != null)
      fn(this.#err);
    return this;
  }

  /**
   * beware it consumes the result
   * @throws panics if the result was already consumed.
   * @returns contained {@link Ok} value or null.
   */
  ok() {
    this.#checkConsumed();
    this.#consumed = true;
    return this.#val;
  }

  /**
   * beware that it consumes the result
   * @throws panics if the result was already consumed
   * @returns contained {@link Err} value or null.
   */
  err() {
    this.#checkConsumed();
    this.#consumed = true;
    return this.#err;
  }

  /**
   * checks if the result is consumed or not.
   * @private this is an internal function
   * @throws panics if the result is already consumed
   */
  #checkConsumed(): void {
    if(this.#consumed)
      throw new Panic('this is caused by consuming an already consumed Result')
  }
}