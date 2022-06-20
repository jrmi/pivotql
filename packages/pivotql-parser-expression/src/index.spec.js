"use strict";

import pivotql from "./index.js";

describe("comparisons", () => {
  test("<", () => {
    expect(pivotql("foo < 10")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: 10,
          type: "NUMBER",
        },
      ],
      type: "<",
    });
  });

  test("<=", () => {
    expect(pivotql("foo <= -10")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: -10,
          type: "NUMBER",
        },
      ],
      type: "<=",
    });
  });

  test(">", () => {
    expect(pivotql("foo > 10.5")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: 10.5,
          type: "NUMBER",
        },
      ],
      type: ">",
    });
  });

  test(">=", () => {
    expect(pivotql("foo >= -10.3")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: -10.3,
          type: "NUMBER",
        },
      ],
      type: ">=",
    });
  });

  test("==", () => {
    expect(pivotql("foo == 10")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: 10,
          type: "NUMBER",
        },
      ],
      type: "==",
    });
  });

  test("=", () => {
    expect(pivotql("foo = 10")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: 10,
          type: "NUMBER",
        },
      ],
      type: "==",
    });
  });

  test("!=", () => {
    expect(pivotql("foo != 10")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: 10,
          type: "NUMBER",
        },
      ],
      type: "!=",
    });
  });

  test("~=", () => {
    expect(pivotql('foo ~= "hi"')).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
        {
          value: "hi",
          type: "STRING",
        },
      ],
      type: "MATCH",
    });
  });
});

describe("logical operators", () => {
  test("and", () => {
    expect(pivotql("foo and bar")).toEqual({
      children: [
        {
          alone: true,
          value: "foo",
          type: "SYMBOL",
        },
        {
          alone: true,
          value: "bar",
          type: "SYMBOL",
        },
      ],
      type: "&&",
    });
  });

  test("or", () => {
    expect(pivotql("foo or bar")).toEqual({
      children: [
        {
          alone: true,
          value: "foo",
          type: "SYMBOL",
        },
        {
          alone: true,
          value: "bar",
          type: "SYMBOL",
        },
      ],
      type: "||",
    });
  });

  test("in and string", () => {
    expect(pivotql('"foo" in [ "foo", \'bar\', "baz", 1, 2.5, false, null, toto ]')).toEqual({
      children: [
        {
          value: "foo",
          type: "STRING",
        },
        {
          children: [
            {
              value: "foo",
              type: "STRING",
            },
            {
              value: "bar",
              type: "STRING",
            },
            {
              value: "baz",
              type: "STRING",
            },
            {
              value: 1,
              type: "NUMBER",
            },
            {
              value: 2.5,
              type: "NUMBER",
            },
            {
              value: false,
              type: "BOOLEAN",
            },
            {
              value: null,
              type: "PRIMITIVE",
            },
            {
              value: "toto",
              type: "SYMBOL",
            },
          ],
          type: "ARRAY",
        },
      ],
      type: "IN",
    });
  });

  test("not", () => {
    expect(pivotql("foo and not bar")).toEqual({
      children: [
        {
          alone: true,
          value: "foo",
          type: "SYMBOL",
        },
        {
          children: [
            {
              alone: true,
              value: "bar",
              type: "SYMBOL",
            },
          ],
          type: "!",
        },
      ],
      type: "&&",
    });
  });
});

describe("unary minus", () => {
  test("-SYMBOL is unary minus", () => {
    expect(pivotql("-foo")).toEqual({
      children: [
        {
          value: "foo",
          type: "SYMBOL",
        },
      ],
      type: "-",
    });
  });

  test("-NUMBER is number", () => {
    expect(pivotql("-10")).toEqual({
      value: -10,
      type: "NUMBER",
    });
  });
});

describe("string", () => {
  test('" quoted string', () => {
    expect(pivotql('"foo"')).toEqual({
      value: "foo",
      type: "STRING",
    });
  });

  test("' quoted string", () => {
    expect(pivotql("'foo'")).toEqual({
      value: "foo",
      type: "STRING",
    });
  });

  test("String with diacritics", () => {
    expect(pivotql('"Ă ă Â â Î î Ș ș Ț ț é ù è ê î û"')).toEqual({
      value: "Ă ă Â â Î î Ș ș Ț ț é ù è ê î û",
      type: "STRING",
    });
  });
});

describe("symbol", () => {
  test("Symbol alone", () => {
    expect(pivotql("foo")).toEqual({
      alone: true,
      value: "foo",
      type: "SYMBOL",
    });
  });

  test("Symbol with diacritics", () => {
    expect(pivotql("ĂăÂâÎîȘșȚțéùèêîû")).toEqual({
      alone: true,
      value: "ĂăÂâÎîȘșȚțéùèêîû",
      type: "SYMBOL",
    });
  });
});

describe("expressions", () => {
  test("( foo )", () => {
    expect(pivotql("( foo )")).toEqual({
      children: [
        {
          alone: true,
          value: "foo",
          type: "SYMBOL",
        },
      ],
      type: "EXPRESSION",
    });
  });

  test("( foo and bar )", () => {
    expect(pivotql("( foo and bar )")).toEqual({
      children: [
        {
          children: [
            {
              alone: true,
              value: "foo",
              type: "SYMBOL",
            },
            {
              alone: true,
              value: "bar",
              type: "SYMBOL",
            },
          ],
          type: "&&",
        },
      ],
      type: "EXPRESSION",
    });
  });

  test("( foo and bar ) or baz", () => {
    expect(pivotql("( foo and bar ) or baz")).toEqual({
      children: [
        {
          children: [
            {
              children: [
                {
                  alone: true,
                  value: "foo",
                  type: "SYMBOL",
                },
                {
                  alone: true,
                  value: "bar",
                  type: "SYMBOL",
                },
              ],
              type: "&&",
            },
          ],
          type: "EXPRESSION",
        },
        {
          alone: true,
          value: "baz",
          type: "SYMBOL",
        },
      ],
      type: "||",
    });
  });

  test("( ( foo and bar ) or baz )", () => {
    expect(pivotql("( ( foo and bar ) or baz )")).toEqual({
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      alone: true,
                      value: "foo",
                      type: "SYMBOL",
                    },
                    {
                      alone: true,
                      value: "bar",
                      type: "SYMBOL",
                    },
                  ],
                  type: "&&",
                },
              ],
              type: "EXPRESSION",
            },
            {
              alone: true,
              value: "baz",
              type: "SYMBOL",
            },
          ],
          type: "||",
        },
      ],
      type: "EXPRESSION",
    });
  });

  test("( ( foo and bar ) or ( baz and yak ) )", () => {
    expect(pivotql("( ( foo and bar ) or ( baz and yak ) )")).toEqual({
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      alone: true,
                      value: "foo",
                      type: "SYMBOL",
                    },
                    {
                      alone: true,
                      value: "bar",
                      type: "SYMBOL",
                    },
                  ],
                  type: "&&",
                },
              ],
              type: "EXPRESSION",
            },
            {
              children: [
                {
                  children: [
                    {
                      alone: true,
                      value: "baz",
                      type: "SYMBOL",
                    },
                    {
                      alone: true,
                      value: "yak",
                      type: "SYMBOL",
                    },
                  ],
                  type: "&&",
                },
              ],
              type: "EXPRESSION",
            },
          ],
          type: "||",
        },
      ],
      type: "EXPRESSION",
    });
  });
  describe("PRIMITIVE", () => {
    test("foo != undefined and bar == null", () => {
      expect(pivotql("foo != undefined and bar == null")).toEqual({
        children: [
          {
            children: [
              {
                value: "foo",
                type: "SYMBOL",
              },
              {
                value: undefined,
                type: "PRIMITIVE",
              },
            ],
            type: "!=",
          },
          {
            children: [
              {
                type: "SYMBOL",
                value: "bar",
              },
              {
                type: "PRIMITIVE",
                value: null,
              },
            ],
            type: "==",
          },
        ],
        type: "&&",
      });
    });
  });
});
