class Dasher
  VARIANTS = ['out_hi', 'out_med', 'out_medlo', 'out_lo']
  INPUT_EXTENSION = "ts"
  SEGMENT_DIR = '/Users/tieleman/Downloads/tmp'
  OUTPUT_DIR = "#{SEGMENT_DIR}/mpd"
  MP4BOX = '/Applications/Osmo4.app/Contents/MacOS/MP4Box'
  
  @last_seg = -1
  
  class << self
    def run
      new.run
    end
  end
  
  def run
    Dir.chdir(SEGMENT_DIR)
    available_segments = `ls -1tr #{VARIANTS.first}*.#{INPUT_EXTENSION}`.split.map { |s| s.gsub("#{VARIANTS.first}_", '').gsub(".#{INPUT_EXTENSION}", '') }
    available_segments[0..-2].each { |s| mpd s } if available_segments.any?
  end
  
  def mpd(segment)
    puts "Processing segment #{segment}"
    Dir.chdir(SEGMENT_DIR)
    available_variants = VARIANTS.select { |v| File.exists? "#{v}_#{segment}.#{INPUT_EXTENSION}" }
    if available_variants.length == VARIANTS.length
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
      end
    end
  end
end