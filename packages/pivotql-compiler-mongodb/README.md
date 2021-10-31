# PivotQL compiler for mongodb

Produces mongodb queries from PivoQL ASTs.

## Install

```sh
npm install pivotql-compiler-mongodb
```

## Example

```js

import parse from 'pivotql-parser-expression';
import compile from 'pivotql-compiler-mongodb';

const query = '( height <= 20 or favorites.color == "green" ) and firstname in ["john", "doug"]';

const queryMongo = compile(parse(query))

// Use queryMongo with query API.

```

## More information

See [main repository](https://github.com/jrmi/pivotql/) for more information.
