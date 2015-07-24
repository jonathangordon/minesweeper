$(function () {
  var htmlelement = '#board';
  var probability = 0.3;
  var columns     = 6;
  var rows        = columns;
  var easymode    = true;
  var hints       = true;

  var grid = new Game.Grid(htmlelement, probability, columns, rows, easymode, hints);
});
