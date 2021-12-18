var Survivor = require('./survivor');
var Enemy = require('./enemy');
var Menu = require('./menu/menu');

function Client(game) {
	this.game = game;
	this.socket = null;
	//this.isActive = false;
  this.debug = true;
};

var clientBase = {
	create: function(){
		//connect to socket
		var game = this.game;
		//add player
		this.menu = new Menu(this,game);
		this.game.player.create();
		this.menu.create();
		this.game.player.sprite.visible = false;
		this.game.player.spawn(0, 0,0);
		//socket events
		// this.socket.on('playerConnected', function(data){
		// 	game.player.id = data.id;
		// });
		// this.socket.on('playerSpawn', function(data){
		// 	game.player.spawn(data.x, data.y,data.level);
		// 	game.player.sprite.visible = true;
		// });
		// this.socket.on('updatePlayers', function(data){
		// 	_.each(data, function(updateSurvivor){
		// 		if(updateSurvivor.id !== game.player.id){
		// 			var survivor = _.find(game.survivors, function(s){
		// 				return s.id === updateSurvivor.id;
		// 			});
		// 			var compass = _.find(game.compasses, function(c){
		// 				return c.id === updateSurvivor.id;
		// 			});
		// 			if (!survivor && !compass) {
		// 					console.log('creating survivors');
		// 				var survivor = new Survivor(updateSurvivor.id, game);
		// 				var compass = new Compass(updateSurvivor.id, game);
		// 				survivor.create(updateSurvivor);
		// 				game.survivors.push(survivor);
		// 			} else {
		// 			//	console.log('updating survivors');
		// 				survivor.sprite.x = updateSurvivor.x;
		// 				survivor.sprite.y = updateSurvivor.y;
		// 				survivor.sprite.status = updateSurvivor.status;
    //         survivor.sprite.level = updateSurvivor.level;
		// 				survivor.sprite.class = updateSurvivor.class;
		// 			}
		// 			survivor.update();
		// 		}
		// 	})
		// });
		// this.socket.on('removePlayer', function(id){
		// 	var player = _.remove(game.survivors, function(player) {
		// 		return player.id === id;
		// 	});
		// 	if(player.length > 0){
		// 		player[0].sprite.destroy();
		// 	}
		// });
		// // Map
		// this.socket.on('changeLevel', function(data){
		// 	//console.log(data);
		// 	game.player.level = data.level;
		// });
		// this.socket.on('getMap', function(data){
		// 	//console.log(data);
		// 	game.worldMap = data;
		// 	socket.emit('mapCreated');
		// });
		// // Monster Events
		// this.socket.on('updateMonsters', function(data){
			// if(data.length === undefined){
			// 	var monster = _.find(game.monsters, function(m){
			// 		return m.id === data.id;
			// 	});
			// 	if(!monster){
			// 		console.log('creating monster');
			// 		var monster = new Enemy(data.id, game);
			// 		monster.create(data);
			// 		game.monsters.push(monster);
			// 	} else{
			// 	//	console.log(data);
			// 		monster.sprite.x = data.x;
			// 		monster.sprite.y = data.y;
			// 		// monster.sprite.body.velocity.x = data.velox;
			// 		// monster.sprite.body.velocity.y = data.veloy;
			// 		monster.hitpoints = data.hp;
			// 	}
			// }
			// else{
		// 		_.each(data, function(monsterData){
		// 			//console.log(monsterData);
		// 			var monster = _.find(game.monsters, function(m){
		// 				return m.id === monsterData.id;
		// 			});
		// 			if(!monster){
		// 				console.log('creating monster');
		// 				var monster = new Enemy(monsterData.id, game);
		// 				monster.create(monsterData);
		// 				game.monsters.push(monster);
		// 			} else{
		// 				console.log('updating monster')
		// 				monster.sprite.x = monsterData.x;
		// 				monster.aggro = monsterData.aggro;
		// 				monster.sprite.y = monsterData.y;
		// 				monster.sprite.body.velocity.x = monsterData.velox;
		// 				monster.sprite.body.velocity.y = monsterData.veloy;
		// 				monster.sprite.hitpoints = monsterData.hp;
		// 			}
		// 			// monster.update(monsterData);
		// 		})
		// 	//}
		// });
		// this.socket.on('removeMonster', function(id){
		// 	var monster = _.remove(game.monsters, function(m) {
		// 		return m.id === id;
		// 	});
		// 	if(monster.length > 0){
		// 		monster[0].sprite.destroy();
		// 	}
		// });
		// this.socket.on('updateChat', function(data){
		// 	game.incomingChat.push(data);
		// 	if(game.incomingChat.length > 6){
		// 		game.incomingChat.splice(0,1);
		// 	}
		// 	game.globalChat(data);
		// });
		// this.socket.on('buildLadder', function(ladder){
		// 	game.ladderSpawn(ladder.x,ladder.y,ladder.dir);
		// });
		// this.socket.on('buildvine', function(vine){
		// 	game.vineSpawn(vine.x,vine.y,vine.dir);
		// });
	},
};


var clients = {};
_.extend(clients, clientBase);

Client.prototype = clients;
module.exports = Client;
