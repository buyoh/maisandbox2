
const fs = require('fs');


// --------------------------------

const tempDir = "./temp";
exports.tempDir = tempDir;

const cygwinEnvPath = "C:/cygwin64/bin;C:/cygwin64/usr/local/bin;";
exports.cygwinEnvPath = cygwinEnvPath;


// --------------------------------


exports.setupTemp = function(){
    fs.mkdir(tempDir, function(err){});
}

exports.cleanTemp = function (){
    // nop
}