'use strict';
//var fs = require('fs');
var _ = require('lodash');
var debug = true;
var Monster = require('./decorator/monster.js');
var BMF = require('./base_map_fun');
var Items = require('./decorator/items.js');
var monster = new Monster.Monster();
var items = new Items.Items();

exports.Testmap = function(){
  this.monsters = [];
  this.mapData = {};
  this.map = [];
  this.maps = [];
  this.rooms = [];
	this.locationSprites = [];
  this.locations = [];
  this.mapFeatures = [];
};
exports.Testmap.prototype = {
  //_.extend(this, BMF);
    //console.log('Creating New Map...');
    //console.log('Done Creating Map!' + JSON.stringify(this.maps.length));
  clear: function clear() {
		this.mapData = {};
    this.mapSize = 0;
    this.map = [];
		this.rooms = [];
    this.locationSprites = [];
    this.locations = [];
    this.mapFeatures = [];
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
  randomizeTerrain: function randomizeTerrain(n, x, y, width, height, mapWidth, mapHeight, color) {
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
  inMapBounds: function inMapBounds (object, mapWidth, mapHeight) {
    if (object.x < 0 || object.x + object.width > mapWidth || object.y < 0 || object.y + object.height > mapHeight) {
      return false;
    }
    return true;
  },
  tester: function tester(mapWidth, mapHeight) {
    // this.makeTerrain(0,0,mapWidth,mapHeight,mapWidth,mapHeight,14);
    var R = this.Random(0,30);
    this.makeTerrain(R, R+10, 50, 2, mapWidth, mapHeight, 14);
  },
  generate: function generate(mapWidth, mapHeight, type) {
    this.mapSize = mapWidth * mapHeight;
    //Clear Terrain
    for (var i = 0; i < this.mapSize; i++) {
      this.map[i] = 0;
    }
    this.tester(mapWidth, mapHeight);
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
				"image":"tiles-1.png",
				"imageheight":16,
				"imagewidth":256,
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
    //this.maps.push(this.mapData);
    this.locationSprites.push(this.locations);
    //console.log(this.locationSprites);
    // if(type === 'level'){
    //   var doorX = map.rooms[id].x;
    //   var doorY = map.rooms[id].y + map.rooms[id].height - 4;
    // } else {
    //   var doorX = Math.floor(width / 2);
    //   var doorY = Math.floor(height / 2);
    // }
    // items.createItem(200,200,'door',21);
    //console.log(this.maps);
  }
};