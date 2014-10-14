var fs = require('fs'),
    config = require('./config'),
    packager = require('./packager');

var availableSegments = [];
var packagedSegments = [];
var completedSegments = [];

function watchSegmentDir() {
  var watcher = fs.watch(config.segmentDir);

  watcher.on('change', function(event, filename) {
    updateSegments(filename);
  })

  watcher.on('error', function(err) {
    console.log("Got error " + err);
  })  
}

function updateSegments(filename) {
  // If the filename is a .ts file and not already processed
  if (/\.ts$/.test(filename) &&
      availableSegments.indexOf(filename) == -1 &&
      packagedSegments.indexOf(filename) == -1 &&
      completedSegments.indexOf(filename) == -1) {
    availableSegments.push(filename);
    console.log("Available segments for DASHing: " + availableSegments);
  }

  // process a new single segment as soon as it's available
  if (availableSegments.length > config.representationCount) {
    // Get current representation
    var representationKey = config.getRepresentationKeyForFile(filename);

    // Get current index
    var newIndex = parseInt(filename.split('.')[0].split('_').pop(), 10);
    
    var oldKey = representationKey + "_" + (newIndex - 1) + ".ts";
    var index = availableSegments.indexOf(oldKey);
    
    if (index > -1) {
      var segment = availableSegments.splice(index, 1)[0];
      packager.processSingle(segment, function(err, result) {
        // See if we need to process the MPD
        if (result) {
          packagedSegments.push(result);
          updateMPD();
        }
      });
    }
  }
}

function updateMPD() {
  if (packagedSegments.length % config.representationCount == 0 && packagedSegments.length > 0) {
    var segmentsToBeProcessed = packagedSegments.splice(0, config.representationCount);
    // only keep 100 segments in memory to prevent unbounded growth
    completedSegments = segmentsToBeProcessed.concat(completedSegments).slice(0,100);
    console.log("Processing segments: " + segmentsToBeProcessed);
    packager.packageSegments(segmentsToBeProcessed);
  }
}

module.exports.watchSegmentDir = watchSegmentDir;