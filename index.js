var GIFEncoder = require('gifencoder');
var Canvas = require('canvas');
var fs = require('fs');
var request = require('request');
var async = require('async');
var AWS = require('aws-sdk');

function FbGifAds(fbAccessToken, awsAccessKey, awsSecretAccessKey) {
    // FB
    if (!fbAccessToken) {
        console.log("Please enter a FB accessToken");
        return;
    }
    this.FB_ACCESS_TOKEN = fbAccessToken;

    // AWS
    if (awsAccessKey && awsSecretAccessKey) {
        this.AWS_ACCESS_KEY = awsAccessKey;
        this.AWS_SECRET_ACCESS_KEY = awsSecretAccessKey;
        AWS.config.update({
            accessKeyId: this.AWS_ACCESS_KEY,
            secretAccessKey: this.AWS_SECRET_ACCESS_KEY
        });
    }
}

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
 * @param {string[]} [options.captions] - image captions
 * @param {string} [options.awsBucket] - AWS bucket name. If set, the file is directly uploaded to Amazon S3 instead of the local file system.
 */
FbGifAds.prototype.createSlideshow = function(urls, filename, options) {
    var args = [].slice.call(arguments),
        callback = typeof args[args.length - 1] === 'function' && args.pop();

    // CHECK FOR OBLIGATORY PARAMETERS 
    if (!urls ||  !Object.prototype.toString.call(urls) === '[object Array]') {
        console.log("Please insert an array of image urls!");
        callback();
    }

    if (!filename ||  typeof filename !== 'string') {
        console.log("Please insert a filename");
        callback();
    }

    // OPTIONS
    options = options ||  {};
    var REPEAT = options.repeat || 0;
    var DELAY = options.delay ||  700;
    var QUALITY = options.quality |  10;
    var WIDTH = options.width || 320;
    var HEIGHT = options.height || 405;
    var AWS_BUCKET = options.awsBucket ||  false;
    var CAPTIONS = options.captions ||  [];
    var hasCaptions = options.captions ? true : false;
    var CANVAS_WIDTH = WIDTH;
    var CANVAS_HEIGHT = hasCaptions ? HEIGHT + 100 : HEIGHT;

    // INITIALIZE GIF ENCODER
    var encoder = new GIFEncoder(CANVAS_WIDTH, CANVAS_HEIGHT);
    encoder.createReadStream().pipe(fs.createWriteStream(filename));
    encoder.start();
    encoder.setRepeat(REPEAT);
    encoder.setDelay(DELAY);
    encoder.setQuality(QUALITY);

    // CREATE SLIDESHOW
    var i = 0;
    async.each(urls, function(url, cb) {
        i++;
        var caption = CAPTIONS[i - 1];
        createFrame(url, i + '.png', encoder, caption, cb);
    }, function() {
        encoder.finish();
        // CLEAN UP
        for (i; i > 0; i--) {
            fs.unlinkSync(i + '.png');
        }
        // AUTO UPLOAD TO AMAZON S3
        if (AWS_BUCKET) {
            fs.readFile(filename, function(err, imageData) {
                fs.unlinkSync(filename);
                uploadS3(AWS_BUCKET, filename, imageData, callback);
            });
        } else {
            callback();
        }
    });

    // HELPERS  
    function createFrame(url, filename, encoder, caption, callback) {
        download(url, filename, function() {
            drawFrame(filename, encoder, caption, callback);
        });
    };

    function download(url, filename, callback) {
        request
            .get(url)
            .pipe(fs.createWriteStream(filename)).on('close', callback);
    };

    function drawFrame(filename, encoder, caption, callback) {
        var canvas = new Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        var ctx = canvas.getContext('2d');
        var buf = fs.readFileSync(filename);
        var img = new Canvas.Image();
        img.src = buf;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
        if (caption) {
            ctx.font = "bold 24px Helvetica";
            ctx.fillStyle = 'black';
            ctx.textAlign = "center";
            ctx.fillText(caption, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 1.2, CANVAS_WIDTH);
        }
        encoder.addFrame(ctx);
        callback();
    };

    function uploadS3(bucketName, imageName, imageData, callback) {
        var s3bucket = new AWS.S3({ params: { Bucket: bucketName } });
        s3bucket.createBucket(function(err) {
            var params = {
                Bucket: bucketName,
                Key: imageName,
                Body: imageData,
                ContentType: 'image/gif',
                ACL: 'public-read'
            };
            s3bucket.putObject(params, function(err, data) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, "https://s3.amazonaws.com/" + bucketName + "/" + imageName);
                }
            });
        });
    };
}


/**
 * Post GIF image url to your Facebook page
 *
 * @param {string} pageId - Facebook Page ID
 * @param {string} imageUrl- URL of the animated GIF image
 */
FbGifAds.prototype.postToFB = function(pageId, imageUrl, callback) {
    var self = this;
    request.post("https://graph.facebook.com/v2.2/" + pageId + "/feed?access_token=" + self.FB_ACCESS_TOKEN, {
            form: {
                link: imageUrl
            }
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(response.body);
                callback(null, json.id);
            } else {
                callback(error, null);
            }
        })
};

module.exports = FbGifAds;
