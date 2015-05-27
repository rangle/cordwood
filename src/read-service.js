var logger = require('./logger');

/* Read Service
-------------------------------------------------- */
var readService = {};

var readQueue = [];
var loadedFiles = [];

/**
 * Initialize the read service with the callback functions from the bootstrap.
 **/
readService.setup = function(successCallback, errorCallback) {
  this.successCallback = successCallback;
  this.errorCallback = errorCallback;

  // Ensure these are empty at setup time - this acts as unit test cleanup.
  readQueue = [];
  loadedFiles = [];
};

/**
 * Entry point for reading a set of files from the data directory.
 * @param filenames : The filenames to read. This can be either a string with
 * one filename, or an array with multiple file names.
 **/
readService.readFiles = function(filenames) {
  if (typeof(filenames) === 'string') {
    readQueue.push(filenames);
  } else if (filenames && filenames.constructor === Array) {
    readQueue = filenames;
  } else {
    throw 'File name\'s must be String or Array';
  }

  logger('readQueue:', readQueue);
  startReading();
};

/**
 * Helper to trigger the read process for the set of files.
 **/
function startReading() {
  logger('start reading');
  for (var i = 0; i < readQueue.length; i++) {
    readFile(readQueue[i]);
  };
};

/**
 * Helper for establishing which callback function should be called once all of
 * the files have been read.
 **/
function checkAllFilesRead() {
  logger('check', loadedFiles);
  if (readQueue.length == loadedFiles.length) {
    var allRead = true;
    for (var i = 0; i < loadedFiles.length; i++) {
      if (!loadedFiles[i].read) {
        allRead = false;
        break;
      }
    };
    if (allRead) {
      readService.successCallback(loadedFiles);
    } else {
      readService.errorCallback('Unable to read all files');
    }
  }
};

/**
 * Attempt to read the provided filename from the cordova data directory.
 * A record will be added to loadedFiles with the following properties
 * `filename` : The filename that was being read.
 * `read` : A boolean flag for whether it was successfully read.
 * `fileEntry` : When successful, the associated fileEntry for the filename.
 * @param filename : The name of the file to read.
 **/
function readFile(filename) {
  logger(cordova.file.dataDirectory, filename);

  window.resolveLocalFileSystemURL(
    cordova.file.dataDirectory + filename,
    readFileSuccess,
    readFileError
  );

  function readFileSuccess(fileEntry) {
    logger(fileEntry.nativeURL);
    loadedFiles.push({
      filename: filename,
      fileEntry: fileEntry,
      read: true
    });
    checkAllFilesRead();
  };

  function readFileError(e) {
    logger(e);
    loadedFiles.push({
      filename: filename,
      read: false
    });
    checkAllFilesRead();
  };
};

module.exports = readService;
