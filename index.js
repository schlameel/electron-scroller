'use strict'

const {ipcRenderer} = require('electron')
const ScrollTracker = require('./lib/ScrollTracker')
const { NAVTYPE } = require('./lib/constants')

var scroller = {
  trackers: new Map(),
  motion: NAVTYPE.NEW_PAGE
}

// Connect scroller to a webview
scroller.add = function (selector) {
  let self = this
  selector = selector || 'webview'
  let webview = document.querySelector(selector)
  if (webview === null || !isElement(webview)) {
    let msg = `Unable to find <webview> with selector = "${selector}".`
    throw new ReferenceError(msg)
  }
  if (this.trackers.get(selector) !== undefined) {
    let msg = `A webview with the selector "${selector}"`
    msg += ` is already being tracked`
    throw new DuplicateError(msg)
  }
  let tracker = new ScrollTracker(selector)
  this.trackers.set(selector, tracker)

  // Set up webview event listeners
  webview.addEventListener('ipc-message', function(e) {
    if (e.channel === EVENTS.DID_SCROLL) {
      let data = e.args[0]
      if (data.selector === selector) {
        self.didScroll.call(self, selector, data.position)
      }
    }
  })
  webview.addEventListener('did-navigate', function() {
    self.didNavigate.call(self, selector)
  })
  //webview.addEventListener('did-navigate-in-page', function() {
  //  Currently unused
  //})
  webview.addEventListener('did-finish-load', function () {
    if (self.motion !== NAVTYPE.NEW_PAGE) {
      let position = tracker.getScrollPosition()
      webview.send(EVENTS.SCROLL_TO, position)
      self.motion = NAVTYPE.NEW_PAGE
    }
  })

  // Hook into the webview navigation functions
  let webviewGoBack = webview.goBack
  webview.goBack = function () {
    tracker.back()
    webviewGoBack.call(webview)/
    self.motion = NAVTYPE.BACK/
  }/
  let webviewGoForward = webview.goForward/
  webview.goForward = function () {
    tracker.forward()
    webviewGoForward.call(webview)
    self.motion = NAVTYPE.FORWARD
  }
  let webviewReload = webview.reload
  webview.reload = function () {
    tracker.reload()
    webviewReload.call(webview)
    self.motion = NAVTYPE.RELOAD
  }
}

//
// Event Handlers
//
scroller.didScroll = function (selector, position) {
  this.trackers.get(selector).didScroll(position)
}

scroller.didNavigate = function (selector) {
  let webview = document.querySelector(`webview#${selector}`)
  let tracker = this.trackers.get(selector)
  tracker.didNavigate(webview.getURL())
}

//
// Preload Method
//
scroller.preload = function (selector) {
  selector = selector || 'webview'
  document.addEventListener("DOMContentLoaded", function() {
    window.addEventListener('scroll', function(event) {
      ipcRenderer.sendToHost(EVENTS.DID_SCROLL, {
        selector: selector,
        position: {
          x: window.scrollX,
          y: window.scrollY
        }
      })
    })
  })
  ipcRenderer.on(EVENTS.SCROLL_TO, function (event, position) {
    window.scrollTo(position.x, position.y)
    ipcRenderer.sendToHost(EVENTS.DID_SCROLL_TO, { selector: selector, position: position })
  })
}

//
//  Error Declarations
//
function DuplicateError(message) {
  this.name = 'DuplicateError'
  this.message = message
  this.stack = (new Error()).stack
}
DuplicateError.prototype = new Error

//
// Utility Functions
//
function isElement(obj) {
  try {
    return obj instanceof HTMLElement
  } catch (e) {
    return (typeof obj === 'object') &&
    (obj.nodeType === 1) && (typeof obj.style === "object") &&
    (typeof obj.ownerDocument === "object")
  }
}

module.exports = scroller
