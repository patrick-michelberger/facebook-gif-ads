var chai = require('chai'),
    should = chai.should(),
    sinon = require('sinon'),
    expect = chai.expect,
    fs = require('fs');
    facebookGifAds = require('../index');
    request = require('request');

chai.use(require('chai-fs'));

var URLS = [
  "http://cdn.aboutyou.de/file/88cf22c9ded5d41f28ad673de00357bb?width=850&quality=85",
  "http://cdn.aboutyou.de/file/e4b33ca0cc6f4488ef154175e15aabb7?width=850&quality=85",
  "http://cdn.aboutyou.de/file/f44db5a118364e251db5885d4bbeed43?width=850&quality=85"
];

describe('#createSlideshow', function() {
  var filename = "slideshow.gif";

  it('create a GIF slideshow', function(done) {
    facebookGifAds.createSlideshow(URLS, filename, function() {
      chai.expect(filename).to.be.a.file();
      done();
    });
  });

  after(function() {
    fs.unlinkSync(filename);
  });

});


describe('#postSlideshowToFacebook', function() {
  var filename = "example.gif";
  var pagename = "testpage";

  beforeEach(function() {
      sinon.spy(request, 'post');
    });

  it('post slideshow to facebook', function(done) {
    facebookGifAds.postToFB(pagename, filename, function() {
      expect(request.post.calledOnce).to.be.true;
      done();
    });
  });

  afterEach(function() { 
    request.post.restore();
  });

});