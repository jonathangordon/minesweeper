var Game = (function () {
  var Grid = function (el, mineProbability, numColumns, numRows, hints) {
      // init
      if (el === null || $(el).length === 0)
          throw new Error('Need a valid element for game grid!');

      this.$el = $(el);
      // should be a positive number less than 1
      this.mineProbability = ( ! mineProbability)? (1/3): mineProbability;
      this.numColumns      = ( ! numColumns)? 5: numColumns;
      this.numRows         = ( ! numRows)? this.numColumns: numRows;
      this.rows            = [];
      this.numSafeTiles    = numRows * numColumns; // initial value
      this.numMineTiles    = 0; // initial value
      this.status          = null; // null = playing, true = won, false = lost
      this.hints           = hints;
  };
  Grid.prototype.populate = function () {
    for (var rowIndex = 0; rowIndex < this.numRows; rowIndex++) {
      var row = this.newRow();
      this.rows.push([]);
      this.populateRow(row, rowIndex);
      this.$el.append(row);
    }

    console.log("Find all",this.numMineTiles,"mines.");
  };
  Grid.prototype.newRow = function () {
    return $('<div>', {class: 'row'});
  };
  Grid.prototype.populateRow = function (row, rowIndex) {
    var thisReveal  = this.reveal.bind(this);
    var thisExplode = this.explode.bind(this);

    for (var columnIndex = 0; columnIndex < this.numColumns; columnIndex++) {
      var withMine = (Math.random() + this.mineProbability) > 1;
      var position = {
        rowIndex:    rowIndex,
        columnIndex: columnIndex
      };

      var tile = new Tile(withMine, position, thisReveal, thisExplode, this.hints);

      if (withMine) {
        --this.numSafeTiles;
        ++this.numMineTiles;
      }

      this.rows[rowIndex].push(tile);
      row.append(tile.el);
    }
  };

  Grid.prototype.explode = function (tile) {
    var countDown = function (seconds) {
      if (seconds) {
        console.log("Restarting in "+seconds+" seconds");

        setTimeout(function () {
          countDown(--seconds);
        }, 1000);
      }
      else window.location.reload();
    };

    if (this.status !== false) {
      console.log("You died a horrible death.");
      countDown(5);
    }

    this.status = false;

    this.rows.forEach(function (row) {
      row.forEach(function (tile) {
        tile.check.bind(tile)(true);
      });
    });
  };

  Grid.prototype.positionExists = function (position) {
    if (position.rowIndex < 0 || position.rowIndex === this.numRows)
      return false;

    if (position.columnIndex < 0 || position.columnIndex === this.numColumns)
      return false;

    return true;
  };

  Grid.prototype.getTileAtPosition = function (position) {
    var tile = this.rows[position.rowIndex][position.columnIndex];
    return tile;
  };

  Grid.prototype.getSurroundingTiles = function (startingPosition) {
    var getOffsetPosition = function (offset) {
      return {
        rowIndex:    (this.rowIndex + offset.rowBy),
        columnIndex: (this.columnIndex + offset.columnBy)
      };
    };

    var allOffsets = [
      {rowBy: -1, columnBy: -1}, // TL
      {rowBy: -1, columnBy:  0}, // T
      {rowBy: -1, columnBy:  1}, // TR
      {rowBy:  0, columnBy: -1}, // L
      {rowBy:  0, columnBy:  1}, // R
      {rowBy:  1, columnBy: -1}, // BL
      {rowBy:  1, columnBy:  0}, // B
      {rowBy:  1, columnBy:  1}  // BR
    ];
    
    var allPositions       = allOffsets.map(getOffsetPosition, startingPosition);
    var validPositions     = allPositions.filter(this.positionExists, this);
    var surroundingTiles   = validPositions.map(this.getTileAtPosition, this);
    
    return surroundingTiles;
  };

  Grid.prototype.getSurroundingMineCount = function (position) {
    var tiles     = this.getSurroundingTiles(position);
    var mineCount = tiles.reduce(function (mineCount, tile) {
      if (tile.hasMine)
        ++mineCount;

      return mineCount;
    },0);

    // All surrounding tiles are safe
    if ( ! mineCount) {
      tiles.forEach(function (tile) {
        tile.check.bind(tile)();
      });
    }

    return mineCount;
  };

  Grid.prototype.reveal = function (tile) {
    var mineCount = this.getSurroundingMineCount(tile.position);

    tile.setDisplay(mineCount);

    --this.numSafeTiles;
    if (this.numSafeTiles === 0 && this.status === null) {
      this.status = true;
      console.log('You won!');
    }
  };

  var Tile = function (hasMine, position, revealCallback, explodeCallback, hint) {
    this.hasMine    = hasMine;
    this.isExploded = false;
    this.position   = position;
    this.isRevealed = false;
    this.el         = $('<div>', {class: 'tile'});

    this.revealCallback  = revealCallback  || $.noop;
    this.explodeCallback = explodeCallback || $.noop;

    this.el
      .contextmenu(function (e) {
        e.preventDefault();
      })
      .mousedown(this.handleClick.bind(this));

    // useful for testing
    if (hasMine && hint) this.el.addClass('hint');
  };
  Tile.prototype.handleClick = function (e) {
    // left click
    if (e.which == 1) this.check();
    // middle or right click
    if (e.which > 1) this.toggleFlag();
  };
  Tile.prototype.toggleFlag = function () {
    if ( ! this.isRevealed &&  ! this.isExploded) {
      if ( ! this.isFlagged) {
        this.isFlagged = true;
        this.setDisplay('&#9873;');
      }
      else {
        this.isFlagged = false;
        this.setDisplay(null);
      }
    }
  };
  Tile.prototype.check = function (noChainReaction) {
    if ( ! this.isFlagged || noChainReaction) {
      if (this.isRevealed) return;
      if (this.hasMine) this.explode(noChainReaction);
      else this.reveal();
    }
  };
  Tile.prototype.setDisplay = function (content) {
    this.el.html(content);
  };
  Tile.prototype.reveal = function () {
    this.isRevealed = true;
    this.el.addClass('correct');
    this.revealCallback(this);
  };
  Tile.prototype.explode = function (noChainReaction) {
    console.log('*BOOM!*');

    if ( ! this.isFlagged) {
      this.setDisplay('&#9760;');
      this.isExploded = true;
      this.el.addClass('incorrect');
    }
    if (noChainReaction !== true) this.explodeCallback(this);
  };

  return {
    Grid: Grid,
    Tile: Tile
  };
})();
