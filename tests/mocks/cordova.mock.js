'use strict';

/* Cordova Mocks
–––––––––––––––––––––––––––––––––––––––––––––––––– */
window.testUtils = window.testUtils || {}

var counter = 0;

// Returns a mock fileEntry
testUtils.createFile = function createFile(filename) {
  var data = counter;
  var fileObject = {
    'id': counter,
    // If you think this is ridiculous, please tell that to cordova
    'data': {
      'target': {
        'result': data
      }
    }
  };
  counter += 1;

  return {
    'name': filename,
    'nativeURL': 'some/kind/of/native/path',
    'isFile': true,
    'createWriter': function() {},
    'file': function(sCB) {
      sCB(fileObject);
    },
    '_file': fileObject,
    '_data': data,
    'remove': function() {}
  };
};

window.testUtils.createDirectory = function createDirectory(directoryName) {
  var listing = [];
  var readerObject = {
    'readEntries': function(sCB) {
      sCB(listing);
    }
  };
  var directoryObject = {
    'name': directoryName,
    'createReader': function() {
      return readerObject;
    },
    'getFile': function(path, options, sCB, eCB) {
      sCB(testUtils.createFile('somefile'));
    },
    'getDirectory': function(path, options, sCB, eCB) {
      sCB(testUtils.createDirectory(path));
    },
    'isDirectory': true
  };
  var createReaderStub = sinon.stub(directoryObject, 'createReader')
    .returns(readerObject);

  directoryObject._readEntriesSpy = sinon.stub(readerObject, 'readEntries');
  directoryObject._createReaderSpy = createReaderStub;

  return directoryObject;
};

window.FileTransfer = function FileTransfer() {
  this.download = function(url, nativeURL, sCB, eCB) {
    sCB();
  };
};


window.resolveLocalFileSystemURL = function(url, sCB, eCB) {
  if (url) {
    sCB(testUtils.createDirectory(url));
  } else {
    eCB();
  }
};

window.cordova = {
  file: {
    dataDirectory: 'some/path/value',
    applicationDirectory: 'root/application/'
  }
};
