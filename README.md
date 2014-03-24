# test-engine-live-tools

Small tools and scripts for the EBU test engine platform. These allow for DASH-ing and encoding a live stream.

# Description

This repository contains the following scripts/tools:

* `carousel/carousel.sh`: This script will launch the file reader script (`reader.js`) and pipe the contents to ffmpeg. ffmpeg will then create HLS segments with the specified options.
* `carousel/reader.js`: A small NodeJS script that will read an input file and continuously pipe it to STDOUT. Used by `carousel.sh` to read a MPEG-TS to process for DASHing. The MPEG-TS mux format is required because it allows for easy looping by simply sending the TS again.
* `dasher/dasher.rb`: Ruby script that will read HLS created by `carousel.sh` to package them as a DASH live stream. Note that the variants defined in this script (`VARIANTS` constant) should reflect the number of variants as created by ffmpeg.
* `dasher/runner.rb`: Wrapper CLI script for `dasher.rb`. Allows for specifying a different start segment index (default: 0).
* `launcher/launcher.js`: NodeJS script that manages launching `carousel.sh` and `dasher.rb`. In case any of the two crashes/exits, it will terminate the other, i.e.: when either script dies, this script dies as well. This is used in conjunction with an `upstart` service to start at boot, and restart the stream if anything goes wrong.

The various scripts use these environment variables to determine where input/output files should be read/written and which processes to launch:

* `DASH_NODE`: Location of NodeJS binary, e.g. `/usr/local/bin/node`
* `DASH_MP4BOX`: Location of MP4Box binary, e.g. `/usr/local/bin/MP4Box`
* `DASH_FFMPEG`: Location of ffmpeg binary, e.g. `/usr/local/bin/ffmpeg`
* `DASH_SCRIPTS_PREFIX`: Location of the `test-engine-live-tools` repository, e.g. `/home/dash/test-engine-live-tools`
* `DASH_SOURCE_INPUT_FILE`: Source input file for the encoder. Please note that this should be a valid MPEG-TS, otherwise it can't be looped correctly.
* `DASH_SEGMENT_INPUT_DIR`: Temporary location where HLS segments should be written by ffmpeg and read for DASHing, e.g. `/home/dash/tmp`
* `DASH_OUTPUT_DIR`: Final location where the DASHed segments should be written, along with the MPD. If you want to publish on the internet this location should be accessible by the web server, e.g. `/var/www/live`

# License

Available under the BSD 3-clause license.
