"use strict";

import compiler from "./index.js";
import parser from "pivotql-parser-expression";

describe("Basic types", () => {
  test("NUMBER", () => {
    expect(compiler(parser("17"))).toEqual({ filter: 17 });
  });
});

describe("Basic queries", () => {
  test('foo == "bar"', () => {
    expect(compiler(parser('foo == "bar"'))).toEqual({
      filter: ["==", ["get", "foo"], "bar"],
    });
  });
  test('foo != "bar"', () => {
    expect(compiler(parser('foo != "bar"'))).toEqual({
      filter: ["!=", ["get", "foo"], "bar"],
    });
  });
  test("foo", () => {
    expect(compiler(parser("foo"))).toEqual({ filter: ["has", "foo"] });
  });
});

describe("Compound queries", () => {
  test('foo == "bar" and foo != "baz"', () => {
    expect(compiler(parser('foo == "bar" and foo != "baz"'))).toEqual({
      filter: ["all", ["==", ["get", "foo"], "bar"], ["!=", ["get", "foo"], "baz"]],
    });
  });
  test('foo == "bar" or bar != 10', () => {
    expect(compiler(parser('foo == "bar" or bar != 10'))).toEqual({
      filter: ["any", ["==", ["get", "foo"], "bar"], ["!=", ["get", "bar"], 10]],
    });
  });
  test('foo == "bar" or foo != "baz" and bam == 10', () => {
    expect(compiler(parser('foo == "bar" or foo != "baz" and bam == 10'))).toEqual({
      filter: [
        "any",
        ["==", ["get", "foo"], "bar"],
        ["all", ["!=", ["get", "foo"], "baz"], ["==", ["get", "bam"], 10]],
      ],
    });
  });
  test('foo in ["bar", "baz"]', () => {
    expect(compiler(parser('foo in ["bar", "baz"]'))).toEqual({
      filter: ["in", ["get", "foo"], ["literal", ["bar", "baz"]]],
    });
  });
  test("foo in [10, 20]", () => {
    expect(compiler(parser("foo in [10, 20]"))).toEqual({
      filter: ["in", ["get", "foo"], ["literal", [10, 20]]],
    });
  });
  test("foo and (bar or baz)", () => {
    expect(compiler(parser("foo and (bar or baz)"))).toEqual({
      filter: ["all", ["has", "foo"], ["any", ["has", "bar"], ["has", "baz"]]],
    });
  });
});
