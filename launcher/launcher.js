var child_process = require('child_process');

var job_carousel = child_process.spawn('/home/bram/src/ebu-tools/carousel/carousel.sh')
var job_dasher   = child_process.spawn('/home/bram/src/ebu-tools/dasher/runner.rb')

job_carousel.stdout.setEncoding('utf8');
job_carousel.stdout.on('data', function(data) {
  console.log(data.toString());
})
job_carousel.stderr.setEncoding('utf8');
job_carousel.stderr.on('data', function(data) {
  console.log(data.toString());
})
job_carousel.on('close', function(code, signal) {
  console.log("Carousel job exited with code " + code + " and signal " + signal + ". Aborting.");
  job_dasher.kill(); // Send SIGTERM to other job
})

job_dasher.stdout.setEncoding('utf8');
job_dasher.stdout.on('data', function(data) {
  console.log(data.toString());
})
job_dasher.stderr.setEncoding('utf8');
job_dasher.stderr.on('data', function(data) {
  console.log(data.toString());
})
job_dasher.on('close', function(code, signal) {
  console.log("Dasher job exited with code " + code + " and signal " + signal + ". Aborting.");
  job_carousel.kill(); // Send SIGTERM to other job
})