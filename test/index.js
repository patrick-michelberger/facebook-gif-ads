var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    fs = require('fs');
    facebookGifAds = require('../index');

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