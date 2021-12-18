'use strict';
var _ = require('lodash');
var debug = true;
var gameMines = require('./templates/mines.js');
var gameGrassy = require('./templates/grassy.js');
var gameTestmap = require('./templates/testmap.js');
var Items = require('./templates/decorator/items.js');
var mines = new gameMines.Mines();
var grassy = new gameGrassy.Grassy();
var testmap = new gameTestmap.Testmap();
var items = new Items.Items();


exports.World = function(){
	this.maps = [];

};
exports.World.prototype = {
	create: function () {
    console.log('WORLD CREATED! IT BETTER NOT BE CREATED TWICE!');
		this.build(0,'level',1000,300);
		// this.build(1,'room',50,30);
		// this.build(2,'room',50,30);
		// this.build(3,'room',50,30);
	  // this.build(4,'room',50,30);
		// this.build(5,'level',300,100);
		// this.build(6,'level',300,100);
		// console.log(this.maps);
	},
	build: function build(id,type,width,height){
    var LEVEL = mines;
		var mapWrap = {
			id:id,
      type:type,
			map: [],
			locations: [],
			spawnpoints: [],
			monsters: [],
			entrances: [],
			exits: []
		};
		//level
		LEVEL.generate(width,height,type);
		// push and clear
		mapWrap.map.push(LEVEL.mapData);
		// mapWrap.monsters = mines.monsters;
  //   if(type === 'level'){
  //     var doorX = mines.rooms[id].x;
  //     var doorY = mines.rooms[id].y + mines.rooms[id].height - 4;
  //   } else {
  //     var doorX = Math.floor(width / 2);
  //     var doorY = Math.floor(height / 2);
  //   }
  //   items.createItem(doorX,doorY,'door',id + 1);

		// mapWrap.locations.push(items.itemData);
		this.maps.push(mapWrap);
		LEVEL.clear();
		//items.clear();
	}
};
