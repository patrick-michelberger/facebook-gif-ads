var chai = require('chai'),
    should = chai.should(),
    sinon = require('sinon'),
    expect = chai.expect,
    fs = require('fs');
FbGifAds = require('../index');
request = require('request');
config = require('../config');

chai.use(require('chai-fs'));

var URLS = [
    "http://cdn.aboutyou.de/file/88cf22c9ded5d41f28ad673de00357bb?width=850&quality=85",
    "http://cdn.aboutyou.de/file/e4b33ca0cc6f4488ef154175e15aabb7?width=850&quality=85",
    "http://cdn.aboutyou.de/file/f44db5a118364e251db5885d4bbeed43?width=850&quality=85"
];

var fbGifAds = new FbGifAds(config.facebook.access_token, config.aws.access_key, config.aws.secret_access_key);

describe('#createSlideshow', function() {
    var filename = "slideshow2.gif";

    it('create a GIF slideshow', function(done) {
        fbGifAds.createSlideshow(URLS, filename, function() {
            chai.expect(filename).to.be.a.file();
            fs.unlinkSync(filename);
            done();
        });
    });

    it('upload GIF slideshow to S3', function(done) {
        fbGifAds.createSlideshow(URLS, filename, {
            "awsBucket": "aboutlooks"
        }, function(err, url) {
            chai.expect(url).to.equal("https://s3.amazonaws.com/aboutlooks/slideshow2.gif");
            done();
        });
    });

});

describe('#postSlideshowToFacebook', function() {
    var imageUrl = "https://raw.githubusercontent.com/patrick-michelberger/facebook-gif-ads/master/example.gif";
    var pageId = "1544219729194326";
    var filename = "slideshow.gif";

    beforeEach(function() {
        sinon.spy(request, 'post');
    });

    it('post slideshow to facebook', function(done) {
        fbGifAds.createSlideshow(URLS, filename, {
            "awsBucket": "aboutlooks"
        }, function(err, url) {
            fbGifAds.postToFB(pageId, url, function(error, id)  {
                expect(request.post.calledOnce).to.be.true;
                done();
            });
        });
    });

    afterEach(function() {
        request.post.restore();
    });

});
