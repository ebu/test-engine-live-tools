var fs = require('fs'),
    config = require('./config'),
    packager = require('./packager');

var availableSegments = [];
var processedSegments = [];
var representationCount = config.getRepresentationKeys().length;

function watchSegmentDir() {
  var watcher = fs.watch(config.segment_dir);

  watcher.on('change', function(event, filename) {
    updateSegments(filename);
  })

  watcher.on('error', function(err) {
    console.log("Got error " + err);
  })  
}

function updateSegments(filename) {
  if (/\.ts$/.test(filename) && availableSegments.indexOf(filename) == -1 && processedSegments.indexOf(filename) == -1) {
    availableSegments.push(filename);
    console.log("Available segments for DASHing: " + availableSegments);
    if (availableSegments.length % representationCount == 0 && availableSegments.length > representationCount) {
      segmentsToBeProcessed = availableSegments.splice(0, representationCount);
      packager.packageSegments(segmentsToBeProcessed);
      processedSegments.concat(segmentsToBeProcessed);
      console.log("Processing segments: " + segmentsToBeProcessed);
    }
  }
}

module.exports.watchSegmentDir = watchSegmentDir;