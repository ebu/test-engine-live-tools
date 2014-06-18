var async = require('async'),
    child_process = require('child_process'),
    path = require('path'),
    config = require('./config'),
    fs = require('fs');
    
var prevTimestamp = new Date();
var avgTimestamp = 0;
var runs = 0

function packageSegments(segments) {
  var newTimestamp = new Date()

  async.waterfall([
    function(callback)          { async.map(segments, processSingle, callback); },
    function(outputs, callback) { processDashContext(outputs, callback); }
  ], function(err, results) {
    // TODO: this function can be cleaned up, maybe separate the benchmarking stuff, it adds noise.
    if (err) {
      console.log("Error while processing segment: " + err);
      process.exit(1);
    }
    
    console.log("Results in: " + results);
    if (runs == 0) {
      console.log("The packager has processed: " + segments + ".");
    } else {
      var bm = newTimestamp - prevTimestamp;
      avgTimestamp = (avgTimestamp * (1 - 1/runs)) + (bm / runs);
      console.log("The packager has processed: " + segments + ". Last run was " + bm + "ms ago. Average time between runs: " + avgTimestamp + "ms.");
    }

    // Unlink all processed segments to clean up
    segments.map(function(item) { return path.join(config.segment_dir, item) }).concat(results).forEach(function(item) {
      fs.unlink(item, function(err) { /* Don't care about errors for now */ });
    })
    
    runs++;
    prevTimestamp = newTimestamp;
  });
}

function processSingle(segment, cb) {
  var input = path.join(config.segment_dir, segment);
  var output = path.join(config.output_dir, segment + ".mp4");

  console.log("Packaging single segment: " + segment);
  
  var packager = child_process.spawn(config.mp4box, ['-add', input, output]);
  packager.on('error', function(err) { cb(err, null); });
  packager.on('exit', function(code) { code == 0 ? cb(null, output) : cb(code, null); });
}

function processDashContext(segments, cb) {
  // TODO: add the correct representation ids
  var contextPackager = child_process.spawn(config.mp4box, config.packaging.mp4box_opts.concat(segments));
  contextPackager.on('error', function(err) { cb(err, null); });
  contextPackager.on('exit', function(code) { code == 0 ? cb(null, segments) : cb(code, null); });

  console.log("Creating/updating DASH context. " + new Date());
}

module.exports.packageSegments = packageSegments;
