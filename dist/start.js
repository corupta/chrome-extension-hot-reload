"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var reload = function reload(ports, dbg) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
  Object.keys(ports).filter(function (name) {
    return ports.hasOwnProperty(name);
  }).forEach(function (name) {
    var port = ports[name];

    if (dbg) {
      console.log('sending signal to port', name);
    }

    port.postMessage('hot_reload_signal');
  });
};

var start = function start() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ports = {};
  options.retryTime = options.retryTime || 1000;
  options.dbg = options.dbg || false;
  var previousTimestamp = null;

  var getTimeStamp = function getTimeStamp(dir) {
    return dir.createReader().readEntries(function (entries) {
      return Promise.all(entries.filter(function (e) {
        return e.name[0] !== '.';
      }).map(function (e) {
        return e.isDirectory ? getTimeStamp(e) : new Promise(function (resolve) {
          return e.file(resolve);
        });
      }));
    }).then(function (files) {
      return files.reduce(function (acc, _ref) {
        var name = _ref.name,
            lastModifiedDate = _ref.lastModifiedDate;
        return "".concat(acc).concat(name).concat(lastModifiedDate);
      }, '');
    });
  };

  var retry = function retry(dir) {
    return getTimeStamp(dir).then(function (nextTimestamp) {
      if (previousTimestamp && nextTimestamp !== previousTimestamp) {
        reload(ports);
      }

      previousTimestamp = nextTimestamp;
    });
  };

  chrome.management.getSelf(function (self) {
    if (self.installType === 'development') {
      chrome.runtime.getPackageDirectoryEntry(retry);
      chrome.runtime.onConnect.addListener(function (port) {
        ports[port.name] = port;

        if (options.dbg) {
          console.log('port', port.name, 'is connected.');
        }

        port.onDisconnect.addListener(function () {
          delete ports[port.name];

          if (options.dbg) {
            console.log('port', port.name, 'is disconnected.');
          }
        });
      });
    }
  });
};

var _default = start;
exports.default = _default;