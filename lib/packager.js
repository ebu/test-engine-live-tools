var async = require('async'),
    child_process = require('child_process');
    
var prevTimestamp = new Date();
var avgTimestamp = 0;
var runs = 0

function packageSegments(segments) {
  var newTimestamp = new Date()

  processAll(segments, function(err, results) {
    if (runs == 0) {
      console.log("The packager has processed: " + segments + ".");
    } else {
      var bm = newTimestamp - prevTimestamp;
      avgTimestamp = (avgTimestamp * (1 - 1/runs)) + (bm / runs);
      console.log("The packager has processed: " + segments + ". Last run was " + bm + "ms ago. Average time between runs: " + avgTimestamp + "ms.");
    }

    runs++;
    prevTimestamp = newTimestamp;
  });
}

function processAll(segments, cb) {
  async.map(segments, processSingle, cb);
}

function processSingle(segment, cb) {
  console.log("Processing single: " + segment);
  cb(null, 'foo');
}

module.exports.packageSegments = packageSegments;