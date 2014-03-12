class Dasher
  VARIANTS = ['out_hi', 'out_med', 'out_medlo', 'out_audio']
  INPUT_EXTENSION = "ts"

  # These settings can be overridden by using ENV variables
  SEGMENT_DIR = ENV["DASH_SEGMENT_INPUT_DIR"] || '/tmp/dash_segment_input_dir'
  OUTPUT_DIR  = ENV["DASH_OUTPUT_DIR"] || '/tmp/dash_output_dir'
  MP4BOX      = ENV["DASH_MP4BOX"] || 'MP4Box'
  
  @@last_seg = -1
  
  class << self
    def run(start=0)
      new.run(start)
    end
  end
  
  def run(start)
    `rm #{OUTPUT_DIR}/*`
    while true do
      Dir.chdir(SEGMENT_DIR)
      index = @@last_seg + start.to_i + 1
      available_segments = `ls -1 #{VARIANTS.first}_#{index}.#{INPUT_EXTENSION}`.split.map { |s| s.gsub("#{VARIANTS.first}_", '').gsub(".#{INPUT_EXTENSION}", '') }
      # MPD the single segment if it matches
      mpd(available_segments.first,start) if available_segments.any?
      # sleep 1
    end
  end
  
  def mpd(segment,start)
    Dir.chdir(SEGMENT_DIR)
    # Check which variants are available
    available_variants = VARIANTS.select { |v| File.exists? "#{v}_#{segment}.#{INPUT_EXTENSION}" }
    # Is there also already a next segment? Than this one can be used as it is complete.
    allowed_file = File.exists? "#{VARIANTS.first}_#{segment.to_i + 1}.#{INPUT_EXTENSION}"
    if available_variants.length == VARIANTS.length && allowed_file && segment.to_i >= start.to_i && segment.to_i > @@last_seg
      puts "\e[31mProcessing segment #{segment}\e[0m"
      # Create intermediate files
      available_variants.each { |v| create_intermediate_file(v,segment) }

      # DASH this segment for processing
      dash_intermediate_files available_variants, segment
      
      @@last_seg = segment.to_i
    else
      #puts "\e[31mSkipping segment #{segment}\e[0m"
    end
  end
  
  def create_intermediate_file(variant, segment)
    Dir.chdir(SEGMENT_DIR)
    command = "#{MP4BOX} -add \"#{variant}_#{segment}.#{INPUT_EXTENSION}\" \"#{OUTPUT_DIR}/#{variant}_#{segment}.mp4\"" # 
    puts "Executing: #{command}"
    `#{command}`
  end
  
  def dash_intermediate_files(available_variants, segment)
    input_files          = available_variants.map { |v| "#{SEGMENT_DIR}/#{v}_#{segment}.#{INPUT_EXTENSION}" }
    raw_files            = available_variants.map { |v| "#{OUTPUT_DIR}/#{v}_#{segment}.mp4" }
    representation_files = available_variants.each_with_index.map { |v, i| "#{raw_files[i]}:id=#{v}" }
    Dir.chdir(OUTPUT_DIR)
    command = "#{MP4BOX} -dash-ctx ./dash-live.txt -dash 10000 -url-template -time-shift 1800 -segment-name 'live_$RepresentationID$_' -out live -dynamic #{representation_files.join(' ')}"
    puts "Executing DASH: #{command}"
    `#{command}`
    `rm #{input_files.join(' ')}`
    `rm #{raw_files.join(' ')}`
  end
end
