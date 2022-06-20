"use strict";

var get = function (obj, path) {
  for (var i = 0, path = path.split("."), len = path.length; i < len; i++) {
    obj = obj[path[i]];
  }
  return obj;
};

const _firstChild = (node) => {
  return node.children[0];
};
const _identity = (node) => {
  return node.value;
};

function _extractComparison(node) {
  let symbol = null;
  let value = null;
  node.children.forEach(function (child) {
    if (child.type === "SYMBOL") {
      if (symbol) {
        throw new Error("JS: You can only specify one symbol in a comparison.");
      }
      symbol = child;
    } else {
      if (value) {
        throw new Error("JS: You can only specify one value in a comparison.");
      }
      value = child;
    }
  });

  if (!(symbol && value)) {
    throw new Error("JS: Invalid comparison, could not find both symbol and value.");
  }

  return {
    symbol: symbol,
    value: value,
  };
}

const generators = {
  NUMBER: _identity,
  BOOLEAN: _identity,
  PRIMITIVE: _identity,
  STRING: _identity,
  SYMBOL(node) {
    if (node.alone) {
      return (obj) => get(obj, node.value) !== undefined;
    }
    return node.value;
  },

  "-"(node) {
    return -_firstChild(node).value;
  },
  "&&"(node) {
    const conditions = node.children.map((_node) => _processNode(_node));

    return (obj) => conditions.every((fn) => fn(obj));
  },
  "||"(node) {
    const conditions = node.children.map((_node) => _processNode(_node));

    return (obj) => conditions.some((fn) => fn(obj));
  },
  ARRAY(node) {
    return node.children.map(_processNode);
  },
  IN(node) {
    const field = _processNode(node.children[0]);
    const valueList = _processNode(node.children[1]);
    return (obj) => valueList.includes(get(obj, field));
  },
  "!"(node) {
    const expr = _processNode(node.children[0]);
    return (obj) => !expr(obj);
  },
  "=="(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    return (obj) => get(obj, symbol) === value;
  },
  "!="(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    return (obj) => get(obj, symbol) !== value;
  },
  MATCH(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);

    const regex = new RegExp(value);
    return (obj) => get(obj, symbol).match(regex);
  },
  "<"(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    return (obj) => get(obj, symbol) < value;
  },
  "<="(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    return (obj) => get(obj, symbol) <= value;
  },
  ">"(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    return (obj) => get(obj, symbol) > value;
  },
  ">="(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    return (obj) => get(obj, symbol) >= value;
  },
  EXPRESSION(node) {
    const conditions = node.children.map((_node) => _processNode(_node));
    return (obj) => conditions.every((fn) => fn(obj));
  },
};

const _processNode = (node) => {
  if (!(node.type in generators)) {
    throw new Error(`Invalid node type ${node.type}`);
  }

  return generators[node.type](node);
};

export const compile = (tree) => {
  return _processNode(tree);
};

export default compile;
