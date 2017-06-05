"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchResolver;
function none() {}

function fetchResolver() {
  var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : none;

  if (!opts.prefetch || index >= opts.prefetch.length) {
    cb();
  } else {
    opts.prefetch[index](opts, function (err) {
      return err ? cb(err) : fetchResolver(index + 1, opts, cb);
    });
  }
}
module.exports = exports["default"];
//# sourceMappingURL=fetchResolver.js.map