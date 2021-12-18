var Builder = {
  playerClass: 10,
  moveMode: 0,
  slashTime: 500,
  classInit: function () {
    this.sprite.loadTexture('builder', 0);
    this.bullets = this.game.add.group();
    this.game.physics.enable(this.bullets, Phaser.Physics.ARCADE);
  },
  classUpdate: function classUpdate() {
    switch (this.moveMode) {
      case 0:
        this.slashingDirection();
        if (this.letterS.isDown) {
          if (!this.slashed) {
            this.slashat();
            this.slashed = true;
          }
        } else {
          this.slashed = false;
        }
      break;
      case 2:
      break;
      case 3:
      break;
      default:
        this.moveMode = 0;
      break;
    }
  },
  build: function build () {
    
  },
  slashat: function slashat() {
    if (this.Facing === 1 || this.Facing === 2 || this.Facing === 3 || this.Facing === 8) {
      this.sprite.animations.play('builder_dig_right');
      this.status = 50;
    } else if (this.Facing === 4 || this.Facing === 5 || this.Facing === 6 || this.Facing === 7) {
      this.sprite.animations.play('builder_dig_left');
      this.status = 51;
    }
    this.hitbox1.visible = true;
    this.hitbox2.visible = true;
    this.slashing = true;
    this.slashAni = true;
    this.game.time.events.remove(this.slashTimer);
    this.slashTimer = this.game.time.events.add(this.slashTime,function(){
      this.hitbox1.visible = false;
      this.hitbox2.visible = false;
      this.slashing = false;
      this.slashAni = false;
    },this);
  },
  slashingDirection: function slashingDirection() {
    this.hitbox2.x = this.sprite.x - 15;
    this.hitbox2.y = this.sprite.y - 15;
    if (this.Facing === 1 || this.Facing === 2 || this.Facing === 3 || this.Facing === 8) {
      //right
      this.hitbox1.x = this.sprite.x + 5;
      this.hitbox1.y = this.sprite.y - 15;
    } else if (this.Facing === 4 || this.Facing === 5 || this.Facing === 6 || this.Facing === 7) {
      //left
      this.hitbox1.x = this.sprite.x - 35;
      this.hitbox1.y = this.sprite.y - 15;
    }
  }
};

module.exports = Builder;