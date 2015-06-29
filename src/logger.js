'use strict';
var constants = require('./constants');

/* Logger
–––––––––––––––––––––––––––––––––––––––––––––––––– */
/**
 * Log a message by passing the arguments through to console.info when in debug
 * mode.
 **/
var logger = function () {
  if (constants.DEBUG) {
    console.info.apply(console, arguments);
  }
};

module.exports = logger;
