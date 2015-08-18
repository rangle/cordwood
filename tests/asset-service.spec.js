'use strict';
/*global sinon, expect, testUtils*/
/*eslint-disable no-unused-expressions*/

var assetService = require('../src/asset-service');

window.FileReader = sinon.stub();

var createDirectory = testUtils.createDirectory;
var createFile = testUtils.createFile;

describe('Asset Service', function () {
  var fileReaderObj = {
    'readAsArrayBuffer': function () {}
  };

  var readAsArrayBufferSpy = sinon.stub(fileReaderObj, 'readAsArrayBuffer',
    function readAsArrayBufferStub(file) {
      this.onloadend(file.data);
    });

  beforeEach(function () {
    FileReader.reset();
    FileReader.returns(fileReaderObj);
  });

  describe('copyFile', function () {
    var copyFile = assetService.copyFile;

    it('should create a new FileReader', function () {
      var file1 = createFile('file1');
      copyFile(file1, createFile('file2'));
      expect(FileReader.calledWithNew()).to.be.true;
    });

    it(
      'should call fileReader.readAsArrayBuffer with file as first argument',
      function () {
        var spy = readAsArrayBufferSpy;
        var file1 = createFile('file1');
        copyFile(file1, createFile('file2'));
        expect(spy.calledWith(file1._file)).to.be.true;
      });

    it('should create a new writer (dest.createWriter)', function () {
      var dest = createFile('file2');
      var spy = sinon.stub(dest, 'createWriter');
      copyFile(createFile('file1'), dest);
      expect(spy.called).to.be.true;
    });

    it('should call the writer with the data from the source file',
      function () {
        var source = createFile('file1');
        var dest = createFile('file2');
        var spy = sinon.spy();
        sinon.stub(dest, 'createWriter', function (sCB) {
          var writer = {
            'write': spy
          };
          sCB(writer);
        });
        copyFile(source, dest);
        expect(spy.calledWith(source._data)).to.be.true;
      });
  });

  describe('copyDirectory', function () {
    var copyDirectory = assetService.copyDirectory;
    var sourceDir;
    var destDir;

    beforeEach(function () {
      sourceDir = createDirectory('source');
      destDir = createDirectory('dest');
    });

    it('should create a new reader (src.createReader)', function () {
      var spy = sourceDir._createReaderSpy;
      copyDirectory(sourceDir, destDir);
      expect(spy.called).to.be.true;
    });

    it('should call the new reader and pass it a function', function () {
      var spy = sourceDir._readEntriesSpy;
      copyDirectory(sourceDir, destDir);
      var firstArgument = spy.args[0][0];
      expect(spy.called).to.be.true;
      expect(firstArgument).to.be.an.instanceof(Function);
    });
  });

  describe('copyAnything', function () {
    var copyAnything = assetService.copyAnything;

    it('should resolve url if given a string', function () {
      var sourceUrl = 'some/source/path';
      var destUrl = 'some/dest/path';
      var spy = sinon.stub(
        window,
        'resolveLocalFileSystemURL',
        window.resolveLocalFileSystemURL
      );
      copyAnything(sourceUrl, destUrl);
      expect(spy.calledWith(sourceUrl)).to.be.true;
      expect(spy.calledWith(destUrl)).to.be.true;
      spy.restore();
    });

    it('should call copyFile if given a file', function () {
      var source = createFile('sourceFile');
      var dest = createDirectory('dest');
      var spy = sinon.stub(assetService, 'copyFile');
      copyAnything(source, dest);
      expect(spy.calledWith(source, dest)).to.be.true;
      spy.restore();
    });

    it('should call copyDirectory if given a directory', function () {
      var source = createDirectory('sourceDirectory');
      var dest = createDirectory('dest');
      var spy = sinon.stub(assetService, 'copyDirectory');
      copyAnything(source, dest);
      expect(spy.calledWith(source, dest)).to.be.true;
      spy.restore();
    });
  });

  describe('copyEntry', function () {
    var copyEntry = assetService.copyEntry;

    describe('source is a file', function () {
      var source;
      var dest;

      beforeEach(function () {
        source = createFile('source');
        dest = createDirectory('dest');
      });

      it('should call getFile if source is  a file', function () {
        var spy = sinon.stub(dest, 'getFile');
        copyEntry(source, dest);
        expect(spy.calledWith('source')).to.be.true;
      });

      it('should pass getFile {create: true} and a callback',
        function () {
          var spy = sinon.stub(dest, 'getFile');
          copyEntry(source, dest);
          var secondArgument = spy.args[0][1];
          var thirdArgument = spy.args[0][2];
          expect(secondArgument).to.deep.equal({
            'create': true
          });
          expect(thirdArgument).to.be.an.instanceof(Function);
        });

    });

    describe('source is a directory', function () {
      var source;
      var dest;

      beforeEach(function () {
        source = createDirectory('source');
        dest = createDirectory('dest');
      });

      it('should call getDirectory if source is a directory',
        function () {
          var spy = sinon.stub(dest, 'getDirectory');
          copyEntry(source, dest);
          expect(spy.calledWith('source')).to.be.true;
        });

      it('should pass getDirectory {create: true} and a callback',
        function () {
          var spy = sinon.stub(dest, 'getDirectory');
          copyEntry(source, dest);
          var secondArgument = spy.args[0][1];
          var thirdArgument = spy.args[0][2];
          expect(secondArgument).to.deep.equal({
            'create': true
          });
          expect(thirdArgument).to.be.an.instanceof(Function);
        });
    });
  });

  describe('makeDirectoryCreator', function () {
    var makeDirectoryCreator = assetService.makeDirectoryCreator;
    var directory;
    var createDeepDirectory;
    var spies = [];

    function stubbedGetDirectory(_path, options, sCB) {
      var dir = testUtils.createDirectory(_path);
      spies.push(sinon.stub(dir, 'getDirectory', stubbedGetDirectory));
      sCB(dir);
    }

    beforeEach(function () {
      directory = createDirectory('root');
      createDeepDirectory = makeDirectoryCreator(directory);
    });

    it('should return a function', function () {
      expect(createDeepDirectory).to.be.an.instanceof(Function);
    });

    it('should call getDirectory with {create: true}', function () {
      var spy = sinon.stub(directory, 'getDirectory', directory.getDirectory);
      createDeepDirectory('subdirectory');
      var optionsArgument = spy.args[0][1];
      expect(spy.called).to.be.true;
      expect(optionsArgument).to.deep.equal({
        'create': true
      });
      spy.restore();
    });

    it('should call getDirectory for all directories', function () {
      spies[0] = sinon.stub(
        directory,
        'getDirectory',
        stubbedGetDirectory
      );
      var pathComponents = ['some', 'directory', 'names'];
      var path = pathComponents.join('/');
      createDeepDirectory(path);
      for (var i = 0; i < pathComponents.length; i += 1) {
        expect(spies[i].calledWith(pathComponents[i])).to.be.true;
      }
      // Last getDirectory not called
      expect(spies[spies.length - 1].called).to.be.false;
      spies = [];
    });

    it('should be able to handle a trailing slash', function () {
      spies[0] = sinon.stub(
        directory,
        'getDirectory',
        stubbedGetDirectory
      );
      var pathComponents = ['some', 'other', 'directory', 'names'];
      var path = pathComponents.join('/');
      // Add trailing slash
      path = path + '/';
      createDeepDirectory(path);
      for (var i = 0; i < pathComponents.length; i += 1) {
        expect(spies[i].calledWith(pathComponents[i])).to.be.true;
      }
      // Last getDirectory not called
      expect(spies[spies.length - 1].called).to.be.false;
      spies = [];
    });
  });
});
