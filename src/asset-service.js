'use strict';
/* Asset Service
–––––––––––––––––––––––––––––––––––––––––––––––––– */
var assetService = {
  'setup': setup
};

var constants = require('./constants');

var assetDirectories = [];
var destinationDirectory;

function logger() {
  //noop
}

function makeIterator(fn) {
  return function (list) {
    for (var index in list) {
      if (list.hasOwnProperty(index)) {
        fn(list[index]);
      }
    }
  };
}

function filter(predicateFn) {
  return function curriedFilter(list) {
    for (var index = list.length; index > -1; index -= 1) {
      if (list.hasOwnProperty(index) && !predicateFn(list[index])) {
        list.splice(index, 1);
      }
    }
    return list;
  };
}

function makeDirectoryCreator(root) {
  return function (directoryPath) {
    logger(directoryPath);
    var directoryNames = directoryPath.split('/');
    directoryNames = filter(function (directoryName) {
      return directoryName !== '';
    })(directoryNames);
    if (directoryNames.length === 0) {
      return;
    } else if (directoryNames.length > 0) {
      logger('directoryNames before shift:', directoryNames);
      var thisDirectory = directoryNames.shift(1);
      logger('directoryNames after shift:', directoryNames);
      root.getDirectory(
        thisDirectory, {
          'create': true
        },
        function recurseDirectoryCreator(newRoot) {
          logger('directoryNames in callback:', directoryNames);
          logger('Calling makeDirectoryCreator again with ' +
            directoryNames.join('/'));
          makeDirectoryCreator(newRoot)(directoryNames.join('/'));
        },
        function () {
          throw new Error(['Couldn\'t create nested directory',
            directoryPath
          ].join(' '));
        });
    } else {
      logger(directoryNames);
      throw new Error('This should never happen');
    }
  };
}

/**
 * setup
 *
 * @param {string|string[]} src directory to copy
 * @param {string} dest destination (optional)
 */
function setup(src, dest) {
  destinationDirectory = dest || cordova.file.dataDirectory;
  src = src || constants.DEFAULT_ASSET_DIRECTORIES;
  if (typeof src === 'string') {
    src = [src];
  }
  makeIterator(function (path) {
    assetDirectories.push(path);
  })(src);
  logger('setup running');
  resolveLocalFileSystemURL(destinationDirectory, function (dataDirectory) {
    makeDirectoryCreator(dataDirectory)(constants.CSS_DIRECTORY);
  });
  copyAssets();
}

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

function makeChildGetter(dirEntry) {
  return function getChildCurried(childName, options, successCallback) {
    dirEntry.getFile(childName, null, successCallback,
      onTypeMismatchError(function () {
        dirEntry.getDirectory(childName, null, successCallback, function (
          error) {
          throw new Error('Error code ' + error.code +
            'Couldn\'t get child: ' + childName);
        });
      }));
  };
}

/**
 * copyDirectory
 *
 * @param {DirectoryEntry} src
 * @param {DirectoryEntry} dest
 */
function copyDirectory(src, dest) {
  logger(['copying directory', src, 'into', dest].join(' '));
  src.createReader().readEntries(function (entries) {
    makeIterator(function (entry) {
      var name = entry.name;
      logger('name: ' + name);
      if (entry.isFile === true) {
        dest.getFile(name, {
          'create': true
        }, makeEntryCopierFn(entry));
      } else if (entry.isDirectory === true) {
        dest.getDirectory(name, {
          'create': true
        }, makeEntryCopierFn(entry));
      } else {
        throw new Error('Neither file nor directory');
      }
      makeChildGetter(dest)(name, makeEntryCopierFn(entry));
    })(entries);
  }, makeErrorThrower(src, dest));
}

/**
 * copyEntry
 *
 * @param {string|FileEntry|DirectoryEntry} src
 * @param {string|FileEntry|DirectoryEntry} dest
 */
function copyEntry(src, dest) {
  logger(['copying entry', src, 'into', dest].join(' '));
  if (typeof src === 'string') {
    return resolveLocalFileSystemURL(src, function (newSrc) {
        copyEntry(newSrc, dest);
      },
      makeErrorThrower(src, dest));
  } else if (typeof dest === 'string') {
    return resolveLocalFileSystemURL(dest, function (newDest) {
        copyEntry(src, newDest);
      },
      makeErrorThrower(src, dest));
  } else {
    if (src.isDirectory) {
      copyDirectory(src, dest);
    } else if (src.isFile) {
      copyFile(src, dest);
    } else {
      throw new Error('Entry is neither a directory nor a file');
    }
  }
}

function makeEntryCopierFn(src) {
  return function curriedCopyEntry(dest) {
    return copyEntry(src, dest);
  };
}

function copyAssets() {
  makeIterator(function (dir) {
    logger(dir);
    resolveLocalFileSystemURL(
      cordova.file.applicationDirectory + dir,
      function (src) {
        resolveLocalFileSystemURL(destinationDirectory, function (
          destParent) {
          destParent.getDirectory(dir, {
              'create': true
            },
            makeEntryCopierFn(src),
            makeErrorThrower(src, dir));
        });
      },
      function (error) {
        throw new Error(error);
      });
  })(assetDirectories);
}

function onTypeMismatchError(fn) {
  return function onTypeMismatchCurried(error) {
    /*eslint-disable eqeqeq */
    if (error.code == FileError.TYPE_MISMATCH_ERR) {
      /*eslint-enable eqeqeq */
      return fn();
    } else {
      throw new Error('Error: ' + error.code);
    }
  };
}

/**
 * makeWriter
 *
 * @param {FileEntry} dest
 */
function makeWriter(dest) {
  return function (data) {
    dest.createWriter(
      function (writer) {
        logger('we\'re writing: ', data.target.result);
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
function copyFile(src, dest) {
  logger(['copying file', src, 'into', dest].join(' '));

  return src.file(function (srcFile) {
    var reader = new FileReader();
    reader.onloadend = makeWriter(dest);
    logger(['Writing from', src, 'to', dest].join(' '));
    reader.readAsArrayBuffer(srcFile);
  });

}

module.exports = assetService;
