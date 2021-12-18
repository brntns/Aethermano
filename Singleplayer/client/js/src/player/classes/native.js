var Native = {
  playerClass: 4,
  moveMode: 0,
  slashTime: 1600,
  classInit: function () {
    this.sprite.loadTexture('native', 0);
    this.bullets = this.game.add.group();
    this.game.physics.enable(this.bullets, Phaser.Physics.ARCADE);
  },
  classUpdate: function classUpdate() {
    switch (this.moveMode) {
      case 0:
        this.climbingMask();
        if (this.letterS.isDown) {
          if (this.climbBoxUR || this.climbBoxUL) {
            this.switchToClimb();
          }
        }
        //attacking
        if (this.letterS.isDown) {
          //if (this.sprite.body.blocked.down) {
            if (!this.slashed) {
              this.shoot(this);
            }
          //}
        }
        if (this.letterE.isDown) {
          if (!this.ladderOnCD) {
            this.spawningLadder = true;
            this.ladderOnCD = true;
            this.game.time.events.add(this.ladderCD,function(){this.ladderOnCD = false;},this);
          }
        }
      break;
      case 2:
        this.climbingMask();
        //Reverting to Normal Movement
        if (!this.letterS.isDown || (!this.climbBoxUR && !this.climbBoxUL && !this.climbBoxDL && !this.climbBoxDR)) {
          this.switchToNormal();
        }
        this.directions();
        this.climb();
        //spawning a ladder
        if (this.letterE.isDown) {
          if (!this.ladderOnCD) {
            this.ladderSpawn = true;
            this.ladderOnCD = true;
            this.game.time.events.add(this.ladderCD,function(){this.ladderOnCD = false;},this);
          }
        }
      break;
      case 3:
      break;
      default:
        this.moveMode = 0;
      break;
    }
  },
  shoot:function shoot(Player) {
    Player.slashing = true;
    Player.slashAni = true;
    Player.slashed = true;
    var Shoot = null;
    if (Player.Facing === 1 || Player.Facing === 2 || Player.Facing === 8) {
      Shoot = Player.sprite.animations.play('native_shoot_right');
      Player.status = 90;
      Player.bullet = Player.bullets.create(
        Player.sprite.x + 28 * Player.sprite.scale.x,
        Player.sprite.y - 15 * Player.sprite.scale.y,
        'arrow'
      );
    
    } else {
      Shoot = Player.sprite.animations.play('native_shoot_left');
      Player.status = 91;
      Player.bullet = Player.bullets.create(
        Player.sprite.x - 52 * Player.sprite.scale.x,
        Player.sprite.y - 15 * Player.sprite.scale.y,
        'arrow'
      );
    }
    Shoot.onComplete.add(function() {
      Player.slashAni = false;
    });
    Player.game.physics.enable(Player.bullet, Phaser.Physics.ARCADE);
    Player.bullet.scale.set(Player.sprite.scale.x);
    Player.bullet.outOfBoundsKill = true;
    Player.bullet.body.setSize(5 * Player.sprite.scale.x, 3 * Player.sprite.scale.y, 11 * Player.sprite.scale.y, 14 * Player.sprite.scale.y);
    Player.bullet.body.allowGravity = false;
    Player.bullet.body.velocity.y = 0;
    if (Player.Facing === 1 || Player.Facing === 2 || Player.Facing === 8) {
      Player.bullet.body.velocity.x = 400 * Player.sprite.scale.x;
      Player.bullet.frame = 0;
    } else {
      Player.bullet.body.velocity.x = -400 * Player.sprite.scale.x;
      Player.bullet.frame = 11;
    }
    Player.bullet.animations.add('explode_right', [1,2,3,4,5], 10, false);
    Player.bullet.animations.add('explode_left', [10,9,8,7,6], 10, false);
    Player.slashTimer = Player.game.time.events.add(Player.slashTime,function(){
      Player.slashing = false;
      Player.slashed = false;
      if (Player.bullet !== undefined) {
        Player.bullet.kill();
      }
    },this);
  },
 climbingMask: function climbingMask() {
    this.climbboxUR.x = this.sprite.x;
    this.climbboxUR.y = this.sprite.y - 19 * this.sprite.scale.x;
    this.climbboxUL.x = this.sprite.x - 19 * this.sprite.scale.x;
    this.climbboxUL.y = this.sprite.y - 19 * this.sprite.scale.x;
    this.climbboxDL.x = this.sprite.x - 19 * this.sprite.scale.x;
    this.climbboxDL.y = this.sprite.y;
    this.climbboxDR.x = this.sprite.x;
    this.climbboxDR.y = this.sprite.y;
  },
  switchToClimb: function switchToClimb() {
    this.moveMode = 2;
    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
    this.sprite.body.acceleration.x = 0;
    this.sprite.body.acceleration.y = 0;
    this.sprite.body.allowGravity = false;
  },
  climb: function climb() {
    //Shaft
    if (this.climbBoxUR && this.climbBoxUL && this.climbBoxDL && this.climbBoxDR) {
      this.climbing(this.shaftspeed, this.shaftspeed, this.shaftspeed);
      this.climbingAnimation(0, this.H, this.V);
      this.ladderDirection = 1;
    } else {
    //Corner Right
      if (this.climbBoxUR && this.climbBoxUL && this.climbBoxDR) {
        this.climbing(this.overhangspeed, this.climbspeed, this.shimmyspeed);
        this.climbingAnimation(1, this.H, this.V);
        this.ladderDirection = 2;
    //Corner Left
      } else if (this.climbBoxUR && this.climbBoxUL && this.climbBoxDL) {
        this.climbing(this.overhangspeed, this.climbspeed, this.shimmyspeed);
        this.climbingAnimation(1, this.H, this.V);
        this.ladderDirection = 0;
    //Overhang
      } else if (this.climbBoxUR && this.climbBoxUL) {
        this.climbing(this.overhangspeed, this.climbspeed, this.shimmyspeed);
        this.climbingAnimation(1, this.H, this.V);
        this.ladderDirection = 1;
    //Wall to the Right
      } else if (this.climbBoxUR && this.climbBoxDR) {
        this.climbing(this.overhangspeed, this.climbspeed, this.shimmyspeed);
        this.climbingAnimation(2, this.H, this.V);
        this.ladderDirection = 2;
    //Wall to the Left
      } else if (this.climbBoxUL && this.climbBoxDL) {
        this.climbing(this.overhangspeed, this.climbspeed, this.shimmyspeed);
        this.climbingAnimation(3, this.H, this.V);
        this.ladderDirection = 0;
    //Overhang End Right
      } else if (this.climbBoxUL) {
        this.climbing(this.overhangspeed, this.climbspeed, this.overhangspeed);
        this.climbingAnimation(4, this.H, this.V);
        this.ladderDirection = 3;
    //Overhang End Left
      } else if (this.climbBoxUR) {
        this.climbing(this.overhangspeed, this.climbspeed, this.overhangspeed);
        this.climbingAnimation(5, this.H, this.V);
        this.ladderDirection = 3;
    //Wall Top Right
      } else if (this.climbBoxDR) {
        this.climbing(this.overhangspeed, this.climbspeed, this.overhangspeed);
        this.climbingAnimation(2, this.H, this.V);
        this.ladderDirection = 2;
    //Wall Top Left
      } else if (this.climbBoxDL) {
        this.climbing(this.overhangspeed, this.climbspeed, this.overhangspeed);
        this.climbingAnimation(3, this.H, this.V);
        this.ladderDirection = 0;
      }
    }
  },
  climbing: function climbing(sidespeed, upspeed, downspeed) {
    if (this.direction === 8 || this.direction === 1 || this.direction === 2 ) {
      // moving right
      this.sprite.body.velocity.x = sidespeed;
      this.H = 1;
    } else if (this.direction === 4 || this.direction === 5 || this.direction === 6 ) {
      // moving left
      this.sprite.body.velocity.x = -sidespeed;
      this.H = -1;
    } else {
      // resting
      this.sprite.body.velocity.x = 0;
      this.H = 0;
    }
    if (this.direction === 2 || this.direction === 3 || this.direction === 4 ) {
      // moving up
      this.sprite.body.velocity.y = -upspeed;
      this.V = -1;
    } else if (this.direction === 6 || this.direction === 7 || this.direction === 8 ) {
      // moving down
      this.sprite.body.velocity.y = downspeed;
      this.V = 1;
    } else {
      // resting
      this.sprite.body.velocity.y = 0;
      this.V = 0;
    }
  },
   climbingAnimation: function climbingAnimation(N, H, V) {
    //Animation Shaft
    if (!this.slashAni) {
      if (N === 0) {
        //Climb Down
        if (V === 1) {
          this.sprite.animations.play('climb_ladder');
          this.status = 9;
        //Climb Up
        } else if (V === -1) {
          this.sprite.animations.play('climb_ladder');
          this.status = 9;
        //Climb to the Right
        } else if (H === 1) {
          this.sprite.animations.play('climb_ladder');
          this.status = 9;
        //Climb to the Left
        } else if (H === -1) {
          this.sprite.animations.play('climb_ladder');
          this.status = 9;
        //Hang
        } else {
          this.sprite.frame = 30;
          this.status = 10;
        }
      //Animation Overhang
      } else if (N === 1) {
        //Climb to the Right
        if (H === 1) {
          this.sprite.animations.play('climb_right_overhang');
          this.status = 25;
        //Climb to the Left
        } else if (H === -1) {
          this.sprite.animations.play('climb_left_overhang');
          this.status = 24;
        //Hang
        } else {
          this.sprite.frame = 66;
          this.status = 28;
        }
      //Animation Wall Right
      } else if (N === 2) {
        //Climb Down
        if (V === 1) {
          this.sprite.animations.play('climb_right_wall');
          this.status = 21;
        //Climb Up
        } else if (V === -1) {
          this.sprite.animations.play('climb_right_wall');
          this.status = 21;
        //Hang
        } else {
          this.sprite.frame = 61;
          this.status = 25;
        }
      //Animation Wall Left
      } else if (N === 3) {
        //Climb Down
        if (V === 1) {
          this.sprite.animations.play('climb_left_wall');
          this.status = 20;
        //Climb Up
        } else if (V === -1) {
          this.sprite.animations.play('climb_left_wall');
          this.status = 20;
        //Hang
        } else {
          this.sprite.animations.stop();
          this.sprite.frame = 71;
          this.status = 24;
        }
      //Animation Overhang End Right
      } else if (N === 4) {
        //Climb Down
        if (V === 1) {
          this.sprite.animations.play('climb_left_wall');
          this.status = 20;
        //Climb Up
        } else if (V === -1) {
          this.sprite.animations.play('climb_left_wall');
          this.status = 20;
        //Hang
        } else {
          this.sprite.animations.stop();
          this.sprite.frame = 74;
          this.status = 26;
        }
      //Animation Overhang End Left
      } else {
        //Climb Down
        if (V === 1) {
          this.sprite.animations.play('climb_right_wall');
          this.status = 21;
        //Climb Up
        } else if (V === -1) {
          this.sprite.animations.play('climb_right_wall');
          this.status = 21;
        //Hang
        } else {
          this.sprite.animations.stop();
          this.sprite.frame = 64;
          this.status = 27;
        }
      }
    }
  }
};

module.exports = Native;
