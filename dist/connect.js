"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var connect = function connect() {
  var name = "popup_".concat(Math.floor(Math.random() * 10000));
  var port = chrome.runtime.connect({
    name: name
  });
  port.onMessage.addListener(function (msg) {
    if (msg === 'hot_reload_signal') {
      window.location.reload(false);
    }
  });
};

var _default = connect;
exports.default = _default;