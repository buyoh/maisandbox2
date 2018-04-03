
const fs = require('fs');


// --------------------------------

const tempDir = "./temp";


const cygwinEnvPath = "C:/cygwin64/bin;C:/cygwin64/usr/local/bin;";
exports.cygwinEnvPath = cygwinEnvPath;


// --------------------------------


exports.setupTemp = function(name){
    fs.mkdir(tempDir, function(err){});
    fs.mkdir(tempDir+"/"+name, function(err){});
}


exports.tempDir = function(name){
    return tempDir+"/"+name;
}


exports.cleanTemp = function(name){
    // nop
}


// --------------------------------

/**
 * 
 * @param {string} filename 
 */
exports.isExistFile = function(filename){
    try {
        fs.statSync(file);
    } catch(err) {
        if (err.code === 'ENOENT') return false;
    }
    return true;
}