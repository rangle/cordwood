'use strict';
var assetService = require('./asset-service');
var bootstrap = require('./bootstrap');
var constants = require('./constants');
var downloadService = require('./download-service');
var logger = require('./logger');
var ui = require('./ui');
var urls = require('./urls');
var version = require('./version');

/* Cordwood
–––––––––––––––––––––––––––––––––––––––––––––––––– */
function Cordwood(options) {
  urls.setBase(options.baseUrl);
  urls.initForMaster();
  var currentVersion = options.currentVersion;
  var successCallback = options.successCallback;
  var errorCallback = options.errorCallback;
  var multipleVersions = options.multipleVersions || false;
  var assetDirectories = options.assetDirectories;
  // More like "versionsToDisplay" right now, but let's assume our server can
  // get smarter
  var versionsToFetch = options.versionsToFetch;

  (function setup() {

    assetService.setup(assetDirectories, cordova.file.dataDirectory);

    // Setup the callbacks for bootstrapping the app
    bootstrap.setup(successCallback, errorCallback);
    // If a current version is not available
    if (version.getCurrent() === undefined) {
      version.setCurrent(currentVersion);
    }

    if (multipleVersions) {
      // Fetch all available versions
      version.fetchAllVersions({
        'url': urls.allVersions,
        'versionsToFetch': versionsToFetch,
        'successCallback': onFetchAllVersions,
        'errorCallback': function () {
          // If Fetch all versions fails then default to refreshing master
          version.fetchLatestVersion(urls.latestVersion, onFetchLatestVersion);
        }
      });
    } else {
      // Fetch the latest version number and respond accordingly
      version.fetchLatestVersion(urls.latestVersion, onFetchLatestVersion);
    }

  })();

  /**
   * Download the specified JS/CSS urls as the specified version of the app.
   * @param _urls The URLs for the JavaScript and CSS for the application
   * @param _version A version number.
   **/
  function downloadUpdatedApp(_urls, _version) {
    logger('new _version is %s', _version);
    downloadService.setup(allFilesDownloaded, errorWhileDownloading, _version);
    downloadService.downloadUrls(_urls);
  }

  /**
   * Callback for once all of the files have been downloaded.
   * Uses the bootstrap to add the files to the DOM.
   **/
  function allFilesDownloaded() {
    version.setCurrent(version.getUpdated());
    bootstrap.init(version.getCurrent());
  }

  /**
   * Error callback for when file download fails.
   */
  function errorWhileDownloading(error) {
    logger(error);
    bootstrap.init(version.getCurrent());
  }

  /**
   * This function checks to see if the version updated or not.
   * If it did it will initiate download of the new version.
   * Otherwise it will bootstrap using the existing version
   */
  function onFetchLatestVersion() {
    if (version.didUpdate()) {
      logger('version changed calling api to download files');
      downloadUpdatedApp(urls.files, version.getUpdated());
    } else {
      logger('version did not change loading version: %s', version.getCurrent());
      bootstrap.init(version.getCurrent());
    }
  }

  /**
   * Success callback for fetching all versions.
   */
  function onFetchAllVersions(versions) {
    ui.init(versions, function (url) {
      ui.teardown();
      version.fetchLatestVersion(url, onFetchLatestVersion);
    });
  }
}

window.Cordwood = Cordwood;
