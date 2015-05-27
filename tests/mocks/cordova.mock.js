
/* Cordova Mocks
-------------------------------------------------- */
function FileTransfer() {
  this.download = function(url, nativeURL, sCB, eCB) {
    sCB();
  };
};

var fileEntry = {
  remove: function() {},
  nativeURL: 'some/kind/of/native/path'
};

var directory = {
  getFile: function(path, options, sCB, eCB) {
    sCB(fileEntry);
  }
};

window.resolveLocalFileSystemURL = function(url, sCB, eCB) {
  if (url) {
    sCB(directory);
  } else {
    eCB();
  }
};

window.cordova = {
  file: {
    dataDirectory: 'some/path/value'
  }
};
