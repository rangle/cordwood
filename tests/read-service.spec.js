var readService = require('../src/read-service');

var stringUrl = 'local/file/path/something.js';
var urlArray = ['local/file/path/something.js',
  'local/file/path/another-thing.css'
];

describe('Read Service', function () {

  describe('setup', function () {

    readService.setup(function () {}, function () {});

    it('should set successCallback', function () {
      expect(readService).to.have.property('successCallback');
      expect(readService.successCallback).to.be.a('function');
    });

    it('should set errorCallback', function () {
      expect(readService).to.have.property('errorCallback');
      expect(readService.errorCallback).to.be.a('function');
    });

  });


  describe('readFiles', function () {
    var successCallback = sinon.stub();
    var errorCallback = sinon.stub();

    beforeEach(function () {
      readService.setup(successCallback, errorCallback);
      successCallback.reset();
      errorCallback.reset();
    });

    it('should read a single string URL', function () {
      expect(function () {
          readService.readFiles(stringUrl);
        })
        .to.not.throw(Error);
      expect(successCallback.called).to.be.true;

      var files = successCallback.args[0][0];
      expect(files[0].filename).to.equal(stringUrl);
    });

    it('should read multiple URLs passed in as an array', function () {
      expect(function () {
          readService.readFiles(urlArray);
        })
        .to.not.throw(Error);
      expect(successCallback.called).to.be.true;

      var files = successCallback.args[0][0];
      expect(files[0].filename).to.equal(urlArray[0]);
      expect(files[1].filename).to.equal(urlArray[1]);
    });

    it('should fail if object or function passed in as URLs', function () {
      expect(function () {
          readService.readFiles({});
        })
        .to.throw('File name\'s must be String or Array');

      expect(function () {
          readService.readFiles(function () {})
        })
        .to.throw('File name\'s must be String or Array');

      expect(function () {
          readService.readFiles()
        })
        .to.throw('File name\'s must be String or Array');

    });

    it('should fail if a file could not be retrieved', function () {
      // Replace window.resolveLocalFileSystemURL with a version that always
      // fails.
      var oldFn = window.resolveLocalFileSystemURL;
      window.resolveLocalFileSystemURL = function (url, sCB, eCB) {
        eCB();
      };

      readService.readFiles(urlArray);

      expect(errorCallback.calledWith('Unable to read all files')).to
        .be.true;

      window.resolveLocalFileSystemURL = oldFn;
    });

  });

});
