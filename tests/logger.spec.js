var constants = require('../src/constants');
var logger = require('../src/logger');

describe('Logger', function () {
  beforeEach(function () {
    window.console.info = sinon.stub();
  });

  it('should log a message when debug is true', function () {
    constants.DEBUG = true;
    logger('Message');

    expect(console.info.calledWith('Message')).to.be.true;
  });

  it('should not log a message when debug is false', function () {
    constants.DEBUG = false;
    logger('No Message');

    expect(console.info.called).to.be.false;
  });
});
