var bootstrap = require('../src/bootstrap');
var readService = require('../src/read-service');

describe('Bootstrap', function () {
  var testJsFileName = 'my-app_v_1.1.1.js';
  var testCssFileName = 'my-app_v_1.1.1.css';

  var constants = {
    JS_FILE_NAME: 'app.js',
    CSS_FILE_NAME: 'app.css',
    DEBUG: true
  };

  /**
   * Helper function for testing whether there is a script tag with the src
   * value that was provided.
   * @param src : The src value to check for.
   **/
  function hasJsFile(src) {
    var scripts = document.getElementsByTagName('script');
    var result = false;

    for (var i = scripts.length - 1; i >= 0; i--) {
      result = (result || scripts[i].getAttribute('src') === src);
    };
    return result;
  }

  /**
   * Helper for checking whether there is a link tag with the provided href
   * value.
   **/
  function hasCssFile(href) {
    var links = document.getElementsByTagName('link');
    var result = false;

    for (var i = links.length - 1; i >= 0; i--) {
      result = (result || links[i].getAttribute('href') === href);
    };
    return result;
  }

  describe('setup', function () {
    bootstrap.setup(function () {}, function () {});

    it('should set successCallback', function () {
      expect(bootstrap).to.have.property('successCallback');
      expect(bootstrap.successCallback).to.be.a('function');
    });

    it('should set errorCallback', function () {
      expect(bootstrap).to.have.property('errorCallback');
      expect(bootstrap.errorCallback).to.be.a('function');
    });
  });

  describe('init', function () {
    var setupSpy = sinon.spy(readService, 'setup');
    var readFilesSpy = sinon.spy(readService, 'readFiles');
    before(function () {
      bootstrap.init('v_1.0.0');
    });
    it('should initialize', function () {
      expect(setupSpy.called).to.be.true;
      var setupArgs = setupSpy.getCall(0).args;
      expect(setupArgs[0]).to.be.a('function');
      expect(setupArgs[1]).to.be.a('function');

      // TODO move those out. Wrong test
      var expectedFiles = ['v_1.0.0_app.js',
        'www/css/v_1.0.0_app.css'
      ];
      expect(readFilesSpy.calledWith(expectedFiles)).to.be.true;
    });
  });

  describe('injectFile', function () {

    before(function () {
      bootstrap.injectFile(testJsFileName);
    });

    it('should inject a JS file', function () {
      expect(hasJsFile(testJsFileName)).to.be.true;
    });

    before(function () {
      bootstrap.injectFile(testCssFileName);
    });

    it('should inject a CSS file', function () {
      expect(hasCssFile(testCssFileName)).to.be.true;
    });

    before(function () {
      bootstrap.injectFile('invalid.js.temp');
    });

    it('should not inject an unexpected file', function () {
      expect(hasJsFile('invalid.js.temp')).to.be.false;
    });

  });

  describe('injectAllFiles', function () {
    before(function () {
      var files = [{
        fileEntry: {
          nativeURL: '/test/test/' + testJsFileName
        },
        filename: testJsFileName,
        read: true
      }, {
        fileEntry: {
          nativeURL: '/test/test/' + testCssFileName
        },
        filename: testCssFileName,
        read: true
      }];
      bootstrap._injectAllFiles(files);
    });

    it('should inject all files', function () {
      expect(hasJsFile(testJsFileName)).to.be.true;
      expect(hasCssFile(testCssFileName)).to.be.true;
    });
  });
  describe('errorReadingFiles', function () {
    var errorCallback = sinon.stub();

    before(function () {
      bootstrap.setup(function () {}, errorCallback);
    });
    it('should invoke the outer error handler', function () {
      bootstrap._errorReadingFiles();
      expect(errorCallback.called).to.be.true;
    });
  });

});
