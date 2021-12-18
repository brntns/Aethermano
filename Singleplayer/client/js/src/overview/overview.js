
var PNG = require('pngjs').PNG;
var colormap = require('./colormap');
var png = null;
var ready = false;
var init = true;
var loadingImage = false;
var overviewImage = null;
//var overview = null;
var marker = null;


function Overview(game,world) {
    this.game = game;
    this.world = world;
}

var overviewBase = {
  create:function create(){
    console.log('overview');
  },
	writeImg : function writeImg() {
    var img = new PNG({
      filterType: 4,
      width: this.world.maps[0].map[0].layers[0].width,
      height: this.world.maps[0].map[0].layers[0].height
    });
    for (var y = 0; y < img.height; y++) {
      for (var x = 0; x < img.width; x++) {
        var idx = (img.width * y + x) << 2;
        // invert color
        var colourN = 0;
        colourN = this.world.maps[0].map[0].layers[0].data[x+this.world.maps[0].map[0].layers[0].width*y];
        img.data[idx] = colormap[colourN].r;
        img.data[idx+1] = colormap[colourN].g;
        img.data[idx+2] = colormap[colourN].b;
        // and reduce opacity
        img.data[idx+3] = 255;
      }
    }
    // console.log(img);
    img.pack();
    var chunks = [];
    img.on('data', function(chunk) {
      chunks.push(chunk);
    });
    img.on('end', function() {
      var result = Buffer.concat(chunks);
      png = result.toString('base64');
      ready = true;
      console.log('image ready!');
    });
  },
  checkImage:function checkImage(){
    if(ready && init){
    this.loadImage();
    init = false;
    }
  },
  loadImage: function loadImage() {
    png = 'data:image/jpeg;base64,'+png;
    var data = new Image();
    data.src = png;
    console.log('LOADING IMAGE...');
    overviewImage = this.game.cache.addImage('mapImage', png, data);
    console.log('LOADED IMAGE!');
    console.log(overviewImage);
  },

}



var overview = {};
_.extend(overview, overviewBase);

Overview.prototype = overview;

module.exports = Overview;
