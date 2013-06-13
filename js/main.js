var game = {

  gridSize: 8,
  mineCount: 10,


  // Init the game, change context
  init: function () {
    game.continue();
  },

  // Begin game
  continue: function () {
    this.renderGrid();
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
            click: this.cellClicked
          }
        }).appendTo(row);
      }
    }
  },

  cellClicked: function () {
    console.log(this);
  }

};

$(document).ready(game.init);
