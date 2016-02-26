var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    fs = require('fs');
    createGifSlideshow = require('../index');

chai.use(require('chai-fs'));

var URLS = [
  "http://cdn.aboutyou.de/file/88cf22c9ded5d41f28ad673de00357bb?width=850&quality=85",
  "http://cdn.aboutyou.de/file/e4b33ca0cc6f4488ef154175e15aabb7?width=850&quality=85",
  "http://cdn.aboutyou.de/file/f44db5a118364e251db5885d4bbeed43?width=850&quality=85"
];

describe('#createGifSlideshow', function() {

  it('create a gif slideshow', function(done) {

   createGifSlideshow(URLS, 'test.png', function() {
      chai.expect('test.png').to.be.a.file();
      done();
    });
  });

  after(function() {
    fs.unlinkSync('1.png');
    fs.unlinkSync('2.png');
    fs.unlinkSync('3.png');
    //fs.unlinkSync('test.png');
  });

});