"use strict";

/* eslint no-void: 0 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = reduxApi;

var _reducerFn = require("./reducerFn");

var _reducerFn2 = _interopRequireDefault(_reducerFn);

var _actionFn = require("./actionFn");

var _actionFn2 = _interopRequireDefault(_actionFn);

var _transformers = require("./transformers");

var _transformers2 = _interopRequireDefault(_transformers);

var _async = require("./async");

var _async2 = _interopRequireDefault(_async);

var _cache = require("./utils/cache");

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// export { transformers, async };

/**
 * Default configuration for each endpoint
 * @type {Object}
 */
var defaultEndpointConfig = {
  transformer: _transformers2.default.object
};

var PREFIX = "@@redux-api";
/**
 * Entry api point
 * @param {Object} config Rest api configuration
 * @param {Object} baseConfig baseConfig settings for Rest api
 * @param {Function} fetch Adapter for rest requests
 * @param {Boolean} isServer false by default (fif you want to use it for isomorphic apps)
 * @return {actions, reducers}        { actions, reducers}
 * @example ```js
 *   const api = reduxApi({
 *     test: "/plain/url",
 *     testItem: "/plain/url/:id",
 *     testModify: {
 *       url: "/plain/url/:endpoint",

 *       transformer: (data)=> !data ?
 *          { title: "", message: "" } :
 *          { title: data.title, message: data.message },
 *       options: {
 *         method: "post"
 *         headers: {
 *           "Accept": "application/json",
 *           "Content-Type": "application/json"
 *         }
 *       }
 *     }
 *   });
 *   // register reducers
 *
 *   // call actions
 *   dispatch(api.actions.test());
 *   dispatch(api.actions.testItem({id: 1}));
 *   dispatch(api.actions.testModify({endpoint: "upload-1"}, {
 *     body: JSON.stringify({title: "Hello", message: "World"})
 *   }));
 * ```
 */

function reduxApi(config, baseConfig) {
  config || (config = {});

  var fetchHolder = {
    fetch: null,
    server: false,
    rootUrl: null,
    middlewareParser: null,
    options: {},
    responseHandler: null
  };

  var cfg = {
    use: function use(key, value) {
      fetchHolder[key] = value;

      return this;
    },
    init: function init(fetch) {
      var isServer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var rootUrl = arguments[2];

      /* eslint no-console: 0 */
      console.warn("Deprecated method, use `use` method");
      this.use("fetch", fetch);
      this.use("server", isServer);
      this.use("rootUrl", rootUrl);
      return this;
    },

    actions: {},
    reducers: {},
    events: {}
  };
  function fnConfigCallback(memo, value, key) {
    var opts = (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" ? _extends({}, defaultEndpointConfig, { reducerName: key }, value) : _extends({}, defaultEndpointConfig, { reducerName: key, url: value });

    if (opts.broadcast !== void 0) {
      /* eslint no-console: 0 */
      console.warn("Deprecated `broadcast` option. you shoud use `events`" + "to catch redux-api events (see https://github.com/lexich/redux-api/blob/master/DOCS.md#Events)");
    }

    var url = opts.url,
        urlOptions = opts.urlOptions,
        options = opts.options,
        transformer = opts.transformer,
        broadcast = opts.broadcast,
        crud = opts.crud,
        reducerName = opts.reducerName,
        prefetch = opts.prefetch,
        postfetch = opts.postfetch,
        validation = opts.validation,
        helpers = opts.helpers;


    var prefix = baseConfig && baseConfig.prefix || "";

    var ACTIONS = {
      actionFetch: PREFIX + "@" + prefix + reducerName,
      actionSuccess: PREFIX + "@" + prefix + reducerName + "_success",
      actionFail: PREFIX + "@" + prefix + reducerName + "_fail",
      actionReset: PREFIX + "@" + prefix + reducerName + "_delete",
      actionCache: PREFIX + "@" + prefix + reducerName + "_cache",
      actionAbort: PREFIX + "@" + prefix + reducerName + "_abort"
    };

    var fetch = opts.fetch ? opts.fetch : function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return fetchHolder.fetch.apply(this, args);
    };

    var meta = {
      holder: fetchHolder,
      virtual: !!opts.virtual,
      actions: memo.actions,
      cache: (0, _cache2.default)(opts.cache),
      urlOptions: urlOptions,
      fetch: fetch,
      broadcast: broadcast,
      reducerName: reducerName,
      prefetch: prefetch,
      postfetch: postfetch,
      validation: validation,
      helpers: helpers,
      transformer: transformer,
      prefix: prefix,
      crud: crud
    };

    memo.actions[key] = (0, _actionFn2.default)(url, key, options, ACTIONS, meta);

    if (!meta.virtual && !memo.reducers[reducerName]) {
      var data = transformer();
      var sync = false;
      var syncing = false;
      var loading = false;
      var initialState = opts.cache ? { sync: sync, syncing: syncing, loading: loading, data: data, cache: {} } : { sync: sync, syncing: syncing, loading: loading, data: data };

      var reducer = opts.reducer ? opts.reducer.bind(memo) : null;
      memo.reducers[reducerName] = (0, _reducerFn2.default)(initialState, ACTIONS, reducer);
    }
    memo.events[reducerName] = ACTIONS;
    return memo;
  }

  return Object.keys(config).reduce(function (memo, key) {
    return fnConfigCallback(memo, config[key], key, config);
  }, cfg);
}

reduxApi.transformers = _transformers2.default;
reduxApi.async = _async2.default;
module.exports = exports["default"];
//# sourceMappingURL=index.js.map