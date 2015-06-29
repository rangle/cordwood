var utils = require('../src/utils');

describe('Utils', function() {

  describe('hasFileExtension', function() {

    it('should return true if \'.js\' suffix present', function() {
      expect(utils.hasFileExtension('my-file-name.js', 'js')).to.be.true;
      // Should be case insensitive, too.
      expect(utils.hasFileExtension('my-file-name.js', 'JS')).to.be.true;
      expect(utils.hasFileExtension('my-file-name.JS', 'JS')).to.be.true;
      expect(utils.hasFileExtension('my-file-name.JS', 'js')).to.be.true;

      // Should also allow for '.js' to appear more than once, not only at the
      // end.
      expect(utils.hasFileExtension('my-file-name.js.more-things.js', 'js')).to.be.true;
    });

    it('should return false if filename has no \'.js\' suffix', function() {
      expect(utils.hasFileExtension('my-file-name.css', 'js')).to.be.false;
      expect(utils.hasFileExtension('my-file-name.jsp', 'js')).to.be.false;
      expect(utils.hasFileExtension('my-file-name', 'js')).to.be.false;
      expect(utils.hasFileExtension('my-file-namejs', 'js')).to.be.false;
    });

    it('should return false if \'.js\' appears inside the file name', function () {
      expect(utils.hasFileExtension('my-file-name.js.nope', 'js')).to.be.false;
    });
  });

  describe('toSnakeCase', function() {

    it('should work for camelCase', function() {
      expect(utils.toSnakeCase('mySnakeTest')).to.equal('my-snake-test');
    });

    it('should work with numbers', function() {
      expect(utils.toSnakeCase('mySnake123Test')).to.equal('my-snake123-test');
    });

    it('should work with all lowercase strings', function() {
      expect(utils.toSnakeCase('mysnaketest')).to.equal('mysnaketest');
    });

    it('should fail for space separated words', function() {
      expect(utils.toSnakeCase('my snake test')).to.not.equal('my-snake-test');
    });
  });

  describe('makeIterator', function() {
    var makeIterator = utils.makeIterator;
    var spy;
    var array = ['one', 'two', 'three'];
    var proto = {'unwanted': '0'};
    var object = Object.create(proto);
    object['wanted1'] = 1;
    object['wanted2'] = 2;

    beforeEach(function setupTest() {
      spy = sinon.spy();
    })

    it('should return a function', function() {
      expect(makeIterator(spy)).to.be.an.instanceOf(Function);
    });

    it('should return an iterator that calls fn on every member of array',
      function () {
        var iteratorFn = makeIterator(spy);
        iteratorFn(array)
        expect(spy.calledWith('one')).to.be.true;
        expect(spy.calledWith('two')).to.be.true;
        expect(spy.calledWith('three')).to.be.true;
    });

    it('should call fn n times for an array of length n', function () {
      makeIterator(spy)(array);
      expect(spy.callCount).to.equal(3);
    });

    it('should iterate over object values', function () {
      makeIterator(spy)(object);
      expect(spy.calledWith(1)).to.be.true;
      expect(spy.calledWith(2)).to.be.true;
    })

    it('should call fn n times for an object of size n', function () {
      makeIterator(spy)(object);
      expect(spy.callCount).to.equal(2);
    });

    it('should not call fn with prototype objects', function () {
      makeIterator(spy)(object);
      expect(spy.calledWith(0)).to.be.false;
    });
  });

  describe('makeFilter', function filterTests() {
    var makeFilter = utils.makeFilter;
        function isEven(x) {
          return x % 2 === 0;
        }
    function identityFn(x) {
      return x;
    }

    it('should return a function', function () {
      expect(makeFilter(identityFn)).to.be.an.instanceOf(Function);
    });

    it('should throw if not provided with a function', function () {
      var wrongTypes = [1, 'string', [], {}];
      for (var i in wrongTypes) {
        expect(function() {
          makeFilter(wrongTypes[i]);
        }).to.throw();
      }
    });

    it('should return a function that throws if not given an array', function () {
      expect(function () {
        makeFilter(isEven)(1)
      }).to.throw();
    })

    it('should return an array without the elements that fail the predicate',
      function () {
        var array = [1, 2, 3, 4];
        var filter = makeFilter(isEven);
        expect(filter(array)).to.deep.equal([2, 4]);
    });

    it('should not modify existing the array passed as parameter', function() {
        var array = [1, 2, 3, 4];
        var filter = makeFilter(isEven);
        filter(array);
        expect(array).to.deep.equal([1, 2, 3, 4]);
    });

    it('should call the predicate once for each member', function () {
      var spy = sinon.spy();
      var array = [1, 2, 3, 4];
      var filter = makeFilter(spy);
      filter(array);
      for (var i in array) {
        expect(spy.calledWith(array[i])).to.be.true;
      }
      expect(spy.callCount).to.equal(4);
    });

    it('should handle empty array', function () {
      var array = [];
      expect(makeFilter(isEven)(array)).to.deep.equal([]);
    });

  })

});
