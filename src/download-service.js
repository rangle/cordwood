'use strict';
var constants = require('./constants');
var utils = require('./utils');
var logger = require('./logger');

/* Download Service
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var downloadService = {};

var downloadsQueue = [];
var downloadedQueue = [];

/**
 * Initialize the download service with the callbacks defined in cordwood.js
 **/
downloadService.setup = function (successCallback, errorCallback,
  versionToFetch) {
  this.versionToFetch = versionToFetch;
  this.successCallback = successCallback;
  this.errorCallback = errorCallback;

  // Ensure these are empty at setup time - this acts as unit test cleanup.
  downloadsQueue = [];
  downloadedQueue = [];

  logger('version being fetched by download: ', versionToFetch);
};

/**
 * Entry point for downloading JS/CSS files from a server.
 * @param urls - The URLs to retrieve. This can be either a string with one URL,
 * or an array with multiple filenames.
 **/
downloadService.downloadUrls = function (urls) {
  if (typeof urls === 'string') {
    downloadsQueue.push(urls);
  } else if (urls && urls.constructor === Array) {
    downloadsQueue = urls;
  } else {
    throw 'Url\'s must be String or Array';
  }

  logger('downloadsQueue:', downloadsQueue);
  startDownload();
};

/**
 * Helper to trigger the read process for the set of URLs.
 **/
function startDownload() {
  logger('start download');
  for (var i = 0; i < downloadsQueue.length; i++) {
    downloadFile(downloadsQueue[i]);
  }
}

/**
 * Helper for establishing which callback function should be called once all of
 * the URLs have been downloaded.
 **/
function checkAllFilesDownloaded() {
  logger('check', downloadedQueue);
  if (downloadedQueue.length === downloadsQueue.length) {
    var allDownloded = true;
    for (var i = 0; i < downloadedQueue.length; i++) {
      if (!downloadedQueue[i].downloaded) {
        allDownloded = false;
        break;
      }
    }
    if (allDownloded) {
      downloadService.successCallback(downloadedQueue);
    } else {
      downloadService.errorCallback('Unable to download all files');
    }
  }
}

/**
 * Helper for taking an URL, downloading it, and writing its contents to the
 * cordova data directory.
 * A record will be added to downloadedQueue with the following properties
 * `url` : The URL that was being downloaded.
 * `downloaded` : A boolean flag for whether it was successfully downloaded.
 * `fileUrl` : When successful, the associated local fileEntry for the URL.
 * @param url - The URL to download.
 **/
function downloadFile(url) {
  var destinationDir = cordova.file.dataDirectory;
  var filename = downloadService.versionToFetch + '_';
  if (utils.hasFileExtension(url, 'js')) {
    filename = filename + constants.JS_FILE_NAME;
  } else if (utils.hasFileExtension(url, 'css')) {
    filename = filename + constants.CSS_FILE_NAME;
    destinationDir = destinationDir + constants.CSS_DIRECTORY;
  } else {
    // I don't think this should be able to occur.
    downloadService.errorCallback('Encountered unexpected filetype', url);
  }

  function fileDownloadSuccess(data) {
    downloadedQueue.push({
      url: url,
      fileUrl: data,
      downloaded: true
    });
    checkAllFilesDownloaded();
  }

  function fileDownloadError(error) {
    logger(error);
    downloadedQueue.push({
      url: url,
      downloaded: false
    });
    checkAllFilesDownloaded();
  }

  window.resolveLocalFileSystemURL(
    destinationDir,
    function (directory) {
      directory.getFile(
        filename, {
          create: true,
          exclusive: false
        },
        /**
         * If the version-specific file to write to was created successfully,
         * then download the url into it.
         * @param fileEntry - The file entry for the local file to be written
         * to.
         **/
        function gotFileEntry(fileEntry) {
          var fileTransfer = new FileTransfer();
          fileEntry.remove();
          fileTransfer.download(
            url,
            fileEntry.nativeURL,
            fileDownloadSuccess,
            fileDownloadError
          );
        },
        fileDownloadError
      );
    },
    fileDownloadError);
}


module.exports = downloadService;
