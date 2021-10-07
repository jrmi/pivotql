PivotQL (Pivot Query Language)
=======

Lets you write a simple query and run it against any datastore, like [ElasticSearch](https://github.com/jrmi/pivotql/tree/master/packages/pivotql-compiler-elasticsearch)
and/or [Mapbox filter](https://github.com/jrmi/pivotql/tree/master/packages/pivotql-compiler-mapboxgl).

PivotQL parses a simple query language into an Abstract Syntax Tree implementing
the [unist](https://github.com/syntax-tree/unist) spec that can then be used to
compile a query for a given datastore.

This is useful if you want a level of abstraction between your queries and how your data is actually
stored/searched. You can also use PivotQL to execute the same query against multiple datastores at the same time.

For example:

```javascript
const parse = require( 'pivotql-parser-expression' );
const esCompiler = require( 'pivotql-compiler-elasticsearch' );
const mapboxCompiler = require( 'pivotql-compiler-mapbox' );

// parse a pivotql query into an AST
const queryAST = parse( '( height <= 20 or ( favorites.color == "green" and height != 25 ) ) and firstname in ["john", "doug"]' );

// using that AST, compile an elasticsearch query
const esQuery = esCompiler( queryAST );
console.log( util.inspect( esQuery, { depth: null } ) );

// using the same AST, compile an mabox filter query
const mapboxQuery = mapboxCompiler( queryAST );
console.log( util.inspect( mapboxQuery, { depth: null } ) );
```

Which produces the following AST:

```javascript
{
"type":"&&",
"children":[
  {"type":"EXPRESSION","children":[
    {"type":"||","children":[
      {"type":"<=","children":[
        {"type":"SYMBOL","value":"height"},{"type":"NUMBER","value":20}]},
        {"type":"EXPRESSION","children":[
          {"type":"&&","children":[
            {"type":"==","children":[
              {"type":"SYMBOL","value":"favorites.color"},{"type":"STRING","value":"green"}]},
              {"type":"!=","children":[
                {"type":"SYMBOL","value":"height"},{"type":"NUMBER","value":25}]}]}]}]}]},
    {"type":"IN","children":[
      {"type":"SYMBOL","value":"firstname"},{"type":"ARRAY","children":[
        {"type":"STRING","value":"john"},{"type":"STRING","value":"doug"}]}]}]
}
```

Using that AST, you can generate queries for various datastores.

For ElasticSearch, the query is:

```javascript
{
"query":{"filter":[
  {"bool":{"must":[
    {"bool":{"should":[
      {"range":{"height":{"lte":20}}},{"bool":{"must":[
        {"term":{"favorites.color":"green"}},
        {"bool":{"must_not":{"term":{"height":25}}}}]}}]}},
  {"bool":{"must":{"bool":{"should":[
    {"match":{"firstname":"john"}},{"match":{"firstname":"doug"}}]}}}}]}}]}
}
```

and produces this for mapbox:

```javascript
{
"filter":[
  "all",[
    "any",["<=",["get","height"],20],[
      "all",["==",["get","favorites.color"],"green"],["!=",["get","height"],25]]],
    ["in",["get","firstname"],["literal",["john","doug"]]]]
}
```

# Availble parsers

- Simple expression
- !! Your parser here! Submissions welcome! !!

# Available Compilers

- Elastic Search
- Mapbox
- !! Your compiler here! Submissions welcome! !!

# Development

This repository contains many packages in the `packages/` directory. You need
npm > v7.14 with workspaces features to be able to execute the next commands:

```sh
npm ci
```

And launch test:

```sh
npm run test
```

# Credits

This was inspired by [UniQL](https://github.com/honeinc/uniql), inspired itself by [FiltrES](https://github.com/abeisgreat/filtres) which was in turn inspired by [Filtrex](https://github.com/joewalnes/filtrex)
