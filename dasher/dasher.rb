require 'fileutils'

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
      index = @@last_seg + start.to_i + 1
      file = "#{SEGMENT_DIR}/#{VARIANTS.first}_#{index}.#{INPUT_EXTENSION}"
      if File.exists?(file)
        available_segment = file.gsub("#{SEGMENT_DIR}/", '').gsub("#{VARIANTS.first}_", '').gsub(".#{INPUT_EXTENSION}", '')
        # MPD the single segment if it matches
        mpd(available_segment,start)
      end
    end
  end
  
  def mpd(segment,start)
    # Check which variants are available
    available_variants = VARIANTS.select { |v| File.exists? "#{SEGMENT_DIR}/#{v}_#{segment}.#{INPUT_EXTENSION}" }
    # Is there also already a next segment? Than this one can be used as it is complete.
    next_variants = VARIANTS.select { |v| File.exists? "#{SEGMENT_DIR}/#{v}_#{segment.to_i + 1}.#{INPUT_EXTENSION}" }
    
    if available_variants.length == VARIANTS.length && next_variants.length == VARIANTS.length && segment.to_i >= start.to_i && segment.to_i > @@last_seg
      puts "\e[31mProcessing segment #{segment}\e[0m"
      # Create intermediate files
      available_variants.each { |v| create_intermediate_file(v,segment) }

      # DASH this segment for processing
      dash_intermediate_files available_variants, segment
      
      @@last_seg = segment.to_i
    else
      #puts "\e[31mSkipping segment #{segment} for now.\e[0m"
    end
  end
  
  def create_intermediate_file(variant, segment)
    command = "#{MP4BOX} -add \"#{SEGMENT_DIR}/#{variant}_#{segment}.#{INPUT_EXTENSION}\" \"#{OUTPUT_DIR}/#{variant}_#{segment}.mp4\"" # 
    puts "Executing: #{command}"
    system command
  end
  
  def dash_intermediate_files(available_variants, segment)
    input_files          = available_variants.map { |v| "#{SEGMENT_DIR}/#{v}_#{segment}.#{INPUT_EXTENSION}" }
    raw_files            = available_variants.map { |v| "#{OUTPUT_DIR}/#{v}_#{segment}.mp4" }
    representation_files = available_variants.each_with_index.map { |v, i| "#{OUTPUT_DIR}/#{raw_files[i]}:id=#{v}" }
    command = "#{MP4BOX} -dash-ctx #{OUTPUT_DIR}/dash-live.txt -dash 10000 -url-template -time-shift 1800 -segment-name 'live_$RepresentationID$_' -out #{OUTPUT_DIR}/live -dynamic #{representation_files.join(' ')}"
    puts "Executing DASH: #{command}"
    system command
    FileUtils.rm input_files
    FileUtils.rm raw_files
  end
end
