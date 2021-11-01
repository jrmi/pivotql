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

class MongoCompiler {
  constructor(options) {
    this.flavor = options?.flavor || 'mongodb';
  }

  NUMBER = _identity;
  BOOLEAN = _identity;
  PRIMITIVE = _identity;
  STRING = _identity;
  SYMBOL(node) {
    if (node.alone) {
      return { [node.value]: { $exists: true } };
    }
    return node.value;
  }

  '-'(node) {
    return -_firstChild(node).value;
  }
  '&&'(node) {
    const _and = { $and: [] };
    node.children.forEach((_node) => {
      _and.$and.push(this.processNode(_node));
    });
    return _and;
  }
  '||'(node) {
    const _or = { $or: [] };
    node.children.forEach((_node) => {
      _or.$or.push(this.processNode(_node));
    });
    return _or;
  }
  ARRAY(node) {
    return node.children.map(this.processNode.bind(this));
  }
  IN(node) {
    const field = this.processNode(node.children[0]);
    const valueList = this.processNode(node.children[1]);
    const _in = { [field]: { $in: [] } };
    valueList.forEach((value) => {
      _in[field].$in.push(value);
    });
    return _in;
  }
  '!'(node) {
    const expr = this.processNode(node.children[0]);
    return { $nor: [expr] };
  }
  '=='(node) {
    const comparison = _extractComparison(node);
    const symbol = this.processNode(comparison.symbol);
    const value = this.processNode(comparison.value);
    return { [symbol]: value };
  }
  '!='(node) {
    const comparison = _extractComparison(node);
    const symbol = this.processNode(comparison.symbol);
    const value = this.processNode(comparison.value);

    return {
      [symbol]: { $ne: value },
    };
  }
  MATCH(node) {
    const comparison = _extractComparison(node);
    const symbol = this.processNode(comparison.symbol);
    const value = this.processNode(comparison.value);

    const _match = {
      [symbol]: { regex: value },
    };
    return _match;
  }
  '<'(node) {
    const comparison = _extractComparison(node);
    const symbol = this.processNode(comparison.symbol);
    const value = this.processNode(comparison.value);
    const _lt = {
      [symbol]: { $lt: value },
    };
    return _lt;
  }
  '<='(node) {
    const comparison = _extractComparison(node);
    const symbol = this.processNode(comparison.symbol);
    const value = this.processNode(comparison.value);
    const _lte = {
      [symbol]: { $lte: value },
    };
    return _lte;
  }
  '>'(node) {
    const comparison = _extractComparison(node);
    const symbol = this.processNode(comparison.symbol);
    const value = this.processNode(comparison.value);
    const _gt = {
      [symbol]: { $gt: value },
    };
    return _gt;
  }
  '>='(node) {
    const comparison = _extractComparison(node);
    const symbol = this.processNode(comparison.symbol);
    const value = this.processNode(comparison.value);
    const _gte = {
      [symbol]: { $gte: value },
    };
    return _gte;
  }
  EXPRESSION(node) {
    let expression = {};
    node.children.forEach((_node) => {
      expression = deepmerge(expression, this.processNode(_node));
    });
    return expression;
  }

  processNode(node) {
    if (!this[node.type]) {
      throw new Error(`Invalid node type ${node.type}`);
    }

    return this[node.type](node);
  }
}

const compile = (tree, options = {}) => {
  const compiler = new MongoCompiler(options);
  return compiler.processNode(tree);
};

export default compile;
