"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (object, props) {
  if (!Array.isArray(props)) {
    return _extends({}, object);
  }

  return Object.keys(object || {}).reduce(function (memo, key) {
    if (props.indexOf(key) === -1) {
      memo[key] = object[key];
    }
    return memo;
  }, {});
};

module.exports = exports["default"];
//# sourceMappingURL=omit.js.map