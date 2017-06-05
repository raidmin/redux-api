"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var toString = Object.prototype.toString;
var OBJECT = "[object Object]";

/**
 * Default responce transformens
 */
exports.default = {
  array: function array(data) {
    return !data ? [] : Array.isArray(data) ? data : [data];
  },
  object: function object(data) {
    if (!data) {
      return {};
    }
    return toString.call(data) === OBJECT ? data : { data: data };
  }
};
module.exports = exports["default"];
//# sourceMappingURL=transformers.js.map