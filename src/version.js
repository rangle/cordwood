'use strict';
var constants = require('./constants');
var logger = require('./logger');
var R = require('ramda');

/* Version Check
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var version = {};

/**
 * Retrieve the list of available versions from the specified URL.
 * If successful, run the callback and pass in the list of versions.
 * @param url : The URL where the versions list can be retrieved.
 * @param successCallback : The callback for when the version
 * request completes.
 * @param errorCallback : The callback for when the version request fails.
 */
version.fetchAllVersions = function (options) {
  var url = options.url;
  var successCallback = options.successCallback;
  var errorCallback = options.errorCallback;
  var versionsToFetch = options.versionsToFetch || constants.DEFAULT_VERSIONS_TO_FETCH;

function makeVersionExtractor(versionsToExtract) {
  return function extractVersions(allVersions) {
    var sortFn = R.compose(R.reverse, R.sortBy(R.prop('timestamp')));
    var sortedPrs;

    if (versionsToExtract.prs != null) {
      sortedPrs = sortFn(allVersions.prs);
      return R.slice(0, versionsToExtract.prs)(sortedPrs);
    } else if (versionsToExtract.branch != null) {
      return R.filter(R.propEq('branch', versionsToExtract.branch))(allVersions.branches);
    } else {
      throw new Error('Unrecognized version type');
    }
  };
}

  logger('fetching all available versions from %s', url);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', (url + '?' + new Date().getTime()), true);
  xhr.responseType = 'json';
  xhr.timeout = 4000;

  xhr.ontimeout = function () {
    logger('unable to get all versions; Timed out');
    errorCallback();
  };

  xhr.onerror = function (e) {
    logger('unable to get all versions', e);
    errorCallback();
  };

  xhr.onload = function handleVersions() {
    var that = this;
    var versions = [];
    versionsToFetch.forEach(function appendVersions(versionsToExtract) {
      var thoseVersions = makeVersionExtractor(versionsToExtract)(that.response);
      versions = versions.concat(thoseVersions);
    });

    /*eslint-disable eqeqeq */
    if (this.readyState == 4 && this.status == 200) {
      /*eslint-enable eqeqeq */
      successCallback(versions);
    }
  };

  xhr.send();

  // Make the xhr object available to unit tests.
  return xhr;
};

/**
 * Retrieve the version of code to use from the specified URL.
 * This will set the updated version. If successful, using the version that was
 * retrieved; and if there was a problem, using the version that is currently
 * being used.
 * The callback will be called for both success and failure outcomes.
 * @param versionUrl : The URL where the version can be retrieved.
 * @param callback : The callback for when the version request completes.
 **/
version.fetchLatestVersion = function (url, callback) {
  logger('fetching new version from %s', url);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', (url + '?' + new Date().getTime()), true);
  xhr.responseType = 'json';
  xhr.timeout = 4000;

  xhr.ontimeout = function () {
    logger('unable to check version Timed out');
    callback();
    version.setUpdated(version.getCurrent());
  };

  xhr.onerror = function (e) {
    logger('unable to check version', e);
    callback();
    version.setUpdated(version.getCurrent());
  };

  xhr.onreadystatechange = function () {
    var newVersion;
    /*eslint-disable eqeqeq */
    if (this.readyState == 4 && this.status == 200) {
      newVersion = this.response.version;
      /*eslint-enable eqeqeq */
      version.setUpdated(newVersion);
      callback(newVersion);
    }
  };

  xhr.send();

  // Make the xhr object available to unit tests.
  return xhr;
};

/**
 * Helper for checking whether the version as requested from the server matches
 * the current version of the code.
 **/
version.didUpdate = function () {
  return version.getUpdated() !== version.getCurrent();
};

/**
 * Getter/setter for the version of the code currently installed.
 **/
version.setCurrent = function (value) {
  localStorage.CURRENT_VERSION = value;
};
version.getCurrent = function () {
  return localStorage.CURRENT_VERSION;
};

/**
 * Getter/setter for the version of the code reported by the version URL.
 **/
version.setUpdated = function (value) {
  version.updated = value;
};
version.getUpdated = function () {
  return version.updated;
};


module.exports = version;
