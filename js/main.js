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
    for (y = 1; y <= this.gridSize; y++) {
      // Render rows first
      var row = $('<div class="row"></div>').appendTo('#board');

      // Render cells with actions
      for (x = 1; x <= this.gridSize; x++) {
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
      var x = this.getRand(1, this.gridSize);
      var y = this.getRand(1, this.gridSize);
      var coords = x + 'x' + y;

      while ($.inArray(coords, this.mines) == -1) {
        this.mines.push(coords);

        $('div[data-x="' + x + '"][data-y="' + y + '"]').addClass('incorrect');
      }

      console.log(coords);
    }
  },

  // Count the surrounding mines from coordinates
  countSurroundingMines: function (x, y) {
    var count = 0;

    // Loop through mines and compare against coords
    for (i in this.mines) {
      var mine = this.mines[i];
      var coords = mine.split('x');
      var x2 = parseInt(coords[0]), y2 = parseInt(coords[1]);

      var xDistance = Math.abs(x - x2);
      var yDistance = Math.abs(y - y2);

      if (xDistance <= 1 && yDistance <= 1) {
        count++;
      }
    }

    return count;
  },

  // End game
  endGame: function () {
    //alert('Game is over!');
  },

  // Get a cell by coords
  getCellByCoords: function (x, y) {
    console.log('div[data-x="' + x + '"][data-y="' + y + '"]');
    return $('div[data-x="' + x + '"][data-y="' + y + '"]');
  },

  onCellClicked: function () {
    var cell = $(this);
    var x = parseInt(cell.attr('data-x')), y = parseInt(cell.attr('data-y'));
    var coords = x + 'x' + y;

    // Did we guess correctly? If not, end game
    if ($.inArray(coords, game.mines) == -1) {
      cell.addClass('correct');
      cell.html(game.countSurroundingMines(x, y));
    } else {
      cell.addClass('incorrect');
      game.endGame();
    }
  },

  // Basic functions
  getRand: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

};

$(document).ready(game.init);
