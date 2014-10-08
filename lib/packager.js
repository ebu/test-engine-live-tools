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

  processDashContext(segments, function(err, results) {
    if (err) {
      console.log("Error while processing segments: " + err);
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
    segments.map(function(item) { return path.join(config.segmentDir, item) }).concat(results).forEach(function(item) {
      fs.unlink(item, function(err) { /* Don't care about errors for now */ });
    })
    
    runs++;
    prevTimestamp = newTimestamp;
  });
}

function processSingle(segment, cb) {
  var input = path.join(config.segmentDir, segment);
  var output = path.join(config.outputDir, segment + ".mp4");

  console.log("Packaging single segment: " + segment);
  
  var packager = child_process.spawn(config.mp4box, ['-add', input, output]);
  packager.on('error', function(err) { cb(err, null); });
  packager.on('exit', function(code) {
    fs.unlink(input, function(err) { /* Don't care about errors for now */ });
    code == 0 ? cb(null, output) : cb(code, null);
  });
}

function processDashContext(segments, cb) {
  // add the correct representation ids
  var representationFiles = segments.sort().map(function(s) { return s + ":id=" + config.getRepresentationKeyForFile(s); });
  var contextPackager = child_process.spawn(config.mp4box, config.packaging.mp4box_opts.concat(representationFiles), { stdio: 'inherit' });
  contextPackager.on('error', function(err) { cb(err, null); });
  contextPackager.on('exit', function(code) { code == 0 ? cb(null, segments) : cb(code, null); });

  console.log("Creating/updating DASH context. " + new Date());
}

module.exports.packageSegments = packageSegments;
module.exports.processSingle = processSingle;