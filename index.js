var GIFEncoder = require('gifencoder');
var Canvas = require('canvas');
var fs = require('fs');
var request = require('request');
var async = require('async');

module.exports = {
  createSlideshow: createSlideshow
};

/**
 * Create a slideshow from an array of URL strings.
 *
 * @param {string[]} urls - Image URLs
 * @param {string} filename - GIF filename
 * @return
 */
function createSlideshow(urls, filename, callback) {
  var encoder = new GIFEncoder(320, 405);

  encoder.createReadStream().pipe(fs.createWriteStream(filename));
  encoder.start();
  encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
  encoder.setDelay(700); // frame delay in ms
  encoder.setQuality(20); // image quality. 10 is default.

  var i = 0;

  async.each(urls, function(url, cb) {
    i++;
    createFrame(url, i + '.png', encoder, cb);
  }, function() {
    // Clean up
    for(i; i > 0; i--) {
      fs.unlinkSync(i + '.png');
    }
    encoder.finish();
    callback();
  });
};

// HELPERS  
function createFrame(url, filename, encoder, callback) {
  download(url, filename, function() {
    drawFrame(filename, encoder, callback);
  });
};

function download(url, filename, callback) {
  request
    .get(url)
    .pipe(fs.createWriteStream(filename)).on('close', callback);
};

function drawFrame(filename, encoder, callback) {
  var canvas = new Canvas(320, 405);
  var ctx = canvas.getContext('2d');
  var buf = fs.readFileSync(filename);
  var img = new Canvas.Image();
  img.src = buf;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 320, 405);
  ctx.drawImage(img, 0, 0, 320, 405);
  encoder.addFrame(ctx);
  callback();
};