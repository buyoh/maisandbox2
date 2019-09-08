# 概要
#  アーキテクチャ図をplantuml形式で出力します
#  requireの依存関係だけであり、モジュール合成等は考慮されていないです。
# 使い方
#  ruby tools/gen_uml.rb
# 

def path_normalize(path)
  path = path[2..-1] if path[0..1] == './'
  np = './'
  stk = []
  path.split('/').each do |d|
    next if d == '.'
    if d == '..'
      if stk.empty?
        np << '../'
      else
        stk.pop
      end
    else
      stk << d
    end
  end
  np + stk*'/'
end

def path_combine(dir, path)
  path = path[2..-1] if path[0..1] == './'
  dir = dir + '/' if dir[-1] != '/'
  path_normalize(dir+path)
end

def force_ext(path)
  path.gsub(/\.mjs$/, '.js')
end

def symbolize(path)
  path.gsub(/\W/, '__')
end

# unit test
# def dcheck(l, r)
#   abort "#{l} != #{r}" unless l == r
# end
# dcheck path_normalize('foobar.js') , './foobar.js'
# dcheck path_normalize('./a/./b/../c.o') , './a/c.o'
# dcheck path_normalize('../../foo/bar.js') , './../../foo/bar.js'
# dcheck path_normalize('./../../foo/../bar.js') , './../../bar.js'

paths = Dir.glob('./src/**/*js').select do |path|
  path['front/media'].nil? && !(path=~/back\/task\/(\w+)\.m?js$/ && $1 != 'cpp' && $1 != 'ruby')
end.map(&method(:path_normalize)).map(&method(:force_ext))

paths = paths.select{|path| path=~Regexp.compile(ARGV[0]) } if ARGV[0]

requires = {}

paths.each do |path|
  requires[path] = []
  open(path, 'r') do |io|
    while line = io.gets
      line.partition('//')[0].scan(/require\(\'([a-zA-Z_\/\.]+)\'\)/).each do |cap|
        path_req_relative = cap[0]
        next if path_req_relative[0] != '.'
        path_req = path_combine(File.dirname(path), path_req_relative)
        path_req << '.js' if File.extname(path_req) == ''
        path_req = force_ext(path_req)
        requires[path] << path_req if paths.include? path_req
      end
    end
    io.close
  end
end

puts '@startuml'

paths.each do |com|
  puts "rectangle \"#{com}\" as #{symbolize(com)}"
end

requires.each do |com, reqs|
  reqs.each do |req|
    puts "#{symbolize(com)} -up-> #{symbolize(req)}"
  end
end

puts '@enduml'