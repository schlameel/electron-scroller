/**
*  index.js - base file for electron-scroller
*
*  @author John McCormick
*  @version 0.5.0
*  @module electron-scroller
*  @license ISC
*/

'use strict'

const { EVENTS, NAVTYPE } = require('./constants')

function ScrollTracker(selector) {
  var self = this
  this.selector = selector
  this.details = []
  this.index = -1
  this.motion = NAVTYPE.NEW_PAGE
}

ScrollTracker.prototype.forward = function () {
  this.index += 1
  if (this.index >= this.details.length) {
    this.index = this.details.length - 1
  }
  this.motion = NAVTYPE.FORWARD
}

ScrollTracker.prototype.back = function () {
  if (this.index > 0) this.index -= 1
  this.motion = NAVTYPE.BACK
}

ScrollTracker.prototype.reload = function () {
  this.motion = NAVTYPE.RELOAD
}

ScrollTracker.prototype.setScrollPosition = function (position) {
  try {
    this.details[this.index].position = position
  } catch (e) {
    throw Error(`Unable to set scroll position:\n${e}`)
  }
}

ScrollTracker.prototype.getScrollPosition = function () {
  try {
    let position = this.details[this.index].position
    return (position) ? position : { x: 0, y:0 }
  } catch (e) {
    throw Error(`electron-scroller unable to get scroll position:\n${e}`)
  }
  return position
}

ScrollTracker.prototype.didNavigate = function (url) {
  if (this.motion === NAVTYPE.NEW_PAGE) {
    this.index += 1
    if (this.index < this.details.length) {
      this.details = this.details.slice(0, this.index)
    }
    this.details.push({ url: url })
  }
  this.motion = NAVTYPE.NEW_PAGE
}

ScrollTracker.prototype.didScroll = function (position) {
  this.setScrollPosition(position)
}

module.exports = ScrollTracker
