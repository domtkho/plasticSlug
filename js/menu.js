var menuState = {

  create: function() {

    var nameLabel = game.add.text(game.world.centerX, -50, 'PENGUIN SLAUGHTER', { font: '50px Geo', fill: '#ffffff ' });
    nameLabel.anchor.setTo(0.5, 0.5);

    game.add.tween(nameLabel).to({y: 80}, 1000).easing(Phaser.Easing.Bounce.Out).start();

    if (!localStorage.getItem('bestScore')) {
      localStorage.setItem('bestScore', 0);
    }

    if (game.global.score > localStorage.getItem('bestScore')) {
      localStorage.setItem('bestScore', game.global.score);
    }

    var text = 'score: ' + game.global.score + '\nbest score: ' +
    localStorage.getItem('bestScore');
    var scoreLabel = game.add.text(game.world.centerX, game.world.centerY, text, { font: '25px Arial', fill: '#ffffff ', align: 'center' });
    scoreLabel.anchor.setTo(0.5, 0.5);

    var startLabel = game.add.text(game.world.centerX, game.world.height-80,
      'touch the screen to start',
      { font: '25px Arial', fill: '#ffffff ' });
    startLabel.anchor.setTo(0.5, 0.5);

    game.add.tween(startLabel).to({angle: -2}, 500).to({angle: 2}, 500).loop().start();
    game.input.onDown.addOnce(this.start, this);

  },

  start: function() {
    game.state.start('play');
  },
};