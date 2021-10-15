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
      query: {
        bool: {
          filter: { term: { 'foo.keyword': 'bar' } },
        },
      },
    });
  });
  test('foo != "bar"', () => {
    expect(compiler(parser('foo != "bar"'))).toEqual({
      query: {
        bool: {
          filter: { bool: { must_not: [{ term: { 'foo.keyword': 'bar' } }] } },
        },
      },
    });
  });
  test('foo', () => {
    expect(compiler(parser('foo'))).toEqual({
      query: { bool: { filter: { exists: { field: 'foo' } } } },
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
                { term: { 'foo.keyword': 'bar' } },
                { bool: { must_not: [{ term: { 'foo.keyword': 'baz' } }] } },
              ],
            },
          },
        },
      },
    });
  });
  test('foo == "bar" or bar != 10', () => {
    expect(compiler(parser('foo == "bar" or bar != 10'))).toEqual({
      query: {
        bool: {
          filter: {
            bool: {
              should: [
                { term: { 'foo.keyword': 'bar' } },
                { bool: { must_not: [{ term: { bar: 10 } }] } },
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
                { term: { 'foo.keyword': 'bar' } },
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          must_not: [{ term: { 'foo.keyword': 'baz' } }],
                        },
                      },
                      { term: { bam: 10 } },
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
  test('foo in ["bar", "baz"]', () => {
    expect(compiler(parser('foo in ["bar", "baz"]'))).toEqual({
      query: {
        bool: {
          filter: {
            bool: {
              must: {
                bool: {
                  should: [
                    { term: { 'foo.keyword': 'bar' } },
                    { term: { 'foo.keyword': 'baz' } },
                  ],
                },
              },
            },
          },
        },
      },
    });
  });
  test('foo in [10, 20]', () => {
    expect(compiler(parser('foo in [10, 20]'))).toEqual({
      query: {
        bool: {
          filter: {
            bool: {
              must: {
                bool: {
                  should: [{ term: { foo: 10 } }, { term: { foo: 20 } }],
                },
              },
            },
          },
        },
      },
    });
  });
  test('foo and (bar or baz)', () => {
    expect(compiler(parser('foo and (bar or baz)'))).toEqual({
      query: {
        bool: {
          filter: {
            bool: {
              must: [
                { exists: { field: 'foo' } },
                {
                  bool: {
                    should: [
                      { exists: { field: 'bar' } },
                      { exists: { field: 'baz' } },
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
