var ui = require('../src/ui');
var versions = require('./mocks/versions');
var urls = require('../src/urls');

describe('UI', function () {
  var that = this;

  function initUi() {
    that.body = document.body;
    that.head = document.head;

    urls.setBase('http://my-test.com');
    urls.initForPr(versions.prs[0].path);

    ui.init(versions.prs, function (path) {
      return path;
    });
  }

  describe('Init', function () {

    beforeEach(initUi);

    afterEach(function () {
      that.body.innerHTML = '';
      that.head.innerHTML ='';
    });

    it('should attach the UI styles in a style tag', function () {
      var styleTags = that.head.getElementsByTagName('style');

      expect(styleTags).to.have.to.have.length(1);
      expect(styleTags[0].id).to.equal('js-ui-styles');
    });

    it('should generate the header', function () {
      var header = that.body.getElementsByTagName('header')[0];
      var h1 = header.firstChild;

      expect(header).not.to.be.null;
      expect(header.id).to.equal('js-ui-header');
      expect(h1.innerText).to.be.equal('Available Versions');
    });

    it('should generate the list of available versions', function () {
      var list = that.body.getElementsByTagName('ul')[0];
      expect(list).not.to.be.null;
      expect(list.id).to.equal('js-ui-list');

      var items = that.body.getElementsByTagName('li');
      expect(items).to.have.length(versions.prs.length);

      expect(items[0].innerText).to.be.equal('PR# 42');
      expect(items[1].innerText).to.equal('Branch: master')
      expect(items[0].onclick).to.be.exist;
      expect(items[0].onclick()).to.equal(urls.latestVersion);
    });

    it('should throw an error if an item doesn\'t have a pr or branch', function () {
      var malformedVersions = [{
        'name': 'some name',
        'path': 'some path'
      }]

      expect(function () {
        ui.init(malformedVersions);
      }).to.throw();

    });

  });


  describe('Teardown', function () {

    before(function () {
      initUi()
      ui.teardown();
    });

    it('should delete UI DOM nodes and cleanup', function () {
      var header = document.getElementById('js-ui-header');
      var list = document.getElementById('js-ui-list');
      var styles = document.getElementById('js-ui-styles');

      expect(header).to.be.null;
      expect(list).to.be.null;
      expect(styles).to.be.null;
    });

  });

});
