/*global $ Game */
$(function () {
  var htmlelement = '#board';
  var scoreboard  = '#stats';
  var probability = 0.3;
  var columns     = 7;
  var rows        = 9;
  var easymode    = true;
  var hints       = false;
  
  probability = Math.sqrt((Math.floor(columns / 3) * Math.floor(rows / 3)) * (1 + 2/3)) / 10;
  console.log('A', probability);
  
  probability = Math.min(probability, 1/3);
  //console.log('B', probability);

  var grid = new Game.Grid(htmlelement, scoreboard, probability, columns, rows, easymode, hints);
  
  $('#newgame').click(function () {grid.init();});
  $('#test').click(function () {grid.test();});
  $('#cheat').click(function () {hints = ( ! hints)});
});
