# Electron Scroller

Electron Scroller is a package designed to manage scrolling of historical pages
in `<webview>` tags.  Webviews in electron manage page history, offering forward
and back, but when navigating to the pages, the scroll position is lost.  This
package allows you to maintain the scroll position and automatically reposition
the page to the proper scroll position upon navigation (back, forward, reload).

## Installation
To install Electron Scroller, use [npm](https://docs.npmjs.com/).  The preferred
method is to install Electron Scroller as an dependency in your app:

```sh
npm install --save electron-scroller
```

## Quick Start
It is necessary to include Electron Scroller in two places in your app:
1. In your render javascript (called via a `<script>` in the HTML source)
1. In the preload file (specified in the `<webview preload="file.js"`)

### Example HTML
```HTML
<!DOCTYPE html>
<html>
<head>
  <title>Browser</title>
</head>
<body>
  <div id="buttonBar">
    ...
  </div>
  <div id="browser">
    <webview id="browserView" preload="preload.js"></webview>
  </div>
  <script src="browser.js"></script>
</body>
</html>
```

### Render Javascript
Require the package and use the `add()` method. Pass to `add()` a string
containing a single
[CSS selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
that describes the specific webview to be managed. If only a single webview
exists, the selector is not required. Because the Scroller hooks
into the methods of the webview, it may be best to call `add()` early in the
process and before configuring the webview. In this example, in the file
`browser.js`:

```javascript
const scroller = require('electron-scroller')

let selector = '#browserView'
scroller.add(selector)
```

### Preload Javascript
The Scroller has to be included in the preload file, calling the `preload()`
method and again specifying the webview to be managed via a CSS selector. If
only a single webview exists, it is not necessary to pass the selector.  In this
example, in the file `preload.js`:

```javascript
const scroller = require('electron-scroller')
scroller.preload('#browserView')
```

# License
[ISC](https://opensource.org/licenses/ISC)
