'use strict';

function Map(game, player) {
	//this.myGame = myGame;
	this.player = player;
	this.game = game;
  this.maps = null;
	this.room = null;
  this.tilemap = null;
  this.currentMap = null;
	this.tileset = null;
	this.collisionLayer = null;
  this.bleft = null;
	this.bright =  null;
	this.btop =  null;
	this.bbottom =  null;
	this.lastPos = null;
}

var mapBase = {
	create: function create(data) {
    // console.log(data);
    this.maps = data;
    this.setCurrentLevel(this.maps[0].map[0],'map',this.maps[0].map[0].type);
	},
  setCurrentLevel: function setCurrentLevel(level,name,type) {
		// console.log(level);
    this.currentMap = level;
		this.player.sprite.x = 400;
		this.player.sprite.y = 200;
    // this.currentMap = level;
    if (this.collisionLayer !== null) {
      this.collisionLayer.destroy();
    	//console.log('destroyed');
    }
    this.tilemap = this.game.load.tilemap(level.id, null, level, Phaser.Tilemap.TILED_JSON);
    this.tileset = this.game.add.tilemap(level.id);
    this.tileset.addTilesetImage('tiles-1');
    this.tileset.setCollisionByExclusion([
      0
    ]);
    //set collisionLayer
    this.collisionLayer = this.tileset.createLayer('Tile Layer 1');
		this.collisionLayer.renderSettings.enableScrollDelta = true;
    this.collisionLayer.resizeWorld();
		if (type === 'room') {
			this.room = this.game.add.sprite(this.game.world.centerX - 32,this.game.world.centerY , 'door_inner');
			this.game.physics.arcade.enable(this.room);
			this.room.body.allowGravity  = false;
		} else {
			if(this.room){
				this.room.kill();
			}
		}
  }
}

var map = {};
_.extend(map, mapBase);

Map.prototype = map;

module.exports = Map;
