'use strict';
var constants = require('./constants');

/* URLs
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var urls = {};

/**
 * Set the base URL
 * @param baseUrl
 */
urls.setBase = function (baseUrl) {
  urls.base = baseUrl;
};

/**
 * Set the base URL and generate the various URLs required for
 * the master branch.
 */
urls.initForMaster = function () {
  var masterUrl = urls.base + constants.MASTER_PATH + '/';

  urls.files = [
    masterUrl + constants.JS_FILE_NAME,
    masterUrl + constants.CSS_FILE_NAME
  ];

  urls.allVersions = urls.base + constants.ALL_VERSIONS_URL;
  urls.latestVersion = masterUrl + constants.LATEST_VERSION_URL;
};

/**
 * Set the base URL and generate the various URLs required for
 * the PR branch.
 * @param path
 */
urls.initForPr = function (path) {

  var prUrl = urls.base + (path || constants.MASTER_PATH) + '/';

  urls.files = [
    prUrl + constants.JS_FILE_NAME,
    prUrl + constants.CSS_FILE_NAME
  ];

  urls.latestVersion = prUrl + constants.LATEST_VERSION_URL;
};


module.exports = urls;
