const fs = require('fs');


// --------------------------------

const defaultTempDir = './temp';


const cygwinEnvPath = 'C:/cygwin64/bin;C:/cygwin64/usr/local/bin;';
exports.cygwinEnvPath = cygwinEnvPath;


// --------------------------------


/**
 * directoryNameに一時ファイル用のフォルダを作る
 * @param {String} directoryName 
 * @param {()=>void} callback 
 */
exports.setupTemp = function(directoryName, callback) {
    let dirs = directoryName.split('/');
    let dir = defaultTempDir;

    function rec() {
        if (dirs.length == 0) {
            callback();
        } else {
            dir += '/' + dirs.shift();
            fs.mkdir(dir, rec);
        }
    }
    fs.mkdir(dir, rec);
};


/**
 * 複数のファイルを書き込む
 * @param {String} prefixPath
 * @param {Array<{path, data}>} files 
 * @param {(ok:Number)=>{}} callback ok:成功した個数
 */
exports.writeFiles = function(prefixPath, files, callback) {
    let ok = 0,
        rem = files.length;
    for (let file of files) {
        fs.writeFile(prefixPath + file.path, file.data, (err) => {
            --rem;
            if (!err) ++ok;
            if (rem == 0) callback(ok);
        });
    }
};


/**
 * 複数のファイルを読み出す
 * @param {String} prefixPath
 * @param {Array<{path}>} files 
 * @param {(out:Array<{path, data}>)=>void} callback
 */
exports.readFiles = function(prefixPath, files, callback) {
    let ok = [],
        rem = files.length;
    for (let file of files) {
        fs.readFile(prefixPath + file.path, 'UTF-8', (err, buff) => {
            --rem;
            if (!err) ok.push({
                path: file.path,
                data: buff
            });
            if (rem == 0) callback(ok);
        });
    }
};


/**
 * 一時ファイル用のディレクトリを返す
 * @param {String} name 
 */
exports.getTempDirName = function(name) {
    return defaultTempDir + '/' + name;
};


exports.cleanTemp = function() {
    // nop
};


// --------------------------------

/**
 * ファイルが存在するかどうか調べる(Sync)()
 * @param {string} filename 
 */
exports.isExistFile = function(filename) {
    try {
        fs.statSync(filename);
    } catch (err) {
        if (err.code === 'ENOENT') return false;
    }
    return true;
};


exports.chdir = function(directory, proc) {
    const lastCwd = process.cwd();
    process.chdir(directory);
    try {
        proc();
        process.chdir(lastCwd);
    } catch (e) {
        process.chdir(lastCwd);
        throw e;
    }
};