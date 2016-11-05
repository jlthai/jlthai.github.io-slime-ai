Game = {
    // Grid size, size of its tiles
    map_grid: {
        width: 30,
        height: 18,
        tile: {
            width: 32,
            height: 32
        }
    },

    // The total width of the game screen. Since our grid takes up the entire screen
    //  this is just the width of a tile times the width of the grid
    width: function() {
        return this.map_grid.width * this.map_grid.tile.width;
    },

    // The total height of the game screen. Since our grid takes up the entire screen
    //  this is just the height of a tile times the height of the grid
    height: function() {
        return this.map_grid.height * this.map_grid.tile.height;
    },

    start: function() {
        Crafty.init(Game.width(), Game.height(), document.getElementById('game'));
        Crafty.background('rgb(0, 0, 0)');

        Crafty.scene('Loading');
    } // start: function()
}

$text_css = { 'font-size': '32px', 'font-family': 'Arial', 'color': 'white', 'text-align': 'center' }
