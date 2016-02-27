facebook gif ads
=========

Convert a list of image urls to an animated GIF slideshow ready to post to your Facebook page etc.

<img src="https://raw.githubusercontent.com/patrick-michelberger/facebook-gif-ads/master/example.gif" width=250 />
<br/>
Example Post on Facebook: <https://www.facebook.com/wendys/posts/10153606165849489>

## Installation

```bash
npm install facebook-gif-ads --save
````

## Configuration

Rename `index.example.js` to `index.js` in the `config` folder and past in your individual Facebook access token.

## Usage

#### Create GIF slideshow from example urls

```javascript

// Load Dependencies
var FbGifAds = require('facebook-gif-ads');
var config = require('config');

// Initialization
var fbGifAds = new FbGifAds(config.facebook.access_token);

// Example urls
var urls = [
  "http://cdn.aboutyou.de/file/88cf22c9ded5d41f28ad673de00357bb?width=850&quality=85",
  "http://cdn.aboutyou.de/file/e4b33ca0cc6f4488ef154175e15aabb7?width=850&quality=85",
  "http://cdn.aboutyou.de/file/f44db5a118364e251db5885d4bbeed43?width=850&quality=85"
];

var filename = "slideshow.gif";

fbGifAds.createSlideshow(urls, filename, function() {
	console.log(filename + " created.");		
});


````

#### Post GIF image url to your Facebook page

```javascript
var imageUrl = "https://raw.githubusercontent.com/patrick-michelberger/facebook-gif-ads/master/example.gif";
var pageId = "1544219729194326";

fbGifAds.postToFB(pageId, imageUrl, function(err, postId) {
	if (err) {
		console.log("An error occured: ", err);
	} else {
		console.log("Image uploaded. Post ID: ", postId);
	}
});

```

## Tests

```bash
npm test
```

## Useful Links
**Facebook for business:** Can I boost a post with an animated GIF? <https://www.facebook.com/business/help/1006874066021923>
