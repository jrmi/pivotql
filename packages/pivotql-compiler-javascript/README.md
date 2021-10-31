# PivotQL compiler for elasticsearch

Produces elastic search queries from PivoQL ASTs.

## Install

```sh
npm install pivotql-compiler-javascript
```

## Example

```js

import parse from 'pivotql-parser-expression';
import compile from 'pivotql-compiler-javascript';

const query = '( height <= 20 or favorites.color == "green" ) and firstname in ["john", "doug"]';

const queryFn = compile(parse(query))

const objToTest = {
  height: 18,
  favorites: {
    color: "green"
  },
  firstname: "john"
}

queryFn(objToTest) // -> true

```

## More information

See [main repository](https://github.com/jrmi/pivotql/) for more information.
