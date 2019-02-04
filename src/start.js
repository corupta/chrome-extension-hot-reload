const reload = (ports, dbg) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
  Object.keys(ports)
    .filter((name) => ports.hasOwnProperty(name))
    .forEach((name) => {
      const port = ports[name];
      if (dbg) {
        console.log('sending signal to port', name);
      }
      port.postMessage('hot_reload_signal');
    });
};

const start = (options = {}) => {
  const ports = {};
  options.retryTime = options.retryTime || 1000;
  options.dbg = options.dbg || false;
  let previousTimestamp = null, rootDir = null;
  const getTimeStamp = () => new Promise((resolve) =>
    rootDir.createReader().readEntries(
      (entries) => Promise.all(
        entries.filter((e) => e.name[0] !== '.')
          .map((e) => e.isDirectory
            ? getTimeStamp(e)
            : new Promise((innerResolve) => e.file(innerResolve))
          )
      )
        .then((files) => resolve(
          files.reduce((acc, { name, lastModifiedDate }) => `${acc}${name}${lastModifiedDate}`, '')
        ))
    )
  );
  const retry = (dir) =>
    getTimeStamp(dir)
      .then((nextTimestamp) => {
        if (previousTimestamp && nextTimestamp !== previousTimestamp) {
          reload(ports);
        }
        previousTimestamp = nextTimestamp;
      });

  chrome.management.getSelf((self) => {
    if (self.installType === 'development') {
      chrome.runtime.getPackageDirectoryEntry((dir) => {
        rootDir = dir;
        setInterval(retry, options.retryTime);
      });
      chrome.runtime.onConnect.addListener((port) => {
        ports[port.name] = port;
        if (options.dbg) {
          console.log('port', port.name, 'is connected.');
        }
        port.onDisconnect.addListener(() => {
          delete ports[port.name];
          if (options.dbg) {
            console.log('port', port.name, 'is disconnected.');
          }
        });
      });
    }
  });
};

export default start;
