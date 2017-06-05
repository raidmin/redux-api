"use strict";

/* eslint no-void: 0 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isEmpty(name) {
  return name === "" || name === null || name === void 0;
}

function get(obj) {
  for (var _len = arguments.length, path = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    path[_key - 1] = arguments[_key];
  }

  return path.reduce(function (memo, name) {
    return Array.isArray(name) ? get.apply(undefined, [memo].concat(_toConsumableArray(name))) : isEmpty(name) ? memo : memo && memo[name];
  }, obj);
}

exports.default = get;
module.exports = exports["default"];
//# sourceMappingURL=get.js.map