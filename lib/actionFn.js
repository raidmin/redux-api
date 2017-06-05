"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = actionFn;

var _fastApply = require("fast-apply");

var _fastApply2 = _interopRequireDefault(_fastApply);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _urlTransform = require("./urlTransform");

var _urlTransform2 = _interopRequireDefault(_urlTransform);

var _merge = require("./utils/merge");

var _merge2 = _interopRequireDefault(_merge);

var _get = require("./utils/get");

var _get2 = _interopRequireDefault(_get);

var _fetchResolver = require("./fetchResolver");

var _fetchResolver2 = _interopRequireDefault(_fetchResolver);

var _PubSub = require("./PubSub");

var _PubSub2 = _interopRequireDefault(_PubSub);

var _createHolder = require("./createHolder");

var _createHolder2 = _interopRequireDefault(_createHolder);

var _helpers = require("./helpers");

var _cache = require("./utils/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Constructor for create action
 * @param  {String} url          endpoint's url
 * @param  {String} name         action name
 * @param  {Object} options      action configuration
 * @param  {Object} ACTIONS      map of actions
 * @param  {[type]} fetchAdapter adapter for fetching data
 * @return {Function+Object}     action function object
 */
function actionFn(url, name, options) {
  var ACTIONS = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var meta = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var actionFetch = ACTIONS.actionFetch,
      actionSuccess = ACTIONS.actionSuccess,
      actionFail = ACTIONS.actionFail,
      actionReset = ACTIONS.actionReset,
      actionCache = ACTIONS.actionCache,
      actionAbort = ACTIONS.actionAbort;

  var pubsub = new _PubSub2.default();
  var requestHolder = (0, _createHolder2.default)();

  function getOptions(urlT, params, getState) {
    var globalOptions = !meta.holder ? {} : meta.holder.options instanceof Function ? meta.holder.options(urlT, params, getState) : meta.holder.options;
    var baseOptions = !(options instanceof Function) ? options : options(urlT, params, getState);
    return (0, _merge2.default)({}, globalOptions, baseOptions, params);
  }

  function getUrl(pathvars, params, getState) {
    var resultUrlT = (0, _urlTransform2.default)(url, pathvars, meta.urlOptions);
    var urlT = resultUrlT;
    var rootUrl = (0, _get2.default)(meta, "holder", "rootUrl");
    rootUrl = !(rootUrl instanceof Function) ? rootUrl : rootUrl(urlT, params, getState);
    if (rootUrl) {
      var rootUrlObject = _url2.default.parse(rootUrl);
      var urlObject = _url2.default.parse(urlT);
      if (!urlObject.host) {
        var urlPath = (rootUrlObject.path ? rootUrlObject.path.replace(/\/$/, "") : "") + "/" + (urlObject.path ? urlObject.path.replace(/^\//, "") : "");
        urlT = rootUrlObject.protocol + "//" + rootUrlObject.host + urlPath;
      }
    }
    return urlT;
  }

  function fetch(pathvars, params) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var getState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _helpers.none;
    var dispatch = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _helpers.none;

    var urlT = getUrl(pathvars, params, getState);
    var opts = getOptions(urlT, params, getState);
    var id = meta.reducerName || "";
    var cacheManager = (0, _cache.getCacheManager)(options.expire, meta.cache);

    if (cacheManager && getState !== _helpers.none) {
      var state = getState();
      var cache = (0, _get2.default)(state, meta.prefix, meta.reducerName, "cache");
      id += "_" + cacheManager.id(pathvars, params);
      var data = cacheManager.getData(cache && id && cache[id] !== undefined && cache[id]);
      if (data !== undefined) {
        return Promise.resolve(data);
      }
    }
    var response = meta.fetch(urlT, opts);
    if (cacheManager && dispatch !== _helpers.none && id) {
      response.then(function (data) {
        dispatch({ type: actionCache, id: id, data: data, expire: cacheManager.expire });
      });
    }
    return response;
  }

  function abort() {
    var defer = requestHolder.pop();
    var err = new Error("Application abort request");
    defer && defer.reject(err);
    return err;
  }

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} getState    helper meta function
  */
  function request(pathvars, params, options) {
    var getState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _helpers.none;
    var dispatch = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _helpers.none;

    var response = fetch(pathvars, params, options, getState, dispatch);
    var result = !meta.validation ? response : response.then(function (data) {
      return new Promise(function (resolve, reject) {
        return meta.validation(data, function (err) {
          return err ? reject(err) : resolve(data);
        });
      });
    });
    var ret = result;
    var responseHandler = (0, _get2.default)(meta, "holder", "responseHandler");
    if (responseHandler) {
      if (result && result.then) {
        ret = result.then(function (data) {
          var res = responseHandler(null, data);
          if (res === undefined) {
            return data;
          } else {
            return res;
          }
        }, function (err) {
          return responseHandler(err);
        });
      } else {
        ret = responseHandler(result);
      }
    }
    ret && ret.catch && ret.catch(_helpers.none);
    return ret;
  }

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} callback)   callback execute after end request
   */
  function fn() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _extractArgs = (0, _helpers.extractArgs)(args),
        _extractArgs2 = _slicedToArray(_extractArgs, 3),
        pathvars = _extractArgs2[0],
        params = _extractArgs2[1],
        callback = _extractArgs2[2];

    var syncing = params ? !!params.syncing : false;
    params && delete params.syncing;
    pubsub.push(callback);
    return function () {
      var middlewareParser = (0, _get2.default)(meta, "holder", "middlewareParser") || _helpers.defaultMiddlewareArgsParser;

      var _middlewareParser = middlewareParser.apply(undefined, arguments),
          dispatch = _middlewareParser.dispatch,
          getState = _middlewareParser.getState;

      var state = getState();
      var isLoading = (0, _get2.default)(state, meta.prefix, meta.reducerName, "loading");
      if (isLoading) {
        return Promise.reject("isLoading");
      }
      var requestOptions = { pathvars: pathvars, params: params };
      var prevData = (0, _get2.default)(state, meta.prefix, meta.reducerName, "data");
      dispatch({ type: actionFetch, syncing: syncing, request: requestOptions });
      var fetchResolverOpts = {
        dispatch: dispatch,
        getState: getState,
        requestOptions: requestOptions,
        actions: meta.actions,
        prefetch: meta.prefetch
      };
      var result = new Promise(function (done, fail) {
        (0, _fetchResolver2.default)(0, fetchResolverOpts, function (err) {
          if (err) {
            pubsub.reject(err);
            return fail(err);
          }
          new Promise(function (resolve, reject) {
            requestHolder.set({
              resolve: resolve,
              reject: reject,
              promise: request(pathvars, params, {}, getState, dispatch).then(resolve, reject)
            });
          }).then(function (d) {
            requestHolder.pop();
            var data = meta.transformer(d, prevData, {
              type: actionSuccess, request: requestOptions
            });
            dispatch({
              data: data,
              origData: d,
              type: actionSuccess,
              syncing: false,
              request: requestOptions
            });
            if (meta.broadcast) {
              meta.broadcast.forEach(function (type) {
                dispatch({ type: type, data: data, origData: d, request: requestOptions });
              });
            }
            if (meta.postfetch) {
              meta.postfetch.forEach(function (postfetch) {
                postfetch instanceof Function && postfetch({
                  data: data, getState: getState, dispatch: dispatch, actions: meta.actions, request: requestOptions
                });
              });
            }
            pubsub.resolve(data);
            done(data);
          }, function (error) {
            dispatch({
              error: error,
              type: actionFail,
              loading: false,
              syncing: false,
              request: requestOptions
            });
            pubsub.reject(error);
            fail(error);
          });
        });
      });
      result.catch(_helpers.none);
      return result;
    };
  }

  /*
    Pure rest request
   */
  fn.request = function (pathvars, params, options) {
    return request(pathvars, params, options || {});
  };

  /**
   * Reset store to initial state
   */
  fn.reset = function (mutation) {
    abort();
    return mutation === "sync" ? { type: actionReset, mutation: mutation } : { type: actionReset };
  };

  /*
    Abort request
   */
  fn.abort = function () {
    var error = abort();
    return { type: actionAbort, error: error };
  };

  fn.force = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return function (dispatch, getState) {
      var state = getState();
      var isLoading = (0, _get2.default)(state, meta.prefix, meta.reducerName, "loading");
      if (isLoading) {
        dispatch(fn.abort());
      }
      return fn.apply(undefined, args)(dispatch, getState);
    };
  };

  /**
   * Sync store with server. In server mode works as usual method.
   * If data have already synced, data would not fetch after call this method.
   * @param  {Object} pathvars    path vars for url
   * @param  {Object} params      fetch params
   * @param  {Function} callback) callback execute after end request
   */
  fn.sync = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var _extractArgs3 = (0, _helpers.extractArgs)(args),
        _extractArgs4 = _slicedToArray(_extractArgs3, 3),
        pathvars = _extractArgs4[0],
        params = _extractArgs4[1],
        callback = _extractArgs4[2];

    var isServer = meta.holder ? meta.holder.server : false;
    return function (dispatch, getState) {
      var state = getState();
      var store = state[name];
      if (!isServer && store && store.sync) {
        callback(null, store.data);
        return;
      }
      var modifyParams = _extends({}, params, { syncing: true });
      return fn(pathvars, modifyParams, callback)(dispatch, getState);
    };
  };

  var helpers = meta.helpers || {};
  if (meta.crud) {
    helpers = _extends({}, _helpers.CRUD, helpers);
  }
  var fnHelperCallback = function fnHelperCallback(memo, func, helpername) {
    if (memo[helpername]) {
      throw new Error("Helper name: \"" + helpername + "\" for endpoint \"" + name + "\" has been already reserved");
    }

    var _ref = func instanceof Function ? { call: func } : func,
        sync = _ref.sync,
        call = _ref.call;

    memo[helpername] = function () {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return function (dispatch, getState) {
        var index = args.length - 1;
        var callbackFn = args[index] instanceof Function ? args[index] : _helpers.none;
        var helpersResult = (0, _fastApply2.default)(call, { getState: getState, dispatch: dispatch, actions: meta.actions }, args);
        var result = new Promise(function (resolve, reject) {
          var callback = function callback(err, data) {
            err ? reject(err) : resolve(data);
            callbackFn(err, data);
          };
          // If helper alias using async functionality
          if (helpersResult instanceof Function) {
            helpersResult(function (error) {
              var newArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

              if (error) {
                callback(error);
              } else {
                (0, _fastApply2.default)(sync ? fn.sync : fn, null, newArgs.concat(callback))(dispatch, getState);
              }
            });
          } else {
            // if helper alias is synchronous
            var _helpersResult = _slicedToArray(helpersResult, 2),
                pathvars = _helpersResult[0],
                params = _helpersResult[1];

            (0, _fastApply2.default)(sync ? fn.sync : fn, null, [pathvars, params, callback])(dispatch, getState);
          }
        });
        result.catch(_helpers.none);
        return result;
      };
    };
    return memo;
  };

  return Object.keys(helpers).reduce(function (memo, key) {
    return fnHelperCallback(memo, helpers[key], key, helpers);
  }, fn);
}
module.exports = exports["default"];
//# sourceMappingURL=actionFn.js.map