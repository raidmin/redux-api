"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = async;
/**
 *
 * @param  {[type]}    dispatch [description]
 * @param  {...[type]} args     [description]
 * @return {[type]}             [description]
 * @example
 * async(dispatch,
 *   cb=> actions.test(1, cb),
 *   actions.test2
 * ).then(()=> async(dispatch, actions.test3))
 */
function async(dispatch) {
  for (var _len = arguments.length, restFunctions = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    restFunctions[_key - 2] = arguments[_key];
  }

  var currentFunction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  return new Promise(function (resolve, reject) {
    if (!currentFunction) {
      reject("no chain function");
    } else {
      dispatch(currentFunction(function (err, data) {
        err ? reject(err) : resolve(data);
      }) || {});
    }
  }).then(function (data) {
    if (restFunctions.length) {
      return async.apply(undefined, [dispatch].concat(restFunctions));
    } else {
      return data;
    }
  });
}
module.exports = exports["default"];
//# sourceMappingURL=async.js.map