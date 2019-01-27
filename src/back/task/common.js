
const fs = require('fs');


// --------------------------------

const tempDir = "./temp";


const cygwinEnvPath = "C:/cygwin64/bin;C:/cygwin64/usr/local/bin;";
exports.cygwinEnvPath = cygwinEnvPath;


// --------------------------------


exports.setupTemp = function(name, callback){
    try{ // TODO: nosync
        fs.mkdirSync(tempDir);
    }catch(e){}
    let d = tempDir;
    for (let f of ){
        d += "/" + f;
        try{ // TODO: nosync
            fs.mkdirSync(d);
        }catch(e){}
    }
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


exports.chdir = function(directory, proc){
    const lastCwd = process.cwd();
    process.chdir(directory);
    try{
        proc();
    }catch (e){
        throw e;
    }finally{
        process.chdir(lastCwd);
    }
}