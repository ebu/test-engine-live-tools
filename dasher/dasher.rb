class Dasher
  VARIANTS = ['out_hi', 'out_med', 'out_medlo', 'out_lo']
  INPUT_EXTENSION = "ts"
  SEGMENT_DIR = '/var/www/dash/output'
  OUTPUT_DIR = "#{SEGMENT_DIR}/segments"
  MP4BOX = '/usr/local/bin/MP4Box'
  
  @last_seg = -1
  
  class << self
    def run(start=0)
      new.run(start)
    end
  end
  
  def run(start)
    Dir.chdir(SEGMENT_DIR)
    available_segments = `ls -1tr #{VARIANTS.first}*.#{INPUT_EXTENSION}`.split.map { |s| s.gsub("#{VARIANTS.first}_", '').gsub(".#{INPUT_EXTENSION}", '') }
    available_segments[0..-2].each { |s| mpd(s,start) } if available_segments.any?
  end
  
  def mpd(segment,start)
    puts "Processing segment #{segment}"
    Dir.chdir(SEGMENT_DIR)
    available_variants = VARIANTS.select { |v| File.exists? "#{v}_#{segment}.#{INPUT_EXTENSION}" }
    if available_variants.length == VARIANTS.length && segment.to_i >= start.to_i
      available_variants.each do |v|
        Dir.chdir(SEGMENT_DIR)
        command = "#{MP4BOX} -add \"#{v}_#{segment}.#{INPUT_EXTENSION}\" \"#{OUTPUT_DIR}/#{v}_#{segment}.mp4\"" # 
        puts "Executing: #{command}"
        `#{command}`
      end
      files = available_variants.map { |v| "#{OUTPUT_DIR}/#{v}_#{segment}.mp4" }
      #files = ["#{OUTPUT_DIR}/#{segment}.mp4"]
      if File.exists?(files.first)
        Dir.chdir("#{OUTPUT_DIR}/final")
        command = "#{MP4BOX} -dash-ctx dash-live.txt -dash 10000 -time-shift -1 -segment-name live -out live -url-template -dynamic #{files.join(' ')}"
        puts "Executing DASH: #{command}"
        `#{command}`
        exit
      end
    end
  end
end
