class DasherOnDemand
  VARIANTS = ['out_hi', 'out_med', 'out_medlo', 'out_lo']
  INPUT_EXTENSION = "ts"
  SEGMENT_DIR = '/Users/tieleman/Documents/Code/EBU/video/output'
  OUTPUT_DIR = "#{SEGMENT_DIR}/segments"
  MP4BOX = 'MP4Box'
  
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
    dash_all
  end
  
  def mpd(segment,start)
    puts "Processing segment #{segment}"
    Dir.chdir(SEGMENT_DIR)
    available_variants = VARIANTS.select { |v| File.exists? "#{v}_#{segment}.#{INPUT_EXTENSION}" }
    if available_variants.length == VARIANTS.length && segment.to_i >= start.to_i
      available_variants.each do |v|
        Dir.chdir(SEGMENT_DIR)
        command = "#{MP4BOX} -cat \"#{v}_#{segment}.#{INPUT_EXTENSION}\" \"#{OUTPUT_DIR}/#{v}.mp4\"" # 
        puts "Executing: #{command}"
        `#{command}`
        @last_seg = segment.to_i
      end
    end
  end
  
  def dash_all
    files = []
    VARIANTS.each do |v|
      #(0..@last_seg).each do |s|
        files << "#{OUTPUT_DIR}/#{v}.mp4:id=#{v}"
        #files = ["#{OUTPUT_DIR}/#{segment}.mp4"]
        #end
    end
    
    files.flatten!
    puts files.inspect
    
    #exit
    
    Dir.chdir("#{OUTPUT_DIR}/final")
    command = "#{MP4BOX} -dash 10000 -rap -frag-rap -url-template -segment-name 'ondemand_$RepresentationID$_' -out #{OUTPUT_DIR}/final/ondemand #{files.join(' ')}"
    puts "Executing DASH: #{command}"
    `#{command}`
  end
end