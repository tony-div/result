export class Panic extends Error {
  constructor(msg?: string) {
    super(msg || "this is caused by calling an .unwrap() on an Err() value. delete that unwrap() and handle expected error with match()");
  }
}