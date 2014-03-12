var child_process = require('child_process');

job_carousel = child_process.spawn('/users/bram/src/ebu-tools/carousel/carousel.sh')
job_dasher = child_process.spawn('/users/bram/src/ebu-tools/dasher/dasher.rb')

job_carousel.on('close', function(code, signal) {
  console.log("Carousel job exited with code " + code + " and signal " + signal + ". Aborting.");
  job_dasher.kill(); // Send SIGTERM to other job
})

job_dasher.on('close', function(code, signal) {
  console.log("Dasher job exited with code " + code + " and signal " + signal + ". Aborting.");
  job_carousel.kill(); // Send SIGTERM to other job
})