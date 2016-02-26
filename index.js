var GIFEncoder = require('gifencoder');
var Canvas = require('canvas');
var fs = require('fs');
var request = require('request');
var async = require('async');

var urls = [
  "http://cdn.aboutyou.de/file/88cf22c9ded5d41f28ad673de00357bb?width=850&quality=85",
  "http://cdn.aboutyou.de/file/e4b33ca0cc6f4488ef154175e15aabb7?width=850&quality=85",
  "http://cdn.aboutyou.de/file/f44db5a118364e251db5885d4bbeed43?width=850&quality=85"
];

/**
 * Represents a book.
 * @constructo
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 * @return
 */
module.exports = function(urls, filename, callback) {
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