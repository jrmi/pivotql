"use strict";

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
        throw new Error("ELASTICSEARCH: You can only specify one symbol in a comparison.");
      }
      symbol = child;
    } else {
      if (value) {
        throw new Error("ELASTICSEARCH: You can only specify one value in a comparison.");
      }
      value = child;
    }
  });

  if (!(symbol && value)) {
    throw new Error("ELASTICSEARCH: Invalid comparison, could not find both symbol and value.");
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
      return { exists: { field: node.value } };
    }
    return node.value;
  },

  "-"(node) {
    return -_firstChild(node).value;
  },
  "&&"(node) {
    const _and = { bool: { must: [] } };
    node.children.forEach(function (_node) {
      _and.bool.must.push(_processNode(_node));
    });
    return _and;
  },
  "||"(node) {
    const _or = { bool: { should: [] } };
    node.children.forEach(function (_node) {
      _or.bool.should.push(_processNode(_node));
    });
    return _or;
  },
  ARRAY(node) {
    return node.children.map(_processNode);
  },
  IN(node) {
    const field = _processNode(node.children[0]);
    const valueList = _processNode(node.children[1]);
    const _in = { bool: { must: { bool: { should: [] } } } };
    const prop = typeof valueList[0] === "string" ? `${field}.keyword` : field;
    valueList.forEach((value) => {
      _in.bool.must.bool.should.push({ term: { [prop]: value } });
    });
    return _in;
  },
  "!"(node) {
    return { bool: { must_not: [_processNode(node.children[0])] } };
  },
  "=="(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    const prop = typeof value === "string" ? `${symbol}.keyword` : symbol;
    return {
      term: {
        [prop]: value,
      },
    };
  },
  "!="(node) {
    const comparison = _extractComparison(node);
    const symbol = _processNode(comparison.symbol);
    const value = _processNode(comparison.value);
    const prop = typeof value === "string" ? `${symbol}.keyword` : symbol;

    return {
      bool: {
        must_not: [
          {
            term: {
              [prop]: value,
            },
          },
        ],
      },
    };
  },
  MATCH(node) {
    const comparison = _extractComparison(node);
    const _match = {
      bool: {
        must: {
          regexp: {},
        },
      },
    };
    _match.bool.must.regexp[_processNode(comparison.symbol)] = _processNode(comparison.value);
    return _match;
  },
  "<"(node) {
    const comparison = _extractComparison(node);
    const _lt = {
      range: {},
    };
    _lt.range[_processNode(comparison.symbol)] = {
      lt: _processNode(comparison.value),
    };
    return _lt;
  },
  "<="(node) {
    const comparison = _extractComparison(node);
    const _lte = {
      range: {},
    };
    _lte.range[_processNode(comparison.symbol)] = {
      lte: _processNode(comparison.value),
    };
    return _lte;
  },
  ">"(node) {
    const comparison = _extractComparison(node);
    const _gt = {
      range: {},
    };
    _gt.range[_processNode(comparison.symbol)] = {
      gt: _processNode(comparison.value),
    };
    return _gt;
  },
  ">="(node) {
    const comparison = _extractComparison(node);
    const _gte = {
      range: {},
    };
    _gte.range[_processNode(comparison.symbol)] = {
      gte: _processNode(comparison.value),
    };
    return _gte;
  },
  EXPRESSION(node) {
    const _expression = {};
    node.children.forEach(function (_node) {
      Object.assign(_expression, _processNode(_node));
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

export const compile = (tree) => {
  const query = {
    query: { bool: {} },
  };
  query.query.bool.filter = _processNode(tree);
  return query;
};

export default compile;
