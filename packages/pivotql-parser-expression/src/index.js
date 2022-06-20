import parser from "./parser.js";

export const parse = (expression) => {
  const tree = parser.parse(expression);
  return tree;
};

export default parse;
