# Chrome Extension Hot Reload

This is an npm package that can be imported in `background.js` and `popup.js` files to make hot reloading possible in extensions.

### Using this package, extensions' popups can be hot reloaded without having to close them!

#### Special Thanks to [xpl](https://github.com/xpl) since this package is initially based on his/her package [crx-hotreload](https://github.com/xpl/crx-hotreload) for timestamp retrieval and main ideas.


## Install

Install it via `npm install --save chrome-extension-hot-reload`

## Usage

In your `background.js` script add the following in top
```js
import HotReload from 'chrome-extension-hot-reload';
HotReload.start();
```

In your `popup.js` script add the following in top
```js
import HotReload from 'chrome-extension-hot-reload';
HotReload.connect();
```

#### You should NOT call `connect`  in options page or content scripts, they should already work automatically if you have called `start` in background script.

Alternatively, (if you don't want to import both the start & connect scripts in both background and popup files you can import them separately as in below)

```js
import start from 'chrome-extension-hot-reload/dist/start';
start();
```
```js
import connect from 'chrome-extension-hot-reload/dist/connect';
connect();
```

Alternatively, if you prefer ES5, you can import the module as in below (all of them should work)
```js
const HotReload = require("chrome-extension-hot-reload");
const start = require("chrome-extension-hot-reload/dist/start");
const connect = require("chrome-extension-hot-reload/dist/connect");
```

## Configuration

In the `connect` method you can pass an `options` object to pass custom configurations.

```js
import HotReload from 'chrome-extension-hot-reload';
HotReload.connect({
  // the milliseconds for which the script re-checks for file changes
  // by default, the script re-checks for every 1 second (1000 milliseconds)     
  retryTime: 1000,
  // whether to output popup connect logs (debug logs), by default it is false
  dbg: false
});
```

## Features

*   Reloads tabs just as [crx-hotreload](https://github.com/xpl/crx-hotreload).
*   Doesn't close `popup` / `options` page (doesn't force reloads the extension)
*   Using only in `background.js` is enough for hot reloading options page
*   Can also hot reload popups, using `start/connect` syntax (even if you do not have a `background script`, in order to get hot reloading in popups, you should create a `background script` file in which you call `start`)


