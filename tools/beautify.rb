Dir.glob("./src/**/*.js").each do |js|
    next if js =~ /^\.\/src\/front\/media\//
    s = system "js-beautify #{js} -r"
end
