"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = urlTransform;

var _qs = require("qs");

var _qs2 = _interopRequireDefault(_qs);

var _url = require("url");

var _omit = require("./utils/omit");

var _omit2 = _interopRequireDefault(_omit);

var _merge = require("./utils/merge");

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-useless-escape: 0 */
var rxClean = /(\(:[^\)]+\)|:[^\/]+)/g;

/**
 * Url modification
 * @param  {String} url     url template
 * @param  {Object} params  params for url template
 * @param  {Object} options transformation options, accepts +delimiter+, +arrayFormat+,
 *                          +qsStringifyOptions+ and +qsParseOptions+
 * @return {String}         result url
 */
function urlTransform(url, params, options) {
  if (!url) {
    return "";
  }
  params || (params = {});
  var usedKeys = {};

  var urlWithParams = Object.keys(params).reduce(function (url, key) {
    var value = params[key];
    var rx = new RegExp("(\\(:" + key + "\\)|:" + key + ")", "g");
    return url.replace(rx, function () {
      usedKeys[key] = value;
      return value;
    });
  }, url);

  if (!urlWithParams) {
    return urlWithParams;
  }

  var _parse = (0, _url.parse)(urlWithParams),
      protocol = _parse.protocol,
      host = _parse.host,
      path = _parse.path;

  var cleanURL = host ? protocol + "//" + host + path.replace(rxClean, "") : path.replace(rxClean, "");
  var usedKeysArray = Object.keys(usedKeys);
  if (usedKeysArray.length !== Object.keys(params).length) {
    var urlObject = cleanURL.split("?");
    options || (options = {});
    var _options = options,
        arrayFormat = _options.arrayFormat,
        delimiter = _options.delimiter;

    var qsParseOptions = _extends({
      arrayFormat: arrayFormat,
      delimiter: delimiter
    }, options.qsParseOptions);
    var mergeParams = (0, _merge2.default)(urlObject[1] && _qs2.default.parse(urlObject[1], qsParseOptions), (0, _omit2.default)(params, usedKeysArray));
    var qsStringifyOptions = _extends({
      arrayFormat: arrayFormat,
      delimiter: delimiter
    }, options.qsStringifyOptions);
    var urlStringParams = _qs2.default.stringify(mergeParams, qsStringifyOptions);
    return urlObject[0] + "?" + urlStringParams;
  }
  return cleanURL;
}
module.exports = exports["default"];
//# sourceMappingURL=urlTransform.js.map