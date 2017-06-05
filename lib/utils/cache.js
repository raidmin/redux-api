"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setExpire = setExpire;
exports.getCacheManager = getCacheManager;

exports.default = function (cache) {
  if (!cache) {
    return null;
  }
  if (cache === true) {
    return Manager;
  } else {
    return _extends({}, Manager, cache);
  }
};

var MockNowDate = exports.MockNowDate = {
  date: undefined,
  push: function push(date) {
    this.date = date;
  },
  pop: function pop() {
    if (this.date) {
      var d = this.date;
      this.date = undefined;
      return new Date(d);
    } else {
      return new Date();
    }
  }
};

var Manager = exports.Manager = {
  expire: false,
  getData: function getData(cache) {
    if (!cache) {
      return;
    }
    var expire = cache.expire,
        data = cache.data;

    if (expire === false || expire === undefined || expire === null) {
      return data;
    }
    if (expire instanceof Date) {
      if (expire.valueOf() > MockNowDate.pop().valueOf()) {
        return data;
      }
    }
  },
  id: function id(params) {
    if (!params) {
      return "";
    }
    return Object.keys(params).reduce(function (memo, key) {
      return memo + (key + "=" + params[key] + ";");
    }, "");
  }
};

function setExpire(value, oldDate) {
  var expire = value;
  if (typeof expire === "number" || expire instanceof Number) {
    var d = MockNowDate.pop();
    d.setSeconds(d.getSeconds() + expire);
    expire = d;
  }
  if (oldDate instanceof Date && expire instanceof Date) {
    if (expire.valueOf() < oldDate.valueOf()) {
      expire = oldDate;
    }
  }
  return expire;
}

function getCacheManager(expire, cache) {
  if (expire !== undefined) {
    var ret = _extends({}, Manager, cache);
    if (ret.expire !== false) {
      ret.expire = setExpire(expire, ret.expire);
    }
    return ret;
  } else if (cache) {
    return _extends({}, Manager, cache);
  } else {
    return null;
  }
}
//# sourceMappingURL=cache.js.map