var loadState = {

  preload: function () {
    this.load.spritesheet('player', 'assets/character.png', 64, 64);
    this.load.spritesheet('enemy', 'assets/penguin.png', 64, 64);
    this.load.spritesheet('fireball', 'assets/fireball.png', 64, 64);
    this.load.spritesheet('gold', 'assets/gold.png', 32, 32);
    this.load.spritesheet('powerUp', 'assets/powerUp.png', 81, 81);
    this.load.image('road', 'assets/road.png');
    this.load.image('pixel', 'assets/pixel.png');
    this.load.atlas('arcade', 'assets/virtual-joystick/generic-joystick.png', 'assets/virtual-joystick/generic-joystick.json');
  },

  create: function() {
    // Go to the menu state
    game.state.start('menu');
  }
};