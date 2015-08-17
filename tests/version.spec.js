var version = require('../src/version');
var logger = require('../src/logger');
var mockVersions = require('./mocks/versions');

describe('Version', function() {

  describe('Current', function() {
    before(function () {
      version.setCurrent('1.0.0');
    });

    it('should be able to set current version', function() {
      expect(version.getCurrent()).to.be.equal('1.0.0');
    });

    it('should be able to set localStorage.CURRENT_VERSION', function() {
      expect(localStorage.CURRENT_VERSION).to.be.equal('1.0.0');
    });

    it('should keep current version and localStorage.CURRENT_VERSION in sync', function() {
      version.setCurrent('1.0.1');
      expect(localStorage.CURRENT_VERSION).to.be.equal(version.getCurrent());
    });
  });

  describe('Updated', function () {
    before(function () {
      version.setCurrent('1.0.1');
      version.setUpdated('1.0.2');
    });

    it('should be able to check if the version updated', function () {
      expect(version.getUpdated()).to.equal('1.0.2');

      expect(version.didUpdate()).to.be.true;
      version.setCurrent('1.0.2');
      // Both are the same now.
      expect(version.didUpdate()).to.be.false;

      version.setUpdated('1.0.3');
      expect(version.didUpdate()).to.be.true;
    });
  });

  describe('fetchLatestVersion', function() {

    beforeEach(function () {
      this.server = sinon.fakeServer.create();
      this.server.xhr.useFilters = true;
      this.server.autoRespond = true;
      version.setCurrent('1.0.2');
      version.setUpdated('1.0.2');
    });

    afterEach(function () {
      this.server.respond();
      this.server.restore();
    });

    it('should be able to fetch new version', function(done) {
      this.server.respondWith(/\/version\?(\d+)/, function(xhr, id) {
        xhr.response = { version: '1.1.0' };
        xhr.respond(200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({ version: '1.1.0' }));
        });

      version.fetchLatestVersion('/version', function(newVersion) {
        expect(newVersion).to.be.equal('1.1.0');
        done();
      });

    });

    it('should invoke an error handler when the request aborts', function () {
      var callbackStub = sinon.stub();

      var xhr = version.fetchLatestVersion('/version', callbackStub);
      var onerrorSpy = sinon.spy(xhr, 'onerror');
      xhr.abort();

      this.server.respond([500, {}, 'error']);

      expect(callbackStub.called).to.be.true;
      expect(onerrorSpy.called).to.be.true;

      // Verify these are unchanged.
      expect(version.getCurrent()).to.equal('1.0.2');
      expect(version.getUpdated()).to.equal('1.0.2');
    });

    it('should behave as expected when a timeout occurs', function () {
      var callbackStub = sinon.stub();

      var xhr = version.fetchLatestVersion('/version', callbackStub);
      xhr.ontimeout();

      expect(callbackStub.called).to.be.true;

      // Verify these are unchanged.
      expect(version.getCurrent()).to.equal('1.0.2');
      expect(version.getUpdated()).to.equal('1.0.2');
    });

  });

  describe('fetchAllVersions', function() {

    beforeEach(function () {
      this.server = sinon.fakeServer.create();
      this.server.xhr.useFilters = true;
      this.server.autoRespond = true;
    });

    afterEach(function () {
      this.server.respond();
      this.server.restore();
    });

    it('should be able to fetch all available versions', function(done) {
      this.server.respondWith(/\/versions\?(\d+)/, function(xhr, id) {
        xhr.response = mockVersions;
        xhr.respond(200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(mockVersions));
        });

      var successCallback = function (versions) {
        expect(versions).to.deep.equal(mockVersions.branches);
        done();
      };

      version.fetchAllVersions({
        'url': '/versions',
        'versionsToFetch': [{'branch': 'master'}],
        'successCallback': successCallback,
        'errorCallback': null
      });
    });

    it('should invoke an error handler when the request aborts', function () {
      var errorCallbackStub = sinon.stub();

      var xhr = version.fetchAllVersions({
        'url': '/versions',
        'versionsToFetch': [],
        'successCallback': null,
        'errorCallback': errorCallbackStub
      });
      var onerrorSpy = sinon.spy(xhr, 'onerror');
      xhr.abort();

      this.server.respond([500, {}, 'error']);

      expect(errorCallbackStub.called).to.be.true;
      expect(onerrorSpy.called).to.be.true;
    });

    it('should behave as expected when a timeout occurs', function () {
      var errorCallbackStub = sinon.stub();

      var xhr = version.fetchAllVersions({
        'url': '/versions',
        'versionsToFetch': [],
        'successCallback': null,
        'errorCallback': errorCallbackStub
      });
      xhr.ontimeout();

      expect(errorCallbackStub.called).to.be.true;
    });

  });

});
