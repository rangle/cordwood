var downloadService = require('../src/download-service');

var stringUrl = 'http://host:port/api/something.js';
var urlArray = ['http://host:port/api/something.js',
  'http://host:port/api/another-thing.css'
];

describe('Download Service', function () {

  describe('setup', function () {

    downloadService.setup(function () {}, function () {}, '1.0.0');

    it('should set versionToFetch', function () {
      expect(downloadService).to.have.property('versionToFetch');
    });

    it('should set successCallback', function () {
      expect(downloadService).to.have.property('successCallback');
      expect(downloadService.successCallback).to.be.a('function');
    });

    it('should set errorCallback', function () {
      expect(downloadService).to.have.property('errorCallback');
      expect(downloadService.errorCallback).to.be.a('function');
    });
  });


  describe('downloadUrls', function () {
    var successCallback = sinon.stub();
    var errorCallback = sinon.stub();

    beforeEach(function () {
      downloadService.setup(successCallback, errorCallback, '1.0.0');
      successCallback.reset();
      errorCallback.reset();
    });


    it('should download a single string URL', function () {
      expect(function () {
          downloadService.downloadUrls(stringUrl);
        })
        .to.not.throw(Error);

      expect(successCallback.called).to.be.true;
      var files = successCallback.args[0][0];
      expect(files[0].url).to.equal(stringUrl);

    });

    it('should download multiple URLs passed in as an array', function () {
      expect(function () {
          downloadService.downloadUrls(urlArray);
        })
        .to.not.throw(Error);

      expect(successCallback.called).to.be.true;
      var files = successCallback.args[0][0];
      expect(files[0].url).to.equal(urlArray[0]);
      expect(files[1].url).to.equal(urlArray[1]);
    });

    it('should fail if object or function passed in as URLs', function () {
      expect(function () {
          downloadService.downloadUrls({});
        })
        .to.throw('Url\'s must be String or Array');

      expect(function () {
          downloadService.downloadUrls(function () {})
        })
        .to.throw('Url\'s must be String or Array');

      expect(function () {
          downloadService.downloadUrls()
        })
        .to.throw('Url\'s must be String or Array');
    });

    it(
      'should hit the error handler if an unexpected extension is used',
      function () {
        downloadService.downloadUrls(
          'http://host:port/api/something.xyz');
        expect(
          errorCallback.calledWith(
            'Encountered unexpected filetype',
            'http://host:port/api/something.xyz'
          )
        ).to.be.true;
      });

    it('should hit the error handler if there is a download issue',
      function () {
        // Replace window.resolveLocalFileSystemURL with a version that always
        // fails.
        var oldFn = window.resolveLocalFileSystemURL;
        window.resolveLocalFileSystemURL = function (url, sCB, eCB) {
          eCB();
        };

        downloadService.downloadUrls(urlArray);
        expect(errorCallback.calledWith(
          'Unable to download all files')).to.be.true;

        window.resolveLocalFileSystemURL = oldFn;
      })

  });
});
