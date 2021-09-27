"use strict";

const compiler = require("./index.js");

describe("Basic types", () => {
  test("NUMBER", () => {
    expect(compiler({ type: "NUMBER", value: 10 })).toEqual({
      query: { filter: [10] },
    });
  });
});
