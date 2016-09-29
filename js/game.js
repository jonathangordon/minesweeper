/*global $ navigator */
var Game = (function () {
  var Grid = function (el, stats, mineProbability, numColumns, numRows, easyMode, hints) {
    // init
    if (el === null || $(el).length === 0)
        throw new Error('Need a valid element for game grid!');

    this.$el = $(el);
    
    if (stats === null || $(stats).length === 0)
        throw new Error('Need a valid element for game stats!');

    this.$stats = $(stats);
    
    // should be a positive number less than 1
    this.mineProbability = ( ! mineProbability)? (1/3): mineProbability;
    this.totalPoints     = 0;
    this.points          = 0;
    this.rounds          = 0;
    this.numColumns      = ( ! numColumns)? 5: numColumns;
    this.numRows         = ( ! numRows)? this.numColumns: numRows;
    this.easyMode        = ( ! easyMode)? false: true;
    this.hints           = ( ! hints)? false: true;

    this.init();
  };
  Grid.prototype.init = function () {
    if (this.numSafeTiles === 0) {
      var that = this;
      this.rows.forEach(function (row) {
        row.forEach(function (tile) {
          if ( ! (tile.isLocked || tile.isExploded)) {
            if (tile.hasMine && ! tile.isFlagged) that.points++;
            if (tile.hasMine && tile.isFlagged) that.points += 2;
            if (tile.isFlagged && ! tile.hasMine) that.points--;
          }
        });
      });
    }
    $('.rounds', this.stats).text(++this.rounds);
    this.totalPoints    += this.status===false? Math.min(this.points, -this.numMineTiles) : this.points;
    this.points          = 0;
    this.rows            = [];
    this.numSafeTiles    = this.numRows * this.numColumns; // initial value
    this.numMineTiles    = 0; // initial value
    this.status          = null; // null = playing, true = won, false = lost
    this.$el.empty();
    $('.score', this.$stats).text(this.totalPoints);
    this.populate();

    if (this.easyMode) {
      var that = this;
      this.rows.forEach(function (row) {
        row.forEach(function (tile) {
          if ( ! tile.hasMine) {
            var surrounding = that.getSurroundingMineCount(tile.position);
            if (surrounding === 0 && tile.hasMine === false) tile.check.bind(tile)();
          }
        });
      });
    }
    //$('.tile, .row').css('height', (Math.round($('#game').height() / (this.numRows + 2)) - 1) + 'px');
    //$('.tile').css('width', (Math.floor(100 / this.numColumns * 10)) / 10 + '%');
    //$('#board').css('top', (Math.round($('#game').height() / (this.numRows + 2))) + 'px');
    //$('#board').css('bottom', (Math.round($('#game').height() / (this.numRows + 2))) + 'px');
    //$('#actions, #stats').css('height', (Math.round($('#game').height() / (this.numRows + 2))) + 'px');
  };
  Grid.prototype.test = function () {
    var that = this;
    this.rows.forEach(function (row) {
      row.forEach(function (tile) {
        var result = tile.test();
         
        //if (result === true) ++that.points;
        //if (result === false) --that.points && --that.numSafeTiles;
        that.points += result;
        if (result < 1) --that.numSafeTiles;
      });
    });
    console.log('Points:', this.points)
  };
  Grid.prototype.populate = function () {
    for (var rowIndex = 0; rowIndex < this.numRows; rowIndex++) {
      var row = this.newRow();
      this.rows.push([]);
      this.populateRow(row, rowIndex);
      this.$el.append(row);
    }

    console.log("Find all",this.numMineTiles,"mines.");
    $('.minecount', this.$stats).text(this.numMineTiles);
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
    var that = this;
    var countDown = function (seconds) {
      if (seconds) {
        console.log("Restarting in "+seconds+" seconds");

        setTimeout(function () {
          countDown(--seconds);
        }, 1000);
      }
      else {
        that.init();
      }
    };

    if (this.status !== false) {
      console.log("You died a horrible death.");
      countDown(1);
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
      var that = this;
      var countDown = function (seconds) {
        if (seconds) {
          console.log("Restarting in "+seconds+" seconds");
  
          setTimeout(function () {
            countDown(--seconds);
          }, 1000);
        }
        else {
          that.init();
        }
      };
  
      if (this.status !== true) {
        console.log('You won!');
        countDown(1);
      }
  
      this.status = true;
    }
  };

  var Tile = function (hasMine, position, revealCallback, explodeCallback, hint) {
    this.isLocked   = false;
    this.hasMine    = hasMine;
    this.isExploded = false;
    this.position   = position;
    this.isRevealed = false;
    this.el         = $('<div>', {class: 'tile'});

    this.revealCallback  = revealCallback  || $.noop;
    this.explodeCallback = explodeCallback || $.noop;

    var touchDevices = /iphone|ipad|ipod|android/i;
    var isTouch = touchDevices.test(navigator.userAgent);

    if (isTouch) {
      var touchTimer = function () {
        var which = 2; // shortTouch
        var longTouch = setTimeout(function () {
          which = 1; // longTouch
        }, 500);
        var cancelTouch = setTimeout(function () {
          which = 0; // cancelTouch
        }, 2000)

        var that = this;
        this.el.one('touchend', function () {
          clearTimeout(longTouch);
          clearTimeout(cancelTouch);
          that.handleClick.bind(that)({which:which});
        });
      };

      this.el
        .bind('touchstart', touchTimer.bind(this));
    }
    else {
      this.el
        .contextmenu(function (e) {
          e.preventDefault();
        })
        .mousedown(this.handleClick.bind(this));
    }

    // useful for testing
    if (hasMine && hint) this.el.addClass('hint');
  };
  Tile.prototype.handleClick = function (e) {
    // left click or long-touch
    if (e.which == 1) this.check();
    // middle/right click or short-touch
    if (e.which > 1) this.toggleFlag();
  };
  Tile.prototype.toggleFlag = function () {
    if ( ! (this.isLocked || this.isRevealed || this.isExploded)) {
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
  Tile.prototype.test = function () {
    if ( ! this.isLocked) {
      if (this.isFlagged) {
        this.isLocked = true;
        
        if (this.hasMine) {
          this.el.addClass('point')
          return 1;
        }
        
        if ( ! this.hasMine) {
          this.el.addClass('nopoint')
          return -1;
        }
      }
    }
    return 0;
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
