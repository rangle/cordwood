var ui = require('../src/ui');
var versions = require('./mocks/versions');
var urls = require('../src/urls');

describe('UI', function() {

  describe('Init', function() {

    before(function () {
      this.body = document.body;
      this.head = document.head;

      urls.setBase('http://my-test.com');
      urls.initForPr(versions.prs[0].path);

      ui.init(versions.prs, function(path) {
        return path;
      });
    });

    it('should attach the UI styles in a style tag', function() {
      var styleTags = this.head.getElementsByTagName('style');

      expect(styleTags).to.have.to.have.length(1);
      expect(styleTags[0].id).to.equal('js-ui-styles');
    });

    it('should generate the header', function() {
      var header = this.body.getElementsByTagName('header')[0];
      var h1 = header.firstChild;

      expect(header).not.to.be.null;
      expect(header.id).to.equal('js-ui-header');
      expect(h1.innerText).to.be.equal('Available Versions');
    });

    it('should generate the list of available versions', function() {
      var list = this.body.getElementsByTagName('ul')[0];
      expect(list).not.to.be.null;
      expect(list.id).to.equal('js-ui-list');

      var items = this.body.getElementsByTagName('li');
      expect(items).to.have.length(versions.prs.length);

      expect(items[0].innerText).to.be.equal('PR# 42 ( dev )');
      expect(items[0].onclick).to.be.exist;
      expect(items[0].onclick()).to.equal(urls.latestVersion);
    });

  });


  describe('Teardown', function() {

    before(function () {
      ui.teardown();
    });

    it('should delete UI DOM nodes and cleanup', function() {
      var header = document.getElementById('js-ui-header');
      var list = document.getElementById('js-ui-list');
      var styles = document.getElementById('js-ui-styles');

      expect(header).to.be.null;
      expect(list).to.be.null;
      expect(styles).to.be.null;
    });

  });

});
