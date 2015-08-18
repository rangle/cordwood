'use strict';
var readService = require('./read-service');
var constants = require('./constants');
var utils = require('./utils');
var logger = require('./logger');

/* Read and Load Files
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var bootstrap = {};

/**
 * The success/error callbacks are those defined in the options passed to
 * Cordwood.
 * @param successCallback : The callback used once the initialization process
 * has completed. Probably, this would start the angular app that was loaded.
 * @param errorCallback : The callback used if initialization fails. Probably,
 * this would show an error page.
 **/
bootstrap.setup = function (successCallback, errorCallback) {
  this.successCallback = successCallback;
  this.errorCallback = errorCallback;
};

/**
 * Kick off the process of putting the js/css files for a version of the app
 * into the DOM.
 * @param version : The version of the app to load.
 **/
bootstrap.init = function (version) {
  var files = [
    version + '_' + constants.JS_FILE_NAME,
    constants.CSS_DIRECTORY + version + '_' + constants.CSS_FILE_NAME
  ];

  readService.setup(injectAllFiles, errorReadingFiles);
  readService.readFiles(files);
};

/**
 * Given the URL to a resource; if it has a js or css file extension, add a DOM
 * node for that resource to the head of the document.
 * @param url : The native URL for a js or css file to be included in the document.
 **/
bootstrap.injectFile = function (url) {
  if (utils.hasFileExtension(url, 'js')) {
    // Create script tag for JS file
    var fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', url);
  } else if (utils.hasFileExtension(url, 'css')) {
    // Create stylesheet tag for CSS file
    fileref = document.createElement('link');
    fileref.setAttribute('rel', 'stylesheet');
    fileref.setAttribute('type', 'text/css');
    fileref.setAttribute('href', url);
  } else {
    // It shouldn't be the case that something that is neither JS or CSS
    // happens, but if it does, skip out, since there's nothing to add to the
    // DOM.
    return;
  }

  // Attach the tag to the head
  document.getElementsByTagName('head')[0].appendChild(fileref);
};

/**
 * Callback function for handling the injection of files into the DOM. This
 * callback is invoked when the read service has successfully read all of the
 * files; and once this callback completes, the overall success callback is
 * invoked.
 * @param files : The list of file items to be injected.
 **/
function injectAllFiles(files) {
  logger('files', files);
  for (var i = 0; i < files.length; i++) {
    var fileEntry = files[i].fileEntry;
    bootstrap.injectFile(fileEntry.nativeURL);
  }

  setTimeout(bootstrap.successCallback, 500);
}

/**
 * The callback used by the read service if there was a problem reading the
 * files.
 **/
function errorReadingFiles(error) {
  logger(error);
  bootstrap.errorCallback();
}

// Expose these methods for unit testing.
bootstrap._injectAllFiles = injectAllFiles;
bootstrap._errorReadingFiles = errorReadingFiles;
module.exports = bootstrap;
