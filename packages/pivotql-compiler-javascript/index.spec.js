'use strict';

import compiler from './index.js';
import parser from 'pivotql-parser-expression';

describe('Basic types', () => {
  test('NUMBER', () => {
    expect(compiler({ type: 'NUMBER', value: 10 })).toEqual(10);
  });
});

describe('Basic queries', () => {
  test('foo == "bar"', () => {
    const testFn = compiler(parser('foo == "bar"'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
      })
    ).toBe(false);
  });
  test('foo != "bar"', () => {
    const testFn = compiler(parser('foo != "bar"'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 'baz',
      })
    ).toBe(true);
  });
  test('not (foo != "bar")', () => {
    const testFn = compiler(parser('not (foo != "bar")'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
      })
    ).toBe(false);
  });
  test('foo > 10', () => {
    const testFn = compiler(parser('foo > 10'));
    expect(
      testFn({
        foo: 11,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 9,
      })
    ).toBe(false);
  });
  test('foo <= 42', () => {
    const testFn = compiler(parser('foo <= 42'));
    expect(
      testFn({
        foo: 42,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 43,
      })
    ).toBe(false);
  });
  test('foo <= 42 and foo >= 12', () => {
    const testFn = compiler(parser('foo <= 42 and foo >= 12'));
    expect(
      testFn({
        foo: 20,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 11,
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 43,
      })
    ).toBe(false);
  });
  test('foo', () => {
    const testFn = compiler(parser('foo'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(true);
    expect(testFn({})).toBe(false);
  });
});

describe('Compound queries', () => {
  test('foo == "bar" and foo != "baz"', () => {
    const testFn = compiler(parser('foo == "bar" and foo != "baz"'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
      })
    ).toBe(false);
  });
  test('foo == "bar" or bar != 10', () => {
    const testFn = compiler(parser('foo == "bar" or bar != 10'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'bar',
        bar: 10,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'yop',
        bar: 10,
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 'yop',
        bar: 11,
      })
    ).toBe(true);
  });
  test('foo == "bar" or bar != "baz" and bam == 10', () => {
    const testFn = compiler(
      parser('foo == "bar" or bar != "baz" and bam == 10')
    );
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 'baz',
        bam: 10,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
        bar: 'baz',
        bam: 10,
      })
    ).toBe(false);
  });
  test('(foo == "bar" or bar != "baz") and bam == 10', () => {
    const testFn = compiler(
      parser('(foo == "bar" or bar != "baz") and bam == 10')
    );
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 'baz',
        bar: 'roo',
        bam: 10,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
        bar: 'baz',
        bam: 10,
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 'baz',
        bam: 10,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
        bam: 11,
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 'baz',
        bar: 'baz',
        bam: 10,
      })
    ).toBe(false);
  });
  test('foo in ["bar", "baz"]', () => {
    const testFn = compiler(parser('foo in ["bar", "baz"]'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'poum',
      })
    ).toBe(false);
  });
  test('foo in [10, 20]', () => {
    const testFn = compiler(parser('foo in [10, 20]'));
    expect(
      testFn({
        foo: 10,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 20,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 30,
      })
    ).toBe(false);
  });
  test('foo and (bar or baz)', () => {
    const testFn = compiler(parser('foo and (bar or baz)'));
    expect(
      testFn({
        foo: 'bar',
      })
    ).toBe(false);
    expect(
      testFn({
        foo: 'baz',
        bar: true,
      })
    ).toBe(true);
    expect(
      testFn({
        foo: 'baz',
        baz: null,
      })
    ).toBe(true);
    expect(
      testFn({
        baz: null,
      })
    ).toBe(false);
  });
});
