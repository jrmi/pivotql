import parser from "./parser.js";

const parse = (expression) => {
  const tree = parser.parse(expression);
  return tree;
};

export default parse;