'use strict';

import Jison from 'jison';

const grammar = {
  // Lexical tokens
  lex: {
    rules: [
      ['\\s+', ''], // skip whitespace
      ['\\(', 'return "(";'],
      ['\\)', 'return ")";'],
      ['\\[', 'return "[";'],
      ['\\]', 'return "]";'],
      [',', 'return ",";'],
      ['==', 'return "==";'],
      ['=', 'return "==";'],
      ['\\!=', 'return "!=";'],
      ['~=', 'return "~=";'],
      ['>=', 'return ">=";'],
      ['<=', 'return "<=";'],
      ['<', 'return "<";'],
      ['>', 'return ">";'],
      ['and[^\\w]', 'return "and";'],
      ['or[^\\w]', 'return "or";'],
      ['not[^\\w]', 'return "not";'],
      ['in[^\\w]', 'return "in";'],

      ['-?[0-9]+(?:\\.[0-9]+)?\\b', 'return "NUMBER";'], // 212.321, -31
      ['true|false', 'return "BOOLEAN";'], // true/false
      ['null|undefined', 'return "PRIMITIVE";'],
      [
        '[A-zÀ-ÖØ-öø-įĴ-őŔ-žǍ-ǰǴ-ǵǸ-țȞ-ȟȤ-ȳɃɆ-ɏḀ-ẞƀ-ƓƗ-ƚƝ-ơƤ-ƥƫ-ưƲ-ƶẠ-ỿ_][\\.A-zÀ-ÖØ-öø-įĴ-őŔ-žǍ-ǰǴ-ǵǸ-țȞ-ȟȤ-ȳɃɆ-ɏḀ-ẞƀ-ƓƗ-ƚƝ-ơƤ-ƥƫ-ưƲ-ƶẠ-ỿ_0-9-]*',
        'return "SYMBOL";',
      ], // some.Symbol22
      [
        '"(\\[\\"]|[^\\"])*"',
        'yytext = yytext.substr(1, yyleng-2); return "STRING";',
      ], // "foo"
      [
        "'(\\[\\']|[^\\'])*'",
        'yytext = yytext.substr(1, yyleng-2); return "STRING";',
      ], // 'foo'

      ['-', 'return "-";'],

      // End
      ['$', 'return "EOF";'],
    ],
  },
  tokens: 'NUMBER BOOLEAN PRIMITIVE SYMBOL STRING [ ] ,',

  // Operator precedence - lowest precedence first.
  // See http://www.gnu.org/software/bison/manual/html_node/Precedence.html
  // for a good explanation of how it works in Bison (and hence, Jison).
  // Different languages have different rules, but this seems a good starting
  // point: http://en.wikipedia.org/wiki/Order_of_operations#Programming_languages
  operators: [
    ['left', 'or'],
    ['left', 'and'],
    ['left', 'in'],
    ['left', '==', '!='],
    ['left', '<=', '>=', '~=', '<', '>'],
    ['left', 'not'],
    ['left', 'UMINUS'],
  ],

  // Grammar
  bnf: {
    expressions: [
      // Entry point
      ['e EOF', 'return $1.type === "SYMBOL" ? {...$1, alone: true}: $1;'],
    ],

    VALUE: [
      [
        'NUMBER',
        '$$ = { type: "NUMBER", value: $1.includes(".") ? parseFloat($1) : parseInt($1, 10) };',
      ],
      ['BOOLEAN', '$$ = { type: "BOOLEAN", value: $1 === "true" };'],
      [
        'PRIMITIVE',
        '$$ = { type: "PRIMITIVE", value: $1 === "null" ? null : undefined  };',
      ],
      ['STRING', '$$ = { type: "STRING", value: $1 };'],
      ['SYMBOL', '$$ = { type: "SYMBOL", value: $1 };'],
    ],

    ARRAY: [
      ['[ ]', '$$ = { type: "ARRAY", children: [] };'],
      ['[ LIST ]', '$$ = { type: "ARRAY", children: $2 };'],
    ],

    LIST: [
      ['VALUE', '$$ = [ $1 ];'],
      ['LIST , VALUE', '$$ = $1; $1.push($3);'],
    ],

    e: [
      [
        '- e',
        '$$ = { type: "-", children: [ $2 ] };',
        {
          prec: 'UMINUS',
        },
      ],
      ['e and e', '$$ = { type: "&&", children: [ $1.type === "SYMBOL" ? {...$1, alone: true}: $1, $3.type === "SYMBOL" ? {...$3, alone: true}: $3 ] };'],
      ['e or e', '$$ = { type: "||", children: [ $1.type === "SYMBOL" ? {...$1, alone: true}: $1, $3.type === "SYMBOL" ? {...$3, alone: true}: $3 ] };'],
      ['e in e', '$$ = { type: "IN", children: [ $1, $3 ] };'],
      ['not e', '$$ = { type: "!", children: [ $2.type === "SYMBOL" ? {...$2, alone: true}: $2 ] };'],
      ['e == e', '$$ = { type: "==", children: [ $1, $3 ] };'],
      ['e != e', '$$ = { type: "!=", children: [ $1, $3 ] };'],
      ['e ~= e', '$$ = { type: "MATCH", children: [ $1, $3 ] };'],
      ['e <= e', '$$ = { type: "<=", children: [ $1, $3 ] };'],
      ['e >= e', '$$ = { type: ">=", children: [ $1, $3 ] };'],
      ['e < e', '$$ = { type: "<", children: [ $1, $3 ] };'],
      ['e > e', '$$ = { type: ">", children: [ $1, $3 ] };'],
      ['( e )', '$$ = { type: "EXPRESSION", children: [ $2.type === "SYMBOL" ? {...$2, alone: true}: $2 ] };'],

      ['ARRAY', '$$ = $1;'],
      ['VALUE', '$$ = $1;'],
    ],
  },
};

const code = new Jison.Generator(grammar).generate();

console.log(code + '\n\nexport default parser;');
