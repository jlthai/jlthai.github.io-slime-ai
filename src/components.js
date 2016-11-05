// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },

  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x / Game.map_grid.tile.width, y: this.y / Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  }
});

// Walking Animation
// For animations with 8 pics following the order
// up, left, down, right
Crafty.c('AnimatedWalking', {
  init: function() {
    this.requires('SpriteAnimation')
      .animate('PlayerMovingUp', 0, 0, 8)
      .animate('PlayerMovingRight', 0, 3, 8)
      .animate('PlayerMovingDown', 0, 2, 8)
      .animate('PlayerMovingLeft', 0, 1, 8);

    var animation_speed = 60;

    var newDirection = function(data) {
      if (data.x > 0) {
        this.animate('PlayerMovingRight', animation_speed, -1);
      } else if (data.x < 0) {
        this.animate('PlayerMovingLeft', animation_speed, -1);
      } else if (data.y > 0) {
        this.animate('PlayerMovingDown', animation_speed, -1);
      } else if (data.y < 0) {
        this.animate('PlayerMovingUp', animation_speed, -1);
      } else {
        this.stop();
      }
    };

    this.bind('NewDirection', newDirection);
  }
});

// This is the player-controlled character
Crafty.c('PlayerChar', {
  init: function() {
    this.requires('Actor, Fourway, soldier_sprite, AnimatedWalking, Collision')
      .fourway(2)
      .collision([16, 31], [16, 64], [48, 64], [48, 31])
      .bind('Moved', function(from) {
        // Stop moving if hit obstacle
        if (this.hit('Obstacle')) {
          this.attr( {x: from.x, y: from.y} );
        }

        // Trigger Chest_Touched if touched chest
        if (this.hit('Objective')) {
          Crafty.trigger('Chest_Touched');
          this.grabbedTreasure = true;
        }

        // If chest was touched, allow ladder exit
        if (this.hit('Ladder') && this.grabbedTreasure) {
          Crafty.scene('Escaped');
        }

        Crafty.trigger('alertEnemy', this.at());
      });
  }
});

// This is the enemy character
Crafty.c('EnemyChar', {
  init: function() {
    this.requires('Actor, enemy_sprite, Collision, SpriteAnimation, astar')
      .collision([4, 10], [4, 30], [28, 30], [28, 10])
      .onHit("PlayerChar", function() {
        Crafty.scene('GameOver');
      });

    this.animate('Blobbing', 0, 2, 2);
    this.animate('Blobbing', 60, -1);
    this.counter = 0;
    this.pursuing = false;

    this.bind('alertEnemy', function(callingPosition) {
      this.counter++;

      if (this.counter % 32 === 0) {
        this.runSearch(this.at(), callingPosition);
      }
    });
  }
});

// This is the chest objective
Crafty.c('Objective', {
  init: function() {
    this.bind('Chest_Touched', function() {
      this.addComponent("open_chest_sprite");
      this.unbind('Chest_Touched');
    });
  }
});

// This is the path
Crafty.c('Path', {
  init: function() {
    this.requires('Actor, enemy_path');

    this.bind('destroyPath', function(id) {
      Crafty('' + id).each( function() {
        this.destroy();
      });
    });
  }
});
