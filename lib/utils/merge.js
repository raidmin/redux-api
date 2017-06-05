"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergePair = mergePair;

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.length ? args.reduce(mergePair) : null;
};

/* eslint no-void: 0 */
var toString = Object.prototype.toString;
var OBJECT = "[object Object]";
var ARRAY = "[object Array]";

function mergePair(a, b) {
  if (a === void 0) {
    return b;
  }
  if (b === void 0) {
    return a;
  }

  var aType = toString.call(a);
  var bType = toString.call(b);
  if (aType === ARRAY) {
    return a.concat(b);
  }
  if (bType === ARRAY) {
    return [a].concat(b);
  }
  if (aType !== OBJECT || bType !== OBJECT) {
    return b;
  }
  return Object.keys(b).reduce(function (memo, key) {
    memo[key] = mergePair(a[key], b[key]);
    return memo;
  }, a);
}
//# sourceMappingURL=merge.js.map