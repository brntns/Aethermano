'use strict';
//var fs = require('fs');
var _ = require('lodash');
var debug = true;
var Monster = require('./decorator/monster.js');
var BMF = require('./base_map_fun');
var Items = require('./decorator/items.js');
var monster = new Monster.Monster();
var items = new Items.Items();

exports.Grassy = function(){
  this.monsters = [];
  this.mapData = {};
  this.map = [];
  this.maps = [];
  this.branches = [];
  this.rooms = [];
  this.locationSprites = [];
  this.locations = [];
  this.mapFeatures = [];
  this.horizon = [];
};
exports.Grassy.prototype = {
  clear: function clear() {
    this.mapData = {};
    this.mapSize = 0;
    this.map = [];
    this.rooms = [];
    this.locationSprites = [];
    this.locations = [];
    this.mapFeatures = [];
    this.horizon = [];
  },
  countRooms: function countRooms (array) {
    var n = 0;
    var N = [];
    loop:
    for (var j = 0; j < 12; j++) {
      n = 0;
      for (var i = 0; i < array.length; i++) {
        if (array[i].type === 4 && array[i].subtype === j) {
          n++;
        }
      }
      N.push(n);
    }
    return N;
  },
  inMapBounds: function inMapBounds (object, mapWidth, mapHeight) {
    if (object.x < 0 || object.x + object.width > mapWidth || object.y < 0 || object.y + object.height > mapHeight) {
      return false;
    }
    return true;
  },
  intersect: function intersect(a, b) {
    if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) {
      return false;
    }
    return !(a.x + a.width < b.x || a.y + a.height < b.y || a.x > b.x + b.width || a.y > b.y + b.height);
  },
  intersectAll: function intersectAll(object, group) {
    for (var i = 0; i < group.length; i++) {
      if (this.intersect(object, group[i])) {
        return true;
      }
    }
    return false;
  },
  makeFeature: function makeFeature(x, y, width, height, boundLeft, boundRight, boundTop, boundBottom, color, type, subtype) {
    var feature = {};
    feature = {
      "x": x,
      "y": y,
      "width": width,
      "height": height,
      "boundLeft": boundLeft,
      "boundRight": boundRight,
      "boundTop": boundTop,
      "boundBottom": boundBottom,
      "color": color,
      "type": type,
      "subtype": subtype
    };
    return feature;
  },
  makeTerrain: function makeTerrain(x, y, width, height, mapWidth, mapHeight, color) {
    for (var z = 0; z < width; z++){
      for (var i = 0; i < height; i++){
        this.map[x+y*mapWidth+z+i*mapWidth] = color;
      }
    }
  },
  Random: function Random(rndMin, rndMax) {
    if (rndMin < rndMax) {
      var x = Math.floor(Math.random()*(rndMax-rndMin+1)+rndMin);
      return x;
    } else {
      return rndMin;
    }
  },
  randomSpacing: function randomSpacing(value, coeff1, coeff2, buffer1, buffer2) {
    var Val = 0;
    var Values = [];
    var n = 0;
    if (value < coeff1 || value < coeff2) {
      n = 1;
    } else {
      n = this.Random(Math.floor(value/coeff1)+1,Math.floor(value/coeff2));
    }
    for (var i = 0; i < n; i++) {
      Val = this.Random(i*Math.floor(value/n)+buffer1,(i+1)*Math.floor(value/n)-buffer2);
      Values[i] = Val;
    }
    return Values;
  },
  randomTerrain: function randomTerrain(n, x, y, width, height, mapWidth, mapHeight, color) {
    var N = Math.floor((mapHeight*mapWidth)/n);
    var X = 0;
    var Y = 0;
    for (var i = 0; i < N; i++) {
      X = this.Random(x,x+width);
      Y = this.Random(y,y+height);
      if (this.map[X + mapWidth*Y] !== 0) {
        this.map[X + mapWidth*Y] = color;
      }
    }
  },
  makeHorizon: function makeHorizon(x, y, width, height, mapWidth, mapHeight) {
    var Width = 0;
    var Height = 0;
    var X = 0;
    var Hills = this.randomSpacing(width, 300, 100, 50, 50);
    for (var i = 0; i < Hills.length; i++) {
      X = Hills[i];
      if (i == 0) {
        Width = X + this.Random(0, 2*X);
        // X = X - Width;
      } else if (i == Hills.length - 1) {
        Width = width - X + this.Random(0, 2*(width - X));
      } else {
        Width = (Hills[i+1] - X);
      }
      Height = Math.floor(Width/this.Random(4, 8));
      this.makeHill(x + X, y, Width, Height, mapWidth, mapHeight);
    }
    // console.log(Hills);
  },
  makeHill: function makeHill(x, y, width, height, mapWidth, mapHeight) {
    var hill = {};
    hill = this.makeFeature(x, y, width, height, 0, 0, 0, 0, 0, 1, 0);
    this.horizon.push(hill);
    this.mapFeatures.push(hill);
    //draw the terrain
    var Length = [];
    var X = [];
    var L = 0;
    var R = 0;
    Length[0] = this.Random(1, Math.floor(width/20) - 10);
    X[0] = this.Random(Math.floor(height*1.3), width - Length[0] - Math.floor(height*1.3));
    //this.makeTerrain(X[0] + x, y - height, Length[0], 1, mapWidth, mapHeight, 1);
    for (var i = 1; i < height; i++) {    
      L = this.Random(2 * height - 2 * i, X[i - 1] - 1);
      R = this.Random(X[i - 1] + Length[i - 1] + 1, width - 2 * height + 2 * i - 1);
      //console.log(y + ' ' + height);
      Length[i] = R - L;
      X[i] = L;
      this.makeTerrain(X[i] + x, y - height + i, Length[i], 1, mapWidth, mapHeight, 1);
      //console.log('step ' + X[i] + ' ' + Length[i]);
    }
    //console.log('Hill made ' + x + ' ' + y + ' ' + width + ' ' + height);
  },
  outcroppings: function outcroppings(x, y, width, height, mapWidth, mapHeight) {
    var Rocks = [];
    Rocks = this.randomSpacing(width, 180, 70, 20, 20);
    for (var i = 0; i < Rocks.length; i++) {
      this.boulders(x + Rocks[i], y, mapWidth, mapHeight);
    }
  },
  boulders: function boulders(x, y, mapWidth, mapHeight) {
    var Rock = [];
    var Pebble = [];
    var rockWidth = 0;
    var rockHeight = 0;
    Rock = this.randomSpacing(48, 8, 2, 1, 1);
    for (var i = 0; i < Rock.length; i++) {
      rockWidth = this.Random(3,7);
      rockHeight = this.Random(2,12 - rockWidth);
      this.boulder(x + Rock[i], y, rockWidth, rockHeight, mapWidth, mapHeight);
    }
    Pebble = this.randomSpacing(48, 8, 2, 1, 1);
    // for (var i = 0; i < Pebble.length; i++) {
    //   rockWidth = this.Random(1,2);
    //   rockHeight = this.Random(1,rockWidth);
    //   this.boulder(x + Pebble[i], y, rockWidth, rockHeight, mapWidth, mapHeight);
    // }
  },
  boulder: function boulder(x, y, width, height, mapWidth, mapHeight) {
    var rockObject = {};
    var Ground = 0;
    for (var i = 0; i < width; i++) {
      var test = 0;
      for (var j = 0; j < mapHeight; j++) {
        if (this.map[x + i + j * mapWidth] !== 0) {
          if (Ground < j) {
            Ground = j;
            //console.log('BOOM!!!!!');
          }
          //console.log(j + ' ' + Ground);
          test = j;
          break;
        }
      }
      console.log(test);
    }
    rockObject = this.makeFeature(x, Ground - height, width, height, 0, 0, 0, 0, 0, 2, 0);
    this.mapFeatures.push(rockObject);
    this.drawBoulder(x, Ground - height, width, height, mapWidth, mapHeight);
    console.log('Boulder at: ' + x + ' ' + Ground);
  },
  pebbles: function pebbles(x, y, mapWidth, mapHeight) {
    //
  },
  drawBoulder: function drawBoulder(x, y, width, height, mapWidth, mapHeight) {
    for (var j = 0; j < height + width - 1; j++) {
      for (var i = 0; i < width; i++) {
        if (this.map[x + i + mapWidth * (y + j)] === 0) {
          var R = this.Random(1,4);
          if (width === 1) {
            if (j === 0) {
              this.map[x + i + mapWidth * (y + j)] = 328 + R;
            } else {
              this.map[x + i + mapWidth * (y + j)] = 344 + R;
            }
          } else {
            if (i === 0 && j === 0) {
              this.map[x + i + mapWidth * (y + j)] = 248 + R;
            } else if (i === width - 1 && j === 0) {
              this.map[x + i + mapWidth * (y + j)] = 256 + R;
            } else if (j === 0) {
              this.map[x + i + mapWidth * (y + j)] = 224 + R;
            } else if (i === 0) {
              this.map[x + i + mapWidth * (y + j)] = 216 + R;
            } else if (i === width - 1) {
              this.map[x + i + mapWidth * (y + j)] = 232 + R;
            } else {
              this.map[x + i + mapWidth * (y + j)] = 208 + R;
            }
          }
        } else if (this.map[x + i + mapWidth * (y + j)] === 57) {
          var R = this.Random(1,4);
          this.map[x + i + mapWidth * (y + j)] = 296 + R;
        } else if (this.map[x + i + mapWidth * (y + j)] === 65) {
          var R = this.Random(1,4);
          this.map[x + i + mapWidth * (y + j)] = 304 + R;
        }
      }
    }
  },
  pits: function pits() {

  },
  generate: function generate(mapWidth, mapHeight, type) {
    this.mapSize = mapWidth * mapHeight;
    //Clear Terrain
    for (var i = 0; i < this.mapSize; i++) {
      this.map[i] = 0;
    }
    console.log('DONESIES CLEARING');
    this.makeHorizon(0, 250, mapWidth, mapHeight, mapWidth, mapHeight);
    this.makeTerrain(0, 250, mapWidth, mapHeight - 250, mapWidth, mapHeight, 1);
    this.writeTiles(mapWidth, mapHeight);
    this.outcroppings(0, 250, mapWidth, mapHeight, mapWidth, mapHeight);
    this.setMap(mapWidth, mapHeight, this.maps.length + 1, 'level');
  },
  setMap: function setMap(mapWidth, mapHeight, id, type){
    this.mapData = {
      "id": id,
      "type":type,
      "height":16,
      "layers":[{
        "data":[],
        "height":mapHeight,
        "name":"Tile Layer 1",
        "opacity":1,
        "type":"tilelayer",
        "visible":true,
        "width":mapWidth,
        "x":2,
        "y":2
      }],
      "orientation":"orthogonal",
      "properties":{},
      "tileheight":16,
      "tilesets":[{
        "firstgid":1,
        "image":"grassy_terrain_tiles.png",
        "imageheight":160,
        "imagewidth":640,
        "margin":0,
        "name":"tiles-1",
        "properties":{},
        "spacing":0,
        "tileheight":16,
        "tilewidth":16
      }],
      "tilewidth":16,
      "version":1,
      "width":16
    };
    this.mapData.layers[0].data = this.map;
    this.locationSprites.push(this.locations);
    console.log(this.map);
  },
  writeTiles: function writeTiles(mapWidth, mapHeight) {
    var map = this.map;
    var R = 0;
    var tiledMap = [];
    for (var i = 0; i < mapWidth; i++) {
      for (var j = 0; j < mapHeight; j++) {
        tiledMap[i+mapWidth*j] = 0;
      }
    }
    for (var i = 1; i < mapWidth-1; i++) {
      for (var j = 1; j < mapHeight-1; j++) {
        if (map[i+mapWidth*j] !== 0) {
          if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              //1 1 1
              //1 1 1
              //1 1 1
              R = this.Random(1,6);
              tiledMap[i+mapWidth*j] = 8 + R;
            } else if (map[(i-1)+mapWidth*(j+1)] === 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              //1 1 1
              //1 1 1
              //0 1 1
              R = this.Random(1,6);
              tiledMap[i+mapWidth*j] = 8 + R;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] === 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              //0 1 1
              //1 1 1
              //1 1 1
              R = this.Random(1,6);
              tiledMap[i+mapWidth*j] = 8 + R;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] === 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              //1 1 0
              //1 1 1
              //1 1 1
              R = this.Random(1,6);
              tiledMap[i+mapWidth*j] = 8 + R;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] === 0) {
              //1 1 1
              //1 1 1
              //1 1 0
              R = this.Random(1,6);
              tiledMap[i+mapWidth*j] = 8 + R;
            }
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            //x 1 x
            //0 1 1
            //x 1 x
            R = this.Random(1,2);
            tiledMap[i+mapWidth*j] = 40 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] === 0) {
            //x 1 x
            //1 1 1
            //x 0 x
            R = this.Random(1,6);
            tiledMap[i+mapWidth*j] = 8 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] !== 0) {
            //x 1 x
            //1 1 0
            //x 1 x
            R = this.Random(1,2);
            tiledMap[i+mapWidth*j] = 48 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            //x 0 x
            //1 1 1
            //x 1 x
            R = this.Random(1,6);
            tiledMap[i+mapWidth*j] = 8 + R;
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            //x 0 x
            //0 1 1
            //x 1 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 128 + R;
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] === 0) {
              //x 1 x
              //0 1 1
              //x 0 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 144 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] === 0) {
              //x 1 x
              //1 1 0
              //x 0 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 152 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] !== 0) {
              //x 0 x
              //1 1 0
              //x 1 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 136 + R;
          }
        } else {
          //no collision tiles here
          if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            if (map[(i-1)+mapWidth*(j+1)] === 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              //1 1 1
              //1 0 1
              //0 1 1
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 168 + R;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] === 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              //0 1 1
              //1 0 1
              //1 1 1
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 168 + R;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] === 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              //1 1 0
              //1 0 1
              //1 1 1
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 168 + R;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] === 0) {
              //1 1 1
              //1 0 1
              //1 1 0
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 168 + R;
            }
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
              //x 1 x
              //0 0 1
              //x 1 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 184 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] === 0) {
              //x 1 x
              //1 0 1
              //x 0 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 200 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] !== 0) {
              //x 1 x
              //1 0 0
              //x 1 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 176 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
              //x 0 x
              //1 0 1
              //x 1 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 208 + R;
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
              //x 0 x
              //0 0 1
              //x 1 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 64 + R;
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] === 0) {
              //x 1 x
              //0 0 1
              //x 0 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 72 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] === 0) {
              //x 1 x
              //1 0 0
              //x 0 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 80 + R;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] !== 0) {
              //x 0 x
              //1 0 0
              //x 1 x
            R = this.Random(1,1);
            tiledMap[i+mapWidth*j] = 56 + R;
          }
        }
      }
    }
    for (var i = 0; i < mapWidth; i++) {
      for (var j = 0; j < mapHeight; j++) {
        if (tiledMap[i+mapWidth*j] !== 0) {
          this.map[i+mapWidth*j] = tiledMap[i+mapWidth*j];
        }
      }
    }
  }
};

























