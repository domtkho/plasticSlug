var playState = {

  create: function(){

    // Add joystick touch controls
    this.pad = this.game.plugins.add(Phaser.VirtualJoystick);

    this.stick = this.pad.addStick(80, 250, 100, 'arcade');
    this.stick.deadZone = 0;
    this.stick.scale = 0.5;

    this.buttonA = this.pad.addButton(500, 250, 'arcade', 'button1-up', 'button1-down');
    this.buttonA.onDown.add(this.fireFireball, this);
    this.buttonA.scale = 0.9;
    this.buttonA.repeatRate = 100;
    this.buttonA.addKey(Phaser.Keyboard.CONTROL);

    // Add road
    this.road = this.game.add.tileSprite(0, 0, this.game.width, game.cache.getImage("road").height, "road");

    // Add player
    this.player = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "player");
    this.player.anchor.setTo(1, 0.5);
    game.physics.arcade.enable(this.player);
    this.player.animations.add('runRight', [6,7,8], 8, true);
    this.player.animations.add('runLeft', [3,4,5], 8, true);
    this.player.body.collideWorldBounds = true;

    // Add enemy group
    this.enemies = game.add.group();
    this.enemies.enableBody = true;
    this.enemies.createMultiple(20, 'enemy');
    this.enemies.setAll('checkWorldBounds', true);
    this.enemies.setAll('outOfBoundsKill', true);

    // Add fireball group
    this.fireballs = game.add.group();
    this.fireballs.enableBody = true;
    this.fireballs.createMultiple(20, 'fireball');
    this.fireballs.setAll('anchor.x', 1);
    this.fireballs.setAll('anchor.y', 0.5);
    this.fireballs.setAll('checkWorldBounds', true);
    this.fireballs.setAll('outOfBoundsKill', true);

    // Add gold group
    this.golds = game.add.group();
    this.golds.enableBody = true;
    this.golds.createMultiple(20, 'gold');
    this.golds.setAll('anchor.x', 0);
    this.golds.setAll('anchor.y', 0.5);
    this.golds.setAll('checkWorldBounds', true);
    this.golds.setAll('outOfBoundsKill', true);

    // Add powerUps group
    this.powerUps = game.add.group();
    this.powerUps.enableBody = true;
    this.powerUps.createMultiple(20, 'powerUp');
    this.powerUps.setAll('anchor.x', 0);
    this.powerUps.setAll('anchor.y', 0.5);
    this.powerUps.setAll('checkWorldBounds', true);
    this.powerUps.setAll('outOfBoundsKill', true);

    // Create emitter
    this.emitter = game.add.emitter(0, 0, 15);
    this.emitter.makeParticles('pixel');
    this.emitter.setYSpeed(-150, 150);
    this.emitter.setXSpeed(-150, 150);
    this.emitter.gravity = 0;

    // Add score label
    this.scoreLabel = game.add.text(20, 20, 'Score: 0', {font: "20px Arial", fill: "#FFFFFF"});
    this.goldLabel = game.add.text(170, 20, 'Gold: 0', {font: "20px Arial", fill: "#FFFFFF"});
    this.powerUpLevelLabel = game.add.text(320, 20, 'Power: 1', {font: "20px Arial", fill: "#FFFFFF"});
    this.livesLabel = game.add.text(470, 20, 'Lives: 3', {font: "20px Arial", fill: "#FFFFFF"});

    // Initialze variables
    this.nextEnemy = 0;
    this.nextGold = 0;
    this.nextPowerUp = 0;
    this.game.global.score = 0;
    this.game.global.gold = 0;
    this.game.global.powerUpLevel = 1;
    this.game.global.lives = 3;
  },

  update: function(){
    this.road.tilePosition.x -= 1;
    game.physics.arcade.overlap(this.fireballs, this.enemies, this.enemyHit, null, this);
    game.physics.arcade.overlap(this.player, this.golds, this.collectGold, null, this);
    game.physics.arcade.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    game.physics.arcade.overlap(this.player, this.enemies, this.playerHit, null, this);

    if (this.game.time.now > this.nextEnemy){
      var enemyDelay = 500 + Math.round(Math.random() * 1000);
      this.nextEnemy = this.game.time.now + enemyDelay;
      this.newEnemy(this.randomLeftRight());
    }

    if (this.game.time.now > this.nextGold){
      var goldDelay = 0 + Math.round(Math.random() * 5000);
      this.nextGold = this.game.time.now + goldDelay;
      this.newGold();
    }

    if (this.game.time.now > this.nextPowerUp){
      var powerUpDelay = 10000 + Math.round(Math.random() * 10000);
      this.nextPowerUp = this.game.time.now + powerUpDelay;
      this.newPowerUp();
    }

    this.movePlayer();
  },

  movePlayer: function(){
    if (!this.player.alive){
      return;
    }

    var maxSpeed = 300;
    if (this.stick.isDown) {
      this.physics.arcade.velocityFromRotation(this.stick.rotation, this.stick.force * maxSpeed, this.player.body.velocity);
      if(this.player.body.velocity.x < 0){
        this.updatePlayerDirection("left");
        this.player.play('runLeft');
      } else if (this.player.body.velocity.x > 0){
        this.updatePlayerDirection("right");
        this.player.play('runRight');
      } else {
        this.updatePlayerDirection("right");
        this.player.body.velocity.x = 0;
        this.player.animations.stop(0, true);
      }
      this.scaleSize(this.player);
    } else {
      this.player.body.velocity.set(0);
    }

  },

  fireFireball: function(){
    if (!this.player.alive){
      return;
    }

    var fireball = this.fireballs.getFirstDead();
    if (!fireball){
      return;
    }
    var direction = this.game.global.playerDirection;
    this.scaleSize(fireball, 0.5 * (1 + this.game.global.powerUpLevel * 0.2));
    fireball.animations.add('fire', [0,1,2,3], 10, true);
    fireball.animations.play('fire');
    if (direction === "right"){
      fireball.reset(this.player.x + 20, this.player.y);
      fireball.body.velocity.x = 400;
    } else {
      fireball.reset(this.player.x - this.player.width / 2 - 20, this.player.y);
      fireball.body.velocity.x = -400;
    }
  },

  collectGold: function(player, gold){
    gold.kill();
    this.increaseAttribute("gold", 20);
  },

  collectPowerUp: function(player, powerUp){
    powerUp.kill();
    this.increaseAttribute("powerUpLevel", 1);
  },

  enemyHit: function(enemy, fireball){
    fireball.kill();
    enemy.kill();
    this.increaseAttribute("score", 100);
  },

  playerHit: function(player, enemy){
    enemy.kill();
    this.resetPowerUpLevel();
    this.increaseAttribute("lives", -1);
    if (this.game.global.lives === 0){
      this.playerDie();
      this.player.kill();
      // Set the position of the emitter on the player
      this.emitter.x = this.player.x;
      this.emitter.y = this.player.y;

      // Start the emitter, by exploding 15 particles that will live for 600ms
      this.emitter.start(true, 600, null, 15);
    }
  },

  newEnemy: function(direction){
    var enemy = this.enemies.getFirstDead();
    if(!enemy){
      return;
    }
    enemy.animations.add('runLeft', [0,1,2], 10, true);
    enemy.animations.add('runRight', [3,4,5], 10, true);
    if (direction === 'left'){
      enemy.anchor.setTo(0, 0.5);
      enemy.reset(this.game.width, this.game.height * this.randomHeightMultiplier() );
      this.scaleSize(enemy);
      enemy.body.velocity.x = -200;
      enemy.animations.play('runLeft');
    } else {
      enemy.anchor.setTo(1, 0.5);
      enemy.reset(0, this.game.height * this.randomHeightMultiplier() );
      this.scaleSize(enemy);
      enemy.body.velocity.x = 100;
      enemy.animations.play('runRight');
    }
  },

  newGold: function(){
    var gold = this.golds.getFirstDead();
    if (!gold){
      return;
    }
    gold.animations.add('spin',[0,1,2,3,4,5,6,7], 10, true);
    gold.reset(this.game.width, this.game.height * this.randomHeightMultiplier());
    this.scaleSize(gold);
    gold.body.velocity.x = -100;
    gold.animations.play('spin');
  },

  newPowerUp: function(){
    var powerUp = this.powerUps.getFirstDead();
    if (!powerUp){
      return;
    }
    powerUp.animations.add('spin',[24,25,26,27,28,29,30,31], 12, true);
    powerUp.reset(this.game.width, this.game.height * this.randomHeightMultiplier());
    this.scaleSize(powerUp);
    powerUp.body.velocity.x = -100;
    powerUp.animations.play('spin');
  },

  updatePlayerDirection: function(direction){
    if (game.global.playerDirection !== direction){
      game.global.playerDirection = direction;
    }
  },

  increaseAttribute: function(attr, amount){
    var label = String(attr) + "Label";
    var mapping = {
      "score"       : "Score",
      "gold"        : "Gold",
      "powerUpLevel": "Power",
      "lives"       : "Lives",
    };
    game.global[attr] += amount;
    this[label].text = mapping[attr] + ": " + game.global[attr];
  },

  resetPowerUpLevel: function(){
    this.game.global.powerUpLevel = 1;
    this.powerUpLevelLabel.text = "Power: " + game.global.powerUpLevel;
  },

  scaleSize: function(target, additionalRatioMultiplier){
    if (typeof additionalRatioMultiplier === 'undefined'){
      additionalRatioMultiplier = 1;
    }
    var animation = game.add.tween(target.scale);
    var ratio = (1 + (target.y - this.game.height / 2) / this.game.height / 2) * additionalRatioMultiplier;
    animation.to({x: ratio, y: ratio}, 50);
    animation.start();
  },

  randomLeftRight: function(){
    var direction = ["left", "right"];
    var sample = Math.round(Math.random());
    return direction[sample];
  },

  randomHeightMultiplier: function(){
    var  lowerBound = 0.2,
         upperBound = 0.8,
         multiplier = Math.random();
    if (multiplier < lowerBound){
      return lowerBound;
    } else if (multiplier > upperBound) {
      return upperBound;
    } else {
      return multiplier;
    }
  },

  playerDie: function(){
    this.pad.removeStick(this.stick);
    this.pad.removeButton(this.buttonA);
    game.time.events.add(2000, this.startMenu, this);
  },

  startMenu: function() {
    game.state.start('menu');
  },
};