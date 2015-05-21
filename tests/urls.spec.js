var urls = require('../src/urls');
var constants = require('../src/constants');

describe('Urls', function() {

  before(function () {
    this.baseUrl = 'http://my-test.com';
    urls.setBase(this.baseUrl);
  });

  describe('setBase', function() {

    it('should set the base URL', function() {
      expect(urls.base).to.equal(this.baseUrl);
    });

  });


  describe('initForMaster', function() {

    before(function () {
      this.baseForMaster = this.baseUrl + constants.MASTER_PATH + '/';
      urls.initForMaster();
    });

    it('should generate the files URLs', function() {
      expect(urls.files).to.deep.equal([
        this.baseForMaster + constants.JS_FILE_NAME,
        this.baseForMaster + constants.CSS_FILE_NAME
      ]);
    });

    it('should generate the allVersions URL', function() {
      expect(urls.allVersions).to.equal(this.baseUrl + constants.ALL_VERSIONS_URL);
    });

    it('should generate the latestVersion URL', function() {
      expect(urls.latestVersion).to.equal(this.baseForMaster + constants.LATEST_VERSION_URL);
    });

  });


  describe('initForPr', function() {

    before(function () {
      this.baseForPr = this.baseUrl + '/feature/foo/';
      urls.initForPr('/feature/foo');
    });

    it('should generate the files URLs', function() {
      expect(urls.files).to.deep.equal([
        this.baseForPr + constants.JS_FILE_NAME,
        this.baseForPr + constants.CSS_FILE_NAME
      ]);
    });

    it('should generate the allVersions URL', function() {
      expect(urls.allVersions).to.equal(this.baseUrl + constants.ALL_VERSIONS_URL);
    });

    it('should generate the latestVersion URL', function() {
      expect(urls.latestVersion).to.equal(this.baseForPr + constants.LATEST_VERSION_URL);
    });

  });


  describe('initForPr: default', function() {

    before(function () {
      urls.initForPr();
      this.baseForMaster = urls.base + constants.MASTER_PATH + '/';
    });

    it('should generate the master version URL if no path passed in', function() {
      expect(urls.files).to.deep.equal([
        this.baseForMaster + constants.JS_FILE_NAME,
        this.baseForMaster + constants.CSS_FILE_NAME
      ]);
      expect(urls.allVersions).to.equal(this.baseUrl + constants.ALL_VERSIONS_URL);
      expect(urls.latestVersion).to.equal(this.baseForMaster + constants.LATEST_VERSION_URL);
    });

  });

});
