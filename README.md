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

## Usage

```javascript
var facebookGifAds = require('facebook-gif-ads');

facebookGifAds.createSlideshow(urls, 'slideshow.gif', function() {
	console.log("slideshow created!");		
});

```

## Tests

```bash
npm test
```

## Useful Links
**Facebook for business:** Can I boost a post with an animated GIF? <https://www.facebook.com/business/help/1006874066021923>
