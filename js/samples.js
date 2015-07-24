//  signature/usage:
//    distribute(11, 3, distribute.START)
//    distribute(7, 2, distribute.END)
//  
//  result:
//    [4, 4, 3]
//    [3, 4]
//
//  note:
//    distribute.FRONT and distribute.REAR are *properties* used like CONSTANT values

function distribute(num, segments, end) {
  // do stuff
  
  return []
}

var a = distribute(148, 8, distribute.START) // [19, 19, 19, 19, 18, 18, 18, 18]
var b = distribute(20, 3, distribute.END) // [6, 7, 7]

console.log(a, b);
