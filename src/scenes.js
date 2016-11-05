// Game Scene
Crafty.scene('Game', function() {

  // Build map from .tmx json file
  Crafty.e("2D, Canvas, TiledMapBuilder").setMapDataSource( SOURCE_FROM_TILED_MAP_EDITOR )
    .createWorld( function( tiledmap ) {
      // Add collision detection to every obstacle
      for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Obstacles').length; obstacle++) {
              tiledmap.getEntitiesInLayer('Obstacles')[obstacle]
                .addComponent("Collision, Obstacle")
            }

      // Change chest sprite when touched
      tiledmap.getTile( 15, 28, 'Objectives')
        .addComponent("Collision, Objective");

      // Allow ladder to gameover after chest is touched
      tiledmap.getTile( 2, 2, 'Objectives')
        .addComponent("Collision, Ladder");
    });

  // Player
  this.player = Crafty.e('PlayerChar').at(2, 2);
  this.player.grabbedTreasure = false;
  this.player.pursuing = false;

  // Enemy
  this.enemy = Crafty.e('EnemyChar').at(20, 16);
});

// Loading scene
Crafty.scene('Loading', function() {
  Crafty.e('2D, DOM, Text')
    .text('Loading...')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);

  Crafty.load([
                'assets/soldier.png',
                'assets/slime.png',
                'assets/chests.png',
                'assets/lava.png',
                'assets/lavarock.png',
                'assets/mountains.png',
                'assets/path.png'
              ], function() {

    Crafty.sprite(32, 32, 'assets/chests.png', {
      open_chest_sprite: [0, 2]
    });

    Crafty.sprite(48, 60, 'assets/soldier.png', {
      soldier_sprite: [0, 2]
    }, 16, 4);

    Crafty.sprite(32, 32, 'assets/slime.png', {
      enemy_sprite: [0, 2]
    });

    Crafty.sprite(32, 32, 'assets/path.png', {
      enemy_path: [0, 0]
    });

    Crafty.scene('Game');
  });
});

// Game over scene
Crafty.scene('GameOver', function() {
  Crafty.e('2D, DOM, Text')
    .css($text_css)
    .text("You've been caught!")
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() });
});

// Escape scene
Crafty.scene('Escaped', function() {
  Crafty.e('2D, DOM, Text')
    .css($text_css)
    .text("You've escaped!")
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() });
});
