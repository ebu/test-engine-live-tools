class Dasher
  VARIANTS = ['out_med', 'out_medlo', 'out_lo', 'out_audio']
  INPUT_EXTENSION = "ts"
  SEGMENT_DIR = '/Users/tieleman/Documents/Code/EBU/video/output'
  OUTPUT_DIR = "#{SEGMENT_DIR}/segments"
  MP4BOX = 'MP4Box'
  
  @@last_seg = -1
  
  class << self
    def run(start=0)
      new.run(start)
    end
  end
  
  def run(start)
    while true do
      Dir.chdir(SEGMENT_DIR)
      index = @@last_seg + start.to_i + 1
      available_segments = `ls -1 #{VARIANTS.first}_#{index}.#{INPUT_EXTENSION}`.split.map { |s| s.gsub("#{VARIANTS.first}_", '').gsub(".#{INPUT_EXTENSION}", '') }
      mpd(available_segments.first,start) if available_segments.any?
      sleep 2
    end
  end
  
  def mpd(segment,start)
    Dir.chdir(SEGMENT_DIR)
    available_variants = VARIANTS.select { |v| File.exists? "#{v}_#{segment}.#{INPUT_EXTENSION}" }
    allowed_file = File.exists? "#{VARIANTS.first}_#{segment.to_i + 1}.#{INPUT_EXTENSION}"
    if available_variants.length == VARIANTS.length && allowed_file && segment.to_i >= start.to_i && segment.to_i > @@last_seg
      puts "\e[31mProcessing segment #{segment}\e[0m"
      available_variants.each do |v|
        Dir.chdir(SEGMENT_DIR)
        command = "#{MP4BOX} -add \"#{v}_#{segment}.#{INPUT_EXTENSION}\" \"#{OUTPUT_DIR}/#{v}_#{segment}.mp4\"" # 
        puts "Executing: #{command}"
        `#{command}`
      end
      input_files = available_variants.map { |v| "#{SEGMENT_DIR}/#{v}_#{segment}.#{INPUT_EXTENSION}" }
      raw_files = available_variants.map { |v| "#{OUTPUT_DIR}/#{v}_#{segment}.mp4" }
      representation_files = available_variants.each_with_index.map { |v, i| "#{raw_files[i]}:id=#{v}" }
      #files = ["#{OUTPUT_DIR}/#{segment}.mp4"]
      #if File.exists?(files.first)
        Dir.chdir("#{OUTPUT_DIR}/final")
        command = "#{MP4BOX} -dash-ctx dash-live.txt -dash 10000 -url-template -time-shift -1 -segment-name 'live_$RepresentationID$_' -out live -dynamic #{representation_files.join(' ')}"
        puts "Executing DASH: #{command}"
        `#{command}`
        `mv #{input_files.join(' ')} #{OUTPUT_DIR}/archived`
        `mv #{raw_files.join(' ')} #{OUTPUT_DIR}/archived`
        @@last_seg = segment.to_i
        #`read -n 1 -s`
        #`sleep 10`
        #exit
        #end
    else
      puts "\e[31mSkipping segment #{segment}\e[0m"
    end
  end
end
