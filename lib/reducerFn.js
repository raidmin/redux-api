"use strict";

/* eslint no-case-declarations: 0 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports.default = reducerFn;

var _cache = require("./utils/cache");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

/**
 * Reducer contructor
 * @param  {Object}   initialState default initial state
 * @param  {Object}   actions      actions map
 * @param  {Function} transformer  transformer function
 * @param  {Function} reducer      custom reducer function
 * @return {Function}              reducer function
 */
function reducerFn(initialState) {
  var actions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var reducer = arguments[2];
  var actionFetch = actions.actionFetch,
      actionSuccess = actions.actionSuccess,
      actionFail = actions.actionFail,
      actionReset = actions.actionReset,
      actionCache = actions.actionCache,
      actionAbort = actions.actionAbort;

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
      case actionFetch:
        return state.merge({
          loading: true,
          error: null,
          syncing: !!action.syncing
        });
      case actionSuccess:
        return state.merge({
          loading: false,
          sync: true,
          syncing: false,
          error: null,
          data: action.data
        });
      case actionFail:
        return state.merge({
          loading: false,
          error: action.error,
          syncing: false
        });
      case actionReset:
        var mutation = action.mutation;

        return mutation === "sync" ? state.merge({ sync: false }) : state.merge(initialState);
      case actionAbort:
        return state.merge({ loading: false, syncing: false, error: action.error });
      case actionCache:
        var id = action.id,
            data = action.data;

        var cacheExpire = state.cache[id] ? state.cache[id].expire : null;
        var expire = (0, _cache.setExpire)(action.expire, cacheExpire);
        return _extends({}, state, {
          cache: _extends({}, state.cache, _defineProperty({}, id, { expire: expire, data: data }))
        });
      default:
        return reducer ? reducer(state, action) : state;
    }
  };
}
module.exports = exports["default"];
//# sourceMappingURL=reducerFn.js.map
//# sourceMappingURL=reducerFn.js.map