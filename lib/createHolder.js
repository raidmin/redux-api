"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var data = void 0;
  var hasData = false;
  return {
    set: function set(val) {
      if (!hasData) {
        data = val;
        hasData = true;
        return true;
      }
      return false;
    },
    empty: function empty() {
      return !hasData;
    },
    pop: function pop() {
      if (hasData) {
        hasData = false;
        var result = data;
        data = null;
        return result;
      }
    }
  };
};

module.exports = exports["default"];
//# sourceMappingURL=createHolder.js.map