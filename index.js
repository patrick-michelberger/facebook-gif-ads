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
 * @param {string} [options] - Optional settings object
 * @param {number} [options.repeat=0] - 0 for repeat, -1 for no-repeat. 0 is default.
 * @param {number} [options.delay=700] - frame delay in ms. 700ms is default.
 * @param {number} [options.quality=10] - image quality. 10 is default.
 * @param {number} [options.width=320] - image quality. 320 is default.
 * @param {number} [options.height=405] - image quality. 405 is default.
 */
function createSlideshow(urls, filename, options) {
  var args = [].slice.call(arguments),
      callback = typeof args[args.length - 1] === 'function' && args.pop();

  // CHECK FOR OBLIGATORY PARAMETERS 
  if (!urls || !Object.prototype.toString.call(urls) === '[object Array]') {
    console.log("Please insert an array of image urls!");
    callback();
  }

  if (!filename || typeof filename !== 'string') {
    console.log("Please insert a filename");
    callback();
  }

  // OPTIONS
  options = options || {};
  var REPEAT = options.repeat || 0;
  var DELAY = options.delay || 700;
  var QUALITY = options.quality | 10;
  var WIDTH = options.width || 320;
  var HEIGHT = options.height || 405;

  // INITIALIZE GIF ENCODER
  var encoder = new GIFEncoder(WIDTH, HEIGHT);
  encoder.createReadStream().pipe(fs.createWriteStream(filename));
  encoder.start();
  encoder.setRepeat(REPEAT);
  encoder.setDelay(DELAY); 
  encoder.setQuality(QUALITY);

  // CREATE SLIDESHOW
  var i = 0;
  async.each(urls, function(url, cb) {
    i++;
    createFrame(url, i + '.png', encoder, cb);
  }, function() {
    // CLEAN UP
    for(i; i > 0; i--) {
      fs.unlinkSync(i + '.png');
    }
    encoder.finish();
    callback();
  });

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
    var canvas = new Canvas(WIDTH, HEIGHT);
    var ctx = canvas.getContext('2d');
    var buf = fs.readFileSync(filename);
    var img = new Canvas.Image();
    img.src = buf;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    encoder.addFrame(ctx);
    callback();
  };
};