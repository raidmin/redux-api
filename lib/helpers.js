"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.none = none;
exports.extractArgs = extractArgs;
exports.helperCrudFunction = helperCrudFunction;
exports.defaultMiddlewareArgsParser = defaultMiddlewareArgsParser;
function none() {}

function extractArgs(args) {
  var pathvars = void 0;
  var params = {};
  var callback = void 0;
  if (args[0] instanceof Function) {
    callback = args[0];
  } else if (args[1] instanceof Function) {
    pathvars = args[0];
    callback = args[1];
  } else {
    pathvars = args[0];
    params = args[1];
    callback = args[2] || none;
  }
  return [pathvars, params, callback];
}

function helperCrudFunction(name) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _extractArgs = extractArgs(args),
        _extractArgs2 = _slicedToArray(_extractArgs, 3),
        pathvars = _extractArgs2[0],
        params = _extractArgs2[1],
        cb = _extractArgs2[2];

    return [pathvars, _extends({}, params, { method: name.toUpperCase() }), cb];
  };
}

function defaultMiddlewareArgsParser(dispatch, getState) {
  return { dispatch: dispatch, getState: getState };
}

var CRUD = exports.CRUD = ["get", "post", "put", "delete", "patch"].reduce(function (memo, name) {
  memo[name] = helperCrudFunction(name);
  return memo;
}, {});
//# sourceMappingURL=helpers.js.map