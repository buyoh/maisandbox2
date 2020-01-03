const fs = require('fs');

function isDirectoryImpl(path, callback) {
    fs.stat(path, (err, stat) => {
        callback(err, stat.isDirectory());
    });
}

function removeImpl(path, isDir, callback) {
    if (isDir) fs.rmdir(path, callback);
    else fs.unlink(path, callback);
}

function readdirImpl(path, callback) {
    fs.readdir(path, callback);
}

let isDirectory = isDirectoryImpl;
let remove = removeImpl;
let readdir = readdirImpl;

/**
 * ファイルまたはフォルダを(再帰的に)削除
 * @param {string} path 
 * @param {(err: NodeJS.ErrnoException)=>void} callback 
 */
function removeRecursive(path, callback) {
    isDirectory(path, (err, isDir) => {
        if (err) {
            callback(err);
            return;
        }
        if (!isDir) {
            remove(path, false, callback);
            return;
        }
        readdir(path, (err, files) => {
            if (err) {
                callback(err);
                return;
            }
            let remain = files.length;
            if (remain == 0) {
                remove(path, true, callback);
                return;
            }
            for (let file of files) {
                removeRecursive(path + '/' + file, (err) => {
                    if (err) {
                        if (remain >= 0)
                            callback(err), // 2つ以上のエラーを送信しない
                            remain = -1;
                        return;
                    }
                    if (--remain == 0)
                        fs.rmdir(path, callback);
                });
            }
        });
    });
}


exports.removeRecursive = removeRecursive;