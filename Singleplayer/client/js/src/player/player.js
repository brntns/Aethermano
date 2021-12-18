var constants = require('./constants');
var keyMap = require('./keyboard');
var basePlayer = require('./basePlayer');
var movement = require('./movement');
var deathchat = require('./deathchat');


'use strict';

function Player(game,map) {
    this.map = map;
    this.game = game;
    // input
    this.cursors = null;
    this.text = null;
    //player
    this.sprite = null;
    this.hitbox1 = null;
    this.hitbox2 = null;
    this.climbboxUR = null;
    this.climbboxUL = null;
    this.climbboxDL = null;
    this.climbboxDR = null;
    this.status = null;
    this.class = null;
    this.level = null;
    this.shotTimer = 0;
    this.bullet = null;
    this.bullets = null;
    this.detonate = false;
    this.alive = false;
    this.jumpStop = false;
    this.jumpWindow = false;
    this.bunnyKiller = false;
    this.jumpRelease = false;
    this.doubleJumpCondition = false;
    this.greeting = null;
    this.wallJumpL = false;
    this.wallJumpR = false;
    this.wallWindow = false;
    this.tron = null;
    this.tronWindow = false;
    this.teleport = null;
    this.blocks = null;
    this.climbBoxUR = false;
    this.climbBoxUL = false;
    this.climbBoxDL = false;
    this.climbBoxDR = false;
    this.teleportcd = false;
    this.direction = 1;
    this.Facing = 0;
    // this.letterS = null;
    this.slashed = false;
    this.slashing = false;
    this.slashTimer = null;
    this.slashTimer2 = null;
    this.slashAni = false;
    this.dieing = false;
    this.vuln = false;
    this.invul = false;
    this.vulnTime = 1850;
    this.invultime = 750;
    this.slashTime = 500;
    this.ladderDirection = 1;
    this.ladderCD = 5000;
    this.ladderOnCD = false;
    this.onLadder = false;
    this.mountingLadder = false;
    this.spawningLadder = false;
    this.H = 0;
    this.V = 0;
    this.gliding = false;
    this.playerClass = 0;
    this.talking = false;
    this.chat = [];
    this.flying= false;
    this.flycd = false;
    this.flyCd = 5000;
    this.flyTimer = null;
    this.flyingDuration = 3000;
    this.shrinkCd = false;
    this.shrunk = false;
    this.specialOnCd = false;
    this.specialCd = 1000;

    this.scale = 1;
    if (this.sprite !== null && this.sprite !== undefined) {this.scale = this.sprite.scale.x}
    this.updateScale(this.scale)

    this.jumpWindowTimer = null;
    this.jumpSpeedBonus = 0;
    this.moveMode = 0;

    //
    this.inRoom = false;
}

var player = {};

_.extend(player, basePlayer);
_.extend(player, movement);
_.extend(player, keyMap);
_.extend(player, deathchat);

Player.prototype = player;

module.exports = Player;
