# PivotQL expression parser

Parses simple expression to generate PivotQL ASTs.

See [main repository](https://github.com/jrmi/pivotql/) for more information.

# Expression Query Syntax

| Values          | Description                                              |
| --------------- | -------------------------------------------------------- |
| 43, -1.234      | Numbers                                                  |
| true, false     | Booleans                                                 |
| null, undefined | Primitives                                               |
| "hello"         | Strings                                                  |
| foo, a.b.c      | Symbols (usually a key or column name in your datastore) |

| Operators | Description                    |
| --------- | ------------------------------ |
| x == y    | Equality                       |
| x != y    | Ineqaulity                     |
| x ~= "y"  | Matching evaluated as a RegExp |
| x < y     | Less than                      |
| x <= y    | Less than or equal to          |
| x > y     | Greater than                   |
| x >= y    | Greater than or equal to       |
| x or y    | Boolean or                     |
| x and y   | Boolean and                    |
| not x     | Boolean not                    |
| ( x )     | Expression                     |

Operator precedence follows that of any sane language.
