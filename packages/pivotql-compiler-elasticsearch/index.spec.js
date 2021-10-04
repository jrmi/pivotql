'use strict';

import compiler from './index.js';
import parser from 'pivotql-parser-expression';

describe('Basic types', () => {
  test('NUMBER', () => {
    expect(compiler({ type: 'NUMBER', value: 10 })).toEqual({
      query: { bool: { filter: 10 } },
    });
  });
});

describe('Basic queries', () => {
  test('foo == "bar"', () => {
    expect(compiler(parser('foo == "bar"'))).toEqual({
      query: { bool: { filter: { match: { foo: { query: 'bar' } } } } },
    });
  });
  test('foo != "bar"', () => {
    expect(compiler(parser('foo != "bar"'))).toEqual({
      query: {
        bool: {
          filter: { bool: { must_not: { match: { foo: { query: 'bar' } } } } },
        },
      },
    });
  });
});

describe('Compound queries', () => {
  test('foo == "bar" and foo != "baz"', () => {
    expect(compiler(parser('foo == "bar" and foo != "baz"'))).toEqual({
      query: {
        bool: {
          filter: {
            bool: {
              must: [
                { match: { foo: { query: 'bar' } } },
                { bool: { must_not: { match: { foo: { query: 'baz' } } } } },
              ],
            },
          },
        },
      },
    });
  });
  test('foo == "bar" or foo != "baz"', () => {
    expect(compiler(parser('foo == "bar" or foo != "baz"'))).toEqual({
      query: {
        bool: {
          filter: {
            bool: {
              should: [
                { match: { foo: { query: 'bar' } } },
                { bool: { must_not: { match: { foo: { query: 'baz' } } } } },
              ],
            },
          },
        },
      },
    });
  });
  test('foo == "bar" or foo != "baz" and bam == 10', () => {
    expect(
      compiler(parser('foo == "bar" or foo != "baz" and bam == 10'))
    ).toEqual({
      query: {
        bool: {
          filter: {
            bool: {
              should: [
                { match: { foo: { query: 'bar' } } },
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          must_not: { match: { foo: { query: 'baz' } } },
                        },
                      },
                      { match: { bam: { query: 10 } } },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    });
  });
});
