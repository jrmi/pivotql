# PivotQL compiler for mapbox

Produces mapbox filter queries from PivoQL ASTs.

## Install

```sh
npm install pivotql-compiler-mapboxgl
```

## Example

```js

import {parse} from 'pivotql-parser-expression';
import {compile} from 'pivotql-compiler-mapboxgl';

const query = '( height <= 20 or favorites.color == "green" ) and firstname in ["john", "doug"]';

const queryMB = compile(parse(query))

// Use query filter in layer style

```

## More information

See [main repository](https://github.com/jrmi/pivotql/) for more information.
