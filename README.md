handle your expected errors with a clean, fast approach
## why?
a [benchmark](https://hamy.xyz/blog/2025-05_typescript-errors-vs-exceptions-benchmarks) shows that returning an object is 355.18x faster than throwing exceptions, and I really like the way rust [handles errors](https://doc.rust-lang.org/std/result/enum.Result.html)
## how to use it?
install with
```bash
npm install result2
```
then import it
```typescript
import {Err, Ok} from 'result2';

const error = Err();
console.log('is error an Err?', error.isErr());
error.inspectErr((error) => {console.log('there is an error')});

const beef = Ok(123);
beef.match(
  (ok) => {console.log('success! value is', ok)},
  () => {console.log('there is an error')}
);
```
`Ok` and `Err` are subclasses of `Result`. see what you can do with them at [docs](https://tony-div.github.io/result/classes/lib_result.Result.html).
## where can I use it?
Everywhere! browser, nodejs, other server runtimes (not tested yet), and it supports typescript!