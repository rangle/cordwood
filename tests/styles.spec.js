var styles = require('../src/styles');

describe('Styles', function () {

  describe('should have', function () {

    it('body', function () {
      expect(styles.jsonCSS).to.have.property('body');
    });

    it('header', function () {
      expect(styles.jsonCSS).to.have.property('header');
    });

    it('h1', function () {
      expect(styles.jsonCSS).to.have.property('h1');
    });

    it('ul', function () {
      expect(styles.jsonCSS).to.have.property('ul');
    });
  });

  describe('getByType', function () {

    it('should return undefined if type is \'get\'', function () {
      expect(styles.getByType('get')).to.be.undefined;
    });

    it('should return undefined if type is not found', function () {
      expect(styles.getByType('someCrazyType')).to.be.undefined;
    });

    before(function () {
      styles.jsonCSS.test = {
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        padding: '0 1.5rem',
        position: 'fixed',
        top: 0,
        width: '100%'
      };
    });

    it('should return style string for the requested type', function () {
      var styleStr =
        'test { background-color: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); padding: 0 1.5rem; position: fixed; top: 0; width: 100%; }';

      expect(styles.getByType('test')).to.be.equal(styleStr);
    });

  });

  describe('get', function () {

    before(function () {
      styles.jsonCSS = {
        test: {
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          padding: '0 1.5rem',
          position: 'fixed',
          top: 0,
          width: '100%'
        },

        'test:hover,test:active': {
          backgroundColor: '#a3ddfa'
        }
      };
    });

    it('should return CSS string for the defined JSON styles', function () {
      var cssStr =
        'test { background-color: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); padding: 0 1.5rem; position: fixed; top: 0; width: 100%; } test:hover,test:active { background-color: #a3ddfa; } ';

      expect(styles.get()).to.be.equal(cssStr);
    });

  });

});
