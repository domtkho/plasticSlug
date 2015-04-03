var playState = {

  preload: function(){
    // game.load.image('player', 'assets/player.png');
    game.load.spritesheet('player', 'assets/character.png', 64, 64);
    game.load.spritesheet('enemy', 'assets/penguin.png', 64, 64);
    game.load.spritesheet('fireball', 'assets/fireball.png', 64, 64);
    game.load.spritesheet('gold', 'assets/gold.png', 32, 32);
    game.load.image('road', 'assets/road.png');
  },

  create: function(){
    game.stage.backgroundColor = "#009ACE";
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Add controls
    this.cursor = game.input.keyboard.createCursorKeys();
    this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Add road
    this.road = this.game.add.tileSprite(0, 0, this.game.width, game.cache.getImage("road").height, "road");

    // Add score label
    this.scoreLabel = game.add.text(20, 20, 'Score: 0',
      {font: "20px Arial", fill: "#FFFFFF"});

    // Add player
    this.player = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "player");
    this.player.anchor.setTo(1, 0.5);
    game.physics.arcade.enable(this.player);
    this.player.animations.add('runRight', [6,7,8], 10, true);
    this.player.animations.add('runLeft', [3,4,5], 10, true);
    this.player.body.collideWorldBounds = true;

    // Add enemy group
    this.enemies = game.add.group();
    this.enemies.enableBody = true;
    this.enemies.createMultiple(20, 'enemy');
    this.enemies.setAll('anchor.x', 0);
    this.enemies.setAll('anchor.y', 0.5);
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

    // Initialze variables
    this.nextFireball = 0;
    this.nextEnemy = 0;
    this.nextGold = 0;
    this.game.global.score = 0;
  },

  update: function(){
    this.road.tilePosition.x -= 1;
    game.physics.arcade.overlap(this.fireballs, this.enemies, this.enemyHit, null, this);
    game.physics.arcade.overlap(this.player, this.golds, this.collectGold, null, this);

    if (game.global.playerDirection === "right"){
      this.player.animations.play('runRight');
    } else {
      this.player.animations.play('runLeft');
    }

    this.movePlayer();

    if (this.game.time.now > this.nextEnemy){
      var enemyDelay = 300 + Math.round(Math.random() * 1000);
      this.nextEnemy = this.game.time.now + enemyDelay;
      this.newEnemy(this.randomLeftRight());
    }

    if (this.game.time.now > this.nextGold){
      var goldDelay = 0 + Math.round(Math.random() * 5000);
      this.nextGold = this.game.time.now + goldDelay;
      this.newGold();
    }
  },

  movePlayer: function(){
    if(this.cursor.left.isDown){
      this.updatePlayerDirection("left");
      this.player.body.velocity.x = -200;
    } else if (this.cursor.right.isDown){
      this.updatePlayerDirection("right");
      this.player.body.velocity.x = 200;
    } else {
      this.updatePlayerDirection("right");
      this.player.body.velocity.x = 0;
    }

    if (this.cursor.up.isDown){
      this.player.body.velocity.y = -200;
      this.scaleSize(this.player);
    } else if (this.cursor.down.isDown){
      this.player.body.velocity.y = 200;
      this.scaleSize(this.player);
    } else {
      this.player.body.velocity.y = 0;
    }

    if(this.fireButton.isDown && this.game.time.now > this.nextFireball){
      this.nextFireball = this.game.time.now + 150;
      this.fireFireball(game.global.playerDirection);
    }

  },

  fireFireball: function(direction){
    var fireball = this.fireballs.getFirstDead();
    if (!fireball){
      return;
    }
    this.scaleSize(fireball, 0.5);
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
    this.increaseScore(20);
  },

  enemyHit: function(enemy, fireball){
    fireball.kill();
    enemy.kill();
    this.increaseScore(100);
  },

  newEnemy: function(direction){
    var enemy = this.enemies.getFirstDead();
    if(!enemy){
      return;
    }
    enemy.animations.add('runLeft', [0,1,2], 10, true);
    enemy.animations.add('runRight', [3,4,5], 10, true);
    if (direction === 'left'){
      enemy.reset(this.game.width, this.game.height * this.randomHeightMultiplier() );
      this.scaleSize(enemy);
      enemy.body.velocity.x = -200;
      enemy.animations.play('runLeft');
      console.log("running LEFT");
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
    this.scaleSize(gold);
    gold.animations.add('spin',[0,1,2,3,4,5,6,7], 10, true);

    gold.reset(this.game.width, this.game.height * this.randomHeightMultiplier());
    gold.body.velocity.x = -100;
    gold.animations.play('spin');

  },

  updatePlayerDirection: function(direction){
    if (game.global.playerDirection !== direction){
      game.global.playerDirection = direction;
    }
  },

  increaseScore: function(amount){
    game.global.score += amount;
    this.scoreLabel.text = "Score: " + game.global.score;
  },

  scaleSize: function(target, additionalRatioMultiplier){
    if (typeof additionalRatioMultiplier === 'undefined'){
      additionalRatioMultiplier = 1;
    }
    var animation = game.add.tween(target.scale);
    var ratio = (0.8 + 0.2 * target.y / this.game.height) * additionalRatioMultiplier;
    animation.to({x: ratio, y: ratio}, 50);
    animation.start();
  },

  randomLeftRight: function(){
    var direction = ["left", "right"];
    var sample = Math.round(Math.random());
    return direction[sample];
  },

  randomHeightMultiplier: function(){
    var  lowerBound = 0.1,
         upperBound = 0.9,
         multiplier = Math.random();
    if (multiplier < lowerBound){
      return lowerBound;
    } else if (multiplier > upperBound) {
      return upperBound;
    } else {
      return multiplier;
    }
  }



};

var game = new Phaser.Game(568, 320, Phaser.AUTO, 'game-div');

game.global = {
  score: 0,
  playerDirection: "right",
};

game.state.add('play', playState);
game.state.start('play');