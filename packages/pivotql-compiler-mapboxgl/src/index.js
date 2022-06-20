"use strict";

const _firstChild = (node) => {
  return node.children[0];
};

const _identity = (node) => {
  return node.value;
};

const generators = {
  NUMBER: _identity,
  BOOLEAN: _identity,
  PRIMITIVE: _identity,
  STRING: _identity,
  SYMBOL: (node) => {
    if (node.alone) {
      return ["has", _identity(node)];
    }
    return ["get", _identity(node)];
  },

  "-"(node) {
    return -_firstChild(node).value;
  },
  "&&"(node) {
    return ["all", ...node.children.map(_processNode)];
  },
  "||"(node) {
    return ["any", ...node.children.map(_processNode)];
  },
  ARRAY(node) {
    return node.children.map(_processNode);
  },
  IN(node) {
    const field = _processNode(node.children[0]);
    const valueList = _processNode(node.children[1]);

    //return ['any', ...valueList.map((value) => ['==', field, value])];

    return ["in", field, ["literal", valueList]];
  },
  "!"(node) {
    return ["!", _processNode(node.children[0])];
  },
  "=="(node) {
    return ["==", ...node.children.map(_processNode)];
  },
  "!="(node) {
    return ["!=", ...node.children.map(_processNode)];
  },
  MATCH(node) {
    const _match = ["in"];
    _match.push(_processNode(node.children[1]), _processNode(node.children[0]));
    return _match;
  },
  "<"(node) {
    return ["<", ...node.children.map(_processNode)];
  },
  "<="(node) {
    return ["<=", ...node.children.map(_processNode)];
  },
  ">"(node) {
    return [">", ...node.children.map(_processNode)];
  },
  ">="(node) {
    return [">=", ...node.children.map(_processNode)];
  },
  EXPRESSION(node) {
    return node.children.map(_processNode).flat();
  },
};

const _processNode = (node) => {
  if (!(node.type in generators)) {
    throw new Error(`Invalid node type ${node.type}`);
  }

  return generators[node.type](node);
};

export const compile = (tree) => {
  const query = {};
  query.filter = _processNode(tree);
  return query;
};

export default compile;
