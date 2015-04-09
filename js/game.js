// Initialise Phaser
var game = new Phaser.Game(568, 320, Phaser.AUTO, 'game-div');

game.global = {
  lives: 0,
  score: 0,
  gold: 0,
  powerUpLevel: 1,
  playerDirection: "right",
};

// Add all the states
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

// Start the 'boot' state
game.state.start('boot');