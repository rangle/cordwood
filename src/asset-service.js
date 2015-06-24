'use strict';
/**
 * This is a bit of a HACK. The code works, but you wouldn't be able to tell by
 * looking at it. It needs to be replaced or heavily refactored.
 */

/* Asset Service
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var assetService = {};

var constants = require('./constants');
var logger = require('./logger');
var utils = require('./utils');

var makeIterator = utils.makeIterator;
var makeFilter = utils.makeFilter;

var assetDirectories = [];
var destinationDirectory;
var destinationDirectoryEntry;
var createDirInDestRoot;

/**
 * makeDirectoryCreator
 * Returns a function that creates a nested directory inside root, handling
 * the creation of the necessary parent subdirectories
 *
 * Example: makeDirectoryCreator('root')('src/cordwood') will create two
 * directories if  they don't exist: root/src and root/src/cordwood
 *
 * @param {DirectoryEntry} root
 * @returns {Function}
 */
assetService.makeDirectoryCreator = function makeDirectoryCreator(root) {
  return function createDeepDirectory(directoryPath, successCallback) {
    logger(['Creating path:', directoryPath, 'in root:', root].join(' '));
    // Tokenize the directory path
    var directoryNames = directoryPath.split('/');
    /* Get rid of empty strings (this makes the function work even if a trailing
     * slash is present. A side effect of that is that src//cordwood is also
     * treated the same as src/cordwood
     */
    directoryNames = makeFilter(function (directoryName) {
      return directoryName !== '';
    })(directoryNames);

    // If we've reached the end
    if (directoryNames.length === 0) {
      if (successCallback) {
        successCallback();
      }
    } else if (directoryNames.length > 0) {
      // This modifies directoryNames
      var thisDirectory = directoryNames.shift(1);
      root.getDirectory(
        thisDirectory, {
          'create': true
        },
        function recurseDirectoryCreator(newRoot) {
          logger('Calling makeDirectoryCreator again with ' +
            directoryNames.join('/'));
          return makeDirectoryCreator(newRoot)(directoryNames.join('/'),
            successCallback);
        },
        function () {
          throw new Error(['Couldn\'t create nested directory',
            directoryPath
          ].join(' '));
        });
    } else {
      // Implies NaN (which means we weren't passed an array)
      logger(directoryNames);
      throw new Error('Couldn\'t create nested directory');
    }
  };
};

/**
 * setup
 *
 * @param {string|string[]} src directory/directories to copy
 * @param {string} dest destination (optional)
 */
assetService.setup = function setup(src, dest) {
  logger('setup running');
  destinationDirectory = dest;
  src = src || constants.DEFAULT_ASSET_DIRECTORIES;
  if (typeof src === 'string') {
    src = [src];
  }
  makeIterator(function (path) {
    assetDirectories.push(path);
  })(src);

  resolveLocalFileSystemURL(destinationDirectory,
    function (_destinationDirectoryEntry) {
      destinationDirectoryEntry = _destinationDirectoryEntry;
      createDirInDestRoot = assetService.makeDirectoryCreator(
        _destinationDirectoryEntry);
      createDirInDestRoot(constants.CSS_DIRECTORY);
      // HACK We should have a storage service that handles this
      if (localStorage.assetServiceHasRun !== 'true') {
        copyAssets();
        localStorage.assetServiceHasRun = 'true';
      }
    });
};

/**
 * makeErrorThrower(src, dest)
 * @param {FileError} error
 */
function makeErrorThrower(src, dest) {
  src = src.name || src;
  dest = dest.name || dest;
  return function throwError(error) {
    throw new Error(['At', src, 'to', dest, error].join(' '));
  };
}

assetService.copyEntry = function copyEntry(src, dest) {
  var name = src.name;
  if (src.isFile === true) {
    dest.getFile(name, {
      'create': true
    }, makeFileCopierFn(src));
  } else if (src.isDirectory === true) {
    dest.getDirectory(name, {
      'create': true
    }, makeDirectoryCopierFn(src));
  } else {
    throw new Error('Neither file nor directory');
  }
};

/**
 * copyDirectory
 *
 * @param {DirectoryEntry} src
 * @param {DirectoryEntry} dest
 */
assetService.copyDirectory = function copyDirectory(src, dest) {
  logger(['copying directory', src, 'into', dest].join(' '));
  src.createReader().readEntries(function (entries) {
    makeIterator(function (entry) {
      assetService.copyEntry(entry, dest);
    })(entries);
  }, makeErrorThrower(src, dest));
};

/**
 * copyAnything
 *
 * @param {string|FileEntry|DirectoryEntry} src
 * @param {string|FileEntry|DirectoryEntry} dest
 */
assetService.copyAnything = function copyAnything(src, dest) {
  logger(['copying', src, 'into', dest].join(' '));
  // If we're given strings, convert them into FileEntry or DirectoryEntry
  // objects
  if (typeof src === 'string') {
    return resolveLocalFileSystemURL(src, function (newSrc) {
        copyAnything(newSrc, dest);
      },
      makeErrorThrower(src, dest));
  } else if (typeof dest === 'string') {
    return resolveLocalFileSystemURL(dest, function (newDest) {
        copyAnything(src, newDest);
      },
      makeErrorThrower(src, dest));
  } else {
    if (src.isDirectory) {
      assetService.copyDirectory(src, dest);
    } else if (src.isFile) {
      assetService.copyFile(src, dest);
    } else {
      throw new Error('Entry is neither a directory nor a file');
    }
  }
};

function makeFileCopierFn(src) {
  return function curriedCopyFile(dest) {
    return assetService.copyFile(src, dest);
  };
}

function makeDirectoryCopierFn(src) {
  return function curriedCopyDirectory(dest) {
    return assetService.copyDirectory(src, dest);
  };
}

function copyAssets() {
  function copyAssetDirectory(dirName) {
    // create nested directory in destination (in case it's not a top-level dir)
    createDirInDestRoot(dirName, function copyAssetToDest() {
      resolveLocalFileSystemURL(cordova.file.applicationDirectory + dirName,
        function handleSourceDirectory(src) {
          destinationDirectoryEntry.getDirectory(
            dirName,
            null,
            makeDirectoryCopierFn(src),
            makeErrorThrower(src, dirName));
        },
        function (error) {
          throw new Error(error);
        });
    });
  }
  makeIterator(copyAssetDirectory)(assetDirectories);
}

/**
 * makeWriter
 *
 * @param {FileEntry} dest
 */
function makeWriter(dest) {
  logger(['writing to:', dest].join(' '));
  return function (data) {
    dest.createWriter(
      function (writer) {
        return writer.write(data.target.result);
      },
      makeErrorThrower(data, dest)
    );
  };
}

/**
 * copyFile
 *
 * @param {FileEntry} src
 * @param {FileEntry} dest
 */
assetService.copyFile = function copyFile(src, dest) {
  logger(['copying file', src, 'into', dest].join(' '));

  return src.file(function (srcFile) {
    var reader = new FileReader();
    reader.onloadend = makeWriter(dest);
    logger(['Writing from', src, 'to', dest].join(' '));
    reader.readAsArrayBuffer(srcFile);
  });

};

module.exports = assetService;
