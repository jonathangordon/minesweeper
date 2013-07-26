$(function () {
  var node        = '#board';
  var probability = 0.25;
  var columns     = 13;
  var rows        = columns;
  var easymode    = true;
  var hints       = false;

  var grid = new Game.Grid(node, probability, columns, rows, easymode, hints);
});
