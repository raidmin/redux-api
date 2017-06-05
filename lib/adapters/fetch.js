"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (fetch) {
  return function (url, opts) {
    return fetch(url, opts).then(function (resp) {
      return toJSON(resp).then(function (data) {
        if (resp.status >= 200 && resp.status < 300) {
          return data;
        } else {
          return Promise.reject(data);
        }
      });
    });
  };
};

function toJSON(resp) {
  return resp.text().then(function (data) {
    try {
      return JSON.parse(data);
    } catch (err) {
      return data;
    }
  });
}

module.exports = exports["default"];
//# sourceMappingURL=fetch.js.map