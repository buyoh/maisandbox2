const fs = require('fs');

function check(path) {
    return new Promise((resolve) => {
        fs.stat(path, (err, stat) =>
            resolve(!err && stat.isFile(), !err && stat.isDirectory(), err)
        );
    });
}

function unlink(path) {
    return new Promise((resolve, reject) =>
        fs.unlink(path, err => err ? reject(err) : resolve()));
}

function rmdir(path) {
    return new Promise((resolve, reject) =>
        fs.rmdir(path, err => err ? reject(err) : resolve()));
}

function listdir(path) {
    return new Promise((resolve, reject) =>
        fs.readdir(path, (dir, err) => err ? reject(err) : resolve(dir)));
}

function readFile(path) {
    return new Promise((resolve, reject) =>
        fs.readFile(path, { encoding: 'utf-8' }, (err, data) => err ? reject(err) : resolve(data)));
}

exports.check = check;
exports.unlink = unlink;
exports.rmdir = rmdir;
exports.listdir = listdir;
exports.readFile = readFile;
