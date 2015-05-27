var constants = require('../src/constants');

describe('Constants', function() {

  it('should have JS_FILE_NAME', function() {
    expect(constants).to.have.property('JS_FILE_NAME');
  });

  it('should have CSS_FILE_NAME', function() {
    expect(constants).to.have.property('CSS_FILE_NAME');
  });

  it('should have LATEST_VERSION_URL status', function() {
    expect(constants).to.have.property('LATEST_VERSION_URL');
  });

  it('should have ALL_VERSIONS_URL status', function() {
    expect(constants).to.have.property('ALL_VERSIONS_URL');
  });

  it('should have DEBUG status', function() {
    expect(constants).to.have.property('DEBUG');
  });

});
