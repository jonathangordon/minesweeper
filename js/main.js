var game = {

  gridSize: 8,
  mineCount: 10,

  mines: [],

  // Init the game, change context
  init: function () {
    game.continue();
  },

  // Begin game
  continue: function () {
    this.renderGrid();
    this.determineMines();
  },

  // Render grid in the DOM
  renderGrid: function () {
    for (x = 1; x <= this.gridSize; x++) {
      // Render rows first
      var row = $('<div class="row"></div>').appendTo('#board');

      // Render cells with actions
      for (y = 1; y <= this.gridSize; y++) {
        var cell = $('<div></div>', {
          'class': 'cell',
          'data-x': x,
          'data-y': y,
          on: {
            click: this.onCellClicked
          }
        }).appendTo(row);
      }
    }
  },

  // Determine the position of a specific amount of mines
  determineMines: function () {
    for (i = 0; i < this.mineCount; i++) {
      var x = this.getRand(1, this.mineCount);
      var y = this.getRand(1, this.mineCount);
      var coords = x + 'x' + y;

      while ($.inArray(coords, this.mines) == -1) {
        this.mines.push(coords);
      }
    }
  },

  onCellClicked: function () {
    console.log(this);
  },

  // Basic functions
  getRand: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

};

$(document).ready(game.init);
