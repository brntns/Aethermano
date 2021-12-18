'use strict';
//var fs = require('fs');
var _ = require('lodash');
var debug = true;
var Monster = require('./decorator/monster.js');
var BMF = require('./base_map_fun');
var Items = require('./decorator/items.js');
var monster = new Monster.Monster();
var items = new Items.Items();

exports.Mines = function(){
  this.monsters = [];
  this.mapData = {};
  this.map = [];
  this.maps = [];
  this.shafts = [];
  this.connectors = [];
  this.connectorRooms = [];
  this.branches = [];
  this.rooms = [];
  this.locationSprites = [];
  this.locations = [];
  this.mapFeatures = [];
};
exports.Mines.prototype = {
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
  mainShafts: function mainShafts(x, y, width, height) {
    var spacingMax = 250;
    var spacingMin = 100;
    var bufferMin = 50;
    var bufferMax = 50;
    var X = 0;
    var Y = y;
    var Width = 12;
    var Height = 0;
    var boundLeft = 0;
    var boundRight = 0;
    var shaft = {};
    var shaftStarts = this.randomSpacing(width - Width, spacingMax, spacingMin, bufferMin, bufferMax);
    for (var i = 0; i < shaftStarts.length; i++) {
      X = shaftStarts[i];
      Height = this.Random(Math.floor(height/1.5),height-10);
      boundLeft = x+i*Math.floor(width/shaftStarts.length);
      boundRight = x+(i+1)*Math.floor(width/shaftStarts.length);
      shaft = this.makeFeature(X, Y, Width, Height, boundLeft, boundRight, 0, 0, 0, 1, 0);
      this.shafts.push(shaft);
      this.mapFeatures.push(shaft);
    }
  },
  connectShafts: function connectShafts(x, y, width, height, mapWidth, mapHeight) {
    var spacingMax = 100;
    var spacingMin = 50;
    var bufferMin = 15;
    var bufferMax = 15;
    var X = 0;
    var Y = 0;
    var Width = 0;
    var Height = 8;
    var connector = {};
    if (this.shafts.length > 1) {
      for (var i = 0; i < this.shafts.length-1; i++) {
        var boundary1 = Math.max(this.shafts[i].y,this.shafts[i+1].y,10);
        var boundary2 = Math.min(this.shafts[i].y + this.shafts[i].height - 10, this.shafts[i+1].y + this.shafts[i+1].height - 10);
        var connectorStarts = this.randomSpacing(boundary2-boundary1 - Height, spacingMax, spacingMin, bufferMin, bufferMax);
        for (var j = 0; j < connectorStarts.length; j++) {
          X = this.shafts[i].x + this.shafts[i].width;
          Y = connectorStarts[j];
          Width = this.shafts[i+1].x - this.shafts[i].x - this.shafts[i].width;
          connector = this.makeFeature(X, Y, Width, Height, 0, 0, 0, 0, 0, 2, 0);
          this.connectors.push(connector);
          this.mapFeatures.push(connector);
        }
      }
    }
  },
  makeConnectorRooms: function makeConnectorRooms(x, y, width, height, mapWidth, mapHeight) {
    var spacingMax = 75;
    var spacingMin = 50;
    var bufferMin = 5;
    var bufferMax = 5;
    var X = 0;
    var Y = 0;
    var Width = 0;
    var Height = 0;
    var room = {};
    if (this.connectors.length > 0) {
      for (var i = 0; i < this.connectors.length; i++) {
        var connectorRoomStarts = this.randomSpacing(this.connectors[i].width, spacingMax, spacingMin, bufferMin, bufferMax);
        for (var j = 0; j < connectorRoomStarts.length; j++) {
          X = this.connectors[i].x + connectorRoomStarts[j];
          Width = this.Random(12,35);
          Y = this.connectors[i].y + this.connectors[i].height - this.Random(12,Width);
          Height = this.connectors[i].y - Y + this.connectors[i].height;
          room = this.makeFeature(X, Y, Width, Height, 0, 0, 0, 0, 0, 5, 0);
          var testRoom = this.makeFeature(X-3, Y-3, Width+6, Height+6, 0, 0, 0, 0, 0, 5, 0);
          if (!this.intersectAll(testRoom, this.shafts)
          && !this.intersectAll(testRoom, this.connectorRooms)
          && this.inMapBounds(testRoom, mapWidth, mapHeight)) {
            this.connectorRooms.push(room);
            this.mapFeatures.push(room);
          }
        }
      }
    }
  },
  branchFeature: function branchFeature(array, x, y, width, height, mapWidth, mapHeight) {
    var spacingMax = 10;
    var spacingMin = 5;
    var bufferMin = 3;
    var bufferMax = 3;
    var n = 0;
    var X = 0;
    var Y = 0;
    var Width = 0;
    var Height = 7;
    var branch = {};
    var room = {};
    var sizeXMin = 18;
    var sizeXMax = 32;
    var sizeYMin = 12;
    var sizeX = 0;
    var sizeY = 0;
    var offsetMax = 3;
    if (array.length > 1) {
      for (var i = 0; i < array.length; i++) {
        var branchStarts = this.randomSpacing(array[i].height-Height, spacingMax, spacingMin, bufferMin, bufferMax);
        for (var j = 0; j < branchStarts.length; j++) {
          branch = this.makeBranch(array[i], branchStarts[j]+array[i].y, X, Y, Width, Height, 0);
          sizeX = this.Random(sizeXMin,sizeXMax);
          sizeY = this.Random(sizeYMin,sizeX+2);
          var offset = this.Random(0,offsetMax);
          room = this.makeRoom(branch, sizeX, sizeY, offset, 0);
          var testBranch = this.makeFeature(branch.x-1, branch.y-2, branch.width-2, branch.height + 4, 0, 0, 0, 0, 0, branch.type, branch.subtype);
          var testRoom = this.makeRoom(testBranch, sizeX + 6, sizeY + 6, offset, 0);
          if (!this.intersectAll(testBranch, this.mapFeatures)
          && !this.intersectAll(testRoom, this.mapFeatures)
          && this.inMapBounds(testBranch, mapWidth, mapHeight)
          && this.inMapBounds(testRoom, mapWidth, mapHeight)) {
            this.branches.push(branch);
            this.rooms.push(room);
            this.mapFeatures.push(branch);
            this.mapFeatures.push(room);
          }
        }
        var branchStarts = this.randomSpacing(array[i].height - Height, spacingMax, spacingMin, bufferMin, bufferMax);
        for (var j = 0; j < branchStarts.length; j++) {
          branch = this.makeBranch(array[i], branchStarts[j]+array[i].y, X, Y, Width, Height, 1);
          sizeX = this.Random(sizeXMin,sizeXMax);
          sizeY = this.Random(sizeYMin,sizeX+2);
          var offset = this.Random(0,offsetMax);
          room = this.makeRoom(branch, sizeX, sizeY, offset, 1);
          var testBranch = this.makeFeature(branch.x+1, branch.y-2, branch.width-2, branch.height + 4, 0, 0, 0, 0, 0, branch.type, branch.subtype);
          var testRoom = this.makeRoom(testBranch, sizeX + 6, sizeY + 6, offset, 1);
          if (!this.intersectAll(testBranch, this.mapFeatures)
          && !this.intersectAll(testRoom, this.mapFeatures)
          && this.inMapBounds(testBranch, mapWidth, mapHeight)
          && this.inMapBounds(testRoom, mapWidth, mapHeight)) {
            this.branches.push(branch);
            this.rooms.push(room);
            this.mapFeatures.push(branch);
            this.mapFeatures.push(room);
          }
        }
      }
    }
    //console.log(this.rooms);
  },
  makeBranch: function makeBranch(object, branchStarts, X, Y, Width, Height, orientation) {
    if (orientation === 0) {
      X = this.Random(object.x - 20, object.x - 5);
      Width = object.x - X;
    } else {
      X = object.x + object.width;
      Width = this.Random(5, 20);
    }
    Y = branchStarts;
    return this.makeFeature(X, Y, Width, Height, 0, 0, 0, 0, 0, 3, object.subtype + 1);
  },
  makeRoom: function makeRoom(object, sizeX, sizeY, offset, orientation) {
    if (orientation === 0) {
      var X = object.x - sizeX;
    } else {
      var X = object.x + object.width;
    }
    var Y = object.y - sizeY + object.height + offset;
    var Width = sizeX;
    var Height = sizeY;
    return this.makeFeature(X, Y, Width, Height, 0, 0, 0, 0, 0, 4, object.subtype);
  },
  writeToMap: function writeToMap(array, mapWidth, mapHeight) {
    for (var j = 0; j < array.length; j++) {
      this.makeTerrain(array[j].x, array[j].y, array[j].width, array[j].height, mapWidth, mapHeight, array[j].color);
    }
  },
  writeTiles: function writeTiles(mapWidth, mapHeight) {
    var map = this.map;
    for (var i = 1; i < mapWidth-1; i++) {
      for (var j = 1; j < mapHeight-1; j++) {
        if (map[i+mapWidth*j] !== 0) {
          if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            if (map[(i-1)+mapWidth*(j+1)] === 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              map[i+mapWidth*j] = 3;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] === 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              map[i+mapWidth*j] = 2;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] === 0
            && map[(i+1)+mapWidth*(j+1)] !== 0) {
              map[i+mapWidth*j] = 5;
            } else if (map[(i-1)+mapWidth*(j+1)] !== 0
            && map[(i-1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j-1)] !== 0
            && map[(i+1)+mapWidth*(j+1)] === 0) {
              map[i+mapWidth*j] = 4;
            }
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            map[i+mapWidth*j] = 6;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] === 0) {
            map[i+mapWidth*j] = 7;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] !== 0) {
            map[i+mapWidth*j] = 8;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            map[i+mapWidth*j] = 9;
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] !== 0) {
            map[i+mapWidth*j] = 10;
          } else if (map[(i-1)+mapWidth*j] === 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j+1)] === 0) {
            map[i+mapWidth*j] = 11;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] !== 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] === 0) {
            map[i+mapWidth*j] = 12;
          } else if (map[(i-1)+mapWidth*j] !== 0
          && map[i+mapWidth*(j-1)] === 0
          && map[(i+1)+mapWidth*j] === 0
          && map[i+mapWidth*(j+1)] !== 0) {
            map[i+mapWidth*j] = 13;
          }
        }
      }
    }
  },
  countRooms: function countRooms(array) {
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
  addMonsters: function addMonsters(object, n) {
    for (var i = 0; i < n; i++) {
      var X = this.Random(object.x,object.x+object.width-1);
      var Y = this.Random(object.y,object.y+object.height-1);
      var spawnPoint = {
       'x': X,
       'y':Y
      };
      monster.spawn(spawnPoint);
      this.monsters.push(monster.monsterData);
    }
  },
  spawnMonsters: function spawnMonsters(array) {
    for (var i = 0; i < array.length; i++) {
      var n = this.Random(0,4);
      this.addMonsters(array[i], n)
    }
  },
  caveIn: function caveIn(array, mapWidth, mapHeight) {
    var map = this.map;
    var caveinindex = this.randomSpacing(array.length, 2, 1, 1, 1);
    for (var i = 0; i < caveinindex.length; i++) {
      var room = array[caveinindex[i]];
      var Length = Math.min(this.Random(3,6),room.width);
      var Depth = room.height + 1;
      var X = room.x + this.Random(0,room.width-Length);
      var Y = room.y;
      var DX = -1;
      var DLength = 2;
      var S = 1;
      var T = 1;
      var D = 0;
      var FlagL = false;
      var FlagR = false;
      for (var j = 0; j < Depth; j++) {
        for (var k = 0; k < Length; k++) {
          if (j === 0 && Y > 1) {
            map[X+k+mapWidth*(Y-1)] = 57;
          } else if (Y < mapHeight-1-j) {
            if (X+k > 0 && X+k < mapWidth) {
              var R = this.Random(0,3);
              if (map[X+k+mapWidth*(Y-1+j)] === 0) {
                if (k === 0) {
                  if (DX === -1) {
                    map[X+k+mapWidth*(Y-1+j)] = 25 + R;
                  } else {
                    map[X+k+mapWidth*(Y-1+j)] = 33 + R;
                  }
                } else if (k === Length-1) {
                  if (DLength === 1) {
                    map[X+k+mapWidth*(Y-1+j)] = 49 + R;
                  } else {
                    map[X+k+mapWidth*(Y-1+j)] = 41 + R;
                  }
                } else {
                  map[X+k+mapWidth*(Y-1+j)] = 17 + R;
                }
              }
            }
          }
        }
        X += DX;
        Length += DLength - DX;        
        if (j === S) {
          DX = 1 - this.Random(0,1)*2;
          D = this.Random(2,Length);
          S += D;
        }
        if (j === T) {
          DLength = 1 - this.Random(0,1)*2;
          D = this.Random(2,Length);
          T += D;
        }
      }
    }
  },
  Bedrock: function Bedrock(x, y, width, height, mapWidth, mapHeight) {
    this.makeTerrain(x, y, width, height, mapWidth, mapHeight, 1);
    //this.makeTerrain(100, 25, 100, 50, mapWidth, mapHeight, 0);
    this.mainShafts(x, y+3, width, height-3);
    this.connectShafts(x, y+3, width, height-3, mapWidth, mapHeight);
    this.makeConnectorRooms(x, y+3, width, height-3, mapWidth, mapHeight);
    this.branchFeature(this.shafts, x, y+3, width, height-3, mapWidth, mapHeight);
    this.branchFeature(this.connectorRooms, x, y+3, width, height-3, mapWidth, mapHeight);
    this.branchFeature(this.rooms, x, y+3, width, height-3, mapWidth, mapHeight);
    this.writeToMap(this.mapFeatures, mapWidth, mapHeight);
    this.randomizeTerrain(100, x, y, width, height, mapWidth, mapHeight, 14);
    this.writeTiles(mapWidth,mapHeight);
    this.randomizeTerrain(500, x, y, width, height, mapWidth, mapHeight, 14);
    this.caveIn(this.rooms, mapWidth, mapHeight);
    // this.caveIn(this.branches, mapWidth, mapHeight);
    var N = this.countRooms(this.mapFeatures);
    // this.spawnMonsters(this.rooms);
    // console.log(N);
  },
  generate: function generate(mapWidth, mapHeight, type) {
    this.mapSize = mapWidth * mapHeight;
    //Clear Terrain
    for (var i = 0; i < this.mapSize; i++) {
      this.map[i] = 0;
    }
    if (type === 'room') {
      this.setMap(mapWidth, mapHeight, this.maps.length + 1, 'room');
      this.makeTerrain(0, 0, mapWidth, mapHeight, mapWidth, mapHeight, 13);
      this.makeTerrain(mapWidth / 2 - 12, mapHeight / 2 - 8, mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 0);
    } else {
      this.Bedrock(0, 0, mapWidth, mapHeight, mapWidth, mapHeight);
      this.setMap(mapWidth, mapHeight, this.maps.length + 1, 'level');
    }
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
        "imageheight":160,
        "imagewidth":128,
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
