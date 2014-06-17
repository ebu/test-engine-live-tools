var prevTimestamp = new Date()
var avgTimestamp = 0;
var runs = 0

function packageSegments(segments) {
  var newTimestamp = new Date()
  if (runs == 0) {
    console.log("The packager has: " + segments + ".");
    runs++;
  } else {
    var bm = newTimestamp - prevTimestamp;
    avgTimestamp = (avgTimestamp * (1 - 1/runs)) + (bm / runs);
    runs++;
  
    console.log("The packager has: " + segments + ". Last run was " + bm + "ms ago. Average time between runs: " + avgTimestamp + "ms.");
  }
  prevTimestamp = newTimestamp;
}

module.exports.packageSegments = packageSegments;