'use strict';

import deepmerge from 'deepmerge';

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
    if (child.type === 'SYMBOL') {
      if (symbol) {
        throw new Error(
          'MONGODB: You can only specify one symbol in a comparison.'
        );
      }
      symbol = child;
    } else {
      if (value) {
        throw new Error(
          'MONGODB: You can only specify one value in a comparison.'
        );
      }
      value = child;
    }
  });

  if (!(symbol && value)) {
    throw new Error(
      'MONGODB: Invalid comparison, could not find both symbol and value.'
    );
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
      return { [node.value]: { $exists: true } };
    }
    return node.value;
  },

  '-'(node) {
    return -_firstChild(node).value;
  },
  '&&'(node) {
    let _and = {};
    node.children.forEach(function (_node) {
      _and = deepmerge(_and, _processNode(_node));
    });
    return _and;
  },
  '||'(node) {
    const _or = { $or: [] };
    node.children.forEach(function (_node) {
      _or.$or.push(_processNode(_node));
    });
    return _or;
  },
  ARRAY(node) {
    return node.children.map(_processNode);
  },
  IN(node) {
    const field = _processNode(node.children[0]);
    const valueList = _processNode(node.children[1]);
    const _in = { [field]: { $in: [] } };
    valueList.forEach((value) => {
      _in[field].$in.push(value);
    });
    return _in;
  },
  '!'(node) {
    throw new Error('! operator not supported by mongodb');
    // TODO Should invert operator
    // return {};
  },
  '=='(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    return {
      [symbol]: value,
    };
  },
  '!='(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);

    return {
      [symbol]: { $ne: value },
    };
  },
  MATCH(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);

    const _match = {
      [symbol]: { regex: value },
    };
    return _match;
  },
  '<'(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    const _lt = {
      [symbol]: { $lt: value },
    };
    return _lt;
  },
  '<='(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    const _lte = {
      [symbol]: { $lte: value },
    };
    return _lte;
  },
  '>'(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    const _gt = {
      [symbol]: { $gt: value },
    };
    return _gt;
  },
  '>='(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    const _gte = {
      [symbol]: { $gte: value },
    };
    return _gte;
  },
  EXPRESSION(node) {
    let _expression = {};
    node.children.forEach(function (_node) {
      _expression = deepmerge(_expression, _processNode(_node));
    });
    return _expression;
  },
};

const _processNode = (node) => {
  if (!(node.type in generators)) {
    throw new Error(`Invalid node type ${node.type}`);
  }

  return generators[node.type](node);
};

const compile = (tree) => {
  return _processNode(tree);
};

export default compile;
