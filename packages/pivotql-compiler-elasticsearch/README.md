# PivotQL compiler for elasticsearch

Produces elastic search queries from PivoQL ASTs.

## Install

```sh
npm install pivotql-compiler-elasticsearch
```

## Example

```js

import {parse} from 'pivotql-parser-expression';
import {compile} from 'pivotql-compiler-elasticsearch';

const query = '( height <= 20 or favorites.color == "green" ) and firstname in ["john", "doug"]';

const queryEs = compile(parse(query))

// Use query ES with elasticsearch API

```

## More information

See [main repository](https://github.com/jrmi/pivotql/) for more information.
